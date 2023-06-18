import { SetStateAction, useEffect, useState } from "react";
import { Employee, TimeEntry, addTimeEntry, deleteTimeEntry, fetchEmployeeFromID, fetchTimeEntries } from "../employee";
import { Timestamp } from "firebase/firestore";
import DatePicker from "react-datepicker";
import arrowIcon from "../assets/arrowRight.svg";

import "react-datepicker/dist/react-datepicker.css";
import "../styles/Hours.css";
import Table from "react-bootstrap/esm/Table";
import Stack from "react-bootstrap/esm/Stack";
import Button from "react-bootstrap/esm/Button";
import ButtonGroup from "react-bootstrap/esm/ButtonGroup";
import Modal from "react-bootstrap/esm/Modal";
import Form from "react-bootstrap/esm/Form";
import { Alert } from "react-bootstrap";


interface HoursProps {
    employeeID: string;
    adminView: boolean;
}

function Hours(props: HoursProps) {

    let [employee, setEmployee] = useState<Employee | null>(null);
    let [entries, setEntries] = useState<TimeEntry[]>([]);
    let [entriesInPeriod, setEntriesInPeriod] = useState<TimeEntry[]>([]);
    let [totalHoursInPeriod, setTotalHoursInPeriod] = useState(0);

    const currentDate = new Date();
    let [startDate, setStartDate] = useState(currentDate.getDate() < 15 ? (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) : (new Date(currentDate.getFullYear(), currentDate.getMonth(), 15)));
    let [endDate, setEndDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
    let [show, setShow] = useState(false);
    let [refresh, setRefresh] = useState(false);

    //modals
    let [showAdd, setShowAdd] = useState(false);
    let [showEdit, setShowEdit] = useState(false);
    let [editId, setEditId] = useState("");
    let [showDelete, setShowDelete] = useState(false);
    let [deleteId, setDeleteId] = useState("");
    let [newData, setNewData] = useState<{[x: string]: any; }>({});
    let [editData, setEditData] = useState<{[x: string]: any; }>({});

    let [errorAlert, setErrorAlert] = useState("");

    const handleStartDateChange = (date: Date) => {
        setStartDate(date);
        let periodEntries: TimeEntry[] = [];
        setEntries([]);
        entries.map((entry) => {
            if(entry.clock_in.toDate() >= date && entry.clock_in.toDate() <= endDate) {
                periodEntries.push(entry);
            }
        });
        setEntriesInPeriod(periodEntries);
        refreshTotalHoursInPeriod(periodEntries);
    }
    
    const handleEndDateChange = (date: Date) => {
        setEndDate(date);
        let periodEntries: TimeEntry[] = [];
        setEntries([]);
        entries.map((entry) => {
            if(entry.clock_in.toDate() <= date && entry.clock_in.toDate() >= startDate) {
                periodEntries.push(entry);
            }
        });
        setEntriesInPeriod(periodEntries);
        refreshTotalHoursInPeriod(periodEntries);
    }

    function refreshTotalHoursInPeriod(entries: TimeEntry[]) {
        let durations: number[] = [];
        entries.map((entry) => {
            let duration = entry.duration;
            if(entry.duration > 15 || entry.clock_out === null) { duration = 0 }
            console.log(durations);
            durations.push(duration);
        });
        const durationSum = durations.reduce((acc, curr) => acc + curr, 0);

        setTotalHoursInPeriod(durationSum);
    }

    async function refreshTable() {
        await fetchData();
    }

    function formatTime(timestamp: Timestamp) {
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    async function refreshAll() {
        await fetchData();
        await refreshTable();
    }

    async function fetchData() {
        console.info("fetching employee id = (" + props.employeeID + ")")
        const fetchedEmployee = await fetchEmployeeFromID(props.employeeID);
        if(fetchedEmployee) {
            console.info('fetched employee : ' + fetchedEmployee)
            setEmployee(fetchedEmployee);
        }
        //const fetchedEntries = await fetchTimeEntries(props.employeeID);
        fetchTimeEntries(props.employeeID).then((fetchedEntries) => {
            setEntries(fetchedEntries);
            let periodEntries: TimeEntry[] = [];
            fetchedEntries.map((entry) => {
                if(entry.clock_in.toDate().getMonth() >= startDate.getMonth() && entry.clock_in.toDate().getMonth() <= endDate.getMonth()) {
                    if(entry.clock_in.toDate().getDate() >= startDate.getDate() && entry.clock_in.toDate().getDate() <= endDate.getDate()) {
                        periodEntries.push(entry);
                    }
                }
            })
            setEntriesInPeriod(periodEntries);
            refreshTotalHoursInPeriod(periodEntries);
        })
    };

    useEffect(() => {
        refreshAll();
    }, [props]);


    function showAddModal() {
        setShowAdd(true);
    }

    async function handleAdd() {
        if(newData.clock_in && newData.clock_out) {
            const clockInTimestamp = Timestamp.fromMillis(Date.parse(newData.clock_in));
            const clockOutTimestamp = Timestamp.fromMillis(Date.parse(newData.clock_out));
            const response = await addTimeEntry({
                clock_in: clockInTimestamp,
                clock_out: clockOutTimestamp,
                employee_id: props.employeeID,
                flag: false,
            });
            if(response === 'success') {
            setNewData({});
            setShowAdd(false);
            setErrorAlert("");
            refreshAll();
            } else {
                setErrorAlert("Please fill in all fields.");
            }
        } else {
            setErrorAlert("Please fill in all fields.");
        }
    }
    
    function showEditModal(id: string) {
        setShowEdit(true);
        setEditId(id);
    }

    function handleEdit(data: {[x: string]: any; }) {
        if(!data){
            console.error();
        }
    }

    function showDeleteModal(id: string) {
        setShowDelete(true);
        setDeleteId(id);
    }

    async function handleDelete() {
        await deleteTimeEntry(deleteId);
        setDeleteId("");
        setShowDelete(false);
        refreshAll();
    }


    return (
        <>
        {!show ? <>
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
            props.adminView === false ? "Your" : employee?.name + "'s" 
            } total hours from this period are {totalHoursInPeriod > 0 ? totalHoursInPeriod.toFixed(2) : "not available"}.</h5>
        </div>
        <div className="container border border-gray border-3 rounded" style={{ maxWidth:850, padding:10 }}>
            <Table striped bordered hover>
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">Date</th>
                    <th scope="col">Start</th>
                    <th scope="col">End</th>
                    <th scope="col">Total</th>
                    {props.adminView && (
                        <th scope="col"><button className="btn btn-success" style={{ fontWeight:'bold' }} onClick={showAddModal}>Add</button></th>
                    )}
                    </tr>
                </thead>
                <tbody>
                    { entriesInPeriod ? entriesInPeriod.map((entry) => {
                        return (
                            <tr key={entry.id}>
                                <th scope="row">{entriesInPeriod.indexOf(entry)}</th>
                                <td>{entry.clock_in.toDate().toLocaleDateString()}</td>
                                <td>{formatTime(entry.clock_in)}</td>
                                <td style={entry.flag ? { backgroundColor:'red' } : {}}>{entry.clock_out !== null ? formatTime(entry.clock_out) : 'N/A'}</td>
                                <td>{entry.duration.toString()}</td>
                                {props.adminView && (<td>
                                    <ButtonGroup>
                                        <Button className="editbutton" variant="warning" onClick={() => showEditModal(entry.id)}>Edit</Button>
                                        <Button variant="danger" onClick={() => showDeleteModal(entry.id)}>Delete</Button>
                                    </ButtonGroup>
                                    </td>)}
                            </tr>
                        );
                    }) : (<>No Entries in period</>)}
                </tbody>
            </Table>
        </div>
        </Stack>

        <Modal
        show={showAdd}
        onHide={() => {
            setShowAdd(false);
            setNewData({});
            setErrorAlert("");
        }}
        >
            <Modal.Header
            closeButton
            >
                <Modal.Title>
                    New Entry
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form>
                {errorAlert.length > 0 && (<Alert variant="danger">{errorAlert}</Alert>)}
                <input
                className="clockininput"
                type="datetime-local"
                onChange={(e) => {
                    newData.clock_in = e.target.value;
                    setErrorAlert("");
                }}
                required
                />
            <br />
                <input
                className="clockoutinput"
                type="datetime-local"
                onChange={(e) => {
                    newData.clock_out = e.target.value;
                    setErrorAlert("");
                }}
                required
                />
            </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleAdd}>
                    Submit
                </Button>
                <Button variant="danger">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>

        <Modal
        show={showEdit}
        onHide={() => {
            setShowEdit(false);
        }}
        >
            <Modal.Header
            closeButton
            >
                <Modal.Title>
                    Edit
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>

            </Modal.Body>
            <Modal.Footer>
                <Button>

                </Button>
                <Button>
                    
                </Button>
            </Modal.Footer>
        </Modal>

        <Modal
        show={showDelete}
        onHide={() => {
            setShowDelete(false);
            setDeleteId("");
        }}
        >
            <Modal.Header
            closeButton
            >
                <Modal.Title style={{ color:'red', fontWeight:'bold' }}>
                    !WARNING!
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to permanently delete this time entry?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={handleDelete}>
                    Yes
                </Button>
                <Button variant="danger" onClick={() => {
                    setShowDelete(false);
                    setDeleteId("");
                }}>
                    No
                </Button>
            </Modal.Footer>
        </Modal>

        </> : <></>}
        
        </>
    )
}

export default Hours;