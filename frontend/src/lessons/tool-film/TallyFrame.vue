<script setup lang="ts">
import type { FilmText } from '../../content/content.ts';

const props = defineProps<{ text: FilmText }>();

const sides = [
    { id: 'before', params: [props.text.city], tally: props.text.before, tone: 'bad' },
    { id: 'after', params: [props.text.city, props.text.country], tally: props.text.after, tone: 'good' }
];
</script>

<template>
    <div class="tally">
        <section v-for="side in sides" :key="side.id" class="side" :data-part="side.id">
            <article class="sheet">
                <span class="label">{{ text.fields.params }}</span>
                <ul class="params">
                    <li v-for="(param, index) in side.params" :key="param.name" :data-part="`${side.id}-param-${index}`">
                        <code>{{ param.name }}</code>
                        <span class="quiet">{{ param.about }}</span>
                    </li>
                </ul>
            </article>
            <p class="sum">
                <span class="count">{{ side.tally.count }}</span>
                {{ side.tally.unit }}
            </p>
            <p class="state" :data-tone="side.tone" :data-part="`${side.id}-outcome`">{{ side.tally.outcome }}</p>
        </section>

        <span data-part="gaze"></span>
    </div>
</template>

<style scoped>
.tally { position: relative; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2.5rem; align-content: center; height: 100%; padding: 1.5rem clamp(1.5rem, 7cqw, 5rem); }
.side { display: grid; grid-template-rows: 1fr; gap: 0.9rem; align-content: start; justify-items: start; }
.side + .side { padding-left: 2.5rem; border-left: 1px solid var(--jute); }
.sheet { display: grid; gap: 0.2rem; align-self: start; width: 100%; padding: 0.6rem 0.8rem; font-size: var(--fs-small); line-height: 1.4; }
.params { display: grid; gap: 0.45rem; }
.params li { display: flex; flex-wrap: wrap; gap: 0 0.5rem; align-items: baseline; }
.sum { display: flex; align-items: baseline; gap: 0.6rem; font: 500 var(--fs-h3) / 1 var(--font-head); }
.count { font: italic 500 5.5rem / 0.9 var(--font-head); color: var(--terracotta-ink); }
.state { font-size: var(--fs-lead); }

@container (max-width: 40rem) {
    .tally { grid-template-columns: minmax(0, 1fr); gap: 1.5rem; padding: 1rem; }
    .side + .side { padding: 1.5rem 0 0; border-left: 0; border-top: 1px solid var(--jute); }
    .count { font-size: 4.5rem; }
}
</style>
