var http = require('http');

var zippy = require('./lib');
var zippyConfig = require('./lib/config');
var locales = zippyConfig.supportedLocales;


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
      },
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
        'test/suite/*.js',
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
    casper: {
      options : {
        test : true,
      },
      runtests : {
        src: ['uitest/suite/test.*.js'],
      }
    },
    clean: {
      uitest: ['uitest/captures']
    },
    bower: {
      install: {
        options: {
          targetDir: 'media/lib',
          layout: 'byType',
          install: true,
          bowerOptions: {
            // Do not install project devDependencies
            production: true,
          }
        }
      }
    }
  });

  // Always show stack traces when Grunt prints out an uncaught exception.
  grunt.option('stack', true);

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

  grunt.registerTask('runuitests', 'Spin up a test server instance and run casper tests', function() {
    var server = http.createServer(zippy.createApp({}));
    var port = zippyConfig.uitestServerPort;
    server.listen(port, function onServerStart() {
      var addr = this.address();
      grunt.log.writeln('listening at %s:%s', addr.address, addr.port);
    });
    grunt.task.run('casper:runtests');
  });

  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-casper');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-i18n-abide');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['jshint', 'stylus']);
  grunt.registerTask('docs', ['shell:docs']);
  grunt.registerTask('start', ['stylus', 'concurrent:dev']);
  grunt.registerTask('server', ['nodemon:server']);
  grunt.registerTask('test', ['jshint', 'runtests']);
  grunt.registerTask('uitest', ['stylus', 'clean:uitest', 'runuitests']);
};
