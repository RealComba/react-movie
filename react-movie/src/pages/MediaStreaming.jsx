import { useCallback } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getMediaById } from "../services/api";
import { useMovieContext } from "../contexts/MovieContext";
import useResource from "../hooks/useResource";
import FilterSelect from "../components/FilterSelect";
import LoadState from "../components/LoadState";
import "../css/MediaStreaming.css";

export default function MediaStreaming() {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const load = useCallback(signal => getMediaById(id, mediaType, signal), [id, mediaType]);
  const { data: media, loading, error, retry } = useResource(load);
  const { isFavorite, toggleFavorite } = useMovieContext();
  const [params, setParams] = useSearchParams();
  const season = params.get("season") || String(location.state?.season || "");
  const episode = params.get("episode") || String(location.state?.ep || 1);
  function selectEpisode(selectedSeason, selectedEpisode) {
    const next = new URLSearchParams(params);
    next.set("season", selectedSeason);
    next.set("episode", selectedEpisode);
    setParams(next, { replace: true });
  }
  const seasons = (media?.seasons || []).filter(item => item.season_number > 0 && item.episode_count > 0);
  const selectedSeason = seasons.find(item => String(item.season_number) === season) || seasons[0];
  const seasonNumber = selectedSeason?.season_number || 1;
  const episodes = Array.from({ length: selectedSeason?.episode_count || 0 }, (_, index) => ({ id: String(index + 1), name: `Episodio ${index + 1}` }));
  const selectedEpisode = episodes.some(item => item.id === episode) ? episode : "1";
  const isSeries = mediaType !== "movie";
  const title = media?.title || media?.name;
  const favorite = media && isFavorite(media.id);
  function back() {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(isSeries ? "/series" : "/film");
  }
  return <div className="detail-page" aria-busy={loading}>
    <LoadState {...{ loading, error, retry }} />
    {media && <>
      {media.backdrop_path && <div className="detail-backdrop" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w1280${media.backdrop_path})` }} />}
      <div className="page detail-content">
        <button className="button back-button" onClick={back} data-tv-focus data-focus-id="detail-back">← Indietro</button>
        <h1>{title}</h1>
        <p className="detail-meta">{(media.release_date || media.first_air_date || "").slice(0, 4)}
          {media.runtime ? ` · ${media.runtime} min` : ""}
          {media.genres?.length > 0 ? ` · ${media.genres.map(item => item.name).join(", ")}` : ""}
        </p>
        <p className="detail-overview">{media.overview || "Trama non disponibile."}</p>
        {isSeries && seasons.length > 0 && <div className="detail-selectors">
          <FilterSelect label="Stagione" value={String(seasonNumber)} options={seasons.map(item => ({ id: String(item.season_number), name: item.name || `Stagione ${item.season_number}` }))}
            focusId="season" onChange={value => selectEpisode(value, "1")} />
          <FilterSelect label="Episodio" value={selectedEpisode} options={episodes} focusId="episode" onChange={value => selectEpisode(String(seasonNumber), value)} />
        </div>}
        {isSeries && !seasons.length && <p role="status">Nessun episodio disponibile.</p>}
        <div className="detail-actions">
          <button className="button button-primary" disabled={isSeries && !seasons.length}
            data-tv-focus data-focus-id="play" data-page-focus
            onClick={() => navigate(`/watch/${media.mediaType}/${media.id}/stream`, { state: { season: seasonNumber, ep: Number(selectedEpisode) } })}>
            <span aria-hidden="true">▶</span> Riproduci
          </button>
          <button className="button" data-tv-focus data-focus-id="save" aria-pressed={Boolean(favorite)}
            onClick={() => toggleFavorite(media)}>{favorite ? "✓ Nella mia lista" : "+ La mia lista"}</button>
          <Link className="text-link" to="/favorites" data-tv-focus data-focus-id="saved-list">Titoli salvati</Link>
        </div>
      </div>
    </>}
  </div>;
}
