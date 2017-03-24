var clc = require('cli-color');
var error = clc.red.bold;
var warn = clc.red.underline;
var notice = clc.xterm(11);

var log = module.exports = {} ;

log.log = function( msg ){
	console.log(notice( msg ));
}

log.warn = function( msg ){
	console.log(warn( msg ));
}

log.error = function( msg ){
	console.log( error( msg ) );
}