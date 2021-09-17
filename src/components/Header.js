import React, { Component } from "react";

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            auth: this.props.auth,
            user: this.props.user,
            load: this.props.load,
            showSettings: false
        }
    }

    render() {
        return (
            <header className="head">
                <div className="rectangle-head">
                    <div className="wrapper-logo unselectable">
                        <div className="place-logo wrapper-inline-block" onClick={(e) => {
                            e.preventDefault();
                            if (this.state.auth){
                                window.location.href = '/feeds'
                            }else{
                                window.location.href = '/'
                            }
                        }}>
                           [ DevCodeMyLife ]
                        </div>
                    </div>
                    <div className="wrapper-user">
                        <div className="wrapper-auth">
                            {
                                !this.state.load ?
                                    <div className="loader-small" />
                                :
                                    this.state.auth ?
                                        <div className="wrapper-auth-photo" style={this.state.showSettings ? {background: "#3890FC"} : {}}>
                                            <img src={this.state.user.avatar_url} alt={this.state.user.login}  onClick={() => {
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
                                >
                                    <div className="settings-user-item" onClick={() => {
                                        window.location.href = `http://${window.location.host}/user?id=${this.state.user.id}`
                                    }}>
                                        {this.state.user.login} <span style={{fontSize: "12px", color: "#585858"}}> - Это Вы</span>
                                    </div>
                                    <div className="settings-user-item" onClick={() => {
                                        window.location.href = `http://${window.location.host}/settings`
                                    }}>
                                        Настройки
                                    </div>
                                    <div className="separator">
                                        <div className="line-separator" />
                                    </div>
                                    <div className="settings-user-item" onClick={() => {
                                        window.location.href = `http://${window.location.host}/api/logout`
                                    }}>
                                        Выйти
                                    </div>
                                </div>
                            :
                                null
                        }
                    </div>
                </div>
                <div className="to-top" onClick={()=>{
                    let s = document.body.scrollTop||window.pageYOffset;
                    if(s > 0)
                        window.scroll(0,0)
                }}>
                    Наверх
                </div>
            </header>
        );
    }
}

export default Header;
