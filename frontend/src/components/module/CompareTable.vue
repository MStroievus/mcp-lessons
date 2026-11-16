<script setup lang="ts">
defineProps<{
    label: string;
    columns: string[];
    rows: { what: string; cells: string[] }[];
    columnsLang?: string;
}>();
</script>

<template>
    <table class="compare" :aria-label="label">
        <thead>
            <tr>
                <td></td>
                <th v-for="column in columns" :key="column" scope="col" :lang="columnsLang">{{ column }}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="row in rows" :key="row.what">
                <th scope="row">{{ row.what }}</th>
                <td v-for="(cell, index) in row.cells" :key="index">
                    <span class="label column-name" :lang="columnsLang">{{ columns[index] }}</span>
                    {{ cell }}
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
.compare { width: 100%; max-width: 60rem; border-collapse: collapse; table-layout: fixed; }
th,
td { padding: 0.75rem 1.5rem 0.75rem 0; text-align: left; vertical-align: top; text-wrap: pretty; }
thead th { padding-top: 0; font: 500 var(--fs-h3) / 1.1 var(--font-head); }
thead td { width: 11rem; }
tbody tr { border-top: 1px solid var(--jute); }
tbody th { font-weight: 600; }
tbody td { color: var(--stone-ink); }
.column-name { display: none; }

@media (max-width: 40rem) {
    thead { display: none; }
    tbody tr { display: grid; gap: 0.6rem; padding: 0.9rem 0; }
    th,
    td { display: block; padding: 0; }
    .column-name { display: block; margin-bottom: 0.15rem; }
}
</style>
