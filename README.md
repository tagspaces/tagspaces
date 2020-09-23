![tagspaces logo](https://raw.github.com/tagspaces/tagspaces/master/app/assets/icons/96x96.png)

<!-- ![tagspaces@travis](https://travis-ci.org/tagspaces/tagspaces.svg?branch=master) -->

[![Join the chat at https://gitter.im/tagspaces/tagspaces](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/tagspaces/tagspaces?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Github All Releases](https://img.shields.io/github/downloads/tagspaces/tagspaces/total.svg)]()

**TagSpaces** is a free, non-locking, open source application for organizing and managing your local files with the help of tags. It features note taking and some to-do app capabilities. The application is available for Windows, Linux, Mac OS and Android. We provide a web clipper extension for Firefox and Chrome for easy collecting of online content as local files.

![TagSpaces Start Screen](https://raw.githubusercontent.com/tagspaces/documentation/master/static/media/v3/tagspaces-v3-themes.jpg)

More information about can be found from the following sources:

- [Website: tagspaces.org](https://www.tagspaces.org/) - official web site of the project.
- [Blog](https://www.tagspaces.org/blog/) for news about TagSpaces
- [Documentation](https://docs.tagspaces.org/) for our latest generated documentation
- [Video Introduction](https://www.youtube.com/embed/CJ2hYU6U-C8) - This is a short video presenting the main concepts of the application. It is made from a pretty old application version but it is still valid for the most of the use cases.
- [Issues Tracker](https://github.com/tagspaces/tagspaces/issues) for developer support requests

<!-- To get updates you can:
- Subscribe to GitHub updates by clicking the "watch" button up the top right of this page.
- Subscribe to RSS feed updates for the [master branch](https://github.com/tagspaces/tagspaces/commits/master.atom) -->

## Downloads

You can find the latest release of TagSpaces in the Github [release section](https://github.com/tagspaces/tagspaces/releases/)

A full list of the changes is available on the [changelog](CHANGELOG.md)

## Main Features

- **File and folder management** - TagSpaces provides a convenient user interface for browsing, viewing and man files and folders.
- **File tagging** - The application supports two ways for tagging files. The default one embeds the tags directly in the name of the file, the other one uses a so called sidecar files for persisting the tags.
- **Searching** - The search functionality supports fussy functionality and can filter your locations for files and folders containing one or more tags
- **Browser for local content** - TagSpaces can be used just as browser for your local photos or navigation thought your local ebook library
- **Media player** - It supports playing for common audio and video files types and has integrated basic media player functionalities.
- **No-Cloud:** TagSpaces is running completely offline and serverless on your laptop, desktop or tablet and does not require an internet connection and any kind of online registration or service provider.
- **Note Taking** - you can create and edit notes in plain text, markdown and html file formats
- **To-Do Management** - with the help of the build in HTML editor you are able to create simple todo lists in every HTML file.
- **Cross-platform:** TagSpaces runs on Windows, Linux, Mac and Android
- **Web Clipper** for saving web pages and screenshots from your browsers is also available as extension for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tagspaces/) and [Chrome](https://chrome.google.com/webstore/detail/tagspaces-web-clipper/ldalmgifdlgpiiadeccbcjojljeanhjk).

## Infos for developers

The core of TagSpaces starting from version 3 is built with [react.js](https://reactjs.org/) and the great [material-ui](https://material-ui.com/) framework.

The native Windows, Linux and Mac OS versions of TagSpaces are built with [Electron](https://electron.atom.io/). Electron is an app runtime based on Chromium and node.js. In order to combine it with react we have used the [electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate).

### Repository Directory Structure

    ./app................ contains the application core
    ./app/locales........ contains the language files needed for the application internationalization
    ./app/node_modules... contains the TagSpaces extension modules
    ./cordova............ contains the code needed for running the Android version
    ./dll................ contains the files needed for live reload in development mode
    ./flow-typed......... contains for the Flow static type checker
    ./internals.......... contains files needed for supporting Flow and Eslint
    ./node_modules....... after yarn install, you will find here the external dependencies of the application
    ./resources.......... contains images and other files needed for the application building
    ./scripts............ contains js script needed for the yarn/npm tasks

### How to run TagSpaces from the source code?

In order to run TagSpaces on your Windows, Mac OS or Linux from the source code published here, you will need the following prerequisites:

- [node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com), currently we prefer yarn
- [git](http://git-scm.org/)

Get the TagSpaces source code by cloning its repository:

    $ git clone https://github.com/tagspaces/tagspaces.git

Go to the folder where the code was cloned and select the branch you want to test. Use the the **master** branch for the last officially released version or the branch **develop** for a kind of a nightly build, containing the changes we are preparing for the next release of the application.

Switch to folder where you have cloned the repository:

    $ cd tagspaces

Change to the branch with the name **develop**:

    $ git checkout develop

and install the project dependencies:

    $ yarn install

**Note:** If you experience any errors with the above command, please try this command first before filing a bug report:

    $ yarn install --network-timeout 1000000

The last command will automatically build the application with webpack. Now it is time to install all the TagSpaces extensions:

    $ yarn install-ext

Now you are ready and can build/start (bs) the application with:

    $ yarn bs

If you want to try the development mode, you can start it by:

    $ yarn dev

This will start a development server in background, which watches for changes in background and refreshes the application automatically once you have done some changes in the source code.

### How to create the packages for Windows, Linux and Mac OS?

Building of the packages can be accomplished with the integrated yarn scripts:

    $ yarn package-win

    $ yarn package-linux

    $ yarn package-osx

For creating the packages for Windows, Linux and Mac OS respectively.

### Developing extensions for TagSpaces

TagSpaces can be easily extended with the help of extensions. Currently we use the extensions for supporting the opening and editing of different file types in the application. More information about this topic can be found on the [extension page](https://www.tagspaces.org/extensions/) of our website.

### How to start the WebDAV edition for testing?

#### Development Server

For developing purposes and local tests, the WebDAV version of the app can be started with the following yarn command:

    $ yarn run-web

This command will start a local node.js-WebDAV server on `http://127.0.0.1:8000`. Open your browser and enter the following URL:

    http://127.0.0.1:8000/index.html

You will be prompted for user credentials, which are username: `demo` and password: `demo` and now you should be able to work with the WebDAV version of TagSpaces.

#### Apache server with WedDAV module

In order to install TagSpaces on a Apache webserver you have to enable the **mod_dav** module, which comes with the Apache Server. More information about the installation and configuration can be found on [apache.org](https://httpd.apache.org/docs/current/mod/mod_dav.html). Please make sure that you have read and understood the potential security issues by running a WebDAV server on internet.

Here is a sample config file for Apache on Linux:

    <VirtualHost *:80>
    	ServerAdmin admin@somedomain.com
    	ServerName somedomain.com
    	DocumentRoot /var/www/somedomain.com/public_html
    	ErrorLog ${APACHE_LOG_DIR}/error-somedomain.log
    	CustomLog ${APACHE_LOG_DIR}/access-somedomain.log combined
    </VirtualHost>

    <Directory /var/www/somedomain.com/public_html>
    	Options FollowSymLinks MultiViews
    	AllowOverride None
    	Order allow,deny
    	allow from all
    </Directory>

    Alias /files /var/yourFilesForWebDAV # this alias is useful if you do not want to store your files in the apache folder

    <Location /files>
    	Options Indexes
    	DAV On
    	AuthType Basic # this way you can enable simple auth mechanism for protecting your files (basic auth should be used only over https with SSL/TSL)
    	AuthName "webdav"
    	AuthUserFile /somepath/webdav.password
    	Require valid-user
    </Location>

With some modification it can be also used for Apache on Windows, for a detailed manual refer to this article: [How to enable WebDAV in Apache Server 2.2.x – Windows](http://www.mkyong.com/apache/how-to-enable-webdav-in-apache-server-2-2-x-windows/)

You can find more details about the Nextcloud integration here: [Self-hosted TagSpaces with WebDAV](https://docs.tagspaces.org/selfhosting.html).

## Contribute

TagSpaces is an open source software, and as such, the code is publicly available on GitHub, and forking is particularly recommended! Still, contribution must be done following some guidelines.
Contributor License Agreement

The CLA is an agreement commonly used in major open source project, which aims at protecting all parties implied by a contribution: the contributor, the main code author, and above all, the community. The CLA model we have chosen basically tells the following: the contribution’s copyright is shared between the contributor and the main author. This means each party can do whatever she want in term of relicensing with this contributed piece of code. This is important, because, if in the future, the author wants to change the license in something more in favor of the community, a singular contributor cannot block the process.

The Contributor License Agreement can be signed online on the following [CLA form](https://www.tagspaces.org/contribute/).

## Localisation

TagSpaces is currently available in more than 20 languages. You can help the translation of this application in your language by joining the translation teams on [Transifex](https://www.transifex.com/tagspaces/tagspaces/).

## Ideas and Suggestion

If you have ideas or suggestions on how we can improve our application, you can check the following [Trello board](https://trello.com/b/TGeG5bi9/tagspaces-ideas). Here you will find numerous ideas already proposed by other users. If you want to post something new, please follow [this link](https://trello.com/c/mG97iOqo/19-how-to-use-this-board-and-add-new-ideas)

## Support and Bugs

If you are having troubles using TagSpaces or have found a bug please [open a ticket](https://github.com/tagspaces/tagspaces/issues) on GitHub.

### Known issues

- TagSpaces is not suitable for searching in locations containing more than 100000 files.
- TagSpaces has performance issue displaying folders directly containing more than 1000 files. There is no such problem if the files are distributed in sub folders.

## Feeds

- Subscribe to RSS feed updates for the [tagspaces blog](http://tagspaces.org/blog/feed.xml)
- Subscribe to RSS feed updates for the [master branch](https://github.com/tagspaces/tagspaces/commits/master.atom)

## License

TagSpaces' source code is licensed under the AGPL (GNU Affero General Public License) Version 3. The license text is available in the [LICENSE](LICENSE.txt) file.
