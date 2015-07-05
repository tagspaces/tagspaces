!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.megamark=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var MarkdownIt = require('markdown-it');
var hljs = require('highlight.js');
var tokenizeLinks = require('./tokenizeLinks');
var md = new MarkdownIt({
  html: true,
  xhtmlOut: true,
  linkify: true,
  typographer: true,
  langPrefix: 'md-lang-alias-',
  highlight: highlight
});
var ralias = / class="md-lang-alias-([^"]+)"/;
var aliases = {
  js: 'javascript',
  md: 'markdown',
  html: 'xml', // next best thing
  jade: 'css' // next best thing
};
var baseblock = md.renderer.rules.code_block;
var baseinline = md.renderer.rules.code_inline;
var basefence = md.renderer.rules.fence;
var basetext = md.renderer.rules.text;
var textcached = textparser([]);
var languages = [];
var context = {};

md.core.ruler.before('linkify', 'linkify-tokenizer', linkifyTokenizer, {});
md.renderer.rules.code_block = block;
md.renderer.rules.code_inline = inline;
md.renderer.rules.fence = fence;

hljs.configure({ tabReplace: 2, classPrefix: 'md-code-' });

function highlight (code, lang) {
  var lower = String(lang).toLowerCase();
  try {
    return hljs.highlight(aliases[lower] || lower, code).value;
  } catch (e) {
    return '';
  }
}

function block () {
  var base = baseblock.apply(this, arguments).substr(11); // starts with '<pre><code>'
  var classed = '<pre class="md-code-block"><code class="md-code">' + base;
  return classed;
}

function inline () {
  var base = baseinline.apply(this, arguments).substr(6); // starts with '<code>'
  var classed = '<code class="md-code md-code-inline">' + base;
  return classed;
}

function fence () {
  var base = basefence.apply(this, arguments).substr(5); // starts with '<pre>'
  var lang = base.substr(0, 6) !== '<code>'; // when the fence has a language class
  var rest = lang ? base : '<code class="md-code">' + base.substr(6);
  var classed = '<pre class="md-code-block">' + rest;
  var aliased = classed.replace(ralias, aliasing);
  return aliased;
}

function aliasing (all, language) {
  var name = aliases[language] || language || 'unknown';
  var lang = 'md-lang-' + name;
  if (languages.indexOf(lang) === -1) {
    languages.push(lang);
  }
  return ' class="md-code ' + lang + '"';
}

function textparser (tokenizers) {
  return function parseText () {
    var base = basetext.apply(this, arguments);
    var fancy = fanciful(base);
    var tokenized = tokenize(fancy, tokenizers);
    return tokenized;
  };
}

function fanciful (text) {
  return text
    .replace(/--/g, '\u2014')                            // em-dashes
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')      // opening singles
    .replace(/'/g, '\u2019')                             // closing singles & apostrophes
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c') // opening doubles
    .replace(/"/g, '\u201d')                             // closing doubles
    .replace(/\.{3}/g, '\u2026');                        // ellipses
}

function linkifyTokenizer (state) {
  tokenizeLinks(state, context);
}

function tokenize (text, tokenizers) {
  return tokenizers.reduce(use, text);
  function use (result, tok) {
    return result.replace(tok.token, tok.transform);
  }
}

function markdown (input, options) {
  var tok = options.tokenizers || [];
  var lin = options.linkifiers || [];
  var valid = input === null || input === void 0 ? '' : String(input);
  context.tokenizers = tok;
  context.linkifiers = lin;
  md.renderer.rules.text = tok.length ? textparser(tok) : textcached;
  var html = md.render(valid);
  return html;
}

markdown.parser = md;
markdown.languages = languages;
module.exports = markdown;

},{"./tokenizeLinks":83,"highlight.js":5,"markdown-it":31}],2:[function(require,module,exports){
'use strict';

var insane = require('insane');
var assign = require('assignment');
var markdown = require('./markdown');
var hightokens = require('highlight.js-tokens').map(codeclass);

function codeclass (token) {
  return 'md-code-' + token;
}

function sanitize (html, options) {
  var configuration = assign({}, options, {
    allowedClasses: {
      pre: ['md-code-block'],
      code: markdown.languages,
      span: hightokens
    }
  });
  return insane(html, configuration);
}

function megamark (md, options) {
  var o = options || {};
  var html = markdown(md, o);
  var sane = sanitize(html, o.sanitizer);
  return sane;
}

markdown.languages.push('md-code', 'md-code-inline'); // only sanitizing purposes
megamark.parser = markdown.parser;
module.exports = megamark;

},{"./markdown":1,"assignment":3,"highlight.js-tokens":14,"insane":18}],3:[function(require,module,exports){
'use strict';

function assignment (result) {
  var stack = Array.prototype.slice.call(arguments, 1);
  var item;
  var key;
  while (stack.length) {
    item = stack.shift();
    for (key in item) {
      if (item.hasOwnProperty(key)) {
        if (typeof result[key] === 'object' && result[key] && Object.prototype.toString.call(result[key]) !== '[object Array]') {
          result[key] = assignment(result[key], item[key]);
        } else {
          result[key] = item[key];
        }
      }
    }
  }
  return result;
}

module.exports = assignment;

},{}],4:[function(require,module,exports){
var Highlight = function() {

  /* Utility functions */

  function escape(value) {
    return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
  }

  function tag(node) {
    return node.nodeName.toLowerCase();
  }

  function testRe(re, lexeme) {
    var match = re && re.exec(lexeme);
    return match && match.index == 0;
  }

  function blockText(block) {
    return Array.prototype.map.call(block.childNodes, function(node) {
      if (node.nodeType == 3) {
        return options.useBR ? node.nodeValue.replace(/\n/g, '') : node.nodeValue;
      }
      if (tag(node) == 'br') {
        return '\n';
      }
      return blockText(node);
    }).join('');
  }

  function blockLanguage(block) {
    var classes = (block.className + ' ' + (block.parentNode ? block.parentNode.className : '')).split(/\s+/);
    classes = classes.map(function(c) {return c.replace(/^language-/, '');});
    return classes.filter(function(c) {return getLanguage(c) || c == 'no-highlight';})[0];
  }

  function inherit(parent, obj) {
    var result = {};
    for (var key in parent)
      result[key] = parent[key];
    if (obj)
      for (var key in obj)
        result[key] = obj[key];
    return result;
  };

  /* Stream merging */

  function nodeStream(node) {
    var result = [];
    (function _nodeStream(node, offset) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType == 3)
          offset += child.nodeValue.length;
        else if (tag(child) == 'br')
          offset += 1;
        else if (child.nodeType == 1) {
          result.push({
            event: 'start',
            offset: offset,
            node: child
          });
          offset = _nodeStream(child, offset);
          result.push({
            event: 'stop',
            offset: offset,
            node: child
          });
        }
      }
      return offset;
    })(node, 0);
    return result;
  }

  function mergeStreams(original, highlighted, value) {
    var processed = 0;
    var result = '';
    var nodeStack = [];

    function selectStream() {
      if (!original.length || !highlighted.length) {
        return original.length ? original : highlighted;
      }
      if (original[0].offset != highlighted[0].offset) {
        return (original[0].offset < highlighted[0].offset) ? original : highlighted;
      }

      /*
      To avoid starting the stream just before it should stop the order is
      ensured that original always starts first and closes last:

      if (event1 == 'start' && event2 == 'start')
        return original;
      if (event1 == 'start' && event2 == 'stop')
        return highlighted;
      if (event1 == 'stop' && event2 == 'start')
        return original;
      if (event1 == 'stop' && event2 == 'stop')
        return highlighted;

      ... which is collapsed to:
      */
      return highlighted[0].event == 'start' ? original : highlighted;
    }

    function open(node) {
      function attr_str(a) {return ' ' + a.nodeName + '="' + escape(a.value) + '"';}
      result += '<' + tag(node) + Array.prototype.map.call(node.attributes, attr_str).join('') + '>';
    }

    function close(node) {
      result += '</' + tag(node) + '>';
    }

    function render(event) {
      (event.event == 'start' ? open : close)(event.node);
    }

    while (original.length || highlighted.length) {
      var stream = selectStream();
      result += escape(value.substr(processed, stream[0].offset - processed));
      processed = stream[0].offset;
      if (stream == original) {
        /*
        On any opening or closing tag of the original markup we first close
        the entire highlighted node stack, then render the original tag along
        with all the following original tags at the same offset and then
        reopen all the tags on the highlighted stack.
        */
        nodeStack.reverse().forEach(close);
        do {
          render(stream.splice(0, 1)[0]);
          stream = selectStream();
        } while (stream == original && stream.length && stream[0].offset == processed);
        nodeStack.reverse().forEach(open);
      } else {
        if (stream[0].event == 'start') {
          nodeStack.push(stream[0].node);
        } else {
          nodeStack.pop();
        }
        render(stream.splice(0, 1)[0]);
      }
    }
    return result + escape(value.substr(processed));
  }

  /* Initialization */

  function compileLanguage(language) {

    function reStr(re) {
        return (re && re.source) || re;
    }

    function langRe(value, global) {
      return RegExp(
        reStr(value),
        'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '')
      );
    }

    function compileMode(mode, parent) {
      if (mode.compiled)
        return;
      mode.compiled = true;

      mode.keywords = mode.keywords || mode.beginKeywords;
      if (mode.keywords) {
        var compiled_keywords = {};

        function flatten(className, str) {
          if (language.case_insensitive) {
            str = str.toLowerCase();
          }
          str.split(' ').forEach(function(kw) {
            var pair = kw.split('|');
            compiled_keywords[pair[0]] = [className, pair[1] ? Number(pair[1]) : 1];
          });
        }

        if (typeof mode.keywords == 'string') { // string
          flatten('keyword', mode.keywords);
        } else {
          Object.keys(mode.keywords).forEach(function (className) {
            flatten(className, mode.keywords[className]);
          });
        }
        mode.keywords = compiled_keywords;
      }
      mode.lexemesRe = langRe(mode.lexemes || /\b[A-Za-z0-9_]+\b/, true);

      if (parent) {
        if (mode.beginKeywords) {
          mode.begin = mode.beginKeywords.split(' ').join('|');
        }
        if (!mode.begin)
          mode.begin = /\B|\b/;
        mode.beginRe = langRe(mode.begin);
        if (!mode.end && !mode.endsWithParent)
          mode.end = /\B|\b/;
        if (mode.end)
          mode.endRe = langRe(mode.end);
        mode.terminator_end = reStr(mode.end) || '';
        if (mode.endsWithParent && parent.terminator_end)
          mode.terminator_end += (mode.end ? '|' : '') + parent.terminator_end;
      }
      if (mode.illegal)
        mode.illegalRe = langRe(mode.illegal);
      if (mode.relevance === undefined)
        mode.relevance = 1;
      if (!mode.contains) {
        mode.contains = [];
      }
      var expanded_contains = [];
      mode.contains.forEach(function(c) {
        if (c.variants) {
          c.variants.forEach(function(v) {expanded_contains.push(inherit(c, v));});
        } else {
          expanded_contains.push(c == 'self' ? mode : c);
        }
      });
      mode.contains = expanded_contains;
      mode.contains.forEach(function(c) {compileMode(c, mode);});

      if (mode.starts) {
        compileMode(mode.starts, parent);
      }

      var terminators =
        mode.contains.map(function(c) {
          return c.beginKeywords ? '\\.?\\b(' + c.begin + ')\\b\\.?' : c.begin;
        })
        .concat([mode.terminator_end])
        .concat([mode.illegal])
        .map(reStr)
        .filter(Boolean);
      mode.terminators = terminators.length ? langRe(terminators.join('|'), true) : {exec: function(s) {return null;}};

      mode.continuation = {};
    }

    compileMode(language);
  }

  /*
  Core highlighting function. Accepts a language name, or an alias, and a
  string with the code to highlight. Returns an object with the following
  properties:

  - relevance (int)
  - value (an HTML string with highlighting markup)

  */
  function highlight(name, value, ignore_illegals, continuation) {

    function subMode(lexeme, mode) {
      for (var i = 0; i < mode.contains.length; i++) {
        if (testRe(mode.contains[i].beginRe, lexeme)) {
          return mode.contains[i];
        }
      }
    }

    function endOfMode(mode, lexeme) {
      if (testRe(mode.endRe, lexeme)) {
        return mode;
      }
      if (mode.endsWithParent) {
        return endOfMode(mode.parent, lexeme);
      }
    }

    function isIllegal(lexeme, mode) {
      return !ignore_illegals && testRe(mode.illegalRe, lexeme);
    }

    function keywordMatch(mode, match) {
      var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0];
      return mode.keywords.hasOwnProperty(match_str) && mode.keywords[match_str];
    }

    function buildSpan(classname, insideSpan, leaveOpen, noPrefix) {
      var classPrefix = noPrefix ? '' : options.classPrefix,
          openSpan    = '<span class="' + classPrefix,
          closeSpan   = leaveOpen ? '' : '</span>';

      openSpan += classname + '">';

      return openSpan + insideSpan + closeSpan;
    }

    function processKeywords() {
      var buffer = escape(mode_buffer);
      if (!top.keywords)
        return buffer;
      var result = '';
      var last_index = 0;
      top.lexemesRe.lastIndex = 0;
      var match = top.lexemesRe.exec(buffer);
      while (match) {
        result += buffer.substr(last_index, match.index - last_index);
        var keyword_match = keywordMatch(top, match);
        if (keyword_match) {
          relevance += keyword_match[1];
          result += buildSpan(keyword_match[0], match[0]);
        } else {
          result += match[0];
        }
        last_index = top.lexemesRe.lastIndex;
        match = top.lexemesRe.exec(buffer);
      }
      return result + buffer.substr(last_index);
    }

    function processSubLanguage() {
      if (top.subLanguage && !languages[top.subLanguage]) {
        return escape(mode_buffer);
      }
      var result = top.subLanguage ? highlight(top.subLanguage, mode_buffer, true, top.continuation.top) : highlightAuto(mode_buffer);
      // Counting embedded language score towards the host language may be disabled
      // with zeroing the containing mode relevance. Usecase in point is Markdown that
      // allows XML everywhere and makes every XML snippet to have a much larger Markdown
      // score.
      if (top.relevance > 0) {
        relevance += result.relevance;
      }
      if (top.subLanguageMode == 'continuous') {
        top.continuation.top = result.top;
      }
      return buildSpan(result.language, result.value, false, true);
    }

    function processBuffer() {
      return top.subLanguage !== undefined ? processSubLanguage() : processKeywords();
    }

    function startNewMode(mode, lexeme) {
      var markup = mode.className? buildSpan(mode.className, '', true): '';
      if (mode.returnBegin) {
        result += markup;
        mode_buffer = '';
      } else if (mode.excludeBegin) {
        result += escape(lexeme) + markup;
        mode_buffer = '';
      } else {
        result += markup;
        mode_buffer = lexeme;
      }
      top = Object.create(mode, {parent: {value: top}});
    }

    function processLexeme(buffer, lexeme) {

      mode_buffer += buffer;
      if (lexeme === undefined) {
        result += processBuffer();
        return 0;
      }

      var new_mode = subMode(lexeme, top);
      if (new_mode) {
        result += processBuffer();
        startNewMode(new_mode, lexeme);
        return new_mode.returnBegin ? 0 : lexeme.length;
      }

      var end_mode = endOfMode(top, lexeme);
      if (end_mode) {
        var origin = top;
        if (!(origin.returnEnd || origin.excludeEnd)) {
          mode_buffer += lexeme;
        }
        result += processBuffer();
        do {
          if (top.className) {
            result += '</span>';
          }
          relevance += top.relevance;
          top = top.parent;
        } while (top != end_mode.parent);
        if (origin.excludeEnd) {
          result += escape(lexeme);
        }
        mode_buffer = '';
        if (end_mode.starts) {
          startNewMode(end_mode.starts, '');
        }
        return origin.returnEnd ? 0 : lexeme.length;
      }

      if (isIllegal(lexeme, top))
        throw new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.className || '<unnamed>') + '"');

      /*
      Parser should not reach this point as all types of lexemes should be caught
      earlier, but if it does due to some bug make sure it advances at least one
      character forward to prevent infinite looping.
      */
      mode_buffer += lexeme;
      return lexeme.length || 1;
    }

    var language = getLanguage(name);
    if (!language) {
      throw new Error('Unknown language: "' + name + '"');
    }

    compileLanguage(language);
    var top = continuation || language;
    var result = '';
    for(var current = top; current != language; current = current.parent) {
      if (current.className) {
        result = buildSpan(current.className, result, true);
      }
    }
    var mode_buffer = '';
    var relevance = 0;
    try {
      var match, count, index = 0;
      while (true) {
        top.terminators.lastIndex = index;
        match = top.terminators.exec(value);
        if (!match)
          break;
        count = processLexeme(value.substr(index, match.index - index), match[0]);
        index = match.index + count;
      }
      processLexeme(value.substr(index));
      for(var current = top; current.parent; current = current.parent) { // close dangling modes
        if (current.className) {
          result += '</span>';
        }
      };
      return {
        relevance: relevance,
        value: result,
        language: name,
        top: top
      };
    } catch (e) {
      if (e.message.indexOf('Illegal') != -1) {
        return {
          relevance: 0,
          value: escape(value)
        };
      } else {
        throw e;
      }
    }
  }

  /*
  Highlighting with language detection. Accepts a string with the code to
  highlight. Returns an object with the following properties:

  - language (detected language)
  - relevance (int)
  - value (an HTML string with highlighting markup)
  - second_best (object with the same structure for second-best heuristically
    detected language, may be absent)

  */
  function highlightAuto(text, languageSubset) {
    languageSubset = languageSubset || options.languages || Object.keys(languages);
    var result = {
      relevance: 0,
      value: escape(text)
    };
    var second_best = result;
    languageSubset.forEach(function(name) {
      if (!getLanguage(name)) {
        return;
      }
      var current = highlight(name, text, false);
      current.language = name;
      if (current.relevance > second_best.relevance) {
        second_best = current;
      }
      if (current.relevance > result.relevance) {
        second_best = result;
        result = current;
      }
    });
    if (second_best.language) {
      result.second_best = second_best;
    }
    return result;
  }

  /*
  Post-processing of the highlighted markup:

  - replace TABs with something more useful
  - replace real line-breaks with '<br>' for non-pre containers

  */
  function fixMarkup(value) {
    if (options.tabReplace) {
      value = value.replace(/^((<[^>]+>|\t)+)/gm, function(match, p1, offset, s) {
        return p1.replace(/\t/g, options.tabReplace);
      });
    }
    if (options.useBR) {
      value = value.replace(/\n/g, '<br>');
    }
    return value;
  }

  /*
  Applies highlighting to a DOM node containing code. Accepts a DOM node and
  two optional parameters for fixMarkup.
  */
  function highlightBlock(block) {
    var text = blockText(block);
    var language = blockLanguage(block);
    if (language == 'no-highlight')
        return;
    var result = language ? highlight(language, text, true) : highlightAuto(text);
    var original = nodeStream(block);
    if (original.length) {
      var pre = document.createElementNS('http://www.w3.org/1999/xhtml', 'pre');
      pre.innerHTML = result.value;
      result.value = mergeStreams(original, nodeStream(pre), text);
    }
    result.value = fixMarkup(result.value);

    block.innerHTML = result.value;
    block.className += ' hljs ' + (!language && result.language || '');
    block.result = {
      language: result.language,
      re: result.relevance
    };
    if (result.second_best) {
      block.second_best = {
        language: result.second_best.language,
        re: result.second_best.relevance
      };
    }
  }

  var options = {
    classPrefix: 'hljs-',
    tabReplace: null,
    useBR: false,
    languages: undefined
  };

  /*
  Updates highlight.js global options with values passed in the form of an object
  */
  function configure(user_options) {
    options = inherit(options, user_options);
  }

  /*
  Applies highlighting to all <pre><code>..</code></pre> blocks on a page.
  */
  function initHighlighting() {
    if (initHighlighting.called)
      return;
    initHighlighting.called = true;

    var blocks = document.querySelectorAll('pre code');
    Array.prototype.forEach.call(blocks, highlightBlock);
  }

  /*
  Attaches highlighting to the page load event.
  */
  function initHighlightingOnLoad() {
    addEventListener('DOMContentLoaded', initHighlighting, false);
    addEventListener('load', initHighlighting, false);
  }

  var languages = {};
  var aliases = {};

  function registerLanguage(name, language) {
    var lang = languages[name] = language(this);
    if (lang.aliases) {
      lang.aliases.forEach(function(alias) {aliases[alias] = name;});
    }
  }

  function getLanguage(name) {
    return languages[name] || languages[aliases[name]];
  }

  /* Interface definition */

  this.highlight = highlight;
  this.highlightAuto = highlightAuto;
  this.fixMarkup = fixMarkup;
  this.highlightBlock = highlightBlock;
  this.configure = configure;
  this.initHighlighting = initHighlighting;
  this.initHighlightingOnLoad = initHighlightingOnLoad;
  this.registerLanguage = registerLanguage;
  this.getLanguage = getLanguage;
  this.inherit = inherit;

  // Common regexps
  this.IDENT_RE = '[a-zA-Z][a-zA-Z0-9_]*';
  this.UNDERSCORE_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9_]*';
  this.NUMBER_RE = '\\b\\d+(\\.\\d+)?';
  this.C_NUMBER_RE = '(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
  this.BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
  this.RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

  // Common modes
  this.BACKSLASH_ESCAPE = {
    begin: '\\\\[\\s\\S]', relevance: 0
  };
  this.APOS_STRING_MODE = {
    className: 'string',
    begin: '\'', end: '\'',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE]
  };
  this.QUOTE_STRING_MODE = {
    className: 'string',
    begin: '"', end: '"',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE]
  };
  this.C_LINE_COMMENT_MODE = {
    className: 'comment',
    begin: '//', end: '$'
  };
  this.C_BLOCK_COMMENT_MODE = {
    className: 'comment',
    begin: '/\\*', end: '\\*/'
  };
  this.HASH_COMMENT_MODE = {
    className: 'comment',
    begin: '#', end: '$'
  };
  this.NUMBER_MODE = {
    className: 'number',
    begin: this.NUMBER_RE,
    relevance: 0
  };
  this.C_NUMBER_MODE = {
    className: 'number',
    begin: this.C_NUMBER_RE,
    relevance: 0
  };
  this.BINARY_NUMBER_MODE = {
    className: 'number',
    begin: this.BINARY_NUMBER_RE,
    relevance: 0
  };
  this.REGEXP_MODE = {
    className: 'regexp',
    begin: /\//, end: /\/[gim]*/,
    illegal: /\n/,
    contains: [
      this.BACKSLASH_ESCAPE,
      {
        begin: /\[/, end: /\]/,
        relevance: 0,
        contains: [this.BACKSLASH_ESCAPE]
      }
    ]
  };
  this.TITLE_MODE = {
    className: 'title',
    begin: this.IDENT_RE,
    relevance: 0
  };
  this.UNDERSCORE_TITLE_MODE = {
    className: 'title',
    begin: this.UNDERSCORE_IDENT_RE,
    relevance: 0
  };
};
module.exports = Highlight;
},{}],5:[function(require,module,exports){
var Highlight = require('./highlight');
var hljs = new Highlight();
hljs.registerLanguage('bash', require('./languages/bash.js'));
hljs.registerLanguage('javascript', require('./languages/javascript.js'));
hljs.registerLanguage('xml', require('./languages/xml.js'));
hljs.registerLanguage('markdown', require('./languages/markdown.js'));
hljs.registerLanguage('css', require('./languages/css.js'));
hljs.registerLanguage('http', require('./languages/http.js'));
hljs.registerLanguage('ini', require('./languages/ini.js'));
hljs.registerLanguage('json', require('./languages/json.js'));
module.exports = hljs;
},{"./highlight":4,"./languages/bash.js":6,"./languages/css.js":7,"./languages/http.js":8,"./languages/ini.js":9,"./languages/javascript.js":10,"./languages/json.js":11,"./languages/markdown.js":12,"./languages/xml.js":13}],6:[function(require,module,exports){
module.exports = function(hljs) {
  var VAR = {
    className: 'variable',
    variants: [
      {begin: /\$[\w\d#@][\w\d_]*/},
      {begin: /\$\{(.*?)\}/}
    ]
  };
  var QUOTE_STRING = {
    className: 'string',
    begin: /"/, end: /"/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      VAR,
      {
        className: 'variable',
        begin: /\$\(/, end: /\)/,
        contains: [hljs.BACKSLASH_ESCAPE]
      }
    ]
  };
  var APOS_STRING = {
    className: 'string',
    begin: /'/, end: /'/
  };

  return {
    lexemes: /-?[a-z\.]+/,
    keywords: {
      keyword:
        'if then else elif fi for break continue while in do done exit return set '+
        'declare case esac export exec',
      literal:
        'true false',
      built_in:
        'printf echo read cd pwd pushd popd dirs let eval unset typeset readonly '+
        'getopts source shopt caller type hash bind help sudo',
      operator:
        '-ne -eq -lt -gt -f -d -e -s -l -a' // relevance booster
    },
    contains: [
      {
        className: 'shebang',
        begin: /^#![^\n]+sh\s*$/,
        relevance: 10
      },
      {
        className: 'function',
        begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
        returnBegin: true,
        contains: [hljs.inherit(hljs.TITLE_MODE, {begin: /\w[\w\d_]*/})],
        relevance: 0
      },
      hljs.HASH_COMMENT_MODE,
      hljs.NUMBER_MODE,
      QUOTE_STRING,
      APOS_STRING,
      VAR
    ]
  };
};
},{}],7:[function(require,module,exports){
module.exports = function(hljs) {
  var IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
  var FUNCTION = {
    className: 'function',
    begin: IDENT_RE + '\\(', end: '\\)',
    contains: ['self', hljs.NUMBER_MODE, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE]
  };
  return {
    case_insensitive: true,
    illegal: '[=/|\']',
    contains: [
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'id', begin: '\\#[A-Za-z0-9_-]+'
      },
      {
        className: 'class', begin: '\\.[A-Za-z0-9_-]+',
        relevance: 0
      },
      {
        className: 'attr_selector',
        begin: '\\[', end: '\\]',
        illegal: '$'
      },
      {
        className: 'pseudo',
        begin: ':(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\"\\\']+'
      },
      {
        className: 'at_rule',
        begin: '@(font-face|page)',
        lexemes: '[a-z-]+',
        keywords: 'font-face page'
      },
      {
        className: 'at_rule',
        begin: '@', end: '[{;]', // at_rule eating first "{" is a good thing
                                 // because it doesn’t let it to be parsed as
                                 // a rule set but instead drops parser into
                                 // the default mode which is how it should be.
        contains: [
          {
            className: 'keyword',
            begin: /\S+/
          },
          {
            begin: /\s/, endsWithParent: true, excludeEnd: true,
            relevance: 0,
            contains: [
              FUNCTION,
              hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE,
              hljs.NUMBER_MODE
            ]
          }
        ]
      },
      {
        className: 'tag', begin: IDENT_RE,
        relevance: 0
      },
      {
        className: 'rules',
        begin: '{', end: '}',
        illegal: '[^\\s]',
        relevance: 0,
        contains: [
          hljs.C_BLOCK_COMMENT_MODE,
          {
            className: 'rule',
            begin: '[^\\s]', returnBegin: true, end: ';', endsWithParent: true,
            contains: [
              {
                className: 'attribute',
                begin: '[A-Z\\_\\.\\-]+', end: ':',
                excludeEnd: true,
                illegal: '[^\\s]',
                starts: {
                  className: 'value',
                  endsWithParent: true, excludeEnd: true,
                  contains: [
                    FUNCTION,
                    hljs.NUMBER_MODE,
                    hljs.QUOTE_STRING_MODE,
                    hljs.APOS_STRING_MODE,
                    hljs.C_BLOCK_COMMENT_MODE,
                    {
                      className: 'hexcolor', begin: '#[0-9A-Fa-f]+'
                    },
                    {
                      className: 'important', begin: '!important'
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  };
};
},{}],8:[function(require,module,exports){
module.exports = function(hljs) {
  return {
    illegal: '\\S',
    contains: [
      {
        className: 'status',
        begin: '^HTTP/[0-9\\.]+', end: '$',
        contains: [{className: 'number', begin: '\\b\\d{3}\\b'}]
      },
      {
        className: 'request',
        begin: '^[A-Z]+ (.*?) HTTP/[0-9\\.]+$', returnBegin: true, end: '$',
        contains: [
          {
            className: 'string',
            begin: ' ', end: ' ',
            excludeBegin: true, excludeEnd: true
          }
        ]
      },
      {
        className: 'attribute',
        begin: '^\\w', end: ': ', excludeEnd: true,
        illegal: '\\n|\\s|=',
        starts: {className: 'string', end: '$'}
      },
      {
        begin: '\\n\\n',
        starts: {subLanguage: '', endsWithParent: true}
      }
    ]
  };
};
},{}],9:[function(require,module,exports){
module.exports = function(hljs) {
  return {
    case_insensitive: true,
    illegal: /\S/,
    contains: [
      {
        className: 'comment',
        begin: ';', end: '$'
      },
      {
        className: 'title',
        begin: '^\\[', end: '\\]'
      },
      {
        className: 'setting',
        begin: '^[a-z0-9\\[\\]_-]+[ \\t]*=[ \\t]*', end: '$',
        contains: [
          {
            className: 'value',
            endsWithParent: true,
            keywords: 'on off true false yes no',
            contains: [hljs.QUOTE_STRING_MODE, hljs.NUMBER_MODE],
            relevance: 0
          }
        ]
      }
    ]
  };
};
},{}],10:[function(require,module,exports){
module.exports = function(hljs) {
  return {
    aliases: ['js'],
    keywords: {
      keyword:
        'in if for while finally var new function do return void else break catch ' +
        'instanceof with throw case default try this switch continue typeof delete ' +
        'let yield const class',
      literal:
        'true false null undefined NaN Infinity',
      built_in:
        'eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent ' +
        'encodeURI encodeURIComponent escape unescape Object Function Boolean Error ' +
        'EvalError InternalError RangeError ReferenceError StopIteration SyntaxError ' +
        'TypeError URIError Number Math Date String RegExp Array Float32Array ' +
        'Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array ' +
        'Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require'
    },
    contains: [
      {
        className: 'pi',
        begin: /^\s*('|")use strict('|")/,
        relevance: 10
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      { // "value" container
        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: 'return throw case',
        contains: [
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          hljs.REGEXP_MODE,
          { // E4X
            begin: /</, end: />;/,
            relevance: 0,
            subLanguage: 'xml'
          }
        ],
        relevance: 0
      },
      {
        className: 'function',
        beginKeywords: 'function', end: /\{/,
        contains: [
          hljs.inherit(hljs.TITLE_MODE, {begin: /[A-Za-z$_][0-9A-Za-z$_]*/}),
          {
            className: 'params',
            begin: /\(/, end: /\)/,
            contains: [
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE
            ],
            illegal: /["'\(]/
          }
        ],
        illegal: /\[|%/
      },
      {
        begin: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      },
      {
        begin: '\\.' + hljs.IDENT_RE, relevance: 0 // hack: prevents detection of keywords after dots
      }
    ]
  };
};
},{}],11:[function(require,module,exports){
module.exports = function(hljs) {
  var LITERALS = {literal: 'true false null'};
  var TYPES = [
    hljs.QUOTE_STRING_MODE,
    hljs.C_NUMBER_MODE
  ];
  var VALUE_CONTAINER = {
    className: 'value',
    end: ',', endsWithParent: true, excludeEnd: true,
    contains: TYPES,
    keywords: LITERALS
  };
  var OBJECT = {
    begin: '{', end: '}',
    contains: [
      {
        className: 'attribute',
        begin: '\\s*"', end: '"\\s*:\\s*', excludeBegin: true, excludeEnd: true,
        contains: [hljs.BACKSLASH_ESCAPE],
        illegal: '\\n',
        starts: VALUE_CONTAINER
      }
    ],
    illegal: '\\S'
  };
  var ARRAY = {
    begin: '\\[', end: '\\]',
    contains: [hljs.inherit(VALUE_CONTAINER, {className: null})], // inherit is also a workaround for a bug that makes shared modes with endsWithParent compile only the ending of one of the parents
    illegal: '\\S'
  };
  TYPES.splice(TYPES.length, 0, OBJECT, ARRAY);
  return {
    contains: TYPES,
    keywords: LITERALS,
    illegal: '\\S'
  };
};
},{}],12:[function(require,module,exports){
module.exports = function(hljs) {
  return {
    contains: [
      // highlight headers
      {
        className: 'header',
        variants: [
          { begin: '^#{1,6}', end: '$' },
          { begin: '^.+?\\n[=-]{2,}$' }
        ]
      },
      // inline html
      {
        begin: '<', end: '>',
        subLanguage: 'xml',
        relevance: 0
      },
      // lists (indicators only)
      {
        className: 'bullet',
        begin: '^([*+-]|(\\d+\\.))\\s+'
      },
      // strong segments
      {
        className: 'strong',
        begin: '[*_]{2}.+?[*_]{2}'
      },
      // emphasis segments
      {
        className: 'emphasis',
        variants: [
          { begin: '\\*.+?\\*' },
          { begin: '_.+?_'
          , relevance: 0
          }
        ]
      },
      // blockquotes
      {
        className: 'blockquote',
        begin: '^>\\s+', end: '$'
      },
      // code snippets
      {
        className: 'code',
        variants: [
          { begin: '`.+?`' },
          { begin: '^( {4}|\t)', end: '$'
          , relevance: 0
          }
        ]
      },
      // horizontal rules
      {
        className: 'horizontal_rule',
        begin: '^[-\\*]{3,}', end: '$'
      },
      // using links - title and link
      {
        begin: '\\[.+?\\][\\(\\[].+?[\\)\\]]',
        returnBegin: true,
        contains: [
          {
            className: 'link_label',
            begin: '\\[', end: '\\]',
            excludeBegin: true,
            returnEnd: true,
            relevance: 0
          },
          {
            className: 'link_url',
            begin: '\\]\\(', end: '\\)',
            excludeBegin: true, excludeEnd: true
          },
          {
            className: 'link_reference',
            begin: '\\]\\[', end: '\\]',
            excludeBegin: true, excludeEnd: true,
          }
        ],
        relevance: 10
      },
      {
        begin: '^\\[\.+\\]:', end: '$',
        returnBegin: true,
        contains: [
          {
            className: 'link_reference',
            begin: '\\[', end: '\\]',
            excludeBegin: true, excludeEnd: true
          },
          {
            className: 'link_url',
            begin: '\\s', end: '$'
          }
        ]
      }
    ]
  };
};
},{}],13:[function(require,module,exports){
module.exports = function(hljs) {
  var XML_IDENT_RE = '[A-Za-z0-9\\._:-]+';
  var PHP = {
    begin: /<\?(php)?(?!\w)/, end: /\?>/,
    subLanguage: 'php', subLanguageMode: 'continuous'
  };
  var TAG_INTERNALS = {
    endsWithParent: true,
    illegal: /</,
    relevance: 0,
    contains: [
      PHP,
      {
        className: 'attribute',
        begin: XML_IDENT_RE,
        relevance: 0
      },
      {
        begin: '=',
        relevance: 0,
        contains: [
          {
            className: 'value',
            variants: [
              {begin: /"/, end: /"/},
              {begin: /'/, end: /'/},
              {begin: /[^\s\/>]+/}
            ]
          }
        ]
      }
    ]
  };
  return {
    aliases: ['html'],
    case_insensitive: true,
    contains: [
      {
        className: 'doctype',
        begin: '<!DOCTYPE', end: '>',
        relevance: 10,
        contains: [{begin: '\\[', end: '\\]'}]
      },
      {
        className: 'comment',
        begin: '<!--', end: '-->',
        relevance: 10
      },
      {
        className: 'cdata',
        begin: '<\\!\\[CDATA\\[', end: '\\]\\]>',
        relevance: 10
      },
      {
        className: 'tag',
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending braket. The '$' is needed for the lexeme to be recognized
        by hljs.subMode() that tests lexemes outside the stream.
        */
        begin: '<style(?=\\s|>|$)', end: '>',
        keywords: {title: 'style'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '</style>', returnEnd: true,
          subLanguage: 'css'
        }
      },
      {
        className: 'tag',
        // See the comment in the <style tag about the lookahead pattern
        begin: '<script(?=\\s|>|$)', end: '>',
        keywords: {title: 'script'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '</script>', returnEnd: true,
          subLanguage: 'javascript'
        }
      },
      {
        begin: '<%', end: '%>',
        subLanguage: 'vbscript'
      },
      PHP,
      {
        className: 'pi',
        begin: /<\?\w+/, end: /\?>/,
        relevance: 10
      },
      {
        className: 'tag',
        begin: '</?', end: '/?>',
        contains: [
          {
            className: 'title', begin: '[^ /><]+', relevance: 0
          },
          TAG_INTERNALS
        ]
      }
    ]
  };
};
},{}],14:[function(require,module,exports){
// http://highlightjs.readthedocs.org/en/latest/css-classes-reference.html

module.exports = [
  'addition',
  'annotaion',
  'annotation',
  'argument',
  'array',
  'at_rule',
  'attr_selector',
  'attribute',
  'begin-block',
  'blockquote',
  'body',
  'built_in',
  'bullet',
  'cbracket',
  'cdata',
  'cell',
  'change',
  'char',
  'chunk',
  'class',
  'code',
  'collection',
  'command',
  'commands',
  'commen',
  'comment',
  'constant',
  'container',
  'dartdoc',
  'date',
  'decorator',
  'default',
  'deletion',
  'doctype',
  'emphasis',
  'end-block',
  'envvar',
  'expression',
  'filename',
  'filter',
  'flow',
  'foreign',
  'formula',
  'func',
  'function',
  'function_name',
  'generics',
  'header',
  'hexcolor',
  'horizontal_rule',
  'id',
  'import',
  'important',
  'infix',
  'inheritance',
  'input',
  'javadoc',
  'javadoctag',
  'keyword',
  'keywords',
  'label',
  'link_label',
  'link_reference',
  'link_url',
  'list',
  'literal',
  'localvars',
  'long_brackets',
  'matrix',
  'module',
  'number',
  'operator',
  'output',
  'package',
  'param',
  'parameter',
  'params',
  'parent',
  'phpdoc',
  'pi',
  'pod',
  'pp',
  'pragma',
  'preprocessor',
  'prompt',
  'property',
  'pseudo',
  'quoted',
  'record_name',
  'regex',
  'regexp',
  'request',
  'reserved',
  'rest_arg',
  'rules',
  'shader',
  'shading',
  'shebang',
  'special',
  'sqbracket',
  'status',
  'stl_container',
  'stream',
  'string',
  'strong',
  'sub',
  'subst',
  'summary',
  'symbol',
  'tag',
  'template_comment',
  'template_tag',
  'title',
  'type',
  'typedef',
  'typename',
  'value',
  'var_expand',
  'variable',
  'winutils',
  'xmlDocTag',
  'yardoctag'
]

},{}],15:[function(require,module,exports){
'use strict';

var toMap = require('./toMap');
var uris = ['background', 'base', 'cite', 'href', 'longdesc', 'src', 'usemap'];

module.exports = {
  uris: toMap(uris) // attributes that have an href and hence need to be sanitized
};

},{"./toMap":23}],16:[function(require,module,exports){
'use strict';

var defaults = {
  allowedAttributes: {
    a: ['href', 'name', 'target', 'title', 'aria-label'],
    iframe: ['allowfullscreen', 'frameborder', 'src'],
    img: ['src', 'alt', 'title', 'aria-label']
  },
  allowedClasses: {},
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedTags: [
    'a', 'article', 'b', 'blockquote', 'br', 'caption', 'code', 'del', 'details', 'div', 'em',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'main',
    'ol', 'p', 'pre', 'section', 'span', 'strike', 'strong', 'sub', 'summary', 'sup', 'table',
    'tbody', 'td', 'th', 'thead', 'tr', 'ul'
  ],
  filter: null
};

module.exports = defaults;

},{}],17:[function(require,module,exports){
'use strict';

var toMap = require('./toMap');
var voids = ['area', 'br', 'col', 'hr', 'img', 'wbr', 'input', 'base', 'basefont', 'link', 'meta'];

module.exports = {
  voids: toMap(voids)
};

},{"./toMap":23}],18:[function(require,module,exports){
'use strict';

var he = require('he');
var assign = require('assignment');
var parser = require('./parser');
var sanitizer = require('./sanitizer');
var defaults = require('./defaults');

function insane (html, options, strict) {
  var buffer = [];
  var configuration = strict === true ? options : assign({}, defaults, options);
  var handler = sanitizer(buffer, configuration);

  parser(html, handler);

  return buffer.join('');
}

insane.defaults = defaults;
module.exports = insane;

},{"./defaults":16,"./parser":20,"./sanitizer":21,"assignment":3,"he":22}],19:[function(require,module,exports){
'use strict';

module.exports = function lowercase (string) {
  return typeof string === 'string' ? string.toLowerCase() : string;
};

},{}],20:[function(require,module,exports){
'use strict';

var he = require('he');
var lowercase = require('./lowercase');
var attributes = require('./attributes');
var elements = require('./elements');
var rstart = /^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/;
var rend = /^<\s*\/\s*([\w:-]+)[^>]*>/;
var rattrs = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g;
var rtag = /^</;
var rtagend = /^<\s*\//;

function createStack () {
  var stack = [];
  stack.lastItem = function lastItem () {
    return stack[stack.length - 1];
  };
  return stack;
}

function parser (html, handler) {
  var stack = createStack();
  var last = html;
  var chars;

  while (html) {
    parsePart();
  }
  parseEndTag(); // clean up any remaining tags

  function parsePart () {
    chars = true;
    parseTag();
    if (html === last) {
      throw new Error('insane parser error: ' + html);
    }
    last = html;
  }

  function parseTag () {
    if (html.substr(0, 4) === '<!--') { // comments
      parseComment();
    } else if (rtagend.test(html)) {
      parseEdge(rend, parseEndTag);
    } else if (rtag.test(html)) {
      parseEdge(rstart, parseStartTag);
    }
    parseTagDecode();
  }

  function parseEdge (regex, parser) {
    var match = html.match(regex);
    if (match) {
      html = html.substring(match[0].length);
      match[0].replace(regex, parser);
      chars = false;
    }
  }

  function parseComment () {
    var index = html.indexOf('-->');
    if (index >= 0) {
      if (handler.comment) {
        handler.comment(html.substring(4, index));
      }
      html = html.substring(index + 3);
      chars = false;
    }
  }

  function parseTagDecode () {
    if (!chars) {
      return;
    }
    var text;
    var index = html.indexOf('<');
    if (index >= 0) {
      text = html.substring(0, index);
      html = html.substring(index);
    } else {
      text = html;
      html = '';
    }
    if (handler.chars) {
      handler.chars(he.decode(text));
    }
  }

  function parseStartTag (tag, tagName, rest, unary) {
    var attrs = {};
    var low = lowercase(tagName);
    var u = elements.voids[low] || !!unary;

    rest.replace(rattrs, attrReplacer);

    if (!u) {
      stack.push(low);
    }
    if (handler.start) {
      handler.start(low, attrs, u);
    }

    function attrReplacer (match, name, doubleQuotedValue, singleQuotedValue, unquotedValue) {
      attrs[name] = he.decode(doubleQuotedValue || singleQuotedValue || unquotedValue || '');
    }
  }

  function parseEndTag (tag, tagName) {
    var i;
    var pos = 0;
    var low = lowercase(tagName);
    if (low) {
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos] === low) {
          break; // find the closest opened tag of the same type
        }
      }
    }
    if (pos >= 0) {
      for (i = stack.length - 1; i >= pos; i--) {
        if (handler.end) { // close all the open elements, up the stack
          handler.end(stack[i]);
        }
      }
      stack.length = pos;
    }
  }
}

module.exports = parser;

},{"./attributes":15,"./elements":17,"./lowercase":19,"he":22}],21:[function(require,module,exports){
'use strict';

var he = require('he');
var lowercase = require('./lowercase');
var attributes = require('./attributes');

function sanitizer (buffer, options) {
  var last;
  var context;
  var o = options || {};

  reset();

  return {
    start: start,
    end: end,
    chars: chars
  };

  function out (value) {
    buffer.push(value);
  }

  function start (tag, attrs, unary) {
    var low = lowercase(tag);

    if (context.ignoring) {
      ignore(low); return;
    }
    if ((o.allowedTags || []).indexOf(low) === -1) {
      ignore(low); return;
    }
    if (o.filter && !o.filter({ tag: low, attrs: attrs })) {
      ignore(low); return;
    }

    out('<');
    out(low);
    Object.keys(attrs).forEach(parse);
    out(unary ? '/>' : '>');

    function parse (key) {
      var value = attrs[key];
      var classesOk = (o.allowedClasses || {})[low] || [];
      var attrsOk = (o.allowedAttributes || {})[low] || [];
      var valid;
      var lkey = lowercase(key);
      if (lkey === 'class' && attrsOk.indexOf(lkey) === -1) {
        value = value.split(' ').filter(isValidClass).join(' ').trim();
        valid = value.length;
      } else {
        valid = attrsOk.indexOf(lkey) !== -1 && (attributes.uris[lkey] !== true || testUrl(value));
      }
      if (valid) {
        out(' ');
        out(key);
        out('="');
        out(he.encode(value));
        out('"');
      }
      function isValidClass (className) {
        return classesOk && classesOk.indexOf(className) !== -1;
      }
    }
  }

  function end (tag) {
    var low = lowercase(tag);
    var allowed = (o.allowedTags || []).indexOf(low) !== -1;
    if (allowed) {
      if (context.ignoring === false) {
        out('</');
        out(low);
        out('>');
      } else {
        unignore(low);
      }
    } else {
      unignore(low);
    }
  }

  function testUrl (text) {
    var start = text[0];
    if (start === '#' || start === '/') {
      return true;
    }
    var colon = text.indexOf(':');
    if (colon === -1) {
      return true;
    }
    var questionmark = text.indexOf('?');
    if (questionmark !== -1 && colon > questionmark) {
      return true;
    }
    var hash = text.indexOf('#');
    if (hash !== -1 && colon > hash) {
      return true;
    }
    return o.allowedSchemes.some(matches);

    function matches (scheme) {
      return text.indexOf(scheme + ':') === 0;
    }
  }

  function chars (text) {
    if (context.ignoring === false) {
      out(he.encode(text));
    }
  }

  function ignore (tag) {
    if (context.ignoring === false) {
      context = { ignoring: tag, depth: 1 };
    } else if (context.ignoring === tag) {
      context.depth++;
    }
  }

  function unignore (tag) {
    if (context.ignoring === tag) {
      if (--context.depth <= 0) {
        reset();
      }
    }
  }

  function reset () {
    context = { ignoring: false, depth: 0 };
  }
}

module.exports = sanitizer;

},{"./attributes":15,"./lowercase":19,"he":22}],22:[function(require,module,exports){
'use strict';

var escapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};
var unescapes = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'"
};
var rescaped = /(&amp;|&lt;|&gt;|&quot;|&#39;)/g;
var runescaped = /[&<>"']/g;

function escapeHtmlChar (match) {
  return escapes[match];
}
function unescapeHtmlChar (match) {
  return unescapes[match];
}

function escapeHtml (text) {
  return text == null ? '' : String(text).replace(runescaped, escapeHtmlChar);
}

function unescapeHtml (html) {
  return html == null ? '' : String(html).replace(rescaped, unescapeHtmlChar);
}

escapeHtml.options = unescapeHtml.options = {};

module.exports = {
  encode: escapeHtml,
  escape: escapeHtml,
  decode: unescapeHtml,
  unescape: unescapeHtml,
  version: '1.0.0-browser'
};

},{}],23:[function(require,module,exports){
'use strict';

function toMap (list) {
  return list.reduce(asKey, {});
}

function asKey (accumulator, item) {
  accumulator[item] = true;
  return accumulator;
}

module.exports = toMap;

},{}],24:[function(require,module,exports){
'use strict';


////////////////////////////////////////////////////////////////////////////////
// Helpers

// Merge objects
//
function assign(obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);

  sources.forEach(function (source) {
    if (!source) { return; }

    Object.keys(source).forEach(function (key) {
      obj[key] = source[key];
    });
  });

  return obj;
}

function _class(obj) { return Object.prototype.toString.call(obj); }
function isString(obj) { return _class(obj) === '[object String]'; }
function isObject(obj) { return _class(obj) === '[object Object]'; }
function isRegExp(obj) { return _class(obj) === '[object RegExp]'; }
function isFunction(obj) { return _class(obj) === '[object Function]'; }


function escapeRE (str) { return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&'); }

////////////////////////////////////////////////////////////////////////////////


var defaultSchemas = {
  'http:': {
    validate: function (text, pos, self) {
      var tail = text.slice(pos);

      if (!self.re.http) {
        // compile lazily, because "host"-containing variables can change on tlds update.
        self.re.http =  new RegExp(
          '^\\/\\/' + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, 'i'
        );
      }
      if (self.re.http.test(tail)) {
        return tail.match(self.re.http)[0].length;
      }
      return 0;
    }
  },
  'https:':  'http:',
  'ftp:':    'http:',
  '//':      {
    validate: function (text, pos, self) {
      var tail = text.slice(pos);

      if (!self.re.no_http) {
      // compile lazily, becayse "host"-containing variables can change on tlds update.
        self.re.no_http =  new RegExp(
          '^' + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, 'i'
        );
      }

      if (self.re.no_http.test(tail)) {
        // should not be `://`, that protects from errors in protocol name
        if (pos >= 3 && text[pos - 3] === ':') { return 0; }
        return tail.match(self.re.no_http)[0].length;
      }
      return 0;
    }
  },
  'mailto:': {
    validate: function (text, pos, self) {
      var tail = text.slice(pos);

      if (!self.re.mailto) {
        self.re.mailto =  new RegExp(
          '^' + self.re.src_email_name + '@' + self.re.src_host_strict, 'i'
        );
      }
      if (self.re.mailto.test(tail)) {
        return tail.match(self.re.mailto)[0].length;
      }
      return 0;
    }
  }
};

// DON'T try to make PRs with changes. Extend TLDs with LinkifyIt.tlds() instead
var tlds_default = 'biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф'.split('|');

////////////////////////////////////////////////////////////////////////////////

function resetScanCache(self) {
  self.__index__ = -1;
  self.__text_cache__   = '';
}

function createValidator(re) {
  return function (text, pos) {
    var tail = text.slice(pos);

    if (re.test(tail)) {
      return tail.match(re)[0].length;
    }
    return 0;
  };
}

function createNormalizer() {
  return function (match, self) {
    self.normalize(match);
  };
}

// Schemas compiler. Build regexps.
//
function compile(self) {

  // Load & clone RE patterns.
  var re = self.re = assign({}, require('./lib/re'));

  // Define dynamic patterns
  var tlds = self.__tlds__.slice();

  if (!self.__tlds_replaced__) {
    tlds.push('[a-z]{2}');
  }
  tlds.push(re.src_xn);

  re.src_tlds = tlds.join('|');

  function untpl(tpl) { return tpl.replace('%TLDS%', re.src_tlds); }

  re.email_fuzzy      = RegExp(untpl(re.tpl_email_fuzzy), 'i');
  re.link_fuzzy       = RegExp(untpl(re.tpl_link_fuzzy), 'i');
  re.host_fuzzy_test  = RegExp(untpl(re.tpl_host_fuzzy_test), 'i');

  //
  // Compile each schema
  //

  var aliases = [];

  self.__compiled__ = {}; // Reset compiled data

  function schemaError(name, val) {
    throw new Error('(LinkifyIt) Invalid schema "' + name + '": ' + val);
  }

  Object.keys(self.__schemas__).forEach(function (name) {
    var val = self.__schemas__[name];

    // skip disabled methods
    if (val === null) { return; }

    var compiled = { validate: null, link: null };

    self.__compiled__[name] = compiled;

    if (isObject(val)) {
      if (isRegExp(val.validate)) {
        compiled.validate = createValidator(val.validate);
      } else if (isFunction(val.validate)) {
        compiled.validate = val.validate;
      } else {
        schemaError(name, val);
      }

      if (isFunction(val.normalize)) {
        compiled.normalize = val.normalize;
      } else if (!val.normalize) {
        compiled.normalize = createNormalizer();
      } else {
        schemaError(name, val);
      }

      return;
    }

    if (isString(val)) {
      aliases.push(name);
      return;
    }

    schemaError(name, val);
  });

  //
  // Compile postponed aliases
  //

  aliases.forEach(function (alias) {
    if (!self.__compiled__[self.__schemas__[alias]]) {
      // Silently fail on missed schemas to avoid errons on disable.
      // schemaError(alias, self.__schemas__[alias]);
      return;
    }

    self.__compiled__[alias].validate =
      self.__compiled__[self.__schemas__[alias]].validate;
    self.__compiled__[alias].normalize =
      self.__compiled__[self.__schemas__[alias]].normalize;
  });

  //
  // Fake record for guessed links
  //
  self.__compiled__[''] = { validate: null, normalize: createNormalizer() };

  //
  // Build schema condition
  //
  var slist = Object.keys(self.__compiled__)
                      .filter(function(name) {
                        // Filter disabled & fake schemas
                        return name.length > 0 && self.__compiled__[name];
                      })
                      .map(escapeRE)
                      .join('|');
  // (?!_) cause 1.5x slowdown
  self.re.schema_test   = RegExp('(^|(?!_)(?:>|' + re.src_ZPCcCf + '))(' + slist + ')', 'i');
  self.re.schema_search = RegExp('(^|(?!_)(?:>|' + re.src_ZPCcCf + '))(' + slist + ')', 'ig');

  //
  // Cleanup
  //

  resetScanCache(self);
}

/**
 * class Match
 *
 * Match result. Single element of array, returned by [[LinkifyIt#match]]
 **/
function Match(self, shift) {
  var start = self.__index__,
      end   = self.__last_index__,
      text  = self.__text_cache__.slice(start, end);

  /**
   * Match#schema -> String
   *
   * Prefix (protocol) for matched string.
   **/
  this.schema    = self.__schema__.toLowerCase();
  /**
   * Match#index -> Number
   *
   * First position of matched string.
   **/
  this.index     = start + shift;
  /**
   * Match#lastIndex -> Number
   *
   * Next position after matched string.
   **/
  this.lastIndex = end + shift;
  /**
   * Match#raw -> String
   *
   * Matched string.
   **/
  this.raw       = text;
  /**
   * Match#text -> String
   *
   * Notmalized text of matched string.
   **/
  this.text      = text;
  /**
   * Match#url -> String
   *
   * Normalized url of matched string.
   **/
  this.url       = text;
}

function createMatch(self, shift) {
  var match = new Match(self, shift);

  self.__compiled__[match.schema].normalize(match, self);

  return match;
}


/**
 * class LinkifyIt
 **/

/**
 * new LinkifyIt(schemas)
 * - schemas (Object): Optional. Additional schemas to validate (prefix/validator)
 *
 * Creates new linkifier instance with optional additional schemas.
 * Can be called without `new` keyword for convenience.
 *
 * By default understands:
 *
 * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
 * - "fuzzy" links and emails (example.com, foo@bar.com).
 *
 * `schemas` is an object, where each key/value describes protocol/rule:
 *
 * - __key__ - link prefix (usually, protocol name with `:` at the end, `skype:`
 *   for example). `linkify-it` makes shure that prefix is not preceeded with
 *   alphanumeric char and symbols. Only whitespaces and punctuation allowed.
 * - __value__ - rule to check tail after link prefix
 *   - _String_ - just alias to existing rule
 *   - _Object_
 *     - _validate_ - validator function (should return matched length on success),
 *       or `RegExp`.
 *     - _normalize_ - optional function to normalize text & url of matched result
 *       (for example, for @twitter mentions).
 **/
function LinkifyIt(schemas) {
  if (!(this instanceof LinkifyIt)) {
    return new LinkifyIt(schemas);
  }

  // Cache last tested result. Used to skip repeating steps on next `match` call.
  this.__index__          = -1;
  this.__last_index__     = -1; // Next scan position
  this.__schema__         = '';
  this.__text_cache__     = '';

  this.__schemas__        = assign({}, defaultSchemas, schemas);
  this.__compiled__       = {};

  this.__tlds__           = tlds_default;
  this.__tlds_replaced__  = false;

  this.re = {};

  compile(this);
}


/** chainable
 * LinkifyIt#add(schema, definition)
 * - schema (String): rule name (fixed pattern prefix)
 * - definition (String|RegExp|Object): schema definition
 *
 * Add new rule definition. See constructor description for details.
 **/
LinkifyIt.prototype.add = function add(schema, definition) {
  this.__schemas__[schema] = definition;
  compile(this);
  return this;
};


/**
 * LinkifyIt#test(text) -> Boolean
 *
 * Searches linkifiable pattern and returns `true` on success or `false` on fail.
 **/
LinkifyIt.prototype.test = function test(text) {
  // Reset scan cache
  this.__text_cache__ = text;
  this.__index__      = -1;

  if (!text.length) { return false; }

  var m, ml, me, len, shift, next, re, tld_pos, at_pos;

  // try to scan for link with schema - that's the most simple rule
  if (this.re.schema_test.test(text)) {
    re = this.re.schema_search;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      len = this.testSchemaAt(text, m[2], re.lastIndex);
      if (len) {
        this.__schema__     = m[2];
        this.__index__      = m.index + m[1].length;
        this.__last_index__ = m.index + m[0].length + len;
        break;
      }
    }
  }

  if (this.__compiled__['http:']) {
    // guess schemaless links
    tld_pos = text.search(this.re.host_fuzzy_test);
    if (tld_pos >= 0) {
      // if tld is located after found link - no need to check fuzzy pattern
      if (this.__index__ < 0 || tld_pos < this.__index__) {
        if ((ml = text.match(this.re.link_fuzzy)) !== null) {

          shift = ml.index + ml[1].length;

          if (this.__index__ < 0 || shift < this.__index__) {
            this.__schema__     = '';
            this.__index__      = shift;
            this.__last_index__ = ml.index + ml[0].length;
          }
        }
      }
    }
  }

  if (this.__compiled__['mailto:']) {
    // guess schemaless emails
    at_pos = text.indexOf('@');
    if (at_pos >= 0) {
      // We can't skip this check, because this cases are possible:
      // 192.168.1.1@gmail.com, my.in@example.com
      if ((me = text.match(this.re.email_fuzzy)) !== null) {

        shift = me.index + me[1].length;
        next  = me.index + me[0].length;

        if (this.__index__ < 0 || shift < this.__index__ ||
            (shift === this.__index__ && next > this.__last_index__)) {
          this.__schema__     = 'mailto:';
          this.__index__      = shift;
          this.__last_index__ = next;
        }
      }
    }
  }

  return this.__index__ >= 0;
};


/**
 * LinkifyIt#testSchemaAt(text, name, position) -> Number
 * - text (String): text to scan
 * - name (String): rule (schema) name
 * - position (Number): text offset to check from
 *
 * Similar to [[LinkifyIt#test]] but checks only specific protocol tail exactly
 * at given position. Returns length of found pattern (0 on fail).
 **/
LinkifyIt.prototype.testSchemaAt = function testSchemaAt(text, schema, pos) {
  // If not supported schema check requested - terminate
  if (!this.__compiled__[schema.toLowerCase()]) {
    return 0;
  }
  return this.__compiled__[schema.toLowerCase()].validate(text, pos, this);
};


/**
 * LinkifyIt#match(text) -> Array|null
 *
 * Returns array of found link descriptions or `null` on fail. We strongly
 * to use [[LinkifyIt#test]] first, for best speed.
 *
 * ##### Result match description
 *
 * - __schema__ - link schema, can be empty for fuzzy links, or `//` for
 *   protocol-neutral  links.
 * - __index__ - offset of matched text
 * - __lastIndex__ - index of next char after mathch end
 * - __raw__ - matched text
 * - __text__ - normalized text
 * - __url__ - link, generated from matched text
 **/
LinkifyIt.prototype.match = function match(text) {
  var shift = 0, result = [];

  // Try to take previous element from cache, if .test() called before
  if (this.__index__ >= 0 && this.__text_cache__ === text) {
    result.push(createMatch(this, shift));
    shift = this.__last_index__;
  }

  // Cut head if cache was used
  var tail = shift ? text.slice(shift) : text;

  // Scan string until end reached
  while (this.test(tail)) {
    result.push(createMatch(this, shift));

    tail = tail.slice(this.__last_index__);
    shift += this.__last_index__;
  }

  if (result.length) {
    return result;
  }

  return null;
};


/** chainable
 * LinkifyIt#tlds(list [, keepOld]) -> this
 * - list (Array): list of tlds
 * - keepOld (Boolean): merge with current list if `true` (`false` by default)
 *
 * Load (or merge) new tlds list. Those are user for fuzzy links (without prefix)
 * to avoid false positives. By default this algorythm used:
 *
 * - hostname with any 2-letter root zones are ok.
 * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
 *   are ok.
 * - encoded (`xn--...`) root zones are ok.
 *
 * If list is replaced, then exact match for 2-chars root zones will be checked.
 **/
LinkifyIt.prototype.tlds = function tlds(list, keepOld) {
  list = Array.isArray(list) ? list : [ list ];

  if (!keepOld) {
    this.__tlds__ = list.slice();
    this.__tlds_replaced__ = true;
    compile(this);
    return this;
  }

  this.__tlds__ = this.__tlds__.concat(list)
                                  .sort()
                                  .filter(function(el, idx, arr) {
                                    return el !== arr[idx - 1];
                                  })
                                  .reverse();

  compile(this);
  return this;
};

/**
 * LinkifyIt#normalize(match)
 *
 * Default normalizer (if schema does not define it's own).
 **/
LinkifyIt.prototype.normalize = function normalize(match) {

  // Do minimal possible changes by default. Need to collect feedback prior
  // to move forward https://github.com/markdown-it/linkify-it/issues/1

  if (!match.schema) { match.url = 'http://' + match.url; }

  if (match.schema === 'mailto:' && !/^mailto:/i.test(match.url)) {
    match.url = 'mailto:' + match.url;
  }
};


module.exports = LinkifyIt;

},{"./lib/re":25}],25:[function(require,module,exports){
'use strict';

// Use direct extract instead of `regenerate` to reduse browserified size
var src_Any = exports.src_Any = require('uc.micro/properties/Any/regex').source;
var src_Cc  = exports.src_Cc = require('uc.micro/categories/Cc/regex').source;
var src_Cf  = exports.src_Cf = require('uc.micro/categories/Cf/regex').source;
var src_Z   = exports.src_Z  = require('uc.micro/categories/Z/regex').source;
var src_P   = exports.src_P  = require('uc.micro/categories/P/regex').source;

// \p{\Z\P\Cc\CF} (white spaces + control + format + punctuation)
var src_ZPCcCf = exports.src_ZPCcCf = [ src_Z, src_P, src_Cc, src_Cf ].join('|');

// All possible word characters (everything without punctuation, spaces & controls)
// Defined via punctuation & spaces to save space
// Should be something like \p{\L\N\S\M} (\w but without `_`)
var src_pseudo_letter       = '(?:(?!' + src_ZPCcCf + ')' + src_Any + ')';
// The same as abothe but without [0-9]
var src_pseudo_letter_non_d = '(?:(?![0-9]|' + src_ZPCcCf + ')' + src_Any + ')';

////////////////////////////////////////////////////////////////////////////////

var src_ip4 = exports.src_ip4 =

  '(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';

exports.src_auth    = '(?:(?:(?!' + src_Z + ').)+@)?';

var src_port = exports.src_port =

  '(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?';

var src_host_terminator = exports.src_host_terminator =

  '(?=$|' + src_ZPCcCf + ')(?!-|_|:\\d|\\.-|\\.(?!$|' + src_ZPCcCf + '))';

var src_path = exports.src_path =

  '(?:' +
    '[/?#]' +
      '(?:' +
        '(?!' + src_Z + '|[()[\\]{}.,"\'?!\\-]).|' +
        '\\[(?:(?!' + src_Z + '|\\]).)*\\]|' +
        '\\((?:(?!' + src_Z + '|[)]).)*\\)|' +
        '\\{(?:(?!' + src_Z + '|[}]).)*\\}|' +
        '\\"(?:(?!' + src_Z + '|["]).)+\\"|' +
        "\\'(?:(?!" + src_Z + "|[']).)+\\'|" +
        "\\'(?=" + src_pseudo_letter + ').|' +  // allow `I'm_king` if no pair found
        '\\.(?!' + src_Z + '|[.]).|' +
        '\\-(?!' + src_Z + '|--(?:[^-]|$))(?:[-]+|.)|' +  // `---` => long dash, terminate
        '\\,(?!' + src_Z + ').|' +      // allow `,,,` in paths
        '\\!(?!' + src_Z + '|[!]).|' +
        '\\?(?!' + src_Z + '|[?]).' +
      ')+' +
    '|\\/' +
  ')?';

var src_email_name = exports.src_email_name =

  '[\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]+';

var src_xn = exports.src_xn =

  'xn--[a-z0-9\\-]{1,59}';

// More to read about domain names
// http://serverfault.com/questions/638260/

var src_domain_root = exports.src_domain_root =

  // Can't have digits and dashes
  '(?:' +
    src_xn +
    '|' +
    src_pseudo_letter_non_d + '{1,63}' +
  ')';

var src_domain = exports.src_domain =

  '(?:' +
    src_xn +
    '|' +
    '(?:' + src_pseudo_letter + ')' +
    '|' +
    // don't allow `--` in domain names, because:
    // - that can conflict with markdown &mdash; / &ndash;
    // - nobody use those anyway
    '(?:' + src_pseudo_letter + '(?:-(?!-)|' + src_pseudo_letter + '){0,61}' + src_pseudo_letter + ')' +
  ')';

var src_host = exports.src_host =

  '(?:' +
    src_ip4 +
  '|' +
    '(?:(?:(?:' + src_domain + ')\\.)*' + src_domain_root + ')' +
  ')';

var tpl_host_fuzzy = exports.tpl_host_fuzzy =

  '(?:' +
    src_ip4 +
  '|' +
    '(?:(?:(?:' + src_domain + ')\\.)+(?:%TLDS%))' +
  ')';

exports.src_host_strict =

  src_host + src_host_terminator;

var tpl_host_fuzzy_strict = exports.tpl_host_fuzzy_strict =

  tpl_host_fuzzy + src_host_terminator;

exports.src_host_port_strict =

  src_host + src_port + src_host_terminator;

var tpl_host_port_fuzzy_strict = exports.tpl_host_port_fuzzy_strict =

  tpl_host_fuzzy + src_port + src_host_terminator;

////////////////////////////////////////////////////////////////////////////////
// Main rules

// Rude test fuzzy links by host, for quick deny
exports.tpl_host_fuzzy_test =

  'localhost|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:' + src_ZPCcCf + '|$))';

exports.tpl_email_fuzzy =

    '(^|>|' + src_Z + ')(' + src_email_name + '@' + tpl_host_fuzzy_strict + ')';

exports.tpl_link_fuzzy =
    // Fuzzy link can't be prepended with .:/\- and non punctuation.
    // but can start with > (markdown blockquote)
    '(^|(?![.:/\\-_@])(?:[$+<=>^`|]|' + src_ZPCcCf + '))' +
    '((?![$+<=>^`|])' + tpl_host_port_fuzzy_strict + src_path + ')';

},{"uc.micro/categories/Cc/regex":26,"uc.micro/categories/Cf/regex":27,"uc.micro/categories/P/regex":28,"uc.micro/categories/Z/regex":29,"uc.micro/properties/Any/regex":30}],26:[function(require,module,exports){
module.exports=/[\0-\x1F\x7F-\x9F]/
},{}],27:[function(require,module,exports){
module.exports=/[\xAD\u0600-\u0605\u061C\u06DD\u070F\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804\uDCBD|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/
},{}],28:[function(require,module,exports){
module.exports=/[!-#%-\*,-/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDE38-\uDE3D]|\uD805[\uDCC6\uDDC1-\uDDC9\uDE41-\uDE43]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F/
},{}],29:[function(require,module,exports){
module.exports=/[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/
},{}],30:[function(require,module,exports){
module.exports=/[\0-\uD7FF\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF]/
},{}],31:[function(require,module,exports){
'use strict';


module.exports = require('./lib/');

},{"./lib/":41}],32:[function(require,module,exports){
// List of valid entities
//
// Generate with ./support/entities.js script
//
'use strict';

/*eslint quotes:0*/
module.exports = {
  "Aacute":"\u00C1",
  "aacute":"\u00E1",
  "Abreve":"\u0102",
  "abreve":"\u0103",
  "ac":"\u223E",
  "acd":"\u223F",
  "acE":"\u223E\u0333",
  "Acirc":"\u00C2",
  "acirc":"\u00E2",
  "acute":"\u00B4",
  "Acy":"\u0410",
  "acy":"\u0430",
  "AElig":"\u00C6",
  "aelig":"\u00E6",
  "af":"\u2061",
  "Afr":"\uD835\uDD04",
  "afr":"\uD835\uDD1E",
  "Agrave":"\u00C0",
  "agrave":"\u00E0",
  "alefsym":"\u2135",
  "aleph":"\u2135",
  "Alpha":"\u0391",
  "alpha":"\u03B1",
  "Amacr":"\u0100",
  "amacr":"\u0101",
  "amalg":"\u2A3F",
  "AMP":"\u0026",
  "amp":"\u0026",
  "And":"\u2A53",
  "and":"\u2227",
  "andand":"\u2A55",
  "andd":"\u2A5C",
  "andslope":"\u2A58",
  "andv":"\u2A5A",
  "ang":"\u2220",
  "ange":"\u29A4",
  "angle":"\u2220",
  "angmsd":"\u2221",
  "angmsdaa":"\u29A8",
  "angmsdab":"\u29A9",
  "angmsdac":"\u29AA",
  "angmsdad":"\u29AB",
  "angmsdae":"\u29AC",
  "angmsdaf":"\u29AD",
  "angmsdag":"\u29AE",
  "angmsdah":"\u29AF",
  "angrt":"\u221F",
  "angrtvb":"\u22BE",
  "angrtvbd":"\u299D",
  "angsph":"\u2222",
  "angst":"\u00C5",
  "angzarr":"\u237C",
  "Aogon":"\u0104",
  "aogon":"\u0105",
  "Aopf":"\uD835\uDD38",
  "aopf":"\uD835\uDD52",
  "ap":"\u2248",
  "apacir":"\u2A6F",
  "apE":"\u2A70",
  "ape":"\u224A",
  "apid":"\u224B",
  "apos":"\u0027",
  "ApplyFunction":"\u2061",
  "approx":"\u2248",
  "approxeq":"\u224A",
  "Aring":"\u00C5",
  "aring":"\u00E5",
  "Ascr":"\uD835\uDC9C",
  "ascr":"\uD835\uDCB6",
  "Assign":"\u2254",
  "ast":"\u002A",
  "asymp":"\u2248",
  "asympeq":"\u224D",
  "Atilde":"\u00C3",
  "atilde":"\u00E3",
  "Auml":"\u00C4",
  "auml":"\u00E4",
  "awconint":"\u2233",
  "awint":"\u2A11",
  "backcong":"\u224C",
  "backepsilon":"\u03F6",
  "backprime":"\u2035",
  "backsim":"\u223D",
  "backsimeq":"\u22CD",
  "Backslash":"\u2216",
  "Barv":"\u2AE7",
  "barvee":"\u22BD",
  "Barwed":"\u2306",
  "barwed":"\u2305",
  "barwedge":"\u2305",
  "bbrk":"\u23B5",
  "bbrktbrk":"\u23B6",
  "bcong":"\u224C",
  "Bcy":"\u0411",
  "bcy":"\u0431",
  "bdquo":"\u201E",
  "becaus":"\u2235",
  "Because":"\u2235",
  "because":"\u2235",
  "bemptyv":"\u29B0",
  "bepsi":"\u03F6",
  "bernou":"\u212C",
  "Bernoullis":"\u212C",
  "Beta":"\u0392",
  "beta":"\u03B2",
  "beth":"\u2136",
  "between":"\u226C",
  "Bfr":"\uD835\uDD05",
  "bfr":"\uD835\uDD1F",
  "bigcap":"\u22C2",
  "bigcirc":"\u25EF",
  "bigcup":"\u22C3",
  "bigodot":"\u2A00",
  "bigoplus":"\u2A01",
  "bigotimes":"\u2A02",
  "bigsqcup":"\u2A06",
  "bigstar":"\u2605",
  "bigtriangledown":"\u25BD",
  "bigtriangleup":"\u25B3",
  "biguplus":"\u2A04",
  "bigvee":"\u22C1",
  "bigwedge":"\u22C0",
  "bkarow":"\u290D",
  "blacklozenge":"\u29EB",
  "blacksquare":"\u25AA",
  "blacktriangle":"\u25B4",
  "blacktriangledown":"\u25BE",
  "blacktriangleleft":"\u25C2",
  "blacktriangleright":"\u25B8",
  "blank":"\u2423",
  "blk12":"\u2592",
  "blk14":"\u2591",
  "blk34":"\u2593",
  "block":"\u2588",
  "bne":"\u003D\u20E5",
  "bnequiv":"\u2261\u20E5",
  "bNot":"\u2AED",
  "bnot":"\u2310",
  "Bopf":"\uD835\uDD39",
  "bopf":"\uD835\uDD53",
  "bot":"\u22A5",
  "bottom":"\u22A5",
  "bowtie":"\u22C8",
  "boxbox":"\u29C9",
  "boxDL":"\u2557",
  "boxDl":"\u2556",
  "boxdL":"\u2555",
  "boxdl":"\u2510",
  "boxDR":"\u2554",
  "boxDr":"\u2553",
  "boxdR":"\u2552",
  "boxdr":"\u250C",
  "boxH":"\u2550",
  "boxh":"\u2500",
  "boxHD":"\u2566",
  "boxHd":"\u2564",
  "boxhD":"\u2565",
  "boxhd":"\u252C",
  "boxHU":"\u2569",
  "boxHu":"\u2567",
  "boxhU":"\u2568",
  "boxhu":"\u2534",
  "boxminus":"\u229F",
  "boxplus":"\u229E",
  "boxtimes":"\u22A0",
  "boxUL":"\u255D",
  "boxUl":"\u255C",
  "boxuL":"\u255B",
  "boxul":"\u2518",
  "boxUR":"\u255A",
  "boxUr":"\u2559",
  "boxuR":"\u2558",
  "boxur":"\u2514",
  "boxV":"\u2551",
  "boxv":"\u2502",
  "boxVH":"\u256C",
  "boxVh":"\u256B",
  "boxvH":"\u256A",
  "boxvh":"\u253C",
  "boxVL":"\u2563",
  "boxVl":"\u2562",
  "boxvL":"\u2561",
  "boxvl":"\u2524",
  "boxVR":"\u2560",
  "boxVr":"\u255F",
  "boxvR":"\u255E",
  "boxvr":"\u251C",
  "bprime":"\u2035",
  "Breve":"\u02D8",
  "breve":"\u02D8",
  "brvbar":"\u00A6",
  "Bscr":"\u212C",
  "bscr":"\uD835\uDCB7",
  "bsemi":"\u204F",
  "bsim":"\u223D",
  "bsime":"\u22CD",
  "bsol":"\u005C",
  "bsolb":"\u29C5",
  "bsolhsub":"\u27C8",
  "bull":"\u2022",
  "bullet":"\u2022",
  "bump":"\u224E",
  "bumpE":"\u2AAE",
  "bumpe":"\u224F",
  "Bumpeq":"\u224E",
  "bumpeq":"\u224F",
  "Cacute":"\u0106",
  "cacute":"\u0107",
  "Cap":"\u22D2",
  "cap":"\u2229",
  "capand":"\u2A44",
  "capbrcup":"\u2A49",
  "capcap":"\u2A4B",
  "capcup":"\u2A47",
  "capdot":"\u2A40",
  "CapitalDifferentialD":"\u2145",
  "caps":"\u2229\uFE00",
  "caret":"\u2041",
  "caron":"\u02C7",
  "Cayleys":"\u212D",
  "ccaps":"\u2A4D",
  "Ccaron":"\u010C",
  "ccaron":"\u010D",
  "Ccedil":"\u00C7",
  "ccedil":"\u00E7",
  "Ccirc":"\u0108",
  "ccirc":"\u0109",
  "Cconint":"\u2230",
  "ccups":"\u2A4C",
  "ccupssm":"\u2A50",
  "Cdot":"\u010A",
  "cdot":"\u010B",
  "cedil":"\u00B8",
  "Cedilla":"\u00B8",
  "cemptyv":"\u29B2",
  "cent":"\u00A2",
  "CenterDot":"\u00B7",
  "centerdot":"\u00B7",
  "Cfr":"\u212D",
  "cfr":"\uD835\uDD20",
  "CHcy":"\u0427",
  "chcy":"\u0447",
  "check":"\u2713",
  "checkmark":"\u2713",
  "Chi":"\u03A7",
  "chi":"\u03C7",
  "cir":"\u25CB",
  "circ":"\u02C6",
  "circeq":"\u2257",
  "circlearrowleft":"\u21BA",
  "circlearrowright":"\u21BB",
  "circledast":"\u229B",
  "circledcirc":"\u229A",
  "circleddash":"\u229D",
  "CircleDot":"\u2299",
  "circledR":"\u00AE",
  "circledS":"\u24C8",
  "CircleMinus":"\u2296",
  "CirclePlus":"\u2295",
  "CircleTimes":"\u2297",
  "cirE":"\u29C3",
  "cire":"\u2257",
  "cirfnint":"\u2A10",
  "cirmid":"\u2AEF",
  "cirscir":"\u29C2",
  "ClockwiseContourIntegral":"\u2232",
  "CloseCurlyDoubleQuote":"\u201D",
  "CloseCurlyQuote":"\u2019",
  "clubs":"\u2663",
  "clubsuit":"\u2663",
  "Colon":"\u2237",
  "colon":"\u003A",
  "Colone":"\u2A74",
  "colone":"\u2254",
  "coloneq":"\u2254",
  "comma":"\u002C",
  "commat":"\u0040",
  "comp":"\u2201",
  "compfn":"\u2218",
  "complement":"\u2201",
  "complexes":"\u2102",
  "cong":"\u2245",
  "congdot":"\u2A6D",
  "Congruent":"\u2261",
  "Conint":"\u222F",
  "conint":"\u222E",
  "ContourIntegral":"\u222E",
  "Copf":"\u2102",
  "copf":"\uD835\uDD54",
  "coprod":"\u2210",
  "Coproduct":"\u2210",
  "COPY":"\u00A9",
  "copy":"\u00A9",
  "copysr":"\u2117",
  "CounterClockwiseContourIntegral":"\u2233",
  "crarr":"\u21B5",
  "Cross":"\u2A2F",
  "cross":"\u2717",
  "Cscr":"\uD835\uDC9E",
  "cscr":"\uD835\uDCB8",
  "csub":"\u2ACF",
  "csube":"\u2AD1",
  "csup":"\u2AD0",
  "csupe":"\u2AD2",
  "ctdot":"\u22EF",
  "cudarrl":"\u2938",
  "cudarrr":"\u2935",
  "cuepr":"\u22DE",
  "cuesc":"\u22DF",
  "cularr":"\u21B6",
  "cularrp":"\u293D",
  "Cup":"\u22D3",
  "cup":"\u222A",
  "cupbrcap":"\u2A48",
  "CupCap":"\u224D",
  "cupcap":"\u2A46",
  "cupcup":"\u2A4A",
  "cupdot":"\u228D",
  "cupor":"\u2A45",
  "cups":"\u222A\uFE00",
  "curarr":"\u21B7",
  "curarrm":"\u293C",
  "curlyeqprec":"\u22DE",
  "curlyeqsucc":"\u22DF",
  "curlyvee":"\u22CE",
  "curlywedge":"\u22CF",
  "curren":"\u00A4",
  "curvearrowleft":"\u21B6",
  "curvearrowright":"\u21B7",
  "cuvee":"\u22CE",
  "cuwed":"\u22CF",
  "cwconint":"\u2232",
  "cwint":"\u2231",
  "cylcty":"\u232D",
  "Dagger":"\u2021",
  "dagger":"\u2020",
  "daleth":"\u2138",
  "Darr":"\u21A1",
  "dArr":"\u21D3",
  "darr":"\u2193",
  "dash":"\u2010",
  "Dashv":"\u2AE4",
  "dashv":"\u22A3",
  "dbkarow":"\u290F",
  "dblac":"\u02DD",
  "Dcaron":"\u010E",
  "dcaron":"\u010F",
  "Dcy":"\u0414",
  "dcy":"\u0434",
  "DD":"\u2145",
  "dd":"\u2146",
  "ddagger":"\u2021",
  "ddarr":"\u21CA",
  "DDotrahd":"\u2911",
  "ddotseq":"\u2A77",
  "deg":"\u00B0",
  "Del":"\u2207",
  "Delta":"\u0394",
  "delta":"\u03B4",
  "demptyv":"\u29B1",
  "dfisht":"\u297F",
  "Dfr":"\uD835\uDD07",
  "dfr":"\uD835\uDD21",
  "dHar":"\u2965",
  "dharl":"\u21C3",
  "dharr":"\u21C2",
  "DiacriticalAcute":"\u00B4",
  "DiacriticalDot":"\u02D9",
  "DiacriticalDoubleAcute":"\u02DD",
  "DiacriticalGrave":"\u0060",
  "DiacriticalTilde":"\u02DC",
  "diam":"\u22C4",
  "Diamond":"\u22C4",
  "diamond":"\u22C4",
  "diamondsuit":"\u2666",
  "diams":"\u2666",
  "die":"\u00A8",
  "DifferentialD":"\u2146",
  "digamma":"\u03DD",
  "disin":"\u22F2",
  "div":"\u00F7",
  "divide":"\u00F7",
  "divideontimes":"\u22C7",
  "divonx":"\u22C7",
  "DJcy":"\u0402",
  "djcy":"\u0452",
  "dlcorn":"\u231E",
  "dlcrop":"\u230D",
  "dollar":"\u0024",
  "Dopf":"\uD835\uDD3B",
  "dopf":"\uD835\uDD55",
  "Dot":"\u00A8",
  "dot":"\u02D9",
  "DotDot":"\u20DC",
  "doteq":"\u2250",
  "doteqdot":"\u2251",
  "DotEqual":"\u2250",
  "dotminus":"\u2238",
  "dotplus":"\u2214",
  "dotsquare":"\u22A1",
  "doublebarwedge":"\u2306",
  "DoubleContourIntegral":"\u222F",
  "DoubleDot":"\u00A8",
  "DoubleDownArrow":"\u21D3",
  "DoubleLeftArrow":"\u21D0",
  "DoubleLeftRightArrow":"\u21D4",
  "DoubleLeftTee":"\u2AE4",
  "DoubleLongLeftArrow":"\u27F8",
  "DoubleLongLeftRightArrow":"\u27FA",
  "DoubleLongRightArrow":"\u27F9",
  "DoubleRightArrow":"\u21D2",
  "DoubleRightTee":"\u22A8",
  "DoubleUpArrow":"\u21D1",
  "DoubleUpDownArrow":"\u21D5",
  "DoubleVerticalBar":"\u2225",
  "DownArrow":"\u2193",
  "Downarrow":"\u21D3",
  "downarrow":"\u2193",
  "DownArrowBar":"\u2913",
  "DownArrowUpArrow":"\u21F5",
  "DownBreve":"\u0311",
  "downdownarrows":"\u21CA",
  "downharpoonleft":"\u21C3",
  "downharpoonright":"\u21C2",
  "DownLeftRightVector":"\u2950",
  "DownLeftTeeVector":"\u295E",
  "DownLeftVector":"\u21BD",
  "DownLeftVectorBar":"\u2956",
  "DownRightTeeVector":"\u295F",
  "DownRightVector":"\u21C1",
  "DownRightVectorBar":"\u2957",
  "DownTee":"\u22A4",
  "DownTeeArrow":"\u21A7",
  "drbkarow":"\u2910",
  "drcorn":"\u231F",
  "drcrop":"\u230C",
  "Dscr":"\uD835\uDC9F",
  "dscr":"\uD835\uDCB9",
  "DScy":"\u0405",
  "dscy":"\u0455",
  "dsol":"\u29F6",
  "Dstrok":"\u0110",
  "dstrok":"\u0111",
  "dtdot":"\u22F1",
  "dtri":"\u25BF",
  "dtrif":"\u25BE",
  "duarr":"\u21F5",
  "duhar":"\u296F",
  "dwangle":"\u29A6",
  "DZcy":"\u040F",
  "dzcy":"\u045F",
  "dzigrarr":"\u27FF",
  "Eacute":"\u00C9",
  "eacute":"\u00E9",
  "easter":"\u2A6E",
  "Ecaron":"\u011A",
  "ecaron":"\u011B",
  "ecir":"\u2256",
  "Ecirc":"\u00CA",
  "ecirc":"\u00EA",
  "ecolon":"\u2255",
  "Ecy":"\u042D",
  "ecy":"\u044D",
  "eDDot":"\u2A77",
  "Edot":"\u0116",
  "eDot":"\u2251",
  "edot":"\u0117",
  "ee":"\u2147",
  "efDot":"\u2252",
  "Efr":"\uD835\uDD08",
  "efr":"\uD835\uDD22",
  "eg":"\u2A9A",
  "Egrave":"\u00C8",
  "egrave":"\u00E8",
  "egs":"\u2A96",
  "egsdot":"\u2A98",
  "el":"\u2A99",
  "Element":"\u2208",
  "elinters":"\u23E7",
  "ell":"\u2113",
  "els":"\u2A95",
  "elsdot":"\u2A97",
  "Emacr":"\u0112",
  "emacr":"\u0113",
  "empty":"\u2205",
  "emptyset":"\u2205",
  "EmptySmallSquare":"\u25FB",
  "emptyv":"\u2205",
  "EmptyVerySmallSquare":"\u25AB",
  "emsp":"\u2003",
  "emsp13":"\u2004",
  "emsp14":"\u2005",
  "ENG":"\u014A",
  "eng":"\u014B",
  "ensp":"\u2002",
  "Eogon":"\u0118",
  "eogon":"\u0119",
  "Eopf":"\uD835\uDD3C",
  "eopf":"\uD835\uDD56",
  "epar":"\u22D5",
  "eparsl":"\u29E3",
  "eplus":"\u2A71",
  "epsi":"\u03B5",
  "Epsilon":"\u0395",
  "epsilon":"\u03B5",
  "epsiv":"\u03F5",
  "eqcirc":"\u2256",
  "eqcolon":"\u2255",
  "eqsim":"\u2242",
  "eqslantgtr":"\u2A96",
  "eqslantless":"\u2A95",
  "Equal":"\u2A75",
  "equals":"\u003D",
  "EqualTilde":"\u2242",
  "equest":"\u225F",
  "Equilibrium":"\u21CC",
  "equiv":"\u2261",
  "equivDD":"\u2A78",
  "eqvparsl":"\u29E5",
  "erarr":"\u2971",
  "erDot":"\u2253",
  "Escr":"\u2130",
  "escr":"\u212F",
  "esdot":"\u2250",
  "Esim":"\u2A73",
  "esim":"\u2242",
  "Eta":"\u0397",
  "eta":"\u03B7",
  "ETH":"\u00D0",
  "eth":"\u00F0",
  "Euml":"\u00CB",
  "euml":"\u00EB",
  "euro":"\u20AC",
  "excl":"\u0021",
  "exist":"\u2203",
  "Exists":"\u2203",
  "expectation":"\u2130",
  "ExponentialE":"\u2147",
  "exponentiale":"\u2147",
  "fallingdotseq":"\u2252",
  "Fcy":"\u0424",
  "fcy":"\u0444",
  "female":"\u2640",
  "ffilig":"\uFB03",
  "fflig":"\uFB00",
  "ffllig":"\uFB04",
  "Ffr":"\uD835\uDD09",
  "ffr":"\uD835\uDD23",
  "filig":"\uFB01",
  "FilledSmallSquare":"\u25FC",
  "FilledVerySmallSquare":"\u25AA",
  "fjlig":"\u0066\u006A",
  "flat":"\u266D",
  "fllig":"\uFB02",
  "fltns":"\u25B1",
  "fnof":"\u0192",
  "Fopf":"\uD835\uDD3D",
  "fopf":"\uD835\uDD57",
  "ForAll":"\u2200",
  "forall":"\u2200",
  "fork":"\u22D4",
  "forkv":"\u2AD9",
  "Fouriertrf":"\u2131",
  "fpartint":"\u2A0D",
  "frac12":"\u00BD",
  "frac13":"\u2153",
  "frac14":"\u00BC",
  "frac15":"\u2155",
  "frac16":"\u2159",
  "frac18":"\u215B",
  "frac23":"\u2154",
  "frac25":"\u2156",
  "frac34":"\u00BE",
  "frac35":"\u2157",
  "frac38":"\u215C",
  "frac45":"\u2158",
  "frac56":"\u215A",
  "frac58":"\u215D",
  "frac78":"\u215E",
  "frasl":"\u2044",
  "frown":"\u2322",
  "Fscr":"\u2131",
  "fscr":"\uD835\uDCBB",
  "gacute":"\u01F5",
  "Gamma":"\u0393",
  "gamma":"\u03B3",
  "Gammad":"\u03DC",
  "gammad":"\u03DD",
  "gap":"\u2A86",
  "Gbreve":"\u011E",
  "gbreve":"\u011F",
  "Gcedil":"\u0122",
  "Gcirc":"\u011C",
  "gcirc":"\u011D",
  "Gcy":"\u0413",
  "gcy":"\u0433",
  "Gdot":"\u0120",
  "gdot":"\u0121",
  "gE":"\u2267",
  "ge":"\u2265",
  "gEl":"\u2A8C",
  "gel":"\u22DB",
  "geq":"\u2265",
  "geqq":"\u2267",
  "geqslant":"\u2A7E",
  "ges":"\u2A7E",
  "gescc":"\u2AA9",
  "gesdot":"\u2A80",
  "gesdoto":"\u2A82",
  "gesdotol":"\u2A84",
  "gesl":"\u22DB\uFE00",
  "gesles":"\u2A94",
  "Gfr":"\uD835\uDD0A",
  "gfr":"\uD835\uDD24",
  "Gg":"\u22D9",
  "gg":"\u226B",
  "ggg":"\u22D9",
  "gimel":"\u2137",
  "GJcy":"\u0403",
  "gjcy":"\u0453",
  "gl":"\u2277",
  "gla":"\u2AA5",
  "glE":"\u2A92",
  "glj":"\u2AA4",
  "gnap":"\u2A8A",
  "gnapprox":"\u2A8A",
  "gnE":"\u2269",
  "gne":"\u2A88",
  "gneq":"\u2A88",
  "gneqq":"\u2269",
  "gnsim":"\u22E7",
  "Gopf":"\uD835\uDD3E",
  "gopf":"\uD835\uDD58",
  "grave":"\u0060",
  "GreaterEqual":"\u2265",
  "GreaterEqualLess":"\u22DB",
  "GreaterFullEqual":"\u2267",
  "GreaterGreater":"\u2AA2",
  "GreaterLess":"\u2277",
  "GreaterSlantEqual":"\u2A7E",
  "GreaterTilde":"\u2273",
  "Gscr":"\uD835\uDCA2",
  "gscr":"\u210A",
  "gsim":"\u2273",
  "gsime":"\u2A8E",
  "gsiml":"\u2A90",
  "GT":"\u003E",
  "Gt":"\u226B",
  "gt":"\u003E",
  "gtcc":"\u2AA7",
  "gtcir":"\u2A7A",
  "gtdot":"\u22D7",
  "gtlPar":"\u2995",
  "gtquest":"\u2A7C",
  "gtrapprox":"\u2A86",
  "gtrarr":"\u2978",
  "gtrdot":"\u22D7",
  "gtreqless":"\u22DB",
  "gtreqqless":"\u2A8C",
  "gtrless":"\u2277",
  "gtrsim":"\u2273",
  "gvertneqq":"\u2269\uFE00",
  "gvnE":"\u2269\uFE00",
  "Hacek":"\u02C7",
  "hairsp":"\u200A",
  "half":"\u00BD",
  "hamilt":"\u210B",
  "HARDcy":"\u042A",
  "hardcy":"\u044A",
  "hArr":"\u21D4",
  "harr":"\u2194",
  "harrcir":"\u2948",
  "harrw":"\u21AD",
  "Hat":"\u005E",
  "hbar":"\u210F",
  "Hcirc":"\u0124",
  "hcirc":"\u0125",
  "hearts":"\u2665",
  "heartsuit":"\u2665",
  "hellip":"\u2026",
  "hercon":"\u22B9",
  "Hfr":"\u210C",
  "hfr":"\uD835\uDD25",
  "HilbertSpace":"\u210B",
  "hksearow":"\u2925",
  "hkswarow":"\u2926",
  "hoarr":"\u21FF",
  "homtht":"\u223B",
  "hookleftarrow":"\u21A9",
  "hookrightarrow":"\u21AA",
  "Hopf":"\u210D",
  "hopf":"\uD835\uDD59",
  "horbar":"\u2015",
  "HorizontalLine":"\u2500",
  "Hscr":"\u210B",
  "hscr":"\uD835\uDCBD",
  "hslash":"\u210F",
  "Hstrok":"\u0126",
  "hstrok":"\u0127",
  "HumpDownHump":"\u224E",
  "HumpEqual":"\u224F",
  "hybull":"\u2043",
  "hyphen":"\u2010",
  "Iacute":"\u00CD",
  "iacute":"\u00ED",
  "ic":"\u2063",
  "Icirc":"\u00CE",
  "icirc":"\u00EE",
  "Icy":"\u0418",
  "icy":"\u0438",
  "Idot":"\u0130",
  "IEcy":"\u0415",
  "iecy":"\u0435",
  "iexcl":"\u00A1",
  "iff":"\u21D4",
  "Ifr":"\u2111",
  "ifr":"\uD835\uDD26",
  "Igrave":"\u00CC",
  "igrave":"\u00EC",
  "ii":"\u2148",
  "iiiint":"\u2A0C",
  "iiint":"\u222D",
  "iinfin":"\u29DC",
  "iiota":"\u2129",
  "IJlig":"\u0132",
  "ijlig":"\u0133",
  "Im":"\u2111",
  "Imacr":"\u012A",
  "imacr":"\u012B",
  "image":"\u2111",
  "ImaginaryI":"\u2148",
  "imagline":"\u2110",
  "imagpart":"\u2111",
  "imath":"\u0131",
  "imof":"\u22B7",
  "imped":"\u01B5",
  "Implies":"\u21D2",
  "in":"\u2208",
  "incare":"\u2105",
  "infin":"\u221E",
  "infintie":"\u29DD",
  "inodot":"\u0131",
  "Int":"\u222C",
  "int":"\u222B",
  "intcal":"\u22BA",
  "integers":"\u2124",
  "Integral":"\u222B",
  "intercal":"\u22BA",
  "Intersection":"\u22C2",
  "intlarhk":"\u2A17",
  "intprod":"\u2A3C",
  "InvisibleComma":"\u2063",
  "InvisibleTimes":"\u2062",
  "IOcy":"\u0401",
  "iocy":"\u0451",
  "Iogon":"\u012E",
  "iogon":"\u012F",
  "Iopf":"\uD835\uDD40",
  "iopf":"\uD835\uDD5A",
  "Iota":"\u0399",
  "iota":"\u03B9",
  "iprod":"\u2A3C",
  "iquest":"\u00BF",
  "Iscr":"\u2110",
  "iscr":"\uD835\uDCBE",
  "isin":"\u2208",
  "isindot":"\u22F5",
  "isinE":"\u22F9",
  "isins":"\u22F4",
  "isinsv":"\u22F3",
  "isinv":"\u2208",
  "it":"\u2062",
  "Itilde":"\u0128",
  "itilde":"\u0129",
  "Iukcy":"\u0406",
  "iukcy":"\u0456",
  "Iuml":"\u00CF",
  "iuml":"\u00EF",
  "Jcirc":"\u0134",
  "jcirc":"\u0135",
  "Jcy":"\u0419",
  "jcy":"\u0439",
  "Jfr":"\uD835\uDD0D",
  "jfr":"\uD835\uDD27",
  "jmath":"\u0237",
  "Jopf":"\uD835\uDD41",
  "jopf":"\uD835\uDD5B",
  "Jscr":"\uD835\uDCA5",
  "jscr":"\uD835\uDCBF",
  "Jsercy":"\u0408",
  "jsercy":"\u0458",
  "Jukcy":"\u0404",
  "jukcy":"\u0454",
  "Kappa":"\u039A",
  "kappa":"\u03BA",
  "kappav":"\u03F0",
  "Kcedil":"\u0136",
  "kcedil":"\u0137",
  "Kcy":"\u041A",
  "kcy":"\u043A",
  "Kfr":"\uD835\uDD0E",
  "kfr":"\uD835\uDD28",
  "kgreen":"\u0138",
  "KHcy":"\u0425",
  "khcy":"\u0445",
  "KJcy":"\u040C",
  "kjcy":"\u045C",
  "Kopf":"\uD835\uDD42",
  "kopf":"\uD835\uDD5C",
  "Kscr":"\uD835\uDCA6",
  "kscr":"\uD835\uDCC0",
  "lAarr":"\u21DA",
  "Lacute":"\u0139",
  "lacute":"\u013A",
  "laemptyv":"\u29B4",
  "lagran":"\u2112",
  "Lambda":"\u039B",
  "lambda":"\u03BB",
  "Lang":"\u27EA",
  "lang":"\u27E8",
  "langd":"\u2991",
  "langle":"\u27E8",
  "lap":"\u2A85",
  "Laplacetrf":"\u2112",
  "laquo":"\u00AB",
  "Larr":"\u219E",
  "lArr":"\u21D0",
  "larr":"\u2190",
  "larrb":"\u21E4",
  "larrbfs":"\u291F",
  "larrfs":"\u291D",
  "larrhk":"\u21A9",
  "larrlp":"\u21AB",
  "larrpl":"\u2939",
  "larrsim":"\u2973",
  "larrtl":"\u21A2",
  "lat":"\u2AAB",
  "lAtail":"\u291B",
  "latail":"\u2919",
  "late":"\u2AAD",
  "lates":"\u2AAD\uFE00",
  "lBarr":"\u290E",
  "lbarr":"\u290C",
  "lbbrk":"\u2772",
  "lbrace":"\u007B",
  "lbrack":"\u005B",
  "lbrke":"\u298B",
  "lbrksld":"\u298F",
  "lbrkslu":"\u298D",
  "Lcaron":"\u013D",
  "lcaron":"\u013E",
  "Lcedil":"\u013B",
  "lcedil":"\u013C",
  "lceil":"\u2308",
  "lcub":"\u007B",
  "Lcy":"\u041B",
  "lcy":"\u043B",
  "ldca":"\u2936",
  "ldquo":"\u201C",
  "ldquor":"\u201E",
  "ldrdhar":"\u2967",
  "ldrushar":"\u294B",
  "ldsh":"\u21B2",
  "lE":"\u2266",
  "le":"\u2264",
  "LeftAngleBracket":"\u27E8",
  "LeftArrow":"\u2190",
  "Leftarrow":"\u21D0",
  "leftarrow":"\u2190",
  "LeftArrowBar":"\u21E4",
  "LeftArrowRightArrow":"\u21C6",
  "leftarrowtail":"\u21A2",
  "LeftCeiling":"\u2308",
  "LeftDoubleBracket":"\u27E6",
  "LeftDownTeeVector":"\u2961",
  "LeftDownVector":"\u21C3",
  "LeftDownVectorBar":"\u2959",
  "LeftFloor":"\u230A",
  "leftharpoondown":"\u21BD",
  "leftharpoonup":"\u21BC",
  "leftleftarrows":"\u21C7",
  "LeftRightArrow":"\u2194",
  "Leftrightarrow":"\u21D4",
  "leftrightarrow":"\u2194",
  "leftrightarrows":"\u21C6",
  "leftrightharpoons":"\u21CB",
  "leftrightsquigarrow":"\u21AD",
  "LeftRightVector":"\u294E",
  "LeftTee":"\u22A3",
  "LeftTeeArrow":"\u21A4",
  "LeftTeeVector":"\u295A",
  "leftthreetimes":"\u22CB",
  "LeftTriangle":"\u22B2",
  "LeftTriangleBar":"\u29CF",
  "LeftTriangleEqual":"\u22B4",
  "LeftUpDownVector":"\u2951",
  "LeftUpTeeVector":"\u2960",
  "LeftUpVector":"\u21BF",
  "LeftUpVectorBar":"\u2958",
  "LeftVector":"\u21BC",
  "LeftVectorBar":"\u2952",
  "lEg":"\u2A8B",
  "leg":"\u22DA",
  "leq":"\u2264",
  "leqq":"\u2266",
  "leqslant":"\u2A7D",
  "les":"\u2A7D",
  "lescc":"\u2AA8",
  "lesdot":"\u2A7F",
  "lesdoto":"\u2A81",
  "lesdotor":"\u2A83",
  "lesg":"\u22DA\uFE00",
  "lesges":"\u2A93",
  "lessapprox":"\u2A85",
  "lessdot":"\u22D6",
  "lesseqgtr":"\u22DA",
  "lesseqqgtr":"\u2A8B",
  "LessEqualGreater":"\u22DA",
  "LessFullEqual":"\u2266",
  "LessGreater":"\u2276",
  "lessgtr":"\u2276",
  "LessLess":"\u2AA1",
  "lesssim":"\u2272",
  "LessSlantEqual":"\u2A7D",
  "LessTilde":"\u2272",
  "lfisht":"\u297C",
  "lfloor":"\u230A",
  "Lfr":"\uD835\uDD0F",
  "lfr":"\uD835\uDD29",
  "lg":"\u2276",
  "lgE":"\u2A91",
  "lHar":"\u2962",
  "lhard":"\u21BD",
  "lharu":"\u21BC",
  "lharul":"\u296A",
  "lhblk":"\u2584",
  "LJcy":"\u0409",
  "ljcy":"\u0459",
  "Ll":"\u22D8",
  "ll":"\u226A",
  "llarr":"\u21C7",
  "llcorner":"\u231E",
  "Lleftarrow":"\u21DA",
  "llhard":"\u296B",
  "lltri":"\u25FA",
  "Lmidot":"\u013F",
  "lmidot":"\u0140",
  "lmoust":"\u23B0",
  "lmoustache":"\u23B0",
  "lnap":"\u2A89",
  "lnapprox":"\u2A89",
  "lnE":"\u2268",
  "lne":"\u2A87",
  "lneq":"\u2A87",
  "lneqq":"\u2268",
  "lnsim":"\u22E6",
  "loang":"\u27EC",
  "loarr":"\u21FD",
  "lobrk":"\u27E6",
  "LongLeftArrow":"\u27F5",
  "Longleftarrow":"\u27F8",
  "longleftarrow":"\u27F5",
  "LongLeftRightArrow":"\u27F7",
  "Longleftrightarrow":"\u27FA",
  "longleftrightarrow":"\u27F7",
  "longmapsto":"\u27FC",
  "LongRightArrow":"\u27F6",
  "Longrightarrow":"\u27F9",
  "longrightarrow":"\u27F6",
  "looparrowleft":"\u21AB",
  "looparrowright":"\u21AC",
  "lopar":"\u2985",
  "Lopf":"\uD835\uDD43",
  "lopf":"\uD835\uDD5D",
  "loplus":"\u2A2D",
  "lotimes":"\u2A34",
  "lowast":"\u2217",
  "lowbar":"\u005F",
  "LowerLeftArrow":"\u2199",
  "LowerRightArrow":"\u2198",
  "loz":"\u25CA",
  "lozenge":"\u25CA",
  "lozf":"\u29EB",
  "lpar":"\u0028",
  "lparlt":"\u2993",
  "lrarr":"\u21C6",
  "lrcorner":"\u231F",
  "lrhar":"\u21CB",
  "lrhard":"\u296D",
  "lrm":"\u200E",
  "lrtri":"\u22BF",
  "lsaquo":"\u2039",
  "Lscr":"\u2112",
  "lscr":"\uD835\uDCC1",
  "Lsh":"\u21B0",
  "lsh":"\u21B0",
  "lsim":"\u2272",
  "lsime":"\u2A8D",
  "lsimg":"\u2A8F",
  "lsqb":"\u005B",
  "lsquo":"\u2018",
  "lsquor":"\u201A",
  "Lstrok":"\u0141",
  "lstrok":"\u0142",
  "LT":"\u003C",
  "Lt":"\u226A",
  "lt":"\u003C",
  "ltcc":"\u2AA6",
  "ltcir":"\u2A79",
  "ltdot":"\u22D6",
  "lthree":"\u22CB",
  "ltimes":"\u22C9",
  "ltlarr":"\u2976",
  "ltquest":"\u2A7B",
  "ltri":"\u25C3",
  "ltrie":"\u22B4",
  "ltrif":"\u25C2",
  "ltrPar":"\u2996",
  "lurdshar":"\u294A",
  "luruhar":"\u2966",
  "lvertneqq":"\u2268\uFE00",
  "lvnE":"\u2268\uFE00",
  "macr":"\u00AF",
  "male":"\u2642",
  "malt":"\u2720",
  "maltese":"\u2720",
  "Map":"\u2905",
  "map":"\u21A6",
  "mapsto":"\u21A6",
  "mapstodown":"\u21A7",
  "mapstoleft":"\u21A4",
  "mapstoup":"\u21A5",
  "marker":"\u25AE",
  "mcomma":"\u2A29",
  "Mcy":"\u041C",
  "mcy":"\u043C",
  "mdash":"\u2014",
  "mDDot":"\u223A",
  "measuredangle":"\u2221",
  "MediumSpace":"\u205F",
  "Mellintrf":"\u2133",
  "Mfr":"\uD835\uDD10",
  "mfr":"\uD835\uDD2A",
  "mho":"\u2127",
  "micro":"\u00B5",
  "mid":"\u2223",
  "midast":"\u002A",
  "midcir":"\u2AF0",
  "middot":"\u00B7",
  "minus":"\u2212",
  "minusb":"\u229F",
  "minusd":"\u2238",
  "minusdu":"\u2A2A",
  "MinusPlus":"\u2213",
  "mlcp":"\u2ADB",
  "mldr":"\u2026",
  "mnplus":"\u2213",
  "models":"\u22A7",
  "Mopf":"\uD835\uDD44",
  "mopf":"\uD835\uDD5E",
  "mp":"\u2213",
  "Mscr":"\u2133",
  "mscr":"\uD835\uDCC2",
  "mstpos":"\u223E",
  "Mu":"\u039C",
  "mu":"\u03BC",
  "multimap":"\u22B8",
  "mumap":"\u22B8",
  "nabla":"\u2207",
  "Nacute":"\u0143",
  "nacute":"\u0144",
  "nang":"\u2220\u20D2",
  "nap":"\u2249",
  "napE":"\u2A70\u0338",
  "napid":"\u224B\u0338",
  "napos":"\u0149",
  "napprox":"\u2249",
  "natur":"\u266E",
  "natural":"\u266E",
  "naturals":"\u2115",
  "nbsp":"\u00A0",
  "nbump":"\u224E\u0338",
  "nbumpe":"\u224F\u0338",
  "ncap":"\u2A43",
  "Ncaron":"\u0147",
  "ncaron":"\u0148",
  "Ncedil":"\u0145",
  "ncedil":"\u0146",
  "ncong":"\u2247",
  "ncongdot":"\u2A6D\u0338",
  "ncup":"\u2A42",
  "Ncy":"\u041D",
  "ncy":"\u043D",
  "ndash":"\u2013",
  "ne":"\u2260",
  "nearhk":"\u2924",
  "neArr":"\u21D7",
  "nearr":"\u2197",
  "nearrow":"\u2197",
  "nedot":"\u2250\u0338",
  "NegativeMediumSpace":"\u200B",
  "NegativeThickSpace":"\u200B",
  "NegativeThinSpace":"\u200B",
  "NegativeVeryThinSpace":"\u200B",
  "nequiv":"\u2262",
  "nesear":"\u2928",
  "nesim":"\u2242\u0338",
  "NestedGreaterGreater":"\u226B",
  "NestedLessLess":"\u226A",
  "NewLine":"\u000A",
  "nexist":"\u2204",
  "nexists":"\u2204",
  "Nfr":"\uD835\uDD11",
  "nfr":"\uD835\uDD2B",
  "ngE":"\u2267\u0338",
  "nge":"\u2271",
  "ngeq":"\u2271",
  "ngeqq":"\u2267\u0338",
  "ngeqslant":"\u2A7E\u0338",
  "nges":"\u2A7E\u0338",
  "nGg":"\u22D9\u0338",
  "ngsim":"\u2275",
  "nGt":"\u226B\u20D2",
  "ngt":"\u226F",
  "ngtr":"\u226F",
  "nGtv":"\u226B\u0338",
  "nhArr":"\u21CE",
  "nharr":"\u21AE",
  "nhpar":"\u2AF2",
  "ni":"\u220B",
  "nis":"\u22FC",
  "nisd":"\u22FA",
  "niv":"\u220B",
  "NJcy":"\u040A",
  "njcy":"\u045A",
  "nlArr":"\u21CD",
  "nlarr":"\u219A",
  "nldr":"\u2025",
  "nlE":"\u2266\u0338",
  "nle":"\u2270",
  "nLeftarrow":"\u21CD",
  "nleftarrow":"\u219A",
  "nLeftrightarrow":"\u21CE",
  "nleftrightarrow":"\u21AE",
  "nleq":"\u2270",
  "nleqq":"\u2266\u0338",
  "nleqslant":"\u2A7D\u0338",
  "nles":"\u2A7D\u0338",
  "nless":"\u226E",
  "nLl":"\u22D8\u0338",
  "nlsim":"\u2274",
  "nLt":"\u226A\u20D2",
  "nlt":"\u226E",
  "nltri":"\u22EA",
  "nltrie":"\u22EC",
  "nLtv":"\u226A\u0338",
  "nmid":"\u2224",
  "NoBreak":"\u2060",
  "NonBreakingSpace":"\u00A0",
  "Nopf":"\u2115",
  "nopf":"\uD835\uDD5F",
  "Not":"\u2AEC",
  "not":"\u00AC",
  "NotCongruent":"\u2262",
  "NotCupCap":"\u226D",
  "NotDoubleVerticalBar":"\u2226",
  "NotElement":"\u2209",
  "NotEqual":"\u2260",
  "NotEqualTilde":"\u2242\u0338",
  "NotExists":"\u2204",
  "NotGreater":"\u226F",
  "NotGreaterEqual":"\u2271",
  "NotGreaterFullEqual":"\u2267\u0338",
  "NotGreaterGreater":"\u226B\u0338",
  "NotGreaterLess":"\u2279",
  "NotGreaterSlantEqual":"\u2A7E\u0338",
  "NotGreaterTilde":"\u2275",
  "NotHumpDownHump":"\u224E\u0338",
  "NotHumpEqual":"\u224F\u0338",
  "notin":"\u2209",
  "notindot":"\u22F5\u0338",
  "notinE":"\u22F9\u0338",
  "notinva":"\u2209",
  "notinvb":"\u22F7",
  "notinvc":"\u22F6",
  "NotLeftTriangle":"\u22EA",
  "NotLeftTriangleBar":"\u29CF\u0338",
  "NotLeftTriangleEqual":"\u22EC",
  "NotLess":"\u226E",
  "NotLessEqual":"\u2270",
  "NotLessGreater":"\u2278",
  "NotLessLess":"\u226A\u0338",
  "NotLessSlantEqual":"\u2A7D\u0338",
  "NotLessTilde":"\u2274",
  "NotNestedGreaterGreater":"\u2AA2\u0338",
  "NotNestedLessLess":"\u2AA1\u0338",
  "notni":"\u220C",
  "notniva":"\u220C",
  "notnivb":"\u22FE",
  "notnivc":"\u22FD",
  "NotPrecedes":"\u2280",
  "NotPrecedesEqual":"\u2AAF\u0338",
  "NotPrecedesSlantEqual":"\u22E0",
  "NotReverseElement":"\u220C",
  "NotRightTriangle":"\u22EB",
  "NotRightTriangleBar":"\u29D0\u0338",
  "NotRightTriangleEqual":"\u22ED",
  "NotSquareSubset":"\u228F\u0338",
  "NotSquareSubsetEqual":"\u22E2",
  "NotSquareSuperset":"\u2290\u0338",
  "NotSquareSupersetEqual":"\u22E3",
  "NotSubset":"\u2282\u20D2",
  "NotSubsetEqual":"\u2288",
  "NotSucceeds":"\u2281",
  "NotSucceedsEqual":"\u2AB0\u0338",
  "NotSucceedsSlantEqual":"\u22E1",
  "NotSucceedsTilde":"\u227F\u0338",
  "NotSuperset":"\u2283\u20D2",
  "NotSupersetEqual":"\u2289",
  "NotTilde":"\u2241",
  "NotTildeEqual":"\u2244",
  "NotTildeFullEqual":"\u2247",
  "NotTildeTilde":"\u2249",
  "NotVerticalBar":"\u2224",
  "npar":"\u2226",
  "nparallel":"\u2226",
  "nparsl":"\u2AFD\u20E5",
  "npart":"\u2202\u0338",
  "npolint":"\u2A14",
  "npr":"\u2280",
  "nprcue":"\u22E0",
  "npre":"\u2AAF\u0338",
  "nprec":"\u2280",
  "npreceq":"\u2AAF\u0338",
  "nrArr":"\u21CF",
  "nrarr":"\u219B",
  "nrarrc":"\u2933\u0338",
  "nrarrw":"\u219D\u0338",
  "nRightarrow":"\u21CF",
  "nrightarrow":"\u219B",
  "nrtri":"\u22EB",
  "nrtrie":"\u22ED",
  "nsc":"\u2281",
  "nsccue":"\u22E1",
  "nsce":"\u2AB0\u0338",
  "Nscr":"\uD835\uDCA9",
  "nscr":"\uD835\uDCC3",
  "nshortmid":"\u2224",
  "nshortparallel":"\u2226",
  "nsim":"\u2241",
  "nsime":"\u2244",
  "nsimeq":"\u2244",
  "nsmid":"\u2224",
  "nspar":"\u2226",
  "nsqsube":"\u22E2",
  "nsqsupe":"\u22E3",
  "nsub":"\u2284",
  "nsubE":"\u2AC5\u0338",
  "nsube":"\u2288",
  "nsubset":"\u2282\u20D2",
  "nsubseteq":"\u2288",
  "nsubseteqq":"\u2AC5\u0338",
  "nsucc":"\u2281",
  "nsucceq":"\u2AB0\u0338",
  "nsup":"\u2285",
  "nsupE":"\u2AC6\u0338",
  "nsupe":"\u2289",
  "nsupset":"\u2283\u20D2",
  "nsupseteq":"\u2289",
  "nsupseteqq":"\u2AC6\u0338",
  "ntgl":"\u2279",
  "Ntilde":"\u00D1",
  "ntilde":"\u00F1",
  "ntlg":"\u2278",
  "ntriangleleft":"\u22EA",
  "ntrianglelefteq":"\u22EC",
  "ntriangleright":"\u22EB",
  "ntrianglerighteq":"\u22ED",
  "Nu":"\u039D",
  "nu":"\u03BD",
  "num":"\u0023",
  "numero":"\u2116",
  "numsp":"\u2007",
  "nvap":"\u224D\u20D2",
  "nVDash":"\u22AF",
  "nVdash":"\u22AE",
  "nvDash":"\u22AD",
  "nvdash":"\u22AC",
  "nvge":"\u2265\u20D2",
  "nvgt":"\u003E\u20D2",
  "nvHarr":"\u2904",
  "nvinfin":"\u29DE",
  "nvlArr":"\u2902",
  "nvle":"\u2264\u20D2",
  "nvlt":"\u003C\u20D2",
  "nvltrie":"\u22B4\u20D2",
  "nvrArr":"\u2903",
  "nvrtrie":"\u22B5\u20D2",
  "nvsim":"\u223C\u20D2",
  "nwarhk":"\u2923",
  "nwArr":"\u21D6",
  "nwarr":"\u2196",
  "nwarrow":"\u2196",
  "nwnear":"\u2927",
  "Oacute":"\u00D3",
  "oacute":"\u00F3",
  "oast":"\u229B",
  "ocir":"\u229A",
  "Ocirc":"\u00D4",
  "ocirc":"\u00F4",
  "Ocy":"\u041E",
  "ocy":"\u043E",
  "odash":"\u229D",
  "Odblac":"\u0150",
  "odblac":"\u0151",
  "odiv":"\u2A38",
  "odot":"\u2299",
  "odsold":"\u29BC",
  "OElig":"\u0152",
  "oelig":"\u0153",
  "ofcir":"\u29BF",
  "Ofr":"\uD835\uDD12",
  "ofr":"\uD835\uDD2C",
  "ogon":"\u02DB",
  "Ograve":"\u00D2",
  "ograve":"\u00F2",
  "ogt":"\u29C1",
  "ohbar":"\u29B5",
  "ohm":"\u03A9",
  "oint":"\u222E",
  "olarr":"\u21BA",
  "olcir":"\u29BE",
  "olcross":"\u29BB",
  "oline":"\u203E",
  "olt":"\u29C0",
  "Omacr":"\u014C",
  "omacr":"\u014D",
  "Omega":"\u03A9",
  "omega":"\u03C9",
  "Omicron":"\u039F",
  "omicron":"\u03BF",
  "omid":"\u29B6",
  "ominus":"\u2296",
  "Oopf":"\uD835\uDD46",
  "oopf":"\uD835\uDD60",
  "opar":"\u29B7",
  "OpenCurlyDoubleQuote":"\u201C",
  "OpenCurlyQuote":"\u2018",
  "operp":"\u29B9",
  "oplus":"\u2295",
  "Or":"\u2A54",
  "or":"\u2228",
  "orarr":"\u21BB",
  "ord":"\u2A5D",
  "order":"\u2134",
  "orderof":"\u2134",
  "ordf":"\u00AA",
  "ordm":"\u00BA",
  "origof":"\u22B6",
  "oror":"\u2A56",
  "orslope":"\u2A57",
  "orv":"\u2A5B",
  "oS":"\u24C8",
  "Oscr":"\uD835\uDCAA",
  "oscr":"\u2134",
  "Oslash":"\u00D8",
  "oslash":"\u00F8",
  "osol":"\u2298",
  "Otilde":"\u00D5",
  "otilde":"\u00F5",
  "Otimes":"\u2A37",
  "otimes":"\u2297",
  "otimesas":"\u2A36",
  "Ouml":"\u00D6",
  "ouml":"\u00F6",
  "ovbar":"\u233D",
  "OverBar":"\u203E",
  "OverBrace":"\u23DE",
  "OverBracket":"\u23B4",
  "OverParenthesis":"\u23DC",
  "par":"\u2225",
  "para":"\u00B6",
  "parallel":"\u2225",
  "parsim":"\u2AF3",
  "parsl":"\u2AFD",
  "part":"\u2202",
  "PartialD":"\u2202",
  "Pcy":"\u041F",
  "pcy":"\u043F",
  "percnt":"\u0025",
  "period":"\u002E",
  "permil":"\u2030",
  "perp":"\u22A5",
  "pertenk":"\u2031",
  "Pfr":"\uD835\uDD13",
  "pfr":"\uD835\uDD2D",
  "Phi":"\u03A6",
  "phi":"\u03C6",
  "phiv":"\u03D5",
  "phmmat":"\u2133",
  "phone":"\u260E",
  "Pi":"\u03A0",
  "pi":"\u03C0",
  "pitchfork":"\u22D4",
  "piv":"\u03D6",
  "planck":"\u210F",
  "planckh":"\u210E",
  "plankv":"\u210F",
  "plus":"\u002B",
  "plusacir":"\u2A23",
  "plusb":"\u229E",
  "pluscir":"\u2A22",
  "plusdo":"\u2214",
  "plusdu":"\u2A25",
  "pluse":"\u2A72",
  "PlusMinus":"\u00B1",
  "plusmn":"\u00B1",
  "plussim":"\u2A26",
  "plustwo":"\u2A27",
  "pm":"\u00B1",
  "Poincareplane":"\u210C",
  "pointint":"\u2A15",
  "Popf":"\u2119",
  "popf":"\uD835\uDD61",
  "pound":"\u00A3",
  "Pr":"\u2ABB",
  "pr":"\u227A",
  "prap":"\u2AB7",
  "prcue":"\u227C",
  "prE":"\u2AB3",
  "pre":"\u2AAF",
  "prec":"\u227A",
  "precapprox":"\u2AB7",
  "preccurlyeq":"\u227C",
  "Precedes":"\u227A",
  "PrecedesEqual":"\u2AAF",
  "PrecedesSlantEqual":"\u227C",
  "PrecedesTilde":"\u227E",
  "preceq":"\u2AAF",
  "precnapprox":"\u2AB9",
  "precneqq":"\u2AB5",
  "precnsim":"\u22E8",
  "precsim":"\u227E",
  "Prime":"\u2033",
  "prime":"\u2032",
  "primes":"\u2119",
  "prnap":"\u2AB9",
  "prnE":"\u2AB5",
  "prnsim":"\u22E8",
  "prod":"\u220F",
  "Product":"\u220F",
  "profalar":"\u232E",
  "profline":"\u2312",
  "profsurf":"\u2313",
  "prop":"\u221D",
  "Proportion":"\u2237",
  "Proportional":"\u221D",
  "propto":"\u221D",
  "prsim":"\u227E",
  "prurel":"\u22B0",
  "Pscr":"\uD835\uDCAB",
  "pscr":"\uD835\uDCC5",
  "Psi":"\u03A8",
  "psi":"\u03C8",
  "puncsp":"\u2008",
  "Qfr":"\uD835\uDD14",
  "qfr":"\uD835\uDD2E",
  "qint":"\u2A0C",
  "Qopf":"\u211A",
  "qopf":"\uD835\uDD62",
  "qprime":"\u2057",
  "Qscr":"\uD835\uDCAC",
  "qscr":"\uD835\uDCC6",
  "quaternions":"\u210D",
  "quatint":"\u2A16",
  "quest":"\u003F",
  "questeq":"\u225F",
  "QUOT":"\u0022",
  "quot":"\u0022",
  "rAarr":"\u21DB",
  "race":"\u223D\u0331",
  "Racute":"\u0154",
  "racute":"\u0155",
  "radic":"\u221A",
  "raemptyv":"\u29B3",
  "Rang":"\u27EB",
  "rang":"\u27E9",
  "rangd":"\u2992",
  "range":"\u29A5",
  "rangle":"\u27E9",
  "raquo":"\u00BB",
  "Rarr":"\u21A0",
  "rArr":"\u21D2",
  "rarr":"\u2192",
  "rarrap":"\u2975",
  "rarrb":"\u21E5",
  "rarrbfs":"\u2920",
  "rarrc":"\u2933",
  "rarrfs":"\u291E",
  "rarrhk":"\u21AA",
  "rarrlp":"\u21AC",
  "rarrpl":"\u2945",
  "rarrsim":"\u2974",
  "Rarrtl":"\u2916",
  "rarrtl":"\u21A3",
  "rarrw":"\u219D",
  "rAtail":"\u291C",
  "ratail":"\u291A",
  "ratio":"\u2236",
  "rationals":"\u211A",
  "RBarr":"\u2910",
  "rBarr":"\u290F",
  "rbarr":"\u290D",
  "rbbrk":"\u2773",
  "rbrace":"\u007D",
  "rbrack":"\u005D",
  "rbrke":"\u298C",
  "rbrksld":"\u298E",
  "rbrkslu":"\u2990",
  "Rcaron":"\u0158",
  "rcaron":"\u0159",
  "Rcedil":"\u0156",
  "rcedil":"\u0157",
  "rceil":"\u2309",
  "rcub":"\u007D",
  "Rcy":"\u0420",
  "rcy":"\u0440",
  "rdca":"\u2937",
  "rdldhar":"\u2969",
  "rdquo":"\u201D",
  "rdquor":"\u201D",
  "rdsh":"\u21B3",
  "Re":"\u211C",
  "real":"\u211C",
  "realine":"\u211B",
  "realpart":"\u211C",
  "reals":"\u211D",
  "rect":"\u25AD",
  "REG":"\u00AE",
  "reg":"\u00AE",
  "ReverseElement":"\u220B",
  "ReverseEquilibrium":"\u21CB",
  "ReverseUpEquilibrium":"\u296F",
  "rfisht":"\u297D",
  "rfloor":"\u230B",
  "Rfr":"\u211C",
  "rfr":"\uD835\uDD2F",
  "rHar":"\u2964",
  "rhard":"\u21C1",
  "rharu":"\u21C0",
  "rharul":"\u296C",
  "Rho":"\u03A1",
  "rho":"\u03C1",
  "rhov":"\u03F1",
  "RightAngleBracket":"\u27E9",
  "RightArrow":"\u2192",
  "Rightarrow":"\u21D2",
  "rightarrow":"\u2192",
  "RightArrowBar":"\u21E5",
  "RightArrowLeftArrow":"\u21C4",
  "rightarrowtail":"\u21A3",
  "RightCeiling":"\u2309",
  "RightDoubleBracket":"\u27E7",
  "RightDownTeeVector":"\u295D",
  "RightDownVector":"\u21C2",
  "RightDownVectorBar":"\u2955",
  "RightFloor":"\u230B",
  "rightharpoondown":"\u21C1",
  "rightharpoonup":"\u21C0",
  "rightleftarrows":"\u21C4",
  "rightleftharpoons":"\u21CC",
  "rightrightarrows":"\u21C9",
  "rightsquigarrow":"\u219D",
  "RightTee":"\u22A2",
  "RightTeeArrow":"\u21A6",
  "RightTeeVector":"\u295B",
  "rightthreetimes":"\u22CC",
  "RightTriangle":"\u22B3",
  "RightTriangleBar":"\u29D0",
  "RightTriangleEqual":"\u22B5",
  "RightUpDownVector":"\u294F",
  "RightUpTeeVector":"\u295C",
  "RightUpVector":"\u21BE",
  "RightUpVectorBar":"\u2954",
  "RightVector":"\u21C0",
  "RightVectorBar":"\u2953",
  "ring":"\u02DA",
  "risingdotseq":"\u2253",
  "rlarr":"\u21C4",
  "rlhar":"\u21CC",
  "rlm":"\u200F",
  "rmoust":"\u23B1",
  "rmoustache":"\u23B1",
  "rnmid":"\u2AEE",
  "roang":"\u27ED",
  "roarr":"\u21FE",
  "robrk":"\u27E7",
  "ropar":"\u2986",
  "Ropf":"\u211D",
  "ropf":"\uD835\uDD63",
  "roplus":"\u2A2E",
  "rotimes":"\u2A35",
  "RoundImplies":"\u2970",
  "rpar":"\u0029",
  "rpargt":"\u2994",
  "rppolint":"\u2A12",
  "rrarr":"\u21C9",
  "Rrightarrow":"\u21DB",
  "rsaquo":"\u203A",
  "Rscr":"\u211B",
  "rscr":"\uD835\uDCC7",
  "Rsh":"\u21B1",
  "rsh":"\u21B1",
  "rsqb":"\u005D",
  "rsquo":"\u2019",
  "rsquor":"\u2019",
  "rthree":"\u22CC",
  "rtimes":"\u22CA",
  "rtri":"\u25B9",
  "rtrie":"\u22B5",
  "rtrif":"\u25B8",
  "rtriltri":"\u29CE",
  "RuleDelayed":"\u29F4",
  "ruluhar":"\u2968",
  "rx":"\u211E",
  "Sacute":"\u015A",
  "sacute":"\u015B",
  "sbquo":"\u201A",
  "Sc":"\u2ABC",
  "sc":"\u227B",
  "scap":"\u2AB8",
  "Scaron":"\u0160",
  "scaron":"\u0161",
  "sccue":"\u227D",
  "scE":"\u2AB4",
  "sce":"\u2AB0",
  "Scedil":"\u015E",
  "scedil":"\u015F",
  "Scirc":"\u015C",
  "scirc":"\u015D",
  "scnap":"\u2ABA",
  "scnE":"\u2AB6",
  "scnsim":"\u22E9",
  "scpolint":"\u2A13",
  "scsim":"\u227F",
  "Scy":"\u0421",
  "scy":"\u0441",
  "sdot":"\u22C5",
  "sdotb":"\u22A1",
  "sdote":"\u2A66",
  "searhk":"\u2925",
  "seArr":"\u21D8",
  "searr":"\u2198",
  "searrow":"\u2198",
  "sect":"\u00A7",
  "semi":"\u003B",
  "seswar":"\u2929",
  "setminus":"\u2216",
  "setmn":"\u2216",
  "sext":"\u2736",
  "Sfr":"\uD835\uDD16",
  "sfr":"\uD835\uDD30",
  "sfrown":"\u2322",
  "sharp":"\u266F",
  "SHCHcy":"\u0429",
  "shchcy":"\u0449",
  "SHcy":"\u0428",
  "shcy":"\u0448",
  "ShortDownArrow":"\u2193",
  "ShortLeftArrow":"\u2190",
  "shortmid":"\u2223",
  "shortparallel":"\u2225",
  "ShortRightArrow":"\u2192",
  "ShortUpArrow":"\u2191",
  "shy":"\u00AD",
  "Sigma":"\u03A3",
  "sigma":"\u03C3",
  "sigmaf":"\u03C2",
  "sigmav":"\u03C2",
  "sim":"\u223C",
  "simdot":"\u2A6A",
  "sime":"\u2243",
  "simeq":"\u2243",
  "simg":"\u2A9E",
  "simgE":"\u2AA0",
  "siml":"\u2A9D",
  "simlE":"\u2A9F",
  "simne":"\u2246",
  "simplus":"\u2A24",
  "simrarr":"\u2972",
  "slarr":"\u2190",
  "SmallCircle":"\u2218",
  "smallsetminus":"\u2216",
  "smashp":"\u2A33",
  "smeparsl":"\u29E4",
  "smid":"\u2223",
  "smile":"\u2323",
  "smt":"\u2AAA",
  "smte":"\u2AAC",
  "smtes":"\u2AAC\uFE00",
  "SOFTcy":"\u042C",
  "softcy":"\u044C",
  "sol":"\u002F",
  "solb":"\u29C4",
  "solbar":"\u233F",
  "Sopf":"\uD835\uDD4A",
  "sopf":"\uD835\uDD64",
  "spades":"\u2660",
  "spadesuit":"\u2660",
  "spar":"\u2225",
  "sqcap":"\u2293",
  "sqcaps":"\u2293\uFE00",
  "sqcup":"\u2294",
  "sqcups":"\u2294\uFE00",
  "Sqrt":"\u221A",
  "sqsub":"\u228F",
  "sqsube":"\u2291",
  "sqsubset":"\u228F",
  "sqsubseteq":"\u2291",
  "sqsup":"\u2290",
  "sqsupe":"\u2292",
  "sqsupset":"\u2290",
  "sqsupseteq":"\u2292",
  "squ":"\u25A1",
  "Square":"\u25A1",
  "square":"\u25A1",
  "SquareIntersection":"\u2293",
  "SquareSubset":"\u228F",
  "SquareSubsetEqual":"\u2291",
  "SquareSuperset":"\u2290",
  "SquareSupersetEqual":"\u2292",
  "SquareUnion":"\u2294",
  "squarf":"\u25AA",
  "squf":"\u25AA",
  "srarr":"\u2192",
  "Sscr":"\uD835\uDCAE",
  "sscr":"\uD835\uDCC8",
  "ssetmn":"\u2216",
  "ssmile":"\u2323",
  "sstarf":"\u22C6",
  "Star":"\u22C6",
  "star":"\u2606",
  "starf":"\u2605",
  "straightepsilon":"\u03F5",
  "straightphi":"\u03D5",
  "strns":"\u00AF",
  "Sub":"\u22D0",
  "sub":"\u2282",
  "subdot":"\u2ABD",
  "subE":"\u2AC5",
  "sube":"\u2286",
  "subedot":"\u2AC3",
  "submult":"\u2AC1",
  "subnE":"\u2ACB",
  "subne":"\u228A",
  "subplus":"\u2ABF",
  "subrarr":"\u2979",
  "Subset":"\u22D0",
  "subset":"\u2282",
  "subseteq":"\u2286",
  "subseteqq":"\u2AC5",
  "SubsetEqual":"\u2286",
  "subsetneq":"\u228A",
  "subsetneqq":"\u2ACB",
  "subsim":"\u2AC7",
  "subsub":"\u2AD5",
  "subsup":"\u2AD3",
  "succ":"\u227B",
  "succapprox":"\u2AB8",
  "succcurlyeq":"\u227D",
  "Succeeds":"\u227B",
  "SucceedsEqual":"\u2AB0",
  "SucceedsSlantEqual":"\u227D",
  "SucceedsTilde":"\u227F",
  "succeq":"\u2AB0",
  "succnapprox":"\u2ABA",
  "succneqq":"\u2AB6",
  "succnsim":"\u22E9",
  "succsim":"\u227F",
  "SuchThat":"\u220B",
  "Sum":"\u2211",
  "sum":"\u2211",
  "sung":"\u266A",
  "Sup":"\u22D1",
  "sup":"\u2283",
  "sup1":"\u00B9",
  "sup2":"\u00B2",
  "sup3":"\u00B3",
  "supdot":"\u2ABE",
  "supdsub":"\u2AD8",
  "supE":"\u2AC6",
  "supe":"\u2287",
  "supedot":"\u2AC4",
  "Superset":"\u2283",
  "SupersetEqual":"\u2287",
  "suphsol":"\u27C9",
  "suphsub":"\u2AD7",
  "suplarr":"\u297B",
  "supmult":"\u2AC2",
  "supnE":"\u2ACC",
  "supne":"\u228B",
  "supplus":"\u2AC0",
  "Supset":"\u22D1",
  "supset":"\u2283",
  "supseteq":"\u2287",
  "supseteqq":"\u2AC6",
  "supsetneq":"\u228B",
  "supsetneqq":"\u2ACC",
  "supsim":"\u2AC8",
  "supsub":"\u2AD4",
  "supsup":"\u2AD6",
  "swarhk":"\u2926",
  "swArr":"\u21D9",
  "swarr":"\u2199",
  "swarrow":"\u2199",
  "swnwar":"\u292A",
  "szlig":"\u00DF",
  "Tab":"\u0009",
  "target":"\u2316",
  "Tau":"\u03A4",
  "tau":"\u03C4",
  "tbrk":"\u23B4",
  "Tcaron":"\u0164",
  "tcaron":"\u0165",
  "Tcedil":"\u0162",
  "tcedil":"\u0163",
  "Tcy":"\u0422",
  "tcy":"\u0442",
  "tdot":"\u20DB",
  "telrec":"\u2315",
  "Tfr":"\uD835\uDD17",
  "tfr":"\uD835\uDD31",
  "there4":"\u2234",
  "Therefore":"\u2234",
  "therefore":"\u2234",
  "Theta":"\u0398",
  "theta":"\u03B8",
  "thetasym":"\u03D1",
  "thetav":"\u03D1",
  "thickapprox":"\u2248",
  "thicksim":"\u223C",
  "ThickSpace":"\u205F\u200A",
  "thinsp":"\u2009",
  "ThinSpace":"\u2009",
  "thkap":"\u2248",
  "thksim":"\u223C",
  "THORN":"\u00DE",
  "thorn":"\u00FE",
  "Tilde":"\u223C",
  "tilde":"\u02DC",
  "TildeEqual":"\u2243",
  "TildeFullEqual":"\u2245",
  "TildeTilde":"\u2248",
  "times":"\u00D7",
  "timesb":"\u22A0",
  "timesbar":"\u2A31",
  "timesd":"\u2A30",
  "tint":"\u222D",
  "toea":"\u2928",
  "top":"\u22A4",
  "topbot":"\u2336",
  "topcir":"\u2AF1",
  "Topf":"\uD835\uDD4B",
  "topf":"\uD835\uDD65",
  "topfork":"\u2ADA",
  "tosa":"\u2929",
  "tprime":"\u2034",
  "TRADE":"\u2122",
  "trade":"\u2122",
  "triangle":"\u25B5",
  "triangledown":"\u25BF",
  "triangleleft":"\u25C3",
  "trianglelefteq":"\u22B4",
  "triangleq":"\u225C",
  "triangleright":"\u25B9",
  "trianglerighteq":"\u22B5",
  "tridot":"\u25EC",
  "trie":"\u225C",
  "triminus":"\u2A3A",
  "TripleDot":"\u20DB",
  "triplus":"\u2A39",
  "trisb":"\u29CD",
  "tritime":"\u2A3B",
  "trpezium":"\u23E2",
  "Tscr":"\uD835\uDCAF",
  "tscr":"\uD835\uDCC9",
  "TScy":"\u0426",
  "tscy":"\u0446",
  "TSHcy":"\u040B",
  "tshcy":"\u045B",
  "Tstrok":"\u0166",
  "tstrok":"\u0167",
  "twixt":"\u226C",
  "twoheadleftarrow":"\u219E",
  "twoheadrightarrow":"\u21A0",
  "Uacute":"\u00DA",
  "uacute":"\u00FA",
  "Uarr":"\u219F",
  "uArr":"\u21D1",
  "uarr":"\u2191",
  "Uarrocir":"\u2949",
  "Ubrcy":"\u040E",
  "ubrcy":"\u045E",
  "Ubreve":"\u016C",
  "ubreve":"\u016D",
  "Ucirc":"\u00DB",
  "ucirc":"\u00FB",
  "Ucy":"\u0423",
  "ucy":"\u0443",
  "udarr":"\u21C5",
  "Udblac":"\u0170",
  "udblac":"\u0171",
  "udhar":"\u296E",
  "ufisht":"\u297E",
  "Ufr":"\uD835\uDD18",
  "ufr":"\uD835\uDD32",
  "Ugrave":"\u00D9",
  "ugrave":"\u00F9",
  "uHar":"\u2963",
  "uharl":"\u21BF",
  "uharr":"\u21BE",
  "uhblk":"\u2580",
  "ulcorn":"\u231C",
  "ulcorner":"\u231C",
  "ulcrop":"\u230F",
  "ultri":"\u25F8",
  "Umacr":"\u016A",
  "umacr":"\u016B",
  "uml":"\u00A8",
  "UnderBar":"\u005F",
  "UnderBrace":"\u23DF",
  "UnderBracket":"\u23B5",
  "UnderParenthesis":"\u23DD",
  "Union":"\u22C3",
  "UnionPlus":"\u228E",
  "Uogon":"\u0172",
  "uogon":"\u0173",
  "Uopf":"\uD835\uDD4C",
  "uopf":"\uD835\uDD66",
  "UpArrow":"\u2191",
  "Uparrow":"\u21D1",
  "uparrow":"\u2191",
  "UpArrowBar":"\u2912",
  "UpArrowDownArrow":"\u21C5",
  "UpDownArrow":"\u2195",
  "Updownarrow":"\u21D5",
  "updownarrow":"\u2195",
  "UpEquilibrium":"\u296E",
  "upharpoonleft":"\u21BF",
  "upharpoonright":"\u21BE",
  "uplus":"\u228E",
  "UpperLeftArrow":"\u2196",
  "UpperRightArrow":"\u2197",
  "Upsi":"\u03D2",
  "upsi":"\u03C5",
  "upsih":"\u03D2",
  "Upsilon":"\u03A5",
  "upsilon":"\u03C5",
  "UpTee":"\u22A5",
  "UpTeeArrow":"\u21A5",
  "upuparrows":"\u21C8",
  "urcorn":"\u231D",
  "urcorner":"\u231D",
  "urcrop":"\u230E",
  "Uring":"\u016E",
  "uring":"\u016F",
  "urtri":"\u25F9",
  "Uscr":"\uD835\uDCB0",
  "uscr":"\uD835\uDCCA",
  "utdot":"\u22F0",
  "Utilde":"\u0168",
  "utilde":"\u0169",
  "utri":"\u25B5",
  "utrif":"\u25B4",
  "uuarr":"\u21C8",
  "Uuml":"\u00DC",
  "uuml":"\u00FC",
  "uwangle":"\u29A7",
  "vangrt":"\u299C",
  "varepsilon":"\u03F5",
  "varkappa":"\u03F0",
  "varnothing":"\u2205",
  "varphi":"\u03D5",
  "varpi":"\u03D6",
  "varpropto":"\u221D",
  "vArr":"\u21D5",
  "varr":"\u2195",
  "varrho":"\u03F1",
  "varsigma":"\u03C2",
  "varsubsetneq":"\u228A\uFE00",
  "varsubsetneqq":"\u2ACB\uFE00",
  "varsupsetneq":"\u228B\uFE00",
  "varsupsetneqq":"\u2ACC\uFE00",
  "vartheta":"\u03D1",
  "vartriangleleft":"\u22B2",
  "vartriangleright":"\u22B3",
  "Vbar":"\u2AEB",
  "vBar":"\u2AE8",
  "vBarv":"\u2AE9",
  "Vcy":"\u0412",
  "vcy":"\u0432",
  "VDash":"\u22AB",
  "Vdash":"\u22A9",
  "vDash":"\u22A8",
  "vdash":"\u22A2",
  "Vdashl":"\u2AE6",
  "Vee":"\u22C1",
  "vee":"\u2228",
  "veebar":"\u22BB",
  "veeeq":"\u225A",
  "vellip":"\u22EE",
  "Verbar":"\u2016",
  "verbar":"\u007C",
  "Vert":"\u2016",
  "vert":"\u007C",
  "VerticalBar":"\u2223",
  "VerticalLine":"\u007C",
  "VerticalSeparator":"\u2758",
  "VerticalTilde":"\u2240",
  "VeryThinSpace":"\u200A",
  "Vfr":"\uD835\uDD19",
  "vfr":"\uD835\uDD33",
  "vltri":"\u22B2",
  "vnsub":"\u2282\u20D2",
  "vnsup":"\u2283\u20D2",
  "Vopf":"\uD835\uDD4D",
  "vopf":"\uD835\uDD67",
  "vprop":"\u221D",
  "vrtri":"\u22B3",
  "Vscr":"\uD835\uDCB1",
  "vscr":"\uD835\uDCCB",
  "vsubnE":"\u2ACB\uFE00",
  "vsubne":"\u228A\uFE00",
  "vsupnE":"\u2ACC\uFE00",
  "vsupne":"\u228B\uFE00",
  "Vvdash":"\u22AA",
  "vzigzag":"\u299A",
  "Wcirc":"\u0174",
  "wcirc":"\u0175",
  "wedbar":"\u2A5F",
  "Wedge":"\u22C0",
  "wedge":"\u2227",
  "wedgeq":"\u2259",
  "weierp":"\u2118",
  "Wfr":"\uD835\uDD1A",
  "wfr":"\uD835\uDD34",
  "Wopf":"\uD835\uDD4E",
  "wopf":"\uD835\uDD68",
  "wp":"\u2118",
  "wr":"\u2240",
  "wreath":"\u2240",
  "Wscr":"\uD835\uDCB2",
  "wscr":"\uD835\uDCCC",
  "xcap":"\u22C2",
  "xcirc":"\u25EF",
  "xcup":"\u22C3",
  "xdtri":"\u25BD",
  "Xfr":"\uD835\uDD1B",
  "xfr":"\uD835\uDD35",
  "xhArr":"\u27FA",
  "xharr":"\u27F7",
  "Xi":"\u039E",
  "xi":"\u03BE",
  "xlArr":"\u27F8",
  "xlarr":"\u27F5",
  "xmap":"\u27FC",
  "xnis":"\u22FB",
  "xodot":"\u2A00",
  "Xopf":"\uD835\uDD4F",
  "xopf":"\uD835\uDD69",
  "xoplus":"\u2A01",
  "xotime":"\u2A02",
  "xrArr":"\u27F9",
  "xrarr":"\u27F6",
  "Xscr":"\uD835\uDCB3",
  "xscr":"\uD835\uDCCD",
  "xsqcup":"\u2A06",
  "xuplus":"\u2A04",
  "xutri":"\u25B3",
  "xvee":"\u22C1",
  "xwedge":"\u22C0",
  "Yacute":"\u00DD",
  "yacute":"\u00FD",
  "YAcy":"\u042F",
  "yacy":"\u044F",
  "Ycirc":"\u0176",
  "ycirc":"\u0177",
  "Ycy":"\u042B",
  "ycy":"\u044B",
  "yen":"\u00A5",
  "Yfr":"\uD835\uDD1C",
  "yfr":"\uD835\uDD36",
  "YIcy":"\u0407",
  "yicy":"\u0457",
  "Yopf":"\uD835\uDD50",
  "yopf":"\uD835\uDD6A",
  "Yscr":"\uD835\uDCB4",
  "yscr":"\uD835\uDCCE",
  "YUcy":"\u042E",
  "yucy":"\u044E",
  "Yuml":"\u0178",
  "yuml":"\u00FF",
  "Zacute":"\u0179",
  "zacute":"\u017A",
  "Zcaron":"\u017D",
  "zcaron":"\u017E",
  "Zcy":"\u0417",
  "zcy":"\u0437",
  "Zdot":"\u017B",
  "zdot":"\u017C",
  "zeetrf":"\u2128",
  "ZeroWidthSpace":"\u200B",
  "Zeta":"\u0396",
  "zeta":"\u03B6",
  "Zfr":"\u2128",
  "zfr":"\uD835\uDD37",
  "ZHcy":"\u0416",
  "zhcy":"\u0436",
  "zigrarr":"\u21DD",
  "Zopf":"\u2124",
  "zopf":"\uD835\uDD6B",
  "Zscr":"\uD835\uDCB5",
  "zscr":"\uD835\uDCCF",
  "zwj":"\u200D",
  "zwnj":"\u200C"
};

},{}],33:[function(require,module,exports){
// List of valid html blocks names, accorting to commonmark spec
// http://jgm.github.io/CommonMark/spec.html#html-blocks

'use strict';

var html_blocks = {};

[
  'article',
  'aside',
  'button',
  'blockquote',
  'body',
  'canvas',
  'caption',
  'col',
  'colgroup',
  'dd',
  'div',
  'dl',
  'dt',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'hr',
  'iframe',
  'li',
  'map',
  'object',
  'ol',
  'output',
  'p',
  'pre',
  'progress',
  'script',
  'section',
  'style',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'tr',
  'thead',
  'ul',
  'video'
].forEach(function (name) { html_blocks[name] = true; });


module.exports = html_blocks;

},{}],34:[function(require,module,exports){
// Regexps to match html elements

'use strict';

var attr_name     = '[a-zA-Z_:][a-zA-Z0-9:._-]*';

var unquoted      = '[^"\'=<>`\\x00-\\x20]+';
var single_quoted = "'[^']*'";
var double_quoted = '"[^"]*"';

var attr_value  = '(?:' + unquoted + '|' + single_quoted + '|' + double_quoted + ')';

var attribute   = '(?:\\s+' + attr_name + '(?:\\s*=\\s*' + attr_value + ')?)';

var open_tag    = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>';

var close_tag   = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>';
var comment     = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->';
var processing  = '<[?].*?[?]>';
var declaration = '<![A-Z]+\\s+[^>]*>';
var cdata       = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';

var HTML_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + '|' + comment +
                        '|' + processing + '|' + declaration + '|' + cdata + ')');

module.exports.HTML_TAG_RE = HTML_TAG_RE;

},{}],35:[function(require,module,exports){
// List of valid url schemas, accorting to commonmark spec
// http://jgm.github.io/CommonMark/spec.html#autolinks

'use strict';


module.exports = [
  'coap',
  'doi',
  'javascript',
  'aaa',
  'aaas',
  'about',
  'acap',
  'cap',
  'cid',
  'crid',
  'data',
  'dav',
  'dict',
  'dns',
  'file',
  'ftp',
  'geo',
  'go',
  'gopher',
  'h323',
  'http',
  'https',
  'iax',
  'icap',
  'im',
  'imap',
  'info',
  'ipp',
  'iris',
  'iris.beep',
  'iris.xpc',
  'iris.xpcs',
  'iris.lwz',
  'ldap',
  'mailto',
  'mid',
  'msrp',
  'msrps',
  'mtqp',
  'mupdate',
  'news',
  'nfs',
  'ni',
  'nih',
  'nntp',
  'opaquelocktoken',
  'pop',
  'pres',
  'rtsp',
  'service',
  'session',
  'shttp',
  'sieve',
  'sip',
  'sips',
  'sms',
  'snmp',
  'soap.beep',
  'soap.beeps',
  'tag',
  'tel',
  'telnet',
  'tftp',
  'thismessage',
  'tn3270',
  'tip',
  'tv',
  'urn',
  'vemmi',
  'ws',
  'wss',
  'xcon',
  'xcon-userid',
  'xmlrpc.beep',
  'xmlrpc.beeps',
  'xmpp',
  'z39.50r',
  'z39.50s',
  'adiumxtra',
  'afp',
  'afs',
  'aim',
  'apt',
  'attachment',
  'aw',
  'beshare',
  'bitcoin',
  'bolo',
  'callto',
  'chrome',
  'chrome-extension',
  'com-eventbrite-attendee',
  'content',
  'cvs',
  'dlna-playsingle',
  'dlna-playcontainer',
  'dtn',
  'dvb',
  'ed2k',
  'facetime',
  'feed',
  'finger',
  'fish',
  'gg',
  'git',
  'gizmoproject',
  'gtalk',
  'hcp',
  'icon',
  'ipn',
  'irc',
  'irc6',
  'ircs',
  'itms',
  'jar',
  'jms',
  'keyparc',
  'lastfm',
  'ldaps',
  'magnet',
  'maps',
  'market',
  'message',
  'mms',
  'ms-help',
  'msnim',
  'mumble',
  'mvn',
  'notes',
  'oid',
  'palm',
  'paparazzi',
  'platform',
  'proxy',
  'psyc',
  'query',
  'res',
  'resource',
  'rmi',
  'rsync',
  'rtmp',
  'secondlife',
  'sftp',
  'sgn',
  'skype',
  'smb',
  'soldat',
  'spotify',
  'ssh',
  'steam',
  'svn',
  'teamspeak',
  'things',
  'udp',
  'unreal',
  'ut2004',
  'ventrilo',
  'view-source',
  'webcal',
  'wtai',
  'wyciwyg',
  'xfire',
  'xri',
  'ymsgr'
];

},{}],36:[function(require,module,exports){
// Utilities
//
'use strict';


function _class(obj) { return Object.prototype.toString.call(obj); }

function isString(obj) { return _class(obj) === '[object String]'; }

var _hasOwnProperty = Object.prototype.hasOwnProperty;

function has(object, key) {
  return _hasOwnProperty.call(object, key);
}

// Merge objects
//
function assign(obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);

  sources.forEach(function (source) {
    if (!source) { return; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be object');
    }

    Object.keys(source).forEach(function (key) {
      obj[key] = source[key];
    });
  });

  return obj;
}

// Remove element from array and put another array at those position.
// Useful for some operations with tokens
function arrayReplaceAt(src, pos, newElements) {
  return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
}

////////////////////////////////////////////////////////////////////////////////

var UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g;

function unescapeMd(str) {
  if (str.indexOf('\\') < 0) { return str; }
  return str.replace(UNESCAPE_MD_RE, '$1');
}

////////////////////////////////////////////////////////////////////////////////

function isValidEntityCode(c) {
  /*eslint no-bitwise:0*/
  // broken sequence
  if (c >= 0xD800 && c <= 0xDFFF) { return false; }
  // never used
  if (c >= 0xFDD0 && c <= 0xFDEF) { return false; }
  if ((c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE) { return false; }
  // control codes
  if (c >= 0x00 && c <= 0x08) { return false; }
  if (c === 0x0B) { return false; }
  if (c >= 0x0E && c <= 0x1F) { return false; }
  if (c >= 0x7F && c <= 0x9F) { return false; }
  // out of range
  if (c > 0x10FFFF) { return false; }
  return true;
}

function fromCodePoint(c) {
  /*eslint no-bitwise:0*/
  if (c > 0xffff) {
    c -= 0x10000;
    var surrogate1 = 0xd800 + (c >> 10),
        surrogate2 = 0xdc00 + (c & 0x3ff);

    return String.fromCharCode(surrogate1, surrogate2);
  }
  return String.fromCharCode(c);
}

var NAMED_ENTITY_RE   = /&([a-z#][a-z0-9]{1,31});/gi;
var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i;
var entities = require('./entities');

function replaceEntityPattern(match, name) {
  var code = 0;

  if (has(entities, name)) {
    return entities[name];
  } else if (name.charCodeAt(0) === 0x23/* # */ && DIGITAL_ENTITY_TEST_RE.test(name)) {
    code = name[1].toLowerCase() === 'x' ?
      parseInt(name.slice(2), 16)
    :
      parseInt(name.slice(1), 10);
    if (isValidEntityCode(code)) {
      return fromCodePoint(code);
    }
  }
  return match;
}

function replaceEntities(str) {
  if (str.indexOf('&') < 0) { return str; }

  return str.replace(NAMED_ENTITY_RE, replaceEntityPattern);
}

////////////////////////////////////////////////////////////////////////////////

var HTML_ESCAPE_TEST_RE = /[&<>"]/;
var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
var HTML_REPLACEMENTS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};

function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}

function escapeHtml(str) {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str;
}

////////////////////////////////////////////////////////////////////////////////

var SURRORATE_TEST_RE   = /[\uD800-\uDFFF]/;
var SURRORATE_SEARCH_RE = /[\uD800-\uDFFF]/g;

function replaceBadSurrogate(ch, pos, orig) {
  var code = ch.charCodeAt(0);

  if (code >= 0xD800 && code <= 0xDBFF) {
    // high surrogate
    if (pos >= orig.length - 1) { return '\uFFFD'; }
    code = orig.charCodeAt(pos + 1);
    if (code < 0xDC00 || code > 0xDFFF) { return '\uFFFD'; }

    return ch;
  }

  // low surrogate
  if (pos === 0) { return '\uFFFD'; }
  code = orig.charCodeAt(pos - 1);
  if (code < 0xD800 || code > 0xDBFF) { return '\uFFFD'; }
  return ch;
}

function fixBrokenSurrogates(str) {
  if (!SURRORATE_TEST_RE.test(str)) { return str; }

  return str.replace(SURRORATE_SEARCH_RE, replaceBadSurrogate);
}

////////////////////////////////////////////////////////////////////////////////


// Incoming link can be partially encoded. Convert possible combinations to
// unified form.
//
// TODO: Rewrite it. Should use:
//
// - encodeURIComponent for query
// - encodeURI for path
// - (?) punicode for domain mame (but encodeURI seems to work in real world)
//
function normalizeLink(url) {
  var normalized = replaceEntities(url);

  // We don't care much about result of mailformed URIs,
  // but shoud not throw exception.
  try {
    normalized = decodeURI(normalized);
  } catch (__) {}

  // Encoder throws exception on broken surrogate pairs.
  // Fix those first.

  try {
    return encodeURI(fixBrokenSurrogates(normalized));
  } catch (__) {
    // This should never happen and left for safety only.
    /*istanbul ignore next*/
    return '';
  }
}

////////////////////////////////////////////////////////////////////////////////

var REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;

function escapeRE (str) {
  return str.replace(REGEXP_ESCAPE_RE, '\\$&');
}

////////////////////////////////////////////////////////////////////////////////

// Zs (unicode class) || [\t\f\v\r\n]
function isWhiteSpace(code) {
  if (code >= 0x2000 && code <= 0x200A) { return true; }
  switch (code) {
    case 0x09: // \t
    case 0x0A: // \n
    case 0x0B: // \v
    case 0x0C: // \f
    case 0x0D: // \r
    case 0x20:
    case 0xA0:
    case 0x1680:
    case 0x202F:
    case 0x205F:
    case 0x3000:
      return true;
  }
  return false;
}

////////////////////////////////////////////////////////////////////////////////

/*eslint-disable max-len*/
var UNICODE_PUNCT_RE = require('uc.micro/categories/P/regex');

// Currently without astral characters support.
function isPunctChar(char) {
  return UNICODE_PUNCT_RE.test(char);
}


// Markdown ASCII punctuation characters.
//
// !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~
// http://spec.commonmark.org/0.15/#ascii-punctuation-character
//
// Don't confuse with unicode punctuation !!! It lacks some chars in ascii range.
//
function isMdAsciiPunct(ch) {
  switch (ch) {
    case 0x21/* ! */:
    case 0x22/* " */:
    case 0x23/* # */:
    case 0x24/* $ */:
    case 0x25/* % */:
    case 0x26/* & */:
    case 0x27/* ' */:
    case 0x28/* ( */:
    case 0x29/* ) */:
    case 0x2A/* * */:
    case 0x2B/* + */:
    case 0x2C/* , */:
    case 0x2D/* - */:
    case 0x2E/* . */:
    case 0x2F/* / */:
    case 0x3A/* : */:
    case 0x3B/* ; */:
    case 0x3C/* < */:
    case 0x3D/* = */:
    case 0x3E/* > */:
    case 0x3F/* ? */:
    case 0x40/* @ */:
    case 0x5B/* [ */:
    case 0x5C/* \ */:
    case 0x5D/* ] */:
    case 0x5E/* ^ */:
    case 0x5F/* _ */:
    case 0x60/* ` */:
    case 0x7B/* { */:
    case 0x7C/* | */:
    case 0x7D/* } */:
    case 0x7E/* ~ */:
      return true;
    default:
      return false;
  }
}

// Hepler to unify [reference labels].
//
function normalizeReference(str) {
  // use .toUpperCase() instead of .toLowerCase()
  // here to avoid a conflict with Object.prototype
  // members (most notably, `__proto__`)
  return str.trim().replace(/\s+/g, ' ').toUpperCase();
}

////////////////////////////////////////////////////////////////////////////////

exports.assign              = assign;
exports.isString            = isString;
exports.has                 = has;
exports.unescapeMd          = unescapeMd;
exports.isValidEntityCode   = isValidEntityCode;
exports.fromCodePoint       = fromCodePoint;
exports.replaceEntities     = replaceEntities;
exports.escapeHtml          = escapeHtml;
exports.arrayReplaceAt      = arrayReplaceAt;
exports.normalizeLink       = normalizeLink;
exports.isWhiteSpace        = isWhiteSpace;
exports.isMdAsciiPunct      = isMdAsciiPunct;
exports.isPunctChar         = isPunctChar;
exports.escapeRE            = escapeRE;
exports.normalizeReference  = normalizeReference;

// for testing only
exports.fixBrokenSurrogates = fixBrokenSurrogates;

},{"./entities":32,"uc.micro/categories/P/regex":82}],37:[function(require,module,exports){
// Just a shortcut for bulk export
'use strict';


exports.parseLinkLabel       = require('./parse_link_label');
exports.parseLinkDestination = require('./parse_link_destination');
exports.parseLinkTitle       = require('./parse_link_title');

},{"./parse_link_destination":38,"./parse_link_label":39,"./parse_link_title":40}],38:[function(require,module,exports){
// Parse link destination
//
'use strict';


var normalizeLink = require('../common/utils').normalizeLink;
var unescapeMd    = require('../common/utils').unescapeMd;


module.exports = function parseLinkDestination(str, pos, max) {
  var code, level,
      lines = 0,
      start = pos,
      result = {
        ok: false,
        pos: 0,
        lines: 0,
        str: ''
      };

  if (str.charCodeAt(pos) === 0x3C /* < */) {
    pos++;
    while (pos < max) {
      code = str.charCodeAt(pos);
      if (code === 0x0A /* \n */) { return result; }
      if (code === 0x3E /* > */) {
        result.pos = pos + 1;
        result.str = normalizeLink(unescapeMd(str.slice(start + 1, pos)));
        result.ok = true;
        return result;
      }
      if (code === 0x5C /* \ */ && pos + 1 < max) {
        pos += 2;
        continue;
      }

      pos++;
    }

    // no closing '>'
    return result;
  }

  // this should be ... } else { ... branch

  level = 0;
  while (pos < max) {
    code = str.charCodeAt(pos);

    if (code === 0x20) { break; }

    // ascii control characters
    if (code < 0x20 || code === 0x7F) { break; }

    if (code === 0x5C /* \ */ && pos + 1 < max) {
      pos += 2;
      continue;
    }

    if (code === 0x28 /* ( */) {
      level++;
      if (level > 1) { break; }
    }

    if (code === 0x29 /* ) */) {
      level--;
      if (level < 0) { break; }
    }

    pos++;
  }

  if (start === pos) { return result; }

  result.str = normalizeLink(unescapeMd(str.slice(start, pos)));
  result.lines = lines;
  result.pos = pos;
  result.ok = true;
  return result;
};

},{"../common/utils":36}],39:[function(require,module,exports){
// Parse link label
//
// this function assumes that first character ("[") already matches;
// returns the end of the label
//
'use strict';

module.exports = function parseLinkLabel(state, start, disableNested) {
  var level, found, marker, prevPos,
      labelEnd = -1,
      max = state.posMax,
      oldPos = state.pos;

  state.pos = start + 1;
  level = 1;

  while (state.pos < max) {
    marker = state.src.charCodeAt(state.pos);
    if (marker === 0x5D /* ] */) {
      level--;
      if (level === 0) {
        found = true;
        break;
      }
    }

    prevPos = state.pos;
    state.md.inline.skipToken(state);
    if (marker === 0x5B /* [ */) {
      if (prevPos === state.pos - 1) {
        // increase level if we find text `[`, which is not a part of any token
        level++;
      } else if (disableNested) {
        state.pos = oldPos;
        return -1;
      }
    }
  }

  if (found) {
    labelEnd = state.pos;
  }

  // restore old state
  state.pos = oldPos;

  return labelEnd;
};

},{}],40:[function(require,module,exports){
// Parse link title
//
'use strict';


var unescapeMd = require('../common/utils').unescapeMd;


module.exports = function parseLinkTitle(str, pos, max) {
  var code,
      marker,
      lines = 0,
      start = pos,
      result = {
        ok: false,
        pos: 0,
        lines: 0,
        str: ''
      };

  if (pos >= max) { return result; }

  marker = str.charCodeAt(pos);

  if (marker !== 0x22 /* " */ && marker !== 0x27 /* ' */ && marker !== 0x28 /* ( */) { return result; }

  pos++;

  // if opening marker is "(", switch it to closing marker ")"
  if (marker === 0x28) { marker = 0x29; }

  while (pos < max) {
    code = str.charCodeAt(pos);
    if (code === marker) {
      result.pos = pos + 1;
      result.lines = lines;
      result.str = unescapeMd(str.slice(start + 1, pos));
      result.ok = true;
      return result;
    } else if (code === 0x0A) {
      lines++;
    } else if (code === 0x5C /* \ */ && pos + 1 < max) {
      pos++;
      if (str.charCodeAt(pos) === 0x0A) {
        lines++;
      }
    }

    pos++;
  }

  return result;
};

},{"../common/utils":36}],41:[function(require,module,exports){
// Main perser class

'use strict';


var utils        = require('./common/utils');
var helpers      = require('./helpers');
var Renderer     = require('./renderer');
var ParserCore   = require('./parser_core');
var ParserBlock  = require('./parser_block');
var ParserInline = require('./parser_inline');

var config = {
  'default': require('./presets/default'),
  zero: require('./presets/zero'),
  commonmark: require('./presets/commonmark')
};


/**
 * class MarkdownIt
 *
 * Main parser/renderer class.
 *
 * ##### Usage
 *
 * ```javascript
 * // node.js, "classic" way:
 * var MarkdownIt = require('markdown-it'),
 *     md = new MarkdownIt();
 * var result = md.render('# markdown-it rulezz!');
 *
 * // node.js, the same, but with sugar:
 * var md = require('markdown-it')();
 * var result = md.render('# markdown-it rulezz!');
 *
 * // browser without AMD, added to "window" on script load
 * // Note, there are no dash.
 * var md = window.markdownit();
 * var result = md.render('# markdown-it rulezz!');
 * ```
 *
 * Single line rendering, without paragraph wrap:
 *
 * ```javascript
 * var md = require('markdown-it')();
 * var result = md.renderInline('__markdown-it__ rulezz!');
 * ```
 **/

/**
 * new MarkdownIt([presetName, options])
 * - presetName (String): optional, `commonmark` / `zero`
 * - options (Object)
 *
 * Creates parser instanse with given config. Can be called without `new`.
 *
 * ##### presetName
 *
 * MarkdownIt provides named presets as a convenience to quickly
 * enable/disable active syntax rules and options for common use cases.
 *
 * - ["commonmark"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/commonmark.js) -
 *   configures parser to strict [CommonMark](http://commonmark.org/) mode.
 * - [default](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/default.js) -
 *   similar to GFM, used when no preset name given. Enables all available rules,
 *   but still without html, typographer & autolinker.
 * - ["zero"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/zero.js) -
 *   all rules disabled. Useful to quickly setup your config via `.enable()`.
 *   For example, when you need only `bold` and `italic` markup and nothing else.
 *
 * ##### options:
 *
 * - __html__ - `false`. Set `true` to enable HTML tags in source. Be careful!
 *   That's not safe! You may need external sanitizer to protect output from XSS.
 *   It's better to extend features via plugins, instead of enabling HTML.
 * - __xhtmlOut__ - `false`. Set `true` to add '/' when closing single tags
 *   (`<br />`). This is needed only for full CommonMark compatibility. In real
 *   world you will need HTML output.
 * - __breaks__ - `false`. Set `true` to convert `\n` in paragraphs into `<br>`.
 * - __langPrefix__ - `language-`. CSS language class prefix for fenced blocks.
 *   Can be useful for external highlighters.
 * - __linkify__ - `false`. Set `true` to autoconvert URL-like text to links.
 * - __typographer__  - `false`. Set `true` to enable [some language-neutral
 *   replacement](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js) +
 *   quotes beautification (smartquotes).
 * - __quotes__ - `“”‘’`, string. Double + single quotes replacement pairs, when
 *   typographer enabled and smartquotes on. Set doubles to '«»' for Russian,
 *   '„“' for German.
 * - __highlight__ - `null`. Highlighter function for fenced code blocks.
 *   Highlighter `function (str, lang)` should return escaped HTML. It can also
 *   return empty string if the source was not changed and should be escaped externaly.
 *
 * ##### Example
 *
 * ```javascript
 * // commonmark mode
 * var md = require('markdown-it')('commonmark');
 *
 * // default mode
 * var md = require('markdown-it')();
 *
 * // enable everything
 * var md = require('markdown-it')({
 *   html: true,
 *   linkify: true,
 *   typographer: true
 * });
 * ```
 *
 * ##### Syntax highlighting
 *
 * ```js
 * var hljs = require('highlight.js') // https://highlightjs.org/
 *
 * var md = require('markdown-it')({
 *   highlight: function (str, lang) {
 *     if (lang && hljs.getLanguage(lang)) {
 *       try {
 *         return hljs.highlight(lang, str).value;
 *       } catch (__) {}
 *     }
 *
 *     try {
 *       return hljs.highlightAuto(str).value;
 *     } catch (__) {}
 *
 *     return ''; // use external default escaping
 *   }
 * });
 * ```
 **/
function MarkdownIt(presetName, options) {
  if (!(this instanceof MarkdownIt)) {
    return new MarkdownIt(presetName, options);
  }

  if (!options) {
    if (!utils.isString(presetName)) {
      options = presetName || {};
      presetName = 'default';
    }
  }

  /**
   * MarkdownIt#inline -> ParserInline
   *
   * Instance of [[ParserInline]]. You may need it to add new rules when
   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
   * [[MarkdownIt.enable]].
   **/
  this.inline = new ParserInline();

  /**
   * MarkdownIt#block -> ParserBlock
   *
   * Instance of [[ParserBlock]]. You may need it to add new rules when
   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
   * [[MarkdownIt.enable]].
   **/
  this.block = new ParserBlock();

  /**
   * MarkdownIt#core -> Core
   *
   * Instance of [[Core]] chain executor. You may need it to add new rules when
   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
   * [[MarkdownIt.enable]].
   **/
  this.core = new ParserCore();

  /**
   * MarkdownIt#renderer -> Renderer
   *
   * Instance of [[Renderer]]. Use it to modify output look. Or to add rendering
   * rules for new token types, generated by plugins.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * function myToken(tokens, idx, options, env, self) {
   *   //...
   *   return result;
   * };
   *
   * md.renderer.rules['my_token'] = myToken
   * ```
   *
   * See [[Renderer]] docs and [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js).
   **/
  this.renderer = new Renderer();

  // Expose utils & helpers for easy acces from plugins

  /**
   * MarkdownIt#utils -> utils
   *
   * Assorted utility functions, useful to write plugins. See details
   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.js).
   **/
  this.utils = utils;

  /**
   * MarkdownIt#helpers -> helpers
   *
   * Link components parser functions, useful to write plugins. See details
   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/helpers).
   **/
  this.helpers = helpers;


  this.options = {};
  this.configure(presetName);

  if (options) { this.set(options); }
}


/** chainable
 * MarkdownIt.set(options)
 *
 * Set parser options (in the same format as in constructor). Probably, you
 * will never need it, but you can change options after constructor call.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')()
 *             .set({ html: true, breaks: true })
 *             .set({ typographer, true });
 * ```
 *
 * __Note:__ To achieve the best possible performance, don't modify a
 * `markdown-it` instance options on the fly. If you need multiple configurations
 * it's best to create multiple instances and initialize each with separate
 * config.
 **/
MarkdownIt.prototype.set = function (options) {
  utils.assign(this.options, options);
  return this;
};


/** chainable, internal
 * MarkdownIt.configure(presets)
 *
 * Batch load of all options and compenent settings. This is internal method,
 * and you probably will not need it. But if you with - see available presets
 * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/lib/presets)
 *
 * We strongly recommend to use presets instead of direct config loads. That
 * will give better compatibility with next versions.
 **/
MarkdownIt.prototype.configure = function (presets) {
  var self = this, presetName;

  if (utils.isString(presets)) {
    presetName = presets;
    presets = config[presetName];
    if (!presets) { throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name'); }
  }

  if (!presets) { throw new Error('Wrong `markdown-it` preset, can\'t be empty'); }

  if (presets.options) { self.set(presets.options); }

  if (presets.components) {
    Object.keys(presets.components).forEach(function (name) {
      if (presets.components[name].rules) {
        self[name].ruler.enableOnly(presets.components[name].rules);
      }
    });
  }
  return this;
};


/** chainable
 * MarkdownIt.enable(list, ignoreInvalid)
 * - list (String|Array): rule name or list of rule names to enable
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Enable list or rules. It will automatically find appropriate components,
 * containing rules with given names. If rule not found, and `ignoreInvalid`
 * not set - throws exception.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')()
 *             .enable(['sub', 'sup'])
 *             .disable('smartquotes');
 * ```
 **/
MarkdownIt.prototype.enable = function (list, ignoreInvalid) {
  var result = [];

  if (!Array.isArray(list)) { list = [ list ]; }

  [ 'core', 'block', 'inline' ].forEach(function (chain) {
    result = result.concat(this[chain].ruler.enable(list, true));
  }, this);

  var missed = list.filter(function (name) { return result.indexOf(name) < 0; });

  if (missed.length && !ignoreInvalid) {
    throw new Error('MarkdownIt. Failed to enable unknown rule(s): ' + missed);
  }

  return this;
};


/** chainable
 * MarkdownIt.disable(list, ignoreInvalid)
 * - list (String|Array): rule name or list of rule names to disable.
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * The same as [[MarkdownIt.enable]], but turn specified rules off.
 **/
MarkdownIt.prototype.disable = function (list, ignoreInvalid) {
  var result = [];

  if (!Array.isArray(list)) { list = [ list ]; }

  [ 'core', 'block', 'inline' ].forEach(function (chain) {
    result = result.concat(this[chain].ruler.disable(list, true));
  }, this);

  var missed = list.filter(function (name) { return result.indexOf(name) < 0; });

  if (missed.length && !ignoreInvalid) {
    throw new Error('MarkdownIt. Failed to disable unknown rule(s): ' + missed);
  }
  return this;
};


/** chainable
 * MarkdownIt.use(plugin, params)
 *
 * Load specified plugin with given params into current parser instance.
 * It's just a sugar to call `plugin(md, params)` with curring.
 *
 * ##### Example
 *
 * ```javascript
 * var iterator = require('markdown-it-for-inline');
 * var md = require('markdown-it')()
 *             .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
 *               tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
 *             });
 * ```
 **/
MarkdownIt.prototype.use = function (plugin /*, params, ... */) {
  var args = [ this ].concat(Array.prototype.slice.call(arguments, 1));
  plugin.apply(plugin, args);
  return this;
};


/** internal
 * MarkdownIt.parse(src, env) -> Array
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * Parse input string and returns list of block tokens (special token type
 * "inline" will contain list of inline tokens). You should not call this
 * method directly, until you write custom renderer (for example, to produce
 * AST).
 *
 * `env` is used to pass data between "distributed" rules (`{}` by default).
 * For example, references are parsed in different chains, and need sandbox
 * to store intermediate results. Can be used to inject data in specific cases.
 * You will not need it with high probability.
 **/
MarkdownIt.prototype.parse = function (src, env) {
  var state = new this.core.State(src, this, env);

  this.core.process(state);

  return state.tokens;
};


/**
 * MarkdownIt.render(src [, env]) -> String
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * Render markdown string into html. It does all magic for you :).
 *
 * `env` can be used to inject additional metadata (`{}` by default).
 * But you will not need it with high probability. See also comment
 * in [[MarkdownIt.parse]].
 **/
MarkdownIt.prototype.render = function (src, env) {
  env = env || {};

  return this.renderer.render(this.parse(src, env), this.options, env);
};


/** internal
 * MarkdownIt.parseInline(src, env) -> Array
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * The same as [[MarkdownIt.parse]] but skip all block rules. It returns the
 * block tokens list with th single `inline` element, containing parsed inline
 * tokens in `children` property.
 **/
MarkdownIt.prototype.parseInline = function (src, env) {
  var state = new this.core.State(src, this, env);

  state.inlineMode = true;
  this.core.process(state);

  return state.tokens;
};


/**
 * MarkdownIt.renderInline(src [, env]) -> String
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * Similar to [[MarkdownIt.render]] but for single paragraph content. Result
 * will NOT be wrapped into `<p>` tags.
 **/
MarkdownIt.prototype.renderInline = function (src, env) {
  env = env || {};

  return this.renderer.render(this.parseInline(src, env), this.options, env);
};


module.exports = MarkdownIt;

},{"./common/utils":36,"./helpers":37,"./parser_block":42,"./parser_core":43,"./parser_inline":44,"./presets/commonmark":45,"./presets/default":46,"./presets/zero":47,"./renderer":48}],42:[function(require,module,exports){
/** internal
 * class ParserBlock
 *
 * Block-level tokenizer.
 **/
'use strict';


var Ruler           = require('./ruler');


var _rules = [
  // First 2 params - rule name & source. Secondary array - list of rules,
  // which can be terminated by this one.
  [ 'code',       require('./rules_block/code') ],
  [ 'fence',      require('./rules_block/fence'),      [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
  [ 'blockquote', require('./rules_block/blockquote'), [ 'paragraph', 'reference', 'list' ] ],
  [ 'hr',         require('./rules_block/hr'),         [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
  [ 'list',       require('./rules_block/list'),       [ 'paragraph', 'reference', 'blockquote' ] ],
  [ 'reference',  require('./rules_block/reference') ],
  [ 'heading',    require('./rules_block/heading'),    [ 'paragraph', 'reference', 'blockquote' ] ],
  [ 'lheading',   require('./rules_block/lheading') ],
  [ 'html_block', require('./rules_block/html_block'), [ 'paragraph', 'reference', 'blockquote' ] ],
  [ 'table',      require('./rules_block/table'),      [ 'paragraph', 'reference' ] ],
  [ 'paragraph',  require('./rules_block/paragraph') ]
];


/**
 * new ParserBlock()
 **/
function ParserBlock() {
  /**
   * ParserBlock#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of block rules.
   **/
  this.ruler = new Ruler();

  for (var i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1], { alt: (_rules[i][2] || []).slice() });
  }
}


// Generate tokens for input range
//
ParserBlock.prototype.tokenize = function (state, startLine, endLine) {
  var ok, i,
      rules = this.ruler.getRules(''),
      len = rules.length,
      line = startLine,
      hasEmptyLines = false,
      maxNesting = state.md.options.maxNesting;

  while (line < endLine) {
    state.line = line = state.skipEmptyLines(line);
    if (line >= endLine) { break; }

    // Termination condition for nested calls.
    // Nested calls currently used for blockquotes & lists
    if (state.tShift[line] < state.blkIndent) { break; }

    // If nesting level exceeded - skip tail to the end. That's not ordinary
    // situation and we should not care about content.
    if (state.level >= maxNesting) {
      state.line = endLine;
      break;
    }

    // Try all possible rules.
    // On success, rule should:
    //
    // - update `state.line`
    // - update `state.tokens`
    // - return true

    for (i = 0; i < len; i++) {
      ok = rules[i](state, line, endLine, false);
      if (ok) { break; }
    }

    // set state.tight iff we had an empty line before current tag
    // i.e. latest empty line should not count
    state.tight = !hasEmptyLines;

    // paragraph might "eat" one newline after it in nested lists
    if (state.isEmpty(state.line - 1)) {
      hasEmptyLines = true;
    }

    line = state.line;

    if (line < endLine && state.isEmpty(line)) {
      hasEmptyLines = true;
      line++;

      // two empty lines should stop the parser in list mode
      if (line < endLine && state.parentType === 'list' && state.isEmpty(line)) { break; }
      state.line = line;
    }
  }
};


/**
 * ParserBlock.parse(str, md, env, outTokens)
 *
 * Process input string and push block tokens into `outTokens`
 **/
ParserBlock.prototype.parse = function (src, md, env, outTokens) {
  var state;

  if (!src) { return []; }

  state = new this.State(src, md, env, outTokens);

  this.tokenize(state, state.line, state.lineMax);
};


ParserBlock.prototype.State = require('./rules_block/state_block');


module.exports = ParserBlock;

},{"./ruler":49,"./rules_block/blockquote":50,"./rules_block/code":51,"./rules_block/fence":52,"./rules_block/heading":53,"./rules_block/hr":54,"./rules_block/html_block":55,"./rules_block/lheading":56,"./rules_block/list":57,"./rules_block/paragraph":58,"./rules_block/reference":59,"./rules_block/state_block":60,"./rules_block/table":61}],43:[function(require,module,exports){
/** internal
 * class Core
 *
 * Top-level rules executor. Glues block/inline parsers and does intermediate
 * transformations.
 **/
'use strict';


var Ruler  = require('./ruler');


var _rules = [
  [ 'normalize',      require('./rules_core/normalize')      ],
  [ 'block',          require('./rules_core/block')          ],
  [ 'inline',         require('./rules_core/inline')         ],
  [ 'replacements',   require('./rules_core/replacements')   ],
  [ 'smartquotes',    require('./rules_core/smartquotes')    ],
  [ 'linkify',        require('./rules_core/linkify')        ]
];


/**
 * new Core()
 **/
function Core() {
  /**
   * Core#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of core rules.
   **/
  this.ruler = new Ruler();

  for (var i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1]);
  }
}


/**
 * Core.process(state)
 *
 * Executes core chain rules.
 **/
Core.prototype.process = function (state) {
  var i, l, rules;

  rules = this.ruler.getRules('');

  for (i = 0, l = rules.length; i < l; i++) {
    rules[i](state);
  }
};

Core.prototype.State = require('./rules_core/state_core');


module.exports = Core;

},{"./ruler":49,"./rules_core/block":62,"./rules_core/inline":63,"./rules_core/linkify":64,"./rules_core/normalize":65,"./rules_core/replacements":66,"./rules_core/smartquotes":67,"./rules_core/state_core":68}],44:[function(require,module,exports){
/** internal
 * class ParserInline
 *
 * Tokenizes paragraph content.
 **/
'use strict';


var Ruler           = require('./ruler');
var replaceEntities = require('./common/utils').replaceEntities;

////////////////////////////////////////////////////////////////////////////////
// Parser rules

var _rules = [
  [ 'text',            require('./rules_inline/text') ],
  [ 'newline',         require('./rules_inline/newline') ],
  [ 'escape',          require('./rules_inline/escape') ],
  [ 'backticks',       require('./rules_inline/backticks') ],
  [ 'strikethrough',   require('./rules_inline/strikethrough') ],
  [ 'emphasis',        require('./rules_inline/emphasis') ],
  [ 'link',            require('./rules_inline/link') ],
  [ 'image',           require('./rules_inline/image') ],
  [ 'autolink',        require('./rules_inline/autolink') ],
  [ 'html_inline',     require('./rules_inline/html_inline') ],
  [ 'entity',          require('./rules_inline/entity') ]
];


var BAD_PROTOCOLS = [ 'vbscript', 'javascript', 'file' ];

function validateLink(url) {
  // Care about digital entities "javascript&#x3A;alert(1)"
  var str = replaceEntities(url);

  str = str.trim().toLowerCase();

  if (str.indexOf(':') >= 0 && BAD_PROTOCOLS.indexOf(str.split(':')[0]) >= 0) {
    return false;
  }
  return true;
}


/**
 * new ParserInline()
 **/
function ParserInline() {
  /**
   * ParserInline#validateLink(url) -> Boolean
   *
   * Link validation function. CommonMark allows too much in links. By default
   * we disable `javascript:` and `vbscript:` schemas. You can change this
   * behaviour.
   *
   * ```javascript
   * var md = require('markdown-it')();
   * // enable everything
   * md.inline.validateLink = function () { return true; }
   * ```
   **/
  this.validateLink = validateLink;

  /**
   * ParserInline#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of inline rules.
   **/
  this.ruler = new Ruler();

  for (var i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1]);
  }
}


// Skip single token by running all rules in validation mode;
// returns `true` if any rule reported success
//
ParserInline.prototype.skipToken = function (state) {
  var i, cached_pos, pos = state.pos,
      rules = this.ruler.getRules(''),
      len = rules.length,
      maxNesting = state.md.options.maxNesting;


  if ((cached_pos = state.cacheGet(pos)) > 0) {
    state.pos = cached_pos;
    return;
  }

  /*istanbul ignore else*/
  if (state.level < maxNesting) {
    for (i = 0; i < len; i++) {
      if (rules[i](state, true)) {
        state.cacheSet(pos, state.pos);
        return;
      }
    }
  }

  state.pos++;
  state.cacheSet(pos, state.pos);
};


// Generate tokens for input range
//
ParserInline.prototype.tokenize = function (state) {
  var ok, i,
      rules = this.ruler.getRules(''),
      len = rules.length,
      end = state.posMax,
      maxNesting = state.md.options.maxNesting;

  while (state.pos < end) {
    // Try all possible rules.
    // On success, rule should:
    //
    // - update `state.pos`
    // - update `state.tokens`
    // - return true

    if (state.level < maxNesting) {
      for (i = 0; i < len; i++) {
        ok = rules[i](state, false);
        if (ok) { break; }
      }
    }

    if (ok) {
      if (state.pos >= end) { break; }
      continue;
    }

    state.pending += state.src[state.pos++];
  }

  if (state.pending) {
    state.pushPending();
  }
};


/**
 * ParserInline.parse(str, md, env, outTokens)
 *
 * Process input string and push inline tokens into `outTokens`
 **/
ParserInline.prototype.parse = function (str, md, env, outTokens) {
  var state = new this.State(str, md, env, outTokens);

  this.tokenize(state);
};


ParserInline.prototype.State = require('./rules_inline/state_inline');


module.exports = ParserInline;

},{"./common/utils":36,"./ruler":49,"./rules_inline/autolink":69,"./rules_inline/backticks":70,"./rules_inline/emphasis":71,"./rules_inline/entity":72,"./rules_inline/escape":73,"./rules_inline/html_inline":74,"./rules_inline/image":75,"./rules_inline/link":76,"./rules_inline/newline":77,"./rules_inline/state_inline":78,"./rules_inline/strikethrough":79,"./rules_inline/text":80}],45:[function(require,module,exports){
// Commonmark default options

'use strict';


module.exports = {
  options: {
    html:         true,         // Enable HTML tags in source
    xhtmlOut:     true,         // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      false,        // autoconvert URL-like texts to links

    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: '\u201c\u201d\u2018\u2019' /* “”‘’ */,

    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,

    maxNesting:   20            // Internal protection, recursion limit
  },

  components: {

    core: {
      rules: [
        'normalize',
        'block',
        'inline'
      ]
    },

    block: {
      rules: [
        'blockquote',
        'code',
        'fence',
        'heading',
        'hr',
        'html_block',
        'lheading',
        'list',
        'reference',
        'paragraph'
      ]
    },

    inline: {
      rules: [
        'autolink',
        'backticks',
        'emphasis',
        'entity',
        'escape',
        'html_inline',
        'image',
        'link',
        'newline',
        'text'
      ]
    }
  }
};

},{}],46:[function(require,module,exports){
// markdown-it default options

'use strict';


module.exports = {
  options: {
    html:         false,        // Enable HTML tags in source
    xhtmlOut:     false,        // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      false,        // autoconvert URL-like texts to links

    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: '\u201c\u201d\u2018\u2019' /* “”‘’ */,

    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,

    maxNesting:   20            // Internal protection, recursion limit
  },

  components: {

    core: {},
    block: {},
    inline: {}
  }
};

},{}],47:[function(require,module,exports){
// "Zero" preset, with nothing enabled. Useful for manual configuring of simple
// modes. For example, to parse bold/italic only.

'use strict';


module.exports = {
  options: {
    html:         false,        // Enable HTML tags in source
    xhtmlOut:     false,        // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      false,        // autoconvert URL-like texts to links

    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: '\u201c\u201d\u2018\u2019' /* “”‘’ */,

    // Highlighter function. Should return escaped HTML,
    // or '' if input not changed
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,

    maxNesting:   20            // Internal protection, recursion limit
  },

  components: {

    core: {
      rules: [
        'normalize',
        'block',
        'inline'
      ]
    },

    block: {
      rules: [
        'paragraph'
      ]
    },

    inline: {
      rules: [
        'text'
      ]
    }
  }
};

},{}],48:[function(require,module,exports){
/**
 * class Renderer
 *
 * Generates HTML from parsed token stream. Each instance has independent
 * copy of rules. Those can be rewritten with ease. Also, you can add new
 * rules if you create plugin and adds new token types.
 **/
'use strict';


var assign          = require('./common/utils').assign;
var unescapeMd      = require('./common/utils').unescapeMd;
var replaceEntities = require('./common/utils').replaceEntities;
var escapeHtml      = require('./common/utils').escapeHtml;


////////////////////////////////////////////////////////////////////////////////

var rules = {};


rules.blockquote_open  = function () { return '<blockquote>\n'; };
rules.blockquote_close = function () { return '</blockquote>\n'; };


rules.code_block = function (tokens, idx /*, options, env */) {
  return '<pre><code>' + escapeHtml(tokens[idx].content) + '</code></pre>\n';
};
rules.code_inline = function (tokens, idx /*, options, env */) {
  return '<code>' + escapeHtml(tokens[idx].content) + '</code>';
};


rules.fence = function (tokens, idx, options /*, env, self*/) {
  var token = tokens[idx];
  var langClass = '';
  var langPrefix = options.langPrefix;
  var langName = '';
  var highlighted;

  if (token.params) {
    langName = escapeHtml(replaceEntities(unescapeMd(token.params.split(/\s+/g)[0])));
    langClass = ' class="' + langPrefix + langName + '"';
  }

  if (options.highlight) {
    highlighted = options.highlight(token.content, langName) || escapeHtml(token.content);
  } else {
    highlighted = escapeHtml(token.content);
  }


  return  '<pre><code' + langClass + '>'
        + highlighted
        + '</code></pre>\n';
};


rules.heading_open = function (tokens, idx /*, options, env */) {
  return '<h' + tokens[idx].hLevel + '>';
};
rules.heading_close = function (tokens, idx /*, options, env */) {
  return '</h' + tokens[idx].hLevel + '>\n';
};


rules.hr = function (tokens, idx, options /*, env */) {
  return (options.xhtmlOut ? '<hr />\n' : '<hr>\n');
};


rules.bullet_list_open   = function () { return '<ul>\n'; };
rules.bullet_list_close  = function () { return '</ul>\n'; };
rules.list_item_open     = function (tokens, idx /*, options, env */) {
  var next = tokens[idx + 1];
  if ((next.type === 'list_item_close') ||
      (next.type === 'paragraph_open' && next.tight)) {
    return '<li>';
  }
  return '<li>\n';
};
rules.list_item_close    = function () { return '</li>\n'; };
rules.ordered_list_open  = function (tokens, idx /*, options, env */) {
  if (tokens[idx].order > 1) {
    return '<ol start="' + tokens[idx].order + '">\n';
  }
  return '<ol>\n';
};
rules.ordered_list_close = function () { return '</ol>\n'; };


rules.paragraph_open = function (tokens, idx /*, options, env */) {
  return tokens[idx].tight ? '' : '<p>';
};
rules.paragraph_close = function (tokens, idx /*, options, env */) {
  if (tokens[idx].tight === true) {
    return tokens[idx + 1].type.slice(-5) === 'close' ? '' : '\n';
  }
  return '</p>\n';
};


rules.link_open = function (tokens, idx /*, options, env */) {
  var title = tokens[idx].title ? (' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"') : '';
  var target = tokens[idx].target ? (' target="' + escapeHtml(tokens[idx].target) + '"') : '';
  return '<a href="' + escapeHtml(tokens[idx].href) + '"' + title + target + '>';
};
rules.link_close = function (/* tokens, idx, options, env */) {
  return '</a>';
};


rules.image = function (tokens, idx, options, env, self) {
  var src = ' src="' + escapeHtml(tokens[idx].src) + '"';
  var title = tokens[idx].title ? (' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"') : '';
  var alt = ' alt="' + self.renderInlineAsText(tokens[idx].tokens, options, env) + '"';
  var suffix = options.xhtmlOut ? ' /' : '';
  return '<img' + src + alt + title + suffix + '>';
};


rules.table_open  = function () { return '<table>\n'; };
rules.table_close = function () { return '</table>\n'; };
rules.thead_open  = function () { return '<thead>\n'; };
rules.thead_close = function () { return '</thead>\n'; };
rules.tbody_open  = function () { return '<tbody>\n'; };
rules.tbody_close = function () { return '</tbody>\n'; };
rules.tr_open     = function () { return '<tr>'; };
rules.tr_close    = function () { return '</tr>\n'; };
rules.th_open     = function (tokens, idx /*, options, env */) {
  if (tokens[idx].align) {
    return '<th style="text-align:' + tokens[idx].align + '">';
  }
  return '<th>';
};
rules.th_close    = function () { return '</th>'; };
rules.td_open     = function (tokens, idx /*, options, env */) {
  if (tokens[idx].align) {
    return '<td style="text-align:' + tokens[idx].align + '">';
  }
  return '<td>';
};
rules.td_close    = function () { return '</td>'; };


rules.strong_open  = function () { return '<strong>'; };
rules.strong_close = function () { return '</strong>'; };


rules.em_open  = function () { return '<em>'; };
rules.em_close = function () { return '</em>'; };


rules.s_open  = function () { return '<s>'; };
rules.s_close = function () { return '</s>'; };


rules.hardbreak = function (tokens, idx, options /*, env */) {
  return options.xhtmlOut ? '<br />\n' : '<br>\n';
};
rules.softbreak = function (tokens, idx, options /*, env */) {
  return options.breaks ? (options.xhtmlOut ? '<br />\n' : '<br>\n') : '\n';
};


rules.text = function (tokens, idx /*, options, env */) {
  return escapeHtml(tokens[idx].content);
};


rules.html_block = function (tokens, idx /*, options, env */) {
  return tokens[idx].content;
};
rules.html_inline = function (tokens, idx /*, options, env */) {
  return tokens[idx].content;
};


/**
 * new Renderer()
 *
 * Creates new [[Renderer]] instance and fill [[Renderer#rules]] with defaults.
 **/
function Renderer() {

  /**
   * Renderer#rules -> Object
   *
   * Contains render rules for tokens. Can be updated and extended.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.renderer.rules.strong_open  = function () { return '<b>'; };
   * md.renderer.rules.strong_close = function () { return '</b>'; };
   *
   * var result = md.renderInline(...);
   * ```
   *
   * Each rule is called as independed static function with fixed signature:
   *
   * ```javascript
   * function my_token_render(tokens, idx, options, env, renderer) {
   *   // ...
   *   return renderedHTML;
   * }
   * ```
   *
   * See [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js)
   * for more details and examples.
   **/
  this.rules = assign({}, rules);
}


/**
 * Renderer.renderInline(tokens, options, env) -> String
 * - tokens (Array): list on block tokens to renter
 * - options (Object): params of parser instance
 * - env (Object): additional data from parsed input (references, for example)
 *
 * The same as [[Renderer.render]], but for single token of `inline` type.
 **/
Renderer.prototype.renderInline = function (tokens, options, env) {
  var result = '',
      _rules = this.rules;

  for (var i = 0, len = tokens.length; i < len; i++) {
    result += _rules[tokens[i].type](tokens, i, options, env, this);
  }

  return result;
};


/** internal
 * Renderer.renderInlineAsText(tokens, options, env) -> String
 * - tokens (Array): list on block tokens to renter
 * - options (Object): params of parser instance
 * - env (Object): additional data from parsed input (references, for example)
 *
 * Special kludge for image `alt` attributes to conform CommonMark spec.
 * Don't try to use it! Spec requires to show `alt` content with stripped markup,
 * instead of simple escaping.
 **/
Renderer.prototype.renderInlineAsText = function (tokens, options, env) {
  var result = '',
      _rules = this.rules;

  for (var i = 0, len = tokens.length; i < len; i++) {
    if (tokens[i].type === 'text') {
      result += _rules.text(tokens, i, options, env, this);
    } else if (tokens[i].type === 'image') {
      result += this.renderInlineAsText(tokens[i].tokens, options, env);
    }
  }

  return result;
};


/**
 * Renderer.render(tokens, options, env) -> String
 * - tokens (Array): list on block tokens to renter
 * - options (Object): params of parser instance
 * - env (Object): additional data from parsed input (references, for example)
 *
 * Takes token stream and generates HTML. Probably, you will never need to call
 * this method directly.
 **/
Renderer.prototype.render = function (tokens, options, env) {
  var i, len,
      result = '',
      _rules = this.rules;

  for (i = 0, len = tokens.length; i < len; i++) {
    if (tokens[i].type === 'inline') {
      result += this.renderInline(tokens[i].children, options, env);
    } else {
      result += _rules[tokens[i].type](tokens, i, options, env, this);
    }
  }

  return result;
};

module.exports = Renderer;

},{"./common/utils":36}],49:[function(require,module,exports){
/**
 * class Ruler
 *
 * Helper class, used by [[MarkdownIt#core]], [[MarkdownIt#block]] and
 * [[MarkdownIt#inline]] to manage sequences of functions (rules):
 *
 * - keep rules in defined order
 * - assign the name to each rule
 * - enable/disable rules
 * - add/replace rules
 * - allow assign rules to additional named chains (in the same)
 * - cacheing lists of active rules
 *
 * You will not need use this class directly until write plugins. For simple
 * rules control use [[MarkdownIt.disable]], [[MarkdownIt.enable]] and
 * [[MarkdownIt.use]].
 **/
'use strict';


/**
 * new Ruler()
 **/
function Ruler() {
  // List of added rules. Each element is:
  //
  // {
  //   name: XXX,
  //   enabled: Boolean,
  //   fn: Function(),
  //   alt: [ name2, name3 ]
  // }
  //
  this.__rules__ = [];

  // Cached rule chains.
  //
  // First level - chain name, '' for default.
  // Second level - diginal anchor for fast filtering by charcodes.
  //
  this.__cache__ = null;
}

////////////////////////////////////////////////////////////////////////////////
// Helper methods, should not be used directly


// Find rule index by name
//
Ruler.prototype.__find__ = function (name) {
  for (var i = 0; i < this.__rules__.length; i++) {
    if (this.__rules__[i].name === name) {
      return i;
    }
  }
  return -1;
};


// Build rules lookup cache
//
Ruler.prototype.__compile__ = function () {
  var self = this;
  var chains = [ '' ];

  // collect unique names
  self.__rules__.forEach(function (rule) {
    if (!rule.enabled) { return; }

    rule.alt.forEach(function (altName) {
      if (chains.indexOf(altName) < 0) {
        chains.push(altName);
      }
    });
  });

  self.__cache__ = {};

  chains.forEach(function (chain) {
    self.__cache__[chain] = [];
    self.__rules__.forEach(function (rule) {
      if (!rule.enabled) { return; }

      if (chain && rule.alt.indexOf(chain) < 0) { return; }

      self.__cache__[chain].push(rule.fn);
    });
  });
};


/**
 * Ruler.at(name, fn [, options])
 * - name (String): rule name to replace.
 * - fn (Function): new rule function.
 * - options (Object): new rule options (not mandatory).
 *
 * Replace rule by name with new function & options. Throws error if name not
 * found.
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * Replace existing typorgapher replacement rule with new one:
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.core.ruler.at('replacements', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.at = function (name, fn, options) {
  var index = this.__find__(name);
  var opt = options || {};

  if (index === -1) { throw new Error('Parser rule not found: ' + name); }

  this.__rules__[index].fn = fn;
  this.__rules__[index].alt = opt.alt || [];
  this.__cache__ = null;
};


/**
 * Ruler.before(beforeName, ruleName, fn [, options])
 * - beforeName (String): new rule will be added before this one.
 * - ruleName (String): name of added rule.
 * - fn (Function): rule function.
 * - options (Object): rule options (not mandatory).
 *
 * Add new rule to chain before one with given name. See also
 * [[Ruler.after]], [[Ruler.push]].
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.before = function (beforeName, ruleName, fn, options) {
  var index = this.__find__(beforeName);
  var opt = options || {};

  if (index === -1) { throw new Error('Parser rule not found: ' + beforeName); }

  this.__rules__.splice(index, 0, {
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};


/**
 * Ruler.after(afterName, ruleName, fn [, options])
 * - afterName (String): new rule will be added after this one.
 * - ruleName (String): name of added rule.
 * - fn (Function): rule function.
 * - options (Object): rule options (not mandatory).
 *
 * Add new rule to chain after one with given name. See also
 * [[Ruler.before]], [[Ruler.push]].
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.inline.ruler.after('text', 'my_rule', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.after = function (afterName, ruleName, fn, options) {
  var index = this.__find__(afterName);
  var opt = options || {};

  if (index === -1) { throw new Error('Parser rule not found: ' + afterName); }

  this.__rules__.splice(index + 1, 0, {
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};

/**
 * Ruler.push(ruleName, fn [, options])
 * - ruleName (String): name of added rule.
 * - fn (Function): rule function.
 * - options (Object): rule options (not mandatory).
 *
 * Push new rule to the end of chain. See also
 * [[Ruler.before]], [[Ruler.after]].
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.core.ruler.push('emphasis', 'my_rule', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.push = function (ruleName, fn, options) {
  var opt = options || {};

  this.__rules__.push({
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};


/**
 * Ruler.enable(list [, ignoreInvalid]) -> Array
 * - list (String|Array): list of rule names to enable.
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Enable rules with given names. If any rule name not found - throw Error.
 * Errors can be disabled by second param.
 *
 * Returns list of found rule names (if no exception happened).
 *
 * See also [[Ruler.disable]], [[Ruler.enableOnly]].
 **/
Ruler.prototype.enable = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) { list = [ list ]; }

  var result = [];

  // Search by name and enable
  list.forEach(function (name) {
    var idx = this.__find__(name);

    if (idx < 0) {
      if (ignoreInvalid) { return; }
      throw new Error('Rules manager: invalid rule name ' + name);
    }
    this.__rules__[idx].enabled = true;
    result.push(name);
  }, this);

  this.__cache__ = null;
  return result;
};


/**
 * Ruler.enableOnly(list [, ignoreInvalid])
 * - list (String|Array): list of rule names to enable (whitelist).
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Enable rules with given names, and disable everything else. If any rule name
 * not found - throw Error. Errors can be disabled by second param.
 *
 * See also [[Ruler.disable]], [[Ruler.enable]].
 **/
Ruler.prototype.enableOnly = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) { list = [ list ]; }

  this.__rules__.forEach(function (rule) { rule.enabled = false; });

  this.enable(list, ignoreInvalid);
};


/**
 * Ruler.disable(list [, ignoreInvalid]) -> Array
 * - list (String|Array): list of rule names to disable.
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Disable rules with given names. If any rule name not found - throw Error.
 * Errors can be disabled by second param.
 *
 * Returns list of found rule names (if no exception happened).
 *
 * See also [[Ruler.enable]], [[Ruler.enableOnly]].
 **/
Ruler.prototype.disable = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) { list = [ list ]; }

  var result = [];

  // Search by name and disable
  list.forEach(function (name) {
    var idx = this.__find__(name);

    if (idx < 0) {
      if (ignoreInvalid) { return; }
      throw new Error('Rules manager: invalid rule name ' + name);
    }
    this.__rules__[idx].enabled = false;
    result.push(name);
  }, this);

  this.__cache__ = null;
  return result;
};


/**
 * Ruler.getRules(chainName) -> Array
 *
 * Return array of active functions (rules) for given chain name. It analyzes
 * rules configuration, compiles caches if not exists and returns result.
 *
 * Default chain name is `''` (empty string). It can't be skipped. That's
 * done intentionally, to keep signature monomorphic for high speed.
 **/
Ruler.prototype.getRules = function (chainName) {
  if (this.__cache__ === null) {
    this.__compile__();
  }

  // Chain can be empty, if rules disabled. But we still have to return Array.
  return this.__cache__[chainName] || [];
};

module.exports = Ruler;

},{}],50:[function(require,module,exports){
// Block quotes

'use strict';


module.exports = function blockquote(state, startLine, endLine, silent) {
  var nextLine, lastLineEmpty, oldTShift, oldBMarks, oldIndent, oldParentType, lines,
      terminatorRules,
      i, l, terminate,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  // check the block quote marker
  if (state.src.charCodeAt(pos++) !== 0x3E/* > */) { return false; }

  // we know that it's going to be a valid blockquote,
  // so no point trying to find the end of it in silent mode
  if (silent) { return true; }

  // skip one optional space after '>'
  if (state.src.charCodeAt(pos) === 0x20) { pos++; }

  oldIndent = state.blkIndent;
  state.blkIndent = 0;

  oldBMarks = [ state.bMarks[startLine] ];
  state.bMarks[startLine] = pos;

  // check if we have an empty blockquote
  pos = pos < max ? state.skipSpaces(pos) : pos;
  lastLineEmpty = pos >= max;

  oldTShift = [ state.tShift[startLine] ];
  state.tShift[startLine] = pos - state.bMarks[startLine];

  terminatorRules = state.md.block.ruler.getRules('blockquote');

  // Search the end of the block
  //
  // Block ends with either:
  //  1. an empty line outside:
  //     ```
  //     > test
  //
  //     ```
  //  2. an empty line inside:
  //     ```
  //     >
  //     test
  //     ```
  //  3. another tag
  //     ```
  //     > test
  //      - - -
  //     ```
  for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (pos >= max) {
      // Case 1: line is not inside the blockquote, and this line is empty.
      break;
    }

    if (state.src.charCodeAt(pos++) === 0x3E/* > */) {
      // This line is inside the blockquote.

      // skip one optional space after '>'
      if (state.src.charCodeAt(pos) === 0x20) { pos++; }

      oldBMarks.push(state.bMarks[nextLine]);
      state.bMarks[nextLine] = pos;

      pos = pos < max ? state.skipSpaces(pos) : pos;
      lastLineEmpty = pos >= max;

      oldTShift.push(state.tShift[nextLine]);
      state.tShift[nextLine] = pos - state.bMarks[nextLine];
      continue;
    }

    // Case 2: line is not inside the blockquote, and the last line was empty.
    if (lastLineEmpty) { break; }

    // Case 3: another tag found.
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }

    oldBMarks.push(state.bMarks[nextLine]);
    oldTShift.push(state.tShift[nextLine]);

    // A negative number means that this is a paragraph continuation;
    //
    // Any negative number will do the job here, but it's better for it
    // to be large enough to make any bugs obvious.
    state.tShift[nextLine] = -1337;
  }

  oldParentType = state.parentType;
  state.parentType = 'blockquote';
  state.tokens.push({
    type: 'blockquote_open',
    lines: lines = [ startLine, 0 ],
    level: state.level++
  });
  state.md.block.tokenize(state, startLine, nextLine);
  state.tokens.push({
    type: 'blockquote_close',
    level: --state.level
  });
  state.parentType = oldParentType;
  lines[1] = state.line;

  // Restore original tShift; this might not be necessary since the parser
  // has already been here, but just to make sure we can do that.
  for (i = 0; i < oldTShift.length; i++) {
    state.bMarks[i + startLine] = oldBMarks[i];
    state.tShift[i + startLine] = oldTShift[i];
  }
  state.blkIndent = oldIndent;

  return true;
};

},{}],51:[function(require,module,exports){
// Code block (4 spaces padded)

'use strict';


module.exports = function code(state, startLine, endLine/*, silent*/) {
  var nextLine, last;

  if (state.tShift[startLine] - state.blkIndent < 4) { return false; }

  last = nextLine = startLine + 1;

  while (nextLine < endLine) {
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }
    if (state.tShift[nextLine] - state.blkIndent >= 4) {
      nextLine++;
      last = nextLine;
      continue;
    }
    break;
  }

  state.line = nextLine;
  state.tokens.push({
    type: 'code_block',
    content: state.getLines(startLine, last, 4 + state.blkIndent, true),
    lines: [ startLine, state.line ],
    level: state.level
  });

  return true;
};

},{}],52:[function(require,module,exports){
// fences (``` lang, ~~~ lang)

'use strict';


module.exports = function fence(state, startLine, endLine, silent) {
  var marker, len, params, nextLine, mem,
      haveEndMarker = false,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  if (pos + 3 > max) { return false; }

  marker = state.src.charCodeAt(pos);

  if (marker !== 0x7E/* ~ */ && marker !== 0x60 /* ` */) {
    return false;
  }

  // scan marker length
  mem = pos;
  pos = state.skipChars(pos, marker);

  len = pos - mem;

  if (len < 3) { return false; }

  params = state.src.slice(pos, max).trim();

  if (params.indexOf('`') >= 0) { return false; }

  // Since start is found, we can report success here in validation mode
  if (silent) { return true; }

  // search end of block
  nextLine = startLine;

  for (;;) {
    nextLine++;
    if (nextLine >= endLine) {
      // unclosed block should be autoclosed by end of document.
      // also block seems to be autoclosed by end of parent
      break;
    }

    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (pos < max && state.tShift[nextLine] < state.blkIndent) {
      // non-empty line with negative indent should stop the list:
      // - ```
      //  test
      break;
    }

    if (state.src.charCodeAt(pos) !== marker) { continue; }

    if (state.tShift[nextLine] - state.blkIndent >= 4) {
      // closing fence should be indented less than 4 spaces
      continue;
    }

    pos = state.skipChars(pos, marker);

    // closing code fence must be at least as long as the opening one
    if (pos - mem < len) { continue; }

    // make sure tail has spaces only
    pos = state.skipSpaces(pos);

    if (pos < max) { continue; }

    haveEndMarker = true;
    // found!
    break;
  }

  // If a fence has heading spaces, they should be removed from its inner block
  len = state.tShift[startLine];

  state.line = nextLine + (haveEndMarker ? 1 : 0);
  state.tokens.push({
    type: 'fence',
    params: params,
    content: state.getLines(startLine + 1, nextLine, len, true),
    lines: [ startLine, state.line ],
    level: state.level
  });

  return true;
};

},{}],53:[function(require,module,exports){
// heading (#, ##, ...)

'use strict';


module.exports = function heading(state, startLine, endLine, silent) {
  var ch, level, tmp,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  ch  = state.src.charCodeAt(pos);

  if (ch !== 0x23/* # */ || pos >= max) { return false; }

  // count heading level
  level = 1;
  ch = state.src.charCodeAt(++pos);
  while (ch === 0x23/* # */ && pos < max && level <= 6) {
    level++;
    ch = state.src.charCodeAt(++pos);
  }

  if (level > 6 || (pos < max && ch !== 0x20/* space */)) { return false; }

  if (silent) { return true; }

  // Let's cut tails like '    ###  ' from the end of string

  max = state.skipCharsBack(max, 0x20, pos); // space
  tmp = state.skipCharsBack(max, 0x23, pos); // #
  if (tmp > pos && state.src.charCodeAt(tmp - 1) === 0x20/* space */) {
    max = tmp;
  }

  state.line = startLine + 1;

  state.tokens.push({ type: 'heading_open',
    hLevel: level,
    lines: [ startLine, state.line ],
    level: state.level
  });

  // only if header is not empty
  if (pos < max) {
    state.tokens.push({
      type: 'inline',
      content: state.src.slice(pos, max).trim(),
      level: state.level + 1,
      lines: [ startLine, state.line ],
      children: []
    });
  }
  state.tokens.push({ type: 'heading_close', hLevel: level, level: state.level });

  return true;
};

},{}],54:[function(require,module,exports){
// Horizontal rule

'use strict';


module.exports = function hr(state, startLine, endLine, silent) {
  var marker, cnt, ch,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  marker = state.src.charCodeAt(pos++);

  // Check hr marker
  if (marker !== 0x2A/* * */ &&
      marker !== 0x2D/* - */ &&
      marker !== 0x5F/* _ */) {
    return false;
  }

  // markers can be mixed with spaces, but there should be at least 3 one

  cnt = 1;
  while (pos < max) {
    ch = state.src.charCodeAt(pos++);
    if (ch !== marker && ch !== 0x20/* space */) { return false; }
    if (ch === marker) { cnt++; }
  }

  if (cnt < 3) { return false; }

  if (silent) { return true; }

  state.line = startLine + 1;
  state.tokens.push({
    type: 'hr',
    lines: [ startLine, state.line ],
    level: state.level
  });

  return true;
};

},{}],55:[function(require,module,exports){
// HTML block

'use strict';


var block_names = require('../common/html_blocks');


var HTML_TAG_OPEN_RE = /^<([a-zA-Z]{1,15})[\s\/>]/;
var HTML_TAG_CLOSE_RE = /^<\/([a-zA-Z]{1,15})[\s>]/;

function isLetter(ch) {
  /*eslint no-bitwise:0*/
  var lc = ch | 0x20; // to lower case
  return (lc >= 0x61/* a */) && (lc <= 0x7a/* z */);
}

module.exports = function html_block(state, startLine, endLine, silent) {
  var ch, match, nextLine,
      pos = state.bMarks[startLine],
      max = state.eMarks[startLine],
      shift = state.tShift[startLine];

  pos += shift;

  if (!state.md.options.html) { return false; }

  if (shift > 3 || pos + 2 >= max) { return false; }

  if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

  ch = state.src.charCodeAt(pos + 1);

  if (ch === 0x21/* ! */ || ch === 0x3F/* ? */) {
    // Directive start / comment start / processing instruction start
    if (silent) { return true; }

  } else if (ch === 0x2F/* / */ || isLetter(ch)) {

    // Probably start or end of tag
    if (ch === 0x2F/* \ */) {
      // closing tag
      match = state.src.slice(pos, max).match(HTML_TAG_CLOSE_RE);
      if (!match) { return false; }
    } else {
      // opening tag
      match = state.src.slice(pos, max).match(HTML_TAG_OPEN_RE);
      if (!match) { return false; }
    }
    // Make sure tag name is valid
    if (block_names[match[1].toLowerCase()] !== true) { return false; }
    if (silent) { return true; }

  } else {
    return false;
  }

  // If we are here - we detected HTML block.
  // Let's roll down till empty line (block end).
  nextLine = startLine + 1;
  while (nextLine < state.lineMax && !state.isEmpty(nextLine)) {
    nextLine++;
  }

  state.line = nextLine;
  state.tokens.push({
    type: 'html_block',
    level: state.level,
    lines: [ startLine, state.line ],
    content: state.getLines(startLine, nextLine, 0, true)
  });

  return true;
};

},{"../common/html_blocks":33}],56:[function(require,module,exports){
// lheading (---, ===)

'use strict';


module.exports = function lheading(state, startLine, endLine/*, silent*/) {
  var marker, pos, max,
      next = startLine + 1;

  if (next >= endLine) { return false; }
  if (state.tShift[next] < state.blkIndent) { return false; }

  // Scan next line

  if (state.tShift[next] - state.blkIndent > 3) { return false; }

  pos = state.bMarks[next] + state.tShift[next];
  max = state.eMarks[next];

  if (pos >= max) { return false; }

  marker = state.src.charCodeAt(pos);

  if (marker !== 0x2D/* - */ && marker !== 0x3D/* = */) { return false; }

  pos = state.skipChars(pos, marker);

  pos = state.skipSpaces(pos);

  if (pos < max) { return false; }

  pos = state.bMarks[startLine] + state.tShift[startLine];

  state.line = next + 1;
  state.tokens.push({
    type: 'heading_open',
    hLevel: marker === 0x3D/* = */ ? 1 : 2,
    lines: [ startLine, state.line ],
    level: state.level
  });
  state.tokens.push({
    type: 'inline',
    content: state.src.slice(pos, state.eMarks[startLine]).trim(),
    level: state.level + 1,
    lines: [ startLine, state.line - 1 ],
    children: []
  });
  state.tokens.push({
    type: 'heading_close',
    hLevel: marker === 0x3D/* = */ ? 1 : 2,
    level: state.level
  });

  return true;
};

},{}],57:[function(require,module,exports){
// Lists

'use strict';


// Search `[-+*][\n ]`, returns next pos arter marker on success
// or -1 on fail.
function skipBulletListMarker(state, startLine) {
  var marker, pos, max;

  pos = state.bMarks[startLine] + state.tShift[startLine];
  max = state.eMarks[startLine];

  marker = state.src.charCodeAt(pos++);
  // Check bullet
  if (marker !== 0x2A/* * */ &&
      marker !== 0x2D/* - */ &&
      marker !== 0x2B/* + */) {
    return -1;
  }

  if (pos < max && state.src.charCodeAt(pos) !== 0x20) {
    // " 1.test " - is not a list item
    return -1;
  }

  return pos;
}

// Search `\d+[.)][\n ]`, returns next pos arter marker on success
// or -1 on fail.
function skipOrderedListMarker(state, startLine) {
  var ch,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  // List marker should have at least 2 chars (digit + dot)
  if (pos + 1 >= max) { return -1; }

  ch = state.src.charCodeAt(pos++);

  if (ch < 0x30/* 0 */ || ch > 0x39/* 9 */) { return -1; }

  for (;;) {
    // EOL -> fail
    if (pos >= max) { return -1; }

    ch = state.src.charCodeAt(pos++);

    if (ch >= 0x30/* 0 */ && ch <= 0x39/* 9 */) {
      continue;
    }

    // found valid marker
    if (ch === 0x29/* ) */ || ch === 0x2e/* . */) {
      break;
    }

    return -1;
  }


  if (pos < max && state.src.charCodeAt(pos) !== 0x20/* space */) {
    // " 1.test " - is not a list item
    return -1;
  }
  return pos;
}

function markTightParagraphs(state, idx) {
  var i, l,
      level = state.level + 2;

  for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
    if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
      state.tokens[i + 2].tight = true;
      state.tokens[i].tight = true;
      i += 2;
    }
  }
}


module.exports = function list(state, startLine, endLine, silent) {
  var nextLine,
      indent,
      oldTShift,
      oldIndent,
      oldTight,
      oldParentType,
      start,
      posAfterMarker,
      max,
      indentAfterMarker,
      markerValue,
      markerCharCode,
      isOrdered,
      contentStart,
      listTokIdx,
      prevEmptyEnd,
      listLines,
      itemLines,
      tight = true,
      terminatorRules,
      i, l, terminate;

  // Detect list type and position after marker
  if ((posAfterMarker = skipOrderedListMarker(state, startLine)) >= 0) {
    isOrdered = true;
  } else if ((posAfterMarker = skipBulletListMarker(state, startLine)) >= 0) {
    isOrdered = false;
  } else {
    return false;
  }

  // We should terminate list on style change. Remember first one to compare.
  markerCharCode = state.src.charCodeAt(posAfterMarker - 1);

  // For validation mode we can terminate immediately
  if (silent) { return true; }

  // Start list
  listTokIdx = state.tokens.length;

  if (isOrdered) {
    start = state.bMarks[startLine] + state.tShift[startLine];
    markerValue = Number(state.src.substr(start, posAfterMarker - start - 1));

    state.tokens.push({
      type: 'ordered_list_open',
      order: markerValue,
      lines: listLines = [ startLine, 0 ],
      level: state.level++
    });

  } else {
    state.tokens.push({
      type: 'bullet_list_open',
      lines: listLines = [ startLine, 0 ],
      level: state.level++
    });
  }

  //
  // Iterate list items
  //

  nextLine = startLine;
  prevEmptyEnd = false;
  terminatorRules = state.md.block.ruler.getRules('list');

  while (nextLine < endLine) {
    contentStart = state.skipSpaces(posAfterMarker);
    max = state.eMarks[nextLine];

    if (contentStart >= max) {
      // trimming space in "-    \n  3" case, indent is 1 here
      indentAfterMarker = 1;
    } else {
      indentAfterMarker = contentStart - posAfterMarker;
    }

    // If we have more than 4 spaces, the indent is 1
    // (the rest is just indented code block)
    if (indentAfterMarker > 4) { indentAfterMarker = 1; }

    // "  -  test"
    //  ^^^^^ - calculating total length of this thing
    indent = (posAfterMarker - state.bMarks[nextLine]) + indentAfterMarker;

    // Run subparser & write tokens
    state.tokens.push({
      type: 'list_item_open',
      lines: itemLines = [ startLine, 0 ],
      level: state.level++
    });

    oldIndent = state.blkIndent;
    oldTight = state.tight;
    oldTShift = state.tShift[startLine];
    oldParentType = state.parentType;
    state.tShift[startLine] = contentStart - state.bMarks[startLine];
    state.blkIndent = indent;
    state.tight = true;
    state.parentType = 'list';

    state.md.block.tokenize(state, startLine, endLine, true);

    // If any of list item is tight, mark list as tight
    if (!state.tight || prevEmptyEnd) {
      tight = false;
    }
    // Item become loose if finish with empty line,
    // but we should filter last element, because it means list finish
    prevEmptyEnd = (state.line - startLine) > 1 && state.isEmpty(state.line - 1);

    state.blkIndent = oldIndent;
    state.tShift[startLine] = oldTShift;
    state.tight = oldTight;
    state.parentType = oldParentType;

    state.tokens.push({
      type: 'list_item_close',
      level: --state.level
    });

    nextLine = startLine = state.line;
    itemLines[1] = nextLine;
    contentStart = state.bMarks[startLine];

    if (nextLine >= endLine) { break; }

    if (state.isEmpty(nextLine)) {
      break;
    }

    //
    // Try to check if list is terminated or continued.
    //
    if (state.tShift[nextLine] < state.blkIndent) { break; }

    // fail if terminating block found
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }

    // fail if list has another type
    if (isOrdered) {
      posAfterMarker = skipOrderedListMarker(state, nextLine);
      if (posAfterMarker < 0) { break; }
    } else {
      posAfterMarker = skipBulletListMarker(state, nextLine);
      if (posAfterMarker < 0) { break; }
    }

    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) { break; }
  }

  // Finilize list
  state.tokens.push({
    type: isOrdered ? 'ordered_list_close' : 'bullet_list_close',
    level: --state.level
  });
  listLines[1] = nextLine;

  state.line = nextLine;

  // mark paragraphs tight if needed
  if (tight) {
    markTightParagraphs(state, listTokIdx);
  }

  return true;
};

},{}],58:[function(require,module,exports){
// Paragraph

'use strict';


module.exports = function paragraph(state, startLine/*, endLine*/) {
  var endLine, content, terminate, i, l,
      nextLine = startLine + 1,
      terminatorRules;

  endLine = state.lineMax;

  // jump line-by-line until empty one or EOF
  if (nextLine < endLine && !state.isEmpty(nextLine)) {
    terminatorRules = state.md.block.ruler.getRules('paragraph');

    for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
      // this would be a code block normally, but after paragraph
      // it's considered a lazy continuation regardless of what's there
      if (state.tShift[nextLine] - state.blkIndent > 3) { continue; }

      // Some tags can terminate paragraph without empty line.
      terminate = false;
      for (i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }
      if (terminate) { break; }
    }
  }

  content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();

  state.line = nextLine;
  state.tokens.push({
    type: 'paragraph_open',
    tight: false,
    lines: [ startLine, state.line ],
    level: state.level
  });
  state.tokens.push({
    type: 'inline',
    content: content,
    level: state.level + 1,
    lines: [ startLine, state.line ],
    children: []
  });
  state.tokens.push({
    type: 'paragraph_close',
    tight: false,
    level: state.level
  });

  return true;
};

},{}],59:[function(require,module,exports){
'use strict';


var parseLinkDestination = require('../helpers/parse_link_destination');
var parseLinkTitle       = require('../helpers/parse_link_title');
var normalizeReference   = require('../common/utils').normalizeReference;


module.exports = function reference(state, startLine, _endLine, silent) {
  var ch,
      destEndPos,
      destEndLineNo,
      endLine,
      href,
      i,
      l,
      label,
      labelEnd,
      res,
      start,
      str,
      terminate,
      terminatorRules,
      title,
      lines = 0,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine],
      nextLine = startLine + 1;

  if (state.src.charCodeAt(pos) !== 0x5B/* [ */) { return false; }

  // Simple check to quickly interrupt scan on [link](url) at the start of line.
  // Can be useful on practice: https://github.com/markdown-it/markdown-it/issues/54
  while (++pos < max) {
    if (state.src.charCodeAt(pos) === 0x5D /* ] */ &&
        state.src.charCodeAt(pos - 1) !== 0x5C/* \ */) {
      if (pos + 1 === max) { return false; }
      if (state.src.charCodeAt(pos + 1) !== 0x3A/* : */) { return false; }
      break;
    }
  }

  endLine = state.lineMax;

  // jump line-by-line until empty one or EOF
  if (nextLine < endLine && !state.isEmpty(nextLine)) {
    terminatorRules = state.md.block.ruler.getRules('reference');

    for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
      // this would be a code block normally, but after paragraph
      // it's considered a lazy continuation regardless of what's there
      if (state.tShift[nextLine] - state.blkIndent > 3) { continue; }

      // Some tags can terminate paragraph without empty line.
      terminate = false;
      for (i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine, endLine, true)) {
          terminate = true;
          break;
        }
      }
      if (terminate) { break; }
    }
  }

  str = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
  max = str.length;

  for (pos = 1; pos < max; pos++) {
    ch = str.charCodeAt(pos);
    if (ch === 0x5B /* [ */) {
      return false;
    } else if (ch === 0x5D /* ] */) {
      labelEnd = pos;
      break;
    } else if (ch === 0x0A /* \n */) {
      lines++;
    } else if (ch === 0x5C /* \ */) {
      pos++;
      if (pos < max && str.charCodeAt(pos) === 0x0A) {
        lines++;
      }
    }
  }

  if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 0x3A/* : */) { return false; }

  // [label]:   destination   'title'
  //         ^^^ skip optional whitespace here
  for (pos = labelEnd + 2; pos < max; pos++) {
    ch = str.charCodeAt(pos);
    if (ch === 0x0A) {
      lines++;
    } else if (ch === 0x20) {
      /*eslint no-empty:0*/
    } else {
      break;
    }
  }

  // [label]:   destination   'title'
  //            ^^^^^^^^^^^ parse this
  res = parseLinkDestination(str, pos, max);
  if (!res.ok) { return false; }
  if (!state.md.inline.validateLink(res.str)) { return false; }
  href = res.str;
  pos = res.pos;
  lines += res.lines;

  // save cursor state, we could require to rollback later
  destEndPos = pos;
  destEndLineNo = lines;

  // [label]:   destination   'title'
  //                       ^^^ skipping those spaces
  start = pos;
  for (; pos < max; pos++) {
    ch = str.charCodeAt(pos);
    if (ch === 0x0A) {
      lines++;
    } else if (ch === 0x20) {
      /*eslint no-empty:0*/
    } else {
      break;
    }
  }

  // [label]:   destination   'title'
  //                          ^^^^^^^ parse this
  res = parseLinkTitle(str, pos, max);
  if (pos < max && start !== pos && res.ok) {
    title = res.str;
    pos = res.pos;
    lines += res.lines;
  } else {
    title = '';
    pos = destEndPos;
    lines = destEndLineNo;
  }

  // skip trailing spaces until the rest of the line
  while (pos < max && str.charCodeAt(pos) === 0x20/* space */) { pos++; }

  if (pos < max && str.charCodeAt(pos) !== 0x0A) {
    // garbage at the end of the line
    return false;
  }

  if (silent) { return true; }

  label = normalizeReference(str.slice(1, labelEnd));
  if (typeof state.env.references === 'undefined') {
    state.env.references = {};
  }
  if (typeof state.env.references[label] === 'undefined') {
    state.env.references[label] = { title: title, href: href };
  }

  state.line = startLine + lines + 1;
  return true;
};

},{"../common/utils":36,"../helpers/parse_link_destination":38,"../helpers/parse_link_title":40}],60:[function(require,module,exports){
// Parser state class

'use strict';


function StateBlock(src, md, env, tokens) {
  var ch, s, start, pos, len, indent, indent_found;

  this.src = src;

  // link to parser instance
  this.md     = md;

  this.env = env;

  //
  // Internal state vartiables
  //

  this.tokens = tokens;

  this.bMarks = [];  // line begin offsets for fast jumps
  this.eMarks = [];  // line end offsets for fast jumps
  this.tShift = [];  // indent for each line

  // block parser variables
  this.blkIndent  = 0; // required block content indent
                       // (for example, if we are in list)
  this.line       = 0; // line index in src
  this.lineMax    = 0; // lines count
  this.tight      = false;  // loose/tight mode for lists
  this.parentType = 'root'; // if `list`, block parser stops on two newlines
  this.ddIndent   = -1; // indent of the current dd block (-1 if there isn't any)

  this.level = 0;

  // renderer
  this.result = '';

  // Create caches
  // Generate markers.
  s = this.src;
  indent = 0;
  indent_found = false;

  for (start = pos = indent = 0, len = s.length; pos < len; pos++) {
    ch = s.charCodeAt(pos);

    if (!indent_found) {
      if (ch === 0x20/* space */) {
        indent++;
        continue;
      } else {
        indent_found = true;
      }
    }

    if (ch === 0x0A || pos === len - 1) {
      if (ch !== 0x0A) { pos++; }
      this.bMarks.push(start);
      this.eMarks.push(pos);
      this.tShift.push(indent);

      indent_found = false;
      indent = 0;
      start = pos + 1;
    }
  }

  // Push fake entry to simplify cache bounds checks
  this.bMarks.push(s.length);
  this.eMarks.push(s.length);
  this.tShift.push(0);

  this.lineMax = this.bMarks.length - 1; // don't count last fake line
}

StateBlock.prototype.isEmpty = function isEmpty(line) {
  return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
};

StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
  for (var max = this.lineMax; from < max; from++) {
    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
      break;
    }
  }
  return from;
};

// Skip spaces from given position.
StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
  for (var max = this.src.length; pos < max; pos++) {
    if (this.src.charCodeAt(pos) !== 0x20/* space */) { break; }
  }
  return pos;
};

// Skip char codes from given position
StateBlock.prototype.skipChars = function skipChars(pos, code) {
  for (var max = this.src.length; pos < max; pos++) {
    if (this.src.charCodeAt(pos) !== code) { break; }
  }
  return pos;
};

// Skip char codes reverse from given position - 1
StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code, min) {
  if (pos <= min) { return pos; }

  while (pos > min) {
    if (code !== this.src.charCodeAt(--pos)) { return pos + 1; }
  }
  return pos;
};

// cut lines range from source.
StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
  var i, first, last, queue, shift,
      line = begin;

  if (begin >= end) {
    return '';
  }

  // Opt: don't use push queue for single line;
  if (line + 1 === end) {
    first = this.bMarks[line] + Math.min(this.tShift[line], indent);
    last = keepLastLF ? this.bMarks[end] : this.eMarks[end - 1];
    return this.src.slice(first, last);
  }

  queue = new Array(end - begin);

  for (i = 0; line < end; line++, i++) {
    shift = this.tShift[line];
    if (shift > indent) { shift = indent; }
    if (shift < 0) { shift = 0; }

    first = this.bMarks[line] + shift;

    if (line + 1 < end || keepLastLF) {
      // No need for bounds check because we have fake entry on tail.
      last = this.eMarks[line] + 1;
    } else {
      last = this.eMarks[line];
    }

    queue[i] = this.src.slice(first, last);
  }

  return queue.join('');
};


module.exports = StateBlock;

},{}],61:[function(require,module,exports){
// GFM table, non-standard

'use strict';


function getLine(state, line) {
  var pos = state.bMarks[line] + state.blkIndent,
      max = state.eMarks[line];

  return state.src.substr(pos, max - pos);
}

function escapedSplit(str) {
  var result = [],
      pos = 0,
      max = str.length,
      ch,
      escapes = 0,
      lastPos = 0;

  ch  = str.charCodeAt(pos);

  while (pos < max) {
    if (ch === 0x7c/* | */ && (escapes % 2 === 0)) {
      result.push(str.substring(lastPos, pos));
      lastPos = pos + 1;
    } else if (ch === 0x5c/* \ */) {
      escapes++;
    } else {
      escapes = 0;
    }

    ch  = str.charCodeAt(++pos);
  }

  result.push(str.substring(lastPos));

  return result;
}


module.exports = function table(state, startLine, endLine, silent) {
  var ch, lineText, pos, i, nextLine, rows,
      aligns, t, tableLines, tbodyLines;

  // should have at least three lines
  if (startLine + 2 > endLine) { return false; }

  nextLine = startLine + 1;

  if (state.tShift[nextLine] < state.blkIndent) { return false; }

  // first character of the second line should be '|' or '-'

  pos = state.bMarks[nextLine] + state.tShift[nextLine];
  if (pos >= state.eMarks[nextLine]) { return false; }

  ch = state.src.charCodeAt(pos);
  if (ch !== 0x7C/* | */ && ch !== 0x2D/* - */ && ch !== 0x3A/* : */) { return false; }

  lineText = getLine(state, startLine + 1);
  if (!/^[-:| ]+$/.test(lineText)) { return false; }

  rows = lineText.split('|');
  if (rows.length < 2) { return false; }
  aligns = [];
  for (i = 0; i < rows.length; i++) {
    t = rows[i].trim();
    if (!t) {
      // allow empty columns before and after table, but not in between columns;
      // e.g. allow ` |---| `, disallow ` ---||--- `
      if (i === 0 || i === rows.length - 1) {
        continue;
      } else {
        return false;
      }
    }

    if (!/^:?-+:?$/.test(t)) { return false; }
    if (t.charCodeAt(t.length - 1) === 0x3A/* : */) {
      aligns.push(t.charCodeAt(0) === 0x3A/* : */ ? 'center' : 'right');
    } else if (t.charCodeAt(0) === 0x3A/* : */) {
      aligns.push('left');
    } else {
      aligns.push('');
    }
  }

  lineText = getLine(state, startLine).trim();
  if (lineText.indexOf('|') === -1) { return false; }
  rows = escapedSplit(lineText.replace(/^\||\|$/g, ''));
  if (aligns.length !== rows.length) { return false; }
  if (silent) { return true; }

  state.tokens.push({
    type: 'table_open',
    lines: tableLines = [ startLine, 0 ],
    level: state.level++
  });
  state.tokens.push({
    type: 'thead_open',
    lines: [ startLine, startLine + 1 ],
    level: state.level++
  });

  state.tokens.push({
    type: 'tr_open',
    lines: [ startLine, startLine + 1 ],
    level: state.level++
  });
  for (i = 0; i < rows.length; i++) {
    state.tokens.push({
      type: 'th_open',
      align: aligns[i],
      lines: [ startLine, startLine + 1 ],
      level: state.level++
    });
    state.tokens.push({
      type: 'inline',
      content: rows[i].trim(),
      lines: [ startLine, startLine + 1 ],
      level: state.level,
      children: []
    });
    state.tokens.push({ type: 'th_close', level: --state.level });
  }
  state.tokens.push({ type: 'tr_close', level: --state.level });
  state.tokens.push({ type: 'thead_close', level: --state.level });

  state.tokens.push({
    type: 'tbody_open',
    lines: tbodyLines = [ startLine + 2, 0 ],
    level: state.level++
  });

  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.tShift[nextLine] < state.blkIndent) { break; }

    lineText = getLine(state, nextLine).trim();
    if (lineText.indexOf('|') === -1) { break; }
    rows = escapedSplit(lineText.replace(/^\||\|$/g, ''));

    // set number of columns to number of columns in header row
    rows.length = aligns.length;

    state.tokens.push({ type: 'tr_open', level: state.level++ });
    for (i = 0; i < rows.length; i++) {
      state.tokens.push({ type: 'td_open', align: aligns[i], level: state.level++ });
      state.tokens.push({
        type: 'inline',
        content: rows[i] ? rows[i].trim() : '',
        level: state.level,
        children: []
      });
      state.tokens.push({ type: 'td_close', level: --state.level });
    }
    state.tokens.push({ type: 'tr_close', level: --state.level });
  }
  state.tokens.push({ type: 'tbody_close', level: --state.level });
  state.tokens.push({ type: 'table_close', level: --state.level });

  tableLines[1] = tbodyLines[1] = nextLine;
  state.line = nextLine;
  return true;
};

},{}],62:[function(require,module,exports){
'use strict';

module.exports = function block(state) {

  if (state.inlineMode) {
    state.tokens.push({
      type: 'inline',
      content: state.src,
      level: 0,
      lines: [ 0, 1 ],
      children: []
    });

  } else {
    state.md.block.parse(state.src, state.md, state.env, state.tokens);
  }
};

},{}],63:[function(require,module,exports){
'use strict';

module.exports = function inline(state) {
  var tokens = state.tokens, tok, i, l;

  // Parse inlines
  for (i = 0, l = tokens.length; i < l; i++) {
    tok = tokens[i];
    if (tok.type === 'inline') {
      state.md.inline.parse(tok.content, state.md, state.env, tok.children);
    }
  }
};

},{}],64:[function(require,module,exports){
// Replace link-like texts with link nodes.
//
// Currently restricted by `inline.validateLink()` to http/https/ftp
//
'use strict';


var Autolinker     = require('autolinker');
var arrayReplaceAt = require('../common/utils').arrayReplaceAt;


var LINK_SCAN_RE = /www|@|\:\/\//;


function isLinkOpen(str) {
  return /^<a[>\s]/i.test(str);
}
function isLinkClose(str) {
  return /^<\/a\s*>/i.test(str);
}

// Stupid fabric to avoid singletons, for thread safety.
// Required for engines like Nashorn.
//
function createLinkifier() {
  var links = [];
  var autolinker = new Autolinker({
    stripPrefix: false,
    url: true,
    email: true,
    twitter: false,
    replaceFn: function (__, match) {
      // Only collect matched strings but don't change anything.
      switch (match.getType()) {
        /*eslint default-case:0*/
        case 'url':
          links.push({
            text: match.matchedText,
            url: match.getUrl()
          });
          break;
        case 'email':
          links.push({
            text: match.matchedText,
            // normalize email protocol
            url: 'mailto:' + match.getEmail().replace(/^mailto:/i, '')
          });
          break;
      }
      return false;
    }
  });

  return {
    links: links,
    autolinker: autolinker
  };
}


module.exports = function linkify(state) {
  var i, j, l, tokens, token, text, nodes, ln, pos, level, htmlLinkLevel,
      blockTokens = state.tokens,
      linkifier = null, links, autolinker;

  if (!state.md.options.linkify) { return; }

  for (j = 0, l = blockTokens.length; j < l; j++) {
    if (blockTokens[j].type !== 'inline') { continue; }
    tokens = blockTokens[j].children;

    htmlLinkLevel = 0;

    // We scan from the end, to keep position when new tags added.
    // Use reversed logic in links start/end match
    for (i = tokens.length - 1; i >= 0; i--) {
      token = tokens[i];

      // Skip content of markdown links
      if (token.type === 'link_close') {
        i--;
        while (tokens[i].level !== token.level && tokens[i].type !== 'link_open') {
          i--;
        }
        continue;
      }

      // Skip content of html tag links
      if (token.type === 'html_inline') {
        if (isLinkOpen(token.content) && htmlLinkLevel > 0) {
          htmlLinkLevel--;
        }
        if (isLinkClose(token.content)) {
          htmlLinkLevel++;
        }
      }
      if (htmlLinkLevel > 0) { continue; }

      if (token.type === 'text' && LINK_SCAN_RE.test(token.content)) {

        // Init linkifier in lazy manner, only if required.
        if (!linkifier) {
          linkifier = createLinkifier();
          links = linkifier.links;
          autolinker = linkifier.autolinker;
        }

        text = token.content;
        links.length = 0;
        autolinker.link(text);

        if (!links.length) { continue; }

        // Now split string to nodes
        nodes = [];
        level = token.level;

        for (ln = 0; ln < links.length; ln++) {

          if (!state.md.inline.validateLink(links[ln].url)) { continue; }

          pos = text.indexOf(links[ln].text);

          if (pos) {
            level = level;
            nodes.push({
              type: 'text',
              content: text.slice(0, pos),
              level: level
            });
          }
          nodes.push({
            type: 'link_open',
            href: links[ln].url,
            target: '',
            title: '',
            level: level++
          });
          nodes.push({
            type: 'text',
            content: links[ln].text,
            level: level
          });
          nodes.push({
            type: 'link_close',
            level: --level
          });
          text = text.slice(pos + links[ln].text.length);
        }
        if (text.length) {
          nodes.push({
            type: 'text',
            content: text,
            level: level
          });
        }

        // replace current node
        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
      }
    }
  }
};

},{"../common/utils":36,"autolinker":81}],65:[function(require,module,exports){
// Normalize input string

'use strict';


var TABS_SCAN_RE = /[\n\t]/g;
var NEWLINES_RE  = /\r[\n\u0085]|[\u2424\u2028\u0085]/g;
var NULL_RE      = /\u0000/g;


module.exports = function inline(state) {
  var str, lineStart, lastTabPos;

  // Normalize newlines
  str = state.src.replace(NEWLINES_RE, '\n');

  // Replace NULL characters
  str = str.replace(NULL_RE, '\uFFFD');

  // Replace tabs with proper number of spaces (1..4)
  if (str.indexOf('\t') >= 0) {
    lineStart = 0;
    lastTabPos = 0;

    str = str.replace(TABS_SCAN_RE, function (match, offset) {
      var result;
      if (str.charCodeAt(offset) === 0x0A) {
        lineStart = offset + 1;
        lastTabPos = 0;
        return match;
      }
      result = '    '.slice((offset - lineStart - lastTabPos) % 4);
      lastTabPos = offset - lineStart + 1;
      return result;
    });
  }

  state.src = str;
};

},{}],66:[function(require,module,exports){
// Simple typographyc replacements
//
// '' → ‘’
// "" → “”. Set '«»' for Russian, '„“' for German, empty to disable
// (c) (C) → ©
// (tm) (TM) → ™
// (r) (R) → ®
// +- → ±
// (p) (P) -> §
// ... → … (also ?.... → ?.., !.... → !..)
// ???????? → ???, !!!!! → !!!, `,,` → `,`
// -- → &ndash;, --- → &mdash;
//
'use strict';

// TODO:
// - fractionals 1/2, 1/4, 3/4 -> ½, ¼, ¾
// - miltiplication 2 x 4 -> 2 × 4

var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;

var SCOPED_ABBR_RE = /\((c|tm|r|p)\)/ig;
var SCOPED_ABBR = {
  'c': '©',
  'r': '®',
  'p': '§',
  'tm': '™'
};

function replaceScopedAbbr(str) {
  if (str.indexOf('(') < 0) { return str; }

  return str.replace(SCOPED_ABBR_RE, function(match, name) {
    return SCOPED_ABBR[name.toLowerCase()];
  });
}


module.exports = function replace(state) {
  var i, token, text, inlineTokens, blkIdx;

  if (!state.md.options.typographer) { return; }

  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

    if (state.tokens[blkIdx].type !== 'inline') { continue; }

    inlineTokens = state.tokens[blkIdx].children;

    for (i = inlineTokens.length - 1; i >= 0; i--) {
      token = inlineTokens[i];
      if (token.type === 'text') {
        text = token.content;

        text = replaceScopedAbbr(text);

        if (RARE_RE.test(text)) {
          text = text.replace(/\+-/g, '±')
                      // .., ..., ....... -> …
                      // but ?..... & !..... -> ?.. & !..
                      .replace(/\.{2,}/g, '…').replace(/([?!])…/g, '$1..')
                      .replace(/([?!]){4,}/g, '$1$1$1').replace(/,{2,}/g, ',')
                      // em-dash
                      .replace(/(^|[^-])---([^-]|$)/mg, '$1\u2014$2')
                      // en-dash
                      .replace(/(^|\s)--(\s|$)/mg, '$1\u2013$2')
                      .replace(/(^|[^-\s])--([^-\s]|$)/mg, '$1\u2013$2');
        }

        token.content = text;
      }
    }
  }
};

},{}],67:[function(require,module,exports){
// Convert straight quotation marks to typographic ones
//
'use strict';


var QUOTE_TEST_RE = /['"]/;
var QUOTE_RE = /['"]/g;
var PUNCT_RE = /[-\s()\[\]]/;
var APOSTROPHE = '\u2019'; /* ’ */

// This function returns true if the character at `pos`
// could be inside a word.
function isLetter(str, pos) {
  if (pos < 0 || pos >= str.length) { return false; }
  return !PUNCT_RE.test(str[pos]);
}


function replaceAt(str, index, ch) {
  return str.substr(0, index) + ch + str.substr(index + 1);
}


module.exports = function smartquotes(state) {
  /*eslint max-depth:0*/
  var i, token, text, t, pos, max, thisLevel, lastSpace, nextSpace, item,
      canOpen, canClose, j, isSingle, blkIdx, tokens,
      stack;

  if (!state.md.options.typographer) { return; }

  stack = [];

  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

    if (state.tokens[blkIdx].type !== 'inline') { continue; }

    tokens = state.tokens[blkIdx].children;
    stack.length = 0;

    for (i = 0; i < tokens.length; i++) {
      token = tokens[i];

      if (token.type !== 'text' || QUOTE_TEST_RE.test(token.text)) { continue; }

      thisLevel = tokens[i].level;

      for (j = stack.length - 1; j >= 0; j--) {
        if (stack[j].level <= thisLevel) { break; }
      }
      stack.length = j + 1;

      text = token.content;
      pos = 0;
      max = text.length;

      /*eslint no-labels:0,block-scoped-var:0*/
      OUTER:
      while (pos < max) {
        QUOTE_RE.lastIndex = pos;
        t = QUOTE_RE.exec(text);
        if (!t) { break; }

        lastSpace = !isLetter(text, t.index - 1);
        pos = t.index + 1;
        isSingle = (t[0] === "'");
        nextSpace = !isLetter(text, pos);

        if (!nextSpace && !lastSpace) {
          // middle of word
          if (isSingle) {
            token.content = replaceAt(token.content, t.index, APOSTROPHE);
          }
          continue;
        }

        canOpen = !nextSpace;
        canClose = !lastSpace;

        if (canClose) {
          // this could be a closing quote, rewind the stack to get a match
          for (j = stack.length - 1; j >= 0; j--) {
            item = stack[j];
            if (stack[j].level < thisLevel) { break; }
            if (item.single === isSingle && stack[j].level === thisLevel) {
              item = stack[j];
              if (isSingle) {
                tokens[item.token].content = replaceAt(
                  tokens[item.token].content, item.pos, state.md.options.quotes[2]);
                token.content = replaceAt(
                  token.content, t.index, state.md.options.quotes[3]);
              } else {
                tokens[item.token].content = replaceAt(
                  tokens[item.token].content, item.pos, state.md.options.quotes[0]);
                token.content = replaceAt(token.content, t.index, state.md.options.quotes[1]);
              }
              stack.length = j;
              continue OUTER;
            }
          }
        }

        if (canOpen) {
          stack.push({
            token: i,
            pos: t.index,
            single: isSingle,
            level: thisLevel
          });
        } else if (canClose && isSingle) {
          token.content = replaceAt(token.content, t.index, APOSTROPHE);
        }
      }
    }
  }
};

},{}],68:[function(require,module,exports){
// Core state object
//
'use strict';

module.exports = function StateCore(src, md, env) {
  this.src = src;
  this.env = env;
  this.tokens = [];
  this.inlineMode = false;
  this.md = md; // link to parser instance
};

},{}],69:[function(require,module,exports){
// Process autolinks '<protocol:...>'

'use strict';

var url_schemas   = require('../common/url_schemas');
var normalizeLink = require('../common/utils').normalizeLink;


/*eslint max-len:0*/
var EMAIL_RE    = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
var AUTOLINK_RE = /^<([a-zA-Z.\-]{1,25}):([^<>\x00-\x20]*)>/;


module.exports = function autolink(state, silent) {
  var tail, linkMatch, emailMatch, url, fullUrl, pos = state.pos;

  if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

  tail = state.src.slice(pos);

  if (tail.indexOf('>') < 0) { return false; }

  linkMatch = tail.match(AUTOLINK_RE);

  if (linkMatch) {
    if (url_schemas.indexOf(linkMatch[1].toLowerCase()) < 0) { return false; }

    url = linkMatch[0].slice(1, -1);
    fullUrl = normalizeLink(url);
    if (!state.md.inline.validateLink(url)) { return false; }

    if (!silent) {
      state.push({
        type: 'link_open',
        href: fullUrl,
        target: '',
        level: state.level
      });
      state.push({
        type: 'text',
        content: url,
        level: state.level + 1
      });
      state.push({ type: 'link_close', level: state.level });
    }

    state.pos += linkMatch[0].length;
    return true;
  }

  emailMatch = tail.match(EMAIL_RE);

  if (emailMatch) {

    url = emailMatch[0].slice(1, -1);

    fullUrl = normalizeLink('mailto:' + url);
    if (!state.md.inline.validateLink(fullUrl)) { return false; }

    if (!silent) {
      state.push({
        type: 'link_open',
        href: fullUrl,
        target: '',
        level: state.level
      });
      state.push({
        type: 'text',
        content: url,
        level: state.level + 1
      });
      state.push({ type: 'link_close', level: state.level });
    }

    state.pos += emailMatch[0].length;
    return true;
  }

  return false;
};

},{"../common/url_schemas":35,"../common/utils":36}],70:[function(require,module,exports){
// Parse backticks

'use strict';

module.exports = function backtick(state, silent) {
  var start, max, marker, matchStart, matchEnd,
      pos = state.pos,
      ch = state.src.charCodeAt(pos);

  if (ch !== 0x60/* ` */) { return false; }

  start = pos;
  pos++;
  max = state.posMax;

  while (pos < max && state.src.charCodeAt(pos) === 0x60/* ` */) { pos++; }

  marker = state.src.slice(start, pos);

  matchStart = matchEnd = pos;

  while ((matchStart = state.src.indexOf('`', matchEnd)) !== -1) {
    matchEnd = matchStart + 1;

    while (matchEnd < max && state.src.charCodeAt(matchEnd) === 0x60/* ` */) { matchEnd++; }

    if (matchEnd - matchStart === marker.length) {
      if (!silent) {
        state.push({
          type: 'code_inline',
          content: state.src.slice(pos, matchStart)
                              .replace(/[ \n]+/g, ' ')
                              .trim(),
          level: state.level
        });
      }
      state.pos = matchEnd;
      return true;
    }
  }

  if (!silent) { state.pending += marker; }
  state.pos += marker.length;
  return true;
};

},{}],71:[function(require,module,exports){
// Process *this* and _that_
//
'use strict';


var isWhiteSpace   = require('../common/utils').isWhiteSpace;
var isPunctChar    = require('../common/utils').isPunctChar;
var isMdAsciiPunct = require('../common/utils').isMdAsciiPunct;


function isAlphaNum(code) {
  return (code >= 0x30 /* 0 */ && code <= 0x39 /* 9 */) ||
         (code >= 0x41 /* A */ && code <= 0x5A /* Z */) ||
         (code >= 0x61 /* a */ && code <= 0x7A /* z */);
}

// parse sequence of emphasis markers,
// "start" should point at a valid marker
function scanDelims(state, start) {
  var pos = start, lastChar, nextChar, count,
      isLastWhiteSpace, isLastPunctChar,
      isNextWhiteSpace, isNextPunctChar,
      can_open = true,
      can_close = true,
      max = state.posMax,
      marker = state.src.charCodeAt(start);

  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : -1;

  while (pos < max && state.src.charCodeAt(pos) === marker) { pos++; }
  if (pos >= max) { can_open = false; }
  count = pos - start;

  nextChar = pos < max ? state.src.charCodeAt(pos) : -1;

  isLastPunctChar = lastChar >= 0 &&
    (isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar)));
  isNextPunctChar = nextChar >= 0 &&
    (isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar)));
  isLastWhiteSpace = lastChar >= 0 && isWhiteSpace(lastChar);
  isNextWhiteSpace = nextChar >= 0 && isWhiteSpace(nextChar);

  if (isNextWhiteSpace) {
    can_open = false;
  } else if (isNextPunctChar) {
    if (!(isLastWhiteSpace || isLastPunctChar || lastChar === -1)) {
      can_open = false;
    }
  }

  if (isLastWhiteSpace) {
    can_close = false;
  } else if (isLastPunctChar) {
    if (!(isNextWhiteSpace || isNextPunctChar || nextChar === -1)) {
      can_close = false;
    }
  }

  if (marker === 0x5F /* _ */) {
    // check if we aren't inside the word
    if (isAlphaNum(lastChar)) { can_open = false; }
    if (isAlphaNum(nextChar)) { can_close = false; }
  }

  return {
    can_open: can_open,
    can_close: can_close,
    delims: count
  };
}

module.exports = function emphasis(state, silent) {
  var startCount,
      count,
      found,
      oldCount,
      newCount,
      stack,
      res,
      max = state.posMax,
      start = state.pos,
      marker = state.src.charCodeAt(start);

  if (marker !== 0x5F/* _ */ && marker !== 0x2A /* * */) { return false; }
  if (silent) { return false; } // don't run any pairs in validation mode

  res = scanDelims(state, start);
  startCount = res.delims;
  if (!res.can_open) {
    state.pos += startCount;
    // Earlier we checked !silent, but this implementation does not need it
    state.pending += state.src.slice(start, state.pos);
    return true;
  }

  state.pos = start + startCount;
  stack = [ startCount ];

  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === marker) {
      res = scanDelims(state, state.pos);
      count = res.delims;
      if (res.can_close) {
        oldCount = stack.pop();
        newCount = count;

        while (oldCount !== newCount) {
          if (newCount < oldCount) {
            stack.push(oldCount - newCount);
            break;
          }

          // assert(newCount > oldCount)
          newCount -= oldCount;

          if (stack.length === 0) { break; }
          state.pos += oldCount;
          oldCount = stack.pop();
        }

        if (stack.length === 0) {
          startCount = oldCount;
          found = true;
          break;
        }
        state.pos += count;
        continue;
      }

      if (res.can_open) { stack.push(count); }
      state.pos += count;
      continue;
    }

    state.md.inline.skipToken(state);
  }

  if (!found) {
    // parser failed to find ending tag, so it's not valid emphasis
    state.pos = start;
    return false;
  }

  // found!
  state.posMax = state.pos;
  state.pos = start + startCount;

  // Earlier we checked !silent, but this implementation does not need it

  // we have `startCount` starting and ending markers,
  // now trying to serialize them into tokens
  for (count = startCount; count > 1; count -= 2) {
    state.push({ type: 'strong_open', level: state.level++ });
  }
  if (count % 2) { state.push({ type: 'em_open', level: state.level++ }); }

  state.md.inline.tokenize(state);

  if (count % 2) { state.push({ type: 'em_close', level: --state.level }); }
  for (count = startCount; count > 1; count -= 2) {
    state.push({ type: 'strong_close', level: --state.level });
  }

  state.pos = state.posMax + startCount;
  state.posMax = max;
  return true;
};

},{"../common/utils":36}],72:[function(require,module,exports){
// Process html entity - &#123;, &#xAF;, &quot;, ...

'use strict';

var entities          = require('../common/entities');
var has               = require('../common/utils').has;
var isValidEntityCode = require('../common/utils').isValidEntityCode;
var fromCodePoint     = require('../common/utils').fromCodePoint;


var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,8}|[0-9]{1,8}));/i;
var NAMED_RE   = /^&([a-z][a-z0-9]{1,31});/i;


module.exports = function entity(state, silent) {
  var ch, code, match, pos = state.pos, max = state.posMax;

  if (state.src.charCodeAt(pos) !== 0x26/* & */) { return false; }

  if (pos + 1 < max) {
    ch = state.src.charCodeAt(pos + 1);

    if (ch === 0x23 /* # */) {
      match = state.src.slice(pos).match(DIGITAL_RE);
      if (match) {
        if (!silent) {
          code = match[1][0].toLowerCase() === 'x' ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
          state.pending += isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(0xFFFD);
        }
        state.pos += match[0].length;
        return true;
      }
    } else {
      match = state.src.slice(pos).match(NAMED_RE);
      if (match) {
        if (has(entities, match[1])) {
          if (!silent) { state.pending += entities[match[1]]; }
          state.pos += match[0].length;
          return true;
        }
      }
    }
  }

  if (!silent) { state.pending += '&'; }
  state.pos++;
  return true;
};

},{"../common/entities":32,"../common/utils":36}],73:[function(require,module,exports){
// Proceess escaped chars and hardbreaks

'use strict';

var ESCAPED = [];

for (var i = 0; i < 256; i++) { ESCAPED.push(0); }

'\\!"#$%&\'()*+,./:;<=>?@[]^_`{|}~-'
  .split('').forEach(function(ch) { ESCAPED[ch.charCodeAt(0)] = 1; });


module.exports = function escape(state, silent) {
  var ch, pos = state.pos, max = state.posMax;

  if (state.src.charCodeAt(pos) !== 0x5C/* \ */) { return false; }

  pos++;

  if (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (ch < 256 && ESCAPED[ch] !== 0) {
      if (!silent) { state.pending += state.src[pos]; }
      state.pos += 2;
      return true;
    }

    if (ch === 0x0A) {
      if (!silent) {
        state.push({
          type: 'hardbreak',
          level: state.level
        });
      }

      pos++;
      // skip leading whitespaces from next line
      while (pos < max && state.src.charCodeAt(pos) === 0x20) { pos++; }

      state.pos = pos;
      return true;
    }
  }

  if (!silent) { state.pending += '\\'; }
  state.pos++;
  return true;
};

},{}],74:[function(require,module,exports){
// Process html tags

'use strict';


var HTML_TAG_RE = require('../common/html_re').HTML_TAG_RE;


function isLetter(ch) {
  /*eslint no-bitwise:0*/
  var lc = ch | 0x20; // to lower case
  return (lc >= 0x61/* a */) && (lc <= 0x7a/* z */);
}


module.exports = function html_inline(state, silent) {
  var ch, match, max, pos = state.pos;

  if (!state.md.options.html) { return false; }

  // Check start
  max = state.posMax;
  if (state.src.charCodeAt(pos) !== 0x3C/* < */ ||
      pos + 2 >= max) {
    return false;
  }

  // Quick fail on second char
  ch = state.src.charCodeAt(pos + 1);
  if (ch !== 0x21/* ! */ &&
      ch !== 0x3F/* ? */ &&
      ch !== 0x2F/* / */ &&
      !isLetter(ch)) {
    return false;
  }

  match = state.src.slice(pos).match(HTML_TAG_RE);
  if (!match) { return false; }

  if (!silent) {
    state.push({
      type: 'html_inline',
      content: state.src.slice(pos, pos + match[0].length),
      level: state.level
    });
  }
  state.pos += match[0].length;
  return true;
};

},{"../common/html_re":34}],75:[function(require,module,exports){
// Process ![image](<src> "title")

'use strict';

var parseLinkLabel       = require('../helpers/parse_link_label');
var parseLinkDestination = require('../helpers/parse_link_destination');
var parseLinkTitle       = require('../helpers/parse_link_title');
var normalizeReference   = require('../common/utils').normalizeReference;


module.exports = function image(state, silent) {
  var code,
      href,
      label,
      labelEnd,
      labelStart,
      pos,
      ref,
      res,
      title,
      tokens,
      start,
      oldPos = state.pos,
      max = state.posMax;

  if (state.src.charCodeAt(state.pos) !== 0x21/* ! */) { return false; }
  if (state.src.charCodeAt(state.pos + 1) !== 0x5B/* [ */) { return false; }

  labelStart = state.pos + 2;
  labelEnd = parseLinkLabel(state, state.pos + 1, false);

  // parser failed to find ']', so it's not a valid link
  if (labelEnd < 0) { return false; }

  pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
    //
    // Inline link
    //

    // [link](  <href>  "title"  )
    //        ^^ skipping these spaces
    pos++;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (code !== 0x20 && code !== 0x0A) { break; }
    }
    if (pos >= max) { return false; }

    // [link](  <href>  "title"  )
    //          ^^^^^^ parsing link destination
    start = pos;
    res = parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok && state.md.inline.validateLink(res.str)) {
      href = res.str;
      pos = res.pos;
    } else {
      href = '';
    }

    // [link](  <href>  "title"  )
    //                ^^ skipping these spaces
    start = pos;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (code !== 0x20 && code !== 0x0A) { break; }
    }

    // [link](  <href>  "title"  )
    //                  ^^^^^^^ parsing link title
    res = parseLinkTitle(state.src, pos, state.posMax);
    if (pos < max && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;

      // [link](  <href>  "title"  )
      //                         ^^ skipping these spaces
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (code !== 0x20 && code !== 0x0A) { break; }
      }
    } else {
      title = '';
    }

    if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
      state.pos = oldPos;
      return false;
    }
    pos++;
  } else {
    //
    // Link reference
    //
    if (typeof state.env.references === 'undefined') { return false; }

    // [foo]  [bar]
    //      ^^ optional whitespace (can include newlines)
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (code !== 0x20 && code !== 0x0A) { break; }
    }

    if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
      start = pos + 1;
      pos = parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = labelEnd + 1;
      }
    } else {
      pos = labelEnd + 1;
    }

    // covers label === '' and label === undefined
    // (collapsed reference link and shortcut reference link respectively)
    if (!label) { label = state.src.slice(labelStart, labelEnd); }

    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }

  //
  // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //
  if (!silent) {
    state.pos = labelStart;
    state.posMax = labelEnd;

    var newState = new state.md.inline.State(
      state.src.slice(labelStart, labelEnd),
      state.md,
      state.env,
      tokens = []
    );
    newState.md.inline.tokenize(newState);

    state.push({
      type: 'image',
      src: href,
      title: title,
      tokens: tokens,
      level: state.level
    });
  }

  state.pos = pos;
  state.posMax = max;
  return true;
};

},{"../common/utils":36,"../helpers/parse_link_destination":38,"../helpers/parse_link_label":39,"../helpers/parse_link_title":40}],76:[function(require,module,exports){
// Process [link](<to> "stuff")

'use strict';

var parseLinkLabel       = require('../helpers/parse_link_label');
var parseLinkDestination = require('../helpers/parse_link_destination');
var parseLinkTitle       = require('../helpers/parse_link_title');
var normalizeReference   = require('../common/utils').normalizeReference;


module.exports = function link(state, silent) {
  var code,
      href,
      label,
      labelEnd,
      labelStart,
      pos,
      res,
      ref,
      title,
      oldPos = state.pos,
      max = state.posMax,
      start = state.pos;

  if (state.src.charCodeAt(state.pos) !== 0x5B/* [ */) { return false; }

  labelStart = state.pos + 1;
  labelEnd = parseLinkLabel(state, state.pos, true);

  // parser failed to find ']', so it's not a valid link
  if (labelEnd < 0) { return false; }

  pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
    //
    // Inline link
    //

    // [link](  <href>  "title"  )
    //        ^^ skipping these spaces
    pos++;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (code !== 0x20 && code !== 0x0A) { break; }
    }
    if (pos >= max) { return false; }

    // [link](  <href>  "title"  )
    //          ^^^^^^ parsing link destination
    start = pos;
    res = parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok && state.md.inline.validateLink(res.str)) {
      href = res.str;
      pos = res.pos;
    } else {
      href = '';
    }

    // [link](  <href>  "title"  )
    //                ^^ skipping these spaces
    start = pos;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (code !== 0x20 && code !== 0x0A) { break; }
    }

    // [link](  <href>  "title"  )
    //                  ^^^^^^^ parsing link title
    res = parseLinkTitle(state.src, pos, state.posMax);
    if (pos < max && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;

      // [link](  <href>  "title"  )
      //                         ^^ skipping these spaces
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (code !== 0x20 && code !== 0x0A) { break; }
      }
    } else {
      title = '';
    }

    if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
      state.pos = oldPos;
      return false;
    }
    pos++;
  } else {
    //
    // Link reference
    //
    if (typeof state.env.references === 'undefined') { return false; }

    // [foo]  [bar]
    //      ^^ optional whitespace (can include newlines)
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (code !== 0x20 && code !== 0x0A) { break; }
    }

    if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
      start = pos + 1;
      pos = parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = labelEnd + 1;
      }
    } else {
      pos = labelEnd + 1;
    }

    // covers label === '' and label === undefined
    // (collapsed reference link and shortcut reference link respectively)
    if (!label) { label = state.src.slice(labelStart, labelEnd); }

    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }

  //
  // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //
  if (!silent) {
    state.pos = labelStart;
    state.posMax = labelEnd;

    state.push({
      type: 'link_open',
      href: href,
      target: '',
      title: title,
      level: state.level++
    });
    state.md.inline.tokenize(state);
    state.push({ type: 'link_close', level: --state.level });
  }

  state.pos = pos;
  state.posMax = max;
  return true;
};

},{"../common/utils":36,"../helpers/parse_link_destination":38,"../helpers/parse_link_label":39,"../helpers/parse_link_title":40}],77:[function(require,module,exports){
// Proceess '\n'

'use strict';

module.exports = function newline(state, silent) {
  var pmax, max, pos = state.pos;

  if (state.src.charCodeAt(pos) !== 0x0A/* \n */) { return false; }

  pmax = state.pending.length - 1;
  max = state.posMax;

  // '  \n' -> hardbreak
  // Lookup in pending chars is bad practice! Don't copy to other rules!
  // Pending string is stored in concat mode, indexed lookups will cause
  // convertion to flat mode.
  if (!silent) {
    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 0x20) {
      if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 0x20) {
        state.pending = state.pending.replace(/ +$/, '');
        state.push({
          type: 'hardbreak',
          level: state.level
        });
      } else {
        state.pending = state.pending.slice(0, -1);
        state.push({
          type: 'softbreak',
          level: state.level
        });
      }

    } else {
      state.push({
        type: 'softbreak',
        level: state.level
      });
    }
  }

  pos++;

  // skip heading spaces for next line
  while (pos < max && state.src.charCodeAt(pos) === 0x20) { pos++; }

  state.pos = pos;
  return true;
};

},{}],78:[function(require,module,exports){
// Inline parser state

'use strict';


function StateInline(src, md, env, outTokens) {
  this.src = src;
  this.env = env;
  this.md = md;
  this.tokens = outTokens;

  this.pos = 0;
  this.posMax = this.src.length;
  this.level = 0;
  this.pending = '';
  this.pendingLevel = 0;

  this.cache = [];        // Stores { start: end } pairs. Useful for backtrack
                          // optimization of pairs parse (emphasis, strikes).
}


// Flush pending text
//
StateInline.prototype.pushPending = function () {
  this.tokens.push({
    type: 'text',
    content: this.pending,
    level: this.pendingLevel
  });
  this.pending = '';
};


// Push new token to "stream".
// If pending text exists - flush it as text token
//
StateInline.prototype.push = function (token) {
  if (this.pending) {
    this.pushPending();
  }

  this.tokens.push(token);
  this.pendingLevel = this.level;
};


// Store value to cache.
// !!! Implementation has parser-specific optimizations
// !!! keys MUST be integer, >= 0; values MUST be integer, > 0
//
StateInline.prototype.cacheSet = function (key, val) {
  for (var i = this.cache.length; i <= key; i++) {
    this.cache.push(0);
  }

  this.cache[key] = val;
};


// Get cache value
//
StateInline.prototype.cacheGet = function (key) {
  return key < this.cache.length ? this.cache[key] : 0;
};


module.exports = StateInline;

},{}],79:[function(require,module,exports){
// ~~strike through~~
//
'use strict';


var isWhiteSpace   = require('../common/utils').isWhiteSpace;
var isPunctChar    = require('../common/utils').isPunctChar;
var isMdAsciiPunct = require('../common/utils').isMdAsciiPunct;


// parse sequence of markers,
// "start" should point at a valid marker
function scanDelims(state, start) {
  var pos = start, lastChar, nextChar, count,
      isLastWhiteSpace, isLastPunctChar,
      isNextWhiteSpace, isNextPunctChar,
      can_open = true,
      can_close = true,
      max = state.posMax,
      marker = state.src.charCodeAt(start);

  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : -1;

  while (pos < max && state.src.charCodeAt(pos) === marker) { pos++; }
  if (pos >= max) { can_open = false; }
  count = pos - start;

  nextChar = pos < max ? state.src.charCodeAt(pos) : -1;

  isLastPunctChar = lastChar >= 0 &&
    (isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar)));
  isNextPunctChar = nextChar >= 0 &&
    (isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar)));
  isLastWhiteSpace = lastChar >= 0 && isWhiteSpace(lastChar);
  isNextWhiteSpace = nextChar >= 0 && isWhiteSpace(nextChar);

  if (isNextWhiteSpace) {
    can_open = false;
  } else if (isNextPunctChar) {
    if (!(isLastWhiteSpace || isLastPunctChar || lastChar === -1)) {
      can_open = false;
    }
  }

  if (isLastWhiteSpace) {
    can_close = false;
  } else if (isLastPunctChar) {
    if (!(isNextWhiteSpace || isNextPunctChar || nextChar === -1)) {
      can_close = false;
    }
  }

  return {
    can_open: can_open,
    can_close: can_close,
    delims: count
  };
}


module.exports = function strikethrough(state, silent) {
  var startCount,
      count,
      tagCount,
      found,
      stack,
      res,
      max = state.posMax,
      start = state.pos,
      marker = state.src.charCodeAt(start);

  if (marker !== 0x7E/* ~ */) { return false; }
  if (silent) { return false; } // don't run any pairs in validation mode

  res = scanDelims(state, start);
  startCount = res.delims;
  if (!res.can_open) {
    state.pos += startCount;
    // Earlier we checked !silent, but this implementation does not need it
    state.pending += state.src.slice(start, state.pos);
    return true;
  }

  stack = Math.floor(startCount / 2);
  if (stack <= 0) { return false; }
  state.pos = start + startCount;

  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === marker) {
      res = scanDelims(state, state.pos);
      count = res.delims;
      tagCount = Math.floor(count / 2);
      if (res.can_close) {
        if (tagCount >= stack) {
          state.pos += count - 2;
          found = true;
          break;
        }
        stack -= tagCount;
        state.pos += count;
        continue;
      }

      if (res.can_open) { stack += tagCount; }
      state.pos += count;
      continue;
    }

    state.md.inline.skipToken(state);
  }

  if (!found) {
    // parser failed to find ending tag, so it's not valid emphasis
    state.pos = start;
    return false;
  }

  // found!
  state.posMax = state.pos;
  state.pos = start + 2;

  // Earlier we checked !silent, but this implementation does not need it
  state.push({ type: 's_open', level: state.level++ });
  state.md.inline.tokenize(state);
  state.push({ type: 's_close', level: --state.level });

  state.pos = state.posMax + 2;
  state.posMax = max;
  return true;
};

},{"../common/utils":36}],80:[function(require,module,exports){
// Skip text characters for text token, place those to pending buffer
// and increment current pos

'use strict';


// Rule to skip pure text
// '{}$%@~+=:' reserved for extentions

// !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~

// !!!! Don't confuse with "Markdown ASCII Punctuation" chars
// http://spec.commonmark.org/0.15/#ascii-punctuation-character
function isTerminatorChar(ch) {
  switch (ch) {
    case 0x0A/* \n */:
    case 0x21/* ! */:
    case 0x23/* # */:
    case 0x24/* $ */:
    case 0x25/* % */:
    case 0x26/* & */:
    case 0x2A/* * */:
    case 0x2B/* + */:
    case 0x2D/* - */:
    case 0x3A/* : */:
    case 0x3C/* < */:
    case 0x3D/* = */:
    case 0x3E/* > */:
    case 0x40/* @ */:
    case 0x5B/* [ */:
    case 0x5C/* \ */:
    case 0x5D/* ] */:
    case 0x5E/* ^ */:
    case 0x5F/* _ */:
    case 0x60/* ` */:
    case 0x7B/* { */:
    case 0x7D/* } */:
    case 0x7E/* ~ */:
      return true;
    default:
      return false;
  }
}

module.exports = function text(state, silent) {
  var pos = state.pos;

  while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
    pos++;
  }

  if (pos === state.pos) { return false; }

  if (!silent) { state.pending += state.src.slice(state.pos, pos); }

  state.pos = pos;

  return true;
};

},{}],81:[function(require,module,exports){
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function () {
      return (root.returnExportsGlobal = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['Autolinker'] = factory();
  }
}(this, function () {

	/*!
	 * Autolinker.js
	 * 0.15.2
	 *
	 * Copyright(c) 2015 Gregory Jacobs <greg@greg-jacobs.com>
	 * MIT Licensed. http://www.opensource.org/licenses/mit-license.php
	 *
	 * https://github.com/gregjacobs/Autolinker.js
	 */
	/**
	 * @class Autolinker
	 * @extends Object
	 * 
	 * Utility class used to process a given string of text, and wrap the URLs, email addresses, and Twitter handles in 
	 * the appropriate anchor (&lt;a&gt;) tags to turn them into links.
	 * 
	 * Any of the configuration options may be provided in an Object (map) provided to the Autolinker constructor, which
	 * will configure how the {@link #link link()} method will process the links.
	 * 
	 * For example:
	 * 
	 *     var autolinker = new Autolinker( {
	 *         newWindow : false,
	 *         truncate  : 30
	 *     } );
	 *     
	 *     var html = autolinker.link( "Joe went to www.yahoo.com" );
	 *     // produces: 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>'
	 * 
	 * 
	 * The {@link #static-link static link()} method may also be used to inline options into a single call, which may
	 * be more convenient for one-off uses. For example:
	 * 
	 *     var html = Autolinker.link( "Joe went to www.yahoo.com", {
	 *         newWindow : false,
	 *         truncate  : 30
	 *     } );
	 *     // produces: 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>'
	 * 
	 * 
	 * ## Custom Replacements of Links
	 * 
	 * If the configuration options do not provide enough flexibility, a {@link #replaceFn} may be provided to fully customize
	 * the output of Autolinker. This function is called once for each URL/Email/Twitter handle match that is encountered.
	 * 
	 * For example:
	 * 
	 *     var input = "...";  // string with URLs, Email Addresses, and Twitter Handles
	 *     
	 *     var linkedText = Autolinker.link( input, {
	 *         replaceFn : function( autolinker, match ) {
	 *             console.log( "href = ", match.getAnchorHref() );
	 *             console.log( "text = ", match.getAnchorText() );
	 *         
	 *             switch( match.getType() ) {
	 *                 case 'url' : 
	 *                     console.log( "url: ", match.getUrl() );
	 *                     
	 *                     if( match.getUrl().indexOf( 'mysite.com' ) === -1 ) {
	 *                         var tag = autolinker.getTagBuilder().build( match );  // returns an `Autolinker.HtmlTag` instance, which provides mutator methods for easy changes
	 *                         tag.setAttr( 'rel', 'nofollow' );
	 *                         tag.addClass( 'external-link' );
	 *                         
	 *                         return tag;
	 *                         
	 *                     } else {
	 *                         return true;  // let Autolinker perform its normal anchor tag replacement
	 *                     }
	 *                     
	 *                 case 'email' :
	 *                     var email = match.getEmail();
	 *                     console.log( "email: ", email );
	 *                     
	 *                     if( email === "my@own.address" ) {
	 *                         return false;  // don't auto-link this particular email address; leave as-is
	 *                     } else {
	 *                         return;  // no return value will have Autolinker perform its normal anchor tag replacement (same as returning `true`)
	 *                     }
	 *                 
	 *                 case 'twitter' :
	 *                     var twitterHandle = match.getTwitterHandle();
	 *                     console.log( twitterHandle );
	 *                     
	 *                     return '<a href="http://newplace.to.link.twitter.handles.to/">' + twitterHandle + '</a>';
	 *             }
	 *         }
	 *     } );
	 * 
	 * 
	 * The function may return the following values:
	 * 
	 * - `true` (Boolean): Allow Autolinker to replace the match as it normally would.
	 * - `false` (Boolean): Do not replace the current match at all - leave as-is.
	 * - Any String: If a string is returned from the function, the string will be used directly as the replacement HTML for
	 *   the match.
	 * - An {@link Autolinker.HtmlTag} instance, which can be used to build/modify an HTML tag before writing out its HTML text.
	 * 
	 * @constructor
	 * @param {Object} [config] The configuration options for the Autolinker instance, specified in an Object (map).
	 */
	var Autolinker = function( cfg ) {
		Autolinker.Util.assign( this, cfg );  // assign the properties of `cfg` onto the Autolinker instance. Prototype properties will be used for missing configs.

		this.matchValidator = new Autolinker.MatchValidator();
	};


	Autolinker.prototype = {
		constructor : Autolinker,  // fix constructor property

		/**
		 * @cfg {Boolean} urls
		 * 
		 * `true` if miscellaneous URLs should be automatically linked, `false` if they should not be.
		 */
		urls : true,

		/**
		 * @cfg {Boolean} email
		 * 
		 * `true` if email addresses should be automatically linked, `false` if they should not be.
		 */
		email : true,

		/**
		 * @cfg {Boolean} twitter
		 * 
		 * `true` if Twitter handles ("@example") should be automatically linked, `false` if they should not be.
		 */
		twitter : true,

		/**
		 * @cfg {Boolean} newWindow
		 * 
		 * `true` if the links should open in a new window, `false` otherwise.
		 */
		newWindow : true,

		/**
		 * @cfg {Boolean} stripPrefix
		 * 
		 * `true` if 'http://' or 'https://' and/or the 'www.' should be stripped from the beginning of URL links' text, 
		 * `false` otherwise.
		 */
		stripPrefix : true,

		/**
		 * @cfg {Number} truncate
		 * 
		 * A number for how many characters long URLs/emails/twitter handles should be truncated to inside the text of 
		 * a link. If the URL/email/twitter is over this number of characters, it will be truncated to this length by 
		 * adding a two period ellipsis ('..') to the end of the string.
		 * 
		 * For example: A url like 'http://www.yahoo.com/some/long/path/to/a/file' truncated to 25 characters might look
		 * something like this: 'yahoo.com/some/long/pat..'
		 */

		/**
		 * @cfg {String} className
		 * 
		 * A CSS class name to add to the generated links. This class will be added to all links, as well as this class
		 * plus url/email/twitter suffixes for styling url/email/twitter links differently.
		 * 
		 * For example, if this config is provided as "myLink", then:
		 * 
		 * - URL links will have the CSS classes: "myLink myLink-url"
		 * - Email links will have the CSS classes: "myLink myLink-email", and
		 * - Twitter links will have the CSS classes: "myLink myLink-twitter"
		 */
		className : "",

		/**
		 * @cfg {Function} replaceFn
		 * 
		 * A function to individually process each URL/Email/Twitter match found in the input string.
		 * 
		 * See the class's description for usage.
		 * 
		 * This function is called with the following parameters:
		 * 
		 * @cfg {Autolinker} replaceFn.autolinker The Autolinker instance, which may be used to retrieve child objects from (such
		 *   as the instance's {@link #getTagBuilder tag builder}).
		 * @cfg {Autolinker.match.Match} replaceFn.match The Match instance which can be used to retrieve information about the
		 *   {@link Autolinker.match.Url URL}/{@link Autolinker.match.Email email}/{@link Autolinker.match.Twitter Twitter}
		 *   match that the `replaceFn` is currently processing.
		 */


		/**
		 * @private
		 * @property {RegExp} htmlCharacterEntitiesRegex
		 *
		 * The regular expression that matches common HTML character entities.
		 * 
		 * Ignoring &amp; as it could be part of a query string -- handling it separately.
		 */
		htmlCharacterEntitiesRegex: /(&nbsp;|&#160;|&lt;|&#60;|&gt;|&#62;|&quot;|&#34;|&#39;)/gi,

		/**
		 * @private
		 * @property {RegExp} matcherRegex
		 * 
		 * The regular expression that matches URLs, email addresses, and Twitter handles.
		 * 
		 * This regular expression has the following capturing groups:
		 * 
		 * 1. Group that is used to determine if there is a Twitter handle match (i.e. \@someTwitterUser). Simply check for its 
		 *    existence to determine if there is a Twitter handle match. The next couple of capturing groups give information 
		 *    about the Twitter handle match.
		 * 2. The whitespace character before the \@sign in a Twitter handle. This is needed because there are no lookbehinds in
		 *    JS regular expressions, and can be used to reconstruct the original string in a replace().
		 * 3. The Twitter handle itself in a Twitter match. If the match is '@someTwitterUser', the handle is 'someTwitterUser'.
		 * 4. Group that matches an email address. Used to determine if the match is an email address, as well as holding the full 
		 *    address. Ex: 'me@my.com'
		 * 5. Group that matches a URL in the input text. Ex: 'http://google.com', 'www.google.com', or just 'google.com'.
		 *    This also includes a path, url parameters, or hash anchors. Ex: google.com/path/to/file?q1=1&q2=2#myAnchor
		 * 6. Group that matches a protocol URL (i.e. 'http://google.com'). This is used to match protocol URLs with just a single
		 *    word, like 'http://localhost', where we won't double check that the domain name has at least one '.' in it.
		 * 7. A protocol-relative ('//') match for the case of a 'www.' prefixed URL. Will be an empty string if it is not a 
		 *    protocol-relative match. We need to know the character before the '//' in order to determine if it is a valid match
		 *    or the // was in a string we don't want to auto-link.
		 * 8. A protocol-relative ('//') match for the case of a known TLD prefixed URL. Will be an empty string if it is not a 
		 *    protocol-relative match. See #6 for more info. 
		 */
		matcherRegex : (function() {
			var twitterRegex = /(^|[^\w])@(\w{1,15})/,              // For matching a twitter handle. Ex: @gregory_jacobs

			    emailRegex = /(?:[\-;:&=\+\$,\w\.]+@)/,             // something@ for email addresses (a.k.a. local-part)

			    protocolRegex = /(?:[A-Za-z][-.+A-Za-z0-9]+:(?![A-Za-z][-.+A-Za-z0-9]+:\/\/)(?!\d+\/?)(?:\/\/)?)/,  // match protocol, allow in format "http://" or "mailto:". However, do not match the first part of something like 'link:http://www.google.com' (i.e. don't match "link:"). Also, make sure we don't interpret 'google.com:8000' as if 'google.com' was a protocol here (i.e. ignore a trailing port number in this regex)
			    wwwRegex = /(?:www\.)/,                             // starting with 'www.'
			    domainNameRegex = /[A-Za-z0-9\.\-]*[A-Za-z0-9\-]/,  // anything looking at all like a domain, non-unicode domains, not ending in a period
			    tldRegex = /\.(?:international|construction|contractors|enterprises|photography|productions|foundation|immobilien|industries|management|properties|technology|christmas|community|directory|education|equipment|institute|marketing|solutions|vacations|bargains|boutique|builders|catering|cleaning|clothing|computer|democrat|diamonds|graphics|holdings|lighting|partners|plumbing|supplies|training|ventures|academy|careers|company|cruises|domains|exposed|flights|florist|gallery|guitars|holiday|kitchen|neustar|okinawa|recipes|rentals|reviews|shiksha|singles|support|systems|agency|berlin|camera|center|coffee|condos|dating|estate|events|expert|futbol|kaufen|luxury|maison|monash|museum|nagoya|photos|repair|report|social|supply|tattoo|tienda|travel|viajes|villas|vision|voting|voyage|actor|build|cards|cheap|codes|dance|email|glass|house|mango|ninja|parts|photo|shoes|solar|today|tokyo|tools|watch|works|aero|arpa|asia|best|bike|blue|buzz|camp|club|cool|coop|farm|fish|gift|guru|info|jobs|kiwi|kred|land|limo|link|menu|mobi|moda|name|pics|pink|post|qpon|rich|ruhr|sexy|tips|vote|voto|wang|wien|wiki|zone|bar|bid|biz|cab|cat|ceo|com|edu|gov|int|kim|mil|net|onl|org|pro|pub|red|tel|uno|wed|xxx|xyz|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw)\b/,   // match our known top level domains (TLDs)

			    // Allow optional path, query string, and hash anchor, not ending in the following characters: "?!:,.;"
			    // http://blog.codinghorror.com/the-problem-with-urls/
			    urlSuffixRegex = /[\-A-Za-z0-9+&@#\/%=~_()|'$*\[\]?!:,.;]*[\-A-Za-z0-9+&@#\/%=~_()|'$*\[\]]/;

			return new RegExp( [
				'(',  // *** Capturing group $1, which can be used to check for a twitter handle match. Use group $3 for the actual twitter handle though. $2 may be used to reconstruct the original string in a replace() 
					// *** Capturing group $2, which matches the whitespace character before the '@' sign (needed because of no lookbehinds), and 
					// *** Capturing group $3, which matches the actual twitter handle
					twitterRegex.source,
				')',

				'|',

				'(',  // *** Capturing group $4, which is used to determine an email match
					emailRegex.source,
					domainNameRegex.source,
					tldRegex.source,
				')',

				'|',

				'(',  // *** Capturing group $5, which is used to match a URL
					'(?:', // parens to cover match for protocol (optional), and domain
						'(',  // *** Capturing group $6, for a protocol-prefixed url (ex: http://google.com)
							protocolRegex.source,
							domainNameRegex.source,
						')',

						'|',

						'(?:',  // non-capturing paren for a 'www.' prefixed url (ex: www.google.com)
							'(.?//)?',  // *** Capturing group $7 for an optional protocol-relative URL. Must be at the beginning of the string or start with a non-word character
							wwwRegex.source,
							domainNameRegex.source,
						')',

						'|',

						'(?:',  // non-capturing paren for known a TLD url (ex: google.com)
							'(.?//)?',  // *** Capturing group $8 for an optional protocol-relative URL. Must be at the beginning of the string or start with a non-word character
							domainNameRegex.source,
							tldRegex.source,
						')',
					')',

					'(?:' + urlSuffixRegex.source + ')?',  // match for path, query string, and/or hash anchor - optional
				')'
			].join( "" ), 'gi' );
		} )(),

		/**
		 * @private
		 * @property {RegExp} charBeforeProtocolRelMatchRegex
		 * 
		 * The regular expression used to retrieve the character before a protocol-relative URL match.
		 * 
		 * This is used in conjunction with the {@link #matcherRegex}, which needs to grab the character before a protocol-relative
		 * '//' due to the lack of a negative look-behind in JavaScript regular expressions. The character before the match is stripped
		 * from the URL.
		 */
		charBeforeProtocolRelMatchRegex : /^(.)?\/\//,

		/**
		 * @private
		 * @property {Autolinker.MatchValidator} matchValidator
		 * 
		 * The MatchValidator object, used to filter out any false positives from the {@link #matcherRegex}. See
		 * {@link Autolinker.MatchValidator} for details.
		 */

		/**
		 * @private
		 * @property {Autolinker.HtmlParser} htmlParser
		 * 
		 * The HtmlParser instance used to skip over HTML tags, while finding text nodes to process. This is lazily instantiated
		 * in the {@link #getHtmlParser} method.
		 */

		/**
		 * @private
		 * @property {Autolinker.AnchorTagBuilder} tagBuilder
		 * 
		 * The AnchorTagBuilder instance used to build the URL/email/Twitter replacement anchor tags. This is lazily instantiated
		 * in the {@link #getTagBuilder} method.
		 */


		/**
		 * Automatically links URLs, email addresses, and Twitter handles found in the given chunk of HTML. 
		 * Does not link URLs found within HTML tags.
		 * 
		 * For instance, if given the text: `You should go to http://www.yahoo.com`, then the result
		 * will be `You should go to &lt;a href="http://www.yahoo.com"&gt;http://www.yahoo.com&lt;/a&gt;`
		 * 
		 * This method finds the text around any HTML elements in the input `textOrHtml`, which will be the text that is processed.
		 * Any original HTML elements will be left as-is, as well as the text that is already wrapped in anchor (&lt;a&gt;) tags.
		 * 
		 * @param {String} textOrHtml The HTML or text to link URLs, email addresses, and Twitter handles within (depending on if
		 *   the {@link #urls}, {@link #email}, and {@link #twitter} options are enabled).
		 * @return {String} The HTML, with URLs/emails/Twitter handles automatically linked.
		 */
		link : function( textOrHtml ) {
			var me = this,  // for closure
			    htmlParser = this.getHtmlParser(),
			    htmlCharacterEntitiesRegex = this.htmlCharacterEntitiesRegex,
			    anchorTagStackCount = 0,  // used to only process text around anchor tags, and any inner text/html they may have
			    resultHtml = [];

			htmlParser.parse( textOrHtml, {
				// Process HTML nodes in the input `textOrHtml`
				processHtmlNode : function( tagText, tagName, isClosingTag ) {
					if( tagName === 'a' ) {
						if( !isClosingTag ) {  // it's the start <a> tag
							anchorTagStackCount++;
						} else {   // it's the end </a> tag
							anchorTagStackCount = Math.max( anchorTagStackCount - 1, 0 );  // attempt to handle extraneous </a> tags by making sure the stack count never goes below 0
						}
					}
					resultHtml.push( tagText );  // now add the text of the tag itself verbatim
				},

				// Process text nodes in the input `textOrHtml`
				processTextNode : function( text ) {
					if( anchorTagStackCount === 0 ) {
						// If we're not within an <a> tag, process the text node
						var unescapedText = Autolinker.Util.splitAndCapture( text, htmlCharacterEntitiesRegex );  // split at HTML entities, but include the HTML entities in the results array

						for ( var i = 0, len = unescapedText.length; i < len; i++ ) {
							var textToProcess = unescapedText[ i ],
							    processedTextNode = me.processTextNode( textToProcess );

							resultHtml.push( processedTextNode );
						}

					} else {
						// `text` is within an <a> tag, simply append the text - we do not want to autolink anything 
						// already within an <a>...</a> tag
						resultHtml.push( text );
					}
				}
			} );

			return resultHtml.join( "" );
		},


		/**
		 * Lazily instantiates and returns the {@link #htmlParser} instance for this Autolinker instance.
		 * 
		 * @protected
		 * @return {Autolinker.HtmlParser}
		 */
		getHtmlParser : function() {
			var htmlParser = this.htmlParser;

			if( !htmlParser ) {
				htmlParser = this.htmlParser = new Autolinker.HtmlParser();
			}

			return htmlParser;
		},


		/**
		 * Returns the {@link #tagBuilder} instance for this Autolinker instance, lazily instantiating it
		 * if it does not yet exist.
		 * 
		 * This method may be used in a {@link #replaceFn} to generate the {@link Autolinker.HtmlTag HtmlTag} instance that 
		 * Autolinker would normally generate, and then allow for modifications before returning it. For example:
		 * 
		 *     var html = Autolinker.link( "Test google.com", {
		 *         replaceFn : function( autolinker, match ) {
		 *             var tag = autolinker.getTagBuilder().build( match );  // returns an {@link Autolinker.HtmlTag} instance
		 *             tag.setAttr( 'rel', 'nofollow' );
		 *             
		 *             return tag;
		 *         }
		 *     } );
		 *     
		 *     // generated html:
		 *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>
		 * 
		 * @return {Autolinker.AnchorTagBuilder}
		 */
		getTagBuilder : function() {
			var tagBuilder = this.tagBuilder;

			if( !tagBuilder ) {
				tagBuilder = this.tagBuilder = new Autolinker.AnchorTagBuilder( {
					newWindow   : this.newWindow,
					truncate    : this.truncate,
					className   : this.className
				} );
			}

			return tagBuilder;
		},


		/**
		 * Process the text that lies inbetween HTML tags. This method does the actual wrapping of URLs with
		 * anchor tags.
		 * 
		 * @private
		 * @param {String} text The text to auto-link.
		 * @return {String} The text with anchor tags auto-filled.
		 */
		processTextNode : function( text ) {
			var me = this;  // for closure

			return text.replace( this.matcherRegex, function( matchStr, $1, $2, $3, $4, $5, $6, $7, $8 ) {
				var matchDescObj = me.processCandidateMatch( matchStr, $1, $2, $3, $4, $5, $6, $7, $8 );  // match description object

				// Return out with no changes for match types that are disabled (url, email, twitter), or for matches that are 
				// invalid (false positives from the matcherRegex, which can't use look-behinds since they are unavailable in JS).
				if( !matchDescObj ) {
					return matchStr;

				} else {
					// Generate the replacement text for the match
					var matchReturnVal = me.createMatchReturnVal( matchDescObj.match, matchDescObj.matchStr );
					return matchDescObj.prefixStr + matchReturnVal + matchDescObj.suffixStr;
				}
			} );
		},


		/**
		 * Processes a candidate match from the {@link #matcherRegex}. 
		 * 
		 * Not all matches found by the regex are actual URL/email/Twitter matches, as determined by the {@link #matchValidator}. In
		 * this case, the method returns `null`. Otherwise, a valid Object with `prefixStr`, `match`, and `suffixStr` is returned.
		 * 
		 * @private
		 * @param {String} matchStr The full match that was found by the {@link #matcherRegex}.
		 * @param {String} twitterMatch The matched text of a Twitter handle, if the match is a Twitter match.
		 * @param {String} twitterHandlePrefixWhitespaceChar The whitespace char before the @ sign in a Twitter handle match. This 
		 *   is needed because of no lookbehinds in JS regexes, and is need to re-include the character for the anchor tag replacement.
		 * @param {String} twitterHandle The actual Twitter user (i.e the word after the @ sign in a Twitter match).
		 * @param {String} emailAddressMatch The matched email address for an email address match.
		 * @param {String} urlMatch The matched URL string for a URL match.
		 * @param {String} protocolUrlMatch The match URL string for a protocol match. Ex: 'http://yahoo.com'. This is used to match
		 *   something like 'http://localhost', where we won't double check that the domain name has at least one '.' in it.
		 * @param {String} wwwProtocolRelativeMatch The '//' for a protocol-relative match from a 'www' url, with the character that 
		 *   comes before the '//'.
		 * @param {String} tldProtocolRelativeMatch The '//' for a protocol-relative match from a TLD (top level domain) match, with 
		 *   the character that comes before the '//'.
		 *   
		 * @return {Object} A "match description object". This will be `null` if the match was invalid, or if a match type is disabled.
		 *   Otherwise, this will be an Object (map) with the following properties:
		 * @return {String} return.prefixStr The char(s) that should be prepended to the replacement string. These are char(s) that
		 *   were needed to be included from the regex match that were ignored by processing code, and should be re-inserted into 
		 *   the replacement stream.
		 * @return {String} return.suffixStr The char(s) that should be appended to the replacement string. These are char(s) that
		 *   were needed to be included from the regex match that were ignored by processing code, and should be re-inserted into 
		 *   the replacement stream.
		 * @return {String} return.matchStr The `matchStr`, fixed up to remove characters that are no longer needed (which have been
		 *   added to `prefixStr` and `suffixStr`).
		 * @return {Autolinker.match.Match} return.match The Match object that represents the match that was found.
		 */
		processCandidateMatch : function( 
			matchStr, twitterMatch, twitterHandlePrefixWhitespaceChar, twitterHandle, 
			emailAddressMatch, urlMatch, protocolUrlMatch, wwwProtocolRelativeMatch, tldProtocolRelativeMatch
		) {
			var protocolRelativeMatch = wwwProtocolRelativeMatch || tldProtocolRelativeMatch,
			    match,  // Will be an Autolinker.match.Match object

			    prefixStr = "",       // A string to use to prefix the anchor tag that is created. This is needed for the Twitter handle match
			    suffixStr = "";       // A string to suffix the anchor tag that is created. This is used if there is a trailing parenthesis that should not be auto-linked.


			// Return out with `null` for match types that are disabled (url, email, twitter), or for matches that are 
			// invalid (false positives from the matcherRegex, which can't use look-behinds since they are unavailable in JS).
			if(
				( twitterMatch && !this.twitter ) || ( emailAddressMatch && !this.email ) || ( urlMatch && !this.urls ) ||
				!this.matchValidator.isValidMatch( urlMatch, protocolUrlMatch, protocolRelativeMatch ) 
			) {
				return null;
			}

			// Handle a closing parenthesis at the end of the match, and exclude it if there is not a matching open parenthesis
			// in the match itself. 
			if( this.matchHasUnbalancedClosingParen( matchStr ) ) {
				matchStr = matchStr.substr( 0, matchStr.length - 1 );  // remove the trailing ")"
				suffixStr = ")";  // this will be added after the generated <a> tag
			}


			if( emailAddressMatch ) {
				match = new Autolinker.match.Email( { matchedText: matchStr, email: emailAddressMatch } );

			} else if( twitterMatch ) {
				// fix up the `matchStr` if there was a preceding whitespace char, which was needed to determine the match 
				// itself (since there are no look-behinds in JS regexes)
				if( twitterHandlePrefixWhitespaceChar ) {
					prefixStr = twitterHandlePrefixWhitespaceChar;
					matchStr = matchStr.slice( 1 );  // remove the prefixed whitespace char from the match
				}
				match = new Autolinker.match.Twitter( { matchedText: matchStr, twitterHandle: twitterHandle } );

			} else {  // url match
				// If it's a protocol-relative '//' match, remove the character before the '//' (which the matcherRegex needed
				// to match due to the lack of a negative look-behind in JavaScript regular expressions)
				if( protocolRelativeMatch ) {
					var charBeforeMatch = protocolRelativeMatch.match( this.charBeforeProtocolRelMatchRegex )[ 1 ] || "";

					if( charBeforeMatch ) {  // fix up the `matchStr` if there was a preceding char before a protocol-relative match, which was needed to determine the match itself (since there are no look-behinds in JS regexes)
						prefixStr = charBeforeMatch;
						matchStr = matchStr.slice( 1 );  // remove the prefixed char from the match
					}
				}

				match = new Autolinker.match.Url( {
					matchedText : matchStr,
					url : matchStr,
					protocolUrlMatch : !!protocolUrlMatch,
					protocolRelativeMatch : !!protocolRelativeMatch,
					stripPrefix : this.stripPrefix
				} );
			}

			return {
				prefixStr : prefixStr,
				suffixStr : suffixStr,
				matchStr  : matchStr,
				match     : match
			};
		},


		/**
		 * Determines if a match found has an unmatched closing parenthesis. If so, this parenthesis will be removed
		 * from the match itself, and appended after the generated anchor tag in {@link #processTextNode}.
		 * 
		 * A match may have an extra closing parenthesis at the end of the match because the regular expression must include parenthesis
		 * for URLs such as "wikipedia.com/something_(disambiguation)", which should be auto-linked. 
		 * 
		 * However, an extra parenthesis *will* be included when the URL itself is wrapped in parenthesis, such as in the case of
		 * "(wikipedia.com/something_(disambiguation))". In this case, the last closing parenthesis should *not* be part of the URL 
		 * itself, and this method will return `true`.
		 * 
		 * @private
		 * @param {String} matchStr The full match string from the {@link #matcherRegex}.
		 * @return {Boolean} `true` if there is an unbalanced closing parenthesis at the end of the `matchStr`, `false` otherwise.
		 */
		matchHasUnbalancedClosingParen : function( matchStr ) {
			var lastChar = matchStr.charAt( matchStr.length - 1 );

			if( lastChar === ')' ) {
				var openParensMatch = matchStr.match( /\(/g ),
				    closeParensMatch = matchStr.match( /\)/g ),
				    numOpenParens = ( openParensMatch && openParensMatch.length ) || 0,
				    numCloseParens = ( closeParensMatch && closeParensMatch.length ) || 0;

				if( numOpenParens < numCloseParens ) {
					return true;
				}
			}

			return false;
		},


		/**
		 * Creates the return string value for a given match in the input string, for the {@link #processTextNode} method.
		 * 
		 * This method handles the {@link #replaceFn}, if one was provided.
		 * 
		 * @private
		 * @param {Autolinker.match.Match} match The Match object that represents the match.
		 * @param {String} matchStr The original match string, after having been preprocessed to fix match edge cases (see
		 *   the `prefixStr` and `suffixStr` vars in {@link #processTextNode}.
		 * @return {String} The string that the `match` should be replaced with. This is usually the anchor tag string, but
		 *   may be the `matchStr` itself if the match is not to be replaced.
		 */
		createMatchReturnVal : function( match, matchStr ) {
			// Handle a custom `replaceFn` being provided
			var replaceFnResult;
			if( this.replaceFn ) {
				replaceFnResult = this.replaceFn.call( this, this, match );  // Autolinker instance is the context, and the first arg
			}

			if( typeof replaceFnResult === 'string' ) {
				return replaceFnResult;  // `replaceFn` returned a string, use that

			} else if( replaceFnResult === false ) {
				return matchStr;  // no replacement for the match

			} else if( replaceFnResult instanceof Autolinker.HtmlTag ) {
				return replaceFnResult.toString();

			} else {  // replaceFnResult === true, or no/unknown return value from function
				// Perform Autolinker's default anchor tag generation
				var tagBuilder = this.getTagBuilder(),
				    anchorTag = tagBuilder.build( match );  // returns an Autolinker.HtmlTag instance

				return anchorTag.toString();
			}
		}

	};


	/**
	 * Automatically links URLs, email addresses, and Twitter handles found in the given chunk of HTML. 
	 * Does not link URLs found within HTML tags.
	 * 
	 * For instance, if given the text: `You should go to http://www.yahoo.com`, then the result
	 * will be `You should go to &lt;a href="http://www.yahoo.com"&gt;http://www.yahoo.com&lt;/a&gt;`
	 * 
	 * Example:
	 * 
	 *     var linkedText = Autolinker.link( "Go to google.com", { newWindow: false } );
	 *     // Produces: "Go to <a href="http://google.com">google.com</a>"
	 * 
	 * @static
	 * @param {String} textOrHtml The HTML or text to find URLs, email addresses, and Twitter handles within (depending on if
	 *   the {@link #urls}, {@link #email}, and {@link #twitter} options are enabled).
	 * @param {Object} [options] Any of the configuration options for the Autolinker class, specified in an Object (map).
	 *   See the class description for an example call.
	 * @return {String} The HTML text, with URLs automatically linked
	 */
	Autolinker.link = function( textOrHtml, options ) {
		var autolinker = new Autolinker( options );
		return autolinker.link( textOrHtml );
	};


	// Namespace for `match` classes
	Autolinker.match = {};
	/*global Autolinker */
	/*jshint eqnull:true, boss:true */
	/**
	 * @class Autolinker.Util
	 * @singleton
	 * 
	 * A few utility methods for Autolinker.
	 */
	Autolinker.Util = {

		/**
		 * @property {Function} abstractMethod
		 * 
		 * A function object which represents an abstract method.
		 */
		abstractMethod : function() { throw "abstract"; },


		/**
		 * Assigns (shallow copies) the properties of `src` onto `dest`.
		 * 
		 * @param {Object} dest The destination object.
		 * @param {Object} src The source object.
		 * @return {Object} The destination object (`dest`)
		 */
		assign : function( dest, src ) {
			for( var prop in src ) {
				if( src.hasOwnProperty( prop ) ) {
					dest[ prop ] = src[ prop ];
				}
			}

			return dest;
		},


		/**
		 * Extends `superclass` to create a new subclass, adding the `protoProps` to the new subclass's prototype.
		 * 
		 * @param {Function} superclass The constructor function for the superclass.
		 * @param {Object} protoProps The methods/properties to add to the subclass's prototype. This may contain the
		 *   special property `constructor`, which will be used as the new subclass's constructor function.
		 * @return {Function} The new subclass function.
		 */
		extend : function( superclass, protoProps ) {
			var superclassProto = superclass.prototype;

			var F = function() {};
			F.prototype = superclassProto;

			var subclass;
			if( protoProps.hasOwnProperty( 'constructor' ) ) {
				subclass = protoProps.constructor;
			} else {
				subclass = function() { superclassProto.constructor.apply( this, arguments ); };
			}

			var subclassProto = subclass.prototype = new F();  // set up prototype chain
			subclassProto.constructor = subclass;  // fix constructor property
			subclassProto.superclass = superclassProto;

			delete protoProps.constructor;  // don't re-assign constructor property to the prototype, since a new function may have been created (`subclass`), which is now already there
			Autolinker.Util.assign( subclassProto, protoProps );

			return subclass;
		},


		/**
		 * Truncates the `str` at `len - ellipsisChars.length`, and adds the `ellipsisChars` to the
		 * end of the string (by default, two periods: '..'). If the `str` length does not exceed 
		 * `len`, the string will be returned unchanged.
		 * 
		 * @param {String} str The string to truncate and add an ellipsis to.
		 * @param {Number} truncateLen The length to truncate the string at.
		 * @param {String} [ellipsisChars=..] The ellipsis character(s) to add to the end of `str`
		 *   when truncated. Defaults to '..'
		 */
		ellipsis : function( str, truncateLen, ellipsisChars ) {
			if( str.length > truncateLen ) {
				ellipsisChars = ( ellipsisChars == null ) ? '..' : ellipsisChars;
				str = str.substring( 0, truncateLen - ellipsisChars.length ) + ellipsisChars;
			}
			return str;
		},


		/**
		 * Supports `Array.prototype.indexOf()` functionality for old IE (IE8 and below).
		 * 
		 * @param {Array} arr The array to find an element of.
		 * @param {*} element The element to find in the array, and return the index of.
		 * @return {Number} The index of the `element`, or -1 if it was not found.
		 */
		indexOf : function( arr, element ) {
			if( Array.prototype.indexOf ) {
				return arr.indexOf( element );

			} else {
				for( var i = 0, len = arr.length; i < len; i++ ) {
					if( arr[ i ] === element ) return i;
				}
				return -1;
			}
		},



		/**
		 * Performs the functionality of what modern browsers do when `String.prototype.split()` is called
		 * with a regular expression that contains capturing parenthesis.
		 * 
		 * For example:
		 * 
		 *     // Modern browsers: 
		 *     "a,b,c".split( /(,)/ );  // --> [ 'a', ',', 'b', ',', 'c' ]
		 *     
		 *     // Old IE (including IE8):
		 *     "a,b,c".split( /(,)/ );  // --> [ 'a', 'b', 'c' ]
		 *     
		 * This method emulates the functionality of modern browsers for the old IE case.
		 * 
		 * @param {String} str The string to split.
		 * @param {RegExp} splitRegex The regular expression to split the input `str` on. The splitting
		 *   character(s) will be spliced into the array, as in the "modern browsers" example in the 
		 *   description of this method. 
		 *   Note #1: the supplied regular expression **must** have the 'g' flag specified.
		 *   Note #2: for simplicity's sake, the regular expression does not need 
		 *   to contain capturing parenthesis - it will be assumed that any match has them.
		 * @return {String[]} The split array of strings, with the splitting character(s) included.
		 */
		splitAndCapture : function( str, splitRegex ) {
			if( !splitRegex.global ) throw new Error( "`splitRegex` must have the 'g' flag set" );

			var result = [],
			    lastIdx = 0,
			    match;

			while( match = splitRegex.exec( str ) ) {
				result.push( str.substring( lastIdx, match.index ) );
				result.push( match[ 0 ] );  // push the splitting char(s)

				lastIdx = match.index + match[ 0 ].length;
			}
			result.push( str.substring( lastIdx ) );

			return result;
		}

	};
	/*global Autolinker */
	/**
	 * @private
	 * @class Autolinker.HtmlParser
	 * @extends Object
	 * 
	 * An HTML parser implementation which simply walks an HTML string and calls the provided visitor functions to process 
	 * HTML and text nodes.
	 * 
	 * Autolinker uses this to only link URLs/emails/Twitter handles within text nodes, basically ignoring HTML tags.
	 */
	Autolinker.HtmlParser = Autolinker.Util.extend( Object, {

		/**
		 * @private
		 * @property {RegExp} htmlRegex
		 * 
		 * The regular expression used to pull out HTML tags from a string. Handles namespaced HTML tags and
		 * attribute names, as specified by http://www.w3.org/TR/html-markup/syntax.html.
		 * 
		 * Capturing groups:
		 * 
		 * 1. The "!DOCTYPE" tag name, if a tag is a &lt;!DOCTYPE&gt; tag.
		 * 2. If it is an end tag, this group will have the '/'.
		 * 3. The tag name for all tags (other than the &lt;!DOCTYPE&gt; tag)
		 */
		htmlRegex : (function() {
			var tagNameRegex = /[0-9a-zA-Z][0-9a-zA-Z:]*/,
			    attrNameRegex = /[^\s\0"'>\/=\x01-\x1F\x7F]+/,   // the unicode range accounts for excluding control chars, and the delete char
			    attrValueRegex = /(?:"[^"]*?"|'[^']*?'|[^'"=<>`\s]+)/, // double quoted, single quoted, or unquoted attribute values
			    nameEqualsValueRegex = attrNameRegex.source + '(?:\\s*=\\s*' + attrValueRegex.source + ')?';  // optional '=[value]'

			return new RegExp( [
				// for <!DOCTYPE> tag. Ex: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">) 
				'(?:',
					'<(!DOCTYPE)',  // *** Capturing Group 1 - If it's a doctype tag

						// Zero or more attributes following the tag name
						'(?:',
							'\\s+',  // one or more whitespace chars before an attribute

							// Either:
							// A. attr="value", or 
							// B. "value" alone (To cover example doctype tag: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">) 
							'(?:', nameEqualsValueRegex, '|', attrValueRegex.source + ')',
						')*',
					'>',
				')',

				'|',

				// All other HTML tags (i.e. tags that are not <!DOCTYPE>)
				'(?:',
					'<(/)?',  // Beginning of a tag. Either '<' for a start tag, or '</' for an end tag. 
					          // *** Capturing Group 2: The slash or an empty string. Slash ('/') for end tag, empty string for start or self-closing tag.

						// *** Capturing Group 3 - The tag name
						'(' + tagNameRegex.source + ')',

						// Zero or more attributes following the tag name
						'(?:',
							'\\s+',                // one or more whitespace chars before an attribute
							nameEqualsValueRegex,  // attr="value" (with optional ="value" part)
						')*',

						'\\s*/?',  // any trailing spaces and optional '/' before the closing '>'
					'>',
				')'
			].join( "" ), 'gi' );
		} )(),


		/**
		 * Walks an HTML string, calling the `options.processHtmlNode` function for each HTML tag that is encountered, and calling
		 * the `options.processTextNode` function when each text around HTML tags is encountered.
		 * 
		 * @param {String} html The HTML to parse.
		 * @param {Object} [options] An Object (map) which may contain the following properties:
		 * 
		 * @param {Function} [options.processHtmlNode] A visitor function which allows processing of an encountered HTML node.
		 *   This function is called with the following arguments:
		 * @param {String} [options.processHtmlNode.tagText] The HTML tag text that was found.
		 * @param {String} [options.processHtmlNode.tagName] The tag name for the HTML tag that was found. Ex: 'a' for an anchor tag.
		 * @param {String} [options.processHtmlNode.isClosingTag] `true` if the tag is a closing tag (ex: &lt;/a&gt;), `false` otherwise.
		 *  
		 * @param {Function} [options.processTextNode] A visitor function which allows processing of an encountered text node.
		 *   This function is called with the following arguments:
		 * @param {String} [options.processTextNode.text] The text node that was matched.
		 */
		parse : function( html, options ) {
			options = options || {};

			var processHtmlNodeVisitor = options.processHtmlNode || function() {},
			    processTextNodeVisitor = options.processTextNode || function() {},
			    htmlRegex = this.htmlRegex,
			    currentResult,
			    lastIndex = 0;

			// Loop over the HTML string, ignoring HTML tags, and processing the text that lies between them,
			// wrapping the URLs in anchor tags
			while( ( currentResult = htmlRegex.exec( html ) ) !== null ) {
				var tagText = currentResult[ 0 ],
				    tagName = currentResult[ 1 ] || currentResult[ 3 ],  // The <!DOCTYPE> tag (ex: "!DOCTYPE"), or another tag (ex: "a") 
				    isClosingTag = !!currentResult[ 2 ],
				    inBetweenTagsText = html.substring( lastIndex, currentResult.index );

				if( inBetweenTagsText ) {
					processTextNodeVisitor( inBetweenTagsText );
				}

				processHtmlNodeVisitor( tagText, tagName.toLowerCase(), isClosingTag );

				lastIndex = currentResult.index + tagText.length;
			}

			// Process any remaining text after the last HTML element. Will process all of the text if there were no HTML elements.
			if( lastIndex < html.length ) {
				var text = html.substring( lastIndex );

				if( text ) {
					processTextNodeVisitor( text );
				}
			}
		}

	} );
	/*global Autolinker */
	/*jshint boss:true */
	/**
	 * @class Autolinker.HtmlTag
	 * @extends Object
	 * 
	 * Represents an HTML tag, which can be used to easily build/modify HTML tags programmatically.
	 * 
	 * Autolinker uses this abstraction to create HTML tags, and then write them out as strings. You may also use
	 * this class in your code, especially within a {@link Autolinker#replaceFn replaceFn}.
	 * 
	 * ## Examples
	 * 
	 * Example instantiation:
	 * 
	 *     var tag = new Autolinker.HtmlTag( {
	 *         tagName : 'a',
	 *         attrs   : { 'href': 'http://google.com', 'class': 'external-link' },
	 *         innerHtml : 'Google'
	 *     } );
	 *     
	 *     tag.toString();  // <a href="http://google.com" class="external-link">Google</a>
	 *     
	 *     // Individual accessor methods
	 *     tag.getTagName();                 // 'a'
	 *     tag.getAttr( 'href' );            // 'http://google.com'
	 *     tag.hasClass( 'external-link' );  // true
	 * 
	 * 
	 * Using mutator methods (which may be used in combination with instantiation config properties):
	 * 
	 *     var tag = new Autolinker.HtmlTag();
	 *     tag.setTagName( 'a' );
	 *     tag.setAttr( 'href', 'http://google.com' );
	 *     tag.addClass( 'external-link' );
	 *     tag.setInnerHtml( 'Google' );
	 *     
	 *     tag.getTagName();                 // 'a'
	 *     tag.getAttr( 'href' );            // 'http://google.com'
	 *     tag.hasClass( 'external-link' );  // true
	 *     
	 *     tag.toString();  // <a href="http://google.com" class="external-link">Google</a>
	 *     
	 * 
	 * ## Example use within a {@link Autolinker#replaceFn replaceFn}
	 * 
	 *     var html = Autolinker.link( "Test google.com", {
	 *         replaceFn : function( autolinker, match ) {
	 *             var tag = autolinker.getTagBuilder().build( match );  // returns an {@link Autolinker.HtmlTag} instance, configured with the Match's href and anchor text
	 *             tag.setAttr( 'rel', 'nofollow' );
	 *             
	 *             return tag;
	 *         }
	 *     } );
	 *     
	 *     // generated html:
	 *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>
	 *     
	 *     
	 * ## Example use with a new tag for the replacement
	 * 
	 *     var html = Autolinker.link( "Test google.com", {
	 *         replaceFn : function( autolinker, match ) {
	 *             var tag = new Autolinker.HtmlTag( {
	 *                 tagName : 'button',
	 *                 attrs   : { 'title': 'Load URL: ' + match.getAnchorHref() },
	 *                 innerHtml : 'Load URL: ' + match.getAnchorText()
	 *             } );
	 *             
	 *             return tag;
	 *         }
	 *     } );
	 *     
	 *     // generated html:
	 *     //   Test <button title="Load URL: http://google.com">Load URL: google.com</button>
	 */
	Autolinker.HtmlTag = Autolinker.Util.extend( Object, {

		/**
		 * @cfg {String} tagName
		 * 
		 * The tag name. Ex: 'a', 'button', etc.
		 * 
		 * Not required at instantiation time, but should be set using {@link #setTagName} before {@link #toString}
		 * is executed.
		 */

		/**
		 * @cfg {Object.<String, String>} attrs
		 * 
		 * An key/value Object (map) of attributes to create the tag with. The keys are the attribute names, and the
		 * values are the attribute values.
		 */

		/**
		 * @cfg {String} innerHtml
		 * 
		 * The inner HTML for the tag. 
		 * 
		 * Note the camel case name on `innerHtml`. Acronyms are camelCased in this utility (such as not to run into the acronym 
		 * naming inconsistency that the DOM developers created with `XMLHttpRequest`). You may alternatively use {@link #innerHTML}
		 * if you prefer, but this one is recommended.
		 */

		/**
		 * @cfg {String} innerHTML
		 * 
		 * Alias of {@link #innerHtml}, accepted for consistency with the browser DOM api, but prefer the camelCased version
		 * for acronym names.
		 */


		/**
		 * @protected
		 * @property {RegExp} whitespaceRegex
		 * 
		 * Regular expression used to match whitespace in a string of CSS classes.
		 */
		whitespaceRegex : /\s+/,


		/**
		 * @constructor
		 * @param {Object} [cfg] The configuration properties for this class, in an Object (map)
		 */
		constructor : function( cfg ) {
			Autolinker.Util.assign( this, cfg );

			this.innerHtml = this.innerHtml || this.innerHTML;  // accept either the camelCased form or the fully capitalized acronym
		},


		/**
		 * Sets the tag name that will be used to generate the tag with.
		 * 
		 * @param {String} tagName
		 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
		 */
		setTagName : function( tagName ) {
			this.tagName = tagName;
			return this;
		},


		/**
		 * Retrieves the tag name.
		 * 
		 * @return {String}
		 */
		getTagName : function() {
			return this.tagName || "";
		},


		/**
		 * Sets an attribute on the HtmlTag.
		 * 
		 * @param {String} attrName The attribute name to set.
		 * @param {String} attrValue The attribute value to set.
		 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
		 */
		setAttr : function( attrName, attrValue ) {
			var tagAttrs = this.getAttrs();
			tagAttrs[ attrName ] = attrValue;

			return this;
		},


		/**
		 * Retrieves an attribute from the HtmlTag. If the attribute does not exist, returns `undefined`.
		 * 
		 * @param {String} name The attribute name to retrieve.
		 * @return {String} The attribute's value, or `undefined` if it does not exist on the HtmlTag.
		 */
		getAttr : function( attrName ) {
			return this.getAttrs()[ attrName ];
		},


		/**
		 * Sets one or more attributes on the HtmlTag.
		 * 
		 * @param {Object.<String, String>} attrs A key/value Object (map) of the attributes to set.
		 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
		 */
		setAttrs : function( attrs ) {
			var tagAttrs = this.getAttrs();
			Autolinker.Util.assign( tagAttrs, attrs );

			return this;
		},


		/**
		 * Retrieves the attributes Object (map) for the HtmlTag.
		 * 
		 * @return {Object.<String, String>} A key/value object of the attributes for the HtmlTag.
		 */
		getAttrs : function() {
			return this.attrs || ( this.attrs = {} );
		},


		/**
		 * Sets the provided `cssClass`, overwriting any current CSS classes on the HtmlTag.
		 * 
		 * @param {String} cssClass One or more space-separated CSS classes to set (overwrite).
		 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
		 */
		setClass : function( cssClass ) {
			return this.setAttr( 'class', cssClass );
		},


		/**
		 * Convenience method to add one or more CSS classes to the HtmlTag. Will not add duplicate CSS classes.
		 * 
		 * @param {String} cssClass One or more space-separated CSS classes to add.
		 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
		 */
		addClass : function( cssClass ) {
			var classAttr = this.getClass(),
			    whitespaceRegex = this.whitespaceRegex,
			    indexOf = Autolinker.Util.indexOf,  // to support IE8 and below
			    classes = ( !classAttr ) ? [] : classAttr.split( whitespaceRegex ),
			    newClasses = cssClass.split( whitespaceRegex ),
			    newClass;

			while( newClass = newClasses.shift() ) {
				if( indexOf( classes, newClass ) === -1 ) {
					classes.push( newClass );
				}
			}

			this.getAttrs()[ 'class' ] = classes.join( " " );
			return this;
		},


		/**
		 * Convenience method to remove one or more CSS classes from the HtmlTag.
		 * 
		 * @param {String} cssClass One or more space-separated CSS classes to remove.
		 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
		 */
		removeClass : function( cssClass ) {
			var classAttr = this.getClass(),
			    whitespaceRegex = this.whitespaceRegex,
			    indexOf = Autolinker.Util.indexOf,  // to support IE8 and below
			    classes = ( !classAttr ) ? [] : classAttr.split( whitespaceRegex ),
			    removeClasses = cssClass.split( whitespaceRegex ),
			    removeClass;

			while( classes.length && ( removeClass = removeClasses.shift() ) ) {
				var idx = indexOf( classes, removeClass );
				if( idx !== -1 ) {
					classes.splice( idx, 1 );
				}
			}

			this.getAttrs()[ 'class' ] = classes.join( " " );
			return this;
		},


		/**
		 * Convenience method to retrieve the CSS class(es) for the HtmlTag, which will each be separated by spaces when
		 * there are multiple.
		 * 
		 * @return {String}
		 */
		getClass : function() {
			return this.getAttrs()[ 'class' ] || "";
		},


		/**
		 * Convenience method to check if the tag has a CSS class or not.
		 * 
		 * @param {String} cssClass The CSS class to check for.
		 * @return {Boolean} `true` if the HtmlTag has the CSS class, `false` otherwise.
		 */
		hasClass : function( cssClass ) {
			return ( ' ' + this.getClass() + ' ' ).indexOf( ' ' + cssClass + ' ' ) !== -1;
		},


		/**
		 * Sets the inner HTML for the tag.
		 * 
		 * @param {String} html The inner HTML to set.
		 * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
		 */
		setInnerHtml : function( html ) {
			this.innerHtml = html;

			return this;
		},


		/**
		 * Retrieves the inner HTML for the tag.
		 * 
		 * @return {String}
		 */
		getInnerHtml : function() {
			return this.innerHtml || "";
		},


		/**
		 * Override of superclass method used to generate the HTML string for the tag.
		 * 
		 * @return {String}
		 */
		toString : function() {
			var tagName = this.getTagName(),
			    attrsStr = this.buildAttrsStr();

			attrsStr = ( attrsStr ) ? ' ' + attrsStr : '';  // prepend a space if there are actually attributes

			return [ '<', tagName, attrsStr, '>', this.getInnerHtml(), '</', tagName, '>' ].join( "" );
		},


		/**
		 * Support method for {@link #toString}, returns the string space-separated key="value" pairs, used to populate 
		 * the stringified HtmlTag.
		 * 
		 * @protected
		 * @return {String} Example return: `attr1="value1" attr2="value2"`
		 */
		buildAttrsStr : function() {
			if( !this.attrs ) return "";  // no `attrs` Object (map) has been set, return empty string

			var attrs = this.getAttrs(),
			    attrsArr = [];

			for( var prop in attrs ) {
				if( attrs.hasOwnProperty( prop ) ) {
					attrsArr.push( prop + '="' + attrs[ prop ] + '"' );
				}
			}
			return attrsArr.join( " " );
		}

	} );
	/*global Autolinker */
	/*jshint scripturl:true */
	/**
	 * @private
	 * @class Autolinker.MatchValidator
	 * @extends Object
	 * 
	 * Used by Autolinker to filter out false positives from the {@link Autolinker#matcherRegex}.
	 * 
	 * Due to the limitations of regular expressions (including the missing feature of look-behinds in JS regular expressions),
	 * we cannot always determine the validity of a given match. This class applies a bit of additional logic to filter out any
	 * false positives that have been matched by the {@link Autolinker#matcherRegex}.
	 */
	Autolinker.MatchValidator = Autolinker.Util.extend( Object, {

		/**
		 * @private
		 * @property {RegExp} invalidProtocolRelMatchRegex
		 * 
		 * The regular expression used to check a potential protocol-relative URL match, coming from the 
		 * {@link Autolinker#matcherRegex}. A protocol-relative URL is, for example, "//yahoo.com"
		 * 
		 * This regular expression checks to see if there is a word character before the '//' match in order to determine if 
		 * we should actually autolink a protocol-relative URL. This is needed because there is no negative look-behind in 
		 * JavaScript regular expressions. 
		 * 
		 * For instance, we want to autolink something like "Go to: //google.com", but we don't want to autolink something 
		 * like "abc//google.com"
		 */
		invalidProtocolRelMatchRegex : /^[\w]\/\//,

		/**
		 * Regex to test for a full protocol, with the two trailing slashes. Ex: 'http://'
		 * 
		 * @private
		 * @property {RegExp} hasFullProtocolRegex
		 */
		hasFullProtocolRegex : /^[A-Za-z][-.+A-Za-z0-9]+:\/\//,

		/**
		 * Regex to find the URI scheme, such as 'mailto:'.
		 * 
		 * This is used to filter out 'javascript:' and 'vbscript:' schemes.
		 * 
		 * @private
		 * @property {RegExp} uriSchemeRegex
		 */
		uriSchemeRegex : /^[A-Za-z][-.+A-Za-z0-9]+:/,

		/**
		 * Regex to determine if at least one word char exists after the protocol (i.e. after the ':')
		 * 
		 * @private
		 * @property {RegExp} hasWordCharAfterProtocolRegex
		 */
		hasWordCharAfterProtocolRegex : /:[^\s]*?[A-Za-z]/,


		/**
		 * Determines if a given match found by {@link Autolinker#processTextNode} is valid. Will return `false` for:
		 * 
		 * 1) URL matches which do not have at least have one period ('.') in the domain name (effectively skipping over 
		 *    matches like "abc:def"). However, URL matches with a protocol will be allowed (ex: 'http://localhost')
		 * 2) URL matches which do not have at least one word character in the domain name (effectively skipping over
		 *    matches like "git:1.0").
		 * 3) A protocol-relative url match (a URL beginning with '//') whose previous character is a word character 
		 *    (effectively skipping over strings like "abc//google.com")
		 * 
		 * Otherwise, returns `true`.
		 * 
		 * @param {String} urlMatch The matched URL, if there was one. Will be an empty string if the match is not a URL match.
		 * @param {String} protocolUrlMatch The match URL string for a protocol match. Ex: 'http://yahoo.com'. This is used to match
		 *   something like 'http://localhost', where we won't double check that the domain name has at least one '.' in it.
		 * @param {String} protocolRelativeMatch The protocol-relative string for a URL match (i.e. '//'), possibly with a preceding
		 *   character (ex, a space, such as: ' //', or a letter, such as: 'a//'). The match is invalid if there is a word character
		 *   preceding the '//'.
		 * @return {Boolean} `true` if the match given is valid and should be processed, or `false` if the match is invalid and/or 
		 *   should just not be processed.
		 */
		isValidMatch : function( urlMatch, protocolUrlMatch, protocolRelativeMatch ) {
			if(
				( protocolUrlMatch && !this.isValidUriScheme( protocolUrlMatch ) ) ||
				this.urlMatchDoesNotHaveProtocolOrDot( urlMatch, protocolUrlMatch ) ||       // At least one period ('.') must exist in the URL match for us to consider it an actual URL, *unless* it was a full protocol match (like 'http://localhost')
				this.urlMatchDoesNotHaveAtLeastOneWordChar( urlMatch, protocolUrlMatch ) ||  // At least one letter character must exist in the domain name after a protocol match. Ex: skip over something like "git:1.0"
				this.isInvalidProtocolRelativeMatch( protocolRelativeMatch )                 // A protocol-relative match which has a word character in front of it (so we can skip something like "abc//google.com")
			) {
				return false;
			}

			return true;
		},


		/**
		 * Determines if the URI scheme is a valid scheme to be autolinked. Returns `false` if the scheme is 
		 * 'javascript:' or 'vbscript:'
		 * 
		 * @private
		 * @param {String} uriSchemeMatch The match URL string for a full URI scheme match. Ex: 'http://yahoo.com' 
		 *   or 'mailto:a@a.com'.
		 * @return {Boolean} `true` if the scheme is a valid one, `false` otherwise.
		 */
		isValidUriScheme : function( uriSchemeMatch ) {
			var uriScheme = uriSchemeMatch.match( this.uriSchemeRegex )[ 0 ];

			return ( uriScheme !== 'javascript:' && uriScheme !== 'vbscript:' );
		},


		/**
		 * Determines if a URL match does not have either:
		 * 
		 * a) a full protocol (i.e. 'http://'), or
		 * b) at least one dot ('.') in the domain name (for a non-full-protocol match).
		 * 
		 * Either situation is considered an invalid URL (ex: 'git:d' does not have either the '://' part, or at least one dot
		 * in the domain name. If the match was 'git:abc.com', we would consider this valid.)
		 * 
		 * @private
		 * @param {String} urlMatch The matched URL, if there was one. Will be an empty string if the match is not a URL match.
		 * @param {String} protocolUrlMatch The match URL string for a protocol match. Ex: 'http://yahoo.com'. This is used to match
		 *   something like 'http://localhost', where we won't double check that the domain name has at least one '.' in it.
		 * @return {Boolean} `true` if the URL match does not have a full protocol, or at least one dot ('.') in a non-full-protocol
		 *   match.
		 */
		urlMatchDoesNotHaveProtocolOrDot : function( urlMatch, protocolUrlMatch ) {
			return ( !!urlMatch && ( !protocolUrlMatch || !this.hasFullProtocolRegex.test( protocolUrlMatch ) ) && urlMatch.indexOf( '.' ) === -1 );
		},


		/**
		 * Determines if a URL match does not have at least one word character after the protocol (i.e. in the domain name).
		 * 
		 * At least one letter character must exist in the domain name after a protocol match. Ex: skip over something 
		 * like "git:1.0"
		 * 
		 * @private
		 * @param {String} urlMatch The matched URL, if there was one. Will be an empty string if the match is not a URL match.
		 * @param {String} protocolUrlMatch The match URL string for a protocol match. Ex: 'http://yahoo.com'. This is used to
		 *   know whether or not we have a protocol in the URL string, in order to check for a word character after the protocol
		 *   separator (':').
		 * @return {Boolean} `true` if the URL match does not have at least one word character in it after the protocol, `false`
		 *   otherwise.
		 */
		urlMatchDoesNotHaveAtLeastOneWordChar : function( urlMatch, protocolUrlMatch ) {
			if( urlMatch && protocolUrlMatch ) {
				return !this.hasWordCharAfterProtocolRegex.test( urlMatch );
			} else {
				return false;
			}
		},


		/**
		 * Determines if a protocol-relative match is an invalid one. This method returns `true` if there is a `protocolRelativeMatch`,
		 * and that match contains a word character before the '//' (i.e. it must contain whitespace or nothing before the '//' in
		 * order to be considered valid).
		 * 
		 * @private
		 * @param {String} protocolRelativeMatch The protocol-relative string for a URL match (i.e. '//'), possibly with a preceding
		 *   character (ex, a space, such as: ' //', or a letter, such as: 'a//'). The match is invalid if there is a word character
		 *   preceding the '//'.
		 * @return {Boolean} `true` if it is an invalid protocol-relative match, `false` otherwise.
		 */
		isInvalidProtocolRelativeMatch : function( protocolRelativeMatch ) {
			return ( !!protocolRelativeMatch && this.invalidProtocolRelMatchRegex.test( protocolRelativeMatch ) );
		}

	} );
	/*global Autolinker */
	/*jshint sub:true */
	/**
	 * @protected
	 * @class Autolinker.AnchorTagBuilder
	 * @extends Object
	 * 
	 * Builds anchor (&lt;a&gt;) tags for the Autolinker utility when a match is found.
	 * 
	 * Normally this class is instantiated, configured, and used internally by an {@link Autolinker} instance, but may 
	 * actually be retrieved in a {@link Autolinker#replaceFn replaceFn} to create {@link Autolinker.HtmlTag HtmlTag} instances
	 * which may be modified before returning from the {@link Autolinker#replaceFn replaceFn}. For example:
	 * 
	 *     var html = Autolinker.link( "Test google.com", {
	 *         replaceFn : function( autolinker, match ) {
	 *             var tag = autolinker.getTagBuilder().build( match );  // returns an {@link Autolinker.HtmlTag} instance
	 *             tag.setAttr( 'rel', 'nofollow' );
	 *             
	 *             return tag;
	 *         }
	 *     } );
	 *     
	 *     // generated html:
	 *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>
	 */
	Autolinker.AnchorTagBuilder = Autolinker.Util.extend( Object, {

		/**
		 * @cfg {Boolean} newWindow
		 * @inheritdoc Autolinker#newWindow
		 */

		/**
		 * @cfg {Number} truncate
		 * @inheritdoc Autolinker#truncate
		 */

		/**
		 * @cfg {String} className
		 * @inheritdoc Autolinker#className
		 */


		/**
		 * @constructor
		 * @param {Object} [cfg] The configuration options for the AnchorTagBuilder instance, specified in an Object (map).
		 */
		constructor : function( cfg ) {
			Autolinker.Util.assign( this, cfg );
		},


		/**
		 * Generates the actual anchor (&lt;a&gt;) tag to use in place of the matched URL/email/Twitter text,
		 * via its `match` object.
		 * 
		 * @param {Autolinker.match.Match} match The Match instance to generate an anchor tag from.
		 * @return {Autolinker.HtmlTag} The HtmlTag instance for the anchor tag.
		 */
		build : function( match ) {
			var tag = new Autolinker.HtmlTag( {
				tagName   : 'a',
				attrs     : this.createAttrs( match.getType(), match.getAnchorHref() ),
				innerHtml : this.processAnchorText( match.getAnchorText() )
			} );

			return tag;
		},


		/**
		 * Creates the Object (map) of the HTML attributes for the anchor (&lt;a&gt;) tag being generated.
		 * 
		 * @protected
		 * @param {"url"/"email"/"twitter"} matchType The type of match that an anchor tag is being generated for.
		 * @param {String} href The href for the anchor tag.
		 * @return {Object} A key/value Object (map) of the anchor tag's attributes. 
		 */
		createAttrs : function( matchType, anchorHref ) {
			var attrs = {
				'href' : anchorHref  // we'll always have the `href` attribute
			};

			var cssClass = this.createCssClass( matchType );
			if( cssClass ) {
				attrs[ 'class' ] = cssClass;
			}
			if( this.newWindow ) {
				attrs[ 'target' ] = "_blank";
			}

			return attrs;
		},


		/**
		 * Creates the CSS class that will be used for a given anchor tag, based on the `matchType` and the {@link #className}
		 * config.
		 * 
		 * @private
		 * @param {"url"/"email"/"twitter"} matchType The type of match that an anchor tag is being generated for.
		 * @return {String} The CSS class string for the link. Example return: "myLink myLink-url". If no {@link #className}
		 *   was configured, returns an empty string.
		 */
		createCssClass : function( matchType ) {
			var className = this.className;

			if( !className ) 
				return "";
			else
				return className + " " + className + "-" + matchType;  // ex: "myLink myLink-url", "myLink myLink-email", or "myLink myLink-twitter"
		},


		/**
		 * Processes the `anchorText` by truncating the text according to the {@link #truncate} config.
		 * 
		 * @private
		 * @param {String} anchorText The anchor tag's text (i.e. what will be displayed).
		 * @return {String} The processed `anchorText`.
		 */
		processAnchorText : function( anchorText ) {
			anchorText = this.doTruncate( anchorText );

			return anchorText;
		},


		/**
		 * Performs the truncation of the `anchorText`, if the `anchorText` is longer than the {@link #truncate} option.
		 * Truncates the text to 2 characters fewer than the {@link #truncate} option, and adds ".." to the end.
		 * 
		 * @private
		 * @param {String} text The anchor tag's text (i.e. what will be displayed).
		 * @return {String} The truncated anchor text.
		 */
		doTruncate : function( anchorText ) {
			return Autolinker.Util.ellipsis( anchorText, this.truncate || Number.POSITIVE_INFINITY );
		}

	} );
	/*global Autolinker */
	/**
	 * @abstract
	 * @class Autolinker.match.Match
	 * 
	 * Represents a match found in an input string which should be Autolinked. A Match object is what is provided in a 
	 * {@link Autolinker#replaceFn replaceFn}, and may be used to query for details about the match.
	 * 
	 * For example:
	 * 
	 *     var input = "...";  // string with URLs, Email Addresses, and Twitter Handles
	 *     
	 *     var linkedText = Autolinker.link( input, {
	 *         replaceFn : function( autolinker, match ) {
	 *             console.log( "href = ", match.getAnchorHref() );
	 *             console.log( "text = ", match.getAnchorText() );
	 *         
	 *             switch( match.getType() ) {
	 *                 case 'url' : 
	 *                     console.log( "url: ", match.getUrl() );
	 *                     
	 *                 case 'email' :
	 *                     console.log( "email: ", match.getEmail() );
	 *                     
	 *                 case 'twitter' :
	 *                     console.log( "twitter: ", match.getTwitterHandle() );
	 *             }
	 *         }
	 *     } );
	 *     
	 * See the {@link Autolinker} class for more details on using the {@link Autolinker#replaceFn replaceFn}.
	 */
	Autolinker.match.Match = Autolinker.Util.extend( Object, {

		/**
		 * @cfg {String} matchedText (required)
		 * 
		 * The original text that was matched.
		 */


		/**
		 * @constructor
		 * @param {Object} cfg The configuration properties for the Match instance, specified in an Object (map).
		 */
		constructor : function( cfg ) {
			Autolinker.Util.assign( this, cfg );
		},


		/**
		 * Returns a string name for the type of match that this class represents.
		 * 
		 * @abstract
		 * @return {String}
		 */
		getType : Autolinker.Util.abstractMethod,


		/**
		 * Returns the original text that was matched.
		 * 
		 * @return {String}
		 */
		getMatchedText : function() {
			return this.matchedText;
		},


		/**
		 * Returns the anchor href that should be generated for the match.
		 * 
		 * @abstract
		 * @return {String}
		 */
		getAnchorHref : Autolinker.Util.abstractMethod,


		/**
		 * Returns the anchor text that should be generated for the match.
		 * 
		 * @abstract
		 * @return {String}
		 */
		getAnchorText : Autolinker.Util.abstractMethod

	} );
	/*global Autolinker */
	/**
	 * @class Autolinker.match.Email
	 * @extends Autolinker.match.Match
	 * 
	 * Represents a Email match found in an input string which should be Autolinked.
	 * 
	 * See this class's superclass ({@link Autolinker.match.Match}) for more details.
	 */
	Autolinker.match.Email = Autolinker.Util.extend( Autolinker.match.Match, {

		/**
		 * @cfg {String} email (required)
		 * 
		 * The email address that was matched.
		 */


		/**
		 * Returns a string name for the type of match that this class represents.
		 * 
		 * @return {String}
		 */
		getType : function() {
			return 'email';
		},


		/**
		 * Returns the email address that was matched.
		 * 
		 * @return {String}
		 */
		getEmail : function() {
			return this.email;
		},


		/**
		 * Returns the anchor href that should be generated for the match.
		 * 
		 * @return {String}
		 */
		getAnchorHref : function() {
			return 'mailto:' + this.email;
		},


		/**
		 * Returns the anchor text that should be generated for the match.
		 * 
		 * @return {String}
		 */
		getAnchorText : function() {
			return this.email;
		}

	} );
	/*global Autolinker */
	/**
	 * @class Autolinker.match.Twitter
	 * @extends Autolinker.match.Match
	 * 
	 * Represents a Twitter match found in an input string which should be Autolinked.
	 * 
	 * See this class's superclass ({@link Autolinker.match.Match}) for more details.
	 */
	Autolinker.match.Twitter = Autolinker.Util.extend( Autolinker.match.Match, {

		/**
		 * @cfg {String} twitterHandle (required)
		 * 
		 * The Twitter handle that was matched.
		 */


		/**
		 * Returns the type of match that this class represents.
		 * 
		 * @return {String}
		 */
		getType : function() {
			return 'twitter';
		},


		/**
		 * Returns a string name for the type of match that this class represents.
		 * 
		 * @return {String}
		 */
		getTwitterHandle : function() {
			return this.twitterHandle;
		},


		/**
		 * Returns the anchor href that should be generated for the match.
		 * 
		 * @return {String}
		 */
		getAnchorHref : function() {
			return 'https://twitter.com/' + this.twitterHandle;
		},


		/**
		 * Returns the anchor text that should be generated for the match.
		 * 
		 * @return {String}
		 */
		getAnchorText : function() {
			return '@' + this.twitterHandle;
		}

	} );
	/*global Autolinker */
	/**
	 * @class Autolinker.match.Url
	 * @extends Autolinker.match.Match
	 * 
	 * Represents a Url match found in an input string which should be Autolinked.
	 * 
	 * See this class's superclass ({@link Autolinker.match.Match}) for more details.
	 */
	Autolinker.match.Url = Autolinker.Util.extend( Autolinker.match.Match, {

		/**
		 * @cfg {String} url (required)
		 * 
		 * The url that was matched.
		 */

		/**
		 * @cfg {Boolean} protocolUrlMatch (required)
		 * 
		 * `true` if the URL is a match which already has a protocol (i.e. 'http://'), `false` if the match was from a 'www' or
		 * known TLD match.
		 */

		/**
		 * @cfg {Boolean} protocolRelativeMatch (required)
		 * 
		 * `true` if the URL is a protocol-relative match. A protocol-relative match is a URL that starts with '//',
		 * and will be either http:// or https:// based on the protocol that the site is loaded under.
		 */

		/**
		 * @cfg {Boolean} stripPrefix (required)
		 * @inheritdoc Autolinker#stripPrefix
		 */


		/**
		 * @private
		 * @property {RegExp} urlPrefixRegex
		 * 
		 * A regular expression used to remove the 'http://' or 'https://' and/or the 'www.' from URLs.
		 */
		urlPrefixRegex: /^(https?:\/\/)?(www\.)?/i,

		/**
		 * @private
		 * @property {RegExp} protocolRelativeRegex
		 * 
		 * The regular expression used to remove the protocol-relative '//' from the {@link #url} string, for purposes
		 * of {@link #getAnchorText}. A protocol-relative URL is, for example, "//yahoo.com"
		 */
		protocolRelativeRegex : /^\/\//,

		/**
		 * @private
		 * @property {Boolean} protocolPrepended
		 * 
		 * Will be set to `true` if the 'http://' protocol has been prepended to the {@link #url} (because the
		 * {@link #url} did not have a protocol)
		 */
		protocolPrepended : false,


		/**
		 * Returns a string name for the type of match that this class represents.
		 * 
		 * @return {String}
		 */
		getType : function() {
			return 'url';
		},


		/**
		 * Returns the url that was matched, assuming the protocol to be 'http://' if the original
		 * match was missing a protocol.
		 * 
		 * @return {String}
		 */
		getUrl : function() {
			var url = this.url;

			// if the url string doesn't begin with a protocol, assume 'http://'
			if( !this.protocolRelativeMatch && !this.protocolUrlMatch && !this.protocolPrepended ) {
				url = this.url = 'http://' + url;

				this.protocolPrepended = true;
			}

			return url;
		},


		/**
		 * Returns the anchor href that should be generated for the match.
		 * 
		 * @return {String}
		 */
		getAnchorHref : function() {
			var url = this.getUrl();

			return url.replace( /&amp;/g, '&' );  // any &amp;'s in the URL should be converted back to '&' if they were displayed as &amp; in the source html 
		},


		/**
		 * Returns the anchor text that should be generated for the match.
		 * 
		 * @return {String}
		 */
		getAnchorText : function() {
			var anchorText = this.getUrl();

			if( this.protocolRelativeMatch ) {
				// Strip off any protocol-relative '//' from the anchor text
				anchorText = this.stripProtocolRelativePrefix( anchorText );
			}
			if( this.stripPrefix ) {
				anchorText = this.stripUrlPrefix( anchorText );
			}
			anchorText = this.removeTrailingSlash( anchorText );  // remove trailing slash, if there is one

			return anchorText;
		},


		// ---------------------------------------

		// Utility Functionality

		/**
		 * Strips the URL prefix (such as "http://" or "https://") from the given text.
		 * 
		 * @private
		 * @param {String} text The text of the anchor that is being generated, for which to strip off the
		 *   url prefix (such as stripping off "http://")
		 * @return {String} The `anchorText`, with the prefix stripped.
		 */
		stripUrlPrefix : function( text ) {
			return text.replace( this.urlPrefixRegex, '' );
		},


		/**
		 * Strips any protocol-relative '//' from the anchor text.
		 * 
		 * @private
		 * @param {String} text The text of the anchor that is being generated, for which to strip off the
		 *   protocol-relative prefix (such as stripping off "//")
		 * @return {String} The `anchorText`, with the protocol-relative prefix stripped.
		 */
		stripProtocolRelativePrefix : function( text ) {
			return text.replace( this.protocolRelativeRegex, '' );
		},


		/**
		 * Removes any trailing slash from the given `anchorText`, in preparation for the text to be displayed.
		 * 
		 * @private
		 * @param {String} anchorText The text of the anchor that is being generated, for which to remove any trailing
		 *   slash ('/') that may exist.
		 * @return {String} The `anchorText`, with the trailing slash removed.
		 */
		removeTrailingSlash : function( anchorText ) {
			if( anchorText.charAt( anchorText.length - 1 ) === '/' ) {
				anchorText = anchorText.slice( 0, -1 );
			}
			return anchorText;
		}

	} );

	return Autolinker;


}));

},{}],82:[function(require,module,exports){
module.exports=require(28)
},{"/Users/nico/dev/megamark/node_modules/linkify-it/node_modules/uc.micro/categories/P/regex.js":28}],83:[function(require,module,exports){
'use strict';

// the majority of this file was taken from markdown-it's linkify method
// https://github.com/markdown-it/markdown-it/blob/9159018e2a446fc97eb3c6e509a8cdc4cc3c358a/lib/rules_core/linkify.js

var linkify = require('linkify-it')();

function arrayReplaceAt (a, i, middle) {
  var left = a.slice(0, i);
  var right = a.slice(i + 1);
  return left.concat(middle, right);
}

function isLinkOpen (str) {
  return /^<a[>\s]/i.test(str);
}

function isLinkClose (str) {
  return /^<\/a\s*>/i.test(str);
}

function tokenizeLinks (state, context) {
  var i;
  var j;
  var l;
  var tokens;
  var token;
  var nodes;
  var ln;
  var text;
  var pos;
  var lastPos;
  var level;
  var links;
  var htmlLinkLevel;
  var blockTokens = state.tokens;
  var html;

  for (j = 0, l = blockTokens.length; j < l; j++) {
    if (blockTokens[j].type !== 'inline') {
      continue;
    }

    tokens = blockTokens[j].children;
    htmlLinkLevel = 0;

    // we scan from the end, to keep position when new tags added.
    // use reversed logic in links start/end match
    for (i = tokens.length - 1; i >= 0; i--) {
      token = tokens[i];

      // skip content of markdown links
      if (token.type === 'link_close') {
        i--;
        while (tokens[i].level !== token.level && tokens[i].type !== 'link_open') {
          i--;
        }
        continue;
      }

      if (token.type === 'html_inline') { // skip content of html tag links
        if (isLinkOpen(token.content) && htmlLinkLevel > 0) {
          htmlLinkLevel--;
        }
        if (isLinkClose(token.content)) {
          htmlLinkLevel++;
        }
      }
      if (htmlLinkLevel > 0) {
        continue;
      }
      if (token.type !== 'text' || !linkify.test(token.content)) {
        continue;
      }

      text = token.content;
      links = linkify.match(text);
      nodes = [];
      level = token.level;
      lastPos = 0;

      for (ln = 0; ln < links.length; ln++) { // split string to nodes
        if (!state.md.inline.validateLink(links[ln].url)) {
          continue;
        }

        pos = links[ln].index;

        if (pos > lastPos) {
          level = level;
          nodes.push({
            type: 'text',
            content: text.slice(lastPos, pos),
            level: level
          });
        }

        html = null;

        context.linkifiers.some(runUserLinkifier);

        if (typeof html === 'string') {
          nodes.push({
            type: 'html_block',
            content: html,
            level: level
          });
        } else {
          nodes.push({
            type: 'link_open',
            href: links[ln].url,
            target: '',
            title: '',
            level: level++
          });
          nodes.push({
            type: 'text',
            content: links[ln].text,
            level: level
          });
          nodes.push({
            type: 'link_close',
            level: --level
          });
        }

        lastPos = links[ln].lastIndex;
      }

      if (lastPos < text.length) {
        nodes.push({
          type: 'text',
          content: text.slice(lastPos),
          level: level
        });
      }

      blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
    }
  }

  function runUserLinkifier (linkifier) {
    html = linkifier(links[ln].url, links[ln].text);
    return typeof html === 'string';
  }
}

module.exports = tokenizeLinks;

},{"linkify-it":24}]},{},[2])(2)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy5udm0vdjAuMTAuMjYvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJtYXJrZG93bi5qcyIsIm1lZ2FtYXJrLmpzIiwibm9kZV9tb2R1bGVzL2Fzc2lnbm1lbnQvYXNzaWdubWVudC5qcyIsIm5vZGVfbW9kdWxlcy9oaWdobGlnaHQtcmVkdXgvbGliL2hpZ2hsaWdodC5qcyIsIm5vZGVfbW9kdWxlcy9oaWdobGlnaHQtcmVkdXgvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2hpZ2hsaWdodC1yZWR1eC9saWIvbGFuZ3VhZ2VzL2Jhc2guanMiLCJub2RlX21vZHVsZXMvaGlnaGxpZ2h0LXJlZHV4L2xpYi9sYW5ndWFnZXMvY3NzLmpzIiwibm9kZV9tb2R1bGVzL2hpZ2hsaWdodC1yZWR1eC9saWIvbGFuZ3VhZ2VzL2h0dHAuanMiLCJub2RlX21vZHVsZXMvaGlnaGxpZ2h0LXJlZHV4L2xpYi9sYW5ndWFnZXMvaW5pLmpzIiwibm9kZV9tb2R1bGVzL2hpZ2hsaWdodC1yZWR1eC9saWIvbGFuZ3VhZ2VzL2phdmFzY3JpcHQuanMiLCJub2RlX21vZHVsZXMvaGlnaGxpZ2h0LXJlZHV4L2xpYi9sYW5ndWFnZXMvanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9oaWdobGlnaHQtcmVkdXgvbGliL2xhbmd1YWdlcy9tYXJrZG93bi5qcyIsIm5vZGVfbW9kdWxlcy9oaWdobGlnaHQtcmVkdXgvbGliL2xhbmd1YWdlcy94bWwuanMiLCJub2RlX21vZHVsZXMvaGlnaGxpZ2h0LmpzLXRva2Vucy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pbnNhbmUvYXR0cmlidXRlcy5qcyIsIm5vZGVfbW9kdWxlcy9pbnNhbmUvZGVmYXVsdHMuanMiLCJub2RlX21vZHVsZXMvaW5zYW5lL2VsZW1lbnRzLmpzIiwibm9kZV9tb2R1bGVzL2luc2FuZS9pbnNhbmUuanMiLCJub2RlX21vZHVsZXMvaW5zYW5lL2xvd2VyY2FzZS5qcyIsIm5vZGVfbW9kdWxlcy9pbnNhbmUvcGFyc2VyLmpzIiwibm9kZV9tb2R1bGVzL2luc2FuZS9zYW5pdGl6ZXIuanMiLCJub2RlX21vZHVsZXMvaW5zYW5lL3NoZS5qcyIsIm5vZGVfbW9kdWxlcy9pbnNhbmUvdG9NYXAuanMiLCJub2RlX21vZHVsZXMvbGlua2lmeS1pdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9saW5raWZ5LWl0L2xpYi9yZS5qcyIsIm5vZGVfbW9kdWxlcy9saW5raWZ5LWl0L25vZGVfbW9kdWxlcy91Yy5taWNyby9jYXRlZ29yaWVzL0NjL3JlZ2V4LmpzIiwibm9kZV9tb2R1bGVzL2xpbmtpZnktaXQvbm9kZV9tb2R1bGVzL3VjLm1pY3JvL2NhdGVnb3JpZXMvQ2YvcmVnZXguanMiLCJub2RlX21vZHVsZXMvbGlua2lmeS1pdC9ub2RlX21vZHVsZXMvdWMubWljcm8vY2F0ZWdvcmllcy9QL3JlZ2V4LmpzIiwibm9kZV9tb2R1bGVzL2xpbmtpZnktaXQvbm9kZV9tb2R1bGVzL3VjLm1pY3JvL2NhdGVnb3JpZXMvWi9yZWdleC5qcyIsIm5vZGVfbW9kdWxlcy9saW5raWZ5LWl0L25vZGVfbW9kdWxlcy91Yy5taWNyby9wcm9wZXJ0aWVzL0FueS9yZWdleC5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvY29tbW9uL2VudGl0aWVzLmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9jb21tb24vaHRtbF9ibG9ja3MuanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbGliL2NvbW1vbi9odG1sX3JlLmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9jb21tb24vdXJsX3NjaGVtYXMuanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbGliL2NvbW1vbi91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvaGVscGVycy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvaGVscGVycy9wYXJzZV9saW5rX2Rlc3RpbmF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9oZWxwZXJzL3BhcnNlX2xpbmtfbGFiZWwuanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbGliL2hlbHBlcnMvcGFyc2VfbGlua190aXRsZS5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbGliL3BhcnNlcl9ibG9jay5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvcGFyc2VyX2NvcmUuanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbGliL3BhcnNlcl9pbmxpbmUuanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbGliL3ByZXNldHMvY29tbW9ubWFyay5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvcHJlc2V0cy9kZWZhdWx0LmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9wcmVzZXRzL3plcm8uanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbGliL3JlbmRlcmVyLmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9ydWxlci5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvcnVsZXNfYmxvY2svYmxvY2txdW90ZS5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvcnVsZXNfYmxvY2svY29kZS5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvcnVsZXNfYmxvY2svZmVuY2UuanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbGliL3J1bGVzX2Jsb2NrL2hlYWRpbmcuanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbGliL3J1bGVzX2Jsb2NrL2hyLmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9ydWxlc19ibG9jay9odG1sX2Jsb2NrLmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9ydWxlc19ibG9jay9saGVhZGluZy5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvcnVsZXNfYmxvY2svbGlzdC5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvcnVsZXNfYmxvY2svcGFyYWdyYXBoLmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9ydWxlc19ibG9jay9yZWZlcmVuY2UuanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbGliL3J1bGVzX2Jsb2NrL3N0YXRlX2Jsb2NrLmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9ydWxlc19ibG9jay90YWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvcnVsZXNfY29yZS9ibG9jay5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvcnVsZXNfY29yZS9pbmxpbmUuanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbGliL3J1bGVzX2NvcmUvbGlua2lmeS5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvcnVsZXNfY29yZS9ub3JtYWxpemUuanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbGliL3J1bGVzX2NvcmUvcmVwbGFjZW1lbnRzLmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9ydWxlc19jb3JlL3NtYXJ0cXVvdGVzLmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9ydWxlc19jb3JlL3N0YXRlX2NvcmUuanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbGliL3J1bGVzX2lubGluZS9hdXRvbGluay5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvcnVsZXNfaW5saW5lL2JhY2t0aWNrcy5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvcnVsZXNfaW5saW5lL2VtcGhhc2lzLmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9ydWxlc19pbmxpbmUvZW50aXR5LmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9ydWxlc19pbmxpbmUvZXNjYXBlLmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9ydWxlc19pbmxpbmUvaHRtbF9pbmxpbmUuanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbGliL3J1bGVzX2lubGluZS9pbWFnZS5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvcnVsZXNfaW5saW5lL2xpbmsuanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbGliL3J1bGVzX2lubGluZS9uZXdsaW5lLmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9ydWxlc19pbmxpbmUvc3RhdGVfaW5saW5lLmpzIiwibm9kZV9tb2R1bGVzL21hcmtkb3duLWl0L2xpYi9ydWxlc19pbmxpbmUvc3RyaWtldGhyb3VnaC5qcyIsIm5vZGVfbW9kdWxlcy9tYXJrZG93bi1pdC9saWIvcnVsZXNfaW5saW5lL3RleHQuanMiLCJub2RlX21vZHVsZXMvbWFya2Rvd24taXQvbm9kZV9tb2R1bGVzL2F1dG9saW5rZXIvZGlzdC9BdXRvbGlua2VyLmpzIiwidG9rZW5pemVMaW5rcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUlBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0bEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzM4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBNYXJrZG93bkl0ID0gcmVxdWlyZSgnbWFya2Rvd24taXQnKTtcbnZhciBobGpzID0gcmVxdWlyZSgnaGlnaGxpZ2h0LmpzJyk7XG52YXIgdG9rZW5pemVMaW5rcyA9IHJlcXVpcmUoJy4vdG9rZW5pemVMaW5rcycpO1xudmFyIG1kID0gbmV3IE1hcmtkb3duSXQoe1xuICBodG1sOiB0cnVlLFxuICB4aHRtbE91dDogdHJ1ZSxcbiAgbGlua2lmeTogdHJ1ZSxcbiAgdHlwb2dyYXBoZXI6IHRydWUsXG4gIGxhbmdQcmVmaXg6ICdtZC1sYW5nLWFsaWFzLScsXG4gIGhpZ2hsaWdodDogaGlnaGxpZ2h0XG59KTtcbnZhciByYWxpYXMgPSAvIGNsYXNzPVwibWQtbGFuZy1hbGlhcy0oW15cIl0rKVwiLztcbnZhciBhbGlhc2VzID0ge1xuICBqczogJ2phdmFzY3JpcHQnLFxuICBtZDogJ21hcmtkb3duJyxcbiAgaHRtbDogJ3htbCcsIC8vIG5leHQgYmVzdCB0aGluZ1xuICBqYWRlOiAnY3NzJyAvLyBuZXh0IGJlc3QgdGhpbmdcbn07XG52YXIgYmFzZWJsb2NrID0gbWQucmVuZGVyZXIucnVsZXMuY29kZV9ibG9jaztcbnZhciBiYXNlaW5saW5lID0gbWQucmVuZGVyZXIucnVsZXMuY29kZV9pbmxpbmU7XG52YXIgYmFzZWZlbmNlID0gbWQucmVuZGVyZXIucnVsZXMuZmVuY2U7XG52YXIgYmFzZXRleHQgPSBtZC5yZW5kZXJlci5ydWxlcy50ZXh0O1xudmFyIHRleHRjYWNoZWQgPSB0ZXh0cGFyc2VyKFtdKTtcbnZhciBsYW5ndWFnZXMgPSBbXTtcbnZhciBjb250ZXh0ID0ge307XG5cbm1kLmNvcmUucnVsZXIuYmVmb3JlKCdsaW5raWZ5JywgJ2xpbmtpZnktdG9rZW5pemVyJywgbGlua2lmeVRva2VuaXplciwge30pO1xubWQucmVuZGVyZXIucnVsZXMuY29kZV9ibG9jayA9IGJsb2NrO1xubWQucmVuZGVyZXIucnVsZXMuY29kZV9pbmxpbmUgPSBpbmxpbmU7XG5tZC5yZW5kZXJlci5ydWxlcy5mZW5jZSA9IGZlbmNlO1xuXG5obGpzLmNvbmZpZ3VyZSh7IHRhYlJlcGxhY2U6IDIsIGNsYXNzUHJlZml4OiAnbWQtY29kZS0nIH0pO1xuXG5mdW5jdGlvbiBoaWdobGlnaHQgKGNvZGUsIGxhbmcpIHtcbiAgdmFyIGxvd2VyID0gU3RyaW5nKGxhbmcpLnRvTG93ZXJDYXNlKCk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGhsanMuaGlnaGxpZ2h0KGFsaWFzZXNbbG93ZXJdIHx8IGxvd2VyLCBjb2RlKS52YWx1ZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5mdW5jdGlvbiBibG9jayAoKSB7XG4gIHZhciBiYXNlID0gYmFzZWJsb2NrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykuc3Vic3RyKDExKTsgLy8gc3RhcnRzIHdpdGggJzxwcmU+PGNvZGU+J1xuICB2YXIgY2xhc3NlZCA9ICc8cHJlIGNsYXNzPVwibWQtY29kZS1ibG9ja1wiPjxjb2RlIGNsYXNzPVwibWQtY29kZVwiPicgKyBiYXNlO1xuICByZXR1cm4gY2xhc3NlZDtcbn1cblxuZnVuY3Rpb24gaW5saW5lICgpIHtcbiAgdmFyIGJhc2UgPSBiYXNlaW5saW5lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykuc3Vic3RyKDYpOyAvLyBzdGFydHMgd2l0aCAnPGNvZGU+J1xuICB2YXIgY2xhc3NlZCA9ICc8Y29kZSBjbGFzcz1cIm1kLWNvZGUgbWQtY29kZS1pbmxpbmVcIj4nICsgYmFzZTtcbiAgcmV0dXJuIGNsYXNzZWQ7XG59XG5cbmZ1bmN0aW9uIGZlbmNlICgpIHtcbiAgdmFyIGJhc2UgPSBiYXNlZmVuY2UuYXBwbHkodGhpcywgYXJndW1lbnRzKS5zdWJzdHIoNSk7IC8vIHN0YXJ0cyB3aXRoICc8cHJlPidcbiAgdmFyIGxhbmcgPSBiYXNlLnN1YnN0cigwLCA2KSAhPT0gJzxjb2RlPic7IC8vIHdoZW4gdGhlIGZlbmNlIGhhcyBhIGxhbmd1YWdlIGNsYXNzXG4gIHZhciByZXN0ID0gbGFuZyA/IGJhc2UgOiAnPGNvZGUgY2xhc3M9XCJtZC1jb2RlXCI+JyArIGJhc2Uuc3Vic3RyKDYpO1xuICB2YXIgY2xhc3NlZCA9ICc8cHJlIGNsYXNzPVwibWQtY29kZS1ibG9ja1wiPicgKyByZXN0O1xuICB2YXIgYWxpYXNlZCA9IGNsYXNzZWQucmVwbGFjZShyYWxpYXMsIGFsaWFzaW5nKTtcbiAgcmV0dXJuIGFsaWFzZWQ7XG59XG5cbmZ1bmN0aW9uIGFsaWFzaW5nIChhbGwsIGxhbmd1YWdlKSB7XG4gIHZhciBuYW1lID0gYWxpYXNlc1tsYW5ndWFnZV0gfHwgbGFuZ3VhZ2UgfHwgJ3Vua25vd24nO1xuICB2YXIgbGFuZyA9ICdtZC1sYW5nLScgKyBuYW1lO1xuICBpZiAobGFuZ3VhZ2VzLmluZGV4T2YobGFuZykgPT09IC0xKSB7XG4gICAgbGFuZ3VhZ2VzLnB1c2gobGFuZyk7XG4gIH1cbiAgcmV0dXJuICcgY2xhc3M9XCJtZC1jb2RlICcgKyBsYW5nICsgJ1wiJztcbn1cblxuZnVuY3Rpb24gdGV4dHBhcnNlciAodG9rZW5pemVycykge1xuICByZXR1cm4gZnVuY3Rpb24gcGFyc2VUZXh0ICgpIHtcbiAgICB2YXIgYmFzZSA9IGJhc2V0ZXh0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdmFyIGZhbmN5ID0gZmFuY2lmdWwoYmFzZSk7XG4gICAgdmFyIHRva2VuaXplZCA9IHRva2VuaXplKGZhbmN5LCB0b2tlbml6ZXJzKTtcbiAgICByZXR1cm4gdG9rZW5pemVkO1xuICB9O1xufVxuXG5mdW5jdGlvbiBmYW5jaWZ1bCAodGV4dCkge1xuICByZXR1cm4gdGV4dFxuICAgIC5yZXBsYWNlKC8tLS9nLCAnXFx1MjAxNCcpICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVtLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcIlxcc10pJy9nLCAnJDFcXHUyMDE4JykgICAgICAvLyBvcGVuaW5nIHNpbmdsZXNcbiAgICAucmVwbGFjZSgvJy9nLCAnXFx1MjAxOScpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjbG9zaW5nIHNpbmdsZXMgJiBhcG9zdHJvcGhlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcXHUyMDE4XFxzXSlcIi9nLCAnJDFcXHUyMDFjJykgLy8gb3BlbmluZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoL1wiL2csICdcXHUyMDFkJykgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNsb3NpbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC9cXC57M30vZywgJ1xcdTIwMjYnKTsgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbGxpcHNlc1xufVxuXG5mdW5jdGlvbiBsaW5raWZ5VG9rZW5pemVyIChzdGF0ZSkge1xuICB0b2tlbml6ZUxpbmtzKHN0YXRlLCBjb250ZXh0KTtcbn1cblxuZnVuY3Rpb24gdG9rZW5pemUgKHRleHQsIHRva2VuaXplcnMpIHtcbiAgcmV0dXJuIHRva2VuaXplcnMucmVkdWNlKHVzZSwgdGV4dCk7XG4gIGZ1bmN0aW9uIHVzZSAocmVzdWx0LCB0b2spIHtcbiAgICByZXR1cm4gcmVzdWx0LnJlcGxhY2UodG9rLnRva2VuLCB0b2sudHJhbnNmb3JtKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtYXJrZG93biAoaW5wdXQsIG9wdGlvbnMpIHtcbiAgdmFyIHRvayA9IG9wdGlvbnMudG9rZW5pemVycyB8fCBbXTtcbiAgdmFyIGxpbiA9IG9wdGlvbnMubGlua2lmaWVycyB8fCBbXTtcbiAgdmFyIHZhbGlkID0gaW5wdXQgPT09IG51bGwgfHwgaW5wdXQgPT09IHZvaWQgMCA/ICcnIDogU3RyaW5nKGlucHV0KTtcbiAgY29udGV4dC50b2tlbml6ZXJzID0gdG9rO1xuICBjb250ZXh0LmxpbmtpZmllcnMgPSBsaW47XG4gIG1kLnJlbmRlcmVyLnJ1bGVzLnRleHQgPSB0b2subGVuZ3RoID8gdGV4dHBhcnNlcih0b2spIDogdGV4dGNhY2hlZDtcbiAgdmFyIGh0bWwgPSBtZC5yZW5kZXIodmFsaWQpO1xuICByZXR1cm4gaHRtbDtcbn1cblxubWFya2Rvd24ucGFyc2VyID0gbWQ7XG5tYXJrZG93bi5sYW5ndWFnZXMgPSBsYW5ndWFnZXM7XG5tb2R1bGUuZXhwb3J0cyA9IG1hcmtkb3duO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5zYW5lID0gcmVxdWlyZSgnaW5zYW5lJyk7XG52YXIgYXNzaWduID0gcmVxdWlyZSgnYXNzaWdubWVudCcpO1xudmFyIG1hcmtkb3duID0gcmVxdWlyZSgnLi9tYXJrZG93bicpO1xudmFyIGhpZ2h0b2tlbnMgPSByZXF1aXJlKCdoaWdobGlnaHQuanMtdG9rZW5zJykubWFwKGNvZGVjbGFzcyk7XG5cbmZ1bmN0aW9uIGNvZGVjbGFzcyAodG9rZW4pIHtcbiAgcmV0dXJuICdtZC1jb2RlLScgKyB0b2tlbjtcbn1cblxuZnVuY3Rpb24gc2FuaXRpemUgKGh0bWwsIG9wdGlvbnMpIHtcbiAgdmFyIGNvbmZpZ3VyYXRpb24gPSBhc3NpZ24oe30sIG9wdGlvbnMsIHtcbiAgICBhbGxvd2VkQ2xhc3Nlczoge1xuICAgICAgcHJlOiBbJ21kLWNvZGUtYmxvY2snXSxcbiAgICAgIGNvZGU6IG1hcmtkb3duLmxhbmd1YWdlcyxcbiAgICAgIHNwYW46IGhpZ2h0b2tlbnNcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gaW5zYW5lKGh0bWwsIGNvbmZpZ3VyYXRpb24pO1xufVxuXG5mdW5jdGlvbiBtZWdhbWFyayAobWQsIG9wdGlvbnMpIHtcbiAgdmFyIG8gPSBvcHRpb25zIHx8IHt9O1xuICB2YXIgaHRtbCA9IG1hcmtkb3duKG1kLCBvKTtcbiAgdmFyIHNhbmUgPSBzYW5pdGl6ZShodG1sLCBvLnNhbml0aXplcik7XG4gIHJldHVybiBzYW5lO1xufVxuXG5tYXJrZG93bi5sYW5ndWFnZXMucHVzaCgnbWQtY29kZScsICdtZC1jb2RlLWlubGluZScpOyAvLyBvbmx5IHNhbml0aXppbmcgcHVycG9zZXNcbm1lZ2FtYXJrLnBhcnNlciA9IG1hcmtkb3duLnBhcnNlcjtcbm1vZHVsZS5leHBvcnRzID0gbWVnYW1hcms7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGFzc2lnbm1lbnQgKHJlc3VsdCkge1xuICB2YXIgc3RhY2sgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICB2YXIgaXRlbTtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKHN0YWNrLmxlbmd0aCkge1xuICAgIGl0ZW0gPSBzdGFjay5zaGlmdCgpO1xuICAgIGZvciAoa2V5IGluIGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHRba2V5XSA9PT0gJ29iamVjdCcgJiYgcmVzdWx0W2tleV0gJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHJlc3VsdFtrZXldKSAhPT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gYXNzaWdubWVudChyZXN1bHRba2V5XSwgaXRlbVtrZXldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRba2V5XSA9IGl0ZW1ba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc2lnbm1lbnQ7XG4iLCJ2YXIgSGlnaGxpZ2h0ID0gZnVuY3Rpb24oKSB7XG5cbiAgLyogVXRpbGl0eSBmdW5jdGlvbnMgKi9cblxuICBmdW5jdGlvbiBlc2NhcGUodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUucmVwbGFjZSgvJi9nbSwgJyZhbXA7JykucmVwbGFjZSgvPC9nbSwgJyZsdDsnKS5yZXBsYWNlKC8+L2dtLCAnJmd0OycpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGFnKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGVzdFJlKHJlLCBsZXhlbWUpIHtcbiAgICB2YXIgbWF0Y2ggPSByZSAmJiByZS5leGVjKGxleGVtZSk7XG4gICAgcmV0dXJuIG1hdGNoICYmIG1hdGNoLmluZGV4ID09IDA7XG4gIH1cblxuICBmdW5jdGlvbiBibG9ja1RleHQoYmxvY2spIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGJsb2NrLmNoaWxkTm9kZXMsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLm5vZGVUeXBlID09IDMpIHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbnMudXNlQlIgPyBub2RlLm5vZGVWYWx1ZS5yZXBsYWNlKC9cXG4vZywgJycpIDogbm9kZS5ub2RlVmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAodGFnKG5vZGUpID09ICdicicpIHtcbiAgICAgICAgcmV0dXJuICdcXG4nO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJsb2NrVGV4dChub2RlKTtcbiAgICB9KS5qb2luKCcnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJsb2NrTGFuZ3VhZ2UoYmxvY2spIHtcbiAgICB2YXIgY2xhc3NlcyA9IChibG9jay5jbGFzc05hbWUgKyAnICcgKyAoYmxvY2sucGFyZW50Tm9kZSA/IGJsb2NrLnBhcmVudE5vZGUuY2xhc3NOYW1lIDogJycpKS5zcGxpdCgvXFxzKy8pO1xuICAgIGNsYXNzZXMgPSBjbGFzc2VzLm1hcChmdW5jdGlvbihjKSB7cmV0dXJuIGMucmVwbGFjZSgvXmxhbmd1YWdlLS8sICcnKTt9KTtcbiAgICByZXR1cm4gY2xhc3Nlcy5maWx0ZXIoZnVuY3Rpb24oYykge3JldHVybiBnZXRMYW5ndWFnZShjKSB8fCBjID09ICduby1oaWdobGlnaHQnO30pWzBdO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5oZXJpdChwYXJlbnQsIG9iaikge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBrZXkgaW4gcGFyZW50KVxuICAgICAgcmVzdWx0W2tleV0gPSBwYXJlbnRba2V5XTtcbiAgICBpZiAob2JqKVxuICAgICAgZm9yICh2YXIga2V5IGluIG9iailcbiAgICAgICAgcmVzdWx0W2tleV0gPSBvYmpba2V5XTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8qIFN0cmVhbSBtZXJnaW5nICovXG5cbiAgZnVuY3Rpb24gbm9kZVN0cmVhbShub2RlKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIChmdW5jdGlvbiBfbm9kZVN0cmVhbShub2RlLCBvZmZzZXQpIHtcbiAgICAgIGZvciAodmFyIGNoaWxkID0gbm9kZS5maXJzdENoaWxkOyBjaGlsZDsgY2hpbGQgPSBjaGlsZC5uZXh0U2libGluZykge1xuICAgICAgICBpZiAoY2hpbGQubm9kZVR5cGUgPT0gMylcbiAgICAgICAgICBvZmZzZXQgKz0gY2hpbGQubm9kZVZhbHVlLmxlbmd0aDtcbiAgICAgICAgZWxzZSBpZiAodGFnKGNoaWxkKSA9PSAnYnInKVxuICAgICAgICAgIG9mZnNldCArPSAxO1xuICAgICAgICBlbHNlIGlmIChjaGlsZC5ub2RlVHlwZSA9PSAxKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgICAgZXZlbnQ6ICdzdGFydCcsXG4gICAgICAgICAgICBvZmZzZXQ6IG9mZnNldCxcbiAgICAgICAgICAgIG5vZGU6IGNoaWxkXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgb2Zmc2V0ID0gX25vZGVTdHJlYW0oY2hpbGQsIG9mZnNldCk7XG4gICAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgICAgZXZlbnQ6ICdzdG9wJyxcbiAgICAgICAgICAgIG9mZnNldDogb2Zmc2V0LFxuICAgICAgICAgICAgbm9kZTogY2hpbGRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9mZnNldDtcbiAgICB9KShub2RlLCAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VTdHJlYW1zKG9yaWdpbmFsLCBoaWdobGlnaHRlZCwgdmFsdWUpIHtcbiAgICB2YXIgcHJvY2Vzc2VkID0gMDtcbiAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgdmFyIG5vZGVTdGFjayA9IFtdO1xuXG4gICAgZnVuY3Rpb24gc2VsZWN0U3RyZWFtKCkge1xuICAgICAgaWYgKCFvcmlnaW5hbC5sZW5ndGggfHwgIWhpZ2hsaWdodGVkLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gb3JpZ2luYWwubGVuZ3RoID8gb3JpZ2luYWwgOiBoaWdobGlnaHRlZDtcbiAgICAgIH1cbiAgICAgIGlmIChvcmlnaW5hbFswXS5vZmZzZXQgIT0gaGlnaGxpZ2h0ZWRbMF0ub2Zmc2V0KSB7XG4gICAgICAgIHJldHVybiAob3JpZ2luYWxbMF0ub2Zmc2V0IDwgaGlnaGxpZ2h0ZWRbMF0ub2Zmc2V0KSA/IG9yaWdpbmFsIDogaGlnaGxpZ2h0ZWQ7XG4gICAgICB9XG5cbiAgICAgIC8qXG4gICAgICBUbyBhdm9pZCBzdGFydGluZyB0aGUgc3RyZWFtIGp1c3QgYmVmb3JlIGl0IHNob3VsZCBzdG9wIHRoZSBvcmRlciBpc1xuICAgICAgZW5zdXJlZCB0aGF0IG9yaWdpbmFsIGFsd2F5cyBzdGFydHMgZmlyc3QgYW5kIGNsb3NlcyBsYXN0OlxuXG4gICAgICBpZiAoZXZlbnQxID09ICdzdGFydCcgJiYgZXZlbnQyID09ICdzdGFydCcpXG4gICAgICAgIHJldHVybiBvcmlnaW5hbDtcbiAgICAgIGlmIChldmVudDEgPT0gJ3N0YXJ0JyAmJiBldmVudDIgPT0gJ3N0b3AnKVxuICAgICAgICByZXR1cm4gaGlnaGxpZ2h0ZWQ7XG4gICAgICBpZiAoZXZlbnQxID09ICdzdG9wJyAmJiBldmVudDIgPT0gJ3N0YXJ0JylcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsO1xuICAgICAgaWYgKGV2ZW50MSA9PSAnc3RvcCcgJiYgZXZlbnQyID09ICdzdG9wJylcbiAgICAgICAgcmV0dXJuIGhpZ2hsaWdodGVkO1xuXG4gICAgICAuLi4gd2hpY2ggaXMgY29sbGFwc2VkIHRvOlxuICAgICAgKi9cbiAgICAgIHJldHVybiBoaWdobGlnaHRlZFswXS5ldmVudCA9PSAnc3RhcnQnID8gb3JpZ2luYWwgOiBoaWdobGlnaHRlZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvcGVuKG5vZGUpIHtcbiAgICAgIGZ1bmN0aW9uIGF0dHJfc3RyKGEpIHtyZXR1cm4gJyAnICsgYS5ub2RlTmFtZSArICc9XCInICsgZXNjYXBlKGEudmFsdWUpICsgJ1wiJzt9XG4gICAgICByZXN1bHQgKz0gJzwnICsgdGFnKG5vZGUpICsgQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKG5vZGUuYXR0cmlidXRlcywgYXR0cl9zdHIpLmpvaW4oJycpICsgJz4nO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsb3NlKG5vZGUpIHtcbiAgICAgIHJlc3VsdCArPSAnPC8nICsgdGFnKG5vZGUpICsgJz4nO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlcihldmVudCkge1xuICAgICAgKGV2ZW50LmV2ZW50ID09ICdzdGFydCcgPyBvcGVuIDogY2xvc2UpKGV2ZW50Lm5vZGUpO1xuICAgIH1cblxuICAgIHdoaWxlIChvcmlnaW5hbC5sZW5ndGggfHwgaGlnaGxpZ2h0ZWQubGVuZ3RoKSB7XG4gICAgICB2YXIgc3RyZWFtID0gc2VsZWN0U3RyZWFtKCk7XG4gICAgICByZXN1bHQgKz0gZXNjYXBlKHZhbHVlLnN1YnN0cihwcm9jZXNzZWQsIHN0cmVhbVswXS5vZmZzZXQgLSBwcm9jZXNzZWQpKTtcbiAgICAgIHByb2Nlc3NlZCA9IHN0cmVhbVswXS5vZmZzZXQ7XG4gICAgICBpZiAoc3RyZWFtID09IG9yaWdpbmFsKSB7XG4gICAgICAgIC8qXG4gICAgICAgIE9uIGFueSBvcGVuaW5nIG9yIGNsb3NpbmcgdGFnIG9mIHRoZSBvcmlnaW5hbCBtYXJrdXAgd2UgZmlyc3QgY2xvc2VcbiAgICAgICAgdGhlIGVudGlyZSBoaWdobGlnaHRlZCBub2RlIHN0YWNrLCB0aGVuIHJlbmRlciB0aGUgb3JpZ2luYWwgdGFnIGFsb25nXG4gICAgICAgIHdpdGggYWxsIHRoZSBmb2xsb3dpbmcgb3JpZ2luYWwgdGFncyBhdCB0aGUgc2FtZSBvZmZzZXQgYW5kIHRoZW5cbiAgICAgICAgcmVvcGVuIGFsbCB0aGUgdGFncyBvbiB0aGUgaGlnaGxpZ2h0ZWQgc3RhY2suXG4gICAgICAgICovXG4gICAgICAgIG5vZGVTdGFjay5yZXZlcnNlKCkuZm9yRWFjaChjbG9zZSk7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICByZW5kZXIoc3RyZWFtLnNwbGljZSgwLCAxKVswXSk7XG4gICAgICAgICAgc3RyZWFtID0gc2VsZWN0U3RyZWFtKCk7XG4gICAgICAgIH0gd2hpbGUgKHN0cmVhbSA9PSBvcmlnaW5hbCAmJiBzdHJlYW0ubGVuZ3RoICYmIHN0cmVhbVswXS5vZmZzZXQgPT0gcHJvY2Vzc2VkKTtcbiAgICAgICAgbm9kZVN0YWNrLnJldmVyc2UoKS5mb3JFYWNoKG9wZW4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHN0cmVhbVswXS5ldmVudCA9PSAnc3RhcnQnKSB7XG4gICAgICAgICAgbm9kZVN0YWNrLnB1c2goc3RyZWFtWzBdLm5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5vZGVTdGFjay5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgICByZW5kZXIoc3RyZWFtLnNwbGljZSgwLCAxKVswXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQgKyBlc2NhcGUodmFsdWUuc3Vic3RyKHByb2Nlc3NlZCkpO1xuICB9XG5cbiAgLyogSW5pdGlhbGl6YXRpb24gKi9cblxuICBmdW5jdGlvbiBjb21waWxlTGFuZ3VhZ2UobGFuZ3VhZ2UpIHtcblxuICAgIGZ1bmN0aW9uIHJlU3RyKHJlKSB7XG4gICAgICAgIHJldHVybiAocmUgJiYgcmUuc291cmNlKSB8fCByZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsYW5nUmUodmFsdWUsIGdsb2JhbCkge1xuICAgICAgcmV0dXJuIFJlZ0V4cChcbiAgICAgICAgcmVTdHIodmFsdWUpLFxuICAgICAgICAnbScgKyAobGFuZ3VhZ2UuY2FzZV9pbnNlbnNpdGl2ZSA/ICdpJyA6ICcnKSArIChnbG9iYWwgPyAnZycgOiAnJylcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tcGlsZU1vZGUobW9kZSwgcGFyZW50KSB7XG4gICAgICBpZiAobW9kZS5jb21waWxlZClcbiAgICAgICAgcmV0dXJuO1xuICAgICAgbW9kZS5jb21waWxlZCA9IHRydWU7XG5cbiAgICAgIG1vZGUua2V5d29yZHMgPSBtb2RlLmtleXdvcmRzIHx8IG1vZGUuYmVnaW5LZXl3b3JkcztcbiAgICAgIGlmIChtb2RlLmtleXdvcmRzKSB7XG4gICAgICAgIHZhciBjb21waWxlZF9rZXl3b3JkcyA9IHt9O1xuXG4gICAgICAgIGZ1bmN0aW9uIGZsYXR0ZW4oY2xhc3NOYW1lLCBzdHIpIHtcbiAgICAgICAgICBpZiAobGFuZ3VhZ2UuY2FzZV9pbnNlbnNpdGl2ZSkge1xuICAgICAgICAgICAgc3RyID0gc3RyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHN0ci5zcGxpdCgnICcpLmZvckVhY2goZnVuY3Rpb24oa3cpIHtcbiAgICAgICAgICAgIHZhciBwYWlyID0ga3cuc3BsaXQoJ3wnKTtcbiAgICAgICAgICAgIGNvbXBpbGVkX2tleXdvcmRzW3BhaXJbMF1dID0gW2NsYXNzTmFtZSwgcGFpclsxXSA/IE51bWJlcihwYWlyWzFdKSA6IDFdO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBtb2RlLmtleXdvcmRzID09ICdzdHJpbmcnKSB7IC8vIHN0cmluZ1xuICAgICAgICAgIGZsYXR0ZW4oJ2tleXdvcmQnLCBtb2RlLmtleXdvcmRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhtb2RlLmtleXdvcmRzKS5mb3JFYWNoKGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIGZsYXR0ZW4oY2xhc3NOYW1lLCBtb2RlLmtleXdvcmRzW2NsYXNzTmFtZV0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIG1vZGUua2V5d29yZHMgPSBjb21waWxlZF9rZXl3b3JkcztcbiAgICAgIH1cbiAgICAgIG1vZGUubGV4ZW1lc1JlID0gbGFuZ1JlKG1vZGUubGV4ZW1lcyB8fCAvXFxiW0EtWmEtejAtOV9dK1xcYi8sIHRydWUpO1xuXG4gICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgIGlmIChtb2RlLmJlZ2luS2V5d29yZHMpIHtcbiAgICAgICAgICBtb2RlLmJlZ2luID0gbW9kZS5iZWdpbktleXdvcmRzLnNwbGl0KCcgJykuam9pbignfCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbW9kZS5iZWdpbilcbiAgICAgICAgICBtb2RlLmJlZ2luID0gL1xcQnxcXGIvO1xuICAgICAgICBtb2RlLmJlZ2luUmUgPSBsYW5nUmUobW9kZS5iZWdpbik7XG4gICAgICAgIGlmICghbW9kZS5lbmQgJiYgIW1vZGUuZW5kc1dpdGhQYXJlbnQpXG4gICAgICAgICAgbW9kZS5lbmQgPSAvXFxCfFxcYi87XG4gICAgICAgIGlmIChtb2RlLmVuZClcbiAgICAgICAgICBtb2RlLmVuZFJlID0gbGFuZ1JlKG1vZGUuZW5kKTtcbiAgICAgICAgbW9kZS50ZXJtaW5hdG9yX2VuZCA9IHJlU3RyKG1vZGUuZW5kKSB8fCAnJztcbiAgICAgICAgaWYgKG1vZGUuZW5kc1dpdGhQYXJlbnQgJiYgcGFyZW50LnRlcm1pbmF0b3JfZW5kKVxuICAgICAgICAgIG1vZGUudGVybWluYXRvcl9lbmQgKz0gKG1vZGUuZW5kID8gJ3wnIDogJycpICsgcGFyZW50LnRlcm1pbmF0b3JfZW5kO1xuICAgICAgfVxuICAgICAgaWYgKG1vZGUuaWxsZWdhbClcbiAgICAgICAgbW9kZS5pbGxlZ2FsUmUgPSBsYW5nUmUobW9kZS5pbGxlZ2FsKTtcbiAgICAgIGlmIChtb2RlLnJlbGV2YW5jZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICBtb2RlLnJlbGV2YW5jZSA9IDE7XG4gICAgICBpZiAoIW1vZGUuY29udGFpbnMpIHtcbiAgICAgICAgbW9kZS5jb250YWlucyA9IFtdO1xuICAgICAgfVxuICAgICAgdmFyIGV4cGFuZGVkX2NvbnRhaW5zID0gW107XG4gICAgICBtb2RlLmNvbnRhaW5zLmZvckVhY2goZnVuY3Rpb24oYykge1xuICAgICAgICBpZiAoYy52YXJpYW50cykge1xuICAgICAgICAgIGMudmFyaWFudHMuZm9yRWFjaChmdW5jdGlvbih2KSB7ZXhwYW5kZWRfY29udGFpbnMucHVzaChpbmhlcml0KGMsIHYpKTt9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBleHBhbmRlZF9jb250YWlucy5wdXNoKGMgPT0gJ3NlbGYnID8gbW9kZSA6IGMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG1vZGUuY29udGFpbnMgPSBleHBhbmRlZF9jb250YWlucztcbiAgICAgIG1vZGUuY29udGFpbnMuZm9yRWFjaChmdW5jdGlvbihjKSB7Y29tcGlsZU1vZGUoYywgbW9kZSk7fSk7XG5cbiAgICAgIGlmIChtb2RlLnN0YXJ0cykge1xuICAgICAgICBjb21waWxlTW9kZShtb2RlLnN0YXJ0cywgcGFyZW50KTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRlcm1pbmF0b3JzID1cbiAgICAgICAgbW9kZS5jb250YWlucy5tYXAoZnVuY3Rpb24oYykge1xuICAgICAgICAgIHJldHVybiBjLmJlZ2luS2V5d29yZHMgPyAnXFxcXC4/XFxcXGIoJyArIGMuYmVnaW4gKyAnKVxcXFxiXFxcXC4/JyA6IGMuYmVnaW47XG4gICAgICAgIH0pXG4gICAgICAgIC5jb25jYXQoW21vZGUudGVybWluYXRvcl9lbmRdKVxuICAgICAgICAuY29uY2F0KFttb2RlLmlsbGVnYWxdKVxuICAgICAgICAubWFwKHJlU3RyKVxuICAgICAgICAuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgbW9kZS50ZXJtaW5hdG9ycyA9IHRlcm1pbmF0b3JzLmxlbmd0aCA/IGxhbmdSZSh0ZXJtaW5hdG9ycy5qb2luKCd8JyksIHRydWUpIDoge2V4ZWM6IGZ1bmN0aW9uKHMpIHtyZXR1cm4gbnVsbDt9fTtcblxuICAgICAgbW9kZS5jb250aW51YXRpb24gPSB7fTtcbiAgICB9XG5cbiAgICBjb21waWxlTW9kZShsYW5ndWFnZSk7XG4gIH1cblxuICAvKlxuICBDb3JlIGhpZ2hsaWdodGluZyBmdW5jdGlvbi4gQWNjZXB0cyBhIGxhbmd1YWdlIG5hbWUsIG9yIGFuIGFsaWFzLCBhbmQgYVxuICBzdHJpbmcgd2l0aCB0aGUgY29kZSB0byBoaWdobGlnaHQuIFJldHVybnMgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZ1xuICBwcm9wZXJ0aWVzOlxuXG4gIC0gcmVsZXZhbmNlIChpbnQpXG4gIC0gdmFsdWUgKGFuIEhUTUwgc3RyaW5nIHdpdGggaGlnaGxpZ2h0aW5nIG1hcmt1cClcblxuICAqL1xuICBmdW5jdGlvbiBoaWdobGlnaHQobmFtZSwgdmFsdWUsIGlnbm9yZV9pbGxlZ2FscywgY29udGludWF0aW9uKSB7XG5cbiAgICBmdW5jdGlvbiBzdWJNb2RlKGxleGVtZSwgbW9kZSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb2RlLmNvbnRhaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0ZXN0UmUobW9kZS5jb250YWluc1tpXS5iZWdpblJlLCBsZXhlbWUpKSB7XG4gICAgICAgICAgcmV0dXJuIG1vZGUuY29udGFpbnNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlbmRPZk1vZGUobW9kZSwgbGV4ZW1lKSB7XG4gICAgICBpZiAodGVzdFJlKG1vZGUuZW5kUmUsIGxleGVtZSkpIHtcbiAgICAgICAgcmV0dXJuIG1vZGU7XG4gICAgICB9XG4gICAgICBpZiAobW9kZS5lbmRzV2l0aFBhcmVudCkge1xuICAgICAgICByZXR1cm4gZW5kT2ZNb2RlKG1vZGUucGFyZW50LCBsZXhlbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzSWxsZWdhbChsZXhlbWUsIG1vZGUpIHtcbiAgICAgIHJldHVybiAhaWdub3JlX2lsbGVnYWxzICYmIHRlc3RSZShtb2RlLmlsbGVnYWxSZSwgbGV4ZW1lKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBrZXl3b3JkTWF0Y2gobW9kZSwgbWF0Y2gpIHtcbiAgICAgIHZhciBtYXRjaF9zdHIgPSBsYW5ndWFnZS5jYXNlX2luc2Vuc2l0aXZlID8gbWF0Y2hbMF0udG9Mb3dlckNhc2UoKSA6IG1hdGNoWzBdO1xuICAgICAgcmV0dXJuIG1vZGUua2V5d29yZHMuaGFzT3duUHJvcGVydHkobWF0Y2hfc3RyKSAmJiBtb2RlLmtleXdvcmRzW21hdGNoX3N0cl07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYnVpbGRTcGFuKGNsYXNzbmFtZSwgaW5zaWRlU3BhbiwgbGVhdmVPcGVuLCBub1ByZWZpeCkge1xuICAgICAgdmFyIGNsYXNzUHJlZml4ID0gbm9QcmVmaXggPyAnJyA6IG9wdGlvbnMuY2xhc3NQcmVmaXgsXG4gICAgICAgICAgb3BlblNwYW4gICAgPSAnPHNwYW4gY2xhc3M9XCInICsgY2xhc3NQcmVmaXgsXG4gICAgICAgICAgY2xvc2VTcGFuICAgPSBsZWF2ZU9wZW4gPyAnJyA6ICc8L3NwYW4+JztcblxuICAgICAgb3BlblNwYW4gKz0gY2xhc3NuYW1lICsgJ1wiPic7XG5cbiAgICAgIHJldHVybiBvcGVuU3BhbiArIGluc2lkZVNwYW4gKyBjbG9zZVNwYW47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvY2Vzc0tleXdvcmRzKCkge1xuICAgICAgdmFyIGJ1ZmZlciA9IGVzY2FwZShtb2RlX2J1ZmZlcik7XG4gICAgICBpZiAoIXRvcC5rZXl3b3JkcylcbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICAgIHZhciByZXN1bHQgPSAnJztcbiAgICAgIHZhciBsYXN0X2luZGV4ID0gMDtcbiAgICAgIHRvcC5sZXhlbWVzUmUubGFzdEluZGV4ID0gMDtcbiAgICAgIHZhciBtYXRjaCA9IHRvcC5sZXhlbWVzUmUuZXhlYyhidWZmZXIpO1xuICAgICAgd2hpbGUgKG1hdGNoKSB7XG4gICAgICAgIHJlc3VsdCArPSBidWZmZXIuc3Vic3RyKGxhc3RfaW5kZXgsIG1hdGNoLmluZGV4IC0gbGFzdF9pbmRleCk7XG4gICAgICAgIHZhciBrZXl3b3JkX21hdGNoID0ga2V5d29yZE1hdGNoKHRvcCwgbWF0Y2gpO1xuICAgICAgICBpZiAoa2V5d29yZF9tYXRjaCkge1xuICAgICAgICAgIHJlbGV2YW5jZSArPSBrZXl3b3JkX21hdGNoWzFdO1xuICAgICAgICAgIHJlc3VsdCArPSBidWlsZFNwYW4oa2V5d29yZF9tYXRjaFswXSwgbWF0Y2hbMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdCArPSBtYXRjaFswXTtcbiAgICAgICAgfVxuICAgICAgICBsYXN0X2luZGV4ID0gdG9wLmxleGVtZXNSZS5sYXN0SW5kZXg7XG4gICAgICAgIG1hdGNoID0gdG9wLmxleGVtZXNSZS5leGVjKGJ1ZmZlcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0ICsgYnVmZmVyLnN1YnN0cihsYXN0X2luZGV4KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcm9jZXNzU3ViTGFuZ3VhZ2UoKSB7XG4gICAgICBpZiAodG9wLnN1Ykxhbmd1YWdlICYmICFsYW5ndWFnZXNbdG9wLnN1Ykxhbmd1YWdlXSkge1xuICAgICAgICByZXR1cm4gZXNjYXBlKG1vZGVfYnVmZmVyKTtcbiAgICAgIH1cbiAgICAgIHZhciByZXN1bHQgPSB0b3Auc3ViTGFuZ3VhZ2UgPyBoaWdobGlnaHQodG9wLnN1Ykxhbmd1YWdlLCBtb2RlX2J1ZmZlciwgdHJ1ZSwgdG9wLmNvbnRpbnVhdGlvbi50b3ApIDogaGlnaGxpZ2h0QXV0byhtb2RlX2J1ZmZlcik7XG4gICAgICAvLyBDb3VudGluZyBlbWJlZGRlZCBsYW5ndWFnZSBzY29yZSB0b3dhcmRzIHRoZSBob3N0IGxhbmd1YWdlIG1heSBiZSBkaXNhYmxlZFxuICAgICAgLy8gd2l0aCB6ZXJvaW5nIHRoZSBjb250YWluaW5nIG1vZGUgcmVsZXZhbmNlLiBVc2VjYXNlIGluIHBvaW50IGlzIE1hcmtkb3duIHRoYXRcbiAgICAgIC8vIGFsbG93cyBYTUwgZXZlcnl3aGVyZSBhbmQgbWFrZXMgZXZlcnkgWE1MIHNuaXBwZXQgdG8gaGF2ZSBhIG11Y2ggbGFyZ2VyIE1hcmtkb3duXG4gICAgICAvLyBzY29yZS5cbiAgICAgIGlmICh0b3AucmVsZXZhbmNlID4gMCkge1xuICAgICAgICByZWxldmFuY2UgKz0gcmVzdWx0LnJlbGV2YW5jZTtcbiAgICAgIH1cbiAgICAgIGlmICh0b3Auc3ViTGFuZ3VhZ2VNb2RlID09ICdjb250aW51b3VzJykge1xuICAgICAgICB0b3AuY29udGludWF0aW9uLnRvcCA9IHJlc3VsdC50b3A7XG4gICAgICB9XG4gICAgICByZXR1cm4gYnVpbGRTcGFuKHJlc3VsdC5sYW5ndWFnZSwgcmVzdWx0LnZhbHVlLCBmYWxzZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvY2Vzc0J1ZmZlcigpIHtcbiAgICAgIHJldHVybiB0b3Auc3ViTGFuZ3VhZ2UgIT09IHVuZGVmaW5lZCA/IHByb2Nlc3NTdWJMYW5ndWFnZSgpIDogcHJvY2Vzc0tleXdvcmRzKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RhcnROZXdNb2RlKG1vZGUsIGxleGVtZSkge1xuICAgICAgdmFyIG1hcmt1cCA9IG1vZGUuY2xhc3NOYW1lPyBidWlsZFNwYW4obW9kZS5jbGFzc05hbWUsICcnLCB0cnVlKTogJyc7XG4gICAgICBpZiAobW9kZS5yZXR1cm5CZWdpbikge1xuICAgICAgICByZXN1bHQgKz0gbWFya3VwO1xuICAgICAgICBtb2RlX2J1ZmZlciA9ICcnO1xuICAgICAgfSBlbHNlIGlmIChtb2RlLmV4Y2x1ZGVCZWdpbikge1xuICAgICAgICByZXN1bHQgKz0gZXNjYXBlKGxleGVtZSkgKyBtYXJrdXA7XG4gICAgICAgIG1vZGVfYnVmZmVyID0gJyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgKz0gbWFya3VwO1xuICAgICAgICBtb2RlX2J1ZmZlciA9IGxleGVtZTtcbiAgICAgIH1cbiAgICAgIHRvcCA9IE9iamVjdC5jcmVhdGUobW9kZSwge3BhcmVudDoge3ZhbHVlOiB0b3B9fSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvY2Vzc0xleGVtZShidWZmZXIsIGxleGVtZSkge1xuXG4gICAgICBtb2RlX2J1ZmZlciArPSBidWZmZXI7XG4gICAgICBpZiAobGV4ZW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmVzdWx0ICs9IHByb2Nlc3NCdWZmZXIoKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG5cbiAgICAgIHZhciBuZXdfbW9kZSA9IHN1Yk1vZGUobGV4ZW1lLCB0b3ApO1xuICAgICAgaWYgKG5ld19tb2RlKSB7XG4gICAgICAgIHJlc3VsdCArPSBwcm9jZXNzQnVmZmVyKCk7XG4gICAgICAgIHN0YXJ0TmV3TW9kZShuZXdfbW9kZSwgbGV4ZW1lKTtcbiAgICAgICAgcmV0dXJuIG5ld19tb2RlLnJldHVybkJlZ2luID8gMCA6IGxleGVtZS5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIHZhciBlbmRfbW9kZSA9IGVuZE9mTW9kZSh0b3AsIGxleGVtZSk7XG4gICAgICBpZiAoZW5kX21vZGUpIHtcbiAgICAgICAgdmFyIG9yaWdpbiA9IHRvcDtcbiAgICAgICAgaWYgKCEob3JpZ2luLnJldHVybkVuZCB8fCBvcmlnaW4uZXhjbHVkZUVuZCkpIHtcbiAgICAgICAgICBtb2RlX2J1ZmZlciArPSBsZXhlbWU7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ICs9IHByb2Nlc3NCdWZmZXIoKTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgIGlmICh0b3AuY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gJzwvc3Bhbj4nO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWxldmFuY2UgKz0gdG9wLnJlbGV2YW5jZTtcbiAgICAgICAgICB0b3AgPSB0b3AucGFyZW50O1xuICAgICAgICB9IHdoaWxlICh0b3AgIT0gZW5kX21vZGUucGFyZW50KTtcbiAgICAgICAgaWYgKG9yaWdpbi5leGNsdWRlRW5kKSB7XG4gICAgICAgICAgcmVzdWx0ICs9IGVzY2FwZShsZXhlbWUpO1xuICAgICAgICB9XG4gICAgICAgIG1vZGVfYnVmZmVyID0gJyc7XG4gICAgICAgIGlmIChlbmRfbW9kZS5zdGFydHMpIHtcbiAgICAgICAgICBzdGFydE5ld01vZGUoZW5kX21vZGUuc3RhcnRzLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9yaWdpbi5yZXR1cm5FbmQgPyAwIDogbGV4ZW1lLmxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzSWxsZWdhbChsZXhlbWUsIHRvcCkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSWxsZWdhbCBsZXhlbWUgXCInICsgbGV4ZW1lICsgJ1wiIGZvciBtb2RlIFwiJyArICh0b3AuY2xhc3NOYW1lIHx8ICc8dW5uYW1lZD4nKSArICdcIicpO1xuXG4gICAgICAvKlxuICAgICAgUGFyc2VyIHNob3VsZCBub3QgcmVhY2ggdGhpcyBwb2ludCBhcyBhbGwgdHlwZXMgb2YgbGV4ZW1lcyBzaG91bGQgYmUgY2F1Z2h0XG4gICAgICBlYXJsaWVyLCBidXQgaWYgaXQgZG9lcyBkdWUgdG8gc29tZSBidWcgbWFrZSBzdXJlIGl0IGFkdmFuY2VzIGF0IGxlYXN0IG9uZVxuICAgICAgY2hhcmFjdGVyIGZvcndhcmQgdG8gcHJldmVudCBpbmZpbml0ZSBsb29waW5nLlxuICAgICAgKi9cbiAgICAgIG1vZGVfYnVmZmVyICs9IGxleGVtZTtcbiAgICAgIHJldHVybiBsZXhlbWUubGVuZ3RoIHx8IDE7XG4gICAgfVxuXG4gICAgdmFyIGxhbmd1YWdlID0gZ2V0TGFuZ3VhZ2UobmFtZSk7XG4gICAgaWYgKCFsYW5ndWFnZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGxhbmd1YWdlOiBcIicgKyBuYW1lICsgJ1wiJyk7XG4gICAgfVxuXG4gICAgY29tcGlsZUxhbmd1YWdlKGxhbmd1YWdlKTtcbiAgICB2YXIgdG9wID0gY29udGludWF0aW9uIHx8IGxhbmd1YWdlO1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICBmb3IodmFyIGN1cnJlbnQgPSB0b3A7IGN1cnJlbnQgIT0gbGFuZ3VhZ2U7IGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudCkge1xuICAgICAgaWYgKGN1cnJlbnQuY2xhc3NOYW1lKSB7XG4gICAgICAgIHJlc3VsdCA9IGJ1aWxkU3BhbihjdXJyZW50LmNsYXNzTmFtZSwgcmVzdWx0LCB0cnVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIG1vZGVfYnVmZmVyID0gJyc7XG4gICAgdmFyIHJlbGV2YW5jZSA9IDA7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBtYXRjaCwgY291bnQsIGluZGV4ID0gMDtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHRvcC50ZXJtaW5hdG9ycy5sYXN0SW5kZXggPSBpbmRleDtcbiAgICAgICAgbWF0Y2ggPSB0b3AudGVybWluYXRvcnMuZXhlYyh2YWx1ZSk7XG4gICAgICAgIGlmICghbWF0Y2gpXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNvdW50ID0gcHJvY2Vzc0xleGVtZSh2YWx1ZS5zdWJzdHIoaW5kZXgsIG1hdGNoLmluZGV4IC0gaW5kZXgpLCBtYXRjaFswXSk7XG4gICAgICAgIGluZGV4ID0gbWF0Y2guaW5kZXggKyBjb3VudDtcbiAgICAgIH1cbiAgICAgIHByb2Nlc3NMZXhlbWUodmFsdWUuc3Vic3RyKGluZGV4KSk7XG4gICAgICBmb3IodmFyIGN1cnJlbnQgPSB0b3A7IGN1cnJlbnQucGFyZW50OyBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQpIHsgLy8gY2xvc2UgZGFuZ2xpbmcgbW9kZXNcbiAgICAgICAgaWYgKGN1cnJlbnQuY2xhc3NOYW1lKSB7XG4gICAgICAgICAgcmVzdWx0ICs9ICc8L3NwYW4+JztcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlbGV2YW5jZTogcmVsZXZhbmNlLFxuICAgICAgICB2YWx1ZTogcmVzdWx0LFxuICAgICAgICBsYW5ndWFnZTogbmFtZSxcbiAgICAgICAgdG9wOiB0b3BcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUubWVzc2FnZS5pbmRleE9mKCdJbGxlZ2FsJykgIT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZWxldmFuY2U6IDAsXG4gICAgICAgICAgdmFsdWU6IGVzY2FwZSh2YWx1ZSlcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLypcbiAgSGlnaGxpZ2h0aW5nIHdpdGggbGFuZ3VhZ2UgZGV0ZWN0aW9uLiBBY2NlcHRzIGEgc3RyaW5nIHdpdGggdGhlIGNvZGUgdG9cbiAgaGlnaGxpZ2h0LiBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcblxuICAtIGxhbmd1YWdlIChkZXRlY3RlZCBsYW5ndWFnZSlcbiAgLSByZWxldmFuY2UgKGludClcbiAgLSB2YWx1ZSAoYW4gSFRNTCBzdHJpbmcgd2l0aCBoaWdobGlnaHRpbmcgbWFya3VwKVxuICAtIHNlY29uZF9iZXN0IChvYmplY3Qgd2l0aCB0aGUgc2FtZSBzdHJ1Y3R1cmUgZm9yIHNlY29uZC1iZXN0IGhldXJpc3RpY2FsbHlcbiAgICBkZXRlY3RlZCBsYW5ndWFnZSwgbWF5IGJlIGFic2VudClcblxuICAqL1xuICBmdW5jdGlvbiBoaWdobGlnaHRBdXRvKHRleHQsIGxhbmd1YWdlU3Vic2V0KSB7XG4gICAgbGFuZ3VhZ2VTdWJzZXQgPSBsYW5ndWFnZVN1YnNldCB8fCBvcHRpb25zLmxhbmd1YWdlcyB8fCBPYmplY3Qua2V5cyhsYW5ndWFnZXMpO1xuICAgIHZhciByZXN1bHQgPSB7XG4gICAgICByZWxldmFuY2U6IDAsXG4gICAgICB2YWx1ZTogZXNjYXBlKHRleHQpXG4gICAgfTtcbiAgICB2YXIgc2Vjb25kX2Jlc3QgPSByZXN1bHQ7XG4gICAgbGFuZ3VhZ2VTdWJzZXQuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICBpZiAoIWdldExhbmd1YWdlKG5hbWUpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBjdXJyZW50ID0gaGlnaGxpZ2h0KG5hbWUsIHRleHQsIGZhbHNlKTtcbiAgICAgIGN1cnJlbnQubGFuZ3VhZ2UgPSBuYW1lO1xuICAgICAgaWYgKGN1cnJlbnQucmVsZXZhbmNlID4gc2Vjb25kX2Jlc3QucmVsZXZhbmNlKSB7XG4gICAgICAgIHNlY29uZF9iZXN0ID0gY3VycmVudDtcbiAgICAgIH1cbiAgICAgIGlmIChjdXJyZW50LnJlbGV2YW5jZSA+IHJlc3VsdC5yZWxldmFuY2UpIHtcbiAgICAgICAgc2Vjb25kX2Jlc3QgPSByZXN1bHQ7XG4gICAgICAgIHJlc3VsdCA9IGN1cnJlbnQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKHNlY29uZF9iZXN0Lmxhbmd1YWdlKSB7XG4gICAgICByZXN1bHQuc2Vjb25kX2Jlc3QgPSBzZWNvbmRfYmVzdDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qXG4gIFBvc3QtcHJvY2Vzc2luZyBvZiB0aGUgaGlnaGxpZ2h0ZWQgbWFya3VwOlxuXG4gIC0gcmVwbGFjZSBUQUJzIHdpdGggc29tZXRoaW5nIG1vcmUgdXNlZnVsXG4gIC0gcmVwbGFjZSByZWFsIGxpbmUtYnJlYWtzIHdpdGggJzxicj4nIGZvciBub24tcHJlIGNvbnRhaW5lcnNcblxuICAqL1xuICBmdW5jdGlvbiBmaXhNYXJrdXAodmFsdWUpIHtcbiAgICBpZiAob3B0aW9ucy50YWJSZXBsYWNlKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL14oKDxbXj5dKz58XFx0KSspL2dtLCBmdW5jdGlvbihtYXRjaCwgcDEsIG9mZnNldCwgcykge1xuICAgICAgICByZXR1cm4gcDEucmVwbGFjZSgvXFx0L2csIG9wdGlvbnMudGFiUmVwbGFjZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMudXNlQlIpIHtcbiAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFxuL2csICc8YnI+Jyk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8qXG4gIEFwcGxpZXMgaGlnaGxpZ2h0aW5nIHRvIGEgRE9NIG5vZGUgY29udGFpbmluZyBjb2RlLiBBY2NlcHRzIGEgRE9NIG5vZGUgYW5kXG4gIHR3byBvcHRpb25hbCBwYXJhbWV0ZXJzIGZvciBmaXhNYXJrdXAuXG4gICovXG4gIGZ1bmN0aW9uIGhpZ2hsaWdodEJsb2NrKGJsb2NrKSB7XG4gICAgdmFyIHRleHQgPSBibG9ja1RleHQoYmxvY2spO1xuICAgIHZhciBsYW5ndWFnZSA9IGJsb2NrTGFuZ3VhZ2UoYmxvY2spO1xuICAgIGlmIChsYW5ndWFnZSA9PSAnbm8taGlnaGxpZ2h0JylcbiAgICAgICAgcmV0dXJuO1xuICAgIHZhciByZXN1bHQgPSBsYW5ndWFnZSA/IGhpZ2hsaWdodChsYW5ndWFnZSwgdGV4dCwgdHJ1ZSkgOiBoaWdobGlnaHRBdXRvKHRleHQpO1xuICAgIHZhciBvcmlnaW5hbCA9IG5vZGVTdHJlYW0oYmxvY2spO1xuICAgIGlmIChvcmlnaW5hbC5sZW5ndGgpIHtcbiAgICAgIHZhciBwcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnLCAncHJlJyk7XG4gICAgICBwcmUuaW5uZXJIVE1MID0gcmVzdWx0LnZhbHVlO1xuICAgICAgcmVzdWx0LnZhbHVlID0gbWVyZ2VTdHJlYW1zKG9yaWdpbmFsLCBub2RlU3RyZWFtKHByZSksIHRleHQpO1xuICAgIH1cbiAgICByZXN1bHQudmFsdWUgPSBmaXhNYXJrdXAocmVzdWx0LnZhbHVlKTtcblxuICAgIGJsb2NrLmlubmVySFRNTCA9IHJlc3VsdC52YWx1ZTtcbiAgICBibG9jay5jbGFzc05hbWUgKz0gJyBobGpzICcgKyAoIWxhbmd1YWdlICYmIHJlc3VsdC5sYW5ndWFnZSB8fCAnJyk7XG4gICAgYmxvY2sucmVzdWx0ID0ge1xuICAgICAgbGFuZ3VhZ2U6IHJlc3VsdC5sYW5ndWFnZSxcbiAgICAgIHJlOiByZXN1bHQucmVsZXZhbmNlXG4gICAgfTtcbiAgICBpZiAocmVzdWx0LnNlY29uZF9iZXN0KSB7XG4gICAgICBibG9jay5zZWNvbmRfYmVzdCA9IHtcbiAgICAgICAgbGFuZ3VhZ2U6IHJlc3VsdC5zZWNvbmRfYmVzdC5sYW5ndWFnZSxcbiAgICAgICAgcmU6IHJlc3VsdC5zZWNvbmRfYmVzdC5yZWxldmFuY2VcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgdmFyIG9wdGlvbnMgPSB7XG4gICAgY2xhc3NQcmVmaXg6ICdobGpzLScsXG4gICAgdGFiUmVwbGFjZTogbnVsbCxcbiAgICB1c2VCUjogZmFsc2UsXG4gICAgbGFuZ3VhZ2VzOiB1bmRlZmluZWRcbiAgfTtcblxuICAvKlxuICBVcGRhdGVzIGhpZ2hsaWdodC5qcyBnbG9iYWwgb3B0aW9ucyB3aXRoIHZhbHVlcyBwYXNzZWQgaW4gdGhlIGZvcm0gb2YgYW4gb2JqZWN0XG4gICovXG4gIGZ1bmN0aW9uIGNvbmZpZ3VyZSh1c2VyX29wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gaW5oZXJpdChvcHRpb25zLCB1c2VyX29wdGlvbnMpO1xuICB9XG5cbiAgLypcbiAgQXBwbGllcyBoaWdobGlnaHRpbmcgdG8gYWxsIDxwcmU+PGNvZGU+Li48L2NvZGU+PC9wcmU+IGJsb2NrcyBvbiBhIHBhZ2UuXG4gICovXG4gIGZ1bmN0aW9uIGluaXRIaWdobGlnaHRpbmcoKSB7XG4gICAgaWYgKGluaXRIaWdobGlnaHRpbmcuY2FsbGVkKVxuICAgICAgcmV0dXJuO1xuICAgIGluaXRIaWdobGlnaHRpbmcuY2FsbGVkID0gdHJ1ZTtcblxuICAgIHZhciBibG9ja3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdwcmUgY29kZScpO1xuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoYmxvY2tzLCBoaWdobGlnaHRCbG9jayk7XG4gIH1cblxuICAvKlxuICBBdHRhY2hlcyBoaWdobGlnaHRpbmcgdG8gdGhlIHBhZ2UgbG9hZCBldmVudC5cbiAgKi9cbiAgZnVuY3Rpb24gaW5pdEhpZ2hsaWdodGluZ09uTG9hZCgpIHtcbiAgICBhZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdEhpZ2hsaWdodGluZywgZmFsc2UpO1xuICAgIGFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBpbml0SGlnaGxpZ2h0aW5nLCBmYWxzZSk7XG4gIH1cblxuICB2YXIgbGFuZ3VhZ2VzID0ge307XG4gIHZhciBhbGlhc2VzID0ge307XG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXJMYW5ndWFnZShuYW1lLCBsYW5ndWFnZSkge1xuICAgIHZhciBsYW5nID0gbGFuZ3VhZ2VzW25hbWVdID0gbGFuZ3VhZ2UodGhpcyk7XG4gICAgaWYgKGxhbmcuYWxpYXNlcykge1xuICAgICAgbGFuZy5hbGlhc2VzLmZvckVhY2goZnVuY3Rpb24oYWxpYXMpIHthbGlhc2VzW2FsaWFzXSA9IG5hbWU7fSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TGFuZ3VhZ2UobmFtZSkge1xuICAgIHJldHVybiBsYW5ndWFnZXNbbmFtZV0gfHwgbGFuZ3VhZ2VzW2FsaWFzZXNbbmFtZV1dO1xuICB9XG5cbiAgLyogSW50ZXJmYWNlIGRlZmluaXRpb24gKi9cblxuICB0aGlzLmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcbiAgdGhpcy5oaWdobGlnaHRBdXRvID0gaGlnaGxpZ2h0QXV0bztcbiAgdGhpcy5maXhNYXJrdXAgPSBmaXhNYXJrdXA7XG4gIHRoaXMuaGlnaGxpZ2h0QmxvY2sgPSBoaWdobGlnaHRCbG9jaztcbiAgdGhpcy5jb25maWd1cmUgPSBjb25maWd1cmU7XG4gIHRoaXMuaW5pdEhpZ2hsaWdodGluZyA9IGluaXRIaWdobGlnaHRpbmc7XG4gIHRoaXMuaW5pdEhpZ2hsaWdodGluZ09uTG9hZCA9IGluaXRIaWdobGlnaHRpbmdPbkxvYWQ7XG4gIHRoaXMucmVnaXN0ZXJMYW5ndWFnZSA9IHJlZ2lzdGVyTGFuZ3VhZ2U7XG4gIHRoaXMuZ2V0TGFuZ3VhZ2UgPSBnZXRMYW5ndWFnZTtcbiAgdGhpcy5pbmhlcml0ID0gaW5oZXJpdDtcblxuICAvLyBDb21tb24gcmVnZXhwc1xuICB0aGlzLklERU5UX1JFID0gJ1thLXpBLVpdW2EtekEtWjAtOV9dKic7XG4gIHRoaXMuVU5ERVJTQ09SRV9JREVOVF9SRSA9ICdbYS16QS1aX11bYS16QS1aMC05X10qJztcbiAgdGhpcy5OVU1CRVJfUkUgPSAnXFxcXGJcXFxcZCsoXFxcXC5cXFxcZCspPyc7XG4gIHRoaXMuQ19OVU1CRVJfUkUgPSAnKFxcXFxiMFt4WF1bYS1mQS1GMC05XSt8KFxcXFxiXFxcXGQrKFxcXFwuXFxcXGQqKT98XFxcXC5cXFxcZCspKFtlRV1bLStdP1xcXFxkKyk/KSc7IC8vIDB4Li4uLCAwLi4uLCBkZWNpbWFsLCBmbG9hdFxuICB0aGlzLkJJTkFSWV9OVU1CRVJfUkUgPSAnXFxcXGIoMGJbMDFdKyknOyAvLyAwYi4uLlxuICB0aGlzLlJFX1NUQVJURVJTX1JFID0gJyF8IT18IT09fCV8JT18JnwmJnwmPXxcXFxcKnxcXFxcKj18XFxcXCt8XFxcXCs9fCx8LXwtPXwvPXwvfDp8O3w8PHw8PD18PD18PHw9PT18PT18PXw+Pj49fD4+PXw+PXw+Pj58Pj58PnxcXFxcP3xcXFxcW3xcXFxce3xcXFxcKHxcXFxcXnxcXFxcXj18XFxcXHx8XFxcXHw9fFxcXFx8XFxcXHx8fic7XG5cbiAgLy8gQ29tbW9uIG1vZGVzXG4gIHRoaXMuQkFDS1NMQVNIX0VTQ0FQRSA9IHtcbiAgICBiZWdpbjogJ1xcXFxcXFxcW1xcXFxzXFxcXFNdJywgcmVsZXZhbmNlOiAwXG4gIH07XG4gIHRoaXMuQVBPU19TVFJJTkdfTU9ERSA9IHtcbiAgICBjbGFzc05hbWU6ICdzdHJpbmcnLFxuICAgIGJlZ2luOiAnXFwnJywgZW5kOiAnXFwnJyxcbiAgICBpbGxlZ2FsOiAnXFxcXG4nLFxuICAgIGNvbnRhaW5zOiBbdGhpcy5CQUNLU0xBU0hfRVNDQVBFXVxuICB9O1xuICB0aGlzLlFVT1RFX1NUUklOR19NT0RFID0ge1xuICAgIGNsYXNzTmFtZTogJ3N0cmluZycsXG4gICAgYmVnaW46ICdcIicsIGVuZDogJ1wiJyxcbiAgICBpbGxlZ2FsOiAnXFxcXG4nLFxuICAgIGNvbnRhaW5zOiBbdGhpcy5CQUNLU0xBU0hfRVNDQVBFXVxuICB9O1xuICB0aGlzLkNfTElORV9DT01NRU5UX01PREUgPSB7XG4gICAgY2xhc3NOYW1lOiAnY29tbWVudCcsXG4gICAgYmVnaW46ICcvLycsIGVuZDogJyQnXG4gIH07XG4gIHRoaXMuQ19CTE9DS19DT01NRU5UX01PREUgPSB7XG4gICAgY2xhc3NOYW1lOiAnY29tbWVudCcsXG4gICAgYmVnaW46ICcvXFxcXConLCBlbmQ6ICdcXFxcKi8nXG4gIH07XG4gIHRoaXMuSEFTSF9DT01NRU5UX01PREUgPSB7XG4gICAgY2xhc3NOYW1lOiAnY29tbWVudCcsXG4gICAgYmVnaW46ICcjJywgZW5kOiAnJCdcbiAgfTtcbiAgdGhpcy5OVU1CRVJfTU9ERSA9IHtcbiAgICBjbGFzc05hbWU6ICdudW1iZXInLFxuICAgIGJlZ2luOiB0aGlzLk5VTUJFUl9SRSxcbiAgICByZWxldmFuY2U6IDBcbiAgfTtcbiAgdGhpcy5DX05VTUJFUl9NT0RFID0ge1xuICAgIGNsYXNzTmFtZTogJ251bWJlcicsXG4gICAgYmVnaW46IHRoaXMuQ19OVU1CRVJfUkUsXG4gICAgcmVsZXZhbmNlOiAwXG4gIH07XG4gIHRoaXMuQklOQVJZX05VTUJFUl9NT0RFID0ge1xuICAgIGNsYXNzTmFtZTogJ251bWJlcicsXG4gICAgYmVnaW46IHRoaXMuQklOQVJZX05VTUJFUl9SRSxcbiAgICByZWxldmFuY2U6IDBcbiAgfTtcbiAgdGhpcy5SRUdFWFBfTU9ERSA9IHtcbiAgICBjbGFzc05hbWU6ICdyZWdleHAnLFxuICAgIGJlZ2luOiAvXFwvLywgZW5kOiAvXFwvW2dpbV0qLyxcbiAgICBpbGxlZ2FsOiAvXFxuLyxcbiAgICBjb250YWluczogW1xuICAgICAgdGhpcy5CQUNLU0xBU0hfRVNDQVBFLFxuICAgICAge1xuICAgICAgICBiZWdpbjogL1xcWy8sIGVuZDogL1xcXS8sXG4gICAgICAgIHJlbGV2YW5jZTogMCxcbiAgICAgICAgY29udGFpbnM6IFt0aGlzLkJBQ0tTTEFTSF9FU0NBUEVdXG4gICAgICB9XG4gICAgXVxuICB9O1xuICB0aGlzLlRJVExFX01PREUgPSB7XG4gICAgY2xhc3NOYW1lOiAndGl0bGUnLFxuICAgIGJlZ2luOiB0aGlzLklERU5UX1JFLFxuICAgIHJlbGV2YW5jZTogMFxuICB9O1xuICB0aGlzLlVOREVSU0NPUkVfVElUTEVfTU9ERSA9IHtcbiAgICBjbGFzc05hbWU6ICd0aXRsZScsXG4gICAgYmVnaW46IHRoaXMuVU5ERVJTQ09SRV9JREVOVF9SRSxcbiAgICByZWxldmFuY2U6IDBcbiAgfTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEhpZ2hsaWdodDsiLCJ2YXIgSGlnaGxpZ2h0ID0gcmVxdWlyZSgnLi9oaWdobGlnaHQnKTtcbnZhciBobGpzID0gbmV3IEhpZ2hsaWdodCgpO1xuaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCdiYXNoJywgcmVxdWlyZSgnLi9sYW5ndWFnZXMvYmFzaC5qcycpKTtcbmhsanMucmVnaXN0ZXJMYW5ndWFnZSgnamF2YXNjcmlwdCcsIHJlcXVpcmUoJy4vbGFuZ3VhZ2VzL2phdmFzY3JpcHQuanMnKSk7XG5obGpzLnJlZ2lzdGVyTGFuZ3VhZ2UoJ3htbCcsIHJlcXVpcmUoJy4vbGFuZ3VhZ2VzL3htbC5qcycpKTtcbmhsanMucmVnaXN0ZXJMYW5ndWFnZSgnbWFya2Rvd24nLCByZXF1aXJlKCcuL2xhbmd1YWdlcy9tYXJrZG93bi5qcycpKTtcbmhsanMucmVnaXN0ZXJMYW5ndWFnZSgnY3NzJywgcmVxdWlyZSgnLi9sYW5ndWFnZXMvY3NzLmpzJykpO1xuaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCdodHRwJywgcmVxdWlyZSgnLi9sYW5ndWFnZXMvaHR0cC5qcycpKTtcbmhsanMucmVnaXN0ZXJMYW5ndWFnZSgnaW5pJywgcmVxdWlyZSgnLi9sYW5ndWFnZXMvaW5pLmpzJykpO1xuaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCdqc29uJywgcmVxdWlyZSgnLi9sYW5ndWFnZXMvanNvbi5qcycpKTtcbm1vZHVsZS5leHBvcnRzID0gaGxqczsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGhsanMpIHtcbiAgdmFyIFZBUiA9IHtcbiAgICBjbGFzc05hbWU6ICd2YXJpYWJsZScsXG4gICAgdmFyaWFudHM6IFtcbiAgICAgIHtiZWdpbjogL1xcJFtcXHdcXGQjQF1bXFx3XFxkX10qL30sXG4gICAgICB7YmVnaW46IC9cXCRcXHsoLio/KVxcfS99XG4gICAgXVxuICB9O1xuICB2YXIgUVVPVEVfU1RSSU5HID0ge1xuICAgIGNsYXNzTmFtZTogJ3N0cmluZycsXG4gICAgYmVnaW46IC9cIi8sIGVuZDogL1wiLyxcbiAgICBjb250YWluczogW1xuICAgICAgaGxqcy5CQUNLU0xBU0hfRVNDQVBFLFxuICAgICAgVkFSLFxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICd2YXJpYWJsZScsXG4gICAgICAgIGJlZ2luOiAvXFwkXFwoLywgZW5kOiAvXFwpLyxcbiAgICAgICAgY29udGFpbnM6IFtobGpzLkJBQ0tTTEFTSF9FU0NBUEVdXG4gICAgICB9XG4gICAgXVxuICB9O1xuICB2YXIgQVBPU19TVFJJTkcgPSB7XG4gICAgY2xhc3NOYW1lOiAnc3RyaW5nJyxcbiAgICBiZWdpbjogLycvLCBlbmQ6IC8nL1xuICB9O1xuXG4gIHJldHVybiB7XG4gICAgbGV4ZW1lczogLy0/W2EtelxcLl0rLyxcbiAgICBrZXl3b3Jkczoge1xuICAgICAga2V5d29yZDpcbiAgICAgICAgJ2lmIHRoZW4gZWxzZSBlbGlmIGZpIGZvciBicmVhayBjb250aW51ZSB3aGlsZSBpbiBkbyBkb25lIGV4aXQgcmV0dXJuIHNldCAnK1xuICAgICAgICAnZGVjbGFyZSBjYXNlIGVzYWMgZXhwb3J0IGV4ZWMnLFxuICAgICAgbGl0ZXJhbDpcbiAgICAgICAgJ3RydWUgZmFsc2UnLFxuICAgICAgYnVpbHRfaW46XG4gICAgICAgICdwcmludGYgZWNobyByZWFkIGNkIHB3ZCBwdXNoZCBwb3BkIGRpcnMgbGV0IGV2YWwgdW5zZXQgdHlwZXNldCByZWFkb25seSAnK1xuICAgICAgICAnZ2V0b3B0cyBzb3VyY2Ugc2hvcHQgY2FsbGVyIHR5cGUgaGFzaCBiaW5kIGhlbHAgc3VkbycsXG4gICAgICBvcGVyYXRvcjpcbiAgICAgICAgJy1uZSAtZXEgLWx0IC1ndCAtZiAtZCAtZSAtcyAtbCAtYScgLy8gcmVsZXZhbmNlIGJvb3N0ZXJcbiAgICB9LFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ3NoZWJhbmcnLFxuICAgICAgICBiZWdpbjogL14jIVteXFxuXStzaFxccyokLyxcbiAgICAgICAgcmVsZXZhbmNlOiAxMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAnZnVuY3Rpb24nLFxuICAgICAgICBiZWdpbjogL1xcd1tcXHdcXGRfXSpcXHMqXFwoXFxzKlxcKVxccypcXHsvLFxuICAgICAgICByZXR1cm5CZWdpbjogdHJ1ZSxcbiAgICAgICAgY29udGFpbnM6IFtobGpzLmluaGVyaXQoaGxqcy5USVRMRV9NT0RFLCB7YmVnaW46IC9cXHdbXFx3XFxkX10qL30pXSxcbiAgICAgICAgcmVsZXZhbmNlOiAwXG4gICAgICB9LFxuICAgICAgaGxqcy5IQVNIX0NPTU1FTlRfTU9ERSxcbiAgICAgIGhsanMuTlVNQkVSX01PREUsXG4gICAgICBRVU9URV9TVFJJTkcsXG4gICAgICBBUE9TX1NUUklORyxcbiAgICAgIFZBUlxuICAgIF1cbiAgfTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihobGpzKSB7XG4gIHZhciBJREVOVF9SRSA9ICdbYS16QS1aLV1bYS16QS1aMC05Xy1dKic7XG4gIHZhciBGVU5DVElPTiA9IHtcbiAgICBjbGFzc05hbWU6ICdmdW5jdGlvbicsXG4gICAgYmVnaW46IElERU5UX1JFICsgJ1xcXFwoJywgZW5kOiAnXFxcXCknLFxuICAgIGNvbnRhaW5zOiBbJ3NlbGYnLCBobGpzLk5VTUJFUl9NT0RFLCBobGpzLkFQT1NfU1RSSU5HX01PREUsIGhsanMuUVVPVEVfU1RSSU5HX01PREVdXG4gIH07XG4gIHJldHVybiB7XG4gICAgY2FzZV9pbnNlbnNpdGl2ZTogdHJ1ZSxcbiAgICBpbGxlZ2FsOiAnWz0vfFxcJ10nLFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICBobGpzLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLFxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICdpZCcsIGJlZ2luOiAnXFxcXCNbQS1aYS16MC05Xy1dKydcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ2NsYXNzJywgYmVnaW46ICdcXFxcLltBLVphLXowLTlfLV0rJyxcbiAgICAgICAgcmVsZXZhbmNlOiAwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICdhdHRyX3NlbGVjdG9yJyxcbiAgICAgICAgYmVnaW46ICdcXFxcWycsIGVuZDogJ1xcXFxdJyxcbiAgICAgICAgaWxsZWdhbDogJyQnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICdwc2V1ZG8nLFxuICAgICAgICBiZWdpbjogJzooOik/W2EtekEtWjAtOVxcXFxfXFxcXC1cXFxcK1xcXFwoXFxcXClcXFxcXCJcXFxcXFwnXSsnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICdhdF9ydWxlJyxcbiAgICAgICAgYmVnaW46ICdAKGZvbnQtZmFjZXxwYWdlKScsXG4gICAgICAgIGxleGVtZXM6ICdbYS16LV0rJyxcbiAgICAgICAga2V5d29yZHM6ICdmb250LWZhY2UgcGFnZSdcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ2F0X3J1bGUnLFxuICAgICAgICBiZWdpbjogJ0AnLCBlbmQ6ICdbeztdJywgLy8gYXRfcnVsZSBlYXRpbmcgZmlyc3QgXCJ7XCIgaXMgYSBnb29kIHRoaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBiZWNhdXNlIGl0IGRvZXNu4oCZdCBsZXQgaXQgdG8gYmUgcGFyc2VkIGFzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhIHJ1bGUgc2V0IGJ1dCBpbnN0ZWFkIGRyb3BzIHBhcnNlciBpbnRvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgZGVmYXVsdCBtb2RlIHdoaWNoIGlzIGhvdyBpdCBzaG91bGQgYmUuXG4gICAgICAgIGNvbnRhaW5zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAna2V5d29yZCcsXG4gICAgICAgICAgICBiZWdpbjogL1xcUysvXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBiZWdpbjogL1xccy8sIGVuZHNXaXRoUGFyZW50OiB0cnVlLCBleGNsdWRlRW5kOiB0cnVlLFxuICAgICAgICAgICAgcmVsZXZhbmNlOiAwLFxuICAgICAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICAgICAgRlVOQ1RJT04sXG4gICAgICAgICAgICAgIGhsanMuQVBPU19TVFJJTkdfTU9ERSwgaGxqcy5RVU9URV9TVFJJTkdfTU9ERSxcbiAgICAgICAgICAgICAgaGxqcy5OVU1CRVJfTU9ERVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAndGFnJywgYmVnaW46IElERU5UX1JFLFxuICAgICAgICByZWxldmFuY2U6IDBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ3J1bGVzJyxcbiAgICAgICAgYmVnaW46ICd7JywgZW5kOiAnfScsXG4gICAgICAgIGlsbGVnYWw6ICdbXlxcXFxzXScsXG4gICAgICAgIHJlbGV2YW5jZTogMCxcbiAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICBobGpzLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3J1bGUnLFxuICAgICAgICAgICAgYmVnaW46ICdbXlxcXFxzXScsIHJldHVybkJlZ2luOiB0cnVlLCBlbmQ6ICc7JywgZW5kc1dpdGhQYXJlbnQ6IHRydWUsXG4gICAgICAgICAgICBjb250YWluczogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnYXR0cmlidXRlJyxcbiAgICAgICAgICAgICAgICBiZWdpbjogJ1tBLVpcXFxcX1xcXFwuXFxcXC1dKycsIGVuZDogJzonLFxuICAgICAgICAgICAgICAgIGV4Y2x1ZGVFbmQ6IHRydWUsXG4gICAgICAgICAgICAgICAgaWxsZWdhbDogJ1teXFxcXHNdJyxcbiAgICAgICAgICAgICAgICBzdGFydHM6IHtcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ3ZhbHVlJyxcbiAgICAgICAgICAgICAgICAgIGVuZHNXaXRoUGFyZW50OiB0cnVlLCBleGNsdWRlRW5kOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgRlVOQ1RJT04sXG4gICAgICAgICAgICAgICAgICAgIGhsanMuTlVNQkVSX01PREUsXG4gICAgICAgICAgICAgICAgICAgIGhsanMuUVVPVEVfU1RSSU5HX01PREUsXG4gICAgICAgICAgICAgICAgICAgIGhsanMuQVBPU19TVFJJTkdfTU9ERSxcbiAgICAgICAgICAgICAgICAgICAgaGxqcy5DX0JMT0NLX0NPTU1FTlRfTU9ERSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogJ2hleGNvbG9yJywgYmVnaW46ICcjWzAtOUEtRmEtZl0rJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAnaW1wb3J0YW50JywgYmVnaW46ICchaW1wb3J0YW50J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGhsanMpIHtcbiAgcmV0dXJuIHtcbiAgICBpbGxlZ2FsOiAnXFxcXFMnLFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ3N0YXR1cycsXG4gICAgICAgIGJlZ2luOiAnXkhUVFAvWzAtOVxcXFwuXSsnLCBlbmQ6ICckJyxcbiAgICAgICAgY29udGFpbnM6IFt7Y2xhc3NOYW1lOiAnbnVtYmVyJywgYmVnaW46ICdcXFxcYlxcXFxkezN9XFxcXGInfV1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ3JlcXVlc3QnLFxuICAgICAgICBiZWdpbjogJ15bQS1aXSsgKC4qPykgSFRUUC9bMC05XFxcXC5dKyQnLCByZXR1cm5CZWdpbjogdHJ1ZSwgZW5kOiAnJCcsXG4gICAgICAgIGNvbnRhaW5zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAnc3RyaW5nJyxcbiAgICAgICAgICAgIGJlZ2luOiAnICcsIGVuZDogJyAnLFxuICAgICAgICAgICAgZXhjbHVkZUJlZ2luOiB0cnVlLCBleGNsdWRlRW5kOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICdhdHRyaWJ1dGUnLFxuICAgICAgICBiZWdpbjogJ15cXFxcdycsIGVuZDogJzogJywgZXhjbHVkZUVuZDogdHJ1ZSxcbiAgICAgICAgaWxsZWdhbDogJ1xcXFxufFxcXFxzfD0nLFxuICAgICAgICBzdGFydHM6IHtjbGFzc05hbWU6ICdzdHJpbmcnLCBlbmQ6ICckJ31cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiAnXFxcXG5cXFxcbicsXG4gICAgICAgIHN0YXJ0czoge3N1Ykxhbmd1YWdlOiAnJywgZW5kc1dpdGhQYXJlbnQ6IHRydWV9XG4gICAgICB9XG4gICAgXVxuICB9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGhsanMpIHtcbiAgcmV0dXJuIHtcbiAgICBjYXNlX2luc2Vuc2l0aXZlOiB0cnVlLFxuICAgIGlsbGVnYWw6IC9cXFMvLFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ2NvbW1lbnQnLFxuICAgICAgICBiZWdpbjogJzsnLCBlbmQ6ICckJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAndGl0bGUnLFxuICAgICAgICBiZWdpbjogJ15cXFxcWycsIGVuZDogJ1xcXFxdJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAnc2V0dGluZycsXG4gICAgICAgIGJlZ2luOiAnXlthLXowLTlcXFxcW1xcXFxdXy1dK1sgXFxcXHRdKj1bIFxcXFx0XSonLCBlbmQ6ICckJyxcbiAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICd2YWx1ZScsXG4gICAgICAgICAgICBlbmRzV2l0aFBhcmVudDogdHJ1ZSxcbiAgICAgICAgICAgIGtleXdvcmRzOiAnb24gb2ZmIHRydWUgZmFsc2UgeWVzIG5vJyxcbiAgICAgICAgICAgIGNvbnRhaW5zOiBbaGxqcy5RVU9URV9TVFJJTkdfTU9ERSwgaGxqcy5OVU1CRVJfTU9ERV0sXG4gICAgICAgICAgICByZWxldmFuY2U6IDBcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICBdXG4gIH07XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaGxqcykge1xuICByZXR1cm4ge1xuICAgIGFsaWFzZXM6IFsnanMnXSxcbiAgICBrZXl3b3Jkczoge1xuICAgICAga2V5d29yZDpcbiAgICAgICAgJ2luIGlmIGZvciB3aGlsZSBmaW5hbGx5IHZhciBuZXcgZnVuY3Rpb24gZG8gcmV0dXJuIHZvaWQgZWxzZSBicmVhayBjYXRjaCAnICtcbiAgICAgICAgJ2luc3RhbmNlb2Ygd2l0aCB0aHJvdyBjYXNlIGRlZmF1bHQgdHJ5IHRoaXMgc3dpdGNoIGNvbnRpbnVlIHR5cGVvZiBkZWxldGUgJyArXG4gICAgICAgICdsZXQgeWllbGQgY29uc3QgY2xhc3MnLFxuICAgICAgbGl0ZXJhbDpcbiAgICAgICAgJ3RydWUgZmFsc2UgbnVsbCB1bmRlZmluZWQgTmFOIEluZmluaXR5JyxcbiAgICAgIGJ1aWx0X2luOlxuICAgICAgICAnZXZhbCBpc0Zpbml0ZSBpc05hTiBwYXJzZUZsb2F0IHBhcnNlSW50IGRlY29kZVVSSSBkZWNvZGVVUklDb21wb25lbnQgJyArXG4gICAgICAgICdlbmNvZGVVUkkgZW5jb2RlVVJJQ29tcG9uZW50IGVzY2FwZSB1bmVzY2FwZSBPYmplY3QgRnVuY3Rpb24gQm9vbGVhbiBFcnJvciAnICtcbiAgICAgICAgJ0V2YWxFcnJvciBJbnRlcm5hbEVycm9yIFJhbmdlRXJyb3IgUmVmZXJlbmNlRXJyb3IgU3RvcEl0ZXJhdGlvbiBTeW50YXhFcnJvciAnICtcbiAgICAgICAgJ1R5cGVFcnJvciBVUklFcnJvciBOdW1iZXIgTWF0aCBEYXRlIFN0cmluZyBSZWdFeHAgQXJyYXkgRmxvYXQzMkFycmF5ICcgK1xuICAgICAgICAnRmxvYXQ2NEFycmF5IEludDE2QXJyYXkgSW50MzJBcnJheSBJbnQ4QXJyYXkgVWludDE2QXJyYXkgVWludDMyQXJyYXkgJyArXG4gICAgICAgICdVaW50OEFycmF5IFVpbnQ4Q2xhbXBlZEFycmF5IEFycmF5QnVmZmVyIERhdGFWaWV3IEpTT04gSW50bCBhcmd1bWVudHMgcmVxdWlyZSdcbiAgICB9LFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ3BpJyxcbiAgICAgICAgYmVnaW46IC9eXFxzKignfFwiKXVzZSBzdHJpY3QoJ3xcIikvLFxuICAgICAgICByZWxldmFuY2U6IDEwXG4gICAgICB9LFxuICAgICAgaGxqcy5BUE9TX1NUUklOR19NT0RFLFxuICAgICAgaGxqcy5RVU9URV9TVFJJTkdfTU9ERSxcbiAgICAgIGhsanMuQ19MSU5FX0NPTU1FTlRfTU9ERSxcbiAgICAgIGhsanMuQ19CTE9DS19DT01NRU5UX01PREUsXG4gICAgICBobGpzLkNfTlVNQkVSX01PREUsXG4gICAgICB7IC8vIFwidmFsdWVcIiBjb250YWluZXJcbiAgICAgICAgYmVnaW46ICcoJyArIGhsanMuUkVfU1RBUlRFUlNfUkUgKyAnfFxcXFxiKGNhc2V8cmV0dXJufHRocm93KVxcXFxiKVxcXFxzKicsXG4gICAgICAgIGtleXdvcmRzOiAncmV0dXJuIHRocm93IGNhc2UnLFxuICAgICAgICBjb250YWluczogW1xuICAgICAgICAgIGhsanMuQ19MSU5FX0NPTU1FTlRfTU9ERSxcbiAgICAgICAgICBobGpzLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLFxuICAgICAgICAgIGhsanMuUkVHRVhQX01PREUsXG4gICAgICAgICAgeyAvLyBFNFhcbiAgICAgICAgICAgIGJlZ2luOiAvPC8sIGVuZDogLz47LyxcbiAgICAgICAgICAgIHJlbGV2YW5jZTogMCxcbiAgICAgICAgICAgIHN1Ykxhbmd1YWdlOiAneG1sJ1xuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgcmVsZXZhbmNlOiAwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICdmdW5jdGlvbicsXG4gICAgICAgIGJlZ2luS2V5d29yZHM6ICdmdW5jdGlvbicsIGVuZDogL1xcey8sXG4gICAgICAgIGNvbnRhaW5zOiBbXG4gICAgICAgICAgaGxqcy5pbmhlcml0KGhsanMuVElUTEVfTU9ERSwge2JlZ2luOiAvW0EtWmEteiRfXVswLTlBLVphLXokX10qL30pLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3BhcmFtcycsXG4gICAgICAgICAgICBiZWdpbjogL1xcKC8sIGVuZDogL1xcKS8sXG4gICAgICAgICAgICBjb250YWluczogW1xuICAgICAgICAgICAgICBobGpzLkNfTElORV9DT01NRU5UX01PREUsXG4gICAgICAgICAgICAgIGhsanMuQ19CTE9DS19DT01NRU5UX01PREVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBpbGxlZ2FsOiAvW1wiJ1xcKF0vXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBpbGxlZ2FsOiAvXFxbfCUvXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBiZWdpbjogL1xcJFsoLl0vIC8vIHJlbGV2YW5jZSBib29zdGVyIGZvciBhIHBhdHRlcm4gY29tbW9uIHRvIEpTIGxpYnM6IGAkKHNvbWV0aGluZylgIGFuZCBgJC5zb21ldGhpbmdgXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBiZWdpbjogJ1xcXFwuJyArIGhsanMuSURFTlRfUkUsIHJlbGV2YW5jZTogMCAvLyBoYWNrOiBwcmV2ZW50cyBkZXRlY3Rpb24gb2Yga2V5d29yZHMgYWZ0ZXIgZG90c1xuICAgICAgfVxuICAgIF1cbiAgfTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihobGpzKSB7XG4gIHZhciBMSVRFUkFMUyA9IHtsaXRlcmFsOiAndHJ1ZSBmYWxzZSBudWxsJ307XG4gIHZhciBUWVBFUyA9IFtcbiAgICBobGpzLlFVT1RFX1NUUklOR19NT0RFLFxuICAgIGhsanMuQ19OVU1CRVJfTU9ERVxuICBdO1xuICB2YXIgVkFMVUVfQ09OVEFJTkVSID0ge1xuICAgIGNsYXNzTmFtZTogJ3ZhbHVlJyxcbiAgICBlbmQ6ICcsJywgZW5kc1dpdGhQYXJlbnQ6IHRydWUsIGV4Y2x1ZGVFbmQ6IHRydWUsXG4gICAgY29udGFpbnM6IFRZUEVTLFxuICAgIGtleXdvcmRzOiBMSVRFUkFMU1xuICB9O1xuICB2YXIgT0JKRUNUID0ge1xuICAgIGJlZ2luOiAneycsIGVuZDogJ30nLFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ2F0dHJpYnV0ZScsXG4gICAgICAgIGJlZ2luOiAnXFxcXHMqXCInLCBlbmQ6ICdcIlxcXFxzKjpcXFxccyonLCBleGNsdWRlQmVnaW46IHRydWUsIGV4Y2x1ZGVFbmQ6IHRydWUsXG4gICAgICAgIGNvbnRhaW5zOiBbaGxqcy5CQUNLU0xBU0hfRVNDQVBFXSxcbiAgICAgICAgaWxsZWdhbDogJ1xcXFxuJyxcbiAgICAgICAgc3RhcnRzOiBWQUxVRV9DT05UQUlORVJcbiAgICAgIH1cbiAgICBdLFxuICAgIGlsbGVnYWw6ICdcXFxcUydcbiAgfTtcbiAgdmFyIEFSUkFZID0ge1xuICAgIGJlZ2luOiAnXFxcXFsnLCBlbmQ6ICdcXFxcXScsXG4gICAgY29udGFpbnM6IFtobGpzLmluaGVyaXQoVkFMVUVfQ09OVEFJTkVSLCB7Y2xhc3NOYW1lOiBudWxsfSldLCAvLyBpbmhlcml0IGlzIGFsc28gYSB3b3JrYXJvdW5kIGZvciBhIGJ1ZyB0aGF0IG1ha2VzIHNoYXJlZCBtb2RlcyB3aXRoIGVuZHNXaXRoUGFyZW50IGNvbXBpbGUgb25seSB0aGUgZW5kaW5nIG9mIG9uZSBvZiB0aGUgcGFyZW50c1xuICAgIGlsbGVnYWw6ICdcXFxcUydcbiAgfTtcbiAgVFlQRVMuc3BsaWNlKFRZUEVTLmxlbmd0aCwgMCwgT0JKRUNULCBBUlJBWSk7XG4gIHJldHVybiB7XG4gICAgY29udGFpbnM6IFRZUEVTLFxuICAgIGtleXdvcmRzOiBMSVRFUkFMUyxcbiAgICBpbGxlZ2FsOiAnXFxcXFMnXG4gIH07XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaGxqcykge1xuICByZXR1cm4ge1xuICAgIGNvbnRhaW5zOiBbXG4gICAgICAvLyBoaWdobGlnaHQgaGVhZGVyc1xuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICdoZWFkZXInLFxuICAgICAgICB2YXJpYW50czogW1xuICAgICAgICAgIHsgYmVnaW46ICdeI3sxLDZ9JywgZW5kOiAnJCcgfSxcbiAgICAgICAgICB7IGJlZ2luOiAnXi4rP1xcXFxuWz0tXXsyLH0kJyB9XG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICAvLyBpbmxpbmUgaHRtbFxuICAgICAge1xuICAgICAgICBiZWdpbjogJzwnLCBlbmQ6ICc+JyxcbiAgICAgICAgc3ViTGFuZ3VhZ2U6ICd4bWwnLFxuICAgICAgICByZWxldmFuY2U6IDBcbiAgICAgIH0sXG4gICAgICAvLyBsaXN0cyAoaW5kaWNhdG9ycyBvbmx5KVxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICdidWxsZXQnLFxuICAgICAgICBiZWdpbjogJ14oWyorLV18KFxcXFxkK1xcXFwuKSlcXFxccysnXG4gICAgICB9LFxuICAgICAgLy8gc3Ryb25nIHNlZ21lbnRzXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ3N0cm9uZycsXG4gICAgICAgIGJlZ2luOiAnWypfXXsyfS4rP1sqX117Mn0nXG4gICAgICB9LFxuICAgICAgLy8gZW1waGFzaXMgc2VnbWVudHNcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAnZW1waGFzaXMnLFxuICAgICAgICB2YXJpYW50czogW1xuICAgICAgICAgIHsgYmVnaW46ICdcXFxcKi4rP1xcXFwqJyB9LFxuICAgICAgICAgIHsgYmVnaW46ICdfLis/XydcbiAgICAgICAgICAsIHJlbGV2YW5jZTogMFxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIC8vIGJsb2NrcXVvdGVzXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ2Jsb2NrcXVvdGUnLFxuICAgICAgICBiZWdpbjogJ14+XFxcXHMrJywgZW5kOiAnJCdcbiAgICAgIH0sXG4gICAgICAvLyBjb2RlIHNuaXBwZXRzXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ2NvZGUnLFxuICAgICAgICB2YXJpYW50czogW1xuICAgICAgICAgIHsgYmVnaW46ICdgLis/YCcgfSxcbiAgICAgICAgICB7IGJlZ2luOiAnXiggezR9fFxcdCknLCBlbmQ6ICckJ1xuICAgICAgICAgICwgcmVsZXZhbmNlOiAwXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgLy8gaG9yaXpvbnRhbCBydWxlc1xuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICdob3Jpem9udGFsX3J1bGUnLFxuICAgICAgICBiZWdpbjogJ15bLVxcXFwqXXszLH0nLCBlbmQ6ICckJ1xuICAgICAgfSxcbiAgICAgIC8vIHVzaW5nIGxpbmtzIC0gdGl0bGUgYW5kIGxpbmtcbiAgICAgIHtcbiAgICAgICAgYmVnaW46ICdcXFxcWy4rP1xcXFxdW1xcXFwoXFxcXFtdLis/W1xcXFwpXFxcXF1dJyxcbiAgICAgICAgcmV0dXJuQmVnaW46IHRydWUsXG4gICAgICAgIGNvbnRhaW5zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAnbGlua19sYWJlbCcsXG4gICAgICAgICAgICBiZWdpbjogJ1xcXFxbJywgZW5kOiAnXFxcXF0nLFxuICAgICAgICAgICAgZXhjbHVkZUJlZ2luOiB0cnVlLFxuICAgICAgICAgICAgcmV0dXJuRW5kOiB0cnVlLFxuICAgICAgICAgICAgcmVsZXZhbmNlOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICdsaW5rX3VybCcsXG4gICAgICAgICAgICBiZWdpbjogJ1xcXFxdXFxcXCgnLCBlbmQ6ICdcXFxcKScsXG4gICAgICAgICAgICBleGNsdWRlQmVnaW46IHRydWUsIGV4Y2x1ZGVFbmQ6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2xpbmtfcmVmZXJlbmNlJyxcbiAgICAgICAgICAgIGJlZ2luOiAnXFxcXF1cXFxcWycsIGVuZDogJ1xcXFxdJyxcbiAgICAgICAgICAgIGV4Y2x1ZGVCZWdpbjogdHJ1ZSwgZXhjbHVkZUVuZDogdHJ1ZSxcbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIHJlbGV2YW5jZTogMTBcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJlZ2luOiAnXlxcXFxbXFwuK1xcXFxdOicsIGVuZDogJyQnLFxuICAgICAgICByZXR1cm5CZWdpbjogdHJ1ZSxcbiAgICAgICAgY29udGFpbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICdsaW5rX3JlZmVyZW5jZScsXG4gICAgICAgICAgICBiZWdpbjogJ1xcXFxbJywgZW5kOiAnXFxcXF0nLFxuICAgICAgICAgICAgZXhjbHVkZUJlZ2luOiB0cnVlLCBleGNsdWRlRW5kOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICdsaW5rX3VybCcsXG4gICAgICAgICAgICBiZWdpbjogJ1xcXFxzJywgZW5kOiAnJCdcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICBdXG4gIH07XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaGxqcykge1xuICB2YXIgWE1MX0lERU5UX1JFID0gJ1tBLVphLXowLTlcXFxcLl86LV0rJztcbiAgdmFyIFBIUCA9IHtcbiAgICBiZWdpbjogLzxcXD8ocGhwKT8oPyFcXHcpLywgZW5kOiAvXFw/Pi8sXG4gICAgc3ViTGFuZ3VhZ2U6ICdwaHAnLCBzdWJMYW5ndWFnZU1vZGU6ICdjb250aW51b3VzJ1xuICB9O1xuICB2YXIgVEFHX0lOVEVSTkFMUyA9IHtcbiAgICBlbmRzV2l0aFBhcmVudDogdHJ1ZSxcbiAgICBpbGxlZ2FsOiAvPC8sXG4gICAgcmVsZXZhbmNlOiAwLFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICBQSFAsXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ2F0dHJpYnV0ZScsXG4gICAgICAgIGJlZ2luOiBYTUxfSURFTlRfUkUsXG4gICAgICAgIHJlbGV2YW5jZTogMFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgYmVnaW46ICc9JyxcbiAgICAgICAgcmVsZXZhbmNlOiAwLFxuICAgICAgICBjb250YWluczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3ZhbHVlJyxcbiAgICAgICAgICAgIHZhcmlhbnRzOiBbXG4gICAgICAgICAgICAgIHtiZWdpbjogL1wiLywgZW5kOiAvXCIvfSxcbiAgICAgICAgICAgICAge2JlZ2luOiAvJy8sIGVuZDogLycvfSxcbiAgICAgICAgICAgICAge2JlZ2luOiAvW15cXHNcXC8+XSsvfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBhbGlhc2VzOiBbJ2h0bWwnXSxcbiAgICBjYXNlX2luc2Vuc2l0aXZlOiB0cnVlLFxuICAgIGNvbnRhaW5zOiBbXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ2RvY3R5cGUnLFxuICAgICAgICBiZWdpbjogJzwhRE9DVFlQRScsIGVuZDogJz4nLFxuICAgICAgICByZWxldmFuY2U6IDEwLFxuICAgICAgICBjb250YWluczogW3tiZWdpbjogJ1xcXFxbJywgZW5kOiAnXFxcXF0nfV1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ2NvbW1lbnQnLFxuICAgICAgICBiZWdpbjogJzwhLS0nLCBlbmQ6ICctLT4nLFxuICAgICAgICByZWxldmFuY2U6IDEwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICdjZGF0YScsXG4gICAgICAgIGJlZ2luOiAnPFxcXFwhXFxcXFtDREFUQVxcXFxbJywgZW5kOiAnXFxcXF1cXFxcXT4nLFxuICAgICAgICByZWxldmFuY2U6IDEwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICd0YWcnLFxuICAgICAgICAvKlxuICAgICAgICBUaGUgbG9va2FoZWFkIHBhdHRlcm4gKD89Li4uKSBlbnN1cmVzIHRoYXQgJ2JlZ2luJyBvbmx5IG1hdGNoZXNcbiAgICAgICAgJzxzdHlsZScgYXMgYSBzaW5nbGUgd29yZCwgZm9sbG93ZWQgYnkgYSB3aGl0ZXNwYWNlIG9yIGFuXG4gICAgICAgIGVuZGluZyBicmFrZXQuIFRoZSAnJCcgaXMgbmVlZGVkIGZvciB0aGUgbGV4ZW1lIHRvIGJlIHJlY29nbml6ZWRcbiAgICAgICAgYnkgaGxqcy5zdWJNb2RlKCkgdGhhdCB0ZXN0cyBsZXhlbWVzIG91dHNpZGUgdGhlIHN0cmVhbS5cbiAgICAgICAgKi9cbiAgICAgICAgYmVnaW46ICc8c3R5bGUoPz1cXFxcc3w+fCQpJywgZW5kOiAnPicsXG4gICAgICAgIGtleXdvcmRzOiB7dGl0bGU6ICdzdHlsZSd9LFxuICAgICAgICBjb250YWluczogW1RBR19JTlRFUk5BTFNdLFxuICAgICAgICBzdGFydHM6IHtcbiAgICAgICAgICBlbmQ6ICc8L3N0eWxlPicsIHJldHVybkVuZDogdHJ1ZSxcbiAgICAgICAgICBzdWJMYW5ndWFnZTogJ2NzcydcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgY2xhc3NOYW1lOiAndGFnJyxcbiAgICAgICAgLy8gU2VlIHRoZSBjb21tZW50IGluIHRoZSA8c3R5bGUgdGFnIGFib3V0IHRoZSBsb29rYWhlYWQgcGF0dGVyblxuICAgICAgICBiZWdpbjogJzxzY3JpcHQoPz1cXFxcc3w+fCQpJywgZW5kOiAnPicsXG4gICAgICAgIGtleXdvcmRzOiB7dGl0bGU6ICdzY3JpcHQnfSxcbiAgICAgICAgY29udGFpbnM6IFtUQUdfSU5URVJOQUxTXSxcbiAgICAgICAgc3RhcnRzOiB7XG4gICAgICAgICAgZW5kOiAnPC9zY3JpcHQ+JywgcmV0dXJuRW5kOiB0cnVlLFxuICAgICAgICAgIHN1Ykxhbmd1YWdlOiAnamF2YXNjcmlwdCdcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgYmVnaW46ICc8JScsIGVuZDogJyU+JyxcbiAgICAgICAgc3ViTGFuZ3VhZ2U6ICd2YnNjcmlwdCdcbiAgICAgIH0sXG4gICAgICBQSFAsXG4gICAgICB7XG4gICAgICAgIGNsYXNzTmFtZTogJ3BpJyxcbiAgICAgICAgYmVnaW46IC88XFw/XFx3Ky8sIGVuZDogL1xcPz4vLFxuICAgICAgICByZWxldmFuY2U6IDEwXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBjbGFzc05hbWU6ICd0YWcnLFxuICAgICAgICBiZWdpbjogJzwvPycsIGVuZDogJy8/PicsXG4gICAgICAgIGNvbnRhaW5zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAndGl0bGUnLCBiZWdpbjogJ1teIC8+PF0rJywgcmVsZXZhbmNlOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBUQUdfSU5URVJOQUxTXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICBdXG4gIH07XG59OyIsIi8vIGh0dHA6Ly9oaWdobGlnaHRqcy5yZWFkdGhlZG9jcy5vcmcvZW4vbGF0ZXN0L2Nzcy1jbGFzc2VzLXJlZmVyZW5jZS5odG1sXG5cbm1vZHVsZS5leHBvcnRzID0gW1xuICAnYWRkaXRpb24nLFxuICAnYW5ub3RhaW9uJyxcbiAgJ2Fubm90YXRpb24nLFxuICAnYXJndW1lbnQnLFxuICAnYXJyYXknLFxuICAnYXRfcnVsZScsXG4gICdhdHRyX3NlbGVjdG9yJyxcbiAgJ2F0dHJpYnV0ZScsXG4gICdiZWdpbi1ibG9jaycsXG4gICdibG9ja3F1b3RlJyxcbiAgJ2JvZHknLFxuICAnYnVpbHRfaW4nLFxuICAnYnVsbGV0JyxcbiAgJ2NicmFja2V0JyxcbiAgJ2NkYXRhJyxcbiAgJ2NlbGwnLFxuICAnY2hhbmdlJyxcbiAgJ2NoYXInLFxuICAnY2h1bmsnLFxuICAnY2xhc3MnLFxuICAnY29kZScsXG4gICdjb2xsZWN0aW9uJyxcbiAgJ2NvbW1hbmQnLFxuICAnY29tbWFuZHMnLFxuICAnY29tbWVuJyxcbiAgJ2NvbW1lbnQnLFxuICAnY29uc3RhbnQnLFxuICAnY29udGFpbmVyJyxcbiAgJ2RhcnRkb2MnLFxuICAnZGF0ZScsXG4gICdkZWNvcmF0b3InLFxuICAnZGVmYXVsdCcsXG4gICdkZWxldGlvbicsXG4gICdkb2N0eXBlJyxcbiAgJ2VtcGhhc2lzJyxcbiAgJ2VuZC1ibG9jaycsXG4gICdlbnZ2YXInLFxuICAnZXhwcmVzc2lvbicsXG4gICdmaWxlbmFtZScsXG4gICdmaWx0ZXInLFxuICAnZmxvdycsXG4gICdmb3JlaWduJyxcbiAgJ2Zvcm11bGEnLFxuICAnZnVuYycsXG4gICdmdW5jdGlvbicsXG4gICdmdW5jdGlvbl9uYW1lJyxcbiAgJ2dlbmVyaWNzJyxcbiAgJ2hlYWRlcicsXG4gICdoZXhjb2xvcicsXG4gICdob3Jpem9udGFsX3J1bGUnLFxuICAnaWQnLFxuICAnaW1wb3J0JyxcbiAgJ2ltcG9ydGFudCcsXG4gICdpbmZpeCcsXG4gICdpbmhlcml0YW5jZScsXG4gICdpbnB1dCcsXG4gICdqYXZhZG9jJyxcbiAgJ2phdmFkb2N0YWcnLFxuICAna2V5d29yZCcsXG4gICdrZXl3b3JkcycsXG4gICdsYWJlbCcsXG4gICdsaW5rX2xhYmVsJyxcbiAgJ2xpbmtfcmVmZXJlbmNlJyxcbiAgJ2xpbmtfdXJsJyxcbiAgJ2xpc3QnLFxuICAnbGl0ZXJhbCcsXG4gICdsb2NhbHZhcnMnLFxuICAnbG9uZ19icmFja2V0cycsXG4gICdtYXRyaXgnLFxuICAnbW9kdWxlJyxcbiAgJ251bWJlcicsXG4gICdvcGVyYXRvcicsXG4gICdvdXRwdXQnLFxuICAncGFja2FnZScsXG4gICdwYXJhbScsXG4gICdwYXJhbWV0ZXInLFxuICAncGFyYW1zJyxcbiAgJ3BhcmVudCcsXG4gICdwaHBkb2MnLFxuICAncGknLFxuICAncG9kJyxcbiAgJ3BwJyxcbiAgJ3ByYWdtYScsXG4gICdwcmVwcm9jZXNzb3InLFxuICAncHJvbXB0JyxcbiAgJ3Byb3BlcnR5JyxcbiAgJ3BzZXVkbycsXG4gICdxdW90ZWQnLFxuICAncmVjb3JkX25hbWUnLFxuICAncmVnZXgnLFxuICAncmVnZXhwJyxcbiAgJ3JlcXVlc3QnLFxuICAncmVzZXJ2ZWQnLFxuICAncmVzdF9hcmcnLFxuICAncnVsZXMnLFxuICAnc2hhZGVyJyxcbiAgJ3NoYWRpbmcnLFxuICAnc2hlYmFuZycsXG4gICdzcGVjaWFsJyxcbiAgJ3NxYnJhY2tldCcsXG4gICdzdGF0dXMnLFxuICAnc3RsX2NvbnRhaW5lcicsXG4gICdzdHJlYW0nLFxuICAnc3RyaW5nJyxcbiAgJ3N0cm9uZycsXG4gICdzdWInLFxuICAnc3Vic3QnLFxuICAnc3VtbWFyeScsXG4gICdzeW1ib2wnLFxuICAndGFnJyxcbiAgJ3RlbXBsYXRlX2NvbW1lbnQnLFxuICAndGVtcGxhdGVfdGFnJyxcbiAgJ3RpdGxlJyxcbiAgJ3R5cGUnLFxuICAndHlwZWRlZicsXG4gICd0eXBlbmFtZScsXG4gICd2YWx1ZScsXG4gICd2YXJfZXhwYW5kJyxcbiAgJ3ZhcmlhYmxlJyxcbiAgJ3dpbnV0aWxzJyxcbiAgJ3htbERvY1RhZycsXG4gICd5YXJkb2N0YWcnXG5dXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB0b01hcCA9IHJlcXVpcmUoJy4vdG9NYXAnKTtcbnZhciB1cmlzID0gWydiYWNrZ3JvdW5kJywgJ2Jhc2UnLCAnY2l0ZScsICdocmVmJywgJ2xvbmdkZXNjJywgJ3NyYycsICd1c2VtYXAnXTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHVyaXM6IHRvTWFwKHVyaXMpIC8vIGF0dHJpYnV0ZXMgdGhhdCBoYXZlIGFuIGhyZWYgYW5kIGhlbmNlIG5lZWQgdG8gYmUgc2FuaXRpemVkXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZGVmYXVsdHMgPSB7XG4gIGFsbG93ZWRBdHRyaWJ1dGVzOiB7XG4gICAgYTogWydocmVmJywgJ25hbWUnLCAndGFyZ2V0JywgJ3RpdGxlJywgJ2FyaWEtbGFiZWwnXSxcbiAgICBpZnJhbWU6IFsnYWxsb3dmdWxsc2NyZWVuJywgJ2ZyYW1lYm9yZGVyJywgJ3NyYyddLFxuICAgIGltZzogWydzcmMnLCAnYWx0JywgJ3RpdGxlJywgJ2FyaWEtbGFiZWwnXVxuICB9LFxuICBhbGxvd2VkQ2xhc3Nlczoge30sXG4gIGFsbG93ZWRTY2hlbWVzOiBbJ2h0dHAnLCAnaHR0cHMnLCAnbWFpbHRvJ10sXG4gIGFsbG93ZWRUYWdzOiBbXG4gICAgJ2EnLCAnYXJ0aWNsZScsICdiJywgJ2Jsb2NrcXVvdGUnLCAnYnInLCAnY2FwdGlvbicsICdjb2RlJywgJ2RlbCcsICdkZXRhaWxzJywgJ2RpdicsICdlbScsXG4gICAgJ2gxJywgJ2gyJywgJ2gzJywgJ2g0JywgJ2g1JywgJ2g2JywgJ2hyJywgJ2knLCAnaW1nJywgJ2lucycsICdrYmQnLCAnbGknLCAnbWFpbicsXG4gICAgJ29sJywgJ3AnLCAncHJlJywgJ3NlY3Rpb24nLCAnc3BhbicsICdzdHJpa2UnLCAnc3Ryb25nJywgJ3N1YicsICdzdW1tYXJ5JywgJ3N1cCcsICd0YWJsZScsXG4gICAgJ3Rib2R5JywgJ3RkJywgJ3RoJywgJ3RoZWFkJywgJ3RyJywgJ3VsJ1xuICBdLFxuICBmaWx0ZXI6IG51bGxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB0b01hcCA9IHJlcXVpcmUoJy4vdG9NYXAnKTtcbnZhciB2b2lkcyA9IFsnYXJlYScsICdicicsICdjb2wnLCAnaHInLCAnaW1nJywgJ3dicicsICdpbnB1dCcsICdiYXNlJywgJ2Jhc2Vmb250JywgJ2xpbmsnLCAnbWV0YSddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdm9pZHM6IHRvTWFwKHZvaWRzKVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlID0gcmVxdWlyZSgnaGUnKTtcbnZhciBhc3NpZ24gPSByZXF1aXJlKCdhc3NpZ25tZW50Jyk7XG52YXIgcGFyc2VyID0gcmVxdWlyZSgnLi9wYXJzZXInKTtcbnZhciBzYW5pdGl6ZXIgPSByZXF1aXJlKCcuL3Nhbml0aXplcicpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG5mdW5jdGlvbiBpbnNhbmUgKGh0bWwsIG9wdGlvbnMsIHN0cmljdCkge1xuICB2YXIgYnVmZmVyID0gW107XG4gIHZhciBjb25maWd1cmF0aW9uID0gc3RyaWN0ID09PSB0cnVlID8gb3B0aW9ucyA6IGFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICB2YXIgaGFuZGxlciA9IHNhbml0aXplcihidWZmZXIsIGNvbmZpZ3VyYXRpb24pO1xuXG4gIHBhcnNlcihodG1sLCBoYW5kbGVyKTtcblxuICByZXR1cm4gYnVmZmVyLmpvaW4oJycpO1xufVxuXG5pbnNhbmUuZGVmYXVsdHMgPSBkZWZhdWx0cztcbm1vZHVsZS5leHBvcnRzID0gaW5zYW5lO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxvd2VyY2FzZSAoc3RyaW5nKSB7XG4gIHJldHVybiB0eXBlb2Ygc3RyaW5nID09PSAnc3RyaW5nJyA/IHN0cmluZy50b0xvd2VyQ2FzZSgpIDogc3RyaW5nO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlID0gcmVxdWlyZSgnaGUnKTtcbnZhciBsb3dlcmNhc2UgPSByZXF1aXJlKCcuL2xvd2VyY2FzZScpO1xudmFyIGF0dHJpYnV0ZXMgPSByZXF1aXJlKCcuL2F0dHJpYnV0ZXMnKTtcbnZhciBlbGVtZW50cyA9IHJlcXVpcmUoJy4vZWxlbWVudHMnKTtcbnZhciByc3RhcnQgPSAvXjxcXHMqKFtcXHc6LV0rKSgoPzpcXHMrW1xcdzotXSsoPzpcXHMqPVxccyooPzooPzpcIlteXCJdKlwiKXwoPzonW14nXSonKXxbXj5cXHNdKykpPykqKVxccyooXFwvPylcXHMqPi87XG52YXIgcmVuZCA9IC9ePFxccypcXC9cXHMqKFtcXHc6LV0rKVtePl0qPi87XG52YXIgcmF0dHJzID0gLyhbXFx3Oi1dKykoPzpcXHMqPVxccyooPzooPzpcIigoPzpbXlwiXSkqKVwiKXwoPzonKCg/OlteJ10pKiknKXwoW14+XFxzXSspKSk/L2c7XG52YXIgcnRhZyA9IC9ePC87XG52YXIgcnRhZ2VuZCA9IC9ePFxccypcXC8vO1xuXG5mdW5jdGlvbiBjcmVhdGVTdGFjayAoKSB7XG4gIHZhciBzdGFjayA9IFtdO1xuICBzdGFjay5sYXN0SXRlbSA9IGZ1bmN0aW9uIGxhc3RJdGVtICgpIHtcbiAgICByZXR1cm4gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gIH07XG4gIHJldHVybiBzdGFjaztcbn1cblxuZnVuY3Rpb24gcGFyc2VyIChodG1sLCBoYW5kbGVyKSB7XG4gIHZhciBzdGFjayA9IGNyZWF0ZVN0YWNrKCk7XG4gIHZhciBsYXN0ID0gaHRtbDtcbiAgdmFyIGNoYXJzO1xuXG4gIHdoaWxlIChodG1sKSB7XG4gICAgcGFyc2VQYXJ0KCk7XG4gIH1cbiAgcGFyc2VFbmRUYWcoKTsgLy8gY2xlYW4gdXAgYW55IHJlbWFpbmluZyB0YWdzXG5cbiAgZnVuY3Rpb24gcGFyc2VQYXJ0ICgpIHtcbiAgICBjaGFycyA9IHRydWU7XG4gICAgcGFyc2VUYWcoKTtcbiAgICBpZiAoaHRtbCA9PT0gbGFzdCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnNhbmUgcGFyc2VyIGVycm9yOiAnICsgaHRtbCk7XG4gICAgfVxuICAgIGxhc3QgPSBodG1sO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VUYWcgKCkge1xuICAgIGlmIChodG1sLnN1YnN0cigwLCA0KSA9PT0gJzwhLS0nKSB7IC8vIGNvbW1lbnRzXG4gICAgICBwYXJzZUNvbW1lbnQoKTtcbiAgICB9IGVsc2UgaWYgKHJ0YWdlbmQudGVzdChodG1sKSkge1xuICAgICAgcGFyc2VFZGdlKHJlbmQsIHBhcnNlRW5kVGFnKTtcbiAgICB9IGVsc2UgaWYgKHJ0YWcudGVzdChodG1sKSkge1xuICAgICAgcGFyc2VFZGdlKHJzdGFydCwgcGFyc2VTdGFydFRhZyk7XG4gICAgfVxuICAgIHBhcnNlVGFnRGVjb2RlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUVkZ2UgKHJlZ2V4LCBwYXJzZXIpIHtcbiAgICB2YXIgbWF0Y2ggPSBodG1sLm1hdGNoKHJlZ2V4KTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIGh0bWwgPSBodG1sLnN1YnN0cmluZyhtYXRjaFswXS5sZW5ndGgpO1xuICAgICAgbWF0Y2hbMF0ucmVwbGFjZShyZWdleCwgcGFyc2VyKTtcbiAgICAgIGNoYXJzID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VDb21tZW50ICgpIHtcbiAgICB2YXIgaW5kZXggPSBodG1sLmluZGV4T2YoJy0tPicpO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICBpZiAoaGFuZGxlci5jb21tZW50KSB7XG4gICAgICAgIGhhbmRsZXIuY29tbWVudChodG1sLnN1YnN0cmluZyg0LCBpbmRleCkpO1xuICAgICAgfVxuICAgICAgaHRtbCA9IGh0bWwuc3Vic3RyaW5nKGluZGV4ICsgMyk7XG4gICAgICBjaGFycyA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlVGFnRGVjb2RlICgpIHtcbiAgICBpZiAoIWNoYXJzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0ZXh0O1xuICAgIHZhciBpbmRleCA9IGh0bWwuaW5kZXhPZignPCcpO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB0ZXh0ID0gaHRtbC5zdWJzdHJpbmcoMCwgaW5kZXgpO1xuICAgICAgaHRtbCA9IGh0bWwuc3Vic3RyaW5nKGluZGV4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGV4dCA9IGh0bWw7XG4gICAgICBodG1sID0gJyc7XG4gICAgfVxuICAgIGlmIChoYW5kbGVyLmNoYXJzKSB7XG4gICAgICBoYW5kbGVyLmNoYXJzKGhlLmRlY29kZSh0ZXh0KSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VTdGFydFRhZyAodGFnLCB0YWdOYW1lLCByZXN0LCB1bmFyeSkge1xuICAgIHZhciBhdHRycyA9IHt9O1xuICAgIHZhciBsb3cgPSBsb3dlcmNhc2UodGFnTmFtZSk7XG4gICAgdmFyIHUgPSBlbGVtZW50cy52b2lkc1tsb3ddIHx8ICEhdW5hcnk7XG5cbiAgICByZXN0LnJlcGxhY2UocmF0dHJzLCBhdHRyUmVwbGFjZXIpO1xuXG4gICAgaWYgKCF1KSB7XG4gICAgICBzdGFjay5wdXNoKGxvdyk7XG4gICAgfVxuICAgIGlmIChoYW5kbGVyLnN0YXJ0KSB7XG4gICAgICBoYW5kbGVyLnN0YXJ0KGxvdywgYXR0cnMsIHUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGF0dHJSZXBsYWNlciAobWF0Y2gsIG5hbWUsIGRvdWJsZVF1b3RlZFZhbHVlLCBzaW5nbGVRdW90ZWRWYWx1ZSwgdW5xdW90ZWRWYWx1ZSkge1xuICAgICAgYXR0cnNbbmFtZV0gPSBoZS5kZWNvZGUoZG91YmxlUXVvdGVkVmFsdWUgfHwgc2luZ2xlUXVvdGVkVmFsdWUgfHwgdW5xdW90ZWRWYWx1ZSB8fCAnJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VFbmRUYWcgKHRhZywgdGFnTmFtZSkge1xuICAgIHZhciBpO1xuICAgIHZhciBwb3MgPSAwO1xuICAgIHZhciBsb3cgPSBsb3dlcmNhc2UodGFnTmFtZSk7XG4gICAgaWYgKGxvdykge1xuICAgICAgZm9yIChwb3MgPSBzdGFjay5sZW5ndGggLSAxOyBwb3MgPj0gMDsgcG9zLS0pIHtcbiAgICAgICAgaWYgKHN0YWNrW3Bvc10gPT09IGxvdykge1xuICAgICAgICAgIGJyZWFrOyAvLyBmaW5kIHRoZSBjbG9zZXN0IG9wZW5lZCB0YWcgb2YgdGhlIHNhbWUgdHlwZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwb3MgPj0gMCkge1xuICAgICAgZm9yIChpID0gc3RhY2subGVuZ3RoIC0gMTsgaSA+PSBwb3M7IGktLSkge1xuICAgICAgICBpZiAoaGFuZGxlci5lbmQpIHsgLy8gY2xvc2UgYWxsIHRoZSBvcGVuIGVsZW1lbnRzLCB1cCB0aGUgc3RhY2tcbiAgICAgICAgICBoYW5kbGVyLmVuZChzdGFja1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHN0YWNrLmxlbmd0aCA9IHBvcztcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZSA9IHJlcXVpcmUoJ2hlJyk7XG52YXIgbG93ZXJjYXNlID0gcmVxdWlyZSgnLi9sb3dlcmNhc2UnKTtcbnZhciBhdHRyaWJ1dGVzID0gcmVxdWlyZSgnLi9hdHRyaWJ1dGVzJyk7XG5cbmZ1bmN0aW9uIHNhbml0aXplciAoYnVmZmVyLCBvcHRpb25zKSB7XG4gIHZhciBsYXN0O1xuICB2YXIgY29udGV4dDtcbiAgdmFyIG8gPSBvcHRpb25zIHx8IHt9O1xuXG4gIHJlc2V0KCk7XG5cbiAgcmV0dXJuIHtcbiAgICBzdGFydDogc3RhcnQsXG4gICAgZW5kOiBlbmQsXG4gICAgY2hhcnM6IGNoYXJzXG4gIH07XG5cbiAgZnVuY3Rpb24gb3V0ICh2YWx1ZSkge1xuICAgIGJ1ZmZlci5wdXNoKHZhbHVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0ICh0YWcsIGF0dHJzLCB1bmFyeSkge1xuICAgIHZhciBsb3cgPSBsb3dlcmNhc2UodGFnKTtcblxuICAgIGlmIChjb250ZXh0Lmlnbm9yaW5nKSB7XG4gICAgICBpZ25vcmUobG93KTsgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoKG8uYWxsb3dlZFRhZ3MgfHwgW10pLmluZGV4T2YobG93KSA9PT0gLTEpIHtcbiAgICAgIGlnbm9yZShsb3cpOyByZXR1cm47XG4gICAgfVxuICAgIGlmIChvLmZpbHRlciAmJiAhby5maWx0ZXIoeyB0YWc6IGxvdywgYXR0cnM6IGF0dHJzIH0pKSB7XG4gICAgICBpZ25vcmUobG93KTsgcmV0dXJuO1xuICAgIH1cblxuICAgIG91dCgnPCcpO1xuICAgIG91dChsb3cpO1xuICAgIE9iamVjdC5rZXlzKGF0dHJzKS5mb3JFYWNoKHBhcnNlKTtcbiAgICBvdXQodW5hcnkgPyAnLz4nIDogJz4nKTtcblxuICAgIGZ1bmN0aW9uIHBhcnNlIChrZXkpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGF0dHJzW2tleV07XG4gICAgICB2YXIgY2xhc3Nlc09rID0gKG8uYWxsb3dlZENsYXNzZXMgfHwge30pW2xvd10gfHwgW107XG4gICAgICB2YXIgYXR0cnNPayA9IChvLmFsbG93ZWRBdHRyaWJ1dGVzIHx8IHt9KVtsb3ddIHx8IFtdO1xuICAgICAgdmFyIHZhbGlkO1xuICAgICAgdmFyIGxrZXkgPSBsb3dlcmNhc2Uoa2V5KTtcbiAgICAgIGlmIChsa2V5ID09PSAnY2xhc3MnICYmIGF0dHJzT2suaW5kZXhPZihsa2V5KSA9PT0gLTEpIHtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5zcGxpdCgnICcpLmZpbHRlcihpc1ZhbGlkQ2xhc3MpLmpvaW4oJyAnKS50cmltKCk7XG4gICAgICAgIHZhbGlkID0gdmFsdWUubGVuZ3RoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsaWQgPSBhdHRyc09rLmluZGV4T2YobGtleSkgIT09IC0xICYmIChhdHRyaWJ1dGVzLnVyaXNbbGtleV0gIT09IHRydWUgfHwgdGVzdFVybCh2YWx1ZSkpO1xuICAgICAgfVxuICAgICAgaWYgKHZhbGlkKSB7XG4gICAgICAgIG91dCgnICcpO1xuICAgICAgICBvdXQoa2V5KTtcbiAgICAgICAgb3V0KCc9XCInKTtcbiAgICAgICAgb3V0KGhlLmVuY29kZSh2YWx1ZSkpO1xuICAgICAgICBvdXQoJ1wiJyk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBpc1ZhbGlkQ2xhc3MgKGNsYXNzTmFtZSkge1xuICAgICAgICByZXR1cm4gY2xhc3Nlc09rICYmIGNsYXNzZXNPay5pbmRleE9mKGNsYXNzTmFtZSkgIT09IC0xO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVuZCAodGFnKSB7XG4gICAgdmFyIGxvdyA9IGxvd2VyY2FzZSh0YWcpO1xuICAgIHZhciBhbGxvd2VkID0gKG8uYWxsb3dlZFRhZ3MgfHwgW10pLmluZGV4T2YobG93KSAhPT0gLTE7XG4gICAgaWYgKGFsbG93ZWQpIHtcbiAgICAgIGlmIChjb250ZXh0Lmlnbm9yaW5nID09PSBmYWxzZSkge1xuICAgICAgICBvdXQoJzwvJyk7XG4gICAgICAgIG91dChsb3cpO1xuICAgICAgICBvdXQoJz4nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVuaWdub3JlKGxvdyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHVuaWdub3JlKGxvdyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdGVzdFVybCAodGV4dCkge1xuICAgIHZhciBzdGFydCA9IHRleHRbMF07XG4gICAgaWYgKHN0YXJ0ID09PSAnIycgfHwgc3RhcnQgPT09ICcvJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHZhciBjb2xvbiA9IHRleHQuaW5kZXhPZignOicpO1xuICAgIGlmIChjb2xvbiA9PT0gLTEpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB2YXIgcXVlc3Rpb25tYXJrID0gdGV4dC5pbmRleE9mKCc/Jyk7XG4gICAgaWYgKHF1ZXN0aW9ubWFyayAhPT0gLTEgJiYgY29sb24gPiBxdWVzdGlvbm1hcmspIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB2YXIgaGFzaCA9IHRleHQuaW5kZXhPZignIycpO1xuICAgIGlmIChoYXNoICE9PSAtMSAmJiBjb2xvbiA+IGhhc2gpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gby5hbGxvd2VkU2NoZW1lcy5zb21lKG1hdGNoZXMpO1xuXG4gICAgZnVuY3Rpb24gbWF0Y2hlcyAoc2NoZW1lKSB7XG4gICAgICByZXR1cm4gdGV4dC5pbmRleE9mKHNjaGVtZSArICc6JykgPT09IDA7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hhcnMgKHRleHQpIHtcbiAgICBpZiAoY29udGV4dC5pZ25vcmluZyA9PT0gZmFsc2UpIHtcbiAgICAgIG91dChoZS5lbmNvZGUodGV4dCkpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlnbm9yZSAodGFnKSB7XG4gICAgaWYgKGNvbnRleHQuaWdub3JpbmcgPT09IGZhbHNlKSB7XG4gICAgICBjb250ZXh0ID0geyBpZ25vcmluZzogdGFnLCBkZXB0aDogMSB9O1xuICAgIH0gZWxzZSBpZiAoY29udGV4dC5pZ25vcmluZyA9PT0gdGFnKSB7XG4gICAgICBjb250ZXh0LmRlcHRoKys7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdW5pZ25vcmUgKHRhZykge1xuICAgIGlmIChjb250ZXh0Lmlnbm9yaW5nID09PSB0YWcpIHtcbiAgICAgIGlmICgtLWNvbnRleHQuZGVwdGggPD0gMCkge1xuICAgICAgICByZXNldCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0ICgpIHtcbiAgICBjb250ZXh0ID0geyBpZ25vcmluZzogZmFsc2UsIGRlcHRoOiAwIH07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzYW5pdGl6ZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlc2NhcGVzID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gIFwiJ1wiOiAnJiMzOTsnXG59O1xudmFyIHVuZXNjYXBlcyA9IHtcbiAgJyZhbXA7JzogJyYnLFxuICAnJmx0Oyc6ICc8JyxcbiAgJyZndDsnOiAnPicsXG4gICcmcXVvdDsnOiAnXCInLFxuICAnJiMzOTsnOiBcIidcIlxufTtcbnZhciByZXNjYXBlZCA9IC8oJmFtcDt8Jmx0O3wmZ3Q7fCZxdW90O3wmIzM5OykvZztcbnZhciBydW5lc2NhcGVkID0gL1smPD5cIiddL2c7XG5cbmZ1bmN0aW9uIGVzY2FwZUh0bWxDaGFyIChtYXRjaCkge1xuICByZXR1cm4gZXNjYXBlc1ttYXRjaF07XG59XG5mdW5jdGlvbiB1bmVzY2FwZUh0bWxDaGFyIChtYXRjaCkge1xuICByZXR1cm4gdW5lc2NhcGVzW21hdGNoXTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlSHRtbCAodGV4dCkge1xuICByZXR1cm4gdGV4dCA9PSBudWxsID8gJycgOiBTdHJpbmcodGV4dCkucmVwbGFjZShydW5lc2NhcGVkLCBlc2NhcGVIdG1sQ2hhcik7XG59XG5cbmZ1bmN0aW9uIHVuZXNjYXBlSHRtbCAoaHRtbCkge1xuICByZXR1cm4gaHRtbCA9PSBudWxsID8gJycgOiBTdHJpbmcoaHRtbCkucmVwbGFjZShyZXNjYXBlZCwgdW5lc2NhcGVIdG1sQ2hhcik7XG59XG5cbmVzY2FwZUh0bWwub3B0aW9ucyA9IHVuZXNjYXBlSHRtbC5vcHRpb25zID0ge307XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBlbmNvZGU6IGVzY2FwZUh0bWwsXG4gIGVzY2FwZTogZXNjYXBlSHRtbCxcbiAgZGVjb2RlOiB1bmVzY2FwZUh0bWwsXG4gIHVuZXNjYXBlOiB1bmVzY2FwZUh0bWwsXG4gIHZlcnNpb246ICcxLjAuMC1icm93c2VyJ1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gdG9NYXAgKGxpc3QpIHtcbiAgcmV0dXJuIGxpc3QucmVkdWNlKGFzS2V5LCB7fSk7XG59XG5cbmZ1bmN0aW9uIGFzS2V5IChhY2N1bXVsYXRvciwgaXRlbSkge1xuICBhY2N1bXVsYXRvcltpdGVtXSA9IHRydWU7XG4gIHJldHVybiBhY2N1bXVsYXRvcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b01hcDtcbiIsIid1c2Ugc3RyaWN0JztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gSGVscGVyc1xuXG4vLyBNZXJnZSBvYmplY3RzXG4vL1xuZnVuY3Rpb24gYXNzaWduKG9iaiAvKmZyb20xLCBmcm9tMiwgZnJvbTMsIC4uLiovKSB7XG4gIHZhciBzb3VyY2VzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICBzb3VyY2VzLmZvckVhY2goZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgIGlmICghc291cmNlKSB7IHJldHVybjsgfVxuXG4gICAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIG9ialtrZXldID0gc291cmNlW2tleV07XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIF9jbGFzcyhvYmopIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopOyB9XG5mdW5jdGlvbiBpc1N0cmluZyhvYmopIHsgcmV0dXJuIF9jbGFzcyhvYmopID09PSAnW29iamVjdCBTdHJpbmddJzsgfVxuZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7IHJldHVybiBfY2xhc3Mob2JqKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSc7IH1cbmZ1bmN0aW9uIGlzUmVnRXhwKG9iaikgeyByZXR1cm4gX2NsYXNzKG9iaikgPT09ICdbb2JqZWN0IFJlZ0V4cF0nOyB9XG5mdW5jdGlvbiBpc0Z1bmN0aW9uKG9iaikgeyByZXR1cm4gX2NsYXNzKG9iaikgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7IH1cblxuXG5mdW5jdGlvbiBlc2NhcGVSRSAoc3RyKSB7IHJldHVybiBzdHIucmVwbGFjZSgvWy4/KiteJFtcXF1cXFxcKCl7fXwtXS9nLCAnXFxcXCQmJyk7IH1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXG52YXIgZGVmYXVsdFNjaGVtYXMgPSB7XG4gICdodHRwOic6IHtcbiAgICB2YWxpZGF0ZTogZnVuY3Rpb24gKHRleHQsIHBvcywgc2VsZikge1xuICAgICAgdmFyIHRhaWwgPSB0ZXh0LnNsaWNlKHBvcyk7XG5cbiAgICAgIGlmICghc2VsZi5yZS5odHRwKSB7XG4gICAgICAgIC8vIGNvbXBpbGUgbGF6aWx5LCBiZWNhdXNlIFwiaG9zdFwiLWNvbnRhaW5pbmcgdmFyaWFibGVzIGNhbiBjaGFuZ2Ugb24gdGxkcyB1cGRhdGUuXG4gICAgICAgIHNlbGYucmUuaHR0cCA9ICBuZXcgUmVnRXhwKFxuICAgICAgICAgICdeXFxcXC9cXFxcLycgKyBzZWxmLnJlLnNyY19hdXRoICsgc2VsZi5yZS5zcmNfaG9zdF9wb3J0X3N0cmljdCArIHNlbGYucmUuc3JjX3BhdGgsICdpJ1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKHNlbGYucmUuaHR0cC50ZXN0KHRhaWwpKSB7XG4gICAgICAgIHJldHVybiB0YWlsLm1hdGNoKHNlbGYucmUuaHR0cClbMF0ubGVuZ3RoO1xuICAgICAgfVxuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICB9LFxuICAnaHR0cHM6JzogICdodHRwOicsXG4gICdmdHA6JzogICAgJ2h0dHA6JyxcbiAgJy8vJzogICAgICB7XG4gICAgdmFsaWRhdGU6IGZ1bmN0aW9uICh0ZXh0LCBwb3MsIHNlbGYpIHtcbiAgICAgIHZhciB0YWlsID0gdGV4dC5zbGljZShwb3MpO1xuXG4gICAgICBpZiAoIXNlbGYucmUubm9faHR0cCkge1xuICAgICAgLy8gY29tcGlsZSBsYXppbHksIGJlY2F5c2UgXCJob3N0XCItY29udGFpbmluZyB2YXJpYWJsZXMgY2FuIGNoYW5nZSBvbiB0bGRzIHVwZGF0ZS5cbiAgICAgICAgc2VsZi5yZS5ub19odHRwID0gIG5ldyBSZWdFeHAoXG4gICAgICAgICAgJ14nICsgc2VsZi5yZS5zcmNfYXV0aCArIHNlbGYucmUuc3JjX2hvc3RfcG9ydF9zdHJpY3QgKyBzZWxmLnJlLnNyY19wYXRoLCAnaSdcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGYucmUubm9faHR0cC50ZXN0KHRhaWwpKSB7XG4gICAgICAgIC8vIHNob3VsZCBub3QgYmUgYDovL2AsIHRoYXQgcHJvdGVjdHMgZnJvbSBlcnJvcnMgaW4gcHJvdG9jb2wgbmFtZVxuICAgICAgICBpZiAocG9zID49IDMgJiYgdGV4dFtwb3MgLSAzXSA9PT0gJzonKSB7IHJldHVybiAwOyB9XG4gICAgICAgIHJldHVybiB0YWlsLm1hdGNoKHNlbGYucmUubm9faHR0cClbMF0ubGVuZ3RoO1xuICAgICAgfVxuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICB9LFxuICAnbWFpbHRvOic6IHtcbiAgICB2YWxpZGF0ZTogZnVuY3Rpb24gKHRleHQsIHBvcywgc2VsZikge1xuICAgICAgdmFyIHRhaWwgPSB0ZXh0LnNsaWNlKHBvcyk7XG5cbiAgICAgIGlmICghc2VsZi5yZS5tYWlsdG8pIHtcbiAgICAgICAgc2VsZi5yZS5tYWlsdG8gPSAgbmV3IFJlZ0V4cChcbiAgICAgICAgICAnXicgKyBzZWxmLnJlLnNyY19lbWFpbF9uYW1lICsgJ0AnICsgc2VsZi5yZS5zcmNfaG9zdF9zdHJpY3QsICdpJ1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKHNlbGYucmUubWFpbHRvLnRlc3QodGFpbCkpIHtcbiAgICAgICAgcmV0dXJuIHRhaWwubWF0Y2goc2VsZi5yZS5tYWlsdG8pWzBdLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRE9OJ1QgdHJ5IHRvIG1ha2UgUFJzIHdpdGggY2hhbmdlcy4gRXh0ZW5kIFRMRHMgd2l0aCBMaW5raWZ5SXQudGxkcygpIGluc3RlYWRcbnZhciB0bGRzX2RlZmF1bHQgPSAnYml6fGNvbXxlZHV8Z292fG5ldHxvcmd8cHJvfHdlYnx4eHh8YWVyb3xhc2lhfGNvb3B8aW5mb3xtdXNldW18bmFtZXxzaG9wfNGA0YQnLnNwbGl0KCd8Jyk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmZ1bmN0aW9uIHJlc2V0U2NhbkNhY2hlKHNlbGYpIHtcbiAgc2VsZi5fX2luZGV4X18gPSAtMTtcbiAgc2VsZi5fX3RleHRfY2FjaGVfXyAgID0gJyc7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVZhbGlkYXRvcihyZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKHRleHQsIHBvcykge1xuICAgIHZhciB0YWlsID0gdGV4dC5zbGljZShwb3MpO1xuXG4gICAgaWYgKHJlLnRlc3QodGFpbCkpIHtcbiAgICAgIHJldHVybiB0YWlsLm1hdGNoKHJlKVswXS5sZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVOb3JtYWxpemVyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gKG1hdGNoLCBzZWxmKSB7XG4gICAgc2VsZi5ub3JtYWxpemUobWF0Y2gpO1xuICB9O1xufVxuXG4vLyBTY2hlbWFzIGNvbXBpbGVyLiBCdWlsZCByZWdleHBzLlxuLy9cbmZ1bmN0aW9uIGNvbXBpbGUoc2VsZikge1xuXG4gIC8vIExvYWQgJiBjbG9uZSBSRSBwYXR0ZXJucy5cbiAgdmFyIHJlID0gc2VsZi5yZSA9IGFzc2lnbih7fSwgcmVxdWlyZSgnLi9saWIvcmUnKSk7XG5cbiAgLy8gRGVmaW5lIGR5bmFtaWMgcGF0dGVybnNcbiAgdmFyIHRsZHMgPSBzZWxmLl9fdGxkc19fLnNsaWNlKCk7XG5cbiAgaWYgKCFzZWxmLl9fdGxkc19yZXBsYWNlZF9fKSB7XG4gICAgdGxkcy5wdXNoKCdbYS16XXsyfScpO1xuICB9XG4gIHRsZHMucHVzaChyZS5zcmNfeG4pO1xuXG4gIHJlLnNyY190bGRzID0gdGxkcy5qb2luKCd8Jyk7XG5cbiAgZnVuY3Rpb24gdW50cGwodHBsKSB7IHJldHVybiB0cGwucmVwbGFjZSgnJVRMRFMlJywgcmUuc3JjX3RsZHMpOyB9XG5cbiAgcmUuZW1haWxfZnV6enkgICAgICA9IFJlZ0V4cCh1bnRwbChyZS50cGxfZW1haWxfZnV6enkpLCAnaScpO1xuICByZS5saW5rX2Z1enp5ICAgICAgID0gUmVnRXhwKHVudHBsKHJlLnRwbF9saW5rX2Z1enp5KSwgJ2knKTtcbiAgcmUuaG9zdF9mdXp6eV90ZXN0ICA9IFJlZ0V4cCh1bnRwbChyZS50cGxfaG9zdF9mdXp6eV90ZXN0KSwgJ2knKTtcblxuICAvL1xuICAvLyBDb21waWxlIGVhY2ggc2NoZW1hXG4gIC8vXG5cbiAgdmFyIGFsaWFzZXMgPSBbXTtcblxuICBzZWxmLl9fY29tcGlsZWRfXyA9IHt9OyAvLyBSZXNldCBjb21waWxlZCBkYXRhXG5cbiAgZnVuY3Rpb24gc2NoZW1hRXJyb3IobmFtZSwgdmFsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCcoTGlua2lmeUl0KSBJbnZhbGlkIHNjaGVtYSBcIicgKyBuYW1lICsgJ1wiOiAnICsgdmFsKTtcbiAgfVxuXG4gIE9iamVjdC5rZXlzKHNlbGYuX19zY2hlbWFzX18pLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgdmFsID0gc2VsZi5fX3NjaGVtYXNfX1tuYW1lXTtcblxuICAgIC8vIHNraXAgZGlzYWJsZWQgbWV0aG9kc1xuICAgIGlmICh2YWwgPT09IG51bGwpIHsgcmV0dXJuOyB9XG5cbiAgICB2YXIgY29tcGlsZWQgPSB7IHZhbGlkYXRlOiBudWxsLCBsaW5rOiBudWxsIH07XG5cbiAgICBzZWxmLl9fY29tcGlsZWRfX1tuYW1lXSA9IGNvbXBpbGVkO1xuXG4gICAgaWYgKGlzT2JqZWN0KHZhbCkpIHtcbiAgICAgIGlmIChpc1JlZ0V4cCh2YWwudmFsaWRhdGUpKSB7XG4gICAgICAgIGNvbXBpbGVkLnZhbGlkYXRlID0gY3JlYXRlVmFsaWRhdG9yKHZhbC52YWxpZGF0ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24odmFsLnZhbGlkYXRlKSkge1xuICAgICAgICBjb21waWxlZC52YWxpZGF0ZSA9IHZhbC52YWxpZGF0ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjaGVtYUVycm9yKG5hbWUsIHZhbCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0Z1bmN0aW9uKHZhbC5ub3JtYWxpemUpKSB7XG4gICAgICAgIGNvbXBpbGVkLm5vcm1hbGl6ZSA9IHZhbC5ub3JtYWxpemU7XG4gICAgICB9IGVsc2UgaWYgKCF2YWwubm9ybWFsaXplKSB7XG4gICAgICAgIGNvbXBpbGVkLm5vcm1hbGl6ZSA9IGNyZWF0ZU5vcm1hbGl6ZXIoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjaGVtYUVycm9yKG5hbWUsIHZhbCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoaXNTdHJpbmcodmFsKSkge1xuICAgICAgYWxpYXNlcy5wdXNoKG5hbWUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNjaGVtYUVycm9yKG5hbWUsIHZhbCk7XG4gIH0pO1xuXG4gIC8vXG4gIC8vIENvbXBpbGUgcG9zdHBvbmVkIGFsaWFzZXNcbiAgLy9cblxuICBhbGlhc2VzLmZvckVhY2goZnVuY3Rpb24gKGFsaWFzKSB7XG4gICAgaWYgKCFzZWxmLl9fY29tcGlsZWRfX1tzZWxmLl9fc2NoZW1hc19fW2FsaWFzXV0pIHtcbiAgICAgIC8vIFNpbGVudGx5IGZhaWwgb24gbWlzc2VkIHNjaGVtYXMgdG8gYXZvaWQgZXJyb25zIG9uIGRpc2FibGUuXG4gICAgICAvLyBzY2hlbWFFcnJvcihhbGlhcywgc2VsZi5fX3NjaGVtYXNfX1thbGlhc10pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGYuX19jb21waWxlZF9fW2FsaWFzXS52YWxpZGF0ZSA9XG4gICAgICBzZWxmLl9fY29tcGlsZWRfX1tzZWxmLl9fc2NoZW1hc19fW2FsaWFzXV0udmFsaWRhdGU7XG4gICAgc2VsZi5fX2NvbXBpbGVkX19bYWxpYXNdLm5vcm1hbGl6ZSA9XG4gICAgICBzZWxmLl9fY29tcGlsZWRfX1tzZWxmLl9fc2NoZW1hc19fW2FsaWFzXV0ubm9ybWFsaXplO1xuICB9KTtcblxuICAvL1xuICAvLyBGYWtlIHJlY29yZCBmb3IgZ3Vlc3NlZCBsaW5rc1xuICAvL1xuICBzZWxmLl9fY29tcGlsZWRfX1snJ10gPSB7IHZhbGlkYXRlOiBudWxsLCBub3JtYWxpemU6IGNyZWF0ZU5vcm1hbGl6ZXIoKSB9O1xuXG4gIC8vXG4gIC8vIEJ1aWxkIHNjaGVtYSBjb25kaXRpb25cbiAgLy9cbiAgdmFyIHNsaXN0ID0gT2JqZWN0LmtleXMoc2VsZi5fX2NvbXBpbGVkX18pXG4gICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGaWx0ZXIgZGlzYWJsZWQgJiBmYWtlIHNjaGVtYXNcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuYW1lLmxlbmd0aCA+IDAgJiYgc2VsZi5fX2NvbXBpbGVkX19bbmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAubWFwKGVzY2FwZVJFKVxuICAgICAgICAgICAgICAgICAgICAgIC5qb2luKCd8Jyk7XG4gIC8vICg/IV8pIGNhdXNlIDEuNXggc2xvd2Rvd25cbiAgc2VsZi5yZS5zY2hlbWFfdGVzdCAgID0gUmVnRXhwKCcoXnwoPyFfKSg/Oj58JyArIHJlLnNyY19aUENjQ2YgKyAnKSkoJyArIHNsaXN0ICsgJyknLCAnaScpO1xuICBzZWxmLnJlLnNjaGVtYV9zZWFyY2ggPSBSZWdFeHAoJyhefCg/IV8pKD86PnwnICsgcmUuc3JjX1pQQ2NDZiArICcpKSgnICsgc2xpc3QgKyAnKScsICdpZycpO1xuXG4gIC8vXG4gIC8vIENsZWFudXBcbiAgLy9cblxuICByZXNldFNjYW5DYWNoZShzZWxmKTtcbn1cblxuLyoqXG4gKiBjbGFzcyBNYXRjaFxuICpcbiAqIE1hdGNoIHJlc3VsdC4gU2luZ2xlIGVsZW1lbnQgb2YgYXJyYXksIHJldHVybmVkIGJ5IFtbTGlua2lmeUl0I21hdGNoXV1cbiAqKi9cbmZ1bmN0aW9uIE1hdGNoKHNlbGYsIHNoaWZ0KSB7XG4gIHZhciBzdGFydCA9IHNlbGYuX19pbmRleF9fLFxuICAgICAgZW5kICAgPSBzZWxmLl9fbGFzdF9pbmRleF9fLFxuICAgICAgdGV4dCAgPSBzZWxmLl9fdGV4dF9jYWNoZV9fLnNsaWNlKHN0YXJ0LCBlbmQpO1xuXG4gIC8qKlxuICAgKiBNYXRjaCNzY2hlbWEgLT4gU3RyaW5nXG4gICAqXG4gICAqIFByZWZpeCAocHJvdG9jb2wpIGZvciBtYXRjaGVkIHN0cmluZy5cbiAgICoqL1xuICB0aGlzLnNjaGVtYSAgICA9IHNlbGYuX19zY2hlbWFfXy50b0xvd2VyQ2FzZSgpO1xuICAvKipcbiAgICogTWF0Y2gjaW5kZXggLT4gTnVtYmVyXG4gICAqXG4gICAqIEZpcnN0IHBvc2l0aW9uIG9mIG1hdGNoZWQgc3RyaW5nLlxuICAgKiovXG4gIHRoaXMuaW5kZXggICAgID0gc3RhcnQgKyBzaGlmdDtcbiAgLyoqXG4gICAqIE1hdGNoI2xhc3RJbmRleCAtPiBOdW1iZXJcbiAgICpcbiAgICogTmV4dCBwb3NpdGlvbiBhZnRlciBtYXRjaGVkIHN0cmluZy5cbiAgICoqL1xuICB0aGlzLmxhc3RJbmRleCA9IGVuZCArIHNoaWZ0O1xuICAvKipcbiAgICogTWF0Y2gjcmF3IC0+IFN0cmluZ1xuICAgKlxuICAgKiBNYXRjaGVkIHN0cmluZy5cbiAgICoqL1xuICB0aGlzLnJhdyAgICAgICA9IHRleHQ7XG4gIC8qKlxuICAgKiBNYXRjaCN0ZXh0IC0+IFN0cmluZ1xuICAgKlxuICAgKiBOb3RtYWxpemVkIHRleHQgb2YgbWF0Y2hlZCBzdHJpbmcuXG4gICAqKi9cbiAgdGhpcy50ZXh0ICAgICAgPSB0ZXh0O1xuICAvKipcbiAgICogTWF0Y2gjdXJsIC0+IFN0cmluZ1xuICAgKlxuICAgKiBOb3JtYWxpemVkIHVybCBvZiBtYXRjaGVkIHN0cmluZy5cbiAgICoqL1xuICB0aGlzLnVybCAgICAgICA9IHRleHQ7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1hdGNoKHNlbGYsIHNoaWZ0KSB7XG4gIHZhciBtYXRjaCA9IG5ldyBNYXRjaChzZWxmLCBzaGlmdCk7XG5cbiAgc2VsZi5fX2NvbXBpbGVkX19bbWF0Y2guc2NoZW1hXS5ub3JtYWxpemUobWF0Y2gsIHNlbGYpO1xuXG4gIHJldHVybiBtYXRjaDtcbn1cblxuXG4vKipcbiAqIGNsYXNzIExpbmtpZnlJdFxuICoqL1xuXG4vKipcbiAqIG5ldyBMaW5raWZ5SXQoc2NoZW1hcylcbiAqIC0gc2NoZW1hcyAoT2JqZWN0KTogT3B0aW9uYWwuIEFkZGl0aW9uYWwgc2NoZW1hcyB0byB2YWxpZGF0ZSAocHJlZml4L3ZhbGlkYXRvcilcbiAqXG4gKiBDcmVhdGVzIG5ldyBsaW5raWZpZXIgaW5zdGFuY2Ugd2l0aCBvcHRpb25hbCBhZGRpdGlvbmFsIHNjaGVtYXMuXG4gKiBDYW4gYmUgY2FsbGVkIHdpdGhvdXQgYG5ld2Aga2V5d29yZCBmb3IgY29udmVuaWVuY2UuXG4gKlxuICogQnkgZGVmYXVsdCB1bmRlcnN0YW5kczpcbiAqXG4gKiAtIGBodHRwKHMpOi8vLi4uYCAsIGBmdHA6Ly8uLi5gLCBgbWFpbHRvOi4uLmAgJiBgLy8uLi5gIGxpbmtzXG4gKiAtIFwiZnV6enlcIiBsaW5rcyBhbmQgZW1haWxzIChleGFtcGxlLmNvbSwgZm9vQGJhci5jb20pLlxuICpcbiAqIGBzY2hlbWFzYCBpcyBhbiBvYmplY3QsIHdoZXJlIGVhY2gga2V5L3ZhbHVlIGRlc2NyaWJlcyBwcm90b2NvbC9ydWxlOlxuICpcbiAqIC0gX19rZXlfXyAtIGxpbmsgcHJlZml4ICh1c3VhbGx5LCBwcm90b2NvbCBuYW1lIHdpdGggYDpgIGF0IHRoZSBlbmQsIGBza3lwZTpgXG4gKiAgIGZvciBleGFtcGxlKS4gYGxpbmtpZnktaXRgIG1ha2VzIHNodXJlIHRoYXQgcHJlZml4IGlzIG5vdCBwcmVjZWVkZWQgd2l0aFxuICogICBhbHBoYW51bWVyaWMgY2hhciBhbmQgc3ltYm9scy4gT25seSB3aGl0ZXNwYWNlcyBhbmQgcHVuY3R1YXRpb24gYWxsb3dlZC5cbiAqIC0gX192YWx1ZV9fIC0gcnVsZSB0byBjaGVjayB0YWlsIGFmdGVyIGxpbmsgcHJlZml4XG4gKiAgIC0gX1N0cmluZ18gLSBqdXN0IGFsaWFzIHRvIGV4aXN0aW5nIHJ1bGVcbiAqICAgLSBfT2JqZWN0X1xuICogICAgIC0gX3ZhbGlkYXRlXyAtIHZhbGlkYXRvciBmdW5jdGlvbiAoc2hvdWxkIHJldHVybiBtYXRjaGVkIGxlbmd0aCBvbiBzdWNjZXNzKSxcbiAqICAgICAgIG9yIGBSZWdFeHBgLlxuICogICAgIC0gX25vcm1hbGl6ZV8gLSBvcHRpb25hbCBmdW5jdGlvbiB0byBub3JtYWxpemUgdGV4dCAmIHVybCBvZiBtYXRjaGVkIHJlc3VsdFxuICogICAgICAgKGZvciBleGFtcGxlLCBmb3IgQHR3aXR0ZXIgbWVudGlvbnMpLlxuICoqL1xuZnVuY3Rpb24gTGlua2lmeUl0KHNjaGVtYXMpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIExpbmtpZnlJdCkpIHtcbiAgICByZXR1cm4gbmV3IExpbmtpZnlJdChzY2hlbWFzKTtcbiAgfVxuXG4gIC8vIENhY2hlIGxhc3QgdGVzdGVkIHJlc3VsdC4gVXNlZCB0byBza2lwIHJlcGVhdGluZyBzdGVwcyBvbiBuZXh0IGBtYXRjaGAgY2FsbC5cbiAgdGhpcy5fX2luZGV4X18gICAgICAgICAgPSAtMTtcbiAgdGhpcy5fX2xhc3RfaW5kZXhfXyAgICAgPSAtMTsgLy8gTmV4dCBzY2FuIHBvc2l0aW9uXG4gIHRoaXMuX19zY2hlbWFfXyAgICAgICAgID0gJyc7XG4gIHRoaXMuX190ZXh0X2NhY2hlX18gICAgID0gJyc7XG5cbiAgdGhpcy5fX3NjaGVtYXNfXyAgICAgICAgPSBhc3NpZ24oe30sIGRlZmF1bHRTY2hlbWFzLCBzY2hlbWFzKTtcbiAgdGhpcy5fX2NvbXBpbGVkX18gICAgICAgPSB7fTtcblxuICB0aGlzLl9fdGxkc19fICAgICAgICAgICA9IHRsZHNfZGVmYXVsdDtcbiAgdGhpcy5fX3RsZHNfcmVwbGFjZWRfXyAgPSBmYWxzZTtcblxuICB0aGlzLnJlID0ge307XG5cbiAgY29tcGlsZSh0aGlzKTtcbn1cblxuXG4vKiogY2hhaW5hYmxlXG4gKiBMaW5raWZ5SXQjYWRkKHNjaGVtYSwgZGVmaW5pdGlvbilcbiAqIC0gc2NoZW1hIChTdHJpbmcpOiBydWxlIG5hbWUgKGZpeGVkIHBhdHRlcm4gcHJlZml4KVxuICogLSBkZWZpbml0aW9uIChTdHJpbmd8UmVnRXhwfE9iamVjdCk6IHNjaGVtYSBkZWZpbml0aW9uXG4gKlxuICogQWRkIG5ldyBydWxlIGRlZmluaXRpb24uIFNlZSBjb25zdHJ1Y3RvciBkZXNjcmlwdGlvbiBmb3IgZGV0YWlscy5cbiAqKi9cbkxpbmtpZnlJdC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkKHNjaGVtYSwgZGVmaW5pdGlvbikge1xuICB0aGlzLl9fc2NoZW1hc19fW3NjaGVtYV0gPSBkZWZpbml0aW9uO1xuICBjb21waWxlKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblxuLyoqXG4gKiBMaW5raWZ5SXQjdGVzdCh0ZXh0KSAtPiBCb29sZWFuXG4gKlxuICogU2VhcmNoZXMgbGlua2lmaWFibGUgcGF0dGVybiBhbmQgcmV0dXJucyBgdHJ1ZWAgb24gc3VjY2VzcyBvciBgZmFsc2VgIG9uIGZhaWwuXG4gKiovXG5MaW5raWZ5SXQucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbiB0ZXN0KHRleHQpIHtcbiAgLy8gUmVzZXQgc2NhbiBjYWNoZVxuICB0aGlzLl9fdGV4dF9jYWNoZV9fID0gdGV4dDtcbiAgdGhpcy5fX2luZGV4X18gICAgICA9IC0xO1xuXG4gIGlmICghdGV4dC5sZW5ndGgpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgdmFyIG0sIG1sLCBtZSwgbGVuLCBzaGlmdCwgbmV4dCwgcmUsIHRsZF9wb3MsIGF0X3BvcztcblxuICAvLyB0cnkgdG8gc2NhbiBmb3IgbGluayB3aXRoIHNjaGVtYSAtIHRoYXQncyB0aGUgbW9zdCBzaW1wbGUgcnVsZVxuICBpZiAodGhpcy5yZS5zY2hlbWFfdGVzdC50ZXN0KHRleHQpKSB7XG4gICAgcmUgPSB0aGlzLnJlLnNjaGVtYV9zZWFyY2g7XG4gICAgcmUubGFzdEluZGV4ID0gMDtcbiAgICB3aGlsZSAoKG0gPSByZS5leGVjKHRleHQpKSAhPT0gbnVsbCkge1xuICAgICAgbGVuID0gdGhpcy50ZXN0U2NoZW1hQXQodGV4dCwgbVsyXSwgcmUubGFzdEluZGV4KTtcbiAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgdGhpcy5fX3NjaGVtYV9fICAgICA9IG1bMl07XG4gICAgICAgIHRoaXMuX19pbmRleF9fICAgICAgPSBtLmluZGV4ICsgbVsxXS5sZW5ndGg7XG4gICAgICAgIHRoaXMuX19sYXN0X2luZGV4X18gPSBtLmluZGV4ICsgbVswXS5sZW5ndGggKyBsZW47XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmICh0aGlzLl9fY29tcGlsZWRfX1snaHR0cDonXSkge1xuICAgIC8vIGd1ZXNzIHNjaGVtYWxlc3MgbGlua3NcbiAgICB0bGRfcG9zID0gdGV4dC5zZWFyY2godGhpcy5yZS5ob3N0X2Z1enp5X3Rlc3QpO1xuICAgIGlmICh0bGRfcG9zID49IDApIHtcbiAgICAgIC8vIGlmIHRsZCBpcyBsb2NhdGVkIGFmdGVyIGZvdW5kIGxpbmsgLSBubyBuZWVkIHRvIGNoZWNrIGZ1enp5IHBhdHRlcm5cbiAgICAgIGlmICh0aGlzLl9faW5kZXhfXyA8IDAgfHwgdGxkX3BvcyA8IHRoaXMuX19pbmRleF9fKSB7XG4gICAgICAgIGlmICgobWwgPSB0ZXh0Lm1hdGNoKHRoaXMucmUubGlua19mdXp6eSkpICE9PSBudWxsKSB7XG5cbiAgICAgICAgICBzaGlmdCA9IG1sLmluZGV4ICsgbWxbMV0ubGVuZ3RoO1xuXG4gICAgICAgICAgaWYgKHRoaXMuX19pbmRleF9fIDwgMCB8fCBzaGlmdCA8IHRoaXMuX19pbmRleF9fKSB7XG4gICAgICAgICAgICB0aGlzLl9fc2NoZW1hX18gICAgID0gJyc7XG4gICAgICAgICAgICB0aGlzLl9faW5kZXhfXyAgICAgID0gc2hpZnQ7XG4gICAgICAgICAgICB0aGlzLl9fbGFzdF9pbmRleF9fID0gbWwuaW5kZXggKyBtbFswXS5sZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKHRoaXMuX19jb21waWxlZF9fWydtYWlsdG86J10pIHtcbiAgICAvLyBndWVzcyBzY2hlbWFsZXNzIGVtYWlsc1xuICAgIGF0X3BvcyA9IHRleHQuaW5kZXhPZignQCcpO1xuICAgIGlmIChhdF9wb3MgPj0gMCkge1xuICAgICAgLy8gV2UgY2FuJ3Qgc2tpcCB0aGlzIGNoZWNrLCBiZWNhdXNlIHRoaXMgY2FzZXMgYXJlIHBvc3NpYmxlOlxuICAgICAgLy8gMTkyLjE2OC4xLjFAZ21haWwuY29tLCBteS5pbkBleGFtcGxlLmNvbVxuICAgICAgaWYgKChtZSA9IHRleHQubWF0Y2godGhpcy5yZS5lbWFpbF9mdXp6eSkpICE9PSBudWxsKSB7XG5cbiAgICAgICAgc2hpZnQgPSBtZS5pbmRleCArIG1lWzFdLmxlbmd0aDtcbiAgICAgICAgbmV4dCAgPSBtZS5pbmRleCArIG1lWzBdLmxlbmd0aDtcblxuICAgICAgICBpZiAodGhpcy5fX2luZGV4X18gPCAwIHx8IHNoaWZ0IDwgdGhpcy5fX2luZGV4X18gfHxcbiAgICAgICAgICAgIChzaGlmdCA9PT0gdGhpcy5fX2luZGV4X18gJiYgbmV4dCA+IHRoaXMuX19sYXN0X2luZGV4X18pKSB7XG4gICAgICAgICAgdGhpcy5fX3NjaGVtYV9fICAgICA9ICdtYWlsdG86JztcbiAgICAgICAgICB0aGlzLl9faW5kZXhfXyAgICAgID0gc2hpZnQ7XG4gICAgICAgICAgdGhpcy5fX2xhc3RfaW5kZXhfXyA9IG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcy5fX2luZGV4X18gPj0gMDtcbn07XG5cblxuLyoqXG4gKiBMaW5raWZ5SXQjdGVzdFNjaGVtYUF0KHRleHQsIG5hbWUsIHBvc2l0aW9uKSAtPiBOdW1iZXJcbiAqIC0gdGV4dCAoU3RyaW5nKTogdGV4dCB0byBzY2FuXG4gKiAtIG5hbWUgKFN0cmluZyk6IHJ1bGUgKHNjaGVtYSkgbmFtZVxuICogLSBwb3NpdGlvbiAoTnVtYmVyKTogdGV4dCBvZmZzZXQgdG8gY2hlY2sgZnJvbVxuICpcbiAqIFNpbWlsYXIgdG8gW1tMaW5raWZ5SXQjdGVzdF1dIGJ1dCBjaGVja3Mgb25seSBzcGVjaWZpYyBwcm90b2NvbCB0YWlsIGV4YWN0bHlcbiAqIGF0IGdpdmVuIHBvc2l0aW9uLiBSZXR1cm5zIGxlbmd0aCBvZiBmb3VuZCBwYXR0ZXJuICgwIG9uIGZhaWwpLlxuICoqL1xuTGlua2lmeUl0LnByb3RvdHlwZS50ZXN0U2NoZW1hQXQgPSBmdW5jdGlvbiB0ZXN0U2NoZW1hQXQodGV4dCwgc2NoZW1hLCBwb3MpIHtcbiAgLy8gSWYgbm90IHN1cHBvcnRlZCBzY2hlbWEgY2hlY2sgcmVxdWVzdGVkIC0gdGVybWluYXRlXG4gIGlmICghdGhpcy5fX2NvbXBpbGVkX19bc2NoZW1hLnRvTG93ZXJDYXNlKCldKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgcmV0dXJuIHRoaXMuX19jb21waWxlZF9fW3NjaGVtYS50b0xvd2VyQ2FzZSgpXS52YWxpZGF0ZSh0ZXh0LCBwb3MsIHRoaXMpO1xufTtcblxuXG4vKipcbiAqIExpbmtpZnlJdCNtYXRjaCh0ZXh0KSAtPiBBcnJheXxudWxsXG4gKlxuICogUmV0dXJucyBhcnJheSBvZiBmb3VuZCBsaW5rIGRlc2NyaXB0aW9ucyBvciBgbnVsbGAgb24gZmFpbC4gV2Ugc3Ryb25nbHlcbiAqIHRvIHVzZSBbW0xpbmtpZnlJdCN0ZXN0XV0gZmlyc3QsIGZvciBiZXN0IHNwZWVkLlxuICpcbiAqICMjIyMjIFJlc3VsdCBtYXRjaCBkZXNjcmlwdGlvblxuICpcbiAqIC0gX19zY2hlbWFfXyAtIGxpbmsgc2NoZW1hLCBjYW4gYmUgZW1wdHkgZm9yIGZ1enp5IGxpbmtzLCBvciBgLy9gIGZvclxuICogICBwcm90b2NvbC1uZXV0cmFsICBsaW5rcy5cbiAqIC0gX19pbmRleF9fIC0gb2Zmc2V0IG9mIG1hdGNoZWQgdGV4dFxuICogLSBfX2xhc3RJbmRleF9fIC0gaW5kZXggb2YgbmV4dCBjaGFyIGFmdGVyIG1hdGhjaCBlbmRcbiAqIC0gX19yYXdfXyAtIG1hdGNoZWQgdGV4dFxuICogLSBfX3RleHRfXyAtIG5vcm1hbGl6ZWQgdGV4dFxuICogLSBfX3VybF9fIC0gbGluaywgZ2VuZXJhdGVkIGZyb20gbWF0Y2hlZCB0ZXh0XG4gKiovXG5MaW5raWZ5SXQucHJvdG90eXBlLm1hdGNoID0gZnVuY3Rpb24gbWF0Y2godGV4dCkge1xuICB2YXIgc2hpZnQgPSAwLCByZXN1bHQgPSBbXTtcblxuICAvLyBUcnkgdG8gdGFrZSBwcmV2aW91cyBlbGVtZW50IGZyb20gY2FjaGUsIGlmIC50ZXN0KCkgY2FsbGVkIGJlZm9yZVxuICBpZiAodGhpcy5fX2luZGV4X18gPj0gMCAmJiB0aGlzLl9fdGV4dF9jYWNoZV9fID09PSB0ZXh0KSB7XG4gICAgcmVzdWx0LnB1c2goY3JlYXRlTWF0Y2godGhpcywgc2hpZnQpKTtcbiAgICBzaGlmdCA9IHRoaXMuX19sYXN0X2luZGV4X187XG4gIH1cblxuICAvLyBDdXQgaGVhZCBpZiBjYWNoZSB3YXMgdXNlZFxuICB2YXIgdGFpbCA9IHNoaWZ0ID8gdGV4dC5zbGljZShzaGlmdCkgOiB0ZXh0O1xuXG4gIC8vIFNjYW4gc3RyaW5nIHVudGlsIGVuZCByZWFjaGVkXG4gIHdoaWxlICh0aGlzLnRlc3QodGFpbCkpIHtcbiAgICByZXN1bHQucHVzaChjcmVhdGVNYXRjaCh0aGlzLCBzaGlmdCkpO1xuXG4gICAgdGFpbCA9IHRhaWwuc2xpY2UodGhpcy5fX2xhc3RfaW5kZXhfXyk7XG4gICAgc2hpZnQgKz0gdGhpcy5fX2xhc3RfaW5kZXhfXztcbiAgfVxuXG4gIGlmIChyZXN1bHQubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufTtcblxuXG4vKiogY2hhaW5hYmxlXG4gKiBMaW5raWZ5SXQjdGxkcyhsaXN0IFssIGtlZXBPbGRdKSAtPiB0aGlzXG4gKiAtIGxpc3QgKEFycmF5KTogbGlzdCBvZiB0bGRzXG4gKiAtIGtlZXBPbGQgKEJvb2xlYW4pOiBtZXJnZSB3aXRoIGN1cnJlbnQgbGlzdCBpZiBgdHJ1ZWAgKGBmYWxzZWAgYnkgZGVmYXVsdClcbiAqXG4gKiBMb2FkIChvciBtZXJnZSkgbmV3IHRsZHMgbGlzdC4gVGhvc2UgYXJlIHVzZXIgZm9yIGZ1enp5IGxpbmtzICh3aXRob3V0IHByZWZpeClcbiAqIHRvIGF2b2lkIGZhbHNlIHBvc2l0aXZlcy4gQnkgZGVmYXVsdCB0aGlzIGFsZ29yeXRobSB1c2VkOlxuICpcbiAqIC0gaG9zdG5hbWUgd2l0aCBhbnkgMi1sZXR0ZXIgcm9vdCB6b25lcyBhcmUgb2suXG4gKiAtIGJpenxjb218ZWR1fGdvdnxuZXR8b3JnfHByb3x3ZWJ8eHh4fGFlcm98YXNpYXxjb29wfGluZm98bXVzZXVtfG5hbWV8c2hvcHzRgNGEXG4gKiAgIGFyZSBvay5cbiAqIC0gZW5jb2RlZCAoYHhuLS0uLi5gKSByb290IHpvbmVzIGFyZSBvay5cbiAqXG4gKiBJZiBsaXN0IGlzIHJlcGxhY2VkLCB0aGVuIGV4YWN0IG1hdGNoIGZvciAyLWNoYXJzIHJvb3Qgem9uZXMgd2lsbCBiZSBjaGVja2VkLlxuICoqL1xuTGlua2lmeUl0LnByb3RvdHlwZS50bGRzID0gZnVuY3Rpb24gdGxkcyhsaXN0LCBrZWVwT2xkKSB7XG4gIGxpc3QgPSBBcnJheS5pc0FycmF5KGxpc3QpID8gbGlzdCA6IFsgbGlzdCBdO1xuXG4gIGlmICgha2VlcE9sZCkge1xuICAgIHRoaXMuX190bGRzX18gPSBsaXN0LnNsaWNlKCk7XG4gICAgdGhpcy5fX3RsZHNfcmVwbGFjZWRfXyA9IHRydWU7XG4gICAgY29tcGlsZSh0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRoaXMuX190bGRzX18gPSB0aGlzLl9fdGxkc19fLmNvbmNhdChsaXN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zb3J0KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGVsLCBpZHgsIGFycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsICE9PSBhcnJbaWR4IC0gMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmV2ZXJzZSgpO1xuXG4gIGNvbXBpbGUodGhpcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBMaW5raWZ5SXQjbm9ybWFsaXplKG1hdGNoKVxuICpcbiAqIERlZmF1bHQgbm9ybWFsaXplciAoaWYgc2NoZW1hIGRvZXMgbm90IGRlZmluZSBpdCdzIG93bikuXG4gKiovXG5MaW5raWZ5SXQucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uIG5vcm1hbGl6ZShtYXRjaCkge1xuXG4gIC8vIERvIG1pbmltYWwgcG9zc2libGUgY2hhbmdlcyBieSBkZWZhdWx0LiBOZWVkIHRvIGNvbGxlY3QgZmVlZGJhY2sgcHJpb3JcbiAgLy8gdG8gbW92ZSBmb3J3YXJkIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJrZG93bi1pdC9saW5raWZ5LWl0L2lzc3Vlcy8xXG5cbiAgaWYgKCFtYXRjaC5zY2hlbWEpIHsgbWF0Y2gudXJsID0gJ2h0dHA6Ly8nICsgbWF0Y2gudXJsOyB9XG5cbiAgaWYgKG1hdGNoLnNjaGVtYSA9PT0gJ21haWx0bzonICYmICEvXm1haWx0bzovaS50ZXN0KG1hdGNoLnVybCkpIHtcbiAgICBtYXRjaC51cmwgPSAnbWFpbHRvOicgKyBtYXRjaC51cmw7XG4gIH1cbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBMaW5raWZ5SXQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIFVzZSBkaXJlY3QgZXh0cmFjdCBpbnN0ZWFkIG9mIGByZWdlbmVyYXRlYCB0byByZWR1c2UgYnJvd3NlcmlmaWVkIHNpemVcbnZhciBzcmNfQW55ID0gZXhwb3J0cy5zcmNfQW55ID0gcmVxdWlyZSgndWMubWljcm8vcHJvcGVydGllcy9BbnkvcmVnZXgnKS5zb3VyY2U7XG52YXIgc3JjX0NjICA9IGV4cG9ydHMuc3JjX0NjID0gcmVxdWlyZSgndWMubWljcm8vY2F0ZWdvcmllcy9DYy9yZWdleCcpLnNvdXJjZTtcbnZhciBzcmNfQ2YgID0gZXhwb3J0cy5zcmNfQ2YgPSByZXF1aXJlKCd1Yy5taWNyby9jYXRlZ29yaWVzL0NmL3JlZ2V4Jykuc291cmNlO1xudmFyIHNyY19aICAgPSBleHBvcnRzLnNyY19aICA9IHJlcXVpcmUoJ3VjLm1pY3JvL2NhdGVnb3JpZXMvWi9yZWdleCcpLnNvdXJjZTtcbnZhciBzcmNfUCAgID0gZXhwb3J0cy5zcmNfUCAgPSByZXF1aXJlKCd1Yy5taWNyby9jYXRlZ29yaWVzL1AvcmVnZXgnKS5zb3VyY2U7XG5cbi8vIFxccHtcXFpcXFBcXENjXFxDRn0gKHdoaXRlIHNwYWNlcyArIGNvbnRyb2wgKyBmb3JtYXQgKyBwdW5jdHVhdGlvbilcbnZhciBzcmNfWlBDY0NmID0gZXhwb3J0cy5zcmNfWlBDY0NmID0gWyBzcmNfWiwgc3JjX1AsIHNyY19DYywgc3JjX0NmIF0uam9pbignfCcpO1xuXG4vLyBBbGwgcG9zc2libGUgd29yZCBjaGFyYWN0ZXJzIChldmVyeXRoaW5nIHdpdGhvdXQgcHVuY3R1YXRpb24sIHNwYWNlcyAmIGNvbnRyb2xzKVxuLy8gRGVmaW5lZCB2aWEgcHVuY3R1YXRpb24gJiBzcGFjZXMgdG8gc2F2ZSBzcGFjZVxuLy8gU2hvdWxkIGJlIHNvbWV0aGluZyBsaWtlIFxccHtcXExcXE5cXFNcXE19IChcXHcgYnV0IHdpdGhvdXQgYF9gKVxudmFyIHNyY19wc2V1ZG9fbGV0dGVyICAgICAgID0gJyg/Oig/IScgKyBzcmNfWlBDY0NmICsgJyknICsgc3JjX0FueSArICcpJztcbi8vIFRoZSBzYW1lIGFzIGFib3RoZSBidXQgd2l0aG91dCBbMC05XVxudmFyIHNyY19wc2V1ZG9fbGV0dGVyX25vbl9kID0gJyg/Oig/IVswLTldfCcgKyBzcmNfWlBDY0NmICsgJyknICsgc3JjX0FueSArICcpJztcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIHNyY19pcDQgPSBleHBvcnRzLnNyY19pcDQgPVxuXG4gICcoPzooMjVbMC01XXwyWzAtNF1bMC05XXxbMDFdP1swLTldWzAtOV0/KVxcXFwuKXszfSgyNVswLTVdfDJbMC00XVswLTldfFswMV0/WzAtOV1bMC05XT8pJztcblxuZXhwb3J0cy5zcmNfYXV0aCAgICA9ICcoPzooPzooPyEnICsgc3JjX1ogKyAnKS4pK0ApPyc7XG5cbnZhciBzcmNfcG9ydCA9IGV4cG9ydHMuc3JjX3BvcnQgPVxuXG4gICcoPzo6KD86Nig/OlswLTRdXFxcXGR7M318NSg/OlswLTRdXFxcXGR7Mn18NSg/OlswLTJdXFxcXGR8M1swLTVdKSkpfFsxLTVdP1xcXFxkezEsNH0pKT8nO1xuXG52YXIgc3JjX2hvc3RfdGVybWluYXRvciA9IGV4cG9ydHMuc3JjX2hvc3RfdGVybWluYXRvciA9XG5cbiAgJyg/PSR8JyArIHNyY19aUENjQ2YgKyAnKSg/IS18X3w6XFxcXGR8XFxcXC4tfFxcXFwuKD8hJHwnICsgc3JjX1pQQ2NDZiArICcpKSc7XG5cbnZhciBzcmNfcGF0aCA9IGV4cG9ydHMuc3JjX3BhdGggPVxuXG4gICcoPzonICtcbiAgICAnWy8/I10nICtcbiAgICAgICcoPzonICtcbiAgICAgICAgJyg/IScgKyBzcmNfWiArICd8WygpW1xcXFxde30uLFwiXFwnPyFcXFxcLV0pLnwnICtcbiAgICAgICAgJ1xcXFxbKD86KD8hJyArIHNyY19aICsgJ3xcXFxcXSkuKSpcXFxcXXwnICtcbiAgICAgICAgJ1xcXFwoKD86KD8hJyArIHNyY19aICsgJ3xbKV0pLikqXFxcXCl8JyArXG4gICAgICAgICdcXFxceyg/Oig/IScgKyBzcmNfWiArICd8W31dKS4pKlxcXFx9fCcgK1xuICAgICAgICAnXFxcXFwiKD86KD8hJyArIHNyY19aICsgJ3xbXCJdKS4pK1xcXFxcInwnICtcbiAgICAgICAgXCJcXFxcJyg/Oig/IVwiICsgc3JjX1ogKyBcInxbJ10pLikrXFxcXCd8XCIgK1xuICAgICAgICBcIlxcXFwnKD89XCIgKyBzcmNfcHNldWRvX2xldHRlciArICcpLnwnICsgIC8vIGFsbG93IGBJJ21fa2luZ2AgaWYgbm8gcGFpciBmb3VuZFxuICAgICAgICAnXFxcXC4oPyEnICsgc3JjX1ogKyAnfFsuXSkufCcgK1xuICAgICAgICAnXFxcXC0oPyEnICsgc3JjX1ogKyAnfC0tKD86W14tXXwkKSkoPzpbLV0rfC4pfCcgKyAgLy8gYC0tLWAgPT4gbG9uZyBkYXNoLCB0ZXJtaW5hdGVcbiAgICAgICAgJ1xcXFwsKD8hJyArIHNyY19aICsgJykufCcgKyAgICAgIC8vIGFsbG93IGAsLCxgIGluIHBhdGhzXG4gICAgICAgICdcXFxcISg/IScgKyBzcmNfWiArICd8WyFdKS58JyArXG4gICAgICAgICdcXFxcPyg/IScgKyBzcmNfWiArICd8Wz9dKS4nICtcbiAgICAgICcpKycgK1xuICAgICd8XFxcXC8nICtcbiAgJyk/JztcblxudmFyIHNyY19lbWFpbF9uYW1lID0gZXhwb3J0cy5zcmNfZW1haWxfbmFtZSA9XG5cbiAgJ1tcXFxcLTs6Jj1cXFxcK1xcXFwkLFxcXFxcIlxcXFwuYS16QS1aMC05X10rJztcblxudmFyIHNyY194biA9IGV4cG9ydHMuc3JjX3huID1cblxuICAneG4tLVthLXowLTlcXFxcLV17MSw1OX0nO1xuXG4vLyBNb3JlIHRvIHJlYWQgYWJvdXQgZG9tYWluIG5hbWVzXG4vLyBodHRwOi8vc2VydmVyZmF1bHQuY29tL3F1ZXN0aW9ucy82MzgyNjAvXG5cbnZhciBzcmNfZG9tYWluX3Jvb3QgPSBleHBvcnRzLnNyY19kb21haW5fcm9vdCA9XG5cbiAgLy8gQ2FuJ3QgaGF2ZSBkaWdpdHMgYW5kIGRhc2hlc1xuICAnKD86JyArXG4gICAgc3JjX3huICtcbiAgICAnfCcgK1xuICAgIHNyY19wc2V1ZG9fbGV0dGVyX25vbl9kICsgJ3sxLDYzfScgK1xuICAnKSc7XG5cbnZhciBzcmNfZG9tYWluID0gZXhwb3J0cy5zcmNfZG9tYWluID1cblxuICAnKD86JyArXG4gICAgc3JjX3huICtcbiAgICAnfCcgK1xuICAgICcoPzonICsgc3JjX3BzZXVkb19sZXR0ZXIgKyAnKScgK1xuICAgICd8JyArXG4gICAgLy8gZG9uJ3QgYWxsb3cgYC0tYCBpbiBkb21haW4gbmFtZXMsIGJlY2F1c2U6XG4gICAgLy8gLSB0aGF0IGNhbiBjb25mbGljdCB3aXRoIG1hcmtkb3duICZtZGFzaDsgLyAmbmRhc2g7XG4gICAgLy8gLSBub2JvZHkgdXNlIHRob3NlIGFueXdheVxuICAgICcoPzonICsgc3JjX3BzZXVkb19sZXR0ZXIgKyAnKD86LSg/IS0pfCcgKyBzcmNfcHNldWRvX2xldHRlciArICcpezAsNjF9JyArIHNyY19wc2V1ZG9fbGV0dGVyICsgJyknICtcbiAgJyknO1xuXG52YXIgc3JjX2hvc3QgPSBleHBvcnRzLnNyY19ob3N0ID1cblxuICAnKD86JyArXG4gICAgc3JjX2lwNCArXG4gICd8JyArXG4gICAgJyg/Oig/Oig/OicgKyBzcmNfZG9tYWluICsgJylcXFxcLikqJyArIHNyY19kb21haW5fcm9vdCArICcpJyArXG4gICcpJztcblxudmFyIHRwbF9ob3N0X2Z1enp5ID0gZXhwb3J0cy50cGxfaG9zdF9mdXp6eSA9XG5cbiAgJyg/OicgK1xuICAgIHNyY19pcDQgK1xuICAnfCcgK1xuICAgICcoPzooPzooPzonICsgc3JjX2RvbWFpbiArICcpXFxcXC4pKyg/OiVUTERTJSkpJyArXG4gICcpJztcblxuZXhwb3J0cy5zcmNfaG9zdF9zdHJpY3QgPVxuXG4gIHNyY19ob3N0ICsgc3JjX2hvc3RfdGVybWluYXRvcjtcblxudmFyIHRwbF9ob3N0X2Z1enp5X3N0cmljdCA9IGV4cG9ydHMudHBsX2hvc3RfZnV6enlfc3RyaWN0ID1cblxuICB0cGxfaG9zdF9mdXp6eSArIHNyY19ob3N0X3Rlcm1pbmF0b3I7XG5cbmV4cG9ydHMuc3JjX2hvc3RfcG9ydF9zdHJpY3QgPVxuXG4gIHNyY19ob3N0ICsgc3JjX3BvcnQgKyBzcmNfaG9zdF90ZXJtaW5hdG9yO1xuXG52YXIgdHBsX2hvc3RfcG9ydF9mdXp6eV9zdHJpY3QgPSBleHBvcnRzLnRwbF9ob3N0X3BvcnRfZnV6enlfc3RyaWN0ID1cblxuICB0cGxfaG9zdF9mdXp6eSArIHNyY19wb3J0ICsgc3JjX2hvc3RfdGVybWluYXRvcjtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIE1haW4gcnVsZXNcblxuLy8gUnVkZSB0ZXN0IGZ1enp5IGxpbmtzIGJ5IGhvc3QsIGZvciBxdWljayBkZW55XG5leHBvcnRzLnRwbF9ob3N0X2Z1enp5X3Rlc3QgPVxuXG4gICdsb2NhbGhvc3R8XFxcXC5cXFxcZHsxLDN9XFxcXC58KD86XFxcXC4oPzolVExEUyUpKD86JyArIHNyY19aUENjQ2YgKyAnfCQpKSc7XG5cbmV4cG9ydHMudHBsX2VtYWlsX2Z1enp5ID1cblxuICAgICcoXnw+fCcgKyBzcmNfWiArICcpKCcgKyBzcmNfZW1haWxfbmFtZSArICdAJyArIHRwbF9ob3N0X2Z1enp5X3N0cmljdCArICcpJztcblxuZXhwb3J0cy50cGxfbGlua19mdXp6eSA9XG4gICAgLy8gRnV6enkgbGluayBjYW4ndCBiZSBwcmVwZW5kZWQgd2l0aCAuOi9cXC0gYW5kIG5vbiBwdW5jdHVhdGlvbi5cbiAgICAvLyBidXQgY2FuIHN0YXJ0IHdpdGggPiAobWFya2Rvd24gYmxvY2txdW90ZSlcbiAgICAnKF58KD8hWy46L1xcXFwtX0BdKSg/OlskKzw9Pl5gfF18JyArIHNyY19aUENjQ2YgKyAnKSknICtcbiAgICAnKCg/IVskKzw9Pl5gfF0pJyArIHRwbF9ob3N0X3BvcnRfZnV6enlfc3RyaWN0ICsgc3JjX3BhdGggKyAnKSc7XG4iLCJtb2R1bGUuZXhwb3J0cz0vW1xcMC1cXHgxRlxceDdGLVxceDlGXS8iLCJtb2R1bGUuZXhwb3J0cz0vW1xceEFEXFx1MDYwMC1cXHUwNjA1XFx1MDYxQ1xcdTA2RERcXHUwNzBGXFx1MTgwRVxcdTIwMEItXFx1MjAwRlxcdTIwMkEtXFx1MjAyRVxcdTIwNjAtXFx1MjA2NFxcdTIwNjYtXFx1MjA2RlxcdUZFRkZcXHVGRkY5LVxcdUZGRkJdfFxcdUQ4MDRcXHVEQ0JEfFxcdUQ4MkZbXFx1RENBMC1cXHVEQ0EzXXxcXHVEODM0W1xcdURENzMtXFx1REQ3QV18XFx1REI0MFtcXHVEQzAxXFx1REMyMC1cXHVEQzdGXS8iLCJtb2R1bGUuZXhwb3J0cz0vWyEtIyUtXFwqLC0vOjtcXD9AXFxbLVxcXV9cXHtcXH1cXHhBMVxceEE3XFx4QUJcXHhCNlxceEI3XFx4QkJcXHhCRlxcdTAzN0VcXHUwMzg3XFx1MDU1QS1cXHUwNTVGXFx1MDU4OVxcdTA1OEFcXHUwNUJFXFx1MDVDMFxcdTA1QzNcXHUwNUM2XFx1MDVGM1xcdTA1RjRcXHUwNjA5XFx1MDYwQVxcdTA2MENcXHUwNjBEXFx1MDYxQlxcdTA2MUVcXHUwNjFGXFx1MDY2QS1cXHUwNjZEXFx1MDZENFxcdTA3MDAtXFx1MDcwRFxcdTA3RjctXFx1MDdGOVxcdTA4MzAtXFx1MDgzRVxcdTA4NUVcXHUwOTY0XFx1MDk2NVxcdTA5NzBcXHUwQUYwXFx1MERGNFxcdTBFNEZcXHUwRTVBXFx1MEU1QlxcdTBGMDQtXFx1MEYxMlxcdTBGMTRcXHUwRjNBLVxcdTBGM0RcXHUwRjg1XFx1MEZEMC1cXHUwRkQ0XFx1MEZEOVxcdTBGREFcXHUxMDRBLVxcdTEwNEZcXHUxMEZCXFx1MTM2MC1cXHUxMzY4XFx1MTQwMFxcdTE2NkRcXHUxNjZFXFx1MTY5QlxcdTE2OUNcXHUxNkVCLVxcdTE2RURcXHUxNzM1XFx1MTczNlxcdTE3RDQtXFx1MTdENlxcdTE3RDgtXFx1MTdEQVxcdTE4MDAtXFx1MTgwQVxcdTE5NDRcXHUxOTQ1XFx1MUExRVxcdTFBMUZcXHUxQUEwLVxcdTFBQTZcXHUxQUE4LVxcdTFBQURcXHUxQjVBLVxcdTFCNjBcXHUxQkZDLVxcdTFCRkZcXHUxQzNCLVxcdTFDM0ZcXHUxQzdFXFx1MUM3RlxcdTFDQzAtXFx1MUNDN1xcdTFDRDNcXHUyMDEwLVxcdTIwMjdcXHUyMDMwLVxcdTIwNDNcXHUyMDQ1LVxcdTIwNTFcXHUyMDUzLVxcdTIwNUVcXHUyMDdEXFx1MjA3RVxcdTIwOERcXHUyMDhFXFx1MjMwOC1cXHUyMzBCXFx1MjMyOVxcdTIzMkFcXHUyNzY4LVxcdTI3NzVcXHUyN0M1XFx1MjdDNlxcdTI3RTYtXFx1MjdFRlxcdTI5ODMtXFx1Mjk5OFxcdTI5RDgtXFx1MjlEQlxcdTI5RkNcXHUyOUZEXFx1MkNGOS1cXHUyQ0ZDXFx1MkNGRVxcdTJDRkZcXHUyRDcwXFx1MkUwMC1cXHUyRTJFXFx1MkUzMC1cXHUyRTQyXFx1MzAwMS1cXHUzMDAzXFx1MzAwOC1cXHUzMDExXFx1MzAxNC1cXHUzMDFGXFx1MzAzMFxcdTMwM0RcXHUzMEEwXFx1MzBGQlxcdUE0RkVcXHVBNEZGXFx1QTYwRC1cXHVBNjBGXFx1QTY3M1xcdUE2N0VcXHVBNkYyLVxcdUE2RjdcXHVBODc0LVxcdUE4NzdcXHVBOENFXFx1QThDRlxcdUE4RjgtXFx1QThGQVxcdUE5MkVcXHVBOTJGXFx1QTk1RlxcdUE5QzEtXFx1QTlDRFxcdUE5REVcXHVBOURGXFx1QUE1Qy1cXHVBQTVGXFx1QUFERVxcdUFBREZcXHVBQUYwXFx1QUFGMVxcdUFCRUJcXHVGRDNFXFx1RkQzRlxcdUZFMTAtXFx1RkUxOVxcdUZFMzAtXFx1RkU1MlxcdUZFNTQtXFx1RkU2MVxcdUZFNjNcXHVGRTY4XFx1RkU2QVxcdUZFNkJcXHVGRjAxLVxcdUZGMDNcXHVGRjA1LVxcdUZGMEFcXHVGRjBDLVxcdUZGMEZcXHVGRjFBXFx1RkYxQlxcdUZGMUZcXHVGRjIwXFx1RkYzQi1cXHVGRjNEXFx1RkYzRlxcdUZGNUJcXHVGRjVEXFx1RkY1Ri1cXHVGRjY1XXxcXHVEODAwW1xcdUREMDAtXFx1REQwMlxcdURGOUZcXHVERkQwXXxcXHVEODAxXFx1REQ2RnxcXHVEODAyW1xcdURDNTdcXHVERDFGXFx1REQzRlxcdURFNTAtXFx1REU1OFxcdURFN0ZcXHVERUYwLVxcdURFRjZcXHVERjM5LVxcdURGM0ZcXHVERjk5LVxcdURGOUNdfFxcdUQ4MDRbXFx1REM0Ny1cXHVEQzREXFx1RENCQlxcdURDQkNcXHVEQ0JFLVxcdURDQzFcXHVERDQwLVxcdURENDNcXHVERDc0XFx1REQ3NVxcdUREQzUtXFx1RERDOFxcdUREQ0RcXHVERTM4LVxcdURFM0RdfFxcdUQ4MDVbXFx1RENDNlxcdUREQzEtXFx1RERDOVxcdURFNDEtXFx1REU0M118XFx1RDgwOVtcXHVEQzcwLVxcdURDNzRdfFxcdUQ4MUFbXFx1REU2RVxcdURFNkZcXHVERUY1XFx1REYzNy1cXHVERjNCXFx1REY0NF18XFx1RDgyRlxcdURDOUYvIiwibW9kdWxlLmV4cG9ydHM9L1sgXFx4QTBcXHUxNjgwXFx1MjAwMC1cXHUyMDBBXFx1MjAyOFxcdTIwMjlcXHUyMDJGXFx1MjA1RlxcdTMwMDBdLyIsIm1vZHVsZS5leHBvcnRzPS9bXFwwLVxcdUQ3RkZcXHVEQzAwLVxcdUZGRkZdfFtcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRl18W1xcdUQ4MDAtXFx1REJGRl0vIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvJyk7XG4iLCIvLyBMaXN0IG9mIHZhbGlkIGVudGl0aWVzXG4vL1xuLy8gR2VuZXJhdGUgd2l0aCAuL3N1cHBvcnQvZW50aXRpZXMuanMgc2NyaXB0XG4vL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKmVzbGludCBxdW90ZXM6MCovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJBYWN1dGVcIjpcIlxcdTAwQzFcIixcbiAgXCJhYWN1dGVcIjpcIlxcdTAwRTFcIixcbiAgXCJBYnJldmVcIjpcIlxcdTAxMDJcIixcbiAgXCJhYnJldmVcIjpcIlxcdTAxMDNcIixcbiAgXCJhY1wiOlwiXFx1MjIzRVwiLFxuICBcImFjZFwiOlwiXFx1MjIzRlwiLFxuICBcImFjRVwiOlwiXFx1MjIzRVxcdTAzMzNcIixcbiAgXCJBY2lyY1wiOlwiXFx1MDBDMlwiLFxuICBcImFjaXJjXCI6XCJcXHUwMEUyXCIsXG4gIFwiYWN1dGVcIjpcIlxcdTAwQjRcIixcbiAgXCJBY3lcIjpcIlxcdTA0MTBcIixcbiAgXCJhY3lcIjpcIlxcdTA0MzBcIixcbiAgXCJBRWxpZ1wiOlwiXFx1MDBDNlwiLFxuICBcImFlbGlnXCI6XCJcXHUwMEU2XCIsXG4gIFwiYWZcIjpcIlxcdTIwNjFcIixcbiAgXCJBZnJcIjpcIlxcdUQ4MzVcXHVERDA0XCIsXG4gIFwiYWZyXCI6XCJcXHVEODM1XFx1REQxRVwiLFxuICBcIkFncmF2ZVwiOlwiXFx1MDBDMFwiLFxuICBcImFncmF2ZVwiOlwiXFx1MDBFMFwiLFxuICBcImFsZWZzeW1cIjpcIlxcdTIxMzVcIixcbiAgXCJhbGVwaFwiOlwiXFx1MjEzNVwiLFxuICBcIkFscGhhXCI6XCJcXHUwMzkxXCIsXG4gIFwiYWxwaGFcIjpcIlxcdTAzQjFcIixcbiAgXCJBbWFjclwiOlwiXFx1MDEwMFwiLFxuICBcImFtYWNyXCI6XCJcXHUwMTAxXCIsXG4gIFwiYW1hbGdcIjpcIlxcdTJBM0ZcIixcbiAgXCJBTVBcIjpcIlxcdTAwMjZcIixcbiAgXCJhbXBcIjpcIlxcdTAwMjZcIixcbiAgXCJBbmRcIjpcIlxcdTJBNTNcIixcbiAgXCJhbmRcIjpcIlxcdTIyMjdcIixcbiAgXCJhbmRhbmRcIjpcIlxcdTJBNTVcIixcbiAgXCJhbmRkXCI6XCJcXHUyQTVDXCIsXG4gIFwiYW5kc2xvcGVcIjpcIlxcdTJBNThcIixcbiAgXCJhbmR2XCI6XCJcXHUyQTVBXCIsXG4gIFwiYW5nXCI6XCJcXHUyMjIwXCIsXG4gIFwiYW5nZVwiOlwiXFx1MjlBNFwiLFxuICBcImFuZ2xlXCI6XCJcXHUyMjIwXCIsXG4gIFwiYW5nbXNkXCI6XCJcXHUyMjIxXCIsXG4gIFwiYW5nbXNkYWFcIjpcIlxcdTI5QThcIixcbiAgXCJhbmdtc2RhYlwiOlwiXFx1MjlBOVwiLFxuICBcImFuZ21zZGFjXCI6XCJcXHUyOUFBXCIsXG4gIFwiYW5nbXNkYWRcIjpcIlxcdTI5QUJcIixcbiAgXCJhbmdtc2RhZVwiOlwiXFx1MjlBQ1wiLFxuICBcImFuZ21zZGFmXCI6XCJcXHUyOUFEXCIsXG4gIFwiYW5nbXNkYWdcIjpcIlxcdTI5QUVcIixcbiAgXCJhbmdtc2RhaFwiOlwiXFx1MjlBRlwiLFxuICBcImFuZ3J0XCI6XCJcXHUyMjFGXCIsXG4gIFwiYW5ncnR2YlwiOlwiXFx1MjJCRVwiLFxuICBcImFuZ3J0dmJkXCI6XCJcXHUyOTlEXCIsXG4gIFwiYW5nc3BoXCI6XCJcXHUyMjIyXCIsXG4gIFwiYW5nc3RcIjpcIlxcdTAwQzVcIixcbiAgXCJhbmd6YXJyXCI6XCJcXHUyMzdDXCIsXG4gIFwiQW9nb25cIjpcIlxcdTAxMDRcIixcbiAgXCJhb2dvblwiOlwiXFx1MDEwNVwiLFxuICBcIkFvcGZcIjpcIlxcdUQ4MzVcXHVERDM4XCIsXG4gIFwiYW9wZlwiOlwiXFx1RDgzNVxcdURENTJcIixcbiAgXCJhcFwiOlwiXFx1MjI0OFwiLFxuICBcImFwYWNpclwiOlwiXFx1MkE2RlwiLFxuICBcImFwRVwiOlwiXFx1MkE3MFwiLFxuICBcImFwZVwiOlwiXFx1MjI0QVwiLFxuICBcImFwaWRcIjpcIlxcdTIyNEJcIixcbiAgXCJhcG9zXCI6XCJcXHUwMDI3XCIsXG4gIFwiQXBwbHlGdW5jdGlvblwiOlwiXFx1MjA2MVwiLFxuICBcImFwcHJveFwiOlwiXFx1MjI0OFwiLFxuICBcImFwcHJveGVxXCI6XCJcXHUyMjRBXCIsXG4gIFwiQXJpbmdcIjpcIlxcdTAwQzVcIixcbiAgXCJhcmluZ1wiOlwiXFx1MDBFNVwiLFxuICBcIkFzY3JcIjpcIlxcdUQ4MzVcXHVEQzlDXCIsXG4gIFwiYXNjclwiOlwiXFx1RDgzNVxcdURDQjZcIixcbiAgXCJBc3NpZ25cIjpcIlxcdTIyNTRcIixcbiAgXCJhc3RcIjpcIlxcdTAwMkFcIixcbiAgXCJhc3ltcFwiOlwiXFx1MjI0OFwiLFxuICBcImFzeW1wZXFcIjpcIlxcdTIyNERcIixcbiAgXCJBdGlsZGVcIjpcIlxcdTAwQzNcIixcbiAgXCJhdGlsZGVcIjpcIlxcdTAwRTNcIixcbiAgXCJBdW1sXCI6XCJcXHUwMEM0XCIsXG4gIFwiYXVtbFwiOlwiXFx1MDBFNFwiLFxuICBcImF3Y29uaW50XCI6XCJcXHUyMjMzXCIsXG4gIFwiYXdpbnRcIjpcIlxcdTJBMTFcIixcbiAgXCJiYWNrY29uZ1wiOlwiXFx1MjI0Q1wiLFxuICBcImJhY2tlcHNpbG9uXCI6XCJcXHUwM0Y2XCIsXG4gIFwiYmFja3ByaW1lXCI6XCJcXHUyMDM1XCIsXG4gIFwiYmFja3NpbVwiOlwiXFx1MjIzRFwiLFxuICBcImJhY2tzaW1lcVwiOlwiXFx1MjJDRFwiLFxuICBcIkJhY2tzbGFzaFwiOlwiXFx1MjIxNlwiLFxuICBcIkJhcnZcIjpcIlxcdTJBRTdcIixcbiAgXCJiYXJ2ZWVcIjpcIlxcdTIyQkRcIixcbiAgXCJCYXJ3ZWRcIjpcIlxcdTIzMDZcIixcbiAgXCJiYXJ3ZWRcIjpcIlxcdTIzMDVcIixcbiAgXCJiYXJ3ZWRnZVwiOlwiXFx1MjMwNVwiLFxuICBcImJicmtcIjpcIlxcdTIzQjVcIixcbiAgXCJiYnJrdGJya1wiOlwiXFx1MjNCNlwiLFxuICBcImJjb25nXCI6XCJcXHUyMjRDXCIsXG4gIFwiQmN5XCI6XCJcXHUwNDExXCIsXG4gIFwiYmN5XCI6XCJcXHUwNDMxXCIsXG4gIFwiYmRxdW9cIjpcIlxcdTIwMUVcIixcbiAgXCJiZWNhdXNcIjpcIlxcdTIyMzVcIixcbiAgXCJCZWNhdXNlXCI6XCJcXHUyMjM1XCIsXG4gIFwiYmVjYXVzZVwiOlwiXFx1MjIzNVwiLFxuICBcImJlbXB0eXZcIjpcIlxcdTI5QjBcIixcbiAgXCJiZXBzaVwiOlwiXFx1MDNGNlwiLFxuICBcImJlcm5vdVwiOlwiXFx1MjEyQ1wiLFxuICBcIkJlcm5vdWxsaXNcIjpcIlxcdTIxMkNcIixcbiAgXCJCZXRhXCI6XCJcXHUwMzkyXCIsXG4gIFwiYmV0YVwiOlwiXFx1MDNCMlwiLFxuICBcImJldGhcIjpcIlxcdTIxMzZcIixcbiAgXCJiZXR3ZWVuXCI6XCJcXHUyMjZDXCIsXG4gIFwiQmZyXCI6XCJcXHVEODM1XFx1REQwNVwiLFxuICBcImJmclwiOlwiXFx1RDgzNVxcdUREMUZcIixcbiAgXCJiaWdjYXBcIjpcIlxcdTIyQzJcIixcbiAgXCJiaWdjaXJjXCI6XCJcXHUyNUVGXCIsXG4gIFwiYmlnY3VwXCI6XCJcXHUyMkMzXCIsXG4gIFwiYmlnb2RvdFwiOlwiXFx1MkEwMFwiLFxuICBcImJpZ29wbHVzXCI6XCJcXHUyQTAxXCIsXG4gIFwiYmlnb3RpbWVzXCI6XCJcXHUyQTAyXCIsXG4gIFwiYmlnc3FjdXBcIjpcIlxcdTJBMDZcIixcbiAgXCJiaWdzdGFyXCI6XCJcXHUyNjA1XCIsXG4gIFwiYmlndHJpYW5nbGVkb3duXCI6XCJcXHUyNUJEXCIsXG4gIFwiYmlndHJpYW5nbGV1cFwiOlwiXFx1MjVCM1wiLFxuICBcImJpZ3VwbHVzXCI6XCJcXHUyQTA0XCIsXG4gIFwiYmlndmVlXCI6XCJcXHUyMkMxXCIsXG4gIFwiYmlnd2VkZ2VcIjpcIlxcdTIyQzBcIixcbiAgXCJia2Fyb3dcIjpcIlxcdTI5MERcIixcbiAgXCJibGFja2xvemVuZ2VcIjpcIlxcdTI5RUJcIixcbiAgXCJibGFja3NxdWFyZVwiOlwiXFx1MjVBQVwiLFxuICBcImJsYWNrdHJpYW5nbGVcIjpcIlxcdTI1QjRcIixcbiAgXCJibGFja3RyaWFuZ2xlZG93blwiOlwiXFx1MjVCRVwiLFxuICBcImJsYWNrdHJpYW5nbGVsZWZ0XCI6XCJcXHUyNUMyXCIsXG4gIFwiYmxhY2t0cmlhbmdsZXJpZ2h0XCI6XCJcXHUyNUI4XCIsXG4gIFwiYmxhbmtcIjpcIlxcdTI0MjNcIixcbiAgXCJibGsxMlwiOlwiXFx1MjU5MlwiLFxuICBcImJsazE0XCI6XCJcXHUyNTkxXCIsXG4gIFwiYmxrMzRcIjpcIlxcdTI1OTNcIixcbiAgXCJibG9ja1wiOlwiXFx1MjU4OFwiLFxuICBcImJuZVwiOlwiXFx1MDAzRFxcdTIwRTVcIixcbiAgXCJibmVxdWl2XCI6XCJcXHUyMjYxXFx1MjBFNVwiLFxuICBcImJOb3RcIjpcIlxcdTJBRURcIixcbiAgXCJibm90XCI6XCJcXHUyMzEwXCIsXG4gIFwiQm9wZlwiOlwiXFx1RDgzNVxcdUREMzlcIixcbiAgXCJib3BmXCI6XCJcXHVEODM1XFx1REQ1M1wiLFxuICBcImJvdFwiOlwiXFx1MjJBNVwiLFxuICBcImJvdHRvbVwiOlwiXFx1MjJBNVwiLFxuICBcImJvd3RpZVwiOlwiXFx1MjJDOFwiLFxuICBcImJveGJveFwiOlwiXFx1MjlDOVwiLFxuICBcImJveERMXCI6XCJcXHUyNTU3XCIsXG4gIFwiYm94RGxcIjpcIlxcdTI1NTZcIixcbiAgXCJib3hkTFwiOlwiXFx1MjU1NVwiLFxuICBcImJveGRsXCI6XCJcXHUyNTEwXCIsXG4gIFwiYm94RFJcIjpcIlxcdTI1NTRcIixcbiAgXCJib3hEclwiOlwiXFx1MjU1M1wiLFxuICBcImJveGRSXCI6XCJcXHUyNTUyXCIsXG4gIFwiYm94ZHJcIjpcIlxcdTI1MENcIixcbiAgXCJib3hIXCI6XCJcXHUyNTUwXCIsXG4gIFwiYm94aFwiOlwiXFx1MjUwMFwiLFxuICBcImJveEhEXCI6XCJcXHUyNTY2XCIsXG4gIFwiYm94SGRcIjpcIlxcdTI1NjRcIixcbiAgXCJib3hoRFwiOlwiXFx1MjU2NVwiLFxuICBcImJveGhkXCI6XCJcXHUyNTJDXCIsXG4gIFwiYm94SFVcIjpcIlxcdTI1NjlcIixcbiAgXCJib3hIdVwiOlwiXFx1MjU2N1wiLFxuICBcImJveGhVXCI6XCJcXHUyNTY4XCIsXG4gIFwiYm94aHVcIjpcIlxcdTI1MzRcIixcbiAgXCJib3htaW51c1wiOlwiXFx1MjI5RlwiLFxuICBcImJveHBsdXNcIjpcIlxcdTIyOUVcIixcbiAgXCJib3h0aW1lc1wiOlwiXFx1MjJBMFwiLFxuICBcImJveFVMXCI6XCJcXHUyNTVEXCIsXG4gIFwiYm94VWxcIjpcIlxcdTI1NUNcIixcbiAgXCJib3h1TFwiOlwiXFx1MjU1QlwiLFxuICBcImJveHVsXCI6XCJcXHUyNTE4XCIsXG4gIFwiYm94VVJcIjpcIlxcdTI1NUFcIixcbiAgXCJib3hVclwiOlwiXFx1MjU1OVwiLFxuICBcImJveHVSXCI6XCJcXHUyNTU4XCIsXG4gIFwiYm94dXJcIjpcIlxcdTI1MTRcIixcbiAgXCJib3hWXCI6XCJcXHUyNTUxXCIsXG4gIFwiYm94dlwiOlwiXFx1MjUwMlwiLFxuICBcImJveFZIXCI6XCJcXHUyNTZDXCIsXG4gIFwiYm94VmhcIjpcIlxcdTI1NkJcIixcbiAgXCJib3h2SFwiOlwiXFx1MjU2QVwiLFxuICBcImJveHZoXCI6XCJcXHUyNTNDXCIsXG4gIFwiYm94VkxcIjpcIlxcdTI1NjNcIixcbiAgXCJib3hWbFwiOlwiXFx1MjU2MlwiLFxuICBcImJveHZMXCI6XCJcXHUyNTYxXCIsXG4gIFwiYm94dmxcIjpcIlxcdTI1MjRcIixcbiAgXCJib3hWUlwiOlwiXFx1MjU2MFwiLFxuICBcImJveFZyXCI6XCJcXHUyNTVGXCIsXG4gIFwiYm94dlJcIjpcIlxcdTI1NUVcIixcbiAgXCJib3h2clwiOlwiXFx1MjUxQ1wiLFxuICBcImJwcmltZVwiOlwiXFx1MjAzNVwiLFxuICBcIkJyZXZlXCI6XCJcXHUwMkQ4XCIsXG4gIFwiYnJldmVcIjpcIlxcdTAyRDhcIixcbiAgXCJicnZiYXJcIjpcIlxcdTAwQTZcIixcbiAgXCJCc2NyXCI6XCJcXHUyMTJDXCIsXG4gIFwiYnNjclwiOlwiXFx1RDgzNVxcdURDQjdcIixcbiAgXCJic2VtaVwiOlwiXFx1MjA0RlwiLFxuICBcImJzaW1cIjpcIlxcdTIyM0RcIixcbiAgXCJic2ltZVwiOlwiXFx1MjJDRFwiLFxuICBcImJzb2xcIjpcIlxcdTAwNUNcIixcbiAgXCJic29sYlwiOlwiXFx1MjlDNVwiLFxuICBcImJzb2xoc3ViXCI6XCJcXHUyN0M4XCIsXG4gIFwiYnVsbFwiOlwiXFx1MjAyMlwiLFxuICBcImJ1bGxldFwiOlwiXFx1MjAyMlwiLFxuICBcImJ1bXBcIjpcIlxcdTIyNEVcIixcbiAgXCJidW1wRVwiOlwiXFx1MkFBRVwiLFxuICBcImJ1bXBlXCI6XCJcXHUyMjRGXCIsXG4gIFwiQnVtcGVxXCI6XCJcXHUyMjRFXCIsXG4gIFwiYnVtcGVxXCI6XCJcXHUyMjRGXCIsXG4gIFwiQ2FjdXRlXCI6XCJcXHUwMTA2XCIsXG4gIFwiY2FjdXRlXCI6XCJcXHUwMTA3XCIsXG4gIFwiQ2FwXCI6XCJcXHUyMkQyXCIsXG4gIFwiY2FwXCI6XCJcXHUyMjI5XCIsXG4gIFwiY2FwYW5kXCI6XCJcXHUyQTQ0XCIsXG4gIFwiY2FwYnJjdXBcIjpcIlxcdTJBNDlcIixcbiAgXCJjYXBjYXBcIjpcIlxcdTJBNEJcIixcbiAgXCJjYXBjdXBcIjpcIlxcdTJBNDdcIixcbiAgXCJjYXBkb3RcIjpcIlxcdTJBNDBcIixcbiAgXCJDYXBpdGFsRGlmZmVyZW50aWFsRFwiOlwiXFx1MjE0NVwiLFxuICBcImNhcHNcIjpcIlxcdTIyMjlcXHVGRTAwXCIsXG4gIFwiY2FyZXRcIjpcIlxcdTIwNDFcIixcbiAgXCJjYXJvblwiOlwiXFx1MDJDN1wiLFxuICBcIkNheWxleXNcIjpcIlxcdTIxMkRcIixcbiAgXCJjY2Fwc1wiOlwiXFx1MkE0RFwiLFxuICBcIkNjYXJvblwiOlwiXFx1MDEwQ1wiLFxuICBcImNjYXJvblwiOlwiXFx1MDEwRFwiLFxuICBcIkNjZWRpbFwiOlwiXFx1MDBDN1wiLFxuICBcImNjZWRpbFwiOlwiXFx1MDBFN1wiLFxuICBcIkNjaXJjXCI6XCJcXHUwMTA4XCIsXG4gIFwiY2NpcmNcIjpcIlxcdTAxMDlcIixcbiAgXCJDY29uaW50XCI6XCJcXHUyMjMwXCIsXG4gIFwiY2N1cHNcIjpcIlxcdTJBNENcIixcbiAgXCJjY3Vwc3NtXCI6XCJcXHUyQTUwXCIsXG4gIFwiQ2RvdFwiOlwiXFx1MDEwQVwiLFxuICBcImNkb3RcIjpcIlxcdTAxMEJcIixcbiAgXCJjZWRpbFwiOlwiXFx1MDBCOFwiLFxuICBcIkNlZGlsbGFcIjpcIlxcdTAwQjhcIixcbiAgXCJjZW1wdHl2XCI6XCJcXHUyOUIyXCIsXG4gIFwiY2VudFwiOlwiXFx1MDBBMlwiLFxuICBcIkNlbnRlckRvdFwiOlwiXFx1MDBCN1wiLFxuICBcImNlbnRlcmRvdFwiOlwiXFx1MDBCN1wiLFxuICBcIkNmclwiOlwiXFx1MjEyRFwiLFxuICBcImNmclwiOlwiXFx1RDgzNVxcdUREMjBcIixcbiAgXCJDSGN5XCI6XCJcXHUwNDI3XCIsXG4gIFwiY2hjeVwiOlwiXFx1MDQ0N1wiLFxuICBcImNoZWNrXCI6XCJcXHUyNzEzXCIsXG4gIFwiY2hlY2ttYXJrXCI6XCJcXHUyNzEzXCIsXG4gIFwiQ2hpXCI6XCJcXHUwM0E3XCIsXG4gIFwiY2hpXCI6XCJcXHUwM0M3XCIsXG4gIFwiY2lyXCI6XCJcXHUyNUNCXCIsXG4gIFwiY2lyY1wiOlwiXFx1MDJDNlwiLFxuICBcImNpcmNlcVwiOlwiXFx1MjI1N1wiLFxuICBcImNpcmNsZWFycm93bGVmdFwiOlwiXFx1MjFCQVwiLFxuICBcImNpcmNsZWFycm93cmlnaHRcIjpcIlxcdTIxQkJcIixcbiAgXCJjaXJjbGVkYXN0XCI6XCJcXHUyMjlCXCIsXG4gIFwiY2lyY2xlZGNpcmNcIjpcIlxcdTIyOUFcIixcbiAgXCJjaXJjbGVkZGFzaFwiOlwiXFx1MjI5RFwiLFxuICBcIkNpcmNsZURvdFwiOlwiXFx1MjI5OVwiLFxuICBcImNpcmNsZWRSXCI6XCJcXHUwMEFFXCIsXG4gIFwiY2lyY2xlZFNcIjpcIlxcdTI0QzhcIixcbiAgXCJDaXJjbGVNaW51c1wiOlwiXFx1MjI5NlwiLFxuICBcIkNpcmNsZVBsdXNcIjpcIlxcdTIyOTVcIixcbiAgXCJDaXJjbGVUaW1lc1wiOlwiXFx1MjI5N1wiLFxuICBcImNpckVcIjpcIlxcdTI5QzNcIixcbiAgXCJjaXJlXCI6XCJcXHUyMjU3XCIsXG4gIFwiY2lyZm5pbnRcIjpcIlxcdTJBMTBcIixcbiAgXCJjaXJtaWRcIjpcIlxcdTJBRUZcIixcbiAgXCJjaXJzY2lyXCI6XCJcXHUyOUMyXCIsXG4gIFwiQ2xvY2t3aXNlQ29udG91ckludGVncmFsXCI6XCJcXHUyMjMyXCIsXG4gIFwiQ2xvc2VDdXJseURvdWJsZVF1b3RlXCI6XCJcXHUyMDFEXCIsXG4gIFwiQ2xvc2VDdXJseVF1b3RlXCI6XCJcXHUyMDE5XCIsXG4gIFwiY2x1YnNcIjpcIlxcdTI2NjNcIixcbiAgXCJjbHVic3VpdFwiOlwiXFx1MjY2M1wiLFxuICBcIkNvbG9uXCI6XCJcXHUyMjM3XCIsXG4gIFwiY29sb25cIjpcIlxcdTAwM0FcIixcbiAgXCJDb2xvbmVcIjpcIlxcdTJBNzRcIixcbiAgXCJjb2xvbmVcIjpcIlxcdTIyNTRcIixcbiAgXCJjb2xvbmVxXCI6XCJcXHUyMjU0XCIsXG4gIFwiY29tbWFcIjpcIlxcdTAwMkNcIixcbiAgXCJjb21tYXRcIjpcIlxcdTAwNDBcIixcbiAgXCJjb21wXCI6XCJcXHUyMjAxXCIsXG4gIFwiY29tcGZuXCI6XCJcXHUyMjE4XCIsXG4gIFwiY29tcGxlbWVudFwiOlwiXFx1MjIwMVwiLFxuICBcImNvbXBsZXhlc1wiOlwiXFx1MjEwMlwiLFxuICBcImNvbmdcIjpcIlxcdTIyNDVcIixcbiAgXCJjb25nZG90XCI6XCJcXHUyQTZEXCIsXG4gIFwiQ29uZ3J1ZW50XCI6XCJcXHUyMjYxXCIsXG4gIFwiQ29uaW50XCI6XCJcXHUyMjJGXCIsXG4gIFwiY29uaW50XCI6XCJcXHUyMjJFXCIsXG4gIFwiQ29udG91ckludGVncmFsXCI6XCJcXHUyMjJFXCIsXG4gIFwiQ29wZlwiOlwiXFx1MjEwMlwiLFxuICBcImNvcGZcIjpcIlxcdUQ4MzVcXHVERDU0XCIsXG4gIFwiY29wcm9kXCI6XCJcXHUyMjEwXCIsXG4gIFwiQ29wcm9kdWN0XCI6XCJcXHUyMjEwXCIsXG4gIFwiQ09QWVwiOlwiXFx1MDBBOVwiLFxuICBcImNvcHlcIjpcIlxcdTAwQTlcIixcbiAgXCJjb3B5c3JcIjpcIlxcdTIxMTdcIixcbiAgXCJDb3VudGVyQ2xvY2t3aXNlQ29udG91ckludGVncmFsXCI6XCJcXHUyMjMzXCIsXG4gIFwiY3JhcnJcIjpcIlxcdTIxQjVcIixcbiAgXCJDcm9zc1wiOlwiXFx1MkEyRlwiLFxuICBcImNyb3NzXCI6XCJcXHUyNzE3XCIsXG4gIFwiQ3NjclwiOlwiXFx1RDgzNVxcdURDOUVcIixcbiAgXCJjc2NyXCI6XCJcXHVEODM1XFx1RENCOFwiLFxuICBcImNzdWJcIjpcIlxcdTJBQ0ZcIixcbiAgXCJjc3ViZVwiOlwiXFx1MkFEMVwiLFxuICBcImNzdXBcIjpcIlxcdTJBRDBcIixcbiAgXCJjc3VwZVwiOlwiXFx1MkFEMlwiLFxuICBcImN0ZG90XCI6XCJcXHUyMkVGXCIsXG4gIFwiY3VkYXJybFwiOlwiXFx1MjkzOFwiLFxuICBcImN1ZGFycnJcIjpcIlxcdTI5MzVcIixcbiAgXCJjdWVwclwiOlwiXFx1MjJERVwiLFxuICBcImN1ZXNjXCI6XCJcXHUyMkRGXCIsXG4gIFwiY3VsYXJyXCI6XCJcXHUyMUI2XCIsXG4gIFwiY3VsYXJycFwiOlwiXFx1MjkzRFwiLFxuICBcIkN1cFwiOlwiXFx1MjJEM1wiLFxuICBcImN1cFwiOlwiXFx1MjIyQVwiLFxuICBcImN1cGJyY2FwXCI6XCJcXHUyQTQ4XCIsXG4gIFwiQ3VwQ2FwXCI6XCJcXHUyMjREXCIsXG4gIFwiY3VwY2FwXCI6XCJcXHUyQTQ2XCIsXG4gIFwiY3VwY3VwXCI6XCJcXHUyQTRBXCIsXG4gIFwiY3VwZG90XCI6XCJcXHUyMjhEXCIsXG4gIFwiY3Vwb3JcIjpcIlxcdTJBNDVcIixcbiAgXCJjdXBzXCI6XCJcXHUyMjJBXFx1RkUwMFwiLFxuICBcImN1cmFyclwiOlwiXFx1MjFCN1wiLFxuICBcImN1cmFycm1cIjpcIlxcdTI5M0NcIixcbiAgXCJjdXJseWVxcHJlY1wiOlwiXFx1MjJERVwiLFxuICBcImN1cmx5ZXFzdWNjXCI6XCJcXHUyMkRGXCIsXG4gIFwiY3VybHl2ZWVcIjpcIlxcdTIyQ0VcIixcbiAgXCJjdXJseXdlZGdlXCI6XCJcXHUyMkNGXCIsXG4gIFwiY3VycmVuXCI6XCJcXHUwMEE0XCIsXG4gIFwiY3VydmVhcnJvd2xlZnRcIjpcIlxcdTIxQjZcIixcbiAgXCJjdXJ2ZWFycm93cmlnaHRcIjpcIlxcdTIxQjdcIixcbiAgXCJjdXZlZVwiOlwiXFx1MjJDRVwiLFxuICBcImN1d2VkXCI6XCJcXHUyMkNGXCIsXG4gIFwiY3djb25pbnRcIjpcIlxcdTIyMzJcIixcbiAgXCJjd2ludFwiOlwiXFx1MjIzMVwiLFxuICBcImN5bGN0eVwiOlwiXFx1MjMyRFwiLFxuICBcIkRhZ2dlclwiOlwiXFx1MjAyMVwiLFxuICBcImRhZ2dlclwiOlwiXFx1MjAyMFwiLFxuICBcImRhbGV0aFwiOlwiXFx1MjEzOFwiLFxuICBcIkRhcnJcIjpcIlxcdTIxQTFcIixcbiAgXCJkQXJyXCI6XCJcXHUyMUQzXCIsXG4gIFwiZGFyclwiOlwiXFx1MjE5M1wiLFxuICBcImRhc2hcIjpcIlxcdTIwMTBcIixcbiAgXCJEYXNodlwiOlwiXFx1MkFFNFwiLFxuICBcImRhc2h2XCI6XCJcXHUyMkEzXCIsXG4gIFwiZGJrYXJvd1wiOlwiXFx1MjkwRlwiLFxuICBcImRibGFjXCI6XCJcXHUwMkREXCIsXG4gIFwiRGNhcm9uXCI6XCJcXHUwMTBFXCIsXG4gIFwiZGNhcm9uXCI6XCJcXHUwMTBGXCIsXG4gIFwiRGN5XCI6XCJcXHUwNDE0XCIsXG4gIFwiZGN5XCI6XCJcXHUwNDM0XCIsXG4gIFwiRERcIjpcIlxcdTIxNDVcIixcbiAgXCJkZFwiOlwiXFx1MjE0NlwiLFxuICBcImRkYWdnZXJcIjpcIlxcdTIwMjFcIixcbiAgXCJkZGFyclwiOlwiXFx1MjFDQVwiLFxuICBcIkREb3RyYWhkXCI6XCJcXHUyOTExXCIsXG4gIFwiZGRvdHNlcVwiOlwiXFx1MkE3N1wiLFxuICBcImRlZ1wiOlwiXFx1MDBCMFwiLFxuICBcIkRlbFwiOlwiXFx1MjIwN1wiLFxuICBcIkRlbHRhXCI6XCJcXHUwMzk0XCIsXG4gIFwiZGVsdGFcIjpcIlxcdTAzQjRcIixcbiAgXCJkZW1wdHl2XCI6XCJcXHUyOUIxXCIsXG4gIFwiZGZpc2h0XCI6XCJcXHUyOTdGXCIsXG4gIFwiRGZyXCI6XCJcXHVEODM1XFx1REQwN1wiLFxuICBcImRmclwiOlwiXFx1RDgzNVxcdUREMjFcIixcbiAgXCJkSGFyXCI6XCJcXHUyOTY1XCIsXG4gIFwiZGhhcmxcIjpcIlxcdTIxQzNcIixcbiAgXCJkaGFyclwiOlwiXFx1MjFDMlwiLFxuICBcIkRpYWNyaXRpY2FsQWN1dGVcIjpcIlxcdTAwQjRcIixcbiAgXCJEaWFjcml0aWNhbERvdFwiOlwiXFx1MDJEOVwiLFxuICBcIkRpYWNyaXRpY2FsRG91YmxlQWN1dGVcIjpcIlxcdTAyRERcIixcbiAgXCJEaWFjcml0aWNhbEdyYXZlXCI6XCJcXHUwMDYwXCIsXG4gIFwiRGlhY3JpdGljYWxUaWxkZVwiOlwiXFx1MDJEQ1wiLFxuICBcImRpYW1cIjpcIlxcdTIyQzRcIixcbiAgXCJEaWFtb25kXCI6XCJcXHUyMkM0XCIsXG4gIFwiZGlhbW9uZFwiOlwiXFx1MjJDNFwiLFxuICBcImRpYW1vbmRzdWl0XCI6XCJcXHUyNjY2XCIsXG4gIFwiZGlhbXNcIjpcIlxcdTI2NjZcIixcbiAgXCJkaWVcIjpcIlxcdTAwQThcIixcbiAgXCJEaWZmZXJlbnRpYWxEXCI6XCJcXHUyMTQ2XCIsXG4gIFwiZGlnYW1tYVwiOlwiXFx1MDNERFwiLFxuICBcImRpc2luXCI6XCJcXHUyMkYyXCIsXG4gIFwiZGl2XCI6XCJcXHUwMEY3XCIsXG4gIFwiZGl2aWRlXCI6XCJcXHUwMEY3XCIsXG4gIFwiZGl2aWRlb250aW1lc1wiOlwiXFx1MjJDN1wiLFxuICBcImRpdm9ueFwiOlwiXFx1MjJDN1wiLFxuICBcIkRKY3lcIjpcIlxcdTA0MDJcIixcbiAgXCJkamN5XCI6XCJcXHUwNDUyXCIsXG4gIFwiZGxjb3JuXCI6XCJcXHUyMzFFXCIsXG4gIFwiZGxjcm9wXCI6XCJcXHUyMzBEXCIsXG4gIFwiZG9sbGFyXCI6XCJcXHUwMDI0XCIsXG4gIFwiRG9wZlwiOlwiXFx1RDgzNVxcdUREM0JcIixcbiAgXCJkb3BmXCI6XCJcXHVEODM1XFx1REQ1NVwiLFxuICBcIkRvdFwiOlwiXFx1MDBBOFwiLFxuICBcImRvdFwiOlwiXFx1MDJEOVwiLFxuICBcIkRvdERvdFwiOlwiXFx1MjBEQ1wiLFxuICBcImRvdGVxXCI6XCJcXHUyMjUwXCIsXG4gIFwiZG90ZXFkb3RcIjpcIlxcdTIyNTFcIixcbiAgXCJEb3RFcXVhbFwiOlwiXFx1MjI1MFwiLFxuICBcImRvdG1pbnVzXCI6XCJcXHUyMjM4XCIsXG4gIFwiZG90cGx1c1wiOlwiXFx1MjIxNFwiLFxuICBcImRvdHNxdWFyZVwiOlwiXFx1MjJBMVwiLFxuICBcImRvdWJsZWJhcndlZGdlXCI6XCJcXHUyMzA2XCIsXG4gIFwiRG91YmxlQ29udG91ckludGVncmFsXCI6XCJcXHUyMjJGXCIsXG4gIFwiRG91YmxlRG90XCI6XCJcXHUwMEE4XCIsXG4gIFwiRG91YmxlRG93bkFycm93XCI6XCJcXHUyMUQzXCIsXG4gIFwiRG91YmxlTGVmdEFycm93XCI6XCJcXHUyMUQwXCIsXG4gIFwiRG91YmxlTGVmdFJpZ2h0QXJyb3dcIjpcIlxcdTIxRDRcIixcbiAgXCJEb3VibGVMZWZ0VGVlXCI6XCJcXHUyQUU0XCIsXG4gIFwiRG91YmxlTG9uZ0xlZnRBcnJvd1wiOlwiXFx1MjdGOFwiLFxuICBcIkRvdWJsZUxvbmdMZWZ0UmlnaHRBcnJvd1wiOlwiXFx1MjdGQVwiLFxuICBcIkRvdWJsZUxvbmdSaWdodEFycm93XCI6XCJcXHUyN0Y5XCIsXG4gIFwiRG91YmxlUmlnaHRBcnJvd1wiOlwiXFx1MjFEMlwiLFxuICBcIkRvdWJsZVJpZ2h0VGVlXCI6XCJcXHUyMkE4XCIsXG4gIFwiRG91YmxlVXBBcnJvd1wiOlwiXFx1MjFEMVwiLFxuICBcIkRvdWJsZVVwRG93bkFycm93XCI6XCJcXHUyMUQ1XCIsXG4gIFwiRG91YmxlVmVydGljYWxCYXJcIjpcIlxcdTIyMjVcIixcbiAgXCJEb3duQXJyb3dcIjpcIlxcdTIxOTNcIixcbiAgXCJEb3duYXJyb3dcIjpcIlxcdTIxRDNcIixcbiAgXCJkb3duYXJyb3dcIjpcIlxcdTIxOTNcIixcbiAgXCJEb3duQXJyb3dCYXJcIjpcIlxcdTI5MTNcIixcbiAgXCJEb3duQXJyb3dVcEFycm93XCI6XCJcXHUyMUY1XCIsXG4gIFwiRG93bkJyZXZlXCI6XCJcXHUwMzExXCIsXG4gIFwiZG93bmRvd25hcnJvd3NcIjpcIlxcdTIxQ0FcIixcbiAgXCJkb3duaGFycG9vbmxlZnRcIjpcIlxcdTIxQzNcIixcbiAgXCJkb3duaGFycG9vbnJpZ2h0XCI6XCJcXHUyMUMyXCIsXG4gIFwiRG93bkxlZnRSaWdodFZlY3RvclwiOlwiXFx1Mjk1MFwiLFxuICBcIkRvd25MZWZ0VGVlVmVjdG9yXCI6XCJcXHUyOTVFXCIsXG4gIFwiRG93bkxlZnRWZWN0b3JcIjpcIlxcdTIxQkRcIixcbiAgXCJEb3duTGVmdFZlY3RvckJhclwiOlwiXFx1Mjk1NlwiLFxuICBcIkRvd25SaWdodFRlZVZlY3RvclwiOlwiXFx1Mjk1RlwiLFxuICBcIkRvd25SaWdodFZlY3RvclwiOlwiXFx1MjFDMVwiLFxuICBcIkRvd25SaWdodFZlY3RvckJhclwiOlwiXFx1Mjk1N1wiLFxuICBcIkRvd25UZWVcIjpcIlxcdTIyQTRcIixcbiAgXCJEb3duVGVlQXJyb3dcIjpcIlxcdTIxQTdcIixcbiAgXCJkcmJrYXJvd1wiOlwiXFx1MjkxMFwiLFxuICBcImRyY29yblwiOlwiXFx1MjMxRlwiLFxuICBcImRyY3JvcFwiOlwiXFx1MjMwQ1wiLFxuICBcIkRzY3JcIjpcIlxcdUQ4MzVcXHVEQzlGXCIsXG4gIFwiZHNjclwiOlwiXFx1RDgzNVxcdURDQjlcIixcbiAgXCJEU2N5XCI6XCJcXHUwNDA1XCIsXG4gIFwiZHNjeVwiOlwiXFx1MDQ1NVwiLFxuICBcImRzb2xcIjpcIlxcdTI5RjZcIixcbiAgXCJEc3Ryb2tcIjpcIlxcdTAxMTBcIixcbiAgXCJkc3Ryb2tcIjpcIlxcdTAxMTFcIixcbiAgXCJkdGRvdFwiOlwiXFx1MjJGMVwiLFxuICBcImR0cmlcIjpcIlxcdTI1QkZcIixcbiAgXCJkdHJpZlwiOlwiXFx1MjVCRVwiLFxuICBcImR1YXJyXCI6XCJcXHUyMUY1XCIsXG4gIFwiZHVoYXJcIjpcIlxcdTI5NkZcIixcbiAgXCJkd2FuZ2xlXCI6XCJcXHUyOUE2XCIsXG4gIFwiRFpjeVwiOlwiXFx1MDQwRlwiLFxuICBcImR6Y3lcIjpcIlxcdTA0NUZcIixcbiAgXCJkemlncmFyclwiOlwiXFx1MjdGRlwiLFxuICBcIkVhY3V0ZVwiOlwiXFx1MDBDOVwiLFxuICBcImVhY3V0ZVwiOlwiXFx1MDBFOVwiLFxuICBcImVhc3RlclwiOlwiXFx1MkE2RVwiLFxuICBcIkVjYXJvblwiOlwiXFx1MDExQVwiLFxuICBcImVjYXJvblwiOlwiXFx1MDExQlwiLFxuICBcImVjaXJcIjpcIlxcdTIyNTZcIixcbiAgXCJFY2lyY1wiOlwiXFx1MDBDQVwiLFxuICBcImVjaXJjXCI6XCJcXHUwMEVBXCIsXG4gIFwiZWNvbG9uXCI6XCJcXHUyMjU1XCIsXG4gIFwiRWN5XCI6XCJcXHUwNDJEXCIsXG4gIFwiZWN5XCI6XCJcXHUwNDREXCIsXG4gIFwiZUREb3RcIjpcIlxcdTJBNzdcIixcbiAgXCJFZG90XCI6XCJcXHUwMTE2XCIsXG4gIFwiZURvdFwiOlwiXFx1MjI1MVwiLFxuICBcImVkb3RcIjpcIlxcdTAxMTdcIixcbiAgXCJlZVwiOlwiXFx1MjE0N1wiLFxuICBcImVmRG90XCI6XCJcXHUyMjUyXCIsXG4gIFwiRWZyXCI6XCJcXHVEODM1XFx1REQwOFwiLFxuICBcImVmclwiOlwiXFx1RDgzNVxcdUREMjJcIixcbiAgXCJlZ1wiOlwiXFx1MkE5QVwiLFxuICBcIkVncmF2ZVwiOlwiXFx1MDBDOFwiLFxuICBcImVncmF2ZVwiOlwiXFx1MDBFOFwiLFxuICBcImVnc1wiOlwiXFx1MkE5NlwiLFxuICBcImVnc2RvdFwiOlwiXFx1MkE5OFwiLFxuICBcImVsXCI6XCJcXHUyQTk5XCIsXG4gIFwiRWxlbWVudFwiOlwiXFx1MjIwOFwiLFxuICBcImVsaW50ZXJzXCI6XCJcXHUyM0U3XCIsXG4gIFwiZWxsXCI6XCJcXHUyMTEzXCIsXG4gIFwiZWxzXCI6XCJcXHUyQTk1XCIsXG4gIFwiZWxzZG90XCI6XCJcXHUyQTk3XCIsXG4gIFwiRW1hY3JcIjpcIlxcdTAxMTJcIixcbiAgXCJlbWFjclwiOlwiXFx1MDExM1wiLFxuICBcImVtcHR5XCI6XCJcXHUyMjA1XCIsXG4gIFwiZW1wdHlzZXRcIjpcIlxcdTIyMDVcIixcbiAgXCJFbXB0eVNtYWxsU3F1YXJlXCI6XCJcXHUyNUZCXCIsXG4gIFwiZW1wdHl2XCI6XCJcXHUyMjA1XCIsXG4gIFwiRW1wdHlWZXJ5U21hbGxTcXVhcmVcIjpcIlxcdTI1QUJcIixcbiAgXCJlbXNwXCI6XCJcXHUyMDAzXCIsXG4gIFwiZW1zcDEzXCI6XCJcXHUyMDA0XCIsXG4gIFwiZW1zcDE0XCI6XCJcXHUyMDA1XCIsXG4gIFwiRU5HXCI6XCJcXHUwMTRBXCIsXG4gIFwiZW5nXCI6XCJcXHUwMTRCXCIsXG4gIFwiZW5zcFwiOlwiXFx1MjAwMlwiLFxuICBcIkVvZ29uXCI6XCJcXHUwMTE4XCIsXG4gIFwiZW9nb25cIjpcIlxcdTAxMTlcIixcbiAgXCJFb3BmXCI6XCJcXHVEODM1XFx1REQzQ1wiLFxuICBcImVvcGZcIjpcIlxcdUQ4MzVcXHVERDU2XCIsXG4gIFwiZXBhclwiOlwiXFx1MjJENVwiLFxuICBcImVwYXJzbFwiOlwiXFx1MjlFM1wiLFxuICBcImVwbHVzXCI6XCJcXHUyQTcxXCIsXG4gIFwiZXBzaVwiOlwiXFx1MDNCNVwiLFxuICBcIkVwc2lsb25cIjpcIlxcdTAzOTVcIixcbiAgXCJlcHNpbG9uXCI6XCJcXHUwM0I1XCIsXG4gIFwiZXBzaXZcIjpcIlxcdTAzRjVcIixcbiAgXCJlcWNpcmNcIjpcIlxcdTIyNTZcIixcbiAgXCJlcWNvbG9uXCI6XCJcXHUyMjU1XCIsXG4gIFwiZXFzaW1cIjpcIlxcdTIyNDJcIixcbiAgXCJlcXNsYW50Z3RyXCI6XCJcXHUyQTk2XCIsXG4gIFwiZXFzbGFudGxlc3NcIjpcIlxcdTJBOTVcIixcbiAgXCJFcXVhbFwiOlwiXFx1MkE3NVwiLFxuICBcImVxdWFsc1wiOlwiXFx1MDAzRFwiLFxuICBcIkVxdWFsVGlsZGVcIjpcIlxcdTIyNDJcIixcbiAgXCJlcXVlc3RcIjpcIlxcdTIyNUZcIixcbiAgXCJFcXVpbGlicml1bVwiOlwiXFx1MjFDQ1wiLFxuICBcImVxdWl2XCI6XCJcXHUyMjYxXCIsXG4gIFwiZXF1aXZERFwiOlwiXFx1MkE3OFwiLFxuICBcImVxdnBhcnNsXCI6XCJcXHUyOUU1XCIsXG4gIFwiZXJhcnJcIjpcIlxcdTI5NzFcIixcbiAgXCJlckRvdFwiOlwiXFx1MjI1M1wiLFxuICBcIkVzY3JcIjpcIlxcdTIxMzBcIixcbiAgXCJlc2NyXCI6XCJcXHUyMTJGXCIsXG4gIFwiZXNkb3RcIjpcIlxcdTIyNTBcIixcbiAgXCJFc2ltXCI6XCJcXHUyQTczXCIsXG4gIFwiZXNpbVwiOlwiXFx1MjI0MlwiLFxuICBcIkV0YVwiOlwiXFx1MDM5N1wiLFxuICBcImV0YVwiOlwiXFx1MDNCN1wiLFxuICBcIkVUSFwiOlwiXFx1MDBEMFwiLFxuICBcImV0aFwiOlwiXFx1MDBGMFwiLFxuICBcIkV1bWxcIjpcIlxcdTAwQ0JcIixcbiAgXCJldW1sXCI6XCJcXHUwMEVCXCIsXG4gIFwiZXVyb1wiOlwiXFx1MjBBQ1wiLFxuICBcImV4Y2xcIjpcIlxcdTAwMjFcIixcbiAgXCJleGlzdFwiOlwiXFx1MjIwM1wiLFxuICBcIkV4aXN0c1wiOlwiXFx1MjIwM1wiLFxuICBcImV4cGVjdGF0aW9uXCI6XCJcXHUyMTMwXCIsXG4gIFwiRXhwb25lbnRpYWxFXCI6XCJcXHUyMTQ3XCIsXG4gIFwiZXhwb25lbnRpYWxlXCI6XCJcXHUyMTQ3XCIsXG4gIFwiZmFsbGluZ2RvdHNlcVwiOlwiXFx1MjI1MlwiLFxuICBcIkZjeVwiOlwiXFx1MDQyNFwiLFxuICBcImZjeVwiOlwiXFx1MDQ0NFwiLFxuICBcImZlbWFsZVwiOlwiXFx1MjY0MFwiLFxuICBcImZmaWxpZ1wiOlwiXFx1RkIwM1wiLFxuICBcImZmbGlnXCI6XCJcXHVGQjAwXCIsXG4gIFwiZmZsbGlnXCI6XCJcXHVGQjA0XCIsXG4gIFwiRmZyXCI6XCJcXHVEODM1XFx1REQwOVwiLFxuICBcImZmclwiOlwiXFx1RDgzNVxcdUREMjNcIixcbiAgXCJmaWxpZ1wiOlwiXFx1RkIwMVwiLFxuICBcIkZpbGxlZFNtYWxsU3F1YXJlXCI6XCJcXHUyNUZDXCIsXG4gIFwiRmlsbGVkVmVyeVNtYWxsU3F1YXJlXCI6XCJcXHUyNUFBXCIsXG4gIFwiZmpsaWdcIjpcIlxcdTAwNjZcXHUwMDZBXCIsXG4gIFwiZmxhdFwiOlwiXFx1MjY2RFwiLFxuICBcImZsbGlnXCI6XCJcXHVGQjAyXCIsXG4gIFwiZmx0bnNcIjpcIlxcdTI1QjFcIixcbiAgXCJmbm9mXCI6XCJcXHUwMTkyXCIsXG4gIFwiRm9wZlwiOlwiXFx1RDgzNVxcdUREM0RcIixcbiAgXCJmb3BmXCI6XCJcXHVEODM1XFx1REQ1N1wiLFxuICBcIkZvckFsbFwiOlwiXFx1MjIwMFwiLFxuICBcImZvcmFsbFwiOlwiXFx1MjIwMFwiLFxuICBcImZvcmtcIjpcIlxcdTIyRDRcIixcbiAgXCJmb3JrdlwiOlwiXFx1MkFEOVwiLFxuICBcIkZvdXJpZXJ0cmZcIjpcIlxcdTIxMzFcIixcbiAgXCJmcGFydGludFwiOlwiXFx1MkEwRFwiLFxuICBcImZyYWMxMlwiOlwiXFx1MDBCRFwiLFxuICBcImZyYWMxM1wiOlwiXFx1MjE1M1wiLFxuICBcImZyYWMxNFwiOlwiXFx1MDBCQ1wiLFxuICBcImZyYWMxNVwiOlwiXFx1MjE1NVwiLFxuICBcImZyYWMxNlwiOlwiXFx1MjE1OVwiLFxuICBcImZyYWMxOFwiOlwiXFx1MjE1QlwiLFxuICBcImZyYWMyM1wiOlwiXFx1MjE1NFwiLFxuICBcImZyYWMyNVwiOlwiXFx1MjE1NlwiLFxuICBcImZyYWMzNFwiOlwiXFx1MDBCRVwiLFxuICBcImZyYWMzNVwiOlwiXFx1MjE1N1wiLFxuICBcImZyYWMzOFwiOlwiXFx1MjE1Q1wiLFxuICBcImZyYWM0NVwiOlwiXFx1MjE1OFwiLFxuICBcImZyYWM1NlwiOlwiXFx1MjE1QVwiLFxuICBcImZyYWM1OFwiOlwiXFx1MjE1RFwiLFxuICBcImZyYWM3OFwiOlwiXFx1MjE1RVwiLFxuICBcImZyYXNsXCI6XCJcXHUyMDQ0XCIsXG4gIFwiZnJvd25cIjpcIlxcdTIzMjJcIixcbiAgXCJGc2NyXCI6XCJcXHUyMTMxXCIsXG4gIFwiZnNjclwiOlwiXFx1RDgzNVxcdURDQkJcIixcbiAgXCJnYWN1dGVcIjpcIlxcdTAxRjVcIixcbiAgXCJHYW1tYVwiOlwiXFx1MDM5M1wiLFxuICBcImdhbW1hXCI6XCJcXHUwM0IzXCIsXG4gIFwiR2FtbWFkXCI6XCJcXHUwM0RDXCIsXG4gIFwiZ2FtbWFkXCI6XCJcXHUwM0REXCIsXG4gIFwiZ2FwXCI6XCJcXHUyQTg2XCIsXG4gIFwiR2JyZXZlXCI6XCJcXHUwMTFFXCIsXG4gIFwiZ2JyZXZlXCI6XCJcXHUwMTFGXCIsXG4gIFwiR2NlZGlsXCI6XCJcXHUwMTIyXCIsXG4gIFwiR2NpcmNcIjpcIlxcdTAxMUNcIixcbiAgXCJnY2lyY1wiOlwiXFx1MDExRFwiLFxuICBcIkdjeVwiOlwiXFx1MDQxM1wiLFxuICBcImdjeVwiOlwiXFx1MDQzM1wiLFxuICBcIkdkb3RcIjpcIlxcdTAxMjBcIixcbiAgXCJnZG90XCI6XCJcXHUwMTIxXCIsXG4gIFwiZ0VcIjpcIlxcdTIyNjdcIixcbiAgXCJnZVwiOlwiXFx1MjI2NVwiLFxuICBcImdFbFwiOlwiXFx1MkE4Q1wiLFxuICBcImdlbFwiOlwiXFx1MjJEQlwiLFxuICBcImdlcVwiOlwiXFx1MjI2NVwiLFxuICBcImdlcXFcIjpcIlxcdTIyNjdcIixcbiAgXCJnZXFzbGFudFwiOlwiXFx1MkE3RVwiLFxuICBcImdlc1wiOlwiXFx1MkE3RVwiLFxuICBcImdlc2NjXCI6XCJcXHUyQUE5XCIsXG4gIFwiZ2VzZG90XCI6XCJcXHUyQTgwXCIsXG4gIFwiZ2VzZG90b1wiOlwiXFx1MkE4MlwiLFxuICBcImdlc2RvdG9sXCI6XCJcXHUyQTg0XCIsXG4gIFwiZ2VzbFwiOlwiXFx1MjJEQlxcdUZFMDBcIixcbiAgXCJnZXNsZXNcIjpcIlxcdTJBOTRcIixcbiAgXCJHZnJcIjpcIlxcdUQ4MzVcXHVERDBBXCIsXG4gIFwiZ2ZyXCI6XCJcXHVEODM1XFx1REQyNFwiLFxuICBcIkdnXCI6XCJcXHUyMkQ5XCIsXG4gIFwiZ2dcIjpcIlxcdTIyNkJcIixcbiAgXCJnZ2dcIjpcIlxcdTIyRDlcIixcbiAgXCJnaW1lbFwiOlwiXFx1MjEzN1wiLFxuICBcIkdKY3lcIjpcIlxcdTA0MDNcIixcbiAgXCJnamN5XCI6XCJcXHUwNDUzXCIsXG4gIFwiZ2xcIjpcIlxcdTIyNzdcIixcbiAgXCJnbGFcIjpcIlxcdTJBQTVcIixcbiAgXCJnbEVcIjpcIlxcdTJBOTJcIixcbiAgXCJnbGpcIjpcIlxcdTJBQTRcIixcbiAgXCJnbmFwXCI6XCJcXHUyQThBXCIsXG4gIFwiZ25hcHByb3hcIjpcIlxcdTJBOEFcIixcbiAgXCJnbkVcIjpcIlxcdTIyNjlcIixcbiAgXCJnbmVcIjpcIlxcdTJBODhcIixcbiAgXCJnbmVxXCI6XCJcXHUyQTg4XCIsXG4gIFwiZ25lcXFcIjpcIlxcdTIyNjlcIixcbiAgXCJnbnNpbVwiOlwiXFx1MjJFN1wiLFxuICBcIkdvcGZcIjpcIlxcdUQ4MzVcXHVERDNFXCIsXG4gIFwiZ29wZlwiOlwiXFx1RDgzNVxcdURENThcIixcbiAgXCJncmF2ZVwiOlwiXFx1MDA2MFwiLFxuICBcIkdyZWF0ZXJFcXVhbFwiOlwiXFx1MjI2NVwiLFxuICBcIkdyZWF0ZXJFcXVhbExlc3NcIjpcIlxcdTIyREJcIixcbiAgXCJHcmVhdGVyRnVsbEVxdWFsXCI6XCJcXHUyMjY3XCIsXG4gIFwiR3JlYXRlckdyZWF0ZXJcIjpcIlxcdTJBQTJcIixcbiAgXCJHcmVhdGVyTGVzc1wiOlwiXFx1MjI3N1wiLFxuICBcIkdyZWF0ZXJTbGFudEVxdWFsXCI6XCJcXHUyQTdFXCIsXG4gIFwiR3JlYXRlclRpbGRlXCI6XCJcXHUyMjczXCIsXG4gIFwiR3NjclwiOlwiXFx1RDgzNVxcdURDQTJcIixcbiAgXCJnc2NyXCI6XCJcXHUyMTBBXCIsXG4gIFwiZ3NpbVwiOlwiXFx1MjI3M1wiLFxuICBcImdzaW1lXCI6XCJcXHUyQThFXCIsXG4gIFwiZ3NpbWxcIjpcIlxcdTJBOTBcIixcbiAgXCJHVFwiOlwiXFx1MDAzRVwiLFxuICBcIkd0XCI6XCJcXHUyMjZCXCIsXG4gIFwiZ3RcIjpcIlxcdTAwM0VcIixcbiAgXCJndGNjXCI6XCJcXHUyQUE3XCIsXG4gIFwiZ3RjaXJcIjpcIlxcdTJBN0FcIixcbiAgXCJndGRvdFwiOlwiXFx1MjJEN1wiLFxuICBcImd0bFBhclwiOlwiXFx1Mjk5NVwiLFxuICBcImd0cXVlc3RcIjpcIlxcdTJBN0NcIixcbiAgXCJndHJhcHByb3hcIjpcIlxcdTJBODZcIixcbiAgXCJndHJhcnJcIjpcIlxcdTI5NzhcIixcbiAgXCJndHJkb3RcIjpcIlxcdTIyRDdcIixcbiAgXCJndHJlcWxlc3NcIjpcIlxcdTIyREJcIixcbiAgXCJndHJlcXFsZXNzXCI6XCJcXHUyQThDXCIsXG4gIFwiZ3RybGVzc1wiOlwiXFx1MjI3N1wiLFxuICBcImd0cnNpbVwiOlwiXFx1MjI3M1wiLFxuICBcImd2ZXJ0bmVxcVwiOlwiXFx1MjI2OVxcdUZFMDBcIixcbiAgXCJndm5FXCI6XCJcXHUyMjY5XFx1RkUwMFwiLFxuICBcIkhhY2VrXCI6XCJcXHUwMkM3XCIsXG4gIFwiaGFpcnNwXCI6XCJcXHUyMDBBXCIsXG4gIFwiaGFsZlwiOlwiXFx1MDBCRFwiLFxuICBcImhhbWlsdFwiOlwiXFx1MjEwQlwiLFxuICBcIkhBUkRjeVwiOlwiXFx1MDQyQVwiLFxuICBcImhhcmRjeVwiOlwiXFx1MDQ0QVwiLFxuICBcImhBcnJcIjpcIlxcdTIxRDRcIixcbiAgXCJoYXJyXCI6XCJcXHUyMTk0XCIsXG4gIFwiaGFycmNpclwiOlwiXFx1Mjk0OFwiLFxuICBcImhhcnJ3XCI6XCJcXHUyMUFEXCIsXG4gIFwiSGF0XCI6XCJcXHUwMDVFXCIsXG4gIFwiaGJhclwiOlwiXFx1MjEwRlwiLFxuICBcIkhjaXJjXCI6XCJcXHUwMTI0XCIsXG4gIFwiaGNpcmNcIjpcIlxcdTAxMjVcIixcbiAgXCJoZWFydHNcIjpcIlxcdTI2NjVcIixcbiAgXCJoZWFydHN1aXRcIjpcIlxcdTI2NjVcIixcbiAgXCJoZWxsaXBcIjpcIlxcdTIwMjZcIixcbiAgXCJoZXJjb25cIjpcIlxcdTIyQjlcIixcbiAgXCJIZnJcIjpcIlxcdTIxMENcIixcbiAgXCJoZnJcIjpcIlxcdUQ4MzVcXHVERDI1XCIsXG4gIFwiSGlsYmVydFNwYWNlXCI6XCJcXHUyMTBCXCIsXG4gIFwiaGtzZWFyb3dcIjpcIlxcdTI5MjVcIixcbiAgXCJoa3N3YXJvd1wiOlwiXFx1MjkyNlwiLFxuICBcImhvYXJyXCI6XCJcXHUyMUZGXCIsXG4gIFwiaG9tdGh0XCI6XCJcXHUyMjNCXCIsXG4gIFwiaG9va2xlZnRhcnJvd1wiOlwiXFx1MjFBOVwiLFxuICBcImhvb2tyaWdodGFycm93XCI6XCJcXHUyMUFBXCIsXG4gIFwiSG9wZlwiOlwiXFx1MjEwRFwiLFxuICBcImhvcGZcIjpcIlxcdUQ4MzVcXHVERDU5XCIsXG4gIFwiaG9yYmFyXCI6XCJcXHUyMDE1XCIsXG4gIFwiSG9yaXpvbnRhbExpbmVcIjpcIlxcdTI1MDBcIixcbiAgXCJIc2NyXCI6XCJcXHUyMTBCXCIsXG4gIFwiaHNjclwiOlwiXFx1RDgzNVxcdURDQkRcIixcbiAgXCJoc2xhc2hcIjpcIlxcdTIxMEZcIixcbiAgXCJIc3Ryb2tcIjpcIlxcdTAxMjZcIixcbiAgXCJoc3Ryb2tcIjpcIlxcdTAxMjdcIixcbiAgXCJIdW1wRG93bkh1bXBcIjpcIlxcdTIyNEVcIixcbiAgXCJIdW1wRXF1YWxcIjpcIlxcdTIyNEZcIixcbiAgXCJoeWJ1bGxcIjpcIlxcdTIwNDNcIixcbiAgXCJoeXBoZW5cIjpcIlxcdTIwMTBcIixcbiAgXCJJYWN1dGVcIjpcIlxcdTAwQ0RcIixcbiAgXCJpYWN1dGVcIjpcIlxcdTAwRURcIixcbiAgXCJpY1wiOlwiXFx1MjA2M1wiLFxuICBcIkljaXJjXCI6XCJcXHUwMENFXCIsXG4gIFwiaWNpcmNcIjpcIlxcdTAwRUVcIixcbiAgXCJJY3lcIjpcIlxcdTA0MThcIixcbiAgXCJpY3lcIjpcIlxcdTA0MzhcIixcbiAgXCJJZG90XCI6XCJcXHUwMTMwXCIsXG4gIFwiSUVjeVwiOlwiXFx1MDQxNVwiLFxuICBcImllY3lcIjpcIlxcdTA0MzVcIixcbiAgXCJpZXhjbFwiOlwiXFx1MDBBMVwiLFxuICBcImlmZlwiOlwiXFx1MjFENFwiLFxuICBcIklmclwiOlwiXFx1MjExMVwiLFxuICBcImlmclwiOlwiXFx1RDgzNVxcdUREMjZcIixcbiAgXCJJZ3JhdmVcIjpcIlxcdTAwQ0NcIixcbiAgXCJpZ3JhdmVcIjpcIlxcdTAwRUNcIixcbiAgXCJpaVwiOlwiXFx1MjE0OFwiLFxuICBcImlpaWludFwiOlwiXFx1MkEwQ1wiLFxuICBcImlpaW50XCI6XCJcXHUyMjJEXCIsXG4gIFwiaWluZmluXCI6XCJcXHUyOURDXCIsXG4gIFwiaWlvdGFcIjpcIlxcdTIxMjlcIixcbiAgXCJJSmxpZ1wiOlwiXFx1MDEzMlwiLFxuICBcImlqbGlnXCI6XCJcXHUwMTMzXCIsXG4gIFwiSW1cIjpcIlxcdTIxMTFcIixcbiAgXCJJbWFjclwiOlwiXFx1MDEyQVwiLFxuICBcImltYWNyXCI6XCJcXHUwMTJCXCIsXG4gIFwiaW1hZ2VcIjpcIlxcdTIxMTFcIixcbiAgXCJJbWFnaW5hcnlJXCI6XCJcXHUyMTQ4XCIsXG4gIFwiaW1hZ2xpbmVcIjpcIlxcdTIxMTBcIixcbiAgXCJpbWFncGFydFwiOlwiXFx1MjExMVwiLFxuICBcImltYXRoXCI6XCJcXHUwMTMxXCIsXG4gIFwiaW1vZlwiOlwiXFx1MjJCN1wiLFxuICBcImltcGVkXCI6XCJcXHUwMUI1XCIsXG4gIFwiSW1wbGllc1wiOlwiXFx1MjFEMlwiLFxuICBcImluXCI6XCJcXHUyMjA4XCIsXG4gIFwiaW5jYXJlXCI6XCJcXHUyMTA1XCIsXG4gIFwiaW5maW5cIjpcIlxcdTIyMUVcIixcbiAgXCJpbmZpbnRpZVwiOlwiXFx1MjlERFwiLFxuICBcImlub2RvdFwiOlwiXFx1MDEzMVwiLFxuICBcIkludFwiOlwiXFx1MjIyQ1wiLFxuICBcImludFwiOlwiXFx1MjIyQlwiLFxuICBcImludGNhbFwiOlwiXFx1MjJCQVwiLFxuICBcImludGVnZXJzXCI6XCJcXHUyMTI0XCIsXG4gIFwiSW50ZWdyYWxcIjpcIlxcdTIyMkJcIixcbiAgXCJpbnRlcmNhbFwiOlwiXFx1MjJCQVwiLFxuICBcIkludGVyc2VjdGlvblwiOlwiXFx1MjJDMlwiLFxuICBcImludGxhcmhrXCI6XCJcXHUyQTE3XCIsXG4gIFwiaW50cHJvZFwiOlwiXFx1MkEzQ1wiLFxuICBcIkludmlzaWJsZUNvbW1hXCI6XCJcXHUyMDYzXCIsXG4gIFwiSW52aXNpYmxlVGltZXNcIjpcIlxcdTIwNjJcIixcbiAgXCJJT2N5XCI6XCJcXHUwNDAxXCIsXG4gIFwiaW9jeVwiOlwiXFx1MDQ1MVwiLFxuICBcIklvZ29uXCI6XCJcXHUwMTJFXCIsXG4gIFwiaW9nb25cIjpcIlxcdTAxMkZcIixcbiAgXCJJb3BmXCI6XCJcXHVEODM1XFx1REQ0MFwiLFxuICBcImlvcGZcIjpcIlxcdUQ4MzVcXHVERDVBXCIsXG4gIFwiSW90YVwiOlwiXFx1MDM5OVwiLFxuICBcImlvdGFcIjpcIlxcdTAzQjlcIixcbiAgXCJpcHJvZFwiOlwiXFx1MkEzQ1wiLFxuICBcImlxdWVzdFwiOlwiXFx1MDBCRlwiLFxuICBcIklzY3JcIjpcIlxcdTIxMTBcIixcbiAgXCJpc2NyXCI6XCJcXHVEODM1XFx1RENCRVwiLFxuICBcImlzaW5cIjpcIlxcdTIyMDhcIixcbiAgXCJpc2luZG90XCI6XCJcXHUyMkY1XCIsXG4gIFwiaXNpbkVcIjpcIlxcdTIyRjlcIixcbiAgXCJpc2luc1wiOlwiXFx1MjJGNFwiLFxuICBcImlzaW5zdlwiOlwiXFx1MjJGM1wiLFxuICBcImlzaW52XCI6XCJcXHUyMjA4XCIsXG4gIFwiaXRcIjpcIlxcdTIwNjJcIixcbiAgXCJJdGlsZGVcIjpcIlxcdTAxMjhcIixcbiAgXCJpdGlsZGVcIjpcIlxcdTAxMjlcIixcbiAgXCJJdWtjeVwiOlwiXFx1MDQwNlwiLFxuICBcIml1a2N5XCI6XCJcXHUwNDU2XCIsXG4gIFwiSXVtbFwiOlwiXFx1MDBDRlwiLFxuICBcIml1bWxcIjpcIlxcdTAwRUZcIixcbiAgXCJKY2lyY1wiOlwiXFx1MDEzNFwiLFxuICBcImpjaXJjXCI6XCJcXHUwMTM1XCIsXG4gIFwiSmN5XCI6XCJcXHUwNDE5XCIsXG4gIFwiamN5XCI6XCJcXHUwNDM5XCIsXG4gIFwiSmZyXCI6XCJcXHVEODM1XFx1REQwRFwiLFxuICBcImpmclwiOlwiXFx1RDgzNVxcdUREMjdcIixcbiAgXCJqbWF0aFwiOlwiXFx1MDIzN1wiLFxuICBcIkpvcGZcIjpcIlxcdUQ4MzVcXHVERDQxXCIsXG4gIFwiam9wZlwiOlwiXFx1RDgzNVxcdURENUJcIixcbiAgXCJKc2NyXCI6XCJcXHVEODM1XFx1RENBNVwiLFxuICBcImpzY3JcIjpcIlxcdUQ4MzVcXHVEQ0JGXCIsXG4gIFwiSnNlcmN5XCI6XCJcXHUwNDA4XCIsXG4gIFwianNlcmN5XCI6XCJcXHUwNDU4XCIsXG4gIFwiSnVrY3lcIjpcIlxcdTA0MDRcIixcbiAgXCJqdWtjeVwiOlwiXFx1MDQ1NFwiLFxuICBcIkthcHBhXCI6XCJcXHUwMzlBXCIsXG4gIFwia2FwcGFcIjpcIlxcdTAzQkFcIixcbiAgXCJrYXBwYXZcIjpcIlxcdTAzRjBcIixcbiAgXCJLY2VkaWxcIjpcIlxcdTAxMzZcIixcbiAgXCJrY2VkaWxcIjpcIlxcdTAxMzdcIixcbiAgXCJLY3lcIjpcIlxcdTA0MUFcIixcbiAgXCJrY3lcIjpcIlxcdTA0M0FcIixcbiAgXCJLZnJcIjpcIlxcdUQ4MzVcXHVERDBFXCIsXG4gIFwia2ZyXCI6XCJcXHVEODM1XFx1REQyOFwiLFxuICBcImtncmVlblwiOlwiXFx1MDEzOFwiLFxuICBcIktIY3lcIjpcIlxcdTA0MjVcIixcbiAgXCJraGN5XCI6XCJcXHUwNDQ1XCIsXG4gIFwiS0pjeVwiOlwiXFx1MDQwQ1wiLFxuICBcImtqY3lcIjpcIlxcdTA0NUNcIixcbiAgXCJLb3BmXCI6XCJcXHVEODM1XFx1REQ0MlwiLFxuICBcImtvcGZcIjpcIlxcdUQ4MzVcXHVERDVDXCIsXG4gIFwiS3NjclwiOlwiXFx1RDgzNVxcdURDQTZcIixcbiAgXCJrc2NyXCI6XCJcXHVEODM1XFx1RENDMFwiLFxuICBcImxBYXJyXCI6XCJcXHUyMURBXCIsXG4gIFwiTGFjdXRlXCI6XCJcXHUwMTM5XCIsXG4gIFwibGFjdXRlXCI6XCJcXHUwMTNBXCIsXG4gIFwibGFlbXB0eXZcIjpcIlxcdTI5QjRcIixcbiAgXCJsYWdyYW5cIjpcIlxcdTIxMTJcIixcbiAgXCJMYW1iZGFcIjpcIlxcdTAzOUJcIixcbiAgXCJsYW1iZGFcIjpcIlxcdTAzQkJcIixcbiAgXCJMYW5nXCI6XCJcXHUyN0VBXCIsXG4gIFwibGFuZ1wiOlwiXFx1MjdFOFwiLFxuICBcImxhbmdkXCI6XCJcXHUyOTkxXCIsXG4gIFwibGFuZ2xlXCI6XCJcXHUyN0U4XCIsXG4gIFwibGFwXCI6XCJcXHUyQTg1XCIsXG4gIFwiTGFwbGFjZXRyZlwiOlwiXFx1MjExMlwiLFxuICBcImxhcXVvXCI6XCJcXHUwMEFCXCIsXG4gIFwiTGFyclwiOlwiXFx1MjE5RVwiLFxuICBcImxBcnJcIjpcIlxcdTIxRDBcIixcbiAgXCJsYXJyXCI6XCJcXHUyMTkwXCIsXG4gIFwibGFycmJcIjpcIlxcdTIxRTRcIixcbiAgXCJsYXJyYmZzXCI6XCJcXHUyOTFGXCIsXG4gIFwibGFycmZzXCI6XCJcXHUyOTFEXCIsXG4gIFwibGFycmhrXCI6XCJcXHUyMUE5XCIsXG4gIFwibGFycmxwXCI6XCJcXHUyMUFCXCIsXG4gIFwibGFycnBsXCI6XCJcXHUyOTM5XCIsXG4gIFwibGFycnNpbVwiOlwiXFx1Mjk3M1wiLFxuICBcImxhcnJ0bFwiOlwiXFx1MjFBMlwiLFxuICBcImxhdFwiOlwiXFx1MkFBQlwiLFxuICBcImxBdGFpbFwiOlwiXFx1MjkxQlwiLFxuICBcImxhdGFpbFwiOlwiXFx1MjkxOVwiLFxuICBcImxhdGVcIjpcIlxcdTJBQURcIixcbiAgXCJsYXRlc1wiOlwiXFx1MkFBRFxcdUZFMDBcIixcbiAgXCJsQmFyclwiOlwiXFx1MjkwRVwiLFxuICBcImxiYXJyXCI6XCJcXHUyOTBDXCIsXG4gIFwibGJicmtcIjpcIlxcdTI3NzJcIixcbiAgXCJsYnJhY2VcIjpcIlxcdTAwN0JcIixcbiAgXCJsYnJhY2tcIjpcIlxcdTAwNUJcIixcbiAgXCJsYnJrZVwiOlwiXFx1Mjk4QlwiLFxuICBcImxicmtzbGRcIjpcIlxcdTI5OEZcIixcbiAgXCJsYnJrc2x1XCI6XCJcXHUyOThEXCIsXG4gIFwiTGNhcm9uXCI6XCJcXHUwMTNEXCIsXG4gIFwibGNhcm9uXCI6XCJcXHUwMTNFXCIsXG4gIFwiTGNlZGlsXCI6XCJcXHUwMTNCXCIsXG4gIFwibGNlZGlsXCI6XCJcXHUwMTNDXCIsXG4gIFwibGNlaWxcIjpcIlxcdTIzMDhcIixcbiAgXCJsY3ViXCI6XCJcXHUwMDdCXCIsXG4gIFwiTGN5XCI6XCJcXHUwNDFCXCIsXG4gIFwibGN5XCI6XCJcXHUwNDNCXCIsXG4gIFwibGRjYVwiOlwiXFx1MjkzNlwiLFxuICBcImxkcXVvXCI6XCJcXHUyMDFDXCIsXG4gIFwibGRxdW9yXCI6XCJcXHUyMDFFXCIsXG4gIFwibGRyZGhhclwiOlwiXFx1Mjk2N1wiLFxuICBcImxkcnVzaGFyXCI6XCJcXHUyOTRCXCIsXG4gIFwibGRzaFwiOlwiXFx1MjFCMlwiLFxuICBcImxFXCI6XCJcXHUyMjY2XCIsXG4gIFwibGVcIjpcIlxcdTIyNjRcIixcbiAgXCJMZWZ0QW5nbGVCcmFja2V0XCI6XCJcXHUyN0U4XCIsXG4gIFwiTGVmdEFycm93XCI6XCJcXHUyMTkwXCIsXG4gIFwiTGVmdGFycm93XCI6XCJcXHUyMUQwXCIsXG4gIFwibGVmdGFycm93XCI6XCJcXHUyMTkwXCIsXG4gIFwiTGVmdEFycm93QmFyXCI6XCJcXHUyMUU0XCIsXG4gIFwiTGVmdEFycm93UmlnaHRBcnJvd1wiOlwiXFx1MjFDNlwiLFxuICBcImxlZnRhcnJvd3RhaWxcIjpcIlxcdTIxQTJcIixcbiAgXCJMZWZ0Q2VpbGluZ1wiOlwiXFx1MjMwOFwiLFxuICBcIkxlZnREb3VibGVCcmFja2V0XCI6XCJcXHUyN0U2XCIsXG4gIFwiTGVmdERvd25UZWVWZWN0b3JcIjpcIlxcdTI5NjFcIixcbiAgXCJMZWZ0RG93blZlY3RvclwiOlwiXFx1MjFDM1wiLFxuICBcIkxlZnREb3duVmVjdG9yQmFyXCI6XCJcXHUyOTU5XCIsXG4gIFwiTGVmdEZsb29yXCI6XCJcXHUyMzBBXCIsXG4gIFwibGVmdGhhcnBvb25kb3duXCI6XCJcXHUyMUJEXCIsXG4gIFwibGVmdGhhcnBvb251cFwiOlwiXFx1MjFCQ1wiLFxuICBcImxlZnRsZWZ0YXJyb3dzXCI6XCJcXHUyMUM3XCIsXG4gIFwiTGVmdFJpZ2h0QXJyb3dcIjpcIlxcdTIxOTRcIixcbiAgXCJMZWZ0cmlnaHRhcnJvd1wiOlwiXFx1MjFENFwiLFxuICBcImxlZnRyaWdodGFycm93XCI6XCJcXHUyMTk0XCIsXG4gIFwibGVmdHJpZ2h0YXJyb3dzXCI6XCJcXHUyMUM2XCIsXG4gIFwibGVmdHJpZ2h0aGFycG9vbnNcIjpcIlxcdTIxQ0JcIixcbiAgXCJsZWZ0cmlnaHRzcXVpZ2Fycm93XCI6XCJcXHUyMUFEXCIsXG4gIFwiTGVmdFJpZ2h0VmVjdG9yXCI6XCJcXHUyOTRFXCIsXG4gIFwiTGVmdFRlZVwiOlwiXFx1MjJBM1wiLFxuICBcIkxlZnRUZWVBcnJvd1wiOlwiXFx1MjFBNFwiLFxuICBcIkxlZnRUZWVWZWN0b3JcIjpcIlxcdTI5NUFcIixcbiAgXCJsZWZ0dGhyZWV0aW1lc1wiOlwiXFx1MjJDQlwiLFxuICBcIkxlZnRUcmlhbmdsZVwiOlwiXFx1MjJCMlwiLFxuICBcIkxlZnRUcmlhbmdsZUJhclwiOlwiXFx1MjlDRlwiLFxuICBcIkxlZnRUcmlhbmdsZUVxdWFsXCI6XCJcXHUyMkI0XCIsXG4gIFwiTGVmdFVwRG93blZlY3RvclwiOlwiXFx1Mjk1MVwiLFxuICBcIkxlZnRVcFRlZVZlY3RvclwiOlwiXFx1Mjk2MFwiLFxuICBcIkxlZnRVcFZlY3RvclwiOlwiXFx1MjFCRlwiLFxuICBcIkxlZnRVcFZlY3RvckJhclwiOlwiXFx1Mjk1OFwiLFxuICBcIkxlZnRWZWN0b3JcIjpcIlxcdTIxQkNcIixcbiAgXCJMZWZ0VmVjdG9yQmFyXCI6XCJcXHUyOTUyXCIsXG4gIFwibEVnXCI6XCJcXHUyQThCXCIsXG4gIFwibGVnXCI6XCJcXHUyMkRBXCIsXG4gIFwibGVxXCI6XCJcXHUyMjY0XCIsXG4gIFwibGVxcVwiOlwiXFx1MjI2NlwiLFxuICBcImxlcXNsYW50XCI6XCJcXHUyQTdEXCIsXG4gIFwibGVzXCI6XCJcXHUyQTdEXCIsXG4gIFwibGVzY2NcIjpcIlxcdTJBQThcIixcbiAgXCJsZXNkb3RcIjpcIlxcdTJBN0ZcIixcbiAgXCJsZXNkb3RvXCI6XCJcXHUyQTgxXCIsXG4gIFwibGVzZG90b3JcIjpcIlxcdTJBODNcIixcbiAgXCJsZXNnXCI6XCJcXHUyMkRBXFx1RkUwMFwiLFxuICBcImxlc2dlc1wiOlwiXFx1MkE5M1wiLFxuICBcImxlc3NhcHByb3hcIjpcIlxcdTJBODVcIixcbiAgXCJsZXNzZG90XCI6XCJcXHUyMkQ2XCIsXG4gIFwibGVzc2VxZ3RyXCI6XCJcXHUyMkRBXCIsXG4gIFwibGVzc2VxcWd0clwiOlwiXFx1MkE4QlwiLFxuICBcIkxlc3NFcXVhbEdyZWF0ZXJcIjpcIlxcdTIyREFcIixcbiAgXCJMZXNzRnVsbEVxdWFsXCI6XCJcXHUyMjY2XCIsXG4gIFwiTGVzc0dyZWF0ZXJcIjpcIlxcdTIyNzZcIixcbiAgXCJsZXNzZ3RyXCI6XCJcXHUyMjc2XCIsXG4gIFwiTGVzc0xlc3NcIjpcIlxcdTJBQTFcIixcbiAgXCJsZXNzc2ltXCI6XCJcXHUyMjcyXCIsXG4gIFwiTGVzc1NsYW50RXF1YWxcIjpcIlxcdTJBN0RcIixcbiAgXCJMZXNzVGlsZGVcIjpcIlxcdTIyNzJcIixcbiAgXCJsZmlzaHRcIjpcIlxcdTI5N0NcIixcbiAgXCJsZmxvb3JcIjpcIlxcdTIzMEFcIixcbiAgXCJMZnJcIjpcIlxcdUQ4MzVcXHVERDBGXCIsXG4gIFwibGZyXCI6XCJcXHVEODM1XFx1REQyOVwiLFxuICBcImxnXCI6XCJcXHUyMjc2XCIsXG4gIFwibGdFXCI6XCJcXHUyQTkxXCIsXG4gIFwibEhhclwiOlwiXFx1Mjk2MlwiLFxuICBcImxoYXJkXCI6XCJcXHUyMUJEXCIsXG4gIFwibGhhcnVcIjpcIlxcdTIxQkNcIixcbiAgXCJsaGFydWxcIjpcIlxcdTI5NkFcIixcbiAgXCJsaGJsa1wiOlwiXFx1MjU4NFwiLFxuICBcIkxKY3lcIjpcIlxcdTA0MDlcIixcbiAgXCJsamN5XCI6XCJcXHUwNDU5XCIsXG4gIFwiTGxcIjpcIlxcdTIyRDhcIixcbiAgXCJsbFwiOlwiXFx1MjI2QVwiLFxuICBcImxsYXJyXCI6XCJcXHUyMUM3XCIsXG4gIFwibGxjb3JuZXJcIjpcIlxcdTIzMUVcIixcbiAgXCJMbGVmdGFycm93XCI6XCJcXHUyMURBXCIsXG4gIFwibGxoYXJkXCI6XCJcXHUyOTZCXCIsXG4gIFwibGx0cmlcIjpcIlxcdTI1RkFcIixcbiAgXCJMbWlkb3RcIjpcIlxcdTAxM0ZcIixcbiAgXCJsbWlkb3RcIjpcIlxcdTAxNDBcIixcbiAgXCJsbW91c3RcIjpcIlxcdTIzQjBcIixcbiAgXCJsbW91c3RhY2hlXCI6XCJcXHUyM0IwXCIsXG4gIFwibG5hcFwiOlwiXFx1MkE4OVwiLFxuICBcImxuYXBwcm94XCI6XCJcXHUyQTg5XCIsXG4gIFwibG5FXCI6XCJcXHUyMjY4XCIsXG4gIFwibG5lXCI6XCJcXHUyQTg3XCIsXG4gIFwibG5lcVwiOlwiXFx1MkE4N1wiLFxuICBcImxuZXFxXCI6XCJcXHUyMjY4XCIsXG4gIFwibG5zaW1cIjpcIlxcdTIyRTZcIixcbiAgXCJsb2FuZ1wiOlwiXFx1MjdFQ1wiLFxuICBcImxvYXJyXCI6XCJcXHUyMUZEXCIsXG4gIFwibG9icmtcIjpcIlxcdTI3RTZcIixcbiAgXCJMb25nTGVmdEFycm93XCI6XCJcXHUyN0Y1XCIsXG4gIFwiTG9uZ2xlZnRhcnJvd1wiOlwiXFx1MjdGOFwiLFxuICBcImxvbmdsZWZ0YXJyb3dcIjpcIlxcdTI3RjVcIixcbiAgXCJMb25nTGVmdFJpZ2h0QXJyb3dcIjpcIlxcdTI3RjdcIixcbiAgXCJMb25nbGVmdHJpZ2h0YXJyb3dcIjpcIlxcdTI3RkFcIixcbiAgXCJsb25nbGVmdHJpZ2h0YXJyb3dcIjpcIlxcdTI3RjdcIixcbiAgXCJsb25nbWFwc3RvXCI6XCJcXHUyN0ZDXCIsXG4gIFwiTG9uZ1JpZ2h0QXJyb3dcIjpcIlxcdTI3RjZcIixcbiAgXCJMb25ncmlnaHRhcnJvd1wiOlwiXFx1MjdGOVwiLFxuICBcImxvbmdyaWdodGFycm93XCI6XCJcXHUyN0Y2XCIsXG4gIFwibG9vcGFycm93bGVmdFwiOlwiXFx1MjFBQlwiLFxuICBcImxvb3BhcnJvd3JpZ2h0XCI6XCJcXHUyMUFDXCIsXG4gIFwibG9wYXJcIjpcIlxcdTI5ODVcIixcbiAgXCJMb3BmXCI6XCJcXHVEODM1XFx1REQ0M1wiLFxuICBcImxvcGZcIjpcIlxcdUQ4MzVcXHVERDVEXCIsXG4gIFwibG9wbHVzXCI6XCJcXHUyQTJEXCIsXG4gIFwibG90aW1lc1wiOlwiXFx1MkEzNFwiLFxuICBcImxvd2FzdFwiOlwiXFx1MjIxN1wiLFxuICBcImxvd2JhclwiOlwiXFx1MDA1RlwiLFxuICBcIkxvd2VyTGVmdEFycm93XCI6XCJcXHUyMTk5XCIsXG4gIFwiTG93ZXJSaWdodEFycm93XCI6XCJcXHUyMTk4XCIsXG4gIFwibG96XCI6XCJcXHUyNUNBXCIsXG4gIFwibG96ZW5nZVwiOlwiXFx1MjVDQVwiLFxuICBcImxvemZcIjpcIlxcdTI5RUJcIixcbiAgXCJscGFyXCI6XCJcXHUwMDI4XCIsXG4gIFwibHBhcmx0XCI6XCJcXHUyOTkzXCIsXG4gIFwibHJhcnJcIjpcIlxcdTIxQzZcIixcbiAgXCJscmNvcm5lclwiOlwiXFx1MjMxRlwiLFxuICBcImxyaGFyXCI6XCJcXHUyMUNCXCIsXG4gIFwibHJoYXJkXCI6XCJcXHUyOTZEXCIsXG4gIFwibHJtXCI6XCJcXHUyMDBFXCIsXG4gIFwibHJ0cmlcIjpcIlxcdTIyQkZcIixcbiAgXCJsc2FxdW9cIjpcIlxcdTIwMzlcIixcbiAgXCJMc2NyXCI6XCJcXHUyMTEyXCIsXG4gIFwibHNjclwiOlwiXFx1RDgzNVxcdURDQzFcIixcbiAgXCJMc2hcIjpcIlxcdTIxQjBcIixcbiAgXCJsc2hcIjpcIlxcdTIxQjBcIixcbiAgXCJsc2ltXCI6XCJcXHUyMjcyXCIsXG4gIFwibHNpbWVcIjpcIlxcdTJBOERcIixcbiAgXCJsc2ltZ1wiOlwiXFx1MkE4RlwiLFxuICBcImxzcWJcIjpcIlxcdTAwNUJcIixcbiAgXCJsc3F1b1wiOlwiXFx1MjAxOFwiLFxuICBcImxzcXVvclwiOlwiXFx1MjAxQVwiLFxuICBcIkxzdHJva1wiOlwiXFx1MDE0MVwiLFxuICBcImxzdHJva1wiOlwiXFx1MDE0MlwiLFxuICBcIkxUXCI6XCJcXHUwMDNDXCIsXG4gIFwiTHRcIjpcIlxcdTIyNkFcIixcbiAgXCJsdFwiOlwiXFx1MDAzQ1wiLFxuICBcImx0Y2NcIjpcIlxcdTJBQTZcIixcbiAgXCJsdGNpclwiOlwiXFx1MkE3OVwiLFxuICBcImx0ZG90XCI6XCJcXHUyMkQ2XCIsXG4gIFwibHRocmVlXCI6XCJcXHUyMkNCXCIsXG4gIFwibHRpbWVzXCI6XCJcXHUyMkM5XCIsXG4gIFwibHRsYXJyXCI6XCJcXHUyOTc2XCIsXG4gIFwibHRxdWVzdFwiOlwiXFx1MkE3QlwiLFxuICBcImx0cmlcIjpcIlxcdTI1QzNcIixcbiAgXCJsdHJpZVwiOlwiXFx1MjJCNFwiLFxuICBcImx0cmlmXCI6XCJcXHUyNUMyXCIsXG4gIFwibHRyUGFyXCI6XCJcXHUyOTk2XCIsXG4gIFwibHVyZHNoYXJcIjpcIlxcdTI5NEFcIixcbiAgXCJsdXJ1aGFyXCI6XCJcXHUyOTY2XCIsXG4gIFwibHZlcnRuZXFxXCI6XCJcXHUyMjY4XFx1RkUwMFwiLFxuICBcImx2bkVcIjpcIlxcdTIyNjhcXHVGRTAwXCIsXG4gIFwibWFjclwiOlwiXFx1MDBBRlwiLFxuICBcIm1hbGVcIjpcIlxcdTI2NDJcIixcbiAgXCJtYWx0XCI6XCJcXHUyNzIwXCIsXG4gIFwibWFsdGVzZVwiOlwiXFx1MjcyMFwiLFxuICBcIk1hcFwiOlwiXFx1MjkwNVwiLFxuICBcIm1hcFwiOlwiXFx1MjFBNlwiLFxuICBcIm1hcHN0b1wiOlwiXFx1MjFBNlwiLFxuICBcIm1hcHN0b2Rvd25cIjpcIlxcdTIxQTdcIixcbiAgXCJtYXBzdG9sZWZ0XCI6XCJcXHUyMUE0XCIsXG4gIFwibWFwc3RvdXBcIjpcIlxcdTIxQTVcIixcbiAgXCJtYXJrZXJcIjpcIlxcdTI1QUVcIixcbiAgXCJtY29tbWFcIjpcIlxcdTJBMjlcIixcbiAgXCJNY3lcIjpcIlxcdTA0MUNcIixcbiAgXCJtY3lcIjpcIlxcdTA0M0NcIixcbiAgXCJtZGFzaFwiOlwiXFx1MjAxNFwiLFxuICBcIm1ERG90XCI6XCJcXHUyMjNBXCIsXG4gIFwibWVhc3VyZWRhbmdsZVwiOlwiXFx1MjIyMVwiLFxuICBcIk1lZGl1bVNwYWNlXCI6XCJcXHUyMDVGXCIsXG4gIFwiTWVsbGludHJmXCI6XCJcXHUyMTMzXCIsXG4gIFwiTWZyXCI6XCJcXHVEODM1XFx1REQxMFwiLFxuICBcIm1mclwiOlwiXFx1RDgzNVxcdUREMkFcIixcbiAgXCJtaG9cIjpcIlxcdTIxMjdcIixcbiAgXCJtaWNyb1wiOlwiXFx1MDBCNVwiLFxuICBcIm1pZFwiOlwiXFx1MjIyM1wiLFxuICBcIm1pZGFzdFwiOlwiXFx1MDAyQVwiLFxuICBcIm1pZGNpclwiOlwiXFx1MkFGMFwiLFxuICBcIm1pZGRvdFwiOlwiXFx1MDBCN1wiLFxuICBcIm1pbnVzXCI6XCJcXHUyMjEyXCIsXG4gIFwibWludXNiXCI6XCJcXHUyMjlGXCIsXG4gIFwibWludXNkXCI6XCJcXHUyMjM4XCIsXG4gIFwibWludXNkdVwiOlwiXFx1MkEyQVwiLFxuICBcIk1pbnVzUGx1c1wiOlwiXFx1MjIxM1wiLFxuICBcIm1sY3BcIjpcIlxcdTJBREJcIixcbiAgXCJtbGRyXCI6XCJcXHUyMDI2XCIsXG4gIFwibW5wbHVzXCI6XCJcXHUyMjEzXCIsXG4gIFwibW9kZWxzXCI6XCJcXHUyMkE3XCIsXG4gIFwiTW9wZlwiOlwiXFx1RDgzNVxcdURENDRcIixcbiAgXCJtb3BmXCI6XCJcXHVEODM1XFx1REQ1RVwiLFxuICBcIm1wXCI6XCJcXHUyMjEzXCIsXG4gIFwiTXNjclwiOlwiXFx1MjEzM1wiLFxuICBcIm1zY3JcIjpcIlxcdUQ4MzVcXHVEQ0MyXCIsXG4gIFwibXN0cG9zXCI6XCJcXHUyMjNFXCIsXG4gIFwiTXVcIjpcIlxcdTAzOUNcIixcbiAgXCJtdVwiOlwiXFx1MDNCQ1wiLFxuICBcIm11bHRpbWFwXCI6XCJcXHUyMkI4XCIsXG4gIFwibXVtYXBcIjpcIlxcdTIyQjhcIixcbiAgXCJuYWJsYVwiOlwiXFx1MjIwN1wiLFxuICBcIk5hY3V0ZVwiOlwiXFx1MDE0M1wiLFxuICBcIm5hY3V0ZVwiOlwiXFx1MDE0NFwiLFxuICBcIm5hbmdcIjpcIlxcdTIyMjBcXHUyMEQyXCIsXG4gIFwibmFwXCI6XCJcXHUyMjQ5XCIsXG4gIFwibmFwRVwiOlwiXFx1MkE3MFxcdTAzMzhcIixcbiAgXCJuYXBpZFwiOlwiXFx1MjI0QlxcdTAzMzhcIixcbiAgXCJuYXBvc1wiOlwiXFx1MDE0OVwiLFxuICBcIm5hcHByb3hcIjpcIlxcdTIyNDlcIixcbiAgXCJuYXR1clwiOlwiXFx1MjY2RVwiLFxuICBcIm5hdHVyYWxcIjpcIlxcdTI2NkVcIixcbiAgXCJuYXR1cmFsc1wiOlwiXFx1MjExNVwiLFxuICBcIm5ic3BcIjpcIlxcdTAwQTBcIixcbiAgXCJuYnVtcFwiOlwiXFx1MjI0RVxcdTAzMzhcIixcbiAgXCJuYnVtcGVcIjpcIlxcdTIyNEZcXHUwMzM4XCIsXG4gIFwibmNhcFwiOlwiXFx1MkE0M1wiLFxuICBcIk5jYXJvblwiOlwiXFx1MDE0N1wiLFxuICBcIm5jYXJvblwiOlwiXFx1MDE0OFwiLFxuICBcIk5jZWRpbFwiOlwiXFx1MDE0NVwiLFxuICBcIm5jZWRpbFwiOlwiXFx1MDE0NlwiLFxuICBcIm5jb25nXCI6XCJcXHUyMjQ3XCIsXG4gIFwibmNvbmdkb3RcIjpcIlxcdTJBNkRcXHUwMzM4XCIsXG4gIFwibmN1cFwiOlwiXFx1MkE0MlwiLFxuICBcIk5jeVwiOlwiXFx1MDQxRFwiLFxuICBcIm5jeVwiOlwiXFx1MDQzRFwiLFxuICBcIm5kYXNoXCI6XCJcXHUyMDEzXCIsXG4gIFwibmVcIjpcIlxcdTIyNjBcIixcbiAgXCJuZWFyaGtcIjpcIlxcdTI5MjRcIixcbiAgXCJuZUFyclwiOlwiXFx1MjFEN1wiLFxuICBcIm5lYXJyXCI6XCJcXHUyMTk3XCIsXG4gIFwibmVhcnJvd1wiOlwiXFx1MjE5N1wiLFxuICBcIm5lZG90XCI6XCJcXHUyMjUwXFx1MDMzOFwiLFxuICBcIk5lZ2F0aXZlTWVkaXVtU3BhY2VcIjpcIlxcdTIwMEJcIixcbiAgXCJOZWdhdGl2ZVRoaWNrU3BhY2VcIjpcIlxcdTIwMEJcIixcbiAgXCJOZWdhdGl2ZVRoaW5TcGFjZVwiOlwiXFx1MjAwQlwiLFxuICBcIk5lZ2F0aXZlVmVyeVRoaW5TcGFjZVwiOlwiXFx1MjAwQlwiLFxuICBcIm5lcXVpdlwiOlwiXFx1MjI2MlwiLFxuICBcIm5lc2VhclwiOlwiXFx1MjkyOFwiLFxuICBcIm5lc2ltXCI6XCJcXHUyMjQyXFx1MDMzOFwiLFxuICBcIk5lc3RlZEdyZWF0ZXJHcmVhdGVyXCI6XCJcXHUyMjZCXCIsXG4gIFwiTmVzdGVkTGVzc0xlc3NcIjpcIlxcdTIyNkFcIixcbiAgXCJOZXdMaW5lXCI6XCJcXHUwMDBBXCIsXG4gIFwibmV4aXN0XCI6XCJcXHUyMjA0XCIsXG4gIFwibmV4aXN0c1wiOlwiXFx1MjIwNFwiLFxuICBcIk5mclwiOlwiXFx1RDgzNVxcdUREMTFcIixcbiAgXCJuZnJcIjpcIlxcdUQ4MzVcXHVERDJCXCIsXG4gIFwibmdFXCI6XCJcXHUyMjY3XFx1MDMzOFwiLFxuICBcIm5nZVwiOlwiXFx1MjI3MVwiLFxuICBcIm5nZXFcIjpcIlxcdTIyNzFcIixcbiAgXCJuZ2VxcVwiOlwiXFx1MjI2N1xcdTAzMzhcIixcbiAgXCJuZ2Vxc2xhbnRcIjpcIlxcdTJBN0VcXHUwMzM4XCIsXG4gIFwibmdlc1wiOlwiXFx1MkE3RVxcdTAzMzhcIixcbiAgXCJuR2dcIjpcIlxcdTIyRDlcXHUwMzM4XCIsXG4gIFwibmdzaW1cIjpcIlxcdTIyNzVcIixcbiAgXCJuR3RcIjpcIlxcdTIyNkJcXHUyMEQyXCIsXG4gIFwibmd0XCI6XCJcXHUyMjZGXCIsXG4gIFwibmd0clwiOlwiXFx1MjI2RlwiLFxuICBcIm5HdHZcIjpcIlxcdTIyNkJcXHUwMzM4XCIsXG4gIFwibmhBcnJcIjpcIlxcdTIxQ0VcIixcbiAgXCJuaGFyclwiOlwiXFx1MjFBRVwiLFxuICBcIm5ocGFyXCI6XCJcXHUyQUYyXCIsXG4gIFwibmlcIjpcIlxcdTIyMEJcIixcbiAgXCJuaXNcIjpcIlxcdTIyRkNcIixcbiAgXCJuaXNkXCI6XCJcXHUyMkZBXCIsXG4gIFwibml2XCI6XCJcXHUyMjBCXCIsXG4gIFwiTkpjeVwiOlwiXFx1MDQwQVwiLFxuICBcIm5qY3lcIjpcIlxcdTA0NUFcIixcbiAgXCJubEFyclwiOlwiXFx1MjFDRFwiLFxuICBcIm5sYXJyXCI6XCJcXHUyMTlBXCIsXG4gIFwibmxkclwiOlwiXFx1MjAyNVwiLFxuICBcIm5sRVwiOlwiXFx1MjI2NlxcdTAzMzhcIixcbiAgXCJubGVcIjpcIlxcdTIyNzBcIixcbiAgXCJuTGVmdGFycm93XCI6XCJcXHUyMUNEXCIsXG4gIFwibmxlZnRhcnJvd1wiOlwiXFx1MjE5QVwiLFxuICBcIm5MZWZ0cmlnaHRhcnJvd1wiOlwiXFx1MjFDRVwiLFxuICBcIm5sZWZ0cmlnaHRhcnJvd1wiOlwiXFx1MjFBRVwiLFxuICBcIm5sZXFcIjpcIlxcdTIyNzBcIixcbiAgXCJubGVxcVwiOlwiXFx1MjI2NlxcdTAzMzhcIixcbiAgXCJubGVxc2xhbnRcIjpcIlxcdTJBN0RcXHUwMzM4XCIsXG4gIFwibmxlc1wiOlwiXFx1MkE3RFxcdTAzMzhcIixcbiAgXCJubGVzc1wiOlwiXFx1MjI2RVwiLFxuICBcIm5MbFwiOlwiXFx1MjJEOFxcdTAzMzhcIixcbiAgXCJubHNpbVwiOlwiXFx1MjI3NFwiLFxuICBcIm5MdFwiOlwiXFx1MjI2QVxcdTIwRDJcIixcbiAgXCJubHRcIjpcIlxcdTIyNkVcIixcbiAgXCJubHRyaVwiOlwiXFx1MjJFQVwiLFxuICBcIm5sdHJpZVwiOlwiXFx1MjJFQ1wiLFxuICBcIm5MdHZcIjpcIlxcdTIyNkFcXHUwMzM4XCIsXG4gIFwibm1pZFwiOlwiXFx1MjIyNFwiLFxuICBcIk5vQnJlYWtcIjpcIlxcdTIwNjBcIixcbiAgXCJOb25CcmVha2luZ1NwYWNlXCI6XCJcXHUwMEEwXCIsXG4gIFwiTm9wZlwiOlwiXFx1MjExNVwiLFxuICBcIm5vcGZcIjpcIlxcdUQ4MzVcXHVERDVGXCIsXG4gIFwiTm90XCI6XCJcXHUyQUVDXCIsXG4gIFwibm90XCI6XCJcXHUwMEFDXCIsXG4gIFwiTm90Q29uZ3J1ZW50XCI6XCJcXHUyMjYyXCIsXG4gIFwiTm90Q3VwQ2FwXCI6XCJcXHUyMjZEXCIsXG4gIFwiTm90RG91YmxlVmVydGljYWxCYXJcIjpcIlxcdTIyMjZcIixcbiAgXCJOb3RFbGVtZW50XCI6XCJcXHUyMjA5XCIsXG4gIFwiTm90RXF1YWxcIjpcIlxcdTIyNjBcIixcbiAgXCJOb3RFcXVhbFRpbGRlXCI6XCJcXHUyMjQyXFx1MDMzOFwiLFxuICBcIk5vdEV4aXN0c1wiOlwiXFx1MjIwNFwiLFxuICBcIk5vdEdyZWF0ZXJcIjpcIlxcdTIyNkZcIixcbiAgXCJOb3RHcmVhdGVyRXF1YWxcIjpcIlxcdTIyNzFcIixcbiAgXCJOb3RHcmVhdGVyRnVsbEVxdWFsXCI6XCJcXHUyMjY3XFx1MDMzOFwiLFxuICBcIk5vdEdyZWF0ZXJHcmVhdGVyXCI6XCJcXHUyMjZCXFx1MDMzOFwiLFxuICBcIk5vdEdyZWF0ZXJMZXNzXCI6XCJcXHUyMjc5XCIsXG4gIFwiTm90R3JlYXRlclNsYW50RXF1YWxcIjpcIlxcdTJBN0VcXHUwMzM4XCIsXG4gIFwiTm90R3JlYXRlclRpbGRlXCI6XCJcXHUyMjc1XCIsXG4gIFwiTm90SHVtcERvd25IdW1wXCI6XCJcXHUyMjRFXFx1MDMzOFwiLFxuICBcIk5vdEh1bXBFcXVhbFwiOlwiXFx1MjI0RlxcdTAzMzhcIixcbiAgXCJub3RpblwiOlwiXFx1MjIwOVwiLFxuICBcIm5vdGluZG90XCI6XCJcXHUyMkY1XFx1MDMzOFwiLFxuICBcIm5vdGluRVwiOlwiXFx1MjJGOVxcdTAzMzhcIixcbiAgXCJub3RpbnZhXCI6XCJcXHUyMjA5XCIsXG4gIFwibm90aW52YlwiOlwiXFx1MjJGN1wiLFxuICBcIm5vdGludmNcIjpcIlxcdTIyRjZcIixcbiAgXCJOb3RMZWZ0VHJpYW5nbGVcIjpcIlxcdTIyRUFcIixcbiAgXCJOb3RMZWZ0VHJpYW5nbGVCYXJcIjpcIlxcdTI5Q0ZcXHUwMzM4XCIsXG4gIFwiTm90TGVmdFRyaWFuZ2xlRXF1YWxcIjpcIlxcdTIyRUNcIixcbiAgXCJOb3RMZXNzXCI6XCJcXHUyMjZFXCIsXG4gIFwiTm90TGVzc0VxdWFsXCI6XCJcXHUyMjcwXCIsXG4gIFwiTm90TGVzc0dyZWF0ZXJcIjpcIlxcdTIyNzhcIixcbiAgXCJOb3RMZXNzTGVzc1wiOlwiXFx1MjI2QVxcdTAzMzhcIixcbiAgXCJOb3RMZXNzU2xhbnRFcXVhbFwiOlwiXFx1MkE3RFxcdTAzMzhcIixcbiAgXCJOb3RMZXNzVGlsZGVcIjpcIlxcdTIyNzRcIixcbiAgXCJOb3ROZXN0ZWRHcmVhdGVyR3JlYXRlclwiOlwiXFx1MkFBMlxcdTAzMzhcIixcbiAgXCJOb3ROZXN0ZWRMZXNzTGVzc1wiOlwiXFx1MkFBMVxcdTAzMzhcIixcbiAgXCJub3RuaVwiOlwiXFx1MjIwQ1wiLFxuICBcIm5vdG5pdmFcIjpcIlxcdTIyMENcIixcbiAgXCJub3RuaXZiXCI6XCJcXHUyMkZFXCIsXG4gIFwibm90bml2Y1wiOlwiXFx1MjJGRFwiLFxuICBcIk5vdFByZWNlZGVzXCI6XCJcXHUyMjgwXCIsXG4gIFwiTm90UHJlY2VkZXNFcXVhbFwiOlwiXFx1MkFBRlxcdTAzMzhcIixcbiAgXCJOb3RQcmVjZWRlc1NsYW50RXF1YWxcIjpcIlxcdTIyRTBcIixcbiAgXCJOb3RSZXZlcnNlRWxlbWVudFwiOlwiXFx1MjIwQ1wiLFxuICBcIk5vdFJpZ2h0VHJpYW5nbGVcIjpcIlxcdTIyRUJcIixcbiAgXCJOb3RSaWdodFRyaWFuZ2xlQmFyXCI6XCJcXHUyOUQwXFx1MDMzOFwiLFxuICBcIk5vdFJpZ2h0VHJpYW5nbGVFcXVhbFwiOlwiXFx1MjJFRFwiLFxuICBcIk5vdFNxdWFyZVN1YnNldFwiOlwiXFx1MjI4RlxcdTAzMzhcIixcbiAgXCJOb3RTcXVhcmVTdWJzZXRFcXVhbFwiOlwiXFx1MjJFMlwiLFxuICBcIk5vdFNxdWFyZVN1cGVyc2V0XCI6XCJcXHUyMjkwXFx1MDMzOFwiLFxuICBcIk5vdFNxdWFyZVN1cGVyc2V0RXF1YWxcIjpcIlxcdTIyRTNcIixcbiAgXCJOb3RTdWJzZXRcIjpcIlxcdTIyODJcXHUyMEQyXCIsXG4gIFwiTm90U3Vic2V0RXF1YWxcIjpcIlxcdTIyODhcIixcbiAgXCJOb3RTdWNjZWVkc1wiOlwiXFx1MjI4MVwiLFxuICBcIk5vdFN1Y2NlZWRzRXF1YWxcIjpcIlxcdTJBQjBcXHUwMzM4XCIsXG4gIFwiTm90U3VjY2VlZHNTbGFudEVxdWFsXCI6XCJcXHUyMkUxXCIsXG4gIFwiTm90U3VjY2VlZHNUaWxkZVwiOlwiXFx1MjI3RlxcdTAzMzhcIixcbiAgXCJOb3RTdXBlcnNldFwiOlwiXFx1MjI4M1xcdTIwRDJcIixcbiAgXCJOb3RTdXBlcnNldEVxdWFsXCI6XCJcXHUyMjg5XCIsXG4gIFwiTm90VGlsZGVcIjpcIlxcdTIyNDFcIixcbiAgXCJOb3RUaWxkZUVxdWFsXCI6XCJcXHUyMjQ0XCIsXG4gIFwiTm90VGlsZGVGdWxsRXF1YWxcIjpcIlxcdTIyNDdcIixcbiAgXCJOb3RUaWxkZVRpbGRlXCI6XCJcXHUyMjQ5XCIsXG4gIFwiTm90VmVydGljYWxCYXJcIjpcIlxcdTIyMjRcIixcbiAgXCJucGFyXCI6XCJcXHUyMjI2XCIsXG4gIFwibnBhcmFsbGVsXCI6XCJcXHUyMjI2XCIsXG4gIFwibnBhcnNsXCI6XCJcXHUyQUZEXFx1MjBFNVwiLFxuICBcIm5wYXJ0XCI6XCJcXHUyMjAyXFx1MDMzOFwiLFxuICBcIm5wb2xpbnRcIjpcIlxcdTJBMTRcIixcbiAgXCJucHJcIjpcIlxcdTIyODBcIixcbiAgXCJucHJjdWVcIjpcIlxcdTIyRTBcIixcbiAgXCJucHJlXCI6XCJcXHUyQUFGXFx1MDMzOFwiLFxuICBcIm5wcmVjXCI6XCJcXHUyMjgwXCIsXG4gIFwibnByZWNlcVwiOlwiXFx1MkFBRlxcdTAzMzhcIixcbiAgXCJuckFyclwiOlwiXFx1MjFDRlwiLFxuICBcIm5yYXJyXCI6XCJcXHUyMTlCXCIsXG4gIFwibnJhcnJjXCI6XCJcXHUyOTMzXFx1MDMzOFwiLFxuICBcIm5yYXJyd1wiOlwiXFx1MjE5RFxcdTAzMzhcIixcbiAgXCJuUmlnaHRhcnJvd1wiOlwiXFx1MjFDRlwiLFxuICBcIm5yaWdodGFycm93XCI6XCJcXHUyMTlCXCIsXG4gIFwibnJ0cmlcIjpcIlxcdTIyRUJcIixcbiAgXCJucnRyaWVcIjpcIlxcdTIyRURcIixcbiAgXCJuc2NcIjpcIlxcdTIyODFcIixcbiAgXCJuc2NjdWVcIjpcIlxcdTIyRTFcIixcbiAgXCJuc2NlXCI6XCJcXHUyQUIwXFx1MDMzOFwiLFxuICBcIk5zY3JcIjpcIlxcdUQ4MzVcXHVEQ0E5XCIsXG4gIFwibnNjclwiOlwiXFx1RDgzNVxcdURDQzNcIixcbiAgXCJuc2hvcnRtaWRcIjpcIlxcdTIyMjRcIixcbiAgXCJuc2hvcnRwYXJhbGxlbFwiOlwiXFx1MjIyNlwiLFxuICBcIm5zaW1cIjpcIlxcdTIyNDFcIixcbiAgXCJuc2ltZVwiOlwiXFx1MjI0NFwiLFxuICBcIm5zaW1lcVwiOlwiXFx1MjI0NFwiLFxuICBcIm5zbWlkXCI6XCJcXHUyMjI0XCIsXG4gIFwibnNwYXJcIjpcIlxcdTIyMjZcIixcbiAgXCJuc3FzdWJlXCI6XCJcXHUyMkUyXCIsXG4gIFwibnNxc3VwZVwiOlwiXFx1MjJFM1wiLFxuICBcIm5zdWJcIjpcIlxcdTIyODRcIixcbiAgXCJuc3ViRVwiOlwiXFx1MkFDNVxcdTAzMzhcIixcbiAgXCJuc3ViZVwiOlwiXFx1MjI4OFwiLFxuICBcIm5zdWJzZXRcIjpcIlxcdTIyODJcXHUyMEQyXCIsXG4gIFwibnN1YnNldGVxXCI6XCJcXHUyMjg4XCIsXG4gIFwibnN1YnNldGVxcVwiOlwiXFx1MkFDNVxcdTAzMzhcIixcbiAgXCJuc3VjY1wiOlwiXFx1MjI4MVwiLFxuICBcIm5zdWNjZXFcIjpcIlxcdTJBQjBcXHUwMzM4XCIsXG4gIFwibnN1cFwiOlwiXFx1MjI4NVwiLFxuICBcIm5zdXBFXCI6XCJcXHUyQUM2XFx1MDMzOFwiLFxuICBcIm5zdXBlXCI6XCJcXHUyMjg5XCIsXG4gIFwibnN1cHNldFwiOlwiXFx1MjI4M1xcdTIwRDJcIixcbiAgXCJuc3Vwc2V0ZXFcIjpcIlxcdTIyODlcIixcbiAgXCJuc3Vwc2V0ZXFxXCI6XCJcXHUyQUM2XFx1MDMzOFwiLFxuICBcIm50Z2xcIjpcIlxcdTIyNzlcIixcbiAgXCJOdGlsZGVcIjpcIlxcdTAwRDFcIixcbiAgXCJudGlsZGVcIjpcIlxcdTAwRjFcIixcbiAgXCJudGxnXCI6XCJcXHUyMjc4XCIsXG4gIFwibnRyaWFuZ2xlbGVmdFwiOlwiXFx1MjJFQVwiLFxuICBcIm50cmlhbmdsZWxlZnRlcVwiOlwiXFx1MjJFQ1wiLFxuICBcIm50cmlhbmdsZXJpZ2h0XCI6XCJcXHUyMkVCXCIsXG4gIFwibnRyaWFuZ2xlcmlnaHRlcVwiOlwiXFx1MjJFRFwiLFxuICBcIk51XCI6XCJcXHUwMzlEXCIsXG4gIFwibnVcIjpcIlxcdTAzQkRcIixcbiAgXCJudW1cIjpcIlxcdTAwMjNcIixcbiAgXCJudW1lcm9cIjpcIlxcdTIxMTZcIixcbiAgXCJudW1zcFwiOlwiXFx1MjAwN1wiLFxuICBcIm52YXBcIjpcIlxcdTIyNERcXHUyMEQyXCIsXG4gIFwiblZEYXNoXCI6XCJcXHUyMkFGXCIsXG4gIFwiblZkYXNoXCI6XCJcXHUyMkFFXCIsXG4gIFwibnZEYXNoXCI6XCJcXHUyMkFEXCIsXG4gIFwibnZkYXNoXCI6XCJcXHUyMkFDXCIsXG4gIFwibnZnZVwiOlwiXFx1MjI2NVxcdTIwRDJcIixcbiAgXCJudmd0XCI6XCJcXHUwMDNFXFx1MjBEMlwiLFxuICBcIm52SGFyclwiOlwiXFx1MjkwNFwiLFxuICBcIm52aW5maW5cIjpcIlxcdTI5REVcIixcbiAgXCJudmxBcnJcIjpcIlxcdTI5MDJcIixcbiAgXCJudmxlXCI6XCJcXHUyMjY0XFx1MjBEMlwiLFxuICBcIm52bHRcIjpcIlxcdTAwM0NcXHUyMEQyXCIsXG4gIFwibnZsdHJpZVwiOlwiXFx1MjJCNFxcdTIwRDJcIixcbiAgXCJudnJBcnJcIjpcIlxcdTI5MDNcIixcbiAgXCJudnJ0cmllXCI6XCJcXHUyMkI1XFx1MjBEMlwiLFxuICBcIm52c2ltXCI6XCJcXHUyMjNDXFx1MjBEMlwiLFxuICBcIm53YXJoa1wiOlwiXFx1MjkyM1wiLFxuICBcIm53QXJyXCI6XCJcXHUyMUQ2XCIsXG4gIFwibndhcnJcIjpcIlxcdTIxOTZcIixcbiAgXCJud2Fycm93XCI6XCJcXHUyMTk2XCIsXG4gIFwibnduZWFyXCI6XCJcXHUyOTI3XCIsXG4gIFwiT2FjdXRlXCI6XCJcXHUwMEQzXCIsXG4gIFwib2FjdXRlXCI6XCJcXHUwMEYzXCIsXG4gIFwib2FzdFwiOlwiXFx1MjI5QlwiLFxuICBcIm9jaXJcIjpcIlxcdTIyOUFcIixcbiAgXCJPY2lyY1wiOlwiXFx1MDBENFwiLFxuICBcIm9jaXJjXCI6XCJcXHUwMEY0XCIsXG4gIFwiT2N5XCI6XCJcXHUwNDFFXCIsXG4gIFwib2N5XCI6XCJcXHUwNDNFXCIsXG4gIFwib2Rhc2hcIjpcIlxcdTIyOURcIixcbiAgXCJPZGJsYWNcIjpcIlxcdTAxNTBcIixcbiAgXCJvZGJsYWNcIjpcIlxcdTAxNTFcIixcbiAgXCJvZGl2XCI6XCJcXHUyQTM4XCIsXG4gIFwib2RvdFwiOlwiXFx1MjI5OVwiLFxuICBcIm9kc29sZFwiOlwiXFx1MjlCQ1wiLFxuICBcIk9FbGlnXCI6XCJcXHUwMTUyXCIsXG4gIFwib2VsaWdcIjpcIlxcdTAxNTNcIixcbiAgXCJvZmNpclwiOlwiXFx1MjlCRlwiLFxuICBcIk9mclwiOlwiXFx1RDgzNVxcdUREMTJcIixcbiAgXCJvZnJcIjpcIlxcdUQ4MzVcXHVERDJDXCIsXG4gIFwib2dvblwiOlwiXFx1MDJEQlwiLFxuICBcIk9ncmF2ZVwiOlwiXFx1MDBEMlwiLFxuICBcIm9ncmF2ZVwiOlwiXFx1MDBGMlwiLFxuICBcIm9ndFwiOlwiXFx1MjlDMVwiLFxuICBcIm9oYmFyXCI6XCJcXHUyOUI1XCIsXG4gIFwib2htXCI6XCJcXHUwM0E5XCIsXG4gIFwib2ludFwiOlwiXFx1MjIyRVwiLFxuICBcIm9sYXJyXCI6XCJcXHUyMUJBXCIsXG4gIFwib2xjaXJcIjpcIlxcdTI5QkVcIixcbiAgXCJvbGNyb3NzXCI6XCJcXHUyOUJCXCIsXG4gIFwib2xpbmVcIjpcIlxcdTIwM0VcIixcbiAgXCJvbHRcIjpcIlxcdTI5QzBcIixcbiAgXCJPbWFjclwiOlwiXFx1MDE0Q1wiLFxuICBcIm9tYWNyXCI6XCJcXHUwMTREXCIsXG4gIFwiT21lZ2FcIjpcIlxcdTAzQTlcIixcbiAgXCJvbWVnYVwiOlwiXFx1MDNDOVwiLFxuICBcIk9taWNyb25cIjpcIlxcdTAzOUZcIixcbiAgXCJvbWljcm9uXCI6XCJcXHUwM0JGXCIsXG4gIFwib21pZFwiOlwiXFx1MjlCNlwiLFxuICBcIm9taW51c1wiOlwiXFx1MjI5NlwiLFxuICBcIk9vcGZcIjpcIlxcdUQ4MzVcXHVERDQ2XCIsXG4gIFwib29wZlwiOlwiXFx1RDgzNVxcdURENjBcIixcbiAgXCJvcGFyXCI6XCJcXHUyOUI3XCIsXG4gIFwiT3BlbkN1cmx5RG91YmxlUXVvdGVcIjpcIlxcdTIwMUNcIixcbiAgXCJPcGVuQ3VybHlRdW90ZVwiOlwiXFx1MjAxOFwiLFxuICBcIm9wZXJwXCI6XCJcXHUyOUI5XCIsXG4gIFwib3BsdXNcIjpcIlxcdTIyOTVcIixcbiAgXCJPclwiOlwiXFx1MkE1NFwiLFxuICBcIm9yXCI6XCJcXHUyMjI4XCIsXG4gIFwib3JhcnJcIjpcIlxcdTIxQkJcIixcbiAgXCJvcmRcIjpcIlxcdTJBNURcIixcbiAgXCJvcmRlclwiOlwiXFx1MjEzNFwiLFxuICBcIm9yZGVyb2ZcIjpcIlxcdTIxMzRcIixcbiAgXCJvcmRmXCI6XCJcXHUwMEFBXCIsXG4gIFwib3JkbVwiOlwiXFx1MDBCQVwiLFxuICBcIm9yaWdvZlwiOlwiXFx1MjJCNlwiLFxuICBcIm9yb3JcIjpcIlxcdTJBNTZcIixcbiAgXCJvcnNsb3BlXCI6XCJcXHUyQTU3XCIsXG4gIFwib3J2XCI6XCJcXHUyQTVCXCIsXG4gIFwib1NcIjpcIlxcdTI0QzhcIixcbiAgXCJPc2NyXCI6XCJcXHVEODM1XFx1RENBQVwiLFxuICBcIm9zY3JcIjpcIlxcdTIxMzRcIixcbiAgXCJPc2xhc2hcIjpcIlxcdTAwRDhcIixcbiAgXCJvc2xhc2hcIjpcIlxcdTAwRjhcIixcbiAgXCJvc29sXCI6XCJcXHUyMjk4XCIsXG4gIFwiT3RpbGRlXCI6XCJcXHUwMEQ1XCIsXG4gIFwib3RpbGRlXCI6XCJcXHUwMEY1XCIsXG4gIFwiT3RpbWVzXCI6XCJcXHUyQTM3XCIsXG4gIFwib3RpbWVzXCI6XCJcXHUyMjk3XCIsXG4gIFwib3RpbWVzYXNcIjpcIlxcdTJBMzZcIixcbiAgXCJPdW1sXCI6XCJcXHUwMEQ2XCIsXG4gIFwib3VtbFwiOlwiXFx1MDBGNlwiLFxuICBcIm92YmFyXCI6XCJcXHUyMzNEXCIsXG4gIFwiT3ZlckJhclwiOlwiXFx1MjAzRVwiLFxuICBcIk92ZXJCcmFjZVwiOlwiXFx1MjNERVwiLFxuICBcIk92ZXJCcmFja2V0XCI6XCJcXHUyM0I0XCIsXG4gIFwiT3ZlclBhcmVudGhlc2lzXCI6XCJcXHUyM0RDXCIsXG4gIFwicGFyXCI6XCJcXHUyMjI1XCIsXG4gIFwicGFyYVwiOlwiXFx1MDBCNlwiLFxuICBcInBhcmFsbGVsXCI6XCJcXHUyMjI1XCIsXG4gIFwicGFyc2ltXCI6XCJcXHUyQUYzXCIsXG4gIFwicGFyc2xcIjpcIlxcdTJBRkRcIixcbiAgXCJwYXJ0XCI6XCJcXHUyMjAyXCIsXG4gIFwiUGFydGlhbERcIjpcIlxcdTIyMDJcIixcbiAgXCJQY3lcIjpcIlxcdTA0MUZcIixcbiAgXCJwY3lcIjpcIlxcdTA0M0ZcIixcbiAgXCJwZXJjbnRcIjpcIlxcdTAwMjVcIixcbiAgXCJwZXJpb2RcIjpcIlxcdTAwMkVcIixcbiAgXCJwZXJtaWxcIjpcIlxcdTIwMzBcIixcbiAgXCJwZXJwXCI6XCJcXHUyMkE1XCIsXG4gIFwicGVydGVua1wiOlwiXFx1MjAzMVwiLFxuICBcIlBmclwiOlwiXFx1RDgzNVxcdUREMTNcIixcbiAgXCJwZnJcIjpcIlxcdUQ4MzVcXHVERDJEXCIsXG4gIFwiUGhpXCI6XCJcXHUwM0E2XCIsXG4gIFwicGhpXCI6XCJcXHUwM0M2XCIsXG4gIFwicGhpdlwiOlwiXFx1MDNENVwiLFxuICBcInBobW1hdFwiOlwiXFx1MjEzM1wiLFxuICBcInBob25lXCI6XCJcXHUyNjBFXCIsXG4gIFwiUGlcIjpcIlxcdTAzQTBcIixcbiAgXCJwaVwiOlwiXFx1MDNDMFwiLFxuICBcInBpdGNoZm9ya1wiOlwiXFx1MjJENFwiLFxuICBcInBpdlwiOlwiXFx1MDNENlwiLFxuICBcInBsYW5ja1wiOlwiXFx1MjEwRlwiLFxuICBcInBsYW5ja2hcIjpcIlxcdTIxMEVcIixcbiAgXCJwbGFua3ZcIjpcIlxcdTIxMEZcIixcbiAgXCJwbHVzXCI6XCJcXHUwMDJCXCIsXG4gIFwicGx1c2FjaXJcIjpcIlxcdTJBMjNcIixcbiAgXCJwbHVzYlwiOlwiXFx1MjI5RVwiLFxuICBcInBsdXNjaXJcIjpcIlxcdTJBMjJcIixcbiAgXCJwbHVzZG9cIjpcIlxcdTIyMTRcIixcbiAgXCJwbHVzZHVcIjpcIlxcdTJBMjVcIixcbiAgXCJwbHVzZVwiOlwiXFx1MkE3MlwiLFxuICBcIlBsdXNNaW51c1wiOlwiXFx1MDBCMVwiLFxuICBcInBsdXNtblwiOlwiXFx1MDBCMVwiLFxuICBcInBsdXNzaW1cIjpcIlxcdTJBMjZcIixcbiAgXCJwbHVzdHdvXCI6XCJcXHUyQTI3XCIsXG4gIFwicG1cIjpcIlxcdTAwQjFcIixcbiAgXCJQb2luY2FyZXBsYW5lXCI6XCJcXHUyMTBDXCIsXG4gIFwicG9pbnRpbnRcIjpcIlxcdTJBMTVcIixcbiAgXCJQb3BmXCI6XCJcXHUyMTE5XCIsXG4gIFwicG9wZlwiOlwiXFx1RDgzNVxcdURENjFcIixcbiAgXCJwb3VuZFwiOlwiXFx1MDBBM1wiLFxuICBcIlByXCI6XCJcXHUyQUJCXCIsXG4gIFwicHJcIjpcIlxcdTIyN0FcIixcbiAgXCJwcmFwXCI6XCJcXHUyQUI3XCIsXG4gIFwicHJjdWVcIjpcIlxcdTIyN0NcIixcbiAgXCJwckVcIjpcIlxcdTJBQjNcIixcbiAgXCJwcmVcIjpcIlxcdTJBQUZcIixcbiAgXCJwcmVjXCI6XCJcXHUyMjdBXCIsXG4gIFwicHJlY2FwcHJveFwiOlwiXFx1MkFCN1wiLFxuICBcInByZWNjdXJseWVxXCI6XCJcXHUyMjdDXCIsXG4gIFwiUHJlY2VkZXNcIjpcIlxcdTIyN0FcIixcbiAgXCJQcmVjZWRlc0VxdWFsXCI6XCJcXHUyQUFGXCIsXG4gIFwiUHJlY2VkZXNTbGFudEVxdWFsXCI6XCJcXHUyMjdDXCIsXG4gIFwiUHJlY2VkZXNUaWxkZVwiOlwiXFx1MjI3RVwiLFxuICBcInByZWNlcVwiOlwiXFx1MkFBRlwiLFxuICBcInByZWNuYXBwcm94XCI6XCJcXHUyQUI5XCIsXG4gIFwicHJlY25lcXFcIjpcIlxcdTJBQjVcIixcbiAgXCJwcmVjbnNpbVwiOlwiXFx1MjJFOFwiLFxuICBcInByZWNzaW1cIjpcIlxcdTIyN0VcIixcbiAgXCJQcmltZVwiOlwiXFx1MjAzM1wiLFxuICBcInByaW1lXCI6XCJcXHUyMDMyXCIsXG4gIFwicHJpbWVzXCI6XCJcXHUyMTE5XCIsXG4gIFwicHJuYXBcIjpcIlxcdTJBQjlcIixcbiAgXCJwcm5FXCI6XCJcXHUyQUI1XCIsXG4gIFwicHJuc2ltXCI6XCJcXHUyMkU4XCIsXG4gIFwicHJvZFwiOlwiXFx1MjIwRlwiLFxuICBcIlByb2R1Y3RcIjpcIlxcdTIyMEZcIixcbiAgXCJwcm9mYWxhclwiOlwiXFx1MjMyRVwiLFxuICBcInByb2ZsaW5lXCI6XCJcXHUyMzEyXCIsXG4gIFwicHJvZnN1cmZcIjpcIlxcdTIzMTNcIixcbiAgXCJwcm9wXCI6XCJcXHUyMjFEXCIsXG4gIFwiUHJvcG9ydGlvblwiOlwiXFx1MjIzN1wiLFxuICBcIlByb3BvcnRpb25hbFwiOlwiXFx1MjIxRFwiLFxuICBcInByb3B0b1wiOlwiXFx1MjIxRFwiLFxuICBcInByc2ltXCI6XCJcXHUyMjdFXCIsXG4gIFwicHJ1cmVsXCI6XCJcXHUyMkIwXCIsXG4gIFwiUHNjclwiOlwiXFx1RDgzNVxcdURDQUJcIixcbiAgXCJwc2NyXCI6XCJcXHVEODM1XFx1RENDNVwiLFxuICBcIlBzaVwiOlwiXFx1MDNBOFwiLFxuICBcInBzaVwiOlwiXFx1MDNDOFwiLFxuICBcInB1bmNzcFwiOlwiXFx1MjAwOFwiLFxuICBcIlFmclwiOlwiXFx1RDgzNVxcdUREMTRcIixcbiAgXCJxZnJcIjpcIlxcdUQ4MzVcXHVERDJFXCIsXG4gIFwicWludFwiOlwiXFx1MkEwQ1wiLFxuICBcIlFvcGZcIjpcIlxcdTIxMUFcIixcbiAgXCJxb3BmXCI6XCJcXHVEODM1XFx1REQ2MlwiLFxuICBcInFwcmltZVwiOlwiXFx1MjA1N1wiLFxuICBcIlFzY3JcIjpcIlxcdUQ4MzVcXHVEQ0FDXCIsXG4gIFwicXNjclwiOlwiXFx1RDgzNVxcdURDQzZcIixcbiAgXCJxdWF0ZXJuaW9uc1wiOlwiXFx1MjEwRFwiLFxuICBcInF1YXRpbnRcIjpcIlxcdTJBMTZcIixcbiAgXCJxdWVzdFwiOlwiXFx1MDAzRlwiLFxuICBcInF1ZXN0ZXFcIjpcIlxcdTIyNUZcIixcbiAgXCJRVU9UXCI6XCJcXHUwMDIyXCIsXG4gIFwicXVvdFwiOlwiXFx1MDAyMlwiLFxuICBcInJBYXJyXCI6XCJcXHUyMURCXCIsXG4gIFwicmFjZVwiOlwiXFx1MjIzRFxcdTAzMzFcIixcbiAgXCJSYWN1dGVcIjpcIlxcdTAxNTRcIixcbiAgXCJyYWN1dGVcIjpcIlxcdTAxNTVcIixcbiAgXCJyYWRpY1wiOlwiXFx1MjIxQVwiLFxuICBcInJhZW1wdHl2XCI6XCJcXHUyOUIzXCIsXG4gIFwiUmFuZ1wiOlwiXFx1MjdFQlwiLFxuICBcInJhbmdcIjpcIlxcdTI3RTlcIixcbiAgXCJyYW5nZFwiOlwiXFx1Mjk5MlwiLFxuICBcInJhbmdlXCI6XCJcXHUyOUE1XCIsXG4gIFwicmFuZ2xlXCI6XCJcXHUyN0U5XCIsXG4gIFwicmFxdW9cIjpcIlxcdTAwQkJcIixcbiAgXCJSYXJyXCI6XCJcXHUyMUEwXCIsXG4gIFwickFyclwiOlwiXFx1MjFEMlwiLFxuICBcInJhcnJcIjpcIlxcdTIxOTJcIixcbiAgXCJyYXJyYXBcIjpcIlxcdTI5NzVcIixcbiAgXCJyYXJyYlwiOlwiXFx1MjFFNVwiLFxuICBcInJhcnJiZnNcIjpcIlxcdTI5MjBcIixcbiAgXCJyYXJyY1wiOlwiXFx1MjkzM1wiLFxuICBcInJhcnJmc1wiOlwiXFx1MjkxRVwiLFxuICBcInJhcnJoa1wiOlwiXFx1MjFBQVwiLFxuICBcInJhcnJscFwiOlwiXFx1MjFBQ1wiLFxuICBcInJhcnJwbFwiOlwiXFx1Mjk0NVwiLFxuICBcInJhcnJzaW1cIjpcIlxcdTI5NzRcIixcbiAgXCJSYXJydGxcIjpcIlxcdTI5MTZcIixcbiAgXCJyYXJydGxcIjpcIlxcdTIxQTNcIixcbiAgXCJyYXJyd1wiOlwiXFx1MjE5RFwiLFxuICBcInJBdGFpbFwiOlwiXFx1MjkxQ1wiLFxuICBcInJhdGFpbFwiOlwiXFx1MjkxQVwiLFxuICBcInJhdGlvXCI6XCJcXHUyMjM2XCIsXG4gIFwicmF0aW9uYWxzXCI6XCJcXHUyMTFBXCIsXG4gIFwiUkJhcnJcIjpcIlxcdTI5MTBcIixcbiAgXCJyQmFyclwiOlwiXFx1MjkwRlwiLFxuICBcInJiYXJyXCI6XCJcXHUyOTBEXCIsXG4gIFwicmJicmtcIjpcIlxcdTI3NzNcIixcbiAgXCJyYnJhY2VcIjpcIlxcdTAwN0RcIixcbiAgXCJyYnJhY2tcIjpcIlxcdTAwNURcIixcbiAgXCJyYnJrZVwiOlwiXFx1Mjk4Q1wiLFxuICBcInJicmtzbGRcIjpcIlxcdTI5OEVcIixcbiAgXCJyYnJrc2x1XCI6XCJcXHUyOTkwXCIsXG4gIFwiUmNhcm9uXCI6XCJcXHUwMTU4XCIsXG4gIFwicmNhcm9uXCI6XCJcXHUwMTU5XCIsXG4gIFwiUmNlZGlsXCI6XCJcXHUwMTU2XCIsXG4gIFwicmNlZGlsXCI6XCJcXHUwMTU3XCIsXG4gIFwicmNlaWxcIjpcIlxcdTIzMDlcIixcbiAgXCJyY3ViXCI6XCJcXHUwMDdEXCIsXG4gIFwiUmN5XCI6XCJcXHUwNDIwXCIsXG4gIFwicmN5XCI6XCJcXHUwNDQwXCIsXG4gIFwicmRjYVwiOlwiXFx1MjkzN1wiLFxuICBcInJkbGRoYXJcIjpcIlxcdTI5NjlcIixcbiAgXCJyZHF1b1wiOlwiXFx1MjAxRFwiLFxuICBcInJkcXVvclwiOlwiXFx1MjAxRFwiLFxuICBcInJkc2hcIjpcIlxcdTIxQjNcIixcbiAgXCJSZVwiOlwiXFx1MjExQ1wiLFxuICBcInJlYWxcIjpcIlxcdTIxMUNcIixcbiAgXCJyZWFsaW5lXCI6XCJcXHUyMTFCXCIsXG4gIFwicmVhbHBhcnRcIjpcIlxcdTIxMUNcIixcbiAgXCJyZWFsc1wiOlwiXFx1MjExRFwiLFxuICBcInJlY3RcIjpcIlxcdTI1QURcIixcbiAgXCJSRUdcIjpcIlxcdTAwQUVcIixcbiAgXCJyZWdcIjpcIlxcdTAwQUVcIixcbiAgXCJSZXZlcnNlRWxlbWVudFwiOlwiXFx1MjIwQlwiLFxuICBcIlJldmVyc2VFcXVpbGlicml1bVwiOlwiXFx1MjFDQlwiLFxuICBcIlJldmVyc2VVcEVxdWlsaWJyaXVtXCI6XCJcXHUyOTZGXCIsXG4gIFwicmZpc2h0XCI6XCJcXHUyOTdEXCIsXG4gIFwicmZsb29yXCI6XCJcXHUyMzBCXCIsXG4gIFwiUmZyXCI6XCJcXHUyMTFDXCIsXG4gIFwicmZyXCI6XCJcXHVEODM1XFx1REQyRlwiLFxuICBcInJIYXJcIjpcIlxcdTI5NjRcIixcbiAgXCJyaGFyZFwiOlwiXFx1MjFDMVwiLFxuICBcInJoYXJ1XCI6XCJcXHUyMUMwXCIsXG4gIFwicmhhcnVsXCI6XCJcXHUyOTZDXCIsXG4gIFwiUmhvXCI6XCJcXHUwM0ExXCIsXG4gIFwicmhvXCI6XCJcXHUwM0MxXCIsXG4gIFwicmhvdlwiOlwiXFx1MDNGMVwiLFxuICBcIlJpZ2h0QW5nbGVCcmFja2V0XCI6XCJcXHUyN0U5XCIsXG4gIFwiUmlnaHRBcnJvd1wiOlwiXFx1MjE5MlwiLFxuICBcIlJpZ2h0YXJyb3dcIjpcIlxcdTIxRDJcIixcbiAgXCJyaWdodGFycm93XCI6XCJcXHUyMTkyXCIsXG4gIFwiUmlnaHRBcnJvd0JhclwiOlwiXFx1MjFFNVwiLFxuICBcIlJpZ2h0QXJyb3dMZWZ0QXJyb3dcIjpcIlxcdTIxQzRcIixcbiAgXCJyaWdodGFycm93dGFpbFwiOlwiXFx1MjFBM1wiLFxuICBcIlJpZ2h0Q2VpbGluZ1wiOlwiXFx1MjMwOVwiLFxuICBcIlJpZ2h0RG91YmxlQnJhY2tldFwiOlwiXFx1MjdFN1wiLFxuICBcIlJpZ2h0RG93blRlZVZlY3RvclwiOlwiXFx1Mjk1RFwiLFxuICBcIlJpZ2h0RG93blZlY3RvclwiOlwiXFx1MjFDMlwiLFxuICBcIlJpZ2h0RG93blZlY3RvckJhclwiOlwiXFx1Mjk1NVwiLFxuICBcIlJpZ2h0Rmxvb3JcIjpcIlxcdTIzMEJcIixcbiAgXCJyaWdodGhhcnBvb25kb3duXCI6XCJcXHUyMUMxXCIsXG4gIFwicmlnaHRoYXJwb29udXBcIjpcIlxcdTIxQzBcIixcbiAgXCJyaWdodGxlZnRhcnJvd3NcIjpcIlxcdTIxQzRcIixcbiAgXCJyaWdodGxlZnRoYXJwb29uc1wiOlwiXFx1MjFDQ1wiLFxuICBcInJpZ2h0cmlnaHRhcnJvd3NcIjpcIlxcdTIxQzlcIixcbiAgXCJyaWdodHNxdWlnYXJyb3dcIjpcIlxcdTIxOURcIixcbiAgXCJSaWdodFRlZVwiOlwiXFx1MjJBMlwiLFxuICBcIlJpZ2h0VGVlQXJyb3dcIjpcIlxcdTIxQTZcIixcbiAgXCJSaWdodFRlZVZlY3RvclwiOlwiXFx1Mjk1QlwiLFxuICBcInJpZ2h0dGhyZWV0aW1lc1wiOlwiXFx1MjJDQ1wiLFxuICBcIlJpZ2h0VHJpYW5nbGVcIjpcIlxcdTIyQjNcIixcbiAgXCJSaWdodFRyaWFuZ2xlQmFyXCI6XCJcXHUyOUQwXCIsXG4gIFwiUmlnaHRUcmlhbmdsZUVxdWFsXCI6XCJcXHUyMkI1XCIsXG4gIFwiUmlnaHRVcERvd25WZWN0b3JcIjpcIlxcdTI5NEZcIixcbiAgXCJSaWdodFVwVGVlVmVjdG9yXCI6XCJcXHUyOTVDXCIsXG4gIFwiUmlnaHRVcFZlY3RvclwiOlwiXFx1MjFCRVwiLFxuICBcIlJpZ2h0VXBWZWN0b3JCYXJcIjpcIlxcdTI5NTRcIixcbiAgXCJSaWdodFZlY3RvclwiOlwiXFx1MjFDMFwiLFxuICBcIlJpZ2h0VmVjdG9yQmFyXCI6XCJcXHUyOTUzXCIsXG4gIFwicmluZ1wiOlwiXFx1MDJEQVwiLFxuICBcInJpc2luZ2RvdHNlcVwiOlwiXFx1MjI1M1wiLFxuICBcInJsYXJyXCI6XCJcXHUyMUM0XCIsXG4gIFwicmxoYXJcIjpcIlxcdTIxQ0NcIixcbiAgXCJybG1cIjpcIlxcdTIwMEZcIixcbiAgXCJybW91c3RcIjpcIlxcdTIzQjFcIixcbiAgXCJybW91c3RhY2hlXCI6XCJcXHUyM0IxXCIsXG4gIFwicm5taWRcIjpcIlxcdTJBRUVcIixcbiAgXCJyb2FuZ1wiOlwiXFx1MjdFRFwiLFxuICBcInJvYXJyXCI6XCJcXHUyMUZFXCIsXG4gIFwicm9icmtcIjpcIlxcdTI3RTdcIixcbiAgXCJyb3BhclwiOlwiXFx1Mjk4NlwiLFxuICBcIlJvcGZcIjpcIlxcdTIxMURcIixcbiAgXCJyb3BmXCI6XCJcXHVEODM1XFx1REQ2M1wiLFxuICBcInJvcGx1c1wiOlwiXFx1MkEyRVwiLFxuICBcInJvdGltZXNcIjpcIlxcdTJBMzVcIixcbiAgXCJSb3VuZEltcGxpZXNcIjpcIlxcdTI5NzBcIixcbiAgXCJycGFyXCI6XCJcXHUwMDI5XCIsXG4gIFwicnBhcmd0XCI6XCJcXHUyOTk0XCIsXG4gIFwicnBwb2xpbnRcIjpcIlxcdTJBMTJcIixcbiAgXCJycmFyclwiOlwiXFx1MjFDOVwiLFxuICBcIlJyaWdodGFycm93XCI6XCJcXHUyMURCXCIsXG4gIFwicnNhcXVvXCI6XCJcXHUyMDNBXCIsXG4gIFwiUnNjclwiOlwiXFx1MjExQlwiLFxuICBcInJzY3JcIjpcIlxcdUQ4MzVcXHVEQ0M3XCIsXG4gIFwiUnNoXCI6XCJcXHUyMUIxXCIsXG4gIFwicnNoXCI6XCJcXHUyMUIxXCIsXG4gIFwicnNxYlwiOlwiXFx1MDA1RFwiLFxuICBcInJzcXVvXCI6XCJcXHUyMDE5XCIsXG4gIFwicnNxdW9yXCI6XCJcXHUyMDE5XCIsXG4gIFwicnRocmVlXCI6XCJcXHUyMkNDXCIsXG4gIFwicnRpbWVzXCI6XCJcXHUyMkNBXCIsXG4gIFwicnRyaVwiOlwiXFx1MjVCOVwiLFxuICBcInJ0cmllXCI6XCJcXHUyMkI1XCIsXG4gIFwicnRyaWZcIjpcIlxcdTI1QjhcIixcbiAgXCJydHJpbHRyaVwiOlwiXFx1MjlDRVwiLFxuICBcIlJ1bGVEZWxheWVkXCI6XCJcXHUyOUY0XCIsXG4gIFwicnVsdWhhclwiOlwiXFx1Mjk2OFwiLFxuICBcInJ4XCI6XCJcXHUyMTFFXCIsXG4gIFwiU2FjdXRlXCI6XCJcXHUwMTVBXCIsXG4gIFwic2FjdXRlXCI6XCJcXHUwMTVCXCIsXG4gIFwic2JxdW9cIjpcIlxcdTIwMUFcIixcbiAgXCJTY1wiOlwiXFx1MkFCQ1wiLFxuICBcInNjXCI6XCJcXHUyMjdCXCIsXG4gIFwic2NhcFwiOlwiXFx1MkFCOFwiLFxuICBcIlNjYXJvblwiOlwiXFx1MDE2MFwiLFxuICBcInNjYXJvblwiOlwiXFx1MDE2MVwiLFxuICBcInNjY3VlXCI6XCJcXHUyMjdEXCIsXG4gIFwic2NFXCI6XCJcXHUyQUI0XCIsXG4gIFwic2NlXCI6XCJcXHUyQUIwXCIsXG4gIFwiU2NlZGlsXCI6XCJcXHUwMTVFXCIsXG4gIFwic2NlZGlsXCI6XCJcXHUwMTVGXCIsXG4gIFwiU2NpcmNcIjpcIlxcdTAxNUNcIixcbiAgXCJzY2lyY1wiOlwiXFx1MDE1RFwiLFxuICBcInNjbmFwXCI6XCJcXHUyQUJBXCIsXG4gIFwic2NuRVwiOlwiXFx1MkFCNlwiLFxuICBcInNjbnNpbVwiOlwiXFx1MjJFOVwiLFxuICBcInNjcG9saW50XCI6XCJcXHUyQTEzXCIsXG4gIFwic2NzaW1cIjpcIlxcdTIyN0ZcIixcbiAgXCJTY3lcIjpcIlxcdTA0MjFcIixcbiAgXCJzY3lcIjpcIlxcdTA0NDFcIixcbiAgXCJzZG90XCI6XCJcXHUyMkM1XCIsXG4gIFwic2RvdGJcIjpcIlxcdTIyQTFcIixcbiAgXCJzZG90ZVwiOlwiXFx1MkE2NlwiLFxuICBcInNlYXJoa1wiOlwiXFx1MjkyNVwiLFxuICBcInNlQXJyXCI6XCJcXHUyMUQ4XCIsXG4gIFwic2VhcnJcIjpcIlxcdTIxOThcIixcbiAgXCJzZWFycm93XCI6XCJcXHUyMTk4XCIsXG4gIFwic2VjdFwiOlwiXFx1MDBBN1wiLFxuICBcInNlbWlcIjpcIlxcdTAwM0JcIixcbiAgXCJzZXN3YXJcIjpcIlxcdTI5MjlcIixcbiAgXCJzZXRtaW51c1wiOlwiXFx1MjIxNlwiLFxuICBcInNldG1uXCI6XCJcXHUyMjE2XCIsXG4gIFwic2V4dFwiOlwiXFx1MjczNlwiLFxuICBcIlNmclwiOlwiXFx1RDgzNVxcdUREMTZcIixcbiAgXCJzZnJcIjpcIlxcdUQ4MzVcXHVERDMwXCIsXG4gIFwic2Zyb3duXCI6XCJcXHUyMzIyXCIsXG4gIFwic2hhcnBcIjpcIlxcdTI2NkZcIixcbiAgXCJTSENIY3lcIjpcIlxcdTA0MjlcIixcbiAgXCJzaGNoY3lcIjpcIlxcdTA0NDlcIixcbiAgXCJTSGN5XCI6XCJcXHUwNDI4XCIsXG4gIFwic2hjeVwiOlwiXFx1MDQ0OFwiLFxuICBcIlNob3J0RG93bkFycm93XCI6XCJcXHUyMTkzXCIsXG4gIFwiU2hvcnRMZWZ0QXJyb3dcIjpcIlxcdTIxOTBcIixcbiAgXCJzaG9ydG1pZFwiOlwiXFx1MjIyM1wiLFxuICBcInNob3J0cGFyYWxsZWxcIjpcIlxcdTIyMjVcIixcbiAgXCJTaG9ydFJpZ2h0QXJyb3dcIjpcIlxcdTIxOTJcIixcbiAgXCJTaG9ydFVwQXJyb3dcIjpcIlxcdTIxOTFcIixcbiAgXCJzaHlcIjpcIlxcdTAwQURcIixcbiAgXCJTaWdtYVwiOlwiXFx1MDNBM1wiLFxuICBcInNpZ21hXCI6XCJcXHUwM0MzXCIsXG4gIFwic2lnbWFmXCI6XCJcXHUwM0MyXCIsXG4gIFwic2lnbWF2XCI6XCJcXHUwM0MyXCIsXG4gIFwic2ltXCI6XCJcXHUyMjNDXCIsXG4gIFwic2ltZG90XCI6XCJcXHUyQTZBXCIsXG4gIFwic2ltZVwiOlwiXFx1MjI0M1wiLFxuICBcInNpbWVxXCI6XCJcXHUyMjQzXCIsXG4gIFwic2ltZ1wiOlwiXFx1MkE5RVwiLFxuICBcInNpbWdFXCI6XCJcXHUyQUEwXCIsXG4gIFwic2ltbFwiOlwiXFx1MkE5RFwiLFxuICBcInNpbWxFXCI6XCJcXHUyQTlGXCIsXG4gIFwic2ltbmVcIjpcIlxcdTIyNDZcIixcbiAgXCJzaW1wbHVzXCI6XCJcXHUyQTI0XCIsXG4gIFwic2ltcmFyclwiOlwiXFx1Mjk3MlwiLFxuICBcInNsYXJyXCI6XCJcXHUyMTkwXCIsXG4gIFwiU21hbGxDaXJjbGVcIjpcIlxcdTIyMThcIixcbiAgXCJzbWFsbHNldG1pbnVzXCI6XCJcXHUyMjE2XCIsXG4gIFwic21hc2hwXCI6XCJcXHUyQTMzXCIsXG4gIFwic21lcGFyc2xcIjpcIlxcdTI5RTRcIixcbiAgXCJzbWlkXCI6XCJcXHUyMjIzXCIsXG4gIFwic21pbGVcIjpcIlxcdTIzMjNcIixcbiAgXCJzbXRcIjpcIlxcdTJBQUFcIixcbiAgXCJzbXRlXCI6XCJcXHUyQUFDXCIsXG4gIFwic210ZXNcIjpcIlxcdTJBQUNcXHVGRTAwXCIsXG4gIFwiU09GVGN5XCI6XCJcXHUwNDJDXCIsXG4gIFwic29mdGN5XCI6XCJcXHUwNDRDXCIsXG4gIFwic29sXCI6XCJcXHUwMDJGXCIsXG4gIFwic29sYlwiOlwiXFx1MjlDNFwiLFxuICBcInNvbGJhclwiOlwiXFx1MjMzRlwiLFxuICBcIlNvcGZcIjpcIlxcdUQ4MzVcXHVERDRBXCIsXG4gIFwic29wZlwiOlwiXFx1RDgzNVxcdURENjRcIixcbiAgXCJzcGFkZXNcIjpcIlxcdTI2NjBcIixcbiAgXCJzcGFkZXN1aXRcIjpcIlxcdTI2NjBcIixcbiAgXCJzcGFyXCI6XCJcXHUyMjI1XCIsXG4gIFwic3FjYXBcIjpcIlxcdTIyOTNcIixcbiAgXCJzcWNhcHNcIjpcIlxcdTIyOTNcXHVGRTAwXCIsXG4gIFwic3FjdXBcIjpcIlxcdTIyOTRcIixcbiAgXCJzcWN1cHNcIjpcIlxcdTIyOTRcXHVGRTAwXCIsXG4gIFwiU3FydFwiOlwiXFx1MjIxQVwiLFxuICBcInNxc3ViXCI6XCJcXHUyMjhGXCIsXG4gIFwic3FzdWJlXCI6XCJcXHUyMjkxXCIsXG4gIFwic3FzdWJzZXRcIjpcIlxcdTIyOEZcIixcbiAgXCJzcXN1YnNldGVxXCI6XCJcXHUyMjkxXCIsXG4gIFwic3FzdXBcIjpcIlxcdTIyOTBcIixcbiAgXCJzcXN1cGVcIjpcIlxcdTIyOTJcIixcbiAgXCJzcXN1cHNldFwiOlwiXFx1MjI5MFwiLFxuICBcInNxc3Vwc2V0ZXFcIjpcIlxcdTIyOTJcIixcbiAgXCJzcXVcIjpcIlxcdTI1QTFcIixcbiAgXCJTcXVhcmVcIjpcIlxcdTI1QTFcIixcbiAgXCJzcXVhcmVcIjpcIlxcdTI1QTFcIixcbiAgXCJTcXVhcmVJbnRlcnNlY3Rpb25cIjpcIlxcdTIyOTNcIixcbiAgXCJTcXVhcmVTdWJzZXRcIjpcIlxcdTIyOEZcIixcbiAgXCJTcXVhcmVTdWJzZXRFcXVhbFwiOlwiXFx1MjI5MVwiLFxuICBcIlNxdWFyZVN1cGVyc2V0XCI6XCJcXHUyMjkwXCIsXG4gIFwiU3F1YXJlU3VwZXJzZXRFcXVhbFwiOlwiXFx1MjI5MlwiLFxuICBcIlNxdWFyZVVuaW9uXCI6XCJcXHUyMjk0XCIsXG4gIFwic3F1YXJmXCI6XCJcXHUyNUFBXCIsXG4gIFwic3F1ZlwiOlwiXFx1MjVBQVwiLFxuICBcInNyYXJyXCI6XCJcXHUyMTkyXCIsXG4gIFwiU3NjclwiOlwiXFx1RDgzNVxcdURDQUVcIixcbiAgXCJzc2NyXCI6XCJcXHVEODM1XFx1RENDOFwiLFxuICBcInNzZXRtblwiOlwiXFx1MjIxNlwiLFxuICBcInNzbWlsZVwiOlwiXFx1MjMyM1wiLFxuICBcInNzdGFyZlwiOlwiXFx1MjJDNlwiLFxuICBcIlN0YXJcIjpcIlxcdTIyQzZcIixcbiAgXCJzdGFyXCI6XCJcXHUyNjA2XCIsXG4gIFwic3RhcmZcIjpcIlxcdTI2MDVcIixcbiAgXCJzdHJhaWdodGVwc2lsb25cIjpcIlxcdTAzRjVcIixcbiAgXCJzdHJhaWdodHBoaVwiOlwiXFx1MDNENVwiLFxuICBcInN0cm5zXCI6XCJcXHUwMEFGXCIsXG4gIFwiU3ViXCI6XCJcXHUyMkQwXCIsXG4gIFwic3ViXCI6XCJcXHUyMjgyXCIsXG4gIFwic3ViZG90XCI6XCJcXHUyQUJEXCIsXG4gIFwic3ViRVwiOlwiXFx1MkFDNVwiLFxuICBcInN1YmVcIjpcIlxcdTIyODZcIixcbiAgXCJzdWJlZG90XCI6XCJcXHUyQUMzXCIsXG4gIFwic3VibXVsdFwiOlwiXFx1MkFDMVwiLFxuICBcInN1Ym5FXCI6XCJcXHUyQUNCXCIsXG4gIFwic3VibmVcIjpcIlxcdTIyOEFcIixcbiAgXCJzdWJwbHVzXCI6XCJcXHUyQUJGXCIsXG4gIFwic3VicmFyclwiOlwiXFx1Mjk3OVwiLFxuICBcIlN1YnNldFwiOlwiXFx1MjJEMFwiLFxuICBcInN1YnNldFwiOlwiXFx1MjI4MlwiLFxuICBcInN1YnNldGVxXCI6XCJcXHUyMjg2XCIsXG4gIFwic3Vic2V0ZXFxXCI6XCJcXHUyQUM1XCIsXG4gIFwiU3Vic2V0RXF1YWxcIjpcIlxcdTIyODZcIixcbiAgXCJzdWJzZXRuZXFcIjpcIlxcdTIyOEFcIixcbiAgXCJzdWJzZXRuZXFxXCI6XCJcXHUyQUNCXCIsXG4gIFwic3Vic2ltXCI6XCJcXHUyQUM3XCIsXG4gIFwic3Vic3ViXCI6XCJcXHUyQUQ1XCIsXG4gIFwic3Vic3VwXCI6XCJcXHUyQUQzXCIsXG4gIFwic3VjY1wiOlwiXFx1MjI3QlwiLFxuICBcInN1Y2NhcHByb3hcIjpcIlxcdTJBQjhcIixcbiAgXCJzdWNjY3VybHllcVwiOlwiXFx1MjI3RFwiLFxuICBcIlN1Y2NlZWRzXCI6XCJcXHUyMjdCXCIsXG4gIFwiU3VjY2VlZHNFcXVhbFwiOlwiXFx1MkFCMFwiLFxuICBcIlN1Y2NlZWRzU2xhbnRFcXVhbFwiOlwiXFx1MjI3RFwiLFxuICBcIlN1Y2NlZWRzVGlsZGVcIjpcIlxcdTIyN0ZcIixcbiAgXCJzdWNjZXFcIjpcIlxcdTJBQjBcIixcbiAgXCJzdWNjbmFwcHJveFwiOlwiXFx1MkFCQVwiLFxuICBcInN1Y2NuZXFxXCI6XCJcXHUyQUI2XCIsXG4gIFwic3VjY25zaW1cIjpcIlxcdTIyRTlcIixcbiAgXCJzdWNjc2ltXCI6XCJcXHUyMjdGXCIsXG4gIFwiU3VjaFRoYXRcIjpcIlxcdTIyMEJcIixcbiAgXCJTdW1cIjpcIlxcdTIyMTFcIixcbiAgXCJzdW1cIjpcIlxcdTIyMTFcIixcbiAgXCJzdW5nXCI6XCJcXHUyNjZBXCIsXG4gIFwiU3VwXCI6XCJcXHUyMkQxXCIsXG4gIFwic3VwXCI6XCJcXHUyMjgzXCIsXG4gIFwic3VwMVwiOlwiXFx1MDBCOVwiLFxuICBcInN1cDJcIjpcIlxcdTAwQjJcIixcbiAgXCJzdXAzXCI6XCJcXHUwMEIzXCIsXG4gIFwic3VwZG90XCI6XCJcXHUyQUJFXCIsXG4gIFwic3VwZHN1YlwiOlwiXFx1MkFEOFwiLFxuICBcInN1cEVcIjpcIlxcdTJBQzZcIixcbiAgXCJzdXBlXCI6XCJcXHUyMjg3XCIsXG4gIFwic3VwZWRvdFwiOlwiXFx1MkFDNFwiLFxuICBcIlN1cGVyc2V0XCI6XCJcXHUyMjgzXCIsXG4gIFwiU3VwZXJzZXRFcXVhbFwiOlwiXFx1MjI4N1wiLFxuICBcInN1cGhzb2xcIjpcIlxcdTI3QzlcIixcbiAgXCJzdXBoc3ViXCI6XCJcXHUyQUQ3XCIsXG4gIFwic3VwbGFyclwiOlwiXFx1Mjk3QlwiLFxuICBcInN1cG11bHRcIjpcIlxcdTJBQzJcIixcbiAgXCJzdXBuRVwiOlwiXFx1MkFDQ1wiLFxuICBcInN1cG5lXCI6XCJcXHUyMjhCXCIsXG4gIFwic3VwcGx1c1wiOlwiXFx1MkFDMFwiLFxuICBcIlN1cHNldFwiOlwiXFx1MjJEMVwiLFxuICBcInN1cHNldFwiOlwiXFx1MjI4M1wiLFxuICBcInN1cHNldGVxXCI6XCJcXHUyMjg3XCIsXG4gIFwic3Vwc2V0ZXFxXCI6XCJcXHUyQUM2XCIsXG4gIFwic3Vwc2V0bmVxXCI6XCJcXHUyMjhCXCIsXG4gIFwic3Vwc2V0bmVxcVwiOlwiXFx1MkFDQ1wiLFxuICBcInN1cHNpbVwiOlwiXFx1MkFDOFwiLFxuICBcInN1cHN1YlwiOlwiXFx1MkFENFwiLFxuICBcInN1cHN1cFwiOlwiXFx1MkFENlwiLFxuICBcInN3YXJoa1wiOlwiXFx1MjkyNlwiLFxuICBcInN3QXJyXCI6XCJcXHUyMUQ5XCIsXG4gIFwic3dhcnJcIjpcIlxcdTIxOTlcIixcbiAgXCJzd2Fycm93XCI6XCJcXHUyMTk5XCIsXG4gIFwic3dud2FyXCI6XCJcXHUyOTJBXCIsXG4gIFwic3psaWdcIjpcIlxcdTAwREZcIixcbiAgXCJUYWJcIjpcIlxcdTAwMDlcIixcbiAgXCJ0YXJnZXRcIjpcIlxcdTIzMTZcIixcbiAgXCJUYXVcIjpcIlxcdTAzQTRcIixcbiAgXCJ0YXVcIjpcIlxcdTAzQzRcIixcbiAgXCJ0YnJrXCI6XCJcXHUyM0I0XCIsXG4gIFwiVGNhcm9uXCI6XCJcXHUwMTY0XCIsXG4gIFwidGNhcm9uXCI6XCJcXHUwMTY1XCIsXG4gIFwiVGNlZGlsXCI6XCJcXHUwMTYyXCIsXG4gIFwidGNlZGlsXCI6XCJcXHUwMTYzXCIsXG4gIFwiVGN5XCI6XCJcXHUwNDIyXCIsXG4gIFwidGN5XCI6XCJcXHUwNDQyXCIsXG4gIFwidGRvdFwiOlwiXFx1MjBEQlwiLFxuICBcInRlbHJlY1wiOlwiXFx1MjMxNVwiLFxuICBcIlRmclwiOlwiXFx1RDgzNVxcdUREMTdcIixcbiAgXCJ0ZnJcIjpcIlxcdUQ4MzVcXHVERDMxXCIsXG4gIFwidGhlcmU0XCI6XCJcXHUyMjM0XCIsXG4gIFwiVGhlcmVmb3JlXCI6XCJcXHUyMjM0XCIsXG4gIFwidGhlcmVmb3JlXCI6XCJcXHUyMjM0XCIsXG4gIFwiVGhldGFcIjpcIlxcdTAzOThcIixcbiAgXCJ0aGV0YVwiOlwiXFx1MDNCOFwiLFxuICBcInRoZXRhc3ltXCI6XCJcXHUwM0QxXCIsXG4gIFwidGhldGF2XCI6XCJcXHUwM0QxXCIsXG4gIFwidGhpY2thcHByb3hcIjpcIlxcdTIyNDhcIixcbiAgXCJ0aGlja3NpbVwiOlwiXFx1MjIzQ1wiLFxuICBcIlRoaWNrU3BhY2VcIjpcIlxcdTIwNUZcXHUyMDBBXCIsXG4gIFwidGhpbnNwXCI6XCJcXHUyMDA5XCIsXG4gIFwiVGhpblNwYWNlXCI6XCJcXHUyMDA5XCIsXG4gIFwidGhrYXBcIjpcIlxcdTIyNDhcIixcbiAgXCJ0aGtzaW1cIjpcIlxcdTIyM0NcIixcbiAgXCJUSE9STlwiOlwiXFx1MDBERVwiLFxuICBcInRob3JuXCI6XCJcXHUwMEZFXCIsXG4gIFwiVGlsZGVcIjpcIlxcdTIyM0NcIixcbiAgXCJ0aWxkZVwiOlwiXFx1MDJEQ1wiLFxuICBcIlRpbGRlRXF1YWxcIjpcIlxcdTIyNDNcIixcbiAgXCJUaWxkZUZ1bGxFcXVhbFwiOlwiXFx1MjI0NVwiLFxuICBcIlRpbGRlVGlsZGVcIjpcIlxcdTIyNDhcIixcbiAgXCJ0aW1lc1wiOlwiXFx1MDBEN1wiLFxuICBcInRpbWVzYlwiOlwiXFx1MjJBMFwiLFxuICBcInRpbWVzYmFyXCI6XCJcXHUyQTMxXCIsXG4gIFwidGltZXNkXCI6XCJcXHUyQTMwXCIsXG4gIFwidGludFwiOlwiXFx1MjIyRFwiLFxuICBcInRvZWFcIjpcIlxcdTI5MjhcIixcbiAgXCJ0b3BcIjpcIlxcdTIyQTRcIixcbiAgXCJ0b3Bib3RcIjpcIlxcdTIzMzZcIixcbiAgXCJ0b3BjaXJcIjpcIlxcdTJBRjFcIixcbiAgXCJUb3BmXCI6XCJcXHVEODM1XFx1REQ0QlwiLFxuICBcInRvcGZcIjpcIlxcdUQ4MzVcXHVERDY1XCIsXG4gIFwidG9wZm9ya1wiOlwiXFx1MkFEQVwiLFxuICBcInRvc2FcIjpcIlxcdTI5MjlcIixcbiAgXCJ0cHJpbWVcIjpcIlxcdTIwMzRcIixcbiAgXCJUUkFERVwiOlwiXFx1MjEyMlwiLFxuICBcInRyYWRlXCI6XCJcXHUyMTIyXCIsXG4gIFwidHJpYW5nbGVcIjpcIlxcdTI1QjVcIixcbiAgXCJ0cmlhbmdsZWRvd25cIjpcIlxcdTI1QkZcIixcbiAgXCJ0cmlhbmdsZWxlZnRcIjpcIlxcdTI1QzNcIixcbiAgXCJ0cmlhbmdsZWxlZnRlcVwiOlwiXFx1MjJCNFwiLFxuICBcInRyaWFuZ2xlcVwiOlwiXFx1MjI1Q1wiLFxuICBcInRyaWFuZ2xlcmlnaHRcIjpcIlxcdTI1QjlcIixcbiAgXCJ0cmlhbmdsZXJpZ2h0ZXFcIjpcIlxcdTIyQjVcIixcbiAgXCJ0cmlkb3RcIjpcIlxcdTI1RUNcIixcbiAgXCJ0cmllXCI6XCJcXHUyMjVDXCIsXG4gIFwidHJpbWludXNcIjpcIlxcdTJBM0FcIixcbiAgXCJUcmlwbGVEb3RcIjpcIlxcdTIwREJcIixcbiAgXCJ0cmlwbHVzXCI6XCJcXHUyQTM5XCIsXG4gIFwidHJpc2JcIjpcIlxcdTI5Q0RcIixcbiAgXCJ0cml0aW1lXCI6XCJcXHUyQTNCXCIsXG4gIFwidHJwZXppdW1cIjpcIlxcdTIzRTJcIixcbiAgXCJUc2NyXCI6XCJcXHVEODM1XFx1RENBRlwiLFxuICBcInRzY3JcIjpcIlxcdUQ4MzVcXHVEQ0M5XCIsXG4gIFwiVFNjeVwiOlwiXFx1MDQyNlwiLFxuICBcInRzY3lcIjpcIlxcdTA0NDZcIixcbiAgXCJUU0hjeVwiOlwiXFx1MDQwQlwiLFxuICBcInRzaGN5XCI6XCJcXHUwNDVCXCIsXG4gIFwiVHN0cm9rXCI6XCJcXHUwMTY2XCIsXG4gIFwidHN0cm9rXCI6XCJcXHUwMTY3XCIsXG4gIFwidHdpeHRcIjpcIlxcdTIyNkNcIixcbiAgXCJ0d29oZWFkbGVmdGFycm93XCI6XCJcXHUyMTlFXCIsXG4gIFwidHdvaGVhZHJpZ2h0YXJyb3dcIjpcIlxcdTIxQTBcIixcbiAgXCJVYWN1dGVcIjpcIlxcdTAwREFcIixcbiAgXCJ1YWN1dGVcIjpcIlxcdTAwRkFcIixcbiAgXCJVYXJyXCI6XCJcXHUyMTlGXCIsXG4gIFwidUFyclwiOlwiXFx1MjFEMVwiLFxuICBcInVhcnJcIjpcIlxcdTIxOTFcIixcbiAgXCJVYXJyb2NpclwiOlwiXFx1Mjk0OVwiLFxuICBcIlVicmN5XCI6XCJcXHUwNDBFXCIsXG4gIFwidWJyY3lcIjpcIlxcdTA0NUVcIixcbiAgXCJVYnJldmVcIjpcIlxcdTAxNkNcIixcbiAgXCJ1YnJldmVcIjpcIlxcdTAxNkRcIixcbiAgXCJVY2lyY1wiOlwiXFx1MDBEQlwiLFxuICBcInVjaXJjXCI6XCJcXHUwMEZCXCIsXG4gIFwiVWN5XCI6XCJcXHUwNDIzXCIsXG4gIFwidWN5XCI6XCJcXHUwNDQzXCIsXG4gIFwidWRhcnJcIjpcIlxcdTIxQzVcIixcbiAgXCJVZGJsYWNcIjpcIlxcdTAxNzBcIixcbiAgXCJ1ZGJsYWNcIjpcIlxcdTAxNzFcIixcbiAgXCJ1ZGhhclwiOlwiXFx1Mjk2RVwiLFxuICBcInVmaXNodFwiOlwiXFx1Mjk3RVwiLFxuICBcIlVmclwiOlwiXFx1RDgzNVxcdUREMThcIixcbiAgXCJ1ZnJcIjpcIlxcdUQ4MzVcXHVERDMyXCIsXG4gIFwiVWdyYXZlXCI6XCJcXHUwMEQ5XCIsXG4gIFwidWdyYXZlXCI6XCJcXHUwMEY5XCIsXG4gIFwidUhhclwiOlwiXFx1Mjk2M1wiLFxuICBcInVoYXJsXCI6XCJcXHUyMUJGXCIsXG4gIFwidWhhcnJcIjpcIlxcdTIxQkVcIixcbiAgXCJ1aGJsa1wiOlwiXFx1MjU4MFwiLFxuICBcInVsY29yblwiOlwiXFx1MjMxQ1wiLFxuICBcInVsY29ybmVyXCI6XCJcXHUyMzFDXCIsXG4gIFwidWxjcm9wXCI6XCJcXHUyMzBGXCIsXG4gIFwidWx0cmlcIjpcIlxcdTI1RjhcIixcbiAgXCJVbWFjclwiOlwiXFx1MDE2QVwiLFxuICBcInVtYWNyXCI6XCJcXHUwMTZCXCIsXG4gIFwidW1sXCI6XCJcXHUwMEE4XCIsXG4gIFwiVW5kZXJCYXJcIjpcIlxcdTAwNUZcIixcbiAgXCJVbmRlckJyYWNlXCI6XCJcXHUyM0RGXCIsXG4gIFwiVW5kZXJCcmFja2V0XCI6XCJcXHUyM0I1XCIsXG4gIFwiVW5kZXJQYXJlbnRoZXNpc1wiOlwiXFx1MjNERFwiLFxuICBcIlVuaW9uXCI6XCJcXHUyMkMzXCIsXG4gIFwiVW5pb25QbHVzXCI6XCJcXHUyMjhFXCIsXG4gIFwiVW9nb25cIjpcIlxcdTAxNzJcIixcbiAgXCJ1b2dvblwiOlwiXFx1MDE3M1wiLFxuICBcIlVvcGZcIjpcIlxcdUQ4MzVcXHVERDRDXCIsXG4gIFwidW9wZlwiOlwiXFx1RDgzNVxcdURENjZcIixcbiAgXCJVcEFycm93XCI6XCJcXHUyMTkxXCIsXG4gIFwiVXBhcnJvd1wiOlwiXFx1MjFEMVwiLFxuICBcInVwYXJyb3dcIjpcIlxcdTIxOTFcIixcbiAgXCJVcEFycm93QmFyXCI6XCJcXHUyOTEyXCIsXG4gIFwiVXBBcnJvd0Rvd25BcnJvd1wiOlwiXFx1MjFDNVwiLFxuICBcIlVwRG93bkFycm93XCI6XCJcXHUyMTk1XCIsXG4gIFwiVXBkb3duYXJyb3dcIjpcIlxcdTIxRDVcIixcbiAgXCJ1cGRvd25hcnJvd1wiOlwiXFx1MjE5NVwiLFxuICBcIlVwRXF1aWxpYnJpdW1cIjpcIlxcdTI5NkVcIixcbiAgXCJ1cGhhcnBvb25sZWZ0XCI6XCJcXHUyMUJGXCIsXG4gIFwidXBoYXJwb29ucmlnaHRcIjpcIlxcdTIxQkVcIixcbiAgXCJ1cGx1c1wiOlwiXFx1MjI4RVwiLFxuICBcIlVwcGVyTGVmdEFycm93XCI6XCJcXHUyMTk2XCIsXG4gIFwiVXBwZXJSaWdodEFycm93XCI6XCJcXHUyMTk3XCIsXG4gIFwiVXBzaVwiOlwiXFx1MDNEMlwiLFxuICBcInVwc2lcIjpcIlxcdTAzQzVcIixcbiAgXCJ1cHNpaFwiOlwiXFx1MDNEMlwiLFxuICBcIlVwc2lsb25cIjpcIlxcdTAzQTVcIixcbiAgXCJ1cHNpbG9uXCI6XCJcXHUwM0M1XCIsXG4gIFwiVXBUZWVcIjpcIlxcdTIyQTVcIixcbiAgXCJVcFRlZUFycm93XCI6XCJcXHUyMUE1XCIsXG4gIFwidXB1cGFycm93c1wiOlwiXFx1MjFDOFwiLFxuICBcInVyY29yblwiOlwiXFx1MjMxRFwiLFxuICBcInVyY29ybmVyXCI6XCJcXHUyMzFEXCIsXG4gIFwidXJjcm9wXCI6XCJcXHUyMzBFXCIsXG4gIFwiVXJpbmdcIjpcIlxcdTAxNkVcIixcbiAgXCJ1cmluZ1wiOlwiXFx1MDE2RlwiLFxuICBcInVydHJpXCI6XCJcXHUyNUY5XCIsXG4gIFwiVXNjclwiOlwiXFx1RDgzNVxcdURDQjBcIixcbiAgXCJ1c2NyXCI6XCJcXHVEODM1XFx1RENDQVwiLFxuICBcInV0ZG90XCI6XCJcXHUyMkYwXCIsXG4gIFwiVXRpbGRlXCI6XCJcXHUwMTY4XCIsXG4gIFwidXRpbGRlXCI6XCJcXHUwMTY5XCIsXG4gIFwidXRyaVwiOlwiXFx1MjVCNVwiLFxuICBcInV0cmlmXCI6XCJcXHUyNUI0XCIsXG4gIFwidXVhcnJcIjpcIlxcdTIxQzhcIixcbiAgXCJVdW1sXCI6XCJcXHUwMERDXCIsXG4gIFwidXVtbFwiOlwiXFx1MDBGQ1wiLFxuICBcInV3YW5nbGVcIjpcIlxcdTI5QTdcIixcbiAgXCJ2YW5ncnRcIjpcIlxcdTI5OUNcIixcbiAgXCJ2YXJlcHNpbG9uXCI6XCJcXHUwM0Y1XCIsXG4gIFwidmFya2FwcGFcIjpcIlxcdTAzRjBcIixcbiAgXCJ2YXJub3RoaW5nXCI6XCJcXHUyMjA1XCIsXG4gIFwidmFycGhpXCI6XCJcXHUwM0Q1XCIsXG4gIFwidmFycGlcIjpcIlxcdTAzRDZcIixcbiAgXCJ2YXJwcm9wdG9cIjpcIlxcdTIyMURcIixcbiAgXCJ2QXJyXCI6XCJcXHUyMUQ1XCIsXG4gIFwidmFyclwiOlwiXFx1MjE5NVwiLFxuICBcInZhcnJob1wiOlwiXFx1MDNGMVwiLFxuICBcInZhcnNpZ21hXCI6XCJcXHUwM0MyXCIsXG4gIFwidmFyc3Vic2V0bmVxXCI6XCJcXHUyMjhBXFx1RkUwMFwiLFxuICBcInZhcnN1YnNldG5lcXFcIjpcIlxcdTJBQ0JcXHVGRTAwXCIsXG4gIFwidmFyc3Vwc2V0bmVxXCI6XCJcXHUyMjhCXFx1RkUwMFwiLFxuICBcInZhcnN1cHNldG5lcXFcIjpcIlxcdTJBQ0NcXHVGRTAwXCIsXG4gIFwidmFydGhldGFcIjpcIlxcdTAzRDFcIixcbiAgXCJ2YXJ0cmlhbmdsZWxlZnRcIjpcIlxcdTIyQjJcIixcbiAgXCJ2YXJ0cmlhbmdsZXJpZ2h0XCI6XCJcXHUyMkIzXCIsXG4gIFwiVmJhclwiOlwiXFx1MkFFQlwiLFxuICBcInZCYXJcIjpcIlxcdTJBRThcIixcbiAgXCJ2QmFydlwiOlwiXFx1MkFFOVwiLFxuICBcIlZjeVwiOlwiXFx1MDQxMlwiLFxuICBcInZjeVwiOlwiXFx1MDQzMlwiLFxuICBcIlZEYXNoXCI6XCJcXHUyMkFCXCIsXG4gIFwiVmRhc2hcIjpcIlxcdTIyQTlcIixcbiAgXCJ2RGFzaFwiOlwiXFx1MjJBOFwiLFxuICBcInZkYXNoXCI6XCJcXHUyMkEyXCIsXG4gIFwiVmRhc2hsXCI6XCJcXHUyQUU2XCIsXG4gIFwiVmVlXCI6XCJcXHUyMkMxXCIsXG4gIFwidmVlXCI6XCJcXHUyMjI4XCIsXG4gIFwidmVlYmFyXCI6XCJcXHUyMkJCXCIsXG4gIFwidmVlZXFcIjpcIlxcdTIyNUFcIixcbiAgXCJ2ZWxsaXBcIjpcIlxcdTIyRUVcIixcbiAgXCJWZXJiYXJcIjpcIlxcdTIwMTZcIixcbiAgXCJ2ZXJiYXJcIjpcIlxcdTAwN0NcIixcbiAgXCJWZXJ0XCI6XCJcXHUyMDE2XCIsXG4gIFwidmVydFwiOlwiXFx1MDA3Q1wiLFxuICBcIlZlcnRpY2FsQmFyXCI6XCJcXHUyMjIzXCIsXG4gIFwiVmVydGljYWxMaW5lXCI6XCJcXHUwMDdDXCIsXG4gIFwiVmVydGljYWxTZXBhcmF0b3JcIjpcIlxcdTI3NThcIixcbiAgXCJWZXJ0aWNhbFRpbGRlXCI6XCJcXHUyMjQwXCIsXG4gIFwiVmVyeVRoaW5TcGFjZVwiOlwiXFx1MjAwQVwiLFxuICBcIlZmclwiOlwiXFx1RDgzNVxcdUREMTlcIixcbiAgXCJ2ZnJcIjpcIlxcdUQ4MzVcXHVERDMzXCIsXG4gIFwidmx0cmlcIjpcIlxcdTIyQjJcIixcbiAgXCJ2bnN1YlwiOlwiXFx1MjI4MlxcdTIwRDJcIixcbiAgXCJ2bnN1cFwiOlwiXFx1MjI4M1xcdTIwRDJcIixcbiAgXCJWb3BmXCI6XCJcXHVEODM1XFx1REQ0RFwiLFxuICBcInZvcGZcIjpcIlxcdUQ4MzVcXHVERDY3XCIsXG4gIFwidnByb3BcIjpcIlxcdTIyMURcIixcbiAgXCJ2cnRyaVwiOlwiXFx1MjJCM1wiLFxuICBcIlZzY3JcIjpcIlxcdUQ4MzVcXHVEQ0IxXCIsXG4gIFwidnNjclwiOlwiXFx1RDgzNVxcdURDQ0JcIixcbiAgXCJ2c3VibkVcIjpcIlxcdTJBQ0JcXHVGRTAwXCIsXG4gIFwidnN1Ym5lXCI6XCJcXHUyMjhBXFx1RkUwMFwiLFxuICBcInZzdXBuRVwiOlwiXFx1MkFDQ1xcdUZFMDBcIixcbiAgXCJ2c3VwbmVcIjpcIlxcdTIyOEJcXHVGRTAwXCIsXG4gIFwiVnZkYXNoXCI6XCJcXHUyMkFBXCIsXG4gIFwidnppZ3phZ1wiOlwiXFx1Mjk5QVwiLFxuICBcIldjaXJjXCI6XCJcXHUwMTc0XCIsXG4gIFwid2NpcmNcIjpcIlxcdTAxNzVcIixcbiAgXCJ3ZWRiYXJcIjpcIlxcdTJBNUZcIixcbiAgXCJXZWRnZVwiOlwiXFx1MjJDMFwiLFxuICBcIndlZGdlXCI6XCJcXHUyMjI3XCIsXG4gIFwid2VkZ2VxXCI6XCJcXHUyMjU5XCIsXG4gIFwid2VpZXJwXCI6XCJcXHUyMTE4XCIsXG4gIFwiV2ZyXCI6XCJcXHVEODM1XFx1REQxQVwiLFxuICBcIndmclwiOlwiXFx1RDgzNVxcdUREMzRcIixcbiAgXCJXb3BmXCI6XCJcXHVEODM1XFx1REQ0RVwiLFxuICBcIndvcGZcIjpcIlxcdUQ4MzVcXHVERDY4XCIsXG4gIFwid3BcIjpcIlxcdTIxMThcIixcbiAgXCJ3clwiOlwiXFx1MjI0MFwiLFxuICBcIndyZWF0aFwiOlwiXFx1MjI0MFwiLFxuICBcIldzY3JcIjpcIlxcdUQ4MzVcXHVEQ0IyXCIsXG4gIFwid3NjclwiOlwiXFx1RDgzNVxcdURDQ0NcIixcbiAgXCJ4Y2FwXCI6XCJcXHUyMkMyXCIsXG4gIFwieGNpcmNcIjpcIlxcdTI1RUZcIixcbiAgXCJ4Y3VwXCI6XCJcXHUyMkMzXCIsXG4gIFwieGR0cmlcIjpcIlxcdTI1QkRcIixcbiAgXCJYZnJcIjpcIlxcdUQ4MzVcXHVERDFCXCIsXG4gIFwieGZyXCI6XCJcXHVEODM1XFx1REQzNVwiLFxuICBcInhoQXJyXCI6XCJcXHUyN0ZBXCIsXG4gIFwieGhhcnJcIjpcIlxcdTI3RjdcIixcbiAgXCJYaVwiOlwiXFx1MDM5RVwiLFxuICBcInhpXCI6XCJcXHUwM0JFXCIsXG4gIFwieGxBcnJcIjpcIlxcdTI3RjhcIixcbiAgXCJ4bGFyclwiOlwiXFx1MjdGNVwiLFxuICBcInhtYXBcIjpcIlxcdTI3RkNcIixcbiAgXCJ4bmlzXCI6XCJcXHUyMkZCXCIsXG4gIFwieG9kb3RcIjpcIlxcdTJBMDBcIixcbiAgXCJYb3BmXCI6XCJcXHVEODM1XFx1REQ0RlwiLFxuICBcInhvcGZcIjpcIlxcdUQ4MzVcXHVERDY5XCIsXG4gIFwieG9wbHVzXCI6XCJcXHUyQTAxXCIsXG4gIFwieG90aW1lXCI6XCJcXHUyQTAyXCIsXG4gIFwieHJBcnJcIjpcIlxcdTI3RjlcIixcbiAgXCJ4cmFyclwiOlwiXFx1MjdGNlwiLFxuICBcIlhzY3JcIjpcIlxcdUQ4MzVcXHVEQ0IzXCIsXG4gIFwieHNjclwiOlwiXFx1RDgzNVxcdURDQ0RcIixcbiAgXCJ4c3FjdXBcIjpcIlxcdTJBMDZcIixcbiAgXCJ4dXBsdXNcIjpcIlxcdTJBMDRcIixcbiAgXCJ4dXRyaVwiOlwiXFx1MjVCM1wiLFxuICBcInh2ZWVcIjpcIlxcdTIyQzFcIixcbiAgXCJ4d2VkZ2VcIjpcIlxcdTIyQzBcIixcbiAgXCJZYWN1dGVcIjpcIlxcdTAwRERcIixcbiAgXCJ5YWN1dGVcIjpcIlxcdTAwRkRcIixcbiAgXCJZQWN5XCI6XCJcXHUwNDJGXCIsXG4gIFwieWFjeVwiOlwiXFx1MDQ0RlwiLFxuICBcIlljaXJjXCI6XCJcXHUwMTc2XCIsXG4gIFwieWNpcmNcIjpcIlxcdTAxNzdcIixcbiAgXCJZY3lcIjpcIlxcdTA0MkJcIixcbiAgXCJ5Y3lcIjpcIlxcdTA0NEJcIixcbiAgXCJ5ZW5cIjpcIlxcdTAwQTVcIixcbiAgXCJZZnJcIjpcIlxcdUQ4MzVcXHVERDFDXCIsXG4gIFwieWZyXCI6XCJcXHVEODM1XFx1REQzNlwiLFxuICBcIllJY3lcIjpcIlxcdTA0MDdcIixcbiAgXCJ5aWN5XCI6XCJcXHUwNDU3XCIsXG4gIFwiWW9wZlwiOlwiXFx1RDgzNVxcdURENTBcIixcbiAgXCJ5b3BmXCI6XCJcXHVEODM1XFx1REQ2QVwiLFxuICBcIllzY3JcIjpcIlxcdUQ4MzVcXHVEQ0I0XCIsXG4gIFwieXNjclwiOlwiXFx1RDgzNVxcdURDQ0VcIixcbiAgXCJZVWN5XCI6XCJcXHUwNDJFXCIsXG4gIFwieXVjeVwiOlwiXFx1MDQ0RVwiLFxuICBcIll1bWxcIjpcIlxcdTAxNzhcIixcbiAgXCJ5dW1sXCI6XCJcXHUwMEZGXCIsXG4gIFwiWmFjdXRlXCI6XCJcXHUwMTc5XCIsXG4gIFwiemFjdXRlXCI6XCJcXHUwMTdBXCIsXG4gIFwiWmNhcm9uXCI6XCJcXHUwMTdEXCIsXG4gIFwiemNhcm9uXCI6XCJcXHUwMTdFXCIsXG4gIFwiWmN5XCI6XCJcXHUwNDE3XCIsXG4gIFwiemN5XCI6XCJcXHUwNDM3XCIsXG4gIFwiWmRvdFwiOlwiXFx1MDE3QlwiLFxuICBcInpkb3RcIjpcIlxcdTAxN0NcIixcbiAgXCJ6ZWV0cmZcIjpcIlxcdTIxMjhcIixcbiAgXCJaZXJvV2lkdGhTcGFjZVwiOlwiXFx1MjAwQlwiLFxuICBcIlpldGFcIjpcIlxcdTAzOTZcIixcbiAgXCJ6ZXRhXCI6XCJcXHUwM0I2XCIsXG4gIFwiWmZyXCI6XCJcXHUyMTI4XCIsXG4gIFwiemZyXCI6XCJcXHVEODM1XFx1REQzN1wiLFxuICBcIlpIY3lcIjpcIlxcdTA0MTZcIixcbiAgXCJ6aGN5XCI6XCJcXHUwNDM2XCIsXG4gIFwiemlncmFyclwiOlwiXFx1MjFERFwiLFxuICBcIlpvcGZcIjpcIlxcdTIxMjRcIixcbiAgXCJ6b3BmXCI6XCJcXHVEODM1XFx1REQ2QlwiLFxuICBcIlpzY3JcIjpcIlxcdUQ4MzVcXHVEQ0I1XCIsXG4gIFwienNjclwiOlwiXFx1RDgzNVxcdURDQ0ZcIixcbiAgXCJ6d2pcIjpcIlxcdTIwMERcIixcbiAgXCJ6d25qXCI6XCJcXHUyMDBDXCJcbn07XG4iLCIvLyBMaXN0IG9mIHZhbGlkIGh0bWwgYmxvY2tzIG5hbWVzLCBhY2NvcnRpbmcgdG8gY29tbW9ubWFyayBzcGVjXG4vLyBodHRwOi8vamdtLmdpdGh1Yi5pby9Db21tb25NYXJrL3NwZWMuaHRtbCNodG1sLWJsb2Nrc1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBodG1sX2Jsb2NrcyA9IHt9O1xuXG5bXG4gICdhcnRpY2xlJyxcbiAgJ2FzaWRlJyxcbiAgJ2J1dHRvbicsXG4gICdibG9ja3F1b3RlJyxcbiAgJ2JvZHknLFxuICAnY2FudmFzJyxcbiAgJ2NhcHRpb24nLFxuICAnY29sJyxcbiAgJ2NvbGdyb3VwJyxcbiAgJ2RkJyxcbiAgJ2RpdicsXG4gICdkbCcsXG4gICdkdCcsXG4gICdlbWJlZCcsXG4gICdmaWVsZHNldCcsXG4gICdmaWdjYXB0aW9uJyxcbiAgJ2ZpZ3VyZScsXG4gICdmb290ZXInLFxuICAnZm9ybScsXG4gICdoMScsXG4gICdoMicsXG4gICdoMycsXG4gICdoNCcsXG4gICdoNScsXG4gICdoNicsXG4gICdoZWFkZXInLFxuICAnaGdyb3VwJyxcbiAgJ2hyJyxcbiAgJ2lmcmFtZScsXG4gICdsaScsXG4gICdtYXAnLFxuICAnb2JqZWN0JyxcbiAgJ29sJyxcbiAgJ291dHB1dCcsXG4gICdwJyxcbiAgJ3ByZScsXG4gICdwcm9ncmVzcycsXG4gICdzY3JpcHQnLFxuICAnc2VjdGlvbicsXG4gICdzdHlsZScsXG4gICd0YWJsZScsXG4gICd0Ym9keScsXG4gICd0ZCcsXG4gICd0ZXh0YXJlYScsXG4gICd0Zm9vdCcsXG4gICd0aCcsXG4gICd0cicsXG4gICd0aGVhZCcsXG4gICd1bCcsXG4gICd2aWRlbydcbl0uZm9yRWFjaChmdW5jdGlvbiAobmFtZSkgeyBodG1sX2Jsb2Nrc1tuYW1lXSA9IHRydWU7IH0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gaHRtbF9ibG9ja3M7XG4iLCIvLyBSZWdleHBzIHRvIG1hdGNoIGh0bWwgZWxlbWVudHNcblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXR0cl9uYW1lICAgICA9ICdbYS16QS1aXzpdW2EtekEtWjAtOTouXy1dKic7XG5cbnZhciB1bnF1b3RlZCAgICAgID0gJ1teXCJcXCc9PD5gXFxcXHgwMC1cXFxceDIwXSsnO1xudmFyIHNpbmdsZV9xdW90ZWQgPSBcIidbXiddKidcIjtcbnZhciBkb3VibGVfcXVvdGVkID0gJ1wiW15cIl0qXCInO1xuXG52YXIgYXR0cl92YWx1ZSAgPSAnKD86JyArIHVucXVvdGVkICsgJ3wnICsgc2luZ2xlX3F1b3RlZCArICd8JyArIGRvdWJsZV9xdW90ZWQgKyAnKSc7XG5cbnZhciBhdHRyaWJ1dGUgICA9ICcoPzpcXFxccysnICsgYXR0cl9uYW1lICsgJyg/OlxcXFxzKj1cXFxccyonICsgYXR0cl92YWx1ZSArICcpPyknO1xuXG52YXIgb3Blbl90YWcgICAgPSAnPFtBLVphLXpdW0EtWmEtejAtOVxcXFwtXSonICsgYXR0cmlidXRlICsgJypcXFxccypcXFxcLz8+JztcblxudmFyIGNsb3NlX3RhZyAgID0gJzxcXFxcL1tBLVphLXpdW0EtWmEtejAtOVxcXFwtXSpcXFxccyo+JztcbnZhciBjb21tZW50ICAgICA9ICc8IS0tLS0+fDwhLS0oPzotP1tePi1dKSg/Oi0/W14tXSkqLS0+JztcbnZhciBwcm9jZXNzaW5nICA9ICc8Wz9dLio/Wz9dPic7XG52YXIgZGVjbGFyYXRpb24gPSAnPCFbQS1aXStcXFxccytbXj5dKj4nO1xudmFyIGNkYXRhICAgICAgID0gJzwhXFxcXFtDREFUQVxcXFxbW1xcXFxzXFxcXFNdKj9cXFxcXVxcXFxdPic7XG5cbnZhciBIVE1MX1RBR19SRSA9IG5ldyBSZWdFeHAoJ14oPzonICsgb3Blbl90YWcgKyAnfCcgKyBjbG9zZV90YWcgKyAnfCcgKyBjb21tZW50ICtcbiAgICAgICAgICAgICAgICAgICAgICAgICd8JyArIHByb2Nlc3NpbmcgKyAnfCcgKyBkZWNsYXJhdGlvbiArICd8JyArIGNkYXRhICsgJyknKTtcblxubW9kdWxlLmV4cG9ydHMuSFRNTF9UQUdfUkUgPSBIVE1MX1RBR19SRTtcbiIsIi8vIExpc3Qgb2YgdmFsaWQgdXJsIHNjaGVtYXMsIGFjY29ydGluZyB0byBjb21tb25tYXJrIHNwZWNcbi8vIGh0dHA6Ly9qZ20uZ2l0aHViLmlvL0NvbW1vbk1hcmsvc3BlYy5odG1sI2F1dG9saW5rc1xuXG4ndXNlIHN0cmljdCc7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBbXG4gICdjb2FwJyxcbiAgJ2RvaScsXG4gICdqYXZhc2NyaXB0JyxcbiAgJ2FhYScsXG4gICdhYWFzJyxcbiAgJ2Fib3V0JyxcbiAgJ2FjYXAnLFxuICAnY2FwJyxcbiAgJ2NpZCcsXG4gICdjcmlkJyxcbiAgJ2RhdGEnLFxuICAnZGF2JyxcbiAgJ2RpY3QnLFxuICAnZG5zJyxcbiAgJ2ZpbGUnLFxuICAnZnRwJyxcbiAgJ2dlbycsXG4gICdnbycsXG4gICdnb3BoZXInLFxuICAnaDMyMycsXG4gICdodHRwJyxcbiAgJ2h0dHBzJyxcbiAgJ2lheCcsXG4gICdpY2FwJyxcbiAgJ2ltJyxcbiAgJ2ltYXAnLFxuICAnaW5mbycsXG4gICdpcHAnLFxuICAnaXJpcycsXG4gICdpcmlzLmJlZXAnLFxuICAnaXJpcy54cGMnLFxuICAnaXJpcy54cGNzJyxcbiAgJ2lyaXMubHd6JyxcbiAgJ2xkYXAnLFxuICAnbWFpbHRvJyxcbiAgJ21pZCcsXG4gICdtc3JwJyxcbiAgJ21zcnBzJyxcbiAgJ210cXAnLFxuICAnbXVwZGF0ZScsXG4gICduZXdzJyxcbiAgJ25mcycsXG4gICduaScsXG4gICduaWgnLFxuICAnbm50cCcsXG4gICdvcGFxdWVsb2NrdG9rZW4nLFxuICAncG9wJyxcbiAgJ3ByZXMnLFxuICAncnRzcCcsXG4gICdzZXJ2aWNlJyxcbiAgJ3Nlc3Npb24nLFxuICAnc2h0dHAnLFxuICAnc2lldmUnLFxuICAnc2lwJyxcbiAgJ3NpcHMnLFxuICAnc21zJyxcbiAgJ3NubXAnLFxuICAnc29hcC5iZWVwJyxcbiAgJ3NvYXAuYmVlcHMnLFxuICAndGFnJyxcbiAgJ3RlbCcsXG4gICd0ZWxuZXQnLFxuICAndGZ0cCcsXG4gICd0aGlzbWVzc2FnZScsXG4gICd0bjMyNzAnLFxuICAndGlwJyxcbiAgJ3R2JyxcbiAgJ3VybicsXG4gICd2ZW1taScsXG4gICd3cycsXG4gICd3c3MnLFxuICAneGNvbicsXG4gICd4Y29uLXVzZXJpZCcsXG4gICd4bWxycGMuYmVlcCcsXG4gICd4bWxycGMuYmVlcHMnLFxuICAneG1wcCcsXG4gICd6MzkuNTByJyxcbiAgJ3ozOS41MHMnLFxuICAnYWRpdW14dHJhJyxcbiAgJ2FmcCcsXG4gICdhZnMnLFxuICAnYWltJyxcbiAgJ2FwdCcsXG4gICdhdHRhY2htZW50JyxcbiAgJ2F3JyxcbiAgJ2Jlc2hhcmUnLFxuICAnYml0Y29pbicsXG4gICdib2xvJyxcbiAgJ2NhbGx0bycsXG4gICdjaHJvbWUnLFxuICAnY2hyb21lLWV4dGVuc2lvbicsXG4gICdjb20tZXZlbnRicml0ZS1hdHRlbmRlZScsXG4gICdjb250ZW50JyxcbiAgJ2N2cycsXG4gICdkbG5hLXBsYXlzaW5nbGUnLFxuICAnZGxuYS1wbGF5Y29udGFpbmVyJyxcbiAgJ2R0bicsXG4gICdkdmInLFxuICAnZWQyaycsXG4gICdmYWNldGltZScsXG4gICdmZWVkJyxcbiAgJ2ZpbmdlcicsXG4gICdmaXNoJyxcbiAgJ2dnJyxcbiAgJ2dpdCcsXG4gICdnaXptb3Byb2plY3QnLFxuICAnZ3RhbGsnLFxuICAnaGNwJyxcbiAgJ2ljb24nLFxuICAnaXBuJyxcbiAgJ2lyYycsXG4gICdpcmM2JyxcbiAgJ2lyY3MnLFxuICAnaXRtcycsXG4gICdqYXInLFxuICAnam1zJyxcbiAgJ2tleXBhcmMnLFxuICAnbGFzdGZtJyxcbiAgJ2xkYXBzJyxcbiAgJ21hZ25ldCcsXG4gICdtYXBzJyxcbiAgJ21hcmtldCcsXG4gICdtZXNzYWdlJyxcbiAgJ21tcycsXG4gICdtcy1oZWxwJyxcbiAgJ21zbmltJyxcbiAgJ211bWJsZScsXG4gICdtdm4nLFxuICAnbm90ZXMnLFxuICAnb2lkJyxcbiAgJ3BhbG0nLFxuICAncGFwYXJhenppJyxcbiAgJ3BsYXRmb3JtJyxcbiAgJ3Byb3h5JyxcbiAgJ3BzeWMnLFxuICAncXVlcnknLFxuICAncmVzJyxcbiAgJ3Jlc291cmNlJyxcbiAgJ3JtaScsXG4gICdyc3luYycsXG4gICdydG1wJyxcbiAgJ3NlY29uZGxpZmUnLFxuICAnc2Z0cCcsXG4gICdzZ24nLFxuICAnc2t5cGUnLFxuICAnc21iJyxcbiAgJ3NvbGRhdCcsXG4gICdzcG90aWZ5JyxcbiAgJ3NzaCcsXG4gICdzdGVhbScsXG4gICdzdm4nLFxuICAndGVhbXNwZWFrJyxcbiAgJ3RoaW5ncycsXG4gICd1ZHAnLFxuICAndW5yZWFsJyxcbiAgJ3V0MjAwNCcsXG4gICd2ZW50cmlsbycsXG4gICd2aWV3LXNvdXJjZScsXG4gICd3ZWJjYWwnLFxuICAnd3RhaScsXG4gICd3eWNpd3lnJyxcbiAgJ3hmaXJlJyxcbiAgJ3hyaScsXG4gICd5bXNncidcbl07XG4iLCIvLyBVdGlsaXRpZXNcbi8vXG4ndXNlIHN0cmljdCc7XG5cblxuZnVuY3Rpb24gX2NsYXNzKG9iaikgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaik7IH1cblxuZnVuY3Rpb24gaXNTdHJpbmcob2JqKSB7IHJldHVybiBfY2xhc3Mob2JqKSA9PT0gJ1tvYmplY3QgU3RyaW5nXSc7IH1cblxudmFyIF9oYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbmZ1bmN0aW9uIGhhcyhvYmplY3QsIGtleSkge1xuICByZXR1cm4gX2hhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpO1xufVxuXG4vLyBNZXJnZSBvYmplY3RzXG4vL1xuZnVuY3Rpb24gYXNzaWduKG9iaiAvKmZyb20xLCBmcm9tMiwgZnJvbTMsIC4uLiovKSB7XG4gIHZhciBzb3VyY2VzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICBzb3VyY2VzLmZvckVhY2goZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgIGlmICghc291cmNlKSB7IHJldHVybjsgfVxuXG4gICAgaWYgKHR5cGVvZiBzb3VyY2UgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHNvdXJjZSArICdtdXN0IGJlIG9iamVjdCcpO1xuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBvYmpba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gb2JqO1xufVxuXG4vLyBSZW1vdmUgZWxlbWVudCBmcm9tIGFycmF5IGFuZCBwdXQgYW5vdGhlciBhcnJheSBhdCB0aG9zZSBwb3NpdGlvbi5cbi8vIFVzZWZ1bCBmb3Igc29tZSBvcGVyYXRpb25zIHdpdGggdG9rZW5zXG5mdW5jdGlvbiBhcnJheVJlcGxhY2VBdChzcmMsIHBvcywgbmV3RWxlbWVudHMpIHtcbiAgcmV0dXJuIFtdLmNvbmNhdChzcmMuc2xpY2UoMCwgcG9zKSwgbmV3RWxlbWVudHMsIHNyYy5zbGljZShwb3MgKyAxKSk7XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciBVTkVTQ0FQRV9NRF9SRSA9IC9cXFxcKFshXCIjJCUmJygpKissXFwtLlxcLzo7PD0+P0BbXFxcXFxcXV5fYHt8fX5dKS9nO1xuXG5mdW5jdGlvbiB1bmVzY2FwZU1kKHN0cikge1xuICBpZiAoc3RyLmluZGV4T2YoJ1xcXFwnKSA8IDApIHsgcmV0dXJuIHN0cjsgfVxuICByZXR1cm4gc3RyLnJlcGxhY2UoVU5FU0NBUEVfTURfUkUsICckMScpO1xufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5mdW5jdGlvbiBpc1ZhbGlkRW50aXR5Q29kZShjKSB7XG4gIC8qZXNsaW50IG5vLWJpdHdpc2U6MCovXG4gIC8vIGJyb2tlbiBzZXF1ZW5jZVxuICBpZiAoYyA+PSAweEQ4MDAgJiYgYyA8PSAweERGRkYpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIC8vIG5ldmVyIHVzZWRcbiAgaWYgKGMgPj0gMHhGREQwICYmIGMgPD0gMHhGREVGKSB7IHJldHVybiBmYWxzZTsgfVxuICBpZiAoKGMgJiAweEZGRkYpID09PSAweEZGRkYgfHwgKGMgJiAweEZGRkYpID09PSAweEZGRkUpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIC8vIGNvbnRyb2wgY29kZXNcbiAgaWYgKGMgPj0gMHgwMCAmJiBjIDw9IDB4MDgpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIGlmIChjID09PSAweDBCKSB7IHJldHVybiBmYWxzZTsgfVxuICBpZiAoYyA+PSAweDBFICYmIGMgPD0gMHgxRikgeyByZXR1cm4gZmFsc2U7IH1cbiAgaWYgKGMgPj0gMHg3RiAmJiBjIDw9IDB4OUYpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIC8vIG91dCBvZiByYW5nZVxuICBpZiAoYyA+IDB4MTBGRkZGKSB7IHJldHVybiBmYWxzZTsgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZnJvbUNvZGVQb2ludChjKSB7XG4gIC8qZXNsaW50IG5vLWJpdHdpc2U6MCovXG4gIGlmIChjID4gMHhmZmZmKSB7XG4gICAgYyAtPSAweDEwMDAwO1xuICAgIHZhciBzdXJyb2dhdGUxID0gMHhkODAwICsgKGMgPj4gMTApLFxuICAgICAgICBzdXJyb2dhdGUyID0gMHhkYzAwICsgKGMgJiAweDNmZik7XG5cbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShzdXJyb2dhdGUxLCBzdXJyb2dhdGUyKTtcbiAgfVxuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcbn1cblxudmFyIE5BTUVEX0VOVElUWV9SRSAgID0gLyYoW2EteiNdW2EtejAtOV17MSwzMX0pOy9naTtcbnZhciBESUdJVEFMX0VOVElUWV9URVNUX1JFID0gL14jKCg/OnhbYS1mMC05XXsxLDh9fFswLTldezEsOH0pKS9pO1xudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi9lbnRpdGllcycpO1xuXG5mdW5jdGlvbiByZXBsYWNlRW50aXR5UGF0dGVybihtYXRjaCwgbmFtZSkge1xuICB2YXIgY29kZSA9IDA7XG5cbiAgaWYgKGhhcyhlbnRpdGllcywgbmFtZSkpIHtcbiAgICByZXR1cm4gZW50aXRpZXNbbmFtZV07XG4gIH0gZWxzZSBpZiAobmFtZS5jaGFyQ29kZUF0KDApID09PSAweDIzLyogIyAqLyAmJiBESUdJVEFMX0VOVElUWV9URVNUX1JFLnRlc3QobmFtZSkpIHtcbiAgICBjb2RlID0gbmFtZVsxXS50b0xvd2VyQ2FzZSgpID09PSAneCcgP1xuICAgICAgcGFyc2VJbnQobmFtZS5zbGljZSgyKSwgMTYpXG4gICAgOlxuICAgICAgcGFyc2VJbnQobmFtZS5zbGljZSgxKSwgMTApO1xuICAgIGlmIChpc1ZhbGlkRW50aXR5Q29kZShjb2RlKSkge1xuICAgICAgcmV0dXJuIGZyb21Db2RlUG9pbnQoY29kZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBtYXRjaDtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZUVudGl0aWVzKHN0cikge1xuICBpZiAoc3RyLmluZGV4T2YoJyYnKSA8IDApIHsgcmV0dXJuIHN0cjsgfVxuXG4gIHJldHVybiBzdHIucmVwbGFjZShOQU1FRF9FTlRJVFlfUkUsIHJlcGxhY2VFbnRpdHlQYXR0ZXJuKTtcbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIEhUTUxfRVNDQVBFX1RFU1RfUkUgPSAvWyY8PlwiXS87XG52YXIgSFRNTF9FU0NBUEVfUkVQTEFDRV9SRSA9IC9bJjw+XCJdL2c7XG52YXIgSFRNTF9SRVBMQUNFTUVOVFMgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7J1xufTtcblxuZnVuY3Rpb24gcmVwbGFjZVVuc2FmZUNoYXIoY2gpIHtcbiAgcmV0dXJuIEhUTUxfUkVQTEFDRU1FTlRTW2NoXTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlSHRtbChzdHIpIHtcbiAgaWYgKEhUTUxfRVNDQVBFX1RFU1RfUkUudGVzdChzdHIpKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKEhUTUxfRVNDQVBFX1JFUExBQ0VfUkUsIHJlcGxhY2VVbnNhZmVDaGFyKTtcbiAgfVxuICByZXR1cm4gc3RyO1xufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgU1VSUk9SQVRFX1RFU1RfUkUgICA9IC9bXFx1RDgwMC1cXHVERkZGXS87XG52YXIgU1VSUk9SQVRFX1NFQVJDSF9SRSA9IC9bXFx1RDgwMC1cXHVERkZGXS9nO1xuXG5mdW5jdGlvbiByZXBsYWNlQmFkU3Vycm9nYXRlKGNoLCBwb3MsIG9yaWcpIHtcbiAgdmFyIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApO1xuXG4gIGlmIChjb2RlID49IDB4RDgwMCAmJiBjb2RlIDw9IDB4REJGRikge1xuICAgIC8vIGhpZ2ggc3Vycm9nYXRlXG4gICAgaWYgKHBvcyA+PSBvcmlnLmxlbmd0aCAtIDEpIHsgcmV0dXJuICdcXHVGRkZEJzsgfVxuICAgIGNvZGUgPSBvcmlnLmNoYXJDb2RlQXQocG9zICsgMSk7XG4gICAgaWYgKGNvZGUgPCAweERDMDAgfHwgY29kZSA+IDB4REZGRikgeyByZXR1cm4gJ1xcdUZGRkQnOyB9XG5cbiAgICByZXR1cm4gY2g7XG4gIH1cblxuICAvLyBsb3cgc3Vycm9nYXRlXG4gIGlmIChwb3MgPT09IDApIHsgcmV0dXJuICdcXHVGRkZEJzsgfVxuICBjb2RlID0gb3JpZy5jaGFyQ29kZUF0KHBvcyAtIDEpO1xuICBpZiAoY29kZSA8IDB4RDgwMCB8fCBjb2RlID4gMHhEQkZGKSB7IHJldHVybiAnXFx1RkZGRCc7IH1cbiAgcmV0dXJuIGNoO1xufVxuXG5mdW5jdGlvbiBmaXhCcm9rZW5TdXJyb2dhdGVzKHN0cikge1xuICBpZiAoIVNVUlJPUkFURV9URVNUX1JFLnRlc3Qoc3RyKSkgeyByZXR1cm4gc3RyOyB9XG5cbiAgcmV0dXJuIHN0ci5yZXBsYWNlKFNVUlJPUkFURV9TRUFSQ0hfUkUsIHJlcGxhY2VCYWRTdXJyb2dhdGUpO1xufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbi8vIEluY29taW5nIGxpbmsgY2FuIGJlIHBhcnRpYWxseSBlbmNvZGVkLiBDb252ZXJ0IHBvc3NpYmxlIGNvbWJpbmF0aW9ucyB0b1xuLy8gdW5pZmllZCBmb3JtLlxuLy9cbi8vIFRPRE86IFJld3JpdGUgaXQuIFNob3VsZCB1c2U6XG4vL1xuLy8gLSBlbmNvZGVVUklDb21wb25lbnQgZm9yIHF1ZXJ5XG4vLyAtIGVuY29kZVVSSSBmb3IgcGF0aFxuLy8gLSAoPykgcHVuaWNvZGUgZm9yIGRvbWFpbiBtYW1lIChidXQgZW5jb2RlVVJJIHNlZW1zIHRvIHdvcmsgaW4gcmVhbCB3b3JsZClcbi8vXG5mdW5jdGlvbiBub3JtYWxpemVMaW5rKHVybCkge1xuICB2YXIgbm9ybWFsaXplZCA9IHJlcGxhY2VFbnRpdGllcyh1cmwpO1xuXG4gIC8vIFdlIGRvbid0IGNhcmUgbXVjaCBhYm91dCByZXN1bHQgb2YgbWFpbGZvcm1lZCBVUklzLFxuICAvLyBidXQgc2hvdWQgbm90IHRocm93IGV4Y2VwdGlvbi5cbiAgdHJ5IHtcbiAgICBub3JtYWxpemVkID0gZGVjb2RlVVJJKG5vcm1hbGl6ZWQpO1xuICB9IGNhdGNoIChfXykge31cblxuICAvLyBFbmNvZGVyIHRocm93cyBleGNlcHRpb24gb24gYnJva2VuIHN1cnJvZ2F0ZSBwYWlycy5cbiAgLy8gRml4IHRob3NlIGZpcnN0LlxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSShmaXhCcm9rZW5TdXJyb2dhdGVzKG5vcm1hbGl6ZWQpKTtcbiAgfSBjYXRjaCAoX18pIHtcbiAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4gYW5kIGxlZnQgZm9yIHNhZmV0eSBvbmx5LlxuICAgIC8qaXN0YW5idWwgaWdub3JlIG5leHQqL1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG52YXIgUkVHRVhQX0VTQ0FQRV9SRSA9IC9bLj8qK14kW1xcXVxcXFwoKXt9fC1dL2c7XG5cbmZ1bmN0aW9uIGVzY2FwZVJFIChzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKFJFR0VYUF9FU0NBUEVfUkUsICdcXFxcJCYnKTtcbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gWnMgKHVuaWNvZGUgY2xhc3MpIHx8IFtcXHRcXGZcXHZcXHJcXG5dXG5mdW5jdGlvbiBpc1doaXRlU3BhY2UoY29kZSkge1xuICBpZiAoY29kZSA+PSAweDIwMDAgJiYgY29kZSA8PSAweDIwMEEpIHsgcmV0dXJuIHRydWU7IH1cbiAgc3dpdGNoIChjb2RlKSB7XG4gICAgY2FzZSAweDA5OiAvLyBcXHRcbiAgICBjYXNlIDB4MEE6IC8vIFxcblxuICAgIGNhc2UgMHgwQjogLy8gXFx2XG4gICAgY2FzZSAweDBDOiAvLyBcXGZcbiAgICBjYXNlIDB4MEQ6IC8vIFxcclxuICAgIGNhc2UgMHgyMDpcbiAgICBjYXNlIDB4QTA6XG4gICAgY2FzZSAweDE2ODA6XG4gICAgY2FzZSAweDIwMkY6XG4gICAgY2FzZSAweDIwNUY6XG4gICAgY2FzZSAweDMwMDA6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qZXNsaW50LWRpc2FibGUgbWF4LWxlbiovXG52YXIgVU5JQ09ERV9QVU5DVF9SRSA9IHJlcXVpcmUoJ3VjLm1pY3JvL2NhdGVnb3JpZXMvUC9yZWdleCcpO1xuXG4vLyBDdXJyZW50bHkgd2l0aG91dCBhc3RyYWwgY2hhcmFjdGVycyBzdXBwb3J0LlxuZnVuY3Rpb24gaXNQdW5jdENoYXIoY2hhcikge1xuICByZXR1cm4gVU5JQ09ERV9QVU5DVF9SRS50ZXN0KGNoYXIpO1xufVxuXG5cbi8vIE1hcmtkb3duIEFTQ0lJIHB1bmN0dWF0aW9uIGNoYXJhY3RlcnMuXG4vL1xuLy8gISwgXCIsICMsICQsICUsICYsICcsICgsICksICosICssICwsIC0sIC4sIC8sIDosIDssIDwsID0sID4sID8sIEAsIFssIFxcLCBdLCBeLCBfLCBgLCB7LCB8LCB9LCBvciB+XG4vLyBodHRwOi8vc3BlYy5jb21tb25tYXJrLm9yZy8wLjE1LyNhc2NpaS1wdW5jdHVhdGlvbi1jaGFyYWN0ZXJcbi8vXG4vLyBEb24ndCBjb25mdXNlIHdpdGggdW5pY29kZSBwdW5jdHVhdGlvbiAhISEgSXQgbGFja3Mgc29tZSBjaGFycyBpbiBhc2NpaSByYW5nZS5cbi8vXG5mdW5jdGlvbiBpc01kQXNjaWlQdW5jdChjaCkge1xuICBzd2l0Y2ggKGNoKSB7XG4gICAgY2FzZSAweDIxLyogISAqLzpcbiAgICBjYXNlIDB4MjIvKiBcIiAqLzpcbiAgICBjYXNlIDB4MjMvKiAjICovOlxuICAgIGNhc2UgMHgyNC8qICQgKi86XG4gICAgY2FzZSAweDI1LyogJSAqLzpcbiAgICBjYXNlIDB4MjYvKiAmICovOlxuICAgIGNhc2UgMHgyNy8qICcgKi86XG4gICAgY2FzZSAweDI4LyogKCAqLzpcbiAgICBjYXNlIDB4MjkvKiApICovOlxuICAgIGNhc2UgMHgyQS8qICogKi86XG4gICAgY2FzZSAweDJCLyogKyAqLzpcbiAgICBjYXNlIDB4MkMvKiAsICovOlxuICAgIGNhc2UgMHgyRC8qIC0gKi86XG4gICAgY2FzZSAweDJFLyogLiAqLzpcbiAgICBjYXNlIDB4MkYvKiAvICovOlxuICAgIGNhc2UgMHgzQS8qIDogKi86XG4gICAgY2FzZSAweDNCLyogOyAqLzpcbiAgICBjYXNlIDB4M0MvKiA8ICovOlxuICAgIGNhc2UgMHgzRC8qID0gKi86XG4gICAgY2FzZSAweDNFLyogPiAqLzpcbiAgICBjYXNlIDB4M0YvKiA/ICovOlxuICAgIGNhc2UgMHg0MC8qIEAgKi86XG4gICAgY2FzZSAweDVCLyogWyAqLzpcbiAgICBjYXNlIDB4NUMvKiBcXCAqLzpcbiAgICBjYXNlIDB4NUQvKiBdICovOlxuICAgIGNhc2UgMHg1RS8qIF4gKi86XG4gICAgY2FzZSAweDVGLyogXyAqLzpcbiAgICBjYXNlIDB4NjAvKiBgICovOlxuICAgIGNhc2UgMHg3Qi8qIHsgKi86XG4gICAgY2FzZSAweDdDLyogfCAqLzpcbiAgICBjYXNlIDB4N0QvKiB9ICovOlxuICAgIGNhc2UgMHg3RS8qIH4gKi86XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8vIEhlcGxlciB0byB1bmlmeSBbcmVmZXJlbmNlIGxhYmVsc10uXG4vL1xuZnVuY3Rpb24gbm9ybWFsaXplUmVmZXJlbmNlKHN0cikge1xuICAvLyB1c2UgLnRvVXBwZXJDYXNlKCkgaW5zdGVhZCBvZiAudG9Mb3dlckNhc2UoKVxuICAvLyBoZXJlIHRvIGF2b2lkIGEgY29uZmxpY3Qgd2l0aCBPYmplY3QucHJvdG90eXBlXG4gIC8vIG1lbWJlcnMgKG1vc3Qgbm90YWJseSwgYF9fcHJvdG9fX2ApXG4gIHJldHVybiBzdHIudHJpbSgpLnJlcGxhY2UoL1xccysvZywgJyAnKS50b1VwcGVyQ2FzZSgpO1xufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5leHBvcnRzLmFzc2lnbiAgICAgICAgICAgICAgPSBhc3NpZ247XG5leHBvcnRzLmlzU3RyaW5nICAgICAgICAgICAgPSBpc1N0cmluZztcbmV4cG9ydHMuaGFzICAgICAgICAgICAgICAgICA9IGhhcztcbmV4cG9ydHMudW5lc2NhcGVNZCAgICAgICAgICA9IHVuZXNjYXBlTWQ7XG5leHBvcnRzLmlzVmFsaWRFbnRpdHlDb2RlICAgPSBpc1ZhbGlkRW50aXR5Q29kZTtcbmV4cG9ydHMuZnJvbUNvZGVQb2ludCAgICAgICA9IGZyb21Db2RlUG9pbnQ7XG5leHBvcnRzLnJlcGxhY2VFbnRpdGllcyAgICAgPSByZXBsYWNlRW50aXRpZXM7XG5leHBvcnRzLmVzY2FwZUh0bWwgICAgICAgICAgPSBlc2NhcGVIdG1sO1xuZXhwb3J0cy5hcnJheVJlcGxhY2VBdCAgICAgID0gYXJyYXlSZXBsYWNlQXQ7XG5leHBvcnRzLm5vcm1hbGl6ZUxpbmsgICAgICAgPSBub3JtYWxpemVMaW5rO1xuZXhwb3J0cy5pc1doaXRlU3BhY2UgICAgICAgID0gaXNXaGl0ZVNwYWNlO1xuZXhwb3J0cy5pc01kQXNjaWlQdW5jdCAgICAgID0gaXNNZEFzY2lpUHVuY3Q7XG5leHBvcnRzLmlzUHVuY3RDaGFyICAgICAgICAgPSBpc1B1bmN0Q2hhcjtcbmV4cG9ydHMuZXNjYXBlUkUgICAgICAgICAgICA9IGVzY2FwZVJFO1xuZXhwb3J0cy5ub3JtYWxpemVSZWZlcmVuY2UgID0gbm9ybWFsaXplUmVmZXJlbmNlO1xuXG4vLyBmb3IgdGVzdGluZyBvbmx5XG5leHBvcnRzLmZpeEJyb2tlblN1cnJvZ2F0ZXMgPSBmaXhCcm9rZW5TdXJyb2dhdGVzO1xuIiwiLy8gSnVzdCBhIHNob3J0Y3V0IGZvciBidWxrIGV4cG9ydFxuJ3VzZSBzdHJpY3QnO1xuXG5cbmV4cG9ydHMucGFyc2VMaW5rTGFiZWwgICAgICAgPSByZXF1aXJlKCcuL3BhcnNlX2xpbmtfbGFiZWwnKTtcbmV4cG9ydHMucGFyc2VMaW5rRGVzdGluYXRpb24gPSByZXF1aXJlKCcuL3BhcnNlX2xpbmtfZGVzdGluYXRpb24nKTtcbmV4cG9ydHMucGFyc2VMaW5rVGl0bGUgICAgICAgPSByZXF1aXJlKCcuL3BhcnNlX2xpbmtfdGl0bGUnKTtcbiIsIi8vIFBhcnNlIGxpbmsgZGVzdGluYXRpb25cbi8vXG4ndXNlIHN0cmljdCc7XG5cblxudmFyIG5vcm1hbGl6ZUxpbmsgPSByZXF1aXJlKCcuLi9jb21tb24vdXRpbHMnKS5ub3JtYWxpemVMaW5rO1xudmFyIHVuZXNjYXBlTWQgICAgPSByZXF1aXJlKCcuLi9jb21tb24vdXRpbHMnKS51bmVzY2FwZU1kO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VMaW5rRGVzdGluYXRpb24oc3RyLCBwb3MsIG1heCkge1xuICB2YXIgY29kZSwgbGV2ZWwsXG4gICAgICBsaW5lcyA9IDAsXG4gICAgICBzdGFydCA9IHBvcyxcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgb2s6IGZhbHNlLFxuICAgICAgICBwb3M6IDAsXG4gICAgICAgIGxpbmVzOiAwLFxuICAgICAgICBzdHI6ICcnXG4gICAgICB9O1xuXG4gIGlmIChzdHIuY2hhckNvZGVBdChwb3MpID09PSAweDNDIC8qIDwgKi8pIHtcbiAgICBwb3MrKztcbiAgICB3aGlsZSAocG9zIDwgbWF4KSB7XG4gICAgICBjb2RlID0gc3RyLmNoYXJDb2RlQXQocG9zKTtcbiAgICAgIGlmIChjb2RlID09PSAweDBBIC8qIFxcbiAqLykgeyByZXR1cm4gcmVzdWx0OyB9XG4gICAgICBpZiAoY29kZSA9PT0gMHgzRSAvKiA+ICovKSB7XG4gICAgICAgIHJlc3VsdC5wb3MgPSBwb3MgKyAxO1xuICAgICAgICByZXN1bHQuc3RyID0gbm9ybWFsaXplTGluayh1bmVzY2FwZU1kKHN0ci5zbGljZShzdGFydCArIDEsIHBvcykpKTtcbiAgICAgICAgcmVzdWx0Lm9rID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIGlmIChjb2RlID09PSAweDVDIC8qIFxcICovICYmIHBvcyArIDEgPCBtYXgpIHtcbiAgICAgICAgcG9zICs9IDI7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBwb3MrKztcbiAgICB9XG5cbiAgICAvLyBubyBjbG9zaW5nICc+J1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyB0aGlzIHNob3VsZCBiZSAuLi4gfSBlbHNlIHsgLi4uIGJyYW5jaFxuXG4gIGxldmVsID0gMDtcbiAgd2hpbGUgKHBvcyA8IG1heCkge1xuICAgIGNvZGUgPSBzdHIuY2hhckNvZGVBdChwb3MpO1xuXG4gICAgaWYgKGNvZGUgPT09IDB4MjApIHsgYnJlYWs7IH1cblxuICAgIC8vIGFzY2lpIGNvbnRyb2wgY2hhcmFjdGVyc1xuICAgIGlmIChjb2RlIDwgMHgyMCB8fCBjb2RlID09PSAweDdGKSB7IGJyZWFrOyB9XG5cbiAgICBpZiAoY29kZSA9PT0gMHg1QyAvKiBcXCAqLyAmJiBwb3MgKyAxIDwgbWF4KSB7XG4gICAgICBwb3MgKz0gMjtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChjb2RlID09PSAweDI4IC8qICggKi8pIHtcbiAgICAgIGxldmVsKys7XG4gICAgICBpZiAobGV2ZWwgPiAxKSB7IGJyZWFrOyB9XG4gICAgfVxuXG4gICAgaWYgKGNvZGUgPT09IDB4MjkgLyogKSAqLykge1xuICAgICAgbGV2ZWwtLTtcbiAgICAgIGlmIChsZXZlbCA8IDApIHsgYnJlYWs7IH1cbiAgICB9XG5cbiAgICBwb3MrKztcbiAgfVxuXG4gIGlmIChzdGFydCA9PT0gcG9zKSB7IHJldHVybiByZXN1bHQ7IH1cblxuICByZXN1bHQuc3RyID0gbm9ybWFsaXplTGluayh1bmVzY2FwZU1kKHN0ci5zbGljZShzdGFydCwgcG9zKSkpO1xuICByZXN1bHQubGluZXMgPSBsaW5lcztcbiAgcmVzdWx0LnBvcyA9IHBvcztcbiAgcmVzdWx0Lm9rID0gdHJ1ZTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCIvLyBQYXJzZSBsaW5rIGxhYmVsXG4vL1xuLy8gdGhpcyBmdW5jdGlvbiBhc3N1bWVzIHRoYXQgZmlyc3QgY2hhcmFjdGVyIChcIltcIikgYWxyZWFkeSBtYXRjaGVzO1xuLy8gcmV0dXJucyB0aGUgZW5kIG9mIHRoZSBsYWJlbFxuLy9cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUxpbmtMYWJlbChzdGF0ZSwgc3RhcnQsIGRpc2FibGVOZXN0ZWQpIHtcbiAgdmFyIGxldmVsLCBmb3VuZCwgbWFya2VyLCBwcmV2UG9zLFxuICAgICAgbGFiZWxFbmQgPSAtMSxcbiAgICAgIG1heCA9IHN0YXRlLnBvc01heCxcbiAgICAgIG9sZFBvcyA9IHN0YXRlLnBvcztcblxuICBzdGF0ZS5wb3MgPSBzdGFydCArIDE7XG4gIGxldmVsID0gMTtcblxuICB3aGlsZSAoc3RhdGUucG9zIDwgbWF4KSB7XG4gICAgbWFya2VyID0gc3RhdGUuc3JjLmNoYXJDb2RlQXQoc3RhdGUucG9zKTtcbiAgICBpZiAobWFya2VyID09PSAweDVEIC8qIF0gKi8pIHtcbiAgICAgIGxldmVsLS07XG4gICAgICBpZiAobGV2ZWwgPT09IDApIHtcbiAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcmV2UG9zID0gc3RhdGUucG9zO1xuICAgIHN0YXRlLm1kLmlubGluZS5za2lwVG9rZW4oc3RhdGUpO1xuICAgIGlmIChtYXJrZXIgPT09IDB4NUIgLyogWyAqLykge1xuICAgICAgaWYgKHByZXZQb3MgPT09IHN0YXRlLnBvcyAtIDEpIHtcbiAgICAgICAgLy8gaW5jcmVhc2UgbGV2ZWwgaWYgd2UgZmluZCB0ZXh0IGBbYCwgd2hpY2ggaXMgbm90IGEgcGFydCBvZiBhbnkgdG9rZW5cbiAgICAgICAgbGV2ZWwrKztcbiAgICAgIH0gZWxzZSBpZiAoZGlzYWJsZU5lc3RlZCkge1xuICAgICAgICBzdGF0ZS5wb3MgPSBvbGRQb3M7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoZm91bmQpIHtcbiAgICBsYWJlbEVuZCA9IHN0YXRlLnBvcztcbiAgfVxuXG4gIC8vIHJlc3RvcmUgb2xkIHN0YXRlXG4gIHN0YXRlLnBvcyA9IG9sZFBvcztcblxuICByZXR1cm4gbGFiZWxFbmQ7XG59O1xuIiwiLy8gUGFyc2UgbGluayB0aXRsZVxuLy9cbid1c2Ugc3RyaWN0JztcblxuXG52YXIgdW5lc2NhcGVNZCA9IHJlcXVpcmUoJy4uL2NvbW1vbi91dGlscycpLnVuZXNjYXBlTWQ7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUxpbmtUaXRsZShzdHIsIHBvcywgbWF4KSB7XG4gIHZhciBjb2RlLFxuICAgICAgbWFya2VyLFxuICAgICAgbGluZXMgPSAwLFxuICAgICAgc3RhcnQgPSBwb3MsXG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG9rOiBmYWxzZSxcbiAgICAgICAgcG9zOiAwLFxuICAgICAgICBsaW5lczogMCxcbiAgICAgICAgc3RyOiAnJ1xuICAgICAgfTtcblxuICBpZiAocG9zID49IG1heCkgeyByZXR1cm4gcmVzdWx0OyB9XG5cbiAgbWFya2VyID0gc3RyLmNoYXJDb2RlQXQocG9zKTtcblxuICBpZiAobWFya2VyICE9PSAweDIyIC8qIFwiICovICYmIG1hcmtlciAhPT0gMHgyNyAvKiAnICovICYmIG1hcmtlciAhPT0gMHgyOCAvKiAoICovKSB7IHJldHVybiByZXN1bHQ7IH1cblxuICBwb3MrKztcblxuICAvLyBpZiBvcGVuaW5nIG1hcmtlciBpcyBcIihcIiwgc3dpdGNoIGl0IHRvIGNsb3NpbmcgbWFya2VyIFwiKVwiXG4gIGlmIChtYXJrZXIgPT09IDB4MjgpIHsgbWFya2VyID0gMHgyOTsgfVxuXG4gIHdoaWxlIChwb3MgPCBtYXgpIHtcbiAgICBjb2RlID0gc3RyLmNoYXJDb2RlQXQocG9zKTtcbiAgICBpZiAoY29kZSA9PT0gbWFya2VyKSB7XG4gICAgICByZXN1bHQucG9zID0gcG9zICsgMTtcbiAgICAgIHJlc3VsdC5saW5lcyA9IGxpbmVzO1xuICAgICAgcmVzdWx0LnN0ciA9IHVuZXNjYXBlTWQoc3RyLnNsaWNlKHN0YXJ0ICsgMSwgcG9zKSk7XG4gICAgICByZXN1bHQub2sgPSB0cnVlO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGVsc2UgaWYgKGNvZGUgPT09IDB4MEEpIHtcbiAgICAgIGxpbmVzKys7XG4gICAgfSBlbHNlIGlmIChjb2RlID09PSAweDVDIC8qIFxcICovICYmIHBvcyArIDEgPCBtYXgpIHtcbiAgICAgIHBvcysrO1xuICAgICAgaWYgKHN0ci5jaGFyQ29kZUF0KHBvcykgPT09IDB4MEEpIHtcbiAgICAgICAgbGluZXMrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwb3MrKztcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiLy8gTWFpbiBwZXJzZXIgY2xhc3NcblxuJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciB1dGlscyAgICAgICAgPSByZXF1aXJlKCcuL2NvbW1vbi91dGlscycpO1xudmFyIGhlbHBlcnMgICAgICA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xudmFyIFJlbmRlcmVyICAgICA9IHJlcXVpcmUoJy4vcmVuZGVyZXInKTtcbnZhciBQYXJzZXJDb3JlICAgPSByZXF1aXJlKCcuL3BhcnNlcl9jb3JlJyk7XG52YXIgUGFyc2VyQmxvY2sgID0gcmVxdWlyZSgnLi9wYXJzZXJfYmxvY2snKTtcbnZhciBQYXJzZXJJbmxpbmUgPSByZXF1aXJlKCcuL3BhcnNlcl9pbmxpbmUnKTtcblxudmFyIGNvbmZpZyA9IHtcbiAgJ2RlZmF1bHQnOiByZXF1aXJlKCcuL3ByZXNldHMvZGVmYXVsdCcpLFxuICB6ZXJvOiByZXF1aXJlKCcuL3ByZXNldHMvemVybycpLFxuICBjb21tb25tYXJrOiByZXF1aXJlKCcuL3ByZXNldHMvY29tbW9ubWFyaycpXG59O1xuXG5cbi8qKlxuICogY2xhc3MgTWFya2Rvd25JdFxuICpcbiAqIE1haW4gcGFyc2VyL3JlbmRlcmVyIGNsYXNzLlxuICpcbiAqICMjIyMjIFVzYWdlXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogLy8gbm9kZS5qcywgXCJjbGFzc2ljXCIgd2F5OlxuICogdmFyIE1hcmtkb3duSXQgPSByZXF1aXJlKCdtYXJrZG93bi1pdCcpLFxuICogICAgIG1kID0gbmV3IE1hcmtkb3duSXQoKTtcbiAqIHZhciByZXN1bHQgPSBtZC5yZW5kZXIoJyMgbWFya2Rvd24taXQgcnVsZXp6IScpO1xuICpcbiAqIC8vIG5vZGUuanMsIHRoZSBzYW1lLCBidXQgd2l0aCBzdWdhcjpcbiAqIHZhciBtZCA9IHJlcXVpcmUoJ21hcmtkb3duLWl0JykoKTtcbiAqIHZhciByZXN1bHQgPSBtZC5yZW5kZXIoJyMgbWFya2Rvd24taXQgcnVsZXp6IScpO1xuICpcbiAqIC8vIGJyb3dzZXIgd2l0aG91dCBBTUQsIGFkZGVkIHRvIFwid2luZG93XCIgb24gc2NyaXB0IGxvYWRcbiAqIC8vIE5vdGUsIHRoZXJlIGFyZSBubyBkYXNoLlxuICogdmFyIG1kID0gd2luZG93Lm1hcmtkb3duaXQoKTtcbiAqIHZhciByZXN1bHQgPSBtZC5yZW5kZXIoJyMgbWFya2Rvd24taXQgcnVsZXp6IScpO1xuICogYGBgXG4gKlxuICogU2luZ2xlIGxpbmUgcmVuZGVyaW5nLCB3aXRob3V0IHBhcmFncmFwaCB3cmFwOlxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIHZhciBtZCA9IHJlcXVpcmUoJ21hcmtkb3duLWl0JykoKTtcbiAqIHZhciByZXN1bHQgPSBtZC5yZW5kZXJJbmxpbmUoJ19fbWFya2Rvd24taXRfXyBydWxlenohJyk7XG4gKiBgYGBcbiAqKi9cblxuLyoqXG4gKiBuZXcgTWFya2Rvd25JdChbcHJlc2V0TmFtZSwgb3B0aW9uc10pXG4gKiAtIHByZXNldE5hbWUgKFN0cmluZyk6IG9wdGlvbmFsLCBgY29tbW9ubWFya2AgLyBgemVyb2BcbiAqIC0gb3B0aW9ucyAoT2JqZWN0KVxuICpcbiAqIENyZWF0ZXMgcGFyc2VyIGluc3RhbnNlIHdpdGggZ2l2ZW4gY29uZmlnLiBDYW4gYmUgY2FsbGVkIHdpdGhvdXQgYG5ld2AuXG4gKlxuICogIyMjIyMgcHJlc2V0TmFtZVxuICpcbiAqIE1hcmtkb3duSXQgcHJvdmlkZXMgbmFtZWQgcHJlc2V0cyBhcyBhIGNvbnZlbmllbmNlIHRvIHF1aWNrbHlcbiAqIGVuYWJsZS9kaXNhYmxlIGFjdGl2ZSBzeW50YXggcnVsZXMgYW5kIG9wdGlvbnMgZm9yIGNvbW1vbiB1c2UgY2FzZXMuXG4gKlxuICogLSBbXCJjb21tb25tYXJrXCJdKGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJrZG93bi1pdC9tYXJrZG93bi1pdC9ibG9iL21hc3Rlci9saWIvcHJlc2V0cy9jb21tb25tYXJrLmpzKSAtXG4gKiAgIGNvbmZpZ3VyZXMgcGFyc2VyIHRvIHN0cmljdCBbQ29tbW9uTWFya10oaHR0cDovL2NvbW1vbm1hcmsub3JnLykgbW9kZS5cbiAqIC0gW2RlZmF1bHRdKGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJrZG93bi1pdC9tYXJrZG93bi1pdC9ibG9iL21hc3Rlci9saWIvcHJlc2V0cy9kZWZhdWx0LmpzKSAtXG4gKiAgIHNpbWlsYXIgdG8gR0ZNLCB1c2VkIHdoZW4gbm8gcHJlc2V0IG5hbWUgZ2l2ZW4uIEVuYWJsZXMgYWxsIGF2YWlsYWJsZSBydWxlcyxcbiAqICAgYnV0IHN0aWxsIHdpdGhvdXQgaHRtbCwgdHlwb2dyYXBoZXIgJiBhdXRvbGlua2VyLlxuICogLSBbXCJ6ZXJvXCJdKGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJrZG93bi1pdC9tYXJrZG93bi1pdC9ibG9iL21hc3Rlci9saWIvcHJlc2V0cy96ZXJvLmpzKSAtXG4gKiAgIGFsbCBydWxlcyBkaXNhYmxlZC4gVXNlZnVsIHRvIHF1aWNrbHkgc2V0dXAgeW91ciBjb25maWcgdmlhIGAuZW5hYmxlKClgLlxuICogICBGb3IgZXhhbXBsZSwgd2hlbiB5b3UgbmVlZCBvbmx5IGBib2xkYCBhbmQgYGl0YWxpY2AgbWFya3VwIGFuZCBub3RoaW5nIGVsc2UuXG4gKlxuICogIyMjIyMgb3B0aW9uczpcbiAqXG4gKiAtIF9faHRtbF9fIC0gYGZhbHNlYC4gU2V0IGB0cnVlYCB0byBlbmFibGUgSFRNTCB0YWdzIGluIHNvdXJjZS4gQmUgY2FyZWZ1bCFcbiAqICAgVGhhdCdzIG5vdCBzYWZlISBZb3UgbWF5IG5lZWQgZXh0ZXJuYWwgc2FuaXRpemVyIHRvIHByb3RlY3Qgb3V0cHV0IGZyb20gWFNTLlxuICogICBJdCdzIGJldHRlciB0byBleHRlbmQgZmVhdHVyZXMgdmlhIHBsdWdpbnMsIGluc3RlYWQgb2YgZW5hYmxpbmcgSFRNTC5cbiAqIC0gX194aHRtbE91dF9fIC0gYGZhbHNlYC4gU2V0IGB0cnVlYCB0byBhZGQgJy8nIHdoZW4gY2xvc2luZyBzaW5nbGUgdGFnc1xuICogICAoYDxiciAvPmApLiBUaGlzIGlzIG5lZWRlZCBvbmx5IGZvciBmdWxsIENvbW1vbk1hcmsgY29tcGF0aWJpbGl0eS4gSW4gcmVhbFxuICogICB3b3JsZCB5b3Ugd2lsbCBuZWVkIEhUTUwgb3V0cHV0LlxuICogLSBfX2JyZWFrc19fIC0gYGZhbHNlYC4gU2V0IGB0cnVlYCB0byBjb252ZXJ0IGBcXG5gIGluIHBhcmFncmFwaHMgaW50byBgPGJyPmAuXG4gKiAtIF9fbGFuZ1ByZWZpeF9fIC0gYGxhbmd1YWdlLWAuIENTUyBsYW5ndWFnZSBjbGFzcyBwcmVmaXggZm9yIGZlbmNlZCBibG9ja3MuXG4gKiAgIENhbiBiZSB1c2VmdWwgZm9yIGV4dGVybmFsIGhpZ2hsaWdodGVycy5cbiAqIC0gX19saW5raWZ5X18gLSBgZmFsc2VgLiBTZXQgYHRydWVgIHRvIGF1dG9jb252ZXJ0IFVSTC1saWtlIHRleHQgdG8gbGlua3MuXG4gKiAtIF9fdHlwb2dyYXBoZXJfXyAgLSBgZmFsc2VgLiBTZXQgYHRydWVgIHRvIGVuYWJsZSBbc29tZSBsYW5ndWFnZS1uZXV0cmFsXG4gKiAgIHJlcGxhY2VtZW50XShodHRwczovL2dpdGh1Yi5jb20vbWFya2Rvd24taXQvbWFya2Rvd24taXQvYmxvYi9tYXN0ZXIvbGliL3J1bGVzX2NvcmUvcmVwbGFjZW1lbnRzLmpzKSArXG4gKiAgIHF1b3RlcyBiZWF1dGlmaWNhdGlvbiAoc21hcnRxdW90ZXMpLlxuICogLSBfX3F1b3Rlc19fIC0gYOKAnOKAneKAmOKAmWAsIHN0cmluZy4gRG91YmxlICsgc2luZ2xlIHF1b3RlcyByZXBsYWNlbWVudCBwYWlycywgd2hlblxuICogICB0eXBvZ3JhcGhlciBlbmFibGVkIGFuZCBzbWFydHF1b3RlcyBvbi4gU2V0IGRvdWJsZXMgdG8gJ8KrwrsnIGZvciBSdXNzaWFuLFxuICogICAn4oCe4oCcJyBmb3IgR2VybWFuLlxuICogLSBfX2hpZ2hsaWdodF9fIC0gYG51bGxgLiBIaWdobGlnaHRlciBmdW5jdGlvbiBmb3IgZmVuY2VkIGNvZGUgYmxvY2tzLlxuICogICBIaWdobGlnaHRlciBgZnVuY3Rpb24gKHN0ciwgbGFuZylgIHNob3VsZCByZXR1cm4gZXNjYXBlZCBIVE1MLiBJdCBjYW4gYWxzb1xuICogICByZXR1cm4gZW1wdHkgc3RyaW5nIGlmIHRoZSBzb3VyY2Ugd2FzIG5vdCBjaGFuZ2VkIGFuZCBzaG91bGQgYmUgZXNjYXBlZCBleHRlcm5hbHkuXG4gKlxuICogIyMjIyMgRXhhbXBsZVxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIC8vIGNvbW1vbm1hcmsgbW9kZVxuICogdmFyIG1kID0gcmVxdWlyZSgnbWFya2Rvd24taXQnKSgnY29tbW9ubWFyaycpO1xuICpcbiAqIC8vIGRlZmF1bHQgbW9kZVxuICogdmFyIG1kID0gcmVxdWlyZSgnbWFya2Rvd24taXQnKSgpO1xuICpcbiAqIC8vIGVuYWJsZSBldmVyeXRoaW5nXG4gKiB2YXIgbWQgPSByZXF1aXJlKCdtYXJrZG93bi1pdCcpKHtcbiAqICAgaHRtbDogdHJ1ZSxcbiAqICAgbGlua2lmeTogdHJ1ZSxcbiAqICAgdHlwb2dyYXBoZXI6IHRydWVcbiAqIH0pO1xuICogYGBgXG4gKlxuICogIyMjIyMgU3ludGF4IGhpZ2hsaWdodGluZ1xuICpcbiAqIGBgYGpzXG4gKiB2YXIgaGxqcyA9IHJlcXVpcmUoJ2hpZ2hsaWdodC5qcycpIC8vIGh0dHBzOi8vaGlnaGxpZ2h0anMub3JnL1xuICpcbiAqIHZhciBtZCA9IHJlcXVpcmUoJ21hcmtkb3duLWl0Jykoe1xuICogICBoaWdobGlnaHQ6IGZ1bmN0aW9uIChzdHIsIGxhbmcpIHtcbiAqICAgICBpZiAobGFuZyAmJiBobGpzLmdldExhbmd1YWdlKGxhbmcpKSB7XG4gKiAgICAgICB0cnkge1xuICogICAgICAgICByZXR1cm4gaGxqcy5oaWdobGlnaHQobGFuZywgc3RyKS52YWx1ZTtcbiAqICAgICAgIH0gY2F0Y2ggKF9fKSB7fVxuICogICAgIH1cbiAqXG4gKiAgICAgdHJ5IHtcbiAqICAgICAgIHJldHVybiBobGpzLmhpZ2hsaWdodEF1dG8oc3RyKS52YWx1ZTtcbiAqICAgICB9IGNhdGNoIChfXykge31cbiAqXG4gKiAgICAgcmV0dXJuICcnOyAvLyB1c2UgZXh0ZXJuYWwgZGVmYXVsdCBlc2NhcGluZ1xuICogICB9XG4gKiB9KTtcbiAqIGBgYFxuICoqL1xuZnVuY3Rpb24gTWFya2Rvd25JdChwcmVzZXROYW1lLCBvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBNYXJrZG93bkl0KSkge1xuICAgIHJldHVybiBuZXcgTWFya2Rvd25JdChwcmVzZXROYW1lLCBvcHRpb25zKTtcbiAgfVxuXG4gIGlmICghb3B0aW9ucykge1xuICAgIGlmICghdXRpbHMuaXNTdHJpbmcocHJlc2V0TmFtZSkpIHtcbiAgICAgIG9wdGlvbnMgPSBwcmVzZXROYW1lIHx8IHt9O1xuICAgICAgcHJlc2V0TmFtZSA9ICdkZWZhdWx0JztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWFya2Rvd25JdCNpbmxpbmUgLT4gUGFyc2VySW5saW5lXG4gICAqXG4gICAqIEluc3RhbmNlIG9mIFtbUGFyc2VySW5saW5lXV0uIFlvdSBtYXkgbmVlZCBpdCB0byBhZGQgbmV3IHJ1bGVzIHdoZW5cbiAgICogd3JpdGluZyBwbHVnaW5zLiBGb3Igc2ltcGxlIHJ1bGVzIGNvbnRyb2wgdXNlIFtbTWFya2Rvd25JdC5kaXNhYmxlXV0gYW5kXG4gICAqIFtbTWFya2Rvd25JdC5lbmFibGVdXS5cbiAgICoqL1xuICB0aGlzLmlubGluZSA9IG5ldyBQYXJzZXJJbmxpbmUoKTtcblxuICAvKipcbiAgICogTWFya2Rvd25JdCNibG9jayAtPiBQYXJzZXJCbG9ja1xuICAgKlxuICAgKiBJbnN0YW5jZSBvZiBbW1BhcnNlckJsb2NrXV0uIFlvdSBtYXkgbmVlZCBpdCB0byBhZGQgbmV3IHJ1bGVzIHdoZW5cbiAgICogd3JpdGluZyBwbHVnaW5zLiBGb3Igc2ltcGxlIHJ1bGVzIGNvbnRyb2wgdXNlIFtbTWFya2Rvd25JdC5kaXNhYmxlXV0gYW5kXG4gICAqIFtbTWFya2Rvd25JdC5lbmFibGVdXS5cbiAgICoqL1xuICB0aGlzLmJsb2NrID0gbmV3IFBhcnNlckJsb2NrKCk7XG5cbiAgLyoqXG4gICAqIE1hcmtkb3duSXQjY29yZSAtPiBDb3JlXG4gICAqXG4gICAqIEluc3RhbmNlIG9mIFtbQ29yZV1dIGNoYWluIGV4ZWN1dG9yLiBZb3UgbWF5IG5lZWQgaXQgdG8gYWRkIG5ldyBydWxlcyB3aGVuXG4gICAqIHdyaXRpbmcgcGx1Z2lucy4gRm9yIHNpbXBsZSBydWxlcyBjb250cm9sIHVzZSBbW01hcmtkb3duSXQuZGlzYWJsZV1dIGFuZFxuICAgKiBbW01hcmtkb3duSXQuZW5hYmxlXV0uXG4gICAqKi9cbiAgdGhpcy5jb3JlID0gbmV3IFBhcnNlckNvcmUoKTtcblxuICAvKipcbiAgICogTWFya2Rvd25JdCNyZW5kZXJlciAtPiBSZW5kZXJlclxuICAgKlxuICAgKiBJbnN0YW5jZSBvZiBbW1JlbmRlcmVyXV0uIFVzZSBpdCB0byBtb2RpZnkgb3V0cHV0IGxvb2suIE9yIHRvIGFkZCByZW5kZXJpbmdcbiAgICogcnVsZXMgZm9yIG5ldyB0b2tlbiB0eXBlcywgZ2VuZXJhdGVkIGJ5IHBsdWdpbnMuXG4gICAqXG4gICAqICMjIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgamF2YXNjcmlwdFxuICAgKiB2YXIgbWQgPSByZXF1aXJlKCdtYXJrZG93bi1pdCcpKCk7XG4gICAqXG4gICAqIGZ1bmN0aW9uIG15VG9rZW4odG9rZW5zLCBpZHgsIG9wdGlvbnMsIGVudiwgc2VsZikge1xuICAgKiAgIC8vLi4uXG4gICAqICAgcmV0dXJuIHJlc3VsdDtcbiAgICogfTtcbiAgICpcbiAgICogbWQucmVuZGVyZXIucnVsZXNbJ215X3Rva2VuJ10gPSBteVRva2VuXG4gICAqIGBgYFxuICAgKlxuICAgKiBTZWUgW1tSZW5kZXJlcl1dIGRvY3MgYW5kIFtzb3VyY2UgY29kZV0oaHR0cHM6Ly9naXRodWIuY29tL21hcmtkb3duLWl0L21hcmtkb3duLWl0L2Jsb2IvbWFzdGVyL2xpYi9yZW5kZXJlci5qcykuXG4gICAqKi9cbiAgdGhpcy5yZW5kZXJlciA9IG5ldyBSZW5kZXJlcigpO1xuXG4gIC8vIEV4cG9zZSB1dGlscyAmIGhlbHBlcnMgZm9yIGVhc3kgYWNjZXMgZnJvbSBwbHVnaW5zXG5cbiAgLyoqXG4gICAqIE1hcmtkb3duSXQjdXRpbHMgLT4gdXRpbHNcbiAgICpcbiAgICogQXNzb3J0ZWQgdXRpbGl0eSBmdW5jdGlvbnMsIHVzZWZ1bCB0byB3cml0ZSBwbHVnaW5zLiBTZWUgZGV0YWlsc1xuICAgKiBbaGVyZV0oaHR0cHM6Ly9naXRodWIuY29tL21hcmtkb3duLWl0L21hcmtkb3duLWl0L2Jsb2IvbWFzdGVyL2xpYi9jb21tb24vdXRpbHMuanMpLlxuICAgKiovXG4gIHRoaXMudXRpbHMgPSB1dGlscztcblxuICAvKipcbiAgICogTWFya2Rvd25JdCNoZWxwZXJzIC0+IGhlbHBlcnNcbiAgICpcbiAgICogTGluayBjb21wb25lbnRzIHBhcnNlciBmdW5jdGlvbnMsIHVzZWZ1bCB0byB3cml0ZSBwbHVnaW5zLiBTZWUgZGV0YWlsc1xuICAgKiBbaGVyZV0oaHR0cHM6Ly9naXRodWIuY29tL21hcmtkb3duLWl0L21hcmtkb3duLWl0L2Jsb2IvbWFzdGVyL2xpYi9oZWxwZXJzKS5cbiAgICoqL1xuICB0aGlzLmhlbHBlcnMgPSBoZWxwZXJzO1xuXG5cbiAgdGhpcy5vcHRpb25zID0ge307XG4gIHRoaXMuY29uZmlndXJlKHByZXNldE5hbWUpO1xuXG4gIGlmIChvcHRpb25zKSB7IHRoaXMuc2V0KG9wdGlvbnMpOyB9XG59XG5cblxuLyoqIGNoYWluYWJsZVxuICogTWFya2Rvd25JdC5zZXQob3B0aW9ucylcbiAqXG4gKiBTZXQgcGFyc2VyIG9wdGlvbnMgKGluIHRoZSBzYW1lIGZvcm1hdCBhcyBpbiBjb25zdHJ1Y3RvcikuIFByb2JhYmx5LCB5b3VcbiAqIHdpbGwgbmV2ZXIgbmVlZCBpdCwgYnV0IHlvdSBjYW4gY2hhbmdlIG9wdGlvbnMgYWZ0ZXIgY29uc3RydWN0b3IgY2FsbC5cbiAqXG4gKiAjIyMjIyBFeGFtcGxlXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogdmFyIG1kID0gcmVxdWlyZSgnbWFya2Rvd24taXQnKSgpXG4gKiAgICAgICAgICAgICAuc2V0KHsgaHRtbDogdHJ1ZSwgYnJlYWtzOiB0cnVlIH0pXG4gKiAgICAgICAgICAgICAuc2V0KHsgdHlwb2dyYXBoZXIsIHRydWUgfSk7XG4gKiBgYGBcbiAqXG4gKiBfX05vdGU6X18gVG8gYWNoaWV2ZSB0aGUgYmVzdCBwb3NzaWJsZSBwZXJmb3JtYW5jZSwgZG9uJ3QgbW9kaWZ5IGFcbiAqIGBtYXJrZG93bi1pdGAgaW5zdGFuY2Ugb3B0aW9ucyBvbiB0aGUgZmx5LiBJZiB5b3UgbmVlZCBtdWx0aXBsZSBjb25maWd1cmF0aW9uc1xuICogaXQncyBiZXN0IHRvIGNyZWF0ZSBtdWx0aXBsZSBpbnN0YW5jZXMgYW5kIGluaXRpYWxpemUgZWFjaCB3aXRoIHNlcGFyYXRlXG4gKiBjb25maWcuXG4gKiovXG5NYXJrZG93bkl0LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICB1dGlscy5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5cbi8qKiBjaGFpbmFibGUsIGludGVybmFsXG4gKiBNYXJrZG93bkl0LmNvbmZpZ3VyZShwcmVzZXRzKVxuICpcbiAqIEJhdGNoIGxvYWQgb2YgYWxsIG9wdGlvbnMgYW5kIGNvbXBlbmVudCBzZXR0aW5ncy4gVGhpcyBpcyBpbnRlcm5hbCBtZXRob2QsXG4gKiBhbmQgeW91IHByb2JhYmx5IHdpbGwgbm90IG5lZWQgaXQuIEJ1dCBpZiB5b3Ugd2l0aCAtIHNlZSBhdmFpbGFibGUgcHJlc2V0c1xuICogYW5kIGRhdGEgc3RydWN0dXJlIFtoZXJlXShodHRwczovL2dpdGh1Yi5jb20vbWFya2Rvd24taXQvbWFya2Rvd24taXQvdHJlZS9tYXN0ZXIvbGliL3ByZXNldHMpXG4gKlxuICogV2Ugc3Ryb25nbHkgcmVjb21tZW5kIHRvIHVzZSBwcmVzZXRzIGluc3RlYWQgb2YgZGlyZWN0IGNvbmZpZyBsb2Fkcy4gVGhhdFxuICogd2lsbCBnaXZlIGJldHRlciBjb21wYXRpYmlsaXR5IHdpdGggbmV4dCB2ZXJzaW9ucy5cbiAqKi9cbk1hcmtkb3duSXQucHJvdG90eXBlLmNvbmZpZ3VyZSA9IGZ1bmN0aW9uIChwcmVzZXRzKSB7XG4gIHZhciBzZWxmID0gdGhpcywgcHJlc2V0TmFtZTtcblxuICBpZiAodXRpbHMuaXNTdHJpbmcocHJlc2V0cykpIHtcbiAgICBwcmVzZXROYW1lID0gcHJlc2V0cztcbiAgICBwcmVzZXRzID0gY29uZmlnW3ByZXNldE5hbWVdO1xuICAgIGlmICghcHJlc2V0cykgeyB0aHJvdyBuZXcgRXJyb3IoJ1dyb25nIGBtYXJrZG93bi1pdGAgcHJlc2V0IFwiJyArIHByZXNldE5hbWUgKyAnXCIsIGNoZWNrIG5hbWUnKTsgfVxuICB9XG5cbiAgaWYgKCFwcmVzZXRzKSB7IHRocm93IG5ldyBFcnJvcignV3JvbmcgYG1hcmtkb3duLWl0YCBwcmVzZXQsIGNhblxcJ3QgYmUgZW1wdHknKTsgfVxuXG4gIGlmIChwcmVzZXRzLm9wdGlvbnMpIHsgc2VsZi5zZXQocHJlc2V0cy5vcHRpb25zKTsgfVxuXG4gIGlmIChwcmVzZXRzLmNvbXBvbmVudHMpIHtcbiAgICBPYmplY3Qua2V5cyhwcmVzZXRzLmNvbXBvbmVudHMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIGlmIChwcmVzZXRzLmNvbXBvbmVudHNbbmFtZV0ucnVsZXMpIHtcbiAgICAgICAgc2VsZltuYW1lXS5ydWxlci5lbmFibGVPbmx5KHByZXNldHMuY29tcG9uZW50c1tuYW1lXS5ydWxlcyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5cbi8qKiBjaGFpbmFibGVcbiAqIE1hcmtkb3duSXQuZW5hYmxlKGxpc3QsIGlnbm9yZUludmFsaWQpXG4gKiAtIGxpc3QgKFN0cmluZ3xBcnJheSk6IHJ1bGUgbmFtZSBvciBsaXN0IG9mIHJ1bGUgbmFtZXMgdG8gZW5hYmxlXG4gKiAtIGlnbm9yZUludmFsaWQgKEJvb2xlYW4pOiBzZXQgYHRydWVgIHRvIGlnbm9yZSBlcnJvcnMgd2hlbiBydWxlIG5vdCBmb3VuZC5cbiAqXG4gKiBFbmFibGUgbGlzdCBvciBydWxlcy4gSXQgd2lsbCBhdXRvbWF0aWNhbGx5IGZpbmQgYXBwcm9wcmlhdGUgY29tcG9uZW50cyxcbiAqIGNvbnRhaW5pbmcgcnVsZXMgd2l0aCBnaXZlbiBuYW1lcy4gSWYgcnVsZSBub3QgZm91bmQsIGFuZCBgaWdub3JlSW52YWxpZGBcbiAqIG5vdCBzZXQgLSB0aHJvd3MgZXhjZXB0aW9uLlxuICpcbiAqICMjIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgbWQgPSByZXF1aXJlKCdtYXJrZG93bi1pdCcpKClcbiAqICAgICAgICAgICAgIC5lbmFibGUoWydzdWInLCAnc3VwJ10pXG4gKiAgICAgICAgICAgICAuZGlzYWJsZSgnc21hcnRxdW90ZXMnKTtcbiAqIGBgYFxuICoqL1xuTWFya2Rvd25JdC5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24gKGxpc3QsIGlnbm9yZUludmFsaWQpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gIGlmICghQXJyYXkuaXNBcnJheShsaXN0KSkgeyBsaXN0ID0gWyBsaXN0IF07IH1cblxuICBbICdjb3JlJywgJ2Jsb2NrJywgJ2lubGluZScgXS5mb3JFYWNoKGZ1bmN0aW9uIChjaGFpbikge1xuICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodGhpc1tjaGFpbl0ucnVsZXIuZW5hYmxlKGxpc3QsIHRydWUpKTtcbiAgfSwgdGhpcyk7XG5cbiAgdmFyIG1pc3NlZCA9IGxpc3QuZmlsdGVyKGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiByZXN1bHQuaW5kZXhPZihuYW1lKSA8IDA7IH0pO1xuXG4gIGlmIChtaXNzZWQubGVuZ3RoICYmICFpZ25vcmVJbnZhbGlkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNYXJrZG93bkl0LiBGYWlsZWQgdG8gZW5hYmxlIHVua25vd24gcnVsZShzKTogJyArIG1pc3NlZCk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cblxuLyoqIGNoYWluYWJsZVxuICogTWFya2Rvd25JdC5kaXNhYmxlKGxpc3QsIGlnbm9yZUludmFsaWQpXG4gKiAtIGxpc3QgKFN0cmluZ3xBcnJheSk6IHJ1bGUgbmFtZSBvciBsaXN0IG9mIHJ1bGUgbmFtZXMgdG8gZGlzYWJsZS5cbiAqIC0gaWdub3JlSW52YWxpZCAoQm9vbGVhbik6IHNldCBgdHJ1ZWAgdG8gaWdub3JlIGVycm9ycyB3aGVuIHJ1bGUgbm90IGZvdW5kLlxuICpcbiAqIFRoZSBzYW1lIGFzIFtbTWFya2Rvd25JdC5lbmFibGVdXSwgYnV0IHR1cm4gc3BlY2lmaWVkIHJ1bGVzIG9mZi5cbiAqKi9cbk1hcmtkb3duSXQucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbiAobGlzdCwgaWdub3JlSW52YWxpZCkge1xuICB2YXIgcmVzdWx0ID0gW107XG5cbiAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3QpKSB7IGxpc3QgPSBbIGxpc3QgXTsgfVxuXG4gIFsgJ2NvcmUnLCAnYmxvY2snLCAnaW5saW5lJyBdLmZvckVhY2goZnVuY3Rpb24gKGNoYWluKSB7XG4gICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh0aGlzW2NoYWluXS5ydWxlci5kaXNhYmxlKGxpc3QsIHRydWUpKTtcbiAgfSwgdGhpcyk7XG5cbiAgdmFyIG1pc3NlZCA9IGxpc3QuZmlsdGVyKGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiByZXN1bHQuaW5kZXhPZihuYW1lKSA8IDA7IH0pO1xuXG4gIGlmIChtaXNzZWQubGVuZ3RoICYmICFpZ25vcmVJbnZhbGlkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNYXJrZG93bkl0LiBGYWlsZWQgdG8gZGlzYWJsZSB1bmtub3duIHJ1bGUocyk6ICcgKyBtaXNzZWQpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuXG4vKiogY2hhaW5hYmxlXG4gKiBNYXJrZG93bkl0LnVzZShwbHVnaW4sIHBhcmFtcylcbiAqXG4gKiBMb2FkIHNwZWNpZmllZCBwbHVnaW4gd2l0aCBnaXZlbiBwYXJhbXMgaW50byBjdXJyZW50IHBhcnNlciBpbnN0YW5jZS5cbiAqIEl0J3MganVzdCBhIHN1Z2FyIHRvIGNhbGwgYHBsdWdpbihtZCwgcGFyYW1zKWAgd2l0aCBjdXJyaW5nLlxuICpcbiAqICMjIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgaXRlcmF0b3IgPSByZXF1aXJlKCdtYXJrZG93bi1pdC1mb3ItaW5saW5lJyk7XG4gKiB2YXIgbWQgPSByZXF1aXJlKCdtYXJrZG93bi1pdCcpKClcbiAqICAgICAgICAgICAgIC51c2UoaXRlcmF0b3IsICdmb29fcmVwbGFjZScsICd0ZXh0JywgZnVuY3Rpb24gKHRva2VucywgaWR4KSB7XG4gKiAgICAgICAgICAgICAgIHRva2Vuc1tpZHhdLmNvbnRlbnQgPSB0b2tlbnNbaWR4XS5jb250ZW50LnJlcGxhY2UoL2Zvby9nLCAnYmFyJyk7XG4gKiAgICAgICAgICAgICB9KTtcbiAqIGBgYFxuICoqL1xuTWFya2Rvd25JdC5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gKHBsdWdpbiAvKiwgcGFyYW1zLCAuLi4gKi8pIHtcbiAgdmFyIGFyZ3MgPSBbIHRoaXMgXS5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gIHBsdWdpbi5hcHBseShwbHVnaW4sIGFyZ3MpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblxuLyoqIGludGVybmFsXG4gKiBNYXJrZG93bkl0LnBhcnNlKHNyYywgZW52KSAtPiBBcnJheVxuICogLSBzcmMgKFN0cmluZyk6IHNvdXJjZSBzdHJpbmdcbiAqIC0gZW52IChPYmplY3QpOiBlbnZpcm9ubWVudCBzYW5kYm94XG4gKlxuICogUGFyc2UgaW5wdXQgc3RyaW5nIGFuZCByZXR1cm5zIGxpc3Qgb2YgYmxvY2sgdG9rZW5zIChzcGVjaWFsIHRva2VuIHR5cGVcbiAqIFwiaW5saW5lXCIgd2lsbCBjb250YWluIGxpc3Qgb2YgaW5saW5lIHRva2VucykuIFlvdSBzaG91bGQgbm90IGNhbGwgdGhpc1xuICogbWV0aG9kIGRpcmVjdGx5LCB1bnRpbCB5b3Ugd3JpdGUgY3VzdG9tIHJlbmRlcmVyIChmb3IgZXhhbXBsZSwgdG8gcHJvZHVjZVxuICogQVNUKS5cbiAqXG4gKiBgZW52YCBpcyB1c2VkIHRvIHBhc3MgZGF0YSBiZXR3ZWVuIFwiZGlzdHJpYnV0ZWRcIiBydWxlcyAoYHt9YCBieSBkZWZhdWx0KS5cbiAqIEZvciBleGFtcGxlLCByZWZlcmVuY2VzIGFyZSBwYXJzZWQgaW4gZGlmZmVyZW50IGNoYWlucywgYW5kIG5lZWQgc2FuZGJveFxuICogdG8gc3RvcmUgaW50ZXJtZWRpYXRlIHJlc3VsdHMuIENhbiBiZSB1c2VkIHRvIGluamVjdCBkYXRhIGluIHNwZWNpZmljIGNhc2VzLlxuICogWW91IHdpbGwgbm90IG5lZWQgaXQgd2l0aCBoaWdoIHByb2JhYmlsaXR5LlxuICoqL1xuTWFya2Rvd25JdC5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAoc3JjLCBlbnYpIHtcbiAgdmFyIHN0YXRlID0gbmV3IHRoaXMuY29yZS5TdGF0ZShzcmMsIHRoaXMsIGVudik7XG5cbiAgdGhpcy5jb3JlLnByb2Nlc3Moc3RhdGUpO1xuXG4gIHJldHVybiBzdGF0ZS50b2tlbnM7XG59O1xuXG5cbi8qKlxuICogTWFya2Rvd25JdC5yZW5kZXIoc3JjIFssIGVudl0pIC0+IFN0cmluZ1xuICogLSBzcmMgKFN0cmluZyk6IHNvdXJjZSBzdHJpbmdcbiAqIC0gZW52IChPYmplY3QpOiBlbnZpcm9ubWVudCBzYW5kYm94XG4gKlxuICogUmVuZGVyIG1hcmtkb3duIHN0cmluZyBpbnRvIGh0bWwuIEl0IGRvZXMgYWxsIG1hZ2ljIGZvciB5b3UgOikuXG4gKlxuICogYGVudmAgY2FuIGJlIHVzZWQgdG8gaW5qZWN0IGFkZGl0aW9uYWwgbWV0YWRhdGEgKGB7fWAgYnkgZGVmYXVsdCkuXG4gKiBCdXQgeW91IHdpbGwgbm90IG5lZWQgaXQgd2l0aCBoaWdoIHByb2JhYmlsaXR5LiBTZWUgYWxzbyBjb21tZW50XG4gKiBpbiBbW01hcmtkb3duSXQucGFyc2VdXS5cbiAqKi9cbk1hcmtkb3duSXQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChzcmMsIGVudikge1xuICBlbnYgPSBlbnYgfHwge307XG5cbiAgcmV0dXJuIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMucGFyc2Uoc3JjLCBlbnYpLCB0aGlzLm9wdGlvbnMsIGVudik7XG59O1xuXG5cbi8qKiBpbnRlcm5hbFxuICogTWFya2Rvd25JdC5wYXJzZUlubGluZShzcmMsIGVudikgLT4gQXJyYXlcbiAqIC0gc3JjIChTdHJpbmcpOiBzb3VyY2Ugc3RyaW5nXG4gKiAtIGVudiAoT2JqZWN0KTogZW52aXJvbm1lbnQgc2FuZGJveFxuICpcbiAqIFRoZSBzYW1lIGFzIFtbTWFya2Rvd25JdC5wYXJzZV1dIGJ1dCBza2lwIGFsbCBibG9jayBydWxlcy4gSXQgcmV0dXJucyB0aGVcbiAqIGJsb2NrIHRva2VucyBsaXN0IHdpdGggdGggc2luZ2xlIGBpbmxpbmVgIGVsZW1lbnQsIGNvbnRhaW5pbmcgcGFyc2VkIGlubGluZVxuICogdG9rZW5zIGluIGBjaGlsZHJlbmAgcHJvcGVydHkuXG4gKiovXG5NYXJrZG93bkl0LnByb3RvdHlwZS5wYXJzZUlubGluZSA9IGZ1bmN0aW9uIChzcmMsIGVudikge1xuICB2YXIgc3RhdGUgPSBuZXcgdGhpcy5jb3JlLlN0YXRlKHNyYywgdGhpcywgZW52KTtcblxuICBzdGF0ZS5pbmxpbmVNb2RlID0gdHJ1ZTtcbiAgdGhpcy5jb3JlLnByb2Nlc3Moc3RhdGUpO1xuXG4gIHJldHVybiBzdGF0ZS50b2tlbnM7XG59O1xuXG5cbi8qKlxuICogTWFya2Rvd25JdC5yZW5kZXJJbmxpbmUoc3JjIFssIGVudl0pIC0+IFN0cmluZ1xuICogLSBzcmMgKFN0cmluZyk6IHNvdXJjZSBzdHJpbmdcbiAqIC0gZW52IChPYmplY3QpOiBlbnZpcm9ubWVudCBzYW5kYm94XG4gKlxuICogU2ltaWxhciB0byBbW01hcmtkb3duSXQucmVuZGVyXV0gYnV0IGZvciBzaW5nbGUgcGFyYWdyYXBoIGNvbnRlbnQuIFJlc3VsdFxuICogd2lsbCBOT1QgYmUgd3JhcHBlZCBpbnRvIGA8cD5gIHRhZ3MuXG4gKiovXG5NYXJrZG93bkl0LnByb3RvdHlwZS5yZW5kZXJJbmxpbmUgPSBmdW5jdGlvbiAoc3JjLCBlbnYpIHtcbiAgZW52ID0gZW52IHx8IHt9O1xuXG4gIHJldHVybiB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnBhcnNlSW5saW5lKHNyYywgZW52KSwgdGhpcy5vcHRpb25zLCBlbnYpO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcmtkb3duSXQ7XG4iLCIvKiogaW50ZXJuYWxcbiAqIGNsYXNzIFBhcnNlckJsb2NrXG4gKlxuICogQmxvY2stbGV2ZWwgdG9rZW5pemVyLlxuICoqL1xuJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBSdWxlciAgICAgICAgICAgPSByZXF1aXJlKCcuL3J1bGVyJyk7XG5cblxudmFyIF9ydWxlcyA9IFtcbiAgLy8gRmlyc3QgMiBwYXJhbXMgLSBydWxlIG5hbWUgJiBzb3VyY2UuIFNlY29uZGFyeSBhcnJheSAtIGxpc3Qgb2YgcnVsZXMsXG4gIC8vIHdoaWNoIGNhbiBiZSB0ZXJtaW5hdGVkIGJ5IHRoaXMgb25lLlxuICBbICdjb2RlJywgICAgICAgcmVxdWlyZSgnLi9ydWxlc19ibG9jay9jb2RlJykgXSxcbiAgWyAnZmVuY2UnLCAgICAgIHJlcXVpcmUoJy4vcnVsZXNfYmxvY2svZmVuY2UnKSwgICAgICBbICdwYXJhZ3JhcGgnLCAncmVmZXJlbmNlJywgJ2Jsb2NrcXVvdGUnLCAnbGlzdCcgXSBdLFxuICBbICdibG9ja3F1b3RlJywgcmVxdWlyZSgnLi9ydWxlc19ibG9jay9ibG9ja3F1b3RlJyksIFsgJ3BhcmFncmFwaCcsICdyZWZlcmVuY2UnLCAnbGlzdCcgXSBdLFxuICBbICdocicsICAgICAgICAgcmVxdWlyZSgnLi9ydWxlc19ibG9jay9ocicpLCAgICAgICAgIFsgJ3BhcmFncmFwaCcsICdyZWZlcmVuY2UnLCAnYmxvY2txdW90ZScsICdsaXN0JyBdIF0sXG4gIFsgJ2xpc3QnLCAgICAgICByZXF1aXJlKCcuL3J1bGVzX2Jsb2NrL2xpc3QnKSwgICAgICAgWyAncGFyYWdyYXBoJywgJ3JlZmVyZW5jZScsICdibG9ja3F1b3RlJyBdIF0sXG4gIFsgJ3JlZmVyZW5jZScsICByZXF1aXJlKCcuL3J1bGVzX2Jsb2NrL3JlZmVyZW5jZScpIF0sXG4gIFsgJ2hlYWRpbmcnLCAgICByZXF1aXJlKCcuL3J1bGVzX2Jsb2NrL2hlYWRpbmcnKSwgICAgWyAncGFyYWdyYXBoJywgJ3JlZmVyZW5jZScsICdibG9ja3F1b3RlJyBdIF0sXG4gIFsgJ2xoZWFkaW5nJywgICByZXF1aXJlKCcuL3J1bGVzX2Jsb2NrL2xoZWFkaW5nJykgXSxcbiAgWyAnaHRtbF9ibG9jaycsIHJlcXVpcmUoJy4vcnVsZXNfYmxvY2svaHRtbF9ibG9jaycpLCBbICdwYXJhZ3JhcGgnLCAncmVmZXJlbmNlJywgJ2Jsb2NrcXVvdGUnIF0gXSxcbiAgWyAndGFibGUnLCAgICAgIHJlcXVpcmUoJy4vcnVsZXNfYmxvY2svdGFibGUnKSwgICAgICBbICdwYXJhZ3JhcGgnLCAncmVmZXJlbmNlJyBdIF0sXG4gIFsgJ3BhcmFncmFwaCcsICByZXF1aXJlKCcuL3J1bGVzX2Jsb2NrL3BhcmFncmFwaCcpIF1cbl07XG5cblxuLyoqXG4gKiBuZXcgUGFyc2VyQmxvY2soKVxuICoqL1xuZnVuY3Rpb24gUGFyc2VyQmxvY2soKSB7XG4gIC8qKlxuICAgKiBQYXJzZXJCbG9jayNydWxlciAtPiBSdWxlclxuICAgKlxuICAgKiBbW1J1bGVyXV0gaW5zdGFuY2UuIEtlZXAgY29uZmlndXJhdGlvbiBvZiBibG9jayBydWxlcy5cbiAgICoqL1xuICB0aGlzLnJ1bGVyID0gbmV3IFJ1bGVyKCk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBfcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICB0aGlzLnJ1bGVyLnB1c2goX3J1bGVzW2ldWzBdLCBfcnVsZXNbaV1bMV0sIHsgYWx0OiAoX3J1bGVzW2ldWzJdIHx8IFtdKS5zbGljZSgpIH0pO1xuICB9XG59XG5cblxuLy8gR2VuZXJhdGUgdG9rZW5zIGZvciBpbnB1dCByYW5nZVxuLy9cblBhcnNlckJsb2NrLnByb3RvdHlwZS50b2tlbml6ZSA9IGZ1bmN0aW9uIChzdGF0ZSwgc3RhcnRMaW5lLCBlbmRMaW5lKSB7XG4gIHZhciBvaywgaSxcbiAgICAgIHJ1bGVzID0gdGhpcy5ydWxlci5nZXRSdWxlcygnJyksXG4gICAgICBsZW4gPSBydWxlcy5sZW5ndGgsXG4gICAgICBsaW5lID0gc3RhcnRMaW5lLFxuICAgICAgaGFzRW1wdHlMaW5lcyA9IGZhbHNlLFxuICAgICAgbWF4TmVzdGluZyA9IHN0YXRlLm1kLm9wdGlvbnMubWF4TmVzdGluZztcblxuICB3aGlsZSAobGluZSA8IGVuZExpbmUpIHtcbiAgICBzdGF0ZS5saW5lID0gbGluZSA9IHN0YXRlLnNraXBFbXB0eUxpbmVzKGxpbmUpO1xuICAgIGlmIChsaW5lID49IGVuZExpbmUpIHsgYnJlYWs7IH1cblxuICAgIC8vIFRlcm1pbmF0aW9uIGNvbmRpdGlvbiBmb3IgbmVzdGVkIGNhbGxzLlxuICAgIC8vIE5lc3RlZCBjYWxscyBjdXJyZW50bHkgdXNlZCBmb3IgYmxvY2txdW90ZXMgJiBsaXN0c1xuICAgIGlmIChzdGF0ZS50U2hpZnRbbGluZV0gPCBzdGF0ZS5ibGtJbmRlbnQpIHsgYnJlYWs7IH1cblxuICAgIC8vIElmIG5lc3RpbmcgbGV2ZWwgZXhjZWVkZWQgLSBza2lwIHRhaWwgdG8gdGhlIGVuZC4gVGhhdCdzIG5vdCBvcmRpbmFyeVxuICAgIC8vIHNpdHVhdGlvbiBhbmQgd2Ugc2hvdWxkIG5vdCBjYXJlIGFib3V0IGNvbnRlbnQuXG4gICAgaWYgKHN0YXRlLmxldmVsID49IG1heE5lc3RpbmcpIHtcbiAgICAgIHN0YXRlLmxpbmUgPSBlbmRMaW5lO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gVHJ5IGFsbCBwb3NzaWJsZSBydWxlcy5cbiAgICAvLyBPbiBzdWNjZXNzLCBydWxlIHNob3VsZDpcbiAgICAvL1xuICAgIC8vIC0gdXBkYXRlIGBzdGF0ZS5saW5lYFxuICAgIC8vIC0gdXBkYXRlIGBzdGF0ZS50b2tlbnNgXG4gICAgLy8gLSByZXR1cm4gdHJ1ZVxuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBvayA9IHJ1bGVzW2ldKHN0YXRlLCBsaW5lLCBlbmRMaW5lLCBmYWxzZSk7XG4gICAgICBpZiAob2spIHsgYnJlYWs7IH1cbiAgICB9XG5cbiAgICAvLyBzZXQgc3RhdGUudGlnaHQgaWZmIHdlIGhhZCBhbiBlbXB0eSBsaW5lIGJlZm9yZSBjdXJyZW50IHRhZ1xuICAgIC8vIGkuZS4gbGF0ZXN0IGVtcHR5IGxpbmUgc2hvdWxkIG5vdCBjb3VudFxuICAgIHN0YXRlLnRpZ2h0ID0gIWhhc0VtcHR5TGluZXM7XG5cbiAgICAvLyBwYXJhZ3JhcGggbWlnaHQgXCJlYXRcIiBvbmUgbmV3bGluZSBhZnRlciBpdCBpbiBuZXN0ZWQgbGlzdHNcbiAgICBpZiAoc3RhdGUuaXNFbXB0eShzdGF0ZS5saW5lIC0gMSkpIHtcbiAgICAgIGhhc0VtcHR5TGluZXMgPSB0cnVlO1xuICAgIH1cblxuICAgIGxpbmUgPSBzdGF0ZS5saW5lO1xuXG4gICAgaWYgKGxpbmUgPCBlbmRMaW5lICYmIHN0YXRlLmlzRW1wdHkobGluZSkpIHtcbiAgICAgIGhhc0VtcHR5TGluZXMgPSB0cnVlO1xuICAgICAgbGluZSsrO1xuXG4gICAgICAvLyB0d28gZW1wdHkgbGluZXMgc2hvdWxkIHN0b3AgdGhlIHBhcnNlciBpbiBsaXN0IG1vZGVcbiAgICAgIGlmIChsaW5lIDwgZW5kTGluZSAmJiBzdGF0ZS5wYXJlbnRUeXBlID09PSAnbGlzdCcgJiYgc3RhdGUuaXNFbXB0eShsaW5lKSkgeyBicmVhazsgfVxuICAgICAgc3RhdGUubGluZSA9IGxpbmU7XG4gICAgfVxuICB9XG59O1xuXG5cbi8qKlxuICogUGFyc2VyQmxvY2sucGFyc2Uoc3RyLCBtZCwgZW52LCBvdXRUb2tlbnMpXG4gKlxuICogUHJvY2VzcyBpbnB1dCBzdHJpbmcgYW5kIHB1c2ggYmxvY2sgdG9rZW5zIGludG8gYG91dFRva2Vuc2BcbiAqKi9cblBhcnNlckJsb2NrLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uIChzcmMsIG1kLCBlbnYsIG91dFRva2Vucykge1xuICB2YXIgc3RhdGU7XG5cbiAgaWYgKCFzcmMpIHsgcmV0dXJuIFtdOyB9XG5cbiAgc3RhdGUgPSBuZXcgdGhpcy5TdGF0ZShzcmMsIG1kLCBlbnYsIG91dFRva2Vucyk7XG5cbiAgdGhpcy50b2tlbml6ZShzdGF0ZSwgc3RhdGUubGluZSwgc3RhdGUubGluZU1heCk7XG59O1xuXG5cblBhcnNlckJsb2NrLnByb3RvdHlwZS5TdGF0ZSA9IHJlcXVpcmUoJy4vcnVsZXNfYmxvY2svc3RhdGVfYmxvY2snKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlckJsb2NrO1xuIiwiLyoqIGludGVybmFsXG4gKiBjbGFzcyBDb3JlXG4gKlxuICogVG9wLWxldmVsIHJ1bGVzIGV4ZWN1dG9yLiBHbHVlcyBibG9jay9pbmxpbmUgcGFyc2VycyBhbmQgZG9lcyBpbnRlcm1lZGlhdGVcbiAqIHRyYW5zZm9ybWF0aW9ucy5cbiAqKi9cbid1c2Ugc3RyaWN0JztcblxuXG52YXIgUnVsZXIgID0gcmVxdWlyZSgnLi9ydWxlcicpO1xuXG5cbnZhciBfcnVsZXMgPSBbXG4gIFsgJ25vcm1hbGl6ZScsICAgICAgcmVxdWlyZSgnLi9ydWxlc19jb3JlL25vcm1hbGl6ZScpICAgICAgXSxcbiAgWyAnYmxvY2snLCAgICAgICAgICByZXF1aXJlKCcuL3J1bGVzX2NvcmUvYmxvY2snKSAgICAgICAgICBdLFxuICBbICdpbmxpbmUnLCAgICAgICAgIHJlcXVpcmUoJy4vcnVsZXNfY29yZS9pbmxpbmUnKSAgICAgICAgIF0sXG4gIFsgJ3JlcGxhY2VtZW50cycsICAgcmVxdWlyZSgnLi9ydWxlc19jb3JlL3JlcGxhY2VtZW50cycpICAgXSxcbiAgWyAnc21hcnRxdW90ZXMnLCAgICByZXF1aXJlKCcuL3J1bGVzX2NvcmUvc21hcnRxdW90ZXMnKSAgICBdLFxuICBbICdsaW5raWZ5JywgICAgICAgIHJlcXVpcmUoJy4vcnVsZXNfY29yZS9saW5raWZ5JykgICAgICAgIF1cbl07XG5cblxuLyoqXG4gKiBuZXcgQ29yZSgpXG4gKiovXG5mdW5jdGlvbiBDb3JlKCkge1xuICAvKipcbiAgICogQ29yZSNydWxlciAtPiBSdWxlclxuICAgKlxuICAgKiBbW1J1bGVyXV0gaW5zdGFuY2UuIEtlZXAgY29uZmlndXJhdGlvbiBvZiBjb3JlIHJ1bGVzLlxuICAgKiovXG4gIHRoaXMucnVsZXIgPSBuZXcgUnVsZXIoKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IF9ydWxlcy5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMucnVsZXIucHVzaChfcnVsZXNbaV1bMF0sIF9ydWxlc1tpXVsxXSk7XG4gIH1cbn1cblxuXG4vKipcbiAqIENvcmUucHJvY2VzcyhzdGF0ZSlcbiAqXG4gKiBFeGVjdXRlcyBjb3JlIGNoYWluIHJ1bGVzLlxuICoqL1xuQ29yZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICB2YXIgaSwgbCwgcnVsZXM7XG5cbiAgcnVsZXMgPSB0aGlzLnJ1bGVyLmdldFJ1bGVzKCcnKTtcblxuICBmb3IgKGkgPSAwLCBsID0gcnVsZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgcnVsZXNbaV0oc3RhdGUpO1xuICB9XG59O1xuXG5Db3JlLnByb3RvdHlwZS5TdGF0ZSA9IHJlcXVpcmUoJy4vcnVsZXNfY29yZS9zdGF0ZV9jb3JlJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBDb3JlO1xuIiwiLyoqIGludGVybmFsXG4gKiBjbGFzcyBQYXJzZXJJbmxpbmVcbiAqXG4gKiBUb2tlbml6ZXMgcGFyYWdyYXBoIGNvbnRlbnQuXG4gKiovXG4ndXNlIHN0cmljdCc7XG5cblxudmFyIFJ1bGVyICAgICAgICAgICA9IHJlcXVpcmUoJy4vcnVsZXInKTtcbnZhciByZXBsYWNlRW50aXRpZXMgPSByZXF1aXJlKCcuL2NvbW1vbi91dGlscycpLnJlcGxhY2VFbnRpdGllcztcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFBhcnNlciBydWxlc1xuXG52YXIgX3J1bGVzID0gW1xuICBbICd0ZXh0JywgICAgICAgICAgICByZXF1aXJlKCcuL3J1bGVzX2lubGluZS90ZXh0JykgXSxcbiAgWyAnbmV3bGluZScsICAgICAgICAgcmVxdWlyZSgnLi9ydWxlc19pbmxpbmUvbmV3bGluZScpIF0sXG4gIFsgJ2VzY2FwZScsICAgICAgICAgIHJlcXVpcmUoJy4vcnVsZXNfaW5saW5lL2VzY2FwZScpIF0sXG4gIFsgJ2JhY2t0aWNrcycsICAgICAgIHJlcXVpcmUoJy4vcnVsZXNfaW5saW5lL2JhY2t0aWNrcycpIF0sXG4gIFsgJ3N0cmlrZXRocm91Z2gnLCAgIHJlcXVpcmUoJy4vcnVsZXNfaW5saW5lL3N0cmlrZXRocm91Z2gnKSBdLFxuICBbICdlbXBoYXNpcycsICAgICAgICByZXF1aXJlKCcuL3J1bGVzX2lubGluZS9lbXBoYXNpcycpIF0sXG4gIFsgJ2xpbmsnLCAgICAgICAgICAgIHJlcXVpcmUoJy4vcnVsZXNfaW5saW5lL2xpbmsnKSBdLFxuICBbICdpbWFnZScsICAgICAgICAgICByZXF1aXJlKCcuL3J1bGVzX2lubGluZS9pbWFnZScpIF0sXG4gIFsgJ2F1dG9saW5rJywgICAgICAgIHJlcXVpcmUoJy4vcnVsZXNfaW5saW5lL2F1dG9saW5rJykgXSxcbiAgWyAnaHRtbF9pbmxpbmUnLCAgICAgcmVxdWlyZSgnLi9ydWxlc19pbmxpbmUvaHRtbF9pbmxpbmUnKSBdLFxuICBbICdlbnRpdHknLCAgICAgICAgICByZXF1aXJlKCcuL3J1bGVzX2lubGluZS9lbnRpdHknKSBdXG5dO1xuXG5cbnZhciBCQURfUFJPVE9DT0xTID0gWyAndmJzY3JpcHQnLCAnamF2YXNjcmlwdCcsICdmaWxlJyBdO1xuXG5mdW5jdGlvbiB2YWxpZGF0ZUxpbmsodXJsKSB7XG4gIC8vIENhcmUgYWJvdXQgZGlnaXRhbCBlbnRpdGllcyBcImphdmFzY3JpcHQmI3gzQTthbGVydCgxKVwiXG4gIHZhciBzdHIgPSByZXBsYWNlRW50aXRpZXModXJsKTtcblxuICBzdHIgPSBzdHIudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG5cbiAgaWYgKHN0ci5pbmRleE9mKCc6JykgPj0gMCAmJiBCQURfUFJPVE9DT0xTLmluZGV4T2Yoc3RyLnNwbGl0KCc6JylbMF0pID49IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cblxuLyoqXG4gKiBuZXcgUGFyc2VySW5saW5lKClcbiAqKi9cbmZ1bmN0aW9uIFBhcnNlcklubGluZSgpIHtcbiAgLyoqXG4gICAqIFBhcnNlcklubGluZSN2YWxpZGF0ZUxpbmsodXJsKSAtPiBCb29sZWFuXG4gICAqXG4gICAqIExpbmsgdmFsaWRhdGlvbiBmdW5jdGlvbi4gQ29tbW9uTWFyayBhbGxvd3MgdG9vIG11Y2ggaW4gbGlua3MuIEJ5IGRlZmF1bHRcbiAgICogd2UgZGlzYWJsZSBgamF2YXNjcmlwdDpgIGFuZCBgdmJzY3JpcHQ6YCBzY2hlbWFzLiBZb3UgY2FuIGNoYW5nZSB0aGlzXG4gICAqIGJlaGF2aW91ci5cbiAgICpcbiAgICogYGBgamF2YXNjcmlwdFxuICAgKiB2YXIgbWQgPSByZXF1aXJlKCdtYXJrZG93bi1pdCcpKCk7XG4gICAqIC8vIGVuYWJsZSBldmVyeXRoaW5nXG4gICAqIG1kLmlubGluZS52YWxpZGF0ZUxpbmsgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0cnVlOyB9XG4gICAqIGBgYFxuICAgKiovXG4gIHRoaXMudmFsaWRhdGVMaW5rID0gdmFsaWRhdGVMaW5rO1xuXG4gIC8qKlxuICAgKiBQYXJzZXJJbmxpbmUjcnVsZXIgLT4gUnVsZXJcbiAgICpcbiAgICogW1tSdWxlcl1dIGluc3RhbmNlLiBLZWVwIGNvbmZpZ3VyYXRpb24gb2YgaW5saW5lIHJ1bGVzLlxuICAgKiovXG4gIHRoaXMucnVsZXIgPSBuZXcgUnVsZXIoKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IF9ydWxlcy5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMucnVsZXIucHVzaChfcnVsZXNbaV1bMF0sIF9ydWxlc1tpXVsxXSk7XG4gIH1cbn1cblxuXG4vLyBTa2lwIHNpbmdsZSB0b2tlbiBieSBydW5uaW5nIGFsbCBydWxlcyBpbiB2YWxpZGF0aW9uIG1vZGU7XG4vLyByZXR1cm5zIGB0cnVlYCBpZiBhbnkgcnVsZSByZXBvcnRlZCBzdWNjZXNzXG4vL1xuUGFyc2VySW5saW5lLnByb3RvdHlwZS5za2lwVG9rZW4gPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgdmFyIGksIGNhY2hlZF9wb3MsIHBvcyA9IHN0YXRlLnBvcyxcbiAgICAgIHJ1bGVzID0gdGhpcy5ydWxlci5nZXRSdWxlcygnJyksXG4gICAgICBsZW4gPSBydWxlcy5sZW5ndGgsXG4gICAgICBtYXhOZXN0aW5nID0gc3RhdGUubWQub3B0aW9ucy5tYXhOZXN0aW5nO1xuXG5cbiAgaWYgKChjYWNoZWRfcG9zID0gc3RhdGUuY2FjaGVHZXQocG9zKSkgPiAwKSB7XG4gICAgc3RhdGUucG9zID0gY2FjaGVkX3BvcztcbiAgICByZXR1cm47XG4gIH1cblxuICAvKmlzdGFuYnVsIGlnbm9yZSBlbHNlKi9cbiAgaWYgKHN0YXRlLmxldmVsIDwgbWF4TmVzdGluZykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKHJ1bGVzW2ldKHN0YXRlLCB0cnVlKSkge1xuICAgICAgICBzdGF0ZS5jYWNoZVNldChwb3MsIHN0YXRlLnBvcyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdGF0ZS5wb3MrKztcbiAgc3RhdGUuY2FjaGVTZXQocG9zLCBzdGF0ZS5wb3MpO1xufTtcblxuXG4vLyBHZW5lcmF0ZSB0b2tlbnMgZm9yIGlucHV0IHJhbmdlXG4vL1xuUGFyc2VySW5saW5lLnByb3RvdHlwZS50b2tlbml6ZSA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICB2YXIgb2ssIGksXG4gICAgICBydWxlcyA9IHRoaXMucnVsZXIuZ2V0UnVsZXMoJycpLFxuICAgICAgbGVuID0gcnVsZXMubGVuZ3RoLFxuICAgICAgZW5kID0gc3RhdGUucG9zTWF4LFxuICAgICAgbWF4TmVzdGluZyA9IHN0YXRlLm1kLm9wdGlvbnMubWF4TmVzdGluZztcblxuICB3aGlsZSAoc3RhdGUucG9zIDwgZW5kKSB7XG4gICAgLy8gVHJ5IGFsbCBwb3NzaWJsZSBydWxlcy5cbiAgICAvLyBPbiBzdWNjZXNzLCBydWxlIHNob3VsZDpcbiAgICAvL1xuICAgIC8vIC0gdXBkYXRlIGBzdGF0ZS5wb3NgXG4gICAgLy8gLSB1cGRhdGUgYHN0YXRlLnRva2Vuc2BcbiAgICAvLyAtIHJldHVybiB0cnVlXG5cbiAgICBpZiAoc3RhdGUubGV2ZWwgPCBtYXhOZXN0aW5nKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgb2sgPSBydWxlc1tpXShzdGF0ZSwgZmFsc2UpO1xuICAgICAgICBpZiAob2spIHsgYnJlYWs7IH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob2spIHtcbiAgICAgIGlmIChzdGF0ZS5wb3MgPj0gZW5kKSB7IGJyZWFrOyB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBzdGF0ZS5wZW5kaW5nICs9IHN0YXRlLnNyY1tzdGF0ZS5wb3MrK107XG4gIH1cblxuICBpZiAoc3RhdGUucGVuZGluZykge1xuICAgIHN0YXRlLnB1c2hQZW5kaW5nKCk7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBQYXJzZXJJbmxpbmUucGFyc2Uoc3RyLCBtZCwgZW52LCBvdXRUb2tlbnMpXG4gKlxuICogUHJvY2VzcyBpbnB1dCBzdHJpbmcgYW5kIHB1c2ggaW5saW5lIHRva2VucyBpbnRvIGBvdXRUb2tlbnNgXG4gKiovXG5QYXJzZXJJbmxpbmUucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKHN0ciwgbWQsIGVudiwgb3V0VG9rZW5zKSB7XG4gIHZhciBzdGF0ZSA9IG5ldyB0aGlzLlN0YXRlKHN0ciwgbWQsIGVudiwgb3V0VG9rZW5zKTtcblxuICB0aGlzLnRva2VuaXplKHN0YXRlKTtcbn07XG5cblxuUGFyc2VySW5saW5lLnByb3RvdHlwZS5TdGF0ZSA9IHJlcXVpcmUoJy4vcnVsZXNfaW5saW5lL3N0YXRlX2lubGluZScpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFyc2VySW5saW5lO1xuIiwiLy8gQ29tbW9ubWFyayBkZWZhdWx0IG9wdGlvbnNcblxuJ3VzZSBzdHJpY3QnO1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBvcHRpb25zOiB7XG4gICAgaHRtbDogICAgICAgICB0cnVlLCAgICAgICAgIC8vIEVuYWJsZSBIVE1MIHRhZ3MgaW4gc291cmNlXG4gICAgeGh0bWxPdXQ6ICAgICB0cnVlLCAgICAgICAgIC8vIFVzZSAnLycgdG8gY2xvc2Ugc2luZ2xlIHRhZ3MgKDxiciAvPilcbiAgICBicmVha3M6ICAgICAgIGZhbHNlLCAgICAgICAgLy8gQ29udmVydCAnXFxuJyBpbiBwYXJhZ3JhcGhzIGludG8gPGJyPlxuICAgIGxhbmdQcmVmaXg6ICAgJ2xhbmd1YWdlLScsICAvLyBDU1MgbGFuZ3VhZ2UgcHJlZml4IGZvciBmZW5jZWQgYmxvY2tzXG4gICAgbGlua2lmeTogICAgICBmYWxzZSwgICAgICAgIC8vIGF1dG9jb252ZXJ0IFVSTC1saWtlIHRleHRzIHRvIGxpbmtzXG5cbiAgICAvLyBFbmFibGUgc29tZSBsYW5ndWFnZS1uZXV0cmFsIHJlcGxhY2VtZW50cyArIHF1b3RlcyBiZWF1dGlmaWNhdGlvblxuICAgIHR5cG9ncmFwaGVyOiAgZmFsc2UsXG5cbiAgICAvLyBEb3VibGUgKyBzaW5nbGUgcXVvdGVzIHJlcGxhY2VtZW50IHBhaXJzLCB3aGVuIHR5cG9ncmFwaGVyIGVuYWJsZWQsXG4gICAgLy8gYW5kIHNtYXJ0cXVvdGVzIG9uLiBTZXQgZG91YmxlcyB0byAnwqvCuycgZm9yIFJ1c3NpYW4sICfigJ7igJwnIGZvciBHZXJtYW4uXG4gICAgcXVvdGVzOiAnXFx1MjAxY1xcdTIwMWRcXHUyMDE4XFx1MjAxOScgLyog4oCc4oCd4oCY4oCZICovLFxuXG4gICAgLy8gSGlnaGxpZ2h0ZXIgZnVuY3Rpb24uIFNob3VsZCByZXR1cm4gZXNjYXBlZCBIVE1MLFxuICAgIC8vIG9yICcnIGlmIGlucHV0IG5vdCBjaGFuZ2VkXG4gICAgLy9cbiAgICAvLyBmdW5jdGlvbiAoLypzdHIsIGxhbmcqLykgeyByZXR1cm4gJyc7IH1cbiAgICAvL1xuICAgIGhpZ2hsaWdodDogbnVsbCxcblxuICAgIG1heE5lc3Rpbmc6ICAgMjAgICAgICAgICAgICAvLyBJbnRlcm5hbCBwcm90ZWN0aW9uLCByZWN1cnNpb24gbGltaXRcbiAgfSxcblxuICBjb21wb25lbnRzOiB7XG5cbiAgICBjb3JlOiB7XG4gICAgICBydWxlczogW1xuICAgICAgICAnbm9ybWFsaXplJyxcbiAgICAgICAgJ2Jsb2NrJyxcbiAgICAgICAgJ2lubGluZSdcbiAgICAgIF1cbiAgICB9LFxuXG4gICAgYmxvY2s6IHtcbiAgICAgIHJ1bGVzOiBbXG4gICAgICAgICdibG9ja3F1b3RlJyxcbiAgICAgICAgJ2NvZGUnLFxuICAgICAgICAnZmVuY2UnLFxuICAgICAgICAnaGVhZGluZycsXG4gICAgICAgICdocicsXG4gICAgICAgICdodG1sX2Jsb2NrJyxcbiAgICAgICAgJ2xoZWFkaW5nJyxcbiAgICAgICAgJ2xpc3QnLFxuICAgICAgICAncmVmZXJlbmNlJyxcbiAgICAgICAgJ3BhcmFncmFwaCdcbiAgICAgIF1cbiAgICB9LFxuXG4gICAgaW5saW5lOiB7XG4gICAgICBydWxlczogW1xuICAgICAgICAnYXV0b2xpbmsnLFxuICAgICAgICAnYmFja3RpY2tzJyxcbiAgICAgICAgJ2VtcGhhc2lzJyxcbiAgICAgICAgJ2VudGl0eScsXG4gICAgICAgICdlc2NhcGUnLFxuICAgICAgICAnaHRtbF9pbmxpbmUnLFxuICAgICAgICAnaW1hZ2UnLFxuICAgICAgICAnbGluaycsXG4gICAgICAgICduZXdsaW5lJyxcbiAgICAgICAgJ3RleHQnXG4gICAgICBdXG4gICAgfVxuICB9XG59O1xuIiwiLy8gbWFya2Rvd24taXQgZGVmYXVsdCBvcHRpb25zXG5cbid1c2Ugc3RyaWN0JztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgb3B0aW9uczoge1xuICAgIGh0bWw6ICAgICAgICAgZmFsc2UsICAgICAgICAvLyBFbmFibGUgSFRNTCB0YWdzIGluIHNvdXJjZVxuICAgIHhodG1sT3V0OiAgICAgZmFsc2UsICAgICAgICAvLyBVc2UgJy8nIHRvIGNsb3NlIHNpbmdsZSB0YWdzICg8YnIgLz4pXG4gICAgYnJlYWtzOiAgICAgICBmYWxzZSwgICAgICAgIC8vIENvbnZlcnQgJ1xcbicgaW4gcGFyYWdyYXBocyBpbnRvIDxicj5cbiAgICBsYW5nUHJlZml4OiAgICdsYW5ndWFnZS0nLCAgLy8gQ1NTIGxhbmd1YWdlIHByZWZpeCBmb3IgZmVuY2VkIGJsb2Nrc1xuICAgIGxpbmtpZnk6ICAgICAgZmFsc2UsICAgICAgICAvLyBhdXRvY29udmVydCBVUkwtbGlrZSB0ZXh0cyB0byBsaW5rc1xuXG4gICAgLy8gRW5hYmxlIHNvbWUgbGFuZ3VhZ2UtbmV1dHJhbCByZXBsYWNlbWVudHMgKyBxdW90ZXMgYmVhdXRpZmljYXRpb25cbiAgICB0eXBvZ3JhcGhlcjogIGZhbHNlLFxuXG4gICAgLy8gRG91YmxlICsgc2luZ2xlIHF1b3RlcyByZXBsYWNlbWVudCBwYWlycywgd2hlbiB0eXBvZ3JhcGhlciBlbmFibGVkLFxuICAgIC8vIGFuZCBzbWFydHF1b3RlcyBvbi4gU2V0IGRvdWJsZXMgdG8gJ8KrwrsnIGZvciBSdXNzaWFuLCAn4oCe4oCcJyBmb3IgR2VybWFuLlxuICAgIHF1b3RlczogJ1xcdTIwMWNcXHUyMDFkXFx1MjAxOFxcdTIwMTknIC8qIOKAnOKAneKAmOKAmSAqLyxcblxuICAgIC8vIEhpZ2hsaWdodGVyIGZ1bmN0aW9uLiBTaG91bGQgcmV0dXJuIGVzY2FwZWQgSFRNTCxcbiAgICAvLyBvciAnJyBpZiBpbnB1dCBub3QgY2hhbmdlZFxuICAgIC8vXG4gICAgLy8gZnVuY3Rpb24gKC8qc3RyLCBsYW5nKi8pIHsgcmV0dXJuICcnOyB9XG4gICAgLy9cbiAgICBoaWdobGlnaHQ6IG51bGwsXG5cbiAgICBtYXhOZXN0aW5nOiAgIDIwICAgICAgICAgICAgLy8gSW50ZXJuYWwgcHJvdGVjdGlvbiwgcmVjdXJzaW9uIGxpbWl0XG4gIH0sXG5cbiAgY29tcG9uZW50czoge1xuXG4gICAgY29yZToge30sXG4gICAgYmxvY2s6IHt9LFxuICAgIGlubGluZToge31cbiAgfVxufTtcbiIsIi8vIFwiWmVyb1wiIHByZXNldCwgd2l0aCBub3RoaW5nIGVuYWJsZWQuIFVzZWZ1bCBmb3IgbWFudWFsIGNvbmZpZ3VyaW5nIG9mIHNpbXBsZVxuLy8gbW9kZXMuIEZvciBleGFtcGxlLCB0byBwYXJzZSBib2xkL2l0YWxpYyBvbmx5LlxuXG4ndXNlIHN0cmljdCc7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG9wdGlvbnM6IHtcbiAgICBodG1sOiAgICAgICAgIGZhbHNlLCAgICAgICAgLy8gRW5hYmxlIEhUTUwgdGFncyBpbiBzb3VyY2VcbiAgICB4aHRtbE91dDogICAgIGZhbHNlLCAgICAgICAgLy8gVXNlICcvJyB0byBjbG9zZSBzaW5nbGUgdGFncyAoPGJyIC8+KVxuICAgIGJyZWFrczogICAgICAgZmFsc2UsICAgICAgICAvLyBDb252ZXJ0ICdcXG4nIGluIHBhcmFncmFwaHMgaW50byA8YnI+XG4gICAgbGFuZ1ByZWZpeDogICAnbGFuZ3VhZ2UtJywgIC8vIENTUyBsYW5ndWFnZSBwcmVmaXggZm9yIGZlbmNlZCBibG9ja3NcbiAgICBsaW5raWZ5OiAgICAgIGZhbHNlLCAgICAgICAgLy8gYXV0b2NvbnZlcnQgVVJMLWxpa2UgdGV4dHMgdG8gbGlua3NcblxuICAgIC8vIEVuYWJsZSBzb21lIGxhbmd1YWdlLW5ldXRyYWwgcmVwbGFjZW1lbnRzICsgcXVvdGVzIGJlYXV0aWZpY2F0aW9uXG4gICAgdHlwb2dyYXBoZXI6ICBmYWxzZSxcblxuICAgIC8vIERvdWJsZSArIHNpbmdsZSBxdW90ZXMgcmVwbGFjZW1lbnQgcGFpcnMsIHdoZW4gdHlwb2dyYXBoZXIgZW5hYmxlZCxcbiAgICAvLyBhbmQgc21hcnRxdW90ZXMgb24uIFNldCBkb3VibGVzIHRvICfCq8K7JyBmb3IgUnVzc2lhbiwgJ+KAnuKAnCcgZm9yIEdlcm1hbi5cbiAgICBxdW90ZXM6ICdcXHUyMDFjXFx1MjAxZFxcdTIwMThcXHUyMDE5JyAvKiDigJzigJ3igJjigJkgKi8sXG5cbiAgICAvLyBIaWdobGlnaHRlciBmdW5jdGlvbi4gU2hvdWxkIHJldHVybiBlc2NhcGVkIEhUTUwsXG4gICAgLy8gb3IgJycgaWYgaW5wdXQgbm90IGNoYW5nZWRcbiAgICAvL1xuICAgIC8vIGZ1bmN0aW9uICgvKnN0ciwgbGFuZyovKSB7IHJldHVybiAnJzsgfVxuICAgIC8vXG4gICAgaGlnaGxpZ2h0OiBudWxsLFxuXG4gICAgbWF4TmVzdGluZzogICAyMCAgICAgICAgICAgIC8vIEludGVybmFsIHByb3RlY3Rpb24sIHJlY3Vyc2lvbiBsaW1pdFxuICB9LFxuXG4gIGNvbXBvbmVudHM6IHtcblxuICAgIGNvcmU6IHtcbiAgICAgIHJ1bGVzOiBbXG4gICAgICAgICdub3JtYWxpemUnLFxuICAgICAgICAnYmxvY2snLFxuICAgICAgICAnaW5saW5lJ1xuICAgICAgXVxuICAgIH0sXG5cbiAgICBibG9jazoge1xuICAgICAgcnVsZXM6IFtcbiAgICAgICAgJ3BhcmFncmFwaCdcbiAgICAgIF1cbiAgICB9LFxuXG4gICAgaW5saW5lOiB7XG4gICAgICBydWxlczogW1xuICAgICAgICAndGV4dCdcbiAgICAgIF1cbiAgICB9XG4gIH1cbn07XG4iLCIvKipcbiAqIGNsYXNzIFJlbmRlcmVyXG4gKlxuICogR2VuZXJhdGVzIEhUTUwgZnJvbSBwYXJzZWQgdG9rZW4gc3RyZWFtLiBFYWNoIGluc3RhbmNlIGhhcyBpbmRlcGVuZGVudFxuICogY29weSBvZiBydWxlcy4gVGhvc2UgY2FuIGJlIHJld3JpdHRlbiB3aXRoIGVhc2UuIEFsc28sIHlvdSBjYW4gYWRkIG5ld1xuICogcnVsZXMgaWYgeW91IGNyZWF0ZSBwbHVnaW4gYW5kIGFkZHMgbmV3IHRva2VuIHR5cGVzLlxuICoqL1xuJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBhc3NpZ24gICAgICAgICAgPSByZXF1aXJlKCcuL2NvbW1vbi91dGlscycpLmFzc2lnbjtcbnZhciB1bmVzY2FwZU1kICAgICAgPSByZXF1aXJlKCcuL2NvbW1vbi91dGlscycpLnVuZXNjYXBlTWQ7XG52YXIgcmVwbGFjZUVudGl0aWVzID0gcmVxdWlyZSgnLi9jb21tb24vdXRpbHMnKS5yZXBsYWNlRW50aXRpZXM7XG52YXIgZXNjYXBlSHRtbCAgICAgID0gcmVxdWlyZSgnLi9jb21tb24vdXRpbHMnKS5lc2NhcGVIdG1sO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciBydWxlcyA9IHt9O1xuXG5cbnJ1bGVzLmJsb2NrcXVvdGVfb3BlbiAgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnPGJsb2NrcXVvdGU+XFxuJzsgfTtcbnJ1bGVzLmJsb2NrcXVvdGVfY2xvc2UgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnPC9ibG9ja3F1b3RlPlxcbic7IH07XG5cblxucnVsZXMuY29kZV9ibG9jayA9IGZ1bmN0aW9uICh0b2tlbnMsIGlkeCAvKiwgb3B0aW9ucywgZW52ICovKSB7XG4gIHJldHVybiAnPHByZT48Y29kZT4nICsgZXNjYXBlSHRtbCh0b2tlbnNbaWR4XS5jb250ZW50KSArICc8L2NvZGU+PC9wcmU+XFxuJztcbn07XG5ydWxlcy5jb2RlX2lubGluZSA9IGZ1bmN0aW9uICh0b2tlbnMsIGlkeCAvKiwgb3B0aW9ucywgZW52ICovKSB7XG4gIHJldHVybiAnPGNvZGU+JyArIGVzY2FwZUh0bWwodG9rZW5zW2lkeF0uY29udGVudCkgKyAnPC9jb2RlPic7XG59O1xuXG5cbnJ1bGVzLmZlbmNlID0gZnVuY3Rpb24gKHRva2VucywgaWR4LCBvcHRpb25zIC8qLCBlbnYsIHNlbGYqLykge1xuICB2YXIgdG9rZW4gPSB0b2tlbnNbaWR4XTtcbiAgdmFyIGxhbmdDbGFzcyA9ICcnO1xuICB2YXIgbGFuZ1ByZWZpeCA9IG9wdGlvbnMubGFuZ1ByZWZpeDtcbiAgdmFyIGxhbmdOYW1lID0gJyc7XG4gIHZhciBoaWdobGlnaHRlZDtcblxuICBpZiAodG9rZW4ucGFyYW1zKSB7XG4gICAgbGFuZ05hbWUgPSBlc2NhcGVIdG1sKHJlcGxhY2VFbnRpdGllcyh1bmVzY2FwZU1kKHRva2VuLnBhcmFtcy5zcGxpdCgvXFxzKy9nKVswXSkpKTtcbiAgICBsYW5nQ2xhc3MgPSAnIGNsYXNzPVwiJyArIGxhbmdQcmVmaXggKyBsYW5nTmFtZSArICdcIic7XG4gIH1cblxuICBpZiAob3B0aW9ucy5oaWdobGlnaHQpIHtcbiAgICBoaWdobGlnaHRlZCA9IG9wdGlvbnMuaGlnaGxpZ2h0KHRva2VuLmNvbnRlbnQsIGxhbmdOYW1lKSB8fCBlc2NhcGVIdG1sKHRva2VuLmNvbnRlbnQpO1xuICB9IGVsc2Uge1xuICAgIGhpZ2hsaWdodGVkID0gZXNjYXBlSHRtbCh0b2tlbi5jb250ZW50KTtcbiAgfVxuXG5cbiAgcmV0dXJuICAnPHByZT48Y29kZScgKyBsYW5nQ2xhc3MgKyAnPidcbiAgICAgICAgKyBoaWdobGlnaHRlZFxuICAgICAgICArICc8L2NvZGU+PC9wcmU+XFxuJztcbn07XG5cblxucnVsZXMuaGVhZGluZ19vcGVuID0gZnVuY3Rpb24gKHRva2VucywgaWR4IC8qLCBvcHRpb25zLCBlbnYgKi8pIHtcbiAgcmV0dXJuICc8aCcgKyB0b2tlbnNbaWR4XS5oTGV2ZWwgKyAnPic7XG59O1xucnVsZXMuaGVhZGluZ19jbG9zZSA9IGZ1bmN0aW9uICh0b2tlbnMsIGlkeCAvKiwgb3B0aW9ucywgZW52ICovKSB7XG4gIHJldHVybiAnPC9oJyArIHRva2Vuc1tpZHhdLmhMZXZlbCArICc+XFxuJztcbn07XG5cblxucnVsZXMuaHIgPSBmdW5jdGlvbiAodG9rZW5zLCBpZHgsIG9wdGlvbnMgLyosIGVudiAqLykge1xuICByZXR1cm4gKG9wdGlvbnMueGh0bWxPdXQgPyAnPGhyIC8+XFxuJyA6ICc8aHI+XFxuJyk7XG59O1xuXG5cbnJ1bGVzLmJ1bGxldF9saXN0X29wZW4gICA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICc8dWw+XFxuJzsgfTtcbnJ1bGVzLmJ1bGxldF9saXN0X2Nsb3NlICA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICc8L3VsPlxcbic7IH07XG5ydWxlcy5saXN0X2l0ZW1fb3BlbiAgICAgPSBmdW5jdGlvbiAodG9rZW5zLCBpZHggLyosIG9wdGlvbnMsIGVudiAqLykge1xuICB2YXIgbmV4dCA9IHRva2Vuc1tpZHggKyAxXTtcbiAgaWYgKChuZXh0LnR5cGUgPT09ICdsaXN0X2l0ZW1fY2xvc2UnKSB8fFxuICAgICAgKG5leHQudHlwZSA9PT0gJ3BhcmFncmFwaF9vcGVuJyAmJiBuZXh0LnRpZ2h0KSkge1xuICAgIHJldHVybiAnPGxpPic7XG4gIH1cbiAgcmV0dXJuICc8bGk+XFxuJztcbn07XG5ydWxlcy5saXN0X2l0ZW1fY2xvc2UgICAgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnPC9saT5cXG4nOyB9O1xucnVsZXMub3JkZXJlZF9saXN0X29wZW4gID0gZnVuY3Rpb24gKHRva2VucywgaWR4IC8qLCBvcHRpb25zLCBlbnYgKi8pIHtcbiAgaWYgKHRva2Vuc1tpZHhdLm9yZGVyID4gMSkge1xuICAgIHJldHVybiAnPG9sIHN0YXJ0PVwiJyArIHRva2Vuc1tpZHhdLm9yZGVyICsgJ1wiPlxcbic7XG4gIH1cbiAgcmV0dXJuICc8b2w+XFxuJztcbn07XG5ydWxlcy5vcmRlcmVkX2xpc3RfY2xvc2UgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnPC9vbD5cXG4nOyB9O1xuXG5cbnJ1bGVzLnBhcmFncmFwaF9vcGVuID0gZnVuY3Rpb24gKHRva2VucywgaWR4IC8qLCBvcHRpb25zLCBlbnYgKi8pIHtcbiAgcmV0dXJuIHRva2Vuc1tpZHhdLnRpZ2h0ID8gJycgOiAnPHA+Jztcbn07XG5ydWxlcy5wYXJhZ3JhcGhfY2xvc2UgPSBmdW5jdGlvbiAodG9rZW5zLCBpZHggLyosIG9wdGlvbnMsIGVudiAqLykge1xuICBpZiAodG9rZW5zW2lkeF0udGlnaHQgPT09IHRydWUpIHtcbiAgICByZXR1cm4gdG9rZW5zW2lkeCArIDFdLnR5cGUuc2xpY2UoLTUpID09PSAnY2xvc2UnID8gJycgOiAnXFxuJztcbiAgfVxuICByZXR1cm4gJzwvcD5cXG4nO1xufTtcblxuXG5ydWxlcy5saW5rX29wZW4gPSBmdW5jdGlvbiAodG9rZW5zLCBpZHggLyosIG9wdGlvbnMsIGVudiAqLykge1xuICB2YXIgdGl0bGUgPSB0b2tlbnNbaWR4XS50aXRsZSA/ICgnIHRpdGxlPVwiJyArIGVzY2FwZUh0bWwocmVwbGFjZUVudGl0aWVzKHRva2Vuc1tpZHhdLnRpdGxlKSkgKyAnXCInKSA6ICcnO1xuICB2YXIgdGFyZ2V0ID0gdG9rZW5zW2lkeF0udGFyZ2V0ID8gKCcgdGFyZ2V0PVwiJyArIGVzY2FwZUh0bWwodG9rZW5zW2lkeF0udGFyZ2V0KSArICdcIicpIDogJyc7XG4gIHJldHVybiAnPGEgaHJlZj1cIicgKyBlc2NhcGVIdG1sKHRva2Vuc1tpZHhdLmhyZWYpICsgJ1wiJyArIHRpdGxlICsgdGFyZ2V0ICsgJz4nO1xufTtcbnJ1bGVzLmxpbmtfY2xvc2UgPSBmdW5jdGlvbiAoLyogdG9rZW5zLCBpZHgsIG9wdGlvbnMsIGVudiAqLykge1xuICByZXR1cm4gJzwvYT4nO1xufTtcblxuXG5ydWxlcy5pbWFnZSA9IGZ1bmN0aW9uICh0b2tlbnMsIGlkeCwgb3B0aW9ucywgZW52LCBzZWxmKSB7XG4gIHZhciBzcmMgPSAnIHNyYz1cIicgKyBlc2NhcGVIdG1sKHRva2Vuc1tpZHhdLnNyYykgKyAnXCInO1xuICB2YXIgdGl0bGUgPSB0b2tlbnNbaWR4XS50aXRsZSA/ICgnIHRpdGxlPVwiJyArIGVzY2FwZUh0bWwocmVwbGFjZUVudGl0aWVzKHRva2Vuc1tpZHhdLnRpdGxlKSkgKyAnXCInKSA6ICcnO1xuICB2YXIgYWx0ID0gJyBhbHQ9XCInICsgc2VsZi5yZW5kZXJJbmxpbmVBc1RleHQodG9rZW5zW2lkeF0udG9rZW5zLCBvcHRpb25zLCBlbnYpICsgJ1wiJztcbiAgdmFyIHN1ZmZpeCA9IG9wdGlvbnMueGh0bWxPdXQgPyAnIC8nIDogJyc7XG4gIHJldHVybiAnPGltZycgKyBzcmMgKyBhbHQgKyB0aXRsZSArIHN1ZmZpeCArICc+Jztcbn07XG5cblxucnVsZXMudGFibGVfb3BlbiAgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnPHRhYmxlPlxcbic7IH07XG5ydWxlcy50YWJsZV9jbG9zZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICc8L3RhYmxlPlxcbic7IH07XG5ydWxlcy50aGVhZF9vcGVuICA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICc8dGhlYWQ+XFxuJzsgfTtcbnJ1bGVzLnRoZWFkX2Nsb3NlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJzwvdGhlYWQ+XFxuJzsgfTtcbnJ1bGVzLnRib2R5X29wZW4gID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJzx0Ym9keT5cXG4nOyB9O1xucnVsZXMudGJvZHlfY2xvc2UgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnPC90Ym9keT5cXG4nOyB9O1xucnVsZXMudHJfb3BlbiAgICAgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnPHRyPic7IH07XG5ydWxlcy50cl9jbG9zZSAgICA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICc8L3RyPlxcbic7IH07XG5ydWxlcy50aF9vcGVuICAgICA9IGZ1bmN0aW9uICh0b2tlbnMsIGlkeCAvKiwgb3B0aW9ucywgZW52ICovKSB7XG4gIGlmICh0b2tlbnNbaWR4XS5hbGlnbikge1xuICAgIHJldHVybiAnPHRoIHN0eWxlPVwidGV4dC1hbGlnbjonICsgdG9rZW5zW2lkeF0uYWxpZ24gKyAnXCI+JztcbiAgfVxuICByZXR1cm4gJzx0aD4nO1xufTtcbnJ1bGVzLnRoX2Nsb3NlICAgID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJzwvdGg+JzsgfTtcbnJ1bGVzLnRkX29wZW4gICAgID0gZnVuY3Rpb24gKHRva2VucywgaWR4IC8qLCBvcHRpb25zLCBlbnYgKi8pIHtcbiAgaWYgKHRva2Vuc1tpZHhdLmFsaWduKSB7XG4gICAgcmV0dXJuICc8dGQgc3R5bGU9XCJ0ZXh0LWFsaWduOicgKyB0b2tlbnNbaWR4XS5hbGlnbiArICdcIj4nO1xuICB9XG4gIHJldHVybiAnPHRkPic7XG59O1xucnVsZXMudGRfY2xvc2UgICAgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnPC90ZD4nOyB9O1xuXG5cbnJ1bGVzLnN0cm9uZ19vcGVuICA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICc8c3Ryb25nPic7IH07XG5ydWxlcy5zdHJvbmdfY2xvc2UgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnPC9zdHJvbmc+JzsgfTtcblxuXG5ydWxlcy5lbV9vcGVuICA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICc8ZW0+JzsgfTtcbnJ1bGVzLmVtX2Nsb3NlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJzwvZW0+JzsgfTtcblxuXG5ydWxlcy5zX29wZW4gID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJzxzPic7IH07XG5ydWxlcy5zX2Nsb3NlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJzwvcz4nOyB9O1xuXG5cbnJ1bGVzLmhhcmRicmVhayA9IGZ1bmN0aW9uICh0b2tlbnMsIGlkeCwgb3B0aW9ucyAvKiwgZW52ICovKSB7XG4gIHJldHVybiBvcHRpb25zLnhodG1sT3V0ID8gJzxiciAvPlxcbicgOiAnPGJyPlxcbic7XG59O1xucnVsZXMuc29mdGJyZWFrID0gZnVuY3Rpb24gKHRva2VucywgaWR4LCBvcHRpb25zIC8qLCBlbnYgKi8pIHtcbiAgcmV0dXJuIG9wdGlvbnMuYnJlYWtzID8gKG9wdGlvbnMueGh0bWxPdXQgPyAnPGJyIC8+XFxuJyA6ICc8YnI+XFxuJykgOiAnXFxuJztcbn07XG5cblxucnVsZXMudGV4dCA9IGZ1bmN0aW9uICh0b2tlbnMsIGlkeCAvKiwgb3B0aW9ucywgZW52ICovKSB7XG4gIHJldHVybiBlc2NhcGVIdG1sKHRva2Vuc1tpZHhdLmNvbnRlbnQpO1xufTtcblxuXG5ydWxlcy5odG1sX2Jsb2NrID0gZnVuY3Rpb24gKHRva2VucywgaWR4IC8qLCBvcHRpb25zLCBlbnYgKi8pIHtcbiAgcmV0dXJuIHRva2Vuc1tpZHhdLmNvbnRlbnQ7XG59O1xucnVsZXMuaHRtbF9pbmxpbmUgPSBmdW5jdGlvbiAodG9rZW5zLCBpZHggLyosIG9wdGlvbnMsIGVudiAqLykge1xuICByZXR1cm4gdG9rZW5zW2lkeF0uY29udGVudDtcbn07XG5cblxuLyoqXG4gKiBuZXcgUmVuZGVyZXIoKVxuICpcbiAqIENyZWF0ZXMgbmV3IFtbUmVuZGVyZXJdXSBpbnN0YW5jZSBhbmQgZmlsbCBbW1JlbmRlcmVyI3J1bGVzXV0gd2l0aCBkZWZhdWx0cy5cbiAqKi9cbmZ1bmN0aW9uIFJlbmRlcmVyKCkge1xuXG4gIC8qKlxuICAgKiBSZW5kZXJlciNydWxlcyAtPiBPYmplY3RcbiAgICpcbiAgICogQ29udGFpbnMgcmVuZGVyIHJ1bGVzIGZvciB0b2tlbnMuIENhbiBiZSB1cGRhdGVkIGFuZCBleHRlbmRlZC5cbiAgICpcbiAgICogIyMjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBqYXZhc2NyaXB0XG4gICAqIHZhciBtZCA9IHJlcXVpcmUoJ21hcmtkb3duLWl0JykoKTtcbiAgICpcbiAgICogbWQucmVuZGVyZXIucnVsZXMuc3Ryb25nX29wZW4gID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJzxiPic7IH07XG4gICAqIG1kLnJlbmRlcmVyLnJ1bGVzLnN0cm9uZ19jbG9zZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICc8L2I+JzsgfTtcbiAgICpcbiAgICogdmFyIHJlc3VsdCA9IG1kLnJlbmRlcklubGluZSguLi4pO1xuICAgKiBgYGBcbiAgICpcbiAgICogRWFjaCBydWxlIGlzIGNhbGxlZCBhcyBpbmRlcGVuZGVkIHN0YXRpYyBmdW5jdGlvbiB3aXRoIGZpeGVkIHNpZ25hdHVyZTpcbiAgICpcbiAgICogYGBgamF2YXNjcmlwdFxuICAgKiBmdW5jdGlvbiBteV90b2tlbl9yZW5kZXIodG9rZW5zLCBpZHgsIG9wdGlvbnMsIGVudiwgcmVuZGVyZXIpIHtcbiAgICogICAvLyAuLi5cbiAgICogICByZXR1cm4gcmVuZGVyZWRIVE1MO1xuICAgKiB9XG4gICAqIGBgYFxuICAgKlxuICAgKiBTZWUgW3NvdXJjZSBjb2RlXShodHRwczovL2dpdGh1Yi5jb20vbWFya2Rvd24taXQvbWFya2Rvd24taXQvYmxvYi9tYXN0ZXIvbGliL3JlbmRlcmVyLmpzKVxuICAgKiBmb3IgbW9yZSBkZXRhaWxzIGFuZCBleGFtcGxlcy5cbiAgICoqL1xuICB0aGlzLnJ1bGVzID0gYXNzaWduKHt9LCBydWxlcyk7XG59XG5cblxuLyoqXG4gKiBSZW5kZXJlci5yZW5kZXJJbmxpbmUodG9rZW5zLCBvcHRpb25zLCBlbnYpIC0+IFN0cmluZ1xuICogLSB0b2tlbnMgKEFycmF5KTogbGlzdCBvbiBibG9jayB0b2tlbnMgdG8gcmVudGVyXG4gKiAtIG9wdGlvbnMgKE9iamVjdCk6IHBhcmFtcyBvZiBwYXJzZXIgaW5zdGFuY2VcbiAqIC0gZW52IChPYmplY3QpOiBhZGRpdGlvbmFsIGRhdGEgZnJvbSBwYXJzZWQgaW5wdXQgKHJlZmVyZW5jZXMsIGZvciBleGFtcGxlKVxuICpcbiAqIFRoZSBzYW1lIGFzIFtbUmVuZGVyZXIucmVuZGVyXV0sIGJ1dCBmb3Igc2luZ2xlIHRva2VuIG9mIGBpbmxpbmVgIHR5cGUuXG4gKiovXG5SZW5kZXJlci5wcm90b3R5cGUucmVuZGVySW5saW5lID0gZnVuY3Rpb24gKHRva2Vucywgb3B0aW9ucywgZW52KSB7XG4gIHZhciByZXN1bHQgPSAnJyxcbiAgICAgIF9ydWxlcyA9IHRoaXMucnVsZXM7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRva2Vucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIHJlc3VsdCArPSBfcnVsZXNbdG9rZW5zW2ldLnR5cGVdKHRva2VucywgaSwgb3B0aW9ucywgZW52LCB0aGlzKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5cbi8qKiBpbnRlcm5hbFxuICogUmVuZGVyZXIucmVuZGVySW5saW5lQXNUZXh0KHRva2Vucywgb3B0aW9ucywgZW52KSAtPiBTdHJpbmdcbiAqIC0gdG9rZW5zIChBcnJheSk6IGxpc3Qgb24gYmxvY2sgdG9rZW5zIHRvIHJlbnRlclxuICogLSBvcHRpb25zIChPYmplY3QpOiBwYXJhbXMgb2YgcGFyc2VyIGluc3RhbmNlXG4gKiAtIGVudiAoT2JqZWN0KTogYWRkaXRpb25hbCBkYXRhIGZyb20gcGFyc2VkIGlucHV0IChyZWZlcmVuY2VzLCBmb3IgZXhhbXBsZSlcbiAqXG4gKiBTcGVjaWFsIGtsdWRnZSBmb3IgaW1hZ2UgYGFsdGAgYXR0cmlidXRlcyB0byBjb25mb3JtIENvbW1vbk1hcmsgc3BlYy5cbiAqIERvbid0IHRyeSB0byB1c2UgaXQhIFNwZWMgcmVxdWlyZXMgdG8gc2hvdyBgYWx0YCBjb250ZW50IHdpdGggc3RyaXBwZWQgbWFya3VwLFxuICogaW5zdGVhZCBvZiBzaW1wbGUgZXNjYXBpbmcuXG4gKiovXG5SZW5kZXJlci5wcm90b3R5cGUucmVuZGVySW5saW5lQXNUZXh0ID0gZnVuY3Rpb24gKHRva2Vucywgb3B0aW9ucywgZW52KSB7XG4gIHZhciByZXN1bHQgPSAnJyxcbiAgICAgIF9ydWxlcyA9IHRoaXMucnVsZXM7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRva2Vucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmICh0b2tlbnNbaV0udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICByZXN1bHQgKz0gX3J1bGVzLnRleHQodG9rZW5zLCBpLCBvcHRpb25zLCBlbnYsIHRoaXMpO1xuICAgIH0gZWxzZSBpZiAodG9rZW5zW2ldLnR5cGUgPT09ICdpbWFnZScpIHtcbiAgICAgIHJlc3VsdCArPSB0aGlzLnJlbmRlcklubGluZUFzVGV4dCh0b2tlbnNbaV0udG9rZW5zLCBvcHRpb25zLCBlbnYpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5cbi8qKlxuICogUmVuZGVyZXIucmVuZGVyKHRva2Vucywgb3B0aW9ucywgZW52KSAtPiBTdHJpbmdcbiAqIC0gdG9rZW5zIChBcnJheSk6IGxpc3Qgb24gYmxvY2sgdG9rZW5zIHRvIHJlbnRlclxuICogLSBvcHRpb25zIChPYmplY3QpOiBwYXJhbXMgb2YgcGFyc2VyIGluc3RhbmNlXG4gKiAtIGVudiAoT2JqZWN0KTogYWRkaXRpb25hbCBkYXRhIGZyb20gcGFyc2VkIGlucHV0IChyZWZlcmVuY2VzLCBmb3IgZXhhbXBsZSlcbiAqXG4gKiBUYWtlcyB0b2tlbiBzdHJlYW0gYW5kIGdlbmVyYXRlcyBIVE1MLiBQcm9iYWJseSwgeW91IHdpbGwgbmV2ZXIgbmVlZCB0byBjYWxsXG4gKiB0aGlzIG1ldGhvZCBkaXJlY3RseS5cbiAqKi9cblJlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAodG9rZW5zLCBvcHRpb25zLCBlbnYpIHtcbiAgdmFyIGksIGxlbixcbiAgICAgIHJlc3VsdCA9ICcnLFxuICAgICAgX3J1bGVzID0gdGhpcy5ydWxlcztcblxuICBmb3IgKGkgPSAwLCBsZW4gPSB0b2tlbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAodG9rZW5zW2ldLnR5cGUgPT09ICdpbmxpbmUnKSB7XG4gICAgICByZXN1bHQgKz0gdGhpcy5yZW5kZXJJbmxpbmUodG9rZW5zW2ldLmNoaWxkcmVuLCBvcHRpb25zLCBlbnYpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgKz0gX3J1bGVzW3Rva2Vuc1tpXS50eXBlXSh0b2tlbnMsIGksIG9wdGlvbnMsIGVudiwgdGhpcyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUmVuZGVyZXI7XG4iLCIvKipcbiAqIGNsYXNzIFJ1bGVyXG4gKlxuICogSGVscGVyIGNsYXNzLCB1c2VkIGJ5IFtbTWFya2Rvd25JdCNjb3JlXV0sIFtbTWFya2Rvd25JdCNibG9ja11dIGFuZFxuICogW1tNYXJrZG93bkl0I2lubGluZV1dIHRvIG1hbmFnZSBzZXF1ZW5jZXMgb2YgZnVuY3Rpb25zIChydWxlcyk6XG4gKlxuICogLSBrZWVwIHJ1bGVzIGluIGRlZmluZWQgb3JkZXJcbiAqIC0gYXNzaWduIHRoZSBuYW1lIHRvIGVhY2ggcnVsZVxuICogLSBlbmFibGUvZGlzYWJsZSBydWxlc1xuICogLSBhZGQvcmVwbGFjZSBydWxlc1xuICogLSBhbGxvdyBhc3NpZ24gcnVsZXMgdG8gYWRkaXRpb25hbCBuYW1lZCBjaGFpbnMgKGluIHRoZSBzYW1lKVxuICogLSBjYWNoZWluZyBsaXN0cyBvZiBhY3RpdmUgcnVsZXNcbiAqXG4gKiBZb3Ugd2lsbCBub3QgbmVlZCB1c2UgdGhpcyBjbGFzcyBkaXJlY3RseSB1bnRpbCB3cml0ZSBwbHVnaW5zLiBGb3Igc2ltcGxlXG4gKiBydWxlcyBjb250cm9sIHVzZSBbW01hcmtkb3duSXQuZGlzYWJsZV1dLCBbW01hcmtkb3duSXQuZW5hYmxlXV0gYW5kXG4gKiBbW01hcmtkb3duSXQudXNlXV0uXG4gKiovXG4ndXNlIHN0cmljdCc7XG5cblxuLyoqXG4gKiBuZXcgUnVsZXIoKVxuICoqL1xuZnVuY3Rpb24gUnVsZXIoKSB7XG4gIC8vIExpc3Qgb2YgYWRkZWQgcnVsZXMuIEVhY2ggZWxlbWVudCBpczpcbiAgLy9cbiAgLy8ge1xuICAvLyAgIG5hbWU6IFhYWCxcbiAgLy8gICBlbmFibGVkOiBCb29sZWFuLFxuICAvLyAgIGZuOiBGdW5jdGlvbigpLFxuICAvLyAgIGFsdDogWyBuYW1lMiwgbmFtZTMgXVxuICAvLyB9XG4gIC8vXG4gIHRoaXMuX19ydWxlc19fID0gW107XG5cbiAgLy8gQ2FjaGVkIHJ1bGUgY2hhaW5zLlxuICAvL1xuICAvLyBGaXJzdCBsZXZlbCAtIGNoYWluIG5hbWUsICcnIGZvciBkZWZhdWx0LlxuICAvLyBTZWNvbmQgbGV2ZWwgLSBkaWdpbmFsIGFuY2hvciBmb3IgZmFzdCBmaWx0ZXJpbmcgYnkgY2hhcmNvZGVzLlxuICAvL1xuICB0aGlzLl9fY2FjaGVfXyA9IG51bGw7XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBIZWxwZXIgbWV0aG9kcywgc2hvdWxkIG5vdCBiZSB1c2VkIGRpcmVjdGx5XG5cblxuLy8gRmluZCBydWxlIGluZGV4IGJ5IG5hbWVcbi8vXG5SdWxlci5wcm90b3R5cGUuX19maW5kX18gPSBmdW5jdGlvbiAobmFtZSkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX19ydWxlc19fLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHRoaXMuX19ydWxlc19fW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59O1xuXG5cbi8vIEJ1aWxkIHJ1bGVzIGxvb2t1cCBjYWNoZVxuLy9cblJ1bGVyLnByb3RvdHlwZS5fX2NvbXBpbGVfXyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgY2hhaW5zID0gWyAnJyBdO1xuXG4gIC8vIGNvbGxlY3QgdW5pcXVlIG5hbWVzXG4gIHNlbGYuX19ydWxlc19fLmZvckVhY2goZnVuY3Rpb24gKHJ1bGUpIHtcbiAgICBpZiAoIXJ1bGUuZW5hYmxlZCkgeyByZXR1cm47IH1cblxuICAgIHJ1bGUuYWx0LmZvckVhY2goZnVuY3Rpb24gKGFsdE5hbWUpIHtcbiAgICAgIGlmIChjaGFpbnMuaW5kZXhPZihhbHROYW1lKSA8IDApIHtcbiAgICAgICAgY2hhaW5zLnB1c2goYWx0TmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIHNlbGYuX19jYWNoZV9fID0ge307XG5cbiAgY2hhaW5zLmZvckVhY2goZnVuY3Rpb24gKGNoYWluKSB7XG4gICAgc2VsZi5fX2NhY2hlX19bY2hhaW5dID0gW107XG4gICAgc2VsZi5fX3J1bGVzX18uZm9yRWFjaChmdW5jdGlvbiAocnVsZSkge1xuICAgICAgaWYgKCFydWxlLmVuYWJsZWQpIHsgcmV0dXJuOyB9XG5cbiAgICAgIGlmIChjaGFpbiAmJiBydWxlLmFsdC5pbmRleE9mKGNoYWluKSA8IDApIHsgcmV0dXJuOyB9XG5cbiAgICAgIHNlbGYuX19jYWNoZV9fW2NoYWluXS5wdXNoKHJ1bGUuZm4pO1xuICAgIH0pO1xuICB9KTtcbn07XG5cblxuLyoqXG4gKiBSdWxlci5hdChuYW1lLCBmbiBbLCBvcHRpb25zXSlcbiAqIC0gbmFtZSAoU3RyaW5nKTogcnVsZSBuYW1lIHRvIHJlcGxhY2UuXG4gKiAtIGZuIChGdW5jdGlvbik6IG5ldyBydWxlIGZ1bmN0aW9uLlxuICogLSBvcHRpb25zIChPYmplY3QpOiBuZXcgcnVsZSBvcHRpb25zIChub3QgbWFuZGF0b3J5KS5cbiAqXG4gKiBSZXBsYWNlIHJ1bGUgYnkgbmFtZSB3aXRoIG5ldyBmdW5jdGlvbiAmIG9wdGlvbnMuIFRocm93cyBlcnJvciBpZiBuYW1lIG5vdFxuICogZm91bmQuXG4gKlxuICogIyMjIyMgT3B0aW9uczpcbiAqXG4gKiAtIF9fYWx0X18gLSBhcnJheSB3aXRoIG5hbWVzIG9mIFwiYWx0ZXJuYXRlXCIgY2hhaW5zLlxuICpcbiAqICMjIyMjIEV4YW1wbGVcbiAqXG4gKiBSZXBsYWNlIGV4aXN0aW5nIHR5cG9yZ2FwaGVyIHJlcGxhY2VtZW50IHJ1bGUgd2l0aCBuZXcgb25lOlxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIHZhciBtZCA9IHJlcXVpcmUoJ21hcmtkb3duLWl0JykoKTtcbiAqXG4gKiBtZC5jb3JlLnJ1bGVyLmF0KCdyZXBsYWNlbWVudHMnLCBmdW5jdGlvbiByZXBsYWNlKHN0YXRlKSB7XG4gKiAgIC8vLi4uXG4gKiB9KTtcbiAqIGBgYFxuICoqL1xuUnVsZXIucHJvdG90eXBlLmF0ID0gZnVuY3Rpb24gKG5hbWUsIGZuLCBvcHRpb25zKSB7XG4gIHZhciBpbmRleCA9IHRoaXMuX19maW5kX18obmFtZSk7XG4gIHZhciBvcHQgPSBvcHRpb25zIHx8IHt9O1xuXG4gIGlmIChpbmRleCA9PT0gLTEpIHsgdGhyb3cgbmV3IEVycm9yKCdQYXJzZXIgcnVsZSBub3QgZm91bmQ6ICcgKyBuYW1lKTsgfVxuXG4gIHRoaXMuX19ydWxlc19fW2luZGV4XS5mbiA9IGZuO1xuICB0aGlzLl9fcnVsZXNfX1tpbmRleF0uYWx0ID0gb3B0LmFsdCB8fCBbXTtcbiAgdGhpcy5fX2NhY2hlX18gPSBudWxsO1xufTtcblxuXG4vKipcbiAqIFJ1bGVyLmJlZm9yZShiZWZvcmVOYW1lLCBydWxlTmFtZSwgZm4gWywgb3B0aW9uc10pXG4gKiAtIGJlZm9yZU5hbWUgKFN0cmluZyk6IG5ldyBydWxlIHdpbGwgYmUgYWRkZWQgYmVmb3JlIHRoaXMgb25lLlxuICogLSBydWxlTmFtZSAoU3RyaW5nKTogbmFtZSBvZiBhZGRlZCBydWxlLlxuICogLSBmbiAoRnVuY3Rpb24pOiBydWxlIGZ1bmN0aW9uLlxuICogLSBvcHRpb25zIChPYmplY3QpOiBydWxlIG9wdGlvbnMgKG5vdCBtYW5kYXRvcnkpLlxuICpcbiAqIEFkZCBuZXcgcnVsZSB0byBjaGFpbiBiZWZvcmUgb25lIHdpdGggZ2l2ZW4gbmFtZS4gU2VlIGFsc29cbiAqIFtbUnVsZXIuYWZ0ZXJdXSwgW1tSdWxlci5wdXNoXV0uXG4gKlxuICogIyMjIyMgT3B0aW9uczpcbiAqXG4gKiAtIF9fYWx0X18gLSBhcnJheSB3aXRoIG5hbWVzIG9mIFwiYWx0ZXJuYXRlXCIgY2hhaW5zLlxuICpcbiAqICMjIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgbWQgPSByZXF1aXJlKCdtYXJrZG93bi1pdCcpKCk7XG4gKlxuICogbWQuYmxvY2sucnVsZXIuYmVmb3JlKCdwYXJhZ3JhcGgnLCAnbXlfcnVsZScsIGZ1bmN0aW9uIHJlcGxhY2Uoc3RhdGUpIHtcbiAqICAgLy8uLi5cbiAqIH0pO1xuICogYGBgXG4gKiovXG5SdWxlci5wcm90b3R5cGUuYmVmb3JlID0gZnVuY3Rpb24gKGJlZm9yZU5hbWUsIHJ1bGVOYW1lLCBmbiwgb3B0aW9ucykge1xuICB2YXIgaW5kZXggPSB0aGlzLl9fZmluZF9fKGJlZm9yZU5hbWUpO1xuICB2YXIgb3B0ID0gb3B0aW9ucyB8fCB7fTtcblxuICBpZiAoaW5kZXggPT09IC0xKSB7IHRocm93IG5ldyBFcnJvcignUGFyc2VyIHJ1bGUgbm90IGZvdW5kOiAnICsgYmVmb3JlTmFtZSk7IH1cblxuICB0aGlzLl9fcnVsZXNfXy5zcGxpY2UoaW5kZXgsIDAsIHtcbiAgICBuYW1lOiBydWxlTmFtZSxcbiAgICBlbmFibGVkOiB0cnVlLFxuICAgIGZuOiBmbixcbiAgICBhbHQ6IG9wdC5hbHQgfHwgW11cbiAgfSk7XG5cbiAgdGhpcy5fX2NhY2hlX18gPSBudWxsO1xufTtcblxuXG4vKipcbiAqIFJ1bGVyLmFmdGVyKGFmdGVyTmFtZSwgcnVsZU5hbWUsIGZuIFssIG9wdGlvbnNdKVxuICogLSBhZnRlck5hbWUgKFN0cmluZyk6IG5ldyBydWxlIHdpbGwgYmUgYWRkZWQgYWZ0ZXIgdGhpcyBvbmUuXG4gKiAtIHJ1bGVOYW1lIChTdHJpbmcpOiBuYW1lIG9mIGFkZGVkIHJ1bGUuXG4gKiAtIGZuIChGdW5jdGlvbik6IHJ1bGUgZnVuY3Rpb24uXG4gKiAtIG9wdGlvbnMgKE9iamVjdCk6IHJ1bGUgb3B0aW9ucyAobm90IG1hbmRhdG9yeSkuXG4gKlxuICogQWRkIG5ldyBydWxlIHRvIGNoYWluIGFmdGVyIG9uZSB3aXRoIGdpdmVuIG5hbWUuIFNlZSBhbHNvXG4gKiBbW1J1bGVyLmJlZm9yZV1dLCBbW1J1bGVyLnB1c2hdXS5cbiAqXG4gKiAjIyMjIyBPcHRpb25zOlxuICpcbiAqIC0gX19hbHRfXyAtIGFycmF5IHdpdGggbmFtZXMgb2YgXCJhbHRlcm5hdGVcIiBjaGFpbnMuXG4gKlxuICogIyMjIyMgRXhhbXBsZVxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIHZhciBtZCA9IHJlcXVpcmUoJ21hcmtkb3duLWl0JykoKTtcbiAqXG4gKiBtZC5pbmxpbmUucnVsZXIuYWZ0ZXIoJ3RleHQnLCAnbXlfcnVsZScsIGZ1bmN0aW9uIHJlcGxhY2Uoc3RhdGUpIHtcbiAqICAgLy8uLi5cbiAqIH0pO1xuICogYGBgXG4gKiovXG5SdWxlci5wcm90b3R5cGUuYWZ0ZXIgPSBmdW5jdGlvbiAoYWZ0ZXJOYW1lLCBydWxlTmFtZSwgZm4sIG9wdGlvbnMpIHtcbiAgdmFyIGluZGV4ID0gdGhpcy5fX2ZpbmRfXyhhZnRlck5hbWUpO1xuICB2YXIgb3B0ID0gb3B0aW9ucyB8fCB7fTtcblxuICBpZiAoaW5kZXggPT09IC0xKSB7IHRocm93IG5ldyBFcnJvcignUGFyc2VyIHJ1bGUgbm90IGZvdW5kOiAnICsgYWZ0ZXJOYW1lKTsgfVxuXG4gIHRoaXMuX19ydWxlc19fLnNwbGljZShpbmRleCArIDEsIDAsIHtcbiAgICBuYW1lOiBydWxlTmFtZSxcbiAgICBlbmFibGVkOiB0cnVlLFxuICAgIGZuOiBmbixcbiAgICBhbHQ6IG9wdC5hbHQgfHwgW11cbiAgfSk7XG5cbiAgdGhpcy5fX2NhY2hlX18gPSBudWxsO1xufTtcblxuLyoqXG4gKiBSdWxlci5wdXNoKHJ1bGVOYW1lLCBmbiBbLCBvcHRpb25zXSlcbiAqIC0gcnVsZU5hbWUgKFN0cmluZyk6IG5hbWUgb2YgYWRkZWQgcnVsZS5cbiAqIC0gZm4gKEZ1bmN0aW9uKTogcnVsZSBmdW5jdGlvbi5cbiAqIC0gb3B0aW9ucyAoT2JqZWN0KTogcnVsZSBvcHRpb25zIChub3QgbWFuZGF0b3J5KS5cbiAqXG4gKiBQdXNoIG5ldyBydWxlIHRvIHRoZSBlbmQgb2YgY2hhaW4uIFNlZSBhbHNvXG4gKiBbW1J1bGVyLmJlZm9yZV1dLCBbW1J1bGVyLmFmdGVyXV0uXG4gKlxuICogIyMjIyMgT3B0aW9uczpcbiAqXG4gKiAtIF9fYWx0X18gLSBhcnJheSB3aXRoIG5hbWVzIG9mIFwiYWx0ZXJuYXRlXCIgY2hhaW5zLlxuICpcbiAqICMjIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBqYXZhc2NyaXB0XG4gKiB2YXIgbWQgPSByZXF1aXJlKCdtYXJrZG93bi1pdCcpKCk7XG4gKlxuICogbWQuY29yZS5ydWxlci5wdXNoKCdlbXBoYXNpcycsICdteV9ydWxlJywgZnVuY3Rpb24gcmVwbGFjZShzdGF0ZSkge1xuICogICAvLy4uLlxuICogfSk7XG4gKiBgYGBcbiAqKi9cblJ1bGVyLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKHJ1bGVOYW1lLCBmbiwgb3B0aW9ucykge1xuICB2YXIgb3B0ID0gb3B0aW9ucyB8fCB7fTtcblxuICB0aGlzLl9fcnVsZXNfXy5wdXNoKHtcbiAgICBuYW1lOiBydWxlTmFtZSxcbiAgICBlbmFibGVkOiB0cnVlLFxuICAgIGZuOiBmbixcbiAgICBhbHQ6IG9wdC5hbHQgfHwgW11cbiAgfSk7XG5cbiAgdGhpcy5fX2NhY2hlX18gPSBudWxsO1xufTtcblxuXG4vKipcbiAqIFJ1bGVyLmVuYWJsZShsaXN0IFssIGlnbm9yZUludmFsaWRdKSAtPiBBcnJheVxuICogLSBsaXN0IChTdHJpbmd8QXJyYXkpOiBsaXN0IG9mIHJ1bGUgbmFtZXMgdG8gZW5hYmxlLlxuICogLSBpZ25vcmVJbnZhbGlkIChCb29sZWFuKTogc2V0IGB0cnVlYCB0byBpZ25vcmUgZXJyb3JzIHdoZW4gcnVsZSBub3QgZm91bmQuXG4gKlxuICogRW5hYmxlIHJ1bGVzIHdpdGggZ2l2ZW4gbmFtZXMuIElmIGFueSBydWxlIG5hbWUgbm90IGZvdW5kIC0gdGhyb3cgRXJyb3IuXG4gKiBFcnJvcnMgY2FuIGJlIGRpc2FibGVkIGJ5IHNlY29uZCBwYXJhbS5cbiAqXG4gKiBSZXR1cm5zIGxpc3Qgb2YgZm91bmQgcnVsZSBuYW1lcyAoaWYgbm8gZXhjZXB0aW9uIGhhcHBlbmVkKS5cbiAqXG4gKiBTZWUgYWxzbyBbW1J1bGVyLmRpc2FibGVdXSwgW1tSdWxlci5lbmFibGVPbmx5XV0uXG4gKiovXG5SdWxlci5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24gKGxpc3QsIGlnbm9yZUludmFsaWQpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3QpKSB7IGxpc3QgPSBbIGxpc3QgXTsgfVxuXG4gIHZhciByZXN1bHQgPSBbXTtcblxuICAvLyBTZWFyY2ggYnkgbmFtZSBhbmQgZW5hYmxlXG4gIGxpc3QuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBpZHggPSB0aGlzLl9fZmluZF9fKG5hbWUpO1xuXG4gICAgaWYgKGlkeCA8IDApIHtcbiAgICAgIGlmIChpZ25vcmVJbnZhbGlkKSB7IHJldHVybjsgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSdWxlcyBtYW5hZ2VyOiBpbnZhbGlkIHJ1bGUgbmFtZSAnICsgbmFtZSk7XG4gICAgfVxuICAgIHRoaXMuX19ydWxlc19fW2lkeF0uZW5hYmxlZCA9IHRydWU7XG4gICAgcmVzdWx0LnB1c2gobmFtZSk7XG4gIH0sIHRoaXMpO1xuXG4gIHRoaXMuX19jYWNoZV9fID0gbnVsbDtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblxuLyoqXG4gKiBSdWxlci5lbmFibGVPbmx5KGxpc3QgWywgaWdub3JlSW52YWxpZF0pXG4gKiAtIGxpc3QgKFN0cmluZ3xBcnJheSk6IGxpc3Qgb2YgcnVsZSBuYW1lcyB0byBlbmFibGUgKHdoaXRlbGlzdCkuXG4gKiAtIGlnbm9yZUludmFsaWQgKEJvb2xlYW4pOiBzZXQgYHRydWVgIHRvIGlnbm9yZSBlcnJvcnMgd2hlbiBydWxlIG5vdCBmb3VuZC5cbiAqXG4gKiBFbmFibGUgcnVsZXMgd2l0aCBnaXZlbiBuYW1lcywgYW5kIGRpc2FibGUgZXZlcnl0aGluZyBlbHNlLiBJZiBhbnkgcnVsZSBuYW1lXG4gKiBub3QgZm91bmQgLSB0aHJvdyBFcnJvci4gRXJyb3JzIGNhbiBiZSBkaXNhYmxlZCBieSBzZWNvbmQgcGFyYW0uXG4gKlxuICogU2VlIGFsc28gW1tSdWxlci5kaXNhYmxlXV0sIFtbUnVsZXIuZW5hYmxlXV0uXG4gKiovXG5SdWxlci5wcm90b3R5cGUuZW5hYmxlT25seSA9IGZ1bmN0aW9uIChsaXN0LCBpZ25vcmVJbnZhbGlkKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShsaXN0KSkgeyBsaXN0ID0gWyBsaXN0IF07IH1cblxuICB0aGlzLl9fcnVsZXNfXy5mb3JFYWNoKGZ1bmN0aW9uIChydWxlKSB7IHJ1bGUuZW5hYmxlZCA9IGZhbHNlOyB9KTtcblxuICB0aGlzLmVuYWJsZShsaXN0LCBpZ25vcmVJbnZhbGlkKTtcbn07XG5cblxuLyoqXG4gKiBSdWxlci5kaXNhYmxlKGxpc3QgWywgaWdub3JlSW52YWxpZF0pIC0+IEFycmF5XG4gKiAtIGxpc3QgKFN0cmluZ3xBcnJheSk6IGxpc3Qgb2YgcnVsZSBuYW1lcyB0byBkaXNhYmxlLlxuICogLSBpZ25vcmVJbnZhbGlkIChCb29sZWFuKTogc2V0IGB0cnVlYCB0byBpZ25vcmUgZXJyb3JzIHdoZW4gcnVsZSBub3QgZm91bmQuXG4gKlxuICogRGlzYWJsZSBydWxlcyB3aXRoIGdpdmVuIG5hbWVzLiBJZiBhbnkgcnVsZSBuYW1lIG5vdCBmb3VuZCAtIHRocm93IEVycm9yLlxuICogRXJyb3JzIGNhbiBiZSBkaXNhYmxlZCBieSBzZWNvbmQgcGFyYW0uXG4gKlxuICogUmV0dXJucyBsaXN0IG9mIGZvdW5kIHJ1bGUgbmFtZXMgKGlmIG5vIGV4Y2VwdGlvbiBoYXBwZW5lZCkuXG4gKlxuICogU2VlIGFsc28gW1tSdWxlci5lbmFibGVdXSwgW1tSdWxlci5lbmFibGVPbmx5XV0uXG4gKiovXG5SdWxlci5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uIChsaXN0LCBpZ25vcmVJbnZhbGlkKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShsaXN0KSkgeyBsaXN0ID0gWyBsaXN0IF07IH1cblxuICB2YXIgcmVzdWx0ID0gW107XG5cbiAgLy8gU2VhcmNoIGJ5IG5hbWUgYW5kIGRpc2FibGVcbiAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIGlkeCA9IHRoaXMuX19maW5kX18obmFtZSk7XG5cbiAgICBpZiAoaWR4IDwgMCkge1xuICAgICAgaWYgKGlnbm9yZUludmFsaWQpIHsgcmV0dXJuOyB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1J1bGVzIG1hbmFnZXI6IGludmFsaWQgcnVsZSBuYW1lICcgKyBuYW1lKTtcbiAgICB9XG4gICAgdGhpcy5fX3J1bGVzX19baWR4XS5lbmFibGVkID0gZmFsc2U7XG4gICAgcmVzdWx0LnB1c2gobmFtZSk7XG4gIH0sIHRoaXMpO1xuXG4gIHRoaXMuX19jYWNoZV9fID0gbnVsbDtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblxuLyoqXG4gKiBSdWxlci5nZXRSdWxlcyhjaGFpbk5hbWUpIC0+IEFycmF5XG4gKlxuICogUmV0dXJuIGFycmF5IG9mIGFjdGl2ZSBmdW5jdGlvbnMgKHJ1bGVzKSBmb3IgZ2l2ZW4gY2hhaW4gbmFtZS4gSXQgYW5hbHl6ZXNcbiAqIHJ1bGVzIGNvbmZpZ3VyYXRpb24sIGNvbXBpbGVzIGNhY2hlcyBpZiBub3QgZXhpc3RzIGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBEZWZhdWx0IGNoYWluIG5hbWUgaXMgYCcnYCAoZW1wdHkgc3RyaW5nKS4gSXQgY2FuJ3QgYmUgc2tpcHBlZC4gVGhhdCdzXG4gKiBkb25lIGludGVudGlvbmFsbHksIHRvIGtlZXAgc2lnbmF0dXJlIG1vbm9tb3JwaGljIGZvciBoaWdoIHNwZWVkLlxuICoqL1xuUnVsZXIucHJvdG90eXBlLmdldFJ1bGVzID0gZnVuY3Rpb24gKGNoYWluTmFtZSkge1xuICBpZiAodGhpcy5fX2NhY2hlX18gPT09IG51bGwpIHtcbiAgICB0aGlzLl9fY29tcGlsZV9fKCk7XG4gIH1cblxuICAvLyBDaGFpbiBjYW4gYmUgZW1wdHksIGlmIHJ1bGVzIGRpc2FibGVkLiBCdXQgd2Ugc3RpbGwgaGF2ZSB0byByZXR1cm4gQXJyYXkuXG4gIHJldHVybiB0aGlzLl9fY2FjaGVfX1tjaGFpbk5hbWVdIHx8IFtdO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSdWxlcjtcbiIsIi8vIEJsb2NrIHF1b3Rlc1xuXG4ndXNlIHN0cmljdCc7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBibG9ja3F1b3RlKHN0YXRlLCBzdGFydExpbmUsIGVuZExpbmUsIHNpbGVudCkge1xuICB2YXIgbmV4dExpbmUsIGxhc3RMaW5lRW1wdHksIG9sZFRTaGlmdCwgb2xkQk1hcmtzLCBvbGRJbmRlbnQsIG9sZFBhcmVudFR5cGUsIGxpbmVzLFxuICAgICAgdGVybWluYXRvclJ1bGVzLFxuICAgICAgaSwgbCwgdGVybWluYXRlLFxuICAgICAgcG9zID0gc3RhdGUuYk1hcmtzW3N0YXJ0TGluZV0gKyBzdGF0ZS50U2hpZnRbc3RhcnRMaW5lXSxcbiAgICAgIG1heCA9IHN0YXRlLmVNYXJrc1tzdGFydExpbmVdO1xuXG4gIC8vIGNoZWNrIHRoZSBibG9jayBxdW90ZSBtYXJrZXJcbiAgaWYgKHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcysrKSAhPT0gMHgzRS8qID4gKi8pIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgLy8gd2Uga25vdyB0aGF0IGl0J3MgZ29pbmcgdG8gYmUgYSB2YWxpZCBibG9ja3F1b3RlLFxuICAvLyBzbyBubyBwb2ludCB0cnlpbmcgdG8gZmluZCB0aGUgZW5kIG9mIGl0IGluIHNpbGVudCBtb2RlXG4gIGlmIChzaWxlbnQpIHsgcmV0dXJuIHRydWU7IH1cblxuICAvLyBza2lwIG9uZSBvcHRpb25hbCBzcGFjZSBhZnRlciAnPidcbiAgaWYgKHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcykgPT09IDB4MjApIHsgcG9zKys7IH1cblxuICBvbGRJbmRlbnQgPSBzdGF0ZS5ibGtJbmRlbnQ7XG4gIHN0YXRlLmJsa0luZGVudCA9IDA7XG5cbiAgb2xkQk1hcmtzID0gWyBzdGF0ZS5iTWFya3Nbc3RhcnRMaW5lXSBdO1xuICBzdGF0ZS5iTWFya3Nbc3RhcnRMaW5lXSA9IHBvcztcblxuICAvLyBjaGVjayBpZiB3ZSBoYXZlIGFuIGVtcHR5IGJsb2NrcXVvdGVcbiAgcG9zID0gcG9zIDwgbWF4ID8gc3RhdGUuc2tpcFNwYWNlcyhwb3MpIDogcG9zO1xuICBsYXN0TGluZUVtcHR5ID0gcG9zID49IG1heDtcblxuICBvbGRUU2hpZnQgPSBbIHN0YXRlLnRTaGlmdFtzdGFydExpbmVdIF07XG4gIHN0YXRlLnRTaGlmdFtzdGFydExpbmVdID0gcG9zIC0gc3RhdGUuYk1hcmtzW3N0YXJ0TGluZV07XG5cbiAgdGVybWluYXRvclJ1bGVzID0gc3RhdGUubWQuYmxvY2sucnVsZXIuZ2V0UnVsZXMoJ2Jsb2NrcXVvdGUnKTtcblxuICAvLyBTZWFyY2ggdGhlIGVuZCBvZiB0aGUgYmxvY2tcbiAgLy9cbiAgLy8gQmxvY2sgZW5kcyB3aXRoIGVpdGhlcjpcbiAgLy8gIDEuIGFuIGVtcHR5IGxpbmUgb3V0c2lkZTpcbiAgLy8gICAgIGBgYFxuICAvLyAgICAgPiB0ZXN0XG4gIC8vXG4gIC8vICAgICBgYGBcbiAgLy8gIDIuIGFuIGVtcHR5IGxpbmUgaW5zaWRlOlxuICAvLyAgICAgYGBgXG4gIC8vICAgICA+XG4gIC8vICAgICB0ZXN0XG4gIC8vICAgICBgYGBcbiAgLy8gIDMuIGFub3RoZXIgdGFnXG4gIC8vICAgICBgYGBcbiAgLy8gICAgID4gdGVzdFxuICAvLyAgICAgIC0gLSAtXG4gIC8vICAgICBgYGBcbiAgZm9yIChuZXh0TGluZSA9IHN0YXJ0TGluZSArIDE7IG5leHRMaW5lIDwgZW5kTGluZTsgbmV4dExpbmUrKykge1xuICAgIHBvcyA9IHN0YXRlLmJNYXJrc1tuZXh0TGluZV0gKyBzdGF0ZS50U2hpZnRbbmV4dExpbmVdO1xuICAgIG1heCA9IHN0YXRlLmVNYXJrc1tuZXh0TGluZV07XG5cbiAgICBpZiAocG9zID49IG1heCkge1xuICAgICAgLy8gQ2FzZSAxOiBsaW5lIGlzIG5vdCBpbnNpZGUgdGhlIGJsb2NrcXVvdGUsIGFuZCB0aGlzIGxpbmUgaXMgZW1wdHkuXG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc3RhdGUuc3JjLmNoYXJDb2RlQXQocG9zKyspID09PSAweDNFLyogPiAqLykge1xuICAgICAgLy8gVGhpcyBsaW5lIGlzIGluc2lkZSB0aGUgYmxvY2txdW90ZS5cblxuICAgICAgLy8gc2tpcCBvbmUgb3B0aW9uYWwgc3BhY2UgYWZ0ZXIgJz4nXG4gICAgICBpZiAoc3RhdGUuc3JjLmNoYXJDb2RlQXQocG9zKSA9PT0gMHgyMCkgeyBwb3MrKzsgfVxuXG4gICAgICBvbGRCTWFya3MucHVzaChzdGF0ZS5iTWFya3NbbmV4dExpbmVdKTtcbiAgICAgIHN0YXRlLmJNYXJrc1tuZXh0TGluZV0gPSBwb3M7XG5cbiAgICAgIHBvcyA9IHBvcyA8IG1heCA/IHN0YXRlLnNraXBTcGFjZXMocG9zKSA6IHBvcztcbiAgICAgIGxhc3RMaW5lRW1wdHkgPSBwb3MgPj0gbWF4O1xuXG4gICAgICBvbGRUU2hpZnQucHVzaChzdGF0ZS50U2hpZnRbbmV4dExpbmVdKTtcbiAgICAgIHN0YXRlLnRTaGlmdFtuZXh0TGluZV0gPSBwb3MgLSBzdGF0ZS5iTWFya3NbbmV4dExpbmVdO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gQ2FzZSAyOiBsaW5lIGlzIG5vdCBpbnNpZGUgdGhlIGJsb2NrcXVvdGUsIGFuZCB0aGUgbGFzdCBsaW5lIHdhcyBlbXB0eS5cbiAgICBpZiAobGFzdExpbmVFbXB0eSkgeyBicmVhazsgfVxuXG4gICAgLy8gQ2FzZSAzOiBhbm90aGVyIHRhZyBmb3VuZC5cbiAgICB0ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICBmb3IgKGkgPSAwLCBsID0gdGVybWluYXRvclJ1bGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKHRlcm1pbmF0b3JSdWxlc1tpXShzdGF0ZSwgbmV4dExpbmUsIGVuZExpbmUsIHRydWUpKSB7XG4gICAgICAgIHRlcm1pbmF0ZSA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGVybWluYXRlKSB7IGJyZWFrOyB9XG5cbiAgICBvbGRCTWFya3MucHVzaChzdGF0ZS5iTWFya3NbbmV4dExpbmVdKTtcbiAgICBvbGRUU2hpZnQucHVzaChzdGF0ZS50U2hpZnRbbmV4dExpbmVdKTtcblxuICAgIC8vIEEgbmVnYXRpdmUgbnVtYmVyIG1lYW5zIHRoYXQgdGhpcyBpcyBhIHBhcmFncmFwaCBjb250aW51YXRpb247XG4gICAgLy9cbiAgICAvLyBBbnkgbmVnYXRpdmUgbnVtYmVyIHdpbGwgZG8gdGhlIGpvYiBoZXJlLCBidXQgaXQncyBiZXR0ZXIgZm9yIGl0XG4gICAgLy8gdG8gYmUgbGFyZ2UgZW5vdWdoIHRvIG1ha2UgYW55IGJ1Z3Mgb2J2aW91cy5cbiAgICBzdGF0ZS50U2hpZnRbbmV4dExpbmVdID0gLTEzMzc7XG4gIH1cblxuICBvbGRQYXJlbnRUeXBlID0gc3RhdGUucGFyZW50VHlwZTtcbiAgc3RhdGUucGFyZW50VHlwZSA9ICdibG9ja3F1b3RlJztcbiAgc3RhdGUudG9rZW5zLnB1c2goe1xuICAgIHR5cGU6ICdibG9ja3F1b3RlX29wZW4nLFxuICAgIGxpbmVzOiBsaW5lcyA9IFsgc3RhcnRMaW5lLCAwIF0sXG4gICAgbGV2ZWw6IHN0YXRlLmxldmVsKytcbiAgfSk7XG4gIHN0YXRlLm1kLmJsb2NrLnRva2VuaXplKHN0YXRlLCBzdGFydExpbmUsIG5leHRMaW5lKTtcbiAgc3RhdGUudG9rZW5zLnB1c2goe1xuICAgIHR5cGU6ICdibG9ja3F1b3RlX2Nsb3NlJyxcbiAgICBsZXZlbDogLS1zdGF0ZS5sZXZlbFxuICB9KTtcbiAgc3RhdGUucGFyZW50VHlwZSA9IG9sZFBhcmVudFR5cGU7XG4gIGxpbmVzWzFdID0gc3RhdGUubGluZTtcblxuICAvLyBSZXN0b3JlIG9yaWdpbmFsIHRTaGlmdDsgdGhpcyBtaWdodCBub3QgYmUgbmVjZXNzYXJ5IHNpbmNlIHRoZSBwYXJzZXJcbiAgLy8gaGFzIGFscmVhZHkgYmVlbiBoZXJlLCBidXQganVzdCB0byBtYWtlIHN1cmUgd2UgY2FuIGRvIHRoYXQuXG4gIGZvciAoaSA9IDA7IGkgPCBvbGRUU2hpZnQubGVuZ3RoOyBpKyspIHtcbiAgICBzdGF0ZS5iTWFya3NbaSArIHN0YXJ0TGluZV0gPSBvbGRCTWFya3NbaV07XG4gICAgc3RhdGUudFNoaWZ0W2kgKyBzdGFydExpbmVdID0gb2xkVFNoaWZ0W2ldO1xuICB9XG4gIHN0YXRlLmJsa0luZGVudCA9IG9sZEluZGVudDtcblxuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIvLyBDb2RlIGJsb2NrICg0IHNwYWNlcyBwYWRkZWQpXG5cbid1c2Ugc3RyaWN0JztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvZGUoc3RhdGUsIHN0YXJ0TGluZSwgZW5kTGluZS8qLCBzaWxlbnQqLykge1xuICB2YXIgbmV4dExpbmUsIGxhc3Q7XG5cbiAgaWYgKHN0YXRlLnRTaGlmdFtzdGFydExpbmVdIC0gc3RhdGUuYmxrSW5kZW50IDwgNCkgeyByZXR1cm4gZmFsc2U7IH1cblxuICBsYXN0ID0gbmV4dExpbmUgPSBzdGFydExpbmUgKyAxO1xuXG4gIHdoaWxlIChuZXh0TGluZSA8IGVuZExpbmUpIHtcbiAgICBpZiAoc3RhdGUuaXNFbXB0eShuZXh0TGluZSkpIHtcbiAgICAgIG5leHRMaW5lKys7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHN0YXRlLnRTaGlmdFtuZXh0TGluZV0gLSBzdGF0ZS5ibGtJbmRlbnQgPj0gNCkge1xuICAgICAgbmV4dExpbmUrKztcbiAgICAgIGxhc3QgPSBuZXh0TGluZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBicmVhaztcbiAgfVxuXG4gIHN0YXRlLmxpbmUgPSBuZXh0TGluZTtcbiAgc3RhdGUudG9rZW5zLnB1c2goe1xuICAgIHR5cGU6ICdjb2RlX2Jsb2NrJyxcbiAgICBjb250ZW50OiBzdGF0ZS5nZXRMaW5lcyhzdGFydExpbmUsIGxhc3QsIDQgKyBzdGF0ZS5ibGtJbmRlbnQsIHRydWUpLFxuICAgIGxpbmVzOiBbIHN0YXJ0TGluZSwgc3RhdGUubGluZSBdLFxuICAgIGxldmVsOiBzdGF0ZS5sZXZlbFxuICB9KTtcblxuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIvLyBmZW5jZXMgKGBgYCBsYW5nLCB+fn4gbGFuZylcblxuJ3VzZSBzdHJpY3QnO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZmVuY2Uoc3RhdGUsIHN0YXJ0TGluZSwgZW5kTGluZSwgc2lsZW50KSB7XG4gIHZhciBtYXJrZXIsIGxlbiwgcGFyYW1zLCBuZXh0TGluZSwgbWVtLFxuICAgICAgaGF2ZUVuZE1hcmtlciA9IGZhbHNlLFxuICAgICAgcG9zID0gc3RhdGUuYk1hcmtzW3N0YXJ0TGluZV0gKyBzdGF0ZS50U2hpZnRbc3RhcnRMaW5lXSxcbiAgICAgIG1heCA9IHN0YXRlLmVNYXJrc1tzdGFydExpbmVdO1xuXG4gIGlmIChwb3MgKyAzID4gbWF4KSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIG1hcmtlciA9IHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcyk7XG5cbiAgaWYgKG1hcmtlciAhPT0gMHg3RS8qIH4gKi8gJiYgbWFya2VyICE9PSAweDYwIC8qIGAgKi8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBzY2FuIG1hcmtlciBsZW5ndGhcbiAgbWVtID0gcG9zO1xuICBwb3MgPSBzdGF0ZS5za2lwQ2hhcnMocG9zLCBtYXJrZXIpO1xuXG4gIGxlbiA9IHBvcyAtIG1lbTtcblxuICBpZiAobGVuIDwgMykgeyByZXR1cm4gZmFsc2U7IH1cblxuICBwYXJhbXMgPSBzdGF0ZS5zcmMuc2xpY2UocG9zLCBtYXgpLnRyaW0oKTtcblxuICBpZiAocGFyYW1zLmluZGV4T2YoJ2AnKSA+PSAwKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIC8vIFNpbmNlIHN0YXJ0IGlzIGZvdW5kLCB3ZSBjYW4gcmVwb3J0IHN1Y2Nlc3MgaGVyZSBpbiB2YWxpZGF0aW9uIG1vZGVcbiAgaWYgKHNpbGVudCkgeyByZXR1cm4gdHJ1ZTsgfVxuXG4gIC8vIHNlYXJjaCBlbmQgb2YgYmxvY2tcbiAgbmV4dExpbmUgPSBzdGFydExpbmU7XG5cbiAgZm9yICg7Oykge1xuICAgIG5leHRMaW5lKys7XG4gICAgaWYgKG5leHRMaW5lID49IGVuZExpbmUpIHtcbiAgICAgIC8vIHVuY2xvc2VkIGJsb2NrIHNob3VsZCBiZSBhdXRvY2xvc2VkIGJ5IGVuZCBvZiBkb2N1bWVudC5cbiAgICAgIC8vIGFsc28gYmxvY2sgc2VlbXMgdG8gYmUgYXV0b2Nsb3NlZCBieSBlbmQgb2YgcGFyZW50XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBwb3MgPSBtZW0gPSBzdGF0ZS5iTWFya3NbbmV4dExpbmVdICsgc3RhdGUudFNoaWZ0W25leHRMaW5lXTtcbiAgICBtYXggPSBzdGF0ZS5lTWFya3NbbmV4dExpbmVdO1xuXG4gICAgaWYgKHBvcyA8IG1heCAmJiBzdGF0ZS50U2hpZnRbbmV4dExpbmVdIDwgc3RhdGUuYmxrSW5kZW50KSB7XG4gICAgICAvLyBub24tZW1wdHkgbGluZSB3aXRoIG5lZ2F0aXZlIGluZGVudCBzaG91bGQgc3RvcCB0aGUgbGlzdDpcbiAgICAgIC8vIC0gYGBgXG4gICAgICAvLyAgdGVzdFxuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcykgIT09IG1hcmtlcikgeyBjb250aW51ZTsgfVxuXG4gICAgaWYgKHN0YXRlLnRTaGlmdFtuZXh0TGluZV0gLSBzdGF0ZS5ibGtJbmRlbnQgPj0gNCkge1xuICAgICAgLy8gY2xvc2luZyBmZW5jZSBzaG91bGQgYmUgaW5kZW50ZWQgbGVzcyB0aGFuIDQgc3BhY2VzXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBwb3MgPSBzdGF0ZS5za2lwQ2hhcnMocG9zLCBtYXJrZXIpO1xuXG4gICAgLy8gY2xvc2luZyBjb2RlIGZlbmNlIG11c3QgYmUgYXQgbGVhc3QgYXMgbG9uZyBhcyB0aGUgb3BlbmluZyBvbmVcbiAgICBpZiAocG9zIC0gbWVtIDwgbGVuKSB7IGNvbnRpbnVlOyB9XG5cbiAgICAvLyBtYWtlIHN1cmUgdGFpbCBoYXMgc3BhY2VzIG9ubHlcbiAgICBwb3MgPSBzdGF0ZS5za2lwU3BhY2VzKHBvcyk7XG5cbiAgICBpZiAocG9zIDwgbWF4KSB7IGNvbnRpbnVlOyB9XG5cbiAgICBoYXZlRW5kTWFya2VyID0gdHJ1ZTtcbiAgICAvLyBmb3VuZCFcbiAgICBicmVhaztcbiAgfVxuXG4gIC8vIElmIGEgZmVuY2UgaGFzIGhlYWRpbmcgc3BhY2VzLCB0aGV5IHNob3VsZCBiZSByZW1vdmVkIGZyb20gaXRzIGlubmVyIGJsb2NrXG4gIGxlbiA9IHN0YXRlLnRTaGlmdFtzdGFydExpbmVdO1xuXG4gIHN0YXRlLmxpbmUgPSBuZXh0TGluZSArIChoYXZlRW5kTWFya2VyID8gMSA6IDApO1xuICBzdGF0ZS50b2tlbnMucHVzaCh7XG4gICAgdHlwZTogJ2ZlbmNlJyxcbiAgICBwYXJhbXM6IHBhcmFtcyxcbiAgICBjb250ZW50OiBzdGF0ZS5nZXRMaW5lcyhzdGFydExpbmUgKyAxLCBuZXh0TGluZSwgbGVuLCB0cnVlKSxcbiAgICBsaW5lczogWyBzdGFydExpbmUsIHN0YXRlLmxpbmUgXSxcbiAgICBsZXZlbDogc3RhdGUubGV2ZWxcbiAgfSk7XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuIiwiLy8gaGVhZGluZyAoIywgIyMsIC4uLilcblxuJ3VzZSBzdHJpY3QnO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaGVhZGluZyhzdGF0ZSwgc3RhcnRMaW5lLCBlbmRMaW5lLCBzaWxlbnQpIHtcbiAgdmFyIGNoLCBsZXZlbCwgdG1wLFxuICAgICAgcG9zID0gc3RhdGUuYk1hcmtzW3N0YXJ0TGluZV0gKyBzdGF0ZS50U2hpZnRbc3RhcnRMaW5lXSxcbiAgICAgIG1heCA9IHN0YXRlLmVNYXJrc1tzdGFydExpbmVdO1xuXG4gIGNoICA9IHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcyk7XG5cbiAgaWYgKGNoICE9PSAweDIzLyogIyAqLyB8fCBwb3MgPj0gbWF4KSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIC8vIGNvdW50IGhlYWRpbmcgbGV2ZWxcbiAgbGV2ZWwgPSAxO1xuICBjaCA9IHN0YXRlLnNyYy5jaGFyQ29kZUF0KCsrcG9zKTtcbiAgd2hpbGUgKGNoID09PSAweDIzLyogIyAqLyAmJiBwb3MgPCBtYXggJiYgbGV2ZWwgPD0gNikge1xuICAgIGxldmVsKys7XG4gICAgY2ggPSBzdGF0ZS5zcmMuY2hhckNvZGVBdCgrK3Bvcyk7XG4gIH1cblxuICBpZiAobGV2ZWwgPiA2IHx8IChwb3MgPCBtYXggJiYgY2ggIT09IDB4MjAvKiBzcGFjZSAqLykpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgaWYgKHNpbGVudCkgeyByZXR1cm4gdHJ1ZTsgfVxuXG4gIC8vIExldCdzIGN1dCB0YWlscyBsaWtlICcgICAgIyMjICAnIGZyb20gdGhlIGVuZCBvZiBzdHJpbmdcblxuICBtYXggPSBzdGF0ZS5za2lwQ2hhcnNCYWNrKG1heCwgMHgyMCwgcG9zKTsgLy8gc3BhY2VcbiAgdG1wID0gc3RhdGUuc2tpcENoYXJzQmFjayhtYXgsIDB4MjMsIHBvcyk7IC8vICNcbiAgaWYgKHRtcCA+IHBvcyAmJiBzdGF0ZS5zcmMuY2hhckNvZGVBdCh0bXAgLSAxKSA9PT0gMHgyMC8qIHNwYWNlICovKSB7XG4gICAgbWF4ID0gdG1wO1xuICB9XG5cbiAgc3RhdGUubGluZSA9IHN0YXJ0TGluZSArIDE7XG5cbiAgc3RhdGUudG9rZW5zLnB1c2goeyB0eXBlOiAnaGVhZGluZ19vcGVuJyxcbiAgICBoTGV2ZWw6IGxldmVsLFxuICAgIGxpbmVzOiBbIHN0YXJ0TGluZSwgc3RhdGUubGluZSBdLFxuICAgIGxldmVsOiBzdGF0ZS5sZXZlbFxuICB9KTtcblxuICAvLyBvbmx5IGlmIGhlYWRlciBpcyBub3QgZW1wdHlcbiAgaWYgKHBvcyA8IG1heCkge1xuICAgIHN0YXRlLnRva2Vucy5wdXNoKHtcbiAgICAgIHR5cGU6ICdpbmxpbmUnLFxuICAgICAgY29udGVudDogc3RhdGUuc3JjLnNsaWNlKHBvcywgbWF4KS50cmltKCksXG4gICAgICBsZXZlbDogc3RhdGUubGV2ZWwgKyAxLFxuICAgICAgbGluZXM6IFsgc3RhcnRMaW5lLCBzdGF0ZS5saW5lIF0sXG4gICAgICBjaGlsZHJlbjogW11cbiAgICB9KTtcbiAgfVxuICBzdGF0ZS50b2tlbnMucHVzaCh7IHR5cGU6ICdoZWFkaW5nX2Nsb3NlJywgaExldmVsOiBsZXZlbCwgbGV2ZWw6IHN0YXRlLmxldmVsIH0pO1xuXG4gIHJldHVybiB0cnVlO1xufTtcbiIsIi8vIEhvcml6b250YWwgcnVsZVxuXG4ndXNlIHN0cmljdCc7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBocihzdGF0ZSwgc3RhcnRMaW5lLCBlbmRMaW5lLCBzaWxlbnQpIHtcbiAgdmFyIG1hcmtlciwgY250LCBjaCxcbiAgICAgIHBvcyA9IHN0YXRlLmJNYXJrc1tzdGFydExpbmVdICsgc3RhdGUudFNoaWZ0W3N0YXJ0TGluZV0sXG4gICAgICBtYXggPSBzdGF0ZS5lTWFya3Nbc3RhcnRMaW5lXTtcblxuICBtYXJrZXIgPSBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MrKyk7XG5cbiAgLy8gQ2hlY2sgaHIgbWFya2VyXG4gIGlmIChtYXJrZXIgIT09IDB4MkEvKiAqICovICYmXG4gICAgICBtYXJrZXIgIT09IDB4MkQvKiAtICovICYmXG4gICAgICBtYXJrZXIgIT09IDB4NUYvKiBfICovKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gbWFya2VycyBjYW4gYmUgbWl4ZWQgd2l0aCBzcGFjZXMsIGJ1dCB0aGVyZSBzaG91bGQgYmUgYXQgbGVhc3QgMyBvbmVcblxuICBjbnQgPSAxO1xuICB3aGlsZSAocG9zIDwgbWF4KSB7XG4gICAgY2ggPSBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MrKyk7XG4gICAgaWYgKGNoICE9PSBtYXJrZXIgJiYgY2ggIT09IDB4MjAvKiBzcGFjZSAqLykgeyByZXR1cm4gZmFsc2U7IH1cbiAgICBpZiAoY2ggPT09IG1hcmtlcikgeyBjbnQrKzsgfVxuICB9XG5cbiAgaWYgKGNudCA8IDMpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgaWYgKHNpbGVudCkgeyByZXR1cm4gdHJ1ZTsgfVxuXG4gIHN0YXRlLmxpbmUgPSBzdGFydExpbmUgKyAxO1xuICBzdGF0ZS50b2tlbnMucHVzaCh7XG4gICAgdHlwZTogJ2hyJyxcbiAgICBsaW5lczogWyBzdGFydExpbmUsIHN0YXRlLmxpbmUgXSxcbiAgICBsZXZlbDogc3RhdGUubGV2ZWxcbiAgfSk7XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuIiwiLy8gSFRNTCBibG9ja1xuXG4ndXNlIHN0cmljdCc7XG5cblxudmFyIGJsb2NrX25hbWVzID0gcmVxdWlyZSgnLi4vY29tbW9uL2h0bWxfYmxvY2tzJyk7XG5cblxudmFyIEhUTUxfVEFHX09QRU5fUkUgPSAvXjwoW2EtekEtWl17MSwxNX0pW1xcc1xcLz5dLztcbnZhciBIVE1MX1RBR19DTE9TRV9SRSA9IC9ePFxcLyhbYS16QS1aXXsxLDE1fSlbXFxzPl0vO1xuXG5mdW5jdGlvbiBpc0xldHRlcihjaCkge1xuICAvKmVzbGludCBuby1iaXR3aXNlOjAqL1xuICB2YXIgbGMgPSBjaCB8IDB4MjA7IC8vIHRvIGxvd2VyIGNhc2VcbiAgcmV0dXJuIChsYyA+PSAweDYxLyogYSAqLykgJiYgKGxjIDw9IDB4N2EvKiB6ICovKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBodG1sX2Jsb2NrKHN0YXRlLCBzdGFydExpbmUsIGVuZExpbmUsIHNpbGVudCkge1xuICB2YXIgY2gsIG1hdGNoLCBuZXh0TGluZSxcbiAgICAgIHBvcyA9IHN0YXRlLmJNYXJrc1tzdGFydExpbmVdLFxuICAgICAgbWF4ID0gc3RhdGUuZU1hcmtzW3N0YXJ0TGluZV0sXG4gICAgICBzaGlmdCA9IHN0YXRlLnRTaGlmdFtzdGFydExpbmVdO1xuXG4gIHBvcyArPSBzaGlmdDtcblxuICBpZiAoIXN0YXRlLm1kLm9wdGlvbnMuaHRtbCkgeyByZXR1cm4gZmFsc2U7IH1cblxuICBpZiAoc2hpZnQgPiAzIHx8IHBvcyArIDIgPj0gbWF4KSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIGlmIChzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MpICE9PSAweDNDLyogPCAqLykgeyByZXR1cm4gZmFsc2U7IH1cblxuICBjaCA9IHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcyArIDEpO1xuXG4gIGlmIChjaCA9PT0gMHgyMS8qICEgKi8gfHwgY2ggPT09IDB4M0YvKiA/ICovKSB7XG4gICAgLy8gRGlyZWN0aXZlIHN0YXJ0IC8gY29tbWVudCBzdGFydCAvIHByb2Nlc3NpbmcgaW5zdHJ1Y3Rpb24gc3RhcnRcbiAgICBpZiAoc2lsZW50KSB7IHJldHVybiB0cnVlOyB9XG5cbiAgfSBlbHNlIGlmIChjaCA9PT0gMHgyRi8qIC8gKi8gfHwgaXNMZXR0ZXIoY2gpKSB7XG5cbiAgICAvLyBQcm9iYWJseSBzdGFydCBvciBlbmQgb2YgdGFnXG4gICAgaWYgKGNoID09PSAweDJGLyogXFwgKi8pIHtcbiAgICAgIC8vIGNsb3NpbmcgdGFnXG4gICAgICBtYXRjaCA9IHN0YXRlLnNyYy5zbGljZShwb3MsIG1heCkubWF0Y2goSFRNTF9UQUdfQ0xPU0VfUkUpO1xuICAgICAgaWYgKCFtYXRjaCkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gb3BlbmluZyB0YWdcbiAgICAgIG1hdGNoID0gc3RhdGUuc3JjLnNsaWNlKHBvcywgbWF4KS5tYXRjaChIVE1MX1RBR19PUEVOX1JFKTtcbiAgICAgIGlmICghbWF0Y2gpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgfVxuICAgIC8vIE1ha2Ugc3VyZSB0YWcgbmFtZSBpcyB2YWxpZFxuICAgIGlmIChibG9ja19uYW1lc1ttYXRjaFsxXS50b0xvd2VyQ2FzZSgpXSAhPT0gdHJ1ZSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICBpZiAoc2lsZW50KSB7IHJldHVybiB0cnVlOyB9XG5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBJZiB3ZSBhcmUgaGVyZSAtIHdlIGRldGVjdGVkIEhUTUwgYmxvY2suXG4gIC8vIExldCdzIHJvbGwgZG93biB0aWxsIGVtcHR5IGxpbmUgKGJsb2NrIGVuZCkuXG4gIG5leHRMaW5lID0gc3RhcnRMaW5lICsgMTtcbiAgd2hpbGUgKG5leHRMaW5lIDwgc3RhdGUubGluZU1heCAmJiAhc3RhdGUuaXNFbXB0eShuZXh0TGluZSkpIHtcbiAgICBuZXh0TGluZSsrO1xuICB9XG5cbiAgc3RhdGUubGluZSA9IG5leHRMaW5lO1xuICBzdGF0ZS50b2tlbnMucHVzaCh7XG4gICAgdHlwZTogJ2h0bWxfYmxvY2snLFxuICAgIGxldmVsOiBzdGF0ZS5sZXZlbCxcbiAgICBsaW5lczogWyBzdGFydExpbmUsIHN0YXRlLmxpbmUgXSxcbiAgICBjb250ZW50OiBzdGF0ZS5nZXRMaW5lcyhzdGFydExpbmUsIG5leHRMaW5lLCAwLCB0cnVlKVxuICB9KTtcblxuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIvLyBsaGVhZGluZyAoLS0tLCA9PT0pXG5cbid1c2Ugc3RyaWN0JztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxoZWFkaW5nKHN0YXRlLCBzdGFydExpbmUsIGVuZExpbmUvKiwgc2lsZW50Ki8pIHtcbiAgdmFyIG1hcmtlciwgcG9zLCBtYXgsXG4gICAgICBuZXh0ID0gc3RhcnRMaW5lICsgMTtcblxuICBpZiAobmV4dCA+PSBlbmRMaW5lKSB7IHJldHVybiBmYWxzZTsgfVxuICBpZiAoc3RhdGUudFNoaWZ0W25leHRdIDwgc3RhdGUuYmxrSW5kZW50KSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIC8vIFNjYW4gbmV4dCBsaW5lXG5cbiAgaWYgKHN0YXRlLnRTaGlmdFtuZXh0XSAtIHN0YXRlLmJsa0luZGVudCA+IDMpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgcG9zID0gc3RhdGUuYk1hcmtzW25leHRdICsgc3RhdGUudFNoaWZ0W25leHRdO1xuICBtYXggPSBzdGF0ZS5lTWFya3NbbmV4dF07XG5cbiAgaWYgKHBvcyA+PSBtYXgpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgbWFya2VyID0gc3RhdGUuc3JjLmNoYXJDb2RlQXQocG9zKTtcblxuICBpZiAobWFya2VyICE9PSAweDJELyogLSAqLyAmJiBtYXJrZXIgIT09IDB4M0QvKiA9ICovKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIHBvcyA9IHN0YXRlLnNraXBDaGFycyhwb3MsIG1hcmtlcik7XG5cbiAgcG9zID0gc3RhdGUuc2tpcFNwYWNlcyhwb3MpO1xuXG4gIGlmIChwb3MgPCBtYXgpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgcG9zID0gc3RhdGUuYk1hcmtzW3N0YXJ0TGluZV0gKyBzdGF0ZS50U2hpZnRbc3RhcnRMaW5lXTtcblxuICBzdGF0ZS5saW5lID0gbmV4dCArIDE7XG4gIHN0YXRlLnRva2Vucy5wdXNoKHtcbiAgICB0eXBlOiAnaGVhZGluZ19vcGVuJyxcbiAgICBoTGV2ZWw6IG1hcmtlciA9PT0gMHgzRC8qID0gKi8gPyAxIDogMixcbiAgICBsaW5lczogWyBzdGFydExpbmUsIHN0YXRlLmxpbmUgXSxcbiAgICBsZXZlbDogc3RhdGUubGV2ZWxcbiAgfSk7XG4gIHN0YXRlLnRva2Vucy5wdXNoKHtcbiAgICB0eXBlOiAnaW5saW5lJyxcbiAgICBjb250ZW50OiBzdGF0ZS5zcmMuc2xpY2UocG9zLCBzdGF0ZS5lTWFya3Nbc3RhcnRMaW5lXSkudHJpbSgpLFxuICAgIGxldmVsOiBzdGF0ZS5sZXZlbCArIDEsXG4gICAgbGluZXM6IFsgc3RhcnRMaW5lLCBzdGF0ZS5saW5lIC0gMSBdLFxuICAgIGNoaWxkcmVuOiBbXVxuICB9KTtcbiAgc3RhdGUudG9rZW5zLnB1c2goe1xuICAgIHR5cGU6ICdoZWFkaW5nX2Nsb3NlJyxcbiAgICBoTGV2ZWw6IG1hcmtlciA9PT0gMHgzRC8qID0gKi8gPyAxIDogMixcbiAgICBsZXZlbDogc3RhdGUubGV2ZWxcbiAgfSk7XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuIiwiLy8gTGlzdHNcblxuJ3VzZSBzdHJpY3QnO1xuXG5cbi8vIFNlYXJjaCBgWy0rKl1bXFxuIF1gLCByZXR1cm5zIG5leHQgcG9zIGFydGVyIG1hcmtlciBvbiBzdWNjZXNzXG4vLyBvciAtMSBvbiBmYWlsLlxuZnVuY3Rpb24gc2tpcEJ1bGxldExpc3RNYXJrZXIoc3RhdGUsIHN0YXJ0TGluZSkge1xuICB2YXIgbWFya2VyLCBwb3MsIG1heDtcblxuICBwb3MgPSBzdGF0ZS5iTWFya3Nbc3RhcnRMaW5lXSArIHN0YXRlLnRTaGlmdFtzdGFydExpbmVdO1xuICBtYXggPSBzdGF0ZS5lTWFya3Nbc3RhcnRMaW5lXTtcblxuICBtYXJrZXIgPSBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MrKyk7XG4gIC8vIENoZWNrIGJ1bGxldFxuICBpZiAobWFya2VyICE9PSAweDJBLyogKiAqLyAmJlxuICAgICAgbWFya2VyICE9PSAweDJELyogLSAqLyAmJlxuICAgICAgbWFya2VyICE9PSAweDJCLyogKyAqLykge1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIGlmIChwb3MgPCBtYXggJiYgc3RhdGUuc3JjLmNoYXJDb2RlQXQocG9zKSAhPT0gMHgyMCkge1xuICAgIC8vIFwiIDEudGVzdCBcIiAtIGlzIG5vdCBhIGxpc3QgaXRlbVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIHJldHVybiBwb3M7XG59XG5cbi8vIFNlYXJjaCBgXFxkK1suKV1bXFxuIF1gLCByZXR1cm5zIG5leHQgcG9zIGFydGVyIG1hcmtlciBvbiBzdWNjZXNzXG4vLyBvciAtMSBvbiBmYWlsLlxuZnVuY3Rpb24gc2tpcE9yZGVyZWRMaXN0TWFya2VyKHN0YXRlLCBzdGFydExpbmUpIHtcbiAgdmFyIGNoLFxuICAgICAgcG9zID0gc3RhdGUuYk1hcmtzW3N0YXJ0TGluZV0gKyBzdGF0ZS50U2hpZnRbc3RhcnRMaW5lXSxcbiAgICAgIG1heCA9IHN0YXRlLmVNYXJrc1tzdGFydExpbmVdO1xuXG4gIC8vIExpc3QgbWFya2VyIHNob3VsZCBoYXZlIGF0IGxlYXN0IDIgY2hhcnMgKGRpZ2l0ICsgZG90KVxuICBpZiAocG9zICsgMSA+PSBtYXgpIHsgcmV0dXJuIC0xOyB9XG5cbiAgY2ggPSBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MrKyk7XG5cbiAgaWYgKGNoIDwgMHgzMC8qIDAgKi8gfHwgY2ggPiAweDM5LyogOSAqLykgeyByZXR1cm4gLTE7IH1cblxuICBmb3IgKDs7KSB7XG4gICAgLy8gRU9MIC0+IGZhaWxcbiAgICBpZiAocG9zID49IG1heCkgeyByZXR1cm4gLTE7IH1cblxuICAgIGNoID0gc3RhdGUuc3JjLmNoYXJDb2RlQXQocG9zKyspO1xuXG4gICAgaWYgKGNoID49IDB4MzAvKiAwICovICYmIGNoIDw9IDB4MzkvKiA5ICovKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBmb3VuZCB2YWxpZCBtYXJrZXJcbiAgICBpZiAoY2ggPT09IDB4MjkvKiApICovIHx8IGNoID09PSAweDJlLyogLiAqLykge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xuICB9XG5cblxuICBpZiAocG9zIDwgbWF4ICYmIHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcykgIT09IDB4MjAvKiBzcGFjZSAqLykge1xuICAgIC8vIFwiIDEudGVzdCBcIiAtIGlzIG5vdCBhIGxpc3QgaXRlbVxuICAgIHJldHVybiAtMTtcbiAgfVxuICByZXR1cm4gcG9zO1xufVxuXG5mdW5jdGlvbiBtYXJrVGlnaHRQYXJhZ3JhcGhzKHN0YXRlLCBpZHgpIHtcbiAgdmFyIGksIGwsXG4gICAgICBsZXZlbCA9IHN0YXRlLmxldmVsICsgMjtcblxuICBmb3IgKGkgPSBpZHggKyAyLCBsID0gc3RhdGUudG9rZW5zLmxlbmd0aCAtIDI7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAoc3RhdGUudG9rZW5zW2ldLmxldmVsID09PSBsZXZlbCAmJiBzdGF0ZS50b2tlbnNbaV0udHlwZSA9PT0gJ3BhcmFncmFwaF9vcGVuJykge1xuICAgICAgc3RhdGUudG9rZW5zW2kgKyAyXS50aWdodCA9IHRydWU7XG4gICAgICBzdGF0ZS50b2tlbnNbaV0udGlnaHQgPSB0cnVlO1xuICAgICAgaSArPSAyO1xuICAgIH1cbiAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbGlzdChzdGF0ZSwgc3RhcnRMaW5lLCBlbmRMaW5lLCBzaWxlbnQpIHtcbiAgdmFyIG5leHRMaW5lLFxuICAgICAgaW5kZW50LFxuICAgICAgb2xkVFNoaWZ0LFxuICAgICAgb2xkSW5kZW50LFxuICAgICAgb2xkVGlnaHQsXG4gICAgICBvbGRQYXJlbnRUeXBlLFxuICAgICAgc3RhcnQsXG4gICAgICBwb3NBZnRlck1hcmtlcixcbiAgICAgIG1heCxcbiAgICAgIGluZGVudEFmdGVyTWFya2VyLFxuICAgICAgbWFya2VyVmFsdWUsXG4gICAgICBtYXJrZXJDaGFyQ29kZSxcbiAgICAgIGlzT3JkZXJlZCxcbiAgICAgIGNvbnRlbnRTdGFydCxcbiAgICAgIGxpc3RUb2tJZHgsXG4gICAgICBwcmV2RW1wdHlFbmQsXG4gICAgICBsaXN0TGluZXMsXG4gICAgICBpdGVtTGluZXMsXG4gICAgICB0aWdodCA9IHRydWUsXG4gICAgICB0ZXJtaW5hdG9yUnVsZXMsXG4gICAgICBpLCBsLCB0ZXJtaW5hdGU7XG5cbiAgLy8gRGV0ZWN0IGxpc3QgdHlwZSBhbmQgcG9zaXRpb24gYWZ0ZXIgbWFya2VyXG4gIGlmICgocG9zQWZ0ZXJNYXJrZXIgPSBza2lwT3JkZXJlZExpc3RNYXJrZXIoc3RhdGUsIHN0YXJ0TGluZSkpID49IDApIHtcbiAgICBpc09yZGVyZWQgPSB0cnVlO1xuICB9IGVsc2UgaWYgKChwb3NBZnRlck1hcmtlciA9IHNraXBCdWxsZXRMaXN0TWFya2VyKHN0YXRlLCBzdGFydExpbmUpKSA+PSAwKSB7XG4gICAgaXNPcmRlcmVkID0gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gV2Ugc2hvdWxkIHRlcm1pbmF0ZSBsaXN0IG9uIHN0eWxlIGNoYW5nZS4gUmVtZW1iZXIgZmlyc3Qgb25lIHRvIGNvbXBhcmUuXG4gIG1hcmtlckNoYXJDb2RlID0gc3RhdGUuc3JjLmNoYXJDb2RlQXQocG9zQWZ0ZXJNYXJrZXIgLSAxKTtcblxuICAvLyBGb3IgdmFsaWRhdGlvbiBtb2RlIHdlIGNhbiB0ZXJtaW5hdGUgaW1tZWRpYXRlbHlcbiAgaWYgKHNpbGVudCkgeyByZXR1cm4gdHJ1ZTsgfVxuXG4gIC8vIFN0YXJ0IGxpc3RcbiAgbGlzdFRva0lkeCA9IHN0YXRlLnRva2Vucy5sZW5ndGg7XG5cbiAgaWYgKGlzT3JkZXJlZCkge1xuICAgIHN0YXJ0ID0gc3RhdGUuYk1hcmtzW3N0YXJ0TGluZV0gKyBzdGF0ZS50U2hpZnRbc3RhcnRMaW5lXTtcbiAgICBtYXJrZXJWYWx1ZSA9IE51bWJlcihzdGF0ZS5zcmMuc3Vic3RyKHN0YXJ0LCBwb3NBZnRlck1hcmtlciAtIHN0YXJ0IC0gMSkpO1xuXG4gICAgc3RhdGUudG9rZW5zLnB1c2goe1xuICAgICAgdHlwZTogJ29yZGVyZWRfbGlzdF9vcGVuJyxcbiAgICAgIG9yZGVyOiBtYXJrZXJWYWx1ZSxcbiAgICAgIGxpbmVzOiBsaXN0TGluZXMgPSBbIHN0YXJ0TGluZSwgMCBdLFxuICAgICAgbGV2ZWw6IHN0YXRlLmxldmVsKytcbiAgICB9KTtcblxuICB9IGVsc2Uge1xuICAgIHN0YXRlLnRva2Vucy5wdXNoKHtcbiAgICAgIHR5cGU6ICdidWxsZXRfbGlzdF9vcGVuJyxcbiAgICAgIGxpbmVzOiBsaXN0TGluZXMgPSBbIHN0YXJ0TGluZSwgMCBdLFxuICAgICAgbGV2ZWw6IHN0YXRlLmxldmVsKytcbiAgICB9KTtcbiAgfVxuXG4gIC8vXG4gIC8vIEl0ZXJhdGUgbGlzdCBpdGVtc1xuICAvL1xuXG4gIG5leHRMaW5lID0gc3RhcnRMaW5lO1xuICBwcmV2RW1wdHlFbmQgPSBmYWxzZTtcbiAgdGVybWluYXRvclJ1bGVzID0gc3RhdGUubWQuYmxvY2sucnVsZXIuZ2V0UnVsZXMoJ2xpc3QnKTtcblxuICB3aGlsZSAobmV4dExpbmUgPCBlbmRMaW5lKSB7XG4gICAgY29udGVudFN0YXJ0ID0gc3RhdGUuc2tpcFNwYWNlcyhwb3NBZnRlck1hcmtlcik7XG4gICAgbWF4ID0gc3RhdGUuZU1hcmtzW25leHRMaW5lXTtcblxuICAgIGlmIChjb250ZW50U3RhcnQgPj0gbWF4KSB7XG4gICAgICAvLyB0cmltbWluZyBzcGFjZSBpbiBcIi0gICAgXFxuICAzXCIgY2FzZSwgaW5kZW50IGlzIDEgaGVyZVxuICAgICAgaW5kZW50QWZ0ZXJNYXJrZXIgPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbmRlbnRBZnRlck1hcmtlciA9IGNvbnRlbnRTdGFydCAtIHBvc0FmdGVyTWFya2VyO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGhhdmUgbW9yZSB0aGFuIDQgc3BhY2VzLCB0aGUgaW5kZW50IGlzIDFcbiAgICAvLyAodGhlIHJlc3QgaXMganVzdCBpbmRlbnRlZCBjb2RlIGJsb2NrKVxuICAgIGlmIChpbmRlbnRBZnRlck1hcmtlciA+IDQpIHsgaW5kZW50QWZ0ZXJNYXJrZXIgPSAxOyB9XG5cbiAgICAvLyBcIiAgLSAgdGVzdFwiXG4gICAgLy8gIF5eXl5eIC0gY2FsY3VsYXRpbmcgdG90YWwgbGVuZ3RoIG9mIHRoaXMgdGhpbmdcbiAgICBpbmRlbnQgPSAocG9zQWZ0ZXJNYXJrZXIgLSBzdGF0ZS5iTWFya3NbbmV4dExpbmVdKSArIGluZGVudEFmdGVyTWFya2VyO1xuXG4gICAgLy8gUnVuIHN1YnBhcnNlciAmIHdyaXRlIHRva2Vuc1xuICAgIHN0YXRlLnRva2Vucy5wdXNoKHtcbiAgICAgIHR5cGU6ICdsaXN0X2l0ZW1fb3BlbicsXG4gICAgICBsaW5lczogaXRlbUxpbmVzID0gWyBzdGFydExpbmUsIDAgXSxcbiAgICAgIGxldmVsOiBzdGF0ZS5sZXZlbCsrXG4gICAgfSk7XG5cbiAgICBvbGRJbmRlbnQgPSBzdGF0ZS5ibGtJbmRlbnQ7XG4gICAgb2xkVGlnaHQgPSBzdGF0ZS50aWdodDtcbiAgICBvbGRUU2hpZnQgPSBzdGF0ZS50U2hpZnRbc3RhcnRMaW5lXTtcbiAgICBvbGRQYXJlbnRUeXBlID0gc3RhdGUucGFyZW50VHlwZTtcbiAgICBzdGF0ZS50U2hpZnRbc3RhcnRMaW5lXSA9IGNvbnRlbnRTdGFydCAtIHN0YXRlLmJNYXJrc1tzdGFydExpbmVdO1xuICAgIHN0YXRlLmJsa0luZGVudCA9IGluZGVudDtcbiAgICBzdGF0ZS50aWdodCA9IHRydWU7XG4gICAgc3RhdGUucGFyZW50VHlwZSA9ICdsaXN0JztcblxuICAgIHN0YXRlLm1kLmJsb2NrLnRva2VuaXplKHN0YXRlLCBzdGFydExpbmUsIGVuZExpbmUsIHRydWUpO1xuXG4gICAgLy8gSWYgYW55IG9mIGxpc3QgaXRlbSBpcyB0aWdodCwgbWFyayBsaXN0IGFzIHRpZ2h0XG4gICAgaWYgKCFzdGF0ZS50aWdodCB8fCBwcmV2RW1wdHlFbmQpIHtcbiAgICAgIHRpZ2h0ID0gZmFsc2U7XG4gICAgfVxuICAgIC8vIEl0ZW0gYmVjb21lIGxvb3NlIGlmIGZpbmlzaCB3aXRoIGVtcHR5IGxpbmUsXG4gICAgLy8gYnV0IHdlIHNob3VsZCBmaWx0ZXIgbGFzdCBlbGVtZW50LCBiZWNhdXNlIGl0IG1lYW5zIGxpc3QgZmluaXNoXG4gICAgcHJldkVtcHR5RW5kID0gKHN0YXRlLmxpbmUgLSBzdGFydExpbmUpID4gMSAmJiBzdGF0ZS5pc0VtcHR5KHN0YXRlLmxpbmUgLSAxKTtcblxuICAgIHN0YXRlLmJsa0luZGVudCA9IG9sZEluZGVudDtcbiAgICBzdGF0ZS50U2hpZnRbc3RhcnRMaW5lXSA9IG9sZFRTaGlmdDtcbiAgICBzdGF0ZS50aWdodCA9IG9sZFRpZ2h0O1xuICAgIHN0YXRlLnBhcmVudFR5cGUgPSBvbGRQYXJlbnRUeXBlO1xuXG4gICAgc3RhdGUudG9rZW5zLnB1c2goe1xuICAgICAgdHlwZTogJ2xpc3RfaXRlbV9jbG9zZScsXG4gICAgICBsZXZlbDogLS1zdGF0ZS5sZXZlbFxuICAgIH0pO1xuXG4gICAgbmV4dExpbmUgPSBzdGFydExpbmUgPSBzdGF0ZS5saW5lO1xuICAgIGl0ZW1MaW5lc1sxXSA9IG5leHRMaW5lO1xuICAgIGNvbnRlbnRTdGFydCA9IHN0YXRlLmJNYXJrc1tzdGFydExpbmVdO1xuXG4gICAgaWYgKG5leHRMaW5lID49IGVuZExpbmUpIHsgYnJlYWs7IH1cblxuICAgIGlmIChzdGF0ZS5pc0VtcHR5KG5leHRMaW5lKSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyBUcnkgdG8gY2hlY2sgaWYgbGlzdCBpcyB0ZXJtaW5hdGVkIG9yIGNvbnRpbnVlZC5cbiAgICAvL1xuICAgIGlmIChzdGF0ZS50U2hpZnRbbmV4dExpbmVdIDwgc3RhdGUuYmxrSW5kZW50KSB7IGJyZWFrOyB9XG5cbiAgICAvLyBmYWlsIGlmIHRlcm1pbmF0aW5nIGJsb2NrIGZvdW5kXG4gICAgdGVybWluYXRlID0gZmFsc2U7XG4gICAgZm9yIChpID0gMCwgbCA9IHRlcm1pbmF0b3JSdWxlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmICh0ZXJtaW5hdG9yUnVsZXNbaV0oc3RhdGUsIG5leHRMaW5lLCBlbmRMaW5lLCB0cnVlKSkge1xuICAgICAgICB0ZXJtaW5hdGUgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRlcm1pbmF0ZSkgeyBicmVhazsgfVxuXG4gICAgLy8gZmFpbCBpZiBsaXN0IGhhcyBhbm90aGVyIHR5cGVcbiAgICBpZiAoaXNPcmRlcmVkKSB7XG4gICAgICBwb3NBZnRlck1hcmtlciA9IHNraXBPcmRlcmVkTGlzdE1hcmtlcihzdGF0ZSwgbmV4dExpbmUpO1xuICAgICAgaWYgKHBvc0FmdGVyTWFya2VyIDwgMCkgeyBicmVhazsgfVxuICAgIH0gZWxzZSB7XG4gICAgICBwb3NBZnRlck1hcmtlciA9IHNraXBCdWxsZXRMaXN0TWFya2VyKHN0YXRlLCBuZXh0TGluZSk7XG4gICAgICBpZiAocG9zQWZ0ZXJNYXJrZXIgPCAwKSB7IGJyZWFrOyB9XG4gICAgfVxuXG4gICAgaWYgKG1hcmtlckNoYXJDb2RlICE9PSBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3NBZnRlck1hcmtlciAtIDEpKSB7IGJyZWFrOyB9XG4gIH1cblxuICAvLyBGaW5pbGl6ZSBsaXN0XG4gIHN0YXRlLnRva2Vucy5wdXNoKHtcbiAgICB0eXBlOiBpc09yZGVyZWQgPyAnb3JkZXJlZF9saXN0X2Nsb3NlJyA6ICdidWxsZXRfbGlzdF9jbG9zZScsXG4gICAgbGV2ZWw6IC0tc3RhdGUubGV2ZWxcbiAgfSk7XG4gIGxpc3RMaW5lc1sxXSA9IG5leHRMaW5lO1xuXG4gIHN0YXRlLmxpbmUgPSBuZXh0TGluZTtcblxuICAvLyBtYXJrIHBhcmFncmFwaHMgdGlnaHQgaWYgbmVlZGVkXG4gIGlmICh0aWdodCkge1xuICAgIG1hcmtUaWdodFBhcmFncmFwaHMoc3RhdGUsIGxpc3RUb2tJZHgpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuIiwiLy8gUGFyYWdyYXBoXG5cbid1c2Ugc3RyaWN0JztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcmFncmFwaChzdGF0ZSwgc3RhcnRMaW5lLyosIGVuZExpbmUqLykge1xuICB2YXIgZW5kTGluZSwgY29udGVudCwgdGVybWluYXRlLCBpLCBsLFxuICAgICAgbmV4dExpbmUgPSBzdGFydExpbmUgKyAxLFxuICAgICAgdGVybWluYXRvclJ1bGVzO1xuXG4gIGVuZExpbmUgPSBzdGF0ZS5saW5lTWF4O1xuXG4gIC8vIGp1bXAgbGluZS1ieS1saW5lIHVudGlsIGVtcHR5IG9uZSBvciBFT0ZcbiAgaWYgKG5leHRMaW5lIDwgZW5kTGluZSAmJiAhc3RhdGUuaXNFbXB0eShuZXh0TGluZSkpIHtcbiAgICB0ZXJtaW5hdG9yUnVsZXMgPSBzdGF0ZS5tZC5ibG9jay5ydWxlci5nZXRSdWxlcygncGFyYWdyYXBoJyk7XG5cbiAgICBmb3IgKDsgbmV4dExpbmUgPCBlbmRMaW5lICYmICFzdGF0ZS5pc0VtcHR5KG5leHRMaW5lKTsgbmV4dExpbmUrKykge1xuICAgICAgLy8gdGhpcyB3b3VsZCBiZSBhIGNvZGUgYmxvY2sgbm9ybWFsbHksIGJ1dCBhZnRlciBwYXJhZ3JhcGhcbiAgICAgIC8vIGl0J3MgY29uc2lkZXJlZCBhIGxhenkgY29udGludWF0aW9uIHJlZ2FyZGxlc3Mgb2Ygd2hhdCdzIHRoZXJlXG4gICAgICBpZiAoc3RhdGUudFNoaWZ0W25leHRMaW5lXSAtIHN0YXRlLmJsa0luZGVudCA+IDMpIHsgY29udGludWU7IH1cblxuICAgICAgLy8gU29tZSB0YWdzIGNhbiB0ZXJtaW5hdGUgcGFyYWdyYXBoIHdpdGhvdXQgZW1wdHkgbGluZS5cbiAgICAgIHRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgICAgZm9yIChpID0gMCwgbCA9IHRlcm1pbmF0b3JSdWxlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKHRlcm1pbmF0b3JSdWxlc1tpXShzdGF0ZSwgbmV4dExpbmUsIGVuZExpbmUsIHRydWUpKSB7XG4gICAgICAgICAgdGVybWluYXRlID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRlcm1pbmF0ZSkgeyBicmVhazsgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnRlbnQgPSBzdGF0ZS5nZXRMaW5lcyhzdGFydExpbmUsIG5leHRMaW5lLCBzdGF0ZS5ibGtJbmRlbnQsIGZhbHNlKS50cmltKCk7XG5cbiAgc3RhdGUubGluZSA9IG5leHRMaW5lO1xuICBzdGF0ZS50b2tlbnMucHVzaCh7XG4gICAgdHlwZTogJ3BhcmFncmFwaF9vcGVuJyxcbiAgICB0aWdodDogZmFsc2UsXG4gICAgbGluZXM6IFsgc3RhcnRMaW5lLCBzdGF0ZS5saW5lIF0sXG4gICAgbGV2ZWw6IHN0YXRlLmxldmVsXG4gIH0pO1xuICBzdGF0ZS50b2tlbnMucHVzaCh7XG4gICAgdHlwZTogJ2lubGluZScsXG4gICAgY29udGVudDogY29udGVudCxcbiAgICBsZXZlbDogc3RhdGUubGV2ZWwgKyAxLFxuICAgIGxpbmVzOiBbIHN0YXJ0TGluZSwgc3RhdGUubGluZSBdLFxuICAgIGNoaWxkcmVuOiBbXVxuICB9KTtcbiAgc3RhdGUudG9rZW5zLnB1c2goe1xuICAgIHR5cGU6ICdwYXJhZ3JhcGhfY2xvc2UnLFxuICAgIHRpZ2h0OiBmYWxzZSxcbiAgICBsZXZlbDogc3RhdGUubGV2ZWxcbiAgfSk7XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBwYXJzZUxpbmtEZXN0aW5hdGlvbiA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcGFyc2VfbGlua19kZXN0aW5hdGlvbicpO1xudmFyIHBhcnNlTGlua1RpdGxlICAgICAgID0gcmVxdWlyZSgnLi4vaGVscGVycy9wYXJzZV9saW5rX3RpdGxlJyk7XG52YXIgbm9ybWFsaXplUmVmZXJlbmNlICAgPSByZXF1aXJlKCcuLi9jb21tb24vdXRpbHMnKS5ub3JtYWxpemVSZWZlcmVuY2U7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZWZlcmVuY2Uoc3RhdGUsIHN0YXJ0TGluZSwgX2VuZExpbmUsIHNpbGVudCkge1xuICB2YXIgY2gsXG4gICAgICBkZXN0RW5kUG9zLFxuICAgICAgZGVzdEVuZExpbmVObyxcbiAgICAgIGVuZExpbmUsXG4gICAgICBocmVmLFxuICAgICAgaSxcbiAgICAgIGwsXG4gICAgICBsYWJlbCxcbiAgICAgIGxhYmVsRW5kLFxuICAgICAgcmVzLFxuICAgICAgc3RhcnQsXG4gICAgICBzdHIsXG4gICAgICB0ZXJtaW5hdGUsXG4gICAgICB0ZXJtaW5hdG9yUnVsZXMsXG4gICAgICB0aXRsZSxcbiAgICAgIGxpbmVzID0gMCxcbiAgICAgIHBvcyA9IHN0YXRlLmJNYXJrc1tzdGFydExpbmVdICsgc3RhdGUudFNoaWZ0W3N0YXJ0TGluZV0sXG4gICAgICBtYXggPSBzdGF0ZS5lTWFya3Nbc3RhcnRMaW5lXSxcbiAgICAgIG5leHRMaW5lID0gc3RhcnRMaW5lICsgMTtcblxuICBpZiAoc3RhdGUuc3JjLmNoYXJDb2RlQXQocG9zKSAhPT0gMHg1Qi8qIFsgKi8pIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgLy8gU2ltcGxlIGNoZWNrIHRvIHF1aWNrbHkgaW50ZXJydXB0IHNjYW4gb24gW2xpbmtdKHVybCkgYXQgdGhlIHN0YXJ0IG9mIGxpbmUuXG4gIC8vIENhbiBiZSB1c2VmdWwgb24gcHJhY3RpY2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJrZG93bi1pdC9tYXJrZG93bi1pdC9pc3N1ZXMvNTRcbiAgd2hpbGUgKCsrcG9zIDwgbWF4KSB7XG4gICAgaWYgKHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcykgPT09IDB4NUQgLyogXSAqLyAmJlxuICAgICAgICBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MgLSAxKSAhPT0gMHg1Qy8qIFxcICovKSB7XG4gICAgICBpZiAocG9zICsgMSA9PT0gbWF4KSB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgaWYgKHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcyArIDEpICE9PSAweDNBLyogOiAqLykgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGVuZExpbmUgPSBzdGF0ZS5saW5lTWF4O1xuXG4gIC8vIGp1bXAgbGluZS1ieS1saW5lIHVudGlsIGVtcHR5IG9uZSBvciBFT0ZcbiAgaWYgKG5leHRMaW5lIDwgZW5kTGluZSAmJiAhc3RhdGUuaXNFbXB0eShuZXh0TGluZSkpIHtcbiAgICB0ZXJtaW5hdG9yUnVsZXMgPSBzdGF0ZS5tZC5ibG9jay5ydWxlci5nZXRSdWxlcygncmVmZXJlbmNlJyk7XG5cbiAgICBmb3IgKDsgbmV4dExpbmUgPCBlbmRMaW5lICYmICFzdGF0ZS5pc0VtcHR5KG5leHRMaW5lKTsgbmV4dExpbmUrKykge1xuICAgICAgLy8gdGhpcyB3b3VsZCBiZSBhIGNvZGUgYmxvY2sgbm9ybWFsbHksIGJ1dCBhZnRlciBwYXJhZ3JhcGhcbiAgICAgIC8vIGl0J3MgY29uc2lkZXJlZCBhIGxhenkgY29udGludWF0aW9uIHJlZ2FyZGxlc3Mgb2Ygd2hhdCdzIHRoZXJlXG4gICAgICBpZiAoc3RhdGUudFNoaWZ0W25leHRMaW5lXSAtIHN0YXRlLmJsa0luZGVudCA+IDMpIHsgY29udGludWU7IH1cblxuICAgICAgLy8gU29tZSB0YWdzIGNhbiB0ZXJtaW5hdGUgcGFyYWdyYXBoIHdpdGhvdXQgZW1wdHkgbGluZS5cbiAgICAgIHRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgICAgZm9yIChpID0gMCwgbCA9IHRlcm1pbmF0b3JSdWxlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKHRlcm1pbmF0b3JSdWxlc1tpXShzdGF0ZSwgbmV4dExpbmUsIGVuZExpbmUsIHRydWUpKSB7XG4gICAgICAgICAgdGVybWluYXRlID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRlcm1pbmF0ZSkgeyBicmVhazsgfVxuICAgIH1cbiAgfVxuXG4gIHN0ciA9IHN0YXRlLmdldExpbmVzKHN0YXJ0TGluZSwgbmV4dExpbmUsIHN0YXRlLmJsa0luZGVudCwgZmFsc2UpLnRyaW0oKTtcbiAgbWF4ID0gc3RyLmxlbmd0aDtcblxuICBmb3IgKHBvcyA9IDE7IHBvcyA8IG1heDsgcG9zKyspIHtcbiAgICBjaCA9IHN0ci5jaGFyQ29kZUF0KHBvcyk7XG4gICAgaWYgKGNoID09PSAweDVCIC8qIFsgKi8pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDVEIC8qIF0gKi8pIHtcbiAgICAgIGxhYmVsRW5kID0gcG9zO1xuICAgICAgYnJlYWs7XG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHgwQSAvKiBcXG4gKi8pIHtcbiAgICAgIGxpbmVzKys7XG4gICAgfSBlbHNlIGlmIChjaCA9PT0gMHg1QyAvKiBcXCAqLykge1xuICAgICAgcG9zKys7XG4gICAgICBpZiAocG9zIDwgbWF4ICYmIHN0ci5jaGFyQ29kZUF0KHBvcykgPT09IDB4MEEpIHtcbiAgICAgICAgbGluZXMrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAobGFiZWxFbmQgPCAwIHx8IHN0ci5jaGFyQ29kZUF0KGxhYmVsRW5kICsgMSkgIT09IDB4M0EvKiA6ICovKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIC8vIFtsYWJlbF06ICAgZGVzdGluYXRpb24gICAndGl0bGUnXG4gIC8vICAgICAgICAgXl5eIHNraXAgb3B0aW9uYWwgd2hpdGVzcGFjZSBoZXJlXG4gIGZvciAocG9zID0gbGFiZWxFbmQgKyAyOyBwb3MgPCBtYXg7IHBvcysrKSB7XG4gICAgY2ggPSBzdHIuY2hhckNvZGVBdChwb3MpO1xuICAgIGlmIChjaCA9PT0gMHgwQSkge1xuICAgICAgbGluZXMrKztcbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDIwKSB7XG4gICAgICAvKmVzbGludCBuby1lbXB0eTowKi9cbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gW2xhYmVsXTogICBkZXN0aW5hdGlvbiAgICd0aXRsZSdcbiAgLy8gICAgICAgICAgICBeXl5eXl5eXl5eXiBwYXJzZSB0aGlzXG4gIHJlcyA9IHBhcnNlTGlua0Rlc3RpbmF0aW9uKHN0ciwgcG9zLCBtYXgpO1xuICBpZiAoIXJlcy5vaykgeyByZXR1cm4gZmFsc2U7IH1cbiAgaWYgKCFzdGF0ZS5tZC5pbmxpbmUudmFsaWRhdGVMaW5rKHJlcy5zdHIpKSB7IHJldHVybiBmYWxzZTsgfVxuICBocmVmID0gcmVzLnN0cjtcbiAgcG9zID0gcmVzLnBvcztcbiAgbGluZXMgKz0gcmVzLmxpbmVzO1xuXG4gIC8vIHNhdmUgY3Vyc29yIHN0YXRlLCB3ZSBjb3VsZCByZXF1aXJlIHRvIHJvbGxiYWNrIGxhdGVyXG4gIGRlc3RFbmRQb3MgPSBwb3M7XG4gIGRlc3RFbmRMaW5lTm8gPSBsaW5lcztcblxuICAvLyBbbGFiZWxdOiAgIGRlc3RpbmF0aW9uICAgJ3RpdGxlJ1xuICAvLyAgICAgICAgICAgICAgICAgICAgICAgXl5eIHNraXBwaW5nIHRob3NlIHNwYWNlc1xuICBzdGFydCA9IHBvcztcbiAgZm9yICg7IHBvcyA8IG1heDsgcG9zKyspIHtcbiAgICBjaCA9IHN0ci5jaGFyQ29kZUF0KHBvcyk7XG4gICAgaWYgKGNoID09PSAweDBBKSB7XG4gICAgICBsaW5lcysrO1xuICAgIH0gZWxzZSBpZiAoY2ggPT09IDB4MjApIHtcbiAgICAgIC8qZXNsaW50IG5vLWVtcHR5OjAqL1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBbbGFiZWxdOiAgIGRlc3RpbmF0aW9uICAgJ3RpdGxlJ1xuICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgXl5eXl5eXiBwYXJzZSB0aGlzXG4gIHJlcyA9IHBhcnNlTGlua1RpdGxlKHN0ciwgcG9zLCBtYXgpO1xuICBpZiAocG9zIDwgbWF4ICYmIHN0YXJ0ICE9PSBwb3MgJiYgcmVzLm9rKSB7XG4gICAgdGl0bGUgPSByZXMuc3RyO1xuICAgIHBvcyA9IHJlcy5wb3M7XG4gICAgbGluZXMgKz0gcmVzLmxpbmVzO1xuICB9IGVsc2Uge1xuICAgIHRpdGxlID0gJyc7XG4gICAgcG9zID0gZGVzdEVuZFBvcztcbiAgICBsaW5lcyA9IGRlc3RFbmRMaW5lTm87XG4gIH1cblxuICAvLyBza2lwIHRyYWlsaW5nIHNwYWNlcyB1bnRpbCB0aGUgcmVzdCBvZiB0aGUgbGluZVxuICB3aGlsZSAocG9zIDwgbWF4ICYmIHN0ci5jaGFyQ29kZUF0KHBvcykgPT09IDB4MjAvKiBzcGFjZSAqLykgeyBwb3MrKzsgfVxuXG4gIGlmIChwb3MgPCBtYXggJiYgc3RyLmNoYXJDb2RlQXQocG9zKSAhPT0gMHgwQSkge1xuICAgIC8vIGdhcmJhZ2UgYXQgdGhlIGVuZCBvZiB0aGUgbGluZVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChzaWxlbnQpIHsgcmV0dXJuIHRydWU7IH1cblxuICBsYWJlbCA9IG5vcm1hbGl6ZVJlZmVyZW5jZShzdHIuc2xpY2UoMSwgbGFiZWxFbmQpKTtcbiAgaWYgKHR5cGVvZiBzdGF0ZS5lbnYucmVmZXJlbmNlcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzdGF0ZS5lbnYucmVmZXJlbmNlcyA9IHt9O1xuICB9XG4gIGlmICh0eXBlb2Ygc3RhdGUuZW52LnJlZmVyZW5jZXNbbGFiZWxdID09PSAndW5kZWZpbmVkJykge1xuICAgIHN0YXRlLmVudi5yZWZlcmVuY2VzW2xhYmVsXSA9IHsgdGl0bGU6IHRpdGxlLCBocmVmOiBocmVmIH07XG4gIH1cblxuICBzdGF0ZS5saW5lID0gc3RhcnRMaW5lICsgbGluZXMgKyAxO1xuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIvLyBQYXJzZXIgc3RhdGUgY2xhc3NcblxuJ3VzZSBzdHJpY3QnO1xuXG5cbmZ1bmN0aW9uIFN0YXRlQmxvY2soc3JjLCBtZCwgZW52LCB0b2tlbnMpIHtcbiAgdmFyIGNoLCBzLCBzdGFydCwgcG9zLCBsZW4sIGluZGVudCwgaW5kZW50X2ZvdW5kO1xuXG4gIHRoaXMuc3JjID0gc3JjO1xuXG4gIC8vIGxpbmsgdG8gcGFyc2VyIGluc3RhbmNlXG4gIHRoaXMubWQgICAgID0gbWQ7XG5cbiAgdGhpcy5lbnYgPSBlbnY7XG5cbiAgLy9cbiAgLy8gSW50ZXJuYWwgc3RhdGUgdmFydGlhYmxlc1xuICAvL1xuXG4gIHRoaXMudG9rZW5zID0gdG9rZW5zO1xuXG4gIHRoaXMuYk1hcmtzID0gW107ICAvLyBsaW5lIGJlZ2luIG9mZnNldHMgZm9yIGZhc3QganVtcHNcbiAgdGhpcy5lTWFya3MgPSBbXTsgIC8vIGxpbmUgZW5kIG9mZnNldHMgZm9yIGZhc3QganVtcHNcbiAgdGhpcy50U2hpZnQgPSBbXTsgIC8vIGluZGVudCBmb3IgZWFjaCBsaW5lXG5cbiAgLy8gYmxvY2sgcGFyc2VyIHZhcmlhYmxlc1xuICB0aGlzLmJsa0luZGVudCAgPSAwOyAvLyByZXF1aXJlZCBibG9jayBjb250ZW50IGluZGVudFxuICAgICAgICAgICAgICAgICAgICAgICAvLyAoZm9yIGV4YW1wbGUsIGlmIHdlIGFyZSBpbiBsaXN0KVxuICB0aGlzLmxpbmUgICAgICAgPSAwOyAvLyBsaW5lIGluZGV4IGluIHNyY1xuICB0aGlzLmxpbmVNYXggICAgPSAwOyAvLyBsaW5lcyBjb3VudFxuICB0aGlzLnRpZ2h0ICAgICAgPSBmYWxzZTsgIC8vIGxvb3NlL3RpZ2h0IG1vZGUgZm9yIGxpc3RzXG4gIHRoaXMucGFyZW50VHlwZSA9ICdyb290JzsgLy8gaWYgYGxpc3RgLCBibG9jayBwYXJzZXIgc3RvcHMgb24gdHdvIG5ld2xpbmVzXG4gIHRoaXMuZGRJbmRlbnQgICA9IC0xOyAvLyBpbmRlbnQgb2YgdGhlIGN1cnJlbnQgZGQgYmxvY2sgKC0xIGlmIHRoZXJlIGlzbid0IGFueSlcblxuICB0aGlzLmxldmVsID0gMDtcblxuICAvLyByZW5kZXJlclxuICB0aGlzLnJlc3VsdCA9ICcnO1xuXG4gIC8vIENyZWF0ZSBjYWNoZXNcbiAgLy8gR2VuZXJhdGUgbWFya2Vycy5cbiAgcyA9IHRoaXMuc3JjO1xuICBpbmRlbnQgPSAwO1xuICBpbmRlbnRfZm91bmQgPSBmYWxzZTtcblxuICBmb3IgKHN0YXJ0ID0gcG9zID0gaW5kZW50ID0gMCwgbGVuID0gcy5sZW5ndGg7IHBvcyA8IGxlbjsgcG9zKyspIHtcbiAgICBjaCA9IHMuY2hhckNvZGVBdChwb3MpO1xuXG4gICAgaWYgKCFpbmRlbnRfZm91bmQpIHtcbiAgICAgIGlmIChjaCA9PT0gMHgyMC8qIHNwYWNlICovKSB7XG4gICAgICAgIGluZGVudCsrO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGVudF9mb3VuZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNoID09PSAweDBBIHx8IHBvcyA9PT0gbGVuIC0gMSkge1xuICAgICAgaWYgKGNoICE9PSAweDBBKSB7IHBvcysrOyB9XG4gICAgICB0aGlzLmJNYXJrcy5wdXNoKHN0YXJ0KTtcbiAgICAgIHRoaXMuZU1hcmtzLnB1c2gocG9zKTtcbiAgICAgIHRoaXMudFNoaWZ0LnB1c2goaW5kZW50KTtcblxuICAgICAgaW5kZW50X2ZvdW5kID0gZmFsc2U7XG4gICAgICBpbmRlbnQgPSAwO1xuICAgICAgc3RhcnQgPSBwb3MgKyAxO1xuICAgIH1cbiAgfVxuXG4gIC8vIFB1c2ggZmFrZSBlbnRyeSB0byBzaW1wbGlmeSBjYWNoZSBib3VuZHMgY2hlY2tzXG4gIHRoaXMuYk1hcmtzLnB1c2gocy5sZW5ndGgpO1xuICB0aGlzLmVNYXJrcy5wdXNoKHMubGVuZ3RoKTtcbiAgdGhpcy50U2hpZnQucHVzaCgwKTtcblxuICB0aGlzLmxpbmVNYXggPSB0aGlzLmJNYXJrcy5sZW5ndGggLSAxOyAvLyBkb24ndCBjb3VudCBsYXN0IGZha2UgbGluZVxufVxuXG5TdGF0ZUJsb2NrLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gaXNFbXB0eShsaW5lKSB7XG4gIHJldHVybiB0aGlzLmJNYXJrc1tsaW5lXSArIHRoaXMudFNoaWZ0W2xpbmVdID49IHRoaXMuZU1hcmtzW2xpbmVdO1xufTtcblxuU3RhdGVCbG9jay5wcm90b3R5cGUuc2tpcEVtcHR5TGluZXMgPSBmdW5jdGlvbiBza2lwRW1wdHlMaW5lcyhmcm9tKSB7XG4gIGZvciAodmFyIG1heCA9IHRoaXMubGluZU1heDsgZnJvbSA8IG1heDsgZnJvbSsrKSB7XG4gICAgaWYgKHRoaXMuYk1hcmtzW2Zyb21dICsgdGhpcy50U2hpZnRbZnJvbV0gPCB0aGlzLmVNYXJrc1tmcm9tXSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBmcm9tO1xufTtcblxuLy8gU2tpcCBzcGFjZXMgZnJvbSBnaXZlbiBwb3NpdGlvbi5cblN0YXRlQmxvY2sucHJvdG90eXBlLnNraXBTcGFjZXMgPSBmdW5jdGlvbiBza2lwU3BhY2VzKHBvcykge1xuICBmb3IgKHZhciBtYXggPSB0aGlzLnNyYy5sZW5ndGg7IHBvcyA8IG1heDsgcG9zKyspIHtcbiAgICBpZiAodGhpcy5zcmMuY2hhckNvZGVBdChwb3MpICE9PSAweDIwLyogc3BhY2UgKi8pIHsgYnJlYWs7IH1cbiAgfVxuICByZXR1cm4gcG9zO1xufTtcblxuLy8gU2tpcCBjaGFyIGNvZGVzIGZyb20gZ2l2ZW4gcG9zaXRpb25cblN0YXRlQmxvY2sucHJvdG90eXBlLnNraXBDaGFycyA9IGZ1bmN0aW9uIHNraXBDaGFycyhwb3MsIGNvZGUpIHtcbiAgZm9yICh2YXIgbWF4ID0gdGhpcy5zcmMubGVuZ3RoOyBwb3MgPCBtYXg7IHBvcysrKSB7XG4gICAgaWYgKHRoaXMuc3JjLmNoYXJDb2RlQXQocG9zKSAhPT0gY29kZSkgeyBicmVhazsgfVxuICB9XG4gIHJldHVybiBwb3M7XG59O1xuXG4vLyBTa2lwIGNoYXIgY29kZXMgcmV2ZXJzZSBmcm9tIGdpdmVuIHBvc2l0aW9uIC0gMVxuU3RhdGVCbG9jay5wcm90b3R5cGUuc2tpcENoYXJzQmFjayA9IGZ1bmN0aW9uIHNraXBDaGFyc0JhY2socG9zLCBjb2RlLCBtaW4pIHtcbiAgaWYgKHBvcyA8PSBtaW4pIHsgcmV0dXJuIHBvczsgfVxuXG4gIHdoaWxlIChwb3MgPiBtaW4pIHtcbiAgICBpZiAoY29kZSAhPT0gdGhpcy5zcmMuY2hhckNvZGVBdCgtLXBvcykpIHsgcmV0dXJuIHBvcyArIDE7IH1cbiAgfVxuICByZXR1cm4gcG9zO1xufTtcblxuLy8gY3V0IGxpbmVzIHJhbmdlIGZyb20gc291cmNlLlxuU3RhdGVCbG9jay5wcm90b3R5cGUuZ2V0TGluZXMgPSBmdW5jdGlvbiBnZXRMaW5lcyhiZWdpbiwgZW5kLCBpbmRlbnQsIGtlZXBMYXN0TEYpIHtcbiAgdmFyIGksIGZpcnN0LCBsYXN0LCBxdWV1ZSwgc2hpZnQsXG4gICAgICBsaW5lID0gYmVnaW47XG5cbiAgaWYgKGJlZ2luID49IGVuZCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIC8vIE9wdDogZG9uJ3QgdXNlIHB1c2ggcXVldWUgZm9yIHNpbmdsZSBsaW5lO1xuICBpZiAobGluZSArIDEgPT09IGVuZCkge1xuICAgIGZpcnN0ID0gdGhpcy5iTWFya3NbbGluZV0gKyBNYXRoLm1pbih0aGlzLnRTaGlmdFtsaW5lXSwgaW5kZW50KTtcbiAgICBsYXN0ID0ga2VlcExhc3RMRiA/IHRoaXMuYk1hcmtzW2VuZF0gOiB0aGlzLmVNYXJrc1tlbmQgLSAxXTtcbiAgICByZXR1cm4gdGhpcy5zcmMuc2xpY2UoZmlyc3QsIGxhc3QpO1xuICB9XG5cbiAgcXVldWUgPSBuZXcgQXJyYXkoZW5kIC0gYmVnaW4pO1xuXG4gIGZvciAoaSA9IDA7IGxpbmUgPCBlbmQ7IGxpbmUrKywgaSsrKSB7XG4gICAgc2hpZnQgPSB0aGlzLnRTaGlmdFtsaW5lXTtcbiAgICBpZiAoc2hpZnQgPiBpbmRlbnQpIHsgc2hpZnQgPSBpbmRlbnQ7IH1cbiAgICBpZiAoc2hpZnQgPCAwKSB7IHNoaWZ0ID0gMDsgfVxuXG4gICAgZmlyc3QgPSB0aGlzLmJNYXJrc1tsaW5lXSArIHNoaWZ0O1xuXG4gICAgaWYgKGxpbmUgKyAxIDwgZW5kIHx8IGtlZXBMYXN0TEYpIHtcbiAgICAgIC8vIE5vIG5lZWQgZm9yIGJvdW5kcyBjaGVjayBiZWNhdXNlIHdlIGhhdmUgZmFrZSBlbnRyeSBvbiB0YWlsLlxuICAgICAgbGFzdCA9IHRoaXMuZU1hcmtzW2xpbmVdICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGFzdCA9IHRoaXMuZU1hcmtzW2xpbmVdO1xuICAgIH1cblxuICAgIHF1ZXVlW2ldID0gdGhpcy5zcmMuc2xpY2UoZmlyc3QsIGxhc3QpO1xuICB9XG5cbiAgcmV0dXJuIHF1ZXVlLmpvaW4oJycpO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXRlQmxvY2s7XG4iLCIvLyBHRk0gdGFibGUsIG5vbi1zdGFuZGFyZFxuXG4ndXNlIHN0cmljdCc7XG5cblxuZnVuY3Rpb24gZ2V0TGluZShzdGF0ZSwgbGluZSkge1xuICB2YXIgcG9zID0gc3RhdGUuYk1hcmtzW2xpbmVdICsgc3RhdGUuYmxrSW5kZW50LFxuICAgICAgbWF4ID0gc3RhdGUuZU1hcmtzW2xpbmVdO1xuXG4gIHJldHVybiBzdGF0ZS5zcmMuc3Vic3RyKHBvcywgbWF4IC0gcG9zKTtcbn1cblxuZnVuY3Rpb24gZXNjYXBlZFNwbGl0KHN0cikge1xuICB2YXIgcmVzdWx0ID0gW10sXG4gICAgICBwb3MgPSAwLFxuICAgICAgbWF4ID0gc3RyLmxlbmd0aCxcbiAgICAgIGNoLFxuICAgICAgZXNjYXBlcyA9IDAsXG4gICAgICBsYXN0UG9zID0gMDtcblxuICBjaCAgPSBzdHIuY2hhckNvZGVBdChwb3MpO1xuXG4gIHdoaWxlIChwb3MgPCBtYXgpIHtcbiAgICBpZiAoY2ggPT09IDB4N2MvKiB8ICovICYmIChlc2NhcGVzICUgMiA9PT0gMCkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKHN0ci5zdWJzdHJpbmcobGFzdFBvcywgcG9zKSk7XG4gICAgICBsYXN0UG9zID0gcG9zICsgMTtcbiAgICB9IGVsc2UgaWYgKGNoID09PSAweDVjLyogXFwgKi8pIHtcbiAgICAgIGVzY2FwZXMrKztcbiAgICB9IGVsc2Uge1xuICAgICAgZXNjYXBlcyA9IDA7XG4gICAgfVxuXG4gICAgY2ggID0gc3RyLmNoYXJDb2RlQXQoKytwb3MpO1xuICB9XG5cbiAgcmVzdWx0LnB1c2goc3RyLnN1YnN0cmluZyhsYXN0UG9zKSk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRhYmxlKHN0YXRlLCBzdGFydExpbmUsIGVuZExpbmUsIHNpbGVudCkge1xuICB2YXIgY2gsIGxpbmVUZXh0LCBwb3MsIGksIG5leHRMaW5lLCByb3dzLFxuICAgICAgYWxpZ25zLCB0LCB0YWJsZUxpbmVzLCB0Ym9keUxpbmVzO1xuXG4gIC8vIHNob3VsZCBoYXZlIGF0IGxlYXN0IHRocmVlIGxpbmVzXG4gIGlmIChzdGFydExpbmUgKyAyID4gZW5kTGluZSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICBuZXh0TGluZSA9IHN0YXJ0TGluZSArIDE7XG5cbiAgaWYgKHN0YXRlLnRTaGlmdFtuZXh0TGluZV0gPCBzdGF0ZS5ibGtJbmRlbnQpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgLy8gZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBzZWNvbmQgbGluZSBzaG91bGQgYmUgJ3wnIG9yICctJ1xuXG4gIHBvcyA9IHN0YXRlLmJNYXJrc1tuZXh0TGluZV0gKyBzdGF0ZS50U2hpZnRbbmV4dExpbmVdO1xuICBpZiAocG9zID49IHN0YXRlLmVNYXJrc1tuZXh0TGluZV0pIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgY2ggPSBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MpO1xuICBpZiAoY2ggIT09IDB4N0MvKiB8ICovICYmIGNoICE9PSAweDJELyogLSAqLyAmJiBjaCAhPT0gMHgzQS8qIDogKi8pIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgbGluZVRleHQgPSBnZXRMaW5lKHN0YXRlLCBzdGFydExpbmUgKyAxKTtcbiAgaWYgKCEvXlstOnwgXSskLy50ZXN0KGxpbmVUZXh0KSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICByb3dzID0gbGluZVRleHQuc3BsaXQoJ3wnKTtcbiAgaWYgKHJvd3MubGVuZ3RoIDwgMikgeyByZXR1cm4gZmFsc2U7IH1cbiAgYWxpZ25zID0gW107XG4gIGZvciAoaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgdCA9IHJvd3NbaV0udHJpbSgpO1xuICAgIGlmICghdCkge1xuICAgICAgLy8gYWxsb3cgZW1wdHkgY29sdW1ucyBiZWZvcmUgYW5kIGFmdGVyIHRhYmxlLCBidXQgbm90IGluIGJldHdlZW4gY29sdW1ucztcbiAgICAgIC8vIGUuZy4gYWxsb3cgYCB8LS0tfCBgLCBkaXNhbGxvdyBgIC0tLXx8LS0tIGBcbiAgICAgIGlmIChpID09PSAwIHx8IGkgPT09IHJvd3MubGVuZ3RoIC0gMSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIS9eOj8tKzo/JC8udGVzdCh0KSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICBpZiAodC5jaGFyQ29kZUF0KHQubGVuZ3RoIC0gMSkgPT09IDB4M0EvKiA6ICovKSB7XG4gICAgICBhbGlnbnMucHVzaCh0LmNoYXJDb2RlQXQoMCkgPT09IDB4M0EvKiA6ICovID8gJ2NlbnRlcicgOiAncmlnaHQnKTtcbiAgICB9IGVsc2UgaWYgKHQuY2hhckNvZGVBdCgwKSA9PT0gMHgzQS8qIDogKi8pIHtcbiAgICAgIGFsaWducy5wdXNoKCdsZWZ0Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFsaWducy5wdXNoKCcnKTtcbiAgICB9XG4gIH1cblxuICBsaW5lVGV4dCA9IGdldExpbmUoc3RhdGUsIHN0YXJ0TGluZSkudHJpbSgpO1xuICBpZiAobGluZVRleHQuaW5kZXhPZignfCcpID09PSAtMSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgcm93cyA9IGVzY2FwZWRTcGxpdChsaW5lVGV4dC5yZXBsYWNlKC9eXFx8fFxcfCQvZywgJycpKTtcbiAgaWYgKGFsaWducy5sZW5ndGggIT09IHJvd3MubGVuZ3RoKSB7IHJldHVybiBmYWxzZTsgfVxuICBpZiAoc2lsZW50KSB7IHJldHVybiB0cnVlOyB9XG5cbiAgc3RhdGUudG9rZW5zLnB1c2goe1xuICAgIHR5cGU6ICd0YWJsZV9vcGVuJyxcbiAgICBsaW5lczogdGFibGVMaW5lcyA9IFsgc3RhcnRMaW5lLCAwIF0sXG4gICAgbGV2ZWw6IHN0YXRlLmxldmVsKytcbiAgfSk7XG4gIHN0YXRlLnRva2Vucy5wdXNoKHtcbiAgICB0eXBlOiAndGhlYWRfb3BlbicsXG4gICAgbGluZXM6IFsgc3RhcnRMaW5lLCBzdGFydExpbmUgKyAxIF0sXG4gICAgbGV2ZWw6IHN0YXRlLmxldmVsKytcbiAgfSk7XG5cbiAgc3RhdGUudG9rZW5zLnB1c2goe1xuICAgIHR5cGU6ICd0cl9vcGVuJyxcbiAgICBsaW5lczogWyBzdGFydExpbmUsIHN0YXJ0TGluZSArIDEgXSxcbiAgICBsZXZlbDogc3RhdGUubGV2ZWwrK1xuICB9KTtcbiAgZm9yIChpID0gMDsgaSA8IHJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICBzdGF0ZS50b2tlbnMucHVzaCh7XG4gICAgICB0eXBlOiAndGhfb3BlbicsXG4gICAgICBhbGlnbjogYWxpZ25zW2ldLFxuICAgICAgbGluZXM6IFsgc3RhcnRMaW5lLCBzdGFydExpbmUgKyAxIF0sXG4gICAgICBsZXZlbDogc3RhdGUubGV2ZWwrK1xuICAgIH0pO1xuICAgIHN0YXRlLnRva2Vucy5wdXNoKHtcbiAgICAgIHR5cGU6ICdpbmxpbmUnLFxuICAgICAgY29udGVudDogcm93c1tpXS50cmltKCksXG4gICAgICBsaW5lczogWyBzdGFydExpbmUsIHN0YXJ0TGluZSArIDEgXSxcbiAgICAgIGxldmVsOiBzdGF0ZS5sZXZlbCxcbiAgICAgIGNoaWxkcmVuOiBbXVxuICAgIH0pO1xuICAgIHN0YXRlLnRva2Vucy5wdXNoKHsgdHlwZTogJ3RoX2Nsb3NlJywgbGV2ZWw6IC0tc3RhdGUubGV2ZWwgfSk7XG4gIH1cbiAgc3RhdGUudG9rZW5zLnB1c2goeyB0eXBlOiAndHJfY2xvc2UnLCBsZXZlbDogLS1zdGF0ZS5sZXZlbCB9KTtcbiAgc3RhdGUudG9rZW5zLnB1c2goeyB0eXBlOiAndGhlYWRfY2xvc2UnLCBsZXZlbDogLS1zdGF0ZS5sZXZlbCB9KTtcblxuICBzdGF0ZS50b2tlbnMucHVzaCh7XG4gICAgdHlwZTogJ3Rib2R5X29wZW4nLFxuICAgIGxpbmVzOiB0Ym9keUxpbmVzID0gWyBzdGFydExpbmUgKyAyLCAwIF0sXG4gICAgbGV2ZWw6IHN0YXRlLmxldmVsKytcbiAgfSk7XG5cbiAgZm9yIChuZXh0TGluZSA9IHN0YXJ0TGluZSArIDI7IG5leHRMaW5lIDwgZW5kTGluZTsgbmV4dExpbmUrKykge1xuICAgIGlmIChzdGF0ZS50U2hpZnRbbmV4dExpbmVdIDwgc3RhdGUuYmxrSW5kZW50KSB7IGJyZWFrOyB9XG5cbiAgICBsaW5lVGV4dCA9IGdldExpbmUoc3RhdGUsIG5leHRMaW5lKS50cmltKCk7XG4gICAgaWYgKGxpbmVUZXh0LmluZGV4T2YoJ3wnKSA9PT0gLTEpIHsgYnJlYWs7IH1cbiAgICByb3dzID0gZXNjYXBlZFNwbGl0KGxpbmVUZXh0LnJlcGxhY2UoL15cXHx8XFx8JC9nLCAnJykpO1xuXG4gICAgLy8gc2V0IG51bWJlciBvZiBjb2x1bW5zIHRvIG51bWJlciBvZiBjb2x1bW5zIGluIGhlYWRlciByb3dcbiAgICByb3dzLmxlbmd0aCA9IGFsaWducy5sZW5ndGg7XG5cbiAgICBzdGF0ZS50b2tlbnMucHVzaCh7IHR5cGU6ICd0cl9vcGVuJywgbGV2ZWw6IHN0YXRlLmxldmVsKysgfSk7XG4gICAgZm9yIChpID0gMDsgaSA8IHJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHN0YXRlLnRva2Vucy5wdXNoKHsgdHlwZTogJ3RkX29wZW4nLCBhbGlnbjogYWxpZ25zW2ldLCBsZXZlbDogc3RhdGUubGV2ZWwrKyB9KTtcbiAgICAgIHN0YXRlLnRva2Vucy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2lubGluZScsXG4gICAgICAgIGNvbnRlbnQ6IHJvd3NbaV0gPyByb3dzW2ldLnRyaW0oKSA6ICcnLFxuICAgICAgICBsZXZlbDogc3RhdGUubGV2ZWwsXG4gICAgICAgIGNoaWxkcmVuOiBbXVxuICAgICAgfSk7XG4gICAgICBzdGF0ZS50b2tlbnMucHVzaCh7IHR5cGU6ICd0ZF9jbG9zZScsIGxldmVsOiAtLXN0YXRlLmxldmVsIH0pO1xuICAgIH1cbiAgICBzdGF0ZS50b2tlbnMucHVzaCh7IHR5cGU6ICd0cl9jbG9zZScsIGxldmVsOiAtLXN0YXRlLmxldmVsIH0pO1xuICB9XG4gIHN0YXRlLnRva2Vucy5wdXNoKHsgdHlwZTogJ3Rib2R5X2Nsb3NlJywgbGV2ZWw6IC0tc3RhdGUubGV2ZWwgfSk7XG4gIHN0YXRlLnRva2Vucy5wdXNoKHsgdHlwZTogJ3RhYmxlX2Nsb3NlJywgbGV2ZWw6IC0tc3RhdGUubGV2ZWwgfSk7XG5cbiAgdGFibGVMaW5lc1sxXSA9IHRib2R5TGluZXNbMV0gPSBuZXh0TGluZTtcbiAgc3RhdGUubGluZSA9IG5leHRMaW5lO1xuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmxvY2soc3RhdGUpIHtcblxuICBpZiAoc3RhdGUuaW5saW5lTW9kZSkge1xuICAgIHN0YXRlLnRva2Vucy5wdXNoKHtcbiAgICAgIHR5cGU6ICdpbmxpbmUnLFxuICAgICAgY29udGVudDogc3RhdGUuc3JjLFxuICAgICAgbGV2ZWw6IDAsXG4gICAgICBsaW5lczogWyAwLCAxIF0sXG4gICAgICBjaGlsZHJlbjogW11cbiAgICB9KTtcblxuICB9IGVsc2Uge1xuICAgIHN0YXRlLm1kLmJsb2NrLnBhcnNlKHN0YXRlLnNyYywgc3RhdGUubWQsIHN0YXRlLmVudiwgc3RhdGUudG9rZW5zKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmxpbmUoc3RhdGUpIHtcbiAgdmFyIHRva2VucyA9IHN0YXRlLnRva2VucywgdG9rLCBpLCBsO1xuXG4gIC8vIFBhcnNlIGlubGluZXNcbiAgZm9yIChpID0gMCwgbCA9IHRva2Vucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICB0b2sgPSB0b2tlbnNbaV07XG4gICAgaWYgKHRvay50eXBlID09PSAnaW5saW5lJykge1xuICAgICAgc3RhdGUubWQuaW5saW5lLnBhcnNlKHRvay5jb250ZW50LCBzdGF0ZS5tZCwgc3RhdGUuZW52LCB0b2suY2hpbGRyZW4pO1xuICAgIH1cbiAgfVxufTtcbiIsIi8vIFJlcGxhY2UgbGluay1saWtlIHRleHRzIHdpdGggbGluayBub2Rlcy5cbi8vXG4vLyBDdXJyZW50bHkgcmVzdHJpY3RlZCBieSBgaW5saW5lLnZhbGlkYXRlTGluaygpYCB0byBodHRwL2h0dHBzL2Z0cFxuLy9cbid1c2Ugc3RyaWN0JztcblxuXG52YXIgQXV0b2xpbmtlciAgICAgPSByZXF1aXJlKCdhdXRvbGlua2VyJyk7XG52YXIgYXJyYXlSZXBsYWNlQXQgPSByZXF1aXJlKCcuLi9jb21tb24vdXRpbHMnKS5hcnJheVJlcGxhY2VBdDtcblxuXG52YXIgTElOS19TQ0FOX1JFID0gL3d3d3xAfFxcOlxcL1xcLy87XG5cblxuZnVuY3Rpb24gaXNMaW5rT3BlbihzdHIpIHtcbiAgcmV0dXJuIC9ePGFbPlxcc10vaS50ZXN0KHN0cik7XG59XG5mdW5jdGlvbiBpc0xpbmtDbG9zZShzdHIpIHtcbiAgcmV0dXJuIC9ePFxcL2FcXHMqPi9pLnRlc3Qoc3RyKTtcbn1cblxuLy8gU3R1cGlkIGZhYnJpYyB0byBhdm9pZCBzaW5nbGV0b25zLCBmb3IgdGhyZWFkIHNhZmV0eS5cbi8vIFJlcXVpcmVkIGZvciBlbmdpbmVzIGxpa2UgTmFzaG9ybi5cbi8vXG5mdW5jdGlvbiBjcmVhdGVMaW5raWZpZXIoKSB7XG4gIHZhciBsaW5rcyA9IFtdO1xuICB2YXIgYXV0b2xpbmtlciA9IG5ldyBBdXRvbGlua2VyKHtcbiAgICBzdHJpcFByZWZpeDogZmFsc2UsXG4gICAgdXJsOiB0cnVlLFxuICAgIGVtYWlsOiB0cnVlLFxuICAgIHR3aXR0ZXI6IGZhbHNlLFxuICAgIHJlcGxhY2VGbjogZnVuY3Rpb24gKF9fLCBtYXRjaCkge1xuICAgICAgLy8gT25seSBjb2xsZWN0IG1hdGNoZWQgc3RyaW5ncyBidXQgZG9uJ3QgY2hhbmdlIGFueXRoaW5nLlxuICAgICAgc3dpdGNoIChtYXRjaC5nZXRUeXBlKCkpIHtcbiAgICAgICAgLyplc2xpbnQgZGVmYXVsdC1jYXNlOjAqL1xuICAgICAgICBjYXNlICd1cmwnOlxuICAgICAgICAgIGxpbmtzLnB1c2goe1xuICAgICAgICAgICAgdGV4dDogbWF0Y2gubWF0Y2hlZFRleHQsXG4gICAgICAgICAgICB1cmw6IG1hdGNoLmdldFVybCgpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2VtYWlsJzpcbiAgICAgICAgICBsaW5rcy5wdXNoKHtcbiAgICAgICAgICAgIHRleHQ6IG1hdGNoLm1hdGNoZWRUZXh0LFxuICAgICAgICAgICAgLy8gbm9ybWFsaXplIGVtYWlsIHByb3RvY29sXG4gICAgICAgICAgICB1cmw6ICdtYWlsdG86JyArIG1hdGNoLmdldEVtYWlsKCkucmVwbGFjZSgvXm1haWx0bzovaSwgJycpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGxpbmtzOiBsaW5rcyxcbiAgICBhdXRvbGlua2VyOiBhdXRvbGlua2VyXG4gIH07XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBsaW5raWZ5KHN0YXRlKSB7XG4gIHZhciBpLCBqLCBsLCB0b2tlbnMsIHRva2VuLCB0ZXh0LCBub2RlcywgbG4sIHBvcywgbGV2ZWwsIGh0bWxMaW5rTGV2ZWwsXG4gICAgICBibG9ja1Rva2VucyA9IHN0YXRlLnRva2VucyxcbiAgICAgIGxpbmtpZmllciA9IG51bGwsIGxpbmtzLCBhdXRvbGlua2VyO1xuXG4gIGlmICghc3RhdGUubWQub3B0aW9ucy5saW5raWZ5KSB7IHJldHVybjsgfVxuXG4gIGZvciAoaiA9IDAsIGwgPSBibG9ja1Rva2Vucy5sZW5ndGg7IGogPCBsOyBqKyspIHtcbiAgICBpZiAoYmxvY2tUb2tlbnNbal0udHlwZSAhPT0gJ2lubGluZScpIHsgY29udGludWU7IH1cbiAgICB0b2tlbnMgPSBibG9ja1Rva2Vuc1tqXS5jaGlsZHJlbjtcblxuICAgIGh0bWxMaW5rTGV2ZWwgPSAwO1xuXG4gICAgLy8gV2Ugc2NhbiBmcm9tIHRoZSBlbmQsIHRvIGtlZXAgcG9zaXRpb24gd2hlbiBuZXcgdGFncyBhZGRlZC5cbiAgICAvLyBVc2UgcmV2ZXJzZWQgbG9naWMgaW4gbGlua3Mgc3RhcnQvZW5kIG1hdGNoXG4gICAgZm9yIChpID0gdG9rZW5zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcblxuICAgICAgLy8gU2tpcCBjb250ZW50IG9mIG1hcmtkb3duIGxpbmtzXG4gICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2xpbmtfY2xvc2UnKSB7XG4gICAgICAgIGktLTtcbiAgICAgICAgd2hpbGUgKHRva2Vuc1tpXS5sZXZlbCAhPT0gdG9rZW4ubGV2ZWwgJiYgdG9rZW5zW2ldLnR5cGUgIT09ICdsaW5rX29wZW4nKSB7XG4gICAgICAgICAgaS0tO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBTa2lwIGNvbnRlbnQgb2YgaHRtbCB0YWcgbGlua3NcbiAgICAgIGlmICh0b2tlbi50eXBlID09PSAnaHRtbF9pbmxpbmUnKSB7XG4gICAgICAgIGlmIChpc0xpbmtPcGVuKHRva2VuLmNvbnRlbnQpICYmIGh0bWxMaW5rTGV2ZWwgPiAwKSB7XG4gICAgICAgICAgaHRtbExpbmtMZXZlbC0tO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0xpbmtDbG9zZSh0b2tlbi5jb250ZW50KSkge1xuICAgICAgICAgIGh0bWxMaW5rTGV2ZWwrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGh0bWxMaW5rTGV2ZWwgPiAwKSB7IGNvbnRpbnVlOyB9XG5cbiAgICAgIGlmICh0b2tlbi50eXBlID09PSAndGV4dCcgJiYgTElOS19TQ0FOX1JFLnRlc3QodG9rZW4uY29udGVudCkpIHtcblxuICAgICAgICAvLyBJbml0IGxpbmtpZmllciBpbiBsYXp5IG1hbm5lciwgb25seSBpZiByZXF1aXJlZC5cbiAgICAgICAgaWYgKCFsaW5raWZpZXIpIHtcbiAgICAgICAgICBsaW5raWZpZXIgPSBjcmVhdGVMaW5raWZpZXIoKTtcbiAgICAgICAgICBsaW5rcyA9IGxpbmtpZmllci5saW5rcztcbiAgICAgICAgICBhdXRvbGlua2VyID0gbGlua2lmaWVyLmF1dG9saW5rZXI7XG4gICAgICAgIH1cblxuICAgICAgICB0ZXh0ID0gdG9rZW4uY29udGVudDtcbiAgICAgICAgbGlua3MubGVuZ3RoID0gMDtcbiAgICAgICAgYXV0b2xpbmtlci5saW5rKHRleHQpO1xuXG4gICAgICAgIGlmICghbGlua3MubGVuZ3RoKSB7IGNvbnRpbnVlOyB9XG5cbiAgICAgICAgLy8gTm93IHNwbGl0IHN0cmluZyB0byBub2Rlc1xuICAgICAgICBub2RlcyA9IFtdO1xuICAgICAgICBsZXZlbCA9IHRva2VuLmxldmVsO1xuXG4gICAgICAgIGZvciAobG4gPSAwOyBsbiA8IGxpbmtzLmxlbmd0aDsgbG4rKykge1xuXG4gICAgICAgICAgaWYgKCFzdGF0ZS5tZC5pbmxpbmUudmFsaWRhdGVMaW5rKGxpbmtzW2xuXS51cmwpKSB7IGNvbnRpbnVlOyB9XG5cbiAgICAgICAgICBwb3MgPSB0ZXh0LmluZGV4T2YobGlua3NbbG5dLnRleHQpO1xuXG4gICAgICAgICAgaWYgKHBvcykge1xuICAgICAgICAgICAgbGV2ZWwgPSBsZXZlbDtcbiAgICAgICAgICAgIG5vZGVzLnB1c2goe1xuICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgICAgIGNvbnRlbnQ6IHRleHQuc2xpY2UoMCwgcG9zKSxcbiAgICAgICAgICAgICAgbGV2ZWw6IGxldmVsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbm9kZXMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAnbGlua19vcGVuJyxcbiAgICAgICAgICAgIGhyZWY6IGxpbmtzW2xuXS51cmwsXG4gICAgICAgICAgICB0YXJnZXQ6ICcnLFxuICAgICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsKytcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBub2Rlcy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgIGNvbnRlbnQ6IGxpbmtzW2xuXS50ZXh0LFxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbm9kZXMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAnbGlua19jbG9zZScsXG4gICAgICAgICAgICBsZXZlbDogLS1sZXZlbFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRleHQgPSB0ZXh0LnNsaWNlKHBvcyArIGxpbmtzW2xuXS50ZXh0Lmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRleHQubGVuZ3RoKSB7XG4gICAgICAgICAgbm9kZXMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgICBjb250ZW50OiB0ZXh0LFxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZXBsYWNlIGN1cnJlbnQgbm9kZVxuICAgICAgICBibG9ja1Rva2Vuc1tqXS5jaGlsZHJlbiA9IHRva2VucyA9IGFycmF5UmVwbGFjZUF0KHRva2VucywgaSwgbm9kZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcbiIsIi8vIE5vcm1hbGl6ZSBpbnB1dCBzdHJpbmdcblxuJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBUQUJTX1NDQU5fUkUgPSAvW1xcblxcdF0vZztcbnZhciBORVdMSU5FU19SRSAgPSAvXFxyW1xcblxcdTAwODVdfFtcXHUyNDI0XFx1MjAyOFxcdTAwODVdL2c7XG52YXIgTlVMTF9SRSAgICAgID0gL1xcdTAwMDAvZztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlubGluZShzdGF0ZSkge1xuICB2YXIgc3RyLCBsaW5lU3RhcnQsIGxhc3RUYWJQb3M7XG5cbiAgLy8gTm9ybWFsaXplIG5ld2xpbmVzXG4gIHN0ciA9IHN0YXRlLnNyYy5yZXBsYWNlKE5FV0xJTkVTX1JFLCAnXFxuJyk7XG5cbiAgLy8gUmVwbGFjZSBOVUxMIGNoYXJhY3RlcnNcbiAgc3RyID0gc3RyLnJlcGxhY2UoTlVMTF9SRSwgJ1xcdUZGRkQnKTtcblxuICAvLyBSZXBsYWNlIHRhYnMgd2l0aCBwcm9wZXIgbnVtYmVyIG9mIHNwYWNlcyAoMS4uNClcbiAgaWYgKHN0ci5pbmRleE9mKCdcXHQnKSA+PSAwKSB7XG4gICAgbGluZVN0YXJ0ID0gMDtcbiAgICBsYXN0VGFiUG9zID0gMDtcblxuICAgIHN0ciA9IHN0ci5yZXBsYWNlKFRBQlNfU0NBTl9SRSwgZnVuY3Rpb24gKG1hdGNoLCBvZmZzZXQpIHtcbiAgICAgIHZhciByZXN1bHQ7XG4gICAgICBpZiAoc3RyLmNoYXJDb2RlQXQob2Zmc2V0KSA9PT0gMHgwQSkge1xuICAgICAgICBsaW5lU3RhcnQgPSBvZmZzZXQgKyAxO1xuICAgICAgICBsYXN0VGFiUG9zID0gMDtcbiAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgfVxuICAgICAgcmVzdWx0ID0gJyAgICAnLnNsaWNlKChvZmZzZXQgLSBsaW5lU3RhcnQgLSBsYXN0VGFiUG9zKSAlIDQpO1xuICAgICAgbGFzdFRhYlBvcyA9IG9mZnNldCAtIGxpbmVTdGFydCArIDE7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGUuc3JjID0gc3RyO1xufTtcbiIsIi8vIFNpbXBsZSB0eXBvZ3JhcGh5YyByZXBsYWNlbWVudHNcbi8vXG4vLyAnJyDihpIg4oCY4oCZXG4vLyBcIlwiIOKGkiDigJzigJ0uIFNldCAnwqvCuycgZm9yIFJ1c3NpYW4sICfigJ7igJwnIGZvciBHZXJtYW4sIGVtcHR5IHRvIGRpc2FibGVcbi8vIChjKSAoQykg4oaSIMKpXG4vLyAodG0pIChUTSkg4oaSIOKEolxuLy8gKHIpIChSKSDihpIgwq5cbi8vICstIOKGkiDCsVxuLy8gKHApIChQKSAtPiDCp1xuLy8gLi4uIOKGkiDigKYgKGFsc28gPy4uLi4g4oaSID8uLiwgIS4uLi4g4oaSICEuLilcbi8vID8/Pz8/Pz8/IOKGkiA/Pz8sICEhISEhIOKGkiAhISEsIGAsLGAg4oaSIGAsYFxuLy8gLS0g4oaSICZuZGFzaDssIC0tLSDihpIgJm1kYXNoO1xuLy9cbid1c2Ugc3RyaWN0JztcblxuLy8gVE9ETzpcbi8vIC0gZnJhY3Rpb25hbHMgMS8yLCAxLzQsIDMvNCAtPiDCvSwgwrwsIMK+XG4vLyAtIG1pbHRpcGxpY2F0aW9uIDIgeCA0IC0+IDIgw5cgNFxuXG52YXIgUkFSRV9SRSA9IC9cXCstfFxcLlxcLnxcXD9cXD9cXD9cXD98ISEhIXwsLHwtLS87XG5cbnZhciBTQ09QRURfQUJCUl9SRSA9IC9cXCgoY3x0bXxyfHApXFwpL2lnO1xudmFyIFNDT1BFRF9BQkJSID0ge1xuICAnYyc6ICfCqScsXG4gICdyJzogJ8KuJyxcbiAgJ3AnOiAnwqcnLFxuICAndG0nOiAn4oSiJ1xufTtcblxuZnVuY3Rpb24gcmVwbGFjZVNjb3BlZEFiYnIoc3RyKSB7XG4gIGlmIChzdHIuaW5kZXhPZignKCcpIDwgMCkgeyByZXR1cm4gc3RyOyB9XG5cbiAgcmV0dXJuIHN0ci5yZXBsYWNlKFNDT1BFRF9BQkJSX1JFLCBmdW5jdGlvbihtYXRjaCwgbmFtZSkge1xuICAgIHJldHVybiBTQ09QRURfQUJCUltuYW1lLnRvTG93ZXJDYXNlKCldO1xuICB9KTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJlcGxhY2Uoc3RhdGUpIHtcbiAgdmFyIGksIHRva2VuLCB0ZXh0LCBpbmxpbmVUb2tlbnMsIGJsa0lkeDtcblxuICBpZiAoIXN0YXRlLm1kLm9wdGlvbnMudHlwb2dyYXBoZXIpIHsgcmV0dXJuOyB9XG5cbiAgZm9yIChibGtJZHggPSBzdGF0ZS50b2tlbnMubGVuZ3RoIC0gMTsgYmxrSWR4ID49IDA7IGJsa0lkeC0tKSB7XG5cbiAgICBpZiAoc3RhdGUudG9rZW5zW2Jsa0lkeF0udHlwZSAhPT0gJ2lubGluZScpIHsgY29udGludWU7IH1cblxuICAgIGlubGluZVRva2VucyA9IHN0YXRlLnRva2Vuc1tibGtJZHhdLmNoaWxkcmVuO1xuXG4gICAgZm9yIChpID0gaW5saW5lVG9rZW5zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB0b2tlbiA9IGlubGluZVRva2Vuc1tpXTtcbiAgICAgIGlmICh0b2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgdGV4dCA9IHRva2VuLmNvbnRlbnQ7XG5cbiAgICAgICAgdGV4dCA9IHJlcGxhY2VTY29wZWRBYmJyKHRleHQpO1xuXG4gICAgICAgIGlmIChSQVJFX1JFLnRlc3QodGV4dCkpIHtcbiAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9cXCstL2csICfCsScpXG4gICAgICAgICAgICAgICAgICAgICAgLy8gLi4sIC4uLiwgLi4uLi4uLiAtPiDigKZcbiAgICAgICAgICAgICAgICAgICAgICAvLyBidXQgPy4uLi4uICYgIS4uLi4uIC0+ID8uLiAmICEuLlxuICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXC57Mix9L2csICfigKYnKS5yZXBsYWNlKC8oWz8hXSnigKYvZywgJyQxLi4nKVxuICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oWz8hXSl7NCx9L2csICckMSQxJDEnKS5yZXBsYWNlKC8sezIsfS9nLCAnLCcpXG4gICAgICAgICAgICAgICAgICAgICAgLy8gZW0tZGFzaFxuICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXnxbXi1dKS0tLShbXi1dfCQpL21nLCAnJDFcXHUyMDE0JDInKVxuICAgICAgICAgICAgICAgICAgICAgIC8vIGVuLWRhc2hcbiAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF58XFxzKS0tKFxcc3wkKS9tZywgJyQxXFx1MjAxMyQyJylcbiAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF58W14tXFxzXSktLShbXi1cXHNdfCQpL21nLCAnJDFcXHUyMDEzJDInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRva2VuLmNvbnRlbnQgPSB0ZXh0O1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcbiIsIi8vIENvbnZlcnQgc3RyYWlnaHQgcXVvdGF0aW9uIG1hcmtzIHRvIHR5cG9ncmFwaGljIG9uZXNcbi8vXG4ndXNlIHN0cmljdCc7XG5cblxudmFyIFFVT1RFX1RFU1RfUkUgPSAvWydcIl0vO1xudmFyIFFVT1RFX1JFID0gL1snXCJdL2c7XG52YXIgUFVOQ1RfUkUgPSAvWy1cXHMoKVxcW1xcXV0vO1xudmFyIEFQT1NUUk9QSEUgPSAnXFx1MjAxOSc7IC8qIOKAmSAqL1xuXG4vLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSBpZiB0aGUgY2hhcmFjdGVyIGF0IGBwb3NgXG4vLyBjb3VsZCBiZSBpbnNpZGUgYSB3b3JkLlxuZnVuY3Rpb24gaXNMZXR0ZXIoc3RyLCBwb3MpIHtcbiAgaWYgKHBvcyA8IDAgfHwgcG9zID49IHN0ci5sZW5ndGgpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIHJldHVybiAhUFVOQ1RfUkUudGVzdChzdHJbcG9zXSk7XG59XG5cblxuZnVuY3Rpb24gcmVwbGFjZUF0KHN0ciwgaW5kZXgsIGNoKSB7XG4gIHJldHVybiBzdHIuc3Vic3RyKDAsIGluZGV4KSArIGNoICsgc3RyLnN1YnN0cihpbmRleCArIDEpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc21hcnRxdW90ZXMoc3RhdGUpIHtcbiAgLyplc2xpbnQgbWF4LWRlcHRoOjAqL1xuICB2YXIgaSwgdG9rZW4sIHRleHQsIHQsIHBvcywgbWF4LCB0aGlzTGV2ZWwsIGxhc3RTcGFjZSwgbmV4dFNwYWNlLCBpdGVtLFxuICAgICAgY2FuT3BlbiwgY2FuQ2xvc2UsIGosIGlzU2luZ2xlLCBibGtJZHgsIHRva2VucyxcbiAgICAgIHN0YWNrO1xuXG4gIGlmICghc3RhdGUubWQub3B0aW9ucy50eXBvZ3JhcGhlcikgeyByZXR1cm47IH1cblxuICBzdGFjayA9IFtdO1xuXG4gIGZvciAoYmxrSWR4ID0gc3RhdGUudG9rZW5zLmxlbmd0aCAtIDE7IGJsa0lkeCA+PSAwOyBibGtJZHgtLSkge1xuXG4gICAgaWYgKHN0YXRlLnRva2Vuc1tibGtJZHhdLnR5cGUgIT09ICdpbmxpbmUnKSB7IGNvbnRpbnVlOyB9XG5cbiAgICB0b2tlbnMgPSBzdGF0ZS50b2tlbnNbYmxrSWR4XS5jaGlsZHJlbjtcbiAgICBzdGFjay5sZW5ndGggPSAwO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG5cbiAgICAgIGlmICh0b2tlbi50eXBlICE9PSAndGV4dCcgfHwgUVVPVEVfVEVTVF9SRS50ZXN0KHRva2VuLnRleHQpKSB7IGNvbnRpbnVlOyB9XG5cbiAgICAgIHRoaXNMZXZlbCA9IHRva2Vuc1tpXS5sZXZlbDtcblxuICAgICAgZm9yIChqID0gc3RhY2subGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pIHtcbiAgICAgICAgaWYgKHN0YWNrW2pdLmxldmVsIDw9IHRoaXNMZXZlbCkgeyBicmVhazsgfVxuICAgICAgfVxuICAgICAgc3RhY2subGVuZ3RoID0gaiArIDE7XG5cbiAgICAgIHRleHQgPSB0b2tlbi5jb250ZW50O1xuICAgICAgcG9zID0gMDtcbiAgICAgIG1heCA9IHRleHQubGVuZ3RoO1xuXG4gICAgICAvKmVzbGludCBuby1sYWJlbHM6MCxibG9jay1zY29wZWQtdmFyOjAqL1xuICAgICAgT1VURVI6XG4gICAgICB3aGlsZSAocG9zIDwgbWF4KSB7XG4gICAgICAgIFFVT1RFX1JFLmxhc3RJbmRleCA9IHBvcztcbiAgICAgICAgdCA9IFFVT1RFX1JFLmV4ZWModGV4dCk7XG4gICAgICAgIGlmICghdCkgeyBicmVhazsgfVxuXG4gICAgICAgIGxhc3RTcGFjZSA9ICFpc0xldHRlcih0ZXh0LCB0LmluZGV4IC0gMSk7XG4gICAgICAgIHBvcyA9IHQuaW5kZXggKyAxO1xuICAgICAgICBpc1NpbmdsZSA9ICh0WzBdID09PSBcIidcIik7XG4gICAgICAgIG5leHRTcGFjZSA9ICFpc0xldHRlcih0ZXh0LCBwb3MpO1xuXG4gICAgICAgIGlmICghbmV4dFNwYWNlICYmICFsYXN0U3BhY2UpIHtcbiAgICAgICAgICAvLyBtaWRkbGUgb2Ygd29yZFxuICAgICAgICAgIGlmIChpc1NpbmdsZSkge1xuICAgICAgICAgICAgdG9rZW4uY29udGVudCA9IHJlcGxhY2VBdCh0b2tlbi5jb250ZW50LCB0LmluZGV4LCBBUE9TVFJPUEhFKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjYW5PcGVuID0gIW5leHRTcGFjZTtcbiAgICAgICAgY2FuQ2xvc2UgPSAhbGFzdFNwYWNlO1xuXG4gICAgICAgIGlmIChjYW5DbG9zZSkge1xuICAgICAgICAgIC8vIHRoaXMgY291bGQgYmUgYSBjbG9zaW5nIHF1b3RlLCByZXdpbmQgdGhlIHN0YWNrIHRvIGdldCBhIG1hdGNoXG4gICAgICAgICAgZm9yIChqID0gc3RhY2subGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pIHtcbiAgICAgICAgICAgIGl0ZW0gPSBzdGFja1tqXTtcbiAgICAgICAgICAgIGlmIChzdGFja1tqXS5sZXZlbCA8IHRoaXNMZXZlbCkgeyBicmVhazsgfVxuICAgICAgICAgICAgaWYgKGl0ZW0uc2luZ2xlID09PSBpc1NpbmdsZSAmJiBzdGFja1tqXS5sZXZlbCA9PT0gdGhpc0xldmVsKSB7XG4gICAgICAgICAgICAgIGl0ZW0gPSBzdGFja1tqXTtcbiAgICAgICAgICAgICAgaWYgKGlzU2luZ2xlKSB7XG4gICAgICAgICAgICAgICAgdG9rZW5zW2l0ZW0udG9rZW5dLmNvbnRlbnQgPSByZXBsYWNlQXQoXG4gICAgICAgICAgICAgICAgICB0b2tlbnNbaXRlbS50b2tlbl0uY29udGVudCwgaXRlbS5wb3MsIHN0YXRlLm1kLm9wdGlvbnMucXVvdGVzWzJdKTtcbiAgICAgICAgICAgICAgICB0b2tlbi5jb250ZW50ID0gcmVwbGFjZUF0KFxuICAgICAgICAgICAgICAgICAgdG9rZW4uY29udGVudCwgdC5pbmRleCwgc3RhdGUubWQub3B0aW9ucy5xdW90ZXNbM10pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRva2Vuc1tpdGVtLnRva2VuXS5jb250ZW50ID0gcmVwbGFjZUF0KFxuICAgICAgICAgICAgICAgICAgdG9rZW5zW2l0ZW0udG9rZW5dLmNvbnRlbnQsIGl0ZW0ucG9zLCBzdGF0ZS5tZC5vcHRpb25zLnF1b3Rlc1swXSk7XG4gICAgICAgICAgICAgICAgdG9rZW4uY29udGVudCA9IHJlcGxhY2VBdCh0b2tlbi5jb250ZW50LCB0LmluZGV4LCBzdGF0ZS5tZC5vcHRpb25zLnF1b3Rlc1sxXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc3RhY2subGVuZ3RoID0gajtcbiAgICAgICAgICAgICAgY29udGludWUgT1VURVI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNhbk9wZW4pIHtcbiAgICAgICAgICBzdGFjay5wdXNoKHtcbiAgICAgICAgICAgIHRva2VuOiBpLFxuICAgICAgICAgICAgcG9zOiB0LmluZGV4LFxuICAgICAgICAgICAgc2luZ2xlOiBpc1NpbmdsZSxcbiAgICAgICAgICAgIGxldmVsOiB0aGlzTGV2ZWxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChjYW5DbG9zZSAmJiBpc1NpbmdsZSkge1xuICAgICAgICAgIHRva2VuLmNvbnRlbnQgPSByZXBsYWNlQXQodG9rZW4uY29udGVudCwgdC5pbmRleCwgQVBPU1RST1BIRSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG4iLCIvLyBDb3JlIHN0YXRlIG9iamVjdFxuLy9cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBTdGF0ZUNvcmUoc3JjLCBtZCwgZW52KSB7XG4gIHRoaXMuc3JjID0gc3JjO1xuICB0aGlzLmVudiA9IGVudjtcbiAgdGhpcy50b2tlbnMgPSBbXTtcbiAgdGhpcy5pbmxpbmVNb2RlID0gZmFsc2U7XG4gIHRoaXMubWQgPSBtZDsgLy8gbGluayB0byBwYXJzZXIgaW5zdGFuY2Vcbn07XG4iLCIvLyBQcm9jZXNzIGF1dG9saW5rcyAnPHByb3RvY29sOi4uLj4nXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHVybF9zY2hlbWFzICAgPSByZXF1aXJlKCcuLi9jb21tb24vdXJsX3NjaGVtYXMnKTtcbnZhciBub3JtYWxpemVMaW5rID0gcmVxdWlyZSgnLi4vY29tbW9uL3V0aWxzJykubm9ybWFsaXplTGluaztcblxuXG4vKmVzbGludCBtYXgtbGVuOjAqL1xudmFyIEVNQUlMX1JFICAgID0gL148KFthLXpBLVowLTkuISMkJSYnKitcXC89P15fYHt8fX4tXStAW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XFwuW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KSopPi87XG52YXIgQVVUT0xJTktfUkUgPSAvXjwoW2EtekEtWi5cXC1dezEsMjV9KTooW148PlxceDAwLVxceDIwXSopPi87XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhdXRvbGluayhzdGF0ZSwgc2lsZW50KSB7XG4gIHZhciB0YWlsLCBsaW5rTWF0Y2gsIGVtYWlsTWF0Y2gsIHVybCwgZnVsbFVybCwgcG9zID0gc3RhdGUucG9zO1xuXG4gIGlmIChzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MpICE9PSAweDNDLyogPCAqLykgeyByZXR1cm4gZmFsc2U7IH1cblxuICB0YWlsID0gc3RhdGUuc3JjLnNsaWNlKHBvcyk7XG5cbiAgaWYgKHRhaWwuaW5kZXhPZignPicpIDwgMCkgeyByZXR1cm4gZmFsc2U7IH1cblxuICBsaW5rTWF0Y2ggPSB0YWlsLm1hdGNoKEFVVE9MSU5LX1JFKTtcblxuICBpZiAobGlua01hdGNoKSB7XG4gICAgaWYgKHVybF9zY2hlbWFzLmluZGV4T2YobGlua01hdGNoWzFdLnRvTG93ZXJDYXNlKCkpIDwgMCkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIHVybCA9IGxpbmtNYXRjaFswXS5zbGljZSgxLCAtMSk7XG4gICAgZnVsbFVybCA9IG5vcm1hbGl6ZUxpbmsodXJsKTtcbiAgICBpZiAoIXN0YXRlLm1kLmlubGluZS52YWxpZGF0ZUxpbmsodXJsKSkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIGlmICghc2lsZW50KSB7XG4gICAgICBzdGF0ZS5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2xpbmtfb3BlbicsXG4gICAgICAgIGhyZWY6IGZ1bGxVcmwsXG4gICAgICAgIHRhcmdldDogJycsXG4gICAgICAgIGxldmVsOiBzdGF0ZS5sZXZlbFxuICAgICAgfSk7XG4gICAgICBzdGF0ZS5wdXNoKHtcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICBjb250ZW50OiB1cmwsXG4gICAgICAgIGxldmVsOiBzdGF0ZS5sZXZlbCArIDFcbiAgICAgIH0pO1xuICAgICAgc3RhdGUucHVzaCh7IHR5cGU6ICdsaW5rX2Nsb3NlJywgbGV2ZWw6IHN0YXRlLmxldmVsIH0pO1xuICAgIH1cblxuICAgIHN0YXRlLnBvcyArPSBsaW5rTWF0Y2hbMF0ubGVuZ3RoO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZW1haWxNYXRjaCA9IHRhaWwubWF0Y2goRU1BSUxfUkUpO1xuXG4gIGlmIChlbWFpbE1hdGNoKSB7XG5cbiAgICB1cmwgPSBlbWFpbE1hdGNoWzBdLnNsaWNlKDEsIC0xKTtcblxuICAgIGZ1bGxVcmwgPSBub3JtYWxpemVMaW5rKCdtYWlsdG86JyArIHVybCk7XG4gICAgaWYgKCFzdGF0ZS5tZC5pbmxpbmUudmFsaWRhdGVMaW5rKGZ1bGxVcmwpKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgaWYgKCFzaWxlbnQpIHtcbiAgICAgIHN0YXRlLnB1c2goe1xuICAgICAgICB0eXBlOiAnbGlua19vcGVuJyxcbiAgICAgICAgaHJlZjogZnVsbFVybCxcbiAgICAgICAgdGFyZ2V0OiAnJyxcbiAgICAgICAgbGV2ZWw6IHN0YXRlLmxldmVsXG4gICAgICB9KTtcbiAgICAgIHN0YXRlLnB1c2goe1xuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIGNvbnRlbnQ6IHVybCxcbiAgICAgICAgbGV2ZWw6IHN0YXRlLmxldmVsICsgMVxuICAgICAgfSk7XG4gICAgICBzdGF0ZS5wdXNoKHsgdHlwZTogJ2xpbmtfY2xvc2UnLCBsZXZlbDogc3RhdGUubGV2ZWwgfSk7XG4gICAgfVxuXG4gICAgc3RhdGUucG9zICs9IGVtYWlsTWF0Y2hbMF0ubGVuZ3RoO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcbiIsIi8vIFBhcnNlIGJhY2t0aWNrc1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmFja3RpY2soc3RhdGUsIHNpbGVudCkge1xuICB2YXIgc3RhcnQsIG1heCwgbWFya2VyLCBtYXRjaFN0YXJ0LCBtYXRjaEVuZCxcbiAgICAgIHBvcyA9IHN0YXRlLnBvcyxcbiAgICAgIGNoID0gc3RhdGUuc3JjLmNoYXJDb2RlQXQocG9zKTtcblxuICBpZiAoY2ggIT09IDB4NjAvKiBgICovKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIHN0YXJ0ID0gcG9zO1xuICBwb3MrKztcbiAgbWF4ID0gc3RhdGUucG9zTWF4O1xuXG4gIHdoaWxlIChwb3MgPCBtYXggJiYgc3RhdGUuc3JjLmNoYXJDb2RlQXQocG9zKSA9PT0gMHg2MC8qIGAgKi8pIHsgcG9zKys7IH1cblxuICBtYXJrZXIgPSBzdGF0ZS5zcmMuc2xpY2Uoc3RhcnQsIHBvcyk7XG5cbiAgbWF0Y2hTdGFydCA9IG1hdGNoRW5kID0gcG9zO1xuXG4gIHdoaWxlICgobWF0Y2hTdGFydCA9IHN0YXRlLnNyYy5pbmRleE9mKCdgJywgbWF0Y2hFbmQpKSAhPT0gLTEpIHtcbiAgICBtYXRjaEVuZCA9IG1hdGNoU3RhcnQgKyAxO1xuXG4gICAgd2hpbGUgKG1hdGNoRW5kIDwgbWF4ICYmIHN0YXRlLnNyYy5jaGFyQ29kZUF0KG1hdGNoRW5kKSA9PT0gMHg2MC8qIGAgKi8pIHsgbWF0Y2hFbmQrKzsgfVxuXG4gICAgaWYgKG1hdGNoRW5kIC0gbWF0Y2hTdGFydCA9PT0gbWFya2VyLmxlbmd0aCkge1xuICAgICAgaWYgKCFzaWxlbnQpIHtcbiAgICAgICAgc3RhdGUucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ2NvZGVfaW5saW5lJyxcbiAgICAgICAgICBjb250ZW50OiBzdGF0ZS5zcmMuc2xpY2UocG9zLCBtYXRjaFN0YXJ0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1sgXFxuXSsvZywgJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRyaW0oKSxcbiAgICAgICAgICBsZXZlbDogc3RhdGUubGV2ZWxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBzdGF0ZS5wb3MgPSBtYXRjaEVuZDtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmICghc2lsZW50KSB7IHN0YXRlLnBlbmRpbmcgKz0gbWFya2VyOyB9XG4gIHN0YXRlLnBvcyArPSBtYXJrZXIubGVuZ3RoO1xuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIvLyBQcm9jZXNzICp0aGlzKiBhbmQgX3RoYXRfXG4vL1xuJ3VzZSBzdHJpY3QnO1xuXG5cbnZhciBpc1doaXRlU3BhY2UgICA9IHJlcXVpcmUoJy4uL2NvbW1vbi91dGlscycpLmlzV2hpdGVTcGFjZTtcbnZhciBpc1B1bmN0Q2hhciAgICA9IHJlcXVpcmUoJy4uL2NvbW1vbi91dGlscycpLmlzUHVuY3RDaGFyO1xudmFyIGlzTWRBc2NpaVB1bmN0ID0gcmVxdWlyZSgnLi4vY29tbW9uL3V0aWxzJykuaXNNZEFzY2lpUHVuY3Q7XG5cblxuZnVuY3Rpb24gaXNBbHBoYU51bShjb2RlKSB7XG4gIHJldHVybiAoY29kZSA+PSAweDMwIC8qIDAgKi8gJiYgY29kZSA8PSAweDM5IC8qIDkgKi8pIHx8XG4gICAgICAgICAoY29kZSA+PSAweDQxIC8qIEEgKi8gJiYgY29kZSA8PSAweDVBIC8qIFogKi8pIHx8XG4gICAgICAgICAoY29kZSA+PSAweDYxIC8qIGEgKi8gJiYgY29kZSA8PSAweDdBIC8qIHogKi8pO1xufVxuXG4vLyBwYXJzZSBzZXF1ZW5jZSBvZiBlbXBoYXNpcyBtYXJrZXJzLFxuLy8gXCJzdGFydFwiIHNob3VsZCBwb2ludCBhdCBhIHZhbGlkIG1hcmtlclxuZnVuY3Rpb24gc2NhbkRlbGltcyhzdGF0ZSwgc3RhcnQpIHtcbiAgdmFyIHBvcyA9IHN0YXJ0LCBsYXN0Q2hhciwgbmV4dENoYXIsIGNvdW50LFxuICAgICAgaXNMYXN0V2hpdGVTcGFjZSwgaXNMYXN0UHVuY3RDaGFyLFxuICAgICAgaXNOZXh0V2hpdGVTcGFjZSwgaXNOZXh0UHVuY3RDaGFyLFxuICAgICAgY2FuX29wZW4gPSB0cnVlLFxuICAgICAgY2FuX2Nsb3NlID0gdHJ1ZSxcbiAgICAgIG1heCA9IHN0YXRlLnBvc01heCxcbiAgICAgIG1hcmtlciA9IHN0YXRlLnNyYy5jaGFyQ29kZUF0KHN0YXJ0KTtcblxuICBsYXN0Q2hhciA9IHN0YXJ0ID4gMCA/IHN0YXRlLnNyYy5jaGFyQ29kZUF0KHN0YXJ0IC0gMSkgOiAtMTtcblxuICB3aGlsZSAocG9zIDwgbWF4ICYmIHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcykgPT09IG1hcmtlcikgeyBwb3MrKzsgfVxuICBpZiAocG9zID49IG1heCkgeyBjYW5fb3BlbiA9IGZhbHNlOyB9XG4gIGNvdW50ID0gcG9zIC0gc3RhcnQ7XG5cbiAgbmV4dENoYXIgPSBwb3MgPCBtYXggPyBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MpIDogLTE7XG5cbiAgaXNMYXN0UHVuY3RDaGFyID0gbGFzdENoYXIgPj0gMCAmJlxuICAgIChpc01kQXNjaWlQdW5jdChsYXN0Q2hhcikgfHwgaXNQdW5jdENoYXIoU3RyaW5nLmZyb21DaGFyQ29kZShsYXN0Q2hhcikpKTtcbiAgaXNOZXh0UHVuY3RDaGFyID0gbmV4dENoYXIgPj0gMCAmJlxuICAgIChpc01kQXNjaWlQdW5jdChuZXh0Q2hhcikgfHwgaXNQdW5jdENoYXIoU3RyaW5nLmZyb21DaGFyQ29kZShuZXh0Q2hhcikpKTtcbiAgaXNMYXN0V2hpdGVTcGFjZSA9IGxhc3RDaGFyID49IDAgJiYgaXNXaGl0ZVNwYWNlKGxhc3RDaGFyKTtcbiAgaXNOZXh0V2hpdGVTcGFjZSA9IG5leHRDaGFyID49IDAgJiYgaXNXaGl0ZVNwYWNlKG5leHRDaGFyKTtcblxuICBpZiAoaXNOZXh0V2hpdGVTcGFjZSkge1xuICAgIGNhbl9vcGVuID0gZmFsc2U7XG4gIH0gZWxzZSBpZiAoaXNOZXh0UHVuY3RDaGFyKSB7XG4gICAgaWYgKCEoaXNMYXN0V2hpdGVTcGFjZSB8fCBpc0xhc3RQdW5jdENoYXIgfHwgbGFzdENoYXIgPT09IC0xKSkge1xuICAgICAgY2FuX29wZW4gPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBpZiAoaXNMYXN0V2hpdGVTcGFjZSkge1xuICAgIGNhbl9jbG9zZSA9IGZhbHNlO1xuICB9IGVsc2UgaWYgKGlzTGFzdFB1bmN0Q2hhcikge1xuICAgIGlmICghKGlzTmV4dFdoaXRlU3BhY2UgfHwgaXNOZXh0UHVuY3RDaGFyIHx8IG5leHRDaGFyID09PSAtMSkpIHtcbiAgICAgIGNhbl9jbG9zZSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGlmIChtYXJrZXIgPT09IDB4NUYgLyogXyAqLykge1xuICAgIC8vIGNoZWNrIGlmIHdlIGFyZW4ndCBpbnNpZGUgdGhlIHdvcmRcbiAgICBpZiAoaXNBbHBoYU51bShsYXN0Q2hhcikpIHsgY2FuX29wZW4gPSBmYWxzZTsgfVxuICAgIGlmIChpc0FscGhhTnVtKG5leHRDaGFyKSkgeyBjYW5fY2xvc2UgPSBmYWxzZTsgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjYW5fb3BlbjogY2FuX29wZW4sXG4gICAgY2FuX2Nsb3NlOiBjYW5fY2xvc2UsXG4gICAgZGVsaW1zOiBjb3VudFxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVtcGhhc2lzKHN0YXRlLCBzaWxlbnQpIHtcbiAgdmFyIHN0YXJ0Q291bnQsXG4gICAgICBjb3VudCxcbiAgICAgIGZvdW5kLFxuICAgICAgb2xkQ291bnQsXG4gICAgICBuZXdDb3VudCxcbiAgICAgIHN0YWNrLFxuICAgICAgcmVzLFxuICAgICAgbWF4ID0gc3RhdGUucG9zTWF4LFxuICAgICAgc3RhcnQgPSBzdGF0ZS5wb3MsXG4gICAgICBtYXJrZXIgPSBzdGF0ZS5zcmMuY2hhckNvZGVBdChzdGFydCk7XG5cbiAgaWYgKG1hcmtlciAhPT0gMHg1Ri8qIF8gKi8gJiYgbWFya2VyICE9PSAweDJBIC8qICogKi8pIHsgcmV0dXJuIGZhbHNlOyB9XG4gIGlmIChzaWxlbnQpIHsgcmV0dXJuIGZhbHNlOyB9IC8vIGRvbid0IHJ1biBhbnkgcGFpcnMgaW4gdmFsaWRhdGlvbiBtb2RlXG5cbiAgcmVzID0gc2NhbkRlbGltcyhzdGF0ZSwgc3RhcnQpO1xuICBzdGFydENvdW50ID0gcmVzLmRlbGltcztcbiAgaWYgKCFyZXMuY2FuX29wZW4pIHtcbiAgICBzdGF0ZS5wb3MgKz0gc3RhcnRDb3VudDtcbiAgICAvLyBFYXJsaWVyIHdlIGNoZWNrZWQgIXNpbGVudCwgYnV0IHRoaXMgaW1wbGVtZW50YXRpb24gZG9lcyBub3QgbmVlZCBpdFxuICAgIHN0YXRlLnBlbmRpbmcgKz0gc3RhdGUuc3JjLnNsaWNlKHN0YXJ0LCBzdGF0ZS5wb3MpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgc3RhdGUucG9zID0gc3RhcnQgKyBzdGFydENvdW50O1xuICBzdGFjayA9IFsgc3RhcnRDb3VudCBdO1xuXG4gIHdoaWxlIChzdGF0ZS5wb3MgPCBtYXgpIHtcbiAgICBpZiAoc3RhdGUuc3JjLmNoYXJDb2RlQXQoc3RhdGUucG9zKSA9PT0gbWFya2VyKSB7XG4gICAgICByZXMgPSBzY2FuRGVsaW1zKHN0YXRlLCBzdGF0ZS5wb3MpO1xuICAgICAgY291bnQgPSByZXMuZGVsaW1zO1xuICAgICAgaWYgKHJlcy5jYW5fY2xvc2UpIHtcbiAgICAgICAgb2xkQ291bnQgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgbmV3Q291bnQgPSBjb3VudDtcblxuICAgICAgICB3aGlsZSAob2xkQ291bnQgIT09IG5ld0NvdW50KSB7XG4gICAgICAgICAgaWYgKG5ld0NvdW50IDwgb2xkQ291bnQpIHtcbiAgICAgICAgICAgIHN0YWNrLnB1c2gob2xkQ291bnQgLSBuZXdDb3VudCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBhc3NlcnQobmV3Q291bnQgPiBvbGRDb3VudClcbiAgICAgICAgICBuZXdDb3VudCAtPSBvbGRDb3VudDtcblxuICAgICAgICAgIGlmIChzdGFjay5sZW5ndGggPT09IDApIHsgYnJlYWs7IH1cbiAgICAgICAgICBzdGF0ZS5wb3MgKz0gb2xkQ291bnQ7XG4gICAgICAgICAgb2xkQ291bnQgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdGFjay5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBzdGFydENvdW50ID0gb2xkQ291bnQ7XG4gICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRlLnBvcyArPSBjb3VudDtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXMuY2FuX29wZW4pIHsgc3RhY2sucHVzaChjb3VudCk7IH1cbiAgICAgIHN0YXRlLnBvcyArPSBjb3VudDtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHN0YXRlLm1kLmlubGluZS5za2lwVG9rZW4oc3RhdGUpO1xuICB9XG5cbiAgaWYgKCFmb3VuZCkge1xuICAgIC8vIHBhcnNlciBmYWlsZWQgdG8gZmluZCBlbmRpbmcgdGFnLCBzbyBpdCdzIG5vdCB2YWxpZCBlbXBoYXNpc1xuICAgIHN0YXRlLnBvcyA9IHN0YXJ0O1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGZvdW5kIVxuICBzdGF0ZS5wb3NNYXggPSBzdGF0ZS5wb3M7XG4gIHN0YXRlLnBvcyA9IHN0YXJ0ICsgc3RhcnRDb3VudDtcblxuICAvLyBFYXJsaWVyIHdlIGNoZWNrZWQgIXNpbGVudCwgYnV0IHRoaXMgaW1wbGVtZW50YXRpb24gZG9lcyBub3QgbmVlZCBpdFxuXG4gIC8vIHdlIGhhdmUgYHN0YXJ0Q291bnRgIHN0YXJ0aW5nIGFuZCBlbmRpbmcgbWFya2VycyxcbiAgLy8gbm93IHRyeWluZyB0byBzZXJpYWxpemUgdGhlbSBpbnRvIHRva2Vuc1xuICBmb3IgKGNvdW50ID0gc3RhcnRDb3VudDsgY291bnQgPiAxOyBjb3VudCAtPSAyKSB7XG4gICAgc3RhdGUucHVzaCh7IHR5cGU6ICdzdHJvbmdfb3BlbicsIGxldmVsOiBzdGF0ZS5sZXZlbCsrIH0pO1xuICB9XG4gIGlmIChjb3VudCAlIDIpIHsgc3RhdGUucHVzaCh7IHR5cGU6ICdlbV9vcGVuJywgbGV2ZWw6IHN0YXRlLmxldmVsKysgfSk7IH1cblxuICBzdGF0ZS5tZC5pbmxpbmUudG9rZW5pemUoc3RhdGUpO1xuXG4gIGlmIChjb3VudCAlIDIpIHsgc3RhdGUucHVzaCh7IHR5cGU6ICdlbV9jbG9zZScsIGxldmVsOiAtLXN0YXRlLmxldmVsIH0pOyB9XG4gIGZvciAoY291bnQgPSBzdGFydENvdW50OyBjb3VudCA+IDE7IGNvdW50IC09IDIpIHtcbiAgICBzdGF0ZS5wdXNoKHsgdHlwZTogJ3N0cm9uZ19jbG9zZScsIGxldmVsOiAtLXN0YXRlLmxldmVsIH0pO1xuICB9XG5cbiAgc3RhdGUucG9zID0gc3RhdGUucG9zTWF4ICsgc3RhcnRDb3VudDtcbiAgc3RhdGUucG9zTWF4ID0gbWF4O1xuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIvLyBQcm9jZXNzIGh0bWwgZW50aXR5IC0gJiMxMjM7LCAmI3hBRjssICZxdW90OywgLi4uXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGVudGl0aWVzICAgICAgICAgID0gcmVxdWlyZSgnLi4vY29tbW9uL2VudGl0aWVzJyk7XG52YXIgaGFzICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLi9jb21tb24vdXRpbHMnKS5oYXM7XG52YXIgaXNWYWxpZEVudGl0eUNvZGUgPSByZXF1aXJlKCcuLi9jb21tb24vdXRpbHMnKS5pc1ZhbGlkRW50aXR5Q29kZTtcbnZhciBmcm9tQ29kZVBvaW50ICAgICA9IHJlcXVpcmUoJy4uL2NvbW1vbi91dGlscycpLmZyb21Db2RlUG9pbnQ7XG5cblxudmFyIERJR0lUQUxfUkUgPSAvXiYjKCg/OnhbYS1mMC05XXsxLDh9fFswLTldezEsOH0pKTsvaTtcbnZhciBOQU1FRF9SRSAgID0gL14mKFthLXpdW2EtejAtOV17MSwzMX0pOy9pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW50aXR5KHN0YXRlLCBzaWxlbnQpIHtcbiAgdmFyIGNoLCBjb2RlLCBtYXRjaCwgcG9zID0gc3RhdGUucG9zLCBtYXggPSBzdGF0ZS5wb3NNYXg7XG5cbiAgaWYgKHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcykgIT09IDB4MjYvKiAmICovKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIGlmIChwb3MgKyAxIDwgbWF4KSB7XG4gICAgY2ggPSBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MgKyAxKTtcblxuICAgIGlmIChjaCA9PT0gMHgyMyAvKiAjICovKSB7XG4gICAgICBtYXRjaCA9IHN0YXRlLnNyYy5zbGljZShwb3MpLm1hdGNoKERJR0lUQUxfUkUpO1xuICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIGlmICghc2lsZW50KSB7XG4gICAgICAgICAgY29kZSA9IG1hdGNoWzFdWzBdLnRvTG93ZXJDYXNlKCkgPT09ICd4JyA/IHBhcnNlSW50KG1hdGNoWzFdLnNsaWNlKDEpLCAxNikgOiBwYXJzZUludChtYXRjaFsxXSwgMTApO1xuICAgICAgICAgIHN0YXRlLnBlbmRpbmcgKz0gaXNWYWxpZEVudGl0eUNvZGUoY29kZSkgPyBmcm9tQ29kZVBvaW50KGNvZGUpIDogZnJvbUNvZGVQb2ludCgweEZGRkQpO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRlLnBvcyArPSBtYXRjaFswXS5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtYXRjaCA9IHN0YXRlLnNyYy5zbGljZShwb3MpLm1hdGNoKE5BTUVEX1JFKTtcbiAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICBpZiAoaGFzKGVudGl0aWVzLCBtYXRjaFsxXSkpIHtcbiAgICAgICAgICBpZiAoIXNpbGVudCkgeyBzdGF0ZS5wZW5kaW5nICs9IGVudGl0aWVzW21hdGNoWzFdXTsgfVxuICAgICAgICAgIHN0YXRlLnBvcyArPSBtYXRjaFswXS5sZW5ndGg7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoIXNpbGVudCkgeyBzdGF0ZS5wZW5kaW5nICs9ICcmJzsgfVxuICBzdGF0ZS5wb3MrKztcbiAgcmV0dXJuIHRydWU7XG59O1xuIiwiLy8gUHJvY2Vlc3MgZXNjYXBlZCBjaGFycyBhbmQgaGFyZGJyZWFrc1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBFU0NBUEVEID0gW107XG5cbmZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyBpKyspIHsgRVNDQVBFRC5wdXNoKDApOyB9XG5cbidcXFxcIVwiIyQlJlxcJygpKissLi86Ozw9Pj9AW11eX2B7fH1+LSdcbiAgLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uKGNoKSB7IEVTQ0FQRURbY2guY2hhckNvZGVBdCgwKV0gPSAxOyB9KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVzY2FwZShzdGF0ZSwgc2lsZW50KSB7XG4gIHZhciBjaCwgcG9zID0gc3RhdGUucG9zLCBtYXggPSBzdGF0ZS5wb3NNYXg7XG5cbiAgaWYgKHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcykgIT09IDB4NUMvKiBcXCAqLykgeyByZXR1cm4gZmFsc2U7IH1cblxuICBwb3MrKztcblxuICBpZiAocG9zIDwgbWF4KSB7XG4gICAgY2ggPSBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MpO1xuXG4gICAgaWYgKGNoIDwgMjU2ICYmIEVTQ0FQRURbY2hdICE9PSAwKSB7XG4gICAgICBpZiAoIXNpbGVudCkgeyBzdGF0ZS5wZW5kaW5nICs9IHN0YXRlLnNyY1twb3NdOyB9XG4gICAgICBzdGF0ZS5wb3MgKz0gMjtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChjaCA9PT0gMHgwQSkge1xuICAgICAgaWYgKCFzaWxlbnQpIHtcbiAgICAgICAgc3RhdGUucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ2hhcmRicmVhaycsXG4gICAgICAgICAgbGV2ZWw6IHN0YXRlLmxldmVsXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBwb3MrKztcbiAgICAgIC8vIHNraXAgbGVhZGluZyB3aGl0ZXNwYWNlcyBmcm9tIG5leHQgbGluZVxuICAgICAgd2hpbGUgKHBvcyA8IG1heCAmJiBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MpID09PSAweDIwKSB7IHBvcysrOyB9XG5cbiAgICAgIHN0YXRlLnBvcyA9IHBvcztcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGlmICghc2lsZW50KSB7IHN0YXRlLnBlbmRpbmcgKz0gJ1xcXFwnOyB9XG4gIHN0YXRlLnBvcysrO1xuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIvLyBQcm9jZXNzIGh0bWwgdGFnc1xuXG4ndXNlIHN0cmljdCc7XG5cblxudmFyIEhUTUxfVEFHX1JFID0gcmVxdWlyZSgnLi4vY29tbW9uL2h0bWxfcmUnKS5IVE1MX1RBR19SRTtcblxuXG5mdW5jdGlvbiBpc0xldHRlcihjaCkge1xuICAvKmVzbGludCBuby1iaXR3aXNlOjAqL1xuICB2YXIgbGMgPSBjaCB8IDB4MjA7IC8vIHRvIGxvd2VyIGNhc2VcbiAgcmV0dXJuIChsYyA+PSAweDYxLyogYSAqLykgJiYgKGxjIDw9IDB4N2EvKiB6ICovKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGh0bWxfaW5saW5lKHN0YXRlLCBzaWxlbnQpIHtcbiAgdmFyIGNoLCBtYXRjaCwgbWF4LCBwb3MgPSBzdGF0ZS5wb3M7XG5cbiAgaWYgKCFzdGF0ZS5tZC5vcHRpb25zLmh0bWwpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgLy8gQ2hlY2sgc3RhcnRcbiAgbWF4ID0gc3RhdGUucG9zTWF4O1xuICBpZiAoc3RhdGUuc3JjLmNoYXJDb2RlQXQocG9zKSAhPT0gMHgzQy8qIDwgKi8gfHxcbiAgICAgIHBvcyArIDIgPj0gbWF4KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gUXVpY2sgZmFpbCBvbiBzZWNvbmQgY2hhclxuICBjaCA9IHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcyArIDEpO1xuICBpZiAoY2ggIT09IDB4MjEvKiAhICovICYmXG4gICAgICBjaCAhPT0gMHgzRi8qID8gKi8gJiZcbiAgICAgIGNoICE9PSAweDJGLyogLyAqLyAmJlxuICAgICAgIWlzTGV0dGVyKGNoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG1hdGNoID0gc3RhdGUuc3JjLnNsaWNlKHBvcykubWF0Y2goSFRNTF9UQUdfUkUpO1xuICBpZiAoIW1hdGNoKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIGlmICghc2lsZW50KSB7XG4gICAgc3RhdGUucHVzaCh7XG4gICAgICB0eXBlOiAnaHRtbF9pbmxpbmUnLFxuICAgICAgY29udGVudDogc3RhdGUuc3JjLnNsaWNlKHBvcywgcG9zICsgbWF0Y2hbMF0ubGVuZ3RoKSxcbiAgICAgIGxldmVsOiBzdGF0ZS5sZXZlbFxuICAgIH0pO1xuICB9XG4gIHN0YXRlLnBvcyArPSBtYXRjaFswXS5sZW5ndGg7XG4gIHJldHVybiB0cnVlO1xufTtcbiIsIi8vIFByb2Nlc3MgIVtpbWFnZV0oPHNyYz4gXCJ0aXRsZVwiKVxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBwYXJzZUxpbmtMYWJlbCAgICAgICA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcGFyc2VfbGlua19sYWJlbCcpO1xudmFyIHBhcnNlTGlua0Rlc3RpbmF0aW9uID0gcmVxdWlyZSgnLi4vaGVscGVycy9wYXJzZV9saW5rX2Rlc3RpbmF0aW9uJyk7XG52YXIgcGFyc2VMaW5rVGl0bGUgICAgICAgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3BhcnNlX2xpbmtfdGl0bGUnKTtcbnZhciBub3JtYWxpemVSZWZlcmVuY2UgICA9IHJlcXVpcmUoJy4uL2NvbW1vbi91dGlscycpLm5vcm1hbGl6ZVJlZmVyZW5jZTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGltYWdlKHN0YXRlLCBzaWxlbnQpIHtcbiAgdmFyIGNvZGUsXG4gICAgICBocmVmLFxuICAgICAgbGFiZWwsXG4gICAgICBsYWJlbEVuZCxcbiAgICAgIGxhYmVsU3RhcnQsXG4gICAgICBwb3MsXG4gICAgICByZWYsXG4gICAgICByZXMsXG4gICAgICB0aXRsZSxcbiAgICAgIHRva2VucyxcbiAgICAgIHN0YXJ0LFxuICAgICAgb2xkUG9zID0gc3RhdGUucG9zLFxuICAgICAgbWF4ID0gc3RhdGUucG9zTWF4O1xuXG4gIGlmIChzdGF0ZS5zcmMuY2hhckNvZGVBdChzdGF0ZS5wb3MpICE9PSAweDIxLyogISAqLykgeyByZXR1cm4gZmFsc2U7IH1cbiAgaWYgKHN0YXRlLnNyYy5jaGFyQ29kZUF0KHN0YXRlLnBvcyArIDEpICE9PSAweDVCLyogWyAqLykgeyByZXR1cm4gZmFsc2U7IH1cblxuICBsYWJlbFN0YXJ0ID0gc3RhdGUucG9zICsgMjtcbiAgbGFiZWxFbmQgPSBwYXJzZUxpbmtMYWJlbChzdGF0ZSwgc3RhdGUucG9zICsgMSwgZmFsc2UpO1xuXG4gIC8vIHBhcnNlciBmYWlsZWQgdG8gZmluZCAnXScsIHNvIGl0J3Mgbm90IGEgdmFsaWQgbGlua1xuICBpZiAobGFiZWxFbmQgPCAwKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIHBvcyA9IGxhYmVsRW5kICsgMTtcbiAgaWYgKHBvcyA8IG1heCAmJiBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MpID09PSAweDI4LyogKCAqLykge1xuICAgIC8vXG4gICAgLy8gSW5saW5lIGxpbmtcbiAgICAvL1xuXG4gICAgLy8gW2xpbmtdKCAgPGhyZWY+ICBcInRpdGxlXCIgIClcbiAgICAvLyAgICAgICAgXl4gc2tpcHBpbmcgdGhlc2Ugc3BhY2VzXG4gICAgcG9zKys7XG4gICAgZm9yICg7IHBvcyA8IG1heDsgcG9zKyspIHtcbiAgICAgIGNvZGUgPSBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MpO1xuICAgICAgaWYgKGNvZGUgIT09IDB4MjAgJiYgY29kZSAhPT0gMHgwQSkgeyBicmVhazsgfVxuICAgIH1cbiAgICBpZiAocG9zID49IG1heCkgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIC8vIFtsaW5rXSggIDxocmVmPiAgXCJ0aXRsZVwiICApXG4gICAgLy8gICAgICAgICAgXl5eXl5eIHBhcnNpbmcgbGluayBkZXN0aW5hdGlvblxuICAgIHN0YXJ0ID0gcG9zO1xuICAgIHJlcyA9IHBhcnNlTGlua0Rlc3RpbmF0aW9uKHN0YXRlLnNyYywgcG9zLCBzdGF0ZS5wb3NNYXgpO1xuICAgIGlmIChyZXMub2sgJiYgc3RhdGUubWQuaW5saW5lLnZhbGlkYXRlTGluayhyZXMuc3RyKSkge1xuICAgICAgaHJlZiA9IHJlcy5zdHI7XG4gICAgICBwb3MgPSByZXMucG9zO1xuICAgIH0gZWxzZSB7XG4gICAgICBocmVmID0gJyc7XG4gICAgfVxuXG4gICAgLy8gW2xpbmtdKCAgPGhyZWY+ICBcInRpdGxlXCIgIClcbiAgICAvLyAgICAgICAgICAgICAgICBeXiBza2lwcGluZyB0aGVzZSBzcGFjZXNcbiAgICBzdGFydCA9IHBvcztcbiAgICBmb3IgKDsgcG9zIDwgbWF4OyBwb3MrKykge1xuICAgICAgY29kZSA9IHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcyk7XG4gICAgICBpZiAoY29kZSAhPT0gMHgyMCAmJiBjb2RlICE9PSAweDBBKSB7IGJyZWFrOyB9XG4gICAgfVxuXG4gICAgLy8gW2xpbmtdKCAgPGhyZWY+ICBcInRpdGxlXCIgIClcbiAgICAvLyAgICAgICAgICAgICAgICAgIF5eXl5eXl4gcGFyc2luZyBsaW5rIHRpdGxlXG4gICAgcmVzID0gcGFyc2VMaW5rVGl0bGUoc3RhdGUuc3JjLCBwb3MsIHN0YXRlLnBvc01heCk7XG4gICAgaWYgKHBvcyA8IG1heCAmJiBzdGFydCAhPT0gcG9zICYmIHJlcy5vaykge1xuICAgICAgdGl0bGUgPSByZXMuc3RyO1xuICAgICAgcG9zID0gcmVzLnBvcztcblxuICAgICAgLy8gW2xpbmtdKCAgPGhyZWY+ICBcInRpdGxlXCIgIClcbiAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIF5eIHNraXBwaW5nIHRoZXNlIHNwYWNlc1xuICAgICAgZm9yICg7IHBvcyA8IG1heDsgcG9zKyspIHtcbiAgICAgICAgY29kZSA9IHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcyk7XG4gICAgICAgIGlmIChjb2RlICE9PSAweDIwICYmIGNvZGUgIT09IDB4MEEpIHsgYnJlYWs7IH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGl0bGUgPSAnJztcbiAgICB9XG5cbiAgICBpZiAocG9zID49IG1heCB8fCBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MpICE9PSAweDI5LyogKSAqLykge1xuICAgICAgc3RhdGUucG9zID0gb2xkUG9zO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBwb3MrKztcbiAgfSBlbHNlIHtcbiAgICAvL1xuICAgIC8vIExpbmsgcmVmZXJlbmNlXG4gICAgLy9cbiAgICBpZiAodHlwZW9mIHN0YXRlLmVudi5yZWZlcmVuY2VzID09PSAndW5kZWZpbmVkJykgeyByZXR1cm4gZmFsc2U7IH1cblxuICAgIC8vIFtmb29dICBbYmFyXVxuICAgIC8vICAgICAgXl4gb3B0aW9uYWwgd2hpdGVzcGFjZSAoY2FuIGluY2x1ZGUgbmV3bGluZXMpXG4gICAgZm9yICg7IHBvcyA8IG1heDsgcG9zKyspIHtcbiAgICAgIGNvZGUgPSBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MpO1xuICAgICAgaWYgKGNvZGUgIT09IDB4MjAgJiYgY29kZSAhPT0gMHgwQSkgeyBicmVhazsgfVxuICAgIH1cblxuICAgIGlmIChwb3MgPCBtYXggJiYgc3RhdGUuc3JjLmNoYXJDb2RlQXQocG9zKSA9PT0gMHg1Qi8qIFsgKi8pIHtcbiAgICAgIHN0YXJ0ID0gcG9zICsgMTtcbiAgICAgIHBvcyA9IHBhcnNlTGlua0xhYmVsKHN0YXRlLCBwb3MpO1xuICAgICAgaWYgKHBvcyA+PSAwKSB7XG4gICAgICAgIGxhYmVsID0gc3RhdGUuc3JjLnNsaWNlKHN0YXJ0LCBwb3MrKyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb3MgPSBsYWJlbEVuZCArIDE7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvcyA9IGxhYmVsRW5kICsgMTtcbiAgICB9XG5cbiAgICAvLyBjb3ZlcnMgbGFiZWwgPT09ICcnIGFuZCBsYWJlbCA9PT0gdW5kZWZpbmVkXG4gICAgLy8gKGNvbGxhcHNlZCByZWZlcmVuY2UgbGluayBhbmQgc2hvcnRjdXQgcmVmZXJlbmNlIGxpbmsgcmVzcGVjdGl2ZWx5KVxuICAgIGlmICghbGFiZWwpIHsgbGFiZWwgPSBzdGF0ZS5zcmMuc2xpY2UobGFiZWxTdGFydCwgbGFiZWxFbmQpOyB9XG5cbiAgICByZWYgPSBzdGF0ZS5lbnYucmVmZXJlbmNlc1tub3JtYWxpemVSZWZlcmVuY2UobGFiZWwpXTtcbiAgICBpZiAoIXJlZikge1xuICAgICAgc3RhdGUucG9zID0gb2xkUG9zO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBocmVmID0gcmVmLmhyZWY7XG4gICAgdGl0bGUgPSByZWYudGl0bGU7XG4gIH1cblxuICAvL1xuICAvLyBXZSBmb3VuZCB0aGUgZW5kIG9mIHRoZSBsaW5rLCBhbmQga25vdyBmb3IgYSBmYWN0IGl0J3MgYSB2YWxpZCBsaW5rO1xuICAvLyBzbyBhbGwgdGhhdCdzIGxlZnQgdG8gZG8gaXMgdG8gY2FsbCB0b2tlbml6ZXIuXG4gIC8vXG4gIGlmICghc2lsZW50KSB7XG4gICAgc3RhdGUucG9zID0gbGFiZWxTdGFydDtcbiAgICBzdGF0ZS5wb3NNYXggPSBsYWJlbEVuZDtcblxuICAgIHZhciBuZXdTdGF0ZSA9IG5ldyBzdGF0ZS5tZC5pbmxpbmUuU3RhdGUoXG4gICAgICBzdGF0ZS5zcmMuc2xpY2UobGFiZWxTdGFydCwgbGFiZWxFbmQpLFxuICAgICAgc3RhdGUubWQsXG4gICAgICBzdGF0ZS5lbnYsXG4gICAgICB0b2tlbnMgPSBbXVxuICAgICk7XG4gICAgbmV3U3RhdGUubWQuaW5saW5lLnRva2VuaXplKG5ld1N0YXRlKTtcblxuICAgIHN0YXRlLnB1c2goe1xuICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgIHNyYzogaHJlZixcbiAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgIHRva2VuczogdG9rZW5zLFxuICAgICAgbGV2ZWw6IHN0YXRlLmxldmVsXG4gICAgfSk7XG4gIH1cblxuICBzdGF0ZS5wb3MgPSBwb3M7XG4gIHN0YXRlLnBvc01heCA9IG1heDtcbiAgcmV0dXJuIHRydWU7XG59O1xuIiwiLy8gUHJvY2VzcyBbbGlua10oPHRvPiBcInN0dWZmXCIpXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHBhcnNlTGlua0xhYmVsICAgICAgID0gcmVxdWlyZSgnLi4vaGVscGVycy9wYXJzZV9saW5rX2xhYmVsJyk7XG52YXIgcGFyc2VMaW5rRGVzdGluYXRpb24gPSByZXF1aXJlKCcuLi9oZWxwZXJzL3BhcnNlX2xpbmtfZGVzdGluYXRpb24nKTtcbnZhciBwYXJzZUxpbmtUaXRsZSAgICAgICA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvcGFyc2VfbGlua190aXRsZScpO1xudmFyIG5vcm1hbGl6ZVJlZmVyZW5jZSAgID0gcmVxdWlyZSgnLi4vY29tbW9uL3V0aWxzJykubm9ybWFsaXplUmVmZXJlbmNlO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbGluayhzdGF0ZSwgc2lsZW50KSB7XG4gIHZhciBjb2RlLFxuICAgICAgaHJlZixcbiAgICAgIGxhYmVsLFxuICAgICAgbGFiZWxFbmQsXG4gICAgICBsYWJlbFN0YXJ0LFxuICAgICAgcG9zLFxuICAgICAgcmVzLFxuICAgICAgcmVmLFxuICAgICAgdGl0bGUsXG4gICAgICBvbGRQb3MgPSBzdGF0ZS5wb3MsXG4gICAgICBtYXggPSBzdGF0ZS5wb3NNYXgsXG4gICAgICBzdGFydCA9IHN0YXRlLnBvcztcblxuICBpZiAoc3RhdGUuc3JjLmNoYXJDb2RlQXQoc3RhdGUucG9zKSAhPT0gMHg1Qi8qIFsgKi8pIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgbGFiZWxTdGFydCA9IHN0YXRlLnBvcyArIDE7XG4gIGxhYmVsRW5kID0gcGFyc2VMaW5rTGFiZWwoc3RhdGUsIHN0YXRlLnBvcywgdHJ1ZSk7XG5cbiAgLy8gcGFyc2VyIGZhaWxlZCB0byBmaW5kICddJywgc28gaXQncyBub3QgYSB2YWxpZCBsaW5rXG4gIGlmIChsYWJlbEVuZCA8IDApIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgcG9zID0gbGFiZWxFbmQgKyAxO1xuICBpZiAocG9zIDwgbWF4ICYmIHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcykgPT09IDB4MjgvKiAoICovKSB7XG4gICAgLy9cbiAgICAvLyBJbmxpbmUgbGlua1xuICAgIC8vXG5cbiAgICAvLyBbbGlua10oICA8aHJlZj4gIFwidGl0bGVcIiAgKVxuICAgIC8vICAgICAgICBeXiBza2lwcGluZyB0aGVzZSBzcGFjZXNcbiAgICBwb3MrKztcbiAgICBmb3IgKDsgcG9zIDwgbWF4OyBwb3MrKykge1xuICAgICAgY29kZSA9IHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcyk7XG4gICAgICBpZiAoY29kZSAhPT0gMHgyMCAmJiBjb2RlICE9PSAweDBBKSB7IGJyZWFrOyB9XG4gICAgfVxuICAgIGlmIChwb3MgPj0gbWF4KSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgLy8gW2xpbmtdKCAgPGhyZWY+ICBcInRpdGxlXCIgIClcbiAgICAvLyAgICAgICAgICBeXl5eXl4gcGFyc2luZyBsaW5rIGRlc3RpbmF0aW9uXG4gICAgc3RhcnQgPSBwb3M7XG4gICAgcmVzID0gcGFyc2VMaW5rRGVzdGluYXRpb24oc3RhdGUuc3JjLCBwb3MsIHN0YXRlLnBvc01heCk7XG4gICAgaWYgKHJlcy5vayAmJiBzdGF0ZS5tZC5pbmxpbmUudmFsaWRhdGVMaW5rKHJlcy5zdHIpKSB7XG4gICAgICBocmVmID0gcmVzLnN0cjtcbiAgICAgIHBvcyA9IHJlcy5wb3M7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhyZWYgPSAnJztcbiAgICB9XG5cbiAgICAvLyBbbGlua10oICA8aHJlZj4gIFwidGl0bGVcIiAgKVxuICAgIC8vICAgICAgICAgICAgICAgIF5eIHNraXBwaW5nIHRoZXNlIHNwYWNlc1xuICAgIHN0YXJ0ID0gcG9zO1xuICAgIGZvciAoOyBwb3MgPCBtYXg7IHBvcysrKSB7XG4gICAgICBjb2RlID0gc3RhdGUuc3JjLmNoYXJDb2RlQXQocG9zKTtcbiAgICAgIGlmIChjb2RlICE9PSAweDIwICYmIGNvZGUgIT09IDB4MEEpIHsgYnJlYWs7IH1cbiAgICB9XG5cbiAgICAvLyBbbGlua10oICA8aHJlZj4gIFwidGl0bGVcIiAgKVxuICAgIC8vICAgICAgICAgICAgICAgICAgXl5eXl5eXiBwYXJzaW5nIGxpbmsgdGl0bGVcbiAgICByZXMgPSBwYXJzZUxpbmtUaXRsZShzdGF0ZS5zcmMsIHBvcywgc3RhdGUucG9zTWF4KTtcbiAgICBpZiAocG9zIDwgbWF4ICYmIHN0YXJ0ICE9PSBwb3MgJiYgcmVzLm9rKSB7XG4gICAgICB0aXRsZSA9IHJlcy5zdHI7XG4gICAgICBwb3MgPSByZXMucG9zO1xuXG4gICAgICAvLyBbbGlua10oICA8aHJlZj4gIFwidGl0bGVcIiAgKVxuICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgXl4gc2tpcHBpbmcgdGhlc2Ugc3BhY2VzXG4gICAgICBmb3IgKDsgcG9zIDwgbWF4OyBwb3MrKykge1xuICAgICAgICBjb2RlID0gc3RhdGUuc3JjLmNoYXJDb2RlQXQocG9zKTtcbiAgICAgICAgaWYgKGNvZGUgIT09IDB4MjAgJiYgY29kZSAhPT0gMHgwQSkgeyBicmVhazsgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aXRsZSA9ICcnO1xuICAgIH1cblxuICAgIGlmIChwb3MgPj0gbWF4IHx8IHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcykgIT09IDB4MjkvKiApICovKSB7XG4gICAgICBzdGF0ZS5wb3MgPSBvbGRQb3M7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHBvcysrO1xuICB9IGVsc2Uge1xuICAgIC8vXG4gICAgLy8gTGluayByZWZlcmVuY2VcbiAgICAvL1xuICAgIGlmICh0eXBlb2Ygc3RhdGUuZW52LnJlZmVyZW5jZXMgPT09ICd1bmRlZmluZWQnKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgLy8gW2Zvb10gIFtiYXJdXG4gICAgLy8gICAgICBeXiBvcHRpb25hbCB3aGl0ZXNwYWNlIChjYW4gaW5jbHVkZSBuZXdsaW5lcylcbiAgICBmb3IgKDsgcG9zIDwgbWF4OyBwb3MrKykge1xuICAgICAgY29kZSA9IHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcyk7XG4gICAgICBpZiAoY29kZSAhPT0gMHgyMCAmJiBjb2RlICE9PSAweDBBKSB7IGJyZWFrOyB9XG4gICAgfVxuXG4gICAgaWYgKHBvcyA8IG1heCAmJiBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MpID09PSAweDVCLyogWyAqLykge1xuICAgICAgc3RhcnQgPSBwb3MgKyAxO1xuICAgICAgcG9zID0gcGFyc2VMaW5rTGFiZWwoc3RhdGUsIHBvcyk7XG4gICAgICBpZiAocG9zID49IDApIHtcbiAgICAgICAgbGFiZWwgPSBzdGF0ZS5zcmMuc2xpY2Uoc3RhcnQsIHBvcysrKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvcyA9IGxhYmVsRW5kICsgMTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcG9zID0gbGFiZWxFbmQgKyAxO1xuICAgIH1cblxuICAgIC8vIGNvdmVycyBsYWJlbCA9PT0gJycgYW5kIGxhYmVsID09PSB1bmRlZmluZWRcbiAgICAvLyAoY29sbGFwc2VkIHJlZmVyZW5jZSBsaW5rIGFuZCBzaG9ydGN1dCByZWZlcmVuY2UgbGluayByZXNwZWN0aXZlbHkpXG4gICAgaWYgKCFsYWJlbCkgeyBsYWJlbCA9IHN0YXRlLnNyYy5zbGljZShsYWJlbFN0YXJ0LCBsYWJlbEVuZCk7IH1cblxuICAgIHJlZiA9IHN0YXRlLmVudi5yZWZlcmVuY2VzW25vcm1hbGl6ZVJlZmVyZW5jZShsYWJlbCldO1xuICAgIGlmICghcmVmKSB7XG4gICAgICBzdGF0ZS5wb3MgPSBvbGRQb3M7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGhyZWYgPSByZWYuaHJlZjtcbiAgICB0aXRsZSA9IHJlZi50aXRsZTtcbiAgfVxuXG4gIC8vXG4gIC8vIFdlIGZvdW5kIHRoZSBlbmQgb2YgdGhlIGxpbmssIGFuZCBrbm93IGZvciBhIGZhY3QgaXQncyBhIHZhbGlkIGxpbms7XG4gIC8vIHNvIGFsbCB0aGF0J3MgbGVmdCB0byBkbyBpcyB0byBjYWxsIHRva2VuaXplci5cbiAgLy9cbiAgaWYgKCFzaWxlbnQpIHtcbiAgICBzdGF0ZS5wb3MgPSBsYWJlbFN0YXJ0O1xuICAgIHN0YXRlLnBvc01heCA9IGxhYmVsRW5kO1xuXG4gICAgc3RhdGUucHVzaCh7XG4gICAgICB0eXBlOiAnbGlua19vcGVuJyxcbiAgICAgIGhyZWY6IGhyZWYsXG4gICAgICB0YXJnZXQ6ICcnLFxuICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgbGV2ZWw6IHN0YXRlLmxldmVsKytcbiAgICB9KTtcbiAgICBzdGF0ZS5tZC5pbmxpbmUudG9rZW5pemUoc3RhdGUpO1xuICAgIHN0YXRlLnB1c2goeyB0eXBlOiAnbGlua19jbG9zZScsIGxldmVsOiAtLXN0YXRlLmxldmVsIH0pO1xuICB9XG5cbiAgc3RhdGUucG9zID0gcG9zO1xuICBzdGF0ZS5wb3NNYXggPSBtYXg7XG4gIHJldHVybiB0cnVlO1xufTtcbiIsIi8vIFByb2NlZXNzICdcXG4nXG5cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBuZXdsaW5lKHN0YXRlLCBzaWxlbnQpIHtcbiAgdmFyIHBtYXgsIG1heCwgcG9zID0gc3RhdGUucG9zO1xuXG4gIGlmIChzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MpICE9PSAweDBBLyogXFxuICovKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIHBtYXggPSBzdGF0ZS5wZW5kaW5nLmxlbmd0aCAtIDE7XG4gIG1heCA9IHN0YXRlLnBvc01heDtcblxuICAvLyAnICBcXG4nIC0+IGhhcmRicmVha1xuICAvLyBMb29rdXAgaW4gcGVuZGluZyBjaGFycyBpcyBiYWQgcHJhY3RpY2UhIERvbid0IGNvcHkgdG8gb3RoZXIgcnVsZXMhXG4gIC8vIFBlbmRpbmcgc3RyaW5nIGlzIHN0b3JlZCBpbiBjb25jYXQgbW9kZSwgaW5kZXhlZCBsb29rdXBzIHdpbGwgY2F1c2VcbiAgLy8gY29udmVydGlvbiB0byBmbGF0IG1vZGUuXG4gIGlmICghc2lsZW50KSB7XG4gICAgaWYgKHBtYXggPj0gMCAmJiBzdGF0ZS5wZW5kaW5nLmNoYXJDb2RlQXQocG1heCkgPT09IDB4MjApIHtcbiAgICAgIGlmIChwbWF4ID49IDEgJiYgc3RhdGUucGVuZGluZy5jaGFyQ29kZUF0KHBtYXggLSAxKSA9PT0gMHgyMCkge1xuICAgICAgICBzdGF0ZS5wZW5kaW5nID0gc3RhdGUucGVuZGluZy5yZXBsYWNlKC8gKyQvLCAnJyk7XG4gICAgICAgIHN0YXRlLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdoYXJkYnJlYWsnLFxuICAgICAgICAgIGxldmVsOiBzdGF0ZS5sZXZlbFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXRlLnBlbmRpbmcgPSBzdGF0ZS5wZW5kaW5nLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgc3RhdGUucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ3NvZnRicmVhaycsXG4gICAgICAgICAgbGV2ZWw6IHN0YXRlLmxldmVsXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXRlLnB1c2goe1xuICAgICAgICB0eXBlOiAnc29mdGJyZWFrJyxcbiAgICAgICAgbGV2ZWw6IHN0YXRlLmxldmVsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwb3MrKztcblxuICAvLyBza2lwIGhlYWRpbmcgc3BhY2VzIGZvciBuZXh0IGxpbmVcbiAgd2hpbGUgKHBvcyA8IG1heCAmJiBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MpID09PSAweDIwKSB7IHBvcysrOyB9XG5cbiAgc3RhdGUucG9zID0gcG9zO1xuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIvLyBJbmxpbmUgcGFyc2VyIHN0YXRlXG5cbid1c2Ugc3RyaWN0JztcblxuXG5mdW5jdGlvbiBTdGF0ZUlubGluZShzcmMsIG1kLCBlbnYsIG91dFRva2Vucykge1xuICB0aGlzLnNyYyA9IHNyYztcbiAgdGhpcy5lbnYgPSBlbnY7XG4gIHRoaXMubWQgPSBtZDtcbiAgdGhpcy50b2tlbnMgPSBvdXRUb2tlbnM7XG5cbiAgdGhpcy5wb3MgPSAwO1xuICB0aGlzLnBvc01heCA9IHRoaXMuc3JjLmxlbmd0aDtcbiAgdGhpcy5sZXZlbCA9IDA7XG4gIHRoaXMucGVuZGluZyA9ICcnO1xuICB0aGlzLnBlbmRpbmdMZXZlbCA9IDA7XG5cbiAgdGhpcy5jYWNoZSA9IFtdOyAgICAgICAgLy8gU3RvcmVzIHsgc3RhcnQ6IGVuZCB9IHBhaXJzLiBVc2VmdWwgZm9yIGJhY2t0cmFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcHRpbWl6YXRpb24gb2YgcGFpcnMgcGFyc2UgKGVtcGhhc2lzLCBzdHJpa2VzKS5cbn1cblxuXG4vLyBGbHVzaCBwZW5kaW5nIHRleHRcbi8vXG5TdGF0ZUlubGluZS5wcm90b3R5cGUucHVzaFBlbmRpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMudG9rZW5zLnB1c2goe1xuICAgIHR5cGU6ICd0ZXh0JyxcbiAgICBjb250ZW50OiB0aGlzLnBlbmRpbmcsXG4gICAgbGV2ZWw6IHRoaXMucGVuZGluZ0xldmVsXG4gIH0pO1xuICB0aGlzLnBlbmRpbmcgPSAnJztcbn07XG5cblxuLy8gUHVzaCBuZXcgdG9rZW4gdG8gXCJzdHJlYW1cIi5cbi8vIElmIHBlbmRpbmcgdGV4dCBleGlzdHMgLSBmbHVzaCBpdCBhcyB0ZXh0IHRva2VuXG4vL1xuU3RhdGVJbmxpbmUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAodG9rZW4pIHtcbiAgaWYgKHRoaXMucGVuZGluZykge1xuICAgIHRoaXMucHVzaFBlbmRpbmcoKTtcbiAgfVxuXG4gIHRoaXMudG9rZW5zLnB1c2godG9rZW4pO1xuICB0aGlzLnBlbmRpbmdMZXZlbCA9IHRoaXMubGV2ZWw7XG59O1xuXG5cbi8vIFN0b3JlIHZhbHVlIHRvIGNhY2hlLlxuLy8gISEhIEltcGxlbWVudGF0aW9uIGhhcyBwYXJzZXItc3BlY2lmaWMgb3B0aW1pemF0aW9uc1xuLy8gISEhIGtleXMgTVVTVCBiZSBpbnRlZ2VyLCA+PSAwOyB2YWx1ZXMgTVVTVCBiZSBpbnRlZ2VyLCA+IDBcbi8vXG5TdGF0ZUlubGluZS5wcm90b3R5cGUuY2FjaGVTZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWwpIHtcbiAgZm9yICh2YXIgaSA9IHRoaXMuY2FjaGUubGVuZ3RoOyBpIDw9IGtleTsgaSsrKSB7XG4gICAgdGhpcy5jYWNoZS5wdXNoKDApO1xuICB9XG5cbiAgdGhpcy5jYWNoZVtrZXldID0gdmFsO1xufTtcblxuXG4vLyBHZXQgY2FjaGUgdmFsdWVcbi8vXG5TdGF0ZUlubGluZS5wcm90b3R5cGUuY2FjaGVHZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBrZXkgPCB0aGlzLmNhY2hlLmxlbmd0aCA/IHRoaXMuY2FjaGVba2V5XSA6IDA7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdGVJbmxpbmU7XG4iLCIvLyB+fnN0cmlrZSB0aHJvdWdofn5cbi8vXG4ndXNlIHN0cmljdCc7XG5cblxudmFyIGlzV2hpdGVTcGFjZSAgID0gcmVxdWlyZSgnLi4vY29tbW9uL3V0aWxzJykuaXNXaGl0ZVNwYWNlO1xudmFyIGlzUHVuY3RDaGFyICAgID0gcmVxdWlyZSgnLi4vY29tbW9uL3V0aWxzJykuaXNQdW5jdENoYXI7XG52YXIgaXNNZEFzY2lpUHVuY3QgPSByZXF1aXJlKCcuLi9jb21tb24vdXRpbHMnKS5pc01kQXNjaWlQdW5jdDtcblxuXG4vLyBwYXJzZSBzZXF1ZW5jZSBvZiBtYXJrZXJzLFxuLy8gXCJzdGFydFwiIHNob3VsZCBwb2ludCBhdCBhIHZhbGlkIG1hcmtlclxuZnVuY3Rpb24gc2NhbkRlbGltcyhzdGF0ZSwgc3RhcnQpIHtcbiAgdmFyIHBvcyA9IHN0YXJ0LCBsYXN0Q2hhciwgbmV4dENoYXIsIGNvdW50LFxuICAgICAgaXNMYXN0V2hpdGVTcGFjZSwgaXNMYXN0UHVuY3RDaGFyLFxuICAgICAgaXNOZXh0V2hpdGVTcGFjZSwgaXNOZXh0UHVuY3RDaGFyLFxuICAgICAgY2FuX29wZW4gPSB0cnVlLFxuICAgICAgY2FuX2Nsb3NlID0gdHJ1ZSxcbiAgICAgIG1heCA9IHN0YXRlLnBvc01heCxcbiAgICAgIG1hcmtlciA9IHN0YXRlLnNyYy5jaGFyQ29kZUF0KHN0YXJ0KTtcblxuICBsYXN0Q2hhciA9IHN0YXJ0ID4gMCA/IHN0YXRlLnNyYy5jaGFyQ29kZUF0KHN0YXJ0IC0gMSkgOiAtMTtcblxuICB3aGlsZSAocG9zIDwgbWF4ICYmIHN0YXRlLnNyYy5jaGFyQ29kZUF0KHBvcykgPT09IG1hcmtlcikgeyBwb3MrKzsgfVxuICBpZiAocG9zID49IG1heCkgeyBjYW5fb3BlbiA9IGZhbHNlOyB9XG4gIGNvdW50ID0gcG9zIC0gc3RhcnQ7XG5cbiAgbmV4dENoYXIgPSBwb3MgPCBtYXggPyBzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MpIDogLTE7XG5cbiAgaXNMYXN0UHVuY3RDaGFyID0gbGFzdENoYXIgPj0gMCAmJlxuICAgIChpc01kQXNjaWlQdW5jdChsYXN0Q2hhcikgfHwgaXNQdW5jdENoYXIoU3RyaW5nLmZyb21DaGFyQ29kZShsYXN0Q2hhcikpKTtcbiAgaXNOZXh0UHVuY3RDaGFyID0gbmV4dENoYXIgPj0gMCAmJlxuICAgIChpc01kQXNjaWlQdW5jdChuZXh0Q2hhcikgfHwgaXNQdW5jdENoYXIoU3RyaW5nLmZyb21DaGFyQ29kZShuZXh0Q2hhcikpKTtcbiAgaXNMYXN0V2hpdGVTcGFjZSA9IGxhc3RDaGFyID49IDAgJiYgaXNXaGl0ZVNwYWNlKGxhc3RDaGFyKTtcbiAgaXNOZXh0V2hpdGVTcGFjZSA9IG5leHRDaGFyID49IDAgJiYgaXNXaGl0ZVNwYWNlKG5leHRDaGFyKTtcblxuICBpZiAoaXNOZXh0V2hpdGVTcGFjZSkge1xuICAgIGNhbl9vcGVuID0gZmFsc2U7XG4gIH0gZWxzZSBpZiAoaXNOZXh0UHVuY3RDaGFyKSB7XG4gICAgaWYgKCEoaXNMYXN0V2hpdGVTcGFjZSB8fCBpc0xhc3RQdW5jdENoYXIgfHwgbGFzdENoYXIgPT09IC0xKSkge1xuICAgICAgY2FuX29wZW4gPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBpZiAoaXNMYXN0V2hpdGVTcGFjZSkge1xuICAgIGNhbl9jbG9zZSA9IGZhbHNlO1xuICB9IGVsc2UgaWYgKGlzTGFzdFB1bmN0Q2hhcikge1xuICAgIGlmICghKGlzTmV4dFdoaXRlU3BhY2UgfHwgaXNOZXh0UHVuY3RDaGFyIHx8IG5leHRDaGFyID09PSAtMSkpIHtcbiAgICAgIGNhbl9jbG9zZSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2FuX29wZW46IGNhbl9vcGVuLFxuICAgIGNhbl9jbG9zZTogY2FuX2Nsb3NlLFxuICAgIGRlbGltczogY291bnRcbiAgfTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN0cmlrZXRocm91Z2goc3RhdGUsIHNpbGVudCkge1xuICB2YXIgc3RhcnRDb3VudCxcbiAgICAgIGNvdW50LFxuICAgICAgdGFnQ291bnQsXG4gICAgICBmb3VuZCxcbiAgICAgIHN0YWNrLFxuICAgICAgcmVzLFxuICAgICAgbWF4ID0gc3RhdGUucG9zTWF4LFxuICAgICAgc3RhcnQgPSBzdGF0ZS5wb3MsXG4gICAgICBtYXJrZXIgPSBzdGF0ZS5zcmMuY2hhckNvZGVBdChzdGFydCk7XG5cbiAgaWYgKG1hcmtlciAhPT0gMHg3RS8qIH4gKi8pIHsgcmV0dXJuIGZhbHNlOyB9XG4gIGlmIChzaWxlbnQpIHsgcmV0dXJuIGZhbHNlOyB9IC8vIGRvbid0IHJ1biBhbnkgcGFpcnMgaW4gdmFsaWRhdGlvbiBtb2RlXG5cbiAgcmVzID0gc2NhbkRlbGltcyhzdGF0ZSwgc3RhcnQpO1xuICBzdGFydENvdW50ID0gcmVzLmRlbGltcztcbiAgaWYgKCFyZXMuY2FuX29wZW4pIHtcbiAgICBzdGF0ZS5wb3MgKz0gc3RhcnRDb3VudDtcbiAgICAvLyBFYXJsaWVyIHdlIGNoZWNrZWQgIXNpbGVudCwgYnV0IHRoaXMgaW1wbGVtZW50YXRpb24gZG9lcyBub3QgbmVlZCBpdFxuICAgIHN0YXRlLnBlbmRpbmcgKz0gc3RhdGUuc3JjLnNsaWNlKHN0YXJ0LCBzdGF0ZS5wb3MpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgc3RhY2sgPSBNYXRoLmZsb29yKHN0YXJ0Q291bnQgLyAyKTtcbiAgaWYgKHN0YWNrIDw9IDApIHsgcmV0dXJuIGZhbHNlOyB9XG4gIHN0YXRlLnBvcyA9IHN0YXJ0ICsgc3RhcnRDb3VudDtcblxuICB3aGlsZSAoc3RhdGUucG9zIDwgbWF4KSB7XG4gICAgaWYgKHN0YXRlLnNyYy5jaGFyQ29kZUF0KHN0YXRlLnBvcykgPT09IG1hcmtlcikge1xuICAgICAgcmVzID0gc2NhbkRlbGltcyhzdGF0ZSwgc3RhdGUucG9zKTtcbiAgICAgIGNvdW50ID0gcmVzLmRlbGltcztcbiAgICAgIHRhZ0NvdW50ID0gTWF0aC5mbG9vcihjb3VudCAvIDIpO1xuICAgICAgaWYgKHJlcy5jYW5fY2xvc2UpIHtcbiAgICAgICAgaWYgKHRhZ0NvdW50ID49IHN0YWNrKSB7XG4gICAgICAgICAgc3RhdGUucG9zICs9IGNvdW50IC0gMjtcbiAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc3RhY2sgLT0gdGFnQ291bnQ7XG4gICAgICAgIHN0YXRlLnBvcyArPSBjb3VudDtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXMuY2FuX29wZW4pIHsgc3RhY2sgKz0gdGFnQ291bnQ7IH1cbiAgICAgIHN0YXRlLnBvcyArPSBjb3VudDtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHN0YXRlLm1kLmlubGluZS5za2lwVG9rZW4oc3RhdGUpO1xuICB9XG5cbiAgaWYgKCFmb3VuZCkge1xuICAgIC8vIHBhcnNlciBmYWlsZWQgdG8gZmluZCBlbmRpbmcgdGFnLCBzbyBpdCdzIG5vdCB2YWxpZCBlbXBoYXNpc1xuICAgIHN0YXRlLnBvcyA9IHN0YXJ0O1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGZvdW5kIVxuICBzdGF0ZS5wb3NNYXggPSBzdGF0ZS5wb3M7XG4gIHN0YXRlLnBvcyA9IHN0YXJ0ICsgMjtcblxuICAvLyBFYXJsaWVyIHdlIGNoZWNrZWQgIXNpbGVudCwgYnV0IHRoaXMgaW1wbGVtZW50YXRpb24gZG9lcyBub3QgbmVlZCBpdFxuICBzdGF0ZS5wdXNoKHsgdHlwZTogJ3Nfb3BlbicsIGxldmVsOiBzdGF0ZS5sZXZlbCsrIH0pO1xuICBzdGF0ZS5tZC5pbmxpbmUudG9rZW5pemUoc3RhdGUpO1xuICBzdGF0ZS5wdXNoKHsgdHlwZTogJ3NfY2xvc2UnLCBsZXZlbDogLS1zdGF0ZS5sZXZlbCB9KTtcblxuICBzdGF0ZS5wb3MgPSBzdGF0ZS5wb3NNYXggKyAyO1xuICBzdGF0ZS5wb3NNYXggPSBtYXg7XG4gIHJldHVybiB0cnVlO1xufTtcbiIsIi8vIFNraXAgdGV4dCBjaGFyYWN0ZXJzIGZvciB0ZXh0IHRva2VuLCBwbGFjZSB0aG9zZSB0byBwZW5kaW5nIGJ1ZmZlclxuLy8gYW5kIGluY3JlbWVudCBjdXJyZW50IHBvc1xuXG4ndXNlIHN0cmljdCc7XG5cblxuLy8gUnVsZSB0byBza2lwIHB1cmUgdGV4dFxuLy8gJ3t9JCVAfis9OicgcmVzZXJ2ZWQgZm9yIGV4dGVudGlvbnNcblxuLy8gISwgXCIsICMsICQsICUsICYsICcsICgsICksICosICssICwsIC0sIC4sIC8sIDosIDssIDwsID0sID4sID8sIEAsIFssIFxcLCBdLCBeLCBfLCBgLCB7LCB8LCB9LCBvciB+XG5cbi8vICEhISEgRG9uJ3QgY29uZnVzZSB3aXRoIFwiTWFya2Rvd24gQVNDSUkgUHVuY3R1YXRpb25cIiBjaGFyc1xuLy8gaHR0cDovL3NwZWMuY29tbW9ubWFyay5vcmcvMC4xNS8jYXNjaWktcHVuY3R1YXRpb24tY2hhcmFjdGVyXG5mdW5jdGlvbiBpc1Rlcm1pbmF0b3JDaGFyKGNoKSB7XG4gIHN3aXRjaCAoY2gpIHtcbiAgICBjYXNlIDB4MEEvKiBcXG4gKi86XG4gICAgY2FzZSAweDIxLyogISAqLzpcbiAgICBjYXNlIDB4MjMvKiAjICovOlxuICAgIGNhc2UgMHgyNC8qICQgKi86XG4gICAgY2FzZSAweDI1LyogJSAqLzpcbiAgICBjYXNlIDB4MjYvKiAmICovOlxuICAgIGNhc2UgMHgyQS8qICogKi86XG4gICAgY2FzZSAweDJCLyogKyAqLzpcbiAgICBjYXNlIDB4MkQvKiAtICovOlxuICAgIGNhc2UgMHgzQS8qIDogKi86XG4gICAgY2FzZSAweDNDLyogPCAqLzpcbiAgICBjYXNlIDB4M0QvKiA9ICovOlxuICAgIGNhc2UgMHgzRS8qID4gKi86XG4gICAgY2FzZSAweDQwLyogQCAqLzpcbiAgICBjYXNlIDB4NUIvKiBbICovOlxuICAgIGNhc2UgMHg1Qy8qIFxcICovOlxuICAgIGNhc2UgMHg1RC8qIF0gKi86XG4gICAgY2FzZSAweDVFLyogXiAqLzpcbiAgICBjYXNlIDB4NUYvKiBfICovOlxuICAgIGNhc2UgMHg2MC8qIGAgKi86XG4gICAgY2FzZSAweDdCLyogeyAqLzpcbiAgICBjYXNlIDB4N0QvKiB9ICovOlxuICAgIGNhc2UgMHg3RS8qIH4gKi86XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGV4dChzdGF0ZSwgc2lsZW50KSB7XG4gIHZhciBwb3MgPSBzdGF0ZS5wb3M7XG5cbiAgd2hpbGUgKHBvcyA8IHN0YXRlLnBvc01heCAmJiAhaXNUZXJtaW5hdG9yQ2hhcihzdGF0ZS5zcmMuY2hhckNvZGVBdChwb3MpKSkge1xuICAgIHBvcysrO1xuICB9XG5cbiAgaWYgKHBvcyA9PT0gc3RhdGUucG9zKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gIGlmICghc2lsZW50KSB7IHN0YXRlLnBlbmRpbmcgKz0gc3RhdGUuc3JjLnNsaWNlKHN0YXRlLnBvcywgcG9zKTsgfVxuXG4gIHN0YXRlLnBvcyA9IHBvcztcblxuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcclxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXHJcbiAgICBkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIChyb290LnJldHVybkV4cG9ydHNHbG9iYWwgPSBmYWN0b3J5KCkpO1xyXG4gICAgfSk7XHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgIC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dFxyXG4gICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb21lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cyxcclxuICAgIC8vIGxpa2UgTm9kZS5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByb290WydBdXRvbGlua2VyJ10gPSBmYWN0b3J5KCk7XHJcbiAgfVxyXG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcclxuXHJcblx0LyohXHJcblx0ICogQXV0b2xpbmtlci5qc1xyXG5cdCAqIDAuMTUuMlxyXG5cdCAqXHJcblx0ICogQ29weXJpZ2h0KGMpIDIwMTUgR3JlZ29yeSBKYWNvYnMgPGdyZWdAZ3JlZy1qYWNvYnMuY29tPlxyXG5cdCAqIE1JVCBMaWNlbnNlZC4gaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcclxuXHQgKlxyXG5cdCAqIGh0dHBzOi8vZ2l0aHViLmNvbS9ncmVnamFjb2JzL0F1dG9saW5rZXIuanNcclxuXHQgKi9cclxuXHQvKipcclxuXHQgKiBAY2xhc3MgQXV0b2xpbmtlclxyXG5cdCAqIEBleHRlbmRzIE9iamVjdFxyXG5cdCAqIFxyXG5cdCAqIFV0aWxpdHkgY2xhc3MgdXNlZCB0byBwcm9jZXNzIGEgZ2l2ZW4gc3RyaW5nIG9mIHRleHQsIGFuZCB3cmFwIHRoZSBVUkxzLCBlbWFpbCBhZGRyZXNzZXMsIGFuZCBUd2l0dGVyIGhhbmRsZXMgaW4gXHJcblx0ICogdGhlIGFwcHJvcHJpYXRlIGFuY2hvciAoJmx0O2EmZ3Q7KSB0YWdzIHRvIHR1cm4gdGhlbSBpbnRvIGxpbmtzLlxyXG5cdCAqIFxyXG5cdCAqIEFueSBvZiB0aGUgY29uZmlndXJhdGlvbiBvcHRpb25zIG1heSBiZSBwcm92aWRlZCBpbiBhbiBPYmplY3QgKG1hcCkgcHJvdmlkZWQgdG8gdGhlIEF1dG9saW5rZXIgY29uc3RydWN0b3IsIHdoaWNoXHJcblx0ICogd2lsbCBjb25maWd1cmUgaG93IHRoZSB7QGxpbmsgI2xpbmsgbGluaygpfSBtZXRob2Qgd2lsbCBwcm9jZXNzIHRoZSBsaW5rcy5cclxuXHQgKiBcclxuXHQgKiBGb3IgZXhhbXBsZTpcclxuXHQgKiBcclxuXHQgKiAgICAgdmFyIGF1dG9saW5rZXIgPSBuZXcgQXV0b2xpbmtlcigge1xyXG5cdCAqICAgICAgICAgbmV3V2luZG93IDogZmFsc2UsXHJcblx0ICogICAgICAgICB0cnVuY2F0ZSAgOiAzMFxyXG5cdCAqICAgICB9ICk7XHJcblx0ICogICAgIFxyXG5cdCAqICAgICB2YXIgaHRtbCA9IGF1dG9saW5rZXIubGluayggXCJKb2Ugd2VudCB0byB3d3cueWFob28uY29tXCIgKTtcclxuXHQgKiAgICAgLy8gcHJvZHVjZXM6ICdKb2Ugd2VudCB0byA8YSBocmVmPVwiaHR0cDovL3d3dy55YWhvby5jb21cIj55YWhvby5jb208L2E+J1xyXG5cdCAqIFxyXG5cdCAqIFxyXG5cdCAqIFRoZSB7QGxpbmsgI3N0YXRpYy1saW5rIHN0YXRpYyBsaW5rKCl9IG1ldGhvZCBtYXkgYWxzbyBiZSB1c2VkIHRvIGlubGluZSBvcHRpb25zIGludG8gYSBzaW5nbGUgY2FsbCwgd2hpY2ggbWF5XHJcblx0ICogYmUgbW9yZSBjb252ZW5pZW50IGZvciBvbmUtb2ZmIHVzZXMuIEZvciBleGFtcGxlOlxyXG5cdCAqIFxyXG5cdCAqICAgICB2YXIgaHRtbCA9IEF1dG9saW5rZXIubGluayggXCJKb2Ugd2VudCB0byB3d3cueWFob28uY29tXCIsIHtcclxuXHQgKiAgICAgICAgIG5ld1dpbmRvdyA6IGZhbHNlLFxyXG5cdCAqICAgICAgICAgdHJ1bmNhdGUgIDogMzBcclxuXHQgKiAgICAgfSApO1xyXG5cdCAqICAgICAvLyBwcm9kdWNlczogJ0pvZSB3ZW50IHRvIDxhIGhyZWY9XCJodHRwOi8vd3d3LnlhaG9vLmNvbVwiPnlhaG9vLmNvbTwvYT4nXHJcblx0ICogXHJcblx0ICogXHJcblx0ICogIyMgQ3VzdG9tIFJlcGxhY2VtZW50cyBvZiBMaW5rc1xyXG5cdCAqIFxyXG5cdCAqIElmIHRoZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgZG8gbm90IHByb3ZpZGUgZW5vdWdoIGZsZXhpYmlsaXR5LCBhIHtAbGluayAjcmVwbGFjZUZufSBtYXkgYmUgcHJvdmlkZWQgdG8gZnVsbHkgY3VzdG9taXplXHJcblx0ICogdGhlIG91dHB1dCBvZiBBdXRvbGlua2VyLiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbmNlIGZvciBlYWNoIFVSTC9FbWFpbC9Ud2l0dGVyIGhhbmRsZSBtYXRjaCB0aGF0IGlzIGVuY291bnRlcmVkLlxyXG5cdCAqIFxyXG5cdCAqIEZvciBleGFtcGxlOlxyXG5cdCAqIFxyXG5cdCAqICAgICB2YXIgaW5wdXQgPSBcIi4uLlwiOyAgLy8gc3RyaW5nIHdpdGggVVJMcywgRW1haWwgQWRkcmVzc2VzLCBhbmQgVHdpdHRlciBIYW5kbGVzXHJcblx0ICogICAgIFxyXG5cdCAqICAgICB2YXIgbGlua2VkVGV4dCA9IEF1dG9saW5rZXIubGluayggaW5wdXQsIHtcclxuXHQgKiAgICAgICAgIHJlcGxhY2VGbiA6IGZ1bmN0aW9uKCBhdXRvbGlua2VyLCBtYXRjaCApIHtcclxuXHQgKiAgICAgICAgICAgICBjb25zb2xlLmxvZyggXCJocmVmID0gXCIsIG1hdGNoLmdldEFuY2hvckhyZWYoKSApO1xyXG5cdCAqICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBcInRleHQgPSBcIiwgbWF0Y2guZ2V0QW5jaG9yVGV4dCgpICk7XHJcblx0ICogICAgICAgICBcclxuXHQgKiAgICAgICAgICAgICBzd2l0Y2goIG1hdGNoLmdldFR5cGUoKSApIHtcclxuXHQgKiAgICAgICAgICAgICAgICAgY2FzZSAndXJsJyA6IFxyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coIFwidXJsOiBcIiwgbWF0Y2guZ2V0VXJsKCkgKTtcclxuXHQgKiAgICAgICAgICAgICAgICAgICAgIFxyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgaWYoIG1hdGNoLmdldFVybCgpLmluZGV4T2YoICdteXNpdGUuY29tJyApID09PSAtMSApIHtcclxuXHQgKiAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFnID0gYXV0b2xpbmtlci5nZXRUYWdCdWlsZGVyKCkuYnVpbGQoIG1hdGNoICk7ICAvLyByZXR1cm5zIGFuIGBBdXRvbGlua2VyLkh0bWxUYWdgIGluc3RhbmNlLCB3aGljaCBwcm92aWRlcyBtdXRhdG9yIG1ldGhvZHMgZm9yIGVhc3kgY2hhbmdlc1xyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5zZXRBdHRyKCAncmVsJywgJ25vZm9sbG93JyApO1xyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5hZGRDbGFzcyggJ2V4dGVybmFsLWxpbmsnICk7XHJcblx0ICogICAgICAgICAgICAgICAgICAgICAgICAgXHJcblx0ICogICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhZztcclxuXHQgKiAgICAgICAgICAgICAgICAgICAgICAgICBcclxuXHQgKiAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblx0ICogICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7ICAvLyBsZXQgQXV0b2xpbmtlciBwZXJmb3JtIGl0cyBub3JtYWwgYW5jaG9yIHRhZyByZXBsYWNlbWVudFxyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgfVxyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgXHJcblx0ICogICAgICAgICAgICAgICAgIGNhc2UgJ2VtYWlsJyA6XHJcblx0ICogICAgICAgICAgICAgICAgICAgICB2YXIgZW1haWwgPSBtYXRjaC5nZXRFbWFpbCgpO1xyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coIFwiZW1haWw6IFwiLCBlbWFpbCApO1xyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgXHJcblx0ICogICAgICAgICAgICAgICAgICAgICBpZiggZW1haWwgPT09IFwibXlAb3duLmFkZHJlc3NcIiApIHtcclxuXHQgKiAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7ICAvLyBkb24ndCBhdXRvLWxpbmsgdGhpcyBwYXJ0aWN1bGFyIGVtYWlsIGFkZHJlc3M7IGxlYXZlIGFzLWlzXHJcblx0ICogICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjsgIC8vIG5vIHJldHVybiB2YWx1ZSB3aWxsIGhhdmUgQXV0b2xpbmtlciBwZXJmb3JtIGl0cyBub3JtYWwgYW5jaG9yIHRhZyByZXBsYWNlbWVudCAoc2FtZSBhcyByZXR1cm5pbmcgYHRydWVgKVxyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgfVxyXG5cdCAqICAgICAgICAgICAgICAgICBcclxuXHQgKiAgICAgICAgICAgICAgICAgY2FzZSAndHdpdHRlcicgOlxyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgdmFyIHR3aXR0ZXJIYW5kbGUgPSBtYXRjaC5nZXRUd2l0dGVySGFuZGxlKCk7XHJcblx0ICogICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggdHdpdHRlckhhbmRsZSApO1xyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgXHJcblx0ICogICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxhIGhyZWY9XCJodHRwOi8vbmV3cGxhY2UudG8ubGluay50d2l0dGVyLmhhbmRsZXMudG8vXCI+JyArIHR3aXR0ZXJIYW5kbGUgKyAnPC9hPic7XHJcblx0ICogICAgICAgICAgICAgfVxyXG5cdCAqICAgICAgICAgfVxyXG5cdCAqICAgICB9ICk7XHJcblx0ICogXHJcblx0ICogXHJcblx0ICogVGhlIGZ1bmN0aW9uIG1heSByZXR1cm4gdGhlIGZvbGxvd2luZyB2YWx1ZXM6XHJcblx0ICogXHJcblx0ICogLSBgdHJ1ZWAgKEJvb2xlYW4pOiBBbGxvdyBBdXRvbGlua2VyIHRvIHJlcGxhY2UgdGhlIG1hdGNoIGFzIGl0IG5vcm1hbGx5IHdvdWxkLlxyXG5cdCAqIC0gYGZhbHNlYCAoQm9vbGVhbik6IERvIG5vdCByZXBsYWNlIHRoZSBjdXJyZW50IG1hdGNoIGF0IGFsbCAtIGxlYXZlIGFzLWlzLlxyXG5cdCAqIC0gQW55IFN0cmluZzogSWYgYSBzdHJpbmcgaXMgcmV0dXJuZWQgZnJvbSB0aGUgZnVuY3Rpb24sIHRoZSBzdHJpbmcgd2lsbCBiZSB1c2VkIGRpcmVjdGx5IGFzIHRoZSByZXBsYWNlbWVudCBIVE1MIGZvclxyXG5cdCAqICAgdGhlIG1hdGNoLlxyXG5cdCAqIC0gQW4ge0BsaW5rIEF1dG9saW5rZXIuSHRtbFRhZ30gaW5zdGFuY2UsIHdoaWNoIGNhbiBiZSB1c2VkIHRvIGJ1aWxkL21vZGlmeSBhbiBIVE1MIHRhZyBiZWZvcmUgd3JpdGluZyBvdXQgaXRzIEhUTUwgdGV4dC5cclxuXHQgKiBcclxuXHQgKiBAY29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gW2NvbmZpZ10gVGhlIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgdGhlIEF1dG9saW5rZXIgaW5zdGFuY2UsIHNwZWNpZmllZCBpbiBhbiBPYmplY3QgKG1hcCkuXHJcblx0ICovXHJcblx0dmFyIEF1dG9saW5rZXIgPSBmdW5jdGlvbiggY2ZnICkge1xyXG5cdFx0QXV0b2xpbmtlci5VdGlsLmFzc2lnbiggdGhpcywgY2ZnICk7ICAvLyBhc3NpZ24gdGhlIHByb3BlcnRpZXMgb2YgYGNmZ2Agb250byB0aGUgQXV0b2xpbmtlciBpbnN0YW5jZS4gUHJvdG90eXBlIHByb3BlcnRpZXMgd2lsbCBiZSB1c2VkIGZvciBtaXNzaW5nIGNvbmZpZ3MuXHJcblxyXG5cdFx0dGhpcy5tYXRjaFZhbGlkYXRvciA9IG5ldyBBdXRvbGlua2VyLk1hdGNoVmFsaWRhdG9yKCk7XHJcblx0fTtcclxuXHJcblxyXG5cdEF1dG9saW5rZXIucHJvdG90eXBlID0ge1xyXG5cdFx0Y29uc3RydWN0b3IgOiBBdXRvbGlua2VyLCAgLy8gZml4IGNvbnN0cnVjdG9yIHByb3BlcnR5XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAY2ZnIHtCb29sZWFufSB1cmxzXHJcblx0XHQgKiBcclxuXHRcdCAqIGB0cnVlYCBpZiBtaXNjZWxsYW5lb3VzIFVSTHMgc2hvdWxkIGJlIGF1dG9tYXRpY2FsbHkgbGlua2VkLCBgZmFsc2VgIGlmIHRoZXkgc2hvdWxkIG5vdCBiZS5cclxuXHRcdCAqL1xyXG5cdFx0dXJscyA6IHRydWUsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAY2ZnIHtCb29sZWFufSBlbWFpbFxyXG5cdFx0ICogXHJcblx0XHQgKiBgdHJ1ZWAgaWYgZW1haWwgYWRkcmVzc2VzIHNob3VsZCBiZSBhdXRvbWF0aWNhbGx5IGxpbmtlZCwgYGZhbHNlYCBpZiB0aGV5IHNob3VsZCBub3QgYmUuXHJcblx0XHQgKi9cclxuXHRcdGVtYWlsIDogdHJ1ZSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBjZmcge0Jvb2xlYW59IHR3aXR0ZXJcclxuXHRcdCAqIFxyXG5cdFx0ICogYHRydWVgIGlmIFR3aXR0ZXIgaGFuZGxlcyAoXCJAZXhhbXBsZVwiKSBzaG91bGQgYmUgYXV0b21hdGljYWxseSBsaW5rZWQsIGBmYWxzZWAgaWYgdGhleSBzaG91bGQgbm90IGJlLlxyXG5cdFx0ICovXHJcblx0XHR0d2l0dGVyIDogdHJ1ZSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBjZmcge0Jvb2xlYW59IG5ld1dpbmRvd1xyXG5cdFx0ICogXHJcblx0XHQgKiBgdHJ1ZWAgaWYgdGhlIGxpbmtzIHNob3VsZCBvcGVuIGluIGEgbmV3IHdpbmRvdywgYGZhbHNlYCBvdGhlcndpc2UuXHJcblx0XHQgKi9cclxuXHRcdG5ld1dpbmRvdyA6IHRydWUsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAY2ZnIHtCb29sZWFufSBzdHJpcFByZWZpeFxyXG5cdFx0ICogXHJcblx0XHQgKiBgdHJ1ZWAgaWYgJ2h0dHA6Ly8nIG9yICdodHRwczovLycgYW5kL29yIHRoZSAnd3d3Licgc2hvdWxkIGJlIHN0cmlwcGVkIGZyb20gdGhlIGJlZ2lubmluZyBvZiBVUkwgbGlua3MnIHRleHQsIFxyXG5cdFx0ICogYGZhbHNlYCBvdGhlcndpc2UuXHJcblx0XHQgKi9cclxuXHRcdHN0cmlwUHJlZml4IDogdHJ1ZSxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBjZmcge051bWJlcn0gdHJ1bmNhdGVcclxuXHRcdCAqIFxyXG5cdFx0ICogQSBudW1iZXIgZm9yIGhvdyBtYW55IGNoYXJhY3RlcnMgbG9uZyBVUkxzL2VtYWlscy90d2l0dGVyIGhhbmRsZXMgc2hvdWxkIGJlIHRydW5jYXRlZCB0byBpbnNpZGUgdGhlIHRleHQgb2YgXHJcblx0XHQgKiBhIGxpbmsuIElmIHRoZSBVUkwvZW1haWwvdHdpdHRlciBpcyBvdmVyIHRoaXMgbnVtYmVyIG9mIGNoYXJhY3RlcnMsIGl0IHdpbGwgYmUgdHJ1bmNhdGVkIHRvIHRoaXMgbGVuZ3RoIGJ5IFxyXG5cdFx0ICogYWRkaW5nIGEgdHdvIHBlcmlvZCBlbGxpcHNpcyAoJy4uJykgdG8gdGhlIGVuZCBvZiB0aGUgc3RyaW5nLlxyXG5cdFx0ICogXHJcblx0XHQgKiBGb3IgZXhhbXBsZTogQSB1cmwgbGlrZSAnaHR0cDovL3d3dy55YWhvby5jb20vc29tZS9sb25nL3BhdGgvdG8vYS9maWxlJyB0cnVuY2F0ZWQgdG8gMjUgY2hhcmFjdGVycyBtaWdodCBsb29rXHJcblx0XHQgKiBzb21ldGhpbmcgbGlrZSB0aGlzOiAneWFob28uY29tL3NvbWUvbG9uZy9wYXQuLidcclxuXHRcdCAqL1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQGNmZyB7U3RyaW5nfSBjbGFzc05hbWVcclxuXHRcdCAqIFxyXG5cdFx0ICogQSBDU1MgY2xhc3MgbmFtZSB0byBhZGQgdG8gdGhlIGdlbmVyYXRlZCBsaW5rcy4gVGhpcyBjbGFzcyB3aWxsIGJlIGFkZGVkIHRvIGFsbCBsaW5rcywgYXMgd2VsbCBhcyB0aGlzIGNsYXNzXHJcblx0XHQgKiBwbHVzIHVybC9lbWFpbC90d2l0dGVyIHN1ZmZpeGVzIGZvciBzdHlsaW5nIHVybC9lbWFpbC90d2l0dGVyIGxpbmtzIGRpZmZlcmVudGx5LlxyXG5cdFx0ICogXHJcblx0XHQgKiBGb3IgZXhhbXBsZSwgaWYgdGhpcyBjb25maWcgaXMgcHJvdmlkZWQgYXMgXCJteUxpbmtcIiwgdGhlbjpcclxuXHRcdCAqIFxyXG5cdFx0ICogLSBVUkwgbGlua3Mgd2lsbCBoYXZlIHRoZSBDU1MgY2xhc3NlczogXCJteUxpbmsgbXlMaW5rLXVybFwiXHJcblx0XHQgKiAtIEVtYWlsIGxpbmtzIHdpbGwgaGF2ZSB0aGUgQ1NTIGNsYXNzZXM6IFwibXlMaW5rIG15TGluay1lbWFpbFwiLCBhbmRcclxuXHRcdCAqIC0gVHdpdHRlciBsaW5rcyB3aWxsIGhhdmUgdGhlIENTUyBjbGFzc2VzOiBcIm15TGluayBteUxpbmstdHdpdHRlclwiXHJcblx0XHQgKi9cclxuXHRcdGNsYXNzTmFtZSA6IFwiXCIsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAY2ZnIHtGdW5jdGlvbn0gcmVwbGFjZUZuXHJcblx0XHQgKiBcclxuXHRcdCAqIEEgZnVuY3Rpb24gdG8gaW5kaXZpZHVhbGx5IHByb2Nlc3MgZWFjaCBVUkwvRW1haWwvVHdpdHRlciBtYXRjaCBmb3VuZCBpbiB0aGUgaW5wdXQgc3RyaW5nLlxyXG5cdFx0ICogXHJcblx0XHQgKiBTZWUgdGhlIGNsYXNzJ3MgZGVzY3JpcHRpb24gZm9yIHVzYWdlLlxyXG5cdFx0ICogXHJcblx0XHQgKiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIHRoZSBmb2xsb3dpbmcgcGFyYW1ldGVyczpcclxuXHRcdCAqIFxyXG5cdFx0ICogQGNmZyB7QXV0b2xpbmtlcn0gcmVwbGFjZUZuLmF1dG9saW5rZXIgVGhlIEF1dG9saW5rZXIgaW5zdGFuY2UsIHdoaWNoIG1heSBiZSB1c2VkIHRvIHJldHJpZXZlIGNoaWxkIG9iamVjdHMgZnJvbSAoc3VjaFxyXG5cdFx0ICogICBhcyB0aGUgaW5zdGFuY2UncyB7QGxpbmsgI2dldFRhZ0J1aWxkZXIgdGFnIGJ1aWxkZXJ9KS5cclxuXHRcdCAqIEBjZmcge0F1dG9saW5rZXIubWF0Y2guTWF0Y2h9IHJlcGxhY2VGbi5tYXRjaCBUaGUgTWF0Y2ggaW5zdGFuY2Ugd2hpY2ggY2FuIGJlIHVzZWQgdG8gcmV0cmlldmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlXHJcblx0XHQgKiAgIHtAbGluayBBdXRvbGlua2VyLm1hdGNoLlVybCBVUkx9L3tAbGluayBBdXRvbGlua2VyLm1hdGNoLkVtYWlsIGVtYWlsfS97QGxpbmsgQXV0b2xpbmtlci5tYXRjaC5Ud2l0dGVyIFR3aXR0ZXJ9XHJcblx0XHQgKiAgIG1hdGNoIHRoYXQgdGhlIGByZXBsYWNlRm5gIGlzIGN1cnJlbnRseSBwcm9jZXNzaW5nLlxyXG5cdFx0ICovXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBodG1sQ2hhcmFjdGVyRW50aXRpZXNSZWdleFxyXG5cdFx0ICpcclxuXHRcdCAqIFRoZSByZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIGNvbW1vbiBIVE1MIGNoYXJhY3RlciBlbnRpdGllcy5cclxuXHRcdCAqIFxyXG5cdFx0ICogSWdub3JpbmcgJmFtcDsgYXMgaXQgY291bGQgYmUgcGFydCBvZiBhIHF1ZXJ5IHN0cmluZyAtLSBoYW5kbGluZyBpdCBzZXBhcmF0ZWx5LlxyXG5cdFx0ICovXHJcblx0XHRodG1sQ2hhcmFjdGVyRW50aXRpZXNSZWdleDogLygmbmJzcDt8JiMxNjA7fCZsdDt8JiM2MDt8Jmd0O3wmIzYyO3wmcXVvdDt8JiMzNDt8JiMzOTspL2dpLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBtYXRjaGVyUmVnZXhcclxuXHRcdCAqIFxyXG5cdFx0ICogVGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgVVJMcywgZW1haWwgYWRkcmVzc2VzLCBhbmQgVHdpdHRlciBoYW5kbGVzLlxyXG5cdFx0ICogXHJcblx0XHQgKiBUaGlzIHJlZ3VsYXIgZXhwcmVzc2lvbiBoYXMgdGhlIGZvbGxvd2luZyBjYXB0dXJpbmcgZ3JvdXBzOlxyXG5cdFx0ICogXHJcblx0XHQgKiAxLiBHcm91cCB0aGF0IGlzIHVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZXJlIGlzIGEgVHdpdHRlciBoYW5kbGUgbWF0Y2ggKGkuZS4gXFxAc29tZVR3aXR0ZXJVc2VyKS4gU2ltcGx5IGNoZWNrIGZvciBpdHMgXHJcblx0XHQgKiAgICBleGlzdGVuY2UgdG8gZGV0ZXJtaW5lIGlmIHRoZXJlIGlzIGEgVHdpdHRlciBoYW5kbGUgbWF0Y2guIFRoZSBuZXh0IGNvdXBsZSBvZiBjYXB0dXJpbmcgZ3JvdXBzIGdpdmUgaW5mb3JtYXRpb24gXHJcblx0XHQgKiAgICBhYm91dCB0aGUgVHdpdHRlciBoYW5kbGUgbWF0Y2guXHJcblx0XHQgKiAyLiBUaGUgd2hpdGVzcGFjZSBjaGFyYWN0ZXIgYmVmb3JlIHRoZSBcXEBzaWduIGluIGEgVHdpdHRlciBoYW5kbGUuIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2UgdGhlcmUgYXJlIG5vIGxvb2tiZWhpbmRzIGluXHJcblx0XHQgKiAgICBKUyByZWd1bGFyIGV4cHJlc3Npb25zLCBhbmQgY2FuIGJlIHVzZWQgdG8gcmVjb25zdHJ1Y3QgdGhlIG9yaWdpbmFsIHN0cmluZyBpbiBhIHJlcGxhY2UoKS5cclxuXHRcdCAqIDMuIFRoZSBUd2l0dGVyIGhhbmRsZSBpdHNlbGYgaW4gYSBUd2l0dGVyIG1hdGNoLiBJZiB0aGUgbWF0Y2ggaXMgJ0Bzb21lVHdpdHRlclVzZXInLCB0aGUgaGFuZGxlIGlzICdzb21lVHdpdHRlclVzZXInLlxyXG5cdFx0ICogNC4gR3JvdXAgdGhhdCBtYXRjaGVzIGFuIGVtYWlsIGFkZHJlc3MuIFVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSBtYXRjaCBpcyBhbiBlbWFpbCBhZGRyZXNzLCBhcyB3ZWxsIGFzIGhvbGRpbmcgdGhlIGZ1bGwgXHJcblx0XHQgKiAgICBhZGRyZXNzLiBFeDogJ21lQG15LmNvbSdcclxuXHRcdCAqIDUuIEdyb3VwIHRoYXQgbWF0Y2hlcyBhIFVSTCBpbiB0aGUgaW5wdXQgdGV4dC4gRXg6ICdodHRwOi8vZ29vZ2xlLmNvbScsICd3d3cuZ29vZ2xlLmNvbScsIG9yIGp1c3QgJ2dvb2dsZS5jb20nLlxyXG5cdFx0ICogICAgVGhpcyBhbHNvIGluY2x1ZGVzIGEgcGF0aCwgdXJsIHBhcmFtZXRlcnMsIG9yIGhhc2ggYW5jaG9ycy4gRXg6IGdvb2dsZS5jb20vcGF0aC90by9maWxlP3ExPTEmcTI9MiNteUFuY2hvclxyXG5cdFx0ICogNi4gR3JvdXAgdGhhdCBtYXRjaGVzIGEgcHJvdG9jb2wgVVJMIChpLmUuICdodHRwOi8vZ29vZ2xlLmNvbScpLiBUaGlzIGlzIHVzZWQgdG8gbWF0Y2ggcHJvdG9jb2wgVVJMcyB3aXRoIGp1c3QgYSBzaW5nbGVcclxuXHRcdCAqICAgIHdvcmQsIGxpa2UgJ2h0dHA6Ly9sb2NhbGhvc3QnLCB3aGVyZSB3ZSB3b24ndCBkb3VibGUgY2hlY2sgdGhhdCB0aGUgZG9tYWluIG5hbWUgaGFzIGF0IGxlYXN0IG9uZSAnLicgaW4gaXQuXHJcblx0XHQgKiA3LiBBIHByb3RvY29sLXJlbGF0aXZlICgnLy8nKSBtYXRjaCBmb3IgdGhlIGNhc2Ugb2YgYSAnd3d3LicgcHJlZml4ZWQgVVJMLiBXaWxsIGJlIGFuIGVtcHR5IHN0cmluZyBpZiBpdCBpcyBub3QgYSBcclxuXHRcdCAqICAgIHByb3RvY29sLXJlbGF0aXZlIG1hdGNoLiBXZSBuZWVkIHRvIGtub3cgdGhlIGNoYXJhY3RlciBiZWZvcmUgdGhlICcvLycgaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIGlmIGl0IGlzIGEgdmFsaWQgbWF0Y2hcclxuXHRcdCAqICAgIG9yIHRoZSAvLyB3YXMgaW4gYSBzdHJpbmcgd2UgZG9uJ3Qgd2FudCB0byBhdXRvLWxpbmsuXHJcblx0XHQgKiA4LiBBIHByb3RvY29sLXJlbGF0aXZlICgnLy8nKSBtYXRjaCBmb3IgdGhlIGNhc2Ugb2YgYSBrbm93biBUTEQgcHJlZml4ZWQgVVJMLiBXaWxsIGJlIGFuIGVtcHR5IHN0cmluZyBpZiBpdCBpcyBub3QgYSBcclxuXHRcdCAqICAgIHByb3RvY29sLXJlbGF0aXZlIG1hdGNoLiBTZWUgIzYgZm9yIG1vcmUgaW5mby4gXHJcblx0XHQgKi9cclxuXHRcdG1hdGNoZXJSZWdleCA6IChmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyIHR3aXR0ZXJSZWdleCA9IC8oXnxbXlxcd10pQChcXHd7MSwxNX0pLywgICAgICAgICAgICAgIC8vIEZvciBtYXRjaGluZyBhIHR3aXR0ZXIgaGFuZGxlLiBFeDogQGdyZWdvcnlfamFjb2JzXHJcblxyXG5cdFx0XHQgICAgZW1haWxSZWdleCA9IC8oPzpbXFwtOzomPVxcK1xcJCxcXHdcXC5dK0ApLywgICAgICAgICAgICAgLy8gc29tZXRoaW5nQCBmb3IgZW1haWwgYWRkcmVzc2VzIChhLmsuYS4gbG9jYWwtcGFydClcclxuXHJcblx0XHRcdCAgICBwcm90b2NvbFJlZ2V4ID0gLyg/OltBLVphLXpdWy0uK0EtWmEtejAtOV0rOig/IVtBLVphLXpdWy0uK0EtWmEtejAtOV0rOlxcL1xcLykoPyFcXGQrXFwvPykoPzpcXC9cXC8pPykvLCAgLy8gbWF0Y2ggcHJvdG9jb2wsIGFsbG93IGluIGZvcm1hdCBcImh0dHA6Ly9cIiBvciBcIm1haWx0bzpcIi4gSG93ZXZlciwgZG8gbm90IG1hdGNoIHRoZSBmaXJzdCBwYXJ0IG9mIHNvbWV0aGluZyBsaWtlICdsaW5rOmh0dHA6Ly93d3cuZ29vZ2xlLmNvbScgKGkuZS4gZG9uJ3QgbWF0Y2ggXCJsaW5rOlwiKS4gQWxzbywgbWFrZSBzdXJlIHdlIGRvbid0IGludGVycHJldCAnZ29vZ2xlLmNvbTo4MDAwJyBhcyBpZiAnZ29vZ2xlLmNvbScgd2FzIGEgcHJvdG9jb2wgaGVyZSAoaS5lLiBpZ25vcmUgYSB0cmFpbGluZyBwb3J0IG51bWJlciBpbiB0aGlzIHJlZ2V4KVxyXG5cdFx0XHQgICAgd3d3UmVnZXggPSAvKD86d3d3XFwuKS8sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzdGFydGluZyB3aXRoICd3d3cuJ1xyXG5cdFx0XHQgICAgZG9tYWluTmFtZVJlZ2V4ID0gL1tBLVphLXowLTlcXC5cXC1dKltBLVphLXowLTlcXC1dLywgIC8vIGFueXRoaW5nIGxvb2tpbmcgYXQgYWxsIGxpa2UgYSBkb21haW4sIG5vbi11bmljb2RlIGRvbWFpbnMsIG5vdCBlbmRpbmcgaW4gYSBwZXJpb2RcclxuXHRcdFx0ICAgIHRsZFJlZ2V4ID0gL1xcLig/OmludGVybmF0aW9uYWx8Y29uc3RydWN0aW9ufGNvbnRyYWN0b3JzfGVudGVycHJpc2VzfHBob3RvZ3JhcGh5fHByb2R1Y3Rpb25zfGZvdW5kYXRpb258aW1tb2JpbGllbnxpbmR1c3RyaWVzfG1hbmFnZW1lbnR8cHJvcGVydGllc3x0ZWNobm9sb2d5fGNocmlzdG1hc3xjb21tdW5pdHl8ZGlyZWN0b3J5fGVkdWNhdGlvbnxlcXVpcG1lbnR8aW5zdGl0dXRlfG1hcmtldGluZ3xzb2x1dGlvbnN8dmFjYXRpb25zfGJhcmdhaW5zfGJvdXRpcXVlfGJ1aWxkZXJzfGNhdGVyaW5nfGNsZWFuaW5nfGNsb3RoaW5nfGNvbXB1dGVyfGRlbW9jcmF0fGRpYW1vbmRzfGdyYXBoaWNzfGhvbGRpbmdzfGxpZ2h0aW5nfHBhcnRuZXJzfHBsdW1iaW5nfHN1cHBsaWVzfHRyYWluaW5nfHZlbnR1cmVzfGFjYWRlbXl8Y2FyZWVyc3xjb21wYW55fGNydWlzZXN8ZG9tYWluc3xleHBvc2VkfGZsaWdodHN8ZmxvcmlzdHxnYWxsZXJ5fGd1aXRhcnN8aG9saWRheXxraXRjaGVufG5ldXN0YXJ8b2tpbmF3YXxyZWNpcGVzfHJlbnRhbHN8cmV2aWV3c3xzaGlrc2hhfHNpbmdsZXN8c3VwcG9ydHxzeXN0ZW1zfGFnZW5jeXxiZXJsaW58Y2FtZXJhfGNlbnRlcnxjb2ZmZWV8Y29uZG9zfGRhdGluZ3xlc3RhdGV8ZXZlbnRzfGV4cGVydHxmdXRib2x8a2F1ZmVufGx1eHVyeXxtYWlzb258bW9uYXNofG11c2V1bXxuYWdveWF8cGhvdG9zfHJlcGFpcnxyZXBvcnR8c29jaWFsfHN1cHBseXx0YXR0b298dGllbmRhfHRyYXZlbHx2aWFqZXN8dmlsbGFzfHZpc2lvbnx2b3Rpbmd8dm95YWdlfGFjdG9yfGJ1aWxkfGNhcmRzfGNoZWFwfGNvZGVzfGRhbmNlfGVtYWlsfGdsYXNzfGhvdXNlfG1hbmdvfG5pbmphfHBhcnRzfHBob3RvfHNob2VzfHNvbGFyfHRvZGF5fHRva3lvfHRvb2xzfHdhdGNofHdvcmtzfGFlcm98YXJwYXxhc2lhfGJlc3R8YmlrZXxibHVlfGJ1enp8Y2FtcHxjbHVifGNvb2x8Y29vcHxmYXJtfGZpc2h8Z2lmdHxndXJ1fGluZm98am9ic3xraXdpfGtyZWR8bGFuZHxsaW1vfGxpbmt8bWVudXxtb2JpfG1vZGF8bmFtZXxwaWNzfHBpbmt8cG9zdHxxcG9ufHJpY2h8cnVocnxzZXh5fHRpcHN8dm90ZXx2b3RvfHdhbmd8d2llbnx3aWtpfHpvbmV8YmFyfGJpZHxiaXp8Y2FifGNhdHxjZW98Y29tfGVkdXxnb3Z8aW50fGtpbXxtaWx8bmV0fG9ubHxvcmd8cHJvfHB1YnxyZWR8dGVsfHVub3x3ZWR8eHh4fHh5enxhY3xhZHxhZXxhZnxhZ3xhaXxhbHxhbXxhbnxhb3xhcXxhcnxhc3xhdHxhdXxhd3xheHxhenxiYXxiYnxiZHxiZXxiZnxiZ3xiaHxiaXxianxibXxibnxib3xicnxic3xidHxidnxid3xieXxienxjYXxjY3xjZHxjZnxjZ3xjaHxjaXxja3xjbHxjbXxjbnxjb3xjcnxjdXxjdnxjd3xjeHxjeXxjenxkZXxkanxka3xkbXxkb3xkenxlY3xlZXxlZ3xlcnxlc3xldHxldXxmaXxmanxma3xmbXxmb3xmcnxnYXxnYnxnZHxnZXxnZnxnZ3xnaHxnaXxnbHxnbXxnbnxncHxncXxncnxnc3xndHxndXxnd3xneXxoa3xobXxobnxocnxodHxodXxpZHxpZXxpbHxpbXxpbnxpb3xpcXxpcnxpc3xpdHxqZXxqbXxqb3xqcHxrZXxrZ3xraHxraXxrbXxrbnxrcHxrcnxrd3xreXxrenxsYXxsYnxsY3xsaXxsa3xscnxsc3xsdHxsdXxsdnxseXxtYXxtY3xtZHxtZXxtZ3xtaHxta3xtbHxtbXxtbnxtb3xtcHxtcXxtcnxtc3xtdHxtdXxtdnxtd3xteHxteXxtenxuYXxuY3xuZXxuZnxuZ3xuaXxubHxub3xucHxucnxudXxuenxvbXxwYXxwZXxwZnxwZ3xwaHxwa3xwbHxwbXxwbnxwcnxwc3xwdHxwd3xweXxxYXxyZXxyb3xyc3xydXxyd3xzYXxzYnxzY3xzZHxzZXxzZ3xzaHxzaXxzanxza3xzbHxzbXxzbnxzb3xzcnxzdHxzdXxzdnxzeHxzeXxzenx0Y3x0ZHx0Znx0Z3x0aHx0anx0a3x0bHx0bXx0bnx0b3x0cHx0cnx0dHx0dnx0d3x0enx1YXx1Z3x1a3x1c3x1eXx1enx2YXx2Y3x2ZXx2Z3x2aXx2bnx2dXx3Znx3c3x5ZXx5dHx6YXx6bXx6dylcXGIvLCAgIC8vIG1hdGNoIG91ciBrbm93biB0b3AgbGV2ZWwgZG9tYWlucyAoVExEcylcclxuXHJcblx0XHRcdCAgICAvLyBBbGxvdyBvcHRpb25hbCBwYXRoLCBxdWVyeSBzdHJpbmcsIGFuZCBoYXNoIGFuY2hvciwgbm90IGVuZGluZyBpbiB0aGUgZm9sbG93aW5nIGNoYXJhY3RlcnM6IFwiPyE6LC47XCJcclxuXHRcdFx0ICAgIC8vIGh0dHA6Ly9ibG9nLmNvZGluZ2hvcnJvci5jb20vdGhlLXByb2JsZW0td2l0aC11cmxzL1xyXG5cdFx0XHQgICAgdXJsU3VmZml4UmVnZXggPSAvW1xcLUEtWmEtejAtOSsmQCNcXC8lPX5fKCl8JyQqXFxbXFxdPyE6LC47XSpbXFwtQS1aYS16MC05KyZAI1xcLyU9fl8oKXwnJCpcXFtcXF1dLztcclxuXHJcblx0XHRcdHJldHVybiBuZXcgUmVnRXhwKCBbXHJcblx0XHRcdFx0JygnLCAgLy8gKioqIENhcHR1cmluZyBncm91cCAkMSwgd2hpY2ggY2FuIGJlIHVzZWQgdG8gY2hlY2sgZm9yIGEgdHdpdHRlciBoYW5kbGUgbWF0Y2guIFVzZSBncm91cCAkMyBmb3IgdGhlIGFjdHVhbCB0d2l0dGVyIGhhbmRsZSB0aG91Z2guICQyIG1heSBiZSB1c2VkIHRvIHJlY29uc3RydWN0IHRoZSBvcmlnaW5hbCBzdHJpbmcgaW4gYSByZXBsYWNlKCkgXHJcblx0XHRcdFx0XHQvLyAqKiogQ2FwdHVyaW5nIGdyb3VwICQyLCB3aGljaCBtYXRjaGVzIHRoZSB3aGl0ZXNwYWNlIGNoYXJhY3RlciBiZWZvcmUgdGhlICdAJyBzaWduIChuZWVkZWQgYmVjYXVzZSBvZiBubyBsb29rYmVoaW5kcyksIGFuZCBcclxuXHRcdFx0XHRcdC8vICoqKiBDYXB0dXJpbmcgZ3JvdXAgJDMsIHdoaWNoIG1hdGNoZXMgdGhlIGFjdHVhbCB0d2l0dGVyIGhhbmRsZVxyXG5cdFx0XHRcdFx0dHdpdHRlclJlZ2V4LnNvdXJjZSxcclxuXHRcdFx0XHQnKScsXHJcblxyXG5cdFx0XHRcdCd8JyxcclxuXHJcblx0XHRcdFx0JygnLCAgLy8gKioqIENhcHR1cmluZyBncm91cCAkNCwgd2hpY2ggaXMgdXNlZCB0byBkZXRlcm1pbmUgYW4gZW1haWwgbWF0Y2hcclxuXHRcdFx0XHRcdGVtYWlsUmVnZXguc291cmNlLFxyXG5cdFx0XHRcdFx0ZG9tYWluTmFtZVJlZ2V4LnNvdXJjZSxcclxuXHRcdFx0XHRcdHRsZFJlZ2V4LnNvdXJjZSxcclxuXHRcdFx0XHQnKScsXHJcblxyXG5cdFx0XHRcdCd8JyxcclxuXHJcblx0XHRcdFx0JygnLCAgLy8gKioqIENhcHR1cmluZyBncm91cCAkNSwgd2hpY2ggaXMgdXNlZCB0byBtYXRjaCBhIFVSTFxyXG5cdFx0XHRcdFx0Jyg/OicsIC8vIHBhcmVucyB0byBjb3ZlciBtYXRjaCBmb3IgcHJvdG9jb2wgKG9wdGlvbmFsKSwgYW5kIGRvbWFpblxyXG5cdFx0XHRcdFx0XHQnKCcsICAvLyAqKiogQ2FwdHVyaW5nIGdyb3VwICQ2LCBmb3IgYSBwcm90b2NvbC1wcmVmaXhlZCB1cmwgKGV4OiBodHRwOi8vZ29vZ2xlLmNvbSlcclxuXHRcdFx0XHRcdFx0XHRwcm90b2NvbFJlZ2V4LnNvdXJjZSxcclxuXHRcdFx0XHRcdFx0XHRkb21haW5OYW1lUmVnZXguc291cmNlLFxyXG5cdFx0XHRcdFx0XHQnKScsXHJcblxyXG5cdFx0XHRcdFx0XHQnfCcsXHJcblxyXG5cdFx0XHRcdFx0XHQnKD86JywgIC8vIG5vbi1jYXB0dXJpbmcgcGFyZW4gZm9yIGEgJ3d3dy4nIHByZWZpeGVkIHVybCAoZXg6IHd3dy5nb29nbGUuY29tKVxyXG5cdFx0XHRcdFx0XHRcdCcoLj8vLyk/JywgIC8vICoqKiBDYXB0dXJpbmcgZ3JvdXAgJDcgZm9yIGFuIG9wdGlvbmFsIHByb3RvY29sLXJlbGF0aXZlIFVSTC4gTXVzdCBiZSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzdHJpbmcgb3Igc3RhcnQgd2l0aCBhIG5vbi13b3JkIGNoYXJhY3RlclxyXG5cdFx0XHRcdFx0XHRcdHd3d1JlZ2V4LnNvdXJjZSxcclxuXHRcdFx0XHRcdFx0XHRkb21haW5OYW1lUmVnZXguc291cmNlLFxyXG5cdFx0XHRcdFx0XHQnKScsXHJcblxyXG5cdFx0XHRcdFx0XHQnfCcsXHJcblxyXG5cdFx0XHRcdFx0XHQnKD86JywgIC8vIG5vbi1jYXB0dXJpbmcgcGFyZW4gZm9yIGtub3duIGEgVExEIHVybCAoZXg6IGdvb2dsZS5jb20pXHJcblx0XHRcdFx0XHRcdFx0JyguPy8vKT8nLCAgLy8gKioqIENhcHR1cmluZyBncm91cCAkOCBmb3IgYW4gb3B0aW9uYWwgcHJvdG9jb2wtcmVsYXRpdmUgVVJMLiBNdXN0IGJlIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN0cmluZyBvciBzdGFydCB3aXRoIGEgbm9uLXdvcmQgY2hhcmFjdGVyXHJcblx0XHRcdFx0XHRcdFx0ZG9tYWluTmFtZVJlZ2V4LnNvdXJjZSxcclxuXHRcdFx0XHRcdFx0XHR0bGRSZWdleC5zb3VyY2UsXHJcblx0XHRcdFx0XHRcdCcpJyxcclxuXHRcdFx0XHRcdCcpJyxcclxuXHJcblx0XHRcdFx0XHQnKD86JyArIHVybFN1ZmZpeFJlZ2V4LnNvdXJjZSArICcpPycsICAvLyBtYXRjaCBmb3IgcGF0aCwgcXVlcnkgc3RyaW5nLCBhbmQvb3IgaGFzaCBhbmNob3IgLSBvcHRpb25hbFxyXG5cdFx0XHRcdCcpJ1xyXG5cdFx0XHRdLmpvaW4oIFwiXCIgKSwgJ2dpJyApO1xyXG5cdFx0fSApKCksXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICogQHByb3BlcnR5IHtSZWdFeHB9IGNoYXJCZWZvcmVQcm90b2NvbFJlbE1hdGNoUmVnZXhcclxuXHRcdCAqIFxyXG5cdFx0ICogVGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIHRvIHJldHJpZXZlIHRoZSBjaGFyYWN0ZXIgYmVmb3JlIGEgcHJvdG9jb2wtcmVsYXRpdmUgVVJMIG1hdGNoLlxyXG5cdFx0ICogXHJcblx0XHQgKiBUaGlzIGlzIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCB0aGUge0BsaW5rICNtYXRjaGVyUmVnZXh9LCB3aGljaCBuZWVkcyB0byBncmFiIHRoZSBjaGFyYWN0ZXIgYmVmb3JlIGEgcHJvdG9jb2wtcmVsYXRpdmVcclxuXHRcdCAqICcvLycgZHVlIHRvIHRoZSBsYWNrIG9mIGEgbmVnYXRpdmUgbG9vay1iZWhpbmQgaW4gSmF2YVNjcmlwdCByZWd1bGFyIGV4cHJlc3Npb25zLiBUaGUgY2hhcmFjdGVyIGJlZm9yZSB0aGUgbWF0Y2ggaXMgc3RyaXBwZWRcclxuXHRcdCAqIGZyb20gdGhlIFVSTC5cclxuXHRcdCAqL1xyXG5cdFx0Y2hhckJlZm9yZVByb3RvY29sUmVsTWF0Y2hSZWdleCA6IC9eKC4pP1xcL1xcLy8sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICogQHByb3BlcnR5IHtBdXRvbGlua2VyLk1hdGNoVmFsaWRhdG9yfSBtYXRjaFZhbGlkYXRvclxyXG5cdFx0ICogXHJcblx0XHQgKiBUaGUgTWF0Y2hWYWxpZGF0b3Igb2JqZWN0LCB1c2VkIHRvIGZpbHRlciBvdXQgYW55IGZhbHNlIHBvc2l0aXZlcyBmcm9tIHRoZSB7QGxpbmsgI21hdGNoZXJSZWdleH0uIFNlZVxyXG5cdFx0ICoge0BsaW5rIEF1dG9saW5rZXIuTWF0Y2hWYWxpZGF0b3J9IGZvciBkZXRhaWxzLlxyXG5cdFx0ICovXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICogQHByb3BlcnR5IHtBdXRvbGlua2VyLkh0bWxQYXJzZXJ9IGh0bWxQYXJzZXJcclxuXHRcdCAqIFxyXG5cdFx0ICogVGhlIEh0bWxQYXJzZXIgaW5zdGFuY2UgdXNlZCB0byBza2lwIG92ZXIgSFRNTCB0YWdzLCB3aGlsZSBmaW5kaW5nIHRleHQgbm9kZXMgdG8gcHJvY2Vzcy4gVGhpcyBpcyBsYXppbHkgaW5zdGFudGlhdGVkXHJcblx0XHQgKiBpbiB0aGUge0BsaW5rICNnZXRIdG1sUGFyc2VyfSBtZXRob2QuXHJcblx0XHQgKi9cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKiBAcHJvcGVydHkge0F1dG9saW5rZXIuQW5jaG9yVGFnQnVpbGRlcn0gdGFnQnVpbGRlclxyXG5cdFx0ICogXHJcblx0XHQgKiBUaGUgQW5jaG9yVGFnQnVpbGRlciBpbnN0YW5jZSB1c2VkIHRvIGJ1aWxkIHRoZSBVUkwvZW1haWwvVHdpdHRlciByZXBsYWNlbWVudCBhbmNob3IgdGFncy4gVGhpcyBpcyBsYXppbHkgaW5zdGFudGlhdGVkXHJcblx0XHQgKiBpbiB0aGUge0BsaW5rICNnZXRUYWdCdWlsZGVyfSBtZXRob2QuXHJcblx0XHQgKi9cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBdXRvbWF0aWNhbGx5IGxpbmtzIFVSTHMsIGVtYWlsIGFkZHJlc3NlcywgYW5kIFR3aXR0ZXIgaGFuZGxlcyBmb3VuZCBpbiB0aGUgZ2l2ZW4gY2h1bmsgb2YgSFRNTC4gXHJcblx0XHQgKiBEb2VzIG5vdCBsaW5rIFVSTHMgZm91bmQgd2l0aGluIEhUTUwgdGFncy5cclxuXHRcdCAqIFxyXG5cdFx0ICogRm9yIGluc3RhbmNlLCBpZiBnaXZlbiB0aGUgdGV4dDogYFlvdSBzaG91bGQgZ28gdG8gaHR0cDovL3d3dy55YWhvby5jb21gLCB0aGVuIHRoZSByZXN1bHRcclxuXHRcdCAqIHdpbGwgYmUgYFlvdSBzaG91bGQgZ28gdG8gJmx0O2EgaHJlZj1cImh0dHA6Ly93d3cueWFob28uY29tXCImZ3Q7aHR0cDovL3d3dy55YWhvby5jb20mbHQ7L2EmZ3Q7YFxyXG5cdFx0ICogXHJcblx0XHQgKiBUaGlzIG1ldGhvZCBmaW5kcyB0aGUgdGV4dCBhcm91bmQgYW55IEhUTUwgZWxlbWVudHMgaW4gdGhlIGlucHV0IGB0ZXh0T3JIdG1sYCwgd2hpY2ggd2lsbCBiZSB0aGUgdGV4dCB0aGF0IGlzIHByb2Nlc3NlZC5cclxuXHRcdCAqIEFueSBvcmlnaW5hbCBIVE1MIGVsZW1lbnRzIHdpbGwgYmUgbGVmdCBhcy1pcywgYXMgd2VsbCBhcyB0aGUgdGV4dCB0aGF0IGlzIGFscmVhZHkgd3JhcHBlZCBpbiBhbmNob3IgKCZsdDthJmd0OykgdGFncy5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IHRleHRPckh0bWwgVGhlIEhUTUwgb3IgdGV4dCB0byBsaW5rIFVSTHMsIGVtYWlsIGFkZHJlc3NlcywgYW5kIFR3aXR0ZXIgaGFuZGxlcyB3aXRoaW4gKGRlcGVuZGluZyBvbiBpZlxyXG5cdFx0ICogICB0aGUge0BsaW5rICN1cmxzfSwge0BsaW5rICNlbWFpbH0sIGFuZCB7QGxpbmsgI3R3aXR0ZXJ9IG9wdGlvbnMgYXJlIGVuYWJsZWQpLlxyXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfSBUaGUgSFRNTCwgd2l0aCBVUkxzL2VtYWlscy9Ud2l0dGVyIGhhbmRsZXMgYXV0b21hdGljYWxseSBsaW5rZWQuXHJcblx0XHQgKi9cclxuXHRcdGxpbmsgOiBmdW5jdGlvbiggdGV4dE9ySHRtbCApIHtcclxuXHRcdFx0dmFyIG1lID0gdGhpcywgIC8vIGZvciBjbG9zdXJlXHJcblx0XHRcdCAgICBodG1sUGFyc2VyID0gdGhpcy5nZXRIdG1sUGFyc2VyKCksXHJcblx0XHRcdCAgICBodG1sQ2hhcmFjdGVyRW50aXRpZXNSZWdleCA9IHRoaXMuaHRtbENoYXJhY3RlckVudGl0aWVzUmVnZXgsXHJcblx0XHRcdCAgICBhbmNob3JUYWdTdGFja0NvdW50ID0gMCwgIC8vIHVzZWQgdG8gb25seSBwcm9jZXNzIHRleHQgYXJvdW5kIGFuY2hvciB0YWdzLCBhbmQgYW55IGlubmVyIHRleHQvaHRtbCB0aGV5IG1heSBoYXZlXHJcblx0XHRcdCAgICByZXN1bHRIdG1sID0gW107XHJcblxyXG5cdFx0XHRodG1sUGFyc2VyLnBhcnNlKCB0ZXh0T3JIdG1sLCB7XHJcblx0XHRcdFx0Ly8gUHJvY2VzcyBIVE1MIG5vZGVzIGluIHRoZSBpbnB1dCBgdGV4dE9ySHRtbGBcclxuXHRcdFx0XHRwcm9jZXNzSHRtbE5vZGUgOiBmdW5jdGlvbiggdGFnVGV4dCwgdGFnTmFtZSwgaXNDbG9zaW5nVGFnICkge1xyXG5cdFx0XHRcdFx0aWYoIHRhZ05hbWUgPT09ICdhJyApIHtcclxuXHRcdFx0XHRcdFx0aWYoICFpc0Nsb3NpbmdUYWcgKSB7ICAvLyBpdCdzIHRoZSBzdGFydCA8YT4gdGFnXHJcblx0XHRcdFx0XHRcdFx0YW5jaG9yVGFnU3RhY2tDb3VudCsrO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2UgeyAgIC8vIGl0J3MgdGhlIGVuZCA8L2E+IHRhZ1xyXG5cdFx0XHRcdFx0XHRcdGFuY2hvclRhZ1N0YWNrQ291bnQgPSBNYXRoLm1heCggYW5jaG9yVGFnU3RhY2tDb3VudCAtIDEsIDAgKTsgIC8vIGF0dGVtcHQgdG8gaGFuZGxlIGV4dHJhbmVvdXMgPC9hPiB0YWdzIGJ5IG1ha2luZyBzdXJlIHRoZSBzdGFjayBjb3VudCBuZXZlciBnb2VzIGJlbG93IDBcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cmVzdWx0SHRtbC5wdXNoKCB0YWdUZXh0ICk7ICAvLyBub3cgYWRkIHRoZSB0ZXh0IG9mIHRoZSB0YWcgaXRzZWxmIHZlcmJhdGltXHJcblx0XHRcdFx0fSxcclxuXHJcblx0XHRcdFx0Ly8gUHJvY2VzcyB0ZXh0IG5vZGVzIGluIHRoZSBpbnB1dCBgdGV4dE9ySHRtbGBcclxuXHRcdFx0XHRwcm9jZXNzVGV4dE5vZGUgOiBmdW5jdGlvbiggdGV4dCApIHtcclxuXHRcdFx0XHRcdGlmKCBhbmNob3JUYWdTdGFja0NvdW50ID09PSAwICkge1xyXG5cdFx0XHRcdFx0XHQvLyBJZiB3ZSdyZSBub3Qgd2l0aGluIGFuIDxhPiB0YWcsIHByb2Nlc3MgdGhlIHRleHQgbm9kZVxyXG5cdFx0XHRcdFx0XHR2YXIgdW5lc2NhcGVkVGV4dCA9IEF1dG9saW5rZXIuVXRpbC5zcGxpdEFuZENhcHR1cmUoIHRleHQsIGh0bWxDaGFyYWN0ZXJFbnRpdGllc1JlZ2V4ICk7ICAvLyBzcGxpdCBhdCBIVE1MIGVudGl0aWVzLCBidXQgaW5jbHVkZSB0aGUgSFRNTCBlbnRpdGllcyBpbiB0aGUgcmVzdWx0cyBhcnJheVxyXG5cclxuXHRcdFx0XHRcdFx0Zm9yICggdmFyIGkgPSAwLCBsZW4gPSB1bmVzY2FwZWRUZXh0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrICkge1xyXG5cdFx0XHRcdFx0XHRcdHZhciB0ZXh0VG9Qcm9jZXNzID0gdW5lc2NhcGVkVGV4dFsgaSBdLFxyXG5cdFx0XHRcdFx0XHRcdCAgICBwcm9jZXNzZWRUZXh0Tm9kZSA9IG1lLnByb2Nlc3NUZXh0Tm9kZSggdGV4dFRvUHJvY2VzcyApO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRyZXN1bHRIdG1sLnB1c2goIHByb2Nlc3NlZFRleHROb2RlICk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHQvLyBgdGV4dGAgaXMgd2l0aGluIGFuIDxhPiB0YWcsIHNpbXBseSBhcHBlbmQgdGhlIHRleHQgLSB3ZSBkbyBub3Qgd2FudCB0byBhdXRvbGluayBhbnl0aGluZyBcclxuXHRcdFx0XHRcdFx0Ly8gYWxyZWFkeSB3aXRoaW4gYW4gPGE+Li4uPC9hPiB0YWdcclxuXHRcdFx0XHRcdFx0cmVzdWx0SHRtbC5wdXNoKCB0ZXh0ICk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9ICk7XHJcblxyXG5cdFx0XHRyZXR1cm4gcmVzdWx0SHRtbC5qb2luKCBcIlwiICk7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIExhemlseSBpbnN0YW50aWF0ZXMgYW5kIHJldHVybnMgdGhlIHtAbGluayAjaHRtbFBhcnNlcn0gaW5zdGFuY2UgZm9yIHRoaXMgQXV0b2xpbmtlciBpbnN0YW5jZS5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHByb3RlY3RlZFxyXG5cdFx0ICogQHJldHVybiB7QXV0b2xpbmtlci5IdG1sUGFyc2VyfVxyXG5cdFx0ICovXHJcblx0XHRnZXRIdG1sUGFyc2VyIDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBodG1sUGFyc2VyID0gdGhpcy5odG1sUGFyc2VyO1xyXG5cclxuXHRcdFx0aWYoICFodG1sUGFyc2VyICkge1xyXG5cdFx0XHRcdGh0bWxQYXJzZXIgPSB0aGlzLmh0bWxQYXJzZXIgPSBuZXcgQXV0b2xpbmtlci5IdG1sUGFyc2VyKCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBodG1sUGFyc2VyO1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZXR1cm5zIHRoZSB7QGxpbmsgI3RhZ0J1aWxkZXJ9IGluc3RhbmNlIGZvciB0aGlzIEF1dG9saW5rZXIgaW5zdGFuY2UsIGxhemlseSBpbnN0YW50aWF0aW5nIGl0XHJcblx0XHQgKiBpZiBpdCBkb2VzIG5vdCB5ZXQgZXhpc3QuXHJcblx0XHQgKiBcclxuXHRcdCAqIFRoaXMgbWV0aG9kIG1heSBiZSB1c2VkIGluIGEge0BsaW5rICNyZXBsYWNlRm59IHRvIGdlbmVyYXRlIHRoZSB7QGxpbmsgQXV0b2xpbmtlci5IdG1sVGFnIEh0bWxUYWd9IGluc3RhbmNlIHRoYXQgXHJcblx0XHQgKiBBdXRvbGlua2VyIHdvdWxkIG5vcm1hbGx5IGdlbmVyYXRlLCBhbmQgdGhlbiBhbGxvdyBmb3IgbW9kaWZpY2F0aW9ucyBiZWZvcmUgcmV0dXJuaW5nIGl0LiBGb3IgZXhhbXBsZTpcclxuXHRcdCAqIFxyXG5cdFx0ICogICAgIHZhciBodG1sID0gQXV0b2xpbmtlci5saW5rKCBcIlRlc3QgZ29vZ2xlLmNvbVwiLCB7XHJcblx0XHQgKiAgICAgICAgIHJlcGxhY2VGbiA6IGZ1bmN0aW9uKCBhdXRvbGlua2VyLCBtYXRjaCApIHtcclxuXHRcdCAqICAgICAgICAgICAgIHZhciB0YWcgPSBhdXRvbGlua2VyLmdldFRhZ0J1aWxkZXIoKS5idWlsZCggbWF0Y2ggKTsgIC8vIHJldHVybnMgYW4ge0BsaW5rIEF1dG9saW5rZXIuSHRtbFRhZ30gaW5zdGFuY2VcclxuXHRcdCAqICAgICAgICAgICAgIHRhZy5zZXRBdHRyKCAncmVsJywgJ25vZm9sbG93JyApO1xyXG5cdFx0ICogICAgICAgICAgICAgXHJcblx0XHQgKiAgICAgICAgICAgICByZXR1cm4gdGFnO1xyXG5cdFx0ICogICAgICAgICB9XHJcblx0XHQgKiAgICAgfSApO1xyXG5cdFx0ICogICAgIFxyXG5cdFx0ICogICAgIC8vIGdlbmVyYXRlZCBodG1sOlxyXG5cdFx0ICogICAgIC8vICAgVGVzdCA8YSBocmVmPVwiaHR0cDovL2dvb2dsZS5jb21cIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub2ZvbGxvd1wiPmdvb2dsZS5jb208L2E+XHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm4ge0F1dG9saW5rZXIuQW5jaG9yVGFnQnVpbGRlcn1cclxuXHRcdCAqL1xyXG5cdFx0Z2V0VGFnQnVpbGRlciA6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YXIgdGFnQnVpbGRlciA9IHRoaXMudGFnQnVpbGRlcjtcclxuXHJcblx0XHRcdGlmKCAhdGFnQnVpbGRlciApIHtcclxuXHRcdFx0XHR0YWdCdWlsZGVyID0gdGhpcy50YWdCdWlsZGVyID0gbmV3IEF1dG9saW5rZXIuQW5jaG9yVGFnQnVpbGRlcigge1xyXG5cdFx0XHRcdFx0bmV3V2luZG93ICAgOiB0aGlzLm5ld1dpbmRvdyxcclxuXHRcdFx0XHRcdHRydW5jYXRlICAgIDogdGhpcy50cnVuY2F0ZSxcclxuXHRcdFx0XHRcdGNsYXNzTmFtZSAgIDogdGhpcy5jbGFzc05hbWVcclxuXHRcdFx0XHR9ICk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiB0YWdCdWlsZGVyO1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBQcm9jZXNzIHRoZSB0ZXh0IHRoYXQgbGllcyBpbmJldHdlZW4gSFRNTCB0YWdzLiBUaGlzIG1ldGhvZCBkb2VzIHRoZSBhY3R1YWwgd3JhcHBpbmcgb2YgVVJMcyB3aXRoXHJcblx0XHQgKiBhbmNob3IgdGFncy5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IFRoZSB0ZXh0IHRvIGF1dG8tbGluay5cclxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ30gVGhlIHRleHQgd2l0aCBhbmNob3IgdGFncyBhdXRvLWZpbGxlZC5cclxuXHRcdCAqL1xyXG5cdFx0cHJvY2Vzc1RleHROb2RlIDogZnVuY3Rpb24oIHRleHQgKSB7XHJcblx0XHRcdHZhciBtZSA9IHRoaXM7ICAvLyBmb3IgY2xvc3VyZVxyXG5cclxuXHRcdFx0cmV0dXJuIHRleHQucmVwbGFjZSggdGhpcy5tYXRjaGVyUmVnZXgsIGZ1bmN0aW9uKCBtYXRjaFN0ciwgJDEsICQyLCAkMywgJDQsICQ1LCAkNiwgJDcsICQ4ICkge1xyXG5cdFx0XHRcdHZhciBtYXRjaERlc2NPYmogPSBtZS5wcm9jZXNzQ2FuZGlkYXRlTWF0Y2goIG1hdGNoU3RyLCAkMSwgJDIsICQzLCAkNCwgJDUsICQ2LCAkNywgJDggKTsgIC8vIG1hdGNoIGRlc2NyaXB0aW9uIG9iamVjdFxyXG5cclxuXHRcdFx0XHQvLyBSZXR1cm4gb3V0IHdpdGggbm8gY2hhbmdlcyBmb3IgbWF0Y2ggdHlwZXMgdGhhdCBhcmUgZGlzYWJsZWQgKHVybCwgZW1haWwsIHR3aXR0ZXIpLCBvciBmb3IgbWF0Y2hlcyB0aGF0IGFyZSBcclxuXHRcdFx0XHQvLyBpbnZhbGlkIChmYWxzZSBwb3NpdGl2ZXMgZnJvbSB0aGUgbWF0Y2hlclJlZ2V4LCB3aGljaCBjYW4ndCB1c2UgbG9vay1iZWhpbmRzIHNpbmNlIHRoZXkgYXJlIHVuYXZhaWxhYmxlIGluIEpTKS5cclxuXHRcdFx0XHRpZiggIW1hdGNoRGVzY09iaiApIHtcclxuXHRcdFx0XHRcdHJldHVybiBtYXRjaFN0cjtcclxuXHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIEdlbmVyYXRlIHRoZSByZXBsYWNlbWVudCB0ZXh0IGZvciB0aGUgbWF0Y2hcclxuXHRcdFx0XHRcdHZhciBtYXRjaFJldHVyblZhbCA9IG1lLmNyZWF0ZU1hdGNoUmV0dXJuVmFsKCBtYXRjaERlc2NPYmoubWF0Y2gsIG1hdGNoRGVzY09iai5tYXRjaFN0ciApO1xyXG5cdFx0XHRcdFx0cmV0dXJuIG1hdGNoRGVzY09iai5wcmVmaXhTdHIgKyBtYXRjaFJldHVyblZhbCArIG1hdGNoRGVzY09iai5zdWZmaXhTdHI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9ICk7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFByb2Nlc3NlcyBhIGNhbmRpZGF0ZSBtYXRjaCBmcm9tIHRoZSB7QGxpbmsgI21hdGNoZXJSZWdleH0uIFxyXG5cdFx0ICogXHJcblx0XHQgKiBOb3QgYWxsIG1hdGNoZXMgZm91bmQgYnkgdGhlIHJlZ2V4IGFyZSBhY3R1YWwgVVJML2VtYWlsL1R3aXR0ZXIgbWF0Y2hlcywgYXMgZGV0ZXJtaW5lZCBieSB0aGUge0BsaW5rICNtYXRjaFZhbGlkYXRvcn0uIEluXHJcblx0XHQgKiB0aGlzIGNhc2UsIHRoZSBtZXRob2QgcmV0dXJucyBgbnVsbGAuIE90aGVyd2lzZSwgYSB2YWxpZCBPYmplY3Qgd2l0aCBgcHJlZml4U3RyYCwgYG1hdGNoYCwgYW5kIGBzdWZmaXhTdHJgIGlzIHJldHVybmVkLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IG1hdGNoU3RyIFRoZSBmdWxsIG1hdGNoIHRoYXQgd2FzIGZvdW5kIGJ5IHRoZSB7QGxpbmsgI21hdGNoZXJSZWdleH0uXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gdHdpdHRlck1hdGNoIFRoZSBtYXRjaGVkIHRleHQgb2YgYSBUd2l0dGVyIGhhbmRsZSwgaWYgdGhlIG1hdGNoIGlzIGEgVHdpdHRlciBtYXRjaC5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSB0d2l0dGVySGFuZGxlUHJlZml4V2hpdGVzcGFjZUNoYXIgVGhlIHdoaXRlc3BhY2UgY2hhciBiZWZvcmUgdGhlIEAgc2lnbiBpbiBhIFR3aXR0ZXIgaGFuZGxlIG1hdGNoLiBUaGlzIFxyXG5cdFx0ICogICBpcyBuZWVkZWQgYmVjYXVzZSBvZiBubyBsb29rYmVoaW5kcyBpbiBKUyByZWdleGVzLCBhbmQgaXMgbmVlZCB0byByZS1pbmNsdWRlIHRoZSBjaGFyYWN0ZXIgZm9yIHRoZSBhbmNob3IgdGFnIHJlcGxhY2VtZW50LlxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IHR3aXR0ZXJIYW5kbGUgVGhlIGFjdHVhbCBUd2l0dGVyIHVzZXIgKGkuZSB0aGUgd29yZCBhZnRlciB0aGUgQCBzaWduIGluIGEgVHdpdHRlciBtYXRjaCkuXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gZW1haWxBZGRyZXNzTWF0Y2ggVGhlIG1hdGNoZWQgZW1haWwgYWRkcmVzcyBmb3IgYW4gZW1haWwgYWRkcmVzcyBtYXRjaC5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSB1cmxNYXRjaCBUaGUgbWF0Y2hlZCBVUkwgc3RyaW5nIGZvciBhIFVSTCBtYXRjaC5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBwcm90b2NvbFVybE1hdGNoIFRoZSBtYXRjaCBVUkwgc3RyaW5nIGZvciBhIHByb3RvY29sIG1hdGNoLiBFeDogJ2h0dHA6Ly95YWhvby5jb20nLiBUaGlzIGlzIHVzZWQgdG8gbWF0Y2hcclxuXHRcdCAqICAgc29tZXRoaW5nIGxpa2UgJ2h0dHA6Ly9sb2NhbGhvc3QnLCB3aGVyZSB3ZSB3b24ndCBkb3VibGUgY2hlY2sgdGhhdCB0aGUgZG9tYWluIG5hbWUgaGFzIGF0IGxlYXN0IG9uZSAnLicgaW4gaXQuXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gd3d3UHJvdG9jb2xSZWxhdGl2ZU1hdGNoIFRoZSAnLy8nIGZvciBhIHByb3RvY29sLXJlbGF0aXZlIG1hdGNoIGZyb20gYSAnd3d3JyB1cmwsIHdpdGggdGhlIGNoYXJhY3RlciB0aGF0IFxyXG5cdFx0ICogICBjb21lcyBiZWZvcmUgdGhlICcvLycuXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gdGxkUHJvdG9jb2xSZWxhdGl2ZU1hdGNoIFRoZSAnLy8nIGZvciBhIHByb3RvY29sLXJlbGF0aXZlIG1hdGNoIGZyb20gYSBUTEQgKHRvcCBsZXZlbCBkb21haW4pIG1hdGNoLCB3aXRoIFxyXG5cdFx0ICogICB0aGUgY2hhcmFjdGVyIHRoYXQgY29tZXMgYmVmb3JlIHRoZSAnLy8nLlxyXG5cdFx0ICogICBcclxuXHRcdCAqIEByZXR1cm4ge09iamVjdH0gQSBcIm1hdGNoIGRlc2NyaXB0aW9uIG9iamVjdFwiLiBUaGlzIHdpbGwgYmUgYG51bGxgIGlmIHRoZSBtYXRjaCB3YXMgaW52YWxpZCwgb3IgaWYgYSBtYXRjaCB0eXBlIGlzIGRpc2FibGVkLlxyXG5cdFx0ICogICBPdGhlcndpc2UsIHRoaXMgd2lsbCBiZSBhbiBPYmplY3QgKG1hcCkgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XHJcblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9IHJldHVybi5wcmVmaXhTdHIgVGhlIGNoYXIocykgdGhhdCBzaG91bGQgYmUgcHJlcGVuZGVkIHRvIHRoZSByZXBsYWNlbWVudCBzdHJpbmcuIFRoZXNlIGFyZSBjaGFyKHMpIHRoYXRcclxuXHRcdCAqICAgd2VyZSBuZWVkZWQgdG8gYmUgaW5jbHVkZWQgZnJvbSB0aGUgcmVnZXggbWF0Y2ggdGhhdCB3ZXJlIGlnbm9yZWQgYnkgcHJvY2Vzc2luZyBjb2RlLCBhbmQgc2hvdWxkIGJlIHJlLWluc2VydGVkIGludG8gXHJcblx0XHQgKiAgIHRoZSByZXBsYWNlbWVudCBzdHJlYW0uXHJcblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9IHJldHVybi5zdWZmaXhTdHIgVGhlIGNoYXIocykgdGhhdCBzaG91bGQgYmUgYXBwZW5kZWQgdG8gdGhlIHJlcGxhY2VtZW50IHN0cmluZy4gVGhlc2UgYXJlIGNoYXIocykgdGhhdFxyXG5cdFx0ICogICB3ZXJlIG5lZWRlZCB0byBiZSBpbmNsdWRlZCBmcm9tIHRoZSByZWdleCBtYXRjaCB0aGF0IHdlcmUgaWdub3JlZCBieSBwcm9jZXNzaW5nIGNvZGUsIGFuZCBzaG91bGQgYmUgcmUtaW5zZXJ0ZWQgaW50byBcclxuXHRcdCAqICAgdGhlIHJlcGxhY2VtZW50IHN0cmVhbS5cclxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ30gcmV0dXJuLm1hdGNoU3RyIFRoZSBgbWF0Y2hTdHJgLCBmaXhlZCB1cCB0byByZW1vdmUgY2hhcmFjdGVycyB0aGF0IGFyZSBubyBsb25nZXIgbmVlZGVkICh3aGljaCBoYXZlIGJlZW5cclxuXHRcdCAqICAgYWRkZWQgdG8gYHByZWZpeFN0cmAgYW5kIGBzdWZmaXhTdHJgKS5cclxuXHRcdCAqIEByZXR1cm4ge0F1dG9saW5rZXIubWF0Y2guTWF0Y2h9IHJldHVybi5tYXRjaCBUaGUgTWF0Y2ggb2JqZWN0IHRoYXQgcmVwcmVzZW50cyB0aGUgbWF0Y2ggdGhhdCB3YXMgZm91bmQuXHJcblx0XHQgKi9cclxuXHRcdHByb2Nlc3NDYW5kaWRhdGVNYXRjaCA6IGZ1bmN0aW9uKCBcclxuXHRcdFx0bWF0Y2hTdHIsIHR3aXR0ZXJNYXRjaCwgdHdpdHRlckhhbmRsZVByZWZpeFdoaXRlc3BhY2VDaGFyLCB0d2l0dGVySGFuZGxlLCBcclxuXHRcdFx0ZW1haWxBZGRyZXNzTWF0Y2gsIHVybE1hdGNoLCBwcm90b2NvbFVybE1hdGNoLCB3d3dQcm90b2NvbFJlbGF0aXZlTWF0Y2gsIHRsZFByb3RvY29sUmVsYXRpdmVNYXRjaFxyXG5cdFx0KSB7XHJcblx0XHRcdHZhciBwcm90b2NvbFJlbGF0aXZlTWF0Y2ggPSB3d3dQcm90b2NvbFJlbGF0aXZlTWF0Y2ggfHwgdGxkUHJvdG9jb2xSZWxhdGl2ZU1hdGNoLFxyXG5cdFx0XHQgICAgbWF0Y2gsICAvLyBXaWxsIGJlIGFuIEF1dG9saW5rZXIubWF0Y2guTWF0Y2ggb2JqZWN0XHJcblxyXG5cdFx0XHQgICAgcHJlZml4U3RyID0gXCJcIiwgICAgICAgLy8gQSBzdHJpbmcgdG8gdXNlIHRvIHByZWZpeCB0aGUgYW5jaG9yIHRhZyB0aGF0IGlzIGNyZWF0ZWQuIFRoaXMgaXMgbmVlZGVkIGZvciB0aGUgVHdpdHRlciBoYW5kbGUgbWF0Y2hcclxuXHRcdFx0ICAgIHN1ZmZpeFN0ciA9IFwiXCI7ICAgICAgIC8vIEEgc3RyaW5nIHRvIHN1ZmZpeCB0aGUgYW5jaG9yIHRhZyB0aGF0IGlzIGNyZWF0ZWQuIFRoaXMgaXMgdXNlZCBpZiB0aGVyZSBpcyBhIHRyYWlsaW5nIHBhcmVudGhlc2lzIHRoYXQgc2hvdWxkIG5vdCBiZSBhdXRvLWxpbmtlZC5cclxuXHJcblxyXG5cdFx0XHQvLyBSZXR1cm4gb3V0IHdpdGggYG51bGxgIGZvciBtYXRjaCB0eXBlcyB0aGF0IGFyZSBkaXNhYmxlZCAodXJsLCBlbWFpbCwgdHdpdHRlciksIG9yIGZvciBtYXRjaGVzIHRoYXQgYXJlIFxyXG5cdFx0XHQvLyBpbnZhbGlkIChmYWxzZSBwb3NpdGl2ZXMgZnJvbSB0aGUgbWF0Y2hlclJlZ2V4LCB3aGljaCBjYW4ndCB1c2UgbG9vay1iZWhpbmRzIHNpbmNlIHRoZXkgYXJlIHVuYXZhaWxhYmxlIGluIEpTKS5cclxuXHRcdFx0aWYoXHJcblx0XHRcdFx0KCB0d2l0dGVyTWF0Y2ggJiYgIXRoaXMudHdpdHRlciApIHx8ICggZW1haWxBZGRyZXNzTWF0Y2ggJiYgIXRoaXMuZW1haWwgKSB8fCAoIHVybE1hdGNoICYmICF0aGlzLnVybHMgKSB8fFxyXG5cdFx0XHRcdCF0aGlzLm1hdGNoVmFsaWRhdG9yLmlzVmFsaWRNYXRjaCggdXJsTWF0Y2gsIHByb3RvY29sVXJsTWF0Y2gsIHByb3RvY29sUmVsYXRpdmVNYXRjaCApIFxyXG5cdFx0XHQpIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gSGFuZGxlIGEgY2xvc2luZyBwYXJlbnRoZXNpcyBhdCB0aGUgZW5kIG9mIHRoZSBtYXRjaCwgYW5kIGV4Y2x1ZGUgaXQgaWYgdGhlcmUgaXMgbm90IGEgbWF0Y2hpbmcgb3BlbiBwYXJlbnRoZXNpc1xyXG5cdFx0XHQvLyBpbiB0aGUgbWF0Y2ggaXRzZWxmLiBcclxuXHRcdFx0aWYoIHRoaXMubWF0Y2hIYXNVbmJhbGFuY2VkQ2xvc2luZ1BhcmVuKCBtYXRjaFN0ciApICkge1xyXG5cdFx0XHRcdG1hdGNoU3RyID0gbWF0Y2hTdHIuc3Vic3RyKCAwLCBtYXRjaFN0ci5sZW5ndGggLSAxICk7ICAvLyByZW1vdmUgdGhlIHRyYWlsaW5nIFwiKVwiXHJcblx0XHRcdFx0c3VmZml4U3RyID0gXCIpXCI7ICAvLyB0aGlzIHdpbGwgYmUgYWRkZWQgYWZ0ZXIgdGhlIGdlbmVyYXRlZCA8YT4gdGFnXHJcblx0XHRcdH1cclxuXHJcblxyXG5cdFx0XHRpZiggZW1haWxBZGRyZXNzTWF0Y2ggKSB7XHJcblx0XHRcdFx0bWF0Y2ggPSBuZXcgQXV0b2xpbmtlci5tYXRjaC5FbWFpbCggeyBtYXRjaGVkVGV4dDogbWF0Y2hTdHIsIGVtYWlsOiBlbWFpbEFkZHJlc3NNYXRjaCB9ICk7XHJcblxyXG5cdFx0XHR9IGVsc2UgaWYoIHR3aXR0ZXJNYXRjaCApIHtcclxuXHRcdFx0XHQvLyBmaXggdXAgdGhlIGBtYXRjaFN0cmAgaWYgdGhlcmUgd2FzIGEgcHJlY2VkaW5nIHdoaXRlc3BhY2UgY2hhciwgd2hpY2ggd2FzIG5lZWRlZCB0byBkZXRlcm1pbmUgdGhlIG1hdGNoIFxyXG5cdFx0XHRcdC8vIGl0c2VsZiAoc2luY2UgdGhlcmUgYXJlIG5vIGxvb2stYmVoaW5kcyBpbiBKUyByZWdleGVzKVxyXG5cdFx0XHRcdGlmKCB0d2l0dGVySGFuZGxlUHJlZml4V2hpdGVzcGFjZUNoYXIgKSB7XHJcblx0XHRcdFx0XHRwcmVmaXhTdHIgPSB0d2l0dGVySGFuZGxlUHJlZml4V2hpdGVzcGFjZUNoYXI7XHJcblx0XHRcdFx0XHRtYXRjaFN0ciA9IG1hdGNoU3RyLnNsaWNlKCAxICk7ICAvLyByZW1vdmUgdGhlIHByZWZpeGVkIHdoaXRlc3BhY2UgY2hhciBmcm9tIHRoZSBtYXRjaFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRtYXRjaCA9IG5ldyBBdXRvbGlua2VyLm1hdGNoLlR3aXR0ZXIoIHsgbWF0Y2hlZFRleHQ6IG1hdGNoU3RyLCB0d2l0dGVySGFuZGxlOiB0d2l0dGVySGFuZGxlIH0gKTtcclxuXHJcblx0XHRcdH0gZWxzZSB7ICAvLyB1cmwgbWF0Y2hcclxuXHRcdFx0XHQvLyBJZiBpdCdzIGEgcHJvdG9jb2wtcmVsYXRpdmUgJy8vJyBtYXRjaCwgcmVtb3ZlIHRoZSBjaGFyYWN0ZXIgYmVmb3JlIHRoZSAnLy8nICh3aGljaCB0aGUgbWF0Y2hlclJlZ2V4IG5lZWRlZFxyXG5cdFx0XHRcdC8vIHRvIG1hdGNoIGR1ZSB0byB0aGUgbGFjayBvZiBhIG5lZ2F0aXZlIGxvb2stYmVoaW5kIGluIEphdmFTY3JpcHQgcmVndWxhciBleHByZXNzaW9ucylcclxuXHRcdFx0XHRpZiggcHJvdG9jb2xSZWxhdGl2ZU1hdGNoICkge1xyXG5cdFx0XHRcdFx0dmFyIGNoYXJCZWZvcmVNYXRjaCA9IHByb3RvY29sUmVsYXRpdmVNYXRjaC5tYXRjaCggdGhpcy5jaGFyQmVmb3JlUHJvdG9jb2xSZWxNYXRjaFJlZ2V4IClbIDEgXSB8fCBcIlwiO1xyXG5cclxuXHRcdFx0XHRcdGlmKCBjaGFyQmVmb3JlTWF0Y2ggKSB7ICAvLyBmaXggdXAgdGhlIGBtYXRjaFN0cmAgaWYgdGhlcmUgd2FzIGEgcHJlY2VkaW5nIGNoYXIgYmVmb3JlIGEgcHJvdG9jb2wtcmVsYXRpdmUgbWF0Y2gsIHdoaWNoIHdhcyBuZWVkZWQgdG8gZGV0ZXJtaW5lIHRoZSBtYXRjaCBpdHNlbGYgKHNpbmNlIHRoZXJlIGFyZSBubyBsb29rLWJlaGluZHMgaW4gSlMgcmVnZXhlcylcclxuXHRcdFx0XHRcdFx0cHJlZml4U3RyID0gY2hhckJlZm9yZU1hdGNoO1xyXG5cdFx0XHRcdFx0XHRtYXRjaFN0ciA9IG1hdGNoU3RyLnNsaWNlKCAxICk7ICAvLyByZW1vdmUgdGhlIHByZWZpeGVkIGNoYXIgZnJvbSB0aGUgbWF0Y2hcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdG1hdGNoID0gbmV3IEF1dG9saW5rZXIubWF0Y2guVXJsKCB7XHJcblx0XHRcdFx0XHRtYXRjaGVkVGV4dCA6IG1hdGNoU3RyLFxyXG5cdFx0XHRcdFx0dXJsIDogbWF0Y2hTdHIsXHJcblx0XHRcdFx0XHRwcm90b2NvbFVybE1hdGNoIDogISFwcm90b2NvbFVybE1hdGNoLFxyXG5cdFx0XHRcdFx0cHJvdG9jb2xSZWxhdGl2ZU1hdGNoIDogISFwcm90b2NvbFJlbGF0aXZlTWF0Y2gsXHJcblx0XHRcdFx0XHRzdHJpcFByZWZpeCA6IHRoaXMuc3RyaXBQcmVmaXhcclxuXHRcdFx0XHR9ICk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0cHJlZml4U3RyIDogcHJlZml4U3RyLFxyXG5cdFx0XHRcdHN1ZmZpeFN0ciA6IHN1ZmZpeFN0cixcclxuXHRcdFx0XHRtYXRjaFN0ciAgOiBtYXRjaFN0cixcclxuXHRcdFx0XHRtYXRjaCAgICAgOiBtYXRjaFxyXG5cdFx0XHR9O1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBEZXRlcm1pbmVzIGlmIGEgbWF0Y2ggZm91bmQgaGFzIGFuIHVubWF0Y2hlZCBjbG9zaW5nIHBhcmVudGhlc2lzLiBJZiBzbywgdGhpcyBwYXJlbnRoZXNpcyB3aWxsIGJlIHJlbW92ZWRcclxuXHRcdCAqIGZyb20gdGhlIG1hdGNoIGl0c2VsZiwgYW5kIGFwcGVuZGVkIGFmdGVyIHRoZSBnZW5lcmF0ZWQgYW5jaG9yIHRhZyBpbiB7QGxpbmsgI3Byb2Nlc3NUZXh0Tm9kZX0uXHJcblx0XHQgKiBcclxuXHRcdCAqIEEgbWF0Y2ggbWF5IGhhdmUgYW4gZXh0cmEgY2xvc2luZyBwYXJlbnRoZXNpcyBhdCB0aGUgZW5kIG9mIHRoZSBtYXRjaCBiZWNhdXNlIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gbXVzdCBpbmNsdWRlIHBhcmVudGhlc2lzXHJcblx0XHQgKiBmb3IgVVJMcyBzdWNoIGFzIFwid2lraXBlZGlhLmNvbS9zb21ldGhpbmdfKGRpc2FtYmlndWF0aW9uKVwiLCB3aGljaCBzaG91bGQgYmUgYXV0by1saW5rZWQuIFxyXG5cdFx0ICogXHJcblx0XHQgKiBIb3dldmVyLCBhbiBleHRyYSBwYXJlbnRoZXNpcyAqd2lsbCogYmUgaW5jbHVkZWQgd2hlbiB0aGUgVVJMIGl0c2VsZiBpcyB3cmFwcGVkIGluIHBhcmVudGhlc2lzLCBzdWNoIGFzIGluIHRoZSBjYXNlIG9mXHJcblx0XHQgKiBcIih3aWtpcGVkaWEuY29tL3NvbWV0aGluZ18oZGlzYW1iaWd1YXRpb24pKVwiLiBJbiB0aGlzIGNhc2UsIHRoZSBsYXN0IGNsb3NpbmcgcGFyZW50aGVzaXMgc2hvdWxkICpub3QqIGJlIHBhcnQgb2YgdGhlIFVSTCBcclxuXHRcdCAqIGl0c2VsZiwgYW5kIHRoaXMgbWV0aG9kIHdpbGwgcmV0dXJuIGB0cnVlYC5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBtYXRjaFN0ciBUaGUgZnVsbCBtYXRjaCBzdHJpbmcgZnJvbSB0aGUge0BsaW5rICNtYXRjaGVyUmVnZXh9LlxyXG5cdFx0ICogQHJldHVybiB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZXJlIGlzIGFuIHVuYmFsYW5jZWQgY2xvc2luZyBwYXJlbnRoZXNpcyBhdCB0aGUgZW5kIG9mIHRoZSBgbWF0Y2hTdHJgLCBgZmFsc2VgIG90aGVyd2lzZS5cclxuXHRcdCAqL1xyXG5cdFx0bWF0Y2hIYXNVbmJhbGFuY2VkQ2xvc2luZ1BhcmVuIDogZnVuY3Rpb24oIG1hdGNoU3RyICkge1xyXG5cdFx0XHR2YXIgbGFzdENoYXIgPSBtYXRjaFN0ci5jaGFyQXQoIG1hdGNoU3RyLmxlbmd0aCAtIDEgKTtcclxuXHJcblx0XHRcdGlmKCBsYXN0Q2hhciA9PT0gJyknICkge1xyXG5cdFx0XHRcdHZhciBvcGVuUGFyZW5zTWF0Y2ggPSBtYXRjaFN0ci5tYXRjaCggL1xcKC9nICksXHJcblx0XHRcdFx0ICAgIGNsb3NlUGFyZW5zTWF0Y2ggPSBtYXRjaFN0ci5tYXRjaCggL1xcKS9nICksXHJcblx0XHRcdFx0ICAgIG51bU9wZW5QYXJlbnMgPSAoIG9wZW5QYXJlbnNNYXRjaCAmJiBvcGVuUGFyZW5zTWF0Y2gubGVuZ3RoICkgfHwgMCxcclxuXHRcdFx0XHQgICAgbnVtQ2xvc2VQYXJlbnMgPSAoIGNsb3NlUGFyZW5zTWF0Y2ggJiYgY2xvc2VQYXJlbnNNYXRjaC5sZW5ndGggKSB8fCAwO1xyXG5cclxuXHRcdFx0XHRpZiggbnVtT3BlblBhcmVucyA8IG51bUNsb3NlUGFyZW5zICkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENyZWF0ZXMgdGhlIHJldHVybiBzdHJpbmcgdmFsdWUgZm9yIGEgZ2l2ZW4gbWF0Y2ggaW4gdGhlIGlucHV0IHN0cmluZywgZm9yIHRoZSB7QGxpbmsgI3Byb2Nlc3NUZXh0Tm9kZX0gbWV0aG9kLlxyXG5cdFx0ICogXHJcblx0XHQgKiBUaGlzIG1ldGhvZCBoYW5kbGVzIHRoZSB7QGxpbmsgI3JlcGxhY2VGbn0sIGlmIG9uZSB3YXMgcHJvdmlkZWQuXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKiBAcGFyYW0ge0F1dG9saW5rZXIubWF0Y2guTWF0Y2h9IG1hdGNoIFRoZSBNYXRjaCBvYmplY3QgdGhhdCByZXByZXNlbnRzIHRoZSBtYXRjaC5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBtYXRjaFN0ciBUaGUgb3JpZ2luYWwgbWF0Y2ggc3RyaW5nLCBhZnRlciBoYXZpbmcgYmVlbiBwcmVwcm9jZXNzZWQgdG8gZml4IG1hdGNoIGVkZ2UgY2FzZXMgKHNlZVxyXG5cdFx0ICogICB0aGUgYHByZWZpeFN0cmAgYW5kIGBzdWZmaXhTdHJgIHZhcnMgaW4ge0BsaW5rICNwcm9jZXNzVGV4dE5vZGV9LlxyXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfSBUaGUgc3RyaW5nIHRoYXQgdGhlIGBtYXRjaGAgc2hvdWxkIGJlIHJlcGxhY2VkIHdpdGguIFRoaXMgaXMgdXN1YWxseSB0aGUgYW5jaG9yIHRhZyBzdHJpbmcsIGJ1dFxyXG5cdFx0ICogICBtYXkgYmUgdGhlIGBtYXRjaFN0cmAgaXRzZWxmIGlmIHRoZSBtYXRjaCBpcyBub3QgdG8gYmUgcmVwbGFjZWQuXHJcblx0XHQgKi9cclxuXHRcdGNyZWF0ZU1hdGNoUmV0dXJuVmFsIDogZnVuY3Rpb24oIG1hdGNoLCBtYXRjaFN0ciApIHtcclxuXHRcdFx0Ly8gSGFuZGxlIGEgY3VzdG9tIGByZXBsYWNlRm5gIGJlaW5nIHByb3ZpZGVkXHJcblx0XHRcdHZhciByZXBsYWNlRm5SZXN1bHQ7XHJcblx0XHRcdGlmKCB0aGlzLnJlcGxhY2VGbiApIHtcclxuXHRcdFx0XHRyZXBsYWNlRm5SZXN1bHQgPSB0aGlzLnJlcGxhY2VGbi5jYWxsKCB0aGlzLCB0aGlzLCBtYXRjaCApOyAgLy8gQXV0b2xpbmtlciBpbnN0YW5jZSBpcyB0aGUgY29udGV4dCwgYW5kIHRoZSBmaXJzdCBhcmdcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYoIHR5cGVvZiByZXBsYWNlRm5SZXN1bHQgPT09ICdzdHJpbmcnICkge1xyXG5cdFx0XHRcdHJldHVybiByZXBsYWNlRm5SZXN1bHQ7ICAvLyBgcmVwbGFjZUZuYCByZXR1cm5lZCBhIHN0cmluZywgdXNlIHRoYXRcclxuXHJcblx0XHRcdH0gZWxzZSBpZiggcmVwbGFjZUZuUmVzdWx0ID09PSBmYWxzZSApIHtcclxuXHRcdFx0XHRyZXR1cm4gbWF0Y2hTdHI7ICAvLyBubyByZXBsYWNlbWVudCBmb3IgdGhlIG1hdGNoXHJcblxyXG5cdFx0XHR9IGVsc2UgaWYoIHJlcGxhY2VGblJlc3VsdCBpbnN0YW5jZW9mIEF1dG9saW5rZXIuSHRtbFRhZyApIHtcclxuXHRcdFx0XHRyZXR1cm4gcmVwbGFjZUZuUmVzdWx0LnRvU3RyaW5nKCk7XHJcblxyXG5cdFx0XHR9IGVsc2UgeyAgLy8gcmVwbGFjZUZuUmVzdWx0ID09PSB0cnVlLCBvciBuby91bmtub3duIHJldHVybiB2YWx1ZSBmcm9tIGZ1bmN0aW9uXHJcblx0XHRcdFx0Ly8gUGVyZm9ybSBBdXRvbGlua2VyJ3MgZGVmYXVsdCBhbmNob3IgdGFnIGdlbmVyYXRpb25cclxuXHRcdFx0XHR2YXIgdGFnQnVpbGRlciA9IHRoaXMuZ2V0VGFnQnVpbGRlcigpLFxyXG5cdFx0XHRcdCAgICBhbmNob3JUYWcgPSB0YWdCdWlsZGVyLmJ1aWxkKCBtYXRjaCApOyAgLy8gcmV0dXJucyBhbiBBdXRvbGlua2VyLkh0bWxUYWcgaW5zdGFuY2VcclxuXHJcblx0XHRcdFx0cmV0dXJuIGFuY2hvclRhZy50b1N0cmluZygpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdH07XHJcblxyXG5cclxuXHQvKipcclxuXHQgKiBBdXRvbWF0aWNhbGx5IGxpbmtzIFVSTHMsIGVtYWlsIGFkZHJlc3NlcywgYW5kIFR3aXR0ZXIgaGFuZGxlcyBmb3VuZCBpbiB0aGUgZ2l2ZW4gY2h1bmsgb2YgSFRNTC4gXHJcblx0ICogRG9lcyBub3QgbGluayBVUkxzIGZvdW5kIHdpdGhpbiBIVE1MIHRhZ3MuXHJcblx0ICogXHJcblx0ICogRm9yIGluc3RhbmNlLCBpZiBnaXZlbiB0aGUgdGV4dDogYFlvdSBzaG91bGQgZ28gdG8gaHR0cDovL3d3dy55YWhvby5jb21gLCB0aGVuIHRoZSByZXN1bHRcclxuXHQgKiB3aWxsIGJlIGBZb3Ugc2hvdWxkIGdvIHRvICZsdDthIGhyZWY9XCJodHRwOi8vd3d3LnlhaG9vLmNvbVwiJmd0O2h0dHA6Ly93d3cueWFob28uY29tJmx0Oy9hJmd0O2BcclxuXHQgKiBcclxuXHQgKiBFeGFtcGxlOlxyXG5cdCAqIFxyXG5cdCAqICAgICB2YXIgbGlua2VkVGV4dCA9IEF1dG9saW5rZXIubGluayggXCJHbyB0byBnb29nbGUuY29tXCIsIHsgbmV3V2luZG93OiBmYWxzZSB9ICk7XHJcblx0ICogICAgIC8vIFByb2R1Y2VzOiBcIkdvIHRvIDxhIGhyZWY9XCJodHRwOi8vZ29vZ2xlLmNvbVwiPmdvb2dsZS5jb208L2E+XCJcclxuXHQgKiBcclxuXHQgKiBAc3RhdGljXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IHRleHRPckh0bWwgVGhlIEhUTUwgb3IgdGV4dCB0byBmaW5kIFVSTHMsIGVtYWlsIGFkZHJlc3NlcywgYW5kIFR3aXR0ZXIgaGFuZGxlcyB3aXRoaW4gKGRlcGVuZGluZyBvbiBpZlxyXG5cdCAqICAgdGhlIHtAbGluayAjdXJsc30sIHtAbGluayAjZW1haWx9LCBhbmQge0BsaW5rICN0d2l0dGVyfSBvcHRpb25zIGFyZSBlbmFibGVkKS5cclxuXHQgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIEFueSBvZiB0aGUgY29uZmlndXJhdGlvbiBvcHRpb25zIGZvciB0aGUgQXV0b2xpbmtlciBjbGFzcywgc3BlY2lmaWVkIGluIGFuIE9iamVjdCAobWFwKS5cclxuXHQgKiAgIFNlZSB0aGUgY2xhc3MgZGVzY3JpcHRpb24gZm9yIGFuIGV4YW1wbGUgY2FsbC5cclxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSBIVE1MIHRleHQsIHdpdGggVVJMcyBhdXRvbWF0aWNhbGx5IGxpbmtlZFxyXG5cdCAqL1xyXG5cdEF1dG9saW5rZXIubGluayA9IGZ1bmN0aW9uKCB0ZXh0T3JIdG1sLCBvcHRpb25zICkge1xyXG5cdFx0dmFyIGF1dG9saW5rZXIgPSBuZXcgQXV0b2xpbmtlciggb3B0aW9ucyApO1xyXG5cdFx0cmV0dXJuIGF1dG9saW5rZXIubGluayggdGV4dE9ySHRtbCApO1xyXG5cdH07XHJcblxyXG5cclxuXHQvLyBOYW1lc3BhY2UgZm9yIGBtYXRjaGAgY2xhc3Nlc1xyXG5cdEF1dG9saW5rZXIubWF0Y2ggPSB7fTtcclxuXHQvKmdsb2JhbCBBdXRvbGlua2VyICovXHJcblx0Lypqc2hpbnQgZXFudWxsOnRydWUsIGJvc3M6dHJ1ZSAqL1xyXG5cdC8qKlxyXG5cdCAqIEBjbGFzcyBBdXRvbGlua2VyLlV0aWxcclxuXHQgKiBAc2luZ2xldG9uXHJcblx0ICogXHJcblx0ICogQSBmZXcgdXRpbGl0eSBtZXRob2RzIGZvciBBdXRvbGlua2VyLlxyXG5cdCAqL1xyXG5cdEF1dG9saW5rZXIuVXRpbCA9IHtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGFic3RyYWN0TWV0aG9kXHJcblx0XHQgKiBcclxuXHRcdCAqIEEgZnVuY3Rpb24gb2JqZWN0IHdoaWNoIHJlcHJlc2VudHMgYW4gYWJzdHJhY3QgbWV0aG9kLlxyXG5cdFx0ICovXHJcblx0XHRhYnN0cmFjdE1ldGhvZCA6IGZ1bmN0aW9uKCkgeyB0aHJvdyBcImFic3RyYWN0XCI7IH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQXNzaWducyAoc2hhbGxvdyBjb3BpZXMpIHRoZSBwcm9wZXJ0aWVzIG9mIGBzcmNgIG9udG8gYGRlc3RgLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gZGVzdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxyXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IHNyYyBUaGUgc291cmNlIG9iamVjdC5cclxuXHRcdCAqIEByZXR1cm4ge09iamVjdH0gVGhlIGRlc3RpbmF0aW9uIG9iamVjdCAoYGRlc3RgKVxyXG5cdFx0ICovXHJcblx0XHRhc3NpZ24gOiBmdW5jdGlvbiggZGVzdCwgc3JjICkge1xyXG5cdFx0XHRmb3IoIHZhciBwcm9wIGluIHNyYyApIHtcclxuXHRcdFx0XHRpZiggc3JjLmhhc093blByb3BlcnR5KCBwcm9wICkgKSB7XHJcblx0XHRcdFx0XHRkZXN0WyBwcm9wIF0gPSBzcmNbIHByb3AgXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBkZXN0O1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBFeHRlbmRzIGBzdXBlcmNsYXNzYCB0byBjcmVhdGUgYSBuZXcgc3ViY2xhc3MsIGFkZGluZyB0aGUgYHByb3RvUHJvcHNgIHRvIHRoZSBuZXcgc3ViY2xhc3MncyBwcm90b3R5cGUuXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7RnVuY3Rpb259IHN1cGVyY2xhc3MgVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgc3VwZXJjbGFzcy5cclxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBwcm90b1Byb3BzIFRoZSBtZXRob2RzL3Byb3BlcnRpZXMgdG8gYWRkIHRvIHRoZSBzdWJjbGFzcydzIHByb3RvdHlwZS4gVGhpcyBtYXkgY29udGFpbiB0aGVcclxuXHRcdCAqICAgc3BlY2lhbCBwcm9wZXJ0eSBgY29uc3RydWN0b3JgLCB3aGljaCB3aWxsIGJlIHVzZWQgYXMgdGhlIG5ldyBzdWJjbGFzcydzIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxyXG5cdFx0ICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBuZXcgc3ViY2xhc3MgZnVuY3Rpb24uXHJcblx0XHQgKi9cclxuXHRcdGV4dGVuZCA6IGZ1bmN0aW9uKCBzdXBlcmNsYXNzLCBwcm90b1Byb3BzICkge1xyXG5cdFx0XHR2YXIgc3VwZXJjbGFzc1Byb3RvID0gc3VwZXJjbGFzcy5wcm90b3R5cGU7XHJcblxyXG5cdFx0XHR2YXIgRiA9IGZ1bmN0aW9uKCkge307XHJcblx0XHRcdEYucHJvdG90eXBlID0gc3VwZXJjbGFzc1Byb3RvO1xyXG5cclxuXHRcdFx0dmFyIHN1YmNsYXNzO1xyXG5cdFx0XHRpZiggcHJvdG9Qcm9wcy5oYXNPd25Qcm9wZXJ0eSggJ2NvbnN0cnVjdG9yJyApICkge1xyXG5cdFx0XHRcdHN1YmNsYXNzID0gcHJvdG9Qcm9wcy5jb25zdHJ1Y3RvcjtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRzdWJjbGFzcyA9IGZ1bmN0aW9uKCkgeyBzdXBlcmNsYXNzUHJvdG8uY29uc3RydWN0b3IuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApOyB9O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR2YXIgc3ViY2xhc3NQcm90byA9IHN1YmNsYXNzLnByb3RvdHlwZSA9IG5ldyBGKCk7ICAvLyBzZXQgdXAgcHJvdG90eXBlIGNoYWluXHJcblx0XHRcdHN1YmNsYXNzUHJvdG8uY29uc3RydWN0b3IgPSBzdWJjbGFzczsgIC8vIGZpeCBjb25zdHJ1Y3RvciBwcm9wZXJ0eVxyXG5cdFx0XHRzdWJjbGFzc1Byb3RvLnN1cGVyY2xhc3MgPSBzdXBlcmNsYXNzUHJvdG87XHJcblxyXG5cdFx0XHRkZWxldGUgcHJvdG9Qcm9wcy5jb25zdHJ1Y3RvcjsgIC8vIGRvbid0IHJlLWFzc2lnbiBjb25zdHJ1Y3RvciBwcm9wZXJ0eSB0byB0aGUgcHJvdG90eXBlLCBzaW5jZSBhIG5ldyBmdW5jdGlvbiBtYXkgaGF2ZSBiZWVuIGNyZWF0ZWQgKGBzdWJjbGFzc2ApLCB3aGljaCBpcyBub3cgYWxyZWFkeSB0aGVyZVxyXG5cdFx0XHRBdXRvbGlua2VyLlV0aWwuYXNzaWduKCBzdWJjbGFzc1Byb3RvLCBwcm90b1Byb3BzICk7XHJcblxyXG5cdFx0XHRyZXR1cm4gc3ViY2xhc3M7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFRydW5jYXRlcyB0aGUgYHN0cmAgYXQgYGxlbiAtIGVsbGlwc2lzQ2hhcnMubGVuZ3RoYCwgYW5kIGFkZHMgdGhlIGBlbGxpcHNpc0NoYXJzYCB0byB0aGVcclxuXHRcdCAqIGVuZCBvZiB0aGUgc3RyaW5nIChieSBkZWZhdWx0LCB0d28gcGVyaW9kczogJy4uJykuIElmIHRoZSBgc3RyYCBsZW5ndGggZG9lcyBub3QgZXhjZWVkIFxyXG5cdFx0ICogYGxlbmAsIHRoZSBzdHJpbmcgd2lsbCBiZSByZXR1cm5lZCB1bmNoYW5nZWQuXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB0byB0cnVuY2F0ZSBhbmQgYWRkIGFuIGVsbGlwc2lzIHRvLlxyXG5cdFx0ICogQHBhcmFtIHtOdW1iZXJ9IHRydW5jYXRlTGVuIFRoZSBsZW5ndGggdG8gdHJ1bmNhdGUgdGhlIHN0cmluZyBhdC5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBbZWxsaXBzaXNDaGFycz0uLl0gVGhlIGVsbGlwc2lzIGNoYXJhY3RlcihzKSB0byBhZGQgdG8gdGhlIGVuZCBvZiBgc3RyYFxyXG5cdFx0ICogICB3aGVuIHRydW5jYXRlZC4gRGVmYXVsdHMgdG8gJy4uJ1xyXG5cdFx0ICovXHJcblx0XHRlbGxpcHNpcyA6IGZ1bmN0aW9uKCBzdHIsIHRydW5jYXRlTGVuLCBlbGxpcHNpc0NoYXJzICkge1xyXG5cdFx0XHRpZiggc3RyLmxlbmd0aCA+IHRydW5jYXRlTGVuICkge1xyXG5cdFx0XHRcdGVsbGlwc2lzQ2hhcnMgPSAoIGVsbGlwc2lzQ2hhcnMgPT0gbnVsbCApID8gJy4uJyA6IGVsbGlwc2lzQ2hhcnM7XHJcblx0XHRcdFx0c3RyID0gc3RyLnN1YnN0cmluZyggMCwgdHJ1bmNhdGVMZW4gLSBlbGxpcHNpc0NoYXJzLmxlbmd0aCApICsgZWxsaXBzaXNDaGFycztcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gc3RyO1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdXBwb3J0cyBgQXJyYXkucHJvdG90eXBlLmluZGV4T2YoKWAgZnVuY3Rpb25hbGl0eSBmb3Igb2xkIElFIChJRTggYW5kIGJlbG93KS5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtBcnJheX0gYXJyIFRoZSBhcnJheSB0byBmaW5kIGFuIGVsZW1lbnQgb2YuXHJcblx0XHQgKiBAcGFyYW0geyp9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gZmluZCBpbiB0aGUgYXJyYXksIGFuZCByZXR1cm4gdGhlIGluZGV4IG9mLlxyXG5cdFx0ICogQHJldHVybiB7TnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIGBlbGVtZW50YCwgb3IgLTEgaWYgaXQgd2FzIG5vdCBmb3VuZC5cclxuXHRcdCAqL1xyXG5cdFx0aW5kZXhPZiA6IGZ1bmN0aW9uKCBhcnIsIGVsZW1lbnQgKSB7XHJcblx0XHRcdGlmKCBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiApIHtcclxuXHRcdFx0XHRyZXR1cm4gYXJyLmluZGV4T2YoIGVsZW1lbnQgKTtcclxuXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Zm9yKCB2YXIgaSA9IDAsIGxlbiA9IGFyci5sZW5ndGg7IGkgPCBsZW47IGkrKyApIHtcclxuXHRcdFx0XHRcdGlmKCBhcnJbIGkgXSA9PT0gZWxlbWVudCApIHJldHVybiBpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm4gLTE7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFBlcmZvcm1zIHRoZSBmdW5jdGlvbmFsaXR5IG9mIHdoYXQgbW9kZXJuIGJyb3dzZXJzIGRvIHdoZW4gYFN0cmluZy5wcm90b3R5cGUuc3BsaXQoKWAgaXMgY2FsbGVkXHJcblx0XHQgKiB3aXRoIGEgcmVndWxhciBleHByZXNzaW9uIHRoYXQgY29udGFpbnMgY2FwdHVyaW5nIHBhcmVudGhlc2lzLlxyXG5cdFx0ICogXHJcblx0XHQgKiBGb3IgZXhhbXBsZTpcclxuXHRcdCAqIFxyXG5cdFx0ICogICAgIC8vIE1vZGVybiBicm93c2VyczogXHJcblx0XHQgKiAgICAgXCJhLGIsY1wiLnNwbGl0KCAvKCwpLyApOyAgLy8gLS0+IFsgJ2EnLCAnLCcsICdiJywgJywnLCAnYycgXVxyXG5cdFx0ICogICAgIFxyXG5cdFx0ICogICAgIC8vIE9sZCBJRSAoaW5jbHVkaW5nIElFOCk6XHJcblx0XHQgKiAgICAgXCJhLGIsY1wiLnNwbGl0KCAvKCwpLyApOyAgLy8gLS0+IFsgJ2EnLCAnYicsICdjJyBdXHJcblx0XHQgKiAgICAgXHJcblx0XHQgKiBUaGlzIG1ldGhvZCBlbXVsYXRlcyB0aGUgZnVuY3Rpb25hbGl0eSBvZiBtb2Rlcm4gYnJvd3NlcnMgZm9yIHRoZSBvbGQgSUUgY2FzZS5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgc3RyaW5nIHRvIHNwbGl0LlxyXG5cdFx0ICogQHBhcmFtIHtSZWdFeHB9IHNwbGl0UmVnZXggVGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byBzcGxpdCB0aGUgaW5wdXQgYHN0cmAgb24uIFRoZSBzcGxpdHRpbmdcclxuXHRcdCAqICAgY2hhcmFjdGVyKHMpIHdpbGwgYmUgc3BsaWNlZCBpbnRvIHRoZSBhcnJheSwgYXMgaW4gdGhlIFwibW9kZXJuIGJyb3dzZXJzXCIgZXhhbXBsZSBpbiB0aGUgXHJcblx0XHQgKiAgIGRlc2NyaXB0aW9uIG9mIHRoaXMgbWV0aG9kLiBcclxuXHRcdCAqICAgTm90ZSAjMTogdGhlIHN1cHBsaWVkIHJlZ3VsYXIgZXhwcmVzc2lvbiAqKm11c3QqKiBoYXZlIHRoZSAnZycgZmxhZyBzcGVjaWZpZWQuXHJcblx0XHQgKiAgIE5vdGUgIzI6IGZvciBzaW1wbGljaXR5J3Mgc2FrZSwgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiBkb2VzIG5vdCBuZWVkIFxyXG5cdFx0ICogICB0byBjb250YWluIGNhcHR1cmluZyBwYXJlbnRoZXNpcyAtIGl0IHdpbGwgYmUgYXNzdW1lZCB0aGF0IGFueSBtYXRjaCBoYXMgdGhlbS5cclxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ1tdfSBUaGUgc3BsaXQgYXJyYXkgb2Ygc3RyaW5ncywgd2l0aCB0aGUgc3BsaXR0aW5nIGNoYXJhY3RlcihzKSBpbmNsdWRlZC5cclxuXHRcdCAqL1xyXG5cdFx0c3BsaXRBbmRDYXB0dXJlIDogZnVuY3Rpb24oIHN0ciwgc3BsaXRSZWdleCApIHtcclxuXHRcdFx0aWYoICFzcGxpdFJlZ2V4Lmdsb2JhbCApIHRocm93IG5ldyBFcnJvciggXCJgc3BsaXRSZWdleGAgbXVzdCBoYXZlIHRoZSAnZycgZmxhZyBzZXRcIiApO1xyXG5cclxuXHRcdFx0dmFyIHJlc3VsdCA9IFtdLFxyXG5cdFx0XHQgICAgbGFzdElkeCA9IDAsXHJcblx0XHRcdCAgICBtYXRjaDtcclxuXHJcblx0XHRcdHdoaWxlKCBtYXRjaCA9IHNwbGl0UmVnZXguZXhlYyggc3RyICkgKSB7XHJcblx0XHRcdFx0cmVzdWx0LnB1c2goIHN0ci5zdWJzdHJpbmcoIGxhc3RJZHgsIG1hdGNoLmluZGV4ICkgKTtcclxuXHRcdFx0XHRyZXN1bHQucHVzaCggbWF0Y2hbIDAgXSApOyAgLy8gcHVzaCB0aGUgc3BsaXR0aW5nIGNoYXIocylcclxuXHJcblx0XHRcdFx0bGFzdElkeCA9IG1hdGNoLmluZGV4ICsgbWF0Y2hbIDAgXS5sZW5ndGg7XHJcblx0XHRcdH1cclxuXHRcdFx0cmVzdWx0LnB1c2goIHN0ci5zdWJzdHJpbmcoIGxhc3RJZHggKSApO1xyXG5cclxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcclxuXHRcdH1cclxuXHJcblx0fTtcclxuXHQvKmdsb2JhbCBBdXRvbGlua2VyICovXHJcblx0LyoqXHJcblx0ICogQHByaXZhdGVcclxuXHQgKiBAY2xhc3MgQXV0b2xpbmtlci5IdG1sUGFyc2VyXHJcblx0ICogQGV4dGVuZHMgT2JqZWN0XHJcblx0ICogXHJcblx0ICogQW4gSFRNTCBwYXJzZXIgaW1wbGVtZW50YXRpb24gd2hpY2ggc2ltcGx5IHdhbGtzIGFuIEhUTUwgc3RyaW5nIGFuZCBjYWxscyB0aGUgcHJvdmlkZWQgdmlzaXRvciBmdW5jdGlvbnMgdG8gcHJvY2VzcyBcclxuXHQgKiBIVE1MIGFuZCB0ZXh0IG5vZGVzLlxyXG5cdCAqIFxyXG5cdCAqIEF1dG9saW5rZXIgdXNlcyB0aGlzIHRvIG9ubHkgbGluayBVUkxzL2VtYWlscy9Ud2l0dGVyIGhhbmRsZXMgd2l0aGluIHRleHQgbm9kZXMsIGJhc2ljYWxseSBpZ25vcmluZyBIVE1MIHRhZ3MuXHJcblx0ICovXHJcblx0QXV0b2xpbmtlci5IdG1sUGFyc2VyID0gQXV0b2xpbmtlci5VdGlsLmV4dGVuZCggT2JqZWN0LCB7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICogQHByb3BlcnR5IHtSZWdFeHB9IGh0bWxSZWdleFxyXG5cdFx0ICogXHJcblx0XHQgKiBUaGUgcmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gcHVsbCBvdXQgSFRNTCB0YWdzIGZyb20gYSBzdHJpbmcuIEhhbmRsZXMgbmFtZXNwYWNlZCBIVE1MIHRhZ3MgYW5kXHJcblx0XHQgKiBhdHRyaWJ1dGUgbmFtZXMsIGFzIHNwZWNpZmllZCBieSBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sLW1hcmt1cC9zeW50YXguaHRtbC5cclxuXHRcdCAqIFxyXG5cdFx0ICogQ2FwdHVyaW5nIGdyb3VwczpcclxuXHRcdCAqIFxyXG5cdFx0ICogMS4gVGhlIFwiIURPQ1RZUEVcIiB0YWcgbmFtZSwgaWYgYSB0YWcgaXMgYSAmbHQ7IURPQ1RZUEUmZ3Q7IHRhZy5cclxuXHRcdCAqIDIuIElmIGl0IGlzIGFuIGVuZCB0YWcsIHRoaXMgZ3JvdXAgd2lsbCBoYXZlIHRoZSAnLycuXHJcblx0XHQgKiAzLiBUaGUgdGFnIG5hbWUgZm9yIGFsbCB0YWdzIChvdGhlciB0aGFuIHRoZSAmbHQ7IURPQ1RZUEUmZ3Q7IHRhZylcclxuXHRcdCAqL1xyXG5cdFx0aHRtbFJlZ2V4IDogKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YXIgdGFnTmFtZVJlZ2V4ID0gL1swLTlhLXpBLVpdWzAtOWEtekEtWjpdKi8sXHJcblx0XHRcdCAgICBhdHRyTmFtZVJlZ2V4ID0gL1teXFxzXFwwXCInPlxcLz1cXHgwMS1cXHgxRlxceDdGXSsvLCAgIC8vIHRoZSB1bmljb2RlIHJhbmdlIGFjY291bnRzIGZvciBleGNsdWRpbmcgY29udHJvbCBjaGFycywgYW5kIHRoZSBkZWxldGUgY2hhclxyXG5cdFx0XHQgICAgYXR0clZhbHVlUmVnZXggPSAvKD86XCJbXlwiXSo/XCJ8J1teJ10qPyd8W14nXCI9PD5gXFxzXSspLywgLy8gZG91YmxlIHF1b3RlZCwgc2luZ2xlIHF1b3RlZCwgb3IgdW5xdW90ZWQgYXR0cmlidXRlIHZhbHVlc1xyXG5cdFx0XHQgICAgbmFtZUVxdWFsc1ZhbHVlUmVnZXggPSBhdHRyTmFtZVJlZ2V4LnNvdXJjZSArICcoPzpcXFxccyo9XFxcXHMqJyArIGF0dHJWYWx1ZVJlZ2V4LnNvdXJjZSArICcpPyc7ICAvLyBvcHRpb25hbCAnPVt2YWx1ZV0nXHJcblxyXG5cdFx0XHRyZXR1cm4gbmV3IFJlZ0V4cCggW1xyXG5cdFx0XHRcdC8vIGZvciA8IURPQ1RZUEU+IHRhZy4gRXg6IDwhRE9DVFlQRSBodG1sIFBVQkxJQyBcIi0vL1czQy8vRFREIFhIVE1MIDEuMCBTdHJpY3QvL0VOXCIgXCJodHRwOi8vd3d3LnczLm9yZy9UUi94aHRtbDEvRFREL3hodG1sMS1zdHJpY3QuZHRkXCI+KSBcclxuXHRcdFx0XHQnKD86JyxcclxuXHRcdFx0XHRcdCc8KCFET0NUWVBFKScsICAvLyAqKiogQ2FwdHVyaW5nIEdyb3VwIDEgLSBJZiBpdCdzIGEgZG9jdHlwZSB0YWdcclxuXHJcblx0XHRcdFx0XHRcdC8vIFplcm8gb3IgbW9yZSBhdHRyaWJ1dGVzIGZvbGxvd2luZyB0aGUgdGFnIG5hbWVcclxuXHRcdFx0XHRcdFx0Jyg/OicsXHJcblx0XHRcdFx0XHRcdFx0J1xcXFxzKycsICAvLyBvbmUgb3IgbW9yZSB3aGl0ZXNwYWNlIGNoYXJzIGJlZm9yZSBhbiBhdHRyaWJ1dGVcclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8gRWl0aGVyOlxyXG5cdFx0XHRcdFx0XHRcdC8vIEEuIGF0dHI9XCJ2YWx1ZVwiLCBvciBcclxuXHRcdFx0XHRcdFx0XHQvLyBCLiBcInZhbHVlXCIgYWxvbmUgKFRvIGNvdmVyIGV4YW1wbGUgZG9jdHlwZSB0YWc6IDwhRE9DVFlQRSBodG1sIFBVQkxJQyBcIi0vL1czQy8vRFREIFhIVE1MIDEuMCBTdHJpY3QvL0VOXCIgXCJodHRwOi8vd3d3LnczLm9yZy9UUi94aHRtbDEvRFREL3hodG1sMS1zdHJpY3QuZHRkXCI+KSBcclxuXHRcdFx0XHRcdFx0XHQnKD86JywgbmFtZUVxdWFsc1ZhbHVlUmVnZXgsICd8JywgYXR0clZhbHVlUmVnZXguc291cmNlICsgJyknLFxyXG5cdFx0XHRcdFx0XHQnKSonLFxyXG5cdFx0XHRcdFx0Jz4nLFxyXG5cdFx0XHRcdCcpJyxcclxuXHJcblx0XHRcdFx0J3wnLFxyXG5cclxuXHRcdFx0XHQvLyBBbGwgb3RoZXIgSFRNTCB0YWdzIChpLmUuIHRhZ3MgdGhhdCBhcmUgbm90IDwhRE9DVFlQRT4pXHJcblx0XHRcdFx0Jyg/OicsXHJcblx0XHRcdFx0XHQnPCgvKT8nLCAgLy8gQmVnaW5uaW5nIG9mIGEgdGFnLiBFaXRoZXIgJzwnIGZvciBhIHN0YXJ0IHRhZywgb3IgJzwvJyBmb3IgYW4gZW5kIHRhZy4gXHJcblx0XHRcdFx0XHQgICAgICAgICAgLy8gKioqIENhcHR1cmluZyBHcm91cCAyOiBUaGUgc2xhc2ggb3IgYW4gZW1wdHkgc3RyaW5nLiBTbGFzaCAoJy8nKSBmb3IgZW5kIHRhZywgZW1wdHkgc3RyaW5nIGZvciBzdGFydCBvciBzZWxmLWNsb3NpbmcgdGFnLlxyXG5cclxuXHRcdFx0XHRcdFx0Ly8gKioqIENhcHR1cmluZyBHcm91cCAzIC0gVGhlIHRhZyBuYW1lXHJcblx0XHRcdFx0XHRcdCcoJyArIHRhZ05hbWVSZWdleC5zb3VyY2UgKyAnKScsXHJcblxyXG5cdFx0XHRcdFx0XHQvLyBaZXJvIG9yIG1vcmUgYXR0cmlidXRlcyBmb2xsb3dpbmcgdGhlIHRhZyBuYW1lXHJcblx0XHRcdFx0XHRcdCcoPzonLFxyXG5cdFx0XHRcdFx0XHRcdCdcXFxccysnLCAgICAgICAgICAgICAgICAvLyBvbmUgb3IgbW9yZSB3aGl0ZXNwYWNlIGNoYXJzIGJlZm9yZSBhbiBhdHRyaWJ1dGVcclxuXHRcdFx0XHRcdFx0XHRuYW1lRXF1YWxzVmFsdWVSZWdleCwgIC8vIGF0dHI9XCJ2YWx1ZVwiICh3aXRoIG9wdGlvbmFsID1cInZhbHVlXCIgcGFydClcclxuXHRcdFx0XHRcdFx0JykqJyxcclxuXHJcblx0XHRcdFx0XHRcdCdcXFxccyovPycsICAvLyBhbnkgdHJhaWxpbmcgc3BhY2VzIGFuZCBvcHRpb25hbCAnLycgYmVmb3JlIHRoZSBjbG9zaW5nICc+J1xyXG5cdFx0XHRcdFx0Jz4nLFxyXG5cdFx0XHRcdCcpJ1xyXG5cdFx0XHRdLmpvaW4oIFwiXCIgKSwgJ2dpJyApO1xyXG5cdFx0fSApKCksXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogV2Fsa3MgYW4gSFRNTCBzdHJpbmcsIGNhbGxpbmcgdGhlIGBvcHRpb25zLnByb2Nlc3NIdG1sTm9kZWAgZnVuY3Rpb24gZm9yIGVhY2ggSFRNTCB0YWcgdGhhdCBpcyBlbmNvdW50ZXJlZCwgYW5kIGNhbGxpbmdcclxuXHRcdCAqIHRoZSBgb3B0aW9ucy5wcm9jZXNzVGV4dE5vZGVgIGZ1bmN0aW9uIHdoZW4gZWFjaCB0ZXh0IGFyb3VuZCBIVE1MIHRhZ3MgaXMgZW5jb3VudGVyZWQuXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBodG1sIFRoZSBIVE1MIHRvIHBhcnNlLlxyXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBBbiBPYmplY3QgKG1hcCkgd2hpY2ggbWF5IGNvbnRhaW4gdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5wcm9jZXNzSHRtbE5vZGVdIEEgdmlzaXRvciBmdW5jdGlvbiB3aGljaCBhbGxvd3MgcHJvY2Vzc2luZyBvZiBhbiBlbmNvdW50ZXJlZCBIVE1MIG5vZGUuXHJcblx0XHQgKiAgIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggdGhlIGZvbGxvd2luZyBhcmd1bWVudHM6XHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMucHJvY2Vzc0h0bWxOb2RlLnRhZ1RleHRdIFRoZSBIVE1MIHRhZyB0ZXh0IHRoYXQgd2FzIGZvdW5kLlxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLnByb2Nlc3NIdG1sTm9kZS50YWdOYW1lXSBUaGUgdGFnIG5hbWUgZm9yIHRoZSBIVE1MIHRhZyB0aGF0IHdhcyBmb3VuZC4gRXg6ICdhJyBmb3IgYW4gYW5jaG9yIHRhZy5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5wcm9jZXNzSHRtbE5vZGUuaXNDbG9zaW5nVGFnXSBgdHJ1ZWAgaWYgdGhlIHRhZyBpcyBhIGNsb3NpbmcgdGFnIChleDogJmx0Oy9hJmd0OyksIGBmYWxzZWAgb3RoZXJ3aXNlLlxyXG5cdFx0ICogIFxyXG5cdFx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW29wdGlvbnMucHJvY2Vzc1RleHROb2RlXSBBIHZpc2l0b3IgZnVuY3Rpb24gd2hpY2ggYWxsb3dzIHByb2Nlc3Npbmcgb2YgYW4gZW5jb3VudGVyZWQgdGV4dCBub2RlLlxyXG5cdFx0ICogICBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIHRoZSBmb2xsb3dpbmcgYXJndW1lbnRzOlxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLnByb2Nlc3NUZXh0Tm9kZS50ZXh0XSBUaGUgdGV4dCBub2RlIHRoYXQgd2FzIG1hdGNoZWQuXHJcblx0XHQgKi9cclxuXHRcdHBhcnNlIDogZnVuY3Rpb24oIGh0bWwsIG9wdGlvbnMgKSB7XHJcblx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG5cclxuXHRcdFx0dmFyIHByb2Nlc3NIdG1sTm9kZVZpc2l0b3IgPSBvcHRpb25zLnByb2Nlc3NIdG1sTm9kZSB8fCBmdW5jdGlvbigpIHt9LFxyXG5cdFx0XHQgICAgcHJvY2Vzc1RleHROb2RlVmlzaXRvciA9IG9wdGlvbnMucHJvY2Vzc1RleHROb2RlIHx8IGZ1bmN0aW9uKCkge30sXHJcblx0XHRcdCAgICBodG1sUmVnZXggPSB0aGlzLmh0bWxSZWdleCxcclxuXHRcdFx0ICAgIGN1cnJlbnRSZXN1bHQsXHJcblx0XHRcdCAgICBsYXN0SW5kZXggPSAwO1xyXG5cclxuXHRcdFx0Ly8gTG9vcCBvdmVyIHRoZSBIVE1MIHN0cmluZywgaWdub3JpbmcgSFRNTCB0YWdzLCBhbmQgcHJvY2Vzc2luZyB0aGUgdGV4dCB0aGF0IGxpZXMgYmV0d2VlbiB0aGVtLFxyXG5cdFx0XHQvLyB3cmFwcGluZyB0aGUgVVJMcyBpbiBhbmNob3IgdGFnc1xyXG5cdFx0XHR3aGlsZSggKCBjdXJyZW50UmVzdWx0ID0gaHRtbFJlZ2V4LmV4ZWMoIGh0bWwgKSApICE9PSBudWxsICkge1xyXG5cdFx0XHRcdHZhciB0YWdUZXh0ID0gY3VycmVudFJlc3VsdFsgMCBdLFxyXG5cdFx0XHRcdCAgICB0YWdOYW1lID0gY3VycmVudFJlc3VsdFsgMSBdIHx8IGN1cnJlbnRSZXN1bHRbIDMgXSwgIC8vIFRoZSA8IURPQ1RZUEU+IHRhZyAoZXg6IFwiIURPQ1RZUEVcIiksIG9yIGFub3RoZXIgdGFnIChleDogXCJhXCIpIFxyXG5cdFx0XHRcdCAgICBpc0Nsb3NpbmdUYWcgPSAhIWN1cnJlbnRSZXN1bHRbIDIgXSxcclxuXHRcdFx0XHQgICAgaW5CZXR3ZWVuVGFnc1RleHQgPSBodG1sLnN1YnN0cmluZyggbGFzdEluZGV4LCBjdXJyZW50UmVzdWx0LmluZGV4ICk7XHJcblxyXG5cdFx0XHRcdGlmKCBpbkJldHdlZW5UYWdzVGV4dCApIHtcclxuXHRcdFx0XHRcdHByb2Nlc3NUZXh0Tm9kZVZpc2l0b3IoIGluQmV0d2VlblRhZ3NUZXh0ICk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRwcm9jZXNzSHRtbE5vZGVWaXNpdG9yKCB0YWdUZXh0LCB0YWdOYW1lLnRvTG93ZXJDYXNlKCksIGlzQ2xvc2luZ1RhZyApO1xyXG5cclxuXHRcdFx0XHRsYXN0SW5kZXggPSBjdXJyZW50UmVzdWx0LmluZGV4ICsgdGFnVGV4dC5sZW5ndGg7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIFByb2Nlc3MgYW55IHJlbWFpbmluZyB0ZXh0IGFmdGVyIHRoZSBsYXN0IEhUTUwgZWxlbWVudC4gV2lsbCBwcm9jZXNzIGFsbCBvZiB0aGUgdGV4dCBpZiB0aGVyZSB3ZXJlIG5vIEhUTUwgZWxlbWVudHMuXHJcblx0XHRcdGlmKCBsYXN0SW5kZXggPCBodG1sLmxlbmd0aCApIHtcclxuXHRcdFx0XHR2YXIgdGV4dCA9IGh0bWwuc3Vic3RyaW5nKCBsYXN0SW5kZXggKTtcclxuXHJcblx0XHRcdFx0aWYoIHRleHQgKSB7XHJcblx0XHRcdFx0XHRwcm9jZXNzVGV4dE5vZGVWaXNpdG9yKCB0ZXh0ICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdH0gKTtcclxuXHQvKmdsb2JhbCBBdXRvbGlua2VyICovXHJcblx0Lypqc2hpbnQgYm9zczp0cnVlICovXHJcblx0LyoqXHJcblx0ICogQGNsYXNzIEF1dG9saW5rZXIuSHRtbFRhZ1xyXG5cdCAqIEBleHRlbmRzIE9iamVjdFxyXG5cdCAqIFxyXG5cdCAqIFJlcHJlc2VudHMgYW4gSFRNTCB0YWcsIHdoaWNoIGNhbiBiZSB1c2VkIHRvIGVhc2lseSBidWlsZC9tb2RpZnkgSFRNTCB0YWdzIHByb2dyYW1tYXRpY2FsbHkuXHJcblx0ICogXHJcblx0ICogQXV0b2xpbmtlciB1c2VzIHRoaXMgYWJzdHJhY3Rpb24gdG8gY3JlYXRlIEhUTUwgdGFncywgYW5kIHRoZW4gd3JpdGUgdGhlbSBvdXQgYXMgc3RyaW5ncy4gWW91IG1heSBhbHNvIHVzZVxyXG5cdCAqIHRoaXMgY2xhc3MgaW4geW91ciBjb2RlLCBlc3BlY2lhbGx5IHdpdGhpbiBhIHtAbGluayBBdXRvbGlua2VyI3JlcGxhY2VGbiByZXBsYWNlRm59LlxyXG5cdCAqIFxyXG5cdCAqICMjIEV4YW1wbGVzXHJcblx0ICogXHJcblx0ICogRXhhbXBsZSBpbnN0YW50aWF0aW9uOlxyXG5cdCAqIFxyXG5cdCAqICAgICB2YXIgdGFnID0gbmV3IEF1dG9saW5rZXIuSHRtbFRhZygge1xyXG5cdCAqICAgICAgICAgdGFnTmFtZSA6ICdhJyxcclxuXHQgKiAgICAgICAgIGF0dHJzICAgOiB7ICdocmVmJzogJ2h0dHA6Ly9nb29nbGUuY29tJywgJ2NsYXNzJzogJ2V4dGVybmFsLWxpbmsnIH0sXHJcblx0ICogICAgICAgICBpbm5lckh0bWwgOiAnR29vZ2xlJ1xyXG5cdCAqICAgICB9ICk7XHJcblx0ICogICAgIFxyXG5cdCAqICAgICB0YWcudG9TdHJpbmcoKTsgIC8vIDxhIGhyZWY9XCJodHRwOi8vZ29vZ2xlLmNvbVwiIGNsYXNzPVwiZXh0ZXJuYWwtbGlua1wiPkdvb2dsZTwvYT5cclxuXHQgKiAgICAgXHJcblx0ICogICAgIC8vIEluZGl2aWR1YWwgYWNjZXNzb3IgbWV0aG9kc1xyXG5cdCAqICAgICB0YWcuZ2V0VGFnTmFtZSgpOyAgICAgICAgICAgICAgICAgLy8gJ2EnXHJcblx0ICogICAgIHRhZy5nZXRBdHRyKCAnaHJlZicgKTsgICAgICAgICAgICAvLyAnaHR0cDovL2dvb2dsZS5jb20nXHJcblx0ICogICAgIHRhZy5oYXNDbGFzcyggJ2V4dGVybmFsLWxpbmsnICk7ICAvLyB0cnVlXHJcblx0ICogXHJcblx0ICogXHJcblx0ICogVXNpbmcgbXV0YXRvciBtZXRob2RzICh3aGljaCBtYXkgYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGluc3RhbnRpYXRpb24gY29uZmlnIHByb3BlcnRpZXMpOlxyXG5cdCAqIFxyXG5cdCAqICAgICB2YXIgdGFnID0gbmV3IEF1dG9saW5rZXIuSHRtbFRhZygpO1xyXG5cdCAqICAgICB0YWcuc2V0VGFnTmFtZSggJ2EnICk7XHJcblx0ICogICAgIHRhZy5zZXRBdHRyKCAnaHJlZicsICdodHRwOi8vZ29vZ2xlLmNvbScgKTtcclxuXHQgKiAgICAgdGFnLmFkZENsYXNzKCAnZXh0ZXJuYWwtbGluaycgKTtcclxuXHQgKiAgICAgdGFnLnNldElubmVySHRtbCggJ0dvb2dsZScgKTtcclxuXHQgKiAgICAgXHJcblx0ICogICAgIHRhZy5nZXRUYWdOYW1lKCk7ICAgICAgICAgICAgICAgICAvLyAnYSdcclxuXHQgKiAgICAgdGFnLmdldEF0dHIoICdocmVmJyApOyAgICAgICAgICAgIC8vICdodHRwOi8vZ29vZ2xlLmNvbSdcclxuXHQgKiAgICAgdGFnLmhhc0NsYXNzKCAnZXh0ZXJuYWwtbGluaycgKTsgIC8vIHRydWVcclxuXHQgKiAgICAgXHJcblx0ICogICAgIHRhZy50b1N0cmluZygpOyAgLy8gPGEgaHJlZj1cImh0dHA6Ly9nb29nbGUuY29tXCIgY2xhc3M9XCJleHRlcm5hbC1saW5rXCI+R29vZ2xlPC9hPlxyXG5cdCAqICAgICBcclxuXHQgKiBcclxuXHQgKiAjIyBFeGFtcGxlIHVzZSB3aXRoaW4gYSB7QGxpbmsgQXV0b2xpbmtlciNyZXBsYWNlRm4gcmVwbGFjZUZufVxyXG5cdCAqIFxyXG5cdCAqICAgICB2YXIgaHRtbCA9IEF1dG9saW5rZXIubGluayggXCJUZXN0IGdvb2dsZS5jb21cIiwge1xyXG5cdCAqICAgICAgICAgcmVwbGFjZUZuIDogZnVuY3Rpb24oIGF1dG9saW5rZXIsIG1hdGNoICkge1xyXG5cdCAqICAgICAgICAgICAgIHZhciB0YWcgPSBhdXRvbGlua2VyLmdldFRhZ0J1aWxkZXIoKS5idWlsZCggbWF0Y2ggKTsgIC8vIHJldHVybnMgYW4ge0BsaW5rIEF1dG9saW5rZXIuSHRtbFRhZ30gaW5zdGFuY2UsIGNvbmZpZ3VyZWQgd2l0aCB0aGUgTWF0Y2gncyBocmVmIGFuZCBhbmNob3IgdGV4dFxyXG5cdCAqICAgICAgICAgICAgIHRhZy5zZXRBdHRyKCAncmVsJywgJ25vZm9sbG93JyApO1xyXG5cdCAqICAgICAgICAgICAgIFxyXG5cdCAqICAgICAgICAgICAgIHJldHVybiB0YWc7XHJcblx0ICogICAgICAgICB9XHJcblx0ICogICAgIH0gKTtcclxuXHQgKiAgICAgXHJcblx0ICogICAgIC8vIGdlbmVyYXRlZCBodG1sOlxyXG5cdCAqICAgICAvLyAgIFRlc3QgPGEgaHJlZj1cImh0dHA6Ly9nb29nbGUuY29tXCIgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9mb2xsb3dcIj5nb29nbGUuY29tPC9hPlxyXG5cdCAqICAgICBcclxuXHQgKiAgICAgXHJcblx0ICogIyMgRXhhbXBsZSB1c2Ugd2l0aCBhIG5ldyB0YWcgZm9yIHRoZSByZXBsYWNlbWVudFxyXG5cdCAqIFxyXG5cdCAqICAgICB2YXIgaHRtbCA9IEF1dG9saW5rZXIubGluayggXCJUZXN0IGdvb2dsZS5jb21cIiwge1xyXG5cdCAqICAgICAgICAgcmVwbGFjZUZuIDogZnVuY3Rpb24oIGF1dG9saW5rZXIsIG1hdGNoICkge1xyXG5cdCAqICAgICAgICAgICAgIHZhciB0YWcgPSBuZXcgQXV0b2xpbmtlci5IdG1sVGFnKCB7XHJcblx0ICogICAgICAgICAgICAgICAgIHRhZ05hbWUgOiAnYnV0dG9uJyxcclxuXHQgKiAgICAgICAgICAgICAgICAgYXR0cnMgICA6IHsgJ3RpdGxlJzogJ0xvYWQgVVJMOiAnICsgbWF0Y2guZ2V0QW5jaG9ySHJlZigpIH0sXHJcblx0ICogICAgICAgICAgICAgICAgIGlubmVySHRtbCA6ICdMb2FkIFVSTDogJyArIG1hdGNoLmdldEFuY2hvclRleHQoKVxyXG5cdCAqICAgICAgICAgICAgIH0gKTtcclxuXHQgKiAgICAgICAgICAgICBcclxuXHQgKiAgICAgICAgICAgICByZXR1cm4gdGFnO1xyXG5cdCAqICAgICAgICAgfVxyXG5cdCAqICAgICB9ICk7XHJcblx0ICogICAgIFxyXG5cdCAqICAgICAvLyBnZW5lcmF0ZWQgaHRtbDpcclxuXHQgKiAgICAgLy8gICBUZXN0IDxidXR0b24gdGl0bGU9XCJMb2FkIFVSTDogaHR0cDovL2dvb2dsZS5jb21cIj5Mb2FkIFVSTDogZ29vZ2xlLmNvbTwvYnV0dG9uPlxyXG5cdCAqL1xyXG5cdEF1dG9saW5rZXIuSHRtbFRhZyA9IEF1dG9saW5rZXIuVXRpbC5leHRlbmQoIE9iamVjdCwge1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQGNmZyB7U3RyaW5nfSB0YWdOYW1lXHJcblx0XHQgKiBcclxuXHRcdCAqIFRoZSB0YWcgbmFtZS4gRXg6ICdhJywgJ2J1dHRvbicsIGV0Yy5cclxuXHRcdCAqIFxyXG5cdFx0ICogTm90IHJlcXVpcmVkIGF0IGluc3RhbnRpYXRpb24gdGltZSwgYnV0IHNob3VsZCBiZSBzZXQgdXNpbmcge0BsaW5rICNzZXRUYWdOYW1lfSBiZWZvcmUge0BsaW5rICN0b1N0cmluZ31cclxuXHRcdCAqIGlzIGV4ZWN1dGVkLlxyXG5cdFx0ICovXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAY2ZnIHtPYmplY3QuPFN0cmluZywgU3RyaW5nPn0gYXR0cnNcclxuXHRcdCAqIFxyXG5cdFx0ICogQW4ga2V5L3ZhbHVlIE9iamVjdCAobWFwKSBvZiBhdHRyaWJ1dGVzIHRvIGNyZWF0ZSB0aGUgdGFnIHdpdGguIFRoZSBrZXlzIGFyZSB0aGUgYXR0cmlidXRlIG5hbWVzLCBhbmQgdGhlXHJcblx0XHQgKiB2YWx1ZXMgYXJlIHRoZSBhdHRyaWJ1dGUgdmFsdWVzLlxyXG5cdFx0ICovXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAY2ZnIHtTdHJpbmd9IGlubmVySHRtbFxyXG5cdFx0ICogXHJcblx0XHQgKiBUaGUgaW5uZXIgSFRNTCBmb3IgdGhlIHRhZy4gXHJcblx0XHQgKiBcclxuXHRcdCAqIE5vdGUgdGhlIGNhbWVsIGNhc2UgbmFtZSBvbiBgaW5uZXJIdG1sYC4gQWNyb255bXMgYXJlIGNhbWVsQ2FzZWQgaW4gdGhpcyB1dGlsaXR5IChzdWNoIGFzIG5vdCB0byBydW4gaW50byB0aGUgYWNyb255bSBcclxuXHRcdCAqIG5hbWluZyBpbmNvbnNpc3RlbmN5IHRoYXQgdGhlIERPTSBkZXZlbG9wZXJzIGNyZWF0ZWQgd2l0aCBgWE1MSHR0cFJlcXVlc3RgKS4gWW91IG1heSBhbHRlcm5hdGl2ZWx5IHVzZSB7QGxpbmsgI2lubmVySFRNTH1cclxuXHRcdCAqIGlmIHlvdSBwcmVmZXIsIGJ1dCB0aGlzIG9uZSBpcyByZWNvbW1lbmRlZC5cclxuXHRcdCAqL1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQGNmZyB7U3RyaW5nfSBpbm5lckhUTUxcclxuXHRcdCAqIFxyXG5cdFx0ICogQWxpYXMgb2Yge0BsaW5rICNpbm5lckh0bWx9LCBhY2NlcHRlZCBmb3IgY29uc2lzdGVuY3kgd2l0aCB0aGUgYnJvd3NlciBET00gYXBpLCBidXQgcHJlZmVyIHRoZSBjYW1lbENhc2VkIHZlcnNpb25cclxuXHRcdCAqIGZvciBhY3JvbnltIG5hbWVzLlxyXG5cdFx0ICovXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQHByb3RlY3RlZFxyXG5cdFx0ICogQHByb3BlcnR5IHtSZWdFeHB9IHdoaXRlc3BhY2VSZWdleFxyXG5cdFx0ICogXHJcblx0XHQgKiBSZWd1bGFyIGV4cHJlc3Npb24gdXNlZCB0byBtYXRjaCB3aGl0ZXNwYWNlIGluIGEgc3RyaW5nIG9mIENTUyBjbGFzc2VzLlxyXG5cdFx0ICovXHJcblx0XHR3aGl0ZXNwYWNlUmVnZXggOiAvXFxzKy8sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQGNvbnN0cnVjdG9yXHJcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gW2NmZ10gVGhlIGNvbmZpZ3VyYXRpb24gcHJvcGVydGllcyBmb3IgdGhpcyBjbGFzcywgaW4gYW4gT2JqZWN0IChtYXApXHJcblx0XHQgKi9cclxuXHRcdGNvbnN0cnVjdG9yIDogZnVuY3Rpb24oIGNmZyApIHtcclxuXHRcdFx0QXV0b2xpbmtlci5VdGlsLmFzc2lnbiggdGhpcywgY2ZnICk7XHJcblxyXG5cdFx0XHR0aGlzLmlubmVySHRtbCA9IHRoaXMuaW5uZXJIdG1sIHx8IHRoaXMuaW5uZXJIVE1MOyAgLy8gYWNjZXB0IGVpdGhlciB0aGUgY2FtZWxDYXNlZCBmb3JtIG9yIHRoZSBmdWxseSBjYXBpdGFsaXplZCBhY3JvbnltXHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNldHMgdGhlIHRhZyBuYW1lIHRoYXQgd2lsbCBiZSB1c2VkIHRvIGdlbmVyYXRlIHRoZSB0YWcgd2l0aC5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IHRhZ05hbWVcclxuXHRcdCAqIEByZXR1cm4ge0F1dG9saW5rZXIuSHRtbFRhZ30gVGhpcyBIdG1sVGFnIGluc3RhbmNlLCBzbyB0aGF0IG1ldGhvZCBjYWxscyBtYXkgYmUgY2hhaW5lZC5cclxuXHRcdCAqL1xyXG5cdFx0c2V0VGFnTmFtZSA6IGZ1bmN0aW9uKCB0YWdOYW1lICkge1xyXG5cdFx0XHR0aGlzLnRhZ05hbWUgPSB0YWdOYW1lO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmV0cmlldmVzIHRoZSB0YWcgbmFtZS5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRnZXRUYWdOYW1lIDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLnRhZ05hbWUgfHwgXCJcIjtcclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2V0cyBhbiBhdHRyaWJ1dGUgb24gdGhlIEh0bWxUYWcuXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBhdHRyTmFtZSBUaGUgYXR0cmlidXRlIG5hbWUgdG8gc2V0LlxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGF0dHJWYWx1ZSBUaGUgYXR0cmlidXRlIHZhbHVlIHRvIHNldC5cclxuXHRcdCAqIEByZXR1cm4ge0F1dG9saW5rZXIuSHRtbFRhZ30gVGhpcyBIdG1sVGFnIGluc3RhbmNlLCBzbyB0aGF0IG1ldGhvZCBjYWxscyBtYXkgYmUgY2hhaW5lZC5cclxuXHRcdCAqL1xyXG5cdFx0c2V0QXR0ciA6IGZ1bmN0aW9uKCBhdHRyTmFtZSwgYXR0clZhbHVlICkge1xyXG5cdFx0XHR2YXIgdGFnQXR0cnMgPSB0aGlzLmdldEF0dHJzKCk7XHJcblx0XHRcdHRhZ0F0dHJzWyBhdHRyTmFtZSBdID0gYXR0clZhbHVlO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJldHJpZXZlcyBhbiBhdHRyaWJ1dGUgZnJvbSB0aGUgSHRtbFRhZy4gSWYgdGhlIGF0dHJpYnV0ZSBkb2VzIG5vdCBleGlzdCwgcmV0dXJucyBgdW5kZWZpbmVkYC5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIGF0dHJpYnV0ZSBuYW1lIHRvIHJldHJpZXZlLlxyXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfSBUaGUgYXR0cmlidXRlJ3MgdmFsdWUsIG9yIGB1bmRlZmluZWRgIGlmIGl0IGRvZXMgbm90IGV4aXN0IG9uIHRoZSBIdG1sVGFnLlxyXG5cdFx0ICovXHJcblx0XHRnZXRBdHRyIDogZnVuY3Rpb24oIGF0dHJOYW1lICkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRBdHRycygpWyBhdHRyTmFtZSBdO1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXRzIG9uZSBvciBtb3JlIGF0dHJpYnV0ZXMgb24gdGhlIEh0bWxUYWcuXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0LjxTdHJpbmcsIFN0cmluZz59IGF0dHJzIEEga2V5L3ZhbHVlIE9iamVjdCAobWFwKSBvZiB0aGUgYXR0cmlidXRlcyB0byBzZXQuXHJcblx0XHQgKiBAcmV0dXJuIHtBdXRvbGlua2VyLkh0bWxUYWd9IFRoaXMgSHRtbFRhZyBpbnN0YW5jZSwgc28gdGhhdCBtZXRob2QgY2FsbHMgbWF5IGJlIGNoYWluZWQuXHJcblx0XHQgKi9cclxuXHRcdHNldEF0dHJzIDogZnVuY3Rpb24oIGF0dHJzICkge1xyXG5cdFx0XHR2YXIgdGFnQXR0cnMgPSB0aGlzLmdldEF0dHJzKCk7XHJcblx0XHRcdEF1dG9saW5rZXIuVXRpbC5hc3NpZ24oIHRhZ0F0dHJzLCBhdHRycyApO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJldHJpZXZlcyB0aGUgYXR0cmlidXRlcyBPYmplY3QgKG1hcCkgZm9yIHRoZSBIdG1sVGFnLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcmV0dXJuIHtPYmplY3QuPFN0cmluZywgU3RyaW5nPn0gQSBrZXkvdmFsdWUgb2JqZWN0IG9mIHRoZSBhdHRyaWJ1dGVzIGZvciB0aGUgSHRtbFRhZy5cclxuXHRcdCAqL1xyXG5cdFx0Z2V0QXR0cnMgOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuYXR0cnMgfHwgKCB0aGlzLmF0dHJzID0ge30gKTtcclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU2V0cyB0aGUgcHJvdmlkZWQgYGNzc0NsYXNzYCwgb3ZlcndyaXRpbmcgYW55IGN1cnJlbnQgQ1NTIGNsYXNzZXMgb24gdGhlIEh0bWxUYWcuXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBjc3NDbGFzcyBPbmUgb3IgbW9yZSBzcGFjZS1zZXBhcmF0ZWQgQ1NTIGNsYXNzZXMgdG8gc2V0IChvdmVyd3JpdGUpLlxyXG5cdFx0ICogQHJldHVybiB7QXV0b2xpbmtlci5IdG1sVGFnfSBUaGlzIEh0bWxUYWcgaW5zdGFuY2UsIHNvIHRoYXQgbWV0aG9kIGNhbGxzIG1heSBiZSBjaGFpbmVkLlxyXG5cdFx0ICovXHJcblx0XHRzZXRDbGFzcyA6IGZ1bmN0aW9uKCBjc3NDbGFzcyApIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuc2V0QXR0ciggJ2NsYXNzJywgY3NzQ2xhc3MgKTtcclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ29udmVuaWVuY2UgbWV0aG9kIHRvIGFkZCBvbmUgb3IgbW9yZSBDU1MgY2xhc3NlcyB0byB0aGUgSHRtbFRhZy4gV2lsbCBub3QgYWRkIGR1cGxpY2F0ZSBDU1MgY2xhc3Nlcy5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGNzc0NsYXNzIE9uZSBvciBtb3JlIHNwYWNlLXNlcGFyYXRlZCBDU1MgY2xhc3NlcyB0byBhZGQuXHJcblx0XHQgKiBAcmV0dXJuIHtBdXRvbGlua2VyLkh0bWxUYWd9IFRoaXMgSHRtbFRhZyBpbnN0YW5jZSwgc28gdGhhdCBtZXRob2QgY2FsbHMgbWF5IGJlIGNoYWluZWQuXHJcblx0XHQgKi9cclxuXHRcdGFkZENsYXNzIDogZnVuY3Rpb24oIGNzc0NsYXNzICkge1xyXG5cdFx0XHR2YXIgY2xhc3NBdHRyID0gdGhpcy5nZXRDbGFzcygpLFxyXG5cdFx0XHQgICAgd2hpdGVzcGFjZVJlZ2V4ID0gdGhpcy53aGl0ZXNwYWNlUmVnZXgsXHJcblx0XHRcdCAgICBpbmRleE9mID0gQXV0b2xpbmtlci5VdGlsLmluZGV4T2YsICAvLyB0byBzdXBwb3J0IElFOCBhbmQgYmVsb3dcclxuXHRcdFx0ICAgIGNsYXNzZXMgPSAoICFjbGFzc0F0dHIgKSA/IFtdIDogY2xhc3NBdHRyLnNwbGl0KCB3aGl0ZXNwYWNlUmVnZXggKSxcclxuXHRcdFx0ICAgIG5ld0NsYXNzZXMgPSBjc3NDbGFzcy5zcGxpdCggd2hpdGVzcGFjZVJlZ2V4ICksXHJcblx0XHRcdCAgICBuZXdDbGFzcztcclxuXHJcblx0XHRcdHdoaWxlKCBuZXdDbGFzcyA9IG5ld0NsYXNzZXMuc2hpZnQoKSApIHtcclxuXHRcdFx0XHRpZiggaW5kZXhPZiggY2xhc3NlcywgbmV3Q2xhc3MgKSA9PT0gLTEgKSB7XHJcblx0XHRcdFx0XHRjbGFzc2VzLnB1c2goIG5ld0NsYXNzICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmdldEF0dHJzKClbICdjbGFzcycgXSA9IGNsYXNzZXMuam9pbiggXCIgXCIgKTtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENvbnZlbmllbmNlIG1ldGhvZCB0byByZW1vdmUgb25lIG9yIG1vcmUgQ1NTIGNsYXNzZXMgZnJvbSB0aGUgSHRtbFRhZy5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGNzc0NsYXNzIE9uZSBvciBtb3JlIHNwYWNlLXNlcGFyYXRlZCBDU1MgY2xhc3NlcyB0byByZW1vdmUuXHJcblx0XHQgKiBAcmV0dXJuIHtBdXRvbGlua2VyLkh0bWxUYWd9IFRoaXMgSHRtbFRhZyBpbnN0YW5jZSwgc28gdGhhdCBtZXRob2QgY2FsbHMgbWF5IGJlIGNoYWluZWQuXHJcblx0XHQgKi9cclxuXHRcdHJlbW92ZUNsYXNzIDogZnVuY3Rpb24oIGNzc0NsYXNzICkge1xyXG5cdFx0XHR2YXIgY2xhc3NBdHRyID0gdGhpcy5nZXRDbGFzcygpLFxyXG5cdFx0XHQgICAgd2hpdGVzcGFjZVJlZ2V4ID0gdGhpcy53aGl0ZXNwYWNlUmVnZXgsXHJcblx0XHRcdCAgICBpbmRleE9mID0gQXV0b2xpbmtlci5VdGlsLmluZGV4T2YsICAvLyB0byBzdXBwb3J0IElFOCBhbmQgYmVsb3dcclxuXHRcdFx0ICAgIGNsYXNzZXMgPSAoICFjbGFzc0F0dHIgKSA/IFtdIDogY2xhc3NBdHRyLnNwbGl0KCB3aGl0ZXNwYWNlUmVnZXggKSxcclxuXHRcdFx0ICAgIHJlbW92ZUNsYXNzZXMgPSBjc3NDbGFzcy5zcGxpdCggd2hpdGVzcGFjZVJlZ2V4ICksXHJcblx0XHRcdCAgICByZW1vdmVDbGFzcztcclxuXHJcblx0XHRcdHdoaWxlKCBjbGFzc2VzLmxlbmd0aCAmJiAoIHJlbW92ZUNsYXNzID0gcmVtb3ZlQ2xhc3Nlcy5zaGlmdCgpICkgKSB7XHJcblx0XHRcdFx0dmFyIGlkeCA9IGluZGV4T2YoIGNsYXNzZXMsIHJlbW92ZUNsYXNzICk7XHJcblx0XHRcdFx0aWYoIGlkeCAhPT0gLTEgKSB7XHJcblx0XHRcdFx0XHRjbGFzc2VzLnNwbGljZSggaWR4LCAxICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmdldEF0dHJzKClbICdjbGFzcycgXSA9IGNsYXNzZXMuam9pbiggXCIgXCIgKTtcclxuXHRcdFx0cmV0dXJuIHRoaXM7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENvbnZlbmllbmNlIG1ldGhvZCB0byByZXRyaWV2ZSB0aGUgQ1NTIGNsYXNzKGVzKSBmb3IgdGhlIEh0bWxUYWcsIHdoaWNoIHdpbGwgZWFjaCBiZSBzZXBhcmF0ZWQgYnkgc3BhY2VzIHdoZW5cclxuXHRcdCAqIHRoZXJlIGFyZSBtdWx0aXBsZS5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRnZXRDbGFzcyA6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRBdHRycygpWyAnY2xhc3MnIF0gfHwgXCJcIjtcclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ29udmVuaWVuY2UgbWV0aG9kIHRvIGNoZWNrIGlmIHRoZSB0YWcgaGFzIGEgQ1NTIGNsYXNzIG9yIG5vdC5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGNzc0NsYXNzIFRoZSBDU1MgY2xhc3MgdG8gY2hlY2sgZm9yLlxyXG5cdFx0ICogQHJldHVybiB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBIdG1sVGFnIGhhcyB0aGUgQ1NTIGNsYXNzLCBgZmFsc2VgIG90aGVyd2lzZS5cclxuXHRcdCAqL1xyXG5cdFx0aGFzQ2xhc3MgOiBmdW5jdGlvbiggY3NzQ2xhc3MgKSB7XHJcblx0XHRcdHJldHVybiAoICcgJyArIHRoaXMuZ2V0Q2xhc3MoKSArICcgJyApLmluZGV4T2YoICcgJyArIGNzc0NsYXNzICsgJyAnICkgIT09IC0xO1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTZXRzIHRoZSBpbm5lciBIVE1MIGZvciB0aGUgdGFnLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gaHRtbCBUaGUgaW5uZXIgSFRNTCB0byBzZXQuXHJcblx0XHQgKiBAcmV0dXJuIHtBdXRvbGlua2VyLkh0bWxUYWd9IFRoaXMgSHRtbFRhZyBpbnN0YW5jZSwgc28gdGhhdCBtZXRob2QgY2FsbHMgbWF5IGJlIGNoYWluZWQuXHJcblx0XHQgKi9cclxuXHRcdHNldElubmVySHRtbCA6IGZ1bmN0aW9uKCBodG1sICkge1xyXG5cdFx0XHR0aGlzLmlubmVySHRtbCA9IGh0bWw7XHJcblxyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmV0cmlldmVzIHRoZSBpbm5lciBIVE1MIGZvciB0aGUgdGFnLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9XHJcblx0XHQgKi9cclxuXHRcdGdldElubmVySHRtbCA6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5pbm5lckh0bWwgfHwgXCJcIjtcclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogT3ZlcnJpZGUgb2Ygc3VwZXJjbGFzcyBtZXRob2QgdXNlZCB0byBnZW5lcmF0ZSB0aGUgSFRNTCBzdHJpbmcgZm9yIHRoZSB0YWcuXHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ31cclxuXHRcdCAqL1xyXG5cdFx0dG9TdHJpbmcgOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyIHRhZ05hbWUgPSB0aGlzLmdldFRhZ05hbWUoKSxcclxuXHRcdFx0ICAgIGF0dHJzU3RyID0gdGhpcy5idWlsZEF0dHJzU3RyKCk7XHJcblxyXG5cdFx0XHRhdHRyc1N0ciA9ICggYXR0cnNTdHIgKSA/ICcgJyArIGF0dHJzU3RyIDogJyc7ICAvLyBwcmVwZW5kIGEgc3BhY2UgaWYgdGhlcmUgYXJlIGFjdHVhbGx5IGF0dHJpYnV0ZXNcclxuXHJcblx0XHRcdHJldHVybiBbICc8JywgdGFnTmFtZSwgYXR0cnNTdHIsICc+JywgdGhpcy5nZXRJbm5lckh0bWwoKSwgJzwvJywgdGFnTmFtZSwgJz4nIF0uam9pbiggXCJcIiApO1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdXBwb3J0IG1ldGhvZCBmb3Ige0BsaW5rICN0b1N0cmluZ30sIHJldHVybnMgdGhlIHN0cmluZyBzcGFjZS1zZXBhcmF0ZWQga2V5PVwidmFsdWVcIiBwYWlycywgdXNlZCB0byBwb3B1bGF0ZSBcclxuXHRcdCAqIHRoZSBzdHJpbmdpZmllZCBIdG1sVGFnLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcHJvdGVjdGVkXHJcblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9IEV4YW1wbGUgcmV0dXJuOiBgYXR0cjE9XCJ2YWx1ZTFcIiBhdHRyMj1cInZhbHVlMlwiYFxyXG5cdFx0ICovXHJcblx0XHRidWlsZEF0dHJzU3RyIDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmKCAhdGhpcy5hdHRycyApIHJldHVybiBcIlwiOyAgLy8gbm8gYGF0dHJzYCBPYmplY3QgKG1hcCkgaGFzIGJlZW4gc2V0LCByZXR1cm4gZW1wdHkgc3RyaW5nXHJcblxyXG5cdFx0XHR2YXIgYXR0cnMgPSB0aGlzLmdldEF0dHJzKCksXHJcblx0XHRcdCAgICBhdHRyc0FyciA9IFtdO1xyXG5cclxuXHRcdFx0Zm9yKCB2YXIgcHJvcCBpbiBhdHRycyApIHtcclxuXHRcdFx0XHRpZiggYXR0cnMuaGFzT3duUHJvcGVydHkoIHByb3AgKSApIHtcclxuXHRcdFx0XHRcdGF0dHJzQXJyLnB1c2goIHByb3AgKyAnPVwiJyArIGF0dHJzWyBwcm9wIF0gKyAnXCInICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBhdHRyc0Fyci5qb2luKCBcIiBcIiApO1xyXG5cdFx0fVxyXG5cclxuXHR9ICk7XHJcblx0LypnbG9iYWwgQXV0b2xpbmtlciAqL1xyXG5cdC8qanNoaW50IHNjcmlwdHVybDp0cnVlICovXHJcblx0LyoqXHJcblx0ICogQHByaXZhdGVcclxuXHQgKiBAY2xhc3MgQXV0b2xpbmtlci5NYXRjaFZhbGlkYXRvclxyXG5cdCAqIEBleHRlbmRzIE9iamVjdFxyXG5cdCAqIFxyXG5cdCAqIFVzZWQgYnkgQXV0b2xpbmtlciB0byBmaWx0ZXIgb3V0IGZhbHNlIHBvc2l0aXZlcyBmcm9tIHRoZSB7QGxpbmsgQXV0b2xpbmtlciNtYXRjaGVyUmVnZXh9LlxyXG5cdCAqIFxyXG5cdCAqIER1ZSB0byB0aGUgbGltaXRhdGlvbnMgb2YgcmVndWxhciBleHByZXNzaW9ucyAoaW5jbHVkaW5nIHRoZSBtaXNzaW5nIGZlYXR1cmUgb2YgbG9vay1iZWhpbmRzIGluIEpTIHJlZ3VsYXIgZXhwcmVzc2lvbnMpLFxyXG5cdCAqIHdlIGNhbm5vdCBhbHdheXMgZGV0ZXJtaW5lIHRoZSB2YWxpZGl0eSBvZiBhIGdpdmVuIG1hdGNoLiBUaGlzIGNsYXNzIGFwcGxpZXMgYSBiaXQgb2YgYWRkaXRpb25hbCBsb2dpYyB0byBmaWx0ZXIgb3V0IGFueVxyXG5cdCAqIGZhbHNlIHBvc2l0aXZlcyB0aGF0IGhhdmUgYmVlbiBtYXRjaGVkIGJ5IHRoZSB7QGxpbmsgQXV0b2xpbmtlciNtYXRjaGVyUmVnZXh9LlxyXG5cdCAqL1xyXG5cdEF1dG9saW5rZXIuTWF0Y2hWYWxpZGF0b3IgPSBBdXRvbGlua2VyLlV0aWwuZXh0ZW5kKCBPYmplY3QsIHtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKiBAcHJvcGVydHkge1JlZ0V4cH0gaW52YWxpZFByb3RvY29sUmVsTWF0Y2hSZWdleFxyXG5cdFx0ICogXHJcblx0XHQgKiBUaGUgcmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gY2hlY2sgYSBwb3RlbnRpYWwgcHJvdG9jb2wtcmVsYXRpdmUgVVJMIG1hdGNoLCBjb21pbmcgZnJvbSB0aGUgXHJcblx0XHQgKiB7QGxpbmsgQXV0b2xpbmtlciNtYXRjaGVyUmVnZXh9LiBBIHByb3RvY29sLXJlbGF0aXZlIFVSTCBpcywgZm9yIGV4YW1wbGUsIFwiLy95YWhvby5jb21cIlxyXG5cdFx0ICogXHJcblx0XHQgKiBUaGlzIHJlZ3VsYXIgZXhwcmVzc2lvbiBjaGVja3MgdG8gc2VlIGlmIHRoZXJlIGlzIGEgd29yZCBjaGFyYWN0ZXIgYmVmb3JlIHRoZSAnLy8nIG1hdGNoIGluIG9yZGVyIHRvIGRldGVybWluZSBpZiBcclxuXHRcdCAqIHdlIHNob3VsZCBhY3R1YWxseSBhdXRvbGluayBhIHByb3RvY29sLXJlbGF0aXZlIFVSTC4gVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSB0aGVyZSBpcyBubyBuZWdhdGl2ZSBsb29rLWJlaGluZCBpbiBcclxuXHRcdCAqIEphdmFTY3JpcHQgcmVndWxhciBleHByZXNzaW9ucy4gXHJcblx0XHQgKiBcclxuXHRcdCAqIEZvciBpbnN0YW5jZSwgd2Ugd2FudCB0byBhdXRvbGluayBzb21ldGhpbmcgbGlrZSBcIkdvIHRvOiAvL2dvb2dsZS5jb21cIiwgYnV0IHdlIGRvbid0IHdhbnQgdG8gYXV0b2xpbmsgc29tZXRoaW5nIFxyXG5cdFx0ICogbGlrZSBcImFiYy8vZ29vZ2xlLmNvbVwiXHJcblx0XHQgKi9cclxuXHRcdGludmFsaWRQcm90b2NvbFJlbE1hdGNoUmVnZXggOiAvXltcXHddXFwvXFwvLyxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlZ2V4IHRvIHRlc3QgZm9yIGEgZnVsbCBwcm90b2NvbCwgd2l0aCB0aGUgdHdvIHRyYWlsaW5nIHNsYXNoZXMuIEV4OiAnaHR0cDovLydcclxuXHRcdCAqIFxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBoYXNGdWxsUHJvdG9jb2xSZWdleFxyXG5cdFx0ICovXHJcblx0XHRoYXNGdWxsUHJvdG9jb2xSZWdleCA6IC9eW0EtWmEtel1bLS4rQS1aYS16MC05XSs6XFwvXFwvLyxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlZ2V4IHRvIGZpbmQgdGhlIFVSSSBzY2hlbWUsIHN1Y2ggYXMgJ21haWx0bzonLlxyXG5cdFx0ICogXHJcblx0XHQgKiBUaGlzIGlzIHVzZWQgdG8gZmlsdGVyIG91dCAnamF2YXNjcmlwdDonIGFuZCAndmJzY3JpcHQ6JyBzY2hlbWVzLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICogQHByb3BlcnR5IHtSZWdFeHB9IHVyaVNjaGVtZVJlZ2V4XHJcblx0XHQgKi9cclxuXHRcdHVyaVNjaGVtZVJlZ2V4IDogL15bQS1aYS16XVstLitBLVphLXowLTldKzovLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVnZXggdG8gZGV0ZXJtaW5lIGlmIGF0IGxlYXN0IG9uZSB3b3JkIGNoYXIgZXhpc3RzIGFmdGVyIHRoZSBwcm90b2NvbCAoaS5lLiBhZnRlciB0aGUgJzonKVxyXG5cdFx0ICogXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICogQHByb3BlcnR5IHtSZWdFeHB9IGhhc1dvcmRDaGFyQWZ0ZXJQcm90b2NvbFJlZ2V4XHJcblx0XHQgKi9cclxuXHRcdGhhc1dvcmRDaGFyQWZ0ZXJQcm90b2NvbFJlZ2V4IDogLzpbXlxcc10qP1tBLVphLXpdLyxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBEZXRlcm1pbmVzIGlmIGEgZ2l2ZW4gbWF0Y2ggZm91bmQgYnkge0BsaW5rIEF1dG9saW5rZXIjcHJvY2Vzc1RleHROb2RlfSBpcyB2YWxpZC4gV2lsbCByZXR1cm4gYGZhbHNlYCBmb3I6XHJcblx0XHQgKiBcclxuXHRcdCAqIDEpIFVSTCBtYXRjaGVzIHdoaWNoIGRvIG5vdCBoYXZlIGF0IGxlYXN0IGhhdmUgb25lIHBlcmlvZCAoJy4nKSBpbiB0aGUgZG9tYWluIG5hbWUgKGVmZmVjdGl2ZWx5IHNraXBwaW5nIG92ZXIgXHJcblx0XHQgKiAgICBtYXRjaGVzIGxpa2UgXCJhYmM6ZGVmXCIpLiBIb3dldmVyLCBVUkwgbWF0Y2hlcyB3aXRoIGEgcHJvdG9jb2wgd2lsbCBiZSBhbGxvd2VkIChleDogJ2h0dHA6Ly9sb2NhbGhvc3QnKVxyXG5cdFx0ICogMikgVVJMIG1hdGNoZXMgd2hpY2ggZG8gbm90IGhhdmUgYXQgbGVhc3Qgb25lIHdvcmQgY2hhcmFjdGVyIGluIHRoZSBkb21haW4gbmFtZSAoZWZmZWN0aXZlbHkgc2tpcHBpbmcgb3ZlclxyXG5cdFx0ICogICAgbWF0Y2hlcyBsaWtlIFwiZ2l0OjEuMFwiKS5cclxuXHRcdCAqIDMpIEEgcHJvdG9jb2wtcmVsYXRpdmUgdXJsIG1hdGNoIChhIFVSTCBiZWdpbm5pbmcgd2l0aCAnLy8nKSB3aG9zZSBwcmV2aW91cyBjaGFyYWN0ZXIgaXMgYSB3b3JkIGNoYXJhY3RlciBcclxuXHRcdCAqICAgIChlZmZlY3RpdmVseSBza2lwcGluZyBvdmVyIHN0cmluZ3MgbGlrZSBcImFiYy8vZ29vZ2xlLmNvbVwiKVxyXG5cdFx0ICogXHJcblx0XHQgKiBPdGhlcndpc2UsIHJldHVybnMgYHRydWVgLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gdXJsTWF0Y2ggVGhlIG1hdGNoZWQgVVJMLCBpZiB0aGVyZSB3YXMgb25lLiBXaWxsIGJlIGFuIGVtcHR5IHN0cmluZyBpZiB0aGUgbWF0Y2ggaXMgbm90IGEgVVJMIG1hdGNoLlxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IHByb3RvY29sVXJsTWF0Y2ggVGhlIG1hdGNoIFVSTCBzdHJpbmcgZm9yIGEgcHJvdG9jb2wgbWF0Y2guIEV4OiAnaHR0cDovL3lhaG9vLmNvbScuIFRoaXMgaXMgdXNlZCB0byBtYXRjaFxyXG5cdFx0ICogICBzb21ldGhpbmcgbGlrZSAnaHR0cDovL2xvY2FsaG9zdCcsIHdoZXJlIHdlIHdvbid0IGRvdWJsZSBjaGVjayB0aGF0IHRoZSBkb21haW4gbmFtZSBoYXMgYXQgbGVhc3Qgb25lICcuJyBpbiBpdC5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBwcm90b2NvbFJlbGF0aXZlTWF0Y2ggVGhlIHByb3RvY29sLXJlbGF0aXZlIHN0cmluZyBmb3IgYSBVUkwgbWF0Y2ggKGkuZS4gJy8vJyksIHBvc3NpYmx5IHdpdGggYSBwcmVjZWRpbmdcclxuXHRcdCAqICAgY2hhcmFjdGVyIChleCwgYSBzcGFjZSwgc3VjaCBhczogJyAvLycsIG9yIGEgbGV0dGVyLCBzdWNoIGFzOiAnYS8vJykuIFRoZSBtYXRjaCBpcyBpbnZhbGlkIGlmIHRoZXJlIGlzIGEgd29yZCBjaGFyYWN0ZXJcclxuXHRcdCAqICAgcHJlY2VkaW5nIHRoZSAnLy8nLlxyXG5cdFx0ICogQHJldHVybiB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBtYXRjaCBnaXZlbiBpcyB2YWxpZCBhbmQgc2hvdWxkIGJlIHByb2Nlc3NlZCwgb3IgYGZhbHNlYCBpZiB0aGUgbWF0Y2ggaXMgaW52YWxpZCBhbmQvb3IgXHJcblx0XHQgKiAgIHNob3VsZCBqdXN0IG5vdCBiZSBwcm9jZXNzZWQuXHJcblx0XHQgKi9cclxuXHRcdGlzVmFsaWRNYXRjaCA6IGZ1bmN0aW9uKCB1cmxNYXRjaCwgcHJvdG9jb2xVcmxNYXRjaCwgcHJvdG9jb2xSZWxhdGl2ZU1hdGNoICkge1xyXG5cdFx0XHRpZihcclxuXHRcdFx0XHQoIHByb3RvY29sVXJsTWF0Y2ggJiYgIXRoaXMuaXNWYWxpZFVyaVNjaGVtZSggcHJvdG9jb2xVcmxNYXRjaCApICkgfHxcclxuXHRcdFx0XHR0aGlzLnVybE1hdGNoRG9lc05vdEhhdmVQcm90b2NvbE9yRG90KCB1cmxNYXRjaCwgcHJvdG9jb2xVcmxNYXRjaCApIHx8ICAgICAgIC8vIEF0IGxlYXN0IG9uZSBwZXJpb2QgKCcuJykgbXVzdCBleGlzdCBpbiB0aGUgVVJMIG1hdGNoIGZvciB1cyB0byBjb25zaWRlciBpdCBhbiBhY3R1YWwgVVJMLCAqdW5sZXNzKiBpdCB3YXMgYSBmdWxsIHByb3RvY29sIG1hdGNoIChsaWtlICdodHRwOi8vbG9jYWxob3N0JylcclxuXHRcdFx0XHR0aGlzLnVybE1hdGNoRG9lc05vdEhhdmVBdExlYXN0T25lV29yZENoYXIoIHVybE1hdGNoLCBwcm90b2NvbFVybE1hdGNoICkgfHwgIC8vIEF0IGxlYXN0IG9uZSBsZXR0ZXIgY2hhcmFjdGVyIG11c3QgZXhpc3QgaW4gdGhlIGRvbWFpbiBuYW1lIGFmdGVyIGEgcHJvdG9jb2wgbWF0Y2guIEV4OiBza2lwIG92ZXIgc29tZXRoaW5nIGxpa2UgXCJnaXQ6MS4wXCJcclxuXHRcdFx0XHR0aGlzLmlzSW52YWxpZFByb3RvY29sUmVsYXRpdmVNYXRjaCggcHJvdG9jb2xSZWxhdGl2ZU1hdGNoICkgICAgICAgICAgICAgICAgIC8vIEEgcHJvdG9jb2wtcmVsYXRpdmUgbWF0Y2ggd2hpY2ggaGFzIGEgd29yZCBjaGFyYWN0ZXIgaW4gZnJvbnQgb2YgaXQgKHNvIHdlIGNhbiBza2lwIHNvbWV0aGluZyBsaWtlIFwiYWJjLy9nb29nbGUuY29tXCIpXHJcblx0XHRcdCkge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIERldGVybWluZXMgaWYgdGhlIFVSSSBzY2hlbWUgaXMgYSB2YWxpZCBzY2hlbWUgdG8gYmUgYXV0b2xpbmtlZC4gUmV0dXJucyBgZmFsc2VgIGlmIHRoZSBzY2hlbWUgaXMgXHJcblx0XHQgKiAnamF2YXNjcmlwdDonIG9yICd2YnNjcmlwdDonXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gdXJpU2NoZW1lTWF0Y2ggVGhlIG1hdGNoIFVSTCBzdHJpbmcgZm9yIGEgZnVsbCBVUkkgc2NoZW1lIG1hdGNoLiBFeDogJ2h0dHA6Ly95YWhvby5jb20nIFxyXG5cdFx0ICogICBvciAnbWFpbHRvOmFAYS5jb20nLlxyXG5cdFx0ICogQHJldHVybiB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBzY2hlbWUgaXMgYSB2YWxpZCBvbmUsIGBmYWxzZWAgb3RoZXJ3aXNlLlxyXG5cdFx0ICovXHJcblx0XHRpc1ZhbGlkVXJpU2NoZW1lIDogZnVuY3Rpb24oIHVyaVNjaGVtZU1hdGNoICkge1xyXG5cdFx0XHR2YXIgdXJpU2NoZW1lID0gdXJpU2NoZW1lTWF0Y2gubWF0Y2goIHRoaXMudXJpU2NoZW1lUmVnZXggKVsgMCBdO1xyXG5cclxuXHRcdFx0cmV0dXJuICggdXJpU2NoZW1lICE9PSAnamF2YXNjcmlwdDonICYmIHVyaVNjaGVtZSAhPT0gJ3Zic2NyaXB0OicgKTtcclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRGV0ZXJtaW5lcyBpZiBhIFVSTCBtYXRjaCBkb2VzIG5vdCBoYXZlIGVpdGhlcjpcclxuXHRcdCAqIFxyXG5cdFx0ICogYSkgYSBmdWxsIHByb3RvY29sIChpLmUuICdodHRwOi8vJyksIG9yXHJcblx0XHQgKiBiKSBhdCBsZWFzdCBvbmUgZG90ICgnLicpIGluIHRoZSBkb21haW4gbmFtZSAoZm9yIGEgbm9uLWZ1bGwtcHJvdG9jb2wgbWF0Y2gpLlxyXG5cdFx0ICogXHJcblx0XHQgKiBFaXRoZXIgc2l0dWF0aW9uIGlzIGNvbnNpZGVyZWQgYW4gaW52YWxpZCBVUkwgKGV4OiAnZ2l0OmQnIGRvZXMgbm90IGhhdmUgZWl0aGVyIHRoZSAnOi8vJyBwYXJ0LCBvciBhdCBsZWFzdCBvbmUgZG90XHJcblx0XHQgKiBpbiB0aGUgZG9tYWluIG5hbWUuIElmIHRoZSBtYXRjaCB3YXMgJ2dpdDphYmMuY29tJywgd2Ugd291bGQgY29uc2lkZXIgdGhpcyB2YWxpZC4pXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gdXJsTWF0Y2ggVGhlIG1hdGNoZWQgVVJMLCBpZiB0aGVyZSB3YXMgb25lLiBXaWxsIGJlIGFuIGVtcHR5IHN0cmluZyBpZiB0aGUgbWF0Y2ggaXMgbm90IGEgVVJMIG1hdGNoLlxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IHByb3RvY29sVXJsTWF0Y2ggVGhlIG1hdGNoIFVSTCBzdHJpbmcgZm9yIGEgcHJvdG9jb2wgbWF0Y2guIEV4OiAnaHR0cDovL3lhaG9vLmNvbScuIFRoaXMgaXMgdXNlZCB0byBtYXRjaFxyXG5cdFx0ICogICBzb21ldGhpbmcgbGlrZSAnaHR0cDovL2xvY2FsaG9zdCcsIHdoZXJlIHdlIHdvbid0IGRvdWJsZSBjaGVjayB0aGF0IHRoZSBkb21haW4gbmFtZSBoYXMgYXQgbGVhc3Qgb25lICcuJyBpbiBpdC5cclxuXHRcdCAqIEByZXR1cm4ge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgVVJMIG1hdGNoIGRvZXMgbm90IGhhdmUgYSBmdWxsIHByb3RvY29sLCBvciBhdCBsZWFzdCBvbmUgZG90ICgnLicpIGluIGEgbm9uLWZ1bGwtcHJvdG9jb2xcclxuXHRcdCAqICAgbWF0Y2guXHJcblx0XHQgKi9cclxuXHRcdHVybE1hdGNoRG9lc05vdEhhdmVQcm90b2NvbE9yRG90IDogZnVuY3Rpb24oIHVybE1hdGNoLCBwcm90b2NvbFVybE1hdGNoICkge1xyXG5cdFx0XHRyZXR1cm4gKCAhIXVybE1hdGNoICYmICggIXByb3RvY29sVXJsTWF0Y2ggfHwgIXRoaXMuaGFzRnVsbFByb3RvY29sUmVnZXgudGVzdCggcHJvdG9jb2xVcmxNYXRjaCApICkgJiYgdXJsTWF0Y2guaW5kZXhPZiggJy4nICkgPT09IC0xICk7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIERldGVybWluZXMgaWYgYSBVUkwgbWF0Y2ggZG9lcyBub3QgaGF2ZSBhdCBsZWFzdCBvbmUgd29yZCBjaGFyYWN0ZXIgYWZ0ZXIgdGhlIHByb3RvY29sIChpLmUuIGluIHRoZSBkb21haW4gbmFtZSkuXHJcblx0XHQgKiBcclxuXHRcdCAqIEF0IGxlYXN0IG9uZSBsZXR0ZXIgY2hhcmFjdGVyIG11c3QgZXhpc3QgaW4gdGhlIGRvbWFpbiBuYW1lIGFmdGVyIGEgcHJvdG9jb2wgbWF0Y2guIEV4OiBza2lwIG92ZXIgc29tZXRoaW5nIFxyXG5cdFx0ICogbGlrZSBcImdpdDoxLjBcIlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IHVybE1hdGNoIFRoZSBtYXRjaGVkIFVSTCwgaWYgdGhlcmUgd2FzIG9uZS4gV2lsbCBiZSBhbiBlbXB0eSBzdHJpbmcgaWYgdGhlIG1hdGNoIGlzIG5vdCBhIFVSTCBtYXRjaC5cclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBwcm90b2NvbFVybE1hdGNoIFRoZSBtYXRjaCBVUkwgc3RyaW5nIGZvciBhIHByb3RvY29sIG1hdGNoLiBFeDogJ2h0dHA6Ly95YWhvby5jb20nLiBUaGlzIGlzIHVzZWQgdG9cclxuXHRcdCAqICAga25vdyB3aGV0aGVyIG9yIG5vdCB3ZSBoYXZlIGEgcHJvdG9jb2wgaW4gdGhlIFVSTCBzdHJpbmcsIGluIG9yZGVyIHRvIGNoZWNrIGZvciBhIHdvcmQgY2hhcmFjdGVyIGFmdGVyIHRoZSBwcm90b2NvbFxyXG5cdFx0ICogICBzZXBhcmF0b3IgKCc6JykuXHJcblx0XHQgKiBAcmV0dXJuIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIFVSTCBtYXRjaCBkb2VzIG5vdCBoYXZlIGF0IGxlYXN0IG9uZSB3b3JkIGNoYXJhY3RlciBpbiBpdCBhZnRlciB0aGUgcHJvdG9jb2wsIGBmYWxzZWBcclxuXHRcdCAqICAgb3RoZXJ3aXNlLlxyXG5cdFx0ICovXHJcblx0XHR1cmxNYXRjaERvZXNOb3RIYXZlQXRMZWFzdE9uZVdvcmRDaGFyIDogZnVuY3Rpb24oIHVybE1hdGNoLCBwcm90b2NvbFVybE1hdGNoICkge1xyXG5cdFx0XHRpZiggdXJsTWF0Y2ggJiYgcHJvdG9jb2xVcmxNYXRjaCApIHtcclxuXHRcdFx0XHRyZXR1cm4gIXRoaXMuaGFzV29yZENoYXJBZnRlclByb3RvY29sUmVnZXgudGVzdCggdXJsTWF0Y2ggKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRGV0ZXJtaW5lcyBpZiBhIHByb3RvY29sLXJlbGF0aXZlIG1hdGNoIGlzIGFuIGludmFsaWQgb25lLiBUaGlzIG1ldGhvZCByZXR1cm5zIGB0cnVlYCBpZiB0aGVyZSBpcyBhIGBwcm90b2NvbFJlbGF0aXZlTWF0Y2hgLFxyXG5cdFx0ICogYW5kIHRoYXQgbWF0Y2ggY29udGFpbnMgYSB3b3JkIGNoYXJhY3RlciBiZWZvcmUgdGhlICcvLycgKGkuZS4gaXQgbXVzdCBjb250YWluIHdoaXRlc3BhY2Ugb3Igbm90aGluZyBiZWZvcmUgdGhlICcvLycgaW5cclxuXHRcdCAqIG9yZGVyIHRvIGJlIGNvbnNpZGVyZWQgdmFsaWQpLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IHByb3RvY29sUmVsYXRpdmVNYXRjaCBUaGUgcHJvdG9jb2wtcmVsYXRpdmUgc3RyaW5nIGZvciBhIFVSTCBtYXRjaCAoaS5lLiAnLy8nKSwgcG9zc2libHkgd2l0aCBhIHByZWNlZGluZ1xyXG5cdFx0ICogICBjaGFyYWN0ZXIgKGV4LCBhIHNwYWNlLCBzdWNoIGFzOiAnIC8vJywgb3IgYSBsZXR0ZXIsIHN1Y2ggYXM6ICdhLy8nKS4gVGhlIG1hdGNoIGlzIGludmFsaWQgaWYgdGhlcmUgaXMgYSB3b3JkIGNoYXJhY3RlclxyXG5cdFx0ICogICBwcmVjZWRpbmcgdGhlICcvLycuXHJcblx0XHQgKiBAcmV0dXJuIHtCb29sZWFufSBgdHJ1ZWAgaWYgaXQgaXMgYW4gaW52YWxpZCBwcm90b2NvbC1yZWxhdGl2ZSBtYXRjaCwgYGZhbHNlYCBvdGhlcndpc2UuXHJcblx0XHQgKi9cclxuXHRcdGlzSW52YWxpZFByb3RvY29sUmVsYXRpdmVNYXRjaCA6IGZ1bmN0aW9uKCBwcm90b2NvbFJlbGF0aXZlTWF0Y2ggKSB7XHJcblx0XHRcdHJldHVybiAoICEhcHJvdG9jb2xSZWxhdGl2ZU1hdGNoICYmIHRoaXMuaW52YWxpZFByb3RvY29sUmVsTWF0Y2hSZWdleC50ZXN0KCBwcm90b2NvbFJlbGF0aXZlTWF0Y2ggKSApO1xyXG5cdFx0fVxyXG5cclxuXHR9ICk7XHJcblx0LypnbG9iYWwgQXV0b2xpbmtlciAqL1xyXG5cdC8qanNoaW50IHN1Yjp0cnVlICovXHJcblx0LyoqXHJcblx0ICogQHByb3RlY3RlZFxyXG5cdCAqIEBjbGFzcyBBdXRvbGlua2VyLkFuY2hvclRhZ0J1aWxkZXJcclxuXHQgKiBAZXh0ZW5kcyBPYmplY3RcclxuXHQgKiBcclxuXHQgKiBCdWlsZHMgYW5jaG9yICgmbHQ7YSZndDspIHRhZ3MgZm9yIHRoZSBBdXRvbGlua2VyIHV0aWxpdHkgd2hlbiBhIG1hdGNoIGlzIGZvdW5kLlxyXG5cdCAqIFxyXG5cdCAqIE5vcm1hbGx5IHRoaXMgY2xhc3MgaXMgaW5zdGFudGlhdGVkLCBjb25maWd1cmVkLCBhbmQgdXNlZCBpbnRlcm5hbGx5IGJ5IGFuIHtAbGluayBBdXRvbGlua2VyfSBpbnN0YW5jZSwgYnV0IG1heSBcclxuXHQgKiBhY3R1YWxseSBiZSByZXRyaWV2ZWQgaW4gYSB7QGxpbmsgQXV0b2xpbmtlciNyZXBsYWNlRm4gcmVwbGFjZUZufSB0byBjcmVhdGUge0BsaW5rIEF1dG9saW5rZXIuSHRtbFRhZyBIdG1sVGFnfSBpbnN0YW5jZXNcclxuXHQgKiB3aGljaCBtYXkgYmUgbW9kaWZpZWQgYmVmb3JlIHJldHVybmluZyBmcm9tIHRoZSB7QGxpbmsgQXV0b2xpbmtlciNyZXBsYWNlRm4gcmVwbGFjZUZufS4gRm9yIGV4YW1wbGU6XHJcblx0ICogXHJcblx0ICogICAgIHZhciBodG1sID0gQXV0b2xpbmtlci5saW5rKCBcIlRlc3QgZ29vZ2xlLmNvbVwiLCB7XHJcblx0ICogICAgICAgICByZXBsYWNlRm4gOiBmdW5jdGlvbiggYXV0b2xpbmtlciwgbWF0Y2ggKSB7XHJcblx0ICogICAgICAgICAgICAgdmFyIHRhZyA9IGF1dG9saW5rZXIuZ2V0VGFnQnVpbGRlcigpLmJ1aWxkKCBtYXRjaCApOyAgLy8gcmV0dXJucyBhbiB7QGxpbmsgQXV0b2xpbmtlci5IdG1sVGFnfSBpbnN0YW5jZVxyXG5cdCAqICAgICAgICAgICAgIHRhZy5zZXRBdHRyKCAncmVsJywgJ25vZm9sbG93JyApO1xyXG5cdCAqICAgICAgICAgICAgIFxyXG5cdCAqICAgICAgICAgICAgIHJldHVybiB0YWc7XHJcblx0ICogICAgICAgICB9XHJcblx0ICogICAgIH0gKTtcclxuXHQgKiAgICAgXHJcblx0ICogICAgIC8vIGdlbmVyYXRlZCBodG1sOlxyXG5cdCAqICAgICAvLyAgIFRlc3QgPGEgaHJlZj1cImh0dHA6Ly9nb29nbGUuY29tXCIgdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9mb2xsb3dcIj5nb29nbGUuY29tPC9hPlxyXG5cdCAqL1xyXG5cdEF1dG9saW5rZXIuQW5jaG9yVGFnQnVpbGRlciA9IEF1dG9saW5rZXIuVXRpbC5leHRlbmQoIE9iamVjdCwge1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQGNmZyB7Qm9vbGVhbn0gbmV3V2luZG93XHJcblx0XHQgKiBAaW5oZXJpdGRvYyBBdXRvbGlua2VyI25ld1dpbmRvd1xyXG5cdFx0ICovXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAY2ZnIHtOdW1iZXJ9IHRydW5jYXRlXHJcblx0XHQgKiBAaW5oZXJpdGRvYyBBdXRvbGlua2VyI3RydW5jYXRlXHJcblx0XHQgKi9cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBjZmcge1N0cmluZ30gY2xhc3NOYW1lXHJcblx0XHQgKiBAaW5oZXJpdGRvYyBBdXRvbGlua2VyI2NsYXNzTmFtZVxyXG5cdFx0ICovXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQGNvbnN0cnVjdG9yXHJcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gW2NmZ10gVGhlIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgdGhlIEFuY2hvclRhZ0J1aWxkZXIgaW5zdGFuY2UsIHNwZWNpZmllZCBpbiBhbiBPYmplY3QgKG1hcCkuXHJcblx0XHQgKi9cclxuXHRcdGNvbnN0cnVjdG9yIDogZnVuY3Rpb24oIGNmZyApIHtcclxuXHRcdFx0QXV0b2xpbmtlci5VdGlsLmFzc2lnbiggdGhpcywgY2ZnICk7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdlbmVyYXRlcyB0aGUgYWN0dWFsIGFuY2hvciAoJmx0O2EmZ3Q7KSB0YWcgdG8gdXNlIGluIHBsYWNlIG9mIHRoZSBtYXRjaGVkIFVSTC9lbWFpbC9Ud2l0dGVyIHRleHQsXHJcblx0XHQgKiB2aWEgaXRzIGBtYXRjaGAgb2JqZWN0LlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcGFyYW0ge0F1dG9saW5rZXIubWF0Y2guTWF0Y2h9IG1hdGNoIFRoZSBNYXRjaCBpbnN0YW5jZSB0byBnZW5lcmF0ZSBhbiBhbmNob3IgdGFnIGZyb20uXHJcblx0XHQgKiBAcmV0dXJuIHtBdXRvbGlua2VyLkh0bWxUYWd9IFRoZSBIdG1sVGFnIGluc3RhbmNlIGZvciB0aGUgYW5jaG9yIHRhZy5cclxuXHRcdCAqL1xyXG5cdFx0YnVpbGQgOiBmdW5jdGlvbiggbWF0Y2ggKSB7XHJcblx0XHRcdHZhciB0YWcgPSBuZXcgQXV0b2xpbmtlci5IdG1sVGFnKCB7XHJcblx0XHRcdFx0dGFnTmFtZSAgIDogJ2EnLFxyXG5cdFx0XHRcdGF0dHJzICAgICA6IHRoaXMuY3JlYXRlQXR0cnMoIG1hdGNoLmdldFR5cGUoKSwgbWF0Y2guZ2V0QW5jaG9ySHJlZigpICksXHJcblx0XHRcdFx0aW5uZXJIdG1sIDogdGhpcy5wcm9jZXNzQW5jaG9yVGV4dCggbWF0Y2guZ2V0QW5jaG9yVGV4dCgpIClcclxuXHRcdFx0fSApO1xyXG5cclxuXHRcdFx0cmV0dXJuIHRhZztcclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3JlYXRlcyB0aGUgT2JqZWN0IChtYXApIG9mIHRoZSBIVE1MIGF0dHJpYnV0ZXMgZm9yIHRoZSBhbmNob3IgKCZsdDthJmd0OykgdGFnIGJlaW5nIGdlbmVyYXRlZC5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHByb3RlY3RlZFxyXG5cdFx0ICogQHBhcmFtIHtcInVybFwiL1wiZW1haWxcIi9cInR3aXR0ZXJcIn0gbWF0Y2hUeXBlIFRoZSB0eXBlIG9mIG1hdGNoIHRoYXQgYW4gYW5jaG9yIHRhZyBpcyBiZWluZyBnZW5lcmF0ZWQgZm9yLlxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGhyZWYgVGhlIGhyZWYgZm9yIHRoZSBhbmNob3IgdGFnLlxyXG5cdFx0ICogQHJldHVybiB7T2JqZWN0fSBBIGtleS92YWx1ZSBPYmplY3QgKG1hcCkgb2YgdGhlIGFuY2hvciB0YWcncyBhdHRyaWJ1dGVzLiBcclxuXHRcdCAqL1xyXG5cdFx0Y3JlYXRlQXR0cnMgOiBmdW5jdGlvbiggbWF0Y2hUeXBlLCBhbmNob3JIcmVmICkge1xyXG5cdFx0XHR2YXIgYXR0cnMgPSB7XHJcblx0XHRcdFx0J2hyZWYnIDogYW5jaG9ySHJlZiAgLy8gd2UnbGwgYWx3YXlzIGhhdmUgdGhlIGBocmVmYCBhdHRyaWJ1dGVcclxuXHRcdFx0fTtcclxuXHJcblx0XHRcdHZhciBjc3NDbGFzcyA9IHRoaXMuY3JlYXRlQ3NzQ2xhc3MoIG1hdGNoVHlwZSApO1xyXG5cdFx0XHRpZiggY3NzQ2xhc3MgKSB7XHJcblx0XHRcdFx0YXR0cnNbICdjbGFzcycgXSA9IGNzc0NsYXNzO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKCB0aGlzLm5ld1dpbmRvdyApIHtcclxuXHRcdFx0XHRhdHRyc1sgJ3RhcmdldCcgXSA9IFwiX2JsYW5rXCI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiBhdHRycztcclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3JlYXRlcyB0aGUgQ1NTIGNsYXNzIHRoYXQgd2lsbCBiZSB1c2VkIGZvciBhIGdpdmVuIGFuY2hvciB0YWcsIGJhc2VkIG9uIHRoZSBgbWF0Y2hUeXBlYCBhbmQgdGhlIHtAbGluayAjY2xhc3NOYW1lfVxyXG5cdFx0ICogY29uZmlnLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICogQHBhcmFtIHtcInVybFwiL1wiZW1haWxcIi9cInR3aXR0ZXJcIn0gbWF0Y2hUeXBlIFRoZSB0eXBlIG9mIG1hdGNoIHRoYXQgYW4gYW5jaG9yIHRhZyBpcyBiZWluZyBnZW5lcmF0ZWQgZm9yLlxyXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfSBUaGUgQ1NTIGNsYXNzIHN0cmluZyBmb3IgdGhlIGxpbmsuIEV4YW1wbGUgcmV0dXJuOiBcIm15TGluayBteUxpbmstdXJsXCIuIElmIG5vIHtAbGluayAjY2xhc3NOYW1lfVxyXG5cdFx0ICogICB3YXMgY29uZmlndXJlZCwgcmV0dXJucyBhbiBlbXB0eSBzdHJpbmcuXHJcblx0XHQgKi9cclxuXHRcdGNyZWF0ZUNzc0NsYXNzIDogZnVuY3Rpb24oIG1hdGNoVHlwZSApIHtcclxuXHRcdFx0dmFyIGNsYXNzTmFtZSA9IHRoaXMuY2xhc3NOYW1lO1xyXG5cclxuXHRcdFx0aWYoICFjbGFzc05hbWUgKSBcclxuXHRcdFx0XHRyZXR1cm4gXCJcIjtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHJldHVybiBjbGFzc05hbWUgKyBcIiBcIiArIGNsYXNzTmFtZSArIFwiLVwiICsgbWF0Y2hUeXBlOyAgLy8gZXg6IFwibXlMaW5rIG15TGluay11cmxcIiwgXCJteUxpbmsgbXlMaW5rLWVtYWlsXCIsIG9yIFwibXlMaW5rIG15TGluay10d2l0dGVyXCJcclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUHJvY2Vzc2VzIHRoZSBgYW5jaG9yVGV4dGAgYnkgdHJ1bmNhdGluZyB0aGUgdGV4dCBhY2NvcmRpbmcgdG8gdGhlIHtAbGluayAjdHJ1bmNhdGV9IGNvbmZpZy5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBhbmNob3JUZXh0IFRoZSBhbmNob3IgdGFnJ3MgdGV4dCAoaS5lLiB3aGF0IHdpbGwgYmUgZGlzcGxheWVkKS5cclxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ30gVGhlIHByb2Nlc3NlZCBgYW5jaG9yVGV4dGAuXHJcblx0XHQgKi9cclxuXHRcdHByb2Nlc3NBbmNob3JUZXh0IDogZnVuY3Rpb24oIGFuY2hvclRleHQgKSB7XHJcblx0XHRcdGFuY2hvclRleHQgPSB0aGlzLmRvVHJ1bmNhdGUoIGFuY2hvclRleHQgKTtcclxuXHJcblx0XHRcdHJldHVybiBhbmNob3JUZXh0O1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBQZXJmb3JtcyB0aGUgdHJ1bmNhdGlvbiBvZiB0aGUgYGFuY2hvclRleHRgLCBpZiB0aGUgYGFuY2hvclRleHRgIGlzIGxvbmdlciB0aGFuIHRoZSB7QGxpbmsgI3RydW5jYXRlfSBvcHRpb24uXHJcblx0XHQgKiBUcnVuY2F0ZXMgdGhlIHRleHQgdG8gMiBjaGFyYWN0ZXJzIGZld2VyIHRoYW4gdGhlIHtAbGluayAjdHJ1bmNhdGV9IG9wdGlvbiwgYW5kIGFkZHMgXCIuLlwiIHRvIHRoZSBlbmQuXHJcblx0XHQgKiBcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gdGV4dCBUaGUgYW5jaG9yIHRhZydzIHRleHQgKGkuZS4gd2hhdCB3aWxsIGJlIGRpc3BsYXllZCkuXHJcblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSB0cnVuY2F0ZWQgYW5jaG9yIHRleHQuXHJcblx0XHQgKi9cclxuXHRcdGRvVHJ1bmNhdGUgOiBmdW5jdGlvbiggYW5jaG9yVGV4dCApIHtcclxuXHRcdFx0cmV0dXJuIEF1dG9saW5rZXIuVXRpbC5lbGxpcHNpcyggYW5jaG9yVGV4dCwgdGhpcy50cnVuY2F0ZSB8fCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKTtcclxuXHRcdH1cclxuXHJcblx0fSApO1xyXG5cdC8qZ2xvYmFsIEF1dG9saW5rZXIgKi9cclxuXHQvKipcclxuXHQgKiBAYWJzdHJhY3RcclxuXHQgKiBAY2xhc3MgQXV0b2xpbmtlci5tYXRjaC5NYXRjaFxyXG5cdCAqIFxyXG5cdCAqIFJlcHJlc2VudHMgYSBtYXRjaCBmb3VuZCBpbiBhbiBpbnB1dCBzdHJpbmcgd2hpY2ggc2hvdWxkIGJlIEF1dG9saW5rZWQuIEEgTWF0Y2ggb2JqZWN0IGlzIHdoYXQgaXMgcHJvdmlkZWQgaW4gYSBcclxuXHQgKiB7QGxpbmsgQXV0b2xpbmtlciNyZXBsYWNlRm4gcmVwbGFjZUZufSwgYW5kIG1heSBiZSB1c2VkIHRvIHF1ZXJ5IGZvciBkZXRhaWxzIGFib3V0IHRoZSBtYXRjaC5cclxuXHQgKiBcclxuXHQgKiBGb3IgZXhhbXBsZTpcclxuXHQgKiBcclxuXHQgKiAgICAgdmFyIGlucHV0ID0gXCIuLi5cIjsgIC8vIHN0cmluZyB3aXRoIFVSTHMsIEVtYWlsIEFkZHJlc3NlcywgYW5kIFR3aXR0ZXIgSGFuZGxlc1xyXG5cdCAqICAgICBcclxuXHQgKiAgICAgdmFyIGxpbmtlZFRleHQgPSBBdXRvbGlua2VyLmxpbmsoIGlucHV0LCB7XHJcblx0ICogICAgICAgICByZXBsYWNlRm4gOiBmdW5jdGlvbiggYXV0b2xpbmtlciwgbWF0Y2ggKSB7XHJcblx0ICogICAgICAgICAgICAgY29uc29sZS5sb2coIFwiaHJlZiA9IFwiLCBtYXRjaC5nZXRBbmNob3JIcmVmKCkgKTtcclxuXHQgKiAgICAgICAgICAgICBjb25zb2xlLmxvZyggXCJ0ZXh0ID0gXCIsIG1hdGNoLmdldEFuY2hvclRleHQoKSApO1xyXG5cdCAqICAgICAgICAgXHJcblx0ICogICAgICAgICAgICAgc3dpdGNoKCBtYXRjaC5nZXRUeXBlKCkgKSB7XHJcblx0ICogICAgICAgICAgICAgICAgIGNhc2UgJ3VybCcgOiBcclxuXHQgKiAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBcInVybDogXCIsIG1hdGNoLmdldFVybCgpICk7XHJcblx0ICogICAgICAgICAgICAgICAgICAgICBcclxuXHQgKiAgICAgICAgICAgICAgICAgY2FzZSAnZW1haWwnIDpcclxuXHQgKiAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBcImVtYWlsOiBcIiwgbWF0Y2guZ2V0RW1haWwoKSApO1xyXG5cdCAqICAgICAgICAgICAgICAgICAgICAgXHJcblx0ICogICAgICAgICAgICAgICAgIGNhc2UgJ3R3aXR0ZXInIDpcclxuXHQgKiAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBcInR3aXR0ZXI6IFwiLCBtYXRjaC5nZXRUd2l0dGVySGFuZGxlKCkgKTtcclxuXHQgKiAgICAgICAgICAgICB9XHJcblx0ICogICAgICAgICB9XHJcblx0ICogICAgIH0gKTtcclxuXHQgKiAgICAgXHJcblx0ICogU2VlIHRoZSB7QGxpbmsgQXV0b2xpbmtlcn0gY2xhc3MgZm9yIG1vcmUgZGV0YWlscyBvbiB1c2luZyB0aGUge0BsaW5rIEF1dG9saW5rZXIjcmVwbGFjZUZuIHJlcGxhY2VGbn0uXHJcblx0ICovXHJcblx0QXV0b2xpbmtlci5tYXRjaC5NYXRjaCA9IEF1dG9saW5rZXIuVXRpbC5leHRlbmQoIE9iamVjdCwge1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQGNmZyB7U3RyaW5nfSBtYXRjaGVkVGV4dCAocmVxdWlyZWQpXHJcblx0XHQgKiBcclxuXHRcdCAqIFRoZSBvcmlnaW5hbCB0ZXh0IHRoYXQgd2FzIG1hdGNoZWQuXHJcblx0XHQgKi9cclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAY29uc3RydWN0b3JcclxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBjZmcgVGhlIGNvbmZpZ3VyYXRpb24gcHJvcGVydGllcyBmb3IgdGhlIE1hdGNoIGluc3RhbmNlLCBzcGVjaWZpZWQgaW4gYW4gT2JqZWN0IChtYXApLlxyXG5cdFx0ICovXHJcblx0XHRjb25zdHJ1Y3RvciA6IGZ1bmN0aW9uKCBjZmcgKSB7XHJcblx0XHRcdEF1dG9saW5rZXIuVXRpbC5hc3NpZ24oIHRoaXMsIGNmZyApO1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZXR1cm5zIGEgc3RyaW5nIG5hbWUgZm9yIHRoZSB0eXBlIG9mIG1hdGNoIHRoYXQgdGhpcyBjbGFzcyByZXByZXNlbnRzLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAYWJzdHJhY3RcclxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ31cclxuXHRcdCAqL1xyXG5cdFx0Z2V0VHlwZSA6IEF1dG9saW5rZXIuVXRpbC5hYnN0cmFjdE1ldGhvZCxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZXR1cm5zIHRoZSBvcmlnaW5hbCB0ZXh0IHRoYXQgd2FzIG1hdGNoZWQuXHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ31cclxuXHRcdCAqL1xyXG5cdFx0Z2V0TWF0Y2hlZFRleHQgOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMubWF0Y2hlZFRleHQ7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJldHVybnMgdGhlIGFuY2hvciBocmVmIHRoYXQgc2hvdWxkIGJlIGdlbmVyYXRlZCBmb3IgdGhlIG1hdGNoLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAYWJzdHJhY3RcclxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ31cclxuXHRcdCAqL1xyXG5cdFx0Z2V0QW5jaG9ySHJlZiA6IEF1dG9saW5rZXIuVXRpbC5hYnN0cmFjdE1ldGhvZCxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZXR1cm5zIHRoZSBhbmNob3IgdGV4dCB0aGF0IHNob3VsZCBiZSBnZW5lcmF0ZWQgZm9yIHRoZSBtYXRjaC5cclxuXHRcdCAqIFxyXG5cdFx0ICogQGFic3RyYWN0XHJcblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9XHJcblx0XHQgKi9cclxuXHRcdGdldEFuY2hvclRleHQgOiBBdXRvbGlua2VyLlV0aWwuYWJzdHJhY3RNZXRob2RcclxuXHJcblx0fSApO1xyXG5cdC8qZ2xvYmFsIEF1dG9saW5rZXIgKi9cclxuXHQvKipcclxuXHQgKiBAY2xhc3MgQXV0b2xpbmtlci5tYXRjaC5FbWFpbFxyXG5cdCAqIEBleHRlbmRzIEF1dG9saW5rZXIubWF0Y2guTWF0Y2hcclxuXHQgKiBcclxuXHQgKiBSZXByZXNlbnRzIGEgRW1haWwgbWF0Y2ggZm91bmQgaW4gYW4gaW5wdXQgc3RyaW5nIHdoaWNoIHNob3VsZCBiZSBBdXRvbGlua2VkLlxyXG5cdCAqIFxyXG5cdCAqIFNlZSB0aGlzIGNsYXNzJ3Mgc3VwZXJjbGFzcyAoe0BsaW5rIEF1dG9saW5rZXIubWF0Y2guTWF0Y2h9KSBmb3IgbW9yZSBkZXRhaWxzLlxyXG5cdCAqL1xyXG5cdEF1dG9saW5rZXIubWF0Y2guRW1haWwgPSBBdXRvbGlua2VyLlV0aWwuZXh0ZW5kKCBBdXRvbGlua2VyLm1hdGNoLk1hdGNoLCB7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAY2ZnIHtTdHJpbmd9IGVtYWlsIChyZXF1aXJlZClcclxuXHRcdCAqIFxyXG5cdFx0ICogVGhlIGVtYWlsIGFkZHJlc3MgdGhhdCB3YXMgbWF0Y2hlZC5cclxuXHRcdCAqL1xyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJldHVybnMgYSBzdHJpbmcgbmFtZSBmb3IgdGhlIHR5cGUgb2YgbWF0Y2ggdGhhdCB0aGlzIGNsYXNzIHJlcHJlc2VudHMuXHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ31cclxuXHRcdCAqL1xyXG5cdFx0Z2V0VHlwZSA6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gJ2VtYWlsJztcclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmV0dXJucyB0aGUgZW1haWwgYWRkcmVzcyB0aGF0IHdhcyBtYXRjaGVkLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9XHJcblx0XHQgKi9cclxuXHRcdGdldEVtYWlsIDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmVtYWlsO1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZXR1cm5zIHRoZSBhbmNob3IgaHJlZiB0aGF0IHNob3VsZCBiZSBnZW5lcmF0ZWQgZm9yIHRoZSBtYXRjaC5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRnZXRBbmNob3JIcmVmIDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiAnbWFpbHRvOicgKyB0aGlzLmVtYWlsO1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZXR1cm5zIHRoZSBhbmNob3IgdGV4dCB0aGF0IHNob3VsZCBiZSBnZW5lcmF0ZWQgZm9yIHRoZSBtYXRjaC5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRnZXRBbmNob3JUZXh0IDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLmVtYWlsO1xyXG5cdFx0fVxyXG5cclxuXHR9ICk7XHJcblx0LypnbG9iYWwgQXV0b2xpbmtlciAqL1xyXG5cdC8qKlxyXG5cdCAqIEBjbGFzcyBBdXRvbGlua2VyLm1hdGNoLlR3aXR0ZXJcclxuXHQgKiBAZXh0ZW5kcyBBdXRvbGlua2VyLm1hdGNoLk1hdGNoXHJcblx0ICogXHJcblx0ICogUmVwcmVzZW50cyBhIFR3aXR0ZXIgbWF0Y2ggZm91bmQgaW4gYW4gaW5wdXQgc3RyaW5nIHdoaWNoIHNob3VsZCBiZSBBdXRvbGlua2VkLlxyXG5cdCAqIFxyXG5cdCAqIFNlZSB0aGlzIGNsYXNzJ3Mgc3VwZXJjbGFzcyAoe0BsaW5rIEF1dG9saW5rZXIubWF0Y2guTWF0Y2h9KSBmb3IgbW9yZSBkZXRhaWxzLlxyXG5cdCAqL1xyXG5cdEF1dG9saW5rZXIubWF0Y2guVHdpdHRlciA9IEF1dG9saW5rZXIuVXRpbC5leHRlbmQoIEF1dG9saW5rZXIubWF0Y2guTWF0Y2gsIHtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBjZmcge1N0cmluZ30gdHdpdHRlckhhbmRsZSAocmVxdWlyZWQpXHJcblx0XHQgKiBcclxuXHRcdCAqIFRoZSBUd2l0dGVyIGhhbmRsZSB0aGF0IHdhcyBtYXRjaGVkLlxyXG5cdFx0ICovXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmV0dXJucyB0aGUgdHlwZSBvZiBtYXRjaCB0aGF0IHRoaXMgY2xhc3MgcmVwcmVzZW50cy5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRnZXRUeXBlIDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiAndHdpdHRlcic7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJldHVybnMgYSBzdHJpbmcgbmFtZSBmb3IgdGhlIHR5cGUgb2YgbWF0Y2ggdGhhdCB0aGlzIGNsYXNzIHJlcHJlc2VudHMuXHJcblx0XHQgKiBcclxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ31cclxuXHRcdCAqL1xyXG5cdFx0Z2V0VHdpdHRlckhhbmRsZSA6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy50d2l0dGVySGFuZGxlO1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZXR1cm5zIHRoZSBhbmNob3IgaHJlZiB0aGF0IHNob3VsZCBiZSBnZW5lcmF0ZWQgZm9yIHRoZSBtYXRjaC5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRnZXRBbmNob3JIcmVmIDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiAnaHR0cHM6Ly90d2l0dGVyLmNvbS8nICsgdGhpcy50d2l0dGVySGFuZGxlO1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZXR1cm5zIHRoZSBhbmNob3IgdGV4dCB0aGF0IHNob3VsZCBiZSBnZW5lcmF0ZWQgZm9yIHRoZSBtYXRjaC5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRnZXRBbmNob3JUZXh0IDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiAnQCcgKyB0aGlzLnR3aXR0ZXJIYW5kbGU7XHJcblx0XHR9XHJcblxyXG5cdH0gKTtcclxuXHQvKmdsb2JhbCBBdXRvbGlua2VyICovXHJcblx0LyoqXHJcblx0ICogQGNsYXNzIEF1dG9saW5rZXIubWF0Y2guVXJsXHJcblx0ICogQGV4dGVuZHMgQXV0b2xpbmtlci5tYXRjaC5NYXRjaFxyXG5cdCAqIFxyXG5cdCAqIFJlcHJlc2VudHMgYSBVcmwgbWF0Y2ggZm91bmQgaW4gYW4gaW5wdXQgc3RyaW5nIHdoaWNoIHNob3VsZCBiZSBBdXRvbGlua2VkLlxyXG5cdCAqIFxyXG5cdCAqIFNlZSB0aGlzIGNsYXNzJ3Mgc3VwZXJjbGFzcyAoe0BsaW5rIEF1dG9saW5rZXIubWF0Y2guTWF0Y2h9KSBmb3IgbW9yZSBkZXRhaWxzLlxyXG5cdCAqL1xyXG5cdEF1dG9saW5rZXIubWF0Y2guVXJsID0gQXV0b2xpbmtlci5VdGlsLmV4dGVuZCggQXV0b2xpbmtlci5tYXRjaC5NYXRjaCwge1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQGNmZyB7U3RyaW5nfSB1cmwgKHJlcXVpcmVkKVxyXG5cdFx0ICogXHJcblx0XHQgKiBUaGUgdXJsIHRoYXQgd2FzIG1hdGNoZWQuXHJcblx0XHQgKi9cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEBjZmcge0Jvb2xlYW59IHByb3RvY29sVXJsTWF0Y2ggKHJlcXVpcmVkKVxyXG5cdFx0ICogXHJcblx0XHQgKiBgdHJ1ZWAgaWYgdGhlIFVSTCBpcyBhIG1hdGNoIHdoaWNoIGFscmVhZHkgaGFzIGEgcHJvdG9jb2wgKGkuZS4gJ2h0dHA6Ly8nKSwgYGZhbHNlYCBpZiB0aGUgbWF0Y2ggd2FzIGZyb20gYSAnd3d3JyBvclxyXG5cdFx0ICoga25vd24gVExEIG1hdGNoLlxyXG5cdFx0ICovXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAY2ZnIHtCb29sZWFufSBwcm90b2NvbFJlbGF0aXZlTWF0Y2ggKHJlcXVpcmVkKVxyXG5cdFx0ICogXHJcblx0XHQgKiBgdHJ1ZWAgaWYgdGhlIFVSTCBpcyBhIHByb3RvY29sLXJlbGF0aXZlIG1hdGNoLiBBIHByb3RvY29sLXJlbGF0aXZlIG1hdGNoIGlzIGEgVVJMIHRoYXQgc3RhcnRzIHdpdGggJy8vJyxcclxuXHRcdCAqIGFuZCB3aWxsIGJlIGVpdGhlciBodHRwOi8vIG9yIGh0dHBzOi8vIGJhc2VkIG9uIHRoZSBwcm90b2NvbCB0aGF0IHRoZSBzaXRlIGlzIGxvYWRlZCB1bmRlci5cclxuXHRcdCAqL1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQGNmZyB7Qm9vbGVhbn0gc3RyaXBQcmVmaXggKHJlcXVpcmVkKVxyXG5cdFx0ICogQGluaGVyaXRkb2MgQXV0b2xpbmtlciNzdHJpcFByZWZpeFxyXG5cdFx0ICovXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqIEBwcm9wZXJ0eSB7UmVnRXhwfSB1cmxQcmVmaXhSZWdleFxyXG5cdFx0ICogXHJcblx0XHQgKiBBIHJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIHRvIHJlbW92ZSB0aGUgJ2h0dHA6Ly8nIG9yICdodHRwczovLycgYW5kL29yIHRoZSAnd3d3LicgZnJvbSBVUkxzLlxyXG5cdFx0ICovXHJcblx0XHR1cmxQcmVmaXhSZWdleDogL14oaHR0cHM/OlxcL1xcLyk/KHd3d1xcLik/L2ksXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICogQHByb3BlcnR5IHtSZWdFeHB9IHByb3RvY29sUmVsYXRpdmVSZWdleFxyXG5cdFx0ICogXHJcblx0XHQgKiBUaGUgcmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gcmVtb3ZlIHRoZSBwcm90b2NvbC1yZWxhdGl2ZSAnLy8nIGZyb20gdGhlIHtAbGluayAjdXJsfSBzdHJpbmcsIGZvciBwdXJwb3Nlc1xyXG5cdFx0ICogb2Yge0BsaW5rICNnZXRBbmNob3JUZXh0fS4gQSBwcm90b2NvbC1yZWxhdGl2ZSBVUkwgaXMsIGZvciBleGFtcGxlLCBcIi8veWFob28uY29tXCJcclxuXHRcdCAqL1xyXG5cdFx0cHJvdG9jb2xSZWxhdGl2ZVJlZ2V4IDogL15cXC9cXC8vLFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gcHJvdG9jb2xQcmVwZW5kZWRcclxuXHRcdCAqIFxyXG5cdFx0ICogV2lsbCBiZSBzZXQgdG8gYHRydWVgIGlmIHRoZSAnaHR0cDovLycgcHJvdG9jb2wgaGFzIGJlZW4gcHJlcGVuZGVkIHRvIHRoZSB7QGxpbmsgI3VybH0gKGJlY2F1c2UgdGhlXHJcblx0XHQgKiB7QGxpbmsgI3VybH0gZGlkIG5vdCBoYXZlIGEgcHJvdG9jb2wpXHJcblx0XHQgKi9cclxuXHRcdHByb3RvY29sUHJlcGVuZGVkIDogZmFsc2UsXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmV0dXJucyBhIHN0cmluZyBuYW1lIGZvciB0aGUgdHlwZSBvZiBtYXRjaCB0aGF0IHRoaXMgY2xhc3MgcmVwcmVzZW50cy5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRnZXRUeXBlIDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiAndXJsJztcclxuXHRcdH0sXHJcblxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmV0dXJucyB0aGUgdXJsIHRoYXQgd2FzIG1hdGNoZWQsIGFzc3VtaW5nIHRoZSBwcm90b2NvbCB0byBiZSAnaHR0cDovLycgaWYgdGhlIG9yaWdpbmFsXHJcblx0XHQgKiBtYXRjaCB3YXMgbWlzc2luZyBhIHByb3RvY29sLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9XHJcblx0XHQgKi9cclxuXHRcdGdldFVybCA6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YXIgdXJsID0gdGhpcy51cmw7XHJcblxyXG5cdFx0XHQvLyBpZiB0aGUgdXJsIHN0cmluZyBkb2Vzbid0IGJlZ2luIHdpdGggYSBwcm90b2NvbCwgYXNzdW1lICdodHRwOi8vJ1xyXG5cdFx0XHRpZiggIXRoaXMucHJvdG9jb2xSZWxhdGl2ZU1hdGNoICYmICF0aGlzLnByb3RvY29sVXJsTWF0Y2ggJiYgIXRoaXMucHJvdG9jb2xQcmVwZW5kZWQgKSB7XHJcblx0XHRcdFx0dXJsID0gdGhpcy51cmwgPSAnaHR0cDovLycgKyB1cmw7XHJcblxyXG5cdFx0XHRcdHRoaXMucHJvdG9jb2xQcmVwZW5kZWQgPSB0cnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gdXJsO1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZXR1cm5zIHRoZSBhbmNob3IgaHJlZiB0aGF0IHNob3VsZCBiZSBnZW5lcmF0ZWQgZm9yIHRoZSBtYXRjaC5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfVxyXG5cdFx0ICovXHJcblx0XHRnZXRBbmNob3JIcmVmIDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciB1cmwgPSB0aGlzLmdldFVybCgpO1xyXG5cclxuXHRcdFx0cmV0dXJuIHVybC5yZXBsYWNlKCAvJmFtcDsvZywgJyYnICk7ICAvLyBhbnkgJmFtcDsncyBpbiB0aGUgVVJMIHNob3VsZCBiZSBjb252ZXJ0ZWQgYmFjayB0byAnJicgaWYgdGhleSB3ZXJlIGRpc3BsYXllZCBhcyAmYW1wOyBpbiB0aGUgc291cmNlIGh0bWwgXHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJldHVybnMgdGhlIGFuY2hvciB0ZXh0IHRoYXQgc2hvdWxkIGJlIGdlbmVyYXRlZCBmb3IgdGhlIG1hdGNoLlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9XHJcblx0XHQgKi9cclxuXHRcdGdldEFuY2hvclRleHQgOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0dmFyIGFuY2hvclRleHQgPSB0aGlzLmdldFVybCgpO1xyXG5cclxuXHRcdFx0aWYoIHRoaXMucHJvdG9jb2xSZWxhdGl2ZU1hdGNoICkge1xyXG5cdFx0XHRcdC8vIFN0cmlwIG9mZiBhbnkgcHJvdG9jb2wtcmVsYXRpdmUgJy8vJyBmcm9tIHRoZSBhbmNob3IgdGV4dFxyXG5cdFx0XHRcdGFuY2hvclRleHQgPSB0aGlzLnN0cmlwUHJvdG9jb2xSZWxhdGl2ZVByZWZpeCggYW5jaG9yVGV4dCApO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmKCB0aGlzLnN0cmlwUHJlZml4ICkge1xyXG5cdFx0XHRcdGFuY2hvclRleHQgPSB0aGlzLnN0cmlwVXJsUHJlZml4KCBhbmNob3JUZXh0ICk7XHJcblx0XHRcdH1cclxuXHRcdFx0YW5jaG9yVGV4dCA9IHRoaXMucmVtb3ZlVHJhaWxpbmdTbGFzaCggYW5jaG9yVGV4dCApOyAgLy8gcmVtb3ZlIHRyYWlsaW5nIHNsYXNoLCBpZiB0aGVyZSBpcyBvbmVcclxuXHJcblx0XHRcdHJldHVybiBhbmNob3JUZXh0O1xyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cdFx0Ly8gVXRpbGl0eSBGdW5jdGlvbmFsaXR5XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdHJpcHMgdGhlIFVSTCBwcmVmaXggKHN1Y2ggYXMgXCJodHRwOi8vXCIgb3IgXCJodHRwczovL1wiKSBmcm9tIHRoZSBnaXZlbiB0ZXh0LlxyXG5cdFx0ICogXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IHRleHQgVGhlIHRleHQgb2YgdGhlIGFuY2hvciB0aGF0IGlzIGJlaW5nIGdlbmVyYXRlZCwgZm9yIHdoaWNoIHRvIHN0cmlwIG9mZiB0aGVcclxuXHRcdCAqICAgdXJsIHByZWZpeCAoc3VjaCBhcyBzdHJpcHBpbmcgb2ZmIFwiaHR0cDovL1wiKVxyXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfSBUaGUgYGFuY2hvclRleHRgLCB3aXRoIHRoZSBwcmVmaXggc3RyaXBwZWQuXHJcblx0XHQgKi9cclxuXHRcdHN0cmlwVXJsUHJlZml4IDogZnVuY3Rpb24oIHRleHQgKSB7XHJcblx0XHRcdHJldHVybiB0ZXh0LnJlcGxhY2UoIHRoaXMudXJsUHJlZml4UmVnZXgsICcnICk7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN0cmlwcyBhbnkgcHJvdG9jb2wtcmVsYXRpdmUgJy8vJyBmcm9tIHRoZSBhbmNob3IgdGV4dC5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IFRoZSB0ZXh0IG9mIHRoZSBhbmNob3IgdGhhdCBpcyBiZWluZyBnZW5lcmF0ZWQsIGZvciB3aGljaCB0byBzdHJpcCBvZmYgdGhlXHJcblx0XHQgKiAgIHByb3RvY29sLXJlbGF0aXZlIHByZWZpeCAoc3VjaCBhcyBzdHJpcHBpbmcgb2ZmIFwiLy9cIilcclxuXHRcdCAqIEByZXR1cm4ge1N0cmluZ30gVGhlIGBhbmNob3JUZXh0YCwgd2l0aCB0aGUgcHJvdG9jb2wtcmVsYXRpdmUgcHJlZml4IHN0cmlwcGVkLlxyXG5cdFx0ICovXHJcblx0XHRzdHJpcFByb3RvY29sUmVsYXRpdmVQcmVmaXggOiBmdW5jdGlvbiggdGV4dCApIHtcclxuXHRcdFx0cmV0dXJuIHRleHQucmVwbGFjZSggdGhpcy5wcm90b2NvbFJlbGF0aXZlUmVnZXgsICcnICk7XHJcblx0XHR9LFxyXG5cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlbW92ZXMgYW55IHRyYWlsaW5nIHNsYXNoIGZyb20gdGhlIGdpdmVuIGBhbmNob3JUZXh0YCwgaW4gcHJlcGFyYXRpb24gZm9yIHRoZSB0ZXh0IHRvIGJlIGRpc3BsYXllZC5cclxuXHRcdCAqIFxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBhbmNob3JUZXh0IFRoZSB0ZXh0IG9mIHRoZSBhbmNob3IgdGhhdCBpcyBiZWluZyBnZW5lcmF0ZWQsIGZvciB3aGljaCB0byByZW1vdmUgYW55IHRyYWlsaW5nXHJcblx0XHQgKiAgIHNsYXNoICgnLycpIHRoYXQgbWF5IGV4aXN0LlxyXG5cdFx0ICogQHJldHVybiB7U3RyaW5nfSBUaGUgYGFuY2hvclRleHRgLCB3aXRoIHRoZSB0cmFpbGluZyBzbGFzaCByZW1vdmVkLlxyXG5cdFx0ICovXHJcblx0XHRyZW1vdmVUcmFpbGluZ1NsYXNoIDogZnVuY3Rpb24oIGFuY2hvclRleHQgKSB7XHJcblx0XHRcdGlmKCBhbmNob3JUZXh0LmNoYXJBdCggYW5jaG9yVGV4dC5sZW5ndGggLSAxICkgPT09ICcvJyApIHtcclxuXHRcdFx0XHRhbmNob3JUZXh0ID0gYW5jaG9yVGV4dC5zbGljZSggMCwgLTEgKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gYW5jaG9yVGV4dDtcclxuXHRcdH1cclxuXHJcblx0fSApO1xyXG5cclxuXHRyZXR1cm4gQXV0b2xpbmtlcjtcclxuXHJcblxyXG59KSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gdGhlIG1ham9yaXR5IG9mIHRoaXMgZmlsZSB3YXMgdGFrZW4gZnJvbSBtYXJrZG93bi1pdCdzIGxpbmtpZnkgbWV0aG9kXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbWFya2Rvd24taXQvbWFya2Rvd24taXQvYmxvYi85MTU5MDE4ZTJhNDQ2ZmM5N2ViM2M2ZTUwOWE4Y2RjNGNjM2MzNThhL2xpYi9ydWxlc19jb3JlL2xpbmtpZnkuanNcblxudmFyIGxpbmtpZnkgPSByZXF1aXJlKCdsaW5raWZ5LWl0JykoKTtcblxuZnVuY3Rpb24gYXJyYXlSZXBsYWNlQXQgKGEsIGksIG1pZGRsZSkge1xuICB2YXIgbGVmdCA9IGEuc2xpY2UoMCwgaSk7XG4gIHZhciByaWdodCA9IGEuc2xpY2UoaSArIDEpO1xuICByZXR1cm4gbGVmdC5jb25jYXQobWlkZGxlLCByaWdodCk7XG59XG5cbmZ1bmN0aW9uIGlzTGlua09wZW4gKHN0cikge1xuICByZXR1cm4gL148YVs+XFxzXS9pLnRlc3Qoc3RyKTtcbn1cblxuZnVuY3Rpb24gaXNMaW5rQ2xvc2UgKHN0cikge1xuICByZXR1cm4gL148XFwvYVxccyo+L2kudGVzdChzdHIpO1xufVxuXG5mdW5jdGlvbiB0b2tlbml6ZUxpbmtzIChzdGF0ZSwgY29udGV4dCkge1xuICB2YXIgaTtcbiAgdmFyIGo7XG4gIHZhciBsO1xuICB2YXIgdG9rZW5zO1xuICB2YXIgdG9rZW47XG4gIHZhciBub2RlcztcbiAgdmFyIGxuO1xuICB2YXIgdGV4dDtcbiAgdmFyIHBvcztcbiAgdmFyIGxhc3RQb3M7XG4gIHZhciBsZXZlbDtcbiAgdmFyIGxpbmtzO1xuICB2YXIgaHRtbExpbmtMZXZlbDtcbiAgdmFyIGJsb2NrVG9rZW5zID0gc3RhdGUudG9rZW5zO1xuICB2YXIgaHRtbDtcblxuICBmb3IgKGogPSAwLCBsID0gYmxvY2tUb2tlbnMubGVuZ3RoOyBqIDwgbDsgaisrKSB7XG4gICAgaWYgKGJsb2NrVG9rZW5zW2pdLnR5cGUgIT09ICdpbmxpbmUnKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB0b2tlbnMgPSBibG9ja1Rva2Vuc1tqXS5jaGlsZHJlbjtcbiAgICBodG1sTGlua0xldmVsID0gMDtcblxuICAgIC8vIHdlIHNjYW4gZnJvbSB0aGUgZW5kLCB0byBrZWVwIHBvc2l0aW9uIHdoZW4gbmV3IHRhZ3MgYWRkZWQuXG4gICAgLy8gdXNlIHJldmVyc2VkIGxvZ2ljIGluIGxpbmtzIHN0YXJ0L2VuZCBtYXRjaFxuICAgIGZvciAoaSA9IHRva2Vucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG5cbiAgICAgIC8vIHNraXAgY29udGVudCBvZiBtYXJrZG93biBsaW5rc1xuICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICdsaW5rX2Nsb3NlJykge1xuICAgICAgICBpLS07XG4gICAgICAgIHdoaWxlICh0b2tlbnNbaV0ubGV2ZWwgIT09IHRva2VuLmxldmVsICYmIHRva2Vuc1tpXS50eXBlICE9PSAnbGlua19vcGVuJykge1xuICAgICAgICAgIGktLTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICdodG1sX2lubGluZScpIHsgLy8gc2tpcCBjb250ZW50IG9mIGh0bWwgdGFnIGxpbmtzXG4gICAgICAgIGlmIChpc0xpbmtPcGVuKHRva2VuLmNvbnRlbnQpICYmIGh0bWxMaW5rTGV2ZWwgPiAwKSB7XG4gICAgICAgICAgaHRtbExpbmtMZXZlbC0tO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0xpbmtDbG9zZSh0b2tlbi5jb250ZW50KSkge1xuICAgICAgICAgIGh0bWxMaW5rTGV2ZWwrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGh0bWxMaW5rTGV2ZWwgPiAwKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHRva2VuLnR5cGUgIT09ICd0ZXh0JyB8fCAhbGlua2lmeS50ZXN0KHRva2VuLmNvbnRlbnQpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB0ZXh0ID0gdG9rZW4uY29udGVudDtcbiAgICAgIGxpbmtzID0gbGlua2lmeS5tYXRjaCh0ZXh0KTtcbiAgICAgIG5vZGVzID0gW107XG4gICAgICBsZXZlbCA9IHRva2VuLmxldmVsO1xuICAgICAgbGFzdFBvcyA9IDA7XG5cbiAgICAgIGZvciAobG4gPSAwOyBsbiA8IGxpbmtzLmxlbmd0aDsgbG4rKykgeyAvLyBzcGxpdCBzdHJpbmcgdG8gbm9kZXNcbiAgICAgICAgaWYgKCFzdGF0ZS5tZC5pbmxpbmUudmFsaWRhdGVMaW5rKGxpbmtzW2xuXS51cmwpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBwb3MgPSBsaW5rc1tsbl0uaW5kZXg7XG5cbiAgICAgICAgaWYgKHBvcyA+IGxhc3RQb3MpIHtcbiAgICAgICAgICBsZXZlbCA9IGxldmVsO1xuICAgICAgICAgIG5vZGVzLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgY29udGVudDogdGV4dC5zbGljZShsYXN0UG9zLCBwb3MpLFxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBodG1sID0gbnVsbDtcblxuICAgICAgICBjb250ZXh0LmxpbmtpZmllcnMuc29tZShydW5Vc2VyTGlua2lmaWVyKTtcblxuICAgICAgICBpZiAodHlwZW9mIGh0bWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgbm9kZXMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAnaHRtbF9ibG9jaycsXG4gICAgICAgICAgICBjb250ZW50OiBodG1sLFxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbm9kZXMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAnbGlua19vcGVuJyxcbiAgICAgICAgICAgIGhyZWY6IGxpbmtzW2xuXS51cmwsXG4gICAgICAgICAgICB0YXJnZXQ6ICcnLFxuICAgICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsKytcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBub2Rlcy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgIGNvbnRlbnQ6IGxpbmtzW2xuXS50ZXh0LFxuICAgICAgICAgICAgbGV2ZWw6IGxldmVsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbm9kZXMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAnbGlua19jbG9zZScsXG4gICAgICAgICAgICBsZXZlbDogLS1sZXZlbFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbGFzdFBvcyA9IGxpbmtzW2xuXS5sYXN0SW5kZXg7XG4gICAgICB9XG5cbiAgICAgIGlmIChsYXN0UG9zIDwgdGV4dC5sZW5ndGgpIHtcbiAgICAgICAgbm9kZXMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgIGNvbnRlbnQ6IHRleHQuc2xpY2UobGFzdFBvcyksXG4gICAgICAgICAgbGV2ZWw6IGxldmVsXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBibG9ja1Rva2Vuc1tqXS5jaGlsZHJlbiA9IHRva2VucyA9IGFycmF5UmVwbGFjZUF0KHRva2VucywgaSwgbm9kZXMpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJ1blVzZXJMaW5raWZpZXIgKGxpbmtpZmllcikge1xuICAgIGh0bWwgPSBsaW5raWZpZXIobGlua3NbbG5dLnVybCwgbGlua3NbbG5dLnRleHQpO1xuICAgIHJldHVybiB0eXBlb2YgaHRtbCA9PT0gJ3N0cmluZyc7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b2tlbml6ZUxpbmtzO1xuIl19
