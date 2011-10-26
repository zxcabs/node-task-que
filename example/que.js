var Que = require('../').Que,
	Task = require('../').Task;

var que = new Que();

que.task('email', { address: 'da2@da.ru' });
que.task('email', { address: 'da3@da.ru' });
que.task('email', { address: 'da4@da.ru' });
que.task('email', { address: 'da5@da.ru' });
que.task('pdf', { address: 'bla bla bla' });
que.task('email', { address: 'da@da.ru' }, function (err, task) {
	console.log('Add task: %s, error: %s', task, err);
	que.end();
});