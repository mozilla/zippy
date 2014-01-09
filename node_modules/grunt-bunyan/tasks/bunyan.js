'use strict';

var fs = require('fs');
var spawn = require('child_process').spawn;
var _ = require('lodash');

var BLACKLIST_MARKER = '~';

module.exports = function (grunt) {
    var stdoutWrite = process.stdout.write;
    var whitelist = [];
    var blacklist = [];
    grunt.registerTask('bunyan', function () {
        var options = grunt.config('bunyan') || {};
        var args = [];

        var strict = options.strict || grunt.option('strict');
        if (strict) {
            args.push('--strict');
        }

        var level = options.level || grunt.option('level');
        if (level) {
            args.push('--level');
            args.push(level);
        }

        var output = options.output || grunt.option('output');
        if (output) {
            args.push('--output');
            args.push(output);
        }

        var names = this.args;
        if (names) {
            _.each(names, function (name) {
                if (name.indexOf(BLACKLIST_MARKER) === 0) {
                    blacklist.push('this.name === ' + JSON.stringify(name.substr(1)));
                } else {
                    whitelist.push('this.name === ' + JSON.stringify(name));
                }
            });
        }

        var whitelistCondition = _.reduce(whitelist, function (memo, condition) {
            return memo ? memo + ' || ' + condition: condition;
        });
        var blacklistCondition = _.reduce(blacklist, function (memo, condition) {
            return memo ? memo + ' || ' + condition : condition;
        });
        var condition = '(' + (whitelistCondition ? whitelistCondition : true) + ')' + 
            ' && !(' + (blacklistCondition ? blacklistCondition : false) + ')';
        args.push('--condition');
        args.push(condition);

        var path = './node_modules/bunyan/bin/bunyan';
        if (!fs.existsSync(path)) {
            throw new Error('bundle binary not found');
        }

        var child = spawn(path, args, {
            stdio: ['pipe', process.stdout, process.stderr]
        });
        process.stdout.write = function () {
            child.stdin.write.apply(child.stdin, arguments);
        };
    });
};