import React, {Component} from "react";
import TextareaAutosize from "react-textarea-autosize";
import photo_button from "../../icon/photo_button.png"
import photo_button_dark from "../../icon/photo_button_dark.png"
import video_button from "../../icon/video_button.png"
import video_button_dark from "../../icon/video_button_dark.png"
import menu_button from "../../icon/menu-button.png"


class NewFeed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clickComponent: false,
            clickDot: false
        };
    }

    componentDidMount() {
    }

    onClickNewFeed = (event) => {
        this.setState({
            clickComponent: !this.state.clickComponent
        });
    };

    onClickMenu = (event) => {
        this.setState({
            clickDot: !this.state.clickDot
        });
    };

    render() {
        return (
            <>
                {this.state.clickComponent ? (
                    <div className="component-new-feed">
                        <div className="component-new-feed__place-upload-cover-image">
                            <div className="component-new-feed__small-full-text">
                                <span>Нажмите чтобы добавить обложку</span>
                                <div className="component-new-feed__small-info-text">
                                    <span>Минимальный размер изображения 1000х420 пикселей</span>
                                </div>
                            </div>
                        </div>
                        <div className="component-new-feed__wrapper-article">
                            <div className="component-new-feed__wrapper-content">
                                <input
                                    className="component-new-feed__input component-new-feed__header"
                                    placeholder="Заголовок"
                                    autoFocus={true}
                                />
                                <TextareaAutosize
                                    className="component-new-feed__input"
                                    placeholder="Текст"
                                />
                            </div>
                        </div>
                        <div className="component-new-feed__wrapper-article component-new-feed__flex-just-end">
                            <div className="component-new-feed__action-buttons">
                                <div className="button-default component-new-feed__margin-left">Превью</div>
                                <div className="button-default component-new-feed__margin-left">Опубликовать</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="component-new-feed">
                        <div className="component-new-feed__wrapper-input">
                            <div className="component-new-feed__wrapper-article">
                                <div className="component-new-feed__wrapper-image">
                                    <img
                                        className="component-new-feed__wrapper-image-img"
                                        src="https://devcodemylife.tech/api/storage?file_key=6183477ffa1496e2b6c7923a7d2debefc35deb125844087eda043546c2278f0e"
                                    />
                                </div>
                                <div
                                    onClick={this.onClickNewFeed}
                                    className="component-new-feed__input component-new-feed__flex-just-item"
                                >
                                    Что у Вас нового?
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }
}

export default NewFeed;
