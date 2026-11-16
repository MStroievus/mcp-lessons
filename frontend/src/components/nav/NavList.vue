<script setup lang="ts">
import type { Branch } from '../../lessons/course.ts';
import NavGroup from './NavGroup.vue';
import NavLink from './NavLink.vue';

defineProps<{ branches: Branch[] }>();
</script>

<template>
    <ul>
        <li v-for="branch in branches" :key="branch.label">
            <NavGroup v-if="'children' in branch" :group="branch" />
            <NavLink v-else :place="branch" />
        </li>
    </ul>
</template>
