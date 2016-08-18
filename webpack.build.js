var path = require('path');
require('es6-promise').polyfill();
module.exports = {
  entry: path.resolve(process.cwd(), 'index.js'),
  output: {
    filename: 'index.js',
    path: 'dist/',
    libraryTarget: 'umd',
    library: 'react-modal-wrapper'
  },
  externals: {
    'react': 'react',
    'react-dom': 'react-dom',
    'react-portal': 'react-portal'
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
        loader: "isomorphic-style-loader!css-loader!autoprefixer-loader"
      }
    ]
  }
};
