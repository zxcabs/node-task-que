/*
 * TaskQue - рулит очередями и соединениями
 */
 
var redis = require('redis'),
	Task = require('./Task.js'),
	utils = require('./utils.js'),
	Worker = require('./Worker.js');

function TaskQue(name, opt) {
	opt = opt || {};
	
	this.name = name;
	this.prefix = opt.prefix || this.name;
	this.redisConfig = opt.redisConfig || {};
	
	this.chkey = this.makeKey(TaskQue._chkey);
	this.qukey = this.makeKey(TaskQue._qukey);
	
	//клиент для обычных запросов к редису
	this.rclient = this._createRedisClient();
	
	//клиент для подписи на события
	this.sclient = this._createRedisClient();
	
	//клиент для публикации событий
	this.pclient = this._createRedisClient();
	
	this._keysCache = {};
}

module.exports = TaskQue;

//list key
TaskQue._qukey = '_qu:<app>:<name>:';
TaskQue._chkey = '_ch:<app>:<name>:';
TaskQue._chreg = /<app>/;
TaskQue._namereg = /<name>/;

//константы для сообщений
TaskQue.ADD_TASK = 'ADD_TASK';

//функции для формирования сообщений
TaskQue.ADD_TASK_MSG = function (name, task) {
	return '{ "name": "' + name + '", "type": "' + TaskQue.ADD_TASK + '", "taskId": "' + task.id + '"}';
};


//Возвращаем функции публикаторы сообщений
TaskQue.prototype.ADD_TASK = function (name, task, fn) {
	var self = this,
		pclient = self.pclient,
		chkey = self.getChKey(name);
		
	return function () {
		pclient.publish(chkey, TaskQue.ADD_TASK_MSG(name, task), fn);
	};
};

TaskQue.prototype.makeKey = function (str, reg, val) {
	str = str || TaskQue._chkey;
	reg = reg || TaskQue._chreg;
	val = (val || this.prefix).replace(/\s/g, '');
	
	return str.replace(reg, val);
};

TaskQue.prototype._createRedisClient = function () {
	var config = this.redisConfig,
		client = redis.createClient(config.port, config.host, config.options);
		
	//TODO обработка ошибок
	return client;
};

TaskQue.prototype._getKey = function (keyStr, name) {
	var keys = this._keysCache,
		i = keyStr + name,
		key = keys[i];
	
	if (!key) {
		key = this.makeKey(keyStr, TaskQue._namereg, name);
		keys[i] = key;
	}
	
	return key;
};

TaskQue.prototype.getChKey = function (name) {
	return this._getKey(this.chkey, name);
};

TaskQue.prototype.getQuKey = function (name) {
	return this._getKey(this.qukey, name);
};

TaskQue.prototype.task = function (name, obj) {
	var self = this,
		task = new Task({ data: obj }, self),
		originalSave = task.save;
		
	//Перехватываем оригинальный Task.save
	function save(fn) {
		task.save = originalSave;
		
		function onSave() {
			self.push(name, task, fn);
		}
		
		return task.save(utils.ecb(fn, onSave));
	}

	task.save = save;
	
	return task;
};

//навешиваем обработчики
//name, [opt,] handler
TaskQue.prototype.process = function () {
	var args = utils.argumentsToArray(arguments),
		name = args.shift(),
		handler = args.pop(),
		opt = args.pop();

	return new Worker(this, name, opt, handler);
};


//Добавляем task в очередь
TaskQue.prototype.push = function (name, task, fn) {
	this.rclient.rpush(this.getQuKey(name), task.id, utils.ecb(fn, this.ADD_TASK(name, task, fn)));
	return this;
};

//извлекаем task из очереди с головы
//name, [count,] fn
TaskQue.prototype.shift = function () {
	var self = this,
		args = utils.argumentsToArray(arguments),
		name = args.shift(),
		fn = args.pop(),
		count = args.pop();

	if (count > 1) {
		self._multishift(name, count, fn);
	} else {
		self._shift(name, fn);
	}
	
	return self;
};

//Извлекаем count позиций из очереди
TaskQue.prototype._multishift = function (name, count, fn) {
	fn = fn || utils.foo;
	
	var self = this,
		key = self.getQuKey(name),
		client = self.rclient;
	
	(function exec(retryCount, err) {
		if (retryCount > 10) {
			fn(new Error('Maximum retry count!\n' + err));
		} else {
			client.multi()
				.lrange(key, 0, count - 1)
				.ltrim(key, count, -1)
				.exec(function (err, replies) {
					if (err) {
						//try again!
						exec(retryCount + 1, err);
					} else {
						fn(null, replies[0]);
					}
				});
		}
	}(0));
	
	return this;
};

//Извлекаем первую позицию из очереди
TaskQue.prototype._shift = function (name, fn) {
	this.rclient.lpop(this.getQuKey(name), fn);
	return this;
};


//Длина очереди
TaskQue.prototype.length = function (name, fn) {
	this.rclient.llen(this.getQuKey(name), fn);
	return this;
};

TaskQue.prototype.end = function (fn) {
	fn = fn || utils.foo;
	//TODO
	
	this.rclient.end();
	this.sclient.end();
	this.pclient.end();
	
	fn();
};

TaskQue.prototype.quit = function (fn) {
	fn = fn || utils.foo;
	//TODO
	
	this.rclient.quit();
	this.sclient.quit();
	this.pclient.quit();
	
	fn();
};