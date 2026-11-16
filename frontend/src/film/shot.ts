import { DROP_PX, gsap, SHORTEST_WRITE_S, typing } from '../motion/gsap.ts';
import type { Motion } from '../theme/motion.ts';

const GAZE = 'gaze';
const GAZE_PAD_PX = 5;
const REFUSE_PX = 6;
const FOLDED = 0.3;
const PULSE = 1.06;

interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class Shot {
    readonly timeline = gsap.timeline();
    readonly #root: HTMLElement;
    readonly #motion: Motion;
    readonly #boxes = new Map<string, Box>();
    readonly #typed = new Map<HTMLElement, string>();
    #gazing = false;

    constructor(root: HTMLElement, motion: Motion) {
        this.#root = root;
        this.#motion = motion;
        const origin = root.getBoundingClientRect();
        for (const element of root.querySelectorAll<HTMLElement>('[data-part]')) {
            const { left, top, width, height } = element.getBoundingClientRect();
            this.#boxes.set(element.dataset.part ?? '', { x: left - origin.left, y: top - origin.top, width, height });
        }
    }

    absent(...parts: string[]) {
        gsap.set(parts.map(part => this.#part(part)), { autoAlpha: 0 });
        return this;
    }

    appear(part: string) {
        this.timeline.set(this.#part(part), { autoAlpha: 1 });
        return this;
    }

    lay(part: string) {
        const to = { y: 0, autoAlpha: 1, duration: this.#motion.place, ease: 'power2.out' };
        this.timeline.fromTo(this.#part(part), { y: -DROP_PX, autoAlpha: 0 }, to);
        return this;
    }

    lift(part: string) {
        this.timeline.to(this.#part(part), { y: -DROP_PX, autoAlpha: 0, duration: this.#motion.place, ease: 'power2.in' });
        return this;
    }

    write(part: string, text: string) {
        const element = this.#part(part);
        return this.#spell(element, text, element.textContent ?? '');
    }

    type(part: string) {
        const element = this.#part(part);
        const text = element.textContent ?? '';
        this.#typed.set(element, text);
        element.textContent = '';
        return this.#spell(element, text, '');
    }

    settle() {
        for (const [element, text] of this.#typed) element.textContent = text;
    }

    look(part: string) {
        const gaze = this.#part(GAZE);
        const box = this.#box(part);
        const frame = { x: box.x - GAZE_PAD_PX, y: box.y - GAZE_PAD_PX, width: box.width + GAZE_PAD_PX * 2, height: box.height + GAZE_PAD_PX * 2 };
        if (this.#gazing) {
            this.timeline.to(gaze, { ...frame, autoAlpha: 1, duration: this.#motion.look, ease: 'power2.inOut' });
        } else {
            this.timeline.set(gaze, frame).fromTo(gaze, { autoAlpha: 0 }, { autoAlpha: 1, duration: this.#motion.look * 0.6 });
            this.#gazing = true;
        }
        return this.hold(this.#motion.look);
    }

    lookAway() {
        this.timeline.to(this.#part(GAZE), { autoAlpha: 0, duration: this.#motion.look * 0.6 });
        this.#gazing = false;
        return this;
    }

    take(part: string, fromPart: string) {
        const from = { ...this.#offset(part, fromPart), autoAlpha: 0 };
        this.timeline.fromTo(this.#part(part), from, { x: 0, y: 0, autoAlpha: 1, duration: this.#motion.travel * 0.8, ease: 'power2.inOut' });
        return this;
    }

    carry(part: string, toPart: string) {
        const to = { ...this.#offset(part, toPart), scale: FOLDED, autoAlpha: 0, duration: this.#motion.travel, ease: 'power2.inOut' };
        this.timeline.to(this.#part(part), to);
        return this;
    }

    bring(part: string, fromPart: string) {
        const from = { ...this.#offset(part, fromPart), scale: FOLDED, autoAlpha: 0 };
        this.timeline.fromTo(this.#part(part), from, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: this.#motion.travel, ease: 'power2.out' });
        return this;
    }

    pulse(part: string) {
        this.timeline.to(this.#part(part), { scale: PULSE, duration: this.#motion.place * 0.5, ease: 'power1.inOut', repeat: 1, yoyo: true });
        return this;
    }

    refuse(part: string) {
        const beat = this.#motion.place * 0.2;
        this.timeline
            .to(this.#part(part), { x: REFUSE_PX, duration: beat, ease: 'sine.inOut', repeat: 3, yoyo: true })
            .to(this.#part(part), { x: 0, duration: beat, ease: 'sine.out' });
        return this;
    }

    hold(seconds = this.#motion.pause) {
        this.timeline.to({}, { duration: seconds });
        return this;
    }

    #spell(element: HTMLElement, text: string, from: string) {
        const { target, steps } = typing(text, shown => (element.textContent = shown), from);
        this.timeline.to(target, { step: steps, duration: Math.max(SHORTEST_WRITE_S, steps * this.#motion.char), ease: 'none' });
        return this;
    }

    #part(name: string) {
        const element = this.#root.querySelector<HTMLElement>(`[data-part="${name}"]`);
        if (!element) throw new Error(`Shot has no part "${name}"`);
        return element;
    }

    #box(name: string) {
        const box = this.#boxes.get(name);
        if (!box) throw new Error(`Shot has no part "${name}"`);
        return box;
    }

    #offset(part: string, toPart: string) {
        const [from, to] = [this.#box(part), this.#box(toPart)];
        return { x: to.x + to.width / 2 - (from.x + from.width / 2), y: to.y + to.height / 2 - (from.y + from.height / 2) };
    }
}
