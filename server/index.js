import 'css-ssr'

import path from 'path';
import fs from 'fs';

import React from 'react';
import request from 'request';

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
    const app = ReactDOMServer.renderToString(<App/>);
    const indexFile = path.resolve('./build/index.html');

    fs.readFile(indexFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Something went wrong:', err);
            return res.status(500).send('Сейчас мы что то делаем');
        }

        console.log(req.path)

        switch (req.path) {
            case "/post":
                request(`https://devcodemylife.tech/api/feed/${req.query.uuid}/null`, {"set-cookie": req.cookies},  function (error, response, body) {
                    console.error('error:', error); // Print the error if one occurred
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

                    if (response && response.statusCode === 404){
                        data = preData(
                            data,
                            app,
                            `Такой заметки нет | DevCodeMyLife`,
                            `golang, python, c, c#, css, js, node, nginx, proxy`,
                            `Такой заметки нет`
                        )
                        res.status(200)
                        res.send(data)
                        return
                    }

                    data = preData(
                        data,
                        app,
                        `${JSON.parse(body).data[0].title} | DevCodeMyLife`,
                        `${JSON.parse(body).data[0].title.split(' ').join(', ')}`,
                        `${JSON.parse(body).data[0].title}`
                    )
                    res.status(200)
                    res.send(data)
                });

                break
            case "/feeds":
                data = preData(
                    data,
                    app,
                    "Лента Новости | DevCodeMyLife",
                    "DevCodeMyLIfe, golang, python, c, c#, css, js, node, nginx, proxy",
                    "Лента новостей"
                )

                res.status(200)
                res.send(data)
                break
            default:
                data = preData(
                    data,
                    app,
                    "Социальная сеть для разработчиков | DevCodeMyLIfe",
                    "DevCodeMyLIfe, golang, python, c, c#, css, js, node, nginx, proxy",
                    "Социальная сеть для разработчиков, для любого уровня. Здесь Вы найдете интересные статьи, и полезные заметки.",
                )

                res.status(200)
                res.send(data)
        }
    });
});

function preData(data, app, title_render, keywords_render, description_render) {
    data = data.replace(main, `<div id="root">${app}</div>`)
    data = data.replace(title, `<title>${title_render}</title>`)
    data = data.replace(keywords, `<meta name="keywords" content="${keywords_render}"/>`)
    data = data.replace(description, `<meta name="description" content="${description_render}"/>`)
    data = data.replace(description_any_site_og, `<meta property="og:title" content="${description_render}">`)

    return data
}


app.use(express.static('./build'));

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});