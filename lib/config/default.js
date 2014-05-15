// All conf vars must be defined here first before being overridden
// elsewhere.
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

  // When set to an object, logging adds express logging middleware.
  // Example: logging: {format: 'dev'}
  logging: null,

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

  supportedLanguages: [
    'af',
    'ar',
    'as',
    'ast',
    'be',
    'bg',
    'bn-BD',
    'bn-IN',
    'bs',
    'ca',
    'cs',
    'cy',
    'da',
    'db-LB', // Debug locale for i18n
    'de',
    'el',
    'en-US',
    'eo',
    'es',
    'et',
    'eu',
    'fa',
    'ff',
    'fi',
    'fr',
    'fy-NL',
    'ga-IE',
    'gd',
    'gl',
    'gu',
    'he',
    'hi-IN',
    'hr',
    'ht',
    'hu',
    'id',
    'it',
    'ja',
    'km',
    'kn',
    'ko',
    'ku',
    'lij',
    'lt',
    'mk',
    'ml',
    'mn',
    'ms',
    'my',
    'nb-NO',
    'ne-NP',
    'nl',
    'or',
    'pa',
    'pl',
    'pt-BR',
    'pt-PT',
    'ro',
    'ru',
    'si',
    'sk',
    'sl',
    'sq',
    'sr',
    'sr-Latn',
    'sv-SE',
    'ta',
    'te',
    'th',
    'tr',
    'uk',
    'ur',
    'vi',
    'zh-CN',
    'zh-TW'
  ],

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
};

