<script setup lang="ts">
import { computed, useId } from 'vue';

import { useContent } from '../../content/content.ts';
import { LIMITS } from '../../core/sandbox-models.ts';
import { useTasks } from '../../store/task-bench.ts';
import { fieldValue } from '../field.ts';
import IssueNotes from './IssueNotes.vue';

const bench = useTasks().resource;
const text = useContent().tasks.resource.draft;
const id = useId();
const draft = computed(() => bench.state.draft);

const FIELDS = [
    { key: 'uri', limit: LIMITS.description },
    { key: 'name', limit: LIMITS.name },
    { key: 'description', limit: LIMITS.description, prose: true },
    { key: 'mimeType', limit: LIMITS.name }
] as const;
</script>

<template>
    <form class="draft" :aria-labelledby="`${id}-title`" @submit.prevent>
        <h2 :id="`${id}-title`" class="block-title">{{ text.title }}</h2>

        <div v-for="field in FIELDS" :key="field.key" class="field">
            <label class="label" :for="`${id}-${field.key}`">{{ text.fields[field.key] }}</label>
            <component
                :is="'prose' in field ? 'textarea' : 'input'"
                :id="`${id}-${field.key}`"
                class="input"
                :rows="'prose' in field ? 2 : undefined"
                :value="draft[field.key]"
                :maxlength="field.limit"
                :aria-invalid="bench.errorsIn(field.key).length > 0"
                :aria-describedby="`${id}-${field.key}-notes`"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                @input="bench.edit({ [field.key]: fieldValue($event) })"
            />
            <IssueNotes :id="`${id}-${field.key}-notes`" :issues="bench.errorsIn(field.key)" />
        </div>
    </form>
</template>

<style scoped>
.draft { display: grid; gap: 1.1rem; align-content: start; min-width: 0; }
</style>
