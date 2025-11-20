import { useParams } from "react-router-dom";
import "../css/MediaStreaming.css"
import { getMovieById, getSeriesById } from "../services/api";
import { useState, useEffect } from 'react'

function MediaStreaming () {
    const { mediaType, id } = useParams();
    const [mediaData, setMediaData] = useState();

    useEffect(() => {
        async function fetchMedia() {
            let data;

            if (mediaType === "movie") {
                data = await getMovieById(id)
            } else {
                data = await getSeriesById(id)
            }

            setMediaData(data);
        }

        fetchMedia();
    }, [mediaType, id])

    if (!mediaData) {
    return <p>Loading...</p>;
}


    return (
        <div className="flex flex-col px-[4rem] pt-[2rem]">
            <p className="text-2xl font-bold">{mediaData.title || mediaData.name}</p>
            <p className="text-lg mt-3">
                {mediaData.overview}
            </p>
            <div className="flex justify-center pt-20">
             <iframe
            src={`https://vidlink.pro/movie/${id}`}
            frameborder="0"
            allowfullscreen
            className="w-200 h-100"
            ></iframe>
            </div>
        </div>
    )
}

export default MediaStreaming