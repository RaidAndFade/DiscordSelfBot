
const EventEmitter = require('events');
class EE extends EventEmitter{}
const weather = new EE();
weather.name="Weather";

//weather.on("load",(p)=>{});
//weather.on("message",(p,user,channelId,message,rawEvent)=>{console.log(user.id+" said "+rawEvent.d.id)});
//weather.on("message_updated",(p,msgId,user,channelId,message,rawEvent)=>{console.log(user.id+" edited "+msgId)});
//weather.on("message_deleted",(p,msgId,user,channelId,message,rawEvent)=>{console.log(user.id+" deleted "+msgId)});

weather.commands = {
	weather: {
		parse: utils.combinate.self.seq(utils.combine.vars.all),	
		usage: "weather",
		desc: "Get the weather of an area",
		run: (p, args, user, channel, event) => {
		  //The city is given in args[0].
			//p.reply(event, user.tag+"you can reply to commands like this")
		}
	}
}

module.exports=weather;
