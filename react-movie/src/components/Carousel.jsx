import useEmblaCarousel  from 'embla-carousel-react'
import { useCallback } from 'react'
import MovieCard from "../components/MovieCard"
import "../css/embla.css"

export function EmblaCarousel({ movies = [] }) {
  const slides = Array.isArray(movies) ? movies : []
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  if (!slides.length) return null

  return (
    <section className="embla">
      <button className="embla__button embla__button--prev" onClick={scrollPrev}>‹</button>

      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map(movie => (
            <div className="embla__slide" key={movie.id}>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>

      <button className="embla__button embla__button--next" onClick={scrollNext}>›</button>
    </section>
  )
}
