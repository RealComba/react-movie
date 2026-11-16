import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Carousel from "../components/Carousel";
import FilterSelect from "../components/FilterSelect";
import LoadState from "../components/LoadState";
import useResource from "../hooks/useResource";
import { getCatalog, MOVIE_GENRES, SERIES_GENRES } from "../services/api";
import "../css/MovieList.css";

const currentYear = new Date().getFullYear();
const years = [{ id: "all", name: "Tutti gli anni" }, ...Array.from({ length: currentYear - 1899 }, (_, index) => ({ id: String(currentYear - index), name: String(currentYear - index) }))];

export default function Catalog({ mediaType }) {
  const [params, setParams] = useSearchParams();
  const genres = mediaType === "movie" ? MOVIE_GENRES : SERIES_GENRES;
  const genre = genres.some(item => String(item.id) === params.get("genre")) ? params.get("genre") : "all";
  const year = years.some(item => item.id === params.get("year")) ? params.get("year") : "all";
  const requestedPage = Number(params.get("page"));
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 500) : 1;
  const load = useCallback(signal => getCatalog(mediaType, { genre, year, page }, signal), [mediaType, genre, year, page]);
  const { data, loading, error, retry } = useResource(load);
  const title = mediaType === "movie" ? "Film" : "Serie TV";

  function update(name, value) {
    const next = new URLSearchParams(params);
    if (value === "all" || value === "1") next.delete(name);
    else next.set(name, value);
    if (name !== "page") next.delete("page");
    setParams(next);
  }
  return <div className="page catalog-page">
    <div className="page-heading"><h1>{title}</h1>
      <div className="catalog-filters" aria-label={`Filtra ${title}`}>
        <FilterSelect label="Genere" value={genre} options={genres} focusId="filter-genre" primary onChange={value => update("genre", value)} />
        <FilterSelect label={mediaType === "movie" ? "Anno" : "Anno di debutto"} value={year} options={years} focusId="filter-year" onChange={value => update("year", value)} />
        {(genre !== "all" || year !== "all") && <button className="button reset-filters" data-tv-focus data-focus-id="reset-filters"
          onClick={() => { setParams({}); document.querySelector('[data-focus-id="filter-genre"]')?.focus(); }}>Azzera filtri</button>}
      </div>
    </div>
    <div aria-busy={loading}>
      <LoadState {...{ loading, error, retry }} empty={data?.results.length === 0} />
      {data && <Carousel key={`${mediaType}-${genre}-${year}-${page}`} movies={data.results}
        title={genre === "all" ? "Da scoprire" : genres.find(item => String(item.id) === genre).name} rowId={`catalog-${mediaType}`} />}
    </div>
    <div className="pagination" aria-label="Pagine del catalogo" data-focus-row>
      <button className="button" disabled={loading || page <= 1} data-tv-focus data-focus-id="previous-page" onClick={() => update("page", String(page - 1))}>← Precedente</button>
      <span role="status">Pagina {page}</span>
      <button className="button" disabled={loading || !data || page >= Math.min(data.total_pages, 500)} data-tv-focus data-focus-id="next-page" onClick={() => update("page", String(page + 1))}>Successiva →</button>
    </div>
  </div>;
}
