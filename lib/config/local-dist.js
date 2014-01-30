// Note: New keys must be additionally defined in default.js before being overriden here.
module.exports = {
  // Add a non-empty value to the zero-ith key.
  signatureKeys: {0: ''},
  // These are OAuth-related key, secret and realm.
  OAuthCredentials: {
    consumerKey: 'tobereplaced',
    consumerSecret: 'tobereplaced',
  },
  OAuthRealm: 'Zippy',
  // Session secret cannot be blank.
  sessionSecret: 'tobereplaced',
};
