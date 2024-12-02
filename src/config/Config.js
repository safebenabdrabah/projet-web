//firebase connectivity

//import the required functions from the FirebaseSDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore , addDoc , collection  } from "firebase/firestore";



const firebaseConfig = {
    apiKey: "AIzaSyAVZWcnsqg5Ys9e1TaFeNUwTQ_xIBqag38",
    authDomain: "yallashop-be83b.firebaseapp.com",
    projectId: "yallashop-be83b",
    storageBucket: "yallashop-be83b.appspot.com",
    messagingSenderId: "452625756907",
    appId: "1:452625756907:web:c9efcb21173051b93044ae"
};

//initializing firebase 
const app = initializeApp(firebaseConfig);

//initialize services
const auth = getAuth(app);
const db = getFirestore(app);




export { auth, db,  collection ,addDoc };