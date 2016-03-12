var Nightmare = require('nightmare');
var expect = require('chai').expect; // jshint ignore:line

var locationName = "TSDemo";

describe('test connecting location', function() {
  it('should create a new location and proof it ', function*() {
    var nightmare = Nightmare();
    var result = yield nightmare
      .goto('file:///home/na/TagSpaces/repo/data/index.html') // file:///e:/TagSpaces/repo/data/index.html
      .wait(2000)
      .click('#selectLocation')
      .click('#createNewLocation')
      .wait(1000)
      .click('#folderLocation')
      .type('#folderLocation', '/home/na/TagSpaces')
      .type('#connectionName', locationName)
      .click('#createFolderConnectionButton')
      .wait(1000)
      .evaluate(function () {
        return document.querySelector("#locationName").innerText;
      });

    console.log("---" + result);
    expect(result).to.equal(locationName);
  });
});

