<script setup lang="ts">
import { computed, ref, shallowRef, useId, watch } from 'vue';

import { useContent } from '../../content/content.ts';
import { resources, show, type Shown } from '../../core/resource-task.ts';
import { useTasks } from '../../store/task-bench.ts';

const bench = useTasks().resource;
const text = useContent().tasks.resource.app;
const id = useId();

const items = computed(() => resources(bench.registrable ? bench.state.draft : null));
const other = shallowRef<(typeof items.value)[number] | null>(null);
const current = computed(() => other.value ?? items.value.find(item => item.own));
const shown = computed(() => current.value && show(current.value));

const added = ref(false);
watch([current, () => bench.state.draft], () => (added.value = false));

function add() {
    added.value = true;
    if (current.value?.own) bench.tried();
}

const TONES: Record<Shown['as'], 'good' | 'bad' | undefined> = { table: 'good', text: undefined, none: 'bad' };
</script>

<template>
    <div class="resource-app">
        <div class="app" role="group" :aria-labelledby="`${id}-bar`">
            <p :id="`${id}-bar`" class="app-bar" lang="en">{{ text.server }} <span class="quiet">{{ text.list }}</span></p>
            <ul>
                <li v-for="item in items" :key="item.listed.uri">
                    <button class="app-row" type="button" :aria-pressed="item === current" @click="other = item.own ? null : item">
                        <span class="top">
                            <strong lang="en">{{ item.listed.name }}</strong>
                            <span v-if="item.own" class="own">{{ text.own }}</span>
                            <code class="type" lang="en">{{ item.listed.mimeType ?? text.untyped }}</code>
                        </span>
                        <span v-if="item.listed.description" lang="en">{{ item.listed.description }}</span>
                        <code class="uri" lang="en">{{ item.listed.uri }}</code>
                    </button>
                </li>
            </ul>
            <p v-if="!bench.registrable" class="app-empty">{{ text.missing }}</p>

            <div v-if="current && shown" class="view">
                <p class="label" lang="en">{{ text.preview }} · {{ current.listed.name }}</p>
                <div class="content">
                    <table v-if="shown.as === 'table'" lang="en">
                        <thead>
                            <tr><th v-for="(_, column) in shown.rows[0]" :key="column" scope="col">{{ column }}</th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in shown.rows" :key="row.startDate"><td v-for="(cell, column) in row" :key="column">{{ cell }}</td></tr>
                        </tbody>
                    </table>
                    <pre v-else-if="shown.as === 'text'" class="code" lang="en">{{ shown.text }}</pre>
                    <p v-else class="quiet" lang="en">{{ text.noPreview(current.listed.mimeType ?? '') }}</p>
                </div>
                <button class="btn btn-small btn-main" type="button" lang="en" @click="add">{{ text.add }}</button>
            </div>
        </div>

        <div class="outcome" aria-live="polite">
            <p v-if="added && shown" class="state" :data-tone="TONES[shown.as]">{{ text.shown[shown.as] }}</p>
        </div>
    </div>
</template>

<style scoped>
.resource-app { display: grid; gap: 0.9rem; min-width: 0; }
.outcome:empty { display: none; }
.top { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.2rem 0.6rem; }
.type { margin-left: auto; font-size: var(--fs-micro); color: var(--stone-ink); }
.uri { font-size: var(--fs-micro); color: var(--stone-ink); overflow-wrap: anywhere; }
.view { display: grid; gap: 0.6rem; justify-items: start; padding: 0.9rem 1rem 1rem; border-top: 1px solid var(--jute-dark); background: var(--wall); }
.content { width: 100%; overflow-x: auto; }
table { border-collapse: collapse; font: var(--fs-small) / 1.5 var(--font-code); }
th { padding: 0 1.5rem 0.3rem 0; border-bottom: 1px solid var(--jute); font-weight: 500; color: var(--stone-ink); text-align: left; }
td { padding: 0.25rem 1.5rem 0 0; }
</style>
