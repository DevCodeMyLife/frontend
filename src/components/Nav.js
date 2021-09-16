import React, { Component } from "react";
import { ToastContainer } from 'react-toastify';
import { Socket } from './Socket'
import 'react-toastify/dist/ReactToastify.css';
import {Link} from "react-navi";
import notes from "../icon/notes.png";
import code from "../icon/code.png";
import user from "../icon/user.png";
import messages from "../icon/messages.png";
import team from "../icon/team.png"
import notification from "../icon/notification.png"
import song from "../sound/pop.mp3";

class Nav extends Component{
    constructor(props) {
        super(props);

        this.state = {
            load: false,
            auth: false,
            data: null,
            context: new AudioContext(),
            audio: new Audio(song),
            channel: null
        };

    }

    componentDidMount() {
        Socket.run()

        fetch("/api/authentication", {
            method: "POST",
            body: JSON.stringify({
                "finger": window.localStorage.getItem("finger")
            })
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0) {
                    this.setState({
                        auth: true,
                        data: res.data,
                        messagesCount: res.count_message,
                        notification_count: res.notification_count
                    });


                }
                this.setState({
                    load: true,
                });
            })


    }

    render() {
        return (
            <div className="wrapper-vertical-nav" >
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
                {
                    !this.state.load ?
                        <div className="loader-flex">
                            <div className="loader-small" />
                        </div>
                        :
                        this.state.auth ?
                            <div>
                                <div className="nav-item">
                                    <Link className="nav-value" href={`/user?id=${this.state.data[0].id}`}>
                                        <div  className="icon-image" >
                                            <img src={user} alt="messages" />
                                        </div>
                                        <div className="nav-value">
                                            Ваша страница
                                        </div>
                                    </Link>
                                </div>
                                <div className="nav-item">
                                    <Link className="nav-value" href="/feeds">
                                        <div  className="icon-image" >
                                            <img  src={notes} alt="Новости" />
                                        </div>
                                        <div className="nav-value">
                                            Новости
                                        </div>
                                    </Link>
                                </div>
                                <div className="nav-item" >
                                    {
                                        this.state.messagesCount ?
                                            <div className="counter-notification" id="counter_notification" path="/messages" >
                                                {
                                                    this.state.messagesCount > 10 ?
                                                        "10+"
                                                        :
                                                        this.state.messagesCount
                                                }
                                            </div>
                                            :
                                            null
                                    }
                                    <Link className="nav-value" href="/messages">
                                        <div  className="icon-image" >
                                            <img src={messages} alt="messages" />
                                        </div>
                                        <div className="nav-value">
                                            Мессенджер
                                        </div>
                                    </Link>
                                </div>
                                <div className="nav-item" >
                                    {
                                        this.state.notification_count ?
                                            <div className="counter-notification" id="counter_notification" path="/messages" >
                                                {
                                                    this.state.notification_count > 10 ?
                                                        "10+"
                                                        :
                                                        this.state.notification_count
                                                }
                                            </div>
                                                :
                                            null
                                    }
                                    <Link className="nav-value" href="/notification">
                                        <div  className="icon-image" >
                                            <img src={notification} alt="События" />
                                        </div>
                                        <div className="nav-value">
                                            События
                                        </div>
                                    </Link>
                                </div>
                                <div className="nav-item">
                                    <Link className="nav-value" href="/freelances">
                                        <div  className="icon-image" >
                                            <img  src={code} alt="Задачи" />
                                        </div>
                                        <div className="nav-value">
                                            Задачи
                                        </div>
                                    </Link>
                                </div>
                                <div className="nav-item">
                                    <Link className="nav-value" href="/teams">
                                        <div  className="icon-image" >
                                            <img  src={team} alt="Команды" />
                                        </div>
                                        <div className="nav-value">
                                            Команды
                                        </div>
                                    </Link>
                                </div>
                            </div>
                            :
                        null
                }
            </div>
        )
    }
}

export default Nav;
