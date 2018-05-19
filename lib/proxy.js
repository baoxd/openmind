// 设置浏览器代理
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var util = require('./util');
var log = require('./log');
var file = require('./file');
var url = require('url');
var mime = require('mime-types');
var combo = require('static-combo');
var serveIndex = require('serve-index');
var finalhandler = require('finalhandler');
var httpProxy = require('http-proxy');
var configPath = path.resolve(__dirname, 'config.json');
var configData ;
var proxy = module.exports = {} ;

proxy._init = function(argv){

	var self = this,
		port ;
	self.argv = argv ;
	var qts = [{
		type:"input",
		name:"port",
		default:"80",
		message:"请输入要代理服务的端口号："
	}];

	inquirer.prompt(qts).then(function(aws){
		port = aws.port;

		if(isNaN(port)){
			qts = [{
				type:"input",
				name:"port",
				default:"80",
				message:"请输入数字："
			}];
			inquirer.prompt(qts).then(function(aws){
				self.port = aws.port;
				self.startServer();
			});
		}else{
			self.port = port ;
			self.startServer();
		}
	});
}
// 开始server服务
proxy.startServer = function(){
	var self = this,
		argv = self.argv,
		port = self.port * 1 ,
		server;
	util.portIsOccupied(port).then(function(pid){
		if(pid){
			log.warn(port + '端口已被占用');
			return;
		}
		// 开启https服务
		if(port == 443){
			if(!configData){
				configData = require(configPath);
			}
			
			var options = {
				key:fs.readFileSync(path.resolve(__dirname,configData.https.key)),
				cert:fs.readFileSync(path.resolve(__dirname,configData.https.cert))
				// ca:fs.readFileSync(path.resolve(__dirname,configData.https.ca))
			};
			try{
				server = https.createServer(options,self.requestCallback.bind(self));
				server.listen(port,function(){
					listenCallback(true);
				});
			}catch(e){
				log.error(e);
			}
			
		}else{
			server = http.createServer(self.requestCallback.bind(self));
			server.listen(port,function(){
				listenCallback(false);
			});
		}
	}).catch(function(e){
		log.error(e);
	});

	function listenCallback(isHttps){
		log.log('服务已经开启: ' + (isHttps?'https':'http') + '://' + util.getLocalIp() + ':' + port);
	}
}
// server的
proxy.requestCallback = function(req, res){

	var self = this,
		argv = self.argv,
		urlobj = url.parse(req.url),
		pathname = urlobj.pathname,
		extname = path.extname(pathname);


	// 客户端请求存在文件后缀
	if(extname){
		// 本地代理
		if(argv.l){
			self.local(req,res,extname);
		}else{
			self.proxy(req,res);
		}
	}else{
		if(!configData){
			configData = require(configPath);
		}
		var done = finalhandler(req,res);
		var index = serveIndex(path.join(configData.svntest), {'icons': true});
		index(req,res,done);
	}
}

// 服务端错误处理
proxy.fail = function(res, code, err){
	var msg = err ? ('<p>' + err + '</p>') : '<center><h1>404 Not Found</h1></center><hr><center>';
	res.writeHead(code, {
		'Content-Type': 'text/html;charset=UTF-8'
	});
	res.end(msg);
}

// 服务端发送数据
proxy.end = function(req,res,data,extname){
	var length = Buffer.isBuffer(data) ? Buffer.byteLength(data.toString()) : Buffer.byteLength(data);
	res.writeHead(200,{
		'Content-type':mime.lookup(extname) + ';charset=UTF-8',
		'Content-Length':length
	});
	res.end(data);
	log.log(req.url + '请求成功');
}

proxy.local = function(req, res, extname){
	var self = this;

	if(!configData){
		configData = require(configPath);
	}
	// configData.svntest = configData.svntest.replace(/\\/g,"\\\\");
	if(/js|css/.test(extname)){
		combo.config({
			'base_path': configData.svntest,
			'compress': false,
			'js_module': {
				'AMD': {
					'baseUrl': configData.svntest
				}
			}
		});

		combo(req.url, function(err,data,deps){
			if(err){
				self.fail(res, 500, err);
				log.error(err);
				return;
			}
			self.end(req,res, data, extname);
		});
	}else{
		console.log(path.join(configData.svntest,req.url));
		file.sendFile(path.join(configData.svntest,req.url), res).then(function(data){
			if(!data){
				log.warn('没有获取到路径: ' + req.url + '的数据');
				self.fail(res,404);
				return;
			}
			// self.end(req,res, data, extname);
		}).catch(function(e){
			self.fail(res,505,e);
			log.error(e);
		});
	}
}

var proxyClient = httpProxy.createProxyServer({})
// 开启http代理
proxy.proxy = function(req,res){
	var self = this ,
		argv = self.argv ;
	if(!configData){
		configData = require(configPath);
	}
	var host = configData.host,
		target = argv.t ? configData.test : configData.online;

	proxyClient.on('error', function(e){
		log.error(e);
	});

	proxyClient.on('proxyReq', function(proxyReq, req, res, options) {
		proxyReq.setHeader('HOST', host);
		proxyReq.setHeader('X-Real-Ip', util.getLocalIp());
		proxyReq.setHeader('X-Forwarded-For', util.getLocalIp());
	});

	proxyClient.web(req, res, {
		target: 'http://' + target,
		changeOrigin: true
	});

}
