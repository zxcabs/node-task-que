//Task
var utils = require('./utils'),
	async = require('async');

function tryJSON (json) {
	try {
		return JSON.parse(json);
	} catch (e) {
		return json;
	}
}

function tryStringify(obj) {
	try {
		return JSON.stringify(obj);
	} catch (e) {
		return obj;
	}
}

//Это объект задачи
function Task(data, app) {
	data = data || {};
	
	this.app = app;	
	this.id = data.id || utils.uid();
	
	this.key = this.makeKey();
	this.expire = data.expire || Task._expire;
	this.data = data.data || null;
	this.createDate = data.createDate || Date.now();
	this.result = data.result || null;
	this.status = data.status || Task.NEW;
	this.progress = data.progress || 0;
	
	this.rclient = app.rclient;
	
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

Task.prototype.makeKey = function (str) {
	str = str || Task._kname;
	return this.app.makeKey(str.replace(Task._kregex, this.id));
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
};

//done with out error
Task.prototype.done = function (result, fn) {
	this.progress = 100;
	this.status = Task.DONE;
	this.result = result;
	//TODO
};

//done with error
Task.prototype.error = function (error, fn) {
	this.status = Task.ERROR;
	this.result = error;
	//TODO
};

//progress
Task.prototype.progress = function (progress, fn) {
	this.status = Task.PROCESSED;
	this.progress = progress;
	//TODO
};

Task.prototype.save = function (fn) {
	var self = this;
	self.rclient.hmset(self.key, self.toObject(), fn);
};

Task.prototype.remove = function (fn) {
	//TODO удаление записи
	fn();
};