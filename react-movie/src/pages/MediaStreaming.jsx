import "../css/MediaStreaming.css";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById, getSeriesById, getImages, getYoutube, getNowPlayingMovies } from "../services/api";
import { useState, useEffect } from "react";
import { EmblaCarousel } from "../components/Carousel";
import { useMovieContext } from "../contexts/MovieContext";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

function MediaStreaming() {
  const navigate = useNavigate();
  const { mediaType, id } = useParams();
  const { isFavorite, toggleFavorite, isLiked, toggleLike } = useMovieContext();

  const [mediaData, setMediaData] = useState(null);
  const [season, setSeason] = useState(1);
  const [imageData, setImageData] = useState();
  const [youtubeData, setYoutubeData] = useState();
  const [nowPlaying, setNowPlaying] = useState();
  const [ep, setEp] = useState(1);
  const [showMore, setShowMore] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    async function fetchMedia() {
      try {
        let data;
        if (mediaType === "movie") {
          data = await getMovieById(id);
        } else {
          data = await getSeriesById(id);
        }

        if (!isSubscribed) return;
        setMediaData(data);

        const [images, youtube, playing] = await Promise.allSettled([
          getImages(id, mediaType),
          getYoutube(id, mediaType),
          getNowPlayingMovies()
        ]);

        if (!isSubscribed) return;
        if (images.status === "fulfilled") setImageData(images.value);
        if (youtube.status === "fulfilled") setYoutubeData(youtube.value);
        if (playing.status === "fulfilled") setNowPlaying(playing.value);
      } catch (err) {
        console.error("Errore nel caricamento del media:", err);
      }
    }

    fetchMedia();

    // Mostra il trailer dopo 3 secondi
    const timer = setTimeout(() => {
      if (isSubscribed) setShowTrailer(true);
    }, 3000);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [mediaType, id]);

  if (!mediaData) return <p className="loading">Caricamento dettagli...</p>;

  const isFav = isFavorite(mediaData.id);
  const liked = isLiked(mediaData.id);

  function openMedia() {
    navigate(`/watch/${mediaType}/${mediaData.id}/stream`, { state: { season, ep } });
  }

  const playerUrl = mediaData.name
    ? `https://vixsrc.to/tv/${id}/${season}/${ep}?lang=it`
    : `https://vixsrc.to/movie/${id}?lang=it`;

  // Estrai il primo video youtube dai dati
  const youtubeVideo = youtubeData?.results?.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );

  const youtubeUrl = youtubeVideo
    ? `https://www.youtube.com/embed/${youtubeVideo.key}?muted=1&autoplay=1&controls=0&modestbranding=1&rel=0`
    : null;

  const trailerUrl = youtubeUrl || (mediaData.title ? playerUrl : null);

  return (
    <div className="media-streaming-container">
      <div className="media-hero">
        <div className="media-sidebar">
          <div className="movie-logo-container">
            {imageData?.logos?.[0]?.file_path && (
              <img
                alt={mediaData.title || mediaData.name}
                src={`${IMAGE_BASE_URL}${imageData.logos[0].file_path}`}
                className="movie-logo"
              />
            )}
            <div className="media-info">
              {mediaData.title ? (
                <p>{mediaData.release_date?.slice(0, 4)}</p>
              ) : (
                <p>{mediaData.first_air_date?.slice(0, 4)}</p>
              )}
              {mediaData.name && mediaData.seasons?.length > 0 && (
                <p>• {mediaData.seasons.length} Stagioni</p>
              )}
              {mediaData.runtime && <p>• {mediaData.runtime} min</p>}
            </div>

            <div className="media-actions">
              <button onClick={openMedia} className="btn-play">
                ▶ Riproduci
              </button>

              <div
                className="progress-ring"
                style={{
                  "--progress": mediaData.vote_average
                    ? `${Math.round(mediaData.vote_average * 10)}%`
                    : "0%",
                }}
              >
                <span className="progress-text">
                  {mediaData.vote_average ? mediaData.vote_average.toFixed(1) : ""}
                </span>
              </div>

              <button
                type="button"
                className={`btn-icon ${isFav ? "active" : ""}`}
                title={isFav ? "Rimuovi dalla lista" : "Aggiungi alla lista"}
                onClick={() => toggleFavorite({ ...mediaData, mediaType })}
              >
                {isFav ? "✓" : "✚"}
              </button>

              <button
                type="button"
                className={`btn-icon ${liked ? "active" : ""}`}
                title={liked ? "Non mi piace più" : "Mi piace"}
                onClick={() => toggleLike({ ...mediaData, mediaType })}
              >
                {liked ? "❤️" : "🤍"}
              </button>
            </div>
          </div>

          <div className="media-details">
            <p className={showMore ? "media-overview expanded" : "media-overview clamped"}>
              {mediaData.overview}
            </p>
            <button
              className="read-toggle-btn"
              onClick={() => setShowMore((prev) => !prev)}
            >
              {showMore ? "Leggi di meno" : "Leggi di più"}
            </button>

            <div className="media-meta">
              <span className="meta-label">Generi:</span>
              <span className="meta-value">
                {Array.isArray(mediaData.genres)
                  ? mediaData.genres.map((g) => g.name).join(", ")
                  : null}
              </span>
            </div>

            {mediaData.name && mediaData.seasons && (
              <div className="selector-group">
                <p className="selector-title">Stagioni:</p>
                <div className="selector-options">
                  {mediaData.seasons
                    .filter((s) => s.season_number > 0)
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSeason(s.season_number);
                          setEp(1);
                        }}
                        className={`season-btn ${season === s.season_number ? "active" : ""}`}
                      >
                        {s.season_number}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {mediaData.name && mediaData.seasons && (
              <div className="selector-group">
                <p className="selector-title">Episodi:</p>
                <div className="selector-options">
                  {Array.from(
                    {
                      length:
                        mediaData.seasons.find((s) => s.season_number === season)
                          ?.episode_count || 0,
                    },
                    (_, i) => i + 1
                  ).map((episodeNum) => (
                    <button
                      key={episodeNum}
                      onClick={() => setEp(episodeNum)}
                      className={`episode-btn ${ep === episodeNum ? "active" : ""}`}
                    >
                      {episodeNum}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="media-backdrop">
          {!showTrailer && (
            <div
              className="backdrop-image"
              style={{
                backgroundImage: `url('https://image.tmdb.org/t/p/original${mediaData.backdrop_path}')`,
              }}
            />
          )}
          {showTrailer && (
            <iframe
              title="Trailer"
              src={trailerUrl}
              className="trailer-iframe"
              referrerPolicy="no-referrer"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
          <div className="backdrop-gradient" />
        </div>
      </div>

      {/* Sezione Now Playing */}
      {nowPlaying && nowPlaying.length > 0 && (
        <div className="now-playing-section">
          <p className="section-title">Al cinema ora</p>
          <EmblaCarousel movies={nowPlaying} />
        </div>
      )}
    </div>
  );
}

export default MediaStreaming;
