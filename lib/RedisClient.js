var redis = require('redis'),
	MAX_CLIENT = 2,
	pool = [],
	rnd = function (n) {
		return (Math.random() * n | 0);
	};

module.exports.MAX_CLIENT = MAX_CLIENT;
module.exports.pool = pool;

module.exports.getClient = function () {
	var client;
	
	if (pool.length < MAX_CLIENT) {
		client = redis.createClient();
		pool.push(client);
	} else {
		client = pool[rnd(MAX_CLIENT)];
	}
	
	return client;
};