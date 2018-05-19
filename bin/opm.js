#!/usr/bin/env node

// var optimist = require('optimist');
var yargs = require('yargs');
var argv = require('./config-yargs')(yargs).argv;
var path = require('path');
var fs = require('fs');
var inquirer = require('inquirer');
var opm = require('../lib/index');

// 子命令
var command = argv._[0];

if(!command){
	yargs.showHelp();
	return;
}else{
	var config = path.resolve(__dirname, '../lib' ,'config.json');
	if(!fs.existsSync(config)){
		createConfig();
	}else if(command == 'init'){
		var qts = [{
			type:"confirm",
			name:"initConfig",
			message:"config.json文件已经存在，确定重新创建吗？"
		}] ;
		inquirer.prompt(qts).then(function(aws){
			// console.log(aws);
			if(aws.initConfig){
				createConfig();
			}
		});
	}
	else{
		if(needShowHelp(argv, command)){
			yargs.showHelp();
		}else{
			if(!opm[command]){
				log.warn(command + '子命令不存在,请重新填写');
				return;
			}
			opm[command]._init(argv);
		}
	}
}

function createConfig(){
	var questions = [{
		type:"input",
		name:"svntest",
		message:"请输入测试环境对应的本地目录:"
	},{
		type:"input",
		name:"svnonline",
		message:"请输入正式环境对应的本地目录:"
	}];
	inquirer.prompt(questions).then(function(answers){
		opm.initConfig._init(answers);
	});
}

// 判断是否需要显示command的help信息
function needShowHelp(argv,command){
	var f = true;
	for(var k in argv){
		if(k != '_' && k != '$0' && argv.hasOwnProperty(k)){
			if(argv[k]){
				return false ;
			}
		}
	}
	return f ;
}
