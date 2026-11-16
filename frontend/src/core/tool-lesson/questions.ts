export const QUESTIONS = [
    {
        text: "What's the weather in Seattle?",
        city: 'Seattle',
        wellKnown: { name: 'United States', said: 'USA', code: 'US' },
        ambiguous: false
    },
    {
        text: "What's the weather in London?",
        city: 'London',
        wellKnown: { name: 'United Kingdom', said: 'UK', code: 'GB' },
        ambiguous: true
    },
    {
        text: "What's the weather in London, Canada?",
        city: 'London',
        named: { said: 'Canada', code: 'CA' },
        wellKnown: { name: 'United Kingdom', said: 'UK', code: 'GB' },
        ambiguous: true
    }
];

export type Question = (typeof QUESTIONS)[number];
