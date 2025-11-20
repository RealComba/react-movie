import { useEffect } from "react";
import "../css/Home.css";
import { EmblaCarousel } from "../components/Carousel";
import { useSearchContext } from "../contexts/SearchContext";
import MediaCard from "../components/MovieCard";

function Home() {
  const { searchName, movies, series, error, loading, loadPopularMovies, loadPopularSeries } = useSearchContext();

  useEffect(() => {
    loadPopularMovies();
    loadPopularSeries();
  }, []);

  const filteredMovies = Array.isArray(movies)
    ? movies.filter(m => (m.title || "").toLowerCase().includes(searchName.toLowerCase()))
    : [];

  const filteredSeries = Array.isArray(series)
    ? series.filter(s => (s.name || "").toLowerCase().includes(searchName.toLowerCase()))
    : [];

  return (
    <div className="home px-[4rem] pt-[2rem]">
      {error && <p className="error-message">{error}</p>}

      <p className="font-bold text-2xl pb-4 text-neutral-200">I film più visti</p>
      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <>
          <EmblaCarousel movies={filteredMovies} />
          <p className="font-bold text-2xl pb-4 text-neutral-200">Le serie più viste</p>
          <EmblaCarousel movies={filteredSeries} />
        </>
      )}
    </div>
  );
}

export default Home;