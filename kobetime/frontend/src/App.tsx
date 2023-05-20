import { useState } from 'react'
import firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import './App.css'
import ListEmployees from './components/ListEmployees'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, Firestore } from 'firebase/firestore'
import { documentId } from 'firebase/firestore/lite'
import firestore from './firebase'

function App() {

  return (
    <>
    {/* Only for testing, main page should be for employee as user*/}
    <ListEmployees />
    </>
  )
}

export default App
