var Worker = require('../').Worker,
	email = new Worker('email', 2, function (err, tasks, done) {
		console.log('Data: %s, Error: %s, tasks: %s', new Date(),  err, tasks);
		done();
	});