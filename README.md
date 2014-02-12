![tagspaces logo](https://raw.github.com/uggrock/tagspaces/master/data/assets/icon96.png) 
## Introduction

`TagSpaces` is a open source application for managing of your local files. You can find more information about it on its website [tagspaces.org](http://tagspaces.org/). For a quick TagSpaces introduction please see this [video](https://www.youtube.com/embed/CJ2hYU6U-C8) on youtube.

- [TagSpaces blog](http://tagspaces.org/blog/) for any news about tagspaces
- [the issues tracker](https://github.com/uggrock/tagspaces/issues) for developer support requests
- [the TagSpaces wiki](https://github.com/uggrock/tagspaces/wiki) for end-users and implementors (currently not really used)

To get updates you can:
- Subscribe to GitHub updates by clicking the "watch" button up the top right of this page.
- Subscribe to RSS feed updates for the [master branch](https://github.com/uggrock/tagspaces/commits/master.atom)

## Repository Directory Structure

    ./data...............see the next lines
    ./data/assets........contains all the css and images used in the application
    ./data/ext...........contains the code of tagspaces extensions
    ./data/js............contains the javascripts which run the application 
    ./data/libs..........contains external javascript libraries together with the license they are distributed 
    ./data/chrome........contains some files which are specific for the chrome browser extension
    ./data/cordova ......contains files needed for the building of the android application which is based on cordova
	./data/mozilla.......contains javascript files implementing core functionality for the mozilla extension based on addon sdk 
    ./data/node-webkit...contains files needed for the windows, linux and mac os build of the application
    ./data/templates.....contains HTML templates needed for the UI

## Downloads 
[v1.7.3 release](https://github.com/uggrock/tagspaces/releases/tag/v1.7.3) - 1.7 final release

[Changelog](CHANGELOG.md)

## Features

* **File managing & tagging:** TagSpaces provides a convient interface for browsing, viewing and tagging of your local files
* **No-Cloud:** TagSpaces is running completely serverless on your laptop, desktop or tablet and does not request internet connection or any kind of online registration or service provider.
* **Note Taking:** You can create and edit notes in plain text, markdown and html file formats
* **Cross-platform:** TagSpaces runs perfectly on Windows, Linux, Mac, Android and as extension in Firefox and Chrome.

## Screenshots

![Lead TagSpaces Screenshot](http://www.tagspaces.org/content/v1.7/tagspaces-lead-screenshot.png)

## Documents

The native windows, linux and mac versions of `TagSpaces` are built with [node-webkit](https://github.com/rogerwang/node-webkit). node-webkit is an app runtime based on Chromium and node.js. You can write native apps in HTML and Javascript with node-webkit. 

### How to run TagSpaces source code?
1. Clone TagSpaces to the local;
2. Download [node-webkit](https://github.com/rogerwang/node-webkit) prebuilt binaries for your system environment.
3. For windows, copy `nw.exe, nw.pak, icudt.dll` to `data/node-webkit` directory.
For Linux, copy `nw, nw.pak` to `data/node-webkit` directory.
For Mac OS X, copy `node-webkit.app` to `data/node-webkit` directory.
4. Run the `nw` executable file.

## License

`TagSpaces`'s code uses the AGPL (GNU Affero General Public License) Version 3, see our `LICENSE` file.

## Feeds
- Subscribe to RSS feed updates for the [tagspaces blog](http://tagspaces.org/blog/feed.xml)
- Subscribe to RSS feed updates for the [master branch](https://github.com/uggrock/tagspace/commits/master.atom)

- - -
This files is created and edited in `TagSpaces`, using the `viewerMD` and `editorText` extensions.