import { useEffect, useState } from "react";
import { Employee, TimeEntry, fetchEmployeeFromID, fetchTimeEntries } from "../employee";
import { Timestamp } from "firebase/firestore";
import DatePicker from "react-datepicker";
import arrowIcon from "../assets/arrowRight.svg";

import "react-datepicker/dist/react-datepicker.css";
import "./Hours.css";


interface HoursProps {
    employeeID: string;
    adminView: boolean;
}

function Hours(props: HoursProps) {
    const adminView = props.adminView;
    const employeeID = props.employeeID;

    let [employee, setEmployee] = useState<Employee | null>(null);
    let [entries, setEntries] = useState<TimeEntry[]>([]);
    let [entriesInPeriod, setEntriesInPeriod] = useState<TimeEntry[]>([]);
    let [totalHoursInPeriod, setTotalHoursInPeriod] = useState(0);

    let [startDate, setStartDate] = useState(new Date());
    let [endDate, setEndDate] = useState(new Date());

    const handleStartDateChange = (date: Date) => {
        setStartDate(date);
        entries.map((entry) => {
            if(entry.clock_in.toDate().toDateString() >= date.toDateString() && entry.clock_in.toDate().toDateString() <= endDate.toDateString()) {
                setEntriesInPeriod([...entriesInPeriod, entry]);
            }
        });
        let durations: number[] = [];
        entriesInPeriod.map((entry) => {
            durations.push(parseFloat(timeDuration(entry.clock_in, entry.clock_out)));
        });
        const durationSum = durations.reduce((acc, curr) => acc + curr, 0);

        setTotalHoursInPeriod(durationSum);
    };
    
    const handleEndDateChange = (date: Date) => {
        setEndDate(date);
        entries.map((entry) => {
            if(entry.clock_in.toDate().toDateString() <= date.toDateString() && entry.clock_in.toDate().toDateString() >= startDate.toDateString()) {
                setEntriesInPeriod([...entriesInPeriod, entry]);
            }
        });
    };

    function formatTime(timestamp: Timestamp) {
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    function timeDuration(start: Timestamp, end: Timestamp) {
        const startTime = start.seconds;
        const endTime = end.seconds;
        const elapsedTime = endTime - startTime;
        const elapsedHours = elapsedTime / 60;
        return elapsedHours.toFixed(2);
    }

    useEffect(() => {
        fetchEmployeeFromID(employeeID).then((fetchedEmployee) => {
            if(fetchedEmployee) {
                setEmployee(fetchedEmployee);
            }
        })
        fetchTimeEntries(employeeID).then((fetchedEntries) => {
            if(fetchedEntries) {
                setEntries(fetchedEntries);
            }
        })
    });

    return (
        <>
        <div>
            <h1 style={{ display:'flex', justifyContent:'center', fontWeight:'lighter'}}>Hours</h1>
            <div className="container border border-dark bg- bg-opacity-25 border-3 text-center rounded-pill p-2" style={{ maxWidth:275}}>
                <div className="row" style={{ maxWidth:400, justifyContent:'left'}}>
                    <div className="col-3" style={{ }}>
                        <div style={{ }}>
                            <DatePicker wrapperClassName="datePicker" selected={startDate} onChange={handleStartDateChange}/>
                        </div>
                    </div>
                    <div className="col-3" style={{  paddingLeft:57 }}>
                        <img src={arrowIcon} style={{ width:20, height:20}}></img>
                    </div>
                    <div className="col-3" style={{ paddingLeft:34 }}>
                        <div style={{ }}>
                        <DatePicker wrapperClassName="datePicker" selected={endDate} onChange={handleEndDateChange}/>
                        </div>
                    </div>
                </div>
            </div>
            
            <h5 style={{ display:'flex', justifyContent:'center', fontWeight:'light', padding:8}}>{
            adminView === false ? "Your" : employee?.name + "'s" 
            } total hours from this period are {totalHoursInPeriod > 0 ? totalHoursInPeriod : "not available"}.</h5>
        </div>
        <div className="container border border-secondary border-4 rounded">
            <table className="table">
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">Date</th>
                    <th scope="col">Start</th>
                    <th scope="col">End</th>
                    <th scope="col">Total</th>
                    {adminView && (
                        <th scope="col"><button className="btn btn-success">Add</button></th>
                    )}
                    </tr>
                </thead>
                <tbody>
                    { entriesInPeriod && entriesInPeriod.map((entry) => {
                        return (
                            <tr>
                                <th scope="row">{entriesInPeriod.indexOf(entry)}</th>
                                <td>{entry.clock_in.toDate().toLocaleDateString()}</td>
                                <td>{formatTime(entry.clock_in)}</td>
                                <td>{formatTime(entry.clock_out)}</td>
                                <td>{timeDuration(entry.clock_in, entry.clock_out)}</td>
                                {adminView && (<td><button>Edit</button></td>)}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div>
                data: 
                { entries && entries.map((entry) => {
                    return (
                        <p key={entry.id}>Entry {entries.indexOf(entry)} clockin time : {entry.clock_in.toDate().toUTCString()}</p>
                    )
                })}
            </div>    
        </div>
        
        </>
    )
}

export default Hours;