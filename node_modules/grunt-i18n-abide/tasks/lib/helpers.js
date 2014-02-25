var util = require('util');

var shell = require('shelljs');
var grunt = require('grunt');

exports.runShellSync = function runShellSync(cmd, args) {
  args.splice(0, 0, cmd);
  var command = args.join(' ');
  var result = shell.exec(args.join(' '));
  if (result.code !== 0) {
    grunt.fail.fatal('Command "' + command + '" exited with a non-zero status');
  }
  return result;
};


exports.checkCommand = function checkCommand(cmd) {
  // Checks the command exists before running it.
  var result = shell.exec('bash -c "type -P ' + cmd + ' > /dev/null"');
  if (result.code !== 0) {
    grunt.fail.fatal('Command "' + cmd + '" doesn\'t exist! Maybe you need to install it.');
  }
};


/**
* Given a language code, return a locale code the OS understands.
* Based on: https://github.com/mozilla/i18n-abide/blob/master/lib/i18n.js
*
* language: en-US
* locale: en_US
*/
exports.localeFrom = function(language) {
  if (! language || ! language.split) {
    return "";
  }

  if (language.indexOf('_') > -1) {
    grunt.log.writeln(util.format("Check this is a language code. Language [%s] already contains a '_'", language));
    return language;
  }

  var parts = language.split('-');
  if (parts.length === 1) {
    return parts[0].toLowerCase();
  } else if (parts.length === 2) {
    return util.format('%s_%s', parts[0].toLowerCase(), parts[1].toUpperCase());
  } else if (parts.length === 3) {
    // sr-Cyrl-RS should be sr_RS
    return util.format('%s_%s', parts[0].toLowerCase(), parts[2].toUpperCase());
  } else {
    grunt.log.writeln(util.format("Unable to map a locale from language code [%s]", language));
    return language;
  }
};


/**
* Given a locale code, return a language code
* Based on: https://github.com/mozilla/i18n-abide/blob/master/lib/i18n.js
*/
exports.languageFrom = function languageFrom(locale) {
  if (!locale || !locale.split) {
    return "";
  }
  var parts = locale.split('_');
  if (parts.length === 1) {
    return parts[0].toLowerCase();
  } else if (parts.length === 2) {
    return util.format('%s-%s', parts[0].toLowerCase(), parts[1].toUpperCase());
  } else if (parts.length === 3) {
    // sr_RS should be sr-RS
    return util.format('%s-%s', parts[0].toLowerCase(), parts[2].toUpperCase());
  } else {
    grunt.log.writeln(util.format("Unable to map a language from locale code [%s]", locale));
    return locale;
  }
};
