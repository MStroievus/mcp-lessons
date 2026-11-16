<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';

import { useReel } from '../../composables/reel.ts';
import { useContent } from '../../content/content.ts';
import type { Chapter, Film } from '../../film/film.ts';
import { fieldValue } from '../field.ts';
import ReplayButton from '../figure/ReplayButton.vue';

const props = defineProps<{ film: Film }>();

const text = useContent().player;

const stage = useTemplateRef('stage');
const poster = useTemplateRef('poster');
const playButton = useTemplateRef('playButton');
const frames = new Map<string, HTMLElement>();

const { reel, time, playing, still, play, pause, seek, showStill } = useReel(props.film, stage, frames);
const started = ref(false);

const label = computed(() => (still.value ? text.label(props.film.title) : `${text.label(props.film.title)}. ${text.spaceHint}`));
const chapters = computed(() => reel.value?.chapters ?? []);
const duration = computed(() => reel.value?.duration ?? 0);
const chapter = computed(() => reel.value?.chapterAt(time.value) ?? null);

function keepFrame(id: string, element: unknown) {
    if (element instanceof HTMLElement) frames.set(id, element);
    else frames.delete(id);
}

function toggle() {
    if (playing.value) return pause();
    started.value = true;
    play();
}

function jump(seconds: number) {
    started.value = true;
    seek(seconds);
}

function rewind() {
    pause();
    seek(0);
    started.value = false;
}

async function start() {
    toggle();
    await nextTick();
    playButton.value?.focus();
}

async function restart() {
    rewind();
    await nextTick();
    poster.value?.focus();
}

function open(target: Chapter) {
    if (still.value) showStill(target);
    else jump(target.opens);
}

function step(shift: number) {
    const index = chapters.value.findIndex(item => item.id === chapter.value?.id);
    const target = chapters.value[index + shift];
    if (target) showStill(target);
}

watch(still, on => {
    if (!chapter.value) return;
    if (on) showStill(chapter.value);
    else rewind();
});

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const share = (seconds: number) => `${(seconds / (duration.value || 1)) * 100}%`;
</script>

<template>
    <div class="player" tabindex="0" role="group" :aria-label="label" @keydown.space.self.prevent="toggle">
        <div class="screen">
            <div ref="stage" class="stage" lang="en">
                <div v-for="scene in film.scenes" :key="scene.id" :ref="el => keepFrame(scene.id, el)" class="frame">
                    <component :is="scene.frame" v-bind="scene.frameProps" />
                </div>
            </div>

            <button v-if="!started && !still" ref="poster" class="poster" type="button" @click="start">
                <span class="label">{{ text.note }} · {{ clock(duration) }}</span>
                <span class="poster-title" lang="en">{{ film.title }}</span>
                <span class="btn btn-main">{{ text.play }}</span>
            </button>
        </div>

        <div v-if="still" class="controls">
            <button class="btn btn-small" type="button" :disabled="chapter?.id === chapters[0]?.id" @click="step(-1)">{{ text.back }}</button>
            <button class="btn btn-small btn-main" type="button" :disabled="chapter?.id === chapters.at(-1)?.id" @click="step(1)">{{ text.next }}</button>
        </div>
        <div v-else class="controls">
            <button ref="playButton" class="btn btn-small btn-main" type="button" @click="toggle">{{ playing ? text.pause : text.play }}</button>
            <ReplayButton :label="text.restart" :disabled="!started" @click="restart" />
            <div class="bar">
                <input
                    class="seek"
                    type="range"
                    min="0"
                    step="1"
                    :max="duration"
                    :value="time"
                    :aria-label="text.seek"
                    :aria-valuetext="text.position(clock(time), clock(duration), chapter?.title ?? '')"
                    @input="jump(Number(fieldValue($event)))"
                />
                <span v-for="item in chapters.slice(1)" :key="item.id" class="tick" :style="{ left: share(item.start) }"></span>
            </div>
            <span class="clock">{{ clock(time) }} / {{ clock(duration) }}</span>
        </div>

        <ol class="chapters" lang="en">
            <li v-for="(item, index) in chapters" :key="item.id">
                <button class="chapter marked" type="button" :aria-current="item.id === chapter?.id ? 'step' : undefined" @click="open(item)">
                    <span class="number">{{ index + 1 }}</span>
                    {{ item.title }}
                </button>
            </li>
        </ol>
    </div>
</template>

<style scoped>
.player { display: grid; gap: 0.9rem; }

.screen { position: relative; container-type: inline-size; border: 1px solid var(--jute); border-radius: var(--radius); background: var(--wall); overflow: hidden; }
.stage { display: grid; }
.frame { grid-area: 1 / 1; min-width: 0; visibility: hidden; }

.poster {
    position: absolute;
    inset: 0;
    display: grid;
    gap: 1.1rem;
    place-content: center;
    justify-items: center;
    padding: 1.5rem;
    border: 0;
    background: var(--wall);
    color: var(--char);
    text-align: center;
    cursor: pointer;
}
.poster:focus-visible { outline-offset: -6px; }
.poster-title { max-width: 14ch; font: 500 clamp(2rem, 7cqw, 3.75rem) / 1.02 var(--font-head); letter-spacing: -0.01em; text-wrap: balance; }
.poster:hover .btn { border-color: var(--char); background: var(--char); }

.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.bar { position: relative; flex: 1 1 10rem; display: grid; align-items: center; min-height: 2.25rem; }
.seek { width: 100%; margin: 0; accent-color: var(--terracotta-ink); cursor: pointer; }
.tick { position: absolute; top: 0.1rem; width: 1px; height: 0.5rem; background: var(--stone-dark); pointer-events: none; }
.clock { font: var(--fs-small) / 1 var(--font-code); color: var(--stone-ink); }

.chapters { display: flex; flex-wrap: wrap; gap: 0.1rem 1.25rem; padding-top: 0.2rem; border-top: 1px solid var(--jute); }
.chapter {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    min-height: 2.5rem;
    padding: 0.4rem 0;
    border: 0;
    background: none;
    font: var(--fs-small) / 1.2 var(--font-text);
    color: var(--stone-ink);
    cursor: pointer;
}
.chapter:hover { color: var(--char); }
.chapter .number { font-size: var(--fs-body); }
</style>
