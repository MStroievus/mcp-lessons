<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue';

import { useAnimation } from '../../composables/animation.ts';
import { SHORTEST_WRITE_S, typing } from '../../motion/gsap.ts';

const props = defineProps<{ text: string }>();
const emit = defineEmits<{ done: [] }>();

const line = useTemplateRef('line');
const shown = ref(props.text);
const { play, reduced } = useAnimation(line);

onMounted(() => {
    if (reduced.value) return emit('done');
    shown.value = '';
    play((timeline, motion) => {
        const { target, steps } = typing(props.text, part => (shown.value = part));
        const duration = Math.min(motion.pause, Math.max(SHORTEST_WRITE_S, steps * motion.char));
        timeline.to(target, { step: steps, duration, ease: 'none', onComplete: () => emit('done') });
    });
});
</script>

<template>
    <span ref="line">
        <span aria-hidden="true">{{ shown }}</span>
        <span class="visually-hidden">{{ text }}</span>
    </span>
</template>
