import React, { Component }  from "react";
import {Link} from "react-navi";

class People extends Component {
    constructor(props) {
        super(props);
        this.state = {
            load: "load",
            users: null,
            usersSearch: null,
            error: null,
            scrollDown: false,
            last_count_users: 0,
            store: this.props.store,
        };

        this.state.store.subscribe(() => {
            this.setState(this.state.store.getState())
        })
    }

    allUsers = (event) =>{
        document.getElementById("search_users").value = ""
        event.target.classList.add('button-select')
        fetch("api/user", {
            method: "GET",
        })
            .then(response => response.json())
            .then(res => {
                this.setState({
                    users: res.data,
                    load: "continue"
                });
            })
            .catch(error => {
                console.log(error)
            });
    }

    downPage = () => {
        let scrollHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );


        if  (window.scrollY >= scrollHeight - innerHeight) {
            if (!this.state.scrollDown) {
                console.log("down")
                this.setState({
                    scrollDown: true
                })

                let store = this.state.store.getState()
                let length_users = store.people.length

                if (this.state.last_count_users === length_users) {
                    return
                }

                this.setState({
                    last_count_users: length_users
                })


                fetch(`api/user/pagination/${length_users}`, {
                    method: "GET",
                })
                    .then(response => response.json())
                    .then(res => {

                        let tmp = [...store.people, ...res.data]

                        // let obj_assign = Object.assign(store.people, res.data)
                        this.state.store.dispatch({
                            type: "ACTION_UPDATE_PEOPLE", value: tmp.sort(function (x, y){
                                return x.id > y.id ? 1 : -1;
                            })
                        })

                        this.setState({
                            load: "continue"
                        });

                    })
                    .catch(error => {
                        console.log(error)
                    });

                setTimeout(()=>{
                    this.setState({scrollDown: false})
                }, 3000)
        }
        // fetch("api/user", {
        //     method: "GET",
        // })
        //     .then(response => response.json())
        //     .then(res => {
        //         this.setState({
        //             users: res.data,
        //             load: "continue"
        //         });
        //
        //         () => {
        //
        //         }
        //     })
        //     .catch(error => {
        //         console.log(error)
        //     });
        }
    }

    componentDidMount() {
        window.onscroll = this.downPage
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
                        auth: true
                    });

                    // let store = this.state.store.getState()

                    fetch("api/user", {
                        method: "GET",
                    })
                        .then(response => response.json())
                        .then(res => {


                            this.state.store.dispatch({
                                type: "ACTION_UPDATE_PEOPLE", value: res.data.sort(function (x, y){
                                    return x.id > y.id ? 1 : -1;
                                })
                            })

                            this.setState({
                                load: "continue"
                            });

                        })
                        .catch(error => {
                            console.log(error)
                        });
                }else{
                    this.setState({
                        load: "notAuth"
                    })
                }

            })
            .catch(error => {
                console.log(error)
            });

    }

    focusSearch = () => {
        this.setState({
            load: "onFocusSearch"
        })
    }

    changeSearch = (event) => {
        // console.log(document.getElementById("all_users").classList)
        // document.getElementById("all_users").classList.remove('all_users')
        // for (let sibling of event.target.parentNode.children) {
        //     sibling.classList.remove('button-select');
        // }
        fetch(`api/user?q=${event.target.value}`, {
            method: "GET",
        })
            .then(response => response.json())
            .then(res => {
                if (res.data.length) {
                    this.setState({
                        usersSearch: res.data,
                        load: "continueSearch"
                    });
                }else{
                    this.setState({
                        usersSearch: res.data,
                        load: "onSearchError"
                    });
                }

            })
            .catch(error => {
                console.log(error)
            });
    }

    blurSearch = () => {
        // this.setState({
        //     load: "continue"
        // })
    }

    render() {

        let store = this.state.store.getState()
        return (
            <div>
                <div className="content-wall-views">
                    {
                        this.state.load === "notAuth" ?
                            <div>
                                <div className="error-wrapper">
                                    <div className="error-page">
                                        Авторизуйтесь чтобы просматривать эту страницу.
                                    </div>
                                </div>
                            </div>
                            :
                            <div>
                                <div className="wrapper-search wrapper-inline-block unselectable">
                                    {/*<div className="main-place-wrapper">*/}
                                    {/*    <p>*/}
                                    {/*        <b>Команды - </b> это раздел где можно присоединится к уже существующей команде единомышленников или создать свою.<br/>*/}
                                    {/*        Раздел пока в разработке, поэтому здесь ничего нет.*/}
                                    {/*    </p>*/}
                                    {/*</div>*/}
                                    <div>
                                        <input placeholder="Начните вводить..." id="search_users" onFocus={this.focusSearch} onBlur={this.blurSearch} onChange={this.changeSearch}/>
                                    </div>
                                    <div className="tags-wrapper">
                                        <div className="button-default-tag tags-item unselectable button-select" id="all_users" action="all" onClick={this.allUsers}>
                                            Все
                                        </div>
                                    </div>
                                </div>
                                {
                                    this.state.load === "load" ?
                                        <div className="loader-wrapper feed-wrapper">
                                            <div className="loader" />
                                        </div>
                                        :
                                        this.state.load === "error" ?
                                            <div>
                                                <div className="not_news">Ошибка соединения с сервером. Попробуйте позднее.</div>
                                            </div>
                                            :
                                            this.state.load === "onFocusSearch" ?
                                                <div className="feed-wrapper">
                                                    <div className="not_news">
                                                        Начните вводить и мы начнем искать...
                                                    </div>
                                                </div>
                                                :
                                                this.state.load === "onSearchError" ?
                                                    <div className="feed-wrapper">
                                                        <div className="not_news">
                                                            К сожалению по Вашему запросу ничего не найдено 🙁
                                                        </div>
                                                    </div>
                                                    :
                                                    this.state.load === "continueSearch" ?
                                                        <div className="feed-wrapper">
                                                            {
                                                                this.state.usersSearch?.map(data =>
                                                                    <div key={data.id} className="users-view">
                                                                        <Link href={`/user/${data?.id}`}>
                                                                            <div className="image-user">
                                                                                <img className="image-user-src-people" src={data.avatar_url} alt={data.login}/>
                                                                            </div>
                                                                        </Link>
                                                                        <div className="info-user">
                                                                            <div className="feed-item-title">
                                                                                <Link href={`/user/${data?.id}`}>
                                                                                    <div className="link-user">
                                                                                        {data?.login}
                                                                                    </div>
                                                                                </Link>
                                                                            </div>
                                                                            <div className="more-info">
                                                                                <div className="more-info-value">
                                                                                    Компания:
                                                                                    {
                                                                                        data?.company ?
                                                                                            " "+data.company
                                                                                            :
                                                                                            " не указана"
                                                                                    }
                                                                                </div>
                                                                                <div className="more-info-value">
                                                                                    Локация:
                                                                                    {
                                                                                        data?.location ?
                                                                                            " "+data.location
                                                                                            :
                                                                                            " не указана"
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                        :

                                                        this.state.load === "continue" ?
                                                            <div className="feed-wrapper">
                                                                {
                                                                    store.people?.map(data =>
                                                                        <div key={data.id} className="users-view">
                                                                            <Link href={`/user/${data?.id}`}>
                                                                                <div className="image-user">
                                                                                    <img className="image-user-src-people" src={data.avatar_url} alt={data.login}/>
                                                                                </div>
                                                                            </Link>
                                                                            <div className="info-user">
                                                                                <div className="feed-item-title">
                                                                                    <Link href={`/user/${data?.id}`}>
                                                                                        <div className="link-user">
                                                                                            {data?.login}
                                                                                        </div>
                                                                                    </Link>
                                                                                </div>
                                                                                <div className="more-info">
                                                                                    <div className="more-info-value">
                                                                                        Компания:
                                                                                        {
                                                                                            data?.company ?
                                                                                                " "+data.company
                                                                                                :
                                                                                                " не указана"
                                                                                        }
                                                                                    </div>
                                                                                    <div className="more-info-value">
                                                                                        Локация:
                                                                                        {
                                                                                            data?.location ?
                                                                                                " "+data.location
                                                                                                :
                                                                                                " не указана"
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                }
                                                                <div className="loader-wrapper feed-wrapper">
                                                                    <div className="loader-small" />
                                                                </div>
                                                            </div>
                                                            :
                                                            null
                                }
                            </div>
                    }

                </div>
                <div className="tags-view">
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

export default People;
