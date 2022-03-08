import React from 'react'
import ReactDOM from 'react-dom'
import './style/index.css'
import App from './components/Index'
import {BrowserRouter} from "react-router-dom";


ReactDOM.render(<BrowserRouter>React.createElement(App, null)</BrowserRouter>, document.getElementById('root'))