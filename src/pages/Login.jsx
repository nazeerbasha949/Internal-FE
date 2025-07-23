import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { TextField, Button, InputAdornment, IconButton, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { Email, Lock, Person, ArrowForward, Visibility, VisibilityOff, Security, FlashOn, Public, MenuBook, Work, TrendingUp } from '@mui/icons-material';
import { motion } from 'framer-motion';
import BaseUrl from '../Api.jsx';
import SignavoxLogo from '../assets/snignavox_icon.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const start = Date.now();
    let isSuccess = false;
    let toastMsg = '';
    try {
      const res = await fetch(`${BaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        isSuccess = true;
        toastMsg = 'Login successful! Redirecting...';
        localStorage.setItem('token', data.token);
      } else {
        toastMsg = data.message || 'Login failed.';
      }
    } catch (err) {
      toastMsg = 'Login failed.';
    } finally {
      const elapsed = Date.now() - start;
      const delay = Math.max(0, 2000 - elapsed);
      setTimeout(() => {
        setLoading(false);
        if (isSuccess) {
          // toast.success(toastMsg);
          setTimeout(() => {
            if (onLoginSuccess) {
              onLoginSuccess();
            } else {
              navigate('/dashboard');
            }
          }, 1200);
        } else {
          toast.error(toastMsg);
        }
      }, delay);
    }
  };

  return (
    <div className="min-h-screen h-screen w-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left Section with Content */}
      <div className="hidden md:flex w-full md:w-[65%] flex-col h-full relative pt-2 px-2 xs:px-3 sm:px-6 lg:px-12 bg-gradient-to-br from-[#311188]/10 to-[#0A081E]/30 min-w-0 overflow-visible max-h-full transition-all duration-500">
        <div className="w-full flex flex-col flex-grow min-w-0 h-full justify-between">
          {/* Title at the very top, minimal space above */}
          <div className="flex flex-col items-start mt-4 mb-2">
            <div className="flex items-center gap-0 mb-1">
              <span className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 font-spoof leading-none">Sign</span>
              <img src={SignavoxLogo} alt="Signavox Logo" className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 lg:w-10 lg:h-10 xl:w-11 xl:h-11 align-middle inline-block mt-2 xs:mt-3" />
              <span className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 font-spoof leading-none ">vox</span>
            </div>
            <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-purple-200 mt-1 font-spoof tracking-wide max-w-2xl mb-2">Empowering Future Tech Leaders</p>
          </div>
          {/* Section Divider */}
          {/* <div className="w-full h-[2px] bg-gradient-to-r from-purple-300/30 via-pink-200/20 to-purple-400/30 rounded-full mb-4" /> */}
          {/* Features Section - Signavox Career Ladder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-1 mb-4 flex-0"
          >
            <motion.h2
              className="text-xs xs:text-sm sm:text-lg md:text-2xl lg:text-3xl mb-4 text-purple-200 font-light tracking-wide font-spoof mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Signavox Career Ladder
            </motion.h2>
            <motion.p
              className="text-xs xs:text-sm sm:text-base md:text-lg text-purple-100 mb-4 leading-relaxed  max-w-3xl font-spoof"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Your journey to tech leadership starts here. Climb the Signavox Career Ladder and unlock your future!
            </motion.p>
            <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 md:gap-4 mt-8 mb-2 max-w-5xl w-full">
              <div className="bg-white/10 h-20 xs:h-24 min-h-[5rem] xs:min-h-[6rem] flex items-center p-2 xs:p-3 md:p-4 rounded-2xl backdrop-blur-lg transition-all border border-purple-500/30 group hover:bg-gradient-to-br hover:from-[#311188]/30 hover:to-[#0A081E]/40 hover:scale-105 hover:shadow-2xl relative overflow-hidden w-full min-w-0">
                <Person className="text-3xl text-pink-300 mr-3" />
                <p className="text-xs xs:text-sm md:text-base text-purple-100 group-hover:text-white font-spoof transition-colors duration-300 drop-shadow-md">
                  <span className="font-bold text-purple-200">Step 1:</span> Discover your passion and join our vibrant community.
                </p>
              </div>
              <div className="bg-white/10 h-20 xs:h-24 min-h-[5rem] xs:min-h-[6rem] flex items-center p-2 xs:p-3 md:p-4 rounded-2xl backdrop-blur-lg transition-all border border-purple-500/30 group hover:bg-gradient-to-br hover:from-[#311188]/30 hover:to-[#0A081E]/40 hover:scale-105 hover:shadow-2xl relative overflow-hidden w-full min-w-0">
                <MenuBook className="text-3xl text-purple-300 mr-3" />
                <p className="text-xs xs:text-sm md:text-base text-purple-100 group-hover:text-white font-spoof transition-colors duration-300 drop-shadow-md">
                  <span className="font-bold text-purple-200">Step 2:</span> Learn from industry legends and master real-world skills.
                </p>
              </div>
              <div className="bg-white/10 h-20 xs:h-24 min-h-[5rem] xs:min-h-[6rem] flex items-center p-2 xs:p-3 md:p-4 rounded-2xl backdrop-blur-lg transition-all border border-purple-500/30 group hover:bg-gradient-to-br hover:from-[#311188]/30 hover:to-[#0A081E]/40 hover:scale-105 hover:shadow-2xl relative overflow-hidden w-full min-w-0">
                <Work className="text-3xl text-yellow-300 mr-3" />
                <p className="text-xs xs:text-sm md:text-base text-purple-100 group-hover:text-white font-spoof transition-colors duration-300 drop-shadow-md">
                  <span className="font-bold text-purple-200">Step 3:</span> Gain hands-on experience with internships and projects.
                </p>
              </div>
              <div className="bg-white/10 h-20 xs:h-24 min-h-[5rem] xs:min-h-[6rem] flex items-center p-2 xs:p-3 md:p-4 rounded-2xl backdrop-blur-lg transition-all border border-purple-500/30 group hover:bg-gradient-to-br hover:from-[#311188]/30 hover:to-[#0A081E]/40 hover:scale-105 hover:shadow-2xl relative overflow-hidden w-full min-w-0">
                <TrendingUp className="text-3xl text-green-300 mr-3" />
                <p className="text-xs xs:text-sm md:text-base text-purple-100 group-hover:text-white font-spoof transition-colors duration-300 drop-shadow-md">
                  <span className="font-bold text-purple-200">Step 4:</span> Launch your career and become a tech leader with Signavox.
                </p>
              </div>
            </div>
          </motion.div>
          {/* Section Divider */}
          {/* <div className="w-full h-[2px] bg-gradient-to-r from-purple-300/30 via-pink-200/20 to-purple-400/30 rounded-full mt-2 mb-2" /> */}
          {/* Footer Section always at the bottom, but visually connected */}
          <div className="w-full pt-2 pb-2 md:pb-4 px-1 md:px-4 text-xs md:text-sm text-purple-200/60 text-center md:text-left z-10">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-1 md:space-y-0">
              <Typography variant="body2" className="text-[#fff] text-xs font-spoof">
                © 2025 Signavox. All rights Reserved
              </Typography>
              <div className="flex items-center space-x-1 xs:space-x-2">
                <span className="text-purple-300/60 font-spoof mx-1">|</span>
                <span className="underline cursor-pointer">Privacy Policy</span>
                <span className="text-purple-300/60 font-spoof mx-1">|</span>
                <span className="underline cursor-pointer">Terms of Use</span>
                <span className="text-purple-300/60 font-spoof mx-1">|</span>
                <span className="underline cursor-pointer">Cookies Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Right Section - Login Form */}
      <Card className="w-full md:w-[35%] max-w-full h-[100vh] md:h-screen shadow-2xl relative rounded-l-3xl md:rounded-none bg-gradient-to-br from-white via-purple-50 to-white flex items-center justify-center border-l-0 md:border-l-8 border-purple-200/40 md:shadow-[0_8px_32px_0_rgba(49,17,136,0.15)] transition-all duration-500">
        <CardContent className="h-full w-full relative z-10 flex flex-col justify-center items-center p-2 xs:p-4 sm:p-6 md:p-8">
          {/* Toast for login messages */}
          <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
          <form className="flex-1 w-full max-w-md mx-auto p-2 xs:p-4 flex flex-col gap-4 justify-center items-center overflow-y-auto overflow-x-hidden custom-scrollbar" onSubmit={handleLogin}>
            {/* Animated Icon Header */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-center mb-4 xs:mb-6 w-full"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center justify-center w-12 h-12 xs:w-16 xs:h-16 mb-2 xs:mb-4 bg-gradient-to-br from-[#311188] to-[#0A081E] rounded-full shadow-lg"
              >
                <Person className="text-2xl xs:text-3xl text-white" />
              </motion.div>
              <Typography
                variant="h4"
                className="font-bold mb-1 xs:mb-2 bg-gradient-to-r from-[#311188] to-[#0A081E] bg-clip-text text-transparent font-spoof text-lg xs:text-2xl sm:text-3xl md:text-4xl"
              >
                Welcome Back
              </Typography>
              <Typography variant="body1" className="text-gray-600 mb-2 xs:mb-4 font-spoof text-xs xs:text-base">
                Sign in to your Signavox account
              </Typography>
            </motion.div>
            <div className="w-full flex flex-col gap-4 items-center">
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email className="text-[#311188] text-lg ml-2" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: '2px solid transparent',
                    transition: 'all 0.4s ease',
                    fontSize: '0.95rem',
                    padding: '6px 0',
                    fontFamily: 'Spoof Trial, sans-serif',
                    minHeight: '40px',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,1)',
                      transform: 'translateY(-2px)',
                      // boxShadow: '0 6px 20px rgba(49, 17, 136, 0.15)',
                      // border: '2px solid rgba(49, 17, 136, 0.3)'
                    },
                    '&.Mui-focused': {
                      // border: '2px solid rgba(49, 17, 136, 0.6)',
                      // boxShadow: '0 0 15px rgba(49, 17, 136, 0.25)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#6b7280',
                    fontSize: '0.85rem',
                    fontFamily: 'Spoof Trial, sans-serif'
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: 'Spoof Trial, sans-serif',
                    fontSize: '0.95rem',
                    padding: '6px 12px'
                  }
                }}
              />
              <TextField
                fullWidth
                required
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="text-[#311188] text-lg ml-2" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((show) => !show)} edge="end" sx={{ mr: 1, p: 0.5 }}>
                        {showPassword ? <VisibilityOff className="text-[#311188]" /> : <Visibility className="text-[#311188]" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: '2px solid transparent',
                    transition: 'all 0.4s ease',
                    fontSize: '0.95rem',
                    padding: '6px 0',
                    fontFamily: 'Spoof Trial, sans-serif',
                    minHeight: '40px',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,1)',
                      transform: 'translateY(-2px)',
                      // boxShadow: '0 6px 20px rgba(49, 17, 136, 0.15)',
                      // border: '2px solid rgba(49, 17, 136, 0.3)'
                    },
                    '&.Mui-focused': {
                      // border: '2px solid rgba(49, 17, 136, 0.6)',
                      // boxShadow: '0 0 15px rgba(49, 17, 136, 0.25)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#6b7280',
                    fontSize: '0.85rem',
                    fontFamily: 'Spoof Trial, sans-serif'
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: 'Spoof Trial, sans-serif',
                    fontSize: '0.95rem',
                    padding: '6px 12px'
                  }
                }}
              />
              <div className="flex flex-col gap-1 w-full">
                <span
                  className="text-right text-purple-400 text-sm mt-1 cursor-pointer hover:underline transition-all duration-200 font-spoof"
                  onClick={() => { navigate('/forgotpassword'); }}
                >
                  Forgot password?
                </span>
              </div>
              <Button
                variant="contained"
                fullWidth
                size="large"
                type="submit"
                disabled={loading}
                endIcon={loading ? null : <ArrowForward />}
                sx={{
                  background: 'linear-gradient(135deg, #311188 0%, #0A081E 100%)',
                  fontWeight: 'bold',
                  fontFamily: 'Spoof Trial, sans-serif',
                  fontSize: '1.1rem',
                  borderRadius: '12px',
                  minHeight: '44px',
                  boxShadow: '0 6px 20px rgba(49, 17, 136, 0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0A081E 0%, #311188 100%)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In'}
              </Button>
              {/* Sign Up Link */}
              <div className="w-full text-center mt-4">
                <RouterLink
                  to="/"
                  style={{
                    color: '#7c3aed',
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontFamily: 'Spoof Trial, sans-serif',
                    fontSize: '1rem',
                    letterSpacing: '0.5px',
                    transition: 'color 0.2s',
                  }}
                >
                  Don't have an account? <span style={{ color: '#311188', textDecoration: 'underline' }}>Sign Up</span>
                </RouterLink>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 