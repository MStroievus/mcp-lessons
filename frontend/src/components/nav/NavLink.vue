<script setup lang="ts">
import { computed } from 'vue';

import { placeOf } from '../../composables/hash-step.ts';
import { useContent } from '../../content/content.ts';
import type { Place } from '../../lessons/course.ts';
import { useVisitor } from '../../store/visitor-store.ts';
import { useWhere } from './where.ts';

const props = defineProps<{ place: Place }>();

const text = useContent().nav;
const visitor = useVisitor();
const where = useWhere();

const href = computed(() => `#${placeOf(props.place.step.id, props.place.section)}`);
const here = computed(() => {
    const { step, section } = props.place;
    if (step.id !== where.current) return undefined;
    if (section === undefined) return 'page';
    return section === where.section ? 'location' : undefined;
});
</script>

<template>
    <a v-if="visitor.isOpen(place.step.requires)" class="item marked" :href="href" :aria-current="here">
        {{ place.label }}
    </a>
    <span v-else class="item">
        {{ place.label }}
        <span class="lock">
            <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5.5 7 V5 a2.5 2.5 0 0 1 5 0 V7" /></svg>
            {{ text.locked }}
        </span>
    </span>
</template>

<style scoped>
a.item:hover { color: var(--char); }
.lock { display: inline-flex; align-items: center; gap: 0.3rem; font-size: var(--fs-micro); }
.lock svg { width: 0.8rem; height: 0.8rem; fill: none; stroke: currentColor; stroke-width: 1.5; }
.lock rect { fill: currentColor; }
</style>
