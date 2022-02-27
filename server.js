const express = require('express');
const serveStatic = require('serve-static');
const app = express();
const resolve = require('path').resolve;

app.use(serveStatic(resolve('./build')));
app.get('/', (req, res) => res.sendFile(resolve('./build/index.html')))
app.get('/feeds*', (req, res) => res.sendFile(resolve('./build/feeds.html')))
app.get('/post*', (req, res) => res.sendFile(resolve('./build/post.html')))


// app.get('/about', (req, res) => res.sendFile(resolve('./build/about.html')));
// app.get('/services', (req, res) => res.sendFile(resolve('./build/services.html')));

app.listen(80, () => console.log('Started on PORT 80'));