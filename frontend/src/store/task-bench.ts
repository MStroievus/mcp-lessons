import { type InjectionKey, shallowReactive, shallowReadonly } from 'vue';

import { useProvided } from '../composables/provided.ts';
import type { Content } from '../content/content.ts';
import type { DraftRule } from '../core/draft-rule.ts';
import { PROMPT_RULES, roughPrompt } from '../core/prompt-task.ts';
import { RESOURCE_RULES, roughResource } from '../core/resource-task.ts';
import type { Issue } from '../core/sandbox-models.ts';
import { Review } from './review.ts';

type Message = string | ((about: string) => string);

class TaskBench<Draft extends object, Rule extends string, Goal extends string> extends Review {
    readonly #state;
    readonly state;
    readonly #rules: Record<Rule, DraftRule<Draft, Goal>>;
    readonly #messages: Record<Rule, Message>;

    constructor(rough: Draft, rules: Record<Rule, DraftRule<Draft, Goal>>, messages: Record<Rule, Message>) {
        super();
        this.#state = shallowReactive({ draft: rough, attempts: 0 });
        this.state = shallowReadonly(this.#state);
        this.#rules = rules;
        this.#messages = messages;
    }

    protected get issues() {
        return this.#found.map(({ issue }) => issue);
    }

    protected get attempts() {
        return this.#state.attempts;
    }

    protected override get advice() {
        const advice = this.#found.filter(({ issue }) => issue.level === 'warning');
        return advice.filter(({ goal }) => goal === advice[0].goal).map(({ issue }) => issue);
    }

    get registrable() {
        return !this.#blank && this.errorsIn('').length === 0;
    }

    met(goal: Goal) {
        return this.registrable && !this.#found.some(found => found.goal === goal);
    }

    edit(patch: Partial<Draft>) {
        this.#state.draft = { ...this.#state.draft, ...patch };
    }

    tried() {
        this.#state.attempts++;
    }

    get #found() {
        const found: { issue: Issue; goal?: Goal }[] = [];
        if (this.#blank) return found;
        for (const rule in this.#rules) {
            const { level, goal, find } = this.#rules[rule];
            const message = this.#messages[rule];
            for (const { field, about = '' } of find(this.#state.draft)) {
                found.push({ issue: { rule, level, field, message: typeof message === 'string' ? message : message(about) }, goal });
            }
        }
        return found;
    }

    get #blank() {
        return Object.values(this.#state.draft).every(value => value === '');
    }
}

export function createTasks({ tasks }: Content) {
    return {
        resource: new TaskBench(roughResource(), RESOURCE_RULES, tasks.resource.rules),
        prompt: new TaskBench(roughPrompt(), PROMPT_RULES, tasks.prompt.rules)
    };
}

export const TASKS: InjectionKey<ReturnType<typeof createTasks>> = Symbol('tasks');

export function useTasks() {
    return useProvided(TASKS);
}
