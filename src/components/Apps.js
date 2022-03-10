import React, {Component} from "react";

class Apps extends Component{
    constructor(props) {
        super(props);
        this.state = {
            name: "React"
        };

        this.state = {
            store: this.props.store
        }
    }

    render() {
        return (
            <div/>
        );
    }
}

export default Apps;
