import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import MediaCard from "../components/MediaCard";
import EmblaCarousel from "../components/Carousel";
import QuickDetailModal from "../components/QuickDetailModal";
import MobileBottomSheet from "../components/MobileBottomSheet";
import {
  getPopularMoviesPaginated,
  getTopRatedMovies,
  getMoviesByGenre,
  getTrendingMovies,
  MOVIE_GENRES
} from "../services/api";
import "../css/MovieList.css";

function MovieList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreFromUrl = searchParams.get("genre") || "all";

  const [selectedGenre, setSelectedGenre] = useState(genreFromUrl);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [viewMode, setViewMode] = useState("grid"); // "grid" o "rows"
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [bottomSheetMedia, setBottomSheetMedia] = useState(null);

  const handleOpenMedia = (media) => {
    if (window.innerWidth <= 768) {
      setBottomSheetMedia(media);
    } else {
      setSelectedMedia(media);
    }
  };

  const handleOpenFullDetailsFromSheet = (media) => {
    setBottomSheetMedia(null);
    setSelectedMedia(media);
  };

  // Dati per le file tematiche (Netflix Rows)
  const [genrePopularRows, setGenrePopularRows] = useState([]);
  const [genreTopRatedRows, setGenreTopRatedRows] = useState([]);
  const [genreRecentRows, setGenreRecentRows] = useState([]);

  // Dati generali quando selectedGenre === 'all'
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [scifiMovies, setScifiMovies] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);

  // Sincronizza selectedGenre quando cambia l'URL (es. dalla TopBar)
  useEffect(() => {
    const urlGenre = searchParams.get("genre") || "all";
    setSelectedGenre(urlGenre);
  }, [searchParams]);

  const selectedGenreObj = useMemo(() => {
    return MOVIE_GENRES.find((g) => String(g.id) === String(selectedGenre)) || { id: "all", name: "Tutti i Film" };
  }, [selectedGenre]);

  // Caricamento film per la vista a griglia
  const fetchMovies = useCallback(async (genreId, sortValue, pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      let newMovies = [];
      if (genreId === "all") {
        if (sortValue === "vote_average.desc") {
          newMovies = await getTopRatedMovies(pageNum);
        } else {
          newMovies = await getPopularMoviesPaginated(pageNum);
        }
      } else {
        newMovies = await getMoviesByGenre(genreId, pageNum, sortValue);
      }

      if (append) {
        setMovies((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const filtered = newMovies.filter((m) => !existingIds.has(m.id));
          return [...prev, ...filtered];
        });
      } else {
        setMovies(newMovies);
      }

      setHasMore(newMovies.length > 0);
    } catch (error) {
      console.error("Errore nel caricamento dei film:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Caricamento griglia su cambio genere o ordinamento
  useEffect(() => {
    setPage(1);
    fetchMovies(selectedGenre, sortBy, 1, false);
  }, [selectedGenre, sortBy, fetchMovies]);

  // Caricamento righe dinamiche quando si è in vista a lista/file
  useEffect(() => {
    let isSubscribed = true;

    const loadRowsForGenre = async () => {
      try {
        if (selectedGenre === "all") {
          const [trending, top, action, comedy, scifi, horror] = await Promise.all([
            getTrendingMovies("week"),
            getTopRatedMovies(1),
            getMoviesByGenre(28, 1),
            getMoviesByGenre(35, 1),
            getMoviesByGenre(878, 1),
            getMoviesByGenre(27, 1)
          ]);

          if (isSubscribed) {
            setTrendingMovies(trending || []);
            setTopRatedMovies(top || []);
            setActionMovies(action || []);
            setComedyMovies(comedy || []);
            setScifiMovies(scifi || []);
            setHorrorMovies(horror || []);
          }
        } else {
          // Quando l'utente sceglie un genere specifico in vista file/lista!
          const [popular, topRated, recent] = await Promise.all([
            getMoviesByGenre(selectedGenre, 1, "popularity.desc"),
            getMoviesByGenre(selectedGenre, 1, "vote_average.desc"),
            getMoviesByGenre(selectedGenre, 1, "primary_release_date.desc")
          ]);

          if (isSubscribed) {
            setGenrePopularRows(popular || []);
            setGenreTopRatedRows(topRated || []);
            setGenreRecentRows(recent || []);
          }
        }
      } catch (e) {
        console.error("Errore nel caricamento delle file per genere:", e);
      }
    };

    loadRowsForGenre();

    return () => {
      isSubscribed = false;
    };
  }, [selectedGenre]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(selectedGenre, sortBy, nextPage, true);
  };

  const handleGenreClick = (genreId) => {
    setSelectedGenre(genreId);
    if (genreId === "all") {
      searchParams.delete("genre");
    } else {
      searchParams.set("genre", genreId);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="movie-wall-page">
      {/* Header & Controls */}
      <div className="movie-wall-header">
        <div className="movie-wall-title-row">
          <div>
            <h1 className="movie-wall-heading">
              Film {selectedGenre !== "all" ? `• ${selectedGenreObj.name}` : "Wall"}
              <span className="movie-wall-badge">
                {viewMode === "grid" ? `${movies.length} titoli caricati` : "File Tematiche"}
              </span>
            </h1>
          </div>

          <div className="movie-wall-controls">
            {viewMode === "grid" && (
              <select
                className="wall-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Ordina per"
              >
                <option value="popularity.desc">Più Popolari</option>
                <option value="vote_average.desc">Più Votati</option>
                <option value="primary_release_date.desc">Ultime Uscite</option>
              </select>
            )}

            <div className="wall-view-toggle">
              <button
                className={`wall-view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Vista a Griglia"
              >
                ⊞ Griglia
              </button>
              <button
                className={`wall-view-btn ${viewMode === "rows" ? "active" : ""}`}
                onClick={() => setViewMode("rows")}
                title="Vista a File Netflix"
              >
                ☰ File
              </button>
            </div>
          </div>
        </div>

        {/* Barra filtri generi dinamica */}
        <div className="genre-pills-bar">
          {MOVIE_GENRES.map((genre) => (
            <button
              key={genre.id}
              className={`genre-pill ${String(selectedGenre) === String(genre.id) ? "active" : ""}`}
              onClick={() => handleGenreClick(genre.id)}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Vista a File (Netflix Rows) */}
      {viewMode === "rows" ? (
        <div className="wall-rows-content">
          {selectedGenre !== "all" ? (
            /* Righe specifiche per il genere selezionato */
            <>
              <div className="wall-category-section">
                <h2 className="wall-category-title">I Più Popolari in {selectedGenreObj.name}</h2>
                <EmblaCarousel movies={genrePopularRows} onOpenDetails={handleOpenMedia} />
              </div>

              <div className="wall-category-section">
                <h2 className="wall-category-title">I Più Votati dalla Critica in {selectedGenreObj.name}</h2>
                <EmblaCarousel movies={genreTopRatedRows} onOpenDetails={handleOpenMedia} />
              </div>

              <div className="wall-category-section">
                <h2 className="wall-category-title">Ultime Novità in {selectedGenreObj.name}</h2>
                <EmblaCarousel movies={genreRecentRows} onOpenDetails={handleOpenMedia} />
              </div>
            </>
          ) : (
            /* Righe generali per Tutti i Film */
            <>
              <div className="wall-category-section">
                <h2 className="wall-category-title">Film in Tendenza questa Settimana</h2>
                <EmblaCarousel movies={trendingMovies} onOpenDetails={handleOpenMedia} />
              </div>

              <div className="wall-category-section">
                <h2 className="wall-category-title">I Grandi Capolavori (Top Rated)</h2>
                <EmblaCarousel movies={topRatedMovies} onOpenDetails={handleOpenMedia} />
              </div>

              <div className="wall-category-section">
                <h2 className="wall-category-title">Azione & Adrenalina</h2>
                <EmblaCarousel movies={actionMovies} onOpenDetails={handleOpenMedia} />
              </div>

              <div className="wall-category-section">
                <h2 className="wall-category-title">Commedie da non perdere</h2>
                <EmblaCarousel movies={comedyMovies} onOpenDetails={handleOpenMedia} />
              </div>

              <div className="wall-category-section">
                <h2 className="wall-category-title">Fantascienza & Mondi Futuri</h2>
                <EmblaCarousel movies={scifiMovies} onOpenDetails={handleOpenMedia} />
              </div>

              <div className="wall-category-section">
                <h2 className="wall-category-title">Brividi Horror</h2>
                <EmblaCarousel movies={horrorMovies} onOpenDetails={handleOpenMedia} />
              </div>
            </>
          )}
        </div>
      ) : (
        /* Vista a Griglia (Wall Grid) */
        <div>
          {loading && page === 1 ? (
            <div className="text-center py-12 text-neutral-400">Caricamento catalogo {selectedGenreObj.name}...</div>
          ) : (
            <>
              <div className="wall-movies-grid">
                {movies.map((movie) => (
                  <MediaCard
                    key={movie.id}
                    media={movie}
                    onOpenDetails={handleOpenMedia}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="load-more-container">
                  <button
                    className="load-more-btn"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Caricamento altri film..." : "Carica altri film ▾"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Mobile Bottom Sheet (Foto 2) */}
      {bottomSheetMedia && (
        <MobileBottomSheet
          media={bottomSheetMedia}
          onClose={() => setBottomSheetMedia(null)}
          onOpenFullDetails={handleOpenFullDetailsFromSheet}
        />
      )}

      {/* Quick Details Modal (Desktop) */}
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

export default MovieList;