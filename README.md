===================================
What is DiscordSelfBot? :

	Discord Selfbot is a project that was suggested to me by a friend. The point of this project is to have an automated bot on the same account as yours on the communication platform called "Discord".
	
===================================
Todo : 
    Todo can be found in a comment at the top of the main files in my projects. In this case it is selfbot.js
	Certain files may also have their own TODO lists at the top of the file.
	
===================================
How to use : 

make a file called UserPass.js in the same directory as Selfbot.js

```
var DiscordClient = require('./discord.io.js');
var bot = new DiscordClient({
    email: "<Your discord email>",
    password: "<Your discord password>"
});
exports.bot = bot;
var Twitter = require('twitter');Twitter = new Twitter({consumer_key: '<twitter:conskey>',consumer_secret: '<twitter:consec>',access_token_key: '<twitter:accesskey>',access_token_secret: '<twitter:accessec>'});
exports.twitter=Twitter;
var mysql = require("mysql");mysql = mysql.createConnection({host:'<mysqldb:host>',user:'<mysqldb:user>',password:'<mysqldb:pass>',database:'<mysqldb:database'});mysql.connect();
exports.mysql=mysql;```

MYSQL and Twitter are only required for some modules.
If you don't have a Twitter api account or a MYSQL database set the variable to null and the associated modules will simply shutdown on load.