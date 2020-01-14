const express = require('express');
const serveStatic = require('serve-static');

const port = 8000;
const app = express();

app.use(serveStatic('./web', { index: ['index.html'] }));
app.listen(port);
console.log('Webserver listining on http://127.0.0.1:' + port);
