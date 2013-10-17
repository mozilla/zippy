var assert = require('assert-plus');
var test = require('../');

var CLIENT = test.CLIENT;
var SERVER = test.SERVER;

function randomUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

module.exports = {
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
        t.throws(
            function () {
                CLIENT.createSeller(undefined, function (err, seller) {
                    t.ifError(err);
                });
            },
            assert.AssertionError
        );
        t.done();
    }

};
