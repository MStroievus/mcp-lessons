import type { CallReport, ToolDraft, Validation } from '../sandbox-models.ts';
import { QUESTIONS } from './questions.ts';
import { RULES } from './rules.ts';
import { type Emit, ScriptedModel } from './scripted-model.ts';
import { ToolSession } from './tool-session.ts';
import { WeatherService } from './weather-service.ts';

export function createToolLesson() {
    return new ToolLesson(new WeatherService(), new ScriptedModel());
}

export class ToolLesson {
    readonly #weather;
    readonly #model;

    constructor(weather: WeatherService, model: ScriptedModel) {
        this.#weather = weather;
        this.#model = model;
    }

    async validate(draft: ToolDraft): Promise<Validation> {
        const issues = RULES.flatMap(rule => rule.check(draft));
        const registrable = !issues.some(issue => issue.level === 'error');
        return { issues, tool: registrable ? await this.#withSession(draft, session => session.describe()) : null };
    }

    call(draft: ToolDraft, args: Record<string, unknown>): Promise<CallReport> {
        return this.#withSession(draft, session => session.call(args));
    }

    async run(draft: ToolDraft, text: string, emit: Emit) {
        const question = QUESTIONS.find(candidate => candidate.text === text);
        if (!question) throw new Error(`Unknown question "${text}"`);

        const { text: answer, calls, weather } = await this.#withSession(draft, session => this.#model.run(session, question, emit));
        const { code } = question.named ?? question.wellKnown;
        const solved = weather !== undefined && weather.startsWith(`${question.city}, `) && weather.includes(`(${code})`);
        emit({ type: 'answer', text: answer, calls, solved });
    }

    async #withSession<Result>(draft: ToolDraft, use: (session: ToolSession) => Promise<Result>) {
        const session = await new ToolSession(draft, this.#weather).open();
        try {
            return await use(session);
        } finally {
            await session.close();
        }
    }
}
