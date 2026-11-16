<script setup lang="ts">
import { useReducedMotion } from '../../composables/reduced-motion.ts';
import { useContent } from '../../content/content.ts';
import type { Issue } from '../../core/sandbox-models.ts';
import { gsap } from '../../motion/gsap.ts';
import { readMotion } from '../../theme/motion.ts';

defineProps<{ issues: Issue[] }>();

const kinds = useContent().sandbox.issues;
const reduced = useReducedMotion();

function lay(note: Element, done: () => void) {
    if (reduced.value) return done();
    gsap.fromTo(note, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: readMotion().place * 0.6, ease: 'power2.out', clearProps: 'transform,opacity', onComplete: done });
}
</script>

<template>
    <TransitionGroup tag="ul" class="remarks" :css="false" @enter="lay">
        <li v-for="issue in issues" :key="issue.rule + issue.field + issue.message" class="remark" :data-level="issue.level">
            <strong>{{ kinds[issue.level] }}.</strong> {{ issue.message }}
        </li>
    </TransitionGroup>
</template>

<style scoped>
.remarks { display: grid; gap: 0.3rem; }
.remarks:empty { display: none; }
.remark { padding-left: 0.75rem; border-left: 2px solid var(--sage); font-size: var(--fs-small); line-height: 1.45; color: var(--sage-ink); }
.remark[data-level='error'] { border-left: 4px solid var(--terracotta-ink); color: var(--terracotta-ink); }
</style>
