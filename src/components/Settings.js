import React, { Component } from "react";
import Switch from "./Switch";

class Settings extends Component{
    constructor(props) {
        super(props);
        this.state = {}

    }

    render() {
        return (
            <div className="content-wall-views">
                <div className="feed-wrapper">
                    <div className="main-place-wrapper-settings">
                        <div className="block-settings child_settings">
                            <div className="key-settings">
                                Публиковать заметки приватно
                            </div>
                            <div className="value-settings">
                                <Switch enable={true} callBack={()=> {}}/>
                            </div>
                            {/*<div className="separator" />*/}
                        </div>
                        <div className="block-settings child_settings">
                            <div className="key-settings">
                                Экспортировать GitHub Gists
                            </div>
                            <div className="value-settings">
                                <Switch enable={false} callBack={()=> {}}/>
                            </div>
                            {/*<div className="separator" />*/}
                        </div>
                        <div className="block-settings child_settings">
                            <div className="key-settings">
                                Участвовать в тестировании
                            </div>
                            <div className="value-settings">
                                <Switch enable={false} callBack={()=> {}}/>
                            </div>
                            {/*<div className="separator" />*/}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default Settings;
