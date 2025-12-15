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
        ? `https://vixsrc.to/tv/${id}/${season}/${ep}?lang=it`
        : `https://vixsrc.to/movie/${id}?lang=it`;

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
            <div className="w-150 text-sm pt-8 flex flex-col items-start">
                <p className={showMore ? "media-overview expanded" : "media-overview clamped"}>
                    {mediaData.overview}
                </p>
                <button 
                  className="read-toggle-btn"
                  onClick={() => setShowMore(prev => !prev)}
                >
                  {showMore ? "Leggi di meno" : "Leggi di più"}
                </button>
                
                {/* Season selector - only for series */}
                {mediaData.name && mediaData.seasons && (
                  <div className="season-selector mt-4">
                    <p className="text-white font-semibold mb-2">Stagioni:</p>
                    <div className="flex gap-2 w-[80vw] flex-wrap">
                      {mediaData.seasons
                        .filter(s => s.season_number > 0) // skip specials (season 0)
                        .map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setSeason(s.season_number);
                              setEp(1); // reset episode when changing season
                            }}
                            className={`season-btn ${season === s.season_number ? 'active' : ''}`}
                          >
                            {s.season_number}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Episode selector - only for series */}
                {mediaData.name && mediaData.seasons && (
                  <div className="episode-selector mt-4">
                    <p className="text-white font-semibold mb-2">Episodi:</p>
                    <div className="flex gap-2 w-[80vw] flex-wrap">
                      {Array.from(
                        { length: mediaData.seasons.find(s => s.season_number === season)?.episode_count || 0 },
                        (_, i) => i + 1
                      ).map((episodeNum) => (
                        <button
                          key={episodeNum}
                          onClick={() => setEp(episodeNum)}
                          className={`season-btn episode-btn ${ep === episodeNum ? 'active bg-green-400' : ''}`}
                        >
                          {episodeNum}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>

                <div className="flex justify-center pt-20">
                    <iframe
                        src={playerUrl}
                        frameBorder="0"
                        // sandbox="allow-scripts allow-fullscreen allow-forms"
                        autoplay= "true"
                        className="w-200 h-100"
                        allow="fullscreen"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}

export default MediaStreaming;

