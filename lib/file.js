var fs = require('fs-extra');
var log = require('./log');

var defaultChmod = 755;

// desc:将json数据写入path路径
// path:文件路径
// json:json数据
exports.writeJSON = function(path, json,callback){
	try{
		fs.writeJsonSync(path, json);
		// fs.chmodSync(path, defaultChmod);
		if(callback){
			callback();
		}
	}catch(e){
		log.error(e);
	}
}

// desc: 获取指定路径的json数据
// path: 文件路径
exports.readJSON = function(path){
	try{
		return fs.readJsonSync(path);
	}catch(e){
		log.error('获取数据失败');
		log.error(e);
	}
}

// 发送客户端请求文件
exports.sendFile = function(path,res){
	return new Promise(function(resolve,reject){
		fs.exists(path,function(exists){
			if(exists){
				var list = [],
					buf ,
					size = 0;
				var rs = fs.createReadStream(path);
				rs.pipe(res);
				resolve(true);
				// rs.on('data',function(data){
				// 	list.push(data);
				// 	size += data.length;
				// });
				// rs.on('end',function(){
				// 	buf = Buffer.concat(list,size);
				// 	resolve(buf);
				// });
			}else{
				resolve(false);
			}
		});
	});
}