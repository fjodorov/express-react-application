import { useState, useCallback, useEffect } from "react"
import { useHttp } from "./http.hook"

const storageName = 'userData'

export const useAuth = () => {
    const [token ,setToken] = useState(null)
    const [username, setUsername] = useState(null)
    const [userId, setUserId] = useState(null)
    const [isAdmin, setIsAdmin] = useState(0)
    const { request } = useHttp()

    const login = useCallback((jwtToken, usr, id, admin = 0) => {
        setToken(jwtToken)
        setUsername(usr)
        setUserId(id)
        setIsAdmin(admin)

        localStorage.setItem(storageName, JSON.stringify({ username: usr, userId: id, token: jwtToken, admin: admin }))
    }, [])

    const logout = useCallback(() => {
        setToken(null)
        setUsername(null)
        setUserId(null)
        setIsAdmin(0)

        localStorage.removeItem(storageName)
    }, [])

    useEffect(()=> {
        const data = JSON.parse(localStorage.getItem(storageName))

         if(data && data.token){
             request('/api/checkauth', 'POST', { token: data.token })
                 .then(res => {
                     if(res.authenticated) {
                         login(data.token, data.username, data.userId, data.admin)
                     }else{
                         logout()
                     }
                 })
         }
    },[login, logout, request])

    return { login, logout, token, username, userId, isAdmin }
}