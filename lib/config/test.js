var redis = require('then-redis');
// FIXME: bug 965207 use a mock for Redis,
// maybe https://github.com/faeldt/redis-mock
// but it has to be promisified.

module.exports = function(conf) {
  conf.signatureKeys = {0: 'secret value for testing'};
  conf.OAuthCredentials = {
    consumerKey: 'dpf43f3p2l4k3l03',
    consumerSecret: 'kd94hf93k423kf44',
  };
  conf.OAuthRealm = 'Zippy';
  conf.sessionSecret = 'I once ate 5 burritos';
  conf.redisConn = {
    host: 'localhost',
    port: 6379,
  };
  conf.redisClient = redis.createClient;
};
