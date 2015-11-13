# escape-string-applescript [![Build Status](https://travis-ci.org/sindresorhus/escape-string-applescript.svg?branch=master)](https://travis-ci.org/sindresorhus/escape-string-applescript)

> Escape a string for use in AppleScript

According to the AppleScript [docs](https://developer.apple.com/library/mac/documentation/AppleScript/Conceptual/AppleScriptLangGuide/reference/ASLR_classes.html#//apple_ref/doc/uid/TP40000983-CH1g-DontLinkElementID_57) `\` and `"` have special meaning and should be escaped.


## Install

```sh
$ npm install --save escape-string-applescript
```


## Usage

```js
var execFile = require('child_process').execFile;
var escapeString = require('escape-string-applescript');

var str = escapeString('"i like unicorns"');
//=> \"i like unicorns\"

var script = 'set unicornMessage to "' + str + '"';

execFile('osascript', ['-e', script]);
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
