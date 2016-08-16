const DiscordClient = require('./discord.io.js');
const bot = require("./UserPass.js").bot;//Dont open this file while streaming you dumbo.
const Twitter = require("./UserPass.js").twitter;
const mysql = require("./UserPass.js").mysql;
const fs = require('fs');
const combinate = require("Parsimmon");
const request = require('request');
//var youtubedl = require('youtube-dl');
const querystring = require('querystring');
const fp = require('path');
const reload = require('require-reload')(require);
selfID = "120308435639074816";
data={errors:[],ownMsgs:[],commandReplies:{}};
comInitiator={def:"/"};
/******************* MODULE MANAGERS ******************/
Modules=[];
function loadModules(){
	console.log("===================================================");
	console.log("=                 LOADING MODULES                 =");
	console.log("=                                                 =");
	fs.readdir( "Modules/", function( err, files ) {
        files.forEach( function( file, index ) {
			if(fp.extname(file)!=".js")return;
			watchModule(file);
			loadModule(file);
		});
		console.log("===================================================");
		//watchModules();
	});
}
Reloading=[];
function watchModule(mod){
	pad = new Array(39-mod.length).join(" ");console.log("= WATCHING: "+mod+pad+"=");
	fs.watch("./Modules/"+mod,(eventType,filename) => {
		if(eventType=="change"){reloadModule(filename);pad = new Array(36-filename.length).join(" ");console.log("= MOD CHANGED: "+filename+pad+"=");}
		else console.log(eventType+" => "+filename);
	});
}
function reloadModule(file){
	console.log(Reloading);
	for(k in Reloading){
		m=Reloading[k];
		if(m==file)return;
	}
	Reloading.push(file);
	pad1 = new Array(39-file.length).join(" ");
	console.log("= RELOADING "+file+pad1+"=");
	Modules[file].emit("unload",utils);
	setTimeout(()=>{
		Modules[file]=reload("./Modules/"+file);
		Modules[file].emit("load",utils);
		pad2 = new Array(40-file.length).join(" ");
		console.log("= RELOADED "+file+pad2+"=");
		Reloading.shift(Reloading.indexOf(file),1);
	},2000);
}
function loadModule(file){
	pad1 = new Array(41-file.length).join(" ");
	console.log("= LOADING "+file+pad1+"=");
	Modules[file]=require("./Modules/"+file);
	Modules[file].emit("load",utils);
	pad2 = new Array(42-Modules[file].name.length).join(" ");
	console.log("= LOADED "+Modules[file].name+pad2+"=");
}
function unloadModule(file){
	pad1 = new Array(39-Modules[file].name.length).join(" ");
	console.log("= UNLOADING "+file+pad1+"=");
	Modules[file].emit("unload",utils);
    delete require.cache[require.resolve("./Modules/"+file)];
	delete Modules[file];
	pad2 = new Array(40-file.length).join(" ");
	console.log("= UNLOADED "+file+pad2+"=");
}
/******************* MODULE UTILS ******************/
utils={
	mysql:mysql,
	twitter:Twitter,
	bot:bot,
	mods:Modules,
	init:comInitiator,
	sendMSG:(to,msg,del)=>{
		msg = msg.substr(0,2000); 
		del=typeof del!=='undefined'?del:[true,30000];
		bot.sendMessage({
			to: to,
			message: msg
		},function(d){
			data.ownMsgs.push(d.id);
			if(del[0]){
				setTimeout(utils.delMSG.bind(this,to,d.id),del[1]); 
			}
		});
	},
	reply:(event,msg,del)=>{
		msg = msg.substr(0,2000);
		del=typeof del!=='undefined'?del:[true,30000];
		edit=false;
		for(repk in data.commandReplies){
			rep = data.commandReplies[repk];
			console.log(repk+" = "+rep+" = "+event.id);
			if(repk==event.id){edit=rep;break;}
		}
		if(edit){
			console.log(event);
			console.log(edit);
			console.log(msg);
			utils.editMSG(event.channel_id,edit,msg);
		}else{
			bot.sendMessage({
				to: event.channel_id,
				message: msg
			},function(d){
				data.ownMsgs.push(d.id);
				data.commandReplies[event.id]=d.id;
				if(del[0]){
					setTimeout(utils.delMSG.bind(this,event.channel_id,event.id),del[1]); 
					setTimeout(utils.delMSG.bind(this,event.channel_id,d.id),del[1]); 
				}
			});
		}
	},
	editMSG:(chan,id,txt)=>{
		bot.editMessage({
			channel: chan, 
			messageID: id,
			message: txt
		});
	},
	delMSG:(channelID,id)=>{
		bot.deleteMessage({
			channel: channelID,
			messageID: id
		});
	}
}
/******************** EVENTS **********************/
bot.on('ready', function(rawEvent) {
	selfId=rawEvent.d.user.id;
	for(modf in Modules){
		Modules[modf].emit("ready",utils,rawEvent);
	}
});
bot.on('message', function(user, channelId, message, rawEvent) {
	user.tag="<@"+user.id+">";
	rawEvent.d.guild_id=bot.serverFromChannel(channelId);
	for(modf in Modules){
		Modules[modf].emit("message",utils,user,channelId,message,rawEvent.d);
	}
	if(rawEvent.d.id in data.ownMsgs){return;data.ownMsgs.splice(indexOf(rawEvent.d.id),1);}
	init=comInitiator[rawEvent.d.guild_id]?comInitiator[rawEvent.d.guild_id]:comInitiator.def;
	if(message[0]==init){
		comd = message.substr(1).split(" ")[0].toLowerCase();
		args = message.split(" ");args.shift();
		for(modf in Modules){
			if(!Modules[modf].commands)continue;
			coms = Modules[modf].commands;
			for(comk in coms){
				run=(comk==comd);
				for(aliask in coms[comk].aliases){
					alias=coms[comk].aliases[aliask];
					if(!run){if(comd==alias)run=true;}else break;
				}
				console.log(run+" : "+comd+"/"+comk);
				if(run){
					coms[comk].run(utils,args,user,channelId,rawEvent.d);
				}
			}
		}
	}
});
bot.on('messageud', function(messageId,user,channelId,message,rawEvent){
	try{user.tag="<@"+user.id+">"}catch(e){};
	rawEvent.d.guild_id=bot.serverFromChannel(channelId);
	for(modf in Modules){
		Modules[modf].emit("message_updated",utils,messageId,user,channelId,message,rawEvent.d);
	}
	if(rawEvent.d.id in data.ownMsgs){return;data.ownMsgs.splice(indexOf(rawEvent.d.id),1);}
	if(!message)return;
	console.log(message);
	init=comInitiator[rawEvent.d.guild_id]?comInitiator[rawEvent.d.guild_id]:comInitiator.def;
	if(message[0]==init){
		comd = message.substr(1).split(" ")[0].toLowerCase();
		args = message.split(" ");args.shift();
		for(modf in Modules){
			if(!Modules[modf].commands)continue;
			coms = Modules[modf].commands;
			for(comk in coms){
				run=(comk==comd);
				for(aliask in coms[comk].aliases){
					alias=coms[comk].aliases[aliask];
					if(!run){if(comd==alias)run=true;}else break;
				}
				console.log(run+" : "+comd+"/"+comk);
				if(run){
					coms[comk].run(utils,args,user,channelId,rawEvent.d);
				}
			}
		}
	}
});
bot.on('messagede', function(messageId,user,channelId,message,rawEvent){
	for(modf in Modules){
		Modules[modf].emit("message_deleted",utils,messageId,user,channelId,message,rawEvent.d);
	}
	if(rawEvent.d.id in data.ownMsgs){return;data.ownMsgs.splice(indexOf(rawEvent.d.id),1);}
	init=comInitiator[rawEvent.d.guild_id]?comInitiator[rawEvent.d.guild_id]:comInitiator.def;
	if(rawEvent.d.id in data.commandReplies){utils.delMSG(channelId,rawEvent.d.id);utils.delMSG(channelId,data.commandReplies[rawEvent.d.id]);}
});
/****************** CORE UTILS ********************/
function evalUntil(msgId){
	if(msgQueue.length<=0)return;
	evalThis = msgQueue.shift();
	if(evalThis[3].d.id==msgId){
		return;
	}else{
		evalMSG(evalThis[0],evalThis[1],evalThis[2],evalThis[3]);
		evalUntil(msgId);
	}
}
function start(){
	var readline = require('readline');
    var in_ = readline.createInterface({ input: process.stdin, output: process.stdout });
	setTimeout(prompt, 100);
	function prompt() {
		in_.question(">", function(str) {
			consoleCommandHandle(str);
			return prompt(); // Too lazy to learn async
		});	
	};
	load(function(){loadModules();bot.connect();});
}
function stop(){
	save();
	mysql.end();
	bot.disconnect();
	process.exit();
}
function save(){
	saveArr = data;
	var saveData = JSON.stringify(saveArr);
	fs.writeFileSync( "./data.json", saveData, "utf8");
	console.log(saveData);
}
function consoleCommandHandle(cmd){
	cmd = cmd.toLowerCase();
	if(cmd=="save"){
		save();
	}
	if(cmd=="load"){
		load();
	}
	if(cmd=="stop"){
		stop();
	}
}
function load(callback){
	fs.exists('./data.json',function(exists){
		if(exists){
			var loadArr = require("./data.json");
			data=loadArr;
		}
		if(callback){
			callback();
		}
	});
}
process.stdin.resume();
process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
function exitHandler(options, err) {
	stop();
}
process.on('uncaughtException', errorHandler);
function errorHandler(err){
	data.errors.push(err);
	console.log(err);
}
function requireUncached(module){
    delete require.cache[require.resolve(module)]
    return require(module)
}
start();

