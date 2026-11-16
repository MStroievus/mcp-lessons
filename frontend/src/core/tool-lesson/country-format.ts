const NAMED = /\b(codes?|iso|alpha-?2)\b/i;
const LETTERS = /\b(two|2)[\s-]*(\w+\s+){0,2}(letters?|characters?|chars?|symbols?)\b/i;
const EXAMPLE = /(?<![A-Za-z])[A-Z]{2}(?![A-Za-z])/;
const NOT_ISO = /(?<![A-Za-z])UK(?![A-Za-z])/;

export const statesCountryCode = (description: string) =>
    NAMED.test(description) || LETTERS.test(description) || EXAMPLE.test(description);

export const showsCountryCode = (description: string) => statesCountryCode(description) && !NOT_ISO.test(description);
