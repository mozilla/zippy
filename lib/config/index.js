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
module.exports = new Config(config);
