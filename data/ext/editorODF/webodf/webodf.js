// Input 0
/*


 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
var core={},gui={},xmldom={},odf={},ops={};
// Input 1
function Runtime(){}Runtime.ByteArray=function(e){};Runtime.prototype.getVariable=function(e){};Runtime.prototype.toJson=function(e){};Runtime.prototype.fromJson=function(e){};Runtime.ByteArray.prototype.slice=function(e,k){};Runtime.ByteArray.prototype.length=0;Runtime.prototype.byteArrayFromArray=function(e){};Runtime.prototype.byteArrayFromString=function(e,k){};Runtime.prototype.byteArrayToString=function(e,k){};Runtime.prototype.concatByteArrays=function(e,k){};
Runtime.prototype.read=function(e,k,l,p){};Runtime.prototype.readFile=function(e,k,l){};Runtime.prototype.readFileSync=function(e,k){};Runtime.prototype.loadXML=function(e,k){};Runtime.prototype.writeFile=function(e,k,l){};Runtime.prototype.isFile=function(e,k){};Runtime.prototype.getFileSize=function(e,k){};Runtime.prototype.deleteFile=function(e,k){};Runtime.prototype.log=function(e,k){};Runtime.prototype.setTimeout=function(e,k){};Runtime.prototype.libraryPaths=function(){};
Runtime.prototype.type=function(){};Runtime.prototype.getDOMImplementation=function(){};Runtime.prototype.parseXML=function(e){};Runtime.prototype.getWindow=function(){};Runtime.prototype.assert=function(e,k,l){};var IS_COMPILED_CODE=!0;
Runtime.byteArrayToString=function(e,k){function l(h){var b="",f,d=h.length;for(f=0;f<d;f+=1)b+=String.fromCharCode(h[f]&255);return b}function p(h){var b="",f,d=h.length,a,n,q,g;for(f=0;f<d;f+=1)a=h[f],128>a?b+=String.fromCharCode(a):(f+=1,n=h[f],194<=a&&224>a?b+=String.fromCharCode((a&31)<<6|n&63):(f+=1,q=h[f],224<=a&&240>a?b+=String.fromCharCode((a&15)<<12|(n&63)<<6|q&63):(f+=1,g=h[f],240<=a&&245>a&&(a=(a&7)<<18|(n&63)<<12|(q&63)<<6|g&63,a-=65536,b+=String.fromCharCode((a>>10)+55296,(a&1023)+56320)))));
return b}var r;"utf8"===k?r=p(e):("binary"!==k&&this.log("Unsupported encoding: "+k),r=l(e));return r};Runtime.getVariable=function(e){try{return eval(e)}catch(k){}};Runtime.toJson=function(e){return JSON.stringify(e)};Runtime.fromJson=function(e){return JSON.parse(e)};Runtime.getFunctionName=function(e){return void 0===e.name?(e=/function\s+(\w+)/.exec(e))&&e[1]:e.name};
function BrowserRuntime(e){function k(h,b){var f,d,a;void 0!==b?a=h:b=h;e?(d=e.ownerDocument,a&&(f=d.createElement("span"),f.className=a,f.appendChild(d.createTextNode(a)),e.appendChild(f),e.appendChild(d.createTextNode(" "))),f=d.createElement("span"),0<b.length&&"<"===b[0]?f.innerHTML=b:f.appendChild(d.createTextNode(b)),e.appendChild(f),e.appendChild(d.createElement("br"))):console&&console.log(b);"alert"===a&&alert(b)}var l=this,p={},r=window.ArrayBuffer&&window.Uint8Array;r&&(Uint8Array.prototype.slice=
function(h,b){void 0===b&&(void 0===h&&(h=0),b=this.length);var f=this.subarray(h,b),d,a;b-=h;d=new Uint8Array(new ArrayBuffer(b));for(a=0;a<b;a+=1)d[a]=f[a];return d});this.ByteArray=r?function(h){return new Uint8Array(new ArrayBuffer(h))}:function(h){var b=[];b.length=h;return b};this.concatByteArrays=r?function(h,b){var f,d=h.length,a=b.length,n=new this.ByteArray(d+a);for(f=0;f<d;f+=1)n[f]=h[f];for(f=0;f<a;f+=1)n[f+d]=b[f];return n}:function(h,b){return h.concat(b)};this.byteArrayFromArray=function(h){return h.slice()};
this.byteArrayFromString=function(h,b){var f;if("utf8"===b){f=h.length;var d,a,n,q=0;for(a=0;a<f;a+=1)n=h.charCodeAt(a),q+=1+(128<n)+(2048<n);d=new l.ByteArray(q);for(a=q=0;a<f;a+=1)n=h.charCodeAt(a),128>n?(d[q]=n,q+=1):2048>n?(d[q]=192|n>>>6,d[q+1]=128|n&63,q+=2):(d[q]=224|n>>>12&15,d[q+1]=128|n>>>6&63,d[q+2]=128|n&63,q+=3)}else for("binary"!==b&&l.log("unknown encoding: "+b),f=h.length,d=new l.ByteArray(f),a=0;a<f;a+=1)d[a]=h.charCodeAt(a)&255;return f=d};this.byteArrayToString=Runtime.byteArrayToString;
this.getVariable=Runtime.getVariable;this.fromJson=Runtime.fromJson;this.toJson=Runtime.toJson;this.readFile=function(h,b,f){function d(){var q;4===a.readyState&&(0!==a.status||a.responseText?200===a.status||0===a.status?(q="binary"===b?null!==a.responseBody&&"undefined"!==String(typeof VBArray)?(new VBArray(a.responseBody)).toArray():l.byteArrayFromString(a.responseText,"binary"):a.responseText,p[h]=q,f(null,q)):f(a.responseText||a.statusText):f("File "+h+" is empty."))}if(p.hasOwnProperty(h))f(null,
p[h]);else{var a=new XMLHttpRequest;a.open("GET",h,!0);a.onreadystatechange=d;a.overrideMimeType&&("binary"!==b?a.overrideMimeType("text/plain; charset="+b):a.overrideMimeType("text/plain; charset=x-user-defined"));try{a.send(null)}catch(n){f(n.message)}}};this.read=function(h,b,f,d){function a(){var a;4===n.readyState&&(0!==n.status||n.responseText?200===n.status||0===n.status?(n.response?(a=n.response,a=new Uint8Array(a)):a=null!==n.responseBody&&"undefined"!==String(typeof VBArray)?(new VBArray(n.responseBody)).toArray():
l.byteArrayFromString(n.responseText,"binary"),p[h]=a,d(null,a.slice(b,b+f))):d(n.responseText||n.statusText):d("File "+h+" is empty."))}if(p.hasOwnProperty(h))d(null,p[h].slice(b,b+f));else{var n=new XMLHttpRequest;n.open("GET",h,!0);n.onreadystatechange=a;n.overrideMimeType&&n.overrideMimeType("text/plain; charset=x-user-defined");n.responseType="arraybuffer";try{n.send(null)}catch(q){d(q.message)}}};this.readFileSync=function(h,b){var f=new XMLHttpRequest,d;f.open("GET",h,!1);f.overrideMimeType&&
("binary"!==b?f.overrideMimeType("text/plain; charset="+b):f.overrideMimeType("text/plain; charset=x-user-defined"));try{if(f.send(null),200===f.status||0===f.status)d=f.responseText}catch(a){}return d};this.writeFile=function(h,b,f){p[h]=b;var d=new XMLHttpRequest;d.open("PUT",h,!0);d.onreadystatechange=function(){4===d.readyState&&(0!==d.status||d.responseText?200<=d.status&&300>d.status||0===d.status?f(null):f("Status "+String(d.status)+": "+d.responseText||d.statusText):f("File "+h+" is empty."))};
b=b.buffer&&!d.sendAsBinary?b.buffer:l.byteArrayToString(b,"binary");try{d.sendAsBinary?d.sendAsBinary(b):d.send(b)}catch(a){l.log("HUH? "+a+" "+b),f(a.message)}};this.deleteFile=function(h,b){delete p[h];var f=new XMLHttpRequest;f.open("DELETE",h,!0);f.onreadystatechange=function(){4===f.readyState&&(200>f.status&&300<=f.status?b(f.responseText):b(null))};f.send(null)};this.loadXML=function(h,b){var f=new XMLHttpRequest;f.open("GET",h,!0);f.overrideMimeType&&f.overrideMimeType("text/xml");f.onreadystatechange=
function(){4===f.readyState&&(0!==f.status||f.responseText?200===f.status||0===f.status?b(null,f.responseXML):b(f.responseText):b("File "+h+" is empty."))};try{f.send(null)}catch(d){b(d.message)}};this.isFile=function(h,b){l.getFileSize(h,function(f){b(-1!==f)})};this.getFileSize=function(h,b){var f=new XMLHttpRequest;f.open("HEAD",h,!0);f.onreadystatechange=function(){if(4===f.readyState){var d=f.getResponseHeader("Content-Length");d?b(parseInt(d,10)):b(-1)}};f.send(null)};this.log=k;this.assert=
function(h,b,f){if(!h)throw k("alert","ASSERTION FAILED:\n"+b),f&&f(),b;};this.setTimeout=function(h,b){setTimeout(function(){h()},b)};this.libraryPaths=function(){return["lib"]};this.setCurrentDirectory=function(h){};this.type=function(){return"BrowserRuntime"};this.getDOMImplementation=function(){return window.document.implementation};this.parseXML=function(h){return(new DOMParser).parseFromString(h,"text/xml")};this.exit=function(h){k("Calling exit with code "+String(h)+", but exit() is not implemented.")};
this.getWindow=function(){return window};this.getNetwork=function(){var h=this.getVariable("now");return void 0===h?{networkStatus:"unavailable"}:h}}
function NodeJSRuntime(){function e(b,d,a){b=p.resolve(r,b);"binary"!==d?l.readFile(b,d,a):l.readFile(b,null,a)}var k=this,l=require("fs"),p=require("path"),r="",h,b;this.ByteArray=function(b){return new Buffer(b)};this.byteArrayFromArray=function(b){var d=new Buffer(b.length),a,n=b.length;for(a=0;a<n;a+=1)d[a]=b[a];return d};this.concatByteArrays=function(b,d){var a=new Buffer(b.length+d.length);b.copy(a,0,0);d.copy(a,b.length,0);return a};this.byteArrayFromString=function(b,d){return new Buffer(b,
d)};this.byteArrayToString=function(b,d){return b.toString(d)};this.getVariable=Runtime.getVariable;this.fromJson=Runtime.fromJson;this.toJson=Runtime.toJson;this.readFile=e;this.loadXML=function(b,d){e(b,"utf-8",function(a,b){if(a)return d(a);d(null,k.parseXML(b))})};this.writeFile=function(b,d,a){b=p.resolve(r,b);l.writeFile(b,d,"binary",function(b){a(b||null)})};this.deleteFile=function(b,d){b=p.resolve(r,b);l.unlink(b,d)};this.read=function(b,d,a,n){b=p.resolve(r,b);l.open(b,"r+",666,function(b,
g){if(b)n(b);else{var c=new Buffer(a);l.read(g,c,0,a,d,function(a,b){l.close(g);n(a,c)})}})};this.readFileSync=function(b,d){return d?"binary"===d?l.readFileSync(b,null):l.readFileSync(b,d):""};this.isFile=function(b,d){b=p.resolve(r,b);l.stat(b,function(a,b){d(!a&&b.isFile())})};this.getFileSize=function(b,d){b=p.resolve(r,b);l.stat(b,function(a,b){a?d(-1):d(b.size)})};this.log=function(b,d){var a;void 0!==d?a=b:d=b;"alert"===a&&process.stderr.write("\n!!!!! ALERT !!!!!\n");process.stderr.write(d+
"\n");"alert"===a&&process.stderr.write("!!!!! ALERT !!!!!\n")};this.assert=function(b,d,a){b||(process.stderr.write("ASSERTION FAILED: "+d),a&&a())};this.setTimeout=function(b,d){setTimeout(function(){b()},d)};this.libraryPaths=function(){return[__dirname]};this.setCurrentDirectory=function(b){r=b};this.currentDirectory=function(){return r};this.type=function(){return"NodeJSRuntime"};this.getDOMImplementation=function(){return b};this.parseXML=function(b){return h.parseFromString(b,"text/xml")};
this.exit=process.exit;this.getWindow=function(){return null};this.getNetwork=function(){return{networkStatus:"unavailable"}};h=new (require("xmldom").DOMParser);b=k.parseXML("<a/>").implementation}
function RhinoRuntime(){function e(b,f){var d;void 0!==f?d=b:f=b;"alert"===d&&print("\n!!!!! ALERT !!!!!");print(f);"alert"===d&&print("!!!!! ALERT !!!!!")}var k=this,l=Packages.javax.xml.parsers.DocumentBuilderFactory.newInstance(),p,r,h="";l.setValidating(!1);l.setNamespaceAware(!0);l.setExpandEntityReferences(!1);l.setSchema(null);r=Packages.org.xml.sax.EntityResolver({resolveEntity:function(b,f){var d=new Packages.java.io.FileReader(f);return new Packages.org.xml.sax.InputSource(d)}});p=l.newDocumentBuilder();
p.setEntityResolver(r);this.ByteArray=function(b){return[b]};this.byteArrayFromArray=function(b){return b};this.byteArrayFromString=function(b,f){var d=[],a,n=b.length;for(a=0;a<n;a+=1)d[a]=b.charCodeAt(a)&255;return d};this.byteArrayToString=Runtime.byteArrayToString;this.getVariable=Runtime.getVariable;this.fromJson=Runtime.fromJson;this.toJson=Runtime.toJson;this.concatByteArrays=function(b,f){return b.concat(f)};this.loadXML=function(b,f){var d=new Packages.java.io.File(b),a;try{a=p.parse(d)}catch(n){print(n);
f(n);return}f(null,a)};this.readFile=function(b,f,d){h&&(b=h+"/"+b);var a=new Packages.java.io.File(b),n="binary"===f?"latin1":f;a.isFile()?(b=readFile(b,n),"binary"===f&&(b=k.byteArrayFromString(b,"binary")),d(null,b)):d(b+" is not a file.")};this.writeFile=function(b,f,d){h&&(b=h+"/"+b);b=new Packages.java.io.FileOutputStream(b);var a,n=f.length;for(a=0;a<n;a+=1)b.write(f[a]);b.close();d(null)};this.deleteFile=function(b,f){h&&(b=h+"/"+b);(new Packages.java.io.File(b))["delete"]()?f(null):f("Could not delete "+
b)};this.read=function(b,f,d,a){h&&(b=h+"/"+b);var n;n=b;var q="binary";(new Packages.java.io.File(n)).isFile()?("binary"===q&&(q="latin1"),n=readFile(n,q)):n=null;n?a(null,this.byteArrayFromString(n.substring(f,f+d),"binary")):a("Cannot read "+b)};this.readFileSync=function(b,f){return f?readFile(b,f):""};this.isFile=function(b,f){h&&(b=h+"/"+b);var d=new Packages.java.io.File(b);f(d.isFile())};this.getFileSize=function(b,f){h&&(b=h+"/"+b);var d=new Packages.java.io.File(b);f(d.length())};this.log=
e;this.assert=function(b,f,d){b||(e("alert","ASSERTION FAILED: "+f),d&&d())};this.setTimeout=function(b,f){b()};this.libraryPaths=function(){return["lib"]};this.setCurrentDirectory=function(b){h=b};this.currentDirectory=function(){return h};this.type=function(){return"RhinoRuntime"};this.getDOMImplementation=function(){return p.getDOMImplementation()};this.parseXML=function(b){return p.parse(b)};this.exit=quit;this.getWindow=function(){return null};this.getNetwork=function(){return{networkStatus:"unavailable"}}}
var runtime=function(){return"undefined"!==String(typeof window)?new BrowserRuntime(window.document.getElementById("logoutput")):"undefined"!==String(typeof require)?new NodeJSRuntime:new RhinoRuntime}();
(function(){function e(e){var k=e[0],h;h=eval("if (typeof "+k+" === 'undefined') {eval('"+k+" = {};');}"+k);for(k=1;k<e.length-1;k+=1)h=h.hasOwnProperty(e[k])?h[e[k]]:h[e[k]]={};return h[e[e.length-1]]}var k={},l={};runtime.loadClass=function(p){function r(b){b=b.replace(/\./g,"/")+".js";var a=runtime.libraryPaths(),n,q,g;runtime.currentDirectory&&a.push(runtime.currentDirectory());for(n=0;n<a.length;n+=1){q=a[n];if(!l.hasOwnProperty(q))try{g=runtime.readFileSync(a[n]+"/manifest.js","utf8"),l[q]=
g&&g.length?eval(g):null}catch(c){l[q]=null,runtime.log("Cannot load manifest for "+q+".")}g=null;if((q=l[q])&&q.indexOf&&-1!==q.indexOf(b))return a[n]+"/"+b}return null}function h(b){var a,n;n=r(b);if(!n)throw b+" is not listed in any manifest.js.";try{a=runtime.readFileSync(n,"utf8")}catch(q){throw runtime.log("Error loading "+b+" "+q),q;}if(void 0===a)throw"Cannot load class "+b;a=a+("\n//# sourceURL="+n)+("\n//@ sourceURL="+n);try{a=eval(b+" = eval(code);")}catch(g){throw runtime.log("Error loading "+
b+" "+g),g;}return a}if(!IS_COMPILED_CODE&&!k.hasOwnProperty(p)){var b=p.split("."),f;f=e(b);if(!f&&(f=h(p),!f||Runtime.getFunctionName(f)!==b[b.length-1]))throw runtime.log("Loaded code is not for "+b[b.length-1]),"Loaded code is not for "+b[b.length-1];k[p]=!0}}})();
(function(e){function k(e){if(e.length){var k=e[0];runtime.readFile(k,"utf8",function(r,h){function b(){var a;(a=eval(d))&&runtime.exit(a)}var f="";runtime.libraryPaths();var d=h;-1!==k.indexOf("/")&&(f=k.substring(0,k.indexOf("/")));runtime.setCurrentDirectory(f);r||null===d?(runtime.log(r),runtime.exit(1)):b.apply(null,e)})}}e=e?Array.prototype.slice.call(e):[];"NodeJSRuntime"===runtime.type()?k(process.argv.slice(2)):"RhinoRuntime"===runtime.type()?k(e):k(e.slice(1))})("undefined"!==String(typeof arguments)&&
arguments);
// Input 2
core.Base64=function(){function e(a){var c=[],b,m=a.length;for(b=0;b<m;b+=1)c[b]=a.charCodeAt(b)&255;return c}function k(a){var c,b="",m,g=a.length-2;for(m=0;m<g;m+=3)c=a[m]<<16|a[m+1]<<8|a[m+2],b+=u[c>>>18],b+=u[c>>>12&63],b+=u[c>>>6&63],b+=u[c&63];m===g+1?(c=a[m]<<4,b+=u[c>>>6],b+=u[c&63],b+="=="):m===g&&(c=a[m]<<10|a[m+1]<<2,b+=u[c>>>12],b+=u[c>>>6&63],b+=u[c&63],b+="=");return b}function l(a){a=a.replace(/[^A-Za-z0-9+\/]+/g,"");var b=[],c=a.length%4,m,g=a.length,q;for(m=0;m<g;m+=4)q=(t[a.charAt(m)]||
0)<<18|(t[a.charAt(m+1)]||0)<<12|(t[a.charAt(m+2)]||0)<<6|(t[a.charAt(m+3)]||0),b.push(q>>16,q>>8&255,q&255);b.length-=[0,0,2,1][c];return b}function p(a){var b=[],c,m=a.length,g;for(c=0;c<m;c+=1)g=a[c],128>g?b.push(g):2048>g?b.push(192|g>>>6,128|g&63):b.push(224|g>>>12&15,128|g>>>6&63,128|g&63);return b}function r(a){var b=[],c,m=a.length,g,q,s;for(c=0;c<m;c+=1)g=a[c],128>g?b.push(g):(c+=1,q=a[c],224>g?b.push((g&31)<<6|q&63):(c+=1,s=a[c],b.push((g&15)<<12|(q&63)<<6|s&63)));return b}function h(a){return k(e(a))}
function b(a){return String.fromCharCode.apply(String,l(a))}function f(a){return r(e(a))}function d(a){a=r(a);for(var c="",b=0;b<a.length;)c+=String.fromCharCode.apply(String,a.slice(b,b+45E3)),b+=45E3;return c}function a(a,b,c){var m="",g,q,s;for(s=b;s<c;s+=1)b=a.charCodeAt(s)&255,128>b?m+=String.fromCharCode(b):(s+=1,g=a.charCodeAt(s)&255,224>b?m+=String.fromCharCode((b&31)<<6|g&63):(s+=1,q=a.charCodeAt(s)&255,m+=String.fromCharCode((b&15)<<12|(g&63)<<6|q&63)));return m}function n(b,c){function m(){var d=
s+g;d>b.length&&(d=b.length);q+=a(b,s,d);s=d;d=s===b.length;c(q,d)&&!d&&runtime.setTimeout(m,0)}var g=1E5,q="",s=0;b.length<g?c(a(b,0,b.length),!0):("string"!==typeof b&&(b=b.slice()),m())}function q(a){return p(e(a))}function g(a){return String.fromCharCode.apply(String,p(a))}function c(a){return String.fromCharCode.apply(String,p(e(a)))}var u="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";(function(){var a=[],b;for(b=0;26>b;b+=1)a.push(65+b);for(b=0;26>b;b+=1)a.push(97+b);for(b=
0;10>b;b+=1)a.push(48+b);a.push(43);a.push(47);return a})();var t=function(a){var b={},c,m;c=0;for(m=a.length;c<m;c+=1)b[a.charAt(c)]=c;return b}(u),s,m,A=runtime.getWindow(),x,v;A&&A.btoa?(x=function(a){return A.btoa(a)},s=function(a){return x(c(a))}):(x=h,s=function(a){return k(q(a))});A&&A.atob?(v=function(a){return A.atob(a)},m=function(b){b=v(b);return a(b,0,b.length)}):(v=b,m=function(a){return d(l(a))});return function(){this.convertByteArrayToBase64=this.convertUTF8ArrayToBase64=k;this.convertBase64ToByteArray=
this.convertBase64ToUTF8Array=l;this.convertUTF16ArrayToByteArray=this.convertUTF16ArrayToUTF8Array=p;this.convertByteArrayToUTF16Array=this.convertUTF8ArrayToUTF16Array=r;this.convertUTF8StringToBase64=h;this.convertBase64ToUTF8String=b;this.convertUTF8StringToUTF16Array=f;this.convertByteArrayToUTF16String=this.convertUTF8ArrayToUTF16String=d;this.convertUTF8StringToUTF16String=n;this.convertUTF16StringToByteArray=this.convertUTF16StringToUTF8Array=q;this.convertUTF16ArrayToUTF8String=g;this.convertUTF16StringToUTF8String=
c;this.convertUTF16StringToBase64=s;this.convertBase64ToUTF16String=m;this.fromBase64=b;this.toBase64=h;this.atob=v;this.btoa=x;this.utob=c;this.btou=n;this.encode=s;this.encodeURI=function(a){return s(a).replace(/[+\/]/g,function(a){return"+"===a?"-":"_"}).replace(/\\=+$/,"")};this.decode=function(a){return m(a.replace(/[\-_]/g,function(a){return"-"===a?"+":"/"}))}}}();
// Input 3
core.RawDeflate=function(){function e(){this.dl=this.fc=0}function k(){this.extra_bits=this.static_tree=this.dyn_tree=null;this.max_code=this.max_length=this.elems=this.extra_base=0}function l(a,b,c,m){this.good_length=a;this.max_lazy=b;this.nice_length=c;this.max_chain=m}function p(){this.next=null;this.len=0;this.ptr=[];this.ptr.length=r;this.off=0}var r=8192,h,b,f,d,a=null,n,q,g,c,u,t,s,m,A,x,v,w,P,B,E,O,y,J,C,D,G,X,Q,F,K,H,U,Z,W,L,I,M,S,T,R,N,V,z,ca,$,Y,da,aa,la,sa,ga,ia,ea,ha,ma,ta,ua=[0,0,0,
0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],ja=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],Ka=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],ya=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],na;na=[new l(0,0,0,0),new l(4,4,8,4),new l(4,5,16,8),new l(4,6,32,32),new l(4,4,16,16),new l(8,16,32,32),new l(8,16,128,128),new l(8,32,128,256),new l(32,128,258,1024),new l(32,258,258,4096)];var oa=function(c){a[q+n++]=c;if(q+n===r){var m;if(0!==n){null!==h?(c=h,h=h.next):c=new p;
c.next=null;c.len=c.off=0;null===b?b=f=c:f=f.next=c;c.len=n-q;for(m=0;m<c.len;m++)c.ptr[m]=a[q+m];n=q=0}}},pa=function(b){b&=65535;q+n<r-2?(a[q+n++]=b&255,a[q+n++]=b>>>8):(oa(b&255),oa(b>>>8))},qa=function(){v=(v<<5^c[y+3-1]&255)&8191;w=s[32768+v];s[y&32767]=w;s[32768+v]=y},ba=function(a,b){A>16-b?(m|=a<<A,pa(m),m=a>>16-A,A+=b-16):(m|=a<<A,A+=b)},fa=function(a,b){ba(b[a].fc,b[a].dl)},za=function(a,b,c){return a[b].fc<a[c].fc||a[b].fc===a[c].fc&&V[b]<=V[c]},Aa=function(a,b,c){var m;for(m=0;m<c&&ta<
ma.length;m++)a[b+m]=ma.charCodeAt(ta++)&255;return m},va=function(){var a,b,m=65536-D-y;if(-1===m)m--;else if(65274<=y){for(a=0;32768>a;a++)c[a]=c[a+32768];J-=32768;y-=32768;x-=32768;for(a=0;8192>a;a++)b=s[32768+a],s[32768+a]=32768<=b?b-32768:0;for(a=0;32768>a;a++)b=s[a],s[a]=32768<=b?b-32768:0;m+=32768}C||(a=Aa(c,y+D,m),0>=a?C=!0:D+=a)},Ba=function(a){var b=G,m=y,g,q=O,d=32506<y?y-32506:0,t=y+258,n=c[m+q-1],e=c[m+q];O>=F&&(b>>=2);do if(g=a,c[g+q]===e&&c[g+q-1]===n&&c[g]===c[m]&&c[++g]===c[m+1]){m+=
2;g++;do++m;while(c[m]===c[++g]&&c[++m]===c[++g]&&c[++m]===c[++g]&&c[++m]===c[++g]&&c[++m]===c[++g]&&c[++m]===c[++g]&&c[++m]===c[++g]&&c[++m]===c[++g]&&m<t);g=258-(t-m);m=t-258;if(g>q){J=a;q=g;if(258<=g)break;n=c[m+q-1];e=c[m+q]}}while((a=s[a&32767])>d&&0!==--b);return q},ka=function(a,b){t[aa++]=b;0===a?K[b].fc++:(a--,K[z[b]+256+1].fc++,H[(256>a?ca[a]:ca[256+(a>>7)])&255].fc++,u[la++]=a,ga|=ia);ia<<=1;0===(aa&7)&&(da[sa++]=ga,ga=0,ia=1);if(2<Q&&0===(aa&4095)){var c=8*aa,m=y-x,g;for(g=0;30>g;g++)c+=
H[g].fc*(5+ja[g]);c>>=3;if(la<parseInt(aa/2,10)&&c<parseInt(m/2,10))return!0}return 8191===aa||8192===la},wa=function(a,b){for(var c=T[b],m=b<<1;m<=R;){m<R&&za(a,T[m+1],T[m])&&m++;if(za(a,c,T[m]))break;T[b]=T[m];b=m;m<<=1}T[b]=c},Ca=function(a,b){var c=0;do c|=a&1,a>>=1,c<<=1;while(0<--b);return c>>1},Da=function(a,b){var c=[];c.length=16;var m=0,g;for(g=1;15>=g;g++)m=m+S[g-1]<<1,c[g]=m;for(m=0;m<=b;m++)g=a[m].dl,0!==g&&(a[m].fc=Ca(c[g]++,g))},xa=function(a){var b=a.dyn_tree,c=a.static_tree,m=a.elems,
g,q=-1,s=m;R=0;N=573;for(g=0;g<m;g++)0!==b[g].fc?(T[++R]=q=g,V[g]=0):b[g].dl=0;for(;2>R;)g=T[++R]=2>q?++q:0,b[g].fc=1,V[g]=0,ea--,null!==c&&(ha-=c[g].dl);a.max_code=q;for(g=R>>1;1<=g;g--)wa(b,g);do g=T[1],T[1]=T[R--],wa(b,1),c=T[1],T[--N]=g,T[--N]=c,b[s].fc=b[g].fc+b[c].fc,V[s]=V[g]>V[c]+1?V[g]:V[c]+1,b[g].dl=b[c].dl=s,T[1]=s++,wa(b,1);while(2<=R);T[--N]=T[1];s=a.dyn_tree;g=a.extra_bits;var m=a.extra_base,c=a.max_code,d=a.max_length,t=a.static_tree,n,e,f,u,h=0;for(e=0;15>=e;e++)S[e]=0;s[T[N]].dl=
0;for(a=N+1;573>a;a++)n=T[a],e=s[s[n].dl].dl+1,e>d&&(e=d,h++),s[n].dl=e,n>c||(S[e]++,f=0,n>=m&&(f=g[n-m]),u=s[n].fc,ea+=u*(e+f),null!==t&&(ha+=u*(t[n].dl+f)));if(0!==h){do{for(e=d-1;0===S[e];)e--;S[e]--;S[e+1]+=2;S[d]--;h-=2}while(0<h);for(e=d;0!==e;e--)for(n=S[e];0!==n;)g=T[--a],g>c||(s[g].dl!==e&&(ea+=(e-s[g].dl)*s[g].fc,s[g].fc=e),n--)}Da(b,q)},Ea=function(a,b){var c,m=-1,g,q=a[0].dl,s=0,d=7,n=4;0===q&&(d=138,n=3);a[b+1].dl=65535;for(c=0;c<=b;c++)g=q,q=a[c+1].dl,++s<d&&g===q||(s<n?W[g].fc+=s:0!==
g?(g!==m&&W[g].fc++,W[16].fc++):10>=s?W[17].fc++:W[18].fc++,s=0,m=g,0===q?(d=138,n=3):g===q?(d=6,n=3):(d=7,n=4))},Fa=function(){8<A?pa(m):0<A&&oa(m);A=m=0},Ga=function(a,b){var c,m=0,g=0,q=0,s=0,d,n;if(0!==aa){do 0===(m&7)&&(s=da[q++]),c=t[m++]&255,0===(s&1)?fa(c,a):(d=z[c],fa(d+256+1,a),n=ua[d],0!==n&&(c-=$[d],ba(c,n)),c=u[g++],d=(256>c?ca[c]:ca[256+(c>>7)])&255,fa(d,b),n=ja[d],0!==n&&(c-=Y[d],ba(c,n))),s>>=1;while(m<aa)}fa(256,a)},Ha=function(a,b){var c,m=-1,g,q=a[0].dl,s=0,d=7,n=4;0===q&&(d=138,
n=3);for(c=0;c<=b;c++)if(g=q,q=a[c+1].dl,!(++s<d&&g===q)){if(s<n){do fa(g,W);while(0!==--s)}else 0!==g?(g!==m&&(fa(g,W),s--),fa(16,W),ba(s-3,2)):10>=s?(fa(17,W),ba(s-3,3)):(fa(18,W),ba(s-11,7));s=0;m=g;0===q?(d=138,n=3):g===q?(d=6,n=3):(d=7,n=4)}},Ia=function(){var a;for(a=0;286>a;a++)K[a].fc=0;for(a=0;30>a;a++)H[a].fc=0;for(a=0;19>a;a++)W[a].fc=0;K[256].fc=1;ga=aa=la=sa=ea=ha=0;ia=1},ra=function(a){var b,m,g,q;q=y-x;da[sa]=ga;xa(L);xa(I);Ea(K,L.max_code);Ea(H,I.max_code);xa(M);for(g=18;3<=g&&0===
W[ya[g]].dl;g--);ea+=3*(g+1)+14;b=ea+3+7>>3;m=ha+3+7>>3;m<=b&&(b=m);if(q+4<=b&&0<=x)for(ba(0+a,3),Fa(),pa(q),pa(~q),g=0;g<q;g++)oa(c[x+g]);else if(m===b)ba(2+a,3),Ga(U,Z);else{ba(4+a,3);q=L.max_code+1;b=I.max_code+1;g+=1;ba(q-257,5);ba(b-1,5);ba(g-4,4);for(m=0;m<g;m++)ba(W[ya[m]].dl,3);Ha(K,q-1);Ha(H,b-1);Ga(K,H)}Ia();0!==a&&Fa()},Ja=function(c,m,g){var s,d,t;for(s=0;null!==b&&s<g;){d=g-s;d>b.len&&(d=b.len);for(t=0;t<d;t++)c[m+s+t]=b.ptr[b.off+t];b.off+=d;b.len-=d;s+=d;0===b.len&&(d=b,b=b.next,d.next=
h,h=d)}if(s===g)return s;if(q<n){d=g-s;d>n-q&&(d=n-q);for(t=0;t<d;t++)c[m+s+t]=a[q+t];q+=d;s+=d;n===q&&(n=q=0)}return s},La=function(a,t,e){var f;if(!d){if(!C){A=m=0;var h,u;if(0===Z[0].dl){L.dyn_tree=K;L.static_tree=U;L.extra_bits=ua;L.extra_base=257;L.elems=286;L.max_length=15;L.max_code=0;I.dyn_tree=H;I.static_tree=Z;I.extra_bits=ja;I.extra_base=0;I.elems=30;I.max_length=15;I.max_code=0;M.dyn_tree=W;M.static_tree=null;M.extra_bits=Ka;M.extra_base=0;M.elems=19;M.max_length=7;for(u=h=M.max_code=
0;28>u;u++)for($[u]=h,f=0;f<1<<ua[u];f++)z[h++]=u;z[h-1]=u;for(u=h=0;16>u;u++)for(Y[u]=h,f=0;f<1<<ja[u];f++)ca[h++]=u;for(h>>=7;30>u;u++)for(Y[u]=h<<7,f=0;f<1<<ja[u]-7;f++)ca[256+h++]=u;for(f=0;15>=f;f++)S[f]=0;for(f=0;143>=f;)U[f++].dl=8,S[8]++;for(;255>=f;)U[f++].dl=9,S[9]++;for(;279>=f;)U[f++].dl=7,S[7]++;for(;287>=f;)U[f++].dl=8,S[8]++;Da(U,287);for(f=0;30>f;f++)Z[f].dl=5,Z[f].fc=Ca(f,5);Ia()}for(f=0;8192>f;f++)s[32768+f]=0;X=na[Q].max_lazy;F=na[Q].good_length;G=na[Q].max_chain;x=y=0;D=Aa(c,0,
65536);if(0>=D)C=!0,D=0;else{for(C=!1;262>D&&!C;)va();for(f=v=0;2>f;f++)v=(v<<5^c[f]&255)&8191}b=null;q=n=0;3>=Q?(O=2,E=0):(E=2,B=0);g=!1}d=!0;if(0===D)return g=!0,0}if((f=Ja(a,t,e))===e)return e;if(g)return f;if(3>=Q)for(;0!==D&&null===b;){qa();0!==w&&32506>=y-w&&(E=Ba(w),E>D&&(E=D));if(3<=E)if(u=ka(y-J,E-3),D-=E,E<=X){E--;do y++,qa();while(0!==--E);y++}else y+=E,E=0,v=c[y]&255,v=(v<<5^c[y+1]&255)&8191;else u=ka(0,c[y]&255),D--,y++;u&&(ra(0),x=y);for(;262>D&&!C;)va()}else for(;0!==D&&null===b;){qa();
O=E;P=J;E=2;0!==w&&(O<X&&32506>=y-w)&&(E=Ba(w),E>D&&(E=D),3===E&&4096<y-J&&E--);if(3<=O&&E<=O){u=ka(y-1-P,O-3);D-=O-1;O-=2;do y++,qa();while(0!==--O);B=0;E=2;y++;u&&(ra(0),x=y)}else 0!==B?ka(0,c[y-1]&255)&&(ra(0),x=y):B=1,y++,D--;for(;262>D&&!C;)va()}0===D&&(0!==B&&ka(0,c[y-1]&255),ra(1),g=!0);return f+Ja(a,f+t,e-f)};this.deflate=function(m,g){var q,n;ma=m;ta=0;"undefined"===String(typeof g)&&(g=6);(q=g)?1>q?q=1:9<q&&(q=9):q=6;Q=q;C=d=!1;if(null===a){h=b=f=null;a=[];a.length=r;c=[];c.length=65536;
u=[];u.length=8192;t=[];t.length=32832;s=[];s.length=65536;K=[];K.length=573;for(q=0;573>q;q++)K[q]=new e;H=[];H.length=61;for(q=0;61>q;q++)H[q]=new e;U=[];U.length=288;for(q=0;288>q;q++)U[q]=new e;Z=[];Z.length=30;for(q=0;30>q;q++)Z[q]=new e;W=[];W.length=39;for(q=0;39>q;q++)W[q]=new e;L=new k;I=new k;M=new k;S=[];S.length=16;T=[];T.length=573;V=[];V.length=573;z=[];z.length=256;ca=[];ca.length=512;$=[];$.length=29;Y=[];Y.length=30;da=[];da.length=1024}for(var l=Array(1024),p=[];0<(q=La(l,0,l.length));){var G=
[];G.length=q;for(n=0;n<q;n++)G[n]=String.fromCharCode(l[n]);p[p.length]=G.join("")}ma=null;return p.join("")}};
// Input 4
core.ByteArray=function(e){this.pos=0;this.data=e;this.readUInt32LE=function(){var e=this.data,l=this.pos+=4;return e[--l]<<24|e[--l]<<16|e[--l]<<8|e[--l]};this.readUInt16LE=function(){var e=this.data,l=this.pos+=2;return e[--l]<<8|e[--l]}};
// Input 5
core.ByteArrayWriter=function(e){var k=this,l=new runtime.ByteArray(0);this.appendByteArrayWriter=function(e){l=runtime.concatByteArrays(l,e.getByteArray())};this.appendByteArray=function(e){l=runtime.concatByteArrays(l,e)};this.appendArray=function(e){l=runtime.concatByteArrays(l,runtime.byteArrayFromArray(e))};this.appendUInt16LE=function(e){k.appendArray([e&255,e>>8&255])};this.appendUInt32LE=function(e){k.appendArray([e&255,e>>8&255,e>>16&255,e>>24&255])};this.appendString=function(k){l=runtime.concatByteArrays(l,
runtime.byteArrayFromString(k,e))};this.getLength=function(){return l.length};this.getByteArray=function(){return l}};
// Input 6
core.RawInflate=function(){var e,k,l=null,p,r,h,b,f,d,a,n,q,g,c,u,t,s,m=[0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535],A=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],x=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,99,99],v=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],w=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],P=[16,17,18,
0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],B=function(){this.list=this.next=null},E=function(){this.n=this.b=this.e=0;this.t=null},O=function(a,b,c,m,g,q){this.BMAX=16;this.N_MAX=288;this.status=0;this.root=null;this.m=0;var s=Array(this.BMAX+1),d,n,t,e,f,u,h,k=Array(this.BMAX+1),l,p,r,G=new E,A=Array(this.BMAX);e=Array(this.N_MAX);var v,x=Array(this.BMAX+1),C,w,X;X=this.root=null;for(f=0;f<s.length;f++)s[f]=0;for(f=0;f<k.length;f++)k[f]=0;for(f=0;f<A.length;f++)A[f]=null;for(f=0;f<e.length;f++)e[f]=
0;for(f=0;f<x.length;f++)x[f]=0;d=256<b?a[256]:this.BMAX;l=a;p=0;f=b;do s[l[p]]++,p++;while(0<--f);if(s[0]==b)this.root=null,this.status=this.m=0;else{for(u=1;u<=this.BMAX&&0==s[u];u++);h=u;q<u&&(q=u);for(f=this.BMAX;0!=f&&0==s[f];f--);t=f;q>f&&(q=f);for(C=1<<u;u<f;u++,C<<=1)if(0>(C-=s[u])){this.status=2;this.m=q;return}if(0>(C-=s[f]))this.status=2,this.m=q;else{s[f]+=C;x[1]=u=0;l=s;p=1;for(r=2;0<--f;)x[r++]=u+=l[p++];l=a;f=p=0;do 0!=(u=l[p++])&&(e[x[u]++]=f);while(++f<b);b=x[t];x[0]=f=0;l=e;p=0;
e=-1;v=k[0]=0;r=null;for(w=0;h<=t;h++)for(a=s[h];0<a--;){for(;h>v+k[1+e];){v+=k[1+e];e++;w=(w=t-v)>q?q:w;if((n=1<<(u=h-v))>a+1)for(n-=a+1,r=h;++u<w&&!((n<<=1)<=s[++r]);)n-=s[r];v+u>d&&v<d&&(u=d-v);w=1<<u;k[1+e]=u;r=Array(w);for(n=0;n<w;n++)r[n]=new E;X=null==X?this.root=new B:X.next=new B;X.next=null;X.list=r;A[e]=r;0<e&&(x[e]=f,G.b=k[e],G.e=16+u,G.t=r,u=(f&(1<<v)-1)>>v-k[e],A[e-1][u].e=G.e,A[e-1][u].b=G.b,A[e-1][u].n=G.n,A[e-1][u].t=G.t)}G.b=h-v;p>=b?G.e=99:l[p]<c?(G.e=256>l[p]?16:15,G.n=l[p++]):
(G.e=g[l[p]-c],G.n=m[l[p++]-c]);n=1<<h-v;for(u=f>>v;u<w;u+=n)r[u].e=G.e,r[u].b=G.b,r[u].n=G.n,r[u].t=G.t;for(u=1<<h-1;0!=(f&u);u>>=1)f^=u;for(f^=u;(f&(1<<v)-1)!=x[e];)v-=k[e],e--}this.m=k[1];this.status=0!=C&&1!=t?1:0}}},y=function(a){for(;b<a;){var c=h,m;m=t.length==s?-1:t[s++];h=c|m<<b;b+=8}},J=function(a){return h&m[a]},C=function(a){h>>=a;b-=a},D=function(b,m,s){var d,t,h;if(0==s)return 0;for(h=0;;){y(c);t=q.list[J(c)];for(d=t.e;16<d;){if(99==d)return-1;C(t.b);d-=16;y(d);t=t.t[J(d)];d=t.e}C(t.b);
if(16==d)k&=32767,b[m+h++]=e[k++]=t.n;else{if(15==d)break;y(d);a=t.n+J(d);C(d);y(u);t=g.list[J(u)];for(d=t.e;16<d;){if(99==d)return-1;C(t.b);d-=16;y(d);t=t.t[J(d)];d=t.e}C(t.b);y(d);n=k-t.n-J(d);for(C(d);0<a&&h<s;)a--,n&=32767,k&=32767,b[m+h++]=e[k++]=e[n++]}if(h==s)return s}f=-1;return h},G,X=function(a,b,m){var s,d,n,t,f,e,h,k=Array(316);for(s=0;s<k.length;s++)k[s]=0;y(5);e=257+J(5);C(5);y(5);h=1+J(5);C(5);y(4);s=4+J(4);C(4);if(286<e||30<h)return-1;for(d=0;d<s;d++)y(3),k[P[d]]=J(3),C(3);for(;19>
d;d++)k[P[d]]=0;c=7;d=new O(k,19,19,null,null,c);if(0!=d.status)return-1;q=d.root;c=d.m;t=e+h;for(s=n=0;s<t;)if(y(c),f=q.list[J(c)],d=f.b,C(d),d=f.n,16>d)k[s++]=n=d;else if(16==d){y(2);d=3+J(2);C(2);if(s+d>t)return-1;for(;0<d--;)k[s++]=n}else{17==d?(y(3),d=3+J(3),C(3)):(y(7),d=11+J(7),C(7));if(s+d>t)return-1;for(;0<d--;)k[s++]=0;n=0}c=9;d=new O(k,e,257,A,x,c);0==c&&(d.status=1);if(0!=d.status)return-1;q=d.root;c=d.m;for(s=0;s<h;s++)k[s]=k[s+e];u=6;d=new O(k,h,0,v,w,u);g=d.root;u=d.m;return 0==u&&
257<e||0!=d.status?-1:D(a,b,m)};this.inflate=function(m,F){null==e&&(e=Array(65536));b=h=k=0;f=-1;d=!1;a=n=0;q=null;t=m;s=0;var P=new runtime.ByteArray(F);a:{var H,B;for(H=0;H<F&&(!d||-1!=f);){if(0<a){if(0!=f)for(;0<a&&H<F;)a--,n&=32767,k&=32767,P[0+H++]=e[k++]=e[n++];else{for(;0<a&&H<F;)a--,k&=32767,y(8),P[0+H++]=e[k++]=J(8),C(8);0==a&&(f=-1)}if(H==F)break}if(-1==f){if(d)break;y(1);0!=J(1)&&(d=!0);C(1);y(2);f=J(2);C(2);q=null;a=0}switch(f){case 0:B=P;var E=0+H,W=F-H,L=void 0,L=b&7;C(L);y(16);L=J(16);
C(16);y(16);if(L!=(~h&65535))B=-1;else{C(16);a=L;for(L=0;0<a&&L<W;)a--,k&=32767,y(8),B[E+L++]=e[k++]=J(8),C(8);0==a&&(f=-1);B=L}break;case 1:if(null!=q)B=D(P,0+H,F-H);else b:{B=P;E=0+H;W=F-H;if(null==l){for(var I=void 0,L=Array(288),I=void 0,I=0;144>I;I++)L[I]=8;for(;256>I;I++)L[I]=9;for(;280>I;I++)L[I]=7;for(;288>I;I++)L[I]=8;r=7;I=new O(L,288,257,A,x,r);if(0!=I.status){alert("HufBuild error: "+I.status);B=-1;break b}l=I.root;r=I.m;for(I=0;30>I;I++)L[I]=5;G=5;I=new O(L,30,0,v,w,G);if(1<I.status){l=
null;alert("HufBuild error: "+I.status);B=-1;break b}p=I.root;G=I.m}q=l;g=p;c=r;u=G;B=D(B,E,W)}break;case 2:B=null!=q?D(P,0+H,F-H):X(P,0+H,F-H);break;default:B=-1}if(-1==B)break a;H+=B}}t=null;return P}};
// Input 7
/*

 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
core.LoopWatchDog=function(e,k){var l=Date.now(),p=0;this.check=function(){var r;if(e&&(r=Date.now(),r-l>e))throw runtime.log("alert","watchdog timeout"),"timeout!";if(0<k&&(p+=1,p>k))throw runtime.log("alert","watchdog loop overflow"),"loop overflow";}};
// Input 8
core.Cursor=function(e,k){function l(b){b.parentNode&&(a.push({prev:b.previousSibling,next:b.nextSibling}),b.parentNode.removeChild(b))}function p(a,b){a.nodeType===Node.TEXT_NODE&&(0===a.length?a.parentNode.removeChild(a):b.nodeType===Node.TEXT_NODE&&(b.insertData(0,a.data),a.parentNode.removeChild(a)))}function r(){a.forEach(function(a){a.prev&&a.prev.nextSibling&&p(a.prev,a.prev.nextSibling);a.next&&a.next.previousSibling&&p(a.next.previousSibling,a.next)});a.length=0}function h(b,c,q){if(c.nodeType===
Node.TEXT_NODE){runtime.assert(Boolean(c),"putCursorIntoTextNode: invalid container");var d=c.parentNode;runtime.assert(Boolean(d),"putCursorIntoTextNode: container without parent");runtime.assert(0<=q&&q<=c.length,"putCursorIntoTextNode: offset is out of bounds");0===q?d.insertBefore(b,c):(q!==c.length&&c.splitText(q),d.insertBefore(b,c.nextSibling))}else if(c.nodeType===Node.ELEMENT_NODE){runtime.assert(Boolean(c),"putCursorIntoContainer: invalid container");for(d=c.firstChild;null!==d&&0<q;)d=
d.nextSibling,q-=1;c.insertBefore(b,d)}a.push({prev:b.previousSibling,next:b.nextSibling})}var b=e.createElementNS("urn:webodf:names:cursor","cursor"),f=e.createElementNS("urn:webodf:names:cursor","anchor"),d,a=[],n,q;this.getNode=function(){return b};this.getAnchorNode=function(){return f.parentNode?f:b};this.getSelectedRange=function(){q?(n.setStartBefore(b),n.collapse(!0)):(n.setStartAfter(d?f:b),n.setEndBefore(d?b:f));return n};this.setSelectedRange=function(a,c){n&&n!==a&&n.detach();n=a;d=!1!==
c;(q=a.collapsed)?(l(f),l(b),h(b,a.startContainer,a.startOffset)):(l(f),l(b),h(d?b:f,a.endContainer,a.endOffset),h(d?f:b,a.startContainer,a.startOffset));r()};this.remove=function(){l(b);r()};b.setAttributeNS("urn:webodf:names:cursor","memberId",k);f.setAttributeNS("urn:webodf:names:cursor","memberId",k)};
// Input 9
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
core.EventNotifier=function(e){var k={};this.emit=function(e,p){var r,h;runtime.assert(k.hasOwnProperty(e),'unknown event fired "'+e+'"');h=k[e];for(r=0;r<h.length;r+=1)h[r](p)};this.subscribe=function(e,p){runtime.assert(k.hasOwnProperty(e),'tried to subscribe to unknown event "'+e+'"');k[e].push(p);runtime.log('event "'+e+'" subscribed.')};this.unsubscribe=function(e,p){var r;runtime.assert(k.hasOwnProperty(e),'tried to unsubscribe from unknown event "'+e+'"');r=k[e].indexOf(p);runtime.assert(-1!==
r,'tried to unsubscribe unknown callback from event "'+e+'"');-1!==r&&k[e].splice(r,1);runtime.log('event "'+e+'" unsubscribed.')};(function(){var l;for(l=0;l<e.length;l+=1)k[e[l]]=[]})()};
// Input 10
core.UnitTest=function(){};core.UnitTest.prototype.setUp=function(){};core.UnitTest.prototype.tearDown=function(){};core.UnitTest.prototype.description=function(){};core.UnitTest.prototype.tests=function(){};core.UnitTest.prototype.asyncTests=function(){};
core.UnitTest.provideTestAreaDiv=function(){var e=runtime.getWindow().document,k=e.getElementById("testarea");runtime.assert(!k,'Unclean test environment, found a div with id "testarea".');k=e.createElement("div");k.setAttribute("id","testarea");e.body.appendChild(k);return k};
core.UnitTest.cleanupTestAreaDiv=function(){var e=runtime.getWindow().document,k=e.getElementById("testarea");runtime.assert(!!k&&k.parentNode===e.body,'Test environment broken, found no div with id "testarea" below body.');e.body.removeChild(k)};
core.UnitTestRunner=function(){function e(d){b+=1;runtime.log("fail",d)}function k(b,a){var n;try{if(b.length!==a.length)return e("array of length "+b.length+" should be "+a.length+" long"),!1;for(n=0;n<b.length;n+=1)if(b[n]!==a[n])return e(b[n]+" should be "+a[n]+" at array index "+n),!1}catch(q){return!1}return!0}function l(b,a,n){var q=b.attributes,g=q.length,c,f,t;for(c=0;c<g;c+=1)if(f=q.item(c),"xmlns"!==f.prefix){t=a.getAttributeNS(f.namespaceURI,f.localName);if(!a.hasAttributeNS(f.namespaceURI,
f.localName))return e("Attribute "+f.localName+" with value "+f.value+" was not present"),!1;if(t!==f.value)return e("Attribute "+f.localName+" was "+t+" should be "+f.value),!1}return n?!0:l(a,b,!0)}function p(b,a){if(b.nodeType!==a.nodeType)return e(b.nodeType+" should be "+a.nodeType),!1;if(b.nodeType===Node.TEXT_NODE)return b.data===a.data;runtime.assert(b.nodeType===Node.ELEMENT_NODE,"Only textnodes and elements supported.");if(b.namespaceURI!==a.namespaceURI||b.localName!==a.localName)return e(b.namespaceURI+
" should be "+a.namespaceURI),!1;if(!l(b,a,!1))return!1;for(var n=b.firstChild,q=a.firstChild;n;){if(!q||!p(n,q))return!1;n=n.nextSibling;q=q.nextSibling}return q?!1:!0}function r(b,a){return 0===a?b===a&&1/b===1/a:b===a?!0:"number"===typeof a&&isNaN(a)?"number"===typeof b&&isNaN(b):Object.prototype.toString.call(a)===Object.prototype.toString.call([])?k(b,a):"object"===typeof a&&"object"===typeof b?a.constructor===Element||a.constructor===Node?p(a,b):f(a,b):!1}function h(b,a,n){"string"===typeof a&&
"string"===typeof n||runtime.log("WARN: shouldBe() expects string arguments");var q,g;try{g=eval(a)}catch(c){q=c}b=eval(n);q?e(a+" should be "+b+". Threw exception "+q):r(g,b)?runtime.log("pass",a+" is "+n):String(typeof g)===String(typeof b)?(n=0===g&&0>1/g?"-0":String(g),e(a+" should be "+b+". Was "+n+".")):e(a+" should be "+b+" (of type "+typeof b+"). Was "+g+" (of type "+typeof g+").")}var b=0,f;f=function(b,a){var n=Object.keys(b),q=Object.keys(a);n.sort();q.sort();return k(n,q)&&Object.keys(b).every(function(g){var c=
b[g],q=a[g];return r(c,q)?!0:(e(c+" should be "+q+" for key "+g),!1)})};this.areNodesEqual=p;this.shouldBeNull=function(b,a){h(b,a,"null")};this.shouldBeNonNull=function(b,a){var n,q;try{q=eval(a)}catch(g){n=g}n?e(a+" should be non-null. Threw exception "+n):null!==q?runtime.log("pass",a+" is non-null."):e(a+" should be non-null. Was "+q)};this.shouldBe=h;this.countFailedTests=function(){return b}};
core.UnitTester=function(){function e(e,k){return"<span style='color:blue;cursor:pointer' onclick='"+k+"'>"+e+"</span>"}var k=0,l={};this.runTests=function(p,r,h){function b(c){if(0===c.length)l[f]=n,k+=d.countFailedTests(),r();else{g=c[0];var m=Runtime.getFunctionName(g);runtime.log("Running "+m);u=d.countFailedTests();a.setUp();g(function(){a.tearDown();n[m]=u===d.countFailedTests();b(c.slice(1))})}}var f=Runtime.getFunctionName(p),d=new core.UnitTestRunner,a=new p(d),n={},q,g,c,u,t="BrowserRuntime"===
runtime.type();if(l.hasOwnProperty(f))runtime.log("Test "+f+" has already run.");else{t?runtime.log("<span>Running "+e(f,'runSuite("'+f+'");')+": "+a.description()+"</span>"):runtime.log("Running "+f+": "+a.description);c=a.tests();for(q=0;q<c.length;q+=1)g=c[q],p=Runtime.getFunctionName(g)||g.testName,h.length&&-1===h.indexOf(p)||(t?runtime.log("<span>Running "+e(p,'runTest("'+f+'","'+p+'")')+"</span>"):runtime.log("Running "+p),u=d.countFailedTests(),a.setUp(),g(),a.tearDown(),n[p]=u===d.countFailedTests());
b(a.asyncTests())}};this.countFailedTests=function(){return k};this.results=function(){return l}};
// Input 11
core.PositionIterator=function(e,k,l,p){function r(){this.acceptNode=function(a){return a.nodeType===Node.TEXT_NODE&&0===a.length?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}function h(a){this.acceptNode=function(b){return b.nodeType===Node.TEXT_NODE&&0===b.length?NodeFilter.FILTER_REJECT:a.acceptNode(b)}}function b(){var b=d.currentNode.nodeType;a=b===Node.TEXT_NODE?d.currentNode.length-1:b===Node.ELEMENT_NODE?1:0}var f=this,d,a,n;this.nextPosition=function(){if(d.currentNode===e)return!1;
0===a&&d.currentNode.nodeType===Node.ELEMENT_NODE?null===d.firstChild()&&(a=1):d.currentNode.nodeType===Node.TEXT_NODE&&a+1<d.currentNode.length?a+=1:null!==d.nextSibling()?a=0:(d.parentNode(),a=1);return!0};this.previousPosition=function(){var q=!0;if(0===a)if(null===d.previousSibling()){d.parentNode();if(d.currentNode===e)return d.firstChild(),!1;a=0}else b();else d.currentNode.nodeType===Node.TEXT_NODE?a-=1:null!==d.lastChild()?b():d.currentNode===e?q=!1:a=0;return q};this.container=function(){var b=
d.currentNode,g=b.nodeType;return 0===a&&g!==Node.TEXT_NODE?b.parentNode:b};this.rightNode=function(){var b=d.currentNode,g=b.nodeType;if(g===Node.TEXT_NODE&&a===b.length)for(b=b.nextSibling;b&&1!==n(b);)b=b.nextSibling;else g===Node.ELEMENT_NODE&&1===a&&(b=null);return b};this.leftNode=function(){var b=d.currentNode;if(0===a)for(b=b.previousSibling;b&&1!==n(b);)b=b.previousSibling;else if(b.nodeType===Node.ELEMENT_NODE)for(b=b.lastChild;b&&1!==n(b);)b=b.previousSibling;return b};this.getCurrentNode=
function(){return d.currentNode};this.domOffset=function(){if(d.currentNode.nodeType===Node.TEXT_NODE)return a;var b=0,g=d.currentNode,c;for(c=1===a?d.lastChild():d.previousSibling();c;)b+=1,c=d.previousSibling();d.currentNode=g;return b};this.unfilteredDomOffset=function(){if(d.currentNode.nodeType===Node.TEXT_NODE)return a;for(var b=0,g=d.currentNode,g=1===a?g.lastChild:g.previousSibling;g;)b+=1,g=g.previousSibling;return b};this.textOffset=function(){if(d.currentNode.nodeType!==Node.TEXT_NODE)return 0;
for(var b=a,g=d.currentNode;d.previousSibling()&&d.currentNode.nodeType===Node.TEXT_NODE;)b+=d.currentNode.length;d.currentNode=g;return b};this.getPreviousSibling=function(){var a=d.currentNode,b=d.previousSibling();d.currentNode=a;return b};this.getNextSibling=function(){var a=d.currentNode,b=d.nextSibling();d.currentNode=a;return b};this.text=function(){var a,b="",c=f.textNeighborhood();for(a=0;a<c.length;a+=1)b+=c[a].data;return b};this.textNeighborhood=function(){var a=d.currentNode,b=[];if(a.nodeType!==
Node.TEXT_NODE)return b;for(;d.previousSibling();)if(d.currentNode.nodeType!==Node.TEXT_NODE){d.nextSibling();break}do b.push(d.currentNode);while(d.nextSibling()&&d.currentNode.nodeType===Node.TEXT_NODE);d.currentNode=a;return b};this.substr=function(a,b){return f.text().substr(a,b)};this.setUnfilteredPosition=function(b,g){var c;runtime.assert(null!==b&&void 0!==b,"PositionIterator.setUnfilteredPosition called without container");d.currentNode=b;if(b.nodeType===Node.TEXT_NODE)return a=g,runtime.assert(g<=
b.length,"Error in setPosition: "+g+" > "+b.length),runtime.assert(0<=g,"Error in setPosition: "+g+" < 0"),g===b.length&&(a=void 0,d.nextSibling()?a=0:d.parentNode()&&(a=1),runtime.assert(void 0!==a,"Error in setPosition: position not valid.")),!0;c=n(b);g<b.childNodes.length&&c!==NodeFilter.FILTER_REJECT?(d.currentNode=b.childNodes[g],c=n(d.currentNode),a=0):a=0===g?0:1;c===NodeFilter.FILTER_REJECT&&(a=1);if(c!==NodeFilter.FILTER_ACCEPT)return f.nextPosition();runtime.assert(n(d.currentNode)===NodeFilter.FILTER_ACCEPT,
"PositionIterater.setUnfilteredPosition call resulted in an non-visible node being set");return!0};this.moveToEnd=function(){d.currentNode=e;a=1};this.moveToEndOfNode=function(b){b.nodeType===Node.TEXT_NODE?f.setUnfilteredPosition(b,b.length):(d.currentNode=b,a=1)};this.getNodeFilter=function(){return n};n=(l?new h(l):new r).acceptNode;n.acceptNode=n;d=e.ownerDocument.createTreeWalker(e,k||4294967295,n,p);a=0;null===d.firstChild()&&(a=1)};
// Input 12
runtime.loadClass("core.PositionIterator");core.PositionFilter=function(){};core.PositionFilter.FilterResult={FILTER_ACCEPT:1,FILTER_REJECT:2,FILTER_SKIP:3};core.PositionFilter.prototype.acceptPosition=function(e){};(function(){return core.PositionFilter})();
// Input 13
core.Async=function(){this.forEach=function(e,k,l){function p(f){b!==h&&(f?(b=h,l(f)):(b+=1,b===h&&l(null)))}var r,h=e.length,b=0;for(r=0;r<h;r+=1)k(e[r],p)}};
// Input 14
runtime.loadClass("core.RawInflate");runtime.loadClass("core.ByteArray");runtime.loadClass("core.ByteArrayWriter");runtime.loadClass("core.Base64");
core.Zip=function(e,k){function l(a){var b=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,
853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,
4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,
225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,
2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,
2932959818,3654703836,1088359270,936918E3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],c,m,g=a.length,s=0,s=0;c=-1;for(m=0;m<g;m+=1)s=(c^a[m])&255,s=b[s],c=c>>>8^s;return c^-1}function p(a){return new Date((a>>25&127)+1980,(a>>21&15)-1,a>>16&31,a>>11&15,a>>5&63,(a&31)<<1)}function r(a){var b=a.getFullYear();return 1980>b?0:b-1980<<
25|a.getMonth()+1<<21|a.getDate()<<16|a.getHours()<<11|a.getMinutes()<<5|a.getSeconds()>>1}function h(a,b){var c,m,g,d,q,n,f,e=this;this.load=function(b){if(void 0!==e.data)b(null,e.data);else{var c=q+34+m+g+256;c+f>u&&(c=u-f);runtime.read(a,f,c,function(c,m){if(c||null===m)b(c,m);else a:{var g=m,f=new core.ByteArray(g),t=f.readUInt32LE(),u;if(67324752!==t)b("File entry signature is wrong."+t.toString()+" "+g.length.toString(),null);else{f.pos+=22;t=f.readUInt16LE();u=f.readUInt16LE();f.pos+=t+u;
if(d){g=g.slice(f.pos,f.pos+q);if(q!==g.length){b("The amount of compressed bytes read was "+g.length.toString()+" instead of "+q.toString()+" for "+e.filename+" in "+a+".",null);break a}g=s(g,n)}else g=g.slice(f.pos,f.pos+n);n!==g.length?b("The amount of bytes read was "+g.length.toString()+" instead of "+n.toString()+" for "+e.filename+" in "+a+".",null):(e.data=g,b(null,g))}}})}};this.set=function(a,b,c,m){e.filename=a;e.data=b;e.compressed=c;e.date=m};this.error=null;b&&(c=b.readUInt32LE(),33639248!==
c?this.error="Central directory entry has wrong signature at position "+(b.pos-4).toString()+' for file "'+a+'": '+b.data.length.toString():(b.pos+=6,d=b.readUInt16LE(),this.date=p(b.readUInt32LE()),b.readUInt32LE(),q=b.readUInt32LE(),n=b.readUInt32LE(),m=b.readUInt16LE(),g=b.readUInt16LE(),c=b.readUInt16LE(),b.pos+=8,f=b.readUInt32LE(),this.filename=runtime.byteArrayToString(b.data.slice(b.pos,b.pos+m),"utf8"),b.pos+=m+g+c))}function b(a,b){if(22!==a.length)b("Central directory length should be 22.",
m);else{var g=new core.ByteArray(a),s;s=g.readUInt32LE();101010256!==s?b("Central directory signature is wrong: "+s.toString(),m):(s=g.readUInt16LE(),0!==s?b("Zip files with non-zero disk numbers are not supported.",m):(s=g.readUInt16LE(),0!==s?b("Zip files with non-zero disk numbers are not supported.",m):(s=g.readUInt16LE(),t=g.readUInt16LE(),s!==t?b("Number of entries is inconsistent.",m):(s=g.readUInt32LE(),g=g.readUInt16LE(),g=u-22-s,runtime.read(e,g,u-g,function(a,g){if(a||null===g)b(a,m);else a:{var s=
new core.ByteArray(g),d,f;c=[];for(d=0;d<t;d+=1){f=new h(e,s);if(f.error){b(f.error,m);break a}c[c.length]=f}b(null,m)}})))))}}function f(a,b){var m=null,g,s;for(s=0;s<c.length;s+=1)if(g=c[s],g.filename===a){m=g;break}m?m.data?b(null,m.data):m.load(b):b(a+" not found.",null)}function d(a){var b=new core.ByteArrayWriter("utf8"),c=0;b.appendArray([80,75,3,4,20,0,0,0,0,0]);a.data&&(c=a.data.length);b.appendUInt32LE(r(a.date));b.appendUInt32LE(l(a.data));b.appendUInt32LE(c);b.appendUInt32LE(c);b.appendUInt16LE(a.filename.length);
b.appendUInt16LE(0);b.appendString(a.filename);a.data&&b.appendByteArray(a.data);return b}function a(a,b){var c=new core.ByteArrayWriter("utf8"),m=0;c.appendArray([80,75,1,2,20,0,20,0,0,0,0,0]);a.data&&(m=a.data.length);c.appendUInt32LE(r(a.date));c.appendUInt32LE(l(a.data));c.appendUInt32LE(m);c.appendUInt32LE(m);c.appendUInt16LE(a.filename.length);c.appendArray([0,0,0,0,0,0,0,0,0,0,0,0]);c.appendUInt32LE(b);c.appendString(a.filename);return c}function n(a,b){if(a===c.length)b(null);else{var m=c[a];
void 0!==m.data?n(a+1,b):m.load(function(c){c?b(c):n(a+1,b)})}}function q(b,m){n(0,function(g){if(g)m(g);else{g=new core.ByteArrayWriter("utf8");var s,f,q,n=[0];for(s=0;s<c.length;s+=1)g.appendByteArrayWriter(d(c[s])),n.push(g.getLength());q=g.getLength();for(s=0;s<c.length;s+=1)f=c[s],g.appendByteArrayWriter(a(f,n[s]));s=g.getLength()-q;g.appendArray([80,75,5,6,0,0,0,0]);g.appendUInt16LE(c.length);g.appendUInt16LE(c.length);g.appendUInt32LE(s);g.appendUInt32LE(q);g.appendArray([0,0]);b(g.getByteArray())}})}
function g(a,b){q(function(c){runtime.writeFile(a,c,b)},b)}var c,u,t,s=(new core.RawInflate).inflate,m=this,A=new core.Base64;this.load=f;this.save=function(a,b,m,g){var s,d;for(s=0;s<c.length;s+=1)if(d=c[s],d.filename===a){d.set(a,b,m,g);return}d=new h(e);d.set(a,b,m,g);c.push(d)};this.write=function(a){g(e,a)};this.writeAs=g;this.createByteArray=q;this.loadContentXmlAsFragments=function(a,b){m.loadAsString(a,function(a,c){if(a)return b.rootElementReady(a);b.rootElementReady(null,c,!0)})};this.loadAsString=
function(a,b){f(a,function(a,c){if(a||null===c)return b(a,null);var m=runtime.byteArrayToString(c,"utf8");b(null,m)})};this.loadAsDOM=function(a,b){m.loadAsString(a,function(a,c){if(a||null===c)b(a,null);else{var m=(new DOMParser).parseFromString(c,"text/xml");b(null,m)}})};this.loadAsDataURL=function(a,b,c){f(a,function(a,m){if(a)return c(a,null);var g=0,s;b||(b=80===m[1]&&78===m[2]&&71===m[3]?"image/png":255===m[0]&&216===m[1]&&255===m[2]?"image/jpeg":71===m[0]&&73===m[1]&&70===m[2]?"image/gif":
"");for(s="data:"+b+";base64,";g<m.length;)s+=A.convertUTF8ArrayToBase64(m.slice(g,Math.min(g+45E3,m.length))),g+=45E3;c(null,s)})};this.getEntries=function(){return c.slice()};u=-1;null===k?c=[]:runtime.getFileSize(e,function(a){u=a;0>u?k("File '"+e+"' cannot be read.",m):runtime.read(e,u-22,22,function(a,c){a||null===k||null===c?k(a,m):b(c,k)})})};
// Input 15
core.CSSUnits=function(){var e={"in":1,cm:2.54,mm:25.4,pt:72,pc:12};this.convert=function(k,l,p){return k*e[p]/e[l]};this.convertMeasure=function(e,l){var p,r;e&&l?(p=parseFloat(e),r=e.replace(p.toString(),""),p=this.convert(p,r,l)):p="";return p.toString()};this.getUnits=function(e){return e.substr(e.length-2,e.length)}};
// Input 16
xmldom.LSSerializerFilter=function(){};
// Input 17
"function"!==typeof Object.create&&(Object.create=function(e){var k=function(){};k.prototype=e;return new k});
xmldom.LSSerializer=function(){function e(e){var h=e||{},b=function(a){var b={},g;for(g in a)a.hasOwnProperty(g)&&(b[a[g]]=g);return b}(e),f=[h],d=[b],a=0;this.push=function(){a+=1;h=f[a]=Object.create(h);b=d[a]=Object.create(b)};this.pop=function(){f[a]=void 0;d[a]=void 0;a-=1;h=f[a];b=d[a]};this.getLocalNamespaceDefinitions=function(){return b};this.getQName=function(a){var d=a.namespaceURI,g=0,c;if(!d)return a.localName;if(c=b[d])return c+":"+a.localName;do{c||!a.prefix?(c="ns"+g,g+=1):c=a.prefix;
if(h[c]===d)break;if(!h[c]){h[c]=d;b[d]=c;break}c=null}while(null===c);return c+":"+a.localName}}function k(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&apos;").replace(/"/g,"&quot;")}function l(e,h){var b="",f=p.filter?p.filter.acceptNode(h):NodeFilter.FILTER_ACCEPT,d;if(f===NodeFilter.FILTER_ACCEPT&&h.nodeType===Node.ELEMENT_NODE){e.push();d=e.getQName(h);var a,n=h.attributes,q,g,c,u="",t;a="<"+d;q=n.length;for(g=0;g<q;g+=1)c=n.item(g),"http://www.w3.org/2000/xmlns/"!==
c.namespaceURI&&(t=p.filter?p.filter.acceptNode(c):NodeFilter.FILTER_ACCEPT,t===NodeFilter.FILTER_ACCEPT&&(t=e.getQName(c),c="string"===typeof c.value?k(c.value):c.value,u+=" "+(t+'="'+c+'"')));q=e.getLocalNamespaceDefinitions();for(g in q)q.hasOwnProperty(g)&&((n=q[g])?"xmlns"!==n&&(a+=" xmlns:"+q[g]+'="'+g+'"'):a+=' xmlns="'+g+'"');b+=a+(u+">")}if(f===NodeFilter.FILTER_ACCEPT||f===NodeFilter.FILTER_SKIP){for(f=h.firstChild;f;)b+=l(e,f),f=f.nextSibling;h.nodeValue&&(b+=k(h.nodeValue))}d&&(b+="</"+
d+">",e.pop());return b}var p=this;this.filter=null;this.writeToString=function(k,h){if(!k)return"";var b=new e(h);return l(b,k)}};
// Input 18
xmldom.RelaxNGParser=function(){function e(a,b){this.message=function(){b&&(a+=1===b.nodeType?" Element ":" Node ",a+=b.nodeName,b.nodeValue&&(a+=" with value '"+b.nodeValue+"'"),a+=".");return a}}function k(a){if(2>=a.e.length)return a;var b={name:a.name,e:a.e.slice(0,2)};return k({name:a.name,e:[b].concat(a.e.slice(2))})}function l(a){a=a.split(":",2);var b="",d;1===a.length?a=["",a[0]]:b=a[0];for(d in f)f[d]===b&&(a[0]=d);return a}function p(a,b){for(var d=0,g,c,f=a.name;a.e&&d<a.e.length;)if(g=
a.e[d],"ref"===g.name){c=b[g.a.name];if(!c)throw g.a.name+" was not defined.";g=a.e.slice(d+1);a.e=a.e.slice(0,d);a.e=a.e.concat(c.e);a.e=a.e.concat(g)}else d+=1,p(g,b);g=a.e;"choice"!==f||g&&g[1]&&"empty"!==g[1].name||(g&&g[0]&&"empty"!==g[0].name?(g[1]=g[0],g[0]={name:"empty"}):(delete a.e,a.name="empty"));if("group"===f||"interleave"===f)"empty"===g[0].name?"empty"===g[1].name?(delete a.e,a.name="empty"):(f=a.name=g[1].name,a.names=g[1].names,g=a.e=g[1].e):"empty"===g[1].name&&(f=a.name=g[0].name,
a.names=g[0].names,g=a.e=g[0].e);"oneOrMore"===f&&"empty"===g[0].name&&(delete a.e,a.name="empty");if("attribute"===f){c=a.names?a.names.length:0;for(var e,s=a.localnames=[c],m=a.namespaces=[c],d=0;d<c;d+=1)e=l(a.names[d]),m[d]=e[0],s[d]=e[1]}"interleave"===f&&("interleave"===g[0].name?a.e="interleave"===g[1].name?g[0].e.concat(g[1].e):[g[1]].concat(g[0].e):"interleave"===g[1].name&&(a.e=[g[0]].concat(g[1].e)))}function r(a,b){for(var d=0,g;a.e&&d<a.e.length;)g=a.e[d],"elementref"===g.name?(g.id=
g.id||0,a.e[d]=b[g.id]):"element"!==g.name&&r(g,b),d+=1}var h=this,b,f={"http://www.w3.org/XML/1998/namespace":"xml"},d;d=function(a,b,e){var g=[],c,h,t=a.localName,s=[];c=a.attributes;var m=t,p=s,r={},v,w;for(v=0;v<c.length;v+=1)if(w=c.item(v),w.namespaceURI)"http://www.w3.org/2000/xmlns/"===w.namespaceURI&&(f[w.value]=w.localName);else{"name"!==w.localName||"element"!==m&&"attribute"!==m||p.push(w.value);if("name"===w.localName||"combine"===w.localName||"type"===w.localName){var P=w,B;B=w.value;
B=B.replace(/^\s\s*/,"");for(var E=/\s/,O=B.length-1;E.test(B.charAt(O));)O-=1;B=B.slice(0,O+1);P.value=B}r[w.localName]=w.value}c=r;c.combine=c.combine||void 0;a=a.firstChild;m=g;p=s;for(r="";a;){if(a.nodeType===Node.ELEMENT_NODE&&"http://relaxng.org/ns/structure/1.0"===a.namespaceURI){if(v=d(a,b,m))"name"===v.name?p.push(f[v.a.ns]+":"+v.text):"choice"===v.name&&(v.names&&v.names.length)&&(p=p.concat(v.names),delete v.names),m.push(v)}else a.nodeType===Node.TEXT_NODE&&(r+=a.nodeValue);a=a.nextSibling}a=
r;"value"!==t&&"param"!==t&&(a=/^\s*([\s\S]*\S)?\s*$/.exec(a)[1]);"value"===t&&void 0===c.type&&(c.type="token",c.datatypeLibrary="");"attribute"!==t&&"element"!==t||void 0===c.name||(h=l(c.name),g=[{name:"name",text:h[1],a:{ns:h[0]}}].concat(g),delete c.name);"name"===t||"nsName"===t||"value"===t?void 0===c.ns&&(c.ns=""):delete c.ns;"name"===t&&(h=l(a),c.ns=h[0],a=h[1]);1<g.length&&("define"===t||"oneOrMore"===t||"zeroOrMore"===t||"optional"===t||"list"===t||"mixed"===t)&&(g=[{name:"group",e:k({name:"group",
e:g}).e}]);2<g.length&&"element"===t&&(g=[g[0]].concat({name:"group",e:k({name:"group",e:g.slice(1)}).e}));1===g.length&&"attribute"===t&&g.push({name:"text",text:a});1!==g.length||"choice"!==t&&"group"!==t&&"interleave"!==t?2<g.length&&("choice"===t||"group"===t||"interleave"===t)&&(g=k({name:t,e:g}).e):(t=g[0].name,s=g[0].names,c=g[0].a,a=g[0].text,g=g[0].e);"mixed"===t&&(t="interleave",g=[g[0],{name:"text"}]);"optional"===t&&(t="choice",g=[g[0],{name:"empty"}]);"zeroOrMore"===t&&(t="choice",g=
[{name:"oneOrMore",e:[g[0]]},{name:"empty"}]);if("define"===t&&c.combine){a:{m=c.combine;p=c.name;r=g;for(v=0;e&&v<e.length;v+=1)if(w=e[v],"define"===w.name&&w.a&&w.a.name===p){w.e=[{name:m,e:w.e.concat(r)}];e=w;break a}e=null}if(e)return}e={name:t};g&&0<g.length&&(e.e=g);for(h in c)if(c.hasOwnProperty(h)){e.a=c;break}void 0!==a&&(e.text=a);s&&0<s.length&&(e.names=s);"element"===t&&(e.id=b.length,b.push(e),e={name:"elementref",id:e.id});return e};this.parseRelaxNGDOM=function(a,n){var q=[],g=d(a&&
a.documentElement,q,void 0),c,u,t={};for(c=0;c<g.e.length;c+=1)u=g.e[c],"define"===u.name?t[u.a.name]=u:"start"===u.name&&(b=u);if(!b)return[new e("No Relax NG start element was found.")];p(b,t);for(c in t)t.hasOwnProperty(c)&&p(t[c],t);for(c=0;c<q.length;c+=1)p(q[c],t);n&&(h.rootPattern=n(b.e[0],q));r(b,q);for(c=0;c<q.length;c+=1)r(q[c],q);h.start=b;h.elements=q;h.nsmap=f;return null}};
// Input 19
runtime.loadClass("xmldom.RelaxNGParser");
xmldom.RelaxNG=function(){function e(a){return function(){var b;return function(){void 0===b&&(b=a());return b}}()}function k(a,b){return function(){var c={},m=0;return function(g){var s=g.hash||g.toString(),d;d=c[s];if(void 0!==d)return d;c[s]=d=b(g);d.hash=a+m.toString();m+=1;return d}}()}function l(a){return function(){var b={};return function(c){var m,g;g=b[c.localName];if(void 0===g)b[c.localName]=g={};else if(m=g[c.namespaceURI],void 0!==m)return m;return g[c.namespaceURI]=m=a(c)}}()}function p(a,
b,c){return function(){var m={},g=0;return function(s,d){var e=b&&b(s,d),f,t;if(void 0!==e)return e;e=s.hash||s.toString();f=d.hash||d.toString();t=m[e];if(void 0===t)m[e]=t={};else if(e=t[f],void 0!==e)return e;t[f]=e=c(s,d);e.hash=a+g.toString();g+=1;return e}}()}function r(a,b){"choice"===b.p1.type?r(a,b.p1):a[b.p1.hash]=b.p1;"choice"===b.p2.type?r(a,b.p2):a[b.p2.hash]=b.p2}function h(a,b){return{type:"element",nc:a,nullable:!1,textDeriv:function(){return v},startTagOpenDeriv:function(m){return a.contains(m)?
c(b,w):v},attDeriv:function(a,b){return v},startTagCloseDeriv:function(){return this}}}function b(){return{type:"list",nullable:!1,hash:"list",textDeriv:function(a,b){return w}}}function f(b,c,m,g){if(c===v)return v;if(g>=m.length)return c;0===g&&(g=0);for(var s=m.item(g);s.namespaceURI===a;){g+=1;if(g>=m.length)return c;s=m.item(g)}return s=f(b,c.attDeriv(b,m.item(g)),m,g+1)}function d(b,a,c){c.e[0].a?(b.push(c.e[0].text),a.push(c.e[0].a.ns)):d(b,a,c.e[0]);c.e[1].a?(b.push(c.e[1].text),a.push(c.e[1].a.ns)):
d(b,a,c.e[1])}var a="http://www.w3.org/2000/xmlns/",n,q,g,c,u,t,s,m,A,x,v={type:"notAllowed",nullable:!1,hash:"notAllowed",textDeriv:function(){return v},startTagOpenDeriv:function(){return v},attDeriv:function(){return v},startTagCloseDeriv:function(){return v},endTagDeriv:function(){return v}},w={type:"empty",nullable:!0,hash:"empty",textDeriv:function(){return v},startTagOpenDeriv:function(){return v},attDeriv:function(b,a){return v},startTagCloseDeriv:function(){return w},endTagDeriv:function(){return v}},
P={type:"text",nullable:!0,hash:"text",textDeriv:function(){return P},startTagOpenDeriv:function(){return v},attDeriv:function(){return v},startTagCloseDeriv:function(){return P},endTagDeriv:function(){return v}},B,E,O;n=p("choice",function(b,a){if(b===v)return a;if(a===v||b===a)return b},function(b,a){var c={},m;r(c,{p1:b,p2:a});a=b=void 0;for(m in c)c.hasOwnProperty(m)&&(void 0===b?b=c[m]:a=void 0===a?c[m]:n(a,c[m]));return function(a,b){return{type:"choice",p1:a,p2:b,nullable:a.nullable||b.nullable,
textDeriv:function(c,m){return n(a.textDeriv(c,m),b.textDeriv(c,m))},startTagOpenDeriv:l(function(c){return n(a.startTagOpenDeriv(c),b.startTagOpenDeriv(c))}),attDeriv:function(c,m){return n(a.attDeriv(c,m),b.attDeriv(c,m))},startTagCloseDeriv:e(function(){return n(a.startTagCloseDeriv(),b.startTagCloseDeriv())}),endTagDeriv:e(function(){return n(a.endTagDeriv(),b.endTagDeriv())})}}(b,a)});q=function(a,b,c){return function(){var m={},g=0;return function(s,d){var e=b&&b(s,d),f,t;if(void 0!==e)return e;
e=s.hash||s.toString();f=d.hash||d.toString();e<f&&(t=e,e=f,f=t,t=s,s=d,d=t);t=m[e];if(void 0===t)m[e]=t={};else if(e=t[f],void 0!==e)return e;t[f]=e=c(s,d);e.hash=a+g.toString();g+=1;return e}}()}("interleave",function(b,a){if(b===v||a===v)return v;if(b===w)return a;if(a===w)return b},function(b,a){return{type:"interleave",p1:b,p2:a,nullable:b.nullable&&a.nullable,textDeriv:function(c,m){return n(q(b.textDeriv(c,m),a),q(b,a.textDeriv(c,m)))},startTagOpenDeriv:l(function(c){return n(B(function(b){return q(b,
a)},b.startTagOpenDeriv(c)),B(function(a){return q(b,a)},a.startTagOpenDeriv(c)))}),attDeriv:function(c,m){return n(q(b.attDeriv(c,m),a),q(b,a.attDeriv(c,m)))},startTagCloseDeriv:e(function(){return q(b.startTagCloseDeriv(),a.startTagCloseDeriv())})}});g=p("group",function(b,a){if(b===v||a===v)return v;if(b===w)return a;if(a===w)return b},function(b,a){return{type:"group",p1:b,p2:a,nullable:b.nullable&&a.nullable,textDeriv:function(c,m){var s=g(b.textDeriv(c,m),a);return b.nullable?n(s,a.textDeriv(c,
m)):s},startTagOpenDeriv:function(c){var m=B(function(b){return g(b,a)},b.startTagOpenDeriv(c));return b.nullable?n(m,a.startTagOpenDeriv(c)):m},attDeriv:function(c,m){return n(g(b.attDeriv(c,m),a),g(b,a.attDeriv(c,m)))},startTagCloseDeriv:e(function(){return g(b.startTagCloseDeriv(),a.startTagCloseDeriv())})}});c=p("after",function(b,a){if(b===v||a===v)return v},function(b,a){return{type:"after",p1:b,p2:a,nullable:!1,textDeriv:function(m,g){return c(b.textDeriv(m,g),a)},startTagOpenDeriv:l(function(m){return B(function(b){return c(b,
a)},b.startTagOpenDeriv(m))}),attDeriv:function(m,g){return c(b.attDeriv(m,g),a)},startTagCloseDeriv:e(function(){return c(b.startTagCloseDeriv(),a)}),endTagDeriv:e(function(){return b.nullable?a:v})}});u=k("oneormore",function(b){return b===v?v:{type:"oneOrMore",p:b,nullable:b.nullable,textDeriv:function(a,c){return g(b.textDeriv(a,c),n(this,w))},startTagOpenDeriv:function(a){var c=this;return B(function(b){return g(b,n(c,w))},b.startTagOpenDeriv(a))},attDeriv:function(a,c){return g(b.attDeriv(a,
c),n(this,w))},startTagCloseDeriv:e(function(){return u(b.startTagCloseDeriv())})}});s=p("attribute",void 0,function(b,a){return{type:"attribute",nullable:!1,nc:b,p:a,attDeriv:function(c,m){return b.contains(m)&&(a.nullable&&/^\s+$/.test(m.nodeValue)||a.textDeriv(c,m.nodeValue).nullable)?w:v},startTagCloseDeriv:function(){return v}}});t=k("value",function(b){return{type:"value",nullable:!1,value:b,textDeriv:function(a,c){return c===b?w:v},attDeriv:function(){return v},startTagCloseDeriv:function(){return this}}});
A=k("data",function(b){return{type:"data",nullable:!1,dataType:b,textDeriv:function(){return w},attDeriv:function(){return v},startTagCloseDeriv:function(){return this}}});B=function J(b,a){return"after"===a.type?c(a.p1,b(a.p2)):"choice"===a.type?n(J(b,a.p1),J(b,a.p2)):a};E=function(b,a,c){var m=c.currentNode;a=a.startTagOpenDeriv(m);a=f(b,a,m.attributes,0);var g=a=a.startTagCloseDeriv(),m=c.currentNode;a=c.firstChild();for(var s=[],d;a;)a.nodeType===Node.ELEMENT_NODE?s.push(a):a.nodeType!==Node.TEXT_NODE||
/^\s*$/.test(a.nodeValue)||s.push(a.nodeValue),a=c.nextSibling();0===s.length&&(s=[""]);d=g;for(g=0;d!==v&&g<s.length;g+=1)a=s[g],"string"===typeof a?d=/^\s*$/.test(a)?n(d,d.textDeriv(b,a)):d.textDeriv(b,a):(c.currentNode=a,d=E(b,d,c));c.currentNode=m;return a=d.endTagDeriv()};m=function(a){var b,c,m;if("name"===a.name)b=a.text,c=a.a.ns,a={name:b,ns:c,hash:"{"+c+"}"+b,contains:function(a){return a.namespaceURI===c&&a.localName===b}};else if("choice"===a.name){b=[];c=[];d(b,c,a);a="";for(m=0;m<b.length;m+=
1)a+="{"+c[m]+"}"+b[m]+",";a={hash:a,contains:function(a){var m;for(m=0;m<b.length;m+=1)if(b[m]===a.localName&&c[m]===a.namespaceURI)return!0;return!1}}}else a={hash:"anyName",contains:function(){return!0}};return a};x=function C(a,c){var d,e;if("elementref"===a.name){d=a.id||0;a=c[d];if(void 0!==a.name){var f=a;d=c[f.id]={hash:"element"+f.id.toString()};f=h(m(f.e[0]),x(f.e[1],c));for(e in f)f.hasOwnProperty(e)&&(d[e]=f[e]);return d}return a}switch(a.name){case "empty":return w;case "notAllowed":return v;
case "text":return P;case "choice":return n(C(a.e[0],c),C(a.e[1],c));case "interleave":d=C(a.e[0],c);for(e=1;e<a.e.length;e+=1)d=q(d,C(a.e[e],c));return d;case "group":return g(C(a.e[0],c),C(a.e[1],c));case "oneOrMore":return u(C(a.e[0],c));case "attribute":return s(m(a.e[0]),C(a.e[1],c));case "value":return t(a.text);case "data":return d=a.a&&a.a.type,void 0===d&&(d=""),A(d);case "list":return b()}throw"No support for "+a.name;};this.makePattern=function(a,b){var c={},m;for(m in b)b.hasOwnProperty(m)&&
(c[m]=b[m]);return m=x(a,c)};this.validate=function(a,b){var c;a.currentNode=a.root;c=E(null,O,a);c.nullable?b(null):(runtime.log("Error in Relax NG validation: "+c),b(["Error in Relax NG validation: "+c]))};this.init=function(a){O=a}};
// Input 20
runtime.loadClass("xmldom.RelaxNGParser");
xmldom.RelaxNG2=function(){function e(b,e){this.message=function(){e&&(b+=e.nodeType===Node.ELEMENT_NODE?" Element ":" Node ",b+=e.nodeName,e.nodeValue&&(b+=" with value '"+e.nodeValue+"'"),b+=".");return b}}function k(b,e,d,a){return"empty"===b.name?null:r(b,e,d,a)}function l(b,f,d){if(2!==b.e.length)throw"Element with wrong # of elements: "+b.e.length;for(var a=(d=f.currentNode)?d.nodeType:0,n=null;a>Node.ELEMENT_NODE;){if(a!==Node.COMMENT_NODE&&(a!==Node.TEXT_NODE||!/^\s+$/.test(f.currentNode.nodeValue)))return[new e("Not allowed node of type "+
a+".")];a=(d=f.nextSibling())?d.nodeType:0}if(!d)return[new e("Missing element "+b.names)];if(b.names&&-1===b.names.indexOf(h[d.namespaceURI]+":"+d.localName))return[new e("Found "+d.nodeName+" instead of "+b.names+".",d)];if(f.firstChild()){for(n=k(b.e[1],f,d);f.nextSibling();)if(a=f.currentNode.nodeType,!(f.currentNode&&f.currentNode.nodeType===Node.TEXT_NODE&&/^\s+$/.test(f.currentNode.nodeValue)||a===Node.COMMENT_NODE))return[new e("Spurious content.",f.currentNode)];if(f.parentNode()!==d)return[new e("Implementation error.")]}else n=
k(b.e[1],f,d);f.nextSibling();return n}var p,r,h;r=function(b,f,d,a){var n=b.name,q=null;if("text"===n)a:{for(var g=(b=f.currentNode)?b.nodeType:0;b!==d&&3!==g;){if(1===g){q=[new e("Element not allowed here.",b)];break a}g=(b=f.nextSibling())?b.nodeType:0}f.nextSibling();q=null}else if("data"===n)q=null;else if("value"===n)a!==b.text&&(q=[new e("Wrong value, should be '"+b.text+"', not '"+a+"'",d)]);else if("list"===n)q=null;else if("attribute"===n)a:{if(2!==b.e.length)throw"Attribute with wrong # of elements: "+
b.e.length;n=b.localnames.length;for(q=0;q<n;q+=1){a=d.getAttributeNS(b.namespaces[q],b.localnames[q]);""!==a||d.hasAttributeNS(b.namespaces[q],b.localnames[q])||(a=void 0);if(void 0!==g&&void 0!==a){q=[new e("Attribute defined too often.",d)];break a}g=a}q=void 0===g?[new e("Attribute not found: "+b.names,d)]:k(b.e[1],f,d,g)}else if("element"===n)q=l(b,f,d);else if("oneOrMore"===n){a=0;do g=f.currentNode,n=r(b.e[0],f,d),a+=1;while(!n&&g!==f.currentNode);1<a?(f.currentNode=g,q=null):q=n}else if("choice"===
n){if(2!==b.e.length)throw"Choice with wrong # of options: "+b.e.length;g=f.currentNode;if("empty"===b.e[0].name){if(n=r(b.e[1],f,d,a))f.currentNode=g;q=null}else{if(n=k(b.e[0],f,d,a))f.currentNode=g,n=r(b.e[1],f,d,a);q=n}}else if("group"===n){if(2!==b.e.length)throw"Group with wrong # of members: "+b.e.length;q=r(b.e[0],f,d)||r(b.e[1],f,d)}else if("interleave"===n)a:{g=b.e.length;a=[g];for(var c=g,h,t,s,m;0<c;){h=0;t=f.currentNode;for(q=0;q<g;q+=1)s=f.currentNode,!0!==a[q]&&a[q]!==s&&(m=b.e[q],(n=
r(m,f,d))?(f.currentNode=s,void 0===a[q]&&(a[q]=!1)):s===f.currentNode||"oneOrMore"===m.name||"choice"===m.name&&("oneOrMore"===m.e[0].name||"oneOrMore"===m.e[1].name)?(h+=1,a[q]=s):(h+=1,a[q]=!0));if(t===f.currentNode&&h===c){q=null;break a}if(0===h){for(q=0;q<g;q+=1)if(!1===a[q]){q=[new e("Interleave does not match.",d)];break a}q=null;break a}for(q=c=0;q<g;q+=1)!0!==a[q]&&(c+=1)}q=null}else throw n+" not allowed in nonEmptyPattern.";return q};this.validate=function(b,e){b.currentNode=b.root;var d=
k(p.e[0],b,b.root);e(d)};this.init=function(b,e){p=b;h=e}};
// Input 21
xmldom.OperationalTransformInterface=function(){};xmldom.OperationalTransformInterface.prototype.retain=function(e){};xmldom.OperationalTransformInterface.prototype.insertCharacters=function(e){};xmldom.OperationalTransformInterface.prototype.insertElementStart=function(e,k){};xmldom.OperationalTransformInterface.prototype.insertElementEnd=function(){};xmldom.OperationalTransformInterface.prototype.deleteCharacters=function(e){};xmldom.OperationalTransformInterface.prototype.deleteElementStart=function(){};
xmldom.OperationalTransformInterface.prototype.deleteElementEnd=function(){};xmldom.OperationalTransformInterface.prototype.replaceAttributes=function(e){};xmldom.OperationalTransformInterface.prototype.updateAttributes=function(e){};
// Input 22
xmldom.OperationalTransformDOM=function(e,k){this.retain=function(e){};this.insertCharacters=function(e){};this.insertElementStart=function(e,k){};this.insertElementEnd=function(){};this.deleteCharacters=function(e){};this.deleteElementStart=function(){};this.deleteElementEnd=function(){};this.replaceAttributes=function(e){};this.updateAttributes=function(e){};this.atEnd=function(){return!0}};
// Input 23
xmldom.XPathIterator=function(){};
xmldom.XPath=function(){function e(a,b,c){return-1!==a&&(a<b||-1===b)&&(a<c||-1===c)}function k(a){for(var b=[],c=0,d=a.length,f;c<d;){var s=a,m=d,h=b,k="",l=[],p=s.indexOf("[",c),r=s.indexOf("/",c),B=s.indexOf("=",c);e(r,p,B)?(k=s.substring(c,r),c=r+1):e(p,r,B)?(k=s.substring(c,p),c=n(s,p,l)):e(B,r,p)?(k=s.substring(c,B),c=B):(k=s.substring(c,m),c=m);h.push({location:k,predicates:l});if(c<d&&"="===a[c]){f=a.substring(c+1,d);if(2<f.length&&("'"===f[0]||'"'===f[0]))f=f.slice(1,f.length-1);else try{f=
parseInt(f,10)}catch(E){}c=d}}return{steps:b,value:f}}function l(){var a,b=!1;this.setNode=function(b){a=b};this.reset=function(){b=!1};this.next=function(){var c=b?null:a;b=!0;return c}}function p(a,b,c){this.reset=function(){a.reset()};this.next=function(){for(var d=a.next();d&&!(d=d.getAttributeNodeNS(b,c));)d=a.next();return d}}function r(a,b){var c=a.next(),d=null;this.reset=function(){a.reset();c=a.next();d=null};this.next=function(){for(;c;){if(d)if(b&&d.firstChild)d=d.firstChild;else{for(;!d.nextSibling&&
d!==c;)d=d.parentNode;d===c?c=a.next():d=d.nextSibling}else{do(d=c.firstChild)||(c=a.next());while(c&&!d)}if(d&&d.nodeType===Node.ELEMENT_NODE)return d}return null}}function h(a,b){this.reset=function(){a.reset()};this.next=function(){for(var c=a.next();c&&!b(c);)c=a.next();return c}}function b(a,b,c){b=b.split(":",2);var d=c(b[0]),e=b[1];return new h(a,function(a){return a.localName===e&&a.namespaceURI===d})}function f(b,g,c){var d=new l,e=a(d,g,c),s=g.value;return void 0===s?new h(b,function(a){d.setNode(a);
e.reset();return e.next()}):new h(b,function(a){d.setNode(a);e.reset();return(a=e.next())&&a.nodeValue===s})}function d(b,g,c){var d=b.ownerDocument,e=[],s=null;if(d&&d.evaluate)for(c=d.evaluate(g,b,c,XPathResult.UNORDERED_NODE_ITERATOR_TYPE,null),s=c.iterateNext();null!==s;)s.nodeType===Node.ELEMENT_NODE&&e.push(s),s=c.iterateNext();else{e=new l;e.setNode(b);b=k(g);e=a(e,b,c);b=[];for(c=e.next();c;)b.push(c),c=e.next();e=b}return e}var a,n;n=function(a,b,c){for(var d=b,e=a.length,s=0;d<e;)"]"===
a[d]?(s-=1,0>=s&&c.push(k(a.substring(b,d)))):"["===a[d]&&(0>=s&&(b=d+1),s+=1),d+=1;return d};xmldom.XPathIterator.prototype.next=function(){};xmldom.XPathIterator.prototype.reset=function(){};a=function(a,g,c){var d,e,s,m;for(d=0;d<g.steps.length;d+=1)for(s=g.steps[d],e=s.location,""===e?a=new r(a,!1):"@"===e[0]?(m=e.slice(1).split(":",2),a=new p(a,c(m[0]),m[1])):"."!==e&&(a=new r(a,!1),-1!==e.indexOf(":")&&(a=b(a,e,c))),e=0;e<s.predicates.length;e+=1)m=s.predicates[e],a=f(a,m,c);return a};xmldom.XPath=
function(){this.getODFElementsWithXPath=d};return xmldom.XPath}();
// Input 24
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
odf.Namespaces=function(){function e(e){return k[e]||null}var k={draw:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",fo:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",office:"urn:oasis:names:tc:opendocument:xmlns:office:1.0",presentation:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",style:"urn:oasis:names:tc:opendocument:xmlns:style:1.0",svg:"urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0",table:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",text:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace"},l;e.lookupNamespaceURI=e;l=function(){};l.forEachPrefix=function(e){for(var l in k)k.hasOwnProperty(l)&&e(l,k[l])};l.resolvePrefix=e;l.namespaceMap=k;l.drawns="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0";l.fons="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0";l.officens="urn:oasis:names:tc:opendocument:xmlns:office:1.0";l.presentationns="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0";l.stylens=
"urn:oasis:names:tc:opendocument:xmlns:style:1.0";l.svgns="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0";l.tablens="urn:oasis:names:tc:opendocument:xmlns:table:1.0";l.textns="urn:oasis:names:tc:opendocument:xmlns:text:1.0";l.xlinkns="http://www.w3.org/1999/xlink";l.xmlns="http://www.w3.org/XML/1998/namespace";return l}();
// Input 25
runtime.loadClass("xmldom.XPath");
odf.StyleInfo=function(){function e(a,b){for(var c=g[a.localName],m=c&&c[a.namespaceURI],d=m?m.length:0,f,c=0;c<d;c+=1)(f=a.getAttributeNS(m[c].ns,m[c].localname))&&a.setAttributeNS(m[c].ns,n[m[c].ns]+m[c].localname,b+f);for(c=a.firstChild;c;)c.nodeType===Node.ELEMENT_NODE&&(m=c,e(m,b)),c=c.nextSibling}function k(a,b){for(var c=g[a.localName],m=c&&c[a.namespaceURI],d=m?m.length:0,e,c=0;c<d;c+=1)if(e=a.getAttributeNS(m[c].ns,m[c].localname))e=e.replace(b,""),a.setAttributeNS(m[c].ns,n[m[c].ns]+m[c].localname,
e);for(c=a.firstChild;c;)c.nodeType===Node.ELEMENT_NODE&&(m=c,k(m,b)),c=c.nextSibling}function l(a,b){var c=g[a.localName],m=(c=c&&c[a.namespaceURI])?c.length:0,d,e,f;for(f=0;f<m;f+=1)if(d=a.getAttributeNS(c[f].ns,c[f].localname))b=b||{},e=c[f].keyname,e=b[e]=b[e]||{},e[d]=1;return b}function p(a,b){var c,m;l(a,b);for(c=a.firstChild;c;)c.nodeType===Node.ELEMENT_NODE&&(m=c,p(m,b)),c=c.nextSibling}function r(a,b,c){this.key=a;this.name=b;this.family=c;this.requires={}}function h(a,b,c){var m=a+'"'+
b,d=c[m];d||(d=c[m]=new r(m,a,b));return d}function b(c,d,e){var m=g[c.localName],f=(m=m&&m[c.namespaceURI])?m.length:0,n=c.getAttributeNS(a,"name"),q=c.getAttributeNS(a,"family"),k;n&&q&&(d=h(n,q,e));if(d)for(n=0;n<f;n+=1)if(q=c.getAttributeNS(m[n].ns,m[n].localname))k=m[n].keyname,q=h(q,k,e),d.requires[q.key]=q;for(n=c.firstChild;n;)n.nodeType===Node.ELEMENT_NODE&&(c=n,b(c,d,e)),n=n.nextSibling;return e}function f(a,b){var c=b[a.family];c||(c=b[a.family]={});c[a.name]=1;Object.keys(a.requires).forEach(function(c){f(a.requires[c],
b)})}function d(a,c){var d=b(a,null,{});Object.keys(d).forEach(function(a){a=d[a];var b=c[a.family];b&&b.hasOwnProperty(a.name)&&f(a,c)})}var a="urn:oasis:names:tc:opendocument:xmlns:style:1.0",n={"urn:oasis:names:tc:opendocument:xmlns:chart:1.0":"chart:","urn:oasis:names:tc:opendocument:xmlns:database:1.0":"db:","urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0":"dr3d:","urn:oasis:names:tc:opendocument:xmlns:drawing:1.0":"draw:","urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0":"fo:","urn:oasis:names:tc:opendocument:xmlns:form:1.0":"form:",
"urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0":"number:","urn:oasis:names:tc:opendocument:xmlns:office:1.0":"office:","urn:oasis:names:tc:opendocument:xmlns:presentation:1.0":"presentation:","urn:oasis:names:tc:opendocument:xmlns:style:1.0":"style:","urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0":"svg:","urn:oasis:names:tc:opendocument:xmlns:table:1.0":"table:","urn:oasis:names:tc:opendocument:xmlns:text:1.0":"chart:","http://www.w3.org/XML/1998/namespace":"xml:"},q={text:[{ens:a,
en:"tab-stop",ans:a,a:"leader-text-style"},{ens:a,en:"drop-cap",ans:a,a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"notes-configuration",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"citation-body-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"notes-configuration",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"citation-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"a",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"alphabetical-index",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"linenumbering-configuration",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"list-level-style-number",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
en:"ruby-text",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"span",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"a",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"visited-style-name"},{ens:a,en:"text-properties",ans:a,a:"text-line-through-text-style"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"alphabetical-index-source",
ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"main-entry-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-entry-bibliography",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-entry-chapter",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-entry-link-end",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-entry-link-start",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-entry-page-number",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-entry-span",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
en:"index-entry-tab-stop",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-entry-text",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-title-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"list-level-style-bullet",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"outline-level-style",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"}],paragraph:[{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"caption",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"circle",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
en:"connector",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"control",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"custom-shape",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"ellipse",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"frame",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"line",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"measure",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
en:"path",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"polygon",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"polyline",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"rect",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"regular-polygon",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:office:1.0",en:"annotation",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"text-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:form:1.0",en:"column",ans:"urn:oasis:names:tc:opendocument:xmlns:form:1.0",a:"text-style-name"},{ens:a,en:"style",ans:a,a:"next-style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"body",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"even-columns",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"even-rows",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",
en:"first-column",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"first-row",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"last-column",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"last-row",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",
a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"odd-columns",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"odd-rows",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"paragraph-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"notes-configuration",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"default-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
en:"alphabetical-index-entry-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"bibliography-entry-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"h",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"illustration-index-entry-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-source-style",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"object-index-entry-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"p",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
en:"table-index-entry-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"table-of-content-entry-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"table-index-entry-template",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-index-entry-template",
ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:a,en:"page-layout-properties",ans:a,a:"register-truth-ref-style-name"}],chart:[{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"axis",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"chart",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"data-label",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"data-point",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"equation",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"error-indicator",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"floor",
ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"footer",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"grid",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"legend",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",
en:"mean-value",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"plot-area",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"regression-curve",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"series",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"stock-gain-marker",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"stock-loss-marker",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"stock-range-line",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"subtitle",
ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"title",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",en:"wall",ans:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",a:"style-name"}],section:[{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"alphabetical-index",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
en:"bibliography",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"illustration-index",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"index-title",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"object-index",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"section",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"table-of-content",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"table-index",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-index",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
a:"style-name"}],ruby:[{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"ruby",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"}],table:[{ens:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",en:"query",ans:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",en:"table-representation",ans:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",
en:"background",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"table",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"}],"table-column":[{ens:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",en:"column",ans:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"table-column",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",
a:"style-name"}],"table-row":[{ens:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",en:"query",ans:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",a:"default-row-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",en:"table-representation",ans:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",a:"default-row-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"table-row",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"}],"table-cell":[{ens:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",
en:"column",ans:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",a:"default-cell-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"table-column",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"default-cell-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"table-row",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"default-cell-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"body",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"covered-table-cell",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"even-columns",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"covered-table-cell",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",
en:"even-columns",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"even-rows",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"first-column",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"first-row",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"last-column",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"last-row",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"odd-columns",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"odd-rows",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",en:"table-cell",ans:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",a:"style-name"}],graphic:[{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"cube",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"extrude",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"rotate",
ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"scene",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"sphere",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"caption",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
en:"circle",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"connector",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"control",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"custom-shape",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"ellipse",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"frame",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"g",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"line",
ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"measure",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"page-thumbnail",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"path",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"polygon",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"polyline",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"rect",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"regular-polygon",
ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:office:1.0",en:"annotation",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"}],presentation:[{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"cube",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"extrude",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"rotate",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"scene",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",en:"sphere",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"caption",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"circle",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"connector",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"control",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
en:"custom-shape",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"ellipse",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"frame",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"g",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"line",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"measure",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"page-thumbnail",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
en:"path",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"polygon",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"polyline",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"rect",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",
a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"regular-polygon",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:office:1.0",en:"annotation",ans:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",a:"style-name"}],"drawing-page":[{ens:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",en:"page",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",
en:"notes",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:a,en:"handout-master",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"},{ens:a,en:"master-page",ans:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",a:"style-name"}],"list-style":[{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"list",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"numbered-paragraph",
ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"list-item",ans:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",a:"style-override"},{ens:a,en:"style",ans:a,a:"list-style-name"},{ens:a,en:"style",ans:a,a:"data-style-name"},{ens:a,en:"style",ans:a,a:"percentage-data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",en:"date-time-decl",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
en:"creation-date",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"creation-time",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"database-display",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"date",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"editing-duration",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"expression",
ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"meta-field",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"modification-date",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"modification-time",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"print-date",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"print-time",ans:a,
a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"table-formula",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"time",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-defined",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-field-get",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-field-input",ans:a,a:"data-style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"variable-get",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"variable-input",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"variable-set",ans:a,a:"data-style-name"}],data:[{ens:a,en:"style",ans:a,a:"data-style-name"},{ens:a,en:"style",ans:a,a:"percentage-data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",en:"date-time-decl",ans:a,a:"data-style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"creation-date",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"creation-time",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"database-display",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"date",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"editing-duration",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",
en:"expression",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"meta-field",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"modification-date",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"modification-time",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"print-date",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"print-time",
ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"table-formula",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"time",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-defined",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-field-get",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"user-field-input",ans:a,a:"data-style-name"},
{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"variable-get",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"variable-input",ans:a,a:"data-style-name"},{ens:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",en:"variable-set",ans:a,a:"data-style-name"}],"page-layout":[{ens:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",en:"notes",ans:a,a:"page-layout-name"},{ens:a,en:"handout-master",ans:a,a:"page-layout-name"},{ens:a,en:"master-page",ans:a,
a:"page-layout-name"}]},g,c=new xmldom.XPath;this.UsedStyleList=function(b,c){var g={};this.uses=function(b){var c=b.localName,d=b.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:drawing:1.0","name")||b.getAttributeNS(a,"name");b="style"===c?b.getAttributeNS(a,"family"):"urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0"===b.namespaceURI?"data":c;return(b=g[b])?0<b[d]:!1};p(b,g);c&&d(c,g)};this.canElementHaveStyle=function(a,b){var c=g[b.localName],c=c&&c[b.namespaceURI];return 0<(c?c.length:
0)};this.hasDerivedStyles=function(a,b,d){var m=b("style"),g=d.getAttributeNS(m,"name");d=d.getAttributeNS(m,"family");return c.getODFElementsWithXPath(a,"//style:*[@style:parent-style-name='"+g+"'][@style:family='"+d+"']",b).length?!0:!1};this.prefixStyleNames=function(b,c,d){var m;if(b){for(m=b.firstChild;m;){if(m.nodeType===Node.ELEMENT_NODE){var g=m,f=c,h=g.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:drawing:1.0","name"),q=void 0;h?q="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0":
(h=g.getAttributeNS(a,"name"))&&(q=a);q&&g.setAttributeNS(q,n[q]+"name",f+h)}m=m.nextSibling}e(b,c);d&&e(d,c)}};this.removePrefixFromStyleNames=function(b,c,d){var m=RegExp("^"+c);if(b){for(c=b.firstChild;c;){if(c.nodeType===Node.ELEMENT_NODE){var g=c,e=m,f=g.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:drawing:1.0","name"),h=void 0;f?h="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0":(f=g.getAttributeNS(a,"name"))&&(h=a);h&&(f=f.replace(e,""),g.setAttributeNS(h,n[h]+"name",f))}c=c.nextSibling}k(b,
m);d&&k(d,m)}};this.determineStylesForNode=l;g=function(a){var b,c,m,d,g,e={},f;for(b in a)if(a.hasOwnProperty(b))for(d=a[b],m=d.length,c=0;c<m;c+=1)g=d[c],f=e[g.en]=e[g.en]||{},f=f[g.ens]=f[g.ens]||[],f.push({ns:g.ans,localname:g.a,keyname:b});return e}(q)};
// Input 26
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
odf.OdfUtils=function(){function e(a){var b=a&&a.localName;return("p"===b||"h"===b)&&a.namespaceURI===u}function k(a){return/^[ \t\r\n]+$/.test(a)}function l(a){var b=a&&a.localName;return("span"===b||"p"===b||"h"===b)&&a.namespaceURI===u}function p(a){var b=a&&a.localName,c,d=!1;b&&(c=a.namespaceURI,c===u?d="s"===b||"tab"===b||"line-break"===b:c===t&&(d="frame"===b&&"as-char"===a.getAttributeNS(u,"anchor-type")));return d}function r(a){for(;null!==a.firstChild&&l(a);)a=a.firstChild;return a}function h(a){for(;null!==
a.lastChild&&l(a);)a=a.lastChild;return a}function b(a){for(;!e(a)&&null===a.previousSibling;)a=a.parentNode;return e(a)?null:h(a.previousSibling)}function f(a){for(;!e(a)&&null===a.nextSibling;)a=a.parentNode;return e(a)?null:r(a.nextSibling)}function d(a){for(var c=!1;a;)if(a.nodeType===Node.TEXT_NODE)if(0===a.length)a=b(a);else return!k(a.data.substr(a.length-1,1));else if(p(a)){c=!0;break}else a=b(a);return c}function a(a){var c=!1;for(a=a&&h(a);a;){if(a.nodeType===Node.TEXT_NODE&&0<a.length&&
!k(a.data)){c=!0;break}else if(p(a)){c=!0;break}a=b(a)}return c}function n(a){var b=!1;for(a=a&&r(a);a;){if(a.nodeType===Node.TEXT_NODE&&0<a.length&&!k(a.data)){b=!0;break}else if(p(a)){b=!0;break}a=f(a)}return b}function q(a,b){return k(a.data.substr(b))?!n(f(a)):!1}function g(a){return(a=/-?([0-9]*[0-9][0-9]*(\.[0-9]*)?|0+\.[0-9]*[1-9][0-9]*|\.[0-9]*[1-9][0-9]*)((cm)|(mm)|(in)|(pt)|(pc)|(px)|(%))/.exec(a))?{value:parseFloat(a[1]),unit:a[3]}:null}function c(a){return(a=g(a))&&"%"!==a.unit?null:a}
var u="urn:oasis:names:tc:opendocument:xmlns:text:1.0",t="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",s=/^\s*$/;this.isParagraph=e;this.getParagraphElement=function(a){for(;a&&!e(a);)a=a.parentNode;return a};this.isListItem=function(a){return"list-item"===(a&&a.localName)&&a.namespaceURI===u};this.isODFWhitespace=k;this.isGroupingElement=l;this.isCharacterElement=p;this.firstChild=r;this.lastChild=h;this.previousNode=b;this.nextNode=f;this.scanLeftForNonWhitespace=d;this.lookLeftForCharacter=
function(a){var c;c=0;a.nodeType===Node.TEXT_NODE&&0<a.length?(c=a.data,c=k(c.substr(c.length-1,1))?1===c.length?d(b(a))?2:0:k(c.substr(c.length-2,1))?0:2:1):p(a)&&(c=1);return c};this.lookRightForCharacter=function(a){var b=!1;a&&a.nodeType===Node.TEXT_NODE&&0<a.length?b=!k(a.data.substr(0,1)):p(a)&&(b=!0);return b};this.scanLeftForAnyCharacter=a;this.scanRightForAnyCharacter=n;this.isTrailingWhitespace=q;this.isSignificantWhitespace=function(c,g){var e=c.data,f;if(!k(e[g]))return!1;if(0<g){if(!k(e[g-
1]))return!0;if(1<g)if(!k(e[g-2]))f=!0;else{if(!k(e.substr(0,g)))return!1}else d(b(c))&&(f=!0);if(!0===f)return q(c,g)?!1:!0;e=e[g+1];return k(e)?!1:a(b(c))?!1:!0}return!1};this.getFirstNonWhitespaceChild=function(a){for(a=a.firstChild;a&&a.nodeType===Node.TEXT_NODE&&s.test(a.nodeValue);)a=a.nextSibling;return a};this.parseLength=g;this.parseFoFontSize=function(a){var b;b=(b=g(a))&&(0>=b.value||"%"===b.unit)?null:b;return b||c(a)};this.parseFoLineHeight=function(a){var b;b=(b=g(a))&&(0>b.value||"%"===
b.unit)?null:b;return b||c(a)};this.getTextNodes=function(a,b){var c=a.startContainer.ownerDocument,d=c.createRange(),g=[],e;e=c.createTreeWalker(a.commonAncestorContainer.nodeType===Node.TEXT_NODE?a.commonAncestorContainer.parentNode:a.commonAncestorContainer,NodeFilter.SHOW_ALL,function(c){d.selectNodeContents(c);if(!1===b&&c.nodeType===Node.TEXT_NODE){if(0>=a.compareBoundaryPoints(a.START_TO_START,d)&&0<=a.compareBoundaryPoints(a.END_TO_END,d))return NodeFilter.FILTER_ACCEPT}else if(-1===a.compareBoundaryPoints(a.END_TO_START,
d)&&1===a.compareBoundaryPoints(a.START_TO_END,d))return c.nodeType===Node.TEXT_NODE?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;return NodeFilter.FILTER_REJECT},!1);e.currentNode=a.startContainer.previousSibling||a.startContainer.parentNode;for(c=e.nextNode();c;)g.push(c),c=e.nextNode();d.detach();return g}};
// Input 27
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("core.LoopWatchDog");runtime.loadClass("odf.Namespaces");runtime.loadClass("odf.OdfUtils");
odf.TextStyleApplicator=function(e,k){function l(a){function b(a,c){return"object"===typeof a&&"object"===typeof c?Object.keys(a).every(function(d){return b(a[d],c[d])}):a===c}this.isStyleApplied=function(d){d=e.getAppliedStylesForElement(d);return b(a,d)}}function p(a){var b={};this.applyStyleToContainer=function(d){var f;f=d.getAttributeNS(n,"style-name");var m=d.ownerDocument;f=f||"";if(!b.hasOwnProperty(f)){var h=f,l=f,p;l?(p=e.getStyleElement(l,"text"),p.parentNode===k?m=p.cloneNode(!0):(m=m.createElementNS(q,
"style:style"),m.setAttributeNS(q,"style:parent-style-name",l),m.setAttributeNS(q,"style:family","text"),m.setAttributeNS(g,"scope","document-content"))):(m=m.createElementNS(q,"style:style"),m.setAttributeNS(q,"style:family","text"),m.setAttributeNS(g,"scope","document-content"));e.updateStyle(m,a,!0);k.appendChild(m);b[h]=m}f=b[f].getAttributeNS(q,"name");d.setAttributeNS(n,"text:style-name",f)}}function r(a,b){var d=b.ownerDocument.createRange(),g=b.nodeType===Node.TEXT_NODE?b.length:b.childNodes.length;
d.setStart(a.startContainer,a.startOffset);d.setEnd(a.endContainer,a.endOffset);g=0===d.comparePoint(b,0)&&0===d.comparePoint(b,g);d.detach();return g}function h(a){var b;0!==a.endOffset&&(a.endContainer.nodeType===Node.TEXT_NODE&&a.endOffset!==a.endContainer.length)&&(d.push(a.endContainer.splitText(a.endOffset)),d.push(a.endContainer));0!==a.startOffset&&(a.startContainer.nodeType===Node.TEXT_NODE&&a.startOffset!==a.startContainer.length)&&(b=a.startContainer.splitText(a.startOffset),d.push(a.startContainer),
d.push(b),a.setStart(b,0))}function b(a,b){if(a.nodeType===Node.TEXT_NODE)if(0===a.length)a.parentNode.removeChild(a);else if(b.nodeType===Node.TEXT_NODE)return b.insertData(0,a.data),a.parentNode.removeChild(a),b;return a}function f(a){a.nextSibling&&(a=b(a,a.nextSibling));a.previousSibling&&b(a.previousSibling,a)}var d,a=new odf.OdfUtils,n=odf.Namespaces.textns,q=odf.Namespaces.stylens,g="urn:webodf:names:scope";this.applyStyle=function(b,g){var e,s,m,q,k;e={};var v;runtime.assert(Boolean(g["style:text-properties"]),
"applyStyle without any text properties");e["style:text-properties"]=g["style:text-properties"];q=new p(e);k=new l(e);d=[];h(b);e=a.getTextNodes(b,!1);v={startContainer:b.startContainer,startOffset:b.startOffset,endContainer:b.endContainer,endOffset:b.endOffset};e.forEach(function(b){s=k.isStyleApplied(b);if(!1===s){var c=b.ownerDocument,d=b.parentNode,g,e=b,f=new core.LoopWatchDog(1E3);a.isParagraph(d)?(c=c.createElementNS(n,"text:span"),d.insertBefore(c,b),g=!1):(b.previousSibling&&!r(v,b.previousSibling)?
(c=d.cloneNode(!1),d.parentNode.insertBefore(c,d.nextSibling)):c=d,g=!0);for(;e&&(e===b||r(v,e));)f.check(),d=e.nextSibling,e.parentNode!==c&&c.appendChild(e),e=d;if(e&&g)for(b=c.cloneNode(!1),c.parentNode.insertBefore(b,c.nextSibling);e;)f.check(),d=e.nextSibling,b.appendChild(e),e=d;m=c;q.applyStyleToContainer(m)}});d.forEach(f);d=null}};
// Input 28
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("odf.Namespaces");runtime.loadClass("odf.OdfUtils");runtime.loadClass("xmldom.XPath");runtime.loadClass("core.CSSUnits");
odf.Style2CSS=function(){function e(a){var b={},c,d;if(!a)return b;for(a=a.firstChild;a;){if(d=a.namespaceURI!==u||"style"!==a.localName&&"default-style"!==a.localName?a.namespaceURI===s&&"list-style"===a.localName?"list":a.namespaceURI!==u||"page-layout"!==a.localName&&"default-page-layout"!==a.localName?void 0:"page":a.getAttributeNS(u,"family"))(c=a.getAttributeNS&&a.getAttributeNS(u,"name"))||(c=""),d=b[d]=b[d]||{},d[c]=a;a=a.nextSibling}return b}function k(a,b){if(!b||!a)return null;if(a[b])return a[b];
var c,d;for(c in a)if(a.hasOwnProperty(c)&&(d=k(a[c].derivedStyles,b)))return d;return null}function l(a,b,c){var d=b[a],g,e;d&&(g=d.getAttributeNS(u,"parent-style-name"),e=null,g&&(e=k(c,g),!e&&b[g]&&(l(g,b,c),e=b[g],b[g]=null)),e?(e.derivedStyles||(e.derivedStyles={}),e.derivedStyles[a]=d):c[a]=d)}function p(a,b){for(var c in a)a.hasOwnProperty(c)&&(l(c,a,b),a[c]=null)}function r(a,b){var c=x[a],d;if(null===c)return null;d=b?"["+c+'|style-name="'+b+'"]':"["+c+"|style-name]";"presentation"===c&&
(c="draw",d=b?'[presentation|style-name="'+b+'"]':"[presentation|style-name]");return c+"|"+v[a].join(d+","+c+"|")+d}function h(a,b,c){var d=[],g,e;d.push(r(a,b));for(g in c.derivedStyles)if(c.derivedStyles.hasOwnProperty(g))for(e in b=h(a,g,c.derivedStyles[g]),b)b.hasOwnProperty(e)&&d.push(b[e]);return d}function b(a,b,c){if(!a)return null;for(a=a.firstChild;a;){if(a.namespaceURI===b&&a.localName===c)return b=a;a=a.nextSibling}return null}function f(a,b){var c="",d,g;for(d in b)b.hasOwnProperty(d)&&
(d=b[d],(g=a.getAttributeNS(d[0],d[1]))&&(c+=d[2]+":"+g+";"));return c}function d(a){return(a=b(a,u,"text-properties"))?Q.parseFoFontSize(a.getAttributeNS(c,"font-size")):null}function a(a){a=a.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(a,b,c,d){return b+b+c+c+d+d});return(a=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a))?{r:parseInt(a[1],16),g:parseInt(a[2],16),b:parseInt(a[3],16)}:null}function n(a,b,c,d){b='text|list[text|style-name="'+b+'"]';var g=c.getAttributeNS(s,"level"),e;c=
Q.getFirstNonWhitespaceChild(c);c=Q.getFirstNonWhitespaceChild(c);var m;c&&(e=c.attributes,m=e["fo:text-indent"]?e["fo:text-indent"].value:void 0,e=e["fo:margin-left"]?e["fo:margin-left"].value:void 0);m||(m="-0.6cm");c="-"===m.charAt(0)?m.substring(1):"-"+m;for(g=g&&parseInt(g,10);1<g;)b+=" > text|list-item > text|list",g-=1;g=b+" > text|list-item > *:not(text|list):first-child";void 0!==e&&(e=g+"{margin-left:"+e+";}",a.insertRule(e,a.cssRules.length));d=b+" > text|list-item > *:not(text|list):first-child:before{"+
d+";";d+="counter-increment:list;";d+="margin-left:"+m+";";d+="width:"+c+";";d+="display:inline-block}";try{a.insertRule(d,a.cssRules.length)}catch(f){throw f;}}function q(e,k,t,l){if("list"===k)for(var p=l.firstChild,r,v;p;){if(p.namespaceURI===s)if(r=p,"list-level-style-number"===p.localName){var N=r;v=N.getAttributeNS(u,"num-format");var x=N.getAttributeNS(u,"num-suffix"),z={1:"decimal",a:"lower-latin",A:"upper-latin",i:"lower-roman",I:"upper-roman"},N=N.getAttributeNS(u,"num-prefix")||"",N=z.hasOwnProperty(v)?
N+(" counter(list, "+z[v]+")"):v?N+("'"+v+"';"):N+" ''";x&&(N+=" '"+x+"'");v="content: "+N+";";n(e,t,r,v)}else"list-level-style-image"===p.localName?(v="content: none;",n(e,t,r,v)):"list-level-style-bullet"===p.localName&&(v="content: '"+r.getAttributeNS(s,"bullet-char")+"';",n(e,t,r,v));p=p.nextSibling}else if("page"===k)if(x=r=t="",p=l.getElementsByTagNameNS(u,"page-layout-properties")[0],r=p.parentNode.parentNode.parentNode.masterStyles,x="",t+=f(p,D),v=p.getElementsByTagNameNS(u,"background-image"),
0<v.length&&(x=v.item(0).getAttributeNS(m,"href"))&&(t+="background-image: url('odfkit:"+x+"');",v=v.item(0),t+=f(v,P)),"presentation"===F){if(r)for(v=r.getElementsByTagNameNS(u,"master-page"),z=0;z<v.length;z+=1)if(v[z].getAttributeNS(u,"page-layout-name")===p.parentNode.getAttributeNS(u,"name")){x=v[z].getAttributeNS(u,"name");r="draw|page[draw|master-page-name="+x+"] {"+t+"}";x="office|body, draw|page[draw|master-page-name="+x+"] {"+f(p,G)+" }";try{e.insertRule(r,e.cssRules.length),e.insertRule(x,
e.cssRules.length)}catch(ca){throw ca;}}}else{if("text"===F){r="office|text {"+t+"}";x="office|body {width: "+p.getAttributeNS(c,"page-width")+";}";try{e.insertRule(r,e.cssRules.length),e.insertRule(x,e.cssRules.length)}catch($){throw $;}}}else{t=h(k,t,l).join(",");p="";if(r=b(l,u,"text-properties")){var z=r,Y;v=Y="";x=1;r=""+f(z,w);N=z.getAttributeNS(u,"text-underline-style");"solid"===N&&(Y+=" underline");N=z.getAttributeNS(u,"text-line-through-style");"solid"===N&&(Y+=" line-through");Y.length&&
(r+="text-decoration:"+Y+";");if(Y=z.getAttributeNS(u,"font-name")||z.getAttributeNS(c,"font-family"))N=X[Y],r+="font-family: "+(N||Y)+", sans-serif;";N=z.parentNode;if(z=d(N)){for(;N;){if(z=d(N))if("%"!==z.unit){v="font-size: "+z.value*x+z.unit+";";break}else x*=z.value/100;z=N;Y=N="";N=null;"default-style"===z.localName?N=null:(N=z.getAttributeNS(u,"parent-style-name"),Y=z.getAttributeNS(u,"family"),N=U.getODFElementsWithXPath(K,N?"//style:*[@style:name='"+N+"'][@style:family='"+Y+"']":"//style:default-style[@style:family='"+
Y+"']",odf.Namespaces.resolvePrefix)[0])}v||(v="font-size: "+parseFloat(H)*x+Z.getUnits(H)+";");r+=v}p+=r}if(r=b(l,u,"paragraph-properties"))v=r,r=""+f(v,B),x=v.getElementsByTagNameNS(u,"background-image"),0<x.length&&(z=x.item(0).getAttributeNS(m,"href"))&&(r+="background-image: url('odfkit:"+z+"');",x=x.item(0),r+=f(x,P)),(v=v.getAttributeNS(c,"line-height"))&&"normal"!==v&&(v=Q.parseFoLineHeight(v),r="%"!==v.unit?r+("line-height: "+v.value+";"):r+("line-height: "+v.value/100+";")),p+=r;if(r=b(l,
u,"graphic-properties"))z=r,r=""+f(z,E),v=z.getAttributeNS(g,"opacity"),x=z.getAttributeNS(g,"fill"),z=z.getAttributeNS(g,"fill-color"),"solid"===x||"hatch"===x?z&&"none"!==z?(v=isNaN(parseFloat(v))?1:parseFloat(v)/100,(z=a(z))&&(r+="background-color: rgba("+z.r+","+z.g+","+z.b+","+v+");")):r+="background: none;":"none"===x&&(r+="background: none;"),p+=r;if(r=b(l,u,"drawing-page-properties"))v=""+f(r,E),"true"===r.getAttributeNS(A,"background-visible")&&(v+="background: none;"),p+=v;if(r=b(l,u,"table-cell-properties"))r=
""+f(r,O),p+=r;if(r=b(l,u,"table-row-properties"))r=""+f(r,J),p+=r;if(r=b(l,u,"table-column-properties"))r=""+f(r,y),p+=r;if(r=b(l,u,"table-properties"))r=""+f(r,C),p+=r;if(0!==p.length)try{e.insertRule(t+"{"+p+"}",e.cssRules.length)}catch(da){throw da;}}for(var aa in l.derivedStyles)l.derivedStyles.hasOwnProperty(aa)&&q(e,k,aa,l.derivedStyles[aa])}var g=odf.Namespaces.drawns,c=odf.Namespaces.fons,u=odf.Namespaces.stylens,t=odf.Namespaces.svgns,s=odf.Namespaces.textns,m=odf.Namespaces.xlinkns,A=odf.Namespaces.presentationns,
x={graphic:"draw","drawing-page":"draw",paragraph:"text",presentation:"presentation",ruby:"text",section:"text",table:"table","table-cell":"table","table-column":"table","table-row":"table",text:"text",list:"text",page:"office"},v={graphic:"circle connected control custom-shape ellipse frame g line measure page page-thumbnail path polygon polyline rect regular-polygon".split(" "),paragraph:"alphabetical-index-entry-template h illustration-index-entry-template index-source-style object-index-entry-template p table-index-entry-template table-of-content-entry-template user-index-entry-template".split(" "),
presentation:"caption circle connector control custom-shape ellipse frame g line measure page-thumbnail path polygon polyline rect regular-polygon".split(" "),"drawing-page":"caption circle connector control page custom-shape ellipse frame g line measure page-thumbnail path polygon polyline rect regular-polygon".split(" "),ruby:["ruby","ruby-text"],section:"alphabetical-index bibliography illustration-index index-title object-index section table-of-content table-index user-index".split(" "),table:["background",
"table"],"table-cell":"body covered-table-cell even-columns even-rows first-column first-row last-column last-row odd-columns odd-rows table-cell".split(" "),"table-column":["table-column"],"table-row":["table-row"],text:"a index-entry-chapter index-entry-link-end index-entry-link-start index-entry-page-number index-entry-span index-entry-tab-stop index-entry-text index-title-template linenumbering-configuration list-level-style-number list-level-style-bullet outline-level-style span".split(" "),
list:["list-item"]},w=[[c,"color","color"],[c,"background-color","background-color"],[c,"font-weight","font-weight"],[c,"font-style","font-style"]],P=[[u,"repeat","background-repeat"]],B=[[c,"background-color","background-color"],[c,"text-align","text-align"],[c,"text-indent","text-indent"],[c,"padding","padding"],[c,"padding-left","padding-left"],[c,"padding-right","padding-right"],[c,"padding-top","padding-top"],[c,"padding-bottom","padding-bottom"],[c,"border-left","border-left"],[c,"border-right",
"border-right"],[c,"border-top","border-top"],[c,"border-bottom","border-bottom"],[c,"margin","margin"],[c,"margin-left","margin-left"],[c,"margin-right","margin-right"],[c,"margin-top","margin-top"],[c,"margin-bottom","margin-bottom"],[c,"border","border"]],E=[[c,"background-color","background-color"],[c,"min-height","min-height"],[g,"stroke","border"],[t,"stroke-color","border-color"],[t,"stroke-width","border-width"]],O=[[c,"background-color","background-color"],[c,"border-left","border-left"],
[c,"border-right","border-right"],[c,"border-top","border-top"],[c,"border-bottom","border-bottom"],[c,"border","border"]],y=[[u,"column-width","width"]],J=[[u,"row-height","height"],[c,"keep-together",null]],C=[[u,"width","width"],[c,"margin-left","margin-left"],[c,"margin-right","margin-right"],[c,"margin-top","margin-top"],[c,"margin-bottom","margin-bottom"]],D=[[c,"background-color","background-color"],[c,"padding","padding"],[c,"padding-left","padding-left"],[c,"padding-right","padding-right"],
[c,"padding-top","padding-top"],[c,"padding-bottom","padding-bottom"],[c,"border","border"],[c,"border-left","border-left"],[c,"border-right","border-right"],[c,"border-top","border-top"],[c,"border-bottom","border-bottom"],[c,"margin","margin"],[c,"margin-left","margin-left"],[c,"margin-right","margin-right"],[c,"margin-top","margin-top"],[c,"margin-bottom","margin-bottom"]],G=[[c,"page-width","width"],[c,"page-height","height"]],X={},Q=new odf.OdfUtils,F,K,H,U=new xmldom.XPath,Z=new core.CSSUnits;
this.style2css=function(a,b,c,d,g){for(var m,f,s,n;b.cssRules.length;)b.deleteRule(b.cssRules.length-1);m=null;d&&(m=d.ownerDocument,K=d.parentNode);g&&(m=g.ownerDocument,K=g.parentNode);if(m)for(n in odf.Namespaces.forEachPrefix(function(a,c){s="@namespace "+a+" url("+c+");";try{b.insertRule(s,b.cssRules.length)}catch(d){}}),X=c,F=a,H=window.getComputedStyle(document.body,null).getPropertyValue("font-size")||"12pt",a=e(d),d=e(g),g={},x)if(x.hasOwnProperty(n))for(f in c=g[n]={},p(a[n],c),p(d[n],c),
c)c.hasOwnProperty(f)&&q(b,n,f,c[f])}};
// Input 29
runtime.loadClass("core.Base64");runtime.loadClass("core.Zip");runtime.loadClass("xmldom.LSSerializer");runtime.loadClass("odf.StyleInfo");runtime.loadClass("odf.Namespaces");
odf.OdfContainer=function(){function e(a,b,c){for(a=a?a.firstChild:null;a;){if(a.localName===c&&a.namespaceURI===b)return a;a=a.nextSibling}return null}function k(a){var b,c=q.length;for(b=0;b<c;b+=1)if(a.namespaceURI===d&&a.localName===q[b])return b;return-1}function l(a,b){var c;a&&(c=new f.UsedStyleList(a,b));this.acceptNode=function(a){return"http://www.w3.org/1999/xhtml"===a.namespaceURI?3:a.namespaceURI&&a.namespaceURI.match(/^urn:webodf:/)?2:c&&a.parentNode===b&&a.nodeType===Node.ELEMENT_NODE?
c.uses(a)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}function p(a,b){if(b){var c=k(b),d,g=a.firstChild;if(-1!==c){for(;g;){d=k(g);if(-1!==d&&d>c)break;g=g.nextSibling}a.insertBefore(b,g)}}}function r(a){this.OdfContainer=a}function h(a,b,c,d){var g=this;this.size=0;this.type=null;this.name=a;this.container=c;this.onchange=this.onreadystatechange=this.document=this.mimetype=this.url=null;this.EMPTY=0;this.LOADING=1;this.DONE=2;this.state=this.EMPTY;this.load=function(){null!==
d&&(this.mimetype=b,d.loadAsDataURL(a,b,function(a,b){a&&runtime.log(a);g.url=b;if(g.onchange)g.onchange(g);if(g.onstatereadychange)g.onstatereadychange(g)}))};this.abort=function(){}}function b(a){this.length=0;this.item=function(a){}}var f=new odf.StyleInfo,d="urn:oasis:names:tc:opendocument:xmlns:office:1.0",a="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0",n="urn:webodf:names:scope",q="meta settings scripts font-face-decls styles automatic-styles master-styles body".split(" "),g=(new Date).getTime()+
"_webodf_",c=new core.Base64;r.prototype=new function(){};r.prototype.constructor=r;r.namespaceURI=d;r.localName="document";h.prototype.load=function(){};h.prototype.getUrl=function(){return this.data?"data:;base64,"+c.toBase64(this.data):null};odf.OdfContainer=function t(c,m){function q(a){for(var b=a.firstChild,c;b;)c=b.nextSibling,b.nodeType===Node.ELEMENT_NODE?q(b):b.nodeType===Node.PROCESSING_INSTRUCTION_NODE&&a.removeChild(b),b=c}function k(a,b){for(var c=a&&a.firstChild;c;)c.nodeType===Node.ELEMENT_NODE&&
c.setAttributeNS(n,"scope",b),c=c.nextSibling}function v(a,b){var c=null,d,g,e;if(a)for(c=a.cloneNode(!0),d=c.firstChild;d;)g=d.nextSibling,d.nodeType===Node.ELEMENT_NODE&&(e=d.getAttributeNS(n,"scope"))&&e!==b&&c.removeChild(d),d=g;return c}function w(a){var b=M.rootElement.ownerDocument,c;if(a){q(a.documentElement);try{c=b.importNode(a.documentElement,!0)}catch(d){}}return c}function P(a){M.state=a;if(M.onchange)M.onchange(M);if(M.onstatereadychange)M.onstatereadychange(M)}function B(a){R=null;
M.rootElement=a;a.fontFaceDecls=e(a,d,"font-face-decls");a.styles=e(a,d,"styles");a.automaticStyles=e(a,d,"automatic-styles");a.masterStyles=e(a,d,"master-styles");a.body=e(a,d,"body");a.meta=e(a,d,"meta")}function E(a){a=w(a);var b=M.rootElement;a&&"document-styles"===a.localName&&a.namespaceURI===d?(b.fontFaceDecls=e(a,d,"font-face-decls"),p(b,b.fontFaceDecls),b.styles=e(a,d,"styles"),p(b,b.styles),b.automaticStyles=e(a,d,"automatic-styles"),k(b.automaticStyles,"document-styles"),p(b,b.automaticStyles),
b.masterStyles=e(a,d,"master-styles"),p(b,b.masterStyles),f.prefixStyleNames(b.automaticStyles,g,b.masterStyles)):P(t.INVALID)}function O(a){a=w(a);var b,c,g;if(a&&"document-content"===a.localName&&a.namespaceURI===d){b=M.rootElement;c=e(a,d,"font-face-decls");if(b.fontFaceDecls&&c)for(g=c.firstChild;g;)b.fontFaceDecls.appendChild(g),g=c.firstChild;else c&&(b.fontFaceDecls=c,p(b,c));c=e(a,d,"automatic-styles");k(c,"document-content");if(b.automaticStyles&&c)for(g=c.firstChild;g;)b.automaticStyles.appendChild(g),
g=c.firstChild;else c&&(b.automaticStyles=c,p(b,c));b.body=e(a,d,"body");p(b,b.body)}else P(t.INVALID)}function y(a){a=w(a);var b;a&&("document-meta"===a.localName&&a.namespaceURI===d)&&(b=M.rootElement,b.meta=e(a,d,"meta"),p(b,b.meta))}function J(a){a=w(a);var b;a&&("document-settings"===a.localName&&a.namespaceURI===d)&&(b=M.rootElement,b.settings=e(a,d,"settings"),p(b,b.settings))}function C(b){b=w(b);var c;if(b&&"manifest"===b.localName&&b.namespaceURI===a)for(c=M.rootElement,c.manifest=b,b=c.manifest.firstChild;b;)b.nodeType===
Node.ELEMENT_NODE&&("file-entry"===b.localName&&b.namespaceURI===a)&&(T[b.getAttributeNS(a,"full-path")]=b.getAttributeNS(a,"media-type")),b=b.nextSibling}function D(a){var b=a.shift(),c,d;b?(c=b[0],d=b[1],S.loadAsDOM(c,function(b,c){d(c);M.state!==t.INVALID&&D(a)})):P(t.DONE)}function G(a){var b="";odf.Namespaces.forEachPrefix(function(a,c){b+=" xmlns:"+a+'="'+c+'"'});return'<?xml version="1.0" encoding="UTF-8"?><office:'+a+" "+b+' office:version="1.2">'}function X(){var a=new xmldom.LSSerializer,
b=G("document-meta");a.filter=new l;b+=a.writeToString(M.rootElement.meta,odf.Namespaces.namespaceMap);return b+"</office:document-meta>"}function Q(b,c){var d=document.createElementNS(a,"manifest:file-entry");d.setAttributeNS(a,"manifest:full-path",b);d.setAttributeNS(a,"manifest:media-type",c);return d}function F(){var b=runtime.parseXML('<manifest:manifest xmlns:manifest="'+a+'"></manifest:manifest>'),c=e(b,a,"manifest"),d=new xmldom.LSSerializer,g;for(g in T)T.hasOwnProperty(g)&&c.appendChild(Q(g,
T[g]));d.filter=new l;return'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'+d.writeToString(b,odf.Namespaces.namespaceMap)}function K(){var a=new xmldom.LSSerializer,b=G("document-settings");a.filter=new l;b+=a.writeToString(M.rootElement.settings,odf.Namespaces.namespaceMap);return b+"</office:document-settings>"}function H(){var a=odf.Namespaces.namespaceMap,b=new xmldom.LSSerializer,c=v(M.rootElement.automaticStyles,"document-styles"),d=M.rootElement.masterStyles&&M.rootElement.masterStyles.cloneNode(!0),
e=G("document-styles");f.removePrefixFromStyleNames(c,g,d);b.filter=new l(d,c);e+=b.writeToString(M.rootElement.fontFaceDecls,a);e+=b.writeToString(M.rootElement.styles,a);e+=b.writeToString(c,a);e+=b.writeToString(d,a);return e+"</office:document-styles>"}function U(){var a=odf.Namespaces.namespaceMap,b=new xmldom.LSSerializer,c=v(M.rootElement.automaticStyles,"document-content"),d=G("document-content");b.filter=new l(M.rootElement.body,c);d+=b.writeToString(c,a);d+=b.writeToString(M.rootElement.body,
a);return d+"</office:document-content>"}function Z(a,b){runtime.loadXML(a,function(a,c){if(a)b(a);else{var g=w(c);g&&"document"===g.localName&&g.namespaceURI===d?(B(g),P(t.DONE)):P(t.INVALID)}})}function W(){function a(b,c){var e;c||(c=b);e=document.createElementNS(d,c);g[b]=e;g.appendChild(e)}var b=new core.Zip("",null),c=runtime.byteArrayFromString("application/vnd.oasis.opendocument.text","utf8"),g=M.rootElement,e=document.createElementNS(d,"text");b.save("mimetype",c,!1,new Date);a("meta");a("settings");
a("scripts");a("fontFaceDecls","font-face-decls");a("styles");a("automaticStyles","automatic-styles");a("masterStyles","master-styles");a("body");g.body.appendChild(e);P(t.DONE);return b}function L(){var a,b=new Date;a=runtime.byteArrayFromString(K(),"utf8");S.save("settings.xml",a,!0,b);a=runtime.byteArrayFromString(X(),"utf8");S.save("meta.xml",a,!0,b);a=runtime.byteArrayFromString(H(),"utf8");S.save("styles.xml",a,!0,b);a=runtime.byteArrayFromString(U(),"utf8");S.save("content.xml",a,!0,b);a=runtime.byteArrayFromString(F(),
"utf8");S.save("META-INF/manifest.xml",a,!0,b)}function I(a,b){L();S.writeAs(a,function(a){b(a)})}var M=this,S,T={},R;this.onstatereadychange=m;this.parts=this.rootElement=this.state=this.onchange=null;this.setRootElement=B;this.getContentElement=function(){var a;R||(a=M.rootElement.body,R=a.getElementsByTagNameNS(d,"text")[0]||a.getElementsByTagNameNS(d,"presentation")[0]||a.getElementsByTagNameNS(d,"spreadsheet")[0]);return R};this.getDocumentType=function(){var a=M.getContentElement();return a&&
a.localName};this.getPart=function(a){return new h(a,T[a],M,S)};this.getPartData=function(a,b){S.load(a,b)};this.createByteArray=function(a,b){L();S.createByteArray(a,b)};this.saveAs=I;this.save=function(a){I(c,a)};this.getUrl=function(){return c};this.state=t.LOADING;this.rootElement=function(a){var b=document.createElementNS(a.namespaceURI,a.localName),c;a=new a;for(c in a)a.hasOwnProperty(c)&&(b[c]=a[c]);return b}(r);this.parts=new b(this);S=c?new core.Zip(c,function(a,b){S=b;a?Z(c,function(b){a&&
(S.error=a+"\n"+b,P(t.INVALID))}):D([["styles.xml",E],["content.xml",O],["meta.xml",y],["settings.xml",J],["META-INF/manifest.xml",C]])}):W()};odf.OdfContainer.EMPTY=0;odf.OdfContainer.LOADING=1;odf.OdfContainer.DONE=2;odf.OdfContainer.INVALID=3;odf.OdfContainer.SAVING=4;odf.OdfContainer.MODIFIED=5;odf.OdfContainer.getContainer=function(a){return new odf.OdfContainer(a,null)};return odf.OdfContainer}();
// Input 30
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("core.Base64");runtime.loadClass("xmldom.XPath");runtime.loadClass("odf.OdfContainer");
odf.FontLoader=function(){function e(k,h,b,f,d){var a,n=0,q;for(q in k)if(k.hasOwnProperty(q)){if(n===b){a=q;break}n+=1}if(!a)return d();h.getPartData(k[a].href,function(g,c){if(g)runtime.log(g);else{var n="@font-face { font-family: '"+(k[a].family||a)+"'; src: url(data:application/x-font-ttf;charset=binary;base64,"+p.convertUTF8ArrayToBase64(c)+') format("truetype"); }';try{f.insertRule(n,f.cssRules.length)}catch(q){runtime.log("Problem inserting rule in CSS: "+runtime.toJson(q)+"\nRule: "+n)}}e(k,
h,b+1,f,d)})}function k(k,h,b){e(k,h,0,b,function(){})}var l=new xmldom.XPath,p=new core.Base64;odf.FontLoader=function(){this.loadFonts=function(e,h){for(var b=e.rootElement.fontFaceDecls;h.cssRules.length;)h.deleteRule(h.cssRules.length-1);if(b){var f={},d,a,n,q;if(b)for(b=l.getODFElementsWithXPath(b,"style:font-face[svg:font-face-src]",odf.Namespaces.resolvePrefix),d=0;d<b.length;d+=1)a=b[d],n=a.getAttributeNS(odf.Namespaces.stylens,"name"),q=a.getAttributeNS(odf.Namespaces.svgns,"font-family"),
a=l.getODFElementsWithXPath(a,"svg:font-face-src/svg:font-face-uri",odf.Namespaces.resolvePrefix),0<a.length&&(a=a[0].getAttributeNS(odf.Namespaces.xlinkns,"href"),f[n]={href:a,family:q});k(f,e,h)}}};return odf.FontLoader}();
// Input 31
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("odf.Namespaces");runtime.loadClass("odf.OdfContainer");runtime.loadClass("odf.StyleInfo");runtime.loadClass("odf.OdfUtils");runtime.loadClass("odf.TextStyleApplicator");
odf.Formatting=function(){function e(a,b){Object.keys(b).forEach(function(c){try{a[c]=b[c].constructor===Object?e(a[c],b[c]):b[c]}catch(d){a[c]=b[c]}});return a}function k(b,d,e){var f;e=e||[a.rootElement.automaticStyles,a.rootElement.styles];for(f=e.shift();f;){for(f=f.firstChild;f;){if(f.nodeType===Node.ELEMENT_NODE&&(f.namespaceURI===g&&"style"===f.localName&&f.getAttributeNS(g,"family")===d&&f.getAttributeNS(g,"name")===b||"list-style"===d&&f.namespaceURI===c&&"list-style"===f.localName&&f.getAttributeNS(g,
"name")===b))return f;f=f.nextSibling}f=e.shift()}return null}function l(a){for(var b={},c=a.firstChild;c;){if(c.nodeType===Node.ELEMENT_NODE&&c.namespaceURI===g)for(b[c.nodeName]={},a=0;a<c.attributes.length;a+=1)b[c.nodeName][c.attributes[a].name]=c.attributes[a].value;c=c.nextSibling}return b}function p(a,b){Object.keys(b).forEach(function(c){var d=c.split(":"),g=d[1],e=odf.Namespaces.resolvePrefix(d[0]),d=b[c];"object"===typeof d&&Object.keys(d).length?(c=a.getElementsByTagNameNS(e,g)[0]||a.ownerDocument.createElementNS(e,
c),a.appendChild(c),p(c,d)):a.setAttributeNS(e,c,d)})}function r(b){var c=a.rootElement.styles,d;d={};for(var f={},n=b;n;)d=l(n),f=e(d,f),n=(d=n.getAttributeNS(g,"parent-style-name"))?k(d,b.getAttributeNS(g,"family"),[c]):null;a:{b=b.getAttributeNS(g,"family");for(c=a.rootElement.styles.firstChild;c;){if(c.nodeType===Node.ELEMENT_NODE&&c.namespaceURI===g&&"default-style"===c.localName&&c.getAttributeNS(g,"family")===b){n=c;break a}c=c.nextSibling}n=null}n&&(d=l(n),f=e(d,f));return f}function h(a,
b){for(var c=a.nodeType===Node.TEXT_NODE?a.parentNode:a,d,g=[],e="",f=!1;c;)!f&&u.isGroupingElement(c)&&(f=!0),(d=n.determineStylesForNode(c))&&g.push(d),c=c.parentNode;f&&(g.forEach(function(a){Object.keys(a).forEach(function(b){Object.keys(a[b]).forEach(function(a){e+="|"+b+":"+a+"|"})})}),b&&(b[e]=g));return f?g:void 0}function b(a){var b={orderedStyles:[]};a.forEach(function(a){Object.keys(a).forEach(function(c){var d=Object.keys(a[c])[0],f,n;f=k(d,c);n=r(f);b=e(n,b);b.orderedStyles.push({name:d,
family:c,displayName:f.getAttributeNS(g,"display-name")})})});return b}function f(){var b,d=[];[a.rootElement.automaticStyles,a.rootElement.styles].forEach(function(a){for(b=a.firstChild;b;)b.nodeType===Node.ELEMENT_NODE&&(b.namespaceURI===g&&"style"===b.localName||b.namespaceURI===c&&"list-style"===b.localName)&&d.push(b.getAttributeNS(g,"name")),b=b.nextSibling});return d}var d=this,a,n=new odf.StyleInfo,q=odf.Namespaces.svgns,g=odf.Namespaces.stylens,c=odf.Namespaces.textns,u=new odf.OdfUtils;
this.setOdfContainer=function(b){a=b};this.getFontMap=function(){for(var b=a.rootElement.fontFaceDecls,c={},d,e,b=b&&b.firstChild;b;)b.nodeType===Node.ELEMENT_NODE&&(d=b.getAttributeNS(g,"name"))&&((e=b.getAttributeNS(q,"font-family"))||b.getElementsByTagNameNS(q,"font-face-uri")[0])&&(c[d]=e),b=b.nextSibling;return c};this.getAvailableParagraphStyles=function(){for(var b=a.rootElement.styles&&a.rootElement.styles.firstChild,c,d,e=[];b;)b.nodeType===Node.ELEMENT_NODE&&("style"===b.localName&&b.namespaceURI===
g)&&(d=b,c=d.getAttributeNS(g,"family"),"paragraph"===c&&(c=d.getAttributeNS(g,"name"),d=d.getAttributeNS(g,"display-name")||c,c&&d&&e.push({name:c,displayName:d}))),b=b.nextSibling;return e};this.isStyleUsed=function(b){var c;c=n.hasDerivedStyles(a.rootElement,odf.Namespaces.resolvePrefix,b);b=(new n.UsedStyleList(a.rootElement.styles)).uses(b)||(new n.UsedStyleList(a.rootElement.automaticStyles)).uses(b)||(new n.UsedStyleList(a.rootElement.body)).uses(b);return c||b};this.getStyleElement=k;this.getStyleAttributes=
l;this.getInheritedStyleAttributes=r;this.getFirstNamedParentStyleNameOrSelf=function(b){for(var c=a.rootElement.automaticStyles,d=a.rootElement.styles,e;null!==(e=k(b,"paragraph",[c]));)b=e.getAttributeNS(g,"parent-style-name");return(e=k(b,"paragraph",[d]))?b:null};this.hasParagraphStyle=function(a){return Boolean(k(a,"paragraph"))};this.getAppliedStyles=function(a){var c={},d=[];u.getTextNodes(a).forEach(function(a){h(a,c)});Object.keys(c).forEach(function(a){d.push(b(c[a]))});return d};this.getAppliedStylesForElement=
function(a){return(a=h(a))?b(a):void 0};this.applyStyle=function(b,c){(new odf.TextStyleApplicator(d,a.rootElement.automaticStyles)).applyStyle(b,c)};this.updateStyle=function(a,b,c){var d;p(a,b);b=a.getAttributeNS(g,"name");if(c||!b){c=f();d=Math.floor(1E8*Math.random());do b="auto"+d,d+=1;while(-1!==c.indexOf(b));a.setAttributeNS(g,"style:name",b)}}};
// Input 32
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("odf.OdfContainer");runtime.loadClass("odf.Formatting");runtime.loadClass("xmldom.XPath");runtime.loadClass("odf.FontLoader");runtime.loadClass("odf.Style2CSS");runtime.loadClass("odf.OdfUtils");
odf.OdfCanvas=function(){function e(){function a(d){c=!0;runtime.setTimeout(function(){try{d()}catch(g){runtime.log(g)}c=!1;0<b.length&&a(b.pop())},10)}var b=[],c=!1;this.clearQueue=function(){b.length=0};this.addToQueue=function(d){if(0===b.length&&!c)return a(d);b.push(d)}}function k(a){function b(){for(;0<c.cssRules.length;)c.deleteRule(0);c.insertRule("#shadowContent draw|page {display:none;}",0);c.insertRule("office|presentation draw|page {display:none;}",1);c.insertRule("#shadowContent draw|page:nth-of-type("+
d+") {display:block;}",2);c.insertRule("office|presentation draw|page:nth-of-type("+d+") {display:block;}",3)}var c=a.sheet,d=1;this.showFirstPage=function(){d=1;b()};this.showNextPage=function(){d+=1;b()};this.showPreviousPage=function(){1<d&&(d-=1,b())};this.showPage=function(a){0<a&&(d=a,b())};this.css=a}function l(a,b,c){a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent?a.attachEvent("on"+b,c):a["on"+b]=c}function p(a){function b(a,c){for(;c;){if(c===a)return!0;c=c.parentNode}return!1}
function c(){var e=[],f=runtime.getWindow().getSelection(),m,n;for(m=0;m<f.rangeCount;m+=1)n=f.getRangeAt(m),null!==n&&(b(a,n.startContainer)&&b(a,n.endContainer))&&e.push(n);if(e.length===d.length){for(f=0;f<e.length&&(m=e[f],n=d[f],m=m===n?!1:null===m||null===n?!0:m.startContainer!==n.startContainer||m.startOffset!==n.startOffset||m.endContainer!==n.endContainer||m.endOffset!==n.endOffset,!m);f+=1);if(f===e.length)return}d=e;var f=[e.length],h,s=a.ownerDocument;for(m=0;m<e.length;m+=1)n=e[m],h=
s.createRange(),h.setStart(n.startContainer,n.startOffset),h.setEnd(n.endContainer,n.endOffset),f[m]=h;d=f;f=g.length;for(e=0;e<f;e+=1)g[e](a,d)}var d=[],g=[];this.addListener=function(a,b){var c,d=g.length;for(c=0;c<d;c+=1)if(g[c]===b)return;g.push(b)};l(a,"mouseup",c);l(a,"keyup",c);l(a,"keydown",c)}function r(a,b,c){(new odf.Style2CSS).style2css(a.getDocumentType(),c.sheet,b.getFontMap(),a.rootElement.styles,a.rootElement.automaticStyles)}function h(a,b,c,d){c.setAttribute("styleid",b);var g,e=
c.getAttributeNS(v,"anchor-type"),f=c.getAttributeNS(A,"x"),n=c.getAttributeNS(A,"y"),s=c.getAttributeNS(A,"width"),q=c.getAttributeNS(A,"height"),k=c.getAttributeNS(t,"min-height"),p=c.getAttributeNS(t,"min-width"),l=c.getAttributeNS(u,"master-page-name"),r=null,x,w;x=0;var y,E=a.rootElement.ownerDocument;if(l){r=a.rootElement.masterStyles.getElementsByTagNameNS(m,"master-page");x=null;for(w=0;w<r.length;w+=1)if(r[w].getAttributeNS(m,"name")===l){x=r[w];break}r=x}else r=null;if(r){l=E.createElementNS(u,
"draw:page");y=r.firstElementChild;for(x=0;y;)"true"!==y.getAttributeNS(B,"placeholder")&&(w=y.cloneNode(!0),l.appendChild(w),h(a,b+"_"+x,w,d)),y=y.nextElementSibling,x+=1;J.appendChild(l);x=J.getElementsByTagNameNS(u,"page").length;if(w=l.getElementsByTagNameNS(v,"page-number")[0]){for(;w.firstChild;)w.removeChild(w.firstChild);w.appendChild(E.createTextNode(x))}h(a,b,l,d);l.setAttributeNS(u,"draw:master-page-name",r.getAttributeNS(m,"name"))}if("as-char"===e)g="display: inline-block;";else if(e||
f||n)g="position: absolute;";else if(s||q||k||p)g="display: block;";f&&(g+="left: "+f+";");n&&(g+="top: "+n+";");s&&(g+="width: "+s+";");q&&(g+="height: "+q+";");k&&(g+="min-height: "+k+";");p&&(g+="min-width: "+p+";");g&&(g="draw|"+c.localName+'[styleid="'+b+'"] {'+g+"}",d.insertRule(g,d.cssRules.length))}function b(a){for(a=a.firstChild;a;){if(a.namespaceURI===s&&"binary-data"===a.localName)return"data:image/png;base64,"+a.textContent.replace(/[\r\n\s]/g,"");a=a.nextSibling}return""}function f(a,
c,d,g){function e(b){b&&(b='draw|image[styleid="'+a+'"] {'+("background-image: url("+b+");")+"}",g.insertRule(b,g.cssRules.length))}d.setAttribute("styleid",a);var f=d.getAttributeNS(w,"href"),m;if(f)try{m=c.getPart(f),m.onchange=function(a){e(a.url)},m.load()}catch(n){runtime.log("slight problem: "+n)}else f=b(d),e(f)}function d(a,b,c){function d(a,c,g){var e;c.hasAttributeNS(w,"href")&&(e=c.getAttributeNS(w,"href"),"#"===e[0]?(e=e.substring(1),a=function(){var a=O.getODFElementsWithXPath(b,"//text:bookmark-start[@text:name='"+
e+"']",odf.Namespaces.resolvePrefix);0===a.length&&(a=O.getODFElementsWithXPath(b,"//text:bookmark[@text:name='"+e+"']",odf.Namespaces.resolvePrefix));0<a.length&&a[0].scrollIntoView(!0);return!1}):a=function(){E.open(e)},c.onclick=a)}var g,e,f;e=b.getElementsByTagNameNS(v,"a");for(g=0;g<e.length;g+=1)f=e.item(g),d(a,f,c)}function a(a){var b=a.ownerDocument;Array.prototype.slice.call(a.getElementsByTagNameNS(v,"s")).forEach(function(a){for(var c,d;a.firstChild;)a.removeChild(a.firstChild);a.appendChild(b.createTextNode(" "));
d=parseInt(a.getAttributeNS(v,"c"),10);if(1<d)for(a.removeAttributeNS(v,"c"),c=1;c<d;c+=1)a.parentNode.insertBefore(a.cloneNode(!0),a)})}function n(a){Array.prototype.slice.call(a.getElementsByTagNameNS(v,"tab")).forEach(function(a){a.textContent="\t"})}function q(a,c,d,g){function e(a,b){var c=n.documentElement.namespaceURI;"video/"===b.substr(0,6)?(f=n.createElementNS(c,"video"),f.setAttribute("controls","controls"),m=n.createElementNS(c,"source"),m.setAttribute("src",a),m.setAttribute("type",b),
f.appendChild(m),d.parentNode.appendChild(f)):d.innerHtml="Unrecognised Plugin"}var f,m,n=d.ownerDocument,h;if(a=d.getAttributeNS(w,"href"))try{h=c.getPart(a),h.onchange=function(a){e(a.url,a.mimetype)},h.load()}catch(s){runtime.log("slight problem: "+s)}else runtime.log("using MP4 data fallback"),a=b(d),e(a,"video/mp4")}function g(a){var b=a.getElementsByTagName("head")[0],c;"undefined"!==String(typeof webodf_css)?(c=a.createElementNS(b.namespaceURI,"style"),c.setAttribute("media","screen, print, handheld, projection"),
c.appendChild(a.createTextNode(webodf_css))):(c=a.createElementNS(b.namespaceURI,"link"),a="webodf.css",runtime.currentDirectory&&(a=runtime.currentDirectory()+"/../"+a),c.setAttribute("href",a),c.setAttribute("rel","stylesheet"));c.setAttribute("type","text/css");b.appendChild(c);return c}function c(a){var b=a.getElementsByTagName("head")[0],c=a.createElementNS(b.namespaceURI,"style"),d="";c.setAttribute("type","text/css");c.setAttribute("media","screen, print, handheld, projection");odf.Namespaces.forEachPrefix(function(a,
b){d+="@namespace "+a+" url("+b+");\n"});c.appendChild(a.createTextNode(d));b.appendChild(c);return c}var u=odf.Namespaces.drawns,t=odf.Namespaces.fons,s=odf.Namespaces.officens,m=odf.Namespaces.stylens,A=odf.Namespaces.svgns,x=odf.Namespaces.tablens,v=odf.Namespaces.textns,w=odf.Namespaces.xlinkns,P=odf.Namespaces.xmlns,B=odf.Namespaces.presentationns,E=runtime.getWindow(),O=new xmldom.XPath,y=new odf.OdfUtils,J;odf.OdfCanvas=function(b){function s(a,b,c){function d(a,b,c,g){z.addToQueue(function(){f(a,
b,c,g)})}var g,e;g=b.getElementsByTagNameNS(u,"image");for(b=0;b<g.length;b+=1)e=g.item(b),d("image"+String(b),a,e,c)}function t(a,b,c){function d(a,b,c,g){z.addToQueue(function(){q(a,b,c,g)})}var g,e;g=b.getElementsByTagNameNS(u,"plugin");for(b=0;b<g.length;b+=1)e=g.item(b),d("video"+String(b),a,e,c)}function A(){var a=b.firstChild;a.firstChild&&(1<R?(a.style.MozTransformOrigin="center top",a.style.WebkitTransformOrigin="center top",a.style.OTransformOrigin="center top",a.style.msTransformOrigin=
"center top"):(a.style.MozTransformOrigin="left top",a.style.WebkitTransformOrigin="left top",a.style.OTransformOrigin="left top",a.style.msTransformOrigin="left top"),a.style.WebkitTransform="scale("+R+")",a.style.MozTransform="scale("+R+")",a.style.OTransform="scale("+R+")",a.style.msTransform="scale("+R+")",b.style.width=Math.round(R*a.offsetWidth)+"px",b.style.height=Math.round(R*a.offsetHeight)+"px")}function w(c){function g(){for(var e=b;e.firstChild;)e.removeChild(e.firstChild);b.style.display=
"inline-block";var f=U.rootElement;b.ownerDocument.importNode(f,!0);Z.setOdfContainer(U);var e=U,q=I;(new odf.FontLoader).loadFonts(e,q.sheet);r(U,Z,M);for(var k=U,e=S.sheet,q=b;q.firstChild;)q.removeChild(q.firstChild);q=H.createElementNS(b.namespaceURI,"div");q.style.display="inline-block";q.style.background="white";q.appendChild(f);b.appendChild(q);J=H.createElementNS(b.namespaceURI,"div");J.id="shadowContent";J.style.position="absolute";J.style.top=0;J.style.left=0;k.getContentElement().appendChild(J);
var p=f.body,l,w,Q;w=[];for(l=p.firstChild;l&&l!==p;)if(l.namespaceURI===u&&(w[w.length]=l),l.firstChild)l=l.firstChild;else{for(;l&&l!==p&&!l.nextSibling;)l=l.parentNode;l&&l.nextSibling&&(l=l.nextSibling)}for(Q=0;Q<w.length;Q+=1)l=w[Q],h(k,"frame"+String(Q),l,e);w=O.getODFElementsWithXPath(p,".//*[*[@text:anchor-type='paragraph']]",odf.Namespaces.resolvePrefix);for(l=0;l<w.length;l+=1)p=w[l],p.setAttributeNS&&p.setAttributeNS("urn:webodf","containsparagraphanchor",!0);l=f.body.getElementsByTagNameNS(x,
"table-cell");for(p=0;p<l.length;p+=1)w=l.item(p),w.hasAttributeNS(x,"number-columns-spanned")&&w.setAttribute("colspan",w.getAttributeNS(x,"number-columns-spanned")),w.hasAttributeNS(x,"number-rows-spanned")&&w.setAttribute("rowspan",w.getAttributeNS(x,"number-rows-spanned"));d(k,f.body,e);a(f.body);n(f.body);s(k,f.body,e);t(k,f.body,e);l=f.body;var F,B,z,k={},p={},K;w=E.document.getElementsByTagNameNS(v,"list-style");for(f=0;f<w.length;f+=1)F=w.item(f),(B=F.getAttributeNS(m,"name"))&&(p[B]=F);l=
l.getElementsByTagNameNS(v,"list");for(f=0;f<l.length;f+=1)if(F=l.item(f),w=F.getAttributeNS(P,"id")){Q=F.getAttributeNS(v,"continue-list");F.setAttribute("id",w);z="text|list#"+w+" > text|list-item > *:first-child:before {";if(B=F.getAttributeNS(v,"style-name")){F=p[B];K=y.getFirstNonWhitespaceChild(F);F=void 0;if("list-level-style-number"===K.localName){F=K.getAttributeNS(m,"num-format");B=K.getAttributeNS(m,"num-suffix");var L="",L={1:"decimal",a:"lower-latin",A:"upper-latin",i:"lower-roman",I:"upper-roman"},
$=void 0,$=K.getAttributeNS(m,"num-prefix")||"",$=L.hasOwnProperty(F)?$+(" counter(list, "+L[F]+")"):F?$+("'"+F+"';"):$+" ''";B&&($+=" '"+B+"'");F=L="content: "+$+";"}else"list-level-style-image"===K.localName?F="content: none;":"list-level-style-bullet"===K.localName&&(F="content: '"+K.getAttributeNS(v,"bullet-char")+"';");K=F}if(Q){for(F=k[Q];F;)Q=F,F=k[Q];z+="counter-increment:"+Q+";";K?(K=K.replace("list",Q),z+=K):z+="content:counter("+Q+");"}else Q="",K?(K=K.replace("list",w),z+=K):z+="content: counter("+
w+");",z+="counter-increment:"+w+";",e.insertRule("text|list#"+w+" {counter-reset:"+w+"}",e.cssRules.length);z+="}";k[w]=Q;z&&e.insertRule(z,e.cssRules.length)}q.insertBefore(J,q.firstChild);A();if(!c&&(e=[U],N.hasOwnProperty("statereadychange")))for(q=N.statereadychange,K=0;K<q.length;K+=1)q[K].apply(null,e)}U.state===odf.OdfContainer.DONE?g():(runtime.log("WARNING: refreshOdf called but ODF was not DONE."),runtime.setTimeout(function da(){U.state===odf.OdfContainer.DONE?g():(runtime.log("will be back later..."),
runtime.setTimeout(da,500))},100))}function F(){if(V){for(var a=V.ownerDocument.createDocumentFragment();V.firstChild;)a.insertBefore(V.firstChild,null);V.parentNode.replaceChild(a,V)}}function B(a){a=a||E.event;for(var b=a.target,c=E.getSelection(),d=0<c.rangeCount?c.getRangeAt(0):null,g=d&&d.startContainer,e=d&&d.startOffset,f=d&&d.endContainer,m=d&&d.endOffset,n,h;b&&("p"!==b.localName&&"h"!==b.localName||b.namespaceURI!==v);)b=b.parentNode;T&&(b&&b.parentNode!==V)&&(n=b.ownerDocument,h=n.documentElement.namespaceURI,
V?V.parentNode&&F():(V=n.createElementNS(h,"p"),V.style.margin="0px",V.style.padding="0px",V.style.border="0px",V.setAttribute("contenteditable",!0)),b.parentNode.replaceChild(V,b),V.appendChild(b),V.focus(),d&&(c.removeAllRanges(),d=b.ownerDocument.createRange(),d.setStart(g,e),d.setEnd(f,m),c.addRange(d)),a.preventDefault?(a.preventDefault(),a.stopPropagation()):(a.returnValue=!1,a.cancelBubble=!0))}runtime.assert(null!==b&&void 0!==b,"odf.OdfCanvas constructor needs DOM element");var H=b.ownerDocument,
U,Z=new odf.Formatting,W=new p(b),L,I,M,S,T=!1,R=1,N={},V,z=new e;g(H);L=new k(c(H));I=c(H);M=c(H);S=c(H);this.refreshCSS=function(){r(U,Z,M);A()};this.refreshSize=function(){A()};this.odfContainer=function(){return U};this.slidevisibilitycss=function(){return L.css};this.setOdfContainer=function(a,b){U=a;w(!0===b)};this.load=this.load=function(a){z.clearQueue();b.innerHTML="loading "+a;b.removeAttribute("style");U=new odf.OdfContainer(a,function(a){U=a;w(!1)})};this.save=function(a){F();U.save(a)};
this.setEditable=function(a){l(b,"click",B);(T=a)||F()};this.addListener=function(a,c){switch(a){case "selectionchange":W.addListener(a,c);break;case "click":l(b,a,c);break;default:var d=N[a];void 0===d&&(d=N[a]=[]);c&&-1===d.indexOf(c)&&d.push(c)}};this.getFormatting=function(){return Z};this.setZoomLevel=function(a){R=a;A()};this.getZoomLevel=function(){return R};this.fitToContainingElement=function(a,c){var d=b.offsetHeight/R;R=a/(b.offsetWidth/R);c/d<R&&(R=c/d);A()};this.fitToWidth=function(a){R=
a/(b.offsetWidth/R);A()};this.fitSmart=function(a,c){var d,g;d=b.offsetWidth/R;g=b.offsetHeight/R;d=a/d;void 0!==c&&c/g<d&&(d=c/g);R=Math.min(1,d);A()};this.fitToHeight=function(a){R=a/(b.offsetHeight/R);A()};this.showFirstPage=function(){L.showFirstPage()};this.showNextPage=function(){L.showNextPage()};this.showPreviousPage=function(){L.showPreviousPage()};this.showPage=function(a){L.showPage(a);A()};this.showAllPages=function(){};this.getElement=function(){return b}};return odf.OdfCanvas}();
// Input 33
runtime.loadClass("odf.OdfCanvas");
odf.CommandLineTools=function(){this.roundTrip=function(e,k,l){new odf.OdfContainer(e,function(p){if(p.state===odf.OdfContainer.INVALID)return l("Document "+e+" is invalid.");p.state===odf.OdfContainer.DONE?p.saveAs(k,function(e){l(e)}):l("Document was not completely loaded.")})};this.render=function(e,k,l){for(k=k.getElementsByTagName("body")[0];k.firstChild;)k.removeChild(k.firstChild);k=new odf.OdfCanvas(k);k.addListener("statereadychange",function(e){l(e)});k.load(e)}};
// Input 34
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.Operation=function(){};ops.Operation.prototype.init=function(e){};ops.Operation.prototype.execute=function(e){};ops.Operation.prototype.spec=function(){};
// Input 35
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpAddCursor=function(){var e,k;this.init=function(l){e=l.memberid;k=l.timestamp};this.execute=function(k){var p=k.getCursor(e);if(p)return!1;p=new ops.OdtCursor(e,k);k.addCursor(p);k.emit(ops.OdtDocument.signalCursorAdded,p);return!0};this.spec=function(){return{optype:"AddCursor",memberid:e,timestamp:k}}};
// Input 36
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("odf.OdfUtils");
ops.OpApplyStyle=function(){function e(b){var a=0<=h?r+h:r,e=b.getIteratorAtPosition(0<=h?r:r+h),a=h?b.getIteratorAtPosition(a):e;b=b.getDOM().createRange();b.setStart(e.container(),e.unfilteredDomOffset());b.setEnd(a.container(),a.unfilteredDomOffset());return b}function k(b){var a=b.commonAncestorContainer,e;e=Array.prototype.slice.call(a.getElementsByTagNameNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","p"));for(e=e.concat(Array.prototype.slice.call(a.getElementsByTagNameNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","h")));a&&
!f.isParagraph(a);)a=a.parentNode;a&&e.push(a);return e.filter(function(a){var g=a.nodeType===Node.TEXT_NODE?a.length:a.childNodes.length;return 0>=b.comparePoint(a,0)&&0<=b.comparePoint(a,g)})}var l,p,r,h,b,f=new odf.OdfUtils;this.init=function(d){l=d.memberid;p=d.timestamp;r=d.position;h=d.length;b=d.info};this.execute=function(d){var a=e(d),f=k(a);d.getFormatting().applyStyle(a,b);a.detach();d.getOdfCanvas().refreshCSS();f.forEach(function(a){d.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:a,
memberId:l,timeStamp:p})});return!0};this.spec=function(){return{optype:"ApplyStyle",memberid:l,timestamp:p,position:r,length:h,info:b}}};
// Input 37
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpRemoveCursor=function(){var e,k;this.init=function(l){e=l.memberid;k=l.timestamp};this.execute=function(k){return k.removeCursor(e)?!0:!1};this.spec=function(){return{optype:"RemoveCursor",memberid:e,timestamp:k}}};
// Input 38
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpMoveCursor=function(){var e,k,l,p;this.init=function(r){e=r.memberid;k=r.timestamp;l=r.position;p=r.length||0};this.execute=function(k){var h=k.getCursor(e),b=k.getCursorPosition(e),f=k.getPositionFilter(),d=l-b;if(!h)return!1;b=h.getStepCounter();d=0<d?b.countForwardSteps(d,f):0>d?-b.countBackwardSteps(-d,f):0;h.move(d);p&&(f=0<p?b.countForwardSteps(p,f):0>p?-b.countBackwardSteps(-p,f):0,h.move(f,!0));k.emit(ops.OdtDocument.signalCursorMoved,h);return!0};this.spec=function(){return{optype:"MoveCursor",
memberid:e,timestamp:k,position:l,length:p}}};
// Input 39
ops.OpInsertTable=function(){function e(b,d){var g;if(1===a.length)g=a[0];else if(3===a.length)switch(b){case 0:g=a[0];break;case p-1:g=a[2];break;default:g=a[1]}else g=a[b];if(1===g.length)return g[0];if(3===g.length)switch(d){case 0:return g[0];case r-1:return g[2];default:return g[1]}return g[d]}var k,l,p,r,h,b,f,d,a;this.init=function(e){k=e.memberid;l=e.timestamp;h=e.position;p=e.initialRows;r=e.initialColumns;b=e.tableName;f=e.tableStyleName;d=e.tableColumnStyleName;a=e.tableCellStyleMatrix};
this.execute=function(a){var q=a.getPositionInTextNode(h),g=a.getRootNode();if(q){var c=a.getDOM(),u=c.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table"),t=c.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table-column"),s,m,A,x;f&&u.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:style-name",f);b&&u.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:name",b);t.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0",
"table:number-columns-repeated",r);d&&t.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:style-name",d);u.appendChild(t);for(A=0;A<p;A+=1){t=c.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table-row");for(x=0;x<r;x+=1)s=c.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table-cell"),(m=e(A,x))&&s.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:style-name",m),m=c.createElementNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0",
"text:p"),s.appendChild(m),t.appendChild(s);u.appendChild(t)}q=a.getParagraphElement(q.textNode);g.insertBefore(u,q?q.nextSibling:void 0);a.getOdfCanvas().refreshSize();a.emit(ops.OdtDocument.signalTableAdded,{tableElement:u,memberId:k,timeStamp:l});return!0}return!1};this.spec=function(){return{optype:"InsertTable",memberid:k,timestamp:l,position:h,initialRows:p,initialColumns:r,tableName:b,tableStyleName:f,tableColumnStyleName:d,tableCellStyleMatrix:a}}};
// Input 40
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpInsertText=function(){function e(e,b){var f=b.parentNode,d=b.nextSibling,a=[];e.getCursors().forEach(function(d){var e=d.getSelectedRange();!e||e.startContainer!==b&&e.endContainer!==b||a.push({cursor:d,startContainer:e.startContainer,startOffset:e.startOffset,endContainer:e.endContainer,endOffset:e.endOffset})});f.removeChild(b);f.insertBefore(b,d);a.forEach(function(a){var b=a.cursor.getSelectedRange();b.setStart(a.startContainer,a.startOffset);b.setEnd(a.endContainer,a.endOffset)})}var k,
l,p,r;this.init=function(e){k=e.memberid;l=e.timestamp;p=e.position;r=e.text};this.execute=function(h){var b,f=r.split(" "),d,a,n,q,g=h.getRootNode().ownerDocument,c;if(b=h.getPositionInTextNode(p,k)){a=b.textNode;n=a.parentNode;q=a.nextSibling;d=b.offset;b=h.getParagraphElement(a);d!==a.length&&(q=a.splitText(d));0<f[0].length&&a.appendData(f[0]);for(c=1;c<f.length;c+=1)d=g.createElementNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","text:s"),d.appendChild(g.createTextNode(" ")),n.insertBefore(d,
q),0<f[c].length&&n.insertBefore(g.createTextNode(f[c]),q);e(h,a);0===a.length&&a.parentNode.removeChild(a);h.getOdfCanvas().refreshSize();h.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:b,memberId:k,timeStamp:l});return!0}return!1};this.spec=function(){return{optype:"InsertText",memberid:k,timestamp:l,position:p,text:r}}};
// Input 41
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpRemoveText=function(){function e(a){var b,d,c,e,f;b=a.getCursors();e=a.getPositionFilter();for(f in b)b.hasOwnProperty(f)&&(d=b[f].getStepCounter(),d.isPositionWalkable(e)||(c=-d.countBackwardSteps(1,e),0===c&&(c=d.countForwardSteps(1,e)),b[f].move(c),f===p&&a.emit(ops.OdtDocument.signalCursorMoved,b[f])))}function k(a){if(!d.isParagraph(a)&&(d.isGroupingElement(a)||d.isCharacterElement(a))&&0===a.textContent.length){for(a=a.firstChild;a;){if(d.isCharacterElement(a))return!1;a=a.nextSibling}return!0}return!1}
function l(b,e,g){var c,f;c=g?e.lastChild:e.firstChild;for(g&&(f=b.getElementsByTagNameNS(a,"editinfo")[0]||b.firstChild);c;){e.removeChild(c);if("editinfo"!==c.localName)if(k(c))for(;c.firstChild;)b.insertBefore(c.firstChild,f);else b.insertBefore(c,f);c=g?e.lastChild:e.firstChild}b=e.parentNode;b.removeChild(e);d.isListItem(b)&&0===b.childNodes.length&&b.parentNode.removeChild(b)}var p,r,h,b,f,d,a="urn:webodf:names:editinfo";this.init=function(a){runtime.assert(0<=a.length,"OpRemoveText only supports positive lengths");
p=a.memberid;r=a.timestamp;h=parseInt(a.position,10);b=parseInt(a.length,10);f=a.text;d=new odf.OdfUtils};this.execute=function(a){var d=[],g,c,f,t=null,s=null,m;c=h;var A=b;a.upgradeWhitespacesAtPosition(c);g=a.getPositionInTextNode(c);var d=g.textNode,x=g.offset,v=d.parentNode;g=a.getParagraphElement(v);f=A;""===d.data?(v.removeChild(d),c=a.getTextNeighborhood(c,A)):0!==x?(v=f<d.length-x?f:d.length-x,d.deleteData(x,v),a.upgradeWhitespacesAtPosition(c),c=a.getTextNeighborhood(c,A+v),f-=v,v&&c[0]===
d&&c.splice(0,1)):c=a.getTextNeighborhood(c,A);for(d=c;f;)if(d[0]&&(t=d[0],s=t.parentNode,m=t.length),c=a.getParagraphElement(t),g!==c){if(c=a.getNeighboringParagraph(g,1))1<a.getWalkableParagraphLength(g)?l(g,c,!1):(l(c,g,!0),g=c);f-=1}else if(m<=f){s.removeChild(t);for(e(a);k(s);){for(c=s.parentNode;s.firstChild;)c.insertBefore(s.firstChild,s);c.removeChild(s);s=c}f-=m;d.splice(0,1)}else t.deleteData(0,f),a.upgradeWhitespacesAtPosition(h),f=0;e(a);a.getOdfCanvas().refreshSize();a.emit(ops.OdtDocument.signalParagraphChanged,
{paragraphElement:g,memberId:p,timeStamp:r});a.emit(ops.OdtDocument.signalCursorMoved,a.getCursor(p));return!0};this.spec=function(){return{optype:"RemoveText",memberid:p,timestamp:r,position:h,length:b,text:f}}};
// Input 42
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpSplitParagraph=function(){var e,k,l,p;this.init=function(r){e=r.memberid;k=r.timestamp;l=r.position;p=new odf.OdfUtils};this.execute=function(r){var h,b,f,d,a,n;h=r.getPositionInTextNode(l,e);if(!h)return!1;b=r.getParagraphElement(h.textNode);if(!b)return!1;f=p.isListItem(b.parentNode)?b.parentNode:b;0===h.offset?(n=h.textNode.previousSibling,a=null):(n=h.textNode,a=h.offset>=h.textNode.length?null:h.textNode.splitText(h.offset));for(h=h.textNode;h!==f;)if(h=h.parentNode,d=h.cloneNode(!1),n){for(a&&
d.appendChild(a);n.nextSibling;)d.appendChild(n.nextSibling);h.parentNode.insertBefore(d,h.nextSibling);n=h;a=d}else h.parentNode.insertBefore(d,h),n=d,a=h;p.isListItem(a)&&(a=a.childNodes[0]);r.getOdfCanvas().refreshSize();r.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:b,memberId:e,timeStamp:k});r.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:a,memberId:e,timeStamp:k});return!0};this.spec=function(){return{optype:"SplitParagraph",memberid:e,timestamp:k,position:l}}};
// Input 43
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpSetParagraphStyle=function(){var e,k,l,p;this.init=function(r){e=r.memberid;k=r.timestamp;l=r.position;p=r.styleName};this.execute=function(r){var h;if(h=r.getPositionInTextNode(l))if(h=r.getParagraphElement(h.textNode))return""!==p?h.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","text:style-name",p):h.removeAttributeNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","style-name"),r.getOdfCanvas().refreshSize(),r.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:h,
timeStamp:k,memberId:e}),!0;return!1};this.spec=function(){return{optype:"SetParagraphStyle",memberid:e,timestamp:k,position:l,styleName:p}}};
// Input 44
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpUpdateParagraphStyle=function(){function e(a,b,d){var e,c,f;for(e=0;e<d.length;e+=1)c=d[e],f=b[c.propertyName],void 0!==f&&a.setAttributeNS(c.attrNs,c.attrPrefix+":"+c.attrLocaName,void 0!==c.unit?f+c.unit:f)}function k(a,b,d){var e,c;for(e=0;e<d.length;e+=1)c=d[e],-1!==b.indexOf(c.propertyName)&&a.removeAttributeNS(c.attrNs,c.attrLocaName)}var l,p,r,h,b,f=[{propertyName:"fontSize",attrNs:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",attrPrefix:"fo",attrLocaName:"font-size",
unit:"pt"},{propertyName:"fontName",attrNs:"urn:oasis:names:tc:opendocument:xmlns:style:1.0",attrPrefix:"style",attrLocaName:"font-name"},{propertyName:"color",attrNs:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",attrPrefix:"fo",attrLocaName:"color"},{propertyName:"backgroundColor",attrNs:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",attrPrefix:"fo",attrLocaName:"background-color"},{propertyName:"fontWeight",attrNs:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",
attrPrefix:"fo",attrLocaName:"font-weight"},{propertyName:"fontStyle",attrNs:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",attrPrefix:"fo",attrLocaName:"font-style"},{propertyName:"underline",attrNs:"urn:oasis:names:tc:opendocument:xmlns:style:1.0",attrPrefix:"style",attrLocaName:"text-underline-style"},{propertyName:"strikethrough",attrNs:"urn:oasis:names:tc:opendocument:xmlns:style:1.0",attrPrefix:"style",attrLocaName:"text-line-through-style"}],d=[{propertyName:"topMargin",attrNs:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",
attrPrefix:"fo",attrLocaName:"margin-top",unit:"mm"},{propertyName:"bottomMargin",attrNs:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",attrPrefix:"fo",attrLocaName:"margin-bottom",unit:"mm"},{propertyName:"leftMargin",attrNs:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",attrPrefix:"fo",attrLocaName:"margin-left",unit:"mm"},{propertyName:"rightMargin",attrNs:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",attrPrefix:"fo",attrLocaName:"margin-right",unit:"mm"},
{propertyName:"textAlign",attrNs:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",attrPrefix:"fo",attrLocaName:"text-align"}];this.init=function(a){l=a.memberid;p=a.timestamp;r=a.styleName;h=a.setProperties;b=a.removedProperties};this.execute=function(a){var n,l,g,c;return(n=a.getParagraphStyleElement(r))?(l=n.getElementsByTagNameNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","paragraph-properties")[0],g=n.getElementsByTagNameNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0",
"text-properties")[0],h&&(void 0===l&&h.paragraphProperties&&(l=a.getDOM().createElementNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","style:paragraph-properties"),n.appendChild(l)),void 0===g&&h.textProperties&&(g=a.getDOM().createElementNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","style:text-properties"),n.appendChild(g)),h.paragraphProperties&&e(l,h.paragraphProperties,d),h.textProperties&&(h.textProperties.fontName&&!a.getOdfCanvas().getFormatting().getFontMap().hasOwnProperty(h.textProperties.fontName)&&
(c=a.getDOM().createElementNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","style:font-face"),c.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","style:name",h.textProperties.fontName),c.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0","svg:font-family",h.textProperties.fontName),a.getOdfCanvas().odfContainer().rootElement.fontFaceDecls.appendChild(c)),e(g,h.textProperties,f))),b&&(b.paragraphPropertyNames&&(k(l,b.paragraphPropertyNames,d),0===l.attributes.length&&
n.removeChild(l)),b.textPropertyNames&&(k(g,b.textPropertyNames,f),0===g.attributes.length&&n.removeChild(g))),a.getOdfCanvas().refreshCSS(),a.emit(ops.OdtDocument.signalParagraphStyleModified,r),!0):!1};this.spec=function(){return{optype:"UpdateParagraphStyle",memberid:l,timestamp:p,styleName:r,setProperties:h,removedProperties:b}}};
// Input 45
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpCloneParagraphStyle=function(){var e,k,l,p,r;this.init=function(h){e=h.memberid;k=h.timestamp;l=h.styleName;p=h.newStyleName;r=h.newStyleDisplayName};this.execute=function(e){var b=e.getParagraphStyleElement(l),f;if(!b)return!1;f=b.cloneNode(!0);f.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","style:name",p);r?f.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","style:display-name",r):f.removeAttributeNS("urn:oasis:names:tc:opendocument:xmlns:style:1.0","display-name");
b.parentNode.appendChild(f);e.getOdfCanvas().refreshCSS();e.emit(ops.OdtDocument.signalStyleCreated,p);return!0};this.spec=function(){return{optype:"CloneParagraphStyle",memberid:e,timestamp:k,styleName:l,newStyleName:p,newStyleDisplayName:r}}};
// Input 46
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OpDeleteParagraphStyle=function(){var e,k,l;this.init=function(p){e=p.memberid;k=p.timestamp;l=p.styleName};this.execute=function(e){var k=e.getParagraphStyleElement(l);if(!k)return!1;k.parentNode.removeChild(k);e.getOdfCanvas().refreshCSS();e.emit(ops.OdtDocument.signalStyleDeleted,l);return!0};this.spec=function(){return{optype:"DeleteParagraphStyle",memberid:e,timestamp:k,styleName:l}}};
// Input 47
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("ops.OpAddCursor");runtime.loadClass("ops.OpApplyStyle");runtime.loadClass("ops.OpRemoveCursor");runtime.loadClass("ops.OpMoveCursor");runtime.loadClass("ops.OpInsertTable");runtime.loadClass("ops.OpInsertText");runtime.loadClass("ops.OpRemoveText");runtime.loadClass("ops.OpSplitParagraph");runtime.loadClass("ops.OpSetParagraphStyle");runtime.loadClass("ops.OpUpdateParagraphStyle");runtime.loadClass("ops.OpCloneParagraphStyle");runtime.loadClass("ops.OpDeleteParagraphStyle");
ops.OperationFactory=function(){this.create=function(e){var k=null;"AddCursor"===e.optype?k=new ops.OpAddCursor:"ApplyStyle"===e.optype?k=new ops.OpApplyStyle:"InsertTable"===e.optype?k=new ops.OpInsertTable:"InsertText"===e.optype?k=new ops.OpInsertText:"RemoveText"===e.optype?k=new ops.OpRemoveText:"SplitParagraph"===e.optype?k=new ops.OpSplitParagraph:"SetParagraphStyle"===e.optype?k=new ops.OpSetParagraphStyle:"UpdateParagraphStyle"===e.optype?k=new ops.OpUpdateParagraphStyle:"CloneParagraphStyle"===
e.optype?k=new ops.OpCloneParagraphStyle:"DeleteParagraphStyle"===e.optype?k=new ops.OpDeleteParagraphStyle:"MoveCursor"===e.optype?k=new ops.OpMoveCursor:"RemoveCursor"===e.optype&&(k=new ops.OpRemoveCursor);k&&k.init(e);return k}};
// Input 48
runtime.loadClass("core.Cursor");runtime.loadClass("core.PositionIterator");runtime.loadClass("core.PositionFilter");runtime.loadClass("core.LoopWatchDog");runtime.loadClass("odf.OdfUtils");
gui.SelectionMover=function(e,k){function l(){c.setUnfilteredPosition(e.getNode(),0);return c}function p(a,b,c){var d;c.setStart(a,b);d=c.getClientRects()[0];if(!d)if(d={},a.childNodes[b-1]){c.setStart(a,b-1);c.setEnd(a,b);b=c.getClientRects()[0];if(!b){for(c=b=0;a&&a.nodeType===Node.ELEMENT_NODE;)b+=a.offsetLeft-a.scrollLeft,c+=a.offsetTop-a.scrollTop,a=a.parentNode;b={top:c,left:b}}d.top=b.top;d.left=b.right;d.bottom=b.bottom}else a.nodeType===Node.TEXT_NODE?(a.previousSibling&&(d=a.previousSibling.getClientRects()[0]),
d||(c.setStart(a,0),c.setEnd(a,b),d=c.getClientRects()[0])):d=a.getClientRects()[0];return{top:d.top,left:d.left,bottom:d.bottom}}function r(a,b,c){var d=a,g=l(),f,h=k.ownerDocument.createRange(),n=e.getSelectedRange()?e.getSelectedRange().cloneRange():k.ownerDocument.createRange(),q;for(f=p(e.getNode(),0,h);0<d&&c();)d-=1;b?(b=g.container(),g=g.unfilteredDomOffset(),-1===n.comparePoint(b,g)?(n.setStart(b,g),q=!1):n.setEnd(b,g)):(n.setStart(g.container(),g.unfilteredDomOffset()),n.collapse(!0));e.setSelectedRange(n,
q);n=p(e.getNode(),0,h);if(n.top===f.top||void 0===u)u=n.left;window.clearTimeout(t);t=window.setTimeout(function(){u=void 0},2E3);h.detach();return a-d}function h(a){var b=l();return 1===a.acceptPosition(b)?!0:!1}function b(a,b){for(var c=l(),d=new core.LoopWatchDog(1E3),e=0,g=0;0<a&&c.nextPosition();)e+=1,d.check(),1===b.acceptPosition(c)&&(g+=e,e=0,a-=1);return g}function f(a,b){for(var c=l(),d=new core.LoopWatchDog(1E3),e=0,g=0;0<a&&c.previousPosition();)e+=1,d.check(),1===b.acceptPosition(c)&&
(g+=e,e=0,a-=1);return g}function d(a,b){var c=l(),d=0,e=0,g=0>a?-1:1;for(a=Math.abs(a);0<a;){for(var f=b,h=g,n=c,q=n.container(),r=0,t=null,C=void 0,D=10,G=void 0,X=0,Q=void 0,F=void 0,K=void 0,G=void 0,H=k.ownerDocument.createRange(),U=new core.LoopWatchDog(1E3),G=p(q,n.unfilteredDomOffset(),H),Q=G.top,F=void 0===u?G.left:u,K=Q;!0===(0>h?n.previousPosition():n.nextPosition());)if(U.check(),1===f.acceptPosition(n)&&(r+=1,q=n.container(),G=p(q,n.unfilteredDomOffset(),H),G.top!==Q)){if(G.top!==K&&
K!==Q)break;K=G.top;G=Math.abs(F-G.left);if(null===t||G<D)t=q,C=n.unfilteredDomOffset(),D=G,X=r}null!==t?(n.setUnfilteredPosition(t,C),r=X):r=0;H.detach();d+=r;if(0===d)break;e+=d;a-=1}return e*g}function a(a,b){var c=l(),d=g.getParagraphElement(c.getCurrentNode()),e=0,f,n,h,q,r=k.ownerDocument.createRange();0>a?(f=c.previousPosition,n=-1):(f=c.nextPosition,n=1);for(h=p(c.container(),c.unfilteredDomOffset(),r);f.call(c);)if(b.acceptPosition(c)===NodeFilter.FILTER_ACCEPT){if(g.getParagraphElement(c.getCurrentNode())!==
d)break;q=p(c.container(),c.unfilteredDomOffset(),r);if(q.bottom!==h.bottom&&(h=q.top>=h.top&&q.bottom<h.bottom||q.top<=h.top&&q.bottom>h.bottom,!h))break;e+=n;h=q}r.detach();return e}function n(a,b){for(var c=0,d;a.parentNode!==b;)runtime.assert(null!==a.parentNode,"parent is null"),a=a.parentNode;for(d=b.firstChild;d!==a;)c+=1,d=d.nextSibling;return c}function q(a,b,c){runtime.assert(null!==a,"SelectionMover.countStepsToPosition called with element===null");var d=l(),e=d.container(),g=d.unfilteredDomOffset(),
f=0,h=new core.LoopWatchDog(1E3);d.setUnfilteredPosition(a,b);a=d.container();runtime.assert(Boolean(a),"SelectionMover.countStepsToPosition: positionIterator.container() returned null");b=d.unfilteredDomOffset();d.setUnfilteredPosition(e,g);var e=a,g=b,k=d.container(),p=d.unfilteredDomOffset();if(e===k)e=p-g;else{var q=e.compareDocumentPosition(k);2===q?q=-1:4===q?q=1:10===q?(g=n(e,k),q=g<p?1:-1):(p=n(k,e),q=p<g?-1:1);e=q}if(0>e)for(;d.nextPosition()&&(h.check(),1===c.acceptPosition(d)&&(f+=1),d.container()!==
a||d.unfilteredDomOffset()!==b););else if(0<e)for(;d.previousPosition()&&(h.check(),1===c.acceptPosition(d)&&(f-=1),d.container()!==a||d.unfilteredDomOffset()!==b););return f}var g,c,u,t;this.movePointForward=function(a,b){return r(a,b,c.nextPosition)};this.movePointBackward=function(a,b){return r(a,b,c.previousPosition)};this.getStepCounter=function(){return{countForwardSteps:b,countBackwardSteps:f,countLinesSteps:d,countStepsToLineBoundary:a,countStepsToPosition:q,isPositionWalkable:h}};(function(){g=
new odf.OdfUtils;c=gui.SelectionMover.createPositionIterator(k);var a=k.ownerDocument.createRange();a.setStart(c.container(),c.unfilteredDomOffset());a.collapse(!0);e.setSelectedRange(a)})()};gui.SelectionMover.createPositionIterator=function(e){var k=new function(){this.acceptNode=function(e){return"urn:webodf:names:cursor"===e.namespaceURI||"urn:webodf:names:editinfo"===e.namespaceURI?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}};return new core.PositionIterator(e,5,k,!1)};(function(){return gui.SelectionMover})();
// Input 49
runtime.loadClass("core.Cursor");runtime.loadClass("gui.SelectionMover");
ops.OdtCursor=function(e,k){var l=this,p,r;this.removeFromOdtDocument=function(){r.remove()};this.move=function(e,b){var f=0;0<e?f=p.movePointForward(e,b):0>=e&&(f=-p.movePointBackward(-e,b));l.handleUpdate();return f};this.handleUpdate=function(){};this.getStepCounter=function(){return p.getStepCounter()};this.getMemberId=function(){return e};this.getNode=function(){return r.getNode()};this.getAnchorNode=function(){return r.getAnchorNode()};this.getSelectedRange=function(){return r.getSelectedRange()};
this.getOdtDocument=function(){return k};r=new core.Cursor(k.getDOM(),e);p=new gui.SelectionMover(r,k.getRootNode())};
// Input 50
/*

 Copyright (C) 2012 KO GmbH <aditya.bhatt@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.EditInfo=function(e,k){function l(){var e=[],b;for(b in r)r.hasOwnProperty(b)&&e.push({memberid:b,time:r[b].time});e.sort(function(b,d){return b.time-d.time});return e}var p,r={};this.getNode=function(){return p};this.getOdtDocument=function(){return k};this.getEdits=function(){return r};this.getSortedEdits=function(){return l()};this.addEdit=function(e,b){var f,d=e.split("___")[0];if(!r[e])for(f in r)if(r.hasOwnProperty(f)&&f.split("___")[0]===d){delete r[f];break}r[e]={time:b}};this.clearEdits=
function(){r={}};p=k.getDOM().createElementNS("urn:webodf:names:editinfo","editinfo");e.insertBefore(p,e.firstChild)};
// Input 51
gui.Avatar=function(e,k){var l=this,p,r,h;this.setColor=function(b){r.style.borderColor=b};this.setImageUrl=function(b){l.isVisible()?r.src=b:h=b};this.isVisible=function(){return"block"===p.style.display};this.show=function(){h&&(r.src=h,h=void 0);p.style.display="block"};this.hide=function(){p.style.display="none"};this.markAsFocussed=function(b){p.className=b?"active":""};(function(){var b=e.ownerDocument,f=b.documentElement.namespaceURI;p=b.createElementNS(f,"div");r=b.createElementNS(f,"img");
r.width=64;r.height=64;p.appendChild(r);p.style.width="64px";p.style.height="70px";p.style.position="absolute";p.style.top="-80px";p.style.left="-34px";p.style.display=k?"block":"none";e.appendChild(p)})()};
// Input 52
runtime.loadClass("gui.Avatar");runtime.loadClass("ops.OdtCursor");
gui.Caret=function(e,k){function l(){f&&b.parentNode&&!d&&(d=!0,r.style.borderColor="transparent"===r.style.borderColor?a:"transparent",runtime.setTimeout(function(){d=!1;l()},500))}function p(a){var b;if("string"===typeof a){if(""===a)return 0;b=/^(\d+)(\.\d+)?px$/.exec(a);runtime.assert(null!==b,"size ["+a+"] does not have unit px.");return parseFloat(b[1])}return a}var r,h,b,f=!1,d=!1,a="";this.setFocus=function(){f=!0;h.markAsFocussed(!0);l()};this.removeFocus=function(){f=!1;h.markAsFocussed(!1);
r.style.borderColor=a};this.setAvatarImageUrl=function(a){h.setImageUrl(a)};this.setColor=function(b){a!==b&&(a=b,"transparent"!==r.style.borderColor&&(r.style.borderColor=a),h.setColor(a))};this.getCursor=function(){return e};this.getFocusElement=function(){return r};this.toggleHandleVisibility=function(){h.isVisible()?h.hide():h.show()};this.showHandle=function(){h.show()};this.hideHandle=function(){h.hide()};this.ensureVisible=function(){var a,b,d,c,f,h,k,m=e.getOdtDocument().getOdfCanvas().getElement().parentNode;
f=k=r;d=runtime.getWindow();runtime.assert(null!==d,"Expected to be run in an environment which has a global window, like a browser.");do{f=f.parentElement;if(!f)break;h=d.getComputedStyle(f,null)}while("block"!==h.display);h=f;f=c=0;if(h&&m){b=!1;do{d=h.offsetParent;for(a=h.parentNode;a!==d;){if(a===m){a=h;var l=m,x=0;b=0;var v=void 0,w=runtime.getWindow();for(runtime.assert(null!==w,"Expected to be run in an environment which has a global window, like a browser.");a&&a!==l;)v=w.getComputedStyle(a,
null),x+=p(v.marginLeft)+p(v.borderLeftWidth)+p(v.paddingLeft),b+=p(v.marginTop)+p(v.borderTopWidth)+p(v.paddingTop),a=a.parentElement;a=x;c+=a;f+=b;b=!0;break}a=a.parentNode}if(b)break;c+=p(h.offsetLeft);f+=p(h.offsetTop);h=d}while(h&&h!==m);d=c;c=f}else c=d=0;d+=k.offsetLeft;c+=k.offsetTop;f=d-5;h=c-5;d=d+k.scrollWidth-1+5;k=c+k.scrollHeight-1+5;h<m.scrollTop?m.scrollTop=h:k>m.scrollTop+m.clientHeight-1&&(m.scrollTop=k-m.clientHeight+1);f<m.scrollLeft?m.scrollLeft=f:d>m.scrollLeft+m.clientWidth-
1&&(m.scrollLeft=d-m.clientWidth+1)};(function(){var a=e.getOdtDocument().getDOM();r=a.createElementNS(a.documentElement.namespaceURI,"span");b=e.getNode();b.appendChild(r);h=new gui.Avatar(b,k)})()};
// Input 53
runtime.loadClass("core.EventNotifier");
gui.ClickHandler=function(){function e(){l=0;p=null}var k,l=0,p=null,r=new core.EventNotifier([gui.ClickHandler.signalSingleClick,gui.ClickHandler.signalDoubleClick,gui.ClickHandler.signalTripleClick]);this.subscribe=function(e,b){r.subscribe(e,b)};this.handleMouseUp=function(h){var b=runtime.getWindow();p&&p.x===h.screenX&&p.y===h.screenY?(l+=1,1===l?r.emit(gui.ClickHandler.signalSingleClick,void 0):2===l?r.emit(gui.ClickHandler.signalDoubleClick,void 0):3===l&&(b.clearTimeout(k),r.emit(gui.ClickHandler.signalTripleClick,
void 0),e())):(r.emit(gui.ClickHandler.signalSingleClick,void 0),l=1,p={x:h.screenX,y:h.screenY},b.clearTimeout(k),k=b.setTimeout(e,400))}};gui.ClickHandler.signalSingleClick="click";gui.ClickHandler.signalDoubleClick="doubleClick";gui.ClickHandler.signalTripleClick="tripleClick";(function(){return gui.ClickHandler})();
// Input 54
gui.Clipboard=function(){this.setDataFromRange=function(e,k){var l=!0,p,r=e.clipboardData,h=runtime.getWindow(),b,f;!r&&h&&(r=h.clipboardData);r?(h=new XMLSerializer,b=runtime.getDOMImplementation().createDocument("","",null),p=b.importNode(k.cloneContents(),!0),f=b.createElement("span"),f.appendChild(p),b.appendChild(f),p=r.setData("text/plain",k.toString()),l=l&&p,p=r.setData("text/html",h.serializeToString(b)),l=l&&p,e.preventDefault()):l=!1;return l}};(function(){return gui.Clipboard})();
// Input 55
runtime.loadClass("ops.OpAddCursor");runtime.loadClass("ops.OpRemoveCursor");runtime.loadClass("ops.OpMoveCursor");runtime.loadClass("ops.OpInsertText");runtime.loadClass("ops.OpRemoveText");runtime.loadClass("ops.OpSplitParagraph");runtime.loadClass("ops.OpSetParagraphStyle");runtime.loadClass("gui.ClickHandler");runtime.loadClass("gui.Clipboard");
gui.SessionController=function(){gui.SessionController=function(e,k){function l(a,b,c,d){var e="on"+b,g=!1;a.attachEvent&&(g=a.attachEvent(e,c));!g&&a.addEventListener&&(a.addEventListener(b,c,!1),g=!0);g&&!d||!a.hasOwnProperty(e)||(a[e]=c)}function p(a,b,c){var d="on"+b;a.detachEvent&&a.detachEvent(d,c);a.removeEventListener&&a.removeEventListener(b,c,!1);a[d]===c&&(a[d]=null)}function r(a){a.preventDefault?a.preventDefault():a.returnValue=!1}function h(a){r(a)}function b(a,b){var c=e.getOdtDocument(),
d=gui.SelectionMover.createPositionIterator(c.getRootNode()),g=c.getOdfCanvas().getElement(),f;if(f=a){for(;f!==g&&!("urn:webodf:names:cursor"===f.namespaceURI&&"cursor"===f.localName||"urn:webodf:names:editinfo"===f.namespaceURI&&"editinfo"===f.localName);)if(f=f.parentNode,!f)return;f!==g&&a!==f&&(a=f.parentNode,b=Array.prototype.indexOf.call(a.childNodes,f));d.setUnfilteredPosition(a,b);return c.getDistanceFromCursor(k,d.container(),d.unfilteredDomOffset())}}function f(a){var b=new ops.OpMoveCursor,
c=e.getOdtDocument().getCursorPosition(k);b.init({memberid:k,position:c+a});return b}function d(a){var b=new ops.OpMoveCursor,c=e.getOdtDocument().getCursorSelection(k);b.init({memberid:k,position:c.position,length:c.length+a});return b}function a(a){var b=e.getOdtDocument(),c=b.getParagraphElement(b.getCursor(k).getNode()),d=null;runtime.assert(Boolean(c),"SessionController: Cursor outside paragraph");b=b.getCursor(k).getStepCounter().countLinesSteps(a,b.getPositionFilter());0!==b&&(a=e.getOdtDocument().getCursorSelection(k),
d=new ops.OpMoveCursor,d.init({memberid:k,position:a.position,length:a.length+b}));return d}function n(a){var b=e.getOdtDocument(),c=b.getParagraphElement(b.getCursor(k).getNode()),d=null;runtime.assert(Boolean(c),"SessionController: Cursor outside paragraph");a=b.getCursor(k).getStepCounter().countLinesSteps(a,b.getPositionFilter());0!==a&&(b=b.getCursorPosition(k),d=new ops.OpMoveCursor,d.init({memberid:k,position:b+a}));return d}function q(a){var b=e.getOdtDocument(),c=b.getCursorPosition(k),d=
null;a=b.getCursor(k).getStepCounter().countStepsToLineBoundary(a,b.getPositionFilter());0!==a&&(d=new ops.OpMoveCursor,d.init({memberid:k,position:c+a}));return d}function g(){var a=e.getOdtDocument(),b=gui.SelectionMover.createPositionIterator(a.getRootNode()),c=null;b.moveToEnd();b=a.getDistanceFromCursor(k,b.container(),b.unfilteredDomOffset());0!==b&&(a=a.getCursorSelection(k),c=new ops.OpMoveCursor,c.init({memberid:k,position:a.position,length:a.length+b}));return c}function c(){var a=e.getOdtDocument(),
b,c=null;b=a.getDistanceFromCursor(k,a.getRootNode(),0);0!==b&&(a=a.getCursorSelection(k),c=new ops.OpMoveCursor,c.init({memberid:k,position:a.position,length:a.length+b}));return c}function u(a){0>a.length&&(a.position+=a.length,a.length=-a.length);return a}function t(a){var b=new ops.OpRemoveText;b.init({memberid:k,position:a.position,length:a.length});return b}function s(){var a=e.getOdtDocument().getCursor(k),b=runtime.getWindow().getSelection();b.removeAllRanges();b.addRange(a.getSelectedRange().cloneRange())}
function m(b){var m=b.keyCode,h=null,l=!1;if(37===m)h=b.shiftKey?d(-1):f(-1),l=!0;else if(39===m)h=b.shiftKey?d(1):f(1),l=!0;else if(38===m){if(y&&b.altKey&&b.shiftKey||b.ctrlKey&&b.shiftKey){var l=e.getOdtDocument(),p=l.getParagraphElement(l.getCursor(k).getNode()),v,h=null;if(p){m=l.getDistanceFromCursor(k,p,0);v=gui.SelectionMover.createPositionIterator(l.getRootNode());for(v.setUnfilteredPosition(p,0);0===m&&v.previousPosition();)p=v.getCurrentNode(),O.isParagraph(p)&&(m=l.getDistanceFromCursor(k,
p,0));0!==m&&(l=l.getCursorSelection(k),h=new ops.OpMoveCursor,h.init({memberid:k,position:l.position,length:l.length+m}))}}else h=b.metaKey&&b.shiftKey?c():b.shiftKey?a(-1):n(-1);l=!0}else if(40===m){if(y&&b.altKey&&b.shiftKey||b.ctrlKey&&b.shiftKey){h=e.getOdtDocument();v=h.getParagraphElement(h.getCursor(k).getNode());m=null;if(v){l=gui.SelectionMover.createPositionIterator(h.getRootNode());l.moveToEndOfNode(v);for(v=h.getDistanceFromCursor(k,l.container(),l.unfilteredDomOffset());0===v&&l.nextPosition();)p=
l.getCurrentNode(),O.isParagraph(p)&&(l.moveToEndOfNode(p),v=h.getDistanceFromCursor(k,l.container(),l.unfilteredDomOffset()));0!==v&&(h=h.getCursorSelection(k),m=new ops.OpMoveCursor,m.init({memberid:k,position:h.position,length:h.length+v}))}h=m}else h=b.metaKey&&b.shiftKey?g():b.shiftKey?a(1):n(1);l=!0}else 36===m?(!y&&b.ctrlKey&&b.shiftKey?h=c():y&&b.metaKey||b.ctrlKey?(l=e.getOdtDocument(),h=null,m=l.getDistanceFromCursor(k,l.getRootNode(),0),0!==m&&(l=l.getCursorPosition(k),h=new ops.OpMoveCursor,
h.init({memberid:k,position:l+m,length:0}))):h=q(-1),l=!0):35===m?(!y&&b.ctrlKey&&b.shiftKey?h=g():y&&b.metaKey||b.ctrlKey?(h=e.getOdtDocument(),l=gui.SelectionMover.createPositionIterator(h.getRootNode()),m=null,l.moveToEnd(),l=h.getDistanceFromCursor(k,l.container(),l.unfilteredDomOffset()),0!==l&&(h=h.getCursorPosition(k),m=new ops.OpMoveCursor,m.init({memberid:k,position:h+l,length:0})),h=m):h=q(1),l=!0):8===m?(m=e.getOdtDocument(),h=u(m.getCursorSelection(k)),l=null,0===h.length?0<h.position&&
m.getPositionInTextNode(h.position-1)&&(l=new ops.OpRemoveText,l.init({memberid:k,position:h.position-1,length:1})):l=t(h),h=l,l=!0):46===m?(m=e.getOdtDocument(),h=u(m.getCursorSelection(k)),l=null,0===h.length?m.getPositionInTextNode(h.position+1)&&(l=new ops.OpRemoveText,l.init({memberid:k,position:h.position,length:1})):l=t(h),h=l,l=null!==h):D&&90===m&&(!y&&b.ctrlKey||y&&b.metaKey)&&(b.shiftKey?D.moveForward(1):D.moveBackward(1),s(),l=!0);h&&e.enqueue(h);l&&r(b)}function A(a){var b,c;c=null===
a.which?String.fromCharCode(a.keyCode):0!==a.which&&0!==a.charCode?String.fromCharCode(a.which):null;13===a.keyCode?(b=e.getOdtDocument().getCursorPosition(k),c=new ops.OpSplitParagraph,c.init({memberid:k,position:b}),e.enqueue(c),r(a)):!c||(a.altKey||a.ctrlKey||a.metaKey)||(b=new ops.OpInsertText,b.init({memberid:k,position:e.getOdtDocument().getCursorPosition(k),text:c}),e.enqueue(b),r(a))}function x(a){var b=e.getOdtDocument().getCursor(k);b.getSelectedRange().collapsed||(J.setDataFromRange(a,
b.getSelectedRange())?(b=new ops.OpRemoveText,a=u(e.getOdtDocument().getCursorSelection(k)),b.init({memberid:k,position:a.position,length:a.length}),e.enqueue(b)):runtime.log("Cut operation failed"))}function v(){return!1!==e.getOdtDocument().getCursor(k).getSelectedRange().collapsed}function w(a){var b,c;window.clipboardData&&window.clipboardData.getData?b=window.clipboardData.getData("Text"):a.clipboardData&&a.clipboardData.getData&&(b=a.clipboardData.getData("text/plain"));b&&(c=new ops.OpInsertText,
c.init({memberid:k,position:e.getOdtDocument().getCursorPosition(k),text:b}),e.enqueue(c),r(a))}function P(){return!1}function B(a){if(D)D.onOperationExecuted(a)}function E(a){e.getOdtDocument().emit(ops.OdtDocument.signalUndoStackChanged,a)}var O=new odf.OdfUtils,y=-1!==runtime.getWindow().navigator.appVersion.toLowerCase().indexOf("mac"),J=new gui.Clipboard,C=new gui.ClickHandler,D;this.startEditing=function(){var a,b=e.getOdtDocument();a=b.getOdfCanvas().getElement();l(a,"keydown",m);l(a,"keypress",
A);l(a,"keyup",h);l(a,"beforecut",v,!0);l(a,"mouseup",C.handleMouseUp);l(a,"cut",x);l(a,"beforepaste",P,!0);l(a,"paste",w);b.subscribe(ops.OdtDocument.signalOperationExecuted,s);b.subscribe(ops.OdtDocument.signalOperationExecuted,B);a=new ops.OpAddCursor;a.init({memberid:k});e.enqueue(a);D&&D.saveInitialState()};this.endEditing=function(){var a;a=e.getOdtDocument();a.unsubscribe(ops.OdtDocument.signalOperationExecuted,B);a.unsubscribe(ops.OdtDocument.signalOperationExecuted,s);a=a.getOdfCanvas().getElement();
p(a,"keydown",m);p(a,"keypress",A);p(a,"keyup",h);p(a,"cut",x);p(a,"beforecut",v);p(a,"paste",w);p(a,"mouseup",C.handleMouseUp);p(a,"beforepaste",P);a=new ops.OpRemoveCursor;a.init({memberid:k});e.enqueue(a);D&&D.resetInitialState()};this.getInputMemberId=function(){return k};this.getSession=function(){return e};this.setUndoManager=function(a){D&&D.unsubscribe(gui.UndoManager.signalUndoStackChanged,E);if(D=a)D.setOdtDocument(e.getOdtDocument()),D.setPlaybackFunction(function(a){a.execute(e.getOdtDocument())}),
D.subscribe(gui.UndoManager.signalUndoStackChanged,E)};this.getUndoManager=function(){return D};C.subscribe(gui.ClickHandler.signalSingleClick,function(){var a=runtime.getWindow().getSelection(),c=e.getOdtDocument().getCursorPosition(k),d,g;d=b(a.anchorNode,a.anchorOffset);a=b(a.focusNode,a.focusOffset);if(0!==a||0!==d)g=new ops.OpMoveCursor,g.init({memberid:k,position:c+d,length:a-d}),e.enqueue(g)});C.subscribe(gui.ClickHandler.signalDoubleClick,function(){var a=e.getOdtDocument(),b=gui.SelectionMover.createPositionIterator(a.getRootNode()),
c=a.getCursor(k).getNode(),a=a.getCursorPosition(k),d=/[A-Za-z0-9]/,g=0,f=0,m,h,l;b.setUnfilteredPosition(c,0);if(b.previousPosition()&&(m=b.getCurrentNode(),m.nodeType===Node.TEXT_NODE))for(h=m.data.length-1;0<=h;h-=1)if(l=m.data[h],d.test(l))g-=1;else break;b.setUnfilteredPosition(c,0);if(b.nextPosition()&&(m=b.getCurrentNode(),m.nodeType===Node.TEXT_NODE))for(h=0;h<m.data.length;h+=1)if(l=m.data[h],d.test(l))f+=1;else break;if(0!==g||0!==f)b=new ops.OpMoveCursor,b.init({memberid:k,position:a+g,
length:Math.abs(g)+Math.abs(f)}),e.enqueue(b)});C.subscribe(gui.ClickHandler.signalTripleClick,function(){var a=e.getOdtDocument(),b=gui.SelectionMover.createPositionIterator(a.getRootNode()),c=a.getParagraphElement(a.getCursor(k).getNode()),d=a.getCursorPosition(k),g;g=a.getDistanceFromCursor(k,c,0);b.moveToEndOfNode(c);a=a.getDistanceFromCursor(k,c,b.unfilteredDomOffset());if(0!==g||0!==a)b=new ops.OpMoveCursor,b.init({memberid:k,position:d+g,length:Math.abs(g)+Math.abs(a)}),e.enqueue(b)})};return gui.SessionController}();
// Input 56
ops.UserModel=function(){};ops.UserModel.prototype.getUserDetailsAndUpdates=function(e,k){};ops.UserModel.prototype.unsubscribeUserDetailsUpdates=function(e,k){};
// Input 57
/*

 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.TrivialUserModel=function(){var e={bob:{memberid:"bob",fullname:"Bob Pigeon",color:"red",imageurl:"avatar-pigeon.png"},alice:{memberid:"alice",fullname:"Alice Bee",color:"green",imageurl:"avatar-flower.png"},you:{memberid:"you",fullname:"I, Robot",color:"blue",imageurl:"avatar-joe.png"}};this.getUserDetailsAndUpdates=function(k,l){var p=k.split("___")[0];l(k,e[p]||null)};this.unsubscribeUserDetailsUpdates=function(e,l){}};
// Input 58
ops.NowjsUserModel=function(){var e={},k={},l=runtime.getNetwork();this.getUserDetailsAndUpdates=function(p,r){var h=p.split("___")[0],b=e[h],f=k[h]=k[h]||[],d;runtime.assert(void 0!==r,"missing callback");for(d=0;d<f.length&&(f[d].subscriber!==r||f[d].memberId!==p);d+=1);d<f.length?runtime.log("double subscription request for "+p+" in NowjsUserModel::getUserDetailsAndUpdates"):(f.push({memberId:p,subscriber:r}),1===f.length&&l.subscribeUserDetailsUpdates(h));b&&r(p,b)};this.unsubscribeUserDetailsUpdates=
function(p,r){var h,b=p.split("___")[0],f=k[b];runtime.assert(void 0!==r,"missing subscriber parameter or null");runtime.assert(f,"tried to unsubscribe when no one is subscribed ('"+p+"')");if(f){for(h=0;h<f.length&&(f[h].subscriber!==r||f[h].memberId!==p);h+=1);runtime.assert(h<f.length,"tried to unsubscribe when not subscribed for memberId '"+p+"'");f.splice(h,1);0===f.length&&(runtime.log("no more subscribers for: "+p),delete k[b],delete e[b],l.unsubscribeUserDetailsUpdates(b))}};l.updateUserDetails=
function(l,r){var h=r?{userid:r.uid,fullname:r.fullname,imageurl:"/user/"+r.avatarId+"/avatar.png",color:r.color}:null,b,f;if(b=k[l])for(e[l]=h,f=0;f<b.length;f+=1)b[f].subscriber(b[f].memberId,h)};runtime.assert("ready"===l.networkStatus,"network not ready")};
// Input 59
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.OperationRouter=function(){};ops.OperationRouter.prototype.setOperationFactory=function(e){};ops.OperationRouter.prototype.setPlaybackFunction=function(e){};ops.OperationRouter.prototype.push=function(e){};
// Input 60
/*

 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
ops.TrivialOperationRouter=function(){var e,k;this.setOperationFactory=function(l){e=l};this.setPlaybackFunction=function(e){k=e};this.push=function(l){l=l.spec();l.timestamp=(new Date).getTime();l=e.create(l);k(l)}};
// Input 61
ops.NowjsOperationRouter=function(e,k){function l(a){var e;e=p.create(a);runtime.log(" op in: "+runtime.toJson(a));if(null!==e)if(a=Number(a.server_seq),runtime.assert(!isNaN(a),"server seq is not a number"),a===b+1)for(r(e),b=a,d=0,e=b+1;f.hasOwnProperty(e);e+=1)r(f[e]),delete f[e],runtime.log("op with server seq "+a+" taken from hold (reordered)");else runtime.assert(a!==b+1,"received incorrect order from server"),runtime.assert(!f.hasOwnProperty(a),"reorder_queue has incoming op"),runtime.log("op with server seq "+
a+" put on hold"),f[a]=e;else runtime.log("ignoring invalid incoming opspec: "+a)}var p,r,h=runtime.getNetwork(),b=-1,f={},d=0,a=1E3;this.setOperationFactory=function(a){p=a};this.setPlaybackFunction=function(a){r=a};h.ping=function(a){null!==k&&a(k)};h.receiveOp=function(a,b){a===e&&l(b)};this.push=function(f){f=f.spec();runtime.assert(null!==k,"Router sequence N/A without memberid");a+=1;f.client_nonce="C:"+k+":"+a;f.parent_op=b+"+"+d;d+=1;runtime.log("op out: "+runtime.toJson(f));h.deliverOp(e,
f)};this.requestReplay=function(a){h.requestReplay(e,function(a){runtime.log("replaying: "+runtime.toJson(a));l(a)},function(b){runtime.log("replay done ("+b+" ops).");a&&a()})};(function(){h.memberid=k;h.joinSession(e,function(a){runtime.assert(a,"Trying to join a session which does not exists or where we are already in")})})()};
// Input 62
gui.EditInfoHandle=function(e){var k=[],l,p=e.ownerDocument,r=p.documentElement.namespaceURI;this.setEdits=function(e){k=e;var b,f,d,a;l.innerHTML="";for(e=0;e<k.length;e+=1)b=p.createElementNS(r,"div"),b.className="editInfo",f=p.createElementNS(r,"span"),f.className="editInfoColor",f.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",k[e].memberid),d=p.createElementNS(r,"span"),d.className="editInfoAuthor",d.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",k[e].memberid),
a=p.createElementNS(r,"span"),a.className="editInfoTime",a.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",k[e].memberid),a.innerHTML=k[e].time,b.appendChild(f),b.appendChild(d),b.appendChild(a),l.appendChild(b)};this.show=function(){l.style.display="block"};this.hide=function(){l.style.display="none"};l=p.createElementNS(r,"div");l.setAttribute("class","editInfoHandle");l.style.display="none";e.appendChild(l)};
// Input 63
runtime.loadClass("ops.EditInfo");runtime.loadClass("gui.EditInfoHandle");
gui.EditInfoMarker=function(e,k){function l(a,d){return window.setTimeout(function(){b.style.opacity=a},d)}var p=this,r,h,b,f,d;this.addEdit=function(a,k){var p=Date.now()-k;e.addEdit(a,k);h.setEdits(e.getSortedEdits());b.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",a);f&&window.clearTimeout(f);d&&window.clearTimeout(d);1E4>p?(l(1,0),f=l(0.5,1E4-p),d=l(0.2,2E4-p)):1E4<=p&&2E4>p?(l(0.5,0),d=l(0.2,2E4-p)):l(0.2,0)};this.getEdits=function(){return e.getEdits()};this.clearEdits=function(){e.clearEdits();
h.setEdits([]);b.hasAttributeNS("urn:webodf:names:editinfo","editinfo:memberid")&&b.removeAttributeNS("urn:webodf:names:editinfo","editinfo:memberid")};this.getEditInfo=function(){return e};this.show=function(){b.style.display="block"};this.hide=function(){p.hideHandle();b.style.display="none"};this.showHandle=function(){h.show()};this.hideHandle=function(){h.hide()};(function(){var a=e.getOdtDocument().getDOM();b=a.createElementNS(a.documentElement.namespaceURI,"div");b.setAttribute("class","editInfoMarker");
b.onmouseover=function(){p.showHandle()};b.onmouseout=function(){p.hideHandle()};r=e.getNode();r.appendChild(b);h=new gui.EditInfoHandle(r);k||p.hide()})()};
// Input 64
/*

 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("gui.Caret");runtime.loadClass("ops.TrivialUserModel");runtime.loadClass("ops.EditInfo");runtime.loadClass("gui.EditInfoMarker");
gui.SessionView=function(){return function(e,k,l){function p(a,b,c){c=c.split("___")[0];return a+"."+b+'[editinfo|memberid^="'+c+'"]'}function r(a,b,c){function d(b,c,e){e=p(b,c,a)+e;a:{var g=q.firstChild;for(b=p(b,c,a);g;){if(g.nodeType===Node.TEXT_NODE&&0===g.data.indexOf(b)){b=g;break a}g=g.nextSibling}b=null}b?b.data=e:q.appendChild(document.createTextNode(e))}d("div","editInfoMarker","{ background-color: "+c+"; }");d("span","editInfoColor","{ background-color: "+c+"; }");d("span","editInfoAuthor",
':before { content: "'+b+'"; }')}function h(a){var b,c;for(c in g)g.hasOwnProperty(c)&&(b=g[c],a?b.show():b.hide())}function b(a){var b,c;for(c in n)n.hasOwnProperty(c)&&(b=n[c],a?b.showHandle():b.hideHandle())}function f(a,b){var c=n[a];void 0===b?runtime.log('UserModel sent undefined data for member "'+a+'".'):(null===b&&(b={memberid:a,fullname:"Unknown Identity",color:"black",imageurl:"avatar-joe.png"}),c&&(c.setAvatarImageUrl(b.imageurl),c.setColor(b.color)),r(a,b.fullname,b.color))}function d(a){var b=
l.createCaret(a,u);a=a.getMemberId();var c=k.getUserModel();n[a]=b;f(a,null);c.getUserDetailsAndUpdates(a,f);runtime.log("+++ View here +++ eagerly created an Caret for '"+a+"'! +++")}function a(a){var b=!1,c;delete n[a];for(c in g)if(g.hasOwnProperty(c)&&g[c].getEditInfo().getEdits().hasOwnProperty(a)){b=!0;break}b||k.getUserModel().unsubscribeUserDetailsUpdates(a,f)}var n={},q,g={},c=void 0!==e.editInfoMarkersInitiallyVisible?e.editInfoMarkersInitiallyVisible:!0,u=void 0!==e.caretAvatarsInitiallyVisible?
e.caretAvatarsInitiallyVisible:!0;this.showEditInfoMarkers=function(){c||(c=!0,h(c))};this.hideEditInfoMarkers=function(){c&&(c=!1,h(c))};this.showCaretAvatars=function(){u||(u=!0,b(u))};this.hideCaretAvatars=function(){u&&(u=!1,b(u))};this.getSession=function(){return k};this.getCaret=function(a){return n[a]};(function(){var b=k.getOdtDocument(),e=document.getElementsByTagName("head")[0];b.subscribe(ops.OdtDocument.signalCursorAdded,d);b.subscribe(ops.OdtDocument.signalCursorRemoved,a);b.subscribe(ops.OdtDocument.signalParagraphChanged,
function(a){var b=a.paragraphElement,d=a.memberId;a=a.timeStamp;var e,f="",h=b.getElementsByTagNameNS("urn:webodf:names:editinfo","editinfo")[0];h?(f=h.getAttributeNS("urn:webodf:names:editinfo","id"),e=g[f]):(f=Math.random().toString(),e=new ops.EditInfo(b,k.getOdtDocument()),e=new gui.EditInfoMarker(e,c),h=b.getElementsByTagNameNS("urn:webodf:names:editinfo","editinfo")[0],h.setAttributeNS("urn:webodf:names:editinfo","id",f),g[f]=e);e.addEdit(d,new Date(a))});q=document.createElementNS(e.namespaceURI,
"style");q.type="text/css";q.media="screen, print, handheld, projection";q.appendChild(document.createTextNode("@namespace editinfo url(urn:webodf:names:editinfo);"));e.appendChild(q)})()}}();
// Input 65
/*

 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("gui.Caret");gui.CaretFactory=function(e){this.createCaret=function(k,l){var p=k.getMemberId(),r=e.getSession().getOdtDocument(),h=r.getOdfCanvas().getElement(),b=new gui.Caret(k,l);p===e.getInputMemberId()&&(runtime.log("Starting to track input on new cursor of "+p),r.subscribe(ops.OdtDocument.signalParagraphChanged,function(e){e.memberId===p&&b.ensureVisible()}),k.handleUpdate=b.ensureVisible,h.setAttribute("tabindex",0),h.onfocus=b.setFocus,h.onblur=b.removeFocus,h.focus());return b}};
// Input 66
runtime.loadClass("xmldom.XPath");runtime.loadClass("odf.Namespaces");
gui.PresenterUI=function(){var e=new xmldom.XPath;return function(k){var l=this;l.setInitialSlideMode=function(){l.startSlideMode("single")};l.keyDownHandler=function(e){if(!e.target.isContentEditable&&"input"!==e.target.nodeName)switch(e.keyCode){case 84:l.toggleToolbar();break;case 37:case 8:l.prevSlide();break;case 39:case 32:l.nextSlide();break;case 36:l.firstSlide();break;case 35:l.lastSlide()}};l.root=function(){return l.odf_canvas.odfContainer().rootElement};l.firstSlide=function(){l.slideChange(function(e,
l){return 0})};l.lastSlide=function(){l.slideChange(function(e,l){return l-1})};l.nextSlide=function(){l.slideChange(function(e,l){return e+1<l?e+1:-1})};l.prevSlide=function(){l.slideChange(function(e,l){return 1>e?-1:e-1})};l.slideChange=function(e){var k=l.getPages(l.odf_canvas.odfContainer().rootElement),h=-1,b=0;k.forEach(function(e){e=e[1];e.hasAttribute("slide_current")&&(h=b,e.removeAttribute("slide_current"));b+=1});e=e(h,k.length);-1===e&&(e=h);k[e][1].setAttribute("slide_current","1");
document.getElementById("pagelist").selectedIndex=e;"cont"===l.slide_mode&&window.scrollBy(0,k[e][1].getBoundingClientRect().top-30)};l.selectSlide=function(e){l.slideChange(function(l,h){return e>=h||0>e?-1:e})};l.scrollIntoContView=function(e){var k=l.getPages(l.odf_canvas.odfContainer().rootElement);0!==k.length&&window.scrollBy(0,k[e][1].getBoundingClientRect().top-30)};l.getPages=function(e){e=e.getElementsByTagNameNS(odf.Namespaces.drawns,"page");var l=[],h;for(h=0;h<e.length;h+=1)l.push([e[h].getAttribute("draw:name"),
e[h]]);return l};l.fillPageList=function(k,r){for(var h=l.getPages(k),b,f,d;r.firstChild;)r.removeChild(r.firstChild);for(b=0;b<h.length;b+=1)f=document.createElement("option"),d=e.getODFElementsWithXPath(h[b][1],'./draw:frame[@presentation:class="title"]//draw:text-box/text:p',xmldom.XPath),d=0<d.length?d[0].textContent:h[b][0],f.textContent=b+1+": "+d,r.appendChild(f)};l.startSlideMode=function(e){var k=document.getElementById("pagelist"),h=l.odf_canvas.slidevisibilitycss().sheet;for(l.slide_mode=
e;0<h.cssRules.length;)h.deleteRule(0);l.selectSlide(0);"single"===l.slide_mode?(h.insertRule("draw|page { position:fixed; left:0px;top:30px; z-index:1; }",0),h.insertRule("draw|page[slide_current]  { z-index:2;}",1),h.insertRule("draw|page  { -webkit-transform: scale(1);}",2),l.fitToWindow(),window.addEventListener("resize",l.fitToWindow,!1)):"cont"===l.slide_mode&&window.removeEventListener("resize",l.fitToWindow,!1);l.fillPageList(l.odf_canvas.odfContainer().rootElement,k)};l.toggleToolbar=function(){var e,
k,h;e=l.odf_canvas.slidevisibilitycss().sheet;k=-1;for(h=0;h<e.cssRules.length;h+=1)if(".toolbar"===e.cssRules[h].cssText.substring(0,8)){k=h;break}-1<k?e.deleteRule(k):e.insertRule(".toolbar { position:fixed; left:0px;top:-200px; z-index:0; }",0)};l.fitToWindow=function(){var e=l.getPages(l.root()),k=(window.innerHeight-40)/e[0][1].clientHeight,e=(window.innerWidth-10)/e[0][1].clientWidth,k=k<e?k:e,e=l.odf_canvas.slidevisibilitycss().sheet;e.deleteRule(2);e.insertRule("draw|page { \n-moz-transform: scale("+
k+"); \n-moz-transform-origin: 0% 0%; -webkit-transform-origin: 0% 0%; -webkit-transform: scale("+k+"); -o-transform-origin: 0% 0%; -o-transform: scale("+k+"); -ms-transform-origin: 0% 0%; -ms-transform: scale("+k+"); }",2)};l.load=function(e){l.odf_canvas.load(e)};l.odf_element=k;l.odf_canvas=new odf.OdfCanvas(l.odf_element);l.odf_canvas.addListener("statereadychange",l.setInitialSlideMode);l.slide_mode="undefined";document.addEventListener("keydown",l.keyDownHandler,!1)}}();
// Input 67
runtime.loadClass("core.PositionIterator");runtime.loadClass("core.Cursor");
gui.XMLEdit=function(e,k){function l(a,b,c){a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent?a.attachEvent("on"+b,c):a["on"+b]=c}function p(a){a.preventDefault?a.preventDefault():a.returnValue=!1}function r(){var a=e.ownerDocument.defaultView.getSelection();!a||(0>=a.rangeCount||!t)||(a=a.getRangeAt(0),t.setPoint(a.startContainer,a.startOffset))}function h(){var a=e.ownerDocument.defaultView.getSelection(),b,c;a.removeAllRanges();t&&t.node()&&(b=t.node(),c=b.ownerDocument.createRange(),
c.setStart(b,t.position()),c.collapse(!0),a.addRange(c))}function b(a){var b=a.charCode||a.keyCode;if(t=null,t&&37===b)r(),t.stepBackward(),h();else if(16<=b&&20>=b||33<=b&&40>=b)return;p(a)}function f(a){}function d(a){e.ownerDocument.defaultView.getSelection().getRangeAt(0);p(a)}function a(b){for(var c=b.firstChild;c&&c!==b;)c.nodeType===Node.ELEMENT_NODE&&a(c),c=c.nextSibling||c.parentNode;var d,e,g,c=b.attributes;d="";for(g=c.length-1;0<=g;g-=1)e=c.item(g),d=d+" "+e.nodeName+'="'+e.nodeValue+
'"';b.setAttribute("customns_name",b.nodeName);b.setAttribute("customns_atts",d);c=b.firstChild;for(e=/^\s*$/;c&&c!==b;)d=c,c=c.nextSibling||c.parentNode,d.nodeType===Node.TEXT_NODE&&e.test(d.nodeValue)&&d.parentNode.removeChild(d)}function n(a,b){for(var c=a.firstChild,d,e,g;c&&c!==a;){if(c.nodeType===Node.ELEMENT_NODE)for(n(c,b),d=c.attributes,g=d.length-1;0<=g;g-=1)e=d.item(g),"http://www.w3.org/2000/xmlns/"!==e.namespaceURI||b[e.nodeValue]||(b[e.nodeValue]=e.localName);c=c.nextSibling||c.parentNode}}
function q(){var a=e.ownerDocument.createElement("style"),b;b={};n(e,b);var c={},d,f,h=0;for(d in b)if(b.hasOwnProperty(d)&&d){f=b[d];if(!f||c.hasOwnProperty(f)||"xmlns"===f){do f="ns"+h,h+=1;while(c.hasOwnProperty(f));b[d]=f}c[f]=!0}a.type="text/css";b="@namespace customns url(customns);\n"+g;a.appendChild(e.ownerDocument.createTextNode(b));k=k.parentNode.replaceChild(a,k)}var g,c,u,t=null;e.id||(e.id="xml"+String(Math.random()).substring(2));c="#"+e.id+" ";g=c+"*,"+c+":visited, "+c+":link {display:block; margin: 0px; margin-left: 10px; font-size: medium; color: black; background: white; font-variant: normal; font-weight: normal; font-style: normal; font-family: sans-serif; text-decoration: none; white-space: pre-wrap; height: auto; width: auto}\n"+
c+":before {color: blue; content: '<' attr(customns_name) attr(customns_atts) '>';}\n"+c+":after {color: blue; content: '</' attr(customns_name) '>';}\n"+c+"{overflow: auto;}\n";(function(a){l(a,"click",d);l(a,"keydown",b);l(a,"keypress",f);l(a,"drop",p);l(a,"dragend",p);l(a,"beforepaste",p);l(a,"paste",p)})(e);this.updateCSS=q;this.setXML=function(b){b=b.documentElement||b;u=b=e.ownerDocument.importNode(b,!0);for(a(b);e.lastChild;)e.removeChild(e.lastChild);e.appendChild(b);q();t=new core.PositionIterator(b)};
this.getXML=function(){return u}};
// Input 68
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
gui.UndoManager=function(){};gui.UndoManager.prototype.subscribe=function(e,k){};gui.UndoManager.prototype.unsubscribe=function(e,k){};gui.UndoManager.prototype.setOdtDocument=function(e){};gui.UndoManager.prototype.saveInitialState=function(){};gui.UndoManager.prototype.resetInitialState=function(){};gui.UndoManager.prototype.setPlaybackFunction=function(e){};gui.UndoManager.prototype.hasUndoStates=function(){};gui.UndoManager.prototype.hasRedoStates=function(){};
gui.UndoManager.prototype.moveForward=function(e){};gui.UndoManager.prototype.moveBackward=function(e){};gui.UndoManager.prototype.onOperationExecuted=function(e){};gui.UndoManager.signalUndoStackChanged="undoStackChanged";(function(){return gui.UndoManager})();
// Input 69
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
gui.UndoStateRules=function(){function e(e){switch(e.spec().optype){case "MoveCursor":case "AddCursor":case "RemoveCursor":return!1;default:return!0}}this.isEditOperation=e;this.isPartOfOperationSet=function(k,l){if(e(k)){if(0===l.length)return!0;var p;if(p=e(l[l.length-1]))a:{p=l.filter(e);var r=k.spec().optype,h;b:switch(r){case "RemoveText":case "InsertText":h=!0;break b;default:h=!1}if(h&&r===p[0].spec().optype){if(1===p.length){p=!0;break a}r=p[p.length-2].spec().position;p=p[p.length-1].spec().position;
h=k.spec().position;if(p===h-(p-r)){p=!0;break a}}p=!1}return p}return!0}};
// Input 70
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("gui.UndoManager");runtime.loadClass("gui.UndoStateRules");
gui.TrivialUndoManager=function(){function e(){n.emit(gui.UndoManager.signalUndoStackChanged,{undoAvailable:l.hasUndoStates(),redoAvailable:l.hasRedoStates()})}function k(){f!==r&&f!==d[d.length-1]&&d.push(f)}var l=this,p,r,h,b,f=[],d=[],a=[],n=new core.EventNotifier([gui.UndoManager.signalUndoStackChanged]),q=new gui.UndoStateRules;this.subscribe=function(a,b){n.subscribe(a,b)};this.unsubscribe=function(a,b){n.unsubscribe(a,b)};this.hasUndoStates=function(){return 0<d.length};this.hasRedoStates=
function(){return 0<a.length};this.setOdtDocument=function(a){b=a};this.resetInitialState=function(){d.length=0;a.length=0;r.length=0;f.length=0;p=null;e()};this.saveInitialState=function(){p=b.getOdfCanvas().odfContainer().rootElement.cloneNode(!0);r=[];k();d.forEach(function(a){r=r.concat(a)});f=r;d.length=0;a.length=0;e()};this.setPlaybackFunction=function(a){h=a};this.onOperationExecuted=function(b){a.length=0;q.isEditOperation(b)&&f===r||!q.isPartOfOperationSet(b,f)?(k(),f=[b],d.push(f),e()):
f.push(b)};this.moveForward=function(b){for(var c=0,k;b&&a.length;)k=a.pop(),d.push(k),k.forEach(h),b-=1,c+=1;c&&(f=d[d.length-1],e());return c};this.moveBackward=function(g){for(var c=b.getOdfCanvas(),k=c.odfContainer(),l=0;g&&d.length;)a.push(d.pop()),g-=1,l+=1;l&&(k.setRootElement(p.cloneNode(!0)),c.setOdfContainer(k,!0),b.getCursors().forEach(function(a){b.removeCursor(a.getMemberId())}),r.forEach(h),d.forEach(function(a){a.forEach(h)}),c.refreshCSS(),f=d[d.length-1]||r,e());return l}};
// Input 71
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("core.EventNotifier");runtime.loadClass("odf.OdfUtils");
ops.OdtDocument=function(e){function k(){var a=e.odfContainer().getContentElement(),b=a&&a.localName;runtime.assert("text"===b,"Unsupported content element type '"+b+"'for OdtDocument");return a}function l(a){var b=gui.SelectionMover.createPositionIterator(k());for(a+=1;0<a&&b.nextPosition();)1===d.acceptPosition(b)&&(a-=1);return b}function p(b){return a.getParagraphElement(b)}function r(a){return e.getFormatting().getStyleElement(a,"paragraph")}function h(a,b){runtime.assert(" "===a.data[b],"upgradeWhitespaceToElement: textNode.data[offset] should be a literal space");
var d=a.ownerDocument.createElementNS(f,"text:s");d.appendChild(a.ownerDocument.createTextNode(" "));a.deleteData(b,1);a.splitText(b);a.parentNode.insertBefore(d,a.nextSibling)}var b=this,f="urn:oasis:names:tc:opendocument:xmlns:text:1.0",d,a,n={},q=new core.EventNotifier([ops.OdtDocument.signalCursorAdded,ops.OdtDocument.signalCursorRemoved,ops.OdtDocument.signalCursorMoved,ops.OdtDocument.signalParagraphChanged,ops.OdtDocument.signalParagraphStyleModified,ops.OdtDocument.signalStyleCreated,ops.OdtDocument.signalStyleDeleted,
ops.OdtDocument.signalTableAdded,ops.OdtDocument.signalOperationExecuted,ops.OdtDocument.signalUndoStackChanged]);this.getIteratorAtPosition=l;this.getTextNeighborhood=function(a,b){var d=l(a),e=[],f=[],h,k=0,n=!1;h=!0;var q=0,p;runtime.assert(0<=b,"OdtDocument.getTextNeighborhood only supports positive lengths");do{f=d.textNeighborhood();n=!1;for(p=0;p<e.length;p+=1)if(e[p]===f[0]){n=!0;break}if(!n){n=0;if(h){h=d.container();for(n=0;n<f.length;n+=1)if(f[n]===h){q=n;break}n=q;h=!1}for(f.length&&(e=
e.concat(f));n<f.length;n+=1)k+=f[n].data.length}}while(!0===d.nextPosition()&&k<b);return e.slice(q)};this.upgradeWhitespaceToElement=h;this.upgradeWhitespacesAtPosition=function(b){b=l(b);var c=null,d,e=0;b.previousPosition();b.previousPosition();for(e=-2;2>=e;e+=1)c=b.container(),d=b.unfilteredDomOffset(),c.nodeType===Node.TEXT_NODE&&(" "===c.data[d]&&a.isSignificantWhitespace(c,d))&&h(c,d),b.nextPosition()};this.getParagraphStyleElement=r;this.getParagraphElement=p;this.getParagraphStyleAttributes=
function(a){return(a=r(a))?e.getFormatting().getInheritedStyleAttributes(a):null};this.getPositionInTextNode=function(a,b){var e=gui.SelectionMover.createPositionIterator(k()),f=null,h,m=0,l=null;runtime.assert(0<=a,"position must be >= 0");1===d.acceptPosition(e)?(h=e.container(),h.nodeType===Node.TEXT_NODE&&(f=h,m=0)):a+=1;for(;0<a||null===f;){if(!e.nextPosition())return null;if(1===d.acceptPosition(e))if(a-=1,h=e.container(),h.nodeType===Node.TEXT_NODE)h!==f?(f=h,m=e.domOffset()):m+=1;else if(null!==
f){if(0===a){m=f.length;break}f=null}else if(0===a){f=k().ownerDocument.createTextNode("");h.insertBefore(f,e.rightNode());m=0;break}}if(null===f)return null;if(b&&n[b]){for(l=n[b].getNode();0===m&&l.nextSibling&&"cursor"===l.nextSibling.localName;)l.parentNode.insertBefore(l,l.nextSibling.nextSibling);l&&0<f.length&&(f=k().ownerDocument.createTextNode(""),m=0,l.parentNode.insertBefore(f,l.nextSibling))}for(;0===m&&(f.previousSibling&&"cursor"===f.previousSibling.localName)&&(h=f.previousSibling,
0<f.length&&(f=k().ownerDocument.createTextNode("")),h.parentNode.insertBefore(f,h),l!==h););for(;f.previousSibling&&f.previousSibling.nodeType===Node.TEXT_NODE;)f.previousSibling.appendData(f.data),m=f.length+f.previousSibling.length,f=f.previousSibling,f.parentNode.removeChild(f.nextSibling);return{textNode:f,offset:m}};this.getNeighboringParagraph=function(a,b){var e=l(0),f=null;e.setUnfilteredPosition(a,0);do if(1===d.acceptPosition(e)&&(f=p(e.container()),f!==a))return f;while(!0===(0<b?e.nextPosition():
e.previousPosition()));if(f===a)return null};this.getWalkableParagraphLength=function(a){var b=l(0),e=0;b.setUnfilteredPosition(a,0);do{if(p(b.container())!==a)break;1===d.acceptPosition(b)&&(e+=1)}while(b.nextPosition());return e};this.getDistanceFromCursor=function(a,b,e){a=n[a];var f=0;runtime.assert(null!==b&&void 0!==b,"OdtDocument.getDistanceFromCursor called without node");a&&(a=a.getStepCounter().countStepsToPosition,f=a(b,e,d));return f};this.getCursorPosition=function(a){return-b.getDistanceFromCursor(a,
k(),0)};this.getCursorSelection=function(a){var b;a=n[a];var e=0;b=0;a&&(b=a.getStepCounter().countStepsToPosition,e=-b(k(),0,d),b=b(a.getAnchorNode(),0,d));return{position:e+b,length:-b}};this.getPositionFilter=function(){return d};this.getOdfCanvas=function(){return e};this.getRootNode=k;this.getDOM=function(){return k().ownerDocument};this.getCursor=function(a){return n[a]};this.getCursors=function(){var a=[],b;for(b in n)n.hasOwnProperty(b)&&a.push(n[b]);return a};this.addCursor=function(a){runtime.assert(Boolean(a),
"OdtDocument::addCursor without cursor");var b=a.getStepCounter().countForwardSteps(1,d),e=a.getMemberId();runtime.assert(Boolean(e),"OdtDocument::addCursor has cursor without memberid");a.move(b);n[e]=a};this.removeCursor=function(a){var c=n[a];return c?(c.removeFromOdtDocument(),delete n[a],b.emit(ops.OdtDocument.signalCursorRemoved,a),!0):!1};this.getMetaData=function(a){for(var b=e.odfContainer().rootElement.firstChild;b&&"meta"!==b.localName;)b=b.nextSibling;for(b=b&&b.firstChild;b&&b.localName!==
a;)b=b.nextSibling;for(b=b&&b.firstChild;b&&b.nodeType!==Node.TEXT_NODE;)b=b.nextSibling;return b?b.data:null};this.getFormatting=function(){return e.getFormatting()};this.emit=function(a,b){q.emit(a,b)};this.subscribe=function(a,b){q.subscribe(a,b)};this.unsubscribe=function(a,b){q.unsubscribe(a,b)};d=new function(){function b(e,f,g){var h,l;if(f&&(h=a.lookLeftForCharacter(f),1===h||2===h&&(a.scanRightForAnyCharacter(g)||a.scanRightForAnyCharacter(a.nextNode(e)))))return c;h=null===f&&a.isParagraph(e);
l=a.lookRightForCharacter(g);if(h)return l?c:a.scanRightForAnyCharacter(g)?d:c;if(!l)return d;f=f||a.previousNode(e);return a.scanLeftForAnyCharacter(f)?d:c}var c=core.PositionFilter.FilterResult.FILTER_ACCEPT,d=core.PositionFilter.FilterResult.FILTER_REJECT;this.acceptPosition=function(e){var f=e.container(),h=f.nodeType,l,k,n;if(h!==Node.ELEMENT_NODE&&h!==Node.TEXT_NODE)return d;if(h===Node.TEXT_NODE){if(!a.isGroupingElement(f.parentNode))return d;h=e.unfilteredDomOffset();l=f.data;runtime.assert(h!==
l.length,"Unexpected offset.");if(0<h){e=l.substr(h-1,1);if(!a.isODFWhitespace(e))return c;if(1<h)if(e=l.substr(h-2,1),!a.isODFWhitespace(e))k=c;else{if(!a.isODFWhitespace(l.substr(0,h)))return d}else n=a.previousNode(f),a.scanLeftForNonWhitespace(n)&&(k=c);if(k===c)return a.isTrailingWhitespace(f,h)?d:c;k=l.substr(h,1);return a.isODFWhitespace(k)?d:a.scanLeftForAnyCharacter(a.previousNode(f))?d:c}n=e.leftNode();k=f;f=f.parentNode;k=b(f,n,k)}else a.isGroupingElement(f)?(n=e.leftNode(),k=e.rightNode(),
k=b(f,n,k)):k=d;return k}};a=new odf.OdfUtils};ops.OdtDocument.signalCursorAdded="cursor/added";ops.OdtDocument.signalCursorRemoved="cursor/removed";ops.OdtDocument.signalCursorMoved="cursor/moved";ops.OdtDocument.signalParagraphChanged="paragraph/changed";ops.OdtDocument.signalTableAdded="table/added";ops.OdtDocument.signalStyleCreated="style/created";ops.OdtDocument.signalStyleDeleted="style/deleted";ops.OdtDocument.signalParagraphStyleModified="paragraphstyle/modified";
ops.OdtDocument.signalOperationExecuted="operation/executed";ops.OdtDocument.signalUndoStackChanged="undo/changed";(function(){return ops.OdtDocument})();
// Input 72
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 As additional permission under GNU AGPL version 3 section 7, you
 may distribute non-source (e.g., minimized or compacted) forms of
 that code without the copy of the GNU GPL normally required by
 section 4, provided you include this license notice and a URL
 through which recipients can access the Corresponding Source.

 As a special exception to the AGPL, any HTML file which merely makes function
 calls to this code, and for that purpose includes it by reference shall be
 deemed a separate work for copyright law purposes. In addition, the copyright
 holders of this code give you permission to combine this code with free
 software libraries that are released under the GNU LGPL. You may copy and
 distribute such a system following the terms of the GNU AGPL for this code
 and the LGPL for the libraries. If you modify this code, you may extend this
 exception to your version of the code, but you are not obligated to do so.
 If you do not wish to do so, delete this exception statement from your
 version.

 This license applies to this entire compilation.
 @licend
 @source: http://www.webodf.org/
 @source: http://gitorious.org/webodf/webodf/
*/
runtime.loadClass("ops.TrivialUserModel");runtime.loadClass("ops.TrivialOperationRouter");runtime.loadClass("ops.OperationFactory");runtime.loadClass("ops.OdtDocument");
ops.Session=function(e){var k=new ops.OdtDocument(e),l=new ops.TrivialUserModel,p=null;this.setUserModel=function(e){l=e};this.setOperationRouter=function(e){p=e;e.setPlaybackFunction(function(e){e.execute(k);k.emit(ops.OdtDocument.signalOperationExecuted,e)});e.setOperationFactory(new ops.OperationFactory)};this.getUserModel=function(){return l};this.getOdtDocument=function(){return k};this.enqueue=function(e){p.push(e)};this.setOperationRouter(new ops.TrivialOperationRouter)};
// Input 73
var webodf_css="@namespace draw url(urn:oasis:names:tc:opendocument:xmlns:drawing:1.0);\n@namespace fo url(urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0);\n@namespace office url(urn:oasis:names:tc:opendocument:xmlns:office:1.0);\n@namespace presentation url(urn:oasis:names:tc:opendocument:xmlns:presentation:1.0);\n@namespace style url(urn:oasis:names:tc:opendocument:xmlns:style:1.0);\n@namespace svg url(urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0);\n@namespace table url(urn:oasis:names:tc:opendocument:xmlns:table:1.0);\n@namespace text url(urn:oasis:names:tc:opendocument:xmlns:text:1.0);\n@namespace runtimens url(urn:webodf); /* namespace for runtime only */\n@namespace cursor url(urn:webodf:names:cursor);\n@namespace editinfo url(urn:webodf:names:editinfo);\n\noffice|document > *, office|document-content > * {\n  display: none;\n}\noffice|body, office|document {\n  display: inline-block;\n  position: relative;\n}\n\ntext|p, text|h {\n  display: block;\n  padding: 0;\n  margin: 0;\n  line-height: normal;\n  position: relative;\n  min-height: 1.3em; /* prevent empty paragraphs and headings from collapsing if they are empty */\n}\n*[runtimens|containsparagraphanchor] {\n  position: relative;\n}\ntext|s {\n    white-space: pre;\n}\ntext|tab {\n  display: inline;\n  white-space: pre;\n}\ntext|line-break {\n  content: \" \";\n  display: block;\n}\ntext|tracked-changes {\n  /*Consumers that do not support change tracking, should ignore changes.*/\n  display: none;\n}\noffice|binary-data {\n  display: none;\n}\noffice|text {\n  display: block;\n  text-align: left;\n  overflow: visible;\n  word-wrap: break-word;\n}\n\noffice|text::selection {\n    /** Let's not draw selection highlight that overflows into the office|text\n     * node when selecting content across several paragraphs\n     */\n    background: transparent;\n}\n\noffice|spreadsheet {\n  display: block;\n  border-collapse: collapse;\n  empty-cells: show;\n  font-family: sans-serif;\n  font-size: 10pt;\n  text-align: left;\n  page-break-inside: avoid;\n  overflow: hidden;\n}\noffice|presentation {\n  display: inline-block;\n  text-align: left;\n}\n#shadowContent {\n  display: inline-block;\n  text-align: left;\n}\ndraw|page {\n  display: block;\n  position: relative;\n  overflow: hidden;\n}\npresentation|notes, presentation|footer-decl, presentation|date-time-decl {\n    display: none;\n}\n@media print {\n  draw|page {\n    border: 1pt solid black;\n    page-break-inside: avoid;\n  }\n  presentation|notes {\n    /*TODO*/\n  }\n}\noffice|spreadsheet text|p {\n  border: 0px;\n  padding: 1px;\n  margin: 0px;\n}\noffice|spreadsheet table|table {\n  margin: 3px;\n}\noffice|spreadsheet table|table:after {\n  /* show sheet name the end of the sheet */\n  /*content: attr(table|name);*/ /* gives parsing error in opera */\n}\noffice|spreadsheet table|table-row {\n  counter-increment: row;\n}\noffice|spreadsheet table|table-row:before {\n  width: 3em;\n  background: #cccccc;\n  border: 1px solid black;\n  text-align: center;\n  content: counter(row);\n  display: table-cell;\n}\noffice|spreadsheet table|table-cell {\n  border: 1px solid #cccccc;\n}\ntable|table {\n  display: table;\n}\ndraw|frame table|table {\n  width: 100%;\n  height: 100%;\n  background: white;\n}\ntable|table-header-rows {\n  display: table-header-group;\n}\ntable|table-row {\n  display: table-row;\n}\ntable|table-column {\n  display: table-column;\n}\ntable|table-cell {\n  width: 0.889in;\n  display: table-cell;\n  word-break: break-all; /* prevent long words from extending out the table cell */\n}\ndraw|frame {\n  display: block;\n}\ndraw|image {\n  display: block;\n  width: 100%;\n  height: 100%;\n  top: 0px;\n  left: 0px;\n  background-repeat: no-repeat;\n  background-size: 100% 100%;\n  -moz-background-size: 100% 100%;\n}\n/* only show the first image in frame */\ndraw|frame > draw|image:nth-of-type(n+2) {\n  display: none;\n}\ntext|list:before {\n    display: none;\n    content:\"\";\n}\ntext|list {\n    counter-reset: list;\n}\ntext|list-item {\n    display: block;\n}\ntext|number {\n    display:none;\n}\n\ntext|a {\n    color: blue;\n    text-decoration: underline;\n    cursor: pointer;\n}\ntext|note-citation {\n    vertical-align: super;\n    font-size: smaller;\n}\ntext|note-body {\n    display: none;\n}\ntext|note:hover text|note-citation {\n    background: #dddddd;\n}\ntext|note:hover text|note-body {\n    display: block;\n    left:1em;\n    max-width: 80%;\n    position: absolute;\n    background: #ffffaa;\n}\nsvg|title, svg|desc {\n    display: none;\n}\nvideo {\n    width: 100%;\n    height: 100%\n}\n\n/* below set up the cursor */\ncursor|cursor {\n    display: inline;\n    width: 0px;\n    height: 1em;\n    /* making the position relative enables the avatar to use\n       the cursor as reference for its absolute position */\n    position: relative;\n}\ncursor|cursor > span {\n    display: inline;\n    position: absolute;\n    height: 1em;\n    border-left: 2px solid black;\n    outline: none;\n}\n\ncursor|cursor > div {\n    padding: 3px;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n    border: none !important;\n    border-radius: 5px;\n    opacity: 0.3;\n}\n\ncursor|cursor > div > img {\n    border-radius: 5px;\n}\n\ncursor|cursor > div.active {\n    opacity: 0.8;\n}\n\ncursor|cursor > div:after {\n    content: ' ';\n    position: absolute;\n    width: 0px;\n    height: 0px;\n    border-style: solid;\n    border-width: 8.7px 5px 0 5px;\n    border-color: black transparent transparent transparent;\n\n    top: 100%;\n    left: 43%;\n}\n\n\n.editInfoMarker {\n    position: absolute;\n    width: 10px;\n    height: 100%;\n    left: -20px;\n    opacity: 0.8;\n    top: 0;\n    border-radius: 5px;\n    background-color: transparent;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n}\n.editInfoMarker:hover {\n    box-shadow: 0px 0px 8px rgba(0, 0, 0, 1);\n}\n\n.editInfoHandle {\n    position: absolute;\n    background-color: black;\n    padding: 5px;\n    border-radius: 5px;\n    opacity: 0.8;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n    bottom: 100%;\n    margin-bottom: 10px;\n    z-index: 3;\n    left: -25px;\n}\n.editInfoHandle:after {\n    content: ' ';\n    position: absolute;\n    width: 0px;\n    height: 0px;\n    border-style: solid;\n    border-width: 8.7px 5px 0 5px;\n    border-color: black transparent transparent transparent;\n\n    top: 100%;\n    left: 5px;\n}\n.editInfo {\n    font-family: sans-serif;\n    font-weight: normal;\n    font-style: normal;\n    text-decoration: none;\n    color: white;\n    width: 100%;\n    height: 12pt;\n}\n.editInfoColor {\n    float: left;\n    width: 10pt;\n    height: 10pt;\n    border: 1px solid white;\n}\n.editInfoAuthor {\n    float: left;\n    margin-left: 5pt;\n    font-size: 10pt;\n    text-align: left;\n    height: 12pt;\n    line-height: 12pt;\n}\n.editInfoTime {\n    float: right;\n    margin-left: 30pt;\n    font-size: 8pt;\n    font-style: italic;\n    color: yellow;\n    height: 12pt;\n    line-height: 12pt;\n}\n";
