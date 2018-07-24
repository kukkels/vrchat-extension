const ExtractTextPlugin = require( 'extract-text-webpack-plugin' );
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' );
const PostCompile = require( 'post-compile-webpack-plugin' )
const fs = require( 'fs' );
const webpack = require( 'webpack' );

const PROD = process.argv.indexOf( '-p' ) !== -1;
const WATCH = process.argv.indexOf( '--watch' ) !== -1;

const config = {
	entry: {
		main: './src/main.js',
	},
	output: {
		path: __dirname + '/dist/build',
		filename: '[name].js'
	},
	plugins: [
		new ExtractTextPlugin( '[name].css' ),
		new webpack.ProvidePlugin({
			dust: 'dustjs-linkedin',
		}),
	],
	watchOptions: {
		aggregateTimeout: 300,
		poll: 100,
		ignored: 'node_modules',
	},
	resolve: {
		alias: {
			'dust.core': 'dustjs-linkedin',
		},
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
						compact: true,
						presets: [
							'env'
						],
						plugins: [
							'transform-class-properties'
						]
					}
				}
			},
			{
				test: /\.dust$/,
				use: {
					loader: 'dust-loader',
				}
			}
		]
	}
};

if ( PROD ) {
	config.plugins.push( new UglifyJsPlugin({
		uglifyOptions: {
			output: {
				comments: false,
				beautify: false,
			},
			mangle: true,
			compress: {
				sequences: true,
				dead_code: true,
				conditionals: true,
				booleans: true,
				unused: true,
				if_return: true,
				join_vars: true,
				drop_console: true
			}
		}
	}));
}

// Only compile the complete app if the first compile is done
if ( PROD || WATCH ) {

	// Dont remove the mid step files on watch mode
	if ( PROD ) {
		config.plugins.push( new PostCompile(() => {
			fs.unlinkSync( './dist/build/main.js' );
		}));
		delete config.entry.main;
	}

	config.entry.app = './src/app.js';
}

module.exports = config;
