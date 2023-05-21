import { useEffect, useState } from "react"
import firestore from "../firebase"
import { Firestore, addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";

interface Props {
    employees: string[]
}

function ListEmployees() {
    let [employees, setEmployees] = useState<{ id: string; name: string; passcode: string; admin: boolean; }[]>([]);
    let [showAddForm, setShowAddForm] = useState(false);
    let [showEditFormId, setShowEditFormId] = useState("");
    let [newEmployeeName, setNewEmployeeName] = useState("");
    let [newEmployeePasscode, setNewEmployeePasscode] = useState("");
    let [newEmployeeAdmin, setNewEmployeeAdmin] = useState(false);
    let [formSubmissionError, setFormSubmissionError] = useState("");

    let [editEmployeeName, setEditEmployeeName] = useState(["", ""]);
    let [editEmployeePasscode, setEditEmployeePasscode] = useState(["", ""]);
    let [editEmployeeAdmin, setEditEmployeeAdmin] = useState([false, false]);

    useEffect(() => {
        fetchEmployees();
      }, []);

    async function fetchEmployees() {
      const employeesRef = collection(firestore, 'employees');
          const querySnapshot = await getDocs(employeesRef);
    
          const employeeList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.get('name'),
            passcode: doc.get('passcode'),
            admin: doc.get('admin')
          }));
    
          setEmployees(employeeList);
    }

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

    function getEmployee(employeeId: string) {
      let editEmployee = employees.find((employee) => employee.id === employeeId) as { id: string; name: string; passcode: string; admin: boolean };
      setEditEmployeeName([editEmployee.name, editEmployee.name]);
      setEditEmployeePasscode([editEmployee.passcode, editEmployee.passcode]);
      setEditEmployeeAdmin([editEmployee.admin, editEmployee.admin]);
      return editEmployee;
    }

    async function updateEmployee() {
      let currentEmployees: string[] = [];
      let currentPasscodes: string[] = [];
      employees.map(employee => {
        currentEmployees.push(employee.name);
        currentPasscodes.push(employee.passcode);
      });

      currentEmployees = currentEmployees.filter((employee) => employee !== editEmployeeName[0]);
      currentPasscodes = currentPasscodes.filter((passcode) => passcode !== editEmployeePasscode[0]);

      let editEmployee = employees.find((employee) => employee.id === showEditFormId) as { id: string; name: string; passcode: string; admin: boolean };

      if(currentEmployees.includes(editEmployeeName[1]) || currentPasscodes.includes(editEmployeePasscode[1])) {
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

      let confirmationTextArr = [""];
      let confirmationText = "";
      if(!(editEmployee.name === editEmployeeName[1])) { confirmationTextArr.push("\nChange: " + editEmployeeName[0] + " -> " + editEmployeeName[1]) };
      if(!(editEmployee.passcode === editEmployeePasscode[1])) { confirmationTextArr.push("\nChange: " + editEmployeePasscode[0] + " -> " + editEmployeePasscode[1]) };
      if(!(editEmployee.admin === editEmployeeAdmin[1])) { confirmationTextArr.push("\nAdmin: " + editEmployeeAdmin[0] + " -> " + editEmployeeAdmin[1])};
      confirmationTextArr.map((change) => confirmationText += change)
      const confirmation = window.confirm(confirmationTextArr.length < 2 ? "No edits." : "Making the following changes: " + confirmationText);

      if(confirmation) {
        try{
          await updateDoc(doc(firestore, 'employees', showEditFormId), { name: editEmployeeName[1], passcode: editEmployeePasscode[1], admin: editEmployeeAdmin[1]});
        } catch (error) {
          console.error('ERROR: ', error);
        }
      }

      fetchEmployees();
      
      setShowEditFormId("");
      setShowAddForm(false);
      setEditEmployeeAdmin([false, false]);
      setEditEmployeeName(["", ""]);
      setEditEmployeePasscode(["", ""]);
      setFormSubmissionError("");

    }

    function renderSubmissionError() {
      return (
      <div className="alert alert-danger" role="alert">
        {formSubmissionError}
      </div>
      )
    }

    async function employeeSubmission() {
      let currentEmployees: string[] = [];
      let currentPasscodes: string[] = [];
      employees.map(employee => {
        currentEmployees.push(employee.name);
        currentPasscodes.push(employee.passcode);
      });
      //allows us to check if new employee name/code is in the current employee list
      //input checking
      if(currentEmployees.includes(newEmployeeName) || currentPasscodes.includes(newEmployeePasscode)) {
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

      const newEmployee ={
        name: newEmployeeName,
        passcode: newEmployeePasscode,
        admin: newEmployeeAdmin,
      };
      //add employee
      await addDoc(collection(firestore, 'employees'), newEmployee);

      //update employees list
      fetchEmployees();

      //take us back to employees list
      setNewEmployeeAdmin(false);
      setNewEmployeeName("");
      setNewEmployeePasscode("");
      setFormSubmissionError("");
      setShowAddForm(false);

    }

    return (
        <>
        
        {showEditFormId.length === 0 && !showAddForm && (<>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button style={{marginRight:'auto'}} className='btn btn-danger'>Back</button>
        <button className='btn btn-success' onClick={() => setShowAddForm(true)}>Add</button>
        </div>
        
        <ul className="list-group">
            {employees.length === 0 && <h1>NO EMPLOYEES</h1>}
            {employees.map(employee => <li className="list-group-item" style={{ display: 'flex', justifyContent: 'space-between' }} key={employee.id}>
                {employee.name} 
                | Passcode: {employee.passcode}
                | Admin: {employee.admin ? "Yes" : "No"}
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
       <div className="mb-3">
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
       <div className="mb-3">
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
       <div className="form-check mb-3">
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
       {formSubmissionError.length > 0 && renderSubmissionError()}
       <button type="button" className="btn btn-primary" onClick={employeeSubmission}>
         Submit
       </button>
       <button type="button" className="btn btn-secondary" onClick={() => {
        setShowAddForm(false);
        setNewEmployeeAdmin(false);
        setNewEmployeeName("");
        setNewEmployeePasscode("");
        setFormSubmissionError("");
        }}>
         Cancel
       </button>
     </form>
   </div>
   </>
      )}

      { showEditFormId.length > 0 && (
        <>
      <h1 style={{ display:'flex', justifyContent:'center' }}>Edit Employee {editEmployeeName[0]}</h1>
     <div style={{ display:'flex', justifyContent:'center'}}>
     <form>
       <div className="mb-3">
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
       <div className="mb-3">
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
       {formSubmissionError.length > 0 && renderSubmissionError()}
       <button type="button" className="btn btn-primary" onClick={updateEmployee}>
         Submit
       </button>
       <button type="button" className="btn btn-secondary" onClick={() => {
        setShowEditFormId("");
        setShowAddForm(false);
        setEditEmployeeAdmin([false, false]);
        setEditEmployeeName(["", ""]);
        setEditEmployeePasscode(["", ""]);
        setFormSubmissionError("");
        }}>
         Cancel
       </button>
     </form>
   </div>
   </>
      )}
        </>
    )
}

export default ListEmployees