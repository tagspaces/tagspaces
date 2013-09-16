The `toolbarbutton` API provides a simple way to create
[toolbar buttons](https://developer.mozilla.org/en/XUL/toolbarbutton), which
can perform an action when clicked.

## Example ##

    // create toolbarbutton
    var tbb = require("toolbarbutton").ToolbarButton({
      id: "TBB-TEST",
      label: "TBB TEST",
      onCommand: function () {
        tbb.destroy(); // kills the toolbar button
      }
    });

    if (require('self').loadReason == "install") {
      tbb.moveTo({
        toolbarID: "nav-bar",
        forceMove: false // only move from palette
      });
    }

<api name="ToolbarButton">
@class

Module exports `ToolbarButton` constructor allowing users to create a
toolbar button.

<api name="ToolbarButton">
@constructor
Creates a toolbarbutton.

@param options {Object}
  Options for the toolbarbutton, with the following parameters:

@prop id {String}
A id for the toolbar button, this should be namespaced.

@prop label {String}
A label for the toolbar button.

@prop image {String}
A image url for the toolbar button.

@prop [onCommand] {Function}
 A option function that is invoked when the toolbar button is pressed.

@prop [panel] {Panel}
  A optional panel.
</api>

<api name="destroy">
@method
Removes the toolbar button from all open windows and no longer adds the
toolbar button to new windows.
</api>

<api name="moveTo">
@method
Moves the toolbar button on all open windows to the desired location.

@param options {Object}
Options which describe the position to move the toolbar button to, with the
following parameters:

@prop toolbarID {String}
The id of the toolbar which you want to add the toolbar button to.

Example toolbar IDs:

- **toolbar-menubar**: The menu bar.
- **nav-bar**: The navigation bar.
- **TabsToolbar**: The tabs bar.
- **addon-bar**: The addon bar.

@prop insertbefore {String}
The id of the element which the toolbar button should be inserted before.

@prop forceMove {Boolean}
If `forceMove` is `false`, then the move will only occur if the toolbar button
is not already being used. If `true`, then the move will happen no matter where
the toolbar button is.
</api>
</api>
