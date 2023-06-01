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
import Hours from "./Hours";

const firestore = getFirestore(app)


interface RenderProps {
    view: string;
    employeeID: string;
}

function RenderView(props: RenderProps) {

    switch (props.view) {
        case "hours":
            return (
                <Hours employeeID={props.employeeID} adminView={false}/>
            )
            break;
        case "schedule":
            return (
                <>
                <h1>schedule goes here</h1>
                </>
            )
            break;
        case "settings":
            return (
                <>
                <h1>Settings go here</h1>
                </>
            )
        default:
            break;
    }

    return (
        <>
        <h1>Nothin to see here folks. ༼ つ ◕_◕ ༽つ</h1>
        </>
    )
}

function EmployeeView() {
    const navigate = useNavigate();

    let [employeeID, setEmployeeID] = useState("");
    let [employeeName, setEmployeeName] = useState("");
    let [employeePasscode, setEmployeePasscode] = useState("");
    let [employeeEmail, setEmployeeEmail] = useState("");
    let [employeeAdmin, setEmployeeAdmin] = useState(false);

    let [selectedButton, setSelectedButton] = useState("");

    async function handleSignOut() {
        const confirmation = window.confirm("Are you sure you want to sign out?")

        if(confirmation) {
            getAuth().signOut().then(() => {
                navigate('/');
            }, () => {
                console.error("Could not sign out!");
            });
        }
    }

    function handleViewClick(view: string) {
        setSelectedButton(view);
    }

    async function manageButtonClick() {
        navigate('/employees');
    }

    useEffect(() => {
        const listen = onAuthStateChanged(auth, (curUser) => {
            if(curUser) {
                fetchCurrentEmployee().then((employee) => {
                    if(employee) {
                        setEmployeeID(employee.id);
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
            <div style={{ }}>
            <h3>My Dashboard</h3>
            <div className='row row-cols-3 g-2' style={{ maxWidth:900 }}>
                <div className='col' style={{ display:'flex' ,justifyContent:'center' }}>
                    <button className='border border-secondary-subtle border-3 rounded-4' style={{ width:250, height:75 }} onClick={handleSignOut}>
                        <img src={ logoutIcon } style={{ width:20, height:20 }}/>
                        <span> Sign Out</span>
                    </button>
                </div>
                <div className='col' style={{  display:'flex' ,justifyContent:'center' }}>
                    <button className='border border-secondary-subtle border-3 rounded-4' style={{ width:250, height:75 }} onClick={() => handleViewClick('settings')}>
                        <img src={ flowerIcon } style={{ width:20, height:20 }}/>
                        <span> Settings</span>
                    </button>
                </div>
                <div className='col' style={{  display:'flex' ,justifyContent:'center' }}>
                    <button className='border border-secondary-subtle border-3 rounded-4' style={{ width:250, height:75 }} onClick={() => handleViewClick('hours')}>
                        <img src={ clockIcon } style={{ width:20, height:20 }}/>
                        <span> Hours</span>
                    </button>
                </div>
                <div className='col' style={{  display:'flex' ,justifyContent:'center' }}>
                    <button className='border border-secondary-subtle border-3 rounded-4' style={{ width:250, height:75 }} onClick={() => handleViewClick('schedule')}>
                        <img src={ calendarIcon } style={{ width:20, height:20 }}/>
                        <span> Schedule</span>
                    </button>
                </div>
                <div className='col' style={{  display:'flex' ,justifyContent:'center' }}>
                    <button className='border border-secondary-subtle border-3 rounded-4' style={{ width:250, height:75 }} onClick={() => handleViewClick('filler')}>
                        <img src={ logoutIcon } style={{ width:20, height:20 }}/>
                        <span> FILLER</span>
                    </button>
                </div>
                {employeeAdmin && (
                <div className='col' style={{  display:'flex' ,justifyContent:'center' }}>
                    <button className='border border-secondary-subtle border-3 rounded-4' style={{ width:250, height:75 }} onClick={manageButtonClick}>
                        <img src={ wrenchIcon } style={{ width:20, height:20 }}/>
                        <span> Manage</span>
                    </button>
                </div>
                )}
            </div>
        </div>
        </div>
        <hr/>
        <RenderView view={selectedButton} employeeID={employeeID}/>
        <p>data:{employeeID}, {employeePasscode}, {employeeEmail}, {employeeAdmin ? "true" : "false"}</p>
        </>
    )
}

export default EmployeeView;