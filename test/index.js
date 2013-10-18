var fs = require('fs');
var bunyan = require('bunyan');
var restify = require('restify');

var zippy = require('../lib');

var SOCK = exports.SOCK = __dirname + '/.zippy_sock';

exports.CLIENT = undefined;
exports.SERVER = undefined;
// App object that is not listening on a socket.
exports.app = undefined;

var log = bunyan.createLogger({
  name: 'zippy_unit_test',
  level: process.env.LOG_LEVEL || 'info',
  serializers: restify.bunyan.serializers,
  stream: process.stdout,
});



function createApp() {
  // TODO(davidbgk): find an easy way to launch tests against
  // an external provider.
  return zippy.createServer({
    log: log.child({component: 'server'}, true),
    noAudit: true,
  });
}


exports.start = function(cb) {
  exports.app = createApp();  // not listening to a socket.

  fs.unlink(SOCK, function () {
    exports.SERVER = createApp();

    exports.SERVER.listen(SOCK, function () {
      exports.CLIENT = zippy.createClient({
        log: log.child({component: 'client'}, true),
        socketPath: SOCK,
      });
      cb();
    });
  });
};

exports.stop = function(cb) {
  exports.app.close();
  exports.SERVER.once('close', function () {
    fs.unlink(SOCK, function () {
      if (cb) {
        cb();
      }
    });
  });
  exports.SERVER.close();
};
