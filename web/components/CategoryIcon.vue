<script setup>
import { Boxes, Workflow, Sprout } from '@lucide/vue';
defineProps({ type: String, size: { type: Number, default: 22 } });
const icons = { assets: Boxes, strategies: Workflow, plans: Sprout };
</script>
<template><component :is="icons[type] || Boxes" :size="size" :stroke-width="1.6" aria-hidden="true" /></template>
