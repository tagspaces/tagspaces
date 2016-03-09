var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: true })

nightmare
  //.goto('http://demo:demo@127.0.0.1:8000/index.html')
  .goto('file:///home/na/TagSpaces/repo/data/index.html')
  .type('input[title="Search"]', 'github nightmare')
  .click('#UHSearchWeb')
  .wait('#main')
  .evaluate(function () {
    return document.querySelector('#main .searchCenterMiddle li a').href
  })
  .then(function (result) {
    console.log(result)
  })

nightmare.end()
