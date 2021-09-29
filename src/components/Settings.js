import React, { Component } from "react";
import Switch from "./Switch";

class Settings extends Component{
    constructor(props) {
        super(props);
        this.state = {
            privatPost: false,
            testing: false,
            load: "load",
            login: null,
            name: null,
            lastName: null,
            email: null
        }
    }

    changeSettingsTesting = (event) => {
        let data = {
            testing: !event,
            privat_post: this.state.privatPost
        }
        fetch("/api/settings?flags=switch", {
            method: "PUT",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                this.fetchUpdateState()

            })
            .catch(error => {
                console.log(error)
            });
    }

    changeSettingsPrivat = (event) => {
        let data = {
            testing: this.state.testing,
            privat_post: !event
        }
        fetch("/api/settings?flags=switch", {
            method: "PUT",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                this.fetchUpdateState()

            })
            .catch(error => {
                console.log(error)
            });
    }

    save() {
        let data = {
            login: document.getElementById("login").value,
            name: document.getElementById("name").value,
            last_name: document.getElementById("last_name").value,
            email: document.getElementById("email").value
        }
        fetch("/api/settings", {
            method: "PUT",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === "0"){
                    document.getElementById("event_save").style.color = "green"
                    document.getElementById("event_save").innerHTML = "Сохранено"
                    this.fetchUpdateState()
                }else{
                    document.getElementById("event_save").style.color = "red"
                    document.getElementById("event_save").innerHTML = "Все поля должны быть заполнены"
                }


            })
            .catch(error => {
                console.log(error)
            });
    }

    fetchUpdateState(){
        fetch("/api/settings", {
            method: "GET",
        })
            .then(response => response.json())
            .then(res => {
                // if (res.status.code === "0") {
                this.setState({
                    privatPost: res.data.privat_post,
                    testing: res.data.testing,
                    login: res.data.login,
                    name: res.data.name,
                    lastName: res.data.last_name,
                    email: res.data.email,
                    load: "complete"
                })
            })
            .catch(error => {
                console.log(error)
            });
    }

    componentDidMount() {
        this.fetchUpdateState()
    }

    render() {
        return (
            <div className="content-wall-views">
                {
                    this.state.load === "complete" ?
                        <div className="feed-wrapper">
                            <div className="main-place-wrapper">
                                <p>
                                    <b>Тестирование - </b> включив режим готовности тестирования, Вы подтверждаете что готовы,
                                    в случайном порядке, в любой момент времени, получить доступ к функционалу что может работать не стабильно.
                                </p>
                            </div>
                            <div className="main-place-wrapper-settings">
                                <div className="block-settings child_settings">
                                    <div className="key-settings">
                                        Публиковать заметки приватно
                                    </div>
                                    <div className="value-settings">
                                        {
                                            this.state.privatPost ?
                                                <Switch enable={true} callBack={(e)=> this.changeSettingsPrivat(e)}/>
                                                :
                                                <Switch enable={false} callBack={(e)=> this.changeSettingsPrivat(e)}/>
                                        }
                                    </div>
                                    {/*<div className="separator" />*/}
                                </div>
                                {/*<div className="block-settings child_settings">*/}
                                {/*    <div className="key-settings">*/}
                                {/*        Показывать Ваш email*/}
                                {/*    </div>*/}
                                {/*    <div className="value-settings">*/}
                                {/*        {*/}
                                {/*            this.state.privatPost ?*/}
                                {/*                <Switch enable={true} callBack={(e)=> this.changeSettingsPrivat(e)}/>*/}
                                {/*                :*/}
                                {/*                <Switch enable={false} callBack={(e)=> this.changeSettingsPrivat(e)}/>*/}
                                {/*        }*/}
                                {/*    </div>*/}
                                {/*    /!*<div className="separator" />*!/*/}
                                {/*</div>*/}
                                <div className="block-settings child_settings">
                                    <div className="key-settings">
                                        Участвовать в тестировании
                                    </div>
                                    <div className="value-settings">
                                        {
                                            this.state.testing ?
                                                <Switch enable={true} callBack={(e)=> this.changeSettingsTesting(e)}/>
                                                :
                                                <Switch enable={false} callBack={(e)=> this.changeSettingsTesting(e)}/>
                                        }
                                    </div>
                                    {/*<div className="separator" />*/}
                                </div>
                            </div>
                            <div className="main-place-wrapper-settings">
                                <div className="wrapper-input">
                                    <input className="input-default" maxLength="28" placeholder="Логин" type="text" id="login" defaultValue={this.state.login}/>
                                </div>
                                <div className="wrapper-input">
                                    <input className="input-default" maxLength="28" placeholder="Имя" type="text" id="name" defaultValue={this.state.name}/>
                                </div>
                                <div className="wrapper-input">
                                    <input className="input-default" maxLength="28" placeholder="Фамилия" type="text" id="last_name" defaultValue={this.state.lastName} />
                                </div>
                                <div className="wrapper-input">
                                    <input className="input-default" maxLength="30" placeholder="Электронная почта" type="text" id="email" defaultValue={this.state.email} />
                                </div>
                                <div className="wrapper-input">
                                    <div className="button-default" onClick={()=>
                                        this.save()
                                    }>
                                        Сохранить
                                    </div>
                                </div>
                                <div className="error-wrapper center" id="event_save" style={{color: "green"}}/>
                            </div>
                        </div>
                    :
                        <div className="loader-wrapper feed-wrapper">
                            <div className="loader" />
                        </div>
                }
            </div>
        );
    }

}

export default Settings;
