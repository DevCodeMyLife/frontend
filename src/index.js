import { mount, route } from 'navi'
import { Router, View } from 'react-navi'
import { ToastContainer } from 'react-toastify';
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import './style/index.css'
import HelmetProvider from 'react-navi-helmet-async'
import Head from './components/Header'
import Feed from "./components/Feed";
import FeedOnePage from "./components/FeedOnePage";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Centrifuge from "centrifuge";
import Main from "./components/Main";
import MainUser from "./components/MainUser";
import Messages from "./components/Messages";
import Footer from "./components/Footer";
import Settings from "./components/Settings";
import Freelances from "./components/Freelances";
import Notification from "./components/Notification";
import Teams from "./components/Teams";
import Nav from "./components/Nav";
import song from "./sound/pop.mp3";
import HowToUse from "./components/HowToUse";
import ruvds from "./icon/ruvds.png";

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
        this.centrifuge = new Centrifuge(CONFIG.url);
    }

    sendLogs(message) {
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
                        if (document.location.pathname === "/") {
                            window.location.href = '/feeds'
                        }




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

        cent = this.centrifuge
    }

    routes = mount({
        '/': route({
            title: 'Добро пожаловать | DevCodeMyLife',
            head: <>
                <meta name="description" content="Социальная сеть для разработчиков" />
                <meta name="Keywords" content="dev, code, life, messenger, социальная сеть, для разработчиков" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Main />
        }),
        '/messages': route({
            title: 'Мессенджер | DevCodeMyLife',
            head: <>
                <meta name="description" content="Мессенджер" />
                <meta name="Keywords" content="dev, code, life, messenger, социальная сеть, для разработчиков" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Messages auth={auth} cent={cent} user={user} />
        }),
        '/user': route({
            title: 'DevCodeMyLife',
            head: <>
                <meta name="description" content="Страница пользователя" />
                <meta name="Keywords" content="dev, code, life, messenger, социальная сеть, для разработчиков" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <MainUser />
        }),
        '/feeds': route({
            title: 'Новости | DevCodeMyLife',
            head: <>
                <meta name="description" content="Новости, у нас есть все, чего нет напиши сам." />
                <meta name="Keywords" content="dev, code, life, messenger, социальная сеть, для разработчиков" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Feed/>
        }),
        '/post': route({
            title: 'Заметка | DevCodeMyLife',
            head: <>
                <meta name="description" content="Заметка" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <FeedOnePage/>
        }),
        '/settings': route({
            title: 'Настройки | DevCodeMyLife',
            head: <>
                <meta name="description" content="Настройки" />
                <meta name="Keywords" content="dev, code, life, messenger, социальная сеть, для разработчиков" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Settings/>
        }),
        '/freelances': route({
            title: 'Фриланс | DevCodeMyLife',
            head: <>
                <meta name="description" content="Фриланс" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Freelances/>
        }),
        '/notification': route({
            title: 'События | DevCodeMyLife',
            head: <>
                <meta name="description" content="Оповещения" />
                <meta name="Keywords" content="dev, code, life, messenger, социальная сеть, для разработчиков" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Notification/>
        }),
        '/teams': route({
            title: 'Команды | DevCodeMyLife',
            head: <>
                <meta name="description" content="Команды" />
                <meta name="Keywords" content="dev, code, life, messenger, социальная сеть, для разработчиков" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Teams/>
        }),
        '/how_to_use': route({
            title: ' Привет! | DevCodeMyLife',
            head: <>
                <meta name="description" content="" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <HowToUse/>
        })
    })

    render(){
        if (this.state.load){
            if (true){
                return (
                    <HelmetProvider>
                        <div className="wrapper">
                            {
                                this.state.headComponent

                            }
                            <ToastContainer
                                position="top-center"
                                autoClose={2000}
                                hideProgressBar={false}
                                newestOnTop={false}
                                closeOnClick
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                            />
                            <BrowserRouter>
                                <Switch>
                                    <Route path="/" render={({history, match}) =>
                                        <Router routes={this.routes} history={history} basename={match.url}>
                                            <div className="wrapper-content">
                                                <div className="content">
                                                    <div id="vertical_menu" className="reviews-menu">
                                                        <Nav song={song} />
                                                        <div className="wrapper-ad" onClick={()=>{
                                                            window.location.href = "https://ruvds.com/pr4320"
                                                        }}>
                                                            <div className="image-ad">
                                                                <img className="image-ad-tag" src={ruvds}  alt="ruvds"/>
                                                            </div>
                                                            <div className="ad-text">
                                                                Cайт работает на серверах RuVDS
                                                            </div>
                                                            {/*<div className="title-span-auth-small">Скидка 5%</div>*/}
                                                        </div>
                                                    </div>
                                                    <Suspense fallback={null}>
                                                        <View/>
                                                    </Suspense>
                                                </div>
                                            </div>
                                        </Router>

                                     } />
                                </Switch>
                            </BrowserRouter>
                            <Footer />
                        </div>
                    </HelmetProvider>
                );
            }else{
                return (
                    <div>
                        <Head auth={false} load={true} />
                        <div className="personal_data_accept-block full-width">
                            <div className="wrapper-accept-personal-data">
                                <div className="text-info-accept">
                                    Продолжая пользоваться сайтом, Вы даете согласие на обработку Ваших персональных данных.
                                </div>
                            </div>
                        </div>
                        <div className="wrapper-content">
                            <div className="content">

                                <div id="vertical_menu" className="reviews-menu">
                                    <div className="wrapper-ad" onClick={()=>{
                                        window.location.href = "https://ruvds.com/pr4320"
                                    }}>
                                        <div className="image-ad">
                                            <img className="image-ad-tag" src={ruvds}  alt="ruvds"/>
                                        </div>
                                        <div className="ad-text">
                                            Cайт работает на серверах RuVDS
                                        </div>
                                        {/*<div className="title-span-auth-small">Скидка 5%</div>*/}
                                    </div>
                                </div>
                                <Main />
                            </div>
                        </div>
                        <Footer />
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