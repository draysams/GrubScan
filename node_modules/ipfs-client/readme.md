# IPFS Node.JS Client
This library is a simple client for the [InterPlanetary File System](http://ipfs.io).  It currently supports the operations of storing and retrieving file content in IPFS.

## Installing
```
npm --save install ipfs-client
```

## API
### cat - Streaming content out of IPFS
Example:
```js
var ipfs = require('ipfs-client');

var stream = ipfs.cat('QmTE9Xp76E67vkYeygbKJrsVj8W2LLcyUifuMHMEkyRfUL');
stream.pipe(process.stdout);
```

### add - Store the Content of a Stream
Provides a hash in return.

Example:
```js
var ipfs = require('ipfs-client');

ipfs.add(process.stdin, function(err, hash) {
    console.log(hash);
});
```
