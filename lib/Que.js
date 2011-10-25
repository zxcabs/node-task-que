//Que
var RedisClient = require('./RedisClient'),
	Task = require('./Task');


//Que(name [,opt|fn, fn])
function Que(n, o, c) {
	var fn, opt, self = this;
	
	this._name = Que._name.replace(/<name>/, n);
	this._client;
	
	switch (arguments.length) {
		case 2:
			if ('function' === typeof o) {
				fn = o;
			} else {
				opt = o;
			}
			break;
		case 3: 
			opt = o;
			fn = c;
			break;
	}
	
	fn = fn || function () {};
	
	if (opt) {
		this._client = new RedisClient(opt.port, opt.host, opt.options);
	} else {
		this._client = new RedisClient();
	}
	
	this._client.on('ready', function () {
		
		//проверяем тип ключа
		function onCheckType(err, type) {
			if (type === Que._keyType && !err) {
				fn();
			} else {
				fn((err || 'Key exists, but type not match'));
			}
		}
		
		//проверяем существование ключа
		function onExists(err, exists) {
			if (exists &&  !err) {
				self._client.type(self._name, onCheckType);
			} else {
				//если ключ ненайден то с ним можно работать, редис автоматически его создаст
				fn(err);
			}
		}

		self._client.exists(self._name, onExists);
	});
};
module.exports = Que;

Que._name = '__que:<name>:';
Que._keyType = 'list';

Que.prototype.__defineGetter__('connected', function () {
	return this._client.connected;
});

Que.prototype.end = function () {
	this._client.end();
};

Que.prototype.push = function (task, fn) {
	var fn = fn || function () {};
	
	if (task instanceof Task) {
		this._client.lpush(this._name, task.id, fn);
	} else {
		fn('task must have Task type');
	}
};