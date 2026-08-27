import { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";

const SERVERS = [
  { id: "vixsrc", name: "Server 1 (VixSrc IT)" },
  { id: "vidsrc_to", name: "Server 2 (VidSrc)" },
  { id: "vidsrc_cc", name: "Server 3 (VidSrc CC)" },
  { id: "multiembed", name: "Server 4 (MultiEmbed)" },
];

function StreamingPage() {
  const { mediaType, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { season = 1, ep = 1 } = location.state || {};

  const [currentServer, setCurrentServer] = useState("vixsrc");
  const [showServerNotice, setShowServerNotice] = useState(true);

  // Calcolo URL in base al server selezionato
  const getPlayerUrl = (serverId) => {
    const isMovie = mediaType === "movie";

    switch (serverId) {
      case "vixsrc":
        return isMovie
          ? `https://vixsrc.to/movie/${id}?lang=it`
          : `https://vixsrc.to/tv/${id}/${season}/${ep}?lang=it`;

      case "vidsrc_to":
        return isMovie
          ? `https://vidsrc.to/embed/movie/${id}`
          : `https://vidsrc.to/embed/tv/${id}/${season}/${ep}`;

      case "vidsrc_cc":
        return isMovie
          ? `https://vidsrc.cc/v2/embed/movie/${id}`
          : `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${ep}`;

      case "multiembed":
        return isMovie
          ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
          : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${ep}`;

      default:
        return `https://vixsrc.to/movie/${id}?lang=it`;
    }
  };

  const playerUrl = getPlayerUrl(currentServer);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#000", overflow: "hidden" }}>
      {/* Top Bar Controls Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "linear-gradient(180deg, rgba(10, 12, 18, 0.95) 0%, rgba(10, 12, 18, 0.6) 70%, transparent 100%)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        {/* Sinistra: Torna Indietro */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              borderRadius: "20px",
              padding: "6px 16px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backdropFilter: "blur(8px)",
              transition: "all 0.2s ease",
            }}
          >
            ← Esci dal Player
          </button>

          {mediaType === "tv" && (
            <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600" }}>
              Stagione {season} • Episodio {ep}
            </span>
          )}
        </div>

        {/* Centro: Selettore Server */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ color: "#cbd5e1", fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase" }}>
            Server:
          </span>
          {SERVERS.map((server) => (
            <button
              key={server.id}
              type="button"
              onClick={() => setCurrentServer(server.id)}
              style={{
                background: currentServer === server.id ? "#38bdf8" : "rgba(255, 255, 255, 0.1)",
                color: currentServer === server.id ? "#0b0d14" : "#cbd5e1",
                border: currentServer === server.id ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "14px",
                padding: "4px 12px",
                fontSize: "0.8rem",
                fontWeight: currentServer === server.id ? "700" : "500",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {server.name}
            </button>
          ))}
        </div>

        {/* Destra: Apri Esterno */}
        <a
          href={playerUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "rgba(56, 189, 248, 0.15)",
            color: "#38bdf8",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            borderRadius: "20px",
            padding: "6px 14px",
            fontSize: "0.85rem",
            fontWeight: "600",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease",
          }}
          title="Se l'iframe viene bloccato dal browser o dalla protezione Cloudflare in produzione, aprilo direttamente"
        >
          Apri in nuova scheda ↗
        </a>
      </div>

      {/* Floating Notice se in produzione l'iframe riscontra blocchi */}
      {showServerNotice && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 90,
            background: "rgba(18, 21, 29, 0.9)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: "8px",
            padding: "8px 16px",
            color: "#cbd5e1",
            fontSize: "0.8rem",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
            backdropFilter: "blur(10px)",
          }}
        >
          <span>💡 Se il video non parte o compare un blocco, cambia server in alto o clicca su "Apri in nuova scheda".</span>
          <button
            type="button"
            onClick={() => setShowServerNotice(false)}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "0.9rem",
              padding: "0 4px",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Iframe con referrerPolicy no-referrer e permessi completi */}
      <iframe
        title="Streaming Video Player"
        key={`${currentServer}-${id}-${season}-${ep}`}
        src={playerUrl}
        referrerPolicy="no-referrer"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
          backgroundColor: "#000",
        }}
      />
    </div>
  );
}

export default StreamingPage;