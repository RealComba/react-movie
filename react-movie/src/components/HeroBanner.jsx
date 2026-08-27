import { useNavigate } from "react-router-dom";
import "../css/Home.css";
import icon from "../assets/info-icon.svg";
import { useState, useEffect } from "react";
import { getYoutube } from "../services/api";
import { useMovieContext } from "../contexts/MovieContext";

function HeroBanner({ media, onOpenDetails }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, isLiked, toggleLike } = useMovieContext();
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);

  const mediaType = media?.title ? "movie" : "tv";
  const isFav = media ? isFavorite(media.id) : false;
  const liked = media ? isLiked(media.id) : false;

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
                backgroundImage: `linear-gradient(rgba(0,0,0,0.25), rgba(11, 13, 20, 0.85)), url('${bgUrl}')`,
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

      <div className="hero-gradient-overlay" />

      {/* Content Overlay */}
      <div className="hero__content">
        <h1 className="hero__title">{title}</h1>
        {media.overview && (
          <p className="hero__overview hero__overview--clamp">{media.overview}</p>
        )}

        <div className="hero__actions">
          <button className="hero__btn hero__btn--primary" onClick={handleWatch}>
            ▶ Riproduci
          </button>

          <button
            className={`hero__btn hero__btn--secondary ${isFav ? "active" : ""}`}
            onClick={() => toggleFavorite({ ...media, mediaType })}
            title={isFav ? "Rimuovi dalla lista" : "Aggiungi alla lista"}
          >
            {isFav ? "✓ In lista" : "+ Lista"}
          </button>

          <button
            className={`hero__btn hero__btn--secondary hero__btn--icon ${liked ? "active" : ""}`}
            onClick={() => toggleLike({ ...media, mediaType })}
            title={liked ? "Non mi piace più" : "Mi piace"}
          >
            {liked ? "❤️" : "🤍"}
          </button>

          <button className="hero__btn hero__btn--secondary" onClick={handleInfo}>
            <img className="icon-sm" src={icon} alt="" style={{ width: "16px", height: "16px" }} />
            Info
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
