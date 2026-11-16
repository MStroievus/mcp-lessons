<script setup lang="ts">
import { computed, shallowRef } from 'vue';

import { useContent } from '../../content/content.ts';
import type { Shot } from '../../film/shot.ts';
import ChoiceChips from '../figure/ChoiceChips.vue';
import SceneStage from '../figure/SceneStage.vue';
import PartGlyph from '../PartGlyph.vue';

interface Answer {
    note: string;
    mark: string;
    text: string;
}

interface Check {
    chip: string;
    title: string;
    request: { method: string; line?: string; focus?: string };
    rule?: string;
    fits?: boolean;
    good: Answer;
    bad: Answer;
}

const props = defineProps<{
    checks: Check[];
    spec?: { label: string; title: string; rows: { id: string; name: string; rule: string }[] };
}>();
const labels = useContent().qa.examples;

const check = shallowRef(props.checks[0]);

const line = computed(() => {
    const { line = '', focus = '' } = check.value.request;
    const at = line.indexOf(focus);
    return { before: line.slice(0, at), focus, after: line.slice(at + focus.length) };
});

const SIDES = ['good', 'bad'] as const;

function direct(shot: Shot) {
    const { rule, fits } = check.value;
    const checked = rule ? `rule-${rule}` : 'spec';
    shot.absent(...SIDES).look(line.value.focus ? 'focus' : 'request');
    if (props.spec) {
        shot.look(checked);
        if (fits) shot.pulse(checked);
        else shot.refuse(checked);
    }
    shot.lookAway().bring('good', 'server').hold().bring('bad', 'server');
}
</script>

<template>
    <div class="bench">
        <ChoiceChips v-model="check" :label="labels.choose" :items="checks" />
        <SceneStage :take="check.chip" :direct="direct">
            <div class="probe">
                <h4>{{ check.title }}</h4>

                <div class="sent">
                    <span class="label">{{ labels.request }}</span>
                    <p class="sheet call" lang="en" data-part="request">
                        <span class="method">{{ check.request.method }}</span>
                        {{ line.before }}<span v-if="line.focus" class="focus" data-part="focus">{{ line.focus }}</span>{{ line.after }}
                    </p>
                </div>

                <div class="checked">
                    <span class="who" data-part="server"><PartGlyph kind="server" /><span class="label">{{ labels.server }}</span></span>
                    <div v-if="spec" class="sheet spec" data-part="spec">
                        <span class="label">{{ spec.label }}</span>
                        <code class="name" lang="en">{{ spec.title }}</code>
                        <ul lang="en">
                            <li v-for="row in spec.rows" :key="row.id" :data-part="`rule-${row.id}`">
                                <code>{{ row.name }}</code>
                                <span class="quiet">{{ row.rule }}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div v-for="side in SIDES" :key="side" class="answer" :data-part="side">
                    <span class="state" :data-tone="side">{{ labels[side] }}</span>
                    <p class="note">{{ check[side].note }}</p>
                    <p class="sheet reply" lang="en" :data-tone="side">
                        <code class="mark">{{ check[side].mark }}</code>
                        {{ check[side].text }}
                    </p>
                </div>
            </div>
        </SceneStage>
    </div>
</template>

<style scoped>
.bench { display: grid; gap: 0.9rem; max-width: 60rem; }
.probe { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.1rem 1.75rem; align-items: start; }
h4 { grid-column: 1 / -1; margin: 0; font: 600 var(--fs-body) / 1.4 var(--font-text); text-wrap: balance; }

.sent,
.checked,
.answer { display: grid; gap: 0.4rem; align-content: start; justify-items: start; min-width: 0; }
.sheet { max-width: 100%; padding: 0.55rem 0.8rem; font-size: var(--fs-small); line-height: 1.5; overflow-wrap: anywhere; }
.call { font-family: var(--font-code); }
.method { display: block; font-weight: 500; color: var(--terracotta-ink); }
.focus { display: inline-block; font-weight: 500; color: var(--terracotta-ink); }

.spec { display: grid; gap: 0.3rem; width: 100%; }
.spec .name { font-size: var(--fs-body); font-weight: 500; }
.spec ul { display: grid; gap: 0.2rem; }
.spec li { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 0.6rem; }
.spec li code { font-size: var(--fs-code); }

.answer { padding-top: 0.9rem; border-top: 1px solid var(--jute); }
.state { font-size: var(--fs-small); }
.note { min-height: 2.8em; font-size: var(--fs-small); color: var(--stone-ink); text-wrap: pretty; }
.reply { width: 100%; }
.reply[data-tone='good'] { border-color: var(--sage); }
.reply[data-tone='bad'] { border-color: var(--terracotta-ink); }
.mark { display: block; font-size: var(--fs-micro); font-weight: 500; color: var(--stone-ink); }

@container (max-width: 36rem) {
    .probe { grid-template-columns: minmax(0, 1fr); }
    .note { min-height: 0; }
}
</style>
