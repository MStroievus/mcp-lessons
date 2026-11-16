<script setup lang="ts">
import { useContent } from '../../content/content.ts';
import LayersFigure from '../basics/LayersFigure.vue';
import ModuleSection from '../module/ModuleSection.vue';
import TermList from '../module/TermList.vue';

defineProps<{ stepId: string }>();
const { basics, example } = useContent();
const { what, value, uses, ecosystem } = basics.sections;
</script>

<template>
    <ModuleSection :step="stepId" :topics="basics.sections" id="what">
        <p v-for="paragraph in what.text" :key="paragraph" class="about">{{ paragraph }}</p>
        <LayersFigure />
    </ModuleSection>

    <ModuleSection :step="stepId" :topics="basics.sections" id="value">
        <ul class="columns">
            <li v-for="item in value.items" :key="item.who" class="column">
                <h3>{{ item.who }}</h3>
                <p>{{ item.gives }}</p>
                <p class="sheet"><span class="label">{{ example }}</span>{{ item.example }}</p>
            </li>
        </ul>
    </ModuleSection>

    <ModuleSection :step="stepId" :topics="basics.sections" id="uses">
        <ul class="columns">
            <li v-for="item in uses.items" :key="item.title" class="column">
                <h3>{{ item.title }}</h3>
                <p class="sheet"><span class="label">{{ uses.asks }}</span>{{ item.ask }}</p>
                <p><span class="label">{{ uses.does }}</span>{{ item.does }}</p>
            </li>
        </ul>
    </ModuleSection>

    <ModuleSection :step="stepId" :topics="basics.sections" id="ecosystem">
        <p class="about">{{ ecosystem.intro }}</p>
        <TermList :items="ecosystem.clients" names-lang="en" />
        <p class="about">{{ ecosystem.host }}</p>
    </ModuleSection>
</template>
