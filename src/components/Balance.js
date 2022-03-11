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

    componentDidMount() {
    }

    render() {
        const state = this.state.store.getState()
        return (
            <>
                <div className="content-wall-views">
                    <div className="feed-wrapper">
                        {/*<div className="main-place-wrapper">*/}
                        {/*    <p>*/}
                        {/*        <b>Coin - </b> это внутренняя валюта, на нее можно приобрести мерч или потратить на*/}
                        {/*        что-то в приложениях а так же вывести на QIWI кошелек.*/}
                        {/*    </p>*/}
                        {/*</div>*/}
                        {
                            !state.auth.user.isAuth ?
                                <div className="loader-wrapper feed-wrapper">
                                    <div className="loader">

                                    </div>
                                </div>
                                :
                                <div className="wrapper-balance">
                                    <div className="balance-content-block feed-wrapper-item background-white">
                                        <div className="wrapper-balance-count auth-box-title">
                                            <span className="balance-count">Ваш баланс: {(parseInt(state.auth.user.data.balance)).toLocaleString('ru')} tokens.</span>
                                        </div>
                                        <div className="content-pack-coins">
                                            <CoinsCards price={1}/>
                                            <CoinsCards price={20}/>
                                            <CoinsCards price={200}/>
                                            <CoinsCards price={500}/>
                                        </div>
                                    </div>
                                </div>
                        }
                    </div>
                </div>
                <div className="tags-view" />
            </>
        )
    }
}

export default Balance;
