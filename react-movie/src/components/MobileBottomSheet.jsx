import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMovieContext } from "../contexts/MovieContext";
import "../css/MobileBottomSheet.css";

function MobileBottomSheet({ media, onClose, onOpenFullDetails }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, isLiked, toggleLike } = useMovieContext();

  useEffect(() => {
    // Blocca lo scroll del body quando il bottom sheet è aperto
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!media) return null;

  const mediaType = media.mediaType || (media.title ? "movie" : "tv");
  const title = media.title || media.name || "Titolo non disponibile";
  const year = (media.release_date || media.first_air_date || "").slice(0, 4);
  const posterUrl = media.poster_path
    ? `https://image.tmdb.org/t/p/w342${media.poster_path}`
    : null;

  const isFav = isFavorite(media.id);
  const liked = isLiked(media.id);

  const handlePlay = () => {
    onClose();
    navigate(`/watch/${mediaType}/${media.id}`);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite({ ...media, mediaType });
  };

  const handleToggleLike = (e) => {
    e.stopPropagation();
    toggleLike({ ...media, mediaType });
  };

  const handleDetailsClick = () => {
    if (onOpenFullDetails) {
      onOpenFullDetails(media);
    }
  };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet-container" onClick={(e) => e.stopPropagation()}>
        {/* Pulsante Chiusura X */}
        <button
          type="button"
          className="bottom-sheet-close"
          onClick={onClose}
          aria-label="Chiudi anteprima"
        >
          ✕
        </button>

        {/* Informazioni Principali (Locandina + Titolo + Sinossi) */}
        <div className="bottom-sheet-main">
          <div className="bottom-sheet-poster-wrap">
            {posterUrl ? (
              <img src={posterUrl} alt={title} className="bottom-sheet-poster" />
            ) : (
              <div className="bottom-sheet-poster-placeholder">🎬</div>
            )}
          </div>

          <div className="bottom-sheet-info">
            <h2 className="bottom-sheet-title">{title}</h2>
            <div className="bottom-sheet-meta">
              {year && <span>{year}</span>}
              {media.vote_average ? (
                <>
                  <span className="meta-dot">•</span>
                  <span className="bottom-sheet-score">★ {media.vote_average.toFixed(1)}</span>
                </>
              ) : null}
              <span className="meta-dot">•</span>
              <span className="bottom-sheet-type">{mediaType === "movie" ? "Film" : "Serie TV"}</span>
            </div>

            {media.overview && (
              <p className="bottom-sheet-overview">{media.overview}</p>
            )}
          </div>
        </div>

        {/* Barra delle Azioni con icone circolari e testo sotto (esattamente come in foto 2) */}
        <div className="bottom-sheet-actions">
          <button type="button" className="action-col" onClick={handlePlay}>
            <div className="action-circle play">
              <span>▶</span>
            </div>
            <span className="action-label">Riproduci</span>
          </button>

          <button type="button" className="action-col" onClick={handleToggleFavorite}>
            <div className={`action-circle ${isFav ? "active" : ""}`}>
              <span>{isFav ? "✓" : "+"}</span>
            </div>
            <span className="action-label">{isFav ? "In lista" : "La mia lista"}</span>
          </button>

          <button type="button" className="action-col" onClick={handleToggleLike}>
            <div className={`action-circle like ${liked ? "active" : ""}`}>
              <span>{liked ? "★" : "☆"}</span>
            </div>
            <span className="action-label">{liked ? "Valutato" : "Valuta"}</span>
          </button>
        </div>

        {/* Riga Finale: Dettagli e tanto altro > */}
        <div className="bottom-sheet-footer-link" onClick={handleDetailsClick}>
          <div className="footer-link-left">
            <span className="footer-icon">ⓘ</span>
            <span>Dettagli e tanto altro</span>
          </div>
          <span className="footer-arrow">›</span>
        </div>
      </div>
    </div>
  );
}

export default MobileBottomSheet;
