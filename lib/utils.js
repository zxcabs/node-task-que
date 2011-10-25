//utils

var _chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
	_chlen = _chars.length;

module.exports.uid = function(len) {
	var len = len || 32,
		arr = new Array(len);
	
	do {
		len--;
		arr[len] = _chars[parseInt(Math.random() * _chlen)];
	} while (len);
	
	return arr.join('');
}