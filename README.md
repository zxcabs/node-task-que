Task queque using redis.
=======================

Example:
-------

_app.js_

    var Que = require('node-task-que').Que,
        que = new Que();
        
    que.task('email', {name: 'Jo jo', email: 'jo@jo.com'});
    que.task('email', {name: 'Oj oj', email: 'oj@oj.com'}, function (err, task) {
        console.log('Add task id: ' + task.id);
        que.end();
    });


_worker10.js_ - 10 tasks

    var Worker = require('node-task-que').Worker;
    
    //tasks is array of task
    function handler(err, tasks, done) {
        console.log('Handled ' + tasks.length + ' email tasks');
        done();
    }
    
    var email = new Worker('email', 10, handler);



_worker1.js_ - 1 task

    var Worker = require('node-task-que').Worker;
    
    //task is task
    function handler(err, task, done) {
        console.log('Handled ' + task.id + ' email task');
        done();
    }
    
    var email = new Worker('email', handler);
    
