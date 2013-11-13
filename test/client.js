var supertest = require('supertest');
var test = require('./');
var oauth = require('oauth-client');

var config = require('../lib/config');


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
    supertest.Test.prototype.serverAddress(test.app, path),
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

function Client(url, accept) {
  this.url = url;
  this.accept = accept || 'application/json';
  if (/.*\/$/.test(url)) {
    console.log('Warning: client URL ends with a slash, OAuth may fail.');
  }
}

Client.prototype.get = function(data) {
  var method = 'GET';
  return supertest(test.app)
    .get(this.url)
    .set('Accept', this.accept)
    .set('Authorization', buildOAuthorizationHeader(method, this.url))
    .send(data);
};

Client.prototype.post = function(data) {
  var method = 'POST';
  return supertest(test.app)
    .post(this.url)
    .set('Accept', this.accept)
    .set('Authorization', buildOAuthorizationHeader(method, this.url))
    .send(data);
};

Client.prototype.put = function(data) {
  var method = 'PUT';
  return supertest(test.app)
    .put(this.url)
    .set('Accept', this.accept)
    .set('Authorization', buildOAuthorizationHeader(method, this.url))
    .send(data);
};


Client.prototype.del = function(data) {
  var method = 'DELETE';
  return supertest(test.app)
    .del(this.url)
    .set('Accept', this.accept)
    .set('Authorization', buildOAuthorizationHeader(method, this.url))
    .send(data);
};


function AnonymousClient(url) {
  this.url = url;
}

AnonymousClient.prototype.get = function() {
  return supertest(test.app)
    .get(this.url);
};

AnonymousClient.prototype.post = function(data) {
  return supertest(test.app)
    .post(this.url)
    .set('Accept', 'application/json')
    .send(data);
};

exports.Client = Client;
exports.AnonymousClient = AnonymousClient;
