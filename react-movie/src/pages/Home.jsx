import { useState, useEffect } from "react";
import "../css/Home.css"
import { EmblaCarousel } from "../components/Carousel";
import { useSearchContext } from "../contexts/SearchContext";


function Home() {

    const { searchName, movies, error, loading, loadPopularMovies } = useSearchContext()

    useEffect(() => {
        loadPopularMovies()
    }, [])

    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().startsWith(searchName.toLowerCase())
    )
        return (
            <div className="home px-[4rem] pt-[2rem]">
                {error && <p className="error-message">{error}</p>}

                <p className="font-bold text-2xl pb-4 text-neutral-200">I film più visti</p>
                
                {loading ? (<p className="loading">Loading...</p>) : (
                    <EmblaCarousel movies={filteredMovies} />
                    )}
                </div>
           
                )
            }

export default Home;