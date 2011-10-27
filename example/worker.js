var util = require('util');

var Worker = require('../').Worker,
	email = new Worker('email', function (err, task, done) {
		console.log('Email data: %s, Error: %s, task: %s', new Date(),  err, util.inspect(task));
		done();
	}),
	pdf = new Worker('pdf', function (err, task, done) {
		console.log('PDF data: %s, Error: %s, task: %s', new Date(),  err, task.data.address);
		done();
	});;