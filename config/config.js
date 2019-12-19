import firebase from "firebase";
const config = {
  //api key
};
// Initialize Firebase
firebase.initializeApp(config);

export const f = firebase;
export const database = firebase.database();
export const storage = firebase.storage();
export const auth = firebase.auth();
