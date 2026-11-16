import { shallowReactive, shallowReadonly } from 'vue';

import { type CallReport, emptyDraft, isBlank, type Issue, type RunEvent, type ToolDraft, type Validation } from '../core/sandbox-models.ts';
import type { ToolLesson } from '../core/tool-lesson/tool-lesson.ts';
import { Review } from './review.ts';
import type { SandboxWords } from './sandbox-words.ts';

export type RunStep = Exclude<RunEvent, { type: 'thought' }> | { type: 'thought'; text: string };

interface RunResult {
    calls: number;
    solved: boolean;
}

type Check = { status: 'idle' | 'checking' | 'ready' | 'failed'; issues: Issue[]; tool: Validation['tool'] };

type Call = { status: 'idle' | 'running' | 'failed' } | { status: 'done'; report: CallReport };

type Run = { question: string; steps: RunStep[]; status: 'idle' | 'running' | 'done' | 'stopped' | 'failed' };

const CHECK_DELAY_MS = 350;

interface State {
    draft: ToolDraft;
    validation: Check;
    call: Call;
    run: Run;
    results: Readonly<Record<string, RunResult>>;
    attempts: number;
}

export class SandboxStore extends Review {
    readonly #state = shallowReactive<State>({
        draft: emptyDraft(),
        validation: { status: 'idle', issues: [], tool: null },
        call: { status: 'idle' },
        run: { status: 'idle', question: '', steps: [] },
        results: {},
        attempts: 0
    });
    readonly state = shallowReadonly(this.#state);

    readonly #load: () => Promise<ToolLesson>;
    readonly #words: SandboxWords;
    #lesson: Promise<ToolLesson> | undefined;
    #timer: ReturnType<typeof setTimeout> | undefined;
    #validation: object | null = null;
    #run: object | null = null;

    constructor(load: () => Promise<ToolLesson>, words: SandboxWords) {
        super();
        this.#load = load;
        this.#words = words;
    }

    get blocked() {
        const { status, tool } = this.#state.validation;
        if (status !== 'ready') return status;
        return tool === null ? 'errors' : null;
    }

    solvedAtOnce(question: string) {
        const result = this.#state.results[question];
        return result !== undefined && result.solved && result.calls === 1;
    }

    protected get issues() {
        return this.#state.validation.issues;
    }

    protected get attempts() {
        return this.#state.attempts;
    }

    retry() {
        this.#check();
    }

    async call(args: Record<string, unknown>) {
        if (this.blocked || this.#state.call.status === 'running') return;
        const draft = this.#state.draft;
        this.#state.call = { status: 'running' };
        try {
            const report = await (await this.#ready()).call(draft, args);
            if (this.#state.draft !== draft) return;
            this.#state.call = { status: 'done', report };
            this.#state.attempts++;
        } catch {
            if (this.#state.draft === draft) this.#state.call = { status: 'failed' };
        }
    }

    async ask(question: string) {
        if (this.blocked || this.#state.run.status === 'running') return;
        const run = {};
        this.#run = run;
        this.#state.run = { status: 'running', question, steps: [] };
        try {
            await (await this.#ready()).run(this.#state.draft, question, event => {
                if (this.#run === run) this.#apply(event);
            });
            if (this.#run === run) this.#endRun('done');
        } catch {
            if (this.#run === run) this.#endRun('failed');
        }
    }

    stop() {
        if (this.#run) this.#endRun('stopped');
    }

    #apply(event: RunEvent) {
        if (event.type === 'answer') {
            this.#state.results = { ...this.#state.results, [this.#state.run.question]: { calls: event.calls, solved: event.solved } };
            this.#state.attempts++;
        }
        const step: RunStep = event.type === 'thought' ? { type: 'thought', text: this.#words.thought(event.parts) } : event;
        this.#state.run = { ...this.#state.run, steps: [...this.#state.run.steps, step] };
    }

    edit(patch: Partial<ToolDraft>) {
        this.#state.draft = { ...this.#state.draft, ...patch };
        this.#run = null;
        this.#state.call = { status: 'idle' };
        this.#state.run = { status: 'idle', question: '', steps: [] };
        this.#state.results = {};
        this.#check();
    }

    #check() {
        clearTimeout(this.#timer);
        this.#validation = null;

        if (isBlank(this.#state.draft)) {
            this.#state.validation = { status: 'idle', issues: [], tool: null };
            return;
        }
        const { issues, tool } = this.#state.validation;
        this.#state.validation = { status: 'checking', issues, tool };
        this.#timer = setTimeout(() => void this.#validate(), CHECK_DELAY_MS);
    }

    async #validate() {
        const validation = {};
        this.#validation = validation;
        try {
            const { issues, tool } = await (await this.#ready()).validate(this.#state.draft);
            if (this.#validation === validation) this.#state.validation = { status: 'ready', issues: this.#words.issues(issues), tool };
        } catch {
            if (this.#validation === validation) this.#state.validation = { status: 'failed', issues: [], tool: null };
        }
    }

    #ready() {
        this.#lesson ??= this.#load();
        return this.#lesson;
    }

    #endRun(status: 'done' | 'stopped' | 'failed') {
        this.#run = null;
        this.#state.run = { ...this.#state.run, status };
    }
}
