import { useNavigate } from "react-router-dom";
import "../css/Home.css";

function HeroBanner({ media }) {
  const navigate = useNavigate();

  if (!media) return null;

  const title = media.title || media.name;
  const hasBackdrop = Boolean(media.backdrop_path);
  const bgUrl = hasBackdrop
    ? `https://image.tmdb.org/t/p/original${media.backdrop_path}`
    : undefined;

  const handleWatch = () => {
    const mediaType = media.title ? "movie" : "tv";
    navigate(`/watch/${mediaType}/${media.id}`);
  };

  return (
    <section
      className="hero-banner"
      style={
        hasBackdrop
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.75)), url('${bgUrl}')`,
            }
          : undefined
      }
      aria-label={title}
    >
      <div className="hero__content">
        <h1 className="hero__title text-4xl">{title}</h1>
        {media.overview && (
          <p className="hero__overview hero__overview--clamp text-sm">{media.overview}</p>
        )}
        <div className="hero__actions">
          <button className="hero__btn hero__btn--primary" onClick={handleWatch}>
            Guarda ora
          </button>
          <button className="w-30 bg-neutral-500 rounded-lg font-bold flex flex-row items-center gap-2 p-2 text-blackx" onClick={handleWatch}>
            <img className="w-5" src="https://www.svgrepo.com/show/24584/info-icon.svg" alt="" />
            Altre Info
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
