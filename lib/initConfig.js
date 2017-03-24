var file = require('./file');
var path = require('path');
var log = require('./log');

module.exports = {
	// configs: 初始化配置参数
	_init : function(configs){
		var filepath = path.resolve(__dirname , 'config.json' );
		file.writeJSON(filepath,configs);
		log.log('config.json 文件创建成功');
	}
}