const path = require('path');

module.exports = {
  entry: './src/tracking-sdk.js',
  output: {
    filename: 'tracking-sdk.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'TrackingSDK',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
