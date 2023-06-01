import { Timestamp, and, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { firestore } from "./private/firebase";
import { getAuth } from "firebase/auth";

export async function fetchEmployees() {
        const employeesRef = collection(firestore, 'employees');
        const querySnapshot = await getDocs(employeesRef);
  
        const employeeList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.get('name'),
          passcode: doc.get('passcode'),
          admin: doc.get('admin'),
          email: doc.get('email')
        }));

        return employeeList;
  }

  export async function fetchTimeEntries(id: string) {
    const timeEntriesRef = collection(firestore, 'timeEntries');
    const querySnapshot = await getDocs(timeEntriesRef);

    const entriesList: TimeEntry[] = querySnapshot.docs.filter((doc) => doc.get('employee_id') === id).map((doc) => ({
        id: doc.id,
        clock_in: doc.get('clock_in'),
        clock_out: doc.get('clock_out'),
        employee_id: doc.get('employee_id'),
    }));
    return entriesList;
  }

export async function fetchCurrentEmployee() {
    if(getAuth().currentUser) {
        const employeesRef = collection(firestore, 'employees');
        const querySnapshot = await getDocs(employeesRef);
        const employee = querySnapshot.docs.find((user) => user.get('email') === getAuth().currentUser?.email)
        if(employee) {
            const employeeData = employee.data();
            const employeeDataValues: Employee = {
                id: employee.id,
                name: employeeData.name,
                passcode: employeeData.passcode,
                admin: employeeData.admin,
                email: employeeData.email
              };
            return employeeDataValues;
        }
    }
}

export async function fetchEmployeeFromID(id: string) {
  const employeeRef = doc(firestore, 'employees/'+id);
  const querySnapshot = await getDoc(employeeRef);
  if(querySnapshot.exists()) {
    const employeeData = querySnapshot.data();
    const employeeDataValues: Employee = {
      id: querySnapshot.id,
      name: employeeData.name,
      passcode: employeeData.passcode,
      admin: employeeData.admin,
      email: employeeData.email
    };
    return employeeDataValues;
  } else {
    console.error('Employee does not exist! id: ' + id);
  }
}

export async function fetchEmployeeFromEmail(email: string) {
  const employeesRef = collection(firestore, 'employees');
  const querySnapshot = await getDocs(employeesRef);
  const employee = querySnapshot.docs.find((user) => user.get('email') === email);
  if(employee) {
    const employeeData = employee.data();
    const employeeDataValues: Employee = {
      id: employee.id,
      name: employeeData.name,
      passcode: employeeData.passcode,
      admin: employeeData.admin,
      email: employeeData.email
    };
    return employeeDataValues;
  }

}

export interface Employee {
  id: string;
  name: string;
  passcode: string;
  admin: boolean;
  email: string;
};

export interface TimeEntry {
  id: string;
  clock_in: Timestamp;
  clock_out: Timestamp;
}