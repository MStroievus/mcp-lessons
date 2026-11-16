import type { InjectionKey } from 'vue';

import { useProvided } from '../../composables/provided.ts';

export const WHERE: InjectionKey<{
    readonly current: string;
    readonly section?: string;
}> = Symbol('where');

export function useWhere() {
    return useProvided(WHERE);
}
