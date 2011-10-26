//Task
var RedisClient = require('./RedisClient'),
	utils = require('./utils');

function Task(obj) {
	this.id = utils.uid();
	this.data = obj;
	this._kname = Task._kname.replace(/<uid>/, this.id);
	
	this._client = RedisClient.getClient();
};
module.exports = Task;

Task._kname = '__task:<uid>:';