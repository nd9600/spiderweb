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
        vue()
    ],
    resolve: {
        alias: {
            "@": path.resolve(rootDir, "resources/assets/js")
        },
        extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
    },
    define: {
        "process.env.NODE_ENV": JSON.stringify(mode)
    },
    build: {
        outDir: path.resolve(rootDir, "dist"),
        emptyOutDir: true,
        manifest: false,
        minify: mode === "production" ? "oxc" : false,
        sourcemap: mode === "production",
        rolldownOptions: {
            output: {
                entryFileNames: "assets/js/[name]-[hash].js",
                chunkFileNames: "assets/js/[name]-[hash].js",
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
