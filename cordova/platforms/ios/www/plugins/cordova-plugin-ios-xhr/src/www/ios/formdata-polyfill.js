cordova.define("cordova-plugin-ios-xhr.formdata-polyfill", function(require, exports, module) {
/*
 * Copyright (c) 2018 Oracle and/or its affiliates.
 *
 * The Universal Permissive License (UPL), Version 1.0
 *
 * Subject to the condition set forth below, permission is hereby granted to any person obtaining a copy of this
 * software, associated documentation and/or data (collectively the "Software"), free of charge and under any and
 * all copyright rights in the Software, and any and all patent rights owned or freely licensable by each
 * licensor hereunder covering either (i) the unmodified Software as contributed to or provided by such licensor,
 * or (ii) the Larger Works (as defined below), to deal in both
 *
 *
 * (a) the Software, and
 *
 * (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if one is included with the Software
 * (each a “Larger Work” to which the Software is contributed by such licensors),
 *
 * without restriction, including without limitation the rights to copy, create derivative works of, display,
 * perform, and distribute the Software and make, use, sell, offer for sale, import, export, have made, and
 * have sold the Software and the Larger Work(s), and to sublicense the foregoing rights on either these or other
 * terms.
 *
 * This license is subject to the following condition:
 *
 * The above copyright notice and either this complete permission notice or at a minimum a reference to the UPL
 * must be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

/*
 * Native Safari FormData only implements the append method. This polyfill is used in 
 * tandem with the xhr-polyfill.
 * 
 * Two additional functions in this FormData implementation:
 * 1) __getNative - returns the native Safari FormData object.
 * 2) __getRequestParts - returns a promise resolving an object {contentType:string, body:string}.
 */
'use strict';
(function ()
{
  function __FormData(formElement)
  {
    this._map = new Map();

    if (!HTMLFormElement.prototype.isPrototypeOf(formElement))
      return;

    var elements = formElement.elements;
    for (var i = 0; i < elements.length; i++)
    {
      var element = elements[i];

      var name = element.name ? element.name : element.id;
      if (!name)
        continue;

      if (element.type === 'file')
      {
        for (var file of element.files)
          this.append(name, file);
      }
      else if (['select-multiple', 'select-one'].indexOf(element.value) > -1)
      {
        for (var option of element.selectedOptions)
          this.append(name, option);
      }
      else if (['checkbox', 'radio'].indexOf(element.value) > -1 && element.checked)
      {
        this.append(name, element.value);
      }
      else
      {
        this.append(name, element.value);
      }
    }
  }

  if( 'Symbol' in window && typeof Symbol() === 'symbol'){
    Object.defineProperty( __FormData.prototype, Symbol.toStringTag, {
      get : function(){
        return 'FormData';
      }
    });
  }

  __FormData.prototype.get = function (name)
  {
    var values = this.getAll(name);

    if (values && values.length > 0)
      return values[0];
    else
      return undefined;
  };

  __FormData.prototype.getAll = function (name)
  {
    var map = this._map;
    var values = map.get(name);
    if (!values)
      values = [];

    return values;
  };

  __FormData.prototype.set = function (name, value, filename)
  {
    var map = this._map;

    if (value && Blob.prototype.isPrototypeOf(value))
    {
      if (!filename)
        filename = "Blob";

      Object.defineProperty(value, "name", {value: filename});
    }

    map.set(name, [value]);
  };


  __FormData.prototype.append = function (name, value, filename)
  {
    var map = this._map;
    var values = map.get(name);

    this.set(name, value, filename);
    if (values)
    {
      values.push(map.get(name)[0]);
      map.set(name, values);
    }
  };

  __FormData.prototype.delete = function (name)
  {
    var map = this._map;
    map.delete(name);
  };

  __FormData.prototype.has = function (name)
  {
    var map = this._map;
    return map.has(name);
  };

  __FormData.prototype.keys = function ()
  {
    var map = this._map;
    return map.keys();
  };

  __FormData.prototype.values = function ()
  {
    var map = this._map;
    var allvalues = [];

    var vit = map.values();
    var entry = vit.next();
    while (entry && !entry.done)
    {
      var values = entry.value;
      for (var i = 0; i < values.length; i++)
        allvalues.push(values[i]);

      entry = vit.next();
    }

    return __FormData._makeIterator(allvalues);
  };

  __FormData.prototype.entries = function ()
  {
    var map = this._map;
    var allentries = [];

    for (var key of map.keys())
    {
      var values = map.get(key);
      for (var i = 0; i < values.length; i++)
      {
        allentries.push([key, values[i]]);
      }
    }

    return __FormData._makeIterator(allentries);
  };
  
  __FormData.prototype.forEach = function(callback)
  {
    var eit = this.entries();
    var entry = eit.next();
    while(!entry.done)
    {
      callback.call(this, entry.value[1], entry.value[0], this);
      entry = eit.next();
    }  
  };

  __FormData.prototype.toString = function ()
  {
    return "[object FormData]";
  };

  __FormData.prototype.__getRequestParts = function ()
  {
    var promise = new Promise(function (resolve)
    {
      __FormData._getRequestValues(this.entries()).then(function (entries)
      {
        var parts = __FormData._getMultipartRequest(entries);
        
        resolve(parts);
      });
    }.bind(this));

    return promise;
  };

  __FormData.prototype.__getNative = function ()
  {
    var fd = new window._FormData();
    var eit = this.entries();
    var entry = eit.next();
    while (!entry.done)
    {
      if (entry.value[1] && Blob.prototype.isPrototypeOf(entry.value[1]))
        fd.append(entry.value[0], entry.value[1], entry.value[1].name);        
      else
        fd.append(entry.value[0], entry.value[1]);
    
      entry = eit.next();
    }

    return fd;
  };

  __FormData._getMultipartRequest = function (entries)
  {
    var boundary = "----cordovaPluginWkwebviewFileXhrFormdata" + Math.random().toString(32);
    var parts = {"contentType": "multipart/form-data; boundary=" + boundary, body: ""};
    var bodyEntries = [];

    for (var i = 0; i < entries.length; i++)
    {
      var entry = entries[i];
      for (var data of __FormData._generateMultipartFormData(entry, boundary)) 
        bodyEntries.push(data);
    }

    bodyEntries.push("--" + boundary + "--");
    parts.body = new Blob(bodyEntries, {type: "application/octet-stream"});
    
    return parts;
  };

  __FormData._makeIterator = function (array)
  {
    var i = 0;
    return {
      next: function ()
      {
        if (i < array.length)
          return {done: false, value: array[i++]};
        else
          return {done: true, value: undefined};
      }
    };
  };

  __FormData._getRequestValues = function (entriesIterator)
  {
    var promises = [];
    var entry = entriesIterator.next();
    while (!entry.done)
    {
      promises.push(__FormData._normalizeEntry(entry));
      entry = entriesIterator.next();
    }

    return Promise.all(promises);
  };

  __FormData._normalizeEntry = function (entry)
  {
    var promise = new Promise(function (resolve)
    {

      var name = entry.value[0];
      var value = entry.value[1];

      if (value &&
        (Blob.prototype.isPrototypeOf(value) ||
         File.prototype.isPrototypeOf(value)))
      {

        var filename = value.name;
        var type = value.type ? value.type : "application/octet-binary;";
        var reader = new FileReader();
        var resolve;

        reader.onload = function ()
        {
          resolve({name: name, value: reader.result, filename: filename, type: type});
        };

        reader.onerror = function ()
        {
          resolve({name: name, value: reader.error, filename: filename, type: type});
        };

        reader.readAsArrayBuffer(value);
      }
      else
      {
        promise = resolve({name: name, value: value});
      }
    });

    return promise;
  };

  __FormData._generateMultipartFormData = function (entry, boundary)
  {
    var data = [];

    data.push("--" + boundary + "\r\n");
    if (!entry['filename'])
    {
      data.push('content-disposition: form-data; name="');
      data.push(entry.name);
      data.push('"\r\n');
      data.push('\r\n');
      data.push(entry.value);
      data.push("\r\n");
    }
    else
    {
      // Describe it as form data
      data.push('content-disposition: form-data; name="');
      data.push(entry.name)
      data.push('"; filename="');
      data.push(entry.filename);
      data.push('"\r\n');
      data.push('Content-Type: ');
      data.push(entry.type);
      data.push('\r\n\r\n');
      data.push(entry.value);
      data.push('\r\n');
    }

    return data;
  };

  window._FormData = window.FormData;
  window.FormData = __FormData;
})();

});
