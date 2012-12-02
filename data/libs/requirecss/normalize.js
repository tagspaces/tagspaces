/*
 * css.normalize.js
 *
 * CSS Normalization
 *
 * CSS paths are normalized based on an optional basePath and the RequireJS config
 *
 * Usage:
 *   normalize(css, fromBasePath, toBasePath);
 *
 * css: the stylesheet content to normalize
 * fromBasePath: the absolute base path of the css relative to any root (but without ../ backtracking)
 * toBasePath: the absolute new base path of the css relative to the same root
 * 
 * Absolute dependencies are left untouched.
 *
 * Urls in the CSS are picked up by regular expressions.
 * These will catch all statements of the form:
 *
 * url(*)
 * url('*')
 * url("*")
 * 
 * @import '*'
 * @import "*"
 *
 * (and so also @import url(*) variations)
 *
 * For urls needing normalization
 *
 */

define(['require', 'module'], function(require, module) {
  
  function convertURIBase(uri, fromBase, toBase) {
    // absolute urls are left in tact
    if (uri.match(/^\/|([^\:\/]*:)/))
      return uri;
    return relativeURI(absoluteURI(uri, fromBase), toBase);
  };
  
  // given a relative URI, calculate the absolute URI
  function absoluteURI(uri, base) {
    if (uri.substr(0, 2) == './')
      uri = uri.substr(2);    
    
    var baseParts = base.split('/');
    var uriParts = uri.split('/');
    
    baseParts.pop();
    
    while (curPart = uriParts.shift())
      if (curPart == '..')
        baseParts.pop();
      else
        baseParts.push(curPart);
    
    return baseParts.join('/');
  };


  // given an absolute URI, calculate the relative URI
  function relativeURI(uri, base) {
    
    // reduce base and uri strings to just their difference string
    var baseParts = base.split('/');
    baseParts.pop();
    base = baseParts.join('/') + '/';
    i = 0;
    while (base.substr(i, 1) == uri.substr(i, 1))
      i++;
    while (base.substr(i, 1) != '/')
      i--;
    base = base.substr(i + 1);
    uri = uri.substr(i + 1);

    // each base folder difference is thus a backtrack
    baseParts = base.split('/');
    var uriParts = uri.split('/');
    out = '';
    while (baseParts.shift())
      out += '../';
    
    // finally add uri parts
    while (curPart = uriParts.shift())
      out += curPart + '/';
    
    return out.substr(0, out.length - 1);
  };
  
  var normalizeCSS = function(source, fromBase, toBase) {
    
    var urlRegEx = /(url\(\s*"(.*)"\s*\))|(url\(\s*'(.*)'\s*\))|(url\(\s*(.*)\s*\))/g;
    var result, url, source;

    while (result = urlRegEx.exec(source)) {
      url = result[2] || result[4] || result[6];
      var newUrl = convertURIBase(url, fromBase, toBase);
      var quoteLen = result[2] || result[4] ? 1 : 0;
      source = source.substr(0, urlRegEx.lastIndex - url.length - quoteLen - 1) + newUrl + source.substr(urlRegEx.lastIndex - quoteLen - 1);
      urlRegEx.lastIndex = urlRegEx.lastIndex + (newUrl.length - url.length);
    }
    
    var importRegEx = /(@import\s*'(.*)')|(@import\s*"(.*)")/g;
    
    while (result = importRegEx.exec(source)) {
      url = result[2] || result[4];
      var newUrl = convertURIBase(url, fromBase, toBase);
      source = source.substr(0, importRegEx.lastIndex - url.length - 1) + newUrl + source.substr(importRegEx.lastIndex - 1);
      importRegEx.lastIndex = importRegEx.lastIndex + (newUrl.length - url.length);
    }
    
    return source;
  };
  
  normalizeCSS.convertURIBase = convertURIBase;
  
  return normalizeCSS;
});
