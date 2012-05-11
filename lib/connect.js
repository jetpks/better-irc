(function() {
  "use strict";

  var net = require('net')
    , tls = require('tls')
    , events = require('events')
    , Sequence = require('sequence')
    , socket = new net.Socket({ fd: null, type: 'ipv4', allowHalfOpen: false})
    , centralDispatch = require('./dispatcher.js')
    , dispatcherInit = centralDispatch.init
    , handler = centralDispatch.handle
    , dispatcher
    ;

  /* This is what's exported: */
  function init(opts, client, callback) {
    dispatcher = dispatcherInit(raw, opts, client);
    connect(opts.server, opts.port, opts.ssl, function() {
      auth(opts, callback);
    });
  }


  /* Assign some handlers!  */
  socket.setEncoding('ascii');
  socket.on('data', handler);
  //socket.on('close', handleClose);
  //socket.on('drain', clearLock);

  /* Some internal junk */
  function connect(server, port, ssl, cb) {
    //TODO add tls
    socket.connect(port, server, function() {
      console.log('connected!');
      cb();
    });
  }

  function auth(opts, cb) {
    var sq = new Sequence()
      ;
    sq
      .then(function(next) {
        // PASS section
        if(!opts.pass) {
          next();
          return;
        }
        raw('PASS ' + opts.pass, next);
      })
      .then(function(next) {
        // NICK section 
        // TODO handle errors http://www.irchelp.org/irchelp/rfc/chapter4.html#c4_1
        raw('NICK ' + opts.nick, next);
      })
      .then(function(next) {
        // USER section
        raw('USER ' 
            + opts.user
            +' '
            + opts.hostName
            +' '
            + opts.serverName
            +' :'
            + opts.realName, next);
      })
      .then(function(next) {
        cb(socket);
        next();
      });
  }

  function raw(message, callback) {
    socket.write(message +'\r\n', 'ascii');
    if(typeof callback === 'function') {
      socket.once('drain', callback);
    }
  }
  module.exports = init;
}());
