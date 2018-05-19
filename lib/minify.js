var imagemin = require('imagemin');
var imageminGifsicle = require('imagemin-gifsicle');
var imageminJpegtran = require('imagemin-jpegtran');
var imageminOptipng = require('imagemin-optipng');
var imageminSvgo = require('imagemin-svgo');
var imageminMozjpeg = require('imagemin-mozjpeg');
var imageminPngquant = require('imagemin-pngquant');
// var buildify = require('buildify');
var multistream = require('multistream');
var uglifyjs = require('uglify-js');
var prettyBytes = require('pretty-bytes');
var fs = require('fs');
var path = require('path');
// var os = require('os');
var log = require('./log');

var minify = module.exports = {};
var imgExtReg = /^.+\.(png|jpg|jpeg|gif|svg)$/ ;

minify._init = function(argv){
	this.argv = argv ;	

	if(!argv.i){
		log.log('请输入源文件路径');
		return;
	}
	if(!argv.o){
		log.log('请输入目的文件路径');
		return;
	}
	 if(!argv.t){
		log.log('请输入要压缩的文件类型');
		return;
	}

	if(argv && argv.t && argv.t == 'js'){
		// javascript压缩
		this.uglify();
	}else if(argv && argv.t && argv.t == 'img'){
		// 图片压缩
		this.imgmin();
	}
}

// JavaScript压缩、合并
minify.uglify = function(){
	var self = this,
		argv = self.argv,
		input = argv.i,
		output = argv.o ;

	fs.exists(input,function(exists){
		if(!exists){
			log.error('请输入正确的文件目录');
			return;
		}
		var inputParse = path.parse(input),
			outputParse = path.parse(output);
		// 判断目的目录是否存在
		fs.exists(outputParse.dir,function(exists){
			if(!exists){
				log.error('目标文件目录不存在');
				return;
			}
			var inputStat = fs.statSync(input),
				outputStat = fs.statSync(output),
				streams = [] ,
				// bufs = [],
				inputReadStream;

			if(outputStat.isDirectory()){
				output = path.join(output,'boundle.min.js');
			}

			if(inputStat.isDirectory()){
				fs.readdir(input,function(err,files){
					if(err){
						log.error('源目录读取失败..');
						log.error(error);
						return;
					}

					files.forEach(function(file){
						streams.push(fs.createReadStream(path.join(input,file)));
					});

					inputReadStream = multistream(streams) ;
					uglifyDo(inputReadStream,output);
				});
			}else if(inputStat.isFile()){
				uglifyDo(fs.createReadStream(input), output);
			}
		});
	});
	
	// bufs:Buffer数组
	function uglifyDo(inputReadStream,distPath) {
		var bufs = [] ;

		inputReadStream.on('data', function(data){
			bufs.push(data);
		});

		inputReadStream.on('end', function(){
			if (!bufs || !bufs.length) {
				log.log('获取源文件数据失败');
				return;
			}

			log.log('开始压缩...');
			var str = Buffer.concat(bufs).toString();
			var distParse = path.parse(distPath) ;

			var ret = uglifyjs.minify(str,{
				fromString : true,
				outSourceMap : distParse.base + ".map",
			});

			log.log('文件压缩成功！');

			fs.writeFile(distPath,ret.code, function(err){
				if(err){
					log.error('压缩数据保存失败');
					return;
				}
				log.log('压缩文件保存成功！');
				// 保存map信息
				fs.writeFile(path.join(distParse.dir, distParse.base + '.map'), ret.map, function(err){});
			});
		});

	}
}


// 图片压缩
minify.imgmin = function(){
	var self = this,
		argv = self.argv,
		input = argv.i ,
		output = argv.o ;

	fs.exists(path.join(input),function(exists){
		if(!exists){
			log.error('请输入正确的图片源路径');
			return;
		}
		var inStat = fs.statSync(input),
			outStat = fs.statSync(output),
			inArr = [];

		if(!outStat.isDirectory()){
			log.error('请输入正确的图片目的路径');
			return;
		}

		if(inStat.isFile()){
			if(imgExtReg.test(input)){
				inArr.push(input);
			}else{
				log.error('请输入正确的图片格式，支持的图片格式为: png、jpg、jpeg、gif、svg');
				return ;
			}
		}else if(inStat.isDirectory()){
			inArr.push( path.resolve(input) + path.sep + '*.{jpg,png,jpeg,gif,svg}');
		}else{
			log.error('你输入的图片源路径不是文件，也不是文件夹');
			return;
		}
		
		imagemin(inArr, output, {
			plugins: [
				imageminMozjpeg({
					targa: false
				}),
				imageminPngquant({
					quality: '65-80'
				}),
				imageminGifsicle({
					optimizationLevel: 3
				}),
				imageminJpegtran(),
				imageminOptipng(),
				imageminSvgo()
			]
		}).then(files => {
			// console.log(files);
			if(files && files.length){
				var len = files.length;
				files.forEach(function(file){
					// console.log(file);
					var data = file.data,
						distPath = file.path;
					fs.writeFile(distPath, data, function(err){
						if(err){
							log.error(err);
							return;
						}
						len--;

						if(len==0){
							log.log('图片压缩完成');
						}else{
							log.log('剩余' + len + '张图片...');
						}
					});
				});
			}
		}).catch(function(err) {
			console.log('图片压缩出错..');
			console.log(err);
		});
	});
}

