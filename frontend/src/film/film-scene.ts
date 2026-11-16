import type { Component } from 'vue';

import type { Motion } from '../theme/motion.ts';
import { Shot } from './shot.ts';

export abstract class FilmScene {
    abstract readonly id: string;
    abstract readonly title: string;
    abstract readonly frame: Component;
    abstract readonly frameProps: object;

    protected abstract direct(shot: Shot): void;

    shoot(frame: HTMLElement, motion: Motion) {
        const shot = new Shot(frame, motion);
        this.direct(shot);
        return shot;
    }
}
