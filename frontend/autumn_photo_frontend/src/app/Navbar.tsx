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
    <nav className="w-full bg-[#0e0d0c]/90 border-b border-white/[0.07] backdrop-blur-[8px] sticky top-0 z-50 text-[#e8e3dc] p-4 flex items-center justify-between font-sans">
      <div className="flex items-center gap-4">
        <Link to="/events" className="text-2xl font-normal text-[#e8e3dc]" style={{ fontFamily: "'DM Serif Display', serif" }}>Events</Link>
      </div>

      <div className="flex items-center gap-5">
        {isAuth && (
          <>
            {/* 🔔 Notifications */}
            <NotificationBell />

            {roleVal === 'ADMIN' && (
              <Link to="/admin" className="text-[#7a7570] hover:text-[#c9a96e] transition-colors font-medium">
                Admin
              </Link>
            )}

            {roleVal === 'PHOTOGRAPHER' && (
              <Link to="/photographer" className="text-[#7a7570] hover:text-[#c9a96e] transition-colors font-medium">
                Photographer Dashboard
              </Link>
            )}

            <Link to="/profile" className="text-[#7a7570] hover:text-[#c9a96e] transition-colors font-medium">
              Profile
            </Link>

            <button onClick={logout} className="px-4 py-1.5 border border-white/[0.15] text-[#e8e3dc] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors rounded-md text-sm font-medium">
              Logout
            </button>
          </>
        )}

        {!isAuth && (
          <Link to="/login" className="px-4 py-1.5 bg-[#c9a96e] text-[#111010] hover:bg-[#b0935d] transition-colors rounded-md text-sm font-medium">
            Login
          </Link>
        )}
      </div>

    </nav>
  );
}
