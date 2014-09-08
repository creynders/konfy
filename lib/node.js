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
var _tpl = require( 'underscore-tpl' );

var defaults = {
    configFile       : process.cwd() + '/config.json',
    values           : {},
    templateSettings : _tpl.templateSettings
};

function loadEnv( opts ){
    if( opts && opts.dotenvFile ){
        dotenv._getKeysAndValuesFromEnvFilePath( opts.dotenvFile );
        dotenv._setEnvs();
    }else{
        dotenv.load();
    }
    process.env.ENV_LOADED = process.env.NODE_ENV || "default";
}

function loadConfig( options,
                     callback ){
    var opts = _.defaults( options, defaults );
    var data = require( opts.configFile );
    var merged = _.merge( {}, opts.values, process.env );
    var config = _tpl( data, merged, opts.settings );
    if( callback ){
        callback( null, config );
    }
}

function load( options,
               callback ){
    if( options ){
        if( _.isFunction( options ) ){
            callback = options;
            options = {};
        }
    }else{
        options = {};
    }
    var nodeEnv = process.env.NODE_ENV || "default";
    if( process.env.ENV_LOADED !== nodeEnv ){
        loadEnv( options );
    }
    loadConfig( options, callback );
}

module.exports = {
    defaults : defaults,
    load     : load,
    loadEnv  : loadEnv
};