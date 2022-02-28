import React from "react";
import styled from "styled-components";


const Pro = styled.div`
display: flex;
    flex-wrap: wrap;



    .container {
      /* center div */
      margin: 0 auto;
      width: 80%;
    }
    
    .card {
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        transition: 0.3s;
        width: 18%;
        margin: 0.5rem;
      }
      
      .card:hover {
        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
      }
    
      .name {
          text-align: center;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
      }
    
      
    
      @media screen and (max-width: 768px) {
        .card {
          width: 100%;
        }
      }
`


const Data = () => {
  return (
    <div className='card'>
      <img src="https://i.postimg.cc/1RDW5VC3/404-error-page-templates.jpg" alt="Avatar" style={{width:'100%'}} />
      <div className='name'>
        <p><b>Project Name</b></p>
      </div>
    </div>
  );
};

function Project() {
  return (
    <Pro>
      {[1, 2, 3,4,5,6,7,8,9,10].map((id) => (
        <Data key={id}/>
      ))}
    </Pro>
  );
}

export default Project;
