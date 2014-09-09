'use strict';

/* global describe, it, beforeEach */
/* jshint unused:false */

var _ = require( 'lodash' );
var sinon = require( 'sinon' );
var stub = require( 'proxyquire' ).noCallThru();
var expect = require( "must" );
var fx = require( './fixtures' );
var emptyConfig = {};

fx.defaultConfigFile = process.cwd() + '/config.json';

var subject = stub( '../lib/node', fx );

describe( "Konfy", function(){

    beforeEach( function(){
        fx[fx.defaultConfigFile] = emptyConfig;
        fx.dotenv.mocked.reset();
        delete process.env.ENV_LOADED;
    } );

    describe( "spec", function(){
        it( "should run", function(){
            expect( true ).to.be.true();
        } );
    } );// spec

    describe( "module", function(){
        it( "should be an object", function(){
            expect( subject ).to.be.an.object();
        } );
    } );// module

    describe( "#loadEnv", function(){
        it( "should be a function", function(){
            expect( subject.loadEnv ).to.be.a.function();
        } );
        it( "should delegate to dotenv#load when using defaults", function(){
            subject.loadEnv();
            expect( fx.dotenv.mocked.load.calledOnce ).to.be.true();
        } );
        it( "should delegate to dotenv#crappyAPI when providing custom path", function(){
            var payload = {
                dotenvFile : 'some/custom/path/anEnvFile'
            };
            subject.loadEnv( payload );
            expect( fx.dotenv.mocked._getKeysAndValuesFromEnvFilePath.calledWith( payload.dotenvFile ) ).to.be.true();
            expect( fx.dotenv.mocked._setEnvs.calledOnce ).to.be.true();
        } );
        it( "should reload environment values on every call", function(){
            subject.loadEnv();
            subject.loadEnv();
            expect( fx.dotenv.mocked.load.calledTwice ).to.be.true();
        } );
    } );// module#loadEnv

    describe( "#load", function(){
        it( "should expose a 'load' method", function(){
            expect( subject.load ).to.be.a.function();
        } );
        it( "should load the environment values", function(){
            subject.load();
            expect( fx.dotenv.mocked.load.calledOnce ).to.be.true();
        } );
        it( "should load the configuration file", function(){
            var spy = sinon.spy();
            subject.load( spy );
            expect( spy.calledWith( null, fx[fx.defaultConfigFile] ) ).to.be.true();
        } );
        it( "should expand placeholders in the configuration data with the passed in values", function(){
            var payload = {
                values : {
                    foo : "success"
                }
            };
            fx[fx.defaultConfigFile] = {
                foo : "<%= foo %>"
            };
            var passed;
            subject.load( payload, function(err, results){
                passed = results;
            } );
            expect( passed.foo ).to.equal(payload.values.foo);
        } );
        it( "should NOT reload the environment values once they've been loaded for the default node environment", function(){
            subject.load();
            subject.load();
            expect( fx.dotenv.mocked.load.calledOnce ).to.be.true();
        } );
        it( "should NOT reload the environment values once they've been loaded for a specific node environment", function(){
            process.env.NODE_ENV = "testing";
            subject.load();
            subject.load();
            expect( fx.dotenv.mocked.load.calledOnce ).to.be.true();
        } );
    } );

} );
