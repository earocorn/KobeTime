import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyDA4ER5VRIE7XMAfHEBIjSNh1_6i-XpZN4",
    authDomain: "kobetime-40b4c.firebaseapp.com",
    projectId: "kobetime-40b4c",
    storageBucket: "kobetime-40b4c.appspot.com",
    messagingSenderId: "350491825564",
    appId: "1:350491825564:web:cd999bb1737f8416f2a459",
    measurementId: "G-1PXQV5B9R3"
  };

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export default firestore;