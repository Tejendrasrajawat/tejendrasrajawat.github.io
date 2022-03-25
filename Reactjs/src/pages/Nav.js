import React, { useContext } from "react";
import { Outlet, Link } from "react-router-dom";

import styled from "styled-components";
import { ThemeContext } from "./Theme";
function Nav() {
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  const changeTheme = () => {
    if (darkMode) {
      theme.dispatch({ type: "LIGHTMODE" });
    } else {
      theme.dispatch({ type: "DARKMODE" });
    }
  };

  const Navbar = styled.div`
    background-color: ${darkMode ? "#00000010" : "#ffffff10"};
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

    .navBrand {
      font-size: 1.5rem;
      font-weight: bold;
      float: left;
      color: ${darkMode ? "#fff" : "#000"};
    }

    .navItem {
      float: left;
      padding: 0 1rem;
      transition: all 0.3s ease-in-out;
      cursor: pointer;
      color: ${darkMode ? "#fff" : "#000"};
      text-decoration: none;
      transition: color 0.2s ease-in-out;
    }

    @media screen and (max-width: 700px) {
      .navBrand {
        display: none;
      }
      .navItem {
        font-size: 0.8rem;
      }
    }
  `;

  return (
    <>
      <Navbar>
        <div className="container">
          <div className="navBrand">Tejendra Singh Rajawat </div>
          <Link to="/" className="navItem">
            Home
          </Link>
          <Link to="/blogs" className="navItem">
            Blogs
          </Link>
          <Link to="/project" className="navItem">
            Projects
          </Link>
          <Link to="/contact" className="navItem">
            Contact
          </Link>

          <div onClick={changeTheme}>{darkMode ? "🌑" : "☀️"}</div>
        </div>
      </Navbar>

      <Outlet />
    </>
  );
}

export default Nav;
