import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import Contact from './pages/Contact';
import NoPage from './pages/NoPage';
import NavCom from './pages/Nav';
import Project from './pages/Project';


function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route  path="/"  element={<NavCom />}>
        <Route index element={<Home />} />
        <Route path='project' element={<Project />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NoPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
  );
}

export default App;
