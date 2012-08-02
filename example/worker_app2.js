var TaskQue = require('../lib/TaskQue.js');

var que2 = new TaskQue('app2');

function emailHandler(task) {
	console.log('APP2: get email: ' + task.data.address);

	setTimeout(function () {
		task.done(function (err) {
			console.log('APP2: done email: %s - error: %s', task.data.address, err);
		});
	}, 500);
}

function pdfHandler(tasks) {
	var l = tasks.length;
	
	console.log('APP2: PDFs: ' + l);
		
	(function next(i) {
		if (l > i) {
			console.log('APP2: Get PDF: %s', tasks[i].data.name);
			
			setTimeout(function () {
				tasks[i].done(function (err) {
					console.log('APP2: done PDF: %s', tasks[i].data.name);
					next(++i);
				});
			}, 1000);
		}
	}(0));
}

que2.process('email', emailHandler);
que2.process('pdf', { count: 10 }, pdfHandler);