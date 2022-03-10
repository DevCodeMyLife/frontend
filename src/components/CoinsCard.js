import React, {Component} from "react";

class Balance extends Component {
    constructor(props) {
        super(props);

        // this.state = {
        //     store: this.props.store
        // }
    }

    render() {
        return (
            <div className="coins-item">
                <div className="coins-item-title">20 coins</div>
                <div className="coins-item-descriptions">
                    <p>
                        Пакет 20 coins
                    </p>
                </div>
                <ul className="coins-values">
                    <li className="coins-list-items"><span>1 шт</span><span>1 ₽</span></li>

                    <li className="coins-list-items"><span>Итог</span><span>1 ₽</span></li>
                </ul>
            </div>
        )
    }
}

export default Balance;
