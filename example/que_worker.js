var TaskQue = require('../lib/TaskQue.js');

var que1 = new TaskQue('app1');


setTimeout(function () {
	console.log('push to que');
	var t, t0;
	
	debugger;
	t0 = que1.task('email', { address: 'da2@da.ru' }).save();
	que1.task('email', { address: 'da3@da.ru' }).save();
	que1.task('email', { address: 'da4@da.ru' }).save();
	que1.task('email', { address: 'da5@da.ru' }).save();
	que1.task('email', { address: 'da6@da.ru' }).save();
	que1.task('email', { address: 'da7@da.ru' }).save();
	que1.task('email', { address: 'da8@da.ru' }).save();
	que1.task('email', { address: 'da9@da.ru' }).save();
	que1.task('pdf', { address: 'pdf1' }).save();
	que1.task('pdf', { address: 'pdf2' }).save();
	que1.task('pdf', { address: 'pdf3' }).save();
	que1.task('pdf', { address: 'pdf4' }).save();
	que1.task('pdf', { address: 'pdf5' }).save();
	que1.task('pdf', { address: 'pdf6' }).save();
	que1.task('pdf', { address: 'pdf7' }).save();
	t = que1.task('email', { address: 'da@da.ru' }).save(function (err) {
		console.log('Add task: %s, error: %s', t.id, err);
		t0.done('nice mail!');
		t.remove(function (err) {
			console.log('remove task: %s, error: %s', t.id, err);
			que1.quit();
		});
	});
}, 3000);


function emailHandler(task) {
	console.log('Email: ' + task.data.address);
	task.done();
}

function pdfHandler(tasks) {
	var i = 0, l = tasks.length;
	
	console.log('PDFs: ' + l);
		
	(function next(i) {
		if (l > i) {
			tasks[i].done();
			next(i++);
		}
	}(i));
}

que1.process('email', emailHandler);
que1.process('pdf', 2, pdfHandler);