import * as z from 'zod';

import type { RunEvent, ThoughtPart as Thought } from '../sandbox-models.ts';
import { statesCountryCode } from './country-format.ts';
import type { Question } from './questions.ts';
import type { ToolSession } from './tool-session.ts';

const MAX_CALLS = 3;

const Property = z.object({ type: z.string().optional(), description: z.string().default('') });

const WEATHER = /\b(weather|forecast|temperature)/i;
const CITY = /\b(city|cities|town)/i;
const COUNTRY = /\bcountr(y|ies)/i;

const plain = (name: string) => name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_\-.]+/g, ' ');

const SCHEMA_ERROR = /validation error|invalid arguments/i;

const EXAMPLE = /(?:e\.g\.|for example|:)[\s,]*["'`]?([\w-]+)/i;

const requestedParameters = (text: string) => Array.from(text.matchAll(/\bpass ([a-z_]+)(?= —|:| as\b)/gi), match => match[1]);

export type Emit = (event: RunEvent) => void;
type Parameter = { name: string; type?: string; description: string; required: boolean };

const think = (emit: Emit, ...parts: Thought[]) => emit({ type: 'thought', parts });

const declares = (parameters: Parameter[], name: string) => parameters.some(parameter => parameter.name === name);

type Attempt = { args: Record<string, string>; cityKey?: string; countryKey?: string; inline?: boolean };
type Repair = Attempt & { thought: Thought[] };

export class ScriptedModel {
    async run(session: ToolSession, question: Question, emit: Emit) {
        const tool = await session.describe();
        const parameters = Object.entries(tool.inputSchema.properties ?? {}).map(([name, schema]) => {
            const { type, description } = Property.parse(schema);
            return { name, type, description: description.trim(), required: tool.inputSchema.required?.includes(name) === true };
        });

        let attempt = this.#plan(tool.name, tool.description?.trim() ?? '', parameters, question, emit);
        for (let calls = 1; ; calls++) {
            const result = await this.#call(session, attempt, emit);
            if (!result.isError) {
                think(emit, { id: 'answer-ready' });
                const assumed = attempt.countryKey && !question.named && question.ambiguous;
                return {
                    text:
                        (assumed ? `Several cities are named "${question.city}"; I picked the best-known one, in the ${question.wellKnown.name}. ` : '') +
                        `According to the tool: ${result.text}`,
                    calls,
                    weather: result.text
                };
            }

            const repair = calls < MAX_CALLS ? this.#repair(result.text, question, parameters, attempt) : undefined;
            if (!repair) return { text: this.#giveUp(result.text, question, parameters, attempt, emit), calls };
            think(emit, ...repair.thought);
            attempt = repair;
        }
    }

    #plan(name: string, description: string, parameters: Parameter[], question: Question, emit: Emit) {
        const tool = { tool: name, description };
        const plan: Thought[] = [{ id: 'asks', city: question.city }];

        if (WEATHER.test(`${plain(name)} ${description}`)) {
            plan.push({ id: 'fits', ...tool });
        } else if (parameters.some(parameter => WEATHER.test(`${plain(parameter.name)} ${parameter.description}`))) {
            plan.push({ id: 'fits-by-parameters', ...tool });
        } else {
            plan.push({ id: 'only-tool', ...tool });
        }

        const { city, country, unclear } = this.#roles(parameters);
        const holder = city ?? unclear.find(parameter => !parameter.description);
        const attempt: Attempt = { args: holder ? { [holder.name]: question.city } : {}, cityKey: holder?.name };

        if (city) {
            plan.push({ id: 'city-into', parameter: city.name });
        } else if (holder) {
            plan.push({ id: 'city-guess', parameter: holder.name });
        } else {
            plan.push({ id: 'city-nowhere' });
        }

        const target = question.named ?? question.wellKnown;
        if (country && (question.named || question.ambiguous || country.required)) {
            const followsExample = target.said !== target.code && new RegExp(`\\b${target.said}\\b`).test(country.description);
            const coded = this.#wantsCode(country) && !followsExample;
            const parameter = country.name;
            attempt.countryKey = parameter;
            attempt.args[parameter] = coded ? target.code : target.said;
            plan.push(
                question.named
                    ? { id: 'country-named' }
                    : question.ambiguous
                      ? { id: 'several-likely', city: question.city, country: question.wellKnown.name }
                      : { id: 'country-required', parameter, city: question.city, country: question.wellKnown.name },
                coded
                    ? { id: statesCountryCode(country.description) ? 'code-by-description' : 'code-by-name', parameter, code: target.code }
                    : followsExample
                      ? { id: 'follows-example', parameter, value: target.said }
                      : { id: country.description ? 'no-code-hint' : 'no-description', parameter, value: target.said }
            );
        } else if (country) {
            plan.push({ id: 'country-skipped', parameter: country.name });
        } else if (question.named && attempt.cityKey) {
            plan.push({ id: 'country-without-parameter', country: question.named.said });
        } else if (question.ambiguous && attempt.cityKey) {
            plan.push({ id: 'several-without-parameter', city: question.city });
        }

        for (const parameter of parameters.filter(candidate => candidate.required && !(candidate.name in attempt.args))) {
            const role = this.#role(parameter);
            const value =
                role === 'city'
                    ? question.city
                    : role === 'country'
                      ? this.#wantsCode(parameter) ? target.code : target.said
                      : parameter.type === 'string'
                        ? (EXAMPLE.exec(parameter.description)?.[1] ?? question.text)
                        : undefined;
            if (value === undefined) {
                plan.push({ id: 'required-unfillable', parameter: parameter.name });
                continue;
            }
            attempt.args[parameter.name] = value;
            plan.push({ id: role ? `required-${role}` : 'required-other', parameter: parameter.name, value });
        }

        think(emit, ...plan);
        return attempt;
    }

    #roles(parameters: Parameter[]) {
        const find = (role: 'city' | 'country') =>
            parameters.find(parameter => this.#roleByName(parameter) === role) ??
            parameters.find(parameter => this.#role(parameter) === role);
        return { city: find('city'), country: find('country'), unclear: parameters.filter(parameter => !this.#role(parameter)) };
    }

    #roleByName({ name }: Parameter) {
        return CITY.test(plain(name)) ? 'city' : COUNTRY.test(plain(name)) ? 'country' : undefined;
    }

    #role(parameter: Parameter) {
        const [city, country] = [parameter.description.search(CITY), parameter.description.search(COUNTRY)];
        const byDescription = city < 0 && country < 0 ? undefined : country < 0 || (city >= 0 && city < country) ? 'city' : 'country';
        return this.#roleByName(parameter) ?? byDescription;
    }

    #wantsCode({ name, description }: Parameter) {
        return statesCountryCode(`${plain(name)} ${description}`);
    }

    #repair(error: string, question: Question, parameters: Parameter[], { args, cityKey, countryKey, inline }: Attempt): Repair | undefined {
        if (SCHEMA_ERROR.test(error)) return undefined;

        const requested = requestedParameters(error);
        const { code } = question.named ?? question.wellKnown;
        const guess: Thought[] = question.named || countryKey ? [] : [{ id: 'well-known-guess', country: question.wellKnown.name }];

        const cityParameter = requested.find(name => CITY.test(plain(name)) && declares(parameters, name) && !(name in args));
        if (cityParameter) {
            return {
                args: { ...args, [cityParameter]: question.city },
                cityKey: cityParameter,
                countryKey,
                thought: [{ id: 'retry-city', parameter: cityParameter }]
            };
        }

        const countryParameter = requested.find(name => COUNTRY.test(plain(name)));
        if (!countryParameter) return undefined;

        if (declares(parameters, countryParameter)) {
            if (args[countryParameter] === code) return undefined;
            return {
                args: { ...args, [countryParameter]: code },
                cityKey,
                countryKey: countryParameter,
                thought:
                    countryParameter in args
                        ? [{ id: 'retry-code', parameter: countryParameter, value: args[countryParameter], code }]
                        : [{ id: 'country-requested', parameter: countryParameter }, ...guess, { id: 'retry-with-code', code }]
            };
        }

        const holders = Object.keys(args).filter(name => args[name] === question.city);
        if (holders.length > 0 && !inline) {
            const value = `${question.city}, ${code}`;
            return {
                args: { ...args, ...Object.fromEntries(holders.map(name => [name, value])) },
                cityKey,
                countryKey,
                inline: true,
                thought: [{ id: 'country-undeclared', parameter: countryParameter }, ...guess, { id: 'inline-country', holders, value }]
            };
        }
        return undefined;
    }

    #giveUp(error: string, question: Question, parameters: Parameter[], { inline }: Attempt, emit: Emit) {
        if (SCHEMA_ERROR.test(error)) {
            think(emit, { id: 'schema-rejected' });
            return "I can't get the weather: the tool rejected the arguments I built from this question.";
        }

        if (inline) {
            const { country } = this.#roles(parameters);
            think(emit, country ? { id: 'inline-failed', parameter: country.name } : { id: 'inline-failed-undeclared' });
            return `I can't answer: several cities are named "${question.city}", and this tool gives no way to specify the country.`;
        }

        const undeclared = requestedParameters(error).find(name => !declares(parameters, name));
        if (undeclared) {
            think(emit, { id: 'undeclared-requested', parameter: undeclared });
            return `I can't get the weather: the tool expects a "${undeclared}" parameter that its declaration doesn't have.`;
        }

        think(emit, { id: 'no-way' });
        return `I couldn't get the weather. The tool said: "${error}"`;
    }

    async #call(session: ToolSession, { args }: Attempt, emit: Emit) {
        const { request, result, error } = await session.call(args);
        emit({ type: 'tool-call', ...request.params });

        const text = result ? result.content.flatMap(part => (part.type === 'text' ? [part.text] : [])).join('\n') : (error ?? '');
        const outcome = { text, isError: result?.isError === true || error !== undefined };
        emit({ type: 'tool-result', ...outcome });
        return outcome;
    }
}
