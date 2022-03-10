import React, {Component} from "react";

class CoinsCards extends Component {
    constructor(props) {
        super(props);

        this.state = {
            price: this.props.price
        }
    }

    buy(price){
        console.log(price)

        let data = {
            price: price
        }

        fetch("api/balance", {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                console.log(res)
            })
            .catch(error => {
                console.log(error)
            });
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

                <div onClick={()=>{this.buy(this.state.price)}} className="button-default">Купить за {this.state.price}₽</div>
            </div>
        )
    }
}

export default CoinsCards;
