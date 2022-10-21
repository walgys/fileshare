import { useEffect, useState } from 'react'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import Login from '../pages/Login';
import { auth } from '../utilitarios/fb';
import { AuthContext } from '../contexts/authContext';
import App from '../App';
import Header from './Header';
import FilesPage from '../pages/FilesPage';


const AppRouter = (props) => {
    const [user, setUser] = useState();
    const [estado, setEstado] = useState();
    auth.onAuthStateChanged((user) => {
        if(user){
          setUser(user);
          console.log(user);
        }else{
          setUser(null);
        }
      });

   const IsAuth = ({children}) =>{
    if(user){
        return children;
    }
    return <Login />
} 

  return (
    <AuthContext.Provider
        value={{ user, estado, setEstado }}
      >
    <Router>
      <Header />
        <Routes>
            <Route path='/' element={<IsAuth><FilesPage /></IsAuth>} />
         </Routes>
    </Router>
      </AuthContext.Provider>
  )
}

export default AppRouter