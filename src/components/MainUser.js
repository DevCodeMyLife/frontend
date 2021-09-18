import React, {Component} from "react";
import ReactMarkdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {tomorrow} from "react-syntax-highlighter/dist/esm/styles/prism"
import TextareaAutosize from 'react-textarea-autosize';
import like from "../icon/like.png";
import look from "../icon/look.png";
import open from "../icon/open.png"
import close from "../icon/close.png"
import code from "../icon/code.png";

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
      textNews: "...",
      heading: "...",
      prevState: null,
      clicked_new_post: false,
      show_textarea: false,
      id: 0,
      data: [],
      notUser: false,
      close: true,
      load: false,
      currentDateTime: new Date().getTime()
    }
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

  previewClick (className){
    const preview = document.getElementsByClassName(className)[0]
    console.log(preview)
    preview.classList.toggle("preview_swap")
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
              notification_count: res.notification_count,
              notification: res.notification,
              token: res.token,
              messagesCount: res.count_message
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

  feedNew() {
    let data = {
      title: "",
      value: document.getElementById("text_news").value,
      close: this.state.close
    }

    if (data.value.length > 3) {
      fetch("/api/feed", {
        method: "POST",
        body: JSON.stringify(data)
      })
          .then(response => response.json())
          .then(res => {
            console.log(res)
            if (res.status.code === 0) {
              window.location.reload()
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
    this.setState({clicked_new_post: true, show_textarea: true})


    // event.target
    // a.innerHTML = `
    //   <textarea onChange={this.handleChangeTextarea} placeholder="Что у Вас нового?" id="text_news">
    //
    //   </textarea>
    // `
  }

  getLastVisit = (d) => {
    let date = new Date(d);
    return date.getMinutes()
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
                          {
                            (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(result[0]?.last_active_at).getTime() / 1000))) > 7200 ?
                                <div className="offline_user"/>
                                :
                                <div className="online_user"/>
                          }
                          <img src={result[0].avatar_url} alt={result[0]?.login}/>
                        </div>
                        <div className="main-place-info-column child">
                          <div className="main-place name">
                            {
                              result[0]?.name ?
                                  " "+result[0].name
                                  :
                                  " "+result[0].login
                            }
                            {
                              (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(result[0]?.last_active_at).getTime() / 1000))) > 7200 ?
                                  <span className="info_status">Был онлайн { this.getLastVisit((Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(result[0]?.last_active_at).getTime() / 1000)))) } минут назад.</span>
                                :
                                  null
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
                                                                  autoFocus={true} placeholder="Что у Вас нового?" id="text_news">

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
                                                    <img src={close} alt="close"/>
                                                    :
                                                    <img src={open} alt="open"/>
                                              }

                                            </div>
                                            <div className="button-default" onClick={() => this.previewClick("preview-news")}>Показать что получилось</div>
                                            <div className="button-default" onClick={() => this.feedNew()}>Опубликовать</div>
                                          </div>
                                          :
                                          <div />
                                    }
                                    <div className="preview-news">

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
                                    (Math.floor((new Date().getTime() / 1000)) - Math.floor((new Date(data?.last_active_at).getTime() / 1000))) > 7200 ?
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
                              </div>
                              <div key="asldk" className="wrapper-data">
                                {/*<div key="aksdlkasd"  className="photo-wrapper">*/}

                                {/*</div>*/}
                                <ReactMarkdown className="value-post" remarkPlugins={[gfm]} components={this.components}>
                                  {data?.value?.substring(0, 900) + "..."}
                                </ReactMarkdown>
                              </div>
                            </div>
                            <div className="wrapper-bottom">
                              <div className="wrapper-flex-start">
                                <div className="button-default" onClick={(e) => {
                                  e.preventDefault();
                                  window.location.href = `/post?uuid=${data?.ID}`
                                }}>Подробнее</div>
                                <div className="button-default-icon-disable" >
                                  {
                                    data?.close ?
                                        <img src={close} alt="close"/>
                                        :
                                        <img src={open} alt="open"/>
                                  }

                                </div>
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
                          <div style={{"background": "#FF9898"}} className="title-page">
                            Ошибка
                          </div>
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
                              alignItems: "center"
                            }}>
                              <div className="loader" />
                            </div>
              }
            </div>

    )
  }
}

export default MainUsers;
