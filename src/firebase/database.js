// import { useState } from "react";
// import { db } from "./init";
// import { collection, addDoc, getDocs } from "firebase/firestore";

// export const addData = async (firstName, lastName, postTitle, postBody) => {
//   try {
//     const docRef = await addDoc(collection(db, "users"), {
//       firstName: firstName,
//       lastName: lastName,
//       postTitle: postTitle,
//       postBody: postBody,
//     });
//     console.log("Document written with ID: ", docRef.id);
//   } catch (e) {
//     console.error("Error adding document: ", e);
//   }
// };

// export const readData = async () => {
//   const querySnapshot = await getDocs(collection(db, "users"));

//   querySnapshot.forEach((doc) => {
//     console.log(`Id ${doc.id} existed and data is ${doc.data()}`);
//   });
// };
