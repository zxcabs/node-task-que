var TaskQue = require('../lib/TaskQue.js');

var que1 = new TaskQue('app1');

function emailHandler(task) {
	console.log('APP1: get email: ' + task.data.address);

	setTimeout(function () {
		task.done(function (err) {
			console.log('APP1: done email: %s - error: %s', task.data.address, err);
		});
	}, 500);
}

function pdfHandler(tasks) {
	var l = tasks.length;
	
	console.log('APP1: PDFs: ' + l);
		
	(function next(i) {
		if (l > i) {
			console.log('APP1: Get PDF: %s', tasks[i].data.name);
			
			setTimeout(function () {
				tasks[i].done(function (err) {
					console.log('APP1: done PDF: %s', tasks[i].data.name);
					next(++i);
				});
			}, 1000);
		}
	}(0));
}

que1.process('email', emailHandler);
que1.process('pdf', { count: 2 }, pdfHandler);