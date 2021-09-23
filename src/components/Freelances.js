import React, {Component} from "react";
import TextareaAutosize from "react-textarea-autosize";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import '@emotion/react'
import {MobileDatePicker} from "@mui/lab";
import {TextField} from "@mui/material";

class Freelances extends Component{
    constructor(props) {
        super(props);
        this.state = {
            mode: null,
            dateNow: new Date()
        }

    }

    cancelTask = () =>{
        this.setState({
            mode: null
        })
    }

    createTask = event => {
        this.setState({
            mode: "create"
        })
    }

    handleChange = (event) => {
        this.setState({
            dateNow: event
        })
    }



    setStartDate(d){
        console.log(d)
    }


    render() {
        return (
            <div className="content-wall-views">
                <div className="wrapper-search wrapper-inline-block unselectable">
                    <div>
                        <input placeholder="Найдем что нибудь для Вас..." onFocus={()=>{
                            this.cancelTask()
                        }}/>
                    </div>
                    <div className="tags-wrapper">
                        {
                            this.state.mode === "create" ?
                                null
                            :
                                // <div className="button-default-tag tags-item unselectable" id="all" action="create" onClick={this.createTask}>
                                //     Создать задачу
                                // </div>
                            null
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
                                        <input autoFocus={true} className="input-default" placeholder="Заголовок" type="text" />
                                    </div>
                                    <div className="wrapper-flex-end-margin">
                                        <select className="input-default" >
                                            <option value="20000">20000</option>
                                            <option value="30000">30000</option>
                                            <option value="40000">40000</option>
                                            <option value="50000">50000</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="wrapper-input">
                                    <TextareaAutosize
                                        placeholder="Описание задачи"
                                        id="message_chat"
                                        style={{
                                            borderRadius: "5px"
                                        }}
                                    >
                                    </TextareaAutosize>
                                </div>
                                <div className="wrapper-bottom">
                                    <div className="wrapper-flex-start">
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <MobileDatePicker
                                                label="Дата завершения задачи"
                                                inputFormat="dd.MM.yyyy"
                                                value={this.state.dateNow}
                                                onChange={this.handleChange}
                                                renderInput={(params) => <TextField {...params} style={{marginRight: "10px"}} />}
                                            />
                                        </LocalizationProvider>
                                        <TextField type="number" placeholder="Цена" />
                                    </div>
                                    <div className="wrapper-flex-end-margin">
                                        <div className="button-default" onClick={()=>{
                                            this.cancelTask()
                                        }}>Отменить</div>
                                        <div className="button-default">Опубликовать</div>
                                    </div>
                                </div>
                            </div>
                        :
                            null
                    }

                </div>
                <div className="feed-wrapper">
                    <div className="not_news">
                        Новых заданий пока нет... 🙁
                    </div>
                </div>
            </div>
        )
    }
}

export default Freelances;
