import { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard"
import { searchMovies, getPopularMovies } from "../services/api";
import "../css/Home.css"


function Home() {
    const [searchName, setSearchName] = useState("")

    const [movies , setMovies] = useState([])
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadPopularMovies = async () => {
            try {
                const popularMovies = await getPopularMovies()
                setMovies(popularMovies)
            } catch (err) {
                console.log(err)
                setError("Failed to load movies...")
            }
            finally {
                setLoading(false)
            }
        }
        loadPopularMovies()
    }, [])

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchName.trim()) return
        if (loading) return

        setLoading(true)
        try {
            const searchResults = await searchMovies(searchName)
            setMovies(searchResults)
            setError(null)
        } catch (err) {
            setError("Failed to search movies...")
        } finally {
            setLoading(false)
        }

    }

        return (
            <div className="home">
                <form onSubmit={handleSearch} className="search-form">
                    <input 
                    type="text" 
                    placeholder="Search for movies" 
                    className="search-input"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)} 
                    />
                    <button type="submit" className="search-button">Search</button>
                </form>

                {error && <p className="error-message">{error}</p>}

                {loading ? (<p className="loading">Loading...</p>) : (
                <div className="movies-grid">
                    {movies.map(movie => 
                    movie.title.toLowerCase().startsWith(searchName) && (
                    <MovieCard movie={movie} key={movie.id} ></MovieCard>
                    ))}
                </div>
                )}
            </div>
    )
}

export default Home;