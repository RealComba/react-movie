import "../css/MovieCard.css"
import { useMovieContext } from "../contexts/MovieContext"

function MovieCard({movie}) {

    const {isFavorite, addToFavorites, removeFromFavorites} = useMovieContext()
    const favorite = isFavorite(movie.id)

    function onFavoriteClick(e) {
        e.preventDefault()
        if (favorite) removeFromFavorites(movie.id)
            else addToFavorites(movie)

    }
    
    return (
        <div className="movie-card">
            <div className="movie-poster">
                <img src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`} alt={movie.title} />
                <div className="movie-overlay">
                    <div className="overlay-content">
                        <h3 className="font-bold">{movie.title}</h3>
                        <div className="movie-actions">
                            <button className="btn play" title="Play">▶</button>
                            <button className={`btn favorite-btn ${favorite ? "active" : ""}`} onClick={onFavoriteClick}>
                                ♥︎
                            </button>
                            <button className="btn details" title="Details">ℹ</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 

export default MovieCard