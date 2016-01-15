// this doesn't pass through babel, so no fancy js pls

module.exports = function(config){
  config.set({
    browsers: ['Chrome'],
    files: ['./tests/index.js'],
    preprocessors: {
      './tests/index.js': ['webpack']
    },
    webpack: {
      module: {
        loaders: [{
          test: /\.js$/,
          loader: 'babel',
          exclude: /node_modules/
        }]
      }
    },
    webpackMiddleware: {
      noInfo: true
    },
    frameworks: ['mocha', 'expect']
  });
};
