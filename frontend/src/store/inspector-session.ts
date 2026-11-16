import { shallowReactive, shallowReadonly } from 'vue';

import type { Args, Item, Reply, Screen } from '../core/inspector-demo.ts';

interface Exchange {
    id: number;
    method: string;
    name?: string;
    params: Record<string, unknown>;
    body: Record<string, unknown>;
    failed: boolean;
}

interface State {
    connected: boolean;
    screen: Screen | null;
    item: Item | null;
    reply: Reply | null;
    log: readonly Exchange[];
    opened: Exchange | null;
    picked: boolean;
    inspected: boolean;
}

const fresh = (): State => ({ connected: false, screen: null, item: null, reply: null, log: [], opened: null, picked: false, inspected: false });

export class InspectorSession {
    readonly #state = shallowReactive(fresh());
    readonly state = shallowReadonly(this.#state);
    #lastId = 0;

    get steps() {
        const { connected, log, picked, inspected } = this.#state;
        return [connected, log.length > 0, picked, log.some(exchange => exchange.name !== undefined), inspected];
    }

    toggle() {
        Object.assign(this.#state, fresh(), { connected: !this.#state.connected });
        this.#lastId = 0;
    }

    open(screen: Screen | null) {
        if (!this.#state.connected) return;
        Object.assign(this.#state, { screen, item: null, reply: null });
        if (!screen) return;
        const listed = { resultType: 'complete', [screen.id]: screen.items.map(item => screen.describe(item)) };
        this.#record({ method: screen.list, params: {}, body: { result: listed }, failed: false });
    }

    pick(item: Item) {
        Object.assign(this.#state, { item, reply: null, picked: true });
    }

    send(args: Args) {
        const { screen, item } = this.#state;
        if (!screen || !item) return;
        const reply = item.answer(args);
        this.#state.reply = reply;
        this.#record({ method: screen.call, name: item.name, params: screen.params(item, args), body: reply.body, failed: reply.failed });
    }

    inspect(exchange: Exchange) {
        Object.assign(this.#state, { opened: this.#state.opened === exchange ? null : exchange, inspected: true });
    }

    #record(exchange: Omit<Exchange, 'id'>) {
        this.#state.log = [...this.#state.log, { ...exchange, id: ++this.#lastId }];
    }
}
