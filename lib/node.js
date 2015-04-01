/*
 *
 * http://github.com/creynders/konfy
 *
 * Copyright (c) 2014 Camille Reynders
 * Licensed under the MIT license.
 */

'use strict';
var dotenv = require( 'dotenv' );
var _ = require( 'lodash' );
var path = require( 'path' );
var _tpl = require( 'underscore-tpl' );

var defaults = {
    configFile       : 'config.json',
    cwd              : process.cwd(),
    dotenvFile       : ".env",
    templateSettings : _tpl.templateSettings,
    config           : {}
};

function doLoadEnv(opts){
    if( !process.env.NODE_ENV ){
        process.env.NODE_ENV = "development";
    }
    dotenv._getKeysAndValuesFromEnvFilePath( opts.dotenvFile );
    dotenv._getKeysAndValuesFromEnvFilePath( opts.dotenvFile + "." + process.env.NODE_ENV );
    process.env.ENV_LOADED = process.env.NODE_ENV;
    dotenv._setEnvs();
    console.log( "[Konfy] loaded env variables for '" + process.env.NODE_ENV + "'" );
}

function loadEnv( opts ){
    opts = _.defaults({}, opts, defaults);
    doLoadEnv(opts);
}

function loadConfig( options,
                     callback ){
    var data;
    try{
        data = require( path.join( process.cwd(), options.configFile ) );
    } catch( e ) {
        //we want this to be suppressed
        data = {};
    }
    var merged = _.defaults( {}, options.config, process.env );
    options.config = _tpl( data, merged, options.templateSettings );
    if( callback ){
        callback( null, options.config );
    }
    return options;
}

function load( options,
               callback ){
    if( options && _.isFunction( options ) ){
        callback = options;
        options = undefined;
    }
    options = _.defaults( {}, options, defaults );
    process.chdir( options.cwd );
    if( !process.env.ENV_LOADED || process.env.ENV_LOADED !== process.env.NODE_ENV ){
        doLoadEnv( options );
    }
    return loadConfig( options, callback );
}

module.exports = {
    defaults : defaults,
    load     : load,
    loadEnv  : loadEnv
};
