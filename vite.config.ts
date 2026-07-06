import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { viteSingleFile } from "vite-plugin-singlefile";

/** Serve a static /api/health endpoint so the platform preview healthcheck passes. */
function healthPlugin(): PluginOption {
  return {
    name: "health-endpoint",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/api/health") {
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify({ ok: true }));
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/api/health") {
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify({ ok: true }));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Inline all assets into a single HTML file — perfect for static hosting.
    viteSingleFile(),
    healthPlugin(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: "0.0.0.0",
  },
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
