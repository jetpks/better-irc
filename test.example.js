(function() {
  "use strict";
  
  var Irc = require('./lib/client.js')
    , options = {
          server: 'some-cool-server' // obvious
        , port: 6667 // obvious
        , ssl: false // ssl isn't implemented at the moment.
        , pass: undefined // a string if you have one, undefined if youdon't.
        , nick: 'test-bot' // obvious
        , user: 'Telenulltestbot' // used in whois info.
        , hostName: 'some-host.com' // also used in whois info.
        , serverName: 'some-host.com' // i have no idea what this is for.
        , realName: 'bot botterson' // used in whois info.
        , channel: '#test' // channel you want to join 
      }
    , client = new Irc(options)
    , nickMatch = new RegExp(options.nick)
    ;

  client.on('ready', function() {
    client.say(options.channel, 'helo');
  });

  client.on('message', function(message) {
    console.log(message.user.nick + ' => ' + message.text);
    if(nickMatch.test(message.text)) {
      client.say(options.channel, "I'm a hippopotamus!");
    }
    
  });
  
  
}());
