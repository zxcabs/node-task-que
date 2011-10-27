var redis = require('redis'),
    client,
    pubsubClient;

module.exports.getClient = function () {
	if (!client) {
		client = redis.createClient();
	}	
	return client;
};

module.exports.getPubsubClient = function () {
	if (!pubsubClient) {
		pubsubClient = redis.createClient();
	}	
	return pubsubClient;
};

module.exports.end = function () {
    if (client) client.end();
    if (pubsubClient) pubsubClient.end();
};

module.exports.createClient = redis.createClient;