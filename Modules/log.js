
const EventEmitter = require('events');
class EE extends EventEmitter{}
const log = new EE();
log.name="ChatLog";

log.on("load",(p)=>{
	console.log("Log loaded!");
	if(!p.mysql){
		p.disable(log,"DB not found. Disabling Log module");
		return;
	}
	p.mysql.query('SELECT 1', (err, rows) => {
		if(err)p.disable(log,"DB having issues, not going to bother, disabling LOG module");
	});
});

log.on("message",(p,user,channelId,message,event)=>{
	chan = event.channel_id;
	srv = event.guild_id?event.guild_id:-1;
	id = event.id;
	msg = event.content;
	usr = event.author.id;
	if(srv==-1){
		p.mysql.getConnection((e,c)=>{c.query('INSERT INTO `log_chat`(messageId,userId,channelID,origmsg,editmsg,date,embeds,attachments) VALUES(?,?,?,?,"[]",?,?,?)',[id,usr,chan,msg,(new Date).getTime(),JSON.stringify([event.embeds]),JSON.stringify([event.attachments])],(e,r,f)=>{c.release();});},(e,r)=>{});
	}else{
		p.mysql.getConnection((e,c)=>{c.query('INSERT INTO `log_chat`(messageId,userId,channelId,serverId,origmsg,editmsg,date,embeds,attachments) VALUES(?,?,?,?,?,"[]",?,?,?)',[id,usr,chan,srv,msg,(new Date).getTime(),JSON.stringify([event.embeds]),JSON.stringify([event.attachments])],(e,r,f)=>{c.release();});},(e,r)=>{});
	}
});
log.on("message_updated",(p,msgId,user,channelId,message,event)=>{
	if(Object.keys(event).indexOf("nonce")===-1)return;
	chan = event.channel_id;
	id = event.id;
	msg = event.content;
	console.log(event);
	p.mysql.getConnection((e,c)=>{c.query("SELECT * FROM `log_chat` WHERE `messageId`=? AND `channelId`=? LIMIT 1;",[id,chan],function(err,res,fs){
		if(err)return console.log(err);
		if(res.length<1)return;
		edits = res[0].editmsg;
		if(edits=="")edits="[]";
		msgs=JSON.parse(edits);
		msgs.push(msg);

		embeds = JSON.parse(res[0].embeds);
		embeds.push(event.embeds);
		embeds = JSON.stringify(embeds);

		attachments = JSON.parse(res[0].attachments);
		attachments.push(event.attachments);
		attachments = JSON.stringify(attachments);

		c.query("UPDATE `log_chat` SET `editmsg`=?, `embeds`=?, `attachments`=?, `flags`=`flags`+2, `updated`=? WHERE  `messageId`=? AND `channelId`=? LIMIT 1;",[JSON.stringify(msgs),embeds,attachments,(new Date).getTime(),id,chan],(e,r)=>{c.release();});
	})},(e,r)=>{});
});
log.on("message_deleted",(p,msgId,channelId,event)=>{
	chan = event.channel_id;
	id = event.id;
	p.mysql.getConnection((e,c)=>{c.query("UPDATE `log_chat` SET `flags`=`flags`+1, `updated`=? WHERE  `messageId`=? AND `channelId`=? LIMIT 1;",[(new Date).getTime(),id,chan],(e,r)=>{c.release();});},(e,r)=>{});
});
log.on("raw_event",(p,event)=>{
	//p.mysql.query("INSERT INTO `log_event` VALUES(?,?,?);",[(new Date).getTime(),event.t+"",JSON.stringify(event)],(e,r)=>{});
});
log.on("guild_member_add",(p,event)=>{
	p.mysql.getConnection((e,c)=>{c.query("INSERT INTO `log_users` VALUES(?,?,?,?,?);",[event.d.user.id,event.d.guild_id,(new Date).getTime(),"Join",""],(e,r)=>{c.release();});},(e,r)=>{});
});
log.on("guild_member_remove",(p,event)=>{
	p.mysql.getConnection((e,c)=>{c.query("INSERT INTO `log_users` VALUES(?,?,?,?,?);",[event.d.user.id,event.d.guild_id,(new Date).getTime(),"Leave",""],(e,r)=>{c.release();});},(e,r)=>{});
});
log.on("presence_update",(p,event)=>{
	if(event.d.game!=null)
		p.mysql.getConnection((e,c)=>{c.query("INSERT INTO `log_users` VALUES(?,?,?,?,?);",[event.d.user.id,"",(new Date).getTime(),"Status",event.d.game.name],(e,r)=>{c.release();});},(e,r)=>{});
	if(event.d.user.avatar&&event.d.user.avatar!=null)
		p.mysql.getConnection((e,c)=>{c.query("INSERT INTO `log_users` VALUES(?,?,?,?,?);",[event.d.user.id,"",(new Date).getTime(),"Avatar",event.d.user.avatar],(e,r)=>{c.release();});},(e,r)=>{});
	if(event.d.nick!=null)
		p.mysql.getConnection((e,c)=>{c.query("INSERT INTO `log_users` VALUES(?,?,?,?,?);",[event.d.user.id,event.d.guild_id,(new Date).getTime(),"Nickname",event.d.nick],(e,r)=>{c.release();});},(e,r)=>{});
});

var gettingChat = false;

log.commands = {
	stats: {
		parse: utils.combinator.seq(utils.combinate.word.or(utils.combinate.user.or(utils.combinator.of("help"))),utils.combinate.space.or(utils.combinator.of("")),utils.combinate.user.or(utils.combinator.of(""))),
		allowed: (p,user,args,event,helpReq) => {
			return true;
		},
		aliases: ["stat"],
		usage: "stats",
		desc: "Show user/channel specific statistics",
		run: (p, args, user, channel, event) => {
			subcom = args[0].toLowerCase();
			args.shift();
			chan=event.channel_id;
			switch(subcom){
				case "word":
					if(args.length<2||args[1]==""){

					}else{

					}
				case "deleted":
					if(args.length<2||args[1]==""){
						id=event.author.id;
						p.mysql.query("SELECT * FROM `log_chat` WHERE `channelId`=? AND `flags`%2=1 ORDER BY `date` DESC LIMIT 5;",[chan],function(err,res,fs){
							out="";
							count=1;
							for(var row of res){
								out+="```\n"+(count++)+".\n"+row.origmsg.replace(/`/g,'\'')+"\n```\n";
							}
							if(count==1)
								p.reply(event,"**Somehow... this channel has no deleted messages!**");
							else
								p.reply(event,out+"");
						});
					}else{
						p.bot.getMember({serverID:p.bot.channels[chan].guild_id,userID:args[1]},function(err,res){
							if(err){id=event.author.id;}else{id=res.user.id;}//if user doesn't exist return sender.
							p.mysql.query("SELECT * FROM `log_chat` WHERE `userId`=? AND `channelId`=? AND `flags`%2=1 ORDER BY `date` DESC LIMIT 5;",[id,chan],function(err,res,fs){
								out="";
								count=1;
								for(var row of res){
									overflowed=row.origmsg.length>100;
									out+="\n**"+(count++)+":** *"+row.messageId+"*```\n"+row.origmsg.substr(0,150).replace(/`/g,'\'')+(overflowed?"...":"")+"\n```";
								}
								if(count==1)
									p.reply(event,"**Somehow... that user has no deleted messages!**");
								else
									p.reply(event,out+"");
							});
						});
					}
					break;
				case "edits":
				case "edit":
				case "edited":
				case "changes":
					if(args.length<2||args[1]==""){
						p.mysql.query("SELECT * FROM `log_chat` WHERE `channelId`=? AND `flags`>1 ORDER BY `date` DESC LIMIT 3;",[chan],function(err,res,fs){
							out="";
							count=1;
							for(var row of res){
								edits=JSON.parse(row.editmsg);
								overflowed=row.origmsg.length>100;
								out+="\n**"+(count++)+":** *"+row.messageId+"*\n`"+row.origmsg.substr(0,100).replace(/`/g,'\'')+(overflowed?"...":"")+"\n`";
								edits=[edits[edits.length-1]];//edits=edits.length>2?[edits[0],edits[edits.length-1]]:edits;
								for(var edit of edits){
									if(!edit)continue;
									overflowed=edit.length>50;
									out+=":arrow_down: \n`"+edit.substr(0,50).replace(/`/g,'\'')+(overflowed?"...":"")+"`\n";
								}
							}
							if(count==1)
								p.reply(event,"**Somehow... this channel has no edited messages!**");
							else
								p.reply(event,out+"");
						});
					}else{
						p.bot.getMember({serverID:p.bot.channels[chan].guild_id,userID:(""+args[1])},function(err,res){
							if(err){id=event.author.id;}else{id=res.user.id;}//if user doesn't exist return generic.
							p.mysql.query("SELECT * FROM `log_chat` WHERE `userId`=? AND `channelId`=? AND `flags`>1 ORDER BY `date` DESC LIMIT 3;",[id,chan],function(err,res,fs){
								out="";
								count=1;
								for(var row of res){
									edits=JSON.parse(row.editmsg);
									overflowed=row.origmsg.length>100;
									out+="\n**"+(count++)+":** *"+row.messageId+"*\n`"+row.origmsg.substr(0,100).replace(/`/g,'\'')+(overflowed?"...":"")+"`\n";
									edits=[edits[edits.length-1]];//edits=edits.length>2?[edits[0],edits[edits.length-1]]:edits;
									for(var edit of edits){
										if(!edit)continue;
										overflowed=edit.length>50;
										out+=":arrow_down: \n`"+edit.substr(0,50).replace(/`/g,'\'')+(overflowed?"...":"")+"`\n";
									}
								}
								if(count==1)
									p.reply(event,"**Somehow... that user has no edited messages!**");
								else
									p.reply(event,out+"");
							});
						});
					}
					break;
				default:
					//do user stuff here, if user is valid, otherwise don't break so that help msg is sent.
				case "help":
					p.reply(event,"**Subcommands**:\n```\n"
								+"\nstats @user           : Returns simple data about a user"
								+"\nstats word <@user>    : Returns the most used word <that @user has sent>"
								+"\nstats deleted <@user> : Returns the most recent deleted msg <that @user has sent>"
								+"\nstats edits <@user>   : Returns the 5 most recent edits <that @user has done>"
								+"```");
					break;
			}
		}
	},
	log: {
		parse: utils.combinator.seq(utils.combinate.word.or(utils.combinate.user.or(utils.combinator.of("help"))),utils.combinate.space.or(utils.combinator.of("")),utils.combinate.snippet.or(utils.combinate.phrase.or(utils.combinate.channel.or(utils.combinator.all.or(utils.combinator.of("")))))),
		allowed: (p,user,args,event,helpReq) => {
			return true;
		},
		aliases: [],
		usage: "log",
		desc: "Show message specific statistics",
		run: (p, args, user, channel, event) => {
			console.log(args);
			var subcom = args[0].toLowerCase();
			var subsubcom = "";
			if(subcom.indexOf("@")>-1){
				subsubcom = subcom.split("@")[1];
				subcom = subcom.split("@")[0];
			}
			args.shift();
			args.shift();
			chan=event.channel_id;
			switch(subcom){
				default:
				case "help":
					p.reply(event,"**Subcommands**:\n```\n"
								+(p.hasPerm(event,user,"BOT_OWNER")?"\nlog unsafe \"snippet\" : Execute an sql query":"")
								+(p.hasPerm(event,user,"MANAGE_MESSAGES")?"\nlog search \"text\"    : Search for text in someone's message":"")
								+("\nlog get <message id> : Quote a message by it's id")
								+"```");
					break;
				case "get":
					p.mysql.getConnection(((event,e,c)=>{
						if(e)return console.log(e);
						c.query("SELECT * FROM `log_chat` WHERE `messageId` = ? LIMIT 1;",[args[0]],(function(event,err,res,fs){
							if(err)return console.log(err);
							console.log(res);
							res = res[0];
							var message = JSON.parse(res.editmsg).length>0&&subsubcom!="first"?JSON.parse(res.editmsg)[JSON.parse(res.editmsg).length-1]:res.origmsg;
							if(res.serverId&&res.serverId!="-1"){
								p.bot.getMember({userID:res.userId,serverID:res.serverId},((event,e,r)=>{
									if(e)return console.log(e);
									console.log(r);
									var author = r.user;
									console.log(author);
									var authorAvatar = "https://discordapp.com/api/users/"+author.id+"/avatars/"+author.avatar+".jpg";
									var emb = {author:{name:author.username+"#"+author.discriminator,icon_url:authorAvatar},footer:{text:"Message Id : "+res.messageId},type:"rich",timestamp:new Date(res.date),color:parseInt("00ffff",16),description:"\t"+message};
									console.log(emb);
									p.reply(event,emb);
									c.release();
								}).bind(this,event));
							}else if(Object.keys(p.bot.users).indexOf(res.userId)!==-1){
								var author = p.bot.users[res.userId];
								var authorAvatar = "https://discordapp.com/api/users/"+author.id+"/avatars/"+author.avatar+".jpg";
								var emb = {author:{name:author.username+"#"+author.discriminator,icon_url:authorAvatar},footer:{text:"Message Id : "+res.messageId},type:"rich",timestamp:new Date(res.date),color:parseInt("00ffff",16),description:"\t"+message};
								p.reply(event,emb);
							}else{
								var emb = {author:{name:res.userId},footer:{text:"Message Id : "+res.messageId},type:"rich",timestamp:new Date(res.date),color:parseInt("00ffff",16),description:"\t"+message};
								p.reply(event,emb);
							}
							c.release();
						}).bind(this,event));
					}).bind(this,event));
					break;
				case "getchat":
					if(!p.hasPerm(event,user,"BOT_OWNER"))return;
					limit = 100;
					if(subsubcom == "all")limit = -1;
					var chan = args[0].replace(/[^0-9]/g,"");
					if(utils.bot._uIDToDM[chan])chan=utils.bot._uIDToDM[chan];
					p.mysql.getConnection((e,c)=>{
						var query = "SELECT * FROM `log_chat` WHERE `channelId` = ? ORDER BY `date` DESC "+(limit == -1?"":"LIMIT "+limit);
						console.log(query);
						c.query(query,[chan],(e,r,f)=>{
							if(e)return console.log(e);
							var res = "";
							for(var m of r){
								res += "@"+(new Date(m.date))+"["+m.messageId+"]["+m.userId+"<@"+utils.bot.users[m.userId].username+">]<#"+chan+">:"+(JSON.parse(m.editmsg).length>0?JSON.parse(m.editmsg)[JSON.parse(m.editmsg).length-1]:m.origmsg)+"\n\n"
							}
							c.release()
							utils.bot.uploadFile({to:channel,filename:"log.txt",file:Buffer.from(res),message:"Here's the "+(limit == -1?"":"last "+limit)+" messages from this channel"},(e,r)=>{console.log(e)});
						});
					});
					break;
				case "loadmessages":
					if(!p.hasPerm(event,user,"BOT_OWNER"))return;
					if(gettingChat)return p.reply(event,"Already getting another chat! Wait a bit!");
					gettingChat=true;
					var started = new Date().getTime();
					var chan = args[0].replace(/[^0-9]/g,"");
					if(utils.bot._uIDToDM[chan])chan=utils.bot._uIDToDM[chan];
					console.log(chan);
					p.mysql.getConnection((e,c)=>{
						get = (lm)=>{
							inp = {channelID:chan,limit:100};
							if(lm!=-1)inp.before=lm
							p.bot.getMessages(inp,(e,r)=>{
								if(e){gettingChat=false;return console.log(e);}
								console.log(r.length + " FROM "+ chan + " @ "+r[r.length-1].id);
								for(var m of r){
									chan = m.channel_id;
									srv = m.guild_id?m.guild_id:-1;
									if(utils.bot.channels[m.channel_id] && "guild_id" in utils.bot.channels[m.channel_id]){
										srv = utils.bot.channels[m.channel_id].guild_id;
									}
									id = m.id;
									msg = m.content;
									usr = m.author.id;
									if(srv==-1){
										c.query('INSERT INTO `log_chat`(messageId,userId,channelID,origmsg,editmsg,date,embeds,attachments,flags) VALUES(?,?,?,?,"[]",?,?,?,?)',[id,usr,chan,msg,new Date((id/4194304)+1420070400000).getTime(),JSON.stringify([event.embeds]),JSON.stringify([event.attachments]),50],(e,r,f)=>{});
									}else{
										c.query('INSERT INTO `log_chat`(messageId,userId,channelId,serverId,origmsg,editmsg,date,embeds,attachments,flags) VALUES(?,?,?,?,?,"[]",?,?,?,?)',[id,usr,chan,srv,msg,new Date((id/4194304)+1420070400000).getTime(),JSON.stringify([event.embeds]),JSON.stringify([event.attachments]),50],(e,r,f)=>{});
									}
								}
								if(r.length>=inp.limit)setTimeout(get.bind(null,r[r.length-1].id),1500);
								else{utils.reply(event,"Done loading all messages in that channel after "+((new Date().getTime())-started)+" ms");gettingChat=false;c.release();}
							});
						}
						get(-1);
					});//*/
					break;
				case "unsafe":
					if(!p.hasPerm(event,user,"BOT_OWNER"))return;
					if(!(args[0] instanceof Object)||args[0].lang!="sql")return p.reply(event,"Make sure you are using a snippet, and that the snippet is in SQL");
					args[0].code=(""+args[0].code).replace(/\$\{this\.channel\}/g,channel);
					if(event.guild_id)args[0].code=(""+args[0].code).replace(/\$\{this\.guild\}/g,event.guild_id);
					console.log(args[0].code);
					p.mysql.query(args[0].code,[],function(err,res,fs){
						if(err)return p.reply(event,""+err);
						var columns=[];
						var rows=[];
						var left=15;
						for(var row of res){
							left--;
							if(left<0)break;
							var currow = [];
							for(var col in row){
								var val = row[col];
								if(columns.indexOf(col)===-1)columns.push(col);
								currow[col]=val;
							}
							rows.push(currow);
						}
						var out="```\n"
						for(var col of columns){

							out+=col;
							if(col != columns[columns.length-1])
								out+=" | ";
							else
								out+="\n";
						}
						for(var row of rows){
							for(var col in row){
								out+=row[col];
								if(col != columns[columns.length-1])
									out+=" | ";
								else
									out+="\n";
							}
						}
						out+="\n```";
						p.reply(event,""+out);
					});
					break;
			}
		}
	}//make a log command, to view certain messages.
}

module.exports=log;
