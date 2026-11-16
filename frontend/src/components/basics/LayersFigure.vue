<script setup lang="ts">
import { useContent } from '../../content/content.ts';

const { layers } = useContent().basics;
</script>

<template>
    <figure class="layers">
        <ol>
            <li v-for="(layer, index) in layers.items" :key="layer.title" class="row">
                <span class="number" aria-hidden="true">{{ index + 1 }}</span>
                <div class="what">
                    <h3>{{ layer.title }}</h3>
                    <p>{{ layer.text }}</p>
                </div>
                <div class="example">
                    <p class="sheet">{{ layer.question }}</p>
                    <p class="state" data-tone="good">{{ layer.answer }}</p>
                </div>
            </li>
        </ol>
        <figcaption class="quiet">{{ layers.note }}</figcaption>
    </figure>
</template>

<style scoped>
.layers { display: grid; gap: 1rem; max-width: 56rem; }
.row { display: grid; grid-template-columns: 2.5rem minmax(0, 1fr) minmax(0, 1fr); gap: 0.5rem 1.5rem; align-items: start; padding: 1.1rem 0; border-top: 1px solid var(--jute); }
.number { font-size: var(--fs-h2); }
.what { display: grid; gap: 0.35rem; }
h3 { font-size: var(--fs-h3); }
.what p { max-width: 34ch; color: var(--stone-ink); text-wrap: pretty; }
.example { display: grid; gap: 0.5rem; justify-items: start; }
.sheet { padding: 0.6rem 0.9rem; }

@media (max-width: 40rem) {
    .row { grid-template-columns: 2rem minmax(0, 1fr); }
    .example { grid-column: 2; }
}
</style>
