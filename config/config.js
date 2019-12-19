import firebase from "firebase";
const config = {
  apiKey: "AIzaSyBAVe5rpptuF_wfUc4uWlxrqh9Sl544O8Y",
  authDomain: "clone-eq.firebaseapp.com",
  databaseURL: "https://clone-eq.firebaseio.com",
  projectId: "clone-eq",
  storageBucket: "clone-eq.appspot.com",
  messagingSenderId: "918890758075",
  appId: "1:918890758075:web:048fdb724426bc1ea90e9e",
  measurementId: "G-ZKR3EPR3Z9"
};
// Initialize Firebase
firebase.initializeApp(config);

export const f = firebase;
export const database = firebase.database();
export const storage = firebase.storage();
export const auth = firebase.auth();
