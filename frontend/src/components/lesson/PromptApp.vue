<script setup lang="ts">
import { computed, reactive, ref, useId, watch } from 'vue';

import { useContent } from '../../content/content.ts';
import { describe, type Launch, launch } from '../../core/prompt-task.ts';
import { useTasks } from '../../store/task-bench.ts';
import { fieldValue } from '../field.ts';

const bench = useTasks().prompt;
const text = useContent().tasks.prompt.app;
const id = useId();

const command = computed(() => (bench.registrable ? describe(bench.state.draft) : null));

const typed = reactive<Parameters<typeof launch>[1]>({});
const outcome = ref<Launch | null>(null);

watch(
    () => bench.state.draft,
    () => (outcome.value = null)
);

function type(name: keyof typeof typed, value: string) {
    typed[name] = value;
    if (outcome.value?.kind === 'blocked') outcome.value = null;
}

function run() {
    if (!command.value) return;
    outcome.value = launch(command.value, typed);
    if (outcome.value.kind !== 'blocked') bench.tried();
}

const TONES = { error: 'bad', hole: 'bad', complete: 'good' } as const;

const missing = computed(() => (outcome.value?.kind === 'blocked' ? outcome.value.missing : []));

const shown = computed(() => {
    const result = outcome.value;
    if (!result) return null;
    if (result.kind === 'blocked') return { words: text.blocked(result.missing.join(', ')) };
    return { label: result.kind === 'error' ? text.refused : text.message, reply: result.reply, words: text.outcomes[result.kind], tone: TONES[result.kind] };
});
</script>

<template>
    <div class="prompt-app">
        <div class="app" role="group" :aria-labelledby="`${id}-bar`">
            <p :id="`${id}-bar`" class="app-bar" lang="en">{{ text.server }} <span class="quiet">{{ text.action }}</span></p>
            <p v-if="!command" class="app-empty">{{ text.missing }}</p>

            <template v-else>
                <p class="command">
                    <code class="name" lang="en">/{{ command.name }}</code>
                    <span v-if="command.description" lang="en">{{ command.description }}</span>
                </p>

                <form class="args" novalidate @submit.prevent="run">
                    <div v-for="argument in command.arguments" :key="argument.name" class="field">
                        <label class="arg" :for="`${id}-${argument.name}`">
                            <span lang="en">{{ argument.name }}</span>
                            <span v-if="argument.required" class="star">* <span class="visually-hidden">{{ text.required }}</span></span>
                        </label>
                        <input
                            :id="`${id}-${argument.name}`"
                            class="input"
                            type="text"
                            :value="typed[argument.name] ?? ''"
                            :aria-required="argument.required"
                            :aria-invalid="missing.includes(argument.name)"
                            :aria-describedby="argument.description ? `${id}-${argument.name}-hint` : undefined"
                            autocomplete="off"
                            @input="type(argument.name, fieldValue($event))"
                        />
                        <span v-if="argument.description" :id="`${id}-${argument.name}-hint`" class="quiet" lang="en">{{ argument.description }}</span>
                    </div>
                    <button class="btn btn-small btn-main run" type="submit" lang="en">{{ text.run }}</button>
                </form>
            </template>
        </div>

        <div class="outcome" aria-live="polite">
            <template v-if="shown">
                <div v-if="shown.reply" class="sheet">
                    <span class="label">{{ shown.label }}</span>
                    <p class="reply" lang="en">{{ shown.reply }}</p>
                </div>
                <p class="state" :data-tone="shown.tone">{{ shown.words }}</p>
            </template>
        </div>
    </div>
</template>

<style scoped>
.prompt-app,
.outcome { display: grid; gap: 0.9rem; min-width: 0; }
.outcome:empty { display: none; }
.command { display: grid; gap: 0.15rem; padding: 0.7rem 1rem; border-top: 1px solid var(--jute); }
.name { font-weight: 500; overflow-wrap: anywhere; }
.args { display: grid; gap: 0.9rem; padding: 0.9rem 1rem 1rem; border-top: 1px solid var(--jute-dark); background: var(--wall); }
.arg { display: flex; gap: 0.35rem; font: 500 var(--fs-small) / 1.35 var(--font-code); }
.star { color: var(--terracotta-ink); }
.run { justify-self: start; }
.sheet { display: grid; gap: 0.3rem; }
.reply { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
