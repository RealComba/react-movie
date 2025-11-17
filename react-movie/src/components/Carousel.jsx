import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import MovieCard from "../components/MovieCard"
import "../css/embla.css"

export function EmblaCarousel({ movies = [] }) {
  const slides = Array.isArray(movies) ? movies : []
  const [emblaRef] = useEmblaCarousel()

  if (slides.length === 0) return null
  console.log(slides)

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((movie, index) => (
            <div className="embla__slide" key={movie?.id ?? index}>
              <div className="embla__slide__number">{index + 1}</div>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default EmblaCarousel
