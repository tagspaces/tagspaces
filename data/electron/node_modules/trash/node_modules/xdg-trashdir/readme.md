# xdg-trashdir [![Build Status](http://img.shields.io/travis/kevva/xdg-trashdir.svg?style=flat)](https://travis-ci.org/kevva/xdg-trashdir)

> Get the correct trash path on Linux according to the [spec](http://www.ramendik.ru/docs/trashspec.html)


## Install

```
$ npm install --save xdg-trashdir
```


## Usage

```js
const xdgTrashdir = require('xdg-trashdir');

xdgTrashdir().then(dir => {
	console.log(dir);
	//=> '/home/johndoe/.local/share/Trash'
});

xdgTrashdir('foo.zip').then(dir => {
	console.log(dir);
	//=> '/media/johndoe/UUI/.Trash-1000'
});

xdgTrashdir.all().then(dirs => {
	console.log(dirs);
	//=> ['/home/johndoe/.local/share/Trash', '/media/johndoe/UUI/.Trash-1000', ...]
});
```


## API

### xdgTrashdir([file])

Returns a promise that resolves the path to the trash.

#### file

Type: `string`

Get the trash path for a specific file.

### xdgTrashdir.all()

Returns a promise that resolves to an array with all possible trash paths.


## License

MIT © [Kevin Mårtensson](https://github.com/kevva)
