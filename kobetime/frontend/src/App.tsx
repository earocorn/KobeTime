import './styles/App.css'
import ListEmployees from './components/ListEmployees'
import {  BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import EmployeeView from './components/EmployeeView'
import LoginEmail from './components/LoginEmail'
import ForgotPassword from './components/ForgotPassword'
import { getAuth } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'
import { firestore } from './private/firebase'
import ClockPage from './components/ClockPage'

function App() {
  let employeeAdmin: boolean = false;

  async function fetchCurrentEmployee() {
    if(getAuth().currentUser) {
        const employeesRef = collection(firestore, 'employees');
        const querySnapshot = await getDocs(employeesRef);
        const employee = querySnapshot.docs.find((user) => user.get('email') === getAuth().currentUser?.email)
        if(employee) {
            const employeeData = employee.data();
            return employeeData.admin;
        }
    }
    return false;
}

  return (
    <Router>
        <Routes>
          <Route path='/' Component={Login}/>
          <Route path='/clock' Component={ClockPage}/>
          <Route path='/employees' Component={ListEmployees}/>
          <Route path='/account' Component={EmployeeView}/>
          <Route path='/loginemail' Component={LoginEmail}/>
          <Route path='/forgotpassword' Component={ForgotPassword}/>
        </Routes>
    </Router>
  )
}

export default App
