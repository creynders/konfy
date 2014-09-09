'use strict';
var _ = require( 'lodash' );
var sinon = require( 'sinon' );

module.exports = function(methods){
    var spies = {};
    var mock = {
        mocked : {
            reset : function(){
                _.forEach( spies, function( spy ){
                    spy.reset();
                } );
            }
        }
    };
    
    _.forEach( methods, function( name ){
        var spy = spies[name] = sinon.spy();
        mock[name] = function(){
            spy.apply(null, _.toArray(arguments));
        };
        mock.mocked[name] = spy;
    } );
    
    return mock;
};
