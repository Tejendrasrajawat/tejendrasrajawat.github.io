import React, {useContext} from 'react'
import styled from 'styled-components';

import { ThemeContext } from "./Theme";




function Blogs() {
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;
  const Container = styled.div`
  margin: 6rem auto;
  width: 80%;
  .post {
    display: flex;
    justify-content: space-between;
    background-color: ${darkMode ? '#000' : '#ffffff'};
    color: ${darkMode ? '#fff' : '#000'};
    border-radius: 1rem;
    margin: 1rem 0;
    padding: 0 1rem;
  }
  
  .post:hover {
    transform: translateY(-5px) scale(1.005) translateZ(0);
    transition: all 0.3s ease-in-out;
  }
  
  @media screen and (max-width: 768px) {
    .post {
      display: block;
      padding: 1rem 1rem;
    }
  }
    
  `
  const fakeData = [
    {
      id: 1,
      title: "React",
      description: "React is a JavaScript library for building user interfaces.",
      time: "2 days ago",
    },
    {
      id: 2,
      title: "React Router",
      description: "React Router is a routing library for React.",
      time: "2 days ago",
    },
    {
      id: 3,
      title: "React Hooks",
      description: "React Hooks are a new addition to the React 16.8 library.",
      time: "2 days ago",
    },
  ];
  
  return (
    <Container>
    {fakeData.map((post,id) => (
      <div className='post' key={id}>
        <div>
          <h3>{post.title}</h3>
          <p>{post.description}</p>
        </div>
        <div>
          <p>{post.time}</p>
        </div>
      </div>
    ))}
    </Container>
  )
}

export default Blogs