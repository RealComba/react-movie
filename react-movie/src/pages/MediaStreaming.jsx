import { useParams } from "react-router-dom";
import "../css/MediaStreaming.css"
import { getMovieById, getSeriesById } from "../services/api";
import { useState, useEffect } from 'react'

function MediaStreaming () {
    const { mediaType, id } = useParams()
    const [mediaData, setMediaData] = useState(null);
    const [season, setSeason] = useState(1)
    const [ep, setEp] = useState(1)

    useEffect(() => {
        async function fetchMedia() {
            let data;

            if (mediaType === "movie") {
                data = await getMovieById(id);
            } else {
                data = await getSeriesById(id);
            }

            setMediaData(data);
        }

        fetchMedia();
    }, [mediaType, id]);

    if (!mediaData) return <p>Loading...</p>;

    const playerUrl = mediaData.name
        ? `https://godriveplayer.com/player.php?type=series&tmdb=${id}&season=${season}&episode=${ep}`
        : `https://godriveplayer.com/player.php?imdb=${id}`;

    return (
        <div className="flex flex-col px-[4rem] pt-[2rem]">
            <p className="text-2xl font-bold">{mediaData.title || mediaData.name}</p>
            <p className="text-lg mt-3">{mediaData.overview}</p>

            <div className="flex justify-center pt-20">
                <iframe
                    src={playerUrl}
                    frameBorder="0"
                    sandbox="allow-scripts allow-same-origin allow-fullscreen allow-forms"
                    className="w-200 h-100"
                    allow="fullscreen"
                ></iframe>
            </div>
        </div>
    );
}

export default MediaStreaming;
