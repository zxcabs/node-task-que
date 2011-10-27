//Task
var redis = require('./RedisClient'),
	utils = require('./utils');

function Task(i, d) {
	if (arguments.length === 2) {
		this._id = i;
		this._data = JSON.parse(d.data);
		this._createDate = d.createDate;
		this._status = d.status;
	} else {
		this._id = utils.uid();
		this._createDate = Date.now();
		this._data = i;
		this._status = 'new';
	}
};
module.exports = Task;

Task._kname = '__task:<uid>:';
Task._kregex = /<uid>/;
Task._expire = 30 * 24 * 60 * 60; //key expite 30 days

Task.getKey = function (id) {
	return Task._kname.replace(Task._kregex, id);
};

Task.load = function(id, fn) {
	var client = redis.getClient(),
		task;
	
	if (Array.isArray(id)) {
		//
	} else {
		Task.findById(id, fn);
	}
}

Task.findById = function (id, fn) {
	var client = redis.getClient();
	
	client.hgetall(Task.getKey(id), function (err, data) {
		if (!err && data) {
			fn(null, new Task(id, data));
		} else {
			fn(err);
		}
	});
}

Task.prototype.__defineGetter__('id', function () {
	return this._id;
});

Task.prototype.__defineGetter__('createDate', function () {
	return this._createDate;
});

Task.prototype.__defineGetter__('key', function () {
	return Task.getKey(this.id);
});

Task.prototype.__defineGetter__('status', function () {
	return this._status;
});

Task.prototype.__defineGetter__('expire', function () {
	return (this._expire || Task._expire);
});

Task.prototype.__defineSetter__('expire', function (ex) {
	this._expire = ((ex | 0) > 0) ? ex : Task._expire;
});

Task.prototype.__defineGetter__('client', redis.getClient);

Task.prototype.__defineGetter__('data', function () {
	return this._data;
});

Task.prototype.toObject = function () {
	return {
		data: JSON.stringify(this.data),
		createDate: this.createDate, 
		status: this.status
	};
};

Task.prototype.save = function (fn) {
	var self = this;
		
	this.client.hmset(this.key, this.toObject(), function (err) {
		if (err) {
			fn(err);
		} else {
			self.client.expire(self.key, self.expire, fn);
		}
	});
};

Task.prototype.remove = function (fn) {
	this.client.del(this.key, fn);
};