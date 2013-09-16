/* ***** BEGIN LICENSE BLOCK *****
 * Version: MIT/X11 License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Contributor(s):
 *   Nils Maier <MaierMan@web.de>
 *   Erik Vold <erikvvold@gmail.com>
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

/**
 * Decorate a function with a memoization wrapper, with a limited-size cache
 * to reduce peak memory utilization.
 *
 * The memoized function may have any number of arguments, but they must be
 * be serializable.  It's safest to use this only on functions that accept
 * primitives.
 *
 * A memoized function is not thread-safe, but so is JS,  nor re-entrant-safe!
 *
 * @usage var foo = Scriptish_memoize(function foo(arg1, arg2) { ... complex operation ... });
 * @param {Function} func The function to be memoized
 * @param {Number} limit Optional. Cache size (default: 100)
 * @param {Number} num_args Options. Number of arguments the function expects (default: func.length)
 * @return {Function} Memoized function
 */
exports.memoize = function memoize(func, limit, num_args) {
  limit = limit || 100;
  num_args = num_args || func.length;

  var cache = Object.create(null);
  var keylist = [];
  var args = [];
  var key, result;

  switch (num_args) {
  case 0:
    throw new Error("memoize does not support functions without arguments");
  case 1:
    return function memoize_one_arg(a) {
      key = a.toString();

      if (key in cache)
        return cache[key];

      result = func.call(null, a);
      cache[key] = result;
      if (keylist.push(key) > limit)
        delete cache[keylist.shift()];
      return result;
    };
  case 2:
    return function memoize_two_args(a, b) {
      args[0] = a; args[1] = b;
      key = JSON.stringify(args);
      args.length = 0;

      if (key in cache)
        return cache[key];

      var result = func.call(null, a, b);
      cache[key] = result;
      if (keylist.push(key) > limit)
        delete cache[keylist.shift()];
      return result;
    };
  case 3:
    return function memoize_three_args(a, b, c) {
      args[0] = a; args[1] = b; args[2] = c;
      key = JSON.stringify(args);
      args.length = 0;

      if (key in cache)
        return cache[key];

      var result = func.call(null, a, b, c);
      cache[key] = result;
      if (keylist.push(key) > limit)
        delete cache[keylist.shift()];
      return result;
    };

  case 4:
    return function memoize_four_args(a, b, c, d) {
      args[0] = a; args[1] = b; args[2] = c; args[3] = d;
      key = JSON.stringify(args);
      args.length = 0;

      if (key in cache)
        return cache[key];

      var result = func.call(null, a, b, c, d);
      cache[key] = result;
      if (keylist.push(key) > limit)
        delete cache[keylist.shift()];
      return result;
    };

  default:
    return function() {
      var key = JSON.stringify(arguments);
      if (key in cache)
        return cache[key];

      var result = func.apply(null, arguments);
      cache[key] = result;
      if (keylist.push(key) > limit)
        delete cache[keylist.shift()];
      return result;
    };
  }
}
