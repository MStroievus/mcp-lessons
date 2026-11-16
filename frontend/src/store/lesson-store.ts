import type { InjectionKey } from 'vue';

import { useProvided } from '../composables/provided.ts';
import type { LessonInfo } from '../core/sandbox-models.ts';
import type { ToolLesson } from '../core/tool-lesson/tool-lesson.ts';
import { SandboxStore } from './sandbox-store.ts';
import type { SandboxWords } from './sandbox-words.ts';

interface LessonEntry {
    info: LessonInfo;
    load: () => Promise<ToolLesson>;
}

export class LessonStore {
    readonly #lessons: Map<string, LessonEntry>;
    readonly #words: SandboxWords;
    readonly #sandboxes = new Map<string, SandboxStore>();

    constructor(lessons: LessonEntry[], words: SandboxWords) {
        this.#lessons = new Map(lessons.map(lesson => [lesson.info.id, lesson]));
        this.#words = words;
    }

    info(lessonId: string) {
        return this.#lessons.get(lessonId)?.info ?? null;
    }

    sandbox(lessonId: string) {
        const lesson = this.#lessons.get(lessonId);
        if (!lesson) throw new Error(`Unknown lesson "${lessonId}"`);
        let sandbox = this.#sandboxes.get(lessonId);
        if (!sandbox) {
            sandbox = new SandboxStore(lesson.load, this.#words);
            this.#sandboxes.set(lessonId, sandbox);
        }
        return sandbox;
    }
}

export const LESSONS: InjectionKey<LessonStore> = Symbol('lessons');

export function useLessons() {
    return useProvided(LESSONS);
}
