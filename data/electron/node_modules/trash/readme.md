# ![trash](https://cdn.rawgit.com/sindresorhus/trash/1cdbd660976d739eeb45447bb6b62c41ac4a3ecf/media/logo.svg)

> Move files and folders to the trash

[![Build Status](https://travis-ci.org/sindresorhus/trash.svg?branch=master)](https://travis-ci.org/sindresorhus/trash)

Works on OS X, Linux, and Windows.

In contrast to [`fs.unlink`](https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback), [`del`](https://github.com/sindresorhus/del), and [`rimraf`](https://github.com/isaacs/rimraf) which permanently delete files, this only moves them to the trash, which is much safer and reversible.


## Install

```
$ npm install --save trash
```


## Usage

```js
const trash = require('trash');

trash(['*.png', '!rainbow.png']).then(() => {
	console.log('done');
});
```

*You can use [glob patterns](https://github.com/sindresorhus/globby#globbing-patterns).*


## CLI

To install the [`trash`](https://github.com/sindresorhus/trash-cli) command, run:

```
$ npm install --global trash-cli
```


## Info

On OS X, [`osx-trash`](https://github.com/sindresorhus/osx-trash) is used.  
On Linux, the [XDG spec](http://standards.freedesktop.org/trash-spec/trashspec-1.0.html) is followed.  
On Windows, [`recycle-bin`](https://github.com/sindresorhus/recycle-bin) is used.


## FAQ

### But I can do the same thing with `mv`

Not really. The `mv` command isn't cross-platform and moving to trash is not just about moving the file to a "trash" directory. On all OSes you'll run into file conflicts. The user won't easily be able to restore the file. It won't work on an external drive. The trash directory location varies between Windows versions. For Linux, there's a whole [spec](http://www.ramendik.ru/docs/trashspec.html) you need to follow. On OS X, you'll lose the [Put back](http://mac-fusion.com/trash-tip-how-to-put-files-back-to-their-original-location/) feature.


## Related

- [trash-cli](https://github.com/sindresorhus/trash-cli) - CLI for this module
- [empty-trash](https://github.com/sindresorhus/empty-trash) - Empty the trash
- [del](https://github.com/sindresorhus/del) - Delete files and folders


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
