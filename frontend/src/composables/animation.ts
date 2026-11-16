import { onBeforeUnmount, type Ref } from 'vue';

import { gsap } from '../motion/gsap.ts';
import { type Motion, readMotion } from '../theme/motion.ts';
import { useReducedMotion } from './reduced-motion.ts';

export function useAnimation(scope: Ref<HTMLElement | null>) {
    const reduced = useReducedMotion();
    let context: gsap.Context | null = null;

    onBeforeUnmount(() => context?.revert());

    function play(build: (timeline: gsap.core.Timeline, motion: Motion) => void) {
        if (reduced.value || !scope.value) return;
        context?.revert();
        context = gsap.context(() => build(gsap.timeline(), readMotion()), scope.value);
    }

    return { play, reduced };
}
