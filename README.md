![tagspaces logo](https://raw.github.com/tagspaces/tagspaces/master/app/assets/icons/96x96.png)

[![Join the chat at https://gitter.im/tagspaces/tagspaces](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/tagspaces/tagspaces?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Github All Releases](https://img.shields.io/github/downloads/tagspaces/tagspaces/total.svg)]()

**TagSpaces** is a free, non-locking, open source application for organizing and managing your local files with the help of tags. It features note taking and some to-do app capabilities. The application is available for Windows, Linux, Mac OS and Android. We provide a web clipper extension for Firefox and Chrome for easy collecting of online content as local files.

![TagSpaces Start Screen](https://raw.githubusercontent.com/tagspaces/documentation/master/static/media/v3/tagspaces-v3-themes.jpg)

More information about can be found from the following sources:

- [Website](https://www.tagspaces.org/) - official web site of the project.
- [Blog](https://www.tagspaces.org/blog/) for news about TagSpaces
- [Documentation](https://docs.tagspaces.org/) for our latest generated documentation
- [Video Introduction](https://www.youtube.com/embed/CJ2hYU6U-C8) - This is a short video presenting the main concepts of the application. It is made from a pretty old application version but it is still valid for the most of the use cases.
- [Issues Tracker](https://github.com/tagspaces/tagspaces/issues) for developer support requests

## Downloads

You can find the latest release of TagSpaces in the Github [release section](https://github.com/tagspaces/tagspaces/releases/)

A full list of the changes is available in the [changelog](CHANGELOG.md)

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

## Repository Directory Structure

    ./app................ contains the application core
    ./app/locales........ contains the language files needed for the application internationalization
    ./app/node_modules... contains the TagSpaces extension modules
    ./cordova............ contains the code needed for running the Android version
    ./dll................ contains the files needed for live reload in development mode
    ./internals.......... contains files needed for supporting Flow and Eslint
    ./node_modules....... after yarn install, you will find here the external dependencies of the application
    ./resources.......... contains images and other files needed for the application building
    ./scripts............ contains js script needed for the yarn/npm tasks
    ./web................ contains assets needed for the web version of the app

## How to run TagSpaces from the source code?

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

    $ yarn install

The last command will automatically build the application with webpack. Now it is time to install all the TagSpaces extensions:

    $ yarn install-ext

Now you are ready and can build/start (bs) the application with:

    $ yarn bs

If you want to try the development mode, you can start it by:

    $ yarn dev

This will start a development server in background, which watches for changes in background and refreshes the application automatically once you have done some changes in the source code.

## Package the app for Windows, Linux and Mac OS

Building of the packages can be accomplished with the integrated yarn scripts:

```bash
$ yarn package-win

$ yarn package-linux

$ yarn package-mac
```

For creating the packages for Windows, Linux and Mac OS respectively.

## Start the web version locally

For developing purposes and local tests, the web version of the app can be started with the following yarn command:

    $ yarn run-web

## Running Tests

To run tests, run the following command

```bash
yarn test-unit

yarn test-e2e-electron

yarn test-e2e-web
```

## Developing viewer and editor for TagSpaces

TagSpaces can be easily extended with the help of extensions. Currently we use the extensions for supporting the opening and editing of different file types in the application. More information about this topic can be found on the [extension page](https://www.tagspaces.org/extensions/) of our website.

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

## Known issues

- TagSpaces is not suitable for searching in locations containing more than 100000 files.
- TagSpaces has performance issue displaying folders directly containing more than 1000 files. There is no such problem if the files are distributed in sub folders.

## Feeds

- Subscribe to RSS feed updates for the [tagspaces blog](http://tagspaces.org/blog/feed.xml)
- Subscribe to RSS feed updates for the [master branch](https://github.com/tagspaces/tagspaces/commits/master.atom)

## License

TagSpaces' source code is licensed under the AGPL (GNU Affero General Public License) Version 3. The license text is available in the [LICENSE](LICENSE.txt) file.
