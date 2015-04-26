module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      api: {
        src: 'api/**/*.js'
      }
    },
    watch: {
      app: {
        files: ['api/**'],
        tasks: ['jshint']
      }
    }
  });

  grunt.registerTask('lint', 'Lint the JavaScript',[
    'jshint'
  ]);

  grunt.registerTask('dev', 'Development Mode', [
    'watch'
  ]);

  grunt.registerTask('default', 'dev');
};
