msgQueue = [];
botMsgs = [];
waitForOwnMSG = false;
customCommands = {};
waitingForCode={};
commandWaiting={};
savedCode={};
bot.on('message', function(user, channelID, message, rawEvent) {
	logmsg(rawEvent);
	if(user.id!=selfID)return;
	if(waitForOwnMSG)msgQueue.push([user,channelID,message,rawEvent]);
	else evalMSG(user,channelID,message,rawEvent);
});
bot.on('messageud', function(messageId,user,channelId,message,rawEvent){
	logmodmsg(rawEvent);
});
bot.on('messagede', function(messageId,user,channelId,message,rawEvent){
	logmodmsg(rawEvent);
});
function evalMSG(user, channelID, message, rawEvent){
	if(rawEvent.d.id in botMsgs){delete botMsgs[rawEvent.d.id];return;}
	if(message.substring(0,3)==="```"&&(waitingForCode[user.id]&&waitingForCode[user.id]>0)){	
		setTimeout(delMSG.bind(this,channelID,rawEvent.d.id),5000);
		newCode(user,channelID,message.substring(3).substring(0,message.length-3));
	}
	if(message.charAt(0)=='/'){
		if(handleCommand(user,channelID,message,rawEvent)){
			setTimeout(delMSG.bind(this,channelID,rawEvent.d.id),500);
		}
	}
}
function allYourBase(nbasefrom, baseto, basefrom) {
	var SYMBOLS = '0123456789 !"#+-./:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~'; 
	if (basefrom<=0){basefrom=2;}
	if (baseto<=0){basefrom=2;}
	if (basefrom>SYMBOLS.length||typeof basefrom == 'undefined'){basefrom=SYMBOLS.length;}
	if (baseto>SYMBOLS.length||typeof baseto == 'undefined'){baseto=SYMBOLS.length;}
	console.log(basefrom);
	var i, nbaseten=0;
	if (basefrom!=10) {
		var sizenbasefrom = nbasefrom.length;
		for (i=0; i<sizenbasefrom; i++) {
			var mul, mul_ok=-1;
			for (mul=0; mul<SYMBOLS.length; mul++) {
				if (nbasefrom[i]==SYMBOLS[mul]) {
					mul_ok = 1;
					break;
				}
			}
			if (mul>=basefrom) {
				console.log("Symbol unallowed in basefrom");
				return "Symbol unallowed in basefrom";
			}
			if (mul_ok==-1) {
				console.log("Symbol not found");
				return "Symbol not found";
			}
			var exp = (sizenbasefrom-i-1);	
			if (exp==0) nbaseten += mul;
			else nbaseten += mul*Math.pow(basefrom, exp);
		}
	} else nbaseten = parseInt(nbasefrom);
	if (baseto!=10) { 
		var nbaseto = [];
		while (nbaseten>0) {
			var mod = nbaseten%baseto;
			if (mod<0 || mod>=SYMBOLS.length) {
				console.log("Out of bounds error");
				return "Out of bounds error";
			}
			nbaseto.push(SYMBOLS[mod]);
			nbaseten = parseInt(nbaseten/baseto);
		}
		return nbaseto.reverse().toString().replace(/,/g, '');
	} else {
		return nbaseten.toString();
	}
	return "0";
}
var conv = {
	bin : {
		to : function(string){
			var length = string.length,
				output = [];
			for (var i = 0;i < length; i++) {
				var bin = string[i].charCodeAt().toString(2);
				output.push(Array(8-bin.length+1).join("0") + bin);
			} 
			return output.join(" ");
		},
		from : function(bin){
			return bin.replace(/\s*[01]{8}\s*/g, function(bin) {
				return String.fromCharCode(parseInt(bin, 2))
			})
		}
	},
	oct : {
		to : function(string){
			var length = string.length,
				output = [];
			for (var i = 0;i < length; i++) {
				var bin = string[i].charCodeAt().toString(8);
				output.push(Array(3-bin.length).join("0") + bin);
			} 
			return "\\"+output.join(" \\");
		},
		from : function(bin){
			return bin.replace(/\s*[0-8]{3}\s*/g, function(bin) {
				return String.fromCharCode(parseInt(bin,8))
			})
		}
	},
	dec : {
		to : function(string){
			var length = string.length,
				output = [];
			for (var i = 0;i < length; i++) {
				var bin = string[i].charCodeAt().toString();
				output.push(bin);
			} 
			return output.join(" ");
		},
		from : function(bin){
			return bin.replace(/\s*[0-9]{2,3}\s*/g, function(bin) {
				return String.fromCharCode(parseInt(bin))
			})
		}
	},
	hex : {
		to : function(string){
			var length = string.length,
				output = [];
			for (var i = 0;i < length; i++) {
				var bin = string[i].charCodeAt().toString(16);
				output.push(Array(3-bin.length).join("0") + bin);
			} 
			return "0x"+output.join(" 0x");
		},
		from : function(bin){
			return bin.replace(/\s*[0-9a-f]{2}\s*/g, function(bin) {
				return String.fromCharCode(parseInt(bin,16))
			})
		}
	},
};
function logmodmsg(event){
	if(event.t=='MESSAGE_DELETE'){
		chan = event.d.channel_id;
		id = event.d.id;
		mysql.query("UPDATE `log` SET `flags`=`flags`+1, `updated`=? WHERE  `messageId`=? AND `channelId`=? LIMIT 1;",[(new Date).getTime(),id,chan]);
		return;
	}else{
		if(!event.d.content)return;
		chan = event.d.channel_id;
		id = event.d.id;
		msg = event.d.content;
		mysql.query("SELECT editmsg FROM `log` WHERE `messageId`=? AND `channelId`=? LIMIT 1;",[id,chan],function(err,res,fs){
			js = res[0].editmsg;
			if(js=="")js="[]";
			msgs=JSON.parse(js);
			msgs.push(msg);
			mysql.query("UPDATE `log` SET `editmsg`=?, `flags`=`flags`+2, `updated`=? WHERE  `messageId`=? AND `channelId`=? LIMIT 1;",[JSON.stringify(msgs),(new Date).getTime(),id,chan]);
		});
	}
}
//Copypasta'd from here
function parseCustomResp(user,chan,msg,resp,com){
	if(resp.indexOf("%code%")>-1){
		parseCode(savedCode["COM"+com][0],savedCode["COM"+com][1],function(res){
			resp = resp.replace("%code%",res);
			parseCustomResp(user,chan,msg,resp,com);
		});
	}else{
		sendMSG(chan,resp.replace("%msg%",msg));
	}
}
function parseCode(lang,code,callback){
	request.post({
		headers: {'content-type' : 'application/x-www-form-urlencoded'},
		url: 'http://192.168.5.60:6051/'+lang,
		body: "code="+querystring.escape(code)},
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				callback(body);
			}
		}
	);
}
function newCode(user,channel,message){
	var language = message.split("\n")[0];
	var code = message.replace(message.split("\n")[0]+"\n","");code=code.substring(0,code.lastIndexOf("```"));
	if(waitingForCode[user.id]==1){
		sendMSG(channel,"Now evaling `"+language+"` code.");
		parseCode(language,code,function(result){
			sendMSG(channel,result);
		});
		waitingForCode[user.id]=0;
	}else{
		var com = commandWaiting[user.id][0];
		var resp = commandWaiting[user.id][1];
		savedCode["COM"+com]=[];
		savedCode["COM"+com][0]=language;
		savedCode["COM"+com][1]=code;
		customCommands[com]=resp;
		sendMSG(channel,"Command !"+com+" has been added!")
		waitingForCode[user.id]=0;
	}
}
//Copypasta'd to here
function logmsg(event){
	chan = event.d.channel_id;
	srv = event.d.guild_id?event.d.guild_id:-1;
	id = event.d.id;
	msg = event.d.content;
	usr = event.d.author.id;
	if(srv==-1){
		mysql.query('INSERT INTO `log`(messageId,userId,channelID,origmsg,editmsg,date) VALUES(?,?,?,?,"[]",?)',[id,usr,chan,msg,(new Date).getTime()]);
	}else{
		mysql.query('INSERT INTO `log`(messageId,userId,channelId,serverId,origmsg,editmsg,date) VALUES(?,?,?,?,?,"[]",?)',[id,usr,chan,srv,msg,(new Date).getTime()]);
	}
}
function handleCommand(user,chan,message,rawEvent){
	cmd = message.split(" ")[0].substring(1);
	msg = message.substring(1).replace(cmd,"").replace(" ","");msg=msg.trim();
	try{
		if(cmd=="tweet"){
			screen_n=msg.split(" ").length>0?msg.split(" ")[0]:"lirik";
			Twitter.get('statuses/user_timeline', {screen_name:screen_n }, function(error, tweets, response){
			  if (!error) {
				sendMSG(chan,"**"+screen_n+"**'s latest Tweet : ```\n"+tweets[0].text.replace(/(.*?:)\/\//g,"$1 //")+"\n```\n:heart: "+tweets[0].favorite_count+"    :arrow_up: "+tweets[0].retweet_count,[true,30000]);
			  }else{
				sendMSG(chan,"**ERROR**:"+error.message,[true,5000]);
			  }
			}); 
		}
		if(cmd=="eval"){ 
			sendMSG(chan,eval(msg.replace(cmd+" ","")),[true,5000]);
			return true; 
		}
		if(cmd=="code"){
			sendMSG(chan,"Please type your code.");waitingForCode[user.id]=1;return true;
		}
		if(cmd=="evalnd"){
			sendMSG(chan,eval(msg.replace(cmd+" ","")),[false,0]);
			return true; 
		}
		if(cmd=="test"){
			sendMSG(chan,"self-bot is currently working!");
			return true;	
		}
		if(cmd=="exec"){
			sendMSG(chan,"Please enter your code!");
			waitingForCode[user.id]=1;
			return true;
		}
		if(cmd=="stats"){
			args = message.split(" ");
			if(args.length==0||args[0]=="help"){
				sendMSG(chan,"**Subcommands**:\n```\n"
								+"\n/stats @user : Returns simple data about a user"
								+"\n/stats word <@user> : Returns the most used word <that @user has sent>"
								+"\n/stats longest <@user> : Returns the longest message <that @user has sent>"
								+"\n/stats deleted <@user> : Returns the most recent deleted msg <that @user has sent>"
								+"\n/stats longest <@user> : Returns the 5 most recent edits <that @user has done>"
								+"```")
			}
			//if() <---DO THIS --->
			return true;
		}
		if(cmd=="com"){
			channelID=chan;
			if(message.split(" ").length>1){  
				message=message.replace("/"+cmd+" ","");
				subcom = message.split(" ")[0];
				message=message.replace(subcom+" ",""); 
				if(subcom=="add"){
					com=message.split(" ")[0];message=message.replace(com+" ","");resp=message;
					if(com in customCommands){
						sendMSG(channelID,"The command `"+com+"` cannot be added because it already exists.");
					}else{
						if(resp.indexOf("%code%")>-1){
							waitingForCode[user.id]=2;
							commandWaiting[user.id]=[com,resp];
							sendMSG(channelID," please enter the code you want to be executed.");
						}else{
							customCommands[com]=resp;
							sendMSG(channelID," The command `"+com+"` has successfully been added.");
						}
					} 
				}else if(subcom=="del"){
					com=message.split(" ")[0];
					if(com in customCommands){
						delete customCommands[com];
						sendMSG(channelID,"The command `"+com+"` has been removed.");
					}else sendMSG(channelID,"The command `"+com+"` cannot be deleted because it is not set.");
				}else if(subcom=="list"){
					list="Here are all of the custom commands: \n";
					for(var k in customCommands){
						list+=k+" : "+customCommands[k].substring(0,customCommands[k].length>20?20:customCommands[k].length)+(customCommands[k].length>20?"...":"")+"\n";
					}
					sendMSG(channelID,"```\n"+list+"```");
				}
			}else{
				sendMSG(channelID,"Usage : /com <add/del/list>");
			}return true;
		}
		if(cmd in customCommands){
			parseCustomResp(user,chan,msg,customCommands[cmd],cmd);
			return true;
		}
	}catch(e){
		sendMSG(chan,"**ERROR**: "+e.message,[true,5000]);
		console.log(e);
		return true;
	}
	return false; 
}
