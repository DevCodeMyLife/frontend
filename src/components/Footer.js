import React, {Component} from "react";

class Footer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countUser: this.props.countUser_
        }
    }

    render() {
        return (
            <div className="footer">
                <div className="frame_footer">
                    <div>
                        © {new Date().getFullYear()} DevCodeMyLife
                    </div>
                    <div className="nav-sub">
                        <div className="like-item_footer"
                             onClick={() => window.open("https://t.me/devcodemylife", "_blank")}>Наш телеграмм канал
                        </div>
                    </div>
                    <div className="nav-sub">
                        {/*    https://www.markdownguide.org/cheat-sheet/*/}
                        <div className="like-item_footer"
                             onClick={() => window.open("https://www.markdownguide.org/cheat-sheet/", "_blank")}>Markdown
                            Guide
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

export default Footer;
