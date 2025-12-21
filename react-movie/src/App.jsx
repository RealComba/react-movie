import Home from "./pages/Home";
import "./css/App.css";
import {Routes, Route} from "react-router-dom"
import Favorites from "./pages/Favorites";
import NavBar from "./components/NavBar";
import { MovieProvider } from "./contexts/MovieContext"
import { SearchProvider } from "./contexts/SearchContext";
import Series from "./pages/Series"
import MediaStreaming from "./pages/MediaStreaming";
import StreamingPage from "./pages/StreamingPage"

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
          <Route path="/watch/:mediaType/:id" element={<MediaStreaming />} />
          <Route path="/watch/:mediaType/:id/stream" element={<StreamingPage />}></Route>
        </Routes>
      </MovieProvider>
      </SearchProvider>
      </div>
    </>
  )
}

export default App
