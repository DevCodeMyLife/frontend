import { mount, route } from 'navi'
import { Router, View } from 'react-navi'
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import './style/index.css'
import HelmetProvider from 'react-navi-helmet-async'
import Head from './components/Header'
import Feed from "./components/Feed";
import FeedOnePage from "./components/FeedOnePage";
import About from "./components/About";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Centrifuge from "centrifuge";
import Main from "./components/Main";
import MainUser from "./components/MainUser";
import Messages from "./components/Messages";
import Footer from "./components/Footer";

const CONFIG = {
    url: document.location.host === "localhost" ? `ws://${document.location.host}/cent/connection/websocket` : `wss://${document.location.host}/cent/connection/websocket`
};

let auth = false
let cent = null
let user = null

class App extends React.Component {

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
            messagesCount: 0,
            headComponent: null
        }

    }

    sendLogs(message) {
        // fetch("/logs/gelf", {
        //     method: "POST",
        //     body: JSON.stringify({
        //         "version": "1.1",
        //         "host": document.location.host,
        //         "short_message": message,
        //         "level": 5, "_some_info": "foo"
        //     }),
        //     headers: {
        //         "Content-Type": "application/json"
        //     }
        // }).then(_ => {})
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
        this.setState({
            headComponent: <Head
                auth={false}
                user={this.state.data[0]}
                load={false}
            />
        })

        let check = true
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
                        auth = true
                        user = res.data

                        this.centrifuge = new Centrifuge(CONFIG.url);
                        this.centrifuge.setToken(res.token)

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
                        load: true,
                        headComponent: null
                    });

                    this.setState({
                        headComponent: <Head
                            auth={true}
                            user={res.data[0]}
                            load={true}
                        />
                    })


                })
                .catch(error => {
                    this.setState({
                        auth: false,
                        load: true,
                        token: "asd",
                        headComponent: null
                    });

                    this.setState({
                        headComponent: <Head
                            auth={false}
                            load={true}
                        />
                    })
                });
        }else{
            this.setState({
                auth: false,
                load: true,
                token: "asd",
                headComponent: null
            });

            this.setState({
                headComponent: <Head
                    auth={false}
                    load={true}
                />
            })
        }


        // this.centrifuge.setToken("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2Mjk2NjA1MjAsImV4cCI6MTY2MTgwMTMyMCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiMTAwIn0.Ht52d2_Tm-TYWRGFZf_kpISToZ1gk2UPiyn2fbkE9HU");
        //"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2MjYwMzI0MzEsImV4cCI6MTc4Mzc5ODgzMSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.meN08YC99TeOJZWLbMKCwxhtOA_s3RaZ1QH-YARC6CM"

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

        cent = this.centrifuge
    }

    routes = mount({
        '/': route({
            title: 'DevCodeMyLife - Добро пожаловать',
            head: <>
                <meta name="description" content="Социальная сеть для разработчиков" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Main />
        }),
        '/messages': route({
            title: 'Мессенджер',
            head: <>
                <meta name="description" content="Мессенджер" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Messages auth={auth} cent={cent} user={user} />
        }),
        '/user': route({
            title: 'DevCodeMyLife',
            head: <>
                <meta name="description" content="" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <MainUser />
        }),
        '/feeds': route({
            title: 'Новости',
            head: <>
                <meta name="description" content="Новости, у нас есть все, чего нет напиши сам." />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Feed/>
        }),
        '/post': route({
            title: 'DevCodeMyLife',
            head: <>
                <meta name="description" content="" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <FeedOnePage/>
        }),
        '/about': route({
            title: 'DevCodeMyLife',
            head: <>
                <meta name="description" content="" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <About/>
        })
    })

    render(){
        if (this.state.load){
            if (this.state.auth){
                return (
                    <HelmetProvider>
                        <div className="wrapper">
                            {
                                this.state.headComponent

                            }
                            <BrowserRouter>
                                <Switch>
                                    <Route path="/" render={({history, match}) =>
                                        <Router
                                            routes={this.routes}
                                            history={history}
                                            basename={match.url}
                                        >
                                            <Suspense fallback={null}>
                                                <View/>
                                            </Suspense>
                                        </Router>
                                    } />
                                </Switch>
                            </BrowserRouter>
                            {/*<div className="footer">*/}
                            {/*    © {new Date().getFullYear()} DevCodeMyLife*/}
                            {/*</div>*/}
                            <Footer />
                        </div>
                    </HelmetProvider>
                );
            }else{
                return (
                    <div>
                        <Head auth={false} load={true} />
                        <Main />
                        <Footer />
                        {/*<div className="footer">*/}
                        {/*    © {new Date().getFullYear()} DevCodeMyLife*/}
                        {/*</div>*/}
                    </div>
                );
            }
        }else{
            return (
                <div style={{
                    position: "fixed",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <div className="loader" />
                </div>
            )
        }

    }
}

ReactDOM.render(
    React.createElement(App, null),
    document.getElementById('root')
)