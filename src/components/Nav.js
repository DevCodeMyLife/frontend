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
            load: false,
            isDark: "light",
            store: this.props.store
        };

        this.state.store.subscribe(() => {
            this.setState(this.state.store.getState())
        })
    }

    updateHistory = (id) => {
        this.state.store.dispatch({
            type: "ACTION_UPDATE_HISTORY", value: {
                path: null,
                id: id
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
                                            {
                                                this.state.isDark === "light" ?
                                                    <img src={user} alt="Ваша страница"/>
                                                    :
                                                    <img src={user_dark} alt="Ваша страница"/>
                                            }

                                        </div>
                                        <div className="nav-value">
                                            Моя страница
                                        </div>
                                    </Link>
                                </div>
                                <div className="nav-item">
                                    <Link className="nav-value" href="/people">
                                        <div className="icon-image">
                                            {
                                                this.state.isDark === "light" ?
                                                    <img src={people} alt="Люди"/>
                                                    :
                                                    <img src={people_dark} alt="Люди"/>
                                            }
                                        </div>
                                        <div className="nav-value">
                                            Люди
                                        </div>
                                    </Link>
                                </div>
                                <div className="nav-item">
                                    <Link className="nav-value" href="/feeds">
                                        <div className="icon-image">
                                            {
                                                this.state.isDark === "light" ?
                                                    <img src={notes} alt="Заметки"/>
                                                    :
                                                    <img src={notes_dark} alt="Заметки"/>
                                            }
                                        </div>
                                        <div className="nav-value">
                                            Новости
                                        </div>
                                    </Link>
                                </div>
                                <div className="nav-item">
                                    {
                                        state.auth.user.messagesCount ?
                                            <div className="counter-notification" id="counter_notification"
                                                 path="/messages">
                                                {
                                                    state.auth.user.messagesCount > 10 ?
                                                        "10+"
                                                        :
                                                        state.auth.user.messagesCount
                                                }
                                            </div>
                                            :
                                            null
                                    }
                                    <Link className="nav-value" href="/messages">
                                        <div className="icon-image">
                                            {
                                                this.state.isDark === "light" ?
                                                    <img src={messages} alt="Мессенджер"/>
                                                    :
                                                    <img src={messages_dark} alt="Мессенджер"/>
                                            }
                                        </div>
                                        <div className="nav-value">
                                            Мессенджер
                                        </div>
                                    </Link>
                                </div>
                                <div className="nav-item">
                                    {
                                        state.auth.user.notificationCount ?
                                            <div className="counter-notification" id="counter_notification"
                                                 path="/notification">
                                                {
                                                    state.auth.user.notificationCount > 10 ?
                                                        "10+"
                                                        :
                                                        state.auth.user.notificationCount
                                                }
                                            </div>
                                            :
                                            null
                                    }
                                    <Link className="nav-value" href="/notification">
                                        <div className="icon-image">
                                            {
                                                this.state.isDark === "light" ?
                                                    <img src={notification} alt="События"/>
                                                    :
                                                    <img src={notification_dark} alt="События"/>
                                            }
                                        </div>
                                        <div className="nav-value">
                                            Уведомления
                                        </div>
                                    </Link>
                                </div>
                                {
                                    state.auth.user.data.testing ?
                                        <div>
                                            <div className="nav-item">
                                                <Link className="nav-value" href="/freelances">
                                                    <div className="icon-image">
                                                        {
                                                            this.state.isDark === "light" ?
                                                                <img src={code} alt="Задачи"/>
                                                                :
                                                                <img src={code_dark} alt="Задачи"/>
                                                        }
                                                    </div>
                                                    <div className="nav-value">
                                                        Фриланс
                                                    </div>
                                                </Link>
                                            </div>
                                            {/*<div className="nav-item">*/}
                                            {/*    <Link className="nav-value" href="/teams">*/}
                                            {/*        <div  className="icon-image" >*/}
                                            {/*            {*/}
                                            {/*                this.state.isDark === "light" ?*/}
                                            {/*                    <img  src={team} alt="Команды" />*/}
                                            {/*                    :*/}
                                            {/*                    <img  src={team_dark} alt="Команды" />*/}
                                            {/*            }*/}
                                            {/*        </div>*/}
                                            {/*        <div className="nav-value">*/}
                                            {/*            Команды*/}
                                            {/*        </div>*/}
                                            {/*    </Link>*/}
                                            {/*</div>*/}
                                        </div>
                                        :
                                        null
                                }

                            </div>
                        // :
                        // <div className="nav-item">
                        //     <Link className="nav-value" href={`/`}>
                        //         <div  className="icon-image" >
                        //             <img src={sing} alt="messages" />
                        //         </div>
                        //         <div className="nav-value">
                        //             Войти
                        //         </div>
                        //     </Link>
                        // </div>

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
                    null
        )
    }
}

export default Nav;
