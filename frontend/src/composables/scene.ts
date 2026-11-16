import { nextTick, onBeforeUnmount, onMounted, type Ref, ref } from 'vue';

import { Shot } from '../film/shot.ts';
import { useAnimation } from './animation.ts';

const VISIBLE_SHARE = 0.25;

export function useScene(stage: Ref<HTMLElement | null>, direct: (shot: Shot) => void) {
    const { play, reduced } = useAnimation(stage);
    const ended = ref(false);
    let seen = false;
    let last: Shot | null = null;

    async function replay() {
        await document.fonts.ready;
        await nextTick();
        const root = stage.value;
        if (!seen || !root) return;
        play((timeline, motion) => {
            last?.settle();
            last = new Shot(root, motion);
            direct(last);
            ended.value = false;
            timeline.add(last.timeline).eventCallback('onComplete', () => (ended.value = true));
        });
    }

    const observer = new IntersectionObserver(
        ([entry]) => {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            seen = true;
            void replay();
        },
        { threshold: VISIBLE_SHARE }
    );

    onMounted(() => stage.value && observer.observe(stage.value));
    onBeforeUnmount(() => observer.disconnect());

    return { replay, ended, reduced };
}
