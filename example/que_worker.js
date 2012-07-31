var TaskQue = require('../lib/TaskQue.js');

var que1 = new TaskQue('app1');


setTimeout(function () {
	console.log('push to que');
	debugger;
	que1.task('email', { address: 'da2@da.ru' });
	que1.task('email', { address: 'da3@da.ru' });
	que1.task('email', { address: 'da4@da.ru' });
	que1.task('email', { address: 'da5@da.ru' });
	que1.task('email', { address: 'da6@da.ru' });
	que1.task('email', { address: 'da7@da.ru' });
	que1.task('email', { address: 'da8@da.ru' });
	que1.task('email', { address: 'da9@da.ru' });
	que1.task('pdf', { address: 'pdf1' });
	que1.task('pdf', { address: 'pdf2' });
	que1.task('pdf', { address: 'pdf3' });
	que1.task('pdf', { address: 'pdf4' });
	que1.task('pdf', { address: 'pdf5' });
	que1.task('pdf', { address: 'pdf6' });
	que1.task('pdf', { address: 'pdf7' });
	que1.task('email', { address: 'da@da.ru' }, function (err, task) {
		console.log('Add task: %s, error: %s', task, err);
		que1.end();
	});
}, 3000);


function emailHandler(task, done) {
	console.log('Email: ' + task.data.address);
	done();
}

function pdfHandler(tasks, done) {
	console.log('PDFs: ' + tasks.length);
	done();
}

que1.process('email', emailHandler);
que1.process('pdf', 2, pdfHandler);