import type { Directive } from 'vue';

declare module 'vue' {
    interface GlobalDirectives {
        vPlace: Directive<HTMLElement>;
    }
}
