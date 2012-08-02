var TaskQue = require('../lib/TaskQue.js');

var que1 = new TaskQue('app1');
var que2 = new TaskQue('app2');

que1.task('email', { address: 'da2@da.ru' }).save();
que1.task('email', { address: 'da3@da.ru' }).save();
que1.task('email', { address: 'da4@da.ru' }).save();
que1.task('email', { address: 'da5@da.ru' }).save();
que2.task('email', { address: 'da6@da.ru' }).save();
que2.task('email', { address: 'da7@da.ru' }).save();
que2.task('email', { address: 'da8@da.ru' }).save();
que2.task('email', { address: 'da9@da.ru' }).save();
que1.task('pdf', { name: 'pdf1' }).save();
que1.task('pdf', { name: 'pdf2' }).save();
que1.task('pdf', { name: 'pdf3' }).save();
que2.task('pdf', { name: 'pdf4' }).save();
que2.task('pdf', { name: 'pdf5' }).save();
que2.task('pdf', { name: 'pdf6' }).save();
var task = que2.task('email', { address: 'da@da.ru' }).save(function (err) {
	console.log('Add task: %s, error: %s', task.id, err);
	que1.end();
	que2.end();
});