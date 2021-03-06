import React, {Component} from "react";
import ReactMarkdown from "react-markdown";
import {JsonLd} from "react-schemaorg";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
// import {tomorrow} from "react-syntax-highlighter/dist/esm/styles/prism"
import like from "../icon/like.png"
import look from "../icon/look.png"
import like_dark from "../icon/like_dark.png";
import look_dark from "../icon/look_dark.png";
import TextareaAutosize from "react-textarea-autosize";
import code from "../icon/code.png";

const gfm = require('remark-gfm')


class FeedOnePage extends Component {
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
            feed: null,
            isLoadedFeed: false,
            comments: null,
            counter: 0,
            auth: false,
            load: false,
            data: null,
            notFeed: false,
            isDark: "light",
            user: null,
            uuid: this.props.uuid
        }
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
                <SyntaxHighlighter wrapLongLines={false} language={match[1]} PreTag="div"
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
            fetch("/api/comments", {
                method: "POST",
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(res => {
                    console.log(res)
                    if (res.status.code === 0) {
                        this.getFeed()
                        document.getElementById('text_comments').value = ""
                    }

                    console.log(res)
                })
                .catch(error => {
                    console.log(error)
                });
        }
    }

    componentWillMount() {
        this.getPreferredColorScheme()

        let colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        colorSchemeQuery.addEventListener('change', (event) => {
            this.getPreferredColorScheme()
        });

        fetch("/api/authentication", {
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

        this.getFeed()
    }

    getFeed() {
        let uuid = this.state.uuid

        if (uuid === "") {
            window.location.href = "/feeds"
        }

        let path = `/api/feed/${uuid}/${window.localStorage.getItem('finger')}`

        if (uuid !== "") {
            fetch(path, {
                method: "GET"
            })
                .then(response => response.json())
                .then(res => {
                    if (res.status.code === 0 && res.data.length > 0) {
                        this.setState({
                            isLoadedFeed: true,
                            feed: res.data,
                            comments: res.comments,
                            counter: res.counter,
                            user: res.user,
                            load: true,
                        });
                    } else {
                        this.setState({
                            isLoadedFeed: false,
                            feed: res.data,
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

        let {isLoadedFeed, feed, result, comments, counter, user} = this.state;
        return (
            <div style={{display: "flex"}}>
                <div className="content-wall-views" style={{width: "810px"}}>
                    {
                        isLoadedFeed ?
                            <div className="comments-view" id="comments_view">
                                <div className="rectangle-back">
                                    <div className="button-default wrapper-inline-block" onClick={() => {
                                        window.history.go(-1)
                                    }}>
                                        ??????????
                                    </div>
                                </div>
                                {feed.map(data =>
                                    <div className="place-items" id="place_feed" uuid={data?.ID}>
                                        {
                                            data?.cover_path !== "" ?
                                                <img className="cover-feed" src={data.cover_path}
                                                     alt={data.title} style={{maxWidth: "770px"}}/>
                                                :
                                                null
                                        }
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
                                                    "name": "?????? ??????????????",
                                                    "item": "https://devcodemylife.tech/feed"
                                                },
                                                {
                                                    "@type": "ListItem",
                                                    "position": 3,
                                                    "name": data?.title || data?.value?.substring(0, 30),
                                                    "item": `https://devcodemylife.tech/post/${data?.ID}`
                                                }
                                            ]
                                        }}/>
                                        {/*<div className="title-page">*/}
                                        {/*    ?? ??????*/}
                                        {/*</div>*/}
                                        <div className="feed-item-value">
                                            <div key="asldk" className="wrapper-data">
                                                <div key="aksdlkasd" className="photo-wrapper">
                                                    {
                                                        (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(data?.last_active_at).getTime() / 1000))) > 120 ?
                                                            null
                                                            :
                                                            <div className="online_user"/>
                                                    }
                                                    <img key="asdmmmmasd" src={data?.photo} alt={data?.user}
                                                         onClick={(e) => {
                                                             e.preventDefault();
                                                             window.location.href = `/user/${data?.uid}`
                                                         }}
                                                    />
                                                </div>
                                                <div className="value-post">
                                                    <div className="feed-item-title">
                                                        <div className="link-user" onClick={(e) => {
                                                            e.preventDefault();
                                                            window.location.href = `/user/${data?.uid}`
                                                        }}>
                                                            {data?.user}
                                                        </div>
                                                        <div className="feed-item-datetime">
                                                            {this.unixToDateTime(data?.date_time)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <h1 className="title-feed">
                                                {data?.title}
                                            </h1>
                                            {
                                                data?.video_path ? (
                                                    <div className="component-new-feed__wrapper-article">
                                                        <video style={{width: "100%", borderRadius: "5px"}}
                                                               controls={true}>
                                                            <source src={data?.video_path}/>
                                                        </video>
                                                    </div>
                                                ) : null
                                            }
                                            <div key="asldk" className="wrapper-data">
                                                <ReactMarkdown className="value-post" remarkPlugins={[gfm]}
                                                               components={this.components}>
                                                    {data?.value}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                        <div className="wrapper-bottom">
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
                                            {/*                {counter}*/}
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
                                            {/*            <span className="like-count" id={data?.ID}>*/}
                                            {/*                {data?.count_like}*/}
                                            {/*            </span>*/}
                                            {/*        </div>*/}
                                            {/*    </div>*/}
                                            {/*</div>*/}
                                            <div className="like_wrapper wrapper-flex-start">
                                                <div className="like" onClick={() => this.like(data?.ID)}>
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
                                                                {counter}
                                                            </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="like_wrapper wrapper-flex-end">
                                                {
                                                    data?.tag ?
                                                        data.tag?.map(tag =>
                                                            <div className="default-tag tags-item unselectable"
                                                                 style={{background: `${tag?.color}17`}}>
                                                                <span style={{color: tag?.color}}>{tag?.value}</span>
                                                            </div>
                                                        )

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
                                                            <div className="feed-item-value" style={{
                                                                display: "flex",
                                                                padding: "10px",
                                                                borderBottom: "1px solid var(--button_border)",
                                                                borderRadius: "0px"
                                                            }}>
                                                                <div key="aksdlkasd" className="photo-wrapper">
                                                                    <img key="asdmmmmasd" src={res?.avatar_url}
                                                                         alt={res?.login}/>
                                                                </div>
                                                                <div className="value-post placeholder-main-feed">
                                                                    <TextareaAutosize
                                                                        className="feed-textarea"
                                                                        onChange={this.handleChangeTextarea}
                                                                        autoFocus={false}
                                                                        placeholder="???????????????? ?????? ??????????????????????"
                                                                        id="text_comments"
                                                                        onKeyPress={this.handleKeyPress}
                                                                        minRows={4}
                                                                    />
                                                                </div>
                                                                <div
                                                                    className="wrapper-flex-end create-feed-wrapper-button">
                                                                    <div className="button-default"
                                                                         style={{height: "15px"}}
                                                                         onClick={() => this.sendComments()}>??????????????????
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="comments-title bottom-line">??????????????????????
                                                            </div>
                                                            <div className="wall-comments">
                                                                {
                                                                    this.state.comments.length ?
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
                                                                        <div className="no-comments">?????????? ????????????????????????
                                                                            ??????.</div>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                                :
                                                <div className="feed-comments-wrapper-item background-white">
                                                    <div className="wrapper-comments">
                                                        <div className="comments-title">??????????????????????</div>
                                                        <div className="wall-comments">
                                                            {
                                                                this.state.comments.length ?
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
                                                                    <div className="no-comments">?????????? ????????????????????????
                                                                        ??????.</div>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                        }

                                    </div>
                                )}
                            </div>
                            :
                            this.state.notFeed ?
                                <div>
                                    {/*<div style={{"background": "#FF9898"}} className="title-page">*/}
                                    {/*  ????????????*/}
                                    {/*</div>*/}
                                    <div className="error-wrapper">
                                        <div className="error-page">
                                            ?????????????? ?????????????? ???????? ?????? ???? ??????????????.
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
                {/*<div className="tags-view">*/}
                {/*    {*/}
                {/*        isLoadedFeed ?*/}
                {/*            <div className="tags-box">*/}
                {/*                <div className="wrapper-data">*/}
                {/*                    <div className="photo-wrapper">*/}
                {/*                        {*/}
                {/*                            (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(user?.last_active_at).getTime() / 1000))) > 120 ?*/}
                {/*                                null*/}
                {/*                                :*/}
                {/*                                <div className="online_user"/>*/}
                {/*                        }*/}
                {/*                        <img src={user?.avatar_url} alt={user?.login}*/}
                {/*                             onClick={(e) => {*/}
                {/*                                 e.preventDefault();*/}
                {/*                                 window.location.href = `/user/${user?.id}`*/}
                {/*                             }}*/}
                {/*                        />*/}
                {/*                    </div>*/}
                {/*                    <div className="value-post">*/}
                {/*                        <div className="feed-item-title">*/}
                {/*                            <div className="link-user" onClick={(e) => {*/}
                {/*                                e.preventDefault();*/}
                {/*                                window.location.href = `/user/${user?.id}`*/}
                {/*                            }}>*/}
                {/*                                {user?.login}*/}
                {/*                            </div>*/}
                {/*                        </div>*/}
                {/*                    </div>*/}
                {/*                </div>*/}
                {/*                {*/}
                {/*                    user?.location ?*/}
                {/*                        <div className="main-place">*/}
                {/*                            ??????????????:*/}
                {/*                            {*/}
                {/*                                " " + user?.location*/}
                {/*                            }*/}
                {/*                        </div>*/}
                {/*                        :*/}
                {/*                        null*/}
                {/*                }*/}
                {/*                {*/}
                {/*                    user?.company ?*/}
                {/*                        <div className="main-place">*/}
                {/*                            ????????????????:*/}
                {/*                            {*/}
                {/*                                " " + user?.company*/}
                {/*                            }*/}
                {/*                        </div>*/}
                {/*                        :*/}
                {/*                        null*/}
                {/*                }*/}
                {/*                {*/}
                {/*                    user?.count_feeds ?*/}
                {/*                        <div className="main-place">*/}
                {/*                            ???????????????????? ????????????:*/}
                {/*                            {*/}
                {/*                                " " + user?.count_feeds*/}
                {/*                            }*/}
                {/*                        </div>*/}
                {/*                        :*/}
                {/*                        null*/}
                {/*                }*/}
                {/*                {*/}
                {/*                    user?.count_tasks ?*/}
                {/*                        <div className="main-place">*/}
                {/*                            ???????????? ??????????:*/}
                {/*                            {*/}
                {/*                                " " + user?.count_tasks*/}
                {/*                            }*/}
                {/*                        </div>*/}
                {/*                        :*/}
                {/*                        null*/}
                {/*                }*/}
                {/*            </div>*/}
                {/*            :*/}
                {/*            null*/}
                {/*    }*/}
                {/*    <div className="top-my-target">*/}
                {/*        <div id="yandex_rtb_R-A-1591597-1" />*/}
                {/*    </div>*/}
                {/*</div>*/}
                <div id="id-C-A-1591597-3" />
            </div>
        )
    }
}

export default FeedOnePage;
