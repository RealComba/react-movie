import { Link } from "react-router-dom";

export default function HeroBanner({ media }) {
  if (!media) return null;
  const title = media.title || media.name;
  return <section className="hero-banner" aria-label="In evidenza"
    style={media.backdrop_path ? { backgroundImage: `url(https://image.tmdb.org/t/p/w1280${media.backdrop_path})` } : undefined}>
    <div className="hero-content">
      <p className="eyebrow">In evidenza</p>
      <h1>{title}</h1>
      {media.overview && <p className="hero-overview">{media.overview}</p>}
      <Link className="button button-primary" to={`/watch/${media.mediaType || "movie"}/${media.id}`}
        data-tv-focus data-focus-id="hero-details" data-page-focus>Scopri il titolo <span aria-hidden="true">→</span></Link>
    </div>
  </section>;
}
