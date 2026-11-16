import { CYRILLIC, type DraftRule, plain } from './draft-rule.ts';

interface ResourceDraft {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}

export const roughResource = (): ResourceDraft => ({ uri: 'calendar://item/1', name: 'data', description: '', mimeType: 'text/plain' });

interface Listed {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
}

type Row = Record<string, string>;

interface Stored {
    listed: Listed;
    text: string;
    rows: Row[];
    own: boolean;
}

export type Shown = { as: 'table'; rows: Row[] } | { as: 'text'; text: string } | { as: 'none' };

const JSON_TYPE = 'application/json';
const days = (startDate: string, endDate: string) => ({ startDate, endDate });
const stored = (listed: Listed, busy: Row[], own: boolean) => ({ listed, text: JSON.stringify({ busy }), rows: busy, own });

const JUNE = [days('2027-06-03', '2027-06-04'), days('2027-06-15', '2027-06-22'), days('2027-06-28', '2027-06-28')];

const NEIGHBOUR = stored(
    { uri: 'calendar://events/2027-05', name: 'may-2027-events', description: 'Busy days in May 2027, with start and end dates', mimeType: JSON_TYPE },
    [days('2027-05-10', '2027-05-12'), days('2027-05-24', '2027-05-24')],
    false
);

export const CONTENT = JSON.stringify({ busy: JUNE });

function describe({ uri, name, description, mimeType }: ResourceDraft): Listed {
    return {
        uri: uri.trim(),
        name: name.trim(),
        ...(description.trim() && { description: description.trim() }),
        ...(mimeType.trim() && { mimeType: mimeType.trim() })
    };
}

export function resources(draft: ResourceDraft | null) {
    return draft ? [NEIGHBOUR, stored(describe(draft), JUNE, true)] : [NEIGHBOUR];
}

const bare = (mimeType: string) => mimeType.split(';')[0].trim();
const JSON_LIKE = /^application\/(.+\+)?json$/i;
const TEXT_LIKE = /^text\//i;

export function show({ listed: { mimeType = '' }, text, rows }: Stored): Shown {
    const type = bare(mimeType);
    if (JSON_LIKE.test(type)) return { as: 'table', rows };
    return type === '' || TEXT_LIKE.test(type) ? { as: 'text', text } : { as: 'none' };
}

const URI = /^[a-z][a-z0-9+.-]*:\S+$/i;
const WEB = /^https?:/i;
const MIME = /^[a-z0-9][\w.+-]*\/[a-z0-9][\w.+-]*$/i;
const TOPIC = /\b(event|busy|calendar|availab|unavailab|schedule|free|book|occupied|taken|reserved|meeting|appointment)/i;
const PERIOD = /\b(june?|2027 0?6|0?6 2027)\b/i;

const when = (broken: boolean, field: keyof ResourceDraft) => (broken ? [{ field }] : []);
const valid = (uri: string) => URI.test(uri.trim());
const typed = (mimeType: string) => MIME.test(bare(mimeType));
const says = (text: string) => TOPIC.test(plain(text)) && PERIOD.test(plain(text));

type Goal = 'find' | 'address' | 'show';

export const RESOURCE_RULES = {
    'uri-empty': { level: 'error', find: ({ uri }) => when(uri.trim() === '', 'uri') },
    'uri-format': { level: 'error', find: ({ uri }) => when(uri.trim() !== '' && !valid(uri), 'uri') },
    'uri-taken': { level: 'error', find: ({ uri }) => when(uri.trim() === NEIGHBOUR.listed.uri, 'uri') },
    'name-empty': { level: 'error', find: ({ name }) => when(name.trim() === '', 'name') },

    'not-english': {
        level: 'warning',
        goal: 'find',
        find: draft => (['uri', 'name', 'description'] as const).flatMap(field => when(CYRILLIC.test(draft[field]), field))
    },
    'description-empty': { level: 'warning', goal: 'find', find: ({ description }) => when(description.trim() === '', 'description') },
    'row-vague': {
        level: 'warning',
        goal: 'find',
        find: ({ name, description }) => when(name.trim() !== '' && description.trim() !== '' && !says(`${name} ${description}`), 'description')
    },
    'uri-web': { level: 'warning', goal: 'address', find: ({ uri }) => when(valid(uri) && WEB.test(uri.trim()), 'uri') },
    'uri-vague': { level: 'warning', goal: 'address', find: ({ uri }) => when(valid(uri) && !WEB.test(uri.trim()) && !PERIOD.test(plain(uri)), 'uri') },
    'mime-empty': { level: 'warning', goal: 'show', find: ({ mimeType }) => when(mimeType.trim() === '', 'mimeType') },
    'mime-format': { level: 'warning', goal: 'show', find: ({ mimeType }) => when(mimeType.trim() !== '' && !typed(mimeType), 'mimeType') },
    'mime-mismatch': { level: 'warning', goal: 'show', find: ({ mimeType }) => when(typed(mimeType) && !JSON_LIKE.test(bare(mimeType)), 'mimeType') }
} satisfies Record<string, DraftRule<ResourceDraft, Goal>>;
