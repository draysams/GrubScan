"use strict";
var $S = require('suspend'), $R = $S.resume, $T = function(gen) { return function(done) { $S.run(gen, done); } };

var ipfs = require('../index.js');
var assert = require('assert');

var readToString = function(stream, cb) {
    stream.on('error', cb);
    var text = '';
    stream.setEncoding('utf-8');
    stream.on('data', function(data) { text += data; });
    stream.on('end', function() { cb(undefined, text); });
};

describe('cat(hash)', function(){
    it('should return a readable stream producing the file underlying the hash', $T(function*(){
	var file = ipfs.cat('QmTE9Xp76E67vkYeygbKJrsVj8W2LLcyUifuMHMEkyRfUL');
	assert.equal(yield readToString(file, $R()), 'Hello, World\n');
    }));

    it('should report error if hash is not found', $T(function*(){
	var file = ipfs.cat('invalid-hash');
	var err = yield file.on('error', $S.resumeRaw());
	assert.equal(err[0].message, "Error: invalid ipfs ref path");
    }));

});

