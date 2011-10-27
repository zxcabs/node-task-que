var util = require('util');

var Worker = require('../').Worker,
	pdf = new Worker('pdf', function (err, task, done) {
		console.log('PDF data: %s, Error: %s, task: %s', new Date(),  err, util.inspect(task));
		done();
	});