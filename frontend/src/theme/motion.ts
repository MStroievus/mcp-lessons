export function readMotion() {
    const style = getComputedStyle(document.documentElement);
    const seconds = (token: string) => Number.parseFloat(style.getPropertyValue(token));
    return {
        place: seconds('--dur-place'),
        travel: seconds('--dur-travel'),
        look: seconds('--dur-look'),
        char: seconds('--dur-char'),
        pause: seconds('--dur-pause'),
        cut: seconds('--dur-cut')
    };
}

export type Motion = ReturnType<typeof readMotion>;
