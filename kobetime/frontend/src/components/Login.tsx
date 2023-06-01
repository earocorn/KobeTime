import { createUserWithEmailAndPassword, getAuth, isSignInWithEmailLink, onAuthStateChanged, sendPasswordResetEmail, sendSignInLinkToEmail, signInWithEmailAndPassword, signInWithEmailLink, signOut } from "firebase/auth";
import app, { auth, firestore } from "../private/firebase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import { collection, getDocs } from "firebase/firestore";

function Login() {

    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [signedIn, setSignedIn] = useState(false);
    let [errorText, setErrorText] = useState("");

    let [employeeName, setEmployeeName] = useState("");
    let [employeePasscode, setEmployeePasscode] = useState("");
    let [employeeEmail, setEmployeeEmail] = useState("");
    let employeeAdmin: boolean = false;

    async function fetchCurrentEmployee() {
        if(getAuth().currentUser) {
            const employeesRef = collection(firestore, 'employees');
            const querySnapshot = await getDocs(employeesRef);
            const employee = querySnapshot.docs.find((user) => user.get('email') === getAuth().currentUser?.email)
            if(employee) {
                const employeeData = employee.data();
                setEmployeeName(employeeData.name);
                setEmployeePasscode(employeeData.passcode);
                setEmployeeEmail(employeeData.email);
                employeeAdmin = employeeData.admin;
            }
        } else {
            setEmployeeName("NO CURRENT USER")
        }
    }

    const navigate = useNavigate();

    async function handleSignIn() {
        try{
            if(!signedIn) {
                    console.log(getAuth().currentUser)
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    console.log("Signed in user " + user.email);
                    setSignedIn(true)
                    if(employeeAdmin) {
                        navigate('/employees')
                    } else {
                    console.log("err")
                    navigate('/account')
                    }
            }
            } catch(error) {
            setSignedIn(false)
            console.error("Could not sign in user!")
            setErrorText("Invalid email and/or password.")
            }
        }
    
    async function handleSignOut() {
        getAuth().signOut();
        setSignedIn(false);
    }
    
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');

        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        } else {
            signInWithEmailLink(auth, email, window.location.href)
            .then(() => {
              window.localStorage.removeItem('emailForSignIn');
            })
            .catch((error) => {
              console.error(error);
            });
        }

      }
    

    useEffect(() => {
        const listen = onAuthStateChanged(auth, async (curUser) => {
            if (curUser) {
              await fetchCurrentEmployee()
                setSignedIn(true)
                const uid = curUser.uid;
                console.log("user is signed in : " + curUser.email)
                console.log(signedIn)
                //signOut(auth)
                if(employeeAdmin) {
                      navigate('/employees')
                  } else {
                      console.log('test')
                      navigate('/account')
                  }
            } else {
                console.error("No one signed in. " + auth.currentUser?.email);
            }
          });

          return () => listen();
    }, []);
    
    return (
        <>
        { !signedIn && (<>
        <h1 style={{ display:'flex', justifyContent:'center'}}>Login</h1>
        <div>
            <div className="container-sm border border-5 border-success rounded-5" style={{ maxWidth:350, justifyContent:'center', padding:20 }}>
            <div style={{ display:'flex', justifyContent:'center', borderBlock:'auto'}} className="container">
                <div className="col mb-3">
                <div className="row mb-3">
                    <label htmlFor="emailSignInInput" className="form-label">Email</label>
                    <input type="email" className="form-control" id="emailSignInInput" placeholder="name@example.com" onChange={(e) => {
                        setEmail(e.target.value)
                        setErrorText("")
                    }}/>
                </div>
                <div className="row mb-3">
                    <label htmlFor="passSignInInput" className="form-password">Password</label>
                    <input type="password" className="form-control" id="passSignInInput" onChange={(e) => {
                        setPassword(e.target.value)
                        setErrorText("")
                    }}/>
                </div>
                <div className="row mb-2">
                    <ErrorMessage errormsg={errorText}/>
                    <button className="btn btn-primary" onClick={handleSignIn}>Sign In</button>
                </div>
                <div className="row mb-2">
                    <a className="link" href="/loginemail" style={{ display:'flex', justifyContent:'center' }}>Sign in via email</a>
                </div>
                <div className="row mb-2">
                    <a className="link" href="/forgotpassword" style={{ display:'flex', justifyContent:'center' }}>Forgot Password?</a>
                </div>
                </div>
            </div>
            </div>
        </div>
        </>)}
        {signedIn && (
        <>
        <h1>Signed in as {auth.currentUser?.email}</h1>
        <button className="btn btn-danger" onClick={handleSignOut}>sign out</button>
        </>
        )}
        </>
    );
};

export default Login;