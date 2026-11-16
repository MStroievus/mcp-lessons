<script setup lang="ts">
import { useId } from 'vue';

import { type Answer, useContent } from '../../content/content.ts';
import type { Issue } from '../../core/sandbox-models.ts';
import AnswerHint from './AnswerHint.vue';
import IssueNotes from './IssueNotes.vue';

defineProps<{
    title: string;
    goals?: { label: string; met: boolean; hint: Answer }[];
    hints: Issue[];
    solution?: Answer;
}>();

const text = useContent().sandbox;
const id = useId();
</script>

<template>
    <section class="check" :aria-labelledby="`${id}-title`">
        <h2 :id="`${id}-title`" class="block-title">{{ title }}</h2>
        <slot />

        <ul v-if="goals" class="goals" :aria-label="text.goals">
            <li v-for="goal in goals" :key="goal.label" class="goal">
                <span class="state" role="status" :data-tone="goal.met ? 'good' : undefined">
                    {{ goal.label }}
                    <span class="visually-hidden">— {{ goal.met ? text.met : text.unmet }}</span>
                </span>
                <AnswerHint :label="text.hint" :topic="goal.label" :answer="goal.hint" />
            </li>
        </ul>

        <div v-if="hints.length" class="hints" role="status">
            <h3 class="label">{{ text.hints }}</h3>
            <IssueNotes :issues="hints" />
        </div>

        <div v-if="solution" class="solution">
            <AnswerHint :label="text.solution" :answer="solution" />
        </div>
    </section>
</template>

<style scoped>
.check { display: grid; gap: 1.1rem; align-content: start; min-width: 0; }
.goals { display: grid; gap: 0.6rem; padding-top: 1.1rem; border-top: 1px solid var(--jute); }
.goal { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: baseline; gap: 0.4rem 1rem; }
.goal .state:not([data-tone]) { font-weight: 400; }
.hints,
.solution { display: grid; gap: 0.6rem; justify-items: start; padding-top: 1.1rem; border-top: 1px solid var(--jute); }
</style>
