import { error, text } from './tool-result.ts';

const CITIES = [
    { name: 'London', country: 'GB', countryName: 'United Kingdom', weather: '+12 °C, fog, wind 2 m/s' },
    { name: 'London', country: 'CA', countryName: 'Canada', weather: '+6 °C, sleet, wind 9 m/s' },
    { name: 'Paris', country: 'FR', countryName: 'France', weather: '+16 °C, cloudy, wind 3 m/s' },
    { name: 'Paris', country: 'US', countryName: 'United States', weather: '+27 °C, thunderstorm, wind 8 m/s' },
    { name: 'Birmingham', country: 'GB', countryName: 'United Kingdom', weather: '+10 °C, rain, wind 6 m/s' },
    { name: 'Birmingham', country: 'US', countryName: 'United States', weather: '+24 °C, clear, wind 4 m/s' },
    { name: 'Seattle', country: 'US', countryName: 'United States', weather: '+13 °C, drizzle, wind 5 m/s' },
    { name: 'Toronto', country: 'CA', countryName: 'Canada', weather: '+8 °C, partly cloudy, wind 7 m/s' },
    { name: 'Edinburgh', country: 'GB', countryName: 'United Kingdom', weather: '+9 °C, overcast, wind 11 m/s' }
];

const label = (city: (typeof CITIES)[number]) => `${city.name}, ${city.countryName} (${city.country})`;

export class WeatherService {
    lookup(args: Record<string, unknown>) {
        const name = String(args.city ?? '').trim();
        const country = String(args.country ?? '').trim().toUpperCase();

        if (!name) return error('No city passed. Pass city — the city name in English, e.g. "London".');
        if (country && !/^[A-Z]{2}$/.test(country)) {
            return error(`Country "${args.country}" is not recognized. Pass country as a two-letter country code, e.g. GB or CA.`);
        }

        const named = CITIES.filter(city => city.name.toLowerCase() === name.toLowerCase());
        if (named.length === 0) {
            return error(`City "${name}" not found. Pass only the city name in English, without the country or other details, e.g. "London".`);
        }

        const matches = country ? named.filter(city => city.country === country) : named;
        const variants = named.map(label).join('; ');
        if (country === 'UK') {
            const advice = named.some(city => city.country === 'GB') ? 'Pass country: GB.' : `Found: ${variants}.`;
            return error(`There is no country code "UK": the United Kingdom is GB. ${advice}`);
        }
        if (matches.length === 0) return error(`No city named "${named[0].name}" in ${country}. Found: ${variants}.`);
        if (matches.length > 1) {
            return error(
                `Several cities are named "${named[0].name}": ${variants}. ` +
                    `To pick one, pass country — a two-letter country code, e.g. ${named[0].country}.`
            );
        }

        return text(`${label(matches[0])}: ${matches[0].weather}.`);
    }
}
