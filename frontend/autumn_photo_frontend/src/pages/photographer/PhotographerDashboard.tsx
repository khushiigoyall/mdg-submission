import React, { useEffect, useState } from 'react';
import Navbar from '../../app/Navbar';
import axios from '../../services/axiosinstances';
import { getMediaUrl } from '../../utils/media';
import MultiUploader from '../../components/MultiUploader';
import { UploadCloud, Heart, MessageCircle, Star, Image as ImageIcon } from 'lucide-react';


export default function PhotographerDashboard(){
  const [stats, setStats] = useState<any>(null);
  const [uploads, setUploads] = useState<any[]>([]);

  const load = async () => {
    try{
      const s = await axios.get('/dashboard/stats/');
      setStats(s.data);
    }catch(e){}

    try{
      const u = await axios.get('/dashboard/uploads/');
      const data = u.data || {};
      setUploads(data.uploads || data.uplaods || data.results || data || []);
    }catch(e){
      console.error('Failed loading uploads', e);
      setUploads([]);
    }
  }

  useEffect(()=>{ load(); }, []);

  return (
    <div className="h-screen w-screen overflow-y-auto bg-[#111010] text-[#e8e3dc]">
      <Navbar />
      <div className="relative z-10 px-6 md:px-10 lg:px-16 pt-[80px] pb-10 max-w-7xl mx-auto">
        
        <div className="flex flex-col mb-10">
          <p className="text-[#7a7570] text-sm uppercase tracking-[0.08em] font-medium flex items-center gap-2 mb-2">
            <span className="w-6 h-[1px] bg-[#7a7570]"></span> YOUR WORKSPACE
          </p>
          <h1 className="text-5xl md:text-6xl font-normal text-[#e8e3dc] mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Photographer Dashboard
          </h1>
          <p className="text-[#7a7570] italic tracking-[0.08em] mt-2">manage your uploads and view your impact</p>
        </div>

        <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="p-6 bg-[#1a1917] border border-white/[0.06] rounded-xl hover:border-[#c9a96e]/50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#7a7570] text-sm font-medium">Total Uploads</span>
              <UploadCloud className="w-5 h-5 text-[#c9a96e] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-bold text-[#e8e3dc]">{stats?.total_uploads || 0}</div>
          </div>
          <div className="p-6 bg-[#1a1917] border border-white/[0.06] rounded-xl hover:border-[#c9a96e]/50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#7a7570] text-sm font-medium">Total Likes</span>
              <Heart className="w-5 h-5 text-[#c9a96e] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-bold text-[#e8e3dc]">{stats?.total_likes || 0}</div>
          </div>
          <div className="p-6 bg-[#1a1917] border border-white/[0.06] rounded-xl hover:border-[#c9a96e]/50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#7a7570] text-sm font-medium">Total Comments</span>
              <MessageCircle className="w-5 h-5 text-[#c9a96e] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-bold text-[#e8e3dc]">{stats?.total_comments || 0}</div>
          </div>
          <div className="p-6 bg-[#1a1917] border border-white/[0.06] rounded-xl hover:border-[#c9a96e]/50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#7a7570] text-sm font-medium">Total Favourites</span>
              <Star className="w-5 h-5 text-[#c9a96e] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-bold text-[#e8e3dc]">{stats?.total_favourites || 0}</div>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#e8e3dc]">Upload Photos</h2>
          </div>
          <MultiUploader onUploaded={load} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#e8e3dc]">My Uploads</h2>
            <span className="text-[#7a7570] text-sm">{uploads.length} photos</span>
          </div>
          
          {uploads.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {uploads.map((p:any)=> (
                <div key={p.id} className="group relative rounded-xl overflow-hidden bg-[#1a1917] border border-white/[0.06] hover:border-[#c9a96e]/50 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(201,169,110,0.12)]">
                  <div className="relative h-48 w-full bg-[#111010]">
                    <img src={getMediaUrl(
                      p.thumbnail || p.display || p.original || p.thumbnail_file || p.thumbnail_url
                    )} alt="thumb" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-white">
                      <span>{p.event || p.event_name || 'Event'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-white/[0.05] rounded-xl bg-[#1a1917]">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#111010] mb-6 border border-white/[0.05]">
                <ImageIcon className="w-8 h-8 text-[#7a7570]" />
              </div>
              <p className="text-[#e8e3dc] text-xl font-medium">No uploads yet</p>
              <p className="text-[#7a7570] text-sm mt-2">Your uploaded photos will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
