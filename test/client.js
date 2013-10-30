var supertest = require('supertest');
var test = require('./');
var oauth = require('oauth-client');

var config = require('../lib/config');


function buildOAuthorizationHeader(method, path) {
  var signer = oauth.createHmac(
    oauth.createConsumer('key', config.OAuthCredentials.consumerSecret),
    oauth.createToken('key', 'tokensecret')
  );
  var parameters = {
    oauth_consumer_key: config.OAuthCredentials.consumerKey,
    oauth_nonce: 'notimplemented',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: 'notimplemented',
    oauth_token: 'mycustomtokenkey',
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

function Client(url) {
  this.url = url;
}

Client.prototype.get = function(data) {
  var method = 'GET';
  return supertest(test.app)
    .get(this.url)
    .set('Accept', 'application/json')
    .set('Authorization', buildOAuthorizationHeader(method, this.url))
    .send(data);
};

Client.prototype.post = function(data) {
  var method = 'POST';
  return supertest(test.app)
    .post(this.url)
    .set('Accept', 'application/json')
    .set('Authorization', buildOAuthorizationHeader(method, this.url))
    .send(data);
};

function AnonymousClient(url) {
  this.url = url;
}

AnonymousClient.prototype.post = function(data) {
  return supertest(test.app)
    .post(this.url)
    .set('Accept', 'application/json')
    .send(data);
};

exports.Client = Client;
exports.AnonymousClient = AnonymousClient;
