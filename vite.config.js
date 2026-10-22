import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { generateCatalog } from './scripts/build-catalog.mjs';

const base = process.env.SITE_BASE || '/';
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) throw new Error('SITE_BASE must be an absolute directory path.');

export default defineConfig({
  base,
  publicDir: '.generated',
  plugins: [vue(), {
    name: 'resource-catalog',
    async buildStart() { await generateCatalog(); },
    configureServer(server) {
      server.watcher.add(['entries', 'public']);
      let queue = Promise.resolve();
      server.watcher.on('all', (event, path) => {
        if (!/[\\/](entries|public)[\\/]/.test(path)) return;
        queue = queue.catch(() => {}).then(async () => {
          try {
            await generateCatalog();
            server.ws.send({ type: 'full-reload' });
          } catch (error) { server.config.logger.error(error.message); }
        });
      });
    },
  }],
  build: { target: 'es2022' },
});
