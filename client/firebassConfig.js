// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1tlB3_70QYq4rxG7590rDk11vM8ioTok",
  authDomain: "mobilproject-4eede.firebaseapp.com",
  projectId: "mobilproject-4eede",
  storageBucket: "mobilproject-4eede.appspot.com",
  messagingSenderId: "365776865126",
  appId: "1:365776865126:web:2ae384b4f50edfa672b99c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app,{
persistence: getReactNativePersistence (ReactNativeAsyncStorage)
})
export const db = getFirestore(app);


export default app