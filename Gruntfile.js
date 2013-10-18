module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'main.js', 'statics/**/*.js', 'lib/*.js']
    },
    nodeunit: {
      all: ['test/*.test.js']
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

  grunt.registerTask('server', 'Start a custom web server', function() {
    var options = {
      port: grunt.option('port')
    };
    require('./main.js')(options);
  });

  //grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint', 'nodeunit']);
  grunt.registerTask('default', ['jshint', 'stylus']);
};
