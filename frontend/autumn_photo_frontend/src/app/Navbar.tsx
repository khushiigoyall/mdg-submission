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
    <nav className="w-full bg-[#0e0d0c] border-b border-white/[0.07] backdrop-blur-[8px] text-white p-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/events" className="text-xl text-[#e8e3dc] font-normal" style={{ fontFamily: "'DM Serif Display', serif" }}>Events</Link>
      </div>

      <div className="flex items-center gap-3">
        {isAuth && (
          <>
            {/* 🔔 Notifications */}
            <NotificationBell />

            {roleVal === 'ADMIN' && (
              <Link to="/admin" className="text-[#7a7570] hover:text-[#c9a96e] transition-colors">
                Admin
              </Link>
            )}

            {roleVal === 'PHOTOGRAPHER' && (
              <Link to="/photographer" className="text-[#7a7570] hover:text-[#c9a96e] transition-colors">
                Photographer Dashboard
              </Link>
            )}

            <Link to="/profile" className="text-[#7a7570] hover:text-[#c9a96e] transition-colors">
              Profile
            </Link>

            <button onClick={logout} className="px-[14px] py-[4px] border border-white/[0.15] bg-transparent text-[#e8e3dc] rounded-[5px] hover:text-[#c9a96e] hover:border-[#c9a96e] transition-colors">
              Logout
            </button>
          </>
        )}

        {!isAuth && (
          <Link to="/login" className="px-3 py-1 bg-[#c9a96e] text-[#111010] rounded">
            Login
          </Link>
        )}
      </div>

    </nav>
  );
}
