import React from "react"
import { Switch, Route, Redirect } from 'react-router-dom'
import MainPage from "./MainPage"
import VisitorsList from "./VisitorsList";
import Messanger from './Messanger'

export const useRoutes = isAuthenticated => {

    if(isAuthenticated){
        return(
            <Switch>
                <Route path="/" exact>
                    <MainPage />
                </Route>
                <Route path="/visitorslist" exact>
                    <VisitorsList />
                </Route>
                <Route path="/messanger" exact>
                    <Messanger />
                </Route>
            </Switch>
        )
    }else{
        return(
            <Switch>
                <Route path="/" exact>
                    <MainPage />
                </Route>
                <Redirect to="/"/>
            </Switch>
        )
    }
}