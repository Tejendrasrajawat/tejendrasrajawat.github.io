import React, { useContext } from "react";
import styled from "styled-components";
import { ThemeContext } from "./Theme";

const github = [
  {
    id: 1,
    href: "https://github.com/Tejendrasrajawat/Tesla-Clone",
    src: "https://user-images.githubusercontent.com/38542608/146128085-8c0f719a-45a3-4817-8bf4-9c4dc805d2e8.png",
    name: "Tesla Clone",
  },
  {
    id: 2,
    href: "https://github.com/Tejendrasrajawat/todo",
    src: "https://user-images.githubusercontent.com/38542608/138029192-e73cfb1c-6359-42c5-a1e5-217c57b3e7a1.png",
    name: "Todo list",
  },
  {
    id: 3,
    href: "https://github.com/Tejendrasrajawat/keepClone-react",
    src: "https://user-images.githubusercontent.com/38542608/130739278-d20a2838-cca5-4568-b2a8-ccd7593518f6.png",
    name: "Google Keep Clone",
  },
  {
    id: 4,
    href: "https://github.com/Tejendrasrajawat/JavaScriptDiceGame",
    src: "https://user-images.githubusercontent.com/38542608/130600838-990a1b88-6f11-4085-99fc-bcfce6ec2b50.png",
    name: "Javascript Dice Game",
  },
  {
    id: 5,
    href: "https://github.com/Tejendrasrajawat/Web-Projects",
    src: "https://i.postimg.cc/1RDW5VC3/404-error-page-templates.jpg",
    name: "Some Web Projects",
  },
];

function Project() {
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  const Pro = styled.div`
    display: flex;
    flex-wrap: wrap;
    /* center div */
    margin: 0 auto;
    width: 80%;
    .container {
      /* center div */
      margin: 0 auto;
      width: 80%;
    }

    .card {
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
      transition: 0.3s;
      background-color: ${darkMode ? "#ffffff10" : "#00000010"};
      width: 18%;
      margin: 0.5rem;
      border-radius: 1rem;
    }

    .card:hover {
      box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
      transform: translateY(-5px) scale(1.005) translateZ(0);
      transition: all 0.3s ease-in-out;
    }

    .name {
      text-align: center;
      padding-bottom: 0.1rem;
      margin-bottom: 0.1rem;
    }

    @media screen and (max-width: 768px) {
      .card {
        width: 100%;
      }
    }
  `;

  return (
    <Pro>
      {github.map((data) => (
        <div className="card" key={data.id}>
          <a href={data.href}>
            <img
              src={data.src}
              alt="Avatar"
              style={{
                width: "100%",
                borderTopLeftRadius: "1rem",
                borderTopRightRadius: "1rem",
              }}
            />
          </a>
          <div className="name">
            <p>
              <b>{data.name}</b>
            </p>
          </div>
        </div>
      ))}
    </Pro>
  );
}

export default Project;
