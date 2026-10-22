<script setup>
import { computed, ref, watch } from 'vue';
import { ArrowRight, ArrowUpRight, Search, X, BookOpen, SlidersHorizontal, RefreshCw, PackageOpen } from '@lucide/vue';
import { categories, categoryById, manual, asset } from '../config';
import { filterResources } from '../lib/catalog';
import { routeHref } from '../lib/route';
import CategoryIcon from './CategoryIcon.vue';
import ResourceCard from './ResourceCard.vue';
const props = defineProps({ route: Object, resources: Array, state: String, error: String });
const emit = defineEmits(['navigate', 'follow', 'reload']);
const category = computed(() => categoryById(props.route.type));
const platforms = computed(() => [...new Set(props.resources.filter(r => r.type === props.route.type).flatMap(r => r.platforms))].sort());
const filtered = computed(() => filterResources(props.resources, props.route));
const limit = ref(12);
watch(() => [props.route.type, props.route.q, props.route.platform, props.route.sort], () => { limit.value = 12; });
const changed = computed(() => ({ id: '', version: '', view: '' }));
const categoryHref = type => routeHref({ ...props.route, ...changed.value, type, platform: '', q: '' });
</script>
<template>
  <section class="catalog-heading page-width">
    <div class="catalog-heading-copy"><h1>资源中心<span class="title-dot">.</span></h1><p class="page-intro">为下一次种植，找到合适的起点。</p></div>
    <a class="text-link heading-link" :href="manual('authoring/overview.html')">创作与扩展 <ArrowUpRight :size="17" /></a>
  </section>
  <div class="page-width catalog-layout">
    <section class="catalog-main" aria-label="资源浏览">
      <nav class="category-tabs" aria-label="资源分类">
        <a v-for="item in categories" :key="item.id" :href="categoryHref(item.id)" :aria-current="route.type === item.id ? 'page' : undefined"
          :class="{ active: route.type === item.id }" :data-tone="item.tone"
          @click="emit('follow', $event, { ...changed, type: item.id, platform: '', q: '' })">
          <CategoryIcon :type="item.id" /><span>{{ item.name }}<small>{{ item.extension }}</small></span>
          <span class="category-count">{{ state === 'ready' ? resources.filter(r => r.type === item.id).length : '—' }}</span>
        </a>
      </nav>
      <div class="catalog-toolbar">
        <div class="search-field"><Search :size="18" /><input aria-label="搜索资源" type="search" placeholder="搜索资源、作者或标签" :value="route.q" @input="emit('navigate', { q: $event.target.value }, true)" />
          <button v-if="route.q" class="icon-button compact" aria-label="清空搜索" title="清空搜索" @click="emit('navigate', { q: '' }, true)"><X :size="16" /></button>
        </div>
        <label class="select-field"><SlidersHorizontal :size="16" /><select aria-label="筛选适用平台" :value="route.platform" @change="emit('navigate', { platform: $event.target.value })"><option value="">全部平台</option><option v-for="platform in platforms" :key="platform">{{ platform }}</option></select></label>
      </div>
      <div class="result-toolbar"><span role="status" aria-live="polite">{{ state === 'ready' ? `${filtered.length} 项${category.name}` : '正在加载资源' }}</span>
        <label class="sort-field"><select aria-label="资源排序" :value="route.sort" @change="emit('navigate', { sort: $event.target.value })"><option value="updated">最近更新</option><option value="name">名称排序</option></select></label>
      </div>
      <div v-if="state === 'loading'" class="loading-grid" aria-label="正在加载"><div v-for="n in 3" :key="n" class="skeleton-card"><div></div><span></span><span></span></div></div>
      <div v-else-if="state === 'error'" class="empty-state" role="alert"><PackageOpen :size="36" /><h2>资源列表暂时无法加载</h2><p>{{ error }}</p><button class="button secondary" @click="emit('reload')"><RefreshCw :size="16" />重新加载</button></div>
      <div v-else-if="filtered.length" class="resource-grid">
        <ResourceCard v-for="resource in filtered.slice(0, limit)" :key="resource.id" :resource="resource" :href="routeHref({ ...route, id: resource.id })" @click="emit('follow', $event, { id: resource.id })" />
      </div>
      <div v-else-if="route.q || route.platform" class="empty-state"><Search :size="34" /><h2>没有找到匹配的资源</h2><p>试试其他关键词，或清除筛选条件。</p><button class="button secondary" @click="emit('navigate', { q: '', platform: '' })">清除筛选</button></div>
      <div v-else class="empty-state collection-empty" :data-tone="category.tone">
        <div class="empty-symbol"><CategoryIcon :type="category.id" :size="36" /></div>
        <span class="empty-label">{{ category.extension }} / 即将开放</span><h2>{{ category.emptyTitle }}</h2><p>{{ category.emptyText }}</p>
        <a :href="manual(category.guide)" class="text-link">{{ category.guideTitle }}<ArrowRight :size="16" /></a>
      </div>
      <div v-if="filtered.length > limit" class="load-more"><button class="button secondary" @click="limit += 12">加载更多</button></div>
    </section>
    <aside class="catalog-aside">
      <div class="aside-heading"><BookOpen :size="17" /><h2>从这里开始</h2></div>
      <a class="guide-image" :href="manual(category.guide)"><img :src="asset(`guides/${category.id}.webp`)" :alt="`${category.name}使用手册中的界面示意`" /></a>
      <a class="guide-title" :href="manual(category.guide)">{{ category.guideTitle }}<ArrowUpRight :size="17" /></a>
      <p class="aside-note">{{ category.description }}</p>
      <div class="aside-links"><a :href="manual(category.authoring)">{{ category.authoringTitle }}<ArrowUpRight :size="16" /></a><a :href="manual('guide/install.html')">安装与开始使用<ArrowUpRight :size="16" /></a></div>
      <div class="contribution-note"><span class="eyebrow">一起创作</span><h3>让好的作品被发现。</h3><a :href="routeHref({ ...route, view: 'contribute' })" class="text-link" @click="emit('follow', $event, { view: 'contribute' })">投稿资源<ArrowRight :size="16" /></a></div>
    </aside>
  </div>
</template>
