const EventEmitter = require('events');
class EE extends EventEmitter{}
const log = new EE();
log.name="ChatLog";

log.on("load",(p)=>{
	console.log("Log loaded!");
});

log.on("message",(p,user,channelId,message,event)=>{
	chan = event.channel_id;
	srv = event.guild_id?event.guild_id:-1;
	id = event.id;
	msg = event.content;
	usr = event.author.id;
	if(srv==-1){ 
		p.mysql.query('INSERT INTO `log`(messageId,userId,channelID,origmsg,editmsg,date) VALUES(?,?,?,?,"[]",?)',[id,usr,chan,msg,(new Date).getTime()]);
	}else{
		p.mysql.query('INSERT INTO `log`(messageId,userId,channelId,serverId,origmsg,editmsg,date) VALUES(?,?,?,?,?,"[]",?)',[id,usr,chan,srv,msg,(new Date).getTime()]);
	}
});
log.on("message_updated",(p,msgId,user,channelId,message,event)=>{
	if(!event.content)return;
	chan = event.channel_id;
	id = event.id;
	msg = event.content;
	p.mysql.query("SELECT editmsg FROM `log` WHERE `messageId`=? AND `channelId`=? LIMIT 1;",[id,chan],function(err,res,fs){
		js = res[0].editmsg;
		if(js=="")js="[]";
		msgs=JSON.parse(js);
		msgs.push(msg);
		p.mysql.query("UPDATE `log` SET `editmsg`=?, `flags`=`flags`+2, `updated`=? WHERE  `messageId`=? AND `channelId`=? LIMIT 1;",[JSON.stringify(msgs),(new Date).getTime(),id,chan]);
	});
});
log.on("message_deleted",(p,msgId,user,channelId,message,event)=>{
	chan = event.channel_id;
	id = event.id;
	p.mysql.query("UPDATE `log` SET `flags`=`flags`+1, `updated`=? WHERE  `messageId`=? AND `channelId`=? LIMIT 1;",[(new Date).getTime(),id,chan]);
});

log.commands = {
	stats: {
		aliases: ["stat"],
		usage: "stats",
		desc: "Show user/channel specific statistics",
		run: (p, args, user, channel, event) => {
			if(args.length<1){args[0]="help"};
			subcom = args[0];
			args.shift();
			switch(subcom){
				case "word":
				case "longest":
				case "deleted":
				
				case "help":
				   p.reply(event,"**Subcommands**:\n```\n"
								+"\n/stats @user : Returns simple data about a user"
								+"\n/stats word <@user> : Returns the most used word <that @user has sent>"
								+"\n/stats longest <@user> : Returns the longest message <that @user has sent>"
								+"\n/stats deleted <@user> : Returns the most recent deleted msg <that @user has sent>"
								+"\n/stats edits <@user> : Returns the 5 most recent edits <that @user has done>"
								+"```")
				default:
					
			}
			p.reply(event,user.tag+", Sorry mate im too lazy to finish this command :lirikFEELS:");
		}
	}
}

module.exports=log;
