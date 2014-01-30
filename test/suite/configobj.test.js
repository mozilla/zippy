
var Config = require('../../lib/configobj');
var oldEnv = process.env.NODE_ENV;


var exampleConfig = new Config({
  default: {
    foo: 'default-foo',
    bar: 'default-bar',
    baz: 'local-baz'
  },
  local: {
    baz: 'local-baz',
    bar: 'local-bar',
  },
  prod: {
    bar: 'prod-bar',
  },
  test: {
    bar: 'test-bar',
    baz: 'local-baz',
  },
});

exports.tearDown = function (callback) {
  process.env.NODE_ENV = oldEnv;
  callback();
};

exports.testNoDefault = function(t) {
  t.throws(function() {
    var noDefaultConfig = new Config({});
    // Trigger the getter;
    noDefaultConfig.foo;
  }, Error);
  t.done();
};

exports.testPointlessEnv = function(t) {
  process.env.NODE_ENV = 'local';
  t.throws(function() {
    // Trigger the getter;
    exampleConfig.bar;
  }, Error);
  t.done();
};

exports.testLocalNotUsedTestEnv = function(t) {
  process.env.NODE_ENV = 'test';
  t.equal(exampleConfig.bar, 'test-bar');
  t.done();
};

exports.testLocalEnv = function(t) {
  process.env.NODE_ENV = '';
  t.equal(exampleConfig.bar, 'local-bar');
  t.done();
};

exports.testDefaultFallThrough = function(t) {
  process.env.NODE_ENV = 'prod';
  t.equal(exampleConfig.foo, 'default-foo');
  t.done();
};

exports.testDoesntExist = function(t) {
  process.env.NODE_ENV = 'prod';
  t.equal(exampleConfig.whatever, undefined);
  t.done();
};
