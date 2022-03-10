import React, {Component} from "react";

class Apps extends Component{
    constructor(props) {
        super(props);
        this.state = {
            name: "React"
        };

        this.state = {
            store: this.props.store
        }
    }

    render() {
        return (
            <div className="wrapper-apps">
                <div className="apps-title-block">
                    <h1>Приложения</h1>
                </div>
                <div className="apps-search-block">
                    <input className="input-default"/>
                </div>
                <div className="apps-nav-block">
                    <div className="tags-wrapper" id="tags-wrapper-default">
                        <div className="button-default-tag tags-item unselectable button-select" id="top"
                             action="main">
                            Мои приложения
                        </div>
                        <div className="button-default-tag tags-item unselectable" action="all">
                            Все
                        </div>
                    </div>
                </div>
                <div className="apps-content-block">

                </div>
            </div>
        );
    }
}

export default Apps;
