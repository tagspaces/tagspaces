#Changelog

##Version 1.8.0 / 2014.05.02
- adding configurable keybinding
- german and italian translations added
- improvements in the options dialog
- fixing [#59](https://github.com/uggrock/tagspaces/issues/59) about saving utf8 content
- fixing opening links in the default browser instead of the application [#53](https://github.com/uggrock/tagspaces/issues/53) in markdown files
- fixing undo issue [#45](https://github.com/uggrock/tagspaces/issues/45)
- reenabling the menu on mac [#44](https://github.com/uggrock/tagspaces/issues/44)
- [uservoice] adding setting for showing confirmation dialog before recursive scan
- [firefox] optimizing the start TagSpaces button in the toolbar for support in Firefox 29
- [android] new icon
- optimizing icon layout
- adding back favicon
- optimizing loading js libs
- adding basic handler for command line arguments
- removing the widger from the addon bar
- optimizing the dropups in the alternative directory navigator
- optimizing the tags dropdown menu
- disabling opening of last location of firefox
- updating the webodf lib
- fixing thumbnail refresh
- adding handling for switching languages
- moving switching language to general tab
- adding handling for key bindings
- adding button for help translating
- adding tab for keybindings
- adding new method for language switching
- adding new keybinding settings
- fixing issues with embeding local images and images in data urls
- exchanging ok and cancel in buttons with icons
- added function for opening links in the default browser of the user
- exchanging dialog close icons with a bigger one
- exchanging x in dialogs with a bigger icon
- exchanging the send to icon
- changing the default viewer for text files to editorText
- adding a document listing all the used libraries
- reducing the widht of the tiles in grid perspective
- changing the backgroud color of the buttons in the image viewer
- making the status bar not wrappable
- jshiniting

##Version 1.7.9 / 2014.04.02
- removing of many tags on many files now possible in one step
- making the toolbar icons flat
- adding swipe gestures for image navigation
- fixing text wrapping issues in list perspective
- adding key bindinds for left and right
- redesigning the alternative path navigation
- adding "close file" and "send to" actions to the file menu
- preventing opening links in html files
- adding confirmation dialog for recursiv scan
- correcting fastclick integration
- improving edit title buttons
- opening location panel on location opening
- redifining backbutton cordova
- disable closing of taging dialog by clicking outside of the dialog
- adding iphone icons for the webapp
- adding handler for opening of what's new page
- improving tag handling in dialogs by activating tag selection on blur
- reactivating showing the popup hint if no location created
- resigning contact us panel
- disabling opening the location panel if subfolders exists
- adding a new iframe viewer extension
- updating require.js library to a newer version
- removing the trailing red dot from the editor's content
- [osx] disabling the file menu on mac
- [api] extending loadTextFile funcion to support file preview

##Version 1.7.8 / 2014.03.21
- enabling opening of the last opened location by the start of the application [#29](https://github.com/uggrock/tagspaces/issues/29)
- adding the following key bindings
    - ctrl+r / command+r - reloads the current document
    - ctrl+s / command+s - saves the current document if opened for editing
    - esc - closes the current document  
    - alt-enter - shows the document properties
- making all dialogs not disappear by clicking outsite of the dialog
- fixing issue with not displaying local images in markdown files
- adding webp as supported image format (not in firefox)
- starting hints are shown only if you don't have last opened location
- preventing drag & drop of files in the application
- [api] adding new function for conversion of e.g. 20140313 in js dates
- jqueryhotkeys exchanged with mousetrap library
- updating to a newer codemirror version
- [android] new rounded icons for android added
- [android] added "send to" functionality for all file types
- [android] eliminating the 300ms wait time by adding the fastclick library
- [android] fixing the failing opening of the first document after the start of the app

##Version 1.7.7 / 2014.03.10
- improving and refactoring the layouting algorithm for a better responsible behaviour, especially on mobile phones
- adding handler for the new add tag menu item
- moving toolbar in the image viewer to bottom right
- removing hover and focus background toggle left panel button
- adding support for viewing of ODF files (e.g. ODT, ODS, ODG, ODP) not available in firefox and chrome
- adding new version of pdf.js with support of printing, rotating, dragging, document properties and goto first/last page

##Version 1.7.6 / 2014.02.28
- remember and open the last state of the application window e.g. maximize or not [#29](https://github.com/uggrock/tagspaces/issues/29)
- adding openLocation to the TSCORE API
- making the directory to taglibrary switch buttons brighter
- adding functionality to force closing of opened files for editing
- fixing handling of html files without body
- fixing saving utf8 content in cordova
- refresh file list if the saved file is new
- including webdavlib from sara.nl
- adding webdav api
- improved error handling  in node-webkit
- improved saving ot UTF8 files
- update to summernote version 0.5.0 with some custom changes
- changed the default height of the html editor
- changed the max width of the column in perspective list
- polishing viewerMD
- fixing margin issue in the alternative directory navigation
- quoting the filename in the delete file dialog
- setting the default editor for xhtml files to editorText as proposed in [#31](https://github.com/uggrock/tagspaces/issues/31)
- making viererBrowser secure in node-webkit
- making viewerPDF secure
- fixing security issue with the alert and the confirm dialogs
- increasing the size of the new version available icon
- disabling node functionality in the odf viewer
- updating to bootstrap 3.1.1
- hiding open in new window menu entry in node-webkit for security reasons
- addign general catcher node-webkit errors
- correcting drag & drop
- correcting welcome logo
- fixing issue with empty titles
- adding sorting by filename
- handling the case .txt by extacting of the filename without extension
- issue with drag and drop by folders solved
- displaying the number of files found improved
- correcting the opening of the containing folder in the file viewer
- correcting opening of the containing folder functionality in node-webkit
- setting the min lenght of the tags to 2 chars
- setting space and comma as tags separators for the select2 lib
- adding hint in the file create dialog for the format of the tags
- making the tags from select2 lib to look like tagspaces tags
- partly fixing #25 by removing script tags from the content, by sanitizing the file paths, by removing script tags from the md content
- fixing [#23](https://github.com/uggrock/tagspaces/issues/23) css in markdown
- fixing [#26](https://github.com/uggrock/tagspaces/issues/26)
- fixing [#27](https://github.com/uggrock/tagspaces/issues/27) - utf8 support in md files and not rendering of #header in the beginning of the file, font sizes in headers h1,h2 ...
- fixing [#30](https://github.com/uggrock/tagspaces/issues/30)
- fixing [#31](https://github.com/uggrock/tagspaces/issues/31)
- fixing [#32](https://github.com/uggrock/tagspaces/issues/32)
- fixing [#33](https://github.com/uggrock/tagspaces/issues/33)


##TagSpaces 1.7.4 / 2014.02.17

- adding hints for the format of the tags in the dialogs
- clearing current filter on location change
- adding hover for the file title editor
- facebook button added
- disabling reloading of directory by tag rename
- open files natively added to main file context menu
- migration to node-webkit 0.9.1

##TagSpaces 1.7.3 / 2014.02.05

- Creating native client for Windows
- Creating native client for Linux 64
- Creating native client for Mac OS
- Adding ubuntu font as default for the application
- Optimizing of the hint by the first start of the application
- Splitting the options dialog in tabs
- Adding one step setting backup
- New versioning system based 1.2.3
- Fix fitting of a image in confirm box
- Adding welcome screen to the application
- Deactivating toptoolbar on startup
- Deactivating toptoolbar on location close
- Handling renaming and deleting of files in the UI
- Adding HTML directory browser for cordova
- Adding handling of tag delimiter and prefix tag containers
- Correcting the undefined text in the toolbar by recursive search
- Adding a new contact us popover
- Disable outline border on focused buttons
- Disable special color on focused buttons
- Improvement in the tag calculation
- Optimization of the location edit dialog
- Adding settings for tag calculation, tagdelimiter and prefix of a tag container
- Disabling automatically opening of the directory browser after directory change
- Adding an alternative directory browser in the perspective footer
- Adding a title to the perspective switcher
- Adding hotkeys for reloading, fullscreen and devtool in node-webkit
- Add a contact us dropup
- Adding a button for the activataion of recursive search
- Vizualizing extracted tags from the search results
- Extracting all tags from the currern search results
- Integrating viewerText as default opener for unknown file types
- File properties dialog added
- Adding footer in perspective area
- Adding predifined perspective per locaiton
- Preventing dir list after file delete
- Prevent opening if the files is already in full width mode
- Added response after file delete
- File selection optimized
- Added XHTML as a new file type
- Implementing searchForTag and searchForString methods
- Added popup with search rules description
- Search functionality extracted in the tagspaces core
- Icons moved to assets folder
- Datatable slimed down and move to perspectiveList
- CSS folder merged with assets folder
- Correcting selection issue
- Optimizations in the file opener/editor
- Added api call for closing current location
- Added handling of not existing folders
- Implementing location edit functionality
- Fixing filename refresh issue after renaming
- Adding bootstrap-editable to the project
- Fixing edit/save issues in file opener
- Increasing default font size html editor
- Adding bootstrap-editable to the project
- Fixing [#19](https://github.com/uggrock/tagspaces/issues/19) markdown viewer scrollbar
- Adding summernote as a default html editor library
- Added HTML templates to the project
- Zooming with mouse wheel added to the image viewer
- Panning and zooming added to the image viewer
- Adding touch events to the UI
- Removing the fading of the modals
- Disable directory deletion in the mozilla io API
- Adding support for audio, video and source code filetypes
- Improving the file create dialog
- Fixed sorting by size in perspectiveList
- Move tag to first position functionality implemented
- Adding check by renaming for the existence of the new path
- Improved adding of new tags in the setting. Minumum tag length is 3 characters
- Adding of many tags at once separated by comma
- [webkit] Fixing the huge horizontal scrollbar
- [android] Opening files on double tap now possible
- [android] Reading date and size file meta now supported
- [android, windows, linux, osx] Added support for natively opening of files
- [android] Recursive folder scanning now implemented in cordova

##TagSpaces 1.6.1528 / 2013.09.18

- Redesigning the new version notification dialog
- Hiding loading splashscreen after the layout initialization
- Font size of alert dialogs changed
- Corrected issue with jqueryeditinplace library
- Correcting the sort order of the dates
- Addded new mindmap visualization in the perspectiveGraph
- Editing of HTML files is now possible
- Added grouping by tag groups
- The file list is refreshed after tag color change
- Added some new vizualiazions to the perspectiveGraph
- Implemented check for a disabled localStorage
- Adding d3.js and underscore.js as a core libraries
- CSV export function moved to the perspective manager
- Better check for the similarity of the filepath implemented
- Smart tags added
- Changing perspective order now possible in the options
- Added a class for disabling the text selection
- Added custom scrollbars for webkit browsers
- Default perspective renamed to list
- Calendar perspective renamed to grid
- Footer shows found files count
- Set filter is now perspective specific
- Implementing search funcitonality in the perspective thumb
- Added grouping by day, month and year in the thumbPerspective
- Added warning for chrome users if TagSpaces has no access to local file URLs
- Tags are now colored in the fileopener
- Filter in default perspective has now a red icon if it is not empty
- New library fixing a bug preventing opening a directory selection dialog in linux on chrome
- [Firefox] Improving the firefox's toolbar button integration
- [Firefox] Issue in Firefox on OSX with renaming/taging of files now workarrounded
- [Chrome] TagSpaces opens automatically on first install in chrome
- [Chrome] New version of the npapi for chrome under windows integrated, supporting real file renaming and last modiefied date for files
- [Win32] Added win32 builder in the build.xml

##TagSpaces 1.5.1448 / 2013.08.11

- Numerous UI Improvements
- Added a new viewer for image files
- Added a basic functionality for changing the colors of tags
- The text in the search filter is now remembered accross the current session
- The thumb image status, the size/path columns and the sort status are now remembered for the current session
- It is now possible to change the position of the tag in the filename.
- Improvements in the parsing and displaying of file titles
- Improvements in displaying file sizes
- Added additional column for the file extension in default perspective
- A new created location is now automatically opened after its creation
- A location name is extracted from the directory path as a suggestion
- Enhancing tag suggestion with UI improvements and suggestions from the containing directory name
- A new created file is now automatically opened after its creation
- Adding the functionality to reload a opened file, which has been renamed/tagged
- Adding add a tag button to the current file in the file viewer menu
- Added reload current file functionality to the file viewer menu
- Fixed reloading tagspaces on cklicking enter in dialogs
- Added directory create functionality
- A new text editor extension created based on codemirror
- A new PDF viewer extension created for the node-webkit platform based on pdf.js
- [Chrome] Restricting renaming files larger than 5MB in chrome due a missing functionality in the API
- [Firefox] Added icon to firefox main menu
- [Firefox OSX] The firefox extension is currently not supporting OSX due a issue in the mozilla's XPCOM api preventing renaming of files. See [#11](https://github.com/uggrock/tagspaces/issues/11) for more details.   

##TagSpaces 1.4.1384 / 2013.06.16

- A bug fixed causing reloading of the addon in a bootstrap modal
- TagSpaces is not started anymore in firefox as pinned tab, due the possibility to have multiple instances of the addon simultaniously
- [Firefox] Startup/reloading issues in firefox resolved

##TagSpaces 1.4.1363 / 2013.06.04

- De/Selecting files functionality
- Added functionality for configuration of filetypes and perspectives
- Added options dialog with ability to change options like showing hidden files or checkign for new version
- Extension tag button added to the file opener toolbar
- Considering hidden directories in the directories navigator
- Directories look&feel enhanced
- Standard perspective loaded at first by default
- Welcoming font-awesome in the project
- Added follow on twitter button
- About and Setting buttons shifted to the options dropdown menu
- Added menu item for reporting issue in github
- Added menu item for contacting the developers per email
- Additional file actions shifted to a separate dropdown in file opener
- Taggroup position can be changed up and down
- Tags can now be moved with drag & drop between taggroups
- UI migrated to Bootstrap
- Added edit in place for the title of a opened file
- Standard perspective added, replacing basic and search perspectives
- Added thumbnail zooming functionality in the standard perspective
- Max dimension of thumbs changed to 100px
- Adding support of thumbnails in the standard perspective 
- Adding buttons in the standard perspective for toogling the tags and filedetails columns 
- Fixed a bug for reopening a file after applying some changes on it
- Added buttons in the file opener for getting the next and previous file in a perspective
- Added file details area in the file opener
- Added a button for toggling the file details
- Now is possible to create directories starting with digits
- Added a functionality for creating of taggroups
- Duplicating tagsgroup functionality disabled
- Added a functionality for checking if new version is available
- [Firefox] bugfix for listing directories with wrond enconding

##TagSpaces 1.3.1284 / 2013.03.29

- Added GTD as a default taggroup
- New welcome hint shown if new favorite directories exist.
- Add support for dropping of tags over the search entries
- Allowing adding multiple tags to multipe files
- Tag button created in files view
- Removing the focus from the edit button, after clicking on it
- Bug fixed in search view preventing from renaming and opening files from the context menu
- Tag suggestion working again.
- Fixed issue with no possible dropping of tags on a file with no tags
- Enabling drag&drop of files in tag & search views
- Closing a opened files after it is moved to a other directory
- Issue [#5](https://github.com/uggrock/tagspaces/issues/5) fixed (Opening of files in file view was broken)
- Information shown in the browser title improved
 
##TagSpaces 1.3.1235 / 2013.02.16

- File tagging now possible with drag & drop
- Search results visualization redesigned
- Resets the search filter by view change
- Added start here hint/tooltip
- Context menu for files and file titles unified
- Drag&Drop for moving files in directories implemented
- Added separate context menu for file extension
- Functionality for upgrading of the settings implemented
- Loading Animation now works while creating directory indexes
- Name of the current favorite folder shown in title of the tab/applicaition
- [Firefox] Adding creatingDirectoryTree to the mozilla io API

##TagSpaces 1.2.1200 / 2013.01.11

- Dynatree library removed from the project
- About.html updated
- Property for persisting of the extensionPath added to the default settings
- ViewerBrowser extension integrated in the core of the application
- New algorithm for the directory browsing implemented
- Buttons for switching the views are now aligned left.
- Icon of the toggleLeftPanel changed
- Loading animation now disappears (visibility: hidden instead of display: none)
- Directory sorting improved
- A new concept for directory navigation implemented
- All TagGroup are now opened by default
- First run detection implemented
- Added support for SVG files in the settings
- Tag visualization realization exchanged with modified jqueryui accordion
- Adding datepicker for editing date tags
- Setting white as a background color for fullscreen mode
- Tag suggestion functionality now splits the filename with space, comma, plus, underscore and score delimiters
- Integration of the jquery.dropdown library for context menus
- Fullscreen button implemented properly
- Added auto complete functionality to the add tag dialog.
- Displaying the build number as a label over the application version
- Added getAllTags function for extracting all plain tags from the settings
- [Firefox] Extensions folder could now be located outside the add-on's folder.
- [Firefox] TagSpaces icon/button is added on installation time automatically to the firefox's navigation bar
- [Firefox] Opening of a directory from the context menu implemented
- [Chrome] Allowing to load local files in chrome
- [Chrome] Fixed bug preventing saving of text files in chrome

##TagSpaces 1.1.1181 / 2012.12.23

- Optimizations in the loading mechanism
- jquery layout version exchanged
- [Fireofox] Exporting undate.rdf to the release folder of tagspaces.org repository
- Added custom css for MD-files rendering
- jquery-ui-custom library exchanged with the the developers version of it
- [Firefox] Extension will be automatically unzipped during the installation
- LICENSE file linked in the about box
- [Firefox] Added UI fuctionality for opening the parent folder of a file
- [Firefox] Added functionality for opening a directory, selecting a file and a directory from the file system