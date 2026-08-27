import { createContext, useState, useContext, useEffect } from "react";

const MovieContext = createContext();

export const useMovieContext = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
    // Inizializzazione lazy da localStorage per evitare cascate di render
    const [favorites, setFavorites] = useState(() => {
        try {
            const stored = localStorage.getItem("favorites");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [likes, setLikes] = useState(() => {
        try {
            const stored = localStorage.getItem("movie_likes");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Sincronizzazione persistente
    useEffect(() => {
        try {
            localStorage.setItem("favorites", JSON.stringify(favorites));
        } catch (e) {
            console.error("Errore nel salvataggio dei preferiti:", e);
        }
    }, [favorites]);

    useEffect(() => {
        try {
            localStorage.setItem("movie_likes", JSON.stringify(likes));
        } catch (e) {
            console.error("Errore nel salvataggio dei likes:", e);
        }
    }, [likes]);

    // Gestione Preferiti / La mia lista
    const addToFavorites = (movie) => {
        if (!movie?.id) return;
        setFavorites(prev => {
            if (prev.some(m => m.id === movie.id)) return prev;
            return [...prev, movie];
        });
    };

    const removeFromFavorites = (movieId) => {
        setFavorites(prev => prev.filter(movie => movie.id !== movieId));
    };

    const toggleFavorite = (movie) => {
        if (!movie?.id) return;
        setFavorites(prev => {
            const exists = prev.some(m => m.id === movie.id);
            if (exists) {
                return prev.filter(m => m.id !== movie.id);
            } else {
                return [...prev, movie];
            }
        });
    };

    const isFavorite = (movieId) => {
        return favorites.some(movie => movie.id === movieId);
    };

    // Gestione Likes / "Mi piace"
    const addLike = (movie) => {
        if (!movie?.id) return;
        setLikes(prev => {
            if (prev.some(m => m.id === movie.id)) return prev;
            return [...prev, movie];
        });
    };

    const removeLike = (movieId) => {
        setLikes(prev => prev.filter(movie => movie.id !== movieId));
    };

    const toggleLike = (movie) => {
        if (!movie?.id) return;
        setLikes(prev => {
            const exists = prev.some(m => m.id === movie.id);
            if (exists) {
                return prev.filter(m => m.id !== movie.id);
            } else {
                return [...prev, movie];
            }
        });
    };

    const isLiked = (movieId) => {
        return likes.some(movie => movie.id === movieId);
    };

    const value = {
        favorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
        likes,
        addLike,
        removeLike,
        toggleLike,
        isLiked,
    };

    return (
        <MovieContext.Provider value={value}>
            {children}
        </MovieContext.Provider>
    );
};

export default MovieContext;
