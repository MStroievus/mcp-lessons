import { inject, type InjectionKey } from 'vue';

export function useProvided<T>(key: InjectionKey<T>) {
    const value = inject(key);
    if (value === undefined) throw new Error(`${key.description} is not provided`);
    return value;
}
