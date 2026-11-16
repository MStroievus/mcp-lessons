<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch, watchEffect } from 'vue';

import CourseNav from './components/nav/CourseNav.vue';
import { placeOf, useHashStep } from './composables/hash-step.ts';
import { usePageEnd } from './composables/page-end.ts';
import { useReadingSection } from './composables/reading-section.ts';
import { useContent } from './content/content.ts';
import { type Language, LANGUAGES } from './content/languages.ts';
import { useCourse } from './lessons/course.ts';
import { useVisitor } from './store/visitor-store.ts';

const content = useContent();
const visitor = useVisitor();
const { steps, tree } = useCourse();

const { wanted, section, show } = useHashStep(steps.map(step => step.id));
const step = computed(() => {
    const asked = steps.find(candidate => candidate.id === wanted.value) ?? steps[0];
    return visitor.isOpen(asked.requires) ? asked : (steps.find(candidate => candidate.id === asked.requires) ?? steps[0]);
});
const part = computed(() => step.value.sections?.find(id => id === section.value));

const reading = useReadingSection(computed(() => (step.value.sections ?? []).map(id => placeOf(step.value.id, id))));
const here = computed(() => step.value.sections?.find(id => placeOf(step.value.id, id) === reading.value) ?? step.value.sections?.[0]);

watch([step, part, wanted, section], () => show(placeOf(step.value.id, part.value)), { immediate: true });
watchEffect(() => (document.title = `${step.value.title} — ${content.course.name}`));

const heading = useTemplateRef('heading');
async function reveal() {
    await nextTick();
    if (!part.value) {
        scrollTo(0, 0);
        return heading.value?.focus({ preventScroll: true });
    }
    const title = document.getElementById(placeOf(step.value.id, part.value));
    title?.scrollIntoView();
    title?.focus({ preventScroll: true });
}
watch([step, part], reveal);
onMounted(() => part.value && reveal());

const navId = useId();
const menu = ref(false);
const menuButton = useTemplateRef('menuButton');
watch([step, part], () => (menu.value = false));

function follow({ target }: MouseEvent) {
    if (target instanceof Element && target.closest('a')) menu.value = false;
}

function dismiss() {
    if (!menu.value) return;
    menu.value = false;
    menuButton.value?.focus();
}

const narrow = matchMedia('(max-width: 56rem)');
const widen = () => narrow.matches || (menu.value = false);
narrow.addEventListener('change', widen);
onBeforeUnmount(() => narrow.removeEventListener('change', widen));

function speak(language: Language) {
    if (LANGUAGES[language].content === content) return;
    visitor.chooseLanguage(language);
    location.reload();
}

const end = useTemplateRef('end');
usePageEnd(end, () => visitor.pass(step.value.id));
</script>

<template>
    <header class="top" @keydown.esc="dismiss">
        <button ref="menuButton" class="menu" type="button" :aria-expanded="menu" :aria-controls="navId" @click="menu = !menu">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path :d="menu ? 'M5 5l10 10M15 5 5 15' : 'M3 5.5h14M3 10h14M3 14.5h14'" /></svg>
            {{ content.nav.menu }}
        </button>
        <span class="label name">{{ content.course.name }}</span>
        <div class="languages" role="group" :aria-label="content.language">
            <button v-for="({ label, content: texts }, id) in LANGUAGES" :key="id" class="language" type="button" :lang="id" :aria-pressed="texts === content" @click="speak(id)">
                {{ label }}
            </button>
        </div>
    </header>

    <div class="layout">
        <CourseNav :id="navId" class="side" :data-open="menu || undefined" :tree="tree" :current="step.id" :section="here" @click="follow" @keydown.esc="dismiss" />

        <main class="page" :inert="menu">
            <p class="label">{{ step.module }}</p>
            <h1 ref="heading" tabindex="-1">{{ step.title }}</h1>

            <component :is="step.page" :key="step.id" v-bind="step.props" />
            <div ref="end" :key="step.id"></div>
        </main>
    </div>
</template>

<style scoped>
.top,
.layout { width: min(100% - 2.5rem, var(--page)); margin-inline: auto; }
.top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem 1rem; padding: 0.8rem 0 0.7rem; border-bottom: 1px solid var(--jute); }
.menu { display: none; align-items: center; gap: 0.5rem; min-height: 2.5rem; padding: 0.3rem 0.75rem 0.3rem 0.6rem; border: 1px solid var(--jute-dark); border-radius: var(--radius-small); background: var(--paper); font: 500 var(--fs-small) / 1.2 var(--font-text); color: var(--char); cursor: pointer; }
.menu svg { width: 1.25rem; height: 1.25rem; fill: none; stroke: currentColor; stroke-width: 1.75; stroke-linecap: round; }
.languages { display: flex; gap: 0.25rem; }
.language { min-width: 2.75rem; min-height: 2rem; padding: 0.2rem 0.5rem; border: 0; border-radius: var(--radius-small); background: none; font: 500 var(--fs-small) / 1.2 var(--font-text); color: var(--stone-ink); cursor: pointer; }
.language:hover { background: var(--ceramic); color: var(--char); }
.language[aria-pressed='true'] { color: var(--char); font-weight: 600; text-decoration: underline; text-decoration-color: var(--terracotta-ink); text-decoration-thickness: 2px; text-underline-offset: 0.35em; }

.layout { display: grid; grid-template-columns: 13rem minmax(0, 1fr); gap: 0 3.5rem; align-items: start; }
.side { position: sticky; top: 0; max-height: 100dvh; padding-top: clamp(2rem, 5vw, 3.5rem); overflow-y: auto; }
.page { padding: clamp(2rem, 5vw, 3.5rem) 0 var(--air); }
h1 { margin-top: 0.4rem; font-size: var(--fs-h1); text-wrap: balance; }
h1:focus { outline: none; }

@media (max-width: 56rem) {
    .top { position: sticky; top: 0; z-index: 2; width: 100%; padding-inline: 1.25rem; background: var(--wall); }
    .menu { display: inline-flex; }
    .name { margin-right: auto; }
    .layout { grid-template-columns: minmax(0, 1fr); }
    .side { display: none; position: fixed; inset: 4rem 0 0; z-index: 1; max-height: none; padding: 1rem 1.25rem 2rem; overflow-y: auto; overscroll-behavior: contain; background: var(--wall); }
    .side[data-open] { display: block; }
    .page { padding-top: 1.75rem; }
}

@media (max-width: 30rem) {
    .name { display: none; }
}
</style>
