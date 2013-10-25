var bunyan = require('bunyan');
var restify = require('restify');

var zippy = require('../lib');

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
  cb();
};


exports.stop = function(cb) {
  exports.app.close();
  cb();
};
