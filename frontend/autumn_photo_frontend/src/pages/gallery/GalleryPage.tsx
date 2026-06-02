import { useEffect, useState } from "react";
import Navbar from "../../app/Navbar";
import axios from "../../services/axiosinstances";
import PhotoModal from "../../components/PhotoModal";
import { getMediaUrl } from "../../utils/media";
import { Search, Grid3x3, Columns, Images, Image as ImageIcon } from "lucide-react";

interface Photo {
  thumbnail_file: string;
  id: number;
}

export default function GalleryPage() {
  const [search, setSearch] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [view, setView] = useState("grid");
  const [openPhotoId, setOpenPhotoId] = useState<number | null>(null);
  const [openPhotoUrl, setOpenPhotoUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchPhotos = async (query = "") => {
    setLoading(true);
    try {
      const res = await axios.get(`/photos/search/?q=${encodeURIComponent(query)}`);
      setPhotos(res.data.photos || []);
    } catch (e) {
      console.error("Failed to fetch photos", e);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos(); // Fetch recent photos on mount
  }, []);

  const handleSearch = () => {
    fetchPhotos(search);
  };

  return (
    <div className="h-screen w-screen overflow-y-auto bg-[#111010] text-[#e8e3dc]">
      <Navbar />
      <div className="relative z-10 px-6 md:px-10 lg:px-16 pt-[80px] pb-10">
        <div className="flex flex-col mb-10">
          <p className="text-[#7a7570] text-sm uppercase tracking-[0.08em] font-medium flex items-center gap-2 mb-2">
            <span className="w-6 h-[1px] bg-[#7a7570]"></span> EXPLORE ALL PHOTOS
          </p>
          <h1 className="text-5xl md:text-6xl font-normal text-[#e8e3dc] mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Gallery
          </h1>
          <p className="text-[#7a7570] italic tracking-[0.08em] mt-2">discover photos by people, locations, and AI tags</p>
        </div>
        
        <div className="w-full mb-8">
          <div className="relative group/search">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a7570]">
              <Search className="w-5 h-5" />
            </div>
            <input
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              type="text"
              placeholder="Search by tagged people, locations, or AI tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-32 py-4 rounded-lg bg-[#1a1917] border border-white/[0.1] text-[#e8e3dc] placeholder-[#7a7570] focus:outline-none focus:border-[#c9a96e] focus:shadow-[0_0_15px_rgba(201,169,110,0.15)] transition-all duration-300"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 rounded-md border border-white/[0.15] !bg-transparent !text-white font-bold hover:!bg-white/[0.05] transition-colors duration-200"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-8">
          <p className="text-[#7a7570] font-medium">
            {loading ? "Searching..." : `${photos.length} photos found`}
          </p>
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#1a1917] border border-white/[0.05]">
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${view === "grid"
                  ? "bg-[#232220] text-[#e8e3dc] border border-white/[0.1]"
                  : "text-[#7a7570] hover:text-[#e8e3dc]"
                }`}
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setView("masonry")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${view === "masonry"
                  ? "bg-[#232220] text-[#e8e3dc] border border-white/[0.1]"
                  : "text-[#7a7570] hover:text-[#e8e3dc]"
                }`}
            >
              <Columns className="w-4 h-4" />
              <span className="hidden sm:inline">Masonry</span>
            </button>
            <button
              onClick={() => setView("carousel")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${view === "carousel"
                  ? "bg-[#232220] text-[#e8e3dc] border border-white/[0.1]"
                  : "text-[#7a7570] hover:text-[#e8e3dc]"
                }`}
            >
              <Images className="w-4 h-4" />
              <span className="hidden sm:inline">Carousel</span>
            </button>
          </div>
        </div>

        <div className="animate-fadeIn">
          {photos.length > 0 ? (
            <>
              {view === "grid" && (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {photos.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => { setOpenPhotoId(p.id); setOpenPhotoUrl(p.thumbnail_file); }}
                      className="group relative rounded-xl overflow-hidden bg-[#1a1917] border border-white/[0.06] hover:border-[#c9a96e]/50 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(201,169,110,0.12)] cursor-pointer"
                    >
                      <img src={getMediaUrl(p.thumbnail_file)}
                        alt="Gallery photo"
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
              )}

              {view === "masonry" && (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-6">
                  {photos.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => { setOpenPhotoId(p.id); setOpenPhotoUrl(p.thumbnail_file); }}
                      className="group relative rounded-xl overflow-hidden bg-[#1a1917] border border-white/[0.06] hover:border-[#c9a96e]/50 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(201,169,110,0.12)] cursor-pointer mb-6 break-inside-avoid"
                    >
                      <img
                        src={getMediaUrl(p.thumbnail_file)}
                        alt="Gallery photo"
                        className="w-full group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
              )}

              {view === "carousel" && (
                <div className="relative">
                  <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory custom-scrollbar">
                    {photos.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => { setOpenPhotoId(p.id); setOpenPhotoUrl(p.thumbnail_file); }}
                        className="group relative rounded-xl overflow-hidden bg-[#1a1917] border border-white/[0.06] hover:border-[#c9a96e]/50 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(201,169,110,0.12)] flex-shrink-0 snap-center"
                      >
                        <img
                          src={getMediaUrl(p.thumbnail_file)}
                          alt="Gallery photo"
                          className="h-[500px] w-auto object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {openPhotoId && (
                <PhotoModal
                  photoId={openPhotoId}
                  photoUrl={openPhotoUrl}
                  onClose={() => { setOpenPhotoId(null); setOpenPhotoUrl(""); }}
                />
              )}
            </>
          ) : (
            <div className="text-center py-20 border border-white/[0.05] rounded-xl bg-[#1a1917]">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#111010] mb-6 border border-white/[0.05]">
                <ImageIcon className="w-8 h-8 text-[#7a7570]" />
              </div>
              <p className="text-[#e8e3dc] text-xl font-medium">
                {loading ? "Loading gallery..." : "No photos found"}
              </p>
              <p className="text-[#7a7570] text-sm mt-2">
                {loading ? "Fetching recent photos" : "Try searching for another person, tag, or event."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
