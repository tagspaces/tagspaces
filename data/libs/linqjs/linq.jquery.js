// extension for jQuery

(function (root) {
    if (root.Enumerable == null) {
        throw new Error("can't find Enumerable. linq.jquery.js must load after linq.js");
    }
    if (root.jQuery == null) {
        throw new Error("can't find jQuery. linq.jquery.js must load after jQuery");
    }

    var Enumerable = root.Enumerable;
    var $ = root.jQuery;

    $.fn.toEnumerable = function () {
        /// <summary>each contains elements. to Enumerable&lt;jQuery&gt;.</summary>
        return Enumerable.from(this).select(function (e) { return $(e) });
    };

    Enumerable.prototype.tojQuery = function () {
        /// <summary>Enumerable to jQuery. All elements add to blank jQuery object.</summary>
        return this.aggregate($(), function (j, x) { return j.add(x); });
    };

    Enumerable.prototype.tojQueryAsArray = function () {
        /// <summary>Enumerable to jQuery. This behavior is $(this.toArray()).</summary>
        return $(this.toArray());
    };
})(this);