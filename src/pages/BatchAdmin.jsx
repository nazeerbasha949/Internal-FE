import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { TrendingUp, Group, School, Person, CalendarToday, Quiz, Add, Search, Visibility, Edit, Delete, BarChart} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import BaseUrl from '../Api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';

const getToken = () => localStorage.getItem('token');

function getBatchStatus(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return { label: 'Upcoming', color: 'bg-blue-500/80', text: 'text-blue-100' };
    if (now > end) return { label: 'Completed', color: 'bg-green-500/80', text: 'text-green-100' };
    return { label: 'Active', color: 'bg-pink-500/80', text: 'text-pink-100' };
}

const initialForm = {
    batchName: '',
    course: '',
    users: [],
    professor: '',
    startDate: '',
    endDate: '',
};

const BatchAdmin = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [form, setForm] = useState(initialForm);
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    // Add state for view modal
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewBatch, setViewBatch] = useState(null);

    // New state for fetched data
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [professors, setProfessors] = useState([]);
    const [fetchingDropdowns, setFetchingDropdowns] = useState(true);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [availableUsersLoading, setAvailableUsersLoading] = useState(false);
    const [editUserBreakdown, setEditUserBreakdown] = useState({ assigned: [], available: [] });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const batchesPerPage = 6;

    // Filtered batches
    const filteredBatches = batches.filter(batch => {
      const s = search.trim().toLowerCase();
      if (!s) return true;
      // Defensive: support both string and object for course/professor
      let batchName = (batch.batchName || '').toLowerCase();
      let courseTitle = '';
      if (typeof batch.course === 'string') {
        courseTitle = batch.course.toLowerCase();
      } else if (batch.course && batch.course.title) {
        courseTitle = batch.course.title.toLowerCase();
      }
      let professorName = '';
      if (typeof batch.professor === 'string') {
        professorName = batch.professor.toLowerCase();
      } else if (batch.professor && batch.professor.name) {
        professorName = batch.professor.name.toLowerCase();
      }
      return (
        batchName.includes(s) ||
        courseTitle.includes(s) ||
        professorName.includes(s)
      );
    });

    const totalPages = Math.ceil(filteredBatches.length / batchesPerPage);
    const paginatedBatches = filteredBatches.slice((currentPage - 1) * batchesPerPage, currentPage * batchesPerPage);

    // Fetch all batches
    const fetchBatches = async () => {
        setLoading(true);
        setError('');
        try {
            const token = getToken();
            const res = await axios.get(`${BaseUrl}/batches`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBatches(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch batches');
        } finally {
            setLoading(false);
        }
    };

    // Fetch dropdown data on mount
    useEffect(() => {
      const fetchDropdowns = async () => {
        setFetchingDropdowns(true);
        try {
          const token = getToken();
          const [coursesRes, usersRes, profsRes] = await Promise.all([
            axios.get(`${BaseUrl}/courses`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${BaseUrl}/users`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${BaseUrl}/professors`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          setCourses(coursesRes.data);
          setUsers(usersRes.data.filter(u => u.role === 'intern'));
          setProfessors(profsRes.data);
        } catch (err) {
          toast.error('Failed to fetch dropdown data');
        } finally {
          setFetchingDropdowns(false);
        }
      };
      fetchDropdowns();
    }, []);

    useEffect(() => {
        fetchBatches();
    }, []);

    // Fetch available users for selected course (create) or user breakdown (edit)
    useEffect(() => {
      if (!form.course) {
        setAvailableUsers([]);
        setEditUserBreakdown({ assigned: [], available: [] });
        return;
      }
      const fetchUsers = async () => {
        setAvailableUsersLoading(true);
        try {
          const token = getToken();
          if (modalMode === 'edit' && selectedBatchId) {
            // Edit mode: fetch user breakdown
            const res = await axios.get(
              `${BaseUrl}/batches/user-breakdown/${form.course}/${selectedBatchId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const assigned = res.data.breakdown.assignedToThisBatch.users || [];
            const available = res.data.breakdown.availableUsers.users || [];
            setEditUserBreakdown({ assigned, available });
          } else {
            // Create mode: fetch available users
            const res = await axios.get(
              `${BaseUrl}/batches/available-users/${form.course}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setAvailableUsers(res.data.users || []);
          }
        } catch (err) {
          setAvailableUsers([]);
          setEditUserBreakdown({ assigned: [], available: [] });
          toast.error('Failed to fetch users for this course');
        } finally {
          setAvailableUsersLoading(false);
        }
      };
      fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.course, modalMode, selectedBatchId]);

    // Modal close on ESC or background click
    useEffect(() => {
        if (!modalOpen) return;
        const handleKey = (e) => { if (e.key === 'Escape') setModalOpen(false); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [modalOpen]);

    // Open modal for create
    const openCreateModal = () => {
        setForm(initialForm);
        setModalMode('create');
        setModalOpen(true);
        setSelectedBatchId(null);
    };

    // Open modal for edit
    const openEditModal = async (batchId) => {
        setModalLoading(true);
        setModalMode('edit');
        setModalOpen(true);
        setSelectedBatchId(batchId);
        try {
            const token = getToken();
            const res = await axios.get(`${BaseUrl}/batches/${batchId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const batch = res.data;
            setForm({
                batchName: batch.batchName || '',
                course: batch.course?.id || '',
                users: batch.users?.map(u => u.userId) || [],
                professor: batch.professor?._id || '',
                startDate: batch.startDate ? batch.startDate.slice(0, 10) : '',
                endDate: batch.endDate ? batch.endDate.slice(0, 10) : '',
                progressUpdates: batch.progressUpdates || [],
                isCourseCompleted: typeof batch.courseCompleted === 'boolean' ? batch.courseCompleted : false,
            });
        } catch (err) {
            toast.error('Failed to fetch batch details');
            setModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };

    // Handler to open view modal
    const openViewModal = (batch) => {
        setViewBatch(batch);
        setViewModalOpen(true);
    };
    // Handler to close view modal
    const closeViewModal = () => {
        setViewModalOpen(false);
        setViewBatch(null);
    };

    // Handle form change
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Handle users (comma separated for demo)
    const handleUsersChange = (e) => {
        setForm((prev) => ({ ...prev, users: e.target.value.split(',').map(u => u.trim()) }));
    };

    // Create batch
    const handleCreate = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        try {
            const token = getToken();
            await axios.post(`${BaseUrl}/batches/create`, form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Batch created successfully!');
            setModalOpen(false);
            fetchBatches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create batch');
        } finally {
            setModalLoading(false);
        }
    };

    // Edit batch
    const handleEdit = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        try {
            const token = getToken();
            // Prepare payload for edit API
            const payload = {
                batchName: form.batchName,
                course: form.course,
                users: form.users,
                professor: form.professor,
                startDate: form.startDate,
                endDate: form.endDate,
            };
            if (form.progressUpdates) payload.progressUpdates = form.progressUpdates;
            if (typeof form.isCourseCompleted === 'boolean') payload.isCourseCompleted = form.isCourseCompleted;
            await axios.put(`${BaseUrl}/batches/${selectedBatchId}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Batch updated successfully!');
            setModalOpen(false);
            fetchBatches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update batch');
        } finally {
            setModalLoading(false);
        }
    };

    // Delete batch
    const handleDelete = async (batchId) => {
        if (!window.confirm('Are you sure you want to delete this batch?')) return;
        setDeleteLoading(true);
        try {
            const token = getToken();
            await axios.delete(`${BaseUrl}/batches/${batchId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Batch deleted successfully!');
            fetchBatches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete batch');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Metrics
    const totalBatches = batches.length;
    const totalUsers = batches.reduce((acc, b) => acc + (b.users?.length || 0), 0);
    const totalProfessors = new Set(batches.map(b => b.professor?._id)).size;
    const totalCourses = new Set(batches.map(b => b.course?._id)).size;

    // Helper: Calculate batch progress (for demo, percent of users with quizzes or just users count)
    function getBatchProgress(batch) {
        // Example: percent of users who have at least one quiz (or just users count for now)
        if (!batch.users || batch.users.length === 0) return 0;
        // If you have per-user progress, use it here. For now, fake as 100% if quizzes exist, else 50% if users exist
        if (batch.quizzes && batch.quizzes.length > 0) return 100;
        return 50;
    }

    // Modal content (portal)
    const modalContent = modalOpen && (
        <div
            className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn"
            onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
            <div className="relative w-full max-w-lg mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-purple-400/30 flex flex-col max-h-[90vh] overflow-hidden ring-2 ring-pink-400/10 animate-modalPop">
                {/* Accent Header Bar */}
                <div className="h-3 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
                {/* Close Button */}
                <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={() => setModalOpen(false)}>
                    <CloseIcon className="text-lg font-bold" />
                </button>
                <form onSubmit={modalMode === 'create' ? handleCreate : handleEdit} className="flex-1 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar">
                    <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-glow text-center">{modalMode === 'create' ? 'Create Batch' : 'Edit Batch'}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-purple-200 mb-1">Batch Name</label>
                            <input name="batchName" value={form.batchName} onChange={handleFormChange} required className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                        </div>
                        <div>
                            <label className="block text-purple-200 mb-1">Course</label>
                            <Select
                                isDisabled={fetchingDropdowns}
                                options={courses.map(c => ({ value: c._id, label: c.title }))}
                                value={courses.find(c => c._id === form.course) ? { value: form.course, label: courses.find(c => c._id === form.course)?.title } : null}
                                onChange={opt => setForm(f => ({ ...f, course: opt?.value || '', users: [] }))}
                                classNamePrefix="react-select"
                                placeholder="Select course..."
                                styles={{
                                    control: (base) => ({ ...base, background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: '#a78bfa', minHeight: 40 }),
                                    menu: (base) => ({ ...base, background: '#312e81', color: 'white' }),
                                    singleValue: (base) => ({ ...base, color: 'white' }),
                                    option: (base, state) => ({ ...base, background: state.isFocused ? '#a78bfa' : 'transparent', color: 'white' })
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-purple-200 mb-1">Professor</label>
                            <Select
                                isDisabled={fetchingDropdowns}
                                options={professors.map(p => ({ value: p._id, label: p.name }))}
                                value={professors.find(p => p._id === form.professor) ? { value: form.professor, label: professors.find(p => p._id === form.professor)?.name } : null}
                                onChange={opt => setForm(f => ({ ...f, professor: opt?.value || '' }))}
                                classNamePrefix="react-select"
                                placeholder="Select professor..."
                                styles={{
                                    control: (base) => ({ ...base, background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: '#a78bfa', minHeight: 40 }),
                                    menu: (base) => ({ ...base, background: '#312e81', color: 'white' }),
                                    singleValue: (base) => ({ ...base, color: 'white' }),
                                    option: (base, state) => ({ ...base, background: state.isFocused ? '#a78bfa' : 'transparent', color: 'white' })
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-purple-200 mb-1">Users</label>
                            <Select
                                isMulti
                                isSearchable
                                isDisabled={fetchingDropdowns || availableUsersLoading || !form.course}
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                                options={
                                  modalMode === 'edit'
                                    ? [
                                        ...editUserBreakdown.assigned.map(u => ({ value: u._id, label: u.name, email: u.email, isAssigned: true })),
                                        ...editUserBreakdown.available.map(u => ({ value: u._id, label: u.name, email: u.email, isAssigned: false })),
                                      ]
                                    : availableUsers.map(u => ({ value: u._id, label: u.name, email: u.email }))
                                }
                                value={
                                  modalMode === 'edit'
                                    ? [...editUserBreakdown.assigned, ...editUserBreakdown.available]
                                        .filter(u => form.users.includes(u._id))
                                        .map(u => ({ value: u._id, label: u.name, email: u.email, isAssigned: !!editUserBreakdown.assigned.find(a => a._id === u._id) }))
                                    : availableUsers
                                        .filter(u => form.users.includes(u._id))
                                        .map(u => ({ value: u._id, label: u.name, email: u.email }))
                                }
                                onChange={opts => setForm(f => ({ ...f, users: opts.map(o => o.value) }))}
                                classNamePrefix="react-select"
                                placeholder={form.course ? (availableUsersLoading ? "Loading users..." : "Select users...") : "Select a course first"}
                                styles={{
                                  control: (base) => ({ ...base, background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: '#a78bfa', minHeight: 40 }),
                                  menu: (base) => ({ ...base, background: '#312e81', color: 'white' }),
                                  multiValue: (base) => ({ ...base, background: '#a78bfa', color: 'white' }),
                                  option: (base, state) => ({
                                    ...base,
                                    background: state.isFocused ? '#a78bfa' : 'transparent',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    opacity: state.data.isAssigned ? 1 : 1,
                                  }),
                                  input: (base) => ({ ...base, color: 'white' }),
                                  singleValue: (base) => ({ ...base, color: 'white' })
                                }}
                                components={{
                                  Option: (props) => (
                                    <div {...props.innerProps} className={props.className} style={props.style}>
                                      <input
                                        type="checkbox"
                                        checked={props.isSelected}
                                        onChange={() => null}
                                        style={{ marginRight: 8 }}
                                      />
                                      <span>{props.label}</span>
                                      <span className="ml-2 text-xs text-pink-200/80">({props.data.email})</span>
                                      {props.data.isAssigned && <span className="ml-2 text-xs text-green-300/80">(Already assigned)</span>}
                                    </div>
                                  )
                                }}
                            />
                            <div className="text-xs text-purple-200 mt-1">You can select multiple users. {modalMode === 'edit' ? 'Already assigned users are pre-selected.' : 'Only users enrolled in the selected course and not already assigned to the batch are shown.'}</div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-purple-200 mb-1">Start Date</label>
                                <input type="date" name="startDate" value={form.startDate} onChange={handleFormChange} required className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-purple-200 mb-1">End Date</label>
                                <input type="date" name="endDate" value={form.endDate} onChange={handleFormChange} required className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center mt-6">
                        <button type="submit" disabled={modalLoading} className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-transform text-lg">
                            {modalLoading ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1); }
        @keyframes modalPop { 0% { transform: scale(0.95) translateY(40px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-modalPop { animation: modalPop 0.4s cubic-bezier(0.4,0,0.2,1); }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #a78bfa55; border-radius: 8px; }
      `}</style>
        </div>
    );

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg mb-4 md:mb-0">
                    <TrendingUp className="text-white text-4xl drop-shadow-lg" />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">Batch Management</h1>
                    <p className="text-lg text-purple-100/80 mt-2">Admin view of all batches, users, and courses</p>
                </div>
                <div className="flex flex-col gap-2 md:ml-auto items-center">
                    <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-transform text-lg mb-2">
                        <Add /> Create Batch
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-purple-400/30 to-purple-700/30 backdrop-blur-xl border border-white/10 group overflow-hidden">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center shadow-lg mt-3">
                        <School className="text-2xl text-purple-100 drop-shadow-lg" />
                    </div>
                    <div className="z-10 flex flex-col items-center mt-10">
                        <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{totalBatches}</div>
                        <div className="text-sm font-medium mt-1 tracking-wide uppercase text-purple-100/90">Total Batches</div>
                    </div>
                </div>
                <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-green-400/30 to-green-600/30 backdrop-blur-xl border border-white/10 group overflow-hidden">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg mt-3">
                        <Group className="text-2xl text-green-100 drop-shadow-lg" />
                    </div>
                    <div className="z-10 flex flex-col items-center mt-10">
                        <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{totalUsers}</div>
                        <div className="text-sm font-medium mt-1 tracking-wide uppercase text-green-100/90">Total Users</div>
                    </div>
                </div>
                <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-blue-400/30 to-blue-600/30 backdrop-blur-xl border border-white/10 group overflow-hidden">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg mt-3">
                        <Person className="text-2xl text-blue-100 drop-shadow-lg" />
                    </div>
                    <div className="z-10 flex flex-col items-center mt-10">
                        <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{totalProfessors}</div>
                        <div className="text-sm font-medium mt-1 tracking-wide uppercase text-blue-100/90">Professors</div>
                    </div>
                </div>
                <div className="relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-pink-400/30 to-pink-600/30 backdrop-blur-xl border border-white/10 group overflow-hidden">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg mt-3">
                        <TrendingUp className="text-2xl text-pink-100 drop-shadow-lg" />
                    </div>
                    <div className="z-10 flex flex-col items-center mt-10">
                        <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{totalCourses}</div>
                        <div className="text-sm font-medium mt-1 tracking-wide uppercase text-pink-100/90">Courses</div>
                    </div>
                </div>
            </div>

            {/* Batch Table - Redesigned, only essential columns */}
            <div className="w-full mt-10 rounded-2xl shadow-xl bg-gradient-to-b from-[#311188] to-[#0A081E] border border-[#312e81]/60 p-0 overflow-hidden">
                {/* Custom Table Header: Heading + Searchbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 pt-6 pb-3 gap-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-white  tracking-wide">Batch details</h2>
                    <div className="relative w-full max-w-xs">
                        <input
                            type="text"
                            placeholder="Search batches..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg bg-[#1a1536]/80 text-white placeholder-purple-200 border border-[#312e81]/40 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full backdrop-blur-md"
                        />
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-purple-200" />
                    </div>
                </div>
                <table className="w-full rounded-2xl table-fixed border-separate border-spacing-0 bg-gradient-to-br from-[#312e81]/80 via-[#a78bfa22] to-[#0ea5e9]/20 text-white">
                    <thead>
                        <tr className="bg-gradient-to-r from-[#312e81]/80 via-[#a78bfa33] to-[#0ea5e9]/30 text-purple-100 text-base border-b border-[#312e81]/40">
                            <th className="py-3 px-2 text-left font-bold w-[16%] max-w-[180px] truncate">Batch</th>
                            <th className="py-3 px-2 text-left font-bold w-[18%] max-w-[200px] truncate">Course</th>
                            <th className="py-3 px-2 text-left font-bold w-[16%] max-w-[180px] truncate">Professor</th>
                            <th className="py-3 px-2 text-left font-bold w-[11%] max-w-[120px] truncate">Dates</th>
                            <th className="py-3 px-2 text-left font-bold w-[10%] max-w-[80px] truncate">Users</th>
                            <th className="py-3 px-2 text-left font-bold w-[18%] max-w-[160px] truncate">Progress</th>
                            <th className="py-3 px-4 text-left font-bold w-[13%] max-w-[180px] min-w-[120px] truncate">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-400 mx-auto"></div></td></tr>
                        ) : error ? (
                            <tr><td colSpan={7} className="text-center text-red-400 font-bold py-10">{error}</td></tr>
                        ) : filteredBatches.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-16">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#312e81]/30 flex items-center justify-center">
                                    <School className="text-4xl text-purple-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">No Batches Found</h3>
                                <p className="text-purple-200/80">Create a new batch to get started!</p>
                            </td></tr>
                        ) : (
                            paginatedBatches.map((batch) => {
                                const userProgress = batch.users?.map(u => u.progress?.modules?.percent || 0) || [];
                                const avgProgress = userProgress.length ? Math.round(userProgress.reduce((a, b) => a + b, 0) / userProgress.length) : 0;
                                return (
                                    <tr key={batch.batchId} className="group border-b border-[#312e81]/40 hover:bg-[#312e81]/60 transition-all duration-200 rounded-xl shadow-sm hover:shadow-lg">
                                        {/* Batch Name or Course Title */}
                                        <td className="py-3 px-2 align-top max-w-[180px]" title={batch.course?.title || 'Batch'}>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 to-blue-400 mr-2"></span>
                                                <span className="text-lg font-semibold truncate">{batch.course?.title || 'Batch'}</span>
                                                <span className="ml-2 px-2 py-0.5 rounded bg-purple-700/40 text-xs text-purple-100 font-bold truncate" title={batch.batchId}>{batch.batchId.slice(-5)}</span>
                                            </div>
                                        </td>
                                        {/* Course Info */}
                                        <td className="py-3 px-2 align-top max-w-[200px]" title={batch.course?.title}>
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <span className="font-bold text-purple-100 truncate" title={batch.course?.title}>{batch.course?.title}</span>
                                                <span className="text-xs text-purple-300 truncate" title={batch.course?.category + ' | ' + batch.course?.level}>{batch.course?.category} | {batch.course?.level}</span>
                                                <span className="text-xs text-blue-200 truncate" title={batch.course?.duration}>{batch.course?.duration}</span>
                                            </div>
                                        </td>
                                        {/* Professor Info */}
                                        <td className="py-3 px-2 align-top max-w-[180px]" title={batch.professor?.name + ' ' + batch.professor?.email}>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-blue-100 truncate block" title={batch.professor?.name}>{batch.professor?.name}</span>
                                                <span className="block text-xs text-blue-200 truncate" title={batch.professor?.email}>{batch.professor?.email}</span>
                                            </div>
                                        </td>
                                        {/* Dates */}
                                        <td className="py-3 px-2 align-top min-w-[120px] max-w-[160px]" title={`Start: ${batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '-'} | End: ${batch.endDate ? new Date(batch.endDate).toLocaleDateString() : '-'}`}>
                                            <div className="flex flex-col gap-1 items-start">
                                                <div className="flex flex-col items-start">
                                                    <span className="text-[11px] text-purple-300 font-semibold uppercase tracking-wide">Start</span>
                                                    <span className="text-xs text-purple-100 font-bold" title={batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '-'}>{batch.startDate ? new Date(batch.startDate).toLocaleDateString() : '-'}</span>
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <span className="text-[11px] text-pink-300 font-semibold uppercase tracking-wide">End</span>
                                                    <span className="text-xs text-pink-100 font-bold" title={batch.endDate ? new Date(batch.endDate).toLocaleDateString() : '-'}>{batch.endDate ? new Date(batch.endDate).toLocaleDateString() : '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Users */}
                                        <td className="py-3 px-2 align-top max-w-[80px] text-left" title={`Total users: ${batch.totalUsers || batch.users?.length || 0}`}>
                                            <span className="font-bold text-pink-100 text-lg">{batch.totalUsers || batch.users?.length || 0}</span>
                                        </td>
                                        {/* Progress */}
                                        <td className="py-3 px-2 align-top max-w-[160px]" title={`Average progress: ${avgProgress}%`}>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-24 h-2 bg-[#312e81]/40 rounded-full overflow-hidden shadow-inner">
                                                    <div className="h-2 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400" style={{ width: `${avgProgress}%`, transition: 'width 1s' }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-purple-100">{avgProgress}%</span>
                                                <BarChart className="text-purple-300 ml-1" fontSize="small" />
                                            </div>
                                        </td>
                                        {/* Actions */}
                                        <td className="py-3 px-4 align-top max-w-[180px] min-w-[120px]" title="Actions">
                                            <div className="flex flex-wrap gap-2 min-w-[120px]">
                                                <button onClick={() => openViewModal(batch)} className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-md hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center gap-1 break-words shadow" title="View Batch">
                                                    <Visibility fontSize="small" />
                                                </button>
                                                <button onClick={() => openEditModal(batch.batchId)} className="px-2 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-semibold rounded-md hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-1 break-words shadow" title="Edit Batch">
                                                    <Edit fontSize="small" />
                                                </button>
                                                <button disabled={deleteLoading} onClick={() => handleDelete(batch.batchId)} className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold rounded-md hover:from-pink-600 hover:to-red-600 transition-all duration-200 flex items-center gap-1 break-words shadow" title="Delete Batch">
                                                    <Delete fontSize="small" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 py-6">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-lg font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            Prev
                        </button>
                        {[...Array(totalPages)].map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentPage(idx + 1)}
                                className={`px-3 py-1 rounded-lg font-bold mx-1 ${currentPage === idx + 1 ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' : 'bg-[#1a1536]/60 text-purple-200 hover:bg-purple-700/60'}`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-lg font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* View Modal (portal) */}
            {viewModalOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn" onClick={e => { if (e.target === e.currentTarget) closeViewModal(); }}>
                    <div className="relative w-full max-w-xl mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/95 to-[#0a081e]/98 rounded-3xl shadow-2xl border border-purple-400/30 flex flex-col max-h-[90vh] overflow-hidden ring-2 ring-pink-400/10 animate-modalPop">
                        {/* Accent Header Bar */}
                        <div className="h-3 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
                        {/* Close Button */}
                        <button
                            className="absolute top-5 right-5 text-purple-200 m-0 p-0 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full shadow-lg backdrop-blur-md flex items-center justify-center"
                            style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={closeViewModal}
                        >
                            <CloseIcon className="text-xl  flex items-center justify-center w-full h-full" />
                        </button>
                        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-4 custom-scrollbar">
                            {viewBatch && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 flex items-center justify-center shadow-lg">
                                            <Visibility className="text-white text-3xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-extrabold text-white mb-1 ">{viewBatch.batchName}</h2>
                                            <div className="text-purple-200 text-lg font-semibold">{viewBatch.course?.title}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-[#312e81]/40 rounded-xl p-4 border border-purple-400/20">
                                            <div className="text-purple-200 font-semibold mb-1">Course</div>
                                            <div className="text-white text-lg">{viewBatch.course?.title}</div>
                                        </div>
                                        <div className="bg-[#312e81]/40 rounded-xl p-4 border border-purple-400/20">
                                            <div className="text-purple-200 font-semibold mb-1">Professor</div>
                                            <div className="text-white text-lg">{viewBatch.professor?.name}</div>
                                        </div>
                                        <div className="bg-[#312e81]/40 rounded-xl p-4 border border-purple-400/20">
                                            <div className="text-purple-200 font-semibold mb-1">Status</div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBatchStatus(viewBatch.startDate, viewBatch.endDate).color} ${getBatchStatus(viewBatch.startDate, viewBatch.endDate).text}`}>{getBatchStatus(viewBatch.startDate, viewBatch.endDate).label}</span>
                                        </div>
                                        <div className="bg-[#312e81]/40 rounded-xl p-4 border border-purple-400/20">
                                            <div className="text-purple-200 font-semibold mb-1">Progress</div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-[#312e81]/40 rounded-full overflow-hidden">
                                                    <div className="h-2 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400" style={{ width: `${getBatchProgress(viewBatch)}%`, transition: 'width 1s' }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-purple-100">{getBatchProgress(viewBatch)}%</span>
                                                <BarChart className="text-purple-300 ml-1" fontSize="small" />
                                            </div>
                                        </div>
                                        <div className="bg-[#312e81]/40 rounded-xl p-4 border border-purple-400/20">
                                            <div className="text-purple-200 font-semibold mb-1">Dates</div>
                                            <div className="text-white">Start: {viewBatch.startDate ? new Date(viewBatch.startDate).toLocaleDateString() : '-'}<br />End: {viewBatch.endDate ? new Date(viewBatch.endDate).toLocaleDateString() : '-'}</div>
                                        </div>
                                        <div className="bg-[#312e81]/40 rounded-xl p-4 border border-purple-400/20 md:col-span-2">
                                            <div className="text-purple-200 font-semibold mb-1">Users</div>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {viewBatch.users?.length ? viewBatch.users.map((u, idx) => (
                                                    <span key={u._id || u} className="px-2 py-1 bg-purple-900/40 text-purple-100 rounded-lg text-xs">{u.name || u}</span>
                                                )) : <span className="text-purple-300">No users</span>}
                                            </div>
                                        </div>
                                        <div className="bg-[#312e81]/40 rounded-xl p-4 border border-purple-400/20 md:col-span-2">
                                            <div className="text-purple-200 font-semibold mb-1">Quizzes</div>
                                            <div className="text-white">{viewBatch.quizzes?.length || 0}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <style>{`
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              .animate-fadeIn { animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1); }
              @keyframes modalPop { 0% { transform: scale(0.95) translateY(40px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
              .animate-modalPop { animation: modalPop 0.4s cubic-bezier(0.4,0,0.2,1); }
              .custom-scrollbar::-webkit-scrollbar { width: 8px; background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: #a78bfa55; border-radius: 8px; }
            `}</style>
                    </div>
                </div>, document.getElementById('modal-root')
            )}

            {modalOpen && ReactDOM.createPortal(modalContent, document.getElementById('modal-root'))}
        </div>
    );
};

export default BatchAdmin; 