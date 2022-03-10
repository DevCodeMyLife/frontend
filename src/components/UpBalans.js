import React, {Component} from "react";

class UpBalance extends Component {
    constructor(props) {
        super(props);

        this.state = {
            count: 0
        }
    }

    componentDidMount() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        this.setState({
            count: urlParams.get('count')
        })
    }

    render() {
        return (
            <div className="content-wall-views">
                <div className="feed-wrapper">
                    <div className="loader-wrapper feed-wrapper">
                        <span>Вы успешно купили пакет coins на </span>
                        <span style={{color: "green"}}>{this.state.count}</span>
                    </div>
                </div>
            </div>
        )
    }
}

export default UpBalance;
