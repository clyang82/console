/* Copyright Contributors to the Open Cluster Management project */
/* eslint-disable @typescript-eslint/no-var-requires */
import { ConsoleRemotePlugin } from '@openshift-console/dynamic-plugin-sdk-webpack'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin'
import webpack from 'webpack'
import { Configuration as DevServerConfiguration } from 'webpack-dev-server'

module.exports = function (_env: any, argv: { hot?: boolean; mode: string | undefined }) {
    const isProduction = argv.mode === 'production' || argv.mode === undefined
    const isDevelopment = !isProduction

    const config: webpack.Configuration & { devServer: DevServerConfiguration } = {
        entry: {},
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
            fallback: {
                fs: require.resolve('browserify-fs'),
                path: require.resolve('path-browserify'),
                buffer: require.resolve('buffer'),
                stream: require.resolve('stream-browserify'),
                util: require.resolve('node-util'),
                crypto: require.resolve('crypto-browserify'),
                process: require.resolve('process/browser'),
            },
            alias: {
                handlebars: 'handlebars/dist/handlebars.js',
            },
        },
        module: {
            rules: [
                { test: /\.hbs$/, loader: 'raw-loader', exclude: /node_modules/ },
                { test: /\.(svg)$/, use: '@svgr/webpack' },
                { test: /\.(jpg|jpeg|png|gif|ttf|eot|woff|woff2)$/, type: 'asset/resource' },
                {
                    test: /\.css$/,
                    use: isDevelopment ? ['style-loader', 'css-loader'] : [MiniCssExtractPlugin.loader, 'css-loader'],
                },
                {
                    test: /\.(ts|tsx|js|jsx)$/,
                    exclude: /node_modules/,
                    loader: 'ts-loader',
                    options: {
                        configFile: isDevelopment ? 'tsconfig.dev.json' : 'tsconfig.json',
                        transpileOnly: true,
                    },
                    type: 'javascript/auto',
                },
            ],
        },
        plugins: [
            new ConsoleRemotePlugin(),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': isProduction ? JSON.stringify('production') : JSON.stringify('development'),
                'process.env.REACT_APP_BACKEND_PATH': JSON.stringify('/multicloud'),
                'process.env.MODE': JSON.stringify('plugin'),
                'process.env.PLUGIN_PROXY_PATH': isProduction ? JSON.stringify('') : JSON.stringify('/api/proxy/acm-plugin'),
            }) as unknown as webpack.WebpackPluginInstance,
            new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'], process: 'process' }),
            new MonacoWebpackPlugin({ languages: ['yaml'] }),
            new MiniCssExtractPlugin({
                filename: '[name].[contenthash:8].css',
                chunkFilename: '[id].[contenthash:8].css',
                ignoreOrder: false, // Enable to remove warnings about conflicting order
            }),
        ].filter(Boolean) as webpack.WebpackPluginInstance[],
        optimization: {
            minimizer: [
                `...`,
                new CssMinimizerPlugin({ minimizerOptions: { preset: ['default', { mergeLonghand: false }] } }),
            ],
        },
        devServer: {
            port: 3001,
            compress: true,
            https: false,
            hot: true,
        },
    }
    return config
}