var TokenStrategy = require('passport-http-oauth').TokenStrategy;

var config = require('./config');

/**
 * TokenStrategy
 *
 * This strategy is used to authenticate users based on an access token.  The
 * user must have previously authorized a client application, which is issued an
 * access token to make requests on behalf of the authorizing user.
 *
 * For a complete example and documentation, see:
 * https://github.com/jaredhanson/oauthorize/blob/master/examples/express2/auth.js#L102
 */

// The consumer secret issued is the same for every user in this configuration.
var consumer = function consumer(consumerKey, done) {
  var client = {consumerSecret: config.OAuthCredentials.consumerSecret};
  done(null, client, client.consumerSecret);
};

// The token secret issued is the same for every user in this configuration.
// You can add more information to the `info` that will be available
// at the request level through `req.authInfo`. The `user` object will
// be available as `req.user` too.
var verify = function verify(accessToken, done) {
  var info = { scope: '*' };
  var user = {};
  var token = {secret: config.OAuthCredentials.tokenSecret};
  done(null, user, token.secret, info);
};

// The validation does not prevent from replay attacks in this configuration.
// You have to deal with `timestamp` + `nonce` uniqueness to get rid of that.
var validate = function validate(timestamp, nonce, done) {
  done(null, true);
};

module.exports = {
  tokenStrategy: function tokenStrategy() {
    return (new TokenStrategy({realm: config.OAuthRealm}, consumer, verify, validate));
  }
};
