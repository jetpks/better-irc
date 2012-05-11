(function() {
  "use strict";
  var util = require('util')
    , events = require('events')
    , Socket = require('./connect.js')
    , socket
    , initialized = false
    , client = function (opts) {
        this.opts = opts;
        Socket(opts, this, function(newSock) {
          socket = newSock; 
        });
      }
    ;
  util.inherits(client, events.EventEmitter);


  client.prototype.raw = function (message, callback) {
    socket.write(message +'\r\n', 'ascii');
    if(typeof callback === 'function') {
      socket.once('drain', callback);
    }
  }

  client.prototype.say = function (channel, message) {
    this.raw('PRIVMSG ' + channel + ' :' + message);

  }

  module.exports = client;
}());
