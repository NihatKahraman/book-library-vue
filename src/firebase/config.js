import firebase from "firebase/app";
import "firebase/firestore"
import "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyDcBWmCCtIXVvbyF2J45_4bypupvZ6Yn_M",
    authDomain: "book-library-ed2ee.firebaseapp.com",
    projectId: "book-library-ed2ee",
    storageBucket: "book-library-ed2ee.appspot.com",
    messagingSenderId: "223869850800",
    appId: "1:223869850800:web:58350cb258b1f8e9929775"
  };

firebase.initializeApp(firebaseConfig);

const firestoreRef = firebase.firestore();
const authRef = firebase.auth();

export { firestoreRef, authRef }