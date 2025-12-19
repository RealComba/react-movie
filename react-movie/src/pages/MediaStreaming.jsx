import { useParams } from "react-router-dom";
import "../css/MediaStreaming.css";
import { getMovieById, getSeriesById, getImages, getYoutube, getNowPlayingMovies } from "../services/api";
import { useState, useEffect } from "react";
import { EmblaCarousel } from "../components/Carousel";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original"



function MediaStreaming () {
    const { mediaType, id } = useParams()
    const [mediaData, setMediaData] = useState(null);
    const [season, setSeason] = useState(1)
    const [imageData, setImageData] = useState();
    const [youtubeData, setYoutubeData] = useState();
    const [nowPlaying, setNowPlaying] = useState();
    const [ep, setEp] = useState(1);
    const [showMore, setShowMore] = useState(false);
    const [showTrailer, setShowTrailer] = useState(false);

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
            const youtube = await getYoutube(id, mediaType)
            setYoutubeData(youtube)
            const playing = await getNowPlayingMovies()
            setNowPlaying(playing)
        } catch (err) {
            console.error("error")
        }
    } 

        fetchMedia();
      }, [mediaType, id]);

      // dopo 3s mostra il trailer al posto dell'immagine
      useEffect(() => {
        setShowTrailer(false);
        const timer = setTimeout(() => setShowTrailer(true), 3000);
        return () => clearTimeout(timer);
      }, [id]);

    if (!mediaData) return <p>Loading...</p>;
    console.log(mediaData)
    console.log(youtubeData)

    const playerUrl = mediaData.name
        ? `https://vixsrc.to/tv/${id}/${season}/${ep}?lang=it`
        : `https://vixsrc.to/movie/${id}?lang=it`;

    // estrai il primo video youtube dai dati
    const youtubeVideo = youtubeData?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer')
    const youtubeUrl = youtubeVideo ? `https://www.youtube.com/embed/${youtubeVideo.key}?&muted=1&autoplay=1` : null
    
    // usa youtube se trovato, altrimenti vixsrc
    const trailerUrl = youtubeUrl || playerUrl

    return (
      <div className="media-streaming-container">
      <div className="media-hero relative w-full flex" style={{ minHeight: "70vh" }}>
        <div className="w-[35%] bg-black text-white px-8 py-10 flex flex-col gap-4 z-10">
          <div className="movieLogoContainer">
            {imageData?.logos?.[0]?.file_path && (
              <img
                alt={mediaData.title || mediaData.name}
                src={`${IMAGE_BASE_URL}${imageData.logos[0].file_path}`}
                className="movieLogo w-80"
              />
            )}
            <div className="info flex flex-row gap-1 pt-4 font-semibold">
              {mediaData.title ? (
                <p className="">{mediaData.release_date?.slice(0, 4)}</p>
              ) : (
                <p>{mediaData.first_air_date?.slice(0, 4)}</p>
              )}
              {mediaData.name && mediaData.seasons?.length > 0 && (
                <p>- {mediaData.seasons.length} stagioni</p>
              )}
              {mediaData.runtime && <p>- {mediaData.runtime} min</p>}
            </div>
            <div className="flex flex-row gap-5 items-center mt-5">
              <button className="p-1 font-semibold w-35 rounded-sm text-md bg-white text-black">▶ Riproduci</button>
              <div
                className="progress text-white font-semibold text-sm"
                data-value={mediaData.vote_average ? mediaData.vote_average.toFixed(1) : ''}
                style={{ ['--progress']: mediaData.vote_average ? `${Math.round(mediaData.vote_average * 10)}%` : '0%' }}
              ></div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-400 bg-black hover:border-white transform hover:scale-105 transition-transform">
                <button className="font-bold">✚</button>
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-400 bg-black hover:border-white transform hover:scale-105 transition-transform">
                <button className="font-bold">❤️</button>
              </div>
            </div>
          </div>

          <div className="text-sm pt-6 flex flex-col items-start gap-2">
            <p className={showMore ? "media-overview expanded" : "media-overview clamped"}>
              {mediaData.overview}
            </p>
            <button
              className="read-toggle-btn"
              onClick={() => setShowMore(prev => !prev)}
            >
              {showMore ? "Leggi di meno" : "Leggi di più"}
            </button>
            <div className="actors flex flex-row mt-3">
              <p className="text-sm font-bold text-neutral-300 mr-2">Generi:</p>
              <p className="text-sm text-neutral-200">
                {Array.isArray(mediaData.genres) ? mediaData.genres.map(g => g.name).join(", ") : null}
              </p>
            </div>

            {mediaData.name && mediaData.seasons && (
              <div className="season-selector mt-4">
                <p className="text-white font-semibold mb-2">Stagioni:</p>
                <div className="flex gap-2 w-[80vw] max-w-[420px] flex-wrap">
                  {mediaData.seasons
                    .filter(s => s.season_number > 0)
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSeason(s.season_number);
                          setEp(1);
                        }}
                        className={`season-btn ${season === s.season_number ? 'active' : ''}`}
                      >
                        {s.season_number}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {mediaData.name && mediaData.seasons && (
              <div className="episode-selector mt-4">
                <p className="text-white font-semibold mb-2">Episodi:</p>
                <div className="flex gap-2 w-[80vw] max-w-[420px] flex-wrap">
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
        </div>

        <div className="w-[65%] relative overflow-hidden">
          {!showTrailer && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://image.tmdb.org/t/p/original${mediaData.backdrop_path}')`
              }}
            />
          )}
          {showTrailer && (
            <iframe
              title="Trailer"
              src={trailerUrl}
              frameBorder="0"
              allow="autoplay; fullscreen"
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            ></iframe>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Sezione Now Playing */}
      {nowPlaying && nowPlaying.length > 0 && (
        <div className="now-playing-section px-10 py-10 bg-black">
          <p className="font-bold text-2xl pb-4 text-neutral-200">Al cinema ora</p>
          <EmblaCarousel movies={nowPlaying} />
        </div>
      )}
    </div>
    );
}

export default MediaStreaming;

