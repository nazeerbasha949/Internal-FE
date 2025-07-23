import React, { useEffect, useState } from 'react';
import BaseUrl from '../Api';
import axios from 'axios';
import {
  School,
  CheckCircle,
  Event as EventIcon,
  EmojiEvents,
  TrendingUp,
  LocalLibrary,
  AssignmentTurnedIn,
  Edit as EditIcon,
  Group,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const cardGradients = [
  'from-purple-400/30 to-purple-700/30', // Courses
  'from-blue-400/30 to-blue-700/30',    // Events
  'from-green-400/30 to-green-600/30',  // Enrollments
  'from-yellow-400/30 to-orange-400/30',// Interns
];

const iconBgGradients = [
  'from-purple-400 to-purple-700', // Courses
  'from-blue-400 to-blue-700',     // Events
  'from-green-400 to-green-600',   // Enrollments
  'from-yellow-400 to-orange-400', // Interns
];

const userPieColors = ['#a78bfa', '#f472b6', '#818cf8'];
const eventBarColors = ['#a78bfa', '#f472b6', '#818cf8'];
const enrollBarColors = ['#34d399', '#fbbf24'];
// Update enrollPieColors to match eventBarColors
const enrollPieColors = ['#a78bfa', '#f472b6', '#818cf8'];

const DashboardPage = () => {
  const [userStats, setUserStats] = useState(null);
  const [courseStats, setCourseStats] = useState(null);
  const [enrollStats, setEnrollStats] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchData, setBatchData] = useState([]);
  const [batchLoading, setBatchLoading] = useState(true);
  const [batchError, setBatchError] = useState(null);

  useEffect(() => {
    const fetchAllStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const [userRes, courseRes, enrollRes, eventRes] = await Promise.all([
          axios.get(`${BaseUrl}/users/stats/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BaseUrl}/courses/stats/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BaseUrl}/enrollments/stats/metrics`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BaseUrl}/events/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUserStats(userRes.data);
        setCourseStats(courseRes.data);
        setEnrollStats(enrollRes.data);
        setEventStats(eventRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllStats();
  }, []);

  useEffect(() => {
    const fetchBatchData = async () => {
      setBatchLoading(true);
      setBatchError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BaseUrl}/batches/`, { headers: { Authorization: `Bearer ${token}` } });
        setBatchData(res.data);
      } catch (err) {
        setBatchError(err.message);
      } finally {
        setBatchLoading(false);
      }
    };
    fetchBatchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-96"><CircularProgress size={60} style={{ color: '#a78bfa' }} /></div>;
  if (error) return <div className="text-center text-red-400 font-bold py-10">{error}</div>;
  if (!userStats || !courseStats || !enrollStats || !eventStats) return null;

  // Metric cards: Courses, Events, Enrollments, Interns
  const metricCards = [
    {
      label: 'Total Interns',
      value: userStats.counts.interns,
      icon: EmojiEvents,
      iconBg: 'from-yellow-400 to-orange-400',
      iconColor: 'text-yellow-100',
      card: 'from-yellow-400/30 to-orange-400/30',
    },
    {
      label: 'Total Courses',
      value: courseStats.totalCourses,
      icon: School,
      iconBg: 'from-purple-400 to-purple-700',
      iconColor: 'text-purple-100',
      card: 'from-purple-400/30 to-purple-700/30',
    },
    {
      label: 'Total Events',
      value: eventStats.total,
      icon: EventIcon,
      iconBg: 'from-blue-400 to-blue-700',
      iconColor: 'text-blue-100',
      card: 'from-blue-400/30 to-blue-700/30',
    },
    {
      label: 'Total Enrollments',
      value: enrollStats.totalEnrollments,
      icon: CheckCircle,
      iconBg: 'from-green-400 to-green-600',
      iconColor: 'text-green-100',
      card: 'from-green-400/30 to-green-600/30',
    },
  ];

  // Users Pie Chart data
  const userPieData = [
    { name: 'Interns', value: userStats.counts.interns },
    { name: 'Professors', value: userStats.counts.professors },
    { name: 'Admins', value: userStats.counts.admins },
  ];

  // Events Bar Chart data
  const eventBarData = [
    { name: 'Total', value: eventStats.total },
    { name: 'Upcoming', value: eventStats.upcoming },
    { name: 'Completed', value: eventStats.completed },
  ];

  // Enrollments Pie Chart data
  const enrollPieData = [
    { name: 'Enrollments', value: enrollStats.totalEnrollments },
    { name: 'Revenue', value: enrollStats.totalRevenue },
  ];

  return (
    <div className="space-y-10 pb-10 mt-5 py-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-white/10 flex items-center gap-6 -mt-8">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg">
          <DashboardIcon className="text-white text-4xl drop-shadow-lg" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">Dashboard Overview</h1>
          <p className="text-lg text-purple-100/80 mt-2">All your platform stats at a glance!</p>
        </div>
      </div>

      {/* Metric Cards Row (no scroll, no overflow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className={`relative flex flex-col items-center justify-center rounded-2xl p-6 shadow-2xl bg-gradient-to-br ${m.card} backdrop-blur-xl border border-white/10 group hover:scale-105 hover:shadow-2xl transition-transform duration-300 overflow-hidden`}
            >
              <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-b-lg bg-gradient-to-br ${m.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mt-3`}>
                <Icon className={`${m.iconColor} text-2xl drop-shadow-lg`} />
              </div>
              <div className="z-10 flex flex-col items-center mt-10">
                <div className="text-3xl font-extrabold drop-shadow-lg text-white tracking-wider">{m.value}</div>
                <div className="text-sm font-medium mt-1 tracking-wide uppercase text-purple-100/90">{m.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Users Pie Chart */}
        <div className="bg-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center backdrop-blur-xl border border-white/10 min-w-[340px]">
          <div className="flex items-center gap-4 w-full mb-6 mt-0 pt-0">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 shadow-lg">
              <LocalLibrary className="text-white text-3xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg mb-2">User Roles Distribution</div>
              <div className="text-sm text-purple-100/80 mt-1">Breakdown of user roles</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={userPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={userPieColors[index % userPieColors.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { name, value } = payload[0].payload;
                    return (
                      <div className="bg-black/60 text-gray-200 text-base rounded-lg shadow-lg px-3 py-2 border border-gray-200">
                        <div className="text-base font-semibold mb-1/2 tracking-wide">{name}</div>
                        <div className="text-lg font-bold text-gray-200">{value} users</div>
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
        {/* Events Bar Chart */}
        <div className="bg-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center backdrop-blur-xl border border-white/10 min-w-[340px]">
          <div className="mb-6 flex items-center gap-4 w-full">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 via-pink-400 to-purple-400 shadow-lg">
              <EventIcon className="text-white text-3xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg mb-2">Event Stats</div>
              <div className="text-sm text-blue-100/80 mt-1">Total, Upcoming, Completed</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={eventBarData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa33" />
              <XAxis dataKey="name" stroke="#c4b5fd" />
              <YAxis stroke="#c4b5fd" allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#312e81', border: 'none', color: '#fff' }} />
              <Bar dataKey="value" label={{ position: 'top', fill: '#fff', fontWeight: 700 }}>
                {eventBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={eventBarColors[index % eventBarColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-between w-full mt-4 px-2">
            <span className="text-xs font-bold text-purple-200">Total</span>
            <span className="text-xs font-bold text-blue-300">Upcoming</span>
            <span className="text-xs font-bold text-green-300">Completed</span>
          </div>
        </div>
        {/* Enrollments Doughnut Chart */}
        <div className="bg-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center backdrop-blur-xl border border-white/10 min-w-[340px]">
          <div className="mb-6 flex items-center gap-4 w-full">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 via-pink-400 to-purple-400 shadow-lg">
              <AssignmentTurnedIn className="text-white text-3xl drop-shadow-lg" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg mb-2">Enrollment Stats</div>
              <div className="text-sm text-green-100/80 mt-1">Enrollments & Revenue</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={enrollPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={4}
              >
                {enrollPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={enrollPieColors[index % enrollPieColors.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { name, value } = payload[0].payload;
                    return (
                      <div className="bg-black/60 text-gray-200 text-base rounded-lg shadow-lg px-3 py-2 border border-gray-200">
                        <div className="text-base font-semibold mb-1/2 tracking-wide">{name}</div>
                        <div className="text-lg font-bold text-gray-200">{name === 'Revenue' ? `₹${value}` : value}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-between w-full mt-4 px-2">
            <span className="text-xs font-bold text-blue-300">Enrollments</span>
            <span className="text-xs font-bold text-pink-300">Revenue</span>
          </div>
        </div>
      </div>
      {/* Batch Table Section */}
      <div className="mt-10">
        <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur-xl border border-white/10">
          <h2 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-lg mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 via-pink-400 to-purple-400 shadow-lg">
              <Group className="text-white text-3xl drop-shadow-lg" />
            </span>
            Batch Overview
          </h2>
          {batchLoading ? (
            <div className="flex justify-center items-center h-32"><CircularProgress size={40} style={{ color: '#a78bfa' }} /></div>
          ) : batchError ? (
            <div className="text-center text-red-400 font-bold py-6">{batchError}</div>
          ) : batchData.length === 0 ? (
            <div className="text-center text-purple-200/80 py-10">No batch data available.</div>
          ) : (
            <div className="rounded-2xl shadow-xl border border-white/10 bg-gradient-to-br from-[#312e81]/80 to-[#0a081e]/80 w-full">
              <table className="w-full table-fixed divide-y divide-purple-400/20">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-700/60 via-pink-700/60 to-blue-700/60">
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Batch Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Course Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Users</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Professor</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">End Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-400/10">
                  {batchData.map((batch) => (
                    <tr key={batch._id} className="hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 transition-colors duration-200 group">
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-semibold text-purple-100 group-hover:text-white">{batch.batchName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-blue-200 group-hover:text-white">
                        <span className="font-bold text-lg text-blue-100">{batch.course?.title || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base group-hover:text-white">
                        <span className="inline-flex items-center gap-2 font-extrabold text-lg text-blue-400">
                          {batch.users?.length ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-yellow-200 group-hover:text-white">
                        {batch.professor ? (
                          <div className="flex flex-col gap-1">
                            <span className="font-extrabold text-lg text-yellow-100">{batch.professor.name}</span>
                            {batch.professor.email && (
                              <span className="text-base text-yellow-200 mt-0.5">{batch.professor.email}</span>
                            )}
                            {batch.professor.expertise && batch.professor.expertise.length > 0 && (
                              <span className="mt-2 flex flex-wrap gap-2">
                                {batch.professor.expertise.map((tech, idx) => (
                                  <span key={idx} className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md animate-gradient-x">
                                    {tech}
                                  </span>
                                ))}
                              </span>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-pink-200 group-hover:text-white">
                        {batch.startDate ? new Date(batch.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-pink-200 group-hover:text-white">
                        {batch.endDate ? new Date(batch.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;