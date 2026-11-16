import { en } from './en.ts';
import { uk } from './uk.ts';

export const LANGUAGES = {
    uk: { label: 'Укр', content: uk },
    en: { label: 'Eng', content: en }
};

export type Language = keyof typeof LANGUAGES;

const isLanguage = (id: string): id is Language => Object.hasOwn(LANGUAGES, id);

export function languageOf(saved: string | null) {
    return saved !== null && isLanguage(saved) ? saved : 'en';
}
