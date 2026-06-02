import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "../services/axiosinstances";
import { setRole } from "../features/auth/authSlice";
import NotificationBell from "../components/notificationbell";

export default function Navbar() {
  const isAuth = useSelector((state: any) => state.auth.isAuthenticated);
  const roleFromState = useSelector((state: any) => state.auth.role);
  const role = roleFromState || localStorage.getItem("role");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    try { dispatch({ type: "auth/logout" }); } catch (e) { }
    navigate("/login");
  };

  useEffect(() => {
    if (isAuth && !role) {
      (async () => {
        try {
          const res = await axios.get('/accounts/me/');
          const data = res.data || {};
          let r = data.role;
          if (!r && data.is_superuser) r = 'ADMIN';
          if (r) dispatch(setRole(r));
        } catch (e) {
        }
      })();
    }
  }, [isAuth, role]);

  const roleVal = (role || '').toString().trim().toUpperCase();

  return (
    <div className="relative z-50 w-full bg-[#111010] pt-4 px-4 md:px-8">
      <nav className="w-full max-w-7xl mx-auto bg-[#0e0d0c] border-b border-white/[0.07] backdrop-blur-[8px] text-white px-6 py-4 flex items-center justify-between rounded-t-[16px]">
        <div className="flex items-center gap-4">
          <Link to="/events" className="text-2xl !text-[#e8e3dc] font-bold tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>Events</Link>
        </div>

        <div className="flex items-center gap-6">
          {isAuth && (
            <>
              {/* 🔔 Notifications */}
              <NotificationBell />

              {roleVal === 'ADMIN' && (
                <Link to="/admin" className="!text-[#7a7570] hover:!text-[#c9a96e] text-[15px] font-medium transition-colors">
                  Admin
                </Link>
              )}

              {roleVal === 'PHOTOGRAPHER' && (
                <Link to="/photographer" className="!text-[#7a7570] hover:!text-[#c9a96e] text-[15px] font-medium transition-colors">
                  Photographer Dashboard
                </Link>
              )}

              <Link to="/profile" className="!text-[#7a7570] hover:!text-[#c9a96e] text-[15px] font-medium transition-colors">
                Profile
              </Link>

              <div className="flex items-center gap-2">
                <button onClick={logout} className="px-4 py-1.5 border border-white/[0.15] bg-transparent text-[#e8e3dc] text-[14px] font-medium rounded-md hover:text-[#c9a96e] hover:border-[#c9a96e] transition-colors">
                  Logout
                </button>
                <button className="p-2 bg-[#232220] hover:bg-white/[0.1] text-[#e8e3dc] rounded-md transition-colors flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
              </div>
            </>
          )}

          {!isAuth && (
            <Link to="/login" className="px-4 py-1.5 bg-[#c9a96e] text-[#111010] text-[14px] font-semibold rounded-md">
              Login
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
