import React, {Component} from "react";
import TextareaAutosize from "react-textarea-autosize";
import photo_button from "../../icon/photo_button.png"
import photo_button_dark from "../../icon/photo_button_dark.png"
import video_button from "../../icon/video_button.png"
import video_button_dark from "../../icon/video_button_dark.png"
import menu_button from "../../icon/menu-button.png"
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import code from "../../icon/code.png";
import {toast} from "react-toastify";


class NewFeed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clickComponent: false,
            privatePost: false,
            valueTitle: null,
            valuePost: null,
            showPreview: false,
            coverUpload: null
        };

        this.components = {
            code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                    <SyntaxHighlighter wrapLongLines={false} language={match[1]} PreTag="div"
                                       children={String(children).replace(/\n$/, '')} {...props} />
                ) : (
                    <code className={className} {...props}>
                        {children}
                    </code>
                )
            }
        }
    }

    componentDidMount() {
    }

    onClickNewFeed = (event) => {
        this.setState({
            clickComponent: !this.state.clickComponent
        });
    };

    onClickPrivate = (event) => {
        this.setState({
            privatePost: !this.state.privatePost
        });
    }

    onChangeTitle = (event) => {
        event.preventDefault();
        this.setState({
            valueTitle: event.target.value
        });
    }

    onChangeValue = (event) => {
        event.preventDefault();
        this.setState({
            valuePost: event.target.value
        });
    }

    onClickPreview = (event) => {
        this.setState({
            showPreview: !this.state.showPreview
        });
    }


    //

    cancelCrop() {
        this.setState({
            crop: {
                unit: "px",
                x: 130,
                y: 50,
                width: 300,
                height: 300,
                aspect: 300 / 300
            },
            cropImage: null,
            showCrop: false,
            imageRef: null
        })
    }

    uploadCoverAction = (event) => {
        event.preventDefault();

        let reader = new FileReader();
        let file = event.target.files[0];

        reader.readAsDataURL(file)

        const id = toast.loading("Подождите, фотография обрабатывается")
        const data = new FormData();
        data.append('data', file)
        data.append('width', "1000")
        data.append('height', "420")

        this.cancelCrop()
        toast.update(id, {render: "Фотография отправлена на сервер", type: "default", isLoading: true});
        fetch("/api/upload_image", {
            method: "POST",
            body: data
        })
            .then(response => response.json())
            .then(res => {
                console.log(res)
                if (res.status.code === 0) {
                    this.setState({
                        coverUpload: res?.data[0].url_preview
                    })

                    toast.update(id, {
                        render: "Фотография успешно обновлена",
                        type: "success",
                        isLoading: false,
                        autoClose: 5000,
                        hideProgressBar: true
                    });


                } else {
                    toast.update(id, {
                        render: "Сервер не смог обработать фотографию",
                        type: "error",
                        isLoading: false,
                        autoClose: 5000,
                        hideProgressBar: true
                    });
                }


            })
            .catch(error => {
                this.setState({
                    loadImage: false
                })
                toast.update(id, {
                    render: error,
                    type: "error",
                    isLoading: false,
                    autoClose: 5000,
                    hideProgressBar: true
                });

            });
    }

    uploadClickCover() {
        let elem = document.getElementById("upload_file_input_cover")
        elem.click()
    }

    //
    render() {
        return (
            <>
                {this.state.clickComponent ? (
                    <div className="component-new-feed">
                        <input type="file" name="file" id="upload_file_input_cover"
                               onChange={(e) => this.uploadCoverAction(e)}
                               accept="image/jpeg" style={{display: "none"}}/>
                        <div className="component-new-feed__place-upload-cover-image">
                            {
                                this.state.coverUpload ? (
                                    <img src={this.state.coverUpload}
                                         onClick={() => this.uploadClickCover()}
                                         style={{cursor: "pointer", maxWidth: "634px"}}/>
                                ) : (
                                    <div className="component-new-feed__small-full-text"
                                         onClick={() => this.uploadClickCover()}>
                                        <span>Нажмите чтобы добавить обложку</span>
                                        <div className="component-new-feed__small-info-text">
                                            <span>Минимальный размер изображения 1000х420 пикселей</span>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                        <div className="component-new-feed__wrapper-article">
                            <div className="component-new-feed__wrapper-content">
                                {
                                    this.state.showPreview ? (
                                        <>
                                            <h1 className="title-feed">
                                                {
                                                    this.state.valueTitle
                                                }
                                            </h1>
                                            <div className="wrapper-data">
                                                <ReactMarkdown className="value-post" remarkPlugins={[gfm]}
                                                               components={this.components}>
                                                    {
                                                        this.state.valuePost
                                                    }
                                                </ReactMarkdown>
                                            </div>
                                        </>
                                    ) : (
                                        <>

                                            <input
                                                className="component-new-feed__input component-new-feed__header"
                                                placeholder="Заголовок"
                                                autoFocus={true}
                                                onChange={this.onChangeTitle}
                                                value={this.state.valueTitle}
                                            />
                                            <TextareaAutosize
                                                className="component-new-feed__input"
                                                placeholder="Текст"
                                                onChange={this.onChangeValue}
                                                value={this.state.valuePost}
                                            />
                                        </>
                                    )
                                }

                            </div>
                        </div>
                        <div className="component-new-feed__wrapper-article component-new-feed__flex-just-end">
                            <div className="component-new-feed__action-buttons">
                                <div className="button-default-icon" onClick={this.onClickPrivate}>
                                    {
                                        this.state.privatePost ? (
                                            <svg className="svg-close-view"
                                                 fill="#000000"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 viewBox="0 0 50 50" width="50px"
                                                 height="50px">
                                                <path fill="none"
                                                      className="svg-close"
                                                      stroke="#000000"
                                                      strokeLinecap="round"
                                                      strokeMiterlimit="10"
                                                      strokeWidth="2"
                                                      d="M9 49c-1.1 0-2-.9-2-2V23c0-1.1.9-2 2-2h32c1.1 0 2 .9 2 2v24c0 1.1-.9 2-2 2H9zM36 21c0 0 0-4.9 0-6 0-6.1-4.9-11-11-11-6.1 0-11 4.9-11 11 0 1.1 0 6 0 6"/>
                                                <path
                                                    d="M28,33c0-1.7-1.3-3-3-3c-1.7,0-3,1.3-3,3c0,0.9,0.4,1.7,1,2.2V38c0,1.1,0.9,2,2,2c1.1,0,2-0.9,2-2v-2.8C27.6,34.7,28,33.9,28,33z"/>
                                            </svg>
                                        ) : (
                                            <svg className="svg-close-view"
                                                 fill="#000000"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 viewBox="0 0 50 50" width="50px"
                                                 height="50px">
                                                <path fill="none"
                                                      className="svg-close"
                                                      stroke="#000000"
                                                      strokeLinecap="round"
                                                      strokeMiterlimit="10"
                                                      strokeWidth="2"
                                                      d="M9 49c-1.1 0-2-.9-2-2V23c0-1.1.9-2 2-2h32c1.1 0 2 .9 2 2v24c0 1.1-.9 2-2 2H9zM34.6 13.1c0 0-1.1-3.6-1.3-4.3-1.8-5.8-8-9.1-13.8-7.3-5.8 1.8-9.1 8-7.3 13.8C12.6 16.4 14 21 14 21"/>
                                                <path
                                                    d="M28,33c0-1.7-1.3-3-3-3c-1.7,0-3,1.3-3,3c0,0.9,0.4,1.7,1,2.2V38c0,1.1,0.9,2,2,2c1.1,0,2-0.9,2-2v-2.8C27.6,34.7,28,33.9,28,33z"/>
                                            </svg>
                                        )

                                    }

                                </div>
                                <div className="button-default component-new-feed__margin-left"
                                     onClick={this.onClickPreview}>Превью
                                </div>
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
