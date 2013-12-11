var https = require('https');
var qs = require('querystring');
var supertest = require('super-request');
var test = require('./');
var oauth = require('oauth-client');

var config = require('../lib/config');


function serverAddress(app, path){
  var addr = app.address();
  if (!addr) app.listen(0);
  var port = app.address().port;
  var protocol = app instanceof https.Server ? 'https' : 'http';
  return protocol + '://127.0.0.1:' + port + path;
}


function buildOAuthorizationHeader(method, path) {
  var signer = oauth.createHmac(
    oauth.createConsumer(config.OAuthCredentials.consumerKey,
                         config.OAuthCredentials.consumerSecret)
  );
  var parameters = {
    oauth_consumer_key: config.OAuthCredentials.consumerKey,
    oauth_nonce: 'notimplemented',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: 'notimplemented',
    oauth_token: 'notimplemented',
    oauth_version: '1.0',
  };
  var signature = signer.sign(
    method,
    serverAddress(test.app, path),
    parameters
  );
  return 'OAuth realm="' + config.OAuthRealm + '",' +
    'oauth_signature="' + signature + '",' +
    (function (params) {
      var query_string = [];
      for (var key in params) {
        query_string.push(key + '="' + encodeURIComponent(params[key]) + '"');
      }
      return query_string.join(',');
    })(parameters);
}

function Client(url, accept, lang) {
  this.url = url;
  this.accept = accept || 'application/json';
  this.lang = lang || 'en-US';
  this._isJSON = this.accept.indexOf('json') !== -1;
  if (/.*\/$/.test(url)) {
    console.log('Warning: client URL ends with a slash, OAuth may fail.');
  }
}

Client.prototype.get = function(arg) {
  var url = this.url;
  var method = 'GET';
  if (arg) {
    if (typeof arg === 'object') {
      url = url + '?' + qs.stringify(arg);
    } else {
      if (arg.toString().indexOf('/') === 0) {
        // Treat it as an absolute URL and override this.url.
        url = arg.toString();
      } else {
        // Treat get arg like Curling, e.g. api.resource.get(pk)
        url = url + '/' + arg.toString();
      }
    }
  }
  var res = supertest(test.app)
    .get(url)
    .headers({
      'Accept': this.accept,
      'Accept-Language': this.lang,
      'Authorization': buildOAuthorizationHeader(method, url),
    });
  if (this._isJSON) {
    res = res.json(true);
  }
  return res;
};

Client.prototype.post = function(data) {
  var method = 'POST';
  var res = supertest(test.app)
    .post(this.url)
    .headers({
      'Accept': this.accept,
      'Authorization': buildOAuthorizationHeader(method, this.url),
    })
    .form(data);
  if (this._isJSON) {
    res = res.json(true);
  }
  return res;
};

Client.prototype.put = function(data) {
  var method = 'PUT';
  var res = supertest(test.app)
    .put(this.url)
    .headers({
      'Accept': this.accept,
      'Authorization': buildOAuthorizationHeader(method, this.url),
    })
    .form(data);
  if (this._isJSON) {
    res = res.json(true);
  }
  return res;
};


Client.prototype.del = function(data) {
  var method = 'DELETE';
  var res = supertest(test.app)
    .del(this.url)
    .headers({
      'Accept': this.accept,
      'Authorization': buildOAuthorizationHeader(method, this.url),
    })
    .form(data);
  if (this._isJSON) {
    res = res.json(true);
  }
  return res;
};


// TODO: merge AnonymousClient with Client! See stdlib util.inherits()

function AnonymousClient(url) {
  this.url = url;
}

AnonymousClient.prototype.get = function(data) {
  return supertest(test.app)
    .get(this.url + (data ? '?' + qs.stringify(data) : ''))
    .json(true);
};

AnonymousClient.prototype.post = function(data) {
  return supertest(test.app)
    .post(this.url)
    .headers({'Accept': 'application/json'})
    .json(true)
    .form(data);
};

exports.Client = Client;
exports.AnonymousClient = AnonymousClient;
