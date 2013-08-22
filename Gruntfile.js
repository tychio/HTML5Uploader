module.exports = function (grunt) {
'use strict';
    grunt.initConfig({
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
        watch: {
            scripts: {
                files: ['uploader.js'],
                tasks: ['uglify']
            }
        },
        jslint: {
            files: [
                '*.js'
            ],
            exclude: [
                '*.js'
            ],
            directives: {
                browser: true,
                unparam: true,
                todo: true
            },
            options: {
                junit: 'out/junit.xml',
                log: 'out/lint.log',
                jslintXml: 'out/jslint_xml.xml',
                errorsOnly: true
                ,
                failOnError: false,
                shebang: true,
                checkstyle: 'out/checkstyle.xml'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jslint');

    grunt.registerTask('default', ['uglify', 'watch']);
    grunt.registerTask('hint', ['jslint']);
}