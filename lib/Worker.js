//Worker
var Task = require('./Task'),
	slice = Array.prototype.slice,
	foo = function () {};

//Обработчик app, name, [count,] handler
function Worker() {
	var arg = slice.call(arguments);
	
	this.app = arg.shift();
	this.name = arg.shift();
	this.handler = arg.pop() || foo;
	this.count = arg.pop() || 1;
	
	this._client = redis.getClient();
	this._pclient = redis.getPubsubClient();
	this._pclient.subscribe(Que.getChKey(this._name));
	
	var self = this;
	
	this._pclient.on('message', function (channel, message) {
		if (channel === Que.getChKey(self._name) && 'add task' === message) {
			self._process();
		}
	});
	
	this._tasksCount(function (err, count) {
		if (count) {
			self._process();
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
					process.nextTick(function () { self._multipop(count, fn, rcount); });
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
	var self = this;
		
	Task.load(ids, function (err, t) {
		var isArray = Array.isArray(t);
		
		function setWorkStatus(i) {
			i.status = 'processing';
		}
		
		function onDone(err, result) {
			if (isArray) {
				t.forEach(function (i) {
					i.done(err, result);
				});
			} else {
				t.done(err, result);
			}
			
			fn(err, result);
		}
	
		if (!err && t) {
			
			if (isArray) {
				t.forEach(setWorkStatus)
			} else {
				setWorkStatus(t);
			}
			
			self._handler(err, t, onDone);
		} else {
			fn(err, t);
		}
	});
};

Worker.prototype._tasksCount = function (fn) {
	var key = Que.getKey(this._name);
	
	this._client.llen(key, fn);
};

Worker.prototype._process = function () {
	var self = this;
	
	function onPop() {
		self._tasksCount(function (err, count) {
			if (count) {
				process.nextTick(function () { self.pop(onPop) });
			} else {
				self._isBusy = false;
			}
		});
	}
	
	if (!self._isBusy) {
		self._isBusy = true;

		self.pop(onPop);
	}
};