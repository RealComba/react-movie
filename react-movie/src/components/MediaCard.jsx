import "../css/MovieCard.css";
import { useMovieContext } from "../contexts/MovieContext";
import { useNavigate } from "react-router-dom";

function MediaCard({ media, onOpenDetails }) {
    const navigate = useNavigate();
    const { isFavorite, toggleFavorite, isLiked, toggleLike } = useMovieContext();

    if (!media || !media.poster_path) return null;

    const isFav = isFavorite(media.id);
    const liked = isLiked(media.id);
    const mediaType = media.mediaType || (media.title ? "movie" : "tv");
    const title = media.title || media.name;
    const year = (media.release_date || media.first_air_date || "").slice(0, 4);
    const matchScore = Math.max(70, Math.min(99, Math.round((media.vote_average || 7.2) * 10)));

    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite({ ...media, mediaType });
    };

    const handleLikeClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLike({ ...media, mediaType });
    };

    const handlePlayClick = (e) => {
        e.stopPropagation();
        navigate(`/watch/${mediaType}/${media.id}`);
    };

    const handleDetailsClick = (e) => {
        e.stopPropagation();
        if (onOpenDetails) {
            onOpenDetails({ ...media, mediaType });
        } else {
            navigate(`/watch/${mediaType}/${media.id}`);
        }
    };

    return (
        <div
            className="movie-card"
            onClick={handleDetailsClick}
            tabIndex="0"
            onKeyDown={(e) => {
                if (e.key === 'Enter') handleDetailsClick(e);
            }}
            role="button"
            aria-label={title}
        >
            <div className="movie-poster">
                <img
                    src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                    alt={title}
                    loading="lazy"
                />
                <div className="movie-overlay">
                    <div className="overlay-content">
                        <h3 className="overlay-title" title={title}>{title}</h3>

                        <div className="overlay-meta">
                            <span className="match-score">{matchScore}% Match</span>
                            {year && <span className="meta-year">{year}</span>}
                            <span className="badge-hd">HD</span>
                        </div>

                        <div className="movie-actions">
                            <button
                                type="button"
                                className="btn play"
                                title="Riproduci"
                                onClick={handlePlayClick}
                            >
                                ▶
                            </button>
                            <button
                                type="button"
                                className={`btn favorite-btn ${isFav ? "active" : ""}`}
                                title={isFav ? "Rimuovi dalla lista" : "Aggiungi alla lista"}
                                onClick={handleFavoriteClick}
                            >
                                {isFav ? "✓" : "+"}
                            </button>
                            <button
                                type="button"
                                className={`btn like-btn ${liked ? "active" : ""}`}
                                title={liked ? "Non mi piace più" : "Mi piace"}
                                onClick={handleLikeClick}
                            >
                                {liked ? "❤️" : "🤍"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MediaCard;