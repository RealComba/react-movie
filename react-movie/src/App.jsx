import Home from "./pages/Home";
import "./css/App.css";
import {Routes, Route} from "react-router-dom"
import Favorites from "./pages/Favorites";
import NavBar from "./components/NavBar";
import { MovieProvider } from "./contexts/MovieContext"
import { SearchProvider } from "./contexts/SearchContext";
import Series from "./pages/Series"

function App() {

  // debug: will log after fixes
  console.log({ Home, Favorites, NavBar });

  return (
    <>
      <div className="main-content">
      <SearchProvider>
      <MovieProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/series" element={<Series/>}></Route>
        </Routes>
      </MovieProvider>
      </SearchProvider>
      </div>
    </>
  )
}

export default App
