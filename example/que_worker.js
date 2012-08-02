var TaskQue = require('../lib/TaskQue.js');

var que1 = new TaskQue('app1');


setTimeout(function () {
	console.log('push to que');
	que1.task('email', { address: 'da2@da.ru' }).save();
	que1.task('email', { address: 'da3@da.ru' }).save();
	que1.task('email', { address: 'da4@da.ru' }).save();
	que1.task('email', { address: 'da5@da.ru' }).save();
	que1.task('email', { address: 'da6@da.ru' }).save();
	que1.task('email', { address: 'da7@da.ru' }).save();
	que1.task('email', { address: 'da8@da.ru' }).save();
	que1.task('email', { address: 'da9@da.ru' }).save();
	que1.task('pdf', { name: 'pdf1' }).save();
	que1.task('pdf', { name: 'pdf2' }).save();
	que1.task('pdf', { name: 'pdf3' }).save();
	que1.task('pdf', { name: 'pdf4' }).save();
	que1.task('pdf', { name: 'pdf5' }).save();
	que1.task('pdf', { name: 'pdf6' }).save();
	que1.task('pdf', { name: 'pdf7' }).save();
	que1.task('email', { address: 'da@da.ru' }).save();
}, 3000);


function emailHandler(task) {
	console.log('get email: ' + task.data.address);
	
	debugger;
	setTimeout(function () {
		task.done(function (err) {
			console.log('done email: %s - error: %s', task.data.address, err);
		});
	}, 500);
}

function pdfHandler(tasks) {
	var l = tasks.length;
	
	console.log('PDFs: ' + l);
		
	(function next(i) {
		if (l > i) {
			console.log('Get PDF: %s', tasks[i].data.name);
			
			setTimeout(function () {
				tasks[i].done(function (err) {
					console.log('Done PDF: %s', tasks[i].data.name);
					next(++i);
				});
			}, 1000);
		}
	}(0));
}

que1.process('email', emailHandler);
que1.process('pdf', { count: 2 }, pdfHandler);