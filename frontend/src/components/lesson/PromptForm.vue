<script setup lang="ts">
import { computed, useId } from 'vue';

import { useContent } from '../../content/content.ts';
import type { PromptDraft } from '../../core/prompt-task.ts';
import { LIMITS } from '../../core/sandbox-models.ts';
import { useTasks } from '../../store/task-bench.ts';
import { fieldChecked, fieldValue } from '../field.ts';
import IssueNotes from './IssueNotes.vue';

const bench = useTasks().prompt;
const text = useContent().tasks.prompt.draft;
const id = useId();
const draft = computed(() => bench.state.draft);

const update = (index: number, patch: Partial<PromptDraft['arguments'][number]>) =>
    bench.edit({ arguments: draft.value.arguments.map((argument, at) => (at === index ? { ...argument, ...patch } : argument)) });
</script>

<template>
    <form class="draft" :aria-labelledby="`${id}-title`" @submit.prevent>
        <h2 :id="`${id}-title`" class="block-title">{{ text.title }}</h2>

        <div class="field">
            <label class="label" :for="`${id}-name`">{{ text.name }}</label>
            <input
                :id="`${id}-name`"
                class="input"
                type="text"
                :value="draft.name"
                :maxlength="LIMITS.name"
                :aria-invalid="bench.errorsIn('name').length > 0"
                :aria-describedby="`${id}-name-notes`"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                @input="bench.edit({ name: fieldValue($event) })"
            />
            <IssueNotes :id="`${id}-name-notes`" :issues="bench.errorsIn('name')" />
        </div>

        <div class="field">
            <label class="label" :for="`${id}-about`">{{ text.about }}</label>
            <textarea :id="`${id}-about`" class="input" rows="2" :value="draft.description" :maxlength="LIMITS.description" @input="bench.edit({ description: fieldValue($event) })"></textarea>
        </div>

        <fieldset class="arguments">
            <legend class="label">{{ text.arguments }}</legend>
            <div v-for="(argument, index) in draft.arguments" :key="argument.name" class="argument" role="group" :aria-labelledby="`${id}-${argument.name}`">
                <code :id="`${id}-${argument.name}`" lang="en">{{ argument.name }}</code>
                <label class="required">
                    <input type="checkbox" :checked="argument.required" @change="update(index, { required: fieldChecked($event) })" />
                    {{ text.required }}
                </label>
                <input
                    class="input about"
                    type="text"
                    :value="argument.description"
                    :maxlength="LIMITS.description"
                    :aria-label="text.argumentAbout(argument.name)"
                    :placeholder="text.aboutPlaceholder"
                    autocomplete="off"
                    @input="update(index, { description: fieldValue($event) })"
                />
            </div>
        </fieldset>
    </form>
</template>

<style scoped>
.draft { display: grid; gap: 1.1rem; align-content: start; min-width: 0; }
.arguments { display: grid; gap: 0.9rem; min-width: 0; margin: 0; padding: 0; border: 0; }
.arguments legend { margin-bottom: 0.5rem; padding: 0; }
.argument { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 0.35rem 1rem; }
.argument code { font-weight: 500; }
.about { grid-column: 1 / -1; }
.required { display: flex; align-items: center; gap: 0.5rem; min-height: 2.25rem; font-size: var(--fs-small); cursor: pointer; }
.required input { width: 1.1rem; height: 1.1rem; accent-color: var(--terracotta-ink); }
</style>
