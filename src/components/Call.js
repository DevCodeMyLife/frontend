import React, {Component} from "react";
import {sha256} from 'js-sha256';
import Draggable from 'react-draggable';
import audioCallSong from "../sound/callMe.mp3";
import mic from "../icon/mic.png"
import mic_mute from "../icon/mic_mute.png"

import mic_dark from "../icon/mic_dark.png"
import mic_mute_dark from "../icon/mic_mute_dark.png"

import drop_call from "../icon/drop_call.png"
import drop_call_dark from "../icon/drop_call_dark.png"


class Call extends Component {
    constructor(props) {

        let AudioContext = window.AudioContext || window.webkitAudioContext

        super(props);
        this.state = {
            store: this.props.store,
            callNow: false,
            openPopUp: false,
            videoView: false,
            context: new AudioContext(),
            audioPeer: new Audio(),
            name: null,
            userChannel: null,
            thisWindow: false,
            isDark: "light",
            isMuted: false,
            status: "...",
            uidUserPeerMainUUID: null,
            uidUserPeer: null,
            photoUrl: null,
            deltaPosition: {
                x: 0,
                y: 0,
            },
            channelCall: null,
            channelCallObj: null
        };

        this.state.store.subscribe(() => {
            this.setState(this.state.store.getState())
            this.update()
        })
    }

    update(){
        const store = this.state.store.getState()

        if(store.call.cc){
            this.setState({
                openPopUp: false,
                callNow: false,
                videoView: true,
                thisWindow: true
            });

            this.subscribeChannelCall(store.call.cc)
        }
    }

    // --------------------------

    // TODO: make video stream

    localStream = null // local stream mic

    // --------------------------

    // --------------------------

    audioCall = new Audio(audioCallSong) // song call me

    // --------------------------

    // --------------------------

    // muted - mic muted
    muted() {
        const store = this.state.store.getState()

        this.setState({
            isMuted: !this.state.isMuted
        })

        // console.log(store.stream.getAudioTracks()[0])

        store.stream.getAudioTracks()[0].enabled = !(store.stream.getAudioTracks()[0].enabled);
        this.state.store.dispatch({
            type: "ACTION_SET_STREAM", value: store.stream
        })
    }

    // --------------------------

    async cancel() {
        this.setState({
            callNow: false,
            openPopUp: false,
            thisWindow: true
        });

        this.audioCall.pause()

        this.state.userChannel?.publish({
            "type": "action_call",
            "event": "close_other_window"
        })
    }

    async answer() {
        this.audioCall.pause()

        this.setState({
            openPopUp: false,
            callNow: false,
            videoView: true,
            thisWindow: true
        });

        this.subscribeChannelCall(this.state.channelCall)

        this.state.channelCallObj?.publish({
            "type": "answer_on_user",
            "event": "close_other_window"
        });

        await this.getMediaStream()

        let a = setInterval(()=>{
            if (this.state.channelCallObj){
                this.state.channelCallObj?.publish({
                    type: "status_call",
                    uid: this.state.uidUserPeer
                })

                this.state.channelCallObj?.publish({
                    "type": "answer_on_user",
                    "event": "close_other_window"
                });

                clearInterval(a)
            }
        },3000)

    }

    async openCall(gumStream) {
        const store = this.state.store.getState()

        this.state.channelCallObj.publish({
            type: "crypto_id",
            uid: this.state.uidUserPeerMainUUID
        });

        for (const track of gumStream.getTracks()) {
            store.webRTC.pc.addTrack(track, gumStream);
        }
    }

    async createOffer(){
        let this_ = this
        const store = this.state.store.getState()

        if (store.webRTC.pc.connectionState !== 'connected') {
            let offer
            try {
                offer = await store.webRTC.pc.createOffer()
                await store.webRTC.pc.setLocalDescription(offer)

                this.state.channelCallObj.publish({
                    type: "offer",
                    offer: store.webRTC.pc.localDescription,
                    uid: this_.state.uidUserPeer
                })

            } catch (error) {
                console.error(error)
            }
        }
    }

    async onOffer(event) {

        const store = this.state.store.getState()

        if (store.webRTC.pc.connectionState !== 'connected') {
            let this_ = this

            await store.webRTC.pc.setRemoteDescription(event)

            if (store.webRTC.pc.signalingState !== 'stable') {
                let answer = await store.webRTC.pc.createAnswer()
                await store.webRTC.pc.setLocalDescription(answer)

                this.state.channelCallObj.publish({
                    type: "answer",
                    answer: store.webRTC.pc.localDescription,
                    uid: this_.state.uidUserPeer
                })
            }
        }
    }

    async getMediaStream(){

        const store = this.state.store.getState()


        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }

        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function(constraints) {

                let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

                if (!getUserMedia) {
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }

                return new Promise(function(resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        }

        this.localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: false})

        this.state.store.dispatch({
            type: "ACTION_SET_STREAM", value: this.localStream
        })

        if (!store.am){
            this.state.channelCallObj.publish({
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

    playSoundCall(){
        this.state.context.resume().then(() => {
            this.audioCall.currentTime = 0
            this.audioCall.loop = true
            this.audioCall.play()
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
            this.setState({
                uidUserPeerMainUUID: sha256(state.auth.user.data.login)
            })

            //-------test-------
            // console.log(sha256(state.auth.user.data.login))
            //-------------------

            this.eventing()

            this.getPreferredColorScheme()
            window.matchMedia('(prefers-color-scheme: dark)').onchange =  (event) => {
                this.getPreferredColorScheme()
            };

            let this_ = this

            state.webRTC.pc.ontrack = function (event){
                this_.state.audioPeer.srcObject = event.streams[0]
                this_.state.audioPeer.play()
            }

            state.webRTC.pc.onicecandidate = function (event){

                event.candidate && this_.state.channelCallObj.publish({
                    type: "candidate",
                    label: event.candidate.sdpMLineIndex,
                    candidate: event.candidate.candidate,
                    uid: this_.state.uidUserPeer
                })
            }

            state.webRTC.pc.onsignalingstatechange = async function (event) {
                // console.log(state.webRTC.pc.signalingState)
            }

            state.webRTC.pc.onconnectionstatechange = async function (event) {
                // console.log(state.webRTC.pc.connectionState)

                if (state.webRTC.pc.connectionState === 'connected') {
                    this_.setState({
                        status: "Голосовой диалог"
                    })

                    this_.state.channelCallObj.publish({
                            type: "connected",
                            uid: this_.state.uidUserPeer
                    })
                } else if(state.webRTC.pc.connectionState === "disconnected"){
                    this_.setState({
                        status: "Звонок завершен"
                    })
                    setTimeout(()=>{
                        this_.setState({
                            videoView: false
                        })
                    }, 5000)
                } else if(state.webRTC.pc.connectionState === "failed"){
                    this_.setState({
                        status: "Ошибка соединения"
                    })
                    setTimeout(()=>{
                        this_.setState({
                            videoView: false
                        })
                    }, 5000)
                }
            }
        }
    }

    subscribeChannelCall(channelId){
        const state = this.state.store.getState();

        this.state.channelCallObj && this.state.channelCallObj.unsubscribe()

        this.setState({
            channelCall: channelId
        })

        let this_ = this

        // event for call connected
        let c = state.centrifuge.object.subscribe(channelId, async (event) => {
            switch (event.data?.type) {
                case "offer":
                    if (event?.data?.uid === this_.state.uidUserPeerMainUUID)
                        // console.log(event?.data)
                        event?.data?.offer && await this_.onOffer(event?.data?.offer);
                    break;

                case "answer":
                    if (event?.data?.uid === this_.state.uidUserPeerMainUUID) {
                        // console.log(event?.data)
                        event?.data?.answer && await state.webRTC.pc.setRemoteDescription(new RTCSessionDescription(event?.data?.answer))
                    }
                    break;

                case "ready":
                    if (event?.data?.uid === this_.state.uidUserPeerMainUUID) {
                        await this_.createOffer();
                    }
                    break

                case "connected":
                    if (event?.data?.uid === this_.state.uidUserPeerMainUUID) {
                        await this_.createOffer();
                    }
                    break;
                case "answer_on_user":
                    if (!state.am) {
                        await this.getMediaStream()
                    }
                    break
                case "status_call":
                    if (event?.data?.uid === this_.state.uidUserPeerMainUUID) {
                        // console.log("create offer ")
                        this_.setState({
                            videoView: true
                        })

                        await this_.createOffer();
                    }
                    break;

                case "candidate":
                    if (event?.data?.uid === this_.state.uidUserPeerMainUUID) {
                        this_.setState({
                            status: "Устанавливается соединение..."
                        })
                        // ICE candidate configuration.
                        let candidate = new RTCIceCandidate({
                            sdpMLineIndex: event?.data?.label,
                            candidate: event?.data?.candidate,
                        })


                        await this.state.webRTC.pc.addIceCandidate(candidate)
                    }
                    break;
                case "crypto_id":
                    if (event?.data?.uid !== this_.state.uidUserPeerMainUUID) {
                        this_.setState({
                            uidUserPeer: event?.data?.uid
                        })
                    }
                    break;
                default:
                    break;
            }
        })

        this.setState({
            channelCallObj: c
        })

    }

    eventing(){
        const state = this.state.store.getState();

        let channelTitle = sha256(state.auth.user.data.login)
        let this_ = this

        let channel = state.centrifuge.object.subscribe(channelTitle, async (event) => {
            switch (event.data?.type) {
                case "call":
                    this_.playSoundCall()

                    this_.setState({
                        name: event.data.name + " " + event.data.last_name,
                        openPopUp: true,
                        callNow: true,
                        photoUrl: event.data.photo_url,
                        uidUserPeer: event.data.uid,
                        channelCall: event.data.id_channel
                    })

                    // -------------test----------------

                    // console.log(event.data)

                    // -------------test----------------
                    break
                case "inCall":
                    this_.subscribeChannelCall(event.data.id_channel)
                    break
                case "action_call":
                    if(event?.data.event === "close_other_window"){
                        if (!this_.state.thisWindow) {
                            this_.setState({
                                callNow: false,
                                openPopUp: false,
                                thisWindow: false
                            });
                            this.state.context.resume().then(() => {
                                this.audioCall.pause()
                            })
                        }else{
                            this_.setState({
                                thisWindow: false
                            });
                        }
                    }
                    break
                default:
                    break;
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
        const store = this.state.store.getState();
        // this.setState({
        //     videoView: false
        // })
        store.call.state = false
        store.webRTC.pc.close()

        this.setState({
            status: "Звонок завершен"
        })
        let this_ = this

        setTimeout(() => {
            this_.setState({
                videoView: false
            })
        }, 5000)
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
                                            <img className="image-user-src-standard round-animate" src={this.state.photoUrl}  alt="user"/>
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
                                        { this.state.status }
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
