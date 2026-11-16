<script setup lang="ts">
import { computed, useId, useTemplateRef } from 'vue';

import { useContent } from '../../content/content.ts';
import { emptyParameter, LIMITS, PARAM_TYPES, type ToolParameter } from '../../core/sandbox-models.ts';
import type { SandboxStore } from '../../store/sandbox-store.ts';
import { fieldChecked, fieldValue } from '../field.ts';
import IssueNotes from './IssueNotes.vue';

const props = defineProps<{
    sandbox: SandboxStore;
}>();

const text = useContent().sandbox.draft;
const id = useId();
const draft = computed(() => props.sandbox.state.draft);
const full = computed(() => draft.value.parameters.length >= LIMITS.parameters);

const setParameters = (parameters: ToolParameter[]) => props.sandbox.edit({ parameters });
const rename = (index: number, name: string) => update(index, { name: name.toLowerCase() });
const retype = (index: number, type: string) => update(index, { type: PARAM_TYPES.find(known => known === type) ?? draft.value.parameters[index].type });
const update = (index: number, patch: Partial<ToolParameter>) =>
    setParameters(draft.value.parameters.map((parameter, at) => (at === index ? { ...parameter, ...patch } : parameter)));

const add = useTemplateRef('add');
function remove(index: number) {
    setParameters(draft.value.parameters.filter((_, at) => at !== index));
    add.value?.focus();
}

const hasError = (field: string) => props.sandbox.errorsIn(field).length > 0;
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
                :aria-invalid="hasError('name')"
                :aria-describedby="`${id}-name-notes`"
                autocomplete="off"
                spellcheck="false"
                @input="sandbox.edit({ name: fieldValue($event) })"
            />
            <IssueNotes :id="`${id}-name-notes`" :issues="sandbox.errorsIn('name')" />
        </div>

        <div class="field">
            <label class="label" :for="`${id}-about`">{{ text.about }}</label>
            <textarea
                :id="`${id}-about`"
                class="input"
                rows="3"
                :value="draft.description"
                :maxlength="LIMITS.description"
                :aria-invalid="hasError('description')"
                :aria-describedby="`${id}-about-notes`"
                @input="sandbox.edit({ description: fieldValue($event) })"
            ></textarea>
            <IssueNotes :id="`${id}-about-notes`" :issues="sandbox.errorsIn('description')" />
        </div>

        <fieldset class="parameters">
            <legend class="label">{{ text.parameters }}</legend>

            <div v-for="(parameter, index) in draft.parameters" :key="index" class="parameter">
                <div class="parameter-top">
                    <input
                        class="input"
                        type="text"
                        :value="parameter.name"
                        :maxlength="LIMITS.name"
                        :aria-label="text.parameterName(index + 1)"
                        :aria-invalid="hasError(`parameters.${index}.name`)"
                        :aria-describedby="`${id}-parameter-${index}-notes`"
                        :placeholder="text.namePlaceholder"
                        autocomplete="off"
                        autocapitalize="off"
                        spellcheck="false"
                        @input="rename(index, fieldValue($event))"
                    />
                    <select
                        class="input parameter-type"
                        :value="parameter.type"
                        :aria-label="text.parameterType(index + 1)"
                        :aria-describedby="`${id}-parameter-${index}-notes`"
                        @change="retype(index, fieldValue($event))"
                    >
                        <option v-for="type in PARAM_TYPES" :key="type" :value="type">{{ type }}</option>
                    </select>
                </div>
                <input
                    class="input"
                    type="text"
                    :value="parameter.description"
                    :maxlength="LIMITS.description"
                    :aria-label="text.parameterAbout(index + 1)"
                    :aria-invalid="hasError(`parameters.${index}.description`)"
                    :aria-describedby="`${id}-parameter-${index}-notes`"
                    :placeholder="text.aboutPlaceholder"
                    autocomplete="off"
                    @input="update(index, { description: fieldValue($event) })"
                />
                <div class="parameter-bottom">
                    <label class="required">
                        <input
                            type="checkbox"
                            :checked="parameter.required"
                            @change="update(index, { required: fieldChecked($event) })"
                        />
                        {{ text.required }}
                    </label>
                    <button class="btn btn-small" type="button" :aria-label="text.removeLabel(index + 1)" @click="remove(index)">
                        {{ text.remove }}
                    </button>
                </div>
                <IssueNotes :id="`${id}-parameter-${index}-notes`" :issues="sandbox.errorsIn(`parameters.${index}.`)" />
            </div>

            <button ref="add" class="btn btn-small add" type="button" :disabled="full" @click="setParameters([...draft.parameters, emptyParameter()])">{{ text.add }}</button>
        </fieldset>
    </form>
</template>

<style scoped>
.draft { display: grid; gap: 1.1rem; align-content: start; min-width: 0; }
.parameters { display: grid; gap: 0.8rem; min-width: 0; margin: 0; padding: 0; border: 0; }
.parameters legend { margin-bottom: 0.5rem; padding: 0; }
.parameter { display: grid; gap: 0.5rem; padding-bottom: 0.9rem; border-bottom: 1px solid var(--jute); }
.parameter-top { display: flex; gap: 0.5rem; }
.parameter-top > :first-child { flex: 1; min-width: 0; }
.parameter-type { width: auto; cursor: pointer; }
.parameter-bottom { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem; }
.required { display: flex; align-items: center; gap: 0.5rem; min-height: 2.25rem; font-size: var(--fs-small); cursor: pointer; }
.required input { width: 1.1rem; height: 1.1rem; accent-color: var(--terracotta-ink); }
.add { justify-self: start; }
</style>
