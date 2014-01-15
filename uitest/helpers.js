var config = require('../lib/config');

// Use local config to override this if needed.
config.addOverrides('local');

exports.startCasper = function startCasper(path) {
  casper.start('http://localhost:' + config.uitestServerPort + path);
};
