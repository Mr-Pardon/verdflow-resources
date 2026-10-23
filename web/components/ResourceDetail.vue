<script setup>
import { computed, ref, watch } from 'vue';
import { ArrowLeft, ArrowUpRight, Download, Copy, Check, RefreshCw, CircleAlert, ExternalLink } from '@lucide/vue';
import { categoryById, asset } from '../config';
import { formatBytes } from '../lib/catalog';
import { routeHref } from '../lib/route';
import CategoryIcon from './CategoryIcon.vue';
const props = defineProps({ route: Object, resources: Array, state: String, error: String, record: Object, release: Object, html: String });
const emit = defineEmits(['navigate', 'follow', 'reload']);
const tab = ref('intro'), copied = ref(false), copyError = ref(false), coverFailed = ref(false);
watch(() => props.route.id, () => { tab.value = 'intro'; coverFailed.value = false; });
watch(() => props.release, () => { copied.value = false; copyError.value = false; });
const summary = computed(() => props.resources.find(r => r.id === props.route.id));
const category = computed(() => categoryById(props.record?.type || props.route.type));
const returnRoute = computed(() => ({ ...props.route, id: '', version: '', type: props.record?.type || props.route.type }));
const relatedHref = relation => routeHref({ ...props.route, id: relation.resourceId, version: relation.version || '' });
const labels = { strategy: '所需策略', 'source-catalog': '来源资产库', pak: '配套 PAK' };
async function copyHash() {
  try { await navigator.clipboard.writeText(props.release.package.sha256); copied.value = true; }
  catch { copyError.value = true; }
}
function switchTab(event) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  tab.value = event.key === 'Home' ? 'intro' : event.key === 'End' ? 'versions' : tab.value === 'intro' ? 'versions' : 'intro';
  document.getElementById(`${tab.value}-tab`)?.focus();
}
</script>
<template>
  <section class="page-width detail-page">
    <a class="back-link" :href="routeHref(returnRoute)" @click="emit('follow', $event, returnRoute)"><ArrowLeft :size="17" />返回资源列表</a>
    <div v-if="state === 'loading'" class="empty-state" role="status"><div class="loading-mark"></div><h2>正在加载资源</h2></div>
    <div v-else-if="state === 'error'" class="empty-state" role="alert"><CircleAlert :size="32" /><h1>暂时无法查看这项资源</h1><p>{{ error }}</p><button class="button secondary" @click="emit('reload')"><RefreshCw :size="16" />重试</button></div>
    <template v-else-if="record && release">
      <header class="detail-heading"><div class="detail-type" :data-tone="category.tone"><CategoryIcon :type="record.type" :size="26" /></div><div><span class="eyebrow">{{ category.name }} / {{ category.extension }}</span><h1>{{ record.name }}</h1><p>{{ record.summary }}</p><div class="detail-byline"><span>{{ record.author }}</span><span v-for="platform in record.platforms" :key="platform">{{ platform }}</span></div></div></header>
      <div class="detail-layout">
        <div class="detail-content">
          <figure v-if="summary?.cover && !coverFailed" class="detail-preview" :data-type="record.type"><img :src="asset(summary.cover)" :alt="record.name + '预览'" @error="coverFailed = true" /></figure>
          <div class="content-tabs" role="tablist" aria-label="资源详情" @keydown="switchTab"><button id="intro-tab" role="tab" :tabindex="tab === 'intro' ? 0 : -1" :aria-selected="tab === 'intro'" aria-controls="detail-content" @click="tab = 'intro'">资源介绍</button><button id="versions-tab" role="tab" :tabindex="tab === 'versions' ? 0 : -1" :aria-selected="tab === 'versions'" aria-controls="detail-content" @click="tab = 'versions'">版本记录<span>{{ record.versions.length }}</span></button></div>
          <div id="detail-content" role="tabpanel" :aria-labelledby="tab === 'intro' ? 'intro-tab' : 'versions-tab'">
            <div v-if="tab === 'intro'" class="readme" v-html="html"></div>
            <div v-else class="version-list"><article v-for="version in record.versions" :key="version.version"><div class="version-title"><h2>v{{ version.version }}</h2><span v-if="version.status === 'withdrawn'" class="status withdrawn">已撤回</span><span v-else-if="version.version === record.recommended" class="status">推荐版本</span><time>{{ version.releasedAt }}</time></div><p>{{ version.status === 'withdrawn' ? version.withdrawalReason : version.notes || '本次发布未补充更新说明。' }}</p><button class="text-link" @click="emit('navigate', { version: version.version }); tab = 'intro'">查看此版本<ArrowUpRight :size="16" /></button></article></div>
          </div>
        </div>
        <aside class="download-aside">
          <div class="download-section"><h2>获取资源</h2><label class="version-select">版本<select aria-label="选择资源版本" :value="release.version" @change="emit('navigate', { version: $event.target.value })"><option v-for="version in record.versions" :key="version.version" :value="version.version">v{{ version.version }}{{ version.version === record.recommended ? ' · 推荐' : version.status === 'withdrawn' ? ' · 已撤回' : '' }}</option></select></label>
            <div v-if="release.status === 'withdrawn'" class="withdrawal" role="status"><CircleAlert :size="18" /><p>此版本已撤回。{{ release.withdrawalReason }}</p></div>
            <a v-else class="button primary download-button" :href="release.package.url" rel="noopener noreferrer"><Download :size="17" />下载 .{{ category.extension.toLowerCase() }}<span>{{ formatBytes(release.package.bytes) }}</span></a>
            <dl class="resource-facts"><div><dt>发布于</dt><dd>{{ release.releasedAt }}</dd></div><div><dt>作者</dt><dd>{{ record.author }}</dd></div><div><dt>许可</dt><dd>{{ record.license }}</dd></div></dl>
            <details class="checksum"><summary>文件校验 SHA-256</summary><code>{{ release.package.sha256 }}</code><button class="text-link" @click="copyHash"><Check v-if="copied" :size="14" /><Copy v-else :size="14" />{{ copied ? '已复制' : '复制校验值' }}</button><p v-if="copyError" role="status">无法访问剪贴板，可选中上方校验值复制。</p></details>
          </div>
          <div v-if="release.relations.length" class="related-section"><h2>关联资源</h2><div v-for="(relation, index) in release.relations" :key="index" class="relation"><span class="eyebrow">{{ labels[relation.kind] }}</span><a v-if="relation.resourceId" :href="relatedHref(relation)" @click="emit('follow', $event, { id: relation.resourceId, version: relation.version || '' })">{{ relation.name }}<ArrowUpRight :size="16" /></a><a v-else-if="relation.url" :href="relation.url" target="_blank" rel="noopener noreferrer">{{ relation.name }}<ExternalLink :size="15" /></a><strong v-else>{{ relation.name }}</strong><small v-if="relation.version">保存于 v{{ relation.version }}</small><p v-if="relation.note">{{ relation.note }}</p></div><p v-if="release.relations.some(r => r.kind === 'source-catalog')" class="relation-note">来源资产库用于追溯，不要求为使用方案重复导入。</p></div>
          <p v-if="record.type === 'strategies'" class="trust-note"><CircleAlert :size="16" />策略包含可执行代码，请确认来源后在 Studio 中信任。</p>
        </aside>
      </div>
    </template>
  </section>
</template>
