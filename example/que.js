var Que = require('../').Que,
	Task = require('../').Task;

var que = new Que();

que.task('email', { address: 'da2@da.ru' });
que.task('email', { address: 'da3@da.ru' });
que.task('email', { address: 'da4@da.ru' });
que.task('email', { address: 'da5@da.ru' });
que.task('email', { address: 'da6@da.ru' });
que.task('email', { address: 'da7@da.ru' });
que.task('email', { address: 'da8@da.ru' });
que.task('email', { address: 'da9@da.ru' });
que.task('pdf', { address: 'pdf1' });
que.task('pdf', { address: 'pdf2' });
que.task('pdf', { address: 'pdf3' });
que.task('pdf', { address: 'pdf4' });
que.task('pdf', { address: 'pdf5' });
que.task('pdf', { address: 'pdf6' });
que.task('email', { address: 'da@da.ru' }, function (err, task) {
	console.log('Add task: %s, error: %s', task, err);
	que.end();
});