import React, { Component } from "react";
import Footer from "./Footer";
import Feed from "./Feed";

import about from "../icon/about.png";
import home from "../icon/home.png";
import About from "./About";
import Error from "./Error";
import MainUsers from "./MainUser";
import Agreement from "./Agreement";
import FeedOnePage from "./FeedOnePage";
import notes from "../icon/notes_.png"
import messages from "../icon/messages_.png"
import notification from "../icon/notification_.png"
import Notification from "./Notification";
import TextareaAutosize from "react-textarea-autosize";
import Messages from "./Messages";




class Content extends Component  {
    constructor(props) {
        super(props);
        this.state = {
            currentShowingPage: 0,
            currentlyLoggedInUser: null,
            isLoginModalOpen: false,
            currentComponent: "/",
            error: null,
            load: false,
            result: null,
            auth: this.props.auth,
            data: this.props.data,
            feed: this.props.feed,
            notification_count: this.props.notification_count,
            notification: this.props.notification,
            com: <div/>,
            path: window.location.pathname,
            cent: this.props.cent,
            message: [],
            timer: 0,
            countUser: 0,
            showChat: false,
            messagesCount: this.props.messagesCount
        }
    }

    unixToDateTime(unixTimestamp) {
        const milliseconds = unixTimestamp * 1000
        const dateObject = new Date(milliseconds)

        return dateObject.toLocaleString()
    }

    handleClick = event => {
        let attr = event.target.getAttribute('path')

        console.log(`[ routing page => ${attr} ]`)

        if (attr){
            window.history.pushState({urlPath:attr},"",attr)
            this.swapComponent()
        }



    };

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



    getChat() {
        fetch("/api/chat", {
            method: "GET"
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0){
                    this.setState({
                        message: res.data,
                    });


                    setTimeout(()=> {
                        if (document.getElementById('messages'))
                            document.getElementById('messages').scrollTo({top: document.getElementById('messages').scrollHeight, left: 0, behavior: 'smooth' });
                        // document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight
                    }, 200)
                }else{
                    this.sendLogs(res.status.message)
                    console.log("[ Is not auth ]")
                }

            })
            .catch(error => {
                this.sendLogs(error)

                console.log("[ error auth ]")
            });
    }


    swapComponent() {
        let component;

        // eslint-disable-next-line default-case

        let path = window.location.pathname.match(/user/) ? `/${window.location.pathname.match(/user/)[0]}` : window.location.pathname

        switch (path) {
            case '/' :
                component = <Feed/>;
                this.setState({
                    showChat: false
                })
                break;
            case '/about' :
                component = <About/>;
                this.setState({
                    showChat: false
                })
                break;
            case '/user':
                let id = window.location.pathname.split('/')[window.location.pathname.split('/').length - 1]
                component = <MainUsers id={id} data={this.state.data}/>;
                this.setState({
                    showChat: false
                })
                break;
            case '/agreement' :
                component = <Agreement/>;
                this.setState({
                    showChat: false
                })
                break
            case '/messages':
                component = <Messages auth={this.state.auth} cent={this.state.cent} user={this.state.data}/>;
                this.setState({
                    showChat: false
                })
                break
            case '/post' :
                component = <FeedOnePage/>;
                this.setState({
                    showChat: false
                })
                break
            case '/notification' :
                component = <Notification notification={this.state.notification}/>;
                this.setState({
                    showChat: false
                })
                break
            case '/auth' :
                window.location.href = "https://github.com/login/oauth/authorize?client_id=7262f0da224a3673dee9&redirect_uri=http://devcodemylife.tech/api/oauth/github/redirect&scope=email&state=asiud88as7d&login=devcodemylife&allow_signup=true"
                break

            case '/logout' :
                window.location.href = `http://${window.location.host}/api/logout`
                break
            default:
                component = <Error page={window.location.pathname}/>;
                this.setState({
                    showChat: false
                })
                break;
        }

        this.setState(
            {
                com: component,
                load: true
            }
        )
    }

    copyLogin = (event) => {
        let login = ` ${event}, `

        let input = document.getElementById('textarea_chat')

        input.value += (login)
        input.focus()
        input.selectionStart = input.value.length
    }

    _handleKeyDownChat = (event)  => {
        if (event.keyCode===13 && event.ctrlKey) {
            let data = {
                value: event.target.value
            }

            if (data.value.length > 0) {


                fetch("/api/chat", {
                    method: "POST",
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(res => {
                        event.target.value = ''
                        event.target.style.height = "50px"

                        this.sendLogs(res.status.message)
                    })
                    .catch(error => {
                        this.sendLogs(error)
                        console.log(error)
                    });
            }
        }
    }


    componentDidMount() {
        this.swapComponent()
        this.getChat()

        let _this = this

        // window.onpopstate = function(e){
        //     alert('yeees!');
        // }

        window.onpopstate = (event) => {
            _this.swapComponent()
        };

        let this_ = this
        if (this.state.cent) {
            let chatAll = this.state.cent.subscribe("chat_all", function (message) {
                let data = this_.state.message

                data.push(message.data)
                this_.setState({message: data})
                document.getElementById('messages').scrollTo({top: document.getElementById('messages').scrollHeight, left: 0, behavior: 'smooth' });

                // document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight
            });

            chatAll.presenceStats().then(function(resp) {
                this_.setState({countUser: resp.num_clients})
            }, function(err) {
                this_.sendLogs(err)
                console.log(err)
            });
        }

    }

    render() {
        return (
            <div className="wrapper-content">
                <div className="content">
                    <div id="vertical_menu" className="reviews-menu">
                        <div className="wrapper-vertical-nav">
                            <div className="nav-item" path="/" onClick={this.handleClick} >
                                <div  className="icon-image" path="/" >
                                    <img  src={home} alt="home" path="/" />
                                </div>
                                <div className="nav-value" path="/">
                                    Главная
                                </div>
                            </div>
                            {
                                this.state.auth ?
                                    <div>
                                        <div className="nav-item" path={`/user/${this.state.data[0].id}`} onClick={this.handleClick} >
                                            <div  className="icon-image" path={`/user/${this.state.data[0].id}`}  >
                                                <img src={notes} alt="home" path={`/user/${this.state.data[0].id}`} />
                                            </div>
                                            <div path={`/user/${this.state.data[0].id}`}  className="nav-value">
                                                Заметки
                                            </div>
                                        </div>
                                        {/*<div className="nav-item" onClick={(e) => {*/}
                                        {/*    e.preventDefault();*/}
                                        {/*    window.location.href = `/user/${this.state.data[0].id}`*/}
                                        {/*}}>*/}
                                        {/*    <div  className="icon-image" onClick={(e) => {*/}
                                        {/*        e.preventDefault();*/}
                                        {/*        window.location.href = `/user/${this.state.data[0].id}`*/}
                                        {/*    }}>*/}
                                        {/*        <img src={notes} alt="home" onClick={(e) => {*/}
                                        {/*            e.preventDefault();*/}
                                        {/*            window.location.href = `/user/${this.state.data[0].id}`*/}
                                        {/*        }}/>*/}
                                        {/*    </div>*/}
                                        {/*    /!*<div path="/user" onClick={this.handleClick} className="nav-value">*!/*/}
                                        {/*    /!*    Заметки*!/*/}
                                        {/*    /!*</div>*!/*/}
                                        {/*</div>*/}
                                        <div className="nav-item" path="/messages" onClick={this.handleClick} >
                                            {
                                                this.state.messagesCount ?
                                                    <div className="counter-notification" id="counter_notification" path="/messages" >
                                                        {this.state.messagesCount}
                                                    </div>
                                                    :
                                                    null
                                            }
                                            <div  className="icon-image" path="/messages" >
                                                <img src={messages} alt="messages" path="/messages" />
                                            </div>
                                            <div path="/messages" className="nav-value">
                                                Мессенджер
                                            </div>
                                        </div>
                                        <div className="nav-item" path="/notification" onClick={this.handleClick} >
                                            {
                                                this.state.notification_count ?
                                                    <div className="counter-notification" id="counter_notification" path="/notification" >
                                                        {this.state.notification_count}
                                                    </div>
                                                :
                                                    null
                                            }

                                            <div  className="icon-image" path="/notification"  >
                                                <img src={notification} alt="home" path="/notification" />
                                            </div>
                                            <div path="/notification"  className="nav-value">
                                                Уведомления
                                            </div>
                                        </div>
                                        {/*<div className="nav-item" path="/settings" onClick={this.handleClick}>*/}
                                        {/*    <div  className="icon-image" path="/settings" onClick={this.handleClick}>*/}
                                        {/*        <img src={settings_icon} alt="home" path="/settings" onClick={this.handleClick}/>*/}
                                        {/*    </div>*/}
                                        {/*    /!*<div path="/settings" onClick={this.handleClick} className="nav-value">*!/*/}
                                        {/*    /!*    Настройки*!/*/}
                                        {/*    /!*</div>*!/*/}
                                        {/*</div>*/}
                                        {/*<div className="nav-item" path="/logout" onClick={this.handleClick} >*/}
                                        {/*    <div  className="icon-image rotate" path="/logout" onClick={this.handleClick} >*/}
                                        {/*        <img path="/logout" onClick={this.handleClick} src={singIn} alt="logout"/>*/}
                                        {/*    </div>*/}
                                        {/*    /!*<div path="/auth" onClick={this.handleClick} className="nav-value">*!/*/}
                                        {/*    /!*    Войти*!/*/}
                                        {/*    /!*</div>*!/*/}
                                        {/*</div>*/}
                                    </div>
                                :
                                    null
                                    // <div className="nav-item" path="/auth" onClick={this.handleClick} >
                                    //     <div  className="icon-image" path="/auth" onClick={this.handleClick} >
                                    //         <img path="/auth" onClick={this.handleClick} src={singIn} alt="home"/>
                                    //     </div>
                                    //     {/*<div path="/auth" onClick={this.handleClick} className="nav-value">*/}
                                    //     {/*    Войти*/}
                                    //     {/*</div>*/}
                                    // </div>
                            }

                            <div className="nav-item" path="/about" onClick={this.handleClick}>
                                <div  className="icon-image" path="/about" >
                                    <img path="/about" src={about} alt="about"/>
                                </div>
                                <div path="/about" className="nav-value">
                                    О нас
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="content-wall-views">
                        {
                            this.state.com
                        }
                    </div>
                    <div className="author-card">
                        {
                            this.state.showChat ?
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "100%"
                                }}>
                                    <div className="title-page">Общий чат</div>
                                    <div className="wrapper-chat">
                                        <div className="wrapper-items" id="messages">
                                            {this.state.message?.map(mes =>
                                                <div className="message-item">
                                                    <div className="wrapper-data">
                                                        <div className="photo-wrapper">
                                                            <img src={mes.avatar_url}  alt={mes.login} onClick={(e) => {
                                                                e.preventDefault();
                                                                window.location.href = `/user/${mes.id}`
                                                            }}/>
                                                        </div>
                                                        <div className="value-post">
                                                            <div className="feed-item-title">
                                                                <div className="link-user" onClick={(e) => {
                                                                    e.preventDefault();
                                                                    window.location.href = `/user/${mes?.id}`
                                                                }}>
                                                                    {mes?.login}
                                                                </div>
                                                                <div className="feed-item-datetime">
                                                                    {this.unixToDateTime(mes?.date_time)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="wrapper-data">
                                                        <div className="value-post">
                                                            <p>
                                                                <span onClick={() => this.copyLogin(mes.login)}>{mes.value}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="wrapper-input-old">
                                            {
                                                this.state.auth ?
                                                    <div>
                                                        <TextareaAutosize
                                                            onKeyDown={this._handleKeyDownChat}
                                                            placeholder="Введите сообщение"
                                                            maxRows={16}
                                                            id="textarea_chat"
                                                        >

                                                        </TextareaAutosize>
                                                        <div className="info-absolute">
                                                            Отправить - Ctrl + Enter
                                                        </div>
                                                    </div>
                                                    :
                                                    <div className="not_news" path="/auth" onClick={this.handleClick}>
                                                        Для отправки сообщений, авторизуйтесь.
                                                    </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            :
                                null

                        }
                    </div>
                </div>
                <div className="statistic">
                    Сейчас на сайте - {this.state.countUser}
                </div>
                <Footer/>
            </div>
        )
    }
}

export default Content;
