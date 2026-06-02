import React, { useState, useEffect } from "react";
import Navbar from "../../app/Navbar";
import axios from "../../services/axiosinstances";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const role = useSelector((s:any) => s.auth.role);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDatetime, setStartDatetime] = useState("");
  const [endDatetime, setEndDatetime] = useState("");
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [cover, setCover] = useState<File | null>(null);
  const [coordinators, setCoordinators] = useState("");
  const [selectedCoordinators, setSelectedCoordinators] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDatetime, setEditStartDatetime] = useState("");
  const [editEndDatetime, setEditEndDatetime] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editCover, setEditCover] = useState<File | null>(null);
  const [editCoordinators, setEditCoordinators] = useState<number[]>([]);

  const ROLE_OPTIONS = [
    "ADMIN",
    "EVENT_COORDINATOR",
    "PHOTOGRAPHER",
    "IMG_MEMBER",
    "PUBLIC",
  ];

  useEffect(() => {
    (async () => {
      setUsersLoading(true);
      try {
        const res = await axios.get('/adminpanel/users/');
        setUsers(res.data.users || []);
      } catch (e) {
      } finally {
        setUsersLoading(false);
      }
    })();
    (async () => {
      setEventsLoading(true);
      try {
        const res = await axios.get('/events/');
        setEvents(Array.isArray(res.data) ? res.data : (res.data.results || []));
      } catch (e) {
      } finally {
        setEventsLoading(false);
      }
    })();
  }, []);

  if (role !== "ADMIN") {
    return (
      <div className="h-screen w-screen overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <Navbar />
        <div className="px-6 md:px-10 lg:px-16 py-8 md:py-10">
          <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
          <div className="p-6 rounded bg-gray-900/50 border border-gray-800">You are not authorized to access this page.</div>
        </div>
      </div>
    );
  }

  const submit = async (e:React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("description", description);
      if (startDatetime) form.append("start_datetime", startDatetime);
      if (endDatetime) form.append("end_datetime", endDatetime);
      form.append("location", location);
      form.append("is_public", isPublic ? "true" : "false");
      selectedCoordinators.forEach(id => form.append("coordinators", String(id)));
      if (cover) form.append('cover_upload', cover);
      await axios.post('/adminpanel/create-event/', form);
      setLoading(false);
      navigate('/events');
    } catch (err:any) {
      setLoading(false);
      setError(err.response?.data || String(err));
    }
  };

  const refreshUsers = async () => {
    try {
      const res = await axios.get('/adminpanel/users/');
      setUsers(res.data.users || []);
    } catch (e) {}
  };

  const refreshEvents = async () => {
    try {
      const res = await axios.get('/events/');
      setEvents(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (e) {}
  };

  const deleteEvent = async (id:number) => {
    const ok = window.confirm('Delete this event? This action cannot be undone.');
    if (!ok) return;
    try {
      const resp = await axios.delete(`/events/${id}/`);
      if (resp.status === 204 || resp.status === 200) {
        setEvents(prev => prev.filter(e => e.id !== id));
      } else {
        await refreshEvents();
      }
    } catch (e:any) {
      console.error('Failed to delete event', e);
      const msg = e.response?.data || e.message || String(e);
      setError(msg);
    }
  };

  const toggleUser = async (userId:number) => {
    try {
      await axios.post('/adminpanel/toggle-user/', { user_id: userId });
      await refreshUsers();
    } catch (e:any) {
      console.error(e);
    }
  };

  const assignRole = async (userId:number, roleName:string) => {
    try {
      await axios.post('/adminpanel/assign-role/', { user_id: userId, role_name: roleName });
      await refreshUsers();
    } catch (e:any) {
      console.error(e);
    }
  };

  const openEditModal = (event: any) => {
    setEditingEvent(event);
    setEditName(event.name || "");
    setEditDescription(event.description || "");
    setEditStartDatetime(event.start_datetime || "");
    setEditEndDatetime(event.end_datetime || "");
    setEditLocation(event.location || "");
    setEditIsPublic(event.is_public !== false);
    setEditCoordinators(event.coordinators || []);
    setEditCover(null);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingEvent(null);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    
    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", editName);
      form.append("description", editDescription);
      if (editStartDatetime) form.append("start_datetime", editStartDatetime);
      if (editEndDatetime) form.append("end_datetime", editEndDatetime);
      form.append("location", editLocation);
      form.append("is_public", editIsPublic ? "true" : "false");
      editCoordinators.forEach(id => form.append("coordinator_ids", String(id)));
      if (editCover) form.append('cover_upload', editCover);
      
      await axios.patch(`/events/${editingEvent.id}/`, form);
      setLoading(false);
      closeEditModal();
      await refreshEvents();
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data || String(err));
    }
  };

  return (
    <div className="h-screen w-screen overflow-y-auto bg-[#111010] text-[#e8e3dc]">
      <Navbar />
      <div className="relative z-10 px-6 md:px-10 lg:px-16 pt-[80px] pb-10 max-w-7xl mx-auto">
        <div className="flex flex-col mb-12">
          <p className="text-[#7a7570] text-sm uppercase tracking-[0.08em] font-medium flex items-center gap-2 mb-2">
            <span className="w-6 h-[1px] bg-[#7a7570]"></span> ADMINISTRATION
          </p>
          <h1 className="text-5xl md:text-6xl font-normal text-[#e8e3dc] mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Admin Panel
          </h1>
          <p className="text-[#7a7570] italic tracking-[0.08em] mt-2">manage users, events, and platform settings</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Manage Users Section */}
          <div className="p-6 rounded-xl bg-[#1a1917] border border-white/[0.06]">
            <h2 className="text-2xl font-bold mb-6 text-[#e8e3dc]">Manage Users</h2>
            {usersLoading ? (
              <div className="text-[#7a7570]">Loading users...</div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {users.length === 0 && <div className="text-[#7a7570]">No users found.</div>}
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between gap-4 p-4 bg-[#111010] border border-white/[0.06] rounded-lg hover:border-[#c9a96e]/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[#e8e3dc] truncate">{u.full_name || u.email}</div>
                      <div className="text-sm text-[#7a7570] truncate">{u.email}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <select 
                        defaultValue={u.role || (u.is_superuser? 'ADMIN':'PUBLIC')} 
                        onChange={(e)=>assignRole(u.id, e.target.value)} 
                        className="px-3 py-1.5 bg-[#1a1917] border border-white/[0.06] rounded-lg text-sm text-[#e8e3dc] focus:border-[#c9a96e] outline-none transition-colors"
                      >
                        {ROLE_OPTIONS.map(r=> <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button 
                        onClick={()=>toggleUser(u.id)} 
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${u.is_active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'}`}
                      >
                        {u.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manage Events Section */}
          <div className="p-6 rounded-xl bg-[#1a1917] border border-white/[0.06]">
            <h2 className="text-2xl font-bold mb-6 text-[#e8e3dc]">Events List</h2>
            {eventsLoading ? (
              <div className="text-[#7a7570]">Loading events...</div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {events.length === 0 && <div className="text-[#7a7570]">No events found.</div>}
                {events.map((ev:any) => (
                  <div key={ev.id} className="flex items-center justify-between p-4 bg-[#111010] border border-white/[0.06] rounded-lg hover:border-[#c9a96e]/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[#e8e3dc] truncate">{ev.name}</div>
                      <div className="text-sm text-[#7a7570] truncate">{ev.start_datetime} — {ev.end_datetime}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => navigate(`/events/${ev.id}`)} className="px-3 py-1.5 bg-[#1a1917] border border-white/[0.06] hover:border-[#c9a96e]/50 hover:text-[#c9a96e] rounded-lg text-sm transition-colors">View</button>
                      <button onClick={() => openEditModal(ev)} className="px-3 py-1.5 bg-[#1a1917] border border-white/[0.06] hover:border-blue-400/50 hover:text-blue-400 rounded-lg text-sm transition-colors">Edit</button>
                      <button onClick={() => deleteEvent(ev.id)} className="px-3 py-1.5 bg-[#1a1917] border border-white/[0.06] hover:border-red-500/50 hover:text-red-400 rounded-lg text-sm transition-colors">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Event Form */}
        <div className="p-8 rounded-xl bg-[#1a1917] border border-white/[0.06] max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-8 text-[#e8e3dc]" style={{ fontFamily: "'DM Serif Display', serif" }}>Create New Event</h2>
          <form onSubmit={submit} className="space-y-6">
            {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">{JSON.stringify(error)}</div>}
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#7a7570]">Event Name</label>
                  <input required value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#111010] border border-white/[0.06] text-[#e8e3dc] focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e] outline-none transition-all" placeholder="Enter event name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#7a7570]">Location</label>
                  <input value={location} onChange={e=>setLocation(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#111010] border border-white/[0.06] text-[#e8e3dc] focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e] outline-none transition-all" placeholder="Event location" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#7a7570]">Start</label>
                    <input type="datetime-local" value={startDatetime} onChange={e=>setStartDatetime(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#111010] border border-white/[0.06] text-[#e8e3dc] focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e] outline-none transition-all [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#7a7570]">End</label>
                    <input type="datetime-local" value={endDatetime} onChange={e=>setEndDatetime(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#111010] border border-white/[0.06] text-[#e8e3dc] focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e] outline-none transition-all [color-scheme:dark]" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#7a7570]">Description</label>
                  <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#111010] border border-white/[0.06] text-[#e8e3dc] focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e] outline-none transition-all min-h-[128px]" placeholder="Event details..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#7a7570]">Coordinators</label>
                  <select multiple value={selectedCoordinators.map(String)} onChange={(e)=>{
                    const opts = Array.from(e.target.selectedOptions).map(o=>Number(o.value));
                    setSelectedCoordinators(opts);
                  }} className="w-full px-4 py-3 rounded-lg bg-[#111010] border border-white/[0.06] text-[#e8e3dc] focus:border-[#c9a96e] outline-none transition-all h-28 custom-scrollbar">
                    {users.map(u=> (
                      <option key={u.id} value={u.id} className="py-1">{u.full_name || u.email}</option>
                    ))}
                  </select>
                  <div className="text-xs text-[#7a7570] mt-2">Hold Ctrl/Cmd to multi-select.</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <label className="block text-sm font-medium text-[#7a7570]">Cover Photo</label>
                  <input type="file" accept="image/*" onChange={e=>setCover(e.target.files?.[0] || null)} className="text-sm text-[#e8e3dc] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1a1917] file:text-[#c9a96e] file:border file:border-white/[0.06] hover:file:bg-[#2a2927] hover:file:cursor-pointer transition-all" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)} className="w-4 h-4 rounded bg-[#111010] border-white/[0.06] text-[#c9a96e] focus:ring-[#c9a96e]" /> 
                  <span className="text-[#e8e3dc]">Public Event</span>
                </label>
              </div>
              
              <button type="submit" disabled={loading} style={{ backgroundColor: '#c9a96e', color: '#111010' }} className="px-8 py-3 rounded-lg font-bold hover:brightness-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>

        {/* Edit Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#111010] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/[0.1] shadow-2xl">
              <div className="sticky top-0 bg-[#111010]/95 backdrop-blur border-b border-white/[0.06] p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-[#e8e3dc]" style={{ fontFamily: "'DM Serif Display', serif" }}>Edit Event</h2>
                <button onClick={closeEditModal} className="text-[#7a7570] hover:text-white text-2xl transition-colors">&times;</button>
              </div>
              
              <form onSubmit={submitEdit} className="p-6 space-y-6">
                {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">{JSON.stringify(error)}</div>}
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#7a7570]">Event Name</label>
                      <input required value={editName} onChange={e=>setEditName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#1a1917] border border-white/[0.06] text-[#e8e3dc] focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#7a7570]">Location</label>
                      <input value={editLocation} onChange={e=>setEditLocation(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#1a1917] border border-white/[0.06] text-[#e8e3dc] focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e] outline-none transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-[#7a7570]">Start</label>
                        <input type="datetime-local" value={editStartDatetime} onChange={e=>setEditStartDatetime(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#1a1917] border border-white/[0.06] text-[#e8e3dc] focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e] outline-none transition-all [color-scheme:dark]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-[#7a7570]">End</label>
                        <input type="datetime-local" value={editEndDatetime} onChange={e=>setEditEndDatetime(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#1a1917] border border-white/[0.06] text-[#e8e3dc] focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e] outline-none transition-all [color-scheme:dark]" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#7a7570]">Description</label>
                      <textarea value={editDescription} onChange={e=>setEditDescription(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#1a1917] border border-white/[0.06] text-[#e8e3dc] focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e] outline-none transition-all min-h-[128px]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#7a7570]">Coordinators</label>
                      <select 
                        multiple 
                        value={editCoordinators.map(String)} 
                        onChange={(e)=>{
                          const opts = Array.from(e.target.selectedOptions).map(o=>Number(o.value));
                          setEditCoordinators(opts);
                        }} 
                        className="w-full px-4 py-3 rounded-lg bg-[#1a1917] border border-white/[0.06] text-[#e8e3dc] focus:border-[#c9a96e] outline-none transition-all h-28 custom-scrollbar"
                      >
                        {users.map(u=> (
                          <option key={u.id} value={u.id} className="py-1">{u.full_name || u.email}</option>
                        ))}
                      </select>
                      <div className="text-xs text-[#7a7570] mt-2">Hold Ctrl/Cmd to multi-select</div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      <label className="block text-sm font-medium text-[#7a7570]">Cover Photo</label>
                      <input type="file" accept="image/*" onChange={e=>setEditCover(e.target.files?.[0] || null)} className="text-sm text-[#e8e3dc] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1a1917] file:text-[#c9a96e] file:border file:border-white/[0.06] hover:file:bg-[#2a2927] hover:file:cursor-pointer transition-all" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editIsPublic} onChange={e=>setEditIsPublic(e.target.checked)} className="w-4 h-4 rounded bg-[#111010] border-white/[0.06] text-[#c9a96e] focus:ring-[#c9a96e]" /> 
                      <span className="text-[#e8e3dc]">Public Event</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={closeEditModal} className="px-6 py-2.5 bg-[#1a1917] border border-white/[0.06] text-[#e8e3dc] rounded-lg font-semibold hover:bg-[#2a2927] transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} style={{ backgroundColor: '#c9a96e', color: '#111010' }} className="px-6 py-2.5 rounded-lg font-bold hover:brightness-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading ? 'Updating...' : 'Update Event'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
