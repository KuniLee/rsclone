/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

const devMode = process.env.NODE_ENV !== 'production'

const optimization = () => {
    const config = {
        runtimeChunk: devMode ? 'single' : false,
        splitChunks: {
            chunks: 'all',
        },
        minimize: false,
    }
    if (!devMode) {
        config.minimize = true
        config.minimizer = [new TerserPlugin(), new CssMinimizerPlugin()]
    }
    return config
}

const thePlugins = () => {
    return [
        new HTMLWebpackPlugin({
            inject: true,
            favicon: `./assets/icons/favicon-32.png`,
            template: 'index.html',
            filename: `index.html`,
            minify: !devMode,
            chunks: ['main'],
        }),
        new HTMLWebpackPlugin({
            inject: true,
            favicon: `./assets/icons/favicon-32x32.png`,
            template: 'auth.html',
            filename: `auth.html`,
            minify: !devMode,
            chunks: ['auth'],
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
        new ESLintPlugin({ extensions: ['ts', 'js'] }),
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: path.resolve(__dirname, 'tsconfig.json'),
            },
        }),
        new Dotenv(),
    ]
}

const sccLoaders = (extra) => {
    const loaders = [MiniCssExtractPlugin.loader, 'css-loader']
    if (extra) {
        loaders.push(extra)
    }
    return loaders
}

const config = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: './index.ts',
        auth: './auth.ts',
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        assetModuleFilename: 'assets/[hash][ext][query]',
    },
    resolve: {
        extensions: ['.js', '.ts'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
            types: path.resolve(__dirname, 'src/types'),
        },
    },
    optimization: optimization(),
    plugins: thePlugins(),
    devtool: devMode ? 'source-map' : false,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'esbuild-loader',
                options: {
                    loader: 'ts',
                    target: 'es2015',
                },
            },
            {
                test: /\.css$/,
                use: sccLoaders('postcss-loader'),
            },
            {
                test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif|ogg|mp3|wav)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
            },
            {
                test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
                type: 'asset/resource',
            },
            {
                test: /\.(csv|tsv)$/,
                use: ['csv-loader'],
            },
            {
                test: /\.hbs$/,
                loader: 'handlebars-loader',
                options: {
                    runtime: path.resolve(__dirname, './handlebars.js'),
                },
            },
        ],
    },
    devServer: {
        static: path.join(__dirname, ''),
        port: 4200,
        compress: true,
        open: true,
        historyApiFallback: {
            rewrites: [
                { from: /^\/$/, to: '/index.html' },
                { from: /^\/login\/?.*$/, to: '/auth.html' },
                { from: /^\/register\/?.*$/, to: '/auth.html' },
            ],
        },
    },
}

module.exports = config
