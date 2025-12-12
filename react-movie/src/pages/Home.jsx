import { useEffect } from "react";
import "../css/Home.css";
import { EmblaCarousel } from "../components/Carousel";
import { useSearchContext } from "../contexts/SearchContext";
import MediaCard from "../components/MediaCard";
import HeroBanner from "../components/HeroBanner";

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
    <div className="home">
      {error && <p className="error-message">{error}</p>}

      {!loading && filteredMovies.length > 0 && (
        <HeroBanner media={filteredMovies.find(m => m.backdrop_path) || filteredMovies[0]} />
      )}

      <div className="main-content px-10 pt-10">
      <p className="font-bold text-2xl pb-4 text-neutral-200">I film più visti</p>
      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <>
          <EmblaCarousel movies={filteredMovies} />
          <p className="font-bold text-2xl pb-4 pt-4 text-neutral-200">Le serie più viste</p>
          <EmblaCarousel movies={filteredSeries} />
        </>
        
      )}
      </div>
    </div>
  );
}

export default Home;