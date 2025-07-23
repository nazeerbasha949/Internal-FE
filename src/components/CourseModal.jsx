import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, InputLabel, FormControl, Checkbox, FormControlLabel, IconButton, Typography, Box, Chip, Grid, Divider, Avatar, ListItemAvatar, ListItemText, CircularProgress
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import BaseUrl from '../Api';
// 1. Import Accordion, AccordionSummary, AccordionDetails from @mui/material
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const defaultCourse = {
  title: '',
  slug: '',
  description: '',
  type: 'Technical',
  category: '',
  subCategory: '',
  level: 'Beginner',
  language: 'English',
  price: { amount: 0, currency: 'INR', discountPercent: 0 },
  isFree: false,
  averageRating: 0,
  ratingsCount: 0,
  coverImage: '',
  promoVideoUrl: '',
  tags: [],
  duration: '',
  modules: [],
  professor: '',
  enrolledUsers: [],
  status: 'Draft',
  publishedAt: '',
};

const textFieldSx = {
  background: 'linear-gradient(135deg, #2d1a4d 0%, #3b206b 100%)',
  borderRadius: 3,
  color: '#fff',
  '& .MuiInputBase-input': { 
    color: '#fff', 
    fontWeight: 500, 
    fontSize: 16,
    padding: '12px 16px',
    '&::placeholder': {
      color: '#a78bfa',
      opacity: 0.7
    }
  },
  '& .MuiInputBase-root': {
    color: '#fff',
    border: '2px solid #a78bfa',
    boxShadow: 'none',
    background: 'rgba(60, 30, 90, 0.9)',
    borderRadius: 2,
    fontWeight: 500,
    fontSize: 16,
    minHeight: 48,
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#60a5fa',
      boxShadow: '0 0 8px #60a5fa33'
    }
  },
  '& .MuiInputLabel-root': { 
    color: '#a78bfa', 
    fontWeight: 600, 
    fontSize: 14,
    '&.Mui-focused': {
      color: '#60a5fa'
    }
  },
  '& .Mui-focused .MuiInputBase-root': {
    borderColor: '#60a5fa',
    boxShadow: '0 0 12px #60a5fa55',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  }
};
const inputLabelProps = { style: { color: '#a78bfa', fontWeight: 600, fontSize: 13 } };
const formControlSx = {
  background: 'linear-gradient(135deg, #2d1a4d 0%, #3b206b 100%)',
  borderRadius: 3,
  color: '#fff',
  '& .MuiInputBase-root': {
    color: '#fff',
    border: '2px solid #a78bfa',
    boxShadow: 'none',
    background: 'rgba(60, 30, 90, 0.9)',
    borderRadius: 2,
    fontWeight: 500,
    fontSize: 16,
    minHeight: 48,
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#60a5fa',
      boxShadow: '0 0 8px #60a5fa33'
    }
  },
  '& .MuiInputLabel-root': { 
    color: '#a78bfa', 
    fontWeight: 600, 
    fontSize: 14,
    '&.Mui-focused': {
      color: '#60a5fa'
    }
  },
  '& .Mui-focused .MuiInputBase-root': {
    borderColor: '#60a5fa',
    boxShadow: '0 0 12px #60a5fa55',
  },
  '& .MuiSelect-select': {
    color: '#fff',
    fontWeight: 500,
    fontSize: 16,
    padding: '12px 16px'
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  }
};
const selectSx = formControlSx;

function CourseModal({ open, onClose, onSubmit, initialData, mode }) {
  const [course, setCourse] = useState(initialData || defaultCourse);
  const [tagInput, setTagInput] = useState('');
  const [professors, setProfessors] = useState([]);
  const [profLoading, setProfLoading] = useState(false);
  const [profError, setProfError] = useState(null);

  React.useEffect(() => {
    setCourse(initialData ? JSON.parse(JSON.stringify(initialData)) : defaultCourse);
  }, [initialData, open]);

  React.useEffect(() => {
    if (open) {
      setProfLoading(true);
      setProfError(null);
      const token = localStorage.getItem('token');
      axios.get(`${BaseUrl}/professors`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
        .then(res => setProfessors(res.data))
        .catch(err => setProfError(err.response?.data?.message || err.message || 'Failed to fetch professors'))
        .finally(() => setProfLoading(false));
    }
  }, [open]);

  // Handlers for simple fields
  const handleChange = (field, value) => {
    setCourse(prev => ({ ...prev, [field]: value }));
  };
  const handlePriceChange = (field, value) => {
    setCourse(prev => ({ ...prev, price: { ...prev.price, [field]: value } }));
  };
  // Tags
  const handleAddTag = () => {
    if (tagInput && !course.tags.includes(tagInput)) {
      setCourse(prev => ({ ...prev, tags: [...prev.tags, tagInput] }));
      setTagInput('');
    }
  };
  const handleRemoveTag = (tag) => {
    setCourse(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };
  // Modules
  const handleAddModule = () => {
    setCourse(prev => ({ ...prev, modules: [...prev.modules, { moduleTitle: '', moduleDescription: '', lessons: [] }] }));
  };
  const handleRemoveModule = (idx) => {
    setCourse(prev => ({ ...prev, modules: prev.modules.filter((_, i) => i !== idx) }));
  };
  const handleModuleChange = (idx, field, value) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      modules[idx][field] = value;
      return { ...prev, modules };
    });
  };
  // Lessons
  const handleAddLesson = (mIdx) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      modules[mIdx].lessons = modules[mIdx].lessons || [];
      modules[mIdx].lessons.push({
        title: '', summary: '', durationMinutes: 0, previewAvailable: false, quizIncluded: false, quizQuestions: [], topics: []
      });
      return { ...prev, modules };
    });
  };
  const handleRemoveLesson = (mIdx, lIdx) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      modules[mIdx].lessons = modules[mIdx].lessons.filter((_, i) => i !== lIdx);
      return { ...prev, modules };
    });
  };
  const handleLessonChange = (mIdx, lIdx, field, value) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      modules[mIdx].lessons[lIdx][field] = value;
      return { ...prev, modules };
    });
  };
  // Topics
  const handleAddTopic = (mIdx, lIdx) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      modules[mIdx].lessons[lIdx].topics = modules[mIdx].lessons[lIdx].topics || [];
      modules[mIdx].lessons[lIdx].topics.push({ title: '', description: '', videoUrl: '', subTopics: [] });
      return { ...prev, modules };
    });
  };
  const handleRemoveTopic = (mIdx, lIdx, tIdx) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      modules[mIdx].lessons[lIdx].topics = modules[mIdx].lessons[lIdx].topics.filter((_, i) => i !== tIdx);
      return { ...prev, modules };
    });
  };
  const handleTopicChange = (mIdx, lIdx, tIdx, field, value) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      modules[mIdx].lessons[lIdx].topics[tIdx][field] = value;
      return { ...prev, modules };
    });
  };
  // SubTopics
  const handleAddSubTopic = (mIdx, lIdx, tIdx) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      modules[mIdx].lessons[lIdx].topics[tIdx].subTopics = modules[mIdx].lessons[lIdx].topics[tIdx].subTopics || [];
      modules[mIdx].lessons[lIdx].topics[tIdx].subTopics.push({ title: '', content: '', videoUrl: '' });
      return { ...prev, modules };
    });
  };
  const handleRemoveSubTopic = (mIdx, lIdx, tIdx, sIdx) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      modules[mIdx].lessons[lIdx].topics[tIdx].subTopics = modules[mIdx].lessons[lIdx].topics[tIdx].subTopics.filter((_, i) => i !== sIdx);
      return { ...prev, modules };
    });
  };
  const handleSubTopicChange = (mIdx, lIdx, tIdx, sIdx, field, value) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      modules[mIdx].lessons[lIdx].topics[tIdx].subTopics[sIdx][field] = value;
      return { ...prev, modules };
    });
  };
  // Quiz
  const handleQuizIncludedChange = (mIdx, lIdx, value) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      modules[mIdx].lessons[lIdx].quizIncluded = value;
      if (!value) modules[mIdx].lessons[lIdx].quizQuestions = [];
      return { ...prev, modules };
    });
  };
  const handleAddQuizQuestion = (mIdx, lIdx) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      modules[mIdx].lessons[lIdx].quizQuestions = modules[mIdx].lessons[lIdx].quizQuestions || [];
      modules[mIdx].lessons[lIdx].quizQuestions.push({ question: '', options: ['', '', '', ''], answer: '' });
      return { ...prev, modules };
    });
  };
  const handleRemoveQuizQuestion = (mIdx, lIdx, qIdx) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      modules[mIdx].lessons[lIdx].quizQuestions = modules[mIdx].lessons[lIdx].quizQuestions.filter((_, i) => i !== qIdx);
      return { ...prev, modules };
    });
  };
  const handleQuizQuestionChange = (mIdx, lIdx, qIdx, field, value) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      modules[mIdx].lessons[lIdx].quizQuestions[qIdx][field] = value;
      return { ...prev, modules };
    });
  };
  const handleQuizOptionChange = (mIdx, lIdx, qIdx, oIdx, value) => {
    setCourse(prev => {
      const modules = [...prev.modules];
      modules[mIdx].lessons[lIdx].quizQuestions[qIdx].options[oIdx] = value;
      return { ...prev, modules };
    });
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(course);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: '1.5rem',
          boxShadow: '0 20px 60px 0 rgba(0,0,0,0.3)', // Remove bottom color border
          background: 'linear-gradient(135deg, #312e81e6 0%, #0a081ee6 100%)',
          border: 'none',
          position: 'relative',
          overflow: 'hidden',
          px: 0,
          maxHeight: '90vh'
        }
      }}
      BackdropProps={{
        sx: {
          background: 'rgba(16, 10, 40, 0.2)',
          backdropFilter: 'blur(3px)'
        }
      }}
    >

      {/* Top accent bar */}
      <Box className="h-2 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />

      <DialogContent sx={{
        bgcolor: 'transparent',
        px: { xs: 3, md: 4 },
        py: 0,
        border: 'none',
        boxShadow: 'none',
        borderRadius: '1.5rem',
        overflowY: 'auto',
        maxHeight: '80vh',
        position: 'relative',
        mt: '6px', // Push content below accent bar
        '&::-webkit-scrollbar': {
          width: '7px',
          background: 'rgba(167,139,250,0.08)',
          borderRadius: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(90deg, #a78bfa 0%, #60a5fa 100%)',
          borderRadius: '8px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)',
        },
      }}>

        <DialogTitle sx={{
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          fontWeight: 800, 
          fontSize: { xs: 24, md: 32 }, 
          color: '#fff', 
          letterSpacing: 1, 
          pb: 2, 
          pt: 1, 
          px: 0, 
          background: 'none',
          fontFamily: 'Montserrat, Merriweather, sans-serif',
          borderBottom: '2px solid rgba(167,139,250,0.3)',
          mb: 3
        }}>
          <span style={{
            color: '#fff',
            fontWeight: 800,
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            letterSpacing: 2,
            fontFamily: 'Montserrat, Merriweather, sans-serif',
            textTransform: 'uppercase',
            background: 'linear-gradient(90deg, #f472b6 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {mode === 'edit' ? 'Update Course' : 'Add New Course'}
          </span>
          <IconButton 
            onClick={onClose} 
            sx={{
              color: '#a78bfa',
              background: 'rgba(167,139,250,0.15)',
              boxShadow: '0 4px 20px rgba(167,139,250,0.3)',
              position: 'absolute', 
              right: 16, 
              top: 16, 
              zIndex: 5,
              width: 48, 
              height: 48,
              borderRadius: '50%',
              fontSize: 32,
              border: '2px solid #a78bfa',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(167,139,250,0.25)',
                transform: 'scale(1.1)',
                boxShadow: '0 6px 25px rgba(167,139,250,0.4)'
              }
            }}
          >
            <CloseIcon fontSize="large" />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit} id="course-form" style={{ background: 'none', boxShadow: 'none', border: 'none' }}>
          <Grid container direction="column" spacing={1}>
            {/* Basic Info Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                color: '#a78bfa',
                fontSize: '1.25rem',
                borderBottom: '1px solid rgba(167,139,250,0.3)',
                pb: 1
              }}>
                Basic Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField 
                label="Title" 
                value={course.title} 
                onChange={e => handleChange('title', e.target.value)} 
                fullWidth 
                required 
                margin="dense"
                sx={textFieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField 
                label="Slug" 
                value={course.slug} 
                onChange={e => handleChange('slug', e.target.value)} 
                fullWidth 
                required 
                margin="dense"
                sx={textFieldSx}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Description" 
                value={course.description} 
                onChange={e => handleChange('description', e.target.value)} 
                fullWidth 
                required 
                margin="dense"
                multiline 
                minRows={3}
                maxRows={6}
                sx={{
                  ...textFieldSx,
                  '& .MuiInputBase-input': {
                    ...textFieldSx['& .MuiInputBase-input'],
                    lineHeight: 1.6
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}><Divider sx={{ my: 3, bgcolor: 'rgba(167,139,250,0.3)', height: 2 }} /></Grid>
            {/* Category/Type/Level Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                color: '#a78bfa',
                fontSize: '1.25rem',
                borderBottom: '1px solid rgba(167,139,250,0.3)',
                pb: 1
              }}>
                Course Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" sx={formControlSx}>
                <InputLabel>Type</InputLabel>
                <Select value={course.type} label="Type" onChange={e => handleChange('type', e.target.value)}>
                  {['Technical', 'Soft Skills', 'Management', 'Creative', 'Language', 'Other'].map(opt => (
                    <MenuItem key={opt} value={opt} sx={{ color: '#000', fontWeight: 600 }}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" sx={formControlSx}>
                <InputLabel>Level</InputLabel>
                <Select value={course.level} label="Level" onChange={e => handleChange('level', e.target.value)}>
                  {['Beginner', 'Intermediate', 'Advanced'].map(opt => (
                    <MenuItem key={opt} value={opt} sx={{ color: '#000', fontWeight: 600 }}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Category" 
                value={course.category} 
                onChange={e => handleChange('category', e.target.value)} 
                fullWidth 
                margin="dense"
                sx={textFieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Sub Category" 
                value={course.subCategory} 
                onChange={e => handleChange('subCategory', e.target.value)} 
                fullWidth 
                margin="dense"
                sx={textFieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Language" 
                value={course.language} 
                onChange={e => handleChange('language', e.target.value)} 
                fullWidth 
                margin="dense"
                sx={textFieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense" sx={formControlSx}>
                <InputLabel>Status</InputLabel>
                <Select value={course.status} label="Status" onChange={e => handleChange('status', e.target.value)}>
                  {['Draft', 'Published', 'Archived'].map(opt => (
                    <MenuItem key={opt} value={opt} sx={{ color: '#000', fontWeight: 600 }}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense" sx={formControlSx}>
                <InputLabel>Professor</InputLabel>
                <Select
                  value={course.professor || ''}
                  label="Professor"
                  onChange={e => handleChange('professor', e.target.value)}
                  renderValue={selected => {
                    const prof = professors.find(p => p._id === selected);
                    return prof ? `${prof.name} (${prof.email})` : 'Select Professor';
                  }}
                  disabled={profLoading}
                >
                  {profLoading ? (
                    <MenuItem value=""><CircularProgress size={20} /> <span style={{ color: '#fff', marginLeft: 8 }}>Loading...</span></MenuItem>
                  ) : profError ? (
                    <MenuItem value=""><span style={{ color: '#ef4444' }}>{profError}</span></MenuItem>
                  ) : professors.length === 0 ? (
                    <MenuItem value=""><span style={{ color: '#fff' }}>No professors found</span></MenuItem>
                  ) : professors.map(prof => (
                    <MenuItem key={prof._id} value={prof._id} sx={{ color: '#000', fontWeight: 600 }}>{prof.name} ({prof.email})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Duration (e.g. 12h 30m)" 
                value={course.duration} 
                onChange={e => handleChange('duration', e.target.value)} 
                fullWidth 
                margin="dense"
                sx={textFieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Published At" 
                type="date" 
                value={course.publishedAt} 
                onChange={e => handleChange('publishedAt', e.target.value)} 
                fullWidth 
                margin="dense"
                InputLabelProps={{ shrink: true }}
                sx={textFieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Cover Image URL" 
                value={course.coverImage} 
                onChange={e => handleChange('coverImage', e.target.value)} 
                fullWidth 
                margin="dense"
                sx={textFieldSx}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Promo Video URL" 
                value={course.promoVideoUrl} 
                onChange={e => handleChange('promoVideoUrl', e.target.value)} 
                fullWidth 
                margin="dense"
                sx={textFieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={course.isFree} 
                    onChange={e => handleChange('isFree', e.target.checked)}
                    sx={{
                      color: '#a78bfa',
                      '&.Mui-checked': {
                        color: '#60a5fa'
                      }
                    }}
                  />
                } 
                label="Is Free?" 
                sx={{ 
                  ml: 1, 
                  mt: 1,
                  '& .MuiFormControlLabel-label': {
                    color: '#a78bfa',
                    fontWeight: 600
                  }
                }} 
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField 
                label="Average Rating" 
                type="number" 
                value={course.averageRating} 
                onChange={e => handleChange('averageRating', parseFloat(e.target.value))} 
                fullWidth 
                margin="dense" 
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                sx={textFieldSx}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField 
                label="Ratings Count" 
                type="number" 
                value={course.ratingsCount} 
                onChange={e => handleChange('ratingsCount', parseInt(e.target.value))} 
                fullWidth 
                margin="dense" 
                inputProps={{ min: 0 }}
                sx={textFieldSx}
              />
            </Grid>
            <Grid item xs={12}><Divider sx={{ my: 3, bgcolor: 'rgba(167,139,250,0.3)', height: 2 }} /></Grid>
            {/* Price Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                color: '#a78bfa',
                fontSize: '1.25rem',
                borderBottom: '1px solid rgba(167,139,250,0.3)',
                pb: 1
              }}>
                Pricing
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                label="Price Amount" 
                type="number" 
                value={course.price.amount} 
                onChange={e => handlePriceChange('amount', parseFloat(e.target.value))} 
                fullWidth 
                margin="dense" 
                inputProps={{ min: 0 }}
                sx={textFieldSx}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth margin="dense" sx={formControlSx}>
                <InputLabel>Currency</InputLabel>
                <Select value={course.price.currency} label="Currency" onChange={e => handlePriceChange('currency', e.target.value)}>
                  {['INR', 'USD', 'EUR'].map(opt => (
                    <MenuItem key={opt} value={opt} sx={{ color: '#000', fontWeight: 600 }}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField 
                label="Discount %" 
                type="number" 
                value={course.price.discountPercent} 
                onChange={e => handlePriceChange('discountPercent', parseInt(e.target.value))} 
                fullWidth 
                margin="dense" 
                inputProps={{ min: 0, max: 100 }}
                sx={textFieldSx}
              />
            </Grid>
            <Grid item xs={12}><Divider sx={{ my: 3, bgcolor: 'rgba(167,139,250,0.3)', height: 2 }} /></Grid>
            {/* Tags Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                color: '#a78bfa',
                fontSize: '1.25rem',
                borderBottom: '1px solid rgba(167,139,250,0.3)',
                pb: 1
              }}>
                Tags
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
                <TextField 
                  label="Add Tag" 
                  value={tagInput} 
                  onChange={e => setTagInput(e.target.value)} 
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} 
                  margin="dense"
                  sx={{
                    ...textFieldSx,
                    minWidth: 200,
                    maxWidth: 300
                  }}
                />
                <Button 
                  onClick={handleAddTag} 
                  variant="contained" 
                  sx={{ 
                    minWidth: 80, 
                    px: 3, 
                    py: 1.5, 
                    background: 'linear-gradient(90deg, #f472b6 0%, #a78bfa 100%)', 
                    color: '#fff', 
                    borderRadius: 2, 
                    boxShadow: '0 2px 8px #f472b655', 
                    fontWeight: 600,
                    '&:hover': { 
                      background: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px #f472b655'
                    } 
                  }}
                >
                  Add
                </Button>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flex: 1 }}>
                  {course.tags.map(tag => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      onDelete={() => handleRemoveTag(tag)} 
                      sx={{
                        background: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        '& .MuiChip-deleteIcon': {
                          color: '#fff',
                          '&:hover': {
                            color: '#fecaca'
                          }
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}><Divider sx={{ my: 3, bgcolor: 'rgba(167,139,250,0.3)', height: 2 }} /></Grid>
            {/* Modules Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                color: '#a78bfa',
                fontSize: '1.25rem',
                borderBottom: '1px solid rgba(167,139,250,0.3)',
                pb: 1
              }}>
                Modules
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box mt={1} mb={1} display="flex" alignItems="center" gap={1}>
                <IconButton onClick={handleAddModule} color="primary" sx={{ background: 'linear-gradient(90deg, #f472b6 0%, #a78bfa 100%)', color: '#fff', borderRadius: 2, boxShadow: '0 2px 8px #f472b655', '&:hover': { background: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)' } }}>
                  <AddCircleOutlineIcon />
                </IconButton>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#a78bfa' }}>Add Module</Typography>
              </Box>
            </Grid>
            {course.modules.map((mod, mIdx) => (
              <Accordion key={mIdx} sx={{ background: 'rgba(60, 30, 90, 0.85)' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, flex: 1, color: '#a78bfa' }}>{`Module ${mIdx + 1}`}</Typography>
                  <IconButton 
                    onClick={e => { e.stopPropagation(); handleRemoveModule(mIdx); }} 
                    color="error" 
                    size="small" 
                    sx={{ ml: 2 }}
                  >
                    <RemoveCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container direction="column" spacing={2}>
                    <Grid item xs={12}>
                      <TextField 
                        label="Module Title" 
                        value={mod.moduleTitle} 
                        onChange={e => handleModuleChange(mIdx, 'moduleTitle', e.target.value)} 
                        fullWidth 
                        required 
                        margin="dense" 
                        sx={textFieldSx}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        label="Module Description" 
                        value={mod.moduleDescription} 
                        onChange={e => handleModuleChange(mIdx, 'moduleDescription', e.target.value)} 
                        fullWidth 
                        margin="dense"
                        multiline
                        minRows={2}
                        maxRows={4}
                        sx={{
                          ...textFieldSx,
                          '& .MuiInputBase-input': {
                            ...textFieldSx['& .MuiInputBase-input'],
                            lineHeight: 1.6
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2, bgcolor: '#a78bfa' }} />
                    </Grid>
                    {/* Lessons Section */}
                    <Grid item xs={12}><Typography variant="h6" color="secondary" sx={{ fontWeight: 700, mb: 1 }}>Lessons</Typography></Grid>
                    <Grid item xs={12}>
                      <Box mt={1} mb={1} display="flex" alignItems="center" gap={1}>
                        <IconButton onClick={() => handleAddLesson(mIdx)} color="primary"
                          sx={{
                            background: 'linear-gradient(90deg, #f472b6 0%, #a78bfa 100%)',
                            color: '#fff',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px #f472b655',
                            '&:hover': {
                              background: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)'
                            }
                          }}>
                          <AddCircleOutlineIcon />
                        </IconButton>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#a78bfa' }}>Add Lesson</Typography>
                      </Box>
                    </Grid>
                    {mod.lessons && mod.lessons.map((les, lIdx) => (
                      <Accordion key={lIdx} sx={{ background: 'rgba(60, 30, 90, 0.85)' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, flex: 1, color: '#a78bfa' }}>{`Lesson ${lIdx + 1}`}</Typography>
                          <IconButton 
                            onClick={e => { e.stopPropagation(); handleRemoveLesson(mIdx, lIdx); }} 
                            color="error" 
                            size="small" 
                            sx={{ ml: 2 }}
                          >
                            <RemoveCircleOutlineIcon fontSize="small" />
                          </IconButton>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container direction="column" spacing={2}>
                            <Grid item xs={12}>
                              <TextField 
                                label="Lesson Title" 
                                value={les.title} 
                                onChange={e => handleLessonChange(mIdx, lIdx, 'title', e.target.value)} 
                                fullWidth 
                                required 
                                margin="dense" 
                                sx={textFieldSx}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField 
                                label="Lesson Summary" 
                                value={les.summary} 
                                onChange={e => handleLessonChange(mIdx, lIdx, 'summary', e.target.value)} 
                                fullWidth 
                                margin="dense"
                                multiline
                                minRows={2}
                                maxRows={4}
                                sx={{
                                  ...textFieldSx,
                                  '& .MuiInputBase-input': {
                                    ...textFieldSx['& .MuiInputBase-input'],
                                    lineHeight: 1.6
                                  }
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField 
                                label="Duration (min)" 
                                type="number" 
                                value={les.durationMinutes || ''} 
                                onChange={e => handleLessonChange(mIdx, lIdx, 'durationMinutes', parseInt(e.target.value))} 
                                margin="dense"
                                sx={{
                                  ...textFieldSx,
                                  width: 150
                                }}
                              />
                            </Grid>
                            {/* Topics Section */}
                            <Grid item xs={12}><Typography variant="h6" color="secondary" sx={{ fontWeight: 700, mb: 1 }}>Topics</Typography></Grid>
                            <Grid item xs={12}>
                              <Box mt={1} mb={1} display="flex" alignItems="center" gap={1}>
                                <IconButton 
                                  onClick={() => handleAddTopic(mIdx, lIdx)} 
                                  color="primary" 
                                  size="small" 
                                  sx={{ 
                                    background: 'linear-gradient(90deg, #f472b6 0%, #a78bfa 100%)', 
                                    color: '#fff', 
                                    borderRadius: 2, 
                                    boxShadow: '0 2px 8px #f472b655', 
                                    '&:hover': { background: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)' } 
                                  }}>
                                  <AddCircleOutlineIcon fontSize="small" />
                                </IconButton>
                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#a78bfa' }}>Add Topic</Typography>
                              </Box>
                            </Grid>
                            {les.topics && les.topics.map((top, tIdx) => (
                              <Accordion key={tIdx} sx={{ background: 'rgba(60, 30, 90, 0.85)' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography variant="body1" sx={{ fontWeight: 600, flex: 1, color: '#a78bfa' }}>{`Topic ${tIdx + 1}`}</Typography>
                                  <IconButton 
                                    onClick={e => { e.stopPropagation(); handleRemoveTopic(mIdx, lIdx, tIdx); }} 
                                    color="error" 
                                    size="small" 
                                    sx={{ ml: 2 }}
                                  >
                                    <RemoveCircleOutlineIcon fontSize="small" />
                                  </IconButton>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Grid container direction="column" spacing={2}>
                                    <Grid item xs={12}>
                                      <TextField 
                                        label="Topic Title" 
                                        value={top.title} 
                                        onChange={e => handleTopicChange(mIdx, lIdx, tIdx, 'title', e.target.value)} 
                                        fullWidth 
                                        required 
                                        margin="dense" 
                                        sx={textFieldSx}
                                      />
                                    </Grid>
                                    <Grid item xs={12}>
                                      <TextField 
                                        label="Topic Description" 
                                        value={top.description} 
                                        onChange={e => handleTopicChange(mIdx, lIdx, tIdx, 'description', e.target.value)} 
                                        fullWidth 
                                        margin="dense"
                                        multiline
                                        minRows={2}
                                        maxRows={4}
                                        sx={{
                                          ...textFieldSx,
                                          '& .MuiInputBase-input': {
                                            ...textFieldSx['& .MuiInputBase-input'],
                                            lineHeight: 1.6
                                          }
                                        }}
                                      />
                                    </Grid>
                                    <Grid item xs={12}>
                                      <TextField 
                                        label="Video URL" 
                                        value={top.videoUrl} 
                                        onChange={e => handleTopicChange(mIdx, lIdx, tIdx, 'videoUrl', e.target.value)} 
                                        fullWidth 
                                        margin="dense"
                                        sx={textFieldSx}
                                      />
                                    </Grid>
                                    <Grid item xs={12}>
                                      <IconButton 
                                        onClick={() => handleRemoveTopic(mIdx, lIdx, tIdx)} 
                                        color="error" 
                                        size="small" 
                                        sx={{ 
                                          background: 'linear-gradient(90deg, #f472b6 0%, #a78bfa 100%)', 
                                          color: '#fff', 
                                          borderRadius: 2, 
                                          boxShadow: '0 2px 8px #f472b655', 
                                          '&:hover': { background: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)' } 
                                        }}>
                                        <RemoveCircleOutlineIcon fontSize="small" />
                                      </IconButton>
                                    </Grid>
                                    {/* SubTopics Section */}
                                    <Grid item xs={12}><Typography variant="h6" color="secondary" sx={{ fontWeight: 700, mb: 1 }}>SubTopics</Typography></Grid>
                                    <Grid item xs={12}>
                                      <Box mt={1} mb={1} display="flex" alignItems="center" gap={1}>
                                        <IconButton 
                                          onClick={() => handleAddSubTopic(mIdx, lIdx, tIdx)} 
                                          color="primary" 
                                          size="small" 
                                          sx={{ 
                                            background: 'linear-gradient(90deg, #f472b6 0%, #a78bfa 100%)', 
                                            color: '#fff', 
                                            borderRadius: 2, 
                                            boxShadow: '0 2px 8px #f472b655', 
                                            '&:hover': { background: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)' } 
                                          }}>
                                          <AddCircleOutlineIcon fontSize="small" />
                                        </IconButton>
                                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#a78bfa' }}>Add SubTopic</Typography>
                                      </Box>
                                    </Grid>
                                    {top.subTopics && top.subTopics.map((sub, sIdx) => (
                                      <Accordion key={sIdx} sx={{ background: 'rgba(60, 30, 90, 0.85)' }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                          <Typography variant="body1" sx={{ fontWeight: 600, flex: 1, color: '#a78bfa' }}>{`Subtopic ${sIdx + 1}`}</Typography>
                                          <IconButton 
                                            onClick={e => { e.stopPropagation(); handleRemoveSubTopic(mIdx, lIdx, tIdx, sIdx); }} 
                                            color="error" 
                                            size="small" 
                                            sx={{ ml: 2 }}
                                          >
                                            <RemoveCircleOutlineIcon fontSize="small" />
                                          </IconButton>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                          <Grid container direction="column" spacing={2}>
                                            <Grid item xs={12}>
                                              <TextField 
                                                label="SubTopic Title" 
                                                value={sub.title} 
                                                onChange={e => handleSubTopicChange(mIdx, lIdx, tIdx, sIdx, 'title', e.target.value)} 
                                                fullWidth 
                                                required 
                                                margin="dense" 
                                                sx={textFieldSx}
                                              />
                                            </Grid>
                                            <Grid item xs={12}>
                                              <TextField 
                                                label="SubTopic Content" 
                                                value={sub.content} 
                                                onChange={e => handleSubTopicChange(mIdx, lIdx, tIdx, sIdx, 'content', e.target.value)} 
                                                fullWidth 
                                                margin="dense"
                                                multiline
                                                minRows={2}
                                                maxRows={4}
                                                sx={{
                                                  ...textFieldSx,
                                                  '& .MuiInputBase-input': {
                                                    ...textFieldSx['& .MuiInputBase-input'],
                                                    lineHeight: 1.6
                                                  }
                                                }}
                                              />
                                            </Grid>
                                            <Grid item xs={12}>
                                              <TextField 
                                                label="Video URL" 
                                                value={sub.videoUrl} 
                                                onChange={e => handleSubTopicChange(mIdx, lIdx, tIdx, sIdx, 'videoUrl', e.target.value)} 
                                                fullWidth 
                                                margin="dense"
                                                sx={textFieldSx}
                                              />
                                              <IconButton 
                                                onClick={() => handleRemoveSubTopic(mIdx, lIdx, tIdx, sIdx)} 
                                                color="error" 
                                                size="small" 
                                                sx={{ 
                                                  background: 'linear-gradient(90deg, #f472b6 0%, #a78bfa 100%)', 
                                                  color: '#fff', 
                                                  borderRadius: 2, 
                                                  boxShadow: '0 2px 8px #f472b655', 
                                                  '&:hover': { background: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)' } 
                                                }}>
                                                <RemoveCircleOutlineIcon fontSize="small" />
                                              </IconButton>
                                            </Grid>
                                          </Grid>
                                        </AccordionDetails>
                                      </Accordion>
                                    ))}
                                  </Grid>
                                </AccordionDetails>
                              </Accordion>
                            ))}
                          </Grid>
                          {/* Quiz Section */}
                          <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#a78bfa' }}>
                              Quiz
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <FormControlLabel control={<Checkbox checked={!!les.quizIncluded} onChange={e => handleQuizIncludedChange(mIdx, lIdx, e.target.checked)} />} label="Quiz Included" />
                            {les.quizIncluded && (
                              <Box>
                                <Typography variant="body2" sx={{ color: '#a78bfa' }}>Quiz Questions</Typography>
                                <IconButton
                                  onClick={() => handleAddQuizQuestion(mIdx, lIdx)}
                                  color="primary" size="small"
                                  sx={{
                                    background: 'linear-gradient(90deg, #f472b6 0%, #a78bfa 100%)',
                                    color: '#fff',
                                    borderRadius: 2,
                                    boxShadow: '0 2px 8px #f472b655',
                                    '&:hover': {
                                      background: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)'
                                    }
                                  }}>
                                  <AddCircleOutlineIcon fontSize="small" />
                                </IconButton>
                                {les.quizQuestions && les.quizQuestions.map((q, qIdx) => (
                                  <Accordion key={qIdx} sx={{ background: 'rgba(60, 30, 90, 0.85)' }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <Typography variant="body1" sx={{ fontWeight: 600, flex: 1, color: '#a78bfa' }}>{`Quiz Question ${qIdx + 1}`}</Typography>
                                      <IconButton 
                                        onClick={e => { e.stopPropagation(); handleRemoveQuizQuestion(mIdx, lIdx, qIdx); }} 
                                        color="error" 
                                        size="small" 
                                        sx={{ ml: 2 }}
                                      >
                                        <RemoveCircleOutlineIcon fontSize="small" />
                                      </IconButton>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      <Grid container direction="column" spacing={1}>
                                        <Grid item xs={12}>
                                          <TextField 
                                            label="Quiz Question" 
                                            value={q.question} 
                                            onChange={e => handleQuizQuestionChange(mIdx, lIdx, qIdx, 'question', e.target.value)} 
                                            fullWidth 
                                            margin="dense"
                                            sx={textFieldSx}
                                          />
                                        </Grid>
                                        <Grid item xs={12}>
                                          <TextField 
                                            label="Answer" 
                                            value={q.answer} 
                                            onChange={e => handleQuizQuestionChange(mIdx, lIdx, qIdx, 'answer', e.target.value)} 
                                            fullWidth 
                                            margin="dense"
                                            sx={textFieldSx}
                                          />
                                        </Grid>
                                        <Grid item xs={12}>
                                          <Typography variant="body2" color="primary">Options</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                          {q.options && q.options.map((opt, oIdx) => (
                                            <Box key={oIdx} mb={1} p={1} borderRadius={1} boxShadow={0}>
                                              <TextField 
                                                label={`Option ${oIdx + 1}`} 
                                                name={`Option ${oIdx + 1}`} 
                                                value={opt} 
                                                onChange={e => handleQuizOptionChange(mIdx, lIdx, qIdx, oIdx, e.target.value)} 
                                                fullWidth 
                                                margin="dense"
                                                sx={textFieldSx}
                                              />
                                            </Box>
                                          ))}
                                        </Grid>
                                        <Grid item xs={12}>
                                          <IconButton 
                                            onClick={() => handleRemoveQuizQuestion(mIdx, lIdx, qIdx)} 
                                            color="error" 
                                            size="small"
                                            sx={{
                                              background: 'linear-gradient(90deg, #f472b6 0%, #a78bfa 100%)',
                                              color: '#fff',
                                              borderRadius: 2,
                                              boxShadow: '0 2px 8px #f472b655',
                                              '&:hover': {
                                                background: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)'
                                              }
                                            }}>
                                            <RemoveCircleOutlineIcon fontSize="small" />
                                          </IconButton>
                                        </Grid>
                                      </Grid>
                                    </AccordionDetails>
                                  </Accordion>
                                ))}
                              </Box>
                            )}
                          </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>
      </form>
      <Box mt={4} display="flex" justifyContent="flex-end" gap={2} sx={{ 
        borderTop: '2px solid rgba(167,139,250,0.3)', 
        pt: 3, 
        px: { xs: 3, md: 4 },
        pb: 2
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            px: 4, 
            py: 1.5,
            background: 'transparent',
            color: '#a78bfa',
            border: '2px solid #a78bfa',
            boxShadow: '0 2px 8px rgba(167,139,250,0.2)',
            minWidth: 120,
            height: 48,
            fontSize: 16,
            letterSpacing: 1,
            transition: 'all 0.3s ease',
            '&:hover': { 
              background: 'rgba(167,139,250,0.1)', 
              borderColor: '#60a5fa',
              color: '#60a5fa',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(167,139,250,0.3)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="course-form"
          variant="contained"
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            px: 5, 
            py: 1.5,
            background: 'linear-gradient(90deg, #f472b6 0%, #a78bfa 100%)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(244,114,182,0.4)',
            minWidth: 140,
            height: 48,
            border: 'none',
            fontSize: 16,
            letterSpacing: 1,
            transition: 'all 0.3s ease',
            '&:hover': { 
              background: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)', 
              color: '#fff',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 25px rgba(244,114,182,0.5)'
            }
          }}
        >
          {mode === 'edit' ? 'Update Course' : 'Create Course'}
        </Button>
      </Box>
    </DialogContent>
  </Dialog>
);
}

export default CourseModal; 