module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'main.js', 'statics/**/*.js', 'lib/*.js']
    },
    stylus: {
      options: {
        compress: false,
        banner: '/* Generated content - do not edit - <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        paths: ['statics/stylus/lib']
      },
      compile: {
        expand: true,
        cwd: 'statics/stylus',
        src: '*.styl',
        dest: 'statics/css/',
        ext: '.css'
      }
    },
    watch: {
      stylus: {
        files: ['statics/**/*.styl'],
        tasks: 'stylus'
      },
      jshint: {
        files: ['<%= jshint.files %>'],
        tasks: 'jshint'
      }
    }
  });

  grunt.registerTask('server', 'Start zippy server', function() {
    var tasks = grunt.cli.tasks;
    // Go async if run standalone without a watch task.
    if (tasks.indexOf('watch') == -1 && tasks.indexOf('start') == -1) {
      this.async();
    }
    var options = {
      port: grunt.option('port')
    };
    require('./main.js')(options);
  });

  grunt.registerTask('runtests', 'run all test files', function() {
    require('./test/runtests')({onStop: this.async(), reporter: 'grunt'});
  });

  //grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint', 'runtests']);
  grunt.registerTask('default', ['jshint', 'stylus']);
  grunt.registerTask('start', ['stylus', 'server', 'watch']);
};
