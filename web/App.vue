<script setup>
import { nextTick, watch } from 'vue';
import { ArrowUpRight, Plus } from '@lucide/vue';
import { siteUrl, manual, asset } from './config';
import { useRoute, routeHref } from './lib/route';
import { useCatalog, useResource } from './lib/catalog';
import CatalogView from './components/CatalogView.vue';
import ResourceDetail from './components/ResourceDetail.vue';
import ContributeView from './components/ContributeView.vue';

const { route, navigate, follow } = useRoute();
const catalog = useCatalog();
const detail = useResource(route, catalog.resources, catalog.state);
watch(() => [route.value.id, route.value.view], async () => {
  await nextTick();
  document.querySelector('main')?.focus({ preventScroll: true });
});
watch(() => [detail.record.value?.name, route.value.id, route.value.view], () => {
  document.title = `${route.value.view ? '投稿资源' : route.value.id ? detail.record.value?.name || '资源详情' : '资源中心'} · VerdFlow`;
});
</script>
<template>
  <a class="skip-link" href="#main">跳转至内容</a>
  <header class="site-header"><div class="header-inner">
    <a class="brand" :href="siteUrl" aria-label="VerdFlow 官网"><img :src="asset('brand/logo.png')" alt="VerdFlow" /></a>
    <span class="brand-divider"></span><a class="resource-home" :href="routeHref({ type: 'assets' })" @click="follow($event, { type: 'assets', id: '', version: '', view: '', q: '', platform: '' })">资源中心</a>
    <nav aria-label="主导航"><a :href="manual('manual/overview.html')">用户手册<ArrowUpRight :size="14" /></a><a class="website-link" :href="siteUrl">官网<ArrowUpRight :size="14" /></a><a class="button secondary contribute-link" :href="routeHref({ ...route, id: '', version: '', view: 'contribute' })" @click="follow($event, { id: '', version: '', view: 'contribute' })"><Plus :size="17" />投稿资源</a></nav>
  </div></header>
  <main id="main" tabindex="-1">
    <ContributeView v-if="route.view === 'contribute'" :route="route" @follow="follow" />
    <ResourceDetail v-else-if="route.id" :route="route" :resources="catalog.resources.value" :state="catalog.state.value === 'error' ? 'error' : detail.state.value" :error="catalog.state.value === 'error' ? catalog.error.value : detail.error.value" :record="detail.record.value" :release="detail.release.value" :html="detail.html.value" @navigate="navigate" @follow="follow" @reload="catalog.state.value === 'error' ? catalog.reload() : detail.reload()" />
    <CatalogView v-else :route="route" :resources="catalog.resources.value" :state="catalog.state.value" :error="catalog.error.value" @navigate="navigate" @follow="follow" @reload="catalog.reload" />
  </main>
  <footer class="site-footer page-width"><div><span class="footer-brand">VerdFlow</span><span>从区域到植被，让流程自由生长。</span></div><div><a :href="manual('license.html')">品牌与许可</a><span>资源许可以各条目为准</span></div></footer>
</template>
