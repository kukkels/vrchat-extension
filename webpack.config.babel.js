import BabiliPlugin from 'babili-webpack-plugin'
import webpack from 'webpack'
const PROD = process.env.NODE_ENV === 'production';

const config = {
	entry: {
		app: './src/app/app.js',
		main: './src/app/main.js',
	},
	output: {
		path: __dirname + '/dist/js',
		filename: '[name].js'
	},
	plugins: [],
	watchOptions: {
		aggregateTimeout: 300,
		poll: 1000,
	},
	externals: {
		'./main.js': './main.js',
	}
};

if ( PROD ) {
	config.plugins.push( new BabiliPlugin() );
	config.plugins.push( new webpack.DefinePlugin({
		'process.env.NODE_ENV': JSON.stringify( 'production' )
	}));
}

module.exports = config;
