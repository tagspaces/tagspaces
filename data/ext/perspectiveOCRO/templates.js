/* Copyright (c) 2014-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define, Handlebars  */

define(function(require, exports, module) {
    "use strict";

    console.log("Loading perspectiveOCRO templates");

    exports.mainToolBar = Handlebars.compile(
        '<div id="{{id}}MainToolbar" class="btn-toolbar">' +
            '<div class="btn-group">'+
                //'<button class="btn btn-link" data-i18n="[title]ns.perspectiveOCRO:toggleSelectAll" title="" id="{{id}}ToogleSelectAll"><i class="fa fa-square-o fa-lg fa-fw"></i></button>'+
                '<button class="btn btn-link" data-i18n="[title]ns.perspectiveOCRO:downloadTooltip" id="{{id}}DownloadButton"><i class="fa fa-download fa-lg"></i></button>'+
                '<button class="btn btn-link" data-i18n="[title]ns.perspectiveOCRO:reloadDirectoryTooltip" id="{{id}}ReloadFolderButton"><i class="fa fa-refresh fa-lg"></i></button>'+
                //'<button class="btn btn-link" data-i18n="[title]ns.perspectiveOCRO:showSubfolderContentTooltip" id="{{id}}IncludeSubDirsButton"><i class="fa fa-retweet fa-lg"></i></button>'+
                //'<button class="btn btn-link" data-i18n="[title]ns.perspectiveList:toggleThumbnailsTooltip" data-toggle="button" id="{{id}}ShowTmbButton"><i class="fa fa-picture-o fa-lg"></i></button>'+
                //'<button class="btn btn-link" data-i18n="[title]ns.perspectiveList:increasThumbnailsTooltip" id="{{id}}IncreaseThumbsButton"><i class="fa fa-search-plus fa-lg"></i></button>'+
            '</div>'+
            '<div class="btn-group pull-right col-xs-4" style="padding-right: 10px;">'+
                '<input type="search" name="Search" class="form-control " id="{{id}}searchBoxOC" placeholder="Search" data-i18n="[placeholder]ns.common:searchPlaceholder">'+
                //'<button class="btn btn-default" type="submit"><i class="glyphicon glyphicon-search"></i></button>'+
            '</div>'+
        '</div>'
    );

    exports.dialogOCSetting = Handlebars.compile(
        '<div class="modal" id="dialogOCSettings" tabindex="-1" role="dialog" aria-hidden="true">'+
            '<div class="modal-dialog">'+
                '<div class="modal-content">'+
                    '<div class="modal-header">'+
                        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"><i class="fa fa-timeshttps://developers.facebook.com/tools/debug/https://developers.facebook.com/tools/debug/ fa-lg"></i></button>'+
                        '<h4 class="modal-title" id="myModalLabel1" data-i18n="">Settings</h4>'+
                    '</div>'+
                    '<div class="modal-body">'+
                        '<iframe id="aboutIframe" nwdisable style="width: 100%; height: 350px; border: 0;" src="../../../index.php/settings/personal"></iframe>'+
                    '</div>'+
                    '<div class="modal-footer">'+
                        '<button class="btn btn-primary" data-dismiss="modal" title="Close Dialog" aria-hidden="true"><i class="fa fa-check fa-lg"></i></button>'+
                    '</div>'+
                '</div><!-- /.modal-content -->'+
            '</div><!-- /.modal-dialog -->'+
        '</div><!-- /.modal -->'
    );

    exports.fileTiles = Handlebars.compile(
        '<ol style="padding: 0; margin: 0;">'+
        '{{#each files}}'+
        '<li title="{{filepath}}" data-filepath="{{filepath}}" class="fileTile thumbnail">'+
            '<span><img class="thumbImgTile" data-filepath="{{filepath}}" src="{{tmbpath}}"></span>'+
            '<p class="titleInFileTile">{{title}}</p>' +
            '<span class="tagsInFileTile">'+
                '{{#each tags}}'+
                '<button class="btn btn-sm tagButton fileTagsTile" style="{{style}}">{{tag}} </button>'+
                '{{/each}}'+
            '</span>' +
            '<span class="fileExtTile">{{fileext}}</span>'+
            '<button class="btn btn-link fileTileSelector" data-filepath="{{filepath}}"><i class="fa fa-square-o"></i></button>' +
        '</li>'+
        '{{/each}}'+
        '</ol>'
    );

    exports.homeScreen;


});