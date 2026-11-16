import type { InjectionKey } from 'vue';

import { useProvided } from '../composables/provided.ts';
import type { uk } from './uk.ts';

export type Content = typeof uk;
export type LessonText = Content['lessons'][keyof Content['lessons']];
export type FilmText = Content['toolFilm']['film'];
export type Answer = Content['sandbox']['solved'];

export interface Topic {
    number: string;
    title: string;
    sources: { text: string; link: string }[];
}

export const CONTENT: InjectionKey<Content> = Symbol('content');

export function useContent() {
    return useProvided(CONTENT);
}
