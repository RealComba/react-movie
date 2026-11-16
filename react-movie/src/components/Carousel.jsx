import { useId, useRef } from "react";
import MediaCard from "./MediaCard";
import "../css/embla.css";

// Native overflow keeps focus and scroll in sync with a remote, touch and Tab.
export function EmblaCarousel({ movies = [], title = "Titoli", rowId = "titles" }) {
  const rail = useRef(null);
  const headingId = useId();
  if (!movies.length) return null;
  function scroll(direction) {
    rail.current.scrollBy({ left: direction * rail.current.clientWidth * 0.8, behavior: "auto" });
  }
  return <section className="media-row" aria-labelledby={headingId}>
    <div className="row-heading">
      <h2 id={headingId}>{title}</h2>
      <div className="row-controls">
        <button type="button" aria-label={`Scorri indietro: ${title}`} onClick={() => scroll(-1)}>‹</button>
        <button type="button" aria-label={`Scorri avanti: ${title}`} onClick={() => scroll(1)}>›</button>
      </div>
    </div>
    <div className="media-rail" ref={rail} data-focus-row data-focus-lock>
      {movies.map(media => <MediaCard key={`${media.mediaType || "media"}-${media.id}`}
        media={media} focusPrefix={rowId} />)}
    </div>
  </section>;
}
export default EmblaCarousel;
