import React, {Component} from "react";
import {Link} from "react-navi";

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            store: this.props.store,
            load: this.props.load,
            showSettings: false
        }
    }

    render() {
        const state = this.state.store.getState()
        return (
            <header className="head">
                <div className="rectangle-head">
                    <div className="wrapper-logo unselectable">
                        <div className="place-logo wrapper-inline-block" onClick={(e) => {
                            e.preventDefault();
                            if (state.auth.user.isAuth) {
                                window.location.href = '/feeds'
                            } else {
                                window.location.href = '/'
                            }
                        }}>
                            [ DevCodeMyLife ]
                        </div>
                    </div>
                    <div className="wrapper-user">
                        {
                            state.auth.user.isAuth ?
                                <div className="balance-block">
                                    <div className="balance-place">
                                        <Link href="/balance">
                                            <span className="balance-count">
                                                {(parseInt(state.auth.user.data.balance)).toLocaleString('ru')} tokens
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            :
                                null
                        }
                        <div className="wrapper-auth">
                            {
                                !state.auth.isLoaded ?
                                    <div className="loader-small"/>
                                    :
                                    state.auth.user.isAuth ?
                                        <div className="wrapper-auth-photo"
                                             style={this.state.showSettings ? {background: "#3890FC"} : {}}>
                                            <img src={state.auth.user.data.avatar_url} alt={state.auth.user.data.login}
                                                 onClick={() => {
                                                     this.setState(prevState => ({
                                                         showSettings: !prevState.showSettings
                                                     }));
                                                 }}/>
                                        </div>
                                        :
                                        null

                            }
                        </div>
                        {
                            this.state.showSettings ?
                                <div className="settings-user"
                                     onMouseLeave={
                                         () => {
                                             this.setState(prevState => ({
                                                 showSettings: !prevState.showSettings
                                             }));
                                         }
                                     }

                                     onClick={
                                         () => {
                                             this.setState(prevState => ({
                                                 showSettings: !prevState.showSettings
                                             }));
                                         }
                                     }
                                >
                                    <Link href={`/user/${state.auth.user.data.id}`}>
                                        <div className="settings-user-item">
                                            {state.auth.user.data.login} <span
                                            style={{fontSize: "12px", color: "#585858"}}> - ?????? ????</span>
                                        </div>
                                    </Link>
                                    <div className="nav-hidden">
                                        <div className="separator">
                                            <div className="line-separator"/>
                                        </div>
                                        <div className="settings-user-item" onClick={() => {
                                            window.location.href = `http://${window.location.host}/people`
                                        }}>
                                            ????????
                                        </div>
                                        <div className="settings-user-item" onClick={() => {
                                            window.location.href = `http://${window.location.host}/feeds`
                                        }}>
                                            ??????????????
                                        </div>
                                        <div className="settings-user-item" onClick={() => {
                                            window.location.href = `http://${window.location.host}/messages`
                                        }}>
                                            ????????????????????
                                        </div>
                                        <div className="settings-user-item" onClick={() => {
                                            window.location.href = `http://${window.location.host}/notification`
                                        }}>
                                            ??????????????????????
                                        </div>
                                    </div>
                                    <Link href="/settings">
                                        <div className="settings-user-item">
                                            ??????????????????
                                        </div>
                                    </Link>
                                    <div className="separator">
                                        <div className="line-separator"/>
                                    </div>
                                    <div className="settings-user-item" onClick={() => {
                                        window.location.href = `http://${window.location.host}/api/logout`
                                    }}>
                                        ??????????
                                    </div>
                                </div>
                                :
                                null
                        }
                    </div>
                </div>
                <div className="to-top" id="to_top" onClick={() => {
                    let s = document.body.scrollTop || window.pageYOffset;
                    if (s > 0)
                        window.scroll(0, 0)
                }}>
                    ????????????
                </div>
            </header>
        );
    }
}

export default Header;
