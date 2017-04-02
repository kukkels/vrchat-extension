module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            background: {
                options: {
                    transform: [['babelify', {presets: ['es2015']}]]
                },
                src: 'src/app/Background.js',
                dest: 'dist/js/background-bundle.js'
            }
        },
        watch: {
            default: {
                files: 'src/**',
                tasks: ['default']
            },
            debug: { 
                files: 'src/**',
                tasks: ['debug']
            }, 
        },
        uglify: {
            background: {
                files: {
                    'dist/js/background-bundle.js': ['dist/js/background-bundle.js']
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.registerTask('default', ['browserify', 'uglify', 'watch:default']);
    grunt.registerTask('debug', ['browserify', 'watch:debug']);
};
