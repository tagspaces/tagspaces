// Input 0
var webodf_version="0.4.2-2257-g58f0c0b";
// Input 1
function Runtime(){}Runtime.prototype.getVariable=function(g){};Runtime.prototype.toJson=function(g){};Runtime.prototype.fromJson=function(g){};Runtime.prototype.byteArrayFromString=function(g,k){};Runtime.prototype.byteArrayToString=function(g,k){};Runtime.prototype.read=function(g,k,b,c){};Runtime.prototype.readFile=function(g,k,b){};Runtime.prototype.readFileSync=function(g,k){};Runtime.prototype.loadXML=function(g,k){};Runtime.prototype.writeFile=function(g,k,b){};
Runtime.prototype.isFile=function(g,k){};Runtime.prototype.getFileSize=function(g,k){};Runtime.prototype.deleteFile=function(g,k){};Runtime.prototype.log=function(g,k){};Runtime.prototype.setTimeout=function(g,k){};Runtime.prototype.clearTimeout=function(g){};Runtime.prototype.libraryPaths=function(){};Runtime.prototype.currentDirectory=function(){};Runtime.prototype.setCurrentDirectory=function(g){};Runtime.prototype.type=function(){};Runtime.prototype.getDOMImplementation=function(){};
Runtime.prototype.parseXML=function(g){};Runtime.prototype.exit=function(g){};Runtime.prototype.getWindow=function(){};Runtime.prototype.requestAnimationFrame=function(g){};Runtime.prototype.cancelAnimationFrame=function(g){};Runtime.prototype.assert=function(g,k,b){};var IS_COMPILED_CODE=!0;
Runtime.byteArrayToString=function(g,k){function b(b){var e="",c,h=b.length;for(c=0;c<h;c+=1)e+=String.fromCharCode(b[c]&255);return e}function c(b){var e="",c,h=b.length,m=[],p,a,d,l;for(c=0;c<h;c+=1)p=b[c],128>p?m.push(p):(c+=1,a=b[c],194<=p&&224>p?m.push((p&31)<<6|a&63):(c+=1,d=b[c],224<=p&&240>p?m.push((p&15)<<12|(a&63)<<6|d&63):(c+=1,l=b[c],240<=p&&245>p&&(p=(p&7)<<18|(a&63)<<12|(d&63)<<6|l&63,p-=65536,m.push((p>>10)+55296,(p&1023)+56320))))),1E3<=m.length&&(e+=String.fromCharCode.apply(null,
m),m.length=0);return e+String.fromCharCode.apply(null,m)}var h;"utf8"===k?h=c(g):("binary"!==k&&this.log("Unsupported encoding: "+k),h=b(g));return h};Runtime.getVariable=function(g){try{return eval(g)}catch(k){}};Runtime.toJson=function(g){return JSON.stringify(g)};Runtime.fromJson=function(g){return JSON.parse(g)};Runtime.getFunctionName=function(g){return void 0===g.name?(g=/function\s+(\w+)/.exec(g))&&g[1]:g.name};
function BrowserRuntime(g){function k(p){var a=p.length,d,l,f=0;for(d=0;d<a;d+=1)l=p.charCodeAt(d),f+=1+(128<l)+(2048<l),55040<l&&57344>l&&(f+=1,d+=1);return f}function b(p,a,d){var l=p.length,f,b;a=new Uint8Array(new ArrayBuffer(a));d?(a[0]=239,a[1]=187,a[2]=191,b=3):b=0;for(d=0;d<l;d+=1)f=p.charCodeAt(d),128>f?(a[b]=f,b+=1):2048>f?(a[b]=192|f>>>6,a[b+1]=128|f&63,b+=2):55040>=f||57344<=f?(a[b]=224|f>>>12&15,a[b+1]=128|f>>>6&63,a[b+2]=128|f&63,b+=3):(d+=1,f=(f-55296<<10|p.charCodeAt(d)-56320)+65536,
a[b]=240|f>>>18&7,a[b+1]=128|f>>>12&63,a[b+2]=128|f>>>6&63,a[b+3]=128|f&63,b+=4);return a}function c(b){var a=b.length,d=new Uint8Array(new ArrayBuffer(a)),l;for(l=0;l<a;l+=1)d[l]=b.charCodeAt(l)&255;return d}function h(b,a){var d,l,f;void 0!==a?f=b:a=b;g?(l=g.ownerDocument,f&&(d=l.createElement("span"),d.className=f,d.appendChild(l.createTextNode(f)),g.appendChild(d),g.appendChild(l.createTextNode(" "))),d=l.createElement("span"),0<a.length&&"<"===a[0]?d.innerHTML=a:d.appendChild(l.createTextNode(a)),
g.appendChild(d),g.appendChild(l.createElement("br"))):console&&console.log(a);"alert"===f&&alert(a)}function n(p,a,d){if(0!==d.status||d.responseText)if(200===d.status||0===d.status){if(d.response&&"string"!==typeof d.response)"binary"===a?(d=d.response,d=new Uint8Array(d)):d=String(d.response);else if("binary"===a)if(null!==d.responseBody&&"undefined"!==String(typeof VBArray)){d=(new VBArray(d.responseBody)).toArray();var l=d.length,f=new Uint8Array(new ArrayBuffer(l));for(a=0;a<l;a+=1)f[a]=d[a];
d=f}else{(a=d.getResponseHeader("Content-Length"))&&(a=parseInt(a,10));if(a&&a!==d.responseText.length)a:{var l=d.responseText,f=!1,e=k(l);if("number"===typeof a){if(a!==e&&a!==e+3){l=void 0;break a}f=e+3===a;e=a}l=b(l,e,f)}void 0===l&&(l=c(d.responseText));d=l}else d=d.responseText;m[p]=d;p={err:null,data:d}}else p={err:d.responseText||d.statusText,data:null};else p={err:"File "+p+" is empty.",data:null};return p}function e(b,a,d){var l=new XMLHttpRequest;l.open("GET",b,d);l.overrideMimeType&&("binary"!==
a?l.overrideMimeType("text/plain; charset="+a):l.overrideMimeType("text/plain; charset=x-user-defined"));return l}function r(b,a,d){function l(){var l;4===f.readyState&&(l=n(b,a,f),d(l.err,l.data))}if(m.hasOwnProperty(b))d(null,m[b]);else{var f=e(b,a,!0);f.onreadystatechange=l;try{f.send(null)}catch(c){d(c.message,null)}}}var q=this,m={};this.byteArrayFromString=function(p,a){var d;"utf8"===a?d=b(p,k(p),!1):("binary"!==a&&q.log("unknown encoding: "+a),d=c(p));return d};this.byteArrayToString=Runtime.byteArrayToString;
this.getVariable=Runtime.getVariable;this.fromJson=Runtime.fromJson;this.toJson=Runtime.toJson;this.readFile=r;this.read=function(b,a,d,l){r(b,"binary",function(f,b){var p=null;if(b){if("string"===typeof b)throw"This should not happen.";p=b.subarray(a,a+d)}l(f,p)})};this.readFileSync=function(b,a){var d=e(b,a,!1),l;try{d.send(null);l=n(b,a,d);if(l.err)throw l.err;if(null===l.data)throw"No data read from "+b+".";}catch(f){throw f;}return l.data};this.writeFile=function(b,a,d){m[b]=a;var l=new XMLHttpRequest,
f;l.open("PUT",b,!0);l.onreadystatechange=function(){4===l.readyState&&(0!==l.status||l.responseText?200<=l.status&&300>l.status||0===l.status?d(null):d("Status "+String(l.status)+": "+l.responseText||l.statusText):d("File "+b+" is empty."))};f=a.buffer&&!l.sendAsBinary?a.buffer:q.byteArrayToString(a,"binary");try{l.sendAsBinary?l.sendAsBinary(f):l.send(f)}catch(e){q.log("HUH? "+e+" "+a),d(e.message)}};this.deleteFile=function(b,a){delete m[b];var d=new XMLHttpRequest;d.open("DELETE",b,!0);d.onreadystatechange=
function(){4===d.readyState&&(200>d.status&&300<=d.status?a(d.responseText):a(null))};d.send(null)};this.loadXML=function(b,a){var d=new XMLHttpRequest;d.open("GET",b,!0);d.overrideMimeType&&d.overrideMimeType("text/xml");d.onreadystatechange=function(){4===d.readyState&&(0!==d.status||d.responseText?200===d.status||0===d.status?a(null,d.responseXML):a(d.responseText,null):a("File "+b+" is empty.",null))};try{d.send(null)}catch(l){a(l.message,null)}};this.isFile=function(b,a){q.getFileSize(b,function(d){a(-1!==
d)})};this.getFileSize=function(b,a){if(m.hasOwnProperty(b)&&"string"!==typeof m[b])a(m[b].length);else{var d=new XMLHttpRequest;d.open("HEAD",b,!0);d.onreadystatechange=function(){if(4===d.readyState){var l=d.getResponseHeader("Content-Length");l?a(parseInt(l,10)):r(b,"binary",function(d,l){d?a(-1):a(l.length)})}};d.send(null)}};this.log=h;this.assert=function(b,a,d){if(!b)throw h("alert","ASSERTION FAILED:\n"+a),d&&d(),a;};this.setTimeout=function(b,a){return setTimeout(function(){b()},a)};this.clearTimeout=
function(b){clearTimeout(b)};this.libraryPaths=function(){return["lib"]};this.setCurrentDirectory=function(){};this.currentDirectory=function(){return""};this.type=function(){return"BrowserRuntime"};this.getDOMImplementation=function(){return window.document.implementation};this.parseXML=function(b){return(new DOMParser).parseFromString(b,"text/xml")};this.exit=function(b){h("Calling exit with code "+String(b)+", but exit() is not implemented.")};this.getWindow=function(){return window};this.requestAnimationFrame=
function(b){var a=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame,d=0;if(a)a.bind(window),d=a(b);else return setTimeout(b,15);return d};this.cancelAnimationFrame=function(b){var a=window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||window.msCancelAnimationFrame;a?(a.bind(window),a(b)):clearTimeout(b)}}
function NodeJSRuntime(){function g(b){var e=b.length,c,a=new Uint8Array(new ArrayBuffer(e));for(c=0;c<e;c+=1)a[c]=b[c];return a}function k(b,e,p){function a(a,l){if(a)return p(a,null);if(!l)return p("No data for "+b+".",null);if("string"===typeof l)return p(a,l);p(a,g(l))}b=h.resolve(n,b);"binary"!==e?c.readFile(b,e,a):c.readFile(b,null,a)}var b=this,c=require("fs"),h=require("path"),n="",e,r;this.byteArrayFromString=function(b,e){var c=new Buffer(b,e),a,d=c.length,l=new Uint8Array(new ArrayBuffer(d));
for(a=0;a<d;a+=1)l[a]=c[a];return l};this.byteArrayToString=Runtime.byteArrayToString;this.getVariable=Runtime.getVariable;this.fromJson=Runtime.fromJson;this.toJson=Runtime.toJson;this.readFile=k;this.loadXML=function(e,c){k(e,"utf-8",function(p,a){if(p)return c(p,null);if(!a)return c("No data for "+e+".",null);c(null,b.parseXML(a))})};this.writeFile=function(b,e,p){e=new Buffer(e);b=h.resolve(n,b);c.writeFile(b,e,"binary",function(a){p(a||null)})};this.deleteFile=function(b,e){b=h.resolve(n,b);
c.unlink(b,e)};this.read=function(b,e,p,a){b=h.resolve(n,b);c.open(b,"r+",666,function(d,l){if(d)a(d,null);else{var f=new Buffer(p);c.read(l,f,0,p,e,function(d){c.close(l);a(d,g(f))})}})};this.readFileSync=function(b,e){var p;p=c.readFileSync(b,"binary"===e?null:e);if(null===p)throw"File "+b+" could not be read.";"binary"===e&&(p=g(p));return p};this.isFile=function(b,e){b=h.resolve(n,b);c.stat(b,function(b,a){e(!b&&a.isFile())})};this.getFileSize=function(b,e){b=h.resolve(n,b);c.stat(b,function(b,
a){b?e(-1):e(a.size)})};this.log=function(b,e){var c;void 0!==e?c=b:e=b;"alert"===c&&process.stderr.write("\n!!!!! ALERT !!!!!\n");process.stderr.write(e+"\n");"alert"===c&&process.stderr.write("!!!!! ALERT !!!!!\n")};this.assert=function(b,e,c){b||(process.stderr.write("ASSERTION FAILED: "+e),c&&c())};this.setTimeout=function(b,e){return setTimeout(function(){b()},e)};this.clearTimeout=function(b){clearTimeout(b)};this.libraryPaths=function(){return[__dirname]};this.setCurrentDirectory=function(b){n=
b};this.currentDirectory=function(){return n};this.type=function(){return"NodeJSRuntime"};this.getDOMImplementation=function(){return r};this.parseXML=function(b){return e.parseFromString(b,"text/xml")};this.exit=process.exit;this.getWindow=function(){return null};this.requestAnimationFrame=function(b){return setTimeout(b,15)};this.cancelAnimationFrame=function(b){clearTimeout(b)};e=new (require("xmldom").DOMParser);r=b.parseXML("<a/>").implementation}
function RhinoRuntime(){function g(b,e){var c;void 0!==e?c=b:e=b;"alert"===c&&print("\n!!!!! ALERT !!!!!");print(e);"alert"===c&&print("!!!!! ALERT !!!!!")}var k=this,b={},c=b.javax.xml.parsers.DocumentBuilderFactory.newInstance(),h,n,e="";c.setValidating(!1);c.setNamespaceAware(!0);c.setExpandEntityReferences(!1);c.setSchema(null);n=b.org.xml.sax.EntityResolver({resolveEntity:function(e,c){var h=new b.java.io.FileReader(c);return new b.org.xml.sax.InputSource(h)}});h=c.newDocumentBuilder();h.setEntityResolver(n);
this.byteArrayFromString=function(b,e){var c,h=b.length,a=new Uint8Array(new ArrayBuffer(h));for(c=0;c<h;c+=1)a[c]=b.charCodeAt(c)&255;return a};this.byteArrayToString=Runtime.byteArrayToString;this.getVariable=Runtime.getVariable;this.fromJson=Runtime.fromJson;this.toJson=Runtime.toJson;this.loadXML=function(e,c){var k=new b.java.io.File(e),p=null;try{p=h.parse(k)}catch(a){return print(a),c(a,null)}c(null,p)};this.readFile=function(c,h,g){e&&(c=e+"/"+c);var p=new b.java.io.File(c),a="binary"===h?
"latin1":h;p.isFile()?((c=readFile(c,a))&&"binary"===h&&(c=k.byteArrayFromString(c,"binary")),g(null,c)):g(c+" is not a file.",null)};this.writeFile=function(c,h,k){e&&(c=e+"/"+c);c=new b.java.io.FileOutputStream(c);var p,a=h.length;for(p=0;p<a;p+=1)c.write(h[p]);c.close();k(null)};this.deleteFile=function(c,h){e&&(c=e+"/"+c);var k=new b.java.io.File(c),p=c+Math.random(),p=new b.java.io.File(p);k.rename(p)?(p.deleteOnExit(),h(null)):h("Could not delete "+c)};this.read=function(c,h,k,p){e&&(c=e+"/"+
c);var a;a=c;var d="binary";(new b.java.io.File(a)).isFile()?("binary"===d&&(d="latin1"),a=readFile(a,d)):a=null;a?p(null,this.byteArrayFromString(a.substring(h,h+k),"binary")):p("Cannot read "+c,null)};this.readFileSync=function(b,c){if(!c)return"";var e=readFile(b,c);if(null===e)throw"File could not be read.";return e};this.isFile=function(c,h){e&&(c=e+"/"+c);var k=new b.java.io.File(c);h(k.isFile())};this.getFileSize=function(c,h){e&&(c=e+"/"+c);var k=new b.java.io.File(c);h(k.length())};this.log=
g;this.assert=function(b,c,e){b||(g("alert","ASSERTION FAILED: "+c),e&&e())};this.setTimeout=function(b){b();return 0};this.clearTimeout=function(){};this.libraryPaths=function(){return["lib"]};this.setCurrentDirectory=function(b){e=b};this.currentDirectory=function(){return e};this.type=function(){return"RhinoRuntime"};this.getDOMImplementation=function(){return h.getDOMImplementation()};this.parseXML=function(c){c=new b.java.io.StringReader(c);c=new b.org.xml.sax.InputSource(c);return h.parse(c)};
this.exit=quit;this.getWindow=function(){return null};this.requestAnimationFrame=function(b){b();return 0};this.cancelAnimationFrame=function(){}}Runtime.create=function(){return"undefined"!==String(typeof window)?new BrowserRuntime(window.document.getElementById("logoutput")):"undefined"!==String(typeof require)?new NodeJSRuntime:new RhinoRuntime};var runtime=Runtime.create(),core={},gui={},xmldom={},odf={},ops={},webodf={};
(function(){webodf.Version="undefined"!==String(typeof webodf_version)?webodf_version:"From Source"})();
(function(){function g(b,c,e){var h=b+"/manifest.json",a,d;runtime.log("Loading manifest: "+h);try{a=runtime.readFileSync(h,"utf-8")}catch(l){if(e)runtime.log("No loadable manifest found.");else throw console.log(String(l)),l;return}e=JSON.parse(a);for(d in e)e.hasOwnProperty(d)&&(c[d]={dir:b,deps:e[d]})}function k(b,c,e){function h(f){if(!l[f]&&!e(f)){if(d[f])throw"Circular dependency detected for "+f+".";d[f]=!0;if(!c[f])throw"Missing dependency information for class "+f+".";var b=c[f],k=b.deps,
g,n=k.length;for(g=0;g<n;g+=1)h(k[g]);d[f]=!1;l[f]=!0;a.push(b.dir+"/"+f.replace(".","/")+".js")}}var a=[],d={},l={};b.forEach(h);return a}function b(b,c){return c=c+("\n//# sourceURL="+b)+("\n//@ sourceURL="+b)}function c(c){var e,h;for(e=0;e<c.length;e+=1)h=runtime.readFileSync(c[e],"utf-8"),h=b(c[e],h),eval(h)}function h(b){b=b.split(".");var c,h=e,k=b.length;for(c=0;c<k;c+=1){if(!h.hasOwnProperty(b[c]))return!1;h=h[b[c]]}return!0}var n,e={core:core,gui:gui,xmldom:xmldom,odf:odf,ops:ops};runtime.loadClasses=
function(b,e){if(IS_COMPILED_CODE||0===b.length)return e&&e();var m;if(!(m=n)){m=[];var p=runtime.libraryPaths(),a;runtime.currentDirectory()&&-1===p.indexOf(runtime.currentDirectory())&&g(runtime.currentDirectory(),m,!0);for(a=0;a<p.length;a+=1)g(p[a],m)}n=m;b=k(b,n,h);if(0===b.length)return e&&e();if("BrowserRuntime"===runtime.type()&&e){m=b;p=document.currentScript||document.documentElement.lastChild;a=document.createDocumentFragment();var d,l;for(l=0;l<m.length;l+=1)d=document.createElement("script"),
d.type="text/javascript",d.charset="utf-8",d.async=!1,d.setAttribute("src",m[l]),a.appendChild(d);e&&(d.onload=e);p.parentNode.insertBefore(a,p)}else c(b),e&&e()};runtime.loadClass=function(b,c){runtime.loadClasses([b],c)}})();(function(){var g=function(k){return k};runtime.getTranslator=function(){return g};runtime.setTranslator=function(k){g=k};runtime.tr=function(k){var b=g(k);return b&&"string"===String(typeof b)?b:k}})();
(function(g){function k(b){if(b.length){var c=b[0];runtime.readFile(c,"utf8",function(h,k){function e(){var b;(b=eval(q))&&runtime.exit(b)}var g="",g=c.lastIndexOf("/"),q=k,g=-1!==g?c.substring(0,g):".";runtime.setCurrentDirectory(g);h?(runtime.log(h),runtime.exit(1)):null===q?(runtime.log("No code found for "+c),runtime.exit(1)):e.apply(null,b)})}}g=g?Array.prototype.slice.call(g):[];"NodeJSRuntime"===runtime.type()?k(process.argv.slice(2)):"RhinoRuntime"===runtime.type()?k(g):k(g.slice(1))})("undefined"!==
String(typeof arguments)&&arguments);
// Input 2
(function(){core.Async=function(){return{forEach:function(g,k,b){function c(c){e!==n&&(c?(e=n,b(c)):(e+=1,e===n&&b(null)))}var h,n=g.length,e=0;for(h=0;h<n;h+=1)k(g[h],c)},destroyAll:function(g,k){function b(c,h){if(h)k(h);else if(c<g.length)g[c](function(h){b(c+1,h)});else k()}b(0,void 0)}}}()})();
// Input 3
function makeBase64(){function g(a){var d,f=a.length,b=new Uint8Array(new ArrayBuffer(f));for(d=0;d<f;d+=1)b[d]=a.charCodeAt(d)&255;return b}function k(a){var d,f="",b,l=a.length-2;for(b=0;b<l;b+=3)d=a[b]<<16|a[b+1]<<8|a[b+2],f+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d>>>18],f+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d>>>12&63],f+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d>>>6&63],f+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d&
63];b===l+1?(d=a[b]<<4,f+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d>>>6],f+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d&63],f+="=="):b===l&&(d=a[b]<<10|a[b+1]<<2,f+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d>>>12],f+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d>>>6&63],f+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[d&63],f+="=");return f}function b(a){a=a.replace(/[^A-Za-z0-9+\/]+/g,
"");var d=a.length,b=new Uint8Array(new ArrayBuffer(3*d)),l=a.length%4,c=0,e,h;for(e=0;e<d;e+=4)h=(f[a.charAt(e)]||0)<<18|(f[a.charAt(e+1)]||0)<<12|(f[a.charAt(e+2)]||0)<<6|(f[a.charAt(e+3)]||0),b[c]=h>>16,b[c+1]=h>>8&255,b[c+2]=h&255,c+=3;d=3*d-[0,0,2,1][l];return b.subarray(0,d)}function c(a){var d,f,b=a.length,l=0,c=new Uint8Array(new ArrayBuffer(3*b));for(d=0;d<b;d+=1)f=a[d],128>f?c[l++]=f:(2048>f?c[l++]=192|f>>>6:(c[l++]=224|f>>>12&15,c[l++]=128|f>>>6&63),c[l++]=128|f&63);return c.subarray(0,
l)}function h(a){var d,f,b,l,c=a.length,e=new Uint8Array(new ArrayBuffer(c)),h=0;for(d=0;d<c;d+=1)f=a[d],128>f?e[h++]=f:(d+=1,b=a[d],224>f?e[h++]=(f&31)<<6|b&63:(d+=1,l=a[d],e[h++]=(f&15)<<12|(b&63)<<6|l&63));return e.subarray(0,h)}function n(a){return k(g(a))}function e(a){return String.fromCharCode.apply(String,b(a))}function r(a){return h(g(a))}function q(a){a=h(a);for(var d="",f=0;f<a.length;)d+=String.fromCharCode.apply(String,a.subarray(f,f+45E3)),f+=45E3;return d}function m(a,d,f){var b,l,
c,e="";for(c=d;c<f;c+=1)d=a.charCodeAt(c)&255,128>d?e+=String.fromCharCode(d):(c+=1,b=a.charCodeAt(c)&255,224>d?e+=String.fromCharCode((d&31)<<6|b&63):(c+=1,l=a.charCodeAt(c)&255,e+=String.fromCharCode((d&15)<<12|(b&63)<<6|l&63)));return e}function p(a,d){function f(){var c=l+1E5;c>a.length&&(c=a.length);b+=m(a,l,c);l=c;c=l===a.length;d(b,c)&&!c&&runtime.setTimeout(f,0)}var b="",l=0;1E5>a.length?d(m(a,0,a.length),!0):("string"!==typeof a&&(a=a.slice()),f())}function a(a){return c(g(a))}function d(a){return String.fromCharCode.apply(String,
c(a))}function l(a){return String.fromCharCode.apply(String,c(g(a)))}var f=function(a){var d={},f,b;f=0;for(b=a.length;f<b;f+=1)d[a.charAt(f)]=f;return d}("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"),s,v,u=runtime.getWindow(),y,w;u&&u.btoa?(y=u.btoa,s=function(a){return y(l(a))}):(y=n,s=function(d){return k(a(d))});u&&u.atob?(w=u.atob,v=function(a){a=w(a);return m(a,0,a.length)}):(w=e,v=function(a){return q(b(a))});core.Base64=function(){this.convertByteArrayToBase64=this.convertUTF8ArrayToBase64=
k;this.convertBase64ToByteArray=this.convertBase64ToUTF8Array=b;this.convertUTF16ArrayToByteArray=this.convertUTF16ArrayToUTF8Array=c;this.convertByteArrayToUTF16Array=this.convertUTF8ArrayToUTF16Array=h;this.convertUTF8StringToBase64=n;this.convertBase64ToUTF8String=e;this.convertUTF8StringToUTF16Array=r;this.convertByteArrayToUTF16String=this.convertUTF8ArrayToUTF16String=q;this.convertUTF8StringToUTF16String=p;this.convertUTF16StringToByteArray=this.convertUTF16StringToUTF8Array=a;this.convertUTF16ArrayToUTF8String=
d;this.convertUTF16StringToUTF8String=l;this.convertUTF16StringToBase64=s;this.convertBase64ToUTF16String=v;this.fromBase64=e;this.toBase64=n;this.atob=w;this.btoa=y;this.utob=l;this.btou=p;this.encode=s;this.encodeURI=function(a){return s(a).replace(/[+\/]/g,function(a){return"+"===a?"-":"_"}).replace(/\\=+$/,"")};this.decode=function(a){return v(a.replace(/[\-_]/g,function(a){return"-"===a?"+":"/"}))};return this};return core.Base64}core.Base64=makeBase64();
// Input 4
core.ByteArray=function(g){this.pos=0;this.data=g;this.readUInt32LE=function(){this.pos+=4;var k=this.data,b=this.pos;return k[--b]<<24|k[--b]<<16|k[--b]<<8|k[--b]};this.readUInt16LE=function(){this.pos+=2;var k=this.data,b=this.pos;return k[--b]<<8|k[--b]}};
// Input 5
core.ByteArrayWriter=function(g){function k(b){b>h-c&&(h=Math.max(2*h,c+b),b=new Uint8Array(new ArrayBuffer(h)),b.set(n),n=b)}var b=this,c=0,h=1024,n=new Uint8Array(new ArrayBuffer(h));this.appendByteArrayWriter=function(c){b.appendByteArray(c.getByteArray())};this.appendByteArray=function(b){var h=b.length;k(h);n.set(b,c);c+=h};this.appendArray=function(b){var h=b.length;k(h);n.set(b,c);c+=h};this.appendUInt16LE=function(c){b.appendArray([c&255,c>>8&255])};this.appendUInt32LE=function(c){b.appendArray([c&
255,c>>8&255,c>>16&255,c>>24&255])};this.appendString=function(c){b.appendByteArray(runtime.byteArrayFromString(c,g))};this.getLength=function(){return c};this.getByteArray=function(){var b=new Uint8Array(new ArrayBuffer(c));b.set(n.subarray(0,c));return b}};
// Input 6
core.CSSUnits=function(){var g=this,k={"in":1,cm:2.54,mm:25.4,pt:72,pc:12,px:96};this.convert=function(b,c,h){return b*k[h]/k[c]};this.convertMeasure=function(b,c){var h,k;b&&c&&(h=parseFloat(b),k=b.replace(h.toString(),""),h=g.convert(h,k,c));return h};this.getUnits=function(b){return b.substr(b.length-2,b.length)}};
// Input 7
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){function g(){var c,h,k,e,g,q,m,p,a;void 0===b&&(h=(c=runtime.getWindow())&&c.document,q=h.documentElement,m=h.body,b={rangeBCRIgnoresElementBCR:!1,unscaledRangeClientRects:!1,elementBCRIgnoresBodyScroll:!1},h&&(e=h.createElement("div"),e.style.position="absolute",e.style.left="-99999px",e.style.transform="scale(2)",e.style["-webkit-transform"]="scale(2)",g=h.createElement("div"),e.appendChild(g),m.appendChild(e),c=h.createRange(),c.selectNode(g),b.rangeBCRIgnoresElementBCR=0===c.getClientRects().length,
g.appendChild(h.createTextNode("Rect transform test")),h=g.getBoundingClientRect(),k=c.getBoundingClientRect(),b.unscaledRangeClientRects=2<Math.abs(h.height-k.height),e.style.transform="",e.style["-webkit-transform"]="",h=q.style.overflow,k=m.style.overflow,p=m.style.height,a=m.scrollTop,q.style.overflow="visible",m.style.overflow="visible",m.style.height="200%",m.scrollTop=m.scrollHeight,b.elementBCRIgnoresBodyScroll=c.getBoundingClientRect().top!==g.getBoundingClientRect().top,m.scrollTop=a,m.style.height=
p,m.style.overflow=k,q.style.overflow=h,c.detach(),m.removeChild(e),c=Object.keys(b).map(function(a){return a+":"+String(b[a])}).join(", "),runtime.log("Detected browser quirks - "+c)));return b}function k(b,h,k){for(b=b?b.firstElementChild:null;b;){if(b.localName===k&&b.namespaceURI===h)return b;b=b.nextElementSibling}return null}var b;core.DomUtils=function(){function b(a,d){for(var l=0,f;a.parentNode!==d;)runtime.assert(null!==a.parentNode,"parent is null"),a=a.parentNode;for(f=d.firstChild;f!==
a;)l+=1,f=f.nextSibling;return l}function h(a,d){return 0>=a.compareBoundaryPoints(Range.START_TO_START,d)&&0<=a.compareBoundaryPoints(Range.END_TO_END,d)}function n(a,d){var b=null;a.nodeType===Node.TEXT_NODE&&(0===a.length?(a.parentNode.removeChild(a),d.nodeType===Node.TEXT_NODE&&(b=d)):(d.nodeType===Node.TEXT_NODE&&(a.appendData(d.data),d.parentNode.removeChild(d)),b=a));return b}function e(a){for(var d=a.parentNode;a.firstChild;)d.insertBefore(a.firstChild,a);d.removeChild(a);return d}function r(a,
d){for(var b=a.parentNode,f=a.firstChild,c;f;)c=f.nextSibling,r(f,d),f=c;b&&d(a)&&e(a);return b}function q(a,d){return a===d||Boolean(a.compareDocumentPosition(d)&Node.DOCUMENT_POSITION_CONTAINED_BY)}function m(a,d,b){Object.keys(d).forEach(function(f){var c=f.split(":"),e=c[1],h=b(c[0]),c=d[f],k=typeof c;"object"===k?Object.keys(c).length&&(f=h?a.getElementsByTagNameNS(h,e)[0]||a.ownerDocument.createElementNS(h,f):a.getElementsByTagName(e)[0]||a.ownerDocument.createElement(f),a.appendChild(f),m(f,
c,b)):h&&(runtime.assert("number"===k||"string"===k,"attempting to map unsupported type '"+k+"' (key: "+f+")"),a.setAttributeNS(h,f,String(c)))})}var p=null;this.splitBoundaries=function(a){var d,l=[],f,e,h;if(a.startContainer.nodeType===Node.TEXT_NODE||a.endContainer.nodeType===Node.TEXT_NODE){f=a.endContainer;e=a.endContainer.nodeType!==Node.TEXT_NODE?a.endOffset===a.endContainer.childNodes.length:!1;h=a.endOffset;d=a.endContainer;if(h<d.childNodes.length)for(d=d.childNodes.item(h),h=0;d.firstChild;)d=
d.firstChild;else for(;d.lastChild;)d=d.lastChild,h=d.nodeType===Node.TEXT_NODE?d.textContent.length:d.childNodes.length;d===f&&(f=null);a.setEnd(d,h);h=a.endContainer;0!==a.endOffset&&h.nodeType===Node.TEXT_NODE&&(d=h,a.endOffset!==d.length&&(l.push(d.splitText(a.endOffset)),l.push(d)));h=a.startContainer;0!==a.startOffset&&h.nodeType===Node.TEXT_NODE&&(d=h,a.startOffset!==d.length&&(h=d.splitText(a.startOffset),l.push(d),l.push(h),a.setStart(h,0)));if(null!==f){for(h=a.endContainer;h.parentNode&&
h.parentNode!==f;)h=h.parentNode;e=e?f.childNodes.length:b(h,f);a.setEnd(f,e)}}return l};this.containsRange=h;this.rangesIntersect=function(a,d){return 0>=a.compareBoundaryPoints(Range.END_TO_START,d)&&0<=a.compareBoundaryPoints(Range.START_TO_END,d)};this.getNodesInRange=function(a,d,b){var f=[],c=a.commonAncestorContainer,c=c.nodeType===Node.TEXT_NODE?c.parentNode:c;b=a.startContainer.ownerDocument.createTreeWalker(c,b,d,!1);var e,h;a.endContainer.childNodes[a.endOffset-1]?(e=a.endContainer.childNodes[a.endOffset-
1],h=Node.DOCUMENT_POSITION_PRECEDING|Node.DOCUMENT_POSITION_CONTAINED_BY):(e=a.endContainer,h=Node.DOCUMENT_POSITION_PRECEDING);a.startContainer.childNodes[a.startOffset]?(a=a.startContainer.childNodes[a.startOffset],b.currentNode=a):a.startOffset===(a.startContainer.nodeType===Node.TEXT_NODE?a.startContainer.length:a.startContainer.childNodes.length)?(a=a.startContainer,b.currentNode=a,b.lastChild(),a=b.nextNode()):(a=a.startContainer,b.currentNode=a);if(a){a=b.currentNode;if(a!==c)for(a=a.parentNode;a&&
a!==c;)d(a)===NodeFilter.FILTER_REJECT&&(b.currentNode=a),a=a.parentNode;a=b.currentNode;switch(d(a)){case NodeFilter.FILTER_REJECT:for(a=b.nextSibling();!a&&b.parentNode();)a=b.nextSibling();break;case NodeFilter.FILTER_ACCEPT:f.push(a);a=b.nextNode();break;default:a=b.nextNode()}for(;a;){d=e.compareDocumentPosition(a);if(0!==d&&0===(d&h))break;f.push(a);a=b.nextNode()}}return f};this.normalizeTextNodes=function(a){a&&a.nextSibling&&(a=n(a,a.nextSibling));a&&a.previousSibling&&n(a.previousSibling,
a)};this.rangeContainsNode=function(a,d){var b=d.ownerDocument.createRange(),f=d.ownerDocument.createRange(),c;b.setStart(a.startContainer,a.startOffset);b.setEnd(a.endContainer,a.endOffset);f.selectNodeContents(d);c=h(b,f);b.detach();f.detach();return c};this.mergeIntoParent=e;this.removeUnwantedNodes=r;this.getElementsByTagNameNS=function(a,d,b){var f=[];a=a.getElementsByTagNameNS(d,b);f.length=b=a.length;for(d=0;d<b;d+=1)f[d]=a.item(d);return f};this.containsNode=function(a,d){return a===d||a.contains(d)};
this.comparePoints=function(a,d,l,f){if(a===l)return f-d;var e=a.compareDocumentPosition(l);2===e?e=-1:4===e?e=1:10===e?(d=b(a,l),e=d<f?1:-1):(f=b(l,a),e=f<d?-1:1);return e};this.adaptRangeDifferenceToZoomLevel=function(a,d){return g().unscaledRangeClientRects?a:a/d};this.getBoundingClientRect=function(a){var d=a.ownerDocument,b=g(),f=d.body;if((!1===b.unscaledRangeClientRects||b.rangeBCRIgnoresElementBCR)&&a.nodeType===Node.ELEMENT_NODE)return a=a.getBoundingClientRect(),b.elementBCRIgnoresBodyScroll?
{left:a.left+f.scrollLeft,right:a.right+f.scrollLeft,top:a.top+f.scrollTop,bottom:a.bottom+f.scrollTop,width:a.width,height:a.height}:a;var c;p?c=p:p=c=d.createRange();b=c;b.selectNode(a);return b.getBoundingClientRect()};this.mapKeyValObjOntoNode=function(a,d,b){Object.keys(d).forEach(function(f){var c=f.split(":"),e=c[1],c=b(c[0]),h=d[f];c?(e=a.getElementsByTagNameNS(c,e)[0],e||(e=a.ownerDocument.createElementNS(c,f),a.appendChild(e)),e.textContent=h):runtime.log("Key ignored: "+f)})};this.removeKeyElementsFromNode=
function(a,d,b){d.forEach(function(d){var c=d.split(":"),e=c[1];(c=b(c[0]))?(e=a.getElementsByTagNameNS(c,e)[0])?e.parentNode.removeChild(e):runtime.log("Element for "+d+" not found."):runtime.log("Property Name ignored: "+d)})};this.getKeyValRepresentationOfNode=function(a,d){for(var b={},f=a.firstElementChild,c;f;){if(c=d(f.namespaceURI))b[c+":"+f.localName]=f.textContent;f=f.nextElementSibling}return b};this.mapObjOntoNode=m;this.getDirectChild=k;(function(a){var d,b;b=runtime.getWindow();null!==
b&&(d=b.navigator.appVersion.toLowerCase(),b=-1===d.indexOf("chrome")&&(-1!==d.indexOf("applewebkit")||-1!==d.indexOf("safari")),d=d.indexOf("msie"),b||d)&&(a.containsNode=q)})(this)};return core.DomUtils})();
// Input 8
core.Cursor=function(g,k){function b(a){a.parentNode&&(r.push(a.previousSibling),r.push(a.nextSibling),a.parentNode.removeChild(a))}function c(a,d,b){if(d.nodeType===Node.TEXT_NODE){runtime.assert(Boolean(d),"putCursorIntoTextNode: invalid container");var f=d.parentNode;runtime.assert(Boolean(f),"putCursorIntoTextNode: container without parent");runtime.assert(0<=b&&b<=d.length,"putCursorIntoTextNode: offset is out of bounds");0===b?f.insertBefore(a,d):(b!==d.length&&d.splitText(b),f.insertBefore(a,
d.nextSibling))}else d.nodeType===Node.ELEMENT_NODE&&d.insertBefore(a,d.childNodes.item(b));r.push(a.previousSibling);r.push(a.nextSibling)}var h=g.createElementNS("urn:webodf:names:cursor","cursor"),n=g.createElementNS("urn:webodf:names:cursor","anchor"),e,r=[],q=g.createRange(),m,p=new core.DomUtils;this.getNode=function(){return h};this.getAnchorNode=function(){return n.parentNode?n:h};this.getSelectedRange=function(){m?(q.setStartBefore(h),q.collapse(!0)):(q.setStartAfter(e?n:h),q.setEndBefore(e?
h:n));return q};this.setSelectedRange=function(a,d){q&&q!==a&&q.detach();q=a;e=!1!==d;(m=a.collapsed)?(b(n),b(h),c(h,a.startContainer,a.startOffset)):(b(n),b(h),c(e?h:n,a.endContainer,a.endOffset),c(e?n:h,a.startContainer,a.startOffset));r.forEach(p.normalizeTextNodes);r.length=0};this.hasForwardSelection=function(){return e};this.remove=function(){b(h);r.forEach(p.normalizeTextNodes);r.length=0};h.setAttributeNS("urn:webodf:names:cursor","memberId",k);n.setAttributeNS("urn:webodf:names:cursor","memberId",
k)};
// Input 9
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
core.Destroyable=function(){};core.Destroyable.prototype.destroy=function(g){};
// Input 10
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
core.EventNotifier=function(g){var k={};this.emit=function(b,c){var h,g;runtime.assert(k.hasOwnProperty(b),'unknown event fired "'+b+'"');g=k[b];for(h=0;h<g.length;h+=1)g[h](c)};this.subscribe=function(b,c){runtime.assert(k.hasOwnProperty(b),'tried to subscribe to unknown event "'+b+'"');k[b].push(c)};this.unsubscribe=function(b,c){var h;runtime.assert(k.hasOwnProperty(b),'tried to unsubscribe from unknown event "'+b+'"');h=k[b].indexOf(c);runtime.assert(-1!==h,'tried to unsubscribe unknown callback from event "'+
b+'"');-1!==h&&k[b].splice(h,1)};(function(){var b,c;for(b=0;b<g.length;b+=1)c=g[b],runtime.assert(!k.hasOwnProperty(c),'Duplicated event ids: "'+c+'" registered more than once.'),k[c]=[]})()};
// Input 11
/*

 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
core.LoopWatchDog=function(g,k){var b=Date.now(),c=0;this.check=function(){var h;if(g&&(h=Date.now(),h-b>g))throw runtime.log("alert","watchdog timeout"),"timeout!";if(0<k&&(c+=1,c>k))throw runtime.log("alert","watchdog loop overflow"),"loop overflow";}};
// Input 12
core.PositionIterator=function(g,k,b,c){function h(){this.acceptNode=function(a){return!a||a.nodeType===l&&0===a.length?v:s}}function n(a){this.acceptNode=function(d){return!d||d.nodeType===l&&0===d.length?v:a.acceptNode(d)}}function e(){var d=p.currentNode,b=d.nodeType;a=b===l?d.length-1:b===f?1:0}function r(){if(null===p.previousSibling()){if(!p.parentNode()||p.currentNode===g)return p.firstChild(),!1;a=0}else e();return!0}function q(){var b=p.currentNode,f;f=d(b);if(b!==g)for(b=b.parentNode;b&&
b!==g;)d(b)===v&&(p.currentNode=b,f=v),b=b.parentNode;f===v?(a=1,b=m.nextPosition()):b=f===s?!0:m.nextPosition();b&&runtime.assert(d(p.currentNode)===s,"moveToAcceptedNode did not result in walker being on an accepted node");return b}var m=this,p,a,d,l=Node.TEXT_NODE,f=Node.ELEMENT_NODE,s=NodeFilter.FILTER_ACCEPT,v=NodeFilter.FILTER_REJECT;this.nextPosition=function(){var d=p.currentNode,b=d.nodeType;if(d===g)return!1;if(0===a&&b===f)null===p.firstChild()&&(a=1);else if(b===l&&a+1<d.length)a+=1;else if(null!==
p.nextSibling())a=0;else if(p.parentNode())a=1;else return!1;return!0};this.previousPosition=function(){var d=!0,b=p.currentNode;0===a?d=r():b.nodeType===l?a-=1:null!==p.lastChild()?e():b===g?d=!1:a=0;return d};this.previousNode=r;this.container=function(){var d=p.currentNode,b=d.nodeType;0===a&&b!==l&&(d=d.parentNode);return d};this.rightNode=function(){var b=p.currentNode,c=b.nodeType;if(c===l&&a===b.length)for(b=b.nextSibling;b&&d(b)!==s;)b=b.nextSibling;else c===f&&1===a&&(b=null);return b};this.leftNode=
function(){var b=p.currentNode;if(0===a)for(b=b.previousSibling;b&&d(b)!==s;)b=b.previousSibling;else if(b.nodeType===f)for(b=b.lastChild;b&&d(b)!==s;)b=b.previousSibling;return b};this.getCurrentNode=function(){return p.currentNode};this.unfilteredDomOffset=function(){if(p.currentNode.nodeType===l)return a;for(var d=0,b=p.currentNode,b=1===a?b.lastChild:b.previousSibling;b;)d+=1,b=b.previousSibling;return d};this.getPreviousSibling=function(){var a=p.currentNode,d=p.previousSibling();p.currentNode=
a;return d};this.getNextSibling=function(){var a=p.currentNode,d=p.nextSibling();p.currentNode=a;return d};this.setPositionBeforeElement=function(d){runtime.assert(Boolean(d),"setPositionBeforeElement called without element");p.currentNode=d;a=0;return q()};this.setUnfilteredPosition=function(d,b){runtime.assert(Boolean(d),"PositionIterator.setUnfilteredPosition called without container");p.currentNode=d;if(d.nodeType===l)return a=b,runtime.assert(b<=d.length,"Error in setPosition: "+b+" > "+d.length),
runtime.assert(0<=b,"Error in setPosition: "+b+" < 0"),b===d.length&&(p.nextSibling()?a=0:p.parentNode()?a=1:runtime.assert(!1,"Error in setUnfilteredPosition: position not valid.")),!0;b<d.childNodes.length?(p.currentNode=d.childNodes.item(b),a=0):a=1;return q()};this.moveToEnd=function(){p.currentNode=g;a=1};this.moveToEndOfNode=function(d){d.nodeType===l?m.setUnfilteredPosition(d,d.length):(p.currentNode=d,a=1)};this.isBeforeNode=function(){return 0===a};this.getNodeFilter=function(){return d};
d=(b?new n(b):new h).acceptNode;d.acceptNode=d;k=k||NodeFilter.SHOW_ALL;runtime.assert(g.nodeType!==Node.TEXT_NODE,"Internet Explorer doesn't allow tree walker roots to be text nodes");p=g.ownerDocument.createTreeWalker(g,k,d,c);a=0;null===p.firstChild()&&(a=1)};
// Input 13
core.PositionFilter=function(){};core.PositionFilter.FilterResult={FILTER_ACCEPT:1,FILTER_REJECT:2,FILTER_SKIP:3};core.PositionFilter.prototype.acceptPosition=function(g){};(function(){return core.PositionFilter})();
// Input 14
core.PositionFilterChain=function(){var g=[],k=core.PositionFilter.FilterResult.FILTER_ACCEPT,b=core.PositionFilter.FilterResult.FILTER_REJECT;this.acceptPosition=function(c){var h;for(h=0;h<g.length;h+=1)if(g[h].acceptPosition(c)===b)return b;return k};this.addFilter=function(b){g.push(b)}};
// Input 15
core.zip_HuftNode=function(){this.n=this.b=this.e=0;this.t=null};core.zip_HuftList=function(){this.list=this.next=null};
core.RawInflate=function(){function g(a,d,b,f,c,e){this.BMAX=16;this.N_MAX=288;this.status=0;this.root=null;this.m=0;var l=Array(this.BMAX+1),h,k,g,p,n,m,I,s=Array(this.BMAX+1),q,r,C,M=new core.zip_HuftNode,B=Array(this.BMAX);p=Array(this.N_MAX);var t,v=Array(this.BMAX+1),w,J,u;u=this.root=null;for(n=0;n<l.length;n++)l[n]=0;for(n=0;n<s.length;n++)s[n]=0;for(n=0;n<B.length;n++)B[n]=null;for(n=0;n<p.length;n++)p[n]=0;for(n=0;n<v.length;n++)v[n]=0;h=256<d?a[256]:this.BMAX;q=a;r=0;n=d;do l[q[r]]++,r++;
while(0<--n);if(l[0]===d)this.root=null,this.status=this.m=0;else{for(m=1;m<=this.BMAX&&0===l[m];m++);I=m;e<m&&(e=m);for(n=this.BMAX;0!==n&&0===l[n];n--);g=n;e>n&&(e=n);for(w=1<<m;m<n;m++,w<<=1)if(w-=l[m],0>w){this.status=2;this.m=e;return}w-=l[n];if(0>w)this.status=2,this.m=e;else{l[n]+=w;v[1]=m=0;q=l;r=1;for(C=2;0<--n;)m+=q[r++],v[C++]=m;q=a;n=r=0;do m=q[r++],0!==m&&(p[v[m]++]=n);while(++n<d);d=v[g];v[0]=n=0;q=p;r=0;p=-1;t=s[0]=0;C=null;J=0;for(I=I-1+1;I<=g;I++)for(a=l[I];0<a--;){for(;I>t+s[1+p];){t+=
s[1+p];p++;J=g-t;J=J>e?e:J;m=I-t;k=1<<m;if(k>a+1)for(k-=a+1,C=I;++m<J;){k<<=1;if(k<=l[++C])break;k-=l[C]}t+m>h&&t<h&&(m=h-t);J=1<<m;s[1+p]=m;C=Array(J);for(k=0;k<J;k++)C[k]=new core.zip_HuftNode;u=null===u?this.root=new core.zip_HuftList:u.next=new core.zip_HuftList;u.next=null;u.list=C;B[p]=C;0<p&&(v[p]=n,M.b=s[p],M.e=16+m,M.t=C,m=(n&(1<<t)-1)>>t-s[p],B[p-1][m].e=M.e,B[p-1][m].b=M.b,B[p-1][m].n=M.n,B[p-1][m].t=M.t)}M.b=I-t;r>=d?M.e=99:q[r]<b?(M.e=256>q[r]?16:15,M.n=q[r++]):(M.e=c[q[r]-b],M.n=f[q[r++]-
b]);k=1<<I-t;for(m=n>>t;m<J;m+=k)C[m].e=M.e,C[m].b=M.b,C[m].n=M.n,C[m].t=M.t;for(m=1<<I-1;0!==(n&m);m>>=1)n^=m;for(n^=m;(n&(1<<t)-1)!==v[p];)t-=s[p],p--}this.m=s[1];this.status=0!==w&&1!==g?1:0}}}function k(b){for(;d<b;){var f=a,c;c=t.length===B?-1:t[B++];a=f|c<<d;d+=8}}function b(d){return a&J[d]}function c(b){a>>=b;d-=b}function h(a,d,f){var h,p,g;if(0===f)return 0;for(g=0;;){k(w);p=u.list[b(w)];for(h=p.e;16<h;){if(99===h)return-1;c(p.b);h-=16;k(h);p=p.t[b(h)];h=p.e}c(p.b);if(16===h)r&=32767,a[d+
g++]=e[r++]=p.n;else{if(15===h)break;k(h);s=p.n+b(h);c(h);k(z);p=y.list[b(z)];for(h=p.e;16<h;){if(99===h)return-1;c(p.b);h-=16;k(h);p=p.t[b(h)];h=p.e}c(p.b);k(h);v=r-p.n-b(h);for(c(h);0<s&&g<f;)s--,v&=32767,r&=32767,a[d+g++]=e[r++]=e[v++]}if(g===f)return f}l=-1;return g}function n(a,d,f){var e,l,p,n,m,s,q,r=Array(316);for(e=0;e<r.length;e++)r[e]=0;k(5);s=257+b(5);c(5);k(5);q=1+b(5);c(5);k(4);e=4+b(4);c(4);if(286<s||30<q)return-1;for(l=0;l<e;l++)k(3),r[S[l]]=b(3),c(3);for(l=e;19>l;l++)r[S[l]]=0;w=
7;l=new g(r,19,19,null,null,w);if(0!==l.status)return-1;u=l.root;w=l.m;n=s+q;for(e=p=0;e<n;)if(k(w),m=u.list[b(w)],l=m.b,c(l),l=m.n,16>l)r[e++]=p=l;else if(16===l){k(2);l=3+b(2);c(2);if(e+l>n)return-1;for(;0<l--;)r[e++]=p}else{17===l?(k(3),l=3+b(3),c(3)):(k(7),l=11+b(7),c(7));if(e+l>n)return-1;for(;0<l--;)r[e++]=0;p=0}w=9;l=new g(r,s,257,I,M,w);0===w&&(l.status=1);if(0!==l.status)return-1;u=l.root;w=l.m;for(e=0;e<q;e++)r[e]=r[e+s];z=6;l=new g(r,q,0,C,W,z);y=l.root;z=l.m;return 0===z&&257<s||0!==l.status?
-1:h(a,d,f)}var e=[],r,q=null,m,p,a,d,l,f,s,v,u,y,w,z,t,B,J=[0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535],I=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],M=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,99,99],C=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],W=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],S=[16,17,18,0,8,7,9,6,
10,5,11,4,12,3,13,2,14,1,15],V;this.inflate=function(J,S){e.length=65536;d=a=r=0;l=-1;f=!1;s=v=0;u=null;t=J;B=0;var U=new Uint8Array(new ArrayBuffer(S));a:for(var K=0,L;K<S&&(!f||-1!==l);){if(0<s){if(0!==l)for(;0<s&&K<S;)s--,v&=32767,r&=32767,U[0+K]=e[r]=e[v],K+=1,r+=1,v+=1;else{for(;0<s&&K<S;)s-=1,r&=32767,k(8),U[0+K]=e[r]=b(8),K+=1,r+=1,c(8);0===s&&(l=-1)}if(K===S)break}if(-1===l){if(f)break;k(1);0!==b(1)&&(f=!0);c(1);k(2);l=b(2);c(2);u=null;s=0}switch(l){case 0:L=U;var ba=0+K,X=S-K,R=void 0,R=
d&7;c(R);k(16);R=b(16);c(16);k(16);if(R!==(~a&65535))L=-1;else{c(16);s=R;for(R=0;0<s&&R<X;)s--,r&=32767,k(8),L[ba+R++]=e[r++]=b(8),c(8);0===s&&(l=-1);L=R}break;case 1:if(null!==u)L=h(U,0+K,S-K);else b:{L=U;ba=0+K;X=S-K;if(null===q){for(var x=void 0,R=Array(288),x=void 0,x=0;144>x;x++)R[x]=8;for(x=144;256>x;x++)R[x]=9;for(x=256;280>x;x++)R[x]=7;for(x=280;288>x;x++)R[x]=8;p=7;x=new g(R,288,257,I,M,p);if(0!==x.status){alert("HufBuild error: "+x.status);L=-1;break b}q=x.root;p=x.m;for(x=0;30>x;x++)R[x]=
5;V=5;x=new g(R,30,0,C,W,V);if(1<x.status){q=null;alert("HufBuild error: "+x.status);L=-1;break b}m=x.root;V=x.m}u=q;y=m;w=p;z=V;L=h(L,ba,X)}break;case 2:L=null!==u?h(U,0+K,S-K):n(U,0+K,S-K);break;default:L=-1}if(-1===L)break a;K+=L}t=new Uint8Array(new ArrayBuffer(0));return U}};
// Input 16
core.ScheduledTask=function(g,k,b){function c(){e&&(b(n),e=!1)}function h(){c();g.apply(void 0,r);r=null}var n,e=!1,r=[];this.trigger=function(){r=Array.prototype.slice.call(arguments);e||(e=!0,n=k(h))};this.triggerImmediate=function(){r=Array.prototype.slice.call(arguments);h()};this.processRequests=function(){e&&h()};this.cancel=c;this.destroy=function(b){c();b()}};
// Input 17
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
core.StepIterator=function(g,k){function b(){p=null;d=a=void 0}function c(){void 0===d&&(d=g.acceptPosition(k)===m);return d}function h(a,d){b();return k.setUnfilteredPosition(a,d)}function n(){p||(p=k.container());return p}function e(){void 0===a&&(a=k.unfilteredDomOffset());return a}function r(){for(b();k.nextPosition();)if(b(),c())return!0;return!1}function q(){for(b();k.previousPosition();)if(b(),c())return!0;return!1}var m=core.PositionFilter.FilterResult.FILTER_ACCEPT,p,a,d;this.isStep=c;this.setPosition=
h;this.container=n;this.offset=e;this.nextStep=r;this.previousStep=q;this.roundToClosestStep=function(){var a=n(),d=e(),b=c();b||(b=q(),b||(h(a,d),b=r()));return b};this.roundToPreviousStep=function(){var a=c();a||(a=q());return a};this.roundToNextStep=function(){var a=c();a||(a=r());return a}};
// Input 18
/*

 Copyright (C) 2010-2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){var g;core.Task={};core.Task.processTasks=function(){g.performRedraw()};core.Task.createRedrawTask=function(k){return new core.ScheduledTask(k,g.requestRedrawTask,g.cancelRedrawTask)};core.Task.createTimeoutTask=function(k,b){return new core.ScheduledTask(k,function(c){return runtime.setTimeout(c,b)},runtime.clearTimeout)};g=new function(){var k={};this.requestRedrawTask=function(b){var c=runtime.requestAnimationFrame(function(){b();delete k[c]});k[c]=b;return c};this.performRedraw=function(){Object.keys(k).forEach(function(b){k[b]();
runtime.cancelAnimationFrame(parseInt(b,10))});k={}};this.cancelRedrawTask=function(b){runtime.cancelAnimationFrame(b);delete k[b]}}})();
// Input 19
core.UnitTest=function(){};core.UnitTest.prototype.setUp=function(){};core.UnitTest.prototype.tearDown=function(){};core.UnitTest.prototype.description=function(){};core.UnitTest.prototype.tests=function(){};core.UnitTest.prototype.asyncTests=function(){};
core.UnitTest.provideTestAreaDiv=function(){var g=runtime.getWindow().document,k=g.getElementById("testarea");runtime.assert(!k,'Unclean test environment, found a div with id "testarea".');k=g.createElement("div");k.setAttribute("id","testarea");g.body.appendChild(k);return k};
core.UnitTest.cleanupTestAreaDiv=function(){var g=runtime.getWindow().document,k=g.getElementById("testarea");runtime.assert(!!k&&k.parentNode===g.body,'Test environment broken, found no div with id "testarea" below body.');g.body.removeChild(k)};core.UnitTest.createXmlDocument=function(g,k,b){var c="<?xml version='1.0' encoding='UTF-8'?>",c=c+("<"+g);Object.keys(b).forEach(function(h){c+=" xmlns:"+h+'="'+b[h]+'"'});c+=">";c+=k;c+="</"+g+">";return runtime.parseXML(c)};
core.UnitTest.createOdtDocument=function(g,k){return core.UnitTest.createXmlDocument("office:document",g,k)};
core.UnitTestLogger=function(){var g=[],k=0,b=0,c="",h="";this.startTest=function(n,e){g=[];k=0;c=n;h=e;b=Date.now()};this.endTest=function(){var n=Date.now();return{description:h,suite:[c,h],success:0===k,log:g,time:n-b}};this.debug=function(b){g.push({category:"debug",message:b})};this.fail=function(b){k+=1;g.push({category:"fail",message:b})};this.pass=function(b){g.push({category:"pass",message:b})}};
core.UnitTestRunner=function(g,k){function b(d){q+=1;a?k.debug(d):k.fail(d)}function c(a,c){var f;try{if(a.length!==c.length)return b("array of length "+a.length+" should be "+c.length+" long"),!1;for(f=0;f<a.length;f+=1)if(a[f]!==c[f])return b(a[f]+" should be "+c[f]+" at array index "+f),!1}catch(e){return!1}return!0}function h(a,c,f){var e=a.attributes,p=e.length,k,g,n;for(k=0;k<p;k+=1)if(g=e.item(k),"xmlns"!==g.prefix&&"urn:webodf:names:steps"!==g.namespaceURI){n=c.getAttributeNS(g.namespaceURI,
g.localName);if(!c.hasAttributeNS(g.namespaceURI,g.localName))return b("Attribute "+g.localName+" with value "+g.value+" was not present"),!1;if(n!==g.value)return b("Attribute "+g.localName+" was "+n+" should be "+g.value),!1}return f?!0:h(c,a,!0)}function n(a,c){var f,e;f=a.nodeType;e=c.nodeType;if(f!==e)return b("Nodetype '"+f+"' should be '"+e+"'"),!1;if(f===Node.TEXT_NODE){if(a.data===c.data)return!0;b("Textnode data '"+a.data+"' should be '"+c.data+"'");return!1}runtime.assert(f===Node.ELEMENT_NODE,
"Only textnodes and elements supported.");if(a.namespaceURI!==c.namespaceURI)return b("namespace '"+a.namespaceURI+"' should be '"+c.namespaceURI+"'"),!1;if(a.localName!==c.localName)return b("localName '"+a.localName+"' should be '"+c.localName+"'"),!1;if(!h(a,c,!1))return!1;f=a.firstChild;for(e=c.firstChild;f;){if(!e)return b("Nodetype '"+f.nodeType+"' is unexpected here."),!1;if(!n(f,e))return!1;f=f.nextSibling;e=e.nextSibling}return e?(b("Nodetype '"+e.nodeType+"' is missing here."),!1):!0}function e(a,
b){return 0===b?a===b&&1/a===1/b:a===b?!0:null===a||null===b?!1:"number"===typeof b&&isNaN(b)?"number"===typeof a&&isNaN(a):Object.prototype.toString.call(b)===Object.prototype.toString.call([])?c(a,b):"object"===typeof b&&"object"===typeof a?b.constructor===Element||b.constructor===Node?n(a,b):p(a,b):!1}function r(a,c,f){"string"===typeof c&&"string"===typeof f||k.debug("WARN: shouldBe() expects string arguments");var h,p;try{p=eval(c)}catch(g){h=g}a=eval(f);h?b(c+" should be "+a+". Threw exception "+
h):e(p,a)?k.pass(c+" is "+f):String(typeof p)===String(typeof a)?(f=0===p&&0>1/p?"-0":String(p),b(c+" should be "+a+". Was "+f+".")):b(c+" should be "+a+" (of type "+typeof a+"). Was "+p+" (of type "+typeof p+").")}var q=0,m,p,a=!1;this.resourcePrefix=function(){return g};this.beginExpectFail=function(){m=q;a=!0};this.endExpectFail=function(){var d=m===q;a=!1;q=m;d&&(q+=1,k.fail("Expected at least one failed test, but none registered."))};p=function(a,l){var f=Object.keys(a),h=Object.keys(l);f.sort();
h.sort();return c(f,h)&&Object.keys(a).every(function(f){var c=a[f],h=l[f];return e(c,h)?!0:(b(c+" should be "+h+" for key "+f),!1)})};this.areNodesEqual=n;this.shouldBeNull=function(a,b){r(a,b,"null")};this.shouldBeNonNull=function(a,c){var f,e;try{e=eval(c)}catch(h){f=h}f?b(c+" should be non-null. Threw exception "+f):null!==e?k.pass(c+" is non-null."):b(c+" should be non-null. Was "+e)};this.shouldBe=r;this.testFailed=b;this.countFailedTests=function(){return q};this.name=function(a){var b,f,c=
[],e=a.length;c.length=e;for(b=0;b<e;b+=1){f=Runtime.getFunctionName(a[b])||"";if(""===f)throw"Found a function without a name.";c[b]={f:a[b],name:f}}return c}};
core.UnitTester=function(){function g(b,c){return"<span style='color:blue;cursor:pointer' onclick='"+c+"'>"+b+"</span>"}function k(c){b.reporter&&b.reporter(c)}var b=this,c=0,h=new core.UnitTestLogger,n={},e="BrowserRuntime"===runtime.type();this.resourcePrefix="";this.reporter=function(b){var c,h;e?runtime.log("<span>Running "+g(b.description,'runTest("'+b.suite[0]+'","'+b.description+'")')+"</span>"):runtime.log("Running "+b.description);if(!b.success)for(c=0;c<b.log.length;c+=1)h=b.log[c],runtime.log(h.category,
h.message)};this.runTests=function(r,q,m){function p(b){function e(){I&&d.endExpectFail();k(h.endTest());l.tearDown();f[g]=w===d.countFailedTests();p(b.slice(1))}var g,I;if(0===b.length)n[a]=f,c+=d.countFailedTests(),q();else if(v=b[0].f,g=b[0].name,I=!0===b[0].expectFail,w=d.countFailedTests(),m.length&&-1===m.indexOf(g))p(b.slice(1));else{l.setUp();h.startTest(a,g);I&&d.beginExpectFail();try{v(e)}catch(r){d.testFailed("Unexpected exception encountered: "+r.toString()+"\n"+r.stack),e()}}}var a=Runtime.getFunctionName(r)||
"",d=new core.UnitTestRunner(b.resourcePrefix,h),l=new r(d),f={},s,v,u,y,w;if(n.hasOwnProperty(a))runtime.log("Test "+a+" has already run.");else{e?runtime.log("<span>Running "+g(a,'runSuite("'+a+'");')+": "+l.description()+"</span>"):runtime.log("Running "+a+": "+l.description);u=l.tests();for(s=0;s<u.length;s+=1)if(v=u[s].f,r=u[s].name,y=!0===u[s].expectFail,!m.length||-1!==m.indexOf(r)){w=d.countFailedTests();l.setUp();h.startTest(a,r);y&&d.beginExpectFail();try{v()}catch(z){d.testFailed("Unexpected exception encountered: "+
z.toString()+"\n"+z.stack)}y&&d.endExpectFail();k(h.endTest());l.tearDown();f[r]=w===d.countFailedTests()}p(l.asyncTests())}};this.countFailedTests=function(){return c};this.results=function(){return n}};
// Input 20
core.Utils=function(){function g(k,b){if(b&&Array.isArray(b)){k=k||[];if(!Array.isArray(k))throw"Destination is not an array.";k=k.concat(b.map(function(b){return g(null,b)}))}else if(b&&"object"===typeof b){k=k||{};if("object"!==typeof k)throw"Destination is not an object.";Object.keys(b).forEach(function(c){k[c]=g(k[c],b[c])})}else k=b;return k}this.hashString=function(k){var b=0,c,h;c=0;for(h=k.length;c<h;c+=1)b=(b<<5)-b+k.charCodeAt(c),b|=0;return b};this.mergeObjects=function(k,b){Object.keys(b).forEach(function(c){k[c]=
g(k[c],b[c])});return k}};
// Input 21
/*

 WebODF
 Copyright (c) 2010 Jos van den Oever
 Licensed under the ... License:

 Project home: http://www.webodf.org/
*/
core.Zip=function(g,k){function b(a){var d=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,
853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,
4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,
225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,
2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,
2932959818,3654703836,1088359270,936918E3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],b,f,c=a.length,e=0,e=0;b=-1;for(f=0;f<c;f+=1)e=(b^a[f])&255,e=d[e],b=b>>>8^e;return b^-1}function c(a){return new Date((a>>25&127)+1980,(a>>21&15)-1,a>>16&31,a>>11&15,a>>5&63,(a&31)<<1)}function h(a){var d=a.getFullYear();return 1980>d?0:d-1980<<
25|a.getMonth()+1<<21|a.getDate()<<16|a.getHours()<<11|a.getMinutes()<<5|a.getSeconds()>>1}function n(a,d){var b,e,h,l,p,k,g,n=this;this.load=function(d){if(null!==n.data)d(null,n.data);else{var b=p+34+e+h+256;b+g>f&&(b=f-g);runtime.read(a,g,b,function(b,f){if(b||null===f)d(b,f);else a:{var c=f,e=new core.ByteArray(c),h=e.readUInt32LE(),g;if(67324752!==h)d("File entry signature is wrong."+h.toString()+" "+c.length.toString(),null);else{e.pos+=22;h=e.readUInt16LE();g=e.readUInt16LE();e.pos+=h+g;if(l){c=
c.subarray(e.pos,e.pos+p);if(p!==c.length){d("The amount of compressed bytes read was "+c.length.toString()+" instead of "+p.toString()+" for "+n.filename+" in "+a+".",null);break a}c=v(c,k)}else c=c.subarray(e.pos,e.pos+k);k!==c.length?d("The amount of bytes read was "+c.length.toString()+" instead of "+k.toString()+" for "+n.filename+" in "+a+".",null):(n.data=c,d(null,c))}}})}};this.set=function(a,d,b,f){n.filename=a;n.data=d;n.compressed=b;n.date=f};this.error=null;d&&(b=d.readUInt32LE(),33639248!==
b?this.error="Central directory entry has wrong signature at position "+(d.pos-4).toString()+' for file "'+a+'": '+d.data.length.toString():(d.pos+=6,l=d.readUInt16LE(),this.date=c(d.readUInt32LE()),d.readUInt32LE(),p=d.readUInt32LE(),k=d.readUInt32LE(),e=d.readUInt16LE(),h=d.readUInt16LE(),b=d.readUInt16LE(),d.pos+=8,g=d.readUInt32LE(),this.filename=runtime.byteArrayToString(d.data.subarray(d.pos,d.pos+e),"utf8"),this.data=null,d.pos+=e+h+b))}function e(a,d){if(22!==a.length)d("Central directory length should be 22.",
u);else{var b=new core.ByteArray(a),c;c=b.readUInt32LE();101010256!==c?d("Central directory signature is wrong: "+c.toString(),u):(c=b.readUInt16LE(),0!==c?d("Zip files with non-zero disk numbers are not supported.",u):(c=b.readUInt16LE(),0!==c?d("Zip files with non-zero disk numbers are not supported.",u):(c=b.readUInt16LE(),s=b.readUInt16LE(),c!==s?d("Number of entries is inconsistent.",u):(c=b.readUInt32LE(),b=b.readUInt16LE(),b=f-22-c,runtime.read(g,b,f-b,function(a,b){if(a||null===b)d(a,u);else a:{var f=
new core.ByteArray(b),c,e;l=[];for(c=0;c<s;c+=1){e=new n(g,f);if(e.error){d(e.error,u);break a}l[l.length]=e}d(null,u)}})))))}}function r(a,d){var b=null,f,c;for(c=0;c<l.length;c+=1)if(f=l[c],f.filename===a){b=f;break}b?b.data?d(null,b.data):b.load(d):d(a+" not found.",null)}function q(a){var d=new core.ByteArrayWriter("utf8"),f=0;d.appendArray([80,75,3,4,20,0,0,0,0,0]);a.data&&(f=a.data.length);d.appendUInt32LE(h(a.date));d.appendUInt32LE(a.data?b(a.data):0);d.appendUInt32LE(f);d.appendUInt32LE(f);
d.appendUInt16LE(a.filename.length);d.appendUInt16LE(0);d.appendString(a.filename);a.data&&d.appendByteArray(a.data);return d}function m(a,d){var f=new core.ByteArrayWriter("utf8"),c=0;f.appendArray([80,75,1,2,20,0,20,0,0,0,0,0]);a.data&&(c=a.data.length);f.appendUInt32LE(h(a.date));f.appendUInt32LE(a.data?b(a.data):0);f.appendUInt32LE(c);f.appendUInt32LE(c);f.appendUInt16LE(a.filename.length);f.appendArray([0,0,0,0,0,0,0,0,0,0,0,0]);f.appendUInt32LE(d);f.appendString(a.filename);return f}function p(a,
d){if(a===l.length)d(null);else{var b=l[a];null!==b.data?p(a+1,d):b.load(function(b){b?d(b):p(a+1,d)})}}function a(a,d){p(0,function(b){if(b)d(b);else{var f,c,e=new core.ByteArrayWriter("utf8"),h=[0];for(f=0;f<l.length;f+=1)e.appendByteArrayWriter(q(l[f])),h.push(e.getLength());b=e.getLength();for(f=0;f<l.length;f+=1)c=l[f],e.appendByteArrayWriter(m(c,h[f]));f=e.getLength()-b;e.appendArray([80,75,5,6,0,0,0,0]);e.appendUInt16LE(l.length);e.appendUInt16LE(l.length);e.appendUInt32LE(f);e.appendUInt32LE(b);
e.appendArray([0,0]);a(e.getByteArray())}})}function d(d,b){a(function(a){runtime.writeFile(d,a,b)},b)}var l,f,s,v=(new core.RawInflate).inflate,u=this,y=new core.Base64;this.load=r;this.save=function(a,d,b,f){var c,e;for(c=0;c<l.length;c+=1)if(e=l[c],e.filename===a){e.set(a,d,b,f);return}e=new n(g);e.set(a,d,b,f);l.push(e)};this.remove=function(a){var d,b;for(d=0;d<l.length;d+=1)if(b=l[d],b.filename===a)return l.splice(d,1),!0;return!1};this.write=function(a){d(g,a)};this.writeAs=d;this.createByteArray=
a;this.loadContentXmlAsFragments=function(a,d){u.loadAsString(a,function(a,b){if(a)return d.rootElementReady(a);d.rootElementReady(null,b,!0)})};this.loadAsString=function(a,d){r(a,function(a,b){if(a||null===b)return d(a,null);var f=runtime.byteArrayToString(b,"utf8");d(null,f)})};this.loadAsDOM=function(a,d){u.loadAsString(a,function(a,b){if(a||null===b)d(a,null);else{var f=(new DOMParser).parseFromString(b,"text/xml");d(null,f)}})};this.loadAsDataURL=function(a,d,b){r(a,function(a,f){if(a||!f)return b(a,
null);var c=0,e;d||(d=80===f[1]&&78===f[2]&&71===f[3]?"image/png":255===f[0]&&216===f[1]&&255===f[2]?"image/jpeg":71===f[0]&&73===f[1]&&70===f[2]?"image/gif":"");for(e="data:"+d+";base64,";c<f.length;)e+=y.convertUTF8ArrayToBase64(f.subarray(c,Math.min(c+45E3,f.length))),c+=45E3;b(null,e)})};this.getEntries=function(){return l.slice()};f=-1;null===k?l=[]:runtime.getFileSize(g,function(a){f=a;0>f?k("File '"+g+"' cannot be read.",u):runtime.read(g,f-22,22,function(a,d){a||null===k||null===d?k(a,u):
e(d,k)})})};
// Input 22
xmldom.LSSerializerFilter=function(){};xmldom.LSSerializerFilter.prototype.acceptNode=function(g){};
// Input 23
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
odf.OdfNodeFilter=function(){this.acceptNode=function(g){return"http://www.w3.org/1999/xhtml"===g.namespaceURI?NodeFilter.FILTER_SKIP:g.namespaceURI&&g.namespaceURI.match(/^urn:webodf:/)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}};
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
odf.Namespaces={namespaceMap:{db:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",dc:"http://purl.org/dc/elements/1.1/",dr3d:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",draw:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",chart:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",fo:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",form:"urn:oasis:names:tc:opendocument:xmlns:form:1.0",meta:"urn:oasis:names:tc:opendocument:xmlns:meta:1.0",number:"urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0",
office:"urn:oasis:names:tc:opendocument:xmlns:office:1.0",presentation:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",style:"urn:oasis:names:tc:opendocument:xmlns:style:1.0",svg:"urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0",table:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",text:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace"},prefixMap:{},dbns:"urn:oasis:names:tc:opendocument:xmlns:database:1.0",
dcns:"http://purl.org/dc/elements/1.1/",dr3dns:"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",drawns:"urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",chartns:"urn:oasis:names:tc:opendocument:xmlns:chart:1.0",fons:"urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",formns:"urn:oasis:names:tc:opendocument:xmlns:form:1.0",metans:"urn:oasis:names:tc:opendocument:xmlns:meta:1.0",numberns:"urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0",officens:"urn:oasis:names:tc:opendocument:xmlns:office:1.0",
presentationns:"urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",stylens:"urn:oasis:names:tc:opendocument:xmlns:style:1.0",svgns:"urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0",tablens:"urn:oasis:names:tc:opendocument:xmlns:table:1.0",textns:"urn:oasis:names:tc:opendocument:xmlns:text:1.0",xlinkns:"http://www.w3.org/1999/xlink",xmlns:"http://www.w3.org/XML/1998/namespace"};
(function(){var g=odf.Namespaces.namespaceMap,k=odf.Namespaces.prefixMap,b;for(b in g)g.hasOwnProperty(b)&&(k[g[b]]=b)})();odf.Namespaces.forEachPrefix=function(g){var k=odf.Namespaces.namespaceMap,b;for(b in k)k.hasOwnProperty(b)&&g(b,k[b])};odf.Namespaces.lookupNamespaceURI=function(g){var k=null;odf.Namespaces.namespaceMap.hasOwnProperty(g)&&(k=odf.Namespaces.namespaceMap[g]);return k};odf.Namespaces.lookupPrefix=function(g){var k=odf.Namespaces.prefixMap;return k.hasOwnProperty(g)?k[g]:null};
odf.Namespaces.lookupNamespaceURI.lookupNamespaceURI=odf.Namespaces.lookupNamespaceURI;
// Input 25
xmldom.XPathIterator=function(){};xmldom.XPathIterator.prototype.next=function(){};xmldom.XPathIterator.prototype.reset=function(){};
function createXPathSingleton(){function g(b,a,d){return-1!==b&&(b<a||-1===a)&&(b<d||-1===d)}function k(b){for(var a=[],d=0,c=b.length,f;d<c;){var e=b,h=c,k=a,n="",r=[],q=e.indexOf("[",d),t=e.indexOf("/",d),B=e.indexOf("=",d);g(t,q,B)?(n=e.substring(d,t),d=t+1):g(q,t,B)?(n=e.substring(d,q),d=m(e,q,r)):g(B,t,q)?(n=e.substring(d,B),d=B):(n=e.substring(d,h),d=h);k.push({location:n,predicates:r});if(d<c&&"="===b[d]){f=b.substring(d+1,c);if(2<f.length&&("'"===f[0]||'"'===f[0]))f=f.slice(1,f.length-1);
else try{f=parseInt(f,10)}catch(J){}d=c}}return{steps:a,value:f}}function b(){var b=null,a=!1;this.setNode=function(a){b=a};this.reset=function(){a=!1};this.next=function(){var d=a?null:b;a=!0;return d}}function c(b,a,d){this.reset=function(){b.reset()};this.next=function(){for(var c=b.next();c;){c.nodeType===Node.ELEMENT_NODE&&(c=c.getAttributeNodeNS(a,d));if(c)break;c=b.next()}return c}}function h(b,a){var d=b.next(),c=null;this.reset=function(){b.reset();d=b.next();c=null};this.next=function(){for(;d;){if(c)if(a&&
c.firstChild)c=c.firstChild;else{for(;!c.nextSibling&&c!==d;)c=c.parentNode;c===d?d=b.next():c=c.nextSibling}else{do(c=d.firstChild)||(d=b.next());while(d&&!c)}if(c&&c.nodeType===Node.ELEMENT_NODE)return c}return null}}function n(b,a){this.reset=function(){b.reset()};this.next=function(){for(var d=b.next();d&&!a(d);)d=b.next();return d}}function e(b,a,d){a=a.split(":",2);var c=d(a[0]),f=a[1];return new n(b,function(a){return a.localName===f&&a.namespaceURI===c})}function r(c,a,d){var e=new b,f=q(e,
a,d),h=a.value;return void 0===h?new n(c,function(a){e.setNode(a);f.reset();return null!==f.next()}):new n(c,function(a){e.setNode(a);f.reset();return(a=f.next())?a.nodeValue===h:!1})}var q,m;m=function(b,a,d){for(var c=a,f=b.length,e=0;c<f;)"]"===b[c]?(e-=1,0>=e&&d.push(k(b.substring(a,c)))):"["===b[c]&&(0>=e&&(a=c+1),e+=1),c+=1;return c};q=function(b,a,d){var l,f,k,g;for(l=0;l<a.steps.length;l+=1){k=a.steps[l];f=k.location;if(""===f)b=new h(b,!1);else if("@"===f[0]){f=f.substr(1).split(":",2);g=
d(f[0]);if(!g)throw"No namespace associated with the prefix "+f[0];b=new c(b,g,f[1])}else"."!==f&&(b=new h(b,!1),-1!==f.indexOf(":")&&(b=e(b,f,d)));for(f=0;f<k.predicates.length;f+=1)g=k.predicates[f],b=r(b,g,d)}return b};return{getODFElementsWithXPath:function(c,a,d){var e=c.ownerDocument,f=[],h=null;if(e&&"function"===typeof e.evaluate)for(d=e.evaluate(a,c,d,XPathResult.UNORDERED_NODE_ITERATOR_TYPE,null),h=d.iterateNext();null!==h;)h.nodeType===Node.ELEMENT_NODE&&f.push(h),h=d.iterateNext();else{f=
new b;f.setNode(c);c=k(a);f=q(f,c,d);c=[];for(d=f.next();d;)c.push(d),d=f.next();f=c}return f}}}xmldom.XPath=createXPathSingleton();
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
odf.StyleInfo=function(){function g(a,b){var d,f,c,e,h,l=0;if(d=I[a.localName])if(c=d[a.namespaceURI])l=c.length;for(d=0;d<l;d+=1)f=c[d],e=f.ns,h=f.localname,(f=a.getAttributeNS(e,h))&&a.setAttributeNS(e,B[e]+h,b+f);for(c=a.firstElementChild;c;)g(c,b),c=c.nextElementSibling}function k(a,b){var d,f,c,e,h,l=0;if(d=I[a.localName])if(c=d[a.namespaceURI])l=c.length;for(d=0;d<l;d+=1)if(f=c[d],e=f.ns,h=f.localname,f=a.getAttributeNS(e,h))f=f.replace(b,""),a.setAttributeNS(e,B[e]+h,f);for(c=a.firstElementChild;c;)k(c,
b),c=c.nextElementSibling}function b(a,b){var d,f,c,e,h,l=0;if(d=I[a.localName])if(c=d[a.namespaceURI])l=c.length;for(d=0;d<l;d+=1)if(e=c[d],f=e.ns,h=e.localname,f=a.getAttributeNS(f,h))b=b||{},e=e.keyname,b.hasOwnProperty(e)?b[e][f]=1:(h={},h[f]=1,b[e]=h);return b}function c(a,d){var f,e;b(a,d);for(f=a.firstChild;f;)f.nodeType===Node.ELEMENT_NODE&&(e=f,c(e,d)),f=f.nextSibling}function h(a,d,b){this.key=a;this.name=d;this.family=b;this.requires={}}function n(a,d,b){var f=a+'"'+d,c=b[f];c||(c=b[f]=
new h(f,a,d));return c}function e(a,d,b){var f,c,h,l,k,g=0;f=a.getAttributeNS(w,"name");l=a.getAttributeNS(w,"family");f&&l&&(d=n(f,l,b));if(d){if(f=I[a.localName])if(h=f[a.namespaceURI])g=h.length;for(f=0;f<g;f+=1)if(l=h[f],c=l.ns,k=l.localname,c=a.getAttributeNS(c,k))l=l.keyname,l=n(c,l,b),d.requires[l.key]=l}for(a=a.firstElementChild;a;)e(a,d,b),a=a.nextElementSibling;return b}function r(a,d){var b=d[a.family];b||(b=d[a.family]={});b[a.name]=1;Object.keys(a.requires).forEach(function(b){r(a.requires[b],
d)})}function q(a,d){var b=e(a,null,{});Object.keys(b).forEach(function(a){a=b[a];var f=d[a.family];f&&f.hasOwnProperty(a.name)&&r(a,d)})}function m(a,d){function b(d){(d=e.getAttributeNS(w,d))&&(a[d]=!0)}var f=["font-name","font-name-asian","font-name-complex"],c,e;for(c=d&&d.firstElementChild;c;)e=c,f.forEach(b),m(a,e),c=c.nextElementSibling}function p(a,d){function b(a){var f=e.getAttributeNS(w,a);f&&d.hasOwnProperty(f)&&e.setAttributeNS(w,"style:"+a,d[f])}var f=["font-name","font-name-asian",
"font-name-complex"],c,e;for(c=a&&a.firstElementChild;c;)e=c,f.forEach(b),p(e,d),c=c.nextElementSibling}var a=odf.Namespaces.chartns,d=odf.Namespaces.dbns,l=odf.Namespaces.dr3dns,f=odf.Namespaces.drawns,s=odf.Namespaces.formns,v=odf.Namespaces.numberns,u=odf.Namespaces.officens,y=odf.Namespaces.presentationns,w=odf.Namespaces.stylens,z=odf.Namespaces.tablens,t=odf.Namespaces.textns,B={"urn:oasis:names:tc:opendocument:xmlns:chart:1.0":"chart:","urn:oasis:names:tc:opendocument:xmlns:database:1.0":"db:",
"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0":"dr3d:","urn:oasis:names:tc:opendocument:xmlns:drawing:1.0":"draw:","urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0":"fo:","urn:oasis:names:tc:opendocument:xmlns:form:1.0":"form:","urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0":"number:","urn:oasis:names:tc:opendocument:xmlns:office:1.0":"office:","urn:oasis:names:tc:opendocument:xmlns:presentation:1.0":"presentation:","urn:oasis:names:tc:opendocument:xmlns:style:1.0":"style:","urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0":"svg:",
"urn:oasis:names:tc:opendocument:xmlns:table:1.0":"table:","urn:oasis:names:tc:opendocument:xmlns:text:1.0":"chart:","http://www.w3.org/XML/1998/namespace":"xml:"},J={text:[{ens:w,en:"tab-stop",ans:w,a:"leader-text-style"},{ens:w,en:"drop-cap",ans:w,a:"style-name"},{ens:t,en:"notes-configuration",ans:t,a:"citation-body-style-name"},{ens:t,en:"notes-configuration",ans:t,a:"citation-style-name"},{ens:t,en:"a",ans:t,a:"style-name"},{ens:t,en:"alphabetical-index",ans:t,a:"style-name"},{ens:t,en:"linenumbering-configuration",
ans:t,a:"style-name"},{ens:t,en:"list-level-style-number",ans:t,a:"style-name"},{ens:t,en:"ruby-text",ans:t,a:"style-name"},{ens:t,en:"span",ans:t,a:"style-name"},{ens:t,en:"a",ans:t,a:"visited-style-name"},{ens:w,en:"text-properties",ans:w,a:"text-line-through-text-style"},{ens:t,en:"alphabetical-index-source",ans:t,a:"main-entry-style-name"},{ens:t,en:"index-entry-bibliography",ans:t,a:"style-name"},{ens:t,en:"index-entry-chapter",ans:t,a:"style-name"},{ens:t,en:"index-entry-link-end",ans:t,a:"style-name"},
{ens:t,en:"index-entry-link-start",ans:t,a:"style-name"},{ens:t,en:"index-entry-page-number",ans:t,a:"style-name"},{ens:t,en:"index-entry-span",ans:t,a:"style-name"},{ens:t,en:"index-entry-tab-stop",ans:t,a:"style-name"},{ens:t,en:"index-entry-text",ans:t,a:"style-name"},{ens:t,en:"index-title-template",ans:t,a:"style-name"},{ens:t,en:"list-level-style-bullet",ans:t,a:"style-name"},{ens:t,en:"outline-level-style",ans:t,a:"style-name"}],paragraph:[{ens:f,en:"caption",ans:f,a:"text-style-name"},{ens:f,
en:"circle",ans:f,a:"text-style-name"},{ens:f,en:"connector",ans:f,a:"text-style-name"},{ens:f,en:"control",ans:f,a:"text-style-name"},{ens:f,en:"custom-shape",ans:f,a:"text-style-name"},{ens:f,en:"ellipse",ans:f,a:"text-style-name"},{ens:f,en:"frame",ans:f,a:"text-style-name"},{ens:f,en:"line",ans:f,a:"text-style-name"},{ens:f,en:"measure",ans:f,a:"text-style-name"},{ens:f,en:"path",ans:f,a:"text-style-name"},{ens:f,en:"polygon",ans:f,a:"text-style-name"},{ens:f,en:"polyline",ans:f,a:"text-style-name"},
{ens:f,en:"rect",ans:f,a:"text-style-name"},{ens:f,en:"regular-polygon",ans:f,a:"text-style-name"},{ens:u,en:"annotation",ans:f,a:"text-style-name"},{ens:s,en:"column",ans:s,a:"text-style-name"},{ens:w,en:"style",ans:w,a:"next-style-name"},{ens:z,en:"body",ans:z,a:"paragraph-style-name"},{ens:z,en:"even-columns",ans:z,a:"paragraph-style-name"},{ens:z,en:"even-rows",ans:z,a:"paragraph-style-name"},{ens:z,en:"first-column",ans:z,a:"paragraph-style-name"},{ens:z,en:"first-row",ans:z,a:"paragraph-style-name"},
{ens:z,en:"last-column",ans:z,a:"paragraph-style-name"},{ens:z,en:"last-row",ans:z,a:"paragraph-style-name"},{ens:z,en:"odd-columns",ans:z,a:"paragraph-style-name"},{ens:z,en:"odd-rows",ans:z,a:"paragraph-style-name"},{ens:t,en:"notes-configuration",ans:t,a:"default-style-name"},{ens:t,en:"alphabetical-index-entry-template",ans:t,a:"style-name"},{ens:t,en:"bibliography-entry-template",ans:t,a:"style-name"},{ens:t,en:"h",ans:t,a:"style-name"},{ens:t,en:"illustration-index-entry-template",ans:t,a:"style-name"},
{ens:t,en:"index-source-style",ans:t,a:"style-name"},{ens:t,en:"object-index-entry-template",ans:t,a:"style-name"},{ens:t,en:"p",ans:t,a:"style-name"},{ens:t,en:"table-index-entry-template",ans:t,a:"style-name"},{ens:t,en:"table-of-content-entry-template",ans:t,a:"style-name"},{ens:t,en:"table-index-entry-template",ans:t,a:"style-name"},{ens:t,en:"user-index-entry-template",ans:t,a:"style-name"},{ens:w,en:"page-layout-properties",ans:w,a:"register-truth-ref-style-name"}],chart:[{ens:a,en:"axis",ans:a,
a:"style-name"},{ens:a,en:"chart",ans:a,a:"style-name"},{ens:a,en:"data-label",ans:a,a:"style-name"},{ens:a,en:"data-point",ans:a,a:"style-name"},{ens:a,en:"equation",ans:a,a:"style-name"},{ens:a,en:"error-indicator",ans:a,a:"style-name"},{ens:a,en:"floor",ans:a,a:"style-name"},{ens:a,en:"footer",ans:a,a:"style-name"},{ens:a,en:"grid",ans:a,a:"style-name"},{ens:a,en:"legend",ans:a,a:"style-name"},{ens:a,en:"mean-value",ans:a,a:"style-name"},{ens:a,en:"plot-area",ans:a,a:"style-name"},{ens:a,en:"regression-curve",
ans:a,a:"style-name"},{ens:a,en:"series",ans:a,a:"style-name"},{ens:a,en:"stock-gain-marker",ans:a,a:"style-name"},{ens:a,en:"stock-loss-marker",ans:a,a:"style-name"},{ens:a,en:"stock-range-line",ans:a,a:"style-name"},{ens:a,en:"subtitle",ans:a,a:"style-name"},{ens:a,en:"title",ans:a,a:"style-name"},{ens:a,en:"wall",ans:a,a:"style-name"}],section:[{ens:t,en:"alphabetical-index",ans:t,a:"style-name"},{ens:t,en:"bibliography",ans:t,a:"style-name"},{ens:t,en:"illustration-index",ans:t,a:"style-name"},
{ens:t,en:"index-title",ans:t,a:"style-name"},{ens:t,en:"object-index",ans:t,a:"style-name"},{ens:t,en:"section",ans:t,a:"style-name"},{ens:t,en:"table-of-content",ans:t,a:"style-name"},{ens:t,en:"table-index",ans:t,a:"style-name"},{ens:t,en:"user-index",ans:t,a:"style-name"}],ruby:[{ens:t,en:"ruby",ans:t,a:"style-name"}],table:[{ens:d,en:"query",ans:d,a:"style-name"},{ens:d,en:"table-representation",ans:d,a:"style-name"},{ens:z,en:"background",ans:z,a:"style-name"},{ens:z,en:"table",ans:z,a:"style-name"}],
"table-column":[{ens:d,en:"column",ans:d,a:"style-name"},{ens:z,en:"table-column",ans:z,a:"style-name"}],"table-row":[{ens:d,en:"query",ans:d,a:"default-row-style-name"},{ens:d,en:"table-representation",ans:d,a:"default-row-style-name"},{ens:z,en:"table-row",ans:z,a:"style-name"}],"table-cell":[{ens:d,en:"column",ans:d,a:"default-cell-style-name"},{ens:z,en:"table-column",ans:z,a:"default-cell-style-name"},{ens:z,en:"table-row",ans:z,a:"default-cell-style-name"},{ens:z,en:"body",ans:z,a:"style-name"},
{ens:z,en:"covered-table-cell",ans:z,a:"style-name"},{ens:z,en:"even-columns",ans:z,a:"style-name"},{ens:z,en:"covered-table-cell",ans:z,a:"style-name"},{ens:z,en:"even-columns",ans:z,a:"style-name"},{ens:z,en:"even-rows",ans:z,a:"style-name"},{ens:z,en:"first-column",ans:z,a:"style-name"},{ens:z,en:"first-row",ans:z,a:"style-name"},{ens:z,en:"last-column",ans:z,a:"style-name"},{ens:z,en:"last-row",ans:z,a:"style-name"},{ens:z,en:"odd-columns",ans:z,a:"style-name"},{ens:z,en:"odd-rows",ans:z,a:"style-name"},
{ens:z,en:"table-cell",ans:z,a:"style-name"}],graphic:[{ens:l,en:"cube",ans:f,a:"style-name"},{ens:l,en:"extrude",ans:f,a:"style-name"},{ens:l,en:"rotate",ans:f,a:"style-name"},{ens:l,en:"scene",ans:f,a:"style-name"},{ens:l,en:"sphere",ans:f,a:"style-name"},{ens:f,en:"caption",ans:f,a:"style-name"},{ens:f,en:"circle",ans:f,a:"style-name"},{ens:f,en:"connector",ans:f,a:"style-name"},{ens:f,en:"control",ans:f,a:"style-name"},{ens:f,en:"custom-shape",ans:f,a:"style-name"},{ens:f,en:"ellipse",ans:f,a:"style-name"},
{ens:f,en:"frame",ans:f,a:"style-name"},{ens:f,en:"g",ans:f,a:"style-name"},{ens:f,en:"line",ans:f,a:"style-name"},{ens:f,en:"measure",ans:f,a:"style-name"},{ens:f,en:"page-thumbnail",ans:f,a:"style-name"},{ens:f,en:"path",ans:f,a:"style-name"},{ens:f,en:"polygon",ans:f,a:"style-name"},{ens:f,en:"polyline",ans:f,a:"style-name"},{ens:f,en:"rect",ans:f,a:"style-name"},{ens:f,en:"regular-polygon",ans:f,a:"style-name"},{ens:u,en:"annotation",ans:f,a:"style-name"}],presentation:[{ens:l,en:"cube",ans:y,
a:"style-name"},{ens:l,en:"extrude",ans:y,a:"style-name"},{ens:l,en:"rotate",ans:y,a:"style-name"},{ens:l,en:"scene",ans:y,a:"style-name"},{ens:l,en:"sphere",ans:y,a:"style-name"},{ens:f,en:"caption",ans:y,a:"style-name"},{ens:f,en:"circle",ans:y,a:"style-name"},{ens:f,en:"connector",ans:y,a:"style-name"},{ens:f,en:"control",ans:y,a:"style-name"},{ens:f,en:"custom-shape",ans:y,a:"style-name"},{ens:f,en:"ellipse",ans:y,a:"style-name"},{ens:f,en:"frame",ans:y,a:"style-name"},{ens:f,en:"g",ans:y,a:"style-name"},
{ens:f,en:"line",ans:y,a:"style-name"},{ens:f,en:"measure",ans:y,a:"style-name"},{ens:f,en:"page-thumbnail",ans:y,a:"style-name"},{ens:f,en:"path",ans:y,a:"style-name"},{ens:f,en:"polygon",ans:y,a:"style-name"},{ens:f,en:"polyline",ans:y,a:"style-name"},{ens:f,en:"rect",ans:y,a:"style-name"},{ens:f,en:"regular-polygon",ans:y,a:"style-name"},{ens:u,en:"annotation",ans:y,a:"style-name"}],"drawing-page":[{ens:f,en:"page",ans:f,a:"style-name"},{ens:y,en:"notes",ans:f,a:"style-name"},{ens:w,en:"handout-master",
ans:f,a:"style-name"},{ens:w,en:"master-page",ans:f,a:"style-name"}],"list-style":[{ens:t,en:"list",ans:t,a:"style-name"},{ens:t,en:"numbered-paragraph",ans:t,a:"style-name"},{ens:t,en:"list-item",ans:t,a:"style-override"},{ens:w,en:"style",ans:w,a:"list-style-name"}],data:[{ens:w,en:"style",ans:w,a:"data-style-name"},{ens:w,en:"style",ans:w,a:"percentage-data-style-name"},{ens:y,en:"date-time-decl",ans:w,a:"data-style-name"},{ens:t,en:"creation-date",ans:w,a:"data-style-name"},{ens:t,en:"creation-time",
ans:w,a:"data-style-name"},{ens:t,en:"database-display",ans:w,a:"data-style-name"},{ens:t,en:"date",ans:w,a:"data-style-name"},{ens:t,en:"editing-duration",ans:w,a:"data-style-name"},{ens:t,en:"expression",ans:w,a:"data-style-name"},{ens:t,en:"meta-field",ans:w,a:"data-style-name"},{ens:t,en:"modification-date",ans:w,a:"data-style-name"},{ens:t,en:"modification-time",ans:w,a:"data-style-name"},{ens:t,en:"print-date",ans:w,a:"data-style-name"},{ens:t,en:"print-time",ans:w,a:"data-style-name"},{ens:t,
en:"table-formula",ans:w,a:"data-style-name"},{ens:t,en:"time",ans:w,a:"data-style-name"},{ens:t,en:"user-defined",ans:w,a:"data-style-name"},{ens:t,en:"user-field-get",ans:w,a:"data-style-name"},{ens:t,en:"user-field-input",ans:w,a:"data-style-name"},{ens:t,en:"variable-get",ans:w,a:"data-style-name"},{ens:t,en:"variable-input",ans:w,a:"data-style-name"},{ens:t,en:"variable-set",ans:w,a:"data-style-name"}],"page-layout":[{ens:y,en:"notes",ans:w,a:"page-layout-name"},{ens:w,en:"handout-master",ans:w,
a:"page-layout-name"},{ens:w,en:"master-page",ans:w,a:"page-layout-name"}]},I,M=xmldom.XPath;this.collectUsedFontFaces=m;this.changeFontFaceNames=p;this.UsedStyleList=function(a,d){var b={};this.uses=function(a){var d=a.localName,c=a.getAttributeNS(f,"name")||a.getAttributeNS(w,"name");a="style"===d?a.getAttributeNS(w,"family"):a.namespaceURI===v?"data":d;return(a=b[a])?0<a[c]:!1};c(a,b);d&&q(d,b)};this.getStyleName=function(a,d){var b,f,c=I[d.localName];if(c&&(c=c[d.namespaceURI]))for(f=0;f<c.length;f+=
1)if(c[f].keyname===a&&(c=c[f],d.hasAttributeNS(c.ns,c.localname))){b=d.getAttributeNS(c.ns,c.localname);break}return b};this.hasDerivedStyles=function(a,d,b){var f=b.getAttributeNS(w,"name");b=b.getAttributeNS(w,"family");return M.getODFElementsWithXPath(a,"//style:*[@style:parent-style-name='"+f+"'][@style:family='"+b+"']",d).length?!0:!1};this.prefixStyleNames=function(a,d,b){var c;if(a){for(c=a.firstChild;c;){if(c.nodeType===Node.ELEMENT_NODE){var e=c,h=d,l=e.getAttributeNS(f,"name"),k=void 0;
l?k=f:(l=e.getAttributeNS(w,"name"))&&(k=w);k&&e.setAttributeNS(k,B[k]+"name",h+l)}c=c.nextSibling}g(a,d);b&&g(b,d)}};this.removePrefixFromStyleNames=function(a,d,b){var c=RegExp("^"+d);if(a){for(d=a.firstChild;d;){if(d.nodeType===Node.ELEMENT_NODE){var e=d,h=c,l=e.getAttributeNS(f,"name"),g=void 0;l?g=f:(l=e.getAttributeNS(w,"name"))&&(g=w);g&&(l=l.replace(h,""),e.setAttributeNS(g,B[g]+"name",l))}d=d.nextSibling}k(a,c);b&&k(b,c)}};this.determineStylesForNode=b;I=function(){var a,d,b,f,c,e={},h,l,
k,g;for(b in J)if(J.hasOwnProperty(b))for(f=J[b],d=f.length,a=0;a<d;a+=1)c=f[a],k=c.en,g=c.ens,e.hasOwnProperty(k)?h=e[k]:e[k]=h={},h.hasOwnProperty(g)?l=h[g]:h[g]=l=[],l.push({ns:c.ans,localname:c.a,keyname:b});return e}()};
// Input 27
"function"!==typeof Object.create&&(Object.create=function(g){var k=function(){};k.prototype=g;return new k});
xmldom.LSSerializer=function(){function g(b){var c=b||{},e=function(b){var a={},d;for(d in b)b.hasOwnProperty(d)&&(a[b[d]]=d);return a}(b),k=[c],g=[e],m=0;this.push=function(){m+=1;c=k[m]=Object.create(c);e=g[m]=Object.create(e)};this.pop=function(){k.pop();g.pop();m-=1;c=k[m];e=g[m]};this.getLocalNamespaceDefinitions=function(){return e};this.getQName=function(b){var a=b.namespaceURI,d=0,h;if(!a)return b.localName;if(h=e[a])return h+":"+b.localName;do{h||!b.prefix?(h="ns"+d,d+=1):h=b.prefix;if(c[h]===
a)break;if(!c[h]){c[h]=a;e[a]=h;break}h=null}while(null===h);return h+":"+b.localName}}function k(b){return b.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&apos;").replace(/"/g,"&quot;")}function b(h,g){var e="",r=c.filter?c.filter.acceptNode(g):NodeFilter.FILTER_ACCEPT,q;if(r===NodeFilter.FILTER_ACCEPT&&g.nodeType===Node.ELEMENT_NODE){h.push();q=h.getQName(g);var m,p=g.attributes,a,d,l,f="",s;m="<"+q;a=p.length;for(d=0;d<a;d+=1)l=p.item(d),"http://www.w3.org/2000/xmlns/"!==
l.namespaceURI&&(s=c.filter?c.filter.acceptNode(l):NodeFilter.FILTER_ACCEPT,s===NodeFilter.FILTER_ACCEPT&&(s=h.getQName(l),l="string"===typeof l.value?k(l.value):l.value,f+=" "+(s+'="'+l+'"')));a=h.getLocalNamespaceDefinitions();for(d in a)a.hasOwnProperty(d)&&((p=a[d])?"xmlns"!==p&&(m+=" xmlns:"+a[d]+'="'+d+'"'):m+=' xmlns="'+d+'"');e+=m+(f+">")}if(r===NodeFilter.FILTER_ACCEPT||r===NodeFilter.FILTER_SKIP){for(r=g.firstChild;r;)e+=b(h,r),r=r.nextSibling;g.nodeValue&&(e+=k(g.nodeValue))}q&&(e+="</"+
q+">",h.pop());return e}var c=this;this.filter=null;this.writeToString=function(c,k){if(!c)return"";var e=new g(k);return b(e,c)}};
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){function g(b){var a,d=r.length;for(a=0;a<d;a+=1)if("urn:oasis:names:tc:opendocument:xmlns:office:1.0"===b.namespaceURI&&b.localName===r[a])return a;return-1}function k(b,a){var d=new h.UsedStyleList(b,a),c=new odf.OdfNodeFilter;this.acceptNode=function(b){var e=c.acceptNode(b);e===NodeFilter.FILTER_ACCEPT&&b.parentNode===a&&b.nodeType===Node.ELEMENT_NODE&&(e=d.uses(b)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT);return e}}function b(b,a){var d=new k(b,a);this.acceptNode=function(a){var b=
d.acceptNode(a);b!==NodeFilter.FILTER_ACCEPT||!a.parentNode||a.parentNode.namespaceURI!==odf.Namespaces.textns||"s"!==a.parentNode.localName&&"tab"!==a.parentNode.localName||(b=NodeFilter.FILTER_REJECT);return b}}function c(b,a){if(a){var d=g(a),c,f=b.firstChild;if(-1!==d){for(;f;){c=g(f);if(-1!==c&&c>d)break;f=f.nextSibling}b.insertBefore(a,f)}}}var h=new odf.StyleInfo,n=new core.DomUtils,e=odf.Namespaces.stylens,r="meta settings scripts font-face-decls styles automatic-styles master-styles body".split(" "),
q=Date.now()+"_webodf_",m=new core.Base64;odf.ODFElement=function(){};odf.ODFDocumentElement=function(){};odf.ODFDocumentElement.prototype=new odf.ODFElement;odf.ODFDocumentElement.prototype.constructor=odf.ODFDocumentElement;odf.ODFDocumentElement.prototype.fontFaceDecls=null;odf.ODFDocumentElement.prototype.manifest=null;odf.ODFDocumentElement.prototype.settings=null;odf.ODFDocumentElement.namespaceURI="urn:oasis:names:tc:opendocument:xmlns:office:1.0";odf.ODFDocumentElement.localName="document";
odf.AnnotationElement=function(){};odf.OdfPart=function(b,a,d,c){var f=this;this.size=0;this.type=null;this.name=b;this.container=d;this.url=null;this.mimetype=a;this.onstatereadychange=this.document=null;this.EMPTY=0;this.LOADING=1;this.DONE=2;this.state=this.EMPTY;this.data="";this.load=function(){null!==c&&(this.mimetype=a,c.loadAsDataURL(b,a,function(a,b){a&&runtime.log(a);f.url=b;if(f.onchange)f.onchange(f);if(f.onstatereadychange)f.onstatereadychange(f)}))}};odf.OdfPart.prototype.load=function(){};
odf.OdfPart.prototype.getUrl=function(){return this.data?"data:;base64,"+m.toBase64(this.data):null};odf.OdfContainer=function a(d,l){function f(a){for(var b=a.firstChild,d;b;)d=b.nextSibling,b.nodeType===Node.ELEMENT_NODE?f(b):b.nodeType===Node.PROCESSING_INSTRUCTION_NODE&&a.removeChild(b),b=d}function g(a){var b={},d,c,f=a.ownerDocument.createNodeIterator(a,NodeFilter.SHOW_ELEMENT,null,!1);for(a=f.nextNode();a;)"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===a.namespaceURI&&("annotation"===
a.localName?(d=a.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0","name"))&&(b.hasOwnProperty(d)?runtime.log("Warning: annotation name used more than once with <office:annotation/>: '"+d+"'"):b[d]=a):"annotation-end"===a.localName&&((d=a.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0","name"))?b.hasOwnProperty(d)?(c=b[d],c.annotationEndElement?runtime.log("Warning: annotation name used more than once with <office:annotation-end/>: '"+d+"'"):c.annotationEndElement=
a):runtime.log("Warning: annotation end without an annotation start, name: '"+d+"'"):runtime.log("Warning: annotation end without a name found"))),a=f.nextNode()}function r(a,b){for(var d=a&&a.firstChild;d;)d.nodeType===Node.ELEMENT_NODE&&d.setAttributeNS("urn:webodf:names:scope","scope",b),d=d.nextSibling}function u(a){var b={},d;for(a=a.firstChild;a;)a.nodeType===Node.ELEMENT_NODE&&a.namespaceURI===e&&"font-face"===a.localName&&(d=a.getAttributeNS(e,"name"),b[d]=a),a=a.nextSibling;return b}function y(a,
b){var d=null,c,f,e;if(a)for(d=a.cloneNode(!0),c=d.firstElementChild;c;)f=c.nextElementSibling,(e=c.getAttributeNS("urn:webodf:names:scope","scope"))&&e!==b&&d.removeChild(c),c=f;return d}function w(a,b){var d,c,f,l=null,g={};if(a)for(b.forEach(function(a){h.collectUsedFontFaces(g,a)}),l=a.cloneNode(!0),d=l.firstElementChild;d;)c=d.nextElementSibling,f=d.getAttributeNS(e,"name"),g[f]||l.removeChild(d),d=c;return l}function z(a){var b=D.rootElement.ownerDocument,d;if(a){f(a.documentElement);try{d=
b.importNode(a.documentElement,!0)}catch(c){}}return d}function t(a){D.state=a;if(D.onchange)D.onchange(D);if(D.onstatereadychange)D.onstatereadychange(D)}function B(a){T=null;D.rootElement=a;a.fontFaceDecls=n.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","font-face-decls");a.styles=n.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","styles");a.automaticStyles=n.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","automatic-styles");a.masterStyles=
n.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","master-styles");a.body=n.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","body");a.meta=n.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","meta");a.settings=n.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","settings");a.scripts=n.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","scripts");g(a)}function J(b){var d=z(b),f=D.rootElement,e;d&&"document-styles"===
d.localName&&"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===d.namespaceURI?(f.fontFaceDecls=n.getDirectChild(d,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","font-face-decls"),c(f,f.fontFaceDecls),e=n.getDirectChild(d,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","styles"),f.styles=e||b.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0","styles"),c(f,f.styles),e=n.getDirectChild(d,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","automatic-styles"),f.automaticStyles=
e||b.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0","automatic-styles"),r(f.automaticStyles,"document-styles"),c(f,f.automaticStyles),d=n.getDirectChild(d,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","master-styles"),f.masterStyles=d||b.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0","master-styles"),c(f,f.masterStyles),h.prefixStyleNames(f.automaticStyles,q,f.masterStyles)):t(a.INVALID)}function I(b){b=z(b);var d,f,l,g;if(b&&"document-content"===b.localName&&
"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===b.namespaceURI){d=D.rootElement;l=n.getDirectChild(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","font-face-decls");if(d.fontFaceDecls&&l){g=d.fontFaceDecls;var k,m,q,I,M={};f=u(g);I=u(l);for(l=l.firstElementChild;l;){k=l.nextElementSibling;if(l.namespaceURI===e&&"font-face"===l.localName)if(m=l.getAttributeNS(e,"name"),f.hasOwnProperty(m)){if(!l.isEqualNode(f[m])){q=m;for(var ba=f,s=I,C=0,B=void 0,B=q=q.replace(/\d+$/,"");ba.hasOwnProperty(B)||
s.hasOwnProperty(B);)C+=1,B=q+C;q=B;l.setAttributeNS(e,"style:name",q);g.appendChild(l);f[q]=l;delete I[m];M[m]=q}}else g.appendChild(l),f[m]=l,delete I[m];l=k}g=M}else l&&(d.fontFaceDecls=l,c(d,l));f=n.getDirectChild(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","automatic-styles");r(f,"document-content");g&&h.changeFontFaceNames(f,g);if(d.automaticStyles&&f)for(g=f.firstChild;g;)d.automaticStyles.appendChild(g),g=f.firstChild;else f&&(d.automaticStyles=f,c(d,f));b=n.getDirectChild(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0",
"body");if(null===b)throw"<office:body/> tag is mising.";d.body=b;c(d,d.body)}else t(a.INVALID)}function M(a){a=z(a);var b;a&&"document-meta"===a.localName&&"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===a.namespaceURI&&(b=D.rootElement,b.meta=n.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","meta"),c(b,b.meta))}function C(a){a=z(a);var b;a&&"document-settings"===a.localName&&"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===a.namespaceURI&&(b=D.rootElement,b.settings=
n.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","settings"),c(b,b.settings))}function W(a){a=z(a);var b;if(a&&"manifest"===a.localName&&"urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"===a.namespaceURI)for(b=D.rootElement,b.manifest=a,a=b.manifest.firstElementChild;a;)"file-entry"===a.localName&&"urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"===a.namespaceURI&&(A[a.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0","full-path")]=a.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0",
"media-type")),a=a.nextElementSibling}function S(b){var d=b.shift();d?N.loadAsDOM(d.path,function(f,c){d.handler(c);D.state===a.INVALID?f?runtime.log("ERROR: Unable to load "+d.path+" - "+f):runtime.log("ERROR: Unable to load "+d.path):(f&&runtime.log("DEBUG: Unable to load "+d.path+" - "+f),S(b))}):(g(D.rootElement),t(a.DONE))}function V(a){var b="";odf.Namespaces.forEachPrefix(function(a,d){b+=" xmlns:"+a+'="'+d+'"'});return'<?xml version="1.0" encoding="UTF-8"?><office:'+a+" "+b+' office:version="1.2">'}
function E(){var a=new xmldom.LSSerializer,b=V("document-meta");a.filter=new odf.OdfNodeFilter;b+=a.writeToString(D.rootElement.meta,odf.Namespaces.namespaceMap);return b+"</office:document-meta>"}function ea(a,b){var d=document.createElementNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0","manifest:file-entry");d.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0","manifest:full-path",a);d.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0","manifest:media-type",
b);return d}function U(){var a=runtime.parseXML('<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"></manifest:manifest>'),b=a.documentElement,d=new xmldom.LSSerializer,f;for(f in A)A.hasOwnProperty(f)&&b.appendChild(ea(f,A[f]));d.filter=new odf.OdfNodeFilter;return'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'+d.writeToString(a,odf.Namespaces.namespaceMap)}function K(){var a,b,d,f=odf.Namespaces.namespaceMap,c=new xmldom.LSSerializer,
e=V("document-styles");b=y(D.rootElement.automaticStyles,"document-styles");d=D.rootElement.masterStyles.cloneNode(!0);a=w(D.rootElement.fontFaceDecls,[d,D.rootElement.styles,b]);h.removePrefixFromStyleNames(b,q,d);c.filter=new k(d,b);e+=c.writeToString(a,f);e+=c.writeToString(D.rootElement.styles,f);e+=c.writeToString(b,f);e+=c.writeToString(d,f);return e+"</office:document-styles>"}function L(){var a,d,f=odf.Namespaces.namespaceMap,c=new xmldom.LSSerializer,e=V("document-content");d=y(D.rootElement.automaticStyles,
"document-content");a=w(D.rootElement.fontFaceDecls,[d]);c.filter=new b(D.rootElement.body,d);e+=c.writeToString(a,f);e+=c.writeToString(d,f);e+=c.writeToString(D.rootElement.body,f);return e+"</office:document-content>"}function ba(b,d){runtime.loadXML(b,function(b,f){if(b)d(b);else{var c=z(f);c&&"document"===c.localName&&"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===c.namespaceURI?(B(c),t(a.DONE)):t(a.INVALID)}})}function X(a,b){var d;d=D.rootElement;var f=d.meta;f||(d.meta=f=document.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0",
"meta"),c(d,f));d=f;a&&n.mapKeyValObjOntoNode(d,a,odf.Namespaces.lookupNamespaceURI);b&&n.removeKeyElementsFromNode(d,b,odf.Namespaces.lookupNamespaceURI)}function R(b){function d(a,b){var f;b||(b=a);f=document.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0",b);e[a]=f;e.appendChild(f)}var f=new core.Zip("",null),c=runtime.byteArrayFromString("application/vnd.oasis.opendocument."+b,"utf8"),e=D.rootElement,h=document.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0",
b);f.save("mimetype",c,!1,new Date);d("meta");d("settings");d("scripts");d("fontFaceDecls","font-face-decls");d("styles");d("automaticStyles","automatic-styles");d("masterStyles","master-styles");d("body");e.body.appendChild(h);A["/"]="application/vnd.oasis.opendocument."+b;A["settings.xml"]="text/xml";A["meta.xml"]="text/xml";A["styles.xml"]="text/xml";A["content.xml"]="text/xml";t(a.DONE);return f}function x(){var a,b=new Date,d="";D.rootElement.settings&&D.rootElement.settings.firstElementChild&&
(a=new xmldom.LSSerializer,d=V("document-settings"),a.filter=new odf.OdfNodeFilter,d+=a.writeToString(D.rootElement.settings,odf.Namespaces.namespaceMap),d+="</office:document-settings>");(a=d)?(a=runtime.byteArrayFromString(a,"utf8"),N.save("settings.xml",a,!0,b)):N.remove("settings.xml");d=runtime.getWindow();a="WebODF/"+webodf.Version;d&&(a=a+" "+d.navigator.userAgent);X({"meta:generator":a},null);a=runtime.byteArrayFromString(E(),"utf8");N.save("meta.xml",a,!0,b);a=runtime.byteArrayFromString(K(),
"utf8");N.save("styles.xml",a,!0,b);a=runtime.byteArrayFromString(L(),"utf8");N.save("content.xml",a,!0,b);a=runtime.byteArrayFromString(U(),"utf8");N.save("META-INF/manifest.xml",a,!0,b)}function Q(a,b){x();N.writeAs(a,function(a){b(a)})}var D=this,N,A={},T,$="";this.onstatereadychange=l;this.state=this.onchange=null;this.setRootElement=B;this.getContentElement=function(){var a;T||(a=D.rootElement.body,T=n.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","text")||n.getDirectChild(a,
"urn:oasis:names:tc:opendocument:xmlns:office:1.0","presentation")||n.getDirectChild(a,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","spreadsheet"));if(!T)throw"Could not find content element in <office:body/>.";return T};this.getDocumentType=function(){var a=D.getContentElement();return a&&a.localName};this.getPart=function(a){return new odf.OdfPart(a,A[a],D,N)};this.getPartData=function(a,b){N.load(a,b)};this.setMetadata=X;this.incrementEditingCycles=function(){var a;for(a=(a=D.rootElement.meta)&&
a.firstChild;a&&(a.namespaceURI!==odf.Namespaces.metans||"editing-cycles"!==a.localName);)a=a.nextSibling;for(a=a&&a.firstChild;a&&a.nodeType!==Node.TEXT_NODE;)a=a.nextSibling;a=a?a.data:null;a=a?parseInt(a,10):0;isNaN(a)&&(a=0);X({"meta:editing-cycles":a+1},null)};this.createByteArray=function(a,b){x();N.createByteArray(a,b)};this.saveAs=Q;this.save=function(a){Q($,a)};this.getUrl=function(){return $};this.setBlob=function(a,b,d){d=m.convertBase64ToByteArray(d);N.save(a,d,!1,new Date);A.hasOwnProperty(a)&&
runtime.log(a+" has been overwritten.");A[a]=b};this.removeBlob=function(a){var b=N.remove(a);runtime.assert(b,"file is not found: "+a);delete A[a]};this.state=a.LOADING;this.rootElement=function(a){var b=document.createElementNS(a.namespaceURI,a.localName),d;a=new a.Type;for(d in a)a.hasOwnProperty(d)&&(b[d]=a[d]);return b}({Type:odf.ODFDocumentElement,namespaceURI:odf.ODFDocumentElement.namespaceURI,localName:odf.ODFDocumentElement.localName});d===odf.OdfContainer.DocumentType.TEXT?N=R("text"):
d===odf.OdfContainer.DocumentType.PRESENTATION?N=R("presentation"):d===odf.OdfContainer.DocumentType.SPREADSHEET?N=R("spreadsheet"):($=d,N=new core.Zip($,function(b,d){N=d;b?ba($,function(d){b&&(N.error=b+"\n"+d,t(a.INVALID))}):S([{path:"styles.xml",handler:J},{path:"content.xml",handler:I},{path:"meta.xml",handler:M},{path:"settings.xml",handler:C},{path:"META-INF/manifest.xml",handler:W}])}))};odf.OdfContainer.EMPTY=0;odf.OdfContainer.LOADING=1;odf.OdfContainer.DONE=2;odf.OdfContainer.INVALID=3;
odf.OdfContainer.SAVING=4;odf.OdfContainer.MODIFIED=5;odf.OdfContainer.getContainer=function(a){return new odf.OdfContainer(a,null)};return odf.OdfContainer})();odf.OdfContainer.DocumentType={TEXT:1,PRESENTATION:2,SPREADSHEET:3};
// Input 29
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
odf.OdfUtils=function(){function g(a){return"image"===(a&&a.localName)&&a.namespaceURI===E}function k(a){return null!==a&&a.nodeType===Node.ELEMENT_NODE&&"frame"===a.localName&&a.namespaceURI===E&&"as-char"===a.getAttributeNS(V,"anchor-type")}function b(a){var b;(b="annotation"===(a&&a.localName)&&a.namespaceURI===odf.Namespaces.officens)||(b="div"===(a&&a.localName)&&"annotationWrapper"===a.className);return b}function c(a){return"a"===(a&&a.localName)&&a.namespaceURI===V}function h(a){var b=a&&
a.localName;return("p"===b||"h"===b)&&a.namespaceURI===V}function n(a){for(;a&&!h(a);)a=a.parentNode;return a}function e(a){return/^[ \t\r\n]+$/.test(a)}function r(a){if(null===a||a.nodeType!==Node.ELEMENT_NODE)return!1;var b=a.localName;return/^(span|p|h|a|meta)$/.test(b)&&a.namespaceURI===V||"span"===b&&"webodf-annotationHighlight"===a.className}function q(a){var b=a&&a.localName,d=!1;b&&(a=a.namespaceURI,a===V&&(d="s"===b||"tab"===b||"line-break"===b));return d}function m(a){return q(a)||k(a)||
b(a)}function p(a){var b=a&&a.localName,d=!1;b&&(a=a.namespaceURI,a===V&&(d="s"===b));return d}function a(a){return-1!==L.indexOf(a.namespaceURI)}function d(b){if(q(b))return!1;if(a(b.parentNode)&&b.nodeType===Node.TEXT_NODE)return 0===b.textContent.length;for(b=b.firstChild;b;){if(a(b)||!d(b))return!1;b=b.nextSibling}return!0}function l(a){for(;null!==a.firstChild&&r(a);)a=a.firstChild;return a}function f(a){for(;null!==a.lastChild&&r(a);)a=a.lastChild;return a}function s(a){for(;!h(a)&&null===a.previousSibling;)a=
a.parentNode;return h(a)?null:f(a.previousSibling)}function v(a){for(;!h(a)&&null===a.nextSibling;)a=a.parentNode;return h(a)?null:l(a.nextSibling)}function u(a){for(var b=!1;a;)if(a.nodeType===Node.TEXT_NODE)if(0===a.length)a=s(a);else return!e(a.data.substr(a.length-1,1));else m(a)?(b=!1===p(a),a=null):a=s(a);return b}function y(a){var b=!1,d;for(a=a&&l(a);a;){d=a.nodeType===Node.TEXT_NODE?a.length:0;if(0<d&&!e(a.data)){b=!0;break}if(m(a)){b=!0;break}a=v(a)}return b}function w(a,b){return e(a.data.substr(b))?
!y(v(a)):!1}function z(a,b){var d=a.data,f;if(!e(d[b])||m(a.parentNode))return!1;0<b?e(d[b-1])||(f=!0):u(s(a))&&(f=!0);return!0===f?w(a,b)?!1:!0:!1}function t(a){return(a=/(-?[0-9]*[0-9][0-9]*(\.[0-9]*)?|0+\.[0-9]*[1-9][0-9]*|\.[0-9]*[1-9][0-9]*)((cm)|(mm)|(in)|(pt)|(pc)|(px)|(%))/.exec(a))?{value:parseFloat(a[1]),unit:a[3]}:null}function B(a){return(a=t(a))&&(0>a.value||"%"===a.unit)?null:a}function J(a){return(a=t(a))&&"%"!==a.unit?null:a}function I(a){switch(a.namespaceURI){case odf.Namespaces.drawns:case odf.Namespaces.svgns:case odf.Namespaces.dr3dns:return!1;
case odf.Namespaces.textns:switch(a.localName){case "note-body":case "ruby-text":return!1}break;case odf.Namespaces.officens:switch(a.localName){case "annotation":case "binary-data":case "event-listeners":return!1}break;default:switch(a.localName){case "cursor":case "editinfo":return!1}}return!0}function M(a,b){for(;0<b.length&&!K.rangeContainsNode(a,b[0]);)b.shift();for(;0<b.length&&!K.rangeContainsNode(a,b[b.length-1]);)b.pop()}function C(a,d,f){var c;c=K.getNodesInRange(a,function(a){var d=NodeFilter.FILTER_REJECT;
if(q(a.parentNode)||b(a))d=NodeFilter.FILTER_REJECT;else if(a.nodeType===Node.TEXT_NODE){if(f||Boolean(n(a)&&(!e(a.textContent)||z(a,0))))d=NodeFilter.FILTER_ACCEPT}else if(m(a))d=NodeFilter.FILTER_ACCEPT;else if(I(a)||r(a))d=NodeFilter.FILTER_SKIP;return d},NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);d||M(a,c);return c}function W(a,d,f){for(;a;){if(f(a)){d[0]!==a&&d.unshift(a);break}if(b(a))break;a=a.parentNode}}function S(a,b){var d=a;if(b<d.childNodes.length-1)d=d.childNodes[b+1];else{for(;!d.nextSibling;)d=
d.parentNode;d=d.nextSibling}for(;d.firstChild;)d=d.firstChild;return d}var V=odf.Namespaces.textns,E=odf.Namespaces.drawns,ea=odf.Namespaces.xlinkns,U=/^\s*$/,K=new core.DomUtils,L=[odf.Namespaces.dbns,odf.Namespaces.dcns,odf.Namespaces.dr3dns,odf.Namespaces.drawns,odf.Namespaces.chartns,odf.Namespaces.formns,odf.Namespaces.numberns,odf.Namespaces.officens,odf.Namespaces.presentationns,odf.Namespaces.stylens,odf.Namespaces.svgns,odf.Namespaces.tablens,odf.Namespaces.textns];this.isImage=g;this.isCharacterFrame=
k;this.isInlineRoot=b;this.isTextSpan=function(a){return"span"===(a&&a.localName)&&a.namespaceURI===V};this.isHyperlink=c;this.getHyperlinkTarget=function(a){return a.getAttributeNS(ea,"href")};this.isParagraph=h;this.getParagraphElement=n;this.isWithinTrackedChanges=function(a,b){for(;a&&a!==b;){if(a.namespaceURI===V&&"tracked-changes"===a.localName)return!0;a=a.parentNode}return!1};this.isListItem=function(a){return"list-item"===(a&&a.localName)&&a.namespaceURI===V};this.isLineBreak=function(a){return"line-break"===
(a&&a.localName)&&a.namespaceURI===V};this.isODFWhitespace=e;this.isGroupingElement=r;this.isCharacterElement=q;this.isAnchoredAsCharacterElement=m;this.isSpaceElement=p;this.isODFNode=a;this.hasNoODFContent=d;this.firstChild=l;this.lastChild=f;this.previousNode=s;this.nextNode=v;this.scanLeftForNonSpace=u;this.lookLeftForCharacter=function(a){var b,d=b=0;a.nodeType===Node.TEXT_NODE&&(d=a.length);0<d?(b=a.data,b=e(b.substr(d-1,1))?1===d?u(s(a))?2:0:e(b.substr(d-2,1))?0:2:1):m(a)&&(b=1);return b};
this.lookRightForCharacter=function(a){var b=!1,d=0;a&&a.nodeType===Node.TEXT_NODE&&(d=a.length);0<d?b=!e(a.data.substr(0,1)):m(a)&&(b=!0);return b};this.scanLeftForAnyCharacter=function(a){var b=!1,d;for(a=a&&f(a);a;){d=a.nodeType===Node.TEXT_NODE?a.length:0;if(0<d&&!e(a.data)){b=!0;break}if(m(a)){b=!0;break}a=s(a)}return b};this.scanRightForAnyCharacter=y;this.isTrailingWhitespace=w;this.isSignificantWhitespace=z;this.isDowngradableSpaceElement=function(a){return a.namespaceURI===V&&"s"===a.localName?
u(s(a))&&y(v(a)):!1};this.getFirstNonWhitespaceChild=function(a){for(a=a&&a.firstChild;a&&a.nodeType===Node.TEXT_NODE&&U.test(a.nodeValue);)a=a.nextSibling;return a};this.parseLength=t;this.parseNonNegativeLength=B;this.parseFoFontSize=function(a){var b;b=(b=t(a))&&(0>=b.value||"%"===b.unit)?null:b;return b||J(a)};this.parseFoLineHeight=function(a){return B(a)||J(a)};this.isTextContentContainingNode=I;this.getTextNodes=function(a,b){var d;d=K.getNodesInRange(a,function(a){var b=NodeFilter.FILTER_REJECT;
a.nodeType===Node.TEXT_NODE?Boolean(n(a)&&(!e(a.textContent)||z(a,0)))&&(b=NodeFilter.FILTER_ACCEPT):I(a)&&(b=NodeFilter.FILTER_SKIP);return b},NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);b||M(a,d);return d};this.getTextElements=C;this.getParagraphElements=function(a){var b;b=K.getNodesInRange(a,function(a){var b=NodeFilter.FILTER_REJECT;if(h(a))b=NodeFilter.FILTER_ACCEPT;else if(I(a)||r(a))b=NodeFilter.FILTER_SKIP;return b},NodeFilter.SHOW_ELEMENT);W(a.startContainer,b,h);return b};this.getImageElements=
function(a){var b;b=K.getNodesInRange(a,function(a){var b=NodeFilter.FILTER_SKIP;g(a)&&(b=NodeFilter.FILTER_ACCEPT);return b},NodeFilter.SHOW_ELEMENT);W(a.startContainer,b,g);return b};this.getHyperlinkElements=function(a){var b=[],d=a.cloneRange();a.collapsed&&a.endContainer.nodeType===Node.ELEMENT_NODE&&(a=S(a.endContainer,a.endOffset),a.nodeType===Node.TEXT_NODE&&d.setEnd(a,1));C(d,!0,!1).forEach(function(a){for(a=a.parentNode;!h(a);){if(c(a)&&-1===b.indexOf(a)){b.push(a);break}a=a.parentNode}});
d.detach();return b};this.getNormalizedFontFamilyName=function(a){/^(["'])(?:.|[\n\r])*?\1$/.test(a)||(a=a.replace(/^[ \t\r\n\f]*((?:.|[\n\r])*?)[ \t\r\n\f]*$/,"$1"),/[ \t\r\n\f]/.test(a)&&(a="'"+a.replace(/[ \t\r\n\f]+/g," ")+"'"));return a}};
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
gui.AnnotatableCanvas=function(){};gui.AnnotatableCanvas.prototype.refreshSize=function(){};gui.AnnotatableCanvas.prototype.getZoomLevel=function(){};gui.AnnotatableCanvas.prototype.getSizer=function(){};
gui.AnnotationViewManager=function(g,k,b,c){function h(a){var b=a.annotationEndElement,f=m.createRange(),c=a.getAttributeNS(odf.Namespaces.officens,"name");b&&(f.setStart(a,a.childNodes.length),f.setEnd(b,0),a=p.getTextNodes(f,!1),a.forEach(function(a){var b=m.createElement("span");b.className="webodf-annotationHighlight";b.setAttribute("annotation",c);a.parentNode.insertBefore(b,a);b.appendChild(a)}));f.detach()}function n(d){var c=g.getSizer();d?(b.style.display="inline-block",c.style.paddingRight=
a.getComputedStyle(b).width):(b.style.display="none",c.style.paddingRight=0);g.refreshSize()}function e(){q.sort(function(a,b){return 0!==(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING)?-1:1})}function r(){var a;for(a=0;a<q.length;a+=1){var c=q[a],f=c.parentNode,e=f.nextElementSibling,h=e.nextElementSibling,k=f.parentNode,n=0,n=q[q.indexOf(c)-1],p=void 0,c=g.getZoomLevel();f.style.left=(b.getBoundingClientRect().left-k.getBoundingClientRect().left)/c+"px";f.style.width=b.getBoundingClientRect().width/
c+"px";e.style.width=parseFloat(f.style.left)-30+"px";n&&(p=n.parentNode.getBoundingClientRect(),20>=(k.getBoundingClientRect().top-p.bottom)/c?f.style.top=Math.abs(k.getBoundingClientRect().top-p.bottom)/c+20+"px":f.style.top="0px");h.style.left=e.getBoundingClientRect().width/c+"px";var e=h.style,k=h.getBoundingClientRect().left/c,n=h.getBoundingClientRect().top/c,p=f.getBoundingClientRect().left/c,m=f.getBoundingClientRect().top/c,r=0,B=0,r=p-k,r=r*r,B=m-n,B=B*B,k=Math.sqrt(r+B);e.width=k+"px";
n=Math.asin((f.getBoundingClientRect().top-h.getBoundingClientRect().top)/(c*parseFloat(h.style.width)));h.style.transform="rotate("+n+"rad)";h.style.MozTransform="rotate("+n+"rad)";h.style.WebkitTransform="rotate("+n+"rad)";h.style.msTransform="rotate("+n+"rad)"}}var q=[],m=k.ownerDocument,p=new odf.OdfUtils,a=runtime.getWindow();runtime.assert(Boolean(a),"Expected to be run in an environment which has a global window, like a browser.");this.rerenderAnnotations=r;this.getMinimumHeightForAnnotationPane=
function(){return"none"!==b.style.display&&0<q.length?(q[q.length-1].parentNode.getBoundingClientRect().bottom-b.getBoundingClientRect().top)/g.getZoomLevel()+"px":null};this.addAnnotation=function(a){n(!0);q.push(a);e();var b=m.createElement("div"),f=m.createElement("div"),g=m.createElement("div"),k=m.createElement("div"),p;b.className="annotationWrapper";a.parentNode.insertBefore(b,a);f.className="annotationNote";f.appendChild(a);c&&(p=m.createElement("div"),p.className="annotationRemoveButton",
f.appendChild(p));g.className="annotationConnector horizontal";k.className="annotationConnector angular";b.appendChild(f);b.appendChild(g);b.appendChild(k);a.annotationEndElement&&h(a);r()};this.forgetAnnotations=function(){for(;q.length;){var a=q[0],b=q.indexOf(a),f=a.parentNode.parentNode;"div"===f.localName&&(f.parentNode.insertBefore(a,f),f.parentNode.removeChild(f));for(var a=a.getAttributeNS(odf.Namespaces.officens,"name"),a=m.querySelectorAll('span.webodf-annotationHighlight[annotation="'+
a+'"]'),c=f=void 0,f=0;f<a.length;f+=1){for(c=a.item(f);c.firstChild;)c.parentNode.insertBefore(c.firstChild,c);c.parentNode.removeChild(c)}-1!==b&&q.splice(b,1);0===q.length&&n(!1)}}};
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){function g(b,k,e,r,q){var m,p=0,a;for(a in b)if(b.hasOwnProperty(a)){if(p===e){m=a;break}p+=1}m?k.getPartData(b[m].href,function(a,l){if(a)runtime.log(a);else if(l){var f="@font-face { font-family: "+(b[m].family||m)+"; src: url(data:application/x-font-ttf;charset=binary;base64,"+c.convertUTF8ArrayToBase64(l)+') format("truetype"); }';try{r.insertRule(f,r.cssRules.length)}catch(p){runtime.log("Problem inserting rule in CSS: "+runtime.toJson(p)+"\nRule: "+f)}}else runtime.log("missing font data for "+
b[m].href);g(b,k,e+1,r,q)}):q&&q()}var k=xmldom.XPath,b=new odf.OdfUtils,c=new core.Base64;odf.FontLoader=function(){this.loadFonts=function(c,n){for(var e=c.rootElement.fontFaceDecls;n.cssRules.length;)n.deleteRule(n.cssRules.length-1);if(e){var r={},q,m,p,a;if(e)for(e=k.getODFElementsWithXPath(e,"style:font-face[svg:font-face-src]",odf.Namespaces.lookupNamespaceURI),q=0;q<e.length;q+=1)m=e[q],p=m.getAttributeNS(odf.Namespaces.stylens,"name"),a=b.getNormalizedFontFamilyName(m.getAttributeNS(odf.Namespaces.svgns,
"font-family")),m=k.getODFElementsWithXPath(m,"svg:font-face-src/svg:font-face-uri",odf.Namespaces.lookupNamespaceURI),0<m.length&&(m=m[0].getAttributeNS(odf.Namespaces.xlinkns,"href"),r[p]={href:m,family:a});g(r,c,0,n)}}};return odf.FontLoader})();
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
odf.Formatting=function(){function g(a){return(a=B[a])?z.mergeObjects({},a):{}}function k(){for(var b=a.rootElement.fontFaceDecls,d={},c,e,b=b&&b.firstElementChild;b;){if(c=b.getAttributeNS(f,"name"))if((e=b.getAttributeNS(l,"font-family"))||0<b.getElementsByTagNameNS(l,"font-face-uri").length)d[c]=e;b=b.nextElementSibling}return d}function b(b){for(var d=a.rootElement.styles.firstElementChild;d;){if(d.namespaceURI===f&&"default-style"===d.localName&&d.getAttributeNS(f,"family")===b)return d;d=d.nextElementSibling}return null}
function c(b,d,c){var e,h,g;c=c||[a.rootElement.automaticStyles,a.rootElement.styles];for(g=0;g<c.length;g+=1)for(e=c[g],e=e.firstElementChild;e;){h=e.getAttributeNS(f,"name");if(e.namespaceURI===f&&"style"===e.localName&&e.getAttributeNS(f,"family")===d&&h===b||"list-style"===d&&e.namespaceURI===s&&"list-style"===e.localName&&h===b||"data"===d&&e.namespaceURI===v&&h===b)return e;e=e.nextElementSibling}return null}function h(a){for(var b,d,c,e,h={},g=a.firstElementChild;g;){if(g.namespaceURI===f)for(c=
h[g.nodeName]={},d=g.attributes,b=0;b<d.length;b+=1)e=d.item(b),c[e.name]=e.value;g=g.nextElementSibling}d=a.attributes;for(b=0;b<d.length;b+=1)e=d.item(b),h[e.name]=e.value;return h}function n(d,e){for(var k=a.rootElement.styles,l,n={},p=d.getAttributeNS(f,"family"),m=d;m;)l=h(m),n=z.mergeObjects(l,n),m=(l=m.getAttributeNS(f,"parent-style-name"))?c(l,p,[k]):null;if(m=b(p))l=h(m),n=z.mergeObjects(l,n);!1!==e&&(l=g(p),n=z.mergeObjects(l,n));return n}function e(a,b){function c(a){Object.keys(a).forEach(function(b){Object.keys(a[b]).forEach(function(a){g+=
"|"+b+":"+a+"|"})})}for(var f=a.nodeType===Node.TEXT_NODE?a.parentNode:a,e,h=[],g="",l=!1;f;)!l&&y.isGroupingElement(f)&&(l=!0),(e=d.determineStylesForNode(f))&&h.push(e),f=f.parentNode;l&&(h.forEach(c),b&&(b[g]=h));return l?h:void 0}function r(b){var d={orderedStyles:[]};b.forEach(function(b){Object.keys(b).forEach(function(e){var h=Object.keys(b[e])[0],g={name:h,family:e,displayName:void 0,isCommonStyle:!1},l;(l=c(h,e))?(e=n(l),d=z.mergeObjects(e,d),g.displayName=l.getAttributeNS(f,"display-name"),
g.isCommonStyle=l.parentNode===a.rootElement.styles):runtime.log("No style element found for '"+h+"' of family '"+e+"'");d.orderedStyles.push(g)})});return d}function q(a,b){var d={},c=[];b||(b={});a.forEach(function(a){e(a,d)});Object.keys(d).forEach(function(a){b[a]||(b[a]=r(d[a]));c.push(b[a])});return c}function m(b){for(var d=a.rootElement.masterStyles.firstElementChild;d&&(d.namespaceURI!==f||"master-page"!==d.localName||d.getAttributeNS(f,"name")!==b);)d=d.nextElementSibling;return d}function p(a,
b){var d;a&&(d=t.convertMeasure(a,"px"));void 0===d&&b&&(d=t.convertMeasure(b,"px"));return d}var a,d=new odf.StyleInfo,l=odf.Namespaces.svgns,f=odf.Namespaces.stylens,s=odf.Namespaces.textns,v=odf.Namespaces.numberns,u=odf.Namespaces.fons,y=new odf.OdfUtils,w=new core.DomUtils,z=new core.Utils,t=new core.CSSUnits,B={paragraph:{"style:paragraph-properties":{"fo:text-align":"left"}}};this.getSystemDefaultStyleAttributes=g;this.setOdfContainer=function(b){a=b};this.getFontMap=k;this.getAvailableParagraphStyles=
function(){for(var b=a.rootElement.styles,d,c,e=[],b=b&&b.firstElementChild;b;)"style"===b.localName&&b.namespaceURI===f&&(d=b.getAttributeNS(f,"family"),"paragraph"===d&&(d=b.getAttributeNS(f,"name"),c=b.getAttributeNS(f,"display-name")||d,d&&c&&e.push({name:d,displayName:c}))),b=b.nextElementSibling;return e};this.isStyleUsed=function(b){var c,f=a.rootElement;c=d.hasDerivedStyles(f,odf.Namespaces.lookupNamespaceURI,b);b=(new d.UsedStyleList(f.styles)).uses(b)||(new d.UsedStyleList(f.automaticStyles)).uses(b)||
(new d.UsedStyleList(f.body)).uses(b);return c||b};this.getDefaultStyleElement=b;this.getStyleElement=c;this.getStyleAttributes=h;this.getInheritedStyleAttributes=n;this.getFirstCommonParentStyleNameOrSelf=function(b){var d=a.rootElement.automaticStyles,e=a.rootElement.styles,h;for(h=c(b,"paragraph",[d]);h;)b=h.getAttributeNS(f,"parent-style-name"),h=c(b,"paragraph",[d]);return(h=c(b,"paragraph",[e]))?b:null};this.hasParagraphStyle=function(a){return Boolean(c(a,"paragraph"))};this.getAppliedStyles=
q;this.getAppliedStylesForElement=function(a,b){return q([a],b)[0]};this.updateStyle=function(b,d){var c,e;w.mapObjOntoNode(b,d,odf.Namespaces.lookupNamespaceURI);(c=d["style:text-properties"]&&d["style:text-properties"]["style:font-name"])&&!k().hasOwnProperty(c)&&(e=b.ownerDocument.createElementNS(f,"style:font-face"),e.setAttributeNS(f,"style:name",c),e.setAttributeNS(l,"svg:font-family",c),a.rootElement.fontFaceDecls.appendChild(e))};this.createDerivedStyleObject=function(b,d,f){var e=c(b,d);
runtime.assert(Boolean(e),"No style element found for '"+b+"' of family '"+d+"'");b=e.parentNode===a.rootElement.styles?{"style:parent-style-name":b}:h(e);b["style:family"]=d;z.mergeObjects(b,f);return b};this.getDefaultTabStopDistance=function(){for(var a=b("paragraph"),a=a&&a.firstElementChild,d;a;)a.namespaceURI===f&&"paragraph-properties"===a.localName&&(d=a.getAttributeNS(f,"tab-stop-distance")),a=a.nextElementSibling;d||(d="1.25cm");return y.parseNonNegativeLength(d)};this.getMasterPageElement=
m;this.getContentSize=function(b,d){var e,h,g,l,k,n,r,q,s,B;a:{h=c(b,d);runtime.assert("paragraph"===d||"table"===d,"styleFamily must be either paragraph or table");if(h){if(h=h.getAttributeNS(f,"master-page-name"))(e=m(h))||runtime.log("WARN: No master page definition found for "+h);e||(e=m("Standard"));e||(e=a.rootElement.masterStyles.getElementsByTagNameNS(f,"master-page")[0])||runtime.log("WARN: Document has no master pages defined");if(e)for(h=e.getAttributeNS(f,"page-layout-name"),g=w.getElementsByTagNameNS(a.rootElement.automaticStyles,
f,"page-layout"),l=0;l<g.length;l+=1)if(e=g[l],e.getAttributeNS(f,"name")===h)break a}e=null}e||(e=w.getDirectChild(a.rootElement.styles,f,"default-page-layout"));(e=w.getDirectChild(e,f,"page-layout-properties"))?("landscape"===e.getAttributeNS(f,"print-orientation")?(h="29.7cm",g="21.001cm"):(h="21.001cm",g="29.7cm"),h=p(e.getAttributeNS(u,"page-width"),h),g=p(e.getAttributeNS(u,"page-height"),g),l=p(e.getAttributeNS(u,"margin")),void 0===l?(l=p(e.getAttributeNS(u,"margin-left"),"2cm"),k=p(e.getAttributeNS(u,
"margin-right"),"2cm"),n=p(e.getAttributeNS(u,"margin-top"),"2cm"),r=p(e.getAttributeNS(u,"margin-bottom"),"2cm")):l=k=n=r=l,q=p(e.getAttributeNS(u,"padding")),void 0===q?(q=p(e.getAttributeNS(u,"padding-left"),"0cm"),s=p(e.getAttributeNS(u,"padding-right"),"0cm"),B=p(e.getAttributeNS(u,"padding-top"),"0cm"),e=p(e.getAttributeNS(u,"padding-bottom"),"0cm")):q=s=B=e=q):(h=p("21.001cm"),g=p("29.7cm"),l=k=n=r=l=p("2cm"),q=s=B=e=q=p("0cm"));return{width:h-l-k-q-s,height:g-n-r-B-e}}};
// Input 33
/*

 Copyright (C) 2010-2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){var g=odf.Namespaces.stylens,k=odf.Namespaces.textns,b={graphic:"draw","drawing-page":"draw",paragraph:"text",presentation:"presentation",ruby:"text",section:"text",table:"table","table-cell":"table","table-column":"table","table-row":"table",text:"text",list:"text",page:"office"};odf.StyleTreeNode=function(b){this.derivedStyles={};this.element=b};odf.StyleTree=function(c,h){function n(b){var a,d,c,f={};if(!b)return f;for(b=b.firstElementChild;b;){if(d=b.namespaceURI!==g||"style"!==b.localName&&
"default-style"!==b.localName?b.namespaceURI===k&&"list-style"===b.localName?"list":b.namespaceURI!==g||"page-layout"!==b.localName&&"default-page-layout"!==b.localName?void 0:"page":b.getAttributeNS(g,"family"))(a=b.getAttributeNS(g,"name"))||(a=""),f.hasOwnProperty(d)?c=f[d]:f[d]=c={},c[a]=b;b=b.nextElementSibling}return f}function e(b,a){if(b.hasOwnProperty(a))return b[a];var d=null,c=Object.keys(b),f;for(f=0;f<c.length&&!(d=e(b[c[f]].derivedStyles,a));f+=1);return d}function r(b,a,d){var c,f,
h;if(!a.hasOwnProperty(b))return null;c=new odf.StyleTreeNode(a[b]);f=c.element.getAttributeNS(g,"parent-style-name");h=null;f&&(h=e(d,f)||r(f,a,d));h?h.derivedStyles[b]=c:d[b]=c;delete a[b];return c}function q(b,a){b&&Object.keys(b).forEach(function(d){r(d,b,a)})}var m={};this.getStyleTree=function(){return m};(function(){var e,a,d;a=n(c);d=n(h);Object.keys(b).forEach(function(b){e=m[b]={};q(a[b],e);q(d[b],e)})})()}})();
// Input 34
/*

 Copyright (C) 2010-2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){var g=odf.Namespaces.fons,k=odf.Namespaces.stylens,b=odf.Namespaces.textns,c={1:"decimal",a:"lower-latin",A:"upper-latin",i:"lower-roman",I:"upper-roman"};odf.ListStyleToCss=function(){function h(b){var c=q.parseLength(b);return c?r.convert(c.value,c.unit,"px"):(runtime.log("Could not parse value '"+b+"'."),0)}function n(b,c){try{b.insertRule(c,b.cssRules.length)}catch(a){runtime.log("cannot load rule: "+c)}}function e(c,e,a,d){e='text|list[text|style-name="'+e+'"]';var l=a.getAttributeNS(b,
"level"),f;f=a.getElementsByTagNameNS(k,"list-level-properties")[0];a=f.getAttributeNS(b,"list-level-position-and-space-mode");for(var r=f.getElementsByTagNameNS(k,"list-level-label-alignment")[0],q,u,y,w,z,l=l&&parseInt(l,10);1<l;)e+=" > text|list-item > text|list",l-=1;l=f.getAttributeNS(g,"text-align")||"left";switch(l){case "end":l="right";break;case "start":l="left"}"label-alignment"===a?(q=r.getAttributeNS(g,"margin-left")||"0px",w=r.getAttributeNS(g,"text-indent"),z=r.getAttributeNS(b,"label-followed-by"),
r=h(q)):(q=f.getAttributeNS(b,"space-before")||"0px",u=f.getAttributeNS(b,"min-label-width")||"0px",y=f.getAttributeNS(b,"min-label-distance"),r=h(q)+h(u));f=e+" > text|list-item{";f+="margin-left: "+r+"px;";f+="}";n(c,f);f=e+" > text|list-item > text|list{";f+="margin-left: "+-r+"px;";f+="}";n(c,f);f=e+" > text|list-item > *:not(text|list):first-child:before{";f+="text-align: "+l+";";f+="counter-increment:list;";f+="display: inline-block;";"label-alignment"===a?(f+="margin-left: "+w+";","space"===
z?d+=" '\\a0'":"listtab"===z&&(f+="padding-right: 0.2cm;")):(f+="min-width: "+u+";",f+="margin-left: -"+u+";",f+="padding-right: "+y+";");f+=d+";";f+="}";n(c,f)}var r=new core.CSSUnits,q=new odf.OdfUtils;this.applyListStyles=function(h,g){var a,d;(a=g.list)&&Object.keys(a).forEach(function(g){d=a[g];for(var f=d.element.firstChild,n,p;f;){if(f.namespaceURI===b)if(n=f,"list-level-style-number"===f.localName){var r=n;p=r.getAttributeNS(k,"num-format");var q=r.getAttributeNS(k,"num-suffix")||"",r=r.getAttributeNS(k,
"num-prefix")||"",w="";r&&(w+=' "'+r+'"');w=c.hasOwnProperty(p)?w+(" counter(list, "+c[p]+")"):p?w+(' "'+p+'"'):w+" ''";p="content:"+w+' "'+q+'"';e(h,g,n,p)}else"list-level-style-image"===f.localName?(p="content: none",e(h,g,n,p)):"list-level-style-bullet"===f.localName&&(p="content: '"+n.getAttributeNS(b,"bullet-char")+"'",e(h,g,n,p));f=f.nextSibling}})}}})();
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
odf.Style2CSS=function(){function g(a,b,d){var c=[];d=d.derivedStyles;var e;var h=f[a],k;void 0===h?b=null:(k=b?"["+h+'|style-name="'+b+'"]':"","presentation"===h&&(h="draw",k=b?'[presentation|style-name="'+b+'"]':""),b=h+"|"+s[a].join(k+","+h+"|")+k);null!==b&&c.push(b);for(e in d)d.hasOwnProperty(e)&&(b=g(a,e,d[e]),c=c.concat(b));return c}function k(a,b){var d="",c,f,e;for(c=0;c<b.length;c+=1)if(f=b[c],e=a.getAttributeNS(f[0],f[1])){e=e.trim();if(C.hasOwnProperty(f[1])){var h=e.indexOf(" "),g=void 0,
k=void 0;-1!==h?(g=e.substring(0,h),k=e.substring(h)):(g=e,k="");(g=S.parseLength(g))&&"pt"===g.unit&&0.75>g.value&&(e="0.75pt"+k)}f[2]&&(d+=f[2]+":"+e+";")}return d}function b(a){return(a=l.getDirectChild(a,q,"text-properties"))?S.parseFoFontSize(a.getAttributeNS(e,"font-size")):null}function c(a,b,d,c){return b+b+d+d+c+c}function h(f,m,s,C){if("page"===m){var x=C.element;s="";var Q,D;D=Q="";var N=l.getDirectChild(x,q,"page-layout-properties"),A;if(N)if(A=x.getAttributeNS(q,"name"),s+=k(N,I),(Q=
l.getDirectChild(N,q,"background-image"))&&(D=Q.getAttributeNS(a,"href"))&&(s=s+("background-image: url('odfkit:"+D+"');")+k(Q,u)),"presentation"===V)for(x=(x=l.getDirectChild(x.parentNode.parentNode,r,"master-styles"))&&x.firstElementChild;x;){if(x.namespaceURI===q&&"master-page"===x.localName&&x.getAttributeNS(q,"page-layout-name")===A){D=x.getAttributeNS(q,"name");Q="draw|page[draw|master-page-name="+D+"] {"+s+"}";D="office|body, draw|page[draw|master-page-name="+D+"] {"+k(N,M)+" }";try{f.insertRule(Q,
f.cssRules.length),f.insertRule(D,f.cssRules.length)}catch(T){throw T;}}x=x.nextElementSibling}else if("text"===V){Q="office|text {"+s+"}";D="office|body {width: "+N.getAttributeNS(e,"page-width")+";}";try{f.insertRule(Q,f.cssRules.length),f.insertRule(D,f.cssRules.length)}catch($){throw $;}}}else{s=g(m,s,C).join(",");N="";if(A=l.getDirectChild(C.element,q,"text-properties")){D=A;var ca,O,x=ca="";Q=1;A=""+k(D,v);O=D.getAttributeNS(q,"text-underline-style");"solid"===O&&(ca+=" underline");O=D.getAttributeNS(q,
"text-line-through-style");"solid"===O&&(ca+=" line-through");ca.length&&(A+="text-decoration:"+ca+";");if(ca=D.getAttributeNS(q,"font-name")||D.getAttributeNS(e,"font-family"))O=W[ca],A+="font-family: "+(O||ca)+";";O=D.parentNode;if(D=b(O)){for(;O;){if(D=b(O)){if("%"!==D.unit){x="font-size: "+D.value*Q+D.unit+";";break}Q*=D.value/100}D=O;ca=O="";O=null;"default-style"===D.localName?O=null:(O=D.getAttributeNS(q,"parent-style-name"),ca=D.getAttributeNS(q,"family"),O=U.getODFElementsWithXPath(E,O?"//style:*[@style:name='"+
O+"'][@style:family='"+ca+"']":"//style:default-style[@style:family='"+ca+"']",odf.Namespaces.lookupNamespaceURI)[0])}x||(x="font-size: "+parseFloat(ea)*Q+K.getUnits(ea)+";");A+=x}N+=A}if(A=l.getDirectChild(C.element,q,"paragraph-properties"))x=A,A=""+k(x,y),(Q=l.getDirectChild(x,q,"background-image"))&&(D=Q.getAttributeNS(a,"href"))&&(A=A+("background-image: url('odfkit:"+D+"');")+k(Q,u)),(x=x.getAttributeNS(e,"line-height"))&&"normal"!==x&&(x=S.parseFoLineHeight(x),A="%"!==x.unit?A+("line-height: "+
x.value+x.unit+";"):A+("line-height: "+x.value/100+";")),N+=A;if(A=l.getDirectChild(C.element,q,"graphic-properties"))D=A,A=""+k(D,w),x=D.getAttributeNS(n,"opacity"),Q=D.getAttributeNS(n,"fill"),D=D.getAttributeNS(n,"fill-color"),"solid"===Q||"hatch"===Q?D&&"none"!==D?(x=isNaN(parseFloat(x))?1:parseFloat(x)/100,Q=D.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,c),(D=(Q=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(Q))?{r:parseInt(Q[1],16),g:parseInt(Q[2],16),b:parseInt(Q[3],16)}:null)&&(A+="background-color: rgba("+
D.r+","+D.g+","+D.b+","+x+");")):A+="background: none;":"none"===Q&&(A+="background: none;"),N+=A;if(A=l.getDirectChild(C.element,q,"drawing-page-properties"))x=""+k(A,w),"true"===A.getAttributeNS(d,"background-visible")&&(x+="background: none;"),N+=x;if(A=l.getDirectChild(C.element,q,"table-cell-properties"))A=""+k(A,z),N+=A;if(A=l.getDirectChild(C.element,q,"table-row-properties"))A=""+k(A,B),N+=A;if(A=l.getDirectChild(C.element,q,"table-column-properties"))A=""+k(A,t),N+=A;if(A=l.getDirectChild(C.element,
q,"table-properties"))x=A,A=""+k(x,J),x=x.getAttributeNS(p,"border-model"),"collapsing"===x?A+="border-collapse:collapse;":"separating"===x&&(A+="border-collapse:separate;"),N+=A;if(0!==N.length)try{f.insertRule(s+"{"+N+"}",f.cssRules.length)}catch(G){throw G;}}for(var ga in C.derivedStyles)C.derivedStyles.hasOwnProperty(ga)&&h(f,m,ga,C.derivedStyles[ga])}var n=odf.Namespaces.drawns,e=odf.Namespaces.fons,r=odf.Namespaces.officens,q=odf.Namespaces.stylens,m=odf.Namespaces.svgns,p=odf.Namespaces.tablens,
a=odf.Namespaces.xlinkns,d=odf.Namespaces.presentationns,l=new core.DomUtils,f={graphic:"draw","drawing-page":"draw",paragraph:"text",presentation:"presentation",ruby:"text",section:"text",table:"table","table-cell":"table","table-column":"table","table-row":"table",text:"text",list:"text",page:"office"},s={graphic:"circle connected control custom-shape ellipse frame g line measure page page-thumbnail path polygon polyline rect regular-polygon".split(" "),paragraph:"alphabetical-index-entry-template h illustration-index-entry-template index-source-style object-index-entry-template p table-index-entry-template table-of-content-entry-template user-index-entry-template".split(" "),
presentation:"caption circle connector control custom-shape ellipse frame g line measure page-thumbnail path polygon polyline rect regular-polygon".split(" "),"drawing-page":"caption circle connector control page custom-shape ellipse frame g line measure page-thumbnail path polygon polyline rect regular-polygon".split(" "),ruby:["ruby","ruby-text"],section:"alphabetical-index bibliography illustration-index index-title object-index section table-of-content table-index user-index".split(" "),table:["background",
"table"],"table-cell":"body covered-table-cell even-columns even-rows first-column first-row last-column last-row odd-columns odd-rows table-cell".split(" "),"table-column":["table-column"],"table-row":["table-row"],text:"a index-entry-chapter index-entry-link-end index-entry-link-start index-entry-page-number index-entry-span index-entry-tab-stop index-entry-text index-title-template linenumbering-configuration list-level-style-number list-level-style-bullet outline-level-style span".split(" "),
list:["list-item"]},v=[[e,"color","color"],[e,"background-color","background-color"],[e,"font-weight","font-weight"],[e,"font-style","font-style"]],u=[[q,"repeat","background-repeat"]],y=[[e,"background-color","background-color"],[e,"text-align","text-align"],[e,"text-indent","text-indent"],[e,"padding","padding"],[e,"padding-left","padding-left"],[e,"padding-right","padding-right"],[e,"padding-top","padding-top"],[e,"padding-bottom","padding-bottom"],[e,"border-left","border-left"],[e,"border-right",
"border-right"],[e,"border-top","border-top"],[e,"border-bottom","border-bottom"],[e,"margin","margin"],[e,"margin-left","margin-left"],[e,"margin-right","margin-right"],[e,"margin-top","margin-top"],[e,"margin-bottom","margin-bottom"],[e,"border","border"]],w=[[e,"background-color","background-color"],[e,"min-height","min-height"],[n,"stroke","border"],[m,"stroke-color","border-color"],[m,"stroke-width","border-width"],[e,"border","border"],[e,"border-left","border-left"],[e,"border-right","border-right"],
[e,"border-top","border-top"],[e,"border-bottom","border-bottom"]],z=[[e,"background-color","background-color"],[e,"border-left","border-left"],[e,"border-right","border-right"],[e,"border-top","border-top"],[e,"border-bottom","border-bottom"],[e,"border","border"]],t=[[q,"column-width","width"]],B=[[q,"row-height","height"],[e,"keep-together",null]],J=[[q,"width","width"],[e,"margin-left","margin-left"],[e,"margin-right","margin-right"],[e,"margin-top","margin-top"],[e,"margin-bottom","margin-bottom"]],
I=[[e,"background-color","background-color"],[e,"padding","padding"],[e,"padding-left","padding-left"],[e,"padding-right","padding-right"],[e,"padding-top","padding-top"],[e,"padding-bottom","padding-bottom"],[e,"border","border"],[e,"border-left","border-left"],[e,"border-right","border-right"],[e,"border-top","border-top"],[e,"border-bottom","border-bottom"],[e,"margin","margin"],[e,"margin-left","margin-left"],[e,"margin-right","margin-right"],[e,"margin-top","margin-top"],[e,"margin-bottom","margin-bottom"]],
M=[[e,"page-width","width"],[e,"page-height","height"]],C={border:!0,"border-left":!0,"border-right":!0,"border-top":!0,"border-bottom":!0,"stroke-width":!0},W={},S=new odf.OdfUtils,V,E,ea,U=xmldom.XPath,K=new core.CSSUnits;this.style2css=function(a,b,d,c,e){var g,k,l;for(E=b;d.cssRules.length;)d.deleteRule(d.cssRules.length-1);odf.Namespaces.forEachPrefix(function(a,b){g="@namespace "+a+" url("+b+");";try{d.insertRule(g,d.cssRules.length)}catch(c){}});W=c;V=a;ea=runtime.getWindow().getComputedStyle(document.body,
null).getPropertyValue("font-size")||"12pt";for(l in f)if(f.hasOwnProperty(l))for(k in a=e[l],a)a.hasOwnProperty(k)&&h(d,l,k,a[k])}};
// Input 36
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){function g(k,b){var c=this;this.getDistance=function(b){var g=c.x-b.x;b=c.y-b.y;return Math.sqrt(g*g+b*b)};this.getCenter=function(b){return new g((c.x+b.x)/2,(c.y+b.y)/2)};c.x=k;c.y=b}gui.ZoomHelper=function(){function k(a,b,c,f){a=f?"translate3d("+a+"px, "+b+"px, 0) scale3d("+c+", "+c+", 1)":"translate("+a+"px, "+b+"px) scale("+c+")";d.style.WebkitTransform=a;d.style.MozTransform=a;d.style.msTransform=a;d.style.OTransform=a;d.style.transform=a}function b(a){a?k(-l.x,-l.y,v,!0):(k(0,
0,v,!0),k(0,0,v,!1))}function c(a){if(w&&J){var b=w.style.overflow,d=w.classList.contains("webodf-customScrollbars");a&&d||!a&&!d||(a?(w.classList.add("webodf-customScrollbars"),w.style.overflow="hidden",runtime.requestAnimationFrame(function(){w.style.overflow=b})):w.classList.remove("webodf-customScrollbars"))}}function h(){k(-l.x,-l.y,v,!0);w.scrollLeft=0;w.scrollTop=0;c(!1)}function n(){k(0,0,v,!0);w.scrollLeft=l.x;w.scrollTop=l.y;c(!0)}function e(a){return new g(a.pageX-d.offsetLeft,a.pageY-
d.offsetTop)}function r(a){f&&(l.x-=a.x-f.x,l.y-=a.y-f.y,l=new g(Math.min(Math.max(l.x,d.offsetLeft),(d.offsetLeft+d.offsetWidth)*v-w.clientWidth),Math.min(Math.max(l.y,d.offsetTop),(d.offsetTop+d.offsetHeight)*v-w.clientHeight)));f=a}function q(a){var b=a.touches.length,d=0<b?e(a.touches[0]):null;a=1<b?e(a.touches[1]):null;d&&a?(s=d.getDistance(a),u=v,f=d.getCenter(a),h(),B=t.PINCH):d&&(f=d,B=t.SCROLL)}function m(a){var c=a.touches.length,f=0<c?e(a.touches[0]):null,c=1<c?e(a.touches[1]):null;if(f&&
c)if(a.preventDefault(),B===t.SCROLL)B=t.PINCH,h(),s=f.getDistance(c);else{a=f.getCenter(c);f=f.getDistance(c)/s;r(a);var c=v,g=Math.min(y,d.offsetParent.clientWidth/d.offsetWidth);v=u*f;v=Math.min(Math.max(v,g),y);f=v/c;l.x+=(f-1)*(a.x+l.x);l.y+=(f-1)*(a.y+l.y);b(!0)}else f&&(B===t.PINCH?(B=t.SCROLL,n()):r(f))}function p(){B===t.PINCH&&(z.emit(gui.ZoomHelper.signalZoomChanged,v),n(),b(!1));B=t.NONE}function a(){w&&(w.removeEventListener("touchstart",q,!1),w.removeEventListener("touchmove",m,!1),
w.removeEventListener("touchend",p,!1))}var d,l,f,s,v,u,y=4,w,z=new core.EventNotifier([gui.ZoomHelper.signalZoomChanged]),t={NONE:0,SCROLL:1,PINCH:2},B=t.NONE,J=runtime.getWindow().hasOwnProperty("ontouchstart");this.subscribe=function(a,b){z.subscribe(a,b)};this.unsubscribe=function(a,b){z.unsubscribe(a,b)};this.getZoomLevel=function(){return v};this.setZoomLevel=function(a){d&&(v=a,b(!1),z.emit(gui.ZoomHelper.signalZoomChanged,v))};this.destroy=function(b){a();c(!1);b()};this.setZoomableElement=
function(f){a();d=f;w=d.offsetParent;b(!1);w&&(w.addEventListener("touchstart",q,!1),w.addEventListener("touchmove",m,!1),w.addEventListener("touchend",p,!1));c(!0)};u=v=1;l=new g(0,0)};gui.ZoomHelper.signalZoomChanged="zoomChanged"})();
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.Canvas=function(){};ops.Canvas.prototype.getZoomLevel=function(){};ops.Canvas.prototype.getElement=function(){};ops.Canvas.prototype.getSizer=function(){};ops.Canvas.prototype.getZoomHelper=function(){};
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){function g(){function a(c){d=!0;runtime.setTimeout(function(){try{c()}catch(f){runtime.log(String(f))}d=!1;0<b.length&&a(b.pop())},10)}var b=[],d=!1;this.clearQueue=function(){b.length=0};this.addToQueue=function(c){if(0===b.length&&!d)return a(c);b.push(c)}}function k(a){function b(){for(;0<d.cssRules.length;)d.deleteRule(0);d.insertRule("#shadowContent draw|page {display:none;}",0);d.insertRule("office|presentation draw|page {display:none;}",1);d.insertRule("#shadowContent draw|page:nth-of-type("+
c+") {display:block;}",2);d.insertRule("office|presentation draw|page:nth-of-type("+c+") {display:block;}",3)}var d=a.sheet,c=1;this.showFirstPage=function(){c=1;b()};this.showNextPage=function(){c+=1;b()};this.showPreviousPage=function(){1<c&&(c-=1,b())};this.showPage=function(a){0<a&&(c=a,b())};this.css=a;this.destroy=function(b){a.parentNode.removeChild(a);b()}}function b(a){for(;a.firstChild;)a.removeChild(a.firstChild)}function c(a){a=a.sheet;for(var b=a.cssRules;b.length;)a.deleteRule(b.length-
1)}function h(a,b,d){var c=new odf.Style2CSS,f=new odf.ListStyleToCss;d=d.sheet;var e=(new odf.StyleTree(a.rootElement.styles,a.rootElement.automaticStyles)).getStyleTree();c.style2css(a.getDocumentType(),a.rootElement,d,b.getFontMap(),e);f.applyListStyles(d,e)}function n(a,b,d){var c=null;a=a.rootElement.body.getElementsByTagNameNS(C,d+"-decl");d=b.getAttributeNS(C,"use-"+d+"-name");var f;if(d&&0<a.length)for(b=0;b<a.length;b+=1)if(f=a[b],f.getAttributeNS(C,"name")===d){c=f.textContent;break}return c}
function e(a,d,c,f){var e=a.ownerDocument;d=a.getElementsByTagNameNS(d,c);for(a=0;a<d.length;a+=1)b(d[a]),f&&(c=d[a],c.appendChild(e.createTextNode(f)))}function r(a,b,d){b.setAttributeNS("urn:webodf:names:helper","styleid",a);var c,f=b.getAttributeNS(J,"anchor-type"),e=b.getAttributeNS(t,"x"),h=b.getAttributeNS(t,"y"),g=b.getAttributeNS(t,"width"),k=b.getAttributeNS(t,"height"),l=b.getAttributeNS(y,"min-height"),n=b.getAttributeNS(y,"min-width");if("as-char"===f)c="display: inline-block;";else if(f||
e||h)c="position: absolute;";else if(g||k||l||n)c="display: block;";e&&(c+="left: "+e+";");h&&(c+="top: "+h+";");g&&(c+="width: "+g+";");k&&(c+="height: "+k+";");l&&(c+="min-height: "+l+";");n&&(c+="min-width: "+n+";");c&&(c="draw|"+b.localName+'[webodfhelper|styleid="'+a+'"] {'+c+"}",d.insertRule(c,d.cssRules.length))}function q(a){for(a=a.firstChild;a;){if(a.namespaceURI===w&&"binary-data"===a.localName)return"data:image/png;base64,"+a.textContent.replace(/[\r\n\s]/g,"");a=a.nextSibling}return""}
function m(a,b,d,c){function f(b){b&&(b='draw|image[webodfhelper|styleid="'+a+'"] {'+("background-image: url("+b+");")+"}",c.insertRule(b,c.cssRules.length))}function e(a){f(a.url)}d.setAttributeNS("urn:webodf:names:helper","styleid",a);var h=d.getAttributeNS(I,"href"),g;if(h)try{g=b.getPart(h),g.onchange=e,g.load()}catch(k){runtime.log("slight problem: "+String(k))}else h=q(d),f(h)}function p(a){var b=a.ownerDocument;E.getElementsByTagNameNS(a,J,"line-break").forEach(function(a){a.hasChildNodes()||
a.appendChild(b.createElement("br"))})}function a(a){var b=a.ownerDocument;E.getElementsByTagNameNS(a,J,"s").forEach(function(a){for(var d,c;a.firstChild;)a.removeChild(a.firstChild);a.appendChild(b.createTextNode(" "));c=parseInt(a.getAttributeNS(J,"c"),10);if(1<c)for(a.removeAttributeNS(J,"c"),d=1;d<c;d+=1)a.parentNode.insertBefore(a.cloneNode(!0),a)})}function d(a){E.getElementsByTagNameNS(a,J,"tab").forEach(function(a){a.textContent="\t"})}function l(a,b){function d(a,c){var h=g.documentElement.namespaceURI;
"video/"===c.substr(0,6)?(f=g.createElementNS(h,"video"),f.setAttribute("controls","controls"),e=g.createElementNS(h,"source"),a&&e.setAttribute("src",a),e.setAttribute("type",c),f.appendChild(e),b.parentNode.appendChild(f)):b.innerHtml="Unrecognised Plugin"}function c(a){d(a.url,a.mimetype)}var f,e,h,g=b.ownerDocument,k;if(h=b.getAttributeNS(I,"href"))try{k=a.getPart(h),k.onchange=c,k.load()}catch(l){runtime.log("slight problem: "+String(l))}else runtime.log("using MP4 data fallback"),h=q(b),d(h,
"video/mp4")}function f(a){var b=a.getElementsByTagName("head")[0],d,c;d=a.styleSheets.length;for(c=b.firstElementChild;c&&("style"!==c.localName||!c.hasAttribute("webodfcss"));)c=c.nextElementSibling;if(c)return d=parseInt(c.getAttribute("webodfcss"),10),c.setAttribute("webodfcss",d+1),c;"string"===String(typeof webodf_css)?d=webodf_css:(c="webodf.css",runtime.currentDirectory&&(c=runtime.currentDirectory(),0<c.length&&"/"!==c.substr(-1)&&(c+="/"),c+="../webodf.css"),d=runtime.readFileSync(c,"utf-8"));
c=a.createElementNS(b.namespaceURI,"style");c.setAttribute("media","screen, print, handheld, projection");c.setAttribute("type","text/css");c.setAttribute("webodfcss","1");c.appendChild(a.createTextNode(d));b.appendChild(c);return c}function s(a){var b=parseInt(a.getAttribute("webodfcss"),10);1===b?a.parentNode.removeChild(a):a.setAttribute("count",b-1)}function v(a){var b=a.getElementsByTagName("head")[0],d=a.createElementNS(b.namespaceURI,"style"),c="";d.setAttribute("type","text/css");d.setAttribute("media",
"screen, print, handheld, projection");odf.Namespaces.forEachPrefix(function(a,b){c+="@namespace "+a+" url("+b+");\n"});c+="@namespace webodfhelper url(urn:webodf:names:helper);\n";d.appendChild(a.createTextNode(c));b.appendChild(d);return d}var u=odf.Namespaces.drawns,y=odf.Namespaces.fons,w=odf.Namespaces.officens,z=odf.Namespaces.stylens,t=odf.Namespaces.svgns,B=odf.Namespaces.tablens,J=odf.Namespaces.textns,I=odf.Namespaces.xlinkns,M=odf.Namespaces.xmlns,C=odf.Namespaces.presentationns,W=runtime.getWindow(),
S=xmldom.XPath,V=new odf.OdfUtils,E=new core.DomUtils;odf.OdfCanvas=function(q){function I(a,b,d){function c(a,b,d,f){fa.addToQueue(function(){m(a,b,d,f)})}var f,e;f=b.getElementsByTagNameNS(u,"image");for(b=0;b<f.length;b+=1)e=f.item(b),c("image"+String(b),a,e,d)}function t(a,b){function d(a,b){fa.addToQueue(function(){l(a,b)})}var c,f,e;f=b.getElementsByTagNameNS(u,"plugin");for(c=0;c<f.length;c+=1)e=f.item(c),d(a,e)}function y(){var a;a=T.firstChild;var b=aa.getZoomLevel();a&&(T.style.WebkitTransformOrigin=
"0% 0%",T.style.MozTransformOrigin="0% 0%",T.style.msTransformOrigin="0% 0%",T.style.OTransformOrigin="0% 0%",T.style.transformOrigin="0% 0%",G&&((a=G.getMinimumHeightForAnnotationPane())?T.style.minHeight=a:T.style.removeProperty("min-height")),q.style.width=Math.round(b*T.offsetWidth)+"px",q.style.height=Math.round(b*T.offsetHeight)+"px")}function ba(a){ca?($.parentNode||T.appendChild($),G&&G.forgetAnnotations(),G=new gui.AnnotationViewManager(x,a.body,$,O),E.getElementsByTagNameNS(a.body,w,"annotation").forEach(G.addAnnotation),
G.rerenderAnnotations(),y()):$.parentNode&&(T.removeChild($),G.forgetAnnotations(),y())}function X(f){function g(){c(la);c(Z);c(da);b(q);q.style.display="inline-block";var k=D.rootElement;q.ownerDocument.importNode(k,!0);N.setOdfContainer(D);var l=D,m=la;(new odf.FontLoader).loadFonts(l,m.sheet);h(D,N,Z);m=D;l=da.sheet;b(q);T=Q.createElementNS(q.namespaceURI,"div");T.style.display="inline-block";T.style.background="white";T.style.setProperty("float","left","important");T.appendChild(k);q.appendChild(T);
$=Q.createElementNS(q.namespaceURI,"div");$.id="annotationsPane";ja=Q.createElementNS(q.namespaceURI,"div");ja.id="shadowContent";ja.style.position="absolute";ja.style.top=0;ja.style.left=0;m.getContentElement().appendChild(ja);var s=k.body,v,x=[],y;for(v=s.firstElementChild;v&&v!==s;)if(v.namespaceURI===u&&(x[x.length]=v),v.firstElementChild)v=v.firstElementChild;else{for(;v&&v!==s&&!v.nextElementSibling;)v=v.parentNode;v&&v.nextElementSibling&&(v=v.nextElementSibling)}for(y=0;y<x.length;y+=1)v=
x[y],r("frame"+String(y),v,l);x=S.getODFElementsWithXPath(s,".//*[*[@text:anchor-type='paragraph']]",odf.Namespaces.lookupNamespaceURI);for(v=0;v<x.length;v+=1)s=x[v],s.setAttributeNS&&s.setAttributeNS("urn:webodf:names:helper","containsparagraphanchor",!0);s=N;v=ja;var E,X,L,A;A=0;var R,G;y=m.rootElement.ownerDocument;if((x=k.body.firstElementChild)&&x.namespaceURI===w&&("presentation"===x.localName||"drawing"===x.localName))for(x=x.firstElementChild;x;){E=x.getAttributeNS(u,"master-page-name");
if(E=s.getMasterPageElement(E)){X=x.getAttributeNS("urn:webodf:names:helper","styleid");L=y.createElementNS(u,"draw:page");G=E.firstElementChild;for(R=0;G;)"true"!==G.getAttributeNS(C,"placeholder")&&(A=G.cloneNode(!0),L.appendChild(A),r(X+"_"+R,A,l)),G=G.nextElementSibling,R+=1;G=R=A=void 0;var O=L.getElementsByTagNameNS(u,"frame");for(A=0;A<O.length;A+=1)R=O[A],(G=R.getAttributeNS(C,"class"))&&!/^(date-time|footer|header|page-number)$/.test(G)&&R.parentNode.removeChild(R);v.appendChild(L);A=String(v.getElementsByTagNameNS(u,
"page").length);e(L,J,"page-number",A);e(L,C,"header",n(m,x,"header"));e(L,C,"footer",n(m,x,"footer"));r(X,L,l);L.setAttributeNS(u,"draw:master-page-name",E.getAttributeNS(z,"name"))}x=x.nextElementSibling}s=q.namespaceURI;x=k.body.getElementsByTagNameNS(B,"table-cell");for(v=0;v<x.length;v+=1)y=x.item(v),y.hasAttributeNS(B,"number-columns-spanned")&&y.setAttributeNS(s,"colspan",y.getAttributeNS(B,"number-columns-spanned")),y.hasAttributeNS(B,"number-rows-spanned")&&y.setAttributeNS(s,"rowspan",y.getAttributeNS(B,
"number-rows-spanned"));p(k.body);a(k.body);d(k.body);I(m,k.body,l);t(m,k.body);y=k.body;m=q.namespaceURI;v={};var x={},Y;E=W.document.getElementsByTagNameNS(J,"list-style");for(s=0;s<E.length;s+=1)A=E.item(s),(R=A.getAttributeNS(z,"name"))&&(x[R]=A);y=y.getElementsByTagNameNS(J,"list");for(s=0;s<y.length;s+=1)if(A=y.item(s),E=A.getAttributeNS(M,"id")){X=A.getAttributeNS(J,"continue-list");A.setAttributeNS(m,"id",E);L="text|list#"+E+" > text|list-item > *:first-child:before {";if(R=A.getAttributeNS(J,
"style-name"))A=x[R],Y=V.getFirstNonWhitespaceChild(A),A=void 0,Y&&("list-level-style-number"===Y.localName?(A=Y.getAttributeNS(z,"num-format"),R=Y.getAttributeNS(z,"num-suffix")||"",G="",G={1:"decimal",a:"lower-latin",A:"upper-latin",i:"lower-roman",I:"upper-roman"},O=void 0,O=Y.getAttributeNS(z,"num-prefix")||"",O=G.hasOwnProperty(A)?O+(" counter(list, "+G[A]+")"):A?O+("'"+A+"';"):O+" ''",R&&(O+=" '"+R+"'"),A=G="content: "+O+";"):"list-level-style-image"===Y.localName?A="content: none;":"list-level-style-bullet"===
Y.localName&&(A="content: '"+Y.getAttributeNS(J,"bullet-char")+"';")),Y=A;if(X){for(A=v[X];A;)A=v[A];L+="counter-increment:"+X+";";Y?(Y=Y.replace("list",X),L+=Y):L+="content:counter("+X+");"}else X="",Y?(Y=Y.replace("list",E),L+=Y):L+="content: counter("+E+");",L+="counter-increment:"+E+";",l.insertRule("text|list#"+E+" {counter-reset:"+E+"}",l.cssRules.length);L+="}";v[E]=X;L&&l.insertRule(L,l.cssRules.length)}T.insertBefore(ja,T.firstChild);aa.setZoomableElement(T);ba(k);if(!f&&(k=[D],ka.hasOwnProperty("statereadychange")))for(l=
ka.statereadychange,Y=0;Y<l.length;Y+=1)l[Y].apply(null,k)}D.state===odf.OdfContainer.DONE?g():(runtime.log("WARNING: refreshOdf called but ODF was not DONE."),ha=runtime.setTimeout(function F(){D.state===odf.OdfContainer.DONE?g():(runtime.log("will be back later..."),ha=runtime.setTimeout(F,500))},100))}function R(a){fa.clearQueue();q.innerHTML=runtime.tr("Loading")+" "+a+"...";q.removeAttribute("style");D=new odf.OdfContainer(a,function(a){D=a;X(!1)})}runtime.assert(null!==q&&void 0!==q,"odf.OdfCanvas constructor needs DOM element");
runtime.assert(null!==q.ownerDocument&&void 0!==q.ownerDocument,"odf.OdfCanvas constructor needs DOM");var x=this,Q=q.ownerDocument,D,N=new odf.Formatting,A,T=null,$=null,ca=!1,O=!1,G=null,ga,la,Z,da,ja,ka={},ha,ia,ma=!1,na=!1,fa=new g,aa=new gui.ZoomHelper;this.refreshCSS=function(){ma=!0;ia.trigger()};this.refreshSize=function(){ia.trigger()};this.odfContainer=function(){return D};this.setOdfContainer=function(a,b){D=a;X(!0===b)};this.load=this.load=R;this.save=function(a){D.save(a)};this.addListener=
function(a,b){switch(a){case "click":var d=q,c=a;d.addEventListener?d.addEventListener(c,b,!1):d.attachEvent?d.attachEvent("on"+c,b):d["on"+c]=b;break;default:d=ka.hasOwnProperty(a)?ka[a]:ka[a]=[],b&&-1===d.indexOf(b)&&d.push(b)}};this.getFormatting=function(){return N};this.getAnnotationViewManager=function(){return G};this.refreshAnnotations=function(){ba(D.rootElement)};this.rerenderAnnotations=function(){G&&(na=!0,ia.trigger())};this.getSizer=function(){return T};this.enableAnnotations=function(a,
b){a!==ca&&(ca=a,O=b,D&&ba(D.rootElement))};this.addAnnotation=function(a){G&&(G.addAnnotation(a),y())};this.forgetAnnotations=function(){G&&(G.forgetAnnotations(),y())};this.getZoomHelper=function(){return aa};this.setZoomLevel=function(a){aa.setZoomLevel(a)};this.getZoomLevel=function(){return aa.getZoomLevel()};this.fitToContainingElement=function(a,b){var d=aa.getZoomLevel(),c=q.offsetHeight/d,d=a/(q.offsetWidth/d);b/c<d&&(d=b/c);aa.setZoomLevel(d)};this.fitToWidth=function(a){var b=q.offsetWidth/
aa.getZoomLevel();aa.setZoomLevel(a/b)};this.fitSmart=function(a,b){var d,c;c=aa.getZoomLevel();d=q.offsetWidth/c;c=q.offsetHeight/c;d=a/d;void 0!==b&&b/c<d&&(d=b/c);aa.setZoomLevel(Math.min(1,d))};this.fitToHeight=function(a){var b=q.offsetHeight/aa.getZoomLevel();aa.setZoomLevel(a/b)};this.showFirstPage=function(){A.showFirstPage()};this.showNextPage=function(){A.showNextPage()};this.showPreviousPage=function(){A.showPreviousPage()};this.showPage=function(a){A.showPage(a);y()};this.getElement=function(){return q};
this.addCssForFrameWithImage=function(a){var b=a.getAttributeNS(u,"name"),d=a.firstElementChild;r(b,a,da.sheet);d&&m(b+"img",D,d,da.sheet)};this.destroy=function(a){var b=Q.getElementsByTagName("head")[0],d=[A.destroy,ia.destroy];runtime.clearTimeout(ha);$&&$.parentNode&&$.parentNode.removeChild($);aa.destroy(function(){T&&(q.removeChild(T),T=null)});s(ga);b.removeChild(la);b.removeChild(Z);b.removeChild(da);core.Async.destroyAll(d,a)};ga=f(Q);A=new k(v(Q));la=v(Q);Z=v(Q);da=v(Q);ia=core.Task.createRedrawTask(function(){ma&&
(h(D,N,Z),ma=!1);na&&(G&&G.rerenderAnnotations(),na=!1);y()});aa.subscribe(gui.ZoomHelper.signalZoomChanged,y)}})();
// Input 39
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.MemberProperties=function(){};
ops.Member=function(g,k){var b=new ops.MemberProperties;this.getMemberId=function(){return g};this.getProperties=function(){return b};this.setProperties=function(c){Object.keys(c).forEach(function(h){b[h]=c[h]})};this.removeProperties=function(c){Object.keys(c).forEach(function(c){"fullName"!==c&&"color"!==c&&"imageUrl"!==c&&b.hasOwnProperty(c)&&delete b[c]})};runtime.assert(Boolean(g),"No memberId was supplied!");k.fullName||(k.fullName=runtime.tr("Unknown Author"));k.color||(k.color="black");k.imageUrl||
(k.imageUrl="avatar-joe.png");b=k};
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
gui.SelectionMover=function(g,k){function b(){p.setUnfilteredPosition(g.getNode(),0);return p}function c(a,b){var c,e=null;a&&0<a.length&&(c=b?a.item(a.length-1):a.item(0));c&&(e={top:c.top,left:b?c.right:c.left,bottom:c.bottom});return e}function h(a,b,f,e){var g=a.nodeType;f.setStart(a,b);f.collapse(!e);e=c(f.getClientRects(),!0===e);!e&&0<b&&(f.setStart(a,b-1),f.setEnd(a,b),e=c(f.getClientRects(),!0));e||(g===Node.ELEMENT_NODE&&0<b&&a.childNodes.length>=b?e=h(a,b-1,f,!0):a.nodeType===Node.TEXT_NODE&&
0<b?e=h(a,b-1,f,!0):a.previousSibling?e=h(a.previousSibling,a.previousSibling.nodeType===Node.TEXT_NODE?a.previousSibling.textContent.length:a.previousSibling.childNodes.length,f,!0):a.parentNode&&a.parentNode!==k?e=h(a.parentNode,0,f,!1):(f.selectNode(k),e=c(f.getClientRects(),!1)));runtime.assert(Boolean(e),"No visible rectangle found");return e}function n(d,c,f){for(var e=b(),h=new core.LoopWatchDog(1E4),g=0,k=0;0<d&&e.nextPosition();)h.check(),f.acceptPosition(e)===a&&(g+=1,c.acceptPosition(e)===
a&&(k+=g,g=0,d-=1));return k}function e(d,c,f){for(var e=b(),h=new core.LoopWatchDog(1E4),g=0,k=0;0<d&&e.previousPosition();)h.check(),f.acceptPosition(e)===a&&(g+=1,c.acceptPosition(e)===a&&(k+=g,g=0,d-=1));return k}function r(d,c){var f=b(),e=0,g=0,n=0>d?-1:1;for(d=Math.abs(d);0<d;){for(var m=c,p=n,q=f,r=q.container(),B=0,J=null,I=void 0,M=10,C=void 0,W=0,S=void 0,V=void 0,E=void 0,C=void 0,ea=k.ownerDocument.createRange(),U=new core.LoopWatchDog(1E4),C=h(r,q.unfilteredDomOffset(),ea),S=C.top,V=
C.left,E=S;!0===(0>p?q.previousPosition():q.nextPosition());)if(U.check(),m.acceptPosition(q)===a&&(B+=1,r=q.container(),C=h(r,q.unfilteredDomOffset(),ea),C.top!==S)){if(C.top!==E&&E!==S)break;E=C.top;C=Math.abs(V-C.left);if(null===J||C<M)J=r,I=q.unfilteredDomOffset(),M=C,W=B}null!==J?(q.setUnfilteredPosition(J,I),B=W):B=0;ea.detach();e+=B;if(0===e)break;g+=e;d-=1}return g*n}function q(d,c){var f,e,g,n,p=b(),q=m.getParagraphElement(p.getCurrentNode()),r=0,t=k.ownerDocument.createRange();0>d?(f=p.previousPosition,
e=-1):(f=p.nextPosition,e=1);for(g=h(p.container(),p.unfilteredDomOffset(),t);f.call(p);)if(c.acceptPosition(p)===a){if(m.getParagraphElement(p.getCurrentNode())!==q)break;n=h(p.container(),p.unfilteredDomOffset(),t);if(n.bottom!==g.bottom&&(g=n.top>=g.top&&n.bottom<g.bottom||n.top<=g.top&&n.bottom>g.bottom,!g))break;r+=e;g=n}t.detach();return r}var m=new odf.OdfUtils,p,a=core.PositionFilter.FilterResult.FILTER_ACCEPT;this.getStepCounter=function(){return{convertForwardStepsBetweenFilters:n,convertBackwardStepsBetweenFilters:e,
countLinesSteps:r,countStepsToLineBoundary:q}};(function(){p=gui.SelectionMover.createPositionIterator(k);var a=k.ownerDocument.createRange();a.setStart(p.container(),p.unfilteredDomOffset());a.collapse(!0);g.setSelectedRange(a)})()};
gui.SelectionMover.createPositionIterator=function(g){var k=new function(){this.acceptNode=function(b){return b&&"urn:webodf:names:cursor"!==b.namespaceURI&&"urn:webodf:names:editinfo"!==b.namespaceURI?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}};return new core.PositionIterator(g,5,k,!1)};(function(){return gui.SelectionMover})();
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.Document=function(){};ops.Document.prototype.getMemberIds=function(){};ops.Document.prototype.removeCursor=function(g){};ops.Document.prototype.getDocumentElement=function(){};ops.Document.prototype.getRootNode=function(){};ops.Document.prototype.getDOMDocument=function(){};ops.Document.prototype.cloneDocumentElement=function(){};ops.Document.prototype.setDocumentElement=function(g){};ops.Document.prototype.subscribe=function(g,k){};ops.Document.prototype.unsubscribe=function(g,k){};
ops.Document.prototype.getCanvas=function(){};ops.Document.prototype.createRootFilter=function(g){};ops.Document.signalCursorAdded="cursor/added";ops.Document.signalCursorRemoved="cursor/removed";ops.Document.signalCursorMoved="cursor/moved";ops.Document.signalMemberAdded="member/added";ops.Document.signalMemberUpdated="member/updated";ops.Document.signalMemberRemoved="member/removed";
// Input 42
ops.OdtCursor=function(g,k){var b=this,c={},h,n,e,r=new core.EventNotifier([ops.OdtCursor.signalCursorUpdated]);this.removeFromDocument=function(){e.remove()};this.subscribe=function(b,c){r.subscribe(b,c)};this.unsubscribe=function(b,c){r.unsubscribe(b,c)};this.getStepCounter=function(){return n.getStepCounter()};this.getMemberId=function(){return g};this.getNode=function(){return e.getNode()};this.getAnchorNode=function(){return e.getAnchorNode()};this.getSelectedRange=function(){return e.getSelectedRange()};
this.setSelectedRange=function(c,h){e.setSelectedRange(c,h);r.emit(ops.OdtCursor.signalCursorUpdated,b)};this.hasForwardSelection=function(){return e.hasForwardSelection()};this.getDocument=function(){return k};this.getSelectionType=function(){return h};this.setSelectionType=function(b){c.hasOwnProperty(b)?h=b:runtime.log("Invalid selection type: "+b)};this.resetSelectionType=function(){b.setSelectionType(ops.OdtCursor.RangeSelection)};e=new core.Cursor(k.getDOMDocument(),g);n=new gui.SelectionMover(e,
k.getRootNode());c[ops.OdtCursor.RangeSelection]=!0;c[ops.OdtCursor.RegionSelection]=!0;b.resetSelectionType()};ops.OdtCursor.RangeSelection="Range";ops.OdtCursor.RegionSelection="Region";ops.OdtCursor.signalCursorUpdated="cursorUpdated";(function(){return ops.OdtCursor})();
// Input 43
/*

 Copyright (C) 2010-2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){var g=0;ops.StepsCache=function(k,b,c){function h(a,b,d){var f=this;this.nodeId=a;this.steps=b;this.node=d;this.previousBookmark=this.nextBookmark=null;this.setIteratorPosition=function(a){a.setPositionBeforeElement(d);c(f.steps,a)}}function n(a,b,d){var f=this;this.nodeId=a;this.steps=b;this.node=d;this.previousBookmark=this.nextBookmark=null;this.setIteratorPosition=function(a){a.setUnfilteredPosition(d,0);c(f.steps,a)}}function e(a,b){var d="["+a.nodeId;b&&(d+=" => "+b.nodeId);return d+
"]"}function r(){for(var a=u,b,d,c,f=new core.LoopWatchDog(0,1E5);a;){f.check();(b=a.previousBookmark)?runtime.assert(b.nextBookmark===a,"Broken bookmark link to previous @"+e(b,a)):(runtime.assert(a===u,"Broken bookmark link @"+e(a)),runtime.assert(void 0===y||u===u||u.steps<=y,"Base point is damaged @"+e(a)));(d=a.nextBookmark)&&runtime.assert(d.previousBookmark===a,"Broken bookmark link to next @"+e(a,d));if(void 0===y||a===u||a.steps<=y)runtime.assert(v.containsNode(k,a.node),"Disconnected node is being reported as undamaged @"+
e(a)),b&&(c=a.node.compareDocumentPosition(b.node),runtime.assert(0===c||0!==(c&z),"Bookmark order with previous does not reflect DOM order @"+e(b,a))),d&&v.containsNode(k,d.node)&&(c=a.node.compareDocumentPosition(d.node),runtime.assert(0===c||0!==(c&w),"Bookmark order with next does not reflect DOM order @"+e(a,d)));a=a.nextBookmark}}function q(a){var b="";a.nodeType===Node.ELEMENT_NODE&&(b=a.getAttributeNS(l,"nodeId"));return b}function m(a){var b=g.toString();a.setAttributeNS(l,"nodeId",b);g+=
1;return b}function p(a){var d,c,e=new core.LoopWatchDog(0,1E4);void 0!==y&&a>y&&(a=y);for(d=Math.floor(a/b)*b;!c&&0<=d;)c=f[d],d-=b;for(c=c||u;c.nextBookmark&&c.nextBookmark.steps<=a;)e.check(),c=c.nextBookmark;return c}function a(a){a.previousBookmark&&(a.previousBookmark.nextBookmark=a.nextBookmark);a.nextBookmark&&(a.nextBookmark.previousBookmark=a.previousBookmark)}function d(a){for(var b,d=null;!d&&a&&a!==k;)(b=q(a))&&(d=s[b])&&d.node!==a&&(runtime.log("Cloned node detected. Creating new bookmark"),
d=null,a.removeAttributeNS(l,"nodeId")),a=a.parentNode;return d}var l="urn:webodf:names:steps",f={},s={},v=new core.DomUtils,u,y,w=Node.DOCUMENT_POSITION_FOLLOWING,z=Node.DOCUMENT_POSITION_PRECEDING,t;this.updateBookmark=function(d,c){var e,g,l,n;if(void 0!==y&&y<d){e=p(y);for(l=e.nextBookmark;l&&l.steps<=d;)g=l.nextBookmark,n=Math.ceil(l.steps/b)*b,f[n]===l&&delete f[n],v.containsNode(k,l.node)?l.steps=d+1:(a(l),delete s[l.nodeId]),l=g;y=d}else e=p(d);l=q(c)||m(c);(g=s[l])?g.node===c?g.steps=d:(runtime.log("Cloned node detected. Creating new bookmark"),
l=m(c),g=s[l]=new h(l,d,c)):g=s[l]=new h(l,d,c);l=g;if(e!==l&&e.nextBookmark!==l){if(e.steps===l.steps)for(;0!==(l.node.compareDocumentPosition(e.node)&w)&&e!==u;)e=e.previousBookmark;e!==l&&e.nextBookmark!==l&&(a(l),g=e.nextBookmark,l.nextBookmark=e.nextBookmark,l.previousBookmark=e,e.nextBookmark=l,g&&(g.previousBookmark=l))}e=Math.ceil(l.steps/b)*b;g=f[e];if(!g||l.steps>g.steps)f[e]=l;t()};this.setToClosestStep=function(a,b){var d;t();d=p(a);d.setIteratorPosition(b);return d.steps};this.setToClosestDomPoint=
function(a,b,c){var e,h;t();if(a===k&&0===b)e=u;else if(a===k&&b===k.childNodes.length)for(h in e=u,f)f.hasOwnProperty(h)&&(a=f[h],a.steps>e.steps&&(e=a));else if(e=d(a.childNodes.item(b)||a),!e)for(c.setUnfilteredPosition(a,b);!e&&c.previousNode();)e=d(c.getCurrentNode());e=e||u;void 0!==y&&e.steps>y&&(e=p(y));e.setIteratorPosition(c);return e.steps};this.damageCacheAfterStep=function(a){0>a&&(a=-1);void 0===y?y=a:a<y&&(y=a);t()};(function(){var a=q(k)||m(k);u=new n(a,0,k);t=ops.StepsCache.ENABLE_CACHE_VERIFICATION?
r:function(){}})()};ops.StepsCache.ENABLE_CACHE_VERIFICATION=!1;ops.StepsCache.Bookmark=function(){};ops.StepsCache.Bookmark.prototype.setIteratorPosition=function(g){}})();
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
(function(){ops.OdtStepsTranslator=function(g,k,b,c){function h(a,b,d){var c=b.getCurrentNode();b.isBeforeNode()&&p.isParagraph(c)&&(d||(a+=1),m.updateBookmark(a,c))}function n(a,d){do{if(b.acceptPosition(d)===l){h(a,d,!0);break}h(a-1,d,!1)}while(d.nextPosition())}function e(){var a=g();a!==q&&(q&&runtime.log("Undo detected. Resetting steps cache"),q=a,m=new ops.StepsCache(q,c,n),d=k(q))}function r(a,d){if(!d||b.acceptPosition(a)===l)return!0;for(;a.previousPosition();)if(b.acceptPosition(a)===l){if(d(0,
a.container(),a.unfilteredDomOffset()))return!0;break}for(;a.nextPosition();)if(b.acceptPosition(a)===l){if(d(1,a.container(),a.unfilteredDomOffset()))return!0;break}return!1}var q,m,p=new odf.OdfUtils,a=new core.DomUtils,d,l=core.PositionFilter.FilterResult.FILTER_ACCEPT;this.convertStepsToDomPoint=function(a){var c,g;if(isNaN(a))throw new TypeError("Requested steps is not numeric ("+a+")");if(0>a)throw new RangeError("Requested steps is negative ("+a+")");e();for(c=m.setToClosestStep(a,d);c<a&&
d.nextPosition();)(g=b.acceptPosition(d)===l)&&(c+=1),h(c,d,g);if(c!==a)throw new RangeError("Requested steps ("+a+") exceeds available steps ("+c+")");return{node:d.container(),offset:d.unfilteredDomOffset()}};this.convertDomPointToSteps=function(c,g,k){var n;e();a.containsNode(q,c)||(g=0>a.comparePoints(q,0,c,g),c=q,g=g?0:q.childNodes.length);d.setUnfilteredPosition(c,g);r(d,k)||d.setUnfilteredPosition(c,g);k=d.container();g=d.unfilteredDomOffset();c=m.setToClosestDomPoint(k,g,d);if(0>a.comparePoints(d.container(),
d.unfilteredDomOffset(),k,g))return 0<c?c-1:c;for(;(d.container()!==k||d.unfilteredDomOffset()!==g)&&d.nextPosition();)(n=b.acceptPosition(d)===l)&&(c+=1),h(c,d,n);return c+0};this.prime=function(){var a,c;e();for(a=m.setToClosestStep(0,d);d.nextPosition();)(c=b.acceptPosition(d)===l)&&(a+=1),h(a,d,c)};this.handleStepsInserted=function(a){e();m.damageCacheAfterStep(a.position)};this.handleStepsRemoved=function(a){e();m.damageCacheAfterStep(a.position-1)};e()};ops.OdtStepsTranslator.PREVIOUS_STEP=
0;ops.OdtStepsTranslator.NEXT_STEP=1;return ops.OdtStepsTranslator})();
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.Operation=function(){};ops.Operation.prototype.init=function(g){};ops.Operation.prototype.execute=function(g){};ops.Operation.prototype.spec=function(){};
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.TextPositionFilter=function(g){function k(c,h,g){var k,a;if(h){if(b.isInlineRoot(h)&&b.isGroupingElement(g))return e;k=b.lookLeftForCharacter(h);if(1===k||2===k&&(b.scanRightForAnyCharacter(g)||b.scanRightForAnyCharacter(b.nextNode(c))))return n}else if(b.isInlineRoot(c.previousSibling)&&b.isGroupingElement(c))return n;k=null===h&&b.isParagraph(c);a=b.lookRightForCharacter(g);if(k)return a?n:b.scanRightForAnyCharacter(g)?e:n;if(!a)return e;h=h||b.previousNode(c);return b.scanLeftForAnyCharacter(h)?
e:n}var b=new odf.OdfUtils,c=Node.ELEMENT_NODE,h=Node.TEXT_NODE,n=core.PositionFilter.FilterResult.FILTER_ACCEPT,e=core.PositionFilter.FilterResult.FILTER_REJECT;this.acceptPosition=function(r){var q=r.container(),m=q.nodeType,p,a,d;if(m!==c&&m!==h)return e;if(m===h){if(!b.isGroupingElement(q.parentNode)||b.isWithinTrackedChanges(q.parentNode,g()))return e;m=r.unfilteredDomOffset();p=q.data;runtime.assert(m!==p.length,"Unexpected offset.");if(0<m){r=p[m-1];if(!b.isODFWhitespace(r))return n;if(1<m)if(r=
p[m-2],!b.isODFWhitespace(r))a=n;else{if(!b.isODFWhitespace(p.substr(0,m)))return e}else d=b.previousNode(q),b.scanLeftForNonSpace(d)&&(a=n);if(a===n)return b.isTrailingWhitespace(q,m)?e:n;a=p[m];return b.isODFWhitespace(a)?e:b.scanLeftForAnyCharacter(b.previousNode(q))?e:n}d=r.leftNode();a=q;q=q.parentNode;a=k(q,d,a)}else!b.isGroupingElement(q)||b.isWithinTrackedChanges(q,g())?a=e:(d=r.leftNode(),a=r.rightNode(),a=k(q,d,a));return a}};
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OdtDocument=function(g){function k(){var a=g.odfContainer().getContentElement(),b=a&&a.localName;runtime.assert("text"===b,"Unsupported content element type '"+b+"' for OdtDocument");return a}function b(){return a.getDocumentElement().ownerDocument}function c(a){for(;a&&!(a.namespaceURI===odf.Namespaces.officens&&"text"===a.localName||a.namespaceURI===odf.Namespaces.officens&&"annotation"===a.localName);)a=a.parentNode;return a}function h(a){this.acceptPosition=function(b){b=b.container();var d;
d="string"===typeof a?f[a].getNode():a;return c(b)===c(d)?u:y}}function n(a,b,d,c){c=gui.SelectionMover.createPositionIterator(c);var e;1===d.length?e=d[0]:(e=new core.PositionFilterChain,d.forEach(e.addFilter));d=new core.StepIterator(e,c);d.setPosition(a,b);return d}function e(a){var b=gui.SelectionMover.createPositionIterator(k());a=z.convertStepsToDomPoint(a);b.setUnfilteredPosition(a.node,a.offset);return b}function r(a){return d.getParagraphElement(a)}function q(a,b){return g.getFormatting().getStyleElement(a,
b)}function m(a){return q(a,"paragraph")}function p(a,b,d){a=a.childNodes.item(b)||a;return(a=r(a))&&l.containsNode(d,a)?a:d}var a=this,d,l,f={},s={},v=new core.EventNotifier([ops.Document.signalMemberAdded,ops.Document.signalMemberUpdated,ops.Document.signalMemberRemoved,ops.Document.signalCursorAdded,ops.Document.signalCursorRemoved,ops.Document.signalCursorMoved,ops.OdtDocument.signalParagraphChanged,ops.OdtDocument.signalParagraphStyleModified,ops.OdtDocument.signalCommonStyleCreated,ops.OdtDocument.signalCommonStyleDeleted,
ops.OdtDocument.signalTableAdded,ops.OdtDocument.signalOperationStart,ops.OdtDocument.signalOperationEnd,ops.OdtDocument.signalProcessingBatchStart,ops.OdtDocument.signalProcessingBatchEnd,ops.OdtDocument.signalUndoStackChanged,ops.OdtDocument.signalStepsInserted,ops.OdtDocument.signalStepsRemoved]),u=core.PositionFilter.FilterResult.FILTER_ACCEPT,y=core.PositionFilter.FilterResult.FILTER_REJECT,w,z,t;this.getDocumentElement=function(){return g.odfContainer().rootElement};this.getDOMDocument=function(){return this.getDocumentElement().ownerDocument};
this.cloneDocumentElement=function(){var b=a.getDocumentElement(),d=g.getAnnotationViewManager();d&&d.forgetAnnotations();b=b.cloneNode(!0);g.refreshAnnotations();return b};this.setDocumentElement=function(a){var b=g.odfContainer();b.setRootElement(a);g.setOdfContainer(b,!0);g.refreshCSS()};this.getDOMDocument=b;this.getRootElement=c;this.createStepIterator=n;this.getIteratorAtPosition=e;this.convertDomPointToCursorStep=function(a,b,d){return z.convertDomPointToSteps(a,b,d)};this.convertDomToCursorRange=
function(a,b){var d,c;d=b&&b(a.anchorNode,a.anchorOffset);d=z.convertDomPointToSteps(a.anchorNode,a.anchorOffset,d);b||a.anchorNode!==a.focusNode||a.anchorOffset!==a.focusOffset?(c=b&&b(a.focusNode,a.focusOffset),c=z.convertDomPointToSteps(a.focusNode,a.focusOffset,c)):c=d;return{position:d,length:c-d}};this.convertCursorToDomRange=function(a,d){var c=b().createRange(),e,f;e=z.convertStepsToDomPoint(a);d?(f=z.convertStepsToDomPoint(a+d),0<d?(c.setStart(e.node,e.offset),c.setEnd(f.node,f.offset)):
(c.setStart(f.node,f.offset),c.setEnd(e.node,e.offset))):c.setStart(e.node,e.offset);return c};this.getStyleElement=q;this.upgradeWhitespacesAtPosition=function(a){var b=e(a),c=new core.StepIterator(w,b),f,h=2;runtime.assert(c.isStep(),"positionIterator is not at a step (requested step: "+a+")");do{a=c.container();f=c.offset();if(a.nodeType!==Node.TEXT_NODE||0===f)f=(a=b.leftNode())&&a.nodeType===Node.TEXT_NODE?a.length:-1;if(a&&a.nodeType===Node.TEXT_NODE&&0<f&&d.isSignificantWhitespace(a,f-1)){f-=
1;runtime.assert(" "===a.data[f],"upgradeWhitespaceToElement: textNode.data[offset] should be a literal space");var g=a.ownerDocument.createElementNS(odf.Namespaces.textns,"text:s"),k=a.parentNode,l=a;g.appendChild(a.ownerDocument.createTextNode(" "));1===a.length?k.replaceChild(g,a):(a.deleteData(f,1),0<f&&(f<a.length&&a.splitText(f),l=a.nextSibling),k.insertBefore(g,l));a=g;c.setPosition(a,a.childNodes.length);c.roundToPreviousStep()}h-=1}while(0<h&&c.nextStep())};this.downgradeWhitespacesAtPosition=
function(a){var b=e(a),c;a=b.container();for(b=b.unfilteredDomOffset();!d.isSpaceElement(a)&&a.childNodes.item(b);)a=a.childNodes.item(b),b=0;a.nodeType===Node.TEXT_NODE&&(a=a.parentNode);d.isDowngradableSpaceElement(a)&&(b=a.firstChild,c=a.lastChild,l.mergeIntoParent(a),c!==b&&l.normalizeTextNodes(c),l.normalizeTextNodes(b))};this.getParagraphStyleElement=m;this.getParagraphElement=r;this.getParagraphStyleAttributes=function(a){return(a=m(a))?g.getFormatting().getInheritedStyleAttributes(a,!1):null};
this.getTextNodeAtStep=function(d,c){var h=e(d),g=h.container(),k,l=0,n=null;g.nodeType===Node.TEXT_NODE?(k=g,l=h.unfilteredDomOffset(),0<k.length&&(0<l&&(k=k.splitText(l)),k.parentNode.insertBefore(b().createTextNode(""),k),k=k.previousSibling,l=0)):(k=b().createTextNode(""),l=0,g.insertBefore(k,h.rightNode()));if(c){if(f[c]&&a.getCursorPosition(c)===d){for(n=f[c].getNode();n.nextSibling&&"cursor"===n.nextSibling.localName;)n.parentNode.insertBefore(n.nextSibling,n);0<k.length&&k.nextSibling!==n&&
(k=b().createTextNode(""),l=0);n.parentNode.insertBefore(k,n)}}else for(;k.nextSibling&&"cursor"===k.nextSibling.localName;)k.parentNode.insertBefore(k.nextSibling,k);for(;k.previousSibling&&k.previousSibling.nodeType===Node.TEXT_NODE;)h=k.previousSibling,h.appendData(k.data),l=h.length,k=h,k.parentNode.removeChild(k.nextSibling);for(;k.nextSibling&&k.nextSibling.nodeType===Node.TEXT_NODE;)h=k.nextSibling,k.appendData(h.data),k.parentNode.removeChild(h);return{textNode:k,offset:l}};this.fixCursorPositions=
function(){Object.keys(f).forEach(function(b){var d=f[b],e=c(d.getNode()),h=a.createRootFilter(e),g,k,l,m=!1;l=d.getSelectedRange();g=p(l.startContainer,l.startOffset,e);k=n(l.startContainer,l.startOffset,[w,h],g);l.collapsed?e=k:(g=p(l.endContainer,l.endOffset,e),e=n(l.endContainer,l.endOffset,[w,h],g));k.isStep()&&e.isStep()?k.container()!==e.container()||k.offset()!==e.offset()||l.collapsed&&d.getAnchorNode()===d.getNode()||(m=!0,l.setStart(k.container(),k.offset()),l.collapse(!0)):(m=!0,runtime.assert(k.roundToClosestStep(),
"No walkable step found for cursor owned by "+b),l.setStart(k.container(),k.offset()),runtime.assert(e.roundToClosestStep(),"No walkable step found for cursor owned by "+b),l.setEnd(e.container(),e.offset()));m&&(d.setSelectedRange(l,d.hasForwardSelection()),a.emit(ops.Document.signalCursorMoved,d))})};this.getCursorPosition=function(a){return(a=f[a])?z.convertDomPointToSteps(a.getNode(),0):0};this.getCursorSelection=function(a){a=f[a];var b=0,d=0;a&&(b=z.convertDomPointToSteps(a.getNode(),0),d=z.convertDomPointToSteps(a.getAnchorNode(),
0));return{position:d,length:b-d}};this.getPositionFilter=function(){return w};this.getOdfCanvas=function(){return g};this.getCanvas=function(){return g};this.getRootNode=k;this.addMember=function(a){runtime.assert(void 0===s[a.getMemberId()],"This member already exists");s[a.getMemberId()]=a};this.getMember=function(a){return s.hasOwnProperty(a)?s[a]:null};this.removeMember=function(a){delete s[a]};this.getCursor=function(a){return f[a]};this.getMemberIds=function(){var a=[],b;for(b in f)f.hasOwnProperty(b)&&
a.push(f[b].getMemberId());return a};this.addCursor=function(b){runtime.assert(Boolean(b),"OdtDocument::addCursor without cursor");var d=b.getMemberId(),c=a.convertCursorToDomRange(0,0);runtime.assert("string"===typeof d,"OdtDocument::addCursor has cursor without memberid");runtime.assert(!f[d],"OdtDocument::addCursor is adding a duplicate cursor with memberid "+d);b.setSelectedRange(c,!0);f[d]=b};this.removeCursor=function(b){var d=f[b];return d?(d.removeFromDocument(),delete f[b],a.emit(ops.Document.signalCursorRemoved,
b),!0):!1};this.moveCursor=function(b,d,c,e){b=f[b];d=a.convertCursorToDomRange(d,c);b&&(b.setSelectedRange(d,0<=c),b.setSelectionType(e||ops.OdtCursor.RangeSelection))};this.getFormatting=function(){return g.getFormatting()};this.emit=function(a,b){v.emit(a,b)};this.subscribe=function(a,b){v.subscribe(a,b)};this.unsubscribe=function(a,b){v.unsubscribe(a,b)};this.createRootFilter=function(a){return new h(a)};this.close=function(a){a()};this.destroy=function(a){a()};w=new ops.TextPositionFilter(k);
d=new odf.OdfUtils;l=new core.DomUtils;z=new ops.OdtStepsTranslator(k,gui.SelectionMover.createPositionIterator,w,500);v.subscribe(ops.OdtDocument.signalStepsInserted,z.handleStepsInserted);v.subscribe(ops.OdtDocument.signalStepsRemoved,z.handleStepsRemoved);v.subscribe(ops.OdtDocument.signalOperationEnd,function(b){var d=b.spec(),c=d.memberid,d=(new Date(d.timestamp)).toISOString(),e=g.odfContainer();b.isEdit&&(c=a.getMember(c).getProperties().fullName,e.setMetadata({"dc:creator":c,"dc:date":d},
null),t||(e.incrementEditingCycles(),e.setMetadata(null,["meta:editing-duration","meta:document-statistic"])),t=b)});v.subscribe(ops.OdtDocument.signalProcessingBatchEnd,core.Task.processTasks)};ops.OdtDocument.signalParagraphChanged="paragraph/changed";ops.OdtDocument.signalTableAdded="table/added";ops.OdtDocument.signalCommonStyleCreated="style/created";ops.OdtDocument.signalCommonStyleDeleted="style/deleted";ops.OdtDocument.signalParagraphStyleModified="paragraphstyle/modified";
ops.OdtDocument.signalOperationStart="operation/start";ops.OdtDocument.signalOperationEnd="operation/end";ops.OdtDocument.signalProcessingBatchStart="router/batchstart";ops.OdtDocument.signalProcessingBatchEnd="router/batchend";ops.OdtDocument.signalUndoStackChanged="undo/changed";ops.OdtDocument.signalStepsInserted="steps/inserted";ops.OdtDocument.signalStepsRemoved="steps/removed";(function(){return ops.OdtDocument})();
// Input 48
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpAddAnnotation=function(){function g(b,c,e){var h=b.getTextNodeAtStep(e,k);h&&(b=h.textNode,e=b.parentNode,h.offset!==b.length&&b.splitText(h.offset),e.insertBefore(c,b.nextSibling),0===b.length&&e.removeChild(b))}var k,b,c,h,n,e;this.init=function(e){k=e.memberid;b=parseInt(e.timestamp,10);c=parseInt(e.position,10);h=parseInt(e.length,10)||0;n=e.name};this.isEdit=!0;this.group=void 0;this.execute=function(r){var q=r.getCursor(k),m,p;p=new core.DomUtils;e=r.getDOMDocument();var a=new Date(b),
d,l,f,s;d=e.createElementNS(odf.Namespaces.officens,"office:annotation");d.setAttributeNS(odf.Namespaces.officens,"office:name",n);m=e.createElementNS(odf.Namespaces.dcns,"dc:creator");m.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",k);m.textContent=r.getMember(k).getProperties().fullName;l=e.createElementNS(odf.Namespaces.dcns,"dc:date");l.appendChild(e.createTextNode(a.toISOString()));a=e.createElementNS(odf.Namespaces.textns,"text:list");f=e.createElementNS(odf.Namespaces.textns,
"text:list-item");s=e.createElementNS(odf.Namespaces.textns,"text:p");f.appendChild(s);a.appendChild(f);d.appendChild(m);d.appendChild(l);d.appendChild(a);h&&(m=e.createElementNS(odf.Namespaces.officens,"office:annotation-end"),m.setAttributeNS(odf.Namespaces.officens,"office:name",n),d.annotationEndElement=m,g(r,m,c+h));g(r,d,c);r.emit(ops.OdtDocument.signalStepsInserted,{position:c,length:h});q&&(m=e.createRange(),p=p.getElementsByTagNameNS(d,odf.Namespaces.textns,"p")[0],m.selectNodeContents(p),
q.setSelectedRange(m,!1),r.emit(ops.Document.signalCursorMoved,q));r.getOdfCanvas().addAnnotation(d);r.fixCursorPositions();return!0};this.spec=function(){return{optype:"AddAnnotation",memberid:k,timestamp:b,position:c,length:h,name:n}}};
// Input 49
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpAddCursor=function(){var g,k;this.init=function(b){g=b.memberid;k=b.timestamp};this.isEdit=!1;this.group=void 0;this.execute=function(b){var c=b.getCursor(g);if(c)return!1;c=new ops.OdtCursor(g,b);b.addCursor(c);b.emit(ops.Document.signalCursorAdded,c);return!0};this.spec=function(){return{optype:"AddCursor",memberid:g,timestamp:k}}};
// Input 50
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpAddMember=function(){var g,k,b;this.init=function(c){g=c.memberid;k=parseInt(c.timestamp,10);b=c.setProperties};this.isEdit=!1;this.group=void 0;this.execute=function(c){var h;if(c.getMember(g))return!1;h=new ops.Member(g,b);c.addMember(h);c.emit(ops.Document.signalMemberAdded,h);return!0};this.spec=function(){return{optype:"AddMember",memberid:g,timestamp:k,setProperties:b}}};
// Input 51
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpAddStyle=function(){var g,k,b,c,h,n,e=odf.Namespaces.stylens;this.init=function(e){g=e.memberid;k=e.timestamp;b=e.styleName;c=e.styleFamily;h="true"===e.isAutomaticStyle||!0===e.isAutomaticStyle;n=e.setProperties};this.isEdit=!0;this.group=void 0;this.execute=function(g){var k=g.getOdfCanvas().odfContainer(),m=g.getFormatting(),p=g.getDOMDocument().createElementNS(e,"style:style");if(!p)return!1;n&&m.updateStyle(p,n);p.setAttributeNS(e,"style:family",c);p.setAttributeNS(e,"style:name",b);h?
k.rootElement.automaticStyles.appendChild(p):k.rootElement.styles.appendChild(p);g.getOdfCanvas().refreshCSS();h||g.emit(ops.OdtDocument.signalCommonStyleCreated,{name:b,family:c});return!0};this.spec=function(){return{optype:"AddStyle",memberid:g,timestamp:k,styleName:b,styleFamily:c,isAutomaticStyle:h,setProperties:n}}};
// Input 52
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
odf.ObjectNameGenerator=function(g,k){function b(a,b){var d={};this.generateName=function(){var c=b(),e=0,h;do h=a+e,e+=1;while(d[h]||c[h]);d[h]=!0;return h}}function c(){var a={};[g.rootElement.automaticStyles,g.rootElement.styles].forEach(function(b){for(b=b.firstElementChild;b;)b.namespaceURI===h&&"style"===b.localName&&(a[b.getAttributeNS(h,"name")]=!0),b=b.nextElementSibling});return a}var h=odf.Namespaces.stylens,n=odf.Namespaces.drawns,e=odf.Namespaces.xlinkns,r=new core.DomUtils,q=(new core.Utils).hashString(k),
m=null,p=null,a=null,d={},l={};this.generateStyleName=function(){null===m&&(m=new b("auto"+q+"_",function(){return c()}));return m.generateName()};this.generateFrameName=function(){null===p&&(r.getElementsByTagNameNS(g.rootElement.body,n,"frame").forEach(function(a){d[a.getAttributeNS(n,"name")]=!0}),p=new b("fr"+q+"_",function(){return d}));return p.generateName()};this.generateImageName=function(){null===a&&(r.getElementsByTagNameNS(g.rootElement.body,n,"image").forEach(function(a){a=a.getAttributeNS(e,
"href");a=a.substring(9,a.lastIndexOf("."));l[a]=!0}),a=new b("img"+q+"_",function(){return l}));return a.generateName()}};
// Input 53
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
odf.TextStyleApplicator=function(g,k,b){function c(b){function c(a,b){return"object"===typeof a&&"object"===typeof b?Object.keys(a).every(function(e){return c(a[e],b[e])}):a===b}var a={};this.isStyleApplied=function(d){d=k.getAppliedStylesForElement(d,a);return c(b,d)}}function h(c){var e={};this.applyStyleToContainer=function(a){var d;d=a.getAttributeNS(r,"style-name");var h=a.ownerDocument;d=d||"";if(!e.hasOwnProperty(d)){var f=d,n;n=d?k.createDerivedStyleObject(d,"text",c):c;h=h.createElementNS(q,
"style:style");k.updateStyle(h,n);h.setAttributeNS(q,"style:name",g.generateStyleName());h.setAttributeNS(q,"style:family","text");h.setAttributeNS("urn:webodf:names:scope","scope","document-content");b.appendChild(h);e[f]=h}d=e[d].getAttributeNS(q,"name");a.setAttributeNS(r,"text:style-name",d)}}function n(b,c){var a=b.ownerDocument,d=b.parentNode,h,f,g,k=new core.LoopWatchDog(1E4);f=[];f.push(b);for(g=b.nextSibling;g&&e.rangeContainsNode(c,g);)k.check(),f.push(g),g=g.nextSibling;"span"!==d.localName||
d.namespaceURI!==r?(h=a.createElementNS(r,"text:span"),d.insertBefore(h,b),a=!1):(b.previousSibling&&!e.rangeContainsNode(c,d.firstChild)?(h=d.cloneNode(!1),d.parentNode.insertBefore(h,d.nextSibling)):h=d,a=!0);f.forEach(function(a){a.parentNode!==h&&h.appendChild(a)});if(g&&a)for(f=h.cloneNode(!1),h.parentNode.insertBefore(f,h.nextSibling);g;)k.check(),a=g.nextSibling,f.appendChild(g),g=a;return h}var e=new core.DomUtils,r=odf.Namespaces.textns,q=odf.Namespaces.stylens;this.applyStyle=function(b,
e,a){var d={},g,f,k,q;runtime.assert(a&&a.hasOwnProperty("style:text-properties"),"applyStyle without any text properties");d["style:text-properties"]=a["style:text-properties"];k=new h(d);q=new c(d);b.forEach(function(a){g=q.isStyleApplied(a);!1===g&&(f=n(a,e),k.applyStyleToContainer(f))})}};
// Input 54
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpApplyDirectStyling=function(){function g(b,c,h){var a=b.getOdfCanvas().odfContainer(),d=r.splitBoundaries(c),g=e.getTextNodes(c,!1);(new odf.TextStyleApplicator(new odf.ObjectNameGenerator(a,k),b.getFormatting(),a.rootElement.automaticStyles)).applyStyle(g,c,h);d.forEach(r.normalizeTextNodes)}var k,b,c,h,n,e=new odf.OdfUtils,r=new core.DomUtils;this.init=function(e){k=e.memberid;b=e.timestamp;c=parseInt(e.position,10);h=parseInt(e.length,10);n=e.setProperties};this.isEdit=!0;this.group=void 0;
this.execute=function(q){var m=q.convertCursorToDomRange(c,h),p=e.getParagraphElements(m);g(q,m,n);m.detach();q.getOdfCanvas().refreshCSS();q.fixCursorPositions();p.forEach(function(a){q.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:a,memberId:k,timeStamp:b})});q.getOdfCanvas().rerenderAnnotations();return!0};this.spec=function(){return{optype:"ApplyDirectStyling",memberid:k,timestamp:b,position:c,length:h,setProperties:n}}};
// Input 55
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpApplyHyperlink=function(){function g(b){for(;b;){if(r.isHyperlink(b))return!0;b=b.parentNode}return!1}var k,b,c,h,n,e=new core.DomUtils,r=new odf.OdfUtils;this.init=function(e){k=e.memberid;b=e.timestamp;c=e.position;h=e.length;n=e.hyperlink};this.isEdit=!0;this.group=void 0;this.execute=function(q){var m=q.getDOMDocument(),p=q.convertCursorToDomRange(c,h),a=e.splitBoundaries(p),d=[],l=r.getTextNodes(p,!1);if(0===l.length)return!1;l.forEach(function(a){var b=r.getParagraphElement(a);runtime.assert(!1===
g(a),"The given range should not contain any link.");var c=n,e=m.createElementNS(odf.Namespaces.textns,"text:a");e.setAttributeNS(odf.Namespaces.xlinkns,"xlink:type","simple");e.setAttributeNS(odf.Namespaces.xlinkns,"xlink:href",c);a.parentNode.insertBefore(e,a);e.appendChild(a);-1===d.indexOf(b)&&d.push(b)});a.forEach(e.normalizeTextNodes);p.detach();q.getOdfCanvas().refreshSize();q.getOdfCanvas().rerenderAnnotations();d.forEach(function(a){q.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:a,
memberId:k,timeStamp:b})});return!0};this.spec=function(){return{optype:"ApplyHyperlink",memberid:k,timestamp:b,position:c,length:h,hyperlink:n}}};
// Input 56
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpInsertImage=function(){var g,k,b,c,h,n,e,r,q=odf.Namespaces.drawns,m=odf.Namespaces.svgns,p=odf.Namespaces.textns,a=odf.Namespaces.xlinkns;this.init=function(a){g=a.memberid;k=a.timestamp;b=a.position;c=a.filename;h=a.frameWidth;n=a.frameHeight;e=a.frameStyleName;r=a.frameName};this.isEdit=!0;this.group=void 0;this.execute=function(d){var l=d.getOdfCanvas(),f=d.getTextNodeAtStep(b,g),s,v;if(!f)return!1;s=f.textNode;v=d.getParagraphElement(s);var f=f.offset!==s.length?s.splitText(f.offset):s.nextSibling,
u=d.getDOMDocument(),y=u.createElementNS(q,"draw:image"),u=u.createElementNS(q,"draw:frame");y.setAttributeNS(a,"xlink:href",c);y.setAttributeNS(a,"xlink:type","simple");y.setAttributeNS(a,"xlink:show","embed");y.setAttributeNS(a,"xlink:actuate","onLoad");u.setAttributeNS(q,"draw:style-name",e);u.setAttributeNS(q,"draw:name",r);u.setAttributeNS(p,"text:anchor-type","as-char");u.setAttributeNS(m,"svg:width",h);u.setAttributeNS(m,"svg:height",n);u.appendChild(y);s.parentNode.insertBefore(u,f);d.emit(ops.OdtDocument.signalStepsInserted,
{position:b,length:1});0===s.length&&s.parentNode.removeChild(s);l.addCssForFrameWithImage(u);l.refreshCSS();d.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:v,memberId:g,timeStamp:k});l.rerenderAnnotations();return!0};this.spec=function(){return{optype:"InsertImage",memberid:g,timestamp:k,filename:c,position:b,frameWidth:h,frameHeight:n,frameStyleName:e,frameName:r}}};
// Input 57
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpInsertTable=function(){function g(b,a){var d;if(1===m.length)d=m[0];else if(3===m.length)switch(b){case 0:d=m[0];break;case c-1:d=m[2];break;default:d=m[1]}else d=m[b];if(1===d.length)return d[0];if(3===d.length)switch(a){case 0:return d[0];case h-1:return d[2];default:return d[1]}return d[a]}var k,b,c,h,n,e,r,q,m;this.init=function(g){k=g.memberid;b=g.timestamp;n=g.position;c=g.initialRows;h=g.initialColumns;e=g.tableName;r=g.tableStyleName;q=g.tableColumnStyleName;m=g.tableCellStyleMatrix};
this.isEdit=!0;this.group=void 0;this.execute=function(m){var a=m.getTextNodeAtStep(n),d=m.getRootNode();if(a){var l=m.getDOMDocument(),f=l.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table"),s=l.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table-column"),v,u,y,w;r&&f.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:style-name",r);e&&f.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:name",e);s.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0",
"table:number-columns-repeated",h);q&&s.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:style-name",q);f.appendChild(s);for(y=0;y<c;y+=1){s=l.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table-row");for(w=0;w<h;w+=1)v=l.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table-cell"),(u=g(y,w))&&v.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:style-name",u),u=l.createElementNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0",
"text:p"),v.appendChild(u),s.appendChild(v);f.appendChild(s)}a=m.getParagraphElement(a.textNode);d.insertBefore(f,a.nextSibling);m.emit(ops.OdtDocument.signalStepsInserted,{position:n,length:h*c+1});m.getOdfCanvas().refreshSize();m.emit(ops.OdtDocument.signalTableAdded,{tableElement:f,memberId:k,timeStamp:b});m.getOdfCanvas().rerenderAnnotations();return!0}return!1};this.spec=function(){return{optype:"InsertTable",memberid:k,timestamp:b,position:n,initialRows:c,initialColumns:h,tableName:e,tableStyleName:r,
tableColumnStyleName:q,tableCellStyleMatrix:m}}};
// Input 58
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpInsertText=function(){var g,k,b,c,h,n=new odf.OdfUtils;this.init=function(e){g=e.memberid;k=e.timestamp;b=e.position;h=e.text;c="true"===e.moveCursor||!0===e.moveCursor};this.isEdit=!0;this.group=void 0;this.execute=function(e){var r,q,m,p=null,a=e.getDOMDocument(),d,l=0,f,s=e.getCursor(g),v;e.upgradeWhitespacesAtPosition(b);if(r=e.getTextNodeAtStep(b)){q=r.textNode;p=q.nextSibling;m=q.parentNode;d=e.getParagraphElement(q);for(v=0;v<h.length;v+=1)if("\t"===h[v]||"\t"!==h[v]&&n.isODFWhitespace(h[v])&&
(0===v||v===h.length-1||"\t"!==h[v-1]&&n.isODFWhitespace(h[v-1])))0===l?(r.offset!==q.length&&(p=q.splitText(r.offset)),0<v&&q.appendData(h.substring(0,v))):l<v&&(l=h.substring(l,v),m.insertBefore(a.createTextNode(l),p)),l=v+1,"\t"===h[v]?(f=a.createElementNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","text:tab"),f.appendChild(a.createTextNode("\t"))):(" "!==h[v]&&runtime.log("WARN: InsertText operation contains non-tab, non-space whitespace character (character code "+h.charCodeAt(v)+")"),
f=a.createElementNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","text:s"),f.appendChild(a.createTextNode(" "))),m.insertBefore(f,p);0===l?q.insertData(r.offset,h):l<h.length&&(r=h.substring(l),m.insertBefore(a.createTextNode(r),p));m=q.parentNode;p=q.nextSibling;m.removeChild(q);m.insertBefore(q,p);0===q.length&&q.parentNode.removeChild(q);e.emit(ops.OdtDocument.signalStepsInserted,{position:b,length:h.length});s&&c&&(e.moveCursor(g,b+h.length,0),e.emit(ops.Document.signalCursorMoved,s));0<b&&
(1<b&&e.downgradeWhitespacesAtPosition(b-2),e.downgradeWhitespacesAtPosition(b-1));e.downgradeWhitespacesAtPosition(b);e.downgradeWhitespacesAtPosition(b+h.length-1);e.downgradeWhitespacesAtPosition(b+h.length);e.getOdfCanvas().refreshSize();e.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:d,memberId:g,timeStamp:k});e.getOdfCanvas().rerenderAnnotations();return!0}return!1};this.spec=function(){return{optype:"InsertText",memberid:g,timestamp:k,position:b,text:h,moveCursor:c}}};
// Input 59
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpMoveCursor=function(){var g,k,b,c,h;this.init=function(n){g=n.memberid;k=n.timestamp;b=n.position;c=n.length||0;h=n.selectionType||ops.OdtCursor.RangeSelection};this.isEdit=!1;this.group=void 0;this.execute=function(k){var e=k.getCursor(g),r;if(!e)return!1;r=k.convertCursorToDomRange(b,c);e.setSelectedRange(r,0<=c);e.setSelectionType(h);k.emit(ops.Document.signalCursorMoved,e);return!0};this.spec=function(){return{optype:"MoveCursor",memberid:g,timestamp:k,position:b,length:c,selectionType:h}}};
// Input 60
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpRemoveAnnotation=function(){var g,k,b,c,h;this.init=function(n){g=n.memberid;k=n.timestamp;b=parseInt(n.position,10);c=parseInt(n.length,10);h=new core.DomUtils};this.isEdit=!0;this.group=void 0;this.execute=function(g){function e(b){q.parentNode.insertBefore(b,q)}for(var k=g.getIteratorAtPosition(b).container(),q;k.namespaceURI!==odf.Namespaces.officens||"annotation"!==k.localName;)k=k.parentNode;if(null===k)return!1;q=k;k=q.annotationEndElement;g.getOdfCanvas().forgetAnnotations();h.getElementsByTagNameNS(q,
"urn:webodf:names:cursor","cursor").forEach(e);h.getElementsByTagNameNS(q,"urn:webodf:names:cursor","anchor").forEach(e);q.parentNode.removeChild(q);k&&k.parentNode.removeChild(k);g.emit(ops.OdtDocument.signalStepsRemoved,{position:0<b?b-1:b,length:c});g.fixCursorPositions();g.getOdfCanvas().refreshAnnotations();return!0};this.spec=function(){return{optype:"RemoveAnnotation",memberid:g,timestamp:k,position:b,length:c}}};
// Input 61
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpRemoveBlob=function(){var g,k,b;this.init=function(c){g=c.memberid;k=c.timestamp;b=c.filename};this.isEdit=!0;this.group=void 0;this.execute=function(c){c.getOdfCanvas().odfContainer().removeBlob(b);return!0};this.spec=function(){return{optype:"RemoveBlob",memberid:g,timestamp:k,filename:b}}};
// Input 62
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpRemoveCursor=function(){var g,k;this.init=function(b){g=b.memberid;k=b.timestamp};this.isEdit=!1;this.group=void 0;this.execute=function(b){return b.removeCursor(g)?!0:!1};this.spec=function(){return{optype:"RemoveCursor",memberid:g,timestamp:k}}};
// Input 63
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpRemoveHyperlink=function(){var g,k,b,c,h=new core.DomUtils,n=new odf.OdfUtils;this.init=function(e){g=e.memberid;k=e.timestamp;b=e.position;c=e.length};this.isEdit=!0;this.group=void 0;this.execute=function(e){var r=e.convertCursorToDomRange(b,c),q=n.getHyperlinkElements(r);runtime.assert(1===q.length,"The given range should only contain a single link.");q=h.mergeIntoParent(q[0]);r.detach();e.getOdfCanvas().refreshSize();e.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:n.getParagraphElement(q),
memberId:g,timeStamp:k});e.getOdfCanvas().rerenderAnnotations();return!0};this.spec=function(){return{optype:"RemoveHyperlink",memberid:g,timestamp:k,position:b,length:c}}};
// Input 64
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpRemoveMember=function(){var g,k;this.init=function(b){g=b.memberid;k=parseInt(b.timestamp,10)};this.isEdit=!1;this.group=void 0;this.execute=function(b){if(!b.getMember(g))return!1;b.removeMember(g);b.emit(ops.Document.signalMemberRemoved,g);return!0};this.spec=function(){return{optype:"RemoveMember",memberid:g,timestamp:k}}};
// Input 65
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpRemoveStyle=function(){var g,k,b,c;this.init=function(h){g=h.memberid;k=h.timestamp;b=h.styleName;c=h.styleFamily};this.isEdit=!0;this.group=void 0;this.execute=function(h){var g=h.getStyleElement(b,c);if(!g)return!1;g.parentNode.removeChild(g);h.getOdfCanvas().refreshCSS();h.emit(ops.OdtDocument.signalCommonStyleDeleted,{name:b,family:c});return!0};this.spec=function(){return{optype:"RemoveStyle",memberid:g,timestamp:k,styleName:b,styleFamily:c}}};
// Input 66
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpRemoveText=function(){function g(b){function c(a){return e.isODFNode(a)||"br"===a.localName&&e.isLineBreak(a.parentNode)||a.nodeType===Node.TEXT_NODE&&e.isODFNode(a.parentNode)}function h(a){var d;a.nodeType===Node.TEXT_NODE?(d=a.parentNode,d.removeChild(a)):d=r.removeUnwantedNodes(a,c);return d&&!e.isParagraph(d)&&d!==b&&e.hasNoODFContent(d)?h(d):d}this.mergeChildrenIntoParent=h}var k,b,c,h,n,e,r;this.init=function(g){runtime.assert(0<=g.length,"OpRemoveText only supports positive lengths");
k=g.memberid;b=g.timestamp;c=parseInt(g.position,10);h=parseInt(g.length,10);n=g.mergedParagraphStyleName;e=new odf.OdfUtils;r=new core.DomUtils};this.isEdit=!0;this.group=void 0;this.execute=function(q){var m,p,a,d,l=q.getCursor(k),f=new g(q.getRootNode());q.upgradeWhitespacesAtPosition(c);q.upgradeWhitespacesAtPosition(c+h);p=q.convertCursorToDomRange(c,h);r.splitBoundaries(p);m=q.getParagraphElement(p.startContainer);a=e.getTextElements(p,!1,!0);d=e.getParagraphElements(p);p.detach();a.forEach(function(a){a.parentNode?
f.mergeChildrenIntoParent(a):runtime.log("WARN: text element has already been removed from it's container")});p=d.reduce(function(a,b){var d,c;e.hasNoODFContent(a)&&b.parentNode!==a.parentNode&&(c=b.parentNode,a.parentNode.insertBefore(b,a.nextSibling));for(;b.firstChild;)d=b.firstChild,b.removeChild(d),"editinfo"!==d.localName&&a.appendChild(d);c&&e.hasNoODFContent(c)&&f.mergeChildrenIntoParent(c);f.mergeChildrenIntoParent(b);return a});void 0!==n&&(""===n?p.removeAttributeNS(odf.Namespaces.textns,
"style-name"):p.setAttributeNS(odf.Namespaces.textns,"text:style-name",n));q.emit(ops.OdtDocument.signalStepsRemoved,{position:c,length:h});q.downgradeWhitespacesAtPosition(c);q.fixCursorPositions();q.getOdfCanvas().refreshSize();q.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:p||m,memberId:k,timeStamp:b});l&&(l.resetSelectionType(),q.emit(ops.Document.signalCursorMoved,l));q.getOdfCanvas().rerenderAnnotations();return!0};this.spec=function(){return{optype:"RemoveText",memberid:k,
timestamp:b,position:c,length:h,mergedParagraphStyleName:n}}};
// Input 67
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpSetBlob=function(){var g,k,b,c,h;this.init=function(n){g=n.memberid;k=n.timestamp;b=n.filename;c=n.mimetype;h=n.content};this.isEdit=!0;this.group=void 0;this.execute=function(g){g.getOdfCanvas().odfContainer().setBlob(b,c,h);return!0};this.spec=function(){return{optype:"SetBlob",memberid:g,timestamp:k,filename:b,mimetype:c,content:h}}};
// Input 68
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpSetParagraphStyle=function(){var g,k,b,c;this.init=function(h){g=h.memberid;k=h.timestamp;b=h.position;c=h.styleName};this.isEdit=!0;this.group=void 0;this.execute=function(h){var n;n=h.getIteratorAtPosition(b);return(n=h.getParagraphElement(n.container()))?(""!==c?n.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","text:style-name",c):n.removeAttributeNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","style-name"),h.getOdfCanvas().refreshSize(),h.emit(ops.OdtDocument.signalParagraphChanged,
{paragraphElement:n,timeStamp:k,memberId:g}),h.getOdfCanvas().rerenderAnnotations(),!0):!1};this.spec=function(){return{optype:"SetParagraphStyle",memberid:g,timestamp:k,position:b,styleName:c}}};
// Input 69
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpSplitParagraph=function(){var g,k,b,c,h;this.init=function(n){g=n.memberid;k=n.timestamp;b=n.position;c="true"===n.moveCursor||!0===n.moveCursor;h=new odf.OdfUtils};this.isEdit=!0;this.group=void 0;this.execute=function(n){var e,r,q,m,p,a,d,l=n.getCursor(g);n.upgradeWhitespacesAtPosition(b);e=n.getTextNodeAtStep(b);if(!e)return!1;r=n.getParagraphElement(e.textNode);if(!r)return!1;q=h.isListItem(r.parentNode)?r.parentNode:r;0===e.offset?(d=e.textNode.previousSibling,a=null):(d=e.textNode,a=e.offset>=
e.textNode.length?null:e.textNode.splitText(e.offset));for(m=e.textNode;m!==q;){m=m.parentNode;p=m.cloneNode(!1);a&&p.appendChild(a);if(d)for(;d&&d.nextSibling;)p.appendChild(d.nextSibling);else for(;m.firstChild;)p.appendChild(m.firstChild);m.parentNode.insertBefore(p,m.nextSibling);d=m;a=p}h.isListItem(a)&&(a=a.childNodes.item(0));0===e.textNode.length&&e.textNode.parentNode.removeChild(e.textNode);n.emit(ops.OdtDocument.signalStepsInserted,{position:b,length:1});l&&c&&(n.moveCursor(g,b+1,0),n.emit(ops.Document.signalCursorMoved,
l));n.fixCursorPositions();n.getOdfCanvas().refreshSize();n.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:r,memberId:g,timeStamp:k});n.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:a,memberId:g,timeStamp:k});n.getOdfCanvas().rerenderAnnotations();return!0};this.spec=function(){return{optype:"SplitParagraph",memberid:g,timestamp:k,position:b,moveCursor:c}}};
// Input 70
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpUpdateMember=function(){function g(b){var e="//dc:creator[@editinfo:memberid='"+k+"']";b=xmldom.XPath.getODFElementsWithXPath(b.getRootNode(),e,function(b){return"editinfo"===b?"urn:webodf:names:editinfo":odf.Namespaces.lookupNamespaceURI(b)});for(e=0;e<b.length;e+=1)b[e].textContent=c.fullName}var k,b,c,h;this.init=function(g){k=g.memberid;b=parseInt(g.timestamp,10);c=g.setProperties;h=g.removedProperties};this.isEdit=!1;this.group=void 0;this.execute=function(b){var e=b.getMember(k);if(!e)return!1;
h&&e.removeProperties(h);c&&(e.setProperties(c),c.fullName&&g(b));b.emit(ops.Document.signalMemberUpdated,e);return!0};this.spec=function(){return{optype:"UpdateMember",memberid:k,timestamp:b,setProperties:c,removedProperties:h}}};
// Input 71
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpUpdateMetadata=function(){var g,k,b,c;this.init=function(h){g=h.memberid;k=parseInt(h.timestamp,10);b=h.setProperties;c=h.removedProperties};this.isEdit=!0;this.group=void 0;this.execute=function(h){h=h.getOdfCanvas().odfContainer();var g=[];c&&(g=c.attributes.split(","));h.setMetadata(b,g);return!0};this.spec=function(){return{optype:"UpdateMetadata",memberid:g,timestamp:k,setProperties:b,removedProperties:c}}};
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

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OpUpdateParagraphStyle=function(){function g(b,c){var e,h,a=c?c.split(","):[];for(e=0;e<a.length;e+=1)h=a[e].split(":"),b.removeAttributeNS(odf.Namespaces.lookupNamespaceURI(h[0]),h[1])}var k,b,c,h,n,e=odf.Namespaces.stylens;this.init=function(e){k=e.memberid;b=e.timestamp;c=e.styleName;h=e.setProperties;n=e.removedProperties};this.isEdit=!0;this.group=void 0;this.execute=function(b){var k=b.getFormatting(),m,p,a;return(m=""!==c?b.getParagraphStyleElement(c):k.getDefaultStyleElement("paragraph"))?
(p=m.getElementsByTagNameNS(e,"paragraph-properties").item(0),a=m.getElementsByTagNameNS(e,"text-properties").item(0),h&&k.updateStyle(m,h),n&&(k=n["style:paragraph-properties"],p&&k&&(g(p,k.attributes),0===p.attributes.length&&m.removeChild(p)),k=n["style:text-properties"],a&&k&&(g(a,k.attributes),0===a.attributes.length&&m.removeChild(a)),g(m,n.attributes)),b.getOdfCanvas().refreshCSS(),b.emit(ops.OdtDocument.signalParagraphStyleModified,c),b.getOdfCanvas().rerenderAnnotations(),!0):!1};this.spec=
function(){return{optype:"UpdateParagraphStyle",memberid:k,timestamp:b,styleName:c,setProperties:h,removedProperties:n}}};
// Input 73
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OperationFactory=function(){function g(b){return function(c){return new b}}var k;this.register=function(b,c){k[b]=c};this.create=function(b){var c=null,h=k[b.optype];h&&(c=h(b),c.init(b));return c};k={AddMember:g(ops.OpAddMember),UpdateMember:g(ops.OpUpdateMember),RemoveMember:g(ops.OpRemoveMember),AddCursor:g(ops.OpAddCursor),ApplyDirectStyling:g(ops.OpApplyDirectStyling),SetBlob:g(ops.OpSetBlob),RemoveBlob:g(ops.OpRemoveBlob),InsertImage:g(ops.OpInsertImage),InsertTable:g(ops.OpInsertTable),
InsertText:g(ops.OpInsertText),RemoveText:g(ops.OpRemoveText),SplitParagraph:g(ops.OpSplitParagraph),SetParagraphStyle:g(ops.OpSetParagraphStyle),UpdateParagraphStyle:g(ops.OpUpdateParagraphStyle),AddStyle:g(ops.OpAddStyle),RemoveStyle:g(ops.OpRemoveStyle),MoveCursor:g(ops.OpMoveCursor),RemoveCursor:g(ops.OpRemoveCursor),AddAnnotation:g(ops.OpAddAnnotation),RemoveAnnotation:g(ops.OpRemoveAnnotation),UpdateMetadata:g(ops.OpUpdateMetadata),ApplyHyperlink:g(ops.OpApplyHyperlink),RemoveHyperlink:g(ops.OpRemoveHyperlink)}};
// Input 74
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OperationRouter=function(){};ops.OperationRouter.prototype.setOperationFactory=function(g){};ops.OperationRouter.prototype.setPlaybackFunction=function(g){};ops.OperationRouter.prototype.push=function(g){};ops.OperationRouter.prototype.close=function(g){};ops.OperationRouter.prototype.subscribe=function(g,k){};ops.OperationRouter.prototype.unsubscribe=function(g,k){};ops.OperationRouter.prototype.hasLocalUnsyncedOps=function(){};ops.OperationRouter.prototype.hasSessionHostConnection=function(){};
ops.OperationRouter.signalProcessingBatchStart="router/batchstart";ops.OperationRouter.signalProcessingBatchEnd="router/batchend";
// Input 75
/*

 Copyright (C) 2012 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.TrivialOperationRouter=function(){var g=new core.EventNotifier([ops.OperationRouter.signalProcessingBatchStart,ops.OperationRouter.signalProcessingBatchEnd]),k,b,c=0;this.setOperationFactory=function(b){k=b};this.setPlaybackFunction=function(c){b=c};this.push=function(h){c+=1;g.emit(ops.OperationRouter.signalProcessingBatchStart,{});h.forEach(function(h){h=h.spec();h.timestamp=Date.now();h=k.create(h);h.group="g"+c;b(h)});g.emit(ops.OperationRouter.signalProcessingBatchEnd,{})};this.close=function(b){b()};
this.subscribe=function(b,c){g.subscribe(b,c)};this.unsubscribe=function(b,c){g.unsubscribe(b,c)};this.hasLocalUnsyncedOps=function(){return!1};this.hasSessionHostConnection=function(){return!0}};
// Input 76
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.Session=function(g){function k(b){h.emit(ops.OdtDocument.signalProcessingBatchStart,b)}function b(b){h.emit(ops.OdtDocument.signalProcessingBatchEnd,b)}var c=new ops.OperationFactory,h=new ops.OdtDocument(g),n=null;this.setOperationFactory=function(b){c=b;n&&n.setOperationFactory(c)};this.setOperationRouter=function(e){n&&(n.unsubscribe(ops.OperationRouter.signalProcessingBatchStart,k),n.unsubscribe(ops.OperationRouter.signalProcessingBatchEnd,b));n=e;n.subscribe(ops.OperationRouter.signalProcessingBatchStart,
k);n.subscribe(ops.OperationRouter.signalProcessingBatchEnd,b);e.setPlaybackFunction(function(b){h.emit(ops.OdtDocument.signalOperationStart,b);return b.execute(h)?(h.emit(ops.OdtDocument.signalOperationEnd,b),!0):!1});e.setOperationFactory(c)};this.getOperationFactory=function(){return c};this.getOdtDocument=function(){return h};this.enqueue=function(b){n.push(b)};this.close=function(b){n.close(function(c){c?b(c):h.close(b)})};this.destroy=function(b){h.destroy(b)};this.setOperationRouter(new ops.TrivialOperationRouter)};
// Input 77
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.AnnotationController=function(g,k){function b(){var b=e.getCursor(k),b=b&&b.getNode(),a=!1;if(b){a:{for(a=e.getRootNode();b&&b!==a;){if(b.namespaceURI===m&&"annotation"===b.localName){b=!0;break a}b=b.parentNode}b=!1}a=!b}a!==r&&(r=a,q.emit(gui.AnnotationController.annotatableChanged,r))}function c(c){c.getMemberId()===k&&b()}function h(c){c===k&&b()}function n(c){c.getMemberId()===k&&b()}var e=g.getOdtDocument(),r=!1,q=new core.EventNotifier([gui.AnnotationController.annotatableChanged]),m=odf.Namespaces.officens;
this.isAnnotatable=function(){return r};this.addAnnotation=function(){var b=new ops.OpAddAnnotation,a=e.getCursorSelection(k),d=a.length,a=a.position;r&&(a=0<=d?a:a+d,d=Math.abs(d),b.init({memberid:k,position:a,length:d,name:k+Date.now()}),g.enqueue([b]))};this.removeAnnotation=function(b){var a,d;a=e.convertDomPointToCursorStep(b,0)+1;d=e.convertDomPointToCursorStep(b,b.childNodes.length);b=new ops.OpRemoveAnnotation;b.init({memberid:k,position:a,length:d-a});d=new ops.OpMoveCursor;d.init({memberid:k,
position:0<a?a-1:a,length:0});g.enqueue([b,d])};this.subscribe=function(b,a){q.subscribe(b,a)};this.unsubscribe=function(b,a){q.unsubscribe(b,a)};this.destroy=function(b){e.unsubscribe(ops.Document.signalCursorAdded,c);e.unsubscribe(ops.Document.signalCursorRemoved,h);e.unsubscribe(ops.Document.signalCursorMoved,n);b()};e.subscribe(ops.Document.signalCursorAdded,c);e.subscribe(ops.Document.signalCursorRemoved,h);e.subscribe(ops.Document.signalCursorMoved,n);b()};
gui.AnnotationController.annotatableChanged="annotatable/changed";(function(){return gui.AnnotationController})();
// Input 78
gui.Avatar=function(g,k){var b=this,c,h,n;this.setColor=function(b){h.style.borderColor=b};this.setImageUrl=function(c){b.isVisible()?h.src=c:n=c};this.isVisible=function(){return"block"===c.style.display};this.show=function(){n&&(h.src=n,n=void 0);c.style.display="block"};this.hide=function(){c.style.display="none"};this.markAsFocussed=function(b){b?c.classList.add("active"):c.classList.remove("active")};this.destroy=function(b){g.removeChild(c);b()};(function(){var b=g.ownerDocument,n=b.documentElement.namespaceURI;
c=b.createElementNS(n,"div");h=b.createElementNS(n,"img");h.width=64;h.height=64;c.appendChild(h);c.style.width="64px";c.style.height="70px";c.style.position="absolute";c.style.top="-80px";c.style.left="-34px";c.style.display=k?"block":"none";c.className="handle";g.appendChild(c)})()};
// Input 79
gui.Caret=function(g,k,b){function c(){q.style.opacity="0"===q.style.opacity?"1":"0";f.trigger()}function h(a,b){var d=a.getBoundingClientRect(),c=0,e=0;d&&b&&(c=Math.max(d.top,b.top),e=Math.min(d.bottom,b.bottom));return e-c}function n(){Object.keys(y).forEach(function(a){w[a]=y[a]})}function e(){var c,e,k,l;if(!1===y.isShown||g.getSelectionType()!==ops.OdtCursor.RangeSelection||!b&&!g.getSelectedRange().collapsed)y.visibility="hidden",q.style.visibility="hidden",f.cancel();else{y.visibility="visible";
q.style.visibility="visible";if(!1===y.isFocused)q.style.opacity="1",f.cancel();else{if(s||w.visibility!==y.visibility)q.style.opacity="1",f.cancel();f.trigger()}if(u||v||w.visibility!==y.visibility){c=g.getSelectedRange().cloneRange();e=g.getNode();var p=null;e.previousSibling&&(k=e.previousSibling.nodeType===Node.TEXT_NODE?e.previousSibling.textContent.length:e.previousSibling.childNodes.length,c.setStart(e.previousSibling,0<k?k-1:0),c.setEnd(e.previousSibling,k),(k=c.getBoundingClientRect())&&
k.height&&(p=k));e.nextSibling&&(c.setStart(e.nextSibling,0),c.setEnd(e.nextSibling,0<(e.nextSibling.nodeType===Node.TEXT_NODE?e.nextSibling.textContent.length:e.nextSibling.childNodes.length)?1:0),(k=c.getBoundingClientRect())&&k.height&&(!p||h(e,k)>h(e,p))&&(p=k));e=p;p=g.getDocument().getCanvas();c=p.getZoomLevel();p=d.getBoundingClientRect(p.getSizer());e?(q.style.top="0",k=d.getBoundingClientRect(q),8>e.height&&(e={top:e.top-(8-e.height)/2,height:8}),q.style.height=d.adaptRangeDifferenceToZoomLevel(e.height,
c)+"px",q.style.top=d.adaptRangeDifferenceToZoomLevel(e.top-k.top,c)+"px"):(q.style.height="1em",q.style.top="5%");a&&(e=runtime.getWindow().getComputedStyle(q,null),k=d.getBoundingClientRect(q),a.style.bottom=d.adaptRangeDifferenceToZoomLevel(p.bottom-k.bottom,c)+"px",a.style.left=d.adaptRangeDifferenceToZoomLevel(k.right-p.left,c)+"px",e.font?a.style.font=e.font:(a.style.fontStyle=e.fontStyle,a.style.fontVariant=e.fontVariant,a.style.fontWeight=e.fontWeight,a.style.fontSize=e.fontSize,a.style.lineHeight=
e.lineHeight,a.style.fontFamily=e.fontFamily))}if(v){var p=g.getDocument().getCanvas().getElement().parentNode,r;k=p.offsetWidth-p.clientWidth+5;l=p.offsetHeight-p.clientHeight+5;r=q.getBoundingClientRect();c=r.left-k;e=r.top-l;k=r.right+k;l=r.bottom+l;r=p.getBoundingClientRect();e<r.top?p.scrollTop-=r.top-e:l>r.bottom&&(p.scrollTop+=l-r.bottom);c<r.left?p.scrollLeft-=r.left-c:k>r.right&&(p.scrollLeft+=k-r.right)}}w.isFocused!==y.isFocused&&m.markAsFocussed(y.isFocused);n();u=v=s=!1}function r(a){p.removeChild(q);
a()}var q,m,p,a,d=new core.DomUtils,l,f,s=!1,v=!1,u=!1,y={isFocused:!1,isShown:!0,visibility:"hidden"},w={isFocused:!y.isFocused,isShown:!y.isShown,visibility:"hidden"};this.handleUpdate=function(){u=!0;"hidden"!==y.visibility&&(y.visibility="hidden",q.style.visibility="hidden");l.trigger()};this.refreshCursorBlinking=function(){s=!0;l.trigger()};this.setFocus=function(){y.isFocused=!0;l.trigger()};this.removeFocus=function(){y.isFocused=!1;l.trigger()};this.show=function(){y.isShown=!0;l.trigger()};
this.hide=function(){y.isShown=!1;l.trigger()};this.setAvatarImageUrl=function(a){m.setImageUrl(a)};this.setColor=function(a){q.style.borderColor=a;m.setColor(a)};this.getCursor=function(){return g};this.getFocusElement=function(){return q};this.toggleHandleVisibility=function(){m.isVisible()?m.hide():m.show()};this.showHandle=function(){m.show()};this.hideHandle=function(){m.hide()};this.setOverlayElement=function(b){a=b;u=!0;l.trigger()};this.ensureVisible=function(){v=!0;l.trigger()};this.destroy=
function(a){core.Async.destroyAll([l.destroy,f.destroy,m.destroy,r],a)};(function(){var a=g.getDocument().getDOMDocument();q=a.createElementNS(a.documentElement.namespaceURI,"span");q.className="caret";q.style.top="5%";p=g.getNode();p.appendChild(q);m=new gui.Avatar(p,k);l=core.Task.createRedrawTask(e);f=core.Task.createTimeoutTask(c,500);l.triggerImmediate()})()};
// Input 80
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
odf.TextSerializer=function(){function g(c){var h="",n=k.filter?k.filter.acceptNode(c):NodeFilter.FILTER_ACCEPT,e=c.nodeType,r;if((n===NodeFilter.FILTER_ACCEPT||n===NodeFilter.FILTER_SKIP)&&b.isTextContentContainingNode(c))for(r=c.firstChild;r;)h+=g(r),r=r.nextSibling;n===NodeFilter.FILTER_ACCEPT&&(e===Node.ELEMENT_NODE&&b.isParagraph(c)?h+="\n":e===Node.TEXT_NODE&&c.textContent&&(h+=c.textContent));return h}var k=this,b=new odf.OdfUtils;this.filter=null;this.writeToString=function(b){if(!b)return"";
b=g(b);"\n"===b[b.length-1]&&(b=b.substr(0,b.length-1));return b}};
// Input 81
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.MimeDataExporter=function(){var g,k;this.exportRangeToDataTransfer=function(b,c){var h;h=c.startContainer.ownerDocument.createElement("span");h.appendChild(c.cloneContents());h=g.writeToString(h);try{b.setData("text/plain",h)}catch(k){b.setData("Text",h)}};g=new odf.TextSerializer;k=new odf.OdfNodeFilter;g.filter=k};
// Input 82
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
gui.Clipboard=function(g){this.setDataFromRange=function(k,b){var c,h=k.clipboardData;c=runtime.getWindow();!h&&c&&(h=c.clipboardData);h?(c=!0,g.exportRangeToDataTransfer(h,b),k.preventDefault()):c=!1;return c}};
// Input 83
/*

 Copyright (C) 2012-2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
gui.StyleSummary=function(g){function k(b,c){var k=b+"|"+c,q;h.hasOwnProperty(k)||(q=[],g.forEach(function(h){h=(h=h[b])&&h[c];-1===q.indexOf(h)&&q.push(h)}),h[k]=q);return h[k]}function b(b,c,h){return function(){var g=k(b,c);return h.length>=g.length&&g.every(function(b){return-1!==h.indexOf(b)})}}function c(b,c){var h=k(b,c);return 1===h.length?h[0]:void 0}var h={};this.getPropertyValues=k;this.getCommonValue=c;this.isBold=b("style:text-properties","fo:font-weight",["bold"]);this.isItalic=b("style:text-properties",
"fo:font-style",["italic"]);this.hasUnderline=b("style:text-properties","style:text-underline-style",["solid"]);this.hasStrikeThrough=b("style:text-properties","style:text-line-through-style",["solid"]);this.fontSize=function(){var b=c("style:text-properties","fo:font-size");return b&&parseFloat(b)};this.fontName=function(){return c("style:text-properties","style:font-name")};this.isAlignedLeft=b("style:paragraph-properties","fo:text-align",["left","start"]);this.isAlignedCenter=b("style:paragraph-properties",
"fo:text-align",["center"]);this.isAlignedRight=b("style:paragraph-properties","fo:text-align",["right","end"]);this.isAlignedJustified=b("style:paragraph-properties","fo:text-align",["justify"]);this.text={isBold:this.isBold,isItalic:this.isItalic,hasUnderline:this.hasUnderline,hasStrikeThrough:this.hasStrikeThrough,fontSize:this.fontSize,fontName:this.fontName};this.paragraph={isAlignedLeft:this.isAlignedLeft,isAlignedCenter:this.isAlignedCenter,isAlignedRight:this.isAlignedRight,isAlignedJustified:this.isAlignedJustified}};
// Input 84
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
gui.DirectFormattingController=function(g,k,b,c){function h(a){var b;a.collapsed?(b=a.startContainer,b.hasChildNodes()&&a.startOffset<b.childNodes.length&&(b=b.childNodes.item(a.startOffset)),a=[b]):a=S.getTextNodes(a,!0);return a}function n(a,b){var d={};Object.keys(a).forEach(function(c){var e=a[c](),f=b[c]();e!==f&&(d[c]=f)});return d}function e(){var a,b,d;a=(a=(a=C.getCursor(k))&&a.getSelectedRange())?h(a):[];a=C.getFormatting().getAppliedStyles(a);a[0]&&U&&(a[0]=W.mergeObjects(a[0],U));K=a;
d=new gui.StyleSummary(K);a=n(L.text,d.text);b=n(L.paragraph,d.paragraph);L=d;0<Object.keys(a).length&&V.emit(gui.DirectFormattingController.textStylingChanged,a);0<Object.keys(b).length&&V.emit(gui.DirectFormattingController.paragraphStylingChanged,b)}function r(a){("string"===typeof a?a:a.getMemberId())===k&&e()}function q(){e()}function m(a){var b=C.getCursor(k);a=a.paragraphElement;b&&C.getParagraphElement(b.getNode())===a&&e()}function p(a,b){b(!a());return!0}function a(a){var b=C.getCursorSelection(k),
d={"style:text-properties":a};0!==b.length?(a=new ops.OpApplyDirectStyling,a.init({memberid:k,position:b.position,length:b.length,setProperties:d}),g.enqueue([a])):(U=W.mergeObjects(U||{},d),e())}function d(b,d){var c={};c[b]=d;a(c)}function l(a){a=a.spec();U&&a.memberid===k&&"SplitParagraph"!==a.optype&&(U=null,e())}function f(a){d("fo:font-weight",a?"bold":"normal")}function s(a){d("fo:font-style",a?"italic":"normal")}function v(a){d("style:text-underline-style",a?"solid":"none")}function u(a){d("style:text-line-through-style",
a?"solid":"none")}function y(a){return a===ops.OdtStepsTranslator.NEXT_STEP}function w(a){var d=C.getCursor(k).getSelectedRange(),d=S.getParagraphElements(d),c=C.getFormatting(),e=[],f={},h;d.forEach(function(d){var g=C.convertDomPointToCursorStep(d,0,y),l=d.getAttributeNS(odf.Namespaces.textns,"style-name"),n;d=l?f.hasOwnProperty(l)?f[l]:void 0:h;d||(d=b.generateStyleName(),l?(f[l]=d,n=c.createDerivedStyleObject(l,"paragraph",{})):(h=d,n={}),n=a(n),l=new ops.OpAddStyle,l.init({memberid:k,styleName:d.toString(),
styleFamily:"paragraph",isAutomaticStyle:!0,setProperties:n}),e.push(l));l=new ops.OpSetParagraphStyle;l.init({memberid:k,styleName:d.toString(),position:g});e.push(l)});g.enqueue(e)}function z(a){w(function(b){return W.mergeObjects(b,a)})}function t(a){z({"style:paragraph-properties":{"fo:text-align":a}})}function B(a,b){var d=C.getFormatting().getDefaultTabStopDistance(),c=b["style:paragraph-properties"],e;c&&(c=c["fo:margin-left"])&&(e=S.parseLength(c));return W.mergeObjects(b,{"style:paragraph-properties":{"fo:margin-left":e&&
e.unit===d.unit?e.value+a*d.value+e.unit:a*d.value+d.unit}})}function J(a,b){var d=h(a),c=C.getFormatting().getAppliedStyles(d)[0],e=C.getFormatting().getAppliedStylesForElement(b);if(!c||"text"!==c["style:family"]||!c["style:text-properties"])return!1;if(!e||!e["style:text-properties"])return!0;c=c["style:text-properties"];e=e["style:text-properties"];return!Object.keys(c).every(function(a){return c[a]===e[a]})}function I(){}var M=this,C=g.getOdtDocument(),W=new core.Utils,S=new odf.OdfUtils,V=new core.EventNotifier([gui.DirectFormattingController.textStylingChanged,
gui.DirectFormattingController.paragraphStylingChanged]),E=odf.Namespaces.textns,ea=core.PositionFilter.FilterResult.FILTER_ACCEPT,U,K=[],L=new gui.StyleSummary(K);this.formatTextSelection=a;this.createCursorStyleOp=function(a,b,d){var c=null;(d=d?K[0]:U)&&d["style:text-properties"]&&(c=new ops.OpApplyDirectStyling,c.init({memberid:k,position:a,length:b,setProperties:{"style:text-properties":d["style:text-properties"]}}),U=null,e());return c};this.setBold=f;this.setItalic=s;this.setHasUnderline=v;
this.setHasStrikethrough=u;this.setFontSize=function(a){d("fo:font-size",a+"pt")};this.setFontName=function(a){d("style:font-name",a)};this.getAppliedStyles=function(){return K};this.toggleBold=p.bind(M,function(){return L.isBold()},f);this.toggleItalic=p.bind(M,function(){return L.isItalic()},s);this.toggleUnderline=p.bind(M,function(){return L.hasUnderline()},v);this.toggleStrikethrough=p.bind(M,function(){return L.hasStrikeThrough()},u);this.isBold=function(){return L.isBold()};this.isItalic=function(){return L.isItalic()};
this.hasUnderline=function(){return L.hasUnderline()};this.hasStrikeThrough=function(){return L.hasStrikeThrough()};this.fontSize=function(){return L.fontSize()};this.fontName=function(){return L.fontName()};this.isAlignedLeft=function(){return L.isAlignedLeft()};this.isAlignedCenter=function(){return L.isAlignedCenter()};this.isAlignedRight=function(){return L.isAlignedRight()};this.isAlignedJustified=function(){return L.isAlignedJustified()};this.alignParagraphLeft=function(){t("left");return!0};
this.alignParagraphCenter=function(){t("center");return!0};this.alignParagraphRight=function(){t("right");return!0};this.alignParagraphJustified=function(){t("justify");return!0};this.indent=function(){w(B.bind(null,1));return!0};this.outdent=function(){w(B.bind(null,-1));return!0};this.createParagraphStyleOps=function(a){var d=C.getCursor(k),c=d.getSelectedRange(),e=[],f,h;d.hasForwardSelection()?(f=d.getAnchorNode(),h=d.getNode()):(f=d.getNode(),h=d.getAnchorNode());d=C.getParagraphElement(h);runtime.assert(Boolean(d),
"DirectFormattingController: Cursor outside paragraph");var g;a:{g=d;var l=gui.SelectionMover.createPositionIterator(g),n=new core.PositionFilterChain;n.addFilter(C.getPositionFilter());n.addFilter(C.createRootFilter(k));for(l.setUnfilteredPosition(c.endContainer,c.endOffset);l.nextPosition();)if(n.acceptPosition(l)===ea){g=C.getParagraphElement(l.getCurrentNode())!==g;break a}g=!0}if(!g)return e;h!==f&&(d=C.getParagraphElement(f));if(!U&&!J(c,d))return e;c=K[0];if(!c)return e;if(f=d.getAttributeNS(E,
"style-name"))c={"style:text-properties":c["style:text-properties"]},c=C.getFormatting().createDerivedStyleObject(f,"paragraph",c);d=b.generateStyleName();f=new ops.OpAddStyle;f.init({memberid:k,styleName:d,styleFamily:"paragraph",isAutomaticStyle:!0,setProperties:c});e.push(f);f=new ops.OpSetParagraphStyle;f.init({memberid:k,styleName:d,position:a});e.push(f);return e};this.subscribe=function(a,b){V.subscribe(a,b)};this.unsubscribe=function(a,b){V.unsubscribe(a,b)};this.destroy=function(a){C.unsubscribe(ops.Document.signalCursorAdded,
r);C.unsubscribe(ops.Document.signalCursorRemoved,r);C.unsubscribe(ops.Document.signalCursorMoved,r);C.unsubscribe(ops.OdtDocument.signalParagraphStyleModified,q);C.unsubscribe(ops.OdtDocument.signalParagraphChanged,m);C.unsubscribe(ops.OdtDocument.signalOperationEnd,l);a()};(function(){C.subscribe(ops.Document.signalCursorAdded,r);C.subscribe(ops.Document.signalCursorRemoved,r);C.subscribe(ops.Document.signalCursorMoved,r);C.subscribe(ops.OdtDocument.signalParagraphStyleModified,q);C.subscribe(ops.OdtDocument.signalParagraphChanged,
m);C.subscribe(ops.OdtDocument.signalOperationEnd,l);e();c||(M.alignParagraphCenter=I,M.alignParagraphJustified=I,M.alignParagraphLeft=I,M.alignParagraphRight=I,M.createParagraphStyleOps=function(){return[]},M.indent=I,M.outdent=I)})()};gui.DirectFormattingController.textStylingChanged="textStyling/changed";gui.DirectFormattingController.paragraphStylingChanged="paragraphStyling/changed";(function(){return gui.DirectFormattingController})();
// Input 85
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
gui.KeyboardHandler=function(){function g(b,c){c||(c=k.None);switch(b){case gui.KeyboardHandler.KeyCode.LeftMeta:case gui.KeyboardHandler.KeyCode.RightMeta:case gui.KeyboardHandler.KeyCode.MetaInMozilla:c|=k.Meta;break;case gui.KeyboardHandler.KeyCode.Ctrl:c|=k.Ctrl;break;case gui.KeyboardHandler.KeyCode.Alt:c|=k.Alt;break;case gui.KeyboardHandler.KeyCode.Shift:c|=k.Shift}return b+":"+c}var k=gui.KeyboardHandler.Modifier,b=null,c={};this.setDefault=function(c){b=c};this.bind=function(b,k,e,r){b=g(b,
k);runtime.assert(r||!1===c.hasOwnProperty(b),"tried to overwrite the callback handler of key combo: "+b);c[b]=e};this.unbind=function(b,k){var e=g(b,k);delete c[e]};this.reset=function(){b=null;c={}};this.handleEvent=function(h){var n=h.keyCode,e=k.None;h.metaKey&&(e|=k.Meta);h.ctrlKey&&(e|=k.Ctrl);h.altKey&&(e|=k.Alt);h.shiftKey&&(e|=k.Shift);n=g(n,e);n=c[n];e=!1;n?e=n():null!==b&&(e=b(h));e&&(h.preventDefault?h.preventDefault():h.returnValue=!1)}};
gui.KeyboardHandler.Modifier={None:0,Meta:1,Ctrl:2,Alt:4,CtrlAlt:6,Shift:8,MetaShift:9,CtrlShift:10,AltShift:12};gui.KeyboardHandler.KeyCode={Backspace:8,Tab:9,Clear:12,Enter:13,Shift:16,Ctrl:17,Alt:18,End:35,Home:36,Left:37,Up:38,Right:39,Down:40,Delete:46,A:65,B:66,C:67,D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90,LeftMeta:91,RightMeta:93,MetaInMozilla:224};(function(){return gui.KeyboardHandler})();
// Input 86
gui.HyperlinkClickHandler=function(g,k,b){function c(){var a=g();runtime.assert(Boolean(a.classList),"Document container has no classList element");a.classList.remove("webodf-inactiveLinks")}function h(){var a=g();runtime.assert(Boolean(a.classList),"Document container has no classList element");a.classList.add("webodf-inactiveLinks")}function n(){a.removeEventListener("focus",h,!1);l.forEach(function(a){k.unbind(a.keyCode,a.modifier);b.unbind(a.keyCode,a.modifier)});l.length=0}function e(d){n();
if(d!==r.None){a.addEventListener("focus",h,!1);switch(d){case r.Ctrl:l.push({keyCode:q.Ctrl,modifier:r.None});break;case r.Meta:l.push({keyCode:q.LeftMeta,modifier:r.None}),l.push({keyCode:q.RightMeta,modifier:r.None}),l.push({keyCode:q.MetaInMozilla,modifier:r.None})}l.forEach(function(a){k.bind(a.keyCode,a.modifier,c);b.bind(a.keyCode,a.modifier,h)})}}var r=gui.KeyboardHandler.Modifier,q=gui.KeyboardHandler.KeyCode,m=xmldom.XPath,p=new odf.OdfUtils,a=runtime.getWindow(),d=r.None,l=[];runtime.assert(null!==
a,"Expected to be run in an environment which has a global window, like a browser.");this.handleClick=function(b){var c=b.target||b.srcElement,e,h;b.ctrlKey?e=r.Ctrl:b.metaKey&&(e=r.Meta);if(d===r.None||d===e){a:{for(;null!==c;){if(p.isHyperlink(c))break a;if(p.isParagraph(c))break;c=c.parentNode}c=null}c&&(c=p.getHyperlinkTarget(c),""!==c&&("#"===c[0]?(c=c.substring(1),e=g(),h=m.getODFElementsWithXPath(e,"//text:bookmark-start[@text:name='"+c+"']",odf.Namespaces.lookupNamespaceURI),0===h.length&&
(h=m.getODFElementsWithXPath(e,"//text:bookmark[@text:name='"+c+"']",odf.Namespaces.lookupNamespaceURI)),0<h.length&&h[0].scrollIntoView(!0)):a.open(c),b.preventDefault?b.preventDefault():b.returnValue=!1))}};this.setModifier=function(a){d!==a&&(runtime.assert(a===r.None||a===r.Ctrl||a===r.Meta,"Unsupported KeyboardHandler.Modifier value: "+a),d=a,d!==r.None?h():c(),e(d))};this.getModifier=function(){return d};this.destroy=function(a){h();n();a()}};
// Input 87
gui.HyperlinkController=function(g,k){var b=new odf.OdfUtils,c=g.getOdtDocument();this.addHyperlink=function(b,n){var e=c.getCursorSelection(k),r=new ops.OpApplyHyperlink,q=[];if(0===e.length||n)n=n||b,r=new ops.OpInsertText,r.init({memberid:k,position:e.position,text:n}),e.length=n.length,q.push(r);r=new ops.OpApplyHyperlink;r.init({memberid:k,position:e.position,length:e.length,hyperlink:b});q.push(r);g.enqueue(q)};this.removeHyperlinks=function(){var h=gui.SelectionMover.createPositionIterator(c.getRootNode()),
n=c.getCursor(k).getSelectedRange(),e=b.getHyperlinkElements(n),r=n.collapsed&&1===e.length,q=c.getDOMDocument().createRange(),m=[],p,a;0!==e.length&&(e.forEach(function(b){q.selectNodeContents(b);p=c.convertDomToCursorRange({anchorNode:q.startContainer,anchorOffset:q.startOffset,focusNode:q.endContainer,focusOffset:q.endOffset});a=new ops.OpRemoveHyperlink;a.init({memberid:k,position:p.position,length:p.length});m.push(a)}),r||(r=e[0],-1===n.comparePoint(r,0)&&(q.setStart(r,0),q.setEnd(n.startContainer,
n.startOffset),p=c.convertDomToCursorRange({anchorNode:q.startContainer,anchorOffset:q.startOffset,focusNode:q.endContainer,focusOffset:q.endOffset}),0<p.length&&(a=new ops.OpApplyHyperlink,a.init({memberid:k,position:p.position,length:p.length,hyperlink:b.getHyperlinkTarget(r)}),m.push(a))),e=e[e.length-1],h.moveToEndOfNode(e),h=h.unfilteredDomOffset(),1===n.comparePoint(e,h)&&(q.setStart(n.endContainer,n.endOffset),q.setEnd(e,h),p=c.convertDomToCursorRange({anchorNode:q.startContainer,anchorOffset:q.startOffset,
focusNode:q.endContainer,focusOffset:q.endOffset}),0<p.length&&(a=new ops.OpApplyHyperlink,a.init({memberid:k,position:p.position,length:p.length,hyperlink:b.getHyperlinkTarget(e)}),m.push(a)))),g.enqueue(m),q.detach())}};
// Input 88
gui.EventManager=function(g){function k(a){function b(a,d,c){var e,f=!1;e="on"+d;a.attachEvent&&(a.attachEvent(e,c),f=!0);!f&&a.addEventListener&&(a.addEventListener(d,c,!1),f=!0);f&&!z[d]||!a.hasOwnProperty(e)||(a[e]=c)}function d(a,b,c){var e="on"+b;a.detachEvent&&a.detachEvent(e,c);a.removeEventListener&&a.removeEventListener(b,c,!1);a[e]===c&&(a[e]=null)}function c(b){-1===f.indexOf(b)&&(f.push(b),e.filters.every(function(a){return a(b)})&&h.emit(a,b),runtime.setTimeout(function(){f.splice(f.indexOf(b),
1)},0))}var e=this,f=[],h=new core.EventNotifier([a]);this.filters=[];this.subscribe=function(b){h.subscribe(a,b)};this.unsubscribe=function(b){h.unsubscribe(a,b)};this.destroy=function(){d(w,a,c);d(I,a,c);d(M,a,c)};t[a]&&b(w,a,c);b(I,a,c);b(M,a,c)}function b(a,b,d){function c(b){d(b,e,function(b){b.type=a;f.emit(a,b)})}var e={},f=new core.EventNotifier([a]);this.subscribe=function(b){f.subscribe(a,b)};this.unsubscribe=function(b){f.unsubscribe(a,b)};this.destroy=function(){b.forEach(function(a){C.unsubscribe(a,
c)})};(function(){b.forEach(function(a){C.subscribe(a,c)})})()}function c(a){runtime.clearTimeout(a);delete W[a]}function h(a,b){var d=runtime.setTimeout(function(){a();c(d)},b);W[d]=!0;return d}function n(a,b,d){var e=a.touches.length,f=a.touches[0],g=b.timer;"touchmove"===a.type||"touchend"===a.type?g&&c(g):"touchstart"===a.type&&(1!==e?runtime.clearTimeout(g):g=h(function(){d({clientX:f.clientX,clientY:f.clientY,pageX:f.pageX,pageY:f.pageY,target:a.target||a.srcElement||null,detail:1})},400));
b.timer=g}function e(a,b,d){var c=a.touches[0],e=a.target||a.srcElement||null,f=b.target;1!==a.touches.length||"touchend"===a.type?f=null:"touchstart"===a.type&&"webodf-draggable"===e.getAttribute("class")?f=e:"touchmove"===a.type&&f&&(a.preventDefault(),a.stopPropagation(),d({clientX:c.clientX,clientY:c.clientY,pageX:c.pageX,pageY:c.pageY,target:f,detail:1}));b.target=f}function r(a,b,d){var c=a.target||a.srcElement||null,e=b.dragging;"drag"===a.type?e=!0:"touchend"===a.type&&e&&(e=!1,a=a.changedTouches[0],
d({clientX:a.clientX,clientY:a.clientY,pageX:a.pageX,pageY:a.pageY,target:c,detail:1}));b.dragging=e}function q(){M.classList.add("webodf-touchEnabled");C.unsubscribe("touchstart",q)}function m(a){var b=a.scrollX,d=a.scrollY;this.restore=function(){a.scrollX===b&&a.scrollY===d||a.scrollTo(b,d)}}function p(a){var b=a.scrollTop,d=a.scrollLeft;this.restore=function(){if(a.scrollTop!==b||a.scrollLeft!==d)a.scrollTop=b,a.scrollLeft=d}}function a(a,b){var d=J[a]||B[a]||null;!d&&b&&(d=J[a]=new k(a));return d}
function d(b,d){a(b,!0).subscribe(d)}function l(b,d){var c=a(b,!1);c&&c.unsubscribe(d)}function f(){return g.getDOMDocument().activeElement===I}function s(){f()&&I.blur();I.setAttribute("disabled","true")}function v(){I.removeAttribute("disabled")}function u(a){for(var b=[];a;)(a.scrollWidth>a.clientWidth||a.scrollHeight>a.clientHeight)&&b.push(new p(a)),a=a.parentNode;b.push(new m(w));return b}function y(){var a;f()||(a=u(I),v(),I.focus(),a.forEach(function(a){a.restore()}))}var w=runtime.getWindow(),
z={beforecut:!0,beforepaste:!0,longpress:!0,drag:!0,dragstop:!0},t={mousedown:!0,mouseup:!0,focus:!0},B={},J={},I,M=g.getCanvas().getElement(),C=this,W={};this.addFilter=function(b,d){a(b,!0).filters.push(d)};this.removeFilter=function(b,d){var c=a(b,!0),e=c.filters.indexOf(d);-1!==e&&c.filters.splice(e,1)};this.subscribe=d;this.unsubscribe=l;this.hasFocus=f;this.focus=y;this.getEventTrap=function(){return I};this.setEditing=function(a){var b=f();b&&I.blur();a?I.removeAttribute("readOnly"):I.setAttribute("readOnly",
"true");b&&y()};this.destroy=function(a){l("touchstart",q);Object.keys(W).forEach(function(a){c(parseInt(a,10))});W.length=0;Object.keys(B).forEach(function(a){B[a].destroy()});B={};l("mousedown",s);l("mouseup",v);l("contextmenu",v);Object.keys(J).forEach(function(a){J[a].destroy()});J={};I.parentNode.removeChild(I);a()};(function(){var a=g.getOdfCanvas().getSizer(),c=a.ownerDocument;runtime.assert(Boolean(w),"EventManager requires a window object to operate correctly");I=c.createElement("input");
I.id="eventTrap";I.setAttribute("tabindex","-1");I.setAttribute("readOnly","true");a.appendChild(I);d("mousedown",s);d("mouseup",v);d("contextmenu",v);B.longpress=new b("longpress",["touchstart","touchmove","touchend"],n);B.drag=new b("drag",["touchstart","touchmove","touchend"],e);B.dragstop=new b("dragstop",["drag","touchend"],r);d("touchstart",q)})()};
// Input 89
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.IOSSafariSupport=function(g){function k(){b.innerHeight!==b.outerHeight&&(c.style.display="none",runtime.requestAnimationFrame(function(){c.style.display="block"}))}var b=runtime.getWindow(),c=g.getEventTrap();this.destroy=function(b){g.unsubscribe("focus",k);c.removeAttribute("autocapitalize");c.style.WebkitTransform="";b()};g.subscribe("focus",k);c.setAttribute("autocapitalize","off");c.style.WebkitTransform="translateX(-10000px)"};
// Input 90
gui.ImageController=function(g,k,b){var c={"image/gif":".gif","image/jpeg":".jpg","image/png":".png"},h=odf.Namespaces.textns,n=g.getOdtDocument(),e=n.getFormatting();this.insertImage=function(r,q,m,p){runtime.assert(0<m&&0<p,"Both width and height of the image should be greater than 0px.");p={width:m,height:p};if(m=n.getParagraphElement(n.getCursor(k).getNode()).getAttributeNS(h,"style-name")){m=e.getContentSize(m,"paragraph");var a=1,d=1;p.width>m.width&&(a=m.width/p.width);p.height>m.height&&(d=
m.height/p.height);m=Math.min(a,d);p={width:p.width*m,height:p.height*m}}m=p.width+"px";p=p.height+"px";var l=n.getOdfCanvas().odfContainer().rootElement.styles,a=r.toLowerCase(),d=c.hasOwnProperty(a)?c[a]:null,f,a=[];runtime.assert(null!==d,"Image type is not supported: "+r);d="Pictures/"+b.generateImageName()+d;f=new ops.OpSetBlob;f.init({memberid:k,filename:d,mimetype:r,content:q});a.push(f);e.getStyleElement("Graphics","graphic",[l])||(r=new ops.OpAddStyle,r.init({memberid:k,styleName:"Graphics",
styleFamily:"graphic",isAutomaticStyle:!1,setProperties:{"style:graphic-properties":{"text:anchor-type":"paragraph","svg:x":"0cm","svg:y":"0cm","style:wrap":"dynamic","style:number-wrapped-paragraphs":"no-limit","style:wrap-contour":"false","style:vertical-pos":"top","style:vertical-rel":"paragraph","style:horizontal-pos":"center","style:horizontal-rel":"paragraph"}}}),a.push(r));r=b.generateStyleName();q=new ops.OpAddStyle;q.init({memberid:k,styleName:r,styleFamily:"graphic",isAutomaticStyle:!0,
setProperties:{"style:parent-style-name":"Graphics","style:graphic-properties":{"style:vertical-pos":"top","style:vertical-rel":"baseline","style:horizontal-pos":"center","style:horizontal-rel":"paragraph","fo:background-color":"transparent","style:background-transparency":"100%","style:shadow":"none","style:mirror":"none","fo:clip":"rect(0cm, 0cm, 0cm, 0cm)","draw:luminance":"0%","draw:contrast":"0%","draw:red":"0%","draw:green":"0%","draw:blue":"0%","draw:gamma":"100%","draw:color-inversion":"false",
"draw:image-opacity":"100%","draw:color-mode":"standard"}}});a.push(q);f=new ops.OpInsertImage;f.init({memberid:k,position:n.getCursorPosition(k),filename:d,frameWidth:m,frameHeight:p,frameStyleName:r,frameName:b.generateFrameName()});a.push(f);g.enqueue(a)}};
// Input 91
gui.ImageSelector=function(g){function k(){var b=g.getSizer(),k=h.createElement("div");k.id="imageSelector";k.style.borderWidth="1px";b.appendChild(k);c.forEach(function(b){var c=h.createElement("div");c.className=b;k.appendChild(c)});return k}var b=odf.Namespaces.svgns,c="topLeft topRight bottomRight bottomLeft topMiddle rightMiddle bottomMiddle leftMiddle".split(" "),h=g.getElement().ownerDocument,n=!1;this.select=function(c){var r,q,m=h.getElementById("imageSelector");m||(m=k());n=!0;r=m.parentNode;
q=c.getBoundingClientRect();var p=r.getBoundingClientRect(),a=g.getZoomLevel();r=(q.left-p.left)/a-1;q=(q.top-p.top)/a-1;m.style.display="block";m.style.left=r+"px";m.style.top=q+"px";m.style.width=c.getAttributeNS(b,"width");m.style.height=c.getAttributeNS(b,"height")};this.clearSelection=function(){var b;n&&(b=h.getElementById("imageSelector"))&&(b.style.display="none");n=!1};this.isSelectorElement=function(b){var c=h.getElementById("imageSelector");return c?b===c||b.parentNode===c:!1}};
// Input 92
(function(){function g(g){function b(b){e=b.which&&String.fromCharCode(b.which)===n;n=void 0;return!1===e}function c(){e=!1}function h(b){n=b.data;e=!1}var n,e=!1;this.destroy=function(e){g.unsubscribe("textInput",c);g.unsubscribe("compositionend",h);g.removeFilter("keypress",b);e()};g.subscribe("textInput",c);g.subscribe("compositionend",h);g.addFilter("keypress",b)}gui.InputMethodEditor=function(k,b){function c(b){d&&(b?d.getNode().setAttributeNS(a,"composing","true"):(d.getNode().removeAttributeNS(a,
"composing"),s.textContent=""))}function h(){y&&(y=!1,c(!1),z.emit(gui.InputMethodEditor.signalCompositionEnd,{data:w}),w="")}function n(){h();d&&d.getSelectedRange().collapsed?l.value="":l.value=v;l.setSelectionRange(0,l.value.length)}function e(){b.hasFocus()&&u.trigger()}function r(){t=void 0;u.cancel();c(!0);y||z.emit(gui.InputMethodEditor.signalCompositionStart,{data:""})}function q(a){a=t=a.data;y=!0;w+=a;u.trigger()}function m(a){a.data!==t&&(a=a.data,y=!0,w+=a,u.trigger());t=void 0}function p(){s.textContent=
l.value}var a="urn:webodf:names:cursor",d=null,l=b.getEventTrap(),f=l.ownerDocument,s,v="b",u,y=!1,w="",z=new core.EventNotifier([gui.InputMethodEditor.signalCompositionStart,gui.InputMethodEditor.signalCompositionEnd]),t,B=[],J;this.subscribe=z.subscribe;this.unsubscribe=z.unsubscribe;this.registerCursor=function(a){a.getMemberId()===k&&(d=a,d.getNode().appendChild(s),a.subscribe(ops.OdtCursor.signalCursorUpdated,e),b.subscribe("input",p),b.subscribe("compositionupdate",p))};this.removeCursor=function(a){d&&
a===k&&(d.getNode().removeChild(s),d.unsubscribe(ops.OdtCursor.signalCursorUpdated,e),b.unsubscribe("input",p),b.unsubscribe("compositionupdate",p),d=null)};this.destroy=function(a){b.unsubscribe("compositionstart",r);b.unsubscribe("compositionend",q);b.unsubscribe("textInput",m);b.unsubscribe("keypress",h);b.unsubscribe("focus",n);core.Async.destroyAll(J,a)};(function(){b.subscribe("compositionstart",r);b.subscribe("compositionend",q);b.subscribe("textInput",m);b.subscribe("keypress",h);b.subscribe("focus",
n);B.push(new g(b));J=B.map(function(a){return a.destroy});s=f.createElement("span");s.setAttribute("id","composer");u=core.Task.createTimeoutTask(n,1);J.push(u.destroy)})()};gui.InputMethodEditor.signalCompositionStart="input/compositionstart";gui.InputMethodEditor.signalCompositionEnd="input/compositionend";return gui.InputMethodEditor})();
// Input 93
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
gui.PlainTextPasteboard=function(g,k){function b(b,h){b.init(h);return b}this.createPasteOps=function(c){var h=g.getCursorPosition(k),n=h,e=[];c=c.replace(/\r/g,"").split("\n");1===c.length?e.push(b(new ops.OpInsertText,{memberid:k,position:n,text:c[0],moveCursor:!0})):1<c.length&&(c.forEach(function(c){e.push(b(new ops.OpSplitParagraph,{memberid:k,position:n,moveCursor:!0}));n+=1;e.push(b(new ops.OpInsertText,{memberid:k,position:n,text:c,moveCursor:!0}));n+=c.length}),e.push(b(new ops.OpRemoveText,
{memberid:k,position:h,length:1})));return e}};
// Input 94
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
odf.WordBoundaryFilter=function(g,k){function b(a,b,d){for(var c=null,e=g.getRootNode(),h;a!==e&&null!==a&&null===c;)h=0>b?a.previousSibling:a.nextSibling,d(h)===NodeFilter.FILTER_ACCEPT&&(c=h),a=a.parentNode;return c}function c(a,b){var d;return null===a?l.NO_NEIGHBOUR:e.isCharacterElement(a)?l.SPACE_CHAR:a.nodeType===h||e.isTextSpan(a)||e.isHyperlink(a)?(d=a.textContent.charAt(b()),q.test(d)?l.SPACE_CHAR:r.test(d)?l.PUNCTUATION_CHAR:l.WORD_CHAR):l.OTHER}var h=Node.TEXT_NODE,n=Node.ELEMENT_NODE,
e=new odf.OdfUtils,r=/[!-#%-*,-\/:-;?-@\[-\]_{}\u00a1\u00ab\u00b7\u00bb\u00bf;\u00b7\u055a-\u055f\u0589-\u058a\u05be\u05c0\u05c3\u05c6\u05f3-\u05f4\u0609-\u060a\u060c-\u060d\u061b\u061e-\u061f\u066a-\u066d\u06d4\u0700-\u070d\u07f7-\u07f9\u0964-\u0965\u0970\u0df4\u0e4f\u0e5a-\u0e5b\u0f04-\u0f12\u0f3a-\u0f3d\u0f85\u0fd0-\u0fd4\u104a-\u104f\u10fb\u1361-\u1368\u166d-\u166e\u169b-\u169c\u16eb-\u16ed\u1735-\u1736\u17d4-\u17d6\u17d8-\u17da\u1800-\u180a\u1944-\u1945\u19de-\u19df\u1a1e-\u1a1f\u1b5a-\u1b60\u1c3b-\u1c3f\u1c7e-\u1c7f\u2000-\u206e\u207d-\u207e\u208d-\u208e\u3008-\u3009\u2768-\u2775\u27c5-\u27c6\u27e6-\u27ef\u2983-\u2998\u29d8-\u29db\u29fc-\u29fd\u2cf9-\u2cfc\u2cfe-\u2cff\u2e00-\u2e7e\u3000-\u303f\u30a0\u30fb\ua60d-\ua60f\ua673\ua67e\ua874-\ua877\ua8ce-\ua8cf\ua92e-\ua92f\ua95f\uaa5c-\uaa5f\ufd3e-\ufd3f\ufe10-\ufe19\ufe30-\ufe52\ufe54-\ufe61\ufe63\ufe68\ufe6a-\ufe6b\uff01-\uff03\uff05-\uff0a\uff0c-\uff0f\uff1a-\uff1b\uff1f-\uff20\uff3b-\uff3d\uff3f\uff5b\uff5d\uff5f-\uff65]|\ud800[\udd00-\udd01\udf9f\udfd0]|\ud802[\udd1f\udd3f\ude50-\ude58]|\ud809[\udc00-\udc7e]/,
q=/\s/,m=core.PositionFilter.FilterResult.FILTER_ACCEPT,p=core.PositionFilter.FilterResult.FILTER_REJECT,a=odf.WordBoundaryFilter.IncludeWhitespace.TRAILING,d=odf.WordBoundaryFilter.IncludeWhitespace.LEADING,l={NO_NEIGHBOUR:0,SPACE_CHAR:1,PUNCTUATION_CHAR:2,WORD_CHAR:3,OTHER:4};this.acceptPosition=function(e){var h=e.container(),g=e.leftNode(),q=e.rightNode(),r=e.unfilteredDomOffset,w=function(){return e.unfilteredDomOffset()-1};h.nodeType===n&&(null===q&&(q=b(h,1,e.getNodeFilter())),null===g&&(g=
b(h,-1,e.getNodeFilter())));h!==q&&(r=function(){return 0});h!==g&&null!==g&&(w=function(){return g.textContent.length-1});h=c(g,w);q=c(q,r);return h===l.WORD_CHAR&&q===l.WORD_CHAR||h===l.PUNCTUATION_CHAR&&q===l.PUNCTUATION_CHAR||k===a&&h!==l.NO_NEIGHBOUR&&q===l.SPACE_CHAR||k===d&&h===l.SPACE_CHAR&&q!==l.NO_NEIGHBOUR?p:m}};odf.WordBoundaryFilter.IncludeWhitespace={None:0,TRAILING:1,LEADING:2};(function(){return odf.WordBoundaryFilter})();
// Input 95
gui.SelectionController=function(g,k){function b(){var a=u.getCursor(k).getNode();return u.createStepIterator(a,0,[z,B],u.getRootElement(a))}function c(a,b,d){d=new odf.WordBoundaryFilter(u,d);var c=u.getRootElement(a),e=u.createRootFilter(c);return u.createStepIterator(a,b,[z,e,d],c)}function h(a,b){return b?{anchorNode:a.startContainer,anchorOffset:a.startOffset,focusNode:a.endContainer,focusOffset:a.endOffset}:{anchorNode:a.endContainer,anchorOffset:a.endOffset,focusNode:a.startContainer,focusOffset:a.startOffset}}
function n(a,b,d){var c=new ops.OpMoveCursor;c.init({memberid:k,position:a,length:b||0,selectionType:d});return c}function e(a){var b;b=c(a.startContainer,a.startOffset,J);b.roundToPreviousStep()&&a.setStart(b.container(),b.offset());b=c(a.endContainer,a.endOffset,I);b.roundToNextStep()&&a.setEnd(b.container(),b.offset())}function r(a){var b=w.getParagraphElements(a),d=b[0],b=b[b.length-1];d&&a.setStart(d,0);b&&(w.isParagraph(a.endContainer)&&0===a.endOffset?a.setEndBefore(b):a.setEnd(b,b.childNodes.length))}
function q(a,b,d,c){var e,f;c?(e=d.startContainer,f=d.startOffset):(e=d.endContainer,f=d.endOffset);y.containsNode(a,e)||(f=0>y.comparePoints(a,0,e,f)?0:a.childNodes.length,e=a);a=u.createStepIterator(e,f,b,w.getParagraphElement(e)||a);a.roundToClosestStep()||runtime.assert(!1,"No step found in requested range");c?d.setStart(a.container(),a.offset()):d.setEnd(a.container(),a.offset())}function m(a){var b=u.getCursorSelection(k),d=u.getCursor(k).getStepCounter();0!==a&&(a=0<a?d.convertForwardStepsBetweenFilters(a,
t,z):-d.convertBackwardStepsBetweenFilters(-a,t,z),a=b.length+a,g.enqueue([n(b.position,a)]))}function p(a){var d=b(),c=u.getCursor(k).getAnchorNode();a(d)&&(a=u.convertDomToCursorRange({anchorNode:c,anchorOffset:0,focusNode:d.container(),focusOffset:d.offset()}),g.enqueue([n(a.position,a.length)]))}function a(a){var b=u.getCursorPosition(k),d=u.getCursor(k).getStepCounter();0!==a&&(a=0<a?d.convertForwardStepsBetweenFilters(a,t,z):-d.convertBackwardStepsBetweenFilters(-a,t,z),g.enqueue([n(b+a,0)]))}
function d(a){var d=b();a(d)&&(a=u.convertDomPointToCursorStep(d.container(),d.offset()),g.enqueue([n(a,0)]))}function l(b,d){var c=u.getParagraphElement(u.getCursor(k).getNode());runtime.assert(Boolean(c),"SelectionController: Cursor outside paragraph");c=u.getCursor(k).getStepCounter().countLinesSteps(b,t);d?m(c):a(c)}function f(b,d){var c=u.getCursor(k).getStepCounter().countStepsToLineBoundary(b,t);d?m(c):a(c)}function s(a,b){var d=u.getCursor(k),d=h(d.getSelectedRange(),d.hasForwardSelection()),
e=c(d.focusNode,d.focusOffset,J);if(-1===a?e.previousStep():e.nextStep())d.focusNode=e.container(),d.focusOffset=e.offset(),b||(d.anchorNode=d.focusNode,d.anchorOffset=d.focusOffset),d=u.convertDomToCursorRange(d),g.enqueue([n(d.position,d.length)])}function v(a,b,d){var c=!1,e=u.getCursor(k),e=h(e.getSelectedRange(),e.hasForwardSelection()),f=u.getRootElement(e.focusNode);runtime.assert(Boolean(f),"SelectionController: Cursor outside root");f=u.createStepIterator(e.focusNode,e.focusOffset,[z,B],
f);f.roundToClosestStep();-1===a?f.previousStep()&&(a=d(f.container()))&&(f.setPosition(a,0),c=f.roundToNextStep()):f.nextStep()&&(a=d(f.container()))&&(f.setPosition(a,a.childNodes.length),c=f.roundToPreviousStep());c&&(e.focusNode=f.container(),e.focusOffset=f.offset(),b||(e.anchorNode=e.focusNode,e.anchorOffset=e.focusOffset),b=u.convertDomToCursorRange(e),g.enqueue([n(b.position,b.length)]))}var u=g.getOdtDocument(),y=new core.DomUtils,w=new odf.OdfUtils,z=u.getPositionFilter(),t=new core.PositionFilterChain,
B=u.createRootFilter(k),J=odf.WordBoundaryFilter.IncludeWhitespace.TRAILING,I=odf.WordBoundaryFilter.IncludeWhitespace.LEADING;this.selectionToRange=function(a){var b=0<=y.comparePoints(a.anchorNode,a.anchorOffset,a.focusNode,a.focusOffset),d=a.focusNode.ownerDocument.createRange();b?(d.setStart(a.anchorNode,a.anchorOffset),d.setEnd(a.focusNode,a.focusOffset)):(d.setStart(a.focusNode,a.focusOffset),d.setEnd(a.anchorNode,a.anchorOffset));return{range:d,hasForwardSelection:b}};this.rangeToSelection=
h;this.selectImage=function(a){var b=u.getRootElement(a),d=u.createRootFilter(b),b=u.createStepIterator(a,0,[d,u.getPositionFilter()],b),c;b.roundToPreviousStep()||runtime.assert(!1,"No walkable position before frame");d=b.container();c=b.offset();b.setPosition(a,a.childNodes.length);b.roundToNextStep()||runtime.assert(!1,"No walkable position after frame");a=u.convertDomToCursorRange({anchorNode:d,anchorOffset:c,focusNode:b.container(),focusOffset:b.offset()});a=n(a.position,a.length,ops.OdtCursor.RegionSelection);
g.enqueue([a])};this.expandToWordBoundaries=e;this.expandToParagraphBoundaries=r;this.selectRange=function(a,b,d){var c=u.getOdfCanvas().getElement(),f,l=[z];f=y.containsNode(c,a.startContainer);c=y.containsNode(c,a.endContainer);if(f||c)if(f&&c&&(2===d?e(a):3<=d&&r(a)),(d=b?u.getRootElement(a.startContainer):u.getRootElement(a.endContainer))||(d=u.getRootNode()),l.push(u.createRootFilter(d)),q(d,l,a,!0),q(d,l,a,!1),a=h(a,b),b=u.convertDomToCursorRange(a),a=u.getCursorSelection(k),b.position!==a.position||
b.length!==a.length)a=n(b.position,b.length,ops.OdtCursor.RangeSelection),g.enqueue([a])};this.moveCursorToLeft=function(){d(function(a){return a.previousStep()});return!0};this.moveCursorToRight=function(){d(function(a){return a.nextStep()});return!0};this.extendSelectionToLeft=function(){p(function(a){return a.previousStep()});return!0};this.extendSelectionToRight=function(){p(function(a){return a.nextStep()});return!0};this.moveCursorUp=function(){l(-1,!1);return!0};this.moveCursorDown=function(){l(1,
!1);return!0};this.extendSelectionUp=function(){l(-1,!0);return!0};this.extendSelectionDown=function(){l(1,!0);return!0};this.moveCursorBeforeWord=function(){s(-1,!1);return!0};this.moveCursorPastWord=function(){s(1,!1);return!0};this.extendSelectionBeforeWord=function(){s(-1,!0);return!0};this.extendSelectionPastWord=function(){s(1,!0);return!0};this.moveCursorToLineStart=function(){f(-1,!1);return!0};this.moveCursorToLineEnd=function(){f(1,!1);return!0};this.extendSelectionToLineStart=function(){f(-1,
!0);return!0};this.extendSelectionToLineEnd=function(){f(1,!0);return!0};this.extendSelectionToParagraphStart=function(){v(-1,!0,u.getParagraphElement);return!0};this.extendSelectionToParagraphEnd=function(){v(1,!0,u.getParagraphElement);return!0};this.moveCursorToParagraphStart=function(){v(-1,!1,u.getParagraphElement);return!0};this.moveCursorToParagraphEnd=function(){v(1,!1,u.getParagraphElement);return!0};this.moveCursorToDocumentStart=function(){v(-1,!1,u.getRootElement);return!0};this.moveCursorToDocumentEnd=
function(){v(1,!1,u.getRootElement);return!0};this.extendSelectionToDocumentStart=function(){v(-1,!0,u.getRootElement);return!0};this.extendSelectionToDocumentEnd=function(){v(1,!0,u.getRootElement);return!0};this.extendSelectionToEntireDocument=function(){var a=u.getCursor(k),a=u.getRootElement(a.getNode()),b,d,c;runtime.assert(Boolean(a),"SelectionController: Cursor outside root");c=u.createStepIterator(a,0,[z,B],a);c.roundToClosestStep();b=c.container();d=c.offset();c.setPosition(a,a.childNodes.length);
c.roundToClosestStep();a=u.convertDomToCursorRange({anchorNode:b,anchorOffset:d,focusNode:c.container(),focusOffset:c.offset()});g.enqueue([n(a.position,a.length)]);return!0};t.addFilter(z);t.addFilter(u.createRootFilter(k))};
// Input 96
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
gui.TextController=function(g,k,b,c){function h(b){var c=r.convertCursorToDomRange(b.position,b.length),a,d,e=new ops.OpRemoveText;a=r.getParagraphElement(c.startContainer);c=r.getParagraphElement(c.endContainer);a!==c&&(d=q.hasNoODFContent(a)?c.getAttributeNS(odf.Namespaces.textns,"style-name"):a.getAttributeNS(odf.Namespaces.textns,"style-name"));e.init({memberid:k,position:b.position,length:b.length,mergedParagraphStyleName:d});return e}function n(b){0>b.length&&(b.position+=b.length,b.length=
-b.length);return b}function e(b){var c;c=n(r.getCursorSelection(k));var a,d=null;if(0===c.length){c=r.getCursor(k).getNode();a=r.getRootElement(c);var e=[r.getPositionFilter(),r.createRootFilter(a)];a=r.createStepIterator(c,0,e,a);a.roundToClosestStep()&&(b?a.nextStep():a.previousStep())&&(c=n(r.convertDomToCursorRange({anchorNode:c,anchorOffset:0,focusNode:a.container(),focusOffset:a.offset()})),d=h(c),g.enqueue([d]))}else d=h(c),g.enqueue([d]);return null!==d}var r=g.getOdtDocument(),q=new odf.OdfUtils;
this.enqueueParagraphSplittingOps=function(){var b=n(r.getCursorSelection(k)),e,a=[];0<b.length&&(e=h(b),a.push(e));e=new ops.OpSplitParagraph;e.init({memberid:k,position:b.position,moveCursor:!0});a.push(e);c&&(b=c(b.position+1),a=a.concat(b));g.enqueue(a);return!0};this.removeTextByBackspaceKey=function(){return e(!1)};this.removeTextByDeleteKey=function(){return e(!0)};this.removeCurrentSelection=function(){var b=n(r.getCursorSelection(k));0!==b.length&&(b=h(b),g.enqueue([b]));return!0};this.insertText=
function(c){var e=n(r.getCursorSelection(k)),a,d=[],l=!1;0<e.length&&(a=h(e),d.push(a),l=!0);a=new ops.OpInsertText;a.init({memberid:k,position:e.position,text:c,moveCursor:!0});d.push(a);b&&(c=b(e.position,c.length,l))&&d.push(c);g.enqueue(d)}};(function(){return gui.TextController})();
// Input 97
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
gui.UndoManager=function(){};gui.UndoManager.prototype.subscribe=function(g,k){};gui.UndoManager.prototype.unsubscribe=function(g,k){};gui.UndoManager.prototype.setDocument=function(g){};gui.UndoManager.prototype.setInitialState=function(){};gui.UndoManager.prototype.initialize=function(){};gui.UndoManager.prototype.purgeInitialState=function(){};gui.UndoManager.prototype.setPlaybackFunction=function(g){};gui.UndoManager.prototype.hasUndoStates=function(){};
gui.UndoManager.prototype.hasRedoStates=function(){};gui.UndoManager.prototype.moveForward=function(g){};gui.UndoManager.prototype.moveBackward=function(g){};gui.UndoManager.prototype.onOperationExecuted=function(g){};gui.UndoManager.signalUndoStackChanged="undoStackChanged";gui.UndoManager.signalUndoStateCreated="undoStateCreated";gui.UndoManager.signalUndoStateModified="undoStateModified";(function(){return gui.UndoManager})();
// Input 98
gui.SessionControllerOptions=function(){this.annotationsEnabled=this.directParagraphStylingEnabled=!1};
(function(){var g=core.PositionFilter.FilterResult.FILTER_ACCEPT;gui.SessionController=function(k,b,c,h){function n(a){return a.target||a.srcElement||null}function e(a,b){var d=K.getDOMDocument(),c=null;d.caretRangeFromPoint?(d=d.caretRangeFromPoint(a,b),c={container:d.startContainer,offset:d.startOffset}):d.caretPositionFromPoint&&(d=d.caretPositionFromPoint(a,b))&&d.offsetNode&&(c={container:d.offsetNode,offset:d.offset});return c}function r(a){var d=K.getCursor(b).getSelectedRange();d.collapsed?
a.preventDefault():R.setDataFromRange(a,d)?da.removeCurrentSelection():runtime.log("Cut operation failed")}function q(){return!1!==K.getCursor(b).getSelectedRange().collapsed}function m(a){var d=K.getCursor(b).getSelectedRange();d.collapsed?a.preventDefault():R.setDataFromRange(a,d)||runtime.log("Copy operation failed")}function p(a){var b;U.clipboardData&&U.clipboardData.getData?b=U.clipboardData.getData("Text"):a.clipboardData&&a.clipboardData.getData&&(b=a.clipboardData.getData("text/plain"));
b&&(da.removeCurrentSelection(),k.enqueue(na.createPasteOps(b)));a.preventDefault?a.preventDefault():a.returnValue=!1}function a(){return!1}function d(a){if(O)O.onOperationExecuted(a)}function l(a){K.emit(ops.OdtDocument.signalUndoStackChanged,a)}function f(){var a=G.getEventTrap(),b,d;return O?(d=G.hasFocus(),O.moveBackward(1),b=K.getOdfCanvas().getSizer(),L.containsNode(b,a)||(b.appendChild(a),d&&G.focus()),!0):!1}function s(){var a;return O?(a=G.hasFocus(),O.moveForward(1),a&&G.focus(),!0):!1}
function v(a){var d=K.getCursor(b).getSelectedRange(),f=n(a).getAttribute("end");d&&f&&(a=e(a.clientX,a.clientY))&&(ha.setUnfilteredPosition(a.container,a.offset),$.acceptPosition(ha)===g&&(d=d.cloneRange(),"left"===f?d.setStart(ha.container(),ha.unfilteredDomOffset()):d.setEnd(ha.container(),ha.unfilteredDomOffset()),c.setSelectedRange(d,"right"===f),K.emit(ops.Document.signalCursorMoved,c)))}function u(){P.selectRange(c.getSelectedRange(),c.hasForwardSelection(),1)}function y(){var a=U.getSelection(),
b=0<a.rangeCount&&P.selectionToRange(a);N&&b&&(T=!0,ka.clearSelection(),ha.setUnfilteredPosition(a.focusNode,a.focusOffset),$.acceptPosition(ha)===g&&(2===aa?P.expandToWordBoundaries(b.range):3<=aa&&P.expandToParagraphBoundaries(b.range),c.setSelectedRange(b.range,b.hasForwardSelection),K.emit(ops.Document.signalCursorMoved,c)))}function w(a){var d=n(a),c=K.getCursor(b);if(N=null!==d&&L.containsNode(K.getOdfCanvas().getElement(),d))T=!1,$=K.createRootFilter(d),aa=0===a.button?a.detail:0,c&&a.shiftKey?
U.getSelection().collapse(c.getAnchorNode(),0):(a=U.getSelection(),d=c.getSelectedRange(),a.extend?c.hasForwardSelection()?(a.collapse(d.startContainer,d.startOffset),a.extend(d.endContainer,d.endOffset)):(a.collapse(d.endContainer,d.endOffset),a.extend(d.startContainer,d.startOffset)):(a.removeAllRanges(),a.addRange(d.cloneRange()))),1<aa&&y()}function z(a){var b=K.getRootElement(a),d=K.createRootFilter(b),b=K.createStepIterator(a,0,[d,K.getPositionFilter()],b);b.setPosition(a,a.childNodes.length);
return b.roundToNextStep()?{container:b.container(),offset:b.offset()}:null}function t(a){var b;b=(b=U.getSelection())?{anchorNode:b.anchorNode,anchorOffset:b.anchorOffset,focusNode:b.focusNode,focusOffset:b.focusOffset}:null;var d,c;b.anchorNode||b.focusNode||!(d=e(a.clientX,a.clientY))||(b.anchorNode=d.container,b.anchorOffset=d.offset,b.focusNode=b.anchorNode,b.focusOffset=b.anchorOffset);if(ba.isImage(b.focusNode)&&0===b.focusOffset&&ba.isCharacterFrame(b.focusNode.parentNode)){if(c=b.focusNode.parentNode,
d=c.getBoundingClientRect(),a.clientX>d.right&&(d=z(c)))b.anchorNode=b.focusNode=d.container,b.anchorOffset=b.focusOffset=d.offset}else ba.isImage(b.focusNode.firstChild)&&1===b.focusOffset&&ba.isCharacterFrame(b.focusNode)&&(d=z(b.focusNode))&&(b.anchorNode=b.focusNode=d.container,b.anchorOffset=b.focusOffset=d.offset);b.anchorNode&&b.focusNode&&(b=P.selectionToRange(b),P.selectRange(b.range,b.hasForwardSelection,0===a.button?a.detail:0));G.focus()}function B(a){var b;if(b=e(a.clientX,a.clientY))a=
b.container,b=b.offset,a={anchorNode:a,anchorOffset:b,focusNode:a,focusOffset:b},a=P.selectionToRange(a),P.selectRange(a.range,a.hasForwardSelection,2),G.focus()}function J(a){var b=n(a),d,e;ia.processRequests();ba.isImage(b)&&ba.isCharacterFrame(b.parentNode)&&U.getSelection().isCollapsed?(P.selectImage(b.parentNode),G.focus()):ka.isSelectorElement(b)?G.focus():N&&(T?(b=c.getSelectedRange(),d=b.collapsed,ba.isImage(b.endContainer)&&0===b.endOffset&&ba.isCharacterFrame(b.endContainer.parentNode)&&
(e=b.endContainer.parentNode,e=z(e))&&(b.setEnd(e.container,e.offset),d&&b.collapse(!1)),P.selectRange(b,c.hasForwardSelection(),0===a.button?a.detail:0),G.focus()):ra?t(a):ca=runtime.setTimeout(function(){t(a)},0));aa=0;T=N=!1}function I(a){var d=K.getCursor(b).getSelectedRange();d.collapsed||X.exportRangeToDataTransfer(a.dataTransfer,d)}function M(){N&&G.focus();aa=0;T=N=!1}function C(a){J(a)}function W(a){var b=n(a),d=null;"annotationRemoveButton"===b.className?(runtime.assert(ga,"Remove buttons are displayed on annotations while annotation editing is disabled in the controller."),
d=L.getElementsByTagNameNS(b.parentNode,odf.Namespaces.officens,"annotation")[0],la.removeAnnotation(d),G.focus()):"webodf-draggable"!==b.getAttribute("class")&&J(a)}function S(a){(a=a.data)&&(-1===a.indexOf("\n")?da.insertText(a):k.enqueue(na.createPasteOps(a)))}function V(a){return function(){a();return!0}}function E(a){return function(d){return K.getCursor(b).getSelectionType()===ops.OdtCursor.RangeSelection?a(d):!0}}function ea(a){G.unsubscribe("keydown",x.handleEvent);G.unsubscribe("keypress",
Q.handleEvent);G.unsubscribe("keyup",D.handleEvent);G.unsubscribe("copy",m);G.unsubscribe("mousedown",w);G.unsubscribe("mousemove",ia.trigger);G.unsubscribe("mouseup",W);G.unsubscribe("contextmenu",C);G.unsubscribe("dragstart",I);G.unsubscribe("dragend",M);G.unsubscribe("click",oa.handleClick);G.unsubscribe("longpress",B);G.unsubscribe("drag",v);G.unsubscribe("dragstop",u);K.unsubscribe(ops.OdtDocument.signalOperationEnd,ma.trigger);K.unsubscribe(ops.Document.signalCursorAdded,fa.registerCursor);
K.unsubscribe(ops.Document.signalCursorRemoved,fa.removeCursor);K.unsubscribe(ops.OdtDocument.signalOperationEnd,d);a()}var U=runtime.getWindow(),K=k.getOdtDocument(),L=new core.DomUtils,ba=new odf.OdfUtils,X=new gui.MimeDataExporter,R=new gui.Clipboard(X),x=new gui.KeyboardHandler,Q=new gui.KeyboardHandler,D=new gui.KeyboardHandler,N=!1,A=new odf.ObjectNameGenerator(K.getOdfCanvas().odfContainer(),b),T=!1,$=null,ca,O=null,G=new gui.EventManager(K),ga=h.annotationsEnabled,la=new gui.AnnotationController(k,
b),Z=new gui.DirectFormattingController(k,b,A,h.directParagraphStylingEnabled),da=new gui.TextController(k,b,Z.createCursorStyleOp,Z.createParagraphStyleOps),ja=new gui.ImageController(k,b,A),ka=new gui.ImageSelector(K.getOdfCanvas()),ha=gui.SelectionMover.createPositionIterator(K.getRootNode()),ia,ma,na=new gui.PlainTextPasteboard(K,b),fa=new gui.InputMethodEditor(b,G),aa=0,oa=new gui.HyperlinkClickHandler(K.getOdfCanvas().getElement,x,D),Y=new gui.HyperlinkController(k,b),P=new gui.SelectionController(k,
b),F=gui.KeyboardHandler.Modifier,H=gui.KeyboardHandler.KeyCode,pa=-1!==U.navigator.appVersion.toLowerCase().indexOf("mac"),ra=-1!==["iPad","iPod","iPhone"].indexOf(U.navigator.platform),qa;runtime.assert(null!==U,"Expected to be run in an environment which has a global window, like a browser.");this.undo=f;this.redo=s;this.insertLocalCursor=function(){runtime.assert(void 0===k.getOdtDocument().getCursor(b),"Inserting local cursor a second time.");var a=new ops.OpAddCursor;a.init({memberid:b});k.enqueue([a]);
G.focus()};this.removeLocalCursor=function(){runtime.assert(void 0!==k.getOdtDocument().getCursor(b),"Removing local cursor without inserting before.");var a=new ops.OpRemoveCursor;a.init({memberid:b});k.enqueue([a])};this.startEditing=function(){fa.subscribe(gui.InputMethodEditor.signalCompositionStart,da.removeCurrentSelection);fa.subscribe(gui.InputMethodEditor.signalCompositionEnd,S);G.subscribe("beforecut",q);G.subscribe("cut",r);G.subscribe("beforepaste",a);G.subscribe("paste",p);O&&O.initialize();
G.setEditing(!0);oa.setModifier(pa?F.Meta:F.Ctrl);x.bind(H.Backspace,F.None,V(da.removeTextByBackspaceKey),!0);x.bind(H.Delete,F.None,da.removeTextByDeleteKey);x.bind(H.Tab,F.None,E(function(){da.insertText("\t");return!0}));pa?(x.bind(H.Clear,F.None,da.removeCurrentSelection),x.bind(H.B,F.Meta,E(Z.toggleBold)),x.bind(H.I,F.Meta,E(Z.toggleItalic)),x.bind(H.U,F.Meta,E(Z.toggleUnderline)),x.bind(H.L,F.MetaShift,E(Z.alignParagraphLeft)),x.bind(H.E,F.MetaShift,E(Z.alignParagraphCenter)),x.bind(H.R,F.MetaShift,
E(Z.alignParagraphRight)),x.bind(H.J,F.MetaShift,E(Z.alignParagraphJustified)),ga&&x.bind(H.C,F.MetaShift,la.addAnnotation),x.bind(H.Z,F.Meta,f),x.bind(H.Z,F.MetaShift,s)):(x.bind(H.B,F.Ctrl,E(Z.toggleBold)),x.bind(H.I,F.Ctrl,E(Z.toggleItalic)),x.bind(H.U,F.Ctrl,E(Z.toggleUnderline)),x.bind(H.L,F.CtrlShift,E(Z.alignParagraphLeft)),x.bind(H.E,F.CtrlShift,E(Z.alignParagraphCenter)),x.bind(H.R,F.CtrlShift,E(Z.alignParagraphRight)),x.bind(H.J,F.CtrlShift,E(Z.alignParagraphJustified)),ga&&x.bind(H.C,F.CtrlAlt,
la.addAnnotation),x.bind(H.Z,F.Ctrl,f),x.bind(H.Z,F.CtrlShift,s));Q.setDefault(E(function(a){var b;b=null===a.which||void 0===a.which?String.fromCharCode(a.keyCode):0!==a.which&&0!==a.charCode?String.fromCharCode(a.which):null;return!b||a.altKey||a.ctrlKey||a.metaKey?!1:(da.insertText(b),!0)}));Q.bind(H.Enter,F.None,E(da.enqueueParagraphSplittingOps))};this.endEditing=function(){fa.unsubscribe(gui.InputMethodEditor.signalCompositionStart,da.removeCurrentSelection);fa.unsubscribe(gui.InputMethodEditor.signalCompositionEnd,
S);G.unsubscribe("cut",r);G.unsubscribe("beforecut",q);G.unsubscribe("paste",p);G.unsubscribe("beforepaste",a);G.setEditing(!1);oa.setModifier(F.None);x.bind(H.Backspace,F.None,function(){return!0},!0);x.unbind(H.Delete,F.None);x.unbind(H.Tab,F.None);pa?(x.unbind(H.Clear,F.None),x.unbind(H.B,F.Meta),x.unbind(H.I,F.Meta),x.unbind(H.U,F.Meta),x.unbind(H.L,F.MetaShift),x.unbind(H.E,F.MetaShift),x.unbind(H.R,F.MetaShift),x.unbind(H.J,F.MetaShift),ga&&x.unbind(H.C,F.MetaShift),x.unbind(H.Z,F.Meta),x.unbind(H.Z,
F.MetaShift)):(x.unbind(H.B,F.Ctrl),x.unbind(H.I,F.Ctrl),x.unbind(H.U,F.Ctrl),x.unbind(H.L,F.CtrlShift),x.unbind(H.E,F.CtrlShift),x.unbind(H.R,F.CtrlShift),x.unbind(H.J,F.CtrlShift),ga&&x.unbind(H.C,F.CtrlAlt),x.unbind(H.Z,F.Ctrl),x.unbind(H.Z,F.CtrlShift));Q.setDefault(null);Q.unbind(H.Enter,F.None)};this.getInputMemberId=function(){return b};this.getSession=function(){return k};this.setUndoManager=function(a){O&&O.unsubscribe(gui.UndoManager.signalUndoStackChanged,l);if(O=a)O.setDocument(K),O.setPlaybackFunction(k.enqueue),
O.subscribe(gui.UndoManager.signalUndoStackChanged,l)};this.getUndoManager=function(){return O};this.getAnnotationController=function(){return la};this.getDirectFormattingController=function(){return Z};this.getHyperlinkClickHandler=function(){return oa};this.getHyperlinkController=function(){return Y};this.getImageController=function(){return ja};this.getSelectionController=function(){return P};this.getTextController=function(){return da};this.getEventManager=function(){return G};this.getKeyboardHandlers=
function(){return{keydown:x,keypress:Q}};this.destroy=function(a){var b=[ia.destroy,ma.destroy,Z.destroy,fa.destroy,G.destroy,oa.destroy,ea];qa&&b.unshift(qa.destroy);runtime.clearTimeout(ca);core.Async.destroyAll(b,a)};ia=core.Task.createRedrawTask(y);ma=core.Task.createRedrawTask(function(){var a=K.getCursor(b);if(a&&a.getSelectionType()===ops.OdtCursor.RegionSelection&&(a=ba.getImageElements(a.getSelectedRange())[0])){ka.select(a.parentNode);return}ka.clearSelection()});x.bind(H.Left,F.None,E(P.moveCursorToLeft));
x.bind(H.Right,F.None,E(P.moveCursorToRight));x.bind(H.Up,F.None,E(P.moveCursorUp));x.bind(H.Down,F.None,E(P.moveCursorDown));x.bind(H.Left,F.Shift,E(P.extendSelectionToLeft));x.bind(H.Right,F.Shift,E(P.extendSelectionToRight));x.bind(H.Up,F.Shift,E(P.extendSelectionUp));x.bind(H.Down,F.Shift,E(P.extendSelectionDown));x.bind(H.Home,F.None,E(P.moveCursorToLineStart));x.bind(H.End,F.None,E(P.moveCursorToLineEnd));x.bind(H.Home,F.Ctrl,E(P.moveCursorToDocumentStart));x.bind(H.End,F.Ctrl,E(P.moveCursorToDocumentEnd));
x.bind(H.Home,F.Shift,E(P.extendSelectionToLineStart));x.bind(H.End,F.Shift,E(P.extendSelectionToLineEnd));x.bind(H.Up,F.CtrlShift,E(P.extendSelectionToParagraphStart));x.bind(H.Down,F.CtrlShift,E(P.extendSelectionToParagraphEnd));x.bind(H.Home,F.CtrlShift,E(P.extendSelectionToDocumentStart));x.bind(H.End,F.CtrlShift,E(P.extendSelectionToDocumentEnd));pa?(x.bind(H.Left,F.Alt,E(P.moveCursorBeforeWord)),x.bind(H.Right,F.Alt,E(P.moveCursorPastWord)),x.bind(H.Left,F.Meta,E(P.moveCursorToLineStart)),x.bind(H.Right,
F.Meta,E(P.moveCursorToLineEnd)),x.bind(H.Home,F.Meta,E(P.moveCursorToDocumentStart)),x.bind(H.End,F.Meta,E(P.moveCursorToDocumentEnd)),x.bind(H.Left,F.AltShift,E(P.extendSelectionBeforeWord)),x.bind(H.Right,F.AltShift,E(P.extendSelectionPastWord)),x.bind(H.Left,F.MetaShift,E(P.extendSelectionToLineStart)),x.bind(H.Right,F.MetaShift,E(P.extendSelectionToLineEnd)),x.bind(H.Up,F.AltShift,E(P.extendSelectionToParagraphStart)),x.bind(H.Down,F.AltShift,E(P.extendSelectionToParagraphEnd)),x.bind(H.Up,F.MetaShift,
E(P.extendSelectionToDocumentStart)),x.bind(H.Down,F.MetaShift,E(P.extendSelectionToDocumentEnd)),x.bind(H.A,F.Meta,E(P.extendSelectionToEntireDocument))):(x.bind(H.Left,F.Ctrl,E(P.moveCursorBeforeWord)),x.bind(H.Right,F.Ctrl,E(P.moveCursorPastWord)),x.bind(H.Left,F.CtrlShift,E(P.extendSelectionBeforeWord)),x.bind(H.Right,F.CtrlShift,E(P.extendSelectionPastWord)),x.bind(H.A,F.Ctrl,E(P.extendSelectionToEntireDocument)));ra&&(qa=new gui.IOSSafariSupport(G));G.subscribe("keydown",x.handleEvent);G.subscribe("keypress",
Q.handleEvent);G.subscribe("keyup",D.handleEvent);G.subscribe("copy",m);G.subscribe("mousedown",w);G.subscribe("mousemove",ia.trigger);G.subscribe("mouseup",W);G.subscribe("contextmenu",C);G.subscribe("dragstart",I);G.subscribe("dragend",M);G.subscribe("click",oa.handleClick);G.subscribe("longpress",B);G.subscribe("drag",v);G.subscribe("dragstop",u);K.subscribe(ops.OdtDocument.signalOperationEnd,ma.trigger);K.subscribe(ops.Document.signalCursorAdded,fa.registerCursor);K.subscribe(ops.Document.signalCursorRemoved,
fa.removeCursor);K.subscribe(ops.OdtDocument.signalOperationEnd,d)};return gui.SessionController})();
// Input 99
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
gui.CaretManager=function(g){function k(a){return d.hasOwnProperty(a)?d[a]:null}function b(){return Object.keys(d).map(function(a){return d[a]})}function c(a){var b=d[a];b&&(b.destroy(function(){}),delete d[a])}function h(a){a=a.getMemberId();a===g.getInputMemberId()&&(a=k(a))&&a.refreshCursorBlinking()}function n(){var a=k(g.getInputMemberId());s=!1;a&&a.ensureVisible()}function e(){var a=k(g.getInputMemberId());a&&(a.handleUpdate(),s||(s=!0,f=runtime.setTimeout(n,50)))}function r(a){a.memberId===
g.getInputMemberId()&&e()}function q(){var a=k(g.getInputMemberId());a&&a.setFocus()}function m(){var a=k(g.getInputMemberId());a&&a.removeFocus()}function p(){var a=k(g.getInputMemberId());a&&a.show()}function a(){var a=k(g.getInputMemberId());a&&a.hide()}var d={},l=runtime.getWindow(),f,s=!1;this.registerCursor=function(a,b,c){var f=a.getMemberId();b=new gui.Caret(a,b,c);c=g.getEventManager();d[f]=b;f===g.getInputMemberId()?(runtime.log("Starting to track input on new cursor of "+f),a.subscribe(ops.OdtCursor.signalCursorUpdated,
e),b.setOverlayElement(c.getEventTrap())):a.subscribe(ops.OdtCursor.signalCursorUpdated,b.handleUpdate);return b};this.getCaret=k;this.getCarets=b;this.destroy=function(e){var k=g.getSession().getOdtDocument(),n=g.getEventManager(),s=b().map(function(a){return a.destroy});runtime.clearTimeout(f);k.unsubscribe(ops.OdtDocument.signalParagraphChanged,r);k.unsubscribe(ops.Document.signalCursorMoved,h);k.unsubscribe(ops.Document.signalCursorRemoved,c);n.unsubscribe("focus",q);n.unsubscribe("blur",m);l.removeEventListener("focus",
p,!1);l.removeEventListener("blur",a,!1);d={};core.Async.destroyAll(s,e)};(function(){var b=g.getSession().getOdtDocument(),d=g.getEventManager();b.subscribe(ops.OdtDocument.signalParagraphChanged,r);b.subscribe(ops.Document.signalCursorMoved,h);b.subscribe(ops.Document.signalCursorRemoved,c);d.subscribe("focus",q);d.subscribe("blur",m);l.addEventListener("focus",p,!1);l.addEventListener("blur",a,!1)})()};
// Input 100
gui.EditInfoHandle=function(g){var k=[],b,c=g.ownerDocument,h=c.documentElement.namespaceURI;this.setEdits=function(g){k=g;var e,r,q,m;b.innerHTML="";for(g=0;g<k.length;g+=1)e=c.createElementNS(h,"div"),e.className="editInfo",r=c.createElementNS(h,"span"),r.className="editInfoColor",r.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",k[g].memberid),q=c.createElementNS(h,"span"),q.className="editInfoAuthor",q.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",k[g].memberid),
m=c.createElementNS(h,"span"),m.className="editInfoTime",m.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",k[g].memberid),m.innerHTML=k[g].time,e.appendChild(r),e.appendChild(q),e.appendChild(m),b.appendChild(e)};this.show=function(){b.style.display="block"};this.hide=function(){b.style.display="none"};this.destroy=function(c){g.removeChild(b);c()};b=c.createElementNS(h,"div");b.setAttribute("class","editInfoHandle");b.style.display="none";g.appendChild(b)};
// Input 101
/*

 Copyright (C) 2012 KO GmbH <aditya.bhatt@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.EditInfo=function(g,k){function b(){var b=[],c;for(c in h)h.hasOwnProperty(c)&&b.push({memberid:c,time:h[c].time});b.sort(function(b,c){return b.time-c.time});return b}var c,h={};this.getNode=function(){return c};this.getOdtDocument=function(){return k};this.getEdits=function(){return h};this.getSortedEdits=function(){return b()};this.addEdit=function(b,c){h[b]={time:c}};this.clearEdits=function(){h={}};this.destroy=function(b){g.parentNode&&g.removeChild(c);b()};c=k.getDOMDocument().createElementNS("urn:webodf:names:editinfo",
"editinfo");g.insertBefore(c,g.firstChild)};
// Input 102
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
gui.EditInfoMarker=function(g,k){function b(b,a){return runtime.setTimeout(function(){e.style.opacity=b},a)}var c=this,h,n,e,r,q,m;this.addEdit=function(c,a){var d=Date.now()-a;g.addEdit(c,a);n.setEdits(g.getSortedEdits());e.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",c);runtime.clearTimeout(q);runtime.clearTimeout(m);1E4>d?(r=b(1,0),q=b(0.5,1E4-d),m=b(0.2,2E4-d)):1E4<=d&&2E4>d?(r=b(0.5,0),m=b(0.2,2E4-d)):r=b(0.2,0)};this.getEdits=function(){return g.getEdits()};this.clearEdits=
function(){g.clearEdits();n.setEdits([]);e.hasAttributeNS("urn:webodf:names:editinfo","editinfo:memberid")&&e.removeAttributeNS("urn:webodf:names:editinfo","editinfo:memberid")};this.getEditInfo=function(){return g};this.show=function(){e.style.display="block"};this.hide=function(){c.hideHandle();e.style.display="none"};this.showHandle=function(){n.show()};this.hideHandle=function(){n.hide()};this.destroy=function(b){runtime.clearTimeout(r);runtime.clearTimeout(q);runtime.clearTimeout(m);h.removeChild(e);
n.destroy(function(a){a?b(a):g.destroy(b)})};(function(){var b=g.getOdtDocument().getDOMDocument();e=b.createElementNS(b.documentElement.namespaceURI,"div");e.setAttribute("class","editInfoMarker");e.onmouseover=function(){c.showHandle()};e.onmouseout=function(){c.hideHandle()};h=g.getNode();h.appendChild(e);n=new gui.EditInfoHandle(h);k||c.hide()})()};
// Input 103
/*

 Copyright (C) 2010-2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
gui.HyperlinkTooltipView=function(g,k){var b=new core.DomUtils,c=new odf.OdfUtils,h=runtime.getWindow(),n,e,r;runtime.assert(null!==h,"Expected to be run in an environment which has a global window, like a browser.");this.showTooltip=function(q){var m=q.target||q.srcElement,p=g.getSizer(),a=g.getZoomLevel(),d;a:{for(;m;){if(c.isHyperlink(m))break a;if(c.isParagraph(m)||c.isInlineRoot(m))break;m=m.parentNode}m=null}if(m){b.containsNode(p,r)||p.appendChild(r);d=e;var l;switch(k()){case gui.KeyboardHandler.Modifier.Ctrl:l=
runtime.tr("Ctrl-click to follow link");break;case gui.KeyboardHandler.Modifier.Meta:l=runtime.tr("\u2318-click to follow link");break;default:l=""}d.textContent=l;n.textContent=c.getHyperlinkTarget(m);r.style.display="block";d=h.innerWidth-r.offsetWidth-15;m=q.clientX>d?d:q.clientX+15;d=h.innerHeight-r.offsetHeight-10;q=q.clientY>d?d:q.clientY+10;p=p.getBoundingClientRect();m=(m-p.left)/a;q=(q-p.top)/a;r.style.left=m+"px";r.style.top=q+"px"}};this.hideTooltip=function(){r.style.display="none"};this.destroy=
function(b){r.parentNode&&r.parentNode.removeChild(r);b()};(function(){var b=g.getElement().ownerDocument;n=b.createElement("span");e=b.createElement("span");n.className="webodf-hyperlinkTooltipLink";e.className="webodf-hyperlinkTooltipText";r=b.createElement("div");r.className="webodf-hyperlinkTooltip";r.appendChild(n);r.appendChild(e);g.getElement().appendChild(r)})()};
// Input 104
gui.ShadowCursor=function(g){var k=g.getDOMDocument().createRange(),b=!0;this.removeFromDocument=function(){};this.getMemberId=function(){return gui.ShadowCursor.ShadowCursorMemberId};this.getSelectedRange=function(){return k};this.setSelectedRange=function(c,h){k=c;b=!1!==h};this.hasForwardSelection=function(){return b};this.getDocument=function(){return g};this.getSelectionType=function(){return ops.OdtCursor.RangeSelection};k.setStart(g.getRootNode(),0)};gui.ShadowCursor.ShadowCursorMemberId="";
(function(){return gui.ShadowCursor})();
// Input 105
gui.SelectionView=function(g){};gui.SelectionView.prototype.rerender=function(){};gui.SelectionView.prototype.show=function(){};gui.SelectionView.prototype.hide=function(){};gui.SelectionView.prototype.destroy=function(g){};
// Input 106
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
gui.SelectionViewManager=function(g){function k(){return Object.keys(b).map(function(c){return b[c]})}var b={};this.getSelectionView=function(c){return b.hasOwnProperty(c)?b[c]:null};this.getSelectionViews=k;this.removeSelectionView=function(c){b.hasOwnProperty(c)&&(b[c].destroy(function(){}),delete b[c])};this.hideSelectionView=function(c){b.hasOwnProperty(c)&&b[c].hide()};this.showSelectionView=function(c){b.hasOwnProperty(c)&&b[c].show()};this.rerenderSelectionViews=function(){Object.keys(b).forEach(function(c){b[c].rerender()})};
this.registerCursor=function(c,h){var k=c.getMemberId(),e=new g(c);h?e.show():e.hide();return b[k]=e};this.destroy=function(b){function h(e,k){k?b(k):e<g.length?g[e].destroy(function(b){h(e+1,b)}):b()}var g=k();h(0,void 0)}};
// Input 107
/*

 Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
gui.SessionViewOptions=function(){this.caretBlinksOnRangeSelect=this.caretAvatarsInitiallyVisible=this.editInfoMarkersInitiallyVisible=!0};
(function(){gui.SessionView=function(g,k,b,c,h){function n(a,b,d){function c(b,d,e){d=b+'[editinfo|memberid="'+a+'"]'+e+d;a:{var f=l.firstChild;for(b=b+'[editinfo|memberid="'+a+'"]'+e+"{";f;){if(f.nodeType===Node.TEXT_NODE&&0===f.data.indexOf(b)){b=f;break a}f=f.nextSibling}b=null}b?b.data=d:l.appendChild(document.createTextNode(d))}c("div.editInfoMarker","{ background-color: "+d+"; }","");c("span.editInfoColor","{ background-color: "+d+"; }","");c("span.editInfoAuthor",'{ content: "'+b+'"; }',":before");
c("dc|creator","{ background-color: "+d+"; }","");c(".webodf-selectionOverlay","{ fill: "+d+"; stroke: "+d+";}","");a!==gui.ShadowCursor.ShadowCursorMemberId&&a!==k||c(".webodf-touchEnabled .webodf-selectionOverlay","{ display: block; }"," > .webodf-draggable")}function e(a){var b,d;for(d in s)s.hasOwnProperty(d)&&(b=s[d],a?b.show():b.hide())}function r(a){c.getCarets().forEach(function(b){a?b.showHandle():b.hideHandle()})}function q(a){var b=a.getMemberId();a=a.getProperties();n(b,a.fullName,a.color);
k===b&&n("","",a.color)}function m(a){var d=a.getMemberId(),e=b.getOdtDocument().getMember(d).getProperties();c.registerCursor(a,u,y);h.registerCursor(a,!0);if(a=c.getCaret(d))a.setAvatarImageUrl(e.imageUrl),a.setColor(e.color);runtime.log("+++ View here +++ eagerly created an Caret for '"+d+"'! +++")}function p(a){a=a.getMemberId();var b=h.getSelectionView(k),d=h.getSelectionView(gui.ShadowCursor.ShadowCursorMemberId),e=c.getCaret(k);a===k?(d.hide(),b&&b.show(),e&&e.show()):a===gui.ShadowCursor.ShadowCursorMemberId&&
(d.show(),b&&b.hide(),e&&e.hide())}function a(a){h.removeSelectionView(a)}function d(a){var d=a.paragraphElement,c=a.memberId;a=a.timeStamp;var e,h="",g=d.getElementsByTagNameNS(f,"editinfo").item(0);g?(h=g.getAttributeNS(f,"id"),e=s[h]):(h=Math.random().toString(),e=new ops.EditInfo(d,b.getOdtDocument()),e=new gui.EditInfoMarker(e,v),g=d.getElementsByTagNameNS(f,"editinfo").item(0),g.setAttributeNS(f,"id",h),s[h]=e);e.addEdit(c,new Date(a))}var l,f="urn:webodf:names:editinfo",s={},v=void 0!==g.editInfoMarkersInitiallyVisible?
Boolean(g.editInfoMarkersInitiallyVisible):!0,u=void 0!==g.caretAvatarsInitiallyVisible?Boolean(g.caretAvatarsInitiallyVisible):!0,y=void 0!==g.caretBlinksOnRangeSelect?Boolean(g.caretBlinksOnRangeSelect):!0;this.showEditInfoMarkers=function(){v||(v=!0,e(v))};this.hideEditInfoMarkers=function(){v&&(v=!1,e(v))};this.showCaretAvatars=function(){u||(u=!0,r(u))};this.hideCaretAvatars=function(){u&&(u=!1,r(u))};this.getSession=function(){return b};this.getCaret=function(a){return c.getCaret(a)};this.destroy=
function(c){var e=b.getOdtDocument(),f=Object.keys(s).map(function(a){return s[a]});e.unsubscribe(ops.Document.signalMemberAdded,q);e.unsubscribe(ops.Document.signalMemberUpdated,q);e.unsubscribe(ops.Document.signalCursorAdded,m);e.unsubscribe(ops.Document.signalCursorRemoved,a);e.unsubscribe(ops.OdtDocument.signalParagraphChanged,d);e.unsubscribe(ops.Document.signalCursorMoved,p);e.unsubscribe(ops.OdtDocument.signalParagraphChanged,h.rerenderSelectionViews);e.unsubscribe(ops.OdtDocument.signalTableAdded,
h.rerenderSelectionViews);e.unsubscribe(ops.OdtDocument.signalParagraphStyleModified,h.rerenderSelectionViews);l.parentNode.removeChild(l);(function J(a,b){b?c(b):a<f.length?f[a].destroy(function(b){J(a+1,b)}):c()})(0,void 0)};(function(){var c=b.getOdtDocument(),e=document.getElementsByTagName("head").item(0);c.subscribe(ops.Document.signalMemberAdded,q);c.subscribe(ops.Document.signalMemberUpdated,q);c.subscribe(ops.Document.signalCursorAdded,m);c.subscribe(ops.Document.signalCursorRemoved,a);c.subscribe(ops.OdtDocument.signalParagraphChanged,
d);c.subscribe(ops.Document.signalCursorMoved,p);c.subscribe(ops.OdtDocument.signalParagraphChanged,h.rerenderSelectionViews);c.subscribe(ops.OdtDocument.signalTableAdded,h.rerenderSelectionViews);c.subscribe(ops.OdtDocument.signalParagraphStyleModified,h.rerenderSelectionViews);l=document.createElementNS(e.namespaceURI,"style");l.type="text/css";l.media="screen, print, handheld, projection";l.appendChild(document.createTextNode("@namespace editinfo url(urn:webodf:names:editinfo);"));l.appendChild(document.createTextNode("@namespace dc url(http://purl.org/dc/elements/1.1/);"));
e.appendChild(l)})()}})();
// Input 108
gui.SvgSelectionView=function(g){function k(){var a=l.getRootNode();f!==a&&(f=a,s=l.getCanvas().getSizer(),s.appendChild(u),u.setAttribute("class","webodf-selectionOverlay"),w.setAttribute("class","webodf-draggable"),z.setAttribute("class","webodf-draggable"),w.setAttribute("end","left"),z.setAttribute("end","right"),w.setAttribute("r",8),z.setAttribute("r",8),u.appendChild(y),u.appendChild(w),u.appendChild(z))}function b(a){var b=B.getBoundingClientRect(s),d=J.getZoomLevel(),c={};c.top=B.adaptRangeDifferenceToZoomLevel(a.top-
b.top,d);c.left=B.adaptRangeDifferenceToZoomLevel(a.left-b.left,d);c.bottom=B.adaptRangeDifferenceToZoomLevel(a.bottom-b.top,d);c.right=B.adaptRangeDifferenceToZoomLevel(a.right-b.left,d);c.width=B.adaptRangeDifferenceToZoomLevel(a.width,d);c.height=B.adaptRangeDifferenceToZoomLevel(a.height,d);return c}function c(a){a=a.getBoundingClientRect();return Boolean(a&&0!==a.height)}function h(a){var b=t.getTextElements(a,!0,!1),d=a.cloneRange(),e=a.cloneRange();a=a.cloneRange();if(!b.length)return null;
var f;a:{f=0;var h=b[f],g=d.startContainer===h?d.startOffset:0,k=g;d.setStart(h,g);for(d.setEnd(h,k);!c(d);){if(h.nodeType===Node.ELEMENT_NODE&&k<h.childNodes.length)k=h.childNodes.length;else if(h.nodeType===Node.TEXT_NODE&&k<h.length)k+=1;else if(b[f])h=b[f],f+=1,g=k=0;else{f=!1;break a}d.setStart(h,g);d.setEnd(h,k)}f=!0}if(!f)return null;a:{f=b.length-1;h=b[f];k=g=e.endContainer===h?e.endOffset:h.nodeType===Node.TEXT_NODE?h.length:h.childNodes.length;e.setStart(h,g);for(e.setEnd(h,k);!c(e);){if(h.nodeType===
Node.ELEMENT_NODE&&0<g)g=0;else if(h.nodeType===Node.TEXT_NODE&&0<g)g-=1;else if(b[f])h=b[f],f-=1,g=k=h.length||h.childNodes.length;else{b=!1;break a}e.setStart(h,g);e.setEnd(h,k)}b=!0}if(!b)return null;a.setStart(d.startContainer,d.startOffset);a.setEnd(e.endContainer,e.endOffset);return{firstRange:d,lastRange:e,fillerRange:a}}function n(a,b){var d={};d.top=Math.min(a.top,b.top);d.left=Math.min(a.left,b.left);d.right=Math.max(a.right,b.right);d.bottom=Math.max(a.bottom,b.bottom);d.width=d.right-
d.left;d.height=d.bottom-d.top;return d}function e(a,b){b&&0<b.width&&0<b.height&&(a=a?n(a,b):b);return a}function r(a){function b(a){M.setUnfilteredPosition(a,0);return u.acceptNode(a)===C&&s.acceptPosition(M)===C?C:W}function d(a){var c=null;b(a)===C&&(c=B.getBoundingClientRect(a));return c}var c=a.commonAncestorContainer,f=a.startContainer,h=a.endContainer,g=a.startOffset,k=a.endOffset,n,m,p=null,q,r=v.createRange(),s,u=new odf.OdfNodeFilter,w;if(f===c||h===c)return r=a.cloneRange(),p=r.getBoundingClientRect(),
r.detach(),p;for(a=f;a.parentNode!==c;)a=a.parentNode;for(m=h;m.parentNode!==c;)m=m.parentNode;s=l.createRootFilter(f);for(c=a.nextSibling;c&&c!==m;)q=d(c),p=e(p,q),c=c.nextSibling;if(t.isParagraph(a))p=e(p,B.getBoundingClientRect(a));else if(a.nodeType===Node.TEXT_NODE)c=a,r.setStart(c,g),r.setEnd(c,c===m?k:c.length),q=r.getBoundingClientRect(),p=e(p,q);else for(w=v.createTreeWalker(a,NodeFilter.SHOW_TEXT,b,!1),c=w.currentNode=f;c&&c!==h;)r.setStart(c,g),r.setEnd(c,c.length),q=r.getBoundingClientRect(),
p=e(p,q),n=c,g=0,c=w.nextNode();n||(n=f);if(t.isParagraph(m))p=e(p,B.getBoundingClientRect(m));else if(m.nodeType===Node.TEXT_NODE)c=m,r.setStart(c,c===a?g:0),r.setEnd(c,k),q=r.getBoundingClientRect(),p=e(p,q);else for(w=v.createTreeWalker(m,NodeFilter.SHOW_TEXT,b,!1),c=w.currentNode=h;c&&c!==n;)if(r.setStart(c,0),r.setEnd(c,k),q=r.getBoundingClientRect(),p=e(p,q),c=w.previousNode())k=c.length;return p}function q(a,b){var d=a.getBoundingClientRect(),c={width:0};c.top=d.top;c.bottom=d.bottom;c.height=
d.height;c.left=c.right=b?d.right:d.left;return c}function m(){var a=g.getSelectedRange(),d;if(d=I&&g.getSelectionType()===ops.OdtCursor.RangeSelection&&!a.collapsed){k();var a=h(a),c,e,f,l,m,p,s,t;if(a){d=a.firstRange;c=a.lastRange;e=a.fillerRange;f=b(q(d,!1));m=b(q(c,!0));l=(l=r(e))?b(l):n(f,m);p=l.left;s=f.left+Math.max(0,l.width-(f.left-l.left));l=Math.min(f.top,m.top);t=m.top+m.height;p=[{x:f.left,y:l+f.height},{x:f.left,y:l},{x:s,y:l},{x:s,y:t-m.height},{x:m.right,y:t-m.height},{x:m.right,y:t},
{x:p,y:t},{x:p,y:l+f.height},{x:f.left,y:l+f.height}];s="";var v;for(v=0;v<p.length;v+=1)s+=p[v].x+","+p[v].y+" ";y.setAttribute("points",s);w.setAttribute("cx",f.left);w.setAttribute("cy",l+f.height/2);z.setAttribute("cx",m.right);z.setAttribute("cy",t-m.height/2);d.detach();c.detach();e.detach()}d=Boolean(a)}u.style.display=d?"block":"none"}function p(a){I&&a===g&&S.trigger()}function a(a){a=8/a;w.setAttribute("r",a);z.setAttribute("r",a)}function d(b){s.removeChild(u);s.classList.remove("webodf-virtualSelections");
g.getDocument().unsubscribe(ops.Document.signalCursorMoved,p);J.unsubscribe(gui.ZoomHelper.signalZoomChanged,a);b()}var l=g.getDocument(),f,s,v=l.getDOMDocument(),u=v.createElementNS("http://www.w3.org/2000/svg","svg"),y=v.createElementNS("http://www.w3.org/2000/svg","polygon"),w=v.createElementNS("http://www.w3.org/2000/svg","circle"),z=v.createElementNS("http://www.w3.org/2000/svg","circle"),t=new odf.OdfUtils,B=new core.DomUtils,J=l.getCanvas().getZoomHelper(),I=!0,M=gui.SelectionMover.createPositionIterator(l.getRootNode()),
C=NodeFilter.FILTER_ACCEPT,W=NodeFilter.FILTER_REJECT,S;this.rerender=function(){I&&S.trigger()};this.show=function(){I=!0;S.trigger()};this.hide=function(){I=!1;S.trigger()};this.destroy=function(a){core.Async.destroyAll([S.destroy,d],a)};(function(){var b=g.getMemberId();S=core.Task.createRedrawTask(m);k();u.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",b);s.classList.add("webodf-virtualSelections");g.getDocument().subscribe(ops.Document.signalCursorMoved,p);J.subscribe(gui.ZoomHelper.signalZoomChanged,
a);a(J.getZoomLevel())})()};
// Input 109
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
gui.UndoStateRules=function(){function g(b,c){var e=b.length;this.previous=function(){for(e-=1;0<=e;e-=1)if(c(b[e]))return b[e];return null}}function k(b){b=b.spec();var c;b.hasOwnProperty("position")&&(c=b.position);return c}function b(b){return b.isEdit}function c(b,c,e){if(!e)return e=k(b)-k(c),0===e||1===Math.abs(e);b=k(b);c=k(c);e=k(e);return b-c===c-e}this.isEditOperation=b;this.isPartOfOperationSet=function(h,k){var e=void 0!==h.group,r;if(!h.isEdit||0===k.length)return!0;r=k[k.length-1];if(e&&
h.group===r.group)return!0;a:switch(h.spec().optype){case "RemoveText":case "InsertText":r=!0;break a;default:r=!1}if(r&&k.some(b)){if(e){var q;e=h.spec().optype;r=new g(k,b);var m=r.previous(),p=null,a,d;runtime.assert(Boolean(m),"No edit operations found in state");d=m.group;runtime.assert(void 0!==d,"Operation has no group");for(a=1;m&&m.group===d;){if(e===m.spec().optype){q=m;break}m=r.previous()}if(q){for(m=r.previous();m;){if(m.group!==d){if(2===a)break;d=m.group;a+=1}if(e===m.spec().optype){p=
m;break}m=r.previous()}q=c(h,q,p)}else q=!1;return q}q=h.spec().optype;e=new g(k,b);r=e.previous();runtime.assert(Boolean(r),"No edit operations found in state");q=q===r.spec().optype?c(h,r,e.previous()):!1;return q}return!1}};
// Input 110
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
gui.TrivialUndoManager=function(g){function k(a){0<a.length&&(z=!0,l(a),z=!1)}function b(){y.emit(gui.UndoManager.signalUndoStackChanged,{undoAvailable:q.hasUndoStates(),redoAvailable:q.hasRedoStates()})}function c(){s!==d&&s!==v[v.length-1]&&v.push(s)}function h(a){var b=a.previousSibling||a.nextSibling;a.parentNode.removeChild(a);p.normalizeTextNodes(b)}function n(a){return Object.keys(a).map(function(b){return a[b]})}function e(a){function b(a){var f=a.spec();if(e[f.memberid])switch(f.optype){case "AddCursor":d[f.memberid]||
(d[f.memberid]=a,delete e[f.memberid],h-=1);break;case "MoveCursor":c[f.memberid]||(c[f.memberid]=a)}}var d={},c={},e={},h,g=a.pop();f.getMemberIds().forEach(function(a){e[a]=!0});for(h=Object.keys(e).length;g&&0<h;)g.reverse(),g.forEach(b),g=a.pop();return n(d).concat(n(c))}function r(){var g=a=f.cloneDocumentElement();p.getElementsByTagNameNS(g,m,"cursor").forEach(h);p.getElementsByTagNameNS(g,m,"anchor").forEach(h);c();s=d=e([d].concat(v));v.length=0;u.length=0;b()}var q=this,m="urn:webodf:names:cursor",
p=new core.DomUtils,a,d=[],l,f,s=[],v=[],u=[],y=new core.EventNotifier([gui.UndoManager.signalUndoStackChanged,gui.UndoManager.signalUndoStateCreated,gui.UndoManager.signalUndoStateModified,gui.TrivialUndoManager.signalDocumentRootReplaced]),w=g||new gui.UndoStateRules,z=!1;this.subscribe=function(a,b){y.subscribe(a,b)};this.unsubscribe=function(a,b){y.unsubscribe(a,b)};this.hasUndoStates=function(){return 0<v.length};this.hasRedoStates=function(){return 0<u.length};this.setDocument=function(a){f=
a};this.purgeInitialState=function(){v.length=0;u.length=0;d.length=0;s.length=0;a=null;b()};this.setInitialState=r;this.initialize=function(){a||r()};this.setPlaybackFunction=function(a){l=a};this.onOperationExecuted=function(a){z||(w.isEditOperation(a)&&(s===d||0<u.length)||!w.isPartOfOperationSet(a,s)?(u.length=0,c(),s=[a],v.push(s),y.emit(gui.UndoManager.signalUndoStateCreated,{operations:s}),b()):(s.push(a),y.emit(gui.UndoManager.signalUndoStateModified,{operations:s})))};this.moveForward=function(a){for(var d=
0,c;a&&u.length;)c=u.pop(),v.push(c),k(c),a-=1,d+=1;d&&(s=v[v.length-1],b());return d};this.moveBackward=function(c){for(var e=0;c&&v.length;)u.push(v.pop()),c-=1,e+=1;e&&(f.setDocumentElement(a.cloneNode(!0)),y.emit(gui.TrivialUndoManager.signalDocumentRootReplaced,{}),f.getMemberIds().forEach(function(a){f.removeCursor(a)}),k(d),v.forEach(k),s=v[v.length-1]||d,b());return e}};gui.TrivialUndoManager.signalDocumentRootReplaced="documentRootReplaced";(function(){return gui.TrivialUndoManager})();
// Input 111
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.LazyStyleProperties=function(g,k){var b={};this.value=function(c){var h;b.hasOwnProperty(c)?h=b[c]:(h=k[c](),void 0===h&&g&&(h=g.value(c)),b[c]=h);return h};this.reset=function(c){g=c;b={}}};
odf.StyleParseUtils=function(){function g(b){var c,h;b=(b=/(-?[0-9]*[0-9][0-9]*(\.[0-9]*)?|0+\.[0-9]*[1-9][0-9]*|\.[0-9]*[1-9][0-9]*)((cm)|(mm)|(in)|(pt)|(pc))/.exec(b))?{value:parseFloat(b[1]),unit:b[3]}:null;h=b&&b.unit;"px"===h?c=b.value:"cm"===h?c=96*(b.value/2.54):"mm"===h?c=96*(b.value/25.4):"in"===h?c=96*b.value:"pt"===h?c=b.value/0.75:"pc"===h&&(c=16*b.value);return c}var k=odf.Namespaces.stylens;this.parseLength=g;this.parsePositiveLengthOrPercent=function(b,c,h){var k;k=parseFloat(b.substr(0,
b.indexOf("%")));k=isNaN(k)?void 0:k;var e;void 0!==k?(h&&(e=h.value(c)),k=void 0===e?void 0:k*(e/100)):k=g(b);return k};this.getPropertiesElement=function(b,c,h){for(c=h?h.nextElementSibling:c.firstElementChild;null!==c&&(c.localName!==b||c.namespaceURI!==k);)c=c.nextElementSibling;return c}};
// Input 112
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.GraphicProperties=function(g,k,b){var c=this,h=odf.Namespaces.stylens,n=odf.Namespaces.svgns;this.verticalPos=function(){return c.data.value("verticalPos")};this.verticalRel=function(){return c.data.value("verticalRel")};this.horizontalPos=function(){return c.data.value("horizontalPos")};this.horizontalRel=function(){return c.data.value("horizontalRel")};this.strokeWidth=function(){return c.data.value("strokeWidth")};c.data=new odf.LazyStyleProperties(void 0===b?void 0:b.data,{verticalPos:function(){var b=
g.getAttributeNS(h,"vertical-pos");return""===b?void 0:b},verticalRel:function(){var b=g.getAttributeNS(h,"vertical-rel");return""===b?void 0:b},horizontalPos:function(){var b=g.getAttributeNS(h,"horizontal-pos");return""===b?void 0:b},horizontalRel:function(){var b=g.getAttributeNS(h,"horizontal-rel");return""===b?void 0:b},strokeWidth:function(){var b=g.getAttributeNS(n,"stroke-width");return k.parseLength(b)}})};
odf.ComputedGraphicProperties=function(){var g;this.setGraphicProperties=function(k){g=k};this.verticalPos=function(){return g&&g.verticalPos()||"from-top"};this.verticalRel=function(){return g&&g.verticalRel()||"page"};this.horizontalPos=function(){return g&&g.horizontalPos()||"from-left"};this.horizontalRel=function(){return g&&g.horizontalRel()||"page"}};
// Input 113
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.PageLayoutProperties=function(g,k,b){var c=this,h=odf.Namespaces.fons;this.pageHeight=function(){return c.data.value("pageHeight")||1123};this.pageWidth=function(){return c.data.value("pageWidth")||794};c.data=new odf.LazyStyleProperties(void 0===b?void 0:b.data,{pageHeight:function(){var b;g&&(b=g.getAttributeNS(h,"page-height"),b=k.parseLength(b));return b},pageWidth:function(){var b;g&&(b=g.getAttributeNS(h,"page-width"),b=k.parseLength(b));return b}})};
odf.PageLayout=function(g,k,b){var c=null;g&&(c=k.getPropertiesElement("page-layout-properties",g));this.pageLayout=new odf.PageLayoutProperties(c,k,b&&b.pageLayout)};odf.PageLayoutCache=function(){};odf.PageLayoutCache.prototype.getPageLayout=function(g){};odf.PageLayoutCache.prototype.getDefaultPageLayout=function(){};
// Input 114
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.ParagraphProperties=function(g,k,b){var c=this,h=odf.Namespaces.fons;this.marginTop=function(){return c.data.value("marginTop")};c.data=new odf.LazyStyleProperties(void 0===b?void 0:b.data,{marginTop:function(){var c=g.getAttributeNS(h,"margin-top");return k.parsePositiveLengthOrPercent(c,"marginTop",b&&b.data)}})};
odf.ComputedParagraphProperties=function(){var g={},k=[];this.setStyleChain=function(b){k=b;g={}};this.marginTop=function(){var b,c;if(g.hasOwnProperty("marginTop"))b=g.marginTop;else{for(c=0;void 0===b&&c<k.length;c+=1)b=k[c].marginTop();g.marginTop=b}return b||0}};
// Input 115
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.TextProperties=function(g,k,b){var c=this,h=odf.Namespaces.fons;this.fontSize=function(){return c.data.value("fontSize")};c.data=new odf.LazyStyleProperties(void 0===b?void 0:b.data,{fontSize:function(){var c=g.getAttributeNS(h,"font-size");return k.parsePositiveLengthOrPercent(c,"fontSize",b&&b.data)}})};
odf.ComputedTextProperties=function(){var g={},k=[];this.setStyleChain=function(b){k=b;g={}};this.fontSize=function(){var b,c;if(g.hasOwnProperty("fontSize"))b=g.fontSize;else{for(c=0;void 0===b&&c<k.length;c+=1)b=k[c].fontSize();g.fontSize=b}return b||12}};
// Input 116
/*

 Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
odf.MasterPage=function(g,k){var b;g?(b=g.getAttributeNS(odf.Namespaces.stylens,"page-layout-name"),this.pageLayout=k.getPageLayout(b)):this.pageLayout=k.getDefaultPageLayout()};odf.MasterPageCache=function(){};odf.MasterPageCache.prototype.getMasterPage=function(g){};
odf.StylePileEntry=function(g,k,b,c){this.masterPage=function(){var c=g.getAttributeNS(odf.Namespaces.stylens,"master-page-name"),k=null;0<c.length&&(k=b.getMasterPage(c));return k};(function(b){var n=g.getAttributeNS(odf.Namespaces.stylens,"family"),e=null;if("graphic"===n||"chart"===n)b.graphic=void 0===c?void 0:c.graphic,e=k.getPropertiesElement("graphic-properties",g,e),null!==e&&(b.graphic=new odf.GraphicProperties(e,k,b.graphic));if("paragraph"===n||"table-cell"===n||"graphic"===n||"presentation"===
n||"chart"===n)b.paragraph=void 0===c?void 0:c.paragraph,e=k.getPropertiesElement("paragraph-properties",g,e),null!==e&&(b.paragraph=new odf.ParagraphProperties(e,k,b.paragraph));if("text"===n||"paragraph"===n||"table-cell"===n||"graphic"===n||"presentation"===n||"chart"===n)b.text=void 0===c?void 0:c.text,e=k.getPropertiesElement("text-properties",g,e),null!==e&&(b.text=new odf.TextProperties(e,k,b.text))})(this)};
odf.StylePile=function(g,k){function b(b,a){var d,e;b.hasAttributeNS(c,"parent-style-name")&&(e=b.getAttributeNS(c,"parent-style-name"),-1===a.indexOf(e)&&(d=m(e,a)));return new odf.StylePileEntry(b,g,k,d)}var c=odf.Namespaces.stylens,h={},n={},e,r={},q={},m;m=function(c,a){var d=r[c],e;!d&&(e=h[c])&&(a.push(c),d=b(e,a),r[c]=d);return d};this.getStyle=function(c){var a=q[c]||r[c],d,e=[];a||(d=n[c],d||(d=h[c])&&e.push(c),d&&(a=b(d,e)));return a};this.addCommonStyle=function(b){var a;b.hasAttributeNS(c,
"name")&&(a=b.getAttributeNS(c,"name"),h.hasOwnProperty(a)||(h[a]=b))};this.addAutomaticStyle=function(b){var a;b.hasAttributeNS(c,"name")&&(a=b.getAttributeNS(c,"name"),n.hasOwnProperty(a)||(n[a]=b))};this.setDefaultStyle=function(c){void 0===e&&(e=b(c,[]))};this.getDefaultStyle=function(){return e}};odf.ComputedGraphicStyle=function(){this.text=new odf.ComputedTextProperties;this.paragraph=new odf.ComputedParagraphProperties;this.graphic=new odf.ComputedGraphicProperties};
odf.ComputedParagraphStyle=function(){this.text=new odf.ComputedTextProperties;this.paragraph=new odf.ComputedParagraphProperties};odf.ComputedTextStyle=function(){this.text=new odf.ComputedTextProperties};
odf.StyleCache=function(g){function k(a,b,d,c){b=d.getAttributeNS(b,"class-names");var e;if(b)for(b=b.split(" "),e=0;e<b.length;e+=1)if(d=b[e])c.push(a),c.push(d)}function b(a,b){var d=v.getStyleName("paragraph",a);void 0!==d&&(b.push("paragraph"),b.push(d));a.namespaceURI!==f||"h"!==a.localName&&"p"!==a.localName||k("paragraph",f,a,b);return b}function c(a,b,d){var c=[],e,f,h,g;for(e=0;e<a.length;e+=2)h=a[e],g=a[e+1],h=r[h],g=h.getStyle(g),void 0!==g&&(g=g[b],void 0!==g&&g!==f&&(c.push(g),f=g));
h=r[d];if(g=h.getDefaultStyle())g=g[b],void 0!==g&&g!==f&&c.push(g);return c}function h(a,d){var c=v.getStyleName("text",a),e=a.parentElement;void 0!==c&&(d.push("text"),d.push(c));"span"===a.localName&&a.namespaceURI===f&&k("text",f,a,d);if(!e||e===g)return d;e.namespaceURI!==f||"p"!==e.localName&&"h"!==e.localName?h(e,d):b(e,d);return d}function n(a){a=a.getAttributeNS(s,"family");return r[a]}var e=this,r,q,m,p,a,d,l,f=odf.Namespaces.textns,s=odf.Namespaces.stylens,v=new odf.StyleInfo,u=new odf.StyleParseUtils,
y,w,z,t,B,J;this.getComputedGraphicStyle=function(a){var b=[];a=v.getStyleName("graphic",a);void 0!==a&&(b.push("graphic"),b.push(a));a=b.join("/");var d=p[a];runtime.assert(0===b.length%2,"Invalid style chain.");void 0===d&&(d=new odf.ComputedGraphicStyle,d.graphic.setGraphicProperties(c(b,"graphic","graphic")[0]),d.text.setStyleChain(c(b,"text","graphic")),d.paragraph.setStyleChain(c(b,"paragraph","graphic")),p[a]=d);return d};this.getComputedParagraphStyle=function(a){a=b(a,[]);var d=a.join("/"),
e=m[d];runtime.assert(0===a.length%2,"Invalid style chain.");void 0===e&&(e=new odf.ComputedParagraphStyle,e.text.setStyleChain(c(a,"text","paragraph")),e.paragraph.setStyleChain(c(a,"paragraph","paragraph")),m[d]=e);return e};this.getComputedTextStyle=function(a){a=h(a,[]);var b=a.join("/"),d=q[b];runtime.assert(0===a.length%2,"Invalid style chain.");void 0===d&&(d=new odf.ComputedTextStyle,d.text.setStyleChain(c(a,"text","text")),q[b]=d);return d};this.getPageLayout=function(a){var b=J[a];b||((b=
B[a])?(b=new odf.PageLayout(b,u,t),J[a]=b):b=t);return b};this.getDefaultPageLayout=function(){return t};this.getMasterPage=function(a){var b=w[a];void 0===b&&((b=y[a])?(b=new odf.MasterPage(b,e),w[a]=b):b=null);return b};this.getDefaultMasterPage=function(){return z};this.update=function(){var b,c,f=null,h=null;q={};m={};p={};y={};w={};J={};B={};a=new odf.StylePile(u,e);d=new odf.StylePile(u,e);l=new odf.StylePile(u,e);r={text:a,paragraph:d,graphic:l};for(b=g.styles.firstElementChild;b;)b.namespaceURI===
s&&((c=n(b))?"style"===b.localName?c.addCommonStyle(b):"default-style"===b.localName&&c.setDefaultStyle(b):"default-page-layout"===b.localName&&(f=b)),b=b.nextElementSibling;t=new odf.PageLayout(f,u);for(b=g.automaticStyles.firstElementChild;b;)b.namespaceURI===s&&((c=n(b))&&"style"===b.localName?c.addAutomaticStyle(b):"page-layout"===b.localName&&(B[b.getAttributeNS(s,"name")]=b)),b=b.nextElementSibling;for(b=g.masterStyles.firstElementChild;b;)b.namespaceURI===s&&"master-page"===b.localName&&(h=
h||b,c=b,f=c.getAttributeNS(s,"name"),0<f.length&&!y.hasOwnProperty(f)&&(y[f]=c)),b=b.nextElementSibling;z=new odf.MasterPage(h,e)}};
// Input 117
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OperationTransformMatrix=function(){function g(a){a.position+=a.length;a.length*=-1}function k(a){var b=0>a.length;b&&g(a);return b}function b(a,b){function c(h){a[h]===b&&e.push(h)}var e=[];a&&["style:parent-style-name","style:next-style-name"].forEach(c);return e}function c(a,b){function c(e){a[e]===b&&delete a[e]}a&&["style:parent-style-name","style:next-style-name"].forEach(c)}function h(a){var b={};Object.keys(a).forEach(function(c){b[c]="object"===typeof a[c]?h(a[c]):a[c]});return b}function n(a,
b,c,e){var h,g=!1,k=!1,n,m=[];e&&e.attributes&&(m=e.attributes.split(","));a&&(c||0<m.length)&&Object.keys(a).forEach(function(b){var d=a[b],e;"object"!==typeof d&&(c&&(e=c[b]),void 0!==e?(delete a[b],k=!0,e===d&&(delete c[b],g=!0)):-1!==m.indexOf(b)&&(delete a[b],k=!0))});if(b&&b.attributes&&(c||0<m.length)){n=b.attributes.split(",");for(e=0;e<n.length;e+=1)if(h=n[e],c&&void 0!==c[h]||m&&-1!==m.indexOf(h))n.splice(e,1),e-=1,k=!0;0<n.length?b.attributes=n.join(","):delete b.attributes}return{majorChanged:g,
minorChanged:k}}function e(a){for(var b in a)if(a.hasOwnProperty(b))return!0;return!1}function r(a){for(var b in a)if(a.hasOwnProperty(b)&&("attributes"!==b||0<a.attributes.length))return!0;return!1}function q(a,b,c,f,h){var g=a?a[h]:null,k=b?b[h]:null,m=c?c[h]:null,p=f?f[h]:null,q;q=n(g,k,m,p);g&&!e(g)&&delete a[h];k&&!r(k)&&delete b[h];m&&!e(m)&&delete c[h];p&&!r(p)&&delete f[h];return q}function m(a,b){return{opSpecsA:[a],opSpecsB:[b]}}var p;p={AddCursor:{AddCursor:m,AddMember:m,AddStyle:m,ApplyDirectStyling:m,
InsertText:m,MoveCursor:m,RemoveCursor:m,RemoveMember:m,RemoveStyle:m,RemoveText:m,SetParagraphStyle:m,SplitParagraph:m,UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},AddMember:{AddStyle:m,InsertText:m,MoveCursor:m,RemoveCursor:m,RemoveStyle:m,RemoveText:m,SetParagraphStyle:m,SplitParagraph:m,UpdateMetadata:m,UpdateParagraphStyle:m},AddStyle:{AddStyle:m,ApplyDirectStyling:m,InsertText:m,MoveCursor:m,RemoveCursor:m,RemoveMember:m,RemoveStyle:function(a,d){var e,f=[a],h=[d];a.styleFamily===
d.styleFamily&&(e=b(a.setProperties,d.styleName),0<e.length&&(e={optype:"UpdateParagraphStyle",memberid:d.memberid,timestamp:d.timestamp,styleName:a.styleName,removedProperties:{attributes:e.join(",")}},h.unshift(e)),c(a.setProperties,d.styleName));return{opSpecsA:f,opSpecsB:h}},RemoveText:m,SetParagraphStyle:m,SplitParagraph:m,UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},ApplyDirectStyling:{ApplyDirectStyling:function(a,b,c){var f,g,k,n,m,p,r,t;n=[a];k=[b];if(!(a.position+a.length<=b.position||
a.position>=b.position+b.length)){f=c?a:b;g=c?b:a;if(a.position!==b.position||a.length!==b.length)p=h(f),r=h(g);b=q(g.setProperties,null,f.setProperties,null,"style:text-properties");if(b.majorChanged||b.minorChanged)k=[],a=[],n=f.position+f.length,m=g.position+g.length,g.position<f.position?b.minorChanged&&(t=h(r),t.length=f.position-g.position,a.push(t),g.position=f.position,g.length=m-g.position):f.position<g.position&&b.majorChanged&&(t=h(p),t.length=g.position-f.position,k.push(t),f.position=
g.position,f.length=n-f.position),m>n?b.minorChanged&&(p=r,p.position=n,p.length=m-n,a.push(p),g.length=n-g.position):n>m&&b.majorChanged&&(p.position=m,p.length=n-m,k.push(p),f.length=m-f.position),f.setProperties&&e(f.setProperties)&&k.push(f),g.setProperties&&e(g.setProperties)&&a.push(g),c?(n=k,k=a):n=a}return{opSpecsA:n,opSpecsB:k}},InsertText:function(a,b){b.position<=a.position?a.position+=b.text.length:b.position<=a.position+a.length&&(a.length+=b.text.length);return{opSpecsA:[a],opSpecsB:[b]}},
MoveCursor:m,RemoveCursor:m,RemoveStyle:m,RemoveText:function(a,b){var c=a.position+a.length,e=b.position+b.length,g=[a],h=[b];e<=a.position?a.position-=b.length:b.position<c&&(a.position<b.position?a.length=e<c?a.length-b.length:b.position-a.position:(a.position=b.position,e<c?a.length=c-e:g=[]));return{opSpecsA:g,opSpecsB:h}},SetParagraphStyle:m,SplitParagraph:function(a,b){b.position<a.position?a.position+=1:b.position<a.position+a.length&&(a.length+=1);return{opSpecsA:[a],opSpecsB:[b]}},UpdateMetadata:m,
UpdateParagraphStyle:m},InsertText:{InsertText:function(a,b,c){a.position<b.position?b.position+=a.text.length:a.position>b.position?a.position+=b.text.length:c?b.position+=a.text.length:a.position+=b.text.length;return{opSpecsA:[a],opSpecsB:[b]}},MoveCursor:function(a,b){var c=k(b);a.position<b.position?b.position+=a.text.length:a.position<b.position+b.length&&(b.length+=a.text.length);c&&g(b);return{opSpecsA:[a],opSpecsB:[b]}},RemoveCursor:m,RemoveMember:m,RemoveStyle:m,RemoveText:function(a,b){var c;
c=b.position+b.length;var e=[a],g=[b];c<=a.position?a.position-=b.length:a.position<=b.position?b.position+=a.text.length:(b.length=a.position-b.position,c={optype:"RemoveText",memberid:b.memberid,timestamp:b.timestamp,position:a.position+a.text.length,length:c-a.position},g.unshift(c),a.position=b.position);return{opSpecsA:e,opSpecsB:g}},SplitParagraph:function(a,b){a.position<=b.position?b.position+=a.text.length:a.position+=1;return{opSpecsA:[a],opSpecsB:[b]}},UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},
MoveCursor:{MoveCursor:m,RemoveCursor:function(a,b){return{opSpecsA:a.memberid===b.memberid?[]:[a],opSpecsB:[b]}},RemoveMember:m,RemoveStyle:m,RemoveText:function(a,b){var c=k(a),e=a.position+a.length,h=b.position+b.length;h<=a.position?a.position-=b.length:b.position<e&&(a.position<b.position?a.length=h<e?a.length-b.length:b.position-a.position:(a.position=b.position,a.length=h<e?e-h:0));c&&g(a);return{opSpecsA:[a],opSpecsB:[b]}},SetParagraphStyle:m,SplitParagraph:function(a,b){var c=k(a);b.position<
a.position?a.position+=1:b.position<a.position+a.length&&(a.length+=1);c&&g(a);return{opSpecsA:[a],opSpecsB:[b]}},UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},RemoveCursor:{RemoveCursor:function(a,b){var c=a.memberid===b.memberid;return{opSpecsA:c?[]:[a],opSpecsB:c?[]:[b]}},RemoveMember:m,RemoveStyle:m,RemoveText:m,SetParagraphStyle:m,SplitParagraph:m,UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},RemoveMember:{RemoveStyle:m,RemoveText:m,SetParagraphStyle:m,SplitParagraph:m,UpdateMetadata:m,
UpdateParagraphStyle:m},RemoveStyle:{RemoveStyle:function(a,b){var c=a.styleName===b.styleName&&a.styleFamily===b.styleFamily;return{opSpecsA:c?[]:[a],opSpecsB:c?[]:[b]}},RemoveText:m,SetParagraphStyle:function(a,b){var c,e=[a],g=[b];"paragraph"===a.styleFamily&&a.styleName===b.styleName&&(c={optype:"SetParagraphStyle",memberid:a.memberid,timestamp:a.timestamp,position:b.position,styleName:""},e.unshift(c),b.styleName="");return{opSpecsA:e,opSpecsB:g}},SplitParagraph:m,UpdateMember:m,UpdateMetadata:m,
UpdateParagraphStyle:function(a,d){var e,f=[a],g=[d];"paragraph"===a.styleFamily&&(e=b(d.setProperties,a.styleName),0<e.length&&(e={optype:"UpdateParagraphStyle",memberid:a.memberid,timestamp:a.timestamp,styleName:d.styleName,removedProperties:{attributes:e.join(",")}},f.unshift(e)),a.styleName===d.styleName?g=[]:c(d.setProperties,a.styleName));return{opSpecsA:f,opSpecsB:g}}},RemoveText:{RemoveText:function(a,b){var c=a.position+a.length,e=b.position+b.length,g=[a],h=[b];e<=a.position?a.position-=
b.length:c<=b.position?b.position-=a.length:b.position<c&&(a.position<b.position?(a.length=e<c?a.length-b.length:b.position-a.position,c<e?(b.position=a.position,b.length=e-c):h=[]):(c<e?b.length-=a.length:b.position<a.position?b.length=a.position-b.position:h=[],e<c?(a.position=b.position,a.length=c-e):g=[]));return{opSpecsA:g,opSpecsB:h}},SplitParagraph:function(a,b){var c=a.position+a.length,e=[a],g=[b];b.position<=a.position?a.position+=1:b.position<c&&(a.length=b.position-a.position,c={optype:"RemoveText",
memberid:a.memberid,timestamp:a.timestamp,position:b.position+1,length:c-b.position},e.unshift(c));a.position+a.length<=b.position?b.position-=a.length:a.position<b.position&&(b.position=a.position);return{opSpecsA:e,opSpecsB:g}},UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},SetParagraphStyle:{UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},SplitParagraph:{SplitParagraph:function(a,b,c){a.position<b.position?b.position+=1:a.position>b.position?a.position+=1:a.position===b.position&&
(c?b.position+=1:a.position+=1);return{opSpecsA:[a],opSpecsB:[b]}},UpdateMember:m,UpdateMetadata:m,UpdateParagraphStyle:m},UpdateMember:{UpdateMetadata:m,UpdateParagraphStyle:m},UpdateMetadata:{UpdateMetadata:function(a,b,c){var f,g=[a],h=[b];f=c?a:b;a=c?b:a;n(a.setProperties||null,a.removedProperties||null,f.setProperties||null,f.removedProperties||null);f.setProperties&&e(f.setProperties)||f.removedProperties&&r(f.removedProperties)||(c?g=[]:h=[]);a.setProperties&&e(a.setProperties)||a.removedProperties&&
r(a.removedProperties)||(c?h=[]:g=[]);return{opSpecsA:g,opSpecsB:h}},UpdateParagraphStyle:m},UpdateParagraphStyle:{UpdateParagraphStyle:function(a,b,c){var f,g=[a],h=[b];a.styleName===b.styleName&&(f=c?a:b,a=c?b:a,q(a.setProperties,a.removedProperties,f.setProperties,f.removedProperties,"style:paragraph-properties"),q(a.setProperties,a.removedProperties,f.setProperties,f.removedProperties,"style:text-properties"),n(a.setProperties||null,a.removedProperties||null,f.setProperties||null,f.removedProperties||
null),f.setProperties&&e(f.setProperties)||f.removedProperties&&r(f.removedProperties)||(c?g=[]:h=[]),a.setProperties&&e(a.setProperties)||a.removedProperties&&r(a.removedProperties)||(c?h=[]:g=[]));return{opSpecsA:g,opSpecsB:h}}}};this.passUnchanged=m;this.extendTransformations=function(a){Object.keys(a).forEach(function(b){var c=a[b],e,g=p.hasOwnProperty(b);runtime.log((g?"Extending":"Adding")+" map for optypeA: "+b);g||(p[b]={});e=p[b];Object.keys(c).forEach(function(a){var g=e.hasOwnProperty(a);
runtime.assert(b<=a,"Wrong order:"+b+", "+a);runtime.log("  "+(g?"Overwriting":"Adding")+" entry for optypeB: "+a);e[a]=c[a]})})};this.transformOpspecVsOpspec=function(a,b){var c=a.optype<=b.optype,e;runtime.log("Crosstransforming:");runtime.log(runtime.toJson(a));runtime.log(runtime.toJson(b));c||(e=a,a=b,b=e);(e=(e=p[a.optype])&&e[b.optype])?(e=e(a,b,!c),c||null===e||(e={opSpecsA:e.opSpecsB,opSpecsB:e.opSpecsA})):e=null;runtime.log("result:");e?(runtime.log(runtime.toJson(e.opSpecsA)),runtime.log(runtime.toJson(e.opSpecsB))):
runtime.log("null");return e}};
// Input 118
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 This file is part of WebODF.

 WebODF is free software: you can redistribute it and/or modify it
 under the terms of the GNU Affero General Public License (GNU AGPL)
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 WebODF is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 @licend

 @source: http://www.webodf.org/
 @source: https://github.com/kogmbh/WebODF/
*/
ops.OperationTransformer=function(){function g(c){var g=[];c.forEach(function(c){g.push(b.create(c))});return g}function k(b,g){for(var e,r,q=[],m=[];0<b.length&&g;){e=b.shift();e=c.transformOpspecVsOpspec(e,g);if(!e)return null;q=q.concat(e.opSpecsA);if(0===e.opSpecsB.length){q=q.concat(b);g=null;break}for(;1<e.opSpecsB.length;){r=k(b,e.opSpecsB.shift());if(!r)return null;m=m.concat(r.opSpecsB);b=r.opSpecsA}g=e.opSpecsB.pop()}g&&m.push(g);return{opSpecsA:q,opSpecsB:m}}var b,c=new ops.OperationTransformMatrix;
this.setOperationFactory=function(c){b=c};this.getOperationTransformMatrix=function(){return c};this.transform=function(b,c){for(var e,r=[];0<c.length;){e=k(b,c.shift());if(!e)return null;b=e.opSpecsA;r=r.concat(e.opSpecsB)}return{opsA:g(b),opsB:g(r)}}};
// Input 119
/*

 Copyright (C) 2013 KO GmbH <copyright@kogmbh.com>

 @licstart
 The JavaScript code in this page is free software: you can redistribute it
 and/or modify it under the terms of the GNU Affero General Public License
 (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.  The code is distributed
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this code.  If not, see <http://www.gnu.org/licenses/>.

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
 @source: https://github.com/kogmbh/WebODF/
*/
ops.Server=function(){};ops.Server.prototype.connect=function(g,k){};ops.Server.prototype.networkStatus=function(){};ops.Server.prototype.login=function(g,k,b,c){};ops.Server.prototype.joinSession=function(g,k,b,c){};ops.Server.prototype.leaveSession=function(g,k,b,c){};ops.Server.prototype.getGenesisUrl=function(g){};
// Input 120
var webodf_css="@namespace draw url(urn:oasis:names:tc:opendocument:xmlns:drawing:1.0);\n@namespace fo url(urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0);\n@namespace office url(urn:oasis:names:tc:opendocument:xmlns:office:1.0);\n@namespace presentation url(urn:oasis:names:tc:opendocument:xmlns:presentation:1.0);\n@namespace style url(urn:oasis:names:tc:opendocument:xmlns:style:1.0);\n@namespace svg url(urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0);\n@namespace table url(urn:oasis:names:tc:opendocument:xmlns:table:1.0);\n@namespace text url(urn:oasis:names:tc:opendocument:xmlns:text:1.0);\n@namespace webodfhelper url(urn:webodf:names:helper);\n@namespace cursor url(urn:webodf:names:cursor);\n@namespace editinfo url(urn:webodf:names:editinfo);\n@namespace annotation url(urn:webodf:names:annotation);\n@namespace dc url(http://purl.org/dc/elements/1.1/);\n@namespace svgns url(http://www.w3.org/2000/svg);\n\noffice|document > *, office|document-content > * {\n  display: none;\n}\noffice|body, office|document {\n  display: inline-block;\n  position: relative;\n}\n\ntext|p, text|h {\n  display: block;\n  padding: 0;\n  margin: 0;\n  line-height: normal;\n  position: relative;\n  min-height: 1.3em; /* prevent empty paragraphs and headings from collapsing if they are empty */\n}\n*[webodfhelper|containsparagraphanchor] {\n  position: relative;\n}\ntext|s {\n    white-space: pre;\n}\ntext|tab {\n  display: inline;\n  white-space: pre;\n}\ntext|tracked-changes {\n  /*Consumers that do not support change tracking, should ignore changes.*/\n  display: none;\n}\noffice|binary-data {\n  display: none;\n}\noffice|text {\n  display: block;\n  text-align: left;\n  overflow: visible;\n  word-wrap: break-word;\n}\n\noffice|text::selection {\n  /** Let's not draw selection highlight that overflows into the office|text\n   * node when selecting content across several paragraphs\n   */\n  background: transparent;\n}\n\n.webodf-virtualSelections *::selection {\n  background: transparent;\n}\n.webodf-virtualSelections *::-moz-selection {\n  background: transparent;\n}\n\noffice|text * draw|text-box {\n/** only for text documents */\n    display: block;\n    border: 1px solid #d3d3d3;\n}\noffice|text draw|frame {\n  /** make sure frames are above the main text. */\n  z-index: 1;\n}\noffice|spreadsheet {\n  display: block;\n  border-collapse: collapse;\n  empty-cells: show;\n  font-family: sans-serif;\n  font-size: 10pt;\n  text-align: left;\n  page-break-inside: avoid;\n  overflow: hidden;\n}\noffice|presentation {\n  display: inline-block;\n  text-align: left;\n}\n#shadowContent {\n  display: inline-block;\n  text-align: left;\n}\ndraw|page {\n  display: block;\n  position: relative;\n  overflow: hidden;\n}\npresentation|notes, presentation|footer-decl, presentation|date-time-decl {\n    display: none;\n}\n@media print {\n  draw|page {\n    border: 1pt solid black;\n    page-break-inside: avoid;\n  }\n  presentation|notes {\n    /*TODO*/\n  }\n}\noffice|spreadsheet text|p {\n  border: 0px;\n  padding: 1px;\n  margin: 0px;\n}\noffice|spreadsheet table|table {\n  margin: 3px;\n}\noffice|spreadsheet table|table:after {\n  /* show sheet name the end of the sheet */\n  /*content: attr(table|name);*/ /* gives parsing error in opera */\n}\noffice|spreadsheet table|table-row {\n  counter-increment: row;\n}\noffice|spreadsheet table|table-row:before {\n  width: 3em;\n  background: #cccccc;\n  border: 1px solid black;\n  text-align: center;\n  content: counter(row);\n  display: table-cell;\n}\noffice|spreadsheet table|table-cell {\n  border: 1px solid #cccccc;\n}\ntable|table {\n  display: table;\n}\ndraw|frame table|table {\n  width: 100%;\n  height: 100%;\n  background: white;\n}\ntable|table-header-rows {\n  display: table-header-group;\n}\ntable|table-row {\n  display: table-row;\n}\ntable|table-column {\n  display: table-column;\n}\ntable|table-cell {\n  width: 0.889in;\n  display: table-cell;\n  word-break: break-all; /* prevent long words from extending out the table cell */\n}\ndraw|frame {\n  display: block;\n}\ndraw|image {\n  display: block;\n  width: 100%;\n  height: 100%;\n  top: 0px;\n  left: 0px;\n  background-repeat: no-repeat;\n  background-size: 100% 100%;\n  -moz-background-size: 100% 100%;\n}\n/* only show the first image in frame */\ndraw|frame > draw|image:nth-of-type(n+2) {\n  display: none;\n}\ntext|list:before {\n    display: none;\n    content:\"\";\n}\ntext|list {\n    display: block;\n    counter-reset: list;\n}\ntext|list-item {\n    display: block;\n}\ntext|number {\n    display:none;\n}\n\ntext|a {\n    color: blue;\n    text-decoration: underline;\n    cursor: pointer;\n}\n.webodf-inactiveLinks text|a {\n    cursor: text;\n}\ntext|note-citation {\n    vertical-align: super;\n    font-size: smaller;\n}\ntext|note-body {\n    display: none;\n}\ntext|note:hover text|note-citation {\n    background: #dddddd;\n}\ntext|note:hover text|note-body {\n    display: block;\n    left:1em;\n    max-width: 80%;\n    position: absolute;\n    background: #ffffaa;\n}\ntext|bibliography-source {\n  display: none;\n}\nsvg|title, svg|desc {\n    display: none;\n}\nvideo {\n    width: 100%;\n    height: 100%\n}\n\n/* below set up the cursor */\ncursor|cursor {\n    display: inline;\n    width: 0;\n    height: 1em;\n    /* making the position relative enables the avatar to use\n       the cursor as reference for its absolute position */\n    position: relative;\n    z-index: 1;\n    pointer-events: none;\n}\n\ncursor|cursor > .caret {\n    /* IMPORTANT: when changing these values ensure DEFAULT_CARET_TOP and DEFAULT_CARET_HEIGHT\n        in Caret.js remain in sync */\n    display: inline;\n    position: absolute;\n    top: 5%; /* push down the caret; 0px can do the job, 5% looks better, 10% is a bit over */\n    height: 1em;\n    border-left: 2px solid black;\n    outline: none;\n}\n\ncursor|cursor > .handle {\n    padding: 3px;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n    border: none !important;\n    border-radius: 5px;\n    opacity: 0.3;\n}\n\ncursor|cursor > .handle > img {\n    border-radius: 5px;\n}\n\ncursor|cursor > .handle.active {\n    opacity: 0.8;\n}\n\ncursor|cursor > .handle:after {\n    content: ' ';\n    position: absolute;\n    width: 0px;\n    height: 0px;\n    border-style: solid;\n    border-width: 8.7px 5px 0 5px;\n    border-color: black transparent transparent transparent;\n\n    top: 100%;\n    left: 43%;\n}\n\n/** Input Method Editor input pane & behaviours */\n/* not within a cursor */\n#eventTrap {\n    height: auto;\n    display: block;\n    position: absolute;\n    width: 1px;\n    outline: none;\n    opacity: 0;\n    color: rgba(255, 255, 255, 0); /* hide the blinking caret by setting the colour to fully transparent */\n    overflow: hidden; /* The overflow visibility is used to hide and show characters being entered */\n    pointer-events: none;\n}\n\n/* within a cursor */\ncursor|cursor > #composer {\n    text-decoration: underline;\n}\n\ncursor|cursor[cursor|composing=\"true\"] > #composer {\n    display: inline-block;\n    height: auto;\n    width: auto;\n}\n\ncursor|cursor[cursor|composing=\"true\"] {\n    display: inline-block;\n    width: auto;\n    height: inherit;\n}\n\ncursor|cursor[cursor|composing=\"true\"] > .caret {\n    /* during composition, the caret should be pushed along by the composition text, inline with the text */\n    position: static;\n    /* as it is now part of an inline-block, it will no longer need correct to top or height values to align properly */\n    height: auto !important;\n    top: auto !important;\n}\n\neditinfo|editinfo {\n    /* Empty or invisible display:inline elements respond very badly to mouse selection.\n       Inline blocks are much more reliably selectable in Chrome & friends */\n    display: inline-block;\n}\n\n.editInfoMarker {\n    position: absolute;\n    width: 10px;\n    height: 100%;\n    left: -20px;\n    opacity: 0.8;\n    top: 0;\n    border-radius: 5px;\n    background-color: transparent;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n}\n.editInfoMarker:hover {\n    box-shadow: 0px 0px 8px rgba(0, 0, 0, 1);\n}\n\n.editInfoHandle {\n    position: absolute;\n    background-color: black;\n    padding: 5px;\n    border-radius: 5px;\n    opacity: 0.8;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n    bottom: 100%;\n    margin-bottom: 10px;\n    z-index: 3;\n    left: -25px;\n}\n.editInfoHandle:after {\n    content: ' ';\n    position: absolute;\n    width: 0px;\n    height: 0px;\n    border-style: solid;\n    border-width: 8.7px 5px 0 5px;\n    border-color: black transparent transparent transparent;\n\n    top: 100%;\n    left: 5px;\n}\n.editInfo {\n    font-family: sans-serif;\n    font-weight: normal;\n    font-style: normal;\n    text-decoration: none;\n    color: white;\n    width: 100%;\n    height: 12pt;\n}\n.editInfoColor {\n    float: left;\n    width: 10pt;\n    height: 10pt;\n    border: 1px solid white;\n}\n.editInfoAuthor {\n    float: left;\n    margin-left: 5pt;\n    font-size: 10pt;\n    text-align: left;\n    height: 12pt;\n    line-height: 12pt;\n}\n.editInfoTime {\n    float: right;\n    margin-left: 30pt;\n    font-size: 8pt;\n    font-style: italic;\n    color: yellow;\n    height: 12pt;\n    line-height: 12pt;\n}\n\n.annotationWrapper {\n    display: inline;\n    position: relative;\n}\n\n.annotationRemoveButton:before {\n    content: '\u00d7';\n    color: white;\n    padding: 5px;\n    line-height: 1em;\n}\n\n.annotationRemoveButton {\n    width: 20px;\n    height: 20px;\n    border-radius: 10px;\n    background-color: black;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n    position: absolute;\n    top: -10px;\n    left: -10px;\n    z-index: 3;\n    text-align: center;\n    font-family: sans-serif;\n    font-style: normal;\n    font-weight: normal;\n    text-decoration: none;\n    font-size: 15px;\n}\n.annotationRemoveButton:hover {\n    cursor: pointer;\n    box-shadow: 0px 0px 5px rgba(0, 0, 0, 1);\n}\n\n.annotationNote {\n    width: 4cm;\n    position: absolute;\n    display: inline;\n    z-index: 10;\n}\n.annotationNote > office|annotation {\n    display: block;\n    text-align: left;\n}\n\n.annotationConnector {\n    position: absolute;\n    display: inline;\n    z-index: 2;\n    border-top: 1px dashed brown;\n}\n.annotationConnector.angular {\n    -moz-transform-origin: left top;\n    -webkit-transform-origin: left top;\n    -ms-transform-origin: left top;\n    transform-origin: left top;\n}\n.annotationConnector.horizontal {\n    left: 0;\n}\n.annotationConnector.horizontal:before {\n    content: '';\n    display: inline;\n    position: absolute;\n    width: 0px;\n    height: 0px;\n    border-style: solid;\n    border-width: 8.7px 5px 0 5px;\n    border-color: brown transparent transparent transparent;\n    top: -1px;\n    left: -5px;\n}\n\noffice|annotation {\n    width: 100%;\n    height: 100%;\n    display: none;\n    background: rgb(198, 238, 184);\n    background: -moz-linear-gradient(90deg, rgb(198, 238, 184) 30%, rgb(180, 196, 159) 100%);\n    background: -webkit-linear-gradient(90deg, rgb(198, 238, 184) 30%, rgb(180, 196, 159) 100%);\n    background: -o-linear-gradient(90deg, rgb(198, 238, 184) 30%, rgb(180, 196, 159) 100%);\n    background: -ms-linear-gradient(90deg, rgb(198, 238, 184) 30%, rgb(180, 196, 159) 100%);\n    background: linear-gradient(180deg, rgb(198, 238, 184) 30%, rgb(180, 196, 159) 100%);\n    box-shadow: 0 3px 4px -3px #ccc;\n}\n\noffice|annotation > dc|creator {\n    display: block;\n    font-size: 10pt;\n    font-weight: normal;\n    font-style: normal;\n    font-family: sans-serif;\n    color: white;\n    background-color: brown;\n    padding: 4px;\n}\noffice|annotation > dc|date {\n    display: block;\n    font-size: 10pt;\n    font-weight: normal;\n    font-style: normal;\n    font-family: sans-serif;\n    border: 4px solid transparent;\n    color: black;\n}\noffice|annotation > text|list {\n    display: block;\n    padding: 5px;\n}\n\n/* This is very temporary CSS. This must go once\n * we start bundling webodf-default ODF styles for annotations.\n */\noffice|annotation text|p {\n    font-size: 10pt;\n    color: black;\n    font-weight: normal;\n    font-style: normal;\n    text-decoration: none;\n    font-family: sans-serif;\n}\n\n#annotationsPane {\n    background-color: #EAEAEA;\n    width: 4cm;\n    height: 100%;\n    display: none;\n    position: absolute;\n    outline: 1px solid #ccc;\n}\n\n.webodf-annotationHighlight {\n    background-color: yellow;\n    position: relative;\n}\n\n.webodf-selectionOverlay {\n    position: absolute;\n    pointer-events: none;\n    top: 0;\n    left: 0;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    z-index: 15;\n}\n.webodf-selectionOverlay > polygon {\n    fill-opacity: 0.3;\n    stroke-opacity: 0.8;\n    stroke-width: 1;\n    fill-rule: evenodd;\n}\n\n.webodf-selectionOverlay > .webodf-draggable {\n    fill-opacity: 0.8;\n    stroke-opacity: 0;\n    stroke-width: 8;\n    pointer-events: all;\n    display: none;\n\n    -moz-transform-origin: center center;\n    -webkit-transform-origin: center center;\n    -ms-transform-origin: center center;\n    transform-origin: center center;\n}\n\n#imageSelector {\n    display: none;\n    position: absolute;\n    border-style: solid;\n    border-color: black;\n}\n\n#imageSelector > div {\n    width: 5px;\n    height: 5px;\n    display: block;\n    position: absolute;\n    border: 1px solid black;\n    background-color: #ffffff;\n}\n\n#imageSelector > .topLeft {\n    top: -4px;\n    left: -4px;\n}\n\n#imageSelector > .topRight {\n    top: -4px;\n    right: -4px;\n}\n\n#imageSelector > .bottomRight {\n    right: -4px;\n    bottom: -4px;\n}\n\n#imageSelector > .bottomLeft {\n    bottom: -4px;\n    left: -4px;\n}\n\n#imageSelector > .topMiddle {\n    top: -4px;\n    left: 50%;\n    margin-left: -2.5px; /* half of the width defined in #imageSelector > div */\n}\n\n#imageSelector > .rightMiddle {\n    top: 50%;\n    right: -4px;\n    margin-top: -2.5px; /* half of the height defined in #imageSelector > div */\n}\n\n#imageSelector > .bottomMiddle {\n    bottom: -4px;\n    left: 50%;\n    margin-left: -2.5px; /* half of the width defined in #imageSelector > div */\n}\n\n#imageSelector > .leftMiddle {\n    top: 50%;\n    left: -4px;\n    margin-top: -2.5px; /* half of the height defined in #imageSelector > div */\n}\n\ndiv.webodf-customScrollbars::-webkit-scrollbar\n{\n    width: 8px;\n    height: 8px;\n    background-color: transparent;\n}\n\ndiv.webodf-customScrollbars::-webkit-scrollbar-track\n{\n    background-color: transparent;\n}\n\ndiv.webodf-customScrollbars::-webkit-scrollbar-thumb\n{\n    background-color: #444;\n    border-radius: 4px;\n}\n\n.webodf-hyperlinkTooltip {\n    display: none;\n    color: white;\n    background-color: black;\n    border-radius: 5px;\n    box-shadow: 2px 2px 5px gray;\n    padding: 3px;\n    position: absolute;\n    max-width: 210px;\n    text-align: left;\n    word-break: break-all;\n    z-index: 16;\n}\n\n.webodf-hyperlinkTooltipText {\n    display: block;\n    font-weight: bold;\n}\n";
