module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodemon: {
      server: {
        options: {
          file: 'main.js',
          args: ['-p', grunt.option('port')],
          ignoredFiles: ['README.md', 'node_modules/**'],
          watchedExtensions: ['js', 'html'],
          delayTime: 1,
          legacyWatch: true,
          cwd: __dirname,
        }
      }
    },
    concurrent: {
      dev: {
        tasks: ['nodemon:server', 'watch'],
        options: {
          logConcurrentOutput: true,
        }
      }
    },
    jshint: {
      options: { jshintrc: __dirname + '/.jshintrc' },
      files: [
        '!media/js/lib/*.js',
        'Gruntfile.js',
        'lib/*.js',
        'main.js',
        'media/js/*.js',
        'test/*.js',
      ],
    },
    stylus: {
      options: {
        compress: false,
        banner: '/* Generated content - do not edit - <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        paths: ['media/stylus/lib', 'media/stylus/inc', 'media/images'],
        urlfunc: 'embedurl',
        import: [
          'lib/normalize',
          'inc/vars',
          'inc/mixins',
          'inc/global',
        ]
      },
      compile: {
        expand: true,
        cwd: 'media/stylus',
        src: ['*.styl', '!_*.styl'],
        dest: 'media/css/',
        ext: '.css',
      }
    },
    watch: {
      stylus: {
        files: ['media/**/*.styl', 'media/images/'],
        tasks: 'stylus',
      },
      jshint: {
        files: ['<%= jshint.files %>'],
        tasks: 'jshint',
      }
    }
  });

  grunt.registerTask('runtests', 'Run all test files or just one if you specify its filename.', function(testSuite) {
    testSuite = testSuite || grunt.option('testsuite');
    process.env.NODE_ENV = 'test';
    require('./test/runtests')({
      onStop: this.async(),
      reporter: 'default',
      testSuite: testSuite,
      testName: grunt.option('test'),
    });
  });

  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint', 'runtests']);
  grunt.registerTask('default', ['jshint', 'stylus']);
  grunt.registerTask('start', ['stylus', 'concurrent:dev']);
  grunt.registerTask('server', ['nodemon:server']);
};
