<!-- contributed by Erik Vold [erikvvold@gmail.com]  -->

The `listen` module allows modules to register listeners to elements that are
automatically removed when the module unloads.

<api name="listen">
@function
  Add listeners to run when unloading in a unload queue. Optionally scope the
  callback to a container, e.g., window. Provide a way to run all the callbacks.

@param container {object}
  A container for the node, which a "unload" event will be attached to, this is
  used to cancel the unload magic that would occur, to avoid memory leaks.
@param node {object}
  The node to listen to.
@param event {string}
  The event type, for example: "load", "click", ...
@param callback {function}
  A function to be called when the event occurs on the node.
@param [capture] {boolean}
  Indicates if the event should be captured. [See the `useCapture`
  documentation here](https://developer.mozilla.org/en/DOM/element.addEventListener).
</api>
