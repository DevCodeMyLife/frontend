import React, {Component} from "react";
import TextareaAutosize from "react-textarea-autosize";
import CurrencyInput from 'react-currency-input-field';
import Select from 'react-select';
import '@emotion/react'
// import {Link} from "@mui/material";
// import gfm from "remark-gfm";
// import ReactMarkdown from "react-markdown";
import {PrismAsync as SyntaxHighlighter} from "react-syntax-highlighter";
// import {tomorrow as style} from "react-syntax-highlighter/dist/cjs/styles/prism";
import {Link} from "react-navi";

const options = [
    {value: '0', label: 'Легко'},
    {value: '1', label: 'Средне'},
    {value: '2', label: 'Сложно'},
];

const dot = (color = 'var(--bg-grey)') => ({
    alignItems: 'center',
    display: 'flex',
    color: "var(--font-color)",

    ':before': {
        backgroundColor: color,
        borderRadius: 10,
        content: '" "',
        display: 'block',
        marginRight: 8,
        height: 10,
        width: 10,
    },
});

const colourStyles = {
    control: styles => ({...styles, backgroundColor: 'var(--bg-grey)'}),
    option: (styles, {data, isDisabled, isFocused, isSelected}) => {
        return {
            ...styles,
            color: isDisabled
                ? '#ccc'
                : isSelected
                    ? 'white'
                    : data.color,
            cursor: isDisabled ? 'not-allowed' : 'default',
        };
    },
    input: styles => ({...styles, ...dot()}),
    placeholder: styles => ({...styles, ...dot()}),
    singleValue: (styles, {data}) => ({...styles, ...dot(data.color)}),
};

class Freelances extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: null,
            dateNow: new Date(),
            selectedOption: null,
            auth: false,
            freeSearch: null,
            load: "load",
            free: null,
            price: 0
        }

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
                if (res.status.code === 0) {
                    this.setState({
                        auth: true
                    });

                    fetch("api/freelances", {
                        method: "GET",
                    })
                        .then(response => response.json())
                        .then(res => {
                            this.setState({
                                free: res.data,
                                load: "continue"
                            });
                        })
                        .catch(error => {
                            console.log(error)
                        });
                } else {
                    this.setState({
                        load: "notAuth"
                    })
                }

            })
            .catch(error => {
                console.log(error)
            });

    }


    handleChangeSelect = (selectedOption) => {
        this.setState({
            selectedOption: selectedOption
        });
    };

    cancelTask = () => {
        this.setState({
            mode: null
        })
    }

    createTask = event => {
        this.setState({
            mode: "create"
        })
    }

    createTaskFull = () => {
        let data = {
            title: document.getElementById("title").value,
            complexity: this.state.selectedOption.value,
            value: document.getElementById("value").value,
            price: this.state.price
        }

        fetch("api/freelances", {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(res => {
                this.cancelTask()
                fetch("api/freelances", {
                    method: "GET",
                })
                    .then(response => response.json())
                    .then(res => {
                        this.setState({
                            free: res.data,
                            load: "continue"
                        });
                    })
                    .catch(error => {
                        console.log(error)
                    });
            })
            .catch(error => {
                console.log(error)
            });
    }

    handleChange = (event) => {
        this.setState({
            dateNow: event
        })
    }

    updatePrice = (value, name) => {
        this.setState({
            price: value
        })
    }

    components = {
        code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
                <SyntaxHighlighter style={style} wrapLongLines={false} language={match[1]} showLineNumbers={false}
                                   PreTag="div" children={String(children).replace(/\n$/, '')} {...props} />
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            )
        }
    }

    setStartDate(d) {
        console.log(d)
    }


    render() {
        return (
            <div className="content-wall-views">
                {
                    this.state.load === "notAuth" ?
                        <div>
                            <div className="error-wrapper">
                                <div className="error-page">
                                    Авторизуйтесь чтобы просматривать эту страницу.
                                </div>
                            </div>
                        </div>
                        :
                        <div>
                            <div className="wrapper-search wrapper-inline-block unselectable">
                                <div className="main-place-wrapper">
                                    <p>
                                        <b>Фриланс - </b> Здесь ты можешь взять задачи в работу либо создать
                                        свои.
                                    </p>
                                </div>
                                <div>
                                    <input placeholder="Найдем что нибудь для Вас..." onFocus={() => {
                                        this.cancelTask()
                                    }}/>
                                </div>
                                <div className="tags-wrapper">
                                    <div className="button-default-tag tags-item unselectable button-select" id="all"
                                         action="main">
                                        Все
                                    </div>
                                    <div className="button-default-tag tags-item unselectable" id="all"
                                         action="main">
                                        Созданные
                                    </div>
                                    <div className="button-default-tag tags-item unselectable" id="all"
                                         action="main">
                                        В ожидании
                                    </div>
                                    <div className="button-default-tag tags-item unselectable" id="all"
                                         action="main">
                                        В исполнении
                                    </div>
                                    {
                                        this.state.mode === "create" ?
                                            null
                                            :
                                            <div className="button-default-tag tags-item unselectable" style={{background: "#4cb463", color: "#fff"}} id="all"
                                                 action="create" onClick={this.createTask}>
                                                Создать задачу
                                            </div>
                                    }
                                </div>
                                {
                                    this.state.mode === "create" ?
                                        <div className="wrapper-white-default">
                                            <div className="auth-box-title">
                                                <div className="title-span-auth">Задача</div>
                                                {/*<div className="title-span-auth-small">Пройдите легкую регистрацию</div>*/}
                                            </div>
                                            <div className="wrapper-bottom">
                                                <div className="wrapper-flex-start">
                                                    <input autoFocus={true} className="input-default" id="title"
                                                           placeholder="Заголовок" type="text"/>
                                                </div>
                                                <div className="wrapper-flex-end-margin">
                                                    <Select
                                                        id="complexity"
                                                        placeholder="Сложность"
                                                        className="selected-box"
                                                        value={this.state.selectedOption}
                                                        onChange={this.handleChangeSelect}
                                                        options={options}
                                                        styles={colourStyles}
                                                    />
                                                </div>
                                            </div>
                                            <div className="wrapper-input fix_wrapper">
                                                <TextareaAutosize
                                                    id="value"
                                                    minRows={12}
                                                    placeholder="Описание задачи"
                                                    style={{
                                                        borderRadius: "5px"
                                                    }}
                                                >
                                                </TextareaAutosize>
                                            </div>
                                            <div className="wrapper-bottom">
                                                <div className="wrapper-flex-start">
                                                    <CurrencyInput
                                                        id="price"
                                                        className="input-default"
                                                        intlConfig={{locale: 'ru-RU', currency: 'RUB'}}
                                                        name="price"
                                                        placeholder="Стоимость"
                                                        maxLength={6}
                                                        defaultValue={0}
                                                        decimalsLimit={2}
                                                        onValueChange={(value, name) => this.updatePrice(value, name)}
                                                        style={{
                                                            width: "220px"
                                                        }}
                                                    />
                                                </div>
                                                <div className="wrapper-flex-end-margin">
                                                    <div className="button-default" onClick={() => {
                                                        this.cancelTask()
                                                    }}>Отменить
                                                    </div>
                                                    <div className="button-default"
                                                         onClick={this.createTaskFull}>Опубликовать
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        null
                                }

                            </div>
                            {/*<div className="feed-wrapper">*/}
                            {/*    <div className="not_news">*/}
                            {/*        Новых заданий пока нет... 🙁*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                            {
                                this.state.load === "load" ?
                                    <div className="loader-wrapper feed-wrapper">
                                        <div className="loader"/>
                                    </div>
                                    :
                                    this.state.load === "error" ?
                                        <div>
                                            <div className="not_news">Ошибка соединеия с сервером. Попробуйте поздее.
                                            </div>
                                        </div>
                                        :
                                        this.state.load === "onFocusSearch" ?
                                            <div className="feed-wrapper">
                                                <div className="not_news">
                                                    Начните вводить и мы начнем искать...
                                                </div>
                                            </div>
                                            :
                                            this.state.load === "onSearchError" ?
                                                <div className="feed-wrapper">
                                                    <div className="not_news">
                                                        К сожалению по Вашему запросу ничего не найдено 🙁
                                                    </div>
                                                </div>
                                                :
                                                this.state.load === "continueSearch" ?
                                                    <div className="feed-wrapper">
                                                        {
                                                            this.state.freeSearch?.map(data =>

                                                                    <div>{data.id}</div>
                                                                // <div key={data.id} className="users-view">
                                                                //     <div className="image-user">
                                                                //         <img className="image-user-src" src={data.avatar_url} alt={data.login}/>
                                                                //     </div>
                                                                //     <div className="info-user">
                                                                //         <div className="feed-item-title">
                                                                //             <div className="link-user" onClick={(e) => {
                                                                //                 e.preventDefault();
                                                                //                 window.location.href = `/user?id=${data?.id}`
                                                                //             }}>
                                                                //                 {data?.login}
                                                                //             </div>
                                                                //         </div>
                                                                //         <div className="more-info">
                                                                //             <div className="more-info-value">
                                                                //                 Компания:
                                                                //                 {
                                                                //                     data?.company ?
                                                                //                         " "+data.company
                                                                //                         :
                                                                //                         " не указана"
                                                                //                 }
                                                                //             </div>
                                                                //             <div className="more-info-value">
                                                                //                 Локация:
                                                                //                 {
                                                                //                     data?.location ?
                                                                //                         " "+data.location
                                                                //                         :
                                                                //                         " не указана"
                                                                //                 }
                                                                //             </div>
                                                                //         </div>
                                                                //     </div>
                                                                // </div>
                                                            )
                                                        }
                                                    </div>
                                                    :
                                                    this.state.load === "continue" ?
                                                        <div className="feed-wrapper">
                                                            {
                                                                this.state.free?.map(data =>
                                                                    <Link style={{textDecoration: "none"}}
                                                                          href={`/task?uuid=${data?.ID}`}>
                                                                        <div key={data.id} className="task-view">
                                                                            <div className="task-view-flex">
                                                                                <div className="image-user">
                                                                                    <img className="image-user-src"
                                                                                         src={data.avatar_url}
                                                                                         alt={data.login}
                                                                                         onClick={(e) => {
                                                                                             e.preventDefault();
                                                                                             window.location.href = `/user/${data?.user_creator_id}`
                                                                                         }}/>
                                                                                </div>
                                                                                <div className="info-user">
                                                                                    <div className="feed-item-title">
                                                                                        <div className="link-user">
                                                                                            {data?.title}
                                                                                        </div>
                                                                                        <div
                                                                                            className="feed-item-datetime">
                                                                                            {
                                                                                                data?.status === "wait" ?
                                                                                                    <span
                                                                                                        style={{color: "green"}}>Ожидает исполнителя</span>
                                                                                                    :
                                                                                                    <span
                                                                                                        style={{color: "green"}}>Ожидает исполнителя</span>
                                                                                            }
                                                                                        </div>
                                                                                        <div
                                                                                            className="feed-item-datetime">
                                                                                            {
                                                                                                data?.complexity === 0 ?
                                                                                                    <span
                                                                                                        style={{color: "green"}}>Легко</span>
                                                                                                    :
                                                                                                    data?.complexity === 1 ?
                                                                                                        <span
                                                                                                            style={{color: "orange"}}>Средне</span>
                                                                                                        :
                                                                                                        data?.complexity === 2 ?
                                                                                                            <span
                                                                                                                style={{color: "red"}}>Сложно</span>
                                                                                                            :
                                                                                                            <span>Сложность не определенна</span>
                                                                                            }
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="task-price">
                                                                                    <div style={{
                                                                                        display: "flex",
                                                                                        justifyContent: "center",
                                                                                        alignItems: "center",
                                                                                        color: "var(--font-color)"
                                                                                    }}>{
                                                                                        data?.price === "0" ?
                                                                                            "Вознаграждение не указано"
                                                                                        :
                                                                                            (parseInt(data?.price)).toLocaleString('ru') + " ₽"
                                                                                    }
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            {/*<div className="wrapper-bottom">*/}
                                                                            {/*    <div className="wrapper-flex-start">*/}
                                                                            {/*        <Link style={{textDecoration: "none", color: "#000"}} href={`/post?uuid=${data?.ID}`}>*/}
                                                                            {/*            <div className="button-default" >Подробнее</div>*/}
                                                                            {/*        </Link>*/}
                                                                            {/*    </div>*/}
                                                                            {/*    <div className="like_wrapper wrapper-flex-end">*/}
                                                                            {/*        <div style={{display: "flex", justifyContent: "center", alignItems: "center", color: "var(--font-color)"}}>{data?.price} ₽</div>*/}
                                                                            {/*    </div>*/}
                                                                            {/*</div>*/}
                                                                        </div>
                                                                    </Link>
                                                                )
                                                            }
                                                        </div>
                                                        :
                                                        null
                            }
                        </div>
                }


            </div>
        )
    }
}

export default Freelances;
