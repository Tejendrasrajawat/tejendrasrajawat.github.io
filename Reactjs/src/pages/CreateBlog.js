import React, { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/init";
import style from "./CreateBlog.module.css";
import RichText from "./RichText";

function CreateBlog() {
  const [time, setTime] = useState(null);
  const [postTitle, setpostTitle] = useState("");
  const [postBody, setpostBody] = useState("");
  const [source, setSource] = useState("");
  const [link, setLink] = useState("");
  const [blogPost, setblogPost] = useState([]);
  const [date, setDate] = useState(null);

  const currentDate = () => {
    var today = new Date();
    var date =
      today.getDate() +
      "/" +
      (today.getMonth() + 1) +
      "/" +
      today.getFullYear();
    setDate(date);
  };

  useEffect(() => {
    currentDate();
  });
  const submitPost = (e) => {
    e.preventDefault();

    addDoc(collection(db, "posts"), {
      postTitle: postTitle,
      postBody: postBody,
      source: source,
      link: link,
      time: date,
    })
      .then(
        alert("post added !"),
        setpostTitle(""),
        setpostBody(""),
        setLink(""),
        setSource("")
      )
      .catch((err) => console.log(err));
  };
  return (
    <div className={style.container}>
      <form onSubmit={submitPost} className={style.form}>
        <input
          placeholder="Enter Source"
          onChange={(e) => setSource(e.target.value)}
          type="text"
          name="source"
          value={source}
        />
        <input
          placeholder="Enter Post Title"
          onChange={(e) => setpostTitle(e.target.value)}
          type="text"
          name="postTitle"
          value={postTitle}
        />
        <input
          placeholder="Enter Link"
          onChange={(e) => setLink(e.target.value)}
          type="text"
          name="link"
          value={link}
        />
        {/* 
        <textarea
          placeholder="Enter Post Body"
          onChange={(e) => setpostBody(e.target.value)}
          type="text"
          name="postBody"
          value={postBody}
        ></textarea> */}
        <RichText setpostBody={setpostBody} />
        <input type="submit" />
      </form>
    </div>
  );
}

export default CreateBlog;
