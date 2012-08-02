var TaskQue = require('../lib/TaskQue.js');

var que1 = new TaskQue('app1');
var que2 = new TaskQue('app2');


setTimeout(function () {
	console.log('push to que');
	
	//app2
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
	
	//App2
	que2.task('email', { address: 'APP2asdas23fsdf.tu' }).save();
	que2.task('email', { address: 'APP22@adf.com' }).save();
}, 3000);


function emailHandler(task) {
	console.log('APP1: get email: ' + task.data.address);
	
	debugger;
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
					console.log('APP1: Done PDF: %s', tasks[i].data.name);
					next(++i);
				});
			}, 1000);
		}
	}(0));
}

que1.process('email', emailHandler);
que1.process('pdf', { count: 2 }, pdfHandler);

//app2
que2.process('email', { count: 100 }, function (emails) {
	console.log('APP1: get emails: %s', emails.length);
	
	(function next(email) {
		if (email) {
			console.log('APP2: get email: %s', email.data.address);
			email.done();
			next(emails.shift());
		}
	}(emails.shift()));
});