import { BrowserRouter } from 'react-router-dom'
import { useRoutes } from "./useRoutes"
import { useAuth } from "./hooks/auth.hook"
import { AuthContext } from "./context/AuthContext"
import Navigation from "./Components/Navigation";
import React from "react";

function App() {
    const { token, username, userId, login, logout, isAdmin } = useAuth()
    const isAuthenticated = !!token
    const routes = useRoutes(isAuthenticated)

  return (
      <AuthContext.Provider value={{
          token, username, userId, login, logout, isAuthenticated, isAdmin
      }}>
          <BrowserRouter>

              {isAuthenticated ? <Navigation /> : ''}
              <div className="myContainer">
                  {routes}
              </div>
          </BrowserRouter>
      </AuthContext.Provider>
  );
}

export default App;
