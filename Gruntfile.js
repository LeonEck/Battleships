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
      options: {
        jshintrc: true
      },
      files: ['app.js', 'includes/**/*.js', 'test/**/*.js', 'integrationtest/**/*.js', 'js/**/*.js']
    },
    watch: {
      hint: {
        files: ['<%= jshint.files %>'],
        tasks: ['jshint']
      },
      test: {
        files: ['<%= mochaTest.test.src %>'],
        tasks: ['run_node', 'mochaTest', 'stop_node']
      }
    },
    mochaTest: {
      test: {
        src: ['test/**/*.js']
      }
    },
    jsdoc : {
      dist : {
        src: ['includes/**/*.js'],
        options: {
          destination: 'doc'
        }
      }
    },
    run_node: {
      start: {
        files: { src: [ 'app.js'] }
      }
    },
    stop_node: {
      stop: {}
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-run-node');

  grunt.registerTask('default', ['uglify']);
  grunt.registerTask('hint', ['jshint']);
  grunt.registerTask('test', ['jshint', 'run_node', 'mochaTest', 'stop_node']);
  grunt.registerTask('doc', ['jsdoc']);

};
