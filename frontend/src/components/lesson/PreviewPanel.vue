<script setup lang="ts">
import { useId } from 'vue';

import JsonView from '../JsonView.vue';

defineProps<{
    title: string;
    empty: string;
    body: object | null;
    words: string;
    tone?: 'good' | 'bad' | 'busy';
}>();

const id = useId();
</script>

<template>
    <section class="preview" :aria-labelledby="`${id}-title`">
        <h2 :id="`${id}-title`" class="block-title">{{ title }}</h2>

        <div class="sheet">
            <JsonView v-if="body" :body="body" />
            <p v-else class="quiet">{{ empty }}</p>
        </div>

        <div class="verdict">
            <p class="state" role="status" :data-tone="tone">{{ words }}</p>
            <slot />
        </div>
    </section>
</template>

<style scoped>
.preview { display: grid; gap: 1rem; align-content: start; min-width: 0; }
.verdict { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
</style>
