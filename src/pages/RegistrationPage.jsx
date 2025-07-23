import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BaseUrl from '../Api.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link as RouterLink } from 'react-router-dom';
import universityOptions from '../assets/University_list.js';
import { Autocomplete, createFilterOptions } from '@mui/material';

import {
  School, Computer, Work, Badge, ArrowForward,
  Person, Email, Lock, Phone, WorkOutline,
  School as SchoolOutline, MenuBook, AccountTree,
  Business, WorkHistory, Grade, CalendarToday, PersonAdd,
  HowToReg, AutoAwesome, TrendingUp, RocketLaunch,
  Star, Lightbulb, Psychology, Celebration,
  Verified, Security, EmojiEvents, Group,
  CorporateFare, Assignment, Schedule
} from '@mui/icons-material';
import {
  TextField, Button, InputAdornment, Card, CardContent,
  Radio, RadioGroup, FormControlLabel, FormControl,
  FormLabel, Select, MenuItem, Typography, Divider,
  Tooltip, IconButton, Box, Chip,
  CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SignavoxLogo from '../assets/snignavox_icon.png';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

// Read and parse the university list
// const universityOptions = universityList.split('\n').filter(Boolean);

const Landing = () => {
  const [hasExperience, setHasExperience] = useState('no');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [customUniversity, setCustomUniversity] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [cgpaType, setCgpaType] = useState('CGPA');

  const features = [
    { icon: <School className="text-4xl text-purple-300" />, title: 'Globally Recognized Certification' },
    { icon: <Badge className="text-4xl text-purple-300" />, title: 'Learn from IT Legends' },
    { icon: <Computer className="text-4xl text-purple-300" />, title: '100% Real-World Training' },
    { icon: <Work className="text-4xl text-purple-300" />, title: 'Internship + Job Support' },
  ];

  const formFields = [
    { placeholder: 'Full Name', type: 'text', icon: <Person />, required: true },
    { placeholder: 'Email Address', type: 'email', icon: <Email />, required: true },
    { placeholder: 'Phone Number', type: 'tel', icon: <Phone />, required: true },
  ];

  // College Details fields
  const collegeFields = [
    { placeholder: 'University Name', type: 'select', icon: <School />, required: true, options: universityOptions },
    { placeholder: 'College/University', type: 'text', icon: <SchoolOutline />, required: true },
    { placeholder: 'Degree Type', type: 'select', icon: <Business />, required: true, options: [
      { value: 'Bachelors', label: 'Bachelors' },
      { value: 'Masters', label: 'Masters' },
      { value: 'PhD', label: 'PhD' },
    ] },
    { placeholder: 'Department', type: 'select', icon: <AccountTree />, required: true, options: [
      { value: 'CSE', label: 'Computer Science & Engineering' },
      { value: 'IT', label: 'Information Technology' },
      { value: 'ECE', label: 'Electronics & Communication' },
      { value: 'EEE', label: 'Electrical & Electronics' },
      { value: 'ME', label: 'Mechanical Engineering' },
      { value: 'CE', label: 'Civil Engineering' },
    ] },
    { placeholder: 'Specialization', type: 'text', icon: <MenuBook />, required: true },
    { placeholder: 'CGPA Score', type: 'number', icon: <Grade />, required: true, min: 0, max: 10, step: 0.1 },
    {
      placeholder: 'Current Year', type: 'select', icon: <CalendarToday />, required: true, options: [
        { value: '1st Year', label: '1st Year' },
        { value: '2nd Year', label: '2nd Year' },
        { value: '3rd Year', label: '3rd Year' },
        { value: '4th Year', label: '4th Year' },
        { value: 'Graduated', label: 'Graduated' },
      ]
    },
    { placeholder: 'Year of Passing', type: 'text', icon: <WorkHistory />, required: true },
  ];

  const experienceFields = [
    { placeholder: 'Previous Company', type: 'text', icon: <CorporateFare /> },
    { placeholder: 'Position Held', type: 'text', icon: <Assignment /> },
    { placeholder: 'Years of Experience', type: 'number', icon: <Schedule /> },
  ];

  const filter = createFilterOptions();

  // Update formData on input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Registration handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      // Build payload
      const payload = {
        name: formData['Full Name'] || '',
        email: formData['Email Address'] || '',
        role: 'intern', // Set as intern by default
        phone: formData['Phone Number'] || '',
        collegeName: formData['College/University'] || '',
        department: formData['Department'] === 'Others' ? customDepartment : (formData['Department'] || ''),
        university: formData['University Name'] === 'Others' ? customUniversity : (formData['University Name'] || ''),
        degree: formData['Degree Type'] || '',
        specialization: formData['Specialization'] || '',
        cgpa: formData['CGPA Score'] || '',
        cgpaType,
        currentYear: formData['Current Year'] || '',
        isGraduated: formData['isGraduated'] || false,
        yearOfPassing: formData['Year of Passing'] || '',
        hasExperience: hasExperience === 'yes',
        previousCompany: formData['Previous Company'] || '',
        position: formData['Position Held'] || '',
        yearsOfExperience: formData['Years of Experience'] || '',
        resume: formData['Resume'] || '',
      };
      const res = await fetch(`${BaseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setModalMessage((data.message || 'Registration successful!') + ' You will receive your login credentials by email after admin approval.');
        setModalOpen(true);
        setFormData({});
        setHasExperience('no');
      } else {
        setModalMessage(data.message || 'Registration failed.');
        setModalOpen(true);
      }
    } catch (err) {
      setModalMessage('Registration failed.');
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine if message is success
  const isSuccess = modalMessage && modalMessage.toLowerCase().includes('success');

  return (
    <>
      <div className="min-h-screen h-screen w-screen flex flex-col md:flex-row overflow-hidden">
        {/* Left Section with Content */}
        <div className="hidden md:flex w-full md:w-[65%] flex-col h-full relative pt-2 px-2 xs:px-3 sm:px-6 lg:px-12 bg-gradient-to-br from-[#311188]/10 to-[#0A081E]/30 min-w-0 overflow-visible max-h-full transition-all duration-500">
          <div className="w-full flex flex-col flex-grow min-w-0 h-full justify-between">
            {/* Title at the very top, minimal space above */}
            <div className="flex flex-col items-start mt-4 mb-8">
              <div className="flex items-center gap-0 mb-1">
                <span className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 font-spoof leading-none">Sign</span>
                <img src={SignavoxLogo} alt="Signavox Logo" className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 lg:w-10 lg:h-10 xl:w-10 xl:h-10 align-middle inline-block mt-2 xs:mt-3" />
                <span className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 font-spoof leading-none">vox</span>
              </div>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-purple-200 mt-1 font-spoof tracking-wide max-w-2xl mb-2">Empowering Future Tech Leaders</p>
            </div>

            {/* Section Divider */}
            {/* <div className="w-full h-[2px] bg-gradient-to-r from-purple-300/30 via-pink-200/20 to-purple-400/30 rounded-full mb-4" /> */}

            {/* Features Section */}
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
                "Solution that speaks success"
              </motion.h2>
              <motion.p
                className="text-xs xs:text-sm sm:text-base md:text-lg text-purple-100 mb-4 leading-relaxed  max-w-3xl font-spoof"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                This is not just our company — it's our legacy. Signavox stands for trust, transformation, and fearless journey into the future.
              </motion.p>
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 md:gap-4 mt-8 mb-2 max-w-5xl w-full">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/10 h-20 xs:h-24 min-h-[5rem] xs:min-h-[6rem] flex items-center p-2 xs:p-3 md:p-4 rounded-2xl backdrop-blur-lg transition-all border border-purple-500/30 group hover:bg-gradient-to-br hover:from-[#311188]/30 hover:to-[#0A081E]/40 hover:scale-105 hover:shadow-2xl relative overflow-hidden w-full min-w-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#311188] via-purple-500 to-[#0A081E] shadow-xl group-hover:scale-110 transition-all duration-500 mr-2 xs:mr-3 relative before:absolute before:inset-0 before:bg-gradient-to-tr before:from-purple-400/20 before:via-transparent before:to-transparent before:rounded-2xl before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-[2px] after:rounded-xl after:bg-gradient-to-br after:from-[#311188]/90 after:via-purple-500/90 after:to-[#0A081E]/90">
                      {React.cloneElement(feature.icon, { className: 'text-lg xs:text-2xl md:text-3xl text-white drop-shadow-lg relative z-10 transform transition-transform duration-500' })}
                    </span>
                    <p className="text-xs xs:text-sm md:text-base text-purple-100 group-hover:text-white font-spoof transition-colors duration-300 drop-shadow-md">
                      {feature.title}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Footer Section always at the bottom, but visually connected */}
            <div className="w-full mt-auto pt-2 pb-2 md:pb-4 px-1 md:px-4 text-xs md:text-sm text-purple-200/60 text-center md:text-left z-10">
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

        {/* Right Section - Registration Form */}
        <Card className="w-full md:w-[35%] max-w-full h-[100vh] md:h-screen shadow-2xl relative rounded-l-3xl md:rounded-none bg-gradient-to-br from-white via-purple-50 to-white flex items-center justify-center border-l-0 md:border-l-8 border-purple-200/40 md:shadow-[0_8px_32px_0_rgba(49,17,136,0.15)] transition-all duration-500">
          <CardContent className="h-full w-full relative z-10 flex flex-col p-2 xs:p-4 sm:p-6 md:p-8">
            {/* Modal for registration messages */}
            <Dialog
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              PaperProps={{
                sx: {
                  borderRadius: 4,
                  boxShadow: '0 8px 32px 0 rgba(49,17,136,0.15)',
                  background: 'linear-gradient(135deg, #fff 60%, #f3e8ff 100%)',
                  minWidth: { xs: 280, sm: 400 },
                  p: 0
                }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 3,
                  px: 2,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  background: 'linear-gradient(90deg, #311188 0%, #a855f7 100%)',
                  color: '#fff',
                  position: 'relative',
                }}
              >
                {isSuccess ? (
                  <CheckCircleIcon sx={{ fontSize: 40, color: '#a3e635', mr: 1 }} />
                ) : (
                  <ErrorIcon sx={{ fontSize: 40, color: '#f87171', mr: 1 }} />
                )}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontFamily: 'Spoof Trial, sans-serif',
                    letterSpacing: 1,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  }}
                >
                  {isSuccess ? 'Registration Successful' : 'Registration Failed'}
                </Typography>
              </Box>
              <DialogContent
                sx={{
                  py: 3,
                  px: 4,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #fff 60%, #f3e8ff 100%)',
                }}
              >
                <Typography
                  sx={{
                    color: '#311188',
                    fontFamily: 'Spoof Trial, sans-serif',
                    fontWeight: 500,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                  }}
                >
                  {modalMessage}
                </Typography>
              </DialogContent>
              <DialogActions
                sx={{
                  justifyContent: 'center',
                  pb: 3,
                  background: 'linear-gradient(135deg, #fff 60%, #f3e8ff 100%)',
                }}
              >
                <Button
                  onClick={() => setModalOpen(false)}
                  sx={{
                    background: 'linear-gradient(90deg, #311188 0%, #a855f7 100%)',
                    color: '#fff',
                    borderRadius: 3,
                    px: 4,
                    py: 1.2,
                    fontWeight: 700,
                    fontFamily: 'Spoof Trial, sans-serif',
                    fontSize: '1rem',
                    boxShadow: '0 2px 8px rgba(49,17,136,0.10)',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #a855f7 0%, #311188 100%)',
                      color: '#fff',
                    }
                  }}
                  autoFocus
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>
            <form className="flex-1 p-2 xs:p-4 flex flex-col gap-4 overflow-y-auto overflow-x-hidden custom-scrollbar" onSubmit={handleRegister}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
            >
              {/* Header that scrolls with form */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-center mb-4 xs:mb-6"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    // rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="inline-flex items-center justify-center w-12 h-12 xs:w-16 xs:h-16 mb-2 xs:mb-4 bg-gradient-to-br from-[#311188] to-[#0A081E] rounded-full shadow-lg"
                >
                  <PersonAdd className="text-2xl xs:text-3xl text-white" />
                </motion.div>

                <Typography
                  variant="h4"
                  className="font-bold mb-1 xs:mb-2 bg-gradient-to-r from-[#311188] to-[#0A081E] bg-clip-text text-transparent font-spoof text-lg xs:text-2xl sm:text-3xl md:text-4xl"
                >
                  Join the Future
                </Typography>
                <Typography variant="body1" className="text-gray-600 mb-2 xs:mb-4 font-spoof text-xs xs:text-base">
                  Register to build your tech career with Signavox
                </Typography>
              </motion.div>

              <div className="space-y-2 xs:space-y-4">
                {formFields.map((field, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                    className="group"
                  >
                    {/* Wrap conditional in fragment to ensure single parent */}
                    <>
                      {field.type === 'select' ? (
                        <FormControl fullWidth required={field.required} sx={{ mb: 0 }}>
                          <Select
                            displayEmpty
                            name={field.placeholder}
                            value={formData[field.placeholder] || ''}
                            onChange={handleInputChange}
                            startAdornment={
                              <InputAdornment position="start">
                                <motion.div transition={{ duration: 0.5 }} className="text-[#311188] ml-2">
                                  {field.icon}
                                </motion.div>
                              </InputAdornment>
                            }
                            sx={{
                              backgroundColor: 'rgba(255,255,255,0.95)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: '12px',
                              border: '2px solid transparent',
                              transition: 'all 0.4s ease',
                              fontSize: '0.95rem',
                              fontFamily: 'Spoof Trial, sans-serif',
                              minHeight: '40px',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,1)',
                                boxShadow: '0 6px 20px rgba(49, 17, 136, 0.15)',
                                border: '2px solid rgba(49, 17, 136, 0.3)'
                              },
                              '&.Mui-focused': {
                                border: '2px solid rgba(49, 17, 136, 0.6)',
                                boxShadow: '0 0 15px rgba(49, 17, 136, 0.25)'
                              }
                            }}
                            renderValue={(selected) => selected || field.placeholder}
                          >
                            <MenuItem value="" disabled>{field.placeholder}</MenuItem>
                            {field.options && field.options.map((option) => (
                              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <TextField
                          fullWidth
                          required={field.required}
                          variant="outlined"
                          label={field.placeholder}
                          // placeholder={field.placeholder}
                          type={field.type}
                          size="medium"
                          name={field.placeholder}
                          value={formData[field.placeholder] || ''}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <motion.div
                                  transition={{ duration: 0.5 }}
                                  className="text-[#311188] ml-2"
                                >
                                  {field.icon}
                                </motion.div>
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
                      )}
                    </>
                  </motion.div>
                ))}

                {/* College Details Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="space-y-2 xs:space-y-4"
                >
                  <Typography variant="h6" className="text-[#311188] font-semibold mt-2 xs:mt-4 mb-2 xs:mb-3 font-spoof text-base xs:text-lg mt-4 pb-2">
                    College Details
                  </Typography>
                  {collegeFields.map((field, index) => (
                    <div className="space-y-2 xs:space-y-4" key={index}>
                      {field.placeholder === 'University Name' ? (
                        <>
                          <Autocomplete
                            options={[...universityOptions.filter(u => u !== 'Others'), 'Others']}
                            value={formData['University Name'] || ''}
                            onChange={(_, newValue) => {
                              if (newValue === 'Others') {
                                setCustomUniversity('');
                                handleInputChange({ target: { name: 'University Name', value: 'Others' } });
                              } else {
                                setCustomUniversity('');
                                handleInputChange({ target: { name: 'University Name', value: newValue } });
                              }
                            }}
                            filterOptions={(options, params) => {
                              const filtered = filter(options, params);
                              const filteredNoDup = filtered.filter((v, i, arr) => v !== 'Others' || arr.indexOf('Others') === i);
                              if (
                                params.inputValue !== '' &&
                                !options.some(option => option.toLowerCase() === params.inputValue.toLowerCase())
                                && !filteredNoDup.includes('Others')
                              ) {
                                filteredNoDup.push('Others');
                              }
                              return filteredNoDup;
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="University Name"
                                variant="outlined"
                                required={field.required && formData['University Name'] !== 'Others'}
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <span className="text-[#311188] ml-2">{field.icon}</span>
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
                                    },
                                    '&.Mui-focused': {}
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
                            )}
                          />
                          {formData['University Name'] === 'Others' && (
                            <div className="w-full mt-2">
                              <TextField
                                fullWidth
                                required
                                label="Enter your University Name"
                                value={customUniversity}
                                onChange={e => setCustomUniversity(e.target.value)}
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
                                    },
                                    '&.Mui-focused': {}
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
                            </div>
                          )}
                        </>
                      ) : field.placeholder === 'Department' ? (
                        <>
                          <FormControl fullWidth required={field.required} sx={{ mb: 0 }}>
                            <Select
                              displayEmpty
                              name={field.placeholder}
                              value={formData[field.placeholder] || ''}
                              onChange={handleInputChange}
                              startAdornment={
                                <InputAdornment position="start">
                                  <span className="text-[#311188] ml-2">{field.icon}</span>
                                </InputAdornment>
                              }
                              sx={{
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                border: '2px solid transparent',
                                transition: 'all 0.4s ease',
                                fontSize: '0.95rem',
                                fontFamily: 'Spoof Trial, sans-serif',
                                minHeight: '40px',
                                '&:hover': {
                                  backgroundColor: 'rgba(255,255,255,1)',
                                  // boxShadow: '0 6px 20px rgba(49, 17, 136, 0.15)',
                                  // border: '2px solid rgba(49, 17, 136, 0.3)'
                                },
                                '&.Mui-focused': {
                                  // border: '2px solid rgba(49, 17, 136, 0.6)',
                                  // boxShadow: '0 0 15px rgba(49, 17, 136, 0.25)'
                                }
                              }}
                              renderValue={(selected) => selected || field.placeholder}
                            >
                              <MenuItem value="" disabled>{field.placeholder}</MenuItem>
                              {field.options && field.options.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                              ))}
                              <MenuItem value="Others">Others</MenuItem>
                            </Select>
                          </FormControl>
                          {formData['Department'] === 'Others' && (
                            <div className="w-full mt-2">
                              <TextField
                                fullWidth
                                required
                                label="Enter your Department"
                                value={customDepartment}
                                onChange={e => setCustomDepartment(e.target.value)}
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
                                    },
                                    '&.Mui-focused': {}
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
                            </div>
                          )}
                        </>
                      ) : field.placeholder === 'CGPA Score' ? (
                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-[#311188]">Score Type:</span>
                            <select
                              value={cgpaType}
                              onChange={e => setCgpaType(e.target.value)}
                              className="rounded-lg border border-purple-200 px-3 py-1 text-[#311188] bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 font-spoof"
                            >
                              <option value="CGPA">CGPA</option>
                              <option value="Percentage">Percentage</option>
                            </select>
                          </div>
                          <TextField
                            fullWidth
                            required={field.required}
                            variant="outlined"
                            label={cgpaType === 'CGPA' ? 'CGPA Score' : 'Percentage'}
                            type="number"
                            size="medium"
                            name="CGPA Score"
                            value={formData['CGPA Score'] || ''}
                            onChange={handleInputChange}
                            inputProps={{
                              min: cgpaType === 'CGPA' ? 0 : 0,
                              max: cgpaType === 'CGPA' ? 10 : 100,
                              step: cgpaType === 'CGPA' ? 0.1 : 0.1,
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <span className="text-[#311188] ml-2">{field.icon}</span>
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
                                },
                                '&.Mui-focused': {}
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
                        </div>
                      ) : field.type === 'select' ? (
                        <FormControl fullWidth required={field.required} sx={{ mb: 0 }}>
                          <Select
                            displayEmpty
                            name={field.placeholder}
                            value={formData[field.placeholder] || ''}
                            onChange={handleInputChange}
                            startAdornment={
                              <InputAdornment position="start">
                                <motion.div transition={{ duration: 0.5 }} className="text-[#311188] ml-2">
                                  {field.icon}
                                </motion.div>
                              </InputAdornment>
                            }
                            sx={{
                              backgroundColor: 'rgba(255,255,255,0.95)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: '12px',
                              border: '2px solid transparent',
                              transition: 'all 0.4s ease',
                              fontSize: '0.95rem',
                              fontFamily: 'Spoof Trial, sans-serif',
                              minHeight: '40px',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,1)',
                                // boxShadow: '0 6px 20px rgba(49, 17, 136, 0.15)',
                                // border: '2px solid rgba(49, 17, 136, 0.3)'
                              },
                              '&.Mui-focused': {
                                // border: '2px solid rgba(49, 17, 136, 0.6)',
                                // boxShadow: '0 0 15px rgba(49, 17, 136, 0.25)'
                              }
                            }}
                            renderValue={(selected) => selected || field.placeholder}
                          >
                            <MenuItem value="" disabled>{field.placeholder}</MenuItem>
                            {field.options && field.options.map((option) => (
                              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : field.type === 'number' ? (
                        <TextField
                          fullWidth
                          required={field.required}
                          variant="outlined"
                          label={field.placeholder}
                          // placeholder={field.placeholder}
                          type="number"
                          size="medium"
                          name={field.placeholder}
                          value={formData[field.placeholder] || ''}
                          onChange={handleInputChange}
                          inputProps={{
                            min: field.min,
                            max: field.max,
                            step: field.step || 0.1,
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <motion.div
                                  transition={{ duration: 0.5 }}
                                  className="text-[#311188] ml-2"
                                >
                                  {field.icon}
                                </motion.div>
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
                      ) : (
                        <TextField
                          fullWidth
                          required={field.required}
                          variant="outlined"
                          label={field.placeholder}
                          // placeholder={field.placeholder}
                          type={field.type}
                          size="medium"
                          name={field.placeholder}
                          value={formData[field.placeholder] || ''}
                          onChange={handleInputChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <motion.div
                                  transition={{ duration: 0.5 }}
                                  className="text-[#311188] ml-2"
                                >
                                  {field.icon}
                                </motion.div>
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
                      )}
                    </div>
                  ))}
                </motion.div>

                {/* Resume field */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + formFields.length * 0.1 + collegeFields.length * 0.1, duration: 0.6 }}
                  className="group"
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Resume (URL)"
                    // placeholder="Resume (URL)"
                    type="url"
                    size="medium"
                    name="Resume"
                    value={formData['Resume'] || ''}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <motion.div transition={{ duration: 0.5 }} className="text-[#311188] ml-2">
                            <AutoAwesome />
                          </motion.div>
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                >
                  <FormControl component="fieldset" className="w-full">
                    <FormLabel component="legend" className="text-[#311188] font-semibold mb-2 text-base font-spoof mt-2 pb-2">
                      Do you have professional experience?
                    </FormLabel>
                    <RadioGroup
                      row
                      value={hasExperience}
                      onChange={(e) => setHasExperience(e.target.value)}
                      className="justify-start space-x-4 xs:space-x-8 mt-2 pb-2"
                    >
                      <FormControlLabel
                        value="yes"
                        control={
                          <Radio
                            sx={{
                              color: '#311188',
                              '&.Mui-checked': {
                                color: '#311188'
                              }
                            }}
                          />
                        }
                        label="Yes"
                        className="text-[#311188] text-base font-spoof"
                      />
                      <FormControlLabel
                        value="no"
                        control={
                          <Radio
                            sx={{
                              color: '#311188',
                              '&.Mui-checked': {
                                color: '#311188'
                              }
                            }}
                          />
                        }
                        label="No"
                        className="text-[#311188] text-base font-spoof"
                      />
                    </RadioGroup>
                    {hasExperience === 'yes' && (
                      <div
                        className="space-y-2 xs:space-y-4"
                      >
                        <Typography variant="h6" className="text-[#311188] font-semibold mt-2 xs:mt-4 mb-2 xs:mb-3 font-spoof text-base xs:text-lg mt-4 pb-2">
                          Professional Experience
                        </Typography>
                        {experienceFields.map((field, index) => (
                          <div className="space-y-2 xs:space-y-4" key={index}>
                            <TextField
                              fullWidth
                              variant="outlined"
                              // placeholder={field.placeholder}
                              label={field.placeholder}
                              type={field.type}
                              size="medium"
                              name={field.placeholder}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <motion.div
                                      className="text-[#311188] ml-2"
                                      whileHover={{ rotate: 360, scale: 1.2 }}
                                      transition={{ duration: 0.5 }}
                                    >
                                      {field.icon}
                                    </motion.div>
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: 'rgba(255,255,255,0.95)',
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
                                '& .MuiInputBase-input': {
                                  fontFamily: 'Spoof Trial, sans-serif',
                                  fontSize: '0.95rem',
                                  padding: '6px 12px'
                                }
                              }}
                              value={formData[field.placeholder] || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </FormControl>
                </motion.div>

              </div>

              {/* Spacer to push button to bottom */}
              {message && <div className="text-green-600 text-center font-bold mb-2">{message}<br /><span className="text-xs font-normal">Please wait for admin approval. You will receive your credentials by email.</span></div>}
              {error && <div className="text-red-600 text-center font-bold mb-2">{error}</div>}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.8 }}
                className="pt-2 xs:pt-4 pb-2 xs:pb-4 bg-gradient-to-t from-white via-purple-50/80 to-transparent backdrop-blur-sm"
              >
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  type="submit"
                  disabled={loading}
                  endIcon={
                    loading ? null : (
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowForward />
                      </motion.div>
                    )
                  }
                  sx={{
                    background: 'linear-gradient(135deg, #311188 0%, #0A081E 100%)',
                    fontSize: '1rem',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontFamily: 'Spoof Trial, sans-serif',
                    boxShadow: '0 6px 20px rgba(49, 17, 136, 0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0A081E 0%, #311188 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(49, 17, 136, 0.35)'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Register Now'}
                </Button>
                {/* Sign In Link */}
                <div className="w-full text-center mt-4">
                  <RouterLink
                    to="/login"
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
                    Already have an account? <span style={{ color: '#311188', textDecoration: 'underline' }}>Sign In</span>
                  </RouterLink>
                </div>
              </motion.div>
            </form>
          </CardContent>

          {/* Decorative background elements */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-4 xs:top-10 right-4 xs:right-10 w-12 xs:w-20 h-12 xs:h-20 bg-gradient-to-br from-[#311188]/20 to-[#0A081E]/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 0.9, 1]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-10 xs:bottom-20 left-4 xs:left-10 w-10 xs:w-16 h-10 xs:h-16 bg-gradient-to-br from-[#311188]/20 to-[#0A081E]/20 rounded-full blur-xl"
          />
        </Card>
      </div>
    </>
  );
};

export default Landing;