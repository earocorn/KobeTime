import { useState } from 'react'
import { initializeApp } from 'firebase/app'
import './App.css'

const firebaseConfig = {
  apiKey: "AIzaSyDA4ER5VRIE7XMAfHEBIjSNh1_6i-XpZN4",
  authDomain: "kobetime-40b4c.firebaseapp.com",
  projectId: "kobetime-40b4c",
  storageBucket: "kobetime-40b4c.appspot.com",
  messagingSenderId: "350491825564",
  appId: "1:350491825564:web:44a283729006a518f2a459",
  measurementId: "G-KNDKNWB1TJ"
};

const app = initializeApp(firebaseConfig);

function App() {
  const [count, setCount] = useState(0)

  
  return (
    <>
      <div>
        <h1>test site KobeTime</h1>
        <button onClick={() => setCount(count+1)}>Count: {count}</button>
      </div>
    </>
  )
}

export default App
