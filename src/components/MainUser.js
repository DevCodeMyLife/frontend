import React, {Component} from "react";
import ReactMarkdown from 'react-markdown'
import ReactCrop from "react-image-crop";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import Select from 'react-select';
// import {tomorrow} from "react-syntax-highlighter/dist/esm/styles/prism"
import {Link} from "react-navi";
// import { route } from 'navi';
import TextareaAutosize from 'react-textarea-autosize';
import like from "../icon/like.png";
import look from "../icon/look.png";
import like_dark from "../icon/like_dark.png";
import look_dark from "../icon/look_dark.png";
import code from "../icon/code.png";
import {Helmet} from "react-helmet";
import "react-image-crop/dist/ReactCrop.css";
import {toast} from 'react-toastify';
import error from "./Error";
import {number} from "prop-types";

const gfm = require('remark-gfm')


class MainUsers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "React"
        };

        this.state = {
            error: false,
            isLoaded: false,
            mainFeed: [],
            showPreview: false,
            textNews: "...",
            heading: "...",
            prevState: null,
            clicked_new_post: false,
            show_textarea: false,
            id: 0,
            data: [],
            notUser: false,
            close: false,
            load: false,
            rewriteMode: false,
            rewriteValue: null,
            rewriteTitle: null,
            currentDateTime: new Date().getTime(),
            isDark: "light",
            file: null,
            imagePreviewUrl: null,
            store: this.props.store,
            crop: {
                unit: "px",
                x: 0,
                y: 0,
                width: 300,
                height: 300,
                aspect: 300 / 300
            },
            cropCover: {
                unit: "px",
                x: 0,
                y: 0,
                width: 735,
                height: 200,
                aspect: 735 / 200
            },
            cropImage: null,
            showCrop: false,
            imageRef: null,
            idPage: this.props.id,
            loadImage: false,
            clickCreateDialog: false,
            isCall: false,
            coverUpload: null,
            src_cover: null,
            imageCropCover: false,
            aquaticCreatures: [],
            useTags: []
        }


        this.state.store.subscribe(() => {
            this.setState(this.state.store.getState())
            this.updateStateUser()
        })
    }

    updateStateUser() {
        const state = this.state.store.getState()

        fetch(`/api/user/${state.history.id}`, {
            method: "GET"
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0 && res.data.length > 0) {
                    this.setState({
                        isLoaded: true,
                        id: state.history.id,
                        result: res.data,
                        mainFeed: res.feed,
                        notUser: false
                    });
                } else {
                    this.setState({
                        isLoaded: false,
                        result: {},
                        notUser: true,
                        error: true
                    });
                }
            })
            .catch(error => {
                this.setState({
                    isLoaded: false,
                    error: true,
                    result: {},
                    notUser: true
                })
            });
    }

    getPreferredColorScheme = () => {
        if (window?.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setState({
                isDark: "dark"
            })
        } else {
            this.setState({
                isDark: "light"
            })
        }
    }

    deleteFeed(uuid) {
        fetch(`/api/feed/${uuid}`, {
            method: "DELETE",
            body: JSON.stringify({})
        })
            .then(response => response.json())
            .then(_ => {
                // const state = this.state.store.getState()
                // const urlParams = state.history.path
                // const id = urlParams.get('id');
                const state = this.state.store.getState()
                let path = `/api/user/${state.history.id}`


                fetch(path, {
                    method: "GET"
                })
                    .then(response => response.json())
                    .then(res => {
                        if (res.status.code === 0 && res.data.length > 0) {
                            this.cancel()
                            this.setState({
                                isLoaded: true,
                                id: state.history.id,
                                result: res.data,
                                mainFeed: res.feed,
                                notUser: false
                            });
                        } else {
                            this.setState({
                                isLoaded: false,
                                result: {},
                                notUser: true,
                                error: true
                            });
                        }
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

            })
            .catch(error => {
                this.setState({
                    auth: false,
                    load: true,
                });
            });
    }

    like(uuid) {
        let data = {
            feeds_uuid: uuid
        }
        fetch("/api/like", {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0) {
                    console.log(res)

                    document.getElementById(uuid).innerHTML = res.data.count
                }
                // this.setState({
                //     isLoaded: "access",
                //     result: res.data
                // });
                // if (!result.ok) {
                //     throw new Error("Network response was not ok");
                // }
                // return result.blob();
            })
            .catch(error => {
                console.log(error)
            });
    }

    previewClick() {
        // const preview = document.getElementsByClassName(className)[0]
        // console.log(preview)
        // preview.classList.toggle("preview_swap")
        this.setState({
            showPreview: !this.state.showPreview
        })
    }

    rewriteFeed(uuid, value, title, close, cover, tag) {

        this.cancel()

        let result = []

        if (tag != null ) {
            for (let i = 0; i < tag.length; i++) {
                let row = {label: tag[i].value, value: tag[i].tid}

                result.push(row)
            }
        }

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

    componentDidMount() {
        this.getPreferredColorScheme()

        window.matchMedia('(prefers-color-scheme: dark)').onchange = (event) => {
            this.getPreferredColorScheme()
        };

        const state = this.state.store.getState()
        let path = `/api/user/${state.history.id}`

        fetch(path, {
            method: "GET"
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0 && res.data.length > 0) {
                    this.setState({
                        isLoaded: true,
                        id: state.history.id,
                        result: res.data,
                        mainFeed: res.feed,
                        notUser: false
                    });

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
                } else {
                    this.setState({
                        isLoaded: false,
                        result: {},
                        notUser: true,
                        error: true
                    });
                }
            })
            .catch(error => {
                this.setState({
                    isLoaded: false,
                    error: true,
                    result: {},
                    notUser: true
                })
            });

    }

    components = {
        code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
                <SyntaxHighlighter  wrapLongLines={false} language={match[1]} PreTag="div"
                                   children={String(children).replace(/\n$/, '')} {...props} />
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            )
        }
    }

    cancel() {
        this.setState({
            clicked_new_post: false,
            show_textarea: false,
            rewriteValue: null,
            showPreview: false,
            rewriteMode: false,
            textNews: "...",
            coverUpload: null,
            useTags: []
        })
    }

    saveFeed() {
        let data = {
            title: document.getElementById("text_title").value,
            value: document.getElementById("text_news").value,
            use_tags: this.state.useTags,
            cover_path: this.state.coverUpload,
            close: this.state.close
        }

        this.setState({
            clicked_new_post: false,
            show_textarea: false,
            rewriteValue: null,
            showPreview: false,
            rewriteMode: false,
            textNews: "..."
        })

        fetch(`/api/feed/${this.state.rewriteUUID}`, {
            method: "PUT",
            body: JSON.stringify({
                value: data.value,
                close: data.close,
                title: data.title,
                cover_path: data.cover_path
            })
        })
            .then(response => response.json())
            .then(_ => {


                const state = this.state.store.getState()
                // const urlParams = state.history.path
                // const id = urlParams.get('id');

                let path = `/api/user/${state.history.id}`

                fetch(path, {
                    method: "GET"
                })
                    .then(response => response.json())
                    .then(res => {
                        if (res.status.code === 0 && res.data.length > 0) {
                            this.setState({
                                isLoaded: true,
                                id: state.history.id,
                                result: res.data,
                                mainFeed: res.feed,
                                notUser: false
                            });
                        } else {
                            this.setState({
                                isLoaded: false,
                                result: {},
                                notUser: true,
                                error: true
                            });
                        }
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

            })
            .catch(error => {
                console.log(error)
            });
    }

    feedNew() {
        let data = {
            title: document.getElementById("text_title").value,
            value: document.getElementById("text_news").value,
            use_tags: this.state.useTags,
            cover_path: this.state.coverUpload,
            close: this.state.close
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
                                if (res.status.code === 0) {
                                    this.setState({
                                        auth: true,
                                        data: res.data,
                                        feed: res.feed,
                                        load: true,

                                        token: res.token,
                                    });


                                } else {
                                    this.sendLogs(res.status.message)
                                    this.delete_cookie("access_token")
                                }

                                const state = this.state.store.getState()
                                // const urlParams = state.history.path
                                // const id = urlParams.get('id');

                                let path = `/api/user/${state.history.id}`

                                fetch(path, {
                                    method: "GET"
                                })
                                    .then(response => response.json())
                                    .then(res => {
                                        if (res.status.code === 0 && res.data.length > 0) {
                                            this.setState({
                                                isLoaded: true,
                                                id: state.history.id,
                                                result: res.data,
                                                mainFeed: res.feed,
                                                notUser: false
                                            });
                                        } else {
                                            this.setState({
                                                isLoaded: false,
                                                result: {},
                                                notUser: true,
                                                error: true
                                            });
                                        }
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

    unixToDateTime(unixTimestamp) {
        const milliseconds = unixTimestamp * 1000
        const dateObject = new Date(milliseconds)

        return dateObject.toLocaleString()
    }

    handleChangeTextarea = (event) => {
        if (event.target.value === "") {
            this.setState({textNews: "..."})
        } else {
            this.setState({textNews: event.target.value})
        }
    }

    handleChangeTitle = (event) => {

        this.setState({rewriteTitle: event.target.value})

    }

    updateUseTags = (newValue, actionMeta) => {
        console.log(newValue, actionMeta)
        this.setState({ useTags: newValue})
    }

    handleChangeInput = (event) => {
        if (event.target.value === "") {
            this.setState({heading: "Текст заголовка"})
        } else {
            this.setState({heading: event.target.value})
        }

    }

    newInputText = (event) => {
        this.setState({clicked_new_post: true, show_textarea: true, showPreview: true})


        // event.target
        // a.innerHTML = `
        //   <textarea onChange={this.handleChangeTextarea} placeholder="Что у Вас нового?" id="text_news">
        //
        //   </textarea>
        // `
    }

    getLastVisit = (d) => {
        return Math.floor(d / 60)
    }

    createChat = event => {
        this.setState({
            clickCreateDialog: true
        })

        let data = {
            to_uid: Number(this.state.id)
        }

        fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                console.log(res)
                if (res.status.code === 0) {
                    window.location.href = `/messages?cid=${res.data}`
                }else{
                    toast.error(res.status?.message + " - Попробуйте позже", {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined
                    });
                }

            })
            .catch(error => {
                toast.error(error + " - Попробуйте позже", {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined
                });
            });

    }

    onKeyDown = event => {
        // 'event.key' will return the key as a string: 'Tab'
        // 'event.keyCode' will return the key code as a number: Tab = '9'
        // You can use either of them
        if (event.keyCode === 9) {
            // Prevent the default action to not lose focus when tab
            event.preventDefault();

            // Get the cursor position
            const {selectionStart, selectionEnd} = event.target;
            // update the state
            this.setState(
                prevState => ({
                    lyrics:
                        prevState.lyrics.substring(0, selectionStart) +
                        "\t" + // '\t' = tab, size can be change by CSS
                        prevState.lyrics.substring(selectionEnd)
                }),
                // update the cursor position after the state is updated
                () => {
                    this.textAreaRef.current.selectionStart = this.textAreaRef.current.selectionEnd =
                        selectionStart + 1;
                }
            );
        }
    };

    uploading = (event) => {
        this.setState({
            file: event.target.files[0]
        })
    };

    uploadClick() {
        let elem = document.getElementById("upload_file_input")
        elem.click()
    }

    uploadClickCover() {
        let elem = document.getElementById("upload_file_input_cover")
        elem.click()
    }

    uploadPhotoAction = (event) => {
        event.preventDefault();

        let reader = new FileReader();
        let file = event.target.files[0];
        reader.onloadend = () => {
            this.setState({
                file: file,
                src: reader.result,
                showCrop: true
            });
        }
        reader.readAsDataURL(file)

        console.log(file)
    }

    uploadCoverAction = (event) => {
        event.preventDefault();

        let reader = new FileReader();
        let file = event.target.files[0];
        reader.onloadend = () => {
            // this.setState({
            //     file: file,
            //     src_cover: reader.result,
            //     imageRef: file,
            //     imageCropCover: true
            // });
        }
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

    makeUpload() {

        // this.setState({
        //     loadImage: true
        // })

        const id = toast.loading("Подождите, фотография обрабатывается")
        const data = new FormData();

        // console.log(this.state.imageRef)

        const scaleX = Math.floor(this.state.imageRef.naturalWidth / Number(this.state.imageRef.width));
        const scaleY = Math.floor(this.state.imageRef.naturalHeight / Number(this.state.imageRef.height));

        console.log(this.state.imageRef.naturalWidth, this.state.imageRef.naturalHeight, this.state.crop.x * scaleX, this.state.crop.y * scaleY)

        const x0 = this.state.crop.x * scaleX
        const y0 = this.state.crop.y * scaleY
        const x1 = this.state.crop.width * scaleX
        const y1 = this.state.crop.height * scaleY

        console.log(x0, y0, x1, y1)

        data.append('data', this.state.file);
        data.append('x', x0.toString())
        data.append('y', y0.toString())
        data.append('x_', x1)
        data.append('y_', y1)


        this.cancelCrop()
        toast.update(id, {render: "Фотография отправлена на сервер", type: "default", isLoading: true});
        fetch("/api/upload_main_photo", {
            method: "POST",
            body: data
        })
            .then(response => response.json())
            .then(res => {
                console.log(res)
                if (res.status.code === 0) {
                    this.setState({
                        imagePreviewUrl: res?.data[0].url_preview
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

    onCropChange = (crop, percentCrop) => {
        // You could also use percentCrop:
        // this.setState({ crop: percentCrop });
        this.setState({crop});
    };

    onCropComplete = (crop) => {
        this.setState({
            cropImage: crop
        })
        console.log(crop)
    }

    onImageLoaded = (image) => {
        this.setState({imageRef: image})
    };

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

    handleChange = (...args) => {
        // searchInput.current.querySelector("input").value = "";
        console.log("ARGS:", args);

        console.log("CHANGE:");
    };

    render() {
        let {isLoaded, textNews, mainFeed, clicked_new_post} = this.state;


        const store = this.state.store.getState()
        if (!store.components.settings.main_page) {
            return (
                <div className="content-wall-views">
                    <div className="feed-wrapper">
                        <div className="main-place-wrapper">
                            <p>
                                В разделе Профилей ведутся технические работы.
                            </p>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div style={{display: "flex"}}>
                    <div className="content-wall-views">
                        {
                            this.state.showCrop ?
                                <div className="pop-up">
                                    <div className="center-view">
                                        {
                                            this.state.loadImage ?
                                                <div className="loader"/>
                                                :
                                                <div>
                                                    <ReactCrop
                                                        circularCrop={true}
                                                        keepSelection={true}
                                                        minWidth={300}
                                                        minHeight={300}
                                                        src={this.state.src}
                                                        crop={this.state.crop}
                                                        ruleOfThirds
                                                        onImageLoaded={this.onImageLoaded}
                                                        onComplete={this.onCropComplete}
                                                        onChange={this.onCropChange}
                                                    />
                                                    <div className="wrapper-bottom" style={{
                                                        width: "100%",
                                                        boxSizing: "border-box",
                                                        padding: "20px 0"
                                                    }}>
                                                        <div className="wrapper-flex-start">
                                                            <div className="button-default"
                                                                 onClick={() => this.cancelCrop()}>Отмена
                                                            </div>
                                                        </div>
                                                        <div className="wrapper-flex-end">
                                                            <div className="button-default"
                                                                 onClick={() => this.makeUpload()}>Сохранить
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                        }
                                    </div>
                                </div>
                            :
                                null
                        }

                        {
                            isLoaded ?
                                this.state.result[0].is_block ?
                                    <div>
                                        <div className="error-wrapper">
                                            <div className="error-page">
                                                Страница была заблокирована администрацией сайта.
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div className="feed-wrapper">
                                        {
                                            Number(this.state.id) === store.auth.user.data.id ?
                                                <div className="feed-wrapper-item background-white">
                                                    <div className="feed-item-value">

                                                        <div key={store.auth.user.data.avatar_url}
                                                             className="wrapper-data">
                                                            <div key="aksdlkasd" className="photo-wrapper">
                                                                <img key="asdmmmmasd"
                                                                     src={store.auth.user.data?.avatar_url}
                                                                     alt={store.auth.user.data?.login}
                                                                     onClick={(e) => {
                                                                         e.preventDefault();
                                                                         window.location.href = `/user/${store.auth.user.data.id}`
                                                                     }}
                                                                />
                                                            </div>

                                                            <div className="value-post placeholder-main-feed"
                                                                 id="main_input" onClick={
                                                                !clicked_new_post ? this.newInputText : null
                                                            }>

                                                                {
                                                                    this.state.clicked_new_post ?
                                                                        <div className="textarea-hide">
                                                                            <div style={{marginBottom: "20px"}}>
                                                                            <input type="file" name="file" id="upload_file_input_cover"
                                                                                   onChange={(e) => this.uploadCoverAction(e)}
                                                                                   accept="image/x-png,image/jpeg" style={{display: "none"}}/>
                                                                            {
                                                                                this.state.coverUpload ?
                                                                                    <img src={this.state.coverUpload}
                                                                                         alt={store.auth.user.data.login}
                                                                                         onClick={() => this.uploadClickCover()}
                                                                                         style={{cursor: "pointer", maxWidth: "634px"}}/>
                                                                                :
                                                                                        <>
                                                                                            <div className="palace-upload-photo-liable" onClick={() => this.uploadClickCover()}>
                                                                                                Нажмите что бы добавить обложку
                                                                                            </div>
                                                                                        </>

                                                                            }
                                                                            </div>
                                                                            <div className="title-view">
                                                                                <Select
                                                                                    options={this.state.aquaticCreatures}
                                                                                    isMulti
                                                                                    maxMenuHeight={300}
                                                                                    defaultValue={this.state.useTags}
                                                                                    onChange={this.updateUseTags}
                                                                                    placeholder="Подберите тег..."
                                                                                    OnPop-value
                                                                                />
                                                                            </div>
                                                                            <div className="title-view">
                                                                                <input className="feed-textarea"
                                                                                       autoFocus={true} type="text"
                                                                                       id="text_title"
                                                                                       onChange={this.handleChangeTitle}
                                                                                       placeholder="Заголовок"
                                                                                       style={{margin: "0 0 10px 0"}}
                                                                                       value={this.state.rewriteTitle}/>
                                                                            </div>
                                                                            <TextareaAutosize className="feed-textarea"
                                                                                              onChange={this.handleChangeTextarea}
                                                                                              placeholder="Что у Вас нового?"
                                                                                              id="text_news">
                                                                                {this.state.rewriteMode ? this.state.rewriteValue : ""}
                                                                            </TextareaAutosize>
                                                                        </div>

                                                                        :
                                                                        <div className="fake-textarea">Что у Вас нового?</div>
                                                                }
                                                            </div>
                                                        </div>

                                                        {
                                                            this.state.clicked_new_post ?
                                                                <div
                                                                    className="wrapper-flex-end create-feed-wrapper-button">
                                                                    <div className="button-default-icon"
                                                                         onClick={() => {
                                                                             this.setState(prevState => ({
                                                                                 close: !prevState.close
                                                                             }));
                                                                         }}>

                                                                        {
                                                                            store.auth.user.data.privat_post || this.state.close ?
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
                                                                                :
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
                                                                        }

                                                                    </div>
                                                                    {/*<div className="button-default" onClick={() => this.previewClick()}>Показать что получилось</div>*/}
                                                                    <div className="button-default"
                                                                         onClick={() => this.cancel()}>Отмена
                                                                    </div>
                                                                    {
                                                                        this.state.rewriteMode ?
                                                                            <div className="button-default"
                                                                                 onClick={() => {
                                                                                     this.deleteFeed(this.state.rewriteUUID)
                                                                                 }}
                                                                            >
                                                                                Удалить
                                                                            </div>
                                                                            :
                                                                            null
                                                                    }
                                                                    {
                                                                        this.state.rewriteMode ?

                                                                            <div className="button-default"
                                                                                 onClick={() => this.saveFeed()}>Сохранить</div>
                                                                            :
                                                                            <div className="button-default"
                                                                                 onClick={() => this.feedNew()}>Опубликовать</div>
                                                                    }


                                                                </div>
                                                                :
                                                                null
                                                        }
                                                        {
                                                            this.state.showPreview ?
                                                                <>
                                                                    <div className="preview-news preview_swap">

                                                                        <div className="feed-wrapper-item" style={{boxShadow: "none"}}>
                                                                            <div className="feed-item-value">
                                                                                <div className="wrapper-data">
                                                                                    <ReactMarkdown className="value-post"
                                                                                                   remarkPlugins={[gfm]}
                                                                                                   components={this.components}>
                                                                                        {textNews}
                                                                                    </ReactMarkdown>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                                </>
                                                            :
                                                                null
                                                        }

                                                    </div>
                                                </div>
                                                :
                                                null
                                        }
                                        {
                                            mainFeed?.length > 0 ?
                                                mainFeed?.map(data =>
                                                    <div key={data?.ID} className="feed-wrapper-item">
                                                            <Link style={{textDecoration: "none"}}
                                                                  href={`/post?uuid=${data?.ID}`}>
                                                                {
                                                                    data?.cover_path !== "" ?
                                                                        <img className="cover-feed" src={data.cover_path}
                                                                             alt={data.title} />
                                                                        :
                                                                        null
                                                                }
                                                                <div className="feed-item-value">
                                                                    <div key="asldk" className="wrapper-data">
                                                                        <Link href={`/user/${data?.uid}`}>
                                                                            <div key="aksdlkasd" className="photo-wrapper">
                                                                                {
                                                                                    store.auth.user.data.id === Number(this.state.id) ?
                                                                                        (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(store.auth.user.data.last_active_at).getTime() / 1000))) > 120 ?
                                                                                            null
                                                                                            :
                                                                                            <div className="online_user"/>
                                                                                        :
                                                                                        (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(this.state.result[0].last_active_at).getTime() / 1000))) > 120 ?
                                                                                            null
                                                                                            :
                                                                                            <div className="online_user"/>
                                                                                }

                                                                                <img key="asdmmmmasd" src={data?.photo}
                                                                                     alt={data?.user}/>

                                                                            </div>
                                                                        </Link>
                                                                        <div className="value-post">
                                                                            <div className="feed-item-title">
                                                                                <Link href={`/user/${data?.uid}`}>
                                                                                    <div className="link-user">
                                                                                        {data?.user}
                                                                                    </div>
                                                                                </Link>
                                                                                <div className="feed-item-datetime">
                                                                                    {this.unixToDateTime(data?.date_time)}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {
                                                                            Number(this.state.id) === store.auth.user.data.id ?
                                                                                <div
                                                                                    className="button-default-icon-disable hide-border">
                                                                                    {
                                                                                        data?.close ?
                                                                                            <svg className="svg-close-view"
                                                                                                 fill="#000000"
                                                                                                 xmlns="http://www.w3.org/2000/svg"
                                                                                                 viewBox="0 0 50 50"
                                                                                                 width="50px" height="50px">
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
                                                                                            :
                                                                                            <svg className="svg-close-view"
                                                                                                 fill="#000000"
                                                                                                 xmlns="http://www.w3.org/2000/svg"
                                                                                                 viewBox="0 0 50 50"
                                                                                                 width="50px" height="50px">
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
                                                                                    }

                                                                                </div>
                                                                                :
                                                                                null
                                                                        }
                                                                    </div>
                                                                    <div key="asldk" className="wrapper-data">
                                                                        <div className="title-feed">
                                                                            {data?.title}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                            <div className="wrapper-bottom">
                                                                {/*/!*<div className="wrapper-flex-start">*!/*/}
                                                                {/*    <Link href={`/post?uuid=${data?.ID}`}>*/}
                                                                {/*        <div className="button-default">Подробнее</div>*/}
                                                                {/*    </Link>*/}
                                                                {/*    {*/}
                                                                {/*        Number(this.state.id) === store.auth.user.data.id ?*/}
                                                                {/*            <div className="button-default"*/}
                                                                {/*                 onClick={() => {*/}
                                                                {/*                     this.rewriteFeed(data?.ID, data?.value, data?.close)*/}
                                                                {/*                 }}*/}
                                                                {/*            >*/}
                                                                {/*                Изменить*/}
                                                                {/*            </div>*/}

                                                                {/*            :*/}
                                                                {/*            null*/}
                                                                {/*    }*/}
                                                                {/*</div>*/}
                                                                {/*<div className="like_wrapper wrapper-flex-end">*/}
                                                                {/*    <div className="like">*/}
                                                                {/*        <div className="like-item">*/}
                                                                {/*            {*/}
                                                                {/*                this.state.isDark === "light" ?*/}
                                                                {/*                    <img src={look}  alt="like"/>*/}
                                                                {/*                    :*/}
                                                                {/*                    <img src={look_dark}  alt="like"/>*/}
                                                                {/*            }*/}
                                                                {/*        </div>*/}
                                                                {/*        <div className="like-item">*/}
                                                                {/*            <span className="like-count">*/}
                                                                {/*                {data?.look_count}*/}
                                                                {/*            </span>*/}
                                                                {/*        </div>*/}
                                                                {/*    </div>*/}
                                                                {/*    <div className="like">*/}

                                                                {/*        <div className="like-item" onClick={() => this.like(data?.ID)}>*/}
                                                                {/*            {*/}
                                                                {/*                this.state.isDark === "light" ?*/}
                                                                {/*                    <img src={like}  alt="like"/>*/}
                                                                {/*                    :*/}
                                                                {/*                    <img src={like_dark}  alt="like"/>*/}
                                                                {/*            }*/}
                                                                {/*        </div>*/}
                                                                {/*        <div className="like-item">*/}
                                                                {/*          <span className="like-count" id={data?.ID}>*/}
                                                                {/*              {data?.count_like}*/}
                                                                {/*          </span>*/}
                                                                {/*        </div>*/}
                                                                {/*    </div>*/}
                                                                {/*</div>*/}
                                                                <div className="like_wrapper wrapper-flex-start">
                                                                    <div className="like"
                                                                         onClick={() => this.like(data?.ID)}>
                                                                        <div className="like-item">
                                                                            {
                                                                                this.state.isDark === "light" ?
                                                                                    <img src={like} alt="like"/>
                                                                                    :
                                                                                    <img src={like_dark} alt="like"/>
                                                                            }
                                                                        </div>
                                                                        <div className="like-text">
                                                            <span className="like-count" id={data?.ID}>
                                                                {data?.count_like}
                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="like">
                                                                        <div className="like-item">
                                                                            {
                                                                                this.state.isDark === "light" ?
                                                                                    <img src={look} alt="like"/>
                                                                                    :
                                                                                    <img src={look_dark} alt="like"/>
                                                                            }
                                                                        </div>
                                                                        <div className="like-text">
                                                                            <span className="like-count">
                                                                                {data?.look_count}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {
                                                                        Number(this.state.id) === store.auth.user.data.id ?
                                                                            <div className="like" onClick={() => {
                                                                                this.rewriteFeed(data?.ID, data?.value, data?.title, data?.close, data.cover_path, data.tag)
                                                                            }}>
                                                                                <div className="like-text">
                                                                                    <span className="like-count">
                                                                                        Изменить
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            :
                                                                            null
                                                                    }

                                                                </div>
                                                                <div className="like_wrapper wrapper-flex-end">
                                                                    {
                                                                        data?.tag ?
                                                                            data.tag?.map(tag =>
                                                                                <div className="tags-type">
                                                                                    #{tag?.value}
                                                                                </div>
                                                                            )

                                                                            :
                                                                            null
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                )
                                                :
                                                Number(this.state.id) === store.auth.user.data.id ?

                                                    <div className="error-wrapper">
                                                        <div className="error-page">
                                                            Напишите что-нибудь полезное для сообщества или для себя.
                                                        </div>
                                                    </div>
                                                    :
                                                    <div className="error-wrapper">
                                                        <div className="error-page">
                                                            {this.state.result[0].login} пока ничего не написал.
                                                        </div>
                                                    </div>
                                        }

                                    </div>
                                :
                                this.state.notUser && store.auth.user.isAuth ?
                                    <div>
                                        {/*<div style={{"background": "#FF9898"}} className="title-page">*/}
                                        {/*  Ошибка*/}
                                        {/*</div>*/}
                                        <div className="error-wrapper">

                                            <div className="error-page">
                                                Такого пользователя не существует
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    !store.auth.user.isAuth ?
                                        <div>
                                            {/*<div style={{"background": "#FF9898"}} className="title-page">*/}
                                            {/*  Ошибка*/}
                                            {/*</div>*/}
                                            <div className="error-wrapper">
                                                <div className="error-page">
                                                    Авторизуйтесь чтобы просматривать профили пользователей.
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        <div className="feed-wrapper" style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            height: "100%"
                                        }}>
                                            <div className="loader"/>
                                        </div>
                        }
                    </div>
                    <div className="tags-view">
                        {
                            isLoaded ?
                                <div className="tags-box">
                                    <div className="main-place-photo-column ">
                                        <input type="file" name="file" id="upload_file_input"
                                               onChange={(e) => this.uploadPhotoAction(e)}
                                               accept="image/x-png,image/jpeg" style={{display: "none"}}/>
                                        {
                                            Number(this.state.id) === store.auth.user.data.id ?
                                                this.state.imagePreviewUrl ?
                                                    <img src={this.state.imagePreviewUrl}
                                                         alt={store.auth.user.data.login}
                                                         onClick={() => this.uploadClick()}
                                                         style={{cursor: "pointer"}}/>
                                                    :
                                                    <img src={store.auth.user.data.avatar_url}
                                                         alt={store.auth.user.data.login}
                                                         onClick={() => this.uploadClick()}
                                                         style={{cursor: "pointer"}}/>
                                                :
                                                <img src={this.state.result[0].avatar_url}
                                                     alt={this.state.result[0].login} style={{cursor: "default"}}/>
                                        }
                                    </div>
                                    <div className="main-place-info-column ">
                                        <div className="main-place date_active">
                                            {
                                                store.auth.user.data.id === Number(this.state.id) ?
                                                    (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(store.auth.user.data.last_active_at).getTime() / 1000))) > 120 ?
                                                        (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(store.auth.user.data.last_active_at).getTime() / 1000))) > 60 ?
                                                            <span
                                                                className="info_status">Последняя активность была {new Date(store.auth.user.data.last_active_at).toLocaleString()}</span>
                                                            :
                                                            <span
                                                                className="info_status">Последняя активность была {this.getLastVisit((Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(store.auth.user.data.last_active_at).getTime() / 1000))))} минут назад.</span>
                                                        :
                                                        <span className="info_status">Сейчас на сайте</span>
                                                    :
                                                    (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(this.state.result[0].last_active_at).getTime() / 1000))) > 120 ?
                                                        (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(this.state.result[0].last_active_at).getTime() / 1000))) > 60 ?
                                                            <span
                                                                className="info_status">Последняя активность была {new Date(this.state.result[0].last_active_at).toLocaleString()}</span>
                                                            :
                                                            <span
                                                                className="info_status">Последняя активность была {this.getLastVisit((Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(this.state.result[0].last_active_at).getTime() / 1000))))} минут назад.</span>
                                                        :
                                                        <span className="info_status">Сейчас на сайте</span>
                                            }
                                        </div>
                                        <Helmet>
                                            {
                                                store.auth.user.data.id === Number(this.state.id) ?
                                                    <title>{store.auth.user.data.login} | DevCodeMyLife</title>

                                                    :
                                                    <title>{this.state.result[0].login} | DevCodeMyLife</title>
                                            }

                                        </Helmet>
                                        <div className="main-place name">
                                            {
                                                store.auth.user.data.id === Number(this.state.id) ?
                                                    store.auth.user.data?.name ?
                                                        " " + store.auth.user.data.name + " " + store.auth.user.data.last_name
                                                        :
                                                        " " + store.auth.user.data.login
                                                    :
                                                    this.state.result[0]?.name ?
                                                        " " + this.state.result[0].name + " " + this.state.result[0].last_name
                                                        :
                                                        " " + this.state.result[0].login
                                            }
                                        </div>
                                        <div className="main-place">
                                            Email:
                                            {
                                                Number(this.state.id) === store.auth.user.data.id ?
                                                    store.auth.user.data?.email ?
                                                        " " + store.auth.user.data.email
                                                        :
                                                        " нет"
                                                    :
                                                    " Скрыт либо не задан"

                                            }
                                        </div>
                                        <div className="main-place">
                                            Компания:
                                            {
                                                Number(this.state.id) === store.auth.user.data.id ?
                                                    store.auth.user.data?.company ?
                                                        " " + store.auth.user.data.company
                                                        :
                                                        " нет"
                                                    :
                                                    this.state.result[0]?.company ?
                                                        " " + this.state.result[0].company
                                                        :
                                                        " нет"
                                            }
                                        </div>
                                        <div className="main-place">
                                            Локация:
                                            {
                                                Number(this.state.id) === store.auth.user.data.id ?

                                                    store.auth.user.data?.location ?
                                                        " " + store.auth.user.data.location
                                                        :
                                                        " нет"
                                                    :
                                                    this.state.result[0]?.location ?
                                                        " " + this.state.result[0].location
                                                        :
                                                        " нет"
                                            }
                                        </div>
                                        <div className="main-place">
                                            Профиль GitHub:
                                            {
                                                Number(this.state.id) === store.auth.user.data.id ?
                                                    store.auth.user.data?.html_url ?
                                                        <a className="link_github" target="_blank"
                                                           href={store.auth.user.data.html_url}
                                                           rel="noreferrer"> {store.auth.user.data.login}</a>
                                                        :
                                                        " нет"
                                                    :
                                                    this.state.result[0]?.html_url ?
                                                        <a className="link_github" target="_blank"
                                                           href={this.state.result[0].html_url}
                                                           rel="noreferrer"> {this.state.result[0].login}</a>
                                                        :
                                                        " нет"
                                            }
                                        </div>
                                        <div className="main-place">
                                            Ссылка на резюме:
                                            {
                                                Number(this.state.id) === store.auth.user.data.id ?
                                                    store.auth.user.data?.link_summary ?
                                                        <a className="link_github" target="_blank"
                                                           href={store.auth.user.data.link_summary}
                                                           rel="noreferrer"> {store.auth.user.data.login}</a>
                                                        :
                                                        " нет"
                                                    :
                                                    this.state.result[0]?.link_summary ?
                                                        <a className="link_github" target="_blank"
                                                           href={this.state.result[0].link_summary}
                                                           rel="noreferrer"> {this.state.result[0].login}</a>
                                                        :
                                                        " нет"
                                            }
                                        </div>
                                        <div className="main-place">

                                            {
                                                Number(this.state.id) !== store.auth.user.data.id ?

                                                    this.state.clickCreateDialog ?
                                                        <div>
                                                            <div className="loader-small"/>
                                                        </div>
                                                        :
                                                        <div className="button-default"
                                                             style={{width: "100%", boxSizing: "border-box"}}
                                                             onClick={this.createChat}>
                                                            Написать сообщение
                                                        </div>
                                                    :
                                                    null
                                            }
                                        </div>
                                    </div>
                                </div>
                                :
                                this.state.notUser && store.auth.user.isAuth ?
                                    null
                                    :
                                    !store.auth.user.isAuth ?
                                        null
                                        :
                                        <div className="loader-wrapper feed-wrapper">
                                            <div className="loader-small">

                                            </div>
                                        </div>
                        }

                        {/*<div className="tags-box">*/}
                        {/*    <div className="title-box">Теги</div>*/}
                        {/*    {*/}
                        {/*        tags?.map(data =>*/}
                        {/*            <div className="button-default-tag tags-item unselectable" action={data.value}*/}
                        {/*                 onClick={this.handleClickTag}>*/}
                        {/*                #{data.value}*/}
                        {/*            </div>*/}
                        {/*        )*/}
                        {/*    }*/}
                        {/*</div>*/}
                    </div>
                </div>
            )
        }

    }
}

export default MainUsers;
