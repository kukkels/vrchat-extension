const ExtractTextPlugin = require( 'extract-text-webpack-plugin' );
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' );
const PROD = process.argv.indexOf( '-p' ) !== -1;

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
						presets: [
							'env'
						],
						plugins: [
							'transform-class-properties'
						]
					}
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

module.exports = config;
