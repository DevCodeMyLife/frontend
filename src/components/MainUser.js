import React, {Component} from "react";
import ReactMarkdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {tomorrow} from "react-syntax-highlighter/dist/esm/styles/prism"
import TextareaAutosize from 'react-textarea-autosize';
import like from "../icon/like.png";
import look from "../icon/look.png";
import open from "../icon/open.svg"
import close from "../icon/close.svg"
import code from "../icon/code.png";
import {Helmet} from "react-helmet";

const gfm = require('remark-gfm')

class MainUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "React"
    };
    this.state = {
        error: false,
        isLoaded: false,
        result: null,
        mainFeed: null,
        showPreview: false,
        textNews: "...",
        heading: "...",
        prevState: null,
        clicked_new_post: false,
        show_textarea: false,
        id: 0,
        data: [],
        notUser: false,
        close: false,
        load: false,
        rewriteMode: false,
        rewriteValue: null,
        currentDateTime: new Date().getTime()
    }
  }

  deleteFeed(uuid) {
    fetch(`/api/feed/${uuid}`, {
      method: "DELETE",
      body: JSON.stringify({})
    })
        .then(response => response.json())
        .then(_ => {
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
                    data: res.data,
                    feed: res.feed,
                    load: true,
                    token: res.token,
                  });
                    this.cancel()

                }else{
                  this.sendLogs(res.status.message)
                  this.delete_cookie("access_token")
                }

                const urlParams = new URLSearchParams(window.location.search);
                const id = urlParams.get('id');

                let path = `/api/user/${id}`

                fetch(path, {
                  method: "GET"
                })
                    .then(response => response.json())
                    .then(res => {
                      if (res.status.code === 0 && res.data.length > 0){
                        this.setState({
                          isLoaded: true,
                          id: id,
                          result: res.data,
                          mainFeed: res.feed,
                          notUser: false
                        });
                      }else{
                        this.setState({
                          isLoaded: false,
                          result: {},
                          notUser: true,
                          error: true
                        });
                      }
                    })
                    .catch(error => {
                      this.setState({
                        isLoaded: false,
                        error: true,
                        result: {},
                        notUser: true
                      });
                      console.log(error)
                    });

              })
              .catch(error => {
                this.setState({
                  auth: false,
                  load: true,
                });
              });
        })
        .catch(error => {
          console.log(error)
        });
  }

  like(uuid) {
    let data = {
      feeds_uuid: uuid
    }
    fetch("/api/like", {
      method: "POST",
      body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(res => {
          if (res.status.code === 0){
            console.log(res)

            document.getElementById(uuid).innerHTML = res.data.count
          }
          console.log(res)
          // this.setState({
          //     isLoaded: "access",
          //     result: res.data
          // });
          // if (!result.ok) {
          //     throw new Error("Network response was not ok");
          // }
          // return result.blob();
        })
        .catch(error => {
          console.log(error)
        });
  }

  previewClick (){
    // const preview = document.getElementsByClassName(className)[0]
    // console.log(preview)
    // preview.classList.toggle("preview_swap")
      this.setState({
          showPreview: !this.state.showPreview
      })
  }

  rewriteFeed(uuid, value, close){
      this.setState({
          rewriteUUID: uuid,
          rewriteValue: value,
          rewriteMode: true,
          clicked_new_post: true,
          show_textarea: true,
          close: close,
          showPreview: true
      })
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
              data: res.data,
              feed: res.feed,
              load: true,
              token: res.token,
            });


          }else{
            this.sendLogs(res.status.message)
            this.delete_cookie("access_token")
          }

          const urlParams = new URLSearchParams(window.location.search);
          const id = urlParams.get('id');

          let path = `/api/user/${id}`

          fetch(path, {
            method: "GET"
          })
              .then(response => response.json())
              .then(res => {
                if (res.status.code === 0 && res.data.length > 0){
                  this.setState({
                    isLoaded: true,
                    id: id,
                    result: res.data,
                    mainFeed: res.feed,
                    notUser: false
                  });
                }else{
                  this.setState({
                    isLoaded: false,
                    result: {},
                    notUser: true,
                    error: true
                  });
                }
              })
              .catch(error => {
                this.setState({
                  isLoaded: false,
                  error: true,
                  result: {},
                  notUser: true
                });
                console.log(error)
              });

        })
        .catch(error => {
          this.setState({
            auth: false,
            load: false,
              error: true
          });
        });



  }

  components = {
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
          <SyntaxHighlighter style={tomorrow} wrapLongLines={false} language={match[1]} PreTag="div" children={String(children).replace(/\n$/, '')} {...props} />
      ) : (
          <code className={className} {...props}>
            {children}
          </code>
      )
    }
  }

  cancel(){
      this.setState({
          clicked_new_post: false,
          show_textarea: false,
          rewriteValue: null,
          showPreview: false,
          rewriteMode: false,
          textNews: "..."
      })
  }

  saveFeed(){
      let data = {
          title: "",
          value: document.getElementById("text_news").value,
          close: this.state.close
      }

      this.setState({
          clicked_new_post: false,
          show_textarea: false,
          rewriteValue: null,
          showPreview: false,
          rewriteMode: false,
          textNews: "..."
      })

      fetch(`/api/feed/${this.state.rewriteUUID}`, {
          method: "PUT",
          body: JSON.stringify({
              value:data.value,
              close: data.close
          })
      })
          .then(response => response.json())
          .then(_ => {
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
                              data: res.data,
                              feed: res.feed,
                              load: true,
                              token: res.token,
                          });


                      }else{
                          this.sendLogs(res.status.message)
                          this.delete_cookie("access_token")
                      }

                      const urlParams = new URLSearchParams(window.location.search);
                      const id = urlParams.get('id');

                      let path = `/api/user/${id}`

                      fetch(path, {
                          method: "GET"
                      })
                          .then(response => response.json())
                          .then(res => {
                              if (res.status.code === 0 && res.data.length > 0){
                                  this.setState({
                                      isLoaded: true,
                                      id: id,
                                      result: res.data,
                                      mainFeed: res.feed,
                                      notUser: false
                                  });
                              }else{
                                  this.setState({
                                      isLoaded: false,
                                      result: {},
                                      notUser: true,
                                      error: true
                                  });
                              }
                          })
                          .catch(error => {
                              this.setState({
                                  isLoaded: false,
                                  error: true,
                                  result: {},
                                  notUser: true
                              });
                              console.log(error)
                          });

                  })
                  .catch(error => {
                      this.setState({
                          auth: false,
                          load: true,
                      });
                  });
          })
          .catch(error => {
              console.log(error)
          });
  }

  feedNew() {
    let data = {
      title: "",
      value: document.getElementById("text_news").value,
      close: this.state.close
    }


    if (data.value.length > 1) {

        this.setState({
            clicked_new_post: false,
            show_textarea: false,
            rewriteValue: null,
            showPreview: false
        })
      fetch("/api/feed", {
        method: "POST",
        body: JSON.stringify(data)
      })
          .then(response => response.json())
          .then(res => {
            console.log(res)
            if (res.status.code === 0) {
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
                                data: res.data,
                                feed: res.feed,
                                load: true,
                                token: res.token,
                            });


                        }else{
                            this.sendLogs(res.status.message)
                            this.delete_cookie("access_token")
                        }

                        const urlParams = new URLSearchParams(window.location.search);
                        const id = urlParams.get('id');

                        let path = `/api/user/${id}`

                        fetch(path, {
                            method: "GET"
                        })
                            .then(response => response.json())
                            .then(res => {
                                if (res.status.code === 0 && res.data.length > 0){
                                    this.setState({
                                        isLoaded: true,
                                        id: id,
                                        result: res.data,
                                        mainFeed: res.feed,
                                        notUser: false
                                    });
                                }else{
                                    this.setState({
                                        isLoaded: false,
                                        result: {},
                                        notUser: true,
                                        error: true
                                    });
                                }
                            })
                            .catch(error => {
                                this.setState({
                                    isLoaded: false,
                                    error: true,
                                    result: {},
                                    notUser: true
                                });
                                console.log(error)
                            });

                    })
                    .catch(error => {
                        this.setState({
                            auth: false,
                            load: true,
                        });
                    });
            }

          })
          .catch(error => {
            console.log(error)
          });
    }
  }

  unixToDateTime(unixTimestamp) {
    const milliseconds = unixTimestamp * 1000
    const dateObject = new Date(milliseconds)

    return dateObject.toLocaleString()
  }

  handleChangeTextarea = (event) => {
    if (event.target.value === ""){
      this.setState({textNews: "Текст статьи"})
    }else{
      this.setState({textNews: event.target.value})
    }
  }

  handleChangeInput = (event) => {
    if (event.target.value === "") {
      this.setState({heading: "Текст заголовка"})
    }else{
      this.setState({heading: event.target.value})
    }

  }



  newInputText = (event) => {
    this.setState({clicked_new_post: true, show_textarea: true, showPreview: true})


    // event.target
    // a.innerHTML = `
    //   <textarea onChange={this.handleChangeTextarea} placeholder="Что у Вас нового?" id="text_news">
    //
    //   </textarea>
    // `
  }

  getLastVisit = (d) => {

    return Math.floor(d / 60)
  }

  createChat = event => {
    let data = {
      to_uid: Number(this.state.id)
    }


    fetch("/api/create_chats", {
      method: "POST",
      body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(res => {
          console.log(res)
          if (res.status.code === 0) {
            window.location.href = `/messages?cid=${res.data}`
          }

        })
        .catch(error => {
          console.log(error)
        });

  }

  onKeyDown = event => {
    // 'event.key' will return the key as a string: 'Tab'
    // 'event.keyCode' will return the key code as a number: Tab = '9'
    // You can use either of them
    if (event.keyCode === 9) {
      // Prevent the default action to not lose focus when tab
      event.preventDefault();

      // Get the cursor position
      const { selectionStart, selectionEnd } = event.target;
      // update the state
      this.setState(
          prevState => ({
            lyrics:
                prevState.lyrics.substring(0, selectionStart) +
                "\t" + // '\t' = tab, size can be change by CSS
                prevState.lyrics.substring(selectionEnd)
          }),
          // update the cursor position after the state is updated
          () => {
            this.textAreaRef.current.selectionStart = this.textAreaRef.current.selectionEnd =
                selectionStart + 1;
          }
      );
    }
  };



  render(){
    let { isLoaded, textNews, mainFeed, result, clicked_new_post } = this.state;
    return (
            <div className="content-wall-views">
              {
                isLoaded ?
                    <div className="feed-wrapper">
                      <div className="main-place-wrapper">
                        <div className="main-place-photo-column child">
                          <img src={result[0].avatar_url} alt={result[0]?.login}/>
                        </div>
                        <div className="main-place-info-column child">
                          <div className="main-place date_active">
                            {
                              (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(result[0]?.last_active_at).getTime() / 1000))) > 120 ?
                                  (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(result[0]?.last_active_at).getTime() / 1000))) > 60 ?
                                      <span className="info_status">Последняя активность была { new Date(result[0]?.last_active_at).toLocaleString() }</span>
                                      :
                                      <span className="info_status">Последняя активность была { this.getLastVisit( (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(result[0]?.last_active_at).getTime() / 1000))) )} минут назад.</span>
                                  :
                                    <span className="info_status">Сейчас на сайте</span>
                            }
                          </div>
                            <Helmet>
                                <title>{result[0].login} | DevCodeMyLife</title>
                            </Helmet>
                          <div className="main-place name">
                            {
                              result[0]?.name ?
                                  " "+result[0].name
                                  :
                                  " "+result[0].login
                            }
                          </div>
                          <div className="main-place">
                            Email:
                            {
                              Number(this.state.id) === this.state.data[0].id ?
                                  result[0]?.email ?
                                      " "+result[0].email
                                      :
                                      " не указан"
                                  :
                                  " Скрыт либо не задан"

                            }
                          </div>
                          <div className="main-place">
                            Компания:
                            {
                              result[0]?.company ?
                                  " "+result[0].company
                                  :
                                  " не указана"
                            }
                          </div>
                          <div className="main-place">
                            Локация:
                            {
                              result[0]?.location ?
                                  " "+result[0].location
                                  :
                                  " не указана"
                            }
                          </div>
                            <div className="main-place">
                                Профиль GitHub:
                                {
                                    result[0]?.html_url ?
                                        <a className="link_github" target="_blank" href={result[0].html_url} rel="noreferrer"> {result[0].login}</a>
                                        :
                                        " не указан"
                                }
                            </div>
                          <div className="main-place">

                            {
                              Number(this.state.id) !== this.state.data[0].id ?
                                  <div className="button-default" onClick={this.createChat}>
                                    Написать сообщение
                                  </div>
                                  :
                                  null
                            }
                          </div>
                        </div>
                      </div>
                      <div className="feed-wrapper-item background-white">

                        {
                          Number(this.state.id)  === this.state.data[0].id ?
                              result?.map(res =>
                                  <div className="feed-item-value">

                                    <div key={res.avatar_url} className="wrapper-data">
                                      <div key="aksdlkasd" className="photo-wrapper">
                                        <img key="asdmmmmasd" src={res?.avatar_url} alt={res?.login}
                                             onClick={(e) => {
                                               e.preventDefault();
                                               window.location.href = `/user?id=${this.state.data[0].id}`
                                             }}
                                        />
                                      </div>

                                      <div className="value-post placeholder-main-feed" id="main_input" onClick={
                                        !clicked_new_post ? this.newInputText : null
                                      }>

                                        {
                                          this.state.clicked_new_post ?
                                              <div className="textarea-hide">
                                                <TextareaAutosize className="feed-textarea" onChange={this.handleChangeTextarea}
                                                                  autoFocus={true} placeholder="Что у Вас нового?" id="text_news" >
                                                    {this.state.rewriteMode ? this.state.rewriteValue : ""}
                                                </TextareaAutosize>
                                              </div>

                                              :
                                              <div className="fake-textarea">Что у Вас нового?</div>
                                        }
                                      </div>
                                    </div>

                                    {
                                      this.state.clicked_new_post ?
                                          <div className="wrapper-flex-end create-feed-wrapper-button">
                                            <div className="button-default-icon" onClick={() => {
                                              this.setState(prevState => ({
                                                close: !prevState.close
                                              }));
                                            }}>
                                              {
                                                this.state.close ?
                                                    <svg className="svg-close-view" fill="#000000" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="50px" height="50px"><path fill="none" className="svg-close" stroke="#000000" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="2" d="M9 49c-1.1 0-2-.9-2-2V23c0-1.1.9-2 2-2h32c1.1 0 2 .9 2 2v24c0 1.1-.9 2-2 2H9zM36 21c0 0 0-4.9 0-6 0-6.1-4.9-11-11-11-6.1 0-11 4.9-11 11 0 1.1 0 6 0 6"/><path d="M28,33c0-1.7-1.3-3-3-3c-1.7,0-3,1.3-3,3c0,0.9,0.4,1.7,1,2.2V38c0,1.1,0.9,2,2,2c1.1,0,2-0.9,2-2v-2.8C27.6,34.7,28,33.9,28,33z"/></svg>
                                                    :
                                                    <svg className="svg-close-view" fill="#000000" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="50px" height="50px"><path fill="none" className="svg-close" stroke="#000000" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="2" d="M9 49c-1.1 0-2-.9-2-2V23c0-1.1.9-2 2-2h32c1.1 0 2 .9 2 2v24c0 1.1-.9 2-2 2H9zM34.6 13.1c0 0-1.1-3.6-1.3-4.3-1.8-5.8-8-9.1-13.8-7.3-5.8 1.8-9.1 8-7.3 13.8C12.6 16.4 14 21 14 21"/><path d="M28,33c0-1.7-1.3-3-3-3c-1.7,0-3,1.3-3,3c0,0.9,0.4,1.7,1,2.2V38c0,1.1,0.9,2,2,2c1.1,0,2-0.9,2-2v-2.8C27.6,34.7,28,33.9,28,33z"/></svg>
                                              }

                                            </div>
                                            {/*<div className="button-default" onClick={() => this.previewClick()}>Показать что получилось</div>*/}
                                              <div className="button-default" onClick={() => this.cancel()}>Отмена</div>
                                              {
                                                  this.state.rewriteMode ?
                                                      <div className="button-default"
                                                           onClick={() => {
                                                               this.deleteFeed(this.state.rewriteUUID)
                                                           }}
                                                      >
                                                          Удалить
                                                      </div>
                                                      :
                                                      null
                                              }
                                              {
                                                  this.state.rewriteMode ?

                                                      <div className="button-default" onClick={() => this.saveFeed()}>Сохранить</div>
                                                  :
                                                      <div className="button-default" onClick={() => this.feedNew()}>Опубликовать</div>
                                              }


                                          </div>
                                          :
                                          <div />
                                    }
                                      {
                                          this.state.showPreview ?
                                              <div className="preview-news preview_swap">

                                                  <div className="feed-wrapper-item">
                                                      <div className="feed-item-value">
                                                          <div className="wrapper-data">
                                                              <ReactMarkdown className="value-post" remarkPlugins={[gfm]} components={this.components}>
                                                                  {textNews}
                                                              </ReactMarkdown>
                                                          </div>
                                                      </div>
                                                  </div>

                                              </div>
                                              :
                                              null
                                      }

                                  </div>
                              )
                              :
                              null
                        }


                      </div>
                      {mainFeed?.map(data =>
                          <div key={data?.ID}  className="feed-wrapper-item">
                            {/*<div className="feed-item-title">*/}
                            {/*  <div className="wrapper-flex-start">{data?.title}</div>*/}
                            {/*  <div key="mamdmkamasdasd" className="author-name wrapper-flex-end unselectable" onClick={(e) => {*/}
                            {/*    e.preventDefault();*/}
                            {/*    window.open('https://github.com/' + data?.user, "_blank");*/}
                            {/*  }}>*/}
                            {/*    {data?.user}*/}
                            {/*  </div>*/}
                            {/*</div>*/}
                            {/*<div className="feed-item-datetime">*/}
                            {/*  {this.unixToDateTime(data?.date_time)}*/}
                            {/*</div>*/}
                            <div className="feed-item-value">
                              <div key="asldk" className="wrapper-data">
                                <div key="aksdlkasd"  className="photo-wrapper">
                                  {
                                    (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(result[0]?.last_active_at).getTime() / 1000))) > 120 ?
                                        null
                                    :
                                        <div className="online_user" />
                                  }
                                  <img key="asdmmmmasd" src={data?.photo} alt={data?.user}
                                       onClick={(e) => {
                                         e.preventDefault();
                                         window.location.href = `/user?id=${data?.uid}`
                                       }}
                                  />
                                </div>
                                <div className="value-post">
                                  <div className="feed-item-title">
                                    <div className="link-user" onClick={(e) => {
                                      e.preventDefault();
                                      window.location.href = `/user?id=${data?.uid}`
                                    }}>
                                      {data?.user}
                                    </div>
                                    <div className="feed-item-datetime">
                                      {this.unixToDateTime(data?.date_time)}
                                    </div>
                                  </div>
                                </div>
                                  <div className="button-default-icon-disable hide-border" >
                                      {
                                          data?.close ?
                                              <svg className="svg-close-view" fill="#000000" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="50px" height="50px"><path fill="none" className="svg-close" stroke="#000000" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="2" d="M9 49c-1.1 0-2-.9-2-2V23c0-1.1.9-2 2-2h32c1.1 0 2 .9 2 2v24c0 1.1-.9 2-2 2H9zM36 21c0 0 0-4.9 0-6 0-6.1-4.9-11-11-11-6.1 0-11 4.9-11 11 0 1.1 0 6 0 6"/><path d="M28,33c0-1.7-1.3-3-3-3c-1.7,0-3,1.3-3,3c0,0.9,0.4,1.7,1,2.2V38c0,1.1,0.9,2,2,2c1.1,0,2-0.9,2-2v-2.8C27.6,34.7,28,33.9,28,33z"/></svg>
                                              :
                                              <svg className="svg-close-view" fill="#000000" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="50px" height="50px"><path fill="none" className="svg-close" stroke="#000000" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="2" d="M9 49c-1.1 0-2-.9-2-2V23c0-1.1.9-2 2-2h32c1.1 0 2 .9 2 2v24c0 1.1-.9 2-2 2H9zM34.6 13.1c0 0-1.1-3.6-1.3-4.3-1.8-5.8-8-9.1-13.8-7.3-5.8 1.8-9.1 8-7.3 13.8C12.6 16.4 14 21 14 21"/><path d="M28,33c0-1.7-1.3-3-3-3c-1.7,0-3,1.3-3,3c0,0.9,0.4,1.7,1,2.2V38c0,1.1,0.9,2,2,2c1.1,0,2-0.9,2-2v-2.8C27.6,34.7,28,33.9,28,33z"/></svg>
                                      }

                                  </div>
                              </div>
                              <div key="asldk" className="wrapper-data">
                                {/*<div key="aksdlkasd"  className="photo-wrapper">*/}

                                {/*</div>*/}

                                <ReactMarkdown className="value-post" remarkPlugins={[gfm]} components={this.components}>
                                  {data?.value?.substring(0, 900) + "\n..."}
                                </ReactMarkdown>
                              </div>
                            </div>
                            <div className="wrapper-bottom">
                              <div className="wrapper-flex-start">
                                <div className="button-default" onClick={(e) => {
                                  e.preventDefault();
                                  window.location.href = `/post?uuid=${data?.ID}`
                                }}>Подробнее</div>
                                {/*{*/}
                                {/*  Number(this.state.id) === this.state.data[0].id ?*/}
                                {/*      <div className="button-default"*/}
                                {/*           onClick={() => {*/}
                                {/*             this.deleteFeed(data?.ID)*/}
                                {/*           }}*/}
                                {/*      >*/}
                                {/*        Удалить*/}
                                {/*      </div>*/}

                                {/*      :*/}
                                {/*      null*/}
                                {/*}*/}
                                  {
                                      Number(this.state.id) === this.state.data[0].id ?
                                          <div className="button-default"
                                               onClick={() => {
                                                   this.rewriteFeed(data?.ID, data?.value, data?.close)
                                               }}
                                          >
                                              Изменить
                                          </div>

                                          :
                                          null
                                  }
                              </div>
                              <div className="like_wrapper wrapper-flex-end">
                                <div className="like">
                                  <div className="like-item">
                                    <img src={look}  alt="like"/>
                                  </div>
                                  <div className="like-item">
                                            <span className="like-count">
                                                {data?.look_count}
                                            </span>
                                  </div>
                                </div>
                                <div className="like">

                                  <div className="like-item" onClick={() => this.like(data?.ID)}>
                                    <img src={like}  alt="like"/>
                                  </div>
                                  <div className="like-item">
                              <span className="like-count" id={data?.ID}>
                                  {data?.count_like}
                              </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                      )}

                    </div>
                  :
                    this.state.notUser && this.state.auth ?
                        <div>
                          {/*<div style={{"background": "#FF9898"}} className="title-page">*/}
                          {/*  Ошибка*/}
                          {/*</div>*/}
                          <div className="error-wrapper">

                            <div className="error-page">
                              Такого пользователя не существует
                            </div>
                          </div>
                        </div>
                      :
                        this.state.error ?
                            <div>
                              {/*<div style={{"background": "#FF9898"}} className="title-page">*/}
                              {/*  Ошибка*/}
                              {/*</div>*/}
                              <div className="error-wrapper">
                                <div className="error-page">
                                  Авторизуйтесь чтобы просматривать профили пользователей.
                                </div>
                              </div>
                            </div>
                          :
                            <div className="feed-wrapper" style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              height: "100%"
                            }}>
                              <div className="loader" />
                            </div>
              }
            </div>

    )
  }
}

export default MainUsers;
