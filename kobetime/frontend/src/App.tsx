import './App.css'
import ClockIn from './components/ClockIn'
import ListEmployees from './components/ListEmployees'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import EmployeeView from './components/EmployeeView'

function App() {

  return (
    <Router>
        <Routes>
          {/* Root page should NOT be ListEmployees component */}
          <Route path='/' Component={Login}/>
          <Route path='/clock' Component={ClockIn}/>
          <Route path='/employees' Component={ListEmployees}/>
          <Route path='/account' Component={EmployeeView}/>
        </Routes>
    </Router>
  )
}

export default App
