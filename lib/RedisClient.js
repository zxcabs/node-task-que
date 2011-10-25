//Singelton for redis
var redis = require('redis');

var RedisClient = function(port, host, opt) {
	if (!RedisClient.prototype.client) {
		RedisClient.prototype.client = redis.createClient(port, host, opt);
	}
	
	return RedisClient.prototype.client;
};
module.exports = RedisClient;

RedisClient.getInstance = function (port, host, opt) {
	return new RedisClient(port, host, opt);
};

RedisClient.prototype.client;