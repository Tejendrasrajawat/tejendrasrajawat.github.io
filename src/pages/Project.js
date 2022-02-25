import React from "react";
import style from "./Project.module.css";

const Data = () => {
  return (
    <div className={style.card}>
      <img src="https://i.postimg.cc/1RDW5VC3/404-error-page-templates.jpg" alt="Avatar" style={{width:'100%'}} />
      <div className={style.name}>
        <p><b>Project Name</b></p>
      </div>
    </div>
  );
};

function Project() {
  return (
    <div className={style.project}>
      {[1, 2, 3,4,5,6,7,8,9,10].map(() => (
        <Data />
      ))}
    </div>
  );
}

export default Project;
