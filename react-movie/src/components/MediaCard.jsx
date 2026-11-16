import { Link } from "react-router-dom";
import "../css/MovieCard.css";

export default function MediaCard({ media, focusPrefix = "media" }) {
  if (!media) return null;
  const mediaType = media.mediaType === "series" ? "tv" : media.mediaType || (media.title ? "movie" : "tv");
  const title = media.title || media.name || "Titolo non disponibile";
  const year = (media.release_date || media.first_air_date || "").slice(0, 4);
  return <Link className="movie-card" to={`/watch/${mediaType}/${media.id}`}
    data-tv-focus data-focus-id={`${focusPrefix}-${mediaType}-${media.id}`}
    aria-label={`${title}${year ? `, ${year}` : ""}`}>
    <div className="movie-poster">
      <span className="poster-placeholder" aria-hidden="true">{title}</span>
      {media.poster_path && <img src={`https://image.tmdb.org/t/p/w342${media.poster_path}`}
        alt="" loading="lazy" decoding="async" width="342" height="513"
        onError={event => { event.currentTarget.style.display = "none"; }} />}
    </div>
    <div className="movie-caption"><h3>{title}</h3>{year && <span>{year}</span>}</div>
  </Link>;
}
