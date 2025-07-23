import React, { useEffect, useState } from 'react';
import BaseUrl from '../Api';
import axios from 'axios';
import {
  AssignmentTurnedIn,
  TrendingUp,
  Payment,
  Receipt,
  CalendarToday,
  Person,
  School,
  CheckCircle,
  Close as CloseIcon,
  Visibility,
  Download,
  CurrencyRupee
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts';
import ReactDOM from 'react-dom';

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({ totalEnrollments: 0, totalRevenue: 0, byMethod: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchEnrollmentsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        let enrollmentsRes;
        let statsData = { totalEnrollments: 0, totalRevenue: 0, byMethod: [] };
        const headers = { Authorization: `Bearer ${token}` };
        if (userId) {
          enrollmentsRes = await axios.get(`${BaseUrl}/enrollments/user/${userId}`, { headers });
        } else {
          enrollmentsRes = await axios.get(`${BaseUrl}/enrollments`, { headers });
        }
        const enrollmentsData = enrollmentsRes.data;
        setEnrollments(enrollmentsData || []);
        // For both user and admin, calculate stats from enrollmentsData
        statsData.totalEnrollments = enrollmentsData.length;
        statsData.totalRevenue = enrollmentsData.reduce((sum, e) => sum + (e.amountPaid || 0), 0);
        // Calculate byMethod
        const byMethodMap = {};
        enrollmentsData.forEach(e => {
          if (e.paymentMethod) {
            byMethodMap[e.paymentMethod] = (byMethodMap[e.paymentMethod] || 0) + 1;
          }
        });
        statsData.byMethod = Object.entries(byMethodMap).map(([method, count]) => ({ _id: method, count }));
        setStats(statsData);
      } catch (err) {
        setError(err.message || (err.response && err.response.data && err.response.data.message) || 'Failed to fetch enrollments data');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollmentsData();
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  // Modal open handler
  const handleOpenModal = async (enrollment) => {
    setSelectedEnrollment(enrollment);
    setModalOpen(true);
    setModalLoading(true);
    try {
      // Simulate loading for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      setModalLoading(false);
    } catch (err) {
      setSelectedEnrollment(null);
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEnrollment(null);
  };

  // Calculate additional statistics
  const successfulPayments = enrollments.filter(e => e.paymentStatus === 'Success').length;
  const totalAmount = enrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0);
  const averageAmount = enrollments.length > 0 ? Math.round(totalAmount / enrollments.length) : 0;

  // Chart data for payment methods
  const paymentMethodData = stats.byMethod.map(method => ({
    name: method._id,
    value: method.count,
    color: method._id === 'Razorpay' ? '#10b981' : '#f59e0b'
  }));

  // Monthly enrollment data
  const monthlyEnrollmentData = enrollments
    .reduce((acc, enrollment) => {
      const month = new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

  const monthlyData = Object.entries(monthlyEnrollmentData).map(([month, count]) => ({
    month,
    enrollments: count
  }));

  // Revenue trend data
  const revenueData = enrollments
    .reduce((acc, enrollment) => {
      const month = new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { month: 'short' });
      acc[month] = (acc[month] || 0) + (enrollment.amountPaid || 0);
      return acc;
    }, {});

  const revenueChartData = Object.entries(revenueData).map(([month, revenue]) => ({
    month,
    revenue: revenue / 1000 // Convert to thousands for better display
  }));

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  // Error state (only for real errors)
  if (error) {
    return (
      <div className="text-center text-red-400 font-bold py-10">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-[78vw] w-full space-y-10 overflow-x-hidden">
    {/* <div className="space-y-10 pb-10"> */}
      {/* Header Section */}
      <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-white/10">
        <div className="flex items-center gap-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg">
            <AssignmentTurnedIn className="text-white text-4xl drop-shadow-lg" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">
              Enrollment Management
            </h1>
            <p className="text-lg text-purple-100/80 mt-2">
              Track all course enrollments and payment transactions
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        <div className="relative flex flex-col items-center justify-center rounded-2xl p-4 shadow-2xl bg-gradient-to-br from-purple-400/30 to-purple-700/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden w-full">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-b-lg bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-2">
            <AssignmentTurnedIn className="text-xl text-purple-100 drop-shadow-lg" />
          </div>
          <div className="z-10 flex flex-col items-center mt-8">
            <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{stats.totalEnrollments}</div>
            <div className="text-sm font-medium mt-1 tracking-wide uppercase text-purple-100/90">Total Enrollments</div>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center rounded-2xl p-4 shadow-2xl bg-gradient-to-br from-green-400/30 to-green-600/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden w-full">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-b-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-2">
            <CurrencyRupee className="text-xl text-green-100 drop-shadow-lg" />
          </div>
          <div className="z-10 flex flex-col items-center mt-8">
            <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">₹{(stats.totalRevenue / 1000).toFixed(0)}K</div>
            <div className="text-sm font-medium mt-1 tracking-wide uppercase text-green-100/90">Total Revenue</div>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center rounded-2xl p-4 shadow-2xl bg-gradient-to-br from-blue-400/30 to-blue-600/30 backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden w-full">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-b-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-2">
            <CheckCircle className="text-xl text-blue-100 drop-shadow-lg" />
          </div>
          <div className="z-10 flex flex-col items-center mt-8">
            <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{successfulPayments}</div>
            <div className="text-sm font-medium mt-1 tracking-wide uppercase text-blue-100/90">Successful Payments</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Methods Pie Chart */}
        <div className="bg-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl border border-white/10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-400 via-pink-400 to-purple-400 shadow-lg">
              <Payment className="text-white text-2xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white tracking-wide drop-shadow-lg">Payment Methods</div>
              <div className="text-sm text-green-100/80 mt-1">Distribution by payment gateway</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { name, value } = payload[0].payload;
                    return (
                      <div className="bg-black/60 text-gray-200 text-sm rounded-lg shadow-lg px-3 py-2 border border-gray-200">
                        <div className="text-sm font-semibold mb-1/2 tracking-wide">{name}</div>
                        <div className="text-base font-bold text-gray-200">{value} payments</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend Area Chart */}
        <div className="col-span-2 bg-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl border border-white/10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 shadow-lg">
              <TrendingUp className="text-white text-2xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white tracking-wide drop-shadow-lg">Revenue Trend</div>
              <div className="text-sm text-blue-100/80 mt-1">Monthly revenue in thousands (₹)</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#c4b5fd" />
              <YAxis stroke="#c4b5fd" />
              <Tooltip contentStyle={{ background: '#312e81', border: 'none', color: '#fff' }} />
              <Area type="monotone" dataKey="revenue" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl border border-white/10 w-full">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 shadow-lg">
            <Receipt className="text-white text-3xl drop-shadow-lg" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-wide drop-shadow-lg">Enrollment Records</div>
            <div className="text-sm text-purple-100/80 mt-1">Complete list of all course enrollments</div>
          </div>
        </div>

        {enrollments.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gradient-to-r from-purple-900 to-pink-900 backdrop-blur-xl border-b border-white/20">
                  <tr>
                    <th className="px-2 py-2 text-purple-200 font-bold text-sm uppercase tracking-wider">Course</th>
                    <th className="px-2 py-2 text-purple-200 font-bold text-sm uppercase tracking-wider">Student</th>
                    <th className="px-2 py-2 text-purple-200 font-bold text-sm uppercase tracking-wider">Enrolled Date</th>
                    <th className="px-2 py-2 text-purple-200 font-bold text-sm uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {enrollments.map((enrollment, idx) => (
                    <tr key={enrollment._id} className="hover:bg-white/5 transition-colors duration-200 group">
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <School className="text-white text-xs" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white font-semibold text-sm truncate">
                              {enrollment.course?.title || 'Course Not Available'}
                            </div>
                            <div className="text-purple-300 text-xs truncate">
                              ID: {enrollment.course?._id || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <Person className="text-white text-xs" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white font-semibold text-sm truncate">
                              {enrollment.user?.name || 'User Not Available'}
                            </div>
                            <div className="text-purple-300 text-xs truncate">
                              {enrollment.user?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1">
                          <CalendarToday className="text-purple-300 text-xs" />
                          <span className="text-white text-xs">
                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-purple-300 text-xs">
                          {new Date(enrollment.enrolledAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1.5 bg-white/10 hover:bg-purple-500/80 text-purple-200 hover:text-white rounded-lg transition-all duration-200"
                            onClick={() => handleOpenModal(enrollment)}
                            title="View Details"
                          >
                            <Visibility className="text-xs" />
                          </button>
                          {enrollment.receiptUrl && (
                            <a
                              href={enrollment.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-white/10 hover:bg-green-500/80 text-green-200 hover:text-white rounded-lg transition-all duration-200"
                              title="Download Receipt"
                            >
                              <Download className="text-xs" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <AssignmentTurnedIn className="text-4xl text-purple-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Enrollments Found</h3>
            <p className="text-purple-200/80">No enrollment records available at the moment.</p>
          </div>
        )}
      </div>

      {/* Modal for enrollment details */}
      {modalOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
          <div className="relative w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-purple-400/30 flex flex-col max-h-[85vh] overflow-hidden ring-2 ring-pink-400/10 animate-modalPop">
            {/* Accent Header Bar */}
            <div className="h-3 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
            {/* Close Button */}
            <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={handleCloseModal}>
              <CloseIcon fontSize="large" />
            </button>
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar">
              {modalLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
                </div>
              ) : selectedEnrollment ? (
                <div className="space-y-6">
                  {/* Enrollment Header */}
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white/20 shadow-lg">
                      <AssignmentTurnedIn className="text-white text-3xl" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-glow">Enrollment Details</h2>
                      <div className="text-purple-200 mb-1">Enrollment ID: {selectedEnrollment._id}</div>
                    </div>
                  </div>

                  {/* Course Information */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="font-bold text-lg text-purple-100 mb-3 flex items-center gap-2">
                      <School className="text-purple-300" />
                      Course Information
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-purple-200 text-sm mb-1">Course Title</div>
                        <div className="text-white font-semibold">
                          {selectedEnrollment.course?.title || 'Course Not Available'}
                        </div>
                      </div>
                      <div>
                        <div className="text-purple-200 text-sm mb-1">Course ID</div>
                        <div className="text-white font-semibold">
                          {selectedEnrollment.course?._id || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Student Information */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="font-bold text-lg text-purple-100 mb-3 flex items-center gap-2">
                      <Person className="text-purple-300" />
                      Student Information
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-purple-200 text-sm mb-1">Student Name</div>
                        <div className="text-white font-semibold">
                          {selectedEnrollment.user?.name || 'User Not Available'}
                        </div>
                      </div>
                      <div>
                        <div className="text-purple-200 text-sm mb-1">Email</div>
                        <div className="text-white font-semibold">
                          {selectedEnrollment.user?.email || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-purple-200 text-sm mb-1">User ID</div>
                        <div className="text-white font-semibold">
                          {selectedEnrollment.user?._id || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enrollment Date */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="font-bold text-lg text-purple-100 mb-3 flex items-center gap-2">
                      <CalendarToday className="text-purple-300" />
                      Enrollment Date
                    </div>
                    <div className="text-white font-semibold">
                      {new Date(selectedEnrollment.enrolledAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-purple-200 text-sm mt-1">
                      {new Date(selectedEnrollment.enrolledAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-400 font-bold py-10">Failed to load enrollment details.</div>
              )}
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
    </div>
    // </div>
  );
};

export default Enrollments; 