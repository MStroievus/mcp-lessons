<script setup lang="ts">
import type { LessonText } from '../../content/content.ts';
import type { Film } from '../../film/film.ts';
import FilmPlayer from '../film/FilmPlayer.vue';
import DeclarationCode from '../lesson/DeclarationCode.vue';
import DescriptionCases from '../lesson/DescriptionCases.vue';
import PracticeList from '../lesson/PracticeList.vue';
import SourceLinks from '../module/SourceLinks.vue';
import TermList from '../module/TermList.vue';

defineProps<{ text: LessonText; example?: { title: string; about: string[]; film: Film } }>();
</script>

<template>
    <p class="lead">{{ text.lead }}</p>

    <section v-if="text.what" class="part">
        <h2>{{ text.what.title }}</h2>
        <p v-for="paragraph in text.what.text" :key="paragraph" class="about">{{ paragraph }}</p>
        <p v-for="said in text.what.examples" :key="said.text" class="sheet said">
            <span class="label">{{ said.label }}</span>
            <code lang="en">{{ said.text }}</code>
        </p>
        <p v-for="paragraph in text.what.after" :key="paragraph" class="about">{{ paragraph }}</p>
    </section>

    <section class="part">
        <h2>{{ text.code.title }}</h2>
        <p class="about">{{ text.code.about }}</p>
        <DeclarationCode :code="text.code" />
        <TermList v-if="text.code.parts" :items="text.code.parts" />
    </section>

    <section v-if="text.why" class="part">
        <h2>{{ text.why.title }}</h2>
        <p v-for="paragraph in text.why.text" :key="paragraph" class="about">{{ paragraph }}</p>
        <ul class="columns">
            <li v-for="reason in text.why.reasons" :key="reason.title" class="column">
                <h3>{{ reason.title }}</h3>
                <p>{{ reason.text }}</p>
            </li>
        </ul>
    </section>

    <section class="part">
        <h2>{{ text.cases.title }}</h2>
        <p v-for="paragraph in text.cases.intro" :key="paragraph" class="about">{{ paragraph }}</p>
        <DescriptionCases :cases="text.cases.items" :labels="text.cases.labels" />
    </section>

    <section class="part">
        <h2>{{ text.practices.title }}</h2>
        <p class="about">{{ text.practices.intro }}</p>
        <PracticeList :items="text.practices.items" />
        <SourceLinks :sources="text.practices.sources" />
    </section>

    <section v-if="example" class="part">
        <h2>{{ example.title }}</h2>
        <p v-for="paragraph in example.about" :key="paragraph" class="about">{{ paragraph }}</p>
        <FilmPlayer :film="example.film" />
    </section>
</template>

<style scoped>
.said { display: grid; gap: 0.25rem; max-width: 40rem; }
.said code { font-size: var(--fs-code); overflow-wrap: anywhere; }
</style>
