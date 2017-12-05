const pkg = require('../package.json');
const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AutoDllPlugin = require('autodll-webpack-plugin');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
   // Don't attempt to continue if there are any errors.
  bail: true,

  target: 'web',

  context: path.resolve(__dirname, '../'),

  devtool: 'cheap-module-inline-source-map',

  entry: [
    'webpack-hot-middleware/client',
    './src/index.tsx',
  ],

  output: {
    path: path.resolve(__dirname, '../build'),
    publicPath: '/',
    filename: 'bundle.js',
    chunkFilename: '[name].chunk.js',
  },

  resolve: {
    extensions: ['.js', '.jsx', '.css', '.json', '.ts', '.tsx'],
    modules: ['node_modules', 'src'],
  },

  module: {
    rules: [{
      test: /.tsx?$/,
      loader: 'ts-loader',
    }, {
      test: /\.jsx?$/,
      loader: 'babel-loader',
      include: path.resolve(__dirname, '../src'),
      options: {
        babelrc: false,
        presets: [
          ['env', {
            targets: {
              browsers: pkg.browserslist,
              uglify: true,
            },
            modules: false,
            debug: false,
          }],
          'stage-2', 'react',
        ],
      },
    }, {
      test: /\.css$/,
      include: [
        path.resolve(__dirname, '../src'),
      ],
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: path.resolve(__dirname, './postcss.config.js'),
              }
            }
          }
        ],
      })
    }, {
      test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
      loader: 'file-loader',
      query: {
        name: '[path][name].[ext]?[hash:8]',
      },
    }],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        // 'NODE_ENV': JSON.stringify('production'),
        'NODE_ENV': JSON.stringify('development'),
        'BROWSER': true,
      },
    }),

    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../src/index.html'),
      minify: {
        removeComments: true,
        // collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),

    new AutoDllPlugin({
      inject: true,
      context: __dirname,
      filename: '[name].dll.js',
      entry: {
        vendor: Object.keys(pkg.dependencies)
      }
    }),

    // new BundleAnalyzerPlugin(),

    new webpack.HotModuleReplacementPlugin(),

    new webpack.NoEmitOnErrorsPlugin(),


    new ExtractTextPlugin({ filename: 'spec.css', allChunks: true }),

    // new webpack.optimize.ModuleConcatenationPlugin(),
    // Minify the code.
    // new UglifyJSPlugin({
    //   compress: {
    //     warnings: false,
    //     // Pending further investigation:
    //     // https://github.com/mishoo/UglifyJS2/issues/2011
    //     comparisons: false,
    //     unused: true,
    //   },
    //   output: {
    //     comments: false,
    //     // Turned on because emoji and regex is not minified properly using default
    //     // https://github.com/facebookincubator/create-react-app/issues/2488
    //     ascii_only: true,
    //   },
    //   sourceMap: true,
    // }),
  ],

  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
};

