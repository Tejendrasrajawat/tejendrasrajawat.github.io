import React, { useState } from "react";
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

  return (
    <>
      <div class={style.container}>
        <div className={style.center}>
          <h2>Contact Us</h2>
          <p>You can connect with me anytime , just drop a message 🦄</p>
        </div>
        <div>
            <form onSubmit={onSubmitHandler} className={style.form}>
            <input placeholder="Enter Your Name" type='text' name="name" value={name} onChange={(e) => setName(e.target.value)}/>
            <input placeholder="Enter Your Email" type='text' name="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            <textarea placeholder="Write your thoughts 🤷‍♂️"></textarea>
            <input type='submit' value='Submit'/>
            </form>
            </div>
      </div>
    </>
  );
}

export default Contact;
