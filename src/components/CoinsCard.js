import React, {Component} from "react";

class CoinsCards extends Component {
    constructor(props) {
        super(props);

        this.state = {
            price: this.props.price
        }
    }

    render() {
        return (
            <div className="coins-item">
                <div className="coins-item-title">{this.state.price} coins</div>
                <div className="coins-item-descriptions item-about">
                    <p>
                        Пакет {this.state.price} coins
                    </p>
                </div>
                <ul className="coins-values">
                    <li className="coins-list-items"><span>1 шт</span><span>1 ₽</span></li>

                    <li className="coins-list-items"><span>Итог</span><span>1 ₽</span></li>
                </ul>
                <div className="button-default">Оплатить</div>
            </div>
        )
    }
}

export default CoinsCards;
