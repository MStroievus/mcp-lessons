<script setup lang="ts">
import { computed, reactive } from 'vue';

import { useContent } from '../../content/content.ts';
import { type Item, SCREENS } from '../../core/inspector-demo.ts';
import { InspectorSession } from '../../store/inspector-session.ts';
import { fieldValue } from '../field.ts';
import JsonView from '../JsonView.vue';

const { mock, steps, stepsTitle, does, watch, states } = useContent().qa.sections.inspector;

const session = new InspectorSession();
const state = session.state;

const typed = reactive<Record<string, string>>({});

function pick(item: Item) {
    Object.keys(typed).forEach(name => delete typed[name]);
    session.pick(item);
}

function send() {
    const filled = (state.item?.fields ?? [])
        .filter(field => (typed[field.name] ?? '').trim() !== '')
        .map(field => [field.name, field.integer ? Number(typed[field.name]) : typed[field.name]]);
    session.send(Object.fromEntries(filled));
}

const ahead = computed(() => session.steps.indexOf(false));
const STATES = ['done', 'now', 'later'] as const;
const stateOf = (index: number) => (session.steps[index] ? STATES[0] : STATES[Math.sign(index - ahead.value) + 1]);
const markOf = (index: number) => (session.steps[index] ? '✓' : index + 1);
</script>

<template>
    <figure class="inspector">
        <p class="quiet">{{ mock.note }}</p>
        <div class="window" role="group" :aria-label="mock.label" lang="en">
            <header class="bar">
                <span class="name">{{ mock.server.name }}</span>
                <code class="url">{{ mock.server.url }}</code>
                <span class="quiet">{{ mock.server.transport }}</span>
                <span class="link">
                    <span class="mark" :data-state="stateOf(0)">{{ markOf(0) }}</span>
                    <span v-if="state.connected" class="state" data-tone="good">{{ mock.connected }}</span>
                    <button class="btn btn-small" :class="{ 'btn-main': !state.connected }" type="button" @click="session.toggle()">
                        {{ state.connected ? mock.disconnect : mock.connect }}
                    </button>
                </span>
            </header>

            <div class="tabs">
                <span class="mark" :data-state="stateOf(1)">{{ markOf(1) }}</span>
                <button class="tab" type="button" :aria-pressed="state.screen === null" @click="session.open(null)">{{ mock.home }}</button>
                <button v-for="screen in SCREENS" :key="screen.id" class="tab" type="button" :disabled="!state.connected" :aria-pressed="state.screen === screen" @click="session.open(screen)">
                    {{ mock.tabs[screen.id] }}
                </button>
            </div>

            <div class="body">
                <div class="main">
                    <p v-if="!state.screen" class="server">
                        <span class="name">{{ mock.server.name }}</span>
                        <span class="quiet">{{ mock.server.transport }} · {{ state.connected ? mock.connected : mock.idle }}</span>
                    </p>

                    <template v-else>
                        <div class="list">
                            <p class="title"><span class="mark" :data-state="stateOf(2)">{{ markOf(2) }}</span>{{ mock.tabs[state.screen.id] }}</p>
                            <ul :aria-label="mock.tabs[state.screen.id]">
                                <li v-for="item in state.screen.items" :key="item.name">
                                    <button class="item" type="button" :aria-pressed="state.item === item" @click="pick(item)">{{ item.name }}</button>
                                </li>
                            </ul>
                        </div>

                        <form v-if="state.item" class="detail" @submit.prevent="send">
                            <p class="title">{{ state.item.name }}</p>
                            <p class="quiet">{{ state.item.about }}</p>
                            <label v-for="field in state.item.fields" :key="field.name" class="field">
                                <span class="field-name">{{ field.name }}<span v-if="field.required" class="quiet"> · {{ mock.required }}</span></span>
                                <input class="input" :type="field.integer ? 'number' : 'text'" :value="typed[field.name] ?? ''" :placeholder="field.hint" autocomplete="off" spellcheck="false" @input="typed[field.name] = fieldValue($event)" />
                            </label>
                            <button class="btn btn-small btn-main" type="submit">{{ mock.actions[state.screen.id] }}</button>

                            <div class="result" aria-live="polite">
                                <p class="title"><span class="mark" :data-state="stateOf(3)">{{ markOf(3) }}</span>{{ mock.result }}</p>
                                <p v-if="state.reply" class="sheet reply" :data-tone="state.reply.failed ? 'bad' : 'good'">
                                    <code class="kind">{{ state.reply.mark }}</code>
                                    {{ state.reply.text }}
                                </p>
                                <p v-else class="quiet">{{ mock.noResult }}</p>
                            </div>
                        </form>
                        <p v-else class="detail quiet">{{ mock.nothing }}</p>
                    </template>
                </div>

                <aside class="monitor">
                    <p class="title"><span class="mark" :data-state="stateOf(4)">{{ markOf(4) }}</span>{{ mock.protocol.title }}</p>
                    <p v-if="!state.log.length" class="quiet">{{ mock.protocol.empty }}</p>
                    <ol v-else class="log">
                        <li v-for="exchange in state.log" :key="exchange.id">
                            <button class="entry" type="button" :aria-expanded="state.opened === exchange" @click="session.inspect(exchange)">
                                <span class="method">{{ exchange.method }}</span>
                                <span v-if="exchange.name" class="quiet">{{ exchange.name }}</span>
                                <span class="chip" :data-tone="exchange.failed ? 'bad' : 'good'">{{ exchange.failed ? mock.protocol.failed : mock.protocol.ok }}</span>
                            </button>
                            <div v-if="state.opened === exchange" class="exchange">
                                <span class="label">{{ mock.protocol.parameters }}</span>
                                <JsonView :body="exchange.params" />
                                <span class="label">{{ mock.protocol.response }}</span>
                                <JsonView :body="exchange.body" />
                            </div>
                        </li>
                    </ol>
                </aside>
            </div>
        </div>

        <figcaption class="guide">
            <h3>{{ stepsTitle }}</h3>
            <ol class="steps">
                <li v-for="(step, index) in steps" :key="step.title" class="step" :data-state="stateOf(index)">
                    <h4 class="step-title">
                        <span class="mark" :data-state="stateOf(index)">{{ markOf(index) }}</span>
                        {{ step.title }}
                        <span class="visually-hidden">: {{ states[stateOf(index)] }}</span>
                    </h4>
                    <p><span class="label">{{ does }}</span>{{ step.does }}</p>
                    <p class="sheet"><span class="label">{{ watch }}</span>{{ step.watch }}</p>
                </li>
            </ol>
        </figcaption>
    </figure>
</template>

<style scoped>
.inspector { container-type: inline-size; display: grid; gap: 1.75rem; max-width: 64rem; }

.window { overflow: hidden; border: 1px solid var(--jute-dark); border-radius: var(--radius); background: var(--paper); font-size: var(--fs-small); }
.bar { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 1rem; padding: 0.75rem 1rem; background: var(--ceramic); }
.name { font-weight: 600; }
.url { padding: 0.15rem 0.5rem; border: 1px solid var(--jute); border-radius: var(--radius-small); background: var(--paper); font-size: var(--fs-micro); overflow-wrap: anywhere; }
.link { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; margin-left: auto; }

.tabs { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem; padding: 0.5rem 1rem; border-bottom: 1px solid var(--jute); }
.tab { min-height: 2rem; padding: 0.2rem 0.75rem; border: 0; border-radius: var(--radius-small); background: none; font: 500 var(--fs-small) / 1.2 var(--font-text); color: var(--stone-ink); cursor: pointer; }
.tab:hover:not(:disabled) { background: var(--ceramic); color: var(--char); }
.tab[aria-pressed='true'] { background: var(--ceramic); color: var(--char); font-weight: 600; }
.tab:disabled { opacity: 0.55; cursor: not-allowed; }

.body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 19rem); min-height: 23rem; }
.main { display: grid; grid-template-columns: 11rem minmax(0, 1fr); align-items: start; min-width: 0; }
.server { grid-column: 1 / -1; display: grid; gap: 0.2rem; padding: 1rem; }

.list { display: grid; gap: 0.6rem; align-content: start; height: 100%; padding: 1rem 0.75rem; border-right: 1px solid var(--jute); }
.list ul { display: grid; gap: 0.25rem; }
.item { width: 100%; min-height: 2rem; padding: 0.25rem 0.5rem; border: 0; border-radius: var(--radius-small); background: none; font: var(--fs-small) / 1.4 var(--font-code); color: var(--char); text-align: left; overflow-wrap: anywhere; cursor: pointer; }
.item:hover { background: var(--wall); }
.item[aria-pressed='true'] { background: var(--ceramic); font-weight: 500; }

.detail { display: grid; gap: 0.7rem; align-content: start; justify-items: start; min-width: 0; padding: 1rem; }
.title { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; overflow-wrap: anywhere; }
.field { width: 100%; max-width: 20rem; }
.field-name { font-family: var(--font-code); }
.field .input { min-height: 2.25rem; padding: 0.3rem 0.6rem; background: var(--paper); }
.result { display: grid; gap: 0.5rem; width: 100%; margin-top: 0.5rem; padding-top: 0.9rem; border-top: 1px solid var(--jute); }
.reply { padding: 0.55rem 0.8rem; font: var(--fs-small) / 1.5 var(--font-code); overflow-wrap: anywhere; }
.reply[data-tone='good'] { border-color: var(--sage); }
.reply[data-tone='bad'] { border-color: var(--terracotta-ink); }
.kind { display: block; font-size: var(--fs-micro); font-weight: 500; color: var(--stone-ink); }

.monitor { display: grid; gap: 0.7rem; align-content: start; min-width: 0; padding: 1rem; border-left: 1px solid var(--jute); background: var(--wall); }
.log { display: grid; gap: 0.4rem; }
.entry { display: flex; flex-wrap: wrap; align-items: center; gap: 0.2rem 0.5rem; width: 100%; min-height: 2rem; padding: 0.3rem 0.6rem; border: 1px solid var(--jute); border-radius: var(--radius-small); background: var(--paper); font: var(--fs-small) / 1.4 var(--font-code); color: var(--char); text-align: left; cursor: pointer; }
.entry:hover { border-color: var(--jute-dark); }
.entry[aria-expanded='true'] { border-color: var(--terracotta-ink); }
.method { font-weight: 500; }
.chip { margin-left: auto; padding: 0.05rem 0.4rem; border: 1px solid var(--sage); border-radius: var(--radius-small); font: 500 var(--fs-micro) / 1.4 var(--font-text); color: var(--sage-ink); }
.chip[data-tone='bad'] { border-color: var(--terracotta-ink); color: var(--terracotta-ink); }
.exchange { display: grid; gap: 0.3rem; padding: 0.6rem 0.2rem 0.4rem; }
.exchange :deep(.code) { font-size: var(--fs-micro); }

.mark { display: inline-grid; flex: none; place-items: center; width: 1.4rem; height: 1.4rem; border: 1px solid var(--stone-ink); border-radius: 50%; color: var(--stone-ink); font: 600 var(--fs-micro) / 1 var(--font-text); }
.mark[data-state='done'] { border-color: var(--sage-ink); background: var(--sage-ink); color: var(--paper); }
.mark[data-state='now'] { border-color: var(--terracotta-ink); background: var(--terracotta-ink); color: var(--paper); box-shadow: 0 0 0 3px var(--paper), 0 0 0 4px var(--terracotta-ink); }

.guide { display: grid; gap: 1rem; }
h3 { font-size: var(--fs-h3); }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr)); gap: 1.5rem 2rem; }
.step { display: grid; gap: 0.6rem; align-content: start; padding-top: 0.9rem; border-top: 1px solid var(--jute); text-wrap: pretty; }
.step[data-state='now'] { border-top-color: var(--terracotta-ink); box-shadow: inset 0 1px 0 var(--terracotta-ink); }
.step-title { display: flex; align-items: center; gap: 0.6rem; margin: 0; font: 600 var(--fs-body) / 1.4 var(--font-text); }
.step .label { display: block; margin-bottom: 0.2rem; }
.step .sheet { padding: 0.6rem 0.9rem; font-size: var(--fs-small); }

@container (max-width: 46rem) {
    .body { grid-template-columns: minmax(0, 1fr); min-height: 0; }
    .main { grid-template-columns: minmax(0, 1fr); }
    .list { height: auto; border-right: 0; border-bottom: 1px solid var(--jute); }
    .monitor { border-left: 0; border-top: 1px solid var(--jute); }
}
</style>
