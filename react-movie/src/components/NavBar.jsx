import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../css/Navbar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";
  function search(event) {
    event.preventDefault();
    const q = new FormData(event.currentTarget).get("q").trim();
    navigate(q ? `/?${new URLSearchParams({ q })}` : "/");
  }
  return <header className="navbar">
    <span className="brand-text">Cont<span>Hub</span></span>
    <nav className="navbar-links" aria-label="Navigazione principale" data-focus-row>
      <NavLink to="/" end className="nav-link" data-tv-focus data-focus-id="nav-home">Home</NavLink>
      <NavLink to="/film" className="nav-link" data-tv-focus data-focus-id="nav-film">Film</NavLink>
      <NavLink to="/series" className="nav-link" data-tv-focus data-focus-id="nav-series">Serie TV</NavLink>
    </nav>
    <form className="search-form" role="search" onSubmit={search} data-focus-row>
      <input key={query} type="search" name="q" defaultValue={query}
        placeholder="Cerca un titolo" aria-label="Cerca film e serie TV"
        autoComplete="off" data-tv-focus data-focus-id="search" />
      <button type="submit" data-tv-focus data-focus-id="search-submit">Cerca</button>
    </form>
  </header>;
}
