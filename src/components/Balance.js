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
                            <div className="balance-content-block">
                                <div className="balance-count">
                                    <span>Ваш баланс: {(parseInt(state.auth.user.data.balance)).toLocaleString('ru')}</span>
                                </div>
                            </div>
                        </div>
                }
            </div>
        );
    }
}

export default Balance;
