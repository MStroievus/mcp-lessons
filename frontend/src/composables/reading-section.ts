import { nextTick, onBeforeUnmount, type Ref, ref, watch } from 'vue';

const PASSED_ZONE = '100000px 0px -60% 0px';

export function useReadingSection(ids: Ref<readonly string[]>) {
    const reading = ref<string>();
    const passed = new Set<string>();

    const observer = new IntersectionObserver(
        entries => {
            for (const { target, isIntersecting } of entries) {
                if (isIntersecting) passed.add(target.id);
                else passed.delete(target.id);
            }
            reading.value = ids.value.findLast(id => passed.has(id));
        },
        { rootMargin: PASSED_ZONE }
    );

    watch(
        ids,
        async current => {
            observer.disconnect();
            passed.clear();
            reading.value = undefined;
            await nextTick();
            for (const id of current) {
                const title = document.getElementById(id);
                if (title) observer.observe(title);
            }
        },
        { immediate: true }
    );
    onBeforeUnmount(() => observer.disconnect());

    return reading;
}
