import React, { useEffect, useState } from 'react';
import BaseUrl from '../Api';
import axios from 'axios';
import {
  Group as GroupIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const filterOptions = [
  { label: 'All Roles', value: '' },
  { label: 'Admin', value: 'admin' },
  { label: 'Intern', value: 'intern' },
  { label: 'User', value: 'user' },
];

const userTableFields = [
  { key: 'name', label: 'Name', icon: <PersonIcon className="mr-1 text-pink-400" /> },
  { key: 'email', label: 'Email', icon: <EmailIcon className="mr-1 text-blue-400" /> },
  { key: 'phone', label: 'Phone', icon: <PhoneIcon className="mr-1 text-yellow-400" /> },
  { key: 'collegeName', label: 'College', icon: <SchoolIcon className="mr-1 text-purple-400" /> },
  { key: 'department', label: 'Department', icon: <BusinessIcon className="mr-1 text-pink-300" /> },
  { key: 'role', label: 'Role', icon: <StarIcon className="mr-1 text-yellow-400" /> },
  { key: 'isApproved', label: 'Status' },
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [viewModal, setViewModal] = useState({ open: false, user: null, loading: false, error: null });
  const [actionLoading, setActionLoading] = useState({});
  const [deleting, setDeleting] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, user: null });
  const [statusConfirm, setStatusConfirm] = useState({ open: false, user: null, action: null });

  // Toast helper
  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message, { position: 'top-right', autoClose: 3000 });
    else if (type === 'error') toast.error(message, { position: 'top-right', autoClose: 4000 });
    else toast.info(message, { position: 'top-right', autoClose: 3000 });
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BaseUrl}/users/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered and searched users
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.collegeName && u.collegeName.toLowerCase().includes(search.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  // Approve/Reject user
  const handleStatusChange = async (userId, isApproved) => {
    setActionLoading(l => ({ ...l, [userId]: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${BaseUrl}/users/status/${userId}`,
        { isApproved: isApproved ? "true" : "false" },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      showToast(res.data.message || 'User status updated');
      // Update the user in the UI without refetching all users
      setUsers(users => users.map(u => u._id === userId ? { ...u, isApproved } : u));
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setActionLoading(l => ({ ...l, [userId]: false }));
    }
  };

  // View user details
  const handleViewUser = async (userId) => {
    setViewModal({ open: true, user: null, loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BaseUrl}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setViewModal({ open: true, user: res.data, loading: false, error: null });
    } catch (err) {
      setViewModal({ open: true, user: null, loading: false, error: err.response?.data?.message || err.message });
    }
  };

  // Close view modal
  const closeViewModal = () => setViewModal({ open: false, user: null, loading: false, error: null });

  // Delete user
  const handleDeleteUser = async (userId) => {
    setDeleting(d => ({ ...d, [userId]: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BaseUrl}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(users => users.filter(u => u._id !== userId));
      showToast('User deleted successfully');
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setDeleting(d => ({ ...d, [userId]: false }));
    }
  };

  return (
    <>
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
      />
      <div className="space-y-10 pb-10 mt-5 py-5">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-white/10 flex items-center gap-6 -mt-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg">
            <GroupIcon className="text-white text-4xl drop-shadow-lg" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">Users Directory</h1>
            <p className="text-lg text-purple-100/80 mt-2">Browse, search, and filter all users in style!</p>
          </div>
        </div>
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search users, email, college, department..."
                className="w-full py-3 pl-12 pr-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-white placeholder-purple-200/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40 shadow-lg"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative min-w-[140px]">
              <select
                className="appearance-none w-full py-3 px-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40 shadow-lg custom-select"
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                {filterOptions.map(opt => <option key={opt.value} value={opt.value} className="text-black bg-white hover:bg-purple-100">{opt.label}</option>)}
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
          select.custom-select option:hover, select.custom-select option:focus, select-custom-select:focus option {
            background: #f3e8ff !important;
            color: #111 !important;
          }
        `}</style>
        {/* Users Table */}
        <div className="rounded-2xl shadow-2xl border border-white/20 bg-gradient-to-br from-[#312e81]/95 to-[#0a081e]/95 w-full overflow-x-hidden max-w-full">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <CircularProgress size={60} thickness={5} style={{ color: '#a78bfa' }} />
            </div>
          ) : error ? (
            <div className="text-center text-red-400 font-bold py-10 flex flex-col items-center gap-2">
              <ErrorIcon className="text-4xl" />
              {error}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <GroupIcon className="text-4xl text-purple-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Users Found</h3>
              <p className="text-purple-200/80">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full min-w-0 text-sm text-left text-purple-100 table-auto">
                <thead className="sticky top-0 z-10 bg-gradient-to-r from-purple-900/80 to-blue-900/80">
                  <tr>
                    <th className="px-2 py-2 font-bold uppercase tracking-wider">Name</th>
                    <th className="px-2 py-2 font-bold uppercase tracking-wider">Email</th>
                    <th className="px-2 py-2 font-bold uppercase tracking-wider">Phone</th>
                    <th className="px-2 py-2 font-bold uppercase tracking-wider">College</th>
                    <th className="px-2 py-2 font-bold uppercase tracking-wider">Department</th>
                    <th className="px-2 py-2 font-bold uppercase tracking-wider text-center">Status</th>
                    <th className="px-2 py-2 font-bold uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-blue-900/40 transition-all duration-200 border-b border-purple-900/40 last:border-b-0">
                      <td className="px-2 py-2 break-words whitespace-pre-line" title={u.name} style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{u.name}</td>
                      <td className="px-2 py-2 break-words whitespace-pre-line" title={u.email} style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{u.email}</td>
                      <td className="px-2 py-2 break-words whitespace-pre-line" title={u.phone} style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{u.phone}</td>
                      <td className="px-2 py-2 break-words whitespace-pre-line" title={u.collegeName} style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{u.collegeName}</td>
                      <td className="px-2 py-2 break-words whitespace-pre-line" title={u.department} style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{u.department}</td>
                      {/* Status column: Accept/Reject buttons or label */}
                      <td className="px-2 py-2 text-center">
                        {u.isApproved === true ? (
                          <span className="px-3 py-1 rounded-full bg-green-500/80 text-white font-semibold">Accepted</span>
                        ) : u.isApproved === false ? (
                          <span className="px-3 py-1 rounded-full bg-red-500/80 text-white font-semibold">Rejected</span>
                        ) : (
                          <div className="flex gap-2 justify-center items-center">
                            <button
                              title="Accept"
                              className="px-3 py-1 rounded-lg bg-green-500/80 hover:bg-green-600 text-white font-semibold shadow"
                              onClick={() => setStatusConfirm({ open: true, user: u, action: 'accept' })}
                              disabled={actionLoading[u._id]}
                            >
                              Accept
                            </button>
                            <button
                              title="Reject"
                              className="px-3 py-1 rounded-lg bg-red-500/80 hover:bg-red-600 text-white font-semibold shadow"
                              onClick={() => setStatusConfirm({ open: true, user: u, action: 'reject' })}
                              disabled={actionLoading[u._id]}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                      {/* Action column: View and Delete icons */}
                      <td className="px-2 py-2 text-center">
                        <div className="flex gap-2 justify-center items-center">
                          <button title="View" onClick={() => handleViewUser(u._id)} className="p-1 rounded-full bg-blue-500/80 hover:bg-blue-600 text-white">
                            <VisibilityIcon fontSize="small" />
                          </button>
                          <button title="Delete" disabled={deleting[u._id]} onClick={() => setDeleteConfirm({ open: true, user: u })} className="p-1 rounded-full bg-pink-500/80 hover:bg-pink-600 text-white">
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* View Modal */}
        {viewModal.open && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
            <div className="bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl shadow-2xl border border-white/10 p-8 max-w-lg w-full relative">
              <button className="absolute top-4 right-4 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={closeViewModal}>
                <span className="text-2xl">&times;</span>
              </button>
              {viewModal.loading ? (
                <div className="flex justify-center items-center h-40">
                  <CircularProgress size={40} thickness={5} style={{ color: '#a78bfa' }} />
                </div>
              ) : viewModal.error ? (
                <div className="text-center text-red-400 font-bold py-10 flex flex-col items-center gap-2">
                  <ErrorIcon className="text-4xl" />
                  {viewModal.error}
                </div>
              ) : viewModal.user ? (
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-white mb-2">User Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><span className="font-bold text-pink-300">Name:</span> <span className="text-white">{viewModal.user.name}</span></div>
                    <div><span className="font-bold text-pink-300">Email:</span> <span className="text-white break-all whitespace-pre-line" style={{ wordBreak: 'break-all', whiteSpace: 'pre-line' }}>{viewModal.user.email}</span></div>
                    <div><span className="font-bold text-pink-300">Phone:</span> <span className="text-white">{viewModal.user.phone}</span></div>
                    <div><span className="font-bold text-pink-300">College:</span> <span className="text-white">{viewModal.user.collegeName}</span></div>
                    <div><span className="font-bold text-pink-300">Department:</span> <span className="text-white">{viewModal.user.department}</span></div>
                    <div><span className="font-bold text-pink-300">University:</span> <span className="text-white">{viewModal.user.university}</span></div>
                    <div><span className="font-bold text-pink-300">Degree:</span> <span className="text-white">{viewModal.user.degree}</span></div>
                    <div><span className="font-bold text-pink-300">Specialization:</span> <span className="text-white">{viewModal.user.specialization}</span></div>
                    <div><span className="font-bold text-pink-300">CGPA:</span> <span className="text-white">{viewModal.user.cgpa}</span></div>
                    <div><span className="font-bold text-pink-300">Current Year:</span> <span className="text-white">{viewModal.user.currentYear}</span></div>
                    <div><span className="font-bold text-pink-300">Graduated:</span> <span className="text-white">{viewModal.user.isGraduated ? 'Yes' : 'No'}</span></div>
                    <div><span className="font-bold text-pink-300">Year of Passing:</span> <span className="text-white">{viewModal.user.yearOfPassing}</span></div>
                    <div><span className="font-bold text-pink-300">Experience:</span> <span className="text-white">{viewModal.user.hasExperience ? 'Yes' : 'No'}</span></div>
                    <div><span className="font-bold text-pink-300">Previous Company:</span> <span className="text-white">{viewModal.user.previousCompany}</span></div>
                    <div><span className="font-bold text-pink-300">Position:</span> <span className="text-white">{viewModal.user.position}</span></div>
                    <div><span className="font-bold text-pink-300">Years of Experience:</span> <span className="text-white">{viewModal.user.yearsOfExperience}</span></div>
                    <div><span className="font-bold text-pink-300">Status:</span> <span className="text-white">{viewModal.user.isApproved ? 'Approved' : 'Not Approved'}</span></div>
                    <div><span className="font-bold text-pink-300">Registered At:</span> <span className="text-white">{new Date(viewModal.user.registeredAt).toLocaleString()}</span></div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {deleteConfirm.open && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
            <div className="bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl shadow-2xl border border-white/10 p-8 max-w-sm w-full">
              <h2 className="text-xl font-bold text-white mb-4">Confirm Delete</h2>
              <p className="text-purple-200 mb-6">Are you sure you want to delete the user <span className="font-bold text-pink-300">{deleteConfirm.user?.name || deleteConfirm.user?.email}</span>?</p>
              <div className="flex justify-end gap-3">
                <button className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300" onClick={() => setDeleteConfirm({ open: false, user: null })}>Cancel</button>
                <button className="px-7 py-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed" onClick={async () => { await handleDeleteUser(deleteConfirm.user._id); setDeleteConfirm({ open: false, user: null }); }} disabled={deleting[deleteConfirm.user?._id]}>{deleting[deleteConfirm.user?._id] ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-fadeIn {
                animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1);
              }
            `}</style>
          </div>
        )}
        {/* Status Confirmation Modal */}
        {statusConfirm.open && (
          <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
            <div className="bg-gradient-to-br from-green-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl shadow-2xl border border-white/10 p-8 max-w-sm w-full">
              <h2 className="text-xl font-bold text-white mb-4">{statusConfirm.action === 'accept' ? 'Approve User' : 'Reject User'}</h2>
              <p className="text-purple-200 mb-6">
                Are you sure you want to <span className="font-bold text-pink-300">{statusConfirm.action === 'accept' ? 'approve' : 'reject'}</span> the user <span className="font-bold text-pink-300">{statusConfirm.user?.name || statusConfirm.user?.email}</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300" onClick={() => setStatusConfirm({ open: false, user: null, action: null })}>Cancel</button>
                <button className="px-7 py-2 rounded-lg bg-gradient-to-br from-green-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed" onClick={async () => { await handleStatusChange(statusConfirm.user._id, statusConfirm.action === 'accept'); setStatusConfirm({ open: false, user: null, action: null }); }} disabled={actionLoading[statusConfirm.user?._id]}>{actionLoading[statusConfirm.user?._id] ? (statusConfirm.action === 'accept' ? 'Approving...' : 'Rejecting...') : (statusConfirm.action === 'accept' ? 'Approve' : 'Reject')}</button>
              </div>
            </div>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-fadeIn {
                animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1);
              }
            `}</style>
          </div>
        )}
      </div>
    </>
  );
};

export default Users; 