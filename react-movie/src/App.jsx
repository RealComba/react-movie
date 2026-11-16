import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import NavBar from "./components/NavBar";
import Catalog from "./pages/Catalog";
import Favorites from "./pages/Favorites";
import MediaStreaming from "./pages/MediaStreaming";
import StreamingPage from "./pages/StreamingPage";
import { MovieProvider } from "./contexts/MovieContext";
import useRemoteNavigation from "./hooks/useRemoteNavigation";
import "./css/App.css";

export default function App() {
  const location = useLocation();
  useRemoteNavigation();
  return <MovieProvider>
    <div className="main-content">
      {!location.pathname.endsWith("/stream") && <NavBar />}
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/film" element={<Catalog key="movie" mediaType="movie" />} />
          <Route path="/series" element={<Catalog key="tv" mediaType="tv" />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/watch/:mediaType/:id" element={<MediaStreaming key={location.pathname} />} />
          <Route path="/watch/:mediaType/:id/stream" element={<StreamingPage key={location.pathname} />} />
          <Route path="*" element={<div className="page status"><h1>Pagina non trovata</h1><a href="/" className="button" data-tv-focus data-focus-id="home">Torna alla Home</a></div>} />
        </Routes>
      </main>
    </div>
  </MovieProvider>;
}
