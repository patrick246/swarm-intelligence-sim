const path = require('path');
const WebpackHtmlPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/index.ts',
	mode: 'development',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js'
	},
	plugins: [new WebpackHtmlPlugin({
		title: "Swarm Intelligence Stigmergy Simulator"
	})],
	module: {
		rules: [
			{
				test: /\.tsx?/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	},
	devtool: "inline-source-map",
	devServer: {
		disableHostCheck: true
	}
};
