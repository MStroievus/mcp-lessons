<script setup lang="ts">
import { computed, shallowRef } from 'vue';

import { useContent } from '../../content/content.ts';
import { useLessons } from '../../store/lesson-store.ts';
import ChoiceChips from '../figure/ChoiceChips.vue';
import CheckPanel from '../lesson/CheckPanel.vue';
import DraftForm from '../lesson/DraftForm.vue';
import GivenSheet from '../lesson/GivenSheet.vue';
import ManualCall from '../lesson/ManualCall.vue';
import ModelRun from '../lesson/ModelRun.vue';
import PreviewPanel from '../lesson/PreviewPanel.vue';
import TaskFrame from '../lesson/TaskFrame.vue';

const props = defineProps<{ lessonId: string }>();
const lessons = useLessons();

const content = useContent();
const text = content.sandbox;
const sandbox = computed(() => lessons.sandbox(props.lessonId));
const info = computed(() => lessons.info(props.lessonId));

const status = computed(() => sandbox.value.blocked ?? 'ready');
const TONES = { idle: undefined, checking: 'busy', failed: 'bad', errors: 'bad', ready: 'good' } as const;

const [MODEL, CALL] = [{ chip: text.modes.model }, { chip: text.modes.call }];
const mode = shallowRef(MODEL);
const done = computed(() => (info.value?.questions ?? []).every(question => sandbox.value.solvedAtOnce(question)));
</script>

<template>
    <TaskFrame v-if="info" :task="[text.task]">
        <template #given>
            <GivenSheet :title="text.given">
                <ul class="params">
                    <li v-for="param in info.handler" :key="param.name">
                        <code>{{ param.name }}</code>
                        <span class="quiet">{{ param.type }}, {{ param.required ? text.required : text.optional }}</span>
                        <span>{{ text.handler[param.name] }}</span>
                    </li>
                </ul>
            </GivenSheet>
        </template>
        <template #form><DraftForm :sandbox="sandbox" /></template>
        <template #preview>
            <PreviewPanel :title="text.preview.title" :empty="text.preview.empty" :body="sandbox.state.validation.tool" :words="text.preview[status]" :tone="TONES[status]">
                <button v-if="status === 'failed'" class="btn btn-small" type="button" @click="sandbox.retry()">{{ content.retry }}</button>
            </PreviewPanel>
        </template>
        <template #check>
            <CheckPanel :title="text.check" :hints="sandbox.hints" :solution="done ? undefined : text.solved">
                <ChoiceChips v-model="mode" :label="text.modes.choose" :items="[MODEL, CALL]" />
                <KeepAlive>
                    <ModelRun v-if="mode === MODEL" :sandbox="sandbox" :questions="info.questions" />
                    <ManualCall v-else :sandbox="sandbox" />
                </KeepAlive>
            </CheckPanel>
        </template>
    </TaskFrame>
</template>

<style scoped>
.params { display: grid; gap: 0.5rem; }
.params li { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.1rem 0.75rem; }
.params code { font-weight: 500; }
</style>
