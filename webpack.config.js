const path = require("path");
const webpack = require("webpack");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const WebpackAssetsManifest = require("webpack-assets-manifest");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const entrypoints = {
    "assets/js/offline/graph": "./resources/assets/js/src/offline/graph.js",
    "assets/js/offline/worker": "./resources/assets/js/src/offline/worker.js",
};

module.exports = (env, argv) => {
    const mode = argv.mode;

    let config = {
        mode: mode,

        entry: entrypoints,

        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        "vue-style-loader",
                        "css-loader"
                    ],
                }, {
                    test: /\.vue$/,
                    loader: "vue-loader",
                    options: {
                        loaders: {}
                    }
                },
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: "babel-loader"
                        },
                        {
                            loader: "ts-loader",
                            options: {
                                appendTsSuffixTo: [/\.vue$/],

                                // disable type checker - we will use it in fork plugin
                                //transpileOnly: true
                            }
                        }
                    ],
                    exclude: /node_modules/,
                },
                {
                    test: /\.js$/,
                    loader: "babel-loader",
                    exclude: /node_modules/,
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]"
                    }
                }
            ]
        },

        resolve: {
            alias: {
                "vue$": "vue/dist/vue.esm.js",
                "@": path.resolve(__dirname, "resources/assets/js"),
            },
            extensions: ["*", ".ts", ".js", ".vue", ".json"]
        },
        performance: {
            hints: false
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "assets/js/vendors",
                        chunks: "all",
                        minChunks: 1
                    }
                }
            }
        },

        stats: {
            colors: true
        },

        plugins: [
            new VueLoaderPlugin(),
            new webpack.HashedModuleIdsPlugin(),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // we don't need any of moment's locales

            new WebpackAssetsManifest({
                output: path.resolve(__dirname, "rev-manifest.json"),
                merge: true,
            }),
            // new BundleAnalyzerPlugin()
        ],

        // devtool: false,
        devtool: mode === "production"
            ? "source-map"
            : "eval-source-map",

        output: {
            filename: mode === "production"
                ? "[name].js" // "false"
                : "[name].js",
            path: path.resolve(__dirname, "public/"),
            publicPath: "/",
        },
    };

    if (mode === "production") {
        // http://vue-loader.vuejs.org/en/workflow/production.html
        config.plugins = (config.plugins || []).concat([
            new webpack.DefinePlugin({
                "process.env": {
                    NODE_ENV: '"production"'
                }
            }),
            new webpack.LoaderOptionsPlugin({
                minimize: true
            })
        ]);
    }

    return config;
};