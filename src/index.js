import { createStore } from "redux"; // импорт из Redux-библиотеки
import { mount, route } from 'navi'
import {NotFoundBoundary, Router, View} from 'react-navi'
import {toast, ToastContainer} from 'react-toastify';
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
import People from "./components/People";
import AppReducer from "./components/reducers/common"
import Agreement from "./components/Agreement";
import Call from "./components/Call";

const store = createStore(AppReducer);


const CONFIG = {
    url: document.location.host === "localhost" ? `ws://${document.location.host}/cent/connection/websocket` : document.location.host === "192.168.100.5" ? `ws://192.168.100.5/cent/connection/websocket` : `wss://${document.location.host}/cent/connection/websocket`
};

let auth = false
let cent = null
let user = null

class App extends React.Component {

    constructor(props) {

        super(props);
        this.state = {
            load: false,
            context: new AudioContext(),
            audio: new Audio(this.props.song),
            channel: null,
        }
    }


    checkAuth(){
        fetch("/api/authentication", {
            method: "POST",
            body: JSON.stringify({})
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0) {
                    store.dispatch({
                        type: "ACTION_CHECK_AUTH", value: {
                            user: {
                                isAuth: true,
                                data: res?.data[0],
                                feeds: res?.feed,
                                notificationCount: res?.notification_count,
                                messagesCount: res?.count_message,
                                notifications: res?.notification,
                                token: res?.token,
                                error: null
                            },
                        }
                    })

                    store.dispatch({
                        type: "ACTION_SET_WEBRTC", value: {
                            pc: new RTCPeerConnection(
                                {
                                    iceServers: [
                                        {
                                            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
                                        },
                                    ]
                            })
                        }
                    })

                    fetch("/api/app/components", {
                        method: "GET"
                    })
                        .then(response => response.json())
                        .then(res => {
                            if (res?.status.code === 0){
                                store.dispatch({
                                    type: "ACTION_SET_COMPONENTS", value: {
                                        settings: res.data,
                                    }
                                })
                            }
                        })


                    let centrifuge = new Centrifuge(CONFIG.url, {
                        subscribeEndpoint: "/api/subscribe",
                        onPrivateSubscribe: (e) => {
                            console.log(e)
                        }
                    })

                    centrifuge.setToken(res?.token)
                    centrifuge.connect()

                    centrifuge.on('connect', function(context) {
                        console.log("[ app connected centrifuge ]")
                    });

                    let this_ = this
                    centrifuge.subscribe(`${res?.data[0].id}`, function(message) {
                        console.log("[ Event pushStorage ]")

                        const state = store.getState()

                        let event = message.data
                        switch (event.type){
                            case "event":
                                this_.state.context.resume().then(() => {
                                    this_.state.audio.play();
                                });

                                store.dispatch({
                                    type: "ACTION_CHECK_AUTH", value: {
                                        user: {
                                            isAuth: true,
                                            data: res?.data[0],
                                            feeds: res?.feed,
                                            notificationCount: event.count,
                                            messagesCount: state.auth.user.messagesCount,
                                            notifications: res?.notification,
                                            token: res?.token,
                                            error: null
                                        },
                                    }
                                })

                                toast.info('Вашу заметку посмотрели.', {
                                    position: "bottom-right",
                                    autoClose: 5000,
                                    hideProgressBar: true,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                });
                                break;
                            case "comment":
                                this_.state.context.resume().then(() => {
                                    this_.state.audio.play();
                                });

                                store.dispatch({
                                    type: "ACTION_CHECK_AUTH", value: {
                                        user: {
                                            isAuth: true,
                                            data: res?.data[0],
                                            feeds: res?.feed,
                                            notificationCount: event.count,
                                            messagesCount: state.auth.user.messagesCount,
                                            notifications: res?.notification,
                                            token: res?.token,
                                            error: null
                                        },
                                    }
                                })

                                toast.info('Вашу заметку прокомментировали.', {
                                    position: "bottom-right",
                                    autoClose: 5000,
                                    hideProgressBar: true,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                });
                                break;
                            case "message":
                                if (window.location.pathname.match(/messages/) === null) {

                                    store.dispatch({
                                        type: "ACTION_CHECK_AUTH", value: {
                                            user: {
                                                isAuth: true,
                                                data: res?.data[0],
                                                feeds: res?.feed,
                                                notificationCount: state.auth.user.notificationCount,
                                                messagesCount: event.count,
                                                notifications: res?.notification,
                                                token: res?.token,
                                                error: null
                                            },
                                        }
                                    })

                                    toast.info('Вам пришло новое сообщение.', {
                                        position: "bottom-right",
                                        autoClose: 5000,
                                        hideProgressBar: true,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                    });
                                }
                                break;
                            case "update":
                                fetch("/api/authentication", {
                                    method: "POST",
                                    body: JSON.stringify({})
                                })
                                    .then(response => response.json())
                                    .then(res => {
                                        if (res?.status.code === 0){
                                            store.dispatch({
                                                type: "ACTION_CHECK_AUTH", value: {
                                                    user: {
                                                        isAuth: true,
                                                        data: res?.data[0],
                                                        feeds: res?.feed,
                                                        notificationCount: res?.notification_count,
                                                        messagesCount: res?.count_message,
                                                        notifications: res?.notification,
                                                        token: res?.token,
                                                        error: null
                                                    },
                                                }
                                            })
                                        }
                                    })
                                break;
                            default:
                                break
                        }
                    })

                    store.dispatch({
                        type: "ACTION_SET_CENTRIFUGE", value: {
                            object: centrifuge
                        }
                    })

                    if (document.location.pathname === "/") {
                        window.location.href = '/feeds'
                    }else{
                        this.setState({
                            load: true
                        })
                    }
                }else{
                    store.dispatch({
                        type: "ACTION_CHECK_AUTH", value: {
                            user: {
                                isAuth: false,
                                data: null,
                                feeds: null,
                                error: res?.status?.message
                            },
                        }
                    })

                    this.setState({
                        load: true
                    })
                }
            })
            .catch(error => {
                store.dispatch({
                    type: "ACTION_CHECK_AUTH", value: {
                        user: {
                            isAuth: false,
                            data: null,
                            feeds: null,
                            error: error
                        },
                    }
                })
            });
    }

    componentDidMount() {
        this.checkAuth()
    }

    routes = mount({
        '/': route({
            title: 'Добро пожаловать | DevCodeMyLife',
            head: <>
                <meta name="description" content="Социальная сеть для разработчиков" />
                <meta name="Keywords" content="dev, code, life, messenger, социальная сеть, для разработчиков, devcode" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Main />
        }),
        '/people': route({
            title: 'Люди | DevCodeMyLife',
            head: <>
                <meta name="description" content="Социальная сеть для разработчиков" />
                <meta name="Keywords" content="dev, code, life, messenger, социальная сеть, для разработчиков, devcode" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <People store={store} />
        }),
        '/messages': route({
            title: 'Мессенджер | DevCodeMyLife',
            head: <>
                <meta name="description" content="Мессенджер" />
                <meta name="Keywords" content="dev, code, life, messenger, социальная сеть, для разработчиков, devcode" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Messages store={store} auth={auth} cent={cent} user={user} />
        }),
        '/user/:id': route( async req => {
            let user;
            let id = req.params.id

            store.dispatch({
                type: "ACTION_UPDATE_HISTORY", value: {
                    path: null,
                    id: id
                }
            })

            fetch(`/api/user/${id}`, {
                method: "GET"
            })
                .then(response => response.json())
                .then(res => {
                    if (res.status.code === 0){
                        user = res.data[0]
                    }
                })
                .catch(error => {
                    console.log(error)
                });

            return {
                title: `${user?.name} | DevCodeMyLife`,
                head: <>
                    <meta name="description" content={`Страница пользователя ${user?.title}`} />
                    <meta name="Keywords" content="dev, code, life, messenger, социальная сеть, для разработчиков, devcode" />
                    <script>
                        console.log('[ app start ]')
                    </script>
                </>,
                view: <MainUser store={store} id={id} />
            }
        }),
        '/feeds': route({
            title: 'Новости | DevCodeMyLife',
            head: <>
                <meta name="description" content="Новости, у нас есть все, чего нет напиши сам." />
                <meta name="Keywords" content="dev, code, life, messenger, социальная сеть, для разработчиков, devcode" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Feed store={store} />
        }),
        '/post': route({
            title: 'Заметка | DevCodeMyLife',
            head: <>
                <meta name="description" content="Заметка" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <FeedOnePage store={store}/>
        }),
        '/agreement': route({
            title: 'Пользовательское соглашение | DevCodeMyLife',
            head: <>
                <meta name="description" content="Пользовательское соглашение" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Agreement store={store}/>
        }),
        '/settings': route({
            title: 'Настройки | DevCodeMyLife',
            head: <>
                <meta name="description" content="Настройки" />
                <meta name="Keywords" content="dev, code, life, messenger, социальная сеть, для разработчиков, devcode" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Settings store={store}/>
        }),
        '/freelances': route({
            title: 'Фриланс | DevCodeMyLife',
            head: <>
                <meta name="description" content="Фриланс" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Freelances store={store}/>
        }),
        '/notification': route({
            title: 'События | DevCodeMyLife',
            head: <>
                <meta name="description" content="Оповещения" />
                <meta name="Keywords" content="dev, code, life, messenger, социальная сеть, для разработчиков, devcode" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Notification store={store}/>
        }),
        '/teams': route({
            title: 'Команды | DevCodeMyLife',
            head: <>
                <meta name="description" content="Команды" />
                <meta name="Keywords" content="dev, code, life, messenger, социальная сеть, для разработчиков, devcode" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <Teams store={store}/>
        }),
        '/how_to_use': route({
            title: 'Привет! | DevCodeMyLife',
            head: <>
                <meta name="description" content="" />
                <script>
                    console.log('[ app start ]')
                </script>
            </>,
            view: <HowToUse store={store}/>
        })
    })

    render(){
        if (this.state.load){
            if (true){
                return (
                    <HelmetProvider>
                        <div className="wrapper" >
                            <BrowserRouter>
                                <Switch>
                                    <Route path="/" render={({history, match}) =>
                                        <Router routes={this.routes} history={history} basename={match.url}>
                                            <Head
                                                store={store}
                                                load={true}
                                            />
                                            <ToastContainer
                                                position="bottom-right"
                                                autoClose={2000}
                                                hideProgressBar={false}
                                                newestOnTop={false}
                                                closeOnClick
                                                rtl={false}
                                                pauseOnFocusLoss
                                                draggable
                                                pauseOnHover
                                            />
                                            <Call store={store} />
                                            {
                                                window.location.pathname === "/" ?
                                                    // <div className="personal_data_accept-block full-width">
                                                    //     <div className="wrapper-accept-personal-data">
                                                    //         <div className="text-info-accept">
                                                    //             Продолжая пользоваться сайтом, Вы даете согласие на обработку Ваших персональных данных.
                                                    //         </div>
                                                    //     </div>
                                                    // </div>
                                                    null
                                                :
                                                    null
                                            }

                                            <div className="wrapper-content">
                                                <div className="content">
                                                    <div id="vertical_menu" className="reviews-menu">
                                                        <Nav song={song} store={store}/>
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
                                                    <NotFoundBoundary render={() =>
                                                        <div className="content-wall-views">
                                                            <div className="error-wrapper">
                                                                <div className="error-page">
                                                                    Такой страницы не существует.
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }>
                                                        <Suspense fallback={true}>
                                                            <View store={store}/>
                                                        </Suspense>
                                                    </NotFoundBoundary>
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
                        <Head
                            store={store}
                            load={true}
                        />
                        {/*<div className="personal_data_accept-block full-width">*/}
                        {/*    <div className="wrapper-accept-personal-data">*/}
                        {/*        <div className="text-info-accept">*/}
                        {/*            Продолжая пользоваться сайтом, Вы даете согласие на обработку Ваших персональных данных.*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
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