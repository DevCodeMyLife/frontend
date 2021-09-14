import React, { Component } from "react";
import {Link} from "react-navi";
import notes from "../icon/notes.png";
import code from "../icon/code.png";
import user from "../icon/user.png";
import messages from "../icon/messages.png";
import Head from "./Header";


class Nav extends Component{
    constructor(props) {
        super(props);

        this.state = {
            load: false,
            auth: false,
            data: null
        };
    }

    componentDidMount() {
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
                        messagesCount: res.count_message
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
                <div className="nav-item">
                    <Link className="nav-value" href="/freelances">
                        <div  className="icon-image" >
                            <img  src={code} alt="Фриланс" />
                        </div>
                        <div className="nav-value">
                            Фриланс
                        </div>
                    </Link>
                </div>
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
            </div>
        )
    }
}

export default Nav;
