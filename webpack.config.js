const config = {
  mode: 'production',
  entry: {
    index: './src/js/index.js'
    // newName: './src/js/newName.js'
  },
  output: {
    filename: '[name].min.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};

module.exports = config;