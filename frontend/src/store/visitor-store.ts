import { type InjectionKey, shallowReactive, shallowReadonly } from 'vue';

import { useProvided } from '../composables/provided.ts';
import type { SavedChoices } from '../core/saved-choices.ts';

const PASSED = 'passed-steps';
const CODE_LANGUAGE = 'code-language';
const LANGUAGE = 'language';

export class VisitorStore {
    readonly #state = shallowReactive<{ passed: readonly string[]; codeLanguage: string | null }>({ passed: [], codeLanguage: null });
    readonly state = shallowReadonly(this.#state);
    readonly #saved: SavedChoices;

    constructor(saved: SavedChoices) {
        this.#saved = saved;
        this.#state.passed = saved.read(PASSED)?.split(',') ?? [];
        this.#state.codeLanguage = saved.read(CODE_LANGUAGE);
    }

    isOpen(requires: string | undefined) {
        return requires === undefined || this.#state.passed.includes(requires);
    }

    pass(stepId: string) {
        if (this.#state.passed.includes(stepId)) return;
        this.#state.passed = [...this.#state.passed, stepId];
        this.#saved.write(PASSED, this.#state.passed.join());
    }

    get language() {
        return this.#saved.read(LANGUAGE);
    }

    chooseLanguage(language: string) {
        this.#saved.write(LANGUAGE, language);
    }

    chooseCodeLanguage(language: string) {
        this.#state.codeLanguage = language;
        this.#saved.write(CODE_LANGUAGE, language);
    }
}

export const VISITOR: InjectionKey<VisitorStore> = Symbol('visitor');

export function useVisitor() {
    return useProvided(VISITOR);
}
