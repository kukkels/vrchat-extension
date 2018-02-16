import BabiliPlugin from 'babili-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack'

const PROD = process.env.NODE_ENV === 'production';

const config = {
	entry: {
		app: './src/app.js',
		main: './src/main.js',
	},
	output: {
		path: __dirname + '/dist/build',
		filename: '[name].js'
	},
	plugins: [
		new ExtractTextPlugin( '[name].css' )
	],
	watchOptions: {
		aggregateTimeout: 300,
		poll: 100,
		ignored: 'node_modules',
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						'css-loader',
						'sass-loader'
					]
				})
			},
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [ 'env' ]
					}
				}
			}
		]
	}
};

if ( PROD ) {
	/*
	config.plugins.push( new BabiliPlugin() );
	config.plugins.push( new webpack.DefinePlugin({
		'process.env.NODE_ENV': JSON.stringify( 'production' )
	}));
	*/
}

module.exports = config;
