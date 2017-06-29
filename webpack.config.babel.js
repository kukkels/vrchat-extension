import BabiliPlugin from 'babili-webpack-plugin'
import webpack from 'webpack'
const PROD = process.env.NODE_ENV === 'production';

module.exports = {
    entry: {
        background: './src/app/Background.js',
    },
    output: {
        path: `${__dirname}/dist/js`,
        filename: 'background-bundle.js'
    },
    plugins: PROD ? [
        new BabiliPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ] : []
};
