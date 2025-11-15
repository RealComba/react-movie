import { useState } from "react";
import MovieCard from "../MovieCard"

function Home() {
    const [searchName, setSearchName] = useState("")

 const movies = [

    {
        id: 1,
        title: "Batman",
        release_date: "2020"
    },

    {
        id: 2,
        title: "Tim",
        release_date: "2015"
    },

    {
        id: 3,
        title: "Heroes",
        release_date: "2011"
    },

    {
        id: 4,
        title: "Goku",
        release_date: "2025"
    },
 ];

 const handleSearch = (e) => {
    e.preventDefault()
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
            <div className="movies-grid">
                {movies.map(movie => 
                 movie.title.toLowerCase().startsWith(searchName) && (
                 <MovieCard movie={movie} key={movie.id} ></MovieCard>
                ))}
            </div>
        </div>
    )
}

export default Home;