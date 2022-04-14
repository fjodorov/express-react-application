import '../styles/materialize.min.css'
import { NavLink } from 'react-router-dom'
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";



export default function Navigation(){
    const { logout, isAdmin } = useContext(AuthContext)
    return(
        <nav className="navigation">
            <div className="nav-wrapper">
                <a href="/" className="brand-logo">Admin menu</a>
                <ul id="nav-mobile" className="right hide-on-med-and-down">
                    <li><NavLink to="/">Main</NavLink></li>
                    { isAdmin ? <li><NavLink to="/visitorslist">Visitors list</NavLink></li> : null }
                    <li><NavLink to="/messanger">Messanger</NavLink></li>
                    <li onClick={() => logout()}><a href="/">EXIT</a></li>
                </ul>
            </div>
        </nav>
    )
}