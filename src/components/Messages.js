import React, {Component} from "react";
import TextareaAutosize from "react-textarea-autosize";
import { sha256 } from 'js-sha256';
import {Link} from "react-navi";
import send from "../icon/send.png"
import k from "../icon/k.png"
import video from "../icon/video.png"
import video_dark from "../icon/video_dark.png"

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
            store: this.props.store,
            openCall: false,
            isDark: "light",
            uidUserPeer: 0
        }


        this.state.store.subscribe(() => {
            this.setState(this.state.store.getState())
            this.updateState()
        })

        this.pc1 = null
        this.pc2 = null
    }

    getPreferredColorScheme = () => {
        if(window?.matchMedia('(prefers-color-scheme: dark)').matches){
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
    streamConstraints = { "audio": true, "video": false };
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

        if (this.state.cent_channel){
            this.state.cent_channel.publish(
                {
                    "input": {
                        "typing": store.auth.user.data.login
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
                        _this.clearInput(event.target)

                        this.read(this.state.cid)
                        this.scrollToBottom();
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
        }
    }

    openDialog(cid) {
        this.setState({
            loader: true
        })

        const store = this.state.store.getState()
        //
        // // store.webRTC.pc.onicecandidate = this.onIceCandidate
        // // store.webRTC.pc.onaddstream = this.onRemoteStreamAdded
        // let this_ = this
        // store.webRTC.pc.ontrack = function({ streams: [stream] }) {
        //     this_.videoPeer.srcObject = new MediaStream(stream)
        //     this_.videoPeer.current.play()
        // };

        // this.setState({
        //     openCall: true
        // })


        // this.getUserMedia_click().then(_ => {})

        let _this = this
        let path = `/api/messages/${cid}`

        window.history.pushState({urlPath:`/messages?cid=${cid}`},"",`/messages?cid=${cid}`)

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
                        // console.log(message?.data?.offer)
                        message?.data?.offer && await _this.onOffer(message?.data?.offer);
                    break;

                case "answer":
                    if (message?.data?.uid === _this.state.uidUserPeerMainUUID) {
                        // console.log(message?.data?.answer)
                        message?.data?.answer && await store.webRTC.pc.setRemoteDescription(new RTCSessionDescription(message?.data?.answer))
                    }
                    break;

                case "connected":
                    if (message?.data?.uid !== _this.state.uidUserPeerMainUUID) {
                        await _this.call()
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
                if (res?.status?.code === 0){


                    this.setState({
                        messages: res.data.sort(function (x, y){
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

    async getMediaStream(){


        //  Старые браузеры не поддерживают новое свойство mediaDevices
        //  По этому сначала присваиваем пустой объект

        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }

        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function(constraints) {

                var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

                if (!getUserMedia) {
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }

                return new Promise(function(resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

        if (this.videoMain.current.srcObject !== undefined) {
            this.videoMain.current.srcObject = stream
            this.videoMain.current.play()

            this.localStream = stream

        }else{
            return Promise.reject(new Error('object is not have srcObject'));
        }

    };

    componentDidMount() {
        const store = this.state.store.getState()
        let this_ = this


        store.webRTC.pc.ontrack = function (event){
            console.log(event)

            this_.videoPeer.current.srcObject = event.streams[0]
            this_.videoPeer.current.play()

            // let remoteStreams = ev.streams
            // this.videoPeer.srcObject = remoteStreams[0]
        }


        store.webRTC.pc.onicecandidate = function (event){

            event.candidate && this_.state.cent_channel.publish({
                type: "candidate",
                label: event.candidate.sdpMLineIndex,
                candidate: event.candidate.candidate,
                uid: this_.state.uidUserPeer
            }).then(
                function() {
                    // success ack from Centrifugo received
                }, function(err) {
                    // publish call failed with error
                }
            );
            console.log(store.webRTC.pc.signalingState)
        }

        // // store.webRTC.pc.onnegotiationneeded = async () => {
        // //     // this.localStream.getTracks().forEach(track => store.webRTC.pc.addTrack(track, this.localStream));
        // //
        // // }
        //
        store.webRTC.pc.onconnectionstatechange = async function (event) {
            console.log(store.webRTC.pc.connectionState)
            if (store.webRTC.pc.connectionState === 'connected') {
                // await this_.createOffer();
                // await this_.openCall(this_.localStream)
                // // await this_.createOffer();
                // this_.videoMain.current.style.position = "absolute"
                // this_.videoMain.current.style.width = "20%"
                // this_.videoMain.current.style.left = "20px"
                // this_.videoMain.current.style.bottom = "20px"
                //
                //
                // this_.videoPeer.current.style.display = "block"

                this_.state.cent_channel.publish(
                    {
                        type: "connected",
                        uid: this_.state.uidUserPeer
                    }).then(
                    function () {
                        // success ack from Centrifugo received
                    }, function (err) {
                        // publish call failed with error
                    }
                )
            }
        }



        this.getPreferredColorScheme()
        let _this = this

        _this.setState({
            uidUserPeerMainUUID: sha256(store.auth.user.data.login)
        })



        let colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        colorSchemeQuery.addEventListener('change', (event) => {
            this.getPreferredColorScheme()
        });

        this.changerPage()
    }

    scrollToBottom = () => {
        this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }

    async start(e) {

        this.setState({
            openCall: !this.state.openCall
        })
        // await this.getUserMedia_click()

        await this.getMediaStream()

        console.log(this.state.uidUserPeerMainUUID)
        setInterval(() => {
            this.state.cent_channel.publish(
                {
                    type: "crypto_id",
                    uid: this.state.uidUserPeerMainUUID
                }).then(
                function() {
                    // success ack from Centrifugo received
                }, function(err) {
                    // publish call failed with error
                }
            );
        }, 5000)

    }



    async call(e) {
        await this.openCall(this.localStream)
        await this.createOffer();
    }

    async openCall(gumStream) {
        const store = this.state.store.getState()

        for (const track of gumStream.getTracks()) {
            store.webRTC.pc.addTrack(track, this.localStream);
        }
    }

    async createOffer(){
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
        }else{

        }
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
                                    {
                                        this.state.dialog ?
                                            <div>
                                                {
                                                    store.auth.user.data.testing ?
                                                        <div>
                                                            <div className="button-default" onClick={(e)=> {this.call(e)}}>
                                                                call
                                                            </div>
                                                            <div className="button-default" onClick={(e)=> this.start(e)}>
                                                                {
                                                                    this.state.isDark === "light" ?
                                                                        <img style={{maxWidth: "20px"}} src={video} alt="video_call"/>
                                                                        :
                                                                        <img style={{maxWidth: "20px"}} src={video_dark} alt="video_call"/>
                                                                }
                                                            </div>
                                                        </div>
                                                    :
                                                        null
                                                }

                                                <div className="photo-wrapper">
                                                    <img src={this.state.avatar}
                                                         alt={this.state.dialogTitle}
                                                         style={{ maxWidth: "28px" }}
                                                    />
                                                </div>
                                            </div>
                                        :
                                            null
                                    }

                                </div>
                                {
                                    this.state.openCall ?
                                        <div className="video-call">
                                            <div className="view-peer">
                                                {/*<audio ref={this.videoMain} autoPlay={true} muted={true} controls={true}/>*/}
                                                {/*<audio ref={this.videoPeer} autoPlay={true} controls={true}/>*/}
                                                <video ref={this.videoMain} autoPlay={true} muted={true} controls={false} />
                                                <video ref={this.videoPeer} autoPlay={true} controls={false}  />
                                            </div>
                                        </div>
                                        :
                                        null
                                }
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
                                                                                    <Link href={`/user/${message?.uid}`}>
                                                                                        <div className="link-user">
                                                                                            {message?.login}
                                                                                        </div>
                                                                                    </Link>
                                                                                    <div className="feed-item-datetime">
                                                                                        {
                                                                                            new Date(
                                                                                                Math.round(
                                                                                                    new Date(message.created_at).getTime() / 1000
                                                                                                ) * 1000
                                                                                            ).toLocaleString()
                                                                                        }
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
                                                                                        {
                                                                                            new Date(
                                                                                                Math.round(
                                                                                                    new Date(message.created_at).getTime() / 1000
                                                                                                ) * 1000
                                                                                            ).toLocaleString()
                                                                                        }
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
                                                        <div ref={this.messagesEndRef} />
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
