![tagspaces logo](https://raw.github.com/tagspaces/tagspaces/master/data/assets/icon96.png)

![tagspaces@travis](https://travis-ci.org/tagspaces/tagspaces.svg?branch=master)  [![Join the chat at https://gitter.im/tagspaces/tagspaces](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/tagspaces/tagspaces?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Introduction

`TagSpaces` is a open source application for managing of your local files. You can find more information about it on its website [tagspaces.org](http://tagspaces.org/). For a quick TagSpaces introduction please see this [video](https://www.youtube.com/embed/CJ2hYU6U-C8) on youtube.

- [TagSpaces blog](http://tagspaces.org/blog/) for any news about tagspaces
- [the issues tracker](https://github.com/tagspaces/tagspaces/issues) for developer support requests
- [the TagSpaces wiki](https://github.com/tagspaces/tagspaces/wiki) for end-users and implementors (currently not really used)

To get updates you can:
- Subscribe to GitHub updates by clicking the "watch" button up the top right of this page.
- Subscribe to RSS feed updates for the [master branch](https://github.com/tagspaces/tagspaces/commits/master.atom)

## Repository Directory Structure

    ./data...............see the next lines
    ./data/assets........contains all the css and images used in the application
    ./data/ext...........contains the code of tagspaces extensions
    ./data/js............contains the javascripts which run the application 
    ./data/libs..........contains external javascript libraries together with the license they are distributed 
    ./data/chromium...contains files specific for the current Chrome browser extension
    ./data/cordova ......contains files needed for the building of the Android application which is based on Cordova
    ./data/mozilla.......contains files needed for the Firefox extension based on addon sdk
    ./data/web...........contains files needed for the WebDAV/ownCloud based release of TagSpaces
    ./data/node-webkit...contains files needed for the windows, linux and mac os build of the application
    ./data/templates.....contains HTML templates needed for the UI
    ./data/locales.......contains files need for the localisation of the application UI
    ./data/_locales......contains files need for the localisation of the chrome extension UI

## Downloads 
You can find the latest release of TagSpace in the [Releases Section](https://github.com/tagspaces/tagspaces/releases/)

The full changelog is available here: [Changelog](CHANGELOG.md)

## Features

* **File managing & tagging:** TagSpaces provides a convenient interface for browsing, viewing and tagging of your local files
* **No-Cloud:** TagSpaces is running completely serverless on your laptop, desktop or tablet and does not request internet connection or any kind of online registration or service provider.
* **Note Taking:** You can create and edit notes in plain text, markdown and html file formats
* **Cross-platform:** TagSpaces runs perfectly on Windows, Linux, Mac, Android and as extension in Firefox and Chrome.

## Screenshots

![Lead TagSpaces Screenshot](http://www.tagspaces.org/content/v1.9/tagspaces-html-viewer2.png)

## Documentation

The native Windows, Linux and Mac OS X versions of `TagSpaces` are built with [node-webkit](https://github.com/rogerwang/node-webkit). node-webkit is an app runtime based on Chromium and node.js. You can write native apps in HTML and Javascript with node-webkit.

### How to run TagSpaces from the source code?
Get the TagSpaces source code by cloning its repository:

    $git clone https://github.com/tagspaces/tagspaces.git

#### Run the native Windows, Linux or Mac OS X application
* Download [nw.js](https://github.com/nwjs/nw.js) prebuilt binaries for your system environment.
    * For Windows: copy `nw.exe, nw.pak, icudt.dll, ffmpegsumo.dll` to `tagspaces/data/node-webkit` directory.
    * For Linux: copy `nw, nw.pak, icudtl.dat, libffmpegsumo.so` to `tagspaces/data/node-webkit` directory. If you experience issue related to libudev.so.0 read the following [article](https://github.com/rogerwang/node-webkit/wiki/The-solution-of-lacking-libudev.so.0).
    * For Mac OS X: copy `node-webkit.app` to `tagspaces/data/node-webkit` directory.
* Run the `nw` executable file.

#### Run the Chrome/Chromium extension
* Go to the chrome `Settings` and then to `Extension`
* Enable the `Developer mode` checkbox in the upper right part of the screen
* Click on the `Load unpacked extension...` button
* Then select the `tagspaces/data` directory and click `Open`
* Activate the `Allow access to file URLs` check box in the TagSpaces entry, in order to enable the access to your local file system
* Start the extension by clicking on the TagSpaces icon in the upper right part of Chrome/Chromium

#### Run the Firefox extension
* Download and install the Mozilla Addon SDK following this [article](https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation)
* Start the SDK by executing `source bin/activate` in the Addon SDK folder
* Go to the your local tagspaces folder and run the following command, where the -p argument specifies some local firefox profile:

    `$cfx run -p /tmp/mozprofile`

* Start the addon by clicking the TagSpaces icon in the upper right area of Firefox

#### How to setup the WebDAV edition?
You can find information on this topic on the [TagSpaces blog](http://www.tagspaces.org/webdav-edition/).

## License
TagSpaces's source code is licensed under the AGPL (GNU Affero General Public License) Version 3, for the license text see [LICENSE](LICENSE) file.

## Contribute
TagSpaces is an open source software and as such, the code is publicly available on GitHub, and forking is particularly recommended! Still, contribution must be done following some guidelines.
Contributor License Agreement

The CLA is an agreement commonly used in major open source project, which aims at protecting all parties implied by a contribution : the contributor, the main code author, and above all, the community. The CLA model we have chosen basically tells the following : the contribution’s copyright is shared between the contributor and the main author. This means each party can do whatever she want in term of relicensing with this contributed piece of code. This is important, because, if in the future, the author wants to change the license in something more in favor of the community, a singular contributor cannot block the process.

The Contributor License Agreement can be signed online on the following [CLA form](http://tagspaces.org/contribute).

## Translations
You can help the translation of this application in your favorite languages by joining the translations teams on [Transifex](https://www.transifex.com/projects/p/tagspaces/).

## Support and Bugs
If you are having trouble using TagSpaces or have found a bug or you have some ideas how TagSpaces could be improved: [open a ticket](https://github.com/tagspaces/tagspaces/issues) on GitHub.

## Feeds
- Subscribe to RSS feed updates for the [tagspaces blog](http://tagspaces.org/blog/feed.xml)
- Subscribe to RSS feed updates for the [master branch](https://github.com/tagspaces/tagspaces/commits/master.atom)

- - -
This files is created and edited in `TagSpaces`, using the `viewerMD` and `editorText` extensions.
