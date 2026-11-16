export class SavedChoices {
    readonly #prefix: string;

    constructor(prefix: string) {
        this.#prefix = prefix;
    }

    read(key: string) {
        try {
            return localStorage.getItem(this.#prefix + key);
        } catch {
            return null;
        }
    }

    write(key: string, value: string) {
        try {
            localStorage.setItem(this.#prefix + key, value);
        } catch {
        }
    }
}
