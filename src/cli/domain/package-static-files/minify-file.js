'use strict';

var babel = require('babel-core');
var babelPresetEnv = require('babel-preset-env');
var CleanCss = require('clean-css');
var uglifyJs = require('uglify-js');

module.exports = function(fileType, fileContent, ocOptions){

  if(fileType === '.js'){

    var presetOptions = {
      targets: {
        browsers: 'ie 8',
        uglify: true
      },
      useBuiltIns: true,
      modules: false
    };

    var babelOptions = { presets: [[babelPresetEnv, presetOptions]] },
        es5 = babel.transform(fileContent, babelOptions).code;
    
    return uglifyJs.minify(es5, { fromString: true }).code;

  } else if(fileType === '.css'){
    
    return new CleanCss().minify(fileContent).styles;
  }

  return fileContent;
};
