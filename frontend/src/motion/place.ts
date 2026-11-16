import type { Directive } from 'vue';

import { readMotion } from '../theme/motion.ts';
import { gsap } from './gsap.ts';

const ARRIVE_DROP_PX = 18;
const STAGGER_S = 0.12;
const VISIBLE_SHARE = 0.15;

export function createPlace(): Directive<HTMLElement> {
    const tweens = new WeakMap<Element, gsap.core.Tween>();
    let observer: IntersectionObserver | null = null;

    function arrive(entries: IntersectionObserverEntry[]) {
        const arrived = entries.filter(entry => entry.isIntersecting);
        arrived.forEach(({ target }, order) => {
            observer?.unobserve(target);
            const to = { y: 0, opacity: 1, duration: readMotion().place, delay: order * STAGGER_S, ease: 'power2.out', clearProps: 'transform,opacity' };
            tweens.set(target, gsap.to(target, to));
        });
    }

    return {
        mounted(element) {
            if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            gsap.set(element, { y: -ARRIVE_DROP_PX, opacity: 0 });
            observer ??= new IntersectionObserver(arrive, { threshold: VISIBLE_SHARE });
            observer.observe(element);
        },
        unmounted(element) {
            observer?.unobserve(element);
            tweens.get(element)?.kill();
        }
    };
}
