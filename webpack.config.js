var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var EXAMPLES_DIR = path.resolve(process.cwd(), 'examples');
require('es6-promise').polyfill();

function buildEntries() {
  return fs.readdirSync(EXAMPLES_DIR).reduce(function (entries, dir) {
    if (dir === 'build') {
      return entries;
    }

    var isDraft = dir.charAt(0) === '_';
    var isDirectory = fs.lstatSync(path.join(EXAMPLES_DIR, dir)).isDirectory();

    if (!isDraft && isDirectory) {
      entries[dir] = path.join(EXAMPLES_DIR, dir, 'app.js');
    }

    return entries;
  }, {});
}

module.exports = {
    entry: buildEntries(),

    output: {
        filename: '[name].js',
        chunkFilename: '[id].chunk.js',
        path: 'examples/__build__',
        publicPath: '/__build__/'
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015', 'stage-2']
                }
            },
            {
                test: /\.css$/,
                loader: "isomorphic-style-loader!css-loader?localIdentName=[name]__[local]___[hash:base64:5]!autoprefixer-loader"
            }
        ]
    },
    devtool: 'source-map',
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('shared.js')
    ]
};
