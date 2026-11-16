<script setup lang="ts">
import { computed } from 'vue';

import { tokenizeJson } from '../core/json-tokens.ts';

const props = defineProps<{ body: unknown }>();

const tokens = computed(() => tokenizeJson(props.body));
</script>

<template>
    <pre class="code" lang="en"><span v-for="(token, index) in tokens" :key="index" :class="token.kind">{{ token.text }}</span></pre>
</template>
