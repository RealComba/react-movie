import { createContext, useState, useContext, useCallback, useMemo } from "react";
import { getPopularMovies, getPopularSeries, search } from "../services/api";

const SearchContext = createContext();

export const useSearchContext = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [searchName, setSearchName] = useState("");
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSearchingSeries, setIsSearchingSeries] = useState(false);

  // Caricamento simultaneo iniziale per evitare conflitti di loading
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [moviesRes, seriesRes] = await Promise.allSettled([
        getPopularMovies(),
        getPopularSeries()
      ]);

      if (moviesRes.status === "fulfilled") setMovies(moviesRes.value || []);
      if (seriesRes.status === "fulfilled") setSeries(seriesRes.value || []);
      setError(null);
    } catch (err) {
      console.error("Errore nel caricamento iniziale:", err);
      setError("Impossibile caricare i contenuti in evidenza.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPopularMovies = useCallback(async () => {
    try {
      setLoading(true);
      const popularMovies = await getPopularMovies();
      setMovies(popularMovies || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossibile caricare i film.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPopularSeries = useCallback(async () => {
    try {
      setLoading(true);
      const popularSeries = await getPopularSeries();
      setSeries(popularSeries || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossibile caricare le serie TV.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Ricerca globale
  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!searchName.trim()) {
      await loadInitialData();
      return;
    }

    setLoading(true);
    try {
      const results = await search(searchName);
      const m = results.filter((r) => r.mediaType === "movie");
      const s = results.filter((r) => r.mediaType === "tv");

      setMovies(m);
      setSeries(s);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Ricerca fallita. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  }, [searchName, loadInitialData]);

  const triggerSearch = useCallback(async (query) => {
    setSearchName(query);
    if (!query.trim()) {
      await loadInitialData();
      return;
    }

    setLoading(true);
    try {
      const results = await search(query);
      const m = results.filter((r) => r.mediaType === "movie");
      const s = results.filter((r) => r.mediaType === "tv");
      setMovies(m);
      setSeries(s);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Ricerca fallita");
    } finally {
      setLoading(false);
    }
  }, [loadInitialData]);

  const value = useMemo(() => ({
    searchName,
    setSearchName,
    movies,
    series,
    error,
    loading,
    handleSearch,
    loadPopularMovies,
    loadPopularSeries,
    loadInitialData,
    isSearchingSeries,
    setIsSearchingSeries,
    triggerSearch
  }), [
    searchName,
    movies,
    series,
    error,
    loading,
    handleSearch,
    loadPopularMovies,
    loadPopularSeries,
    loadInitialData,
    isSearchingSeries,
    triggerSearch
  ]);

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;