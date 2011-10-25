var Que = require('../').Que,
	Task = require('../').Task;

var que = new Que('test', function (err, result) {
	if (err) {
		console.log('err: %s', err);
		que.end();
	} else {
		que.push(new Task(), function (err) {
			console.log('Push task to que. Error: %s', err);
			que.end();
		});
	}
});