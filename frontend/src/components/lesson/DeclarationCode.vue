<script setup lang="ts">
import { computed } from 'vue';

import type { LessonText } from '../../content/content.ts';
import { useVisitor } from '../../store/visitor-store.ts';
import ChoiceChips from '../figure/ChoiceChips.vue';

type Code = LessonText['code'];
type Line = Code['languages']['typescript']['lines'][number];

const props = defineProps<{ code: Code }>();
const visitor = useVisitor();

const languages = Object.entries(props.code.languages).map(([id, { label, lines }]) => ({ id, chip: label, lines }));
const language = computed({
    get: () => languages.find(candidate => candidate.id === visitor.state.codeLanguage) ?? languages[0],
    set: chosen => visitor.chooseCodeLanguage(chosen.id)
});

const groups = computed(() => {
    const groups: (Omit<Line, 'text'> & { lines: string[] })[] = [];
    for (const { text, tag, hidden } of language.value.lines) {
        const last = groups.at(-1);
        if (last && last.tag === tag) last.lines.push(text);
        else groups.push({ tag, hidden, lines: [text] });
    }
    return groups;
});

const mark = ({ tag, hidden }: Omit<Line, 'text'>) => (tag === undefined ? undefined : hidden ? 'hidden' : 'seen');
</script>

<template>
    <figure class="declaration">
        <ChoiceChips v-model="language" :label="code.choose" :items="languages" />
        <div class="sheet">
            <div v-for="(group, index) in groups" :key="language.id + index" class="group" :data-mark="mark(group)">
                <pre class="code" lang="en">{{ group.lines.join('\n') }}</pre>
                <span v-if="group.tag" class="tag">{{ group.tag }}</span>
            </div>
        </div>
        <figcaption class="legend">
            <span class="key" data-mark="seen">{{ code.seen }}</span>
            <span class="key" data-mark="hidden">{{ code.hidden }}</span>
        </figcaption>
    </figure>
</template>

<style scoped>
.declaration { display: grid; gap: 0.9rem; max-width: 56rem; }
.declaration :deep(.chit) { padding: 0.35rem 0.85rem; font-size: var(--fs-small); }
.sheet { display: grid; padding: 0.9rem 0; }
.group { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 0 1rem; padding: 0.1rem 1.1rem 0.1rem calc(1.1rem - 4px); border-left: 4px solid transparent; }

.group[data-mark='seen'] { border-left-color: var(--sage); background: var(--wall); }
.group[data-mark='hidden'] .code { color: var(--stone-ink); }

.tag,
.key { display: flex; align-items: baseline; gap: 0.4rem; font-size: var(--fs-small); font-weight: 600; white-space: nowrap; }
[data-mark='seen'] > .tag,
.key[data-mark='seen'] { color: var(--sage-ink); }
[data-mark='hidden'] > .tag,
.key[data-mark='hidden'] { color: var(--stone-ink); }
[data-mark='seen'] > .tag::before,
.key[data-mark='seen']::before { content: '●'; }
[data-mark='hidden'] > .tag::before,
.key[data-mark='hidden']::before { content: '○'; }
.legend { display: flex; flex-wrap: wrap; gap: 0.25rem 2rem; }

@media (max-width: 40rem) {
    .group { grid-template-columns: minmax(0, 1fr); }
    .tag { order: -1; }
    .code { font-size: var(--fs-micro); }
}
</style>
