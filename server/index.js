import 'css-ssr'

import path from 'path';
import fs from 'fs';

import React from 'react';
import request from 'request';

import express from 'express';

import ReactDOMServer from 'react-dom/server';
import App from '../src/components/Index';
import {Router, StaticRouter} from "react-router-dom";

const PORT = 80;
const app = express();

const main = '<div id="root"></div>'
const title = '<title></title>'
const keywords = '<meta name="keywords" content=""/>'
const description = '<meta name="description" content=""/>'
const description_any_site_og = '<meta property="og:title" content="">'
const meta_title = '<meta name="title" content=""/>'
const canonical = '<link rel="canonical" href=""/>'

// meta graph
const meta_google = '<meta property="og:image" content="/main.jpg">'
const meta_google_url = '<meta property="og:url" content="https://devcodemylife.tech/">'

const meta_twitter = '<meta property="twitter:image" content="/main.jpg">'
const meta_twitter_url = '<meta property="twitter:url" content="https://devcodemylife.tech/">'


app.get(['/', '/feeds', '/post/*', '/user/*', '/settings', '/messages', '/notification', '/people'], (req, res) => {
    let context = {}
    const app = ReactDOMServer.renderToString(
        <StaticRouter location={req.url} context={context}><App/></StaticRouter>
    );
    const indexFile = path.resolve('./build/index.html');

    fs.readFile(indexFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Something went wrong:', err);
            return res.status(500).send('Сейчас мы что то делаем');
        }

        console.log(req.path)
        console.log(req.path.split("/")[1])

        switch (req.path.split("/")[1]) {
            case "post":
                let url_parts = req.path.split("/")[req.path.split("/").length - 1]
                request(`https://devcodemylife.tech/api/feed/${url_parts}/null`, {"set-cookie": req.cookies},  function (error, response, body) {
                    console.error('error:', error); // Print the error if one occurred
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

                    if (response && response.statusCode === 404){
                        data = preData(
                            data,
                            app,
                            `Такой заметки нет | DevCodeMyLife`,
                            `golang, python, c, c#, css, js, node, nginx, proxy`,
                            `Такой заметки нет`,
                            req.path
                        )
                        res.status(200)
                        res.send(data)
                        return
                    }

                    data = preDataFeed(
                        data,
                        app,
                        `${JSON.parse(body).data[0].title} | DevCodeMyLife`,
                        `${JSON.parse(body).data[0].title.split(' ').join(', ')}`,
                        `${JSON.parse(body).data[0].title}`,
                        req.path,
                        JSON.parse(body).data[0].cover_path
                    )
                    res.status(200)
                    res.send(data)
                });

                break
            case "feeds":
                data = preData(
                    data,
                    app,
                    "Лента Новости | DevCodeMyLife",
                    "DevCodeMyLIfe, golang, python, c, c#, css, js, node, nginx, proxy",
                    "Лента новостей",
                    req.path
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
                    "Социальная сеть для разработчиков, любого уровня. Здесь Вы найдете интересные статьи, и полезные заметки.",
                    req.path
                )

                res.status(200)
                res.send(data)
        }
    });
});

function preData(data, app, title_render, keywords_render, description_render, url) {
    data = data.replace(main, `<div id="root">${app}</div>`)
    data = data.replace(title, `<title>${title_render}</title>`)
    data = data.replace(keywords, `<meta name="keywords" content="${keywords_render}"/>`)
    data = data.replace(description, `<meta name="description" content="${description_render}"/>`)
    data = data.replace(description_any_site_og, `<meta property="og:title" content="${description_render}">`)
    data = data.replace(meta_title, `<meta name="title" content="${title_render}"/>`)
    data = data.replace(canonical, `<link rel="canonical" href="https://devcodemylife.tech${url}"/>`)

    return data
}

function preDataFeed(data, app, title_render, keywords_render, description_render, url, cover_feed) {
    if (cover_feed !== ""){
        data = data.replace(meta_google, `<meta property="og:image" content="https://devcodemylife.tech${cover_feed}">`)
        data = data.replace(meta_google_url, `<meta property="og:url" content="https://devcodemylife.tech${url}">`)

        data = data.replace(meta_twitter, `<meta property="twitter:image" content="https://devcodemylife.tech${cover_feed}">`)
        data = data.replace(meta_twitter_url, `<meta property="twitter:url" content="https://devcodemylife.tech${url}">`)

    }

    data = data.replace(main, `<div id="root">${app}</div>`)
    data = data.replace(title, `<title>${title_render}</title>`)
    data = data.replace(keywords, `<meta name="keywords" content="${keywords_render}"/>`)
    data = data.replace(description, `<meta name="description" content="${description_render}"/>`)
    data = data.replace(description_any_site_og, `<meta property="og:title" content="${description_render}">`)
    data = data.replace(meta_title, `<meta name="title" content="${title_render}"/>`)
    data = data.replace(canonical, `<link rel="canonical" href="https://devcodemylife.tech${url}"/>`)

    return data
}


app.use(express.static('./build'));
app.use(function(req, res, next) {
    const indexFile = path.resolve('./public/400.html');
    fs.readFile(indexFile, 'utf8', (err, data) => {
        res.status(404).send(data);
    })
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});