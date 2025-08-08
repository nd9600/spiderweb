import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";
import path from "path";
import fs from "fs";

// Keys expected by Helper::getAssetPath in Blade templates
const expectedKeys = [
  "assets/js/vendors.js",
  "assets/js/offline/graph.js",
];

function revManifestPlugin() {
  return {
    name: "rev-manifest-compatible",
    generateBundle(options, bundle) {
      // Build mapping from expected keys to emitted file paths
      const map: Record<string, string> = {};
      // Find vendors and offline/graph JS and CSS outputs
      for (const [, out] of Object.entries(bundle)) {
        const file = `/${out.fileName}`;
        if (out.type === "chunk") {
          if (out.name === "vendors") {
            map["assets/js/vendors.js"] = file;
          }
          if (out.isEntry && out.name === "offline/graph") {
            map["assets/js/offline/graph.js"] = file;
          }
        } else if (out.type === "asset") {
          if (out.fileName.endsWith(".css") && out.fileName.includes("offline/graph")) {
            map["assets/css/offline/graph.css"] = file;
          }
        }
      }

      // Only write if we produced entries we care about
      if (Object.keys(map).length) {
        try {
          fs.writeFileSync(path.resolve(__dirname, "rev-manifest.json"), JSON.stringify(map, null, 2));
        } catch (e) {
          this.warn(`Failed to write rev-manifest.json: ${String(e)}`);
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [vue(), revManifestPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "resources/assets/js"),
    },
  },
  build: {
    outDir: "public",
    emptyOutDir: false,
    assetsDir: "assets",
    sourcemap: true,
    rollupOptions: {
      input: {
        "offline/graph": path.resolve(__dirname, "resources/assets/js/src/offline/graph.js"),
      },
      output: {
        entryFileNames: "assets/js/[name]-[hash].js",
        chunkFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name ? path.extname(assetInfo.name).slice(1) : "bin";
          // keep js under assets/js, others under assets/<ext>
          if (ext === "js") return "assets/js/[name]-[hash].[ext]";
          if (ext === "css") return "assets/css/[name]-[hash].[ext]";
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
