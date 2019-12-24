const path = require("path");
const webpack = require("webpack");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const WebpackAssetsManifest = require("webpack-assets-manifest");

const mode = process.env.mode;

const entrypoints = {
    "js/offline/graph": "./resources/assets/js/offline/graph.js"
};

module.exports = {
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
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                options: {
                    presets: ["@babel/preset-env"],
                }
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
            "@": path.resolve(__dirname, "resources/assets"),
        },
        extensions: ["*", ".js", ".vue", ".json"]
    },
    performance: {
        hints: false
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "js/vendors",
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
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // we don't need any of moment's locales,,

        new WebpackAssetsManifest({
            output: path.resolve(__dirname, "rev-manifest.json"),
            merge: true
        })
    ],

    devtool: false,
    //devtool: mode === "production"
    //    ? "source-map" // "false"
    //    : "eval-source-map",

    output: {
        filename: mode === "production"
            ? "[name]-[hash].js" // "false"
            : "[name].js",
        path: path.resolve(__dirname, "public/assets/"),
        publicPath: "/",
    },
};

if (mode === "production") {
    // module.exports.devtool = "source-map";
    // module.exports.devtool = false;
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ]);
} else {
    // module.exports.devtool = "eval-source-map";
}
