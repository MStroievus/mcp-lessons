import type { ToolDraft, ToolParameter as Parameter } from '../sandbox-models.ts';
import { showsCountryCode } from './country-format.ts';
import { Rule } from './rule.ts';
import { HANDLER_PARAMETERS } from './lesson-info.ts';

const TOOL_NAME = /^[A-Za-z0-9._-]+$/;

const FILLER_WORDS = new Set(['tool', 'data', 'info', 'api', 'my', 'new', 'test', 'func', 'function', 'handler', 'thing', 'stuff']);
const BARE_VERBS = new Set(['get', 'do', 'run', 'call', 'fetch', 'make', 'process', 'handle']);

const CYRILLIC = /\p{Script=Cyrillic}/u;

const words = (value: string) =>
    value
        .split(/[^\p{L}]+|(?<=\p{Ll})(?=\p{Lu})|(?<=\p{Lu})(?=\p{Lu}\p{Ll})/u)
        .filter(Boolean)
        .map(word => word.toLowerCase());

const when = (found: boolean, field: string, name?: string) => (found ? [{ field, name }] : []);

const eachParameter = (draft: ToolDraft, field: keyof Parameter, matches: (parameter: Parameter, index: number) => boolean) =>
    draft.parameters.flatMap((parameter, index) => when(matches(parameter, index), `parameters.${index}.${field}`, parameter.name));

const missing = (draft: ToolDraft, name: string) => !draft.parameters.some(parameter => parameter.name === name);

const repeatsName = (draft: ToolDraft) => {
    const name = words(draft.name).join(' ');
    return name !== '' && words(draft.description).join(' ') === name;
};

const reserved = (name: string) => name in {};

export const RULES = [
    new Rule('name-empty', 'error', draft => when(draft.name === '', 'name')),

    new Rule('name-format', 'error', draft => when(draft.name !== '' && !TOOL_NAME.test(draft.name), 'name')),

    new Rule('name-reserved', 'error', draft => when(reserved(draft.name), 'name', draft.name)),

    new Rule('parameter-name-empty', 'error', draft => eachParameter(draft, 'name', parameter => parameter.name.trim() === '')),

    new Rule('parameter-name-duplicate', 'error', draft =>
        eachParameter(
            draft,
            'name',
            (parameter, index) => parameter.name.trim() !== '' && draft.parameters.findIndex(other => other.name === parameter.name) < index
        )
    ),

    new Rule('parameter-name-reserved', 'error', draft => eachParameter(draft, 'name', parameter => reserved(parameter.name))),

    new Rule('name-model-format', 'warning', draft => when(TOOL_NAME.test(draft.name) && draft.name.includes('.'), 'name')),

    new Rule('not-english', 'warning', draft => [
        ...when(CYRILLIC.test(draft.name), 'name'),
        ...when(CYRILLIC.test(draft.description), 'description'),
        ...eachParameter(draft, 'name', parameter => CYRILLIC.test(parameter.name)),
        ...eachParameter(draft, 'description', parameter => CYRILLIC.test(parameter.description))
    ]),

    new Rule('name-vague', 'warning', draft => {
        if (!TOOL_NAME.test(draft.name)) return [];
        const meaningful = words(draft.name).filter(word => word.length > 1 && !FILLER_WORDS.has(word));
        return when(meaningful.length < 2 || meaningful.every(word => BARE_VERBS.has(word)), 'name');
    }),

    new Rule('description-empty', 'warning', draft => when(draft.description.trim() === '', 'description')),

    new Rule('description-repeats-name', 'warning', draft => when(repeatsName(draft), 'description')),

    new Rule('description-short', 'warning', draft =>
        when(draft.description.trim() !== '' && !repeatsName(draft) && draft.description.trim().length < 20, 'description')
    ),

    new Rule('parameter-description-empty', 'warning', draft =>
        eachParameter(draft, 'description', parameter => parameter.name.trim() !== '' && parameter.description.trim() === '')
    ),

    new Rule('parameter-unknown', 'warning', draft =>
        eachParameter(draft, 'name', parameter => parameter.name.trim() !== '' && !HANDLER_PARAMETERS.some(known => known.name === parameter.name))
    ),

    new Rule('city-missing', 'warning', draft => when(missing(draft, 'city'), 'parameters')),

    new Rule('city-optional', 'warning', draft => eachParameter(draft, 'required', parameter => parameter.name === 'city' && !parameter.required)),

    new Rule('city-type', 'warning', draft => eachParameter(draft, 'type', parameter => parameter.name === 'city' && parameter.type !== 'string')),

    new Rule('country-missing', 'warning', draft => when(missing(draft, 'country'), 'parameters')),

    new Rule('country-type', 'warning', draft =>
        eachParameter(draft, 'type', parameter => parameter.name === 'country' && parameter.type !== 'string')
    ),

    new Rule('country-format', 'warning', draft =>
        eachParameter(
            draft,
            'description',
            parameter => parameter.name === 'country' && parameter.description.trim() !== '' && !showsCountryCode(parameter.description)
        )
    )
];
