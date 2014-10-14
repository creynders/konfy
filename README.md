# Konfy [![Build Status](https://secure.travis-ci.org/creynders/konfy.png?branch=master)](http://travis-ci.org/creynders/konfy)

> Configuration of node and webapps made easy

There are tons of modules that allow you to configure your apps, but all of them (or at least the ones I tried) seem to do too much or not enough or are clumsy in use.

So I set out to create a configuration utility which will do exactly what I need and with following goals:

* **API symmetry in both node and the browser**.
* Extremely **easy setup**.
* Allows the use of **ENV variables**.
* Variable **interpolation of the configuration data**.
* **Easy integration with existing build tools and package managers**: Grunt, Gulp, Broccoli, Bower et cetera.

## Getting Started

### Node

#### Installation

Install the module with `npm install konfy`

#### Usage

```js
var konfy = require('konfy');
konfy.load(function(err, config){
	if(err) return console.log('Oh noes!');
	console.log(config);
});
```

This will:

* load a `.env` file with environment variables.
* load a `config.json` file with configuration data.
* interpolate the configuration data if necessary.

Both files are loaded from the root of your project (unless otherwise configured.)

### Browser(ify)

#### Installation

Install the module with `npm install konfy` (or `bower install konfy` but be sure to [read the section on how to use Konfy with Bower](#bower)).

#### Usage

Konfy is used in conjunction with [browserify][browserify] and should be used in two phases:

1. **pre-browserification**: the ENV variables need to be loaded before [browserify][browserify] compiles the client-side code.

	```js
	var konfy = require('konfy');
	konfy.loadEnv();
	```

	This loads a `.env file` from the root of your _project_.

2. **client source**: The actual loading of the configuration data

	```js
	var konfy = require('konfy');
	konfy.load(function(err, config){
		if(err) return console.log('Oh noes!');
		console.log(config);
	});
	```

	This will load a `config.json` from the root of your _application_ and interpolates its data.

Follow [browserify][browserify] guidelines for adding the compiled js file to your html.

## Documentation

### Overview

Konfy does a number of things under the hood. Since building webapps can be pretty complex with varying approaches it's good to have a clear understanding of what Konfy does exactly.

#### Environment variables

Konfy uses [dotenv][dotenv] which

>loads environment variables from .env into ENV (process.env)

If for example your `.env` file contains the following:

```
THE_ANSWER = 42
```

Then you can access that value with `process.env.THE_ANSWER`, e.g.:

```js
console.log(process.env.THE_ANSWER);
```

Depending on the value of `NODE_ENV` a different dotenv file will be loaded. If `NODE_ENV` is set to "production" a file `.env.production` will be loaded. This allows you to declare different values depending on the environment your code runs in.

When used with [browserify][browserify] all environment variables are processed using [envify][envify], which is a browserify transform that will:

>replace your environment variable checks with ordinary strings.

In other words once browserify finishes bundling, all `process.env.<VARIABLE>` references will be replaced by the values as defined in the `.env` file(s). Only the variables you use (in your client-side code) will be included, so you don't have to worry about secret values leaking through.

Just to be clear and drive home the point: **YOU SHOULD NEVER, EVER USE SECRET (ENV) VALUES IN YOUR CLIENT-SIDE CODE**, since they won't remain secret.

#### Configuration file

Next the configuration file is loaded:

* **Node**: The configuration data is simply `require`'d. This also means that you could use a `.js` file instead of `.json`.
* **Browser**: The configuration file is loaded with an [XMLHttpRequest][xmlhttprequest]. There's two reasons why this happens dynamically:
	1. Browserify (and brfs for instance) can't resolve dynamic file names for `require`'s other than those using `__dirname`.
	1. This is obviously a matter of preference, but I rather have my configuration data loaded on-the-fly, otherwise any changes in the configuration data will force me to recompile my application. On the roadmap: allowing browserified configuration data.

#### Processing

Once the configuration data is loaded it is processed with [underscore-tpl]. Which is like:

> _.template for objects

I.e. it will translate all ERB-style (or mustache, if so configured) tags in your configuration data to the values you feed it with.

For example:

```js
var configData = {
    gangsta : "<%= badass %>"
};
var values = {
    badass : "Jules Winfield"
};

console.log( _tpl( configData, values ) );
//outputs: { gangsta: 'Jules Winfield' }
```

---

:exclamation: **N.B.:**

**In node** the `_tpl` function is fed with a consolidation of the values defined in your `.env` file and the values you pass to `konfy.load`. This allows you to spread the declaration of your configuration values as you see fit.

E.g. using the above example `.env` file with :

```js
//file: config.json
{
	"answer": "<%= THE_ANSWER %>"
}
```

Will result in a configuration object with value `42` for key `answer`.

**To achieve the same in the browser** you need to pass the required `process.env` values to the `values` object of the Konfy configuration object.

E.g.:

```js
//file: main.js
konfy.load({
	values: {
		theAnswer: process.env.THE_ANSWER
	}
});
```

```js
//file: config.json
{
	"answer": "<%= theAnswer %>"
}
```

This too will result in a configuration object with value `42` for key `answer`.

The extra assignment is necessary to force `envify` to process the appropriate `env` values, i.e. they have to be explicitly declared _somewhere_.
On the roadmap: avoiding this extra step.

---

#### Callback

When ready Konfy calls a typical node callback with `function(err, data)` signature. (On the roadmap: integration of promises)

### API

#### **$** `konfy.$` (available in: browser)

**Konfy uses an [XMLHttpRequest][xmlhttprequest] instance** to load the configuration file, however it's **made [JQuery][jquery] compatible**. If you want Konfy to use JQuery instead you can assign it to the `$` property.

```js
//use the global $ object
var konfy = require('konfy');
konfy.$ = $;
```

```js
//or when making jquery available through browserify
var konfy = require('konfy');
konfy.$ = require('jquery');
```

#### **load** `konfy.load([options], [callback])` (available in: Node, browser)

First loads the environment variables from `.env` (if this hasn't happened already and only when run in node) and then loads the `config.json` file containing the application configuration data. `options` is an optional object allowing the configuration of konfy with:

* `options.$` [Object] Allows overriding/setting the library used to load the configuration file.

	```js
	//use the global $ object
	konfy.load({
		$: $
	});
	```

* `options.configFile` [String] default: 'config.json', Allows overriding the default filename and path for the `config.json` file.

	```js
	konfy.load({
		configFile : "config/globals.json"
	});
	```

* `options.templateSettings` [Object] Allows overriding the template settings of [underscore-tpl][underscore-tpl]
	
	```js
	konfy.load({
		templateSettings : {
			mustache : true
		}
	});
	```

* `options.values` [Object] Allows feeding the configuration data with values for variable interpolation.
	
	```js
	konfy.load({
		values : {
			foo: "foo"
		}
	});
	```

#### **loadEnv** `konfy.loadEnv([options])` (available in: Node)

Loads the `.env` file containing the ENV variable values.
`options` is an optional object allowing the configuration of konfy with:

* `options.dotenv` [String] default: '.env', Allows overriding the default filename and path for the `.env` file. You should NOT include the NODE_ENV value in the filename, this will automatically by appended.

	```js
	konfy.loadEnv({
		dotenv: "env/.env"
	});
	```

### Integration with other tools

#### Build tools

Konfy's only requirement is that the ENV values are loaded _before_ the browserification starts.

E.g. in Grunt

```js
//file: Gruntfile.js
'use strict';

var konfy = require('konfy');
konfy.loadEnv();

module.exports = function(grunt) {
  // Show elapsed time at the end
  require('time-grunt')(grunt);
  // ...
```

**Pro tip**:

If you want to use the environment variables in your grunt configuration too just make sure you pass the `process.env` object to the grunt configuration object:

```js
//file: Gruntfilejs

  grunt.initConfig({
  	env : process.env
    nodeunit: {
      	files: ['test/**/*_test.js']
    },
    someTask : {
    	options : {
    		foo  : '<%= env.FOO %>'
    	}
	}
	// ...
```	

#### Bower

Konfy is meant to be used with [npm][npm], but a `bower.json` file is provided as well. However you will still need the npm version of Konfy for browserification. The [Bower][Bower] version only includes the client-side code of Konfy.

In this case install Konfy as a development dependency through npm:

```shell
npm install -D konfy
```

And use bower to install the client side code:

```shell
bower install -S konfy
```

## Example

```
#file: .env.production
REMOTE_HOST = http://example.com
```

```js
//file: config/config.json
{
	"rest" : {
		"root" : "<%= API_URL %>",
		"users" : "<%= API_URL %>/users"
	}
}
```

```js
//file: main.js
var app = require('./app')();
var konfy = require('konfy');
konfy.load({
	configFile : "config/config.json",
	values : {
		API_URL : process.env.REMOTE_HOST
	}
},function(err, config){
	if(err){
		return console.log('Oh noes!');
	}
	app.start(config);
});
```

```js
//file: build.js
var browserify = require('browserify');
var fs =require('fs');

var konfy = require('konfy');
konfy.loadEnv();
var  b = browserify('./app/scripts/main.js');
var output = fs.createWriteStream('app/bundle.js');
b.bundle().pipe(output);
```

```shell
NODE_ENV=production node build.js
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com).


## License

Copyright (c) 2014 Camille Reynders  
Licensed under the MIT license.


[browserify]: http://browserify.org/
[underscore-tpl]: https://github.com/creynders/underscore-tpl
[dotenv]: https://github.com/scottmotte/dotenv
[envify]: https://github.com/hughsk/envify
[jquery]: http://jquery.com/
[lodash]: http://lodash.com/
[npm]: https://github.com/npm/npm
[bower]: http://bower.io
[xmlhttprequest]: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest
