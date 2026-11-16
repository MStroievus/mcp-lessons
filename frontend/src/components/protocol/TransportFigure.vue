<script setup lang="ts">
import { computed, shallowRef } from 'vue';

import { useContent } from '../../content/content.ts';
import type { Shot } from '../../film/shot.ts';
import ChoiceChips from '../figure/ChoiceChips.vue';
import SceneStage from '../figure/SceneStage.vue';
import PartGlyph from '../PartGlyph.vue';

const { figure } = useContent().protocol.sections.transport;

const scene = shallowRef(figure.scenes[0]);
const ends = computed(() => ({ client: scene.value.client, server: scene.value.server }));

const GLYPHS = { client: 'model', server: 'server' } as const;

const part = (lane: number, message: number) => `message-${lane}-${message}`;

function direct(shot: Shot) {
    const { launch, lanes } = scene.value;
    shot.absent(...lanes.flatMap((lane, index) => lane.messages.map((_, message) => part(index, message))));
    if (launch) shot.absent('server').type('launch').lay('server');
    lanes.forEach((lane, index) => {
        lane.messages.forEach((_, message) => shot.take(part(index, message), lane.from));
        shot.pulse(lane.from === 'client' ? 'server' : 'client');
    });
}
</script>

<template>
    <figure class="transport">
        <ChoiceChips v-model="scene" :label="figure.choose" :items="figure.scenes" lang="en" />
        <SceneStage :take="scene.id" :direct="direct" :label="scene.label">
            <div class="wire" :data-shared="scene.machine ? '' : undefined">
                <p v-if="scene.machine" class="label machine">{{ scene.machine }}</p>

                <div v-for="(end, side) in ends" :key="side" class="end" :data-side="side" :data-part="side">
                    <span v-if="end.where" class="label">{{ end.where }}</span>
                    <span class="who"><PartGlyph :kind="GLYPHS[side]" /><span class="name" lang="en">{{ end.name }}</span></span>
                    <span class="quiet">{{ end.role }}</span>
                </div>

                <ol class="lanes">
                    <li v-if="scene.launch" class="lane" data-from="client">
                        <span class="pipe"><span class="label">{{ scene.launch.name }}</span></span>
                        <code class="sheet message" lang="en" data-part="launch">{{ scene.launch.command }}</code>
                    </li>
                    <li v-for="(lane, index) in scene.lanes" :key="lane.name" class="lane" :data-from="lane.from">
                        <span class="pipe">
                            <code lang="en">{{ lane.name }}</code>
                            <span class="quiet">{{ lane.note }}</span>
                        </span>
                        <code v-for="(message, order) in lane.messages" :key="order" class="sheet message" lang="en" :data-part="part(index, order)">{{ message }}</code>
                    </li>
                </ol>
            </div>
        </SceneStage>
    </figure>
</template>

<style scoped>
.transport { display: grid; gap: 0.9rem; max-width: 60rem; }

.wire { display: grid; grid-template-columns: minmax(0, 0.75fr) minmax(0, 2fr) minmax(0, 0.75fr); gap: 0.75rem 1.25rem; align-items: start; }
.wire[data-shared] { padding: 1rem; border-radius: var(--radius); background: var(--ceramic); }
.machine { grid-column: 1 / -1; }

.end { display: grid; gap: 0.3rem; justify-items: start; align-content: start; min-width: 0; grid-row: 2; }
.end[data-side='client'] { grid-column: 1; }
.end[data-side='server'] { grid-column: 3; }
.wire:not([data-shared]) .end { padding: 0.9rem 1rem; border-radius: var(--radius); background: var(--ceramic); }
.name { font: 500 var(--fs-h3) / 1.1 var(--font-head); overflow-wrap: anywhere; }

.lanes { grid-column: 2; grid-row: 2; display: grid; gap: 0.9rem; min-width: 0; }
.lane { display: grid; gap: 0.3rem; min-width: 0; }
.lane[data-from='client'] { justify-items: end; text-align: right; }
.lane[data-from='server'] { justify-items: start; }
.pipe { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 0.5rem; }
.pipe code { font-size: var(--fs-small); font-weight: 500; color: var(--terracotta-ink); }
.lane[data-from='client'] .pipe::after { content: '→'; color: var(--terracotta-ink); }
.lane[data-from='server'] .pipe::before { content: '←'; color: var(--terracotta-ink); }
.message { max-width: 100%; padding: 0.4rem 0.7rem; font-size: var(--fs-micro); line-height: 1.5; text-align: left; white-space: pre-wrap; overflow-wrap: anywhere; }

@container (max-width: 40rem) {
    .wire { grid-template-columns: minmax(0, 1fr); }
    .end[data-side],
    .lanes { grid-column: 1; grid-row: auto; }
    .end[data-side='client'] { order: 1; }
    .lanes { order: 2; }
    .end[data-side='server'] { order: 3; }
    .lane[data-from='client'] { justify-items: start; text-align: left; }
    .lane[data-from='client'] .pipe::after { content: '↓'; }
    .lane[data-from='server'] .pipe::before { content: '↑'; }
}
</style>
