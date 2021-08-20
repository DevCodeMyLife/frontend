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
                <div className="frame_footer">
                    <div>
                        © {new Date().getFullYear()} DevCodeMyLife
                    </div>
                    <div>
                        © {new Date().getFullYear()} DevCodeMyLife
                    </div>
                </div>
            </div>
        );
    }
}

export default Footer;
