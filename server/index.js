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
const description = '<meta name="description" content=""/>'
const description_any_site_og = '<meta property="og:title" content="">'


app.get(['/', '/feeds', '/post', '/user/*', '/settings', '/messages', '/notification', '/people'], (req, res) => {
    const app = ReactDOMServer.renderToNodeStream(<App/>);


    const indexFile = path.resolve('./build/index.html');
    fs.readFile(indexFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Something went wrong:', err);
            return res.status(500).send('Сейчас мы что то делаем');
        }

        switch (req.path) {
            case "/post":
                const options = {
                    hostname: 'devcodemylife.tech',
                    port: 443,
                    path: `/api/feed/${req.query.uuid}/null`,
                    method: 'GET'
                }

                const reqs = https.request(options, resq => {
                    console.log(`statusCode: ${resq.statusCode}`)

                    resq.on('data', d => {
                        preData(
                            data,
                            res,
                            app,
                            `${JSON.parse(d).data[0].title} | DevCodeMyLife`,
                            `${JSON.parse(d).data[0].tag}, ${JSON.parse(d).data[0].value.split(' ').join(', ')}`,
                            `${JSON.parse(d).data[0].title.substring(0, 30)}`
                        )
                    })
                })

                reqs.on('error', error => {
                    console.error(error)
                })
                reqs.end()

                preData(
                    data,
                    res,
                    app,
                    "Лента Новости | DevCodeMyLife",
                    "новости, заметки, код, программирование, golang, python2, python3, python",
                    "Лента новостей"
                )
                break
            case "/feeds":
                preData(
                    data,
                    res,
                    app,
                    "Лента Новости | DevCodeMyLife",
                    "DevCodeMyLIfe, добро, пожаловать",
                    "Лента новостей"

                )
                break
            default:
                preData(
                    data,
                    res,
                    app,
                    "Добро пожаловать | DevCodeMyLIfe",
                    "DevCodeMyLIfe, добро, пожаловать",
                    "Социальная сеть для программистов",
                )
        }
    });
});

function preData(data, res, app, title_render, keywords_render, description_render) {
    data = data.replace(main, `<div id="root">${app}</div>`)
    data = data.replace(title, `<title>${title_render}</title>`)
    data = data.replace(keywords, `<meta name="keywords" content="${keywords_render}"/>`)
    data = data.replace(description, `<meta name="description" content="${description_render}"/>`)
    data = data.replace(description_any_site_og, `<meta property="og:title" content="${description_render}">`)

    return res.send(data);
}


app.use(express.static('./build'));

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});