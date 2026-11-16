<script setup lang="ts">
import { ref, useId } from 'vue';

import type { Answer } from '../../content/content.ts';

defineProps<{
    label: string;
    topic?: string;
    answer: Answer;
}>();

const id = useId();
const open = ref(false);
</script>

<template>
    <div class="hint">
        <button class="toggle" type="button" :aria-expanded="open" :aria-controls="id" @click="open = !open">
            {{ label }}<span v-if="topic" class="visually-hidden">: {{ topic }}</span>
        </button>
        <div v-show="open" :id="id" class="answer">
            <p class="quiet">{{ answer.about }}</p>
            <dl class="sheet ready">
                <template v-for="field in answer.fields" :key="field.label">
                    <dt class="label">{{ field.label }}</dt>
                    <dd v-for="line in field.lines" :key="line.name ?? line.text">
                        <code v-if="line.name" lang="en">{{ line.name }}</code>
                        <span v-if="line.note" class="quiet">{{ line.note }}</span>
                        <span v-if="line.text" class="about" lang="en">{{ line.text }}</span>
                    </dd>
                </template>
            </dl>
        </div>
    </div>
</template>

<style scoped>
.hint { display: contents; }
.toggle { min-height: 2rem; padding: 0; border: 0; background: none; font: 500 var(--fs-small) / 1.2 var(--font-text); color: var(--terracotta-ink); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 0.22em; white-space: nowrap; cursor: pointer; }
.toggle:hover { color: var(--char); }
.toggle[aria-expanded='true'] { color: var(--char); }
.answer { display: grid; grid-column: 1 / -1; gap: 0.6rem; width: 100%; }
.ready { display: grid; gap: 0.35rem; margin: 0; }
.ready dt:not(:first-child) { margin-top: 0.6rem; }
.ready dd { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.1rem 0.75rem; margin: 0; overflow-wrap: anywhere; }
.ready code { font-weight: 500; }
.ready code + .quiet + .about { flex-basis: 100%; }
</style>
