import { onBeforeUnmount, type Ref, watch } from 'vue';

export function usePageEnd(end: Ref<HTMLElement | null>, reached: () => void) {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && reached());
    watch(end, element => {
        observer.disconnect();
        if (element) observer.observe(element);
    });
    onBeforeUnmount(() => observer.disconnect());
}
