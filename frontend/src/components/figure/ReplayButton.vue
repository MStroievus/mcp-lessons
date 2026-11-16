<script setup lang="ts">
import { computed } from 'vue';

import { useContent } from '../../content/content.ts';

const props = defineProps<{ label?: string }>();
const content = useContent();
const name = computed(() => props.label ?? content.replay);
</script>

<template>
    <button class="again" type="button" :aria-label="name" :title="name">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" /><path d="M19.5 4.2v4.9h-4.9" /></svg>
    </button>
</template>

<style scoped>
.again { display: inline-grid; place-items: center; width: 2.25rem; height: 2.25rem; padding: 0; border: 1px solid var(--jute-dark); border-radius: var(--radius-small); background: var(--paper); color: var(--char); cursor: pointer; transition: background-color var(--dur-quick); }
.again:hover:not(:disabled) { background: var(--ceramic); }
.again:disabled { border-style: dashed; color: var(--stone-ink); cursor: not-allowed; }
svg { width: 1.15rem; height: 1.15rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

@media (prefers-reduced-motion: reduce) {
    .again { transition: none; }
}
</style>
