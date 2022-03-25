import React, { useContext, useState, useEffect } from "react";
import styled from "styled-components";
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

function Project() {
  const [github, setgithub] = useState([]);
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  const Pro = styled.div`
    display: flex;
    flex-wrap: wrap;
    /* center div */
    margin: 0 auto;
    width: 80%;
    .container {
      /* center div */
      margin: 0 auto;
      width: 80%;
    }

    .card {
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
      transition: 0.3s;
      background-color: ${darkMode ? "#ffffff10" : "#00000010"};
      width: 18%;
      margin: 0.5rem;
      border-radius: 1rem;
    }

    .card:hover {
      box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
      transform: translateY(-5px) scale(1.005) translateZ(0);
      transition: all 0.3s ease-in-out;
    }

    .name {
      text-align: center;
      padding-bottom: 0.1rem;
      margin-bottom: 0.1rem;
    }

    @media screen and (max-width: 768px) {
      .card {
        width: 100%;
      }
    }
  `;

  const readData = async () => {
    const querySnapshot = await getDocs(
      collection(db, "github"),
      orderBy("timestamp", "asc")
    );
    setgithub(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    readData();
  }, []);
  return (
    <Pro>
      {github.map((data) => (
        <div className="card" key={data.id}>
          <a href={data.address}>
            <img
              src={data.image}
              alt="Avatar"
              style={{
                width: "100%",
                borderTopLeftRadius: "1rem",
                borderTopRightRadius: "1rem",
              }}
            />
          </a>
          <div className="name">
            <p>
              <b>{data.title}</b>
            </p>
          </div>
        </div>
      ))}
    </Pro>
  );
}

export default Project;
