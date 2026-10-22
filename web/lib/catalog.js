import { ref, watch, onUnmounted } from 'vue';
import { asset } from '../config';

export function dataUrl(path) {
  const base = new URL(import.meta.env.BASE_URL, location.origin);
  const url = new URL(path, base);
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) throw new Error('Invalid resource path');
  return url.href;
}
async function get(url, signal, asText = false) {
  const request = new AbortController();
  const cancel = () => request.abort();
  signal.addEventListener('abort', cancel, { once: true });
  if (signal.aborted) cancel();
  const timer = setTimeout(() => request.abort(new Error('加载时间较长，请检查网络后重试。')), 20_000);
  try {
    const response = await fetch(url, { signal: request.signal, cache: 'no-cache' });
    if (!response.ok) throw new Error(response.status === 404 ? '资源内容未找到，请刷新列表后重试。' : '暂时无法加载，请稍后重试。');
    return await (asText ? response.text() : response.json());
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', cancel);
  }
}
export function useCatalog() {
  const resources = ref([]), state = ref('loading'), error = ref('');
  let controller;
  async function reload() {
    controller?.abort();
    const current = controller = new AbortController();
    state.value = 'loading'; error.value = '';
    try {
      const value = await get(asset('catalog.json'), current.signal);
      if (value.schemaVersion !== 1 || !Array.isArray(value.resources)) throw new Error('资源目录格式暂不支持。');
      resources.value = value.resources; state.value = 'ready';
    } catch (e) { if (!current.signal.aborted) { state.value = 'error'; error.value = e.message; } }
  }
  onUnmounted(() => controller?.abort());
  reload();
  return { resources, state, error, reload };
}
export function useResource(route, resources, catalogState) {
  const state = ref('idle'), error = ref(''), record = ref(null), release = ref(null), html = ref('');
  const retry = ref(0);
  watch([() => route.value.id, () => route.value.version, resources, catalogState, retry], async (_, __, cleanup) => {
    const controller = new AbortController();
    cleanup(() => controller.abort());
    record.value = null; release.value = null; html.value = ''; error.value = '';
    if (!route.value.id) { state.value = 'idle'; return; }
    state.value = 'loading';
    if (catalogState.value !== 'ready') return;
    const summary = resources.value.find(item => item.id === route.value.id);
    if (!summary) { state.value = 'error'; error.value = '这项资源尚未收录，或链接已经失效。'; return; }
    try {
      const url = dataUrl(summary.detail);
      const result = await get(url, controller.signal);
      if (result.schemaVersion !== 1 || result.id !== summary.id || !Array.isArray(result.versions)) throw new Error('资源记录与目录不一致，请刷新后重试。');
      const version = route.value.version || result.recommended || summary.version;
      const selected = result.versions.find(item => item.version === version);
      if (!selected) throw new Error('没有找到这个版本，请返回列表选择其他版本。');
      const readmeUrl = new URL(selected.readme, url).href;
      const source = await get(readmeUrl, controller.signal, true);
      const { renderReadme } = await import('./content');
      if (controller.signal.aborted) return;
      html.value = renderReadme(source, readmeUrl);
      record.value = result; release.value = selected; state.value = 'ready';
    } catch (e) { if (!controller.signal.aborted) { state.value = 'error'; error.value = e.message; } }
  }, { immediate: true });
  return { state, error, record, release, html, reload: () => retry.value++ };
}
export function filterResources(resources, route) {
  const query = route.q.trim().toLocaleLowerCase();
  return resources.filter(item => item.type === route.type
    && (!route.platform || item.platforms.includes(route.platform))
    && (!query || [item.name, item.summary, item.author, ...item.tags].join(' ').toLocaleLowerCase().includes(query)))
    .sort((a, b) => route.sort === 'name' ? a.name.localeCompare(b.name, 'zh-CN') : b.updatedAt.localeCompare(a.updatedAt) || a.name.localeCompare(b.name, 'zh-CN'));
}
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
