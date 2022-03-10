import {Component} from "react";
import TextareaAutosize from "react-textarea-autosize";
import photo_button from "../../icon/photo_button.png"
import photo_button_dark from "../../icon/photo_button_dark.png"
import video_button from "../../icon/video_button.png"
import video_button_dark from "../../icon/video_button_dark.png"


class NewFeed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clickComponent: false
        };
    }

    componentDidMount() {
    }

    onClickNewFeed = (event) => {
        this.setState({
            clickComponent: !this.state.clickComponent
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
                    </div>
                ) : (
                    <div className="component-new-feed">
                        <div className="component-new-feed__wrapper-input">
                            <div className="component-new-feed__wrapper-article">
                                <div
                                    onClick={this.onClickNewFeed}
                                    className="component-new-feed__input"
                                >
                                    Что у Вас нового?
                                </div>
                                <div className="component-new-feed__control-panel">
                                    <div className="component-new-feed__button">
                                        <img className="component-new-feed__button-image" src={photo_button}
                                             alt="photo"/>
                                    </div>
                                    <div className="component-new-feed__button">
                                        <img className="component-new-feed__button-image" src={video_button}
                                             alt="video"/>
                                    </div>
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
