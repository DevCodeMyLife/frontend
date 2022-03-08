import React, {Component} from "react";
// import ReactMarkdown from 'react-markdown'
import {PrismAsync as SyntaxHighlighter} from 'react-syntax-highlighter'
// import {tomorrow as style} from "react-syntax-highlighter/dist/esm/styles/prism"
import like from "../icon/like.png"
import look from "../icon/look.png";
import look_dark from "../icon/look_dark.png";
import like_red from "../icon/like_red.png";


// import Head from "./Header";
import {Link} from "react-navi";
import like_dark from "../icon/like_dark.png";

// const gfm = require('remark-gfm')


class Feed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: "load",
            result: [],
            data: null,
            currentDateTime: new Date().getTime(),
            tags: [],
            isDark: "light",
            store: this.props.store,
            likeType: {}
        }

        this.state.store.subscribe(() => {
            this.setState(this.state.store.getState())
        })

    }

    popular = React.createRef()

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
                    document.getElementById(uuid).innerHTML = res.data.count
                    this.state.likeType[uuid] = !this.state.likeType[uuid]
                    this.setState({
                        likeType:  this.state.likeType
                    })
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
                    if (res.data !== null) {
                        this.setState({
                            isLoaded: "access",
                            result: res.data.sort(function (x, y) {
                                return x.count_like > y.count_like ? -1 : 1;
                            })
                        });
                    }else{
                        this.setState({
                            result: null,
                            isLoaded: "access"
                        });
                    }
                })
                .catch(error => {
                    this.setState({
                        isLoaded: "error",
                        result: {}
                    });
                });
        } else {
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


        for (let sibling of document.getElementById("tags-wrapper-all-tags").parentNode.children) {
            sibling.classList.remove('button-select');
        }

        for (let sibling of document.getElementById("tags-wrapper-default").children) {
            sibling.classList.remove('button-select');
        }

        for (let sibling of event.target.parentNode.children) {
            sibling.classList.remove('button-select');
        }

        this.setState({
            isLoaded: "load",
        })

        event.target.classList.add('button-select')
        let attr = event.target.getAttribute('action')

        if (attr === "top") {
            fetch("api/feed/top", {
                method: "GET",
            })
                .then(response => response.json())
                .then(res => {
                    if (res.status.code === 0 && res.data != null) {
                        this.setState({
                            isLoaded: "access",
                            result: res.data
                        });
                    } else {
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
        } else if (attr === "all") {
            fetch("api/feed", {
                method: "GET",
            })
                .then(response => response.json())
                .then(res => {
                    this.setState({
                        isLoaded: "access",
                        result: res.data.sort(function (x, y) {
                        return x.date_time > y.date_time ? -1 : 1;
                    })
                    });
                })
                .catch(error => {
                    this.setState({
                        isLoaded: "error",
                        result: {}
                    });
                });
        } else {
            fetch(`api/feed?params=${attr}`, {
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
        this.getPreferredColorScheme()

        let colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        colorSchemeQuery.addEventListener('change', (event) => {
            this.getPreferredColorScheme()
        });

        fetch("api/feed/top", {
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

        fetch("api/tags", {
            method: "GET",
        })
            .then(response => response.json())
            .then(res => {

                this.setState({
                    tags: res.data
                });


            })
            .catch(error => {
                this.setState({
                    isLoaded: "error",
                    tags: {}
                });
            });


    }

    handlerFocus = (event) => {
        for (let sibling of document.getElementById("tags-wrapper-all-tags").parentNode.children) {
            sibling.classList.remove('button-select');
        }

        for (let sibling of document.getElementById("tags-wrapper-default").children) {
            sibling.classList.remove('button-select');
        }
        this.setState({
            isLoaded: "OnFocusSearch"
        })
    }

    handlerBlur = (event) => {
        if (event.target.value.length !== 0){
            return
        }

        fetch("api/feed/top", {
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
        this.popular.current.classList.add('button-select')
        this.setState({
            isLoaded: "access"
        })
    }

    handleHoverOn = (event) => {
        let elem = event.target.querySelector('.descriptions-button')

        if (elem) {
            elem.classList.add('fade-in');
        } else {
            document.querySelector('.descriptions-button').classList.remove('fade-in');
        }
    }

    handleHoverOff = (event) => {
        let elem = event.target.querySelector('.descriptions-button')

        if (elem) {
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
                <SyntaxHighlighter style={style} wrapLongLines={false} language={match[1]} showLineNumbers={false}
                                   PreTag="div" children={String(children).replace(/\n$/, '')} {...props} />
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            )
        }
    }

// <img src={messages} alt="messages" path="/messages" />

    render() {
        let {isLoaded, result, tags} = this.state;
        console.log(tags)

        const store = this.state.store.getState()
        if (!store.components.settings.feed) {
            return (
                <div className="content-wall-views">
                    <div className="feed-wrapper">
                        <div className="main-place-wrapper">
                            <p>
                                В разделе Новостей ведутся технические работы.
                            </p>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div style={{display: "flex"}}>
                    <div className="content-wall-views">
                        <div className="wrapper-feed">
                            <div className="wrapper-search wrapper-inline-block unselectable">
                                <div>
                                    <input placeholder="Например имя автора" onKeyPress={this.handleKeyPress}
                                           onFocus={this.handlerFocus} onBlur={this.handlerBlur}/>
                                </div>
                                <div className="tags-wrapper" id="tags-wrapper-default">
                                    <div className="button-default-tag tags-item unselectable button-select" id="top"
                                         action="top" onClick={this.handleClickTag} ref={this.popular}>
                                        Популярные
                                    </div>
                                    <div className="button-default-tag tags-item unselectable" action="all"
                                         onClick={this.handleClickTag}>
                                        Новые
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
                                            <div className="not_news">Ошибка соединения с сервером. Попробуйте
                                                позднее.
                                            </div>
                                        </div>
                                        :
                                        isLoaded === "OnFocusSearch" ?
                                            <div className="feed-wrapper">
                                                <div className="not_news">
                                                    Начните вводить и мы начнем искать...
                                                </div>
                                            </div>
                                            :
                                            result === null ?
                                                <div className="feed-wrapper">
                                                    <div className="not_news">
                                                        К сожалению показать нечего 🙁
                                                    </div>
                                                </div>
                                                :
                                                <div className="feed-wrapper">
                                                    {
                                                        result.length > 0 ?

                                                            result.map(data =>
                                                                <div key={data?.ID} className="feed-wrapper-item">
                                                                    <Link style={{textDecoration: "none"}}
                                                                          href={`/post/${data?.ID}`}>
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
                                                                                    <div key="aksdlkasd"
                                                                                         className="photo-wrapper">

                                                                                        {
                                                                                            (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(data?.last_active_at).getTime() / 1000))) > 120 ?
                                                                                                null
                                                                                                :
                                                                                                <div className="online_user"/>
                                                                                        }

                                                                                        <img key="asdmmmmasd" src={data?.photo}
                                                                                             alt={data?.id}/>

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
                                                                            </div>
                                                                            <div key="asldkasd" className="wrapper-data">
                                                                                <div className="title-feed">
                                                                                    {data?.title}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </Link>
                                                                    <div className="wrapper-bottom">
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
                                                                                        <span className="like-count"
                                                                                              id={data?.ID}>
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
                                                            null
                                                    }
                                                </div>
                            }

                        </div>
                    </div>
                    <div className="tags-view">
                        <div className="tags-box">
                            <div className="title-box" id="tags-wrapper-all-tags">Теги</div>
                            {
                                tags.length > 0 ?

                                    tags?.map(data =>
                                        <div className="button-default-tag tags-item unselectable" action={data.value}
                                             onClick={this.handleClickTag}>
                                            <span style={{color: data.color}}>#</span>{data.value}
                                        </div>
                                    )
                                :
                                    null
                            }
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default Feed;
