import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const app = firebase.initializeApp({
  // apiKey: "AIzaSyAG3FrpFB06miJSLMGmv3-Io_eB5u3XLHA",
  // authDomain: "exp-rem.firebaseapp.com",
  // databaseURL: "https://exp-rem-default-rtdb.firebaseio.com",
  // projectId: "exp-rem",
  // storageBucket: "exp-rem.appspot.com",
  // messagingSenderId: "934479431383",
  // appId: "1:934479431383:web:7465bd1f0286857b5bd292",
  apiKey: "AIzaSyDkjH_20lfNia-H3LyzH303kJVf_uegNCg",
  authDomain: "exp-rem-dev.firebaseapp.com",
  projectId: "exp-rem-dev",
  storageBucket: "exp-rem-dev.appspot.com",
  messagingSenderId: "675538504251",
  appId: "1:675538504251:web:a2431a6198b6c4064b6a1e",
});

export const firestore = app.firestore();
export const auth = app.auth();
export const storage = app.storage();
export default app;
