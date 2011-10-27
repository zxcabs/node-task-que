var util = require('util');

var Worker = require('../').Worker,
	email = new Worker('email', 5, function (err, tasks, done) {
		console.log('Email data: %s, Error: %s, task: %s', new Date(),  err, util.inspect(tasks));
		done();
	});