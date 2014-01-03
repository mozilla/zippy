var zippy_config = require('./lib/config');
var locales = zippy_config.supported_locales;


module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    abideCreate: {
      default: { // Target name.
        options: {
          template: 'locale/templates/LC_MESSAGES/messages.pot', // (default: 'locale/templates/LC_MESSAGES/messages.pot')
          locales: locales,
          localeDir: 'locale',
        }
      }
    },
    abideExtract: {
      js: {
        src: 'lib/**/*.js',
        dest: 'locale/templates/LC_MESSAGES/messages.pot',
        options: {
          language: 'JavaScript',
        }
      },
      html: {
        src: 'templates/payments/*.html',
        dest: 'locale/templates/LC_MESSAGES/messages.pot',
        options: {
          language: 'Jinja',
        }
      },
    },
    abideMerge: {
      default: { // Target name.
        options: {
          template: 'locale/templates/LC_MESSAGES/messages.pot', // (default: 'locale/templates/LC_MESSAGES/messages.pot')
          localeDir: 'locale',
        }
      }
    },
    abideCompile: {
      json: {
        dest: 'media/locale/',
        options: {
          type: 'json',
        }
      },
      mo: {
        options: {
          type: 'mo',
        }
      }
    },
    bunyan: {
      strict: true, // prevent non-bunyan logs from being outputted
      level: 'trace', // show all the things!
      output: 'short', // least verbose
    },
    nodemon: {
      server: {
        options: {
          file: 'main.js',
          args: ['-p', grunt.option('port'),
                 grunt.option('noauth') ? '-n': ''],
          ignoredFiles: ['README.md', 'node_modules/**'],
          watchedExtensions: ['js', 'html'],
          delayTime: 1,
          legacyWatch: false,
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
    },
    shell: {
      docs: {
        options: {
          stdout: true,
          execOptions: { cwd: 'docs' },
        },
        command: 'make html'
      }
    },
  });

  grunt.registerTask('runtests', 'Run all test files or just one if you specify its filename.', function(testSuite) {
    testSuite = testSuite || grunt.option('testsuite');
    process.env.NODE_ENV = 'test';

    // Add full tracebacks for testing. Supposedly this is too slow to
    // run in prod. See https://github.com/kriskowal/q#long-stack-traces
    require('q').longStackSupport = true;

    require('./test/runtests')({
      onStop: this.async(),
      reporter: 'default',
      testSuite: testSuite,
      testName: grunt.option('test'),
    });
  });

  grunt.loadNpmTasks('grunt-bunyan');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-i18n-abide');

  grunt.registerTask('test', ['jshint', 'runtests']);
  grunt.registerTask('default', ['jshint', 'stylus']);
  grunt.registerTask('start', ['stylus', 'concurrent:dev']);
  grunt.registerTask('server', ['nodemon:server']);
  grunt.registerTask('docs', ['shell:docs']);
};
