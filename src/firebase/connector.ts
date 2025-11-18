import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/firestore';
import firebaseConfig from './config';

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const fs = firebase.firestore();
const auth = firebase.auth();

export { db, auth, fs, app, firebase };