import React from "react";
import styled from "styled-components";



  const Foot = styled.footer`
  text-align: center;
  `;

function Footer() {
  return (
    <Foot>
      <hr/>
        <p>This website is my portfolio website</p>
        <p>And i am open to ideas 💖</p>
    </Foot>
  );
}

export default Footer;
