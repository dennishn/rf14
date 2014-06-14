module.exports = function(grunt) {

  grunt.initConfig({

    // Various Grunt tasks...

    buildcontrol: {
      options: {
        dir: 'dist',
        commit: true,
        push: true,
        message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
      },
      pages: {
        options: {
          remote: 'git@github.com:example_user/example_webapp.git',
          branch: 'gh-pages'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-build-control');

  // Default task(s).
  grunt.registerTask('default', ['buildcontrol']);

};
