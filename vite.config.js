const path = require("path");
const {defineConfig} = require("vite");
const {createVuePlugin} = require("vite-plugin-vue2");

const rootDir = __dirname;

function getAssetSubdirectory(name) {
    if (!name) {
        return "assets";
    }

    if (name.endsWith(".css")) {
        return "css";
    }

    return "assets";
}

module.exports = defineConfig(({command, mode}) => ({
    base: "./",
    publicDir: command === "serve"
        ? path.resolve(rootDir, "public")
        : false,
    plugins: [
        createVuePlugin()
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
        outDir: path.resolve(rootDir, "public/assets"),
        emptyOutDir: true,
        manifest: "manifest.json",
        minify: mode === "production" ? "esbuild" : false,
        sourcemap: mode === "production",
        rollupOptions: {
            input: {
                styles: path.resolve(rootDir, "resources/assets/js/src/styles.js"),
                graph: path.resolve(rootDir, "resources/assets/js/src/offline/graph.js")
            },
            output: {
                entryFileNames(chunkInfo) {
                    const facadeModuleId = chunkInfo.facadeModuleId || "";

                    if (facadeModuleId.endsWith(path.normalize("resources/assets/js/src/offline/graph.js"))) {
                        return "js/offline/[name]-[hash].js";
                    }

                    return "js/[name]-[hash].js";
                },
                chunkFileNames: "js/chunks/[name]-[hash].js",
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
