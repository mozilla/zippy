var supertest = require('supertest');
var test = require('./');
var oauth = require('oauth-client');

var config = require('../lib/config');


function buildOAuthorizationHeader(method, path) {
  var signer = oauth.createHmac(
    oauth.createConsumer('key', config.OAuthCredentials.consumerSecret),
    oauth.createToken('key', config.OAuthCredentials.tokenSecret)
  );
  var parameters = {
    oauth_consumer_key: config.OAuthCredentials.consumerKey,
    oauth_nonce: 'notimplemented',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: 'notimplemented',
    oauth_token: config.OAuthCredentials.tokenKey,
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

Client.prototype.post = function(data) {
  var method = 'POST';
  return supertest(test.app)
    .post(this.url)
    .set('Accept', 'application/json')
    .set('Authorization', buildOAuthorizationHeader(method, this.url))
    .send(data);
};

exports.Client = Client;
