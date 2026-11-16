<script setup lang="ts">
defineProps<{ task: string[] }>();
</script>

<template>
    <p v-for="paragraph in task" :key="paragraph" class="lead">{{ paragraph }}</p>

    <div class="bench">
        <div class="side">
            <slot name="given" />
            <slot name="form" />
        </div>

        <div class="side">
            <slot name="preview" />
            <slot name="check" />
        </div>
    </div>
</template>

<style scoped>
.lead + .lead { margin-top: 0.75rem; }
.bench { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr)); gap: 3rem 4.5rem; align-items: start; margin-top: 3rem; padding-top: 2.5rem; border-top: 1px solid var(--jute); }
.side { display: grid; gap: 2.5rem; align-content: start; min-width: 0; }
.bench :deep(.block-title) { font-size: var(--fs-h3); }
</style>
