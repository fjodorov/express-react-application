import './styles/visitors.css'
import { useHttp } from './hooks/http.hook'
import { useState, useContext, useEffect } from "react"
import { AuthContext } from "./context/AuthContext";


export default function VisitorsList(){
    const { token, logout } = useContext(AuthContext)
    const { request } = useHttp()
    const [ data, setData ] = useState({ messages: [], visits: [] })

    const listMessages = data.messages.map((el, index) =>
        <li className="collection-item list__item" key={index}><span className="li__number">{`${index}. `}</span>{`${el.text}`}</li>)
    const listVisits = data.visits.map((el, index) =>
        <li className="collection-item list__item" key={index}><span className="li__number">{`${el.id}. `}</span>{`${el.ip}, ${el.country}`}</li>)

    useEffect(() => {
        request('/api/getvisitors', 'POST', { token })
            .then(res => res.successful ? setData({messages: res.messages, visits: res.visits}) : logout())
    }, [request, token, logout])

    function clearList(list){
        request('/api/clearlist', 'POST', { token, list })
            .then(res => {
                if(res.successful){
                    setData({ ...data, [list]: [] })
                }else{
                    logout()
                }
            })
            .catch(e => alert('Error!' + e))
    }


    return(
        <div className="visitors__page">
            <ul className="collection with-header visitors__list">
                <li className="collection-header">
                    <h4 className="list__header">Messages list</h4>
                    <button className="waves-effect waves-light btn" onClick={() => clearList('messages')}>CLEAR</button>
                </li>
                { listMessages }
            </ul>

            <ul className="collection with-header messages__list">
                <li className="collection-header">
                    <h4 className="list__header">Visitors list</h4>
                    <button className="waves-effect waves-light btn" onClick={() => clearList('visits')}>CLEAR</button>

                </li>
                { listVisits }
            </ul>
        </div>
    )
}