'use strict';

var fs = require('fs');
var express = require('express');
var app = express();

let html = fs.readFileSync('./index.html', 'utf8');

app.get('/', function (req, res) {
  res.send('Hello World!<br> I am alive and still serving requests :)');
});

app.get('/block-me-now', function (req, res) {
  while (true) {};

  res.send('I need to send serve requests! Stop the loop!');
});

app.get('/no-fs', function (req, res) {
  res.send(html);
});

app.get('/touch-fs', function (req, res) {
  let pack = fs.readFileSync('./index.html', 'utf8');

  res.send(pack);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

// function onRequest(req, res) {
//   if (req.url === '/block') {
//     while (true) {}
//   } else {
//     res.end("Still accepting requests…");
//   }
// }
