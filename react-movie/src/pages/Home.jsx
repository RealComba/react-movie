import { useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Carousel from "../components/Carousel";
import HeroBanner from "../components/HeroBanner";
import LoadState from "../components/LoadState";
import useResource from "../hooks/useResource";
import { getHomeContent } from "../services/api";
import "../css/Home.css";

export default function Home() {
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();
  const load = useCallback(signal => getHomeContent(query, signal), [query]);
  const { data, loading, error, retry } = useResource(load);
  const empty = data && !data.movies.length && !data.series.length;
  return <div className="home" aria-busy={loading}>
    {!query && data?.movies.length > 0 && <HeroBanner media={data.movies.find(movie => movie.backdrop_path) || data.movies[0]} />}
    <div className="page home-content">
      {query && <div className="page-heading"><h1>Risultati per “{query}”</h1>
        <Link className="button" to="/" data-tv-focus data-focus-id="clear-search" data-page-focus>Cancella ricerca</Link>
      </div>}
      <LoadState {...{ loading, error, retry, empty }} />
      {data && <>
        <Carousel movies={data.movies} title={query ? "Film" : "Film del momento"} rowId="home-movies" />
        <Carousel movies={data.series} title={query ? "Serie TV" : "Serie TV del momento"} rowId="home-series" />
      </>}
    </div>
  </div>;
}
