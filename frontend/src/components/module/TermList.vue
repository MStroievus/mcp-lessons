<script setup lang="ts">
defineProps<{
    items: { name: string; about: string }[];
    namesLang?: string;
}>();
</script>

<template>
    <dl class="terms">
        <div v-for="item in items" :key="item.name" class="term">
            <dt :lang="namesLang">{{ item.name }}</dt>
            <dd>{{ item.about }}</dd>
        </div>
    </dl>
</template>

<style scoped>
.terms { display: grid; gap: 0.35rem; max-width: 46rem; }
.term { display: grid; grid-template-columns: 11rem minmax(0, 1fr); gap: 0 1rem; padding: 0.4rem 0; border-top: 1px solid var(--jute); }
dt { font-weight: 600; }
dd { margin: 0; color: var(--stone-ink); }

@media (max-width: 34rem) {
    .term { grid-template-columns: minmax(0, 1fr); }
}
</style>
