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
import chroma from 'chroma-js';
import Select  from 'react-select';



const colourStyles = {
    // control: (styles) => ({ ...styles, backgroundColor: 'white', border: '#fafafa 1px solid' }),
    indicatorsContainer: (styles) => ({
        ...styles,
        display: 'none'
    }),
    control: (styles) => ({
        ...styles,
        // none of react-select's styles are passed to <Control />
        backgroundColor: 'white',
        border: 'none',
        boxShadow: 'none',
        fontFamily: 'system-ui',
        ':hover': {
            ...styles[':active'],
            outline: 'none',
            border: 'none',
            cursor: 'text'
        },
        ':active': {
            ...styles[':active'],
            outline: 'none',
            border: 'none',
            cursor: 'text'
        },
    }),
    placeholder: (styles) => ({
        ...styles,
        color: '#a9a9a9'
    }),
    // option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    //     ...styles,
    //     // const color = chroma(data.color);
    //     // return {
    //     //     ...styles,
    //     //     backgroundColor: isDisabled
    //     //         ? undefined
    //     //         : isSelected
    //     //             ? data.color
    //     //             : isFocused
    //     //                 ? color.alpha(0.1).css()
    //     //                 : undefined,
    //     //     color: isDisabled
    //     //         ? '#ccc'
    //     //         : isSelected
    //     //             ? chroma.contrast(color, 'white') > 2
    //     //                 ? 'white'
    //     //                 : 'black'
    //     //             : data.color,
    //     //     cursor: isDisabled ? 'not-allowed' : 'default',
    //     //
    //     //     ':active': {
    //     //         ...styles[':active'],
    //     //         backgroundColor: !isDisabled
    //     //             ? isSelected
    //     //                 ? data.color
    //     //                 : color.alpha(0.3).css()
    //     //             : undefined,
    //     //     },
    //     // };
    // },
    multiValue: (styles, { data }) => {
        const color = chroma(data.color);
        return {
            ...styles,
            backgroundColor: color.alpha(0.1).css(),
        };
    },
    // multiValueLabel: (styles, { data }) => ({
    //     ...styles,
    //     color: '#A9A9A9D9',
    // }),
    multiValueRemove: (styles, { data }) => ({
        ...styles,
        color: data.color,
        ':hover': {
            backgroundColor: data.color,
            color: 'white',
        },
    }),
};

class NewFeed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clickComponent: false,
            privatePost: false,
            valueTitle: null,
            valuePost: null,
            showPreview: false,
            coverUpload: null,
            useTags: [],
            aquaticCreatures: [],

            store: this.props.store
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

        // this.state.store.subscribe(() => {
        //     this.setState(this.state.store.getState())
        // })
    }

    componentDidMount() {
        fetch("/api/tags", {
            method: "GET"
        })
            .then(response => response.json())
            .then(res => {

                let result = []

                for (let i = 0; i < res.data.length; i++) {
                    let row = {label: res.data[i].value, value: res.data[i].tid}

                    result.push(row)
                }

                this.setState({
                    aquaticCreatures: result
                });

            })
            .catch(error => {
                this.setState({
                    isLoaded: false,
                    error: true,
                    result: {},
                    notUser: true
                });
                console.log(error)
            });
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
                        render: "Фотография успешно загружена",
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

    feedNew() {
        let data = {
            title: this.state.valueTitle,
            value: this.state.valuePost,
            use_tags: this.state.useTags,
            cover_path: this.state.coverUpload,
            close: this.state.privatePost
        }


        if (data.value.length > 1) {

            this.setState({
                clicked_new_post: false,
                show_textarea: false,
                rewriteValue: null,
                showPreview: false
            })
            fetch("/api/feed", {
                method: "POST",
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(res => {
                    if (res.status.code === 0) {
                        fetch("/api/authentication", {
                            method: "POST",
                            body: JSON.stringify({
                                "finger": window.localStorage.getItem("finger")
                            })
                        })
                            .then(response => response.json())
                            .then(res => {
                                this.state.store.dispatch({
                                    type: "ACTION_CHECK_AUTH", value: {
                                        user: {
                                            isAuth: true,
                                            data: res?.data[0],
                                            feeds: res?.feed,
                                            notificationCount: res?.notification_count,
                                            messagesCount: res?.count_message,
                                            notifications: res?.notification,
                                            token: res?.token
                                        },
                                    }
                                })
                                this.cancel()
                                //
                                //
                                // } else {
                                //     this.sendLogs(res.status.message)
                                //     this.delete_cookie("access_token")
                                // }

                                // const state = this.state.store.getState()
                                // const urlParams = state.history.path
                                // const id = urlParams.get('id');

                                // let path = `/api/user/${state.history.id}`
                                //
                                // fetch(path, {
                                //     method: "GET"
                                // })
                                //     .then(response => response.json())
                                //     .then(res => {
                                //         if (res.status.code === 0 && res.data.length > 0) {
                                //             this.setState({
                                //                 isLoaded: true,
                                //                 id: state.history.id,
                                //                 result: res.data,
                                //                 mainFeed: res.feed,
                                //                 notUser: false
                                //             });
                                //         } else {
                                //             this.setState({
                                //                 isLoaded: false,
                                //                 result: {},
                                //                 notUser: true,
                                //                 error: true
                                //             });
                                //         }
                                //     })
                                //     .catch(error => {
                                //         this.setState({
                                //             isLoaded: false,
                                //             error: true,
                                //             result: {},
                                //             notUser: true
                                //         });
                                //         console.log(error)
                                //     });

                            })
                            .catch(error => {
                                this.setState({
                                    auth: false,
                                    load: true,
                                });
                            });
                    }

                })
                .catch(error => {
                    console.log(error)
                });
        }
    }

    cancel() {

        this.state.store.dispatch({
            type: "ACTION_UPDATE_FEED_REWRITE", value: {
                rewriteUUID: null,
                rewriteValue: null,
                rewriteTitle: null,
                rewriteMode: false,
                privatePost: false,
                showPreview: false,
                coverUpload: null,
                useTags: []
            }
        })

        this.setState({
            clickComponent: false,
            privatePost: false,
            valueTitle: null,
            valuePost: null,
            showPreview: false,
            coverUpload: null,
            useTags: []
        })
    }

    updateUseTags = (newValue, actionMeta) => {
        console.log(newValue, actionMeta)
        this.setState({useTags: newValue})
    }

    isValidNewOption = (inputValue, selectValue) => {
        return !(inputValue.length > 0 && selectValue.length < 6);
    }

    rewriteFeed(uuid, value, title, close, cover, tag) {

        this.cancel()

        let result = []

        if (tag !== null) {
            for (let i = 0; i < tag.length; i++) {
                let row = {label: tag[i].value, value: tag[i].tid}

                result.push(row)
            }
        }

        this.state.store.dispatch({
            type: "ACTION_CHECK_AUTH", value: {
                user: {
                    isAuth: true,
                    data: res?.data[0],
                    feeds: res?.feed,
                    notificationCount: res?.notification_count,
                    messagesCount: res?.count_message,
                    notifications: res?.notification,
                    token: res?.token
                },
            }
        })

        this.setState({
            rewriteUUID: uuid,
            rewriteValue: value,
            rewriteTitle: title,
            rewriteMode: true,
            clicked_new_post: true,
            show_textarea: true,
            close: close,
            showPreview: true,
            coverUpload: cover,
            useTags: result
        })
    }

    //
    render() {
        // const store = this.state.store.getState()
        return (
            <>
                {this.state.clickComponent ? (
                    <div className="component-new-feed">
                        <input type="file" name="file" id="upload_file_input_cover"
                               onChange={(e) => this.uploadCoverAction(e)}
                               accept="image/jpeg" style={{display: "none"}}/>
                        <div className="component-new-feed__place-upload-cover-image"
                             onClick={() => this.uploadClickCover()}>
                            {
                                this.state.coverUpload ? (
                                    <img src={this.state.coverUpload}
                                         style={{cursor: "pointer", maxWidth: "735px", borderRadius: "5px 5px 0 0"}}/>
                                ) : (
                                    <div className="component-new-feed__small-full-text">
                                        <span>Нажмите cюда чтобы добавить обложку</span>
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
                                            <div className="title-view" style={{paddingBottom: "10px", borderBottom: "1px solid #dcdcdc"}}>
                                                <Select
                                                    options={this.state.aquaticCreatures}
                                                    isMulti
                                                    maxMenuHeight={300}
                                                    defaultValue={this.state.useTags}
                                                    onChange={this.updateUseTags}
                                                    placeholder="Добавить теги"
                                                    isValidNewOption={this.isValidNewOption}
                                                    styles={colourStyles}
                                                />
                                            </div>

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
                                     onClick={() => this.cancel()}>Отмена
                                </div>
                                {/*{*/}
                                {/*    store.feed_rewrite.rewriteMode ?*/}

                                {/*}*/}
                                <div className="button-default component-new-feed__margin-left"
                                     onClick={this.onClickPreview}>Превью
                                </div>
                                <div className="button-default component-new-feed__margin-left"
                                     onClick={() => this.feedNew()}>Опубликовать
                                </div>
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
