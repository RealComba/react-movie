import { createContext, useState, useContext } from "react"
import { searchMovies, getPopularMovies, searchSeries, getPopularSeries } from "../services/api"

const SearchContext = createContext()

export const useSearchContext = () => useContext(SearchContext)

export const SearchProvider = ({ children }) => {
    const [searchName, setSearchName] = useState("")
    const [movies, setMovies] = useState([])
    const [series, setSeries] = useState([])
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true)
    const [isSearchingSeries, setIsSearchingSeries] = useState(false)

    //carico film popolari
    const loadPopularMovies = async () => {
        try {
        setLoading(true)
        const popularMovies = await getPopularMovies()
        setMovies(popularMovies)
        setError(null)
        } catch (err) {
        console.log(err)
        setError("Failed to load movies...")
        } finally {
        setLoading(false)
        }
    }

    const loadPopularSeries = async () => { 
       try {
        setLoading(true)
        const popularSeries = await getPopularSeries()
        setSeries(popularSeries)
        setError(null)
        } catch (err) {
        console.log(err)
        setError("Failed to load movies...")
        } finally {
        setLoading(false)
        }
    }

//ricerca film
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchName.trim()) {
      await loadPopularMovies()
      return
    }
    if (loading) return

    setLoading(true)
    try {
      if (isSearchingSeries) {
        const searchResults = await searchSeries(searchName)
        setSeries(searchResults)
        setMovies([])
      } else {
        const searchResults = await searchMovies(searchName)
        setMovies(searchResults)
        setSeries([])
      }
      setError(null)

    } catch (err) {
      console.log(err)
      setError("Failed to search movies...")
    } finally {
      setLoading(false)
    }
  }

  const value = {
    searchName,
    setSearchName,
    movies,
    series,
    error,
    loading,
    handleSearch,
    loadPopularMovies,
    isSearchingSeries,
    setIsSearchingSeries,
    loadPopularSeries
  }
  return <SearchContext.Provider value={value}>
    {children}
  </SearchContext.Provider>
}