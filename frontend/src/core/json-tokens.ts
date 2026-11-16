interface JsonToken {
    kind: 'plain' | 'key';
    text: string;
}

const STRING = /("(?:\\.|[^"\\])*")(\s*:)?/g;

export function tokenizeJson(value: unknown) {
    const text = JSON.stringify(value, null, 2);
    const tokens: JsonToken[] = [];
    let cursor = 0;
    for (const match of text.matchAll(STRING)) {
        const [, string, colon] = match;
        if (!colon) continue;
        tokens.push({ kind: 'plain', text: text.slice(cursor, match.index) }, { kind: 'key', text: string });
        cursor = match.index + string.length;
    }
    tokens.push({ kind: 'plain', text: text.slice(cursor) });
    return tokens;
}
