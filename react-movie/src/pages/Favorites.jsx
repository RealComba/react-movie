import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "../css/Favorites.css";
import { useMovieContext } from "../contexts/MovieContext";
import MediaCard from "../components/MediaCard";
import QuickDetailModal from "../components/QuickDetailModal";
import { MOVIE_GENRES } from "../services/api";

function Favorites() {
  const { favorites, likes } = useMovieContext();
  const [activeTab, setActiveTab] = useState("all"); // "all", "watchlist", "likes"
  const [typeFilter, setTypeFilter] = useState("all"); // "all", "movie", "tv"
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Unione dei media in base al tab
  const baseList = useMemo(() => {
    if (activeTab === "watchlist") return favorites;
    if (activeTab === "likes") return likes;

    const map = new Map();
    favorites.forEach((m) => map.set(m.id, m));
    likes.forEach((m) => map.set(m.id, m));
    return Array.from(map.values());
  }, [activeTab, favorites, likes]);

  // Generi disponibili tra i media salvati
  const availableGenres = useMemo(() => {
    const genreIds = new Set();
    baseList.forEach((item) => {
      if (Array.isArray(item.genres)) {
        item.genres.forEach((g) => genreIds.add(g.id));
      }
      if (Array.isArray(item.genre_ids)) {
        item.genre_ids.forEach((id) => genreIds.add(id));
      }
    });

    return MOVIE_GENRES.filter((g) => g.id === "all" || genreIds.has(g.id));
  }, [baseList]);

  // Filtro combinato per tipologia (Film/Serie) e per Genere
  const displayedMedia = useMemo(() => {
    let list = baseList;

    if (typeFilter === "movie") {
      list = list.filter((m) => m.title || m.mediaType === "movie");
    } else if (typeFilter === "tv") {
      list = list.filter((m) => m.name || m.mediaType === "tv");
    }

    if (selectedGenre !== "all") {
      list = list.filter((m) => {
        const hasGenreInGenres = Array.isArray(m.genres) && m.genres.some((g) => String(g.id) === String(selectedGenre));
        const hasGenreInIds = Array.isArray(m.genre_ids) && m.genre_ids.some((id) => String(id) === String(selectedGenre));
        return hasGenreInGenres || hasGenreInIds;
      });
    }

    return list;
  }, [baseList, typeFilter, selectedGenre]);

  return (
    <div className="favorites-page">
      {/* Header & Tabs */}
      <div className="favorites-header">
        <h1 className="favorites-title">La mia lista & Preferiti</h1>

        <div className="favorites-tabs-row">
          <div className="favorites-nav-tabs">
            <button
              className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("all");
                setSelectedGenre("all");
              }}
            >
              Tutti ({new Set([...favorites.map(f => f.id), ...likes.map(l => l.id)]).size})
            </button>
            <button
              className={`tab-btn ${activeTab === "watchlist" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("watchlist");
                setSelectedGenre("all");
              }}
            >
              La mia lista ({favorites.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "likes" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("likes");
                setSelectedGenre("all");
              }}
            >
              I miei Mi Piace ({likes.length})
            </button>
          </div>

          <div className="favorites-type-filters">
            <button
              className={`type-pill ${typeFilter === "all" ? "active" : ""}`}
              onClick={() => setTypeFilter("all")}
            >
              Tutti
            </button>
            <button
              className={`type-pill ${typeFilter === "movie" ? "active" : ""}`}
              onClick={() => setTypeFilter("movie")}
            >
              Film
            </button>
            <button
              className={`type-pill ${typeFilter === "tv" ? "active" : ""}`}
              onClick={() => setTypeFilter("tv")}
            >
              Serie TV
            </button>
          </div>
        </div>

        {/* Filtro generi dei film in lista se disponibili */}
        {availableGenres.length > 1 && (
          <div className="genre-pills-bar" style={{ marginTop: "1rem" }}>
            {availableGenres.map((genre) => (
              <button
                key={genre.id}
                className={`genre-pill ${String(selectedGenre) === String(genre.id) ? "active" : ""}`}
                onClick={() => setSelectedGenre(genre.id)}
              >
                {genre.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Content or Empty State */}
      {displayedMedia.length > 0 ? (
        <div className="favorites-grid">
          {displayedMedia.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              onOpenDetails={setSelectedMedia}
            />
          ))}
        </div>
      ) : (
        <div className="favorites-empty">
          <div className="empty-icon">🎬</div>
          <h2 className="empty-title">
            {selectedGenre !== "all"
              ? "Nessun titolo trovato per questo genere"
              : activeTab === "likes"
              ? "Nessun titolo a cui hai messo 'Mi piace'"
              : activeTab === "watchlist"
              ? "Nessun titolo nella tua lista"
              : "Nessun titolo salvato nei preferiti"}
          </h2>
          <p className="empty-desc">
            {selectedGenre !== "all"
              ? "Prova a selezionare un altro genere o rimuovi il filtro."
              : "Esplora il catalogo di film e serie TV e clicca sul cuore o sul pulsante + per salvare i tuoi titoli preferiti."}
          </p>
          <Link to="/film" className="empty-cta-btn">
            Esplora il Catalogo Film
          </Link>
        </div>
      )}

      {/* Quick Details Modal */}
      {selectedMedia && (
        <QuickDetailModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onSelectMedia={setSelectedMedia}
        />
      )}
    </div>
  );
}

export default Favorites;