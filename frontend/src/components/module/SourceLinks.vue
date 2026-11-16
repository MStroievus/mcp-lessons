<script setup lang="ts">
import { useContent } from '../../content/content.ts';

defineProps<{ sources: { text: string; link: string }[] }>();
const { more } = useContent();
</script>

<template>
    <p class="sources">
        <span>{{ more }}:</span>
        <a v-for="source in sources" :key="source.link" :href="source.link" target="_blank" rel="noopener noreferrer">{{ source.text }}</a>
    </p>
</template>
