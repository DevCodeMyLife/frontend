import React, { Component } from "react";


class Switch extends Component{
    constructor(props) {
        super(props);

        this.state = {
            callBack: this.props.callBack,
            enable: this.props.enable
        };
    }

    switcher() {
        this.state.enable.toggle()
        this.state?.callBack(this.state.enable)
    }

    render() {
        return (
            <div className="button-switch" style={this.state.enable ? {background: '#38FC93', flexDirection: 'row-reverse'} : {background: '#ff8585', flexDirection: 'row'}}>
                <div className="bobble" onClick={() => this.switcher()}  />
            </div>
        )
    }
}

export default Switch;
