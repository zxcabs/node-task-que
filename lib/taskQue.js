/*
 * TaskQue - рулит очередями и соединениями
 */
 
var redis = require('redis'),
	Task = require('./Task.js'),
	foo = function () {};

function TaskQue(name, opt) {
	opt = opt || {};
	
	this.name = name;
	this.prefix = opt.prefix || this.name;
	this.redisConfig = opt.redisConfig || {};
	
	this.chkey = this.makeKey();
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
	return '{ "name": "' + name + '", "msq": "' + TaskQue.ADD_TASK + '", "taskId": "' + task.id + '"}';
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
	var keys = this._keysCache;
		key = keys[name];
	
	if (!key) {
		key = this.makeKey(keyStr, TaskQue._namereg, name);
		keys[name] = key;
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
	var task = new Task(obj, this);
	
	task.save();
	this.push(name, task);
	
	return task;
};

TaskQue.prototype.process = function (name, opt, handler) {
	//return new Worker(this, name, opt, handler);
};


//Добавляем task в очередь
TaskQue.prototype.push = function (name, task, fn) {
	fn = fn || foo;
	
	var pclient = this.pclient,
		qukey = this.getQuKey(name),
		chkey = this.getChKey(name);
	
	this.rclient.lpush(qukey, task.id, function (err) {
		if (err) return fn(err);
		pclient.publish(chkey, TaskQue.ADD_TASK_MSG(name, task), fn);
	});
};