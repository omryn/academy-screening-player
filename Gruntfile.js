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
    dredd: {
      options: {
        server: 'http://localhost:3456',
        src: './apiary.apib'
      }
    },
    express: {
      app: {
        options: {
          script: './bin/www',
          debug: false,
          port: 3456,
          node_env: 'test-api'
        }
      }
    },
    watch: {
      test: {
        files: ['<%= src.files %>', '<%= spec.files %>'],
        tasks: ['jshint', 'simpleJasmine', 'test-api']
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-dredd');
  grunt.loadNpmTasks('grunt-simple-jasmine');

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['jshint', 'simpleJasmine', 'test-api']);
  grunt.registerTask('test-api', ['express:app', 'dredd', 'express:app:stop']);
  grunt.registerTask('test-unit', ['simpleJasmine']);
  //grunt.registerTask('watch');
};