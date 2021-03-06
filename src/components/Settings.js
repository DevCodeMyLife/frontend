import React, {Component} from "react";
import Switch from "./Switch";

// import {Helmet} from "react-helmet";

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            privatPost: false,
            testing: false,
            load: "load",
            login: null,
            name: null,
            lastName: null,
            email: null,
            link: null,
            store: this.props.store,
            imagePreviewUrl: null,
            crop: {
                unit: "px",
                x: 0,
                y: 0,
                width: 300,
                height: 300,
                aspect: 300 / 300
            },
            cropImage: null,
            showCrop: false,
            imageRef: null
        }

        this.state.store.subscribe(() => {
            this.setState(this.state.store.getState())
        })
    }

    changeSettingsTesting = (event) => {
        const store = this.state.store.getState()
        let data = {
            testing: !event,
            privat_post: store.auth.user.data.privat_post
        }
        fetch("/api/settings?flags=switch", {
            method: "PUT",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                this.updateState()

            })
            .catch(error => {
                console.log(error)
            });
    }

    changeSettingsPrivat = (event) => {
        const store = this.state.store.getState()
        let data = {
            testing: store.auth.user.data.testing,
            privat_post: !event
        }
        fetch("/api/settings?flags=switch", {
            method: "PUT",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                this.updateState()

            })
            .catch(error => {
                console.log(error)
            });
    }

    changeSettingsAdminMainPage = (event) => {
        const store = this.state.store.getState()


        let data = {
            main_page: !event,
            feed: store.components.settings.feed,
            messenger: store.components.settings.messenger
        }
        fetch("/api/app/components", {
            method: "PUT",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                this.updateState()

            })
            .catch(error => {
                console.log(error)
            });
    }

    changeSettingsAdminMessengerPage = (event) => {
        const store = this.state.store.getState()


        let data = {
            main_page: store.components.settings.messenger,
            feed: store.components.settings.feed,
            messenger: !event
        }
        fetch("/api/app/components", {
            method: "PUT",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                this.updateState()

            })
            .catch(error => {
                console.log(error)
            });
    }

    changeSettingsAdminFeedPage = (event) => {
        const store = this.state.store.getState()


        let data = {
            main_page: store.components.settings.messenger,
            feed: !event,
            messenger: store.components.settings.feed
        }
        fetch("/api/app/components", {
            method: "PUT",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                this.updateState()

            })
            .catch(error => {
                console.log(error)
            });
    }

    getLastVisit = (d) => {
        return Math.floor(d / 60)
    }

    updateState() {
        fetch("/api/authentication", {
            method: "POST",
            body: JSON.stringify({})
        })
            .then(response => response.json())
            .then(res => {
                if (res?.status.code === 0) {
                    this.state.store.dispatch({
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

                    fetch("/api/app/components", {
                        method: "GET"
                    })
                        .then(response => response.json())
                        .then(res => {
                            if (res?.status.code === 0) {
                                this.state.store.dispatch({
                                    type: "ACTION_SET_COMPONENTS", value: {
                                        settings: res.data,
                                    }
                                })
                            }
                        })
                }
            })


    }

    save() {
        let data = {
            login: document.getElementById("login").value,
            name: document.getElementById("name").value,
            last_name: document.getElementById("last_name").value,
            email: document.getElementById("email").value,
            link: document.getElementById("link").value

        }
        fetch("/api/settings", {
            method: "PUT",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === "0") {
                    document.getElementById("event_save").style.color = "green"
                    document.getElementById("event_save").innerHTML = "??????????????????"
                    this.updateState()
                } else {
                    document.getElementById("event_save").style.color = "red"
                    document.getElementById("event_save").innerHTML = "?????? ???????? ???????????? ???????? ??????????????????"
                }
            })
            .catch(error => {
                console.log(error)
            });
    }

    componentDidMount() {
        fetch("/api/app/components", {
            method: "GET"
        })
            .then(response => response.json())
            .then(res => {
                if (res?.status.code === 0) {

                    this.state.store.dispatch({
                        type: "ACTION_SET_COMPONENTS", value: {
                            settings: res.data,
                        }
                    })
                    this.setState({
                        load: "complete"
                    })
                }
            })
    }

    render() {
        const state = this.state.store.getState()
        return (
            <div style={{display: "flex"}}>
                <div className="content-wall-views">
                    {
                        state.auth.user.isAuth ?

                            this.state.load === "complete" ?
                                <div className="feed-wrapper">
                                    <div className="main-place-wrapper">
                                        <p>
                                            <b>???????????????????????? - </b> ?????????????? ?????????? ???????????????????? ????????????????????????, ????
                                            ?????????????????????????? ?????? ????????????,
                                            ?? ?????????????????? ??????????????, ?? ?????????? ???????????? ??????????????, ???????????????? ???????????? ?? ??????????????????????
                                            ?????? ?????????? ???????????????? ???? ??????????????????.
                                        </p>
                                    </div>
                                    <div className="main-place-wrapper-settings">
                                        <div className="block-settings child_settings">
                                            <div className="key-settings">
                                                ?????????????????????? ?????????????? ????????????????
                                            </div>
                                            <div className="value-settings">
                                                {
                                                    state.auth.user.data.privat_post ?
                                                        <Switch enable={true}
                                                                callBack={(e) => this.changeSettingsPrivat(e)}/>
                                                        :
                                                        <Switch enable={false}
                                                                callBack={(e) => this.changeSettingsPrivat(e)}/>
                                                }
                                            </div>
                                            {/*<div className="separator" />*/}
                                        </div>
                                        <div className="block-settings child_settings">
                                            <div className="key-settings">
                                                ?????????????????????? ?? ????????????????????????
                                            </div>
                                            <div className="value-settings">
                                                {
                                                    state.auth.user.data.testing ?
                                                        <Switch enable={true}
                                                                callBack={(e) => this.changeSettingsTesting(e)}/>
                                                        :
                                                        <Switch enable={false}
                                                                callBack={(e) => this.changeSettingsTesting(e)}/>
                                                }
                                            </div>
                                            {/*<div className="separator" />*/}
                                        </div>
                                    </div>
                                    <div className="main-place-wrapper-settings">
                                        <div className="wrapper-input fix_wrapper">
                                            <input className="input-default" maxLength="28" placeholder="??????????"
                                                   type="text" id="login" defaultValue={state.auth.user.data.login}/>
                                        </div>
                                        <div className="wrapper-input fix_wrapper">
                                            <input className="input-default" maxLength="28" placeholder="??????"
                                                   type="text" id="name" defaultValue={state.auth.user.data.name}/>
                                        </div>
                                        <div className="wrapper-input fix_wrapper">
                                            <input className="input-default" maxLength="28" placeholder="??????????????"
                                                   type="text" id="last_name"
                                                   defaultValue={state.auth.user.data.last_name}/>
                                        </div>
                                        <div className="wrapper-input fix_wrapper">
                                            <input className="input-default" maxLength="30"
                                                   placeholder="?????????????????????? ??????????" type="text" id="email"
                                                   defaultValue={state.auth.user.data.email}/>
                                        </div>
                                        <div className="wrapper-input fix_wrapper">
                                            <input className="input-default" maxLength="60"
                                                   placeholder="???????????? ???? ????????????" type="text" id="link"
                                                   defaultValue={state.auth.user.data.link_summary}/>
                                        </div>
                                        <div className="wrapper-input fix_wrapper">
                                            <div className="button-default" onClick={() =>
                                                this.save()
                                            }>
                                                ??????????????????
                                            </div>
                                        </div>
                                        <div className="error-wrapper center" id="event_save" style={{color: "green"}}/>
                                    </div>

                                    {
                                        state.auth.user.data.scope === "admin" ?
                                            <div>
                                                <div className="main-place-wrapper">
                                                    <p>
                                                        ???????????? ????????????????????
                                                    </p>
                                                </div>
                                                <div className="main-place-wrapper-settings">
                                                    <div className="block-settings child_settings">
                                                        <div className="key-settings">
                                                            messenger
                                                        </div>
                                                        <div className="value-settings">
                                                            {
                                                                state.components.settings.messenger ?
                                                                    <Switch enable={true} callBack={(e) => {
                                                                        this.changeSettingsAdminMessengerPage(e)
                                                                    }}/>
                                                                    :
                                                                    <Switch enable={false} callBack={(e) => {
                                                                        this.changeSettingsAdminMessengerPage(e)
                                                                    }}/>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="block-settings child_settings">
                                                        <div className="key-settings">
                                                            main_page
                                                        </div>
                                                        <div className="value-settings">
                                                            {
                                                                state.components.settings.main_page ?
                                                                    <Switch enable={true} callBack={(e) => {
                                                                        this.changeSettingsAdminMainPage(e)
                                                                    }}/>
                                                                    :
                                                                    <Switch enable={false} callBack={(e) => {
                                                                        this.changeSettingsAdminMainPage(e)
                                                                    }}/>
                                                            }
                                                        </div>
                                                        {/*<div className="separator" />*/}
                                                    </div>
                                                    <div className="block-settings child_settings">
                                                        <div className="key-settings">
                                                            feed
                                                        </div>
                                                        <div className="value-settings">
                                                            {
                                                                state.components.settings.feed ?
                                                                    <Switch enable={true} callBack={(e) => {
                                                                        this.changeSettingsAdminFeedPage(e)
                                                                    }}/>
                                                                    :
                                                                    <Switch enable={false} callBack={(e) => {
                                                                        this.changeSettingsAdminFeedPage(e)
                                                                    }}/>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            :
                                            null
                                    }
                                </div>

                                :
                                <div className="loader-wrapper feed-wrapper">
                                    <div className="loader"/>
                                </div>
                            :
                            <div>
                                {/*<div style={{"background": "#FF9898"}} className="title-page">*/}
                                {/*  ????????????*/}
                                {/*</div>*/}
                                <div className="error-wrapper">
                                    <div className="error-page">
                                        ?????????????????????????? ?????????? ?????????????????????????? ?????? ????????????????.
                                    </div>
                                </div>
                            </div>
                    }
                </div>
                <div className="tags-view">
                    {
                        state.auth.user.isAuth ?
                            this.state.load === "complete" ?
                                <div className="tags-box">
                                    <div className="main-place-photo-column ">
                                        {
                                            <img src={state.auth.user.data.avatar_url} alt={state.auth.user.data.login}
                                                 style={{cursor: "default"}}/>
                                        }
                                    </div>
                                    <div className="main-place-info-column ">
                                        {/*<div className="main-place date_active">*/}
                                        {/*    {*/}

                                        {/*        (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(state.auth.user.data.last_active_at).getTime() / 1000))) > 120 ?*/}
                                        {/*            (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(state.auth.user.data.last_active_at).getTime() / 1000))) > 60 ?*/}
                                        {/*                <span className="info_status">?????????????????? ???????????????????? ???????? { new Date(state.auth.user.data.last_active_at).toLocaleString() }</span>*/}
                                        {/*                :*/}
                                        {/*                <span className="info_status">?????????????????? ???????????????????? ???????? { this.getLastVisit( (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(state.auth.user.data.last_active_at).getTime() / 1000))) )} ?????????? ??????????.</span>*/}
                                        {/*            :*/}
                                        {/*                <span className="info_status">???????????? ???? ??????????</span>*/}

                                        {/*    }*/}
                                        {/*</div>*/}
                                        <div className="main-place name">
                                            {
                                                state.auth.user.data?.name ?
                                                    " " + state.auth.user.data.name + " " + state.auth.user.data.last_name
                                                    :
                                                    " " + state.auth.user.data.login

                                            }
                                        </div>
                                    </div>
                                </div>
                                :
                                state.auth.user.isAuth ?
                                    null
                                    :
                                    <div className="loader-wrapper feed-wrapper">
                                        <div className="loader"/>
                                    </div>
                            :
                            null
                    }
                </div>
            </div>
        );
    }

}

export default Settings;
