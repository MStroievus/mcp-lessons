<script setup lang="ts">
import { type LessonText, useContent } from '../../content/content.ts';

defineProps<{ cases: LessonText['cases']['items']; labels: LessonText['cases']['labels'] }>();
const content = useContent();

const SIDES = [
    { id: 'before', tone: 'bad' },
    { id: 'after', tone: 'good' }
] as const;
</script>

<template>
    <ol class="cases">
        <li v-for="(item, index) in cases" :key="item.title" v-place class="case">
            <span class="number" aria-hidden="true">{{ index + 1 }}</span>
            <div class="body">
                <h3>{{ item.title }}</h3>
                <p class="check sheet"><span class="label">{{ labels.check }}</span>{{ item.check }}</p>
                <p class="story">{{ item.story }}</p>

                <div class="pair">
                    <dl v-for="side in SIDES" :key="side.id" class="side">
                        <dt class="label">{{ labels[side.id] }}</dt>
                        <dd>
                            <span class="quiet">{{ labels.described }}</span>
                            <code lang="en">{{ item[side.id].described }}</code>
                        </dd>
                        <dd>
                            <span class="quiet">{{ labels.called }}</span>
                            <code lang="en">{{ item[side.id].called }}</code>
                        </dd>
                        <dd class="state" :data-tone="side.tone">{{ item[side.id].outcome }}</dd>
                    </dl>
                </div>

                <a :href="item.link" target="_blank" rel="noopener noreferrer">{{ content.more }}<span class="visually-hidden">: {{ item.title }}</span></a>
            </div>
        </li>
    </ol>
</template>

<style scoped>
.cases { display: grid; gap: 2.75rem; max-width: 60rem; }
.case { display: grid; grid-template-columns: 2.5rem minmax(0, 1fr); gap: 0 0.75rem; padding-top: 1.25rem; border-top: 1px solid var(--jute); }
.number { font-size: var(--fs-h2); }
.body { display: grid; gap: 0.75rem; justify-items: start; }
h3 { font-size: var(--fs-h3); }
.story { max-width: 62ch; text-wrap: pretty; }
.check { padding: 0.6rem 0.9rem; }
.check .label { display: block; margin-bottom: 0.2rem; }

.pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr)); gap: 1rem; width: 100%; margin: 0.25rem 0; }
.side { display: grid; gap: 0.5rem; align-content: start; padding: 0.85rem 1rem; border: 1px solid var(--jute); border-radius: var(--radius-small); background: var(--paper); }
.side dd { display: grid; gap: 0.1rem; margin: 0; }
.side code { font-size: var(--fs-code); line-height: 1.5; overflow-wrap: anywhere; }
.side .state { display: flex; gap: 0.5rem; font-size: var(--fs-small); }
a { font-size: var(--fs-small); }

@media (max-width: 40rem) {
    .case { grid-template-columns: minmax(0, 1fr); }
    .number { display: none; }
}
</style>
