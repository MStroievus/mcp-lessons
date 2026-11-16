<script setup lang="ts">
defineProps<{ kind: 'person' | 'host' | 'model' | 'server' }>();
</script>

<template>
    <svg v-if="kind === 'person'" class="glyph glyph-person" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="12" r="8" />
        <path d="M4 40 Q4 23 20 23 Q36 23 36 40 Z" />
    </svg>
    <svg v-else-if="kind === 'host'" class="glyph glyph-host" viewBox="0 0 40 40" aria-hidden="true">
        <rect class="window" x="3" y="5" width="34" height="30" rx="7" />
        <rect class="inside" x="13" y="13" width="14" height="14" rx="4.5" />
    </svg>
    <svg v-else-if="kind === 'model'" class="glyph glyph-model" viewBox="0 0 40 40" aria-hidden="true">
        <rect x="5" y="5" width="30" height="30" rx="9" />
    </svg>
    <svg v-else class="glyph glyph-server" viewBox="0 0 48 44" aria-hidden="true">
        <rect class="box" x="3" y="6" width="42" height="35" rx="6" />
        <path class="lid" d="M3 17 H45" />
        <circle class="lock" cx="24" cy="27" r="3.4" />
        <path class="lock" d="M22.4 28 L21.4 35 H26.6 L25.6 28 Z" />
    </svg>
</template>

<style scoped>
.glyph { flex: none; width: 2.25rem; height: 2.25rem; }
.glyph-person { fill: var(--stone-dark); }
.glyph-model,
.inside { fill: var(--terracotta); }
.window { fill: var(--ceramic); stroke: var(--stone-dark); stroke-width: 1.5; }
.glyph-server { width: 2.45rem; }
.box { fill: var(--sage); }
.lid { fill: none; stroke: var(--sage-ink); stroke-width: 1.5; }
.lock { fill: var(--sage-ink); }
</style>
