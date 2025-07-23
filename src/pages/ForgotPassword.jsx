import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Card, CardContent, Stepper, Step, StepLabel, InputAdornment, Box, IconButton, InputAdornment as MuiInputAdornment, CircularProgress } from '@mui/material';
import { Email, ArrowBack, LockOutlined, Visibility, VisibilityOff, Key } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BaseUrl from '../Api.jsx';

const steps = ['Request OTP', 'Reset Password'];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BaseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('OTP sent to email!');
        setTimeout(() => {
          setStep(1);
        }, 1200);
      } else {
        toast.error(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      toast.error('Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BaseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      toast.error('Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-b from-[#311188] to-[#0A081E] relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      {/* Animated background particles */}
      <motion.div className="absolute top-10 left-10 w-2 h-2 bg-purple-400 rounded-full opacity-60" animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-24 right-24 w-3 h-3 bg-purple-500 rounded-full opacity-40" animate={{ y: [0, -25, 0], x: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
      <motion.div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-purple-300 rounded-full opacity-30" animate={{ y: [0, 10, 0], x: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
      <motion.div className="absolute bottom-10 left-1/3 w-2 h-2 bg-purple-200 rounded-full opacity-30" animate={{ y: [0, -10, 0], x: [0, 8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="w-full max-w-md sm:max-w-lg px-2 z-10">
        <Card elevation={10} className="rounded-2xl shadow-xl" sx={{ borderRadius: '1.5rem', background: '#fff', boxShadow: '0 8px 40px 0 rgba(49,17,136,0.13)', overflow: 'visible', p: { xs: 1, sm: 2 } }}>
          <CardContent className="flex flex-col items-center px-2 py-4 sm:px-6 sm:py-5">
            {/* Lock Icon inside the form */}
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="mb-2">
              <Box sx={{ width: 60, height: 60, background: 'linear-gradient(135deg, #311188 60%, #0A081E 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px 0 rgba(49,17,136,0.13)', margin: '0 auto' }}>
                <LockOutlined sx={{ color: '#fff', fontSize: 36 }} />
              </Box>
            </motion.div>
            {/* Title & Subtitle */}
            <Typography variant="h4" align="center" sx={{ fontWeight: 500, mt: 1, mb: 0.7, color: '#181028', fontFamily: 'inherit', fontSize: { xs: '2rem', sm: '2.4rem', md: '2.7rem' }, letterSpacing: 0.5 }}>
              Reset Password
            </Typography>
            <Typography variant="subtitle1" align="center" sx={{ color: '#8886a3', mb: 2, fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' }, fontWeight: 300 }}>
              {step === 0 ? 'Enter your email to receive OTP' : 'Enter the OTP sent to your email and set a new password'}
            </Typography>
            {/* Stepper */}
            <Box sx={{ width: '100%', px: { xs: 1, sm: 3 }, mb: 2, mt: 0 }}>
              <Stepper activeStep={step} alternativeLabel sx={{ width: '100%', minHeight: 40, background: 'transparent', p: 0 }}>
                {steps.map((label, idx) => (
                  <Step key={label} completed={step > idx} sx={{ p: 0, m: 0 }}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          color: step === idx ? '#311188' : '#bdbdbd',
                          fontSize: 22,
                          border: step === idx ? '2px solid #311188' : '2px solid #bdbdbd',
                          borderRadius: '50%',
                          background: step === idx ? '#ede7f6' : '#f5f5fa',
                          zIndex: 1,
                        },
                      }}
                      sx={{
                        '& .MuiStepLabel-label': {
                          color: step === idx ? '#311188' : '#8886a3',
                          fontWeight: step === idx ? 600 : 500,
                          fontSize: { xs: 15, sm: 17 },
                        },
                        p: 0, m: 0,
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
            {/* Form */}
            {step === 0 ? (
              <form onSubmit={handleSendOtp} className="w-full flex flex-col gap-4 mt-1">
                <TextField
                  fullWidth
                  required
                  label="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#311188', fontSize: 22 }} />
                      </InputAdornment>
                    ),
                    style: { fontSize: '1.15rem', color: '#181028', fontFamily: 'inherit' },
                  }}
                  sx={{
                    background: '#fff',
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      fontSize: '1.15rem',
                      color: '#181028',
                      '& fieldset': { borderColor: '#e0e0e0', borderWidth: 2 },
                      '&:hover fieldset': { borderColor: '#311188' },
                      '&.Mui-focused fieldset': { borderColor: '#311188', borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#8886a3',
                      fontWeight: 500,
                      fontSize: 16,
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(90deg, #311188 0%, #0A081E 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '1.15rem',
                    borderRadius: '11px',
                    py: 1.2,
                    boxShadow: '0 2px 8px 0 rgba(49,17,136,0.10)',
                    textTransform: 'none',
                    mt: 1,
                    mb: 1,
                    letterSpacing: 0.5,
                    '&:hover': {
                      background: 'linear-gradient(90deg, #0A081E 0%, #311188 100%)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} /> : null}
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0 }}>
                  <Button
                    onClick={() => navigate('/login')}
                    startIcon={<ArrowBack sx={{ color: '#8886a3', fontSize: 18 }} />}
                    sx={{
                      color: '#8886a3',
                      fontWeight: 500,
                      fontSize: 15,
                      textTransform: 'none',
                      '&:hover': { color: '#311188', background: 'transparent' },
                    }}
                  >
                    Back to Login
                  </Button>
                </Box>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-4 mt-1">
                <TextField
                  fullWidth
                  required
                  label="OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Key sx={{ color: '#311188', fontSize: 22 }} />
                      </InputAdornment>
                    ),
                    style: { fontSize: '1.15rem', color: '#181028', fontFamily: 'inherit' },
                  }}
                  sx={{
                    background: '#fff',
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      fontSize: '1.15rem',
                      color: '#181028',
                      '& fieldset': { borderColor: '#e0e0e0', borderWidth: 2 },
                      '&:hover fieldset': { borderColor: '#311188' },
                      '&.Mui-focused fieldset': { borderColor: '#311188', borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#8886a3',
                      fontWeight: 500,
                      fontSize: 16,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  required
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: '#311188', fontSize: 22 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <MuiInputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((show) => !show)} edge="end" style={{ color: '#311188' }}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </MuiInputAdornment>
                    ),
                    style: { fontSize: '1.15rem', color: '#181028', fontFamily: 'inherit' },
                  }}
                  sx={{
                    background: '#fff',
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      fontSize: '1.15rem',
                      color: '#181028',
                      '& fieldset': { borderColor: '#e0e0e0', borderWidth: 2 },
                      '&:hover fieldset': { borderColor: '#311188' },
                      '&.Mui-focused fieldset': { borderColor: '#311188', borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#8886a3',
                      fontWeight: 500,
                      fontSize: 16,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  required
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: '#311188', fontSize: 22 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <MuiInputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword((show) => !show)} edge="end" style={{ color: '#311188' }}>
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </MuiInputAdornment>
                    ),
                    style: { fontSize: '1.15rem', color: '#181028', fontFamily: 'inherit' },
                  }}
                  sx={{
                    background: '#fff',
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      fontSize: '1.15rem',
                      color: '#181028',
                      '& fieldset': { borderColor: '#e0e0e0', borderWidth: 2 },
                      '&:hover fieldset': { borderColor: '#311188' },
                      '&.Mui-focused fieldset': { borderColor: '#311188', borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#8886a3',
                      fontWeight: 500,
                      fontSize: 16,
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(90deg, #311188 0%, #0A081E 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '1.15rem',
                    borderRadius: '11px',
                    py: 1.2,
                    boxShadow: '0 2px 8px 0 rgba(49,17,136,0.10)',
                    textTransform: 'none',
                    mt: 1,
                    mb: 1,
                    letterSpacing: 0.5,
                    '&:hover': {
                      background: 'linear-gradient(90deg, #0A081E 0%, #311188 100%)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} /> : null}
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0 }}>
                  <Button
                    onClick={() => navigate('/login')}
                    startIcon={<ArrowBack sx={{ color: '#8886a3', fontSize: 18 }} />}
                    sx={{
                      color: '#8886a3',
                      fontWeight: 500,
                      fontSize: 15,
                      textTransform: 'none',
                      '&:hover': { color: '#311188', background: 'transparent' },
                    }}
                  >
                    Back to Login
                  </Button>
                </Box>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword; 