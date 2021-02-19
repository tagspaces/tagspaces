cordova.define("cordova-plugin-camera.CameraPopoverHandle", function(require, exports, module) {
/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var exec = require('cordova/exec');

/**
 * @namespace navigator
 */

/**
 * A handle to an image picker popover.
 *
 * __Supported Platforms__
 *
 * - iOS
 *
 * @example
 * navigator.camera.getPicture(onSuccess, onFail,
 * {
 *     destinationType: Camera.DestinationType.FILE_URI,
 *     sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
 *     popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY, 300, 600)
 * });
 *
 * // Reposition the popover if the orientation changes.
 * window.onorientationchange = function() {
 *     var cameraPopoverHandle = new CameraPopoverHandle();
 *     var cameraPopoverOptions = new CameraPopoverOptions(0, 0, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY, 400, 500);
 *     cameraPopoverHandle.setPosition(cameraPopoverOptions);
 * }
 * @module CameraPopoverHandle
 */
var CameraPopoverHandle = function () {
    /**
     * Can be used to reposition the image selection dialog,
     * for example, when the device orientation changes.
     * @memberof CameraPopoverHandle
     * @instance
     * @method setPosition
     * @param {module:CameraPopoverOptions} popoverOptions
     */
    this.setPosition = function (popoverOptions) {
        var args = [popoverOptions];
        exec(null, null, 'Camera', 'repositionPopover', args);
    };
};

module.exports = CameraPopoverHandle;

});
