var config = require('./config');
var redis = require('then-redis');

module.exports = redis.createClient(config.redisConn);
