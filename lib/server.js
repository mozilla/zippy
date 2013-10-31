var assert = require('assert-plus');
var bunyan = require('bunyan');
var passport = require('passport');
var restify = require('restify');

var auth = require('./auth.js');
var config = require('./config');
var formatters = require('./formatters.js');
var handlers = require('./handlers.js');
var notices = require('./notices');
var products = require('./products.js');
var sellers = require('./sellers.js');
var state = require('./state.js');
var styleguide = require('./styleguide.js');
var trans = require('./trans');


function createServer(options) {
  assert.object(options, 'options');
  assert.object(options.log, 'options.log');

  var server = restify.createServer({
    log: options.log,
    name: 'zippy',
    formatters: formatters,
  });

  config.addOverrides(options.configEnv);

  // http://bit.ly/19A3Fpl to stop restify messing with the urls.
  server.pre(restify.pre.sanitizePath());
  server.use(restify.requestLogger());
  server.use(restify.bodyParser());

  if (!options.options || !options.options.noAuth) {
    // OAuthentication using passport with the token strategy (a.k.a. 0-legged).
    server.use(passport.initialize());
    passport.use('token', auth.tokenStrategy());
    server.pre(function authenticate() {
      return function (req, res, next) {
        passport.authenticate('token', { session: false }, function(err, user, info) {
          if (!user.authenticated) {
            options.log.info('Authentication failed: ' + info);
            return next(new restify.InvalidCredentialsError('Unauthorized'));
          }
          next();
        })(req, res, next);
      };
    }());
  }

  server.get('/', handlers.home);
  server.post('/notices', notices.create);
  server.post('/products', products.create);
  server.get('/sellers', sellers.list);
  server.post('/sellers', sellers.create);
  server.get('/sellers/:uuid', sellers.retrieve);
  server.put('/sellers/:uuid', sellers.update);
  server.del('/sellers/:uuid', sellers.delete);
  server.get('/styleguide/:doc', styleguide.retrieve);
  server.get('/styleguide', styleguide.retrieve);
  server.post('/transactions', trans.create);
  server.get('/status', state.state);
  server.get(/\/(?:css|fonts|images|js)\/?.*/, restify.serveStatic({
    directory: './media'
  }));

  if (!options.noAudit) {
    server.on('after', restify.auditLogger({
      body: true,
      log: bunyan.createLogger({
        level: 'info',
        name: 'zippy-audit',
        stream: process.stdout,
      })
    }));
  }

  return server;
}

module.exports = {
  createServer: createServer
};
