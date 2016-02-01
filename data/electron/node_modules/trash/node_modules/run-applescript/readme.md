# run-applescript [![Build Status](https://travis-ci.org/sindresorhus/run-applescript.svg?branch=master)](https://travis-ci.org/sindresorhus/run-applescript)

> Run AppleScript and get the result


## Install

```
$ npm install --save run-applescript
```


## Usage

```js
const runApplescript = require('run-applescript');

runApplescript('return "unicorn"').then(result => {
	console.log(result);
	//=> 'unicorn'
});
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
