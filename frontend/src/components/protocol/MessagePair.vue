<script setup lang="ts">
import { useContent } from '../../content/content.ts';
import type { Shot } from '../../film/shot.ts';
import SceneStage from '../figure/SceneStage.vue';
import JsonMessage from './JsonMessage.vue';

const { request, reply, links } = useContent().protocol.sections.messages.pair;

function direct(shot: Shot) {
    shot.absent('reply', 'link-0', 'link-1', 'link-2');
    shot.look('request-id').lay('link-0').hold();
    shot.lookAway().lay('reply').take('reply-id', 'request-id').look('reply-id').lay('link-1').hold();
    shot.look('request-kind').hold().look('reply-kind').lay('link-2').hold().lookAway();
}
</script>

<template>
    <figure class="pair">
        <SceneStage take="pair" :direct="direct">
            <div class="messages">
                <JsonMessage :message="request" part="request" />
                <JsonMessage :message="reply" part="reply" />
            </div>
            <ol class="links">
                <li v-for="(link, index) in links" :key="link" :data-part="`link-${index}`">
                    <span class="number">{{ index + 1 }}</span>
                    {{ link }}
                </li>
            </ol>
        </SceneStage>
    </figure>
</template>

<style scoped>
.pair { max-width: 64rem; }
.messages { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr)); gap: 1.5rem; }
.links { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); gap: 0.9rem 2rem; margin-top: 1.5rem; }
.links li { display: flex; align-items: baseline; gap: 0.6rem; padding-top: 0.7rem; border-top: 1px solid var(--jute); font-size: var(--fs-small); text-wrap: pretty; }
.number { font-size: var(--fs-h3); }
</style>
