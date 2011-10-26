//Worker
var redis = require('./RedisClient'),
	Que = require('./Que');

function Worker(name, c, h) {
	
	this._isBusy = true;
	
	switch (arguments.length) {
		case 3:
			this._name = name;
			this._count = c;
			this._handler = h;
			break;
		case 2:
			this._name = name;
			this._count = 1;
			this._handler = c;
			break;
		default:
			return null;
	}
	
	this._client = redis.getClient();
	this._pclient = redis.createClient();
	this._pclient.subscribe(Que.getChKey(this._name));
	
	var self = this;
	
	this._pclient.on('message', function (channel, message) {
		if (channel === Que.getChKey(self._name) && 'add task' === message && !self._isBusy) {
			self._process();
		}
	});
	
	this._tasksCount(function (err, count) {
		if (count) {
			self._process();
		} else {
			self._isBusy = false;
		}
	});
};
module.exports = Worker;

Worker.prototype.pop = function (c, f) {
	var count, fn;
	
	if (arguments.length === 2) {
		count = c;
		fn = f;
	} else {
		count = this._count;
		fn = c;
	}
	
	if (count > 1) {
		this._multipop(count, fn);
	} else {
		this._lpop(fn);
	}
};

Worker.prototype._multipop = function (count, fn, rc) {
	var self = this,
		client = this._client,
		key = Que.getKey(this._name),
		rcount = 1 + (rc || 0);

	if (rcount > 10) {
		fn('Retry count!');
	} else {
		client.multi()
			.lrange(key, 0, count - 1)
			.ltrim(key, count, -1)
			.exec(function (err, replies) {
				var ids;
				
				if (err) {
					self._multipop(count, fn, rcount);
				} else {
					ids = replies[0];
					
					if (ids.length) {
						self._getTask.call(self, null, ids, fn);
					} else {
						fn();
					}
				}
			});
	}
};

Worker.prototype._lpop = function (fn) {
	var self = this,
		client = this._client,
		key = Que.getKey(this._name);
	
	client.lpop(key, function () { 
		var args = Array.prototype.slice.call(arguments); 
		args.push(fn);
		self._getTask.apply(self, args);
	});
};

Worker.prototype._getTask = function (err, ids, fn) {
	this._handler(err, ids, fn);
};

Worker.prototype._tasksCount = function (fn) {
	var key = Que.getKey(this._name);
	
	this._client.llen(key, fn);
};

Worker.prototype._process = function () {
	var self = this;

	self._isBusy = true;
	self.pop(function () {
		self._isBusy = false;
	});
};