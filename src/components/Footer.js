import React, { Component } from "react";

class Footer extends Component{
    constructor(props) {
        super(props);
        this.state = {
            countUser: this.props.countUser_
        }
    }

    render(){
        return (
            <div className="footer">
                © {new Date().getFullYear()} DevCodeMyLife
            </div>
        );
    }
}

export default Footer;
