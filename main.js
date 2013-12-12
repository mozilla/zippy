//var bunyan = require('bunyan');
var getopt = require('posix-getopt');

var zippy = require('./lib');

var NAME = 'zippyapp';

// In true UNIX fashion, debug messages go to stderr, and audit records go
// to stdout, so you can split them as you like in the shell
// var LOG = bunyan.createLogger({
//   name: NAME,
//   streams: [ {
//     level: (process.env.LOG_LEVEL || 'info'),
//     stream: process.stderr,
//   }, {
//     // This ensures that if we get a WARN or above all debug records
//     // related to that request are spewed to stderr - makes it nice
//     // filter out debug messages in prod, but still dump on user
//     // errors so you can debug problems
//     level: 'debug',
//     type: 'raw',
//     stream: new restify.bunyan.RequestCaptureStream({
//       level: bunyan.WARN,
//       maxRecords: 100,
//       maxRequestIds: 1000,
//       stream: process.stderr,
//     })
//   } ],
//   serializers: restify.bunyan.serializers,
// });



///--- Helpers

/**
 * Standard POSIX getopt-style options parser.
 *
 * Some options, like directory/user/port are pretty cut and dry, but note
 * the 'verbose' or '-v' option afflicts the log level, repeatedly. So you
 * can run something like:
 *
 * node main.js -p 80 -vv 2>&1 | bunyan
 *
 * And the log level will be set to TRACE.
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

 //   case 'v':
 //     // Allows us to set -vvv -> this little hackery
 //     // just ensures that we're never < TRACE
 //     LOG.level(Math.max(bunyan.TRACE, (LOG.level() - 10)));
 //     if (LOG.level() <= bunyan.DEBUG)
 //       LOG = LOG.child({src: true});
 //     break;

    default:
      usage('invalid option: ' + option.option);
      break;
    }
  }

 // LOG.debug(opts, 'command line arguments parsed');
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


function main(options) {
  options = options || parseOptions();
  var app = zippy.createApp({
    options: options,
  });
  var port = options.port || 8080;
  app.server = app.listen(port, function onServerStart() {
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
