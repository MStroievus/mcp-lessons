<script setup lang="ts" generic="Item extends { chip: string }">
defineProps<{
    label: string;
    items: Item[];
    lang?: string;
}>();
const chosen = defineModel<Item>({ required: true });
</script>

<template>
    <div class="chits" role="group" :aria-label="label">
        <button v-for="item in items" :key="item.chip" class="chit" type="button" :lang="lang" :aria-pressed="item.chip === chosen.chip" @click="chosen = item">
            {{ item.chip }}
        </button>
    </div>
</template>
