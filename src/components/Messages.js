import React, { Component } from "react";
import TextareaAutosize from "react-textarea-autosize";
import {Link} from "react-navi";
import send from "../icon/send.png"
import k from "../icon/k.png"
import song from "../sound/pop.mp3"



class Messages extends Component{
    constructor(props) {
        super(props);
        this.state = {
            auth: this.props.auth,
            cent: null,
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
            data: null,
            dialogTitle: null,
            loader: true,
            store: this.props.store
        }


        this.state.store.subscribe(() => {
            this.setState(this.state.store.getState())
            this.updateState()
        })
    }

    createMessage = (event) => {
        this.setState({
            _createMessage: true
        })
    }

    allMessage = (event) => {
        this.setState({
            _createMessage: false,
            dialogTitle: null
        })


        if (this.state.cent_channel && this.state.cid) {
            this.state.cent_channel.unsubscribe();
            this.state.cent_channel.removeAllListeners();
        }

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
                        messages: [],
                        loader: false
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



        let value = document.getElementById("message_chat").value

        _this.clearInput(document.getElementById("message_chat"))

        if (data.value.length > 0 && data.value.search(/[a-zA-Zа-яА-Я0-9]/i) > -1) {
            let mes = {
                c_id: this.state.cid,
                value: value,
                avatar_url: this.state.user[0].avatar_url,
                uid: this.state.user[0].id,
                date_time: Math.round((new Date()).getTime() / 1000),
                login: this.state.user[0].login
            }

            this.state.messages.push(mes)

            this.setState({
                messages: this.state.messages
            })
            if (document.getElementById('messages'))
                document.getElementById('messages').scrollTo({top: document.getElementById('messages').scrollHeight, left: 0, behavior: 'smooth' });

            fetch("/api/messages", {
                method: "POST",
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(res => {


                    this.read(this.state.cid)

                    if (document.getElementById('messages'))
                        document.getElementById('messages').scrollTo({top: document.getElementById('messages').scrollHeight, left: 0, behavior: 'smooth' });
                })
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

        let value = event.target.value

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
        if (event.keyCode===13 && value.search(/[a-zA-Zа-яА-Я0-9]/i) > -1){
            let mes = {
                c_id: this.state.cid,
                value: value,
                avatar_url: this.state.user[0].avatar_url,
                uid: this.state.user[0].id,
                date_time: Math.round((new Date()).getTime() / 1000),
                login: this.state.user[0].login
            }

            this.state.messages.push(mes)

            this.setState({
                messages: this.state.messages
            })

            if (document.getElementById('messages'))
                document.getElementById('messages').scrollTo({top: document.getElementById('messages').scrollHeight, left: 0, behavior: 'smooth' });
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


                        this.read(this.state.cid)

                        if (document.getElementById('messages'))
                            document.getElementById('messages').scrollTo({top: document.getElementById('messages').scrollHeight, left: 0, behavior: 'smooth' });
                    })
                    .catch(error => {
                        console.log(error)
                    });
            }

        }


        // this.read(this.state.cid)

    }

    clearInput(target) {
        target.value = target.value.replace(/[\n\r]/g, '')
        target.value = ''
        target.style.height = "50px"
    }

    updateState(){
        if (this.state.dialog) {
            let path = `/api/messages/${this.state.cid}`

            fetch(path, {
                method: "GET"
            })
                .then(response => response.json())
                .then(res => {
                    if (res?.status?.code === 0){


                        this.setState({
                            messages: res.data.sort(function (x, y){
                                return x.date_time > y.date_time ? 1 : -1;
                            }),
                            dialog: true,
                            cid: this.state.cid,
                            dialogTitle: res?.title_dialog,
                            linkUser: res?.id_user,
                            loader: false
                        })
                    }
                })
                .catch(error => {
                    console.log(error)
                });
        }
    }

    openDialog(cid) {
        this.setState({
            loader: true
        })

        const store = this.state.store.getState()

        let _this = this
        let path = `/api/messages/${cid}`

        window.history.pushState({urlPath:`/messages?cid=${cid}`},"",`/messages?cid=${cid}`)

        let cent_channel = store.centrifuge.object.subscribe(cid, function (message) {
            let data = _this.state.messages

            if (message.data?.input?.typing !== _this.state.user[0].login){
                if (message.data?.input?.typing){
                    _this.setState({
                        typing: `${message?.data?.input?.typing} набирает сообщение.`
                    })
                    try {
                        document.getElementById("hide-typing").style.display = "block"
                        setTimeout(() => {
                            document.getElementById("hide-typing").style.display = "none"
                        }, 5000)
                    } catch (err){
                        console.error(err)
                    }
                }
            }

            if (message?.data?.login){
                if (message?.data?.login !== _this.state.user[0].login){
                    _this.state.context.resume().then(() => {
                        _this.state.audio.play();
                    });
                }
                if (message.data.uid !== _this.state.user[0].id){
                    data.push(message?.data)
                    _this.setState({messages: data})
                    if (document.getElementById('messages'))
                        document.getElementById('messages').scrollTo({top: document.getElementById('messages').scrollHeight, left: 0, behavior: 'smooth' });
                }
            }
        })

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
                        messages: res.data.sort(function (x, y){
                            return x.date_time > y.date_time ? 1 : -1;
                        }),
                        dialog: true,
                        cid: cid,
                        dialogTitle: res?.title_dialog,
                        linkUser: res?.id_user,
                        loader: false
                    })

                    document.getElementById(
                        'messages').scrollTo(
                            {top: document.getElementById(
                                'messages').scrollHeight, left: 0, behavior: 'smooth' });

                }
            })
            .catch(error => {
                console.log(error)
            });
    }

    read(cid) {
        // let pathMessages = `/api/messages/${cid}`
        let pathReadMessages = `/api/read_messages/${cid}`


        fetch(pathReadMessages, {
            method: "POST",
            body: JSON.stringify({})
        })
            .then(response => response.json())
            .then(res => {

            })
            .catch(error => {
                this.setState({
                    auth: false,
                    load: true
                });
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
        let this_ = this
        fetch("/api/authentication", {
            method: "POST",
            body: JSON.stringify({
                "finger": window.localStorage.getItem("finger")
            })
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0){

                    this_.changerPage()

                    // this.centrifuge.subscribe(`${res.data[0].id}`, function(message) {
                    //     console.log("[ Connect updater pull ]")
                    //
                    //     let event = message.data
                    //     if(event.type === "update") {
                    //         let pathMessages = `/api/messages/${this_.state.cid}`
                    //         let pathReadMessages = `/api/read_messages/${this_.state.cid}`
                    //
                    //
                    //         fetch(pathReadMessages, {
                    //             method: "POST",
                    //             body: JSON.stringify({})
                    //         })
                    //             .then(response => response.json())
                    //             .then(_ => {
                    //                 fetch(pathMessages, {
                    //                     method: "GET"
                    //                 })
                    //                     .then(response => response.json())
                    //                     .then(res => {
                    //                         if (res?.status?.code === 0){
                    //                             this_.setState({
                    //                                 messages: res?.data,
                    //                                 dialog: true,
                    //                                 cid: res?.cid
                    //                             })
                    //
                    //
                    //
                    //                             // document.getElementById(
                    //                             //     'messages').scrollTo(
                    //                             //     {top: document.getElementById(
                    //                             //             'messages').scrollHeight, left: 0, behavior: 'smooth' });
                    //
                    //                         }
                    //                     })
                    //                     .catch(error => {
                    //                         this_.setState({
                    //                             auth: false,
                    //                             load: true
                    //                         });
                    //                     });
                    //             })
                    //             .catch(error => {
                    //                 this_.setState({
                    //                     auth: false,
                    //                     load: true
                    //                 });
                    //             });
                    //     }
                    // })

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

        this.setState({
            cent: this.centrifuge,
            loadCent: true
        })

    }

    render() {

        const store = this.state.store.getState()

        if (this.state.load) {
            if (!store.components.settings.messenger){
                return (
                    <div className="content-wall-views">
                        <div className="feed-wrapper">
                            <div className="main-place-wrapper">
                                <p>
                                    В разделе Сообщений ведутся технические работы.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }else {
                return (
                    <div className="content-wall-views">
                        <div className="wrapper-content-default">
                            <div className="messages-control-nav">
                                <div className="messages-control-nav-item">
                                    <div className="button-default" onClick={this.allMessage}>
                                        Все диалоги
                                    </div>
                                    <div className="title-dialog">
                                        <a className="link_github" target="_blank" href={"/user/" + this.state.linkUser}
                                           rel="noreferrer">{this.state.dialogTitle}</a>
                                    </div>
                                </div>
                            </div>
                            {
                                this.state.loader ?
                                    <div className="loader-wrapper feed-wrapper">
                                        <div className="loader">

                                        </div>
                                    </div>
                                    :
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
                                                        // background: "#fff"
                                                    }}>
                                                        {

                                                            this.state.messages?.map(message =>
                                                                this.state.user[0].id === message.uid ?
                                                                    <div className="message-item flex-end" style={{
                                                                        // display: "flex",
                                                                        boxShadow: "none",
                                                                        background: !message.read ? "var(--not-read-message)" : "none",
                                                                        // flexFlow: "column wrap"
                                                                    }}>
                                                                        <div className="wrapper-data" style={{
                                                                            flexDirection: "row",
                                                                            borderRadius: "10px"
                                                                        }}>
                                                                            <Link href={`/user/${message.uid}`}>
                                                                                <div className="photo-wrapper">
                                                                                    <img src={message.avatar_url}
                                                                                         alt={message.login}
                                                                                    />
                                                                                </div>
                                                                            </Link>
                                                                            <div className="value-post">
                                                                                <div className="feed-item-title">
                                                                                    <Link href={`/user/${message?.uid}`}>
                                                                                        <div className="link-user">
                                                                                            {message?.login}
                                                                                        </div>
                                                                                    </Link>
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
                                                                        background: !message.read ? "var(--not-read-message)" : "none",
                                                                        boxShadow: "none",
                                                                        // flexFlow: "column wrap"
                                                                    }}
                                                                         onMouseEnter={() => {
                                                                             this.read(message.c_id)
                                                                         }}
                                                                    >
                                                                        <div className="wrapper-data" style={{
                                                                            flexDirection: "row",
                                                                            borderRadius: "10px"
                                                                        }}>
                                                                            <Link href={`/user/${message.uid}`} >
                                                                                <div className="photo-wrapper">
                                                                                    <img src={message.avatar_url}
                                                                                         alt={message.login}
                                                                                    />
                                                                                </div>
                                                                            </Link>
                                                                            <div className="value-post">
                                                                                <div className="feed-item-title">
                                                                                    <Link href={`/user/${message?.uid}`} >
                                                                                        <div className="link-user">
                                                                                            <span
                                                                                                className="test-stat">{message?.login}</span>
                                                                                        </div>
                                                                                    </Link>
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
                                                        // onClick={() => this.openDialog(chat.c_id)}
                                                        this.state.chats.map(chat =>
                                                            chat.no_read_count ?
                                                                <div className="feed-wrapper-item-chat chat-flex-row"
                                                                     style={{
                                                                         marginBottom: 0,
                                                                         background: "var(--hover-message-dialog)"
                                                                     }}
                                                                     onClick={() => this.openDialog(chat.c_id)}>
                                                                    <div className="photo-wrapper-chat">
                                                                        <img src={chat.avatar_url}
                                                                             alt={chat.avatar_url}/>
                                                                    </div>
                                                                    <div className="feed-item-title" style={{
                                                                        padding: "13px",

                                                                    }}>
                                                                        <span className="test-stat">{chat.login}</span>
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
                                                                        <img src={chat.avatar_url}
                                                                             alt={chat.avatar_url}/>
                                                                    </div>
                                                                    <div className="feed-item-title" style={{
                                                                        padding: "13px",
                                                                    }}>
                                                                        <span className="test-stat">{chat.login}</span>
                                                                        <div className="feed-item-datetime">
                                                                            {chat.last_message?.substring(0, 40) + "..."}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                        )
                                                    }
                                                </div>

                            }
                        </div>
                    </div>

                );
            }
        }else{
            return (
                <div className="loader-wrapper feed-wrapper">
                    <div className="loader">

                    </div>
                </div>
            )
        }
    }
}

export default Messages;
