import { useNavigate } from "react-router-dom";
import "../css/Home.css";
import { useState, useEffect, useRef } from "react";
import { getYoutube, MOVIE_GENRES } from "../services/api";

function HeroBanner({ media, onOpenDetails }) {
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [genresOpen, setGenresOpen] = useState(false);
  const genresRef = useRef(null);

  const mediaType = media?.title ? "movie" : "tv";

  useEffect(() => {
    if (!media?.id) return;

    let isSubscribed = true;
    const fetchTrailer = async () => {
      try {
        const youtubeData = await getYoutube(media.id, mediaType);
        const trailer = youtubeData?.results?.find(
          (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
        );
        if (isSubscribed && trailer) {
          setTrailerKey(trailer.key);
        }
      } catch (e) {
        console.error("Failed to fetch trailer", e);
      }
    };

    fetchTrailer();

    // Auto-play trailer after 4 seconds
    const timer = setTimeout(() => {
      if (isSubscribed) setShowTrailer(true);
    }, 4000);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [media?.id, mediaType]);

  // Chiudi dropdown generi su click esterno
  useEffect(() => {
    const handleOutside = (e) => {
      if (genresRef.current && !genresRef.current.contains(e.target)) {
        setGenresOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  if (!media) return null;

  const title = media.title || media.name;
  const hasBackdrop = Boolean(media.backdrop_path);
  const bgUrl = hasBackdrop
    ? `https://image.tmdb.org/t/p/original${media.backdrop_path}`
    : undefined;

  const handleWatch = () => {
    navigate(`/watch/${mediaType}/${media.id}`);
  };

  const handleInfo = () => {
    if (onOpenDetails) {
      onOpenDetails({ ...media, mediaType });
    } else {
      handleWatch();
    }
  };

  const handleGenreSelect = (genreId) => {
    setGenresOpen(false);
    navigate(genreId === "all" ? "/film" : `/film?genre=${genreId}`);
  };

  const youtubeEmbedUrl = trailerKey
    ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&loop=1&playlist=${trailerKey}`
    : null;

  return (
    <section className="hero-banner" aria-label={title}>
      {/* Background Image Layer */}
      <div
        className={`hero-bg-image ${showTrailer && trailerKey ? "fade-out" : "fade-in"}`}
        style={
          hasBackdrop
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(11, 13, 20, 0.85)), url('${bgUrl}')`,
              }
            : undefined
        }
      />

      {/* YouTube Trailer Layer */}
      {showTrailer && trailerKey && (
        <div className="hero-trailer">
          <iframe
            src={youtubeEmbedUrl}
            title="Trailer"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "100%",
              height: "100%",
              minWidth: "100%",
              minHeight: "100%",
              transform: "translate(-50%, -50%) scale(1.35)",
              pointerEvents: "none",
            }}
          />
        </div>
      )}

      {/* Top Bar Floating Over Hero (Generi a sinistra, Social a destra come in Foto 1) */}
      <div className="hero-top-overlay">
        <div className="hero-genres-container" ref={genresRef}>
          <button
            type="button"
            className="hero-genres-trigger"
            onClick={() => setGenresOpen((prev) => !prev)}
            aria-label="Filtra per generi"
          >
            Generi <span className="hero-genres-arrow">▾</span>
          </button>

          {genresOpen && (
            <div className="hero-genres-menu">
              <div className="hero-genres-header">Tutti i generi</div>
              <div className="hero-genres-list">
                {MOVIE_GENRES.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className="hero-genre-option"
                    onClick={() => handleGenreSelect(g.id)}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hero-social-links">
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-social-icon"
            title="Canale Telegram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-social-icon"
            title="Instagram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-social-icon"
            title="Twitter / X"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="hero-gradient-overlay" />

      {/* Content Overlay: Titolo Giallo/Dorato e i 2 Bottoni come in Foto 1 e 2 */}
      <div className="hero__content">
        <h1 className="hero__title">{title}</h1>
        {media.overview && (
          <p className="hero__overview hero__overview--clamp">{media.overview}</p>
        )}

        <div className="hero__actions">
          <button className="hero__btn hero__btn--primary" onClick={handleWatch}>
            <span className="hero-play-icon">▶</span> Riproduci
          </button>

          <button className="hero__btn hero__btn--secondary" onClick={handleInfo}>
            <span className="hero-info-circle">ⓘ</span> Altre info
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
