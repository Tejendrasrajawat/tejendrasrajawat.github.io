import React, { useState } from "react";
import styled from "styled-components";
import style from "./Contact.module.css";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const onSubmitHandler = (e) => {
    e.preventDefault();
    console.log("Form Submitted");
    console.log(name)
    console.log(email)
  };


  const Container = styled.div`
  margin: 6rem auto;
  width: 80%;
  
  .center {
    text-align: center;
}

.form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 4rem;
}

input {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    letter-spacing: 1.4px;
  }

  input[type=text], select, textarea {
    width: 50%;
    padding: 12px;
    border: 1px solid #ccc;
    margin-top: 6px;
    margin-bottom: 16px;
    resize: vertical;
    border-radius: 0.5rem;
  }
  
  input[type=submit] {
    background-color: #04AA6D;
    color: white;
    padding: 12px 20px;
    border: none;
    cursor: pointer;
  }
  
@media screen and (max-width: 768px) {
 input[type=text], select, textarea {
    width: 100%;
  }
} 
  `

  return (
    <>
      <Container>
        <div className='center'>
          <h2>Contact Us</h2>
          <p>You can connect with me anytime , just drop a message 🦄</p>
        </div>
        <div>
            <form onSubmit={onSubmitHandler} className='form'>
            <input placeholder="Enter Your Name" type='text' name="name" value={name} onChange={(e) => setName(e.target.value)}/>
            <input placeholder="Enter Your Email" type='text' name="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            <textarea placeholder="Write your thoughts 🤷‍♂️"></textarea>
            <input type='submit' value='Submit'/>
            </form>
            </div>
      </Container>
    </>
  );
}

export default Contact;
