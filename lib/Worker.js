//Worker
var Task = require('./Task'),
	foo = function () {};

//Обработчик que, name, [count,] handler
function Worker(que, name, opt, handler) {
	opt = opt || {};
	
	var self = this;
	
	this.que = que;
	this.name = name;
	this.count = opt.count || 1;
	this.handler = handler;
	
	this.rclient = que.rclient;
	this.sclient = que.sclient;
	this.pclient = que.pclient;
	
	//TODO
	this.sclient.subscribe();
	this.sclient.on('message', this._onMessage.bind(this));
	
	this._process();
};
module.exports = Worker;


Worker.prototype._onMessage = function (channel, message) {
	//TODO
};
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

Worker.prototype.length = function (fn) {
	this.que.length(this.name, fn);
	return this;
};

Worker.prototype._process = function () {
	//TODO
	return this;
};