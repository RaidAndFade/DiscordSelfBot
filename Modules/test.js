
const EventEmitter = require('events');
class EE extends EventEmitter{}
const test = new EE();
test.name="Testing";

test.on("load",(p)=>{
	console.log("Example loaded!");
});

//test.on("message",(p,user,channelId,message,rawEvent)=>{console.log(user.id+" said "+rawEvent.d.id)});
//test.on("message_updated",(p,msgId,user,channelId,message,rawEvent)=>{console.log(user.id+" edited "+msgId)});
//test.on("message_deleted",(p,msgId,user,channelId,message,rawEvent)=>{console.log(user.id+" deleted "+msgId)});

test.commands = {
	test: {
		aliases: ["tst"],
		parse: utils.combinate.self.seq(utils.combinate.vars.letter,utils.combinate.vars.all),	
		usage: "test",
		desc: "This command is a test command",
		run: (p, args, user, channel, event) => {
			p.reply(event, JSON.stringify(args));
			//p.reply(event, user.tag+" you said "+args.join(" "))
		}
	}
}

module.exports=test;
