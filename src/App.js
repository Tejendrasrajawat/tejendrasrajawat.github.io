import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Blogs from "./pages/Blogs";
import Contact from "./pages/Contact";
import NoPage from "./pages/NoPage";
import NavCom from "./pages/Nav";
import CreateBlog from "./pages/CreateBlog";
import { useContext } from "react";
import { ThemeContext } from "./pages/Theme";
import Project from "./pages/Project";
import { createGlobalStyle } from "styled-components";
import FullBlog from "./pages/FullBlog";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PrivacyPolicyDetail from "./pages/PrivacyPolicyDetail";

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
          <Route path="MyDiary" element={<CreateBlog />} />
          <Route path="blogs/:id" element={<FullBlog />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="privacy-policy/:appSlug" element={<PrivacyPolicyDetail />} />

          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
