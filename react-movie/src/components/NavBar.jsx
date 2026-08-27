import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import "../css/Navbar.css";
import { useSearchContext } from "../contexts/SearchContext";
import { useMovieContext } from "../contexts/MovieContext";
import { search, MOVIE_GENRES, SERIES_GENRES } from "../services/api";

function NavBar() {
  const { searchName, triggerSearch } = useSearchContext();
  const { favorites, likes } = useMovieContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [localSearch, setLocalSearch] = useState(searchName || "");
  const [prevSearchName, setPrevSearchName] = useState(searchName);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  // Stati per i menu a tendina complessi della topbar
  const [genresMenuOpen, setGenresMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [liveResults, setLiveResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const genresDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Sincronizzazione dello stato durante il render
  if (searchName !== prevSearchName) {
    setPrevSearchName(searchName);
    setLocalSearch(searchName || "");
  }

  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setMobileMenuOpen(false);
    setGenresMenuOpen(false);
    setProfileMenuOpen(false);
    setSearchFocused(false);
  }

  // Ascolta click all'esterno per chiudere i dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (genresDropdownRef.current && !genresDropdownRef.current.contains(e.target)) {
        setGenresMenuOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Ascolta lo scroll per effetto Netflix trasparente -> frosted glass
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 35) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ricerca live immediata durante la digitazione
  useEffect(() => {
    if (!localSearch.trim() || localSearch.length < 2) {
      return;
    }

    let isSubscribed = true;
    const timer = setTimeout(async () => {
      try {
        const results = await search(localSearch);
        if (isSubscribed) {
          setLiveResults((results || []).slice(0, 5));
        }
      } catch (err) {
        console.error("Live search error:", err);
      }
    }, 250);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [localSearch]);

  const displayLiveResults = localSearch.trim().length >= 2 ? liveResults : [];

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchFocused(false);
    triggerSearch(localSearch);
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    setLiveResults([]);
    triggerSearch("");
  };

  const handleGenreSelect = (type, genreId) => {
    setGenresMenuOpen(false);
    if (type === "movie") {
      navigate(genreId === "all" ? "/film" : `/film?genre=${genreId}`);
    } else {
      navigate(genreId === "all" ? "/series" : `/series?genre=${genreId}`);
    }
  };

  const totalSavedCount = favorites.length + likes.length;

  return (
    <>
      {/* Top Announcement Bar come in Foto 2 */}
      <div className="top-announcement-bar">
        <span>
          📢 Unisciti al nostro canale Telegram per rimanere aggiornato:{" "}
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="announcement-link"
          >
            Clicca qui
          </a>
        </span>
      </div>

      <nav className={`navbar ${isScrolled ? "scrolled" : "transparent"}`}>
        <div className="navbar-container">
          {/* Brand / Logo ContHub (con stemma esagonale come in foto 1 & 2) */}
          <div className="navbar-brand">
            <Link to="/" className="brand-link">
              <span className="brand-logo-icon hexagon">C</span>
              <span className="brand-text">
                Cont<span className="brand-accent">Hub</span>
              </span>
            </Link>
          </div>

        {/* Desktop Navigation Links con Selettore Generi Evoluto */}
        <div className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Home
          </NavLink>

          <NavLink
            to="/film"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Film
          </NavLink>

          <NavLink
            to="/series"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Serie TV
          </NavLink>

          <NavLink
            to="/film"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Archivio
          </NavLink>

          {/* Mega Dropdown Generi */}
          <div className="nav-dropdown-wrapper" ref={genresDropdownRef}>
            <button
              type="button"
              className={`nav-dropdown-trigger ${genresMenuOpen ? "active" : ""}`}
              onClick={() => setGenresMenuOpen((prev) => !prev)}
              aria-expanded={genresMenuOpen}
            >
              Generi <span className="dropdown-caret">▾</span>
            </button>

            {genresMenuOpen && (
              <div className="genres-mega-dropdown">
                <div className="genres-dropdown-column">
                  <div className="genres-column-header">
                    <span className="genres-icon">🎬</span> Film per Genere
                  </div>
                  <div className="genres-grid-links">
                    {MOVIE_GENRES.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        className="genre-dropdown-item"
                        onClick={() => handleGenreSelect("movie", g.id)}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="genres-dropdown-divider" />

                <div className="genres-dropdown-column">
                  <div className="genres-column-header">
                    <span className="genres-icon">📺</span> Serie TV per Genere
                  </div>
                  <div className="genres-grid-links">
                    {SERIES_GENRES.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        className="genre-dropdown-item"
                        onClick={() => handleGenreSelect("series", g.id)}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <NavLink
            to="/favorites"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            La mia lista
            {totalSavedCount > 0 && (
              <span className="nav-badge">{totalSavedCount}</span>
            )}
          </NavLink>
        </div>

        {/* Right side: Live Search & Profile */}
        <div className="navbar-right">
          <div className="search-container" ref={searchContainerRef}>
            <form className="search-form" onSubmit={handleSearchSubmit}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Cerca film, serie..."
                value={localSearch}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setSearchFocused(true);
                }}
              />
              {localSearch && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={handleClearSearch}
                  title="Cancella ricerca"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Live Search Quick Preview Dropdown */}
            {searchFocused && displayLiveResults.length > 0 && (
              <div className="search-live-dropdown">
                <div className="search-live-header">Risultati Rapidi</div>
                {displayLiveResults.map((item) => {
                  const itemType = item.mediaType || (item.title ? "movie" : "tv");
                  const itemTitle = item.title || item.name;
                  const itemYear = (item.release_date || item.first_air_date || "").slice(0, 4);

                  return (
                    <div
                      key={`${itemType}-${item.id}`}
                      className="search-live-item"
                      onClick={() => {
                        setSearchFocused(false);
                        navigate(`/watch/${itemType}/${item.id}`);
                      }}
                    >
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                          alt={itemTitle}
                          className="search-live-poster"
                        />
                      ) : (
                        <div className="search-live-poster-placeholder">🎬</div>
                      )}
                      <div className="search-live-info">
                        <div className="search-live-title">{itemTitle}</div>
                        <div className="search-live-meta">
                          <span className={`live-badge ${itemType}`}>
                            {itemType === "movie" ? "Film" : "Serie"}
                          </span>
                          {itemYear && <span>{itemYear}</span>}
                          {item.vote_average ? (
                            <span className="live-score">
                              ★ {item.vote_average.toFixed(1)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div
                  className="search-live-footer"
                  onClick={handleSearchSubmit}
                >
                  Visualizza tutti i risultati per "{localSearch}" →
                </div>
              </div>
            )}
          </div>

          {/* Bottone Accedi / Profilo (Stile Foto 1) */}
          <div className="profile-dropdown-wrapper" ref={profileDropdownRef}>
            <button
              type="button"
              className="navbar-accedi-btn"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              aria-label="Profilo o Accedi"
            >
              Accedi
            </button>

            {profileMenuOpen && (
              <div className="profile-popover">
                <div className="profile-header">
                  <div className="profile-user-name">CineStreamer</div>
                  <div className="profile-user-status">Abbonamento Attivo • Tema Blu</div>
                </div>

                <div className="profile-stats">
                  <div className="stat-box">
                    <span className="stat-num">{favorites.length}</span>
                    <span className="stat-lbl">In Lista</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-num">{likes.length}</span>
                    <span className="stat-lbl">Mi Piace</span>
                  </div>
                </div>

                <div className="profile-links">
                  <Link
                    to="/favorites"
                    className="profile-link"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    ❤️ I Miei Preferiti & Like
                  </Link>
                  <Link
                    to="/film"
                    className="profile-link"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    🎬 Catalogo Film Wall
                  </Link>
                  <Link
                    to="/series"
                    className="profile-link"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    📺 Catalogo Serie TV
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            type="button"
            className={`navbar-burger-toggle ${mobileMenuOpen ? "open" : ""}`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Menu di navigazione"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="mobile-search-input"
              placeholder="Cerca film, serie..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <button type="submit" className="mobile-search-submit">Cerca</button>
          </form>

          <div className="mobile-links">
            <NavLink to="/" end className="mobile-nav-link">
              Home
            </NavLink>
            <NavLink to="/film" className="mobile-nav-link">
              Film (Wall)
            </NavLink>
            <NavLink to="/series" className="mobile-nav-link">
              Serie TV
            </NavLink>
            <NavLink to="/favorites" className="mobile-nav-link">
              La mia lista ({totalSavedCount})
            </NavLink>
          </div>

          <div className="mobile-genres-section">
            <div className="mobile-genres-title">Generi Rapidi Film:</div>
            <div className="mobile-genres-grid">
              {MOVIE_GENRES.slice(1, 7).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="mobile-genre-pill"
                  onClick={() => handleGenreSelect("movie", g.id)}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      </nav></>
  );
}

export default NavBar;