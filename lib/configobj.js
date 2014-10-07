var _ = require('underscore');

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
  var that = this;

  if (!config.default) {
    throw new Error("Default key of config object doesn't exist. Aborting.");
  }

  // Get the keys from all the configs. This way we can add a config option
  // that only exists in an overlayed config.
  var listOfKeyLists = [];
  Object.keys(config).forEach(function(key) {
    listOfKeyLists.push(Object.keys(config[key]));
  });

  var keys = _.union.apply(this, listOfKeyLists);

  keys.forEach(function(key) {
    that.__defineGetter__(key, function(){
      var env = getNodeEnv();
      if (env === 'local') {
        throw new Error('Pointless NODE_ENV. Local env is always overlayed unless the NODE_ENV is test');
      }

      if (typeof config.default[key] === 'undefined') {
        console.warn('[Warning] Config key "' + key + '" is not defined in the default config');
      }

      // Define test config up front so we don't overlay local settings.
      if (env === 'test' && config.test && config.test[key]) {
        return config.test[key];
      }

      // Overlay docker conf which is only present if we're running
      // under docker.
      if (config.docker && config.docker[key]) {
        return config.docker[key];
      }

      // local overrides everything that's not a test config.
      if (env !== 'test') {
        if (config.local && config.local[key]) {
          return config.local[key];
        }
      }

      // Loading Stackato's credentials for Redis.
      // typeof check is for casper which doesn't have access to 'process'.
      if (typeof process !== 'undefined' && process.env && process.env.VCAP_SERVICES) {
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
