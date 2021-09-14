import React, { Component }  from "react";
import Nav from "./Nav";

class Teams extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className="wrapper-content">
                <div className="content">
                    <div id="vertical_menu" className="reviews-menu">
                        <Nav />
                    </div>
                    <div className="content-wall-views">
                        <div className="wrapper-feed">
                            <div className="feed-wrapper">
                                <div className="main-place-wrapper">
                                    Скоро здесь что то будет
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Teams;
