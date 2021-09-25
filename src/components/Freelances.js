import React, {Component} from "react";
import TextareaAutosize from "react-textarea-autosize";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import CurrencyInput from 'react-currency-input-field';
import Select from 'react-select';
import '@emotion/react'
import {MobileDatePicker} from "@mui/lab";
import {TextField} from "@mui/material";

const options = [
    { value: '0', label: 'Легко' },
    { value: '1', label: 'Средне' },
    { value: '2', label: 'Сложно' },
];

const dot = (color = '#ccc') => ({
    alignItems: 'center',
    display: 'flex',

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
    control: styles => ({ ...styles, backgroundColor: 'white' }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
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
    input: styles => ({ ...styles, ...dot() }),
    placeholder: styles => ({ ...styles, ...dot() }),
    singleValue: (styles, { data }) => ({ ...styles, ...dot(data.color) }),
};

class Freelances extends Component{
    constructor(props) {
        super(props);
        this.state = {
            mode: null,
            dateNow: new Date(),
            selectedOption: null
        }

    }

    handleChangeSelect = (selectedOption) => {
        this.setState({ selectedOption }, () =>
            console.log(`Option selected:`, this.state.selectedOption)
        );
    };

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
                <div className="main-place-wrapper">
                    <p>
                        <b>Фриланс - </b> Здесь ты можешь взять чьи-то задачи в работу либо создать свою<br/>
                        Раздел пока в разработке, по этому здесь ничего нет.
                    </p>
                </div>
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
                                        <Select
                                            className="selected-box"
                                            value={this.state.selectedOption}
                                            onChange={this.handleChangeSelect}
                                            options={options}
                                            styles={colourStyles}
                                        />
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
                                        <CurrencyInput
                                            id="input-example"
                                            className="input-default"
                                            intlConfig={{ locale: 'ru-RU', currency: 'RUB' }}
                                            name="input-name"
                                            placeholder="Стоимость"
                                            defaultValue={1000}
                                            decimalsLimit={2}
                                            onValueChange={(value, name) => console.log(value, name)}
                                            style={{
                                                width: "220px"
                                            }}
                                        />
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
