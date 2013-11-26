var escape = require('escape-html');
var fs = require('fs');
var nunjucks = require('nunjucks');
var path = require('path');

var rootPath = fs.realpathSync(path.join(path.resolve(__dirname, '../')));

var serialize = function serialize(ob, resourceName) {
  // Cloning the original object to avoid a scope issue.
  /*jshint camelcase: false */
  ob = JSON.parse(JSON.stringify(ob));
  ob.resource_pk = ob._id;
  ob.resource_name = resourceName;
  ob.resource_uri = '/' + resourceName + '/' + ob._id;
  delete ob._id;
  return ob;
};


module.exports = {
  escape: escape,
  markSafe: nunjucks.runtime.markSafe,
  rootPath: rootPath,
  serialize: serialize,
};
