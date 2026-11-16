<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    message: { label: string; about: string; json: string };
    part?: string;
}>();

const MARKS = [
    { mark: 'id', line: /^ {2}"id":/ },
    { mark: 'kind', line: /^ {2}"(method|result|error)":/ }
];
const lines = computed(() =>
    props.message.json.split('\n').map(text => {
        const mark = MARKS.find(({ line }) => line.test(text))?.mark;
        return { text, mark, part: props.part && mark ? `${props.part}-${mark}` : undefined };
    })
);
</script>

<template>
    <figure class="message" :data-part="part">
        <figcaption>
            <span class="label">{{ message.label }}</span>
            {{ message.about }}
        </figcaption>
        <pre class="sheet code" lang="en"><span v-for="(line, index) in lines" :key="index" class="line" :data-mark="line.mark" :data-part="line.part">{{ line.text }}
</span></pre>
    </figure>
</template>

<style scoped>
.message { display: grid; gap: 0.5rem; align-content: start; min-width: 0; }
figcaption { display: grid; gap: 0.15rem; font-size: var(--fs-small); color: var(--stone-ink); }
.code { padding: 0.75rem 0; font-size: var(--fs-micro); }
.line { display: block; padding: 0 0.9rem 0 calc(0.9rem - 3px); border-left: 3px solid transparent; }
.line[data-mark] { background: var(--ceramic); font-weight: 500; }
.line[data-mark='id'] { border-left-color: var(--terracotta); }
.line[data-mark='kind'] { border-left-color: var(--sage); }
</style>
