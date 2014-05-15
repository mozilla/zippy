var fs = require('fs');
var path = require('path');

var i18n = require('i18n-abide');
var helpers = require('./lib/helpers');

var runShellSync = helpers.runShellSync;
var checkCommand = helpers.checkCommand;


module.exports = function (grunt) {

  'use strict';

  grunt.registerMultiTask('abideCreate', 'Wraps msginit to simplify locale creation.', function () {

    var options = this.options();
    var baseLocaleDir = options.localeDir || 'locale';
    var template = options.template;

    template = template || path.join(baseLocaleDir, 'templates/LC_MESSAGES/messages.pot');
    template = path.normalize(template);

    if (!grunt.file.isFile(template)) {
      grunt.fail.fatal('template file "' + template + '" does not exist');
    }

    var languages = options.languages || [];
    if (languages.length === 0) {
      grunt.fail.fatal('A list of languages needs to be specified.');
    }

    languages.forEach(function(language) {
      // en-US -> en_US
      var locale = i18n.localeFrom(language);

      // Make the dir for the locale.
      var args = [];

      var outputFile = path.join(baseLocaleDir, locale, 'LC_MESSAGES/messages.po');
      var cmd = options.cmd || 'msginit';

      // No-op if po already exists.
      if (fs.existsSync(outputFile)) {
        grunt.log.writeln('Locale "' + locale + '" already exists, skipping...');
        return false;
      }

      checkCommand(cmd);

      // Non-interactive :)
      args.push('--no-translator');

      args.push('--input');
      args.push(template);

      args.push('--output');
      args.push(outputFile);

      grunt.file.mkdir(path.join(baseLocaleDir, locale, 'LC_MESSAGES'));

      args.push('-l');
      args.push(locale);

      // Synchronously execute commands.
      runShellSync(cmd, args);

      grunt.log.ok('Locale "' + locale + '" created successfully.');
    });

  });

};
