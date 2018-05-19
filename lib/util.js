var lsofi = require('lsofi');
var net = require('net');
var tls = require('tls');
var fs = require('fs');
var os = require('os');
var path = require('path');
var log = require('./log');
var util = {} ;

// desc: 合并对象
// desObj: 目的对象
// oriObj:  源对象
util.mix = function(desObj, oriObj){
	if(desObj && oriObj){
		for(var k in oriObj){
			if(oriObj.hasOwnProperty(k)){
				desObj[k] = oriObj[k];
			}
		}
	}
	return desObj;
}

// 判断端口号是否被占用
util.portIsOccupied = function(port){
	return new Promise(function(resolve, reject){
		// Isofi包在判断端口是否被占用时有问题
		// return lsofi(port).then(function(pid){
		// 	resolve(pid);
		// });
		var server ;
		if(port == 443){
			var configData = require('./config.json');
			log.log('======= 获取公钥和证书.... ');
			try{
				var options = {
					key:fs.readFileSync(path.resolve(__dirname,configData.https.key)),
					cert:fs.readFileSync(path.resolve(__dirname,configData.https.cert))
				};
			}catch(e){
				log.log('公钥和证书获取失败');
				log.error(e);
				resolve(true);
			}
			server = tls.createServer(options).listen(port);
		}else{
			server = net.createServer().listen(port)
		}

		server.on('listening', function() {
			server.close()
			resolve(false);
		})
		server.on('error', function(err) {
			// 查询占用端口进程号
			lsofi(port).then(function(pid){
				resolve(pid);
			});
			console.log(err);
			if (err.code === 'EADDRINUSE') {
				resolve(true);
			}
		})
	});
}

// 获取本机IP地址
util.getLocalIp = function() {
	var ip = '127.0.0.1',
		interfaces = os.networkInterfaces();

	for (item in interfaces) {
		for (att in interfaces[item]) {
			var address = interfaces[item][att],
				family = address.family,
				internal = address.internal,
				address = address.address;
			// console.log('Family: ' + address.family);
			// console.log('IP Address: ' + address.address);
			// console.log('Is Internal: ' + address.internal);
			// 联网中
			if(family == 'IPv4' && internal){
				ip = address;
				return ip ;
			}
		}
	}
	return ip ;
}

// 是否是图片、js、css等静态资源
util.isStaticFile = function(extname){
	return /js|css|jpg|JPG|png|PNG|gif|GIF/.text(extname);
}

function getType(obj){
	var toString = Object.prototype.toString ;
	var objReg = /^\[object (\w+)\]$/; 
	return toString.call(obj).replace(objReg, '$1').toLowerCase();
}

util.isObject = function(obj){
	return getType(obj) == 'object';
}

util.isArray = function(){
	return getType(obj) == 'array';
}

util.isFunction = function(){
	return getType(obj) == 'function';
}

module.exports = util;