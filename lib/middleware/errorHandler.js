var config = require('../config');

module.exports = function errorHandler() {
  /*jshint unused: vars */
  return function errorHandler(err, req, res, next){

    try {
      var showStack = config.showStack;
      var showJSONStack = config.showJSONStack;
      var dumpStack = config.dumpStack;

      if (err.status) {
        res.statusCode = err.status;
      } else {
        // Fallback status code.
        res.statusCode = 500;
      }
      if (res.statusCode < 400) {
        res.statusCode = 500;
      }

      if (dumpStack && err.stack) {
        console.log(err.stack);
      }

      var accept = req.headers.accept || '';

      // html
      if (~accept.indexOf('html')) {

        res.render('error.html', {
          error: err.message || 'An Unhandled error occurred',
          statusCode: err.status || res.statusCode,
          name: err.name || 'Internal Server Error',
          explanation: err.explanation,
          response: err.response,
          title: 'Zippy Error',
          stack: (showStack ? err.stack : '').split('\n'),
        });

      // json
      } else {
        var json = {error: err.toJSON()};
        if (showStack && showJSONStack) {
          json.error.stack = err.stack;
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(json));
      }
    } catch(err) {
      // Fallback so we do a basic 500 if all else fails.
      if (dumpStack && err.stack) {
        console.log(err.stack);
      }
      res.statusCode = 500;
      res.end('Server Error');
    }
  };
};

