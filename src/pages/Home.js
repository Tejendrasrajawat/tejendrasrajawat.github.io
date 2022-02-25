import React, {useState, useContext} from "react";
import style from "./Home.module.css";
import Footer from "./Footer";
import Blogs from "./Blogs";
import styled from "styled-components";
import {ThemeContext} from "./Theme";


function Home() {
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;
  const Container = styled.div`
  margin: 6rem auto;
  width: 80%;

  .row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    margin: 1rem 0;
  }
  .colmd6 {
    width: 50%;
    position: relative;
  }
  
  .img {
    width: 200px;
    height: 200px;
    border-radius: 100%;
    position: absolute;
    margin: auto;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .button {
    /* transparent background */
    background-color: transparent;
    border: 1px solid black;
    border-color: ${darkMode ? '#fff' : '#000'};
    border-radius: 5px;
    padding: 10px;
    margin-right: 10px;
    cursor: pointer;
  }
  
  .button:hover {
    background-color: rgba(76, 76, 173, 0.226);
    transition: all 0.6s ease-in-out;
  }
  
  .show {
    margin: 1rem 0;
  }
  
  .show span {
    font-size: 1.5rem;
    font-weight: bold;
    margin-right: 1rem;
  }
  
  a {
    text-decoration: none;
    color: ${darkMode ? '#fff' : '#000'};
  }
  
  a:visited {
    color: ${darkMode ? '#fff' : '#000'};
    opacity: 0.5;
  }
  
  @media screen and (max-width: 700px) {
    .container {
      margin: 4rem auto !important;
    }
    .row {
      margin-top: 4rem;
      flex-direction: column-reverse;
    }
    .colmd6 {
      width: 100%;
      text-align: center;
    }
    .img {
      position: sticky;
    }
  }
  
  `
  return (
    <>
      <Container>
        <div className='row'>
          <div className='colmd6'>
            <h2>👋 Hey, I'm Tejendra</h2>
            <p>
              I'm a software developer and a technical writer. Currently working
              as a React developer in InnovationM.
              <br />
              Previously, I've worked In Machine Learning and AI. I have also
              done Redhat certification.
              <br />
              I've been writing online since 2021, mostly on web and mobile
              development.
            </p>
          </div>
          <div className='colmd6'>
            <img src="https://i.postimg.cc/TYymDnJb/profile.jpg" alt="" className='img'/>
          </div>
        </div>
        <p>Learn more about me! 👇</p>
        <div>
          <button className='button'>
            <a href="https://www.linkedin.com/in/tejendrasrajawat">LinkedIn</a>
          </button>
          <button className='button'>
            <a href="https://twitter.com/tejendrahimself">Twitter</a>
          </button>
          <button className='button'>
            <a href="https://github.com/Tejendrasrajawat">Github</a>
          </button>
        </div>
        <div className='show'>
          <span>Latest Posts</span>
          <button className='button'>
          <a href="#">View All</a>
          </button>
        </div>
      </Container>
      <Blogs/>
      <Footer />
    </>
  );
}

export default Home;
