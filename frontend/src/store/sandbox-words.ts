import type { Finding, RuleTexts, ThoughtId, ThoughtPart, ThoughtParts, ThoughtTexts } from '../core/sandbox-models.ts';

export class SandboxWords {
    readonly #rules: RuleTexts;
    readonly #thoughts: ThoughtTexts;

    constructor({ rules, thoughts }: { rules: RuleTexts; thoughts: ThoughtTexts }) {
        this.#rules = rules;
        this.#thoughts = thoughts;
    }

    issues(findings: Finding[]) {
        return findings.map(({ rule, level, field, name }) => ({ rule, level, field, message: this.#rules[rule](name ?? '') }));
    }

    thought(parts: ThoughtPart[]) {
        return parts.map(part => this.#say(part)).join(' ');
    }

    #say<Id extends ThoughtId>(part: ThoughtParts[Id]) {
        return this.#thoughts[part.id](part);
    }
}
