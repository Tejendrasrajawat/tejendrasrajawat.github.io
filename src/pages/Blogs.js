import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import { ThemeContext } from "./Theme";
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/init";
import FullBlog from "./FullBlog";

function Blogs() {
  const [blogPost, setblogPost] = useState([]);
  const navigate = useNavigate();
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;
  const Container = styled.div`
    margin: 6rem auto;
    width: 80%;
    .post {
      display: flex;
      justify-content: space-between;
      background-color: ${darkMode ? "#ffffff10" : "#00000010"};
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
    .body {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    @media screen and (max-width: 768px) {
      .post {
        display: block;
        padding: 1rem 1rem;
      }
    }
  `;

  const readData = async () => {
    const querySnapshot = await getDocs(
      collection(db, "posts"),
      orderBy("timestamp", "asc")
    );
    setblogPost(
      querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  };

  useEffect(() => {
    readData();
  }, []);

  function handlePost(id, link) {
    if (link === "#") {
      navigate(`/blogs/${id}`, { state: blogPost[id] });
    } else {
      navigate(link);
    }
  }

  return (
    <>
      <Container>
        {blogPost.length > 0 ? (
          blogPost.map((post, id) => (
            <div
              className="post"
              key={post.id}
              onClick={() => handlePost(id, post.link)}
            >
              <div>
                <h3>👉{post.postTitle}</h3>
                <p className="body">🔥{post.postBody}</p>
              </div>
              <div>
                <p>#{post.source}</p>
                <p>📅{post.time}</p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center" }}>Loading ...</p>
        )}
      </Container>
    </>
  );
}

export default Blogs;
