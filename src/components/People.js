import React, { Component }  from "react";

class People extends Component {
    constructor(props) {
        super(props);
        this.state = {
            load: "load",
            users: null,
            usersSearch: null,
            error: null
        };
    }

    componentDidMount() {
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

    focusSearch = (event) => {
        this.setState({
            load: "onFocusSearch"
        })
    }

    changeSearch = (event) => {
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

    blurSearch = (event) => {
        this.setState({
            load: "continue"
        })
    }

    render() {
        return (
            <div className="content-wall-views">
                <div className="wrapper-search wrapper-inline-block unselectable">
                    {/*<div className="main-place-wrapper">*/}
                    {/*    <p>*/}
                    {/*        <b>Команды - </b> это раздел где можно присоединится к уже существующей команде единомышленников или создать свою.<br/>*/}
                    {/*        Раздел пока в разработке, поэтому здесь ничего нет.*/}
                    {/*    </p>*/}
                    {/*</div>*/}
                    <div>
                        <input placeholder="Начните вводить..." onFocus={this.focusSearch} onBlur={this.blurSearch} onChange={this.changeSearch}/>
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
                                <div className="not_news">Ошибка соединеия с сервером. Попробуйте поздее.</div>
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
                                                        <div className="image-user">
                                                            <img className="image-user-src" src={data.avatar_url} alt={data.login}/>
                                                        </div>
                                                        <div className="info-user">
                                                            <div className="feed-item-title">
                                                                <div className="link-user" onClick={(e) => {
                                                                    e.preventDefault();
                                                                    window.location.href = `/user?id=${data?.id}`
                                                                }}>
                                                                    {data?.login}
                                                                </div>
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
                                                    this.state.users?.map(data =>
                                                        <div key={data.id} className="users-view">
                                                            <div className="image-user">
                                                                <img className="image-user-src" src={data.avatar_url} alt={data.login}/>
                                                            </div>
                                                            <div className="info-user">
                                                                <div className="feed-item-title">
                                                                    <div className="link-user" onClick={(e) => {
                                                                        e.preventDefault();
                                                                        window.location.href = `/user?id=${data?.id}`
                                                                    }}>
                                                                        {data?.login}
                                                                    </div>
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
                                                null
                }
            </div>
        )
    }
}

export default People;
