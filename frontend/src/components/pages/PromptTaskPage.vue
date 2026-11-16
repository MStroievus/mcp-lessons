<script setup lang="ts">
import { computed } from 'vue';

import { useContent } from '../../content/content.ts';
import { TEMPLATE } from '../../core/prompt-task.ts';
import { useTasks } from '../../store/task-bench.ts';
import CheckPanel from '../lesson/CheckPanel.vue';
import GivenSheet from '../lesson/GivenSheet.vue';
import PromptApp from '../lesson/PromptApp.vue';
import PromptForm from '../lesson/PromptForm.vue';
import TaskFrame from '../lesson/TaskFrame.vue';

const bench = useTasks().prompt;
const text = useContent().tasks.prompt;

const GOALS = ['find', 'fill', 'text'] as const;
const goals = computed(() => GOALS.map(goal => ({ ...text.goals[goal], met: bench.met(goal) })));
</script>

<template>
    <TaskFrame :task="text.task">
        <template #given>
            <GivenSheet :title="text.given">
                <pre class="code" lang="en">{{ TEMPLATE }}</pre>
                <p class="quiet">{{ text.dateRule }}</p>
            </GivenSheet>
        </template>
        <template #form><PromptForm /></template>
        <template #check>
            <CheckPanel :title="text.check" :goals="goals" :hints="bench.hints"><PromptApp /></CheckPanel>
        </template>
    </TaskFrame>
</template>

<style scoped>
.code { font-size: var(--fs-micro); }
</style>
