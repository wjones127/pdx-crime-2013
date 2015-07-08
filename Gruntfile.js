module.exports = function(grunt) {

  grunt.initConfig({
    watch: {
      js: {
        files: ['src/*.js'],
        tasks: ['default']
      }
    },
    browserify: {
      'dist/bundle.js': 'src/index.js'
    },
    jshint: {
      files: ['src/*.js']
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['jshint', 'browserify']);
};
