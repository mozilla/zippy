var assert = require('assert-plus');
//var bunyan = require('bunyan');
var express = require('express');
var i18n = require('i18n-abide');
var nunjucks = require('nunjucks');
var passport = require('passport');
var path = require('path');
var sessions = require("client-sessions");

var auth = require('./auth');
var config = require('./config');
var errors = require('./errors');
var notices = require('./notices');
var payment = require('./payments');
var products = require('./products');
var sellers = require('./sellers');
var state = require('./state');
var styleguide = require('./styleguide');
var trans = require('./trans');
var z = require('./zutil');

var templatePaths = [
  path.join(z.rootPath, 'templates/payments/'),
  path.join(z.rootPath, 'templates/styleguide/'),
  path.join(z.rootPath, 'templates/docs/'),
  path.join(z.rootPath, 'templates/'),
];

function createApp(options) {

  // Setup Config with overrides.
  config.addOverrides(options.configEnv);

  assert.object(options, 'options');
  //assert.object(options.log, 'options.log');

  var app = express();

  app.set('log', options.log);
  app.set('name', 'zippy');

  if (!options.options || !options.options.noAuth) {
    // OAuthentication using passport with the token strategy (a.k.a. 0-legged).
    app.use(passport.initialize());
    passport.use('token', auth.tokenStrategy());
    app.use(function authenticate() {
      return function (req, res, next) {
        passport.authenticate('token', { session: false }, function(err, user, info) {
          var urlPath = req.url.toString().split('?')[0];
          for (var path in config.unprotectedUrls) {
            if (config.unprotectedUrls[path].test(urlPath)) {
              //options.log.info('Skipping auth for whitelisted URL ' + urlPath);
              return next();
            }
          }
          if (!user.authenticated) {
            var errorMessage = 'Authentication failed: ' + info;
            //options.log.info(errorMessage);
            throw new errors.InvalidCredentialsError({'message': errorMessage});
          }
          next();
        })(req, res, next);
      };
    }());
  }

  var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(templatePaths),
                                     { autoescape: true });
  env.express(app);

  app.use(i18n.abide({
    supported_languages: config.supported_locales,
    default_lang: 'en-US',
    debug_lang: 'it-CH',
    locale_on_url: true
  }));

  app.use(sessions({
    cookieName: 'zippySession',  // This becomes request.zippySession.
    secret: config.sessionSecret,
    duration: config.sessionDuration,
    activeDuration: config.sessionActiveDuration,
  }));

  // middleware to parse the post data.
  app.use(express.urlencoded());

  app.post('/notices', notices.create);
  app.get('/products', products.list);
  app.get('/products/:uuid', products.retrieve);
  app.post('/products', products.create);
  app.get('/sellers', sellers.list);
  app.post('/sellers', sellers.create);
  app.get('/sellers/:uuid', sellers.retrieve);
  app.put('/sellers/:uuid', sellers.update);
  app.del('/sellers/:uuid', sellers.delete);
  app.get('/terms/:uuid', sellers.terms);
  app.get('/styleguide/:doc', styleguide.retrieve);
  app.get('/styleguide', styleguide.retrieve);
  app.post('/transactions', trans.create);
  app.get('/status', state.retrieve);

  // Payment screens.
  app.get('/', payment.start);
  app.post('/payment/process', payment.processPayment);
  app.get('/payment/confirm', payment.confirmPayment);
  app.get('/payment/card', payment.creditCard);

  // Error handling must be last.
  /*jshint unused:false */
  app.use(function(err, req, res, next) {
    // console.error(err.stack);
    res.json(err.statusCode, err.body);
  });

  // Static Resources.
  app.get(/\/(?:css|fonts|images|js)\/?.*/, express.static('./media'));

//  if (!options.noAudit) {
//    app.on('after', restify.auditLogger({
//      body: true,
//      log: bunyan.createLogger({
//        level: 'info',
//        name: 'zippy-audit',
//        stream: process.stdout,
//      })
//    }));
//  }

  return app;
}

module.exports = {
  createApp: createApp
};
