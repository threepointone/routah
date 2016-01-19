// this doesn't pass through babel, so no fancy js pls
module.exports = function(config){
  config.set({
    browsers: ['Chrome'],
    files: ['./tests/index.js'],
    reporters: ['mocha', 'coverage'],
    mochaReporter: {
      output: 'autowatch'
    },
    preprocessors: {
      '**/src/*.js': ['coverage'],
      './tests/index.js': ['webpack'],
    },
    webpack: {
      module: {
        loaders: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel'
        }, {
          test: /\.js$/,
          include: require('path').resolve('src/'),
          loader: 'isparta'
        }]
      }
    },
    webpackMiddleware: {
      noInfo: true
    },
    frameworks: ['mocha', 'expect']
  });
};
