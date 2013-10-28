var assert = require('assert-plus');
var bunyan = require('bunyan');
var restify = require('restify');

var config = require('./config');
var formatters = require('./formatters');
var handlers = require('./handlers');
var notices = require('./notices');
var products = require('./products');
var sellers = require('./sellers');
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

  server.get('/', handlers.home);
  server.post('/notices/', notices.post);
  server.post('/products/', products.post);
  server.get('/sellers/', sellers.retrieveSellers);
  server.post('/sellers/', sellers.createSeller);
  server.get('/sellers/:uuid/', sellers.retrieveSeller);
  server.post('/transactions/', trans.post);
  server.get(/\/(?:css|fonts)\/?.*/, restify.serveStatic({
    directory: './statics'
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

  return (server);
}

module.exports = {
  createServer: createServer
};
