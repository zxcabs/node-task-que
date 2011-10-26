//Que
var redis = require('./RedisClient'),
	Task = require('./Task');


//Que(name [,opt|fn, fn])
function Que() {
};
module.exports = Que;

Que._name = '__que:<name>:';
Que._keyType = 'list';
Que._keyNameCache = {};

Que.prototype.__defineGetter__('connected', function () {
	return this._client.connected;
});

Que.prototype.getKey = function (name) {
	var key = Que._keyNameCache[name];
	
	if (!key) {
		key = Que._keyNameCache[name] = Que._name.replace(/<name>/, name.replace(/\s+/g, '_'));
	}
	
	return key;
};

Que.prototype.push = function (task, fn) {
	var fn = fn || function () {};
	
	if (task instanceof Task) {
		this._client.lpush(this._name, task.id, fn);
	} else {
		fn('task must have Task type');
	}
};