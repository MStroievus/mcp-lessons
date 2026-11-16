<script setup lang="ts">
import { computed } from 'vue';

import { useContent } from '../../content/content.ts';
import { CONTENT } from '../../core/resource-task.ts';
import { useTasks } from '../../store/task-bench.ts';
import CheckPanel from '../lesson/CheckPanel.vue';
import GivenSheet from '../lesson/GivenSheet.vue';
import ResourceApp from '../lesson/ResourceApp.vue';
import ResourceForm from '../lesson/ResourceForm.vue';
import TaskFrame from '../lesson/TaskFrame.vue';

const bench = useTasks().resource;
const text = useContent().tasks.resource;

const GOALS = ['find', 'address', 'show'] as const;
const goals = computed(() => GOALS.map(goal => ({ ...text.goals[goal], met: bench.met(goal) })));
</script>

<template>
    <TaskFrame :task="text.task">
        <template #given>
            <GivenSheet :title="text.given">
                <pre class="code" lang="en">{{ CONTENT }}</pre>
            </GivenSheet>
        </template>
        <template #form><ResourceForm /></template>
        <template #check>
            <CheckPanel :title="text.check" :goals="goals" :hints="bench.hints"><ResourceApp /></CheckPanel>
        </template>
    </TaskFrame>
</template>

<style scoped>
.code { font-size: var(--fs-micro); }
</style>
