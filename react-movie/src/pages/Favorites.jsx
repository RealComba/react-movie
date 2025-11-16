import "../css/Favorites.css"
import { useMovieContext } from "../contexts/MovieContext"
import MovieCard from "../components/MovieCard"


function Favorites() {
    const {favorites} = useMovieContext();
    if (favorites.length > 0) {
        return (
        <div>
            <h2 className="favorites">Favorites</h2>
            <div className="movies-grid">
                {favorites.map(movie => 
                <MovieCard movie={movie} key={movie.id} ></MovieCard>
                )}
            </div>
        </div>
        )
    }
    return (
        <div>
            <div className="favorites-empty">
                <h2>No favotite movies yet</h2>
                <p>Start adding movies to your favorites list</p>
            </div>
        </div>
    )
}


export default Favorites