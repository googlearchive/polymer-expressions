// Copyright 2013 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

module.exports = function(grunt) {

  // recursive module builder
  var path = require('path');
  function readManifest(filename, modules) {
    modules = modules || [];
    var lines = grunt.file.readJSON(filename);
    var dir = path.dirname(filename);
    lines.forEach(function(line) {
      var fullpath = path.join(dir, line);
      if (line.slice(-5) == '.json') {
        // recurse
        readManifest(fullpath, modules);
      } else {
        modules.push(fullpath);
      }
    });
    return modules;
  }

  grunt.initConfig({
    karma: {
      options: {
        configFile: 'conf/karma.conf.js',
        keepalive: true
      },
      buildbot: {
        reporters: ['crbot'],
        logLevel: 'OFF'
      },
      'polymer-expressions': {
      }
    },
    concat: {
      expressions: {
        src: readManifest('build.json'),
        dest: 'polymer-expressions.min.js',
        nonull: true,
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', 'concat');
  grunt.registerTask('test', ['karma:polymer-expressions']);
  grunt.registerTask('test-buildbot', ['karma:buildbot']);
};
