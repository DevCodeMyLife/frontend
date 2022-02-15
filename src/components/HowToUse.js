import React, { Component } from "react";

class HoweToUse extends Component{
    constructor(props) {
        super(props);
        this.state = {}

    }

    render() {
        return (
            <div className="content-wall-views">
                <div className="feed-wrapper">
                    <div className="block-preview-main">
                        <div className="image-main-developer">
                            <img className="main-developer-photos" src="https://avatars.githubusercontent.com/u/29627450?v=4" alt="Андрей Шмелев-Шампанов"/>
                        </div>
                        <div className="message-info">
                            <p>
                                Привет и добро пожаловать к нам.
                            </p>
                            <div className="m-small-bobble" />
                            <div className="s-small-bobble" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default HoweToUse;
