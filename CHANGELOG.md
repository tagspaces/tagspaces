# Changelog

## Version 3.0.9 / 2019.02.01

### Community
- extending the tag search to support AND, OR and negative searches, thanks to @IHappyDayI
- added search boxing enabling search restriction to the current folder
- clear folder content on directory change
- added some basic statistics for tag library [#865](https://github.com/tagspaces/tagspaces/issues/865)
- sorting tags in all tags lists [#849](https://github.com/tagspaces/tagspaces/issues/849)
- replaced "Open Containing Folder" function with "Show in File Manager" function.
- add function to generate video thumbnails
- add openUrl functionality to web version
- playing next file follows selection in perspective
- limit the parent directory navigation to current location
- fix various usability issue in folder container toolbar
- updated split pane resizer style to prevent the divider from overlapping with the scroll bar [#855](https://github.com/tagspaces/tagspaces/issues/855)
- added random sort order for directory content, useful when using TagSpaces as media player
- getting previous and next entries iterate now only over files
- previous and next file button select file in the perspective
- added the ability to select multiple files by holding the shift key. [#852](https://github.com/tagspaces/tagspaces/issues/852)
- added the ability to add multiple files to the selection by holding the shift + ctrl key.
- reflecting changing of meta data like description in file and search indexes
- usability improvements in many dialogs
- refactoring sorting functionality, added sorting by first tag, showing folder always first

### Pro
- added experimental full text search support for TXT, MD and HTML files in the desktop app
- added functionality for find and extract all the tags from the current location
- fix navigation to parent folder on Windows and for s3

## Version 3.0.5 / 2019.01.18

### Community
- add collecting tags after tag rename #832(https://github.com/tagspaces/tagspaces/issues/832)
- fix tag moving bug in tag library
- fix the check for new version
- setting minimum height for an empty tag group in tag library
- making single file click configurable in default perspective
- added different view modes in default perspective
- added thumbnail mode switch (css cover vs contain) in default perspective
- fixing sort order #820(https://github.com/tagspaces/tagspaces/issues/820)
- fixing broken hiding hidden files and folders #836(https://github.com/tagspaces/tagspaces/issues/836)
- fixing header text color in dark mode #835(https://github.com/tagspaces/tagspaces/issues/835)
- updating electron to 3.1.0
- fixing crash on quit by mac os #816(https://github.com/tagspaces/tagspaces/issues/816)
- accessing the context menu for locations, tag groups and folders with a right mouse click
- setting max width to location and tag group names
- making the location switcher always visible
- fixed the icons in the location menu
- fixed the braking of the path history #821(https://github.com/tagspaces/tagspaces/issues/821)
- fixed the scrolling issues in the location manager and tag library
- fixed the hiding of the thumbs in row view by long texts
- updating translations

### Pro
- added search filters for bookmarks and ebooks


## Version 3.0.1 / 2018.12.31

### Community
- fixing tag color issues [#799](https://github.com/tagspaces/tagspaces/issues/799)
- fix tag name validation
- fixing dark theme issue in settings
- fix showing location initially by existing default location
- disable spaces and other symbols in the tag names
- fixing max height of the tag area in the grid view [#801](https://github.com/tagspaces/tagspaces/issues/801)
- fixing importing tag library in web edition [#804](https://github.com/tagspaces/tagspaces/issues/804)

### Pro
- fixing pdf thumb generation

## Version 3.0.0 / 2018.12.21

### Community
- New user interface based on React.js with resizable panels
- Location indexing for faster search
- Tree folder navigation
- Dark theme
- Preview for PSD, TIFF, DOCX files
- Playing modes for audio and video files

### Pro
- Connecting of AWS S3 compatible storage locations
- Watching for changes in a location
- New advance search functionalities

## Version 2.9.0 / 2017.07.15

### Community
- added support for playing flac and mp3 files
- added swith for disabling global keybindings [#574](https://github.com/tagspaces/tagspaces/issues/574)
- allow navigation in the alternative directoriy with a single click
- updating electron to 1.6.8
- fixed size of a iframe viewer in the edge browser
- fixed missing thumbnails of files from search results
- adding additional check for file path
- update i18n files for spanish, chinese, russian and dutch languages

### Pro
- fixed issues with handling tags in sidecar files [#582](https://github.com/tagspaces/tagspaces/issues/582) and [#604](https://github.com/tagspaces/tagspaces/issues/604),

## Version 2.7.0 / 2017.02.04

### Community
- redesigning the user interface for file and directory properties
- read only support for file and directory description
- showing the count of tags in a tag group only if it is collapsed
- adding support for gfm breaks for the markdown transformer
- updating the user ideas link to point to a [trello board](https://trello.com/b/TGeG5bi9/)
- fix for the form validation in the dialogs
- adding danish translations
- saving the windows state, size and location for the next start of tha app
- cap max result to 2000 in settings instead of setting the limit to 0
- redesigning the file properties area
- changing the reload application shortcut key to F5
- added link to the new tagspaces documentation website
- improved performance by search
- migration to electron 1.4.14
- [#494](https://github.com/tagspaces/tagspaces/issues/494) fixed - ignore file/directory names that start with dot, instead of full paths
- [#430](https://github.com/tagspaces/tagspaces/issues/430) fixed - undefined in the file name
- [#498](https://github.com/tagspaces/tagspaces/issues/498) fixed - support for relative path in portable mode
- [#489](https://github.com/tagspaces/tagspaces/issues/489) fixed - psn startup parameter issue on mac
- [#454](https://github.com/tagspaces/tagspaces/issues/454) fixed
- [#405](https://github.com/tagspaces/tagspaces/issues/405) fixed
- [#411](https://github.com/tagspaces/tagspaces/issues/411) fixed

### Pro
- added file description editor in the file properties area
- added directory description in the directory properties are

### Chrome Extension and Firefox Addon
- improved onboarding for the chrome extension

### Android App
- corrected the loading of meta data


## Version 2.6.0 / 2016.11.23

### Community
- Adding a tray icon with a menu
- Adding global shortcuts for showing the application, opening the previous and next files, pausing the playback
- Adding new keyboard shortcuts for open, open native and delete
- Added buttons for changing background colour in viewerMHTML, viewerHTML, viewerImage, perspectiveImageSwiper
- Added editing capabilities for the tag colours in tag groups
- Correcting printing functionality in some extensions
- Added a default color for the tags in the settings
- Add a checkbox in the settings to open the tag library on startup
- Added editor for date and time smart tags
- Add readability mode in viewerMHTML and viewerHTML extensions
- Adding support for reading emails in EML format
- Added GIF to the list of supported image extensions for creating thumbnails on the fly.
- Adding a new plus menu for creating the standard file types
- Adding global shortcut for saving edited text files
- Added 64bit RPM package
- Arrow keys are now moving the selection of the current opened files in the grid and list perspectives
- Tags are displayed now in the image swiper perspective
- Added sorting and grouping capabilities to the grid perspective
- Completely reimplementing the viewerImage with the viewer.js library adding many new features
- Added markdown preview functionality in the editorText
- Show source url and saved date in viewerHTML

### Pro
- Added geo tagging with the leaflet library
- Making thumbnails size and format configurable
- Correcting the generation of PDF thumbnails

### Chrome Extension and Firefox Addon
- Minor bug fixes

### Android App
- Correcting adding external files
- Improving position of alert messages

## Version 2.5.0 / 2016.09.05

### Community
- Support for folders in the grid perspective
- Added Maltese and Armenian translation
- Added new logo
- Added text to confirm and cancel buttons in dialogs
- New file menu items in the top menu
- Placing the tag import and tag group create functionalities in the tag area
- Correcting tag default values
- Added new menu items in electron's help menu
- Added colored file extensions by default and making them optional in the settings
- Button animation enabled
- Support for todos / checkboxes in the rich text (html) editor extension
- Added online/offline check for the webdav version
- Added extCommon library as a place to share common code between tagspaces extensions

### Pro
- Minor bug fixes

### Chrome Extension and Firefox Addon
- Added close button for the chrome extension popup

### Android App
- no specific changes

## Version 2.4.0 / 2016.06.09

### Community
- Added initial implementation for searching in the HTML and MD viewers
- The user interface of the audio/video player was updated
- Audio/video player will trigger the opening of the next file in the current folder on finishing playback, allowing you for example to listen many audio files one after another like in a regular music player.
- The minimum length of the tags was reduced to 1 character
- Added the `F2` key binding for renaming files
- Added a help screen showing the key binding on `F1`
- Fixed directory listing issue with the nginx webdav module [#409](https://github.com/tagspaces/tagspaces/issues/409)
- Fixing showing files containing a tag [#441](https://github.com/tagspaces/tagspaces/issues/441)
- Starting the search in the advanced search dialog on enter now possible
### Pro
- Minor bug fixes
### Chrome Extension and Firefox Addon
- Added the ability to save the source url and date in the saved HTML web page
### Android App
- Supporting playing of audio while the app is not in foreground
- Fixing issue with opening files from search results on android [#438](https://github.com/tagspaces/tagspaces/issues/438)

## Version 2.3.0 / 2016.04.30

### Pro
- Initial release of [TagSpaces Pro](https://www.tagspaces.org/products/pro)

### Community
- Redesigning the search user interface, adding new options
- Considering the parent directory name by the search algorithm
- Added an option in the settings for limiting the search results
- Added an option in the settings for deactivating the default search in subfolders
- Improving handling of not recursive search
- Adding a "goto previous folder" button in the folder navigation
- Adjusting the functionality for showing the availability of new versions
- Fixing open files natively on OS X
- Fixing user interface issue caused by too long file names in list perspective
- Add experimental functionality for watching directories for changes
- Fixing issue [#358](https://github.com/tagspaces/tagspaces/issues/358) which was preventing file renaming on network shares under OS X

### Chrome Extension
- Fixes needed for the file system API changes in Chrome 49

### Android App
- Reenabling the add existing file functionality on Android

## Version 2.2.5 / 2016.04.24
- Firefox only release, with a signed addon
- Addon migration to JPM

## Version 2.2.1 / 2016.03.28
- Fixing embedded images in HTML with data url
- Fixing search in ImageSwiper perspective
- Fixing opening of the source link in MHTML viewer

## Version 2.2.0 / 2016.03.24
- Migration the desktop app to the [Electron](http://electron.atom.io) shell
- Adding live thumbnails for images in grid and image-swiper perspectives
- Adding language detection on the first application run
- Adding polish translation thanks to fringoo
- Fixing refresh issue after dir rename
- Fixing issues in MD and HTML file viewer extensions
- Showing Exif and IPTC information from JPEGs in the image viewer extension
- Fixing opening external links
- Fixing drag & drop of tags and files in grid perspective
- Adding url of the opened file for the webdav version allowing sharing links to the opened document
- Correcting loading documents on startup
- Adding startup parameters like -p for portable mode or -d for debugging
- Adding npm command for running a local test webdav server
- Correcting opening of files on startup
- Disabling the firefox file browser in the addon

## Version 2.1.4 / 2016.03.22 (Android only)
- Adding live thumbnails for images in grid and image-swiper perspectives
- Adding language detection on first run
- Adding polish translation thanks to fringoo
- Fixing refresh issue after dir rename in Android
- Fixing issues with the MD and HTML file viewers
- Showing Exif and IPTC information from JPEGs in the image viewer extension

## Version 2.1.1 / 2016.02.03
- Fixing issue with renaming folder in the WebDAV edition
- Fixing missing icons
- Fixing loading extensions in Firefox

## Version 2.1.0 / 2016.01.28
- Added new perspective(ImageSwiper) for browsing of photos and image
- Separating all the extension in separate modules/repositories, so they can be now easily extended by advanced users
- Adding support for search in subfolders for the webdav and chrome versions
- Improving general stability, by migration of IO-APIs to promises
- Script for generation of image thumbnails added
- Fixed loading of directory tag groups
- Fixed collect renamed tags issue [#372](https://github.com/tagspaces/tagspaces/issues/372)
- Fixed creating multiple taggroups [#367](https://github.com/tagspaces/tagspaces/issues/367)
- Fixed the opening of the containing folder of a file from the search result [374](https://github.com/tagspaces/tagspaces/issues/374)
- Correcting the export of the tag groups
- Loading thumbnails finding the thumbnail path if available
- Allow printing of images in the webdav version
- Load tag groups from last opened location meta data
- Almost all modal dialogs can now be moved with the mouse
- Enabling loading of meta data in non-PRO version
- Correcting the opening of external links
- Hosting the current jsdoc of the application on [tagspaces.github.io](http://tagspaces.github.io)

## Version 2.0.1 / 2015.10.31
- redesign of the user interface using material paradigms
- using flexbox for performance optimization of the user interface
- show file names in delete confirmation message
- adding noty as a notification framework for the project, showing messages for failed operations
- confirming the rename file, create tag, create tag group, edit tag group, create and rename directory dialogs with enter key
- support opening of files in fullscreen
- adding fx-extra node module. solving the issue with moving files over different partitions in the Windows, Linux and Mac apps
- cleaning search results count on location close
- adding initial getting started tour with the hopscotch library
- making the tag group title also collapse and persist the tag groups
- adding a default viewer for the EPUB files
- single click opens files in grid perspective
- save collapsed state of tag groups
- rearranging file opener button toolbar, exchanging icons
- added default startup location functionality
- redesigning the viewerHTML and viewerMD extensions
- fixing issue with opening files from command line
- fixing issue with start in portable mode
- added key binding `ctrl+f` for the search functionality
- added key binding `ctrl+a` for selecting all files
- adding badges for order of steps in the web clippers
- adding confirm dialog for deleting perspective and file types in the settings
- disabling directory watcher in native apps, due to performance issue
- added Korean and Indonesian
- integrating of the rendering engine crosswalk(chromium) for supporting older android devices with SDK 4.1
- exchanging the pdf.js lib with a newer version
- enabling back button on android
