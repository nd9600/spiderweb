import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "resources/assets/js"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: false,
    sourcemap: true,
    manifest: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/js/[name]-[hash].js",
        chunkFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || "";
          const ext = name ? path.extname(name).slice(1) : "bin";
          if (ext === "css") return "assets/css/[name]-[hash].[ext]";
          if (ext === "js") return "assets/js/[name]-[hash].[ext]";
          return `assets/${ext}/[name]-[hash].[ext]`;
        },
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendors";
          }
        },
      },
    },
  },
});
