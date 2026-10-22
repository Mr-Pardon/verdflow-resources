import MarkdownIt from 'markdown-it';

export function renderReadme(source, sourceUrl) {
  const md = new MarkdownIt({ html: false, linkify: false, typographer: false });
  const base = new URL(sourceUrl);
  function resolveUrl(value, image = false) {
    try {
      const url = new URL(value, base);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return '';
      if (image && (url.origin !== base.origin || !/\.(png|jpe?g|webp)$/i.test(url.pathname))) return '';
      return url.href;
    } catch { return ''; }
  }
  const defaultLink = md.renderer.rules.link_open || ((tokens, index, options, env, self) => self.renderToken(tokens, index, options));
  md.renderer.rules.link_open = (tokens, index, options, env, self) => {
    const token = tokens[index];
    const href = token.attrGet('href') || '';
    token.attrSet('href', href.startsWith('#') ? href : resolveUrl(href));
    if (!href.startsWith('#')) {
      token.attrSet('target', '_blank');
      token.attrSet('rel', 'noopener noreferrer');
    }
    return defaultLink(tokens, index, options, env, self);
  };
  const defaultImage = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, index, options, env, self) => {
    const token = tokens[index];
    const src = resolveUrl(token.attrGet('src') || '', true);
    if (!src) return md.utils.escapeHtml(token.content);
    token.attrSet('src', src);
    token.attrSet('loading', 'lazy');
    token.attrSet('decoding', 'async');
    return defaultImage(tokens, index, options, env, self);
  };
  md.core.ruler.push('heading-anchors', state => {
    const used = new Map();
    state.tokens.forEach((token, index) => {
      if (token.type !== 'heading_open') return;
      const text = state.tokens[index + 1]?.content || 'section';
      const slug = text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-') || 'section';
      const count = used.get(slug) || 0;
      used.set(slug, count + 1);
      token.attrSet('id', count ? `${slug}-${count}` : slug);
    });
  });
  return md.render(source);
}
