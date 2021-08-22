import React, { Component }  from "react";

class Notification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: "load",
            result: [],
            auth: false,
            notifications: this.props.notification
        };
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

            <div className="wrapper-feed">
                <div className="title-page">
                    Оповещения
                </div>
                <div className="feed-wrapper">
                    {
                        notifications?.length ?
                            notifications?.map(notification =>
                                notification?.is_look ?
                                    null
                                    // <div className="notifications-item background-white" style={{ background: "white"}}>
                                    //     <div className="info-notification-item feed-item-datetime">
                                    //         {this.unixToDateTime(notification?.date_time)}
                                    //     </div>
                                    //     <div className="info-notification-item">
                                    //         {
                                    //             notification?.types === "post" ?
                                    //                 "Вашу заметку кто-то посмотрел"
                                    //                 :
                                    //                 null
                                    //         }
                                    //     </div>
                                    //     <div className="info-notifications-item">
                                    //         <div className="button-default"
                                    //              onClick={() => this.checkNotification(
                                    //                  notification.feeds_uuid, notification.addr)} style={{ background: "#fafafa"}}>Просмотренно</div>
                                    //     </div>
                                    // </div>
                                    :
                                    <div className="notifications-item background-white" style={{ background: "white"}}>
                                        <div className="info-notification-item feed-item-datetime">
                                            {this.unixToDateTime(notification?.date_time)}
                                        </div>
                                        <div className="info-notification-item">
                                            {
                                                notification?.types === "post" ?
                                                    "Вашу заметку кто-то посмотрел"
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
                                    Новых оповещений пока нет.
                                </div>
                            </div>
                    }

                </div>
            </div>
        )
    }
}

export default Notification;
