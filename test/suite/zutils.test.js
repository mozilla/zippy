var assert = require('nodeunit').assert;
require('../../lib/zutil');


exports.testDateCloseTo = function(t) {

  var dateOne = new Date(77, 7, 7, 7, 7, 7, 7);
  var dateTwo = new Date(77, 7, 7, 7, 7, 7, 7);

  t.expect(10);
  t.doesNotThrow(function(){ assert.dateCloseTo(dateOne, dateTwo); }, t.assertionError);
  // Add ten seconds to dateTwo.
  dateTwo.setSeconds(dateTwo.getSeconds() + 10);
  t.throws(function() { assert.dateCloseTo(dateOne, dateTwo, 1000); }, t.assertionError);
  t.doesNotThrow(function() { assert.dateCloseTo(dateOne, dateTwo, 10000); }, t.assertionError);
  // Minus ten seconds to dateTwo.
  dateTwo.setSeconds(dateTwo.getSeconds() - 20);
  t.throws(function(){ assert.dateCloseTo(dateOne, dateTwo, 1000); }, t.assertionError);
  t.doesNotThrow(function(){ assert.dateCloseTo(dateOne, dateTwo, 10000); }, t.assertionError);

  t.throws(function(){ assert.dateCloseTo(dateOne, 'whatevs'); }, t.assertionError);
  t.throws(function(){ assert.dateCloseTo('whatevs', dateTwo); }, t.assertionError);

  var date1 = Date('Fri Jan 24 2014 11:40:15 GMT+0000 (UTC)');
  var date2 = new Date('Fri Jan 24 2014 11:40:15 GMT+0000 (UTC)');
  t.doesNotThrow(function(){
    try {
      assert.dateCloseTo(date1, date2);
    } catch(e) {
      if (!e instanceof assert.AssertionError) {
        throw e;
      }
    }
  } , TypeError);
  t.throws(function(){ assert.dateCloseTo(date1, date2); }, t.assertionError);
  t.doesNotThrow(function(){ assert.dateCloseTo(date2, date2); }, t.assertionError);
  t.done();
};

