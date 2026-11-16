<script setup lang="ts" generic="Topics extends Record<string, Topic>">
import { placeOf } from '../../composables/hash-step.ts';
import type { Topic } from '../../content/content.ts';
import SourceLinks from './SourceLinks.vue';

const props = defineProps<{
    step: string;
    topics: Topics;
    id: keyof Topics & string;
}>();
const topic: Topic = props.topics[props.id];
</script>

<template>
    <section class="part">
        <h2 :id="placeOf(step, id)" class="numbered" tabindex="-1"><span class="number">{{ topic.number }}</span>{{ topic.title }}</h2>
        <slot />
        <SourceLinks :sources="topic.sources" />
    </section>
</template>

<style scoped>
h2 { scroll-margin-top: 1.5rem; }
h2:focus { outline: none; }
</style>
