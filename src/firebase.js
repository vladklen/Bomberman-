const firebaseApp = firebase.initializeApp({
   apiKey: "AIzaSyBCdpEO6JIgqxH5iwGL2o3nr8swKcIFT3I",
  authDomain: "bomberman-bbe9d.firebaseapp.com",
  databaseURL: "https://bomberman-bbe9d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bomberman-bbe9d",
  storageBucket: "bomberman-bbe9d.appspot.com",
  messagingSenderId: "1047337234254",
  appId: "1:1047337234254:web:9aa1e6e3b2d2a8b033781f",
  measurementId: "G-850N5ZDSS8"
});

const myAppDB = firebaseApp.database();
const auth = firebaseApp.auth();
