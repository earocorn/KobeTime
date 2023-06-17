import { Timestamp, addDoc, and, collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
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
        duration: (doc.get('clock_out') !== null ? parseFloat(timeDuration(doc.get('clock_in'), doc.get('clock_out'))) : 0),
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
  const employeesRef = collection(firestore, 'employees');
  const querySnapshot = await getDocs(employeesRef);
  const employee = querySnapshot.docs.find((user) => user.id === id);
  if(employee) {
    const employeeData = employee.data();
    const employeeDataValues: Employee = {
      id: employeeData.id,
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

export async function clockEmployee(employee: Employee, inOut: string, time: Date):Promise<string> {
  const ERROR_GENERAL = "Error: Unable to clock in/out at this time.";
  const newEntry = {
    clock_in: Timestamp.fromDate(time),
    clock_out: null,
    employee_id: employee.id,
  };

  const entries = await fetchTimeEntries(employee.id);
  entries.sort((a, b) => a.clock_in.toMillis() - b.clock_in.toMillis());
  try {

    if(entries.find((entry) => entry.clock_out === null)) {
    const lastEntry = entries.reduceRight((acc, cur) => acc || cur);
    if(lastEntry) {
      if(inOut === 'in') {

        if(isSameDay(lastEntry.clock_in.toDate(), new Date())) {
          return 'Error: You are already clocked in today!';
          // already clocked in
        } else {
          // clock in new timestamp and set lastentry clockout to null
          const lastEntryDocument = doc(firestore, 'timeEntries', lastEntry.id);
          await updateDoc(lastEntryDocument, { clock_out: null });
          await addDoc(collection(firestore, 'timeEntries'), newEntry)
          return 'success';
        }
      } else if(inOut === 'out') {
        console.error('The out clause.')
        const lastEntryDocument = doc(firestore, 'timeEntries', lastEntry.id);
        await updateDoc(lastEntryDocument, { clock_out: Timestamp.fromDate(time) });
        return 'success';
      } else {
        //invalid operation, should be 'in' or 'out'
          return 'Error: Invalid operation.';
        }
      }

      } else {
        if (inOut === 'in') {
          //clock in because theres no NULL clockout as last entry
          await addDoc(collection(firestore, 'timeEntries'), newEntry);
          return 'success';
        } else {
          //employee is already clocked out
          return 'Error: You are not clocked in!';
        }
      }
  } catch (error) {
    console.error(error);
    return ERROR_GENERAL;
  }
    //if last timeentry is clocked in
      //if last time entry was NOT today, set auto clockout on that entry to null or autoclockout value
      //else if last time entry was today, DONT clock them in, return an error explaining that they already clocked in today
    //if last timeentry is clocked out
      //clock in employee return success
  return 'end of statement';
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
  clock_out: Timestamp | null;
  duration: number;
}

export function isSameDay(date1: Date, date2: Date) {
  if(date1.getUTCDay() === date2.getUTCDay()) {
    return true;
  }
  return false;
}
