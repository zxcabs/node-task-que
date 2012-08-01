//Worker
var utils = require('./utils.js');

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