import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import MediaCard from "../components/MediaCard";
import EmblaCarousel from "../components/Carousel";
import QuickDetailModal from "../components/QuickDetailModal";
import MobileBottomSheet from "../components/MobileBottomSheet";
import {
  getPopularSeriesPaginated,
  getTopRatedSeries,
  getSeriesByGenre,
  SERIES_GENRES
} from "../services/api";
import "../css/MovieList.css";

function Series() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreFromUrl = searchParams.get("genre") || "all";

  const [selectedGenre, setSelectedGenre] = useState(genreFromUrl);
  const [viewMode, setViewMode] = useState("rows"); // "rows" o "grid"
  const [seriesList, setSeriesList] = useState([]);
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

  // Categorie per le file Netflix quando selectedGenre === 'all'
  const [popularSeries, setPopularSeries] = useState([]);
  const [topRatedSeries, setTopRatedSeries] = useState([]);
  const [dramaSeries, setDramaSeries] = useState([]);
  const [scifiSeries, setScifiSeries] = useState([]);
  const [crimeSeries, setCrimeSeries] = useState([]);

  // File specifiche per genere selezionato
  const [genrePopularSeries, setGenrePopularSeries] = useState([]);
  const [genreTopRatedSeries, setGenreTopRatedSeries] = useState([]);

  useEffect(() => {
    const urlGenre = searchParams.get("genre") || "all";
    setSelectedGenre(urlGenre);
  }, [searchParams]);

  const selectedGenreObj = useMemo(() => {
    return SERIES_GENRES.find((g) => String(g.id) === String(selectedGenre)) || { id: "all", name: "Tutte le Serie" };
  }, [selectedGenre]);

  // Caricamento file Netflix
  useEffect(() => {
    let isSubscribed = true;

    const loadSeriesRows = async () => {
      try {
        if (selectedGenre === "all") {
          const [popular, top, drama, scifi, crime] = await Promise.all([
            getPopularSeriesPaginated(1),
            getTopRatedSeries(1),
            getSeriesByGenre(18, 1),
            getSeriesByGenre(10765, 1),
            getSeriesByGenre(80, 1)
          ]);

          if (isSubscribed) {
            setPopularSeries(popular || []);
            setTopRatedSeries(top || []);
            setDramaSeries(drama || []);
            setScifiSeries(scifi || []);
            setCrimeSeries(crime || []);
          }
        } else {
          const [popular, topRated] = await Promise.all([
            getSeriesByGenre(selectedGenre, 1),
            getSeriesByGenre(selectedGenre, 2)
          ]);

          if (isSubscribed) {
            setGenrePopularSeries(popular || []);
            setGenreTopRatedSeries(topRated || []);
          }
        }
      } catch (e) {
        console.error("Errore nel caricamento delle serie:", e);
      }
    };

    loadSeriesRows();

    return () => {
      isSubscribed = false;
    };
  }, [selectedGenre]);

  // Fetch per la vista a griglia o per genere
  const fetchSeries = useCallback(async (genreId, pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      let newSeries = [];
      if (genreId === "all") {
        newSeries = await getPopularSeriesPaginated(pageNum);
      } else {
        newSeries = await getSeriesByGenre(genreId, pageNum);
      }

      if (append) {
        setSeriesList((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const filtered = newSeries.filter((s) => !existingIds.has(s.id));
          return [...prev, ...filtered];
        });
      } else {
        setSeriesList(newSeries);
      }

      setHasMore(newSeries.length > 0);
    } catch (error) {
      console.error("Errore nel caricamento serie per genere:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchSeries(selectedGenre, 1, false);
  }, [selectedGenre, fetchSeries]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSeries(selectedGenre, nextPage, true);
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
              Serie TV {selectedGenre !== "all" ? `• ${selectedGenreObj.name}` : ""}
              <span className="movie-wall-badge">
                {viewMode === "grid" ? `${seriesList.length} serie caricate` : "File Tematiche"}
              </span>
            </h1>
          </div>

          <div className="movie-wall-controls">
            <div className="wall-view-toggle">
              <button
                className={`wall-view-btn ${viewMode === "rows" ? "active" : ""}`}
                onClick={() => setViewMode("rows")}
                title="Vista a File Netflix"
              >
                ☰ File
              </button>
              <button
                className={`wall-view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Vista a Griglia"
              >
                ⊞ Griglia
              </button>
            </div>
          </div>
        </div>

        {/* Filtro per generi */}
        <div className="genre-pills-bar">
          {SERIES_GENRES.map((genre) => (
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

      {/* Contenuto a File Netflix */}
      {viewMode === "rows" ? (
        <div className="wall-rows-content">
          {selectedGenre !== "all" ? (
            <>
              <div className="wall-category-section">
                <h2 className="wall-category-title">Le Più Popolari in {selectedGenreObj.name}</h2>
                <EmblaCarousel movies={genrePopularSeries} onOpenDetails={handleOpenMedia} />
              </div>

              <div className="wall-category-section">
                <h2 className="wall-category-title">Da non perdere in {selectedGenreObj.name}</h2>
                <EmblaCarousel movies={genreTopRatedSeries} onOpenDetails={handleOpenMedia} />
              </div>
            </>
          ) : (
            <>
              <div className="wall-category-section">
                <h2 className="wall-category-title">Serie TV Più Popolari</h2>
                <EmblaCarousel movies={popularSeries} onOpenDetails={handleOpenMedia} />
              </div>

              <div className="wall-category-section">
                <h2 className="wall-category-title">Le Più Apprezzate dalla Critica</h2>
                <EmblaCarousel movies={topRatedSeries} onOpenDetails={handleOpenMedia} />
              </div>

              <div className="wall-category-section">
                <h2 className="wall-category-title">Sci-Fi & Fantasy</h2>
                <EmblaCarousel movies={scifiSeries} onOpenDetails={handleOpenMedia} />
              </div>

              <div className="wall-category-section">
                <h2 className="wall-category-title">Crimini & Misteri</h2>
                <EmblaCarousel movies={crimeSeries} onOpenDetails={handleOpenMedia} />
              </div>

              <div className="wall-category-section">
                <h2 className="wall-category-title">Grandi Storie & Dramma</h2>
                <EmblaCarousel movies={dramaSeries} onOpenDetails={handleOpenMedia} />
              </div>
            </>
          )}
        </div>
      ) : (
        /* Contenuto a Griglia */
        <div>
          {loading && page === 1 ? (
            <div className="text-center py-12 text-neutral-400">Caricamento catalogo serie TV...</div>
          ) : (
            <>
              <div className="wall-movies-grid">
                {seriesList.map((item) => (
                  <MediaCard
                    key={item.id}
                    media={item}
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
                    {loadingMore ? "Caricamento altre serie..." : "Carica altre serie ▾"}
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

export default Series;