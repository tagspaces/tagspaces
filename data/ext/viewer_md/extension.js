//var MDEditor = { };

var mdconvertor = require(["ext/viewer_md/showdown/showdown"]);

// export
//if (typeof module !== 'undefined') module.exports = Showdown;

// stolen from AMD branch of underscore
// AMD define happens at the end for compatibility with AMD loaders
// that don't enforce next-turn semantics on modules.
if (typeof define === 'function' && define.amd) {
    define('mdviewer', function() {
        return mdconvertor;
    });
}