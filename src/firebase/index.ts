// Import necessary Firebase modules
import * as Firestore from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Configuration object for Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBfD-yeqFortwzYmrUMcQFZRstig5E9Fbw",
  authDomain: "that-open-master-challenge.firebaseapp.com",
  projectId: "that-open-master-challenge",
  storageBucket: "that-open-master-challenge.appspot.com",
  messagingSenderId: "583262808832",
  appId: "1:583262808832:web:83dc929d0d80f84258e1e5"
};

// Initialize Firebase app with the provided configuration
const app = initializeApp(firebaseConfig);
// Get a reference to the Firestore database
export const firestoreDB = Firestore.getFirestore()

// Function to get a collection from Firestore database
export function getCollection<T>(path: string) {
  return Firestore.collection(firestoreDB, path) as Firestore.CollectionReference<T>
}
// Function to get a specific document (project) from Firestore
export function getProject(path: string , id: string) {
  return Firestore.doc(firestoreDB, `${path}/${id}`);
 

}
// Function to delete a document from Firestore
export function deleteDocument(path: string, id: string) {
  // Get a reference to the document to be deleted
  const doc = Firestore.doc(firestoreDB,  `${path}/${id}`)
   // Delete the document from Firestore
  Firestore.deleteDoc(doc)
}