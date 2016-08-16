const EventEmitter = require('events');
class EE extends EventEmitter{}
const base = new EE();
base.name="Base";

/*test.on("load",(p)=>{
	console.log("Example loaded!");
});*/

//test.on("message",(p,user,channelId,message,rawEvent)=>{console.log(user.id+" said "+rawEvent.d.id)});
//test.on("message_updated",(p,msgId,user,channelId,message,rawEvent)=>{console.log(user.id+" edited "+msgId)});
//test.on("message_deleted",(p,msgId,user,channelId,message,rawEvent)=>{console.log(user.id+" deleted "+msgId)});

base.commands={
	help:{
		aliases:["?"],
		usage:"help (mod) <page>",
		desc:"Shows help page for all commands.",  
		run:(utils,args,user,channel,event)=>{
			help = [];
			sinit = utils.init[event.guild_id]?utils.init[event.guild_id]:utils.init.def;
			mod=args.length>0?isNaN(args[0])?args[0]:'undefined':'undefined';
			if(mod!='undefined')args.shift();
			//if(utils.modExists(mod))utils.reply(event,user.tag+"That module does not exist!\n Use **"+sinit+"mod list** to see a list of all mods\n Use **"+sinit+"help <page>** to see all help")
			page=args.length>0?!isNaN(args[0])?parseInt(args[0])-1:0:0;
			for(modk in utils.mods){ 
				//if()
				for(comk in utils.mods[modk].commands){
					com = utils.mods[modk].commands[comk];
					helpstr=sinit+comk+" ("+utils.mods[modk].name+") => ";
					if(com.desc)helpstr+="\n     Description : "+com.desc.match(/.{1,50}/g).join("\n                   ");
					if(com.usage)helpstr+="\n     Usage : "+sinit+com.usage;
					if(com.aliases)helpstr+="\n     Aliases : ["+com.aliases.join(", ")+"]";
					helpstr+="\n";
					help.push(helpstr);
				}
			} 
			helpstr = help.join("\n");
			help=[];
			pagelen=500; 
			if(helpstr.length>pagelen){
				console.log(helpstr.length>pagelen);
				while(helpstr.length>pagelen){
					var cmdEnds=0;var attempts=0;
					while(cmdEnds<pagelen&&attempts++<5){
						cmdEnds=helpstr.indexOf("\n"+sinit,cmdEnds+1);
					}
					if(attempts>=5){
						cmdEnds=helpstr.length;
					}
					pagestr=helpstr.substr(0,cmdEnds);
					if(help.length>0)pagestr=pagestr.replace("\n","");
					help[help.length++]=pagestr;
					helpstr=helpstr.substr(cmdEnds);
				}
			}else{help[0]=helpstr;}
			if(page>=help.length){page=help.length-1;}
			utils.reply(event,"```Usable commands :\n   Page "+(page+1)+" of "+help.length+" \n"+help[page]+"```",[true,30000])
		}
	},
	mod:{
		usage:"mod <list>",
		desc:"Module management command.Module management command.Module management command.Module management command.Module management command.Module management command.Module management command.",
		run:(utils,args,user,channel,event)=>{
			utils.reply(event,user.tag+" you said "+args.join(" "))
		}
	}
}

module.exports=base;