import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // Optional: Rewrite the URL if needed
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
export {
  vite_config_default as default
};
