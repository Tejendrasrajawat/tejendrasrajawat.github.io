import React, { useState } from "react";
import styled from "styled-components";
import style from "./Contact.module.css";
import {
  addDoc,
  collection,

} from "firebase/firestore";
import { db } from "../firebase/init";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [thoughts, setThought] = useState("");
  const onSubmitHandler = (e) => {
    e.preventDefault();

    addDoc(collection(db, "contact"), {
      name: name,
      email: email,
      thoughts: thoughts,
    })
      .then(
        alert("We got your message, thanks you !"),
        setName(""),
        setEmail(""),
        setThought("")
      )
      .catch((err) => console.log(err));
  };

  const Container = styled.div`
    margin: 6rem auto;
    width: 80%;

    .center {
      text-align: center;
    }
  `;

  return (
    <>
      <Container>
        <div className="center">
          <h2>Contact Us</h2>
          <p>You can connect with me anytime , just drop a message 🦄</p>
        </div>
      </Container>
      <div>
        <form onSubmit={onSubmitHandler} className={style.form}>
          <input
            placeholder="Enter Your Name"
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Enter Your Email"
            type="text"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <textarea
            placeholder="Write your thoughts 🤷‍♂️"
            onChange={(e) => setThought(e.target.value)}
            value={thoughts}
          ></textarea>
          <input type="submit" value="Submit" />
        </form>
      </div>
    </>
  );
}

export default Contact;
