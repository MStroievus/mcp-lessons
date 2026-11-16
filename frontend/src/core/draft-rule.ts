import type { Issue } from './sandbox-models.ts';

export interface DraftRule<Draft, Goal extends string> {
    level: Issue['level'];
    goal?: Goal;
    find(draft: Draft): { field: string; about?: string }[];
}

export const plain = (value: string) => value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[^A-Za-z0-9]+/g, ' ');

export const CYRILLIC = /\p{Script=Cyrillic}/u;
