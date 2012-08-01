//utils

var _chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
	_chlen = _chars.length;

module.exports.uid = function(len) {
	len = len || 32;
	
	var arr = new Array(len);
	
	do {
		len -= 1;
		arr[len] = _chars[(Math.random() * _chlen) | 0];
	} while (len);
	
	return arr.join('');
};


module.exports.argumentsToArray = function (args) {
	var l = args.length,
		arr = new Array(l),
		i;
		
	for (i = 0; l > i; i++) {
		arr[i] = args[i];
	}
	
	return arr;
};