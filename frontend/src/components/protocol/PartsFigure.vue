<script setup lang="ts">
import { useContent } from '../../content/content.ts';
import PartGlyph from '../PartGlyph.vue';

const { parts } = useContent().protocol;
</script>

<template>
    <div class="parts" role="img" :aria-label="parts.label" :style="{ '--servers': parts.servers.length }">
        <div class="host">
            <p class="label">{{ parts.host }}</p>
            <span class="who"><PartGlyph kind="model" />{{ parts.model }}</span>
        </div>
        <div v-for="server in parts.servers" :key="server.name" class="link">
            <span class="client">{{ parts.client }}</span>
            <span class="wire"></span>
            <div class="server">
                <span class="who"><PartGlyph kind="server" />{{ server.name }}</span>
                <span class="quiet">{{ server.kind }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.parts { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); max-width: 52rem; }
.host { grid-row: 1 / span var(--servers); display: grid; gap: 0.9rem; align-content: center; justify-items: start; padding: 1.25rem 5rem 1.25rem 1.25rem; border-radius: var(--radius); background: var(--ceramic); }
.who { font: 500 var(--fs-h3) / 1 var(--font-head); }
.link { display: flex; align-items: center; min-width: 0; padding: 0.75rem 0; }
.client { flex: none; margin-left: -4rem; padding: 0.35rem 0.8rem; border: 1px solid var(--jute-dark); border-radius: var(--radius-small); background: var(--paper); font-weight: 500; }
.wire { flex: 1 1 1.5rem; min-width: 1.5rem; max-width: 9rem; height: 2px; background: var(--terracotta); }
.server { display: grid; gap: 0.1rem; padding-left: 0.75rem; }

@media (max-width: 34rem) {
    .parts { grid-template-columns: repeat(var(--servers), minmax(0, 1fr)); column-gap: 0.75rem; }
    .host { grid-row: 1; grid-column: 1 / -1; padding: 1rem 1rem 2rem; }
    .link { flex-direction: column; padding: 0; }
    .client { margin: -1.1rem 0 0; }
    .wire { flex: none; width: 2px; min-width: 0; height: 1.5rem; }
    .server { justify-items: center; padding: 0.5rem 0 0; text-align: center; }
}
</style>
