import 'css-ssr'

import path from 'path';
import fs from 'fs';

import React from 'react';
import express from 'express';
import ReactDOMServer from 'react-dom/server';
import App from '../src/components/Index';

const PORT = 80;
const app = express();


app.get(['/', '/feeds', '/post', '/user/*', '/settings', '/messages', '/notification'], (req, res) => {
    const app = ReactDOMServer.renderToNodeStream(<App/>);


    const indexFile = path.resolve('./build/index.html');
    fs.readFile(indexFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Something went wrong:', err);
            return res.status(500).send('Oops, better luck next time!');
        }
        let title;

        switch (req.path){
            case "/feeds":
                title = "Новости"
                break
            default:
                title = "DevCodeMyLife"
        }

        console.log(req.path)
        return res.send(
            data.replace('<div id="root"></div>', `<div id="root">${app}</div>`).replace(
                '<title></title>', `<title>${title}</title>`));
    });
});


app.use(express.static('./build'));

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});