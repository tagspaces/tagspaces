/*
 * css! loader plugin
 * Allows for loading stylesheets with the 'css!' syntax.
 *
 * External stylesheets supported.
 * 
 * '!' suffix skips load checking
 *
 */
define(['./normalize'], function(normalize) {
  if (typeof window == 'undefined')
    return { load: function(n, r, load){ load() } };
  
  var head = document.getElementsByTagName('head')[0];
  
  
  /* XHR code - copied from RequireJS text plugin */
  var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];
  var get = function(url, callback, errback) {
  
    var xhr, i, progId;
    if (typeof XMLHttpRequest !== 'undefined')
      xhr = new XMLHttpRequest();
    else if (typeof ActiveXObject !== 'undefined')
      for (i = 0; i < 3; i += 1) {
        progId = progIds[i];
        try {
          xhr = new ActiveXObject(progId);
        }
        catch (e) {}
  
        if (xhr) {
          progIds = [progId];  // so faster next time
          break;
        }
      }
    
    xhr.open('GET', url, requirejs.inlineRequire ? false : true);
  
    xhr.onreadystatechange = function (evt) {
      var status, err;
      //Do not explicitly handle errors, those should be
      //visible via console output in the browser.
      if (xhr.readyState === 4) {
        status = xhr.status;
        if (status > 399 && status < 600) {
          //An http 4xx or 5xx error. Signal an error.
          err = new Error(url + ' HTTP status: ' + status);
          err.xhr = xhr;
          errback(err);
        }
        else
          callback(xhr.responseText);
      }
    };
    
    xhr.send(null);
  }
  
  //main api object
  var cssAPI = {};
  
  cssAPI.pluginBuilder = './css-builder';
  
  //<style> tag creation
  var stylesheet = document.createElement('style');
  stylesheet.type = 'text/css';
  head.appendChild(stylesheet);
  
  if (stylesheet.styleSheet)
    cssAPI.inject = function(css) {
      stylesheet.styleSheet.cssText += css;
    }
  else
    cssAPI.inject = function(css) {
      stylesheet.appendChild(document.createTextNode(css));
    }

  cssAPI.inspect = function() {
    if (stylesheet.styleSheet)
      return stylesheet.styleSheet.cssText;
    else if (stylesheet.innerHTML)
      return stylesheet.innerHTML;
  }
  
  var instantCallbacks = {};
  cssAPI.normalize = function(name, normalize) {
    var instantCallback;
    if (name.substr(name.length - 1, 1) == '!')
      instantCallback = true;
    if (instantCallback)
      name = name.substr(0, name.length - 1);
    if (name.substr(name.length - 4, 4) == '.css')
      name = name.substr(0, name.length - 4);
    
    name = normalize(name);
    
    if (instantCallback)
      instantCallbacks[name] = instantCallback;
    
    return name;
  }
  
  cssAPI.load = function(cssId, req, load, config, parse) {
    var instantCallback = instantCallbacks[cssId];
    if (instantCallback)
      delete instantCallbacks[cssId];
    
    var fileUrl = cssId;
    
    if (fileUrl.substr(fileUrl.length - 4, 4) != '.css' && !parse)
      fileUrl += '.css';
    
    fileUrl = req.toUrl(fileUrl);
    
    //external url -> add as a <link> tag to load. onload support not reliable so not provided
    if (fileUrl.substr(0, 7) == 'http://' || fileUrl.substr(0, 8) == 'https://') {
      if (parse)
        throw 'Cannot preprocess external css.';
      var link = document.createElement('link');
      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.href = fileUrl;
      head.appendChild(link);
      
      //only instant callback due to onload not being reliable
      load(cssAPI);
    }
    //internal url -> download and inject into <style> tag
    else {
      get(fileUrl, function(css) {
        if (parse)
          css = parse(css);
          
        var pathname = window.location.pathname.split('/');
        pathname.pop();
        pathname = pathname.join('/') + '/';

        //make file url absolute
        if (fileUrl.substr(0, 1) != '/')
          fileUrl = '/' + normalize.convertURIBase(fileUrl, pathname, '/');
        
        css = normalize(css, fileUrl, pathname);

        cssAPI.inject(css);
          
        if (!instantCallback)
          load(cssAPI);
      });
      if (instantCallback)
        load(cssAPI);
    }
  }
  
  return cssAPI;
});
