define(function(require, exports, module) {
  "use strict";

    var TSCORE = require("tscore");
    var extDir;
    var supportedFileTypesThumbs = ['jpg','jpeg','png','gif','bmp','svg'];
    var defaultThumnailPath;

    function initUI(dir) {
        extDir = dir;
        defaultThumnailPath = extDir + "/default.png";
    }

    function loadThumbnail(fileName) {

        var name = TSCORE.Utils.baseName(fileName);
        var res = null;
        TSCORE.metaFileList.forEach(function(element) {
            if(element.name.indexOf(name) >= 0) {
                res = element.path;
            }
        });

        return res;
    }

    function load(container, template, files) {
        var data = [];
        var compiledTemplate = Handlebars.compile(template);
        files.forEach(function(fileInfo) {
            var ext = fileInfo[TSCORE.fileListFILEEXT];
            
            if(supportedFileTypesThumbs.indexOf(ext) !== -1) {
                var filePath = fileInfo[TSCORE.fileListFILEPATH];    
                var doc = {
                    name: fileInfo[TSCORE.fileListFILENAME],
                    path:  encodeURI("file://" + filePath),
                    thumbnail:  encodeURI(defaultThumnailPath),
                    title: fileInfo[TSCORE.fileListTITLE]
                }

                var metaFilePath = TSCORE.Meta.findMetaFilebyPath(filePath, "png");
                if(metaFilePath) {
                    doc.thumbnail = encodeURI("file://" + metaFilePath);
                }
                /*var thumb = loadThumbnail(doc.path);
                if(thumb) {
                    doc.thumbnail = encodeURI("file://" + thumb);
                }*/
                data.push(doc);
            }
        });
        
        var html = compiledTemplate({data: data});
        container.append(html);
        initPhotoSwipeFromDOM('.my-gallery');
    }

    exports.initUI = initUI;
    exports.load = load;

    var initPhotoSwipeFromDOM = function(gallerySelector) {

        // parse slide data (url, title, size ...) from DOM elements 
        // (children of gallerySelector)
        var parseThumbnailElements = function(el) {
            var thumbElements = el.childNodes,
                numNodes = thumbElements.length,
                items = [],
                figureEl,
                linkEl,
                size,
                item;

            for(var i = 0; i < numNodes; i++) {

                figureEl = thumbElements[i]; // <figure> element

                // include only element nodes 
                if(figureEl.nodeType !== 1) {
                    continue;
                }

                linkEl = figureEl.children[0]; // <a> element

                size = [0,0]; //linkEl.getAttribute('data-size').split('x');

                // create slide object
                item = {
                    src: linkEl.getAttribute('href'),
                    w: parseInt(size[0], 10),
                    h: parseInt(size[1], 10)
                };
                
                if(figureEl.children.length > 1) {
                    // <figcaption> content
                    item.title = figureEl.children[1].innerHTML; 
                }

                if(linkEl.children.length > 0) {
                    // <img> thumbnail element, retrieving thumbnail url
                    item.msrc = linkEl.children[0].getAttribute('src');
                } 

                item.el = figureEl; // save link to element for getThumbBoundsFn
                items.push(item);
            }

            return items;
        };

        // find nearest parent element
        var closest = function closest(el, fn) {
            return el && ( fn(el) ? el : closest(el.parentNode, fn) );
        };

        // triggers when user clicks on thumbnail
        var onThumbnailsClick = function(e) {
            e = e || window.event;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;

            var eTarget = e.target || e.srcElement;

            // find root element of slide
            var clickedListItem = closest(eTarget, function(el) {
                return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
            });

            if(!clickedListItem) {
                return;
            }

            // find index of clicked item by looping through all child nodes
            // alternatively, you may define index via data- attribute
            var clickedGallery = clickedListItem.parentNode,
                childNodes = clickedListItem.parentNode.childNodes,
                numChildNodes = childNodes.length,
                nodeIndex = 0,
                index;

            for (var i = 0; i < numChildNodes; i++) {
                if(childNodes[i].nodeType !== 1) { 
                    continue; 
                }

                if(childNodes[i] === clickedListItem) {
                    index = nodeIndex;
                    break;
                }
                nodeIndex++;
            }

            if(index >= 0) {
                // open PhotoSwipe if valid index found
                openPhotoSwipe( index, clickedGallery );
            }
            return false;
        };

        var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
            var pswpElement = document.querySelectorAll('.pswp')[0],
                gallery, options;

            var items = parseThumbnailElements(galleryElement);

            options = {
                // define gallery index (for URL)
                galleryUID: galleryElement.getAttribute('data-pswp-uid'),

                getThumbBoundsFn: function(index) {
                    // See Options -> getThumbBoundsFn section of documentation for more info
                    var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                        pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                        rect = thumbnail.getBoundingClientRect(); 

                    return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
                },
                shareEl: false
            };

            options.index = parseInt(index, 10);

            // exit if index not found
            if( isNaN(options.index) ) {
                console.log("PhotoSwipe error: index not found");
                return;
            }

            if(disableAnimation) {
                options.showAnimationDuration = 0;
            }

             require([ 
                extDir + "/dist/photoswipe.js", 
                extDir + "/dist/photoswipe-ui-default.js", 
            ], function( PhotoSwipe, PhotoSwipeUI_Default ) {

                gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
                gallery.init();

                gallery.listen('imageLoadComplete', function(index, item) {

                    var img = new Image();
                    img.src = item.src;
                    item.w = img.width;
                    item.h = img.height;
                    gallery.updateSize(true);
                    img = undefined;
                });

            });
        };

        // loop through all gallery elements and bind events
        var galleryElements = document.querySelectorAll( gallerySelector );

        for(var i = 0, l = galleryElements.length; i < l; i++) {
            galleryElements[i].setAttribute('data-pswp-uid', i+1);
            galleryElements[i].onclick = onThumbnailsClick;
        }
    };
});