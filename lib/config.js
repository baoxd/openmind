var file = require('./file');
var fs = require('fs');
var path = require('path');
var log = require('./log');
var util = require('./util');

var config = module.exports = {} ;
var configPath = path.resolve(__dirname, 'config.json');

config._init = function(argv){
	if(argv.l){
		this.list();
	}
	var _ = argv._;
	var key = _[1];
	if(key){
		if(argv.s){
			var value = _[2];
			if(key && value){
				this.set(key, value);
			}
		}
		if(argv.g){
			if(key){
				this.get(key);
			}
		}
		if(argv.d){
			this.delete(key);
		}
	}
}
// 列出所有参数
config.list = function(){
	// var json = file.readJSON(configPath);
	// console.log(json);
	fs.createReadStream(configPath).pipe(process.stdout);
}
// 设置参数
config.set = function(key, value){
	var configData = require(configPath);
	var oriData = {} ;
	if(key == 'svntest' || key == 'svnonline'){
		console.log(value);
		if(/\\/g.test(value)){
			oriData[key] = path.resolve(value).replace(/\\/g,'\\\\') ;
		}else{
			oriData[key] = value;
		}
		console.log(oriData[key]);
	}else{
		oriData[key] = value ;
	}
	var _data = util.mix(configData, oriData);

	if(util.isObject(_data)){
		file.writeJSON(configPath, _data , function(){
			log.log('参数设置成功');
		});
	}else{
		log.warn('参数格式错误');
	}
}
// 获取某个参数
config.get = function(key){
	var configData = require(configPath);
	console.log(configData[key]);
}

config.delete = function(key){
	var configData = require(configPath);
	if(configData[key]){
		delete configData[key];
		file.writeJSON(configPath, configData, function(){
			log.log(key + '删除成功');
		});
	}else{
		log.warn(key + '不存在');
	}
}