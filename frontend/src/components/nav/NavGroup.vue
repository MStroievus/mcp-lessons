<script setup lang="ts">
import { ref, useId, watch } from 'vue';

import { useReducedMotion } from '../../composables/reduced-motion.ts';
import type { Branch, Group } from '../../lessons/course.ts';
import { gsap } from '../../motion/gsap.ts';
import { readMotion } from '../../theme/motion.ts';
import NavList from './NavList.vue';
import { useWhere } from './where.ts';

const props = defineProps<{ group: Group }>();

const where = useWhere();
const reduced = useReducedMotion();
const listId = useId();

const hold = (branches: Branch[], stepId: string): boolean =>
    branches.some(branch => ('children' in branch ? hold(branch.children, stepId) : branch.step.id === stepId));

const open = ref(false);
watch(
    () => where.current,
    current => {
        if (hold(props.group.children, current)) open.value = true;
    },
    { immediate: true }
);

function unfold(list: Element, done: () => void) {
    if (reduced.value) return done();
    const to = { height: 'auto', opacity: 1, duration: readMotion().place * 0.6, ease: 'power2.out', overwrite: true, clearProps: 'height,opacity,overflow', onComplete: done };
    gsap.fromTo(list, { height: 0, opacity: 0, overflow: 'hidden' }, to);
}

function fold(list: Element, done: () => void) {
    if (reduced.value) return done();
    gsap.to(list, { height: 0, opacity: 0, overflow: 'hidden', duration: readMotion().place * 0.4, ease: 'power2.in', overwrite: true, onComplete: done });
}
</script>

<template>
    <button class="item group" type="button" :aria-expanded="open" :aria-controls="listId" @click="open = !open">
        <span class="label">{{ group.caption }}</span>
        {{ group.label }}
    </button>
    <Transition :css="false" @enter="unfold" @leave="fold">
        <NavList v-if="open" :id="listId" class="nested" :branches="group.children" />
    </Transition>
</template>

<style scoped>
.group { position: relative; flex-direction: column; align-items: flex-start; gap: 0.1rem; width: 100%; padding-right: 1.1rem; border: 0; background: none; font: 500 1em / 1.3 var(--font-text); color: var(--char); text-align: left; cursor: pointer; }
.group::after { content: '›' / ''; position: absolute; top: 0.3rem; right: 0.15rem; font: 500 1rem / 1 var(--font-text); transition: rotate var(--dur-quick); }
.group[aria-expanded='true']::after { rotate: 90deg; }

.nested { margin: 0.2rem 0 0.6rem 0.2rem; padding-left: 0.9rem; border-left: 1px solid var(--jute); }

@media (prefers-reduced-motion: reduce) {
    .group::after { transition: none; }
}
</style>
