<script setup lang="ts">
import { computed, shallowRef } from 'vue';

import { useContent } from '../../content/content.ts';
import type { Shot } from '../../film/shot.ts';
import ChoiceChips from '../figure/ChoiceChips.vue';
import SceneStage from '../figure/SceneStage.vue';
import PartGlyph from '../PartGlyph.vue';

const content = useContent().qa;
const { pipeline } = content.sections.errors;

const current = shallowRef(pipeline.cases[0]);

const STATES = ['passed', 'stopped', 'skipped'] as const;
const state = (index: number) => STATES[Math.sign(index - current.value.stops) + 1];
const reached = computed(() => pipeline.stages.slice(0, current.value.stops + 1).map((_, index) => index));

function direct(shot: Shot) {
    const stopped = `stage-${current.value.stops}`;
    shot.absent('response', ...reached.value.map(index => `verdict-${index}`)).look('request');
    for (const index of reached.value) shot.look(`stage-${index}`).appear(`verdict-${index}`);
    shot.refuse(stopped).lookAway().bring('response', stopped);
}
</script>

<template>
    <figure class="pipeline">
        <ChoiceChips v-model="current" :label="pipeline.choose" :items="pipeline.cases" lang="en" />
        <SceneStage :take="current.chip" :direct="direct">
            <div class="flow">
                <p class="about">{{ current.about }}</p>

                <div class="side">
                    <span class="label">{{ content.examples.request }}</span>
                    <pre class="sheet code" lang="en" data-part="request">{{ current.request }}</pre>
                </div>

                <div class="side">
                    <span class="who"><PartGlyph kind="server" /><span class="label">{{ content.examples.server }}</span></span>
                    <ol class="stages">
                        <li v-for="(stage, index) in pipeline.stages" :key="stage" class="stage" :data-state="state(index)" :data-part="`stage-${index}`">
                            <span class="number">{{ index + 1 }}</span>
                            <span>{{ stage }}<span class="visually-hidden">: {{ pipeline.states[state(index)] }}</span></span>
                            <span v-if="index <= current.stops" class="verdict" :data-part="`verdict-${index}`"></span>
                        </li>
                    </ol>
                </div>

                <div class="side">
                    <span class="label">{{ content.examples.response }}</span>
                    <pre class="sheet code" lang="en" data-part="response">{{ current.response }}</pre>
                </div>
            </div>
        </SceneStage>
    </figure>
</template>

<style scoped>
.pipeline { display: grid; gap: 0.9rem; max-width: 60rem; }
.flow { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr) minmax(0, 1fr); gap: 1rem 1.5rem; align-items: start; }
.about { grid-column: 1 / -1; max-width: 62ch; min-height: 3.2em; text-wrap: pretty; }
.side { display: grid; gap: 0.5rem; align-content: start; min-width: 0; }
.code { padding: 0.6rem 0.8rem; font-size: var(--fs-micro); }

.stages { display: grid; gap: 0.3rem; }
.stage { position: relative; display: grid; grid-template-columns: 1.2rem minmax(0, 1fr); gap: 0.5rem; align-items: baseline; padding: 0.4rem 2.2rem 0.4rem 0.7rem; border: 1px solid var(--jute); border-radius: var(--radius-small); background: var(--paper); font-size: var(--fs-small); }
.number { font-size: var(--fs-body); }
.verdict { position: absolute; inset: -1px; display: flex; align-items: center; justify-content: flex-end; padding-right: 0.7rem; border: 1px solid transparent; border-radius: inherit; font-weight: 600; pointer-events: none; }
.stage[data-state='passed'] .verdict { color: var(--sage-ink); }
.stage[data-state='passed'] .verdict::before { content: '✓'; }
.stage[data-state='stopped'] .verdict { border-color: var(--terracotta-ink); border-width: 2px; color: var(--terracotta-ink); }
.stage[data-state='stopped'] .verdict::before { content: '✕'; }
.stage[data-state='skipped'] { border-style: dashed; background: none; color: var(--stone-ink); }

@container (max-width: 42rem) {
    .flow { grid-template-columns: minmax(0, 1fr); }
    .about { min-height: 0; }
}
</style>
