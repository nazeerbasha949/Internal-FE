import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BaseUrl from '../Api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Accordion, AccordionSummary, AccordionDetails, Button, CircularProgress, Typography, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    amountPaid: course?.price?.amount || '',
    paymentMethod: 'Razorpay',
    transactionId: '',
    paymentStatus: 'Success',
    receiptUrl: ''
  });

  const paymentMethods = ['Razorpay', 'Stripe', 'PayPal', 'Other'];
  const paymentStatuses = ['Success', 'Pending', 'Failed'];

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BaseUrl}/courses/${courseId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('Failed to fetch course');
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    setEnrollForm(f => ({ ...f, amountPaid: course?.price?.amount || '' }));
  }, [course]);

  const handleEnrollFieldChange = (e) => {
    const { name, value } = e.target;
    setEnrollForm(f => ({ ...f, [name]: value }));
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setEnrolling(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const payload = {
        userId: user?._id,
        courseId: course._id,
        amountPaid: Number(enrollForm.amountPaid),
        paymentMethod: enrollForm.paymentMethod,
        transactionId: enrollForm.transactionId,
        paymentStatus: enrollForm.paymentStatus,
        receiptUrl: enrollForm.receiptUrl
      };
      const token = localStorage.getItem('token');
      const res = await fetch(`${BaseUrl}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to enroll');
      toast.success('Enrolled successfully!');
      setEnrollModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-96"><CircularProgress /></div>;
  if (!course) return <div className="text-center text-red-400 font-bold py-10 w-full">Course not found.</div>;

  return (
    <div className="min-h-screen px-0 pt-2 md:pt-4 flex flex-col items-center">
      <div className="w-full mt-2">
        <div className="flex items-center mb-6">
          <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{ color: '#fff', fontWeight: 700, fontSize: 18, textTransform: 'none', background: 'rgba(168,139,250,0.15)', borderRadius: 2, px: 2, py: 1, minWidth: 0, mr: 0, boxShadow: 'none', '&:hover': { background: 'rgba(236,72,153,0.15)' } }} />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left: Image */}
          <div className="flex-shrink-0 w-full md:w-1/3 flex flex-col items-center">
            <img src={course.coverImage} alt={course.title} className="rounded-2xl shadow-lg w-full object-cover mb-4" style={{ maxHeight: 220 }} />
          </div>
          {/* Right: Details */}
          <div className="flex-1 flex flex-col gap-4 justify-between" style={{ lineHeight: 2 }}>
            <div>
              <h2 className="text-2xl font-bold text-white mb-3" style={{ lineHeight: 1.6 }}>{course.title}</h2>
              <p className="text-purple-200 mb-4 w-full" style={{ lineHeight: 2.1 }}>{course.description}</p>
              <div className="flex flex-wrap gap-4 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-br from-blue-400/80 to-purple-400/80 text-white shadow border border-white/20">{course.type}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-br from-pink-400/80 to-purple-400/80 text-white shadow border border-white/20">{course.level}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-br from-yellow-400/80 to-pink-400/80 text-white shadow border border-white/20">{course.language}</span>
              </div>
              <div className="flex items-center gap-5 mb-4 flex-wrap">
                <span className="text-yellow-400 font-bold text-lg">★ {course.averageRating}</span>
                <span className="text-purple-200 text-sm">({course.ratingsCount} ratings)</span>
                <span className="text-purple-100 text-sm font-semibold">Duration: {course.duration}</span>
              </div>
              <div className="flex flex-wrap gap-3 mb-4">
                {course.tags && course.tags.map((tag, idx) => (
                  <span key={idx} className="bg-purple-700/40 text-purple-200 px-2 py-0.5 rounded-full text-base font-semibold">#{tag}</span>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-pink-300 font-bold text-2xl">{course.isFree ? 'Free' : `₹${course.price?.amount}`}</span>
                {course.price?.discountPercent > 0 && !course.isFree && (
                  <span className="ml-2 px-2 py-0.5 bg-purple-900/40 text-purple-200 rounded-full border border-white/10 font-semibold text-xs">{course.price.discountPercent}% OFF</span>
                )}
              </div>
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setEnrollModalOpen(true)}
              sx={{
                background: 'linear-gradient(to right, #f472b6, #a78bfa)',
                color: '#fff',
                fontWeight: 700,
                borderRadius: 2,
                fontSize: 15,
                px: 1.5,
                py: 0.7,
                width: 150,
                minWidth: 70,
                mt: 1,
                boxShadow: '0 4px 24px 0 rgba(168,139,250,0.15)',
                '&:hover': { background: 'linear-gradient(to right, #a78bfa, #f472b6)' }
              }}
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </Button>
          </div>
        </div>
        {/* Curriculum Accordions */}
        <div className="mt-8 w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Course Curriculum</h2>
          {course.modules && course.modules.length > 0 ? (
            course.modules.map((mod, mIdx) => (
              <Accordion key={mIdx} sx={{ width: '100%', background: 'rgba(88,28,135,0.15)', color: '#fff', borderRadius: 2, mb: 2, boxShadow: 'none', border: '1px solid #a78bfa33' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                  <Typography sx={{ fontWeight: 700 }}>{mod.moduleTitle}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ mb: 1, color: '#d1b3ff', lineHeight: 1.8 }}>{mod.moduleDescription}</Typography>
                  {mod.lessons && mod.lessons.length > 0 ? (
                    mod.lessons.map((lesson, lIdx) => (
                      <Box key={lIdx} sx={{ mb: 2, pl: 2 }}>
                        <Typography sx={{ fontWeight: 600, color: '#fff', lineHeight: 1.7 }}>{lesson.title}</Typography>
                        <Typography sx={{ color: '#bdb4e6', mb: 1, lineHeight: 1.7 }}>{lesson.summary}</Typography>
                        {lesson.topics && lesson.topics.length > 0 && (
                          <ul className="list-disc ml-6">
                            {lesson.topics.map((topic, tIdx) => (
                              <li key={tIdx} className="mb-1" style={{ lineHeight: 1.7 }}>
                                <span className="font-semibold text-purple-200">{topic.title}</span>: <span className="text-purple-100">{topic.description}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Box>
                    ))
                  ) : <Typography sx={{ color: '#bdb4e6' }}>No lessons in this module.</Typography>}
                </AccordionDetails>
              </Accordion>
            ))
          ) : <Typography sx={{ color: '#bdb4e6' }}>No modules found.</Typography>}
        </div>
      </div>
      {/* Enroll Modal */}
      <Dialog open={enrollModalOpen} onClose={() => setEnrollModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #2d225a 80%, #a78bfa 100%)',
          boxShadow: '0 8px 32px 0 rgba(168,139,250,0.25)',
          border: '1.5px solid #f472b6',
          color: '#fff',
        }
      }}>
        <div className="h-2 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-2xl mb-2" />
        <DialogTitle sx={{ color: '#fff', fontWeight: 700, fontSize: 22, pb: 1 }}>Enroll in Course</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <form onSubmit={handleEnrollSubmit} className="flex flex-col gap-4 mt-2">
            <TextField
              label="Amount Paid"
              name="amountPaid"
              value={enrollForm.amountPaid}
              onChange={handleEnrollFieldChange}
              type="number"
              fullWidth
              required
              InputLabelProps={{ style: { color: '#d1b3ff', fontWeight: 600 } }}
              inputProps={{ style: { background: 'rgba(88,28,135,0.25)', color: '#fff', borderRadius: 8 } }}
              sx={{ input: { background: 'rgba(88,28,135,0.25)', color: '#fff', borderRadius: 2 }, label: { color: '#d1b3ff' } }}
            />
            <TextField
              select
              label="Payment Method"
              name="paymentMethod"
              value={enrollForm.paymentMethod}
              onChange={handleEnrollFieldChange}
              fullWidth
              required
              InputLabelProps={{ style: { color: '#d1b3ff', fontWeight: 600 } }}
              sx={{ background: 'rgba(88,28,135,0.25)', color: '#fff', borderRadius: 2, label: { color: '#d1b3ff' } }}
              SelectProps={{ MenuProps: { PaperProps: { sx: { background: '#2d225a', color: '#fff' } } } }}
            >
              {paymentMethods.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <TextField
              label="Transaction ID"
              name="transactionId"
              value={enrollForm.transactionId}
              onChange={handleEnrollFieldChange}
              fullWidth
              required
              InputLabelProps={{ style: { color: '#d1b3ff', fontWeight: 600 } }}
              inputProps={{ style: { background: 'rgba(88,28,135,0.25)', color: '#fff', borderRadius: 8 } }}
              sx={{ input: { background: 'rgba(88,28,135,0.25)', color: '#fff', borderRadius: 2 }, label: { color: '#d1b3ff' } }}
            />
            <TextField
              select
              label="Payment Status"
              name="paymentStatus"
              value={enrollForm.paymentStatus}
              onChange={handleEnrollFieldChange}
              fullWidth
              required
              InputLabelProps={{ style: { color: '#d1b3ff', fontWeight: 600 } }}
              sx={{ background: 'rgba(88,28,135,0.25)', color: '#fff', borderRadius: 2, label: { color: '#d1b3ff' } }}
              SelectProps={{ MenuProps: { PaperProps: { sx: { background: '#2d225a', color: '#fff' } } } }}
            >
              {paymentStatuses.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <TextField
              label="Receipt URL"
              name="receiptUrl"
              value={enrollForm.receiptUrl}
              onChange={handleEnrollFieldChange}
              fullWidth
              required
              InputLabelProps={{ style: { color: '#d1b3ff', fontWeight: 600 } }}
              inputProps={{ style: { background: 'rgba(88,28,135,0.25)', color: '#fff', borderRadius: 8 } }}
              sx={{ input: { background: 'rgba(88,28,135,0.25)', color: '#fff', borderRadius: 2 }, label: { color: '#d1b3ff' } }}
            />
            <DialogActions sx={{ justifyContent: 'flex-end', gap: 2, mt: 1 }}>
              <Button onClick={() => setEnrollModalOpen(false)} sx={{ background: 'linear-gradient(to right, #a78bfa, #f472b6)', color: '#fff', fontWeight: 700, borderRadius: 2, px: 3, py: 1, '&:hover': { background: 'linear-gradient(to right, #f472b6, #a78bfa)' } }}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={enrolling} sx={{ background: 'linear-gradient(to right, #f472b6, #a78bfa)', color: '#fff', fontWeight: 700, borderRadius: 2, px: 3, py: 1, '&:hover': { background: 'linear-gradient(to right, #a78bfa, #f472b6)' } }}>{enrolling ? 'Enrolling...' : 'Enroll'}</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetails; 