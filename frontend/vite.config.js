import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173
    // If serving API separately and CORS is strict, you can proxy:
    // proxy: { '/api': 'http://localhost:8080' }
  }
});
