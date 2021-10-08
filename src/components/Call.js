import React, {Component} from "react";
import {sha256} from 'js-sha256';
import Draggable from 'react-draggable';
import callMe from "../sound/callMe.mp3";
import mic from "../icon/mic.png"
import mic_mute from "../icon/mic_mute.png"

import mic_dark from "../icon/mic_dark.png"
import mic_mute_dark from "../icon/mic_mute_dark.png"

import drop_call from "../icon/drop_call.png"
import drop_call_dark from "../icon/drop_call_dark.png"


// import video from "../icon/video.png";

class Call extends Component {
    constructor(props) {
        super(props);
        this.state = {
            store: this.props.store,
            callNow: false,
            openPopUp: false,
            videoView: false,
            context: new AudioContext(),
            callMe: new Audio(callMe),
            audioPeer: new Audio(),
            name: null,
            userChannel: null,
            thisWindow: false,
            isDark: "light",
            isMuted: false,
            status: "connecting...",
            uidUserPeerMainUUID: null,
            uidUserPeer: null,
            deltaPosition: {
                x: 0,
                y: 0,
            }
        };


        this.state.store.subscribe(() => {
            this.setState(this.state.store.getState())
        })
    }

    localStream = null

    muted(){
        this.setState({
            isMuted: !this.state.isMuted
        })
    }

    cancel(){
        this.setState({
            callNow: false,
            openPopUp: false,
            thisWindow: true
        });
        this.state.context.resume().then(() => {
            this.state.callMe.pause()
        })

        console.log(this.userChannel)

        this.state.userChannel?.publish(
            {
                "type": "action_call",
                "event": "close_other"
            }).then(
            function() {
                // success ack from Centrifugo received
            }, function(err) {
                // publish call failed with error
            }
        );
    }

    async answer() {
        const store = this.state.store.getState()
        this.state.callMe.pause()
        this.setState({
            openPopUp: false,
            callNow: false,
            videoView: true,
            thisWindow: true
        });

        let c = store.centrifuge.object.subscribe(this.state.uidUserPeer, function (event){
            console.log(event)
        })

        c.publish(
            {
                "type": "answer_on_user",
                "event": "close_other"
            }).then(
            function() {
                // success ack from Centrifugo received
            }, function(err) {
                console.log(err)
            }
        );
        //
        //
        // await this.getMediaStream()
        // await this.openCall(this.localStream)
        // await this.createOffer();
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
            this.state.userChannel.publish(
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

            this.state.userChannel.publish({
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

        this.localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: false})

        // this.state.audioMain.

        // if (this.videoPeer.current.srcObject !== undefined) {
        //
        //     this.videoPeer.current.srcObject = stream
        //     this.videoPeer.current.play()
        //
        //     this.videoMain.current.srcObject = stream
        //     this.videoMain.current.play()
        //
        //     return true
        // }else{
        //     return Promise.reject(new Error('object is not have srcObject'));
        // }
    };

    playSoundCall(){
        this.state.context.resume().then(() => {
            this.setState({
                callMe: this.state.callMe.currentTime = 0
            })

            this.setState({
                callMe: this.state.callMe.loop = true
            })

            this.setState({
                callMe: this.state.callMe.play()
            })
            // this.state.callMe.currentTime = 0
            // this.state.callMe.loop = true
            // this.state.callMe.play()
        })
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

    componentDidMount() {
        const state = this.state.store.getState();
        if (state.auth.user.isAuth){
            let channelTitle = sha256(state.auth.user.data.login);

            console.log(channelTitle)
            this.eventing(channelTitle)
            this.setState({
                uidUserPeerMainUUID: sha256(state.auth.user.data.login)
            })

            this.getPreferredColorScheme()
            let colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            colorSchemeQuery.addEventListener('change', (event) => {
                this.getPreferredColorScheme()
            });

            let this_ = this

            state.webRTC.pc.ontrack = function (event){
                console.log(event)

                this_.state.audioPeer.srcObject = event.streams[0]
                this_.state.audioPeer.play()
            }

            state.webRTC.pc.onicecandidate = function (event){

                event.candidate && this_.state.userChannel.publish({
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
                console.log(state.webRTC.pc.signalingState)
            }

            state.webRTC.pc.onconnectionstatechange = async function (event) {
                console.log(state.webRTC.pc.connectionState)
                if (state.webRTC.pc.connectionState === 'connected') {
                    this_.state.userChannel.publish(
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

            this.state.audioPeer.ontimeupdate = () => {
                this_.setState({
                    status: this_.state.audioPeer.currentTime
                })
            }
        }




    }

    eventing(channelTitle){
        const state = this.state.store.getState();

        let this_ = this
        let channel = state.centrifuge.object.subscribe(channelTitle, async function (event) {
            console.log(event)


            switch (event.data?.type) {
                case "call":
                    this_.playSoundCall()
                    this_.setState({
                        name: event.data.last_name + " " + event.data.name,
                        openPopUp: true,
                        callNow: true,
                        uidUserPeer: event.data.id_channel
                    })

                    break
                case "action_call":
                    if (!this_.state.thisWindow) {
                        this_.setState({
                            callNow: false,
                            openPopUp: false,
                            thisWindow: false
                        });
                        this.state.context.resume().then(() => {
                            this.state.callMe.pause()
                        })

                    }
                    break
                case "offer":
                    if (event?.data?.uid === this_.state.uidUserPeerMainUUID)
                        // console.log(message?.data?.offer)
                        event?.data?.offer && await this_.onOffer(event?.data?.offer);
                    break;

                case "answer":
                    if (event?.data?.uid === this_.state.uidUserPeerMainUUID) {
                        // console.log(message?.data?.answer)
                        event?.data?.answer && await state.webRTC.pc.setRemoteDescription(new RTCSessionDescription(event?.data?.answer))
                    }
                    break;

                case "connected":
                    if (event?.data?.uid !== this_.state.uidUserPeerMainUUID) {
                        await this_.openCall(this_.localStream)
                        await this_.createOffer();
                    }
                    break;
                case "status_call":
                    if (event?.data?.uid === this_.state.uidUserPeerMainUUID) {
                        this_.setState({
                            videoView: true
                        })
                        await this_.getMediaStream()
                        await this_.openCall(this_.localStream)
                        await this_.createOffer();
                    }
                    break;

                case "candidate":
                    if (event?.data?.uid === this_.state.uidUserPeerMainUUID) {

                        // ICE candidate configuration.
                        let candidate = new RTCIceCandidate({
                            sdpMLineIndex: event?.data?.label,
                            candidate: event?.data?.candidate,
                        })


                        await this.state.webRTC.pc.addIceCandidate(candidate)
                        console.log(candidate)
                        console.log(state.webRTC.pc.signalingState)
                    }
                    break;
                case "crypto_id":
                    if (event?.data?.uid !== this_.state.uidUserPeerMainUUID && event?.data?.uid) {
                        console.log(event?.data?.uid)
                        this_.setState({
                            uidUserPeer: event?.data?.uid
                        })
                    }
                    break;
                default:
                        break
            }
        })

        this.setState({
            userChannel: channel
        })
    }

    handleDrag = (e, ui) => {
        const {x, y} = this.state.deltaPosition;
        this.setState({
            deltaPosition: {
                x: x + ui.deltaX,
                y: y + ui.deltaY,
            }
        });
    };

    drop(){
        const state = this.state.store.getState();
        state.webRTC.pc.close()
        this.setState({
            videoView: false
        })
        window.reload()
    }

    render() {
        let {callNow, name} = this.state;
        const store = this.state.store.getState();

        return (
                this.state.openPopUp ?
                    <div>
                        <div className="pop-up">
                            {
                                callNow ?
                                    <div className="view-call-now">
                                        <div className="view-image-user">
                                            <img className="image-user-src-standard round-animate" src="https://devcodemylife.tech/api/storage?file_key=7df91f7d947601d6232c254e5e3888fd0cb1fe7605c44413c28f4d5ccf00feb7"  alt="user"/>
                                        </div>
                                        <div className="center">{ name }</div>
                                        <div className="view-flex margin-top">
                                            <div className="view-flex-start">
                                                <div className="button-round background-green unselectable" onClick={()=> this.answer()}>
                                                    Ответить
                                                </div>
                                            </div>
                                            <div className="view-flex-end">
                                                <div className="button-round background-red unselectable" onClick={()=> this.cancel()}>
                                                    Отклонить
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    null
                            }
                        </div>
                    </div>
                :
                    this.state.videoView || store.call.state ?
                        <Draggable onDrag={this.handleDrag}>
                            <div className="view-call-now position-call" style={{padding: "15px"}}>
                                <div className="control">
                                    <div className="status">
                                        { name || store.status_call }
                                    </div>
                                    <div className="mic">
                                        {
                                            this.state.isDark === "light" ?
                                                this.state.isMuted ?
                                                    <img style={{maxWidth: "25px"}} src={mic_mute} alt="mic" onClick={()=> this.muted()}/>
                                                :
                                                    <img style={{maxWidth: "25px"}} src={mic} alt="mic" onClick={()=> this.muted()}/>
                                            :
                                                this.state.isMuted ?
                                                    <img style={{maxWidth: "25px"}} src={mic_mute_dark} alt="mic" onClick={()=> this.muted()}/>
                                                    :
                                                    <img style={{maxWidth: "25px"}} src={mic_dark} alt="mic" onClick={()=> this.muted()}/>
                                        }

                                    </div>
                                    <div className="call-ha">
                                        {
                                            this.state.isDark === "light" ?
                                                <img style={{maxWidth: "25px"}} src={drop_call} alt="mic" onClick={()=> this.drop()}/>
                                                :
                                                <img style={{maxWidth: "25px"}} src={drop_call_dark} alt="mic" onClick={()=> this.drop()}/>

                                        }

                                    </div>
                                </div>
                            </div>
                        </Draggable>
                        :
                        null
        )
    }
}

export default Call;
