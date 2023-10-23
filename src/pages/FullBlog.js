import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { ThemeContext } from "./Theme";

function FullBlog(props) {
  const location = useLocation();
  const { postBody, postTitle, time, source } = location.state;
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  console.log(darkMode);
  
  const Container = styled.div`
    width: 95%;
    margin: 0 auto;
    height: 100%;
    .post {
      display: flex;
      justify-content: space-between;

      border-radius: 1rem;
      margin: 1rem 0;
      padding: 0 1rem;
      min-height: 90vh;
      max-height: 100%;
    }

    .formData {
      display: flex;
    }
    .source {
      position: fixed;
      bottom: 0;
      left: 1%;
      margin-top: 1rem;
    }
    .time {
      position: fixed;
      bottom: 0;
      right: 1%;
      margin-top: 1rem;
    }

    @media screen and (max-width: 768px) {
      .post {
        display: block;
        padding: 1rem 1rem;
      }
    }
  `;

  return (
    <Container>
      <div className="post">
        <div>
          <h3>👉{postTitle}</h3>
          <p>
            <span
              dangerouslySetInnerHTML={{
                __html: postBody,
              }}
            />
          </p>
        </div>
        <div>
          <p className="source">🦄{source}</p>
          <p className="time">📅{time}</p>
        </div>
      </div>
    </Container>
  );
}

export default FullBlog;
