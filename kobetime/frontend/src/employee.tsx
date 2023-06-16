import { Timestamp, and, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { firestore } from "./private/firebase";
import { getAuth } from "firebase/auth";
import { getUserGeolocation, LatLong, allowedLocations, calculateDistance } from "./private/location";

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

  function timeDuration(start: Timestamp, end: Timestamp) {
    const startTime = start.seconds;
    const endTime = end.seconds;
    const elapsedTime = endTime - startTime;
    const elapsedHours = elapsedTime / 3600;
    return elapsedHours.toFixed(2);
}

  export async function fetchTimeEntries(id: string) {
    const timeEntriesRef = collection(firestore, 'timeEntries');
    const querySnapshot = await getDocs(timeEntriesRef);

    const entriesList: TimeEntry[] = querySnapshot.docs.filter((doc) => doc.get('employee_id') === id).map((doc) => ({
        id: doc.id,
        clock_in: doc.get('clock_in'),
        clock_out: doc.get('clock_out'),
        employee_id: doc.get('employee_id'),
        duration: (parseFloat(timeDuration(doc.get('clock_in'), doc.get('clock_out')))),
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

export async function fetchEmployeeFromPasscode(passcode: string) {
  const employeesRef = collection(firestore, 'employees');
  const querySnapshot = await getDocs(employeesRef);
  const employee = querySnapshot.docs.find((user) => user.get('passcode') === passcode);
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

export async function clockEmployee(employee: Employee, inOut: string):Promise<string> {
  fetchTimeEntries(employee.id).then((entries) => {
    if(entries.find((value) => value.clock_out === null)) {

    }
    if(inOut === 'in') {

    } else if(inOut === 'out') {

    } else {
      return 'Error: Invalid clock status. Should be \'in\' or \'out\'.';
    }
    //if last timeentry is clocked in
      //if last time entry was NOT today, set auto clockout on that entry to null or autoclockout value
      //else if last time entry was today, DONT clock them in, return an error explaining that they already clocked in today
    //if last timeentry is clocked out
      //clock in employee return success


  });
  return 'Error: ';
}

export function validateAccessClock() {
  return new Promise<number>((resolve, reject) => {
    const userPos = getUserGeolocation();
        userPos.then((userLoc) => {
            let possibleDistances: LatLong[] = []; 
    
            allowedLocations.map((loc) => {
                const tempLoc: LatLong = {
                    latitude: loc.latitude,
                    longitude: loc.longitude
                }
                possibleDistances.push(tempLoc);
            });
            if(possibleDistances.length !== 0) {
              possibleDistances.map((dist) => {
                              resolve(calculateDistance(
                                userLoc.latitude,
                                userLoc.longitude,
                                dist.latitude, 
                                dist.longitude
                                )
                              );
                              return;
                          });
            } else { resolve(-1) }
        }).catch((error) => {
          console.error('Unable to retrieve geolocation:', error);
          reject(error);
        })
  })
  
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
  duration: number;
}