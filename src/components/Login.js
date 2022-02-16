import React, {Component} from "react";

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "React"
        };
        this.state = {
            error: null,
            isLoaded: false,
            result: null
        }

    }

    componentDidMount() {
        fetch("/api/authentication", {
            method: "POST"
        })
            .then(response => response.json())
            .then(res => {
                console.log(res)
                if (res.status.code === 0 && res.data.length > 0) {
                    this.setState({
                        isLoaded: true,
                        result: res.data
                    });
                }
            })
            .catch(error => {
                console.log(error)
                this.setState({
                    isLoaded: false,
                    result: {}
                });
            });
    }

    handleClick = event => {
        let attr = event.target.getAttribute('path')
        if (attr)
            window.location.pathname = attr

    };


    unixToDateTime(unixTimestamp) {
        const milliseconds = unixTimestamp * 1000
        const dateObject = new Date(milliseconds)

        return dateObject.toLocaleString()
    }

    render() {
        let {isLoaded, result} = this.state;
        if (!isLoaded) {
            return (
                <div className="menu-user unselectable">

                    <div className="menu-user-item">
                        <div className="login-logo" onClick={(e) => {
                            e.preventDefault();
                            window.location.href = 'https://github.com/login/oauth/authorize?client_id=7262f0da224a3673dee9&redirect_uri=http://devcodemylife.tech/api/oauth/github/redirect&scope=email&state=asiud88as7d&login=devcodemylife&allow_signup=true';
                        }}>
                            Войти через GitHub
                        </div>
                    </div>


                    {/*<div className="login-value">*/}
                    {/*    Войти через Google*/}
                    {/*</div>*/}
                </div>
            )
        } else {
            return (
                <div>
                    {result?.map(data =>
                        <div key="wrapper" className="menu-user unselectable">
                            <div key={data.login} className="menu-user-item" path="/user" onClick={this.handleClick}>
                                Ваши заметки
                            </div>
                            <div key="settings" className="menu-user-item" path="/settings" onClick={this.handleClick}>
                                Настройки
                            </div>
                        </div>
                    )}
                </div>
            )
        }
    }
}

export default Login;
