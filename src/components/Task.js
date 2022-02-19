import React, {Component} from "react";
import ReactMarkdown from "react-markdown";
import {JsonLd} from "react-schemaorg";
import {Helmet} from 'react-helmet';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {tomorrow} from "react-syntax-highlighter/dist/esm/styles/prism"
import like from "../icon/like.png"
import look from "../icon/look.png"
import like_dark from "../icon/like_dark.png";
import look_dark from "../icon/look_dark.png";
import TextareaAutosize from "react-textarea-autosize";
import code from "../icon/code.png";

const gfm = require('remark-gfm')


class Task extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "React"
        };

        this.state = {
            error: null,
            isLoaded: false,
            result: null,
            mainFeed: null,
            task: null,
            isLoadedFeed: false,
            comments: null,
            counter: 0,
            auth: false,
            load: false,
            data: null,
            notFeed: false,
            isDark: "light",
            user: null,
            store: this.props.store,
            exec: "Стать исполнителем"
        }
        this.refActionExecButton = React.createRef();

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


    handleKeyPress = () => {
        document.getElementById('comments_view').scrollTop = document.getElementById('comments_view').scrollHeight
    }


    like(uuid) {
        let data = {
            feeds_uuid: uuid
        }
        fetch("api/like", {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0) {
                    console.log(res)

                    document.getElementById(uuid).innerHTML = res.data.count + " Нравиться"
                }
                console.log(res)
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


    components = {
        code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
                <SyntaxHighlighter style={tomorrow} wrapLongLines={false} language={match[1]} PreTag="div"
                                   children={String(children).replace(/\n$/, '')} {...props} />
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            )
        }
    }

    previewClick(className) {
        const preview = document.getElementsByClassName(className)[0]
        console.log(preview)
        preview.classList.toggle("preview_swap")
    }

    sendComments() {
        let data = {
            value: document.getElementById('text_comments').value,
            to_uuid: document.getElementById('place_feed').getAttribute('uuid')
        }

        if (data.value !== "") {
            fetch("api/comments", {
                method: "POST",
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(res => {
                    console.log(res)
                    if (res.status.code === 0) {
                        this.getTask()
                        document.getElementById('text_comments').value = ""
                    }

                    console.log(res)
                })
                .catch(error => {
                    console.log(error)
                });
        }
    }

    actionExec = event => {
        event.target.classList.add("wait_blink")
        this.setState({
             exec: "Ожидаем подтверждения"
        })

        let data = {
            uuid: event.target.getAttribute('uuid')
        }

        fetch("api/notification", {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0) {
                    console.log(res)
                }
            })
            .catch(error => {
                console.log(error)
                this.setState({
                    isLoaded: false,
                    result: {}
                });
            });
    }


    componentWillMount() {
        this.getPreferredColorScheme()

        let colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        colorSchemeQuery.addEventListener('change', (event) => {
            this.getPreferredColorScheme()
        });

        fetch("api/authentication", {
            method: "POST"
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0 && res.data.length > 0) {
                    this.setState({
                        isLoaded: true,
                        auth: true,
                        result: res.data,
                        data: res.data,
                        mainFeed: res.feed,
                        notification_count: res.notification_count,
                        notification: res.notification,
                        token: res.token,
                        messagesCount: res.count_message
                    });
                }
            })
            .catch(error => {
                console.log(error)
                this.setState({
                    isLoaded: false,
                    result: {}
                });
            });

        this.getTask()
    }

    getTask() {
        let url = new URL(window.location.href);
        let uuid = url.searchParams.get("uuid");

        let path = `api/task/${uuid}/`

        if (uuid !== "") {
            fetch(path, {
                method: "GET"
            })
                .then(response => response.json())
                .then(res => {
                    if (res.status.code === 0) {
                        this.setState({
                            isLoadedFeed: true,
                            task: res.data,
                            comments: res.comments,
                            counter: res.counter,
                            user: res.user,
                            load: true,
                        });
                    } else {
                        this.setState({
                            isLoadedFeed: false,
                            task: res.data,
                            comments: res.comments,
                            counter: res.counter,
                            load: true,
                            notFeed: true
                        });
                    }
                })
                .catch(error => {
                    console.log(error)
                    this.setState({
                        isLoaded: false,
                        result: {},
                        load: true
                    });
                });
        }
    }

    unixToDateTime(unixTimestamp) {
        const milliseconds = unixTimestamp * 1000
        const dateObject = new Date(milliseconds)

        return dateObject.toLocaleString()
    }

    render() {
        let store = this.state.store.getState()
        let {isLoadedFeed, task, result, comments, counter, user} = this.state;
        return (
            <div style={{display: "flex"}}>
                <div className="content-wall-views">

                    {
                        isLoadedFeed ?
                            <div className="comments-view" id="comments_view">

                                <div className="place-items" id="place_feed" uuid={task?.id}>
                                    <JsonLd item={{
                                        "@context": "https://schema.org",
                                        "@type": "BreadcrumbList",
                                        "itemListElement": [
                                            {
                                                "@type": "ListItem",
                                                "position": 1,
                                                "name": "DevCodeMyLife",
                                                "item": "https://devcodemylife.tech"
                                            },
                                            {
                                                "@type": "ListItem",
                                                "position": 2,
                                                "name": "Фриланс",
                                                "item": "https://devcodemylife.tech/freelances"
                                            },
                                            {
                                                "@type": "ListItem",
                                                "position": 3,
                                                "name": task?.title || task?.value?.substring(0, 30),
                                                "item": `https://devcodemylife.tech/task?uuid=${task?.ID}`
                                            }
                                        ]
                                    }}/>
                                    <Helmet>
                                        <title>{task?.title || task?.value?.substring(0, 30)} | DevCodeMyLife</title>
                                        <meta name="Keywords"
                                              content={"dev, code, life, messenger, социальная сеть, для разработчиков, " + task?.title}/>
                                    </Helmet>
                                    {/*<div className="title-page">*/}
                                    {/*    О нас*/}
                                    {/*</div>*/}
                                    <div className="feed-item-value">
                                        <div key="asldk" className="wrapper-data">
                                            <div key="aksdlkasd" className="photo-wrapper">
                                                {
                                                    (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(task?.last_active_at).getTime() / 1000))) > 120 ?
                                                        null
                                                        :
                                                        <div className="online_user"/>
                                                }
                                                <img key="asdmmmmasd" src={task?.photo} alt={task?.user}
                                                     onClick={(e) => {
                                                         e.preventDefault();
                                                         window.location.href = `/user/${task?.uid}`
                                                     }}
                                                />
                                            </div>
                                            <div className="value-post">
                                                <div className="feed-item-title">
                                                    <div className="link-user" onClick={(e) => {
                                                        e.preventDefault();
                                                        window.location.href = `/user/${task?.uid}`
                                                    }}>
                                                        {task?.user}
                                                    </div>
                                                    <div className="feed-item-datetime">
                                                        {this.unixToDateTime(task?.date_time)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="title-feed">
                                            {task?.title}
                                        </div>
                                        <div key="asldk" className="wrapper-data">
                                            <ReactMarkdown className="value-post" remarkPlugins={[gfm]}
                                                           components={this.components}>
                                                {task?.value}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                    <div className="wrapper-bottom">
                                        <div className="like_wrapper wrapper-flex-start">
                                            <div className="like" onClick={() => this.like(task?.id)}>
                                                <div className="like-item">
                                                    {
                                                        this.state.isDark === "light" ?
                                                            <img src={like} alt="like"/>
                                                            :
                                                            <img src={like_dark} alt="like"/>
                                                    }
                                                </div>
                                                <div className="like-text">
                                                            <span className="like-count" id={task?.id}>
                                                                {task?.count_like} Нравиться
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
                                                                {counter} Просмотров
                                                            </span>
                                                </div>
                                            </div>
                                            {
                                                store.auth.user.isAuth ?
                                                    store.auth.user.data.id !== task?.user_creator_id ?
                                                        task?.status === "wait" ?
                                                            <div className="like" onClick={this.actionExec} uuid={task?.id} ref={this.refActionExecButton}>
                                                                <div className="like-text" >
                                                                    <span className="like-count">
                                                                        {this.state.exec}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            :
                                                            null
                                                    :
                                                        null
                                                :
                                                    null
                                            }
                                            <div className="like">
                                                <div className="like-text" >

                                                        {
                                                            task?.price !== "0" ?
                                                                <span className="like-count">
                                                                    {task?.price} руб.
                                                                </span>
                                                            :
                                                                <span className="like-count">
                                                                    Вознаграждение не указано
                                                                </span>
                                                        }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="like_wrapper wrapper-flex-end">
                                            {
                                                task?.tag ?
                                                    <div className="tags-type">
                                                        #{task?.tag}
                                                    </div>
                                                    :
                                                    null
                                            }
                                        </div>
                                    </div>
                                    {
                                        this.state.isLoaded ?
                                            result.map(res =>
                                                <div className="feed-comments-wrapper-item background-white">
                                                    <div className="wrapper-comments">
                                                        <div className="comments-title bottom-line">Комментарии
                                                        </div>
                                                        <div className="wall-comments">
                                                            {
                                                                this.state.comments?.length ?
                                                                    comments.map(com =>
                                                                        <div>
                                                                            <div className="feed-item-value">
                                                                                <div className="feed-item-value">
                                                                                    <div key="asldk"
                                                                                         className="wrapper-data">
                                                                                        <div key="aksdlkasd"
                                                                                             className="photo-wrapper">
                                                                                            <img key="asdmmmmasd"
                                                                                                 src={com?.photo}
                                                                                                 alt={com?.user}
                                                                                                 onClick={(e) => {
                                                                                                     e.preventDefault();
                                                                                                     window.location.href = `/user/${com?.user_id}`
                                                                                                 }}
                                                                                            />
                                                                                        </div>
                                                                                        <div className="value-post">
                                                                                            <div
                                                                                                className="feed-item-title">
                                                                                                <div
                                                                                                    className="link-user"
                                                                                                    onClick={(e) => {
                                                                                                        e.preventDefault();
                                                                                                        window.location.href = `/user/${com?.user_id}`
                                                                                                    }}>
                                                                                                    {com?.user}
                                                                                                </div>
                                                                                                <div
                                                                                                    className="feed-item-datetime">
                                                                                                    {this.unixToDateTime(com?.date_time)}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="wrapper-data">
                                                                                    {/*<div   className="photo-wrapper">*/}

                                                                                    {/*</div>*/}
                                                                                    <ReactMarkdown
                                                                                        className="value-post"
                                                                                        remarkPlugins={[gfm]}
                                                                                        components={this.components}>
                                                                                        {com?.value}
                                                                                    </ReactMarkdown>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                    :
                                                                    <div className="no-comments">Новых комментариев
                                                                        нет.</div>
                                                            }
                                                        </div>
                                                        <div className="wrapper-data">
                                                            <div key="aksdlkasd" className="photo-wrapper">
                                                                <img key="asdmmmmasd" src={res?.avatar_url}
                                                                     alt={res?.login}/>
                                                            </div>
                                                            <div className="value-post placeholder-main-feed">
                                                                <TextareaAutosize
                                                                    className="feed-textarea"
                                                                    onChange={this.handleChangeTextarea}
                                                                    autoFocus={false}
                                                                    placeholder="Напишите Ваш комментарий"
                                                                    id="text_comments"
                                                                    onKeyPress={this.handleKeyPress}
                                                                >

                                                                </TextareaAutosize>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="wrapper-flex-end create-feed-wrapper-button">
                                                            <div className="button-default"
                                                                 onClick={() => this.sendComments()}>Отправить
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                            :
                                            <div className="feed-comments-wrapper-item background-white">
                                                <div className="wrapper-comments">
                                                    <div className="comments-title">Комментарии</div>
                                                    <div className="wall-comments">
                                                        {
                                                            this.state.comments?.length ?
                                                                comments.map(com =>
                                                                    <div>
                                                                        <div
                                                                            className="feed-item-value bottom-line">
                                                                            <div className="feed-item-value">
                                                                                <div key="asldk"
                                                                                     className="wrapper-data">
                                                                                    <div key="aksdlkasd"
                                                                                         className="photo-wrapper">
                                                                                        <img key="asdmmmmasd"
                                                                                             src={com?.photo}
                                                                                             alt={com?.user}/>
                                                                                    </div>
                                                                                    <div className="value-post">
                                                                                        <div
                                                                                            className="feed-item-title">
                                                                                            <div
                                                                                                className="link-user"
                                                                                                onClick={this.copyLogin}>
                                                                                                {com?.user}
                                                                                            </div>
                                                                                            <div
                                                                                                className="feed-item-datetime">
                                                                                                {this.unixToDateTime(com?.date_time)}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="wrapper-data">
                                                                                {/*<div className="photo-wrapper">*/}

                                                                                {/*</div>*/}
                                                                                <ReactMarkdown
                                                                                    className="value-post"
                                                                                    remarkPlugins={[gfm]}
                                                                                    components={this.components}>
                                                                                    {com?.value}
                                                                                </ReactMarkdown>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                                :
                                                                <div className="no-comments">Новых комментариев
                                                                    нет.</div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                    }

                                </div>
                            </div>
                            :
                            this.state.notFeed ?
                                <div>
                                    {/*<div style={{"background": "#FF9898"}} className="title-page">*/}
                                    {/*  Ошибка*/}
                                    {/*</div>*/}
                                    <div className="error-wrapper">
                                        <div className="error-page">
                                            Задача удалена либо еще не создана.
                                        </div>
                                    </div>
                                </div>
                                :
                                <div className="loader-wrapper feed-wrapper">
                                    <div className="loader">

                                    </div>
                                </div>
                    }
                </div>
                <div className="tags-view">
                    {
                        isLoadedFeed ?
                            <div className="tags-box">
                                <div className="wrapper-data">
                                    <div className="photo-wrapper">
                                        {
                                            (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(user?.last_active_at).getTime() / 1000))) > 120 ?
                                                null
                                                :
                                                <div className="online_user"/>
                                        }
                                        <img src={user?.avatar_url} alt={user?.login}
                                             onClick={(e) => {
                                                 e.preventDefault();
                                                 window.location.href = `/user/${user?.id}`
                                             }}
                                        />
                                    </div>
                                    <div className="value-post">
                                        <div className="feed-item-title">
                                            <div className="link-user" onClick={(e) => {
                                                e.preventDefault();
                                                window.location.href = `/user/${user?.id}`
                                            }}>
                                                {user?.login}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {
                                    user?.location ?
                                        <div className="main-place">
                                            Локация:
                                            {
                                                " " + user?.location
                                            }
                                        </div>
                                        :
                                        null
                                }
                                {
                                    user?.company ?
                                        <div className="main-place">
                                            Компания:
                                            {
                                                " " + user?.company
                                            }
                                        </div>
                                        :
                                        null
                                }
                                {
                                    user?.count_feeds ?
                                        <div className="main-place">
                                            Количество постов:
                                            {
                                                " " + user?.count_feeds
                                            }
                                        </div>
                                        :
                                        null
                                }
                                {
                                    user?.count_tasks ?
                                        <div className="main-place">
                                            Создал задач:
                                            {
                                                " " + user?.count_tasks
                                            }
                                        </div>
                                        :
                                        null
                                }
                            </div>
                            :
                            <div className="loader-wrapper feed-wrapper">
                                <div className="loader-small">

                                </div>
                            </div>
                    }
                </div>
            </div>
        )
    }
}

export default Task;
