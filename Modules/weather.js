const weatherjs = require("weather-js");
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
		parse: utils.combinate.self.seq(utils.combine.vars.phrase,utils.combine.vars.letter),	
		usage: "weather",
		desc: "Get the weather of an area",
		run: (p, args, user, channel, event) => {
		  //The city is given in args[0].
		  	args[1]=args[1].toLowerCase();
		  	if(args[1]!="c"&&args[1]!="f")args[1]="c";
		  	weatherjs.find({search: args[0], degreeType: args[1].toUpperCase}, function(err, result) {
				if(err) console.log(err);
				console.log(JSON.stringify(result));
			});
		}
	}
}

module.exports=weather;
