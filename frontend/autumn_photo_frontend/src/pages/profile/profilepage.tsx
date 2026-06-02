import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../../app/Navbar";
import axios from "../../services/axiosinstances";

const tryGet = async (urls: string[]) => {
    for (const u of urls) {
        try {
            const res = await axios.get(u);
            return res.data;
        } catch (e: any) {
            if (!e.response || e.response.status !== 404) {
                console.error(e);
            }
        }
    }
    return null;
};

const ProfilePage = () => {
    const email = useSelector((s: any) => s.auth.email);
    const [full_name, setFullName] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [liked, setLiked] = useState<any[]>([]);
    const [favs, setFavs] = useState<any[]>([]);
    const [tagged, setTagged] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            const likedData = await tryGet([
                "/photos/my/likes/",
                "/photos/likes/",
                "/photos/user/likes/",
            ]);
            setLiked(likedData?.photos || likedData || []);

            const favData = await tryGet([
                "/photos/my/favourites/",
                "/photos/favourites/",
                "/photos/user/favourites/",
            ]);
            setFavs(favData?.photos || favData || []);

            const taggedData = await tryGet([
                "/photos/my/tagged/",
                "/photos/tagged/",
                "/photos/user/tagged/",
            ]);
            setTagged(taggedData?.photos || taggedData || []);
            
            try {
                const res = await axios.get('/accounts/me/');
                const data = res.data;
                if (data?.full_name) setFullName(data.full_name);
                else setFullName(data.email);
                if (data?.role) setRole(data.role);
                else if (data?.is_superuser) setRole('ADMIN');
            } catch (e) {
                
                const maybeFull = localStorage.getItem("full_name") || null;
                if (maybeFull) setFullName(maybeFull);
                else if (email) setFullName(email.split("@")[0]);
            }
        })();
    }, []);

    return (
        <div className="h-screen w-screen overflow-y-auto bg-[#111010] text-[#e8e3dc]">
            <Navbar />
            <div className="relative z-10 px-6 md:px-10 lg:px-16 pt-[80px] pb-10 max-w-7xl mx-auto">
                <div className="flex flex-col mb-12">
                    <p className="text-[#7a7570] text-sm uppercase tracking-[0.08em] font-medium flex items-center gap-2 mb-2">
                        <span className="w-6 h-[1px] bg-[#7a7570]"></span> ACCOUNT DETAILS
                    </p>
                    <h1 className="text-5xl md:text-6xl font-normal text-[#e8e3dc] mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
                        Profile
                    </h1>
                </div>

                <div className="mb-12 p-8 rounded-xl bg-[#1a1917] border border-white/[0.06] flex flex-col md:flex-row md:items-center gap-8">
                    <div className="h-24 w-24 rounded-full bg-[#111010] border border-white/[0.06] flex items-center justify-center text-3xl text-[#c9a96e] uppercase font-bold" style={{ fontFamily: "'DM Serif Display', serif" }}>
                        {(full_name || email || 'U')[0]}
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="text-sm text-[#7a7570] font-medium uppercase tracking-wider">Username</div>
                        <div className="text-2xl text-[#e8e3dc] font-semibold">{full_name || 'Unknown'}</div>
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="text-sm text-[#7a7570] font-medium uppercase tracking-wider">Email Address</div>
                        <div className="text-lg text-[#e8e3dc]">{email || 'Unknown'}</div>
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="text-sm text-[#7a7570] font-medium uppercase tracking-wider">Role</div>
                        <div className="inline-block px-4 py-1.5 bg-[#111010] border border-[#c9a96e]/30 text-[#c9a96e] rounded-full text-sm font-semibold tracking-wide">
                            {role || localStorage.getItem('role') || 'USER'}
                        </div>
                    </div>
                </div>

                <section className="mb-12">
                    <h2 className="text-3xl font-normal mb-6 text-[#e8e3dc]" style={{ fontFamily: "'DM Serif Display', serif" }}>Liked Photos</h2>
                    {liked.length ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {liked.map((p: any) => (
                                <div key={p.id} className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-[#1a1917] border border-white/[0.06]">
                                    <img src={p.thumbnail_file?.startsWith('http') ? p.thumbnail_file : `http://127.0.0.1:8000${p.thumbnail_file}`} alt="Liked" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-80" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center rounded-xl border border-dashed border-white/[0.1] text-[#7a7570]">
                            No liked photos yet.
                        </div>
                    )}
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-normal mb-6 text-[#e8e3dc]" style={{ fontFamily: "'DM Serif Display', serif" }}>Favourites</h2>
                    {favs.length ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {favs.map((p: any) => (
                                <div key={p.id} className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-[#1a1917] border border-white/[0.06]">
                                    <img src={p.thumbnail_file?.startsWith('http') ? p.thumbnail_file : `http://127.0.0.1:8000${p.thumbnail_file}`} alt="Favourite" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-80" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center rounded-xl border border-dashed border-white/[0.1] text-[#7a7570]">
                            No favourites yet.
                        </div>
                    )}
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-normal mb-6 text-[#e8e3dc]" style={{ fontFamily: "'DM Serif Display', serif" }}>Tagged In</h2>
                    {tagged.length ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {tagged.map((p: any) => (
                                <div key={p.id} className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-[#1a1917] border border-white/[0.06]">
                                    <img src={p.thumbnail_file?.startsWith('http') ? p.thumbnail_file : `http://127.0.0.1:8000${p.thumbnail_file}`} alt="Tagged" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-80" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center rounded-xl border border-dashed border-white/[0.1] text-[#7a7570]">
                            You haven't been tagged in any photos yet.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;