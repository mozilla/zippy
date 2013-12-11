var assert = require('assert-plus');
var bunyan = require('bunyan');
var i18n = require('i18n-abide');
var nunjucks = require('nunjucks');
var passport = require('passport');
var path = require('path');
var restify = require('restify');
var sessions = require("client-sessions");

var auth = require('./auth');
var config = require('./config');
var formatters = require('./formatters');
var home = require('./home');
var monkey = require('./monkey');
var notices = require('./notices');
var payment = require('./payments');
var products = require('./products');
var sellers = require('./sellers');
var state = require('./state');
var styleguide = require('./styleguide');
var trans = require('./trans');
var z = require('./zutil');

var templateLoaders = [
  new nunjucks.FileSystemLoader(path.join(z.rootPath, 'templates/payments/')),
  new nunjucks.FileSystemLoader(path.join(z.rootPath, 'templates/styleguide/')),
  new nunjucks.FileSystemLoader(path.join(z.rootPath, 'templates/docs/')),
  new nunjucks.FileSystemLoader(path.join(z.rootPath, 'templates/'))
];

function createServer(options) {
  assert.object(options, 'options');
  assert.object(options.log, 'options.log');

  var server = restify.createServer({
    log: options.log,
    name: 'zippy',
    formatters: formatters,
  });

  config.addOverrides(options.configEnv);

  z.env = server.env = new nunjucks.Environment(templateLoaders, { autoescape: true });

  // Monkey Patch render onto response.
  server.use(monkey.patchNunjucksRender(server));
  // Monkey Patch Restify to allow more express like usage.
  server.use(monkey.patchResLocals);

  server.use(i18n.abide({
    supported_languages: config.supported_locales,
    default_lang: 'en-US',
    debug_lang: 'it-CH',
    locale_on_url: true
  }));

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
          var urlPath = req.url.toString().split('?')[0];
          for (var path in config.unprotectedUrls) {
            if (config.unprotectedUrls[path].test(urlPath)) {
              options.log.info('Skipping auth for whitelisted URL ' + urlPath);
              return next();
            }
          }
          if (!user.authenticated) {
            var errorMessage = 'Authentication failed: ' + info;
            options.log.info(errorMessage);
            return next(new restify.InvalidCredentialsError({'error': errorMessage}));
          }
          next();
        })(req, res, next);
      };
    }());
  }

  server.use(sessions({
    cookieName: 'zippySession',  // This becomes request.zippySession.
    secret: config.sessionSecret,
    duration: config.sessionDuration,
    activeDuration: config.sessionActiveDuration,
  }));


  server.get('/', home.get);
  server.post('/notices', notices.create);
  server.get('/products', products.list);
  server.get('/products/:uuid', products.retrieve);
  server.post('/products', products.create);
  server.get('/sellers', sellers.list);
  server.post('/sellers', sellers.create);
  server.get('/sellers/:id', sellers.retrieve);
  server.put('/sellers/:id', sellers.update);
  server.del('/sellers/:id', sellers.delete);
  server.get('/terms/:id', sellers.terms);
  server.get('/styleguide/:doc', styleguide.retrieve);
  server.get('/styleguide', styleguide.retrieve);
  server.post('/transactions', trans.create);
  server.get('/status', state.retrieve);

  // Payment screens.
  server.post('/payment/process', payment.processPayment);
  server.get('/payment/confirm', payment.confirmPayment);
  server.get('/payment/card', payment.creditCard);

  // Static Resources.
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
