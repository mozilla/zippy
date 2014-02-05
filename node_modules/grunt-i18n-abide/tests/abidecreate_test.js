'use strict';

var fs = require('fs');
var grunt = require('grunt');
var shell = require('shelljs');
var utils = require('./utils');


exports.create = {
  setUp: function(done) {
    done();
  },
  testCommandNoExist: function(test) {
    test.expect(1);
    var result = shell.exec('grunt abideCreate:commandnoexist');
    test.ok(utils.contains('Fatal error: Command "tests/bin/whatevs.sh" doesn\'t exist!', result.output));
    test.done();
  },
  testTemplateNoExist: function(test) {
    test.expect(1);
    var result = shell.exec('grunt abideCreate:templatenoexist');
    test.ok(utils.contains('Fatal error: template file "tests/tmp/noexist.pot" does not exist', result.output));
    test.done();
  },
  testUS: function(test) {
    test.expect(1);
    var created = 'tests/tmp/en_US/LC_MESSAGES/messages.po';
    test.ok(grunt.file.exists(created));
    test.done();
  },
  testFR: function(test) {
    test.expect(1);
    var created = 'tests/tmp/fr/LC_MESSAGES/messages.po';
    test.ok(grunt.file.exists(created));
    test.done();
  },
  testES: function(test) {
    test.expect(1);
    var created = 'tests/tmp/es/LC_MESSAGES/messages.po';
    test.ok(grunt.file.exists(created));
    test.done();
  },
  testNotModified: function(test) {
    test.expect(3);
    shell.exec('grunt abideCreate:checkNoModExisting1');
    var expectedPath = 'tests/tmp/en_US/LC_MESSAGES/messages.po';
    var expected = fs.readFileSync(expectedPath, { encoding: 'utf8' });
    var result = shell.exec('grunt abideCreate:checkNoModExisting2');
    test.ok(utils.contains('already exists', result.output));
    var actual = fs.readFileSync(expectedPath, { encoding: 'utf8' });
    // Check nothing changed.
    test.equal(expected, actual);
    // Now check the en-GB locale has been created.
    var created = 'tests/tmp/en_GB/LC_MESSAGES/messages.po';
    test.ok(grunt.file.exists(created));
    test.done();
  },

};
