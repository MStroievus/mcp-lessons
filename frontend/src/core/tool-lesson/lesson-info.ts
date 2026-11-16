import type { LessonInfo } from '../sandbox-models.ts';
import { QUESTIONS } from './questions.ts';
import { HANDLER_PARAMETERS } from './weather-service.ts';

export const TOOL_LESSON: LessonInfo = { id: '01-tools', handler: HANDLER_PARAMETERS, questions: QUESTIONS.map(question => question.text) };
