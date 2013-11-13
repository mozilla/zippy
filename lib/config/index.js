var fs = require('fs');


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
  // Any URL in this list will *not* be protected by authentication.
  unprotectedUrls: [
    '/',  // Home page, where buy flow begins.
  ],
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
};
