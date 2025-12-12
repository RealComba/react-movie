import { useParams } from "react-router-dom";
import "../css/MediaStreaming.css"
import { getMovieById, getSeriesById, getImages } from "../services/api";
import { useState, useEffect } from 'react'

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original"



function MediaStreaming () {
    const { mediaType, id } = useParams()
    const [mediaData, setMediaData] = useState(null);
    const [season, setSeason] = useState(1)
    const [imageData, setImageData] = useState()
    const [ep, setEp] = useState(1)

    const [showMore, setShowMore] = useState(false)

    useEffect(() => {

        async function fetchMedia() {
        try {
            let data;

            if (mediaType === "movie") {
                data = await getMovieById(id);
            } else {
                data = await getSeriesById(id);
            }

            setMediaData(data);
            const images = await getImages(id, mediaType)
            setImageData(images)
        } catch (err) {
            console.error("error")
        }
    }

        fetchMedia();
    }, [mediaType, id]);

    if (!mediaData) return <p>Loading...</p>;
    console.log(mediaData)


    const playerUrl = mediaData.name
        ? `https://godriveplayer.com/player.php?type=series&tmdb=${id}&season=${season}&episode=${ep}`
        : `https://godriveplayer.com/player.php?imdb=${id}`;

    return (
        <div className="flex flex-col"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('https://image.tmdb.org/t/p/original${mediaData.backdrop_path}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}>
            
            <div className="px-[4rem] pt-[2rem]">
               <div className="movieLogoContainer">
            {imageData?.logos?.[0]?.file_path && (
                        <img
                            alt={mediaData.title || mediaData.name}
                            src={`${IMAGE_BASE_URL}${imageData.logos[0].file_path}`}
                            className="movieLogo w-80"
                        />
                )}
                <div className="info flex flex-row gap-1" >
                    <p className="">{mediaData.release_date?.slice(0,4)}</p>
                    <p>- {mediaData.origin_country}</p>
                </div>
            </div>
            <div className="w-150 text-sm pt-8">
                <p className={showMore ? "media-overview expanded" : "media-overview clamped"}>
                    {mediaData.overview}
                </p>
                <button 
                  className="read-toggle-btn"
                  onClick={() => setShowMore(prev => !prev)}
                >
                  {showMore ? "Leggi di meno" : "Leggi di più"}
                </button>
            </div>

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
        </div>
    );
}

export default MediaStreaming;

