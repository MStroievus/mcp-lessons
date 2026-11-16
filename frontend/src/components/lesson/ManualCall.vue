<script setup lang="ts">
import { computed, reactive, useId, useTemplateRef, watch } from 'vue';

import { useAnimation } from '../../composables/animation.ts';
import { DROP_PX } from '../../motion/gsap.ts';
import { useContent } from '../../content/content.ts';
import { callOutcome, callReply, type ParamType } from '../../core/sandbox-models.ts';
import type { SandboxStore } from '../../store/sandbox-store.ts';
import { fieldValue } from '../field.ts';
import JsonView from '../JsonView.vue';
import BlockedHint from './BlockedHint.vue';

const props = defineProps<{ sandbox: SandboxStore }>();

const content = useContent();
const text = content.sandbox.call;
const id = useId();
const outcome = useTemplateRef('outcome');
const { play } = useAnimation(outcome);

const typed = reactive<Record<number, string>>({});

const INPUTS: Record<ParamType, 'text' | 'number' | null> = { string: 'text', number: 'number', boolean: null };
const parameters = computed(() => props.sandbox.state.draft.parameters.map((parameter, index) => ({ parameter, index, input: INPUTS[parameter.type] })));
const call = computed(() => props.sandbox.state.call);
const report = computed(() => (call.value.status === 'done' ? call.value.report : null));
const reply = computed(() => (report.value ? callReply(report.value) : ''));

const TONES = { protocolError: 'bad', toolError: 'bad', ok: 'good' } as const;

const state = computed(() => {
    const current = call.value;
    if (current.status === 'idle') return null;
    if (current.status === 'failed') return { words: content.failed, tone: 'bad' };
    if (current.status !== 'done') return { words: text.states.running, tone: 'busy' };
    const outcome = callOutcome(current.report);
    return { words: text.states[outcome], tone: TONES[outcome] };
});

watch(
    () => parameters.value.map(({ parameter }) => parameter.type).join(),
    (types, before) => {
        if (!types.startsWith(before)) Object.keys(typed).forEach(key => delete typed[Number(key)]);
    }
);

watch(
    report,
    current => {
        if (!current) return;
        play((timeline, motion) =>
            timeline.from('.sheet', { y: -DROP_PX, opacity: 0, duration: motion.place, stagger: motion.place * 0.6, ease: 'power2.out', clearProps: 'transform,opacity' })
        );
    },
    { flush: 'post' }
);

const PARSE: Record<ParamType, (raw: string) => string | number | boolean> = {
    string: raw => raw,
    number: Number,
    boolean: raw => raw === 'true'
};

function submit() {
    const filled = parameters.value
        .filter(({ index }) => (typed[index] ?? '') !== '')
        .map(({ parameter, index }) => [parameter.name, PARSE[parameter.type](typed[index])] as const);
    void props.sandbox.call(Object.fromEntries(filled));
}
</script>

<template>
    <div class="try">
        <form class="try-form" @submit.prevent="submit">
            <div v-for="{ parameter, index, input } in parameters" :key="index" class="field">
                <component :is="input ? 'label' : 'span'" :id="`${id}-label-${index}`" class="label" :for="input ? `${id}-arg-${index}` : undefined">
                    {{ parameter.name || text.argument(index + 1) }}
                </component>

                <div v-if="!input" class="chits" role="group" :aria-labelledby="`${id}-label-${index}`">
                    <button
                        v-for="choice in ['true', 'false']"
                        :key="choice"
                        class="chit"
                        type="button"
                        :aria-pressed="typed[index] === choice"
                        @click="typed[index] = typed[index] === choice ? '' : choice"
                    >
                        {{ choice }}
                    </button>
                </div>
                <input
                    v-else
                    :id="`${id}-arg-${index}`"
                    class="input"
                    :type="input"
                    :value="typed[index] ?? ''"
                    autocomplete="off"
                    @input="typed[index] = fieldValue($event)"
                />
            </div>

            <div class="go">
                <button class="btn btn-main" type="submit" :disabled="sandbox.blocked !== null || call.status === 'running'">{{ text.button }}</button>
                <BlockedHint :sandbox="sandbox" />
            </div>
        </form>

        <p v-if="state" class="state" role="status" :data-tone="state.tone">{{ state.words }}</p>

        <div ref="outcome" class="outcome" aria-live="polite">
            <template v-if="report">
                <div class="sheet">
                    <span class="label">{{ text.request }}</span>
                    <JsonView :body="report.request" />
                </div>
                <div class="sheet">
                    <span class="label">{{ text.reply }}</span>
                    <p class="reply" lang="en">{{ reply }}</p>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.try { display: grid; gap: 1.1rem; align-content: start; min-width: 0; }
.try-form { display: grid; gap: 0.9rem; }
.go { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.outcome { display: grid; gap: 0.75rem; }
.outcome:empty { display: none; }
.sheet { display: grid; gap: 0.3rem; }
.reply { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
