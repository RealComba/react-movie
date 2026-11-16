import { useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import FilterSelect from "../components/FilterSelect";
import "../css/MediaStreaming.css";

const servers = [
  { id: "vixsrc", name: "Server 1 · IT" },
  { id: "vidsrc_to", name: "Server 2" },
  { id: "vidsrc_cc", name: "Server 3" },
  { id: "multiembed", name: "Server 4" },
];

export default function StreamingPage() {
  const { mediaType, id } = useParams();
  const location = useLocation();
  const { season = 1, ep = 1 } = location.state || {};
  const [server, setServer] = useState("vixsrc");
  const frame = useRef(null);
  const movie = mediaType === "movie";
  const urls = {
    vixsrc: movie ? `https://vixsrc.to/movie/${id}?lang=it` : `https://vixsrc.to/tv/${id}/${season}/${ep}?lang=it`,
    vidsrc_to: movie ? `https://vidsrc.to/embed/movie/${id}` : `https://vidsrc.to/embed/tv/${id}/${season}/${ep}`,
    vidsrc_cc: movie ? `https://vidsrc.cc/v2/embed/movie/${id}` : `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${ep}`,
    multiembed: movie ? `https://multiembed.mov/?video_id=${id}&tmdb=1` : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${ep}`,
  };
  return <div className="player-page">
    <div className="player-toolbar">
      <Link className="button" to={`/watch/${mediaType}/${id}`} state={{ season, ep }} replace
        data-tv-focus data-focus-id="exit-player">← Esci</Link>
      {!movie && <span className="player-episode">S{season} · E{ep}</span>}
      <FilterSelect label="Sorgente" value={server} options={servers} focusId="server" onChange={setServer} />
      <button className="button button-primary" data-tv-focus data-focus-id="enter-player" data-page-focus
        onClick={() => frame.current?.focus()}>Controlla il video</button>
      <a className="text-link" href={urls[server]} target="_blank" rel="noopener noreferrer"
        data-tv-focus data-focus-id="external-player">Apri player ↗</a>
    </div>
    <iframe ref={frame} className="player-frame" title="Player video" key={`${server}-${id}-${season}-${ep}`}
      src={urls[server]} referrerPolicy="no-referrer" tabIndex={0} data-tv-focus data-focus-id="player-frame"
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen />
  </div>;
}
