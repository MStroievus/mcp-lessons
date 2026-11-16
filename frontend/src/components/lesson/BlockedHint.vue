<script setup lang="ts">
import { useContent } from '../../content/content.ts';
import type { SandboxStore } from '../../store/sandbox-store.ts';

defineProps<{ sandbox: SandboxStore }>();
const content = useContent();
const text = content.sandbox;
</script>

<template>
    <span v-if="sandbox.blocked" class="hint quiet">
        {{ text.blocked[sandbox.blocked] }}
        <button v-if="sandbox.blocked === 'failed'" class="btn btn-small" type="button" @click="sandbox.retry()">{{ content.retry }}</button>
    </span>
</template>

<style scoped>
.hint { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; }
</style>
