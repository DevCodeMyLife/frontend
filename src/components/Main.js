import React, {Component} from "react";
import github from '../icon/logo_github.png'

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countUsers: 0,
            countNotes: 0,
            countUsersToday: 0,
            loadData: false
        }
    }

    auth() {
        let data = {
            login: document.getElementById("auth_login").value,
            password: document.getElementById("auth_password").value,
        }


        fetch("/api/auth", {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 200) {
                    window.location.href = res.data.location
                } else if (res.status.code === 404) {
                    document.getElementById("error_auth").innerHTML = "Неверный логин или пароль"
                } else if (res.status.code === 7182) {
                    document.getElementById("error_auth").innerHTML = "Аккаунт был заблокирован администрацией сайта"
                }
            })
            .catch(error => {
                console.log(error)
            });
    }

    registration() {
        let data = {
            login: document.getElementById("registration_login").value,
            email: document.getElementById("registration_email").value,
            password: document.getElementById("registration_password").value,
        }

        let two_password = document.getElementById("registration_two_password").value

        if (data.password !== two_password) {
            document.getElementById("error_registration").innerHTML = "Пароли не совпадают"
            return
        }

        fetch("/api/registration", {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 200) {
                    window.location.href = res.data.location
                } else if (res.status.code === 3002) {
                    document.getElementById("error_registration").innerHTML = "Такой логин или эл. почта уже есть"
                } else if (res.status.code === 3003) {
                    document.getElementById("error_registration").innerHTML = "Не все поля были заполнены"
                }

            })
            .catch(error => {
                console.log(error)
            });
    }

    componentDidMount() {
        fetch("/api/status_platform", {
            method: "GET"
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 200) {
                    this.setState({
                        countUsers: res.data.count_user_to_day,
                        countNotes: res.data.count_notes,
                        // countUsersToday: res.data.count_users_today,
                        loadData: true
                    })
                }
            })
            .catch(error => {
                console.log(error)
            });
    }

    render() {
        return (
            <div style={{display: "flex"}}>
                <div className="content-wall-views">
                    <div className="view-status">
                        <div className="wrapper-status">
                            <div className="auth-box-title">
                                <h1>DevCodeMyLIfe</h1>
                            </div>
                            <p className="test-stat">
                                Этот проект для разработчиков, любого уровня.<br/>
                                Здесь Вы найдете интересные статьи, полезные заметки, мессенджер для общения.<br/>
                                Создавайте заметки с кодом чтобы ничего не потерять.
                            </p>
                        </div>
                    </div>
                    <div className="view-status">
                        <div className="wrapper-status">
                            <div className="auth-box-title">
                                <h2 className="title-span-auth">Вход через сторонние сервисы</h2>
                                {/*<div className="title-span-auth-small">Пройдите легкую регистрацию</div>*/}
                            </div>
                            <div className="auths-list">
                                <div className="button-auth github"
                                     onClick={
                                         () => {
                                             window.location.href = "https://github.com/login/oauth/authorize?client_id=7262f0da224a3673dee9&redirect_uri=http://devcodemylife.tech/api/oauth/github/redirect&scope=email&state=asiud88as7d&login=devcodemylife&allow_signup=true"
                                         }
                                     }
                                >
                                    <img className="auth-logo" src={github} alt="github"/>
                                </div>
                                {/*<div className="button-auth gitlab"*/}
                                {/*     onClick={*/}
                                {/*         () => {*/}
                                {/*             window.location.href = "https://gitlab.com/oauth/authorize?client_id=f60720800a4eaafcb6edf0a1df659b19e081f4069ca6fdf741a5f445049ac40a&redirect_uri=https://devcodemylife.tech/api/oauth/gitlab/redirect&response_type=code&scope=api+read_user&state=fca1dfacc51f49c2b7f9246264c46d40&code_challenge=kUta11xlQkPRg4PmL4XbW1sbohklCzg5UxLl9ymMxyU&code_challenge_method=S256"*/}
                                {/*         }*/}
                                {/*     }*/}
                                {/*>*/}
                                {/*    <img className="auth-logo" src={gitlab} alt="gitlab" />*/}
                                {/*</div>*/}
                            </div>
                        </div>
                    </div>
                    {
                        this.state.loadData ?
                            <div className="view-status">
                                <div className="wrapper-status">
                                    <h3 className="auth-box-title">
                                        Статистика платформы
                                    </h3>
                                    <div className="auths-list">
                                        <p>
                                            <span className="test-stat">Событий сегодня:</span> <span
                                            className="green">{this.state.countUsers}</span><br/>
                                            <span className="test-stat">Созданных заметок всего:</span> <span
                                            className="green">{this.state.countNotes}</span><br/>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            :
                            <div className="view-status">
                                <div className="wrapper-status">
                                    <div className="auth-view-box"
                                         style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <div className="loader"/>
                                    </div>
                                </div>
                            </div>
                    }
                </div>
                <div className="auth-box-list">
                    <div className="view-status" style={{paddingLeft: 0}}>
                        <div className="wrapper-status">
                            <h2 className="title-span-auth">Вход</h2>
                            <div className="wrapper-input fix_wrapper">
                                <input className="input-default" placeholder="Логин" type="text" id="auth_login"/>
                            </div>
                            <div className="wrapper-input fix_wrapper">
                                <input className="input-default" placeholder="Пароль" type="password"
                                       id="auth_password"/>
                            </div>
                            <div className="wrapper-input fix_wrapper">
                                <div className="button-general-page" onClick={() => {
                                    this.auth()
                                }}>
                                    Войти
                                </div>
                            </div>
                            <div className="error-wrapper center red" id="error_auth"/>
                        </div>
                    </div>
                    <div className="view-status" style={{paddingLeft: 0}}>
                        <div className="wrapper-status">
                            <h2 className="title-span-auth">Регистрация</h2>
                            <div className="wrapper-input fix_wrapper">
                                <input className="input-default" maxLength={28} placeholder="Логин" type="text"
                                       id="registration_login"/>
                            </div>
                            <div className="wrapper-input fix_wrapper">
                                <input className="input-default" maxLength={30} placeholder="Эл. почта" type="text"
                                       id="registration_email"/>
                            </div>
                            <div className="wrapper-input fix_wrapper">
                                <input className="input-default" placeholder="Пароль" type="password"
                                       id="registration_password"/>
                            </div>
                            <div className="wrapper-input fix_wrapper">
                                <input className="input-default" placeholder="Повторите пароль" type="password"
                                       id="registration_two_password"/>
                            </div>
                            <div className="wrapper-input fix_wrapper">
                                <div className="button-general-page" onClick={() => {
                                    this.registration()
                                }}>
                                    Зарегистрироваться
                                </div>
                            </div>
                            <div className="error-wrapper center red" id="error_registration"/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Main;
