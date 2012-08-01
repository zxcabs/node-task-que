//Task
var utils = require('./utils'),
	tryStringify = utils.tryStringify;

//Это объект задачи
function Task(data, que) {
	data = data || {};
	
	this.que = que;	
	this.id = data.id || utils.uid();
	
	this.key = this.makeKey();
	this.expire = data.expire || Task._expire;
	this.data = data.data || null;
	this.createDate = data.createDate || Date.now();
	this.result = data.result || null;
	this.status = data.status || Task.NEW;
	this.progress = data.progress || 0;
	
	this.rclient = que.rclient;
	
};
module.exports = Task;

//константы статуса
Task.NEW = 'new';
Task.PROCESSED = 'processed';
Task.DONE = 'done';
Task.ERROR = 'error';

Task._kname = '_task:<app>:<uid>:';
Task._kregex = /<uid>/;
Task._expire = 30 * 24 * 60 * 60; //key expite 30 days

Task.makeKey = function (que, id, str) {
	str = str || Task._kname;
	return que.makeKey(str.replace(Task._kregex, id));
};

Task.findById = function (que, id, fn) {
	var client = que.rclient,
		key = Task.makeKey(que, id);

	function onHgetall(data) {
		data.data = utils.tryJson(data.data);
		fn(null, new Task(data, que));
	}
	
	function onExists() {
		client.hgetall(key, utils.ecb(fn, onHgetall));
	}
	
	client.exists(key, utils.ecb(fn, onExists));
};

Task.prototype.makeKey = function (str) {
	return Task.makeKey(this.que, this.id, str);
};

Task.prototype.toObject = function () {
	return {
		id: this.id,
		data: tryStringify(this.data),
		createDate: this.createDate, 
		status: this.status,
		result: this.result,
		progress: this.progress
	};
};

Task.prototype.set = function (property, value, fn) {
	//TODO установка ключа hset'a
	return this;
};

//done with out error
Task.prototype.done = function (result, fn) {
	this.progress = 100;
	this.status = Task.DONE;
	this.result = result;
	//TODO
	this.save(fn);
	return this;
};

//done with error
Task.prototype.error = function (error, fn) {
	this.status = Task.ERROR;
	this.result = error;
	//TODO
	this.save(fn);
	return this;
};

//progress
Task.prototype.progress = function (progress, fn) {
	this.status = Task.PROCESSED;
	this.progress = progress;
	//TODO
	this.save(fn);
	return this;
};

Task.prototype.save = function (fn) {
	var self = this,
		client = self.rclient,
		key = self.key;
	
	function onHMSET() {
		client.expire(key, self.expire, fn);
	}
	
	client.hmset(key, self.toObject(), utils.ecb(fn, onHMSET));
	
	return this;
};

Task.prototype.remove = function (fn) {
	this.rclient.del(this.key, fn);
	return this;
};