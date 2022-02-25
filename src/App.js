import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Blogs from "./pages/Blogs";
import Contact from "./pages/Contact";
import NoPage from "./pages/NoPage";
import NavCom from "./pages/Nav";
import { useContext } from "react";
import { ThemeContext } from "./pages/Theme";
import Project from "./pages/Project";
import { createGlobalStyle } from "styled-components";

function App(props) {
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;
  const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${darkMode ? "#000" : "#fff"};
    color: ${darkMode ? "#fff" : "#000"};
  }
`;

  return (
    <BrowserRouter>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<NavCom />}>
          <Route index element={<Home />} />
          <Route path="project" element={<Project />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
