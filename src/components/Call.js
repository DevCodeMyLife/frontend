import React, { Component }  from "react";
import { sha256 } from 'js-sha256';
import callMe from "../sound/callMe.mp3";
import video from "../icon/video.png";

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
            localStream: null
        };

    }

    videoMain = React.createRef()
    videoPeer = React.createRef()


    cancel(){
        this.setState({
            callNow: false
        });
        this.state.context.resume().then(() => {
            this.state.callMe.pause()
        })

    }

    async answer() {
        this.state.callMe.pause()
        this.setState({
            callNow: false,
            videoView: true
        });


        await this.getMediaStream()
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

        if (this.videoPeer.current.srcObject !== undefined) {

            this.videoPeer.current.srcObject = stream
            this.videoPeer.current.play()

            this.videoMain.current.srcObject = stream
            this.videoMain.current.play()

            return true
        }else{
            return Promise.reject(new Error('object is not have srcObject'));
        }
    };

    componentDidMount() {
        // test call now

        // this.setState({
        //     callNow: true
        // });
        //
        // this.state.context.resume().then(() => {
        //     this.state.callMe.currentTime = 0
        //     this.state.callMe.loop = true
        //     this.state.callMe.play()
        // })

        //
        const state = this.state.store.getState();
        if (state.auth.user.isAuth){
            let channelTitle = sha256(state.auth.user.data.login);

            // state.centrifuge.object.subscribe("$" + channelTitle , (event) => {
            //     console.log(event)
            // })
        }
    }

    render() {
        let {callNow} = this.state;

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
                                    this.state.videoView ?
                                        <div className="view-call-now video-width">
                                            <div className="video-view">
                                                <div className="video-view-peer">
                                                    <video ref={this.videoPeer} autoPlay={true} controls={false} />
                                                </div>
                                                <div className="video-view-main">
                                                    <video ref={this.videoMain} style={{maxWidth: "200px"}} autoPlay={true} controls={false} muted={true} />
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        null
                            }
                        </div>
                    </div>
                :
                    null
        )
    }
}

export default Call;
