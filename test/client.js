var https = require('https');
var oauth = require('oauth-client');
var qs = require('querystring');
var supertest = require('super-request');
var under = require('underscore');
var url = require('url');

var config = require('../lib/config');
var test = require('./');


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
  var auth = {
    oauth_consumer_key: config.OAuthCredentials.consumerKey,
    oauth_nonce: 'notimplemented',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: 'notimplemented',
    oauth_token: 'notimplemented',
    oauth_version: '1.0',
  };

  // Parse url (based on https://github.com/unscene/node-oauth/blob/master/lib/oauth.js#L160)
  // This is so query params are used as part of the sig.
  var parsed = url.parse(path);
  var queryParams = null;
  // if any parameters are passed with the path we need them
  if (parsed.query) {
    queryParams = qs.parse(parsed.query);
  }

  var parameters = {};
  under.extend(parameters, auth);
  under.extend(parameters, queryParams);

  var signature = signer.sign(
    method,
    serverAddress(test.app, path),
    parameters
  );

  delete parameters.external_id;
  var headers =  'OAuth realm="' + config.OAuthRealm + '",' +
    'oauth_signature="' + signature + '",' +
    (function (params) {
      var query_string = [];
      Object.keys(auth).forEach(function(key) {
        query_string.push(key + '="' + encodeURIComponent(params[key]) + '"');
      });
      return query_string.join(',');
    })(parameters);
  return headers;
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

function AnonymousClient(url, accept, lang) {
  this.url = url;
  this.accept = accept || 'application/json';
  this.lang = lang || 'en-US';
  this._isJSON = this.accept.indexOf('json') !== -1;
}

AnonymousClient.prototype.get = function(data) {
  var res =  supertest(test.app)
    .get(this.url + (data ? '?' + qs.stringify(data) : ''))
    .headers({
      'Accept': this.accept,
      'Accept-Language': this.lang,
    });

  if (this._isJSON) {
    res = res.json(true);
  }

  return res;
};

AnonymousClient.prototype.post = function(data) {
  var res = supertest(test.app)
    .post(this.url)
    .headers({
      'Accept': this.accept,
      'Accept-Language': this.lang,
    })
    .form(data);

  if (this._isJSON) {
    res = res.json(true);
  }
  return res;
};

exports.buildOAuthorizationHeader = buildOAuthorizationHeader;
exports.Client = Client;
exports.AnonymousClient = AnonymousClient;
