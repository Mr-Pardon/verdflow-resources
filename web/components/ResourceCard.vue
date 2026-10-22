<script setup>
import { ref, watch } from 'vue';
import { ArrowUpRight } from '@lucide/vue';
import { asset, categoryById } from '../config';
import CategoryIcon from './CategoryIcon.vue';
const props = defineProps({ resource: Object, href: String });
const failed = ref(false);
watch(() => props.resource.cover, () => { failed.value = false; });
</script>
<template>
  <a class="resource-card" :href="href" :data-tone="categoryById(resource.type).tone">
    <div class="resource-cover">
      <img v-if="resource.cover && !failed" :src="asset(resource.cover)" :alt="resource.name + '预览'" loading="lazy" @error="failed = true" />
      <div v-else class="cover-fallback"><CategoryIcon :type="resource.type" :size="38" /><span>{{ categoryById(resource.type).extension }}</span></div>
      <span class="file-tag">{{ categoryById(resource.type).extension }}</span>
    </div>
    <div class="resource-body">
      <div class="resource-title"><h3>{{ resource.name }}</h3><ArrowUpRight :size="18" /></div>
      <p>{{ resource.summary }}</p>
      <div class="resource-tags"><span v-for="platform in resource.platforms" :key="platform">{{ platform }}</span><span v-if="resource.status === 'withdrawn'" class="withdrawn-tag">已撤回</span></div>
      <div class="resource-meta"><span>{{ resource.author }}</span><span>v{{ resource.version }}</span></div>
    </div>
  </a>
</template>
