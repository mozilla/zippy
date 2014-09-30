// Setup config based on env.
var fs = require('fs');

var Config = require('../configobj');


var config  = {};
config.default = require('./default');
config.test = require('./test');

try {
  config.local = require('./local');
} catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err;
  }
  var dest = __dirname + '/local.js';
  fs.writeFileSync(dest, fs.readFileSync(__dirname + '/local-dist.js'));
  console.warn('Created a local config file at ', dest,
               '; update it with real values.');
}

// Import the docker config if this is running under docker.
if (typeof process !== 'undefined' && process.env.IS_DOCKER) {
  try {
    config.docker = require('./docker');
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err;
    }
  }
}

module.exports = new Config(config);
