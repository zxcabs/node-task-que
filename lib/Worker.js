//Worker
var utils = require('./utils.js'),
	TaskQue = require('./TaskQue.js'),
	Task = require('./Task.js'),
	tryJson = utils.tryJson;

//Обработчик que, name, [count,] handler
function Worker(que, name, opt, handler) {
	opt = opt || {};
	
	var self = this;
	
	this.que = que;
	this.name = name;
	this.count = opt.count || 1;
	this.handler = handler;
	
	this.isBusy = false;
	
	this.rclient = que.rclient;
	this.sclient = que.sclient;
	this.pclient = que.pclient;
	
	this.sclient.subscribe(this.que.getChKey(name));
	this.sclient.on('message', this._onMessage.bind(this));
	
	//Массив тасков находящихся в обработке.
	//по завершению тасков элемент автоматически удаляется
	this.taskList = [];
	
	this._process();
};
module.exports = Worker;


Worker.prototype._onMessage = function (channel, message) {
	message = tryJson(message);

	switch (message.type) {
		case TaskQue.ADD_TASK:
			this._process();
			break;
		default:
			return this;
	};
	
	return this;
};

Worker.prototype.length = function (fn) {
	this.que.length(this.name, fn);
	return this;
};

Worker.prototype.onError = function (err) {
	console.error(this.name);
	console.error(err);
	this.isBusy = false;
};

Worker.prototype._process = function () {
	if (!this.isBusy) {
		this.isBusy = true;
		this.length(utils.ecb(this.onError, this._processCount, this));
	}
	
	return this;
};

Worker.prototype._processCount = function (count) {	

	if (count && count > 0) {
		this.que.shift(this.name, this.count, utils.ecb(this.onError, this._processShift, this));
	} else {
		this.isBusy = false;
	}
	
	return this;
};

Worker.prototype._processShift = function (ids) {
	var i, l;
	
	if (utils.isArray(ids)) {
		for (i = 0, l = ids.length; l > i; i++) {
			this._processLoadTask(ids[i]);
		}
	} else {
		this._processLoadTask(ids);
	}
};

Worker.prototype._processLoadTask = function (id) {
	Task.findById(this.que, id, utils.ecb(this.onError, this._processAddTask, this));
};

Worker.prototype._processAddTask = function (task) {
	//TODO - обернуть в функции на еррор, доне, ремове.
    //выплюнуть в хендлер
	this.taskList.push(task);	
};

Worker.prototype._processDone = function () {
	this.isBusy = false;
	this._process();
};