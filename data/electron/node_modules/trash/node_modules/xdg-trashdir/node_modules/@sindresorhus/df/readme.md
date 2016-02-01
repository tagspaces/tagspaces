# df [![Build Status](https://travis-ci.org/sindresorhus/df.svg?branch=master)](https://travis-ci.org/sindresorhus/df)

> Get free disk space info from [`df -kP`](http://en.wikipedia.org/wiki/Df_\(Unix\))

Works on any Unix based system like OS X and Linux.

*Created because all the other `df` wrappers are terrible. This one uses simple and explicit parsing. Uses `execFile` rather than `exec`. Ensures better platform portability by using the `-P` flag. Returns sizes in bytes instead of kilobytes and the capacity as a float.*


## Install

```
$ npm install --save @sindresorhus/df
```


## Usage

```js
var df = require('@sindresorhus/df');

df(function (err, list) {
	console.log(list);
	/*
	[{
		filesystem: '/dev/disk1',
		size: 499046809600,
		used: 443222245376,
		available: 55562420224,
		capacity: 0.89,
		mountpoint: '/'
 	 }, ...]
  */
});

df.fs('/dev/disk1', function (err, data) {
	console.log(data);
	/*
	{
		filesystem: '/dev/disk1',
		...
 	 }
  */
});

df.file(__dirname, function (err, data) {
	console.log(data);
	/*
	{
		filesystem: '/dev/disk1',
		...
 	 }
  */
});
```


## API

### df(callback)

#### callback(error, list)

*Required*  
Type: `function`

##### list

Type: `array`

List of `data` objects.

### df.fs(filesystem, callback)

Get space info for a specific filesystem.

#### filesystem

*Required*  
Type: `string`

#### callback(error, data)

*Required*  
Type: `function`

##### data

Type: `object`

Data for the specified filesystem:

- `filesystem` - The name of the filesystem.
- `size` - Total size in bytes.
- `used` - Used size in bytes.
- `available` - Available size in bytes.
- `capacity` - Capacity as a float from `0` to `1`.
- `mountpoint` - Disk mount location.

### df.file(file, callback)

Get space info for the filesystem the supplied file is part of.

#### file

*Required*  
Type: `string`

#### callback(error, data)

*Required*  
Type: `function`

##### data

Same as `df.fs()`.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
