import React, {Component} from "react";
import CoinsCards from "./CoinsCard";

class Balance extends Component {
    constructor(props) {
        super(props);
        this.state = {
            store: this.props.store
        }

        this.state.store.subscribe(() => {
            this.setState(this.state.store.getState())
        })
    }

    componentDidMount() {}

    render() {
        const state = this.state.store.getState()
        return (
            <>
                <div className="content-wall-views">
                    <div className="feed-wrapper">
                        {
                            !state.auth.user.isAuth ?
                                <div className="loader-wrapper feed-wrapper">
                                    <div className="loader">

                                    </div>
                                </div>
                                :
                                <div className="wrapper-balance">
                                    <div className="balance-content-block feed-wrapper-item background-white">
                                        <div className="wrapper-balance-count">
                                            <span className="balance-count">Ваш баланс: {(parseInt(state.auth.user.data.balance)).toLocaleString('ru')} монет</span>
                                        </div>
                                        <div className="auth-box-title">Пакеты монет</div>
                                        <div className="content-pack-coins">
                                            <CoinsCards/>
                                        </div>
                                    </div>
                                </div>
                        }
                    </div>
                </div>
                <div className="tags-view" >
                    <div className="tags-box"/>
                </div>
            </>
        )
    }
}

export default Balance;
