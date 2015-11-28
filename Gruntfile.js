module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'js/*.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      files: ['app.js', 'includes/**/*.js', 'test/**/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

  // JsHint task
  grunt.registerTask('hint', ['jshint']);

};