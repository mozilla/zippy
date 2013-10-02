var bunyan = require('bunyan');
var fs = require('fs');
var restify = require('restify');

var zippy = require('../lib');

var CLIENT;
var SERVER;
var SOCK = '.zippy_sock';

function randomUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

module.exports = {
    setUp: function (cb) {
        var log = bunyan.createLogger({
            name: 'zippy_unit_test',
            level: process.env.LOG_LEVEL || 'info',
            serializers: restify.bunyan.serializers,
            stream: process.stdout,
        });

        // TODO(davidbgk): find an easy way to launch tests against
        // an external provider.
        SERVER = zippy.createServer({
            log: log.child({component: 'server'}, true),
            noAudit: true,
        });

        SERVER.listen(SOCK, function () {
            CLIENT = zippy.createClient({
                log: log.child({component: 'client'}, true),
                socketPath: SOCK,
            });
            cb();
        });
    },

    tearDown: function (cb) {
        SERVER.once('close', function () {
            fs.unlink(SOCK, function (err) {
                cb();
            });
        });
        SERVER.close();
    },

    listEmpty: function (t) {
        CLIENT.retrieveSellers(function (err, sellers) {
            t.ifError(err);
            t.ok(sellers);
            t.ok(Array.isArray(sellers));
            if (sellers)
                t.equal(sellers.length, 0);
            t.done();
        });
    },

    create: function (t) {
        var uuid = randomUUID();
        CLIENT.createSeller(uuid, function (err, seller) {
            t.ifError(err);
            t.ok(seller);
            if (seller) {
                t.ok(seller.resource_pk);
                t.equal(seller.uuid, uuid);
            }
            t.done();
        });
    },

    listAndGet: function (t) {
        CLIENT.retrieveSellers(function (err, sellers) {
            t.ifError(err);
            t.ok(sellers);
            t.ok(Array.isArray(sellers));
            t.equal(sellers.length, 1);
            CLIENT.retrieveSeller(sellers[0].uuid, function (err2, seller) {
                t.ifError(err2);
                t.ok(seller);
                t.done();
            });
        });
    },

    createEmpty: function (t) {
        // TODO(davidbgk): this test doesn't pass, I need to figure out
        // why the restify error "has no method 'cause'".
        t.throws(
            function () {
                CLIENT.createSeller(undefined, function (err, seller) {
                    t.ifError(err);
                });
            },
            restify.InvalidArgumentError,
            'UUID must be supplied.'
        );
        t.done();
    }

};
