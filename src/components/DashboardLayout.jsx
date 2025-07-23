import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SignavoxLogo from '../assets/snignavox_icon.png';
import {
  Dashboard as DashboardIcon,
  School as CoursesIcon,
  TrendingUp as ProgressIcon,
  Event as EventsIcon,
  AssignmentTurnedIn as EnrollmentIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Group as UsersIcon,
  School as BatchIcon
} from '@mui/icons-material';
import Layout from './Layout'; // adjust path as needed
import './DashboardLayout.css';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import BaseUrl from '../Api';
import NotificationBell from './NotificationBell';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const location = useLocation();
  const SIDEBAR_WIDTH = sidebarOpen ? 220 : 72;
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  // Get user ID for notifications
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    setUser(() => {
      try {
        return JSON.parse(localStorage.getItem('user'));
      } catch {
        return null;
      }
    });
  }, []);

  let navItems = [
    { label: 'Dashboard', icon: <DashboardIcon fontSize="medium" />, path: '/dashboard' },
    { label: 'Courses', icon: <CoursesIcon fontSize="medium" />, path: '/courses' },
    { label: 'Progress', icon: <ProgressIcon fontSize="medium" />, path: '/progress' },
    { label: 'Events', icon: <EventsIcon fontSize="medium" />, path: '/events' },
  ];
  if (user?.role === 'admin') {
    navItems = [
      ...navItems,
      { label: 'Batch', icon: <BatchIcon fontSize="medium" />, path: '/batch' },
      { label: 'Users', icon: <UsersIcon fontSize="medium" />, path: '/users' },
      { label: 'Enrollment', icon: <EnrollmentIcon fontSize="medium" />, path: '/enrollments' },

    ];
  }

  const companyName = (
    <span className="flex items-center">
      <span className="text-2xl xs:text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-white font-spoof leading-none select-none">Sign</span>
      <img
        src={SignavoxLogo}
        alt="Signavox Logo"
        className="inline align-middle"
        style={{
          height: '1.6em',
          width: '1.7em',
          display: 'inline-block',
          verticalAlign: 'baseline',
          position: 'relative',
          top: '0.2em',
          padding: 0,
          margin: 0,
        }}
      />
      <span className="text-2xl xs:text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-white font-spoof leading-none select-none">vox</span>
    </span>
  );

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.clear();
    handleClose();
    navigate('/login', { replace: true });
  };

  return (
    <Layout>
      {/* ToastContainer overlays everything, including navbar */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 99999, position: 'fixed', top: 16, right: 16 }}
      />
      <div className="min-h-screen w-full flex relative">
        {/* Animated, Large, Low-Opacity Logo Background for Dashboard */}
        <img
          src={SignavoxLogo}
          alt="Signavox Logo Watermark"
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none z-0 hidden md:block animate-dashboard-logo-float"
          style={{
            width: '55vw',
            maxWidth: 600,
            minWidth: 300,
            opacity: 0.07,
            filter: 'drop-shadow(0 0 80px #a78bfa) drop-shadow(0 0 32px #f472b6)',
          }}
          draggable={false}
        />
        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 z-40 h-screen
            bg-white/10 backdrop-blur-xl
            shadow-2xl border-r border-purple-900/30
            transition-all duration-300
            ${sidebarOpen ? 'w-[220px]' : 'w-[72px]'}
            flex flex-col
            ${mobileSidebar ? 'block' : 'hidden'}
            md:block
          `}
          style={{ boxShadow: '0 8px 32px 0 rgba(49,17,136,0.18)' }}
        >
          {/* Logo + Company Name */}
          <div className="flex items-center justify-center h-20 px-2 border-b border-purple-900/20">
            {sidebarOpen ? (
              <span className="flex items-center gap-2">{companyName}</span>
            ) : (
              <img src={SignavoxLogo} alt="Signavox Logo" className="w-10 h-10 mx-auto" />
            )}
          </div>
          {/* Nav Items */}
          <nav className="flex-1 flex flex-col gap-1 mt-4">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`
                    group flex items-center gap-3 px-4 py-3 my-1 rounded-xl mx-2 font-semibold text-base relative overflow-hidden
                    transition-all duration-200
                    ${active ? 'bg-gradient-to-r from-purple-700/80 to-purple-900/80 text-white shadow-xl ring-2 ring-pink-400/40' : 'text-purple-100 hover:bg-purple-800/40 hover:text-white'}
                  `}
                  style={{ boxShadow: active ? '0 4px 24px 0 rgba(236,72,153,0.15)' : undefined }}
                >
                  <span className={`text-2xl group-hover:scale-125 transition-transform duration-200 ${active ? 'text-yellow-300 drop-shadow-glow' : 'text-purple-300'}`}>{item.icon}</span>
                  {sidebarOpen && <span className="tracking-wide drop-shadow-md">{item.label}</span>}
                  {!sidebarOpen && (
                    <span className="absolute left-full ml-2 bg-black/80 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                  {active && <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-pink-400 rounded-full animate-pulse" />}
                </Link>
              );
            })}
          </nav>
          {/* Spacer */}
          <div className="flex-1" />
          {/* Sidebar Glow/Decoration */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-pink-400/20 to-transparent blur-2xl pointer-events-none" />
        </aside>

        {/* Overlay for mobile sidebar */}
        {mobileSidebar && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setMobileSidebar(false)}
          />
        )}

        {/* Main Content Area */}
        <div
          className="flex-1 flex flex-col min-h-screen"
          style={{ marginLeft: SIDEBAR_WIDTH, transition: 'margin-left 0.3s' }}
        >
          {/* Navbar */}
          <header
            className="fixed top-0 left-0 right-0 z-30 h-20 flex items-center px-4 md:px-8 bg-white/10 backdrop-blur-xl shadow-lg border-b border-purple-900/30"
            style={{ marginLeft: SIDEBAR_WIDTH, transition: 'margin-left 0.3s' }}
          >
            {/* Sidebar toggle icon */}
            <button
              className="text-purple-200 hover:text-white focus:outline-none mr-4 md:mr-8"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileSidebar((v) => !v);
                } else {
                  setSidebarOpen((v) => !v);
                }
              }}
            >
              <MenuIcon fontSize="large" />
            </button>
            {/* Company name at intersection removed as per last change */}
            <div className="flex-1" />
            {/* Right-side icons */}
            <div className="flex items-center gap-4 ml-auto relative">
              {/* NotificationBell Component */}
              <NotificationBell userId={user?._id} sidebarOpen={sidebarOpen} />
              {/* Profile Dropdown */}
              <button
                className="p-2 rounded-full bg-gradient-to-br from-purple-400/20 to-purple-900/10 hover:bg-purple-400/30 transition-all shadow-lg focus:outline-none"
                onClick={handleProfileMenu}
                aria-controls={open ? 'profile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <AccountCircleIcon className="text-cyan-200" />
              </button>
              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'profile-button',
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          </header>
          {/* Main Content (scrollable) */}
          <main
            className="flex-1 pt-24 pb-8 px-2 md:px-8 relative overflow-y-auto"
            style={{ minHeight: '100vh' }}
          >
            {/* Watermark icon */}
            <div className="fixed right-8 top-24 opacity-10 select-none pointer-events-none hidden md:block animate-fade-in z-0">
              <img
                src={SignavoxLogo}
                alt="Signavox Logo"
                className="w-[32rem] h-[32rem] object-contain mx-auto "
                style={{
                  //   filter: 'drop-shadow(0 0 32px #a78bfa) drop-shadow(0 0 12px #f472b6)',
                  //   transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
                  //   transform: 'rotate(-8deg) scale(1.08)',
                }}
                draggable={false}
              />
            </div>
            {/* <svg width="1em" height="1em" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M192 128V48a16 16 0 0 0-16-16H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-80h-32Z" fill="currentColor"/>
              </svg> */}
            {/* <img src={SignavoxLogo} alt="Signavox Logo" className="w-10 h-10 mx-auto" />
            </div> */}
            {/* Actual page content */}
            <div className="relative z-10 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
        {/* Custom Animations */}
        <style>{`
          @keyframes dashboard-logo-float {
            0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
            50% { transform: translate(-50%, -52%) scale(1.04) rotate(2deg); }
            100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          }
          .animate-dashboard-logo-float {
            animation: dashboard-logo-float 16s ease-in-out infinite;
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 0.1; }
          }
          .animate-fade-in {
            animation: fade-in 2s ease-in;
          }
          .drop-shadow-glow {
            filter: drop-shadow(0 0 8px #f472b6) drop-shadow(0 0 16px #a78bfa);
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default DashboardLayout; 