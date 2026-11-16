<script setup lang="ts">
import PartGlyph from '../../components/PartGlyph.vue';
import type { FilmText } from '../../content/content.ts';

export interface Param {
    name: string;
    about: string;
}

interface Arg {
    key: string;
    value: string;
}

interface Reply {
    text: string;
    error: boolean;
}

export interface ExchangeProps {
    text: FilmText;
    params: Param[];
    count: string;
    call?: Arg[];
    sent?: Arg[];
    earlier?: Reply;
    reply?: Reply;
    answer?: string;
}

defineProps<ExchangeProps>();
</script>

<template>
    <div class="exchange">
        <section class="side person">
            <header class="who">
                <PartGlyph kind="person" />
                <span class="label">{{ text.person }}</span>
            </header>
            <p class="sheet" data-part="question">
                {{ text.question.before }}<span data-part="question-city">{{ text.question.city }}</span>{{ text.question.after }}
            </p>
            <p v-if="answer" class="sheet stack" data-part="answer">
                <span class="room" aria-hidden="true">{{ answer }}</span>
                <span data-part="answer-text"></span>
            </p>
        </section>

        <section class="side model">
            <header class="who" data-part="model">
                <PartGlyph kind="model" />
                <span class="label">{{ text.model }}</span>
            </header>

            <article class="sheet card">
                <div class="row">
                    <span class="label">{{ text.fields.name }}</span>
                    <code class="name">{{ text.tool.name }}</code>
                </div>
                <div class="row" data-part="tool-about">
                    <span class="label">{{ text.fields.about }}</span>
                    <span>{{ text.tool.about }}</span>
                </div>
                <div class="row" data-part="tool-params">
                    <span class="label">{{ text.fields.params }}</span>
                    <ul class="params">
                        <li v-for="(param, index) in params" :key="param.name" :data-part="`tool-param-${index}`">
                            <code>{{ param.name }}</code>
                            <span class="quiet">{{ param.about }}</span>
                        </li>
                    </ul>
                </div>
            </article>

            <div v-if="call" class="stack">
                <p class="sheet code" data-part="call">
                    {{ text.tool.name }}
                    <span v-for="(arg, index) in call" :key="arg.key" class="arg" :data-part="`call-arg-${index}`">
                        {{ arg.key }}: <span :data-part="`call-value-${index}`">{{ arg.value }}</span>
                    </span>
                </p>
                <p class="sheet code" data-part="call-copy" aria-hidden="true">
                    {{ text.tool.name }}
                    <span v-for="arg in sent ?? call" :key="arg.key" class="arg">{{ arg.key }}: {{ arg.value }}</span>
                </p>
            </div>

            <div class="stack">
                <template v-for="(item, part) in { earlier, reply }" :key="part">
                    <p v-if="item" class="sheet reply" :data-tone="item.error ? 'bad' : 'good'" :data-part="part">
                        <span class="mark">{{ item.error ? `✕ ${text.errorMark}` : `✓ ${text.okMark}` }}</span>
                        {{ item.text }}
                    </p>
                </template>
            </div>
        </section>

        <section class="side server">
            <header class="who" data-part="server">
                <PartGlyph kind="server" />
                <span class="label">{{ text.server }}</span>
            </header>
            <p class="counter">
                <span class="label">{{ text.calls }}</span>
                <span class="count" data-part="count">{{ count }}</span>
            </p>
        </section>

        <span data-part="gaze"></span>
    </div>
</template>

<style scoped>
.exchange {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.5fr) minmax(0, 0.5fr);
    grid-template-areas: 'person model server';
    gap: 1.5rem;
    height: 100%;
    padding: 1.25rem 1.5rem;
}
.side { display: flex; flex-direction: column; gap: 0.55rem; align-items: flex-start; min-width: 0; }
.person { grid-area: person; }
.model { grid-area: model; }
.server { grid-area: server; align-items: center; }

.who { margin-bottom: 0.2rem; }
.server .who { flex-direction: column; gap: 0.3rem; }
.server .glyph { width: 3.5rem; height: 3.2rem; }

.counter { display: grid; justify-items: center; margin-top: 0.75rem; }
.count { font: italic 500 3.5rem / 1 var(--font-head); color: var(--terracotta-ink); }

.sheet { max-width: 100%; padding: 0.45rem 0.75rem; font-size: var(--fs-small); line-height: 1.4; overflow-wrap: anywhere; }
.stack { display: grid; max-width: 100%; }
.stack > * { grid-area: 1 / 1; align-self: start; }
.code { font-family: var(--font-code); white-space: normal; }
.arg { display: block; padding-left: 1rem; }
[data-part^='call-value'] { display: inline-block; }
.card { display: grid; gap: 0.3rem; width: 100%; }
.row { display: grid; gap: 0.05rem; }
.name { font-size: var(--fs-body); font-weight: 500; }
.params { display: grid; gap: 0.3rem; }
.params li { display: flex; flex-wrap: wrap; gap: 0 0.5rem; align-items: baseline; }
.params code { font-size: var(--fs-code); }
.room { visibility: hidden; }
.mark { display: block; font-weight: 600; }
.reply[data-tone='bad'] { border-color: var(--terracotta-ink); }
.reply[data-tone='bad'] .mark { color: var(--terracotta-ink); }
.reply[data-tone='good'] .mark { color: var(--sage-ink); }

@container (max-width: 40rem) {
    .exchange { grid-template-columns: minmax(0, 1fr) 4.5rem; grid-template-areas: 'person person' 'model server'; grid-template-rows: auto minmax(0, 1fr); gap: 0.75rem; padding: 0.75rem; }
    .side { gap: 0.45rem; }
    .sheet { padding: 0.4rem 0.6rem; }
    .server .glyph { width: 2.75rem; height: 2.5rem; }
    .server .label { letter-spacing: 0; }
    .count { font-size: 2.75rem; }
}
</style>
