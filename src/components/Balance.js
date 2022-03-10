import React, {Component} from "react";

class Balance extends Component {
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
        const store = this.state.store.getState()
        return (
            <div className="content-wall-views">
                {
                    !store.auth.user.isAuth ?
                        <div className="loader-wrapper feed-wrapper">
                            <div className="loader">

                            </div>
                        </div>
                    :
                        <div className="wrapper-balance">
                            <div className="apps-title-block">
                                <h3>Приложения</h3>
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
                }
            </div>
        );
    }
}

export default Balance;
