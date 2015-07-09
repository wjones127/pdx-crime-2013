module.exports = function(grunt) {

    grunt.initConfig({
        watch: {
            js: {
                files: ['src/*.js'],
                tasks: ['js']
            },
            css: {
                files: ['src/sass/*.scss'],
                tasks: ['sass:dist']
            }
        },
        browserify: {
            'dist/bundle.js': 'src/index.js'
        },
        jshint: {
            files: ['src/*.js']
        },
        sass: {
            dist: {
                options: {
                    sourceMap : true
                },
                files: {
                    'dist/style.css' : 'src/sass/selection.scss'
                }

            }
        }
    });

    require('load-grunt-tasks')(grunt);
    grunt.registerTask('js', ['jshint', 'browserify']);
    grunt.registerTask('default', ['js', 'sass']);
};
