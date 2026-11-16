export type Args = Record<string, string | number>;

export interface Reply {
    body: Record<string, unknown>;
    mark: string;
    text: string;
    failed: boolean;
}

export interface Item {
    name: string;
    about: string;
    fields: { name: string; required: boolean; integer?: boolean; hint?: string }[];
    answer(args: Args): Reply;
}

export interface Screen {
    id: 'tools' | 'prompts' | 'resources';
    list: string;
    call: string;
    items: Item[];
    params(item: Item, args: Args): Record<string, unknown>;
    describe(item: Item): Record<string, unknown>;
}

const CITIES = [
    { city: 'London', country: 'GB', place: 'London, United Kingdom (GB)', now: '+12 °C, fog, wind 2 m/s', ahead: 'fog in the mornings, +10 to +13 °C' },
    { city: 'London', country: 'CA', place: 'London, Canada (CA)', now: '+6 °C, sleet, wind 9 m/s', ahead: 'sleet turning to snow, +1 to +6 °C' },
    { city: 'Seattle', country: 'US', place: 'Seattle, United States (US)', now: '+13 °C, drizzle, wind 5 m/s', ahead: 'drizzle most days, +9 to +13 °C' }
];
type City = (typeof CITIES)[number];

const DEFAULT_DAYS = 3;
const MAX_DAYS = 7;

const toolResult = (text: string, isError = false): Reply => ({
    body: { result: { resultType: 'complete', content: [{ type: 'text', text }], isError } },
    mark: `isError: ${isError}`,
    text,
    failed: isError
});

const invalidParams = (message: string): Reply => ({ body: { error: { code: -32602, message } }, mark: 'error -32602', text: message, failed: true });

const REFUSALS: { fits: (city: string, found: City[]) => boolean; says: (city: string, found: City[]) => string }[] = [
    { fits: city => city === '', says: () => 'No city passed. Pass city — the city name in English, e.g. "London".' },
    { fits: (_, found) => found.length === 0, says: city => `City "${city}" not found.` },
    {
        fits: (_, found) => found.length > 1,
        says: (city, found) => `Several cities are named "${city}": ${found.map(({ place }) => place).join('; ')}. To pick one, pass country — a two-letter country code, e.g. GB.`
    }
];

const trimmed = (value: string | number = '') => String(value).trim();

function locate({ city, country }: Args): { place: City } | { refusal: string } {
    const [name, code] = [trimmed(city), trimmed(country).toUpperCase()];
    const found = CITIES.filter(place => place.city.toLowerCase() === name.toLowerCase() && (code === '' || place.country === code));
    const refusal = REFUSALS.find(({ fits }) => fits(name, found));
    return refusal ? { refusal: refusal.says(name, found) } : { place: found[0] };
}

const aboutCity = (tell: (place: City, args: Args) => Reply) => (args: Args) => {
    const located = locate(args);
    return 'refusal' in located ? toolResult(located.refusal, true) : tell(located.place, args);
};

function forecast(place: City, { days = DEFAULT_DAYS }: Args) {
    const fits = Number.isInteger(days) && Number(days) >= 1 && Number(days) <= MAX_DAYS;
    return fits
        ? toolResult(`${days}-day forecast for ${place.place}: ${place.ahead}.`)
        : toolResult(`Input validation error: days must be an integer between 1 and ${MAX_DAYS}, got ${days}.`, true);
}

const CITY = { name: 'city', required: true, hint: 'try London' };
const COUNTRY = { name: 'country', required: false, hint: 'e.g. GB or CA' };

const TOOLS: Item[] = [
    {
        name: 'get_weather',
        about: 'Returns the current weather in a city.',
        fields: [CITY, COUNTRY],
        answer: aboutCity(place => toolResult(`${place.place}: ${place.now}.`))
    },
    {
        name: 'get_forecast',
        about: `Returns the weather forecast for a city for 1 to ${MAX_DAYS} days.`,
        fields: [CITY, COUNTRY, { name: 'days', required: false, integer: true, hint: `1 to ${MAX_DAYS}` }],
        answer: aboutCity(forecast)
    }
];

function report({ city }: Args): Reply {
    if (trimmed(city) === '') return invalidParams('Missing required argument: city');
    const text = `Write a short weather report for ${trimmed(city)}: temperature, wind, and whether to take an umbrella.`;
    const messages = [{ role: 'user', content: { type: 'text', text } }];
    return { body: { result: { resultType: 'complete', messages } }, mark: 'role: user', text, failed: false };
}

const PROMPTS: Item[] = [{ name: 'weather_report', about: 'Asks for a short weather report for a city.', fields: [CITY], answer: report }];

const JSON_TYPE = 'application/json';

function resource(uri: string, about: string, content: unknown): Item {
    const text = JSON.stringify(content);
    const body = { result: { resultType: 'complete', contents: [{ uri, mimeType: JSON_TYPE, text }] } };
    return { name: uri, about, fields: [], answer: () => ({ body, mark: JSON_TYPE, text, failed: false }) };
}

const RESOURCES = [
    resource(
        'weather://cities',
        'Cities the server knows, with country codes.',
        CITIES.map(({ city, country }) => ({ city, country }))
    )
];

const named = (item: Item, args: Args) => ({ name: item.name, arguments: args });
const properties = (item: Item) => Object.fromEntries(item.fields.map(field => [field.name, { type: field.integer ? 'integer' : 'string' }]));
const requiredFields = (item: Item) => item.fields.filter(field => field.required).map(field => field.name);

export const SCREENS: Screen[] = [
    {
        id: 'tools',
        list: 'tools/list',
        call: 'tools/call',
        items: TOOLS,
        params: named,
        describe: item => ({
            name: item.name,
            description: item.about,
            inputSchema: { type: 'object', properties: properties(item), required: requiredFields(item) }
        })
    },
    {
        id: 'prompts',
        list: 'prompts/list',
        call: 'prompts/get',
        items: PROMPTS,
        params: named,
        describe: item => ({ name: item.name, description: item.about, arguments: item.fields.map(({ name, required }) => ({ name, required })) })
    },
    {
        id: 'resources',
        list: 'resources/list',
        call: 'resources/read',
        items: RESOURCES,
        params: item => ({ uri: item.name }),
        describe: item => ({ uri: item.name, name: item.name.split('/').at(-1), description: item.about, mimeType: JSON_TYPE })
    }
];
