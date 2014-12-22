/**
 * Created by Omry_Nachman on 12/21/14.
 */
"use strict";
module.exports = function (grunt) {
  grunt.initConfig({
    src: {
      files: ['Gruntfile.js', 'src/**/*.js']
    },
    spec: {
      files: ['spec/**/*.js']
    },
    jshint: {
      files: ['<%= src.files %>', '<%= spec.files %>'],
      options: {
        eqeqeq: true,
        jasmine: true,
        node: true,
        globals: {
          jasmine: false,
          Promise: true,
          copyToGlobal: false,
          fail: false,
          getLastCommitFromCmd: false
        }
      }
    },
    simpleJasmine: {
      all: {}
    },
    watch: {
      files: ['<%= src.files %>', '<%= spec.files %>'],
      tasks: ['test']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-simple-jasmine');

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['jshint', 'simpleJasmine']);
};