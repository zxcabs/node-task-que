
Task queque using redis.
=======================

Example:
-------

_app.js_

    var TaskQue = require('../lib/TaskQue.js'),
        que1 = new TaskQue('app1');

    que1.task('email', { address: 'da2@da.ru' }).save();
    que1.task('email', { address: 'da3@da.ru' }).save();
    que1.task('email', { address: 'da4@da.ru' }).save();
    que1.task('pdf', { name: 'pdf1' }).save();
    que1.task('pdf', { name: 'pdf2' }).save();
    que1.task('pdf', { name: 'pdf3' }).save(function (err) {
       que1.end();
    });

_worker10.js_ - 10 tasks

    var TaskQue = require('../lib/TaskQue.js'),
        que1 = new TaskQue('app1');
    
    function pdfHandler(tasks) {
        console.log('APP1: PDFs: ' + tasks.length);
 
        (function next(task) {
            if (task) {
                console.log('APP1: Get PDF: %s', task.data.name);
                setTimeout(function () {
                        task.done(function (err) {
                        console.log('APP1: done PDF: %s', task.data.name);
                        next(tasks.shift());
                    });
                }, 1000);
            }
        }(tasks.shift()));
    }

    que1.process('pdf', { count: 10 }, pdfHandler);

_worker1.js_ - 1 task

    var TaskQue = require('../lib/TaskQue.js'),
        que1 = new TaskQue('app1');
    
    function handler(task) {
        console.log('APP1: get email: ' + task.data.address);

        setTimeout(function () {
            task.done(function (err) {
                console.log('APP1: done email: %s - error: %s', task.data.address, err);
            });
        }, 500);
    }

    que1.process('email', handler);

