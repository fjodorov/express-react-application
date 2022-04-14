import './styles/auth.css'
import { useState, useContext } from "react";
import { useHttp } from './hooks/http.hook'
import {AuthContext} from "./context/AuthContext";

export default function Auth (props){
    const auth = useContext(AuthContext)
    const [form, setForm] = useState({username: ' ', password: ''})
    const { request } = useHttp()

    function onChange(event) {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    async function loginHandler(){
        try{
            const data = await request('/api/login', 'POST', {...form})
            if(data.isCorrect) {
                props.setShow()
                auth.login(data.token, data.username, data.id, data.admin)
                return
            }
            alert('Incorrect login')
        }catch (e){
            console.log(e)
        }
    }

    async function registerHandler() {
        try{
            const data = await request('/api/register', 'POST', {...form})
            if(data.isCorrect) {
                props.setShow()
                auth.login(data.token, data.username, data.id, data.admin)
                return
            }
            alert(data.message)

        }catch (e) {
            console.log(e)
        }
    }

    return(
        <div className="auth__window">
            <p className="auth__header">Login</p>
            <div className="input__item">
                <i className="fas fa-user"></i>
                <input className="auth__login" name="username" placeholder="username" type="text" onChange={event => onChange(event)}/>
            </div>
            <div className="input__item">
                <i className="fas fa-key"></i>
                <input className="auth__password" name="password" placeholder="password" type="password" onChange={event => onChange(event)}/>
            </div>
            <button className="auth__btn" onClick={loginHandler}>Sign in</button>
            <button className="auth__btn" onClick={registerHandler}>Register</button>
        </div>
    )
}