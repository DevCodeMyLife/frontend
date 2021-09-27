import React, { Component } from "react";
import Switch from "./Switch";

class Settings extends Component{
    constructor(props) {
        super(props);
        this.state = {
            privatPost: false,
            testing: false,
            load: "load"
        }
    }

    changeSettingsTesting = (event) => {
        let data = {
            testing: !event,
            privat_post: this.state.privatPost
        }
        fetch("/api/settings", {
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
        fetch("/api/settings", {
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
                    load: "complete"
                })
                // }

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
                                {/*        Экспортировать GitHub Gists*/}
                                {/*    </div>*/}
                                {/*    <div className="value-settings">*/}
                                {/*        <Switch enable={false} callBack={()=> {}}/>*/}
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
