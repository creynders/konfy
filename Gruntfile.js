'use strict';

module.exports = function( grunt ){
    // Show elapsed time at the end
    require( 'time-grunt' )( grunt );
    // Load all grunt tasks
    require( 'jit-grunt' )( grunt, {
        mochacli : "grunt-mocha-cli"
    } );

    // Project configuration.
    grunt.initConfig( {
        jshint   : {
            options   : {
                jshintrc : '.jshintrc',
                reporter : require( 'jshint-stylish' )
            },
            gruntfile : {
                src : 'Gruntfile.js'
            },
            lib       : {
                src : ['lib/**/*.js']
            },
            specs     : {
                src : ['specs/**/*.js']
            }
        },
        mochacli : {
            options : {
                reporter : "spec"
            },
            node    : ['specs/node.spec.js']
        }
    } );

    grunt.registerTask( 'test', ['jshint', 'mochacli'] );

    // Default task.
    grunt.registerTask( 'default', ['jshint'] );
};
