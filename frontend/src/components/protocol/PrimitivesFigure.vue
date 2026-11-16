<script setup lang="ts">
import { shallowRef } from 'vue';

import { type Content, useContent } from '../../content/content.ts';
import type { Shot } from '../../film/shot.ts';
import ChoiceChips from '../figure/ChoiceChips.vue';
import SceneStage from '../figure/SceneStage.vue';
import PartGlyph from '../PartGlyph.vue';

const props = defineProps<{
    figure: Content['protocol']['sections']['primitives']['figure'];
}>();
const words = useContent().protocol.exchange;

const scene = shallowRef(props.figure.scenes[0]);

function direct(shot: Shot) {
    const steps = scene.value.steps.map((step, index) => ({ said: `said-${index}`, sheet: step.text ? `sheet-${index}` : null }));
    shot.absent(...steps.flatMap(({ said, sheet }) => (sheet ? [said, sheet] : [said])));
    for (const { said, sheet } of steps) {
        shot.lay(said);
        if (sheet) shot.take(sheet, said);
        shot.hold();
    }
}
</script>

<template>
    <figure class="exchange">
        <ChoiceChips v-if="figure.scenes.length > 1" v-model="scene" :label="figure.choose" :items="figure.scenes" />
        <SceneStage :take="scene.id" :direct="direct">
            <p class="cast"><span class="label">{{ words.actors.server }}</span><code lang="en">{{ scene.server }}</code></p>
            <ol class="steps">
                <li v-for="(step, index) in scene.steps" :key="index" class="step">
                    <div class="said" :data-part="`said-${index}`">
                        <p class="route">
                            <span class="number">{{ index + 1 }}</span>
                            <span class="who"><PartGlyph :kind="step.from" />{{ words.actors[step.from] }}</span>
                            <span v-if="step.decides" class="tag">{{ words.decides }}</span>
                            <span class="arrow" aria-hidden="true">→</span>
                            <span class="who"><PartGlyph :kind="step.to" />{{ words.actors[step.to] }}</span>
                        </p>
                        <p class="note">{{ step.note }}</p>
                    </div>
                    <p v-if="step.text" class="sheet" lang="en" :data-part="`sheet-${index}`">
                        <span v-if="step.method" class="method">{{ step.method }}</span>{{ step.text }}
                    </p>
                </li>
            </ol>
        </SceneStage>
    </figure>
</template>

<style scoped>
.exchange { display: grid; gap: 0.9rem; max-width: 60rem; }
.cast { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.6rem; font-size: var(--fs-small); }

.steps { display: grid; margin-top: 0.75rem; }
.step { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 0.5rem 2rem; align-items: start; padding: 0.9rem 0; border-top: 1px solid var(--jute); }
.said { display: grid; gap: 0.4rem; min-width: 0; }
.route { display: flex; flex-wrap: wrap; align-items: center; gap: 0.3rem 0.6rem; font-weight: 600; }
.number { min-width: 1.1rem; font-size: var(--fs-h3); }
.who { gap: 0.4rem; }
.who .glyph { width: 1.5rem; height: 1.5rem; }
.arrow { color: var(--terracotta-ink); }
.tag { padding: 0.05rem 0.5rem; border-radius: var(--radius-small); background: var(--terracotta-ink); color: var(--paper); font: 600 var(--fs-micro) / 1.5 var(--font-text); }
.note { max-width: 46ch; font-size: var(--fs-small); color: var(--stone-ink); text-wrap: pretty; }

.sheet { justify-self: start; max-width: 100%; padding: 0.5rem 0.8rem; font: var(--fs-small) / 1.5 var(--font-code); white-space: pre-wrap; overflow-wrap: anywhere; }
.method { display: block; font-weight: 500; color: var(--terracotta-ink); }

@container (max-width: 40rem) {
    .step { grid-template-columns: minmax(0, 1fr); }
}
</style>
