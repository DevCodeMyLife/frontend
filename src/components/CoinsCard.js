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
            count: price
        }

        fetch("api/balance", {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0) {
                    document.location.replace(res?.data?.url_redirect)
                }
            })
            .catch(error => {
                console.log(error)
            });
    }

    render() {
        return (
            <div className="coins-item">
                <div className="coins-item-title">{this.state.price} tokens</div>
                <div className="coins-item-descriptions item-about">
                    <p>
                        Пакет {this.state.price} tokens
                    </p>
                </div>
                <div onClick={()=>{this.buy(this.state.price)}} className="button-general-page" style={{boxSizing: "border-box"}}>Купить за {this.state.price}₽</div>
            </div>
        )
    }
}

export default CoinsCards;
