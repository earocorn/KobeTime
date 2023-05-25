import { collection, getDocs, getFirestore } from "firebase/firestore";
import app, { auth } from "../private/firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firestore = getFirestore(app)

function EmployeeView() {
    const navigate = useNavigate();

    let [employeeName, setEmployeeName] = useState("");
    let [employeePasscode, setEmployeePasscode] = useState("");
    let [employeeEmail, setEmployeeEmail] = useState("");
    let [employeeAdmin, setEmployeeAdmin] = useState(false);

    async function fetchCurrentEmployee() {
    if(getAuth().currentUser) {
        const employeesRef = collection(firestore, 'employees');
        const querySnapshot = await getDocs(employeesRef);
        const employee = querySnapshot.docs.find((user) => user.get('email') === getAuth().currentUser?.email)
        if(employee) {
            const employeeData = employee.data();
            setEmployeeName(employeeData.name);
            setEmployeePasscode(employeeData.passcode);
            setEmployeeEmail(employeeData.email);
            setEmployeeAdmin(employeeData.admin);
        }
    } else {
        setEmployeeName("NO CURRENT USER")
    }
}

    useEffect(() => {
        const listen = onAuthStateChanged(auth, (curUser) => {
            if(curUser) {
                fetchCurrentEmployee();
            }
        })

        return () => listen();
      }, []);

    return (
        <>
        <h1 onClick={fetchCurrentEmployee}>Welcome {employeeName}</h1>
        <p>data: {employeePasscode}, {employeeEmail}, {employeeAdmin ? "true" : "false"}</p>
        </>
    )
}

export default EmployeeView;