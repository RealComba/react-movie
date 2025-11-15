import Home from "./pages/Home";
import "./css/App.css";
import {Routes, Route} from "react-router-dom"
import Favorites from "./pages/Favorites";
import NavBar from "./components/NavBar";

function App() {

  // debug: will log after fixes
  console.log({ Home, Favorites, NavBar });

  return (
    <>
      <div className="main-content">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </div>
    </>
  )
}

export default App
