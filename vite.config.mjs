import path from "path";
import {fileURLToPath} from "url";

import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const frontendPublicDir = path.resolve(rootDir, "frontend-public");

function getAssetSubdirectory(name) {
    if (!name) {
        return "assets";
    }

    if (name.endsWith(".css")) {
        return "assets/css";
    }

    return "assets";
}

export default defineConfig(({mode}) => ({
    base: "./",
    publicDir: frontendPublicDir,
    plugins: [
        vue(),
        mode === "offline" && {
            name: "offline-script",
            transformIndexHtml: {
                order: "post",
                // Browsers block module scripts on file:// URLs. The offline bundle is a single classic script.
                handler: (html) => html
                    .replace('<script type="module" crossorigin', "<script defer")
                    .replace('<link rel="stylesheet" crossorigin', '<link rel="stylesheet"'),
            },
        },
    ],
    resolve: {
        alias: {
            "@": path.resolve(rootDir, "resources/assets/js")
        },
        extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
    },
    build: {
        outDir: path.resolve(rootDir, "dist"),
        emptyOutDir: true,
        manifest: false,
        minify: mode !== "development" ? "oxc" : false,
        sourcemap: mode !== "development",
        modulePreload: mode !== "offline",
        // The downloadable app must fit in one script to work from a file URL.
        chunkSizeWarningLimit: mode === "offline" ? 600 : 500,
        rolldownOptions: {
            output: {
                format: mode === "offline" ? "iife" : "es",
                entryFileNames: "assets/js/[name]-[hash].js",
                chunkFileNames: "assets/js/[name]-[hash].js",
                codeSplitting: mode === "offline" ? false : {
                    groups: [
                        {
                            name: "firebase",
                            test: /node_modules[\\/](?:@firebase|firebase)[\\/]/,
                        },
                        {
                            name: "d3",
                            test: /node_modules[\\/](?:d3|d3-[^\\/]+)[\\/]/,
                        },
                        {
                            name: "vue-vendor",
                            test: /node_modules[\\/](?:@vue|vue|pinia)[\\/]/,
                        },
                        {
                            name: "vendor",
                            test: /node_modules[\\/]/,
                        },
                    ],
                },
                assetFileNames(assetInfo) {
                    return `${getAssetSubdirectory(assetInfo.name)}/[name]-[hash][extname]`;
                }
            }
        }
    },
    test: {
        globals: true,
        environment: "node",
        include: [
            "resources/assets/js/__tests__/**/*.test.ts"
        ],
        exclude: [
            "node_modules",
            "**/*-ignore*"
        ]
    }
}));
