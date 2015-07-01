!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),o.domador=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var replacements = {
  '\\\\': '\\\\',
  '\\[': '\\[',
  '\\]': '\\]',
  '>': '\\>',
  '_': '\\_',
  '\\*': '\\*',
  '`': '\\`',
  '#': '\\#',
  '([0-9])\\.(\\s|$)': '$1\\.$2',
  '\u00a9': '(c)',
  '\u00ae': '(r)',
  '\u2122': '(tm)',
  '\u00a0': ' ',
  '\u00b7': '\\*',
  '\u2002': ' ',
  '\u2003': ' ',
  '\u2009': ' ',
  '\u2018': '\'',
  '\u2019': '\'',
  '\u201c': '"',
  '\u201d': '"',
  '\u2026': '...',
  '\u2013': '--',
  '\u2014': '---'
};
var replacers = Object.keys(replacements).reduce(replacer, {});
var rspaces = /^\s+|\s+$/g;
var rdisplay = /(display|visibility)\s*:\s*[a-z]+/gi;
var rhidden = /(none|hidden)\s*$/i;
var rheading = /^H([1-6])$/;
var shallowTags = [
  'APPLET', 'AREA', 'AUDIO', 'BUTTON', 'CANVAS', 'DATALIST', 'EMBED', 'HEAD', 'INPUT', 'MAP',
  'MENU', 'METER', 'NOFRAMES', 'NOSCRIPT', 'OBJECT', 'OPTGROUP', 'OPTION', 'PARAM', 'PROGRESS',
  'RP', 'RT', 'RUBY', 'SCRIPT', 'SELECT', 'STYLE', 'TEXTAREA', 'TITLE', 'VIDEO'
];
var paragraphTags = [
  'ADDRESS', 'ARTICLE', 'ASIDE', 'DIV', 'FIELDSET', 'FOOTER', 'HEADER', 'NAV', 'P', 'SECTION'
];
var windowContext = require('./virtualWindowContext');

function replacer (result, key) {
  result[key] = new RegExp(key, 'g'); return result;
}

function many (text, times) {
  return new Array(times + 1).join(text);
}

function padLeft (text, times) {
  return many(' ', times) + text;
}

function trim (text) {
  if (text.trim) {
    return text.trim();
  }
  return text.replace(rspaces, '');
}

function attr (el, prop, direct) {
  var proper = direct === void 0 || direct;
  if (proper || typeof el.getAttribute !== 'function') {
    return el[prop] || '';
  }
  return el.getAttribute(prop) || '';
}

function has (el, prop, direct) {
  var proper = direct === void 0 || direct;
  if (proper || typeof el.hasAttribute !== 'function') {
    return el.hasOwnProperty(prop);
  }
  return el.hasAttribute(prop);
}

function isVisible (el) {
  var display;
  var i;
  var property;
  var visibility;
  var visible = true;
  var style = attr(el, 'style', false);
  var properties = style != null ? typeof style.match === 'function' ? style.match(rdisplay) : void 0 : void 0;
  if (properties != null) {
    for (i = 0; i < properties.length; i++) {
      property = properties[i];
      visible = !rhidden.test(property);
    }
  }
  if (visible && typeof windowContext.getComputedStyle === 'function') {
    try {
      style = windowContext.getComputedStyle(el, null);
      if (typeof (style != null ? style.getPropertyValue : void 0) === 'function') {
        display = style.getPropertyValue('display');
        visibility = style.getPropertyValue('visibility');
        visible = display !== 'none' && visibility !== 'hidden';
      }
    } catch (err) {
    }
  }
  return visible;
}

function processPlainText (text, tagName) {
  var key;
  var block = paragraphTags.indexOf(tagName) !== -1 || tagName === 'BLOCKQUOTE';
  text = text.replace(/\n([ \t]*\n)+/g, '\n');
  text = text.replace(/\n[ \t]+/g, '\n');
  text = text.replace(/[ \t]+/g, ' ');
  for (key in replacements) {
    text = text.replace(replacers[key], replacements[key]);
  }
  text = text.replace(/(\s*)\\#/g, block ? removeUnnecessaryEscapes : '$1#');
  return text;

  function removeUnnecessaryEscapes (escaped, spaces, i) {
    return i ? spaces + '#' : escaped;
  }
}

function processCode (text) {
  return text.replace(/`/g, '\\`');
}

function noop () {}

function parse (html, options) {
  return new Domador(html, options).parse();
}

function Domador (html, options) {
  this.html = html != null ? html : '';
  this.options = options || {};
  this.atLeft = this.noTrailingWhitespace = this.atP = true;
  this.buffer = '';
  this.exceptions = [];
  this.order = 1;
  this.listDepth = 0;
  this.inCode = this.inPre = this.inOrderedList = false;
  this.last = null;
  this.left = '\n';
  this.links = [];
  this.linkMap = {};
  this.unhandled = {};
  if (this.options.absolute === void 0) { this.options.absolute = false; }
  if (this.options.fencing === void 0) { this.options.fencing = false; }
  if (this.options.fencinglanguage === void 0) { this.options.fencinglanguage = noop; }
  if (this.options.transform === void 0) { this.options.transform = noop; }
}

Domador.prototype.append = function (text) {
  if (this.last != null) {
    this.buffer += this.last;
  }
  return this.last = text;
};

Domador.prototype.br = function () {
  this.append('  ' +  this.left);
  return this.atLeft = this.noTrailingWhitespace = true;
};

Domador.prototype.code = function () {
  var old;
  old = this.inCode;
  this.inCode = true;
  return (function(_this) {
    return function() {
      return _this.inCode = old;
    };
  })(this);
};

Domador.prototype.li = function () {
  var result;
  result = this.inOrderedList ? (this.order++) + '. ' : '* ';
  result = padLeft(result, (this.listDepth - 1) * 2);
  return this.append(result);
};

Domador.prototype.ol = function () {
  var inOrderedList, order;
  if (this.listDepth === 0) {
    this.p();
  }
  inOrderedList = this.inOrderedList;
  order = this.order;
  this.inOrderedList = true;
  this.order = 1;
  this.listDepth++;
  return (function(_this) {
    return function() {
      _this.inOrderedList = inOrderedList;
      _this.order = order;
      return _this.listDepth--;
    };
  })(this);
};

Domador.prototype.output = function (text) {
  if (!text) {
    return;
  }
  if (!this.inPre) {
    text = this.noTrailingWhitespace ? text.replace(/^[ \t\n]+/, '') : /^[ \t]*\n/.test(text) ? text.replace(/^[ \t\n]+/, '\n') : text.replace(/^[ \t]+/, ' ');
  }
  if (text === '') {
    return;
  }
  this.atP = /\n\n$/.test(text);
  this.atLeft = /\n$/.test(text);
  this.noTrailingWhitespace = /[ \t\n]$/.test(text);
  return this.append(text.replace(/\n/g, this.left));
};

Domador.prototype.outputLater = function (text) {
  return (function(self) {
    return function () {
      return self.output(text);
    };
  })(this);
};

Domador.prototype.p = function () {
  if (this.atP) {
    return;
  }
  if (this.startingBlockquote) {
    this.append('\n');
  } else {
    this.append(this.left);
  }
  if (!this.atLeft) {
    this.append(this.left);
    this.atLeft = true;
  }
  return this.noTrailingWhitespace = this.atP = true;
};

Domador.prototype.parse = function () {
  var container;
  var i;
  var link;
  var ref;
  this.buffer = '';
  if (!this.html) {
    return this.buffer;
  }
  if (typeof this.html === 'string') {
    container = windowContext.document.createElement('div');
    container.innerHTML = this.html;
  } else {
    container = this.html;
  }
  this.process(container);
  if (this.links.length) {
    while (this.lastElement.parentElement !== container && this.lastElement.tagName !== 'BLOCKQUOTE') {
      this.lastElement = this.lastElement.parentElement;
    }
    if (this.lastElement.tagName !== 'BLOCKQUOTE') {
      this.append('\n\n');
    }
    ref = this.links;
    for (i = 0; i < ref.length; i++) {
      link = ref[i];
      if (link) {
        this.append('[' + (i + 1) + ']: ' + link + '\n');
      }
    }
  }
  this.append('');
  return this.buffer = trim(this.buffer);
};

Domador.prototype.pre = function () {
  var old;
  old = this.inPre;
  this.inPre = true;
  return (function(_this) {
    return function() {
      return _this.inPre = old;
    };
  })(this);
};

Domador.prototype.htmlTag = function (type) {
  this.output('<' + type + '>');
  return this.outputLater('</' + type + '>');
};

Domador.prototype.process = function (el) {
  var after;
  var after1;
  var after2;
  var base;
  var href;
  var i;
  var ref;
  var src;
  var suffix;
  var summary;
  var title;

  if (!isVisible(el)) {
    return;
  }

  if (el.nodeType === windowContext.Node.TEXT_NODE) {
    if (el.nodeValue.replace(/\n/g, '').length === 0) {
      return;
    }
    if (this.inPre) {
      return this.output(el.nodeValue);
    }
    if (this.inCode) {
      return this.output(processCode(el.nodeValue));
    }
    return this.output(processPlainText(el.nodeValue, el.parentElement && el.parentElement.tagName));
  }

  if (el.nodeType !== windowContext.Node.ELEMENT_NODE) {
    return;
  }

  this.lastElement = el;

  var transformed = this.options.transform(el);
  if (transformed !== void 0) {
    return this.output(transformed);
  }
  if (shallowTags.indexOf(el.tagName) !== -1) {
    return;
  }

  switch (el.tagName) {
    case 'H1':
    case 'H2':
    case 'H3':
    case 'H4':
    case 'H5':
    case 'H6':
      this.p();
      this.output(many('#', parseInt(el.tagName.match(rheading)[1])) + ' ');
      break;
    case 'ADDRESS':
    case 'ARTICLE':
    case 'ASIDE':
    case 'DIV':
    case 'FIELDSET':
    case 'FOOTER':
    case 'HEADER':
    case 'NAV':
    case 'P':
    case 'SECTION':
      this.p();
      break;
    case 'BODY':
    case 'FORM':
      break;
    case 'DETAILS':
      this.p();
      if (!has(el, 'open', false)) {
        summary = el.getElementsByTagName('summary')[0];
        if (summary) {
          this.process(summary);
        }
        return;
      }
      break;
    case 'BR':
      this.br();
      break;
    case 'HR':
      this.p();
      this.output('---------');
      this.p();
      break;
    case 'CITE':
    case 'DFN':
    case 'EM':
    case 'I':
    case 'U':
    case 'VAR':
      this.output('_');
      this.noTrailingWhitespace = true;
      after = this.outputLater('_');
      break;
    case 'DT':
    case 'B':
    case 'STRONG':
      if (el.tagName === 'DT') {
        this.p();
      }
      this.output('**');
      this.noTrailingWhitespace = true;
      after = this.outputLater('**');
      break;
    case 'Q':
      this.output('"');
      this.noTrailingWhitespace = true;
      after = this.outputLater('"');
      break;
    case 'OL':
      after = this.ol();
      break;
    case 'UL':
      after = this.ul();
      break;
    case 'LI':
      this.replaceLeft('\n');
      this.li();
      break;
    case 'PRE':
      if (this.options.fencing) {
        this.append('\n\n');
        this.output(['```', '\n'].join(this.options.fencinglanguage(el) || ''));
        after1 = this.pre();
        after2 = this.outputLater('\n```');
      } else {
        after1 = this.pushLeft('    ');
        after2 = this.pre();
      }
      after = function() {
        after1();
        return after2();
      };
      break;
    case 'CODE':
    case 'SAMP':
      if (this.inPre) {
        break;
      }
      this.output('`');
      after1 = this.code();
      after2 = this.outputLater('`');
      after = function() {
        after1();
        return after2();
      };
      break;
    case 'BLOCKQUOTE':
    case 'DD':
      this.startingBlockquote = true;
      after = this.pushLeft('> ');
      this.startingBlockquote = false;
      break;
    case 'KBD':
      after = this.htmlTag('kbd');
      break;
    case 'A':
      href = attr(el, 'href', this.options.absolute);
      if (!href) {
        break;
      }
      title = attr(el, 'title');
      if (title) {
        href += ' "' + title + '"';
      }
      suffix = this.options.inline ? '(' + href + ')' : '[' + ((base = this.linkMap)[href] != null ? base[href] : base[href] = this.links.push(href)) + ']';
      this.output('[');
      this.noTrailingWhitespace = true;
      after = this.outputLater(']' + suffix);
      break;
    case 'IMG':
      src = attr(el, 'src', this.options.absolute);
      if (!src) {
        break;
      }
      this.output('![' + (attr(el, 'alt')) + '](' + src + ')');
      return;
    case 'FRAME':
    case 'IFRAME':
      try {
        if ((ref = el.contentDocument) != null ? ref.documentElement : void 0) {
          this.process(el.contentDocument.documentElement);
        }
      } catch (err) {
      }
      return;
    case 'TR':
      after = this.p;
      break;
  }

  for (i = 0; i < el.childNodes.length; i++) {
    this.process(el.childNodes[i]);
  }

  if (after) {
    return after.call(this);
  }
};

Domador.prototype.pushLeft = function (text) {
  var old;
  old = this.left;
  this.left += text;
  if (this.atP) {
    this.append(text);
  } else {
    this.p();
  }
  return (function(_this) {
    return function() {
      _this.left = old;
      _this.atLeft = _this.atP = false;
      return _this.p();
    };
  })(this);
};

Domador.prototype.replaceLeft = function (text) {
  if (!this.atLeft) {
    this.append(this.left.replace(/[ ]{2,4}$/, text));
    return this.atLeft = this.noTrailingWhitespace = this.atP = true;
  } else if (this.last) {
    return this.last = this.last.replace(/[ ]{2,4}$/, text);
  }
};

Domador.prototype.ul = function () {
  var inOrderedList, order;
  if (this.listDepth === 0) {
    this.p();
  }
  inOrderedList = this.inOrderedList;
  order = this.order;
  this.inOrderedList = false;
  this.order = 1;
  this.listDepth++;
  return (function(_this) {
    return function() {
      _this.inOrderedList = inOrderedList;
      _this.order = order;
      return _this.listDepth--;
    };
  })(this);
};

module.exports = parse;

},{"./virtualWindowContext":2}],2:[function(require,module,exports){
'use strict';

module.exports = window;

if (!window.Node) {
  window.Node = {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3
  };
}

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkb21hZG9yLmpzIiwid2luZG93Q29udGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9oQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciByZXBsYWNlbWVudHMgPSB7XG4gICdcXFxcXFxcXCc6ICdcXFxcXFxcXCcsXG4gICdcXFxcWyc6ICdcXFxcWycsXG4gICdcXFxcXSc6ICdcXFxcXScsXG4gICc+JzogJ1xcXFw+JyxcbiAgJ18nOiAnXFxcXF8nLFxuICAnXFxcXConOiAnXFxcXConLFxuICAnYCc6ICdcXFxcYCcsXG4gICcjJzogJ1xcXFwjJyxcbiAgJyhbMC05XSlcXFxcLihcXFxcc3wkKSc6ICckMVxcXFwuJDInLFxuICAnXFx1MDBhOSc6ICcoYyknLFxuICAnXFx1MDBhZSc6ICcociknLFxuICAnXFx1MjEyMic6ICcodG0pJyxcbiAgJ1xcdTAwYTAnOiAnICcsXG4gICdcXHUwMGI3JzogJ1xcXFwqJyxcbiAgJ1xcdTIwMDInOiAnICcsXG4gICdcXHUyMDAzJzogJyAnLFxuICAnXFx1MjAwOSc6ICcgJyxcbiAgJ1xcdTIwMTgnOiAnXFwnJyxcbiAgJ1xcdTIwMTknOiAnXFwnJyxcbiAgJ1xcdTIwMWMnOiAnXCInLFxuICAnXFx1MjAxZCc6ICdcIicsXG4gICdcXHUyMDI2JzogJy4uLicsXG4gICdcXHUyMDEzJzogJy0tJyxcbiAgJ1xcdTIwMTQnOiAnLS0tJ1xufTtcbnZhciByZXBsYWNlcnMgPSBPYmplY3Qua2V5cyhyZXBsYWNlbWVudHMpLnJlZHVjZShyZXBsYWNlciwge30pO1xudmFyIHJzcGFjZXMgPSAvXlxccyt8XFxzKyQvZztcbnZhciByZGlzcGxheSA9IC8oZGlzcGxheXx2aXNpYmlsaXR5KVxccyo6XFxzKlthLXpdKy9naTtcbnZhciByaGlkZGVuID0gLyhub25lfGhpZGRlbilcXHMqJC9pO1xudmFyIHJoZWFkaW5nID0gL15IKFsxLTZdKSQvO1xudmFyIHNoYWxsb3dUYWdzID0gW1xuICAnQVBQTEVUJywgJ0FSRUEnLCAnQVVESU8nLCAnQlVUVE9OJywgJ0NBTlZBUycsICdEQVRBTElTVCcsICdFTUJFRCcsICdIRUFEJywgJ0lOUFVUJywgJ01BUCcsXG4gICdNRU5VJywgJ01FVEVSJywgJ05PRlJBTUVTJywgJ05PU0NSSVBUJywgJ09CSkVDVCcsICdPUFRHUk9VUCcsICdPUFRJT04nLCAnUEFSQU0nLCAnUFJPR1JFU1MnLFxuICAnUlAnLCAnUlQnLCAnUlVCWScsICdTQ1JJUFQnLCAnU0VMRUNUJywgJ1NUWUxFJywgJ1RFWFRBUkVBJywgJ1RJVExFJywgJ1ZJREVPJ1xuXTtcbnZhciBwYXJhZ3JhcGhUYWdzID0gW1xuICAnQUREUkVTUycsICdBUlRJQ0xFJywgJ0FTSURFJywgJ0RJVicsICdGSUVMRFNFVCcsICdGT09URVInLCAnSEVBREVSJywgJ05BVicsICdQJywgJ1NFQ1RJT04nXG5dO1xudmFyIHdpbmRvd0NvbnRleHQgPSByZXF1aXJlKCcuL3ZpcnR1YWxXaW5kb3dDb250ZXh0Jyk7XG5cbmZ1bmN0aW9uIHJlcGxhY2VyIChyZXN1bHQsIGtleSkge1xuICByZXN1bHRba2V5XSA9IG5ldyBSZWdFeHAoa2V5LCAnZycpOyByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtYW55ICh0ZXh0LCB0aW1lcykge1xuICByZXR1cm4gbmV3IEFycmF5KHRpbWVzICsgMSkuam9pbih0ZXh0KTtcbn1cblxuZnVuY3Rpb24gcGFkTGVmdCAodGV4dCwgdGltZXMpIHtcbiAgcmV0dXJuIG1hbnkoJyAnLCB0aW1lcykgKyB0ZXh0O1xufVxuXG5mdW5jdGlvbiB0cmltICh0ZXh0KSB7XG4gIGlmICh0ZXh0LnRyaW0pIHtcbiAgICByZXR1cm4gdGV4dC50cmltKCk7XG4gIH1cbiAgcmV0dXJuIHRleHQucmVwbGFjZShyc3BhY2VzLCAnJyk7XG59XG5cbmZ1bmN0aW9uIGF0dHIgKGVsLCBwcm9wLCBkaXJlY3QpIHtcbiAgdmFyIHByb3BlciA9IGRpcmVjdCA9PT0gdm9pZCAwIHx8IGRpcmVjdDtcbiAgaWYgKHByb3BlciB8fCB0eXBlb2YgZWwuZ2V0QXR0cmlidXRlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGVsW3Byb3BdIHx8ICcnO1xuICB9XG4gIHJldHVybiBlbC5nZXRBdHRyaWJ1dGUocHJvcCkgfHwgJyc7XG59XG5cbmZ1bmN0aW9uIGhhcyAoZWwsIHByb3AsIGRpcmVjdCkge1xuICB2YXIgcHJvcGVyID0gZGlyZWN0ID09PSB2b2lkIDAgfHwgZGlyZWN0O1xuICBpZiAocHJvcGVyIHx8IHR5cGVvZiBlbC5oYXNBdHRyaWJ1dGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZWwuaGFzT3duUHJvcGVydHkocHJvcCk7XG4gIH1cbiAgcmV0dXJuIGVsLmhhc0F0dHJpYnV0ZShwcm9wKTtcbn1cblxuZnVuY3Rpb24gaXNWaXNpYmxlIChlbCkge1xuICB2YXIgZGlzcGxheTtcbiAgdmFyIGk7XG4gIHZhciBwcm9wZXJ0eTtcbiAgdmFyIHZpc2liaWxpdHk7XG4gIHZhciB2aXNpYmxlID0gdHJ1ZTtcbiAgdmFyIHN0eWxlID0gYXR0cihlbCwgJ3N0eWxlJywgZmFsc2UpO1xuICB2YXIgcHJvcGVydGllcyA9IHN0eWxlICE9IG51bGwgPyB0eXBlb2Ygc3R5bGUubWF0Y2ggPT09ICdmdW5jdGlvbicgPyBzdHlsZS5tYXRjaChyZGlzcGxheSkgOiB2b2lkIDAgOiB2b2lkIDA7XG4gIGlmIChwcm9wZXJ0aWVzICE9IG51bGwpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgcHJvcGVydHkgPSBwcm9wZXJ0aWVzW2ldO1xuICAgICAgdmlzaWJsZSA9ICFyaGlkZGVuLnRlc3QocHJvcGVydHkpO1xuICAgIH1cbiAgfVxuICBpZiAodmlzaWJsZSAmJiB0eXBlb2Ygd2luZG93Q29udGV4dC5nZXRDb21wdXRlZFN0eWxlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHN0eWxlID0gd2luZG93Q29udGV4dC5nZXRDb21wdXRlZFN0eWxlKGVsLCBudWxsKTtcbiAgICAgIGlmICh0eXBlb2YgKHN0eWxlICE9IG51bGwgPyBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlIDogdm9pZCAwKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBkaXNwbGF5ID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnZGlzcGxheScpO1xuICAgICAgICB2aXNpYmlsaXR5ID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgndmlzaWJpbGl0eScpO1xuICAgICAgICB2aXNpYmxlID0gZGlzcGxheSAhPT0gJ25vbmUnICYmIHZpc2liaWxpdHkgIT09ICdoaWRkZW4nO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmlzaWJsZTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1BsYWluVGV4dCAodGV4dCwgdGFnTmFtZSkge1xuICB2YXIga2V5O1xuICB2YXIgYmxvY2sgPSBwYXJhZ3JhcGhUYWdzLmluZGV4T2YodGFnTmFtZSkgIT09IC0xIHx8IHRhZ05hbWUgPT09ICdCTE9DS1FVT1RFJztcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFxuKFsgXFx0XSpcXG4pKy9nLCAnXFxuJyk7XG4gIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xcblsgXFx0XSsvZywgJ1xcbicpO1xuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9bIFxcdF0rL2csICcgJyk7XG4gIGZvciAoa2V5IGluIHJlcGxhY2VtZW50cykge1xuICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocmVwbGFjZXJzW2tleV0sIHJlcGxhY2VtZW50c1trZXldKTtcbiAgfVxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8oXFxzKilcXFxcIy9nLCBibG9jayA/IHJlbW92ZVVubmVjZXNzYXJ5RXNjYXBlcyA6ICckMSMnKTtcbiAgcmV0dXJuIHRleHQ7XG5cbiAgZnVuY3Rpb24gcmVtb3ZlVW5uZWNlc3NhcnlFc2NhcGVzIChlc2NhcGVkLCBzcGFjZXMsIGkpIHtcbiAgICByZXR1cm4gaSA/IHNwYWNlcyArICcjJyA6IGVzY2FwZWQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0NvZGUgKHRleHQpIHtcbiAgcmV0dXJuIHRleHQucmVwbGFjZSgvYC9nLCAnXFxcXGAnKTtcbn1cblxuZnVuY3Rpb24gbm9vcCAoKSB7fVxuXG5mdW5jdGlvbiBwYXJzZSAoaHRtbCwgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IERvbWFkb3IoaHRtbCwgb3B0aW9ucykucGFyc2UoKTtcbn1cblxuZnVuY3Rpb24gRG9tYWRvciAoaHRtbCwgb3B0aW9ucykge1xuICB0aGlzLmh0bWwgPSBodG1sICE9IG51bGwgPyBodG1sIDogJyc7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMuYXRMZWZ0ID0gdGhpcy5ub1RyYWlsaW5nV2hpdGVzcGFjZSA9IHRoaXMuYXRQID0gdHJ1ZTtcbiAgdGhpcy5idWZmZXIgPSAnJztcbiAgdGhpcy5leGNlcHRpb25zID0gW107XG4gIHRoaXMub3JkZXIgPSAxO1xuICB0aGlzLmxpc3REZXB0aCA9IDA7XG4gIHRoaXMuaW5Db2RlID0gdGhpcy5pblByZSA9IHRoaXMuaW5PcmRlcmVkTGlzdCA9IGZhbHNlO1xuICB0aGlzLmxhc3QgPSBudWxsO1xuICB0aGlzLmxlZnQgPSAnXFxuJztcbiAgdGhpcy5saW5rcyA9IFtdO1xuICB0aGlzLmxpbmtNYXAgPSB7fTtcbiAgdGhpcy51bmhhbmRsZWQgPSB7fTtcbiAgaWYgKHRoaXMub3B0aW9ucy5hYnNvbHV0ZSA9PT0gdm9pZCAwKSB7IHRoaXMub3B0aW9ucy5hYnNvbHV0ZSA9IGZhbHNlOyB9XG4gIGlmICh0aGlzLm9wdGlvbnMuZmVuY2luZyA9PT0gdm9pZCAwKSB7IHRoaXMub3B0aW9ucy5mZW5jaW5nID0gZmFsc2U7IH1cbiAgaWYgKHRoaXMub3B0aW9ucy5mZW5jaW5nbGFuZ3VhZ2UgPT09IHZvaWQgMCkgeyB0aGlzLm9wdGlvbnMuZmVuY2luZ2xhbmd1YWdlID0gbm9vcDsgfVxuICBpZiAodGhpcy5vcHRpb25zLnRyYW5zZm9ybSA9PT0gdm9pZCAwKSB7IHRoaXMub3B0aW9ucy50cmFuc2Zvcm0gPSBub29wOyB9XG59XG5cbkRvbWFkb3IucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gIGlmICh0aGlzLmxhc3QgIT0gbnVsbCkge1xuICAgIHRoaXMuYnVmZmVyICs9IHRoaXMubGFzdDtcbiAgfVxuICByZXR1cm4gdGhpcy5sYXN0ID0gdGV4dDtcbn07XG5cbkRvbWFkb3IucHJvdG90eXBlLmJyID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmFwcGVuZCgnICAnICsgIHRoaXMubGVmdCk7XG4gIHJldHVybiB0aGlzLmF0TGVmdCA9IHRoaXMubm9UcmFpbGluZ1doaXRlc3BhY2UgPSB0cnVlO1xufTtcblxuRG9tYWRvci5wcm90b3R5cGUuY29kZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG9sZDtcbiAgb2xkID0gdGhpcy5pbkNvZGU7XG4gIHRoaXMuaW5Db2RlID0gdHJ1ZTtcbiAgcmV0dXJuIChmdW5jdGlvbihfdGhpcykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfdGhpcy5pbkNvZGUgPSBvbGQ7XG4gICAgfTtcbiAgfSkodGhpcyk7XG59O1xuXG5Eb21hZG9yLnByb3RvdHlwZS5saSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHJlc3VsdDtcbiAgcmVzdWx0ID0gdGhpcy5pbk9yZGVyZWRMaXN0ID8gKHRoaXMub3JkZXIrKykgKyAnLiAnIDogJyogJztcbiAgcmVzdWx0ID0gcGFkTGVmdChyZXN1bHQsICh0aGlzLmxpc3REZXB0aCAtIDEpICogMik7XG4gIHJldHVybiB0aGlzLmFwcGVuZChyZXN1bHQpO1xufTtcblxuRG9tYWRvci5wcm90b3R5cGUub2wgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBpbk9yZGVyZWRMaXN0LCBvcmRlcjtcbiAgaWYgKHRoaXMubGlzdERlcHRoID09PSAwKSB7XG4gICAgdGhpcy5wKCk7XG4gIH1cbiAgaW5PcmRlcmVkTGlzdCA9IHRoaXMuaW5PcmRlcmVkTGlzdDtcbiAgb3JkZXIgPSB0aGlzLm9yZGVyO1xuICB0aGlzLmluT3JkZXJlZExpc3QgPSB0cnVlO1xuICB0aGlzLm9yZGVyID0gMTtcbiAgdGhpcy5saXN0RGVwdGgrKztcbiAgcmV0dXJuIChmdW5jdGlvbihfdGhpcykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIF90aGlzLmluT3JkZXJlZExpc3QgPSBpbk9yZGVyZWRMaXN0O1xuICAgICAgX3RoaXMub3JkZXIgPSBvcmRlcjtcbiAgICAgIHJldHVybiBfdGhpcy5saXN0RGVwdGgtLTtcbiAgICB9O1xuICB9KSh0aGlzKTtcbn07XG5cbkRvbWFkb3IucHJvdG90eXBlLm91dHB1dCA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gIGlmICghdGV4dCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoIXRoaXMuaW5QcmUpIHtcbiAgICB0ZXh0ID0gdGhpcy5ub1RyYWlsaW5nV2hpdGVzcGFjZSA/IHRleHQucmVwbGFjZSgvXlsgXFx0XFxuXSsvLCAnJykgOiAvXlsgXFx0XSpcXG4vLnRlc3QodGV4dCkgPyB0ZXh0LnJlcGxhY2UoL15bIFxcdFxcbl0rLywgJ1xcbicpIDogdGV4dC5yZXBsYWNlKC9eWyBcXHRdKy8sICcgJyk7XG4gIH1cbiAgaWYgKHRleHQgPT09ICcnKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuYXRQID0gL1xcblxcbiQvLnRlc3QodGV4dCk7XG4gIHRoaXMuYXRMZWZ0ID0gL1xcbiQvLnRlc3QodGV4dCk7XG4gIHRoaXMubm9UcmFpbGluZ1doaXRlc3BhY2UgPSAvWyBcXHRcXG5dJC8udGVzdCh0ZXh0KTtcbiAgcmV0dXJuIHRoaXMuYXBwZW5kKHRleHQucmVwbGFjZSgvXFxuL2csIHRoaXMubGVmdCkpO1xufTtcblxuRG9tYWRvci5wcm90b3R5cGUub3V0cHV0TGF0ZXIgPSBmdW5jdGlvbiAodGV4dCkge1xuICByZXR1cm4gKGZ1bmN0aW9uKHNlbGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHNlbGYub3V0cHV0KHRleHQpO1xuICAgIH07XG4gIH0pKHRoaXMpO1xufTtcblxuRG9tYWRvci5wcm90b3R5cGUucCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYXRQKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh0aGlzLnN0YXJ0aW5nQmxvY2txdW90ZSkge1xuICAgIHRoaXMuYXBwZW5kKCdcXG4nKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmFwcGVuZCh0aGlzLmxlZnQpO1xuICB9XG4gIGlmICghdGhpcy5hdExlZnQpIHtcbiAgICB0aGlzLmFwcGVuZCh0aGlzLmxlZnQpO1xuICAgIHRoaXMuYXRMZWZ0ID0gdHJ1ZTtcbiAgfVxuICByZXR1cm4gdGhpcy5ub1RyYWlsaW5nV2hpdGVzcGFjZSA9IHRoaXMuYXRQID0gdHJ1ZTtcbn07XG5cbkRvbWFkb3IucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY29udGFpbmVyO1xuICB2YXIgaTtcbiAgdmFyIGxpbms7XG4gIHZhciByZWY7XG4gIHRoaXMuYnVmZmVyID0gJyc7XG4gIGlmICghdGhpcy5odG1sKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyO1xuICB9XG4gIGlmICh0eXBlb2YgdGhpcy5odG1sID09PSAnc3RyaW5nJykge1xuICAgIGNvbnRhaW5lciA9IHdpbmRvd0NvbnRleHQuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9IHRoaXMuaHRtbDtcbiAgfSBlbHNlIHtcbiAgICBjb250YWluZXIgPSB0aGlzLmh0bWw7XG4gIH1cbiAgdGhpcy5wcm9jZXNzKGNvbnRhaW5lcik7XG4gIGlmICh0aGlzLmxpbmtzLmxlbmd0aCkge1xuICAgIHdoaWxlICh0aGlzLmxhc3RFbGVtZW50LnBhcmVudEVsZW1lbnQgIT09IGNvbnRhaW5lciAmJiB0aGlzLmxhc3RFbGVtZW50LnRhZ05hbWUgIT09ICdCTE9DS1FVT1RFJykge1xuICAgICAgdGhpcy5sYXN0RWxlbWVudCA9IHRoaXMubGFzdEVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICB9XG4gICAgaWYgKHRoaXMubGFzdEVsZW1lbnQudGFnTmFtZSAhPT0gJ0JMT0NLUVVPVEUnKSB7XG4gICAgICB0aGlzLmFwcGVuZCgnXFxuXFxuJyk7XG4gICAgfVxuICAgIHJlZiA9IHRoaXMubGlua3M7XG4gICAgZm9yIChpID0gMDsgaSA8IHJlZi5sZW5ndGg7IGkrKykge1xuICAgICAgbGluayA9IHJlZltpXTtcbiAgICAgIGlmIChsaW5rKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKCdbJyArIChpICsgMSkgKyAnXTogJyArIGxpbmsgKyAnXFxuJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHRoaXMuYXBwZW5kKCcnKTtcbiAgcmV0dXJuIHRoaXMuYnVmZmVyID0gdHJpbSh0aGlzLmJ1ZmZlcik7XG59O1xuXG5Eb21hZG9yLnByb3RvdHlwZS5wcmUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvbGQ7XG4gIG9sZCA9IHRoaXMuaW5QcmU7XG4gIHRoaXMuaW5QcmUgPSB0cnVlO1xuICByZXR1cm4gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF90aGlzLmluUHJlID0gb2xkO1xuICAgIH07XG4gIH0pKHRoaXMpO1xufTtcblxuRG9tYWRvci5wcm90b3R5cGUuaHRtbFRhZyA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHRoaXMub3V0cHV0KCc8JyArIHR5cGUgKyAnPicpO1xuICByZXR1cm4gdGhpcy5vdXRwdXRMYXRlcignPC8nICsgdHlwZSArICc+Jyk7XG59O1xuXG5Eb21hZG9yLnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKGVsKSB7XG4gIHZhciBhZnRlcjtcbiAgdmFyIGFmdGVyMTtcbiAgdmFyIGFmdGVyMjtcbiAgdmFyIGJhc2U7XG4gIHZhciBocmVmO1xuICB2YXIgaTtcbiAgdmFyIHJlZjtcbiAgdmFyIHNyYztcbiAgdmFyIHN1ZmZpeDtcbiAgdmFyIHN1bW1hcnk7XG4gIHZhciB0aXRsZTtcblxuICBpZiAoIWlzVmlzaWJsZShlbCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoZWwubm9kZVR5cGUgPT09IHdpbmRvd0NvbnRleHQuTm9kZS5URVhUX05PREUpIHtcbiAgICBpZiAoZWwubm9kZVZhbHVlLnJlcGxhY2UoL1xcbi9nLCAnJykubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLmluUHJlKSB7XG4gICAgICByZXR1cm4gdGhpcy5vdXRwdXQoZWwubm9kZVZhbHVlKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaW5Db2RlKSB7XG4gICAgICByZXR1cm4gdGhpcy5vdXRwdXQocHJvY2Vzc0NvZGUoZWwubm9kZVZhbHVlKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm91dHB1dChwcm9jZXNzUGxhaW5UZXh0KGVsLm5vZGVWYWx1ZSwgZWwucGFyZW50RWxlbWVudCAmJiBlbC5wYXJlbnRFbGVtZW50LnRhZ05hbWUpKTtcbiAgfVxuXG4gIGlmIChlbC5ub2RlVHlwZSAhPT0gd2luZG93Q29udGV4dC5Ob2RlLkVMRU1FTlRfTk9ERSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMubGFzdEVsZW1lbnQgPSBlbDtcblxuICB2YXIgdHJhbnNmb3JtZWQgPSB0aGlzLm9wdGlvbnMudHJhbnNmb3JtKGVsKTtcbiAgaWYgKHRyYW5zZm9ybWVkICE9PSB2b2lkIDApIHtcbiAgICByZXR1cm4gdGhpcy5vdXRwdXQodHJhbnNmb3JtZWQpO1xuICB9XG4gIGlmIChzaGFsbG93VGFncy5pbmRleE9mKGVsLnRhZ05hbWUpICE9PSAtMSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHN3aXRjaCAoZWwudGFnTmFtZSkge1xuICAgIGNhc2UgJ0gxJzpcbiAgICBjYXNlICdIMic6XG4gICAgY2FzZSAnSDMnOlxuICAgIGNhc2UgJ0g0JzpcbiAgICBjYXNlICdINSc6XG4gICAgY2FzZSAnSDYnOlxuICAgICAgdGhpcy5wKCk7XG4gICAgICB0aGlzLm91dHB1dChtYW55KCcjJywgcGFyc2VJbnQoZWwudGFnTmFtZS5tYXRjaChyaGVhZGluZylbMV0pKSArICcgJyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdBRERSRVNTJzpcbiAgICBjYXNlICdBUlRJQ0xFJzpcbiAgICBjYXNlICdBU0lERSc6XG4gICAgY2FzZSAnRElWJzpcbiAgICBjYXNlICdGSUVMRFNFVCc6XG4gICAgY2FzZSAnRk9PVEVSJzpcbiAgICBjYXNlICdIRUFERVInOlxuICAgIGNhc2UgJ05BVic6XG4gICAgY2FzZSAnUCc6XG4gICAgY2FzZSAnU0VDVElPTic6XG4gICAgICB0aGlzLnAoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0JPRFknOlxuICAgIGNhc2UgJ0ZPUk0nOlxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnREVUQUlMUyc6XG4gICAgICB0aGlzLnAoKTtcbiAgICAgIGlmICghaGFzKGVsLCAnb3BlbicsIGZhbHNlKSkge1xuICAgICAgICBzdW1tYXJ5ID0gZWwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3N1bW1hcnknKVswXTtcbiAgICAgICAgaWYgKHN1bW1hcnkpIHtcbiAgICAgICAgICB0aGlzLnByb2Nlc3Moc3VtbWFyeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnQlInOlxuICAgICAgdGhpcy5icigpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnSFInOlxuICAgICAgdGhpcy5wKCk7XG4gICAgICB0aGlzLm91dHB1dCgnLS0tLS0tLS0tJyk7XG4gICAgICB0aGlzLnAoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0NJVEUnOlxuICAgIGNhc2UgJ0RGTic6XG4gICAgY2FzZSAnRU0nOlxuICAgIGNhc2UgJ0knOlxuICAgIGNhc2UgJ1UnOlxuICAgIGNhc2UgJ1ZBUic6XG4gICAgICB0aGlzLm91dHB1dCgnXycpO1xuICAgICAgdGhpcy5ub1RyYWlsaW5nV2hpdGVzcGFjZSA9IHRydWU7XG4gICAgICBhZnRlciA9IHRoaXMub3V0cHV0TGF0ZXIoJ18nKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0RUJzpcbiAgICBjYXNlICdCJzpcbiAgICBjYXNlICdTVFJPTkcnOlxuICAgICAgaWYgKGVsLnRhZ05hbWUgPT09ICdEVCcpIHtcbiAgICAgICAgdGhpcy5wKCk7XG4gICAgICB9XG4gICAgICB0aGlzLm91dHB1dCgnKionKTtcbiAgICAgIHRoaXMubm9UcmFpbGluZ1doaXRlc3BhY2UgPSB0cnVlO1xuICAgICAgYWZ0ZXIgPSB0aGlzLm91dHB1dExhdGVyKCcqKicpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUSc6XG4gICAgICB0aGlzLm91dHB1dCgnXCInKTtcbiAgICAgIHRoaXMubm9UcmFpbGluZ1doaXRlc3BhY2UgPSB0cnVlO1xuICAgICAgYWZ0ZXIgPSB0aGlzLm91dHB1dExhdGVyKCdcIicpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnT0wnOlxuICAgICAgYWZ0ZXIgPSB0aGlzLm9sKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdVTCc6XG4gICAgICBhZnRlciA9IHRoaXMudWwoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0xJJzpcbiAgICAgIHRoaXMucmVwbGFjZUxlZnQoJ1xcbicpO1xuICAgICAgdGhpcy5saSgpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUFJFJzpcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZmVuY2luZykge1xuICAgICAgICB0aGlzLmFwcGVuZCgnXFxuXFxuJyk7XG4gICAgICAgIHRoaXMub3V0cHV0KFsnYGBgJywgJ1xcbiddLmpvaW4odGhpcy5vcHRpb25zLmZlbmNpbmdsYW5ndWFnZShlbCkgfHwgJycpKTtcbiAgICAgICAgYWZ0ZXIxID0gdGhpcy5wcmUoKTtcbiAgICAgICAgYWZ0ZXIyID0gdGhpcy5vdXRwdXRMYXRlcignXFxuYGBgJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhZnRlcjEgPSB0aGlzLnB1c2hMZWZ0KCcgICAgJyk7XG4gICAgICAgIGFmdGVyMiA9IHRoaXMucHJlKCk7XG4gICAgICB9XG4gICAgICBhZnRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBhZnRlcjEoKTtcbiAgICAgICAgcmV0dXJuIGFmdGVyMigpO1xuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0NPREUnOlxuICAgIGNhc2UgJ1NBTVAnOlxuICAgICAgaWYgKHRoaXMuaW5QcmUpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB0aGlzLm91dHB1dCgnYCcpO1xuICAgICAgYWZ0ZXIxID0gdGhpcy5jb2RlKCk7XG4gICAgICBhZnRlcjIgPSB0aGlzLm91dHB1dExhdGVyKCdgJyk7XG4gICAgICBhZnRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBhZnRlcjEoKTtcbiAgICAgICAgcmV0dXJuIGFmdGVyMigpO1xuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0JMT0NLUVVPVEUnOlxuICAgIGNhc2UgJ0REJzpcbiAgICAgIHRoaXMuc3RhcnRpbmdCbG9ja3F1b3RlID0gdHJ1ZTtcbiAgICAgIGFmdGVyID0gdGhpcy5wdXNoTGVmdCgnPiAnKTtcbiAgICAgIHRoaXMuc3RhcnRpbmdCbG9ja3F1b3RlID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdLQkQnOlxuICAgICAgYWZ0ZXIgPSB0aGlzLmh0bWxUYWcoJ2tiZCcpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnQSc6XG4gICAgICBocmVmID0gYXR0cihlbCwgJ2hyZWYnLCB0aGlzLm9wdGlvbnMuYWJzb2x1dGUpO1xuICAgICAgaWYgKCFocmVmKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgdGl0bGUgPSBhdHRyKGVsLCAndGl0bGUnKTtcbiAgICAgIGlmICh0aXRsZSkge1xuICAgICAgICBocmVmICs9ICcgXCInICsgdGl0bGUgKyAnXCInO1xuICAgICAgfVxuICAgICAgc3VmZml4ID0gdGhpcy5vcHRpb25zLmlubGluZSA/ICcoJyArIGhyZWYgKyAnKScgOiAnWycgKyAoKGJhc2UgPSB0aGlzLmxpbmtNYXApW2hyZWZdICE9IG51bGwgPyBiYXNlW2hyZWZdIDogYmFzZVtocmVmXSA9IHRoaXMubGlua3MucHVzaChocmVmKSkgKyAnXSc7XG4gICAgICB0aGlzLm91dHB1dCgnWycpO1xuICAgICAgdGhpcy5ub1RyYWlsaW5nV2hpdGVzcGFjZSA9IHRydWU7XG4gICAgICBhZnRlciA9IHRoaXMub3V0cHV0TGF0ZXIoJ10nICsgc3VmZml4KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0lNRyc6XG4gICAgICBzcmMgPSBhdHRyKGVsLCAnc3JjJywgdGhpcy5vcHRpb25zLmFic29sdXRlKTtcbiAgICAgIGlmICghc3JjKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgdGhpcy5vdXRwdXQoJyFbJyArIChhdHRyKGVsLCAnYWx0JykpICsgJ10oJyArIHNyYyArICcpJyk7XG4gICAgICByZXR1cm47XG4gICAgY2FzZSAnRlJBTUUnOlxuICAgIGNhc2UgJ0lGUkFNRSc6XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoKHJlZiA9IGVsLmNvbnRlbnREb2N1bWVudCkgIT0gbnVsbCA/IHJlZi5kb2N1bWVudEVsZW1lbnQgOiB2b2lkIDApIHtcbiAgICAgICAgICB0aGlzLnByb2Nlc3MoZWwuY29udGVudERvY3VtZW50LmRvY3VtZW50RWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIGNhc2UgJ1RSJzpcbiAgICAgIGFmdGVyID0gdGhpcy5wO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICBmb3IgKGkgPSAwOyBpIDwgZWwuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMucHJvY2VzcyhlbC5jaGlsZE5vZGVzW2ldKTtcbiAgfVxuXG4gIGlmIChhZnRlcikge1xuICAgIHJldHVybiBhZnRlci5jYWxsKHRoaXMpO1xuICB9XG59O1xuXG5Eb21hZG9yLnByb3RvdHlwZS5wdXNoTGVmdCA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gIHZhciBvbGQ7XG4gIG9sZCA9IHRoaXMubGVmdDtcbiAgdGhpcy5sZWZ0ICs9IHRleHQ7XG4gIGlmICh0aGlzLmF0UCkge1xuICAgIHRoaXMuYXBwZW5kKHRleHQpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMucCgpO1xuICB9XG4gIHJldHVybiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBfdGhpcy5sZWZ0ID0gb2xkO1xuICAgICAgX3RoaXMuYXRMZWZ0ID0gX3RoaXMuYXRQID0gZmFsc2U7XG4gICAgICByZXR1cm4gX3RoaXMucCgpO1xuICAgIH07XG4gIH0pKHRoaXMpO1xufTtcblxuRG9tYWRvci5wcm90b3R5cGUucmVwbGFjZUxlZnQgPSBmdW5jdGlvbiAodGV4dCkge1xuICBpZiAoIXRoaXMuYXRMZWZ0KSB7XG4gICAgdGhpcy5hcHBlbmQodGhpcy5sZWZ0LnJlcGxhY2UoL1sgXXsyLDR9JC8sIHRleHQpKTtcbiAgICByZXR1cm4gdGhpcy5hdExlZnQgPSB0aGlzLm5vVHJhaWxpbmdXaGl0ZXNwYWNlID0gdGhpcy5hdFAgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHRoaXMubGFzdCkge1xuICAgIHJldHVybiB0aGlzLmxhc3QgPSB0aGlzLmxhc3QucmVwbGFjZSgvWyBdezIsNH0kLywgdGV4dCk7XG4gIH1cbn07XG5cbkRvbWFkb3IucHJvdG90eXBlLnVsID0gZnVuY3Rpb24gKCkge1xuICB2YXIgaW5PcmRlcmVkTGlzdCwgb3JkZXI7XG4gIGlmICh0aGlzLmxpc3REZXB0aCA9PT0gMCkge1xuICAgIHRoaXMucCgpO1xuICB9XG4gIGluT3JkZXJlZExpc3QgPSB0aGlzLmluT3JkZXJlZExpc3Q7XG4gIG9yZGVyID0gdGhpcy5vcmRlcjtcbiAgdGhpcy5pbk9yZGVyZWRMaXN0ID0gZmFsc2U7XG4gIHRoaXMub3JkZXIgPSAxO1xuICB0aGlzLmxpc3REZXB0aCsrO1xuICByZXR1cm4gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgX3RoaXMuaW5PcmRlcmVkTGlzdCA9IGluT3JkZXJlZExpc3Q7XG4gICAgICBfdGhpcy5vcmRlciA9IG9yZGVyO1xuICAgICAgcmV0dXJuIF90aGlzLmxpc3REZXB0aC0tO1xuICAgIH07XG4gIH0pKHRoaXMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3c7XG5cbmlmICghd2luZG93Lk5vZGUpIHtcbiAgd2luZG93Lk5vZGUgPSB7XG4gICAgRUxFTUVOVF9OT0RFOiAxLFxuICAgIFRFWFRfTk9ERTogM1xuICB9O1xufVxuIl19
