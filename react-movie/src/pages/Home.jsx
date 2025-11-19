import { useState, useEffect } from "react";
import "../css/Home.css"
import { EmblaCarousel } from "../components/Carousel";
import { searchMovies, getPopularMovies } from "../services/api";



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
    
    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().startsWith(searchName.toLowerCase())
    )
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

                <p className="font-bold text-2xl">I film più visti</p>
                

                {loading ? (<p className="loading">Loading...</p>) : (
                    <EmblaCarousel movies={filteredMovies} />
                    )}
                </div>
           
                )
            }

export default Home;