var Nightmare = require('nightmare');
var expect = require('chai').expect; // jshint ignore:line

describe('test yahoo search results', function() {
  it('should find the nightmare github link first', function*() {
    var nightmare = Nightmare();
    var link = yield nightmare
      .goto('http://yahoo.com')
      .type('input[title="Search"]', 'github nightmare')
      .click('#UHSearchWeb')
      .wait('#main')
      .evaluate(function () {
        return document.querySelector('#main .searchCenterMiddle li a').href
      })
    expect(link).to.equal('https://github.com/segmentio/nightmare');
  });
});


describe('test webdav login', function() {
  it('should find the nightmare github link first', function*() {
    var nightmare = Nightmare();
    var link = yield nightmare
      .goto('http://demo:demo@127.0.0.1:8000/index.html')
      .wait('#main')
      .evaluate(function () {
        return true;
      })
    expect(link).to.equal(true);
  });
});

describe('test the electron app', function() {
  it('should find the nightmare github link first', function*() {
    var nightmare = Nightmare();
    var link = yield nightmare
      .goto('file:///home/na/TagSpaces/repo/data/index.html')
      .evaluate(function () {
        return true;
      })
    expect(link).to.equal(1);
  });
});