import { onBeforeUnmount, onMounted, ref, type Ref, shallowRef } from 'vue';

import type { Chapter, Film, Reel } from '../film/film.ts';
import { gsap } from '../motion/gsap.ts';
import { readMotion } from '../theme/motion.ts';
import { useReducedMotion } from './reduced-motion.ts';

const REBUILD_DELAY_MS = 160;
const VISIBLE_SHARE = 0.3;

export function useReel(film: Film, stage: Ref<HTMLElement | null>, frames: ReadonlyMap<string, HTMLElement>) {
    const still = useReducedMotion();
    const reel = shallowRef<Reel | null>(null);
    const time = ref(0);
    const playing = ref(false);
    let context: gsap.Context | null = null;

    function play() {
        if (!reel.value || still.value) return;
        playing.value = true;
        reel.value.play();
    }

    function pause() {
        reel.value?.pause();
        playing.value = false;
    }

    function seek(seconds: number) {
        reel.value?.seek(seconds);
    }

    function showStill(chapter: Chapter) {
        pause();
        reel.value?.seek(reel.value.stillTime(chapter));
    }

    function assemble() {
        if (!stage.value) return;
        const at = time.value;
        const wasPlaying = playing.value;
        reel.value?.seek(0);
        context?.revert();
        context = gsap.context(() => {
            reel.value = film.assemble(frames, readMotion());
            reel.value.watch(
                seconds => (time.value = seconds),
                () => (playing.value = false)
            );
        }, stage.value);
        if (!reel.value) return;

        if (still.value) return showStill(reel.value.chapterAt(at));
        reel.value.seek(at);
        if (wasPlaying) reel.value.play();
    }

    let rebuildTimer: ReturnType<typeof setTimeout> | undefined;
    let lastWidth = 0;
    const resizeObserver = new ResizeObserver(([entry]) => {
        const width = Math.round(entry.contentRect.width);
        if (width === lastWidth) return;
        lastWidth = width;
        clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(assemble, REBUILD_DELAY_MS);
    });

    const visibilityObserver = new IntersectionObserver(([entry]) => !entry.isIntersecting && pause(), { threshold: VISIBLE_SHARE });
    const pauseWhenHidden = () => document.hidden && pause();

    onMounted(() => {
        if (!stage.value) return;
        lastWidth = Math.round(stage.value.getBoundingClientRect().width);
        assemble();
        void document.fonts.ready.then(() => stage.value && assemble());
        resizeObserver.observe(stage.value);
        visibilityObserver.observe(stage.value);
        document.addEventListener('visibilitychange', pauseWhenHidden);
    });

    onBeforeUnmount(() => {
        clearTimeout(rebuildTimer);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        document.removeEventListener('visibilitychange', pauseWhenHidden);
        context?.revert();
    });

    return { reel, time, playing, still, play, pause, seek, showStill };
}
