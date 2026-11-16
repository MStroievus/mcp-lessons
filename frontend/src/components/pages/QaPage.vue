<script setup lang="ts">
import { useContent } from '../../content/content.ts';
import ModuleSection from '../module/ModuleSection.vue';
import CheckBench from '../qa/CheckBench.vue';
import ErrorPipeline from '../qa/ErrorPipeline.vue';
import InspectorFigure from '../qa/InspectorFigure.vue';

defineProps<{ stepId: string }>();

const { qa } = useContent();
const { inspector, primitives, errors } = qa.sections;
</script>

<template>
    <p class="lead">{{ qa.lead }}</p>

    <ModuleSection :step="stepId" :topics="qa.sections" id="inspector">
        <p v-for="paragraph in inspector.text" :key="paragraph" class="about">{{ paragraph }}</p>
        <InspectorFigure />
        <p class="about launch">{{ inspector.launch }} <code lang="en">{{ inspector.command }}</code></p>
    </ModuleSection>

    <ModuleSection :step="stepId" :topics="qa.sections" id="primitives">
        <section v-for="(group, id) in primitives.groups" :key="id" class="group">
            <h3 lang="en">{{ group.title }}</h3>
            <p v-for="paragraph in group.about" :key="paragraph" class="about">{{ paragraph }}</p>
            <CheckBench :checks="group.checks" :spec="group.spec" />
        </section>
    </ModuleSection>

    <ModuleSection :step="stepId" :topics="qa.sections" id="errors">
        <p v-for="paragraph in errors.text" :key="paragraph" class="about">{{ paragraph }}</p>
        <ErrorPipeline />
        <section class="group">
            <h3>{{ errors.mixupsTitle }}</h3>
            <CheckBench :checks="errors.mixups" />
        </section>
    </ModuleSection>
</template>

<style scoped>
h3 { font-size: var(--fs-h3); }
.about { max-width: 62ch; text-wrap: pretty; }
.launch code { display: block; width: fit-content; max-width: 100%; margin-top: 0.6rem; padding: 0.5rem 0.9rem; border: 1px solid var(--jute); border-radius: var(--radius-small); background: var(--paper); font-size: var(--fs-code); overflow-wrap: anywhere; }

.group { display: grid; gap: 1rem; }
</style>
