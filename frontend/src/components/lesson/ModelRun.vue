<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useContent } from '../../content/content.ts';
import type { RunStep, SandboxStore } from '../../store/sandbox-store.ts';
import BlockedHint from './BlockedHint.vue';
import TypedLine from './TypedLine.vue';

const props = defineProps<{ sandbox: SandboxStore; questions: string[] }>();

const content = useContent();
const text = content.sandbox.run;
const run = computed(() => props.sandbox.state.run);
const restored = ref(run.value.status === 'running' ? 0 : run.value.steps.length);
const written = ref(restored.value);
const shown = computed(() => run.value.steps.slice(0, written.value + 1));
const busy = computed(() => run.value.status === 'running' || written.value < run.value.steps.length);

watch(
    () => run.value.steps.length,
    count => {
        if (count === 0) written.value = restored.value = 0;
    }
);

const state = computed(() => {
    if (run.value.status === 'failed') return { words: content.failed, tone: 'bad' };
    if (run.value.status === 'stopped') return { words: text.stopped };
    return busy.value ? { words: text.working, tone: 'busy' } : null;
});

const rows = computed(() =>
    props.questions.map(question => {
        const pending = busy.value && question === run.value.question;
        return { question, pending, result: pending ? undefined : props.sandbox.state.results[question] };
    })
);
const solvedAtOnce = computed(() => rows.value.filter(({ question, pending }) => !pending && props.sandbox.solvedAtOnce(question)).length);

const language = (step: RunStep) => (step.type === 'thought' ? undefined : 'en');
const line = (step: RunStep) => (step.type === 'tool-call' ? `${step.name}(${JSON.stringify(step.arguments)})` : step.text);

function stop() {
    props.sandbox.stop();
    restored.value = written.value = run.value.steps.length;
}
</script>

<template>
    <div class="run">
        <ul class="questions" :aria-label="text.questions">
            <li v-for="{ question, result } in rows" :key="question" class="question">
                <button
                    class="chit ask"
                    type="button"
                    :aria-pressed="question === run.question"
                    :aria-disabled="busy"
                    :disabled="sandbox.blocked !== null"
                    @click="busy || sandbox.ask(question)"
                >
                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5 13 8l-9 5.5Z" /></svg>
                    <span lang="en">{{ question }}</span>
                </button>
                <span v-if="result" class="result">
                    <span class="quiet">{{ text.calls(result.calls) }}</span>
                    <span class="state" :data-tone="result.solved ? 'good' : 'bad'">{{ result.solved ? text.solved : text.unsolved }}</span>
                </span>
            </li>
        </ul>
        <BlockedHint :sandbox="sandbox" />
        <p class="total state" role="status" :data-tone="solvedAtOnce === questions.length ? 'good' : undefined">
            {{ text.total(solvedAtOnce, questions.length) }}
        </p>
        <p class="quiet">{{ text.note }}</p>

        <ol class="steps" aria-live="polite">
            <li v-for="(step, index) in shown" :key="run.question + index" class="step" :data-type="step.type">
                <span class="label">{{ text.steps[step.type] }}</span>
                <span v-if="step.type === 'tool-result' && step.isError" class="state" data-tone="bad">{{ text.toolError }}</span>
                <span v-if="index < restored" class="step-text" :lang="language(step)">{{ line(step) }}</span>
                <TypedLine v-else class="step-text" :lang="language(step)" :text="line(step)" @done="written = Math.max(written, index + 1)" />
            </li>
        </ol>

        <div v-if="state" class="progress">
            <p class="state" :role="state.tone === 'bad' ? 'alert' : 'status'" :data-tone="state.tone">{{ state.words }}</p>
            <button v-if="busy" class="btn btn-small" type="button" @click="stop">{{ run.status === 'running' ? text.stop : text.skip }}</button>
        </div>
    </div>
</template>

<style scoped>
.run { display: grid; gap: 1.1rem; align-content: start; min-width: 0; }
.questions { display: grid; gap: 0.6rem; }
.ask { display: inline-flex; align-items: center; gap: 0.6rem; }
.ask svg { flex: none; width: 0.8rem; height: 0.8rem; fill: var(--terracotta-ink); }
.ask:disabled svg { fill: var(--stone-dark); }
.question,
.result { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.25rem 0.9rem; }
.result .state { font-size: var(--fs-small); }
.total { font-size: var(--fs-small); }
.total:not([data-tone])::before { content: none; }
.steps { display: grid; gap: 0.9rem; }
.steps:empty { display: none; }
.step { display: grid; gap: 0.15rem; }
.step-text { overflow-wrap: anywhere; white-space: pre-wrap; }
.step[data-type='thought'] .step-text { padding-left: 0.9rem; border-left: 2px solid var(--terracotta); font: italic 500 var(--fs-lead) / 1.35 var(--font-head); color: var(--terracotta-ink); }
.step[data-type='tool-call'] .step-text,
.step[data-type='tool-result'] .step-text { font: var(--fs-code) / 1.55 var(--font-code); }
.step[data-type='answer'] .step-text { font-weight: 600; }
.progress { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
</style>
