import './App.css'
import ListEmployees from './components/ListEmployees'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Login from './components/Login'
import EmployeeView from './components/EmployeeView'
import LoginEmail from './components/LoginEmail'
import ForgotPassword from './components/ForgotPassword'
import Clock from './components/Clock'
import { getAuth } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'
import { firestore } from './private/firebase'

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
          {/* Root page should NOT be ListEmployees component */}
          <Route path='/' Component={Login}/>
          <Route path='/clock' Component={Clock}/>
          <Route path='/employees' Component={ListEmployees}/>
          <Route path='/account' Component={EmployeeView}/>
          <Route path='/loginemail' Component={LoginEmail}/>
          <Route path='/forgotpassword' Component={ForgotPassword}/>
        </Routes>
    </Router>
  )
}

export default App
