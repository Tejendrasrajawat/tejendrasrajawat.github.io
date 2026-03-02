import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PostHogPageView from "./components/PostHogPageView";
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
import ToolsIndex from "./pages/ToolsIndex";
import JsonViewer from "./pages/JsonViewer";
import JsonCompare from "./pages/JsonCompare";
import JsEditor from "./pages/JsEditor";
import JwtDecoder from "./pages/JwtDecoder";
import Base64Tool from "./pages/Base64Tool";
import UrlEncoder from "./pages/UrlEncoder";
import RegexTester from "./pages/RegexTester";
import MarkdownPreview from "./pages/MarkdownPreview";
import HashGenerator from "./pages/HashGenerator";
import ColorPicker from "./pages/ColorPicker";

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
      <PostHogPageView />
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
          <Route path="tools" element={<ToolsIndex />} />
          <Route path="tools/json-viewer" element={<JsonViewer />} />
          <Route path="tools/json-compare" element={<JsonCompare />} />
          <Route path="tools/js-editor" element={<JsEditor />} />
          <Route path="tools/jwt-decoder" element={<JwtDecoder />} />
          <Route path="tools/base64-encoder-decoder" element={<Base64Tool />} />
          <Route path="tools/url-encoder-decoder" element={<UrlEncoder />} />
          <Route path="tools/regex-tester" element={<RegexTester />} />
          <Route path="tools/markdown-preview" element={<MarkdownPreview />} />
          <Route path="tools/hash-generator" element={<HashGenerator />} />
          <Route path="tools/color-picker" element={<ColorPicker />} />

          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
