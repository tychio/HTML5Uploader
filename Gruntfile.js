module.exports = function (grunt) {
'use strict';
    grunt.initConfig({
        watch: {
            scripts: {
                files: ['uploader.js'],
                tasks: ['uglify']
            }
        },
        uglify: {
            options: {
                banner: '\/\/By Tychio\[code\@tychio\.net\]\n'
            },
            dist: {
                files: {
                    'uploader.min.js': 'uploader.js'
                }
            }
        },
        jshint: {
            files: [
                'uploader.js'
            ]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['uglify', 'watch']);
    grunt.registerTask('hint', ['jshint']);
}