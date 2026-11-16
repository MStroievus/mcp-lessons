<script setup lang="ts">
import { useContent } from '../../content/content.ts';

const { ids } = useContent().protocol.sections.messages;

const pair = (id: string) => ids.requests.findIndex(request => request.id === id);

const lanes = [
    { title: ids.sent, items: ids.requests },
    { title: ids.received, items: ids.replies }
];
</script>

<template>
    <figure class="ids" :aria-label="ids.label">
        <div v-for="lane in lanes" :key="lane.title" class="lane">
            <span class="label">{{ lane.title }}</span>
            <ol>
                <li v-for="item in lane.items" :key="item.id" class="sheet" :data-pair="pair(item.id)">
                    <span class="id">id {{ item.id }}</span>
                    <code lang="en">{{ item.text }}</code>
                </li>
            </ol>
        </div>
    </figure>
</template>

<style scoped>
.ids { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1.5rem 2.5rem; max-width: 60rem; }
.lane { display: grid; gap: 0.6rem; align-content: start; }
ol { display: grid; gap: 0.6rem; }
.sheet { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0 0.75rem; align-items: baseline; padding: 0.6rem 0.9rem; border-left-width: 4px; }
.sheet[data-pair='0'] { border-left-color: var(--terracotta); }
.sheet[data-pair='1'] { border-left-color: var(--sage); }
.id { font: 500 var(--fs-small) / 1.4 var(--font-code); white-space: nowrap; }
[data-pair='0'] .id { color: var(--terracotta-ink); }
[data-pair='1'] .id { color: var(--sage-ink); }
code { font-size: var(--fs-code); line-height: 1.5; overflow-wrap: anywhere; }
</style>
