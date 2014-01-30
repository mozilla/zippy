var errors = require('errors');
var express = require('express');
var i18n = require('i18n-abide');
var nunjucks = require('nunjucks');
var passport = require('passport');
var path = require('path');
var sessions = require("client-sessions");

require('./httperrors');

var auth = require('./auth');
var config = require('./config');
var errorHandler = require('./middleware/errorHandler');
var notices = require('./notices');
var payment = require('./payments');
var products = require('./products');
var sellers = require('./sellers');
var state = require('./state');
var styleguide = require('./styleguide');
var trans = require('./trans');
var users = require('./users');
var z = require('./zutil');

var templatePaths = [
  path.join(z.rootPath, 'templates/payments/'),
  path.join(z.rootPath, 'templates/styleguide/'),
  path.join(z.rootPath, 'templates/docs/'),
  path.join(z.rootPath, 'templates/'),
];

function createApp(options) {

  var app = express();
  app.set('name', 'zippy');

  if (!options.options || !options.options.noAuth) {
    // OAuthentication using passport with the token strategy (a.k.a. 0-legged).
    app.use(passport.initialize());
    passport.use('token', auth.tokenStrategy());
    app.use(function authenticate() {
      return function(req, res, next) {
        passport.authenticate('token', { session: false }, function(err, user, info) {
          var urlPath = req.url.toString().split('?')[0];
          for (var path in config.unprotectedUrls) {
            if (config.unprotectedUrls[path].test(urlPath)) {
              return next();
            }
          }
          if (!user.authenticated) {
            var errorMessage = 'Authentication failed: ' + JSON.stringify(info);
            throw new errors.InvalidCredentialsError(errorMessage);
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
    /*jshint camelcase: false */
    supported_languages: config.supportedLocales,
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

  // Parse JSON or urlencoded POST data but not file uploads.
  app.use(express.json());
  app.use(express.urlencoded());

  app.post('/notices', notices.verify);
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
  app.get('/users/reset', users.reset);
  app.get('/status', state.retrieve);

  // Payment screens.
  app.get('/', payment.start);
  app.post('/payment/process', payment.processPayment);
  app.get('/payment/confirm', payment.confirmPayment);
  app.get('/payment/card', payment.creditCard);
  app.get('/payment/confirm-mobile-number', payment.mtAuth);
  app.get('/payment/confirm-pin', payment.confirmSMSPin);

  // Static Resources.
  app.get(/\/(?:css|fonts|images|js|lib)\/?.*/, express.static('./media'));

  // 404 Catch-all.
  app.use(function(req, res, next) {
    return next(new errors.NotFoundError("Sorry! Zippy can't find this please check the URL"));
  });

  // Error handling middleware.
  app.use(errorHandler());

  return app;
}

module.exports = {
  createApp: createApp
};
