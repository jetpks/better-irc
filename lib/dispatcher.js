(function() {
  "use strict";
  var events = require('events')
    , dispatcher = new events.EventEmitter()
    , raw
    , opts
    , c
    ;
  

  /* the bread and butter */
  function handle(data) {
    data = data.split('\r\n');
    data.forEach(function(line) {
      if(/^:/.test(line)) {
        dispatcher.emit(line.split(' ')[1], line);
      } else {
        dispatcher.emit(line.split(' ')[0], line);
      }
    });
  }

  function init(rawSend, options, clientEmit) {
    raw = rawSend;
    opts = options;
    c = clientEmit;
    return dispatcher;
  }

  function noop() {

  }

  dispatcher.on('001', function(data) {
    raw('JOIN ' + opts.channel);
  });
  dispatcher.on('002', noop);
  dispatcher.on('003', noop);
  dispatcher.on('004', noop);
  dispatcher.on('005', noop);
  dispatcher.on('251', noop); // server shows data about connected users.
  dispatcher.on('254', noop); // server sends number of channels available.
  dispatcher.on('255', noop);
  dispatcher.on('265', noop);
  dispatcher.on('266', noop);
  dispatcher.on('422', noop);
  dispatcher.on('333', noop);
  dispatcher.on('353', noop);
  dispatcher.on('366', function(data) {
    c.emit('ready'); 
  });

  dispatcher.on('353', function(data) {
    c.emit('userlist', {
      users: data.split(' ').slice(6)
    });
  });

  dispatcher.on('332', function(data) {
    c.emit('topic', {
      text: data.split(' ')[4].substring(1)
    });
  });

  dispatcher.on('NOTICE', function(data) {
    c.emit('notice', {
      text: data.split(' ').slice(4).join().substring(1)
    });
  });

  dispatcher.on('PRIVMSG', function(data) {
    var msg = {}
      , userData
      ;
    data = data.split(' ');
    userData = data[0].split('!');

    msg.raw = data;
    msg.user = {
          userName: userData[1].substring(0, userData[1].indexOf('@'))
        , nick: userData[0].substring(1)
        , host: userData[1].substring(userData.indexOf('@'))
      }
    msg.command = data[1];
    msg.channel = data[2];
    msg.text = data.slice(3).join(' ').substring(1);
    c.emit('message', msg); 
    c.emit('message' + msg.channel, msg);
  });

  dispatcher.on('PING', function(data) {
    raw('PONG ' + data.split(' ')[1]);
  });

  module.exports.init = init;
  module.exports.handle = handle;
}());
