import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";

import { ThemeContext } from "./Theme";
import style from "./Blogs.module.css";
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/init";

function Blogs() {
  const [time, setTime] = useState(null);
  const [postTitle, setpostTitle] = useState("");
  const [postBody, setpostBody] = useState("");
  const [blogPost, setblogPost] = useState([]);
  const [date, setDate] = useState(null);

  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;
  const Container = styled.div`
    margin: 6rem auto;
    width: 80%;
    .post {
      display: flex;
      justify-content: space-between;
      background-color: ${darkMode ? "#ffffff10" : "#00000010"};
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 1rem;
      margin: 1rem 0;
      padding: 0 1rem;
    }

    .post:hover {
      transform: translateY(-5px) scale(1.005) translateZ(0);
      transition: all 0.3s ease-in-out;
    }
    .formData {
      display: flex;
    }

    @media screen and (max-width: 768px) {
      .post {
        display: block;
        padding: 1rem 1rem;
      }
    }
  `;

  const currentDate = () => {
    var today = new Date();
    var date =
      today.getFullYear() +
      "/" +
      (today.getMonth() + 1) +
      "/" +
      today.getDate();
    setDate(date);
  };

  const readData = async () => {
    const querySnapshot = await getDocs(collection(db, "posts"));

    setblogPost(
      querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  };

  useEffect(() => {
    readData();
    currentDate();
  }, []);

  const submitPost = (e) => {
    e.preventDefault();

    addDoc(collection(db, "posts"), {
      postTitle: postTitle,
      postBody: postBody,
      time: date,
    })
      .then(alert("post added !"), setpostTitle(""), setpostBody(""))
      .catch((err) => console.log(err));
  };
  return (
    <>
      <Container>
        {blogPost.map((post, id) => (
          <div className="post" key={id}>
            <div>
              <h3>{post.postTitle}</h3>
              <p>{post.postBody}</p>
            </div>
            <div>
              <p>{post.time}</p>
            </div>
          </div>
        ))}
      </Container>
      <form onSubmit={submitPost} className={style.form}>
        <input
          placeholder="Enter Post Title"
          onChange={(e) => setpostTitle(e.target.value)}
          type="text"
          name="postTitle"
          value={postTitle}
        />
        <textarea
          placeholder="Enter Post Body"
          onChange={(e) => setpostBody(e.target.value)}
          type="text"
          name="postBody"
          value={postBody}
        ></textarea>
        <input type="submit" />
      </form>
    </>
  );
}

export default Blogs;
