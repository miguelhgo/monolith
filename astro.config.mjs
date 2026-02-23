import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

const previewAllowedHosts = (
  process.env.PREVIEW_ALLOWED_HOSTS
    ? process.env.PREVIEW_ALLOWED_HOSTS.split(',').map((host) => host.trim()).filter(Boolean)
    : ['localhost', '127.0.0.1', 'monolith.mighs.me', 'monolith.miguelhs.com']
);

export default defineConfig({
  integrations: [react(), tailwind()],
  vite: {
    preview: {
      allowedHosts: previewAllowedHosts,
    },
  },
});
