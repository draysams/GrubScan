"use strict";

var child_process = require('child_process');

exports.add = function(stream, cb) {
    var hash = '';
    var err = '';
    var proc = child_process.spawn('ipfs', ['add', '-q']);
    stream.pipe(proc.stdin);
    proc.stdout.setEncoding('utf-8');
    proc.stdout.on('data', function(data) {
	hash += data;
    });
    proc.stderr.setEncoding('utf-8');
    proc.stderr.on('data', function(data) {
	err += data;
    });
    proc.on('exit', function(status) {
	if(status == 0) {
	    cb(undefined, hash.trim());
	} else {
	    cb(Error(err.trim()));
	}
    });
};
