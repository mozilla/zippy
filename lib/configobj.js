function getNodeEnv() {
  var env;
  if (typeof process !== 'undefined' && process.env) {
    env = process.env.NODE_ENV;
  } else {
    // Casper.
    var system = require('system');
    env = system.env.NODE_ENV;
  }
  return env;
}

module.exports = function Config(config) {
  if (!config.default) {
    throw new Error("Default key of config object doesn't exist. Aborting.");
  }
  var that = this;

  Object.keys(config.default).forEach(function(key) {
    that.__defineGetter__(key, function(){
      var env = getNodeEnv();
      if (env === 'local') {
        throw new Error('Pointless NODE_ENV. Local env is always overlayed unless the NODE_ENV is test');
      }
      // Define test config up front so we don't overlay local settings.
      if (env === 'test' && config.test && config.test[key]) {
        return config.test[key];
      }
      // local overrides everything that's not a test config.
      if (env !== 'test') {
        if (config.local && config.local[key]) {
          return config.local[key];
        }
      }

      // Loading Stackato's credentials for Redis.
      if (process.env.VCAP_SERVICES) {
        var redisconf = JSON.parse(process.env.VCAP_SERVICES).redis[0].credentials;
        if (key === 'redisConn') {
          return {
            port: redisconf.port,
            host: redisconf.host,
            password: redisconf.password,
          };
        }
      }

      // Other env config.
      if (config[env] && config[env][key]) {
        return config[env][key];
      }
      return config.default[key];
    });
  });
};
