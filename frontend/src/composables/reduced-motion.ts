import { onBeforeUnmount, readonly, ref } from 'vue';

export function useReducedMotion() {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const reduced = ref(query.matches);
    const update = () => (reduced.value = query.matches);
    query.addEventListener('change', update);
    onBeforeUnmount(() => query.removeEventListener('change', update));
    return readonly(reduced);
}
