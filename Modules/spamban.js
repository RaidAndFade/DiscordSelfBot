const EventEmitter = require('events');
class EE extends EventEmitter{}
const spamban = new EE();
spamban.name="My Module";
//format = ID:[userId,Reason]

var bans=[];
spamban.on("load",(p,data)=>{
	if(data.bans)bans=data.bans;
	console.log("spamban loaded!");
});
spamban.on("unload",(p,data)=>{
	data.bans=bans;
	console.log("spamban unloaded!");
});

function isBanned(uid){
	
}

spamban.commands = {
	spamban:{
		aliases: [],
		allowed: (p,user,args,event,helpReq) => {
			return true;
		}, 
		parse: utils.combinator.seq(utils.combinate.user,utils.combinate.all.or(utils.combinator.of(""))),
		usage: "spamban <user>",
		desc: "Ban a user",
		run: (p, args, user, channel, event) => {
			bid = bans.push([args[0],args[1]==""?"[No reason specified]":args[1]]);
			utils.reply(event,"**REKT**, banned from all servers that I have ban permission on\nBan case : "+(bid-1));
			//ban them on anywhere you can, the next time they talk.
		}
	},
	spamunban:{
		aliases: [],
		allowed: (p,user,args,event,helpReq) => {
			return true;
		}, 
		parse: utils.combinator.seq(utils.combinate.user,utils.combinate.all.or(utils.combinator.of(""))),
		usage: "spamunban <user>",
		desc: "Unban a user",
		run: (p, args, user, channel, event) => {
			var userExists = false;
			for(var ban of bans){
				if(ban[0]==args[0])
					userExists=true;
			}
		}
	},
	banlist:{
		aliases: [],
		allowed: (p,user,args,event,helpReq) => {
			return true;
		}, 
		usage: "spamunban <user>",
		desc: "Unban a user",
		run: (p, args, user, channel, event) => {
			utils.bot.uploadFile({to:channel,file:Buffer.from(JSON.stringify(bans)),filename:"banlist.txt",message:"Here's your file list"})
		}
	}
};
module.exports=spamban;
