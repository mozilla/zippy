module.exports = function(conf) {
  // Add a non-empty value to the zero-ith key.
  conf.signatureKeys = {0: ''};
  // These are OAuth-related key, secret and realm.
  conf.OAuthCredentials = {
    consumerKey: 'tobereplaced',
    consumerSecret: 'tobereplaced',
  };
  conf.OAuthRealm = 'Zippy';
  // Session secret cannot be blank.
  conf.sessionSecret = 'tobereplaced';
};
