import type { Finding, RuleId, ToolDraft } from '../sandbox-models.ts';

type Found = Omit<Finding, 'rule' | 'level'>;

export class Rule {
    readonly id;
    readonly level;
    readonly #find;

    constructor(id: RuleId, level: Finding['level'], find: (draft: ToolDraft) => Found[]) {
        this.id = id;
        this.level = level;
        this.#find = find;
    }

    check(draft: ToolDraft) {
        return this.#find(draft).map(found => ({ rule: this.id, level: this.level, ...found }));
    }
}
