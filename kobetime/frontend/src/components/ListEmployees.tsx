import { useEffect, useState } from "react"
import firestore from "../firebase"
import { Firestore, collection, deleteDoc, doc, getDocs } from "firebase/firestore";

interface Props {
    employees: string[]
}

function ListEmployees() {
    let [employees, setEmployees] = useState<{ id: string; name: string; passcode: string; admin: boolean; }[]>([]);
    let [showAddForm, setShowAddForm] = useState(false);
    let [newEmployeeName, setNewEmployeeName] = useState("");
    let [newEmployeePasscode, setNewEmployeePasscode] = useState("");

    useEffect(() => {
        const fetchEmployees = async () => {
          const employeesRef = collection(firestore, 'employees');
          const querySnapshot = await getDocs(employeesRef);
    
          const employeeList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.get('name'),
            passcode: doc.get('passcode'),
            admin: doc.get('admin')
          }));
    
          setEmployees(employeeList);
        };
    
        fetchEmployees();
      }, []);

    async function deleteEmployee(employeeId: string) {
        const confirmation = window.confirm('WARNING: Do you want to permanently delete this employee?');

        if(confirmation) {
            try{
                await deleteDoc(doc(firestore, 'employees', employeeId))
                setEmployees((prevEmployees) => prevEmployees.filter((employee) => employee.id !== employeeId)
              );
            } catch (error) {
                console.error('ERROR:', error)
            }
        }
    }

    function addEmployee() {
        throw new Error("Function not implemented.");
    }

    return (
        <>
        

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button style={{marginRight:'auto'}} className='btn btn-danger'>Back</button>
        <button className='btn btn-success' onClick={() => setShowAddForm(true)}>Add</button>
        </div>
        {!showAddForm && (<>
        <ul className="list-group" >
            {employees.length === 0 && <h1>NO EMPLOYEES</h1>}
            {employees.map(employee => <li style={{ display: 'flex', justifyContent: 'space-between' }} key={employee.id} className="list-group-item">
                {employee.name} Passcode: {employee.passcode} Admin: {employee.admin ? "Yes" : "No"}
                <button style={{marginLeft:'auto'}} className="btn btn-info">View</button>
                <button style={{marginLeft:10, marginRight:10}} className="btn btn-warning">Edit</button>
                <button className="btn btn-danger" onClick={() => deleteEmployee(employee.id)}>Delete</button>
                </li>)}
        </ul>
        <button style={{ }} className="btn btn-secondary">Report</button>
        </>)}

        {showAddForm && (
        <div>
          <input
            type="text"
            value={newEmployeeName}
            onChange={(e) => setNewEmployeeName(e.target.value)}
          />
          <button onClick={addEmployee}>Save</button>
          <button onClick={() => setShowAddForm(false)}>Cancel</button>
        </div>
      )}

        </>
    )
}

export default ListEmployees