import { ref, onUnmounted } from 'vue';

const defaults = { type: 'assets', q: '', platform: '', sort: 'updated', id: '', version: '', view: '' };
export function parseRoute(search) {
  const params = new URLSearchParams(search);
  const route = Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, params.get(key) || value]));
  if (!['assets', 'strategies', 'plans'].includes(route.type)) route.type = 'assets';
  if (!['updated', 'name'].includes(route.sort)) route.sort = 'updated';
  if (route.view !== 'contribute') route.view = '';
  return route;
}
export function routeHref(route) {
  const params = new URLSearchParams();
  for (const key of Object.keys(defaults)) if (route[key] && route[key] !== defaults[key]) params.set(key, route[key]);
  return `${location.pathname}${params.size ? `?${params}` : ''}`;
}
export function useRoute() {
  const route = ref(parseRoute(location.search));
  const onPopState = () => { route.value = parseRoute(location.search); };
  window.addEventListener('popstate', onPopState);
  onUnmounted(() => window.removeEventListener('popstate', onPopState));
  function navigate(change, replace = false) {
    const next = { ...route.value, ...change };
    const href = routeHref(next);
    if (`${location.pathname}${location.search}` !== href) history[replace ? 'replaceState' : 'pushState']({}, '', href);
    route.value = parseRoute(location.search);
  }
  function follow(event, change) {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(change);
    window.scrollTo({ top: 0 });
  }
  return { route, navigate, follow };
}
