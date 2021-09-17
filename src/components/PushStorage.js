import {Component} from "react";
import {toast} from "react-toastify";
import Centrifuge from "centrifuge";

const CONFIG = {
    url: document.location.host === "localhost" ? `ws://${document.location.host}/cent/connection/websocket` : `wss://${document.location.host}/cent/connection/websocket`
};

export class PushStorage extends Component{
    static client = ""
    static channel = null

    // static start(){
    //     // this.down()
    //
    //     this.centrifuge = new Centrifuge(CONFIG.url);
    //     fetch("/api/authentication", {
    //         method: "POST",
    //         body: JSON.stringify({
    //             "finger": window.localStorage.getItem("finger")
    //         })
    //     })
    //         .then(response => response.json())
    //         .then(res => {
    //             if (res.status.code === 0) {
    //                 this.centrifuge.setToken(res.token)
    //                 this.centrifuge.connect()
    //
    //                 this.client = res.data[0].id
    //
    //                 this.centrifuge.on("connect", function (){
    //                     let time = new Date().getTime()
    //                     console.log("PushStorage uptime", time)
    //                 })
    //
    //                 this.centrifuge.on("disconnect", function (){
    //                     let time = new Date().getTime()
    //                     console.log("PushStorage downtime", time)
    //                 })
    //
    //                 this.centrifuge.on("unsubscribe", function (){
    //                     let time = new Date().getTime()
    //                     console.log("PushStorage unsubscribe", time)
    //                 })
    //
    //                 this.channel = this.centrifuge.subscribe(this.client, function (message){
    //                     console.log(message)
    //                 })
    //             }
    //         })
    // }
    //
    // static down(){
    //     if (this.channel)
    //         this.channel.unsubscribe(this.client)
    // }


    static run() {

        this.centrifuge = new Centrifuge(CONFIG.url);

        fetch("/api/authentication", {
            method: "POST",
            body: JSON.stringify({
                "finger": window.localStorage.getItem("finger")
            })
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 0) {

                    this.centrifuge.setToken(res.token)

                    if (this.channel !== null)
                        this.channel.unsubscribe(`${res.data[0].id}`)

                    // let this_ = this
                    this.channel = this.centrifuge.subscribe(`${res.data[0].id}`, function(message) {
                            console.log("[ private channel connect ]")

                            let event = message.data

                            console.log(event)

                            switch (event.type){
                                case "event":
                                    // this_.setState({notification_count: event.count })
                                    // this_.state.context.resume().then(() => {
                                    //     this_.state.audio.play();
                                    //     console.log('Playback resumed successfully');
                                    // });
                                    toast.info('Вашу заметку посмотрели.', {
                                        position: "top-center",
                                        autoClose: 5000,
                                        hideProgressBar: true,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                    });
                                    break;
                                case "comment":
                                    // this_.setState({notification_count: event.count })
                                    // this_.state.context.resume().then(() => {
                                    //     this_.state.audio.play();
                                    //     console.log('Playback resumed successfully');
                                    // });
                                    toast.info('Вашу заметку прокомментировали.', {
                                        position: "top-center",
                                        autoClose: 5000,
                                        hideProgressBar: true,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                    });
                                    break;
                                case "message":
                                    if (window.location.pathname.match(/messages/) === null) {
                                        // this_.setState({messagesCount: event.count })
                                        toast.info('Вам пришло новое сообщение.', {
                                            position: "top-center",
                                            autoClose: 5000,
                                            hideProgressBar: true,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                        });
                                    }
                                    break;
                                case "update":
                                    // fetch("/api/authentication", {
                                    //     method: "POST",
                                    //     body: JSON.stringify({
                                    //         "finger": window.localStorage.getItem("finger")
                                    //     })
                                    // })
                                    //     .then(response => response.json())
                                    //     .then(res => {
                                    //         if (res.status.code === 0) {
                                    //             this_.setState({
                                    //                 auth: true,
                                    //                 data: res.data,
                                    //                 messagesCount: res.count_message,
                                    //                 notification_count: res.notification_count
                                    //             });
                                    //         }
                                    //     })

                                    break;
                                default:
                                    console.log("[ unidentified event ]")
                            }
                        })

                    this.centrifuge.connect()

                }
            })
    }

}