export function text(text: string) {
    return { content: [{ type: 'text' as const, text }] };
}

export function error(message: string) {
    return { ...text(message), isError: true };
}
