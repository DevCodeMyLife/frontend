import React, { Component } from "react";
import TextareaAutosize from "react-textarea-autosize";
import send from "../icon/send.png"
import k from "../icon/k.png"
import song from "../sound/pop.mp3"
import notes from "../icon/notes.png";
import messages from "../icon/messages.png";
import { Link } from "react-navi";
import Centrifuge from "centrifuge";
import user from "../icon/user.png";

const CONFIG = {
    url: document.location.host === "localhost" ? `ws://${document.location.host}/cent/connection/websocket` : `wss://${document.location.host}/cent/connection/websocket`
};


class Messages extends Component{
    constructor(props) {
        super(props);
        this.state = {
            auth: this.props.auth,
            cent: {},
            _createMessage: false,
            chats: [],
            messages: [],
            dialog: false,
            cid: null,
            user: this.props.user,
            cent_channel: null,
            typing: null,
            context: new AudioContext(),
            audio: new Audio(song),
            loadCent: false,
            messagesCount: 0,
            load: false,
            data: null
        }
    }

    createMessage = (event) => {
        this.setState({
            _createMessage: true
        })
    }

    allMessage = (event) => {
        this.setState({
            _createMessage: false
        })

        if (this.state.cent_channel && this.state.cid) {
            this.state.cent_channel.unsubscribe(this.state.cid)
        }

        console.log(window.location.pathname)
        if (event)
            window.history.pushState({urlPath:`/messages`},"",`/messages`)

        fetch("/api/messages", {
            method: "GET"
        })
            .then(response => response.json())
            .then(res => {
                if (res?.status?.code === 0){
                    this.setState({
                        chats: res?.data,
                        dialog: false,
                        messages: []
                    })
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

    sendMessageButton = (event) => {
        let _this = this
        let data = {
            value: document.getElementById("message_chat").value,
            c_id: this.state.cid
        }

        _this.clearInput(document.getElementById("message_chat"))

        if (data.value.length > 0) {
            fetch("/api/messages", {
                method: "POST",
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(res => {})
                .catch(error => {
                    console.log(error)
                });
        }

    }

    sendMessage = (event) => {
        let _this = this
        let data = {
            value: event.target.value,
            c_id: this.state.cid
        }



        if (this.state.cent_channel){
            this.state.cent_channel.publish(
                {
                    "input": {
                        "typing": this.state.user[0].login
                    }
                }).then(
                function() {
                    // success ack from Centrifugo received
                }, function(err) {
                    // publish call failed with error
                }
            );
        }

        if (event.keyCode===13){
            event.preventDefault();
            _this.clearInput(event.target)

            if (data.value.length > 0) {
                fetch("/api/messages", {
                    method: "POST",
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(res => {
                        _this.clearInput(event.target)
                    })
                    .catch(error => {
                        console.log(error)
                    });
            }

        }
    }

    clearInput(target) {
        target.value = target.value.replace(/[\n\r]/g, '')
        target.value = ''
        target.style.height = "50px"
    }

    openDialog(cid) {
        let _this = this
        let path = `/api/messages/${cid}`

        window.history.pushState({urlPath:`/messages?cid=${cid}`},"",`/messages?cid=${cid}`)

        let cent_channel = _this.state.cent.subscribe(cid, function (message) {
            console.log("sub :" + cid)
            let data = _this.state.messages

            // console.log(message?.data.login, _this.state.user[0].login)
            // if (message?.data.login !== _this.state.user[0].login){
            //     // let notification = new Notification(message.data.login,
            //     //     { body: message.data.value.substring(0, 40) + "...", dir: 'auto', icon: message.data.avatar_url}
            //     // );
            //     // console.log(notification)
            //     _this.state.context.resume().then(() => {
            //         _this.state.audio.play();
            //         console.log('Playback resumed successfully');
            //     });
            //
            //
            // }


            if (message.data?.input?.typing !== _this.state.user[0].login){
                if (message.data?.input?.typing){
                    _this.setState({
                        typing: `${message?.data?.input?.typing} набирает сообщение.`
                    })
                    document.getElementById("hide-typing").style.display = "block"
                    setTimeout(() => {
                        document.getElementById("hide-typing").style.display = "none"
                    }, 5000)

                }
            }

            if (message?.data?.login){
                console.log(message?.data?.login, _this.state.user[0].login)
                if (message?.data?.login !== _this.state.user[0].login){
                    _this.state.context.resume().then(() => {
                        _this.state.audio.play();
                        console.log('Playback resumed successfully');
                    });
                }
                data.push(message?.data)
                _this.setState({messages: data})
                if (document.getElementById('messages'))
                    document.getElementById('messages').scrollTo({top: document.getElementById('messages').scrollHeight, left: 0, behavior: 'smooth' });
            }



            // document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight
        });

        this.setState({
            cent_channel: cent_channel
        })

        fetch(path, {
            method: "GET"
        })
            .then(response => response.json())
            .then(res => {
                if (res?.status?.code === 0){
                    this.setState({
                        messages: res?.data,
                        dialog: true,
                        cid: cid
                    })

                    document.getElementById('messages').scrollTo({top: document.getElementById('messages').scrollHeight, left: 0, behavior: 'smooth' });


                }
            })
            .catch(error => {
                console.log(error)
            });
    }

    changerPage = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const cid = urlParams.get('cid');

        if (cid){
            this.setState({
                cid: cid,
                chats: [1]
            })

            this.openDialog(cid)
        }else{
            this.allMessage()
        }
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
                        load: true,
                        data: res.data,
                        user: res.data,
                        notification_count: res.notification_count,
                        notification: res.notification,
                        token: res.token,
                        messagesCount: res.count_message
                    });
                }else{
                    this.sendLogs(res.status.message)
                    this.delete_cookie("access_token")
                }





            })
            .catch(error => {
                this.setState({
                    auth: false,
                    load: true
                });
            });

        this.centrifuge = new Centrifuge(CONFIG.url);
        this.centrifuge.setToken("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2MjYwMzI0MzEsImV4cCI6MTc4Mzc5ODgzMSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.meN08YC99TeOJZWLbMKCwxhtOA_s3RaZ1QH-YARC6CM");


        let _this = this
        this.centrifuge.on('connect', function() {
            _this.changerPage()
            console.log("[ centrifuge connected ]")
        });
        this.centrifuge.on('disconnect', function(){
            console.log("[ centrifuge disconnected ]")
        });
        this.centrifuge.connect();


        this.centrifuge.subscribe("public", function(message) {
            console.log(message);
        });


        this.setState({
            cent: this.centrifuge,
            loadCent: true
        })

    }

    render() {

        if (this.state.loadCent) {
            return (
                <div className="wrapper-content">
                    <div className="content">
                        <div id="vertical_menu" className="reviews-menu">
                            <div className="wrapper-vertical-nav" >
                                <div
                                    className="nav-item"

                                >
                                    <Link className="nav-value" href="/feeds">
                                        <div  className="icon-image" >
                                            <img  src={notes} alt="Новости" />
                                        </div>
                                        <div className="nav-value">
                                            Новости
                                        </div>
                                    </Link>
                                </div>
                                {
                                    !this.state.load ?
                                        <div className="loader-flex">
                                            <div className="loader-small" />
                                        </div>
                                        :
                                        this.state.auth ?
                                            <div>
                                                <div
                                                    className="nav-item"

                                                >
                                                    <Link className="nav-value" href={`/user?id=${this.state.data[0].id}`}>
                                                        <div  className="icon-image" >
                                                            <img src={user} alt="messages" />
                                                        </div>
                                                        <div className="nav-value">
                                                            Ваша страница
                                                        </div>
                                                    </Link>
                                                </div>
                                                <div
                                                    className="nav-item"

                                                >
                                                    {
                                                        this.state.messagesCount ?
                                                            <div className="counter-notification" id="counter_notification" path="/messages" >
                                                                {
                                                                    this.state.messagesCount > 10 ?
                                                                        "10+"
                                                                        :
                                                                        this.state.messagesCount
                                                                }
                                                            </div>
                                                            :
                                                            null
                                                    }
                                                    <Link className="nav-value" href="/messages">
                                                        <div  className="icon-image" >
                                                            <img src={messages} alt="messages" />
                                                        </div>
                                                        <div className="nav-value">
                                                            Мессенджер
                                                        </div>
                                                    </Link>
                                                </div>
                                            </div>
                                            : null
                                }
                                {/*<div*/}
                                {/*    className="nav-item"*/}


                                {/*>*/}
                                {/*    <Link href="/about" className="nav-value">*/}
                                {/*        <div  className="icon-image">*/}
                                {/*            <img path="/about" src={about}/>*/}
                                {/*        </div>*/}
                                {/*        <div className="nav-value">*/}
                                {/*            Поддержка*/}
                                {/*        </div>*/}
                                {/*    </Link>*/}

                                {/*</div>*/}
                            </div>
                        </div>
                        <div className="content-wall-views">
                            <div className="wrapper-content-default">
                                <div className="messages-control-nav">
                                    <div className="messages-control-nav-item">
                                        <div className="button-default" onClick={this.allMessage}>
                                            Все диалоги
                                        </div>
                                        {/*<div className="button-default" onClick={this.createMessage}>*/}
                                        {/*    Написать*/}
                                        {/*</div>*/}
                                    </div>
                                </div>
                                {
                                    this.state._createMessage ?
                                        <div className="wrapper-maker-message">
                                            <div className="maker-message">
                                                <div className="wrapper-maker-message-input">
                                                    <input className="in" placeholder="Кому"/>
                                                </div>
                                                <div className="wrapper-maker-message-input">
                                                    <TextareaAutosize
                                                        placeholder="Введите Ваше сообщение"
                                                        minRows={15}
                                                    >

                                                    </TextareaAutosize>
                                                </div>

                                                <div className="wrapper-flex-end">
                                                    <div className="button-default">
                                                        Отправить
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        this.state.chats.length < 1 ?
                                            <div className="error-page">
                                                Вы не создали еще ни одного диалога, либо Вам никто не написал.
                                            </div>
                                            :
                                            this.state.dialog ?
                                                <div className="wrapper-chat">
                                                    <div className="wrapper-items" id="messages" style={{
                                                        background: "#fff"
                                                    }}>
                                                        {

                                                            this.state.messages?.map(message =>
                                                                this.state.user[0].id === message.uid ?
                                                                    <div className="message-item flex-end" style={{
                                                                        // display: "flex",
                                                                        boxShadow: "none",
                                                                        // flexFlow: "column wrap"
                                                                    }}>
                                                                        <div className="wrapper-data" style={{
                                                                            flexDirection: "row",
                                                                            borderRadius: "10px"
                                                                        }}>
                                                                            <div className="photo-wrapper">
                                                                                <img src={message.avatar_url} alt={message.login}
                                                                                     onClick={(e) => {
                                                                                         e.preventDefault();
                                                                                         window.location.href = `/user?id=${message.uid}`
                                                                                     }}/>
                                                                            </div>
                                                                            <div className="value-post">
                                                                                <div className="feed-item-title">
                                                                                    <div className="link-user" onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        window.location.href = `/user?id=${message?.uid}`
                                                                                    }}>
                                                                                        {message?.login}
                                                                                    </div>
                                                                                    <div className="feed-item-datetime">
                                                                                        {this.unixToDateTime(message?.date_time)}
                                                                                    </div>
                                                                                </div>
                                                                                <p>
                                                                                    {message.value}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    :
                                                                    <div className="message-item flex-start" style={{
                                                                        // display: "flex",
                                                                        boxShadow: "none",
                                                                        // flexFlow: "column wrap"
                                                                    }}>
                                                                        <div className="wrapper-data" style={{
                                                                            flexDirection: "row",
                                                                            borderRadius: "10px"
                                                                        }}>
                                                                            <div className="photo-wrapper">
                                                                                <img src={message.avatar_url} alt={message.login}
                                                                                     onClick={(e) => {
                                                                                         e.preventDefault();
                                                                                         window.location.href = `/user?id=${message.uid}`
                                                                                     }}/>
                                                                            </div>
                                                                            <div className="value-post">
                                                                                <div className="feed-item-title">
                                                                                    <div className="link-user" onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        window.location.href = `/user?id=${message?.uid}`
                                                                                    }}>
                                                                                        {message?.login}
                                                                                    </div>
                                                                                    <div className="feed-item-datetime">
                                                                                        {this.unixToDateTime(message?.date_time)}
                                                                                    </div>
                                                                                </div>
                                                                                <p>
                                                                                    {message.value}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                            )
                                                        }
                                                        <div className="typing_user" id="typing_user">
                                                            <div className="hide-typing" id="hide-typing">
                                                                <div className="image-icon-typing">
                                                                    <img src={k} alt="typing"/>
                                                                </div>
                                                                <div className="typing-text">
                                                                    {this.state.typing}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="wrapper-input">
                                                        <TextareaAutosize
                                                            onKeyDown={this.sendMessage}
                                                            placeholder="Введите сообщение"
                                                            autoFocus={true}
                                                            maxRows={15}
                                                            id="message_chat"
                                                            style={{
                                                                borderRadius: "30px"
                                                            }}
                                                        >

                                                        </TextareaAutosize>
                                                        <div className="send-button" onClick={this.sendMessageButton}>
                                                            <img src={send} alt="send"/>
                                                        </div>
                                                    </div>
                                                </div>
                                                :
                                                <div className="wrapper-chats-main">
                                                    {
                                                        this.state.chats.map(chat =>
                                                            chat.no_read_count ?
                                                                <div className="feed-wrapper-item-chat chat-flex-row"
                                                                     style={{marginBottom: 0, background: "#d7e4fc"}}
                                                                     onClick={() => this.openDialog(chat.c_id)}>
                                                                    <div className="photo-wrapper-chat">
                                                                        <img src={chat.avatar_url} alt={chat.avatar_url}/>
                                                                    </div>
                                                                    <div className="feed-item-title" style={{
                                                                        padding: "13px",

                                                                    }}>
                                                                        {chat.login}
                                                                        <div className="feed-item-datetime">
                                                                            {chat.last_message?.substring(0, 40) + "..."}
                                                                        </div>
                                                                    </div>
                                                                    {/*<div className="feed-item-title" style={{*/}
                                                                    {/*    textAlign: "center",*/}
                                                                    {/*    padding: "5px",*/}
                                                                    {/*    width: "170px"*/}
                                                                    {/*}}>*/}
                                                                    {/*    <div className="last-message">*/}
                                                                    {/*        {chat.last_message?.substring(0, 40) + "..."}*/}
                                                                    {/*    </div>*/}
                                                                    {/*</div>*/}
                                                                </div>
                                                                :
                                                                <div className="feed-wrapper-item-chat chat-flex-row"
                                                                     style={{marginBottom: 0}}
                                                                     onClick={() => this.openDialog(chat.c_id)}>
                                                                    <div className="photo-wrapper-chat">
                                                                        <img src={chat.avatar_url} alt={chat.avatar_url}/>
                                                                    </div>
                                                                    <div className="feed-item-title" style={{
                                                                        padding: "13px",
                                                                    }}>
                                                                        {chat.login}
                                                                        <div className="feed-item-datetime">
                                                                            {chat.last_message?.substring(0, 40) + "..."}
                                                                        </div>
                                                                    </div>
                                                                    {/*<div className="feed-item-title" style={{*/}
                                                                    {/*    textAlign: "center",*/}
                                                                    {/*    padding: "5px",*/}
                                                                    {/*    width: "170px"*/}
                                                                    {/*}}>*/}
                                                                    {/*    <div className="last-message">*/}
                                                                    {/*        {chat.last_message?.substring(0, 40) + "..."}*/}
                                                                    {/*    </div>*/}
                                                                    {/*</div>*/}
                                                                </div>
                                                        )
                                                    }
                                                </div>


                                }

                            </div>
                        </div>
                    </div>
                </div>
            );
        }else{
            return null
        }
    }
}

export default Messages;
