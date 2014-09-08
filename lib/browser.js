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
                        opts.error( xhr );
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
    values           : {},
    templateSettings : _tpl.templateSettings
};

function parseConfig( data,
                      opts,
                      callback ){
    var config = _tpl( data, opts.values, opts.templateSettings );
    if( callback ){
        callback( null, config );
    }
}

function loadConfig( options,
                     callback ){
    var opts = _.defaults( options, defaults );
    var $ = opts.$ || module.exports.$;
    if( !$ || !$.ajax ){
        throw new Error( 'Konfy: A jquery compatible library is required!' );
    }
    $.ajax( {
        url    : options.configFile,
        method : "GET",

        success : function( data ){
            return parseConfig( data, options, callback );
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
    if( options ){
        if( _.isFunction( options ) ){
            callback = options;
            options = {};
        }
    }else{
        options = {};
    }
    loadConfig( options, callback );
}

module.exports = {
    defaults : defaults,
    load     : load,
    $        : $
};