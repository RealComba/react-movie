import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMovieContext } from "../contexts/MovieContext";
import {
  getMovieById,
  getSeriesById,
  getYoutube,
  getCredits,
  getSimilar
} from "../services/api";
import "../css/QuickDetailModal.css";

export function QuickDetailModal({ media, onClose, onSelectMedia }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, isLiked, toggleLike } = useMovieContext();

  const [details, setDetails] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [credits, setCredits] = useState(null);
  const [similar, setSimilar] = useState([]);

  const mediaType = media?.mediaType || (media?.title ? "movie" : "tv");
  const isFav = media ? isFavorite(media.id) : false;
  const liked = media ? isLiked(media.id) : false;

  // Chiudi su tasto Esc e blocca scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  // Caricamento dettagli, trailer, crediti e simili
  useEffect(() => {
    if (!media?.id) return;

    let isMounted = true;

    const loadData = async () => {
      try {
        const fetchDetails = mediaType === "movie"
          ? getMovieById(media.id)
          : getSeriesById(media.id);

        const [detailData, youtubeData, creditsData, similarData] = await Promise.allSettled([
          fetchDetails,
          getYoutube(media.id, mediaType),
          getCredits(media.id, mediaType),
          getSimilar(media.id, mediaType)
        ]);

        if (!isMounted) return;

        if (detailData.status === "fulfilled") setDetails(detailData.value);

        if (youtubeData.status === "fulfilled" && youtubeData.value?.results) {
          const trailer = youtubeData.value.results.find(
            (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
          );
          if (trailer) setTrailerKey(trailer.key);
        }

        if (creditsData.status === "fulfilled") setCredits(creditsData.value);
        if (similarData.status === "fulfilled") setSimilar(similarData.value || []);
      } catch (err) {
        console.error("Errore nel caricamento dei dati della modal:", err);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [media?.id, mediaType]);

  const handlePlay = () => {
    onClose();
    navigate(`/watch/${mediaType}/${media.id}`);
  };

  if (!media) return null;

  const currentData = details || media;
  const title = currentData.title || currentData.name;
  const year = (currentData.release_date || currentData.first_air_date || "").slice(0, 4);
  const matchScore = Math.max(72, Math.min(99, Math.round((currentData.vote_average || 7.2) * 10)));
  const backdropUrl = currentData.backdrop_path
    ? `https://image.tmdb.org/t/p/original${currentData.backdrop_path}`
    : currentData.poster_path
    ? `https://image.tmdb.org/t/p/original${currentData.poster_path}`
    : null;

  const castNames = credits?.cast?.slice(0, 4).map(c => c.name).join(", ");
  const genresList = currentData.genres?.map(g => g.name).join(", ");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Pulsante chiusura */}
        <button
          type="button"
          aria-label="Chiudi"
          className="modal-close-btn"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Hero Section / Trailer Preview */}
        <div
          className="modal-hero"
          style={backdropUrl && !trailerKey ? { backgroundImage: `url('${backdropUrl}')` } : {}}
        >
          {trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${trailerKey}`}
              title="Trailer"
              className="modal-trailer-iframe"
              allow="autoplay; encrypted-media"
            />
          ) : null}

          <div className="modal-hero-gradient" />

          <div className="modal-hero-content">
            <h2 className="modal-title">{title}</h2>
            <div className="modal-actions">
              <button className="modal-btn-play" onClick={handlePlay}>
                ▶ Riproduci
              </button>

              <button
                type="button"
                className={`modal-btn-icon ${isFav ? "active" : ""}`}
                title={isFav ? "Rimuovi dalla lista" : "Aggiungi alla lista"}
                onClick={() => toggleFavorite({ ...currentData, mediaType })}
              >
                {isFav ? "✓" : "+"}
              </button>

              <button
                type="button"
                className={`modal-btn-icon ${liked ? "active" : ""}`}
                title={liked ? "Non mi piace più" : "Mi piace"}
                onClick={() => toggleLike({ ...currentData, mediaType })}
              >
                {liked ? "❤️" : "🤍"}
              </button>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="modal-body">
          <div className="modal-meta-row">
            <span className="modal-match">{matchScore}% di compatibilità</span>
            {year && <span className="modal-year">{year}</span>}
            <span className="modal-badge-age">16+</span>
            {currentData.runtime && (
              <span className="modal-duration">
                {Math.floor(currentData.runtime / 60)}h {currentData.runtime % 60}m
              </span>
            )}
            {currentData.number_of_seasons && (
              <span className="modal-duration">
                {currentData.number_of_seasons} {currentData.number_of_seasons === 1 ? "Stagione" : "Stagioni"}
              </span>
            )}
            <span className="modal-badge-hd">HD</span>
          </div>

          <div className="modal-details-grid">
            <p className="modal-overview">
              {currentData.overview || "Nessuna descrizione disponibile in italiano per questo titolo."}
            </p>

            <div className="modal-tags">
              {castNames && (
                <div className="modal-tag-item">
                  <span className="modal-tag-label">Cast:</span>
                  <span className="modal-tag-value">{castNames}</span>
                </div>
              )}
              {genresList && (
                <div className="modal-tag-item">
                  <span className="modal-tag-label">Generi:</span>
                  <span className="modal-tag-value">{genresList}</span>
                </div>
              )}
              {currentData.vote_average && (
                <div className="modal-tag-item">
                  <span className="modal-tag-label">Voto TMDB:</span>
                  <span className="modal-tag-value">★ {currentData.vote_average.toFixed(1)} / 10</span>
                </div>
              )}
            </div>
          </div>

          {/* Titoli Simili */}
          {similar && similar.length > 0 && (
            <div>
              <h3 className="modal-section-title">Titoli Simili</h3>
              <div className="modal-similar-grid">
                {similar.slice(0, 6).map((item) => (
                  item.poster_path && (
                    <div
                      key={item.id}
                      className="modal-similar-card"
                      onClick={() => {
                        if (onSelectMedia) {
                          onSelectMedia({ ...item, mediaType });
                        } else {
                          onClose();
                          navigate(`/watch/${mediaType}/${item.id}`);
                        }
                      }}
                      title={item.title || item.name}
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                        alt={item.title || item.name}
                        loading="lazy"
                      />
                      <div className="similar-title">{item.title || item.name}</div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuickDetailModal;
