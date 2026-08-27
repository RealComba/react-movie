import { useCallback, useState, useEffect, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import MediaCard from "./MediaCard";
import "../css/embla.css";

export function EmblaCarousel({ movies = [], onOpenDetails }) {
  const slides = useMemo(() => (Array.isArray(movies) ? movies : []), [movies]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    duration: 35, // velocità e transizione uniforme e controllata
    skipSnaps: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    // Assegna listener su eventi Embla
    emblaApi.on('select', updateScrollState);
    emblaApi.on('reInit', updateScrollState);

    // Initial check asincrono per evitare cascading render
    const timer = setTimeout(() => {
      updateScrollState();
    }, 0);

    return () => {
      clearTimeout(timer);
      emblaApi.off('select', updateScrollState);
      emblaApi.off('reInit', updateScrollState);
    };
  }, [emblaApi, updateScrollState, slides]);

  const scrollPrev = useCallback((e) => {
    e.stopPropagation();
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e) => {
    e.stopPropagation();
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!slides.length) return null;

  return (
    <section className="embla">
      <button
        type="button"
        aria-label="Precedente"
        className="embla__paddle embla__paddle--prev"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
      >
        <svg viewBox="0 0 24 24">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>

      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((movie) => (
            <div className="embla__slide" key={movie.id}>
              <MediaCard media={movie} onOpenDetails={onOpenDetails} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Successivo"
        className="embla__paddle embla__paddle--next"
        onClick={scrollNext}
        disabled={!canScrollNext}
      >
        <svg viewBox="0 0 24 24">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>
    </section>
  );
}

export default EmblaCarousel;
