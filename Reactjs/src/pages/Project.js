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
    margin: 0 auto;
    width: 80%;
    justify-content: center;
    .container {
      margin: 0 auto;
      width: 80%;
    }

    .card {
      position: relative;
      transition: 0.3s;
      margin: 0.5rem;
      border-radius: 1rem;
    }

    .card:hover {
      transform: translateY(-5px) scale(1.005) translateZ(0);
      transition: all 0.3s ease-in-out;
    }

    .name {
      opacity: 0;
      display: flex;
      position: absolute;
      top: 0;
      font-size: 1.5rem;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
      background: ${darkMode ? "rgb(254, 254, 254, 0.5)" : "rgb(0, 0, 0, 0.5)"};
      color: ${darkMode ? "black" : "white"};
      text-align: center;
      border-radius: 1rem;
    }

    .name:hover {
      opacity: 1;
    }

    .img {
      width: 250px;
      height: auto;
      border-radius: 1rem;
    }

    @media screen and (max-width: 768px) {
      .name {
        opacity: 1;
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
        <>
          <div className="card" key={data.id}>
            <a href={data.address}>
              <img src={data.image} alt="Avatar" className="img" />

              <div className="name">
                <p>
                  <b>{data.title}</b>
                </p>
              </div>
            </a>
          </div>
        </>
      ))}
    </Pro>
  );
}

export default Project;
