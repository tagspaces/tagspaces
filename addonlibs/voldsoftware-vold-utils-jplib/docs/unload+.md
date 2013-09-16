<!-- contributed by Erik Vold [erikvvold@gmail.com]  -->

The `unload+` module allows modules to register callbacks that are called
when they are unloaded, and associate unload functions to containers to have the
unloader automatically deleted when the container unloads.

<api name="unload">
@function
  Save callbacks to run when unloading in a unload queue. Optionally scope the
  callback to a container, e.g., window. Provide a way to run all the callbacks.

@param callback {function}
  A function to be called when the module unloads.
@param [container] {object}
  Optional container object; if the container "unloads" before the module
  unloads, then the associated callback is removed from the unload queue.
@returns {function}
  Returns a function which will allow one to remove the callback from the unload
  queue.
</api>
