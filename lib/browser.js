/*
 * 
 * http://github.com/creynders/konfy
 *
 * Copyright (c) 2014 Camille Reynders
 * Licensed under the MIT license.
 */
'use strict';

var _ = require( 'lodash' );
var _tpl = require( 'underscore-tpl' );

var $ = {
    ajax : function ajax( opts ){
        //based upon
        //http://stackoverflow.com/questions/9838812/how-can-i-open-a-json-file-in-javascript-without-jquery
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if( xhr.readyState === 4 ){
                if( xhr.status === 200 ){
                    if( opts.success ){
                        opts.success( JSON.parse( xhr.responseText ), xhr.status, xhr );
                    }
                }else{
                    if( opts.error ){
                        opts.error( new Error( 'Could not ' + opts.method + ' ' + opts.url + ', status: ' + xhr.status ) );
                    }
                }
            }
        };
        xhr.open( opts.method, opts.url, true );
        xhr.send();
    }
};

var defaults = {
    configFile       : 'config.json',
    config           : {},
    templateSettings : _tpl.templateSettings
};

function parseConfig( data,
                      opts,
                      callback ){
    opts.config = _tpl( data, opts.config, opts.templateSettings );
    if( callback ){
        callback( null, opts.config );
    }
    return opts.config;
}

function loadConfig( options,
                     callback ){
    var opts = _.defaults( {}, options, defaults );
    var $ = opts.$ || module.exports.$;

    if( !$ || !$.ajax ){
        throw new Error( 'Konfy: A jquery compatible library is required!' );
    }
    $.ajax( {
        url    : opts.configFile,
        method : "GET",

        success : function( data ){
            return parseConfig( data, opts, callback );
        },

        error : function( err ){
            if( callback ){
                callback( err );
            }
        }
    } );
}

function load( options,
               callback ){
    if( options && _.isFunction( options ) ){
        callback = options;
        options = undefined;
    }
    loadConfig( options, callback );
}

module.exports = {
    defaults : defaults,
    load     : load,
    $        : $
};