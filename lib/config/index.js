var fs = require('fs');
var redis = require('then-redis');


// Populate default config values.

module.exports = {
  // These are active secret keys to create signatures with.
  // Make sure they are really long and random strings.
  // To rotate keys, add a new key with an index one greater
  // than the last key. For example, if you have a key at index 0, add the new one
  // at index 1 and leave the old one in tact until you want to phase it out.
  signatureKeys: {0: ''},
  // These are OAuth-related key, secret and realm.
  OAuthCredentials: {
    consumerKey: '',
    consumerSecret: '',
  },
  OAuthRealm: '',

  // How long session is valid for in millesconds.
  sessionDuration: 24 * 60 * 60 * 1000,
  sessionSecret: '',
  // if expiresIn < activeDuration, the session will be extended by
  // activeDuration milliseconds.
  sessionActiveDuration: 1000 * 60 * 5,

  // Show stacktrace in errors.
  showStack: false,
  // Show stacktrace in JSON responses. (Note: Requires showStack to also be true).
  showJSONStack: false,
  // Whether to console.log stacktraces.
  dumpStack: false,

  supportedLocales: ['en-US', 'fr', 'es', 'it-CH'],

  // Any URL in this list will *not* be protected by authentication.
  unprotectedUrls: [
    /^\/$/,  // Home page, where buy flow begins.
    /^\/payment\//,
    /^\/styleguide/,
    /^\/status/,
    /^\/users\/reset/,
    /^\/(?:css|fonts|images|js|lib)/,
  ],

  uitestServerPort: 9899,
  // This is for casper. When true client console messages are output.
  showClientConsole: false,
  // See options: https://github.com/mjijackson/then-redis#usage
  redisConn: {
    host: 'localhost',
    port: 6379,
  },
  redisClient: redis.createClient,
};


module.exports.addOverrides = function(env) {
  env = env || process.env.NODE_ENV;
  var override;

  if (env === 'test') {
    override = require('./test');
  } else {
    try {
      override = require('./local');
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
      var dest = __dirname + '/local.js';
      fs.writeFileSync(dest, fs.readFileSync(__dirname + '/local-dist.js'));
      console.warn('Created a local config file at ', dest,
                   '; update it with real values.');
      override = require('./local');
    }
  }
  override(module.exports);
  module.exports.redisCli = module.exports.redisClient(module.exports.redisConn);
};
