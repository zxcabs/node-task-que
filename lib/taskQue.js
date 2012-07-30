/*
 * TaskQue - рулит очередями и соединениями
 */
 
var redis = require('redis'),
	Que = require('./que.js'),
	Worker = require('./worker.js');

function TaskQue(name, opt) {
	opt = opt || {};
	
	this.name = name;
	this.prefix = opt.prefix || this.name;
	this.redisConfig = opt.redisConfig || {};
	
	//клиент для обычных запросов к редису
	this.rclient = null;
	
	//клиент для подписи на события
	this.sclient = null;
	
	//клиент для публикации событий
	this.pclient = null;
}


TaskQue.prototype._createRedisClient = function () {
	var config = this.redisConfig,
		client = redis.createClient(config.port, config.host, config.options);
		
	//TODO обработка ошибок
	return client;
};

TaskQue.prototype.createQue = function () {
	if (!this.rclient) {
		this.rclient = this._createRedisClient();
	}
	
	if (!this.sclient) {
		this.sclient = this._createRedisClient();
	}
	
	return new Que(this);
};

TaskQue.prototype.createWorker = function (opt, handler) {
	if (!this.rclient) {
		this.rclient = this._createRedisClient();
	}
	
	if (!this.sclient) {
		this.sclient = this._createRedisClient();
	}
	
	if (!this.pclient) {
		this.pclient = this._createRedisClient();
	}
	
	return new Worker(this, opt, handler);
};