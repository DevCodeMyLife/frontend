import React, { Component }  from "react";

class Notification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: "load",
            result: [],
            auth: false,
            notifications: null
        };
    }

    componentDidMount() {
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
                        notifications: res.notification,
                    });
                }
                this.setState({
                    load: true
                });

            })
            .catch(error => {
                // console.log(error)
                this.setState({
                    auth: false,
                    load: true,
                    token: 'asd'
                });
            });
    }

    checkNotification(uuid, addr){
        fetch("/api/notification", {
            method: "PUT",
            body: JSON.stringify({
                feeds_uuid: uuid,
                addr: addr
            })
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0){
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
        const { notifications } = this.state;
        return (

                    <div className="content-wall-views">
                        <div className="wrapper-feed">
                            <div className="feed-wrapper">
                                {
                                    notifications?.length ?
                                        notifications?.map(notification =>
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
                                                                "Вашу заметку посмотрели"
                                                                :
                                                                notification?.types === "comment" ?
                                                                    "У Вас новый комментарий"
                                                                    :
                                                                        null
                                                        }
                                                    </div>
                                                    <div className="info-notifications-item">
                                                        <div className="button-default" onClick={() => this.checkNotification(
                                                            notification.feeds_uuid, notification.addr)}>Перейти к заметке</div>
                                                    </div>
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
