import './styles/main.css'
import { useState, useLayoutEffect, useEffect } from "react"
import Rodal from 'rodal'
import 'rodal/lib/rodal.css'
import { useHttp } from "./hooks/http.hook"

import Auth from './Auth'

function MainPage(){
    const { request } = useHttp()
    const [show, setShow] = useState(false)

    useLayoutEffect(() => {
        request('/api/addvisitor')
            .catch(e => console.log(e))
    }, [request])

    function writeMe(){
        const message = prompt('Write me/Напиши мне...')
        if(message === '') return
        request('/api/write', 'POST', { message })
            .then(res => alert(res.answer))
            .catch(e => alert(e))
    }

    return(
        <div className="mainPage">
            <div className="mainPageInner">
                <div className="header">
                    <h2 className="sub__header">Nothing interesting here</h2>
                    <h1 className="main__header">fjodorov.ru</h1>
                    <div className="social">
                        <div className="social__icons">
                            <a href="https://www.instagram.com/fjodorov.ru/">
                                <div className="icon__item"><i className="fab fa-instagram social__icon"></i></div>
                            </a>
                            <a href="https://t.me/fjodorov">
                                <div className="icon__item"><i className="fab fa-telegram-plane social__icon"></i></div>
                            </a>
                            <a href="mailto:fjodorov.develop@mail.ru">
                                <div className="icon__item"><i className="fas fa-envelope social__icon"></i></div>
                            </a>
                            <div className="icon__item" id="write" onClick={() => writeMe()}><i className="fas fa-pencil-alt social__icon"></i></div>
                        </div>
                    </div>
                </div>
            </div>
            <i className="fas fa-cogs admin__login" onClick={() => setShow(true)}></i>
            <Rodal visible={show}
                   customStyles={{
                       backgroundColor: 'rgba(0, 0, 0, 0.8)',
                       padding: '40px 20px',
                       width: '350px',
                       height: '350px'
                   }}
                   onClose={() => setShow(false)}>
                <Auth setShow={() => setShow(false)} />
            </Rodal>
            </div>

            )
}

export default MainPage