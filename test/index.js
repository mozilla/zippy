var http = require("http");

var zippy = require('../lib');

exports.app = undefined;


function createServer() {
  // TODO(davidbgk): find an easy way to launch tests against
  // an external provider.
  return http.createServer(zippy.createApp({}));
}


exports.start = function(cb) {
  exports.app = createServer();  // not listening to a socket.
  cb();
};


exports.stop = function(cb) {
  exports.app.close();
  cb();
};
