//Que
var redis = require('./RedisClient'),
	Task = require('./Task');


//Que(name [,opt|fn, fn])
function Que() {
	this._client = redis.getClient();
    this._pubsub = redis.getPubsubClient();
};
module.exports = Que;

Que._name = '__que:<name>:';
Que._chname = '__ch:<name>:';
Que._nregex = /<name>/;

Que._keyNameCache = {};
Que._keyChNameCache = {};

Que.getKey = function (name) {
	var key = Que._keyNameCache[name];
	
	if (!key) {
		key = Que._keyNameCache[name] = Que._name.replace(Que._nregex, name.replace(/\s+/g, '_'));
	}
	
	return key;
};

Que.getChKey = function (name) {
	var key = Que._keyChNameCache[name];
	
	if (!key) {
		key = Que._keyChNameCache[name] = Que._chname.replace(Que._nregex, name);
	}
	
	return key;
};

Que.prototype.task = function (name, data, fn) {
	var self = this,
		client = this._client,
		key = Que.getKey(name),
		task = new Task(data);
	
	task.save(function (err) {
		if (err && fn) {
			fn(err, task);
		} else {
			client.rpush(key, task.id, function (err, total) {
				if (err && fn) {
					fn(err, task);
				} else {
					self._pubsub.publish(Que.getChKey(name), 'add task', function (err) {
						if (fn) fn(err, task);
					});
				}
			});
		}
	});
};

Que.prototype.end = function () {
	redis.end();
};