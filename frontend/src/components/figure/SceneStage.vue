<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';

import { useScene } from '../../composables/scene.ts';
import type { Shot } from '../../film/shot.ts';
import ReplayButton from './ReplayButton.vue';

const props = defineProps<{
    direct: (shot: Shot) => void;
    take: string;
    label?: string;
}>();

const stage = useTemplateRef('stage');
const { replay, ended, reduced } = useScene(stage, shot => props.direct(shot));

watch(() => props.take, replay);
</script>

<template>
    <div class="scene">
        <div ref="stage" class="stage" :role="label ? 'img' : undefined" :aria-label="label">
            <div :key="take"><slot /></div>
            <span data-part="gaze"></span>
        </div>
        <ReplayButton v-if="!reduced" class="again" :data-ended="ended || undefined" @click="replay" />
    </div>
</template>

<style scoped>
.scene { display: grid; gap: 0.6rem; justify-items: end; }
.stage { position: relative; container-type: inline-size; width: 100%; padding: 1.25rem; border-radius: var(--radius); background: var(--wall); box-shadow: 0 0 0 1px var(--jute); }
.again:not([data-ended], :focus-visible) { opacity: 0; pointer-events: none; }

@media (max-width: 34rem) {
    .stage { padding: 0.75rem; }
}
</style>
