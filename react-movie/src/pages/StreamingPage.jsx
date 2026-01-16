import { useLocation, useParams } from "react-router-dom";

function StreamingPage() {
    const { mediaType, id } = useParams();
    const location = useLocation();
    const { season = 1, ep = 1 } = location.state || {};

    const playerUrl = mediaType === "movie"
        // ? `https://vixsrc.to/movie/${id}?lang=it`
        // : `https://vixsrc.to/tv/${id}/${season}/${ep}?lang=it`;

    return (
        <div style={{ position: "relative", width: "100%", height: "100vh", background: "#000" }}>
            <iframe
                title="Player"
                src={playerUrl}
                allow="autoplay; fullscreen"
                className="absolute inset-0 w-full h-full"
                allowFullScreen
            ></iframe>
        </div>
    );
}

export default StreamingPage;