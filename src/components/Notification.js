import React, {Component} from "react";

class Notification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            store: this.props.store
        };

        this.state.store.subscribe(() => {
            this.setState(this.state.store.getState())
        })
    }

    componentDidMount() {

    }

    callExecutor(uuid, uwid) {
        fetch(`/api/task/`, {
            method: "POST",
            body: JSON.stringify({
                uuid: uuid,
                uid: uwid
            })
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0) {
                    // window.location.href = `/post?uuid=${uuid}`
                }
                console.log(res)

            })
            .catch(error => {
                console.log(error)
            });
    }

    checkNotification(uuid, addr) {
        fetch("/api/notification", {
            method: "PUT",
            body: JSON.stringify({
                feeds_uuid: uuid,
                addr: addr
            })
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0) {
                    window.location.href = `/post?uuid=${uuid}`
                }

            })
            .catch(error => {
                console.log(error)
            });
    }

    unixToDateTime(unixTimestamp) {
        const milliseconds = unixTimestamp * 1000
        const dateObject = new Date(milliseconds)

        return dateObject.toLocaleString()
    }

    render() {
        const state = this.state.store.getState()
        return (
            <div className="content-wall-views">
                <div className="wrapper-feed">
                    <div className="feed-wrapper">
                        {
                            state.auth.user.notifications?.length ?
                                state.auth.user.notifications?.map(notification =>
                                    notification?.is_look ?
                                        null
                                        :
                                        <div className="notifications-item background-white">
                                            <div className="info-notification-item feed-item-datetime">
                                                {this.unixToDateTime(notification?.date_time)}
                                            </div>
                                            <div className="info-notification-item">
                                                {
                                                    notification?.types === "post" ?
                                                        notification?.user_event_action ?
                                                            <div>
                                                                <span className="link-user" onClick={(e) => {
                                                                    e.preventDefault();
                                                                    window.location.href = `/user/${notification?.uwuid}`
                                                                }}>{notification?.user_event_action}</span>
                                                                <span> посмотрел Вашу заметку</span>
                                                            </div>
                                                        :
                                                            <div>
                                                                <span>Неавторизованный пользователь посмотрел Вашу заметку</span>
                                                            </div>
                                                    :
                                                        notification?.types === "comment" ?
                                                            <div>
                                                                <span className="link-user" onClick={(e) => {
                                                                    e.preventDefault();
                                                                    window.location.href = `/user/${notification?.uwuid}`
                                                                }}>{notification?.user_event_action}</span>
                                                                <span> оставил новый комментарий</span>
                                                            </div>
                                                        :
                                                            notification?.types === "task" ?
                                                                <div>
                                                                    <span className="link-user" onClick={(e) => {
                                                                        e.preventDefault();
                                                                        window.location.href = `/user/${notification?.uwuid}`
                                                                    }}>{notification?.user_event_action}</span>
                                                                    <span> хочет выполнить <a target="_blank" className="link-user" href={`/task?uuid=${notification?.feeds_uuid}`}>задачу</a></span>
                                                                </div>
                                                            :
                                                                null
                                                }
                                            </div>
                                            {
                                                notification?.types === "task" ?
                                                    <div style={{display: "flex", flexWrap: "wrap", gap: "1rem"}}>
                                                        <div className="button-default" onClick={() => this.callExecutor(
                                                            notification.feeds_uuid, notification?.uwuid)}>Отклонить
                                                        </div>
                                                        <div className="button-default" onClick={() => this.checkNotification(
                                                            notification.feeds_uuid, notification.addr)}>Отдать в работу
                                                        </div>
                                                    </div>
                                                :
                                                    <div className="info-notifications-item">
                                                        <div className="button-default" onClick={() => this.checkNotification(
                                                            notification.feeds_uuid, notification.addr)}>Перейти к заметке
                                                        </div>
                                                    </div>
                                            }
                                        </div>
                                )
                                :
                                <div className="error-wrapper">
                                    <div className="error-page">
                                        Новых событий пока нет.
                                    </div>
                                </div>
                        }
                    </div>
                </div>

            </div>

        )
    }
}

export default Notification;
