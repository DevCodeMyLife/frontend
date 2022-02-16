import React, {Component} from "react";

class ErrorPage extends Component {

    render() {
        return (
            <div className="wrapper-content">
                <div className="content">
                    <div className="rectangle-back">
                        <div className="button-default wrapper-inline-block" onClick={() => {
                            window.history.go(-1)
                        }}>
                            Назад
                        </div>
                    </div>
                    <div className="error-wrapper">
                        <span>Такой страницы нет :(</span>
                    </div>
                </div>
            </div>
        );
    }
}

export default ErrorPage;
