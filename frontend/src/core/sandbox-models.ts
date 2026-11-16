export const PARAM_TYPES = ['string', 'number', 'boolean'] as const;
export type ParamType = (typeof PARAM_TYPES)[number];

export const LIMITS = Object.freeze({ name: 64, description: 1000, parameters: 8 });

export interface ToolParameter {
    name: string;
    type: ParamType;
    description: string;
    required: boolean;
}

export interface ToolDraft {
    name: string;
    description: string;
    parameters: ToolParameter[];
}

export interface Issue {
    rule: string;
    level: 'error' | 'warning';
    field: string;
    message: string;
}

export type RuleId =
    | 'name-empty'
    | 'name-format'
    | 'name-reserved'
    | 'parameter-name-empty'
    | 'parameter-name-duplicate'
    | 'parameter-name-reserved'
    | 'name-model-format'
    | 'not-english'
    | 'name-vague'
    | 'description-empty'
    | 'description-repeats-name'
    | 'description-short'
    | 'parameter-description-empty'
    | 'parameter-unknown'
    | 'city-missing'
    | 'city-optional'
    | 'city-type'
    | 'country-missing'
    | 'country-type'
    | 'country-format';
export type RuleTexts = Record<RuleId, (name: string) => string>;

export interface Finding {
    rule: RuleId;
    level: Issue['level'];
    field: string;
    name?: string;
}

type HandlerParamName = 'city' | 'country';
export type HandlerTexts = Record<HandlerParamName, string>;

export interface HandlerParam {
    name: HandlerParamName;
    type: ParamType;
    required: boolean;
}

interface ThoughtFields {
    asks: 'city';
    fits: 'tool' | 'description';
    'fits-by-parameters': 'tool' | 'description';
    'only-tool': 'tool' | 'description';
    'city-into': 'parameter';
    'city-guess': 'parameter';
    'city-nowhere': never;
    'country-named': never;
    'several-likely': 'city' | 'country';
    'country-required': 'parameter' | 'city' | 'country';
    'code-by-description': 'parameter' | 'code';
    'code-by-name': 'parameter' | 'code';
    'follows-example': 'parameter' | 'value';
    'no-code-hint': 'parameter' | 'value';
    'no-description': 'parameter' | 'value';
    'country-skipped': 'parameter';
    'country-without-parameter': 'country';
    'several-without-parameter': 'city';
    'required-city': 'parameter' | 'value';
    'required-country': 'parameter' | 'value';
    'required-other': 'parameter' | 'value';
    'required-unfillable': 'parameter';
    'answer-ready': never;
    'retry-city': 'parameter';
    'retry-code': 'parameter' | 'value' | 'code';
    'country-requested': 'parameter';
    'well-known-guess': 'country';
    'retry-with-code': 'code';
    'country-undeclared': 'parameter';
    'inline-country': 'holders' | 'value';
    'schema-rejected': never;
    'inline-failed': 'parameter';
    'inline-failed-undeclared': never;
    'undeclared-requested': 'parameter';
    'no-way': never;
}
export type ThoughtId = keyof ThoughtFields;
export type ThoughtParts = { [Id in ThoughtId]: { id: Id } & { [Field in ThoughtFields[Id]]: Field extends 'holders' ? string[] : string } };
export type ThoughtPart = ThoughtParts[ThoughtId];
export type ThoughtTexts = { [Id in ThoughtId]: (part: ThoughtParts[Id]) => string };

export interface LessonInfo {
    id: string;
    handler: HandlerParam[];
    questions: string[];
}

export interface Validation {
    issues: Finding[];
    tool: Record<string, unknown> | null;
}

export interface CallReport {
    request: { method: 'tools/call'; params: { name: string; arguments: Record<string, unknown> } };
    result?: { content: { type: string; text?: string }[]; isError?: boolean };
    error?: string;
}

export function callOutcome(report: CallReport) {
    if (report.error !== undefined) return 'protocolError';
    return report.result?.isError ? 'toolError' : 'ok';
}

export function callReply(report: CallReport) {
    return report.error ?? (report.result?.content ?? []).map(block => block.text ?? '').join('\n');
}

export type RunEvent =
    | { type: 'thought'; parts: ThoughtPart[] }
    | { type: 'tool-call'; name: string; arguments: Record<string, unknown> }
    | { type: 'tool-result'; text: string; isError: boolean }
    | { type: 'answer'; text: string; calls: number; solved: boolean };

export function emptyDraft(): ToolDraft {
    return { name: '', description: '', parameters: [] };
}

export function emptyParameter(): ToolParameter {
    return { name: '', type: 'string', description: '', required: true };
}

export function isBlank(draft: ToolDraft) {
    return draft.name.trim() === '' && draft.description.trim() === '' && draft.parameters.length === 0;
}
