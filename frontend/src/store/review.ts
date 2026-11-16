import type { Issue } from '../core/sandbox-models.ts';

export abstract class Review {
    protected abstract get issues(): Issue[];
    protected abstract get attempts(): number;

    errorsIn(field: string) {
        return this.issues.filter(issue => issue.level === 'error' && issue.field.startsWith(field));
    }

    protected get advice() {
        return this.issues.filter(issue => issue.level === 'warning');
    }

    get hints() {
        return this.attempts > 0 ? this.advice : [];
    }
}
