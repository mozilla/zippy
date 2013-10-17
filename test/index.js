var fs = require('fs');
var bunyan = require('bunyan');
var restify = require('restify');

var zippy = require('../lib');

var SOCK = '.zippy_sock';

exports.CLIENT = undefined;
exports.SERVER = undefined;

exports.start = function(cb) {
  var log = bunyan.createLogger({
    name: 'zippy_unit_test',
    level: process.env.LOG_LEVEL || 'info',
    serializers: restify.bunyan.serializers,
    stream: process.stdout,
  });

  // TODO(davidbgk): find an easy way to launch tests against
  // an external provider.
  exports.SERVER = zippy.createServer({
    log: log.child({component: 'server'}, true),
    noAudit: true,
  });

  exports.SERVER.listen(SOCK, function () {
    exports.CLIENT = zippy.createClient({
      log: log.child({component: 'client'}, true),
      socketPath: SOCK,
    });
    cb();
  });
};

exports.stop = function(cb) {
  exports.SERVER.once('close', function () {
    fs.unlink(SOCK, function (err) {
      if (cb) {
        cb();
      }
    });
  });
  exports.SERVER.close();
};
