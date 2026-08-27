import Home from "./pages/Home";
import "./css/App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import Favorites from "./pages/Favorites";
import NavBar from "./components/NavBar";
import { MovieProvider } from "./contexts/MovieContext";
import { SearchProvider } from "./contexts/SearchContext";
import Series from "./pages/Series";
import MediaStreaming from "./pages/MediaStreaming";
import StreamingPage from "./pages/StreamingPage";
import MovieList from "./pages/MovieList";

function App() {
  const location = useLocation();
  const isStreamingPlayer = location.pathname.includes("/stream");

  return (
    <div className="main-content">
      <SearchProvider>
        <MovieProvider>
          {!isStreamingPlayer && <NavBar />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/film" element={<MovieList />} />
            <Route path="/series" element={<Series />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/watch/:mediaType/:id" element={<MediaStreaming />} />
            <Route path="/watch/:mediaType/:id/stream" element={<StreamingPage />} />
          </Routes>
        </MovieProvider>
      </SearchProvider>
    </div>
  );
}

export default App;
