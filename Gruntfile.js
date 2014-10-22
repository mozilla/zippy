var http = require('http');
var config = require('./lib/config');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    abideCreate: {
      default: { // Target name.
        options: {
          template: 'locale/templates/LC_MESSAGES/messages.pot', // (default: 'locale/templates/LC_MESSAGES/messages.pot')
          languages: config.supportedLanguages,
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
        dest: 'i18n',
        options: {
          type: 'json',
          createJSFiles: false,
        }
      },
    },
    nodemon: {
      server: {
        script: 'main.js',
        options: {
          args: ['-p', grunt.option('port'),
                 grunt.option('noauth') ? '-n': ''],
          ignore: ['README.md', 'node_modules/**', 'i18n/**', '../node_modules/**'],
          ext: 'js, html',
          delay: 5000,
          legacyWatch: false,
          cwd: __dirname,
        }
      }
    },
    concurrent: {
      dev: {
        tasks: ['nodemon:server', 'watch'],
        options: {
          logConcurrentOutput: false,
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
      options: {
        interval: 10000,
      },
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
          execOptions: { cwd: 'docs' },
          failOnError: true,
          stdout: true,
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
    },
  });

  // Always show stack traces when Grunt prints out an uncaught exception.
  grunt.option('stack', true);

  grunt.registerTask('runtests', 'Run all test files or just one if you specify its filename.', function(testSuite) {
    process.env.NODE_ENV = 'test';
    testSuite = testSuite || grunt.option('testsuite');
    require('./test/runtests')({
      onStop: this.async(),
      reporter: 'default',
      testSuite: testSuite,
      testName: grunt.option('test'),
    });
  });

  grunt.registerTask('runuitests', 'Spin up a test server instance and run casper tests', function() {
    process.env.NODE_ENV = 'test';
    // Require zippy here to avoid config not being set with env correctly.
    var zippy = require('./lib');
    var server = http.createServer(zippy.createApp({}));
    var port = config.uitestServerPort;
    server.listen(port, function onServerStart() {
      var addr = this.address();
      grunt.log.writeln('listening at %s:%s', addr.address, addr.port);
    });
    grunt.task.run('casper:runtests');
  });

  grunt.registerTask('server', 'Deprecated start up', function() {
    grunt.fail.fatal('There is no "server" command use grunt start instead');
  });

  if (process.env.IS_DOCKER) {
    // Workaround having node_modules in parent dir for Docker.
    grunt.file.expand('../node_modules/grunt-*/tasks').forEach(grunt.loadTasks);
  } else {
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-casper');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-i18n-abide');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-services');
    grunt.loadNpmTasks('grunt-shell');
  }

  grunt.registerTask('default', ['jshint', 'stylus']);
  grunt.registerTask('docs', ['shell:docs']);
  grunt.registerTask('start', ['stylus', 'concurrent:dev']);
  grunt.registerTask('test', ['abideCompile', 'startRedis', 'jshint', 'runtests']);
  grunt.registerTask('uitest', ['abideCompile', 'stylus', 'clean:uitest', 'runuitests']);
};
