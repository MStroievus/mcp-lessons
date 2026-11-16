<script setup lang="ts">
import { provide } from 'vue';

import { useContent } from '../../content/content.ts';
import type { Branch } from '../../lessons/course.ts';
import NavList from './NavList.vue';
import { WHERE } from './where.ts';

const props = defineProps<{ tree: Branch[]; current: string; section?: string }>();
provide(WHERE, props);

const text = useContent().nav;
</script>

<template>
    <nav class="course-nav" :aria-label="text.label">
        <NavList class="tree" :branches="tree" />
    </nav>
</template>

<style scoped>
.course-nav { font-size: var(--fs-small); }
.course-nav :deep(.item) { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 0.6rem; min-height: 2.25rem; padding: 0.35rem 0; color: var(--stone-ink); text-decoration: none; }
.course-nav :deep(.item:focus-visible) { outline-offset: -2px; }

@media (max-width: 56rem) {
    .course-nav { font-size: var(--fs-body); }
    .course-nav :deep(.item) { min-height: 2.75rem; }
}
</style>
