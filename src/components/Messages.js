import React, {Component} from "react";
import TextareaAutosize from "react-textarea-autosize";
import {Link} from "react-navi";
import send from "../icon/send.png"
import k from "../icon/k.png"

import song from "../sound/pop.mp3"
import gfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {tomorrow} from "react-syntax-highlighter/dist/cjs/styles/prism";
import code from "../icon/code.png";


class Messages extends Component {
    constructor(props) {
        super(props);

        let AudioContext = window.AudioContext || window.webkitAudioContext

        this.state = {
            cent: null,
            _createMessage: false,
            chats: [],
            messages: [],
            dialog: false,
            cid: null,
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
            store: this.props.store,
            openCall: false,
            isDark: "light",
            uidUserPeer: 0,
            am: false,
            stateCode: 0,
            lastTimeToLive: null
        }


        this.state.store.subscribe(() => {
            this.setState(this.state.store.getState())
            this.updateState()
        })

        this.pc1 = null
        this.pc2 = null
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

    messagesEndRef = React.createRef()
    videoMain = React.createRef()
    videoPeer = React.createRef()
    localStream = null
    streamConstraints = {"audio": true, "video": false};
    offerOptions = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 0
    }

    createMessage = (event) => {
        this.setState({
            _createMessage: true
        })
    }

    allMessage = (event) => {
        this.setState({
            _createMessage: false,
            // dialogTitle: null
        })


        if (this.state.cent_channel && this.state.cid) {
            this.state.cent_channel.unsubscribe();
            this.state.cent_channel.removeAllListeners();
        }

        if (event)
            window.history.pushState({urlPath: `/messages`}, "", `/messages`)

        fetch("/api/messages", {
            method: "GET"
        })
            .then(response => response.json())
            .then(res => {
                if (res?.status?.code === 0) {
                    this.setState({
                        chats: res?.data,
                        // dialog: false,
                        // messages: [],
                        load: true,
                        loader: false
                    })
                }
            })
            .catch(error => {
                console.log(error)
            });
    }

    unixToDateTime(unixTimestamp) {
        const dateObject = new Date(unixTimestamp)

        return dateObject.toLocaleString()
    }

    sendMessageButton = (event) => {
        const store = this.state.store.getState()

        let _this = this
        let data = {
            value: document.getElementById("message_chat").value,
            c_id: this.state.cid
        }


        let value = document.getElementById("message_chat").value

        _this.clearInput(document.getElementById("message_chat"))

        if (data.value.length > 0 && data.value.search(/[a-zA-Zа-яА-Я0-9]/i) > -1) {
            let mes = {
                created_at: new Date().getTime(),
                c_id: this.state.cid,
                value: value,
                avatar_url: store.auth.user.data.avatar_url,
                uid: store.auth.user.data.id,
                date_time: Math.round((new Date()).getTime() / 1000),
                login: store.auth.user.data.login
            }

            this.state.messages.push(mes)

            this.setState({
                messages: this.state.messages
            })
            this.scrollToBottom();

            fetch("/api/messages", {
                method: "POST",
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(res => {


                    this.read(this.state.cid)
                    this.scrollToBottom();
                })
                .catch(error => {
                    console.log(error)
                });
        }

    }

    sendMessage = (event) => {
        const store = this.state.store.getState()
        let _this = this
        let data = {
            value: event.target.value,
            c_id: this.state.cid
        }

        let value = event.target.value

        if (this.state.cent_channel) {
            this.state.cent_channel.publish(
                {
                    "input": {
                        "typing": store.auth.user.data.login
                    }
                }).then(
                function () {
                    // success ack from Centrifugo received
                }, function (err) {
                    // publish call failed with error
                }
            );
        }

        if (event.keyCode !== 13) {
            this.setState({
                stateCode: event.keyCode
            })
        }

        if (event.keyCode === 13 && this.state.stateCode !== 16 &&  value.length > 0) {
            this.setState({
                stateCode: 0
            })

            let mes = {
                created_at: new Date().getTime(),
                c_id: this.state.cid,
                value: value,
                avatar_url: store.auth.user.data.avatar_url,
                uid: store.auth.user.data.id,
                date_time: Math.round((new Date()).getTime() / 1000),
                login: store.auth.user.data.login
            }

            this.state.messages.push(mes)

            this.setState({
                messages: this.state.messages
            })

            this.scrollToBottom();
            event.preventDefault();
            _this.clearInput(event.target)

            if (data.value.length > 0) {
                fetch("/api/messages", {
                    method: "POST",
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(res => {
                        // _this.clearInput(event.target)

                        this.read(this.state.cid)
                        // this.scrollToBottom();
                    })
                    .catch(error => {
                        console.log(error)
                    });
            }

        }


        // this.read(this.state.cid)

    }

    components = {
        code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
                <SyntaxHighlighter style={tomorrow} wrapLongLines={false} language={match[1]} PreTag="div"
                                   children={String(children).replace(/\n$/, '')} {...props} />
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            )
        }
    }

    clearInput(target) {
        target.value = target.value.replace(/[\n\r]/g, '')
        target.value = ''
        target.style.height = "50px"
    }

    updateState() {
        if (this.state.dialog) {
            let path = `/api/messages/${this.state.cid}`

            fetch(path, {
                method: "GET"
            })
                .then(response => response.json())
                .then(res => {
                    if (res?.status?.code === 0) {
                        this.setState({
                            messages: res.data.sort(function (x, y) {
                                return Math.round(
                                    new Date(x.created_at).getTime() * 1000
                                ) > Math.round(
                                    new Date(y.created_at).getTime() * 1000
                                ) ? 1 : -1;
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
            this.allMessage()
        }
    }

    openDialog(cid) {
        // this.setState({
        //     loader: true
        // })

        setTimeout(()=>{
            let blockChat = document.getElementById(cid)
            blockChat.style.background = "var(--hover-message-dialog)"
        }, 1000)

        const store = this.state.store.getState()
        let _this = this
        let path = `/api/messages/${cid}`

        window.history.pushState({urlPath: `/messages?cid=${cid}`}, "", `/messages?cid=${cid}`)

        let cent_channel = store.centrifuge.object.subscribe(cid, async function (message) {
            let data = _this.state.messages

            if (message.data?.input?.typing !== store.auth.user.data.login) {
                if (message.data?.input?.typing) {
                    _this.setState({
                        typing: `${message?.data?.input?.typing} набирает сообщение.`
                    })
                    try {
                        document.getElementById("hide-typing").style.display = "block"
                        setTimeout(() => {
                            document.getElementById("hide-typing").style.display = "none"
                        }, 5000)
                    } catch (err) {
                        console.error(err)
                    }
                }
            }

            switch (message?.data?.type) {
                case "offer":
                    if (message?.data?.uid === _this.state.uidUserPeerMainUUID)
                        console.log(message?.data?.offer)
                    message?.data?.offer && await _this.onOffer(message?.data?.offer);
                    break;

                case "answer":
                    if (message?.data?.uid === _this.state.uidUserPeerMainUUID) {
                        console.log(message?.data?.answer)
                        message?.data?.answer && await store.webRTC.pc.setRemoteDescription(new RTCSessionDescription(message?.data?.answer))
                    }
                    break;

                case "connected":
                    if (message?.data?.uid !== _this.state.uidUserPeerMainUUID) {
                        // await _this.call()
                        // await _this.openCall(_this.localStream)
                        await _this.createOffer();
                    }
                    break;

                case "candidate":
                    if (message?.data?.uid === _this.state.uidUserPeerMainUUID) {

                        // ICE candidate configuration.
                        let candidate = new RTCIceCandidate({
                            sdpMLineIndex: message?.data?.label,
                            candidate: message?.data?.candidate,
                        })


                        await store.webRTC.pc.addIceCandidate(candidate)
                        console.log(candidate)
                        console.log(store.webRTC.pc.signalingState)
                    }
                    break;
                case "answer_on_user":
                    if (!_this.state.am) {
                        await _this.start()
                    }
                    break

                case "ready":
                    if (message?.data?.uid === _this.state.uidUserPeerMainUUID) {
                        await _this.createOffer();
                    }
                    break

                case "crypto_id":
                    if (message?.data?.uid !== _this.state.uidUserPeerMainUUID && message?.data?.uid) {
                        console.log(message?.data?.uid)
                        _this.setState({
                            uidUserPeer: message?.data?.uid
                        })
                    }
                    break;
                default:
                    console.log(0)
            }


            if (message?.data?.login) {
                if (message?.data?.login !== store.auth.user.data.login) {
                    _this.state.context.resume().then(() => {
                        _this.state.audio.play();
                    });
                }
                if (message.data.uid !== store.auth.user.data.id) {
                    data.push(message?.data)
                    _this.setState({messages: data})
                    _this.scrollToBottom();
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
                if (res?.status?.code === 0) {


                    this.setState({
                        messages: res.data.sort(function (x, y) {
                            return Math.round(
                                new Date(x.created_at).getTime() * 1000
                            ) > Math.round(
                                new Date(y.created_at).getTime() * 1000
                            ) ? 1 : -1;
                        }),
                        dialog: true,
                        cid: cid,
                        dialogTitle: res?.title_dialog,
                        linkUser: res?.id_user,
                        avatar: res?.avatar,
                        lastTimeToLive: res?.last_time_to_live,
                        loader: false,
                        load: true
                    })

                    this.scrollToBottom();


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

        setTimeout(()=>{
            let blockChat = document.getElementById(cid)
            blockChat.style.background = "var(--hover-message-dialog)"
        }, 500)

        if (cid) {
            this.setState({
                cid: cid,
                // chats: [1]
            })

            this.openDialog(cid)
        }
        this.allMessage()
    }

    async getMediaStream() {
        const store = this.state.store.getState()

        //  Старые браузеры не поддерживают новое свойство mediaDevices
        //  По этому сначала присваиваем пустой объект

        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }

        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function (constraints) {

                let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.GetUserMedia;

                if (!getUserMedia) {
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }

                return new Promise(function (resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        }

        this.localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: false})

        this.state.store.dispatch({
            type: "ACTION_SET_STREAM", value: this.localStream
        })

        if (!this.state.am) {
            this.state.cent_channel.publish({
                type: "ready",
                uid: this.state.uidUserPeer
            }).then(
                function () {
                    // success ack from Centrifugo received
                }, function (err) {
                    // publish call failed with error
                }
            )
        }

        await this.openCall(store.stream)
    };

    textToHTML(str) {
        // Otherwise, create div and append HTML
        let dom = document.createElement('div');
        dom.innerHTML = str;
        return dom;
    };

    componentDidMount() {
        this.getPreferredColorScheme()
        window.matchMedia('(prefers-color-scheme: dark)').onchange = (event) => {
            this.getPreferredColorScheme()
        };

        this.changerPage()
    }

    scrollToBottom = () => {
        this.messagesEndRef.current.scrollIntoView({behavior: 'smooth'})
    }

    async start(e) {

        this.setState({
            openCall: !this.state.openCall
        })
        // await this.getUserMedia_click()

        await this.getMediaStream()

        console.log(this.state.uidUserPeerMainUUID)

    }


    async call(id) {

        // this.setState({
        //     am: true
        // })
        //
        // // this.state.store.dispatch({
        // //     type: "ACTION_SET_WEBRTC", value: {
        // //         pc: new RTCPeerConnection(
        // //             {
        // //                 iceServers: [
        // //                     {
        // //                         urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        // //                     },
        // //                 ]
        // //             })
        // //     }
        // // })
        //
        await this.getMediaStream()

        fetch(`/api/call/${id}`, {
            method: "GET"
        })
            .then(response => response.json())
            .then(res => {
                this.state.store.dispatch({
                    type: "ACTION_SET_CALL", value: {
                        status: "Ждем ответа",
                        state: true,
                        audio: new Audio(),
                        cc: res.data.cc
                    }
                })

                this.state.store.dispatch({
                    type: "ACTION_SET_AM", value: true,
                })

            })
    }

    async openCall(gumStream) {
        const store = this.state.store.getState()

        for (const track of gumStream.getTracks()) {
            store.webRTC.pc.addTrack(track, gumStream);
        }
    }

    async createOffer() {
        let this_ = this
        const store = this.state.store.getState()

        let offer
        try {
            offer = await store.webRTC.pc.createOffer()
            await store.webRTC.pc.setLocalDescription(offer)

            console.log("create offer", offer)
            this.state.cent_channel.publish(
                {
                    type: "offer",
                    offer: store.webRTC.pc.localDescription,
                    uid: this_.state.uidUserPeer
                }).then(
                function () {
                    // success ack from Centrifugo received
                }, function (err) {
                    // publish call failed with error
                }
            )
        } catch (error) {
            console.error(error)
        }
    }

    async onOffer(event) {
        const store = this.state.store.getState()
        let this_ = this

        await store.webRTC.pc.setRemoteDescription(event)

        if (store.webRTC.pc.signalingState !== 'stable') {
            let answer = await store.webRTC.pc.createAnswer()
            await store.webRTC.pc.setLocalDescription(answer)

            console.log(store.webRTC.pc.localDescription)

            this.state.cent_channel.publish({
                type: "answer",
                answer: store.webRTC.pc.localDescription,
                uid: this_.state.uidUserPeer
            }).then(
                function () {
                    // success ack from Centrifugo received
                }, function (err) {
                    // publish call failed with error
                }
            )
        } else {

        }
    }

    convertNewLinesToBr(str) {
        str = str.replace(/(?:\r\n|\r|\n)/g, '<br />');
        return str;
    }

    getUserMedia_success(stream) {
        this.videoMain.current.srcObject = new MediaStream(stream)
        this.videoMain.current.play()

        this.localStream = stream
    }

    getUserRemote(stream) {
        console.log(stream)
        this.videoPeer.current.srcObject = new MediaStream(stream)
        this.videoPeer.current.play()
        this.localStream = stream
    }

    async getUserMedia_click() {
        const stream = await navigator.mediaDevices.getUserMedia(this.streamConstraints);
        this.getUserMedia_success(stream)
    }

    time2TimeAgo(ts) {
        // This function computes the delta between the
        // provided timestamp and the current time, then test
        // the delta for predefined ranges.

        let d=new Date();  // Gets the current time
        let nowTs = Math.floor(d.getTime()/1000); // getTime() returns milliseconds, and we need seconds, hence the Math.floor and division by 1000
        let seconds = nowTs - (new Date(ts).getTime()/1000);

        // more that two days
        if (seconds > 2*24*3600) {
            return "Был(а) 5 дней назад";
        }
        // a day
        if (seconds > 24*3600) {
            return "Был(а) вчера";
        }

        if (seconds > 3600) {
            return "Был(а) 5 часов назад";
        }
        if (seconds > 1800) {
            return "Был(а) полчаса назад";
        }
        if (seconds > 60) {
            return "Был(а) " + Math.floor(seconds/60) + " минут назад";
        }
        if (seconds < 60) {
            return "Online";
        }
    }

    render() {

        const store = this.state.store.getState()

        if (this.state.load) {
            if (!store.components.settings.messenger && store.auth.user.scope !== 'admin') {
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
            } else {
                return (
                    <>
                        <div className="content-wall-views">
                            <div className="wrapper-content-default">
                                {
                                    this.state.loader ?
                                        <div className="wrapper-chats-main">
                                            <div className="lable-dialogs-list">
                                                Все чаты
                                            </div>
                                            <div className="chats-list">
                                                {/*<div className="loader-wrapper feed-wrapper">*/}
                                                {/*    <div className="loader">*/}

                                                {/*    </div>*/}
                                                {/*</div>*/}
                                            </div>
                                        </div>
                                        :
                                        this.state.chats.length === 0 ?
                                            <div className="wrapper-chats-main">
                                                <div className="lable-dialogs-list">
                                                    Все чаты
                                                </div>
                                                <div className="chats-list">
                                                    <div className="info-user-chat" style={{color: "var(--font-color)"}}>
                                                        Активных чатов пока нет
                                                    </div>
                                                </div>
                                            </div>
                                            :
                                            <div className="wrapper-chats-main">
                                                <div className="lable-dialogs-list">
                                                    Все чаты
                                                </div>
                                                <div className="chats-list">
                                                    {
                                                        // onClick={() => this.openDialog(chat.c_id)}
                                                        this.state.chats.map(chat =>
                                                            chat.no_read_count ?
                                                                <div
                                                                    className="feed-wrapper-item-chat chat-flex-row"
                                                                    style={{
                                                                        marginBottom: 0,
                                                                        background: "var(--hover-message-dialog)"
                                                                    }}
                                                                    onClick={() => this.openDialog(chat.c_id)} id={chat.c_id}>
                                                                    <div className="photo-wrapper-chat">
                                                                        <img src={chat.avatar_url}
                                                                             alt={chat.avatar_url}/>
                                                                    </div>
                                                                    <div className="feed-item-title" style={{
                                                                        padding: "13px",

                                                                    }}>
                                                                            <span
                                                                                className="test-stat">{chat.login}</span>
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
                                                                <div
                                                                    className="feed-wrapper-item-chat chat-flex-row"
                                                                    style={{marginBottom: 0}}
                                                                    onClick={() => this.openDialog(chat.c_id)} id={chat.c_id}>
                                                                    <div className="photo-wrapper-chat">
                                                                        <img src={chat.avatar_url}
                                                                             alt={chat.avatar_url}/>
                                                                    </div>
                                                                    <div className="feed-item-title" style={{
                                                                        padding: "13px",
                                                                    }}>
                                                                            <span
                                                                                className="test-stat">{chat.login}</span>
                                                                        <div className="feed-item-datetime">
                                                                            {chat.last_message?.substring(0, 40) + "..."}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                }
                                {
                                    this.state.dialog ?
                                        <>
                                            <div className="wrapper-chat">
                                                <div className="messages-control-nav">
                                                    <div className="messages-control-nav-item">

                                                        {/*<div className="title-dialog">*/}
                                                        {/*    <a className="link_github" target="_blank"*/}
                                                        {/*       href={"/user/" + this.state.linkUser}*/}
                                                        {/*       rel="noreferrer">{this.state.dialogTitle}</a>*/}
                                                        {/*</div>*/}
                                                        {/*<div className="photo-wrapper">*/}
                                                        {/*    <img src={this.state.avatar}*/}
                                                        {/*         alt={this.state.dialogTitle}*/}
                                                        {/*         style={{maxWidth: "28px"}}*/}
                                                        {/*    />*/}
                                                        {/*</div>*/}

                                                        <div className="avatar-wrapper">
                                                            <Link href={`/user/${this.state.id_user}`}>
                                                                <img src={this.state.avatar}
                                                                     alt={this.state.dialogTitle}
                                                                />
                                                            </Link>
                                                        </div>
                                                        <div className="block-title-chat">
                                                            <Link href={`/user/${this.state.id_user}`}>
                                                                <div className="title-dialog">
                                                                    {this.state.dialogTitle}
                                                                </div>
                                                            </Link>
                                                            <div
                                                                className="feed-item-datetime">
                                                                {
                                                                    this.time2TimeAgo(this.state.lastTimeToLive)
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="wrapper-items" id="messages" style={{
                                                    // background: "#fff"
                                                }}>
                                                    {

                                                        this.state.messages?.map(message =>
                                                            store.auth.user.data.id === message.uid ?
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
                                                                                <Link
                                                                                    href={`/user/${message?.uid}`}>
                                                                                    <div className="link-user">
                                                                                        {message?.login}
                                                                                    </div>
                                                                                </Link>
                                                                                <div
                                                                                    className="feed-item-datetime">
                                                                                    {
                                                                                        new Date(
                                                                                            Math.round(
                                                                                                new Date(message.created_at).getTime() / 1000
                                                                                            ) * 1000
                                                                                        ).toLocaleString()
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                            <ReactMarkdown className="value-post" remarkPlugins={[gfm]}
                                                                                           components={this.components}>
                                                                                {message.value}
                                                                            </ReactMarkdown>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                :
                                                                <div className="message-item flex-start"
                                                                     style={{
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
                                                                        <Link href={`/user/${message.uid}`}>
                                                                            <div className="photo-wrapper">
                                                                                <img src={message.avatar_url}
                                                                                     alt={message.login}
                                                                                />
                                                                            </div>
                                                                        </Link>
                                                                        <div className="value-post">
                                                                            <div className="feed-item-title">
                                                                                <Link
                                                                                    href={`/user/${message?.uid}`}>
                                                                                    <div className="link-user">
                                                                                                <span
                                                                                                    className="test-stat">{message?.login}</span>
                                                                                    </div>
                                                                                </Link>
                                                                                <div
                                                                                    className="feed-item-datetime">
                                                                                    {
                                                                                        new Date(
                                                                                            Math.round(
                                                                                                new Date(message.created_at).getTime() / 1000
                                                                                            ) * 1000
                                                                                        ).toLocaleString()
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                            <ReactMarkdown className="value-post" remarkPlugins={[gfm]}
                                                                                           components={this.components}>
                                                                                {message.value}
                                                                            </ReactMarkdown>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                        )
                                                    }
                                                    <div ref={this.messagesEndRef}/>
                                                </div>
                                                <div className="view-typing-text">
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
                                                    <div className="wrapper-input">
                                                        <TextareaAutosize
                                                            onKeyDown={this.sendMessage}
                                                            placeholder="Введите сообщение"
                                                            autoFocus={true}
                                                            maxRows={15}
                                                            id="message_chat"
                                                            style={{
                                                                borderRadius: "5px"
                                                            }}
                                                        >

                                                        </TextareaAutosize>
                                                        <div className="send-button"
                                                             onClick={this.sendMessageButton}>
                                                            <img src={send} alt="send"/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                        :
                                        <>
                                            <div className="wrapper-chat">
                                                <div className="info-user-chat">
                                                    <div style={{color: "var(--font-color)"}}>
                                                        Выберите чат чтобы начать общаться
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                }
                            </div>
                        </div>
                        <div className="tags-view"/>
                    </>
                );
            }
        } else {
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
