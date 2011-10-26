//Task
var redis = require('./RedisClient'),
	utils = require('./utils');

function Task(data) {
	this._id = utils.uid();
	this._createDate = Date.now();
	this.data = data;
	this._key = Task._kname.replace(/<uid>/, this.id);
	this._status = 'new';
};
module.exports = Task;

Task._kname = '__task:<uid>:';
Task._expire = 24 * 60 * 60 * 1000; //key expite 24 hours

Task.prototype.__defineGetter__('id', function () {
	return this._id;
});

Task.prototype.__defineGetter__('createDate', function () {
	return this._createDate;
});

Task.prototype.__defineGetter__('key', function () {
	return this._key;
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