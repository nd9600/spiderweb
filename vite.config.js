const path = require("path");
const {defineConfig} = require("vite");
const vuePlugin = require("@vitejs/plugin-vue");

const rootDir = __dirname;
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

module.exports = defineConfig(({mode}) => ({
    base: "./",
    publicDir: frontendPublicDir,
    plugins: [
        (vuePlugin.default || vuePlugin)()
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
        minify: mode === "production" ? "esbuild" : false,
        sourcemap: mode === "production",
        rollupOptions: {
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
            "resources/assets/js/__tests__/**/*.test.js"
        ],
        exclude: [
            "node_modules",
            "**/*-ignore*"
        ]
    }
}));
