import React, { Component }  from "react";

class Call extends Component {
    constructor(props) {
        super(props);
        this.state = {
            store: this.props.store
        };
    }

    // componentDidMount() {
    //     const state = this.state.store.getState();
    //     if (state.auth.isAuth){
    //         state.centrifuge.object.subscribe("$calls" , (event) => {
    //
    //         })
    //     }
    // }

    render() {
        return (
            <div>

            </div>

        )
    }
}

export default Call;
