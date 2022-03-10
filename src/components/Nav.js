import React, {Component} from "react";
import 'react-toastify/dist/ReactToastify.css';
import {Link} from "react-navi";
import notes from "../icon/notes.png";
import notes_dark from "../icon/notes_dark.png";

import code from "../icon/code.png";
import code_dark from "../icon/code_dark.png";

import user from "../icon/user.png";
import messages from "../icon/messages.png";
import messages_dark from "../icon/messages_dark.png";
import video from "../icon/video.png"
import video_dark from "../icon/video_dark.png"
import music from "../icon/music.png"
import music_dark from "../icon/music_dark.png"
import jobs from "../icon/jobs.png"
import jobs_dark from "../icon/jobs_dark.png"
import market from "../icon/market.png"
import market_dark from "../icon/market_dark.png"
import app from "../icon/app.png"
import app_dark from "../icon/app_dark.png"


// import team from "../icon/team.png"
// import team_dark from "../icon/team_dark.png"

import people from "../icon/people.png"
import people_dark from "../icon/people_dark.png"

import notification from "../icon/notification.png"
import notification_dark from "../icon/notification_dark.png"

import sing from "../icon/sing_in.png"
import user_dark from "../icon/user-dark.png"


class Nav extends Component {
    constructor(props) {
        super(props);

        this.state = {
            load: false, isDark: "light", store: this.props.store
        };

        this.state.store.subscribe(() => {
            this.setState(this.state.store.getState())
        })
    }

    updateHistory = (id) => {
        this.state.store.dispatch({
            type: "ACTION_UPDATE_HISTORY", value: {
                path: null, id: id
            }
        })
    }

    getPreferredColorScheme = () => {
        if (window?.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setState({
                isDark: "dark"
            })
        } else {
            this.setState({
                isDark: "light"
            })
        }
    }

    componentDidMount() {
        this.getPreferredColorScheme()

        window.matchMedia('(prefers-color-scheme: dark)').onchange = (event) => {
            this.getPreferredColorScheme()
        };

        this.setState({
            load: true
        })
    }

    render() {
        const state = this.state.store.getState()
        return (
            state.auth.user.isAuth ?
                <div className="wrapper-vertical-nav">
                    {
                        !this.state.load ?
                        <div className="loader-flex">
                            <div className="loader-small"/>
                        </div>
                        :
                        <div>
                            <div className="nav-item">
                                <Link className="nav-value" href={`/user/${state.auth.user.data.id}`}>
                                    <div className="icon-image">
                                        {this.state.isDark === "light" ? <img src={user} alt="Ваша страница"/> :
                                            <img src={user_dark} alt="Ваша страница"/>}

                                    </div>
                                    <div className="nav-value">
                                        Моя страница
                                    </div>
                                </Link>
                            </div>
                            <div className="nav-item">
                                {state.auth.user.messagesCount ? <div className="counter-notification" id="counter_notification"
                                                                      path="/messages">
                                    {state.auth.user.messagesCount > 10 ? "10+" : state.auth.user.messagesCount}
                                </div> : null}
                                <Link className="nav-value" href="/messages">
                                    <div className="icon-image">
                                        {this.state.isDark === "light" ? <img src={messages} alt="Мессенджер"/> :
                                            <img src={messages_dark} alt="Мессенджер"/>}
                                    </div>
                                    <div className="nav-value">
                                        Мессенджер
                                    </div>
                                </Link>
                            </div>
                            {/*<div className="nav-item">*/}
                            {/*    <Link className="nav-value" href="/video">*/}
                            {/*        <div className="icon-image">*/}
                            {/*            {this.state.isDark === "light" ? <img src={video} alt="Видеозаписи"/> :*/}
                            {/*                <img src={video_dark} alt="Видеозаписи"/>}*/}
                            {/*        </div>*/}
                            {/*        <div className="nav-value">*/}
                            {/*            Видеозаписи*/}
                            {/*        </div>*/}
                            {/*    </Link>*/}
                            {/*</div>*/}
                            {/*<div className="nav-item">*/}
                            {/*    <Link className="nav-value" href="/audio">*/}
                            {/*        <div className="icon-image">*/}
                            {/*            {this.state.isDark === "light" ? <img src={music} alt="Аудиозаписи"/> :*/}
                            {/*                <img src={music_dark} alt="Аудиозаписи"/>}*/}
                            {/*        </div>*/}
                            {/*        <div className="nav-value">*/}
                            {/*            Аудиозаписи*/}
                            {/*        </div>*/}
                            {/*    </Link>*/}
                            {/*</div>*/}
                            <div className="nav-item">
                                <Link className="nav-value" href="/feeds">
                                    <div className="icon-image">
                                        {this.state.isDark === "light" ? <img src={notes} alt="Лента"/> :
                                            <img src={notes_dark} alt="Лента"/>}
                                    </div>
                                    <div className="nav-value">
                                        Лента
                                    </div>
                                </Link>
                            </div>
                            {/*<div className="nav-item">*/}
                            {/*    <Link className="nav-value" href="/jobs">*/}
                            {/*        <div className="icon-image">*/}
                            {/*            {this.state.isDark === "light" ? <img src={jobs} alt="Работа"/> :*/}
                            {/*                <img src={jobs_dark} alt="Работа"/>}*/}
                            {/*        </div>*/}
                            {/*        <div className="nav-value">*/}
                            {/*            Найти работу*/}
                            {/*        </div>*/}
                            {/*    </Link>*/}
                            {/*</div>*/}
                            <div className="nav-item">
                                <Link className="nav-value" href="/people">
                                    <div className="icon-image">
                                        {this.state.isDark === "light" ? <img src={people} alt="Пользователи"/> :
                                            <img src={people_dark} alt="Пользователи"/>}
                                    </div>
                                    <div className="nav-value">
                                        Пользователи
                                    </div>
                                </Link>
                            </div>
                            <div className="nav-item">
                                {state.auth.user.notificationCount ?
                                    <div className="counter-notification" id="counter_notification"
                                         path="/notification">
                                        {state.auth.user.notificationCount > 10 ? "10+" : state.auth.user.notificationCount}
                                    </div> : null}
                                <Link className="nav-value" href="/notification">
                                    <div className="icon-image">
                                        {this.state.isDark === "light" ? <img src={notification} alt="События"/> :
                                            <img src={notification_dark} alt="События"/>}
                                    </div>
                                    <div className="nav-value">
                                        Уведомления
                                    </div>
                                </Link>
                            </div>
                            <div className="nav-item">
                                <Link className="nav-value" href="/app">
                                    <div className="icon-image">
                                        {this.state.isDark === "light" ? <img src={app} alt="Приложения"/> :
                                            <img src={app_dark} alt="Приложения"/>}
                                    </div>
                                    <div className="nav-value">
                                        Приложения
                                    </div>
                                </Link>
                            </div>
                            {
                                state.auth.user.data.testing ?
                                    <div>
                                        <div className="nav-item">
                                            <Link className="nav-value" href="/freelances">
                                                <div className="icon-image">
                                                    {this.state.isDark === "light" ? <img src={code} alt="Задачи"/> :
                                                        <img src={code_dark} alt="Задачи"/>}
                                                </div>
                                                <div className="nav-value">
                                                    Фриланс
                                                </div>
                                            </Link>
                                        </div>
                                        <div className="nav-item">
                                            <Link className="nav-value" href="/market">
                                                <div className="icon-image">
                                                    {this.state.isDark === "light" ? <img src={market} alt="Магазин"/> :
                                                        <img src={market_dark} alt="Магазин"/>}
                                                </div>
                                                <div className="nav-value">
                                                    Магазин
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                :
                                    null
                            }
                        </div>
                    }
                </div>
                :
                    window.location.pathname !== "/" ?
                        <div className="wrapper-vertical-nav">
                            {
                                !this.state.load ?
                                    <div className="loader-flex">
                                        <div className="loader-small"/>
                                    </div>
                                :
                                    <div className="nav-item">
                                        <Link className="nav-value" href={`/`}>
                                            <div className="icon-image">
                                                <img src={sing} alt="messages"/>
                                            </div>
                                            <div className="nav-value">
                                                Войти
                                            </div>
                                        </Link>
                                    </div>

                            }
                        </div>
                    :
                        window.location.pathname === "/" ?
                            <div className="wrapper-vertical-nav">
                                <div className="nav-item">
                                    <Link className="nav-value" href="/feeds">
                                        <div className="icon-image">
                                            {this.state.isDark === "light" ? <img src={notes} alt="Заметки"/> :
                                                <img src={notes_dark} alt="Заметки"/>}
                                        </div>
                                        <div className="nav-value">
                                            Новости
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        :
                            null
        )
    }
}

export default Nav;
