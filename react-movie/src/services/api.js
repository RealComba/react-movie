const API_KEY = "6053a275d4f2511beb8daefa9f6a15e6"
const BASE_URL = "https://api.themoviedb.org/3";

async function request(path, params = {}, signal) {
  const query = new URLSearchParams({ api_key: API_KEY, language: "it-IT", ...params });
  const response = await fetch(`${BASE_URL}/${path}?${query}`, { signal });
  if (!response.ok) throw new Error(`TMDB: ${response.status}`);
  const data = await response.json();
  if (data.success === false) throw new Error("TMDB request failed");
  return data;
}

function typedResults(data, mediaType) {
  return (data.results || []).map(media => ({ ...media, mediaType }));
}

export async function getHomeContent(query, signal) {
  const types = ["movie", "tv"];
  const pages = await Promise.all(types.map(type => request(
    query ? `search/${type}` : `${type}/popular`,
    query ? { query, include_adult: "false" } : {}, signal,
  )));
  return { movies: typedResults(pages[0], "movie"), series: typedResults(pages[1], "tv") };
}

export async function getCatalog(mediaType, { genre = "all", year = "all", page = 1 } = {}, signal) {
  const params = { sort_by: "popularity.desc", include_adult: "false", page: String(page) };
  if (genre !== "all") params.with_genres = genre;
  if (year !== "all") params[mediaType === "movie" ? "primary_release_year" : "first_air_date_year"] = year;
  const data = await request(`discover/${mediaType}`, params, signal);
  return { ...data, results: typedResults(data, mediaType) };
}

export async function getMediaById(id, mediaType, signal) {
  const type = mediaType === "movie" ? "movie" : "tv";
  const media = await request(`${type}/${id}`, {}, signal);
  return { ...media, mediaType: type };
}

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