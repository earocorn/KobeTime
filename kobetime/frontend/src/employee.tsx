import { collection, getDocs } from "firebase/firestore";
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

export async function fetchCurrentEmployee() {
    if(getAuth().currentUser) {
        const employeesRef = collection(firestore, 'employees');
        const querySnapshot = await getDocs(employeesRef);
        const employee = querySnapshot.docs.find((user) => user.get('email') === getAuth().currentUser?.email)
        if(employee) {
            const employeeData = employee.data();
            const employeeDataValues = {
                id: employeeData.id,
                name: employeeData.name,
                passcode: employeeData.passcode,
                admin: employeeData.admin,
                email: employeeData.email
              };
            return employeeDataValues;
        }
    }
}