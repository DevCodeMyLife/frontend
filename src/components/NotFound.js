import React, {Component} from "react";

class NotFound extends Component {
    render() {
        return (
            <div className="content-wall-views">
                <div className="error-wrapper">
                    <div className="error-page">
                        Такой страницы не существует.
                    </div>
                </div>
            </div>
        )
    }
}

export default NotFound;
