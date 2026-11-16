import { computed, onBeforeUnmount, ref } from 'vue';

export const placeOf = (step: string, section?: string) => (section ? `${step}/${section}` : step);

export function useHashStep(ids: readonly string[]) {
    const read = () => {
        const [step, section] = location.hash.slice(1).split('/');
        const known = ids.find(id => id === step);
        return { step: known ?? ids[0], section: known ? section : undefined };
    };
    const place = ref(read());
    const sync = () => (place.value = read());
    addEventListener('hashchange', sync);
    onBeforeUnmount(() => removeEventListener('hashchange', sync));

    function show(shown: string) {
        if (location.hash !== `#${shown}`) location.replace(`#${shown}`);
    }

    return { wanted: computed(() => place.value.step), section: computed(() => place.value.section), show };
}
