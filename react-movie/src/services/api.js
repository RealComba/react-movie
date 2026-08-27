const API_KEY = "6053a275d4f2511beb8daefa9f6a15e6"
const BASE_URL = "https://api.themoviedb.org/3"

export const getPopularMovies = async () => {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=it-IT`);
    const data = await response.json()
    return data.results
};

export const getPopularSeries = async () => {
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=it-IT`)
    const data = await response.json()
    return data.results
}

export const getNowPlayingMovies = async () => {
    const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=it-IT`)
    const data = await response.json()
    return data.results
}

export const getPopularHorrorMovies = async () => {
    const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27&sort_by=popularity.desc&language=it-IT`)
    const data = await response.json()
    return data.results
}

export const getTopRatedHorrorMovies = async () => {
    const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27&sort_by=vote_average.desc&vote_count.gte=100&language=it-IT`)
    const data = await response.json()
    return data.results
}



export const search = async (query) => {
    const response1 = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data1 = await response1.json()
    const response2 = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data2 = await response2.json()

    // Aggiungi mediaType a ogni risultato
    const moviesWithType = data1.results.map(m => ({ ...m, mediaType: 'movie' }))
    const seriesWithType = data2.results.map(s => ({ ...s, mediaType: 'tv' }))

    return [...moviesWithType, ...seriesWithType]
}


export async function getMovieById(id) {
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=it-IT`);
    return res.json();
}

export async function getSeriesById(id) {
    const res = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=it-IT`);
    return res.json();
}

// ...existing code...

export async function getImages(id, mediaType = 'movie') {
    const endpoint = mediaType === 'movie' ? 'movie' : 'tv'
    const res = await fetch(
        `${BASE_URL}/${endpoint}/${id}/images?api_key=${API_KEY}`
    )
    return res.json()
}

export async function getYoutube(id, mediaType = 'movie') {
    const endpoint = mediaType === 'movie' ? 'movie' : 'tv'
    const res = await fetch(`${BASE_URL}/${endpoint}/${id}/videos?api_key=${API_KEY}`)
    return res.json()
}

export const getPopularMoviesPaginated = async (page = 1) => {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=it-IT&page=${page}`);
    const data = await response.json();
    return data.results ? data.results.map(m => ({ ...m, mediaType: 'movie' })) : [];
};

export const getTopRatedMovies = async (page = 1) => {
    const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=it-IT&page=${page}`);
    const data = await response.json();
    return data.results ? data.results.map(m => ({ ...m, mediaType: 'movie' })) : [];
};

export const getTrendingMovies = async (timeWindow = 'week') => {
    const response = await fetch(`${BASE_URL}/trending/movie/${timeWindow}?api_key=${API_KEY}&language=it-IT`);
    const data = await response.json();
    return data.results ? data.results.map(m => ({ ...m, mediaType: 'movie' })) : [];
};

export const getMoviesByGenre = async (genreId, page = 1, sortBy = 'popularity.desc') => {
    const genreParam = genreId && genreId !== 'all' ? `&with_genres=${genreId}` : '';
    const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=it-IT&sort_by=${sortBy}&page=${page}${genreParam}`);
    const data = await response.json();
    return data.results ? data.results.map(m => ({ ...m, mediaType: 'movie' })) : [];
};

export const getPopularSeriesPaginated = async (page = 1) => {
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=it-IT&page=${page}`);
    const data = await response.json();
    return data.results ? data.results.map(s => ({ ...s, mediaType: 'tv' })) : [];
};

export const getTopRatedSeries = async (page = 1) => {
    const response = await fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=it-IT&page=${page}`);
    const data = await response.json();
    return data.results ? data.results.map(s => ({ ...s, mediaType: 'tv' })) : [];
};

export const getSeriesByGenre = async (genreId, page = 1) => {
    const genreParam = genreId && genreId !== 'all' ? `&with_genres=${genreId}` : '';
    const response = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=it-IT&sort_by=popularity.desc&page=${page}${genreParam}`);
    const data = await response.json();
    return data.results ? data.results.map(s => ({ ...s, mediaType: 'tv' })) : [];
};

export const getCredits = async (id, mediaType = 'movie') => {
    const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
    const res = await fetch(`${BASE_URL}/${endpoint}/${id}/credits?api_key=${API_KEY}&language=it-IT`);
    return res.json();
};

export const getSimilar = async (id, mediaType = 'movie') => {
    const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
    const res = await fetch(`${BASE_URL}/${endpoint}/${id}/similar?api_key=${API_KEY}&language=it-IT`);
    const data = await res.json();
    return data.results ? data.results.map(item => ({ ...item, mediaType })) : [];
};

export const MOVIE_GENRES = [
    { id: 'all', name: 'Tutti' },
    { id: 28, name: 'Azione' },
    { id: 35, name: 'Commedia' },
    { id: 27, name: 'Horror' },
    { id: 878, name: 'Fantascienza' },
    { id: 53, name: 'Thriller' },
    { id: 16, name: 'Animazione' },
    { id: 18, name: 'Dramma' },
    { id: 12, name: 'Avventura' },
    { id: 10749, name: 'Romantico' }
];

export const SERIES_GENRES = [
    { id: 'all', name: 'Tutte' },
    { id: 18, name: 'Dramma' },
    { id: 35, name: 'Commedia' },
    { id: 10765, name: 'Sci-Fi & Fantasy' },
    { id: 80, name: 'Crime' },
    { id: 10759, name: 'Action & Adventure' },
    { id: 9648, name: 'Mistero' },
    { id: 16, name: 'Animazione' }
];