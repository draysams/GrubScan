"use strict";
var $S = require('suspend'), $R = $S.resume, $T = function(gen) { return function(done) { $S.run(gen, done); } };

var ipfs = require('../index.js');
var assert = require('assert');
var fs = require('fs');

describe('add(stream, cb(err, hash))', function(){
    it('should return a hash of the given stream', $T(function*(){
	var tmp = fs.createWriteStream('/tmp/hello.txt');
	yield tmp.end('Hello, World\n', 'utf-8', $R());

	var reader = fs.createReadStream('/tmp/hello.txt');
	var hash = yield ipfs.add(reader, $R());
	assert.equal(hash, 'QmTE9Xp76E67vkYeygbKJrsVj8W2LLcyUifuMHMEkyRfUL');
    }));

});
