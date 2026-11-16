export { gsap } from 'gsap';

export const DROP_PX = 14;
export const SHORTEST_WRITE_S = 0.3;

export function typing(text: string, show: (shown: string) => void, from = '') {
    let kept = 0;
    while (kept < from.length && from[kept] === text[kept]) kept++;
    const erased = from.length - kept;
    const steps = erased + text.length - kept;
    let current = 0;
    const target = {
        get step() {
            return current;
        },
        set step(value: number) {
            current = value;
            const at = Math.round(value);
            show(at <= erased ? from.slice(0, from.length - at) : text.slice(0, kept + at - erased));
        }
    };
    return { target, steps };
}
