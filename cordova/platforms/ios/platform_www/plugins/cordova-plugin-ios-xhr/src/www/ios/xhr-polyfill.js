cordova.define("cordova-plugin-ios-xhr.xhr-polyfill", function(require, exports, module) {
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
'use strict';
(function ()
{


  var exec = require('cordova/exec');

  // Handles native file:// XHR GET requests
  function FileHandler(reqContext, config)
  {
    this._reqContext = reqContext;
    this._config = config;
  }

  FileHandler._getMimeType = function (reqContext)
  {
    if (reqContext.overrideMimeType)
      return reqContext.overrideMimeType;
    else if (reqContext.responseHeaders['content-type'])
      return reqContext.responseHeaders['content-type'];

    var url = reqContext.url;
    var ext = url.substr(url.lastIndexOf('.'));
    return FileHandler._EXT_TO_MIME[ext] ? FileHandler._EXT_TO_MIME[ext] : "";
  };

  FileHandler.getHandlerForResponseType = function (reqContext)
  {
    var responseType = reqContext.responseType;
    if (FileHandler._RESPONSE_HANDLERS[responseType])
      return FileHandler._RESPONSE_HANDLERS[responseType];
    else
      return FileHandler._RESPONSE_HANDLERS["text"];
  };

  FileHandler._EXT_TO_MIME = {
    ".img": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".xml": "application/xml",
    ".xsl": "application/xml",
    ".html": "text/html",
    ".htm": "text/html",
    ".svg": "image/svg+xml",
    ".svgz": "image/svg+xml",
    ".json": "application/json",
    ".js": "application/javascript"
  };

  FileHandler._RESPONSE_HANDLERS =
    {
      "text":
        {
          action: "readAsText",
          properties: ["response", "responseText"],
          convert: function (mimeType, r)
          {
            this._size = r["length"];
            return r;
          },
          responseSize: function ()
          {
            return isNaN(this._size) ? 0 : this._size;
          }
        },
      "arraybuffer":
        {
          action: "readAsArrayBuffer",
          properties: ["response"],
          convert: function (mimeType, r)
          {
            this._size = r["byteLength"];
            return r;
          },
          responseSize: function ()
          {
            return isNaN(this._size) ? 0 : this._size;
          }
        },
      "json":
        {
          action: "readAsText",
          properties: ["response"],
          convert: function (mimeType, r)
          {
            this._size = r["length"];
            try
            {
              r = JSON.parse(r);
            }
            catch (e)
            {
            }

            return r;
          },
          responseSize: function ()
          {
            return isNaN(this._size) ? 0 : this._size;
          }
        },
      "document":
        {
          action: "readAsText",
          properties: ["response", "responseXML"],
          convert: function (mimeType, r)
          {
            this._size = r["length"];
            try
            {
              r = new DOMParser().parseFromString(r, "text/xml");
            }
            catch (e)
            {
            }
            return r;
          },
          responseSize: function ()
          {
            return isNaN(this._size) ? 0 : this._size;
          }
        },
      "blob":
        {
          action: "readAsArrayBuffer",
          properties: ["response"],
          convert: function (mimeType, r)
          {
            var blob = new Blob([r], {"type": mimeType});
            this._size = blob.size;
            return blob;
          },
          responseSize: function ()
          {
            return isNaN(this._size) ? 0 : this._size;
          }
        }
    };

  FileHandler.prototype._isTraceLoggingEnabled = function ()
  {
    return this._config["NativeXHRLogging"] === "full";
  };

  FileHandler._presend = function (reqContext)
  {
    reqContext.dispatchReadyStateChangeEvent(1);  // OPEN
    reqContext.dispatchProgressEvent("loadstart");
    // no upload events for a GET
  };

  FileHandler._error = function (reqContext, e)
  {
    if (this._isTraceLoggingEnabled())
      console.log("xhr-polyfill.js - native file XHR Response: Unable to find file %o\n%o", reqContext.url, e);

    reqContext.status = 404;
    reqContext.responseText = "File Not Found";

    reqContext.dispatchReadyStateChangeEvent(2); // HEADERS_RECIEVED
    reqContext.dispatchReadyStateChangeEvent(3); // LOADING
    reqContext.dispatchProgressEvent("progress");

    reqContext.dispatchReadyStateChangeEvent(4); // DONE
    reqContext.dispatchProgressEvent("error");
    reqContext.dispatchProgressEvent("loadend");
  };

  FileHandler._success = function (reqContext, rspTypeHandler, result)
  {
    if (this._isTraceLoggingEnabled())
      console.log("xhr-polyfill.js - native file XHR Response:\n%o\n", reqContext.url, result);

    var mimeType = FileHandler._getMimeType(reqContext);
    var convertedResult = rspTypeHandler.convert(mimeType, result);

    var respSize = rspTypeHandler.responseSize();
    for (var i = 0; i < rspTypeHandler.properties.length; i++)
      reqContext[rspTypeHandler.properties[i]] = convertedResult;

    reqContext.status = 200;
    reqContext.statusText = "OK";
    reqContext.responseURL = reqContext.url;

    reqContext.dispatchReadyStateChangeEvent(2); // HEADERS_RECIEVED
    reqContext.dispatchReadyStateChangeEvent(3); // LOADING
    reqContext.dispatchProgressEvent("progress", respSize);
    reqContext.dispatchReadyStateChangeEvent(4); // DONE
    reqContext.dispatchProgressEvent("load", respSize);
    reqContext.dispatchProgressEvent("loadend", respSize);
  };

  FileHandler.prototype.send = function ()
  {
    var reqContext = this._reqContext;
    var rspTypeHandler = FileHandler.getHandlerForResponseType(reqContext);

    if (this._isTraceLoggingEnabled())
      console.log("xhr-polyfill.js - native file XHR Request:\n%o", reqContext.url);

    FileHandler._presend(reqContext);

    exec(FileHandler._success.bind(this, reqContext, rspTypeHandler),
      FileHandler._error.bind(this, reqContext),
      "CDVWKWebViewFileXhr", rspTypeHandler.action, [reqContext.url]);
  };

  // handles http and https native XHR requests
  function HttpHandler(reqContext, config)
  {
    this._reqContext = reqContext;
    this._config = config;
  }

  HttpHandler._generateId = function ()
  {
    return [performance.now().toString(16), Math.random().toString(16)].join("-");  // FortifyFalsePositive
  };

  HttpHandler._convertTextToBinaryBase64String = function(mimeType, text)
  {
    var blob = new Blob([text], {type: mimeType});
    var reader = new FileReader();
    var promise = new Promise(function (resolve, reject)
    {
      reader.onload = function ()
      {
        var base64str = btoa(reader.result);
        resolve(base64str);
      };
      reader.onerror = function ()
      {
        var base64str = btoa(reader.error);
        reject(base64str);
      };
    });

    reader.readAsBinaryString(blob);

    return promise;
  };

  HttpHandler._REQUEST_HANDLERS =
    {
      "": {
        convert: function (reqContext)
        {
          return Promise.resolve(null);
        }
      },
      "ArrayBuffer": {
        convert: function (reqContext)
        {
          var body = reqContext.requestData;

          var type = reqContext.requestHeaders['content-type'];
          if (!type)
            type = reqContext.requestHeaders['content-type'] = "application/octet-binary;";

          var blob = new Blob([body], {type: type});
          var reader = new FileReader();
          var promise = new Promise(function (resolve, reject)
          {
            reader.onload = function ()
            {
              var base64str = btoa(reader.result);
              resolve(base64str);
            };
            reader.onerror = function ()
            {
              var base64str = btoa(reader.error);
              reject(base64str);
            };
          });

          reader.readAsBinaryString(blob);

          return promise;
        }
      },
      "FormData": {
        convert: function (reqContext)
        {
          var body = reqContext.requestData;
          var promise = new Promise(function (resolve, reject)
          {
            var contentType = reqContext.requestHeaders["content-type"];

            // FormData polyfill - request the body and context-type
            body.__getRequestParts().then(function (parts)
            {
              if (!contentType)
                reqContext.requestHeaders["content-type"] = parts.contentType;

              var reader = new FileReader();
              reader.onload = function ()
              {
                var base64str = btoa(reader.result);
                resolve(base64str);
              };
              reader.onerror = function ()
              {
                var base64str = btoa(reader.error);
                reject(base64str);
              };

              reader.readAsBinaryString(parts.body);
            });
          });

          return promise;
        }
      },
      "Blob": {
        convert: function (reqContext)
        {
          if (!reqContext.requestHeaders["content-type"])
            reqContext.requestHeaders["content-type"] = "application/octet-binary;";

          var body = reqContext.requestData;
          var reader = new FileReader();
          var promise = new Promise(function (resolve, reject)
          {
            reader.onload = function ()
            {
              var base64str = btoa(reader.result);
              resolve(base64str);
            };
            reader.onerror = function ()
            {
              var base64str = btoa(reader.error);
              reject(base64str);
            };
          });

          reader.readAsBinaryString(body);

          return promise;
        }
      },
      "string": {
        convert: function (reqContext)
        {
          if (!reqContext.requestHeaders["content-type"])
            reqContext.requestHeaders["content-type"] = "text/plain;";

          var body = reqContext.requestData;
          var mimeType = reqContext.requestHeaders["content-type"];
          return HttpHandler._convertTextToBinaryBase64String(mimeType, body);
        }
      },
      "Object": {
        convert: function (reqContext)
        {
          if (!reqContext.requestHeaders["content-type"])
            reqContext.requestHeaders["content-type"] = "application/json;";

          var body = JSON.stringify(reqContext.requestData);
          var mimeType = reqContext.requestHeaders["content-type"];
          return HttpHandler._convertTextToBinaryBase64String(mimeType, body);
        }
      },
      "Document": {
        convert: function (reqContext)
        {
          if (!reqContext.requestHeaders["content-type"])
            reqContext.requestHeaders["content-type"] = "application/xhtml+xml;";

          var body = reqContext.requestData;
          var serializer = new XMLSerializer();
          var body = serializer.serializeToString(body);
          var mimeType = reqContext.requestHeaders["content-type"];
          return HttpHandler._convertTextToBinaryBase64String(mimeType, body);
        }
      }
    };

  HttpHandler._convertEncode64StringToText = function(mimeType, encoding, r)
  {
    var binaryString = atob(r);
    var byteNumbers = new Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++)
      byteNumbers[i] = binaryString.charCodeAt(i);

    var byteArray = new Uint8Array(byteNumbers);

    var blob = new Blob([byteArray], {type: mimeType});

    var reader = new FileReader();
    var promise = new Promise(function (resolve, reject)
    {
      reader.onload = function ()
      {

        resolve(reader.result);
      };
      reader.onerror = function ()
      {
        reject(reader.error);
      };
    });

    reader.readAsText(blob, encoding);
    return promise;
  };

  HttpHandler._convertEncode64StringToArrayBuffer = function (mimeType, encoding, r)
  {
    var binaryString = atob(r);
    var byteNumbers = new Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++)
      byteNumbers[i] = binaryString.charCodeAt(i);

    var byteArray = new Uint8Array(byteNumbers);

    var blob = new Blob([byteArray], {type: mimeType});
    var reader = new FileReader();
    var promise = new Promise(function (resolve, reject)
    {
      reader.onload = function ()
      {

        resolve(reader.result);
      };
      reader.onerror = function ()
      {
        reject(reader.error);
      };
    });
    reader.readAsArrayBuffer(blob);
    return promise;
  };

  HttpHandler._RESPONSE_HANDLERS = {
    "text": {
      convert: HttpHandler._convertEncode64StringToText
    },
    "arraybuffer": {
      convert: HttpHandler._convertEncode64StringToArrayBuffer
    },
    "blob": {
      convert: HttpHandler._convertEncode64StringToArrayBuffer
    },
    "json": {
      convert: HttpHandler._convertEncode64StringToText
    },
    "document": {
      convert: HttpHandler._convertEncode64StringToText
    }
  };

  HttpHandler._UNDERLYING_ERROR_CODES = {
    NSURLErrorUnknown: -1,
    NSURLErrorCancelled: -999,
    NSURLErrorBadURL: -1000,
    NSURLErrorTimedOut: -1001,
    NSURLErrorUnsupportedURL: -1002,
    NSURLErrorCannotFindHost: -1003,
    NSURLErrorCannotConnectToHost: -1004,
    NSURLErrorNetworkConnectionLost: -1005,
    NSURLErrorDNSLookupFailed: -1006,
    NSURLErrorHTTPTooManyRedirects: -1007,
    NSURLErrorResourceUnavailable: -1008,
    NSURLErrorNotConnectedToInternet: -1009,
    NSURLErrorRedirectToNonExistentLocation: -1010,
    NSURLErrorBadServerResponse: -1011,
    NSURLErrorUserCancelledAuthentication: -1012,
    NSURLErrorUserAuthenticationRequired: -1013,
    NSURLErrorZeroByteResource: -1014,
    NSURLErrorCannotDecodeRawData: -1015,
    NSURLErrorCannotDecodeContentData: -1016,
    NSURLErrorCannotParseResponse: -1017,
    NSURLErrorAppTransportSecurityRequiresSecureConnection: -1022,
    NSURLErrorFileDoesNotExist: -1100,
    NSURLErrorFileIsDirectory: -1101,
    NSURLErrorNoPermissionsToReadFile: -1102,
    NSURLErrorDataLengthExceedsMaximum: -1103,
    NSURLErrorFileOutsideSafeArea: -1104,
    NSURLErrorSecureConnectionFailed: -1200,
    NSURLErrorServerCertificateHasBadDate: -1201,
    NSURLErrorServerCertificateUntrusted: -1202,
    NSURLErrorServerCertificateHasUnknownRoot: -1203,
    NSURLErrorServerCertificateNotYetValid: -1204,
    NSURLErrorClientCertificateRejected: -1205,
    NSURLErrorClientCertificateRequired: -1206,
    NSURLErrorCannotLoadFromNetwork: -2000,
    NSURLErrorCannotCreateFile: -3000,
    NSURLErrorCannotOpenFile: -3001,
    NSURLErrorCannotCloseFile: -3002,
    NSURLErrorCannotWriteToFile: -3003,
    NSURLErrorCannotRemoveFile: -3004,
    NSURLErrorCannotMoveFile: -3005,
    NSURLErrorDownloadDecodingFailedMidStream: -3006,
    NSURLErrorDownloadDecodingFailedToComplete: -3007,
    NSURLErrorInternationalRoamingOff: -1018,
    NSURLErrorCallIsActive: -1019,
    NSURLErrorDataNotAllowed: -1020,
    NSURLErrorRequestBodyStreamExhausted: -1021,
    NSURLErrorBackgroundSessionRequiresSharedContainer: -995,
    NSURLErrorBackgroundSessionInUseByAnotherProcess: -996,
    NSURLErrorBackgroundSessionWasDisconnected: -997
  };

  HttpHandler._getHandlerForRequestBodyType = function (reqContext)
  {
    var body = reqContext.requestData;
    if (!body)
      return HttpHandler._REQUEST_HANDLERS[""];
    else if (typeof body === "string")
      return HttpHandler._REQUEST_HANDLERS["string"];
    else if (Blob.prototype.isPrototypeOf(body))
      return HttpHandler._REQUEST_HANDLERS["Blob"];
    else if (FormData.prototype.isPrototypeOf(body))
      return HttpHandler._REQUEST_HANDLERS["FormData"];
    else if (ArrayBuffer.prototype.isPrototypeOf(body) ||
      body.buffer)
      return HttpHandler._REQUEST_HANDLERS["ArrayBuffer"];
    else if (Document.prototype.isPrototypeOf(body))
      return HttpHandler._REQUEST_HANDLERS["Document"];
    else
      return HttpHandler._REQUEST_HANDLERS["Object"];
  };

  HttpHandler._getHandlerForResponseType = function (reqContext)
  {
    var responseType = reqContext.responseType;
    if (HttpHandler._RESPONSE_HANDLERS[responseType])
      return HttpHandler._RESPONSE_HANDLERS[responseType];
    else
      return HttpHandler._RESPONSE_HANDLERS["text"];
  };

  HttpHandler.prototype._isTraceLoggingEnabled = function ()
  {
    return this._config["NativeXHRLogging"] === "full";
  };

  HttpHandler._resolveUri = function (uri)
  {
    if (uri.indexOf("://") > -1)
      return uri;

    var resolver = document.createElement("a");
    document.body.appendChild(resolver);
    resolver.href = uri;
    var absoluteUri = resolver.href;
    resolver.parentNode.removeChild(resolver);
    return absoluteUri;
  };

  HttpHandler.prototype.send = function ()
  {
    var reqContext = this._reqContext;
    var id = HttpHandler._generateId();

    if (reqContext.user && reqContext.password)
    {
      var token = [reqContext.user, reqContext.password].join(":");
      reqContext.requestHeaders["authorization"] = ["Basic", btoa(token)].join(" ");
    }

    window.__nativeXHRResponseQueue.set(id, this);

    var handler = HttpHandler._getHandlerForRequestBodyType(reqContext);
    handler.convert(reqContext).then(function (bodyAsBase64String)
    {
      var requestDataSize = bodyAsBase64String ? bodyAsBase64String.length : 0;
      reqContext.requestData = undefined;

      var timeoutInSecs = (isNaN(reqContext.timeout) ? undefined : (reqContext.timeout / 1000));

      var reqPayLoad = {id: id, callback: "nativeXHRResponse",
        url: HttpHandler._resolveUri(reqContext.url), method: reqContext.method,
        headers: reqContext.requestHeaders,
        body: bodyAsBase64String, timeout: timeoutInSecs};

      if (this._isTraceLoggingEnabled())
        console.log("xhr-polyfill.js - native XHR Request:\n %o", reqPayLoad);

      HttpHandler._presend(reqContext, requestDataSize);

      window.webkit.messageHandlers.nativeXHR.postMessage(reqPayLoad);
    }.bind(this)).catch(HttpHandler._error.bind(this, reqContext));
  };

  HttpHandler._presend = function (reqContext, requestDataSize)
  {
    reqContext.dispatchReadyStateChangeEvent(1); // OPEN
    reqContext.dispatchProgressEvent("loadstart");

    // simulate upload progress events
    reqContext.dispatchUploadProgressEvent("loadstart");
    reqContext.dispatchUploadProgressEvent("progress", requestDataSize);
    reqContext.dispatchUploadProgressEvent("load", requestDataSize);
    reqContext.dispatchUploadProgressEvent("loadend", requestDataSize);
  };

  HttpHandler._success = function (reqContext, payload, mimeType, result)
  {
    var rspTypeHandler = FileHandler.getHandlerForResponseType(reqContext);
    var convertedResult = rspTypeHandler.convert(mimeType, result);

    // normalize header keys to lower case.
    var responseHeaders = payload.response.allHeaderFields;
    var normalizedHeaders = {};
    var keys = Object.keys(responseHeaders);
    for (var i = 0; i < keys.length; i++)
    {
      var key = keys[i];
      normalizedHeaders[key.toLowerCase()] = responseHeaders[key];
    }

    reqContext.responseHeaders = normalizedHeaders;

    reqContext.responseURL = payload.response.url;
    reqContext.status = payload.response.statusCode;
    reqContext.statusText = payload.response.localizedStatusCode;

    for (var i = 0; i < rspTypeHandler.properties.length; i++)
      reqContext[rspTypeHandler.properties[i]] = convertedResult;

    var respSize = rspTypeHandler.responseSize();

    reqContext.dispatchReadyStateChangeEvent(2); //HEADERS_RECIEVED
    reqContext.dispatchReadyStateChangeEvent(3); //LOADING
    reqContext.dispatchProgressEvent("progress", respSize);
    reqContext.dispatchReadyStateChangeEvent(4); //DONE

    reqContext.dispatchProgressEvent("load", respSize);
    reqContext.dispatchProgressEvent("loadend", respSize);
  };

  HttpHandler._error = function (reqContext, error, underlyingErrorCode)
  {
    var isTimeout = (HttpHandler._UNDERLYING_ERROR_CODES.NSURLErrorTimedOut === underlyingErrorCode);

    if (isTimeout)
    {
      reqContext.status = 0;
      reqContext.statusText = reqContext.responseText = null;
    }
    else
    {
      reqContext.status = 400;
      reqContext.statusText = "Bad Request";
      reqContext.responseText = error;
    }

    reqContext.dispatchReadyStateChangeEvent(2); //HEADERS_RECIEVED
    reqContext.dispatchReadyStateChangeEvent(3); //LOADING
    reqContext.dispatchProgressEvent("progress");
    reqContext.dispatchReadyStateChangeEvent(4); //DONE

    if (isTimeout)
      reqContext.dispatchProgressEvent("timeout");
    else
      reqContext.dispatchProgressEvent("error");

    reqContext.dispatchProgressEvent("loadend");
  };


  HttpHandler.prototype.load = function (payload)
  {
    var reqContext = this._reqContext;

    if (this._isTraceLoggingEnabled())
      console.log("xhr-polyfill.js - native XHR Response:\n%o", payload);

    if (payload.error)
      HttpHandler._error(reqContext, payload.error, payload['underlyingErrorCode']);
    else
    {
      var handler = HttpHandler._getHandlerForResponseType(reqContext);
      var mimeType = payload.response.mimeType;
      if (reqContext.overrideMimeType)      // look for overrideMimeType
        mimeType = reqContext.overrideMimeType;
      else if (payload.response.allHeaderFields && payload.response.allHeaderFields["content-type"])
        mimeType = payload.response.allHeaderFields["content-type"];

      var encoding = payload.response.textEncodingName ? payload.response.textEncodingName : "UTF-8";

      handler.convert(mimeType, encoding, payload.data).then(HttpHandler._success.bind(this,
        reqContext, payload, mimeType));
    }
  };

  window.__nativeXHRResponseQueue = new Map();
  window.nativeXHRResponse = function (id, payload)
  {
    try
    {
      var handler = window.__nativeXHRResponseQueue.get(id);
      payload["id"] = id;
      handler.load(payload);
    }
    catch (e)
    {
      console.log("xhr-polyfill.js - exception delivering request %o\n%o", id, e);
    }
    finally
    {
      window.__nativeXHRResponseQueue.delete(id);
    }
  };

  // sends the request using JS native XMLHttpRequest
  function DelegateHandler(reqContext, config)
  {
    this._reqContext = reqContext;
    this._reqContext.delegate = new window._XMLHttpRequest();
    this._config = config;
  }

  DelegateHandler._FROM_PROPERTIES = ["response", "responseText", "responseXML", "responseURL",
    "status", "statusText"];

  DelegateHandler._TO_PROPERTIES = ["responseType", "timeout", "withCredentials"];

  DelegateHandler._parseResponseHeaders = function (delegate, toHeaders)
  {
    var fromHeaders = delegate.getAllResponseHeaders().split(/\r?\n/);
    for (var i = 0; i < fromHeaders.length; i++)
    {
      var tokens = fromHeaders[i];
      var n = tokens.indexOf(": ");
      if (n > -1)
      {
        var key = tokens.substr(0, n).toLowerCase();
        var value = tokens.substr(n + 2);
        toHeaders[key] = value;
      }
    }
  };

  DelegateHandler._progressEventRelay = function (reqContext, event)
  {
    var respSize = isNaN(event.totalSize) ? 0 : event.totalSize;
    reqContext.dispatchProgressEvent(event.type, respSize);
  };

  DelegateHandler._uploadProgressEventRelay = function (reqContext, event)
  {
    var respSize = isNaN(event.totalSize) ? 0 : event.totalSize;
    reqContext.dispatchUploadProgressEvent(event.type, respSize);
  };

  DelegateHandler._readystatechangeEventRelay = function (reqContext, delegate, event)
  {

    if (delegate.readyState > 1)  // readyState gt HEADERS_RECIEVED
    {
      if (Object.keys(reqContext.responseHeaders).length === 0)
        DelegateHandler._parseResponseHeaders(delegate, reqContext.responseHeaders);

      for (var i = 0; i < DelegateHandler._FROM_PROPERTIES.length; i++)
      {
        try
        {
          reqContext[DelegateHandler._FROM_PROPERTIES[i]] = delegate[DelegateHandler._FROM_PROPERTIES[i]];
        }
        catch (e)
        {
        }
      }

      reqContext.dispatchReadyStateChangeEvent(delegate.readyState);
    }
  };

  DelegateHandler.prototype.send = function ()
  {
    var reqContext = this._reqContext;
    var delegate = reqContext.delegate;

    delegate.onreadystatechange = DelegateHandler._readystatechangeEventRelay.bind(delegate,
      reqContext, delegate);
    ["ontimeout", "onloadstart", "onprogress", "onabort", "onerror", "onload",
      "onloadend"].forEach(function (eventType)
    {
      delegate[eventType] = DelegateHandler._progressEventRelay.bind(delegate, reqContext);
      delegate.upload[eventType] = DelegateHandler._uploadProgressEventRelay.bind(delegate,
        reqContext);
    });

    if (reqContext.overrideMimeType)
      delegate.overrideMimeType(reqContext.overrideMimeType);

    delegate.open(reqContext.method, reqContext.url, reqContext.async, reqContext.user,
      reqContext.password);

    for (var i = 0; i < DelegateHandler._TO_PROPERTIES.length; i++)
      delegate[DelegateHandler._TO_PROPERTIES[i]] = reqContext[DelegateHandler._TO_PROPERTIES[i]];

    var keys = Object.keys(reqContext.requestHeaders);
    for (var i = 0; i < keys.length; i++)
      delegate.setRequestHeader(keys[i], reqContext.requestHeaders[keys[i]]);

    var requestData = reqContext.requestData;
    reqContext.requestData = undefined;

    // returns a native FormData from the plugin's polyfill
    if (FormData.prototype.isPrototypeOf(requestData))
      requestData = requestData.__getNative();

    delegate.send(requestData);
  };

  function HandlerFactory()
  {
  }

  HandlerFactory._getConfig = function ()
  {
    var promise;
    if (HandlerFactory._config)
    {
      promise = Promise.resolve(HandlerFactory._config);
    }
    else
    {
      promise = new Promise(function (done)
      {
        function success(result)
        {
          HandlerFactory._config = result;
          done(HandlerFactory._config);
        }

        function error()
        {
          HandlerFactory._config = {"InterceptRemoteRequests": "secureOnly",
            "NativeXHRLogging": "none"};
          done(HandlerFactory._config);
        }

        exec(success, error, "CDVWKWebViewFileXhr", "getConfig", []);
      });

    }

    return promise;
  };

  HandlerFactory.getHandler = function (context)
  {
    var promise = new Promise(function (resolve)
    {
      HandlerFactory._getConfig().then(function (config)
      {
        var interceptRemoteRequests = config["InterceptRemoteRequests"];

        if (context.interceptRemoteRequests)           // backdoor to override per instance
          interceptRemoteRequests = context.interceptRemoteRequests;

        if ("GET" === context.method && typeof context.url === "string" &&
          ((context.url.indexOf("://") === -1 && window.location.protocol === "file:") ||
           (context.url.toLowerCase().startsWith("file://"))))
        {
          resolve(new FileHandler(context, config));
        }
        else
        {
          if ("all" === interceptRemoteRequests ||
             ("secureOnly" === interceptRemoteRequests && context.url.startsWith("https://")))
            resolve(new HttpHandler(context, config));
          else
            resolve(new DelegateHandler(context, config));
        }
      });
    });

    return promise;
  };

  function _XMLHttpRequestUpload()
  {
    this._context = {"listeners": {}};
  }

  _XMLHttpRequestUpload.prototype.removeEventListener = function (type, listener)
  {
    var listeners = this._context.listeners;
    if (!listener)
      listeners[type] = [];
    else
    {
      var lset = listeners[type] ? listeners[type] : [];
      var i = lset.indexOf(listener);
      if (i > -1)
        lset.splice(i, 1);
    }
  };

  _XMLHttpRequestUpload.prototype.addEventListener = function (type, listener)
  {
    if (!listener)
      return;

    var listeners = this._context.listeners;
    var lset = listeners[type];
    if (!lset)
      lset = listeners[type] = [];

    if (lset.indexOf(listeners) < 0)
      lset.push(listener);
  };

  _XMLHttpRequestUpload.prototype.dispatchEvent = function (event)
  {
    if (!event)
      return;

    var type = event.type;
    var listeners = this._context.listeners;
    var lset = listeners[type] ? listeners[type] : [];

    // call property listeners
    var listener = this._context[["on", type].join("")];
    if (listener)
    {
      try
      {
        listener.call(this, event);
      }
      catch (e)
      {
        console.log("xhr-polyfill.js - exception delivering upload event %o\n%o", event, e);
      }
    }
  };

  /** @type {?} */
  window._XMLHttpRequest = window.XMLHttpRequest;
  window.XMLHttpRequest = function ()
  {
    this._context = {delegate: null, requestHeaders: {}, responseHeaders: {},
      listeners: {}, readyState: 0, responseType: "text", withCredentials: false,
      upload: new _XMLHttpRequestUpload(), status: 0};

    this._context.dispatchProgressEvent = function (req, type, respSize)
    {
      if (isNaN(respSize))
        respSize = 0;

      var event = document.createEvent("Event");
      event.initEvent(type, false, false);
      ["total", "totalSize", "loaded", "position"].forEach(function (propName)
      {
        Object.defineProperty(event, propName, {value: respSize});
      });
      Object.defineProperty(event, "lengthComputable", {value: respSize === 0 ? false : true});

      req.dispatchEvent(event);
    }.bind(this._context, this);

    this._context.dispatchReadyStateChangeEvent = function (req, readyState)
    {
      var event = document.createEvent("Event");
      event.initEvent("readystatechange", false, false);

      this.readyState = readyState;
      req.dispatchEvent(event);
    }.bind(this._context, this);

    this._context.dispatchUploadProgressEvent = function (type, reqSize)
    {
      // no body sent on a GET request
      if (this.method === "GET")
        return;

      if (isNaN(reqSize))
        reqSize = 0;

      var event = document.createEvent("Event");
      event.initEvent(type, false, false);
      ["total", "totalSize", "loaded", "position"].forEach(function (propName)
      {
        Object.defineProperty(event, propName, {value: reqSize});
      });
      Object.defineProperty(event, "lengthComputable", {value: reqSize === 0 ? false : true});

      this.upload.dispatchEvent(event);
    }.bind(this._context);
  };


  // define readonly const properties
  ["UNSENT", "OPENED", "HEADERS_RECIEVED", "LOADING", "DONE"].forEach(function (propName, i)
  {
    Object.defineProperty(window.XMLHttpRequest.prototype, propName,
      {
        "get": function ()
        {
          return i;
        }
      });
  });

  // define readonly properties.
  ["readyState", "response", "responseText", "responseURL", "responseXML",
    "status", "statusText", "upload"].forEach(function (propName)
  {
    Object.defineProperty(window.XMLHttpRequest.prototype, propName,
      {
        "get": function ()
        {
          return this._context[propName];
        }
      });
  });

// define read/write properties
  ["responseType", "timeout", "withCredentials"].forEach(function (propName)
  {
    Object.defineProperty(window.XMLHttpRequest.prototype, propName,
      {
        "get": function ()
        {
          return this._context[propName];
        },
        "set": function (value)
        {
          this._context[propName] = value;
        }
      });
  });

  // define read/write readychange event listener properties
  Object.defineProperty(window.XMLHttpRequest.prototype, "onreadystatechange",
    {
      "get": function ()
      {
        return this._context["onreadystatechange"];
      },
      "set": function (value)
      {
        if (typeof value === "function")
          this._context["onreadystatechange"] = value;
      }
    });

  // define read/write event progress listener properties
  ["ontimeout", "onloadstart", "onprogress", "onabort", "onerror", "onload", "onloadend"].forEach(
    function (propName)
    {
      Object.defineProperty(window.XMLHttpRequest.prototype, propName,
        {
          "get": function ()
          {
            return this._context[propName];
          },
          "set": function (value)
          {
            if (typeof value === "function")
              this._context[propName] = value;
          }
        });

      Object.defineProperty(_XMLHttpRequestUpload.prototype, propName,
        {
          "get": function ()
          {
            return this._context[propName];
          },
          "set": function (value)
          {
            if (typeof value === "function")
              this._context[propName] = value;
          }
        });
    });

  window.XMLHttpRequest.prototype.setRequestHeader = function (header, value)
  {
    // normalize value pair to strings
    header = String(header).toLowerCase();;
    value = String(value);
    this._context.requestHeaders[header] = value;
  };

  window.XMLHttpRequest.prototype.abort = function ()
  {
    if (this._context["delegate"])
      this._context.delegate.abort();
  };

  window.XMLHttpRequest.prototype.getResponseHeader = function (name)
  {
    name = name.toLowerCase();
    return this._context.responseHeaders[name];
  };

  window.XMLHttpRequest.prototype.overrideMimeType = function (mimetype)
  {
    return this._context.overrideMimeType = mimetype;
  };

  window.XMLHttpRequest.prototype.getAllResponseHeaders = function ()
  {
    var responseHeaders = this._context.responseHeaders;
    var names = Object.keys(responseHeaders);
    var list = [];
    for (var i = 0; i < names.length; i++)
      list.push([names[i], responseHeaders[names[i]]].join(":"));

    return list.join("\n");
  };

  window.XMLHttpRequest.prototype.removeEventListener = function (type, listener)
  {
    var listeners = this._context.listeners;
    if (!listener)
      listeners[type] = [];
    else
    {
      var lset = listeners[type] ? listeners[type] : [];
      var i = lset.indexOf(listener);
      if (i > -1)
        lset.splice(i, 1);
    }
  };

  window.XMLHttpRequest.prototype.addEventListener = function (type, listener)
  {
    if (!listener)
      return;

    var listeners = this._context.listeners;
    var lset = listeners[type];
    if (!lset)
      lset = listeners[type] = [];

    if (lset.indexOf(listeners) < 0)
      lset.push(listener);
  };

  window.XMLHttpRequest.prototype.dispatchEvent = function (event)
  {
    if (!event)
      return;

    var type = event.type;
    var listeners = this._context.listeners;
    var lset = listeners[type] ? listeners[type] : [];

    // call property listeners
    var listener = this._context[["on", type].join("")];
    if (listener)
    {
      try
      {
        listener.call(this, event);
      }
      catch (e)
      {
        console.log("xhr-polyfill.js - exception delivering event %o\n%o", event, e);
      }
    }

    // call listeners registered via addEventListener
    for (var i = 0; i < lset.length; i++)
    {
      listener = lset[i];
      if (listener)
      {
        try
        {
          listener.call(this, event);
        }
        catch (e)
        {
          console.log("xhr-polyfill.js - exception delivering event %o\n%o", event, e);
        }
      }
    }
  };

  window.XMLHttpRequest.prototype.open = function (method, url, async, user, password)
  {
    this._context.method = !method ? "GET" : method.toUpperCase();  // FortifyFalsePositive
    this._context.url = url;
    this._context.async = async === undefined ? true : async;
    this._context.user = user;
    this._context.password = password;
  };

  window.XMLHttpRequest.prototype.send = function (data)
  {
    if ("GET" !== this._context.method && "HEAD" !== this._context.method)
      this._context.requestData = data;

    HandlerFactory.getHandler(this._context).then(function (handler)
    {
      handler.send();
    });
  };

  /**
   * Override plugin config settings per request instance for the "InterceptRemoteRequests"
   * config param.
   *
   * @param {string} value enumerations are: "all", "secureOnly", "none".
   */
  window.XMLHttpRequest.prototype.__setInterceptRemoteRequests = function (value)
  {
    if (["all", "secureOnly", "none"].indexOf(value) > -1)
    {
      this._context.interceptRemoteRequests = value;
    }
  };

})();

});
