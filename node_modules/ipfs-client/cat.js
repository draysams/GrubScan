"use strict";
var child_process = require('child_process');

exports.cat = function(hash) {
    var proc = child_process.spawn('ipfs', ['cat', hash]);
    var err = '';
    proc.stderr.setEncoding('utf-8');
    proc.stderr.on('data', function(data) { err += data; });
    proc.on('exit', function(status) {
	if(status != 0) {
	    proc.stdout.emit('error', Error(err.trim()));
	}
    });
    return proc.stdout;
};
