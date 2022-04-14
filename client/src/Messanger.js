import './styles/messanger.css'
import React from 'react'
import { useState, useEffect, useContext } from "react"
import { useHttp } from "./hooks/http.hook"
import { AuthContext } from "./context/AuthContext"
import { w3cwebsocket } from 'websocket'

const client = new w3cwebsocket('ws://localhost:5000/ws')



function Messanger(){
    const { request } = useHttp()
    const { token, userId, username } = useContext(AuthContext)
    const [dialogs, setDialogs] = useState([])
    const [field, setField] = useState('')
    const [dialogSwitch, setDialogSwitch] = useState({ contactId: null, messages: [] })



    const listOfDialogs = dialogs.map((el, index) => {
        return(
            <div className="contacts__item" key={ index } onClick={ () =>
                dialogSwitchHandler(el)
            }>
                <div className="contacts__avatar">
                    <i className="fas fa-user avatar"></i>
                </div>
                <div className="contacts__content">
                    <h5 className="contacts__name">{el.senderUsername}</h5>
                    <p className="contacts__lastmsg">{el.message}</p>
                </div>
            </div>
        )
    })

    useEffect(() => {
        request('/api/getcontacts', 'POST', { token })
            .then(result => {
                setDialogs(result.dialogs)
                console.log(result.dialogs)
            })

    }, [request, token])

    useEffect(() => {
        client.send(JSON.stringify({ type: 'newUser', userId, token }))
        client.onmessage = m => {
            const mes = JSON.parse(m.data).message
            switch (mes.type) {
                case 'newMessage':
                    if(dialogs.filter(e => {
                        if(e.recipient_id === mes.userId || e.sender_id === mes.userId) return false
                    }) > 0){
                        alert(1)
                    }
                    break
            }
        }
    }, [])


    const listOfMessages = dialogSwitch.messages.map((el, index) => {
        const list = el.messages.map((element, index) => {
            return(<p key={index} className="dialog__msg">{element}</p>)
        })
        return(
            <div key={index} className="dialog__item">
                <div className="dialog__avatar">
                    <i className="fas fa-user avatar"></i>
                </div>
                <div className="dialog__content">
                    <h5 className="dialog__name">{el.sender}</h5>
                    {list}
                </div>
            </div>
        )
    })

    async function sendHandler(){
        if(field === '') return
         await request('/api/sendmessage', 'POST', { sender: userId, recipient: dialogSwitch.contactId, message: field, token })
        let interimDS = dialogSwitch
        console.log(dialogSwitch)
        if(dialogSwitch.messages[0].sender === userId){
            interimDS.messages[0].messages.push(field)
        }else{
            interimDS.messages.unshift({ messages: [field], sender: userId, recipient: dialogSwitch.contactId, time: new Date().getDate() })
        }
        let interimDialogs = dialogs
        interimDialogs.forEach(el => {
            if(el.sender_id === dialogSwitch.contactId || el.recipient_id === dialogSwitch.contactId){
                el.message = field
                el.sender_id = userId
                el.recipient_id = dialogSwitch.contactId
            }
        })
        client.send(JSON.stringify({ type: 'newMessage', message: field, userId, recipientId: dialogSwitch.contactId }))
        setDialogs(interimDialogs)
        setDialogSwitch(interimDS)
        setField('')
    }

    async function dialogSwitchHandler(el){
        const contactId = el.sender_id !== userId ? el.sender_id : el.recipient_id
        let { messages } = await request('/api/loadmessages', 'POST', { idOne: el.sender_id, idTwo: el.recipient_id, token })
        messages.sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at)
        })
        let sorted = []
        messages.forEach((element) => {
            if(sorted.length > 0 && element.sender_id === sorted[sorted.length - 1].sender){
                    sorted[sorted.length - 1].messages.push(element.message)
            }else{
                sorted.push({
                    sender: element.sender_id,
                    recipient: element.recipient_id,
                    time: element.created_at,
                    messages: [element.message]
                })
            }

        })
        sorted.forEach(el => {
            el.messages.reverse()
        })
        setDialogSwitch({ messages: sorted, contactId })
    }

    async function newMessageHandler(){
        const condidate = prompt('Введи имя пользователя которому хотите написать')
        if(condidate === username) return
        const result = await request('/api/getid', 'POST', { token, username: condidate })
        console.log(result)
        if(!result.id) alert('Нет такого пользователя')
        dialogSwitchHandler({ sender_id: userId, recipient_id: result.id })

    }

    function onChangeHandler(e){
        setField(e.target.value)
    }

    return(
        <div className="messanger__container">
        <div className="messanger__inner">
            <i onClick={ () => client.send('123') } className="fas fa-arrow-circle-right send_arrow"></i>
            <i onClick={ () => newMessageHandler() } className="fas fa-arrow-circle-right send_arrow"></i>
            <div className="contacts">
                { listOfDialogs || null }
            </div>
            <div className="dialog">
                <div className="dialog__head"></div>
                <div className="dialog__body">
                    { listOfMessages || null }
                </div>
                <div className="dialog__footer">
                   <textarea value={field} onChange={e => onChangeHandler(e)}></textarea>
                    <i onClick={ () => sendHandler() } className="fas fa-arrow-circle-right send_arrow"></i>
                </div>
            </div>
        </div>
        </div>
    )
}

export default Messanger