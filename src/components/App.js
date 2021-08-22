import React, { Component } from "react";
import Header from "./Header";
import Centrifuge from 'centrifuge';
import Content from "./Content";

const CONFIG = {
    url: document.location.host === "localhost" ? `ws://${document.location.host}/cent/connection/websocket` : `wss://${document.location.host}/cent/connection/websocket`
};

class App extends Component{
    constructor(props) {
        super(props);
        this.state = {
            auth: false,
            load: false,
            data: [],
            feed: [],
            token: null,
            notification_count: 0,
            notification: [],
            messagesCount: 0
        }

    }

    sendLogs(message) {
        fetch("/logs/gelf", {
            method: "POST",
            body: JSON.stringify({
                "version": "1.1",
                "host": document.location.host,
                "short_message": message,
                "level": 5, "_some_info": "foo"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(_ => {})
    }

    checkCookie(cname) {
        let ca = document.cookie.split(';');
        let array = {};

        for (let i = 0; i < ca.length; i++) {
            array[ca[i].split('=')[0].trim()] = ca[i].split('=')[1]
        }

        return Object.keys(array).includes(cname);
    }

    delete_cookie(name) {
        document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }


    componentDidMount() {
        let check = this.checkCookie("access_token")
        if (check){
            fetch("/api/authentication", {
                method: "POST",
                body: JSON.stringify({
                    "finger": window.localStorage.getItem("finger")
                })
            })
                .then(response => response.json())
                .then(res => {
                    if (res.status.code === 0){
                        this.setState({
                            auth: true,
                            data: res.data,
                            feed: res.feed,
                            notification_count: res.notification_count,
                            notification: res.notification,
                            token: res.token,
                            messagesCount: res.count_message
                        });
                    }else{
                        this.sendLogs(res.status.message)
                        this.delete_cookie("access_token")
                    }
                    this.setState({
                        load: true
                    });

                })
                .catch(error => {
                    // console.log(error)
                    this.setState({
                        auth: false,
                        load: true,
                        token: 'asd'
                    });
                });
        }else{
            this.setState({
                auth: false,
                load: true,
                token: 'asd'
            });
        }

        this.centrifuge = new Centrifuge(CONFIG.url);
        this.centrifuge.setToken("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2MjYwMzI0MzEsImV4cCI6MTc4Mzc5ODgzMSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.meN08YC99TeOJZWLbMKCwxhtOA_s3RaZ1QH-YARC6CM");

        this.centrifuge.on('connect', function() {
            console.log("[ centrifuge connected ]")
        });
        this.centrifuge.on('disconnect', function(){
            console.log("[ centrifuge disconnected ]")
        });
        this.centrifuge.connect();


        this.centrifuge.subscribe("public", function(message) {
            console.log(message);
        });

        if (!window.Notification || !Notification.requestPermission){
            console.log('...')
        }else{
            Notification.requestPermission(function(permission){
                // console.log('Результат запроса прав:', permission);
            });
        }
    }


    render (){
        return (
            this.state.load ?
                <div className="wrapper">
                    <Header
                        auth={this.state.auth}
                        user={this.state.data[0]}
                        load={this.state.load}
                    />
                    <Content
                        auth={this.state.auth}
                        data={this.state.data}
                        feed={this.state.feed}
                        cent={this.centrifuge}
                        notification_count={this.state.notification_count}
                        notification={this.state.notification}
                        messagesCount={this.state.messagesCount}
                    />
                </div>
            :
                null
        )
    }
}

export default App;
