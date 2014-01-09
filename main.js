//var bunyan = require('bunyan');
var getopt = require('posix-getopt');

var zippy = require('./lib');

var NAME = 'zippyapp';


///--- Helpers

/**
 * Standard POSIX getopt-style options parser.
 */
function parseOptions() {
  var option;
  var opts = {};
  var parser = new getopt.BasicParser('hvnp:', process.argv);

  while ((option = parser.getopt()) !== undefined) {
    switch (option.option) {
    case 'h':
      usage();
      break;

    case 'n':
      opts.noAuth = true;
      break;

    case 'p':
      opts.port = parseInt(option.optarg, 10);
      break;

    default:
      usage('invalid option: ' + option.option);
      break;
    }
  }

  return (opts);
}


function usage(msg) {
  if (msg) {
    console.error(msg);
  }
  var str = 'usage: ' + NAME + ' [-v] [-n] [-p port]\n' +
            '       -v stands for verbosity\n' +
            '       -n stands for noAuth (removing OAuth middleware)';
  console.error(str);
  process.exit(msg ? 1 : 0);
}


var http = require("http");
function main(options) {
  options = options || parseOptions();
  var server = http.createServer(zippy.createApp({
    options: options,
  }));
  var port = options.port || 8080;
  server.listen(port, function onServerStart() {
    var addr = this.address();
    console.log('listening at %s:%s', addr.address, addr.port);
  });
}

// A rough node equivalent of python's if __name__ == "__main__".
if (!module.parent) {
  main();
} else {
  module.exports = main;
}
