<script setup>
import { ArrowLeft, ArrowUpRight, GitPullRequest, MessageSquareText, FileCheck2 } from '@lucide/vue';
import { repositoryUrl, manual } from '../config';
import { routeHref } from '../lib/route';
defineProps({ route: Object });
defineEmits(['follow']);
</script>
<template>
  <section class="page-width contribute-page">
    <a class="back-link" :href="routeHref({ ...route, view: '' })" @click="$emit('follow', $event, { view: '' })"><ArrowLeft :size="17" />返回资源中心</a>
    <div class="contribute-heading"><p class="eyebrow">CONTRIBUTE</p><h1>分享你的种植作品。</h1><p>一份资产库、一种空间策略，或一个精心调整的种植方案。</p></div>
    <div class="submission-options">
      <article><MessageSquareText :size="26" /><h2>通过 Issue 投稿</h2><p>提供资源介绍、预览图、包文件链接、署名与许可，由维护者审核整理。</p><a v-if="repositoryUrl" class="text-link" :href="`${repositoryUrl}/issues/new/choose`" target="_blank" rel="noopener noreferrer">提交资源<ArrowUpRight :size="17" /></a><span v-else class="pending-note">投稿入口将在资源仓库公开后开放</span></article>
      <article><GitPullRequest :size="26" /><h2>通过 PR 贡献</h2><p>维护资源记录与 README，或为已有条目补充说明、修正失效链接。</p><a v-if="repositoryUrl" class="text-link" :href="repositoryUrl" target="_blank" rel="noopener noreferrer">前往资源仓库<ArrowUpRight :size="17" /></a><span v-else class="pending-note">仓库入口待配置</span></article>
    </div>
    <div class="submission-checklist"><FileCheck2 :size="25" /><div><h2>发布前准备</h2><ul><li>可分发的 VFA、VFS 或 VFP，以及对应版本。</li><li>用途说明、清晰预览图、作者署名与明确许可。</li><li>策略、来源资产库的关联；DTS 资产另附配套 PAK 的外部入口。</li><li>移除私人路径、项目资料和未获授权的素材。</li></ul></div></div>
    <div class="author-links"><a :href="manual('authoring/assets.html')">VFA Author · 整理资产<ArrowUpRight :size="16" /></a><a :href="manual('authoring/strategy.html')">VFS Author · 创作策略<ArrowUpRight :size="16" /></a></div>
  </section>
</template>
