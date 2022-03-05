import React from 'react'
import ReactDOM from 'react-dom'
import './style/index.css'
import App from './components/Index'


ReactDOM.hydrate(React.createElement(App, null), document.getElementById('root'))