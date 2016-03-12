var Nightmare = require('nightmare');
var nightmare = Nightmare({show: true});

nightmare
  //.goto('http://demo:demo@127.0.0.1:8000/index.html')
  .goto('file:///home/na/TagSpaces/repo/data/index.html') // file:///e:/TagSpaces/repo/data/index.html
  .wait(2000)
  .click('#selectLocation')
  .click('#createNewLocation')
  .wait(1000)
  .click('#folderLocation')
  .type('#folderLocation', '/home/na/TagSpaces')
  .type('#connectionName', 'TSDemo')
  .click('#createFolderConnectionButton')
  .wait(1000)
  .evaluate(function () {
    console.log("Location name" + document.querySelector("#locationName").textContent);
    return document.querySelector("#locationName").textContent === "TSDemo";
  })
  .end()
  .then(function (result) {
    console.log("Test result: " + result);
  })

nightmare.end()
