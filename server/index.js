import 'css-ssr'

const https = require('https')
import path from 'path';
import fs from 'fs';

import React from 'react';
import express from 'express';
import ReactDOMServer from 'react-dom/server';
import App from '../src/components/Index';

const PORT = 80;
const app = express();

const main = '<div id="root"></div>'
const title = '<title></title>'
const keywords = '<meta name="keywords" content=""/>'


app.get(['/', '/feeds', '/post', '/user/*', '/settings', '/messages', '/notification', '/people'], (req, res) => {
    const app = ReactDOMServer.renderToNodeStream(<App/>);


    const indexFile = path.resolve('./build/index.html');
    fs.readFile(indexFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Something went wrong:', err);
            return res.status(500).send('Сейчас мы что то делаем');
        }
        let title_render;
        let keywords;

        switch (req.path) {
            case "/post":
                const options = {
                    hostname: 'devcodemylife.tech',
                    port: 443,
                    path: `/api/feed/${req.params.uuid}`,
                    method: 'GET'
                }

                const reqs = https.request(options, res => {
                    console.log(`statusCode: ${res.statusCode}`)

                    reqs.on('data', d => {
                        console.log(d)
                    })
                })

                req.on('error', error => {
                    console.error(error)
                })

                req.end()
                break
            case "/feeds":
                title_render = "Новости | DevCodeMyLife"
                keywords = "новости, заметки, код, программирование, golang, python2, python3, python"
                break
            default:
                title_render = "Добро пожаловать | DevCodeMyLife"
                keywords = "заметки, код, программирование, golang, python2, python3, python, bash, linux"
        }

        data = data.replace(main, `<div id="root">${app}</div>`)
        data = data.replace(title, `<title>${title_render}</title>`)
        data = data.replace(keywords, `<meta name="keywords" content="${keywords}"/>`)

        console.log(req.path)
        return res.send(data);
    });
});


app.use(express.static('./build'));

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});