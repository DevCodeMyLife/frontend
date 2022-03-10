import React, {Component} from "react";

class UpBalance extends Component {
    constructor(props) {
        super(props);

        this.state = {
            count: 0,
            error: null
        }
    }

    componentDidMount() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);


        this.setState({
            count: urlParams.get('count'),
            error: urlParams.get('error')
        })
    }

    render() {
        return (
            <div className="content-wall-views">
                <div className="feed-wrapper">
                    <div className="loader-wrapper feed-wrapper" style={{fontSize: "22px"}}>
                        {
                            this.state.error !== null ?
                                <span>
                                    Вы успешно купили пакет на
                                    <span style={{color: "green"}}> {this.state.count} coins</span>
                                </span>
                            :
                                <span>
                                    Произошла ошибка, обратитесь в поддержку
                                </span>
                        }

                    </div>
                </div>
            </div>
        )
    }
}

export default UpBalance;
