var express = require('express');
var serveStatic = require('serve-static');
const port = 8000;
var app = express();

app.use(serveStatic('./web', { 'index': ['index.html'] }));
app.listen(port);
console.log('Webserver listining on http://127.0.0.1:' + port);
