var config = require('./config');
var redis = require('then-redis');

console.log('Redis client instance created');
module.exports = redis.createClient(config.redisConn);
