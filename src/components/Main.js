import React, { Component }  from "react";
import github from '../icon/logo_github.png'


class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countUsers: 0,
            countNotes: 0,
            countUsersToday: 0,
            loadData: false
        }
    }

    componentDidMount() {
        fetch("/api/status_platform", {
            method: "GET"
        })
            .then(response => response.json())
            .then(res => {
                if (res.status.code === 200){
                    this.setState({
                        countUsers: res.data.count_user,
                        countNotes: res.data.count_notes,
                        countUsersToday: res.data.count_users_today,
                        loadData: true
                    })
                }
            })
            .catch(error => {
                console.log(error)
            });
    }

    render() {
        return (
            <div className="wrapper-content">
                <div className="content">
                    <div className="content-wall-views">
                        <div className="auth-wrapper">
                            <div className="auth-view-box">
                                <div className="auth-box-title">
                                    Войти через
                                </div>
                                <div className="auths-list">
                                    <div className="button-auth github"
                                         onClick={
                                             () => {
                                                 window.location.href = "https://github.com/login/oauth/authorize?client_id=7262f0da224a3673dee9&redirect_uri=http://devcodemylife.tech/api/oauth/github/redirect&scope=email&state=asiud88as7d&login=devcodemylife&allow_signup=true"
                                             }
                                         }
                                    >
                                        <img className="auth-logo" src={github} alt="github" />
                                    </div>
                                    {/*<div className="button-auth gitlab"*/}
                                    {/*     onClick={*/}
                                    {/*         () => {*/}
                                    {/*             window.location.href = "https://gitlab.com/oauth/authorize?client_id=f60720800a4eaafcb6edf0a1df659b19e081f4069ca6fdf741a5f445049ac40a&redirect_uri=https://devcodemylife.tech/api/oauth/gitlab/redirect&response_type=code&scope=api+read_user&state=fca1dfacc51f49c2b7f9246264c46d40&code_challenge=kUta11xlQkPRg4PmL4XbW1sbohklCzg5UxLl9ymMxyU&code_challenge_method=S256"*/}
                                    {/*         }*/}
                                    {/*     }*/}
                                    {/*>*/}
                                    {/*    <img className="auth-logo" src={gitlab} alt="gitlab" />*/}
                                    {/*</div>*/}
                                </div>
                            </div>
                        </div>
                        {
                            this.state.loadData ?
                                <div className="auth-wrapper">
                                    <div className="auth-view-box">
                                        <div className="auth-box-title">
                                            Статистика платформы
                                        </div>
                                        <div className="auths-list">
                                            <p>
                                                Пользователей: <span className="green">{this.state.countUsers}</span><br/>
                                                Созданных заметок: <span className="green">{this.state.countNotes}</span><br/>
                                                Активных пользователей сегодня: <span className="green">{this.state.countUsersToday}</span><br/>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                :
                                <div className="auth-wrapper">
                                    <div className="auth-view-box" style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                        <div className="loader"/>
                                    </div>
                                </div>
                        }
                        <div className="wrapper-page-about">
                            {/*<div className="title-page">*/}
                            {/*    О нас*/}
                            {/*</div>*/}
                            <div className="wrapper-about">

                                <div className="about-text">
                                    <p>
                                        <b>DevCodeMyLife</b> - это проект для разработчиков, которым периодически приходится искать код в интернете, чтобы решить какую-либо проблему. Просмотрев бесконечное число форумов, ты наконец-то находишь то, что тебе нужно, внедряешь и забываешь, где ты это находил.<br/>
                                        <br/>
                                        В какой-то момент ты снова сталкиваешься с подобной проблемой. Чтобы не лезть снова в проект или искать в интернете, ты всегда можешь запостить код здесь, используя Markdown, и никогда не потеряешь полезную часть кода.<br/>
                                        Так же ты сможешь помочь другим, если твой код окажется полезным, люди будут чаще его находить по релевантным запросам на нашей площадке.

                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Main;
