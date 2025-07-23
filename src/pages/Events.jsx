import React, { useEffect, useState } from 'react';
import BaseUrl from '../Api';
import {
  Event as EventIcon,
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  CalendarToday,
  LocationOn,
  Group,
  Person,
  Link as LinkIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import ReactDOM from 'react-dom';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const categoryOptions = [
  'Webinar', 'Workshop', 'Session', 'Hackathon', 'Seminar'
];
const modeOptions = ['Online', 'Offline', 'Hybrid'];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ category: '', mode: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    mode: '',
    bannerImage: '',
    speaker: {
      name: '',
      designation: '',
      photo: '',
      linkedIn: ''
    },
    registrationRequired: false,
    maxAttendees: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, event: null });
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const isLoggedIn = !!user;
  const isAdmin = user && user.role === 'admin';
  const userId = user && user._id;
  const [registering, setRegistering] = useState(false);
  const [registerModal, setRegisterModal] = useState({ open: false, event: null });

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BaseUrl}/events/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEvents(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    setUser(() => {
      try {
        return JSON.parse(localStorage.getItem('user'));
      } catch {
        return null;
      }
    });
  }, []);

  // Modal scroll lock
  useEffect(() => {
    if (modalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  // Filtered and searched events
  const filteredEvents = events.filter(ev => {
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.description.toLowerCase().includes(search.toLowerCase()) ||
      ev.speaker?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter.category ? ev.category === filter.category : true;
    const matchesMode = filter.mode ? ev.mode === filter.mode : true;
    return matchesSearch && matchesCategory && matchesMode;
  });

  // Handle form input
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('speaker.')) {
      setForm(f => ({
        ...f,
        speaker: { ...f.speaker, [name.split('.')[1]]: value }
      }));
    } else if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Edit event handler
  const handleEditEvent = (event) => {
    setForm({
      title: event.title || '',
      description: event.description || '',
      category: event.category || '',
      date: event.date ? event.date.slice(0, 10) : '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      location: event.location || '',
      mode: event.mode || '',
      bannerImage: event.bannerImage || '',
      speaker: {
        name: event.speaker?.name || '',
        designation: event.speaker?.designation || '',
        photo: event.speaker?.photo || '',
        linkedIn: event.speaker?.linkedIn || ''
      },
      registrationRequired: event.registrationRequired ?? false,
      maxAttendees: event.maxAttendees || ''
    });
    setEditMode(true);
    setEditEventId(event._id);
    setModalOpen(true);
  };

  // Delete event handler
  const handleDeleteEvent = (event) => {
    setDeleteConfirm({ open: true, event });
  };

  // Confirm delete
  const confirmDeleteEvent = async () => {
    if (!deleteConfirm.event) return;
    setCreating(true);
    setCreateError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${BaseUrl}/events/${deleteConfirm.event._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showToast('Event deleted successfully!');
      setEvents(events => events.filter(ev => ev._id !== deleteConfirm.event._id));
      setDeleteConfirm({ open: false, event: null });
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  // Register event handler (open modal)
  const handleRegisterEvent = (event) => {
    setRegisterModal({ open: true, event });
  };

  // Confirm register event
  const confirmRegisterEvent = async () => {
    if (!userId || !registerModal.event) return;
    setRegistering(true);
    setCreateError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${BaseUrl}/events/register`,
        { userId, eventId: registerModal.event._id },
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
      );
      showToast('Registered successfully!');
      setRegisterModal({ open: false, event: null });
      // Update registeredUsers in UI
      setEvents(events => events.map(ev => ev._id === registerModal.event._id ? { ...ev, registeredUsers: [...(ev.registeredUsers || []), userId] } : ev));
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setRegistering(false);
    }
  };

  // Handle event creation or update
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const token = localStorage.getItem('token');
      let res, data;
      if (editMode && editEventId) {
        res = await axios.put(
          `${BaseUrl}/events/${editEventId}`,
          form,
          { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
        );
        showToast('Event updated successfully!');
        setEvents(events => events.map(ev => ev._id === editEventId ? { ...ev, ...res.data.updated } : ev));
      } else {
        res = await axios.post(
          `${BaseUrl}/events/create`,
          form,
          { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
        );
        showToast('Event created successfully!');
        setEvents(events => [res.data.event, ...events]);
      }
      setModalOpen(false);
      setForm({
        title: '',
        description: '',
        category: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        mode: '',
        bannerImage: '',
        speaker: { name: '', designation: '', photo: '', linkedIn: '' },
        registrationRequired: false,
        maxAttendees: ''
      });
      setEditMode(false);
      setEditEventId(null);
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  // Replace showToast with toastify usage:
  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message, { position: 'top-right', autoClose: 3000 });
    else if (type === 'error') toast.error(message, { position: 'top-right', autoClose: 4000 });
    else toast.info(message, { position: 'top-right', autoClose: 3000 });
  };

  // Main render
  return (
    <>
      {typeof document !== 'undefined' && ReactDOM.createPortal(
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 20000, position: 'fixed', top: 16, right: 16 }}
        />, document.body
      )}
      <div className="space-y-10 pb-10 mt-5 py-5">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-white/10 flex items-center gap-6 -mt-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg">
            <EventIcon className="text-white text-4xl drop-shadow-lg" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">Events & Workshops</h1>
            <p className="text-lg text-purple-100/80 mt-2">Discover, join, and create amazing events!</p>
          </div>
          <div className="ml-auto">
            {isAdmin && (
              <button
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 text-lg"
                onClick={() => {
                  setForm({
                    title: '',
                    description: '',
                    category: '',
                    date: '',
                    startTime: '',
                    endTime: '',
                    location: '',
                    mode: '',
                    bannerImage: '',
                    speaker: {
                      name: '',
                      designation: '',
                      photo: '',
                      linkedIn: ''
                    },
                    registrationRequired: false,
                    maxAttendees: ''
                  });
                  setEditMode(false);
                  setEditEventId(null);
                  setModalOpen(true);
                }}
              >
                <AddIcon /> Create Event
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
                placeholder="Search events, speakers, topics..."
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
                {categoryOptions.map(opt => <option key={opt} value={opt} className="text-black bg-white hover:bg-purple-100">{opt}</option>)}
              </select>
              <FilterListIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none" />
            </div>
            <div className="relative min-w-[140px]">
              <select
                className="appearance-none w-full py-3 px-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40 shadow-lg custom-select"
                value={filter.mode}
                onChange={e => setFilter(f => ({ ...f, mode: e.target.value }))}
              >
                <option value="">All Modes</option>
                {modeOptions.map(opt => <option key={opt} value={opt} className="text-black bg-white hover:bg-purple-100">{opt}</option>)}
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

        {/* Events List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="col-span-full text-center text-red-400 font-bold py-10">{error}</div>
          ) : filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <EventIcon className="text-4xl text-purple-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Events Found</h3>
              <p className="text-purple-200/80">Try adjusting your search or filters.</p>
            </div>
          ) : filteredEvents.map(ev => (
            <div key={ev._id} className="group relative rounded-2xl p-0 shadow-2xl bg-gradient-to-br from-[#312e81]/95 to-[#0a081e]/95 border border-white/20 overflow-hidden flex flex-col hover:scale-105 transition-all duration-500">
              {/* Banner */}
              <div className="relative h-48 w-full overflow-hidden">
                <img src={ev.bannerImage} alt={ev.title} className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a081e]/80 to-transparent" />
                <div className="absolute top-3 left-3 bg-gradient-to-br from-pink-400/80 to-purple-400/80 px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg">
                  {ev.category}
                </div>
                {/* Edit/Delete Icons */}
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  {isAdmin && (
                    <>
                      <button
                        className="event-action p-1 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:scale-110 hover:bg-pink-500 transition-all duration-200 h-7 w-7 flex items-center justify-center"
                        title="Edit Event"
                        onClick={e => { e.stopPropagation(); handleEditEvent(ev); }}
                      >
                        <EditIcon fontSize="small" style={{ fontSize: 18 }} />
                      </button>
                      <button
                        className="event-action p-1 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg hover:scale-110 hover:bg-purple-500 transition-all duration-200 h-7 w-7 flex items-center justify-center"
                        title="Delete Event"
                        onClick={e => { e.stopPropagation(); handleDeleteEvent(ev); }}
                      >
                        <DeleteIcon fontSize="small" style={{ fontSize: 18 }} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 flex flex-col p-5">
                <div className="flex items-center mb-2">
                  <h3 className="font-bold text-white text-2xl leading-tight drop-shadow-lg group-hover:text-purple-200 transition-colors duration-300">
                    {ev.title}
                  </h3>
                  <span className="flex-1" />
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-br from-blue-400/80 to-purple-400/80 text-white shadow border border-white/20 ml-auto whitespace-nowrap">
                    {ev.mode}
                  </span>
                </div>
                <div className="text-purple-200 mb-2 text-base leading-relaxed line-clamp-2">
                  {ev.description}
                </div>
                <div className="flex items-center gap-2 text-xs text-purple-100 mb-2">
                  <CalendarToday className="text-purple-300 text-base" />
                  <span className="whitespace-nowrap">{new Date(ev.date).toLocaleDateString()}</span>
                  <span className="mx-1">|</span>
                  <span className="whitespace-nowrap">{ev.startTime} - {ev.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-purple-100 mb-2">
                  <LocationOn className="text-pink-300 text-base" />
                  <span className="whitespace-nowrap">{ev.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-purple-100 mb-2">
                  <Person className="text-blue-300" />
                  <span className="font-semibold text-purple-100 whitespace-nowrap">{ev.speaker?.name}</span>
                  <span className="text-xs text-purple-300 whitespace-nowrap">{ev.speaker?.designation}</span>
                  {ev.speaker?.linkedIn && (
                    <a href={ev.speaker.linkedIn} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-400 underline flex items-center gap-1 whitespace-nowrap"><LinkIcon fontSize="small" />LinkedIn</a>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-purple-200">
                  <Group className="text-yellow-300" />
                  <span className="whitespace-nowrap">{ev.registeredUsers?.length || 0}/{ev.maxAttendees} Registered</span>
                  {ev.registrationRequired && !isAdmin && <span className="ml-2 px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full border border-yellow-400/30 whitespace-nowrap font-semibold text-xs">Registration Required</span>}
                </div>
                {isLoggedIn && !isAdmin && (
                  <button
                    className="mt-4 w-30 px-6 py-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold shadow hover:scale-105 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => handleRegisterEvent(ev)}
                    disabled={registering}
                  >
                    {registering ? (
                      <CircularProgress size={22} color="inherit" thickness={5} style={{ color: '#fff' }} />
                    ) : 'Register'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Create Event Modal */}
        {modalOpen && ReactDOM.createPortal(
          <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
            <div className="relative w-full max-w-2xl mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[90vh] overflow-hidden animate-modalPop">
              {/* Accent Header Bar */}
              <div className="h-3 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
              {/* Close Button */}
              <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={() => setModalOpen(false)}>
                <CloseIcon fontSize="large" />
              </button>
              <form className="flex-1 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar" onSubmit={handleCreateEvent}>
                <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-glow">{editMode ? 'Update Event' : 'Create a New Event'}</h2>
                {createError && <div className="text-red-400 font-bold mb-2">{createError}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Title</label>
                    <input type="text" name="title" value={form.title} onChange={handleFormChange} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Category</label>
                    <select name="category" value={form.category} onChange={handleFormChange} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40">
                      <option value="">Select</option>
                      {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-purple-200 mb-1 font-semibold">Description</label>
                    <textarea name="description" value={form.description} onChange={handleFormChange} required rows={2} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Date</label>
                    <input type="date" name="date" value={form.date} onChange={handleFormChange} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Start Time</label>
                    <input type="text" name="startTime" value={form.startTime} onChange={handleFormChange} required placeholder="e.g. 10:00 AM" className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">End Time</label>
                    <input type="text" name="endTime" value={form.endTime} onChange={handleFormChange} required placeholder="e.g. 1:00 PM" className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Location</label>
                    <input type="text" name="location" value={form.location} onChange={handleFormChange} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Mode</label>
                    <select name="mode" value={form.mode} onChange={handleFormChange} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40">
                      <option value="">Select</option>
                      {modeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-purple-200 mb-1 font-semibold">Banner Image URL</label>
                    <input type="text" name="bannerImage" value={form.bannerImage} onChange={handleFormChange} required placeholder="https://..." className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div className="md:col-span-2 font-bold text-pink-300 mt-2">Speaker Details</div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Name</label>
                    <input type="text" name="speaker.name" value={form.speaker.name} onChange={handleFormChange} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Designation</label>
                    <input type="text" name="speaker.designation" value={form.speaker.designation} onChange={handleFormChange} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Photo URL</label>
                    <input type="text" name="speaker.photo" value={form.speaker.photo} onChange={handleFormChange} required placeholder="https://..." className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">LinkedIn</label>
                    <input type="text" name="speaker.linkedIn" value={form.speaker.linkedIn} onChange={handleFormChange} required placeholder="https://linkedin.com/in/..." className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Registration Required</label>
                    <input type="checkbox" name="registrationRequired" checked={form.registrationRequired} onChange={handleFormChange} className="ml-2 scale-125 accent-pink-500" />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-1 font-semibold">Max Attendees</label>
                    <input type="number" name="maxAttendees" value={form.maxAttendees} onChange={handleFormChange} min={1} max={1000} required placeholder="Enter max attendees" className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={creating} className="px-7 py-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
                    {creating ? (
                      <CircularProgress size={22} color="inherit" thickness={5} style={{ color: '#fff' }} />
                    ) : (editMode ? 'Update Event' : 'Create Event')}
                  </button>
                </div>
              </form>
            </div>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-fadeIn {
                animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1);
              }
              @keyframes modalPop {
                0% { transform: scale(0.95) translateY(40px); opacity: 0; }
                100% { transform: scale(1) translateY(0); opacity: 1; }
              }
              .animate-modalPop {
                animation: modalPop 0.4s cubic-bezier(0.4,0,0.2,1);
              }
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #a78bfa55;
                border-radius: 8px;
              }
            `}</style>
          </div>,
          document.getElementById('modal-root')
        )}
        {/* Register Modal */}
        {registerModal.open && ReactDOM.createPortal(
          <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
            <div className="bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl shadow-2xl border border-white/10 p-8 max-w-sm w-full">
              <h2 className="text-xl font-bold text-white mb-4">Register for Event</h2>
              <p className="text-purple-200 mb-6">Are you sure you want to register for <span className="font-bold text-pink-300">{registerModal.event?.title}</span>?</p>
              <div className="flex justify-end gap-3">
                <button className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300" onClick={() => setRegisterModal({ open: false, event: null })}>Cancel</button>
                <button className="px-7 py-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed" onClick={confirmRegisterEvent} disabled={registering}>{registering ? 'Registering...' : 'Register'}</button>
              </div>
            </div>
          </div>,
          document.getElementById('modal-root')
        )}
        {/* Delete Confirmation Modal */}
        {deleteConfirm.open && ReactDOM.createPortal(
          <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
            <div className="bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl shadow-2xl border border-white/10 p-8 max-w-sm w-full">
              <h2 className="text-xl font-bold text-white mb-4">Confirm Delete</h2>
              <p className="text-purple-200 mb-6">Are you sure you want to delete the event <span className="font-bold text-pink-300">{deleteConfirm.event?.title}</span>?</p>
              <div className="flex justify-end gap-3">
                <button className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300" onClick={() => setDeleteConfirm({ open: false, event: null })}>Cancel</button>
                <button className="px-7 py-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed" onClick={confirmDeleteEvent} disabled={creating}>{creating ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>,
          document.getElementById('modal-root')
        )}
      </div>
    </>
  );
};

export default Events; 