const path = require('path');
const webpack = require('webpack');
const package = require('./package.json');

const banner = `bgmPlayer.js v${package.version}

Licensed MIT © 2021 along Luo`;

const config = {
  mode: 'production',
  context: path.resolve(__dirname, 'src'),
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bgmPlayer.min.js',
    library: 'BgmPlayer',
    libraryExport: 'default',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  stats: {
    colors: true
  }
};

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';
  if (isDev) {
    config.devtool = 'inline-cheap-source-map';
    config.output.filename = 'bgmPlayer.js';
  } else {
    config.plugins = [
      ...(config.plugins || []),
      new webpack.BannerPlugin(banner)
    ];
  }

  console.log('argv:', argv);
  console.log('isDev:', isDev);

  return config;
}