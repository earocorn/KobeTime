import { useEffect, useState } from "react"
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, updateDoc } from "firebase/firestore";
import app, { auth } from "../private/firebase";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendPasswordResetEmail, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import NotifMessage from "./NotifMessage";
import { fetchEmployees } from "../employee";

const firestore = getFirestore(app);

function ListEmployees() {
    const navigate = useNavigate();

    let [employees, setEmployees] = useState<{ id: string; name: string; passcode: string; admin: boolean; email: string; }[]>([]);
    let [showAddForm, setShowAddForm] = useState(false);
    let [showEditFormId, setShowEditFormId] = useState("");
    let [newEmployeeName, setNewEmployeeName] = useState("");
    let [newEmployeePasscode, setNewEmployeePasscode] = useState("");
    let [newEmployeeEmail, setNewEmployeeEmail] = useState("");
    let [newEmployeeAdmin, setNewEmployeeAdmin] = useState(false);

    let [formSubmissionError, setFormSubmissionError] = useState("");
    let [notification, setNotification] = useState("");

    let [editEmployeeName, setEditEmployeeName] = useState(["", ""]);
    let [editEmployeePasscode, setEditEmployeePasscode] = useState(["", ""]);
    let [editEmployeeEmail, setEditEmployeeEmail] = useState(["", ""]);
    let [editEmployeeAdmin, setEditEmployeeAdmin] = useState([false, false]);

    function handleSignOut() {
      auth.signOut().then(function() {
        console.log('Signed out user: ' + ((auth.currentUser?.email == undefined) ? "No user signed in." : auth.currentUser?.email));
        navigate('/')
      }, function(error) {
        console.error('Error signing out: ', error);
      })
    }

    useEffect(() => {
        fetchEmployees().then((updatedEmployees) => {
          setEmployees(updatedEmployees);
        });
      }, []);

    onAuthStateChanged(auth, async (user) => {
      if(!user) {
        navigate('/')
      }
      fetchEmployees().then((curEmployees) => {
        const curEmployee = curEmployees.find((employee) => employee.email === getAuth().currentUser?.email);
        if(!curEmployee) {
          console.error('No employee logged in.');
        } else
        if(curEmployee?.admin === false) {
          navigate('/')
        }
      })
    })

    async function deleteEmployee(employeeId: string) {
        const confirmation = window.confirm('WARNING: Do you want to permanently delete this employee?');

        if(confirmation) {
            try{
                await deleteDoc(doc(firestore, 'employees', employeeId))
                setEmployees((prevEmployees) => prevEmployees.filter((employee) => employee.id !== employeeId));
            } catch (error) {
                console.error('ERROR:', error);
            }
        }
    }

    function validateEmail(email: string) {
      const atIndex = email.indexOf('@');
      const dotIndex = email.indexOf('.');

      if(atIndex !== -1 && dotIndex !== -1) {
        if(atIndex < dotIndex) {
          if(atIndex !== 0 && dotIndex !== email.length - 1) {
            setFormSubmissionError("");
            return true;
          }
        }
      }
      setFormSubmissionError("Invalid email!");
      console.error("Something is wrong with email validation.")
      return false;
    }

    function getEmployee(employeeId: string) {
      let editEmployee = employees.find((employee) => employee.id === employeeId) as { id: string; name: string; passcode: string; admin: boolean, email: string };
      setEditEmployeeName([editEmployee.name, editEmployee.name]);
      setEditEmployeePasscode([editEmployee.passcode, editEmployee.passcode]);
      setEditEmployeeAdmin([editEmployee.admin, editEmployee.admin]);
      setEditEmployeeEmail([editEmployee.email, editEmployee.email]);
      return editEmployee;
    }

    async function updateEmployee() {
      let currentEmployees: string[] = [];
      let currentPasscodes: string[] = [];
      let currentEmails: string[] = [];
      employees.map(employee => {
        currentEmployees.push(employee.name);
        currentPasscodes.push(employee.passcode);
        currentEmails.push(employee.email);
      });

      currentEmployees = currentEmployees.filter((employee) => employee !== editEmployeeName[0]);
      currentPasscodes = currentPasscodes.filter((passcode) => passcode !== editEmployeePasscode[0]);
      currentEmails = currentEmails.filter((email) => email !== editEmployeeEmail[0]);

      let editEmployee = employees.find((employee) => employee.id === showEditFormId) as { id: string; name: string; passcode: string; admin: boolean; email: string };

      if(currentEmployees.includes(editEmployeeName[1]) || currentPasscodes.includes(editEmployeePasscode[1]) || currentEmails.includes(editEmployeeEmail[1])) {
        setFormSubmissionError("Employee already exists or passcode has been taken!");
        return;
      }
      if(editEmployeeName[1].length === 0) {
        setFormSubmissionError("Please enter an employee name!");
        return;
      }
      if(!/^\d{1,5}$/.test(editEmployeePasscode[1])) {
        setFormSubmissionError("Passcode must be a number 5 digits or less!");
        return;
      }
      if(!validateEmail(editEmployeeEmail[1])) {
        return;
      }

      let confirmationTextArr = [""];
      let confirmationText = "";
      if(!(editEmployee.name === editEmployeeName[1])) { confirmationTextArr.push("\nChange: " + editEmployeeName[0] + " -> " + editEmployeeName[1]) };
      if(!(editEmployee.passcode === editEmployeePasscode[1])) { confirmationTextArr.push("\nChange: " + editEmployeePasscode[0] + " -> " + editEmployeePasscode[1]) };
      if(!(editEmployee.email === editEmployeeEmail[1])) { confirmationTextArr.push("\nEmail: " + editEmployeeEmail[0] + " -> " + editEmployeeEmail[1])};
      if(!(editEmployee.admin === editEmployeeAdmin[1])) { confirmationTextArr.push("\nAdmin: " + editEmployeeAdmin[0] + " -> " + editEmployeeAdmin[1])};
      confirmationTextArr.map((change) => confirmationText += change)
      const confirmation = window.confirm(confirmationTextArr.length < 2 ? "No edits." : "Making the following changes: " + confirmationText);

      if(confirmation) {
        try{
          await updateDoc(doc(firestore, 'employees', showEditFormId), { name: editEmployeeName[1], passcode: editEmployeePasscode[1], admin: editEmployeeAdmin[1], email: editEmployeeEmail[1]});
          const updatedEmployees = await fetchEmployees();
          //needs backend code to delete old emails
          await addDefaultUser(editEmployeeEmail[1], updatedEmployees);
        } catch (error) {
          console.error(error);
        }
      }

      fetchEmployees();
      
      setShowEditFormId("");
      setShowAddForm(false);
      setEditEmployeeAdmin([false, false]);
      setEditEmployeeName(["", ""]);
      setEditEmployeePasscode(["", ""]);
      setEditEmployeeEmail(["", ""])
      setFormSubmissionError("");

    }

    async function addDefaultUser(email: string, employees: { id: string; name: string; passcode: string; admin: boolean; email: string; }[] ) {
      fetchEmployees();
      console.log(employees);
      let employeeFromEmail = employees.find((employee) => employee.email === email) as { id: string; name: string; passcode: string; admin: boolean, email: string };
      if(employeeFromEmail) {
      let idViaEmail: string = employeeFromEmail.id;
      console.log("addDefaultUser() called with " + email + " and " + idViaEmail)
        try{
            const userCredential = await createUserWithEmailAndPassword(auth, email, idViaEmail);
            const curUser = userCredential.user;
            
            console.log("Created employee " + curUser.email + " with default password.");
            if(curUser.email) {
              sendPasswordResetEmail(getAuth(), curUser.email).then(() => {

              })
            }
            getAuth().signOut();
        } catch (error) {
          setFormSubmissionError("OOPS")
        }
      } else {
        console.error("Employee not found!");
      }
    }

    async function employeeSubmission() {
      let currentEmployees: string[] = [];
      let currentPasscodes: string[] = [];
      let currentEmails: string[] = [];
      employees.map(employee => {
        currentEmployees.push(employee.name);
        currentPasscodes.push(employee.passcode);
        currentEmails.push(employee.email);
      });
      //allows us to check if new employee name/code is in the current employee list
      //input checking
      if(currentEmployees.includes(newEmployeeName) || currentPasscodes.includes(newEmployeePasscode) || currentEmails.includes(newEmployeeEmail)) {
        setFormSubmissionError("Employee already exists or passcode has been taken!");
        return;
      }
      if(newEmployeeName.length === 0) {
        setFormSubmissionError("Please enter an employee name!");
        return;
      }
      if(!/^\d{1,5}$/.test(newEmployeePasscode)) {
        setFormSubmissionError("Passcode must be a number 5 digits or less!");
        return;
      }
      if(!validateEmail(newEmployeeEmail)) {
        return;
      }

      const newEmployee ={
        name: newEmployeeName,
        passcode: newEmployeePasscode,
        admin: newEmployeeAdmin,
        email: newEmployeeEmail,
      };
      //add employee
      try{
      await addDoc(collection(firestore, 'employees'), newEmployee);
      const updatedEmployees = await fetchEmployees();
      await addDefaultUser(newEmployee.email, updatedEmployees)
      } catch (error) {
        console.error(error)
        const employeeToDelete: string | undefined = (await fetchEmployees()).find((employee) => employee.email  === newEmployee.email)?.id
        if(employeeToDelete) {
          await deleteDoc(doc(firestore, 'employees', employeeToDelete));
          console.log("Deleted employee " + newEmployee.name);
        }
        else {
          console.error("No employee to delete.");
        }
      } finally {
        console.log("WE DID IT O_O")
      }
        //update employees list
      fetchEmployees();

      //take us back to employees list
      setNewEmployeeAdmin(false);
      setNewEmployeeName("");
      setNewEmployeePasscode("");
      setNewEmployeeEmail("");
      setFormSubmissionError("");
      setShowAddForm(false);

    }

    async function handleGoToClock() {
      navigate('/clock')
    }
    
    async function handleGoToProfile() {
      navigate('/account')
    }

    return (
        <>
        
        {showEditFormId.length === 0 && !showAddForm && (<>
        <div style={{ display: 'flex' }} className="btn-group">
        <button style={{marginRight:'auto'}} className='btn btn-danger' onClick={() => handleSignOut()}>Sign Out</button>
        <button className='btn btn-primary' onClick={handleGoToClock}>Clock</button>
        <button className='btn btn-info' onClick={handleGoToProfile}>My Account</button>
        <button className='btn btn-success' onClick={() => setShowAddForm(true)}>Add</button>
        </div>
        
        <ul className="list-group">
            {employees.length === 0 && <h1>NO EMPLOYEES</h1>}
            {employees.map(employee => <li className="list-group-item" style={{ display: 'flex', justifyContent: 'space-between' }} key={employee.id}>
                {employee.name} 
                | Passcode: {employee.passcode}
                | Admin: {employee.admin ? "Yes" : "No"}
                | Email: {employee.email}
                <button style={{marginLeft:'auto'}} className="btn btn-info">View</button>
                <button style={{marginLeft:10, marginRight:10}} className="btn btn-warning" onClick={() => 
                  {
                    setShowEditFormId(employee.id);
                    getEmployee(employee.id);
                    }}>Edit</button>
                <button className="btn btn-danger" onClick={() => deleteEmployee(employee.id)}>Delete</button>
                </li>)}
        </ul>
        <button style={{ }} className="btn btn-secondary">Report</button>
        </>)}

        {showAddForm && (
          <>
      <h1 style={{ display:'flex', justifyContent:'center' }}>New Employee</h1>
     <div style={{ display:'flex', justifyContent:'center'}}>
     <form className="form-floating">
      <div className="container-sm border border-5 border-warning rounded-5" style={{ maxWidth:350, justifyContent:'center', padding:20, backgroundColor:'blanchedalmond'}}>
        <div className="col mb-3">
        <NotifMessage notifmsg="Please inform new employees to check their email to set a password."/>
       <div className="row mb-3">
         <label htmlFor="employeeName" className="form-label">
           Employee Name
         </label>
         <input
           type="text"
           className="form-control"
           id="employeeName"
           value={newEmployeeName}
           onChange={(e) => {
            setNewEmployeeName(e.target.value);
            setFormSubmissionError("");
          }}
         />
       </div>
       <div className="row mb-3">
         <label htmlFor="employeePasscode" className="form-label">
           Passcode
         </label>
         <input
           type="text"
           className="form-control"
           id="employeePasscode"
           value={newEmployeePasscode}
           onChange={(e) => {
            setNewEmployeePasscode(e.target.value);
            setFormSubmissionError("");
          }}
          aria-describedby="inputGroupPrepend" 
          required
         />
       </div>
       <div className="row mb-3">
         <label htmlFor="employeeEmail" className="form-label">
           Email
         </label>
         <input
           type="text"
           className="form-control"
           id="employeeEmail"
           value={newEmployeeEmail}
           onChange={(e) => {
            setNewEmployeeEmail(e.target.value);
            setFormSubmissionError("");
          }}
          placeholder="name@example.com"
          aria-describedby="inputGroupPrepend" 
          required
         />
       </div>
       <div className="row mb-3">
       <div className="form-check">
         <input
           type="checkbox"
           className="form-check-input"
           id="isAdmin"
           checked={newEmployeeAdmin}
           onChange={(e) => setNewEmployeeAdmin(e.target.checked)}
         />
         <label className="form-check-label" htmlFor="isAdmin">
           Admin
         </label>
        </div>
       </div>
       <ErrorMessage errormsg={formSubmissionError}/>
       <div className="row mb-3 gap-2" style={{ display:'flex', justifyContent:'center'}}>
       <button type="button" className="btn btn-primary rounded-pill" style={{ maxWidth:200, display:'flex' , justifyContent:'center', fontWeight:"bold"}} onClick={employeeSubmission}>
         Submit
       </button>
       <button type="button" className="btn btn-danger rounded-pill" style={{ maxWidth:200, display:'flex' , justifyContent:'center', fontWeight:"bold"}} onClick={() => {
        setShowAddForm(false);
        setNewEmployeeAdmin(false);
        setNewEmployeeName("");
        setNewEmployeePasscode("");
        setNewEmployeeEmail("");
        setFormSubmissionError("");
        }}>
         Cancel
       </button>
       </div>
       </div>
       </div>
     </form>
   </div>
   </>
      )}

      { showEditFormId.length > 0 && (
        <>
      <h1 style={{ display:'flex', justifyContent:'center' }}>Edit Employee {editEmployeeName[0]}</h1>
     <div style={{ display:'flex', justifyContent:'center'}}>
     <form>
      <div className="container-sm border border-5 border-warning rounded-5" style={{ maxWidth:350, justifyContent:'center', padding:20, backgroundColor:'blanchedalmond'}}>
       <div className="col mb-3">
       <div className="row mb-3">
         <label htmlFor="employeeName" className="form-label">
           Employee Name <small className="text-body-secondary">(Previously: {editEmployeeName[0]})</small>
         </label>
         <input
           type="text"
           className="form-control"
           id="employeeName"
           value={editEmployeeName[1]}
           onChange={(e) => {
            setEditEmployeeName([editEmployeeName[0], e.target.value]);
            setFormSubmissionError("");
          }}
         />
         </div>
       </div>
       <div className="row mb-3">
         <label htmlFor="employeePasscode" className="form-label">
           Passcode <small className="text-body-secondary">(Previously: {editEmployeePasscode[0]})</small>
         </label>
         <input
           type="text"
           className="form-control"
           id="employeePasscode"
           value={editEmployeePasscode[1]}
           onChange={(e) => {
            setEditEmployeePasscode([editEmployeePasscode[0], e.target.value]);
            setFormSubmissionError("");
          }}
         />
       </div>
       <div className="row mb-3">
         <label htmlFor="editEmail" className="form-label">
           Email <small className="text-body-secondary">(Previously: {editEmployeeEmail[0]})</small>
         </label>
         <input
           type="text"
           className="form-control"
           id="editEmail"
           value={editEmployeeEmail[1]}
           onChange={(e) => {
            setEditEmployeeEmail([editEmployeeEmail[0], e.target.value]);
            setFormSubmissionError("");
          }}
          aria-describedby="inputGroupPrepend" 
          required
         />
       </div>
       <div className="row mb-3">
       <div className="mb-3 form-check">
         <input
           type="checkbox"
           className="form-check-input"
           id="isAdmin"
           checked={editEmployeeAdmin[1]}
           onChange={(e) => setEditEmployeeAdmin([editEmployeeAdmin[0], e.target.checked])}
         />
         <label className="form-check-label" htmlFor="isAdmin">
           Admin
         </label>
         </div>
       </div>
       <ErrorMessage errormsg={formSubmissionError}/>
       <div className="row mb-3 gap-2" style={{ display:'flex', justifyContent:'center'}}>
       <button type="button" className="btn btn-primary rounded-pill" style={{ maxWidth:200, display:'flex' , justifyContent:'center', fontWeight:"bold"}} onClick={updateEmployee}>
         Submit
       </button>
       <button type="button" className="btn btn-danger rounded-pill" style={{ maxWidth:200, display:'flex' , justifyContent:'center', fontWeight:"bold"}} onClick={() => {
        setShowEditFormId("");
        setShowAddForm(false);
        setEditEmployeeAdmin([false, false]);
        setEditEmployeeName(["", ""]);
        setEditEmployeePasscode(["", ""]);
        setEditEmployeeEmail(["", ""]);
        setFormSubmissionError("");
        }}>
         Cancel
       </button>
       </div>
       </div>
     </form>
   </div>
   </>
      )}
        </>
    )
}

export default ListEmployees