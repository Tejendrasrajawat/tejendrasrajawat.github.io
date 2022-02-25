import React, { useState } from "react";
import style from "./Nav.module.css";
import { Outlet, Link } from "react-router-dom";
import Theme from "./Theme";
import styled from "styled-components";
import { Navbar } from "react-bootstrap";

function Nav() {
  const [dark, setDark] = useState(false);

  const Navbar = styled.div`
  background-color: #ffffff10;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 0.5rem;
    /* stick to top */
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1;

  .container {

    margin: 0 auto;
    width: 80%;
     
    display: flex;
    align-items: center;
    
}

  .navBrand{
    font-size: 1.5rem;
    font-weight: bold;
    float: left;
}

.navItem {
    float: left;
    padding: 0 1rem;
    transition: all 0.3s ease-in-out;
    cursor: pointer;
    color: var(--dark-color);
    text-decoration: none;
    transition: color 0.2s ease-in-out; 
}

@media screen and (max-width: 700px) {
    .navBrand{
        display: none;
    }
    .navItem{
        font-size: 0.8rem;
    }
}
  `

  const changeTheme = () => {
    setDark(!dark);
  }
  return (
    <Theme>
      <Navbar>
        <div className="container">
          <div className={style.navBrand}>Tejendra Singh Rajawat </div>
          <Link to="/" className='navItem'>Home</Link>
          <Link to="/blogs" className='navItem'>Blogs</Link>
          <Link to="/project" className='navItem'>Projects</Link>
          <Link to="/contact" className='navItem'>Contact</Link>
        <div onClick={changeTheme}>{dark ? '🌑' : '☀️'}</div>
        </div>
      </Navbar>

      <Outlet />
    </Theme>
  );
}

export default Nav;
