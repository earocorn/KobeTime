import { SetStateAction, useEffect, useState } from "react";
import { Employee, TimeEntry, fetchEmployeeFromID, fetchTimeEntries } from "../employee";
import { Timestamp } from "firebase/firestore";
import DatePicker from "react-datepicker";
import arrowIcon from "../assets/arrowRight.svg";

import "react-datepicker/dist/react-datepicker.css";
import "../styles/Hours.css";
import Table from "react-bootstrap/esm/Table";
import Stack from "react-bootstrap/esm/Stack";


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
        let periodEntries: TimeEntry[] = [];
        entries.map((entry) => {
            if(entry.clock_in.toDate() >= date && entry.clock_in.toDate() <= endDate) {
                periodEntries.push(entry);
            }
        });
        setEntriesInPeriod(periodEntries);
        refreshTotalHoursInPeriod(periodEntries);
    };
    
    const handleEndDateChange = (date: Date) => {
        setEndDate(date);
        let periodEntries: TimeEntry[] = [];
        entries.map((entry) => {
            if(entry.clock_in.toDate() <= date && entry.clock_in.toDate() >= startDate) {
                periodEntries.push(entry);
            }
        });
        setEntriesInPeriod(periodEntries);
        refreshTotalHoursInPeriod(periodEntries);
    };

    function refreshTotalHoursInPeriod(entries: TimeEntry[]) {
        let durations: number[] = [];
        entries.map((entry) => {
            let duration = entry.duration;
            if(entry.duration > 15) { duration = 0 }
            durations.push(duration);
        });
        const durationSum = durations.reduce((acc, curr) => acc + curr, 0);

        setTotalHoursInPeriod(durationSum);
    }

    function formatTime(timestamp: Timestamp) {
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    useEffect(() => {
        const fetchData = async () => {
            if(!employee) {
          fetchEmployeeFromID(employeeID).then((fetchedEmployee) => {
            if(fetchedEmployee) {
                setEmployee(fetchedEmployee);
            }
        })  
        }
        if(entries.length === 0) {
            fetchTimeEntries(employeeID).then((entries) => {
                if(entries) {
                    setEntries(entries);
                }
            })
        }
        };

        fetchData();
    }, []);

    return (
        <>
        <Stack direction='vertical' style={{ alignItems:'center'}}>
        <div>
            <h1 style={{ display:'flex', justifyContent:'center', fontWeight:'lighter'}}>Hours</h1>
            <div className="container border border-gray border-2 text-center rounded-pill p-2" style={{ maxWidth:275}}>
                <div className="row" style={{ maxWidth:400, justifyContent:'left'}}>
                    <div className="col-3" style={{ }}>
                        <div style={{ }}>
                            <DatePicker wrapperClassName="datePicker" selected={startDate} onChange={handleStartDateChange} isClearable={false}/>
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
        <div className="container border border-gray border-3 rounded" style={{ maxWidth:850, padding:10}}>
            <Table striped bordered hover>
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
                            <tr key={entry.id}>
                                <th scope="row">{entriesInPeriod.indexOf(entry)}</th>
                                <td>{entry.clock_in.toDate().toLocaleDateString()}</td>
                                <td>{formatTime(entry.clock_in)}</td>
                                <td>{formatTime(entry.clock_out)}</td>
                                <td>{entry.duration ? entry.duration.toString() : 'null'}</td>
                                {adminView && (<td><button>Edit</button></td>)}
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </div>
        </Stack>
        </>
    )
}

export default Hours;