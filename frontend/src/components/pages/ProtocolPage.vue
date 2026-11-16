<script setup lang="ts">
import { useContent } from '../../content/content.ts';
import CompareTable from '../module/CompareTable.vue';
import ModuleSection from '../module/ModuleSection.vue';
import TermList from '../module/TermList.vue';
import IdFigure from '../protocol/IdFigure.vue';
import JsonMessage from '../protocol/JsonMessage.vue';
import MessagePair from '../protocol/MessagePair.vue';
import PartsFigure from '../protocol/PartsFigure.vue';
import PrimitivesFigure from '../protocol/PrimitivesFigure.vue';
import TransportFigure from '../protocol/TransportFigure.vue';

defineProps<{ stepId: string }>();
const { protocol, example } = useContent();
const { roles, primitives, messages, transport } = protocol.sections;
</script>

<template>
    <ModuleSection :step="stepId" :topics="protocol.sections" id="roles">
        <p v-for="paragraph in roles.text" :key="paragraph" class="about">{{ paragraph }}</p>
        <PartsFigure />
        <TermList :items="roles.roles" />
    </ModuleSection>

    <ModuleSection :step="stepId" :topics="protocol.sections" id="primitives">
        <p v-for="paragraph in primitives.text" :key="paragraph" class="about">{{ paragraph }}</p>
        <PrimitivesFigure :figure="primitives.figure" />
        <ul class="columns">
            <li v-for="item in primitives.items" :key="item.title" class="column">
                <h3>{{ item.title }}</h3>
                <p>{{ item.text }}</p>
                <p class="sheet"><span class="label">{{ example }}</span>{{ item.example }}</p>
                <p><span class="label">{{ primitives.controls }}</span>{{ item.control }}</p>
                <p><span class="label">{{ primitives.methods }}</span><code lang="en">{{ item.methods }}</code></p>
                <p><span class="label">{{ primitives.looks }}</span>{{ item.looks }}</p>
            </li>
        </ul>
        <p class="about">{{ primitives.client.text }}</p>
        <PrimitivesFigure :figure="primitives.client.figure" />
        <p class="about">{{ primitives.client.note }}</p>
    </ModuleSection>

    <ModuleSection :step="stepId" :topics="protocol.sections" id="messages">
        <p class="about">{{ messages.intro }}</p>
        <MessagePair />
        <p class="about">{{ messages.errors }}</p>
        <JsonMessage class="failure" :message="messages.failure" />
        <p class="about">{{ messages.ids.text }}</p>
        <IdFigure />
    </ModuleSection>

    <ModuleSection :step="stepId" :topics="protocol.sections" id="transport">
        <p v-for="paragraph in transport.text" :key="paragraph" class="about">{{ paragraph }}</p>
        <TransportFigure />
        <CompareTable v-bind="transport.compare" columns-lang="en" />
        <p class="about">{{ transport.note }}</p>
    </ModuleSection>
</template>

<style scoped>
.failure { max-width: 26rem; }
.column code { font-size: var(--fs-code); }
</style>
