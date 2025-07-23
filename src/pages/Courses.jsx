import React, { useEffect, useState } from 'react';
import BaseUrl from '../Api';
import {
  Search as SearchIcon,
  Add as AddIcon,
  School as SchoolIcon,
  FilterList as FilterListIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  MonetizationOn as MonetizationOnIcon,
  Close as CloseIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import ReactDOM from 'react-dom';
import CircularProgress from '@mui/material/CircularProgress';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, InputLabel, FormControl, Checkbox, FormControlLabel, IconButton, Typography, Box } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useNavigate } from 'react-router-dom';
import CourseModal from '../components/CourseModal';
import CourseDetails from './CourseDetails';

const categoryOptions = [
  'Web Development', 'Data Science', 'AI/ML', 'Cloud', 'DevOps', 'UI/UX', 'Soft Skills', 'Management', 'Language', 'Other'
];
const levelOptions = ['Beginner', 'Intermediate', 'Advanced'];
const typeOptions = ['Technical', 'Soft Skills', 'Management', 'Creative', 'Language', 'Other'];
const statusOptions = ['Draft', 'Published', 'Archived'];

const Courses = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ category: '', level: '' });
  const isLoggedIn = !!user;
  const isAdmin = user && user.role === 'admin';
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteDialogCourse, setDeleteDialogCourse] = useState(null);

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BaseUrl}/courses`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Filtered and searched courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter.category ? course.category === filter.category : true;
    const matchesLevel = filter.level ? course.level === filter.level : true;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Toast
  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast.info(message);
  };

  // Add Course handler
  const handleAddCourse = () => {
    setSelectedCourse(null);
    setModalMode('add');
    setModalOpen(true);
  };

  // Edit Course handler
  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setModalMode('edit');
    setModalOpen(true);
  };

  // Submit handler for modal
  const handleModalSubmit = async (courseData) => {
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      let res, data;
      if (modalMode === 'add') {
        res = await fetch(`${BaseUrl}/courses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(courseData)
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create course');
        setModalOpen(false);
        await fetchCourses();
        showToast('Course created successfully!', 'success');
      } else {
        // Remove _id before sending to backend
        const { _id, ...courseDataWithoutId } = courseData;
        res = await fetch(`${BaseUrl}/courses/${selectedCourse._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(courseDataWithoutId)
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update course');
        setModalOpen(false);
        await fetchCourses();
        showToast('Course updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    if (!course) return;
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BaseUrl}/courses/${course._id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to delete course');
      showToast('Course deleted successfully!', 'success');
      setDeleteDialogCourse(null);
      fetchCourses();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Main render
  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-white/10 flex items-center gap-6">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg">
          <SchoolIcon className="text-white text-4xl drop-shadow-lg" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">Courses</h1>
          <p className="text-lg text-purple-100/80 mt-2">Explore, learn, and create new courses!</p>
        </div>
        <div className="ml-auto">
          {isAdmin && (
            <button
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 text-lg"
              onClick={handleAddCourse}
            >
              <AddIcon /> Add Course
            </button>
          )}
        </div>
      </div>
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search courses, topics..."
              className="w-full py-3 pl-12 pr-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-white placeholder-purple-200/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40 shadow-lg"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative min-w-[160px]">
            <select
              className="appearance-none w-full py-3 px-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40 shadow-lg custom-select"
              value={filter.category}
              onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              {typeOptions.map(opt => <option key={opt} value={opt} className="text-black bg-white hover:bg-purple-100">{opt}</option>)}
            </select>
            <FilterListIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none" />
          </div>
          <div className="relative min-w-[140px]">
            <select
              className="appearance-none w-full py-3 px-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40 shadow-lg custom-select"
              value={filter.level}
              onChange={e => setFilter(f => ({ ...f, level: e.target.value }))}
            >
              <option value="">All Levels</option>
              {levelOptions.map(opt => <option key={opt} value={opt} className="text-black bg-white hover:bg-purple-100">{opt}</option>)}
            </select>
            <FilterListIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none" />
          </div>
        </div>
      </div>
      <style>{`
        select.custom-select option {
          color: #111 !important;
          background: #fff !important;
        }
        select.custom-select option:hover, select.custom-select option:focus, select.custom-select:focus option {
          background: #f3e8ff !important;
          color: #111 !important;
        }
      `}</style>
      {/* Courses List */}
      <div className="flex flex-col gap-5 w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64 w-full">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 font-bold py-10 w-full">{error}</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 w-full">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <SchoolIcon className="text-4xl text-purple-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Courses Found</h3>
            <p className="text-purple-200/80">Try adjusting your search or filters.</p>
          </div>
        ) : filteredCourses.map(course => (
          <div
            key={course._id}
            className="group w-full rounded-xl shadow-xl bg-gradient-to-br from-[#312e81]/95 to-[#0a081e]/95 border border-white/20 overflow-hidden flex flex-row items-stretch hover:scale-[1.01] transition-all duration-300 cursor-pointer relative min-h-[130px]"
            onClick={() => navigate(`/courses/${course._id}`)}
            style={{ height: 'auto', minHeight: 'unset', alignItems: 'stretch' }}
          >
            {/* Left: Main Content */}
            <div className="flex flex-col flex-1 p-4 gap-3 justify-center min-w-0">
              <h3 className="font-extrabold text-xl text-white leading-7 drop-shadow-lg group-hover:text-purple-200 transition-colors duration-300 truncate">
                {course.title}
              </h3>
              <div className="text-purple-200 text-base leading-7 mb-1 truncate">
                {course.description}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 leading-7">
                <div className="flex items-center gap-1 text-base text-blue-200">
                  <AccessTimeIcon className="text-blue-300" fontSize="medium" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1 text-base text-yellow-200">
                  <StarIcon className="text-yellow-400" fontSize="medium" />
                  <span className="font-semibold">{course.averageRating}</span>
                  <span className="text-purple-300 text-sm">({course.ratingsCount})</span>
                </div>
                {course.tags && course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 ml-2">
                    {course.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="bg-purple-700/40 text-purple-200 px-2 py-0.5 rounded-full text-sm">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Right: Icons, Price, and Learn More */}
            <div className="flex flex-col items-end justify-between p-4 min-w-[150px] max-w-[200px] h-full">
              <div className="flex flex-row items-center gap-2 mb-2">
                {isAdmin && (
                  <>
                    <IconButton
                      style={{
                        background: 'linear-gradient(135deg, #f472b6 0%, #a78bfa 100%)', // matches Add Course button
                        color: '#fff',
                        borderRadius: '50%',
                        boxShadow: '0 2px 8px #f472b655',
                        width: 36,
                        height: 36,
                        marginRight: 2,
                        padding: 0
                      }}
                      onClick={e => { e.stopPropagation(); handleEditCourse(course); }}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      style={{
                        background: 'linear-gradient(90deg, #f472b6 0%, #a78bfa 100%)', // matches Add Course button
                        color: '#fff',
                        borderRadius: '50%',
                        boxShadow: '0 2px 8px #a78bfa55',
                        width: 36,
                        height: 36,
                        padding: 0
                      }}
                      onClick={e => { e.stopPropagation(); setDeleteDialogCourse(course); }}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </div>
              <div className="flex flex-col items-end mt-2 w-full">
                <div className="flex items-center text-xl font-bold text-purple-200 leading-7">
                  {course.isFree ? 'Free' : `₹${course.price.amount}`}
                  {course.price.discountPercent > 0 && !course.isFree && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-900/40 text-purple-200 rounded-full border border-white/10 font-semibold text-base">{course.price.discountPercent}% OFF</span>
                  )}
                </div>
                {/* Learn More link moved here */}
                <a
                  href={"/courses/" + course._id}
                  className="inline-flex items-center gap-1 text-purple-200 font-bold hover:text-pink-400 transition-colors text-base leading-7 mt-3 justify-end w-full"
                  style={{ fontSize: '1.15rem', lineHeight: '2rem' }}
                  onClick={e => { e.preventDefault(); navigate(`/courses/${course._id}`); }}
                >
                  Learn More <ArrowForwardIosIcon style={{ fontSize: 20 }} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      <CourseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={modalMode === 'edit' ? selectedCourse : null}
        mode={modalMode}
      />
      {/* Delete Confirmation Dialog */}
      {isAdmin && deleteDialogCourse && (
        // Custom Delete Modal (like Events page)
        typeof document !== 'undefined' && document.getElementById('modal-root') &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
            <div className="bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl shadow-2xl border border-white/10 p-8 max-w-sm w-full">
              <h2 className="text-xl font-bold text-white mb-4">Confirm Delete</h2>
              <p className="text-purple-200 mb-6">Are you sure you want to delete the course <span className="font-bold text-pink-300">{deleteDialogCourse?.title}</span>?</p>
              <div className="flex justify-end gap-3">
                <button className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300" onClick={() => setDeleteDialogCourse(null)}>Cancel</button>
                <button className="px-7 py-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed" onClick={() => handleDeleteCourse(deleteDialogCourse)} disabled={modalLoading}>{modalLoading ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>,
          document.getElementById('modal-root')
        )
      )}
    </div>
  );
};

export default Courses; 
