// Input 0
var webodf_version="0.4.2-1609-g56ac3f1";
// Input 1
function Runtime(){}Runtime.prototype.getVariable=function(e){};Runtime.prototype.toJson=function(e){};Runtime.prototype.fromJson=function(e){};Runtime.prototype.byteArrayFromString=function(e,g){};Runtime.prototype.byteArrayToString=function(e,g){};Runtime.prototype.read=function(e,g,c,n){};Runtime.prototype.readFile=function(e,g,c){};Runtime.prototype.readFileSync=function(e,g){};Runtime.prototype.loadXML=function(e,g){};Runtime.prototype.writeFile=function(e,g,c){};
Runtime.prototype.isFile=function(e,g){};Runtime.prototype.getFileSize=function(e,g){};Runtime.prototype.deleteFile=function(e,g){};Runtime.prototype.log=function(e,g){};Runtime.prototype.setTimeout=function(e,g){};Runtime.prototype.clearTimeout=function(e){};Runtime.prototype.libraryPaths=function(){};Runtime.prototype.currentDirectory=function(){};Runtime.prototype.setCurrentDirectory=function(e){};Runtime.prototype.type=function(){};Runtime.prototype.getDOMImplementation=function(){};
Runtime.prototype.parseXML=function(e){};Runtime.prototype.exit=function(e){};Runtime.prototype.getWindow=function(){};Runtime.prototype.assert=function(e,g,c){};var IS_COMPILED_CODE=!0;
Runtime.byteArrayToString=function(e,g){function c(c){var h="",l,r=c.length;for(l=0;l<r;l+=1)h+=String.fromCharCode(c[l]&255);return h}function n(c){var h="",l,r=c.length,d=[],f,a,b,k;for(l=0;l<r;l+=1)f=c[l],128>f?d.push(f):(l+=1,a=c[l],194<=f&&224>f?d.push((f&31)<<6|a&63):(l+=1,b=c[l],224<=f&&240>f?d.push((f&15)<<12|(a&63)<<6|b&63):(l+=1,k=c[l],240<=f&&245>f&&(f=(f&7)<<18|(a&63)<<12|(b&63)<<6|k&63,f-=65536,d.push((f>>10)+55296,(f&1023)+56320))))),1E3===d.length&&(h+=String.fromCharCode.apply(null,
d),d.length=0);return h+String.fromCharCode.apply(null,d)}var q;"utf8"===g?q=n(e):("binary"!==g&&this.log("Unsupported encoding: "+g),q=c(e));return q};Runtime.getVariable=function(e){try{return eval(e)}catch(g){}};Runtime.toJson=function(e){return JSON.stringify(e)};Runtime.fromJson=function(e){return JSON.parse(e)};Runtime.getFunctionName=function(e){return void 0===e.name?(e=/function\s+(\w+)/.exec(e))&&e[1]:e.name};
function BrowserRuntime(e){function g(f){var a=f.length,b,k,d=0;for(b=0;b<a;b+=1)k=f.charCodeAt(b),d+=1+(128<k)+(2048<k),55040<k&&57344>k&&(d+=1,b+=1);return d}function c(f,a,b){var k=f.length,d,c;a=new Uint8Array(new ArrayBuffer(a));b?(a[0]=239,a[1]=187,a[2]=191,c=3):c=0;for(b=0;b<k;b+=1)d=f.charCodeAt(b),128>d?(a[c]=d,c+=1):2048>d?(a[c]=192|d>>>6,a[c+1]=128|d&63,c+=2):55040>=d||57344<=d?(a[c]=224|d>>>12&15,a[c+1]=128|d>>>6&63,a[c+2]=128|d&63,c+=3):(b+=1,d=(d-55296<<10|f.charCodeAt(b)-56320)+65536,
a[c]=240|d>>>18&7,a[c+1]=128|d>>>12&63,a[c+2]=128|d>>>6&63,a[c+3]=128|d&63,c+=4);return a}function n(d){var a=d.length,b=new Uint8Array(new ArrayBuffer(a)),k;for(k=0;k<a;k+=1)b[k]=d.charCodeAt(k)&255;return b}function q(d,a){var b,k,p;void 0!==a?p=d:a=d;e?(k=e.ownerDocument,p&&(b=k.createElement("span"),b.className=p,b.appendChild(k.createTextNode(p)),e.appendChild(b),e.appendChild(k.createTextNode(" "))),b=k.createElement("span"),0<a.length&&"<"===a[0]?b.innerHTML=a:b.appendChild(k.createTextNode(a)),
e.appendChild(b),e.appendChild(k.createElement("br"))):console&&console.log(a);"alert"===p&&alert(a)}function m(f,a,b){if(0!==b.status||b.responseText)if(200===b.status||0===b.status){if(b.response&&"string"!==typeof b.response)"binary"===a?(b=b.response,b=new Uint8Array(b)):b=String(b.response);else if("binary"===a)if(null!==b.responseBody&&"undefined"!==String(typeof VBArray)){b=(new VBArray(b.responseBody)).toArray();var k=b.length,p=new Uint8Array(new ArrayBuffer(k));for(a=0;a<k;a+=1)p[a]=b[a];
b=p}else{(a=b.getResponseHeader("Content-Length"))&&(a=parseInt(a,10));if(a&&a!==b.responseText.length)a:{var k=b.responseText,p=!1,h=g(k);if("number"===typeof a){if(a!==h&&a!==h+3){k=void 0;break a}p=h+3===a;h=a}k=c(k,h,p)}void 0===k&&(k=n(b.responseText));b=k}else b=b.responseText;d[f]=b;f={err:null,data:b}}else f={err:b.responseText||b.statusText,data:null};else f={err:"File "+f+" is empty.",data:null};return f}function h(d,a,b){var k=new XMLHttpRequest;k.open("GET",d,b);k.overrideMimeType&&("binary"!==
a?k.overrideMimeType("text/plain; charset="+a):k.overrideMimeType("text/plain; charset=x-user-defined"));return k}function l(f,a,b){function k(){var k;4===p.readyState&&(k=m(f,a,p),b(k.err,k.data))}if(d.hasOwnProperty(f))b(null,d[f]);else{var p=h(f,a,!0);p.onreadystatechange=k;try{p.send(null)}catch(c){b(c.message,null)}}}var r=this,d={};this.byteArrayFromString=function(d,a){var b;"utf8"===a?b=c(d,g(d),!1):("binary"!==a&&r.log("unknown encoding: "+a),b=n(d));return b};this.byteArrayToString=Runtime.byteArrayToString;
this.getVariable=Runtime.getVariable;this.fromJson=Runtime.fromJson;this.toJson=Runtime.toJson;this.readFile=l;this.read=function(d,a,b,k){l(d,"binary",function(d,f){var c=null;if(f){if("string"===typeof f)throw"This should not happen.";c=f.subarray(a,a+b)}k(d,c)})};this.readFileSync=function(d,a){var b=h(d,a,!1),k;try{b.send(null);k=m(d,a,b);if(k.err)throw k.err;if(null===k.data)throw"No data read from "+d+".";}catch(p){throw p;}return k.data};this.writeFile=function(f,a,b){d[f]=a;var k=new XMLHttpRequest,
p;k.open("PUT",f,!0);k.onreadystatechange=function(){4===k.readyState&&(0!==k.status||k.responseText?200<=k.status&&300>k.status||0===k.status?b(null):b("Status "+String(k.status)+": "+k.responseText||k.statusText):b("File "+f+" is empty."))};p=a.buffer&&!k.sendAsBinary?a.buffer:r.byteArrayToString(a,"binary");try{k.sendAsBinary?k.sendAsBinary(p):k.send(p)}catch(c){r.log("HUH? "+c+" "+a),b(c.message)}};this.deleteFile=function(f,a){delete d[f];var b=new XMLHttpRequest;b.open("DELETE",f,!0);b.onreadystatechange=
function(){4===b.readyState&&(200>b.status&&300<=b.status?a(b.responseText):a(null))};b.send(null)};this.loadXML=function(d,a){var b=new XMLHttpRequest;b.open("GET",d,!0);b.overrideMimeType&&b.overrideMimeType("text/xml");b.onreadystatechange=function(){4===b.readyState&&(0!==b.status||b.responseText?200===b.status||0===b.status?a(null,b.responseXML):a(b.responseText,null):a("File "+d+" is empty.",null))};try{b.send(null)}catch(k){a(k.message,null)}};this.isFile=function(d,a){r.getFileSize(d,function(b){a(-1!==
b)})};this.getFileSize=function(f,a){if(d.hasOwnProperty(f)&&"string"!==typeof d[f])a(d[f].length);else{var b=new XMLHttpRequest;b.open("HEAD",f,!0);b.onreadystatechange=function(){if(4===b.readyState){var d=b.getResponseHeader("Content-Length");d?a(parseInt(d,10)):l(f,"binary",function(b,d){b?a(-1):a(d.length)})}};b.send(null)}};this.log=q;this.assert=function(d,a,b){if(!d)throw q("alert","ASSERTION FAILED:\n"+a),b&&b(),a;};this.setTimeout=function(d,a){return setTimeout(function(){d()},a)};this.clearTimeout=
function(d){clearTimeout(d)};this.libraryPaths=function(){return["lib"]};this.setCurrentDirectory=function(){};this.currentDirectory=function(){return""};this.type=function(){return"BrowserRuntime"};this.getDOMImplementation=function(){return window.document.implementation};this.parseXML=function(d){return(new DOMParser).parseFromString(d,"text/xml")};this.exit=function(d){q("Calling exit with code "+String(d)+", but exit() is not implemented.")};this.getWindow=function(){return window}}
function NodeJSRuntime(){function e(c){var d=c.length,f,a=new Uint8Array(new ArrayBuffer(d));for(f=0;f<d;f+=1)a[f]=c[f];return a}function g(c,d,f){function a(a,d){if(a)return f(a,null);if(!d)return f("No data for "+c+".",null);if("string"===typeof d)return f(a,d);f(a,e(d))}c=q.resolve(m,c);"binary"!==d?n.readFile(c,d,a):n.readFile(c,null,a)}var c=this,n=require("fs"),q=require("path"),m="",h,l;this.byteArrayFromString=function(c,d){var f=new Buffer(c,d),a,b=f.length,k=new Uint8Array(new ArrayBuffer(b));
for(a=0;a<b;a+=1)k[a]=f[a];return k};this.byteArrayToString=Runtime.byteArrayToString;this.getVariable=Runtime.getVariable;this.fromJson=Runtime.fromJson;this.toJson=Runtime.toJson;this.readFile=g;this.loadXML=function(h,d){g(h,"utf-8",function(f,a){if(f)return d(f,null);if(!a)return d("No data for "+h+".",null);d(null,c.parseXML(a))})};this.writeFile=function(c,d,f){d=new Buffer(d);c=q.resolve(m,c);n.writeFile(c,d,"binary",function(a){f(a||null)})};this.deleteFile=function(c,d){c=q.resolve(m,c);
n.unlink(c,d)};this.read=function(c,d,f,a){c=q.resolve(m,c);n.open(c,"r+",666,function(b,k){if(b)a(b,null);else{var p=new Buffer(f);n.read(k,p,0,f,d,function(b){n.close(k);a(b,e(p))})}})};this.readFileSync=function(c,d){var f;f=n.readFileSync(c,"binary"===d?null:d);if(null===f)throw"File "+c+" could not be read.";"binary"===d&&(f=e(f));return f};this.isFile=function(c,d){c=q.resolve(m,c);n.stat(c,function(f,a){d(!f&&a.isFile())})};this.getFileSize=function(c,d){c=q.resolve(m,c);n.stat(c,function(f,
a){f?d(-1):d(a.size)})};this.log=function(c,d){var f;void 0!==d?f=c:d=c;"alert"===f&&process.stderr.write("\n!!!!! ALERT !!!!!\n");process.stderr.write(d+"\n");"alert"===f&&process.stderr.write("!!!!! ALERT !!!!!\n")};this.assert=function(c,d,f){c||(process.stderr.write("ASSERTION FAILED: "+d),f&&f())};this.setTimeout=function(c,d){return setTimeout(function(){c()},d)};this.clearTimeout=function(c){clearTimeout(c)};this.libraryPaths=function(){return[__dirname]};this.setCurrentDirectory=function(c){m=
c};this.currentDirectory=function(){return m};this.type=function(){return"NodeJSRuntime"};this.getDOMImplementation=function(){return l};this.parseXML=function(c){return h.parseFromString(c,"text/xml")};this.exit=process.exit;this.getWindow=function(){return null};h=new (require("xmldom").DOMParser);l=c.parseXML("<a/>").implementation}
function RhinoRuntime(){function e(c,h){var d;void 0!==h?d=c:h=c;"alert"===d&&print("\n!!!!! ALERT !!!!!");print(h);"alert"===d&&print("!!!!! ALERT !!!!!")}var g=this,c={},n=c.javax.xml.parsers.DocumentBuilderFactory.newInstance(),q,m,h="";n.setValidating(!1);n.setNamespaceAware(!0);n.setExpandEntityReferences(!1);n.setSchema(null);m=c.org.xml.sax.EntityResolver({resolveEntity:function(h,e){var d=new c.java.io.FileReader(e);return new c.org.xml.sax.InputSource(d)}});q=n.newDocumentBuilder();q.setEntityResolver(m);
this.byteArrayFromString=function(c,h){var d,f=c.length,a=new Uint8Array(new ArrayBuffer(f));for(d=0;d<f;d+=1)a[d]=c.charCodeAt(d)&255;return a};this.byteArrayToString=Runtime.byteArrayToString;this.getVariable=Runtime.getVariable;this.fromJson=Runtime.fromJson;this.toJson=Runtime.toJson;this.loadXML=function(h,e){var d=new c.java.io.File(h),f=null;try{f=q.parse(d)}catch(a){return print(a),e(a,null)}e(null,f)};this.readFile=function(l,e,d){h&&(l=h+"/"+l);var f=new c.java.io.File(l),a="binary"===e?
"latin1":e;f.isFile()?((l=readFile(l,a))&&"binary"===e&&(l=g.byteArrayFromString(l,"binary")),d(null,l)):d(l+" is not a file.",null)};this.writeFile=function(l,e,d){h&&(l=h+"/"+l);l=new c.java.io.FileOutputStream(l);var f,a=e.length;for(f=0;f<a;f+=1)l.write(e[f]);l.close();d(null)};this.deleteFile=function(l,e){h&&(l=h+"/"+l);var d=new c.java.io.File(l),f=l+Math.random(),f=new c.java.io.File(f);d.rename(f)?(f.deleteOnExit(),e(null)):e("Could not delete "+l)};this.read=function(l,e,d,f){h&&(l=h+"/"+
l);var a;a=l;var b="binary";(new c.java.io.File(a)).isFile()?("binary"===b&&(b="latin1"),a=readFile(a,b)):a=null;a?f(null,this.byteArrayFromString(a.substring(e,e+d),"binary")):f("Cannot read "+l,null)};this.readFileSync=function(c,h){if(!h)return"";var d=readFile(c,h);if(null===d)throw"File could not be read.";return d};this.isFile=function(l,e){h&&(l=h+"/"+l);var d=new c.java.io.File(l);e(d.isFile())};this.getFileSize=function(l,e){h&&(l=h+"/"+l);var d=new c.java.io.File(l);e(d.length())};this.log=
e;this.assert=function(c,h,d){c||(e("alert","ASSERTION FAILED: "+h),d&&d())};this.setTimeout=function(c){c();return 0};this.clearTimeout=function(){};this.libraryPaths=function(){return["lib"]};this.setCurrentDirectory=function(c){h=c};this.currentDirectory=function(){return h};this.type=function(){return"RhinoRuntime"};this.getDOMImplementation=function(){return q.getDOMImplementation()};this.parseXML=function(h){h=new c.java.io.StringReader(h);h=new c.org.xml.sax.InputSource(h);return q.parse(h)};
this.exit=quit;this.getWindow=function(){return null}}Runtime.create=function(){return"undefined"!==String(typeof window)?new BrowserRuntime(window.document.getElementById("logoutput")):"undefined"!==String(typeof require)?new NodeJSRuntime:new RhinoRuntime};var runtime=Runtime.create(),core={},gui={},xmldom={},odf={},ops={};
(function(){function e(c,l){var e=c+"/manifest.json",d,f;if(!m.hasOwnProperty(e)){m[e]=1;try{d=runtime.readFileSync(e,"utf-8")}catch(a){console.log(String(a));return}e=JSON.parse(d);for(f in e)e.hasOwnProperty(f)&&(l[f]={dir:c,deps:e[f]})}}function g(c,e,m){var d=e[c].deps,f={};m[c]=f;d.forEach(function(a){f[a]=1});d.forEach(function(a){m[a]||g(a,e,m)});d.forEach(function(a){Object.keys(m[a]).forEach(function(a){f[a]=1})})}function c(c,e){function g(a,b){var d,p=e[a];if(-1===f.indexOf(a)&&-1===b.indexOf(a)){b.push(a);
for(d=0;d<c.length;d+=1)p[c[d]]&&g(c[d],b);b.pop();f.push(a)}}var d,f=[];for(d=0;d<c.length;d+=1)g(c[d],[]);return f}function n(c,e){for(var g=0;g<c.length&&void 0!==e[g];)null!==e[g]&&(eval(e[g]),e[g]=null),g+=1}var q={},m={};runtime.loadClass=function(h){if(!IS_COMPILED_CODE){var l=h.replace(".","/")+".js";if(!m.hasOwnProperty(l)){if(!(0<Object.keys(q).length)){var r=runtime.libraryPaths(),l={},d;runtime.currentDirectory()&&e(runtime.currentDirectory(),l);for(d=0;d<r.length;d+=1)e(r[d],l);var f;
d={};for(f in l)l.hasOwnProperty(f)&&g(f,l,d);for(f in l)l.hasOwnProperty(f)&&(r=Object.keys(d[f]),l[f].deps=c(r,d),l[f].deps.push(f));q=l}f=h.replace(".","/")+".js";h=[];f=q[f].deps;for(l=0;l<f.length;l+=1)m.hasOwnProperty(f[l])||h.push(f[l]);f=[];f.length=h.length;for(l=h.length-1;0<=l;l-=1)m[h[l]]=1,void 0===f[l]&&(r=h[l],r=q[r].dir+"/"+r,d=runtime.readFileSync(r,"utf-8"),d+="\n//# sourceURL="+r,d+="\n//@ sourceURL="+r,f[l]=d);n(h,f)}}}})();
(function(){var e=function(e){return e};runtime.getTranslator=function(){return e};runtime.setTranslator=function(g){e=g};runtime.tr=function(g){var c=e(g);return c&&"string"===String(typeof c)?c:g}})();
(function(e){function g(c){if(c.length){var e=c[0];runtime.readFile(e,"utf8",function(g,m){function h(){var d;(d=eval(r))&&runtime.exit(d)}var l="",r=m;-1!==e.indexOf("/")&&(l=e.substring(0,e.indexOf("/")));runtime.setCurrentDirectory(l);g?(runtime.log(g),runtime.exit(1)):null===r?(runtime.log("No code found for "+e),runtime.exit(1)):h.apply(null,c)})}}e=e?Array.prototype.slice.call(e):[];"NodeJSRuntime"===runtime.type()?g(process.argv.slice(2)):"RhinoRuntime"===runtime.type()?g(e):g(e.slice(1))})("undefined"!==
String(typeof arguments)&&arguments);
// Input 2
core.Async=function(){this.forEach=function(e,g,c){function n(e){h!==m&&(e?(h=m,c(e)):(h+=1,h===m&&c(null)))}var q,m=e.length,h=0;for(q=0;q<m;q+=1)g(e[q],n)};this.destroyAll=function(e,g){function c(n,q){if(q)g(q);else if(n<e.length)e[n](function(e){c(n+1,e)});else g()}c(0,void 0)}};
// Input 3
function makeBase64(){function e(a){var b,d=a.length,k=new Uint8Array(new ArrayBuffer(d));for(b=0;b<d;b+=1)k[b]=a.charCodeAt(b)&255;return k}function g(a){var b,d="",k,f=a.length-2;for(k=0;k<f;k+=3)b=a[k]<<16|a[k+1]<<8|a[k+2],d+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[b>>>18],d+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[b>>>12&63],d+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[b>>>6&63],d+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[b&
63];k===f+1?(b=a[k]<<4,d+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[b>>>6],d+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[b&63],d+="=="):k===f&&(b=a[k]<<10|a[k+1]<<2,d+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[b>>>12],d+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[b>>>6&63],d+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[b&63],d+="=");return d}function c(a){a=a.replace(/[^A-Za-z0-9+\/]+/g,
"");var b=a.length,d=new Uint8Array(new ArrayBuffer(3*b)),k=a.length%4,f=0,c,h;for(c=0;c<b;c+=4)h=(p[a.charAt(c)]||0)<<18|(p[a.charAt(c+1)]||0)<<12|(p[a.charAt(c+2)]||0)<<6|(p[a.charAt(c+3)]||0),d[f]=h>>16,d[f+1]=h>>8&255,d[f+2]=h&255,f+=3;b=3*b-[0,0,2,1][k];return d.subarray(0,b)}function n(a){var b,d,k=a.length,f=0,c=new Uint8Array(new ArrayBuffer(3*k));for(b=0;b<k;b+=1)d=a[b],128>d?c[f++]=d:(2048>d?c[f++]=192|d>>>6:(c[f++]=224|d>>>12&15,c[f++]=128|d>>>6&63),c[f++]=128|d&63);return c.subarray(0,
f)}function q(a){var b,d,k,f,c=a.length,p=new Uint8Array(new ArrayBuffer(c)),h=0;for(b=0;b<c;b+=1)d=a[b],128>d?p[h++]=d:(b+=1,k=a[b],224>d?p[h++]=(d&31)<<6|k&63:(b+=1,f=a[b],p[h++]=(d&15)<<12|(k&63)<<6|f&63));return p.subarray(0,h)}function m(a){return g(e(a))}function h(a){return String.fromCharCode.apply(String,c(a))}function l(a){return q(e(a))}function r(a){a=q(a);for(var b="",d=0;d<a.length;)b+=String.fromCharCode.apply(String,a.subarray(d,d+45E3)),d+=45E3;return b}function d(a,b,d){var k,f,
c,p="";for(c=b;c<d;c+=1)b=a.charCodeAt(c)&255,128>b?p+=String.fromCharCode(b):(c+=1,k=a.charCodeAt(c)&255,224>b?p+=String.fromCharCode((b&31)<<6|k&63):(c+=1,f=a.charCodeAt(c)&255,p+=String.fromCharCode((b&15)<<12|(k&63)<<6|f&63)));return p}function f(a,b){function k(){var p=c+1E5;p>a.length&&(p=a.length);f+=d(a,c,p);c=p;p=c===a.length;b(f,p)&&!p&&runtime.setTimeout(k,0)}var f="",c=0;1E5>a.length?b(d(a,0,a.length),!0):("string"!==typeof a&&(a=a.slice()),k())}function a(a){return n(e(a))}function b(a){return String.fromCharCode.apply(String,
n(a))}function k(a){return String.fromCharCode.apply(String,n(e(a)))}var p=function(a){var b={},d,k;d=0;for(k=a.length;d<k;d+=1)b[a.charAt(d)]=d;return b}("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"),t,y,w=runtime.getWindow(),x,v;w&&w.btoa?(x=w.btoa,t=function(a){return x(k(a))}):(x=m,t=function(b){return g(a(b))});w&&w.atob?(v=w.atob,y=function(a){a=v(a);return d(a,0,a.length)}):(v=h,y=function(a){return r(c(a))});core.Base64=function(){this.convertByteArrayToBase64=this.convertUTF8ArrayToBase64=
g;this.convertBase64ToByteArray=this.convertBase64ToUTF8Array=c;this.convertUTF16ArrayToByteArray=this.convertUTF16ArrayToUTF8Array=n;this.convertByteArrayToUTF16Array=this.convertUTF8ArrayToUTF16Array=q;this.convertUTF8StringToBase64=m;this.convertBase64ToUTF8String=h;this.convertUTF8StringToUTF16Array=l;this.convertByteArrayToUTF16String=this.convertUTF8ArrayToUTF16String=r;this.convertUTF8StringToUTF16String=f;this.convertUTF16StringToByteArray=this.convertUTF16StringToUTF8Array=a;this.convertUTF16ArrayToUTF8String=
b;this.convertUTF16StringToUTF8String=k;this.convertUTF16StringToBase64=t;this.convertBase64ToUTF16String=y;this.fromBase64=h;this.toBase64=m;this.atob=v;this.btoa=x;this.utob=k;this.btou=f;this.encode=t;this.encodeURI=function(a){return t(a).replace(/[+\/]/g,function(a){return"+"===a?"-":"_"}).replace(/\\=+$/,"")};this.decode=function(a){return y(a.replace(/[\-_]/g,function(a){return"-"===a?"+":"/"}))};return this};return core.Base64}core.Base64=makeBase64();
// Input 4
core.ByteArray=function(e){this.pos=0;this.data=e;this.readUInt32LE=function(){this.pos+=4;var e=this.data,c=this.pos;return e[--c]<<24|e[--c]<<16|e[--c]<<8|e[--c]};this.readUInt16LE=function(){this.pos+=2;var e=this.data,c=this.pos;return e[--c]<<8|e[--c]}};
// Input 5
core.ByteArrayWriter=function(e){function g(c){c>q-n&&(q=Math.max(2*q,n+c),c=new Uint8Array(new ArrayBuffer(q)),c.set(m),m=c)}var c=this,n=0,q=1024,m=new Uint8Array(new ArrayBuffer(q));this.appendByteArrayWriter=function(h){c.appendByteArray(h.getByteArray())};this.appendByteArray=function(c){var e=c.length;g(e);m.set(c,n);n+=e};this.appendArray=function(c){var e=c.length;g(e);m.set(c,n);n+=e};this.appendUInt16LE=function(h){c.appendArray([h&255,h>>8&255])};this.appendUInt32LE=function(h){c.appendArray([h&
255,h>>8&255,h>>16&255,h>>24&255])};this.appendString=function(h){c.appendByteArray(runtime.byteArrayFromString(h,e))};this.getLength=function(){return n};this.getByteArray=function(){var c=new Uint8Array(new ArrayBuffer(n));c.set(m.subarray(0,n));return c}};
// Input 6
core.CSSUnits=function(){var e=this,g={"in":1,cm:2.54,mm:25.4,pt:72,pc:12};this.convert=function(c,e,q){return c*g[q]/g[e]};this.convertMeasure=function(c,g){var q,m;c&&g?(q=parseFloat(c),m=c.replace(q.toString(),""),q=e.convert(q,m,g).toString()):q="";return q};this.getUnits=function(c){return c.substr(c.length-2,c.length)}};
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
(function(){function e(){var c,e,q,m,h;void 0===g&&(h=(c=runtime.getWindow())&&c.document,g={rangeBCRIgnoresElementBCR:!1,unscaledRangeClientRects:!1},h&&(m=h.createElement("div"),m.style.position="absolute",m.style.left="-99999px",m.style.transform="scale(2)",m.style["-webkit-transform"]="scale(2)",e=h.createElement("div"),m.appendChild(e),h.body.appendChild(m),c=h.createRange(),c.selectNode(e),g.rangeBCRIgnoresElementBCR=0===c.getClientRects().length,e.appendChild(h.createTextNode("Rect transform test")),
e=e.getBoundingClientRect(),q=c.getBoundingClientRect(),g.unscaledRangeClientRects=2<Math.abs(e.height-q.height),c.detach(),h.body.removeChild(m),c=Object.keys(g).map(function(c){return c+":"+String(g[c])}).join(", "),runtime.log("Detected browser quirks - "+c)));return g}var g;core.DomUtils=function(){function c(a,b){for(var d=0,c;a.parentNode!==b;)runtime.assert(null!==a.parentNode,"parent is null"),a=a.parentNode;for(c=b.firstChild;c!==a;)d+=1,c=c.nextSibling;return d}function g(a,b){return 0>=
a.compareBoundaryPoints(Range.START_TO_START,b)&&0<=a.compareBoundaryPoints(Range.END_TO_END,b)}function q(a,b){return 0>=a.compareBoundaryPoints(Range.END_TO_START,b)&&0<=a.compareBoundaryPoints(Range.START_TO_END,b)}function m(a,b){var d=null;a.nodeType===Node.TEXT_NODE&&(0===a.length?(a.parentNode.removeChild(a),b.nodeType===Node.TEXT_NODE&&(d=b)):(b.nodeType===Node.TEXT_NODE&&(a.appendData(b.data),b.parentNode.removeChild(b)),d=a));return d}function h(a){for(var b=a.parentNode;a.firstChild;)b.insertBefore(a.firstChild,
a);b.removeChild(a);return b}function l(a,b){for(var d=a.parentNode,c=a.firstChild,f;c;)f=c.nextSibling,l(c,b),c=f;b(a)&&(d=h(a));return d}function r(a,b){return a===b||Boolean(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_CONTAINED_BY)}function d(a,b,k){Object.keys(b).forEach(function(c){var f=c.split(":"),h=f[1],e=k(f[0]),f=b[c];"object"===typeof f&&Object.keys(f).length?(c=e?a.getElementsByTagNameNS(e,h)[0]||a.ownerDocument.createElementNS(e,c):a.getElementsByTagName(h)[0]||a.ownerDocument.createElement(c),
a.appendChild(c),d(c,f,k)):e&&a.setAttributeNS(e,c,String(f))})}var f=null;this.splitBoundaries=function(a){var b,d=[],f,h,e;if(a.startContainer.nodeType===Node.TEXT_NODE||a.endContainer.nodeType===Node.TEXT_NODE){f=a.endContainer;h=a.endContainer.nodeType!==Node.TEXT_NODE?a.endOffset===a.endContainer.childNodes.length:!1;e=a.endOffset;b=a.endContainer;if(e<b.childNodes.length)for(b=b.childNodes.item(e),e=0;b.firstChild;)b=b.firstChild;else for(;b.lastChild;)b=b.lastChild,e=b.nodeType===Node.TEXT_NODE?
b.textContent.length:b.childNodes.length;b===f&&(f=null);a.setEnd(b,e);e=a.endContainer;0!==a.endOffset&&e.nodeType===Node.TEXT_NODE&&(b=e,a.endOffset!==b.length&&(d.push(b.splitText(a.endOffset)),d.push(b)));e=a.startContainer;0!==a.startOffset&&e.nodeType===Node.TEXT_NODE&&(b=e,a.startOffset!==b.length&&(e=b.splitText(a.startOffset),d.push(b),d.push(e),a.setStart(e,0)));if(null!==f){for(e=a.endContainer;e.parentNode&&e.parentNode!==f;)e=e.parentNode;h=h?f.childNodes.length:c(e,f);a.setEnd(f,h)}}return d};
this.containsRange=g;this.rangesIntersect=q;this.getNodesInRange=function(a,b){for(var d=[],c=a.commonAncestorContainer,f,e=a.startContainer.ownerDocument.createTreeWalker(c.nodeType===Node.TEXT_NODE?c.parentNode:c,NodeFilter.SHOW_ALL,b,!1),c=e.currentNode=a.startContainer;c;){f=b(c);if(f===NodeFilter.FILTER_ACCEPT)d.push(c);else if(f===NodeFilter.FILTER_REJECT)break;c=c.parentNode}d.reverse();for(c=e.nextNode();c;)d.push(c),c=e.nextNode();return d};this.normalizeTextNodes=function(a){a&&a.nextSibling&&
(a=m(a,a.nextSibling));a&&a.previousSibling&&m(a.previousSibling,a)};this.rangeContainsNode=function(a,b){var d=b.ownerDocument.createRange(),c=b.ownerDocument.createRange(),f;d.setStart(a.startContainer,a.startOffset);d.setEnd(a.endContainer,a.endOffset);c.selectNodeContents(b);f=g(d,c);d.detach();c.detach();return f};this.mergeIntoParent=h;this.removeUnwantedNodes=l;this.getElementsByTagNameNS=function(a,b,d){var c=[];a=a.getElementsByTagNameNS(b,d);c.length=d=a.length;for(b=0;b<d;b+=1)c[b]=a.item(b);
return c};this.rangeIntersectsNode=function(a,b){var d=b.ownerDocument.createRange(),c;d.selectNodeContents(b);c=q(a,d);d.detach();return c};this.containsNode=function(a,b){return a===b||a.contains(b)};this.comparePoints=function(a,b,d,f){if(a===d)return f-b;var e=a.compareDocumentPosition(d);2===e?e=-1:4===e?e=1:10===e?(b=c(a,d),e=b<f?1:-1):(f=c(d,a),e=f<b?-1:1);return e};this.adaptRangeDifferenceToZoomLevel=function(a,b){return e().unscaledRangeClientRects?a:a/b};this.getBoundingClientRect=function(a){var b=
a.ownerDocument,d=e();if((!1===d.unscaledRangeClientRects||d.rangeBCRIgnoresElementBCR)&&a.nodeType===Node.ELEMENT_NODE)return a.getBoundingClientRect();var c;f?c=f:f=c=b.createRange();b=c;b.selectNode(a);return b.getBoundingClientRect()};this.mapKeyValObjOntoNode=function(a,b,d){Object.keys(b).forEach(function(c){var f=c.split(":"),e=f[1],f=d(f[0]),h=b[c];f?(e=a.getElementsByTagNameNS(f,e)[0],e||(e=a.ownerDocument.createElementNS(f,c),a.appendChild(e)),e.textContent=h):runtime.log("Key ignored: "+
c)})};this.removeKeyElementsFromNode=function(a,b,d){b.forEach(function(b){var c=b.split(":"),f=c[1];(c=d(c[0]))?(f=a.getElementsByTagNameNS(c,f)[0])?f.parentNode.removeChild(f):runtime.log("Element for "+b+" not found."):runtime.log("Property Name ignored: "+b)})};this.getKeyValRepresentationOfNode=function(a,b){for(var d={},c=a.firstElementChild,f;c;){if(f=b(c.namespaceURI))d[f+":"+c.localName]=c.textContent;c=c.nextElementSibling}return d};this.mapObjOntoNode=d;(function(a){var b,d;d=runtime.getWindow();
null!==d&&(b=d.navigator.appVersion.toLowerCase(),d=-1===b.indexOf("chrome")&&(-1!==b.indexOf("applewebkit")||-1!==b.indexOf("safari")),b=b.indexOf("msie"),d||b)&&(a.containsNode=r)})(this)};return core.DomUtils})();
// Input 8
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
core.EventNotifier=function(e){var g={};this.emit=function(c,e){var q,m;runtime.assert(g.hasOwnProperty(c),'unknown event fired "'+c+'"');m=g[c];for(q=0;q<m.length;q+=1)m[q](e)};this.subscribe=function(c,e){runtime.assert(g.hasOwnProperty(c),'tried to subscribe to unknown event "'+c+'"');g[c].push(e);runtime.log('event "'+c+'" subscribed.')};this.unsubscribe=function(c,e){var q;runtime.assert(g.hasOwnProperty(c),'tried to unsubscribe from unknown event "'+c+'"');q=g[c].indexOf(e);runtime.assert(-1!==
q,'tried to unsubscribe unknown callback from event "'+c+'"');-1!==q&&g[c].splice(q,1);runtime.log('event "'+c+'" unsubscribed.')};(function(){var c,n;for(c=0;c<e.length;c+=1)n=e[c],runtime.assert(!g.hasOwnProperty(n),'Duplicated event ids: "'+n+'" registered more than once.'),g[n]=[]})()};
// Input 9
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
core.LoopWatchDog=function(e,g){var c=Date.now(),n=0;this.check=function(){var q;if(e&&(q=Date.now(),q-c>e))throw runtime.log("alert","watchdog timeout"),"timeout!";if(0<g&&(n+=1,n>g))throw runtime.log("alert","watchdog loop overflow"),"loop overflow";}};
// Input 10
core.PositionIterator=function(e,g,c,n){function q(){this.acceptNode=function(a){return!a||a.nodeType===b&&0===a.length?t:p}}function m(a){this.acceptNode=function(d){return!d||d.nodeType===b&&0===d.length?t:a.acceptNode(d)}}function h(){var a=d.currentNode,c=a.nodeType;f=c===b?a.length-1:c===k?1:0}function l(){if(null===d.previousSibling()){if(!d.parentNode()||d.currentNode===e)return d.firstChild(),!1;f=0}else h();return!0}var r=this,d,f,a,b=Node.TEXT_NODE,k=Node.ELEMENT_NODE,p=NodeFilter.FILTER_ACCEPT,
t=NodeFilter.FILTER_REJECT;this.nextPosition=function(){var a=d.currentNode,c=a.nodeType;if(a===e)return!1;if(0===f&&c===k)null===d.firstChild()&&(f=1);else if(c===b&&f+1<a.length)f+=1;else if(null!==d.nextSibling())f=0;else if(d.parentNode())f=1;else return!1;return!0};this.previousPosition=function(){var a=!0,c=d.currentNode;0===f?a=l():c.nodeType===b?f-=1:null!==d.lastChild()?h():c===e?a=!1:f=0;return a};this.previousNode=l;this.container=function(){var a=d.currentNode,c=a.nodeType;0===f&&c!==
b&&(a=a.parentNode);return a};this.rightNode=function(){var c=d.currentNode,e=c.nodeType;if(e===b&&f===c.length)for(c=c.nextSibling;c&&a(c)!==p;)c=c.nextSibling;else e===k&&1===f&&(c=null);return c};this.leftNode=function(){var b=d.currentNode;if(0===f)for(b=b.previousSibling;b&&a(b)!==p;)b=b.previousSibling;else if(b.nodeType===k)for(b=b.lastChild;b&&a(b)!==p;)b=b.previousSibling;return b};this.getCurrentNode=function(){return d.currentNode};this.unfilteredDomOffset=function(){if(d.currentNode.nodeType===
b)return f;for(var a=0,c=d.currentNode,c=1===f?c.lastChild:c.previousSibling;c;)a+=1,c=c.previousSibling;return a};this.getPreviousSibling=function(){var a=d.currentNode,b=d.previousSibling();d.currentNode=a;return b};this.getNextSibling=function(){var a=d.currentNode,b=d.nextSibling();d.currentNode=a;return b};this.setUnfilteredPosition=function(c,k){var h,l;runtime.assert(null!==c&&void 0!==c,"PositionIterator.setUnfilteredPosition called without container");d.currentNode=c;if(c.nodeType===b)return f=
k,runtime.assert(k<=c.length,"Error in setPosition: "+k+" > "+c.length),runtime.assert(0<=k,"Error in setPosition: "+k+" < 0"),k===c.length&&(d.nextSibling()?f=0:d.parentNode()?f=1:runtime.assert(!1,"Error in setUnfilteredPosition: position not valid.")),!0;h=a(c);for(l=c.parentNode;l&&l!==e&&h===p;)h=a(l),h!==p&&(d.currentNode=l),l=l.parentNode;k<c.childNodes.length&&h!==NodeFilter.FILTER_REJECT?(d.currentNode=c.childNodes.item(k),h=a(d.currentNode),f=0):f=1;h===NodeFilter.FILTER_REJECT&&(f=1);if(h!==
p)return r.nextPosition();runtime.assert(a(d.currentNode)===p,"PositionIterater.setUnfilteredPosition call resulted in an non-visible node being set");return!0};this.moveToEnd=function(){d.currentNode=e;f=1};this.moveToEndOfNode=function(a){a.nodeType===b?r.setUnfilteredPosition(a,a.length):(d.currentNode=a,f=1)};this.getNodeFilter=function(){return a};a=(c?new m(c):new q).acceptNode;a.acceptNode=a;g=g||4294967295;runtime.assert(e.nodeType!==Node.TEXT_NODE,"Internet Explorer doesn't allow tree walker roots to be text nodes");
d=e.ownerDocument.createTreeWalker(e,g,a,n);f=0;null===d.firstChild()&&(f=1)};
// Input 11
core.zip_HuftNode=function(){this.n=this.b=this.e=0;this.t=null};core.zip_HuftList=function(){this.list=this.next=null};
core.RawInflate=function(){function e(a,b,d,c,f,k){this.BMAX=16;this.N_MAX=288;this.status=0;this.root=null;this.m=0;var e=Array(this.BMAX+1),p,h,L,l,s,g,m,q=Array(this.BMAX+1),n,v,r,t=new core.zip_HuftNode,V=Array(this.BMAX);l=Array(this.N_MAX);var u,z=Array(this.BMAX+1),A,P,C;C=this.root=null;for(s=0;s<e.length;s++)e[s]=0;for(s=0;s<q.length;s++)q[s]=0;for(s=0;s<V.length;s++)V[s]=null;for(s=0;s<l.length;s++)l[s]=0;for(s=0;s<z.length;s++)z[s]=0;p=256<b?a[256]:this.BMAX;n=a;v=0;s=b;do e[n[v]]++,v++;
while(0<--s);if(e[0]===b)this.root=null,this.status=this.m=0;else{for(g=1;g<=this.BMAX&&0===e[g];g++);m=g;k<g&&(k=g);for(s=this.BMAX;0!==s&&0===e[s];s--);L=s;k>s&&(k=s);for(A=1<<g;g<s;g++,A<<=1)if(A-=e[g],0>A){this.status=2;this.m=k;return}A-=e[s];if(0>A)this.status=2,this.m=k;else{e[s]+=A;z[1]=g=0;n=e;v=1;for(r=2;0<--s;)g+=n[v++],z[r++]=g;n=a;s=v=0;do g=n[v++],0!==g&&(l[z[g]++]=s);while(++s<b);b=z[L];z[0]=s=0;n=l;v=0;l=-1;u=q[0]=0;r=null;P=0;for(m=m-1+1;m<=L;m++)for(a=e[m];0<a--;){for(;m>u+q[1+l];){u+=
q[1+l];l++;P=L-u;P=P>k?k:P;g=m-u;h=1<<g;if(h>a+1)for(h-=a+1,r=m;++g<P;){h<<=1;if(h<=e[++r])break;h-=e[r]}u+g>p&&u<p&&(g=p-u);P=1<<g;q[1+l]=g;r=Array(P);for(h=0;h<P;h++)r[h]=new core.zip_HuftNode;C=null===C?this.root=new core.zip_HuftList:C.next=new core.zip_HuftList;C.next=null;C.list=r;V[l]=r;0<l&&(z[l]=s,t.b=q[l],t.e=16+g,t.t=r,g=(s&(1<<u)-1)>>u-q[l],V[l-1][g].e=t.e,V[l-1][g].b=t.b,V[l-1][g].n=t.n,V[l-1][g].t=t.t)}t.b=m-u;v>=b?t.e=99:n[v]<d?(t.e=256>n[v]?16:15,t.n=n[v++]):(t.e=f[n[v]-d],t.n=c[n[v++]-
d]);h=1<<m-u;for(g=s>>u;g<P;g+=h)r[g].e=t.e,r[g].b=t.b,r[g].n=t.n,r[g].t=t.t;for(g=1<<m-1;0!==(s&g);g>>=1)s^=g;for(s^=g;(s&(1<<u)-1)!==z[l];)u-=q[l],l--}this.m=q[1];this.status=0!==A&&1!==L?1:0}}}function g(d){for(;b<d;){var c=a,f;f=s.length===H?-1:s[H++];a=c|f<<b;b+=8}}function c(b){return a&z[b]}function n(d){a>>=d;b-=d}function q(a,b,d){var f,e,p;if(0===d)return 0;for(p=0;;){g(v);e=w.list[c(v)];for(f=e.e;16<f;){if(99===f)return-1;n(e.b);f-=16;g(f);e=e.t[c(f)];f=e.e}n(e.b);if(16===f)l&=32767,a[b+
p++]=h[l++]=e.n;else{if(15===f)break;g(f);t=e.n+c(f);n(f);g(u);e=x.list[c(u)];for(f=e.e;16<f;){if(99===f)return-1;n(e.b);f-=16;g(f);e=e.t[c(f)];f=e.e}n(e.b);g(f);y=l-e.n-c(f);for(n(f);0<t&&p<d;)t--,y&=32767,l&=32767,a[b+p++]=h[l++]=h[y++]}if(p===d)return d}k=-1;return p}function m(a,b,d){var f,k,p,h,s,l,m,r=Array(316);for(f=0;f<r.length;f++)r[f]=0;g(5);l=257+c(5);n(5);g(5);m=1+c(5);n(5);g(4);f=4+c(4);n(4);if(286<l||30<m)return-1;for(k=0;k<f;k++)g(3),r[P[k]]=c(3),n(3);for(k=f;19>k;k++)r[P[k]]=0;v=
7;k=new e(r,19,19,null,null,v);if(0!==k.status)return-1;w=k.root;v=k.m;h=l+m;for(f=p=0;f<h;)if(g(v),s=w.list[c(v)],k=s.b,n(k),k=s.n,16>k)r[f++]=p=k;else if(16===k){g(2);k=3+c(2);n(2);if(f+k>h)return-1;for(;0<k--;)r[f++]=p}else{17===k?(g(3),k=3+c(3),n(3)):(g(7),k=11+c(7),n(7));if(f+k>h)return-1;for(;0<k--;)r[f++]=0;p=0}v=9;k=new e(r,l,257,C,I,v);0===v&&(k.status=1);if(0!==k.status)return-1;w=k.root;v=k.m;for(f=0;f<m;f++)r[f]=r[f+l];u=6;k=new e(r,m,0,L,V,u);x=k.root;u=k.m;return 0===u&&257<l||0!==k.status?
-1:q(a,b,d)}var h=[],l,r=null,d,f,a,b,k,p,t,y,w,x,v,u,s,H,z=[0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535],C=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],I=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,99,99],L=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],V=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],P=[16,17,18,0,8,7,9,6,
10,5,11,4,12,3,13,2,14,1,15],A;this.inflate=function(z,P){h.length=65536;b=a=l=0;k=-1;p=!1;t=y=0;w=null;s=z;H=0;var G=new Uint8Array(new ArrayBuffer(P));a:for(var X=0,M;X<P&&(!p||-1!==k);){if(0<t){if(0!==k)for(;0<t&&X<P;)t--,y&=32767,l&=32767,G[0+X]=h[l]=h[y],X+=1,l+=1,y+=1;else{for(;0<t&&X<P;)t-=1,l&=32767,g(8),G[0+X]=h[l]=c(8),X+=1,l+=1,n(8);0===t&&(k=-1)}if(X===P)break}if(-1===k){if(p)break;g(1);0!==c(1)&&(p=!0);n(1);g(2);k=c(2);n(2);w=null;t=0}switch(k){case 0:M=G;var Z=0+X,J=P-X,E=void 0,E=b&
7;n(E);g(16);E=c(16);n(16);g(16);if(E!==(~a&65535))M=-1;else{n(16);t=E;for(E=0;0<t&&E<J;)t--,l&=32767,g(8),M[Z+E++]=h[l++]=c(8),n(8);0===t&&(k=-1);M=E}break;case 1:if(null!==w)M=q(G,0+X,P-X);else b:{M=G;Z=0+X;J=P-X;if(null===r){for(var B=void 0,E=Array(288),B=void 0,B=0;144>B;B++)E[B]=8;for(B=144;256>B;B++)E[B]=9;for(B=256;280>B;B++)E[B]=7;for(B=280;288>B;B++)E[B]=8;f=7;B=new e(E,288,257,C,I,f);if(0!==B.status){alert("HufBuild error: "+B.status);M=-1;break b}r=B.root;f=B.m;for(B=0;30>B;B++)E[B]=5;
A=5;B=new e(E,30,0,L,V,A);if(1<B.status){r=null;alert("HufBuild error: "+B.status);M=-1;break b}d=B.root;A=B.m}w=r;x=d;v=f;u=A;M=q(M,Z,J)}break;case 2:M=null!==w?q(G,0+X,P-X):m(G,0+X,P-X);break;default:M=-1}if(-1===M)break a;X+=M}s=new Uint8Array(new ArrayBuffer(0));return G}};
// Input 12
core.ScheduledTask=function(e,g){function c(){m&&(runtime.clearTimeout(q),m=!1)}function n(){c();e.apply(void 0,h);h=null}var q,m=!1,h=[];this.trigger=function(){h=Array.prototype.slice.call(arguments);m||(m=!0,q=runtime.setTimeout(n,g))};this.triggerImmediate=function(){h=Array.prototype.slice.call(arguments);n()};this.processRequests=function(){m&&n()};this.cancel=c;this.destroy=function(e){c();e()}};
// Input 13
core.UnitTest=function(){};core.UnitTest.prototype.setUp=function(){};core.UnitTest.prototype.tearDown=function(){};core.UnitTest.prototype.description=function(){};core.UnitTest.prototype.tests=function(){};core.UnitTest.prototype.asyncTests=function(){};
core.UnitTest.provideTestAreaDiv=function(){var e=runtime.getWindow().document,g=e.getElementById("testarea");runtime.assert(!g,'Unclean test environment, found a div with id "testarea".');g=e.createElement("div");g.setAttribute("id","testarea");e.body.appendChild(g);return g};
core.UnitTest.cleanupTestAreaDiv=function(){var e=runtime.getWindow().document,g=e.getElementById("testarea");runtime.assert(!!g&&g.parentNode===e.body,'Test environment broken, found no div with id "testarea" below body.');e.body.removeChild(g)};core.UnitTest.createOdtDocument=function(e,g){var c="<?xml version='1.0' encoding='UTF-8'?>",c=c+"<office:document";Object.keys(g).forEach(function(e){c+=" xmlns:"+e+'="'+g[e]+'"'});c+=">";c+=e;c+="</office:document>";return runtime.parseXML(c)};
core.UnitTestRunner=function(){function e(c){h+=1;runtime.log("fail",c)}function g(c,d){var f;try{if(c.length!==d.length)return e("array of length "+c.length+" should be "+d.length+" long"),!1;for(f=0;f<c.length;f+=1)if(c[f]!==d[f])return e(c[f]+" should be "+d[f]+" at array index "+f),!1}catch(a){return!1}return!0}function c(h,d,f){var a=h.attributes,b=a.length,k,p,g;for(k=0;k<b;k+=1)if(p=a.item(k),"xmlns"!==p.prefix&&"urn:webodf:names:steps"!==p.namespaceURI){g=d.getAttributeNS(p.namespaceURI,p.localName);
if(!d.hasAttributeNS(p.namespaceURI,p.localName))return e("Attribute "+p.localName+" with value "+p.value+" was not present"),!1;if(g!==p.value)return e("Attribute "+p.localName+" was "+g+" should be "+p.value),!1}return f?!0:c(d,h,!0)}function n(h,d){var f,a;f=h.nodeType;a=d.nodeType;if(f!==a)return e("Nodetype '"+f+"' should be '"+a+"'"),!1;if(f===Node.TEXT_NODE){if(h.data===d.data)return!0;e("Textnode data '"+h.data+"' should be '"+d.data+"'");return!1}runtime.assert(f===Node.ELEMENT_NODE,"Only textnodes and elements supported.");
if(h.namespaceURI!==d.namespaceURI)return e("namespace '"+h.namespaceURI+"' should be '"+d.namespaceURI+"'"),!1;if(h.localName!==d.localName)return e("localName '"+h.localName+"' should be '"+d.localName+"'"),!1;if(!c(h,d,!1))return!1;f=h.firstChild;for(a=d.firstChild;f;){if(!a)return e("Nodetype '"+f.nodeType+"' is unexpected here."),!1;if(!n(f,a))return!1;f=f.nextSibling;a=a.nextSibling}return a?(e("Nodetype '"+a.nodeType+"' is missing here."),!1):!0}function q(c,d){return 0===d?c===d&&1/c===1/
d:c===d?!0:"number"===typeof d&&isNaN(d)?"number"===typeof c&&isNaN(c):Object.prototype.toString.call(d)===Object.prototype.toString.call([])?g(c,d):"object"===typeof d&&"object"===typeof c?d.constructor===Element||d.constructor===Node?n(c,d):l(c,d):!1}function m(c,d,f){"string"===typeof d&&"string"===typeof f||runtime.log("WARN: shouldBe() expects string arguments");var a,b;try{b=eval(d)}catch(k){a=k}c=eval(f);a?e(d+" should be "+c+". Threw exception "+a):q(b,c)?runtime.log("pass",d+" is "+f):String(typeof b)===
String(typeof c)?(f=0===b&&0>1/b?"-0":String(b),e(d+" should be "+c+". Was "+f+".")):e(d+" should be "+c+" (of type "+typeof c+"). Was "+b+" (of type "+typeof b+").")}var h=0,l;l=function(c,d){var f=Object.keys(c),a=Object.keys(d);f.sort();a.sort();return g(f,a)&&Object.keys(c).every(function(a){var f=c[a],p=d[a];return q(f,p)?!0:(e(f+" should be "+p+" for key "+a),!1)})};this.areNodesEqual=n;this.shouldBeNull=function(c,d){m(c,d,"null")};this.shouldBeNonNull=function(c,d){var f,a;try{a=eval(d)}catch(b){f=
b}f?e(d+" should be non-null. Threw exception "+f):null!==a?runtime.log("pass",d+" is non-null."):e(d+" should be non-null. Was "+a)};this.shouldBe=m;this.countFailedTests=function(){return h};this.name=function(c){var d,f,a=[],b=c.length;a.length=b;for(d=0;d<b;d+=1){f=Runtime.getFunctionName(c[d])||"";if(""===f)throw"Found a function without a name.";a[d]={f:c[d],name:f}}return a}};
core.UnitTester=function(){function e(c,e){return"<span style='color:blue;cursor:pointer' onclick='"+e+"'>"+c+"</span>"}var g=0,c={};this.runTests=function(n,q,m){function h(a){if(0===a.length)c[l]=f,g+=r.countFailedTests(),q();else{b=a[0].f;var k=a[0].name;runtime.log("Running "+k);p=r.countFailedTests();d.setUp();b(function(){d.tearDown();f[k]=p===r.countFailedTests();h(a.slice(1))})}}var l=Runtime.getFunctionName(n)||"",r=new core.UnitTestRunner,d=new n(r),f={},a,b,k,p,t="BrowserRuntime"===runtime.type();
if(c.hasOwnProperty(l))runtime.log("Test "+l+" has already run.");else{t?runtime.log("<span>Running "+e(l,'runSuite("'+l+'");')+": "+d.description()+"</span>"):runtime.log("Running "+l+": "+d.description);k=d.tests();for(a=0;a<k.length;a+=1)b=k[a].f,n=k[a].name,m.length&&-1===m.indexOf(n)||(t?runtime.log("<span>Running "+e(n,'runTest("'+l+'","'+n+'")')+"</span>"):runtime.log("Running "+n),p=r.countFailedTests(),d.setUp(),b(),d.tearDown(),f[n]=p===r.countFailedTests());h(d.asyncTests())}};this.countFailedTests=
function(){return g};this.results=function(){return c}};
// Input 14
core.Utils=function(){function e(g,c){if(c&&Array.isArray(c)){g=g||[];if(!Array.isArray(g))throw"Destination is not an array.";g=g.concat(c.map(function(c){return e(null,c)}))}else if(c&&"object"===typeof c){g=g||{};if("object"!==typeof g)throw"Destination is not an object.";Object.keys(c).forEach(function(n){g[n]=e(g[n],c[n])})}else g=c;return g}this.hashString=function(e){var c=0,n,q;n=0;for(q=e.length;n<q;n+=1)c=(c<<5)-c+e.charCodeAt(n),c|=0;return c};this.mergeObjects=function(g,c){Object.keys(c).forEach(function(n){g[n]=
e(g[n],c[n])});return g}};
// Input 15
/*

 WebODF
 Copyright (c) 2010 Jos van den Oever
 Licensed under the ... License:

 Project home: http://www.webodf.org/
*/
runtime.loadClass("core.RawInflate");runtime.loadClass("core.ByteArray");runtime.loadClass("core.ByteArrayWriter");runtime.loadClass("core.Base64");
core.Zip=function(e,g){function c(a){var b=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,
853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,
4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,
225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,
2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,
2932959818,3654703836,1088359270,936918E3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],d,c,f=a.length,k=0,k=0;d=-1;for(c=0;c<f;c+=1)k=(d^a[c])&255,k=b[k],d=d>>>8^k;return d^-1}function n(a){return new Date((a>>25&127)+1980,(a>>21&15)-1,a>>16&31,a>>11&15,a>>5&63,(a&31)<<1)}function q(a){var b=a.getFullYear();return 1980>b?0:b-1980<<
25|a.getMonth()+1<<21|a.getDate()<<16|a.getHours()<<11|a.getMinutes()<<5|a.getSeconds()>>1}function m(a,b){var d,c,f,k,e,h,g,l=this;this.load=function(b){if(null!==l.data)b(null,l.data);else{var d=e+34+c+f+256;d+g>p&&(d=p-g);runtime.read(a,g,d,function(d,c){if(d||null===c)b(d,c);else a:{var f=c,p=new core.ByteArray(f),g=p.readUInt32LE(),s;if(67324752!==g)b("File entry signature is wrong."+g.toString()+" "+f.length.toString(),null);else{p.pos+=22;g=p.readUInt16LE();s=p.readUInt16LE();p.pos+=g+s;if(k){f=
f.subarray(p.pos,p.pos+e);if(e!==f.length){b("The amount of compressed bytes read was "+f.length.toString()+" instead of "+e.toString()+" for "+l.filename+" in "+a+".",null);break a}f=y(f,h)}else f=f.subarray(p.pos,p.pos+h);h!==f.length?b("The amount of bytes read was "+f.length.toString()+" instead of "+h.toString()+" for "+l.filename+" in "+a+".",null):(l.data=f,b(null,f))}}})}};this.set=function(a,b,d,c){l.filename=a;l.data=b;l.compressed=d;l.date=c};this.error=null;b&&(d=b.readUInt32LE(),33639248!==
d?this.error="Central directory entry has wrong signature at position "+(b.pos-4).toString()+' for file "'+a+'": '+b.data.length.toString():(b.pos+=6,k=b.readUInt16LE(),this.date=n(b.readUInt32LE()),b.readUInt32LE(),e=b.readUInt32LE(),h=b.readUInt32LE(),c=b.readUInt16LE(),f=b.readUInt16LE(),d=b.readUInt16LE(),b.pos+=8,g=b.readUInt32LE(),this.filename=runtime.byteArrayToString(b.data.subarray(b.pos,b.pos+c),"utf8"),this.data=null,b.pos+=c+f+d))}function h(a,b){if(22!==a.length)b("Central directory length should be 22.",
w);else{var d=new core.ByteArray(a),c;c=d.readUInt32LE();101010256!==c?b("Central directory signature is wrong: "+c.toString(),w):(c=d.readUInt16LE(),0!==c?b("Zip files with non-zero disk numbers are not supported.",w):(c=d.readUInt16LE(),0!==c?b("Zip files with non-zero disk numbers are not supported.",w):(c=d.readUInt16LE(),t=d.readUInt16LE(),c!==t?b("Number of entries is inconsistent.",w):(c=d.readUInt32LE(),d=d.readUInt16LE(),d=p-22-c,runtime.read(e,d,p-d,function(a,d){if(a||null===d)b(a,w);else a:{var c=
new core.ByteArray(d),f,p;k=[];for(f=0;f<t;f+=1){p=new m(e,c);if(p.error){b(p.error,w);break a}k[k.length]=p}b(null,w)}})))))}}function l(a,b){var d=null,c,f;for(f=0;f<k.length;f+=1)if(c=k[f],c.filename===a){d=c;break}d?d.data?b(null,d.data):d.load(b):b(a+" not found.",null)}function r(a){var b=new core.ByteArrayWriter("utf8"),d=0;b.appendArray([80,75,3,4,20,0,0,0,0,0]);a.data&&(d=a.data.length);b.appendUInt32LE(q(a.date));b.appendUInt32LE(a.data?c(a.data):0);b.appendUInt32LE(d);b.appendUInt32LE(d);
b.appendUInt16LE(a.filename.length);b.appendUInt16LE(0);b.appendString(a.filename);a.data&&b.appendByteArray(a.data);return b}function d(a,b){var d=new core.ByteArrayWriter("utf8"),f=0;d.appendArray([80,75,1,2,20,0,20,0,0,0,0,0]);a.data&&(f=a.data.length);d.appendUInt32LE(q(a.date));d.appendUInt32LE(a.data?c(a.data):0);d.appendUInt32LE(f);d.appendUInt32LE(f);d.appendUInt16LE(a.filename.length);d.appendArray([0,0,0,0,0,0,0,0,0,0,0,0]);d.appendUInt32LE(b);d.appendString(a.filename);return d}function f(a,
b){if(a===k.length)b(null);else{var d=k[a];null!==d.data?f(a+1,b):d.load(function(d){d?b(d):f(a+1,b)})}}function a(a,b){f(0,function(c){if(c)b(c);else{var f,e,p=new core.ByteArrayWriter("utf8"),h=[0];for(f=0;f<k.length;f+=1)p.appendByteArrayWriter(r(k[f])),h.push(p.getLength());c=p.getLength();for(f=0;f<k.length;f+=1)e=k[f],p.appendByteArrayWriter(d(e,h[f]));f=p.getLength()-c;p.appendArray([80,75,5,6,0,0,0,0]);p.appendUInt16LE(k.length);p.appendUInt16LE(k.length);p.appendUInt32LE(f);p.appendUInt32LE(c);
p.appendArray([0,0]);a(p.getByteArray())}})}function b(b,d){a(function(a){runtime.writeFile(b,a,d)},d)}var k,p,t,y=(new core.RawInflate).inflate,w=this,x=new core.Base64;this.load=l;this.save=function(a,b,d,c){var f,p;for(f=0;f<k.length;f+=1)if(p=k[f],p.filename===a){p.set(a,b,d,c);return}p=new m(e);p.set(a,b,d,c);k.push(p)};this.remove=function(a){var b,d;for(b=0;b<k.length;b+=1)if(d=k[b],d.filename===a)return k.splice(b,1),!0;return!1};this.write=function(a){b(e,a)};this.writeAs=b;this.createByteArray=
a;this.loadContentXmlAsFragments=function(a,b){w.loadAsString(a,function(a,d){if(a)return b.rootElementReady(a);b.rootElementReady(null,d,!0)})};this.loadAsString=function(a,b){l(a,function(a,d){if(a||null===d)return b(a,null);var c=runtime.byteArrayToString(d,"utf8");b(null,c)})};this.loadAsDOM=function(a,b){w.loadAsString(a,function(a,d){if(a||null===d)b(a,null);else{var c=(new DOMParser).parseFromString(d,"text/xml");b(null,c)}})};this.loadAsDataURL=function(a,b,d){l(a,function(a,c){if(a||!c)return d(a,
null);var f=0,k;b||(b=80===c[1]&&78===c[2]&&71===c[3]?"image/png":255===c[0]&&216===c[1]&&255===c[2]?"image/jpeg":71===c[0]&&73===c[1]&&70===c[2]?"image/gif":"");for(k="data:"+b+";base64,";f<c.length;)k+=x.convertUTF8ArrayToBase64(c.subarray(f,Math.min(f+45E3,c.length))),f+=45E3;d(null,k)})};this.getEntries=function(){return k.slice()};p=-1;null===g?k=[]:runtime.getFileSize(e,function(a){p=a;0>p?g("File '"+e+"' cannot be read.",w):runtime.read(e,p-22,22,function(a,b){a||null===g||null===b?g(a,w):
h(b,g)})})};
// Input 16
gui.Avatar=function(e,g){var c=this,n,q,m;this.setColor=function(c){q.style.borderColor=c};this.setImageUrl=function(e){c.isVisible()?q.src=e:m=e};this.isVisible=function(){return"block"===n.style.display};this.show=function(){m&&(q.src=m,m=void 0);n.style.display="block"};this.hide=function(){n.style.display="none"};this.markAsFocussed=function(c){n.className=c?"active":""};this.destroy=function(c){e.removeChild(n);c()};(function(){var c=e.ownerDocument,l=c.documentElement.namespaceURI;n=c.createElementNS(l,
"div");q=c.createElementNS(l,"img");q.width=64;q.height=64;n.appendChild(q);n.style.width="64px";n.style.height="70px";n.style.position="absolute";n.style.top="-80px";n.style.left="-34px";n.style.display=g?"block":"none";e.appendChild(n)})()};
// Input 17
gui.EditInfoHandle=function(e){var g=[],c,n=e.ownerDocument,q=n.documentElement.namespaceURI;this.setEdits=function(e){g=e;var h,l,r,d;c.innerHTML="";for(e=0;e<g.length;e+=1)h=n.createElementNS(q,"div"),h.className="editInfo",l=n.createElementNS(q,"span"),l.className="editInfoColor",l.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",g[e].memberid),r=n.createElementNS(q,"span"),r.className="editInfoAuthor",r.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",g[e].memberid),
d=n.createElementNS(q,"span"),d.className="editInfoTime",d.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",g[e].memberid),d.innerHTML=g[e].time,h.appendChild(l),h.appendChild(r),h.appendChild(d),c.appendChild(h)};this.show=function(){c.style.display="block"};this.hide=function(){c.style.display="none"};this.destroy=function(g){e.removeChild(c);g()};c=n.createElementNS(q,"div");c.setAttribute("class","editInfoHandle");c.style.display="none";e.appendChild(c)};
// Input 18
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
gui.KeyboardHandler=function(){function e(c,e){e||(e=g.None);return c+":"+e}var g=gui.KeyboardHandler.Modifier,c=null,n={};this.setDefault=function(e){c=e};this.bind=function(c,g,h){c=e(c,g);runtime.assert(!1===n.hasOwnProperty(c),"tried to overwrite the callback handler of key combo: "+c);n[c]=h};this.unbind=function(c,g){var h=e(c,g);delete n[h]};this.reset=function(){c=null;n={}};this.handleEvent=function(q){var m=q.keyCode,h=g.None;q.metaKey&&(h|=g.Meta);q.ctrlKey&&(h|=g.Ctrl);q.altKey&&(h|=g.Alt);
q.shiftKey&&(h|=g.Shift);m=e(m,h);m=n[m];h=!1;m?h=m():null!==c&&(h=c(q));h&&(q.preventDefault?q.preventDefault():q.returnValue=!1)}};gui.KeyboardHandler.Modifier={None:0,Meta:1,Ctrl:2,Alt:4,CtrlAlt:6,Shift:8,MetaShift:9,CtrlShift:10,AltShift:12};gui.KeyboardHandler.KeyCode={Backspace:8,Tab:9,Clear:12,Enter:13,End:35,Home:36,Left:37,Up:38,Right:39,Down:40,Delete:46,A:65,B:66,C:67,D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90};(function(){return gui.KeyboardHandler})();
// Input 19
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
(function(){var e=odf.Namespaces.namespaceMap,g=odf.Namespaces.prefixMap,c;for(c in e)e.hasOwnProperty(c)&&(g[e[c]]=c)})();odf.Namespaces.forEachPrefix=function(e){var g=odf.Namespaces.namespaceMap,c;for(c in g)g.hasOwnProperty(c)&&e(c,g[c])};odf.Namespaces.lookupNamespaceURI=function(e){var g=null;odf.Namespaces.namespaceMap.hasOwnProperty(e)&&(g=odf.Namespaces.namespaceMap[e]);return g};odf.Namespaces.lookupPrefix=function(e){var g=odf.Namespaces.prefixMap;return g.hasOwnProperty(e)?g[e]:null};
odf.Namespaces.lookupNamespaceURI.lookupNamespaceURI=odf.Namespaces.lookupNamespaceURI;
// Input 20
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
runtime.loadClass("core.DomUtils");runtime.loadClass("odf.Namespaces");
odf.OdfUtils=function(){function e(a){return"image"===(a&&a.localName)&&a.namespaceURI===z}function g(a){return null!==a&&a.nodeType===Node.ELEMENT_NODE&&"frame"===a.localName&&a.namespaceURI===z&&"as-char"===a.getAttributeNS(H,"anchor-type")}function c(a){var b;(b="annotation"===(a&&a.localName)&&a.namespaceURI===odf.Namespaces.officens)||(b="div"===(a&&a.localName)&&"annotationWrapper"===a.className);return b}function n(a){var b=a&&a.localName;return("p"===b||"h"===b)&&a.namespaceURI===H}function q(a){for(;a&&
!n(a);)a=a.parentNode;return a}function m(a){return/^[ \t\r\n]+$/.test(a)}function h(a){if(null===a||a.nodeType!==Node.ELEMENT_NODE)return!1;var b=a.localName;return/^(span|p|h|a|meta)$/.test(b)&&a.namespaceURI===H||"span"===b&&"annotationHighlight"===a.className}function l(a){var b=a&&a.localName,d=!1;b&&(a=a.namespaceURI,a===H&&(d="s"===b||"tab"===b||"line-break"===b));return d}function r(a){return l(a)||g(a)||c(a)}function d(a){var b=a&&a.localName,d=!1;b&&(a=a.namespaceURI,a===H&&(d="s"===b));
return d}function f(a){for(;null!==a.firstChild&&h(a);)a=a.firstChild;return a}function a(a){for(;null!==a.lastChild&&h(a);)a=a.lastChild;return a}function b(b){for(;!n(b)&&null===b.previousSibling;)b=b.parentNode;return n(b)?null:a(b.previousSibling)}function k(a){for(;!n(a)&&null===a.nextSibling;)a=a.parentNode;return n(a)?null:f(a.nextSibling)}function p(a){for(var c=!1;a;)if(a.nodeType===Node.TEXT_NODE)if(0===a.length)a=b(a);else return!m(a.data.substr(a.length-1,1));else r(a)?(c=!1===d(a),a=
null):a=b(a);return c}function t(a){var b=!1,d;for(a=a&&f(a);a;){d=a.nodeType===Node.TEXT_NODE?a.length:0;if(0<d&&!m(a.data)){b=!0;break}if(r(a)){b=!0;break}a=k(a)}return b}function y(a,b){return m(a.data.substr(b))?!t(k(a)):!1}function w(a,d){var c=a.data,f;if(!m(c[d])||r(a.parentNode))return!1;0<d?m(c[d-1])||(f=!0):p(b(a))&&(f=!0);return!0===f?y(a,d)?!1:!0:!1}function x(a){return(a=/(-?[0-9]*[0-9][0-9]*(\.[0-9]*)?|0+\.[0-9]*[1-9][0-9]*|\.[0-9]*[1-9][0-9]*)((cm)|(mm)|(in)|(pt)|(pc)|(px)|(%))/.exec(a))?
{value:parseFloat(a[1]),unit:a[3]}:null}function v(a){return(a=x(a))&&(0>a.value||"%"===a.unit)?null:a}function u(a){return(a=x(a))&&"%"!==a.unit?null:a}function s(a){switch(a.namespaceURI){case odf.Namespaces.drawns:case odf.Namespaces.svgns:case odf.Namespaces.dr3dns:return!1;case odf.Namespaces.textns:switch(a.localName){case "note-body":case "ruby-text":return!1}break;case odf.Namespaces.officens:switch(a.localName){case "annotation":case "binary-data":case "event-listeners":return!1}break;default:switch(a.localName){case "editinfo":return!1}}return!0}
var H=odf.Namespaces.textns,z=odf.Namespaces.drawns,C=/^\s*$/,I=new core.DomUtils;this.isImage=e;this.isCharacterFrame=g;this.isInlineRoot=c;this.isTextSpan=function(a){return"span"===(a&&a.localName)&&a.namespaceURI===H};this.isParagraph=n;this.getParagraphElement=q;this.isWithinTrackedChanges=function(a,b){for(;a&&a!==b;){if(a.namespaceURI===H&&"tracked-changes"===a.localName)return!0;a=a.parentNode}return!1};this.isListItem=function(a){return"list-item"===(a&&a.localName)&&a.namespaceURI===H};
this.isLineBreak=function(a){return"line-break"===(a&&a.localName)&&a.namespaceURI===H};this.isODFWhitespace=m;this.isGroupingElement=h;this.isCharacterElement=l;this.isAnchoredAsCharacterElement=r;this.isSpaceElement=d;this.firstChild=f;this.lastChild=a;this.previousNode=b;this.nextNode=k;this.scanLeftForNonSpace=p;this.lookLeftForCharacter=function(a){var d,c=d=0;a.nodeType===Node.TEXT_NODE&&(c=a.length);0<c?(d=a.data,d=m(d.substr(c-1,1))?1===c?p(b(a))?2:0:m(d.substr(c-2,1))?0:2:1):r(a)&&(d=1);
return d};this.lookRightForCharacter=function(a){var b=!1,d=0;a&&a.nodeType===Node.TEXT_NODE&&(d=a.length);0<d?b=!m(a.data.substr(0,1)):r(a)&&(b=!0);return b};this.scanLeftForAnyCharacter=function(d){var c=!1,f;for(d=d&&a(d);d;){f=d.nodeType===Node.TEXT_NODE?d.length:0;if(0<f&&!m(d.data)){c=!0;break}if(r(d)){c=!0;break}d=b(d)}return c};this.scanRightForAnyCharacter=t;this.isTrailingWhitespace=y;this.isSignificantWhitespace=w;this.isDowngradableSpaceElement=function(a){return a.namespaceURI===H&&"s"===
a.localName?p(b(a))&&t(k(a)):!1};this.getFirstNonWhitespaceChild=function(a){for(a=a&&a.firstChild;a&&a.nodeType===Node.TEXT_NODE&&C.test(a.nodeValue);)a=a.nextSibling;return a};this.parseLength=x;this.parseNonNegativeLength=v;this.parseFoFontSize=function(a){var b;b=(b=x(a))&&(0>=b.value||"%"===b.unit)?null:b;return b||u(a)};this.parseFoLineHeight=function(a){return v(a)||u(a)};this.getImpactedParagraphs=function(a){var b,d,c;b=a.commonAncestorContainer;var f=[],k=[];for(b.nodeType===Node.ELEMENT_NODE&&
(f=I.getElementsByTagNameNS(b,H,"p").concat(I.getElementsByTagNameNS(b,H,"h")));b&&!n(b);)b=b.parentNode;b&&f.push(b);d=f.length;for(b=0;b<d;b+=1)c=f[b],I.rangeIntersectsNode(a,c)&&k.push(c);return k};this.getTextNodes=function(a,b){var d=a.startContainer.ownerDocument.createRange(),c;c=I.getNodesInRange(a,function(c){d.selectNodeContents(c);if(c.nodeType===Node.TEXT_NODE){if(b&&I.rangesIntersect(a,d)||I.containsRange(a,d))return Boolean(q(c)&&(!m(c.textContent)||w(c,0)))?NodeFilter.FILTER_ACCEPT:
NodeFilter.FILTER_REJECT}else if(I.rangesIntersect(a,d)&&s(c))return NodeFilter.FILTER_SKIP;return NodeFilter.FILTER_REJECT});d.detach();return c};this.getTextElements=function(a,b,d){var f=a.startContainer.ownerDocument.createRange(),k;k=I.getNodesInRange(a,function(k){f.selectNodeContents(k);if(l(k.parentNode)||c(k.parentNode))return NodeFilter.FILTER_REJECT;if(k.nodeType===Node.TEXT_NODE){if(b&&I.rangesIntersect(a,f)||I.containsRange(a,f))if(d||Boolean(q(k)&&(!m(k.textContent)||w(k,0))))return NodeFilter.FILTER_ACCEPT}else if(r(k)){if(b&&
I.rangesIntersect(a,f)||I.containsRange(a,f))return NodeFilter.FILTER_ACCEPT}else if(s(k)||h(k))return NodeFilter.FILTER_SKIP;return NodeFilter.FILTER_REJECT});f.detach();return k};this.getParagraphElements=function(a){var b=a.startContainer.ownerDocument.createRange(),d;d=I.getNodesInRange(a,function(d){b.selectNodeContents(d);if(n(d)){if(I.rangesIntersect(a,b))return NodeFilter.FILTER_ACCEPT}else if(s(d)||h(d))return NodeFilter.FILTER_SKIP;return NodeFilter.FILTER_REJECT});b.detach();return d};
this.getImageElements=function(a){var b=a.startContainer.ownerDocument.createRange(),d;d=I.getNodesInRange(a,function(d){b.selectNodeContents(d);return e(d)&&I.containsRange(a,b)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP});b.detach();return d}};
// Input 21
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
ops.Server=function(){};ops.Server.prototype.connect=function(e,g){};ops.Server.prototype.networkStatus=function(){};ops.Server.prototype.login=function(e,g,c,n){};ops.Server.prototype.joinSession=function(e,g,c,n){};ops.Server.prototype.leaveSession=function(e,g,c,n){};ops.Server.prototype.getGenesisUrl=function(e){};
// Input 22
xmldom.LSSerializerFilter=function(){};xmldom.LSSerializerFilter.prototype.acceptNode=function(e){};
// Input 23
xmldom.XPathIterator=function(){};xmldom.XPathIterator.prototype.next=function(){};xmldom.XPathIterator.prototype.reset=function(){};
function createXPathSingleton(){function e(d,a,b){return-1!==d&&(d<a||-1===a)&&(d<b||-1===b)}function g(c){for(var a=[],b=0,k=c.length,p;b<k;){var h=c,g=k,l=a,m="",n=[],q=h.indexOf("[",b),s=h.indexOf("/",b),r=h.indexOf("=",b);e(s,q,r)?(m=h.substring(b,s),b=s+1):e(q,s,r)?(m=h.substring(b,q),b=d(h,q,n)):e(r,s,q)?(m=h.substring(b,r),b=r):(m=h.substring(b,g),b=g);l.push({location:m,predicates:n});if(b<k&&"="===c[b]){p=c.substring(b+1,k);if(2<p.length&&("'"===p[0]||'"'===p[0]))p=p.slice(1,p.length-1);
else try{p=parseInt(p,10)}catch(z){}b=k}}return{steps:a,value:p}}function c(){var d=null,a=!1;this.setNode=function(a){d=a};this.reset=function(){a=!1};this.next=function(){var b=a?null:d;a=!0;return b}}function n(d,a,b){this.reset=function(){d.reset()};this.next=function(){for(var c=d.next();c;){c.nodeType===Node.ELEMENT_NODE&&(c=c.getAttributeNodeNS(a,b));if(c)break;c=d.next()}return c}}function q(d,a){var b=d.next(),c=null;this.reset=function(){d.reset();b=d.next();c=null};this.next=function(){for(;b;){if(c)if(a&&
c.firstChild)c=c.firstChild;else{for(;!c.nextSibling&&c!==b;)c=c.parentNode;c===b?b=d.next():c=c.nextSibling}else{do(c=b.firstChild)||(b=d.next());while(b&&!c)}if(c&&c.nodeType===Node.ELEMENT_NODE)return c}return null}}function m(d,a){this.reset=function(){d.reset()};this.next=function(){for(var b=d.next();b&&!a(b);)b=d.next();return b}}function h(d,a,b){a=a.split(":",2);var c=b(a[0]),e=a[1];return new m(d,function(a){return a.localName===e&&a.namespaceURI===c})}function l(d,a,b){var k=new c,e=r(k,
a,b),h=a.value;return void 0===h?new m(d,function(a){k.setNode(a);e.reset();return null!==e.next()}):new m(d,function(a){k.setNode(a);e.reset();return(a=e.next())?a.nodeValue===h:!1})}var r,d;d=function(d,a,b){for(var c=a,e=d.length,h=0;c<e;)"]"===d[c]?(h-=1,0>=h&&b.push(g(d.substring(a,c)))):"["===d[c]&&(0>=h&&(a=c+1),h+=1),c+=1;return c};r=function(d,a,b){var c,e,g,m;for(c=0;c<a.steps.length;c+=1){g=a.steps[c];e=g.location;if(""===e)d=new q(d,!1);else if("@"===e[0]){e=e.substr(1).split(":",2);m=
b(e[0]);if(!m)throw"No namespace associated with the prefix "+e[0];d=new n(d,m,e[1])}else"."!==e&&(d=new q(d,!1),-1!==e.indexOf(":")&&(d=h(d,e,b)));for(e=0;e<g.predicates.length;e+=1)m=g.predicates[e],d=l(d,m,b)}return d};return{getODFElementsWithXPath:function(d,a,b){var k=d.ownerDocument,e=[],h=null;if(k&&"function"===typeof k.evaluate)for(b=k.evaluate(a,d,b,XPathResult.UNORDERED_NODE_ITERATOR_TYPE,null),h=b.iterateNext();null!==h;)h.nodeType===Node.ELEMENT_NODE&&e.push(h),h=b.iterateNext();else{e=
new c;e.setNode(d);d=g(a);e=r(e,d,b);d=[];for(b=e.next();b;)d.push(b),b=e.next();e=d}return e}}}xmldom.XPath=createXPathSingleton();
// Input 24
runtime.loadClass("core.DomUtils");
core.Cursor=function(e,g){function c(a){a.parentNode&&(l.push(a.previousSibling),l.push(a.nextSibling),a.parentNode.removeChild(a))}function n(a,b,d){if(b.nodeType===Node.TEXT_NODE){runtime.assert(Boolean(b),"putCursorIntoTextNode: invalid container");var c=b.parentNode;runtime.assert(Boolean(c),"putCursorIntoTextNode: container without parent");runtime.assert(0<=d&&d<=b.length,"putCursorIntoTextNode: offset is out of bounds");0===d?c.insertBefore(a,b):(d!==b.length&&b.splitText(d),c.insertBefore(a,
b.nextSibling))}else b.nodeType===Node.ELEMENT_NODE&&b.insertBefore(a,b.childNodes.item(d));l.push(a.previousSibling);l.push(a.nextSibling)}var q=e.createElementNS("urn:webodf:names:cursor","cursor"),m=e.createElementNS("urn:webodf:names:cursor","anchor"),h,l=[],r=e.createRange(),d,f=new core.DomUtils;this.getNode=function(){return q};this.getAnchorNode=function(){return m.parentNode?m:q};this.getSelectedRange=function(){d?(r.setStartBefore(q),r.collapse(!0)):(r.setStartAfter(h?m:q),r.setEndBefore(h?
q:m));return r};this.setSelectedRange=function(a,b){r&&r!==a&&r.detach();r=a;h=!1!==b;(d=a.collapsed)?(c(m),c(q),n(q,a.startContainer,a.startOffset)):(c(m),c(q),n(h?q:m,a.endContainer,a.endOffset),n(h?m:q,a.startContainer,a.startOffset));l.forEach(f.normalizeTextNodes);l.length=0};this.hasForwardSelection=function(){return h};this.remove=function(){c(q);l.forEach(f.normalizeTextNodes);l.length=0};q.setAttributeNS("urn:webodf:names:cursor","memberId",g);m.setAttributeNS("urn:webodf:names:cursor","memberId",
g)};
// Input 25
runtime.loadClass("core.PositionIterator");core.PositionFilter=function(){};core.PositionFilter.FilterResult={FILTER_ACCEPT:1,FILTER_REJECT:2,FILTER_SKIP:3};core.PositionFilter.prototype.acceptPosition=function(e){};(function(){return core.PositionFilter})();
// Input 26
runtime.loadClass("core.PositionFilter");core.PositionFilterChain=function(){var e={},g=core.PositionFilter.FilterResult.FILTER_ACCEPT,c=core.PositionFilter.FilterResult.FILTER_REJECT;this.acceptPosition=function(n){for(var q in e)if(e.hasOwnProperty(q)&&e[q].acceptPosition(n)===c)return c;return g};this.addFilter=function(c,g){e[c]=g};this.removeFilter=function(c){delete e[c]}};
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
gui.AnnotationViewManager=function(e,g,c,n){function q(a){var c=a.node,e=a.end;a=d.createRange();e&&(a.setStart(c,c.childNodes.length),a.setEnd(e,0),e=f.getTextNodes(a,!1),e.forEach(function(a){var b=d.createElement("span"),f=c.getAttributeNS(odf.Namespaces.officens,"name");b.className="annotationHighlight";b.setAttribute("annotation",f);a.parentNode.insertBefore(b,a);b.appendChild(a)}));a.detach()}function m(b){var d=e.getSizer();b?(c.style.display="inline-block",d.style.paddingRight=a.getComputedStyle(c).width):
(c.style.display="none",d.style.paddingRight=0);e.refreshSize()}function h(){r.sort(function(a,d){return a.node.compareDocumentPosition(d.node)===Node.DOCUMENT_POSITION_FOLLOWING?-1:1})}function l(){var a;for(a=0;a<r.length;a+=1){var d=r[a],f=d.node.parentNode,h=f.nextElementSibling,g=h.nextElementSibling,l=f.parentNode,m=0,m=r[r.indexOf(d)-1],q=void 0,d=e.getZoomLevel();f.style.left=(c.getBoundingClientRect().left-l.getBoundingClientRect().left)/d+"px";f.style.width=c.getBoundingClientRect().width/
d+"px";h.style.width=parseFloat(f.style.left)-30+"px";m&&(q=m.node.parentNode.getBoundingClientRect(),20>=(l.getBoundingClientRect().top-q.bottom)/d?f.style.top=Math.abs(l.getBoundingClientRect().top-q.bottom)/d+20+"px":f.style.top="0px");g.style.left=h.getBoundingClientRect().width/d+"px";var h=g.style,l=g.getBoundingClientRect().left/d,m=g.getBoundingClientRect().top/d,q=f.getBoundingClientRect().left/d,n=f.getBoundingClientRect().top/d,s=0,H=0,s=q-l,s=s*s,H=n-m,H=H*H,l=Math.sqrt(s+H);h.width=l+
"px";m=Math.asin((f.getBoundingClientRect().top-g.getBoundingClientRect().top)/(d*parseFloat(g.style.width)));g.style.transform="rotate("+m+"rad)";g.style.MozTransform="rotate("+m+"rad)";g.style.WebkitTransform="rotate("+m+"rad)";g.style.msTransform="rotate("+m+"rad)"}}var r=[],d=g.ownerDocument,f=new odf.OdfUtils,a=runtime.getWindow();runtime.assert(Boolean(a),"Expected to be run in an environment which has a global window, like a browser.");this.rerenderAnnotations=l;this.getMinimumHeightForAnnotationPane=
function(){return"none"!==c.style.display&&0<r.length?(r[r.length-1].node.parentNode.getBoundingClientRect().bottom-c.getBoundingClientRect().top)/e.getZoomLevel()+"px":null};this.addAnnotation=function(a){m(!0);r.push({node:a.node,end:a.end});h();var c=d.createElement("div"),f=d.createElement("div"),e=d.createElement("div"),g=d.createElement("div"),w;w=a.node;c.className="annotationWrapper";w.parentNode.insertBefore(c,w);f.className="annotationNote";f.appendChild(w);n&&(w=d.createElement("div"),
w.className="annotationRemoveButton",f.appendChild(w));e.className="annotationConnector horizontal";g.className="annotationConnector angular";c.appendChild(f);c.appendChild(e);c.appendChild(g);a.end&&q(a);l()};this.forgetAnnotations=function(){for(;r.length;){var a=r[0],c=r.indexOf(a),f=a.node,e=f.parentNode.parentNode;"div"===e.localName&&(e.parentNode.insertBefore(f,e),e.parentNode.removeChild(e));a=a.node.getAttributeNS(odf.Namespaces.officens,"name");a=d.querySelectorAll('span.annotationHighlight[annotation="'+
a+'"]');e=f=void 0;for(f=0;f<a.length;f+=1){for(e=a.item(f);e.firstChild;)e.parentNode.insertBefore(e.firstChild,e);e.parentNode.removeChild(e)}-1!==c&&r.splice(c,1);0===r.length&&m(!1)}}};
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
runtime.loadClass("core.Cursor");runtime.loadClass("core.DomUtils");runtime.loadClass("core.PositionIterator");runtime.loadClass("core.PositionFilter");runtime.loadClass("core.LoopWatchDog");runtime.loadClass("odf.OdfUtils");
gui.SelectionMover=function(e,g){function c(){w.setUnfilteredPosition(e.getNode(),0);return w}function n(a,b){var d,c=null;a&&0<a.length&&(d=b?a.item(a.length-1):a.item(0));d&&(c={top:d.top,left:b?d.right:d.left,bottom:d.bottom});return c}function q(a,b,d,c){var f=a.nodeType;d.setStart(a,b);d.collapse(!c);c=n(d.getClientRects(),!0===c);!c&&0<b&&(d.setStart(a,b-1),d.setEnd(a,b),c=n(d.getClientRects(),!0));c||(f===Node.ELEMENT_NODE&&0<b&&a.childNodes.length>=b?c=q(a,b-1,d,!0):a.nodeType===Node.TEXT_NODE&&
0<b?c=q(a,b-1,d,!0):a.previousSibling?c=q(a.previousSibling,a.previousSibling.nodeType===Node.TEXT_NODE?a.previousSibling.textContent.length:a.previousSibling.childNodes.length,d,!0):a.parentNode&&a.parentNode!==g?c=q(a.parentNode,0,d,!1):(d.selectNode(g),c=n(d.getClientRects(),!1)));runtime.assert(Boolean(c),"No visible rectangle found");return c}function m(a,b,d){var f=a,k=c(),h,p=g.ownerDocument.createRange(),l=e.getSelectedRange().cloneRange(),m;for(h=q(k.container(),k.unfilteredDomOffset(),p);0<
f&&d();)f-=1;b?(b=k.container(),k=k.unfilteredDomOffset(),-1===y.comparePoints(l.startContainer,l.startOffset,b,k)?(l.setStart(b,k),m=!1):l.setEnd(b,k)):(l.setStart(k.container(),k.unfilteredDomOffset()),l.collapse(!0));e.setSelectedRange(l,m);k=c();l=q(k.container(),k.unfilteredDomOffset(),p);if(l.top===h.top||void 0===x)x=l.left;runtime.clearTimeout(v);v=runtime.setTimeout(function(){x=void 0},2E3);p.detach();return a-f}function h(a){var b=c();return a.acceptPosition(b)===u&&(b.setUnfilteredPosition(e.getAnchorNode(),
0),a.acceptPosition(b)===u)?!0:!1}function l(a,b,d){for(var c=new core.LoopWatchDog(1E4),f=0,e=0,k=0<=b?1:-1,h=0<=b?a.nextPosition:a.previousPosition;0!==b&&h();)c.check(),e+=k,d.acceptPosition(a)===u&&(b-=k,f+=e,e=0);return f}function r(a,b,d){for(var f=c(),e=new core.LoopWatchDog(1E4),k=0,h=0;0<a&&f.nextPosition();)e.check(),d.acceptPosition(f)===u&&(k+=1,b.acceptPosition(f)===u&&(h+=k,k=0,a-=1));return h}function d(a,b,d){for(var f=c(),e=new core.LoopWatchDog(1E4),k=0,h=0;0<a&&f.previousPosition();)e.check(),
d.acceptPosition(f)===u&&(k+=1,b.acceptPosition(f)===u&&(h+=k,k=0,a-=1));return h}function f(a,b){var d=c();return l(d,a,b)}function a(a,b,d){var f=c(),e=t.getParagraphElement(f.getCurrentNode()),k=0;f.setUnfilteredPosition(a,b);d.acceptPosition(f)!==u&&(k=l(f,-1,d),0===k||e&&e!==t.getParagraphElement(f.getCurrentNode()))&&(f.setUnfilteredPosition(a,b),k=l(f,1,d));return k}function b(a,b){var d=c(),f=0,e=0,k=0>a?-1:1;for(a=Math.abs(a);0<a;){for(var h=b,p=k,l=d,m=l.container(),n=0,r=null,v=void 0,
t=10,w=void 0,y=0,E=void 0,B=void 0,Y=void 0,w=void 0,U=g.ownerDocument.createRange(),Q=new core.LoopWatchDog(1E4),w=q(m,l.unfilteredDomOffset(),U),E=w.top,B=void 0===x?w.left:x,Y=E;!0===(0>p?l.previousPosition():l.nextPosition());)if(Q.check(),h.acceptPosition(l)===u&&(n+=1,m=l.container(),w=q(m,l.unfilteredDomOffset(),U),w.top!==E)){if(w.top!==Y&&Y!==E)break;Y=w.top;w=Math.abs(B-w.left);if(null===r||w<t)r=m,v=l.unfilteredDomOffset(),t=w,y=n}null!==r?(l.setUnfilteredPosition(r,v),n=y):n=0;U.detach();
f+=n;if(0===f)break;e+=f;a-=1}return e*k}function k(a,b){var d,f,e,k,h=c(),p=t.getParagraphElement(h.getCurrentNode()),l=0,m=g.ownerDocument.createRange();0>a?(d=h.previousPosition,f=-1):(d=h.nextPosition,f=1);for(e=q(h.container(),h.unfilteredDomOffset(),m);d.call(h);)if(b.acceptPosition(h)===u){if(t.getParagraphElement(h.getCurrentNode())!==p)break;k=q(h.container(),h.unfilteredDomOffset(),m);if(k.bottom!==e.bottom&&(e=k.top>=e.top&&k.bottom<e.bottom||k.top<=e.top&&k.bottom>e.bottom,!e))break;l+=
f;e=k}m.detach();return l}function p(a,b,d){runtime.assert(null!==a,"SelectionMover.countStepsToPosition called with element===null");var f=c(),e=f.container(),k=f.unfilteredDomOffset(),h=0,p=new core.LoopWatchDog(1E4);for(f.setUnfilteredPosition(a,b);d.acceptPosition(f)!==u&&f.previousPosition();)p.check();a=f.container();runtime.assert(Boolean(a),"SelectionMover.countStepsToPosition: positionIterator.container() returned null");b=f.unfilteredDomOffset();for(f.setUnfilteredPosition(e,k);d.acceptPosition(f)!==
u&&f.previousPosition();)p.check();e=y.comparePoints(a,b,f.container(),f.unfilteredDomOffset());if(0>e)for(;f.nextPosition()&&(p.check(),d.acceptPosition(f)===u&&(h+=1),f.container()!==a||f.unfilteredDomOffset()!==b););else if(0<e)for(;f.previousPosition()&&(p.check(),d.acceptPosition(f)!==u||(h-=1,f.container()!==a||f.unfilteredDomOffset()!==b)););return h}var t=new odf.OdfUtils,y=new core.DomUtils,w,x,v,u=core.PositionFilter.FilterResult.FILTER_ACCEPT;this.movePointForward=function(a,b){return m(a,
b||!1,w.nextPosition)};this.movePointBackward=function(a,b){return m(a,b||!1,w.previousPosition)};this.getStepCounter=function(){return{countSteps:f,convertForwardStepsBetweenFilters:r,convertBackwardStepsBetweenFilters:d,countLinesSteps:b,countStepsToLineBoundary:k,countStepsToPosition:p,isPositionWalkable:h,countPositionsToNearestStep:a}};(function(){w=gui.SelectionMover.createPositionIterator(g);var a=g.ownerDocument.createRange();a.setStart(w.container(),w.unfilteredDomOffset());a.collapse(!0);
e.setSelectedRange(a)})()};gui.SelectionMover.createPositionIterator=function(e){var g=new function(){this.acceptNode=function(c){return c&&"urn:webodf:names:cursor"!==c.namespaceURI&&"urn:webodf:names:editinfo"!==c.namespaceURI?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}};return new core.PositionIterator(e,5,g,!1)};(function(){return gui.SelectionMover})();
// Input 29
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
odf.OdfNodeFilter=function(){this.acceptNode=function(e){return"http://www.w3.org/1999/xhtml"===e.namespaceURI?NodeFilter.FILTER_SKIP:e.namespaceURI&&e.namespaceURI.match(/^urn:webodf:/)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}};
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
runtime.loadClass("odf.Namespaces");runtime.loadClass("odf.OdfUtils");runtime.loadClass("xmldom.XPath");runtime.loadClass("core.CSSUnits");odf.StyleTreeNode=function(e){this.derivedStyles={};this.element=e};
odf.Style2CSS=function(){function e(a){var b,d,c,f={};if(!a)return f;for(a=a.firstElementChild;a;){if(d=a.namespaceURI!==p||"style"!==a.localName&&"default-style"!==a.localName?a.namespaceURI===w&&"list-style"===a.localName?"list":a.namespaceURI!==p||"page-layout"!==a.localName&&"default-page-layout"!==a.localName?void 0:"page":a.getAttributeNS(p,"family"))(b=a.getAttributeNS(p,"name"))||(b=""),f.hasOwnProperty(d)?c=f[d]:f[d]=c={},c[b]=a;a=a.nextElementSibling}return f}function g(a,b){if(a.hasOwnProperty(b))return a[b];
var d,c=null;for(d in a)if(a.hasOwnProperty(d)&&(c=g(a[d].derivedStyles,b)))break;return c}function c(a,b,d){var f,e,k;if(!b.hasOwnProperty(a))return null;f=new odf.StyleTreeNode(b[a]);e=f.element.getAttributeNS(p,"parent-style-name");k=null;e&&(k=g(d,e)||c(e,b,d));k?k.derivedStyles[a]=f:d[a]=f;delete b[a];return f}function n(a,b){for(var d in a)a.hasOwnProperty(d)&&c(d,a,b)}function q(a,b,d){var c=[];d=d.derivedStyles;var f;var e=u[a],k;void 0===e?b=null:(k=b?"["+e+'|style-name="'+b+'"]':"","presentation"===
e&&(e="draw",k=b?'[presentation|style-name="'+b+'"]':""),b=e+"|"+s[a].join(k+","+e+"|")+k);null!==b&&c.push(b);for(f in d)d.hasOwnProperty(f)&&(b=q(a,f,d[f]),c=c.concat(b));return c}function m(a,b,d){for(a=a&&a.firstElementChild;a&&(a.namespaceURI!==b||a.localName!==d);)a=a.nextElementSibling;return a}function h(a,b){var d="",c,f,e;for(c=0;c<b.length;c+=1)if(f=b[c],e=a.getAttributeNS(f[0],f[1])){e=e.trim();if(G.hasOwnProperty(f[1])){var k=e.indexOf(" "),h=void 0,p=void 0;-1!==k?(h=e.substring(0,k),
p=e.substring(k)):(h=e,p="");(h=M.parseLength(h))&&"pt"===h.unit&&0.75>h.value&&(e="0.75pt"+p)}f[2]&&(d+=f[2]+":"+e+";")}return d}function l(a){return(a=m(a,p,"text-properties"))?M.parseFoFontSize(a.getAttributeNS(b,"font-size")):null}function r(a,b,d,c){return b+b+d+d+c+c}function d(a,d,c,f){d='text|list[text|style-name="'+d+'"]';var e=c.getAttributeNS(w,"level");c=m(c,p,"list-level-properties");c=m(c,p,"list-level-label-alignment");var k,h;c&&(k=c.getAttributeNS(b,"text-indent"),h=c.getAttributeNS(b,
"margin-left"));k||(k="-0.6cm");c="-"===k.charAt(0)?k.substring(1):"-"+k;for(e=e&&parseInt(e,10);1<e;)d+=" > text|list-item > text|list",e-=1;if(h){e=d+" > text|list-item > *:not(text|list):first-child";e+="{";e=e+("margin-left:"+h+";")+"}";try{a.insertRule(e,a.cssRules.length)}catch(g){runtime.log("cannot load rule: "+e)}}f=d+" > text|list-item > *:not(text|list):first-child:before{"+f+";";f=f+"counter-increment:list;"+("margin-left:"+k+";");f+="width:"+c+";";f+="display:inline-block}";try{a.insertRule(f,
a.cssRules.length)}catch(l){runtime.log("cannot load rule: "+f)}}function f(c,e,g,n){if("list"===e)for(var s=n.element.firstChild,t,u;s;){if(s.namespaceURI===w)if(t=s,"list-level-style-number"===s.localName){var G=t;u=G.getAttributeNS(p,"num-format");var R=G.getAttributeNS(p,"num-suffix")||"",G=G.getAttributeNS(p,"num-prefix")||"",$={1:"decimal",a:"lower-latin",A:"upper-latin",i:"lower-roman",I:"upper-roman"},W="";G&&(W+=' "'+G+'"');W=$.hasOwnProperty(u)?W+(" counter(list, "+$[u]+")"):u?W+(' "'+u+
'"'):W+" ''";u="content:"+W+' "'+R+'"';d(c,g,t,u)}else"list-level-style-image"===s.localName?(u="content: none;",d(c,g,t,u)):"list-level-style-bullet"===s.localName&&(u="content: '"+t.getAttributeNS(w,"bullet-char")+"';",d(c,g,t,u));s=s.nextSibling}else if("page"===e){if(u=n.element,G=R=g="",s=m(u,p,"page-layout-properties"))if(t=u.getAttributeNS(p,"name"),g+=h(s,ka),(R=m(s,p,"background-image"))&&(G=R.getAttributeNS(x,"href"))&&(g=g+("background-image: url('odfkit:"+G+"');")+h(R,z)),"presentation"===
Z)for(u=(u=m(u.parentNode.parentNode,k,"master-styles"))&&u.firstElementChild;u;){if(u.namespaceURI===p&&"master-page"===u.localName&&u.getAttributeNS(p,"page-layout-name")===t){G=u.getAttributeNS(p,"name");R="draw|page[draw|master-page-name="+G+"] {"+g+"}";G="office|body, draw|page[draw|master-page-name="+G+"] {"+h(s,ua)+" }";try{c.insertRule(R,c.cssRules.length),c.insertRule(G,c.cssRules.length)}catch(ia){throw ia;}}u=u.nextElementSibling}else if("text"===Z){R="office|text {"+g+"}";G="office|body {width: "+
s.getAttributeNS(b,"page-width")+";}";try{c.insertRule(R,c.cssRules.length),c.insertRule(G,c.cssRules.length)}catch(da){throw da;}}}else{g=q(e,g,n).join(",");s="";if(t=m(n.element,p,"text-properties")){G=t;u=W="";R=1;t=""+h(G,H);$=G.getAttributeNS(p,"text-underline-style");"solid"===$&&(W+=" underline");$=G.getAttributeNS(p,"text-line-through-style");"solid"===$&&(W+=" line-through");W.length&&(t+="text-decoration:"+W+";");if(W=G.getAttributeNS(p,"font-name")||G.getAttributeNS(b,"font-family"))$=
X[W],t+="font-family: "+($||W)+";";$=G.parentNode;if(G=l($)){for(;$;){if(G=l($)){if("%"!==G.unit){u="font-size: "+G.value*R+G.unit+";";break}R*=G.value/100}G=$;W=$="";$=null;"default-style"===G.localName?$=null:($=G.getAttributeNS(p,"parent-style-name"),W=G.getAttributeNS(p,"family"),$=B.getODFElementsWithXPath(J,$?"//style:*[@style:name='"+$+"'][@style:family='"+W+"']":"//style:default-style[@style:family='"+W+"']",odf.Namespaces.lookupNamespaceURI)[0])}u||(u="font-size: "+parseFloat(E)*R+Y.getUnits(E)+
";");t+=u}s+=t}if(t=m(n.element,p,"paragraph-properties"))u=t,t=""+h(u,C),(R=m(u,p,"background-image"))&&(G=R.getAttributeNS(x,"href"))&&(t=t+("background-image: url('odfkit:"+G+"');")+h(R,z)),(u=u.getAttributeNS(b,"line-height"))&&"normal"!==u&&(u=M.parseFoLineHeight(u),t="%"!==u.unit?t+("line-height: "+u.value+u.unit+";"):t+("line-height: "+u.value/100+";")),s+=t;if(t=m(n.element,p,"graphic-properties"))G=t,t=""+h(G,I),u=G.getAttributeNS(a,"opacity"),R=G.getAttributeNS(a,"fill"),G=G.getAttributeNS(a,
"fill-color"),"solid"===R||"hatch"===R?G&&"none"!==G?(u=isNaN(parseFloat(u))?1:parseFloat(u)/100,R=G.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,r),(G=(R=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(R))?{r:parseInt(R[1],16),g:parseInt(R[2],16),b:parseInt(R[3],16)}:null)&&(t+="background-color: rgba("+G.r+","+G.g+","+G.b+","+u+");")):t+="background: none;":"none"===R&&(t+="background: none;"),s+=t;if(t=m(n.element,p,"drawing-page-properties"))u=""+h(t,I),"true"===t.getAttributeNS(v,"background-visible")&&
(u+="background: none;"),s+=u;if(t=m(n.element,p,"table-cell-properties"))t=""+h(t,L),s+=t;if(t=m(n.element,p,"table-row-properties"))t=""+h(t,P),s+=t;if(t=m(n.element,p,"table-column-properties"))t=""+h(t,V),s+=t;if(t=m(n.element,p,"table-properties"))u=t,t=""+h(u,A),u=u.getAttributeNS(y,"border-model"),"collapsing"===u?t+="border-collapse:collapse;":"separating"===u&&(t+="border-collapse:separate;"),s+=t;if(0!==s.length)try{c.insertRule(g+"{"+s+"}",c.cssRules.length)}catch(aa){throw aa;}}for(var ja in n.derivedStyles)n.derivedStyles.hasOwnProperty(ja)&&
f(c,e,ja,n.derivedStyles[ja])}var a=odf.Namespaces.drawns,b=odf.Namespaces.fons,k=odf.Namespaces.officens,p=odf.Namespaces.stylens,t=odf.Namespaces.svgns,y=odf.Namespaces.tablens,w=odf.Namespaces.textns,x=odf.Namespaces.xlinkns,v=odf.Namespaces.presentationns,u={graphic:"draw","drawing-page":"draw",paragraph:"text",presentation:"presentation",ruby:"text",section:"text",table:"table","table-cell":"table","table-column":"table","table-row":"table",text:"text",list:"text",page:"office"},s={graphic:"circle connected control custom-shape ellipse frame g line measure page page-thumbnail path polygon polyline rect regular-polygon".split(" "),
paragraph:"alphabetical-index-entry-template h illustration-index-entry-template index-source-style object-index-entry-template p table-index-entry-template table-of-content-entry-template user-index-entry-template".split(" "),presentation:"caption circle connector control custom-shape ellipse frame g line measure page-thumbnail path polygon polyline rect regular-polygon".split(" "),"drawing-page":"caption circle connector control page custom-shape ellipse frame g line measure page-thumbnail path polygon polyline rect regular-polygon".split(" "),
ruby:["ruby","ruby-text"],section:"alphabetical-index bibliography illustration-index index-title object-index section table-of-content table-index user-index".split(" "),table:["background","table"],"table-cell":"body covered-table-cell even-columns even-rows first-column first-row last-column last-row odd-columns odd-rows table-cell".split(" "),"table-column":["table-column"],"table-row":["table-row"],text:"a index-entry-chapter index-entry-link-end index-entry-link-start index-entry-page-number index-entry-span index-entry-tab-stop index-entry-text index-title-template linenumbering-configuration list-level-style-number list-level-style-bullet outline-level-style span".split(" "),
list:["list-item"]},H=[[b,"color","color"],[b,"background-color","background-color"],[b,"font-weight","font-weight"],[b,"font-style","font-style"]],z=[[p,"repeat","background-repeat"]],C=[[b,"background-color","background-color"],[b,"text-align","text-align"],[b,"text-indent","text-indent"],[b,"padding","padding"],[b,"padding-left","padding-left"],[b,"padding-right","padding-right"],[b,"padding-top","padding-top"],[b,"padding-bottom","padding-bottom"],[b,"border-left","border-left"],[b,"border-right",
"border-right"],[b,"border-top","border-top"],[b,"border-bottom","border-bottom"],[b,"margin","margin"],[b,"margin-left","margin-left"],[b,"margin-right","margin-right"],[b,"margin-top","margin-top"],[b,"margin-bottom","margin-bottom"],[b,"border","border"]],I=[[b,"background-color","background-color"],[b,"min-height","min-height"],[a,"stroke","border"],[t,"stroke-color","border-color"],[t,"stroke-width","border-width"],[b,"border","border"],[b,"border-left","border-left"],[b,"border-right","border-right"],
[b,"border-top","border-top"],[b,"border-bottom","border-bottom"]],L=[[b,"background-color","background-color"],[b,"border-left","border-left"],[b,"border-right","border-right"],[b,"border-top","border-top"],[b,"border-bottom","border-bottom"],[b,"border","border"]],V=[[p,"column-width","width"]],P=[[p,"row-height","height"],[b,"keep-together",null]],A=[[p,"width","width"],[b,"margin-left","margin-left"],[b,"margin-right","margin-right"],[b,"margin-top","margin-top"],[b,"margin-bottom","margin-bottom"]],
ka=[[b,"background-color","background-color"],[b,"padding","padding"],[b,"padding-left","padding-left"],[b,"padding-right","padding-right"],[b,"padding-top","padding-top"],[b,"padding-bottom","padding-bottom"],[b,"border","border"],[b,"border-left","border-left"],[b,"border-right","border-right"],[b,"border-top","border-top"],[b,"border-bottom","border-bottom"],[b,"margin","margin"],[b,"margin-left","margin-left"],[b,"margin-right","margin-right"],[b,"margin-top","margin-top"],[b,"margin-bottom",
"margin-bottom"]],ua=[[b,"page-width","width"],[b,"page-height","height"]],G={border:!0,"border-left":!0,"border-right":!0,"border-top":!0,"border-bottom":!0,"stroke-width":!0},X={},M=new odf.OdfUtils,Z,J,E,B=xmldom.XPath,Y=new core.CSSUnits;this.style2css=function(a,b,d,c,k){for(var h,p,g,l;b.cssRules.length;)b.deleteRule(b.cssRules.length-1);h=null;c&&(h=c.ownerDocument,J=c.parentNode);k&&(h=k.ownerDocument,J=k.parentNode);if(h)for(l in odf.Namespaces.forEachPrefix(function(a,d){p="@namespace "+
a+" url("+d+");";try{b.insertRule(p,b.cssRules.length)}catch(c){}}),X=d,Z=a,E=runtime.getWindow().getComputedStyle(document.body,null).getPropertyValue("font-size")||"12pt",a=e(c),c=e(k),k={},u)if(u.hasOwnProperty(l))for(g in d=k[l]={},n(a[l],d),n(c[l],d),d)d.hasOwnProperty(g)&&f(b,l,g,d[g])}};
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
runtime.loadClass("xmldom.XPath");runtime.loadClass("odf.Namespaces");
odf.StyleInfo=function(){function e(a,b){var d,c,f,k,h,p=0;if(d=C[a.localName])if(f=d[a.namespaceURI])p=f.length;for(d=0;d<p;d+=1)c=f[d],k=c.ns,h=c.localname,(c=a.getAttributeNS(k,h))&&a.setAttributeNS(k,H[k]+h,b+c);for(f=a.firstElementChild;f;)e(f,b),f=f.nextElementSibling}function g(a,b){var d,c,f,e,k,h=0;if(d=C[a.localName])if(f=d[a.namespaceURI])h=f.length;for(d=0;d<h;d+=1)if(c=f[d],e=c.ns,k=c.localname,c=a.getAttributeNS(e,k))c=c.replace(b,""),a.setAttributeNS(e,H[e]+k,c);for(f=a.firstElementChild;f;)g(f,
b),f=f.nextElementSibling}function c(a,b){var d,c,f,e,k,h=0;if(d=C[a.localName])if(f=d[a.namespaceURI])h=f.length;for(d=0;d<h;d+=1)if(e=f[d],c=e.ns,k=e.localname,c=a.getAttributeNS(c,k))b=b||{},e=e.keyname,b.hasOwnProperty(e)?b[e][c]=1:(k={},k[c]=1,b[e]=k);return b}function n(a,b){var d,f;c(a,b);for(d=a.firstChild;d;)d.nodeType===Node.ELEMENT_NODE&&(f=d,n(f,b)),d=d.nextSibling}function q(a,b,d){this.key=a;this.name=b;this.family=d;this.requires={}}function m(a,b,d){var c=a+'"'+b,f=d[c];f||(f=d[c]=
new q(c,a,b));return f}function h(a,b,d){var c,f,e,k,p,g=0;c=a.getAttributeNS(v,"name");k=a.getAttributeNS(v,"family");c&&k&&(b=m(c,k,d));if(b){if(c=C[a.localName])if(e=c[a.namespaceURI])g=e.length;for(c=0;c<g;c+=1)if(k=e[c],f=k.ns,p=k.localname,f=a.getAttributeNS(f,p))k=k.keyname,k=m(f,k,d),b.requires[k.key]=k}for(a=a.firstElementChild;a;)h(a,b,d),a=a.nextElementSibling;return d}function l(a,b){var d=b[a.family];d||(d=b[a.family]={});d[a.name]=1;Object.keys(a.requires).forEach(function(d){l(a.requires[d],
b)})}function r(a,b){var d=h(a,null,{});Object.keys(d).forEach(function(a){a=d[a];var c=b[a.family];c&&c.hasOwnProperty(a.name)&&l(a,b)})}function d(a,b){function c(b){(b=k.getAttributeNS(v,b))&&(a[b]=!0)}var f=["font-name","font-name-asian","font-name-complex"],e,k;for(e=b&&b.firstElementChild;e;)k=e,f.forEach(c),d(a,k),e=e.nextElementSibling}function f(a,b){function d(a){var c=k.getAttributeNS(v,a);c&&b.hasOwnProperty(c)&&k.setAttributeNS(v,"style:"+a,b[c])}var c=["font-name","font-name-asian",
"font-name-complex"],e,k;for(e=a&&a.firstElementChild;e;)k=e,c.forEach(d),f(k,b),e=e.nextElementSibling}var a=odf.Namespaces.chartns,b=odf.Namespaces.dbns,k=odf.Namespaces.dr3dns,p=odf.Namespaces.drawns,t=odf.Namespaces.formns,y=odf.Namespaces.numberns,w=odf.Namespaces.officens,x=odf.Namespaces.presentationns,v=odf.Namespaces.stylens,u=odf.Namespaces.tablens,s=odf.Namespaces.textns,H={"urn:oasis:names:tc:opendocument:xmlns:chart:1.0":"chart:","urn:oasis:names:tc:opendocument:xmlns:database:1.0":"db:",
"urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0":"dr3d:","urn:oasis:names:tc:opendocument:xmlns:drawing:1.0":"draw:","urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0":"fo:","urn:oasis:names:tc:opendocument:xmlns:form:1.0":"form:","urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0":"number:","urn:oasis:names:tc:opendocument:xmlns:office:1.0":"office:","urn:oasis:names:tc:opendocument:xmlns:presentation:1.0":"presentation:","urn:oasis:names:tc:opendocument:xmlns:style:1.0":"style:","urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0":"svg:",
"urn:oasis:names:tc:opendocument:xmlns:table:1.0":"table:","urn:oasis:names:tc:opendocument:xmlns:text:1.0":"chart:","http://www.w3.org/XML/1998/namespace":"xml:"},z={text:[{ens:v,en:"tab-stop",ans:v,a:"leader-text-style"},{ens:v,en:"drop-cap",ans:v,a:"style-name"},{ens:s,en:"notes-configuration",ans:s,a:"citation-body-style-name"},{ens:s,en:"notes-configuration",ans:s,a:"citation-style-name"},{ens:s,en:"a",ans:s,a:"style-name"},{ens:s,en:"alphabetical-index",ans:s,a:"style-name"},{ens:s,en:"linenumbering-configuration",
ans:s,a:"style-name"},{ens:s,en:"list-level-style-number",ans:s,a:"style-name"},{ens:s,en:"ruby-text",ans:s,a:"style-name"},{ens:s,en:"span",ans:s,a:"style-name"},{ens:s,en:"a",ans:s,a:"visited-style-name"},{ens:v,en:"text-properties",ans:v,a:"text-line-through-text-style"},{ens:s,en:"alphabetical-index-source",ans:s,a:"main-entry-style-name"},{ens:s,en:"index-entry-bibliography",ans:s,a:"style-name"},{ens:s,en:"index-entry-chapter",ans:s,a:"style-name"},{ens:s,en:"index-entry-link-end",ans:s,a:"style-name"},
{ens:s,en:"index-entry-link-start",ans:s,a:"style-name"},{ens:s,en:"index-entry-page-number",ans:s,a:"style-name"},{ens:s,en:"index-entry-span",ans:s,a:"style-name"},{ens:s,en:"index-entry-tab-stop",ans:s,a:"style-name"},{ens:s,en:"index-entry-text",ans:s,a:"style-name"},{ens:s,en:"index-title-template",ans:s,a:"style-name"},{ens:s,en:"list-level-style-bullet",ans:s,a:"style-name"},{ens:s,en:"outline-level-style",ans:s,a:"style-name"}],paragraph:[{ens:p,en:"caption",ans:p,a:"text-style-name"},{ens:p,
en:"circle",ans:p,a:"text-style-name"},{ens:p,en:"connector",ans:p,a:"text-style-name"},{ens:p,en:"control",ans:p,a:"text-style-name"},{ens:p,en:"custom-shape",ans:p,a:"text-style-name"},{ens:p,en:"ellipse",ans:p,a:"text-style-name"},{ens:p,en:"frame",ans:p,a:"text-style-name"},{ens:p,en:"line",ans:p,a:"text-style-name"},{ens:p,en:"measure",ans:p,a:"text-style-name"},{ens:p,en:"path",ans:p,a:"text-style-name"},{ens:p,en:"polygon",ans:p,a:"text-style-name"},{ens:p,en:"polyline",ans:p,a:"text-style-name"},
{ens:p,en:"rect",ans:p,a:"text-style-name"},{ens:p,en:"regular-polygon",ans:p,a:"text-style-name"},{ens:w,en:"annotation",ans:p,a:"text-style-name"},{ens:t,en:"column",ans:t,a:"text-style-name"},{ens:v,en:"style",ans:v,a:"next-style-name"},{ens:u,en:"body",ans:u,a:"paragraph-style-name"},{ens:u,en:"even-columns",ans:u,a:"paragraph-style-name"},{ens:u,en:"even-rows",ans:u,a:"paragraph-style-name"},{ens:u,en:"first-column",ans:u,a:"paragraph-style-name"},{ens:u,en:"first-row",ans:u,a:"paragraph-style-name"},
{ens:u,en:"last-column",ans:u,a:"paragraph-style-name"},{ens:u,en:"last-row",ans:u,a:"paragraph-style-name"},{ens:u,en:"odd-columns",ans:u,a:"paragraph-style-name"},{ens:u,en:"odd-rows",ans:u,a:"paragraph-style-name"},{ens:s,en:"notes-configuration",ans:s,a:"default-style-name"},{ens:s,en:"alphabetical-index-entry-template",ans:s,a:"style-name"},{ens:s,en:"bibliography-entry-template",ans:s,a:"style-name"},{ens:s,en:"h",ans:s,a:"style-name"},{ens:s,en:"illustration-index-entry-template",ans:s,a:"style-name"},
{ens:s,en:"index-source-style",ans:s,a:"style-name"},{ens:s,en:"object-index-entry-template",ans:s,a:"style-name"},{ens:s,en:"p",ans:s,a:"style-name"},{ens:s,en:"table-index-entry-template",ans:s,a:"style-name"},{ens:s,en:"table-of-content-entry-template",ans:s,a:"style-name"},{ens:s,en:"table-index-entry-template",ans:s,a:"style-name"},{ens:s,en:"user-index-entry-template",ans:s,a:"style-name"},{ens:v,en:"page-layout-properties",ans:v,a:"register-truth-ref-style-name"}],chart:[{ens:a,en:"axis",ans:a,
a:"style-name"},{ens:a,en:"chart",ans:a,a:"style-name"},{ens:a,en:"data-label",ans:a,a:"style-name"},{ens:a,en:"data-point",ans:a,a:"style-name"},{ens:a,en:"equation",ans:a,a:"style-name"},{ens:a,en:"error-indicator",ans:a,a:"style-name"},{ens:a,en:"floor",ans:a,a:"style-name"},{ens:a,en:"footer",ans:a,a:"style-name"},{ens:a,en:"grid",ans:a,a:"style-name"},{ens:a,en:"legend",ans:a,a:"style-name"},{ens:a,en:"mean-value",ans:a,a:"style-name"},{ens:a,en:"plot-area",ans:a,a:"style-name"},{ens:a,en:"regression-curve",
ans:a,a:"style-name"},{ens:a,en:"series",ans:a,a:"style-name"},{ens:a,en:"stock-gain-marker",ans:a,a:"style-name"},{ens:a,en:"stock-loss-marker",ans:a,a:"style-name"},{ens:a,en:"stock-range-line",ans:a,a:"style-name"},{ens:a,en:"subtitle",ans:a,a:"style-name"},{ens:a,en:"title",ans:a,a:"style-name"},{ens:a,en:"wall",ans:a,a:"style-name"}],section:[{ens:s,en:"alphabetical-index",ans:s,a:"style-name"},{ens:s,en:"bibliography",ans:s,a:"style-name"},{ens:s,en:"illustration-index",ans:s,a:"style-name"},
{ens:s,en:"index-title",ans:s,a:"style-name"},{ens:s,en:"object-index",ans:s,a:"style-name"},{ens:s,en:"section",ans:s,a:"style-name"},{ens:s,en:"table-of-content",ans:s,a:"style-name"},{ens:s,en:"table-index",ans:s,a:"style-name"},{ens:s,en:"user-index",ans:s,a:"style-name"}],ruby:[{ens:s,en:"ruby",ans:s,a:"style-name"}],table:[{ens:b,en:"query",ans:b,a:"style-name"},{ens:b,en:"table-representation",ans:b,a:"style-name"},{ens:u,en:"background",ans:u,a:"style-name"},{ens:u,en:"table",ans:u,a:"style-name"}],
"table-column":[{ens:b,en:"column",ans:b,a:"style-name"},{ens:u,en:"table-column",ans:u,a:"style-name"}],"table-row":[{ens:b,en:"query",ans:b,a:"default-row-style-name"},{ens:b,en:"table-representation",ans:b,a:"default-row-style-name"},{ens:u,en:"table-row",ans:u,a:"style-name"}],"table-cell":[{ens:b,en:"column",ans:b,a:"default-cell-style-name"},{ens:u,en:"table-column",ans:u,a:"default-cell-style-name"},{ens:u,en:"table-row",ans:u,a:"default-cell-style-name"},{ens:u,en:"body",ans:u,a:"style-name"},
{ens:u,en:"covered-table-cell",ans:u,a:"style-name"},{ens:u,en:"even-columns",ans:u,a:"style-name"},{ens:u,en:"covered-table-cell",ans:u,a:"style-name"},{ens:u,en:"even-columns",ans:u,a:"style-name"},{ens:u,en:"even-rows",ans:u,a:"style-name"},{ens:u,en:"first-column",ans:u,a:"style-name"},{ens:u,en:"first-row",ans:u,a:"style-name"},{ens:u,en:"last-column",ans:u,a:"style-name"},{ens:u,en:"last-row",ans:u,a:"style-name"},{ens:u,en:"odd-columns",ans:u,a:"style-name"},{ens:u,en:"odd-rows",ans:u,a:"style-name"},
{ens:u,en:"table-cell",ans:u,a:"style-name"}],graphic:[{ens:k,en:"cube",ans:p,a:"style-name"},{ens:k,en:"extrude",ans:p,a:"style-name"},{ens:k,en:"rotate",ans:p,a:"style-name"},{ens:k,en:"scene",ans:p,a:"style-name"},{ens:k,en:"sphere",ans:p,a:"style-name"},{ens:p,en:"caption",ans:p,a:"style-name"},{ens:p,en:"circle",ans:p,a:"style-name"},{ens:p,en:"connector",ans:p,a:"style-name"},{ens:p,en:"control",ans:p,a:"style-name"},{ens:p,en:"custom-shape",ans:p,a:"style-name"},{ens:p,en:"ellipse",ans:p,a:"style-name"},
{ens:p,en:"frame",ans:p,a:"style-name"},{ens:p,en:"g",ans:p,a:"style-name"},{ens:p,en:"line",ans:p,a:"style-name"},{ens:p,en:"measure",ans:p,a:"style-name"},{ens:p,en:"page-thumbnail",ans:p,a:"style-name"},{ens:p,en:"path",ans:p,a:"style-name"},{ens:p,en:"polygon",ans:p,a:"style-name"},{ens:p,en:"polyline",ans:p,a:"style-name"},{ens:p,en:"rect",ans:p,a:"style-name"},{ens:p,en:"regular-polygon",ans:p,a:"style-name"},{ens:w,en:"annotation",ans:p,a:"style-name"}],presentation:[{ens:k,en:"cube",ans:x,
a:"style-name"},{ens:k,en:"extrude",ans:x,a:"style-name"},{ens:k,en:"rotate",ans:x,a:"style-name"},{ens:k,en:"scene",ans:x,a:"style-name"},{ens:k,en:"sphere",ans:x,a:"style-name"},{ens:p,en:"caption",ans:x,a:"style-name"},{ens:p,en:"circle",ans:x,a:"style-name"},{ens:p,en:"connector",ans:x,a:"style-name"},{ens:p,en:"control",ans:x,a:"style-name"},{ens:p,en:"custom-shape",ans:x,a:"style-name"},{ens:p,en:"ellipse",ans:x,a:"style-name"},{ens:p,en:"frame",ans:x,a:"style-name"},{ens:p,en:"g",ans:x,a:"style-name"},
{ens:p,en:"line",ans:x,a:"style-name"},{ens:p,en:"measure",ans:x,a:"style-name"},{ens:p,en:"page-thumbnail",ans:x,a:"style-name"},{ens:p,en:"path",ans:x,a:"style-name"},{ens:p,en:"polygon",ans:x,a:"style-name"},{ens:p,en:"polyline",ans:x,a:"style-name"},{ens:p,en:"rect",ans:x,a:"style-name"},{ens:p,en:"regular-polygon",ans:x,a:"style-name"},{ens:w,en:"annotation",ans:x,a:"style-name"}],"drawing-page":[{ens:p,en:"page",ans:p,a:"style-name"},{ens:x,en:"notes",ans:p,a:"style-name"},{ens:v,en:"handout-master",
ans:p,a:"style-name"},{ens:v,en:"master-page",ans:p,a:"style-name"}],"list-style":[{ens:s,en:"list",ans:s,a:"style-name"},{ens:s,en:"numbered-paragraph",ans:s,a:"style-name"},{ens:s,en:"list-item",ans:s,a:"style-override"},{ens:v,en:"style",ans:v,a:"list-style-name"}],data:[{ens:v,en:"style",ans:v,a:"data-style-name"},{ens:v,en:"style",ans:v,a:"percentage-data-style-name"},{ens:x,en:"date-time-decl",ans:v,a:"data-style-name"},{ens:s,en:"creation-date",ans:v,a:"data-style-name"},{ens:s,en:"creation-time",
ans:v,a:"data-style-name"},{ens:s,en:"database-display",ans:v,a:"data-style-name"},{ens:s,en:"date",ans:v,a:"data-style-name"},{ens:s,en:"editing-duration",ans:v,a:"data-style-name"},{ens:s,en:"expression",ans:v,a:"data-style-name"},{ens:s,en:"meta-field",ans:v,a:"data-style-name"},{ens:s,en:"modification-date",ans:v,a:"data-style-name"},{ens:s,en:"modification-time",ans:v,a:"data-style-name"},{ens:s,en:"print-date",ans:v,a:"data-style-name"},{ens:s,en:"print-time",ans:v,a:"data-style-name"},{ens:s,
en:"table-formula",ans:v,a:"data-style-name"},{ens:s,en:"time",ans:v,a:"data-style-name"},{ens:s,en:"user-defined",ans:v,a:"data-style-name"},{ens:s,en:"user-field-get",ans:v,a:"data-style-name"},{ens:s,en:"user-field-input",ans:v,a:"data-style-name"},{ens:s,en:"variable-get",ans:v,a:"data-style-name"},{ens:s,en:"variable-input",ans:v,a:"data-style-name"},{ens:s,en:"variable-set",ans:v,a:"data-style-name"}],"page-layout":[{ens:x,en:"notes",ans:v,a:"page-layout-name"},{ens:v,en:"handout-master",ans:v,
a:"page-layout-name"},{ens:v,en:"master-page",ans:v,a:"page-layout-name"}]},C,I=xmldom.XPath;this.collectUsedFontFaces=d;this.changeFontFaceNames=f;this.UsedStyleList=function(a,b){var d={};this.uses=function(a){var b=a.localName,c=a.getAttributeNS(p,"name")||a.getAttributeNS(v,"name");a="style"===b?a.getAttributeNS(v,"family"):a.namespaceURI===y?"data":b;return(a=d[a])?0<a[c]:!1};n(a,d);b&&r(b,d)};this.hasDerivedStyles=function(a,b,d){var c=d.getAttributeNS(v,"name");d=d.getAttributeNS(v,"family");
return I.getODFElementsWithXPath(a,"//style:*[@style:parent-style-name='"+c+"'][@style:family='"+d+"']",b).length?!0:!1};this.prefixStyleNames=function(a,b,d){var c;if(a){for(c=a.firstChild;c;){if(c.nodeType===Node.ELEMENT_NODE){var f=c,k=b,h=f.getAttributeNS(p,"name"),g=void 0;h?g=p:(h=f.getAttributeNS(v,"name"))&&(g=v);g&&f.setAttributeNS(g,H[g]+"name",k+h)}c=c.nextSibling}e(a,b);d&&e(d,b)}};this.removePrefixFromStyleNames=function(a,b,d){var c=RegExp("^"+b);if(a){for(b=a.firstChild;b;){if(b.nodeType===
Node.ELEMENT_NODE){var f=b,e=c,k=f.getAttributeNS(p,"name"),h=void 0;k?h=p:(k=f.getAttributeNS(v,"name"))&&(h=v);h&&(k=k.replace(e,""),f.setAttributeNS(h,H[h]+"name",k))}b=b.nextSibling}g(a,c);d&&g(d,c)}};this.determineStylesForNode=c;C=function(){var a,b,d,c,f,e={},k,h,p,g;for(d in z)if(z.hasOwnProperty(d))for(c=z[d],b=c.length,a=0;a<b;a+=1)f=c[a],p=f.en,g=f.ens,e.hasOwnProperty(p)?k=e[p]:e[p]=k={},k.hasOwnProperty(g)?h=k[g]:k[g]=h=[],h.push({ns:f.ans,localname:f.a,keyname:d});return e}()};
// Input 32
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
runtime.loadClass("odf.OdfUtils");
odf.TextSerializer=function(){function e(n){var q="",m=g.filter?g.filter.acceptNode(n):NodeFilter.FILTER_ACCEPT,h=n.nodeType,l;if(m===NodeFilter.FILTER_ACCEPT||m===NodeFilter.FILTER_SKIP)for(l=n.firstChild;l;)q+=e(l),l=l.nextSibling;m===NodeFilter.FILTER_ACCEPT&&(h===Node.ELEMENT_NODE&&c.isParagraph(n)?q+="\n":h===Node.TEXT_NODE&&n.textContent&&(q+=n.textContent));return q}var g=this,c=new odf.OdfUtils;this.filter=null;this.writeToString=function(c){if(!c)return"";c=e(c);"\n"===c[c.length-1]&&(c=
c.substr(0,c.length-1));return c}};
// Input 33
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
runtime.loadClass("core.PositionFilter");runtime.loadClass("odf.OdfUtils");
ops.TextPositionFilter=function(e){function g(e,g,d){var f,a;if(g){if(c.isInlineRoot(g)&&c.isGroupingElement(d))return h;f=c.lookLeftForCharacter(g);if(1===f||2===f&&(c.scanRightForAnyCharacter(d)||c.scanRightForAnyCharacter(c.nextNode(e))))return m}f=null===g&&c.isParagraph(e);a=c.lookRightForCharacter(d);if(f)return a?m:c.scanRightForAnyCharacter(d)?h:m;if(!a)return h;g=g||c.previousNode(e);return c.scanLeftForAnyCharacter(g)?h:m}var c=new odf.OdfUtils,n=Node.ELEMENT_NODE,q=Node.TEXT_NODE,m=core.PositionFilter.FilterResult.FILTER_ACCEPT,
h=core.PositionFilter.FilterResult.FILTER_REJECT;this.acceptPosition=function(l){var r=l.container(),d=r.nodeType,f,a,b;if(d!==n&&d!==q)return h;if(d===q){if(!c.isGroupingElement(r.parentNode)||c.isWithinTrackedChanges(r.parentNode,e()))return h;d=l.unfilteredDomOffset();f=r.data;runtime.assert(d!==f.length,"Unexpected offset.");if(0<d){l=f[d-1];if(!c.isODFWhitespace(l))return m;if(1<d)if(l=f[d-2],!c.isODFWhitespace(l))a=m;else{if(!c.isODFWhitespace(f.substr(0,d)))return h}else b=c.previousNode(r),
c.scanLeftForNonSpace(b)&&(a=m);if(a===m)return c.isTrailingWhitespace(r,d)?h:m;a=f[d];return c.isODFWhitespace(a)?h:c.scanLeftForAnyCharacter(c.previousNode(r))?h:m}b=l.leftNode();a=r;r=r.parentNode;a=g(r,b,a)}else!c.isGroupingElement(r)||c.isWithinTrackedChanges(r,e())?a=h:(b=l.leftNode(),a=l.rightNode(),a=g(r,b,a));return a}};
// Input 34
"function"!==typeof Object.create&&(Object.create=function(e){var g=function(){};g.prototype=e;return new g});
xmldom.LSSerializer=function(){function e(c){var e=c||{},h=function(d){var a={},b;for(b in d)d.hasOwnProperty(b)&&(a[d[b]]=b);return a}(c),g=[e],n=[h],d=0;this.push=function(){d+=1;e=g[d]=Object.create(e);h=n[d]=Object.create(h)};this.pop=function(){g.pop();n.pop();d-=1;e=g[d];h=n[d]};this.getLocalNamespaceDefinitions=function(){return h};this.getQName=function(d){var a=d.namespaceURI,b=0,c;if(!a)return d.localName;if(c=h[a])return c+":"+d.localName;do{c||!d.prefix?(c="ns"+b,b+=1):c=d.prefix;if(e[c]===
a)break;if(!e[c]){e[c]=a;h[a]=c;break}c=null}while(null===c);return c+":"+d.localName}}function g(c){return c.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&apos;").replace(/"/g,"&quot;")}function c(e,m){var h="",l=n.filter?n.filter.acceptNode(m):NodeFilter.FILTER_ACCEPT,r;if(l===NodeFilter.FILTER_ACCEPT&&m.nodeType===Node.ELEMENT_NODE){e.push();r=e.getQName(m);var d,f=m.attributes,a,b,k,p="",t;d="<"+r;a=f.length;for(b=0;b<a;b+=1)k=f.item(b),"http://www.w3.org/2000/xmlns/"!==
k.namespaceURI&&(t=n.filter?n.filter.acceptNode(k):NodeFilter.FILTER_ACCEPT,t===NodeFilter.FILTER_ACCEPT&&(t=e.getQName(k),k="string"===typeof k.value?g(k.value):k.value,p+=" "+(t+'="'+k+'"')));a=e.getLocalNamespaceDefinitions();for(b in a)a.hasOwnProperty(b)&&((f=a[b])?"xmlns"!==f&&(d+=" xmlns:"+a[b]+'="'+b+'"'):d+=' xmlns="'+b+'"');h+=d+(p+">")}if(l===NodeFilter.FILTER_ACCEPT||l===NodeFilter.FILTER_SKIP){for(l=m.firstChild;l;)h+=c(e,l),l=l.nextSibling;m.nodeValue&&(h+=g(m.nodeValue))}r&&(h+="</"+
r+">",e.pop());return h}var n=this;this.filter=null;this.writeToString=function(g,m){if(!g)return"";var h=new e(m);return c(h,g)}};
// Input 35
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
runtime.loadClass("odf.Namespaces");runtime.loadClass("xmldom.LSSerializer");runtime.loadClass("odf.OdfNodeFilter");runtime.loadClass("odf.TextSerializer");
gui.Clipboard=function(){var e,g,c;this.setDataFromRange=function(c,q){var m=!0,h,l=c.clipboardData;h=runtime.getWindow();var r=q.startContainer.ownerDocument;!l&&h&&(l=h.clipboardData);l?(r=r.createElement("span"),r.appendChild(q.cloneContents()),h=l.setData("text/plain",g.writeToString(r)),m=m&&h,h=l.setData("text/html",e.writeToString(r,odf.Namespaces.namespaceMap)),m=m&&h,c.preventDefault()):m=!1;return m};e=new xmldom.LSSerializer;g=new odf.TextSerializer;c=new odf.OdfNodeFilter;e.filter=c;g.filter=
c};
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
runtime.loadClass("core.Base64");runtime.loadClass("core.Zip");runtime.loadClass("core.DomUtils");runtime.loadClass("xmldom.LSSerializer");runtime.loadClass("odf.StyleInfo");runtime.loadClass("odf.Namespaces");runtime.loadClass("odf.OdfNodeFilter");
(function(){function e(a,b,d){for(a=a?a.firstChild:null;a;){if(a.localName===d&&a.namespaceURI===b)return a;a=a.nextSibling}return null}function g(a){var b,d=r.length;for(b=0;b<d;b+=1)if("urn:oasis:names:tc:opendocument:xmlns:office:1.0"===a.namespaceURI&&a.localName===r[b])return b;return-1}function c(a,b){var d=new m.UsedStyleList(a,b),c=new odf.OdfNodeFilter;this.acceptNode=function(a){var f=c.acceptNode(a);f===NodeFilter.FILTER_ACCEPT&&a.parentNode===b&&a.nodeType===Node.ELEMENT_NODE&&(f=d.uses(a)?
NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT);return f}}function n(a,b){var d=new c(a,b);this.acceptNode=function(a){var b=d.acceptNode(a);b!==NodeFilter.FILTER_ACCEPT||!a.parentNode||a.parentNode.namespaceURI!==odf.Namespaces.textns||"s"!==a.parentNode.localName&&"tab"!==a.parentNode.localName||(b=NodeFilter.FILTER_REJECT);return b}}function q(a,b){if(b){var d=g(b),c,f=a.firstChild;if(-1!==d){for(;f;){c=g(f);if(-1!==c&&c>d)break;f=f.nextSibling}a.insertBefore(b,f)}}}var m=new odf.StyleInfo,
h=new core.DomUtils,l=odf.Namespaces.stylens,r="meta settings scripts font-face-decls styles automatic-styles master-styles body".split(" "),d=(new Date).getTime()+"_webodf_",f=new core.Base64;odf.ODFElement=function(){};odf.ODFDocumentElement=function(){};odf.ODFDocumentElement.prototype=new odf.ODFElement;odf.ODFDocumentElement.prototype.constructor=odf.ODFDocumentElement;odf.ODFDocumentElement.prototype.fontFaceDecls=null;odf.ODFDocumentElement.prototype.manifest=null;odf.ODFDocumentElement.prototype.settings=
null;odf.ODFDocumentElement.namespaceURI="urn:oasis:names:tc:opendocument:xmlns:office:1.0";odf.ODFDocumentElement.localName="document";odf.OdfPart=function(a,b,d,c){var f=this;this.size=0;this.type=null;this.name=a;this.container=d;this.url=null;this.mimetype=b;this.onstatereadychange=this.document=null;this.EMPTY=0;this.LOADING=1;this.DONE=2;this.state=this.EMPTY;this.data="";this.load=function(){null!==c&&(this.mimetype=b,c.loadAsDataURL(a,b,function(a,b){a&&runtime.log(a);f.url=b;if(f.onchange)f.onchange(f);
if(f.onstatereadychange)f.onstatereadychange(f)}))}};odf.OdfPart.prototype.load=function(){};odf.OdfPart.prototype.getUrl=function(){return this.data?"data:;base64,"+f.toBase64(this.data):null};odf.OdfContainer=function b(k,g){function r(b){for(var d=b.firstChild,c;d;)c=d.nextSibling,d.nodeType===Node.ELEMENT_NODE?r(d):d.nodeType===Node.PROCESSING_INSTRUCTION_NODE&&b.removeChild(d),d=c}function y(b,d){for(var c=b&&b.firstChild;c;)c.nodeType===Node.ELEMENT_NODE&&c.setAttributeNS("urn:webodf:names:scope",
"scope",d),c=c.nextSibling}function w(b){var d={},c;for(b=b.firstChild;b;)b.nodeType===Node.ELEMENT_NODE&&b.namespaceURI===l&&"font-face"===b.localName&&(c=b.getAttributeNS(l,"name"),d[c]=b),b=b.nextSibling;return d}function x(b,d){var c=null,f,e,k;if(b)for(c=b.cloneNode(!0),f=c.firstElementChild;f;)e=f.nextElementSibling,(k=f.getAttributeNS("urn:webodf:names:scope","scope"))&&k!==d&&c.removeChild(f),f=e;return c}function v(b,d){var c,f,e,k=null,h={};if(b)for(d.forEach(function(b){m.collectUsedFontFaces(h,
b)}),k=b.cloneNode(!0),c=k.firstElementChild;c;)f=c.nextElementSibling,e=c.getAttributeNS(l,"name"),h[e]||k.removeChild(c),c=f;return k}function u(b){var d=Q.rootElement.ownerDocument,c;if(b){r(b.documentElement);try{c=d.importNode(b.documentElement,!0)}catch(f){}}return c}function s(b){Q.state=b;if(Q.onchange)Q.onchange(Q);if(Q.onstatereadychange)Q.onstatereadychange(Q)}function H(b){ba=null;Q.rootElement=b;b.fontFaceDecls=e(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","font-face-decls");
b.styles=e(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","styles");b.automaticStyles=e(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","automatic-styles");b.masterStyles=e(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","master-styles");b.body=e(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","body");b.meta=e(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","meta")}function z(c){var f=u(c),k=Q.rootElement,h;f&&"document-styles"===f.localName&&"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===
f.namespaceURI?(k.fontFaceDecls=e(f,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","font-face-decls"),q(k,k.fontFaceDecls),h=e(f,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","styles"),k.styles=h||c.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0","styles"),q(k,k.styles),h=e(f,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","automatic-styles"),k.automaticStyles=h||c.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0","automatic-styles"),y(k.automaticStyles,
"document-styles"),q(k,k.automaticStyles),f=e(f,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","master-styles"),k.masterStyles=f||c.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0","master-styles"),q(k,k.masterStyles),m.prefixStyleNames(k.automaticStyles,d,k.masterStyles)):s(b.INVALID)}function C(d){d=u(d);var c,f,k,h;if(d&&"document-content"===d.localName&&"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===d.namespaceURI){c=Q.rootElement;k=e(d,"urn:oasis:names:tc:opendocument:xmlns:office:1.0",
"font-face-decls");if(c.fontFaceDecls&&k){h=c.fontFaceDecls;var g,p,n,r,v={};f=w(h);r=w(k);for(k=k.firstElementChild;k;){g=k.nextElementSibling;if(k.namespaceURI===l&&"font-face"===k.localName)if(p=k.getAttributeNS(l,"name"),f.hasOwnProperty(p)){if(!k.isEqualNode(f[p])){n=p;for(var t=f,z=r,L=0,A=void 0,A=n=n.replace(/\d+$/,"");t.hasOwnProperty(A)||z.hasOwnProperty(A);)L+=1,A=n+L;n=A;k.setAttributeNS(l,"style:name",n);h.appendChild(k);f[n]=k;delete r[p];v[p]=n}}else h.appendChild(k),f[p]=k,delete r[p];
k=g}h=v}else k&&(c.fontFaceDecls=k,q(c,k));f=e(d,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","automatic-styles");y(f,"document-content");h&&m.changeFontFaceNames(f,h);if(c.automaticStyles&&f)for(h=f.firstChild;h;)c.automaticStyles.appendChild(h),h=f.firstChild;else f&&(c.automaticStyles=f,q(c,f));d=e(d,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","body");if(null===d)throw"<office:body/> tag is mising.";c.body=d;q(c,c.body)}else s(b.INVALID)}function I(b){b=u(b);var d;b&&"document-meta"===
b.localName&&"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===b.namespaceURI&&(d=Q.rootElement,d.meta=e(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","meta"),q(d,d.meta))}function L(b){b=u(b);var d;b&&"document-settings"===b.localName&&"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===b.namespaceURI&&(d=Q.rootElement,d.settings=e(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","settings"),q(d,d.settings))}function V(b){b=u(b);var d;if(b&&"manifest"===b.localName&&"urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"===
b.namespaceURI)for(d=Q.rootElement,d.manifest=b,b=d.manifest.firstElementChild;b;)"file-entry"===b.localName&&"urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"===b.namespaceURI&&(K[b.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0","full-path")]=b.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0","media-type")),b=b.nextElementSibling}function P(d){var c=d.shift();c?N.loadAsDOM(c.path,function(f,e){c.handler(e);f||Q.state===b.INVALID||P(d)}):s(b.DONE)}function A(b){var d=
"";odf.Namespaces.forEachPrefix(function(b,c){d+=" xmlns:"+b+'="'+c+'"'});return'<?xml version="1.0" encoding="UTF-8"?><office:'+b+" "+d+' office:version="1.2">'}function ka(){var b=new xmldom.LSSerializer,d=A("document-meta");b.filter=new odf.OdfNodeFilter;d+=b.writeToString(Q.rootElement.meta,odf.Namespaces.namespaceMap);return d+"</office:document-meta>"}function ua(b,d){var c=document.createElementNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0","manifest:file-entry");c.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0",
"manifest:full-path",b);c.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0","manifest:media-type",d);return c}function G(){var b=runtime.parseXML('<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"></manifest:manifest>'),d=e(b,"urn:oasis:names:tc:opendocument:xmlns:manifest:1.0","manifest"),c=new xmldom.LSSerializer,f;for(f in K)K.hasOwnProperty(f)&&d.appendChild(ua(f,K[f]));c.filter=new odf.OdfNodeFilter;return'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'+
c.writeToString(b,odf.Namespaces.namespaceMap)}function X(){var b=new xmldom.LSSerializer,d=A("document-settings");b.filter=new odf.OdfNodeFilter;d+=b.writeToString(Q.rootElement.settings,odf.Namespaces.namespaceMap);return d+"</office:document-settings>"}function M(){var b,f,e,k=odf.Namespaces.namespaceMap,h=new xmldom.LSSerializer,g=A("document-styles");f=x(Q.rootElement.automaticStyles,"document-styles");e=Q.rootElement.masterStyles.cloneNode(!0);b=v(Q.rootElement.fontFaceDecls,[e,Q.rootElement.styles,
f]);m.removePrefixFromStyleNames(f,d,e);h.filter=new c(e,f);g+=h.writeToString(b,k);g+=h.writeToString(Q.rootElement.styles,k);g+=h.writeToString(f,k);g+=h.writeToString(e,k);return g+"</office:document-styles>"}function Z(){var b,d,c=odf.Namespaces.namespaceMap,f=new xmldom.LSSerializer,e=A("document-content");d=x(Q.rootElement.automaticStyles,"document-content");b=v(Q.rootElement.fontFaceDecls,[d]);f.filter=new n(Q.rootElement.body,d);e+=f.writeToString(b,c);e+=f.writeToString(d,c);e+=f.writeToString(Q.rootElement.body,
c);return e+"</office:document-content>"}function J(d,c){runtime.loadXML(d,function(d,f){if(d)c(d);else{var e=u(f);e&&"document"===e.localName&&"urn:oasis:names:tc:opendocument:xmlns:office:1.0"===e.namespaceURI?(H(e),s(b.DONE)):s(b.INVALID)}})}function E(b,d){var c;c=Q.rootElement;var f=c.meta;f||(c.meta=f=document.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0","meta"),q(c,f));c=f;b&&h.mapKeyValObjOntoNode(c,b,odf.Namespaces.lookupNamespaceURI);d&&h.removeKeyElementsFromNode(c,
d,odf.Namespaces.lookupNamespaceURI)}function B(){function d(b,c){var f;c||(c=b);f=document.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0",c);e[b]=f;e.appendChild(f)}var c=new core.Zip("",null),f=runtime.byteArrayFromString("application/vnd.oasis.opendocument.text","utf8"),e=Q.rootElement,k=document.createElementNS("urn:oasis:names:tc:opendocument:xmlns:office:1.0","text");c.save("mimetype",f,!1,new Date);d("meta");d("settings");d("scripts");d("fontFaceDecls","font-face-decls");
d("styles");d("automaticStyles","automatic-styles");d("masterStyles","master-styles");d("body");e.body.appendChild(k);s(b.DONE);return c}function Y(){var b,d=new Date,c=runtime.getWindow();b="WebODF/"+("undefined"!==String(typeof webodf_version)?webodf_version:"FromSource");c&&(b=b+" "+c.navigator.userAgent);E({"meta:generator":b},null);b=runtime.byteArrayFromString(X(),"utf8");N.save("settings.xml",b,!0,d);b=runtime.byteArrayFromString(ka(),"utf8");N.save("meta.xml",b,!0,d);b=runtime.byteArrayFromString(M(),
"utf8");N.save("styles.xml",b,!0,d);b=runtime.byteArrayFromString(Z(),"utf8");N.save("content.xml",b,!0,d);b=runtime.byteArrayFromString(G(),"utf8");N.save("META-INF/manifest.xml",b,!0,d)}function U(b,d){Y();N.writeAs(b,function(b){d(b)})}var Q=this,N,K={},ba;this.onstatereadychange=g;this.state=this.onchange=null;this.setRootElement=H;this.getContentElement=function(){var b;ba||(b=Q.rootElement.body,ba=e(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","text")||e(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0",
"presentation")||e(b,"urn:oasis:names:tc:opendocument:xmlns:office:1.0","spreadsheet"));if(!ba)throw"Could not find content element in <office:body/>.";return ba};this.getDocumentType=function(){var b=Q.getContentElement();return b&&b.localName};this.getPart=function(b){return new odf.OdfPart(b,K[b],Q,N)};this.getPartData=function(b,d){N.load(b,d)};this.setMetadata=E;this.incrementEditingCycles=function(){var b;for(b=(b=Q.rootElement.meta)&&b.firstChild;b&&(b.namespaceURI!==odf.Namespaces.metans||
"editing-cycles"!==b.localName);)b=b.nextSibling;for(b=b&&b.firstChild;b&&b.nodeType!==Node.TEXT_NODE;)b=b.nextSibling;b=b?b.data:null;b=b?parseInt(b,10):0;isNaN(b)&&(b=0);E({"meta:editing-cycles":b+1},null)};this.createByteArray=function(b,d){Y();N.createByteArray(b,d)};this.saveAs=U;this.save=function(b){U(k,b)};this.getUrl=function(){return k};this.setBlob=function(b,d,c){c=f.convertBase64ToByteArray(c);N.save(b,c,!1,new Date);K.hasOwnProperty(b)&&runtime.log(b+" has been overwritten.");K[b]=d};
this.removeBlob=function(b){var d=N.remove(b);runtime.assert(d,"file is not found: "+b);delete K[b]};this.state=b.LOADING;this.rootElement=function(b){var d=document.createElementNS(b.namespaceURI,b.localName),c;b=new b.Type;for(c in b)b.hasOwnProperty(c)&&(d[c]=b[c]);return d}({Type:odf.ODFDocumentElement,namespaceURI:odf.ODFDocumentElement.namespaceURI,localName:odf.ODFDocumentElement.localName});N=k?new core.Zip(k,function(d,c){N=c;d?J(k,function(c){d&&(N.error=d+"\n"+c,s(b.INVALID))}):P([{path:"styles.xml",
handler:z},{path:"content.xml",handler:C},{path:"meta.xml",handler:I},{path:"settings.xml",handler:L},{path:"META-INF/manifest.xml",handler:V}])}):B()};odf.OdfContainer.EMPTY=0;odf.OdfContainer.LOADING=1;odf.OdfContainer.DONE=2;odf.OdfContainer.INVALID=3;odf.OdfContainer.SAVING=4;odf.OdfContainer.MODIFIED=5;odf.OdfContainer.getContainer=function(b){return new odf.OdfContainer(b,null)};return odf.OdfContainer})();
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
runtime.loadClass("core.Base64");runtime.loadClass("xmldom.XPath");runtime.loadClass("odf.OdfContainer");
(function(){function e(g,q,m,h,l){var r,d=0,f;for(f in g)if(g.hasOwnProperty(f)){if(d===m){r=f;break}d+=1}r?q.getPartData(g[r].href,function(a,b){if(a)runtime.log(a);else if(b){var d="@font-face { font-family: '"+(g[r].family||r)+"'; src: url(data:application/x-font-ttf;charset=binary;base64,"+c.convertUTF8ArrayToBase64(b)+') format("truetype"); }';try{h.insertRule(d,h.cssRules.length)}catch(f){runtime.log("Problem inserting rule in CSS: "+runtime.toJson(f)+"\nRule: "+d)}}else runtime.log("missing font data for "+
g[r].href);e(g,q,m+1,h,l)}):l&&l()}var g=xmldom.XPath,c=new core.Base64;odf.FontLoader=function(){this.loadFonts=function(c,q){for(var m=c.rootElement.fontFaceDecls;q.cssRules.length;)q.deleteRule(q.cssRules.length-1);if(m){var h={},l,r,d,f;if(m)for(m=g.getODFElementsWithXPath(m,"style:font-face[svg:font-face-src]",odf.Namespaces.lookupNamespaceURI),l=0;l<m.length;l+=1)r=m[l],d=r.getAttributeNS(odf.Namespaces.stylens,"name"),f=r.getAttributeNS(odf.Namespaces.svgns,"font-family"),r=g.getODFElementsWithXPath(r,
"svg:font-face-src/svg:font-face-uri",odf.Namespaces.lookupNamespaceURI),0<r.length&&(r=r[0].getAttributeNS(odf.Namespaces.xlinkns,"href"),h[d]={href:r,family:f});e(h,c,0,q)}}};return odf.FontLoader})();
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
runtime.loadClass("core.DomUtils");runtime.loadClass("core.Utils");
odf.ObjectNameGenerator=function(e,g){function c(a,b){var d={};this.generateName=function(){var c=b(),f=0,e;do e=a+f,f+=1;while(d[e]||c[e]);d[e]=!0;return e}}function n(){var a={};[e.rootElement.automaticStyles,e.rootElement.styles].forEach(function(b){for(b=b.firstElementChild;b;)b.namespaceURI===q&&"style"===b.localName&&(a[b.getAttributeNS(q,"name")]=!0),b=b.nextElementSibling});return a}var q=odf.Namespaces.stylens,m=odf.Namespaces.drawns,h=odf.Namespaces.xlinkns,l=new core.DomUtils,r=(new core.Utils).hashString(g),
d=null,f=null,a=null,b={},k={};this.generateStyleName=function(){null===d&&(d=new c("auto"+r+"_",function(){return n()}));return d.generateName()};this.generateFrameName=function(){null===f&&(l.getElementsByTagNameNS(e.rootElement.body,m,"frame").forEach(function(a){b[a.getAttributeNS(m,"name")]=!0}),f=new c("fr"+r+"_",function(){return b}));return f.generateName()};this.generateImageName=function(){null===a&&(l.getElementsByTagNameNS(e.rootElement.body,m,"image").forEach(function(a){a=a.getAttributeNS(h,
"href");a=a.substring(9,a.lastIndexOf("."));k[a]=!0}),a=new c("img"+r+"_",function(){return k}));return a.generateName()}};
// Input 39
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
runtime.loadClass("core.Utils");runtime.loadClass("odf.ObjectNameGenerator");runtime.loadClass("odf.Namespaces");runtime.loadClass("odf.OdfContainer");runtime.loadClass("odf.StyleInfo");runtime.loadClass("odf.OdfUtils");
odf.Formatting=function(){function e(a){return(a=u[a])?v.mergeObjects({},a):{}}function g(a,b,d){for(a=a&&a.firstElementChild;a&&(a.namespaceURI!==b||a.localName!==d);)a=a.nextElementSibling;return a}function c(){for(var a=f.rootElement.fontFaceDecls,d={},c,e,a=a&&a.firstElementChild;a;){if(c=a.getAttributeNS(k,"name"))if((e=a.getAttributeNS(b,"font-family"))||0<a.getElementsByTagNameNS(b,"font-face-uri").length)d[c]=e;a=a.nextElementSibling}return d}function n(a){for(var b=f.rootElement.styles.firstElementChild;b;){if(b.namespaceURI===
k&&"default-style"===b.localName&&b.getAttributeNS(k,"family")===a)return b;b=b.nextElementSibling}return null}function q(a,b,d){var c,e,h;d=d||[f.rootElement.automaticStyles,f.rootElement.styles];for(h=0;h<d.length;h+=1)for(c=d[h],c=c.firstElementChild;c;){e=c.getAttributeNS(k,"name");if(c.namespaceURI===k&&"style"===c.localName&&c.getAttributeNS(k,"family")===b&&e===a||"list-style"===b&&c.namespaceURI===p&&"list-style"===c.localName&&e===a||"data"===b&&c.namespaceURI===t&&e===a)return c;c=c.nextElementSibling}return null}
function m(a){for(var b,d,c,f,e={},h=a.firstElementChild;h;){if(h.namespaceURI===k)for(c=e[h.nodeName]={},d=h.attributes,b=0;b<d.length;b+=1)f=d.item(b),c[f.name]=f.value;h=h.nextElementSibling}d=a.attributes;for(b=0;b<d.length;b+=1)f=d.item(b),e[f.name]=f.value;return e}function h(a,b){for(var d=f.rootElement.styles,c,h={},g=a.getAttributeNS(k,"family"),p=a;p;)c=m(p),h=v.mergeObjects(c,h),p=(c=p.getAttributeNS(k,"parent-style-name"))?q(c,g,[d]):null;if(p=n(g))c=m(p),h=v.mergeObjects(c,h);b&&(c=e(g))&&
(h=v.mergeObjects(c,h));return h}function l(b,d){function c(a){Object.keys(a).forEach(function(b){Object.keys(a[b]).forEach(function(a){h+="|"+b+":"+a+"|"})})}for(var f=b.nodeType===Node.TEXT_NODE?b.parentNode:b,e,k=[],h="",g=!1;f;)!g&&w.isGroupingElement(f)&&(g=!0),(e=a.determineStylesForNode(f))&&k.push(e),f=f.parentNode;g&&(k.forEach(c),d&&(d[h]=k));return g?k:void 0}function r(a){var b={orderedStyles:[]};a.forEach(function(a){Object.keys(a).forEach(function(d){var c=Object.keys(a[d])[0],f,e;(f=
q(c,d))?(e=h(f),b=v.mergeObjects(e,b),e=f.getAttributeNS(k,"display-name")):runtime.log("No style element found for '"+c+"' of family '"+d+"'");b.orderedStyles.push({name:c,family:d,displayName:e})})});return b}function d(a,b){var d=w.parseLength(a),c=b;if(d)switch(d.unit){case "cm":c=d.value;break;case "mm":c=0.1*d.value;break;case "in":c=2.54*d.value;break;case "pt":c=0.035277778*d.value;break;case "pc":case "px":case "em":break;default:runtime.log("Unit identifier: "+d.unit+" is not supported.")}return c}
var f,a=new odf.StyleInfo,b=odf.Namespaces.svgns,k=odf.Namespaces.stylens,p=odf.Namespaces.textns,t=odf.Namespaces.numberns,y=odf.Namespaces.fons,w=new odf.OdfUtils,x=new core.DomUtils,v=new core.Utils,u={paragraph:{"style:paragraph-properties":{"fo:text-align":"left"}}};this.getSystemDefaultStyleAttributes=e;this.setOdfContainer=function(a){f=a};this.getFontMap=c;this.getAvailableParagraphStyles=function(){for(var a=f.rootElement.styles,b,d,c=[],a=a&&a.firstElementChild;a;)"style"===a.localName&&
a.namespaceURI===k&&(b=a.getAttributeNS(k,"family"),"paragraph"===b&&(b=a.getAttributeNS(k,"name"),d=a.getAttributeNS(k,"display-name")||b,b&&d&&c.push({name:b,displayName:d}))),a=a.nextElementSibling;return c};this.isStyleUsed=function(b){var d,c=f.rootElement;d=a.hasDerivedStyles(c,odf.Namespaces.lookupNamespaceURI,b);b=(new a.UsedStyleList(c.styles)).uses(b)||(new a.UsedStyleList(c.automaticStyles)).uses(b)||(new a.UsedStyleList(c.body)).uses(b);return d||b};this.getDefaultStyleElement=n;this.getStyleElement=
q;this.getStyleAttributes=m;this.getInheritedStyleAttributes=h;this.getFirstCommonParentStyleNameOrSelf=function(a){var b=f.rootElement.automaticStyles,d=f.rootElement.styles,c;for(c=q(a,"paragraph",[b]);c;)a=c.getAttributeNS(k,"parent-style-name"),c=q(a,"paragraph",[b]);return(c=q(a,"paragraph",[d]))?a:null};this.hasParagraphStyle=function(a){return Boolean(q(a,"paragraph"))};this.getAppliedStyles=function(a){var b={},d=[];a.forEach(function(a){l(a,b)});Object.keys(b).forEach(function(a){d.push(r(b[a]))});
return d};this.getAppliedStylesForElement=function(a){return(a=l(a))?r(a):void 0};this.updateStyle=function(a,d){var e,h;x.mapObjOntoNode(a,d,odf.Namespaces.lookupNamespaceURI);(e=d["style:text-properties"]&&d["style:text-properties"]["style:font-name"])&&!c().hasOwnProperty(e)&&(h=a.ownerDocument.createElementNS(k,"style:font-face"),h.setAttributeNS(k,"style:name",e),h.setAttributeNS(b,"svg:font-family",e),f.rootElement.fontFaceDecls.appendChild(h))};this.createDerivedStyleObject=function(a,b,d){var c=
q(a,b);runtime.assert(Boolean(c),"No style element found for '"+a+"' of family '"+b+"'");a=c.parentNode===f.rootElement.automaticStyles?m(c):{"style:parent-style-name":a};a["style:family"]=b;v.mergeObjects(a,d);return a};this.getDefaultTabStopDistance=function(){for(var a=n("paragraph"),a=a&&a.firstElementChild,b;a;)a.namespaceURI===k&&"paragraph-properties"===a.localName&&(b=a.getAttributeNS(k,"tab-stop-distance")),a=a.nextElementSibling;b||(b="1.25cm");return w.parseNonNegativeLength(b)};this.getContentSize=
function(a,b){var c,e,h,p,l,m,n,r,v,t,u;a:{var w,Z,J;c=q(a,b);runtime.assert("paragraph"===b||"table"===b,"styleFamily has to be either paragraph or table");if(c){w=c.getAttributeNS(k,"master-page-name")||"Standard";for(c=f.rootElement.masterStyles.lastElementChild;c&&c.getAttributeNS(k,"name")!==w;)c=c.previousElementSibling;w=c.getAttributeNS(k,"page-layout-name");Z=x.getElementsByTagNameNS(f.rootElement.automaticStyles,k,"page-layout");for(J=0;J<Z.length;J+=1)if(c=Z[J],c.getAttributeNS(k,"name")===
w)break a}c=null}c||(c=g(f.rootElement.styles,k,"default-page-layout"));if(c=g(c,k,"page-layout-properties"))e=c.getAttributeNS(k,"print-orientation")||"portrait","portrait"===e?(e=21.001,h=29.7):(e=29.7,h=21.001),e=d(c.getAttributeNS(y,"page-width"),e),h=d(c.getAttributeNS(y,"page-height"),h),p=d(c.getAttributeNS(y,"margin"),null),null===p?(p=d(c.getAttributeNS(y,"margin-left"),2),l=d(c.getAttributeNS(y,"margin-right"),2),m=d(c.getAttributeNS(y,"margin-top"),2),n=d(c.getAttributeNS(y,"margin-bottom"),
2)):p=l=m=n=p,r=d(c.getAttributeNS(y,"padding"),null),null===r?(r=d(c.getAttributeNS(y,"padding-left"),0),v=d(c.getAttributeNS(y,"padding-right"),0),t=d(c.getAttributeNS(y,"padding-top"),0),u=d(c.getAttributeNS(y,"padding-bottom"),0)):r=v=t=u=r;return{width:e-p-l-r-v,height:h-m-n-t-u}}};
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
runtime.loadClass("core.DomUtils");runtime.loadClass("odf.OdfContainer");runtime.loadClass("odf.Formatting");runtime.loadClass("xmldom.XPath");runtime.loadClass("odf.FontLoader");runtime.loadClass("odf.Style2CSS");runtime.loadClass("odf.OdfUtils");runtime.loadClass("gui.AnnotationViewManager");
(function(){function e(){function a(c){d=!0;runtime.setTimeout(function(){try{c()}catch(f){runtime.log(String(f))}d=!1;0<b.length&&a(b.pop())},10)}var b=[],d=!1;this.clearQueue=function(){b.length=0};this.addToQueue=function(c){if(0===b.length&&!d)return a(c);b.push(c)}}function g(a){function b(){for(;0<d.cssRules.length;)d.deleteRule(0);d.insertRule("#shadowContent draw|page {display:none;}",0);d.insertRule("office|presentation draw|page {display:none;}",1);d.insertRule("#shadowContent draw|page:nth-of-type("+
c+") {display:block;}",2);d.insertRule("office|presentation draw|page:nth-of-type("+c+") {display:block;}",3)}var d=a.sheet,c=1;this.showFirstPage=function(){c=1;b()};this.showNextPage=function(){c+=1;b()};this.showPreviousPage=function(){1<c&&(c-=1,b())};this.showPage=function(a){0<a&&(c=a,b())};this.css=a;this.destroy=function(b){a.parentNode.removeChild(a);b()}}function c(a){for(;a.firstChild;)a.removeChild(a.firstChild)}function n(a,b,d){(new odf.Style2CSS).style2css(a.getDocumentType(),d.sheet,
b.getFontMap(),a.rootElement.styles,a.rootElement.automaticStyles)}function q(a,b,d){var c=null;a=a.rootElement.body.getElementsByTagNameNS(I,d+"-decl");d=b.getAttributeNS(I,"use-"+d+"-name");var f;if(d&&0<a.length)for(b=0;b<a.length;b+=1)if(f=a[b],f.getAttributeNS(I,"name")===d){c=f.textContent;break}return c}function m(a,b,d,f){var e=a.ownerDocument;b=a.getElementsByTagNameNS(b,d);for(a=0;a<b.length;a+=1)c(b[a]),f&&(d=b[a],d.appendChild(e.createTextNode(f)))}function h(a,b,d){b.setAttributeNS("urn:webodf:names:helper",
"styleid",a);var c,f=b.getAttributeNS(H,"anchor-type"),e=b.getAttributeNS(u,"x"),k=b.getAttributeNS(u,"y"),h=b.getAttributeNS(u,"width"),g=b.getAttributeNS(u,"height"),p=b.getAttributeNS(w,"min-height"),l=b.getAttributeNS(w,"min-width");if("as-char"===f)c="display: inline-block;";else if(f||e||k)c="position: absolute;";else if(h||g||p||l)c="display: block;";e&&(c+="left: "+e+";");k&&(c+="top: "+k+";");h&&(c+="width: "+h+";");g&&(c+="height: "+g+";");p&&(c+="min-height: "+p+";");l&&(c+="min-width: "+
l+";");c&&(c="draw|"+b.localName+'[webodfhelper|styleid="'+a+'"] {'+c+"}",d.insertRule(c,d.cssRules.length))}function l(a){for(a=a.firstChild;a;){if(a.namespaceURI===x&&"binary-data"===a.localName)return"data:image/png;base64,"+a.textContent.replace(/[\r\n\s]/g,"");a=a.nextSibling}return""}function r(a,b,d,c){function f(b){b&&(b='draw|image[webodfhelper|styleid="'+a+'"] {'+("background-image: url("+b+");")+"}",c.insertRule(b,c.cssRules.length))}function e(a){f(a.url)}d.setAttributeNS("urn:webodf:names:helper",
"styleid",a);var k=d.getAttributeNS(z,"href"),h;if(k)try{h=b.getPart(k),h.onchange=e,h.load()}catch(g){runtime.log("slight problem: "+String(g))}else k=l(d),f(k)}function d(a){function b(d){var c,f;d.hasAttributeNS(z,"href")&&(c=d.getAttributeNS(z,"href"),"#"===c[0]?(c=c.substring(1),f=function(){var b=V.getODFElementsWithXPath(a,"//text:bookmark-start[@text:name='"+c+"']",odf.Namespaces.lookupNamespaceURI);0===b.length&&(b=V.getODFElementsWithXPath(a,"//text:bookmark[@text:name='"+c+"']",odf.Namespaces.lookupNamespaceURI));
0<b.length&&b[0].scrollIntoView(!0);return!1}):f=function(){L.open(c)},d.onclick=f)}var d,c,f;c=a.getElementsByTagNameNS(H,"a");for(d=0;d<c.length;d+=1)f=c.item(d),b(f)}function f(a){var b=a.ownerDocument;A.getElementsByTagNameNS(a,H,"line-break").forEach(function(a){a.hasChildNodes()||a.appendChild(b.createElement("br"))})}function a(a){var b=a.ownerDocument;A.getElementsByTagNameNS(a,H,"s").forEach(function(a){for(var d,c;a.firstChild;)a.removeChild(a.firstChild);a.appendChild(b.createTextNode(" "));
c=parseInt(a.getAttributeNS(H,"c"),10);if(1<c)for(a.removeAttributeNS(H,"c"),d=1;d<c;d+=1)a.parentNode.insertBefore(a.cloneNode(!0),a)})}function b(a){A.getElementsByTagNameNS(a,H,"tab").forEach(function(a){a.textContent="\t"})}function k(a,b){function d(a,c){var k=h.documentElement.namespaceURI;"video/"===c.substr(0,6)?(f=h.createElementNS(k,"video"),f.setAttribute("controls","controls"),e=h.createElementNS(k,"source"),a&&e.setAttribute("src",a),e.setAttribute("type",c),f.appendChild(e),b.parentNode.appendChild(f)):
b.innerHtml="Unrecognised Plugin"}function c(a){d(a.url,a.mimetype)}var f,e,k,h=b.ownerDocument,g;if(k=b.getAttributeNS(z,"href"))try{g=a.getPart(k),g.onchange=c,g.load()}catch(p){runtime.log("slight problem: "+String(p))}else runtime.log("using MP4 data fallback"),k=l(b),d(k,"video/mp4")}function p(a){var b=a.getElementsByTagName("head")[0],d;"undefined"!==String(typeof webodf_css)?(d=a.createElementNS(b.namespaceURI,"style"),d.setAttribute("media","screen, print, handheld, projection"),d.appendChild(a.createTextNode(webodf_css))):
(d=a.createElementNS(b.namespaceURI,"link"),a="webodf.css",runtime.currentDirectory&&(a=runtime.currentDirectory()+"/../"+a),d.setAttribute("href",a),d.setAttribute("rel","stylesheet"));d.setAttribute("type","text/css");b.appendChild(d);return d}function t(a){var b=a.getElementsByTagName("head")[0],d=a.createElementNS(b.namespaceURI,"style"),c="";d.setAttribute("type","text/css");d.setAttribute("media","screen, print, handheld, projection");odf.Namespaces.forEachPrefix(function(a,b){c+="@namespace "+
a+" url("+b+");\n"});c+="@namespace webodfhelper url(urn:webodf:names:helper);\n";d.appendChild(a.createTextNode(c));b.appendChild(d);return d}var y=odf.Namespaces.drawns,w=odf.Namespaces.fons,x=odf.Namespaces.officens,v=odf.Namespaces.stylens,u=odf.Namespaces.svgns,s=odf.Namespaces.tablens,H=odf.Namespaces.textns,z=odf.Namespaces.xlinkns,C=odf.Namespaces.xmlns,I=odf.Namespaces.presentationns,L=runtime.getWindow(),V=xmldom.XPath,P=new odf.OdfUtils,A=new core.DomUtils;odf.OdfCanvas=function(l){function u(a,
b,d){function c(a,b,d,f){F.addToQueue(function(){r(a,b,d,f)})}var f,e;f=b.getElementsByTagNameNS(y,"image");for(b=0;b<f.length;b+=1)e=f.item(b),c("image"+String(b),a,e,d)}function w(a,b){function d(a,b){F.addToQueue(function(){k(a,b)})}var c,f,e;f=b.getElementsByTagNameNS(y,"plugin");for(c=0;c<f.length;c+=1)e=f.item(c),d(a,e)}function z(){var a;K.firstChild&&(1<aa?(K.style.MozTransformOrigin="center top",K.style.WebkitTransformOrigin="center top",K.style.OTransformOrigin="center top",K.style.msTransformOrigin=
"center top"):(K.style.MozTransformOrigin="left top",K.style.WebkitTransformOrigin="left top",K.style.OTransformOrigin="left top",K.style.msTransformOrigin="left top"),K.style.WebkitTransform="scale("+aa+")",K.style.MozTransform="scale("+aa+")",K.style.OTransform="scale("+aa+")",K.style.msTransform="scale("+aa+")",ca&&((a=ca.getMinimumHeightForAnnotationPane())?K.style.minHeight=a:K.style.removeProperty("min-height")),l.style.width=Math.round(aa*K.offsetWidth)+"px",l.style.height=Math.round(aa*K.offsetHeight)+
"px")}function M(a){function b(a){return c===a.getAttributeNS(x,"name")}var d=A.getElementsByTagNameNS(a,x,"annotation");a=A.getElementsByTagNameNS(a,x,"annotation-end");var c,f;for(f=0;f<d.length;f+=1)c=d[f].getAttributeNS(x,"name"),ca.addAnnotation({node:d[f],end:a.filter(b)[0]||null});ca.rerenderAnnotations()}function Z(a){ma?(ba.parentNode||K.appendChild(ba),ca&&ca.forgetAnnotations(),ca=new gui.AnnotationViewManager(B,a.body,ba,ga),M(a.body),z()):ba.parentNode&&(K.removeChild(ba),ca.forgetAnnotations(),
z())}function J(e){function k(){c(l);l.style.display="inline-block";var g=U.rootElement;l.ownerDocument.importNode(g,!0);Q.setOdfContainer(U);var p=U,r=$;(new odf.FontLoader).loadFonts(p,r.sheet);n(U,Q,W);r=U;p=ia.sheet;c(l);K=Y.createElementNS(l.namespaceURI,"div");K.style.display="inline-block";K.style.background="white";K.appendChild(g);l.appendChild(K);ba=Y.createElementNS(l.namespaceURI,"div");ba.id="annotationsPane";da=Y.createElementNS(l.namespaceURI,"div");da.id="shadowContent";da.style.position=
"absolute";da.style.top=0;da.style.left=0;r.getContentElement().appendChild(da);var t=g.body,A,D=[],B;for(A=t.firstElementChild;A&&A!==t;)if(A.namespaceURI===y&&(D[D.length]=A),A.firstElementChild)A=A.firstElementChild;else{for(;A&&A!==t&&!A.nextElementSibling;)A=A.parentNode;A&&A.nextElementSibling&&(A=A.nextElementSibling)}for(B=0;B<D.length;B+=1)A=D[B],h("frame"+String(B),A,p);D=V.getODFElementsWithXPath(t,".//*[*[@text:anchor-type='paragraph']]",odf.Namespaces.lookupNamespaceURI);for(A=0;A<D.length;A+=
1)t=D[A],t.setAttributeNS&&t.setAttributeNS("urn:webodf:names:helper","containsparagraphanchor",!0);var t=da,M,F,E;E=0;var J,N,D=r.rootElement.ownerDocument;if((A=g.body.firstElementChild)&&A.namespaceURI===x&&("presentation"===A.localName||"drawing"===A.localName))for(A=A.firstElementChild;A;){B=A.getAttributeNS(y,"master-page-name");if(B){for(M=r.rootElement.masterStyles.firstElementChild;M&&(M.getAttributeNS(v,"name")!==B||"master-page"!==M.localName||M.namespaceURI!==v);)M=M.nextElementSibling;
B=M}else B=null;if(B){M=A.getAttributeNS("urn:webodf:names:helper","styleid");F=D.createElementNS(y,"draw:page");N=B.firstElementChild;for(J=0;N;)"true"!==N.getAttributeNS(I,"placeholder")&&(E=N.cloneNode(!0),F.appendChild(E),h(M+"_"+J,E,p)),N=N.nextElementSibling,J+=1;N=J=E=void 0;var R=F.getElementsByTagNameNS(y,"frame");for(E=0;E<R.length;E+=1)J=R[E],(N=J.getAttributeNS(I,"class"))&&!/^(date-time|footer|header|page-number)$/.test(N)&&J.parentNode.removeChild(J);t.appendChild(F);E=String(t.getElementsByTagNameNS(y,
"page").length);m(F,H,"page-number",E);m(F,I,"header",q(r,A,"header"));m(F,I,"footer",q(r,A,"footer"));h(M,F,p);F.setAttributeNS(y,"draw:master-page-name",B.getAttributeNS(v,"name"))}A=A.nextElementSibling}t=l.namespaceURI;D=g.body.getElementsByTagNameNS(s,"table-cell");for(A=0;A<D.length;A+=1)B=D.item(A),B.hasAttributeNS(s,"number-columns-spanned")&&B.setAttributeNS(t,"colspan",B.getAttributeNS(s,"number-columns-spanned")),B.hasAttributeNS(s,"number-rows-spanned")&&B.setAttributeNS(t,"rowspan",B.getAttributeNS(s,
"number-rows-spanned"));d(g.body);f(g.body);a(g.body);b(g.body);u(r,g.body,p);w(r,g.body);B=g.body;r=l.namespaceURI;A={};var D={},T;M=L.document.getElementsByTagNameNS(H,"list-style");for(t=0;t<M.length;t+=1)J=M.item(t),(N=J.getAttributeNS(v,"name"))&&(D[N]=J);B=B.getElementsByTagNameNS(H,"list");for(t=0;t<B.length;t+=1)if(J=B.item(t),M=J.getAttributeNS(C,"id")){F=J.getAttributeNS(H,"continue-list");J.setAttributeNS(r,"id",M);E="text|list#"+M+" > text|list-item > *:first-child:before {";if(N=J.getAttributeNS(H,
"style-name")){J=D[N];T=P.getFirstNonWhitespaceChild(J);J=void 0;if(T)if("list-level-style-number"===T.localName){J=T.getAttributeNS(v,"num-format");N=T.getAttributeNS(v,"num-suffix")||"";var R="",R={1:"decimal",a:"lower-latin",A:"upper-latin",i:"lower-roman",I:"upper-roman"},S=void 0,S=T.getAttributeNS(v,"num-prefix")||"",S=R.hasOwnProperty(J)?S+(" counter(list, "+R[J]+")"):J?S+("'"+J+"';"):S+" ''";N&&(S+=" '"+N+"'");J=R="content: "+S+";"}else"list-level-style-image"===T.localName?J="content: none;":
"list-level-style-bullet"===T.localName&&(J="content: '"+T.getAttributeNS(H,"bullet-char")+"';");T=J}if(F){for(J=A[F];J;)J=A[J];E+="counter-increment:"+F+";";T?(T=T.replace("list",F),E+=T):E+="content:counter("+F+");"}else F="",T?(T=T.replace("list",M),E+=T):E+="content: counter("+M+");",E+="counter-increment:"+M+";",p.insertRule("text|list#"+M+" {counter-reset:"+M+"}",p.cssRules.length);E+="}";A[M]=F;E&&p.insertRule(E,p.cssRules.length)}K.insertBefore(da,K.firstChild);z();Z(g);if(!e&&(g=[U],ja.hasOwnProperty("statereadychange")))for(p=
ja.statereadychange,T=0;T<p.length;T+=1)p[T].apply(null,g)}U.state===odf.OdfContainer.DONE?k():(runtime.log("WARNING: refreshOdf called but ODF was not DONE."),oa=runtime.setTimeout(function ra(){U.state===odf.OdfContainer.DONE?k():(runtime.log("will be back later..."),oa=runtime.setTimeout(ra,500))},100))}function E(a){F.clearQueue();l.innerHTML=runtime.tr("Loading")+" "+a+"...";l.removeAttribute("style");U=new odf.OdfContainer(a,function(a){U=a;J(!1)})}runtime.assert(null!==l&&void 0!==l,"odf.OdfCanvas constructor needs DOM element");
runtime.assert(null!==l.ownerDocument&&void 0!==l.ownerDocument,"odf.OdfCanvas constructor needs DOM");var B=this,Y=l.ownerDocument,U,Q=new odf.Formatting,N,K=null,ba=null,ma=!1,ga=!1,ca=null,R,$,W,ia,da,aa=1,ja={},oa,F=new e;this.refreshCSS=function(){n(U,Q,W);z()};this.refreshSize=function(){z()};this.odfContainer=function(){return U};this.setOdfContainer=function(a,b){U=a;J(!0===b)};this.load=this.load=E;this.save=function(a){U.save(a)};this.addListener=function(a,b){switch(a){case "click":var d=
l,c=a;d.addEventListener?d.addEventListener(c,b,!1):d.attachEvent?d.attachEvent("on"+c,b):d["on"+c]=b;break;default:d=ja.hasOwnProperty(a)?ja[a]:ja[a]=[],b&&-1===d.indexOf(b)&&d.push(b)}};this.getFormatting=function(){return Q};this.getAnnotationViewManager=function(){return ca};this.refreshAnnotations=function(){Z(U.rootElement)};this.rerenderAnnotations=function(){ca&&(ca.rerenderAnnotations(),z())};this.getSizer=function(){return K};this.enableAnnotations=function(a,b){a!==ma&&(ma=a,ga=b,U&&Z(U.rootElement))};
this.addAnnotation=function(a){ca&&(ca.addAnnotation(a),z())};this.forgetAnnotations=function(){ca&&(ca.forgetAnnotations(),z())};this.setZoomLevel=function(a){aa=a;z()};this.getZoomLevel=function(){return aa};this.fitToContainingElement=function(a,b){var d=l.offsetHeight/aa;aa=a/(l.offsetWidth/aa);b/d<aa&&(aa=b/d);z()};this.fitToWidth=function(a){aa=a/(l.offsetWidth/aa);z()};this.fitSmart=function(a,b){var d,c;d=l.offsetWidth/aa;c=l.offsetHeight/aa;d=a/d;void 0!==b&&b/c<d&&(d=b/c);aa=Math.min(1,
d);z()};this.fitToHeight=function(a){aa=a/(l.offsetHeight/aa);z()};this.showFirstPage=function(){N.showFirstPage()};this.showNextPage=function(){N.showNextPage()};this.showPreviousPage=function(){N.showPreviousPage()};this.showPage=function(a){N.showPage(a);z()};this.getElement=function(){return l};this.addCssForFrameWithImage=function(a){var b=a.getAttributeNS(y,"name"),d=a.firstElementChild;h(b,a,ia.sheet);d&&r(b+"img",U,d,ia.sheet)};this.destroy=function(a){var b=Y.getElementsByTagName("head")[0];
runtime.clearTimeout(oa);ba&&ba.parentNode&&ba.parentNode.removeChild(ba);K&&(l.removeChild(K),K=null);b.removeChild(R);b.removeChild($);b.removeChild(W);b.removeChild(ia);N.destroy(a)};R=p(Y);N=new g(t(Y));$=t(Y);W=t(Y);ia=t(Y)}})();
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
runtime.loadClass("core.DomUtils");runtime.loadClass("core.LoopWatchDog");runtime.loadClass("odf.Namespaces");
odf.TextStyleApplicator=function(e,g,c){function n(d){function c(a,b){return"object"===typeof a&&"object"===typeof b?Object.keys(a).every(function(d){return c(a[d],b[d])}):a===b}this.isStyleApplied=function(a){a=g.getAppliedStylesForElement(a);return c(d,a)}}function q(d){var f={};this.applyStyleToContainer=function(a){var b;b=a.getAttributeNS(l,"style-name");var k=a.ownerDocument;b=b||"";if(!f.hasOwnProperty(b)){var h=b,m;m=b?g.createDerivedStyleObject(b,"text",d):d;k=k.createElementNS(r,"style:style");
g.updateStyle(k,m);k.setAttributeNS(r,"style:name",e.generateStyleName());k.setAttributeNS(r,"style:family","text");k.setAttributeNS("urn:webodf:names:scope","scope","document-content");c.appendChild(k);f[h]=k}b=f[b].getAttributeNS(r,"name");a.setAttributeNS(l,"text:style-name",b)}}function m(d,c){var a=d.ownerDocument,b=d.parentNode,e,g,m=new core.LoopWatchDog(1E4);g=[];"span"!==b.localName||b.namespaceURI!==l?(e=a.createElementNS(l,"text:span"),b.insertBefore(e,d),b=!1):(d.previousSibling&&!h.rangeContainsNode(c,
b.firstChild)?(e=b.cloneNode(!1),b.parentNode.insertBefore(e,b.nextSibling)):e=b,b=!0);g.push(d);for(a=d.nextSibling;a&&h.rangeContainsNode(c,a);)m.check(),g.push(a),a=a.nextSibling;g.forEach(function(a){a.parentNode!==e&&e.appendChild(a)});if(a&&b)for(g=e.cloneNode(!1),e.parentNode.insertBefore(g,e.nextSibling);a;)m.check(),b=a.nextSibling,g.appendChild(a),a=b;return e}var h=new core.DomUtils,l=odf.Namespaces.textns,r=odf.Namespaces.stylens;this.applyStyle=function(d,c,a){var b={},e,h,g,l;runtime.assert(a&&
a.hasOwnProperty("style:text-properties"),"applyStyle without any text properties");b["style:text-properties"]=a["style:text-properties"];g=new q(b);l=new n(b);d.forEach(function(a){e=l.isStyleApplied(a);!1===e&&(h=m(a,c),g.applyStyleToContainer(h))})}};
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
runtime.loadClass("odf.Namespaces");runtime.loadClass("odf.OdfUtils");
gui.StyleHelper=function(e){function g(c,e,g){var n=!0,d;for(d=0;d<c.length&&!(n=c[d]["style:text-properties"],n=!n||n[e]!==g);d+=1);return!n}function c(c,h,g){function r(){b=!0;(f=e.getDefaultStyleElement("paragraph"))||(f=null)}var d,f;c=n.getParagraphElements(c);for(var a={},b=!1;0<c.length;){(d=c[0].getAttributeNS(q,"style-name"))?a[d]||(f=e.getStyleElement(d,"paragraph"),a[d]=!0,f||b||r()):b?f=void 0:r();if(void 0!==f&&(d=null===f?e.getSystemDefaultStyleAttributes("paragraph"):e.getInheritedStyleAttributes(f,
!0),(d=d["style:paragraph-properties"])&&-1===g.indexOf(d[h])))return!1;c.pop()}return!0}var n=new odf.OdfUtils,q=odf.Namespaces.textns;this.getAppliedStyles=function(c){var h;c.collapsed?(h=c.startContainer,h.hasChildNodes()&&c.startOffset<h.childNodes.length&&(h=h.childNodes.item(c.startOffset)),c=[h]):c=n.getTextNodes(c,!0);return e.getAppliedStyles(c)};this.isBold=function(c){return g(c,"fo:font-weight","bold")};this.isItalic=function(c){return g(c,"fo:font-style","italic")};this.hasUnderline=
function(c){return g(c,"style:text-underline-style","solid")};this.hasStrikeThrough=function(c){return g(c,"style:text-line-through-style","solid")};this.isAlignedLeft=function(e){return c(e,"fo:text-align",["left","start"])};this.isAlignedCenter=function(e){return c(e,"fo:text-align",["center"])};this.isAlignedRight=function(e){return c(e,"fo:text-align",["right","end"])};this.isAlignedJustified=function(e){return c(e,"fo:text-align",["justify"])}};
// Input 43
core.RawDeflate=function(){function e(){this.dl=this.fc=0}function g(){this.extra_bits=this.static_tree=this.dyn_tree=null;this.max_code=this.max_length=this.elems=this.extra_base=0}function c(a,b,d,c){this.good_length=a;this.max_lazy=b;this.nice_length=d;this.max_chain=c}function n(){this.next=null;this.len=0;this.ptr=[];this.ptr.length=q;this.off=0}var q=8192,m,h,l,r,d=null,f,a,b,k,p,t,y,w,x,v,u,s,H,z,C,I,L,V,P,A,ka,ua,G,X,M,Z,J,E,B,Y,U,Q,N,K,ba,ma,ga,ca,R,$,W,ia,da,aa,ja,oa,F,ea,D,Ea,ra,sa=[0,
0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],za=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],O=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],ya=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],na;na=[new c(0,0,0,0),new c(4,4,8,4),new c(4,5,16,8),new c(4,6,32,32),new c(4,4,16,16),new c(8,16,32,32),new c(8,16,128,128),new c(8,32,128,256),new c(32,128,258,1024),new c(32,258,258,4096)];var va=function(b){d[a+f++]=b;if(a+f===q){var c;if(0!==f){null!==m?(b=m,m=m.next):b=new n;
b.next=null;b.len=b.off=0;null===h?h=l=b:l=l.next=b;b.len=f-a;for(c=0;c<b.len;c++)b.ptr[c]=d[a+c];f=a=0}}},ta=function(b){b&=65535;a+f<q-2?(d[a+f++]=b&255,d[a+f++]=b>>>8):(va(b&255),va(b>>>8))},Da=function(){u=(u<<5^k[L+3-1]&255)&8191;s=y[32768+u];y[L&32767]=s;y[32768+u]=L},fa=function(a,b){x>16-b?(w|=a<<x,ta(w),w=a>>16-x,x+=b-16):(w|=a<<x,x+=b)},pa=function(a,b){fa(b[a].fc,b[a].dl)},Fa=function(a,b,d){return a[b].fc<a[d].fc||a[b].fc===a[d].fc&&ga[b]<=ga[d]},T=function(a,b,d){var c;for(c=0;c<d&&ra<
Ea.length;c++)a[b+c]=Ea.charCodeAt(ra++)&255;return c},S=function(){var a,b,d=65536-A-L;if(-1===d)d--;else if(65274<=L){for(a=0;32768>a;a++)k[a]=k[a+32768];V-=32768;L-=32768;v-=32768;for(a=0;8192>a;a++)b=y[32768+a],y[32768+a]=32768<=b?b-32768:0;for(a=0;32768>a;a++)b=y[a],y[a]=32768<=b?b-32768:0;d+=32768}P||(a=T(k,L+A,d),0>=a?P=!0:A+=a)},wa=function(a){var b=ka,d=L,c,f=I,e=32506<L?L-32506:0,h=L+258,g=k[d+f-1],p=k[d+f];I>=X&&(b>>=2);do if(c=a,k[c+f]===p&&k[c+f-1]===g&&k[c]===k[d]&&k[++c]===k[d+1]){d+=
2;c++;do++d;while(k[d]===k[++c]&&k[++d]===k[++c]&&k[++d]===k[++c]&&k[++d]===k[++c]&&k[++d]===k[++c]&&k[++d]===k[++c]&&k[++d]===k[++c]&&k[++d]===k[++c]&&d<h);c=258-(h-d);d=h-258;if(c>f){V=a;f=c;if(258<=c)break;g=k[d+f-1];p=k[d+f]}a=y[a&32767]}while(a>e&&0!==--b);return f},la=function(a,b){t[da++]=b;0===a?M[b].fc++:(a--,M[ca[b]+256+1].fc++,Z[(256>a?R[a]:R[256+(a>>7)])&255].fc++,p[aa++]=a,oa|=F);F<<=1;0===(da&7)&&(ia[ja++]=oa,oa=0,F=1);if(2<G&&0===(da&4095)){var d=8*da,c=L-v,f;for(f=0;30>f;f++)d+=Z[f].fc*
(5+za[f]);d>>=3;if(aa<parseInt(da/2,10)&&d<parseInt(c/2,10))return!0}return 8191===da||8192===aa},ha=function(a,b){for(var d=K[b],c=b<<1;c<=ba;){c<ba&&Fa(a,K[c+1],K[c])&&c++;if(Fa(a,d,K[c]))break;K[b]=K[c];b=c;c<<=1}K[b]=d},qa=function(a,b){var d=0;do d|=a&1,a>>=1,d<<=1;while(0<--b);return d>>1},Ha=function(a,b){var d=[];d.length=16;var c=0,f;for(f=1;15>=f;f++)c=c+N[f-1]<<1,d[f]=c;for(c=0;c<=b;c++)f=a[c].dl,0!==f&&(a[c].fc=qa(d[f]++,f))},Aa=function(a){var b=a.dyn_tree,d=a.static_tree,c=a.elems,f,
e=-1,k=c;ba=0;ma=573;for(f=0;f<c;f++)0!==b[f].fc?(K[++ba]=e=f,ga[f]=0):b[f].dl=0;for(;2>ba;)f=K[++ba]=2>e?++e:0,b[f].fc=1,ga[f]=0,ea--,null!==d&&(D-=d[f].dl);a.max_code=e;for(f=ba>>1;1<=f;f--)ha(b,f);do f=K[1],K[1]=K[ba--],ha(b,1),d=K[1],K[--ma]=f,K[--ma]=d,b[k].fc=b[f].fc+b[d].fc,ga[k]=ga[f]>ga[d]+1?ga[f]:ga[d]+1,b[f].dl=b[d].dl=k,K[1]=k++,ha(b,1);while(2<=ba);K[--ma]=K[1];k=a.dyn_tree;f=a.extra_bits;var c=a.extra_base,d=a.max_code,h=a.max_length,g=a.static_tree,p,l,m,n,q=0;for(l=0;15>=l;l++)N[l]=
0;k[K[ma]].dl=0;for(a=ma+1;573>a;a++)p=K[a],l=k[k[p].dl].dl+1,l>h&&(l=h,q++),k[p].dl=l,p>d||(N[l]++,m=0,p>=c&&(m=f[p-c]),n=k[p].fc,ea+=n*(l+m),null!==g&&(D+=n*(g[p].dl+m)));if(0!==q){do{for(l=h-1;0===N[l];)l--;N[l]--;N[l+1]+=2;N[h]--;q-=2}while(0<q);for(l=h;0!==l;l--)for(p=N[l];0!==p;)f=K[--a],f>d||(k[f].dl!==l&&(ea+=(l-k[f].dl)*k[f].fc,k[f].fc=l),p--)}Ha(b,e)},Ga=function(a,b){var d,c=-1,f,e=a[0].dl,k=0,h=7,g=4;0===e&&(h=138,g=3);a[b+1].dl=65535;for(d=0;d<=b;d++)f=e,e=a[d+1].dl,++k<h&&f===e||(k<
g?B[f].fc+=k:0!==f?(f!==c&&B[f].fc++,B[16].fc++):10>=k?B[17].fc++:B[18].fc++,k=0,c=f,0===e?(h=138,g=3):f===e?(h=6,g=3):(h=7,g=4))},Ba=function(){8<x?ta(w):0<x&&va(w);x=w=0},Ca=function(a,b){var d,c=0,f=0,e=0,k=0,h,g;if(0!==da){do 0===(c&7)&&(k=ia[e++]),d=t[c++]&255,0===(k&1)?pa(d,a):(h=ca[d],pa(h+256+1,a),g=sa[h],0!==g&&(d-=$[h],fa(d,g)),d=p[f++],h=(256>d?R[d]:R[256+(d>>7)])&255,pa(h,b),g=za[h],0!==g&&(d-=W[h],fa(d,g))),k>>=1;while(c<da)}pa(256,a)},Ia=function(a,b){var d,c=-1,f,e=a[0].dl,k=0,h=7,
g=4;0===e&&(h=138,g=3);for(d=0;d<=b;d++)if(f=e,e=a[d+1].dl,!(++k<h&&f===e)){if(k<g){do pa(f,B);while(0!==--k)}else 0!==f?(f!==c&&(pa(f,B),k--),pa(16,B),fa(k-3,2)):10>=k?(pa(17,B),fa(k-3,3)):(pa(18,B),fa(k-11,7));k=0;c=f;0===e?(h=138,g=3):f===e?(h=6,g=3):(h=7,g=4)}},xa=function(){var a;for(a=0;286>a;a++)M[a].fc=0;for(a=0;30>a;a++)Z[a].fc=0;for(a=0;19>a;a++)B[a].fc=0;M[256].fc=1;oa=da=aa=ja=ea=D=0;F=1},Ja=function(a){var b,d,c,f;f=L-v;ia[ja]=oa;Aa(Y);Aa(U);Ga(M,Y.max_code);Ga(Z,U.max_code);Aa(Q);for(c=
18;3<=c&&0===B[ya[c]].dl;c--);ea+=3*(c+1)+14;b=ea+3+7>>3;d=D+3+7>>3;d<=b&&(b=d);if(f+4<=b&&0<=v)for(fa(0+a,3),Ba(),ta(f),ta(~f),c=0;c<f;c++)va(k[v+c]);else if(d===b)fa(2+a,3),Ca(J,E);else{fa(4+a,3);f=Y.max_code+1;b=U.max_code+1;c+=1;fa(f-257,5);fa(b-1,5);fa(c-4,4);for(d=0;d<c;d++)fa(B[ya[d]].dl,3);Ia(M,f-1);Ia(Z,b-1);Ca(M,Z)}xa();0!==a&&Ba()},Ka=function(b,c,e){var k,g,p;for(k=0;null!==h&&k<e;){g=e-k;g>h.len&&(g=h.len);for(p=0;p<g;p++)b[c+k+p]=h.ptr[h.off+p];h.off+=g;h.len-=g;k+=g;0===h.len&&(g=h,
h=h.next,g.next=m,m=g)}if(k===e)return k;if(a<f){g=e-k;g>f-a&&(g=f-a);for(p=0;p<g;p++)b[c+k+p]=d[a+p];a+=g;k+=g;f===a&&(f=a=0)}return k},La=function(d,c,e){var g;if(!r){if(!P){x=w=0;var p,l;if(0===E[0].dl){Y.dyn_tree=M;Y.static_tree=J;Y.extra_bits=sa;Y.extra_base=257;Y.elems=286;Y.max_length=15;Y.max_code=0;U.dyn_tree=Z;U.static_tree=E;U.extra_bits=za;U.extra_base=0;U.elems=30;U.max_length=15;U.max_code=0;Q.dyn_tree=B;Q.static_tree=null;Q.extra_bits=O;Q.extra_base=0;Q.elems=19;Q.max_length=7;for(l=
p=Q.max_code=0;28>l;l++)for($[l]=p,g=0;g<1<<sa[l];g++)ca[p++]=l;ca[p-1]=l;for(l=p=0;16>l;l++)for(W[l]=p,g=0;g<1<<za[l];g++)R[p++]=l;for(p>>=7;30>l;l++)for(W[l]=p<<7,g=0;g<1<<za[l]-7;g++)R[256+p++]=l;for(g=0;15>=g;g++)N[g]=0;for(g=0;143>=g;)J[g++].dl=8,N[8]++;for(;255>=g;)J[g++].dl=9,N[9]++;for(;279>=g;)J[g++].dl=7,N[7]++;for(;287>=g;)J[g++].dl=8,N[8]++;Ha(J,287);for(g=0;30>g;g++)E[g].dl=5,E[g].fc=qa(g,5);xa()}for(g=0;8192>g;g++)y[32768+g]=0;ua=na[G].max_lazy;X=na[G].good_length;ka=na[G].max_chain;
v=L=0;A=T(k,0,65536);if(0>=A)P=!0,A=0;else{for(P=!1;262>A&&!P;)S();for(g=u=0;2>g;g++)u=(u<<5^k[g]&255)&8191}h=null;a=f=0;3>=G?(I=2,C=0):(C=2,z=0);b=!1}r=!0;if(0===A)return b=!0,0}g=Ka(d,c,e);if(g===e)return e;if(b)return g;if(3>=G)for(;0!==A&&null===h;){Da();0!==s&&32506>=L-s&&(C=wa(s),C>A&&(C=A));if(3<=C)if(l=la(L-V,C-3),A-=C,C<=ua){C--;do L++,Da();while(0!==--C);L++}else L+=C,C=0,u=k[L]&255,u=(u<<5^k[L+1]&255)&8191;else l=la(0,k[L]&255),A--,L++;l&&(Ja(0),v=L);for(;262>A&&!P;)S()}else for(;0!==A&&
null===h;){Da();I=C;H=V;C=2;0!==s&&I<ua&&32506>=L-s&&(C=wa(s),C>A&&(C=A),3===C&&4096<L-V&&C--);if(3<=I&&C<=I){l=la(L-1-H,I-3);A-=I-1;I-=2;do L++,Da();while(0!==--I);z=0;C=2;L++;l&&(Ja(0),v=L)}else 0!==z?la(0,k[L-1]&255)&&(Ja(0),v=L):z=1,L++,A--;for(;262>A&&!P;)S()}0===A&&(0!==z&&la(0,k[L-1]&255),Ja(1),b=!0);return g+Ka(d,g+c,e-g)};this.deflate=function(a,b){var c,f;Ea=a;ra=0;"undefined"===String(typeof b)&&(b=6);(c=b)?1>c?c=1:9<c&&(c=9):c=6;G=c;P=r=!1;if(null===d){m=h=l=null;d=[];d.length=q;k=[];
k.length=65536;p=[];p.length=8192;t=[];t.length=32832;y=[];y.length=65536;M=[];M.length=573;for(c=0;573>c;c++)M[c]=new e;Z=[];Z.length=61;for(c=0;61>c;c++)Z[c]=new e;J=[];J.length=288;for(c=0;288>c;c++)J[c]=new e;E=[];E.length=30;for(c=0;30>c;c++)E[c]=new e;B=[];B.length=39;for(c=0;39>c;c++)B[c]=new e;Y=new g;U=new g;Q=new g;N=[];N.length=16;K=[];K.length=573;ga=[];ga.length=573;ca=[];ca.length=256;R=[];R.length=512;$=[];$.length=29;W=[];W.length=30;ia=[];ia.length=1024}var n=Array(1024),v=[],s=[];
for(c=La(n,0,n.length);0<c;){s.length=c;for(f=0;f<c;f++)s[f]=String.fromCharCode(n[f]);v[v.length]=s.join("");c=La(n,0,n.length)}Ea="";return v.join("")}};
// Input 44
runtime.loadClass("odf.Namespaces");
gui.ImageSelector=function(e){function g(){var c=e.getSizer(),g,m;g=q.createElement("div");g.id="imageSelector";g.style.borderWidth="1px";c.appendChild(g);n.forEach(function(d){m=q.createElement("div");m.className=d;g.appendChild(m)});return g}var c=odf.Namespaces.svgns,n="topLeft topRight bottomRight bottomLeft topMiddle rightMiddle bottomMiddle leftMiddle".split(" "),q=e.getElement().ownerDocument,m=!1;this.select=function(h){var l,n,d=q.getElementById("imageSelector");d||(d=g());m=!0;l=d.parentNode;
n=h.getBoundingClientRect();var f=l.getBoundingClientRect(),a=e.getZoomLevel();l=(n.left-f.left)/a-1;n=(n.top-f.top)/a-1;d.style.display="block";d.style.left=l+"px";d.style.top=n+"px";d.style.width=h.getAttributeNS(c,"width");d.style.height=h.getAttributeNS(c,"height")};this.clearSelection=function(){var c;m&&(c=q.getElementById("imageSelector"))&&(c.style.display="none");m=!1};this.isSelectorElement=function(c){var e=q.getElementById("imageSelector");return e?c===e||c.parentNode===e:!1}};
// Input 45
runtime.loadClass("odf.OdfCanvas");
odf.CommandLineTools=function(){this.roundTrip=function(e,g,c){return new odf.OdfContainer(e,function(n){if(n.state===odf.OdfContainer.INVALID)return c("Document "+e+" is invalid.");n.state===odf.OdfContainer.DONE?n.saveAs(g,function(e){c(e)}):c("Document was not completely loaded.")})};this.render=function(e,g,c){for(g=g.getElementsByTagName("body")[0];g.firstChild;)g.removeChild(g.firstChild);g=new odf.OdfCanvas(g);g.addListener("statereadychange",function(e){c(e)});g.load(e)}};
// Input 46
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
ops.Member=function(e,g){var c={};this.getMemberId=function(){return e};this.getProperties=function(){return c};this.setProperties=function(e){Object.keys(e).forEach(function(g){c[g]=e[g]})};this.removeProperties=function(e){delete e.fullName;delete e.color;delete e.imageUrl;Object.keys(e).forEach(function(e){c.hasOwnProperty(e)&&delete c[e]})};runtime.assert(Boolean(e),"No memberId was supplied!");g.fullName||(g.fullName=runtime.tr("Unknown Author"));g.color||(g.color="black");g.imageUrl||(g.imageUrl=
"avatar-joe.png");c=g};
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
runtime.loadClass("core.DomUtils");runtime.loadClass("core.PositionFilter");runtime.loadClass("odf.OdfUtils");
(function(){function e(c,e,q){function m(a,b){function d(a){for(var b=0;a&&a.previousSibling;)b+=1,a=a.previousSibling;return b}this.steps=a;this.node=b;this.setIteratorPosition=function(a){a.setUnfilteredPosition(b.parentNode,d(b));do if(e.acceptPosition(a)===t)break;while(a.nextPosition())}}function h(a){return a.nodeType===Node.ELEMENT_NODE&&a.getAttributeNS(d,"nodeId")}function l(a){var b=g;a.setAttributeNS(d,"nodeId",b.toString());g+=1;return b}function r(b,f){var e,k=null;for(b=b.childNodes[f]||
b;!k&&b&&b!==c;)(e=h(b))&&(k=a[e])&&k.node!==b&&(runtime.log("Cloned node detected. Creating new bookmark"),k=null,b.removeAttributeNS(d,"nodeId")),b=b.parentNode;return k}var d="urn:webodf:names:steps",f={},a={},b=new odf.OdfUtils,k=new core.DomUtils,p,t=core.PositionFilter.FilterResult.FILTER_ACCEPT;this.updateCache=function(d,c,e,k){var g;0===e&&b.isParagraph(c)?(g=!0,k||(d+=1)):c.hasChildNodes()&&c.childNodes[e]&&(c=c.childNodes[e],(g=b.isParagraph(c))&&(d+=1));g&&(e=h(c)||l(c),(k=a[e])?k.node===
c?k.steps=d:(runtime.log("Cloned node detected. Creating new bookmark"),e=l(c),k=a[e]=new m(d,c)):k=a[e]=new m(d,c),e=k,d=Math.ceil(e.steps/q)*q,c=f[d],!c||e.steps>c.steps)&&(f[d]=e)};this.setToClosestStep=function(a,b){for(var d=Math.floor(a/q)*q,c;!c&&0!==d;)c=f[d],d-=q;c=c||p;c.setIteratorPosition(b);return c.steps};this.setToClosestDomPoint=function(a,b,d){var e;if(a===c&&0===b)e=p;else if(a===c&&b===c.childNodes.length)e=Object.keys(f).map(function(a){return f[a]}).reduce(function(a,b){return b.steps>
a.steps?b:a},p);else if(e=r(a,b),!e)for(d.setUnfilteredPosition(a,b);!e&&d.previousNode();)e=r(d.container(),d.unfilteredDomOffset());e=e||p;e.setIteratorPosition(d);return e.steps};this.updateCacheAtPoint=function(b,d){var e={};Object.keys(a).map(function(b){return a[b]}).filter(function(a){return a.steps>b}).forEach(function(b){var g=Math.ceil(b.steps/q)*q,p,l;if(k.containsNode(c,b.node)){if(d(b),p=Math.ceil(b.steps/q)*q,l=e[p],!l||b.steps>l.steps)e[p]=b}else delete a[h(b.node)];f[g]===b&&delete f[g]});
Object.keys(e).forEach(function(a){f[a]=e[a]})};p=new function(a,b){this.steps=a;this.node=b;this.setIteratorPosition=function(a){a.setUnfilteredPosition(b,0);do if(e.acceptPosition(a)===t)break;while(a.nextPosition())}}(0,c)}var g=0;ops.StepsTranslator=function(c,g,q,m){function h(){var b=c();b!==r&&(runtime.log("Undo detected. Resetting steps cache"),r=b,d=new e(r,q,m),a=g(r))}function l(a,d){if(!d||q.acceptPosition(a)===b)return!0;for(;a.previousPosition();)if(q.acceptPosition(a)===b){if(d(0,a.container(),
a.unfilteredDomOffset()))return!0;break}for(;a.nextPosition();)if(q.acceptPosition(a)===b){if(d(1,a.container(),a.unfilteredDomOffset()))return!0;break}return!1}var r=c(),d=new e(r,q,m),f=new core.DomUtils,a=g(c()),b=core.PositionFilter.FilterResult.FILTER_ACCEPT;this.convertStepsToDomPoint=function(c){var f,e;0>c&&(runtime.log("warn","Requested steps were negative ("+c+")"),c=0);h();for(f=d.setToClosestStep(c,a);f<c&&a.nextPosition();)(e=q.acceptPosition(a)===b)&&(f+=1),d.updateCache(f,a.container(),
a.unfilteredDomOffset(),e);f!==c&&runtime.log("warn","Requested "+c+" steps but only "+f+" are available");return{node:a.container(),offset:a.unfilteredDomOffset()}};this.convertDomPointToSteps=function(c,e,g){var m;h();f.containsNode(r,c)||(e=0>f.comparePoints(r,0,c,e),c=r,e=e?0:r.childNodes.length);a.setUnfilteredPosition(c,e);l(a,g)||a.setUnfilteredPosition(c,e);g=a.container();e=a.unfilteredDomOffset();c=d.setToClosestDomPoint(g,e,a);if(0>f.comparePoints(a.container(),a.unfilteredDomOffset(),
g,e))return 0<c?c-1:c;for(;(a.container()!==g||a.unfilteredDomOffset()!==e)&&a.nextPosition();)(m=q.acceptPosition(a)===b)&&(c+=1),d.updateCache(c,a.container(),a.unfilteredDomOffset(),m);return c+0};this.prime=function(){var c,f;h();for(c=d.setToClosestStep(0,a);a.nextPosition();)(f=q.acceptPosition(a)===b)&&(c+=1),d.updateCache(c,a.container(),a.unfilteredDomOffset(),f)};this.handleStepsInserted=function(a){h();d.updateCacheAtPoint(a.position,function(b){b.steps+=a.length})};this.handleStepsRemoved=
function(a){h();d.updateCacheAtPoint(a.position,function(b){b.steps-=a.length;0>b.steps&&(b.steps=0)})}};ops.StepsTranslator.PREVIOUS_STEP=0;ops.StepsTranslator.NEXT_STEP=1;return ops.StepsTranslator})();
// Input 48
xmldom.RNG={};
xmldom.RelaxNGParser=function(){function e(d,c){this.message=function(){c&&(d+=1===c.nodeType?" Element ":" Node ",d+=c.nodeName,c.nodeValue&&(d+=" with value '"+c.nodeValue+"'"),d+=".");return d}}function g(c){if(2>=c.e.length)return c;var f={name:c.name,e:c.e.slice(0,2)};return g({name:c.name,e:[f].concat(c.e.slice(2))})}function c(c){c=c.split(":",2);var f="",a;1===c.length?c=["",c[0]]:f=c[0];for(a in l)l[a]===f&&(c[0]=a);return c}function n(d,f){for(var a=0,b,e,h=d.name;d.e&&a<d.e.length;)if(b=d.e[a],
"ref"===b.name){e=f[b.a.name];if(!e)throw b.a.name+" was not defined.";b=d.e.slice(a+1);d.e=d.e.slice(0,a);d.e=d.e.concat(e.e);d.e=d.e.concat(b)}else a+=1,n(b,f);b=d.e;"choice"!==h||b&&b[1]&&"empty"!==b[1].name||(b&&b[0]&&"empty"!==b[0].name?(b[1]=b[0],b[0]={name:"empty"}):(delete d.e,d.name="empty"));if("group"===h||"interleave"===h)"empty"===b[0].name?"empty"===b[1].name?(delete d.e,d.name="empty"):(h=d.name=b[1].name,d.names=b[1].names,b=d.e=b[1].e):"empty"===b[1].name&&(h=d.name=b[0].name,d.names=
b[0].names,b=d.e=b[0].e);"oneOrMore"===h&&"empty"===b[0].name&&(delete d.e,d.name="empty");if("attribute"===h){e=d.names?d.names.length:0;for(var g,l=[],m=[],a=0;a<e;a+=1)g=c(d.names[a]),m[a]=g[0],l[a]=g[1];d.localnames=l;d.namespaces=m}"interleave"===h&&("interleave"===b[0].name?d.e="interleave"===b[1].name?b[0].e.concat(b[1].e):[b[1]].concat(b[0].e):"interleave"===b[1].name&&(d.e=[b[0]].concat(b[1].e)))}function q(c,f){for(var a=0,b;c.e&&a<c.e.length;)b=c.e[a],"elementref"===b.name?(b.id=b.id||
0,c.e[a]=f[b.id]):"element"!==b.name&&q(b,f),a+=1}var m=this,h,l={"http://www.w3.org/XML/1998/namespace":"xml"},r;r=function(d,f,a){var b=[],e,h,m=d.localName,n=[];e=d.attributes;var q=m,x=n,v={},u,s;for(u=0;e&&u<e.length;u+=1)if(s=e.item(u),s.namespaceURI)"http://www.w3.org/2000/xmlns/"===s.namespaceURI&&(l[s.value]=s.localName);else{"name"!==s.localName||"element"!==q&&"attribute"!==q||x.push(s.value);if("name"===s.localName||"combine"===s.localName||"type"===s.localName){var H=s,z;z=s.value;z=
z.replace(/^\s\s*/,"");for(var C=/\s/,I=z.length-1;C.test(z.charAt(I));)I-=1;z=z.slice(0,I+1);H.value=z}v[s.localName]=s.value}e=v;e.combine=e.combine||void 0;d=d.firstChild;q=b;x=n;for(v="";d;){if(d.nodeType===Node.ELEMENT_NODE&&"http://relaxng.org/ns/structure/1.0"===d.namespaceURI){if(u=r(d,f,q))"name"===u.name?x.push(l[u.a.ns]+":"+u.text):"choice"===u.name&&u.names&&u.names.length&&(x=x.concat(u.names),delete u.names),q.push(u)}else d.nodeType===Node.TEXT_NODE&&(v+=d.nodeValue);d=d.nextSibling}d=
v;"value"!==m&&"param"!==m&&(d=/^\s*([\s\S]*\S)?\s*$/.exec(d)[1]);"value"===m&&void 0===e.type&&(e.type="token",e.datatypeLibrary="");"attribute"!==m&&"element"!==m||void 0===e.name||(h=c(e.name),b=[{name:"name",text:h[1],a:{ns:h[0]}}].concat(b),delete e.name);"name"===m||"nsName"===m||"value"===m?void 0===e.ns&&(e.ns=""):delete e.ns;"name"===m&&(h=c(d),e.ns=h[0],d=h[1]);1<b.length&&("define"===m||"oneOrMore"===m||"zeroOrMore"===m||"optional"===m||"list"===m||"mixed"===m)&&(b=[{name:"group",e:g({name:"group",
e:b}).e}]);2<b.length&&"element"===m&&(b=[b[0]].concat({name:"group",e:g({name:"group",e:b.slice(1)}).e}));1===b.length&&"attribute"===m&&b.push({name:"text",text:d});1!==b.length||"choice"!==m&&"group"!==m&&"interleave"!==m?2<b.length&&("choice"===m||"group"===m||"interleave"===m)&&(b=g({name:m,e:b}).e):(m=b[0].name,n=b[0].names,e=b[0].a,d=b[0].text,b=b[0].e);"mixed"===m&&(m="interleave",b=[b[0],{name:"text"}]);"optional"===m&&(m="choice",b=[b[0],{name:"empty"}]);"zeroOrMore"===m&&(m="choice",b=
[{name:"oneOrMore",e:[b[0]]},{name:"empty"}]);if("define"===m&&e.combine){a:{q=e.combine;x=e.name;v=b;for(u=0;a&&u<a.length;u+=1)if(s=a[u],"define"===s.name&&s.a&&s.a.name===x){s.e=[{name:q,e:s.e.concat(v)}];a=s;break a}a=null}if(a)return null}a={name:m};b&&0<b.length&&(a.e=b);for(h in e)if(e.hasOwnProperty(h)){a.a=e;break}void 0!==d&&(a.text=d);n&&0<n.length&&(a.names=n);"element"===m&&(a.id=f.length,f.push(a),a={name:"elementref",id:a.id});return a};this.parseRelaxNGDOM=function(c,f){var a=[],b=
r(c&&c.documentElement,a,void 0),k,g,t={};for(k=0;k<b.e.length;k+=1)g=b.e[k],"define"===g.name?t[g.a.name]=g:"start"===g.name&&(h=g);if(!h)return[new e("No Relax NG start element was found.")];n(h,t);for(k in t)t.hasOwnProperty(k)&&n(t[k],t);for(k=0;k<a.length;k+=1)n(a[k],t);f&&(m.rootPattern=f(h.e[0],a));q(h,a);for(k=0;k<a.length;k+=1)q(a[k],a);m.start=h;m.elements=a;m.nsmap=l;return null}};
// Input 49
runtime.loadClass("core.Cursor");runtime.loadClass("gui.SelectionMover");
ops.OdtCursor=function(e,g){var c=this,n={},q,m,h;this.removeFromOdtDocument=function(){h.remove()};this.move=function(e,h){var d=0;0<e?d=m.movePointForward(e,h):0>=e&&(d=-m.movePointBackward(-e,h));c.handleUpdate();return d};this.handleUpdate=function(){};this.getStepCounter=function(){return m.getStepCounter()};this.getMemberId=function(){return e};this.getNode=function(){return h.getNode()};this.getAnchorNode=function(){return h.getAnchorNode()};this.getSelectedRange=function(){return h.getSelectedRange()};
this.setSelectedRange=function(e,g){h.setSelectedRange(e,g);c.handleUpdate()};this.hasForwardSelection=function(){return h.hasForwardSelection()};this.getOdtDocument=function(){return g};this.getSelectionType=function(){return q};this.setSelectionType=function(c){n.hasOwnProperty(c)?q=c:runtime.log("Invalid selection type: "+c)};this.resetSelectionType=function(){c.setSelectionType(ops.OdtCursor.RangeSelection)};h=new core.Cursor(g.getDOM(),e);m=new gui.SelectionMover(h,g.getRootNode());n[ops.OdtCursor.RangeSelection]=
!0;n[ops.OdtCursor.RegionSelection]=!0;c.resetSelectionType()};ops.OdtCursor.RangeSelection="Range";ops.OdtCursor.RegionSelection="Region";(function(){return ops.OdtCursor})();
// Input 50
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
runtime.loadClass("core.EventNotifier");runtime.loadClass("core.DomUtils");runtime.loadClass("odf.OdfUtils");runtime.loadClass("odf.Namespaces");runtime.loadClass("gui.SelectionMover");runtime.loadClass("core.PositionFilterChain");runtime.loadClass("ops.StepsTranslator");runtime.loadClass("ops.TextPositionFilter");runtime.loadClass("ops.Member");
ops.OdtDocument=function(e){function g(){var a=e.odfContainer().getContentElement(),b=a&&a.localName;runtime.assert("text"===b,"Unsupported content element type '"+b+"' for OdtDocument");return a}function c(){return g().ownerDocument}function n(a){for(;a&&!(a.namespaceURI===odf.Namespaces.officens&&"text"===a.localName||a.namespaceURI===odf.Namespaces.officens&&"annotation"===a.localName);)a=a.parentNode;return a}function q(b){this.acceptPosition=function(c){c=c.container();var d;d="string"===typeof b?
a[b].getNode():b;return n(c)===n(d)?p:t}}function m(a){var b=gui.SelectionMover.createPositionIterator(g());a=w.convertStepsToDomPoint(a);b.setUnfilteredPosition(a.node,a.offset);return b}function h(a,b){return e.getFormatting().getStyleElement(a,b)}function l(a){return h(a,"paragraph")}var r=this,d,f,a={},b={},k=new core.EventNotifier([ops.OdtDocument.signalMemberAdded,ops.OdtDocument.signalMemberUpdated,ops.OdtDocument.signalMemberRemoved,ops.OdtDocument.signalCursorAdded,ops.OdtDocument.signalCursorRemoved,
ops.OdtDocument.signalCursorMoved,ops.OdtDocument.signalParagraphChanged,ops.OdtDocument.signalParagraphStyleModified,ops.OdtDocument.signalCommonStyleCreated,ops.OdtDocument.signalCommonStyleDeleted,ops.OdtDocument.signalTableAdded,ops.OdtDocument.signalOperationExecuted,ops.OdtDocument.signalUndoStackChanged,ops.OdtDocument.signalStepsInserted,ops.OdtDocument.signalStepsRemoved]),p=core.PositionFilter.FilterResult.FILTER_ACCEPT,t=core.PositionFilter.FilterResult.FILTER_REJECT,y,w,x;this.getDOM=
c;this.getRootElement=n;this.getIteratorAtPosition=m;this.convertDomPointToCursorStep=function(a,b,c){return w.convertDomPointToSteps(a,b,c)};this.convertDomToCursorRange=function(a,b){var c,d;c=b&&b(a.anchorNode,a.anchorOffset);c=w.convertDomPointToSteps(a.anchorNode,a.anchorOffset,c);b||a.anchorNode!==a.focusNode||a.anchorOffset!==a.focusOffset?(d=b&&b(a.focusNode,a.focusOffset),d=w.convertDomPointToSteps(a.focusNode,a.focusOffset,d)):d=c;return{position:c,length:d-c}};this.convertCursorToDomRange=
function(a,b){var d=c().createRange(),f,e;f=w.convertStepsToDomPoint(a);b?(e=w.convertStepsToDomPoint(a+b),0<b?(d.setStart(f.node,f.offset),d.setEnd(e.node,e.offset)):(d.setStart(e.node,e.offset),d.setEnd(f.node,f.offset))):d.setStart(f.node,f.offset);return d};this.getStyleElement=h;this.upgradeWhitespacesAtPosition=function(a){a=m(a);var b,c,f;a.previousPosition();a.previousPosition();for(f=-1;1>=f;f+=1){b=a.container();c=a.unfilteredDomOffset();if(b.nodeType===Node.TEXT_NODE&&" "===b.data[c]&&
d.isSignificantWhitespace(b,c)){runtime.assert(" "===b.data[c],"upgradeWhitespaceToElement: textNode.data[offset] should be a literal space");var e=b.ownerDocument.createElementNS(odf.Namespaces.textns,"text:s");e.appendChild(b.ownerDocument.createTextNode(" "));b.deleteData(c,1);0<c&&(b=b.splitText(c));b.parentNode.insertBefore(e,b);b=e;a.moveToEndOfNode(b)}a.nextPosition()}};this.downgradeWhitespacesAtPosition=function(a){var b=m(a),c;a=b.container();for(b=b.unfilteredDomOffset();!d.isSpaceElement(a)&&
a.childNodes[b];)a=a.childNodes[b],b=0;a.nodeType===Node.TEXT_NODE&&(a=a.parentNode);d.isDowngradableSpaceElement(a)&&(b=a.firstChild,c=a.lastChild,f.mergeIntoParent(a),c!==b&&f.normalizeTextNodes(c),f.normalizeTextNodes(b))};this.getParagraphStyleElement=l;this.getParagraphElement=function(a){return d.getParagraphElement(a)};this.getParagraphStyleAttributes=function(a){return(a=l(a))?e.getFormatting().getInheritedStyleAttributes(a):null};this.getTextNodeAtStep=function(b,d){var f=m(b),e=f.container(),
k,h=0,g=null;e.nodeType===Node.TEXT_NODE?(k=e,h=f.unfilteredDomOffset(),0<k.length&&(0<h&&(k=k.splitText(h)),k.parentNode.insertBefore(c().createTextNode(""),k),k=k.previousSibling,h=0)):(k=c().createTextNode(""),h=0,e.insertBefore(k,f.rightNode()));if(d){if(a[d]&&r.getCursorPosition(d)===b){for(g=a[d].getNode();g.nextSibling&&"cursor"===g.nextSibling.localName;)g.parentNode.insertBefore(g.nextSibling,g);0<k.length&&k.nextSibling!==g&&(k=c().createTextNode(""),h=0);g.parentNode.insertBefore(k,g)}}else for(;k.nextSibling&&
"cursor"===k.nextSibling.localName;)k.parentNode.insertBefore(k.nextSibling,k);for(;k.previousSibling&&k.previousSibling.nodeType===Node.TEXT_NODE;)k.previousSibling.appendData(k.data),h=k.previousSibling.length,k=k.previousSibling,k.parentNode.removeChild(k.nextSibling);for(;k.nextSibling&&k.nextSibling.nodeType===Node.TEXT_NODE;)k.appendData(k.nextSibling.data),k.parentNode.removeChild(k.nextSibling);return{textNode:k,offset:h}};this.fixCursorPositions=function(){var b=new core.PositionFilterChain;
b.addFilter("BaseFilter",y);Object.keys(a).forEach(function(c){var d=a[c],f=d.getStepCounter(),e,k,h=!1;b.addFilter("RootFilter",r.createRootFilter(c));c=f.countStepsToPosition(d.getAnchorNode(),0,b);f.isPositionWalkable(b)?0===c&&(h=!0,d.move(0)):(h=!0,e=f.countPositionsToNearestStep(d.getNode(),0,b),k=f.countPositionsToNearestStep(d.getAnchorNode(),0,b),d.move(e),0!==c&&(0<k&&(c+=1),0<e&&(c-=1),f=f.countSteps(c,b),d.move(f),d.move(-f,!0)));h&&r.emit(ops.OdtDocument.signalCursorMoved,d);b.removeFilter("RootFilter")})};
this.getDistanceFromCursor=function(b,c,d){b=a[b];var f,e;runtime.assert(null!==c&&void 0!==c,"OdtDocument.getDistanceFromCursor called without node");b&&(f=w.convertDomPointToSteps(b.getNode(),0),e=w.convertDomPointToSteps(c,d));return e-f};this.getCursorPosition=function(b){return(b=a[b])?w.convertDomPointToSteps(b.getNode(),0):0};this.getCursorSelection=function(b){b=a[b];var c=0,d=0;b&&(c=w.convertDomPointToSteps(b.getNode(),0),d=w.convertDomPointToSteps(b.getAnchorNode(),0));return{position:d,
length:c-d}};this.getPositionFilter=function(){return y};this.getOdfCanvas=function(){return e};this.getRootNode=g;this.addMember=function(a){runtime.assert(void 0===b[a.getMemberId()],"This member already exists");b[a.getMemberId()]=a};this.getMember=function(a){return b.hasOwnProperty(a)?b[a]:null};this.removeMember=function(a){delete b[a]};this.getCursor=function(b){return a[b]};this.getCursors=function(){var b=[],c;for(c in a)a.hasOwnProperty(c)&&b.push(a[c]);return b};this.addCursor=function(b){runtime.assert(Boolean(b),
"OdtDocument::addCursor without cursor");var c=b.getStepCounter().countSteps(1,y),d=b.getMemberId();runtime.assert("string"===typeof d,"OdtDocument::addCursor has cursor without memberid");runtime.assert(!a[d],"OdtDocument::addCursor is adding a duplicate cursor with memberid "+d);b.move(c);a[d]=b};this.removeCursor=function(b){var c=a[b];return c?(c.removeFromOdtDocument(),delete a[b],r.emit(ops.OdtDocument.signalCursorRemoved,b),!0):!1};this.moveCursor=function(b,c,d,f){b=a[b];c=r.convertCursorToDomRange(c,
d);b&&c&&(b.setSelectedRange(c,0<=d),b.setSelectionType(f||ops.OdtCursor.RangeSelection))};this.getFormatting=function(){return e.getFormatting()};this.emit=function(a,b){k.emit(a,b)};this.subscribe=function(a,b){k.subscribe(a,b)};this.unsubscribe=function(a,b){k.unsubscribe(a,b)};this.createRootFilter=function(a){return new q(a)};this.close=function(a){a()};this.destroy=function(a){a()};y=new ops.TextPositionFilter(g);d=new odf.OdfUtils;f=new core.DomUtils;w=new ops.StepsTranslator(g,gui.SelectionMover.createPositionIterator,
y,500);k.subscribe(ops.OdtDocument.signalStepsInserted,w.handleStepsInserted);k.subscribe(ops.OdtDocument.signalStepsRemoved,w.handleStepsRemoved);k.subscribe(ops.OdtDocument.signalOperationExecuted,function(a){var b=a.spec(),c=b.memberid,b=(new Date(b.timestamp)).toISOString(),d=e.odfContainer();a.isEdit&&(c=r.getMember(c).getProperties().fullName,d.setMetadata({"dc:creator":c,"dc:date":b},null),x||(d.incrementEditingCycles(),d.setMetadata(null,["meta:editing-duration","meta:document-statistic"])),
x=a)})};ops.OdtDocument.signalMemberAdded="member/added";ops.OdtDocument.signalMemberUpdated="member/updated";ops.OdtDocument.signalMemberRemoved="member/removed";ops.OdtDocument.signalCursorAdded="cursor/added";ops.OdtDocument.signalCursorRemoved="cursor/removed";ops.OdtDocument.signalCursorMoved="cursor/moved";ops.OdtDocument.signalParagraphChanged="paragraph/changed";ops.OdtDocument.signalTableAdded="table/added";ops.OdtDocument.signalCommonStyleCreated="style/created";
ops.OdtDocument.signalCommonStyleDeleted="style/deleted";ops.OdtDocument.signalParagraphStyleModified="paragraphstyle/modified";ops.OdtDocument.signalOperationExecuted="operation/executed";ops.OdtDocument.signalUndoStackChanged="undo/changed";ops.OdtDocument.signalStepsInserted="steps/inserted";ops.OdtDocument.signalStepsRemoved="steps/removed";(function(){return ops.OdtDocument})();
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
ops.Operation=function(){};ops.Operation.prototype.init=function(e){};ops.Operation.prototype.execute=function(e){};ops.Operation.prototype.spec=function(){};
// Input 52
runtime.loadClass("xmldom.RelaxNGParser");
xmldom.RelaxNG=function(){function e(a){return function(){var b;return function(){void 0===b&&(b=a());return b}}()}function g(a,b){return function(){var c={},d=0;return function(f){var e=f.hash||f.toString();if(c.hasOwnProperty(e))return c[e];c[e]=f=b(f);f.hash=a+d.toString();d+=1;return f}}()}function c(a){return function(){var b={};return function(c){var d,f;if(b.hasOwnProperty(c.localName)){if(f=b[c.localName],d=f[c.namespaceURI],void 0!==d)return d}else b[c.localName]=f={};return f[c.namespaceURI]=
d=a(c)}}()}function n(a,b,c){return function(){var d={},f=0;return function(e,k){var h=b&&b(e,k),g;if(void 0!==h)return h;g=e.hash||e.toString();h=k.hash||k.toString();if(d.hasOwnProperty(g)){if(g=d[g],g.hasOwnProperty(h))return g[h]}else d[g]=g={};g[h]=h=c(e,k);h.hash=a+f.toString();f+=1;return h}}()}function q(a,b){"choice"===b.p1.type?q(a,b.p1):a[b.p1.hash]=b.p1;"choice"===b.p2.type?q(a,b.p2):a[b.p2.hash]=b.p2}function m(a,b){return{type:"element",nc:a,nullable:!1,textDeriv:function(){return z},
startTagOpenDeriv:function(c){return a.contains(c)?k(b,C):z},attDeriv:function(){return z},startTagCloseDeriv:function(){return this}}}function h(){return{type:"list",nullable:!1,hash:"list",textDeriv:function(){return C}}}function l(a,b,c,f){if(b===z)return z;if(f>=c.length)return b;0===f&&(f=0);for(var e=c.item(f);e.namespaceURI===d;){f+=1;if(f>=c.length)return b;e=c.item(f)}return e=l(a,b.attDeriv(a,c.item(f)),c,f+1)}function r(a,b,c){c.e[0].a?(a.push(c.e[0].text),b.push(c.e[0].a.ns)):r(a,b,c.e[0]);
c.e[1].a?(a.push(c.e[1].text),b.push(c.e[1].a.ns)):r(a,b,c.e[1])}var d="http://www.w3.org/2000/xmlns/",f,a,b,k,p,t,y,w,x,v,u,s,H,z={type:"notAllowed",nullable:!1,hash:"notAllowed",nc:void 0,p:void 0,p1:void 0,p2:void 0,textDeriv:function(){return z},startTagOpenDeriv:function(){return z},attDeriv:function(){return z},startTagCloseDeriv:function(){return z},endTagDeriv:function(){return z}},C={type:"empty",nullable:!0,hash:"empty",nc:void 0,p:void 0,p1:void 0,p2:void 0,textDeriv:function(){return z},
startTagOpenDeriv:function(){return z},attDeriv:function(){return z},startTagCloseDeriv:function(){return C},endTagDeriv:function(){return z}},I={type:"text",nullable:!0,hash:"text",nc:void 0,p:void 0,p1:void 0,p2:void 0,textDeriv:function(){return I},startTagOpenDeriv:function(){return z},attDeriv:function(){return z},startTagCloseDeriv:function(){return I},endTagDeriv:function(){return z}};f=n("choice",function(a,b){if(a===z)return b;if(b===z||a===b)return a},function(a,b){var d={},k;q(d,{p1:a,
p2:b});b=a=void 0;for(k in d)d.hasOwnProperty(k)&&(void 0===a?a=d[k]:b=void 0===b?d[k]:f(b,d[k]));return function(a,b){return{type:"choice",nullable:a.nullable||b.nullable,hash:void 0,nc:void 0,p:void 0,p1:a,p2:b,textDeriv:function(c,d){return f(a.textDeriv(c,d),b.textDeriv(c,d))},startTagOpenDeriv:c(function(c){return f(a.startTagOpenDeriv(c),b.startTagOpenDeriv(c))}),attDeriv:function(c,d){return f(a.attDeriv(c,d),b.attDeriv(c,d))},startTagCloseDeriv:e(function(){return f(a.startTagCloseDeriv(),
b.startTagCloseDeriv())}),endTagDeriv:e(function(){return f(a.endTagDeriv(),b.endTagDeriv())})}}(a,b)});a=function(a,b,c){return function(){var d={},f=0;return function(e,k){var h=b&&b(e,k),g,l;if(void 0!==h)return h;g=e.hash||e.toString();h=k.hash||k.toString();g<h&&(l=g,g=h,h=l,l=e,e=k,k=l);if(d.hasOwnProperty(g)){if(g=d[g],g.hasOwnProperty(h))return g[h]}else d[g]=g={};g[h]=h=c(e,k);h.hash=a+f.toString();f+=1;return h}}()}("interleave",function(a,b){if(a===z||b===z)return z;if(a===C)return b;if(b===
C)return a},function(b,d){return{type:"interleave",nullable:b.nullable&&d.nullable,hash:void 0,p1:b,p2:d,textDeriv:function(c,e){return f(a(b.textDeriv(c,e),d),a(b,d.textDeriv(c,e)))},startTagOpenDeriv:c(function(c){return f(u(function(b){return a(b,d)},b.startTagOpenDeriv(c)),u(function(c){return a(b,c)},d.startTagOpenDeriv(c)))}),attDeriv:function(c,e){return f(a(b.attDeriv(c,e),d),a(b,d.attDeriv(c,e)))},startTagCloseDeriv:e(function(){return a(b.startTagCloseDeriv(),d.startTagCloseDeriv())}),endTagDeriv:void 0}});
b=n("group",function(a,b){if(a===z||b===z)return z;if(a===C)return b;if(b===C)return a},function(a,c){return{type:"group",p1:a,p2:c,nullable:a.nullable&&c.nullable,textDeriv:function(d,e){var k=b(a.textDeriv(d,e),c);return a.nullable?f(k,c.textDeriv(d,e)):k},startTagOpenDeriv:function(d){var e=u(function(a){return b(a,c)},a.startTagOpenDeriv(d));return a.nullable?f(e,c.startTagOpenDeriv(d)):e},attDeriv:function(d,e){return f(b(a.attDeriv(d,e),c),b(a,c.attDeriv(d,e)))},startTagCloseDeriv:e(function(){return b(a.startTagCloseDeriv(),
c.startTagCloseDeriv())})}});k=n("after",function(a,b){if(a===z||b===z)return z},function(a,b){return{type:"after",p1:a,p2:b,nullable:!1,textDeriv:function(c,d){return k(a.textDeriv(c,d),b)},startTagOpenDeriv:c(function(c){return u(function(a){return k(a,b)},a.startTagOpenDeriv(c))}),attDeriv:function(c,d){return k(a.attDeriv(c,d),b)},startTagCloseDeriv:e(function(){return k(a.startTagCloseDeriv(),b)}),endTagDeriv:e(function(){return a.nullable?b:z})}});p=g("oneormore",function(a){return a===z?z:
{type:"oneOrMore",p:a,nullable:a.nullable,textDeriv:function(c,d){return b(a.textDeriv(c,d),f(this,C))},startTagOpenDeriv:function(c){var d=this;return u(function(a){return b(a,f(d,C))},a.startTagOpenDeriv(c))},attDeriv:function(c,d){return b(a.attDeriv(c,d),f(this,C))},startTagCloseDeriv:e(function(){return p(a.startTagCloseDeriv())})}});y=n("attribute",void 0,function(a,b){return{type:"attribute",nullable:!1,hash:void 0,nc:a,p:b,p1:void 0,p2:void 0,textDeriv:void 0,startTagOpenDeriv:void 0,attDeriv:function(c,
d){return a.contains(d)&&(b.nullable&&/^\s+$/.test(d.nodeValue)||b.textDeriv(c,d.nodeValue).nullable)?C:z},startTagCloseDeriv:function(){return z},endTagDeriv:void 0}});t=g("value",function(a){return{type:"value",nullable:!1,value:a,textDeriv:function(b,c){return c===a?C:z},attDeriv:function(){return z},startTagCloseDeriv:function(){return this}}});x=g("data",function(a){return{type:"data",nullable:!1,dataType:a,textDeriv:function(){return C},attDeriv:function(){return z},startTagCloseDeriv:function(){return this}}});
u=function V(a,b){return"after"===b.type?k(b.p1,a(b.p2)):"choice"===b.type?f(V(a,b.p1),V(a,b.p2)):b};s=function(a,b,c){var d=c.currentNode;b=b.startTagOpenDeriv(d);b=l(a,b,d.attributes,0);var e=b=b.startTagCloseDeriv(),d=c.currentNode;b=c.firstChild();for(var k=[],h;b;)b.nodeType===Node.ELEMENT_NODE?k.push(b):b.nodeType!==Node.TEXT_NODE||/^\s*$/.test(b.nodeValue)||k.push(b.nodeValue),b=c.nextSibling();0===k.length&&(k=[""]);h=e;for(e=0;h!==z&&e<k.length;e+=1)b=k[e],"string"===typeof b?h=/^\s*$/.test(b)?
f(h,h.textDeriv(a,b)):h.textDeriv(a,b):(c.currentNode=b,h=s(a,h,c));c.currentNode=d;return b=h.endTagDeriv()};w=function(a){var b,c,d;if("name"===a.name)b=a.text,c=a.a.ns,a={name:b,ns:c,hash:"{"+c+"}"+b,contains:function(a){return a.namespaceURI===c&&a.localName===b}};else if("choice"===a.name){b=[];c=[];r(b,c,a);a="";for(d=0;d<b.length;d+=1)a+="{"+c[d]+"}"+b[d]+",";a={hash:a,contains:function(a){var d;for(d=0;d<b.length;d+=1)if(b[d]===a.localName&&c[d]===a.namespaceURI)return!0;return!1}}}else a=
{hash:"anyName",contains:function(){return!0}};return a};v=function P(c,d){var e,k;if("elementref"===c.name){e=c.id||0;c=d[e];if(void 0!==c.name){var g=c;e=d[g.id]={hash:"element"+g.id.toString()};g=m(w(g.e[0]),v(g.e[1],d));for(k in g)g.hasOwnProperty(k)&&(e[k]=g[k]);return e}return c}switch(c.name){case "empty":return C;case "notAllowed":return z;case "text":return I;case "choice":return f(P(c.e[0],d),P(c.e[1],d));case "interleave":e=P(c.e[0],d);for(k=1;k<c.e.length;k+=1)e=a(e,P(c.e[k],d));return e;
case "group":return b(P(c.e[0],d),P(c.e[1],d));case "oneOrMore":return p(P(c.e[0],d));case "attribute":return y(w(c.e[0]),P(c.e[1],d));case "value":return t(c.text);case "data":return e=c.a&&c.a.type,void 0===e&&(e=""),x(e);case "list":return h()}throw"No support for "+c.name;};this.makePattern=function(a,b){var c={},d;for(d in b)b.hasOwnProperty(d)&&(c[d]=b[d]);return d=v(a,c)};this.validate=function(a,b){var c;a.currentNode=a.root;c=s(null,H,a);c.nullable?b(null):(runtime.log("Error in Relax NG validation: "+
c),b(["Error in Relax NG validation: "+c]))};this.init=function(a){H=a}};
// Input 53
runtime.loadClass("xmldom.RelaxNGParser");
xmldom.RelaxNG2=function(){function e(c,e){this.message=function(){e&&(c+=e.nodeType===Node.ELEMENT_NODE?" Element ":" Node ",c+=e.nodeName,e.nodeValue&&(c+=" with value '"+e.nodeValue+"'"),c+=".");return c}}function g(c,e,g,d){return"empty"===c.name?null:q(c,e,g,d)}function c(c,l){if(2!==c.e.length)throw"Element with wrong # of elements: "+c.e.length;for(var n=l.currentNode,d=n?n.nodeType:0,f=null;d>Node.ELEMENT_NODE;){if(d!==Node.COMMENT_NODE&&(d!==Node.TEXT_NODE||!/^\s+$/.test(l.currentNode.nodeValue)))return[new e("Not allowed node of type "+
d+".")];d=(n=l.nextSibling())?n.nodeType:0}if(!n)return[new e("Missing element "+c.names)];if(c.names&&-1===c.names.indexOf(m[n.namespaceURI]+":"+n.localName))return[new e("Found "+n.nodeName+" instead of "+c.names+".",n)];if(l.firstChild()){for(f=g(c.e[1],l,n);l.nextSibling();)if(d=l.currentNode.nodeType,!(l.currentNode&&l.currentNode.nodeType===Node.TEXT_NODE&&/^\s+$/.test(l.currentNode.nodeValue)||d===Node.COMMENT_NODE))return[new e("Spurious content.",l.currentNode)];if(l.parentNode()!==n)return[new e("Implementation error.")]}else f=
g(c.e[1],l,n);l.nextSibling();return f}var n,q,m;q=function(h,l,m,d){var f=h.name,a=null;if("text"===f)a:{for(var b=(h=l.currentNode)?h.nodeType:0;h!==m&&3!==b;){if(1===b){a=[new e("Element not allowed here.",h)];break a}b=(h=l.nextSibling())?h.nodeType:0}l.nextSibling();a=null}else if("data"===f)a=null;else if("value"===f)d!==h.text&&(a=[new e("Wrong value, should be '"+h.text+"', not '"+d+"'",m)]);else if("list"===f)a=null;else if("attribute"===f)a:{if(2!==h.e.length)throw"Attribute with wrong # of elements: "+
h.e.length;f=h.localnames.length;for(a=0;a<f;a+=1){d=m.getAttributeNS(h.namespaces[a],h.localnames[a]);""!==d||m.hasAttributeNS(h.namespaces[a],h.localnames[a])||(d=void 0);if(void 0!==b&&void 0!==d){a=[new e("Attribute defined too often.",m)];break a}b=d}a=void 0===b?[new e("Attribute not found: "+h.names,m)]:g(h.e[1],l,m,b)}else if("element"===f)a=c(h,l);else if("oneOrMore"===f){d=0;do b=l.currentNode,f=q(h.e[0],l,m),d+=1;while(!f&&b!==l.currentNode);1<d?(l.currentNode=b,a=null):a=f}else if("choice"===
f){if(2!==h.e.length)throw"Choice with wrong # of options: "+h.e.length;b=l.currentNode;if("empty"===h.e[0].name){if(f=q(h.e[1],l,m,d))l.currentNode=b;a=null}else{if(f=g(h.e[0],l,m,d))l.currentNode=b,f=q(h.e[1],l,m,d);a=f}}else if("group"===f){if(2!==h.e.length)throw"Group with wrong # of members: "+h.e.length;a=q(h.e[0],l,m)||q(h.e[1],l,m)}else if("interleave"===f)a:{b=h.e.length;d=[b];for(var k=b,p,n,y,w;0<k;){p=0;n=l.currentNode;for(a=0;a<b;a+=1)y=l.currentNode,!0!==d[a]&&d[a]!==y&&(w=h.e[a],(f=
q(w,l,m))?(l.currentNode=y,void 0===d[a]&&(d[a]=!1)):y===l.currentNode||"oneOrMore"===w.name||"choice"===w.name&&("oneOrMore"===w.e[0].name||"oneOrMore"===w.e[1].name)?(p+=1,d[a]=y):(p+=1,d[a]=!0));if(n===l.currentNode&&p===k){a=null;break a}if(0===p){for(a=0;a<b;a+=1)if(!1===d[a]){a=[new e("Interleave does not match.",m)];break a}a=null;break a}for(a=k=0;a<b;a+=1)!0!==d[a]&&(k+=1)}a=null}else throw f+" not allowed in nonEmptyPattern.";return a};this.validate=function(c,e){c.currentNode=c.root;var m=
g(n.e[0],c,c.root);e(m)};this.init=function(c,e){n=c;m=e}};
// Input 54
runtime.loadClass("core.DomUtils");runtime.loadClass("gui.Avatar");runtime.loadClass("ops.OdtCursor");
gui.Caret=function(e,g,c){function n(c){f&&r.parentNode&&(!a||c)&&(c&&void 0!==b&&runtime.clearTimeout(b),a=!0,h.style.opacity=c||"0"===h.style.opacity?"1":"0",b=runtime.setTimeout(function(){a=!1;n(!1)},500))}function q(a,b){var c=a.getBoundingClientRect(),d=0,f=0;c&&b&&(d=Math.max(c.top,b.top),f=Math.min(c.bottom,b.bottom));return f-d}function m(){var a;a=e.getSelectedRange().cloneRange();var b=e.getNode(),c,f=null;b.previousSibling&&(c=b.previousSibling.nodeType===Node.TEXT_NODE?b.previousSibling.textContent.length:
b.previousSibling.childNodes.length,a.setStart(b.previousSibling,0<c?c-1:0),a.setEnd(b.previousSibling,c),(c=a.getBoundingClientRect())&&c.height&&(f=c));b.nextSibling&&(a.setStart(b.nextSibling,0),a.setEnd(b.nextSibling,0<(b.nextSibling.nodeType===Node.TEXT_NODE?b.nextSibling.textContent.length:b.nextSibling.childNodes.length)?1:0),(c=a.getBoundingClientRect())&&c.height&&(!f||q(b,c)>q(b,f))&&(f=c));a=f;b=e.getOdtDocument().getOdfCanvas().getZoomLevel();d&&e.getSelectionType()===ops.OdtCursor.RangeSelection?
h.style.visibility="visible":h.style.visibility="hidden";a?(h.style.top="0",f=k.getBoundingClientRect(h),8>a.height&&(a={top:a.top-(8-a.height)/2,height:8}),h.style.height=k.adaptRangeDifferenceToZoomLevel(a.height,b)+"px",h.style.top=k.adaptRangeDifferenceToZoomLevel(a.top-f.top,b)+"px"):(h.style.height="1em",h.style.top="5%")}var h,l,r,d=!0,f=!1,a=!1,b,k=new core.DomUtils;this.handleUpdate=m;this.refreshCursorBlinking=function(){c||e.getSelectedRange().collapsed?(f=!0,n(!0)):(f=!1,h.style.opacity=
"0")};this.setFocus=function(){f=!0;l.markAsFocussed(!0);n(!0)};this.removeFocus=function(){f=!1;l.markAsFocussed(!1);h.style.opacity="1"};this.show=function(){d=!0;m();l.markAsFocussed(!0)};this.hide=function(){d=!1;m();l.markAsFocussed(!1)};this.setAvatarImageUrl=function(a){l.setImageUrl(a)};this.setColor=function(a){h.style.borderColor=a;l.setColor(a)};this.getCursor=function(){return e};this.getFocusElement=function(){return h};this.toggleHandleVisibility=function(){l.isVisible()?l.hide():l.show()};
this.showHandle=function(){l.show()};this.hideHandle=function(){l.hide()};this.ensureVisible=function(){var a,b,c,d,f=e.getOdtDocument().getOdfCanvas().getElement().parentNode,k;c=f.offsetWidth-f.clientWidth+5;d=f.offsetHeight-f.clientHeight+5;k=h.getBoundingClientRect();a=k.left-c;b=k.top-d;c=k.right+c;d=k.bottom+d;k=f.getBoundingClientRect();b<k.top?f.scrollTop-=k.top-b:d>k.bottom&&(f.scrollTop+=d-k.bottom);a<k.left?f.scrollLeft-=k.left-a:c>k.right&&(f.scrollLeft+=c-k.right);m()};this.destroy=function(a){runtime.clearTimeout(b);
l.destroy(function(b){b?a(b):(r.removeChild(h),a())})};(function(){var a=e.getOdtDocument().getDOM();h=a.createElementNS(a.documentElement.namespaceURI,"span");h.style.top="5%";r=e.getNode();r.appendChild(h);l=new gui.Avatar(r,g);m()})()};
// Input 55
gui.EventManager=function(e){function g(){return e.getOdfCanvas().getElement()}function c(){var c=this,a=[];this.handlers=[];this.isSubscribed=!1;this.handleEvent=function(b){-1===a.indexOf(b)&&(a.push(b),c.handlers.forEach(function(a){a(b)}),runtime.setTimeout(function(){a.splice(a.indexOf(b),1)},0))}}function n(c){var a=c.scrollX,b=c.scrollY;this.restore=function(){c.scrollX===a&&c.scrollY===b||c.scrollTo(a,b)}}function q(c){var a=c.scrollTop,b=c.scrollLeft;this.restore=function(){if(c.scrollTop!==
a||c.scrollLeft!==b)c.scrollTop=a,c.scrollLeft=b}}function m(c,a,b){var d="on"+a,e=!1;c.attachEvent&&(e=c.attachEvent(d,b));!e&&c.addEventListener&&(c.addEventListener(a,b,!1),e=!0);e&&!l[a]||!c.hasOwnProperty(d)||(c[d]=b)}var h=runtime.getWindow(),l={beforecut:!0,beforepaste:!0},r,d;this.subscribe=function(c,a){var b=r[c],e=g();b?(b.handlers.push(a),b.isSubscribed||(b.isSubscribed=!0,m(h,c,b.handleEvent),m(e,c,b.handleEvent),m(d,c,b.handleEvent))):m(e,c,a)};this.unsubscribe=function(c,a){var b=r[c],
d=b&&b.handlers.indexOf(a),e=g();b?-1!==d&&b.handlers.splice(d,1):(b="on"+c,e.detachEvent&&e.detachEvent(b,a),e.removeEventListener&&e.removeEventListener(c,a,!1),e[b]===a&&(e[b]=null))};this.focus=function(){var c,a=g(),b=h.getSelection();if(e.getDOM().activeElement!==g()){for(c=a;c&&!c.scrollTop&&!c.scrollLeft;)c=c.parentNode;c=c?new q(c):new n(h);a.focus();c&&c.restore()}b&&b.extend&&(d.parentNode!==a&&a.appendChild(d),b.collapse(d.firstChild,0),b.extend(d,d.childNodes.length))};(function(){var f=
g(),a=f.ownerDocument;runtime.assert(Boolean(h),"EventManager requires a window object to operate correctly");r={mousedown:new c,mouseup:new c,focus:new c};d=a.createElement("div");d.id="eventTrap";d.setAttribute("contenteditable","true");d.style.position="absolute";d.style.left="-10000px";d.appendChild(a.createTextNode("dummy content"));f.appendChild(d)})()};
// Input 56
runtime.loadClass("gui.SelectionMover");gui.ShadowCursor=function(e){var g=e.getDOM().createRange(),c=!0;this.removeFromOdtDocument=function(){};this.getMemberId=function(){return gui.ShadowCursor.ShadowCursorMemberId};this.getSelectedRange=function(){return g};this.setSelectedRange=function(e,q){g=e;c=!1!==q};this.hasForwardSelection=function(){return c};this.getOdtDocument=function(){return e};this.getSelectionType=function(){return ops.OdtCursor.RangeSelection};g.setStart(e.getRootNode(),0)};
gui.ShadowCursor.ShadowCursorMemberId="";(function(){return gui.ShadowCursor})();
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
gui.UndoManager=function(){};gui.UndoManager.prototype.subscribe=function(e,g){};gui.UndoManager.prototype.unsubscribe=function(e,g){};gui.UndoManager.prototype.setOdtDocument=function(e){};gui.UndoManager.prototype.saveInitialState=function(){};gui.UndoManager.prototype.resetInitialState=function(){};gui.UndoManager.prototype.setPlaybackFunction=function(e){};gui.UndoManager.prototype.hasUndoStates=function(){};gui.UndoManager.prototype.hasRedoStates=function(){};
gui.UndoManager.prototype.moveForward=function(e){};gui.UndoManager.prototype.moveBackward=function(e){};gui.UndoManager.prototype.onOperationExecuted=function(e){};gui.UndoManager.signalUndoStackChanged="undoStackChanged";gui.UndoManager.signalUndoStateCreated="undoStateCreated";gui.UndoManager.signalUndoStateModified="undoStateModified";(function(){return gui.UndoManager})();
// Input 58
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
gui.UndoStateRules=function(){function e(c){return c.spec().optype}function g(c){return c.isEdit}this.getOpType=e;this.isEditOperation=g;this.isPartOfOperationSet=function(c,n){if(c.isEdit){if(0===n.length)return!0;var q;if(q=n[n.length-1].isEdit)a:{q=n.filter(g);var m=e(c),h;b:switch(m){case "RemoveText":case "InsertText":h=!0;break b;default:h=!1}if(h&&m===e(q[0])){if(1===q.length){q=!0;break a}m=q[q.length-2].spec().position;q=q[q.length-1].spec().position;h=c.spec().position;if(q===h-(q-m)){q=
!0;break a}}q=!1}return q}return!0}};
// Input 59
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
ops.EditInfo=function(e,g){function c(){var c=[],e;for(e in q)q.hasOwnProperty(e)&&c.push({memberid:e,time:q[e].time});c.sort(function(c,e){return c.time-e.time});return c}var n,q={};this.getNode=function(){return n};this.getOdtDocument=function(){return g};this.getEdits=function(){return q};this.getSortedEdits=function(){return c()};this.addEdit=function(c,e){q[c]={time:e}};this.clearEdits=function(){q={}};this.destroy=function(c){e.parentNode&&e.removeChild(n);c()};n=g.getDOM().createElementNS("urn:webodf:names:editinfo",
"editinfo");e.insertBefore(n,e.firstChild)};
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
runtime.loadClass("core.DomUtils");
ops.OpAddAnnotation=function(){function e(c,e,d){var f=c.getTextNodeAtStep(d,g);f&&(c=f.textNode,d=c.parentNode,f.offset!==c.length&&c.splitText(f.offset),d.insertBefore(e,c.nextSibling),0===c.length&&d.removeChild(c))}var g,c,n,q,m,h;this.init=function(e){g=e.memberid;c=parseInt(e.timestamp,10);n=parseInt(e.position,10);q=parseInt(e.length,10)||0;m=e.name};this.isEdit=!0;this.execute=function(l){var r={},d=l.getCursor(g),f,a;a=new core.DomUtils;h=l.getDOM();var b=new Date(c),k,p,t,y;f=h.createElementNS(odf.Namespaces.officens,
"office:annotation");f.setAttributeNS(odf.Namespaces.officens,"office:name",m);k=h.createElementNS(odf.Namespaces.dcns,"dc:creator");k.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",g);k.textContent=l.getMember(g).getProperties().fullName;p=h.createElementNS(odf.Namespaces.dcns,"dc:date");p.appendChild(h.createTextNode(b.toISOString()));b=h.createElementNS(odf.Namespaces.textns,"text:list");t=h.createElementNS(odf.Namespaces.textns,"text:list-item");y=h.createElementNS(odf.Namespaces.textns,
"text:p");t.appendChild(y);b.appendChild(t);f.appendChild(k);f.appendChild(p);f.appendChild(b);r.node=f;if(!r.node)return!1;if(q){f=h.createElementNS(odf.Namespaces.officens,"office:annotation-end");f.setAttributeNS(odf.Namespaces.officens,"office:name",m);r.end=f;if(!r.end)return!1;e(l,r.end,n+q)}e(l,r.node,n);l.emit(ops.OdtDocument.signalStepsInserted,{position:n,length:q});d&&(f=h.createRange(),a=a.getElementsByTagNameNS(r.node,odf.Namespaces.textns,"p")[0],f.selectNodeContents(a),d.setSelectedRange(f),
l.emit(ops.OdtDocument.signalCursorMoved,d));l.getOdfCanvas().addAnnotation(r);l.fixCursorPositions();return!0};this.spec=function(){return{optype:"AddAnnotation",memberid:g,timestamp:c,position:n,length:q,name:m}}};
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
ops.OpAddCursor=function(){var e,g;this.init=function(c){e=c.memberid;g=c.timestamp};this.isEdit=!1;this.execute=function(c){var g=c.getCursor(e);if(g)return!1;g=new ops.OdtCursor(e,c);c.addCursor(g);c.emit(ops.OdtDocument.signalCursorAdded,g);return!0};this.spec=function(){return{optype:"AddCursor",memberid:e,timestamp:g}}};
// Input 62
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
runtime.loadClass("ops.Member");ops.OpAddMember=function(){var e,g,c;this.init=function(n){e=n.memberid;g=parseInt(n.timestamp,10);c=n.setProperties};this.isEdit=!1;this.execute=function(g){if(g.getMember(e))return!1;var q=new ops.Member(e,c);g.addMember(q);g.emit(ops.OdtDocument.signalMemberAdded,q);return!0};this.spec=function(){return{optype:"AddMember",memberid:e,timestamp:g,setProperties:c}}};
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
runtime.loadClass("odf.Namespaces");
ops.OpAddStyle=function(){var e,g,c,n,q,m,h=odf.Namespaces.stylens;this.init=function(h){e=h.memberid;g=h.timestamp;c=h.styleName;n=h.styleFamily;q="true"===h.isAutomaticStyle||!0===h.isAutomaticStyle;m=h.setProperties};this.isEdit=!0;this.execute=function(e){var g=e.getOdfCanvas().odfContainer(),d=e.getFormatting(),f=e.getDOM().createElementNS(h,"style:style");if(!f)return!1;m&&d.updateStyle(f,m);f.setAttributeNS(h,"style:family",n);f.setAttributeNS(h,"style:name",c);q?g.rootElement.automaticStyles.appendChild(f):
g.rootElement.styles.appendChild(f);e.getOdfCanvas().refreshCSS();q||e.emit(ops.OdtDocument.signalCommonStyleCreated,{name:c,family:n});return!0};this.spec=function(){return{optype:"AddStyle",memberid:e,timestamp:g,styleName:c,styleFamily:n,isAutomaticStyle:q,setProperties:m}}};
// Input 64
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
runtime.loadClass("core.DomUtils");runtime.loadClass("odf.OdfUtils");runtime.loadClass("odf.TextStyleApplicator");
ops.OpApplyDirectStyling=function(){function e(c,d,f){var a=c.getOdfCanvas().odfContainer(),b=l.splitBoundaries(d),e=h.getTextNodes(d,!1);d={startContainer:d.startContainer,startOffset:d.startOffset,endContainer:d.endContainer,endOffset:d.endOffset};(new odf.TextStyleApplicator(new odf.ObjectNameGenerator(a,g),c.getFormatting(),a.rootElement.automaticStyles)).applyStyle(e,d,f);b.forEach(l.normalizeTextNodes)}var g,c,n,q,m,h=new odf.OdfUtils,l=new core.DomUtils;this.init=function(e){g=e.memberid;c=
e.timestamp;n=parseInt(e.position,10);q=parseInt(e.length,10);m=e.setProperties};this.isEdit=!0;this.execute=function(l){var d=l.convertCursorToDomRange(n,q),f=h.getImpactedParagraphs(d);e(l,d,m);d.detach();l.getOdfCanvas().refreshCSS();l.fixCursorPositions();f.forEach(function(a){l.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:a,memberId:g,timeStamp:c})});l.getOdfCanvas().rerenderAnnotations();return!0};this.spec=function(){return{optype:"ApplyDirectStyling",memberid:g,timestamp:c,
position:n,length:q,setProperties:m}}};
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
ops.OpInsertImage=function(){var e,g,c,n,q,m,h,l,r=odf.Namespaces.drawns,d=odf.Namespaces.svgns,f=odf.Namespaces.textns,a=odf.Namespaces.xlinkns;this.init=function(a){e=a.memberid;g=a.timestamp;c=a.position;n=a.filename;q=a.frameWidth;m=a.frameHeight;h=a.frameStyleName;l=a.frameName};this.isEdit=!0;this.execute=function(b){var k=b.getOdfCanvas(),p=b.getTextNodeAtStep(c,e),t,y;if(!p)return!1;t=p.textNode;y=b.getParagraphElement(t);var p=p.offset!==t.length?t.splitText(p.offset):t.nextSibling,w=b.getDOM(),
x=w.createElementNS(r,"draw:image"),w=w.createElementNS(r,"draw:frame");x.setAttributeNS(a,"xlink:href",n);x.setAttributeNS(a,"xlink:type","simple");x.setAttributeNS(a,"xlink:show","embed");x.setAttributeNS(a,"xlink:actuate","onLoad");w.setAttributeNS(r,"draw:style-name",h);w.setAttributeNS(r,"draw:name",l);w.setAttributeNS(f,"text:anchor-type","as-char");w.setAttributeNS(d,"svg:width",q);w.setAttributeNS(d,"svg:height",m);w.appendChild(x);t.parentNode.insertBefore(w,p);b.emit(ops.OdtDocument.signalStepsInserted,
{position:c,length:1});0===t.length&&t.parentNode.removeChild(t);k.addCssForFrameWithImage(w);k.refreshCSS();b.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:y,memberId:e,timeStamp:g});k.rerenderAnnotations();return!0};this.spec=function(){return{optype:"InsertImage",memberid:e,timestamp:g,filename:n,position:c,frameWidth:q,frameHeight:m,frameStyleName:h,frameName:l}}};
// Input 66
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
ops.OpInsertTable=function(){function e(c,a){var b;if(1===d.length)b=d[0];else if(3===d.length)switch(c){case 0:b=d[0];break;case n-1:b=d[2];break;default:b=d[1]}else b=d[c];if(1===b.length)return b[0];if(3===b.length)switch(a){case 0:return b[0];case q-1:return b[2];default:return b[1]}return b[a]}var g,c,n,q,m,h,l,r,d;this.init=function(f){g=f.memberid;c=f.timestamp;m=f.position;n=f.initialRows;q=f.initialColumns;h=f.tableName;l=f.tableStyleName;r=f.tableColumnStyleName;d=f.tableCellStyleMatrix};
this.isEdit=!0;this.execute=function(d){var a=d.getTextNodeAtStep(m),b=d.getRootNode();if(a){var k=d.getDOM(),p=k.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table"),t=k.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table-column"),y,w,x,v;l&&p.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:style-name",l);h&&p.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:name",h);t.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0",
"table:number-columns-repeated",q);r&&t.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:style-name",r);p.appendChild(t);for(x=0;x<n;x+=1){t=k.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table-row");for(v=0;v<q;v+=1)y=k.createElementNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:table-cell"),(w=e(x,v))&&y.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:table:1.0","table:style-name",w),w=k.createElementNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0",
"text:p"),y.appendChild(w),t.appendChild(y);p.appendChild(t)}a=d.getParagraphElement(a.textNode);b.insertBefore(p,a.nextSibling);d.emit(ops.OdtDocument.signalStepsInserted,{position:m,length:q*n+1});d.getOdfCanvas().refreshSize();d.emit(ops.OdtDocument.signalTableAdded,{tableElement:p,memberId:g,timeStamp:c});d.getOdfCanvas().rerenderAnnotations();return!0}return!1};this.spec=function(){return{optype:"InsertTable",memberid:g,timestamp:c,position:m,initialRows:n,initialColumns:q,tableName:h,tableStyleName:l,
tableColumnStyleName:r,tableCellStyleMatrix:d}}};
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
ops.OpInsertText=function(){var e,g,c,n,q;this.init=function(m){e=m.memberid;g=m.timestamp;c=m.position;n=m.text;q="true"===m.moveCursor||!0===m.moveCursor};this.isEdit=!0;this.execute=function(m){var h,l,r,d=null,f=m.getDOM(),a,b=0,k,p=m.getCursor(e),t;m.upgradeWhitespacesAtPosition(c);if(h=m.getTextNodeAtStep(c)){l=h.textNode;d=l.nextSibling;r=l.parentNode;a=m.getParagraphElement(l);for(t=0;t<n.length;t+=1)if(" "===n[t]&&(0===t||t===n.length-1||" "===n[t-1])||"\t"===n[t])0===b?(h.offset!==l.length&&
(d=l.splitText(h.offset)),0<t&&l.appendData(n.substring(0,t))):b<t&&(b=n.substring(b,t),r.insertBefore(f.createTextNode(b),d)),b=t+1,k=" "===n[t]?"text:s":"text:tab",k=f.createElementNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0",k),k.appendChild(f.createTextNode(n[t])),r.insertBefore(k,d);0===b?l.insertData(h.offset,n):b<n.length&&(h=n.substring(b),r.insertBefore(f.createTextNode(h),d));r=l.parentNode;d=l.nextSibling;r.removeChild(l);r.insertBefore(l,d);0===l.length&&l.parentNode.removeChild(l);
m.emit(ops.OdtDocument.signalStepsInserted,{position:c,length:n.length});p&&q&&(m.moveCursor(e,c+n.length,0),m.emit(ops.OdtDocument.signalCursorMoved,p));0<c&&(1<c&&m.downgradeWhitespacesAtPosition(c-2),m.downgradeWhitespacesAtPosition(c-1));m.downgradeWhitespacesAtPosition(c);m.downgradeWhitespacesAtPosition(c+n.length-1);m.downgradeWhitespacesAtPosition(c+n.length);m.getOdfCanvas().refreshSize();m.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:a,memberId:e,timeStamp:g});m.getOdfCanvas().rerenderAnnotations();
return!0}return!1};this.spec=function(){return{optype:"InsertText",memberid:e,timestamp:g,position:c,text:n,moveCursor:q}}};
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
ops.OpMoveCursor=function(){var e,g,c,n,q;this.init=function(m){e=m.memberid;g=m.timestamp;c=m.position;n=m.length||0;q=m.selectionType||ops.OdtCursor.RangeSelection};this.isEdit=!1;this.execute=function(g){var h=g.getCursor(e),l;if(!h)return!1;l=g.convertCursorToDomRange(c,n);h.setSelectedRange(l,0<=n);h.setSelectionType(q);g.emit(ops.OdtDocument.signalCursorMoved,h);return!0};this.spec=function(){return{optype:"MoveCursor",memberid:e,timestamp:g,position:c,length:n,selectionType:q}}};
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
runtime.loadClass("odf.Namespaces");runtime.loadClass("core.DomUtils");
ops.OpRemoveAnnotation=function(){var e,g,c,n,q;this.init=function(m){e=m.memberid;g=m.timestamp;c=parseInt(m.position,10);n=parseInt(m.length,10);q=new core.DomUtils};this.isEdit=!0;this.execute=function(e){for(var g=e.getIteratorAtPosition(c).container(),l,r,d;g.namespaceURI!==odf.Namespaces.officens||"annotation"!==g.localName;)g=g.parentNode;if(null===g)return!1;(l=g.getAttributeNS(odf.Namespaces.officens,"name"))&&(r=q.getElementsByTagNameNS(e.getRootNode(),odf.Namespaces.officens,"annotation-end").filter(function(c){return l===
c.getAttributeNS(odf.Namespaces.officens,"name")})[0]||null);e.getOdfCanvas().forgetAnnotations();for(d=q.getElementsByTagNameNS(g,"urn:webodf:names:cursor","cursor");d.length;)g.parentNode.insertBefore(d.pop(),g);g.parentNode.removeChild(g);r&&r.parentNode.removeChild(r);e.emit(ops.OdtDocument.signalStepsRemoved,{position:0<c?c-1:c,length:n});e.fixCursorPositions();e.getOdfCanvas().refreshAnnotations();return!0};this.spec=function(){return{optype:"RemoveAnnotation",memberid:e,timestamp:g,position:c,
length:n}}};
// Input 70
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
ops.OpRemoveBlob=function(){var e,g,c;this.init=function(n){e=n.memberid;g=n.timestamp;c=n.filename};this.isEdit=!0;this.execute=function(e){e.getOdfCanvas().odfContainer().removeBlob(c);return!0};this.spec=function(){return{optype:"RemoveBlob",memberid:e,timestamp:g,filename:c}}};
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
ops.OpRemoveCursor=function(){var e,g;this.init=function(c){e=c.memberid;g=c.timestamp};this.isEdit=!1;this.execute=function(c){return c.removeCursor(e)?!0:!1};this.spec=function(){return{optype:"RemoveCursor",memberid:e,timestamp:g}}};
// Input 72
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
runtime.loadClass("ops.Member");ops.OpRemoveMember=function(){var e,g;this.init=function(c){e=c.memberid;g=parseInt(c.timestamp,10)};this.isEdit=!1;this.execute=function(c){if(!c.getMember(e))return!1;c.removeMember(e);c.emit(ops.OdtDocument.signalMemberRemoved,e);return!0};this.spec=function(){return{optype:"RemoveMember",memberid:e,timestamp:g}}};
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
ops.OpRemoveStyle=function(){var e,g,c,n;this.init=function(q){e=q.memberid;g=q.timestamp;c=q.styleName;n=q.styleFamily};this.isEdit=!0;this.execute=function(e){var g=e.getStyleElement(c,n);if(!g)return!1;g.parentNode.removeChild(g);e.getOdfCanvas().refreshCSS();e.emit(ops.OdtDocument.signalCommonStyleDeleted,{name:c,family:n});return!0};this.spec=function(){return{optype:"RemoveStyle",memberid:e,timestamp:g,styleName:c,styleFamily:n}}};
// Input 74
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
runtime.loadClass("odf.Namespaces");runtime.loadClass("odf.OdfUtils");runtime.loadClass("core.DomUtils");
ops.OpRemoveText=function(){function e(c){function d(a){return l.hasOwnProperty(a.namespaceURI)||"br"===a.localName&&m.isLineBreak(a.parentNode)||a.nodeType===Node.TEXT_NODE&&l.hasOwnProperty(a.parentNode.namespaceURI)}function e(a){if(m.isCharacterElement(a))return!1;if(a.nodeType===Node.TEXT_NODE)return 0===a.textContent.length;for(a=a.firstChild;a;){if(l.hasOwnProperty(a.namespaceURI)||!e(a))return!1;a=a.nextSibling}return!0}function a(b){var k;b.nodeType===Node.TEXT_NODE?(k=b.parentNode,k.removeChild(b)):
k=h.removeUnwantedNodes(b,d);return!m.isParagraph(k)&&k!==c&&e(k)?a(k):k}this.isEmpty=e;this.mergeChildrenIntoParent=a}var g,c,n,q,m,h,l={};this.init=function(e){runtime.assert(0<=e.length,"OpRemoveText only supports positive lengths");g=e.memberid;c=e.timestamp;n=parseInt(e.position,10);q=parseInt(e.length,10);m=new odf.OdfUtils;h=new core.DomUtils;l[odf.Namespaces.dbns]=!0;l[odf.Namespaces.dcns]=!0;l[odf.Namespaces.dr3dns]=!0;l[odf.Namespaces.drawns]=!0;l[odf.Namespaces.chartns]=!0;l[odf.Namespaces.formns]=
!0;l[odf.Namespaces.numberns]=!0;l[odf.Namespaces.officens]=!0;l[odf.Namespaces.presentationns]=!0;l[odf.Namespaces.stylens]=!0;l[odf.Namespaces.svgns]=!0;l[odf.Namespaces.tablens]=!0;l[odf.Namespaces.textns]=!0};this.isEdit=!0;this.execute=function(l){var d,f,a,b,k=l.getCursor(g),p=new e(l.getRootNode());l.upgradeWhitespacesAtPosition(n);l.upgradeWhitespacesAtPosition(n+q);f=l.convertCursorToDomRange(n,q);h.splitBoundaries(f);d=l.getParagraphElement(f.startContainer);a=m.getTextElements(f,!1,!0);
b=m.getParagraphElements(f);f.detach();a.forEach(function(a){p.mergeChildrenIntoParent(a)});f=b.reduce(function(a,b){var c,d=!1,e=a,f=b,k,g=null;p.isEmpty(a)&&(d=!0,b.parentNode!==a.parentNode&&(k=b.parentNode,a.parentNode.insertBefore(b,a.nextSibling)),f=a,e=b,g=e.getElementsByTagNameNS("urn:webodf:names:editinfo","editinfo")[0]||e.firstChild);for(;f.hasChildNodes();)c=d?f.lastChild:f.firstChild,f.removeChild(c),"editinfo"!==c.localName&&e.insertBefore(c,g);k&&p.isEmpty(k)&&p.mergeChildrenIntoParent(k);
p.mergeChildrenIntoParent(f);return e});l.emit(ops.OdtDocument.signalStepsRemoved,{position:n,length:q});l.downgradeWhitespacesAtPosition(n);l.fixCursorPositions();l.getOdfCanvas().refreshSize();l.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:f||d,memberId:g,timeStamp:c});k&&(k.resetSelectionType(),l.emit(ops.OdtDocument.signalCursorMoved,k));l.getOdfCanvas().rerenderAnnotations();return!0};this.spec=function(){return{optype:"RemoveText",memberid:g,timestamp:c,position:n,length:q}}};
// Input 75
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
ops.OpSetBlob=function(){var e,g,c,n,q;this.init=function(m){e=m.memberid;g=m.timestamp;c=m.filename;n=m.mimetype;q=m.content};this.isEdit=!0;this.execute=function(e){e.getOdfCanvas().odfContainer().setBlob(c,n,q);return!0};this.spec=function(){return{optype:"SetBlob",memberid:e,timestamp:g,filename:c,mimetype:n,content:q}}};
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
ops.OpSetParagraphStyle=function(){var e,g,c,n;this.init=function(q){e=q.memberid;g=q.timestamp;c=q.position;n=q.styleName};this.isEdit=!0;this.execute=function(q){var m;m=q.getIteratorAtPosition(c);return(m=q.getParagraphElement(m.container()))?(""!==n?m.setAttributeNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","text:style-name",n):m.removeAttributeNS("urn:oasis:names:tc:opendocument:xmlns:text:1.0","style-name"),q.getOdfCanvas().refreshSize(),q.emit(ops.OdtDocument.signalParagraphChanged,
{paragraphElement:m,timeStamp:g,memberId:e}),q.getOdfCanvas().rerenderAnnotations(),!0):!1};this.spec=function(){return{optype:"SetParagraphStyle",memberid:e,timestamp:g,position:c,styleName:n}}};
// Input 77
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
ops.OpSplitParagraph=function(){var e,g,c,n,q;this.init=function(m){e=m.memberid;g=m.timestamp;c=m.position;n="true"===m.moveCursor||!0===m.moveCursor;q=new odf.OdfUtils};this.isEdit=!0;this.execute=function(m){var h,l,r,d,f,a,b,k=m.getCursor(e);m.upgradeWhitespacesAtPosition(c);h=m.getTextNodeAtStep(c);if(!h)return!1;l=m.getParagraphElement(h.textNode);if(!l)return!1;r=q.isListItem(l.parentNode)?l.parentNode:l;0===h.offset?(b=h.textNode.previousSibling,a=null):(b=h.textNode,a=h.offset>=h.textNode.length?
null:h.textNode.splitText(h.offset));for(d=h.textNode;d!==r;){d=d.parentNode;f=d.cloneNode(!1);a&&f.appendChild(a);if(b)for(;b&&b.nextSibling;)f.appendChild(b.nextSibling);else for(;d.firstChild;)f.appendChild(d.firstChild);d.parentNode.insertBefore(f,d.nextSibling);b=d;a=f}q.isListItem(a)&&(a=a.childNodes[0]);0===h.textNode.length&&h.textNode.parentNode.removeChild(h.textNode);m.emit(ops.OdtDocument.signalStepsInserted,{position:c,length:1});k&&n&&(m.moveCursor(e,c+1,0),m.emit(ops.OdtDocument.signalCursorMoved,
k));m.fixCursorPositions();m.getOdfCanvas().refreshSize();m.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:l,memberId:e,timeStamp:g});m.emit(ops.OdtDocument.signalParagraphChanged,{paragraphElement:a,memberId:e,timeStamp:g});m.getOdfCanvas().rerenderAnnotations();return!0};this.spec=function(){return{optype:"SplitParagraph",memberid:e,timestamp:g,position:c,moveCursor:n}}};
// Input 78
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
runtime.loadClass("ops.Member");runtime.loadClass("xmldom.XPath");
ops.OpUpdateMember=function(){function e(){var c="//dc:creator[@editinfo:memberid='"+g+"']",c=xmldom.XPath.getODFElementsWithXPath(m.getRootNode(),c,function(c){return"editinfo"===c?"urn:webodf:names:editinfo":odf.Namespaces.lookupNamespaceURI(c)}),e;for(e=0;e<c.length;e+=1)c[e].textContent=n.fullName}var g,c,n,q,m;this.init=function(e){g=e.memberid;c=parseInt(e.timestamp,10);n=e.setProperties;q=e.removedProperties};this.isEdit=!1;this.execute=function(c){m=c;var l=c.getMember(g);if(!l)return!1;q&&
l.removeProperties(q);n&&(l.setProperties(n),n.fullName&&e());c.emit(ops.OdtDocument.signalMemberUpdated,l);return!0};this.spec=function(){return{optype:"UpdateMember",memberid:g,timestamp:c,setProperties:n,removedProperties:q}}};
// Input 79
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
ops.OpUpdateMetadata=function(){var e,g,c,n;this.init=function(q){e=q.memberid;g=parseInt(q.timestamp,10);c=q.setProperties;n=q.removedProperties};this.isEdit=!0;this.execute=function(e){e=e.getOdfCanvas().odfContainer();var g=[],h=["dc:date","dc:creator","meta:editing-cycles"];c&&h.forEach(function(e){if(c[e])return!1});n&&(h.forEach(function(c){if(-1!==g.indexOf(c))return!1}),g=n.attributes.split(","));e.setMetadata(c,g);return!0};this.spec=function(){return{optype:"UpdateMetadata",memberid:e,timestamp:g,
setProperties:c,removedProperties:n}}};
// Input 80
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
runtime.loadClass("odf.Namespaces");
ops.OpUpdateParagraphStyle=function(){function e(c,e){var d,f,a=e?e.split(","):[];for(d=0;d<a.length;d+=1)f=a[d].split(":"),c.removeAttributeNS(odf.Namespaces.lookupNamespaceURI(f[0]),f[1])}var g,c,n,q,m,h=odf.Namespaces.stylens;this.init=function(e){g=e.memberid;c=e.timestamp;n=e.styleName;q=e.setProperties;m=e.removedProperties};this.isEdit=!0;this.execute=function(c){var g=c.getFormatting(),d,f,a;return(d=""!==n?c.getParagraphStyleElement(n):g.getDefaultStyleElement("paragraph"))?(f=d.getElementsByTagNameNS(h,
"paragraph-properties")[0],a=d.getElementsByTagNameNS(h,"text-properties")[0],q&&g.updateStyle(d,q),m&&(m["style:paragraph-properties"]&&(e(f,m["style:paragraph-properties"].attributes),0===f.attributes.length&&d.removeChild(f)),m["style:text-properties"]&&(e(a,m["style:text-properties"].attributes),0===a.attributes.length&&d.removeChild(a)),e(d,m.attributes)),c.getOdfCanvas().refreshCSS(),c.emit(ops.OdtDocument.signalParagraphStyleModified,n),c.getOdfCanvas().rerenderAnnotations(),!0):!1};this.spec=
function(){return{optype:"UpdateParagraphStyle",memberid:g,timestamp:c,styleName:n,setProperties:q,removedProperties:m}}};
// Input 81
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
runtime.loadClass("ops.OpAddMember");runtime.loadClass("ops.OpUpdateMember");runtime.loadClass("ops.OpRemoveMember");runtime.loadClass("ops.OpAddCursor");runtime.loadClass("ops.OpApplyDirectStyling");runtime.loadClass("ops.OpRemoveCursor");runtime.loadClass("ops.OpMoveCursor");runtime.loadClass("ops.OpSetBlob");runtime.loadClass("ops.OpRemoveBlob");runtime.loadClass("ops.OpInsertImage");runtime.loadClass("ops.OpInsertTable");runtime.loadClass("ops.OpInsertText");runtime.loadClass("ops.OpRemoveText");
runtime.loadClass("ops.OpSplitParagraph");runtime.loadClass("ops.OpSetParagraphStyle");runtime.loadClass("ops.OpUpdateParagraphStyle");runtime.loadClass("ops.OpAddStyle");runtime.loadClass("ops.OpRemoveStyle");runtime.loadClass("ops.OpAddAnnotation");runtime.loadClass("ops.OpRemoveAnnotation");runtime.loadClass("ops.OpUpdateMetadata");
ops.OperationFactory=function(){function e(c){return function(){return new c}}var g;this.register=function(c,e){g[c]=e};this.create=function(c){var e=null,q=g[c.optype];q&&(e=q(c),e.init(c));return e};g={AddMember:e(ops.OpAddMember),UpdateMember:e(ops.OpUpdateMember),RemoveMember:e(ops.OpRemoveMember),AddCursor:e(ops.OpAddCursor),ApplyDirectStyling:e(ops.OpApplyDirectStyling),SetBlob:e(ops.OpSetBlob),RemoveBlob:e(ops.OpRemoveBlob),InsertImage:e(ops.OpInsertImage),InsertTable:e(ops.OpInsertTable),
InsertText:e(ops.OpInsertText),RemoveText:e(ops.OpRemoveText),SplitParagraph:e(ops.OpSplitParagraph),SetParagraphStyle:e(ops.OpSetParagraphStyle),UpdateParagraphStyle:e(ops.OpUpdateParagraphStyle),AddStyle:e(ops.OpAddStyle),RemoveStyle:e(ops.OpRemoveStyle),MoveCursor:e(ops.OpMoveCursor),RemoveCursor:e(ops.OpRemoveCursor),AddAnnotation:e(ops.OpAddAnnotation),RemoveAnnotation:e(ops.OpRemoveAnnotation),UpdateMetadata:e(ops.OpUpdateMetadata)}};
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
ops.OperationRouter=function(){};ops.OperationRouter.prototype.setOperationFactory=function(e){};ops.OperationRouter.prototype.setPlaybackFunction=function(e){};ops.OperationRouter.prototype.push=function(e){};ops.OperationRouter.prototype.close=function(e){};ops.OperationRouter.prototype.subscribe=function(e,g){};ops.OperationRouter.prototype.unsubscribe=function(e,g){};ops.OperationRouter.prototype.hasLocalUnsyncedOps=function(){};ops.OperationRouter.prototype.hasSessionHostConnection=function(){};
// Input 83
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
ops.OperationTransformMatrix=function(){function e(a){a.position+=a.length;a.length*=-1}function g(a){var b=0>a.length;b&&e(a);return b}function c(a,b){var c=[];a&&["style:parent-style-name","style:next-style-name"].forEach(function(d){a[d]===b&&c.push(d)});return c}function n(a,b){a&&["style:parent-style-name","style:next-style-name"].forEach(function(c){a[c]===b&&delete a[c]})}function q(a){var b={};Object.keys(a).forEach(function(c){b[c]="object"===typeof a[c]?q(a[c]):a[c]});return b}function m(a,
b,c,d){var e,f,g=!1,h=!1,l,m,n=d&&d.attributes?d.attributes.split(","):[];a&&(c||0<n.length)&&Object.keys(a).forEach(function(b){e=a[b];"object"!==typeof e&&(l=c&&c[b],void 0!==l?(delete a[b],h=!0,l===e&&(delete c[b],g=!0)):n&&-1!==n.indexOf(b)&&(delete a[b],h=!0))});if(b&&b.attributes&&(c||0<n.length)){m=b.attributes.split(",");for(d=0;d<m.length;d+=1)if(f=m[d],c&&void 0!==c[f]||n&&-1!==n.indexOf(f))m.splice(d,1),d-=1,h=!0;0<m.length?b.attributes=m.join(","):delete b.attributes}return{majorChanged:g,
minorChanged:h}}function h(a){for(var b in a)if(a.hasOwnProperty(b))return!0;return!1}function l(a){for(var b in a)if(a.hasOwnProperty(b)&&("attributes"!==b||0<a.attributes.length))return!0;return!1}function r(a,b,c){var d=a.setProperties?a.setProperties[c]:null,e=a.removedProperties?a.removedProperties[c]:null,f=b.setProperties?b.setProperties[c]:null,g=b.removedProperties?b.removedProperties[c]:null,n;n=m(d,e,f,g);d&&!h(d)&&delete a.setProperties[c];e&&!l(e)&&delete a.removedProperties[c];f&&!h(f)&&
delete b.setProperties[c];g&&!l(g)&&delete b.removedProperties[c];return n}function d(a,b){return{opSpecsA:[a],opSpecsB:[b]}}var f={AddCursor:{AddCursor:d,AddMember:d,AddStyle:d,ApplyDirectStyling:d,InsertText:d,MoveCursor:d,RemoveCursor:d,RemoveMember:d,RemoveStyle:d,RemoveText:d,SetParagraphStyle:d,SplitParagraph:d,UpdateMember:d,UpdateMetadata:d,UpdateParagraphStyle:d},AddMember:{AddStyle:d,InsertText:d,MoveCursor:d,RemoveCursor:d,RemoveStyle:d,RemoveText:d,SetParagraphStyle:d,SplitParagraph:d,
UpdateMetadata:d,UpdateParagraphStyle:d},AddStyle:{AddStyle:d,ApplyDirectStyling:d,InsertText:d,MoveCursor:d,RemoveCursor:d,RemoveMember:d,RemoveStyle:function(a,b){var d,e=[a],f=[b];a.styleFamily===b.styleFamily&&(d=c(a.setProperties,b.styleName),0<d.length&&(d={optype:"UpdateParagraphStyle",memberid:b.memberid,timestamp:b.timestamp,styleName:a.styleName,removedProperties:{attributes:d.join(",")}},f.unshift(d)),n(a.setProperties,b.styleName));return{opSpecsA:e,opSpecsB:f}},RemoveText:d,SetParagraphStyle:d,
SplitParagraph:d,UpdateMember:d,UpdateMetadata:d,UpdateParagraphStyle:d},ApplyDirectStyling:{ApplyDirectStyling:function(a,b,c){var d,e,f,g,l,m,n,s;g=[a];f=[b];if(!(a.position+a.length<=b.position||a.position>=b.position+b.length)){d=c?a:b;e=c?b:a;if(a.position!==b.position||a.length!==b.length)m=q(d),n=q(e);b=r(e,d,"style:text-properties");if(b.majorChanged||b.minorChanged)f=[],a=[],g=d.position+d.length,l=e.position+e.length,e.position<d.position?b.minorChanged&&(s=q(n),s.length=d.position-e.position,
a.push(s),e.position=d.position,e.length=l-e.position):d.position<e.position&&b.majorChanged&&(s=q(m),s.length=e.position-d.position,f.push(s),d.position=e.position,d.length=g-d.position),l>g?b.minorChanged&&(m=n,m.position=g,m.length=l-g,a.push(m),e.length=g-e.position):g>l&&b.majorChanged&&(m.position=l,m.length=g-l,f.push(m),d.length=l-d.position),d.setProperties&&h(d.setProperties)&&f.push(d),e.setProperties&&h(e.setProperties)&&a.push(e),c?(g=f,f=a):g=a}return{opSpecsA:g,opSpecsB:f}},InsertText:function(a,
b){b.position<=a.position?a.position+=b.text.length:b.position<=a.position+a.length&&(a.length+=b.text.length);return{opSpecsA:[a],opSpecsB:[b]}},MoveCursor:d,RemoveCursor:d,RemoveStyle:d,RemoveText:function(a,b){var c=a.position+a.length,d=b.position+b.length,e=[a],f=[b];d<=a.position?a.position-=b.length:b.position<c&&(a.position<b.position?a.length=d<c?a.length-b.length:b.position-a.position:(a.position=b.position,d<c?a.length=c-d:e=[]));return{opSpecsA:e,opSpecsB:f}},SetParagraphStyle:d,SplitParagraph:function(a,
b){b.position<a.position?a.position+=1:b.position<a.position+a.length&&(a.length+=1);return{opSpecsA:[a],opSpecsB:[b]}},UpdateMetadata:d,UpdateParagraphStyle:d},InsertText:{InsertText:function(a,b,c){a.position<b.position?b.position+=a.text.length:a.position>b.position?a.position+=b.text.length:c?b.position+=a.text.length:a.position+=b.text.length;return{opSpecsA:[a],opSpecsB:[b]}},MoveCursor:function(a,b){var c=g(b);a.position<b.position?b.position+=a.text.length:a.position<b.position+b.length&&
(b.length+=a.text.length);c&&e(b);return{opSpecsA:[a],opSpecsB:[b]}},RemoveCursor:d,RemoveMember:d,RemoveStyle:d,RemoveText:function(a,b){var c;c=b.position+b.length;var d=[a],e=[b];c<=a.position?a.position-=b.length:a.position<=b.position?b.position+=a.text.length:(b.length=a.position-b.position,c={optype:"RemoveText",memberid:b.memberid,timestamp:b.timestamp,position:a.position+a.text.length,length:c-a.position},e.unshift(c),a.position=b.position);return{opSpecsA:d,opSpecsB:e}},SplitParagraph:function(a,
b,c){if(a.position<b.position)b.position+=a.text.length;else if(a.position>b.position)a.position+=1;else return c?b.position+=a.text.length:a.position+=1,null;return{opSpecsA:[a],opSpecsB:[b]}},UpdateMember:d,UpdateMetadata:d,UpdateParagraphStyle:d},MoveCursor:{MoveCursor:d,RemoveCursor:function(a,b){return{opSpecsA:a.memberid===b.memberid?[]:[a],opSpecsB:[b]}},RemoveMember:d,RemoveStyle:d,RemoveText:function(a,b){var c=g(a),d=a.position+a.length,f=b.position+b.length;f<=a.position?a.position-=b.length:
b.position<d&&(a.position<b.position?a.length=f<d?a.length-b.length:b.position-a.position:(a.position=b.position,a.length=f<d?d-f:0));c&&e(a);return{opSpecsA:[a],opSpecsB:[b]}},SetParagraphStyle:d,SplitParagraph:function(a,b){var c=g(a);b.position<a.position?a.position+=1:b.position<a.position+a.length&&(a.length+=1);c&&e(a);return{opSpecsA:[a],opSpecsB:[b]}},UpdateMember:d,UpdateMetadata:d,UpdateParagraphStyle:d},RemoveCursor:{RemoveCursor:function(a,b){var c=a.memberid===b.memberid;return{opSpecsA:c?
[]:[a],opSpecsB:c?[]:[b]}},RemoveMember:d,RemoveStyle:d,RemoveText:d,SetParagraphStyle:d,SplitParagraph:d,UpdateMember:d,UpdateMetadata:d,UpdateParagraphStyle:d},RemoveMember:{RemoveStyle:d,RemoveText:d,SetParagraphStyle:d,SplitParagraph:d,UpdateMetadata:d,UpdateParagraphStyle:d},RemoveStyle:{RemoveStyle:function(a,b){var c=a.styleName===b.styleName&&a.styleFamily===b.styleFamily;return{opSpecsA:c?[]:[a],opSpecsB:c?[]:[b]}},RemoveText:d,SetParagraphStyle:function(a,b){var c,d=[a],e=[b];"paragraph"===
a.styleFamily&&a.styleName===b.styleName&&(c={optype:"SetParagraphStyle",memberid:a.memberid,timestamp:a.timestamp,position:b.position,styleName:""},d.unshift(c),b.styleName="");return{opSpecsA:d,opSpecsB:e}},SplitParagraph:d,UpdateMember:d,UpdateMetadata:d,UpdateParagraphStyle:function(a,b){var d,e=[a],f=[b];"paragraph"===a.styleFamily&&(d=c(b.setProperties,a.styleName),0<d.length&&(d={optype:"UpdateParagraphStyle",memberid:a.memberid,timestamp:a.timestamp,styleName:b.styleName,removedProperties:{attributes:d.join(",")}},
e.unshift(d)),a.styleName===b.styleName?f=[]:n(b.setProperties,a.styleName));return{opSpecsA:e,opSpecsB:f}}},RemoveText:{RemoveText:function(a,b){var c=a.position+a.length,d=b.position+b.length,e=[a],f=[b];d<=a.position?a.position-=b.length:c<=b.position?b.position-=a.length:b.position<c&&(a.position<b.position?(a.length=d<c?a.length-b.length:b.position-a.position,c<d?(b.position=a.position,b.length=d-c):f=[]):(c<d?b.length-=a.length:b.position<a.position?b.length=a.position-b.position:f=[],d<c?(a.position=
b.position,a.length=c-d):e=[]));return{opSpecsA:e,opSpecsB:f}},SplitParagraph:function(a,b){var c=a.position+a.length,d=[a],e=[b];b.position<=a.position?a.position+=1:b.position<c&&(a.length=b.position-a.position,c={optype:"RemoveText",memberid:a.memberid,timestamp:a.timestamp,position:b.position+1,length:c-b.position},d.unshift(c));a.position+a.length<=b.position?b.position-=a.length:a.position<b.position&&(b.position=a.position);return{opSpecsA:d,opSpecsB:e}},UpdateMember:d,UpdateMetadata:d,UpdateParagraphStyle:d},
SetParagraphStyle:{UpdateMember:d,UpdateMetadata:d,UpdateParagraphStyle:d},SplitParagraph:{SplitParagraph:function(a,b,c){a.position<b.position?b.position+=1:a.position>b.position?a.position+=1:a.position===b.position&&(c?b.position+=1:a.position+=1);return{opSpecsA:[a],opSpecsB:[b]}},UpdateMember:d,UpdateMetadata:d,UpdateParagraphStyle:d},UpdateMember:{UpdateMetadata:d,UpdateParagraphStyle:d},UpdateMetadata:{UpdateMetadata:function(a,b,c){var d,e=[a],f=[b];d=c?a:b;a=c?b:a;m(a.setProperties||null,
a.removedProperties||null,d.setProperties||null,d.removedProperties||null);d.setProperties&&h(d.setProperties)||d.removedProperties&&l(d.removedProperties)||(c?e=[]:f=[]);a.setProperties&&h(a.setProperties)||a.removedProperties&&l(a.removedProperties)||(c?f=[]:e=[]);return{opSpecsA:e,opSpecsB:f}},UpdateParagraphStyle:d},UpdateParagraphStyle:{UpdateParagraphStyle:function(a,b,c){var d,e=[a],f=[b];a.styleName===b.styleName&&(d=c?a:b,a=c?b:a,r(a,d,"style:paragraph-properties"),r(a,d,"style:text-properties"),
m(a.setProperties||null,a.removedProperties||null,d.setProperties||null,d.removedProperties||null),d.setProperties&&h(d.setProperties)||d.removedProperties&&l(d.removedProperties)||(c?e=[]:f=[]),a.setProperties&&h(a.setProperties)||a.removedProperties&&l(a.removedProperties)||(c?f=[]:e=[]));return{opSpecsA:e,opSpecsB:f}}}};this.passUnchanged=d;this.extendTransformations=function(a){Object.keys(a).forEach(function(b){var c=a[b],d,e=f.hasOwnProperty(b);runtime.log((e?"Extending":"Adding")+" map for optypeA: "+
b);e||(f[b]={});d=f[b];Object.keys(c).forEach(function(a){var e=d.hasOwnProperty(a);runtime.assert(b<=a,"Wrong order:"+b+", "+a);runtime.log("  "+(e?"Overwriting":"Adding")+" entry for optypeB: "+a);d[a]=c[a]})})};this.transformOpspecVsOpspec=function(a,b){var c=a.optype<=b.optype,d;runtime.log("Crosstransforming:");runtime.log(runtime.toJson(a));runtime.log(runtime.toJson(b));c||(d=a,a=b,b=d);(d=(d=f[a.optype])&&d[b.optype])?(d=d(a,b,!c),c||null===d||(d={opSpecsA:d.opSpecsB,opSpecsB:d.opSpecsA})):
d=null;runtime.log("result:");d?(runtime.log(runtime.toJson(d.opSpecsA)),runtime.log(runtime.toJson(d.opSpecsB))):runtime.log("null");return d}};
// Input 84
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
runtime.loadClass("ops.OperationFactory");runtime.loadClass("ops.OperationTransformMatrix");
ops.OperationTransformer=function(){function e(e){var g=[];e.forEach(function(e){g.push(c.create(e))});return g}function g(c,e){for(var h,l,r=[],d=[];0<c.length&&e;){h=c.shift();h=n.transformOpspecVsOpspec(h,e);if(!h)return null;r=r.concat(h.opSpecsA);if(0===h.opSpecsB.length){r=r.concat(c);e=null;break}for(;1<h.opSpecsB.length;){l=g(c,h.opSpecsB.shift());if(!l)return null;d=d.concat(l.opSpecsB);c=l.opSpecsA}e=h.opSpecsB.pop()}e&&d.push(e);return{opSpecsA:r,opSpecsB:d}}var c,n=new ops.OperationTransformMatrix;
this.setOperationFactory=function(e){c=e};this.getOperationTransformMatrix=function(){return n};this.transform=function(c,m){for(var h,l=[];0<m.length;){h=g(c,m.shift());if(!h)return null;c=h.opSpecsA;l=l.concat(h.opSpecsB)}return{opsA:e(c),opsB:e(l)}}};
// Input 85
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
ops.TrivialOperationRouter=function(){var e,g;this.setOperationFactory=function(c){e=c};this.setPlaybackFunction=function(c){g=c};this.push=function(c){c.forEach(function(c){c=c.spec();c.timestamp=(new Date).getTime();c=e.create(c);g(c)})};this.close=function(c){c()};this.subscribe=function(c,e){};this.unsubscribe=function(c,e){};this.hasLocalUnsyncedOps=function(){return!1};this.hasSessionHostConnection=function(){return!0}};
// Input 86
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
runtime.loadClass("ops.EditInfo");runtime.loadClass("gui.EditInfoHandle");
gui.EditInfoMarker=function(e,g){function c(c,a){return runtime.setTimeout(function(){h.style.opacity=c},a)}var n=this,q,m,h,l,r,d;this.addEdit=function(f,a){var b=Date.now()-a;e.addEdit(f,a);m.setEdits(e.getSortedEdits());h.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",f);runtime.clearTimeout(r);runtime.clearTimeout(d);1E4>b?(l=c(1,0),r=c(0.5,1E4-b),d=c(0.2,2E4-b)):1E4<=b&&2E4>b?(l=c(0.5,0),d=c(0.2,2E4-b)):l=c(0.2,0)};this.getEdits=function(){return e.getEdits()};this.clearEdits=
function(){e.clearEdits();m.setEdits([]);h.hasAttributeNS("urn:webodf:names:editinfo","editinfo:memberid")&&h.removeAttributeNS("urn:webodf:names:editinfo","editinfo:memberid")};this.getEditInfo=function(){return e};this.show=function(){h.style.display="block"};this.hide=function(){n.hideHandle();h.style.display="none"};this.showHandle=function(){m.show()};this.hideHandle=function(){m.hide()};this.destroy=function(c){runtime.clearTimeout(l);runtime.clearTimeout(r);runtime.clearTimeout(d);q.removeChild(h);
m.destroy(function(a){a?c(a):e.destroy(c)})};(function(){var c=e.getOdtDocument().getDOM();h=c.createElementNS(c.documentElement.namespaceURI,"div");h.setAttribute("class","editInfoMarker");h.onmouseover=function(){n.showHandle()};h.onmouseout=function(){n.hideHandle()};q=e.getNode();q.appendChild(h);m=new gui.EditInfoHandle(q);g||n.hide()})()};
// Input 87
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
gui.PlainTextPasteboard=function(e,g){function c(c,e){c.init(e);return c}this.createPasteOps=function(n){var q=e.getCursorPosition(g),m=q,h=[];n.replace(/\r/g,"").split("\n").forEach(function(e){h.push(c(new ops.OpSplitParagraph,{memberid:g,position:m,moveCursor:!0}));m+=1;h.push(c(new ops.OpInsertText,{memberid:g,position:m,text:e,moveCursor:!0}));m+=e.length});h.push(c(new ops.OpRemoveText,{memberid:g,position:q,length:1}));return h}};
// Input 88
runtime.loadClass("core.DomUtils");runtime.loadClass("odf.OdfUtils");runtime.loadClass("odf.OdfNodeFilter");runtime.loadClass("gui.SelectionMover");
gui.SelectionView=function(e){function g(){var a=k.getRootNode();p!==a&&(p=a,t=p.parentNode.parentNode.parentNode,t.appendChild(w),t.appendChild(x),t.appendChild(v))}function c(a,b){a.style.left=b.left+"px";a.style.top=b.top+"px";a.style.width=b.width+"px";a.style.height=b.height+"px"}function n(a){H=a;w.style.display=x.style.display=v.style.display=!0===a?"block":"none"}function q(a){var b=s.getBoundingClientRect(t),c=k.getOdfCanvas().getZoomLevel(),d={};d.top=s.adaptRangeDifferenceToZoomLevel(a.top-
b.top,c);d.left=s.adaptRangeDifferenceToZoomLevel(a.left-b.left,c);d.bottom=s.adaptRangeDifferenceToZoomLevel(a.bottom-b.top,c);d.right=s.adaptRangeDifferenceToZoomLevel(a.right-b.left,c);d.width=s.adaptRangeDifferenceToZoomLevel(a.width,c);d.height=s.adaptRangeDifferenceToZoomLevel(a.height,c);return d}function m(a){a=a.getBoundingClientRect();return Boolean(a&&0!==a.height)}function h(a){var b=u.getTextElements(a,!0,!1),c=a.cloneRange(),d=a.cloneRange();a=a.cloneRange();if(!b.length)return null;
var e;a:{e=0;var f=b[e],g=c.startContainer===f?c.startOffset:0,h=g;c.setStart(f,g);for(c.setEnd(f,h);!m(c);){if(f.nodeType===Node.ELEMENT_NODE&&h<f.childNodes.length)h=f.childNodes.length;else if(f.nodeType===Node.TEXT_NODE&&h<f.length)h+=1;else if(b[e])f=b[e],e+=1,g=h=0;else{e=!1;break a}c.setStart(f,g);c.setEnd(f,h)}e=!0}if(!e)return null;a:{e=b.length-1;f=b[e];h=g=d.endContainer===f?d.endOffset:f.length||f.childNodes.length;d.setStart(f,g);for(d.setEnd(f,h);!m(d);){if(f.nodeType===Node.ELEMENT_NODE&&
0<g)g=0;else if(f.nodeType===Node.TEXT_NODE&&0<g)g-=1;else if(b[e])f=b[e],e-=1,g=h=f.length||f.childNodes.length;else{b=!1;break a}d.setStart(f,g);d.setEnd(f,h)}b=!0}if(!b)return null;a.setStart(c.startContainer,c.startOffset);a.setEnd(d.endContainer,d.endOffset);return{firstRange:c,lastRange:d,fillerRange:a}}function l(a,b){var c={};c.top=Math.min(a.top,b.top);c.left=Math.min(a.left,b.left);c.right=Math.max(a.right,b.right);c.bottom=Math.max(a.bottom,b.bottom);c.width=c.right-c.left;c.height=c.bottom-
c.top;return c}function r(a,b){b&&0<b.width&&0<b.height&&(a=a?l(a,b):b);return a}function d(a){function b(a){z.setUnfilteredPosition(a,0);return w.acceptNode(a)===C&&t.acceptPosition(z)===C?C:I}function c(a){var d=null;b(a)===C&&(d=s.getBoundingClientRect(a));return d}var d=a.commonAncestorContainer,e=a.startContainer,f=a.endContainer,g=a.startOffset,h=a.endOffset,l,m,n=null,p,q=y.createRange(),t,w=new odf.OdfNodeFilter,v;if(e===d||f===d)return q=a.cloneRange(),n=q.getBoundingClientRect(),q.detach(),
n;for(a=e;a.parentNode!==d;)a=a.parentNode;for(m=f;m.parentNode!==d;)m=m.parentNode;t=k.createRootFilter(e);for(d=a.nextSibling;d&&d!==m;)p=c(d),n=r(n,p),d=d.nextSibling;if(u.isParagraph(a))n=r(n,s.getBoundingClientRect(a));else if(a.nodeType===Node.TEXT_NODE)d=a,q.setStart(d,g),q.setEnd(d,d===m?h:d.length),p=q.getBoundingClientRect(),n=r(n,p);else for(v=y.createTreeWalker(a,NodeFilter.SHOW_TEXT,b,!1),d=v.currentNode=e;d&&d!==f;)q.setStart(d,g),q.setEnd(d,d.length),p=q.getBoundingClientRect(),n=r(n,
p),l=d,g=0,d=v.nextNode();l||(l=e);if(u.isParagraph(m))n=r(n,s.getBoundingClientRect(m));else if(m.nodeType===Node.TEXT_NODE)d=m,q.setStart(d,d===a?g:0),q.setEnd(d,h),p=q.getBoundingClientRect(),n=r(n,p);else for(v=y.createTreeWalker(m,NodeFilter.SHOW_TEXT,b,!1),d=v.currentNode=f;d&&d!==l;)if(q.setStart(d,0),q.setEnd(d,h),p=q.getBoundingClientRect(),n=r(n,p),d=v.previousNode())h=d.length;return n}function f(a,b){var c=a.getBoundingClientRect(),d={width:0};d.top=c.top;d.bottom=c.bottom;d.height=c.height;
d.left=d.right=b?c.right:c.left;return d}function a(){g();if(e.getSelectionType()===ops.OdtCursor.RangeSelection){n(!0);var a=e.getSelectedRange(),b=h(a),k,m,p,r;a.collapsed||!b?n(!1):(n(!0),a=b.firstRange,k=b.lastRange,b=b.fillerRange,m=q(f(a,!1)),r=q(f(k,!0)),p=(p=d(b))?q(p):l(m,r),c(w,{left:m.left,top:m.top,width:Math.max(0,p.width-(m.left-p.left)),height:m.height}),r.top===m.top||r.bottom===m.bottom?x.style.display=v.style.display="none":(c(v,{left:p.left,top:r.top,width:Math.max(0,r.right-p.left),
height:r.height}),c(x,{left:p.left,top:m.top+m.height,width:Math.max(0,parseFloat(w.style.left)+parseFloat(w.style.width)-parseFloat(v.style.left)),height:Math.max(0,r.top-m.bottom)})),a.detach(),k.detach(),b.detach())}else n(!1)}function b(b){b===e&&a()}var k=e.getOdtDocument(),p,t,y=k.getDOM(),w=y.createElement("div"),x=y.createElement("div"),v=y.createElement("div"),u=new odf.OdfUtils,s=new core.DomUtils,H=!0,z=gui.SelectionMover.createPositionIterator(k.getRootNode()),C=NodeFilter.FILTER_ACCEPT,
I=NodeFilter.FILTER_REJECT;this.show=this.rerender=a;this.hide=function(){n(!1)};this.visible=function(){return H};this.destroy=function(a){t.removeChild(w);t.removeChild(x);t.removeChild(v);e.getOdtDocument().unsubscribe(ops.OdtDocument.signalCursorMoved,b);a()};(function(){var a=e.getMemberId();g();w.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",a);x.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",a);v.setAttributeNS("urn:webodf:names:editinfo","editinfo:memberid",
a);w.className=x.className=v.className="selectionOverlay";e.getOdtDocument().subscribe(ops.OdtDocument.signalCursorMoved,b)})()};
// Input 89
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
runtime.loadClass("gui.SelectionView");
gui.SelectionViewManager=function(){function e(){return Object.keys(g).map(function(c){return g[c]})}var g={};this.getSelectionView=function(c){return g.hasOwnProperty(c)?g[c]:null};this.getSelectionViews=e;this.removeSelectionView=function(c){g.hasOwnProperty(c)&&(g[c].destroy(function(){}),delete g[c])};this.hideSelectionView=function(c){g.hasOwnProperty(c)&&g[c].hide()};this.showSelectionView=function(c){g.hasOwnProperty(c)&&g[c].show()};this.rerenderSelectionViews=function(){Object.keys(g).forEach(function(c){g[c].visible()&&
g[c].rerender()})};this.registerCursor=function(c,e){var q=c.getMemberId(),m=new gui.SelectionView(c);e?m.show():m.hide();return g[q]=m};this.destroy=function(c){var g=e();(function m(e,l){l?c(l):e<g.length?g[e].destroy(function(c){m(e+1,c)}):c()})(0,void 0)}};
// Input 90
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
runtime.loadClass("core.DomUtils");runtime.loadClass("gui.UndoManager");runtime.loadClass("gui.UndoStateRules");
gui.TrivialUndoManager=function(e){function g(){t.emit(gui.UndoManager.signalUndoStackChanged,{undoAvailable:h.hasUndoStates(),redoAvailable:h.hasRedoStates()})}function c(){b!==d&&b!==k[k.length-1]&&k.push(b)}function n(a){var b=a.previousSibling||a.nextSibling;a.parentNode.removeChild(a);l.normalizeTextNodes(b)}function q(a){return Object.keys(a).map(function(b){return a[b]})}function m(b){function c(a){var b=a.spec();if(f[b.memberid])switch(b.optype){case "AddCursor":d[b.memberid]||(d[b.memberid]=
a,delete f[b.memberid],g-=1);break;case "MoveCursor":e[b.memberid]||(e[b.memberid]=a)}}var d={},e={},f={},g,h=b.pop();a.getCursors().forEach(function(a){f[a.getMemberId()]=!0});for(g=Object.keys(f).length;h&&0<g;)h.reverse(),h.forEach(c),h=b.pop();return q(d).concat(q(e))}var h=this,l=new core.DomUtils,r,d=[],f,a,b=[],k=[],p=[],t=new core.EventNotifier([gui.UndoManager.signalUndoStackChanged,gui.UndoManager.signalUndoStateCreated,gui.UndoManager.signalUndoStateModified,gui.TrivialUndoManager.signalDocumentRootReplaced]),
y=e||new gui.UndoStateRules;this.subscribe=function(a,b){t.subscribe(a,b)};this.unsubscribe=function(a,b){t.unsubscribe(a,b)};this.hasUndoStates=function(){return 0<k.length};this.hasRedoStates=function(){return 0<p.length};this.setOdtDocument=function(b){a=b};this.resetInitialState=function(){k.length=0;p.length=0;d.length=0;b.length=0;r=null;g()};this.saveInitialState=function(){var e=a.getOdfCanvas().odfContainer(),f=a.getOdfCanvas().getAnnotationViewManager();f&&f.forgetAnnotations();r=e.rootElement.cloneNode(!0);
a.getOdfCanvas().refreshAnnotations();e=r;l.getElementsByTagNameNS(e,"urn:webodf:names:cursor","cursor").forEach(n);l.getElementsByTagNameNS(e,"urn:webodf:names:cursor","anchor").forEach(n);c();k.unshift(d);b=d=m(k);k.length=0;p.length=0;g()};this.setPlaybackFunction=function(a){f=a};this.onOperationExecuted=function(a){p.length=0;y.isEditOperation(a)&&b===d||!y.isPartOfOperationSet(a,b)?(c(),b=[a],k.push(b),t.emit(gui.UndoManager.signalUndoStateCreated,{operations:b}),g()):(b.push(a),t.emit(gui.UndoManager.signalUndoStateModified,
{operations:b}))};this.moveForward=function(a){for(var c=0,d;a&&p.length;)d=p.pop(),k.push(d),d.forEach(f),a-=1,c+=1;c&&(b=k[k.length-1],g());return c};this.moveBackward=function(c){for(var e=a.getOdfCanvas(),h=e.odfContainer(),l=0;c&&k.length;)p.push(k.pop()),c-=1,l+=1;l&&(h.setRootElement(r.cloneNode(!0)),e.setOdfContainer(h,!0),t.emit(gui.TrivialUndoManager.signalDocumentRootReplaced,{}),a.getCursors().forEach(function(b){a.removeCursor(b.getMemberId())}),d.forEach(f),k.forEach(function(a){a.forEach(f)}),
e.refreshCSS(),b=k[k.length-1]||d,g());return l}};gui.TrivialUndoManager.signalDocumentRootReplaced="documentRootReplaced";(function(){return gui.TrivialUndoManager})();
// Input 91
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
runtime.loadClass("ops.TrivialOperationRouter");runtime.loadClass("ops.OperationFactory");runtime.loadClass("ops.OdtDocument");
ops.Session=function(e){var g=new ops.OperationFactory,c=new ops.OdtDocument(e),n=null;this.setOperationFactory=function(c){g=c;n&&n.setOperationFactory(g)};this.setOperationRouter=function(e){n=e;e.setPlaybackFunction(function(e){return e.execute(c)?(c.emit(ops.OdtDocument.signalOperationExecuted,e),!0):!1});e.setOperationFactory(g)};this.getOperationFactory=function(){return g};this.getOdtDocument=function(){return c};this.enqueue=function(c){n.push(c)};this.close=function(e){n.close(function(g){g?
e(g):c.close(e)})};this.destroy=function(e){c.destroy(e)};this.setOperationRouter(new ops.TrivialOperationRouter)};
// Input 92
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
runtime.loadClass("core.EventNotifier");runtime.loadClass("core.PositionFilter");runtime.loadClass("ops.Session");runtime.loadClass("ops.OpAddAnnotation");runtime.loadClass("ops.OpRemoveAnnotation");runtime.loadClass("gui.SelectionMover");
gui.AnnotationController=function(e,g){function c(){var c=h.getCursor(g),c=c&&c.getNode(),a=!1;if(c){a:{for(a=h.getRootNode();c&&c!==a;){if(c.namespaceURI===d&&"annotation"===c.localName){c=!0;break a}c=c.parentNode}c=!1}a=!c}a!==l&&(l=a,r.emit(gui.AnnotationController.annotatableChanged,l))}function n(d){d.getMemberId()===g&&c()}function q(d){d===g&&c()}function m(d){d.getMemberId()===g&&c()}var h=e.getOdtDocument(),l=!1,r=new core.EventNotifier([gui.AnnotationController.annotatableChanged]),d=odf.Namespaces.officens;
this.isAnnotatable=function(){return l};this.addAnnotation=function(){var c=new ops.OpAddAnnotation,a=h.getCursorSelection(g),b=a.length,a=a.position;l&&(a=0<=b?a:a+b,b=Math.abs(b),c.init({memberid:g,position:a,length:b,name:g+Date.now()}),e.enqueue([c]))};this.removeAnnotation=function(c){var a,b;a=h.convertDomPointToCursorStep(c,0)+1;b=h.convertDomPointToCursorStep(c,c.childNodes.length);c=new ops.OpRemoveAnnotation;c.init({memberid:g,position:a,length:b-a});b=new ops.OpMoveCursor;b.init({memberid:g,
position:0<a?a-1:a,length:0});e.enqueue([c,b])};this.subscribe=function(c,a){r.subscribe(c,a)};this.unsubscribe=function(c,a){r.unsubscribe(c,a)};this.destroy=function(c){h.unsubscribe(ops.OdtDocument.signalCursorAdded,n);h.unsubscribe(ops.OdtDocument.signalCursorRemoved,q);h.unsubscribe(ops.OdtDocument.signalCursorMoved,m);c()};h.subscribe(ops.OdtDocument.signalCursorAdded,n);h.subscribe(ops.OdtDocument.signalCursorRemoved,q);h.subscribe(ops.OdtDocument.signalCursorMoved,m);c()};
gui.AnnotationController.annotatableChanged="annotatable/changed";(function(){return gui.AnnotationController})();
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
runtime.loadClass("core.EventNotifier");runtime.loadClass("core.Utils");runtime.loadClass("odf.OdfUtils");runtime.loadClass("ops.OpAddStyle");runtime.loadClass("ops.OpSetParagraphStyle");runtime.loadClass("gui.StyleHelper");
gui.DirectParagraphStyler=function(e,g,c){function n(){function a(b,d,e){b!==d&&(void 0===c&&(c={}),c[e]=d);return d}var b=p.getCursor(g),b=b&&b.getSelectedRange(),c;v=a(v,b?w.isAlignedLeft(b):!1,"isAlignedLeft");u=a(u,b?w.isAlignedCenter(b):!1,"isAlignedCenter");s=a(s,b?w.isAlignedRight(b):!1,"isAlignedRight");H=a(H,b?w.isAlignedJustified(b):!1,"isAlignedJustified");c&&x.emit(gui.DirectParagraphStyler.paragraphStylingChanged,c)}function q(a){a.getMemberId()===g&&n()}function m(a){a===g&&n()}function h(a){a.getMemberId()===
g&&n()}function l(){n()}function r(a){var b=p.getCursor(g);b&&p.getParagraphElement(b.getNode())===a.paragraphElement&&n()}function d(a){return a===ops.StepsTranslator.NEXT_STEP}function f(a){var b=p.getCursor(g).getSelectedRange(),b=y.getParagraphElements(b),f=p.getFormatting();b.forEach(function(b){var h=p.convertDomPointToCursorStep(b,0,d),k=b.getAttributeNS(odf.Namespaces.textns,"style-name");b=c.generateStyleName();var l;k&&(l=f.createDerivedStyleObject(k,"paragraph",{}));l=a(l||{});k=new ops.OpAddStyle;
k.init({memberid:g,styleName:b,styleFamily:"paragraph",isAutomaticStyle:!0,setProperties:l});l=new ops.OpSetParagraphStyle;l.init({memberid:g,styleName:b,position:h});e.enqueue([k,l])})}function a(a){f(function(b){return t.mergeObjects(b,a)})}function b(b){a({"style:paragraph-properties":{"fo:text-align":b}})}function k(a,b){var c=p.getFormatting().getDefaultTabStopDistance(),d=b["style:paragraph-properties"],d=(d=d&&d["fo:margin-left"])&&y.parseLength(d);return t.mergeObjects(b,{"style:paragraph-properties":{"fo:margin-left":d&&
d.unit===c.unit?d.value+a*c.value+d.unit:a*c.value+c.unit}})}var p=e.getOdtDocument(),t=new core.Utils,y=new odf.OdfUtils,w=new gui.StyleHelper(p.getFormatting()),x=new core.EventNotifier([gui.DirectParagraphStyler.paragraphStylingChanged]),v,u,s,H;this.isAlignedLeft=function(){return v};this.isAlignedCenter=function(){return u};this.isAlignedRight=function(){return s};this.isAlignedJustified=function(){return H};this.alignParagraphLeft=function(){b("left");return!0};this.alignParagraphCenter=function(){b("center");
return!0};this.alignParagraphRight=function(){b("right");return!0};this.alignParagraphJustified=function(){b("justify");return!0};this.indent=function(){f(k.bind(null,1));return!0};this.outdent=function(){f(k.bind(null,-1));return!0};this.subscribe=function(a,b){x.subscribe(a,b)};this.unsubscribe=function(a,b){x.unsubscribe(a,b)};this.destroy=function(a){p.unsubscribe(ops.OdtDocument.signalCursorAdded,q);p.unsubscribe(ops.OdtDocument.signalCursorRemoved,m);p.unsubscribe(ops.OdtDocument.signalCursorMoved,
h);p.unsubscribe(ops.OdtDocument.signalParagraphStyleModified,l);p.unsubscribe(ops.OdtDocument.signalParagraphChanged,r);a()};p.subscribe(ops.OdtDocument.signalCursorAdded,q);p.subscribe(ops.OdtDocument.signalCursorRemoved,m);p.subscribe(ops.OdtDocument.signalCursorMoved,h);p.subscribe(ops.OdtDocument.signalParagraphStyleModified,l);p.subscribe(ops.OdtDocument.signalParagraphChanged,r);n()};gui.DirectParagraphStyler.paragraphStylingChanged="paragraphStyling/changed";(function(){return gui.DirectParagraphStyler})();
// Input 94
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
runtime.loadClass("core.EventNotifier");runtime.loadClass("core.Utils");runtime.loadClass("ops.OpApplyDirectStyling");runtime.loadClass("gui.StyleHelper");
gui.DirectTextStyler=function(e,g){function c(a,b){for(var c=0,d=b[c];d&&a;)a=a[d],c+=1,d=b[c];return b.length===c?a:void 0}function n(a,b){var d=c(a[0],b);return a.every(function(a){return d===c(a,b)})?d:void 0}function q(){var a=u.getCursor(g),a=(a=a&&a.getSelectedRange())&&s.getAppliedStyles(a)||[];a[0]&&z&&(a[0]=v.mergeObjects(a[0],z));return a}function m(){function a(b,d,e){b!==d&&(void 0===c&&(c={}),c[e]=d);return d}var b,c;C=q();I=a(I,C?s.isBold(C):!1,"isBold");L=a(L,C?s.isItalic(C):!1,"isItalic");
V=a(V,C?s.hasUnderline(C):!1,"hasUnderline");P=a(P,C?s.hasStrikeThrough(C):!1,"hasStrikeThrough");b=C&&n(C,["style:text-properties","fo:font-size"]);A=a(A,b&&parseFloat(b),"fontSize");ka=a(ka,C&&n(C,["style:text-properties","style:font-name"]),"fontName");c&&H.emit(gui.DirectTextStyler.textStylingChanged,c)}function h(a){a.getMemberId()===g&&m()}function l(a){a===g&&m()}function r(a){a.getMemberId()===g&&m()}function d(){m()}function f(a){var b=u.getCursor(g);b&&u.getParagraphElement(b.getNode())===
a.paragraphElement&&m()}function a(a,b){var c=u.getCursor(g);if(!c)return!1;c=s.getAppliedStyles(c.getSelectedRange());b(!a(c));return!0}function b(a){var b=u.getCursorSelection(g),c={"style:text-properties":a};0!==b.length?(a=new ops.OpApplyDirectStyling,a.init({memberid:g,position:b.position,length:b.length,setProperties:c}),e.enqueue([a])):(z=v.mergeObjects(z||{},c),m())}function k(a,c){var d={};d[a]=c;b(d)}function p(a){a=a.spec();z&&a.memberid===g&&"SplitParagraph"!==a.optype&&(z=null,m())}function t(a){k("fo:font-weight",
a?"bold":"normal")}function y(a){k("fo:font-style",a?"italic":"normal")}function w(a){k("style:text-underline-style",a?"solid":"none")}function x(a){k("style:text-line-through-style",a?"solid":"none")}var v=new core.Utils,u=e.getOdtDocument(),s=new gui.StyleHelper(u.getFormatting()),H=new core.EventNotifier([gui.DirectTextStyler.textStylingChanged]),z,C=[],I=!1,L=!1,V=!1,P=!1,A,ka;this.formatTextSelection=b;this.createCursorStyleOp=function(a,b){var c=null;z&&(c=new ops.OpApplyDirectStyling,c.init({memberid:g,
position:a,length:b,setProperties:z}),z=null,m());return c};this.setBold=t;this.setItalic=y;this.setHasUnderline=w;this.setHasStrikethrough=x;this.setFontSize=function(a){k("fo:font-size",a+"pt")};this.setFontName=function(a){k("style:font-name",a)};this.getAppliedStyles=function(){return C};this.toggleBold=a.bind(this,s.isBold,t);this.toggleItalic=a.bind(this,s.isItalic,y);this.toggleUnderline=a.bind(this,s.hasUnderline,w);this.toggleStrikethrough=a.bind(this,s.hasStrikeThrough,x);this.isBold=function(){return I};
this.isItalic=function(){return L};this.hasUnderline=function(){return V};this.hasStrikeThrough=function(){return P};this.fontSize=function(){return A};this.fontName=function(){return ka};this.subscribe=function(a,b){H.subscribe(a,b)};this.unsubscribe=function(a,b){H.unsubscribe(a,b)};this.destroy=function(a){u.unsubscribe(ops.OdtDocument.signalCursorAdded,h);u.unsubscribe(ops.OdtDocument.signalCursorRemoved,l);u.unsubscribe(ops.OdtDocument.signalCursorMoved,r);u.unsubscribe(ops.OdtDocument.signalParagraphStyleModified,
d);u.unsubscribe(ops.OdtDocument.signalParagraphChanged,f);u.unsubscribe(ops.OdtDocument.signalOperationExecuted,p);a()};u.subscribe(ops.OdtDocument.signalCursorAdded,h);u.subscribe(ops.OdtDocument.signalCursorRemoved,l);u.subscribe(ops.OdtDocument.signalCursorMoved,r);u.subscribe(ops.OdtDocument.signalParagraphStyleModified,d);u.subscribe(ops.OdtDocument.signalParagraphChanged,f);u.subscribe(ops.OdtDocument.signalOperationExecuted,p);m()};gui.DirectTextStyler.textStylingChanged="textStyling/changed";
(function(){return gui.DirectTextStyler})();
// Input 95
runtime.loadClass("odf.Namespaces");runtime.loadClass("odf.ObjectNameGenerator");
gui.ImageManager=function(e,g,c){var n={"image/gif":".gif","image/jpeg":".jpg","image/png":".png"},q=odf.Namespaces.textns,m=e.getOdtDocument(),h=m.getFormatting(),l={};this.insertImage=function(r,d,f,a){var b;runtime.assert(0<f&&0<a,"Both width and height of the image should be greater than 0px.");b=m.getParagraphElement(m.getCursor(g).getNode()).getAttributeNS(q,"style-name");l.hasOwnProperty(b)||(l[b]=h.getContentSize(b,"paragraph"));b=l[b];f*=0.0264583333333334;a*=0.0264583333333334;var k=1,p=
1;f>b.width&&(k=b.width/f);a>b.height&&(p=b.height/a);k=Math.min(k,p);b=f*k;f=a*k;p=m.getOdfCanvas().odfContainer().rootElement.styles;a=r.toLowerCase();var k=n.hasOwnProperty(a)?n[a]:null,t;a=[];runtime.assert(null!==k,"Image type is not supported: "+r);k="Pictures/"+c.generateImageName()+k;t=new ops.OpSetBlob;t.init({memberid:g,filename:k,mimetype:r,content:d});a.push(t);h.getStyleElement("Graphics","graphic",[p])||(r=new ops.OpAddStyle,r.init({memberid:g,styleName:"Graphics",styleFamily:"graphic",
isAutomaticStyle:!1,setProperties:{"style:graphic-properties":{"text:anchor-type":"paragraph","svg:x":"0cm","svg:y":"0cm","style:wrap":"dynamic","style:number-wrapped-paragraphs":"no-limit","style:wrap-contour":"false","style:vertical-pos":"top","style:vertical-rel":"paragraph","style:horizontal-pos":"center","style:horizontal-rel":"paragraph"}}}),a.push(r));r=c.generateStyleName();d=new ops.OpAddStyle;d.init({memberid:g,styleName:r,styleFamily:"graphic",isAutomaticStyle:!0,setProperties:{"style:parent-style-name":"Graphics",
"style:graphic-properties":{"style:vertical-pos":"top","style:vertical-rel":"baseline","style:horizontal-pos":"center","style:horizontal-rel":"paragraph","fo:background-color":"transparent","style:background-transparency":"100%","style:shadow":"none","style:mirror":"none","fo:clip":"rect(0cm, 0cm, 0cm, 0cm)","draw:luminance":"0%","draw:contrast":"0%","draw:red":"0%","draw:green":"0%","draw:blue":"0%","draw:gamma":"100%","draw:color-inversion":"false","draw:image-opacity":"100%","draw:color-mode":"standard"}}});
a.push(d);t=new ops.OpInsertImage;t.init({memberid:g,position:m.getCursorPosition(g),filename:k,frameWidth:b+"cm",frameHeight:f+"cm",frameStyleName:r,frameName:c.generateFrameName()});a.push(t);e.enqueue(a)}};
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
runtime.loadClass("core.PositionFilter");
gui.TextManipulator=function(e,g,c){function n(c){var d=new ops.OpRemoveText;d.init({memberid:g,position:c.position,length:c.length});return d}function q(c){0>c.length&&(c.position+=c.length,c.length=-c.length);return c}function m(c,d){var e=new core.PositionFilterChain,a=gui.SelectionMover.createPositionIterator(h.getRootElement(c)),b=d?a.nextPosition:a.previousPosition;e.addFilter("BaseFilter",h.getPositionFilter());e.addFilter("RootFilter",h.createRootFilter(g));for(a.setUnfilteredPosition(c,0);b();)if(e.acceptPosition(a)===
l)return!0;return!1}var h=e.getOdtDocument(),l=core.PositionFilter.FilterResult.FILTER_ACCEPT;this.enqueueParagraphSplittingOps=function(){var c=q(h.getCursorSelection(g)),d,f=[];0<c.length&&(d=n(c),f.push(d));d=new ops.OpSplitParagraph;d.init({memberid:g,position:c.position,moveCursor:!0});f.push(d);e.enqueue(f);return!0};this.removeTextByBackspaceKey=function(){var c=h.getCursor(g),d=q(h.getCursorSelection(g)),f=null;0===d.length?m(c.getNode(),!1)&&(f=new ops.OpRemoveText,f.init({memberid:g,position:d.position-
1,length:1}),e.enqueue([f])):(f=n(d),e.enqueue([f]));return null!==f};this.removeTextByDeleteKey=function(){var c=h.getCursor(g),d=q(h.getCursorSelection(g)),f=null;0===d.length?m(c.getNode(),!0)&&(f=new ops.OpRemoveText,f.init({memberid:g,position:d.position,length:1}),e.enqueue([f])):(f=n(d),e.enqueue([f]));return null!==f};this.removeCurrentSelection=function(){var c=q(h.getCursorSelection(g));0!==c.length&&(c=n(c),e.enqueue([c]));return!0};this.insertText=function(l){var d=q(h.getCursorSelection(g)),
f,a=[];0<d.length&&(f=n(d),a.push(f));f=new ops.OpInsertText;f.init({memberid:g,position:d.position,text:l,moveCursor:!0});a.push(f);c&&(l=c(d.position,l.length))&&a.push(l);e.enqueue(a)}};(function(){return gui.TextManipulator})();
// Input 97
runtime.loadClass("core.DomUtils");runtime.loadClass("core.Async");runtime.loadClass("core.ScheduledTask");runtime.loadClass("odf.OdfUtils");runtime.loadClass("odf.ObjectNameGenerator");runtime.loadClass("ops.OdtCursor");runtime.loadClass("ops.OpAddCursor");runtime.loadClass("ops.OpRemoveCursor");runtime.loadClass("ops.StepsTranslator");runtime.loadClass("gui.Clipboard");runtime.loadClass("gui.DirectTextStyler");runtime.loadClass("gui.DirectParagraphStyler");runtime.loadClass("gui.KeyboardHandler");
runtime.loadClass("gui.ImageManager");runtime.loadClass("gui.ImageSelector");runtime.loadClass("gui.TextManipulator");runtime.loadClass("gui.AnnotationController");runtime.loadClass("gui.EventManager");runtime.loadClass("gui.PlainTextPasteboard");
gui.SessionController=function(){var e=core.PositionFilter.FilterResult.FILTER_ACCEPT;gui.SessionController=function(g,c,n,q){function m(a){a.preventDefault?a.preventDefault():a.returnValue=!1}function h(a,b,d){var e=new ops.OpMoveCursor;e.init({memberid:c,position:a,length:b||0,selectionType:d});return e}function l(a){var b=/[A-Za-z0-9]/,c=gui.SelectionMover.createPositionIterator(D.getRootNode()),d;for(c.setUnfilteredPosition(a.startContainer,a.startOffset);c.previousPosition();){d=c.getCurrentNode();
if(d.nodeType===Node.TEXT_NODE){if(d=d.data[c.unfilteredDomOffset()],!b.test(d))break}else if(!sa.isTextSpan(d))break;a.setStart(c.container(),c.unfilteredDomOffset())}c.setUnfilteredPosition(a.endContainer,a.endOffset);do if(d=c.getCurrentNode(),d.nodeType===Node.TEXT_NODE){if(d=d.data[c.unfilteredDomOffset()],!b.test(d))break}else if(!sa.isTextSpan(d))break;while(c.nextPosition());a.setEnd(c.container(),c.unfilteredDomOffset())}function r(a){var b=D.getParagraphElement(a.startContainer),c=D.getParagraphElement(a.endContainer);
b&&a.setStart(b,0);c&&(sa.isParagraph(a.endContainer)&&0===a.endOffset?a.setEndBefore(c):a.setEnd(c,c.childNodes.length))}function d(a){a=D.getDistanceFromCursor(c,a,0);var b=null!==a?a+1:null,d;if(b||a)d=D.getCursorPosition(c),a=h(d+a,b-a,ops.OdtCursor.RegionSelection),g.enqueue([a]);S.focus()}function f(a){var b=0<=ra.comparePoints(a.anchorNode,a.anchorOffset,a.focusNode,a.focusOffset),c=a.focusNode.ownerDocument.createRange();b?(c.setStart(a.anchorNode,a.anchorOffset),c.setEnd(a.focusNode,a.focusOffset)):
(c.setStart(a.focusNode,a.focusOffset),c.setEnd(a.anchorNode,a.anchorOffset));return{range:c,hasForwardSelection:b}}function a(a,b){return b?{anchorNode:a.startContainer,anchorOffset:a.startOffset,focusNode:a.endContainer,focusOffset:a.endOffset}:{anchorNode:a.endContainer,anchorOffset:a.endOffset,focusNode:a.startContainer,focusOffset:a.startOffset}}function b(a){return function(b){var c=a(b);return function(b,d){return a(d)===c}}}function k(d,e,f){var k=D.getOdfCanvas().getElement(),m;m=ra.containsNode(k,
d.startContainer);k=ra.containsNode(k,d.endContainer);if(m||k)if(m&&k&&(2===f?l(d):3<=f&&r(d)),d=a(d,e),e=D.convertDomToCursorRange(d,b(sa.getParagraphElement)),d=D.getCursorSelection(c),e.position!==d.position||e.length!==d.length)d=h(e.position,e.length,ops.OdtCursor.RangeSelection),g.enqueue([d])}function p(a){var b=D.getCursorSelection(c),d=D.getCursor(c).getStepCounter();0!==a&&(a=0<a?d.convertForwardStepsBetweenFilters(a,na,va):-d.convertBackwardStepsBetweenFilters(-a,na,va),a=b.length+a,g.enqueue([h(b.position,
a)]))}function t(a){var b=D.getCursorPosition(c),d=D.getCursor(c).getStepCounter();0!==a&&(a=0<a?d.convertForwardStepsBetweenFilters(a,na,va):-d.convertBackwardStepsBetweenFilters(-a,na,va),g.enqueue([h(b+a,0)]))}function y(){t(-1);return!0}function w(){t(1);return!0}function x(){p(-1);return!0}function v(){p(1);return!0}function u(a,b){var d=D.getParagraphElement(D.getCursor(c).getNode());runtime.assert(Boolean(d),"SessionController: Cursor outside paragraph");d=D.getCursor(c).getStepCounter().countLinesSteps(a,
na);b?p(d):t(d)}function s(){u(-1,!1);return!0}function H(){u(1,!1);return!0}function z(){u(-1,!0);return!0}function C(){u(1,!0);return!0}function I(a,b){var d=D.getCursor(c).getStepCounter().countStepsToLineBoundary(a,na);b?p(d):t(d)}function L(){I(-1,!1);return!0}function V(){I(1,!1);return!0}function P(){I(-1,!0);return!0}function A(){I(1,!0);return!0}function ka(d,e){var f=D.getCursor(c),k=e(f.getNode()),f=a(f.getSelectedRange(),f.hasForwardSelection());runtime.assert(Boolean(k),"SessionController: Cursor outside root");
0>d?(f.focusNode=k,f.focusOffset=0):(f.focusNode=k,f.focusOffset=k.childNodes.length);k=D.convertDomToCursorRange(f,b(e));g.enqueue([h(k.position,k.length)])}function ua(){ka(-1,D.getParagraphElement);return!0}function G(){ka(1,D.getParagraphElement);return!0}function X(a){var b=D.getCursor(c),b=D.getRootElement(b.getNode());runtime.assert(Boolean(b),"SessionController: Cursor outside root");a=0>a?D.convertDomPointToCursorStep(b,0,function(a){return a===ops.StepsTranslator.NEXT_STEP}):D.convertDomPointToCursorStep(b,
b.childNodes.length);g.enqueue([h(a,0)]);return!0}function M(){X(-1);return!0}function Z(){X(1);return!0}function J(){ka(-1,D.getRootElement);return!0}function E(){ka(1,D.getRootElement);return!0}function B(){var a=D.getCursor(c),a=D.getRootElement(a.getNode());runtime.assert(Boolean(a),"SessionController: Cursor outside root");a=D.convertDomToCursorRange({anchorNode:a,anchorOffset:0,focusNode:a,focusOffset:a.childNodes.length},b(D.getRootElement));g.enqueue([h(a.position,a.length)]);return!0}function Y(){var a=
D.getCursor(c);if(a&&a.getSelectionType()===ops.OdtCursor.RegionSelection&&(a=sa.getImageElements(a.getSelectedRange())[0])){Aa.select(a.parentNode);return}Aa.clearSelection()}function U(a){var b=D.getCursor(c).getSelectedRange();b.collapsed?a.preventDefault():za.setDataFromRange(a,b)?qa.removeCurrentSelection():runtime.log("Cut operation failed")}function Q(){return!1!==D.getCursor(c).getSelectedRange().collapsed}function N(a){var b=D.getCursor(c).getSelectedRange();b.collapsed?a.preventDefault():
za.setDataFromRange(a,b)||runtime.log("Copy operation failed")}function K(a){var b;ea.clipboardData&&ea.clipboardData.getData?b=ea.clipboardData.getData("Text"):a.clipboardData&&a.clipboardData.getData&&(b=a.clipboardData.getData("text/plain"));b&&(qa.removeCurrentSelection(),g.enqueue(Ia.createPasteOps(b)));a.preventDefault?a.preventDefault():a.returnValue=!1}function ba(){return!1}function ma(a){if(T)T.onOperationExecuted(a)}function ga(a){D.emit(ops.OdtDocument.signalUndoStackChanged,a)}function ca(){return T?
(T.moveBackward(1),Ca.trigger(),!0):!1}function R(){return T?(T.moveForward(1),Ca.trigger(),!0):!1}function $(){var a=ea.getSelection(),b=0<a.rangeCount&&f(a);ta&&b&&(fa=!0,Aa.clearSelection(),Ga.setUnfilteredPosition(a.focusNode,a.focusOffset),pa.acceptPosition(Ga)===e&&(2===xa?l(b.range):3<=xa&&r(b.range),n.setSelectedRange(b.range,b.hasForwardSelection),D.emit(ops.OdtDocument.signalCursorMoved,n)))}function W(a){var b=a.target||a.srcElement,d=D.getCursor(c);if(ta=b&&ra.containsNode(D.getOdfCanvas().getElement(),
b))fa=!1,pa=D.createRootFilter(b),xa=a.detail,d&&a.shiftKey?ea.getSelection().collapse(d.getAnchorNode(),0):(a=ea.getSelection(),b=d.getSelectedRange(),a.extend?d.hasForwardSelection()?(a.collapse(b.startContainer,b.startOffset),a.extend(b.endContainer,b.endOffset)):(a.collapse(b.endContainer,b.endOffset),a.extend(b.startContainer,b.startOffset)):(a.removeAllRanges(),a.addRange(b.cloneRange()),D.getOdfCanvas().getElement().setActive())),1<xa&&$()}function ia(a){var b=a.target||a.srcElement,c=a.detail,
e=a.clientX,g=a.clientY;Ba.processRequests();sa.isImage(b)&&sa.isCharacterFrame(b.parentNode)?(d(b.parentNode),S.focus()):ta&&!Aa.isSelectorElement(b)&&(fa?(k(n.getSelectedRange(),n.hasForwardSelection(),a.detail),S.focus()):Fa=runtime.setTimeout(function(){var a;a=(a=ea.getSelection())?{anchorNode:a.anchorNode,anchorOffset:a.anchorOffset,focusNode:a.focusNode,focusOffset:a.focusOffset}:null;var b;if(!a.anchorNode&&!a.focusNode){var d=D.getDOM();b=null;d.caretRangeFromPoint?(d=d.caretRangeFromPoint(e,
g),b={container:d.startContainer,offset:d.startOffset}):d.caretPositionFromPoint&&(d=d.caretPositionFromPoint(e,g))&&d.offsetNode&&(b={container:d.offsetNode,offset:d.offset});b&&(a.anchorNode=b.container,a.anchorOffset=b.offset,a.focusNode=a.anchorNode,a.focusOffset=a.anchorOffset)}a.anchorNode&&a.focusNode&&(a=f(a),k(a.range,a.hasForwardSelection,c));S.focus()},0));xa=0;fa=ta=!1}function da(){ta&&S.focus();xa=0;fa=ta=!1}function aa(a){ia(a)}function ja(a){var b=a.target||a.srcElement,c=null;"annotationRemoveButton"===
b.className?(c=ra.getElementsByTagNameNS(b.parentNode,odf.Namespaces.officens,"annotation")[0],wa.removeAnnotation(c)):ia(a)}function oa(a){return function(){a();return!0}}function F(a){return function(b){return D.getCursor(c).getSelectionType()===ops.OdtCursor.RangeSelection?a(b):!0}}var ea=runtime.getWindow(),D=g.getOdtDocument(),Ea=new core.Async,ra=new core.DomUtils,sa=new odf.OdfUtils,za=new gui.Clipboard,O=new gui.KeyboardHandler,ya=new gui.KeyboardHandler,na=new core.PositionFilterChain,va=
D.getPositionFilter(),ta=!1,Da=new odf.ObjectNameGenerator(D.getOdfCanvas().odfContainer(),c),fa=!1,pa=null,Fa,T=null,S=new gui.EventManager(D),wa=new gui.AnnotationController(g,c),la=new gui.DirectTextStyler(g,c),ha=q&&q.directParagraphStylingEnabled?new gui.DirectParagraphStyler(g,c,Da):null,qa=new gui.TextManipulator(g,c,la.createCursorStyleOp),Ha=new gui.ImageManager(g,c,Da),Aa=new gui.ImageSelector(D.getOdfCanvas()),Ga=gui.SelectionMover.createPositionIterator(D.getRootNode()),Ba,Ca,Ia=new gui.PlainTextPasteboard(D,
c),xa=0;runtime.assert(null!==ea,"Expected to be run in an environment which has a global window, like a browser.");na.addFilter("BaseFilter",va);na.addFilter("RootFilter",D.createRootFilter(c));this.selectRange=k;this.moveCursorToLeft=y;this.moveCursorToDocumentStart=M;this.moveCursorToDocumentEnd=Z;this.extendSelectionToDocumentStart=J;this.extendSelectionToDocumentEnd=E;this.extendSelectionToEntireDocument=B;this.startEditing=function(){var a;D.getOdfCanvas().getElement().classList.add("virtualSelections");
S.subscribe("keydown",O.handleEvent);S.subscribe("keypress",ya.handleEvent);S.subscribe("keyup",m);S.subscribe("beforecut",Q);S.subscribe("cut",U);S.subscribe("copy",N);S.subscribe("beforepaste",ba);S.subscribe("paste",K);S.subscribe("mousedown",W);S.subscribe("mousemove",Ba.trigger);S.subscribe("mouseup",ja);S.subscribe("contextmenu",aa);S.subscribe("dragend",da);D.subscribe(ops.OdtDocument.signalOperationExecuted,Ca.trigger);D.subscribe(ops.OdtDocument.signalOperationExecuted,ma);a=new ops.OpAddCursor;
a.init({memberid:c});g.enqueue([a]);T&&T.saveInitialState()};this.endEditing=function(){var a;a=new ops.OpRemoveCursor;a.init({memberid:c});g.enqueue([a]);T&&T.resetInitialState();D.unsubscribe(ops.OdtDocument.signalOperationExecuted,ma);D.unsubscribe(ops.OdtDocument.signalOperationExecuted,Ca.trigger);S.unsubscribe("keydown",O.handleEvent);S.unsubscribe("keypress",ya.handleEvent);S.unsubscribe("keyup",m);S.unsubscribe("cut",U);S.unsubscribe("beforecut",Q);S.unsubscribe("copy",N);S.unsubscribe("paste",
K);S.unsubscribe("beforepaste",ba);S.unsubscribe("mousemove",Ba.trigger);S.unsubscribe("mousedown",W);S.unsubscribe("mouseup",ja);S.unsubscribe("contextmenu",aa);S.unsubscribe("dragend",da);D.getOdfCanvas().getElement().classList.remove("virtualSelections")};this.getInputMemberId=function(){return c};this.getSession=function(){return g};this.setUndoManager=function(a){T&&T.unsubscribe(gui.UndoManager.signalUndoStackChanged,ga);if(T=a)T.setOdtDocument(D),T.setPlaybackFunction(function(a){a.execute(D)}),
T.subscribe(gui.UndoManager.signalUndoStackChanged,ga)};this.getUndoManager=function(){return T};this.getAnnotationController=function(){return wa};this.getDirectTextStyler=function(){return la};this.getDirectParagraphStyler=function(){return ha};this.getImageManager=function(){return Ha};this.getTextManipulator=function(){return qa};this.getEventManager=function(){return S};this.getKeyboardHandlers=function(){return{keydown:O,keypress:ya}};this.destroy=function(a){var b=[Ba.destroy,la.destroy];runtime.clearTimeout(Fa);
ha&&b.push(ha.destroy);Ea.destroyAll(b,a)};(function(){var a=-1!==ea.navigator.appVersion.toLowerCase().indexOf("mac"),b=gui.KeyboardHandler.Modifier,c=gui.KeyboardHandler.KeyCode;Ba=new core.ScheduledTask($,0);Ca=new core.ScheduledTask(Y,0);O.bind(c.Tab,b.None,F(function(){qa.insertText("\t");return!0}));O.bind(c.Left,b.None,F(y));O.bind(c.Right,b.None,F(w));O.bind(c.Up,b.None,F(s));O.bind(c.Down,b.None,F(H));O.bind(c.Backspace,b.None,oa(qa.removeTextByBackspaceKey));O.bind(c.Delete,b.None,qa.removeTextByDeleteKey);
O.bind(c.Left,b.Shift,F(x));O.bind(c.Right,b.Shift,F(v));O.bind(c.Up,b.Shift,F(z));O.bind(c.Down,b.Shift,F(C));O.bind(c.Home,b.None,F(L));O.bind(c.End,b.None,F(V));O.bind(c.Home,b.Ctrl,F(M));O.bind(c.End,b.Ctrl,F(Z));O.bind(c.Home,b.Shift,F(P));O.bind(c.End,b.Shift,F(A));O.bind(c.Up,b.CtrlShift,F(ua));O.bind(c.Down,b.CtrlShift,F(G));O.bind(c.Home,b.CtrlShift,F(J));O.bind(c.End,b.CtrlShift,F(E));a?(O.bind(c.Clear,b.None,qa.removeCurrentSelection),O.bind(c.Left,b.Meta,F(L)),O.bind(c.Right,b.Meta,F(V)),
O.bind(c.Home,b.Meta,F(M)),O.bind(c.End,b.Meta,F(Z)),O.bind(c.Left,b.MetaShift,F(P)),O.bind(c.Right,b.MetaShift,F(A)),O.bind(c.Up,b.AltShift,F(ua)),O.bind(c.Down,b.AltShift,F(G)),O.bind(c.Up,b.MetaShift,F(J)),O.bind(c.Down,b.MetaShift,F(E)),O.bind(c.A,b.Meta,F(B)),O.bind(c.B,b.Meta,F(la.toggleBold)),O.bind(c.I,b.Meta,F(la.toggleItalic)),O.bind(c.U,b.Meta,F(la.toggleUnderline)),ha&&(O.bind(c.L,b.MetaShift,F(ha.alignParagraphLeft)),O.bind(c.E,b.MetaShift,F(ha.alignParagraphCenter)),O.bind(c.R,b.MetaShift,
F(ha.alignParagraphRight)),O.bind(c.J,b.MetaShift,F(ha.alignParagraphJustified))),wa&&O.bind(c.C,b.MetaShift,wa.addAnnotation),O.bind(c.Z,b.Meta,ca),O.bind(c.Z,b.MetaShift,R)):(O.bind(c.A,b.Ctrl,F(B)),O.bind(c.B,b.Ctrl,F(la.toggleBold)),O.bind(c.I,b.Ctrl,F(la.toggleItalic)),O.bind(c.U,b.Ctrl,F(la.toggleUnderline)),ha&&(O.bind(c.L,b.CtrlShift,F(ha.alignParagraphLeft)),O.bind(c.E,b.CtrlShift,F(ha.alignParagraphCenter)),O.bind(c.R,b.CtrlShift,F(ha.alignParagraphRight)),O.bind(c.J,b.CtrlShift,F(ha.alignParagraphJustified))),
wa&&O.bind(c.C,b.CtrlAlt,wa.addAnnotation),O.bind(c.Z,b.Ctrl,ca),O.bind(c.Z,b.CtrlShift,R));ya.setDefault(F(function(a){var b;b=null===a.which||void 0===a.which?String.fromCharCode(a.keyCode):0!==a.which&&0!==a.charCode?String.fromCharCode(a.which):null;return!b||a.altKey||a.ctrlKey||a.metaKey?!1:(qa.insertText(b),!0)}));ya.bind(c.Enter,b.None,F(qa.enqueueParagraphSplittingOps))})()};return gui.SessionController}();
// Input 98
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
runtime.loadClass("gui.Caret");
gui.CaretManager=function(e){function g(a){return b.hasOwnProperty(a)?b[a]:null}function c(){return Object.keys(b).map(function(a){return b[a]})}function n(a){a===e.getInputMemberId()&&e.getSession().getOdtDocument().getOdfCanvas().getElement().removeAttribute("tabindex");delete b[a]}function q(a){a=a.getMemberId();a===e.getInputMemberId()&&(a=g(a))&&a.refreshCursorBlinking()}function m(){var a=g(e.getInputMemberId());t=!1;a&&a.ensureVisible()}function h(){var a=g(e.getInputMemberId());a&&(a.handleUpdate(),
t||(t=!0,p=runtime.setTimeout(m,50)))}function l(a){a.memberId===e.getInputMemberId()&&h()}function r(){var a=g(e.getInputMemberId());a&&a.setFocus()}function d(){var a=g(e.getInputMemberId());a&&a.removeFocus()}function f(){var a=g(e.getInputMemberId());a&&a.show()}function a(){var a=g(e.getInputMemberId());a&&a.hide()}var b={},k=runtime.getWindow(),p,t=!1;this.registerCursor=function(a,c,d){var f=a.getMemberId();c=new gui.Caret(a,c,d);b[f]=c;f===e.getInputMemberId()?(runtime.log("Starting to track input on new cursor of "+
f),a.handleUpdate=h,e.getSession().getOdtDocument().getOdfCanvas().getElement().setAttribute("tabindex",-1),e.getEventManager().focus()):a.handleUpdate=c.handleUpdate;return c};this.getCaret=g;this.getCarets=c;this.destroy=function(g){var h=e.getSession().getOdtDocument(),m=e.getEventManager(),t=c();runtime.clearTimeout(p);h.unsubscribe(ops.OdtDocument.signalParagraphChanged,l);h.unsubscribe(ops.OdtDocument.signalCursorMoved,q);h.unsubscribe(ops.OdtDocument.signalCursorRemoved,n);m.unsubscribe("focus",
r);m.unsubscribe("blur",d);k.removeEventListener("focus",f,!1);k.removeEventListener("blur",a,!1);(function s(a,b){b?g(b):a<t.length?t[a].destroy(function(b){s(a+1,b)}):g()})(0,void 0);b={}};(function(){var b=e.getSession().getOdtDocument(),c=e.getEventManager();b.subscribe(ops.OdtDocument.signalParagraphChanged,l);b.subscribe(ops.OdtDocument.signalCursorMoved,q);b.subscribe(ops.OdtDocument.signalCursorRemoved,n);c.subscribe("focus",r);c.subscribe("blur",d);k.addEventListener("focus",f,!1);k.addEventListener("blur",
a,!1)})()};
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
runtime.loadClass("gui.Caret");runtime.loadClass("ops.EditInfo");runtime.loadClass("gui.EditInfoMarker");gui.SessionViewOptions=function(){this.caretBlinksOnRangeSelect=this.caretAvatarsInitiallyVisible=this.editInfoMarkersInitiallyVisible=!0};
gui.SessionView=function(){return function(e,g,c,n,q){function m(a,b,c){function d(b,c,e){c=b+'[editinfo|memberid="'+a+'"]'+e+c;a:{var f=t.firstChild;for(b=b+'[editinfo|memberid="'+a+'"]'+e+"{";f;){if(f.nodeType===Node.TEXT_NODE&&0===f.data.indexOf(b)){b=f;break a}f=f.nextSibling}b=null}b?b.data=c:t.appendChild(document.createTextNode(c))}d("div.editInfoMarker","{ background-color: "+c+"; }","");d("span.editInfoColor","{ background-color: "+c+"; }","");d("span.editInfoAuthor",'{ content: "'+b+'"; }',
":before");d("dc|creator","{ background-color: "+c+"; }","");d("div.selectionOverlay","{ background-color: "+c+";}","")}function h(a){var b,c;for(c in w)w.hasOwnProperty(c)&&(b=w[c],a?b.show():b.hide())}function l(a){n.getCarets().forEach(function(b){a?b.showHandle():b.hideHandle()})}function r(a){var b=a.getMemberId();a=a.getProperties();m(b,a.fullName,a.color);g===b&&m("","",a.color)}function d(a){var b=a.getMemberId(),d=c.getOdtDocument().getMember(b).getProperties();n.registerCursor(a,v,u);q.registerCursor(a,
!0);if(a=n.getCaret(b))a.setAvatarImageUrl(d.imageUrl),a.setColor(d.color);runtime.log("+++ View here +++ eagerly created an Caret for '"+b+"'! +++")}function f(a){a=a.getMemberId();var b=q.getSelectionView(g),c=q.getSelectionView(gui.ShadowCursor.ShadowCursorMemberId),d=n.getCaret(g);a===g?(c.hide(),b&&b.show(),d&&d.show()):a===gui.ShadowCursor.ShadowCursorMemberId&&(c.show(),b&&b.hide(),d&&d.hide())}function a(a){q.removeSelectionView(a)}function b(a){var b=a.paragraphElement,d=a.memberId;a=a.timeStamp;
var e,f="",g=b.getElementsByTagNameNS(y,"editinfo")[0];g?(f=g.getAttributeNS(y,"id"),e=w[f]):(f=Math.random().toString(),e=new ops.EditInfo(b,c.getOdtDocument()),e=new gui.EditInfoMarker(e,x),g=b.getElementsByTagNameNS(y,"editinfo")[0],g.setAttributeNS(y,"id",f),w[f]=e);e.addEdit(d,new Date(a))}function k(){H=!0}function p(){s=runtime.getWindow().setInterval(function(){H&&(q.rerenderSelectionViews(),H=!1)},200)}var t,y="urn:webodf:names:editinfo",w={},x=void 0!==e.editInfoMarkersInitiallyVisible?
Boolean(e.editInfoMarkersInitiallyVisible):!0,v=void 0!==e.caretAvatarsInitiallyVisible?Boolean(e.caretAvatarsInitiallyVisible):!0,u=void 0!==e.caretBlinksOnRangeSelect?Boolean(e.caretBlinksOnRangeSelect):!0,s,H=!1;this.showEditInfoMarkers=function(){x||(x=!0,h(x))};this.hideEditInfoMarkers=function(){x&&(x=!1,h(x))};this.showCaretAvatars=function(){v||(v=!0,l(v))};this.hideCaretAvatars=function(){v&&(v=!1,l(v))};this.getSession=function(){return c};this.getCaret=function(a){return n.getCaret(a)};
this.destroy=function(e){var g=c.getOdtDocument(),h=Object.keys(w).map(function(a){return w[a]});g.unsubscribe(ops.OdtDocument.signalMemberAdded,r);g.unsubscribe(ops.OdtDocument.signalMemberUpdated,r);g.unsubscribe(ops.OdtDocument.signalCursorAdded,d);g.unsubscribe(ops.OdtDocument.signalCursorRemoved,a);g.unsubscribe(ops.OdtDocument.signalParagraphChanged,b);g.unsubscribe(ops.OdtDocument.signalCursorMoved,f);g.unsubscribe(ops.OdtDocument.signalParagraphChanged,k);g.unsubscribe(ops.OdtDocument.signalTableAdded,
k);g.unsubscribe(ops.OdtDocument.signalParagraphStyleModified,k);runtime.getWindow().clearInterval(s);t.parentNode.removeChild(t);(function V(a,b){b?e(b):a<h.length?h[a].destroy(function(b){V(a+1,b)}):e()})(0,void 0)};(function(){var e=c.getOdtDocument(),g=document.getElementsByTagName("head")[0];e.subscribe(ops.OdtDocument.signalMemberAdded,r);e.subscribe(ops.OdtDocument.signalMemberUpdated,r);e.subscribe(ops.OdtDocument.signalCursorAdded,d);e.subscribe(ops.OdtDocument.signalCursorRemoved,a);e.subscribe(ops.OdtDocument.signalParagraphChanged,
b);e.subscribe(ops.OdtDocument.signalCursorMoved,f);p();e.subscribe(ops.OdtDocument.signalParagraphChanged,k);e.subscribe(ops.OdtDocument.signalTableAdded,k);e.subscribe(ops.OdtDocument.signalParagraphStyleModified,k);t=document.createElementNS(g.namespaceURI,"style");t.type="text/css";t.media="screen, print, handheld, projection";t.appendChild(document.createTextNode("@namespace editinfo url(urn:webodf:names:editinfo);"));t.appendChild(document.createTextNode("@namespace dc url(http://purl.org/dc/elements/1.1/);"));
g.appendChild(t)})()}}();
// Input 100
var webodf_css="@namespace draw url(urn:oasis:names:tc:opendocument:xmlns:drawing:1.0);\n@namespace fo url(urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0);\n@namespace office url(urn:oasis:names:tc:opendocument:xmlns:office:1.0);\n@namespace presentation url(urn:oasis:names:tc:opendocument:xmlns:presentation:1.0);\n@namespace style url(urn:oasis:names:tc:opendocument:xmlns:style:1.0);\n@namespace svg url(urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0);\n@namespace table url(urn:oasis:names:tc:opendocument:xmlns:table:1.0);\n@namespace text url(urn:oasis:names:tc:opendocument:xmlns:text:1.0);\n@namespace webodfhelper url(urn:webodf:names:helper);\n@namespace cursor url(urn:webodf:names:cursor);\n@namespace editinfo url(urn:webodf:names:editinfo);\n@namespace annotation url(urn:webodf:names:annotation);\n@namespace dc url(http://purl.org/dc/elements/1.1/);\n\noffice|document > *, office|document-content > * {\n  display: none;\n}\noffice|body, office|document {\n  display: inline-block;\n  position: relative;\n}\n\ntext|p, text|h {\n  display: block;\n  padding: 0;\n  margin: 0;\n  line-height: normal;\n  position: relative;\n  min-height: 1.3em; /* prevent empty paragraphs and headings from collapsing if they are empty */\n}\n*[webodfhelper|containsparagraphanchor] {\n  position: relative;\n}\ntext|s {\n    white-space: pre;\n}\ntext|tab {\n  display: inline;\n  white-space: pre;\n}\ntext|tracked-changes {\n  /*Consumers that do not support change tracking, should ignore changes.*/\n  display: none;\n}\noffice|binary-data {\n  display: none;\n}\noffice|text {\n  display: block;\n  text-align: left;\n  overflow: visible;\n  word-wrap: break-word;\n}\n\noffice|text::selection {\n  /** Let's not draw selection highlight that overflows into the office|text\n   * node when selecting content across several paragraphs\n   */\n  background: transparent;\n}\n\n.virtualSelections office|document *::selection {\n  background: transparent;\n}\n.virtualSelections office|document *::-moz-selection {\n  background: transparent;\n}\n\noffice|text * draw|text-box {\n/** only for text documents */\n    display: block;\n    border: 1px solid #d3d3d3;\n}\noffice|spreadsheet {\n  display: block;\n  border-collapse: collapse;\n  empty-cells: show;\n  font-family: sans-serif;\n  font-size: 10pt;\n  text-align: left;\n  page-break-inside: avoid;\n  overflow: hidden;\n}\noffice|presentation {\n  display: inline-block;\n  text-align: left;\n}\n#shadowContent {\n  display: inline-block;\n  text-align: left;\n}\ndraw|page {\n  display: block;\n  position: relative;\n  overflow: hidden;\n}\npresentation|notes, presentation|footer-decl, presentation|date-time-decl {\n    display: none;\n}\n@media print {\n  draw|page {\n    border: 1pt solid black;\n    page-break-inside: avoid;\n  }\n  presentation|notes {\n    /*TODO*/\n  }\n}\noffice|spreadsheet text|p {\n  border: 0px;\n  padding: 1px;\n  margin: 0px;\n}\noffice|spreadsheet table|table {\n  margin: 3px;\n}\noffice|spreadsheet table|table:after {\n  /* show sheet name the end of the sheet */\n  /*content: attr(table|name);*/ /* gives parsing error in opera */\n}\noffice|spreadsheet table|table-row {\n  counter-increment: row;\n}\noffice|spreadsheet table|table-row:before {\n  width: 3em;\n  background: #cccccc;\n  border: 1px solid black;\n  text-align: center;\n  content: counter(row);\n  display: table-cell;\n}\noffice|spreadsheet table|table-cell {\n  border: 1px solid #cccccc;\n}\ntable|table {\n  display: table;\n}\ndraw|frame table|table {\n  width: 100%;\n  height: 100%;\n  background: white;\n}\ntable|table-header-rows {\n  display: table-header-group;\n}\ntable|table-row {\n  display: table-row;\n}\ntable|table-column {\n  display: table-column;\n}\ntable|table-cell {\n  width: 0.889in;\n  display: table-cell;\n  word-break: break-all; /* prevent long words from extending out the table cell */\n}\ndraw|frame {\n  display: block;\n}\ndraw|image {\n  display: block;\n  width: 100%;\n  height: 100%;\n  top: 0px;\n  left: 0px;\n  background-repeat: no-repeat;\n  background-size: 100% 100%;\n  -moz-background-size: 100% 100%;\n}\n/* only show the first image in frame */\ndraw|frame > draw|image:nth-of-type(n+2) {\n  display: none;\n}\ntext|list:before {\n    display: none;\n    content:\"\";\n}\ntext|list {\n    counter-reset: list;\n}\ntext|list-item {\n    display: block;\n}\ntext|number {\n    display:none;\n}\n\ntext|a {\n    color: blue;\n    text-decoration: underline;\n    cursor: pointer;\n}\ntext|note-citation {\n    vertical-align: super;\n    font-size: smaller;\n}\ntext|note-body {\n    display: none;\n}\ntext|note:hover text|note-citation {\n    background: #dddddd;\n}\ntext|note:hover text|note-body {\n    display: block;\n    left:1em;\n    max-width: 80%;\n    position: absolute;\n    background: #ffffaa;\n}\nsvg|title, svg|desc {\n    display: none;\n}\nvideo {\n    width: 100%;\n    height: 100%\n}\n\n/* below set up the cursor */\ncursor|cursor {\n    display: inline;\n    width: 0px;\n    height: 1em;\n    /* making the position relative enables the avatar to use\n       the cursor as reference for its absolute position */\n    position: relative;\n    z-index: 1;\n}\ncursor|cursor > span {\n    /* IMPORTANT: when changing these values ensure DEFAULT_CARET_TOP and DEFAULT_CARET_HEIGHT\n        in Caret.js remain in sync */\n    display: inline;\n    position: absolute;\n    top: 5%; /* push down the caret; 0px can do the job, 5% looks better, 10% is a bit over */\n    height: 1em;\n    border-left: 2px solid black;\n    outline: none;\n}\n\ncursor|cursor > div {\n    padding: 3px;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n    border: none !important;\n    border-radius: 5px;\n    opacity: 0.3;\n}\n\ncursor|cursor > div > img {\n    border-radius: 5px;\n}\n\ncursor|cursor > div.active {\n    opacity: 0.8;\n}\n\ncursor|cursor > div:after {\n    content: ' ';\n    position: absolute;\n    width: 0px;\n    height: 0px;\n    border-style: solid;\n    border-width: 8.7px 5px 0 5px;\n    border-color: black transparent transparent transparent;\n\n    top: 100%;\n    left: 43%;\n}\n\n\n.editInfoMarker {\n    position: absolute;\n    width: 10px;\n    height: 100%;\n    left: -20px;\n    opacity: 0.8;\n    top: 0;\n    border-radius: 5px;\n    background-color: transparent;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n}\n.editInfoMarker:hover {\n    box-shadow: 0px 0px 8px rgba(0, 0, 0, 1);\n}\n\n.editInfoHandle {\n    position: absolute;\n    background-color: black;\n    padding: 5px;\n    border-radius: 5px;\n    opacity: 0.8;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n    bottom: 100%;\n    margin-bottom: 10px;\n    z-index: 3;\n    left: -25px;\n}\n.editInfoHandle:after {\n    content: ' ';\n    position: absolute;\n    width: 0px;\n    height: 0px;\n    border-style: solid;\n    border-width: 8.7px 5px 0 5px;\n    border-color: black transparent transparent transparent;\n\n    top: 100%;\n    left: 5px;\n}\n.editInfo {\n    font-family: sans-serif;\n    font-weight: normal;\n    font-style: normal;\n    text-decoration: none;\n    color: white;\n    width: 100%;\n    height: 12pt;\n}\n.editInfoColor {\n    float: left;\n    width: 10pt;\n    height: 10pt;\n    border: 1px solid white;\n}\n.editInfoAuthor {\n    float: left;\n    margin-left: 5pt;\n    font-size: 10pt;\n    text-align: left;\n    height: 12pt;\n    line-height: 12pt;\n}\n.editInfoTime {\n    float: right;\n    margin-left: 30pt;\n    font-size: 8pt;\n    font-style: italic;\n    color: yellow;\n    height: 12pt;\n    line-height: 12pt;\n}\n\n.annotationWrapper {\n    display: inline;\n    position: relative;\n}\n\n.annotationRemoveButton:before {\n    content: '\u00d7';\n    color: white;\n    padding: 5px;\n    line-height: 1em;\n}\n\n.annotationRemoveButton {\n    width: 20px;\n    height: 20px;\n    border-radius: 10px;\n    background-color: black;\n    box-shadow: 0px 0px 5px rgba(50, 50, 50, 0.75);\n    position: absolute;\n    top: -10px;\n    left: -10px;\n    z-index: 3;\n    text-align: center;\n    font-family: sans-serif;\n    font-style: normal;\n    font-weight: normal;\n    text-decoration: none;\n    font-size: 15px;\n}\n.annotationRemoveButton:hover {\n    cursor: pointer;\n    box-shadow: 0px 0px 5px rgba(0, 0, 0, 1);\n}\n\n.annotationNote {\n    width: 4cm;\n    position: absolute;\n    display: inline;\n    z-index: 10;\n}\n.annotationNote > office|annotation {\n    display: block;\n    text-align: left;\n}\n\n.annotationConnector {\n    position: absolute;\n    display: inline;\n    z-index: 2;\n    border-top: 1px dashed brown;\n}\n.annotationConnector.angular {\n    -moz-transform-origin: left top;\n    -webkit-transform-origin: left top;\n    -ms-transform-origin: left top;\n    transform-origin: left top;\n}\n.annotationConnector.horizontal {\n    left: 0;\n}\n.annotationConnector.horizontal:before {\n    content: '';\n    display: inline;\n    position: absolute;\n    width: 0px;\n    height: 0px;\n    border-style: solid;\n    border-width: 8.7px 5px 0 5px;\n    border-color: brown transparent transparent transparent;\n    top: -1px;\n    left: -5px;\n}\n\noffice|annotation {\n    width: 100%;\n    height: 100%;\n    display: none;\n    background: rgb(198, 238, 184);\n    background: -moz-linear-gradient(90deg, rgb(198, 238, 184) 30%, rgb(180, 196, 159) 100%);\n    background: -webkit-linear-gradient(90deg, rgb(198, 238, 184) 30%, rgb(180, 196, 159) 100%);\n    background: -o-linear-gradient(90deg, rgb(198, 238, 184) 30%, rgb(180, 196, 159) 100%);\n    background: -ms-linear-gradient(90deg, rgb(198, 238, 184) 30%, rgb(180, 196, 159) 100%);\n    background: linear-gradient(180deg, rgb(198, 238, 184) 30%, rgb(180, 196, 159) 100%);\n    box-shadow: 0 3px 4px -3px #ccc;\n}\n\noffice|annotation > dc|creator {\n    display: block;\n    font-size: 10pt;\n    font-weight: normal;\n    font-style: normal;\n    font-family: sans-serif;\n    color: white;\n    background-color: brown;\n    padding: 4px;\n}\noffice|annotation > dc|date {\n    display: block;\n    font-size: 10pt;\n    font-weight: normal;\n    font-style: normal;\n    font-family: sans-serif;\n    border: 4px solid transparent;\n}\noffice|annotation > text|list {\n    display: block;\n    padding: 5px;\n}\n\n/* This is very temporary CSS. This must go once\n * we start bundling webodf-default ODF styles for annotations.\n */\noffice|annotation text|p {\n    font-size: 10pt;\n    color: black;\n    font-weight: normal;\n    font-style: normal;\n    text-decoration: none;\n    font-family: sans-serif;\n}\n\ndc|*::selection {\n    background: transparent;\n}\ndc|*::-moz-selection {\n    background: transparent;\n}\n\n#annotationsPane {\n    background-color: #EAEAEA;\n    width: 4cm;\n    height: 100%;\n    display: none;\n    position: absolute;\n    outline: 1px solid #ccc;\n}\n\n.annotationHighlight {\n    background-color: yellow;\n    position: relative;\n}\n\n.selectionOverlay {\n    position: absolute;\n    z-index: 15;\n    opacity: 0.2;\n    pointer-events: none;\n    top: 0;\n    left: 0;\n    width: 0;\n    height: 0;\n}\n\n#imageSelector {\n    display: none;\n    position: absolute;\n    border-style: solid;\n    border-color: black;\n}\n\n#imageSelector > div {\n    width: 5px;\n    height: 5px;\n    display: block;\n    position: absolute;\n    border: 1px solid black;\n    background-color: #ffffff;\n}\n\n#imageSelector > .topLeft {\n    top: -4px;\n    left: -4px;\n}\n\n#imageSelector > .topRight {\n    top: -4px;\n    right: -4px;\n}\n\n#imageSelector > .bottomRight {\n    right: -4px;\n    bottom: -4px;\n}\n\n#imageSelector > .bottomLeft {\n    bottom: -4px;\n    left: -4px;\n}\n\n#imageSelector > .topMiddle {\n    top: -4px;\n    left: 50%;\n    margin-left: -2.5px; /* half of the width defined in #imageSelector > div */\n}\n\n#imageSelector > .rightMiddle {\n    top: 50%;\n    right: -4px;\n    margin-top: -2.5px; /* half of the height defined in #imageSelector > div */\n}\n\n#imageSelector > .bottomMiddle {\n    bottom: -4px;\n    left: 50%;\n    margin-left: -2.5px; /* half of the width defined in #imageSelector > div */\n}\n\n#imageSelector > .leftMiddle {\n    top: 50%;\n    left: -4px;\n    margin-top: -2.5px; /* half of the height defined in #imageSelector > div */\n}\n";
