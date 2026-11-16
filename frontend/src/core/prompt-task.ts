import { CYRILLIC, type DraftRule, plain } from './draft-rule.ts';

interface PromptArgument {
    name: 'destination' | 'date';
    description: string;
    required: boolean;
}

export interface PromptDraft {
    name: string;
    description: string;
    arguments: PromptArgument[];
}

export const roughPrompt = (): PromptDraft => ({
    name: 'prompt1',
    description: '',
    arguments: [
        { name: 'destination', description: 'City to visit', required: false },
        { name: 'date', description: '', required: true }
    ]
});

export const TEMPLATE = [
    'Plan a vacation to {destination}, leaving on {date}.',
    'Search for flights and hotels, check the weather for the travel dates, and propose one package.'
].join('\n');

const DATE = /^\d{4}-\d{2}-\d{2}$/;

type Args = Partial<Record<PromptArgument['name'], string>>;

function planVacation(args: Args) {
    if (args.date !== undefined && !DATE.test(args.date)) return { error: 'Invalid argument: date must be written as YYYY-MM-DD' };
    return { text: TEMPLATE.replace(/\{(\w+)\}/g, (_, key: PromptArgument['name']) => String(args[key])), hole: args.destination === undefined || args.date === undefined };
}

export function describe({ name, description, arguments: declared }: PromptDraft) {
    return {
        name: name.trim(),
        ...(description.trim() && { description: description.trim() }),
        arguments: declared.map(argument => ({
            name: argument.name,
            ...(argument.description.trim() && { description: argument.description.trim() }),
            required: argument.required
        }))
    };
}

export type Launch = { kind: 'blocked'; missing: string[] } | { kind: 'error' | 'hole' | 'complete'; reply: string };

export function launch(listed: ReturnType<typeof describe>, typed: Args): Launch {
    const filled: Args = {};
    for (const { name } of listed.arguments) {
        const value = (typed[name] ?? '').trim();
        if (value !== '') filled[name] = value;
    }
    const missing = listed.arguments.filter(({ name, required }) => required && !(name in filled)).map(({ name }) => name);
    if (missing.length > 0) return { kind: 'blocked', missing };

    const reply = planVacation(filled);
    if (reply.error !== undefined) return { kind: 'error', reply: reply.error };
    return { kind: reply.hole ? 'hole' : 'complete', reply: reply.text };
}

const each = (draft: PromptDraft, field: keyof PromptArgument, matches: (argument: PromptArgument) => boolean) =>
    draft.arguments.flatMap((argument, index) => (matches(argument) ? [{ field: `arguments.${index}.${field}`, about: argument.name }] : []));

const when = (broken: boolean, field: string) => (broken ? [{ field }] : []);

const SUBJECT = /\b(vacation|trip|travel|holiday|journey)/i;
const DATE_FORMAT = /yyyy.?mm.?dd|\d{4}-\d{2}-\d{2}|iso/i;
const SHORT_DESCRIPTION = 20;

type Goal = 'find' | 'fill' | 'text';

export const PROMPT_RULES = {
    'name-empty': { level: 'error', find: ({ name }) => when(name.trim() === '', 'name') },

    'not-english': {
        level: 'warning',
        goal: 'find',
        find: draft => [
            ...when(CYRILLIC.test(draft.name), 'name'),
            ...when(CYRILLIC.test(draft.description), 'description'),
            ...each(draft, 'description', argument => CYRILLIC.test(argument.description))
        ]
    },
    'name-spaces': { level: 'warning', goal: 'find', find: ({ name }) => when(/\s/.test(name.trim()), 'name') },
    'name-vague': { level: 'warning', goal: 'find', find: ({ name }) => when(name.trim() !== '' && !SUBJECT.test(plain(name)), 'name') },
    'description-empty': { level: 'warning', goal: 'find', find: ({ description }) => when(description.trim() === '', 'description') },
    'description-short': {
        level: 'warning',
        goal: 'find',
        find: ({ description }) => when(description.trim() !== '' && description.trim().length < SHORT_DESCRIPTION, 'description')
    },
    'argument-undescribed': { level: 'warning', goal: 'fill', find: draft => each(draft, 'description', argument => argument.description.trim() === '') },
    'date-format': {
        level: 'warning',
        goal: 'fill',
        find: draft => each(draft, 'description', ({ name, description }) => name === 'date' && description.trim() !== '' && !DATE_FORMAT.test(description))
    },
    'required-optional': { level: 'warning', goal: 'text', find: draft => each(draft, 'required', argument => !argument.required) }
} satisfies Record<string, DraftRule<PromptDraft, Goal>>;
