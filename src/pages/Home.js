import React from "react";
import style from "./Home.module.css";
import Footer from "./Footer";
import Blogs from "./Blogs";

function Home() {
  return (
    <>
      <div className={style.container}>
        <div className={style.row}>
          <div className={style.colmd6}>
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
          <div className={style.colmd6}>
            <img src="https://i.postimg.cc/TYymDnJb/profile.jpg" alt="" className={style.img}/>
          </div>
        </div>
        <p>Learn more about me! 👇</p>
        <div>
          <button className={style.button}>
            <a href="https://www.linkedin.com/in/tejendrasrajawat">LinkedIn</a>
          </button>
          <button className={style.button}>
            <a href="https://twitter.com/tejendrahimself">Twitter</a>
          </button>
          <button className={style.button}>
            <a href="https://github.com/Tejendrasrajawat">Github</a>
          </button>
        </div>
        <div className={style.show}>
          <span style={{ color: "#B794F4" }}>Latest Posts</span>
          <button className={style.button}>View All</button>
        </div>
      </div>
      <Blogs />
      <Footer />
    </>
  );
}

export default Home;
