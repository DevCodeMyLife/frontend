import React from 'react'
import ReactDOM from 'react-dom'
import './style/index.css'
import App from './components/Index'
import {BrowserRouter} from "react-router-dom";

ReactDOM.hydrate(
    <BrowserRouter>
        <App/>
    </BrowserRouter>,
document.getElementById('root'))
// ReactDOM.render(React.createElement(App, null), document.getElementById('root'))