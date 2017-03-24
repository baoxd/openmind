// yargs options
module.exports = function(yargs) {
	return yargs.usage('Usage: opm <command> [options]')
		.command('init','初始化配置参数')
		.command('config','配置参数管理',function(yargs){
			return yargs.reset().option('l', {
					alias: 'list',
					describe: '配置参数列表',
					type: 'boolean'
				}).option('s', {
					alias: 'set',
					describe: '设置配置参数',
					type: 'boolean'
				}).option('g', {
					alias: 'get',
					describe: '获取配置参数',
					type: 'boolean'
				}).option('d', {
					alias: 'delete',
					describe: '删除配置参数',
					type: 'boolean'
				});
		})
		.command('minify', '文件压缩',function(yargs){
			return yargs.reset().option('i', {
					alias: 'input',
					describe: '压缩文件源路径路径（可以是文件、目录）',
					type: 'string'
				}).option('o', {
					alias: 'output',
					describe: '压缩文件目的路径（图片压缩必须是目录）',
					type: 'string'
				}).option('t',{
					alias:'type',
					describe:'压缩文件类型（img：图片、js：javascript文件，css：css文件）',
					type:'string'
				});
		})
		.command('proxy', '设置代理服务器',function(yargs){
			return yargs.reset().option('l', {
					alias: 'local',
					describe: '代理本地服务器',
					type: 'boolean'
				}).option('t', {
					alias: 'test',
					describe: '代理测试服务器',
					type: 'boolean'
				}).option('o', {
					alias: 'online',
					describe: '代理正式服务器',
					type: 'boolean'
				});
		})
		// .option('l', {
		// 	alias: 'local',
		// 	describe: '代理本地服务器',
		// 	type: 'boolean'
		// }).option('t', {
		// 	alias: 'test',
		// 	describe: '代理测试服务器',
		// 	type: 'boolean'
		// }).option('o', {
		// 	alias: 'online',
		// 	describe: '代理正式服务器',
		// 	type: 'boolean'
		// })
		.help('h')
		.alias('h', 'help');
		// .example('proxy命令: opm proxy -l ; opm proxy -t ; opm proxy -o')
		
}