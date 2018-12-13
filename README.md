
![tagspaces logo](https://raw.github.com/tagspaces/tagspaces/master/data/assets/icon96.png)

<!-- ![tagspaces@travis](https://travis-ci.org/tagspaces/tagspaces.svg?branch=master) -->
[![Join the chat at https://gitter.im/tagspaces/tagspaces](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/tagspaces/tagspaces?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Github All Releases](https://img.shields.io/github/downloads/tagspaces/tagspaces/total.svg)]()

## Introduction

**TagSpaces** is a open source application for managing of your local files. You can find more information about it on its website [tagspaces.org](https://tagspaces.org/). For a quick TagSpaces introduction please see this [Youtube video](https://www.youtube.com/embed/CJ2hYU6U-C8).

- [TagSpaces Blog](https://www.tagspaces.org/blog/) for any news about TagSpaces
- [TagSpaces Documentation](https://docs.tagspaces.org/) for our latest generated documentation
- [Issues Tracker](https://github.com/tagspaces/tagspaces/issues) for developer support requests

To get updates you can:
- Subscribe to GitHub updates by clicking the "watch" button up the top right of this page.
- Subscribe to RSS feed updates for the [master branch](https://github.com/tagspaces/tagspaces/commits/master.atom)

## Repository Directory Structure

    ./app................ contains the application core
    ./app/locales........ contains the language files needed for the application internationalization
    ./app/node_modules... contains the TagSpaces extension modules
    ./cordova............ contains the code needed for running the Android version
    ./dll................ contains the file needed for live reload in development mode
    ./flow-typed......... contains for the Flow static type checker
    ./internals.......... contains files needed for supporting Flow and Eslint
	./node_modules....... after yarn install, you will find here the external dependencies of the application
    ./resources.......... contains images and other files needed for the application building
    ./scripts............ contains js script needed for the yarn/npm tasks

## Downloads
You can find the latest release of TagSpace in the Github [release section](https://github.com/tagspaces/tagspaces/releases/) of TagSpaces

A full list of the changes is available on our [changelog](CHANGELOG.md)

## Main Features

* **File managing & tagging:** TagSpaces provides a convenient interface for browsing, viewing and tagging your local files and folders.
* **No-Cloud:** TagSpaces is running completely offline and serverless on your laptop, desktop or tablet and does not require an internet connection and any kind of online registration or service provider.
* **Note Taking:** You can create and edit notes in plain text, markdown and html file formats
* **Cross-platform:** TagSpaces runs on Windows, Linux, Mac, Android and as extension for the Firefox and Chrome browsers.

## Screenshots

![TagSpaces Start Screen](https://www.tagspaces.org/content/v3-x/tagspaces-next-theming.png)

## Infos for developers

The core of TagSpaces starting from version 3 is built with [react.js](https://reactjs.org/) and the great [material-ui](https://material-ui.com/) framework.

The native Windows, Linux and Mac OS versions of TagSpaces are built with [Electron](https://electron.atom.io/). Electron is an app runtime based on Chromium and node.js. In order to combine it with react we have used the [electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate).

### How to run TagSpaces from the source code?
In order to run TagSpaces on your Windows, Mac OS or Linux from the source code published here, you will need the following prerequisites:
 * [node.js](https://nodejs.org/)
 * [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com), currently we prefer yarn
 * [git](http://git-scm.org/)

Get the TagSpaces source code by cloning its repository:

    $ git clone https://github.com/tagspaces/tagspaces.git

Go to the folder where the code was cloned and select the branch you want to test. Use the the **master** branch for the last officially released version or the branch **develop** for a kind of a nightly build, containing the changes we are preparing for the next release of the application.

Switch to folder where you have cloned the repository:

    $ cd tagspaces

Change to the branch with the name **develop**:

	$ git checkout develop

and install the project dependencies:

    $ yarn install

The last command will automatically build the application with webpack. Now it is time to install all the TagSpaces extensions:

	$ yarn install-ext

Now you are ready and can start the application with:

	$ yarn start

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

## License
TagSpaces's source code is licensed under the AGPL (GNU Affero General Public License) Version 3, for the license text see [LICENSE](LICENSE) file.

## Contribute
TagSpaces is an open source software, and as such, the code is publicly available on GitHub, and forking is particularly recommended! Still, contribution must be done following some guidelines.
Contributor License Agreement

The CLA is an agreement commonly used in major open source project, which aims at protecting all parties implied by a contribution: the contributor, the main code author, and above all, the community. The CLA model we have chosen basically tells the following: the contribution’s copyright is shared between the contributor and the main author. This means each party can do whatever she want in term of relicensing with this contributed piece of code. This is important, because, if in the future, the author wants to change the license in something more in favor of the community, a singular contributor cannot block the process.

The Contributor License Agreement can be signed online on the following [CLA form](http://tagspaces.org/contribute/).

## Translations
You can help the translation of this application in your languages by joining the translations teams on [Transifex](https://www.transifex.com/tagspaces/tagspaces/).

## Ideas and Suggestion
If you have ideas or suggestions on how we can improve our application, you can check the following [Trello board](https://trello.com/b/TGeG5bi9/tagspaces-ideas). Here you will find numerous ideas already proposed by other users. If you want to post something new, please follow [this link](https://trello.com/c/mG97iOqo/19-how-to-use-this-board-and-add-new-ideas)

## Support and Bugs
If you are having trouble using TagSpaces or have found a bug or you have some ideas how TagSpaces could be improved: [open a ticket](https://github.com/tagspaces/tagspaces/issues) on GitHub.

## Feeds
- Subscribe to RSS feed updates for the [tagspaces blog](http://tagspaces.org/blog/feed.xml)
- Subscribe to RSS feed updates for the [master branch](https://github.com/tagspaces/tagspaces/commits/master.atom)


