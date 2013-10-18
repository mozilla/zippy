var assert = require('assert-plus');
var restify = require('restify');


function ZippyClient(options) {
  assert.object(options, 'options');
  assert.object(options.log, 'options.log');
  assert.optionalString(options.socketPath, 'options.socketPath');
  assert.optionalString(options.url, 'options.url');
  assert.optionalString(options.version, 'options.version');

  this.client = restify.createJsonClient({
    log: options.log,
    name: 'ZippyClient',
    socketPath: options.socketPath,
    url: options.url,
  });
  this.log = options.log.child({component: 'ZippyClient'}, true);
  this.url = options.url;
}


ZippyClient.prototype.retrieveSellers = function retrieveSellers(cb) {
  assert.func(cb, 'callback');

  this.client.get('/sellers/', function (err, req, res, obj) {
    if (err) {
      cb(err);
    } else {
      cb(null, obj);
    }
  });
};


ZippyClient.prototype.createSeller = function createSeller(uuid, cb) {
  assert.string(uuid, 'uuid');
  assert.func(cb, 'callback');

  this.client.post('/sellers/', {uuid: uuid}, function (err, req, res, obj) {
    if (err) {
      cb(err);
    } else {
      cb(null, obj);
    }
  });
};


ZippyClient.prototype.retrieveSeller = function retrieveSeller(uuid, cb) {
  assert.string(uuid, 'uuid');
  assert.func(cb, 'callback');

  this.client.get('/sellers/' + uuid + '/', function (err, req, res, obj) {
    if (err) {
      cb(err);
    } else {
      cb(null, obj);
    }
  });
};


module.exports = {
  createClient: function createClient(options) {
    return (new ZippyClient(options));
  }
};
