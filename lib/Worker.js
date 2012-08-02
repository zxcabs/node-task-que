//Worker
var utils = require('./utils.js'),
	TaskQue = null, //cross-require: https://gist.github.com/3236500
	Task = require('./Task.js'),
	tryJson = utils.tryJson;

function lazyLoad() {
	if (!TaskQue) {
		TaskQue = require('./TaskQue.js');
	}
}
	
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
	
	//Отложенно зегружаем модули с рекурсивными ссылками друг на друга
	lazyLoad();
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
	var self = this,
		l;
	
	function onLoad() {
		if (self.count === 1) {
			self.handler(self.taskList[0]);
		} else {
			self.handler(utils.cloneArray(self.taskList));
		}
	}
	
	if (utils.isArray(ids)) {
		l = ids.length;
		
		(function next(i) {
			if (l > i) {
				self._processLoadTask(ids[i], function () {
					next(++i);
				});
			} else {
				onLoad();
			}
		}(0))
	} else {
		self._processLoadTask(ids, onLoad);
	}
};

Worker.prototype._processLoadTask = function (id, fn) {

	function onFind(task) {
		this._processAddTask(task);
		fn();
	}
	
	Task.findById(this.que, id, utils.ecb(this.onError, onFind, this));
};

//возвращаем обработчик который будет вызван после обработчика таска
function afterTaskCb(worker, task, originalCb) {
	originalCb = originalCb || utils.foo;
	
	var list = worker.taskList;
	
	return function () {
		var index = list.indexOf(task);
		
		//вызываем оригинальный обработчик который был передан
		originalCb.apply(task, arguments);
		
		if (index > -1) {
			list.splice(index, 1);
		}
		//Если очередь пуста завершаем
		if (list.length === 0) {
			worker._processDone();
		}
	};
}

//Магический метод перехватываем управление методов таска.
function beforeTask(name, worker, task) {
	var original = task[name];
	
	task[name] = function () {
		task[name] = original;
		
		var arg = utils.argumentsToArray(arguments),
			al = arg.length,
			argLast = arg[al - 1];
		
		//Если последний аргумент функция
		//то заменяем его своей функцией
		if (utils.isFunction(argLast)) {
			arg[al - 1] = afterTaskCb(worker, task, argLast);
		} else {
			arg.push(afterTaskCb(worker, task));
		}
		
		original.apply(task, arg);
	};
}

Worker.prototype._processAddTask = function (task, fn) {
	
	beforeTask('done', this, task);
	beforeTask('error', this, task);
	beforeTask('remove', this, task);
		
	this.taskList.push(task);
};

Worker.prototype._processDone = function () {
	this.isBusy = false;
	this._process();
};