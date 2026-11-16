<script setup lang="ts">
import { useId } from 'vue';

defineProps<{ title: string }>();

const id = useId();
</script>

<template>
    <section class="given sheet" :aria-labelledby="id">
        <h2 :id="id" class="label">{{ title }}</h2>
        <slot />
    </section>
</template>

<style scoped>
.given { display: grid; gap: 0.6rem; padding: 1rem 1.25rem; }
</style>
