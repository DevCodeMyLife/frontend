import React, { Component }  from "react";
import ReactMarkdown from 'react-markdown'
import { PrismAsync as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow as style} from "react-syntax-highlighter/dist/esm/styles/prism"
import like from "../icon/like.png"
import look from "../icon/look.png";
import notes from "../icon/notes.png";
import code from "../icon/code.png";

import messages from "../icon/messages.png";
import user from "../icon/user.png";
import { Link } from "react-navi";
import Head from "./Header";
import Nav from "./Nav";
const gfm = require('remark-gfm')


class Feed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: "load",
            result: [],
            auth: false,
            messagesCount: 0,
            data: null
        };
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
                if (res.status.code === 0){
                    document.getElementById(uuid).innerHTML = res.data.count
                }
            })
            .catch(error => {
                console.log(error)
            });
    }

    handleKeyPress = (event) => {
        this.setState({
            isLoaded: "load",
        })

        let query = event.target.value

        if (query.length > 0) {
            fetch("api/search?" + new URLSearchParams({
                query: query
            }), {
                method: "GET",
            })
                .then(response => response.json())
                .then(res => {
                    this.setState({
                        isLoaded: "access",
                        result: res.data.sort(function (x, y){
                            return x.count_like > y.count_like ? -1 : 1;
                        })
                    });
                })
                .catch(error => {
                    this.setState({
                        isLoaded: "error",
                        result: {}
                    });
                });
        }else{
            fetch("api/feed", {
                method: "GET",
            })
                .then(response => response.json())
                .then(res => {
                    this.setState({
                        isLoaded: "access",
                        result: res.data
                    });
                })
                .catch(error => {
                    this.setState({
                        isLoaded: "error",
                        result: {}
                    });
                });
        }
    }

    handleClickTag = event => {
        for (let sibling of event.target.parentNode.children) {
            sibling.classList.remove('button-select');
        }

        this.setState({
            isLoaded: "load",
        })

        event.target.classList.add('button-select')
        let attr = event.target.getAttribute('action')

        if (attr === "top"){
            fetch("api/feed/top", {
                method: "GET",
            })
                .then(response => response.json())
                .then(res => {
                    if (res.status.code === 0 && res.data != null) {
                        this.setState({
                            isLoaded: "access",
                            result: res.data.sort(function (x, y) {
                                return x.count_like > y.count_like ? -1 : 1;
                            })
                        });

                        this.setState({
                            result: res.data.sort(function (x, y) {
                                return x.look_count > y.look_count ? -1 : 1;
                            })
                        });
                    }else{
                        this.setState({
                            isLoaded: "access",
                            result: []
                        });
                    }
                })
                .catch(error => {
                    this.setState({
                        isLoaded: "error",
                        result: {}
                    });
                });
        }else{
            fetch("api/feed", {
                method: "GET",
            })
                .then(response => response.json())
                .then(res => {
                    this.setState({
                        isLoaded: "access",
                        result: res.data
                    });
                })
                .catch(error => {
                    this.setState({
                        isLoaded: "error",
                        result: {}
                    });
                });
        }
    }

    componentDidMount() {
        fetch("api/feed", {
            method: "GET",
        })
            .then(response => response.json())
            .then(res => {

                this.setState({
                    isLoaded: "access",
                    result: res.data
                });


            })
            .catch(error => {
                this.setState({
                    isLoaded: "error",
                    result: {}
                });
                window.location.href = "/"
            });

        fetch("/api/authentication", {
            method: "POST",
            body: JSON.stringify({
                "finger": window.localStorage.getItem("finger")
            })
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0){
                    this.setState({
                        auth: true,
                        data: res.data,
                        feed: res.feed,
                        notification_count: res.notification_count,
                        notification: res.notification,
                        token: res.token,
                        messagesCount: res.count_message
                    });
                }else{
                    this.sendLogs(res.status.message)
                    this.delete_cookie("access_token")
                }
                this.setState({
                    load: true,
                    headComponent: null
                });

                this.setState({
                    headComponent: <Head
                        auth={true}
                        user={res.data[0]}
                        load={true}
                    />
                })


            })
            .catch(error => {
                this.setState({
                    auth: false,
                    load: true,
                    token: "asd",
                });

            });
    }

    handlerFocus = (event) => {
        this.setState({
            isLoaded: "OnFocusSearch"
        })
    }

    handlerBlur = (event) => {
        this.setState({
            isLoaded: "access"
        })
    }

    handleHoverOn = (event) => {
        let elem = event.target.querySelector('.descriptions-button')

        if (elem){
            elem.classList.add('fade-in');
        }else{
            document.querySelector('.descriptions-button').classList.remove('fade-in');
        }
    }

    handleHoverOff = (event) => {
        let elem = event.target.querySelector('.descriptions-button')

        if (elem){
            elem.classList.remove('fade-in');
        }
        document.querySelector('.descriptions-button').classList.remove('fade-in');
    }


    unixToDateTime(unixTimestamp) {
        const milliseconds = unixTimestamp * 1000
        const dateObject = new Date(milliseconds)

        return dateObject.toLocaleString()
    }

    components = {
        code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
                <SyntaxHighlighter style={style} wrapLongLines={false} language={match[1]} showLineNumbers={false} PreTag="div" children={String(children).replace(/\n$/, '')} {...props} />
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            )
        }
    }

// <img src={messages} alt="messages" path="/messages" />

    render() {
        let { isLoaded, result } = this.state;
        return (
            <div className="wrapper-content">
                <div className="content">
                    <div id="vertical_menu" className="reviews-menu">
                        <Nav load={this.state.load} auth={this.state.auth} data={this.state.data} />
                    </div>
                    <div className="content-wall-views">
                        <div className="wrapper-feed">
                            <div className="wrapper-search wrapper-inline-block unselectable">
                                <div>
                                    <input placeholder="Например имя автора" onKeyPress={this.handleKeyPress} onFocus={this.handlerFocus} onBlur={this.handlerBlur}/>
                                </div>
                                <div className="tags-wrapper">
                                    <div className="button-default-tag tags-item unselectable button-select" id="all" action="all" onClick={this.handleClickTag}>
                                        Все
                                    </div>
                                    <div className="button-default-tag tags-item unselectable" action="top" onClick={this.handleClickTag}>
                                        Топ 10 недели
                                    </div>
                                </div>
                            </div>

                            {
                                isLoaded === "load" ?
                                    <div className="loader-wrapper feed-wrapper">
                                        <div className="loader">

                                        </div>
                                    </div>
                                    :
                                    isLoaded === "error" ?
                                        <div>
                                            <div className="not_news">Ошибка соединеия с сервером. Попробуйте поздее.</div>
                                        </div>
                                        :
                                        isLoaded === "OnFocusSearch" ?
                                            <div className="feed-wrapper">
                                                <div className="not_news">
                                                    Начните вводить и мы начнем искать...
                                                </div>
                                            </div>
                                            :
                                            result.length === 0 ?
                                                <div className="feed-wrapper">
                                                    <div className="not_news">
                                                        К сожалению показать нечего 🙁
                                                    </div>
                                                </div>
                                                :

                                                <div className="feed-wrapper">
                                                    {result.map(data =>
                                                        <div key={data?.ID}  className="feed-wrapper-item">
                                                            {/*<div className="feed-item-title">*/}
                                                            {/*    <div className="wrapper-flex-start">{data?.title}</div>*/}
                                                            {/*    <div key="mamdmkamasdasd" className="author-name wrapper-flex-end unselectable" onClick={(e) => {*/}
                                                            {/*        e.preventDefault();*/}
                                                            {/*        window.open('https://github.com/' + data?.user, "_blank");*/}
                                                            {/*    }}>*/}
                                                            {/*        {data?.user}*/}
                                                            {/*    </div>*/}
                                                            {/*</div>*/}

                                                            <div className="feed-item-value" >
                                                                <div key="asldk" className="wrapper-data">
                                                                    <div key="aksdlkasd"  className="photo-wrapper">
                                                                        <img key="asdmmmmasd" src={data?.photo} alt={data?.id} onClick={(e) => {
                                                                            e.preventDefault();
                                                                            window.location.href = `/user?id=${data?.uid}`
                                                                        }} />
                                                                    </div>
                                                                    <div className="value-post">
                                                                        <div className="feed-item-title">
                                                                            <div className="link-user" onClick={(e) => {
                                                                                e.preventDefault();
                                                                                window.location.href = `/user?id=${data?.uid}`
                                                                            }}>
                                                                                {data?.user}
                                                                            </div>
                                                                            <div className="feed-item-datetime">
                                                                                {this.unixToDateTime(data?.date_time)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div key="asldkasd" className="wrapper-data">
                                                                    {/*<div key="aksdlkasdasd"  className="photo-wrapper">*/}

                                                                    {/*</div>*/}
                                                                    <ReactMarkdown className="value-post" remarkPlugins={[gfm]} components={this.components} onClick={(e) => {
                                                                        e.preventDefault();
                                                                        window.location.href = `/post?uuid=${data?.ID}`
                                                                    }}>
                                                                        {data?.value?.substring(0, 900) + "..."}
                                                                    </ReactMarkdown>
                                                                </div>
                                                            </div>
                                                            <div className="wrapper-bottom">
                                                                <div className="wrapper-flex-start">
                                                                    <div className="button-default" onClick={(e) => {
                                                                        e.preventDefault();
                                                                        window.location.href = `/post?uuid=${data?.ID}`
                                                                    }}>Подробнее</div>
                                                                </div>
                                                                <div className="like_wrapper wrapper-flex-end">
                                                                    <div className="like">
                                                                        <div className="like-item">
                                                                            <img src={look}  alt="like"/>
                                                                        </div>
                                                                        <div className="like-item">
                                                            <span className="like-count">
                                                                {data?.look_count}
                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="like">
                                                                        <div className="like-item" onClick={() => this.like(data?.ID)}>
                                                                            <img src={like}  alt="like"/>
                                                                        </div>
                                                                        <div className="like-item">
                                                            <span className="like-count" id={data?.ID}>
                                                                {data?.count_like}
                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                            }

                        </div>
                    </div>
                </div>
            </div>

        );
    }
}

export default Feed;
