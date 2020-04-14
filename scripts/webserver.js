const express = require('express');
const serveStatic = require('serve-static');

const port = 8000;
const host = 'localhost'; // '::';
const app = express();

app.use(serveStatic('./web', { index: ['index.html'] }));
app.listen(port, host, () =>
  console.log(
    'Webserver listining on http://%s:%d in %s mode',
    host,
    port,
    app.settings.env
  )
);
