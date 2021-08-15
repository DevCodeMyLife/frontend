import React, {Component} from "react";
import notes from "../icon/notes.png";
import about from "../icon/about.png";
import {Link} from "react-navi";

class About extends Component{
    handleHoverOn = (event) => {
        let elem = event.target.querySelector('.descriptions-button')

        if (elem){
            elem.classList.add('fade-in');
        }else{
            document.querySelector('.descriptions-button').classList.remove('fade-in');
        }
    }

    handleHoverOff = (event) => {
        let elem = event.target.querySelector('.descriptions-button')

        if (elem){
            elem.classList.remove('fade-in');
        }
        document.querySelector('.descriptions-button').classList.remove('fade-in');
    }

    render() {
        return (
            <div className="wrapper-content">
                <div className="content">
                    <div id="vertical_menu" className="reviews-menu">
                        <div className="wrapper-vertical-nav">
                            <div
                                className="nav-item "

                            >
                                <Link className="nav-value" href="/feeds">
                                    <div  className="icon-image" >
                                        <img  src={notes} alt="Новости" />
                                    </div>
                                    <div className="nav-value">
                                        Новости
                                    </div>
                                </Link>
                            </div>
                            <div
                                className="nav-item"

                            >
                                <Link href="/about" className="nav-value">
                                    <div  className="icon-image">
                                        <img path="/about" src={about} alt="about"/>
                                    </div>
                                    <div className="nav-value">
                                        Поддержка
                                    </div>
                                </Link>

                            </div>
                        </div>
                    </div>
                    <div className="content-wall-views">
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
                                <div className="about-text">
                                    <p>
                                        Я буду благодарен за любую помощь проекту, например Вы можете <a target="_blank" rel="noreferrer" href="https://ruvds.com/pay/49a7999ef9504f05ba508943ed1ef17f">пополнить сервер</a>, или <a rel="noreferrer" target="_blank" href="https://www.tinkoff.ru/rm/shmelev_shampanov.andrey1/ZDgWF76063">счет</a>.
                                    </p>
                                    <p>
                                        <a target="_blank" rel="noreferrer" href="https://github.com/AndreySHSH">@AndreySHSH</a>
                                    </p>
                                    <p>
                                        <a href="mailto:support@devcodemylife.tech">Написать в поддержку</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default About;
