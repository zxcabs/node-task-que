//utils

var _chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
	_chlen = _chars.length,
	foo = function () {},
	_toString = Object.prototype.toString,
	_isArray = Array.isArray;

exports.foo = foo;

module.exports.uid = function(len) {
	len = len || 32;
	
	var arr = new Array(len);
	
	do {
		len -= 1;
		arr[len] = _chars[(Math.random() * _chlen) | 0];
	} while (len);
	
	return arr.join('');
};

//offset - относительно первого аргумента
function argumentsToArray(args, offset) {
	offset = offset || 0;
	
	var l = args.length,
		arr = new Array((offset > l ? 0 : l - offset)),
		i, j;
		
	for (i = offset, j = 0; l > i; i++, j++) {
		arr[j] = args[i];
	}
	
	return arr;
}
module.exports.argumentsToArray = argumentsToArray;

//error callback
module.exports.ecb = function (onError, onSuccess, owner) {
	onError = onError || foo;
	onSuccess = onSuccess || foo;
	
	return function () {
		if (arguments[0]) {
			onError.call(owner, arguments[0]);
		} else {
			onSuccess.apply(owner, argumentsToArray(arguments, 1));
		}
	};
};

//objectToString
function objToString(obj) {
	return _toString.call(obj);
}
module.exports.objToString = objToString;

//isArray
function isArray(arr) {
	return _isArray(arr) || '[object Array]' === objToString(arr);
}
module.exports.isArray = isArray;

function isFunction(fn) {
	return 'function' === typeof fn;
}
module.exports.isFunction = isFunction;

function tryJson (json) {
	try {
		return JSON.parse(json);
	} catch (e) {
		return json;
	}
}
module.exports.tryJson = tryJson;

function tryStringify(obj) {
	try {
		return JSON.stringify(obj);
	} catch (e) {
		return objToString(obj);
	}
}
module.exports.tryStringify = tryStringify;

function cloneArray(arr) {
	return arr.slice();
}
module.exports.cloneArray = cloneArray;