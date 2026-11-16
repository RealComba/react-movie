import { Link } from "react-router-dom";
import { useMovieContext } from "../contexts/MovieContext";
import Carousel from "../components/Carousel";
import "../css/Home.css";

export default function Favorites() {
  const { favorites, likes } = useMovieContext();
  const saved = [...new Map([...favorites, ...likes].map(item => [
    `${item.mediaType || (item.title ? "movie" : "tv")}-${item.id}`, item,
  ])).values()];
  return <div className="page">
    <div className="page-heading"><h1>Titoli salvati</h1>
      <Link to="/film" className="button" data-tv-focus data-focus-id="saved-catalog" data-page-focus>Esplora i film</Link>
    </div>
    {saved.length ? <Carousel movies={saved} title="La mia lista" rowId="saved" /> :
      <p className="status">Non hai ancora salvato titoli. Puoi aggiungerli dalla pagina di dettaglio.</p>}
  </div>;
}
