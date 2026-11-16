import type { HandlerParam } from '../sandbox-models.ts';
import { QUESTIONS } from './questions.ts';

export const HANDLER_PARAMETERS: HandlerParam[] = [
    { name: 'city', type: 'string', required: true },
    { name: 'country', type: 'string', required: false }
];

export const TOOL_LESSON = { id: '01-tools', handler: HANDLER_PARAMETERS, questions: QUESTIONS.map(question => question.text) };
