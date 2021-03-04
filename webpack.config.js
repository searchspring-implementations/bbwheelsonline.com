const path = require('path');

module.exports = {
	mode: 'development',
	entry: './src/index.js',
	// target: 'browserslist',  TODO: hot reloading only works with 'web', fix by having two webpack configs
	target: 'web',
	stats: {
		modulesSort: 'size',
		modulesSpace: 70,
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			},
			{
				test: /\.(css|scss)$/,
				exclude: /\.module\.(css|scss)$/,
				use: ['style-loader', 'css-loader', 'sass-loader'],
			},
			{
				test: /\.module\.(css|scss)$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							modules: {
								localIdentName: '[local]--[hash:base64:5]',
							},
						},
					},
					'sass-loader',
				],
			},
			{
				test: /\.(png|svg)$/,
				use: ['file-loader'],
			},
		],
	},
	output: {
		publicPath: '',
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js',
	},
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			react: 'preact/compat',
			'react-dom/test-utils': 'preact/test-utils',
			'react-dom': 'preact/compat',
			preact: path.resolve(__dirname, 'node_modules', 'preact'),
			'preact/hooks': path.resolve(__dirname, 'node_modules', 'preact', 'hooks'),
		},
	},
	devtool: 'source-map',
	devServer: {
		https: true,
		port: 3333,
		contentBase: [path.join(__dirname, 'public')],
		contentBasePublicPath: ['/'],
		watchContentBase: true,
		writeToDisk: (filePath) => {
			return /bundle\.js.*/.test(filePath);
		},
		hot: true,
		publicPath: '/dist',
		disableHostCheck: true,
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
	},
};
