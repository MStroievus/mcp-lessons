<script setup lang="ts">
import { type LessonText, useContent } from '../../content/content.ts';

defineProps<{ items: LessonText['practices']['items'] }>();
const labels = useContent().practice;

const SIDES = [
    { id: 'avoid', tone: 'bad' },
    { id: 'prefer', tone: 'good' }
] as const;
</script>

<template>
    <ul class="practices">
        <li v-for="item in items" :key="item.title" v-place class="practice">
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
            <dl class="pair sheet">
                <div v-for="side in SIDES" :key="side.id" class="state" :data-tone="side.tone">
                    <dt class="visually-hidden">{{ labels[side.id] }}</dt>
                    <dd><code lang="en">{{ item[side.id] }}</code></dd>
                </div>
            </dl>
        </li>
    </ul>
</template>

<style scoped>
.practices { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr)); gap: 2.25rem 2.5rem; max-width: 60rem; }
.practice { display: grid; gap: 0.6rem; align-content: start; padding-top: 1rem; border-top: 1px solid var(--jute); }
h3 { font-size: var(--fs-h3); text-wrap: balance; }
p { text-wrap: pretty; }
.pair { display: grid; gap: 0.5rem; margin-top: 0.25rem; padding: 0.7rem 0.9rem; }
.pair dd { min-width: 0; margin: 0; }
.pair code { font-size: var(--fs-code); font-weight: 400; line-height: 1.5; overflow-wrap: anywhere; }
</style>
