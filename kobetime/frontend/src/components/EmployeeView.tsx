import { collection, getDocs, getFirestore } from "firebase/firestore";
import app, { auth } from "../private/firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { fetchCurrentEmployee } from "../employee";
import logoutIcon from '../assets/logout.svg';
import clockIcon from '../assets/clock.svg';
import wrenchIcon from '../assets/settings.svg';
import flowerIcon from '../assets/flower.svg';
import calendarIcon from '../assets/calendar.svg';

const firestore = getFirestore(app)

function EmployeeView() {
    const navigate = useNavigate();

    let [employeeName, setEmployeeName] = useState("");
    let [employeePasscode, setEmployeePasscode] = useState("");
    let [employeeEmail, setEmployeeEmail] = useState("");
    let [employeeAdmin, setEmployeeAdmin] = useState(false);

    async function handleSignOut() {
        getAuth().signOut().then(() => {
            navigate('/');
        }, () => {
            console.error("Could not sign out!");
        });
    }

    useEffect(() => {
        const listen = onAuthStateChanged(auth, (curUser) => {
            if(curUser) {
                fetchCurrentEmployee().then((employee) => {
                    if(employee) {
                        setEmployeeName(employee.name);
                        setEmployeePasscode(employee.passcode);
                        setEmployeeEmail(employee.email);
                        setEmployeeAdmin(employee.admin);
                    }
                })
            }
        })

        return () => listen();
      }, []);

    return (
        <>
        <h1 style={{ fontStyle:'italic'}}>Welcome, {employeeName}!</h1>
        <hr/>
        <div>
            <div className='container' style={{ backgroundColor:''}}>
            <h3>My Dashboard</h3>
            <div className='row g-3'>
                <div className='col-3' style={{ width:250, height:50 }}>
                    <button className='border border-secondary-subtle border-3' style={{ width: 250, height:50 }}>
                        <img src={ logoutIcon } style={{ width:20, height:20 }}/>
                        <span> Sign Out</span>
                    </button>
                </div>
                <div className='col-3' style={{ width:250, height:50 }}>
                    <button className='border border-secondary-subtle border-3' style={{ width: 250, height:50 }}>
                        <img src={ flowerIcon } style={{ width:20, height:20 }}/>
                        <span> Settings</span>
                    </button>
                </div>
                <div className='col-3' style={{ width:250, height:50 }}>
                    <button className='border border-secondary-subtle border-3' style={{ width: 250, height:50 }}>
                        <img src={ clockIcon } style={{ width:20, height:20 }}/>
                        <span> Hours</span>
                    </button>
                </div>
                <div className='col-3' style={{ width:250, height:50,}}>
                    <button className='border border-secondary-subtle border-3' style={{ width: 250, height:50 }}>
                        <img src={ calendarIcon } style={{ width:20, height:20 }}/>
                        <span> Schedule</span>
                    </button>
                </div>
                <div className='col-3' style={{ width:250, height:50 }}>
                    <button className='border border-secondary-subtle border-3' style={{ width: 250, height:50 }}>
                        <img src={ logoutIcon } style={{ width:20, height:20 }}/>
                        <span> FILLER</span>
                    </button>
                </div>
                {employeeAdmin && (
                <div className='col-3' style={{ width:250, height:50,}}>
                    <button className='border border-secondary-subtle border-3' style={{ width: 250, height:50 }}>
                        <img src={ wrenchIcon } style={{ width:20, height:20 }}/>
                        <span> Manage</span>
                    </button>
                </div>
                )}
                
            </div>
        </div>
        
            
        </div>
        <p>data: {employeePasscode}, {employeeEmail}, {employeeAdmin ? "true" : "false"}</p>
        </>
    )
}

export default EmployeeView;