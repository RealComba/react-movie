import { useEffect, useState } from "react";
import "../css/Home.css";
import { EmblaCarousel } from "../components/Carousel";
import { useSearchContext } from "../contexts/SearchContext";
import HeroBanner from "../components/HeroBanner";
import QuickDetailModal from "../components/QuickDetailModal";
import {
  getPopularHorrorMovies,
  getTopRatedMovies,
  getMoviesByGenre
} from "../services/api";

function HomeSkeleton() {
  return (
    <div>
      <div className="skeleton skeleton-hero">
        <div className="skeleton-hero-content">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-desc" />
          <div className="skeleton skeleton-desc short" />
          <div className="skeleton-actions">
            <div className="skeleton skeleton-btn" />
            <div className="skeleton skeleton-btn" />
          </div>
        </div>
      </div>

      <div className="home-content">
        {[1, 2, 3].map((section) => (
          <div key={section} className="skeleton-section">
            <div className="skeleton skeleton-section-title" />
            <div className="skeleton-cards-row">
              {[1, 2, 3, 4, 5, 6].map((card) => (
                <div key={card} className="skeleton skeleton-card" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Home() {
  const {
    searchName,
    movies,
    series,
    error,
    loading,
    loadInitialData
  } = useSearchContext();

  const [popularHorror, setPopularHorror] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [scifiMovies, setScifiMovies] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Caricamento iniziale e categorie una tantum
  useEffect(() => {
    let isSubscribed = true;

    // Carica film e serie se non già presenti
    if (movies.length === 0 && !searchName) {
      loadInitialData();
    }

    const fetchCategories = async () => {
      try {
        const [horror, topRated, action, scifi] = await Promise.all([
          getPopularHorrorMovies(),
          getTopRatedMovies(1),
          getMoviesByGenre(28, 1),
          getMoviesByGenre(878, 1)
        ]);

        if (isSubscribed) {
          setPopularHorror(horror || []);
          setTopRatedMovies(topRated || []);
          setActionMovies(action || []);
          setScifiMovies(scifi || []);
        }
      } catch (e) {
        console.error("Errore nel recupero delle categorie Home:", e);
      }
    };

    fetchCategories();

    return () => {
      isSubscribed = false;
    };
  }, [loadInitialData, movies.length, searchName]);

  const filteredMovies = Array.isArray(movies)
    ? movies.filter((m) => (m.title || "").toLowerCase().includes(searchName.toLowerCase()))
    : [];

  const filteredSeries = Array.isArray(series)
    ? series.filter((s) => (s.name || "").toLowerCase().includes(searchName.toLowerCase()))
    : [];

  // Media eroe in evidenza
  const heroMedia = filteredMovies.find((m) => m.backdrop_path) || filteredMovies[0];

  // Se siamo ancora in caricamento iniziale senza dati, mostra lo skeleton shimmer di Netflix
  if (loading && movies.length === 0 && !searchName) {
    return <HomeSkeleton />;
  }

  return (
    <div className="home">
      {error && <p className="error-message">{error}</p>}

      {!searchName && heroMedia && (
        <HeroBanner media={heroMedia} onOpenDetails={setSelectedMedia} />
      )}

      <div className="home-content">
        {searchName ? (
          <>
            <p className="section-title">Risultati ricerca Film</p>
            {filteredMovies.length > 0 ? (
              <EmblaCarousel movies={filteredMovies} onOpenDetails={setSelectedMedia} />
            ) : (
              <p className="loading">Nessun film trovato per "{searchName}"</p>
            )}

            <p className="section-title">Risultati ricerca Serie TV</p>
            {filteredSeries.length > 0 ? (
              <EmblaCarousel movies={filteredSeries} onOpenDetails={setSelectedMedia} />
            ) : (
              <p className="loading">Nessuna serie trovata per "{searchName}"</p>
            )}
          </>
        ) : (
          <>
            <p className="section-title">I Film più visti del momento</p>
            <EmblaCarousel movies={filteredMovies} onOpenDetails={setSelectedMedia} />

            <p className="section-title">I Grandi Successi (Top Rated)</p>
            <EmblaCarousel movies={topRatedMovies} onOpenDetails={setSelectedMedia} />

            <p className="section-title">Le Serie TV del momento</p>
            <EmblaCarousel movies={filteredSeries} onOpenDetails={setSelectedMedia} />

            <p className="section-title">Adrenalina & Azione</p>
            <EmblaCarousel movies={actionMovies} onOpenDetails={setSelectedMedia} />

            <p className="section-title">Brividi Horror</p>
            <EmblaCarousel movies={popularHorror} onOpenDetails={setSelectedMedia} />

            <p className="section-title">Fantascienza & Avventura</p>
            <EmblaCarousel movies={scifiMovies} onOpenDetails={setSelectedMedia} />
          </>
        )}
      </div>

      {/* Quick Details Modal */}
      {selectedMedia && (
        <QuickDetailModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onSelectMedia={setSelectedMedia}
        />
      )}
    </div>
  );
}

export default Home;