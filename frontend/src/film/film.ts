import { gsap } from '../motion/gsap.ts';
import type { Motion } from '../theme/motion.ts';
import type { FilmScene } from './film-scene.ts';

export interface Chapter {
    id: string;
    title: string;
    start: number;
    opens: number;
    end: number;
}

export class Reel {
    readonly chapters: Chapter[];
    readonly #timeline: gsap.core.Timeline;

    constructor(timeline: gsap.core.Timeline, chapters: Chapter[]) {
        this.#timeline = timeline;
        this.chapters = chapters;
    }

    get duration() {
        return this.#timeline.duration();
    }

    watch(onTime: (seconds: number) => void, onEnd: () => void) {
        this.#timeline.eventCallback('onUpdate', () => onTime(this.#timeline.time()));
        this.#timeline.eventCallback('onComplete', () => {
            this.#timeline.pause();
            onEnd();
        });
    }

    play() {
        if (this.#timeline.progress() >= 1) this.#timeline.time(0);
        this.#timeline.play();
    }

    pause() {
        this.#timeline.pause();
    }

    seek(seconds: number) {
        this.#timeline.time(seconds);
    }

    chapterAt(time: number) {
        return this.chapters.findLast(chapter => time >= chapter.start) ?? this.chapters[0];
    }

    stillTime(chapter: Chapter) {
        return chapter.end - 0.001;
    }
}

export class Film {
    readonly title: string;
    readonly scenes: FilmScene[];

    constructor(title: string, scenes: FilmScene[]) {
        this.title = title;
        this.scenes = scenes;
    }

    assemble(frames: ReadonlyMap<string, HTMLElement>, motion: Motion) {
        const timeline = gsap.timeline({ paused: true });
        const chapters: Chapter[] = [];
        let start = 0;

        this.scenes.forEach((scene, index) => {
            const frame = frames.get(scene.id);
            if (!frame) throw new Error(`No frame for scene "${scene.id}"`);
            const shot = scene.shoot(frame, motion);
            const opens = start + motion.cut;
            const end = opens + shot.timeline.duration();

            timeline.fromTo(frame, { autoAlpha: 0 }, { autoAlpha: 1, duration: motion.cut }, start);
            timeline.add(shot.timeline, opens);
            if (index < this.scenes.length - 1) timeline.to(frame, { autoAlpha: 0, duration: motion.cut }, end);

            chapters.push({ id: scene.id, title: scene.title, start, opens, end });
            start = end;
        });

        return new Reel(timeline, chapters);
    }
}
