
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
		                      if (e.Message.Text.ToLower().Contains(" "))
            {
                string area = e.Message.Text.Replace(" ", "+");
                string value = e.Message.Text;
                String[] words = value.Split(' ');
                String command = words[0];
                if (command.Equals("!weather"))
                {
                    e.Channel.SendMessage("Grabbing weather information...");
                    string strLat = "null";
                    string strLon = "null";
                    string googleUse = "null";
                    string sumOut = "null";
                    string tempOut = "null";
                    string feelOut = "null";
                    string sum1Out = "null";
                    string sum2Out = "null";
                    string current = "null";

                    //e.Channel.SendMessage("http://maps.googleapis.com/maps/api/geocode/xml?address=" + area.Remove(0, 9));
                    using (WebClient client = new WebClient())
                    {
                        client.DownloadFile("http://maps.googleapis.com/maps/api/geocode/xml?address=" + area.Remove(0,9), @"E:\Bot Info\Weather Location\" + area.Remove(0, 9) + ".json");
                    }
                    string googleAPI = System.IO.File.ReadAllText("E:\\Bot Info\\Weather Location\\" + area.Remove(0, 9) + ".json");

                    if (googleAPI.Contains("ZERO_RESULTS"))
                    {
                        e.Channel.SendMessage("An error occured (maybe you misspelled something?)");
                    }
                    else
                    {
                        strLon = googleAPI;
                        int lonFrom = strLon.IndexOf("<lng>") + "<lng>".Length;
                        int lonTo = strLon.IndexOf("</lng>");
                        string lonResult = strLon.Substring(lonFrom, lonTo - lonFrom);

                        strLat = googleAPI;
                        int latFrom = strLat.IndexOf("<lat>") + "<lat>".Length;
                        int latTo = strLat.IndexOf("</lat>");
                        string latResult = strLat.Substring(latFrom, latTo - latFrom);

                        using (WebClient client = new WebClient())
                        {
                            client.DownloadFile("https://api.forecast.io/forecast/aa75093d5e1ec47662b3285a5e3c3dfb/" + latResult + "," + lonResult, @"E:\Bot Info\Weather API\" + area.Remove(0, 9) + ".json");
                        }

                        string foreAPI = System.IO.File.ReadAllText("E:\\Bot Info\\Weather API\\" + area.Remove(0, 9) + ".json");

                        sumOut = foreAPI;
                        int sumFrom = sumOut.IndexOf("summary") + "summary".Length;
                        int sumTo = sumOut.IndexOf("icon");
                        string sumResult = sumOut.Substring(sumFrom, sumTo - sumFrom);

                        sumResult = sumResult.Remove(0, 3);
                        sumResult = sumResult.Remove(sumResult.IndexOf('"'));

                        sum1Out = foreAPI;
                        int sum1From = sum1Out.IndexOf(("summary") + 1) + "summary".Length;
                        int sum1To = sum1Out.LastIndexOf("icon");
                        string sum1Result = sum1Out.Substring(sum1From, sum1To - sum1From);

                        tempOut = foreAPI;
                        int tempFrom = tempOut.IndexOf("temperature") + "temperature".Length;
                        int tempTo = tempOut.IndexOf("apparentTemperature");
                        string tempFinal = tempOut.Substring(tempFrom, tempTo - tempFrom);
                        tempFinal = tempFinal.Replace("\"", "");
                        tempFinal = tempFinal.Replace(":", "");
                        tempFinal = tempFinal.Remove(tempFinal.IndexOf(','));
                        tempFinal = tempFinal.Remove(tempFinal.LastIndexOf('.'));

                        feelOut = foreAPI;
                        int feelFrom = feelOut.IndexOf("apparentTemperature") + "apparentTemperature".Length;
                        int feelTo = feelOut.IndexOf("dewPoint");
                        string feelFinal = feelOut.Substring(feelFrom, feelTo - feelFrom);
                        feelFinal = feelFinal.Replace("\"", "");
                        feelFinal = feelFinal.Replace(":", "");
                        feelFinal = feelFinal.Remove(feelFinal.IndexOf(','));
                        feelFinal = feelFinal.Remove(feelFinal.LastIndexOf('.'));


                        string sum1Use = foreAPI;
                        string[] sums = sum1Use.Split(new[] { "hourly" }, StringSplitOptions.None);

                        current = sums[1];
                        int curFrom = current.IndexOf("summary") + "summary".Length;
                        int curTo = current.IndexOf(",");
                        string currentFinal = current.Substring(curFrom, curTo - curFrom);
                        currentFinal = currentFinal.Replace("\"", "");
                        currentFinal = currentFinal.Replace(":", "");

                        //string current = sums[3];
                        //string curStart = ":";
                        //int curInd = current.IndexOf(curStart);
                        //curStart = "," + curStart.Substring(1);
                        //int curEnd = current.IndexOf(curStart);
                        //string curNew = current.Substring(curInd, curEnd + curStart.Length - curInd);



                        //string area = e.Message.Text.Replace(" ", "+");
                        //string value = e.Message.Text;
                        //String[] words = value.Split(' ');
                        //String command = words[0];
                        //if (command.Equals("!weather"))


                        googleUse = googleAPI;
                        string longName = "<formatted_address>";
                        int startIndex = googleUse.IndexOf(longName);
                        longName = "</" + longName.Substring(1);
                        int endIndex = googleUse.IndexOf(longName);
                        String longEnd = googleUse.Substring(startIndex, endIndex + longName.Length - startIndex);
                        longEnd = longEnd.Replace("</formatted_address>", "");


                        double Cint = 1.8;
                        int tempInt = 0;
                        double newint = 0.0;
                        Int32.TryParse(tempFinal, out tempInt);
                        newint = System.Convert.ToDouble(tempInt);
                        tempInt = (tempInt - 32);
                        newint = newint - 32;
                        newint = newint / Cint;
                        tempInt = ((tempInt - 32) *9/5);


                        Cint = 1.8;
                        int intFeel = 0;
                        double newFeel = 0;
                        Int32.TryParse(feelFinal, out intFeel);
                        newFeel = System.Convert.ToDouble(intFeel);
                        intFeel = (intFeel - 32);
                        newFeel = newFeel - 32;
                        newFeel = newFeel / Cint;
                        intFeel = ((intFeel - 32) * 9 / 5);

                        string strnewint = newint.ToString();
                        string strnewFeel = newFeel.ToString();

                        int niind = strnewint.IndexOf(".");
                        if (strnewint.Contains("."))
                        {
                            strnewint = strnewint.Substring(0, niind);
                        }
                        else
                        {
                            strnewint = strnewint;
                        }

                        int nfind = strnewFeel.IndexOf(".");
                        if (strnewFeel.Contains("."))
                        {
                            strnewFeel = strnewFeel.Substring(0, nfind);
                        }
                        else
                        {
                            strnewFeel = strnewFeel;
                        }

                        string highs = googleAPI;
                        int highTemp = 0;



                        if (longEnd.Length > 50)
                        {
                            e.Channel.SendMessage("An error occured (this is caused by multiple places in the world being named the same thing).\nTo fix this, use a more specific usage (for example, type \"!weather Paris France\" instead of \"!weather Paris\").");
                        }
                        else
                        {
                            e.Channel.SendMessage("Showing weather Results for **" + longEnd.Remove(0, 19) + "**. \n" + tempFinal + "°F/" + strnewint + "°C (feels like " + feelFinal + "°F/" + strnewFeel + "°C), " + sumResult + ".\nLater tonight: " + currentFinal);
                            //Console.WriteLine("sums1 == " + sums[1]);
                            //Console.WriteLine("\ncurrentFinal == " + currentFinal);
                        }
                    }
		}
	}
}

module.exports=weather;
